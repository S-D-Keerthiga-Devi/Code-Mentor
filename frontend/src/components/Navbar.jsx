import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import {
  Code2,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Compass,
  Zap,
  Users2
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userRole");
    toast.info("Logged out successfully!");
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Smart IDE", path: "/safe-suggest" },
    { name: "Visual Debugger", path: "/visual-debugger" },
    { name: "Collaboration", path: `/collab/room-${Math.random().toString(36).substring(2, 7)}` },
    { name: "About", path: "/about" },
  ];

  const handleDashboardRedirect = () => {
    const role = localStorage.getItem("userRole");
    if (role === "student") navigate("/student/dashboard");
    else if (role === "instructor") navigate("/instructor/dashboard");
    else navigate("/auth-callback");
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 bg-clip-text text-transparent">
                CodeMentor
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-500 -mt-1">
                AI Learning Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/80 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 pl-3 py-1 text-xs text-slate-600 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
                  </div>
                  <span className="font-medium text-slate-700 hidden xl:inline">
                    {user?.firstName || "User"}
                  </span>
                </div>

                <button
                  onClick={handleDashboardRedirect}
                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-md transition-all duration-150"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-md transition-all duration-150 flex items-center space-x-1.5"
                >
                  <span>Get Started</span>
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {isSignedIn ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDashboardRedirect();
                  }}
                  className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg text-center"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-slate-600 hover:text-red-600 text-sm font-medium py-2 rounded-lg text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg text-center"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
