// Header.jsx
import React from "react";
import hero from "../assets/hero.jpeg";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate()
  return (
    <header className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Empower Your Learning with <span className="text-indigo-600">CodeMentor</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Build, learn, and grow with powerful tools for developers and students.
            Explore features, research, and resources designed to guide you
            through every step of your journey.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-start justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Get Started
            </button>
            <a
              href="#features"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Image / Code Editor Mockup */}
        <div className="md:w-1/2 flex justify-center">
          <div className="relative bg-gray-900 rounded-xl shadow-2xl overflow-hidden w-full max-w-lg">

            {/* Code Image */}
            <img
              src={hero}
              alt="Code editor screenshot"
              className="w-full h-auto object-cover"
            />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
