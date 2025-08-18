'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useState, useEffect } from 'react';
export default function RespondPage() {
  
const [id, setId] = useState<string | null>(null);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setId(params.get('id'));
}, []);

  const router = useRouter();

  const [responseText, setResponseText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(''); 
  const [error, setError] = useState<string>(''); 


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
      const idRes = await fetch(`https://web-production-93bbb.up.railway.app/api/get_admin_id?admin_email=${adminEmail}`);
      const idData = await idRes.json();
      const adminId = idData.status === 'success' ? idData.admin_id : null;

      if (!adminId) {
        setError('Admin ID not found.');
        setSubmitting(false);
        return;
      }

   
      const res = await fetch('https://web-production-93bbb.up.railway.app/api/admin/respond', {
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
        await fetch('https://web-production-93bbb.up.railway.app/api/admin/update_status', {
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
    <div className="min-h-screen bg-white py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-6">Respond to Complaint</h1>

     <button
  onClick={() => router.push(`/admin_complaint/${id}`)}
  title="Back"
  className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
>
  <FaArrowLeft size={26} />
   </button>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={responseText}
          onChange={(e) => {
            setResponseText(e.target.value);
           
            if (error && isMeaningfulText(e.target.value)) setError('');
          }}
          placeholder="Write your response here..."
          className={`w-full border rounded-lg p-4 h-40 mb-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
        />

 
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#003087] text-white px-6 py-2 rounded hover:bg-blue-800"
        >
          {submitting ? 'Submitting...' : 'Submit Response'}
        </button>
      </form>
    </div>
  );
}