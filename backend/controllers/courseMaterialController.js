import CourseMaterial from "../models/CourseMaterial.js";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// Chat with Course AI
export const askCourseAI = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        // Fetch all extracted text from course materials
        // In a production app with massive data, we'd use a Vector DB.
        // For this MVP, we'll concatenate text (Gemini 1.5 Flash has a huge context window).
        const materials = await CourseMaterial.find({});
        let context = "";
        materials.forEach((material) => {
            context += `\n\n--- Source: ${material.title} ---\n${material.extractedText}`;
        });

        if (!context) {
            return res.status(404).json({ error: "No course materials found to answer from." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are a helpful and knowledgeable teaching assistant for a university course.

Your task is to help students by answering their questions based on the course materials provided below.

Guidelines:
- Answer questions directly and helpfully using the course materials
- For requests like "create a study plan" or "summarize", use the course content to provide useful, structured responses
- You can synthesize information, organize content, and provide recommendations based on what's in the materials
- If a specific detail is not in the materials, acknowledge that, but still provide helpful guidance based on what IS available
- Be encouraging and supportive in your responses

Student Question: ${query}

Course Materials:
${context}
    `;

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing");
            return res.status(500).json({ error: "Server configuration error: API key missing" });
        }

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.status(200).json({ answer: response });
    } catch (error) {
        console.error("Error in Course AI:", error);
        res.status(500).json({ error: "Failed to get answer from AI: " + error.message });
    }
};
