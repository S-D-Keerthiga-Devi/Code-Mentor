import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Bug,
  BarChart3,
  Lock,
  Sparkles,
  Users, // Added Users icon
  GraduationCap // Added GraduationCap icon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ServicesSection = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleTryNow = (serviceId) => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }

    if (serviceId === 1) {
      navigate('/safe-suggest');
    } else if (serviceId === 2) {
      navigate("/auth-callback");
    } else if (serviceId === 7) {
      // Generate a random room ID for collaboration
      const roomId = Math.random().toString(36).substring(2, 7);
      navigate(`/collab/${roomId}`);
    }
  };

  const services = [
    {
      id: 1,
      title: "Smart Code Assistant",
      description: "Get AI-powered code suggestions that are automatically tested for safety and correctness.",
      icon: ShieldCheck,
      status: "active",
      color: "indigo"
    },
    {
      id: 2,
      title: "Course Materials Library",
      description: "AI assistance based on your actual course content, slides, and materials uploaded by instructors.",
      icon: BookOpen,
      status: "active",
      color: "blue"
    },
    {
      id: 7,
      title: "Real-Time Collaboration",
      description: "Code together in real-time with peers. Share your editor and solve problems instantly.",
      icon: Users,
      status: "active",
      color: "orange"
    },
    {
      id: 3,
      title: "Visual Debugging Tools",
      description: "Debug your code with animations, audio explanations, and interactive tools for better understanding.",
      icon: Bug,
      status: "coming-soon",
      color: "purple"
    },
    {
      id: 4,
      title: "Personalized Tutoring",
      description: "Adaptive learning that adjusts to your needs - from guiding questions to complete solutions.",
      icon: GraduationCap,
      status: "coming-soon",
      color: "pink"
    },
    {
      id: 5,
      title: "Progress Insights",
      description: "Track your learning journey and identify areas where you need extra help.",
      icon: BarChart3,
      status: "coming-soon",
      color: "green"
    },
    {
      id: 6,
      title: "Safety & Security Checks",
      description: "Learn secure coding practices with automatic security vulnerability detection.",
      icon: Lock,
      status: "coming-soon",
      color: "red"
    }
  ];

  const getColorClasses = (color, active) => {
    const colors = {
      indigo: active ? 'from-indigo-500 to-indigo-600' : 'bg-indigo-100 text-indigo-600',
      blue: active ? 'from-blue-500 to-blue-600' : 'bg-blue-100 text-blue-600',
      purple: active ? 'from-purple-500 to-purple-600' : 'bg-purple-100 text-purple-600',
      pink: active ? 'from-pink-500 to-pink-600' : 'bg-pink-100 text-pink-600',
      green: active ? 'from-green-500 to-green-600' : 'bg-green-100 text-green-600',
      red: active ? 'from-red-500 to-red-600' : 'bg-red-100 text-red-600',
      orange: active ? 'from-orange-500 to-orange-600' : 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.indigo;
  };

  return (
    <section id="features" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Everything You Need to Learn Coding
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Smart tools designed to help you write better code and learn faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon;
            const isActive = service.status === 'active';

            return (
              <div
                key={service.id}
                className={`relative bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${isActive ? 'border-2 border-indigo-200' : 'border border-gray-200'
                  }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
                    ✨ Available
                  </div>
                )}

                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isActive
                    ? `bg-gradient-to-br ${getColorClasses(service.color, true)} text-white`
                    : getColorClasses(service.color, false)
                    }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mt-4">
                    {isActive ? (
                      <button
                        onClick={() => handleTryNow(service.id)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        Try It Now →
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 py-2.5 px-4 rounded-lg font-medium text-center text-sm border border-gray-200">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to Code Smarter?
            </h3>
            <p className="text-base text-indigo-50 mb-6 max-w-2xl mx-auto">
              Join students learning faster with AI-powered assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleTryNow(1)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                Start Learning Now
                <Sparkles className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 inline-flex items-center justify-center"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;