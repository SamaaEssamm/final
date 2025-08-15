'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from "react-icons/fa";

export default function NewSuggestionPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'academic',
        dep: 'public',
    });

    const [errors, setErrors] = useState({
        title: '',
        message: ''
    });

    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (role !== "student") {
        router.push("/no-access");
        return;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

   
    const isMeaningfulText = (text: string) => {
        text = text.trim();

        if (text.split(/\s+/).length < 2) return false; 
        if (!/[a-zA-Z\u0600-\u06FF]/.test(text)) return false; 
        if (/^[\d\W_]+$/.test(text)) return false; 
        if (text.length < 5) return false; 

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let newErrors = { title: '', message: '' };
        let hasError = false;

        if (!isMeaningfulText(formData.title)) {
            newErrors.title = "Please enter a meaningful title in Arabic or English (at least two words).";
            hasError = true;
        }
        if (!isMeaningfulText(formData.message)) {
            newErrors.message = "Please enter a meaningful message in Arabic or English (at least two words).";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setErrors({ title: '', message: '' });

        const student_email = localStorage.getItem('student_email');
        if (!student_email) {
            alert("User email not found. Please log in again.");
            return;
        }

        try {
            const file = fileInputRef.current?.files?.[0] || null;

            const data = new FormData();
            data.append('student_email', student_email);
            data.append('suggestion_title', formData.title);
            data.append('suggestion_message', formData.message);
            data.append('suggestion_type', formData.type);
            data.append('suggestion_dep', formData.dep);

            if (file) {
                data.append('file', file);
            }

            const res = await fetch('http://127.0.0.1:5000/api/student/addsuggestion', {
                method: 'POST',
                body: data,
            });

            if (res.ok) {
                router.push('/student_suggestions');
            } else {
                const errorText = await res.text();
                alert('Error: ' + errorText);
            }
        } catch (error) {
            console.error("Error submitting suggestion:", error);
            alert("Something went wrong. Please try again later.");
        }
    };

    return (
        <main className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
            <h1 className="text-3xl font-bold text-[#003087] mb-8">Submit a Suggestion</h1>

            <button
                onClick={() => router.push('/student_suggestions')}
                title="Back"
                className="fixed bottom-6 left-6 rounded-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
            >
                <FaArrowLeft size={26} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl" encType="multipart/form-data">
 
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]"
                    />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]"
                    />
                    {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
                    <input
                        type="file"
                        name="file"
                        ref={fileInputRef}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]"
                    />
                </div>

               
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]"
                        >
                            <option value="academic">Academic</option>
                            <option value="activities">Activities</option>
                            <option value="administrative">Administrative</option>
                            <option value="IT">IT</option>
                        </select>
                            
                        <div className="flex items-center space-x-2 mt-4">
                            <input
                                type="checkbox"
                                id="showName"
                                checked={formData.dep === 'private'}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        dep: e.target.checked ? 'private' : 'public',
                                    }))
                                }
                                className="h-4 w-4 text-[#003087] focus:ring-[#003087] border-gray-300 rounded"
                            />
                            <label htmlFor="showName" className="text-sm text-gray-700">Show my name</label>
                        </div>

                        {formData.dep === 'public' && (
                            <p className="text-sm text-green-600 mt-1">
                                Note: Your name will NOT be displayed to protect your privacy.
                            </p>
                        )}
                        {formData.dep === 'private' && (
                            <p className="text-sm text-red-600 mt-1">
                                Note: Your name will be displayed with the suggestion.
                            </p>
                        )}
                    </div>
            
                <button
                    type="submit"
                    className="bg-[#003087] text-white px-6 py-2 rounded-2xl text-sm hover:bg-[#002060] transition"
                >
                    Submit Suggestion
                </button>
            </form>
        </main>
    );
}
