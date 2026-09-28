import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Play,
  Layers,
  Users,
  ShieldCheck,
  Code2,
  Terminal,
  Activity,
  ArrowRight
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();

  const handleLaunchCollab = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 7);
    navigate(`/collab/${randomRoomId}`);
  };

  return (
    <header className="relative w-full overflow-hidden bg-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60 bg-grid-pattern">
      {/* Ambient Gradient Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-indigo-400/20 via-purple-400/20 to-pink-400/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Announcement Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 shadow-xs text-xs font-semibold text-indigo-700 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>AI-Powered Socratic Tutoring & Real-Time Sync</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Master Code with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Intelligent Mentorship
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience the next-generation developer platform. Combine Socratic AI guidance,
              4D algorithmic heatmaps, verified auto-fixes, and live multiplayer coding in one seamless environment.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3.5 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/safe-suggest")}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
              >
                <span>Launch Smart IDE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/visual-debugger")}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-5 py-3.5 rounded-xl shadow-xs hover:border-slate-300 transition-all duration-200 text-sm sm:text-base"
              >
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Visual Debugger</span>
              </button>

              <button
                onClick={handleLaunchCollab}
                className="inline-flex items-center space-x-2 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/60 font-semibold px-5 py-3.5 rounded-xl transition-all duration-200 text-sm sm:text-base"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Live Collaboration</span>
              </button>
            </div>

            {/* Feature Highlights Chips */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">0 ms</span>
                <span className="text-xs text-slate-500 font-medium">CRDT Yjs Sync</span>
              </div>
              <div className="flex flex-col items-center lg:items-start border-x border-slate-200 px-4">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">100%</span>
                <span className="text-xs text-slate-500 font-medium">Safe AI Fixes</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-bold text-slate-900">4D</span>
                <span className="text-xs text-slate-500 font-medium">Big-O Heatmap</span>
              </div>
            </div>

          </div>

          {/* Right Mockup Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-lg">
              
              {/* Decorative Background Card Shadow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              {/* Mockup Frame */}
              <div className="relative rounded-2xl bg-[#181825] border border-slate-800 shadow-2xl overflow-hidden text-left">
                
                {/* Window Header */}
                <div className="bg-[#1e1e2e] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                    <span className="text-xs font-mono text-slate-400 pl-3">BinarySearch.js</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      AI Connected
                    </span>
                  </div>
                </div>

                {/* Code Window Content */}
                <div className="p-4 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto space-y-1">
                  <div>
                    <span className="text-purple-400">function</span>{" "}
                    <span className="text-blue-400">binarySearch</span>
                    <span className="text-slate-400">(arr, target) &#123;</span>
                  </div>
                  <div className="pl-4 text-slate-400">
                    <span className="text-purple-400">let</span> left = 0, right = arr.length - 1;
                  </div>
                  <div className="pl-4 text-slate-400">
                    <span className="text-purple-400">while</span> (left &lt;= right) &#123;
                  </div>
                  <div className="pl-8 bg-indigo-950/50 -mx-4 px-8 py-1 border-l-2 border-indigo-400 text-indigo-200">
                    <span className="text-purple-400">const</span> mid = Math.floor((left + right) / 2);
                  </div>
                  <div className="pl-8 text-slate-400">
                    <span className="text-purple-400">if</span> (arr[mid] === target) <span className="text-purple-400">return</span> mid;
                  </div>
                  <div className="pl-4 text-slate-400">&#125;</div>
                  <div className="text-slate-400">&#125;</div>
                </div>

                {/* AI Interactive Socratic Hint Card */}
                <div className="m-3 p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 backdrop-blur-md">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                        Socratic AI Coach
                        <span className="text-[10px] bg-indigo-500/40 text-indigo-300 px-1.5 py-0.2 rounded font-normal">
                          Active Hint
                        </span>
                      </h4>
                      <p className="text-[11px] text-indigo-300/80 mt-1 leading-snug">
                        "Consider integer overflow for very large arrays. How might <code className="text-indigo-200 font-mono">left + (right - left) / 2</code> improve robustness?"
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
