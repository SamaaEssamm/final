'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft,  FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
export default function UpdateStudentPage() {
  const [oldEmail, setOldEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);



  const handleUpdate = async () => {
    if (!oldEmail) {
      setMessage('Old email is required.');
      return;
    }
    const role = localStorage.getItem("role");
if (role !== "admin") return;
    try {
      const response = await fetch('https://web-production-93bbb.up.railway.app/api/admin/update_student', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_email: oldEmail,
          new_name: newName || undefined,
          new_email: newEmail || undefined,
          new_password: newPassword || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Student updated successfully!');

        setOldEmail('');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-gray-100 p-6 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#003087]">Update Student</h2>


        <button
  onClick={() => router.push('/admin_manage_students')}
  title="Back"
  className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
>
  <FaArrowLeft size={26} />
</button>


        <div className="space-y-4">
          <input
            type="email"
            placeholder="Old Email (required)"
            value={oldEmail}
            onChange={(e) => setOldEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="New Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
          />

          <input
            type="email"
            placeholder="New Email (optional)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
          />

          <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="New Password (optional)"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none"
  />
  <span
    className="absolute right-3 top-3 cursor-pointer text-gray-500"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>
          <button
            onClick={handleUpdate}
            className="w-full bg-[#003087] text-white py-2 rounded-lg hover:bg-[#002060] transition"
          >
            Update Student
          </button>

          {message && <p className="text-center text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </main>
  );
}
