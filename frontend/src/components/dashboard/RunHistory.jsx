import React from "react";

export default function RunHistory() {
  return (
    <section id="runs" className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Run History</h2>
      <ul className="divide-y divide-gray-200">
        <li className="py-2 flex justify-between">
          <span>Assignment 1 - Suggestion Applied</span>
          <span className="text-green-600">✔ Passed</span>
        </li>
        <li className="py-2 flex justify-between">
          <span>Assignment 2 - Hint Requested</span>
          <span className="text-red-600">✘ Failed</span>
        </li>
      </ul>
    </section>
  );
}
