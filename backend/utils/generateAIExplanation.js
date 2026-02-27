// backend/utils/generateAIExplanation.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeCodeTool } from "./executeCodeTool.js";
import dotenv from "dotenv";
dotenv.config();

export const generateAIExplanation = async (code, language) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro-latest"]; // Validated models

    // Define the Tools for the Agent
    const agentTools = [{
        functionDeclarations: [{
            name: "test_code",
            description: "Executes the provided code snippet and returns the terminal output or errors. Use this to verify the runtime behavior of the code before explaining it.",
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

    for (const modelName of models) {
        try {
            console.log(`🧠 Using model for explanation: ${modelName}`);

            const model = genAI.getGenerativeModel({
                model: modelName,
                tools: agentTools
            });

            const prompt = `
You are an expert software engineer and educator.

Your task is to explain the following ${language || "code"} snippet in simple, easy-to-understand terms.

Instructions:
1. **Tool Use Options**: You can optionally use the \`test_code\` tool to see what the code actually prints or does before writing your explanation.
2. **Be Concise**: Keep the explanation short (under 3-4 sentences if possible) suitable for a chat message.
3. **Focus on Logic**: Explain *what* the code does and *why*, not just syntax.
4. **Friendly Tone**: formatting like **bold** for key terms is okay.
5. **No Code Blocks**: Do not return the code itself, just the text explanation.

Code to explain:
\`\`\`${language || ""}
${code}
\`\`\`
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
                    console.log(`🛠️ Explain Agent called test_code tool | ${modelName}`);
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
                const finalResponse = await chat.sendMessage("Max iterations reached. Provide your final explanation without using tools.");
                finalOutput = finalResponse.response.text().trim();
                success = true;
            }

            if (success && finalOutput) {
                console.log(`✅ AI Explain: Success with ${modelName}`);
                return {
                    explanation: finalOutput,
                    valid: true
                };
            }


        } catch (error) {
            console.error(`❌ Error from Gemini API (${modelName}):`, error.message || error);
            if (error.status === 503 || (error.message && error.message.includes("Service Unavailable"))) {
                continue;
            }
            // If 404 or other errors, try next model or fail
            continue;
        }
    }

    return {
        explanation: "Sorry, I couldn't generate an explanation at this time due to AI service unavailability.",
        valid: false
    };
};
