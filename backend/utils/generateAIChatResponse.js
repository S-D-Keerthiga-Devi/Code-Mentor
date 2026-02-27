import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { executeCodeTool } from "./executeCodeTool.js";
import dotenv from "dotenv";
dotenv.config();

export const generateAIChatResponse = async (code, language, question, systemInstruction = "") => {
    // 1. Check API Key
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is not set!");
        return {
            response: "My brain connection is down (API Key Missing). Please check server configuration.",
            valid: false
        };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use models verified to be available in this environment
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro-latest"];

    // Define the Tools for the Agent
    const agentTools = [{
        functionDeclarations: [{
            name: "test_code",
            description: "Executes the provided code snippet and returns the terminal output or errors. Use this to verify your code or assumptions before returning the final answer to the user.",
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

    try {
        for (const modelName of models) {
            try {
                console.log(`🧠 AI Chat: Trying model ${modelName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    tools: agentTools
                });

                const prompt = `
You are an expert software engineer and technical mentor.

${systemInstruction ? `**SPECIAL INSTRUCTION (scaffolding mode):** ${systemInstruction}` : ""}

Context: A user is asking a question about the following ${language || "code"} code.

Code Context:
\`\`\`${language || ""}
${code}
\`\`\`

User Question: "${question}"

Instructions:
1. **Tool Use Options**: You can optionally use the \`test_code\` tool to test snippets or verify logic before answering. If there is an error in the user's code, test your fixes to be sure.
2. **Structure Your Answer**: Use **bullet points** or numbered lists to break down complex explanations. Avoid long paragraphs.
3. **Be Concise**: Keep the answer short and conversational.
4. **Formatting**: Use **bold** for key terms or variables. Use newlines to separate sections clearly.
5. **Tone**: Friendly, mentorship style.

Answer:
`;

                const chat = model.startChat();
                let response = await chat.sendMessage(prompt);

                let iterationCount = 0;
                const MAX_ITERATIONS = 3;
                let success = false;
                let finalOutput = "";

                while (iterationCount < MAX_ITERATIONS) {
                    const call = response.response.functionCalls()?.[0];

                    if (call && call.name === "test_code") {
                        const args = call.args;
                        console.log(`🛠️ Chat Agent called test_code tool | ${modelName}`);
                        const resultOutput = await executeCodeTool(args.code, args.language);

                        response = await chat.sendMessage([{
                            functionResponse: {
                                name: "test_code",
                                response: { output: resultOutput }
                            }
                        }]);
                        iterationCount++;
                    } else {
                        finalOutput = response.response.text().trim();
                        success = true;
                        break;
                    }
                }

                if (iterationCount >= MAX_ITERATIONS && !success) {
                    const finalResponse = await chat.sendMessage("Max iterations reached. Provide your final answer without using tools.");
                    finalOutput = finalResponse.response.text().trim();
                    success = true;
                }

                if (success && finalOutput) {
                    console.log(`✅ AI Chat: Success with ${modelName}`);
                    return {
                        response: finalOutput,
                        valid: true
                    };
                }


            } catch (error) {
                console.error(`❌ AI Chat Error (${modelName}):`, error.message || error);

                // specific check for 429
                if (error.message.includes("429") || error.status === 429) {
                    console.warn(`⚠️ Quota exceeded for ${modelName}. Throwing out to fallback.`);
                    throw error;
                }
            }
        }

        throw new Error("All Gemini models exhausted or failed.");

    } catch (geminiError) {
        console.warn("⚠️ Gemini Chat Failed. Falling back to Groq...");
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const groqResponse = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemInstruction || "You are an expert software engineer and technical mentor." },
                    { role: "user", content: `Code:\n${code}\n\nQuestion:\n${question}` }
                ]
            });
            return { valid: true, response: groqResponse.choices[0].message.content };
        } catch (groqError) {
            console.error("❌ Both Gemini and Groq Chat failed:", groqError);
            return { valid: false, response: "Error connecting to AI service. Both primary and fallback providers are currently unavailable." };
        }
    }
};
