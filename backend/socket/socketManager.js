// backend/socket/socketManager.js
import { Server } from "socket.io";
import { SOCKET_EVENTS } from "./events.js";

// In-memory store for user mapping (socketId -> { username, roomId })
// For production, use Redis or a database.
const userSocketMap = {};
// In-memory store for room data (code, chats, whiteboard)
const roomData = {};

// Helper to get all users in a room
const getAllConnectedClients = (io, roomId) => {
    // Map of socketId to user info
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId]?.username || "Anonymous",
        };
    });
};

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173", // Update with your frontend URL
            methods: ["GET", "POST"],
        },
    });

    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId, username }) => {
            // Validate
            if (!roomId || !username) return;

            // Update Map
            userSocketMap[socket.id] = { username, roomId };
            socket.join(roomId);

            // Initialize room data if not exists
            if (!roomData[roomId]) {
                roomData[roomId] = {
                    code: "// Start coding together...",
                    chats: [],
                    // Valid empty initial state for react-canvas-draw
                    whiteboard: JSON.stringify({ lines: [], width: 2000, height: 2000 })
                };
            }

            // Get updated list of clients
            const clients = getAllConnectedClients(io, roomId);

            // Notify everyone in the room (including sender) about the new list
            io.to(roomId).emit(SOCKET_EVENTS.UPDATE_ACTIVE_USERS, clients);

            // Notify others that a specific user joined
            socket.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
                username: "System",
                message: `${username} has joined the room.`,
                timestamp: new Date().toISOString(),
            });

            // Sync existing state to the new user
            // 1. Code
            if (roomData[roomId].code) {
                socket.emit(SOCKET_EVENTS.CODE_CHANGE, { code: roomData[roomId].code });
            }
            // 2. Chat History
            if (roomData[roomId].chats.length > 0) {
                socket.emit(SOCKET_EVENTS.SYNC_CHAT, { chats: roomData[roomId].chats });
            }
            // 3. Whiteboard
            if (roomData[roomId].whiteboard) {
                socket.emit(SOCKET_EVENTS.SYNC_WHITEBOARD, { data: roomData[roomId].whiteboard });
            }

            console.log(`${username} joined room ${roomId}`);
        });

        socket.on(SOCKET_EVENTS.CODE_CHANGE, ({ roomId, code }) => {
            if (roomData[roomId]) {
                roomData[roomId].code = code;
            }
            // Broadcast code change to everyone else in the room
            socket.to(roomId).emit(SOCKET_EVENTS.CODE_CHANGE, { code });
        });

        // Sync Code (typically for new joiners requesting current state)
        socket.on(SOCKET_EVENTS.SYNC_CODE, ({ socketId, code }) => {
            // We can primarily rely on the roomData code, but if a client pushes sync, we update
            if (userSocketMap[socket.id] && roomData[userSocketMap[socket.id].roomId]) {
                roomData[userSocketMap[socket.id].roomId].code = code;
            }
            io.to(socketId).emit(SOCKET_EVENTS.CODE_CHANGE, { code });
        });

        // Cursor Movement
        socket.on(SOCKET_EVENTS.CURSOR_MOVE, ({ roomId, cursor }) => {
            socket.to(roomId).emit(SOCKET_EVENTS.CURSOR_MOVE, {
                socketId: socket.id,
                username: userSocketMap[socket.id]?.username,
                cursor
            })
        })

        // Whiteboard Draw
        socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW, ({ roomId, data }) => {
            if (roomData[roomId]) {
                roomData[roomId].whiteboard = data;
            }
            socket.to(roomId).emit(SOCKET_EVENTS.WHITEBOARD_DRAW, { data });
        });

        // Chat Message
        socket.on(SOCKET_EVENTS.SEND_MESSAGE, ({ roomId, message }) => {
            const msgData = {
                username: userSocketMap[socket.id]?.username || "Anonymous",
                message,
                timestamp: new Date().toISOString(),
            };

            if (roomData[roomId]) {
                roomData[roomId].chats.push(msgData);
            }

            io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, msgData);
        });

        socket.on("disconnecting", () => {
            const rooms = [...socket.rooms];
            rooms.forEach((roomId) => {
                // Only emit to actual rooms, not the socket's own ID room
                if (roomId !== socket.id) {
                    socket.to(roomId).emit(SOCKET_EVENTS.DISCONNECT, {
                        socketId: socket.id,
                        username: userSocketMap[socket.id]?.username,
                    });
                }
            });
        });

        socket.on("disconnect", () => {
            const userData = userSocketMap[socket.id];

            if (userData) {
                const { roomId, username } = userData;
                socket.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
                    username: "System",
                    message: `${username} left the room.`,
                    timestamp: new Date().toISOString(),
                });
                delete userSocketMap[socket.id];
                const clients = getAllConnectedClients(io, roomId);
                io.to(roomId).emit(SOCKET_EVENTS.UPDATE_ACTIVE_USERS, clients);
            }

            console.log(`Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};
