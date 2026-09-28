import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { PaperAirplaneIcon, SparklesIcon, BookOpenIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import AppDashboardLayout from "../../components/dashboard/AppDashboardLayout";

const StudentCourseBot = () => {
    const [query, setQuery] = useState("");
    const [chatHistory, setChatHistory] = useState([
        {
            role: "assistant",
            content: "Hello! I'm your AI Course Assistant. I'm connected to your course syllabus, lecture slides, and notes. What concept or problem can I help explain today?",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        const userMessage = { role: "user", content: query };
        setChatHistory((prev) => [...prev, userMessage]);
        setQuery("");
        setLoading(true);

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

        try {
            const response = await axios.post(`${backendUrl}/api/course-materials/chat`, {
                query: userMessage.content,
            });

            const botMessage = { role: "assistant", content: response.data.answer };
            setChatHistory((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error chatting with AI:", error);
            const errDetail = error.response?.data?.error || error.message || "Please make sure the backend is active.";
            const errorMessage = {
                role: "assistant",
                content: `⚠️ ${errDetail}`,
            };
            setChatHistory((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppDashboardLayout role="student" activeKey="course-bot">
            <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl bg-slate-900/60 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden">
                {/* Chat Top Banner */}
                <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                Course Material AI Tutor
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    RAG v2.0
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">Contextual answers referenced directly from your uploaded materials</p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-slate-400 font-medium">Knowledge Base Connected</span>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {chatHistory.map((msg, index) => {
                        const isUser = msg.role === "user";
                        return (
                            <div
                                key={index}
                                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                            >
                                {!isUser && (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                                        <SparklesIcon className="w-4 h-4" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm shadow-md leading-relaxed ${
                                        isUser
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none font-medium"
                                            : "bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800"
                                    }`}
                                >
                                    {isUser ? (
                                        <p>{msg.content}</p>
                                    ) : (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    )}
                                </div>

                                {isUser && (
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                                        <UserCircleIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="flex gap-3 justify-start items-center">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                <SparklesIcon className="w-4 h-4" />
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-md">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                <span className="text-xs text-slate-400 ml-1">Searching course embeddings...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask any question regarding your course slides, syllabus, or assignments..."
                            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-sm border border-slate-700/80 rounded-xl py-3 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || loading}
                            className={`absolute right-2 p-2 rounded-lg transition-all ${
                                !query.trim() || loading
                                    ? "text-slate-600 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            }`}
                        >
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-[11px] text-slate-500 mt-2">
                        Powered by Vector RAG Embeddings & Gemini Flash. Answers are grounded in your course materials.
                    </p>
                </div>
            </div>
        </AppDashboardLayout>
    );
};

export default StudentCourseBot;
