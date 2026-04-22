import UserRole from "../models/UserRole.js";
import fs from "fs";

// Save User Role
export const saveUserRole = async (req, res) => {
    try {
        const { clerkId, role, email } = req.body;

        if (!clerkId || !role || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if role already exists by clerkId first
        let userRole = await UserRole.findOne({ clerkId });

        if (!userRole && email) {
            // Find by email in case clerkId changed (e.g., deleted and recreated Clerk account)
            userRole = await UserRole.findOne({ email });
            if (userRole) {
                userRole.clerkId = clerkId; // Update clerkId
            }
        }

        if (userRole) {
            userRole.role = role; // Update role
            await userRole.save();
        } else {
            userRole = new UserRole({ clerkId, role, email });
            await userRole.save();
        }

        res.status(201).json({ message: "Role saved successfully", userRole });
    } catch (error) {
        console.error("Error saving user role:", error);
        try {
            fs.appendFileSync("role_save_error.log", new Date().toISOString() + " - " + String(req.body.email) + " - " + String(error.message) + "\n" + String(error.stack) + "\n");
        } catch (e) { }
        res.status(500).json({ error: "Failed to save user role" });
    }
};

// Get User Role
export const getUserRole = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const { email } = req.query;

        let userRole = await UserRole.findOne({ clerkId });

        if (!userRole && email && email !== "undefined") {
            userRole = await UserRole.findOne({ email });
            if (userRole) {
                // Update clerkId to the new one so future lookups succeed
                userRole.clerkId = clerkId;
                await userRole.save();
            }
        }

        if (!userRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.status(200).json({ role: userRole.role });
    } catch (error) {
        console.error("Error fetching user role:", error);
        res.status(500).json({ error: "Failed to fetch user role" });
    }
};
