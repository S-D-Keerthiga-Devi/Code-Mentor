// utils/scoreSuggestion.js

/**
 * Scores an AI suggestion based on syntax validity, runtime safety, and security issues.
 * @param {Object} suggestionObj - AI suggestion object
 * @param {boolean} suggestionObj.valid - Whether code is syntactically and logically valid
 * @param {Array} suggestionObj.securityIssues - List of security or best-practice issues
 * @param {string} suggestionObj.reasoning - Detailed explanation from AI
 * @returns {Object} - { confidence: Number (0-1), reasoning: String }
 */
export const scoreSuggestion = ({ valid = false, securityIssues = [], reasoning = "" }) => {
  let confidence = 0;
  let explanation = "";

  // 🧩 Assign weighted confidence scores
  if (valid) {
    confidence += 0.8; // main weight for overall validity
    explanation += "✅ Code is valid. ";
  } else {
    explanation += "❌ Code contains errors. ";
  }

  if (securityIssues.length === 0) {
    confidence += 0.2;
    explanation += "✅ No security risks detected. ";
  } else {
    explanation += `⚠️ Security issues: ${securityIssues.join(", ")}. `;
  }

  // Include AI reasoning details if available
  if (reasoning) explanation += `📝 Details: ${reasoning}`;

  // Clamp confidence between 0 and 1
  confidence = Math.min(1, Math.max(0, confidence));

  return { confidence, reasoning: explanation.trim() };
};
