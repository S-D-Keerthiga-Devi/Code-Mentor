import { executeCodeTool } from "../utils/executeCodeTool.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// Reusing the robust fallback mechanism from agenticAnalysisController
// We define a specialized executeSubAgent for the Graph Compiler

const runGeminiAnalysis = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro-latest"];

    let responseText = "";
    let success = false;
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 Starting Graph Compiler with model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
            });
            const chat = model.startChat();
            const response = await chat.sendMessage(prompt);
            responseText = response.response.text().trim();
            success = true;
            break;
        } catch (error) {
            lastError = error;
            console.error(`❌ Graph Compiler Error with ${modelName}:`, error.message || error);
            if (error.status === 429 || error.message?.includes("429") || error.message?.includes("500") || error.status === 500) {
                throw error; // Bubble up to controller for fallback
            }
        }
    }

    if (!success) {
        throw lastError || new Error("All Gemini models failed graph compiler.");
    }

    return responseText;
};

const runGroqAnalysis = async (prompt) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is missing");

    const groq = new Groq({ apiKey });
    const modelName = "llama-3.3-70b-versatile";

    try {
        console.log(`🧠 Starting Groq Graph Compiler with model: ${modelName}`);
        const response = await groq.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt }]
        });

        const responseText = response.choices[0].message.content?.trim() || "";
        if (!responseText) {
            throw new Error("Groq failed to generate visual flow.");
        }
        return responseText;
    } catch (error) {
        console.error(`❌ Graph Compiler Error with Groq:`, error.message || error);
        throw error;
    }
};

async function executeGraphCompilerAgent(code, language) {
    const prompt = `You are a Graph Compiler. Analyze the provided code and generate a React Flow architecture map. Output ONLY valid JSON containing 'nodes' and 'edges'. Every node MUST have: { id, data: { label, type, complexityScore, lineNumber, mockMemoryState, shape }, position: {x, y} }. 
- 'complexityScore' is 1-10 (O(1) = 1, O(N) = 5, O(N^2) = 10, etc).
- 'mockMemoryState' is an object simulating what local variables would look like at this step (e.g., { "i": 0, "users": "[1, 2]" }). Keep values very short. If none, return {}.
- 'shape' MUST be determined based on traditional flowcharts: use 'pill' for Start/Return/End nodes, 'diamond' for conditional statements (if, switch) and loops (for, while), and 'rectangle' for standard processes, variable declarations, and database queries.
Edges must connect the logical flow. Do NOT wrap in markdown.

Analyze this ${language || "code"}:
\`\`\`${language || ""}
${code}
\`\`\`
`;

    let responseText = "";

    try {
        console.log(`🤖 [GraphCompiler] Attempting analysis with Gemini...`);
        responseText = await runGeminiAnalysis(prompt);
    } catch (geminiError) {
        console.warn(`⚠️ [GraphCompiler] Gemini Failed (${geminiError.message}). Falling back to Groq...`);
        try {
            console.log(`🧠 [GraphCompiler] Attempting analysis with Groq (Llama-3)...`);
            responseText = await runGroqAnalysis(prompt);
        } catch (groqError) {
            console.error(`❌ [GraphCompiler] Both Gemini and Groq failed.`);
            return null;
        }
    }

    let rawText = responseText.trim();
    if (rawText.startsWith("```")) {
        const lines = rawText.split('\\n');
        if (lines.length > 2) {
            rawText = lines.slice(1, -1).join('\\n').trim();
        } else {
            rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        }
    }

    return rawText;
}

export const generateVisualFlow = async (req, res) => {
    const { code, language } = req.body;

    try {
        if (!code || !code.trim()) {
            return res.status(400).json({ error: "No code provided for visualizer." });
        }

        const rawJsonText = await executeGraphCompilerAgent(code, language);

        if (!rawJsonText) {
            return res.status(500).json({ error: "Failed to generate visual flow." });
        }

        try {
            const parsedData = JSON.parse(rawJsonText);
            return res.status(200).json(parsedData);
        } catch (parseError) {
            console.error("❌ Failed to parse Graph Compiler response as JSON:", rawJsonText);
            return res.status(500).json({ error: "AI returned invalid JSON." });
        }

    } catch (error) {
        console.error("❌ Visual Debugger Error:", error);
        return res.status(500).json({
            error: "Failed to generate visual flow",
            details: error.message
        });
    }
};

export const optimizeNodeCode = async (req, res) => {
    const { fullCode, lineNumber, language } = req.body;

    try {
        if (!fullCode || !lineNumber) {
            return res.status(400).json({ error: "Missing required fields for optimization." });
        }

        const prompt = `You are an Expert Software Architect. The user wants to optimize a specific inefficient node in their code.
Code context (${language || 'javascript'}):
\`\`\`
${fullCode}
\`\`\`

Focus strictly on the logic around line number ${lineNumber}.
Your job is to rewrite the inefficient block starting at that line to an O(1) or O(log N) or O(N) optimized version. 
Output ONLY valid JSON in this exact format, with no markdown wrappers:
{
  "optimizedCode": "// the completely rewritten full block of code as a string (use \\n for newlines)",
  "targetLineStart": (integer, the first line number you are replacing),
  "targetLineEnd": (integer, the last line number you are replacing)
}
Keep the optimization focused only on resolving the complexity spike at that node.`;

        let rawJsonText = "";

        try {
            console.log(`🤖 [Optimizer] Attempting with Gemini...`);
            rawJsonText = await runGeminiAnalysis(prompt);
        } catch (geminiError) {
            console.warn(`⚠️ [Optimizer] Gemini Failed. Falling back to Groq...`);
            try {
                rawJsonText = await runGroqAnalysis(prompt);
            } catch (groqError) {
                console.error(`❌ [Optimizer] Both Gemini and Groq failed.`);
                return res.status(500).json({ error: "AI failed to optimize code." });
            }
        }

        let cleanText = rawJsonText.trim();
        if (cleanText.startsWith("\`\`\`")) {
            const lines = cleanText.split('\\n');
            if (lines.length > 2) {
                cleanText = lines.slice(1, -1).join('\\n').trim();
            } else {
                cleanText = cleanText.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
            }
        }

        try {
            const parsedData = JSON.parse(cleanText);
            return res.status(200).json(parsedData);
        } catch (parseError) {
            console.error("❌ Failed to parse Optimizer response:", cleanText);
            return res.status(500).json({ error: "AI returned invalid JSON." });
        }

    } catch (error) {
        console.error("❌ Node Optimizer Error:", error);
        return res.status(500).json({
            error: "Failed to optimize node",
            details: error.message
        });
    }
};
