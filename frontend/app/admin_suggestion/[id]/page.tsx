'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function suggestionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('unreviewed');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusColor, setStatusColor] = useState('');
  const handleUpdateStatus = async () => {
    if (!id || !status) return;

    try {
      const res = await fetch(`https://web-production-93bbb.up.railway.app/api/admin/update_suggestion_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion_id: id, new_status: status }),
      });

      const result = await res.json();
      if (result.status === 'success') {
        setMessage('Status updated successfully!');
        setIsSuccess(true);
        
      } else {
        setMessage('Failed to update status.');
        setIsSuccess(false);
      
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('An unexpected error occurred.');
      setIsSuccess(false);
    }

  
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  useEffect(() => {
    if (!id) return;
    
    const fetchSuggestion = async () => {
      try {
        const res = await fetch(`https://web-production-93bbb.up.railway.app/api/admin/get_suggestion?id=${id}`);
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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!suggestion) return <p className="p-6 text-red-600">Suggestion not found.</p>;

  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-6">Suggestion Details</h1>

      <div className="bg-gray-50 border rounded-xl p-6 shadow space-y-3">
        <p><span className="font-semibold">Suggestion code:</span> {suggestion.reference_code}</p>
        <p><span className="font-semibold">Title:</span> {suggestion.suggestion_title}</p>
        <p><span className="font-semibold">Department:</span> {suggestion.suggestion_type}</p>
        <p>
          <span className="font-semibold">Date:</span>{' '}
          {suggestion.suggestion_date
            ? new Date(suggestion.suggestion_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown'}
        </p>
        <p><span className="font-semibold">Student:</span> {suggestion.student_email}</p>
        <div className="mt-4">
          <span className="font-semibold block mb-1">Message:</span>
          <div className="whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-auto">
            {suggestion.suggestion_message}
          </div>

          {suggestion.suggestion_file_url && (
            <div className="mt-4">
              <span className="font-semibold block mb-1">Attachment:</span>
              <a
                href={suggestion.suggestion_file_url}
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
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-3 py-1 mr-2"
            >
              <option value="unreviewed">Unreviewed</option>
              <option value="reviewed">Reviewed</option>
            </select>


            <button
              onClick={handleUpdateStatus}
              className="bg-[#003087] text-white px-4 py-1 rounded hover:bg-blue-800 ml-2"
            >
              Update Status
            </button>
            {message && (
              <p className={`mt-2 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
  onClick={() => router.push('/admin_manage_suggestions')}
  title="Back"
  className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
>
  <FaArrowLeft size={26} />
</button>

    </div>
  );
}