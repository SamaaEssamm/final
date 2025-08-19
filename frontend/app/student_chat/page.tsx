'use client';
import { useEffect, useState, useRef} from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { FaEllipsisV } from "react-icons/fa";

type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
  created_at?: string;
};

type ChatSession = {
  session_id: string;
  title: string;
  created_at: string;
  status: 'open' | 'close';
};

export default function StudentChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const api = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-93bbb.up.railway.app';
  
  const toggleMenu = (sessionId: string) => {
    setOpenMenuId(prev => (prev === sessionId ? null : sessionId));
  };

  useEffect(() => {
    const email = localStorage.getItem('student_email');
    if (email) setUserEmail(email);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // دالة لإنشاء جلسة جديدة - متوافقة مع الباك اند
  const startNewChat = async () => {
    if (!userEmail) {
      console.error("User email is not available");
      return null;
    }

    try {
      setIsCreatingNewChat(true);
      const res = await fetch(`${api}/api/chat/start_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          message: 'New chat started'
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }

      const newSession = await res.json();
      setSelectedSession(newSession.session_id);
      setMessages([{ sender: 'user', text: 'New chat started' }]);

      // تحديث قائمة الجلسات
      const sessionsResponse = await fetch(`${api}/api/chat/sessions?email=${userEmail}`);
      if (sessionsResponse.ok) {
        const updatedSessions = await sessionsResponse.json();
        setSessions(updatedSessions);
      }

      return newSession.session_id;
    } catch (error) {
      console.error("Failed to start new chat:", error);
      return null;
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    const loadSessionsAndCreateIfNeeded = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${api}/api/chat/sessions?email=${encodeURIComponent(userEmail)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSessions(data);

        if (data.length > 0) {
          const openSession = data.find((s: ChatSession) => s.status === "open");
          if (openSession) {
            setSelectedSession(openSession.session_id); 
          } else {
            // إذا لم توجد جلسة مفتوحة، أنشئ جلسة جديدة
            const newSessionId = await startNewChat();
            if (newSessionId) {
              setSelectedSession(newSessionId);
            }
          }
        } else {
          // إذا لم يكن هناك أي جلسات، أنشئ جلسة جديدة
          const newSessionId = await startNewChat();
          if (newSessionId) {
            setSelectedSession(newSessionId);
          }
        }
      } catch (err) {
        console.error("Failed to load sessions", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionsAndCreateIfNeeded();
  }, [userEmail]);

  const handleRename = async (sessionId: string) => {
    const newTitle = prompt("Enter new chat title:");
    if (!newTitle) return;
    
    try {
      const response = await fetch(`${api}/api/chat/rename_session`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, title: newTitle }),
      });
      
      if (response.ok) {
        const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
        setSessions(updated);
      }
    } catch (error) {
      console.error("Failed to rename session:", error);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    
    try {
      const response = await fetch(`${api}/api/chat/delete_session`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      
      if (response.ok) {
        const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
        setSessions(updated);
        if (selectedSession === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  useEffect(() => {
    if (!selectedSession) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`${api}/api/chat/messages?session_id=${selectedSession}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
  }, [selectedSession]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !userEmail) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: newMessage,
    };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');

    try {
      const res = await fetch(`${api}/api/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newMessage,
          session_id: selectedSession,
          user_email: userEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: data.answer,
        };
        setMessages(prev => [...prev, botMsg]);

        // تحديث قائمة الجلسات للحصول على أحدث العناوين
        const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
        setSessions(updated);
      } else {
        console.error('Bot error:', await res.text());
      }
    } catch (err) {
      console.error('Failed to fetch bot reply:', err);
      // في حالة الخطأ، نعرض رسالة خطأ للمستخدم
      const errorMsg: ChatMessage = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  // دالة للتعامل مع النقر على الاقتراحات
  const handleSuggestionClick = (suggestionText: string) => {
    setNewMessage(suggestionText);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4 min-w-[250px] bg-gray-100 p-4 border-r border-gray-300 shadow-inner overflow-y-auto">
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg mb-4 shadow hover:bg-blue-600 transition disabled:bg-blue-300"
          onClick={startNewChat}
          disabled={isCreatingNewChat}
        >
          {isCreatingNewChat ? "Creating..." : "+ New Chat"}
        </button>

        {isLoading ? (
          <div className="text-center">Loading chats...</div>
        ) : (
          Array.isArray(sessions) && sessions.map(session => (
            <div
              key={session.session_id}
              className={`flex items-center justify-between mb-2 rounded-lg transition ${
                selectedSession === session.session_id
                  ? 'bg-blue-200 font-semibold shadow'
                  : 'bg-white hover:bg-gray-200'
              }`}
            >
              
              <button
                onClick={() => setSelectedSession(session.session_id)}
                className="flex-1 text-left py-2 px-3 truncate"
                title={session.title}
              >
                {session.title}
              </button>

              <div className="relative">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => toggleMenu(session.session_id)}
                >
                  <FaEllipsisV />
                </button>

                {openMenuId === session.session_id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        handleRename(session.session_id);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(session.session_id);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-white shadow text-center">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {Array.isArray(sessions) &&
              (sessions.find(s => s.session_id === selectedSession)?.title || 'Select a chat')}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-white space-y-4">
          {messages.length === 0 && selectedSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 rounded-2xl shadow-lg max-w-md">
                <h3 className="text-2xl font-bold mb-4">Welcome to Academic Assistant Chat!</h3>
                <p className="text-lg mb-2">I'm your AI assistant</p>
                <p className="text-lg mb-4">How can I help you today?</p>
                <div className="flex justify-center">
                  <div className="animate-bounce bg-white text-blue-500 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* إضافة رسائل اقتراحية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 px-4">
                <div 
                  className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => handleSuggestionClick("Can you help me with my homework?")}
                >
                  <h4 className="font-semibold">Homework Help</h4>
                  <p className="text-sm text-gray-600">Can you help me with my homework?</p>
                </div>
                <div 
                  className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => handleSuggestionClick("Explain this concept to me")}
                >
                  <h4 className="font-semibold">Concept Explanation</h4>
                  <p className="text-sm text-gray-600">Explain this concept to me</p>
                </div>
                <div 
                  className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => handleSuggestionClick("How can I improve my study skills?")}
                >
                  <h4 className="font-semibold">Study Skills</h4>
                  <p className="text-sm text-gray-600">How can I improve my study skills?</p>
                </div>
                <div 
                  className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => handleSuggestionClick("I need help understanding this topic")}
                >
                  <h4 className="font-semibold">Topic Help</h4>
                  <p className="text-sm text-gray-600">I need help understanding this topic</p>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-xl break-words ${
                    msg.sender === 'user' ? 'ml-auto text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex gap-2 shadow-inner">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Type your message..."
            disabled={!selectedSession || isCreatingNewChat}
          />
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition disabled:bg-green-300"
            disabled={!newMessage.trim() || !selectedSession || isCreatingNewChat}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}