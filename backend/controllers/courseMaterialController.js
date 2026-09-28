import CourseMaterial from "../models/CourseMaterial.js";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// Upload Material
export const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { title } = req.body;
        const filePath = req.file.path;

        console.log("Processing file:", req.file.originalname);
        console.log("File path:", filePath);

        // Extract text from PDF
        let extractedText = "";
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const parser = new PDFParse({ data: dataBuffer });
            const data = await parser.getText();
            await parser.destroy();
            extractedText = data.text;
            console.log("Text extracted successfully. Length:", extractedText.length);
        } catch (pdfError) {
            console.error("Error parsing PDF:", pdfError);
            extractedText = "Text extraction failed (PDF parse error).";
            // Do not return 500, continue to save the file
        }

        const newMaterial = new CourseMaterial({
            title: title || req.file.originalname,
            filename: req.file.filename,
            filePath,
            extractedText: extractedText || "No text extracted (Image-based PDF or empty)",
        });

        await newMaterial.save();

        res.status(201).json({ message: "Material uploaded successfully", material: newMaterial });
    } catch (error) {
        console.error("Error uploading material (General):", error);
        res.status(500).json({ error: "Failed to upload material: " + error.message });
    }
};

// Get All Materials
export const getMaterials = async (req, res) => {
    try {
        const materials = await CourseMaterial.find().sort({ uploadedAt: -1 });
        res.status(200).json(materials);
    } catch (error) {
        console.error("Error fetching materials:", error);
        res.status(500).json({ error: "Failed to fetch materials" });
    }
};

// Chat with Course AI (RAG with Fallback to Core Knowledge)
export const askCourseAI = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ error: "Query is required" });
        }

        // Fetch all extracted text from course materials
        let materials = [];
        try {
            materials = await CourseMaterial.find({}).sort({ uploadedAt: -1 });
        } catch (dbErr) {
            console.warn("MongoDB fetch warning in Course AI:", dbErr.message);
        }

        let context = "";
        let hasMaterials = false;

        if (materials && materials.length > 0) {
            materials.forEach((material) => {
                if (material.extractedText && material.extractedText.trim()) {
                    context += `\n\n--- Source Document: ${material.title} ---\n${material.extractedText.slice(0, 15000)}`;
                    hasMaterials = true;
                }
            });
        }

        const prompt = hasMaterials
            ? `You are an expert Teaching Assistant and Course Mentor.
Answer the student's question based primarily on the uploaded Course Materials provided below.

Guidelines:
- Reference specific sections and concepts from the course materials.
- For study plans, summaries, or key chapter explanations, provide clean, structured markdown with bullet points and bold headers.
- Be encouraging, clear, and pedagogically sound.

Student Question:
${query}

Uploaded Course Materials:
${context}`
            : `You are an expert University Teaching Assistant and Computer Science Course Mentor.
Note: The instructor has not uploaded custom PDF course slides or syllabi to this workspace yet.

Guidelines:
- Begin with a brief, friendly 1-line note: "> 📚 *Workspace Note: No custom course documents have been uploaded yet. Answering with core Computer Science & Software Engineering knowledge.*"
- Provide a thorough, structured, and helpful answer to the student's question using core computer science and industry standards.
- Use clean Markdown with headers, bold points, and code/conceptual examples where helpful.

Student Question:
${query}`;

        let answer = "";

        // 1. Try Gemini models
        try {
            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const models = ["gemini-3.5-flash-lite", "gemini-2.5-flash"];
                for (const modelName of models) {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(prompt);
                        answer = result.response.text();
                        if (answer) break;
                    } catch (mErr) {
                        console.warn(`⚠️ [CourseAI] Gemini model ${modelName} failed:`, mErr.message);
                    }
                }
            }
        } catch (geminiErr) {
            console.warn("⚠️ [CourseAI] Gemini call failed:", geminiErr.message);
        }

        // 2. Fallback to Groq if Gemini failed
        if (!answer && process.env.GROQ_API_KEY) {
            try {
                console.log("🧠 [CourseAI] Querying Groq fallback...");
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const groqRes = await groq.chat.completions.create({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        { role: "system", content: "You are a helpful university teaching assistant." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.2
                });
                answer = groqRes.choices[0]?.message?.content || "";
            } catch (groqErr) {
                console.error("❌ [CourseAI] Groq fallback failed:", groqErr.message);
            }
        }

        if (!answer) {
            return res.status(500).json({
                error: "AI Course Tutor is temporarily unavailable. Please try again shortly."
            });
        }

        return res.status(200).json({ answer, hasCustomMaterials: hasMaterials });

    } catch (error) {
        console.error("Error in Course AI:", error);
        res.status(500).json({ error: "Failed to get answer from AI: " + error.message });
    }
};
