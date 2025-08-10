'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function StudentComplaintDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchComplaint = async () => {
      try {
        const email = localStorage.getItem('student_email');
        const res = await fetch(`http://127.0.0.1:5000/api/student/get_complaint?id=${id}&student_email=${email}`);

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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!complaint) return <p className="p-6 text-red-600">Complaint not found.</p>;

  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-6">Complaint Details</h1>

      <div className="bg-gray-50 border rounded-xl p-6 shadow space-y-3">
        <p><span className="font-semibold">Title:</span> {complaint.complaint_title}</p>
        <p><span className="font-semibold">Type:</span> {typeMap[complaint.complaint_type] || complaint.complaint_type}</p>
        <p><span className="font-semibold">Department:</span> {complaint.complaint_dep}</p>
        <p>
          <span className="font-semibold">Date:</span>{' '}
          {complaint.complaint_created_at
            ? new Date(complaint.complaint_created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Unknown'}
        </p>
        <p><span className="font-semibold">Status:</span> {statusMap[complaint.complaint_status] || complaint.complaint_status}</p>

        <div className="mt-4">
          <span className="font-semibold block mb-1">Message:</span>
          <div className="whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-auto">
            {complaint.complaint_message}
          </div>
        </div>
                {complaint.complaint_file_url && (
        <div className="mt-4">
          <span className="font-semibold block mb-1">Attachment:</span>
          <a
            href={complaint.complaint_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            View Attachment
          </a>
        </div>
      )}

        <div className="mt-6">
          <span className="font-semibold block mb-1">Admin Response:</span>
          {complaint.response_message ? (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 whitespace-pre-wrap">
              <p className="mb-2">{complaint.response_message}</p>
            </div>
          ) : (
            <label className="text-gray-700 text-sm">
              No response yet. Please wait while your complaint is being processed.
            </label>
          )}
        </div>

    </div> 
    </div>
    
  
  );
}
