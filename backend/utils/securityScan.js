// utils/runSecurityScan.js

/**
 * Scans code for common security risks based on language-specific dangerous patterns.
 * @param {string} code - The source code to scan
 * @param {string} language - Programming language (e.g., 'javascript', 'python')
 * @returns {Promise<string[]>} - List of detected security issues
 */
export const runSecurityScan = async (code, language) => {
  if (typeof code !== "string") throw new Error("Code must be a string");
  if (!language) throw new Error("Language must be specified");

  const issues = [];

  // Define language-specific dangerous patterns
  const dangerousPatterns = {
    javascript: [
      { regex: /\beval\s*\(/, message: "Use of eval() can execute arbitrary code." },
      { regex: /\bFunction\s*\(/, message: "Dynamic Function() calls are unsafe." },
      { regex: /\bchild_process\b/, message: "child_process access can execute system commands." },
      { regex: /\bexec\s*\(/, message: "exec() execution may lead to remote code execution." },
      { regex: /\bprocess\.env\b/, message: "Accessing process.env directly may leak secrets." },
    ],
    python: [
      { regex: /\bos\.system\s*\(/, message: "os.system() can execute arbitrary shell commands." },
      { regex: /\bsubprocess\./, message: "subprocess module can run unsafe system calls." },
      { regex: /\beval\s*\(/, message: "eval() can execute arbitrary Python code." },
      { regex: /\bexec\s*\(/, message: "exec() can execute arbitrary Python code." },
      { regex: /\bopen\s*\(.*['"]w['"]/, message: "Opening files in write mode may overwrite data." },
    ],
  };

  const patterns = dangerousPatterns[language.toLowerCase()] || [];

  // Scan code for issues
  for (const { regex, message } of patterns) {
    if (regex.test(code)) {
      issues.push(message);
    }
  }

  return issues;
};
