import React from "react";

export default function DashboardStats() {
  return (
    <section id="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-gray-500">Verified Suggestions</h3>
        <p className="text-2xl font-bold">14</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-gray-500">Active Packs</h3>
        <p className="text-2xl font-bold">3</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-gray-500">Collab Sessions</h3>
        <p className="text-2xl font-bold">5</p>
      </div>
    </section>
  );
}
