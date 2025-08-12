'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight} from "react-icons/fa";

export default function NewComplaintPage() {
  
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'academic',
    dep: 'public',
  });
    useEffect(() => {
    const email = localStorage.getItem('student_email');
  if (!email) {
    router.push('/login');
    return;
  }

  const role = localStorage.getItem("role");
  if (role !== "student") {
    router.push("/no-access");
    return;
  }
  }, [router]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const student_email = localStorage.getItem('student_email');
    if (!student_email) {
    alert("User email not found. Please log in again.");
    return;
  }

  try {
            //const file = fileInputRef.current?.files?.[0] || null;
            const data = new FormData();
            data.append('student_email', student_email);
            data.append('complaint_title', formData.title);
            data.append('complaint_message', formData.message);
            data.append('complaint_type', formData.type);
            data.append('complaint_dep', formData.dep);

            if (file) {
                data.append('file', file); // ده الفايل اللي هيترفع
            }

            const res = await fetch('http://127.0.0.1:5000/api/student/addcomplaint', {
                method: 'POST',
                body: data,
            });

  if (res.ok) {
    router.push('/student_complaint');
  } else {
    const errorText = await res.text();
    alert('Error: ' + errorText);
  }
}
   catch (error) {

    console.error("Error submitting complaint:", error);
    alert("Something went wrong. Please try again later.");
  }
};

 

  return (
    <main className="bg-white min-h-screen py-10 px-6 md:px-12 lg:px-24">
      <h1 className="text-3xl font-bold text-[#003087] mb-8">Submit a Complaint</h1>

      <button
        onClick={() => router.push('/student_complaint')}
        title="Back"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "40px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          color: "blue",
          fontSize: "60px",
        }}
      >
        <FaArrowLeft />
      </button>


      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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
        </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
        <input
          type="file"
          name="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none"
        />
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>


            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>

            <select
              name="dep"
              value={formData.dep}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087]"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>


            {formData.dep === 'public' && (
  <p className="text-sm text-green-600 mt-1">
    Note: Since the complaint is "Public", your name will NOT be displayed to protect your privacy.
  </p>
)}
            {formData.dep === 'private' && (
              <p className="text-sm text-red-600 mt-1">
                Note: Since the complaint is "Private", your name will be displayed with the complaint.
              </p>
            )}

          </div>
        </div>

        <button
          type="submit"
          className="bg-[#003087] text-white px-6 py-2 rounded-2xl text-sm hover:bg-[#002060] transition"
        >
          Submit Complaint
        </button>
      </form>
    </main>
  );
}