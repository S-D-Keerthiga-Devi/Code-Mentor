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
                        
                        // The backend sends a clean `isError` flag for ALL JDoodle failures
                        // (timeout, crash, runtime error). We trust this instead of guessing.
                        if (result.isError) {
                            setLastExecutionError(outputStr);
                        }

                        const memoryDisplay = result.memory !== null ? `${result.memory} KB` : 'N/A';
                        term.writeln(`\r\n\x1b[36m⏱️ CPU Time: ${result.time || "0.00"}s | 💾 Memory: ${memoryDisplay}\x1b[0m`);
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

    const [copied, setCopied] = useState(false);

    const handleGenerateCourse = async () => {
        if (!lastExecutedCode || !lastExecutionError) return;
        
        if (!isLoaded || !isSignedIn) {
            toast.error("You must be signed in to generate a study guide.");
            return;
        }
        
        setIsGeneratingCourse(true);
        const studentName = user?.fullName || user?.firstName || "Student";
        const email = user?.primaryEmailAddress?.emailAddress;
        
        try {
            const response = await generateCourseAPI(studentName, email, lastExecutedCode, lastExecutionError, "beginner");
            if (response && response.blueprint) {
                setStudyGuideData(response.blueprint);
                setIsDrawerOpen(true);
                if (response.emailDelivered) {
                    toast.success(`Study guide generated & emailed to ${response.targetEmail || email}!`);
                } else {
                    toast.success("Study guide analyzed! Check the drawer.");
                }
            } else {
                toast.success("Study guide generated! Check the drawer.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to trigger course generation. Please try again.");
        } finally {
            setIsGeneratingCourse(false);
        }
    };

    const handleCopyStudyGuide = () => {
        if (!studyGuideData) return;
        const videosList = (studyGuideData.direct_videos?.length ? studyGuideData.direct_videos.map(v => `- [${v.title} (${v.channel || 'YouTube'})](${v.url})`) : (studyGuideData.youtube_search_queries || []).map(q => `- [${q}](https://www.youtube.com/results?search_query=${encodeURIComponent(q)})`)).join('\n');
        const articlesList = (studyGuideData.direct_articles?.length ? studyGuideData.direct_articles.map(a => `- [${a.title} (${a.source || 'Official Docs'})](${a.url})`) : (studyGuideData.article_search_queries || []).map(q => `- [${q}](https://www.google.com/search?q=${encodeURIComponent(q + ' MDN')})`)).join('\n');

        const text = `# ${studyGuideData.google_doc_title || 'Custom Study Guide'}\n\n` +
            `## Identified Weakness\n${studyGuideData.identified_weakness}\n\n` +
            `## Recommended Syllabus\n${(studyGuideData.syllabus_outline || []).map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, '')}`).join('\n')}\n\n` +
            (videosList ? `## Recommended Video Tutorials\n${videosList}\n\n` : '') +
            (articlesList ? `## Official Documentation & Guides\n${articlesList}\n` : '');

        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.info("Study guide copied to clipboard in Markdown format!");
        setTimeout(() => setCopied(false), 2500);
    };

    const handleDownloadMarkdown = () => {
        if (!studyGuideData) return;
        const videosList = (studyGuideData.direct_videos?.length ? studyGuideData.direct_videos.map(v => `- [${v.title} (${v.channel || 'YouTube'})](${v.url})`) : (studyGuideData.youtube_search_queries || []).map(q => `- [${q}](https://www.youtube.com/results?search_query=${encodeURIComponent(q)})`)).join('\n');
        const articlesList = (studyGuideData.direct_articles?.length ? studyGuideData.direct_articles.map(a => `- [${a.title} (${a.source || 'Official Docs'})](${a.url})`) : (studyGuideData.article_search_queries || []).map(q => `- [${q}](https://www.google.com/search?q=${encodeURIComponent(q + ' MDN documentation')})`)).join('\n');

        const text = `# ${studyGuideData.google_doc_title || 'Custom Study Guide'}\n\n` +
            `> Generated by Code Mentor AI\n\n` +
            `## 🎯 Identified Weakness & Root Cause\n${studyGuideData.identified_weakness}\n\n` +
            `## 📋 Recommended Learning Syllabus\n${(studyGuideData.syllabus_outline || []).map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, '')}`).join('\n')}\n\n` +
            (videosList ? `## 📺 Video Tutorials\n${videosList}\n\n` : '') +
            (articlesList ? `## 📚 Documentation & Concepts\n${articlesList}\n` : '');

        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'CodeMentor-Study-Guide.md');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Downloaded CodeMentor-Study-Guide.md");
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

                {/* Execution Stats Footer */}
                <div className="px-4 py-1.5 border-t border-gray-100 bg-white text-gray-500 font-mono text-xs flex items-center justify-between">
                    <span>Serverless Execution (Powered by JDoodle)</span>
                    {studyGuideData && (
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="text-indigo-600 hover:text-indigo-800 font-sans font-semibold text-xs transition-colors"
                        >
                            📖 View Study Guide Drawer →
                        </button>
                    )}
                </div>
            </div>

            {/* Slide-out Drawer for Study Guide */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg md:max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🎓</span>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Personalized Study Guide</h2>
                            <p className="text-xs text-gray-500">AI Remediation Blueprint</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsDrawerOpen(false)} 
                        className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors outline-none"
                    >
                        <VscClose size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/70">
                    {studyGuideData && (
                        <>
                            {/* Identified Weakness */}
                            <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                    <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Identified Weakness & Root Cause</h3>
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed bg-indigo-50/70 p-3.5 rounded-lg border border-indigo-100">
                                    {studyGuideData.identified_weakness}
                                </p>
                            </div>
                            
                            {/* Recommended Syllabus */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Step-by-Step Remediation Syllabus</h3>
                                </div>
                                <div className="space-y-2.5">
                                    {studyGuideData.syllabus_outline?.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-sm text-gray-800">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <span className="leading-snug pt-0.5">{item.replace(/^\d+\.\s*/, '')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Direct Video Tutorials */}
                            {((studyGuideData.direct_videos && studyGuideData.direct_videos.length > 0) || (studyGuideData.youtube_search_queries && studyGuideData.youtube_search_queries.length > 0)) && (
                                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                        <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Curated Video Tutorials (Direct Links)</h3>
                                    </div>
                                    <div className="space-y-2.5">
                                        {studyGuideData.direct_videos && studyGuideData.direct_videos.length > 0 ? (
                                            studyGuideData.direct_videos.map((vid, index) => (
                                                <a
                                                    key={index}
                                                    href={vid.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3.5 rounded-lg bg-red-50/70 hover:bg-red-100/90 border border-red-100 text-red-950 text-xs font-medium transition-all group"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className="text-base flex-shrink-0">▶️</span>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 group-hover:text-red-700 truncate">{vid.title}</p>
                                                            <p className="text-[11px] text-red-600 font-normal">{vid.channel || "YouTube Tutorial"}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-red-600 font-bold bg-white px-2.5 py-1 rounded shadow-xs group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2 border border-red-100">
                                                        Watch ↗
                                                    </span>
                                                </a>
                                            ))
                                        ) : (
                                            studyGuideData.youtube_search_queries.map((query, index) => (
                                                <a
                                                    key={index}
                                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 rounded-lg bg-red-50/60 hover:bg-red-100/80 border border-red-100 text-red-900 text-xs font-medium transition-all group"
                                                >
                                                    <span className="flex items-center gap-2 truncate">
                                                        <span>▶️</span>
                                                        <span className="truncate">{query}</span>
                                                    </span>
                                                    <span className="text-red-500 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2">Watch ↗</span>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Direct Documentation & Articles */}
                            {((studyGuideData.direct_articles && studyGuideData.direct_articles.length > 0) || (studyGuideData.article_search_queries && studyGuideData.article_search_queries.length > 0)) && (
                                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Official Documentation & Articles</h3>
                                    </div>
                                    <div className="space-y-2.5">
                                        {studyGuideData.direct_articles && studyGuideData.direct_articles.length > 0 ? (
                                            studyGuideData.direct_articles.map((art, index) => (
                                                <a
                                                    key={index}
                                                    href={art.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3.5 rounded-lg bg-blue-50/70 hover:bg-blue-100/90 border border-blue-100 text-blue-950 text-xs font-medium transition-all group"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className="text-base flex-shrink-0">📖</span>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 group-hover:text-blue-700 truncate">{art.title}</p>
                                                            <p className="text-[11px] text-blue-600 font-normal">{art.source || "Official Documentation"}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-blue-600 font-bold bg-white px-2.5 py-1 rounded shadow-xs group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2 border border-blue-100">
                                                        Read ↗
                                                    </span>
                                                </a>
                                            ))
                                        ) : (
                                            studyGuideData.article_search_queries.map((query, index) => (
                                                <a
                                                    key={index}
                                                    href={`https://www.google.com/search?q=${encodeURIComponent(query + ' MDN documentation')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 hover:bg-blue-100/80 border border-blue-100 text-blue-900 text-xs font-medium transition-all group"
                                                >
                                                    <span className="flex items-center gap-2 truncate">
                                                        <span>📖</span>
                                                        <span className="truncate">{query}</span>
                                                    </span>
                                                    <span className="text-blue-500 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2">Read ↗</span>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 bg-white space-y-2.5 shadow-lg">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleCopyStudyGuide}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                        >
                            {copied ? "✅ Copied!" : "📋 Copy Guide"}
                        </button>
                        <button
                            onClick={handleDownloadMarkdown}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 border border-indigo-200"
                        >
                            💾 Download .md
                        </button>
                    </div>

                    <button 
                        onClick={() => window.open('https://docs.google.com/document/u/0/', '_blank', 'noopener,noreferrer')}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                        📄 Open Google Docs
                    </button>
                    
                    <p className="text-[11px] text-gray-500 text-center leading-normal">
                        📧 {user?.primaryEmailAddress?.emailAddress ? `Dispatched to ${user.primaryEmailAddress.emailAddress}` : 'Email dispatch active via Brevo SMTP'}. You can also copy or download it directly above!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
