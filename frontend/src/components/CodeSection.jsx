import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getAISuggestion } from "../services/api";
import SuggestionCard from "./SuggestionCard";

const CodeSection = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const exampleCode = {
    javascript: `// Example: Sort an array of numbers
const numbers = [64, 34, 25, 12, 22, 11, 90];
// Add your sorting logic here`,
    python: `# Example: Find factorial of a number
def factorial(n):
    # Add your implementation here
    pass`
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter some code!");
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuccess(false);

    try {
      const data = await getAISuggestion(code, language);
      setSuggestion(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error:", err);

      if (err.response?.status === 401 || err.response?.data?.message?.includes("Not Authorized")) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Please login to continue using the Smart Code Assistant',
              redirectTo: '/safe-suggest'
            }
          });
        }, 2000);
      } else {
        setError("Failed to get AI suggestion. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setCode(exampleCode[language]);
    setError(null);
  };

  const clearCode = () => {
    setCode("");
    setSuggestion(null);
    setError(null);
  };

  const editorLanguage = language === "javascript" ? "javascript" : "python";

  return (
    <section className="max-w-7xl mx-auto px-6 py-1 mb-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Smart Code Assistant
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Get AI-powered code suggestions with built-in security scanning, syntax validation, and best practice recommendations
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Security Scanning</h3>
          <p className="text-sm text-gray-600">Automatic detection of potential security vulnerabilities</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Syntax Validation</h3>
          <p className="text-sm text-gray-600">Real-time syntax checking and error detection</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
          <p className="text-sm text-gray-600">Advanced AI suggestions for code improvement</p>
        </div>
      </div>

      {/* Main Editor Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with controls */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <span className="text-white font-medium text-sm">Code Editor</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                className="flex-1 sm:flex-none bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript" className="text-gray-900">JavaScript</option>
                <option value="python" className="text-gray-900">Python</option>
              </select>
              <button
                onClick={loadExample}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Load Example
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="border-b border-gray-200">
          <Editor
            height="450px"
            defaultLanguage={editorLanguage}
            language={editorLanguage}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: 'all',
              theme: 'vs-dark',
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontLigatures: true,
            }}
            theme="vs-dark"
          />
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Code...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Get AI Suggestion</span>
                </div>
              )}
            </button>
            {code.trim() && (
              <button
                onClick={clearCode}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear Code
              </button>
            )}
          </div>

          {!code.trim() && !error && (
            <p className="text-center text-gray-500 text-sm mt-4">
              💡 Enter your code above or click "Load Example" to get started
            </p>
          )}

          {showSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 text-sm font-medium">✨ Suggestion generated successfully!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestion Result */}
      {suggestion && (
        <div className="mt-8 animate-fade-in">
          <SuggestionCard suggestion={suggestion} />
        </div>
      )}
    </section>
  );
};

export default CodeSection;
