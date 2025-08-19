'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaPaperclip, FaClock, FaUser, FaUserShield, FaEnvelope, FaExclamationCircle, FaCheckCircle, FaEdit, FaSync } from "react-icons/fa";

export default function ComplaintDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const api = process.env.NEXT_PUBLIC_API_URL;
  const [complaint, setComplaint] = useState<any>(null);
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

    const fetchComplaint = async () => {
      try {
        const res = await fetch(`${api}/api/admin/get_complaint?id=${id}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setComplaint(data);
        setStatus(data.complaint_status || '');
      } catch (error) {
        console.error('Error fetching complaint:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
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
      const res = await fetch(`${api}/api/admin/update_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint_id: id, new_status: status })
      });

      const result = await res.json();
      if (result.status === 'success') {
        setComplaint({ ...complaint, complaint_status: status });
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
  
  const handleRespond = () => {
    if (id) {
      router.push(`/admin_respond?id=${id}`);
    }
  };

  const statusMap: Record<string, string> = {
    under_checking: 'Received',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    done: 'Responded'
  };

  const typeMap: Record<string, string> = {
    academic: 'Academic',
    activities: 'Activities',
    administrative: 'Administrative',
    IT: 'IT'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_checking': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-800">Loading complaint details...</p>
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Complaint Not Found</h2>
        <p className="text-gray-600 mb-4">The requested complaint could not be found.</p>
        <button
          onClick={() => router.push('/admin_manage_complaints')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Complaints
        </button>
      </div>
    </div>
  );

  const isResponded = complaint.complaint_status === 'done';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center">
              <FaExclamationCircle className="mr-3 text-blue-600" />
              Complaint Details
            </h1>
            <p className="text-blue-600 mt-1">Reference: #{complaint.reference_code}</p>
          </div>
          <button
            onClick={() => router.push('/admin_manage_complaints')}
            className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to List
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 border-b ${getStatusColor(complaint.complaint_status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isResponded ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaClock className="text-blue-500" />
                )}
                <span className="ml-2 font-semibold">
                  {statusMap[complaint.complaint_status] || complaint.complaint_status}
                </span>
              </div>
              <span className="text-sm">
                {complaint.complaint_created_at
                  ? new Date(complaint.complaint_created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown date'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Complaint Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <FaUser className="mr-2" />
                  Student Information
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {complaint.student_email}</p>
                  <p><span className="font-medium">Name Display:</span>{' '}
                    <span className={`inline-flex items-center ${complaint.complaint_dep === "public" ? "text-green-600" : "text-blue-600"}`}>
                      {complaint.complaint_dep === "public" ? (
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
                  <FaExclamationCircle className="mr-2" />
                  Complaint Details
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {typeMap[complaint.complaint_type] || complaint.complaint_type}</p>
                  <p><span className="font-medium">Title:</span> {complaint.complaint_title}</p>
                </div>
              </div>
            </div>

            {/* Complaint Message */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-600" />
                Complaint Message
              </h3>
              <div className="prose max-w-none bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {complaint.complaint_message}
              </div>
            </div>

            {/* Attachment */}
            {complaint.complaint_file_url && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaPaperclip className="mr-2 text-blue-600" />
                  Attachment
                </h3>
                <a
                  href={complaint.complaint_file_url}
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
                  disabled={isResponded || updating}
                  className={`border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isResponded ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">-- Select status --</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                </select>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || isResponded || !status}
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    isResponded || !status ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>

                {!complaint.response_message && (
                  <button
                    onClick={handleRespond}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Respond
                  </button>
                )}
              </div>

              {statusMessage && (
                <p className={`mt-3 font-medium ${statusColor}`}>{statusMessage}</p>
              )}

              {isResponded && (
                <p className="mt-3 text-sm text-gray-600">
                  This complaint has been responded to. You cannot change its status.
                </p>
              )}
            </div>

            {/* Admin Response */}
            <div className={`border rounded-lg p-6 ${complaint.response_message ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="font-semibold mb-4 flex items-center">
                {complaint.response_message ? (
                  <FaCheckCircle className="mr-2 text-green-600" />
                ) : (
                  <FaClock className="mr-2 text-gray-600" />
                )}
                Admin Response
              </h3>
              
              {complaint.response_message ? (
                <div className="prose max-w-none bg-white p-4 rounded-lg border border-yellow-200 whitespace-pre-wrap">
                  {complaint.response_message}
                  {complaint.responder_email && (
                    <p className="text-sm text-gray-600 mt-3">
                      Responded by: {complaint.responder_email}
                      {complaint.response_created_at && (
                        <> on {new Date(complaint.response_created_at).toLocaleString()}</>
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaClock className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">No response has been sent yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/admin_manage_complaints')}
            className="flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to All Complaints
          </button>
        </div>
      </div>
    </div>
  );
}