// backend/routes/aiRoutes.js
import express from "express";
import { generateAIExplanation } from "../utils/generateAIExplanation.js";
import rateLimiter from "../middleware/rateLimiter.js";
import userAuth from "../middleware/userAuth.js"; // Optional: if you want to protect it

const router = express.Router();

// POST /api/ai/explain
router.post("/explain", rateLimiter, async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ error: "No code provided for explanation." });
        }

        const result = await generateAIExplanation(code, language);

        return res.status(200).json(result);

    } catch (error) {
        console.error("❌ AI Explanation Error:", error);
        return res.status(500).json({
            error: "Failed to generate explanation",
            details: error.message
        });
    }
});

// POST /api/ai/chat
router.post("/chat", rateLimiter, async (req, res) => {
    try {
        const { code, language, question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ error: "No question provided." });
        }

        // Import dynamically to avoid circular issues if any, or just import at top
        const { generateAIChatResponse } = await import("../utils/generateAIChatResponse.js");

        const result = await generateAIChatResponse(code || "", language || "text", question);

        return res.status(200).json(result);

    } catch (error) {
        console.error("❌ AI Chat Error:", error);
        return res.status(500).json({
            error: "Failed to generate chat response",
            details: error.message
        });
    }
});

export default router;
