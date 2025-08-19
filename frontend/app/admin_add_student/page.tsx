'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGraduationCap } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const api = process.env.NEXT_PUBLIC_API_URL;

export default function AdminAddStudentPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/no-access");
      return;
    }

    try {
      const res = await fetch(`${api}/api/admin/add_student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users_name: name,
          users_email: email,
          users_password: password,
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setMessage('Student added successfully ✅');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setMessage(data.message || 'Failed to add student ❌');
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100"
        >
          <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
            <FaGraduationCap /> Add Student
          </h2>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold text-blue-700">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold text-blue-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label className="block mb-1 text-sm font-semibold text-blue-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg text-sm pr-10 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <span
              className="absolute right-3 top-[42px] cursor-pointer text-blue-400 hover:text-blue-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Student'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin_manage_students')}
              className="flex-1 border border-blue-300 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition"
            >
              Cancel
            </button>
          </div>

          {message && (
            <p
              className={`text-center font-semibold mt-2 ${
                message.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Preview */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-2xl font-bold mb-4">
            {name ? name[0].toUpperCase() : "?"}
          </div>
          <h3 className="text-lg font-bold text-blue-800">{name || "Student Name"}</h3>
          <p className="text-sm text-blue-700">{email || "email@example.com"}</p>
          <span className="mt-2 inline-block px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            Role: Student
          </span>
        </div>
      </div>
    </div>
  );
}