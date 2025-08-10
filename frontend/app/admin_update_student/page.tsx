'use client';

import { useState } from 'react';

export default function UpdateStudentPage() {
  const [oldEmail, setOldEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    if (!oldEmail) {
      setMessage('Old email is required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/update_student', {
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
        // Optionally clear form:
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

          <input
            type="password"
            placeholder="New Password (optional)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
          />

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
