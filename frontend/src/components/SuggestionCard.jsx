import React from "react";

const SuggestionCard = ({ suggestion }) => {
  if (!suggestion) return null;

  return (
    <div className="mt-6 p-4 border rounded bg-white shadow">
      <h3 className="font-semibold mb-2">AI Suggestion:</h3>
      <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{suggestion.suggestion}</pre>

      <p className="mt-2"><strong>Valid:</strong> {suggestion.valid ? "✅ Yes" : "❌ No"}</p>
      <p><strong>Confidence:</strong> {suggestion.confidence}</p>
      <p><strong>Reasoning:</strong> {suggestion.reasoning}</p>
      {suggestion.securityIssues?.length > 0 && (
        <p><strong>Security Warnings:</strong> {suggestion.securityIssues.join(", ")}</p>
      )}
    </div>
  );
};

export default SuggestionCard;
