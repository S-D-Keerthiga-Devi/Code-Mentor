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
            <div className="bg-white border-b border-slate-200 flex items-center justify-end px-6 py-2 shrink-0 shadow-sm z-10">

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('split')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'split' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        style={{ borderBottomWidth: viewMode === 'split' ? '2px' : '0px', paddingBottom: viewMode === 'split' ? '7px' : '8px' }}
                    >
                        Split View
                    </button>
                    <button
                        onClick={() => setViewMode('full')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'full' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        style={{ borderBottomWidth: viewMode === 'full' ? '2px' : '0px', paddingBottom: viewMode === 'full' ? '7px' : '8px' }}
                    >
                        Full Canvas
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
