import React, { createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import { autoFixCode } from '../services/api';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setFiles as setReduxFiles,
    setActiveFileId as setReduxActiveFileId,
    createFile as createReduxFile,
    createFolder as createReduxFolder,
    updateFileContent as updateReduxFileContent,
    setChatMessages as setReduxChatMessages,
    addChatMessage as addReduxChatMessage,
    setIsChatOpen as setReduxIsChatOpen,
    setIsTerminalOpen as setReduxIsTerminalOpen
} from '../store/ideSlice';

const IDEContext = createContext();

export const IDEProvider = ({ children }) => {
    const { user } = useUser();
    const dispatch = useDispatch();

    // Select from Redux
    const files = useSelector(state => state.ide.files);
    const activeFileId = useSelector(state => state.ide.activeFileId);
    const chatMessages = useSelector(state => state.ide.chatMessages);
    const isChatOpen = useSelector(state => state.ide.isChatOpen);
    const isTerminalOpen = useSelector(state => state.ide.isTerminalOpen);

    const activeFile = files.find(f => f.id === activeFileId);

    // Wrapper functions to keep the same Context API for consumers
    const setFiles = (filesOrUpdater) => {
        if (typeof filesOrUpdater === 'function') {
            dispatch(setReduxFiles(filesOrUpdater(files)));
        } else {
            dispatch(setReduxFiles(filesOrUpdater));
        }
    };

    const setActiveFileId = (id) => dispatch(setReduxActiveFileId(id));

    const createFile = (name, language, content = '', parentId = null) => {
        dispatch(createReduxFile({ name, language, content, parentId }));
    };

    const createFolder = (name, parentId = null) => {
        dispatch(createReduxFolder({ name, parentId }));
    };

    const updateFileContent = (id, newContent) => {
        dispatch(updateReduxFileContent({ id, newContent }));
    };

    const setChatMessages = (msgsOrUpdater) => {
        if (typeof msgsOrUpdater === 'function') {
            dispatch(setReduxChatMessages(msgsOrUpdater(chatMessages)));
        } else {
            dispatch(setReduxChatMessages(msgsOrUpdater));
        }
    };

    const setIsChatOpen = (isOpen) => dispatch(setReduxIsChatOpen(isOpen));
    const setIsTerminalOpen = (isOpen) => dispatch(setReduxIsTerminalOpen(isOpen));

    const sendToChat = (codeSnippet, hint) => {
        const newMessage = {
            id: Date.now(),
            sender: 'user',
            text: `Context:\n\`\`\`\n${codeSnippet}\n\`\`\`\n\nHint received: ${hint}\n\nCan you explain this further?`
        };
        dispatch(addReduxChatMessage(newMessage));
        dispatch(setReduxIsChatOpen(true));
    };

    const executeAutoFix = async (lineNumber, smellType, editorInstance, monacoInstance, clearDecorationsCallback) => {
        if (!activeFile) return;

        const toastId = toast.loading("⏳ Analyzing and fixing code... (Please wait)", { position: "top-center" });
        editorInstance.updateOptions({ readOnly: true });

        try {
            const data = await autoFixCode(activeFile.content, activeFile.language, lineNumber, smellType, user?.id);

            if (data && data.fixedLine) {
                const currentLineText = editorInstance.getModel().getLineContent(lineNumber).trim();
                const receivedFix = data.fixedLine.trim();

                if (receivedFix === "NO_FIX_NEEDED") {
                    toast.update(toastId, { render: "ℹ️ AI determined no changes are needed for this specific line.", type: "info", isLoading: false, autoClose: 4000 });
                    return;
                }

                if (!receivedFix || receivedFix === currentLineText) {
                    toast.update(toastId, { render: "⚠️ AI could not determine a valid fix. No changes made.", type: "warning", isLoading: false, autoClose: 3000 });
                } else {
                    toast.update(toastId, { render: "✅ Code Fixed! (-1 Point)", type: "success", isLoading: false, autoClose: 3000 });

                    // Unlock the editor so executeEdits doesn't fail silently
                    editorInstance.updateOptions({ readOnly: false });

                    // Surgically replace the line in the editor
                    const range = new monacoInstance.Range(lineNumber, 1, lineNumber, editorInstance.getModel().getLineMaxColumn(lineNumber));
                    editorInstance.executeEdits("socratic-autofix", [{
                        range: range,
                        text: data.fixedLine,
                        forceMoveMarkers: true
                    }]);

                    // Update the context state so it's fresh for the next analysis
                    updateFileContent(activeFileId, editorInstance.getValue());

                    if (clearDecorationsCallback) clearDecorationsCallback();
                }
            } else {
                toast.update(toastId, { render: "Failed to generate auto-fix. No line returned.", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (err) {
            console.error("Auto-fix Error:", err);
            toast.update(toastId, { render: "Failed to generate auto-fix.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            editorInstance.updateOptions({ readOnly: false });
        }
    };

    return (
        <IDEContext.Provider
            value={{
                files,
                setFiles,
                activeFileId,
                setActiveFileId,
                activeFile,
                createFile,
                createFolder,
                updateFileContent,
                chatMessages,
                setChatMessages,
                isChatOpen,
                setIsChatOpen,
                isTerminalOpen,
                setIsTerminalOpen,
                sendToChat,
                executeAutoFix
            }}
        >
            {children}
        </IDEContext.Provider>
    );
};

export const useIDE = () => useContext(IDEContext);
