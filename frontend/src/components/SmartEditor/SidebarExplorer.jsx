import React, { useState } from 'react';
import { useIDE } from '../../context/IDEContext';
import { VscNewFile, VscNewFolder, VscFile, VscFolder, VscChevronRight, VscChevronDown } from 'react-icons/vsc';
import { toast } from 'react-toastify';

const SidebarExplorer = () => {
    const { files, activeFileId, setActiveFileId, createFile, createFolder } = useIDE();
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState({});

    const handleCreateFile = () => {
        const filename = prompt('Enter file name (e.g., script.js or script.py):', 'newFile.js');
        if (!filename) return;

        let language = 'javascript';
        if (filename.endsWith('.py')) language = 'python';
        if (filename.endsWith('.md')) language = 'markdown';
        if (filename.endsWith('.json')) language = 'json';

        createFile(filename, language, '// New file created\n', selectedFolderId);
    };

    const handleCreateFolder = () => {
        const foldername = prompt('Enter folder name:');
        if (foldername) {
            createFolder(foldername, selectedFolderId);
            toast.success(`Folder '${foldername}' created.`);
        }
    };

    const toggleFolder = (folderId, e) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
        setSelectedFolderId(folderId); // Set as active folder for creation
    };

    const renderNode = (node, depth = 0) => {
        const isFolder = node.type === 'folder';
        const isExpanded = expandedFolders[node.id];
        const isSelectedFolder = selectedFolderId === node.id;

        return (
            <div key={node.id}>
                <div
                    onClick={(e) => isFolder ? toggleFolder(node.id, e) : setActiveFileId(node.id)}
                    style={{ paddingLeft: `${(depth * 12) + 24}px` }}
                    className={`flex items-center py-1.5 pr-4 cursor-pointer text-[13px] font-medium transition-colors
                        ${activeFileId === node.id && !isFolder ? 'bg-[#e9ecef] text-gray-900 border-l-2 border-[#6366f1]' : 'text-gray-600 hover:bg-gray-100 border-l-2 border-transparent'}
                        ${isSelectedFolder && isFolder ? 'bg-indigo-50/50' : ''}
                    `}
                >
                    {isFolder ? (
                        <>
                            <span className="mr-1 text-gray-400">
                                {isExpanded ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
                            </span>
                            <VscFolder className={`mr-2 ${isSelectedFolder ? 'text-indigo-400' : 'text-gray-500'}`} size={16} />
                        </>
                    ) : (
                        <VscFile className={`mr-2.5 ${node.language === 'javascript' ? 'text-yellow-500' : 'text-blue-500'}`} size={16} />
                    )}
                    <span className={`truncate select-none ${isSelectedFolder && isFolder ? 'text-indigo-700 font-semibold' : ''}`}>{node.name}</span>
                </div>

                {isFolder && isExpanded && (
                    <div>
                        {files.filter(f => f.parentId === node.id).map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-[240px] bg-[#f8f9fa] flex flex-col border-r border-gray-200 flex-shrink-0 font-sans">
            <div className="px-4 py-3 text-[11px] font-bold tracking-widest text-gray-500 uppercase flex justify-between items-center group border-b border-gray-200">
                <span>Explorer</span>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Project Folder Header */}
                <div
                    className="flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100/80 text-sm font-semibold text-gray-700 transition-colors"
                    onClick={() => { setIsExplorerOpen(!isExplorerOpen); setSelectedFolderId(null); }}
                >
                    <span className="mr-1 text-gray-400">
                        {isExplorerOpen ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
                    </span>
                    <span className="truncate flex-1 uppercase text-[12px] tracking-wide">CODE_MENTOR_WS</span>
                    <div className="flex items-center space-x-2 px-2 text-gray-400">
                        <VscNewFile
                            className="cursor-pointer hover:text-gray-800 transition-colors"
                            title="New File..."
                            onClick={(e) => { e.stopPropagation(); handleCreateFile(); }}
                        />
                        <VscNewFolder
                            className="cursor-pointer hover:text-gray-800 transition-colors"
                            title="New Folder..."
                            onClick={(e) => { e.stopPropagation(); handleCreateFolder(); }}
                        />
                    </div>
                </div>

                {/* Recursive File Tree */}
                {isExplorerOpen && (
                    <div className="mt-1 pb-4">
                        {files.filter(f => !f.parentId).map(node => renderNode(node, 0))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarExplorer;

