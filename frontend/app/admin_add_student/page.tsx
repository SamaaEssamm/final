'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 


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
      const res = await fetch('http://127.0.0.1:5000/api/admin/add_student', {
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
    <main className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-6">Add Student</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200 max-w-xl"
      >
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Student name"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="example@compit.aun.edu.eg"
          />
        </div>

        <div className="mb-4 relative">
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Password
  </label>
  <input
    type={showPassword ? "text" : "password"} 
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-3 py-2 border rounded-lg text-sm pr-10" 
    placeholder="********"
  />
  <span
    className="absolute right-3 top-9 cursor-pointer text-gray-500"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#003087] text-white px-4 py-2 rounded-2xl text-sm hover:bg-[#002060] transition"
        >
          {isSubmitting ? 'Adding...' : 'Add Student'}
        </button>


        <button
  onClick={() => router.push('/admin_manage_students')}
  title="Back"
  className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
>
  <FaArrowLeft size={26} />
</button>



        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </main>
  );
}
