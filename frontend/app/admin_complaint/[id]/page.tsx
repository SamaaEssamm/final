'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ComplaintDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchComplaint = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/admin/get_complaint?id=${id}`);
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
      const res = await fetch(`http://127.0.0.1:5000/api/admin/update_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint_id: id, new_status: status })
      });

      const result = await res.json();
      if (result.status === 'success') {
        setComplaint({ ...complaint, complaint_status: status });
        setStatusMessage('Status updated successfully!');
        setStatusColor('text-green-600');
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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!complaint) return <p className="p-6 text-red-600">Complaint not found.</p>;

  const isResponded = complaint.complaint_status === 'done';

  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-6">Complaint Details</h1>

      <div className="bg-gray-50 border rounded-xl p-6 shadow space-y-3">
        <p><span className="font-semibold">Title:</span> {complaint.complaint_title}</p>
        <p><span className="font-semibold">Type:</span> {typeMap[complaint.complaint_type] || complaint.complaint_type}</p>
        <p>
          <span className="font-semibold">Date:</span>{' '}
          {complaint.complaint_created_at
            ? new Date(complaint.complaint_created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown'}
        </p>
        <p><span className="font-semibold">Student:</span> {complaint.student_email}</p>
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
          <label htmlFor="status" className="block font-semibold mb-1">Change Status:</label>
          <select
            id="status"
            value={status}
            onChange={handleStatusChange}
            disabled={status === 'done'}
            className={`border rounded px-3 py-1 mr-2 ${status === 'done' ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : ''}`}
          >
            <option value="">-- Select status --</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
          </select>

          <button
            onClick={handleUpdateStatus}
            disabled={updating || status === 'done' || !status}
            className={`px-4 py-1 rounded mr-2 text-white ${status === 'done' || !status ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003087] hover:bg-blue-800'}`}
          >
            {updating ? 'Updating...' : 'Update'}
          </button>

          {!complaint.response_message && (
            <button
              onClick={handleRespond}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Respond
            </button>
          )}

          {status === 'done' && (
            <p className="mt-2 text-sm text-gray-700 font-medium">
              This complaint has been responded to. You cannot change its status.
            </p>
          )}

          {statusMessage && (
            <p className={`mt-2 font-medium ${statusColor}`}>{statusMessage}</p>
          )}
        </div>

        <div className="mt-6">
          <span className="font-semibold block mb-1">Admin Response:</span>
          <div className="bg-white border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
            {complaint.response_message ? (
              <>
                <p className="mb-2">{complaint.response_message}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Responded by <span className="font-medium">{complaint.responder_name || 'Unknown Admin'}</span>{' '}
                  on{' '}
                  {complaint.response_created_at
                    ? new Date(complaint.response_created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Unknown Date'}
                </p>
              </>
            ) : (
              "You still didn't respond to this complaint."
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
