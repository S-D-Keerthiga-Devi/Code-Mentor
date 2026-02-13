import React, { useState, useEffect, useRef } from "react";
import { useCollaboration } from "../../../hooks/useCollaboration";
import { Send, X } from "lucide-react";

const ChatSidebar = ({ roomId, onClose, onAiQuery }) => {
    const { chatMessages, sendChatMessage } = useCollaboration();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const content = newMessage.trim();
            setNewMessage("");

            if (content.startsWith("/ai ")) {
                // 1. Send user message first
                sendChatMessage(roomId, content);
                const question = content.replace("/ai ", "");

                // 2. Show optimistic "AI is typing..." (Local only or broadcast?)
                // Requirement says send result via Socket.io, so all see it.
                // For "typing", we can just wait or perhaps add a temporary local message.

                if (onAiQuery) {
                    // Optional: You could broadcast a "System: AI is thinking..." message here if desired

                    const answer = await onAiQuery(question);

                    if (answer) {
                        sendChatMessage(roomId, `🤖 **AI Mentor:**\n${answer}`);
                    }
                }
            } else {
                // Normal chat
                sendChatMessage(roomId, content);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80 shadow-xl z-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">Room Chat</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition text-gray-500">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {chatMessages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No messages yet. Say hello! 👋
                    </div>
                )}

                {chatMessages.map((msg, index) => {
                    const isSystem = msg.username === 'System';
                    return (
                        <div key={index} className={`flex flex-col ${isSystem ? 'items-center my-2' : 'items-start'}`}>
                            {isSystem ? (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{msg.message}</span>
                            ) : (
                                <div className={`p-3 rounded-lg rounded-tl-none shadow-sm border max-w-[90%] ${msg.message.startsWith("🤖 **AI Mentor:**")
                                    ? "bg-indigo-50 border-indigo-200"
                                    : "bg-white border-gray-100"
                                    }`}>
                                    <p className="text-xs font-bold text-indigo-600 mb-0.5">{msg.username}</p>
                                    <div className="text-sm text-gray-800 break-words whitespace-pre-wrap leading-relaxed">
                                        {msg.message.split('\n').map((line, i) => (
                                            <div key={i} className={`${line.trim().startsWith('-') || line.trim().startsWith('* ') ? 'pl-4' : ''} mb-1`}>
                                                {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                                    part.startsWith('**') && part.endsWith('**')
                                                        ? <strong key={j} className="font-semibold text-indigo-700">{part.slice(2, -2)}</strong>
                                                        : part
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 block text-right mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message or /ai [question]..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatSidebar;
