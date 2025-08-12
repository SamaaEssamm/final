'use client';

import { useRouter } from 'next/navigation';

export default function NoAccessPage() {
  const router = useRouter();

  const handleRedirect = () => {
    const userData = localStorage.getItem('user'); // أو من أي مكان بتخزني فيه بيانات اليوزر
    if (userData) {
      const user = JSON.parse(userData);

      if (user.role === 'student') {
        router.push('/student_dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin_dashboard');
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
        <p className="text-gray-700 mb-6">
          Sorry, you do not have permission to view this page.
        </p>
        <button
          onClick={handleRedirect}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back To Home
        </button>
      </div>
    </div>
  );
}
