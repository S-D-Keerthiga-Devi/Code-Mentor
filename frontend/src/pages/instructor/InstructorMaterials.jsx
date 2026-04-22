import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentArrowUpIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const InstructorMaterials = () => {
    const [file, setFile] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/course-materials");
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
            toast.warning("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            await axios.post("http://localhost:5000/api/course-materials/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Material uploaded successfully!");
            setFile(null);
            // Reset file input
            document.getElementById("file-upload").value = "";
            fetchMaterials();
        } catch (error) {
            console.error("Error uploading material:", error);
            toast.error("Failed to upload material.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <Navbar />

            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-indigo-600">Instructor: Course Materials</h1>

                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                            <DocumentArrowUpIcon className="h-6 w-6 mr-2 text-green-600" />
                            Upload New Material (PDF)
                        </h2>
                        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-center">
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                cursor-pointer bg-gray-50 rounded-lg border border-gray-300"
                            />
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${uploading
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                        </form>
                    </div>

                    {/* Materials List */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                            <DocumentTextIcon className="h-6 w-6 mr-2 text-indigo-600" />
                            Uploaded Materials
                        </h2>

                        {loading ? (
                            <p className="text-gray-500 animate-pulse">Loading materials...</p>
                        ) : materials.length === 0 ? (
                            <p className="text-gray-400 italic">No materials uploaded yet.</p>
                        ) : (
                            <div className="grid gap-4">
                                {materials.map((material) => (
                                    <div
                                        key={material._id}
                                        className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <div>
                                            <h3 className="font-medium text-lg text-gray-900">{material.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded border border-indigo-200">
                                            PDF
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default InstructorMaterials;
