import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. The Enhanced MCP Tool Schema
const generateBootcampTool = {
    name: "provision_ephemeral_bootcamp",
    description: "Generate a dynamic study plan, Google Doc structure, and specific search queries for a student struggling with code.",
    parameters: {
        type: "object",
        properties: {
            identified_weakness: {
                type: "string",
                description: "What the student did wrong (e.g., 'O(N^2) Nested Loops' or 'Syntax Error in Array Initialization')"
            },
            google_doc_title: {
                type: "string",
                description: "A motivating title for the generated Google Doc."
            },
            youtube_search_queries: {
                type: "array",
                items: { type: "string" },
                description: "2 highly specific YouTube search queries to find video tutorials."
            },
            article_search_queries: {
                type: "array",
                items: { type: "string" },
                description: "2 specific Google Search queries to find articles/documentation (e.g., MDN Web Docs)."
            },
            syllabus_outline: {
                type: "array",
                items: { type: "string" },
                description: "A 3-step learning progression (e.g., ['1. Understanding Variables', '2. Intro to Loops', '3. Fixing your code'])."
            }
        },
        required: ["identified_weakness", "google_doc_title", "youtube_search_queries", "article_search_queries", "syllabus_outline"]
    }
};

export const triggerCourseGeneration = async (req, res) => {
    try {
        // Data coming from your React frontend / JDoodle execution
        const studentName = req.body.studentName || "Keerthiga";
        const codeSnippet = req.body.code || "let x = 10; x.map(i => console.log(i));";
        const jdoodleError = req.body.jdoodleError || "TypeError: x.map is not a function";
        const experienceLevel = req.body.experienceLevel || "beginner"; // "beginner" or "advanced"

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ functionDeclarations: [generateBootcampTool] }],
        });

        // 2. The Dynamic Prompt
        const prompt = `
            You are a Senior Engineering Mentor. 
            Student Name: ${studentName}
            Experience Level: ${experienceLevel}
            
            They just ran this code via JDoodle:
            ${codeSnippet}
            
            It resulted in this output/error:
            ${jdoodleError}
            
            Analyze the failure. Because they are a ${experienceLevel}, adjust your technical vocabulary. 
            Use your 'provision_ephemeral_bootcamp' tool to generate the blueprint for a custom course.
        `;

        console.log("🤖 Analyzing code and generating course blueprint...");
        const result = await model.generateContent(prompt);
        const functionCall = result.response.functionCalls()?.[0];

        if (functionCall && functionCall.name === "provision_ephemeral_bootcamp") {
            const blueprintData = functionCall.args;
            
            // 3. Send the blueprint to n8n Webhook
            const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
            
            await axios.post(n8nWebhookUrl, {
                student: studentName,
                level: experienceLevel,
                blueprint: blueprintData
            });

            return res.status(200).json({ 
                success: true, 
                message: "Course blueprint sent to n8n! Generating Google Doc...",
                blueprint: blueprintData
            });
        } else {
            return res.status(200).json({ message: "No bootcamp needed. Code might be fine." });
        }

    } catch (error) {
        console.error("Error generating bootcamp:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};