// backend/routes/aiRoutes.js
import express from "express";
import { generateAIExplanation } from "../utils/generateAIExplanation.js";
import { getAiAssistance, logInteraction, autoFixCode } from "../controllers/aiController.js";
import { analyzeCodeForHeatmap } from "../controllers/agenticAnalysisController.js";
import { executeCode } from "../controllers/executionController.js";
import { generateVisualFlow, optimizeNodeCode } from "../controllers/visualDebuggerController.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { triggerCourseGeneration } from '../controllers/aiController.js';

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
router.post("/chat", rateLimiter, getAiAssistance);

// POST /api/ai/log
router.post("/log", logInteraction);

// POST /api/ai/socratic-heatmap
router.post("/socratic-heatmap", rateLimiter, analyzeCodeForHeatmap);

// POST /api/ai/execute-code
router.post("/execute-code", rateLimiter, executeCode);

// POST /api/ai/auto-fix
router.post("/auto-fix", rateLimiter, autoFixCode);

// POST /api/ai/visualize-flow
router.post("/visualize-flow", rateLimiter, generateVisualFlow);

// POST /api/ai/optimize-node
router.post("/optimize-node", rateLimiter, optimizeNodeCode);

// POST /api/ai/generate-course
router.post('/generate-course', triggerCourseGeneration);

export default router;
