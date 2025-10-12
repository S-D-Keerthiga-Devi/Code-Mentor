import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-5">
        <span
          onClick={() => navigate('/')}
          className="text-indigo-600 cursor-pointer"
        >
          CodeMentor
        </span>
      </h1>

      <nav className="space-y-4">
        <a href="#stats" className="block font-medium hover:text-indigo-600">
          Stats
        </a>
        <a href="#runs" className="block font-medium hover:text-indigo-600">
          Runs
        </a>
        <a href="#packs" className="block font-medium hover:text-indigo-600">
          Knowledge Packs
        </a>
        <a href="#trace" className="block font-medium hover:text-indigo-600">
          Trace Visualizer
        </a>
        <a href="#collab" className="block font-medium hover:text-indigo-600">
          Collaboration
        </a>
      </nav>
    </aside>
  );
}
