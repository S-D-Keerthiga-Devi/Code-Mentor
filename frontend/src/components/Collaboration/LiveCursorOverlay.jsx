// frontend/src/components/Collaboration/LiveCursorOverlay.jsx
import React from "react";
import { useCollaboration } from "../../hooks/useCollaboration";

const LiveCursorOverlay = () => {
    const { cursors } = useCollaboration();

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {Object.entries(cursors).map(([socketId, { username, cursor }]) => {
                if (!cursor) return null;

                return (
                    <div
                        key={socketId}
                        className="absolute transition-all duration-100 ease-linear"
                        style={{
                            left: cursor.x, // Assuming x/y are pixels relative to container or percentages
                            top: cursor.y,
                        }}
                    >
                        <svg
                            className="w-5 h-5 text-indigo-500 fill-current transform -translate-x-[2px] -translate-y-[2px]"
                            viewBox="0 0 24 24"
                        >
                            <path d="M5.65876 3.23537C5.22899 2.92341 4.63001 3.23122 4.63001 3.76313V19.1837C4.63001 19.7891 5.38531 20.071 5.78696 19.6146L10.3636 14.4146C10.5367 14.218 10.7844 14.1042 11.0456 14.1042H18.7303C19.3441 14.1042 19.6428 14.854 19.1918 15.2631L5.65876 3.23537Z" />
                        </svg>
                        <span className="bg-indigo-500 text-white text-[10px] px-1 py-0.5 rounded ml-2 whitespace-nowrap">
                            {username}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default LiveCursorOverlay;
