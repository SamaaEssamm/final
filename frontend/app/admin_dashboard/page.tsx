'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const redirected = useRef(false); // 👈 prevent repeated redirects
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const handleNotificationClick = (notification: Notification) => {
  if (!notification.is_read) {
    // اعمل له تحديث في قاعدة البيانات إنه مقروء
    fetch('http://web-production-93bbb.up.railway.app/api/admin/mark_notification_read', {
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
    router.push(`/admin_complaint/${notification.complaint_id}}`);

  }
};

type Notification = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  complaint_id?: string;
  suggestion_id? : string;
};

//noti useeffect 
useEffect(() => {
  const email = localStorage.getItem('admin_email');
  if (!email) return;

  fetch(`http://web-production-93bbb.up.railway.app/api/admin/notifications?admin_email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error("Unexpected data format:", data);
      }
    })
    .catch(err => {
      console.error("Failed to fetch notifications:", err);
    });
}, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
  if (role !== "admin") {
    router.push("/no-access");
    return;
  }
    const email = localStorage.getItem('admin_email');
    if (!email) { 
      if (!redirected.current) {
        redirected.current = true;
        router.replace('/login');
      }
 
    } else {
      fetch(`http://web-production-93bbb.up.railway.app/api/get_admin_name/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) {
            setAdminName(data.name);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_email');
    router.push('/login');
  };

  if (isLoading) return null;

  return (
    <div
      className="min-h-screen bg-cover bg-center text-[#003087] flex flex-col">
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
        onClick={() => router.push('/admin_manage_complaints')}
        className="hover:underline hover:text-gray-300 transition"
      >
        Manage Complaints
      </button>
    </li>
    <li>
      <button
        onClick={() => router.push('/admin_manage_suggestions')}
        className="hover:underline hover:text-gray-300 transition"
      >
        Manage Suggestions
      </button>
    </li>
    <li>
      <button
        onClick={() => router.push('/admin_manage_students')}
        className="hover:underline hover:text-gray-300 transition"
      >
        Manage Students
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
  
  {/* Dropdown */}
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
  await fetch('http://web-production-93bbb.up.railway.app/api/admin/mark_notification_read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notification_id: n.id }),
  });

  if (n.suggestion_id) {
    router.push(`/admin_suggestion/${n.suggestion_id}`);
  } else if (n.complaint_id) {
    router.push(`/admin_complaint/${n.complaint_id}`);

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
          Welcome, {adminName} 🧑‍💼
        </h1>
        <p className="text-xl text-white drop-shadow-md">
          This is your admin dashboard to manage complaints and suggestions
        </p>
      </section>

{/* Footer */}
<footer className="bg-[#003087] text-white py-4 mt-auto transition-all duration-500 hover:py-10 group">
  <div className="container mx-auto text-center text-sm">
    <p>© {new Date().getFullYear()} Faculty of Computer & Information - Assiut University</p>

    <div className="overflow-hidden max-h-0 opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100 mt-3">
      <p className="mt-2">📍 Location: Assiut University, Egypt</p>
      <p>📞 Phone: (088) 347678</p>
      <p>🌐 Website: <a href="https://www.aun.edu.eg/fci/ar/home-2" className="underline hover:text-gray-300">www.aun.edu.eg</a></p>
      <p className="mt-1">
      Contact:{" "}
      <a href="mailto:fci_assiut@fci.au.edu.eg" className="underline hover:text-gray-300">
        fci_assiut@fci.au.edu.eg
      </a>
      </p>
      <div className="mt-2 flex justify-center gap-4">
        <a href="https://www.facebook.com/profile.php?id=100057545794964&ref=hl#" className="hover:text-gray-300">Facebook</a>
        <a href="https://youtube.com/@facultyofcomputersandinfor1234?si=60jcJIm4spA4a8o_" className="hover:text-gray-300">YouTube</a>
        <a href="https://x.com/fci_aun" className="hover:text-gray-300">Twitter</a>
      </div>
    </div>
  </div>
</footer>

      
    </div>
  );
}


