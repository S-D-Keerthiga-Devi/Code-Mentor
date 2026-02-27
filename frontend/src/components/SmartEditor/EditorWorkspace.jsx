import React, { useState, useEffect, useRef } from 'react';
import { useIDE } from '../../context/IDEContext';
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';
import { analyzeSocraticHeatmap } from '../../services/api';
import { VscPlay, VscBeaker, VscFiles, VscClose } from 'react-icons/vsc';

const EditorWorkspace = () => {
    const {
        activeFile,
        updateFileContent,
        sendToChat,
        executeAutoFix,
        isChatOpen,
        setIsChatOpen
    } = useIDE();

    const refs = useRef({ sendToChat, executeAutoFix, activeFile });

    useEffect(() => {
        refs.current = { sendToChat, executeAutoFix, activeFile, editorInstance, monacoInstance, clearDecorations };
    });

    const [editorInstance, setEditorInstance] = useState(null);
    const [monacoInstance, setMonacoInstance] = useState(null);
    const [dependencyLevel, setDependencyLevel] = useState("Yellow");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [decorations, setDecorations] = useState([]);

    const smellsRef = useRef([]);

    useEffect(() => {
        // When changing files, clear previous decorations
        clearDecorations();
    }, [activeFile?.id]);

    const handleEditorDidMount = (editor, monaco) => {
        setEditorInstance(editor);
        setMonacoInstance(monaco);

        if (!window._codeMentorProviders) {
            window._codeMentorProviders = true;

            // Register Commands globally
            monaco.editor.registerCommand('codeMentor.ide.readHint', (accessor, smell) => {
                toast.info(`💡 Socratic Hint:\n${smell.socraticHint}`, { position: "top-center", autoClose: false });
            });
            monaco.editor.registerCommand('codeMentor.ide.explainChat', (accessor, smell) => {
                const { sendToChat, editorInstance } = refs.current;
                if (!editorInstance) return;
                const snippet = editorInstance.getModel().getLineContent(smell.line);
                sendToChat(snippet, smell.socraticHint);
            });
            monaco.editor.registerCommand('codeMentor.ide.autoFix', async (accessor, smell) => {
                const { executeAutoFix, editorInstance, monacoInstance, clearDecorations } = refs.current;
                await executeAutoFix(smell.line, smell.type, editorInstance, monacoInstance, clearDecorations);
            });

            // Register Providers for ALL supported languages
            ['javascript', 'python'].forEach(lang => {
                monaco.languages.registerHoverProvider(lang, {
                    provideHover: function (model, position) {
                        const line = position.lineNumber;
                        const activeSmells = smellsRef.current;
                        const matchingSmells = activeSmells.filter(s => s.line === line);

                        if (matchingSmells.length > 0) {
                            const contents = matchingSmells.map(smell => {
                                let icon = "💡";
                                if (smell.type === 'security') icon = "🚨";
                                if (smell.type === 'performance') icon = "⚡";
                                return { value: `**${icon} Socratic Hint (${smell.type}):**\n\n${smell.socraticHint}` };
                            });

                            return {
                                range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
                                contents: contents
                            };
                        }
                        return null;
                    }
                });

                monaco.languages.registerCodeActionProvider(lang, {
                    provideCodeActions: (model, range, context) => {
                        const actions = [];

                        // Check if the current range intersects with any Socratic markers
                        const hasSocraticMarker = context.markers.some(marker =>
                            marker.source === 'CodeMentor Socratic' &&
                            marker.startLineNumber >= range.startLineNumber &&
                            marker.startLineNumber <= range.endLineNumber
                        );

                        if (hasSocraticMarker) {
                            // Find the exact smell from our ref that matches this range roughly
                            const activeSmells = smellsRef.current;
                            const intersectingSmells = activeSmells.filter(s =>
                                s.line >= range.startLineNumber && s.line <= range.endLineNumber
                            );

                            if (intersectingSmells.length > 0) {
                                const smell = intersectingSmells[0];

                                actions.push({
                                    title: "💡 Read Socratic Hint",
                                    kind: "quickfix",
                                    isPreferred: false,
                                    command: {
                                        id: "codeMentor.ide.readHint",
                                        title: "Read Hint",
                                        arguments: [smell]
                                    }
                                });

                                actions.push({
                                    title: "🧠 Explain Concept in Chat",
                                    kind: "quickfix",
                                    isPreferred: false,
                                    command: {
                                        id: "codeMentor.ide.explainChat",
                                        title: "Explain Chat",
                                        arguments: [smell]
                                    }
                                });

                                actions.push({
                                    title: "⚠️ Auto-Fix (Costs 1 Dependency Point)",
                                    kind: "quickfix",
                                    isPreferred: true,
                                    command: {
                                        id: "codeMentor.ide.autoFix",
                                        title: "Auto Fix",
                                        arguments: [smell]
                                    }
                                });
                            }
                        }
                        return { actions: actions, dispose: () => { } };
                    }
                });
            });
        }
    };

    const handleRunCode = () => {
        if (!activeFile?.content.trim()) {
            toast.warning("Please enter some code to run!");
            return;
        }

        // Fire custom event for TerminalPanel
        const runEvent = new CustomEvent('runCodeExecution', {
            detail: {
                code: activeFile.content,
                language: activeFile.language
            }
        });
        window.dispatchEvent(runEvent);
    };

    const handleAnalyzeHeatmap = async () => {
        if (!activeFile?.content.trim() || !editorInstance || !monacoInstance) {
            toast.warning("Please enter some code and ensure the editor is loaded!");
            return;
        }

        setIsAnalyzing(true);
        clearDecorations();

        try {
            const data = await analyzeSocraticHeatmap(activeFile.content, activeFile.language, dependencyLevel);
            if (data && data.smells && data.smells.length > 0) {
                applyDecorations(data.smells);
                toast.success(`Generated ${data.smells.length} Socratic Hints!`);
            } else {
                toast.info("No Socratic hints were returned for this code.");
            }
        } catch (err) {
            console.error("Analysis error:", err);
            const errorMessage = err.response?.data?.error || "Failed to generate Socratic Heatmap. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const applyDecorations = (smells) => {
        if (!editorInstance || !monacoInstance) return;

        // Update ref so globally registered providers instantly read the new data
        smellsRef.current = smells;

        const newDecorationsList = smells.map((smell) => {
            let colorClass = "";
            if (smell.type === "security") colorClass = "smell-security";       // Red
            else if (smell.type === "performance") colorClass = "smell-performance"; // Yellow
            else if (smell.type === "style") colorClass = "smell-style";             // Green

            return {
                range: new monacoInstance.Range(smell.line, 1, smell.line, 1),
                options: {
                    isWholeLine: true,
                    className: colorClass,
                    hoverMessage: { value: `### 🤖 Socratic Hint\n\n${smell.socraticHint}` }
                }
            };
        });

        const newDecorationIds = editorInstance.deltaDecorations(decorations, newDecorationsList);
        setDecorations(newDecorationIds);

        // Explicitly set structural markers to force the CodeAction Lightbulb to appear
        const markers = smells.map(smell => {
            let severity = monacoInstance.MarkerSeverity.Warning;
            if (smell.type === 'security') severity = monacoInstance.MarkerSeverity.Error;
            if (smell.type === 'performance') severity = monacoInstance.MarkerSeverity.Info;

            return {
                severity: severity,
                startLineNumber: smell.line,
                startColumn: 1,
                endLineNumber: smell.line,
                endColumn: editorInstance.getModel().getLineMaxColumn(smell.line),
                message: `Code Smell (${smell.type}): CodeMentor recommends review.`,
                source: 'CodeMentor Socratic'
            };
        });

        monacoInstance.editor.setModelMarkers(editorInstance.getModel(), 'socratic', markers);
    };

    const clearDecorations = () => {
        if (editorInstance) {
            if (decorations.length > 0) {
                const newDecorations = editorInstance.deltaDecorations(decorations, []);
                setDecorations(newDecorations);
            }
            if (monacoInstance) {
                monacoInstance.editor.setModelMarkers(editorInstance.getModel(), 'socratic', []);
            }
        }
    };

    if (!activeFile) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col bg-white text-gray-400 font-sans">
                <VscFiles className="text-6xl mb-4 text-gray-200" />
                <p className="text-lg text-gray-500 font-medium">No active file selected.</p>
                <p className="text-sm text-gray-400">Click a file in the Explorer or create a new one.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white font-sans">
            {/* Editor Tabs & Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-[#f8f9fa] pr-4 gap-y-2">

                {/* Active Tab */}
                <div className="flex bg-white border-t-[3px] border-[#6366f1] px-4 py-2 text-[13px] font-medium text-gray-800 cursor-pointer min-w-[140px] justify-between items-center group relative border-r border-gray-200 shadow-sm z-10">
                    <span className="truncate mr-4">{activeFile.name}</span>
                    <VscClose className="text-gray-400 hover:text-gray-800 transition" />
                </div>

                {/* Toolbar Controls */}
                <div className="flex flex-wrap items-center space-x-2 text-xs py-1">
                    <select disabled className="bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-not-allowed opacity-80">
                        <option>{activeFile.language === 'javascript' ? 'JavaScript' : 'Python'}</option>
                    </select>

                    <select
                        className="bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:bg-gray-50 transition cursor-pointer"
                        value={dependencyLevel}
                        onChange={(e) => setDependencyLevel(e.target.value)}
                    >
                        <option value="Green">Green (Low Dep)</option>
                        <option value="Yellow">Yellow (Medium Dep)</option>
                        <option value="Red">Red (High Dep)</option>
                    </select>

                    <button
                        onClick={handleAnalyzeHeatmap}
                        disabled={isAnalyzing}
                        className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md transition shadow-sm disabled:opacity-50 font-medium tracking-wide"
                    >
                        <VscBeaker size={14} />
                        <span>{isAnalyzing ? "Analyzing..." : "Analyze (Socratic)"}</span>
                    </button>

                    <button
                        onClick={handleRunCode}
                        className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-md transition shadow-sm font-medium tracking-wide"
                    >
                        <VscPlay size={14} />
                        <span>Run Code</span>
                    </button>

                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`flex items-center space-x-1.5 px-4 py-1.5 border border-gray-200 rounded-md transition shadow-sm font-medium tracking-wide ${isChatOpen ? 'bg-indigo-50 text-indigo-700' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                    >
                        <span>AI Chat</span>
                    </button>
                </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 min-h-0 relative bg-white">
                <Editor
                    height="100%"
                    language={activeFile.language}
                    value={activeFile.content}
                    onMount={handleEditorDidMount}
                    onChange={(value) => { updateFileContent(activeFile.id, value); clearDecorations(); }}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        theme: 'light', // Light Theme override
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        lineHeight: 24,
                        padding: { top: 16 },
                        OverviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible'
                        }
                    }}
                    theme="light"
                />
            </div>
        </div>
    );
};

export default EditorWorkspace;
