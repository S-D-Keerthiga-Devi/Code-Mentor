import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "instructor"],
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserRole = mongoose.model("UserRole", userRoleSchema);

export default UserRole;
