import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Bug, 
  GraduationCap,
  BarChart3,
  Lock,
  Code,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ServicesSection = () => {
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const handleTryNow = (serviceId) => {
    if (serviceId === 1) {
      // Check if user is authenticated
      if (!status) {
        // Redirect to login if not authenticated
        navigate('/login', { 
          state: { 
            message: 'Please login to access the Smart Code Assistant',
            redirectTo: '/safe-suggest'
          }
        });
      } else {
        // User is authenticated, go to Safe Suggestion page
        navigate('/safe-suggest');
      }
    }
  };

  const services = [
    {
      id: 1,
      title: "Smart Code Assistant",
      tagline: "Get safe, tested suggestions instantly",
      description: "Stuck on a problem? Our AI assistant provides code suggestions that are automatically tested before you see them. No more copy-pasting broken code!",
      icon: ShieldCheck,
      status: "active",
      benefits: [
        "Get hints when you're stuck",
        "Suggestions are tested automatically",
        "See exactly what will change",
        "Know how reliable each suggestion is",
        "Apply fixes with one click"
      ],
      howItWorks: "Ask for help → AI creates a solution → We test it automatically → You see only verified suggestions that actually work"
    },
    {
      id: 2,
      title: "Course Materials Library",
      tagline: "AI that knows your coursework",
      description: "Your instructor's slides, notes, and materials are built into the assistant. Get help that's perfectly aligned with what you're learning in class.",
      icon: BookOpen,
      status: "coming-soon",
      benefits: [
        "Assistance based on your course content",
        "References your class materials",
        "Aligned with what you're learning",
        "Works with PDFs and slides",
        "No more generic answers"
      ],
      howItWorks: "Your instructor uploads course materials → AI learns from them → You get help that matches your coursework"
    },
    {
      id: 3,
      title: "Visual Debugging Tools",
      tagline: "See, hear, and understand your code",
      description: "Everyone learns differently. Debug your code with animations, audio explanations, written guides, or interactive tools - whatever works best for you.",
      icon: Bug,
      status: "coming-soon",
      benefits: [
        "Watch your code run step-by-step",
        "Listen to explanations while coding",
        "Export debugging reports",
        "Interactive drag-and-drop learning",
        "Find common mistakes automatically"
      ],
      howItWorks: "Choose your learning style → Run your code → See/hear/interact with what's happening → Understand problems faster"
    },
    {
      id: 4,
      title: "Personalized Tutoring",
      tagline: "Help that adapts to your needs",
      description: "Want to figure it out yourself or need direct help? Choose from guiding questions, helpful hints, or complete solutions with explanations.",
      icon: GraduationCap,
      status: "coming-soon",
      benefits: [
        "Questions that guide you to answers",
        "Hints when you need a nudge",
        "Complete solutions when stuck",
        "Adapts to your learning style",
        "Builds problem-solving skills"
      ],
      howItWorks: "Pick how much help you want → AI adjusts its teaching style → Get the right amount of guidance → Learn at your own pace"
    },
    {
      id: 5,
      title: "Progress Insights",
      tagline: "Track your learning journey",
      description: "See where you're spending time, when you get stuck, and how you're improving. Instructors can spot students who need extra help.",
      icon: BarChart3,
      status: "coming-soon",
      benefits: [
        "See your progress over time",
        "Identify challenging topics",
        "Track AI assistance usage",
        "Team collaboration insights",
        "Get help when you're stuck"
      ],
      howItWorks: "Your coding sessions are tracked → Patterns are identified → You and your instructor see insights → Get targeted help"
    },
    {
      id: 6,
      title: "Safety & Security Checks",
      tagline: "Learn good coding practices",
      description: "Every suggestion is checked for security issues. Learn not just what works, but what's safe and follows best practices.",
      icon: Lock,
      status: "coming-soon",
      benefits: [
        "Understand why suggestions work",
        "Catch security vulnerabilities",
        "Learn safe coding practices",
        "Get improvement recommendations",
        "Build secure code from day one"
      ],
      howItWorks: "AI creates a suggestion → Security checks run automatically → You see explanations and warnings → Learn safe coding habits"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Learn Coding
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Smart tools that help you write better code, understand problems faster, and learn at your own pace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
                  service.status === 'active' 
                    ? 'border-2 border-indigo-400' 
                    : 'border border-gray-200'
                }`}
              >
                {service.status === 'active' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold shadow-lg">
                    ✨ Available Now
                  </div>
                )}

                <div className="p-8">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg ${
                    service.status === 'active'
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <IconComponent className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-indigo-600 font-medium mb-4 text-sm">
                    {service.tagline}
                  </p>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      What You Get:
                    </h4>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <div className={`w-1.5 h-1.5 rounded-full mr-3 mt-1.5 flex-shrink-0 ${
                            service.status === 'active' ? 'bg-indigo-500' : 'bg-gray-400'
                          }`}></div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <h5 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
                      <Code className="w-4 h-4 text-indigo-600 mr-2" />
                      How It Works
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{service.howItWorks}</p>
                  </div>

                  <div className="mt-6">
                    {service.status === 'active' ? (
                      <button 
                        onClick={() => handleTryNow(service.id)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Try It Now →
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-xl font-medium text-center border border-gray-200">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Code Smarter?
            </h3>
            <p className="text-lg text-indigo-50 mb-8 max-w-2xl mx-auto">
              Join students who are learning faster with AI-powered assistance that's safe, smart, and built for education.
            </p>
            <button 
              onClick={() => handleTryNow(1)}
              className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center"
            >
              Start Learning Now
              <Sparkles className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;