'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight} from "react-icons/fa";

export default function SuggestionDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
  if (role !== "student") {
    router.push("/no-access");
    return;
  }
    const email = localStorage.getItem('student_email');
  if (!email) {
    router.push('/login');
    return;
  }

  
    if (!id) return;
    
    const fetchSuggestion = async () => {
      try {

        const email = localStorage.getItem("student_email");
        const res = await fetch(`http://127.0.0.1:5000/api/student/getsuggestion?id=${id}&student_email=${email}`);

        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setSuggestion(data);
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


      <button
  onClick={() => router.push('/student_suggestions')}
  title="Back"
  className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
>
  <FaArrowLeft size={26} />
</button>


      <div className="bg-gray-50 border rounded-xl p-6 shadow space-y-3">
        <p><span className="font-semibold">Suggestion code:</span> {suggestion.reference_code}</p>
        <p><span className="font-semibold">Title:</span> {suggestion.suggestion_title}</p>
        <p><span className="font-semibold">Department:</span> {suggestion.suggestion_type}</p>
        <p> <span className="font-semibold">Name Display:</span>{' '}
        {suggestion.suggestion_dep === "public" ? "Shown" : "Hidden"}
      </p>


        <p>
          <span className="font-semibold">Date:</span>{' '}
          {suggestion.suggestion_created_at
            ? new Date(suggestion.suggestion_created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown'}
        </p>


        <div className="mt-4">
          <span className="font-semibold block mb-1">Message:</span>
          <div className="whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-auto">
            {suggestion.suggestion_message}
          </div>
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


            
            
      </div>
      
    </div>
  );
}