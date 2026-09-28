import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  Code2,
  Users,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { toast } from "react-toastify";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleRoleSelect = async (role) => {
    if (!user) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await axios.post(`${backendUrl}/api/user-role/role`, {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
        role: role,
      });

      localStorage.setItem("userRole", role);

      if (role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/instructor/dashboard");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      // Fallback local storage setting so user is never blocked
      localStorage.setItem("userRole", role);
      if (role === "student") navigate("/student/dashboard");
      else navigate("/instructor/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-grid-pattern">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl w-full relative z-10 text-center space-y-4 mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Experience</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Select Your Workspace Role
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Choose your account type to configure your tailored learning or instruction tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full relative z-10">
        
        {/* Student Role Card */}
        <div
          onClick={() => handleRoleSelect("student")}
          className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <Code2 className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Learner
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
              I am a Student
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Access the Smart IDE, get Socratic guidance on code smells, debug algorithms in 4D, and ask the Course AI assistant questions.
            </p>

            <ul className="space-y-2.5 mb-8 border-t border-slate-100 pt-4">
              {[
                "Smart IDE with AI auto-fixes",
                "Visual Debugger with Big-O heatmaps",
                "Real-Time Multiplayer Rooms",
                "Course Materials Chatbot"
              ].map((feat, idx) => (
                <li key={idx} className="flex items-center text-xs text-slate-600 space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all text-sm flex items-center justify-center space-x-2">
            <span>Enter as Student</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Instructor Role Card */}
        <div
          onClick={() => handleRoleSelect("instructor")}
          className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                Educator
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">
              I am an Instructor
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Upload course PDFs, lecture slides, and curriculum packs to power the course-specific RAG AI assistant for your students.
            </p>

            <ul className="space-y-2.5 mb-8 border-t border-slate-100 pt-4">
              {[
                "Upload and parse Course PDFs & Slides",
                "Manage student knowledge packs",
                "Access Smart IDE & Visual Debugger",
                "Host collaborative live coding sessions"
              ].map((feat, idx) => (
                <li key={idx} className="flex items-center text-xs text-slate-600 space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full bg-purple-600 group-hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-purple-500/20 transition-all text-sm flex items-center justify-center space-x-2">
            <span>Enter as Instructor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;
