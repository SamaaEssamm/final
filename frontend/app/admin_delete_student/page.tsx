'use client';

import { useState } from 'react';

export default function DeleteStudentPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!email) {
      setError('Please enter a student email');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/api/admin_delete_student', {
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
    <main className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-8">Delete Student</h1>

      <div className="max-w-md mx-auto bg-gray-100 p-6 rounded-xl shadow-md space-y-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            Student Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter student email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
          />
        </div>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
        >
          Delete Student
        </button>

        {message && <p className="text-green-600 font-medium">{message}</p>}
        {error && <p className="text-red-600 font-medium">{error}</p>}
      </div>
    </main>
  );
}
