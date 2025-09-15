// Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate()
  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold text-indigo-600">
        CodeMentor
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6">
        <a href="#home" className="text-gray-700 hover:text-indigo-600">
          Home
        </a>
        <a href="#features" className="text-gray-700 hover:text-indigo-600">
          Features
        </a>
        <a href="#research" className="text-gray-700 hover:text-indigo-600">
          Research
        </a>
        <a href="#contact" className="text-gray-700 hover:text-indigo-600">
          Contact
        </a>
      </div>

      {/* Login Button */}
      <div>
        <button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </div>
    </nav>
  );
}
