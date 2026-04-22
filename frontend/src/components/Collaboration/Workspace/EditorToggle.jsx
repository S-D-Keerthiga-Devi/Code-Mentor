import React from 'react';
import { Code, PenTool, MessageSquare } from 'lucide-react';

const EditorToggle = ({ activeTab, setActiveTab, showChat, setShowChat }) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'code'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <Code size={16} className="mr-2" />
                Code
            </button>
            <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'whiteboard'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <PenTool size={16} className="mr-2" />
                Whiteboard
            </button>

            <div className="w-px h-4 bg-gray-300 mx-2"></div>

            <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${showChat
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <MessageSquare size={16} className="mr-2" />
                Chat
            </button>
        </div>
    );
};

export default EditorToggle;
