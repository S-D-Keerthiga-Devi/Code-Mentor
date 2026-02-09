import fs from "fs";
import { PDFParse } from "pdf-parse";
import path from "path";

const debugPdfParse = async () => {
    const filename = "1764223578491-B.Tech. CSE_AIML Syllabus 4th Year 2025-26-2.pdf";
    const filePath = path.join(process.cwd(), "backend/uploads", filename);

    console.log(`Attempting to parse: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error("File not found!");
        return;
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        await parser.destroy();
        console.log("Success!");
        console.log("Text length:", data.text.length);
    } catch (error) {
        console.error("PDF Parse Error:", error);
    }
};

debugPdfParse();
