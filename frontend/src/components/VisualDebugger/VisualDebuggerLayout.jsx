import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, SplitSquareHorizontal, Maximize2 } from 'lucide-react';
import { toast } from 'react-toastify';
import CodePanel from './CodePanel';
import FlowCanvas from './FlowCanvas';
import Navbar from '../Navbar';
import Footer from '../Footer';

const VisualDebuggerLayout = () => {
    const navigate = useNavigate();
    const { visualizerCode, visualizerLanguage } = useSelector(state => state.ide);
    const [localCode, setLocalCode] = useState(visualizerCode || "");
    const [activeLine, setActiveLine] = useState(null);
    const [viewMode, setViewMode] = useState('split'); // 'split' | 'full'

    const handleOptimizationComplete = (result) => {
        if (!result || !result.optimizedCode) return;

        const lines = localCode.split('\n');
        const startIdx = result.targetLineStart - 1;
        const endIdx = result.targetLineEnd - 1;

        if (startIdx >= 0 && endIdx < lines.length && startIdx <= endIdx) {
            lines.splice(startIdx, endIdx - startIdx + 1, result.optimizedCode);
            setLocalCode(lines.join('\n'));
            toast.success("Code successfully refactored in the editor!");
        } else {
            toast.info("Could not safely inline the replaced code exactly. Reviewing graph output...");
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            {/* Top Toolbar */}
            <div className="bg-white border-b border-slate-200/90 flex items-center justify-between px-6 py-2.5 shrink-0 shadow-xs z-10">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                        <h2 className="text-sm font-bold text-slate-800">
                            4D Algorithmic Pulse & Big-O Visualizer
                        </h2>
                    </div>
                    <span className="hidden sm:inline-block text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                        Graph Engine Active
                    </span>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setViewMode('split')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                            viewMode === 'split'
                                ? 'text-indigo-700 bg-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <SplitSquareHorizontal className="w-3.5 h-3.5" />
                        <span>Split View</span>
                    </button>
                    <button
                        onClick={() => setViewMode('full')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                            viewMode === 'full'
                                ? 'text-indigo-700 bg-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Full Canvas</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex w-full bg-slate-50 relative" style={{ height: 'calc(100vh - 128px)', minHeight: '600px' }}>
                {/* Left Side: Code Editor (Hidden in Full Mode) */}
                {viewMode === 'split' && (
                    <div className="w-1/2 h-full">
                        <CodePanel
                            code={localCode}
                            language={visualizerLanguage}
                            activeLine={activeLine}
                            onChange={(newCode) => setLocalCode(newCode)}
                            onEditorClick={() => setActiveLine(null)}
                        />
                    </div>
                )}

                {/* Right Side: Graph Canvas */}
                <div className={`h-full border-l border-slate-200 transition-all duration-300 ${viewMode === 'full' ? 'w-full border-none' : 'w-1/2'}`}>
                    <FlowCanvas
                        code={localCode}
                        language={visualizerLanguage}
                        onNodeSelect={(line) => setActiveLine(prev => prev === line ? null : line)}
                        onOptimizationComplete={handleOptimizationComplete}
                    />
                </div>
            </div>
            {/* Footer */}
            <div className="w-full bg-slate-900 border-t border-slate-800">
                <Footer />
            </div>
        </div>
    );
};

export default VisualDebuggerLayout;
