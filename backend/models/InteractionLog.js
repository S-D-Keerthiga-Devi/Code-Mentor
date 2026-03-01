import mongoose from "mongoose";

const interactionLogSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    actionType: {
        type: String,
        required: true,
        enum: ["code_paste", "run_code", "copy_code", "ai_ask", "auto_fix_penalty"], // Add other actions as needed
    },
    timeToAccept: {
        type: Number, // Time in seconds
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // For storing extra info like code snippets length, etc.
    },
});

const InteractionLog = mongoose.model("InteractionLog", interactionLogSchema);

export default InteractionLog;
