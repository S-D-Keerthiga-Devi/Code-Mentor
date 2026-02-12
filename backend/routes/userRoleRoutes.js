import express from "express";
import { saveUserRole, getUserRole } from "../controllers/userRoleController.js";

const router = express.Router();

router.post("/role", saveUserRole);
router.get("/role/:clerkId", getUserRole);

export default router;
