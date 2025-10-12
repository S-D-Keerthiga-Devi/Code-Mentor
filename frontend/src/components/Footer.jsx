import React from 'react';
import { 
  CodeBracketIcon,
  HeartIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  BugAntIcon,
  ChartBarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const services = [
    { name: "Safe Suggestion Mode", icon: ShieldCheckIcon },
    { name: "Knowledge Packs", icon: BookOpenIcon },
    { name: "Multimodal Debugging", icon: BugAntIcon },
    { name: "Adaptive Tutoring", icon: AcademicCapIcon },
    { name: "Analytics", icon: ChartBarIcon },
    { name: "Security Gate", icon: LockClosedIcon }
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Safe Suggestion", href: "/safe-suggest" },
    { name: "About", href: "/about" }
  ];

  const supportLinks = [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/api-docs" },
    { name: "Help Center", href: "/help" },
    { name: "Contact Support", href: "/contact" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <CodeBracketIcon className="w-8 h-8 text-indigo-400" />
              <span className="text-2xl font-bold">CodeMentor</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI-powered coding assistance with built-in security, safety, and educational features. 
              Empowering students and developers with intelligent code suggestions and comprehensive learning tools.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500 mx-1" />
              <span>for developers</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <li key={index} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm">{service.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 CodeMentor. All rights reserved. Built with React, Node.js, and AI.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/security" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-wrap justify-center items-center space-x-4 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-800 rounded">React</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Node.js</span>
            <span className="px-2 py-1 bg-gray-800 rounded">MongoDB</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Docker</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Socket.IO</span>
            <span className="px-2 py-1 bg-gray-800 rounded">AI/LLM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
