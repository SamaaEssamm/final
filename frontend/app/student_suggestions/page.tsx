'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from "react-icons/fa";
type Suggestion = {
    suggestion_id: string;
    reference_code: number;
    suggestion_title: string;
    suggestion_message: string;
    suggestion_type: string;
    suggestion_dep: string;
    suggestion_created_at: string;
};

export default function SuggestionsPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

                const res = await fetch(`https://web-production-93bbb.up.railway.app/api/student/showsuggestions?student_email=${email}`);
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

    return (
        <main className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#003087]">My Suggestions</h1>
                <button
                    onClick={handleAddSuggestion}
                    className="bg-[#003087] text-white px-4 py-2 rounded-2xl text-sm hover:bg-[#002060] transition"
                >
                    + Add Suggestion
                </button>

                <button
                onClick={() => router.push('/student_dashboard')}
                title="Back"
                className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
                >
                <FaArrowLeft size={26} />
                </button>
                
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : suggestions.length === 0 ? (
                <p className="text-gray-500">You haven't submitted any suggestions yet.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
                    <table className="min-w-full bg-white text-sm">
                     <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-700">Suggestion Code</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Title</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Department</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Name Display</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Date</th>
                    </tr>
                    </thead>

<tbody>
  {suggestions.map((s) => (
    <tr
      key={s.suggestion_id}
      className="cursor-pointer hover:bg-gray-100 transition border-t border-gray-200"
      onClick={() => router.push(`/student_suggestions/${s.suggestion_id}`)}
    >
   
      <td className="px-4 py-2">{s.reference_code}</td>
      <td className="px-4 py-2">{s.suggestion_title}</td>
      <td className="px-4 py-2 capitalize">{s.suggestion_type}</td>
      <td className="px-4 py-2 capitalize">
        {s.suggestion_dep === "public" ? "Hidden" : "Shown"}
      </td>
      <td className="px-4 py-2">
        {new Date(s.suggestion_created_at).toLocaleDateString()}
      </td>
    </tr>
  ))}
</tbody>


                    </table>
                </div>
            )}
        </main>
    );
}
