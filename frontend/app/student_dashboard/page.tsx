'use client';
import { useRef } from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Dashboard() {
  const [studentName, setStudentName] = useState('Student');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const redirected = useRef(false); // 👈 prevent repeated redirects
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const handleNotificationClick = (notification: Notification) => {
  if (!notification.is_read) {
    // اعمل له تحديث في قاعدة البيانات إنه مقروء
    fetch('http://localhost:5000/api/admin/mark_notification_read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notification.id }) // محتاجة الـ id
    }).then(() => {
      // بعد ما يتعمل update، نحدث حالة الإشعارات في الواجهة
      setNotifications(prev =>
        prev.map(n =>
          n === notification ? { ...n, is_read: true } : n
        )
      );
    });
  }


  // توجيه للشكوى
  if (notification.complaint_id) {
    router.push(`/student_complaint_details?id=${notification.complaint_id}`);
  }
};

type Notification = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  complaint_id?: string;
  suggestion_id?: string;
};

//noti useeffect 
useEffect(() => {
  const email = localStorage.getItem('student_email');
  if (!email) {
    router.push('/login');
  } else {
    // 1. Fetch student name
    fetch(`http://localhost:5000/api/student/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setStudentName(data.name);
        } else {
          setStudentName('Student');
        }
        setIsLoading(false);
      })
      .catch(() => {
        setStudentName('Student');
        setIsLoading(false);
      });

    // 2. Fetch notifications for student
    fetch(`http://localhost:5000/api/student/notifications?student_email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
      })
      .catch(error => {
        console.error("Failed to fetch student notifications:", error);
      });
  }
}, [router]);

 


  const handleLogout = () => {
    localStorage.removeItem('student_email');
    router.push('/login');
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen text-[#003087] flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-10 py-4 bg-transparent shadow-none">
        <div className="flex flex-col items-center">
          <img src="/fci_new_logo2.png" alt="Faculty Logo" className="w-20 h-20 mb-1 drop-shadow-lg" />
          <p className="text-sm font-semibold text-white text-center">Faculty of Computer & Information</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="/assuitUnivirsity.png" alt="University Logo" className="w-20 h-20 mb-1 drop-shadow-lg" />
          <p className="text-sm font-semibold text-white text-center">Assiut University</p>
        </div>
      </header>

      {/* Navigation Bar */}
<nav className="bg-[#003087] text-white py-3 shadow-md">
  <ul className="flex justify-center gap-6 font-semibold text-sm md:text-base">
    <li>
      <button
        onClick={() => router.push('/student_complaint')}
        className="hover:underline hover:text-gray-300 transition"
      >
        Complaints
      </button>
    </li>
    <li>
      <button
        onClick={() => router.push('/student_suggestions')}
        className="hover:underline hover:text-gray-300 transition"
      >
       
        Suggestions
      </button>
    </li>
  
    <li className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative hover:text-gray-300 transition text-lg"
    title="Notifications"
  >
    🔔
    {notifications.filter(n => !n.is_read).length > 0 && (
  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
    {notifications.filter(n => !n.is_read).length}
  </span>
)}

  </button>
   {/* Dropdown تحت الجرس */}
  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
      <h2 className="text-lg font-bold text-[#003087] mb-2">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-600">No new notifications</p>
      ) : (
        notifications.map((n, i) => (
  <div
  key={i}
  onClick={async () => {
  await fetch('http://localhost:5000/api/student/mark_notification_read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notification_id: n.id }),
  });

  // تأكدي إن فيه ID صالح قبل ما تعملي push
  if (n.suggestion_id) {
    router.push(`/student_suggestions/${n.suggestion_id}`);
  } else if (n.complaint_id) {
    router.push(`/student_complaint/${n.complaint_id}`);

  } else {
    console.warn("No valid ID in this notification");
  }
}}

  className={`mb-3 border-b pb-2 cursor-pointer p-2 rounded transition ${
    n.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-black font-semibold'
  } hover:bg-gray-200`}
>
  <p className="text-sm">{n.message}</p>
  <p className="text-xs">{new Date(n.created_at).toLocaleString()}</p>
</div>

))


      )}
    </div>
  )}
</li>
    <li>
  <button
    onClick={handleLogout}
    className="hover:text-gray-300 transition"
    title="Logout"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      viewBox="0 0 24 24"
    >
       <title>Logout</title>
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3zm10.707 9.293-3-3-1.414 1.414L17.586 11H9v2h8.586l-1.293 1.293 1.414 1.414 3-3a1 1 0 0 0 0-1.414z"/>
    </svg>
  </button>
</li>

  </ul>
</nav>

     {/* Welcome Section */}
      <section
  className="flex-grow flex flex-col items-center justify-center text-center px-6"
  style={{ backgroundImage: "url('/home1-ar-lzneos.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
>
  <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
    Welcome, {studentName} 🎓
  </h1>
  <p className="text-xl text-white drop-shadow-md">
    This is your university platform for complaints and suggestions
  </p>
</section>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => router.push('/student_chat')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all z-50"
        title="Chat with Assistant"
      >
        💬
      </button>

      {/* Optional: Chat popup placeholder */}
      {chatOpen && (
        <div className="fixed bottom-20 right-6 bg-white w-96 h-96 p-4 rounded-xl shadow-xl border border-blue-200 z-50 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-blue-800">AI Assistant 🤖</h2>
            <button onClick={() => setChatOpen(false)} className="text-red-500 hover:text-red-700">✖</button>
          </div>
          <div className="flex-grow overflow-y-auto border-t pt-2 text-sm text-gray-700">
            {/* Your chat content goes here, or integrate Chat component */}
            <p className="text-center text-gray-500 mt-10">Chatbot UI coming soon...</p>
          </div>
        </div>
      )}

    </div>
  );
}

