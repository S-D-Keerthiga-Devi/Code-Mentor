import { PDFParse } from "pdf-parse";
import fs from "fs";
import path from "path";

const testUpload = async () => {
    // Test with the actual uploaded file
    const filename = "1764223578491-B.Tech. CSE_AIML Syllabus 4th Year 2025-26-2.pdf";
    const filePath = path.join(process.cwd(), "backend/uploads", filename);

    console.log(`Testing PDF parse on: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error("File not found!");
        return;
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        console.log("Buffer size:", dataBuffer.length);

        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        await parser.destroy();

        console.log("✅ Success!");
        console.log("Text length:", result.text.length);
        console.log("First 500 chars:", result.text.substring(0, 500));
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error("Stack:", error.stack);
    }
};

testUpload();
