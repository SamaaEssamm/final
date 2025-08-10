'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    const email = localStorage.getItem('student_email');
    if (email) setUserEmail(email);
  }, []);

  // Fetch chat sessions when userEmail is set
  useEffect(() => {
    if (!userEmail) return;

    const fetchSessions = async () => {
      const res = await fetch(`http://localhost:5000/api/chat/sessions?email=${userEmail}`);
      const data = await res.json();
      setSessions(data);
      const openSession = data.find((s: ChatSession) => s.status === 'open');
      if (openSession) {
        setSelectedSession(openSession.session_id);
      }
    };

    fetchSessions();
  }, [userEmail]);

  // Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    fetch(`http://localhost:5000/api/chat/messages?session_id=${selectedSession}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [selectedSession]);

  // Create new session
  const startNewChat = async () => {
    const res = await fetch('http://localhost:5000/api/chat/start_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, message: 'New chat started' }),
    });

    const newSession = await res.json();
    setSelectedSession(newSession.session_id);
    setMessages([{ sender: 'user', text: 'New chat started' }]);

    const updated = await fetch(`http://localhost:5000/api/chat/sessions?email=${userEmail}`).then(res => res.json());
    setSessions(updated);
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: newMessage,
    };
    setMessages(prev => [...prev, userMsg]);

    setNewMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/chat/ask', {
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

        // Refresh session titles
        const updated = await fetch(`http://localhost:5000/api/chat/sessions?email=${userEmail}`).then(res => res.json());
        setSessions(updated);
      } else {
        console.error('Bot error:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch bot reply:', err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
  {/* Sidebar */}
  <div className="w-1/4 min-w-[250px] bg-gray-100 p-4 border-r border-gray-300 shadow-inner overflow-y-auto">
    <button
      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg mb-4 shadow hover:bg-blue-600 transition"
      onClick={startNewChat}
    >
      + New Chat
    </button>

    {Array.isArray(sessions) && sessions.map(session => (
      <button
        key={session.session_id}
        onClick={() => setSelectedSession(session.session_id)}
        className={`block w-full text-left py-2 px-3 rounded-lg mb-2 truncate transition ${
          selectedSession === session.session_id
            ? 'bg-blue-200 font-semibold shadow'
            : 'bg-white hover:bg-gray-200'
        }`}
        title={session.title}
      >
        {session.title}
      </button>
    ))}
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
            msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {msg.text}
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

    {/* Input */}
    <div className="p-4 border-t bg-white flex gap-2 shadow-inner">
      <input
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        placeholder="Type your message..."
      />
      <button
        onClick={sendMessage}
        className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition"
      >
        Send
      </button>
    </div>
  </div>
</div>

  );
}
