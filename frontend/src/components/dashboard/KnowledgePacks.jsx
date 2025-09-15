import React from "react";

export default function KnowledgePacks() {
  return (
    <section id="packs" className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Knowledge Packs</h2>
      <p>Available course-specific packs:</p>
      <ul className="list-disc ml-6 mt-2 text-gray-700">
        <li>DSA Basics (PDFs, Slides)</li>
        <li>Operating Systems Notes</li>
        <li>Machine Learning Crash Pack</li>
      </ul>
    </section>
  );
}
