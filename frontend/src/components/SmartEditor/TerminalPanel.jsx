import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { executeCode, generateCourseAPI } from '../../services/api';
import { VscChevronDown, VscChevronUp, VscClose } from 'react-icons/vsc';
import { useIDE } from '../../context/IDEContext';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

const TerminalPanel = () => {
    const { isTerminalOpen, setIsTerminalOpen } = useIDE();
    const terminalRef = useRef(null);
    const xtermInstance = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
    const [lastExecutionError, setLastExecutionError] = useState(null);
    const [lastExecutedCode, setLastExecutedCode] = useState(null);
    const [studyGuideData, setStudyGuideData] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        if (terminalRef.current && !xtermInstance.current) {
            const term = new Terminal({
                theme: {
                    background: '#ffffff', // Light background
                    foreground: '#111827', // Dark gray text
                    cursor: '#111827',
                    selectionBackground: '#e5e7eb'
                },
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontSize: 13,
                cursorBlink: true,
                disableStdin: true
            });
            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            const initTimer = setTimeout(() => {
                if (terminalRef.current && term) {
                    term.open(terminalRef.current);
                    fitAddon.fit();
                    term.writeln('\x1b[38;5;240mWelcome to CodeMentor Terminal. Local Node/Python Environment Ready.\x1b[0m');
                }
            }, 50);

            xtermInstance.current = { term, fitAddon };

            const handleResize = () => {
                try { fitAddon.fit(); } catch (e) { }
            };

            window.addEventListener('resize', handleResize);
            return () => {
                clearTimeout(initTimer);
                window.removeEventListener('resize', handleResize);
                term.dispose();
                xtermInstance.current = null;
            };
        }
    }, []);

    useEffect(() => {
        if (isTerminalOpen && xtermInstance.current) {
            setTimeout(() => {
                try { xtermInstance.current.fitAddon.fit(); } catch (e) { }
            }, 50);
        }
    }, [isTerminalOpen]);

    useEffect(() => {
        const handleRunExecution = async (event) => {
            const { code, language } = event.detail;
            setIsRunning(true);
            setLastExecutionError(null);
            setLastExecutedCode(code);


            const term = xtermInstance.current?.term;
            if (term) {
                term.clear();
                term.writeln('\x1b[38;5;214mExecuting...\x1b[0m');
            }

            try {
                const result = await executeCode(code, language);

                if (term) {
                    term.clear();
                    if (result.success) {
                        const outputStr = result.output || "Success (No Output)";
                        term.writeln(`\r\n${outputStr.replace(/\n/g, '\r\n')}`);
                        
                        // JDoodle returns success=true even if the script throws a runtime error.
                        // We check the output for common error signatures to correctly toggle our UI.
                        const errorKeywords = ['ReferenceError:', 'SyntaxError:', 'TypeError:', 'Error:', 'at node:internal', 'Exception in thread', 'Traceback (most recent call last):'];
                        const isErrorOutput = errorKeywords.some(keyword => outputStr.includes(keyword));
                        
                        if (isErrorOutput) {
                            setLastExecutionError(outputStr);
                        }

                        if (result.memory !== undefined) {
                            term.writeln(`\r\n\x1b[36m⏱️ CPU Time: ${result.time || "0.00"}s | 💾 Memory: ${result.memory} KB\x1b[0m`);
                        }
                    } else {
                        const errorMsg = result.output || result.error || "Execution failed.";
                        term.writeln(`\x1b[31mError:\x1b[0m\r\n${errorMsg.replace(/\n/g, '\r\n')}`);
                        setLastExecutionError(errorMsg);
                    }
                }
            } catch (err) {
                if (term) {
                    term.clear();
                    term.writeln('\x1b[31mExecution service is currently unavailable.\x1b[0m');
                    setLastExecutionError(err.message || 'Execution service unavailable');
                }
            } finally {
                setIsRunning(false);
            }
        };

        window.addEventListener('runCodeExecution', handleRunExecution);
        return () => window.removeEventListener('runCodeExecution', handleRunExecution);
    }, []);

    const handleGenerateCourse = async () => {
        if (!lastExecutedCode || !lastExecutionError) return;
        
        if (!isLoaded || !isSignedIn) {
            toast.error("You must be signed in to generate a study guide.");
            return;
        }
        
        setIsGeneratingCourse(true);
        const studentName = user?.fullName || user?.firstName || "Anonymous Student";
        const email = user?.primaryEmailAddress?.emailAddress;
        
        try {
            const response = await generateCourseAPI(studentName, email, lastExecutedCode, lastExecutionError, "beginner");
            if (response && response.blueprint) {
                setStudyGuideData(response.blueprint);
                setIsDrawerOpen(true);
                toast.success("Study guide analyzed! Check the drawer.");
            } else {
                toast.success("Course generating in background! Check your Google Drive shortly.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to trigger course generation. Please try again.");
        } finally {
            setIsGeneratingCourse(false);
        }
    };

    return (
        <div className="flex flex-col flex-shrink-0 font-sans border-t border-gray-200">
            {/* The Toggle Bar (Visible when collapsed) */}
            {!isTerminalOpen && (
                <div
                    className="bg-gray-50 px-4 py-1.5 flex items-center cursor-pointer hover:bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-widest select-none transition-colors"
                    onClick={() => setIsTerminalOpen(true)}
                >
                    <VscChevronUp className="mr-2" size={14} />
                    Terminal
                </div>
            )}

            {/* The expanded terminal */}
            <div className={`flex flex-col bg-white ${isTerminalOpen ? 'h-[180px]' : 'hidden'}`}>
                <div className="px-4 py-2 bg-gray-50 text-gray-800 text-xs font-bold uppercase tracking-widest flex justify-between items-center border-b border-gray-200">
                    <span>TERMINAL OUTPUT</span>
                    <div className="flex items-center space-x-3 text-gray-500">
                        {isRunning && <span className="text-yellow-600 animate-pulse text-[11px]">Executing...</span>}
                        <VscClose className="cursor-pointer hover:text-black transition-colors" size={16} onClick={() => setIsTerminalOpen(false)} />
                    </div>
                </div>

                {/* Terminal Canvas */}
                <div className="flex-1 w-full px-4 py-2 overflow-hidden bg-white">
                    <div ref={terminalRef} className="h-full w-full" />
                </div>

                {/* Generate Course Action */}
                {lastExecutionError && !isRunning && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
                        <span className="text-red-600 text-xs font-medium">Execution failed. Need help understanding this error?</span>
                        <button
                            onClick={handleGenerateCourse}
                            disabled={isGeneratingCourse}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-4 rounded shadow-sm transition-colors flex items-center disabled:opacity-50"
                        >
                            {isGeneratingCourse ? (
                                <span className="animate-pulse">🤖 Analyzing code...</span>
                            ) : (
                                "📚 Generate Custom Study Guide"
                            )}
                        </button>
                    </div>
                )}

                {/* Execution Stats Footer matching image exactly */}
                <div className="px-4 py-1.5 border-t border-gray-100 bg-white text-gray-500 font-mono text-xs flex items-center">
                    <span>Serverless Execution (Powered by JDoodle)</span>
                </div>
            </div>
            {/* Slide-out Drawer for Study Guide */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Your Custom Study Guide</h2>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors outline-none">
                        <VscClose size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-gray-50/50">
                    {studyGuideData && (
                        <>
                            <div>
                                <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Identified Weakness</h3>
                                <p className="text-gray-700 text-sm leading-relaxed bg-indigo-50/80 p-4 rounded-xl border border-indigo-100 shadow-sm">
                                    {studyGuideData.identified_weakness}
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Recommended Syllabus</h3>
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <ol className="list-decimal list-outside ml-4 text-sm text-gray-700 space-y-3">
                                        {studyGuideData.syllabus_outline?.map((item, index) => (
                                            <li key={index} className="pl-1 leading-relaxed">{item}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button 
                        onClick={() => window.open('https://docs.google.com/document/u/0/', '_blank', 'noopener,noreferrer')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        📄 Open Google Docs to View Full Guide
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Note: Your guide is being generated in the background. It will appear at the top of your recent documents and in your email inbox within a few seconds.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
