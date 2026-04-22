// utils/generateAISuggestion.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const generateAISuggestion = async (code, language) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"]; // priority list

  for (const modelName of models) {
    try {
      console.log(`🧠 Using model: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
You are an expert code reviewer and mentor specializing in ${language}.

Your task is to analyze the provided code and provide helpful, actionable suggestions.

Instructions:
1. **Fix Syntax & Runtime Errors**: Correct any syntax errors or potential runtime issues
2. **Improve Code Quality**: Suggest improvements for readability, performance, and best practices
3. **Security Analysis**: Identify and fix security vulnerabilities
4. **Add Comments**: Include helpful comments explaining key improvements
5. **Maintain Functionality**: Keep the original logic and intent intact

Return a VALID JSON response in this exact format:
{
  "suggestion": "<improved_code_with_comments>",
  "valid": true/false,
  "reasoning": "<detailed explanation of changes and improvements made>"
}

Guidelines for the suggestion:
- Write clean, well-formatted code
- Add meaningful comments for complex logic
- Follow ${language} best practices and conventions
- If the code is already good, acknowledge it and suggest minor enhancements
- Make the code production-ready

User's ${language} code:
\`\`\`${language}
${code}
\`\`\`
`;

      console.log(
        "🔑 Gemini API Key:",
        process.env.GEMINI_API_KEY ? "Loaded ✅" : "❌ Not Loaded"
      );

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Clean up and parse JSON safely
      const cleaned = text.replace(/```json|```/g, "").trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        console.warn("⚠️ Could not parse Gemini JSON response. Returning fallback.");
        parsed = {
          suggestion: "// Could not parse Gemini response",
          valid: false,
          reasoning: "Gemini returned invalid JSON format.",
        };
      }

      console.log("✅ AI Suggestion generated successfully using:", modelName);
      return parsed;

    } catch (error) {
      console.error(`❌ Error from Gemini API (${modelName}):`, error.message || error);

      if (error.status === 503 || (error.message && error.message.includes("Service Unavailable"))) {
        console.warn("⚠️ Model overloaded. Trying next model...");
        continue;
      }

      if (error.status === 404 || (error.message && error.message.includes("not found"))) {
        console.warn("⚠️ Model not found. Trying fallback...");
        continue;
      }

      // For other errors, fallback to a generic message
      return {
        suggestion: "// AI suggestion failed due to an error",
        valid: false,
        reasoning: error.message || "Unknown error from Gemini API",
      };
    }
  }

  // If all models fail
  return {
    suggestion: "// No AI suggestion available",
    valid: false,
    reasoning: "All Gemini models failed or unavailable.",
  };
};
