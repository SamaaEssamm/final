'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaFilter } from "react-icons/fa";

type Suggestion = {
  suggestion_id: number;
  reference_code: number;
  suggestion_title: string;
  suggestion_message: string;
  suggestion_type: string;
  suggestion_dep: string;
  suggestion_status: string;
  suggestion_date: string;
  student_email: string;
};

export default function ManageSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const api = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/no-access");
      return;
    }
    
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${api}/api/admin/get_all_suggestions`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setSuggestions(data);
        } else if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const filteredSuggestions = suggestions.filter((suggestion) => {
    const typeMatch =
      selectedType === "All" || suggestion.suggestion_type === selectedType;

    const statusMatch =
      selectedStatus === "All" ||
      suggestion.suggestion_status === selectedStatus;

    return typeMatch && statusMatch;
  });

  const typeLabels: { [key: string]: string } = {
    IT: 'IT',
    academic: 'Academic',
    activities: 'Activities',
    administrative: 'Administrative',
  };

  const statusLabels: { [key: string]: string } = {
    reviewed: 'Reviewed',
    unreviewed: 'Unreviewed',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unreviewed':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          Manage Suggestions
        </h1>
        
        {/* Filters */}
        <div className="flex gap-4 items-center bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
          <FaFilter className="text-blue-200" />
          
          {/* Department Filter */}
          <div>
            <label htmlFor="typeFilter" className="mr-2 font-medium text-blue-200 text-sm">
              Department:
            </label>
            <select
              id="typeFilter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-blue-300 bg-blue-800/40 text-white rounded-xl px-3 py-1 focus:ring-2 focus:ring-blue-400 text-sm"
            >
              <option value="All">All</option>
              <option value="IT">IT</option>
              <option value="academic">Academic</option>
              <option value="activities">Activities</option>
              <option value="administrative">Administrative</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="mr-2 font-medium text-blue-200 text-sm">
              Status:
            </label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-blue-300 bg-blue-800/40 text-white rounded-xl px-3 py-1 focus:ring-2 focus:ring-blue-400 text-sm"
            >
              <option value="All">All</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions Table */}
      {loading ? (
        <p className="text-white mt-20 animate-bounce-fade">Loading suggestions...</p>
      ) : filteredSuggestions.length === 0 ? (
        <p className="text-white mt-20">No suggestions found.</p>
      ) : (
        <div className="relative w-full max-w-6xl overflow-x-auto rounded-3xl shadow-2xl border border-blue-200 bg-white z-10">
          <table className="min-w-full text-sm text-blue-900">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-left">Code</th>
                <th className="px-6 py-3 font-semibold text-left">Title</th>
                <th className="px-6 py-3 font-semibold text-left">Department</th>
                <th className="px-6 py-3 font-semibold text-left">Date</th>
                <th className="px-6 py-3 font-semibold text-left">Student</th>
                <th className="px-6 py-3 font-semibold text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuggestions.map((suggestion, idx) => (
                <tr
                  key={suggestion.suggestion_id}
                  onClick={() => router.push(`/admin_suggestion/${suggestion.suggestion_id}`)}
                  className={`border-t border-blue-200 transition cursor-pointer ${
                    idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100/50"
                  } hover:bg-blue-200/60`}
                  style={{ animation: `fadeUp 0.5s ease forwards ${idx * 0.08}s` }}
                >
                  <td className="px-6 py-3">{suggestion.reference_code}</td>
                  <td className="px-6 py-3">{suggestion.suggestion_title}</td>
                  <td className="px-6 py-3">{typeLabels[suggestion.suggestion_type] || suggestion.suggestion_type}</td>
                  <td className="px-6 py-3">{new Date(suggestion.suggestion_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{suggestion.student_email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.suggestion_status)}`}>
                      {statusLabels[suggestion.suggestion_status] || suggestion.suggestion_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back Floating Button */}
      <button
        onClick={() => router.push('/admin_dashboard')}
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