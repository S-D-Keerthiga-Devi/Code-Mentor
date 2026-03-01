import React from "react";
import { Handle, Position } from "@xyflow/react";
import { PlayCircle, Sparkles, Database } from "lucide-react";

const CustomComplexityNode = ({ data }) => {
    // Score dictates the visual size and intensity (1-10)
    const score = data?.complexityScore || 1;
    const shape = data?.shape || 'rectangle';

    // Determine color schema based on score to match the new light theme
    let borderClass, textHeaderClass, bgClass, labelText, indicatorColor;

    if (score <= 3) {
        // O(1) / O(log N)
        bgClass = "bg-white";
        borderClass = "border-[#4f46e5]"; // indigo-600
        textHeaderClass = "text-[#4f46e5]";
        labelText = score === 1 ? "O(1)" : "O(log N)";
        indicatorColor = "#4f46e5";
    } else if (score <= 7) {
        // O(N) / O(N log N)
        bgClass = "bg-white";
        borderClass = "border-[#f59e0b]"; // amber-500
        textHeaderClass = "text-[#f59e0b]";
        labelText = "O(N)";
        indicatorColor = "#f59e0b";
    } else {
        // O(N^2) / O(2^N)
        bgClass = "bg-white";
        borderClass = "border-[#ef4444]"; // red-500
        textHeaderClass = "text-[#ef4444]";
        labelText = "O(N²)";
        indicatorColor = "#ef4444";
    }

    let shapeClass = "rounded-md px-6 py-3 min-w-[180px]";
    if (shape === 'pill') {
        shapeClass = "rounded-full px-8 py-3 min-w-[160px]";
    } else if (shape === 'diamond') {
        shapeClass = "w-28 h-28 rotate-45 flex items-center justify-center min-w-0";
    }

    const minimalLabel = data?.label || "Node Block";

    return (
        <div className="group relative transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,122,255,0.5)] hover:z-[100] cursor-pointer flex items-center justify-center p-4">

            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-400 border-none rounded-full opacity-60" />

            {/* The Visual Shape */}
            <div className={`flex flex-col items-center justify-center border-2 bg-white shadow-sm transition-all duration-300 ${borderClass} ${shapeClass}`}>
                {shape === 'diamond' ? (
                    <div className="-rotate-45 flex flex-col items-center justify-center text-center p-2">
                        <div className="w-2.5 h-2.5 rounded-full mb-1.5 shadow-sm" style={{ backgroundColor: indicatorColor }}></div>
                        <span className="font-bold text-gray-900 text-[10px] leading-tight max-w-[80px] break-words">{minimalLabel}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: indicatorColor }}></div>
                        <span className="font-bold text-gray-900 text-xs truncate max-w-[150px]">{minimalLabel}</span>
                    </div>
                )}
            </div>

            {/* Hover-Reveal Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[999] bg-white shadow-2xl rounded-xl border border-slate-200 p-4 pointer-events-auto cursor-default">

                {/* Header in Tooltip */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Line: {data?.lineNumber || "N/A"}
                    </div>
                    <div className={`font-bold text-[10px] tracking-wider uppercase ${textHeaderClass}`}>
                        {labelText}
                    </div>
                </div>

                <div className="text-sm font-bold text-slate-800 mb-3 leading-tight">
                    {minimalLabel}
                </div>

                {/* Mock Memory State Panel */}
                {data?.mockMemoryState && Object.keys(data.mockMemoryState).length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 shadow-inner">
                        <div className="flex items-center gap-1.5 mb-2 text-slate-400 font-bold tracking-wider uppercase text-[10px]">
                            <Database size={12} /> Local State
                        </div>
                        <div className="space-y-1.5">
                            {Object.entries(data.mockMemoryState).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-indigo-600 font-semibold truncate max-w-[40%] bg-indigo-50/50 px-1 rounded">{key}</span>
                                    <span className="text-slate-600 truncate max-w-[55%] font-medium" title={String(val)}>{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Optimize Button (for O(N) and O(N^2) nodes) */}
                {score >= 5 && data?.onOptimize && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // prevent node selection
                            data.onOptimize(data);
                        }}
                        className="w-full mt-4 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        <Sparkles size={14} className="fill-current text-indigo-200" /> Optimize Node
                    </button>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-400 border-none rounded-full opacity-60" />
        </div>
    );
};

export default CustomComplexityNode;
