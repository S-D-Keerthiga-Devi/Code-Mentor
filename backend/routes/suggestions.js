import express from "express";
import mongoose from "mongoose";
import SuggestionLog from "../models/SuggestionLog.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// ✅ GET /api/suggestions - Get user's AI suggestions
router.get("/", userAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch suggestions with pagination
    const suggestions = await SuggestionLog.find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await SuggestionLog.countDocuments({ userId });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: {
        suggestions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error("❌ Error fetching suggestions:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch suggestions"
    });
  }
});

// ✅ GET /api/suggestions/stats - Get suggestion statistics
router.get("/stats", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic stats
    const totalSuggestions = await SuggestionLog.countDocuments({ userId });
    const validSuggestions = await SuggestionLog.countDocuments({ userId, valid: true });
    const avgConfidence = await SuggestionLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgConfidence: { $avg: "$confidence" } } }
    ]);

    // Get language breakdown
    const languageStats = await SuggestionLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await SuggestionLog.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalSuggestions,
        validSuggestions,
        avgConfidence: avgConfidence[0]?.avgConfidence || 0,
        languageStats,
        recentActivity
      }
    });
  } catch (error) {
    console.error("❌ Error fetching suggestion stats:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch suggestion statistics"
    });
  }
});

// ✅ GET /api/suggestions/:id - Get specific suggestion details
router.get("/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const suggestion = await SuggestionLog.findOne({
      _id: id,
      userId
    }).lean();

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: "Suggestion not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    console.error("❌ Error fetching suggestion:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch suggestion"
    });
  }
});

export default router;
