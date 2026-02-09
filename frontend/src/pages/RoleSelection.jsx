import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { UserIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const RoleSelection = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const handleRoleSelect = async (role) => {
        if (!user) return;

        try {
            await axios.post("http://localhost:5000/api/user-role/role", {
                clerkId: user.id,
                email: user.primaryEmailAddress.emailAddress,
                role: role,
            });

            localStorage.setItem("userRole", role);

            if (role === "student") {
                navigate("/student/dashboard");
            } else {
                navigate("/instructor/dashboard");
            }
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error("Failed to save role. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-4">
            <h1 className="text-4xl font-bold mb-8 text-indigo-600">
                Choose Your Role
            </h1>
            <p className="text-gray-600 mb-12 text-lg">
                How will you be using Code Mentor today?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Student Card */}
                <button
                    onClick={() => handleRoleSelect("student")}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-indigo-500 hover:shadow-xl transition-all group flex flex-col items-center text-center"
                >
                    <div className="bg-indigo-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <UserIcon className="h-16 w-16 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">I am a Student</h2>
                    <p className="text-gray-500">
                        I want to learn, get help with code, and access course materials.
                    </p>
                </button>

                {/* Instructor Card */}
                <button
                    onClick={() => handleRoleSelect("instructor")}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-purple-500 hover:shadow-xl transition-all group flex flex-col items-center text-center"
                >
                    <div className="bg-purple-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <AcademicCapIcon className="h-16 w-16 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">I am an Instructor</h2>
                    <p className="text-gray-500">
                        I want to upload materials, track progress, and manage courses.
                    </p>
                </button>
            </div>
        </div>
    );
};

export default RoleSelection;
