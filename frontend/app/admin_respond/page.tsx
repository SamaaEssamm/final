'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RespondPage() {
  const params = useSearchParams();
  const id = params.get('id');
  const router = useRouter();

  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      setMessage('Response cannot be empty.');
      return;
    }

    const adminEmail = localStorage.getItem('admin_email');
    if (!adminEmail) {
      setMessage('Admin email not found.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Fetch admin ID using email
      const idRes = await fetch(`http://127.0.0.1:5000/api/get_admin_id?admin_email=${adminEmail}`);
      const idData = await idRes.json();
      const adminId = idData.status === 'success' ? idData.admin_id : null;

      if (!adminId) {
        setMessage('Admin ID not found.');
        setSubmitting(false);
        return;
      }

      // Submit response
      const res = await fetch('http://127.0.0.1:5000/api/admin/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint_id: id,
          response_message: responseText,
          admin_id: adminId
        })
      });

      const result = await res.json();
      if (result.status === 'success') {
        // Also update complaint status to Responded
        await fetch('http://127.0.0.1:5000/api/admin/update_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint_id: id, new_status: 'done' })
        });

        setMessage('Response submitted!');
          setTimeout(() => router.push(`/admin_complaint/${id}`), 1000);
      } else {
        setMessage('Failed to submit response.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-6">Respond to Complaint</h1>

      <textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Write your response here..."
        className="w-full border rounded-lg p-4 h-40 mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-[#003087] text-white px-6 py-2 rounded hover:bg-blue-800"
      >
        {submitting ? 'Submitting...' : 'Submit Response'}
      </button>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
