'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type suggestion = {
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

export default function ManagesuggestionsPage() {
  const [suggestions, setsuggestions] = useState<suggestion[]>([]);
  const [loading, setLoading] = useState(true);
const [selectedType, setSelectedType] = useState("All");
const [selectedStatus, setSelectedStatus] = useState("All");


  const router = useRouter();

  useEffect(() => {
    const fetchsuggestions = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/admin/get_all_suggestions');
        const data = await res.json();

        if (Array.isArray(data)) {
          setsuggestions(data);
        } else if (Array.isArray(data.suggestions)) {
          setsuggestions(data.suggestions);
        } else {
          setsuggestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchsuggestions();
  }, []);

  const filteredsuggestions = suggestions.filter((suggestion) => {
  const typeMatch =
    selectedType === "All" || suggestion.suggestion_type === selectedType;

  const normalizedStatus = selectedStatus;


  const statusMatch =
    selectedStatus === "All" ||
    suggestion.suggestion_status === normalizedStatus;

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
      return 'text-red-600';
    case 'reviewed':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};


  return (
    <div className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-8">Manage suggestions</h1>

      <div className="flex gap-4 mb-6">
  {/* Type Filter */}
  <div>
    <label htmlFor="typeFilter" className="mr-2 font-medium text-gray-700">
      Filter by Type:
    </label>
    <select
      id="typeFilter"
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="border border-gray-300 rounded px-3 py-1"
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
    <label htmlFor="statusFilter" className="mr-2 font-medium text-gray-700">
      Filter by Status:
    </label>
    <select
      id="statusFilter"
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      className="border border-gray-300 rounded px-3 py-1"
    >
      <option value="All">All</option>
      <option value="unreviewed">Unreviewed</option>
      <option value="reviewed">Reviewed</option>
      
    </select>
  </div>
</div>


      {loading ? (
        <p>Loading suggestions...</p>
      ) : filteredsuggestions.length === 0 ? (
        <p className="text-gray-500">No suggestions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                 <th className="px-4 py-3 font-medium text-gray-700">Suggestion code </th>
                <th className="px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 font-medium text-gray-700">Student</th>
                <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredsuggestions.map((c) => (
                <tr
                  key={c.suggestion_id}
                  className="border-t border-gray-200 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => router.push(`/admin_suggestion/${c.suggestion_id}`)}
                >
                   <td className="px-4 py-2">{c.reference_code}</td> 
                  <td className="px-4 py-2">{c.suggestion_title}</td>
                  <td className="px-4 py-2">{typeLabels[c.suggestion_type] || c.suggestion_type}</td>
                  <td className="px-4 py-2">{new Date(c.suggestion_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {c.suggestion_dep === 'public' ? c.student_email : 'Unknown'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`font-medium ${getStatusColor(c.suggestion_status)}`}>
                    {statusLabels[c.suggestion_status] || c.suggestion_status}
                    </span>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}