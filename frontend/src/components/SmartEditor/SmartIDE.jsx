import React from 'react';
import { IDEProvider } from '../../context/IDEContext';
import SidebarExplorer from './SidebarExplorer';
import EditorWorkspace from './EditorWorkspace';
import AIChatPanel from './AIChatPanel';
import TerminalPanel from './TerminalPanel';

const SmartIDE = () => {
    return (
        <IDEProvider>
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-4 lg:p-6 font-sans">
                {/* Main Application Window Container */}
                <div className="w-full h-full max-w-[1600px] flex rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white border border-gray-200 overflow-hidden relative text-gray-800">

                    {/* Left Pane - File Explorer */}
                    <SidebarExplorer />

                    {/* Center Pane - Editor & Terminal */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfb]">
                        <EditorWorkspace />
                        <TerminalPanel />
                    </div>

                    {/* Right Pane - AI Chat (Always slightly visible or toggleable depending on current layout but currently toggleable via Context) */}
                    <AIChatPanel />
                </div>
            </div>
        </IDEProvider>
    );
};

export default SmartIDE;
