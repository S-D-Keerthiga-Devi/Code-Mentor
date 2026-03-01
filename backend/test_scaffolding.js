import mongoose from "mongoose";
import InteractionLog from "./models/InteractionLog.js";
import { getAiAssistance } from "./controllers/aiController.js";
import dotenv from "dotenv";

dotenv.config();

// Mock Request and Response
const mockReq = (sessionId) => ({
    body: {
        code: "console.log('test')",
        language: "javascript",
        question: "How does this work?",
        sessionId: sessionId
    }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

// Connect to DB (Use a test DB or existing one carefully)
// For this script, we'll assume the environment variable for Mongo URI is set
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/code_mentor_db"); // Adjust URI as needed
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("DB Connection Error:", err);
        process.exit(1);
    }
};

const clearLogs = async (sessionId) => {
    await InteractionLog.deleteMany({ sessionId });
};

const seedLogs = async (sessionId, count) => {
    const logs = [];
    for (let i = 0; i < count; i++) {
        logs.push({
            sessionId,
            actionType: "code_paste",
            timeToAccept: 5, // < 8 seconds
            timestamp: new Date()
        });
    }
    await InteractionLog.insertMany(logs);
};

const runTest = async () => {
    await connectDB();
    const sessionId = "test-session-" + Date.now();

    console.log(`\n--- Testing Dynamic Scaffolding for Session: ${sessionId} ---\n`);

    // Test 1: Green Mode (0 logs)
    console.log("Test 1: Green Mode (0 logs)...");
    let res = mockRes();
    await getAiAssistance(mockReq(sessionId), res);
    console.log(`Result: Mode=${res.data.mode}, Count=${res.data.dependencyCount}`);

    // Test 2: Yellow Mode (3 logs)
    console.log("\nTest 2: Yellow Mode (3 logs)...");
    await seedLogs(sessionId, 3);
    res = mockRes();
    await getAiAssistance(mockReq(sessionId), res);
    console.log(`Result: Mode=${res.data.mode}, Count=${res.data.dependencyCount}`);

    // Test 3: Red Mode (5 logs -> 3 existing + 2 new)
    console.log("\nTest 3: Red Mode (5 logs)...");
    await seedLogs(sessionId, 2);
    res = mockRes();
    await getAiAssistance(mockReq(sessionId), res);
    console.log(`Result: Mode=${res.data.mode}, Count=${res.data.dependencyCount}`);

    // Clean up
    await clearLogs(sessionId);
    await mongoose.connection.close();
};

runTest();
