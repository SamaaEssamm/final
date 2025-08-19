'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPlus } from "react-icons/fa";

type Suggestion = {
    suggestion_id: string;
    reference_code: number;
    suggestion_title: string;
    suggestion_message: string;
    suggestion_type: string;
    suggestion_dep: string;
    suggestion_created_at: string;
    suggestion_status?: string;
};

export default function SuggestionsPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const api = process.env.NEXT_PUBLIC_API_URL;
    
    useEffect(() => {
        const email = localStorage.getItem('student_email');
        if (!email) {
            router.push('/login');
            return;
        }

        const role = localStorage.getItem("role");
        if (role !== "student") {
            router.push("/no-access");
            return;
        }
        
        const fetchData = async () => {
            try {
                const email = localStorage.getItem("student_email");
                if (!email) {
                    console.warn("No email found in localStorage");
                    return;
                }

                const res = await fetch(`${api}/api/student/showsuggestions?student_email=${email}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setSuggestions(data);
                } else if (Array.isArray(data.suggestions)) {
                    setSuggestions(data.suggestions);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddSuggestion = () => {
        router.push('/student_suggestions_add');
    };

    const statusMap: Record<string, { label: string; color: string }> = {
        unreviewed: { label: 'Unreviewed', color: 'bg-red-100 text-red-800' },
        reviewed: { label: 'Reviewed', color: 'bg-green-100 text-green-800' },
    };

    return (
        <main className="relative min-h-screen px-6 md:px-12 lg:px-24 pt-20 flex flex-col items-center overflow-hidden"
            style={{ background: 'radial-gradient(circle at 20% 20%, #60a5fa, #3b82f6 40%, #1e3a8a 90%)' }}
        >
            {/* Glow spots */}
            <div className="absolute top-[-80px] left-[-60px] w-96 h-96 bg-blue-300 rounded-full opacity-30 filter blur-4xl animate-blob"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-400 rounded-full opacity-20 filter blur-4xl animate-blob animation-delay-2500"></div>
            <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-blue-200 rounded-full opacity-15 filter blur-6xl -translate-x-1/2 -translate-y-1/2"></div>

            {/* Header */}
            <div className="flex flex-wrap gap-3 justify-between items-center w-full max-w-6xl mb-8 z-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white relative drop-shadow-lg">
                    My Suggestions
                </h1>
                
                {/* Add Suggestion Button */}
                <button
                    onClick={handleAddSuggestion}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                >
                    <FaPlus /> Add Suggestion
                </button>
            </div>

            {/* Suggestions Table */}
            {loading ? (
                <p className="text-white mt-20 animate-bounce-fade">Loading suggestions...</p>
            ) : suggestions.length === 0 ? (
                <p className="text-white mt-20">You haven't submitted any suggestions yet.</p>
            ) : (
                <div className="relative w-full max-w-6xl overflow-x-auto rounded-3xl shadow-2xl border border-blue-200 bg-white z-10">
                    <table className="min-w-full text-sm text-blue-900">
                        <thead className="bg-blue-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-left">Code</th>
                                <th className="px-6 py-3 font-semibold text-left">Title</th>
                                <th className="px-6 py-3 font-semibold text-left">Department</th>
                                <th className="px-6 py-3 font-semibold text-left">Name Display</th>
                                <th className="px-6 py-3 font-semibold text-left">Date</th>
                                {suggestions[0]?.suggestion_status && (
                                    <th className="px-6 py-3 font-semibold text-left">Status</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map((suggestion, idx) => (
                                <tr
                                    key={suggestion.suggestion_id}
                                    onClick={() => router.push(`/student_suggestions/${suggestion.suggestion_id}`)}
                                    className={`border-t border-blue-200 transition cursor-pointer ${
                                        idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100/50"
                                    } hover:bg-blue-200/60`}
                                    style={{ animation: `fadeUp 0.5s ease forwards ${idx * 0.08}s` }}
                                >
                                    <td className="px-6 py-3">{suggestion.reference_code}</td>
                                    <td className="px-6 py-3">{suggestion.suggestion_title}</td>
                                    <td className="px-6 py-3 capitalize">{suggestion.suggestion_type}</td>
                                    <td className="px-6 py-3 capitalize">
                                        {suggestion.suggestion_dep === "public" ? "Hidden" : "Shown"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {new Date(suggestion.suggestion_created_at).toLocaleDateString()}
                                    </td>
                                    {suggestion.suggestion_status && (
                                        <td className="px-6 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                statusMap[suggestion.suggestion_status]?.color || 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {statusMap[suggestion.suggestion_status]?.label || suggestion.suggestion_status}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Back Floating Button */}
            <button
                onClick={() => router.push('/student_dashboard')}
                title="Back"
                className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 z-20"
            >
                <FaArrowLeft size={22} />
            </button>

            {/* Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2500 {
                    animation-delay: 2.5s;
                }

                @keyframes bounce-fade {
                    0% { opacity: 0; transform: translateY(-10px); }
                    50% { opacity: 1; transform: translateY(5px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-bounce-fade {
                    animation: bounce-fade 0.6s ease forwards;
                }

                @keyframes fadeUp {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}