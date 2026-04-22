import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import CanvasDraw from "react-canvas-draw";
import { useCollaboration } from "../../../hooks/useCollaboration";

// Default empty state ensuring compatible dimensions
const DEFAULT_DATA = JSON.stringify({
    lines: [],
    width: 2000,
    height: 2000
});

const WhiteboardCanvas = ({ roomId }) => {
    const { socket, EVENTS, whiteboardState } = useCollaboration();
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Initialize state from local storage to prevent blank flash
    // We use useMemo to only read this once on mount/roomId change
    const initialData = useMemo(() => {
        if (roomId) {
            const saved = localStorage.getItem(`whiteboard_${roomId}`);
            if (saved) {
                // Ensure it's a valid string for CanvasDraw
                return typeof saved === 'object' ? JSON.stringify(saved) : saved;
            }
        }
        return DEFAULT_DATA;
    }, [roomId]);

    // Debounce function to limit emission frequency
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Broadcast changes (Debounced)
    const broadcastChange = useCallback(debounce((data) => {
        if (socket && data) {
            socket.emit(EVENTS.WHITEBOARD_DRAW, { roomId, data });
        }
    }, 500), [socket, roomId, EVENTS]);

    // Handle Local Change
    const handleChange = (canvas) => {
        if (canvasRef.current) {
            const data = canvasRef.current.getSaveData();
            const dataObj = JSON.parse(data);

            // Prevent broadcasting validation-only empty state if we believe we should have content
            if (whiteboardState && dataObj.lines.length === 0) {
                const currentStateObj = typeof whiteboardState === 'object' ? whiteboardState : JSON.parse(whiteboardState);
                if (currentStateObj.lines && currentStateObj.lines.length > 0) {
                    // We have content in state, but canvas is empty? 
                    // This might be a glitch or initial load. Don't broadcast empty.
                    return;
                }
            }

            // We don't update context here directly to avoid re-render loops; 
            // the canvas component holds the source of truth for the local user.
            broadcastChange(data);
        }
    };

    // Sync from Context (State from others or initial load)
    useEffect(() => {
        if (canvasRef.current && whiteboardState) {
            try {
                // Determine if whiteboardState is already a string or needs stringifying
                const safeData = typeof whiteboardState === 'object'
                    ? JSON.stringify(whiteboardState)
                    : whiteboardState;

                // Only load if different to prevent overwriting user's active drawing
                // stored data might be different from current canvas state
                if (safeData !== canvasRef.current.getSaveData()) {
                    canvasRef.current.loadSaveData(safeData, true);
                }
            } catch (err) {
                console.error("Whiteboard Sync Error:", err);
            }
        }
    }, [whiteboardState]);

    return (
        <div className="w-full h-full bg-white relative overflow-hidden" ref={containerRef}>
            <div className="absolute inset-0 flex items-center justify-center overflow-auto">
                <CanvasDraw
                    ref={canvasRef}
                    onChange={handleChange}
                    brushColor="#4F46E5"
                    brushRadius={3}
                    lazyRadius={0}
                    canvasWidth={2000}
                    canvasHeight={2000}
                    className="shadow-sm border border-gray-100"
                    hideGrid={false}
                    immediateLoading={true} // Important for sync
                    saveData={initialData} // Initialize with saved data
                />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-2 rounded shadow-sm text-xs text-gray-400 border border-gray-100 pointer-events-none select-none">
                Collaborative Whiteboard
            </div>
            <button
                className="absolute top-4 right-4 bg-red-50 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-100 border border-red-100 transition-colors"
                onClick={() => {
                    if (canvasRef.current) {
                        canvasRef.current.clear();
                        broadcastChange(canvasRef.current.getSaveData());
                    }
                }}
            >
                Clear Board
            </button>
        </div>
    );
};

export default WhiteboardCanvas;
