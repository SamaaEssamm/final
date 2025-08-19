'use client';

import { useState } from 'react';
import { FaArrowLeft, FaArrowRight} from "react-icons/fa";
import {  useRouter } from 'next/navigation';

const api = process.env.NEXT_PUBLIC_API_URL;

export default function DeleteStudentPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (!email) {
      setError('Please enter a student email');
      return;
    }
 
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    router.push("/no-access");
    return;
  }

    try {
      const res = await fetch(`${api}/api/admin_delete_student`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Student deleted successfully');
        setError('');
      } else {
        setError(data.message || 'Error deleting student');
        setMessage('');
      }
    } catch (err) {
      setError('Server error');
      setMessage('');
    }
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-24"
      style={{ background: 'linear-gradient(135deg, #ffe3e0, #ffd2b3, #fff5e6)' }}
    >
      {/* Abstract soft shapes */}
      <div className="absolute top-[-120px] left-[-100px] w-96 h-96 bg-pink-300 rounded-full opacity-30 filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-[-140px] right-[-100px] w-96 h-96 bg-orange-300 rounded-full opacity-30 filter blur-3xl animate-blob animation-delay-2000"></div>

      {/* Glowing danger circle above card */}
      <div className="relative z-10 mb-6 w-32 h-32 rounded-full bg-red-600 opacity-80 shadow-[0_0_60px_rgba(255,0,0,0.6)] animate-pulse-red flex items-center justify-center">
        <span className="text-white font-extrabold text-4xl">!</span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col gap-6 hover:shadow-3xl transition-shadow duration-300 animate-float z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-red-600">Delete Student</h1>
          <p className="text-gray-500">
            Enter the student’s email below to remove them permanently.
          </p>
        </div>

        {/* Input with icon */}
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@student.edu"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          />
          <FaArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 opacity-60" />
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-200 animate-pulse-red"
        >
          <span>Delete Student</span>
        </button>

        {/* Messages */}
        {message && (
          <p className="mt-4 text-center text-green-600 font-medium animate-bounce-fade">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 text-center text-red-600 font-medium animate-bounce-fade">
            {error}
          </p>
        )}
      </div>

      {/* Back Floating Button */}
<button
  onClick={() => router.push('/admin_manage_students')}
  title="Back"
  className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
>
  <FaArrowLeft size={22} />
</button>


      {/* Animations */}
      <style jsx>{`
        @keyframes bounce-fade {
          0% { opacity: 0; transform: translateY(-10px); }
          50% { opacity: 1; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-fade {
          animation: bounce-fade 0.6s ease forwards;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(220,38,38,0.5); }
          50% { box-shadow: 0 0 40px rgba(220,38,38,0.8); }
        }
        .animate-pulse-red {
          animation: pulse 2s infinite;
        }
      `}</style>
    </main>
  );
}