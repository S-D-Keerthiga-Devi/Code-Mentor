import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

// Routers
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import safeSuggestRouter from "./routes/safeSuggest.js"; // ✅ Added
import suggestionsRouter from "./routes/suggestions.js"; // ✅ Added
import courseMaterialRouter from "./routes/courseMaterialRoutes.js"; // ✅ Added
import userRoleRouter from "./routes/userRoleRoutes.js"; // ✅ Added

const app = express();
const port = process.env.PORT || 5000;

// ✅ Define allowed frontend origins
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://code-mentor-delta.vercel.app"];

// ✅ Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Connect to MongoDB first, then start server
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully.");

    // Default route
    app.get("/", (req, res) => {
      res.send("🚀 API is working!");
    });

    // ✅ Route setup
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/safe-suggest", safeSuggestRouter); // ✅ New route
    app.use("/api/suggestions", suggestionsRouter); // ✅ New route
    app.use("/api/course-materials", courseMaterialRouter); // ✅ Course Materials route
    app.use("/api/user-role", userRoleRouter); // ✅ User Role route

    // Global error handler (optional)
    app.use((err, req, res, next) => {
      console.error("🔥 Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });

    // ✅ Start server
    app.listen(port, () =>
      console.log(`🌐 Server running on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
