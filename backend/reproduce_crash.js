import { generateAIChatResponse } from "./utils/generateAIChatResponse.js";
import dotenv from "dotenv";
dotenv.config();

const testCrash = async () => {
    console.log("Starting crash test...");
    try {
        const result = await generateAIChatResponse(
            "console.log('test')",
            "javascript",
            "Explain this",
            "You are a helpful assistant."
        );
        console.log("Result:", result);
    } catch (error) {
        console.error("Caught error:", error);
    }
    console.log("Finished crash test.");
};

testCrash();
