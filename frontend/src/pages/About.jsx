import React from 'react';
import {
    ShieldCheck,
    BookOpen,
    Bug,
    GraduationCap,
    BarChart3,
    Lock,
    Code,
    CheckCircle,
    Sparkles,
    Target,
    Heart
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    const services = [
        {
            id: 1,
            title: "Smart Code Assistant",
            tagline: "Get safe, tested suggestions instantly",
            description: "Stuck on a problem? Our AI assistant provides code suggestions that are automatically tested before you see them. No more copy-pasting broken code!",
            icon: ShieldCheck,
            color: "indigo",
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
            color: "blue",
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
            color: "purple",
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
            color: "pink",
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
            color: "green",
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
            color: "red",
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

    const getColorClasses = (color) => {
        const colors = {
            indigo: 'from-indigo-500 to-indigo-600',
            blue: 'from-blue-500 to-blue-600',
            purple: 'from-purple-500 to-purple-600',
            pink: 'from-pink-500 to-pink-600',
            green: 'from-green-500 to-green-600',
            red: 'from-red-500 to-red-600'
        };
        return colors[color] || colors.indigo;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        About CodeMentor
                    </h1>
                    <p className="text-xl text-indigo-50 max-w-3xl mx-auto leading-relaxed">
                        We're building the future of coding education with AI-powered tools that make learning faster, safer, and more personalized.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
                                <Target className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-4">
                                To empower every student with AI-powered coding assistance that's safe, smart, and built specifically for education.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                We believe that learning to code should be accessible, engaging, and personalized to each student's needs. Our platform combines cutting-edge AI technology with educational best practices to create tools that truly help students learn.
                            </p>
                        </div>
                        <div>
                            <div className="inline-flex items-center justify-center p-2 bg-pink-100 rounded-full mb-4">
                                <Heart className="w-6 h-6 text-pink-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why We Built This</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-4">
                                Traditional coding help is either too generic (online forums) or too slow (waiting for office hours). We wanted something better.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                CodeMentor provides instant, personalized help that's grounded in your actual coursework, tested for safety, and designed to help you learn - not just get answers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Detail Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Features in Detail
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to learn coding effectively
                        </p>
                    </div>

                    <div className="space-y-12">
                        {services.map((service, index) => {
                            const IconComponent = service.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={service.id}
                                    className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isEven ? '' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    <div className="md:flex">
                                        <div className={`md:w-1/3 bg-gradient-to-br ${getColorClasses(service.color)} p-8 flex items-center justify-center`}>
                                            <div className="text-center text-white">
                                                <IconComponent className="w-20 h-20 mx-auto mb-4" />
                                                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                                                <p className="text-sm opacity-90">{service.tagline}</p>
                                            </div>
                                        </div>
                                        <div className="md:w-2/3 p-8">
                                            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                                                {service.description}
                                            </p>

                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-900 flex items-center mb-3">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                                    What You Get:
                                                </h4>
                                                <ul className="grid md:grid-cols-2 gap-3">
                                                    {service.benefits.map((benefit, idx) => (
                                                        <li key={idx} className="flex items-start text-gray-700">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3 mt-2 flex-shrink-0"></div>
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
                                                <p className="text-sm text-gray-600 leading-relaxed">{service.howItWorks}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-10 text-white shadow-2xl">
                        <h2 className="text-3xl font-bold mb-4">
                            Ready to Transform Your Learning?
                        </h2>
                        <p className="text-lg text-indigo-50 mb-8">
                            Join students who are coding smarter with AI-powered assistance
                        </p>
                        <a
                            href="/login"
                            className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl"
                        >
                            Get Started Now
                            <Sparkles className="w-5 h-5 ml-2" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
