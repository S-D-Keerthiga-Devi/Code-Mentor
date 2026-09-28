import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import {
  Code2,
  LayoutDashboard,
  Sparkles,
  Bug,
  Users,
  MessageSquare,
  FileUp,
  BookOpen,
  Home,
  Info,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Zap,
  Activity,
  ArrowUpRight,
  RotateCcw,
  Search
} from "lucide-react";

export default function AppDashboardLayout({ children, role = "student" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userRole");
    toast.info("Logged out successfully!");
    navigate("/login");
  };

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 7);
    navigate(`/collab/room-${roomId}`);
  };

  const isStudent = role === "student";

  const navigation = [
    {
      name: "Dashboard Overview",
      path: isStudent ? "/student/dashboard" : "/instructor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Smart IDE & Assistant",
      path: "/safe-suggest",
      icon: Sparkles,
      badge: "AI Powered",
    },
    {
      name: "Visual Debugger (4D)",
      path: "/visual-debugger",
      icon: Bug,
      badge: "Big-O",
    },
    {
      name: "Live Multiplayer Room",
      onClick: handleCreateRoom,
      icon: Users,
      badge: "Yjs CRDT",
    },
    isStudent
      ? {
          name: "Course AI Assistant",
          path: "/student/course-bot",
          icon: MessageSquare,
        }
      : {
          name: "Course Materials Upload",
          path: "/instructor/materials",
          icon: FileUp,
        },
  ];

  const secondaryNav = [
    { name: "Landing Home", path: "/", icon: Home },
    { name: "Platform Architecture", path: "/about", icon: Info },
    { name: "Switch Role", path: "/role-selection", icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div
              className="flex items-center space-x-2.5 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 bg-clip-text text-transparent">
                  CodeMentor
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 -mt-0.5">
                  {isStudent ? "Student Workspace" : "Instructor Hub"}
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Pill Switcher */}
          <div className="px-5 pt-4 pb-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isStudent ? "bg-indigo-500" : "bg-purple-500"} animate-pulse`} />
                <span className="text-xs font-bold text-slate-800">
                  {isStudent ? "Student Mode" : "Instructor Mode"}
                </span>
              </div>
              <button
                onClick={() => navigate("/role-selection")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Core Navigation Group */}
          <div className="px-4 py-3 space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Modules
            </span>
            {navigation.map((item, idx) => {
              const Icon = item.icon;
              const isActive = item.path && location.pathname === item.path;

              if (item.onClick) {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSidebarOpen(false);
                      item.onClick();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Links Group */}
          <div className="px-4 py-3 space-y-1 border-t border-slate-100 mt-2">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              General
            </span>
            {secondaryNav.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Footer Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {user?.fullName || user?.firstName || "User Account"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || "Active"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span>CodeMentor</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900 font-bold">
                {isStudent ? "Student Workspace" : "Instructor Hub"}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync Active</span>
            </div>

            <button
              onClick={() => navigate("/safe-suggest")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs shadow-indigo-600/20 hover:shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Open IDE</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-8 flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}
