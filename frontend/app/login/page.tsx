'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('student_email', email);
        localStorage.setItem('role', data.role);

        if (data.role === 'admin') {
          localStorage.setItem('admin_email', email);
          router.push('/admin_dashboard');
        } else {
          router.push('/student_dashboard');
        }
      } else {
        setError(data.message || '❌ Invalid email or password');
      }
    } catch (err) {
      setError('🚨 Can\'t access the server in the meantime');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-[#003087] text-center mb-6">
          Login to Your Account
        </h2>

        <div className="mb-4">
          <label htmlFor="email" className="block text-[#003087] font-semibold mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 px-4 py-2 rounded text-[#003087]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-[#003087] font-semibold mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full border border-gray-300 px-4 py-2 rounded text-[#003087]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="****"
          />
        </div>

        {error && (
          <p className="text-red-600 font-semibold text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="bg-[#003087] text-white w-full py-2 rounded hover:bg-blue-800 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}