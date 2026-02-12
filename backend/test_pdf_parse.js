import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
console.log("Imported pdfParse:", pdfParse);

const testParse = async () => {
    try {
        const dataBuffer = fs.readFileSync("test_valid.pdf");
        console.log("Read file buffer, length:", dataBuffer.length);

        const data = await pdfParse(dataBuffer);
        console.log("Success! Text length:", data.text.length);
        console.log("Text preview:", data.text.substring(0, 100));
    } catch (error) {
        console.error("PDF Parse Error:", error);
    }
};

testParse();
