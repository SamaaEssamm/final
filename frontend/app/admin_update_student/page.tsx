'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const api = process.env.NEXT_PUBLIC_API_URL;

export default function UpdateStudentPage() {
  const [oldEmail, setOldEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false); // toggle between search and form

  const router = useRouter();

  // ✅ Step 1: Search student
  const handleSearch = async () => {
    if (!oldEmail) {
      setMessage("Please enter an email.");
      return;
    }

    try {
      const response = await fetch(`${api}/api/admin/get_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: oldEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("");
        setShowForm(true); // ✅ show update form
        setNewName(data.student.name);
        setNewEmail(data.student.email);
      } else {
        setMessage(data.message || "Student not found.");
      }
    } catch (error) {
      console.error("Error searching student:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  // ✅ Step 2: Update student
  const handleUpdate = async () => {
    if (!oldEmail) {
      setMessage('Old email is required.');
      return;
    }
    const role = localStorage.getItem("role");
    if (role !== "admin") return;

    try {
      const response = await fetch(`${api}/api/admin/update_student`, {
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
    <main className="min-h-screen relative bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* 🔵 Decorative Background Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* ⬅️ Floating Back Button (bottom-left) */}
      <button
        onClick={() => router.push("/admin_manage_students")}
        title="Back"
        className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300"
      >
        <FaArrowLeft size={20} />
      </button>

      {/* ✨ Glassmorphism Card */}
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 space-y-6">
        <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-[#003087] via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          Update Student
        </h2>

        <AnimatePresence mode="wait">
          {!showForm ? (
            // 🔍 Search Mode
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <p className="text-center text-gray-600 mb-6">
                Search by email to find and update a student
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter student email..."
                  value={oldEmail}
                  onChange={(e) => setOldEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/50 transition"
                />
                <FaSearch className="absolute right-4 top-3.5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}  // ← call the async API function
                className="w-full bg-gradient-to-r from-[#003087] to-blue-600 text-white py-3 rounded-xl shadow-lg hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-300"
              >
                Search
              </button>

            </motion.div>
          ) : (
            // ✏️ Update Form
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* 👤 Profile header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                  {oldEmail?.charAt(0).toUpperCase() || "?"}
                </div>
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-sm text-gray-700 shadow-sm">
                  {oldEmail}
                </span>
              </div>

              <input
                type="text"
                placeholder="New Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              />

              <input
                type="email"
                placeholder="New Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-blue-600 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <motion.div whileTap={{ rotate: 180 }}>
                      <FaEyeSlash />
                    </motion.div>
                  ) : (
                    <motion.div whileTap={{ scale: 1.2 }}>
                      <FaEye />
                    </motion.div>
                  )}
                </span>
              </div>

              <button
                onClick={handleUpdate}
                className="w-full bg-gradient-to-r from-[#003087] via-blue-600 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-purple-600/40 hover:scale-[1.02] transition-all duration-300"
              >
                Update Student
              </button>

              {/* 🔙 Back to Search */}
              <button
                onClick={() => {
                  setShowForm(false);
                  setOldEmail("");
                  setNewName("");
                  setNewEmail("");
                  setNewPassword("");
                }}
                className="w-full border border-gray-400 text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition shadow-sm"
              >
                Back to Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Toast-style Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`text-center py-3 px-4 rounded-xl shadow-md font-semibold ${
                message.includes("success")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}