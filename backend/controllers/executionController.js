import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const executeJudge0 = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ error: "Source code is required." });
        }

        const runLocalCode = async (sourceCode, lang) => {
            return new Promise(async (resolve) => {
                const tempDir = os.tmpdir();
                // simple random string for file name
                const fileId = Math.random().toString(36).substring(7);

                let ext = lang.toLowerCase() === "python" ? "py" : "js";
                // for mac/linux, python3 is common, fallback to python if python3 fails 
                // but node runs 'node'
                let cmd = lang.toLowerCase() === "python" ? "python3" : "node";

                const filePath = path.join(tempDir, `code-${fileId}.${ext}`);

                try {
                    await fs.writeFile(filePath, sourceCode);

                    const startTime = Date.now();
                    // 5-second timeout
                    exec(`${cmd} "${filePath}"`, { timeout: 5000 }, async (error, stdout, stderr) => {
                        const endTime = Date.now();
                        // clean up
                        await fs.unlink(filePath).catch(() => { });

                        let runStatus = "Accepted";
                        let compileOutput = "";

                        if (error) {
                            if (error.killed) {
                                runStatus = "Time Limit Exceeded";
                                compileOutput = "Execution Timed Out (> 5s)";
                            } else {
                                runStatus = "Runtime Error";
                            }
                        }

                        resolve({
                            stdout: stdout || "",
                            stderr: stderr || "",
                            compile_output: compileOutput,
                            time: ((endTime - startTime) / 1000).toFixed(3),
                            memory: "N/A",
                            status: runStatus
                        });
                    });
                } catch (e) {
                    resolve({
                        stdout: "",
                        stderr: e.message,
                        compile_output: "",
                        time: "0",
                        memory: "N/A",
                        status: "Internal Error"
                    });
                }
            });
        };

        const result = await runLocalCode(code, language);

        // Return standardized response matching frontend expectations
        return res.status(200).json({
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
            time: result.time,
            memory: result.memory,
            status: result.status
        });

    } catch (error) {
        console.error("❌ Local Execution Error:", error);
        return res.status(500).json({
            error: "Failed to execute code locally.",
            details: error.message
        });
    }
};
