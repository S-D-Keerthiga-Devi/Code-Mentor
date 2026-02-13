import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const candidateModels = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro"
];

async function testModels() {
    console.log("🔍 Testing Gemini Models...");

    for (const modelName of candidateModels) {
        try {
            process.stdout.write(`Testing ${modelName}... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log("✅ Success!");
        } catch (error) {
            console.log("❌ Failed");
            // console.error(error.message); // Uncomment for details
        }
    }
}

testModels();
