import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { MessageSquare, Send, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface AITutorPageProps {
  onNavigate: (page: string) => void;
}

export const AITutorPage: React.FC<AITutorPageProps> = ({ onNavigate }) => {
  const { addXp, addToast } = useXP();
  const [aiMode, setAiMode] = useState<'auto' | 'docs' | 'full'>('auto');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 'm1', 
      sender: 'tutor', 
      text: 'Hello Alex! I am your personal AI Tutor. How can I help you today with the Python Bootcamp?', 
      timestamp: '14:30', 
      source: 'Course docs' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const pastChats = [
    { id: 'chat-1', title: 'Difference List vs Tuple', date: 'Yesterday' },
    { id: 'chat-2', title: 'Error with venv PowerShell', date: 'Jun 12' },
    { id: 'chat-3', title: 'Simple arithmetic operators', date: 'Jun 08' }
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      let source: ChatMessage['source'] = 'Course docs';

      if (aiMode === 'full') {
        replyText = 'Here is the explanation from general LLM knowledge: Recursion is a programming method in which a function calls itself. In Python, we must always define a termination condition (Base Case), otherwise a RecursionError occurs.';
        source = 'Cloud AI';
      } else {
        replyText = 'Socratic hint: You are trying to form a sum over a list recursively. What is your Base Case (the simplest case where the function stops immediately)?';
        source = 'Course docs';
      }

      const tutorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source,
        documents: source === 'Course docs' ? [
          { title: 'Module 6 - Functions and Recursion', location: 'Section 4.1', url: '#' }
        ] : undefined
      };
      setChatMessages(prev => [...prev, tutorMsg]);
      addXp(10, 'Asked AI Tutor a question');
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row -m-6 bg-bg overflow-hidden">
      
      {/* Left Column: Chat Sessions History */}
      <div className="w-full md:w-64 bg-panel border-r border-line flex flex-col shrink-0">
        <div className="p-4 border-b border-line">
          <h3 className="font-bold text-xs uppercase text-muted tracking-wider">History</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pastChats.map(chat => (
            <button 
              key={chat.id} 
              className="w-full text-left p-3 rounded-xl text-xs hover:bg-bg/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 truncate">
                <MessageSquare className="w-3.5 h-3.5 text-muted shrink-0" />
                <span className="truncate text-text font-medium">{chat.title}</span>
              </div>
              <span className="text-[10px] text-muted ml-2 shrink-0">{chat.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel: Active Chat Feed */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg/25">
        
        {/* Header Mode Controls */}
        <div className="bg-panel border-b border-line px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 z-10 shrink-0">
          <div>
            <h1 className="text-sm font-bold text-text">AI Tutor Chat</h1>
            <span className="text-[10px] text-muted">Alex Chen • Level 42 Explorer</span>
          </div>

          {/* AI Mode Selector (REQ-TUTOR-060) */}
          <div className="flex bg-bg border border-line p-0.5 rounded-lg text-xs self-start sm:self-center">
            <button 
              onClick={() => setAiMode('auto')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${aiMode === 'auto' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
            >
              Auto
            </button>
            <button 
              onClick={() => {
                setAiMode('docs');
                addToast('info', 'Questions remain on apigenio infrastructure.');
              }}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${aiMode === 'docs' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
            >
              Documents
            </button>
            <button 
              onClick={() => setAiMode('full')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${aiMode === 'full' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
            >
              Full AI
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`space-y-1 max-w-[75%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-cyan text-bg font-semibold rounded-tr-none' : 'bg-panel border border-line rounded-tl-none text-text'}`}>
                {msg.text}
              </div>
              <div className="flex items-center space-x-1.5 text-[9px] text-muted justify-between px-1">
                <span>{msg.timestamp}</span>
                {msg.source && (
                  <span className="bg-panel border border-line px-1 rounded-sm">
                    {msg.source}
                  </span>
                )}
              </div>
              
              {/* Citations if Local AI */}
              {msg.documents && msg.documents.length > 0 && (
                <div className="pl-4 border-l border-cyan text-[10px] text-muted mt-2 space-y-1">
                  <span className="font-semibold block">References:</span>
                  {msg.documents.map((doc, idx) => (
                    <a key={idx} href={doc.url} className="text-cyan hover:underline block">
                      {doc.title} ({doc.location})
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="text-[10px] text-muted flex items-center space-x-1.5 italic px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" />
              <span>AI Tutor is responding...</span>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="bg-panel border-t border-line p-4 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Ask a question or paste a code snippet..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-bg border border-line text-xs rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-cyan"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-cyan hover:bg-cyan2 text-bg p-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="text-center text-[10px] text-muted mt-2">
            AI Tutor can make mistakes. Grounding data primarily comes from the Python Bootcamp.
          </div>
        </div>

      </div>

      {/* Right Column: Context Widgets */}
      <div className="w-full md:w-64 bg-panel border-l border-line p-4 shrink-0 space-y-6 overflow-y-auto hidden lg:block">
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-cyan" />
            <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Active Module</h4>
          </div>
          <div className="bg-bg border border-line p-3 rounded-xl text-xs space-y-1">
            <div className="font-bold text-text">Module 3: Workshop A</div>
            <p className="text-muted">Progress: 60%</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-yellow" />
            <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Weak Points</h4>
          </div>
          <div className="space-y-2">
            {['OOP Concepts', 'Recursion'].map((weak, idx) => (
              <div key={idx} className="bg-bg border border-line p-2.5 rounded-xl text-xs text-text flex items-center justify-between">
                <span>{weak}</span>
                <span className="w-2 h-2 rounded-full bg-red" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-purple" />
            <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Recommended Exercises</h4>
          </div>
          <div className="bg-bg border border-line p-3 rounded-xl text-xs text-text space-y-2">
            <p className="text-muted">Based on your OOP gap:</p>
            <button 
              onClick={() => {
                addToast('info', 'Exercise started');
                onNavigate('content-player');
              }}
              className="w-full bg-cyan text-bg py-1.5 rounded font-bold uppercase text-[10px]"
            >
              Start: Class Quiz
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
