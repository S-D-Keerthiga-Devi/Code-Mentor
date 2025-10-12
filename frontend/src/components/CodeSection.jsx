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
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter some code!");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAISuggestion(code, language);
      setSuggestion(data);
    } catch (err) {
      console.error("Error:", err);
      
      // Check if it's an authentication error
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

  const editorLanguage = language === "javascript" ? "javascript" : "python";

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Safe Code Suggestion
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get AI-powered code suggestions with built-in security scanning and syntax validation
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with language selector */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <select
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript" className="text-gray-900">JavaScript</option>
              <option value="python" className="text-gray-900">Python</option>
            </select>
          </div>
        </div>

        {/* Code Editor */}
        <div className="border-b border-gray-200">
          <Editor
            height="400px"
            defaultLanguage={editorLanguage}
            language={editorLanguage}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20, bottom: 20 },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              renderLineHighlight: 'line',
              theme: 'vs-dark'
            }}
            theme="vs-dark"
          />
        </div>

        {/* Action Button */}
        <div className="p-8 bg-gray-50">
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Code...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Get AI Suggestion</span>
                </div>
              )}
            </button>
          </div>
          
          {!code.trim() && (
            <p className="text-center text-gray-500 text-sm mt-3">
              Enter some code above to get AI-powered suggestions
            </p>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {suggestion && (
        <div className="mt-8">
          <SuggestionCard suggestion={suggestion} />
        </div>
      )}
    </section>
  );
};

export default CodeSection;
