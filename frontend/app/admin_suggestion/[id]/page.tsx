'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaPaperclip, FaClock, FaUser, FaUserShield, FaLightbulb, FaCheckCircle, FaEdit, FaSync, FaExclamationCircle } from "react-icons/fa";

export default function SuggestionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const api = process.env.NEXT_PUBLIC_API_URL;
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');

  useEffect(() => {
    if (!id) return;
  
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/no-access");
      return;
    }

    const fetchSuggestion = async () => {
      try {
        const res = await fetch(`${api}/api/admin/get_suggestion?id=${id}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setSuggestion(data);
        setStatus(data.status || 'unreviewed');
      } catch (error) {
        console.error('Error fetching suggestion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, [id]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!id || !status) {
      setStatusMessage('Please select a status.');
      setStatusColor('text-red-600');
      return;
    }

    setUpdating(true);
    setStatusMessage('');
    try {
      const res = await fetch(`${api}/api/admin/update_suggestion_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion_id: id, new_status: status })
      });

      const result = await res.json();
      if (result.status === 'success') {
        setSuggestion({ ...suggestion, status: status });
        setStatusMessage('Status updated successfully!');
        setStatusColor('text-green-600');
        
        // Clear message after 3 seconds
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage('Failed to update status.');
        setStatusColor('text-red-600');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setStatusMessage('An unexpected error occurred.');
      setStatusColor('text-red-600');
    } finally {
      setUpdating(false);
    }
  };

  const statusMap: Record<string, string> = {
    unreviewed: 'Unreviewed',
    reviewed: 'Reviewed'
  };

  const typeMap: Record<string, string> = {
    academic: 'Academic',
    activities: 'Activities',
    administrative: 'Administrative',
    IT: 'IT'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unreviewed': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-800">Loading suggestion details...</p>
      </div>
    </div>
  );

  if (!suggestion) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Suggestion Not Found</h2>
        <p className="text-gray-600 mb-4">The requested suggestion could not be found.</p>
        <button
          onClick={() => router.push('/admin_manage_suggestions')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Suggestions
        </button>
      </div>
    </div>
  );

  const isReviewed = suggestion.status === 'reviewed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center">
              <FaLightbulb className="mr-3 text-blue-600" />
              Suggestion Details
            </h1>
            <p className="text-blue-600 mt-1">Reference: #{suggestion.reference_code}</p>
          </div>
          <button
            onClick={() => router.push('/admin_manage_suggestions')}
            className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to List
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 border-b ${getStatusColor(suggestion.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isReviewed ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaClock className="text-blue-500" />
                )}
                <span className="ml-2 font-semibold">
                  {statusMap[suggestion.status] || suggestion.status}
                </span>
              </div>
              <span className="text-sm">
                {suggestion.suggestion_date
                  ? new Date(suggestion.suggestion_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown date'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Suggestion Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <FaUser className="mr-2" />
                  Student Information
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {suggestion.student_email}</p>
                  <p><span className="font-medium">Name Display:</span>{' '}
                    <span className={`inline-flex items-center ${suggestion.suggestion_dep === "public" ? "text-green-600" : "text-blue-600"}`}>
                      {suggestion.suggestion_dep === "public" ? (
                        <>
                          <FaUserShield className="mr-1" /> Hidden
                        </>
                      ) : (
                        <>
                          <FaUser className="mr-1" /> Shown
                        </>
                      )}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaLightbulb className="mr-2" />
                  Suggestion Details
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {typeMap[suggestion.suggestion_type] || suggestion.suggestion_type}</p>
                  <p><span className="font-medium">Title:</span> {suggestion.suggestion_title}</p>
                </div>
              </div>
            </div>

            {/* Suggestion Message */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaLightbulb className="mr-2 text-blue-600" />
                Suggestion Message
              </h3>
              <div className="prose max-w-none bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {suggestion.suggestion_message}
              </div>
            </div>

            {/* Attachment */}
            {suggestion.suggestion_file_url && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaPaperclip className="mr-2 text-blue-600" />
                  Attachment
                </h3>
                <a
                  href={suggestion.suggestion_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FaPaperclip className="mr-2" />
                  View Attached File
                </a>
              </div>
            )}

            {/* Status Update Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaSync className="mr-2 text-blue-600" />
                Update Status
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <select
                  value={status}
                  onChange={handleStatusChange}
                  disabled={updating}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="unreviewed">Unreviewed</option>
                  <option value="reviewed">Reviewed</option>
                </select>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || status === suggestion.status}
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    status === suggestion.status ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              {statusMessage && (
                <p className={`mt-3 font-medium ${statusColor}`}>{statusMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/admin_manage_suggestions')}
            className="flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to All Suggestions
          </button>
        </div>
      </div>
    </div>
  );
}