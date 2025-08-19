'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from "react-icons/fa"; 


const api = process.env.NEXT_PUBLIC_API_URL;


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${api}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('student_email', data.email);
        localStorage.setItem('role', data.role);

        if (data.role === 'admin') {
          localStorage.setItem('admin_email', data.email);
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
  <div className="min-h-screen bg-gradient-to-br from-[#003087] via-blue-500 to-blue-300 flex items-center justify-center px-4 relative overflow-hidden">
    {/* Decorative background shapes */}
    <div className="absolute w-72 h-72 bg-blue-200/30 rounded-full -top-16 -left-16 animate-pulse"></div>
    <div className="absolute w-60 h-60 bg-white/20 rounded-full bottom-10 right-10 animate-bounce"></div>

    <form
      onSubmit={handleLogin}
      className="relative bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-md w-full border border-gray-200 
      transform transition-all hover:scale-[1.02] hover:shadow-blue-200/50"
    >
      <h2 className="text-3xl font-extrabold text-[#003087] text-center mb-2">
        Welcome Back
      </h2>
      <p className="text-gray-600 text-center mb-6">Login to your account</p>

      {/* Email */}
      <div className="mb-5">
        <label
          htmlFor="email"
          className="block text-[#003087] font-semibold mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border border-gray-300 px-4 py-3 rounded-xl text-[#003087] 
          focus:outline-none focus:ring-2 focus:ring-[#003087] focus:shadow-md transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@compit.aun.edu.eg"
        />
      </div>

      {/* Password */}
      <div className="mb-6 relative">
        <label
          htmlFor="password"
          className="block text-[#003087] font-semibold mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          className="w-full border border-gray-300 px-4 py-3 rounded-xl text-[#003087] pr-10 
          focus:outline-none focus:ring-2 focus:ring-[#003087] focus:shadow-md transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="********"
        />
        <span
          className="absolute right-3 top-[42px] cursor-pointer text-gray-500 hover:text-[#003087] transition"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-600 font-semibold text-sm mb-4 text-center animate-bounce">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="bg-gradient-to-r from-[#003087] to-blue-600 text-white w-full py-3 rounded-xl shadow-md 
        hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
      >
        Login
      </button>
    </form>
  </div>
);

}