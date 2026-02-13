// backend/utils/generateAIChatResponse.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const generateAIChatResponse = async (code, language, question) => {
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
    const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro-latest"];

    for (const modelName of models) {
        try {
            console.log(`🧠 AI Chat: Trying model ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
You are an expert software engineer and technical mentor.

Context: A user is asking a question about the following ${language || "code"} code.

Code Context:
\`\`\`${language || ""}
${code}
\`\`\`

User Question: "${question}"

Instructions:
1. **Structure Your Answer**: Use **bullet points** or numbered lists to break down complex explanations. Avoid long paragraphs.
2. **Be Concise**: Keep the answer short and conversational.
3. **Formatting**: Use **bold** for key terms or variables. Use newlines to separate sections clearly.
4. **Tone**: Friendly, mentorship style.

Answer:
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            console.log(`✅ AI Chat: Success with ${modelName}`);
            return {
                response: text,
                valid: true
            };

        } catch (error) {
            console.error(`❌ AI Chat Error (${modelName}):`, error.message || error);
            // Continue to next model
        }
    }

    return {
        response: "Sorry, I'm having trouble connecting to my brain right now. All models failed.",
        valid: false
    };
};
