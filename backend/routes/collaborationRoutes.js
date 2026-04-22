// backend/routes/collaborationRoutes.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/collaboration/new-room -> Returns a UUID for a new room
router.get("/new-room", (req, res) => {
    try {
        const roomId = uuidv4();
        res.status(200).json({ roomId });
    } catch (error) {
        console.error("Error generating room ID:", error);
        res.status(500).json({ error: "Failed to generate room ID" });
    }
});

// GET /api/collaboration/validate-room/:roomId -> Validates existing room (Optional for now)
router.get("/validate-room/:roomId", (req, res) => {
    // In a real app, check DB if room exists.
    // For now, any UUID is valid.
    const { roomId } = req.params;
    if (!roomId) {
        return res.status(400).json({ valid: false, message: "Room ID required" });
    }
    res.status(200).json({ valid: true, roomId });
});

export default router;
