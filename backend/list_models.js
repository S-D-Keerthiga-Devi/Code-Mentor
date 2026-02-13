import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const listModels = async () => {
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Access the model manager directly if possible, or use a known method.
        // The SDK doesn't expose listModels directly on genAI instance in all versions.
        // But we can try to just use a model and catch the error, or use the API directly via fetch if SDK fails.

        // Actually, let's use the REST API to list models to be sure, avoiding SDK quirks.
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
};

listModels();
