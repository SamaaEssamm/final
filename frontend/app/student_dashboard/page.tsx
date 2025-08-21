'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaBell, FaExclamationCircle, FaLightbulb, FaComments, FaGraduationCap, FaUserCircle, FaRocket, FaBullhorn } from 'react-icons/fa';

export default function Dashboard() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const [studentName, setStudentName] = useState('Student');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
  complaints: 0,
  suggestions: 0,
  unread_notifications: 0,
  lastComplaint: null as { title: string; date: string } | null,
  lastSuggestion: null as { title: string; date: string } | null
});
  const router = useRouter();
  const redirected = useRef(false); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  type Notification = {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    complaint_id?: string;
    suggestion_id?: string;
  };
  
  useEffect(() => {
    console.log('Current stats:', stats);
    console.log('Current notifications:', notifications);
    console.log('Unread notifications count:', stats.unread_notifications);
  }, [stats, notifications]);

  useEffect(() => {
    const email = localStorage.getItem('student_email');
    
    if (!email) {
      router.push('/login');
    } else {
      const role = localStorage.getItem("role");
      if (role !== "student") {
        router.push("/no-access");
        return; 
      }
     
      fetch(`${api}/api/student/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) {
            setStudentName(data.name);
          } else {
            setStudentName('Student');
          }
        })
        .catch(() => {
          setStudentName('Student');
        });

      fetchDashboardData(email);
    }
  }, [router]);

  const fetchDashboardData = async (email: string) => {
    setIsLoadingNotifications(true);
    try {
      const [statsResponse, notificationsResponse] = await Promise.all([
        fetch(`${api}/api/student/dashboard_stats?student_email=${encodeURIComponent(email)}`),
        fetch(`${api}/api/student/notifications?student_email=${encodeURIComponent(email)}`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
  complaints: statsData.complaints || 0,
  suggestions: statsData.suggestions || 0,
  unread_notifications: statsData.unread_notifications || statsData.unreadNotifications || 0,
  lastComplaint: statsData.last_complaint || null,
  lastSuggestion: statsData.last_suggestion || null
});


      } else {
        console.error('Failed to fetch student stats');
        tryAlternativeEndpoint(email);
      }

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      } else {
        console.error('Failed to fetch notifications');
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      tryAlternativeEndpoint(email);
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsLoadingNotifications(false);
    }
  };

  const tryAlternativeEndpoint = async (email: string) => {
    try {
      const response = await fetch(`${api}/api/student/stats?student_email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        setStats({
  complaints: data.complaints || 0,
  suggestions: data.suggestions || 0,
  unread_notifications: data.unread_notifications || 0,
  lastComplaint: data.last_complaint || null,
  lastSuggestion: data.last_suggestion || null
});
      }
    } catch (error) {
      console.error("Error fetching from alternative endpoint:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await fetch(`${api}/api/student/mark_notification_read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_id: notification.id })
        });
        
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        
        setStats(prev => ({ 
          ...prev, 
          unread_notifications: Math.max(0, prev.unread_notifications - 1) 
        }));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (notification.suggestion_id) {
      router.push(`/student_suggestions/${notification.suggestion_id}`);
    } else if (notification.complaint_id) {
      router.push(`/student_complaint/${notification.complaint_id}`);
    }
    
    setShowNotifications(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('student_email');
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src="/fci_new_logo2.png" alt="Faculty Logo" className="w-14 h-14 drop-shadow-lg" />
              <img src="/assuitUnivirsity.png" alt="University Logo" className="w-14 h-14 drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Faculty of Computer & Information</h1>
              <p className="text-blue-100">Assiut University - Student Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 transform hover:scale-110"
                title="Notifications"
              >
                <FaBell className="text-xl" />
                {stats.unread_notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                    {stats.unread_notifications}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <h3 className="font-semibold">Notifications</h3>
                    <span className="text-xs text-blue-100">
                      {stats.unread_notifications} unread
                    </span>
                  </div>
                  {isLoadingNotifications ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification, index) => (
                        <div
                          key={index}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
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
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">Welcome, {studentName}</p>
                <p className="text-xs text-blue-100">Student</p>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <FaUserCircle className="text-xl" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 transform hover:scale-110"
                title="Logout"
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Hey {studentName}! 👋</h1>
                <p className="text-blue-100 text-lg">Ready to make your voice heard?</p>
                <p className="text-blue-100 mt-2">You've submitted {stats.complaints + stats.suggestions} items so far</p>
              </div>
              <div className="text-6xl">
                🎓
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Complaints</p>
                  <p className="text-4xl font-bold text-blue-900 mt-2">{stats.complaints}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <FaBullhorn className="text-blue-600 text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Suggestions</p>
                  <p className="text-4xl font-bold text-purple-900 mt-2">{stats.suggestions}</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-full">
                  <FaRocket className="text-purple-600 text-3xl" />
                </div>
              </div>
            </div>

            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => router.push('/student_complaint')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <FaExclamationCircle className="text-3xl group-hover:scale-110 transition-transform" />
                <div className="text-4xl">📝</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Submit Complaint</h3>
              <p className="text-blue-100">Report issues or problems you're facing</p>
              <div className="mt-4 flex items-center text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Quick Action</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            <div 
              onClick={() => router.push('/student_suggestions')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <FaLightbulb className="text-3xl group-hover:scale-110 transition-transform" />
                <div className="text-4xl">💡</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Make Suggestion</h3>
              <p className="text-purple-100">Share ideas to improve our university</p>
              <div className="mt-4 flex items-center text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Quick Action</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            <div 
              onClick={() => router.push('/student_chat')}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <FaComments className="text-3xl group-hover:scale-110 transition-transform" />
                <div className="text-4xl">🤖</div>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
              <p className="text-green-100">Get help with your complaints and suggestions</p>
              <div className="mt-4 flex items-center text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">24/7 Support</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          </div>

         <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
 
</div>
        </div>
      </main>

      <button
        onClick={() => router.push('/student_chat')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center w-16 h-16 group"
        title="Chat with Assistant"
      >
        <FaComments className="text-2xl" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full group-hover:scale-110 transition-transform">
          AI
        </span>
      </button>

      <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} Faculty of Computer & Information - Assiut University
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="https://www.aun.edu.eg/fci/ar/home-2" className="hover:text-blue-200 transition-colors">
              Website
            </a>
            <a href="mailto:fci_assiut@fci.au.edu.eg" className="hover:text-blue-200 transition-colors">
              Contact
            </a>
            <a href="https://www.facebook.com/profile.php?id=100057545794964&ref=hl#" className="hover:text-blue-200 transition-colors">
              Facebook
            </a>
            <a href="https://youtube.com/@facultyofcomputersandinfor1234?si=60jcJIm4spA4a8o_" className="hover:text-blue-200 transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}