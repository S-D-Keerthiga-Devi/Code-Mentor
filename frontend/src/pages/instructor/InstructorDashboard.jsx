import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileUp,
  BookOpen,
  Sparkles,
  Bug,
  Users,
  ArrowRight,
  GraduationCap,
  FolderKanban,
  CheckCircle2,
  UploadCloud,
  FileText,
  Activity,
  Zap
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import AppDashboardLayout from "../../components/dashboard/AppDashboardLayout";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 7);
    navigate(`/collab/room-${roomId}`);
  };

  const stats = [
    { label: "Course Materials", value: "18", change: "PDFs & Slides Indexed", icon: FileText, color: "purple" },
    { label: "Active Live Rooms", value: "4", change: "Multiplayer ready", icon: Users, color: "indigo" },
    { label: "Student Queries Handled", value: "142", change: "Vector RAG verified", icon: BookOpen, color: "blue" },
    { label: "AI Safety Gate", value: "100%", change: "AST Sandboxed", icon: Sparkles, color: "emerald" },
  ];

  const tools = [
    {
      title: "Upload & Manage Course Materials",
      description: "Upload PDFs, lecture notes, and syllabus documents to power the automated RAG AI assistant for your students.",
      path: "/instructor/materials",
      icon: FileUp,
      badge: "Knowledge Uplink",
      actionText: "Manage Materials"
    },
    {
      title: "Host Collaborative Live Coding Room",
      description: "Create an instant real-time multiplayer coding room with shared Monaco editor, whiteboard, and cursor tracking.",
      onClick: handleCreateRoom,
      icon: Users,
      badge: "Live Session",
      actionText: "Start Live Session"
    },
    {
      title: "Smart IDE & Code Assistant",
      description: "Test code examples with the Socratic AI engine, AST validation checks, and automatic test generation.",
      path: "/safe-suggest",
      icon: Sparkles,
      badge: "Sandbox",
      actionText: "Open Smart IDE"
    },
    {
      title: "Visual Debugger & Big-O Pulse",
      description: "Demonstrate Big-O time and space complexity with 4D graph flows and animated execution simulations in class.",
      path: "/visual-debugger",
      icon: Bug,
      badge: "Teaching Tool",
      actionText: "Launch Visualizer"
    }
  ];

  return (
    <AppDashboardLayout role="instructor">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Greeting Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 p-6 sm:p-8 text-white shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-purple-200 mb-2.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
                <span>Instructor Control Panel</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Instructor Hub
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
                Upload course knowledge packs, launch collaborative live coding workshops, and demonstrate algorithms to your classroom.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/instructor/materials"
                className="bg-white hover:bg-slate-100 text-purple-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center space-x-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                <span>Upload Materials</span>
              </Link>
              <button
                onClick={handleCreateRoom}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-xs flex items-center space-x-1.5 backdrop-blur-sm"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Host Live Room</span>
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
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-[11px] text-purple-600 font-medium">{stat.change}</div>
              </div>
            );
          })}
        </div>

        {/* Tools Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Instructor Tool Suite
            </h2>
            <p className="text-xs text-slate-500">
              Manage student course knowledge, host sessions, or run code demonstrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              const CardContent = (
                <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg border border-purple-100 bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
                      {tool.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="w-full py-2 px-3 rounded-lg font-semibold text-xs bg-purple-600 group-hover:bg-purple-700 text-white transition-all shadow-xs flex items-center justify-center space-x-1.5">
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

      </div>
    </AppDashboardLayout>
  );
};

export default InstructorDashboard;
