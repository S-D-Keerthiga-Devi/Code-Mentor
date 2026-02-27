import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIDE } from '../../context/IDEContext';
import { getAiAssistance } from '../../services/api';
import { VscClose, VscSend, VscRobot } from 'react-icons/vsc';
import ReactMarkdown from 'react-markdown';

const AIChatPanel = () => {
    const { isChatOpen, setIsChatOpen, chatMessages, setChatMessages, activeFile } = useIDE();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    useEffect(() => {
        if (chatMessages.length > 0) {
            const lastMsg = chatMessages[chatMessages.length - 1];
            if (lastMsg.sender === 'user' && !lastMsg.responded) {
                setChatMessages(prev => prev.map((msg, idx) =>
                    idx === prev.length - 1 ? { ...msg, responded: true } : msg
                ));
                handleChatSubmission(lastMsg.text);
            }
        }
    }, [chatMessages]);

    const handleChatSubmission = async (textToProcess) => {
        setIsLoading(true);

        try {
            const data = await getAiAssistance(
                activeFile?.content || '',
                activeFile?.language || 'javascript',
                textToProcess,
                "SmartIDE_Session"
            );

            const aiResponse = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data?.reply || "I'm sorry, I couldn't process that request."
            };

            setChatMessages(prev => [...prev, aiResponse]);
        } catch (err) {
            console.error("Chat Error:", err);
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Error connecting to AI service."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input, responded: true };
        setChatMessages(prev => [...prev, userMsg]);
        handleChatSubmission(input);
        setInput('');
    };

    // 始终保持 ChatPanel 打开以匹配设计图 (或可以根据 isChatOpen 的状态)
    // 因为是从截图中看到的布局, 设计图里它是始终占位的右侧面板.

    if (!isChatOpen) return null;

    return (
        <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0 font-sans shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)] z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center text-gray-800 tracking-wider text-[12px] font-bold uppercase">
                    <span>AI ASSISTANT</span>
                </div>
                <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-400 hover:text-gray-800 transition"
                >
                    <VscClose size={18} />
                </button>
            </div>

            {/* Messages / Empty State */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-white">
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center">
                        {/* Header SVG Space */}
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">💡</span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Smart Code Assistant</h2>
                        <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-8 px-2 font-medium">
                            Get AI-powered code suggestions with built-in security scanning, syntax validation, and best practice recommendations
                        </p>

                        <div className="space-y-4 w-full">
                            {/* Feature 1 */}
                            <div className="border border-gray-100 shadow-sm rounded-xl p-4 bg-white hover:border-gray-200 transition">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-[14px]">Security Scanning <span className="text-green-500 text-xs font-semibold ml-1">(Active)</span></h3>
                                <p className="text-gray-500 text-[12px] mt-1 leading-relaxed">Automatic detection of potential security vulnerabilities</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="border border-gray-100 shadow-sm rounded-xl p-4 bg-white hover:border-gray-200 transition">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-[14px]">Syntax Validation <span className="text-emerald-500 text-xs font-semibold ml-1">(Real-time)</span></h3>
                                <p className="text-gray-500 text-[12px] mt-1 leading-relaxed">Real-time syntax checking and error detection</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="border border-gray-100 shadow-sm rounded-xl p-4 bg-white hover:border-gray-200 transition">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-[14px]">AI-Powered Suggestions <span className="text-emerald-500 text-xs font-semibold ml-1">(Ready)</span></h3>
                                <p className="text-gray-500 text-[12px] mt-1 leading-relaxed">Advanced AI suggestions for code improvement</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-4 text-[13px] overflow-x-auto ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md'
                                    : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 leading-relaxed shadow-sm'
                                    }`}>
                                    {msg.sender === 'user' ? (
                                        <pre className="whitespace-pre-wrap font-sans font-medium">{msg.text}</pre>
                                    ) : (
                                        <div className="prose prose-sm prose-gray max-w-none">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 rounded-tl-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSubmit} className="relative">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 transition focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
                        <button
                            type="button"
                            className="pl-3 text-gray-400 hover:text-gray-600 transition"
                            title="Attach File"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AI about your code..."
                            className="w-full bg-transparent text-gray-700 placeholder-gray-400 px-3 py-3 text-[13px] font-medium focus:outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="pr-4 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition"
                        >
                            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIChatPanel;
