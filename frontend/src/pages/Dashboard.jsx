import React from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardStats from "../components/dashboard/DashboardStats";
import RunHistory from "../components/dashboard/RunHistory";
import KnowledgePacks from "../components/dashboard/KnowledgePacks";
import Visualizer from "../components/dashboard/Visualizer";
import CollaborationRadar from "../components/dashboard/CollaborationRadar";
import TutoringModeSwitcher from "../components/dashboard/TutoringModeSwitcher";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 p-6 space-y-6">
          <DashboardStats />
          <TutoringModeSwitcher />
          <RunHistory />
          <KnowledgePacks />
          <Visualizer />
          <CollaborationRadar />
        </main>
      </div>
    </div>
  );
}
