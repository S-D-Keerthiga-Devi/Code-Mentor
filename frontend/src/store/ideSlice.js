import { createSlice } from '@reduxjs/toolkit';

const defaultFiles = [
    {
        id: '1',
        name: 'index.js',
        type: 'file',
        language: 'javascript',
        content: '// Example: Sort an array of numbers\nconst numbers = [64, 34, 25, 12, 22, 11, 90];\n// Add your sorting logic here\nconsole.log(numbers.sort((a,b) => a - b));'
    },
    {
        id: '2',
        name: 'main.py',
        type: 'file',
        language: 'python',
        content: '# Example: Find factorial of a number\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)\n\nprint(factorial(5))'
    }
];

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('codeMentorIDE');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const preloadedState = loadState();

const initialState = preloadedState || {
    files: defaultFiles,
    activeFileId: '1',
    chatMessages: [],
    isChatOpen: true,
    isTerminalOpen: true,
};

const ideSlice = createSlice({
    name: 'ide',
    initialState,
    reducers: {
        setFiles: (state, action) => {
            state.files = action.payload;
        },
        setActiveFileId: (state, action) => {
            state.activeFileId = action.payload;
        },
        createFile: (state, action) => {
            const { name, language, content, parentId } = action.payload;
            const newFile = {
                id: Date.now().toString(),
                name,
                type: 'file',
                language,
                content: content || '',
                parentId: parentId || null
            };
            state.files.push(newFile);
            state.activeFileId = newFile.id;
        },
        createFolder: (state, action) => {
            const { name, parentId } = action.payload;
            const newFolder = {
                id: Date.now().toString(),
                name,
                type: 'folder',
                parentId: parentId || null
            };
            state.files.push(newFolder);
        },
        updateFileContent: (state, action) => {
            const { id, newContent } = action.payload;
            const file = state.files.find(f => f.id === id);
            if (file) {
                file.content = newContent;
            }
        },
        setChatMessages: (state, action) => {
            state.chatMessages = action.payload;
        },
        addChatMessage: (state, action) => {
            state.chatMessages.push(action.payload);
        },
        setIsChatOpen: (state, action) => {
            state.isChatOpen = action.payload;
        },
        setIsTerminalOpen: (state, action) => {
            state.isTerminalOpen = action.payload;
        }
    }
});

export const {
    setFiles,
    setActiveFileId,
    createFile,
    createFolder,
    updateFileContent,
    setChatMessages,
    addChatMessage,
    setIsChatOpen,
    setIsTerminalOpen
} = ideSlice.actions;

export default ideSlice.reducer;
