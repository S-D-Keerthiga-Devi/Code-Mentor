import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { executeJudge0 } from '../../services/api';
import { VscChevronDown, VscChevronUp, VscClose } from 'react-icons/vsc';
import { useIDE } from '../../context/IDEContext';

const TerminalPanel = () => {
    const { isTerminalOpen, setIsTerminalOpen } = useIDE();
    const terminalRef = useRef(null);
    const xtermInstance = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [lastExecutionStats, setLastExecutionStats] = useState(null);

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
            setLastExecutionStats(null);

            const term = xtermInstance.current?.term;
            if (term) {
                term.clear();
                term.writeln('\x1b[38;5;214mExecuting...\x1b[0m');
            }

            try {
                const result = await executeJudge0(code, language);

                if (term) {
                    term.clear();
                    if (result.compile_output) {
                        term.writeln(`\x1b[31mCompile Error:\x1b[0m\r\n${result.compile_output.replace(/\n/g, '\r\n')}`);
                    } else if (result.stderr) {
                        term.writeln(`\x1b[31mError:\x1b[0m\r\n${result.stderr.replace(/\n/g, '\r\n')}`);
                    } else {
                        term.writeln(`\r\n${(result.stdout || "Success (No Output)").replace(/\n/g, '\r\n')}`);
                    }
                    // Save stats for the bottom bar instead of inside xterm
                    setLastExecutionStats({
                        time: result.time,
                        memory: result.memory || 'N/A',
                        status: result.status || 'Accepted'
                    });
                }
            } catch (err) {
                if (term) {
                    term.clear();
                    term.writeln('\x1b[31mTerminal Error: Failed to start execution process.\x1b[0m');
                }
            } finally {
                setIsRunning(false);
            }
        };

        window.addEventListener('runCodeExecution', handleRunExecution);
        return () => window.removeEventListener('runCodeExecution', handleRunExecution);
    }, []);

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

                {/* Execution Stats Footer matching image exactly */}
                <div className="px-4 py-1.5 border-t border-gray-100 bg-white text-gray-500 font-mono text-xs flex items-center">
                    {lastExecutionStats ? (
                        <>
                            Execution Time: {lastExecutionStats.time}s | Memory: {lastExecutionStats.memory}KB | Status : {lastExecutionStats.status}
                        </>
                    ) : (
                        <>Ready to execute.</>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
