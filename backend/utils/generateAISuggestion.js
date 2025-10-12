// utils/generateAISuggestion.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const generateAISuggestion = async (code, language) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"]; // priority list

  for (const modelName of models) {
    try {
      console.log(`🧠 Using model: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
You are a code safety validator and syntax corrector.
Your job:
1. Check the provided ${language} code for syntax or runtime errors.
2. Fix any issues while keeping the same logic and functionality.
3. Identify and explain any security or best-practice issues.
4. Return a VALID JSON response in exactly this format:
{
  "suggestion": "<fixed_code>",
  "valid": true/false,
  "reasoning": "<brief explanation>"
}

User's code:
${code}
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
