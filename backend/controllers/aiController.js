import InteractionLog from "../models/InteractionLog.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { generateAIChatResponse } from "../utils/generateAIChatResponse.js";
import { executeCodeTool } from "../utils/executeCodeTool.js";
import { SOCRATIC_PROMPT, PSEUDOCODE_PROMPT, STANDARD_PROMPT } from "../utils/prompts.js";
import axios from "axios";
import transporter from "../config/nodemailer.js";
import { resolveCuratedResources } from "../utils/studyResources.js";

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
    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.8-flash"];

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
    const modelName = "openai/gpt-oss-120b";

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

        const prompt = `You are an expert ${language} code assistant and compiler.
The user has a "${smellType}" code smell on line ${badLineNumber}.

Here is the full code for context:
\`\`\`${language}
${code}
\`\`\`

YOUR TASK:
1. Fix the code so it is 100% syntactically valid, logically correct, optimal, and free of bugs.
2. If the issue is a multi-line pattern or algorithmic smell (like nested loops that need a hash map), properly rewrite the function/block so the entire code works seamlessly.
3. You can use the \`test_code\` tool to test your code before finalizing.

CRITICAL INSTRUCTIONS:
- If no fix is needed (e.g., code is already optimal), return {"fixedCode": null, "fixedLine": "NO_FIX_NEEDED", "explanation": "Already optimal"}.
- Otherwise, return ONLY a raw JSON object matching this schema:
{
  "fixedCode": "<the COMPLETE updated code for the file with the fix applied>",
  "fixedLine": "<summary of the primary changed line/block>",
  "explanation": "<short 1-sentence explanation of what was improved>"
}`;

        let rawResult = "";

        try {
            // Attempt 1: Gemini (Primary)
            console.log("🤖 Attempting fix with Gemini...");
            rawResult = await runGeminiAgent(prompt, code, language);
        } catch (geminiError) {
            console.warn(`⚠️ Gemini Failed (${geminiError.message}). Falling back to Groq...`);

            try {
                // Attempt 2: Groq (Secondary)
                console.log("🧠 Attempting fix with Groq...");
                rawResult = await runGroqAgent(prompt, code, language);
            } catch (groqError) {
                console.error("❌ Both Gemini and Groq failed.");
                throw new Error("All AI providers exhausted.");
            }
        }

        // Clean and parse JSON response
        let fixedCode = null;
        let fixedLine = "";
        let explanation = "";

        try {
            const parsed = typeof rawResult === 'object' ? rawResult : JSON.parse(rawResult.replace(/```(?:json)?\s*([\s\S]*?)```/i, "$1").trim());
            fixedCode = parsed.fixedCode || null;
            fixedLine = parsed.fixedLine || "";
            explanation = parsed.explanation || "";
        } catch (_) {
            // If raw text was returned directly
            fixedLine = rawResult.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
            if (fixedLine.includes("\n")) {
                fixedCode = fixedLine;
            }
        }

        return res.status(200).json({ fixedCode, fixedLine, explanation });

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

        if (!code) {
            return res.status(400).json({ error: "Source code is required to generate a study guide." });
        }

        const prompt = `You are an expert coding instructor and computer science curriculum designer.
A student named ${studentName || "Anonymous"} with experience level '${experienceLevel || "beginner"}' has encountered an error or wants a study guide.

Code:
\`\`\`
${code}
\`\`\`

Error / Execution Output:
\`\`\`
${jdoodleError || "General logic / conceptual review requested"}
\`\`\`

YOUR TASK:
Analyze the error and the code. Generate a personalized remediation study guide blueprint.
Output strictly valid JSON (no markdown, no extra commentary) matching this EXACT schema:
{
  "identified_weakness": "Clear 1-2 sentence description of the core conceptual gap or error",
  "google_doc_title": "${studentName || "Student"} – Study Guide: Remediation Plan",
  "youtube_search_queries": [
    "search query 1 for video tutorial",
    "search query 2 for video tutorial"
  ],
  "article_search_queries": [
    "search query 1 for documentation / article",
    "search query 2 for documentation / article"
  ],
  "syllabus_outline": [
    "1. Core concept explanation",
    "2. Hands-on syntax & logic correction",
    "3. Practice problems & edge-case prevention"
  ]
}`;

        let blueprint = null;

        // 1. Try Gemini
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const models = ["gemini-3.5-flash-lite", "gemini-2.5-flash"];
                for (const modelName of models) {
                    try {
                        const model = genAI.getGenerativeModel({
                            model: modelName,
                            generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
                        });
                        const result = await model.generateContent(prompt);
                        const rawText = result.response.text();
                        const parsed = JSON.parse(rawText.replace(/```(?:json)?\s*([\s\S]*?)```/i, "$1").trim());
                        if (parsed && (parsed.identified_weakness || parsed.syllabus_outline)) {
                            blueprint = parsed;
                            break;
                        }
                    } catch (mErr) {
                        console.warn(`⚠️ [CourseGen] Gemini ${modelName} failed:`, mErr.message);
                    }
                }
            } catch (geminiError) {
                console.warn("⚠️ [CourseGen] Gemini route failed:", geminiError.message);
            }
        }

        // 2. Fast Fallback to Groq
        if (!blueprint && process.env.GROQ_API_KEY) {
            try {
                console.log("🧠 [CourseGen] Querying Groq fallback...");
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const groqResponse = await groq.chat.completions.create({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        { role: "system", content: "You are a course blueprint compiler. Output strictly valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.2
                });

                const rawContent = groqResponse.choices?.[0]?.message?.content || "";
                blueprint = JSON.parse(rawContent);
            } catch (groqError) {
                console.error("❌ [CourseGen] Groq fallback failed:", groqError.message);
            }
        }

        // 3. Fallback Heuristic Blueprint if AI unavailable
        if (!blueprint) {
            blueprint = {
                identified_weakness: `Issue detected in ${experienceLevel || "beginner"} code execution. Check loop boundaries, type compatibility, and variable scope.`,
                google_doc_title: `${studentName || "Student"} – Debugging & Mastery Blueprint`,
                youtube_search_queries: ["Debugging JavaScript runtime errors", "Understanding array methods and indexing"],
                article_search_queries: ["MDN Web Docs Common Errors", "JavaScript Data Structures guide"],
                syllabus_outline: [
                    "1. Understanding the syntax and execution flow",
                    "2. Isolating runtime exceptions and off-by-one errors",
                    "3. Applying defensive coding and input guards"
                ]
            };
        }

        // Normalize property names
        if (blueprint.Youtube_queries && !blueprint.youtube_search_queries) {
            blueprint.youtube_search_queries = blueprint.Youtube_queries;
        }

        // 4. Resolve direct, verified YouTube video URLs & Official Documentation articles
        const curated = resolveCuratedResources(
            code,
            jdoodleError,
            blueprint.identified_weakness,
            blueprint.youtube_search_queries,
            blueprint.article_search_queries
        );

        blueprint.direct_videos = curated.videos;
        blueprint.direct_articles = curated.articles;

        // 5. Send direct email to student via Brevo / Nodemailer if email or SMTP is configured
        let emailDelivered = false;
        const targetEmail = email || process.env.SENDER_EMAIL;
        if (targetEmail && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
            try {
                const syllabusHtml = (blueprint.syllabus_outline || []).map((step, idx) => `
                    <li style="margin-bottom: 10px; color: #374151; font-size: 14px; line-height: 1.6;">
                        <strong>Step ${idx + 1}:</strong> ${step.replace(/^\d+\.\s*/, '')}
                    </li>
                `).join('');

                const youtubeLinksHtml = (blueprint.direct_videos || []).map(v => `
                    <li style="margin-bottom: 10px;">
                        <a href="${v.url}" 
                           target="_blank" 
                           style="color: #dc2626; text-decoration: none; font-weight: 600; font-size: 14px;">
                           ▶️ Watch: ${v.title} (${v.channel || "YouTube"}) ↗
                        </a>
                    </li>
                `).join('');

                const docLinksHtml = (blueprint.direct_articles || []).map(a => `
                    <li style="margin-bottom: 10px;">
                        <a href="${a.url}" 
                           target="_blank" 
                           style="color: #4f46e5; text-decoration: none; font-weight: 600; font-size: 14px;">
                           📖 Read: ${a.title} (${a.source || "Official Docs"}) ↗
                        </a>
                    </li>
                `).join('');

                const mailOptions = {
                    from: `"Code Mentor AI" <${process.env.SENDER_EMAIL || "sdkeerthigadevi@gmail.com"}>`,
                    to: targetEmail,
                    subject: `📚 Your Personalized Code Mentor Study Guide: ${blueprint.google_doc_title || "Remediation Plan"}`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 8px; text-align: center; color: #ffffff; margin-bottom: 24px;">
                                <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🎓 Code Mentor Custom Study Guide</h1>
                                <p style="margin: 0; font-size: 14px; opacity: 0.95;">Personalized learning blueprint prepared for <strong>${studentName || "Student"}</strong></p>
                            </div>

                            <!-- Weakness Section -->
                            <div style="background-color: #ffffff; border: 1px solid #e0e7ff; border-left: 5px solid #4f46e5; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                                <h3 style="margin: 0 0 8px 0; color: #4338ca; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Identified Weakness & Root Cause</h3>
                                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                                    ${blueprint.identified_weakness}
                                </p>
                            </div>

                            <!-- Syllabus Section -->
                            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                <h3 style="margin: 0 0 14px 0; color: #111827; font-size: 15px; font-weight: 700;">📋 Recommended Learning Syllabus</h3>
                                <ol style="padding-left: 20px; margin: 0;">
                                    ${syllabusHtml}
                                </ol>
                            </div>

                            <!-- YouTube Tutorials -->
                            ${blueprint.direct_videos && blueprint.direct_videos.length > 0 ? `
                            <div style="background-color: #ffffff; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 15px; font-weight: 700;">📺 Direct Video Tutorials</h3>
                                <ul style="padding-left: 20px; margin: 0;">
                                    ${youtubeLinksHtml}
                                </ul>
                            </div>
                            ` : ''}

                            <!-- Documentation Guides -->
                            ${blueprint.direct_articles && blueprint.direct_articles.length > 0 ? `
                            <div style="background-color: #ffffff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                <h3 style="margin: 0 0 12px 0; color: #3730a3; font-size: 15px; font-weight: 700;">📚 Official Documentation & Articles</h3>
                                <ul style="padding-left: 20px; margin: 0;">
                                    ${docLinksHtml}
                                </ul>
                            </div>
                            ` : ''}

                            <div style="text-align: center; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                                <p style="margin: 0 0 4px 0;">Generated automatically by Code Mentor AI Socratic Diagnostics</p>
                                <p style="margin: 0;">Keep coding and building with confidence! 🚀</p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                emailDelivered = true;
                console.log(`✅ [CourseGen] Study guide email successfully dispatched to ${targetEmail}`);
            } catch (mailError) {
                console.warn("⚠️ [CourseGen] Direct email dispatch error:", mailError.message);
            }
        }

        // 5. Send the blueprint to n8n webhook if configured
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
        if (N8N_WEBHOOK_URL && !N8N_WEBHOOK_URL.includes("YOUR_N8N")) {
            try {
                const fallbackEmail = "admin@codementor.com";
                await axios.post(N8N_WEBHOOK_URL, {
                    studentName: studentName || "Anonymous",
                    email: email || fallbackEmail,
                    blueprint
                }, { timeout: 3500 });
                console.log("✅ [CourseGen] Blueprint dispatched to n8n webhook");
            } catch (webhookError) {
                console.warn("ℹ️ [CourseGen] n8n webhook notice (n8n might be offline or inactive):", webhookError.message);
                // Non-blocking: continue to return blueprint to frontend
            }
        }

        return res.status(200).json({
            success: true,
            message: emailDelivered 
                ? `Study guide generated and emailed to ${targetEmail}!` 
                : "Study guide blueprint generated successfully!",
            emailDelivered,
            targetEmail,
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

