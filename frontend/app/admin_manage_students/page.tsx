'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const api = process.env.NEXT_PUBLIC_API_URL;

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
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/no-access");
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await fetch(`${api}/api/admin/get_all_students`);
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
    <main className="relative min-h-screen px-6 md:px-12 lg:px-24 pt-20 flex flex-col items-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at 20% 20%, #60a5fa, #3b82f6 40%, #1e3a8a 90%)' }}
    >
      {/* Glow spots */}
      <div className="absolute top-[-80px] left-[-60px] w-96 h-96 bg-blue-300 rounded-full opacity-30 filter blur-4xl animate-blob"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-400 rounded-full opacity-20 filter blur-4xl animate-blob animation-delay-2500"></div>
      <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-blue-200 rounded-full opacity-15 filter blur-6xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center w-full max-w-6xl mb-8 z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white relative drop-shadow-lg">
          Manage Students
        </h1>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
          >
            <FaPlus /> Add Student
          </button>
          <button
            onClick={handleUpdate}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
          >
            <FaEdit /> Update Student
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
          >
            <FaTrash /> Delete Student
          </button>
        </div>
      </div>

     {/* Student Table */}
{loading ? (
  <p className="text-white mt-20 animate-bounce-fade">Loading students...</p>
) : students.length === 0 ? (
  <p className="text-white mt-20">No students found.</p>
) : (
  <div className="relative w-full max-w-6xl overflow-x-auto rounded-3xl shadow-2xl border border-blue-200 bg-white z-10">
    <table className="min-w-full text-sm text-blue-900">
      <thead className="bg-blue-100">
        <tr>
          <th className="px-6 py-3 font-semibold text-left">Name</th>
          <th className="px-6 py-3 font-semibold text-left">Email</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student, idx) => (
          <tr
            key={student.users_id}
            className={`border-t border-blue-200 transition ${
              idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100/50"
            } hover:bg-blue-200/60`}
            style={{ animation: `fadeUp 0.5s ease forwards ${idx * 0.08}s` }}
          >
            <td className="px-6 py-3">{student.users_name}</td>
            <td className="px-6 py-3">{student.users_email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      {/* Back Floating Button */}
      <button
        onClick={() => router.push('/admin_dashboard')}
        title="Back"
        className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 z-20"
      >
        <FaArrowLeft size={22} />
      </button>

      {/* Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2500 {
          animation-delay: 2.5s;
        }

        @keyframes bounce-fade {
          0% { opacity: 0; transform: translateY(-10px); }
          50% { opacity: 1; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-fade {
          animation: bounce-fade 0.6s ease forwards;
        }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}