'use client';
import { useEffect, useState, useRef} from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  X,
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
  Trash2,
  ChevronLeft
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
  const [showRenamePrompt, setShowRenamePrompt] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      
      setMessages([{ sender: 'bot', text: newSession.welcome_message || welcomeMessage }]);
      setSelectedSession(newSession.session_id);
      
      const updatedSessions = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Error starting new chat:", error);
    } finally {
      setIsStartingNewChat(false);
    }
  };

  const handleRename = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    await fetch(`${api}/api/chat/rename_session`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, title: newTitle }),
    });
    const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
    setSessions(updated);
  };

  const openRenamePrompt = (sessionId: string, currentTitle: string) => {
    setRenameSessionId(sessionId);
    setNewTitleInput(currentTitle);
    setShowRenamePrompt(true);
    setOpenMenuId(null);
  };

  const confirmRename = () => {
    if (renameSessionId && newTitleInput.trim()) {
      handleRename(renameSessionId, newTitleInput);
    }
    setShowRenamePrompt(false);
    setRenameSessionId(null);
    setNewTitleInput('');
  };

  const cancelRename = () => {
    setShowRenamePrompt(false);
    setRenameSessionId(null);
    setNewTitleInput('');
  };

  const handleDelete = async (sessionId: string) => {
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

        const updated = await fetch(`${api}/api/chat/sessions?email=${userEmail}`).then(res => res.json());
        setSessions(updated);
      } else {
        console.error('Bot error:', data.error);
        setMessages(prev => prev.filter(msg => msg !== userMsg));
      }
    } catch (err) {
      console.error('Failed to fetch bot reply:', err);
      setMessages(prev => prev.filter(msg => msg !== userMsg));
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      {/* Rename Prompt Modal */}
      {showRenamePrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800">Rename Chat</h3>
              <button
                onClick={cancelRename}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTitleInput}
              onChange={(e) => setNewTitleInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new chat title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename();
                if (e.key === 'Escape') cancelRename();
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRename}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                disabled={!newTitleInput.trim()}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Sidebar */}
      <div className={`bg-white shadow-lg z-10 flex flex-col h-full border-r border-purple-100 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="text-white" size={24} />
              <h1 className="text-xl font-bold">University Assistant</h1>
            </div>
          )}
          <button
            className={`w-full bg-white text-blue-800 py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2 mt-2 ${sidebarCollapsed ? 'p-2' : ''}`}
            onClick={startNewChat}
            disabled={isStartingNewChat}
            title={sidebarCollapsed ? "New Chat" : undefined}
          >
            <Plus size={20} />
            {!sidebarCollapsed && <span>New Chat</span>}
          </button>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-1/2 bg-white border border-purple-200 rounded-full p-1 shadow-md hover:bg-blue-50 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-blue-50">
          {Array.isArray(sessions) && sessions.map(session => (
            <div
              key={session.session_id}
              className="relative mb-2 group"
            >
              <div className={`flex items-center justify-between rounded-lg p-2 transition-all duration-200 ${
                selectedSession === session.session_id
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-md'
                  : 'bg-white border border-gray-200 group-hover:border-blue-300'
              }`}>
                <button
                  onClick={() => setSelectedSession(session.session_id)}
                  className="flex-1 text-left py-1 px-2 truncate text-blue-900 font-medium text-sm flex items-center gap-2"
                  title={session.title}
                >
                  <BookMarked size={16} className="text-blue-700 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{session.title}</span>}
                </button>

                {!sidebarCollapsed && (
                  <div className="relative">
                    <button
                      className="p-1 text-blue-700 hover:text-blue-900 transition-colors duration-300"
                      onClick={() => toggleMenu(session.session_id)}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === session.session_id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white shadow-xl rounded-lg border border-blue-200 z-10">
                        <button
                          onClick={() => openRenamePrompt(session.session_id, session.title)}
                          className="w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50 transition-all duration-200 border-b border-blue-100 first:rounded-t-lg flex items-center gap-2"
                        >
                          <Edit3 size={14} />
                          Rename
                        </button>
                        
                        <button
                          onClick={() => {
                            handleDelete(session.session_id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-all duration-200 last:rounded-b-lg flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-purple-100 text-center text-sm text-blue-700 bg-white">
          <div className="flex items-center justify-center gap-1">
            <Cpu size={14} />
            {!sidebarCollapsed && <span>AI Assistant</span>}
          </div>
        </div>
      </div>

      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col h-full bg-white w-full">
        {/* Header */}
        {selectedSession ? (
          <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-lg font-semibold truncate flex items-center gap-2">
              <MessageCircle size={20} />
              {sessions.find(s => s.session_id === selectedSession)?.title || 'Active Session'}
            </h2>
          </div>
        ) : (
          <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
            <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
              <GraduationCap size={20} />
              University AI Assistant
            </h2>
          </div>
        )}

        {/* Messages Area - Full Width */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-blue-50 to-purple-50">
          <div className="max-w-6xl mx-auto w-full">
            {isLoading ? (
              <div className="text-center text-blue-800 py-8">
                <div className="inline-flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            ) : !selectedSession ? (
              <div className="h-full flex flex-col items-center justify-center py-8">
                {/* Welcome Section */}
                <div className="text-center mb-8 max-w-3xl">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Brain size={48} className="text-blue-800" />
                    <div className="text-3xl font-bold text-blue-800">Campus AI Assistant</div>
                  </div>
                  <div className="text-purple-600 flex items-center justify-center gap-1 mb-8">
                    <Sparkles size={16} />
                    Your intelligent academic companion
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
                  <button
                    onClick={startNewChat}
                    className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-50 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg h-full"
                    disabled={isStartingNewChat}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-full group-hover:animate-bounce">
                        <BookText size={32} className="text-blue-700" />
                      </div>
                    </div>
                    <div className="text-blue-800 font-semibold mb-2 text-lg">Academic Support</div>
                    <div className="text-blue-600 text-sm">Course materials and study help</div>
                  </button>

                  <button
                    onClick={startNewChat}
                    className="bg-white border border-purple-200 rounded-xl p-6 text-center hover:bg-purple-50 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg h-full"
                    disabled={isStartingNewChat}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-purple-100 rounded-full group-hover:animate-pulse">
                        <Search size={32} className="text-purple-700" />
                      </div>
                    </div>
                    <div className="text-purple-800 font-semibold mb-2 text-lg">Research Helper</div>
                    <div className="text-purple-600 text-sm">Research guidance and resources</div>
                  </button>

                  <button
                    onClick={startNewChat}
                    className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-50 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-lg h-full"
                    disabled={isStartingNewChat}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-full group-hover:animate-spin">
                        <Library size={32} className="text-blue-700" />
                      </div>
                    </div>
                    <div className="text-blue-800 font-semibold mb-2 text-lg">Campus Services</div>
                    <div className="text-blue-600 text-sm">University information and support</div>
                  </button>
                </div>

                {/* Welcome Message */}
                <div className="text-center max-w-3xl">
                  <div className="text-blue-800 text-lg mb-6 px-8 leading-relaxed bg-white rounded-xl p-6 border border-blue-200 shadow-md">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Stars size={20} className="text-blue-600" />
                      <span className="font-semibold">{welcomeMessage}</span>
                    </div>
                  </div>
                  <button
                    onClick={startNewChat}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 mx-auto text-lg"
                    disabled={isStartingNewChat}
                  >
                    <Zap size={20} />
                    {isStartingNewChat ? "Starting Session..." : "Begin Conversation"}
                  </button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-blue-800 py-8 flex items-center justify-center gap-2">
                <Clock size={18} className="animate-spin" />
                <span>Loading your conversation...</span>
              </div>
            ) : (
              <div className="w-full">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-6 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-4 max-w-3xl ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300' 
                            : 'bg-gradient-to-r from-blue-200 to-purple-200 border border-blue-300'
                        }`}>
                          {msg.sender === 'user' ? (
                            <User size={20} className="text-blue-700" />
                          ) : (
                            <Bot size={20} className="text-blue-700" />
                          )}
                        </div>
                        
                        <div
                          className={`px-6 py-4 rounded-xl max-w-2xl ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-900'
                              : 'bg-white border border-blue-100 text-blue-900 shadow-sm'
                          }`}
                        >
                          <div className="text-sm text-blue-600 mb-2 font-medium flex items-center gap-2">
                            {msg.sender === 'user' ? (
                              <>
                                <User size={14} />
                                <span>You</span>
                              </>
                            ) : (
                              <>
                                <Cpu size={14} />
                                <span>Assistant</span>
                              </>
                            )}
                          </div>
                          <div className="text-base">{msg.text}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Full Width */}
        {selectedSession && (
          <div className="p-4 border-t border-purple-100 bg-white">
            <div className="max-w-6xl mx-auto flex gap-4">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-blue-900 placeholder-blue-400 text-base"
                placeholder="Ask about courses, assignments, or university services..."
                disabled={isStartingNewChat}
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl border border-blue-700 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center gap-2 text-base"
                disabled={!newMessage.trim() || isStartingNewChat}
              >
                <Send size={20} />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}