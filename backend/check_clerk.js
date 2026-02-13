import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync('.env')) {
    dotenv.config();
    console.log("Checking for Clerk Keys...");
    if (process.env.CLERK_SECRET_KEY) {
        console.log("✅ CLERK_SECRET_KEY found.");
    } else {
        console.warn("❌ CLERK_SECRET_KEY missing.");
    }
    if (process.env.CLERK_PUBLISHABLE_KEY) {
        console.log("✅ CLERK_PUBLISHABLE_KEY found.");
    } else {
        console.warn("❌ CLERK_PUBLISHABLE_KEY missing (Optional for backend).");
    }
} else {
    console.log("❌ No .env file found in backend.");
}
