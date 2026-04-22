import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const StudentCourseBot = () => {
    const [query, setQuery] = useState("");
    const [chatHistory, setChatHistory] = useState([
        {
            role: "assistant",
            content: "Hello! I'm your Course Assistant. Ask me anything about your course materials.",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage = { role: "user", content: query };
        setChatHistory((prev) => [...prev, userMessage]);
        setQuery("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/course-materials/chat", {
                query: userMessage.content,
            });

            const botMessage = { role: "assistant", content: response.data.answer };
            setChatHistory((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error chatting with AI:", error);
            const errorMessage = {
                role: "assistant",
                content: "Sorry, I encountered an error while searching the course materials. Please try again.",
            };
            setChatHistory((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 mb-20">
            <Navbar />

            <div className="flex flex-col flex-1">
                {/* Header */}
                <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Course AI Assistant
                    </h1>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                        }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <div className="prose prose-sm max-w-none prose-p:text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:text-pink-600 prose-pre:bg-gray-100 prose-pre:text-gray-800">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 flex items-center space-x-2 shadow-sm">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 border-t border-gray-200">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask a question about your course materials..."
                                className="w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!query.trim() || loading}
                                className={`absolute right-2 p-2 rounded-full transition-colors ${!query.trim() || loading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-600 hover:bg-gray-100"
                                    }`}
                            >
                                <PaperAirplaneIcon className="h-6 w-6" />
                            </button>
                        </form>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            AI can make mistakes. Verify important information from original materials.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StudentCourseBot;
