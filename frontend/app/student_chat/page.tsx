'use client';
import { useEffect, useState, useRef} from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  BookOpen, 
  Search, 
  GraduationCap, 
  MessageCircle, 
  Sparkles, 
  User, 
  Bot,
  Plus,
  MoreVertical,
  Send,
  BookMarked,
  Lightbulb,
  Library,
  Notebook,
  Rocket,
  Stars,
  Zap,
  BookText,
  HelpCircle,
  Calendar,
  Clock,
  Crown,
  Atom,
  Cpu,
  CircuitBoard,
  Edit3,
  Trash2
} from 'lucide-react';


const api = process.env.NEXT_PUBLIC_API_URL;

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
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch welcome message when component mounts
    fetch(`${api}/api/chat/welcome`)
      .then(res => res.json())
      .then(data => {
        setWelcomeMessage(data.message);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load welcome message", err);
        setWelcomeMessage("Hello! How can I help you today?");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    fetch(`${api}/api/chat/sessions?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        setSessions(data);
      })
      .catch(err => console.error("Failed to load sessions", err));
  }, [userEmail]);

  useEffect(() => {
    if (!selectedSession || isStartingNewChat) return;

    fetch(`${api}/api/chat/messages?session_id=${selectedSession}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to load messages", err));
  }, [selectedSession, isStartingNewChat]);

  const startNewChat = async () => {
    setIsStartingNewChat(true);
    
    try {
      const res = await fetch(`${api}/api/chat/start_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!res.ok) {
        throw new Error('Failed to start new chat');
      }

      const newSession = await res.json();
      
      // Set the welcome message immediately without fetching from database
      setMessages([{ sender: 'bot', text: newSession.welcome_message || welcomeMessage }]);
      setSelectedSession(newSession.session_id);
      
      // Refresh sessions list
      const updatedSessions = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Error starting new chat:", error);
    } finally {
      setIsStartingNewChat(false);
    }
  };

  const handleRename = async (sessionId: string) => {
    const newTitle = prompt("Enter new chat title:");
    if (!newTitle) return;
    await fetch(`${api}/api/chat/rename_session`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, title: newTitle }),
    });
    const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
    setSessions(updated);
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    await fetch(`${api}/api/chat/delete_session`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
    setSessions(updated);
    if (selectedSession === sessionId) {
      setSelectedSession(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: newMessage,
    };
    
    // Optimistically add user message
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

      const data = await res.json();

      if (res.ok) {
        const botMsg: ChatMessage = {
          sender: 'bot',
          text: data.answer,
        };
        setMessages(prev => [...prev, botMsg]);

        // Refresh sessions to update titles if needed
        const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
        setSessions(updated);
      } else {
        console.error('Bot error:', data.error);
        // Remove the optimistic message if there was an error
        setMessages(prev => prev.filter(msg => msg !== userMsg));
      }
    } catch (err) {
      console.error('Failed to fetch bot reply:', err);
      // Remove the optimistic message if there was an error
      setMessages(prev => prev.filter(msg => msg !== userMsg));
    }
  };


return (
  <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#003087] via-blue-500 to-blue-300">
    {/* Sidebar - University Interface */}
    <div className="w-1/4 min-w-[280px] bg-white/20 backdrop-blur-lg p-5 border-r border-white/30 shadow-xl shadow-blue-200/30 overflow-y-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-white/10 rounded-xl blur-lg"></div>
        <button
          className="relative w-full bg-gradient-to-r from-[#003087] to-blue-600 text-white py-4 px-5 rounded-xl border border-white/30 shadow-lg shadow-blue-200/20 hover:shadow-blue-200/40 transition-all duration-500 hover:scale-[1.02] font-semibold text-lg flex items-center justify-center gap-2"
          onClick={startNewChat}
          disabled={isStartingNewChat}
        >
          <Plus size={20} />
          <span>New Session</span>
        </button>
      </div>

      {Array.isArray(sessions) && sessions.map(session => (
        <div
          key={session.session_id}
          className="relative mb-3 group"
        >
          <div className="absolute inset-0 bg-white/5 rounded-xl blur-md group-hover:bg-white/10 transition-all duration-300"></div>
          <div className={`relative flex items-center justify-between rounded-xl p-1 transition-all duration-300 ${
            selectedSession === session.session_id
              ? 'bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 shadow-md'
              : 'bg-white/20 border border-white/30 group-hover:border-blue-300'
          }`}>
            <button
              onClick={() => setSelectedSession(session.session_id)}
              className="flex-1 text-left py-3 px-4 truncate text-[#003087] font-medium text-sm flex items-center gap-2"
              title={session.title}
            >
              <BookMarked size={16} className="text-blue-600" />
              <span>{session.title}</span>
            </button>

            <div className="relative">
              <button
                className="p-2 text-[#003087] hover:text-blue-700 transition-colors duration-300"
                onClick={() => toggleMenu(session.session_id)}
              >
                <MoreVertical size={16} />
              </button>

              {openMenuId === session.session_id && (
                <div className="absolute right-0 mt-2 w-32 bg-white/95 backdrop-blur-lg shadow-xl rounded-xl border border-blue-200 z-10">
                  <button
                    onClick={() => {
                      handleRename(session.session_id);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-3 text-[#003087] hover:bg-blue-50 transition-all duration-300 border-b border-blue-100 first:rounded-t-xl flex items-center gap-2"
                  >
                    <Edit3 size={14} />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(session.session_id);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-300 last:rounded-b-xl flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Main Chat Area - University AI Assistant */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/30 bg-white/30 backdrop-blur-lg text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-100/5"></div>
        <h2 className="relative text-xl font-bold text-[#003087] truncate flex items-center justify-center gap-2">
          <GraduationCap size={24} className="text-blue-600" />
          {selectedSession 
            ? (sessions.find(s => s.session_id === selectedSession)?.title || 'Active Session')
            : 'University AI Assistant'}
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-white/20 to-blue-100/20 space-y-4 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDMwODciIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTIwIDIwdjBoNHY0aDR2NGgtNHY0aC00di00aC00di00aDR2LTRoNHY0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        
        {isLoading ? (
          <div className="text-center text-[#003087]">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        ) : !selectedSession ? (
          <div className="max-w-3xl mx-auto">
            {/* Floating Holographic AI Bubble */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-200/20 to-purple-300/20 rounded-full border-2 border-blue-500/50 animate-float" 
                   style={{ animation: 'float 3s ease-in-out infinite' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  {/* Awesome AI Icon with gradient */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-50"></div>
                    <CircuitBoard size={48} className="relative text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              {/* Pulsing Holographic Rings */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/30 rounded-full animate-ping-slow"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-purple-500/20 rounded-full animate-ping-slower"></div>
              </div>

              {/* Floating particles around the bubble */}
              <div className="absolute top-4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="absolute top-8 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-1000"></div>
              <div className="absolute bottom-4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-500"></div>
              <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-1500"></div>
            </div>

            {/* University Welcome Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Brain size={40} className="text-[#003087]" />
                <div className="text-3xl font-bold text-[#003087]">Campus AI Assistant</div>
              </div>
              <div className="text-blue-600 flex items-center justify-center gap-1">
                <Sparkles size={16} />
                Your intelligent academic companion
              </div>
            </div>

            {/* Academic Assistance Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Academic Support */}
              <div 
                className="bg-white/80 border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-50 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg"
                onClick={startNewChat}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:animate-bounce">
                    <BookText size={32} className="text-blue-700" />
                  </div>
                </div>
                <div className="text-[#003087] font-semibold mb-2">Academic Support</div>
                <div className="text-blue-600 text-sm">Course materials, assignments, and study help</div>
              </div>

              {/* Research Assistant */}
              <div 
                className="bg-white/80 border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-50 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg"
                onClick={startNewChat}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:animate-pulse">
                    <Search size={32} className="text-blue-700" />
                  </div>
                </div>
                <div className="text-[#003087] font-semibold mb-2">Research Helper</div>
                <div className="text-blue-600 text-sm">Research guidance and resource finding</div>
              </div>

              {/* University Services */}
              <div 
                className="bg-white/80 border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-50 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg"
                onClick={startNewChat}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:animate-spin">
                    <Library size={32} className="text-blue-700" />
                  </div>
                </div>
                <div className="text-[#003087] font-semibold mb-2">Campus Services</div>
                <div className="text-blue-600 text-sm">University information and support services</div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center">
              <div className="text-[#003087] text-lg mb-6 px-8 leading-relaxed bg-white/80 rounded-xl p-6 border border-blue-200 shadow-md">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Stars size={20} className="text-blue-600" />
                  <span className="font-semibold">{welcomeMessage}</span>
                </div>
              </div>
              <button
                onClick={startNewChat}
                className="bg-gradient-to-r from-[#003087] to-blue-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2 mx-auto"
                disabled={isStartingNewChat}
              >
                <Zap size={20} />
                {isStartingNewChat ? "Starting Session..." : "Begin Conversation"}
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#003087] flex items-center justify-center gap-2">
            <Clock size={18} className="animate-spin" />
            <span>Loading your conversation...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
  {messages.map((msg, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`max-w-2xl break-words flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${
        msg.sender !== 'user' ? 'ml-10' : ''
      }`}
    >
      <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          msg.sender === 'user' 
            ? 'bg-blue-100 border-2 border-blue-300' 
            : 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-200'
        }`}>
          {msg.sender === 'user' ? (
            <User size={20} className="text-blue-700" />
          ) : (
            <Atom size={20} className="text-blue-700" />
          )}
        </div>
        <div
          className={`px-5 py-3 rounded-2xl max-w-md ${
            msg.sender === 'user'
              ? 'bg-blue-100 border border-blue-200 text-[#003087]'
              : 'bg-white border border-blue-100 text-[#003087] shadow-sm'
          }`}
        >
          <div className="text-xs text-blue-600 mb-1 font-medium flex items-center gap-1">
            {msg.sender === 'user' ? (
              <>
                <User size={12} />
                <span>You</span>
              </>
            ) : (
              <>
                <Cpu size={12} />
                <span>Campus Assistant</span>
              </>
            )}
          </div>
          {msg.text}
        </div>
      </div>
    </motion.div>
  ))}
</AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {selectedSession && (
        <div className="p-5 border-t border-white/30 bg-white/30 backdrop-blur-lg flex gap-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-100/5"></div>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="relative flex-1 bg-white/80 border-2 border-blue-200 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-[#003087] placeholder-blue-400/60 pl-12"
            placeholder="Ask about courses, assignments, or university services..."
            disabled={isStartingNewChat}
          />
          <div className="absolute left-7 top-1/2 transform -translate-y-1/2">
            <MessageCircle size={20} className="text-blue-400" />
          </div>
          <button
            onClick={sendMessage}
            className="relative bg-gradient-to-r from-[#003087] to-blue-600 text-white px-6 py-4 rounded-xl border-2 border-blue-500 hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center gap-2"
            disabled={!newMessage.trim() || isStartingNewChat}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
      )}

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ping-slow {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping-slower 4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  </div>
);
}