import express from "express";
import { generateAISuggestion } from "../utils/generateAISuggestion.js";
import { verifySuggestion } from "../utils/verifySuggestion.js";
import { scoreSuggestion } from "../utils/scoreSuggestion.js";
import SuggestionLog from "../models/SuggestionLog.js";
import rateLimiter from "../middleware/rateLimiter.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// ✅ POST /api/safe-suggest (Clerk ID passed in body)
router.post("/", rateLimiter, async (req, res) => {
  try {
    const { code, language, userId } = req.body;

    // 🧩 Step 1 — Validate inputs
    if (!code?.trim() || !language?.trim()) {
      return res.status(400).json({ error: "Code and language are required." });
    }

    // 🧠 Step 2 — Generate AI suggestion
    const aiSuggestionObj = await generateAISuggestion(code, language);
    if (!aiSuggestionObj || typeof aiSuggestionObj.suggestion !== "string") {
      return res.status(500).json({ error: "Failed to generate AI suggestion." });
    }

    const aiCode = aiSuggestionObj.suggestion; // Extract string code

    // 🧪 Step 3 — Verify syntax, runtime safety, and security
    const { syntaxValid, runtimeSafe, securityIssues, details } =
      await verifySuggestion(aiCode, code, language);

    // 📊 Step 4 — Score the suggestion
    const { confidence, reasoning } = scoreSuggestion({
      syntaxValid,
      runtimeSafe,
      securityIssues,
      details,
    });

    const isValid = confidence >= 0.6; // Threshold for safety

    // 🗂️ Step 5 — Log in MongoDB
    await SuggestionLog.create({
      userId: userId || null, // Use provided userId or null
      codeContext: code,
      suggestion: aiCode, // Store only the code string
      language,
      valid: isValid,
      confidence,
      reasoning,
      securityIssues,
    });

    // 🚀 Step 6 — Send response
    return res.status(200).json({
      suggestion: aiCode,
      valid: isValid,
      confidence,
      reasoning,
      securityIssues,
      details,
    });
  } catch (error) {
    console.error("❌ Safe Suggestion Error:", error);
    return res.status(500).json({
      error: "An error occurred during safe suggestion processing.",
      message: error.message,
    });
  }
});

export default router;
