// backend/utils/generateAIExplanation.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const generateAIExplanation = async (code, language) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro-latest"]; // Validated models

    for (const modelName of models) {
        try {
            console.log(`🧠 Using model for explanation: ${modelName}`);

            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
You are an expert software engineer and educator.

Your task is to explain the following ${language || "code"} snippet in simple, easy-to-understand terms.

Instructions:
1. **Be Concise**: Keep the explanation short (under 3-4 sentences if possible) suitable for a chat message.
2. **Focus on Logic**: Explain *what* the code does and *why*, not just syntax.
3. **Friendly Tone**: formatting like **bold** for key terms is okay.
4. **No Code Blocks**: Do not return the code itself, just the text explanation.

Code to explain:
\`\`\`${language || ""}
${code}
\`\`\`
`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            return {
                explanation: text,
                valid: true
            };

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
