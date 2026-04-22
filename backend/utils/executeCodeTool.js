import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

/**
 * Executes a code snippet locally and returns the output or error.
 * @param {string} sourceCode - The full code to execute.
 * @param {string} language - The programming language (e.g., 'javascript', 'python').
 * @returns {Promise<string>} The stdout on success, or stderr/error on failure.
 */
export const executeCodeTool = async (sourceCode, language) => {
    return new Promise(async (resolve) => {
        const tempDir = os.tmpdir();
        // simple random string for file name
        const fileId = Math.random().toString(36).substring(7);

        let ext = language.toLowerCase() === "python" ? "py" : "js";
        // for mac/linux, python3 is common, fallback to python if python3 fails 
        // but node runs 'node'
        let cmd = language.toLowerCase() === "python" ? "python3" : "node";

        const filePath = path.join(tempDir, `code-${fileId}.${ext}`);

        try {
            await fs.writeFile(filePath, sourceCode);

            // 5-second timeout
            exec(`${cmd} "${filePath}"`, { timeout: 5000 }, async (error, stdout, stderr) => {
                // clean up
                await fs.unlink(filePath).catch(() => { });

                if (error) {
                    if (error.killed) {
                        resolve("Execution Error: Time Limit Exceeded (> 5s)");
                    } else {
                        // Return stderr to the agent so it can read the stack trace
                        resolve(`Execution Error:\n${stderr || error.message}`);
                    }
                    return;
                }

                // If execution succeeds but has stderr (e.g. warnings), still return stdout primarily,
                // or combine them. But usually stdout is what we care about for passing execution.
                if (stderr && !stdout) {
                    resolve(`Execution Output (Stderr):\n${stderr}`);
                } else {
                    resolve(`Execution Successful. Output:\n${stdout || "No output returned."}`);
                }
            });
        } catch (e) {
            resolve(`Internal Error setting up execution:\n${e.message}`);
        }
    });
};
