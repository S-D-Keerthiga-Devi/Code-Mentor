import React from "react";
import { Link } from "react-router-dom";
import { ChatBubbleLeftRightIcon, CodeBracketIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { UserButton } from "@clerk/clerk-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const StudentDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <Navbar />

            <div className="flex-1">
                <div className="max-w-7xl mx-auto p-6 md:p-8 pt-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Student Dashboard
                        </h1>
                        <p className="text-gray-600">Welcome back! Ready to learn?</p>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Learning Tools</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Course Bot Card */}
                        <Link
                            to="/student/course-bot"
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Active
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                                Course AI Assistant
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Chat with your course materials. Ask questions about lectures, notes, and assignments.
                            </p>
                        </Link>

                        {/* Smart Code Assistant Card */}
                        <Link
                            to="/safe-suggest"
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-indigo-50 p-3 rounded-lg">
                                    <SparklesIcon className="h-8 w-8 text-indigo-600" />
                                </div>
                                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Active
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                                Smart Code Assistant
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Get AI-powered code suggestions with automatic safety and syntax validation.
                            </p>
                        </Link>

                        {/* Visual Debugger (Placeholder) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-75 cursor-not-allowed">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <CodeBracketIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                    Coming Soon
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Visual Debugger</h3>
                            <p className="text-gray-500 text-sm">
                                Step through your code visually to understand bugs and logic errors.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StudentDashboard;
