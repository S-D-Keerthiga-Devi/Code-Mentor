import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Heart,
  ShieldCheck,
  BookOpen,
  Bug,
  GraduationCap,
  Users,
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: "Smart IDE", href: "/safe-suggest" },
    { name: "Visual Debugger", href: "/visual-debugger" },
    { name: "Live Collaboration", href: `/collab/room-${Math.random().toString(36).substring(2, 7)}` },
    { name: "Course Bot", href: "/student/course-bot" },
    { name: "About Architecture", href: "/about" },
  ];

  const coreModules = [
    { name: "Socratic Smells", icon: Sparkles },
    { name: "AST Unit Testing", icon: ShieldCheck },
    { name: "Big-O Heatmap", icon: Bug },
    { name: "Yjs CRDT Engine", icon: Users },
    { name: "Vector Search RAG", icon: BookOpen },
    { name: "Vulnerability Gate", icon: Lock },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-850 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                CodeMentor
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The intelligent AI coding workspace designed for students and educators. Real-time multiplayer synchronization, Socratic code smell diagnostics, and interactive algorithm flow visualizers.
            </p>

            <div className="flex items-center text-xs text-slate-500 pt-2 space-x-1.5">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for the next generation of developers</span>
            </div>
          </div>

          {/* Core Engines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Core Modules
            </h4>
            <ul className="space-y-2.5">
              {coreModules.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx} className="flex items-center space-x-2 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-indigo-400/80" />
                    <span>{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Explore Suite
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack Highlights */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Infrastructure
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {["React 19", "Monaco Editor", "Yjs CRDTs", "Node.js", "Socket.IO", "React Flow", "Clerk Auth", "Google Gemini"].map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Terms */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 space-y-3 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} CodeMentor Platform. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">Documentation</Link>
            <Link to="/safe-suggest" className="hover:text-slate-400 transition-colors">Workspace</Link>
            <Link to="/" className="hover:text-slate-400 transition-colors">Home</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
