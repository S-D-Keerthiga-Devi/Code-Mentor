import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Utility: extract the first valid JSON object from any AI response string.
// Handles: raw JSON, ```json ... ```, ``` ... ```, or JSON embedded in text.
// ─────────────────────────────────────────────────────────────────────────────
function extractJSON(text) {
    if (!text) return null;

    // 1. Strip any markdown fences (```json ... ``` or ``` ... ```)
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
        text = fenceMatch[1].trim();
    }

    // 2. Try parsing the whole thing first
    try {
        return JSON.parse(text);
    } catch (_) {
        // not clean JSON, continue
    }

    // 3. Find the first { and last } and try to parse that slice
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const slice = text.slice(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(slice);
        } catch (_) {
            // still not valid
        }
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini runner — tries each model, falls back gracefully
// ─────────────────────────────────────────────────────────────────────────────
const runGeminiAnalysis = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 [Gemini] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat();
            const response = await chat.sendMessage(prompt);
            const text = response.response.text().trim();
            console.log(`✅ [Gemini] Got response from ${modelName} (${text.length} chars)`);
            return text;
        } catch (error) {
            lastError = error;
            console.error(`❌ [Gemini] ${modelName} failed: ${error.message}`);
            // Continue to next model regardless of error type
        }
    }

    throw lastError || new Error("All Gemini models failed.");
};

// ─────────────────────────────────────────────────────────────────────────────
// Groq runner — fallback provider
// ─────────────────────────────────────────────────────────────────────────────
const runGroqAnalysis = async (prompt) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const modelName = "llama-3.3-70b-versatile";

    console.log(`🧠 [Groq] Trying model: ${modelName}`);
    const response = await groq.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }]
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (!text) throw new Error("Groq returned empty response.");

    console.log(`✅ [Groq] Got response (${text.length} chars)`);
    return text;
};

// ─────────────────────────────────────────────────────────────────────────────
// Core agent: run Gemini → Groq → return raw text
// ─────────────────────────────────────────────────────────────────────────────
async function executeGraphCompilerAgent(code, language) {
    const prompt = `You are a Graph Compiler. Analyze the provided code and generate a React Flow architecture map.
Output ONLY a raw JSON object (no markdown, no explanation) containing 'nodes' and 'edges'.

Every node MUST have exactly this shape:
{
  "id": "string",
  "data": {
    "label": "string",
    "type": "string",
    "complexityScore": number (1-10),
    "lineNumber": number,
    "mockMemoryState": { /* key-value pairs, keep short */ },
    "shape": "pill" | "diamond" | "rectangle"
  },
  "position": { "x": number, "y": number }
}

Shape rules:
- "pill" → Start / Return / End nodes
- "diamond" → if, switch, for, while (conditions/loops)
- "rectangle" → variable declarations, function calls, processes

complexityScore: O(1)=1, O(logN)=3, O(N)=5, O(N^2)=10

Edges must connect the logical flow. Output ONLY the raw JSON object.

Analyze this ${language || "code"}:
\`\`\`${language || ""}
${code}
\`\`\``;

    let responseText = "";

    // Try Gemini first
    try {
        responseText = await runGeminiAnalysis(prompt);
    } catch (geminiError) {
        console.warn(`⚠️ [GraphCompiler] Gemini failed: ${geminiError.message}. Trying Groq...`);
        try {
            responseText = await runGroqAnalysis(prompt);
        } catch (groqError) {
            console.error(`❌ [GraphCompiler] Both providers failed. Gemini: ${geminiError.message} | Groq: ${groqError.message}`);
            throw new Error(`AI providers unavailable. Gemini: ${geminiError.message} | Groq: ${groqError.message}`);
        }
    }

    return responseText;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler: POST /api/ai/visualize-flow
// ─────────────────────────────────────────────────────────────────────────────
export const generateVisualFlow = async (req, res) => {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({ error: "No code provided for visualizer." });
    }

    try {
        const rawText = await executeGraphCompilerAgent(code, language);

        // Bulletproof JSON extraction
        const parsedData = extractJSON(rawText);

        if (!parsedData || !parsedData.nodes || !parsedData.edges) {
            console.error("❌ [VisualFlow] Could not extract valid nodes/edges from response:");
            console.error("Raw response snippet:", rawText.slice(0, 500));
            return res.status(500).json({
                error: "AI returned an invalid graph structure.",
                hint: "The AI response could not be parsed into nodes and edges."
            });
        }

        console.log(`✅ [VisualFlow] Generated graph: ${parsedData.nodes.length} nodes, ${parsedData.edges.length} edges`);
        return res.status(200).json(parsedData);

    } catch (error) {
        console.error("❌ [VisualFlow] Controller error:", error.message);
        return res.status(500).json({
            error: "Failed to generate visual flow.",
            details: error.message
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Route handler: POST /api/ai/optimize-node
// ─────────────────────────────────────────────────────────────────────────────
export const optimizeNodeCode = async (req, res) => {
    const { fullCode, lineNumber, language } = req.body;

    if (!fullCode || !lineNumber) {
        return res.status(400).json({ error: "Missing required fields: fullCode and lineNumber." });
    }

    const prompt = `You are an Expert Software Architect. The user wants to optimize a specific inefficient node.

Code context (${language || "javascript"}):
\`\`\`
${fullCode}
\`\`\`

Focus on the logic around line ${lineNumber}. Rewrite that inefficient block to a better time complexity.
Output ONLY a raw JSON object (no markdown) in this exact format:
{
  "optimizedCode": "// rewritten code block as a string",
  "targetLineStart": <integer>,
  "targetLineEnd": <integer>
}`;

    let rawText = "";

    try {
        rawText = await runGeminiAnalysis(prompt);
    } catch (geminiError) {
        console.warn(`⚠️ [Optimizer] Gemini failed: ${geminiError.message}. Trying Groq...`);
        try {
            rawText = await runGroqAnalysis(prompt);
        } catch (groqError) {
            console.error(`❌ [Optimizer] Both providers failed.`);
            return res.status(500).json({ error: "AI providers unavailable for optimization." });
        }
    }

    const parsedData = extractJSON(rawText);

    if (!parsedData || !parsedData.optimizedCode) {
        console.error("❌ [Optimizer] Could not extract valid JSON:", rawText.slice(0, 300));
        return res.status(500).json({ error: "AI returned invalid optimization response." });
    }

    console.log(`✅ [Optimizer] Optimization complete for line ${lineNumber}`);
    return res.status(200).json(parsedData);
};
