'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Student = {
  users_id: string;
  users_name: string;
  users_email: string;
};

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/admin/get_all_students');
        const data = await res.json();

        if (Array.isArray(data)) {
          setStudents(data);
        } else if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAdd = () => router.push('/admin_add_student');
  

const handleUpdate = () => router.push('/admin_update_student');
  const handleDelete = () => router.push('/admin_delete_student');

  return (
    <main className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#003087]">Manage Students</h1>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-green-700 transition"
          >
            + Add Student
          </button>
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-blue-700 transition"
          >
            ✏️ Update Student
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-red-700 transition"
          >
            🗑️ Delete Student
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.users_id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{student.users_name}</td>
                  <td className="px-4 py-2">{student.users_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
