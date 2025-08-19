'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { FaArrowLeft, FaPaperPlane, FaExclamationTriangle } from "react-icons/fa";
import { useState, useEffect } from 'react';

export default function RespondPage() {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL;
  const [responseText, setResponseText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(''); 
  const [error, setError] = useState<string>(''); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setId(params.get('id'));
  }, []);

  const isMeaningfulText = (text: string) => {
    const cleaned = (text || '').trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return false;

    if (!/[a-zA-Z\u0600-\u06FF]/.test(cleaned)) return false;
    if (/^[\d\s]+$/.test(cleaned)) return false;
    if (/^[^a-zA-Z\u0600-\u06FF0-9\s]+$/.test(cleaned)) return false;
    
    const normalized = words.map(w => w.toLowerCase().replace(/[^a-zA-Z\u0600-\u06FF0-9]/g, ''));
    const unique = new Set(normalized.filter(w => w));
    if (unique.size < 2) return false;

    if (cleaned.length < 5) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!isMeaningfulText(responseText)) {
      setError('Please enter a meaningful response in Arabic or English (at least two words).');
      return;
    }

    const adminEmail = localStorage.getItem('admin_email');
    if (!adminEmail) {
      setError('Admin email not found.');
      return;
    }

    setSubmitting(true);

    try {
      const idRes = await fetch(`${api}/api/get_admin_id?admin_email=${adminEmail}`);
      const idData = await idRes.json();
      const adminId = idData.status === 'success' ? idData.admin_id : null;

      if (!adminId) {
        setError('Admin ID not found.');
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${api}/api/admin/respond`, {
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
        await fetch(`${api}/api/admin/update_status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint_id: id, new_status: 'done' })
        });

        setMessage('Response submitted successfully!');
        setTimeout(() => router.push(`/admin_complaint/${id}`), 1000);
      } else {
        setError('Failed to submit response.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center">
              <FaPaperPlane className="mr-3 text-blue-600" />
              Respond to Complaint
            </h1>
            <p className="text-blue-600 mt-1">Complaint ID: #{id}</p>
          </div>
          <button
            onClick={() => router.push(`/admin_complaint/${id}`)}
            className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to Details
          </button>
        </div>

        {/* Response Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                id="response"
                value={responseText}
                onChange={(e) => {
                  setResponseText(e.target.value);
                  if (error && isMeaningfulText(e.target.value)) setError('');
                }}
                placeholder="Write a detailed and helpful response to the complaint..."
                className={`w-full border rounded-lg p-4 h-48 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              
              {error && (
                <div className="flex items-center mt-2 text-red-600">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {message && (
                <div className="flex items-center mt-2 text-green-600">
                  <FaPaperPlane className="mr-2" />
                  <span className="text-sm">{message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Your response will be visible to the student
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Submit Response
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <FaExclamationTriangle className="mr-2 text-blue-600" />
            Response Guidelines
          </h3>
          <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
            <li>Be professional and courteous in your response</li>
            <li>Address all concerns raised in the complaint</li>
            <li>Provide clear next steps or solutions when possible</li>
            <li>Ensure your response is at least two meaningful sentences</li>
            <li>Check for spelling and grammar before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}