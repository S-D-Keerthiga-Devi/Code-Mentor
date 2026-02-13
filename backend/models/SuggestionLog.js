import mongoose from "mongoose";

const suggestionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Changed to String to support Clerk IDs
      default: null,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    codeContext: {
      type: String,
      default: "",
    },

    // ✅ Gemini AI now returns an object like { suggestion, valid, reasoning, details }
    suggestion: {
      type: Object,
      required: true,
      default: {
        suggestion: "",
        valid: false,
        reasoning: "",
        details: "",
      },
    },

    // ✅ For quick access, keep top-level fields (can be derived from suggestion object)
    valid: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    reasoning: {
      type: String,
      default: "",
    },
    securityIssues: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const SuggestionLog = mongoose.model("SuggestionLog", suggestionLogSchema);
export default SuggestionLog;
