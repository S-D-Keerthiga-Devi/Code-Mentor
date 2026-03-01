import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { autoFixCode } from './controllers/aiController.js';

const mockReq = (body) => ({ body });
const mockRes = {
    status: (code) => {
        return {
            json: (data) => console.log(`[Response ${code}]`, JSON.stringify(data))
        };
    }
};

const codeWithBug = `function add(a, b) {\n    return a - b;\n}`;

async function runTests() {
    console.log("=== Testing Auto-Fix Endpoint ===");
    console.log("Input code:");
    console.log(codeWithBug);
    await autoFixCode(
        mockReq({ 
            code: codeWithBug, 
            language: "javascript", 
            badLineNumber: 2, 
            smellType: "logic" 
        }), 
        mockRes
    );
}

runTests().then(() => console.log("\nAll tests complete.")).catch(console.error);
