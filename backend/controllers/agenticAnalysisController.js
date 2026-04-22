import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { executeCodeTool } from "../utils/executeCodeTool.js";
import dotenv from "dotenv";
dotenv.config();

const runGeminiAnalysis = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro-latest"];

    const agentTools = [{
        functionDeclarations: [{
            name: "test_code",
            description: "Executes the provided code snippet and returns the terminal output or errors. Use this to verify bugs or test fixes before analyzing the user's code.",
            parameters: {
                type: "OBJECT",
                properties: {
                    code: { type: "STRING", description: "The full code to execute." },
                    language: { type: "STRING", description: "The programming language (e.g., 'javascript', 'python')." }
                },
                required: ["code", "language"]
            }
        }]
    }];

    let responseText = "";
    let success = false;
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 Starting Analysis Agent Loop with model: \${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                tools: agentTools
            });
            const chat = model.startChat();
            let response = await chat.sendMessage(prompt);

            let iterationCount = 0;
            const MAX_ITERATIONS = 3;

            while (iterationCount < MAX_ITERATIONS) {
                const call = response.response.functionCalls()?.[0];

                if (call && call.name === "test_code") {
                    const args = call.args;
                    console.log(`🛠️ Analysis Agent called test_code tool | \${modelName}`);
                    const resultOutput = await executeCodeTool(args.code, args.language);

                    response = await chat.sendMessage([{
                        functionResponse: {
                            name: "test_code",
                            response: { output: resultOutput }
                        }
                    }]);
                    iterationCount++;
                } else {
                    // Final JSON Output
                    responseText = response.response.text().trim();
                    success = true;
                    console.log(`✅ Gemini Analysis Agent finished after \${iterationCount} tool uses.`);
                    break;
                }
            }

            if (iterationCount >= MAX_ITERATIONS && !success) {
                console.warn(`⚠️ Max Gemini agent iterations reached.`);
                const finalResponse = await chat.sendMessage("Max iterations reached. Provide the final JSON format without using tools.");
                responseText = finalResponse.response.text().trim();
                success = true;
            }

            if (success) break;

        } catch (error) {
            lastError = error;
            console.error(`❌ Agent Analysis Error with \${modelName}:`, error.message || error);
            if (error.status === 429 || error.message?.includes("429") || error.message?.includes("500") || error.status === 500) {
                throw error; // Bubble up to controller for fallback
            }
        }
    }

    if (!success) {
        throw lastError || new Error("All Gemini models failed agentic loop.");
    }

    return responseText;
};

const runGroqAnalysis = async (prompt) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is missing");

    const groq = new Groq({ apiKey });
    const modelName = "llama-3.3-70b-versatile";

    const agentTools = [{
        type: "function",
        function: {
            name: "test_code",
            description: "Executes the provided code snippet and returns the terminal output or errors. Use this to verify bugs or test fixes before analyzing the user's code.",
            parameters: {
                type: "object",
                properties: {
                    code: { type: "string", description: "The full code to execute." },
                    language: { type: "string", description: "The programming language (e.g., 'javascript', 'python')." }
                },
                required: ["code", "language"]
            }
        }
    }];

    let messages = [
        { role: "user", content: prompt }
    ];

    let responseText = "";
    let success = false;
    let iterationCount = 0;
    const MAX_ITERATIONS = 3;

    try {
        console.log(`🧠 Starting Groq Analysis Agent Loop with model: \${modelName}`);

        while (iterationCount < MAX_ITERATIONS) {
            const response = await groq.chat.completions.create({
                model: modelName,
                messages: messages,
                tools: agentTools,
                tool_choice: "auto"
            });

            const responseMessage = response.choices[0].message;
            messages.push(responseMessage);

            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                const toolCall = responseMessage.tool_calls[0];

                if (toolCall.function.name === "test_code") {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`🛠️ Groq Analysis Agent called test_code tool (Iteration \${iterationCount + 1})`);

                    const resultOutput = await executeCodeTool(args.code, args.language);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: resultOutput
                    });

                    iterationCount++;
                }
            } else {
                responseText = responseMessage.content?.trim() || "";
                if (responseText) {
                    success = true;
                    console.log(`✅ Groq Analysis Agent arrived at final answer.`);
                }
                break;
            }
        }

        if (iterationCount >= MAX_ITERATIONS && !success) {
            console.warn(`⚠️ Max Groq agent iterations reached.`);
            messages.push({
                role: "user",
                content: "Max iterations reached. Provide the final JSON format without using tools."
            });
            const finalResponse = await groq.chat.completions.create({
                model: modelName,
                messages: messages
            });
            responseText = finalResponse.choices[0].message.content?.trim() || "";
            success = true;
        }

    } catch (error) {
        console.error(`❌ Agent Analysis Error with Groq:`, error.message || error);
        throw error;
    }

    if (!success || !responseText) {
        throw new Error("Groq failed to generate analysis within the agent loop.");
    }

    return responseText;
};

async function executeSubAgent(code, systemPrompt, agentName) {
    let responseText = "";

    try {
        console.log(`🤖 [${agentName}] Attempting analysis with Gemini...`);
        responseText = await runGeminiAnalysis(systemPrompt);
    } catch (geminiError) {
        console.warn(`⚠️ [${agentName}] Gemini Failed (${geminiError.message}). Falling back to Groq...`);
        try {
            console.log(`🧠 [${agentName}] Attempting analysis with Groq (Llama-3)...`);
            responseText = await runGroqAnalysis(systemPrompt);
        } catch (groqError) {
            console.error(`❌ [${agentName}] Both Gemini and Groq failed.`);
            return []; // Fails entirely, return []
        }
    }

    let rawText = responseText.trim();
    // Strip markdown formatting if the LLM ignored instructions
    if (rawText.startsWith("```")) {
        const lines = rawText.split('\n');
        if (lines.length > 2) {
            rawText = lines.slice(1, -1).join('\n').trim();
        } else {
            rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        }
    }

    try {
        const parsedData = JSON.parse(rawText);
        // LLMs may return { smells: [...] } or just an array directly due to different interpretations
        if (parsedData.smells && Array.isArray(parsedData.smells)) {
            return parsedData.smells;
        } else if (Array.isArray(parsedData)) {
            return parsedData;
        }
        return [];
    } catch (parseError) {
        console.error(`❌ [${agentName}] Failed to parse response as JSON:`, responseText);
        return [];
    }
}

export const analyzeCodeForHeatmap = async (req, res) => {
    const { code, language, dependencyLevel } = req.body;

    try {
        if (!code || !code.trim()) {
            return res.status(400).json({ error: "No code provided for analysis." });
        }

        // Node 1 & 2: Analysis & Pedagogy Prompts combined for the Agent
        let pedagogyInstruction = "";
        if (dependencyLevel === "Green") {
            pedagogyInstruction = "Direct hints. Example: 'You are missing a let keyword on line 4.' or 'Use a Map instead of an Array for O(1) lookups on line 12.'";
        } else if (dependencyLevel === "Yellow") {
            pedagogyInstruction = "Conceptual hints. Example: 'What happens to this variable's scope?' or 'Is there a data structure that offers faster lookups than an array?'";
        } else if (dependencyLevel === "Red") {
            pedagogyInstruction = "Pure Socratic. Example: 'Analyze the time complexity of this nested loop on line 20. Is there an O(N) alternative?' or 'What are the security implications of directly concatenating user input into this SQL query?'";
        } else {
            pedagogyInstruction = "Direct hints. Example: 'You are missing a let keyword on line 4.'"; // Default
        }

        const basePrompt = `
You can optionally use the \`test_code\` tool to run the code and check for compiler bugs or runtime issues before issuing your smells.
The hint must follow this pedagogy instruction: ${pedagogyInstruction}

Analyze this ${language || "code"}:
\`\`\`${language || ""}
${code}
\`\`\`

CRITICAL: You must return ONLY valid, raw JSON. Do NOT wrap the output in markdown blocks like \`\`\`json. Do not include any conversational text. Just the JSON array.`;

        const APPSEC_PROMPT = `You are an elite Application Security Lead. Your ONLY job is to find critical security vulnerabilities (SQLi, XSS, exposed secrets). You must ignore style, formatting, and performance entirely. Output a JSON array of objects with { line, type, message, severity: 'red', hint }. If no security issues exist, return [].\n` + basePrompt;

        const PERFORMANCE_PROMPT = `You are a strict Systems Architect. Your ONLY job is to find performance bottlenecks, Big-O complexity issues, and memory leaks. Ignore security and style entirely. Output a JSON array of objects with { line, type, message, severity: 'yellow', hint }. If perfectly optimized, return [].\n` + basePrompt;

        const TECH_LEAD_PROMPT = `You are a Senior Tech Lead. Your ONLY job is to enforce clean code, DRY principles, and proper variable naming. Ignore security and performance entirely. Output a JSON array of objects with { line, type, message, severity: 'green', hint }. If the code is perfectly clean, return [].\n` + basePrompt;

        console.log(`🧠 AI Heatmap Analysis (Multi-Agent) | Mode: ${dependencyLevel}`);

        const [securitySmells, performanceSmells, styleSmells] = await Promise.all([
            executeSubAgent(code, APPSEC_PROMPT, "AppSec Lead"),
            executeSubAgent(code, PERFORMANCE_PROMPT, "Performance Architect"),
            executeSubAgent(code, TECH_LEAD_PROMPT, "Tech Lead")
        ]);

        const mapSmell = (smell) => {
            const actualHint = smell.hint || smell.message || smell.socraticHint || "Review this line for improvements.";
            return {
                line: smell.line,
                type: smell.type || "issue",
                severity: smell.severity || "info",
                message: actualHint, // Standardize to a single text field
                socraticHint: actualHint
            };
        };

        const combinedSmells = [
            ...securitySmells.map(mapSmell),
            ...performanceSmells.map(mapSmell),
            ...styleSmells.map(mapSmell)
        ];

        const uniqueSmells = combinedSmells.filter((smell, index, self) =>
            index === self.findIndex((t) => (
                t.line === smell.line && t.socraticHint === smell.socraticHint
            ))
        );

        return res.status(200).json({ smells: uniqueSmells });

    } catch (error) {
        console.error("❌ Agentic Analysis Outer Error:", error);

        // Return a mock response if we hit rate limits so the UI still works
        if (error.message?.includes("429") || error.status === 429 || error.message?.includes("exhausted")) {
            console.warn("⚠️ Quota exceeded for AI providers. Returning smart mock heatmap data.");

            const mockSmells = [];
            const lines = code.split('\\n');

            lines.forEach((lineText, index) => {
                const lineNum = index + 1;

                // 1. RED SMELL: Security
                if (lineText.includes("SELECT *") && lineText.includes("+")) {
                    mockSmells.push({
                        line: lineNum, type: "security", severity: "critical",
                        socraticHint: "[MOCK API LIMIT] What would happen to your database if a user entered ' OR '1'='1 as their username? How can you sanitize this input?"
                    });
                }
                // 2. YELLOW SMELL: Performance
                else if (lineText.includes("for") && (lineText.includes(".length") || lineText.includes("includes"))) {
                    mockSmells.push({
                        line: lineNum, type: "performance", severity: "warning",
                        socraticHint: "[MOCK API LIMIT] You are nesting an O(N) operation inside a loop. What data structure gives O(1) lookups?"
                    });
                }
                // 3. GREEN SMELL: Style
                else if ((lineText.includes("var ") || lineText.includes("let ")) && !lineText.includes("for")) {
                    mockSmells.push({
                        line: lineNum, type: "style", severity: "info",
                        socraticHint: "[MOCK API LIMIT] Consider using 'const' instead of 'var/let' if the variable isn't reassigned. Does this variable name clearly communicate its purpose?"
                    });
                }
            });

            if (mockSmells.length === 0) {
                return res.status(429).json({ error: "API Rate Limit Reached. Please try again in a minute." });
            }
            return res.status(200).json({ smells: mockSmells });
        }

        return res.status(500).json({
            error: "Failed to generate AI heatmap analysis",
            details: error.message
        });
    }
};
