import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodePanel = ({ code, language, activeLine, onChange, onEditorClick }) => {
    const editorRef = useRef(null);
    const decorationsRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Listen to mousedown events to clear the highlight
        editor.onMouseDown(() => {
            if (onEditorClick) {
                onEditorClick();
            }
        });
    };

    // Highlight the active line when it changes
    useEffect(() => {
        if (!editorRef.current) return;
        const editor = editorRef.current;

        // Clear existing decorations
        if (decorationsRef.current) {
            decorationsRef.current.clear();
        }

        if (activeLine) {
            editor.revealLineInCenter(activeLine);
            editor.setPosition({ lineNumber: activeLine, column: 1 });

            // Create new decoration and save the reference
            decorationsRef.current = editor.createDecorationsCollection([
                {
                    range: new window.monaco.Range(activeLine, 1, activeLine, 1),
                    options: {
                        isWholeLine: true,
                        className: 'bg-indigo-50 border-l-4 border-indigo-500',
                        marginClassName: 'bg-indigo-100/50'
                    }
                }
            ]);
        }
    }, [activeLine]);

    return (
        <div className="w-full h-full bg-white flex flex-col border-r border-slate-200 shadow-sm z-10 relative">
            <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10">
                <span className="text-sm font-bold text-slate-700 tracking-wide">index.js</span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider">{language || 'text'}</span>
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language || "javascript"}
                    theme="light"
                    value={code || ""}
                    onChange={(value) => onChange?.(value)}
                    options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        scrollbar: { alwaysConsumeMouseWheel: false, handleMouseWheel: false },
                    }}
                    onMount={handleEditorDidMount}
                />
            </div>
        </div>
    );
};

export default CodePanel;
