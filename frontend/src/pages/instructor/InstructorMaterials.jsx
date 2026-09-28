import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    DocumentArrowUpIcon,
    DocumentTextIcon,
    ArrowUpTrayIcon,
    TrashIcon,
    CheckCircleIcon,
    CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import AppDashboardLayout from "../../components/dashboard/AppDashboardLayout";

const InstructorMaterials = () => {
    const [file, setFile] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/course-materials`);
            setMaterials(response.data);
        } catch (error) {
            console.error("Error fetching materials:", error);
            toast.error("Failed to load materials.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.warning("Please select a PDF document first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            await axios.post(`${backendUrl}/api/course-materials/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Course material uploaded and indexed successfully!");
            setFile(null);
            const fileInput = document.getElementById("file-upload");
            if (fileInput) fileInput.value = "";
            fetchMaterials();
        } catch (error) {
            console.error("Error uploading material:", error);
            toast.error("Failed to upload material.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <AppDashboardLayout role="instructor" activeKey="materials">
            <div className="space-y-8 max-w-5xl">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/40 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
                            <CloudArrowUpIcon className="w-3.5 h-3.5" />
                            Knowledge Base Engine
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Course Materials & Syllabi
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Upload PDF lecture slides, problem sets, and syllabi for automatic RAG embedding & student AI assistance.
                        </p>
                    </div>
                </div>

                {/* Upload Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                        <ArrowUpTrayIcon className="w-5 h-5 text-indigo-400" />
                        Upload New Course Material (.PDF)
                    </h2>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-6 transition-colors bg-slate-950/40 text-center">
                            <DocumentArrowUpIcon className="w-10 h-10 mx-auto text-indigo-400/80 mb-3" />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer text-sm font-medium text-indigo-400 hover:text-indigo-300"
                            >
                                <span>Choose a PDF file</span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                                {file ? (
                                    <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5 mt-2">
                                        <CheckCircleIcon className="w-4 h-4" /> Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                ) : (
                                    "PDF documents up to 25MB supported"
                                )}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={uploading || !file}
                                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                                    uploading || !file
                                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20"
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing & Indexing...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpTrayIcon className="w-4 h-4" />
                                        Upload Material
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Materials List */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                            Indexed Materials ({materials.length})
                        </h2>
                        <button
                            onClick={fetchMaterials}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Refresh List
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs">Loading course materials...</p>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <DocumentTextIcon className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                            <p className="text-sm font-medium text-slate-400">No materials uploaded yet</p>
                            <p className="text-xs text-slate-500 mt-1">Uploaded PDF files will appear here for student RAG querying.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {materials.map((material) => (
                                <div
                                    key={material._id}
                                    className="p-4 bg-slate-950/60 rounded-xl flex items-center justify-between border border-slate-800/80 hover:border-slate-700 transition-all group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                            <DocumentTextIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                                                {material.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Indexed {new Date(material.uploadedAt).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold tracking-wider uppercase bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/20">
                                            Vector Indexed
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppDashboardLayout>
    );
};

export default InstructorMaterials;
