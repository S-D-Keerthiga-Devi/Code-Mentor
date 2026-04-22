// backend/socket/events.js

export const SOCKET_EVENTS = {
    // Connection
    CONNECT: "connect",
    DISCONNECT: "user_disconnected",

    // Room
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    ROOM_JOINED: "room_joined",

    // Collaboration
    CODE_CHANGE: "code_change",
    SYNC_CODE: "sync_code",
    CURSOR_MOVE: "cursor_move",
    WHITEBOARD_DRAW: "whiteboard_draw",
    SYNC_WHITEBOARD: "sync_whiteboard",

    // Chat
    SEND_MESSAGE: "send_message",
    RECEIVE_MESSAGE: "receive_message",
    SYNC_CHAT: "sync_chat",

    // User Status
    GET_ACTIVE_USERS: "get_active_users",
    UPDATE_ACTIVE_USERS: "update_active_users"
};
