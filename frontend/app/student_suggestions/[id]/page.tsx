'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaPaperclip, FaLightbulb, FaUser, FaUserShield, FaCalendar, FaEnvelope } from "react-icons/fa";

export default function SuggestionDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL;
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
        const res = await fetch(`${api}/api/student/getsuggestion?id=${id}&student_email=${email}`);

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
        <FaLightbulb className="text-red-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Suggestion Not Found</h2>
        <p className="text-gray-600 mb-4">The requested suggestion could not be found.</p>
        <button
          onClick={() => router.push('/student_suggestions')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Suggestions
        </button>
      </div>
    </div>
  );

  const typeMap: Record<string, string> = {
    academic: 'Academic',
    activities: 'Activities',
    administrative: 'Administrative',
    IT: 'IT'
  };

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
            onClick={() => router.push('/student_suggestions')}
            className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to List
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div className="px-6 py-4 border-b bg-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaLightbulb className="text-blue-500" />
                <span className="ml-2 font-semibold text-blue-800">
                  {suggestion.suggestion_status === 'reviewed' ? 'Reviewed' : 'Under Consideration'}
                </span>
              </div>
              <span className="text-sm text-blue-600">
                <FaCalendar className="inline mr-1" />
                {suggestion.suggestion_created_at
                  ? new Date(suggestion.suggestion_created_at).toLocaleDateString('en-US', {
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
                  <FaLightbulb className="mr-2" />
                  Suggestion Information
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Title:</span> {suggestion.suggestion_title}</p>
                  <p><span className="font-medium">Department:</span> {typeMap[suggestion.suggestion_type] || suggestion.suggestion_type}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaUser className="mr-2" />
                  Privacy Settings
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name Display:</span>{' '}
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
                  <p className="text-sm text-gray-600">
                    {suggestion.suggestion_dep === "public" 
                      ? "Your name is hidden to protect your privacy"
                      : "Your name is visible with this suggestion"}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggestion Message */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-600" />
                Your Suggestion
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

            {/* Status Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-600" />
                Suggestion Status
              </h3>
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${
                  suggestion.suggestion_status === 'reviewed' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  <FaLightbulb className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">
                    {suggestion.suggestion_status === 'reviewed' 
                      ? 'This suggestion has been reviewed'
                      : 'This suggestion is under consideration'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {suggestion.suggestion_status === 'reviewed'
                      ? 'Thank you for your valuable input!'
                      : 'Your suggestion is being considered by our team'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/student_suggestions')}
            className="flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow border border-blue-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Suggestions
          </button>
        </div>
      </div>
    </div>
  );
}