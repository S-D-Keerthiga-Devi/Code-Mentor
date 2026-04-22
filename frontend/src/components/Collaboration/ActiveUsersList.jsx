// frontend/src/components/Collaboration/ActiveUsersList.jsx
import React from "react";
import { useCollaboration } from "../../hooks/useCollaboration";

const ActiveUsersList = () => {
    const { activeUsers } = useCollaboration();

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm z-10">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Online Members ({activeUsers.length})
                </h3>
            </div>

            <ul className="flex-1 overflow-y-auto p-3 space-y-2">
                {activeUsers.map((user) => (
                    <li key={user.socketId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 truncate">Active now</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Room link copied!");
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Invite Link</span>
                </button>
            </div>
        </div>
    );
};

export default ActiveUsersList;
