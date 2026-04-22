import InteractionLog from "../models/InteractionLog.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { generateAIChatResponse } from "../utils/generateAIChatResponse.js";
import { executeCodeTool } from "../utils/executeCodeTool.js";
import { SOCRATIC_PROMPT, PSEUDOCODE_PROMPT, STANDARD_PROMPT } from "../utils/prompts.js";
import axios from "axios";

export const logInteraction = async (req, res) => {
    try {
        const { sessionId, actionType, metadata } = req.body;

        if (!sessionId || !actionType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newLog = new InteractionLog({
            sessionId,
            actionType,
            timestamp: new Date(),
            metadata
        });

        await newLog.save();
        res.status(201).json({ message: "Interaction logged successfully" });

    } catch (error) {
        console.error("❌ Error logging interaction:", error);
        res.status(500).json({ error: "Failed to log interaction" });
    }
};

export const getAiAssistance = async (req, res) => {
    try {
        const { code, language, question, sessionId } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ error: "No question provided." });
        }

        // If no sessionId is provided, we can't track dependency, so default to green mode or error?
        // For now, let's assume sessionId is passed or we generate a temporary one if needed, 
        // but the prompt implies we should have it.
        const currentSessionId = sessionId || "anonymous";

        // 1. Calculate Dependency Level
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const dependencyCount = await InteractionLog.countDocuments({
            sessionId: currentSessionId,
            actionType: "code_paste",
            timestamp: { $gte: fifteenMinutesAgo },
            timeToAccept: { $lt: 8 } // Less than 8 seconds
        });

        // 2. Determine Mode & Instruction
        let mode = "Standard";
        let systemInstruction = STANDARD_PROMPT;

        if (dependencyCount > 4) {
            mode = "Socratic";
            systemInstruction = SOCRATIC_PROMPT;
        } else if (dependencyCount > 2) {
            mode = "Pseudocode";
            systemInstruction = PSEUDOCODE_PROMPT;
        } else {
            mode = "Standard";
            systemInstruction = STANDARD_PROMPT;
        }

        console.log(`🔍 AI Assistance | Session: ${currentSessionId} | Count: ${dependencyCount} | Mode: ${mode}`);

        // 3. Call Gemini API
        const result = await generateAIChatResponse(code || "", language || "text", question, systemInstruction);

        if (!result.valid) {
            // Return 200 so the frontend displays the error message in the chat bubble
            return res.status(200).json({
                reply: result.response,
                mode: mode,
                dependencyCount: dependencyCount
            });
        }

        // 4. Return Response with Mode
        return res.status(200).json({
            reply: result.response,
            mode: mode,
            dependencyCount: dependencyCount
        });

    } catch (error) {
        console.error("❌ AI Assistance Error:", error);
        return res.status(500).json({
            error: "Failed to generate AI assistance",
            details: error.message
        });
    }
};

const runGeminiAgent = async (prompt, code, language) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro-latest"];

    const agentTools = [{
        functionDeclarations: [{
            name: "test_code",
            description: "Executes the provided code snippet and returns the terminal output or errors. Use this to verify your code fix works before returning the final answer to the user.",
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

    let fixedLine = "";
    let success = false;

    for (const modelName of models) {
        try {
            console.log(`🤖 Starting Agent Loop with model: ${modelName}`);
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
                    console.log(`🛠️ AI called test_code tool (Iteration ${iterationCount + 1}) | Language: ${args.language}`);

                    const resultOutput = await executeCodeTool(args.code, args.language);
                    console.log(`📊 AI tool output size: ${resultOutput.length} characters`);

                    response = await chat.sendMessage([{
                        functionResponse: {
                            name: "test_code",
                            response: { output: resultOutput }
                        }
                    }]);

                    iterationCount++;
                } else {
                    fixedLine = response.response.text().trim();
                    if (fixedLine) {
                        success = true;
                        console.log(`✅ AI arrived at final answer after ${iterationCount} tool uses.`);
                    }
                    break;
                }
            }

            if (iterationCount >= MAX_ITERATIONS && !success) {
                console.warn(`⚠️ Max agent iterations reached without final text output.`);
                const finalResponse = await chat.sendMessage("Max iterations reached. Provide your best guess for the single corrected line now without using tools.");
                fixedLine = finalResponse.response.text().trim();
                success = true;
            }

            if (success) break;

        } catch (error) {
            console.error(`❌ Auto-Fix Agent Error with ${modelName}:`, error.message || error);
            if (error.status === 429 || error.message?.includes("429") || error.message?.includes("500") || error.status === 500) {
                throw error; // Bubble up to controller for fallback
            }
        }
    }

    if (!success || !fixedLine) {
        throw new Error("All Gemini models failed to generate auto-fix within the agent loop.");
    }

    return fixedLine;
};

const runGroqAgent = async (prompt, code, language) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is missing");

    const groq = new Groq({ apiKey });
    const modelName = "llama-3.3-70b-versatile";

    const agentTools = [{
        type: "function",
        function: {
            name: "test_code",
            description: "Executes the provided code snippet and returns the terminal output or errors. Use this to verify your code fix works before returning the final answer to the user.",
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

    let fixedLine = "";
    let success = false;
    let iterationCount = 0;
    const MAX_ITERATIONS = 3;

    try {
        console.log(`🧠 Starting Groq Agent Loop with model: ${modelName}`);

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
                    console.log(`🛠️ Groq AI called test_code tool (Iteration ${iterationCount + 1}) | Language: ${args.language}`);

                    const resultOutput = await executeCodeTool(args.code, args.language);
                    console.log(`📊 Groq AI tool output size: ${resultOutput.length} characters`);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: resultOutput
                    });

                    iterationCount++;
                }
            } else {
                fixedLine = responseMessage.content?.trim() || "";
                if (fixedLine) {
                    success = true;
                    console.log(`✅ Groq AI arrived at final answer after ${iterationCount} tool uses.`);
                }
                break;
            }
        }

        if (iterationCount >= MAX_ITERATIONS && !success) {
            console.warn(`⚠️ Max Groq agent iterations reached without final text output.`);
            messages.push({
                role: "user",
                content: "Max iterations reached. Provide your best guess for the single corrected line now without using tools."
            });
            const finalResponse = await groq.chat.completions.create({
                model: modelName,
                messages: messages,
            });
            fixedLine = finalResponse.choices[0].message.content?.trim() || "";
            success = true;
        }

    } catch (error) {
        console.error(`❌ Auto-Fix Agent Error with Groq:`, error.message || error);
        throw error;
    }

    if (!success || !fixedLine) {
        throw new Error("Groq failed to generate auto-fix within the agent loop.");
    }

    return fixedLine;
};

export const autoFixCode = async (req, res) => {
    try {
        const { code, language, badLineNumber, smellType, sessionId } = req.body;

        if (!code || !badLineNumber || !smellType) {
            return res.status(400).json({ error: "Missing required fields for auto-fix." });
        }

        const currentSessionId = sessionId || "anonymous";

        // 1. Log the Dependency Penalty
        try {
            const newLog = new InteractionLog({
                sessionId: currentSessionId,
                actionType: "auto_fix_penalty",
                timestamp: new Date(),
                metadata: { penalty: 1, smellType, badLineNumber }
            });
            await newLog.save();
        } catch (logErr) {
            console.error("Failed to log penalty:", logErr);
            // Continue with fix even if logging fails
        }

        const prompt = `
You are an expert ${language} code assistant.
The user has a "${smellType}" code smell on line ${badLineNumber}.

Here is the full code for context:
\`\`\`${language}
${code}
\`\`\`

YOUR TASK:
Fix the code.
You MUST use the \`test_code\` tool to verify your fix works by running the entire new script. 
If it fails, read the error output from the tool and fix your mistake, then test again.

CRITICAL INSTRUCTION:
If the \`smellType\` or hint is completely illogical for line ${badLineNumber} (e.g., asking to change 'let' to 'const' on a function declaration), OR if the line is already perfectly optimal and needs no changes, DO NOT return the original line. 
Instead, you MUST return exactly this string: NO_FIX_NEEDED

If a fix IS made and passes tests, return ONLY the corrected line of code (the new version of line ${badLineNumber}).
Do NOT provide markdown formatting (no \`\`\` wrappers).
Do NOT provide explanations.
`;

        let fixedLine = "";

        try {
            // Attempt 1: Gemini (Primary)
            console.log("🤖 Attempting fix with Gemini...");
            fixedLine = await runGeminiAgent(prompt, code, language);
        } catch (geminiError) {
            console.warn(`⚠️ Gemini Failed (${geminiError.message}). Falling back to Groq...`);

            try {
                // Attempt 2: Groq (Secondary)
                console.log("🧠 Attempting fix with Groq (Llama-3)...");
                fixedLine = await runGroqAgent(prompt, code, language);
            } catch (groqError) {
                console.error("❌ Both Gemini and Groq failed.");
                throw new Error("All AI providers exhausted.");
            }
        }

        // Strip markdown if the AI ignored instructions
        fixedLine = fixedLine.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();

        return res.status(200).json({ fixedLine });

    } catch (error) {
        console.error("❌ Auto-Fix Complete Flow Error:", error);
        return res.status(500).json({
            error: "Failed to generate auto-fix",
            details: error.message
        });
    }
};

export const triggerCourseGeneration = async (req, res) => {
    try {
        const { studentName, email, code, jdoodleError, experienceLevel } = req.body;

        if (!code || !jdoodleError) {
            return res.status(400).json({ error: "Missing required code or error fields." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
        }

        const courseTool = {
            name: "provision_ephemeral_bootcamp",
            description: "Generates a comprehensive study guide blueprint to help a student overcome a coding error.",
            parameters: {
                type: "OBJECT",
                properties: {
                    identified_weakness: { type: "STRING", description: "The underlying knowledge gap causing the error." },
                    google_doc_title: { type: "STRING", description: "A catchy, encouraging title for the study guide." },
                    Youtube_queries: { type: "ARRAY", items: { type: "STRING" }, description: "Search queries to find helpful YouTube videos." },
                    article_search_queries: { type: "ARRAY", items: { type: "STRING" }, description: "Search queries to find helpful articles/documentation." },
                    syllabus_outline: { type: "ARRAY", items: { type: "STRING" }, description: "Step-by-step topics the student should learn to master this concept." }
                },
                required: ["identified_weakness", "google_doc_title", "Youtube_queries", "article_search_queries", "syllabus_outline"]
            }
        };

        const prompt = `You are a Senior Engineering Mentor.
A student named ${studentName || "Anonymous"} with experience level '${experienceLevel || "beginner"}' has encountered an error in their code.

Code:
\`\`\`
${code}
\`\`\`

Error Output:
\`\`\`
${jdoodleError}
\`\`\`

Your goal is to use the provided tool to generate a custom study guide blueprint to help them understand the root cause of their error and learn the underlying concepts.`;

        let blueprint = null;

        try {
            // Primary route: Gemini function-calling
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const chat = model.startChat({
                tools: [{ functionDeclarations: [courseTool] }]
            });

            const response = await chat.sendMessage(prompt);
            const toolCall = response.response.functionCalls()?.[0];

            if (!toolCall || toolCall.name !== "provision_ephemeral_bootcamp") {
                throw new Error("Gemini failed to return the expected blueprint structure.");
            }

            blueprint = toolCall.args;
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, falling back to Groq...", geminiError.message);

            const groqApiKey = process.env.GROQ_API_KEY;
            if (!groqApiKey) {
                throw new Error("GROQ_API_KEY is missing and Gemini failed.");
            }

            const groq = new Groq({ apiKey: groqApiKey });
            const groqResponse = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert coding instructor. Analyze the student's failing code and produce a personalized remediation study guide blueprint. Return strictly valid JSON only (no markdown, no backticks, no extra text) that exactly matches this schema: {\"identified_weakness\":\"string\",\"google_doc_title\":\"string\",\"Youtube_queries\":[\"string\"],\"article_search_queries\":[\"string\"],\"syllabus_outline\":[\"string\"]}."
                    },
                    {
                        role: "user",
                        content: `Student Name: ${studentName || "Anonymous"}
Experience Level: ${experienceLevel || "beginner"}

Code:
${code}

Error Output:
${jdoodleError}

Generate the JSON blueprint now.`
                    }
                ],
                temperature: 0.3
            });

            const groqRaw = groqResponse.choices?.[0]?.message?.content || "";
            const cleanedResponse = groqRaw.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsedGroqBlueprint = JSON.parse(cleanedResponse);

            blueprint = parsedGroqBlueprint;
        }
        
        // Post the blueprint mapping via axios to n8n webhook
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "YOUR_N8N_WEBHOOK_URL_HERE";
        try {
            const fallbackEmail = "admin@codementor.com"; // Fallback email
            await axios.post(N8N_WEBHOOK_URL, {
                studentName: studentName || "Anonymous",
                email: email || fallbackEmail,
                blueprint
            });
        } catch (webhookError) {
            console.error("⚠️ Failed to trigger n8n webhook, but blueprint was generated:", webhookError.message);
            // Optionally decide if this should fail the whole request. 
            // Since it's an async background task usually, we just log it.
        }

        return res.status(200).json({ 
            success: true, 
            blueprint 
        });

    } catch (error) {
        console.error("❌ Course Generation Error:", error);
        return res.status(500).json({
            error: "Failed to generate course blueprint",
            details: error.message
        });
    }
};

