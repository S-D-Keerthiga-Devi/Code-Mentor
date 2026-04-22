// Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userRole");
    toast.info("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => navigate("/")}>
        CodeMentor
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6">
        <a href="/" className="text-gray-700 hover:text-indigo-600 transition-colors">
          Home
        </a>
        <a href="/about" className="text-gray-700 hover:text-indigo-600 transition-colors">
          About
        </a>
        <a href="/#features" className="text-gray-700 hover:text-indigo-600 transition-colors">
          Features
        </a>
      </div>

      <div className="flex items-center space-x-4">
        {isSignedIn ? (
          <>
            <span className="text-gray-600 text-sm mr-2">Hello, {user.firstName}</span>
            <button
              onClick={() => navigate("/auth-callback")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
