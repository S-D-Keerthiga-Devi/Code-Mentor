import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadMaterial, getMaterials, askCourseAI } from "../controllers/courseMaterialController.js";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Routes
router.post("/upload", upload.single("file"), uploadMaterial);
router.get("/", getMaterials);
router.post("/chat", askCourseAI);

export default router;
