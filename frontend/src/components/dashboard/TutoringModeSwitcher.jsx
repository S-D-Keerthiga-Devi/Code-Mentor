import React, { useState } from "react";

export default function TutoringModeSwitcher() {
  const [mode, setMode] = useState("socratic");

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Tutoring Mode</h2>
      <div className="flex space-x-4">
        {["socratic", "helper", "fixer"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg ${
              mode === m
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <p className="mt-4 text-gray-600">Current Mode: {mode}</p>
    </section>
  );
}
