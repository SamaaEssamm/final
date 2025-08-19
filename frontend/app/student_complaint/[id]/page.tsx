'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaPaperclip, FaClock, FaUser, FaUserShield, FaEnvelope, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

export default function StudentComplaintDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL;
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    
    if (!id) return;

    const fetchComplaint = async () => {
      try {
        const email = localStorage.getItem('student_email');
        const res = await fetch(`${api}/api/student/get_complaint?id=${id}&student_email=${email}`);

        if (!res.ok) throw new Error('Failed to fetch complaint');
        const data = await res.json();
        setComplaint(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <FaCheckCircle className="text-green-500" />;
      case 'under_review': return <FaClock className="text-blue-500" />;
      case 'in_progress': return <FaClock className="text-orange-500" />;
      default: return <FaExclamationCircle className="text-gray-500" />;
    }
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

  const statusMap: Record<string, string> = {
    under_checking: 'Received',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    done: 'Responded',
  };

  const typeMap: Record<string, string> = {
    academic: 'Academic',
    activities: 'Activities',
    administrative: 'Administrative',
    IT: 'IT',
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
          onClick={() => router.push('/student_complaint')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Complaints
        </button>
      </div>
    </div>
  );

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
            onClick={() => router.push('/student_complaint')}
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
                {getStatusIcon(complaint.complaint_status)}
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
                  <FaExclamationCircle className="mr-2" />
                  Complaint Information
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Title:</span> {complaint.complaint_title}</p>
                  <p><span className="font-medium">Department:</span> {typeMap[complaint.complaint_type] || complaint.complaint_type}</p>
                  <p>
                    <span className="font-medium">Name Display:</span>{' '}
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
                  <FaClock className="mr-2" />
                  Timeline
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Submitted:</span> {complaint.complaint_created_at ? new Date(complaint.complaint_created_at).toLocaleString() : 'Unknown'}</p>
                  {complaint.response_timestamp && (
                    <p><span className="font-medium">Last Updated:</span> {new Date(complaint.response_timestamp).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Complaint Message */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-600" />
                Your Message
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
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaClock className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">Your complaint is being processed. We'll respond soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/student_complaint')}
            className="flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to All Complaints
          </button>
          {complaint.response_message && (
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}