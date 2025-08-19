'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaFilter } from "react-icons/fa";
import { useParams, useRouter } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL;

type Complaint = {
  complaint_id: number;
  reference_code: number;
  complaint_title: string;
  complaint_message: string;
  complaint_type: string;
  complaint_dep: string;
  complaint_status: string;
  complaint_date: string;
  response_message: string | null;
  student_email: string;
};

export default function ManageComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const router = useRouter();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch(`${api}/api/admin/get_all_complaints`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setComplaints(data);
        } else if (Array.isArray(data.complaints)) {
          setComplaints(data.complaints);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const typeMatch =
      selectedType === "All" || complaint.complaint_type === selectedType;

    const normalizedStatus =
      selectedStatus === "responded"
        ? "done"
        : selectedStatus === "received"
        ? "under_checking"
        : selectedStatus === "under review"
        ? "under_review"
        : selectedStatus;

    const statusMatch =
      selectedStatus === "All" ||
      complaint.complaint_status === normalizedStatus;

    return typeMatch && statusMatch;
  });

  const departmentLabels: { [key: string]: string } = {
    IT: 'IT',
    academic: 'Academic',
    activities: 'Activities',
    administrative: 'Administrative',
  };

  const statusLabels: { [key: string]: string } = {
    under_checking: 'Received',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    done: 'Responded',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_checking':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'done':
        return 'bg-purple-100 text-purple-800';
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
          Manage Complaints
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
              <option value="under_checking">Received</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Responded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <p className="text-white mt-20 animate-bounce-fade">Loading complaints...</p>
      ) : filteredComplaints.length === 0 ? (
        <p className="text-white mt-20">No complaints found.</p>
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
              {filteredComplaints.map((complaint, idx) => (
                <tr
                  key={complaint.complaint_id}
                  onClick={() => router.push(`/admin_complaint/${complaint.complaint_id}`)}
                  className={`border-t border-blue-200 transition cursor-pointer ${
                    idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100/50"
                  } hover:bg-blue-200/60`}
                  style={{ animation: `fadeUp 0.5s ease forwards ${idx * 0.08}s` }}
                >
                  <td className="px-6 py-3">{complaint.reference_code}</td>
                  <td className="px-6 py-3">{complaint.complaint_title}</td>
                  <td className="px-6 py-3">{departmentLabels[complaint.complaint_type] || complaint.complaint_type}</td>
                  <td className="px-6 py-3">{new Date(complaint.complaint_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    {complaint.complaint_dep === "public" ? "Unknown" : complaint.student_email}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.complaint_status)}`}>
                      {statusLabels[complaint.complaint_status] || complaint.complaint_status}
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