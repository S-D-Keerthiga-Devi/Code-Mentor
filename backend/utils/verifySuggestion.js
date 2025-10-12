// backend/utils/verifySuggestion.js
import { execSync, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { runSecurityScan } from "./securityScan.js";

/**
 * Verifies a suggested code snippet for syntax, runtime safety, and security issues.
 * @param {string} suggestion - The AI-suggested code
 * @param {string} contextCode - Context code to combine with the suggestion
 * @param {string} language - Programming language ("javascript" or "python")
 * @returns {Promise<object>} - Verification result including confidence and details
 */
export const verifySuggestion = async (suggestion, contextCode = "", language) => {
  const combinedCode = `${contextCode}\n${suggestion}`;
  let syntaxValid = false;
  let runtimeSafe = false;
  let securityIssues = [];
  let confidence = 0.0;
  let details = "";

  try {
    // =========================
    // 1️⃣ Syntax Validation
    // =========================
    if (language.toLowerCase() === "javascript") {
      try {
        const check = spawnSync("node", ["--check"], {
          input: combinedCode,
          encoding: "utf-8",
        });
        if (check.status === 0) {
          syntaxValid = true;
          confidence += 0.5;
          details += "✅ JavaScript syntax valid. ";
        } else {
          details += `⚠️ JS syntax error: ${check.stderr.trim()}. `;
        }
      } catch (err) {
        details += "⚠️ Failed to validate JavaScript syntax. ";
      }
    } else if (language.toLowerCase() === "python") {
      const tmpFile = path.join(os.tmpdir(), `verify_${Date.now()}.py`);
      fs.writeFileSync(tmpFile, combinedCode);
      try {
        execSync(`python3 -m py_compile ${tmpFile}`);
        syntaxValid = true;
        confidence += 0.5;
        details += "✅ Python syntax valid. ";
      } catch (err) {
        details += `⚠️ Python syntax error: ${err.message}. `;
      } finally {
        fs.unlinkSync(tmpFile);
      }
    }

    // =========================
    // 2️⃣ Runtime Safety Check
    // =========================
    try {
      if (language.toLowerCase() === "javascript") {
        const check = spawnSync("node", ["--check"], {
          input: combinedCode,
          encoding: "utf-8",
        });
        runtimeSafe = check.status === 0;
        confidence += runtimeSafe ? 0.3 : 0;
        details += runtimeSafe
          ? "✅ JS runtime check passed. "
          : `❌ JS runtime check failed: ${check.stderr.trim()}. `;
      } else if (language.toLowerCase() === "python") {
        const check = spawnSync("python3", ["-m", "py_compile", "-"], {
          input: combinedCode,
          encoding: "utf-8",
        });
        runtimeSafe = check.status === 0;
        confidence += runtimeSafe ? 0.3 : 0;
        details += runtimeSafe
          ? "✅ Python runtime check passed. "
          : `❌ Python runtime check failed: ${check.stderr.trim()}. `;
      }
    } catch (err) {
      details += `❌ Runtime verification error: ${err.message}. `;
    }

    // =========================
    // 3️⃣ Security Scan
    // =========================
    try {
      securityIssues = await runSecurityScan(combinedCode, language);
      if (securityIssues.length > 0) {
        details += `⚠️ Security warnings: ${securityIssues.join(", ")}. `;
      } else {
        confidence += 0.2;
        details += "✅ No security risks detected. ";
      }
    } catch (err) {
      details += `⚠️ Security scan failed: ${err.message}. `;
    }

  } catch (err) {
    details += `🚨 Verification process error: ${err.message}. `;
  }

  return {
    syntaxValid,
    runtimeSafe,
    securityIssues,
    confidence: Math.min(confidence, 1.0),
    details: details.trim(),
  };
};
