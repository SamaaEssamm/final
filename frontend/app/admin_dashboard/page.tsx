'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaBell, FaExclamationCircle, FaLightbulb, FaUsers, FaChartBar, FaCog, FaHome } from 'react-icons/fa';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    complaints: 0,
    suggestions: 0,
    students: 0,
    unreadNotifications: 0
  });
  const router = useRouter();
  const redirected = useRef(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL;
  type Notification = {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    complaint_id?: string;
    suggestion_id?: string;
  };

  useEffect(() => {
    const email = localStorage.getItem('admin_email');
    if (!email) { 
      if (!redirected.current) {
        redirected.current = true;
        router.replace('/login');
      }
    } else {
      fetch(`${api}/api/get_admin_name/${encodeURIComponent(email)}`)
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

      // Fetch statistics
      fetchDashboardStats();
    }
  }, [router]);

  // دالة منفصلة لجلب الإحصائيات
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${api}/api/admin/dashboard_stats`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Dashboard stats:', data);
        setStats({
          complaints: data.complaints || 0,
          suggestions: data.suggestions || 0,
          students: data.students || 0,
          unreadNotifications: data.unreadNotifications || 0
        });
        console.log("Updated stats:", {
          complaints: data.complaints || 0,
          suggestions: data.suggestions || 0,
          students: data.students || 0,
          unreadNotifications: data.unreadNotifications || 0
        })
      } else {
        console.error('Failed to fetch dashboard stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch notifications
  useEffect(() => {
    const email = localStorage.getItem('admin_email');
    if (!email) return;

    fetch(`${api}/api/admin/notifications?admin_email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          // تحديث عدد الإشعارات غير المقروءة
          const unreadCount = data.filter((n: Notification) => !n.is_read).length;
          setStats(prev => ({ ...prev, unreadNotifications: unreadCount }));
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch notifications:", err);
      });
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await fetch(`${api}/api/admin/mark_notification_read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_id: notification.id })
        });
        
        // تحديث حالة الإشعار محلياً
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        
        // تحديث العداد
        setStats(prev => ({ ...prev, unreadNotifications: prev.unreadNotifications - 1 }));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (notification.suggestion_id) {
      router.push(`/admin_suggestion/${notification.suggestion_id}`);
    } else if (notification.complaint_id) {
      router.push(`/admin_complaint/${notification.complaint_id}`);
    }
    
    // إغلاق قائمة الإشعارات بعد النقر
    setShowNotifications(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_email');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img src="/fci_new_logo2.png" alt="Faculty Logo" className="w-12 h-12" />
            <img src="/assuitUnivirsity.png" alt="University Logo" className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">Faculty of Computer & Information</h1>
            <p className="text-sm text-blue-700">Assiut University</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              title="Notifications"
            >
              <FaBell className="text-xl" />
              {stats.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                  {stats.unreadNotifications}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-blue-900">Notifications</h3>
                  <span className="text-xs text-gray-500">
                    {stats.unreadNotifications} unread
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer transition-colors ${
                          notification.is_read 
                            ? 'bg-white hover:bg-gray-50' 
                            : 'bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-start">
                          {!notification.is_read && (
                            <span className="mt-1.5 mr-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900">Welcome, {adminName}</p>
              <p className="text-xs text-blue-700">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
              title="Logout"
            >
              <FaSignOutAlt className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {adminName}!</h1>
            <p className="text-blue-100">Here's what's happening with your platform today.</p>
            <button 
              onClick={fetchDashboardStats}
              className="mt-4 text-sm bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Refresh Stats
            </button>
          </div>

          {/* Stats Cards - تم تعديلها لتصبح 3 بطاقات فقط */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Complaints Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Complaints</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.complaints}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaExclamationCircle className="text-blue-600 text-2xl" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/admin_manage_complaints')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                View All Complaints
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {/* Suggestions Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Suggestions</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">{stats.suggestions}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaLightbulb className="text-purple-600 text-2xl" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/admin_manage_suggestions')}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                View All Suggestions
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {/* Students Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Registered Students</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.students}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaUsers className="text-green-600 text-2xl" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/admin_manage_students')}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Manage Students
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Actions - تم تحسين الشكل */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => router.push('/admin_manage_complaints')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md border border-blue-200"
              >
                <div className="p-4 bg-blue-600 rounded-full mb-4 text-white">
                  <FaExclamationCircle className="text-2xl" />
                </div>
                <span className="font-semibold text-blue-900 text-lg mb-2">Manage Complaints</span>
                <p className="text-sm text-blue-700 text-center">View and respond to student complaints</p>
              </button>

              <button 
                onClick={() => router.push('/admin_manage_suggestions')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md border border-purple-200"
              >
                <div className="p-4 bg-purple-600 rounded-full mb-4 text-white">
                  <FaLightbulb className="text-2xl" />
                </div>
                <span className="font-semibold text-purple-900 text-lg mb-2">Manage Suggestions</span>
                <p className="text-sm text-purple-700 text-center">Review and manage student suggestions</p>
              </button>

              <button 
                onClick={() => router.push('/admin_manage_students')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md border border-green-200"
              >
                <div className="p-4 bg-green-600 rounded-full mb-4 text-white">
                  <FaUsers className="text-2xl" />
                </div>
                <span className="font-semibold text-green-900 text-lg mb-2">Manage Students</span>
                <p className="text-sm text-green-700 text-center">View and manage student accounts</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Faculty of Computer & Information - Assiut University
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <a href="https://www.aun.edu.eg/fci/ar/home-2" className="hover:text-blue-600 transition-colors">
              Website
            </a>
            <a href="mailto:fci_assiut@fci.au.edu.eg" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
            <a href="https://www.facebook.com/profile.php?id=100057545794964&ref=hl#" className="hover:text-blue-600 transition-colors">
              Facebook
            </a>
            <a href="https://youtube.com/@facultyofcomputersandinfor1234?si=60jcJIm4spA4a8o_" className="hover:text-blue-600 transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}