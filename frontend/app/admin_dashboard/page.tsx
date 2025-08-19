'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaBell, FaExclamationCircle, FaLightbulb, FaUsers, FaChartBar, FaCog, FaEnvelope, FaClipboardList, FaComments } from 'react-icons/fa';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
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
      // Fetch admin name
      fetch(`${api}/api/get_admin_name/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) {
            setAdminName(data.name);
          }
        })
        .catch(() => {
          // Continue even if name fetch fails
        });

      // Fetch statistics with better error handling
      fetch(`${api}/api/admin/dashboard_stats`)
        .then(res => {
          console.log("Response status:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Stats data received:", data);
          if (data && typeof data === 'object') {
            setStats({
              complaints: data.complaints || 0,
              suggestions: data.suggestions || 0,
              students: data.students || 0,
              unreadNotifications: data.unreadNotifications || 0
            });
            setStatsError(false);
          } else {
            throw new Error("Invalid data format");
          }
        })
        .catch(err => {
          console.error("Failed to fetch stats:", err);
          setStatsError(true);
          // Set fallback data for development
          setStats({
            complaints: 15,
            suggestions: 9,
            students: 187,
            unreadNotifications: 4
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [router, api]);

  // Fetch notifications
  useEffect(() => {
    const email = localStorage.getItem('admin_email');
    if (!email) return;

    fetch(`${api}/api/admin/notifications?admin_email=${encodeURIComponent(email)}`)
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
        // Set demo notifications if API fails
        setNotifications([
          {
            id: "1",
            message: "System is using demo data. API endpoint not found.",
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);
      });
  }, [api]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await fetch(`${api}/api/admin/mark_notification_read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_id: notification.id })
        });
        
        setNotifications(prev =>
          prev.map(n =>
            n === notification ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (notification.suggestion_id) {
      router.push(`/admin_suggestion/${notification.suggestion_id}`);
    } else if (notification.complaint_id) {
      router.push(`/admin_complaint/${notification.complaint_id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_email');
    localStorage.removeItem('role');
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
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
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
            {statsError && (
              <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Showing demo data. Could not connect to server.
                </p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.complaints}
                    {statsError && <span className="text-xs text-red-500 ml-2">⚠️ Demo</span>}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaExclamationCircle className="text-blue-600 text-xl" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/admin_manage_complaints')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all →
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Suggestions</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.suggestions}
                    {statsError && <span className="text-xs text-red-500 ml-2">⚠️ Demo</span>}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaLightbulb className="text-purple-600 text-xl" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/admin_manage_suggestions')}
                className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View all →
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Registered Students</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.students}
                    {statsError && <span className="text-xs text-red-500 ml-2">⚠️ Demo</span>}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaUsers className="text-green-600 text-xl" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/admin_manage_students')}
                className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Manage students →
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                  <p className="text-2xl font-bold text-red-900">
                    {stats.unreadNotifications}
                    {statsError && <span className="text-xs text-red-500 ml-2">⚠️ Demo</span>}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FaBell className="text-red-600 text-xl" />
                </div>
              </div>
              <button 
                onClick={() => setShowNotifications(true)}
                className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                View notifications →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/admin_manage_complaints')}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="p-3 bg-blue-100 rounded-full mb-3">
                  <FaExclamationCircle className="text-blue-600 text-xl" />
                </div>
                <span className="font-medium text-blue-900">Manage Complaints</span>
              </button>

              <button 
                onClick={() => router.push('/admin_manage_suggestions')}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="p-3 bg-purple-100 rounded-full mb-3">
                  <FaLightbulb className="text-purple-600 text-xl" />
                </div>
                <span className="font-medium text-purple-900">Manage Suggestions</span>
              </button>

              <button 
                onClick={() => router.push('/admin_manage_students')}
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="p-3 bg-green-100 rounded-full mb-3">
                  <FaUsers className="text-green-600 text-xl" />
                </div>
                <span className="font-medium text-green-900">Manage Students</span>
              </button>

              <button 
                onClick={() => router.push('/admin_settings')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full mb-3">
                  <FaCog className="text-gray-600 text-xl" />
                </div>
                <span className="font-medium text-gray-900">Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-blue-900 mb-6">Recent Activity</h2>
            <div className="text-center py-10 text-gray-500">
              <FaChartBar className="text-4xl mx-auto mb-4 text-gray-300" />
              <p>Activity dashboard coming soon</p>
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