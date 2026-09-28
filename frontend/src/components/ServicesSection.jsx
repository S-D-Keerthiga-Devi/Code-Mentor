import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Bug,
  BarChart3,
  Lock,
  Sparkles,
  Users,
  GraduationCap,
  ArrowRight,
  Workflow,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ServicesSection = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleAction = (serviceId) => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }

    if (serviceId === 1) {
      navigate('/safe-suggest');
    } else if (serviceId === 2) {
      const role = localStorage.getItem("userRole");
      if (role === "instructor") navigate("/instructor/materials");
      else navigate("/student/course-bot");
    } else if (serviceId === 3) {
      navigate("/visual-debugger");
    } else if (serviceId === 4) {
      navigate("/safe-suggest");
    } else if (serviceId === 7) {
      const roomId = Math.random().toString(36).substring(2, 7);
      navigate(`/collab/room-${roomId}`);
    }
  };

  const services = [
    {
      id: 1,
      title: "Smart Code Assistant & IDE",
      description: "AI-powered coding suggestions with integrated unit testing, AST validation, and single-click auto-fixes.",
      icon: ShieldCheck,
      badge: "Production Ready",
      category: "Core Engine",
      color: "indigo",
      features: ["Verified Suggestions", "Socratic Code Smells", "One-Click Fixes"]
    },
    {
      id: 3,
      title: "Visual Debugger & Big-O Pulse",
      description: "Transform complex algorithms into interactive 4D flow graphs with real-time execution heatmaps and Dagre layout.",
      icon: Bug,
      badge: "Interactive Graph",
      category: "Algorithm Visualizer",
      color: "purple",
      features: ["Step-by-step Pulse", "Big-O Time/Space Matrix", "Subgraph Optimization"]
    },
    {
      id: 7,
      title: "Real-Time Multiplayer Coding",
      description: "Collaborative editor powered by Yjs CRDTs over secure WebSockets with shared whiteboard and live chat.",
      icon: Users,
      badge: "Real-Time Sync",
      category: "Collaboration",
      color: "blue",
      features: ["Conflict-Free CRDTs", "Remote Live Cursors", "Shared Whiteboard"]
    },
    {
      id: 2,
      title: "Course Materials AI Assistant",
      description: "Retrieval-Augmented Generation that searches course PDFs, slide decks, and instructor notes for contextual answers.",
      icon: BookOpen,
      badge: "Context Aware",
      category: "Academic",
      color: "emerald",
      features: ["Course PDF Parsing", "Syllabus Aligned", "Instructor Uplink"]
    },
    {
      id: 4,
      title: "Adaptive Socratic Tutoring",
      description: "Tailored pedagogical feedback that guides you through discovery rather than simply handing out static solutions.",
      icon: GraduationCap,
      badge: "Cognitive AI",
      category: "Education",
      color: "pink",
      features: ["Step-by-Step Hints", "Conceptual Mastery", "No Spoon-Feeding"]
    },
    {
      id: 6,
      title: "Security & Safety Gate",
      description: "Automated vulnerability scanner that checks code for injection risks, unbounded loops, and unsafe operations.",
      icon: Lock,
      badge: "Safety Verified",
      category: "Security",
      color: "amber",
      features: ["AST Safety Audit", "Static Vulnerability Checks", "Secure Sandbox"]
    }
  ];

  const getColorTheme = (color) => {
    switch (color) {
      case "indigo":
        return {
          iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
          badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
          btn: "bg-indigo-600 hover:bg-indigo-700 text-white"
        };
      case "purple":
        return {
          iconBg: "bg-purple-50 text-purple-600 border-purple-100",
          badge: "bg-purple-50 text-purple-700 border-purple-200",
          btn: "bg-purple-600 hover:bg-purple-700 text-white"
        };
      case "blue":
        return {
          iconBg: "bg-blue-50 text-blue-600 border-blue-100",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          btn: "bg-blue-600 hover:bg-blue-700 text-white"
        };
      case "emerald":
        return {
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          btn: "bg-emerald-600 hover:bg-emerald-700 text-white"
        };
      case "pink":
        return {
          iconBg: "bg-pink-50 text-pink-600 border-pink-100",
          badge: "bg-pink-50 text-pink-700 border-pink-200",
          btn: "bg-pink-600 hover:bg-pink-700 text-white"
        };
      default:
        return {
          iconBg: "bg-amber-50 text-amber-600 border-amber-100",
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          btn: "bg-amber-600 hover:bg-amber-700 text-white"
        };
    }
  };

  return (
    <section id="features" className="py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100/80 rounded-full text-indigo-700 text-xs font-semibold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Learning Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Deep Comprehension
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600">
            Interactive AST visual debugging, Socratic smells, and real-time multiplayer coding.
          </p>
        </div>

        {/* Feature Cards Grid - Compact & Sleek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {services.map((service) => {
            const Icon = service.icon;
            const theme = getColorTheme(service.color);

            return (
              <div
                key={service.id}
                className="group relative bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shadow-xs ${theme.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5 line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-3.5 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Feature Bullet Points */}
                  <ul className="space-y-1.5 mb-4 pt-2 border-t border-slate-100">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-[11px] text-slate-500 space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => handleAction(service.id)}
                  className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-150 shadow-xs flex items-center justify-center space-x-1.5 ${theme.btn}`}
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to Accelerate Your Coding Potential?
            </h3>
            <p className="text-indigo-200 text-sm sm:text-base mb-8">
              Join students and developers using CodeMentor to debug faster, understand algorithms intuitively, and collaborate seamlessly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <button
                onClick={() => navigate('/safe-suggest')}
                className="bg-white hover:bg-slate-100 text-indigo-900 font-bold px-7 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center space-x-2"
              >
                <span>Launch Smart IDE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm backdrop-blur-sm"
              >
                Learn Architecture
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;