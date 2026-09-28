import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  Sparkles,
  Bug,
  Users,
  MessageSquare,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  BookOpen,
  Play,
  Flame,
  Layers,
  Clock,
  Terminal
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import AppDashboardLayout from "../../components/dashboard/AppDashboardLayout";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 7);
    navigate(`/collab/room-${roomId}`);
  };

  const stats = [
    { label: "Safe Suggestions", value: "32", change: "+12% this week", icon: Sparkles, color: "indigo" },
    { label: "Algorithms Visualized", value: "14", change: "4D Big-O active", icon: Bug, color: "purple" },
    { label: "Live Collab Sessions", value: "8", change: "0 ms latency", icon: Users, color: "blue" },
    { label: "Course AI Queries", value: "27", change: "100% cited", icon: MessageSquare, color: "emerald" },
  ];

  const tools = [
    {
      title: "Smart Code Assistant & IDE",
      description: "AI-assisted code development with Socratic heatmaps, automatic unit test verification, and single-click auto-fixes.",
      path: "/safe-suggest",
      icon: Sparkles,
      color: "indigo",
      badge: "Core Workspace",
      actionText: "Launch IDE"
    },
    {
      title: "Visual Debugger & Big-O Heatmap",
      description: "Simulate algorithms step-by-step with 4D Big-O flow graphs, execution heatmaps, and automatic subgraph optimization.",
      path: "/visual-debugger",
      icon: Bug,
      color: "purple",
      badge: "4D Pulse Graph",
      actionText: "Simulate Algorithm"
    },
    {
      title: "Real-Time Multiplayer Coding",
      description: "Join or host a live multiplayer coding room with CRDT synchronization, shared whiteboard, and real-time chat.",
      onClick: handleCreateRoom,
      icon: Users,
      color: "blue",
      badge: "CRDT Sync",
      actionText: "Create Live Room"
    },
    {
      title: "Course Materials AI Assistant",
      description: "Interact with an AI assistant trained on lecture slides, course PDFs, and instructor materials.",
      path: "/student/course-bot",
      icon: MessageSquare,
      color: "emerald",
      badge: "Syllabus RAG",
      actionText: "Ask Question"
    }
  ];

  const quickStarters = [
    { name: "Binary Search (O(log N))", lang: "JavaScript", desc: "Fast divide & conquer element search" },
    { name: "Merge Sort Algorithm", lang: "JavaScript", desc: "Recursive divide-and-conquer sorting" },
    { name: "Graph Breadth-First Search", lang: "JavaScript", desc: "Level-order queue traversal" },
    { name: "Two Pointer Palindrome", lang: "JavaScript", desc: "Linear scan string validation" },
  ];

  return (
    <AppDashboardLayout role="student">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Greeting Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-indigo-200 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Student Learning Environment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName || "Student"}! 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
                Continue learning with Socratic guidance, 4D algorithm pulse graphs, and live multiplayer coding.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate("/safe-suggest")}
                className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span>Open Smart IDE</span>
              </button>
              <button
                onClick={handleCreateRoom}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-xs flex items-center space-x-1.5 backdrop-blur-sm"
              >
                <Users className="w-3.5 h-3.5" />
                <span>New Live Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-[11px] text-emerald-600 font-medium">{stat.change}</div>
              </div>
            );
          })}
        </div>

        {/* Interactive Tool Suite (Compact 2x2 Grid) */}
        <div>
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Interactive Learning Suite
            </h2>
            <p className="text-xs text-slate-500">
              Launch AI coding, graph visualization, multiplayer sessions, or course Q&A.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              const CardContent = (
                <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                      {tool.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="w-full py-2 px-3 rounded-lg font-semibold text-xs bg-indigo-600 group-hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center justify-center space-x-1.5">
                    <span>{tool.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );

              if (tool.onClick) {
                return (
                  <div key={idx} onClick={tool.onClick} className="cursor-pointer h-full">
                    {CardContent}
                  </div>
                );
              }

              return (
                <Link key={idx} to={tool.path} className="block h-full">
                  {CardContent}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Algorithm Quick Starters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Algorithm Starters & Sandboxes
              </h3>
              <p className="text-xs text-slate-500">
                Jumpstart practice with pre-configured algorithms ready for visual debugging.
              </p>
            </div>
            <button
              onClick={() => navigate("/visual-debugger")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Visualizer →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickStarters.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate("/visual-debugger")}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-indigo-600 mb-1">
                    <span>{item.lang}</span>
                    <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppDashboardLayout>
  );
};

export default StudentDashboard;
