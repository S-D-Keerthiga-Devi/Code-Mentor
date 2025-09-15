import React from "react";

export default function DashboardSidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
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
