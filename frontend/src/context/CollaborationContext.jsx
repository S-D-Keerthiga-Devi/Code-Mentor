// frontend/src/context/CollaborationContext.jsx
import React, { createContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

export const CollaborationContext = createContext();

export const CollaborationProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [lastCodeUpdate, setLastCodeUpdate] = useState(null);
    const [cursors, setCursors] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [whiteboardState, setWhiteboardState] = useState(null);
    const [currentRoomId, setCurrentRoomId] = useState(null);

    // Refs to access state inside socket listeners
    // Refs to access state inside socket listeners
    const whiteboardStateRef = useRef(null);
    const currentRoomIdRef = useRef(null);
    const usernameRef = useRef(null);

    // Update refs when state changes
    useEffect(() => {
        whiteboardStateRef.current = whiteboardState;
    }, [whiteboardState]);

    useEffect(() => {
        currentRoomIdRef.current = currentRoomId;
    }, [currentRoomId]);

    const { user } = useUser();
    const username = user?.fullName || user?.firstName || "Anonymous";

    useEffect(() => {
        usernameRef.current = username;
    }, [username]);

    // Socket Event Constants (Matching Backend)
    const EVENTS = {
        CONNECT: "connect",
        DISCONNECT: "user_disconnected",
        JOIN_ROOM: "join_room",
        LEAVE_ROOM: "leave_room",
        CODE_CHANGE: "code_change",
        SYNC_CODE: "sync_code",
        CURSOR_MOVE: "cursor_move",
        WHITEBOARD_DRAW: "whiteboard_draw",
        SYNC_WHITEBOARD: "sync_whiteboard",
        SEND_MESSAGE: "send_message",
        RECEIVE_MESSAGE: "receive_message",
        SYNC_CHAT: "sync_chat",
        UPDATE_ACTIVE_USERS: "update_active_users",
    };

    const connectSocket = useCallback(() => {
        if (socketRef.current) return socketRef.current;

        const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on(EVENTS.CONNECT, () => {
            console.log("Connected to Socket.IO server");
            setIsConnected(true);

            // Auto-rejoin room if we have a current room ID (handles reconnections)
            // Auto-rejoin room if we have a current room ID (handles reconnections)
            const roomId = currentRoomIdRef.current;
            const currentUsername = usernameRef.current || "Anonymous";

            if (roomId) {
                console.log(`Auto-rejoining room: ${roomId} as ${currentUsername}`);
                newSocket.emit(EVENTS.JOIN_ROOM, { roomId, username: currentUsername });
            }
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
            setIsConnected(false);
        });

        newSocket.on(EVENTS.UPDATE_ACTIVE_USERS, (users) => {
            console.log("Active users update received:", users);
            setActiveUsers(users);
        });

        newSocket.on(EVENTS.CODE_CHANGE, ({ code }) => {
            setLastCodeUpdate(code);
        });

        newSocket.on(EVENTS.CURSOR_MOVE, ({ socketId, username, cursor }) => {
            setCursors(prev => ({
                ...prev,
                [socketId]: { username, cursor }
            }));
        });

        newSocket.on(EVENTS.RECEIVE_MESSAGE, (messageData) => {
            console.log("Chat message received:", messageData);
            setChatMessages(prev => [...prev, messageData]);
        });

        newSocket.on(EVENTS.SYNC_CHAT, ({ chats }) => {
            console.log("Chat history synced:", chats);
            setChatMessages(chats);
        });

        // Whiteboard Sync & Updates
        newSocket.on(EVENTS.SYNC_WHITEBOARD, ({ data }) => {
            // Check if server sent empty/default state
            const serverDataStr = typeof data === 'object' ? JSON.stringify(data) : data;
            const isServerEmpty = !data || (serverDataStr && serverDataStr.includes('"lines":[]'));

            // CRITICAL FIX: Read directly from localStorage using the ref which is updated synchronously in joinRoom
            // This avoids React state update delays
            const roomId = currentRoomIdRef.current;
            let localData = null;
            if (roomId) {
                localData = localStorage.getItem(`whiteboard_${roomId}`);
            }

            const hasLocalData = localData &&
                (typeof localData === 'string' ? !localData.includes('"lines":[]') : localData.lines?.length > 0);

            if (isServerEmpty && hasLocalData) {
                // Server is empty, but we have data. Push our data to server.
                console.log("Server whiteboard empty, syncing local state to server");
                if (roomId) {
                    newSocket.emit(EVENTS.WHITEBOARD_DRAW, { roomId, data: localData });
                }
                // Don't overwrite local state with empty server state
                return;
            }
            // Normal sync: Server has data, or we have no data
            setWhiteboardState(data);
        });

        newSocket.on(EVENTS.WHITEBOARD_DRAW, ({ data }) => {
            setWhiteboardState(data);
        });

        setSocket(newSocket);
        return newSocket;
    }, []);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }
    }, []);

    const joinRoom = useCallback((roomId) => {
        const s = connectSocket();
        // Always ensuring we have a socket, connectSocket handles the singleton check
        s.emit(EVENTS.JOIN_ROOM, { roomId, username });
        setChatMessages([]); // Clear chat on join
        setCurrentRoomId(roomId);
        currentRoomIdRef.current = roomId; // Update ref immediately for socket listeners

        // Try to load from local storage
        const savedState = localStorage.getItem(`whiteboard_${roomId}`);
        if (savedState) {
            try {
                // We don't parse it because setWhiteboardState typically expects the object 
                // or the string depending on how it's used. 
                // WhiteboardCanvas expects a string or object. 
                // Let's assume it stores the raw string from getSaveData()
                // But wait, getSaveData returns a stringified JSON.
                // Let's store it as is.
                setWhiteboardState(savedState);
            } catch (e) {
                console.error("Failed to load whiteboard state from local storage", e);
            }
        } else {
            setWhiteboardState(null);
        }

    }, [connectSocket, username]);

    // Save whiteboard state to local storage whenever it changes
    useEffect(() => {
        if (currentRoomId && whiteboardState) {
            localStorage.setItem(`whiteboard_${currentRoomId}`,
                typeof whiteboardState === 'object' ? JSON.stringify(whiteboardState) : whiteboardState
            );
        }
    }, [whiteboardState, currentRoomId]);

    const sendCodeChange = useCallback((roomId, code) => {
        if (socketRef.current) {
            socketRef.current.emit(EVENTS.CODE_CHANGE, { roomId, code });
        }
    }, []);

    const sendCursorMove = useCallback((roomId, cursor) => {
        if (socketRef.current) {
            socketRef.current.emit(EVENTS.CURSOR_MOVE, { roomId, cursor });
        }
    }, []);

    const sendChatMessage = useCallback((roomId, message) => {
        if (socketRef.current) {
            socketRef.current.emit(EVENTS.SEND_MESSAGE, { roomId, message });
        }
    }, []);

    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, []);

    return (
        <CollaborationContext.Provider
            value={{
                socket,
                isConnected,
                activeUsers,
                joinRoom,
                lastCodeUpdate,
                sendCodeChange,
                sendCursorMove,
                cursors,
                chatMessages,
                sendChatMessage,
                whiteboardState,
                setWhiteboardState, // Expose setter if local optimistic updates needed
                EVENTS
            }}
        >
            {children}
        </CollaborationContext.Provider>
    );
};
