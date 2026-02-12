import UserRole from "../models/UserRole.js";

// Save User Role
export const saveUserRole = async (req, res) => {
    try {
        const { clerkId, role, email } = req.body;

        if (!clerkId || !role || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if role already exists
        let userRole = await UserRole.findOne({ clerkId });

        if (userRole) {
            userRole.role = role; // Update role if exists
            await userRole.save();
        } else {
            userRole = new UserRole({ clerkId, role, email });
            await userRole.save();
        }

        res.status(201).json({ message: "Role saved successfully", userRole });
    } catch (error) {
        console.error("Error saving user role:", error);
        res.status(500).json({ error: "Failed to save user role" });
    }
};

// Get User Role
export const getUserRole = async (req, res) => {
    try {
        const { clerkId } = req.params;

        const userRole = await UserRole.findOne({ clerkId });

        if (!userRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.status(200).json({ role: userRole.role });
    } catch (error) {
        console.error("Error fetching user role:", error);
        res.status(500).json({ error: "Failed to fetch user role" });
    }
};
