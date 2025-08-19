'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPaperclip, FaUser, FaUserSecret, FaExclamationCircle, FaHeadset, FaShieldAlt, FaLightbulb, FaExclamationTriangle } from "react-icons/fa";

export default function NewComplaintPage() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
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
  const [touched, setTouched] = useState({
    title: false,
    message: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);

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

  const isMeaningfulText = (text: string) => {
    const cleaned = text.trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return false;
    if (/^[\d\s]+$/.test(cleaned)) return false;
    if (/^[^a-zA-Z\u0600-\u06FF0-9]+$/.test(cleaned)) return false;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (uniqueWords.size < 2) return false;
    if (cleaned.length < 5) return false;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mark field as touched when user starts typing
    if (!touched[name as keyof typeof touched]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePrivacyChange = (value: 'public' | 'private') => {
    if (value === 'private' && !showPrivacyWarning) {
      setShowPrivacyWarning(true);
    }
    setFormData(prev => ({ ...prev, dep: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched on submit
    setTouched({ title: true, message: true });

    let newErrors = { title: '', message: '' };
    let hasError = false;

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      hasError = true;
    } else if (!isMeaningfulText(formData.title)) {
      newErrors.title = "Please enter a meaningful title in Arabic or English (at least two words).";
      hasError = true;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      hasError = true;
    } else if (!isMeaningfulText(formData.message)) {
      newErrors.message = "Please enter a meaningful message in Arabic or English (at least two words).";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({ title: '', message: '' });

    const student_email = localStorage.getItem('student_email');
    if (!student_email) {
      alert("User email not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('student_email', student_email);
      data.append('complaint_title', formData.title);
      data.append('complaint_message', formData.message);
      data.append('complaint_type', formData.type);
      data.append('complaint_dep', formData.dep);

      if (file) {
        data.append('file', file);
      }

      const res = await fetch(`${api}/api/student/addcomplaint`, {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        router.push('/student_complaint');
      } else {
        const errorText = await res.text();
        alert('Error: ' + errorText);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex overflow-hidden"
      style={{ background: 'radial-gradient(circle at 20% 20%, #60a5fa, #3b82f6 40%, #1e3a8a 90%)' }}
    >
      {/* Large Exclamation Marks in Background */}
      <div className="absolute top-20 left-16 opacity-20">
        <FaExclamationCircle className="text-blue-300 text-[200px]" />
      </div>
      <div className="absolute bottom-32 right-20 opacity-20">
        <FaExclamationCircle className="text-blue-300 text-[180px] rotate-45" />
      </div>
      <div className="absolute top-1/2 left-1/3 opacity-20">
        <FaExclamationCircle className="text-blue-300 text-[160px] -rotate-25" />
      </div>
      <div className="absolute top-1/4 right-1/4 opacity-20">
        <FaExclamationCircle className="text-blue-300 text-[140px] rotate-12" />
      </div>

      {/* Left Side - Information Panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-center p-12 text-white">
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <FaExclamationCircle className="text-blue-300 text-4xl mr-4" />
            <h1 className="text-4xl font-bold">Report an Issue</h1>
          </div>
          <p className="text-xl text-blue-200 mb-8">
            We're here to listen and help resolve your concerns. Your feedback helps us improve our services.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-blue-700 p-3 rounded-full mr-4">
              <FaHeadset className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">24/7 Support</h3>
              <p className="text-blue-200">Our team is always ready to assist you with any issues.</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-700 p-3 rounded-full mr-4">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Privacy Protected</h3>
              <p className="text-blue-200">Your information is secure and confidential.</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-700 p-3 rounded-full mr-4">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Quick Resolution</h3>
              <p className="text-blue-200">We prioritize your complaints for fast resolution.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-800/30 rounded-2xl border border-blue-600/30">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <FaExclamationCircle className="mr-2 text-blue-300" />
            Before Submitting
          </h3>
          <ul className="text-blue-200 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-300 mr-2">•</span>
              Provide clear and specific details
            </li>
            <li className="flex items-start">
              <span className="text-blue-300 mr-2">•</span>
              Include relevant dates and times
            </li>
            <li className="flex items-start">
              <span className="text-blue-300 mr-2">•</span>
              Attach supporting documents if available
            </li>
          </ul>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-2xl">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 rounded-full mb-4">
              <FaExclamationCircle className="text-white text-2xl mr-2" />
              <h1 className="text-2xl font-bold text-white">Submit a Complaint</h1>
            </div>
            <p className="text-blue-200">We're here to help resolve your concerns</p>
          </div>

          {/* Form Container */}
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-blue-200">
            <div className="absolute -inset-4 bg-blue-100/30 rounded-2xl -z-10 blur-sm"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <FaExclamationCircle className="text-blue-600 mr-2 text-sm" />
                  Complaint Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="What is your complaint about?"
                  className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {touched.title && errors.title && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-sm" />
                    {errors.title}
                  </p>
                )}
                {touched.title && !formData.title.trim() && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-sm" />
                    This field is required
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <FaExclamationCircle className="text-blue-600 mr-2 text-sm" />
                  Complaint Details *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={6}
                  required
                  placeholder="Please describe your complaint in detail. Provide as much information as possible to help us understand and address your concern."
                  className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {touched.message && errors.message && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-sm" />
                    {errors.message}
                  </p>
                )}
                {touched.message && !formData.message.trim() && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-sm" />
                    This field is required
                  </p>
                )}
              </div>

              {/* File Attachment */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <FaPaperclip className="mr-2 text-blue-600" />
                  Attachment (optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors duration-200 bg-blue-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaPaperclip className="w-8 h-8 text-blue-400 mb-2" />
                      <p className="text-sm text-blue-600">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-blue-500 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      name="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Department Selection */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <FaExclamationCircle className="text-blue-600 mr-2 text-sm" />
                  Department *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="academic">Academic</option>
                  <option value="activities">Activities</option>
                  <option value="administrative">Administrative</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              {/* Privacy Setting - Compact Version */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <FaExclamationCircle className="text-blue-600 mr-2 text-sm" />
                  Privacy Setting *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center space-x-3 p-3 border border-blue-200 rounded-lg hover:border-blue-400 cursor-pointer transition-all duration-200 bg-blue-50">
                    <input
                      type="radio"
                      name="privacy"
                      checked={formData.dep === 'public'}
                      onChange={() => handlePrivacyChange('public')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center font-medium text-blue-900 text-sm">
                        <FaUserSecret className="text-blue-600 mr-2" />
                        Keep my name private
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-blue-200 rounded-lg hover:border-blue-400 cursor-pointer transition-all duration-200 bg-blue-50">
                    <input
                      type="radio"
                      name="privacy"
                      checked={formData.dep === 'private'}
                      onChange={() => handlePrivacyChange('private')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center font-medium text-blue-900 text-sm">
                        <FaUser className="text-blue-600 mr-2" />
                        Show my name
                      </div>
                    </div>
                  </label>
                </div>

                {/* Privacy Warning */}
                {showPrivacyWarning && formData.dep === 'private' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <FaExclamationTriangle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        <strong>Privacy Notice:</strong> By choosing to show your name, 
                        your identity will be visible to the department handling your complaint.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="mr-2" />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>

             
            </form>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.push('/student_complaint')}
            className="mt-8 flex items-center text-white hover:text-blue-200 transition-colors duration-200 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Complaints
          </button>
        </div>
      </div>
    </main>
  );
}