import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Bug,
  GraduationCap,
  BarChart3,
  Lock,
  Code,
  CheckCircle2,
  Sparkles,
  Target,
  Heart,
  Cpu,
  Zap,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const modules = [
    {
      id: 1,
      title: "Smart Code Assistant & IDE",
      tagline: "Verified Socratic code auto-fixes",
      description: "CodeMentor analyzes student code for syntax issues, security smells, and algorithmic inefficiencies, providing verified step-by-step guidance.",
      icon: ShieldCheck,
      color: "indigo",
      benefits: [
        "Socratic hints that encourage learning",
        "AST validation and unit test safety checks",
        "Single-click verified code application",
        "Interactive line-by-line smell markers"
      ],
      howItWorks: "User code is parsed into an AST → Gemini/Groq engines detect smells → Automated test runners verify proposed edits → Safe fixes are presented."
    },
    {
      id: 2,
      title: "Visual Debugger & Big-O Heatmap",
      tagline: "Interactive 4D algorithmic pulse simulation",
      description: "Visualizes code structure and execution flow through animated React Flow graphs with Dagre hierarchical layout and time/space complexity matrices.",
      icon: Bug,
      color: "purple",
      benefits: [
        "Step-by-step visual pulse along graph edges",
        "Interactive zoom, pan, and viewport management",
        "Visual Big-O computational bottleneck markers",
        "Automatic graph subgraph optimization"
      ],
      howItWorks: "Algorithm logic is mapped into directed acyclic graph nodes → Pulse pulses through control branches → Big-O complexity values are computed in real time."
    },
    {
      id: 3,
      title: "Real-Time Multiplayer Coding",
      tagline: "Conflict-free CRDT synchronization",
      description: "Allows students and instructors to code together in real time with shared Monaco editor state, awareness cursors, integrated whiteboard, and chat.",
      icon: Users,
      color: "blue",
      benefits: [
        "Zero-latency Yjs document synchronization",
        "Remote user cursor and selection highlights",
        "Collaborative whiteboard with instant broadcast",
        "Resilient WebSocket reconnection with fallback"
      ],
      howItWorks: "Yjs CRDT models synchronize state over secure WebSockets → Monaco binding maps delta operations → Presence awareness tracks remote cursors."
    },
    {
      id: 4,
      title: "Course Materials AI Assistant",
      tagline: "Syllabus-aligned RAG knowledge engine",
      description: "Instructors upload course PDFs and lecture slides, enabling a domain-specific assistant that answers student questions strictly using course materials.",
      icon: BookOpen,
      color: "emerald",
      benefits: [
        "Accurate answers grounded in lecture slides",
        "Direct citations to uploaded course documents",
        "Instant PDF parsing and knowledge embedding",
        "Eliminates hallucinated, off-curriculum answers"
      ],
      howItWorks: "PDF documents are ingested and chunked → Vector embeddings are stored → User queries perform RAG retrieval for curriculum-accurate answers."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 sm:py-28 bg-grid-pattern">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture & Vision</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Building the Future of <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Computer Science Education
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CodeMentor bridges the gap between static lecture notes and practical coding mastery with real-time multiplayer editing, interactive AST visualization, and verified Socratic AI mentorship.
          </p>
        </div>
      </section>

      {/* Mission & Philosophy */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Our Educational Mission
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Traditional AI tools hand out full solutions without teaching the core concepts. CodeMentor employs Socratic questioning—guiding students step-by-step so they discover solutions independently and retain core principles.
              </p>
            </div>

            <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Safety & Verification
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Every AI suggestion undergoes AST checks and automated unit testing in an isolated environment before being displayed. Students learn secure coding habits from day one.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Detailed Architectural Breakdown */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Platform Architecture in Detail
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A deep look at the specialized modules powering CodeMentor.
            </p>
          </div>

          <div className="space-y-8">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {mod.title}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        {mod.tagline}
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                          Key Capabilities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {mod.benefits.map((b, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Execution Pipeline:</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-mono text-[11px]">
                          {mod.howItWorks}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 rounded-3xl p-10 sm:p-14 text-white shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Coding with CodeMentor Today
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto">
              Ready to experience modern Socratic guidance, 4D algorithm debugging, and real-time collaboration?
            </p>
            <div>
              <Link
                to="/safe-suggest"
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-indigo-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-sm"
              >
                <span>Launch Smart IDE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
