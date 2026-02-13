// frontend/src/components/Collaboration/CollaborationRoom.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useCollaboration } from "../../hooks/useCollaboration";
import ActiveUsersList from "./ActiveUsersList";
import Navbar from "../Navbar";
import WhiteboardCanvas from "./Workspace/WhiteboardCanvas";
import ChatSidebar from "./Chat/ChatSidebar";
import EditorToggle from "./Workspace/EditorToggle";
import { useUser } from "@clerk/clerk-react";

// Monaco & Yjs Imports
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { IndexeddbPersistence } from "y-indexeddb";

const CollaborationRoom = () => {
    const { roomId } = useParams();
    const { joinRoom, isConnected, sendChatMessage } = useCollaboration();
    // Removed old code/cursor state logic as Yjs handles this now

    const { user } = useUser();
    const userName = user?.fullName || user?.firstName || "Anonymous";

    // Workspace State
    // Initialize from session storage or default to 'code'
    const [activeTab, setActiveTab] = useState(() => {
        return sessionStorage.getItem(`activeTab_${roomId}`) || "code";
    });
    const [showChat, setShowChat] = useState(true);
    const [language, setLanguage] = useState("javascript");
    const [yjsStatus, setYjsStatus] = useState("disconnected"); // 'connected', 'connecting', 'disconnected'

    // Yjs State Refs
    const editorRef = useRef(null);
    const providerRef = useRef(null);
    const persistenceRef = useRef(null);
    const docRef = useRef(null);
    const bindingRef = useRef(null);

    useEffect(() => {
        if (roomId) {
            joinRoom(roomId);
        }
    }, [roomId, joinRoom]);

    // Save active tab to session storage
    useEffect(() => {
        if (roomId) {
            sessionStorage.setItem(`activeTab_${roomId}`, activeTab);
        }
    }, [activeTab, roomId]);

    // Handle Monaco Editor Mount & Yjs Setup
    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current = editor;

        // Clean up previous instances if any (though useEffect handles unmount)
        if (docRef.current) docRef.current.destroy();
        if (providerRef.current) providerRef.current.destroy();
        if (persistenceRef.current) persistenceRef.current.destroy();

        // 1. Initialize Yjs Document
        const doc = new Y.Doc();
        docRef.current = doc;

        // 2. Initialize WebSocket Provider (Local Server)
        // Using local server for reliability
        const provider = new WebsocketProvider(
            `ws://${window.location.hostname}:1234`,
            roomId,
            doc
        );
        providerRef.current = provider;

        provider.on('status', event => {
            console.log('WebSocket Status:', event.status);
            if (event.status === 'connected') setYjsStatus('connected');
            if (event.status === 'disconnected') setYjsStatus('disconnected');
            if (event.status === 'connecting') setYjsStatus('connecting');
        });

        provider.on('connection-error', event => {
            console.error('WebSocket Connection Error:', event);
            setYjsStatus('error');
        });

        // 3. Initialize IndexedDB Persistence (Offline Support)
        const persistence = new IndexeddbPersistence(roomId, doc);
        persistenceRef.current = persistence;

        persistence.on('synced', () => {
            console.log('Content loaded from local database');
        });

        // 4. Connect Yjs to Monaco
        const type = doc.getText("monaco"); // Shared text type

        const binding = new MonacoBinding(
            type,
            editor.getModel(),
            new Set([editor]),
            provider.awareness
        );
        bindingRef.current = binding;

        // 5. Set User Awareness (Cursor & Name)
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        provider.awareness.setLocalStateField("user", {
            name: userName,
            color: randomColor,
        });

    }, [roomId, userName]);

    // Cleanup Yjs on Unmount
    useEffect(() => {
        return () => {
            if (providerRef.current) {
                providerRef.current.disconnect();
                providerRef.current.destroy();
            }
            if (persistenceRef.current) {
                persistenceRef.current.destroy();
            }
            if (docRef.current) {
                docRef.current.destroy();
            }
            if (bindingRef.current) {
                bindingRef.current.destroy();
            }
        };
    }, [roomId]); // Re-run if room changes

    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [showUsers, setShowUsers] = useState(false); // Mobile users toggle

    // Run Code Handler
    const handleRunCode = async () => {
        const editor = editorRef.current;
        if (!editor) return;

        const code = editor.getValue();
        if (!code.trim()) return;

        setIsRunning(true);
        setShowTerminal(true); // Auto-open terminal
        setOutput("Running...");

        // Map language for Piston API
        let apiLanguage = language;
        let apiVersion = "*";

        if (language === "javascript") { apiLanguage = "javascript"; apiVersion = "18.15.0"; }
        if (language === "python") { apiLanguage = "python"; apiVersion = "3.10.0"; }
        if (language === "cpp") { apiLanguage = "c++"; apiVersion = "10.2.0"; }

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: apiLanguage,
                    version: apiVersion,
                    files: [{ content: code }]
                })
            });

            const data = await response.json();

            if (data.run) {
                setOutput(data.run.output); // Piston returns combined stdout/stderr in 'output' usually, or separate
                // If output is empty, check stderr specifically? Piston v2 usually puts everything in output or stdout/stderr.
                // data.run.output is usually the combination.
            } else {
                setOutput("Error: No output returned from execution engine.");
            }

        } catch (error) {
            console.error("Execution Error:", error);
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />
            <div className="flex flex-1 overflow-hidden pt-16 relative">

                {/* Desktop Users List */}
                <div className="hidden md:flex">
                    <ActiveUsersList />
                </div>

                {/* Mobile Users Drawer */}
                {showUsers && (
                    <div className="absolute inset-0 z-40 md:hidden font-sans">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowUsers(false)}></div>
                        <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-xl transform transition-transform duration-300">
                            <ActiveUsersList />
                            <button
                                onClick={() => setShowUsers(false)}
                                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                    {/* Toolbar */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap gap-y-3 justify-between items-center shadow-sm z-10">
                        <div className="flex items-center space-x-2 md:space-x-4">
                            {/* Mobile Users Toggle */}
                            <button
                                onClick={() => setShowUsers(true)}
                                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </button>

                            <h2 className="hidden sm:flex text-lg font-bold text-gray-800 items-center">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                                Session: <span className="font-mono ml-2 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs md:text-base">{roomId}</span>
                            </h2>
                            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></span>
                                <span>{isConnected ? "Live" : "..."}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
                            {/* Workspace Toggle */}
                            <EditorToggle
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                showChat={showChat}
                                setShowChat={setShowChat}
                            />

                            <button
                                onClick={() => setShowTerminal(!showTerminal)}
                                className={`hidden sm:flex px-3 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm items-center border ${showTerminal
                                    ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                title={showTerminal ? "Hide Terminal" : "Show Terminal"}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                                Term
                            </button>

                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className={`px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm flex items-center ${isRunning ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                            >
                                {isRunning ? (
                                    <svg className="animate-spin -ml-1 sm:mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
                            </button>

                            <button className="hidden sm:flex px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Main Workspace Area (Split Pane) */}
                    <div className="flex flex-1 overflow-hidden relative">
                        {/* Editor / Whiteboard Content */}
                        <div className="flex-1 relative flex flex-col h-full bg-gray-50 p-2 sm:p-6 overflow-hidden">
                            {activeTab === 'code' ? (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden relative">
                                    {/* Editor Header */}
                                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                            <span className="hidden sm:inline text-xs text-gray-400 ml-4 font-mono">
                                                {language === 'javascript' ? 'main.js' :
                                                    language === 'cpp' ? 'main.cpp' :
                                                        language === 'python' ? 'main.py' : 'file'}
                                            </span>
                                            {/* Code Sync Status */}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ml-3 ${yjsStatus === 'connected' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {yjsStatus === 'connected' ? 'Sync: ON' : 'Connecting...'}
                                            </span>
                                        </div>

                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="text-xs border-gray-300 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        >
                                            <option value="javascript">JS</option>
                                            <option value="cpp">C++</option>
                                            <option value="python">Python</option>
                                        </select>
                                    </div>

                                    <div className="relative flex-1 bg-[#1e1e1e] overflow-hidden">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            defaultValue="// Start coding together..."
                                            theme="vs-dark"
                                            onMount={handleEditorDidMount}
                                            options={{
                                                minimap: { enabled: true },
                                                fontSize: 14,
                                                wordWrap: "on",
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                            }}
                                        />
                                    </div>

                                    {/* Terminal Section */}
                                    {showTerminal && (
                                        <div className="h-48 bg-[#1e1e1e] border-t border-gray-700 flex flex-col transition-all duration-300">
                                            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
                                                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Terminal</span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setOutput(null)}
                                                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        onClick={() => setShowTerminal(false)}
                                                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                                                {output ? (
                                                    <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                                                ) : (
                                                    <div className="text-gray-500 italic">Click "Run Code" to see output...</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full overflow-hidden relative">
                                    <WhiteboardCanvas roomId={roomId} />
                                </div>
                            )}
                        </div>

                        {/* Chat Sidebar - Responsive Overlay */}
                        {showChat && (
                            <div className={`
                                fixed inset-0 z-50 md:relative md:z-auto md:w-80 md:h-full md:block md:shadow-none
                                ${showChat ? 'block' : 'hidden'}
                            `}>
                                <div className="absolute inset-0 bg-black/50 md:hidden" onClick={() => setShowChat(false)}></div>
                                <div className="absolute inset-y-0 right-0 w-full sm:w-96 md:w-full bg-white shadow-2xl md:shadow-none h-full flex flex-col border-l border-gray-200">
                                    <ChatSidebar
                                        roomId={roomId}
                                        onClose={() => setShowChat(false)}
                                        onAiQuery={async (question) => {
                                            const editor = editorRef.current;
                                            const code = editor ? editor.getValue() : "// No code available";

                                            try {
                                                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ code, language, question })
                                                });
                                                const data = await response.json();
                                                return data.response;
                                            } catch (e) {
                                                console.error("AI Chat Error", e);
                                                return "Sorry, I couldn't process that request right now.";
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollaborationRoom;
