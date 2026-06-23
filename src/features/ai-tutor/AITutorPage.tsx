import React, { useState, useRef, useEffect } from 'react';
import { useXP } from '../../context/XPContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, 
  Mic, ThumbsUp, ThumbsDown, Copy, Plus, Search, MessageSquare,
  Share2, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, ArrowUp,
  Globe
} from 'lucide-react';
import type { ChatMessage } from '../../types';
import { analyticsService } from '../../services/analyticsService';

interface AITutorPageProps {
  onNavigate?: (page: string) => void;
  initialTab?: string;
}


// --- Sub-components ---

const RichMessage: React.FC<{ text: string; sender: 'user' | 'tutor' | 'system' }> = ({ text, sender }) => {
  if (sender === 'system') {
    return <div className="text-center italic text-muted text-[10px] my-4 px-8 border-y border-line/30 py-2 truncate">{text}</div>;
  }

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {text}
    </div>
  );
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

const AutoExpandingTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
}> = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder="Ask a question..."
      rows={1}
      className="flex-1 bg-transparent border-none !border-none !outline-none text-xs py-2.5 text-text focus:outline-none focus:ring-0 focus:shadow-none outline-none resize-none min-h-[40px] max-h-[200px] transition-all"
    />
  );
};

// --- Data Mocking ---

interface ChatSessionData {
  id: string;
  title: string;
  messages: ChatMessage[];
  context: {
    module: string;
    lesson: string;
    progress: number;
    weakPoints: { label: string; color: string }[];
    snippets: { title: string; content: string }[];
  };
}

const MOCK_SESSIONS: Record<string, ChatSessionData> = {
  'chat-1': {
    id: 'chat-1',
    title: 'Recursion Base Case',
    messages: [
      { id: 's1', sender: 'system', text: 'Session started: Module 3 Context Active', timestamp: '14:29' },
      { id: 'm1', sender: 'tutor', text: 'Hello Alex! I see you\'re working on Module 3: Workshop A. I am your personal AI Tutor. How can I help you today?', timestamp: '14:30', source: 'Course docs' }
    ],
    context: {
      module: 'Module 3: Workshop A',
      lesson: 'Lesson 4.2: Recursion',
      progress: 60,
      weakPoints: [
        { label: 'OOP Concepts', color: 'bg-red' },
        { label: 'Recursion', color: 'bg-orange' }
      ],
      snippets: [
        { title: 'Binary Search Helper', content: '"The base case is when low > high..."' }
      ]
    }
  },
  'chat-2': {
    id: 'chat-2',
    title: 'Difference List vs Tuple',
    messages: [
      { id: 's2', sender: 'system', text: 'History Loaded: Yesterday', timestamp: 'Jun 21 16:00' },
      { id: 'u2', sender: 'user', text: 'When should I use a tuple instead of a list?', timestamp: '16:05' },
      { id: 'm2', sender: 'tutor', text: 'Tuples should be used for immutable data—items that shouldn\'t change during execution. Lists are for collections where you need to add, remove, or modify items.', timestamp: '16:06', source: 'Course docs' }
    ],
    context: {
      module: 'Module 2: Data Structures',
      lesson: 'Lesson 2.1: Advanced Collections',
      progress: 100,
      weakPoints: [
        { label: 'Tuple Packing', color: 'bg-yellow' }
      ],
      snippets: [
        { title: 'Zip and Unzip', content: 'pair = (x, y); x, y = pair' }
      ]
    }
  },
  'chat-3': {
    id: 'chat-3',
    title: 'Error with venv PowerShell',
    messages: [
      { id: 's3', sender: 'system', text: 'Session: Technical Troubleshooting', timestamp: 'Jun 12 09:10' },
      { id: 'u3', sender: 'user', text: 'I am getting a scripts execution policy error in VS Code.', timestamp: '09:12' },
      { id: 'm3', sender: 'tutor', text: 'This is common on Windows. Run the policy bypass command in your terminal.', timestamp: '09:13', source: 'Cloud AI' }
    ],
    context: {
      module: 'Module 1: Setup',
      lesson: 'Lesson 1.4: Virtual Environments',
      progress: 85,
      weakPoints: [],
      snippets: [
        { title: 'PS Policy Fix', content: 'Set-ExecutionPolicy RemoteSigned -Scope Process' }
      ]
    }
  },
  'chat-4': {
    id: 'chat-4',
    title: 'Simple arithmetic operators',
    messages: [
      { id: 's4', sender: 'system', text: 'Diagnostic Mode: Source Engine Testing', timestamp: 'Jun 08 10:00' },
      { id: 'u4a', sender: 'user', text: 'What is the speed of light in a vacuum?', timestamp: '10:01' },
      { 
        id: 'm4a', 
        sender: 'tutor', 
        text: 'I can\'t find specific data about physical constants in the Python Bootcamp materials. Would you like me to ask the Cloud AI?', 
        timestamp: '10:02', 
        source: 'Course docs'
      }
    ],
    context: {
      module: 'Module 1: Intro',
      lesson: 'Lesson 1.1: Math Operators',
      progress: 20,
      weakPoints: [],
      snippets: []
    }
  }
};

export const AITutorPage: React.FC<AITutorPageProps> = ({ initialTab }) => {
  const { addXp } = useXP();
  const { user, onboardingAnswers } = useAuth();

  // Conditionally initialize sessions state with initialTab remediation if present
  const [sessions, setSessions] = useState<Record<string, ChatSessionData>>(() => {
    const initialSessions = { ...MOCK_SESSIONS };
    if (initialTab && initialTab.startsWith('remediation-')) {
      const weaknessId = initialTab.replace('remediation-', '');
      const analyticsData = analyticsService.getAnalyticsData();
      const weakness = analyticsData.weaknesses.find(w => w.id === weaknessId);
      if (weakness) {
        const sessionId = `remediation-${weaknessId}`;
        initialSessions[sessionId] = {
          id: sessionId,
          title: `Remediation: ${weakness.topic}`,
          messages: [
            { 
              id: crypto.randomUUID(), 
              sender: 'system', 
              text: `Socratic Remediation Mode Active: Focused on ${weakness.topic}`, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
            { 
              id: crypto.randomUUID(), 
              sender: 'system', 
              text: `Learner wrong-answer pattern: "${weakness.wrongPatterns}"`, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
            { 
              id: crypto.randomUUID(), 
              sender: 'tutor', 
              text: `Hello ${user?.name ? user.name.split(' ')[0] : 'learner'}! I've loaded a Socratic remediation session for "${weakness.topic}". I noticed you recently had some incorrect answers matching patterns: "${weakness.wrongPatterns}". Let's work together to close this gap. I will ask you a few questions. To start, ${weakness.remediationPlan[0]}`, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'Course docs'
            }
          ],
          context: {
            module: 'Remediation Session',
            lesson: `${weakness.topic} Review`,
            progress: 0,
            weakPoints: [{ label: weakness.topic, color: weakness.severity === 'significant' ? 'bg-red' : 'bg-yellow' }],
            snippets: []
          }
        };
      }
    }
    return initialSessions;
  });

  const [aiMode, setAiMode] = useState<'auto' | 'docs' | 'full'>('auto');
  const [chatInput, setChatInput] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  
  // Conditionally initialize active chat ID
  const [activeChatId, setActiveChatId] = useState(() => {
    if (initialTab && initialTab.startsWith('remediation-')) {
      const weaknessId = initialTab.replace('remediation-', '');
      return `remediation-${weaknessId}`;
    }
    return 'chat-1';
  });

  // Conditionally initialize chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (initialTab && initialTab.startsWith('remediation-')) {
      const weaknessId = initialTab.replace('remediation-', '');
      const analyticsData = analyticsService.getAnalyticsData();
      const weakness = analyticsData.weaknesses.find(w => w.id === weaknessId);
      if (weakness) {
        return [
          { 
            id: crypto.randomUUID(), 
            sender: 'system', 
            text: `Socratic Remediation Mode Active: Focused on ${weakness.topic}`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          },
          { 
            id: crypto.randomUUID(), 
            sender: 'system', 
            text: `Learner wrong-answer pattern: "${weakness.wrongPatterns}"`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          },
          { 
            id: crypto.randomUUID(), 
            sender: 'tutor', 
            text: `Hello ${user?.name ? user.name.split(' ')[0] : 'learner'}! I've loaded a Socratic remediation session for "${weakness.topic}". I noticed you recently had some incorrect answers matching patterns: "${weakness.wrongPatterns}". Let's work together to close this gap. I will ask you a few questions. To start, ${weakness.remediationPlan[0]}`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'Course docs'
          }
        ];
      }
    }

    const firstName = user?.name ? user.name.split(' ')[0] : 'learner';
    let welcomeText = `Hello ${firstName}! I am your personal AI Tutor. How can I help you today with your learning path?`;
    if (onboardingAnswers) {
      welcomeText = `Hello ${firstName}! I am your personal AI Tutor. I see you are here for ${onboardingAnswers.reason} with a goal of investing ${onboardingAnswers.timePerWeek} weekly. Let's work together to achieve your goals! How can I help you today?`;
    }
    
    // Copy the messages from chat-1 and update the tutor message
    const messages = [...MOCK_SESSIONS['chat-1'].messages];
    const tutorMsgIndex = messages.findIndex(m => m.sender === 'tutor');
    if (tutorMsgIndex !== -1) {
      messages[tutorMsgIndex] = { ...messages[tutorMsgIndex], text: welcomeText };
    }
    return messages;
  });
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Collapse States
  const [leftCollapsed, setLeftCollapsed] = useState(() => window.innerWidth < 768); 
  const [rightCollapsed, setRightCollapsed] = useState(() => window.innerWidth < 768); 
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const remediationSessions = Object.values(sessions).filter(s => s.id.startsWith('remediation-'));

  const historyGroups = [
    { 
      label: 'Today', 
      items: [
        ...remediationSessions.map(s => ({ id: s.id, title: s.title, date: 'Now' })),
        { id: 'chat-1', title: 'Recursion Base Case', date: '14:30' }
      ] 
    },
    { label: 'Yesterday', items: [{ id: 'chat-2', title: 'Difference List vs Tuple', date: 'Jun 21' }] },
    { label: 'Last Week', items: [
      { id: 'chat-3', title: 'Error with venv PowerShell', date: 'Jun 12' },
      { id: 'chat-4', title: 'Simple arithmetic operators', date: 'Jun 08' }
    ]}
  ];

  const handleSelectChat = (id: string) => {
    if (!sessions[id]) return;
    setIsSwitching(true);
    setActiveChatId(id);
    setTimeout(() => {
      setChatMessages(sessions[id].messages);
      setIsSwitching(false);
    }, 400);
  };

  const activeContext = sessions[activeChatId]?.context || sessions['chat-1'].context;

  const activeSession = sessions[activeChatId] || sessions['chat-1'];
  
  const suggestedPrompts = activeSession.id.startsWith('remediation-')
    ? (analyticsService.getAnalyticsData().weaknesses.find(w => `remediation-${w.id}` === activeSession.id)?.remediationPlan || [])
    : [
        "Explain decorators with an example",
        "How does recursion work in Python?",
        "Show me a list comprehension for even numbers"
      ];

  const addMessageToSession = (sessionId: string, msg: ChatMessage) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;
      return {
        ...prev,
        [sessionId]: {
          ...session,
          messages: [...session.messages, msg]
        }
      };
    });
  };

  const handleSendMessage = (textOverride?: string, forceCloud?: boolean) => {
    const messageText = textOverride || chatInput;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    addMessageToSession(activeChatId, userMsg);
    setChatInput('');
    setIsTyping(true);

    if (aiMode === 'docs' && messageText.toLowerCase().includes('general') && !forceCloud) {
      setTimeout(() => {
        const fallbackMsg: ChatMessage = {
          id: generateId(),
          sender: 'tutor',
          text: 'I can\'t find this in the local course materials. Would you like me to ask the Cloud AI for a general answer?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Course docs'
        };
        setChatMessages(prev => [...prev, fallbackMsg]);
        addMessageToSession(activeChatId, fallbackMsg);
        setIsTyping(false);
      }, 1000);
      return;
    }

    setTimeout(() => {
      let responseText: string;
      if (activeSession.id.startsWith('remediation-')) {
        // Dynamic Socratic remediation response
        const weaknessId = activeSession.id.replace('remediation-', '');
        const weakness = analyticsService.getAnalyticsData().weaknesses.find(w => w.id === weaknessId);
        const qIndex = weakness?.remediationPlan.indexOf(messageText) ?? -1;
        if (qIndex !== -1 && weakness && qIndex < weakness.remediationPlan.length - 1) {
          responseText = `Excellent answer! That shows you are thinking about the principles correctly. Next, let's explore: "${weakness.remediationPlan[qIndex + 1]}"`;
        } else {
          responseText = `That's a solid point! Socratic analysis complete. Remember that understanding this is key to solving tasks. You can test your skills with a review quiz on the Analytics page once it is available! Let me know if you want to write a code snippet together.`;
          // Trigger increment score or progress
          if (weakness) {
            analyticsService.submitReviewQuizResult(weakness.id, true);
          }
        }
      } else {
        responseText = forceCloud 
          ? 'Connecting to Cloud AI... Here is a general answer based on global knowledge: Recursion is a fundamental computer science concept...' 
          : 'Based on the curriculum, recursion is a key concept where functions call themselves. For this specific query, I recommend checking Module 6.';
      }

      const tutorMsg: ChatMessage = {
        id: generateId(),
        sender: 'tutor',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: (forceCloud || aiMode === 'full') ? 'Cloud AI' : 'Course docs'
      };
      setChatMessages(prev => [...prev, tutorMsg]);
      addMessageToSession(activeChatId, tutorMsg);
      setIsTyping(false);
      addXp(10, 'Asked AI Tutor');
    }, 1500);
  };

  return (
    <div className="relative flex flex-col md:flex-row h-[calc(100dvh-64px)] -mx-3 md:-mx-[44px] -my-6 border-y border-line overflow-hidden bg-bg">
      
      {/* Left Column: Chat Sessions History */}
      <div className={`transition-all duration-300 bg-panel border-r border-line flex flex-col shrink-0 z-40 absolute md:relative top-0 bottom-0 left-0 h-full shadow-2xl md:shadow-none overflow-hidden ${
        leftCollapsed ? 'w-0 -translate-x-full md:translate-x-0 md:w-16' : 'w-[180px] md:w-[180px] lg:w-[210px] xl:w-[240px] translate-x-0'
      }`}>
        <div className={`p-4 border-b border-line flex items-center justify-between transition-opacity duration-300 ${leftCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <h3 className="font-bold text-[10px] uppercase text-muted tracking-wider truncate">History</h3>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-line rounded transition-colors text-muted hover:text-cyan">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setLeftCollapsed(true)}
              className="p-1 rounded-md text-muted hover:text-cyan transition-colors"
            >
              <PanelLeftClose size={18} className="shrink-0" />
            </button>
          </div>
        </div>

        {leftCollapsed && (
          <button 
            onClick={() => setLeftCollapsed(false)}
            className="absolute left-0 top-4 w-full flex justify-center p-2 text-muted hover:text-cyan transition-colors z-20 hidden md:flex"
          >
            <PanelLeft size={18} className="shrink-0" />
          </button>
        )}

        <div className={`p-4 transition-opacity duration-300 ${leftCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input 
              type="text" 
              placeholder="Search..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-bg border border-line rounded-lg py-1.5 pl-8 pr-3 text-[11px] focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {historyGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!leftCollapsed && <div className="px-3 py-1 text-[9px] font-bold text-muted/60 uppercase tracking-widest truncate">{group.label}</div>}
              {group.items.map(chat => (
                <button 
                  key={chat.id} 
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full text-left py-3 text-xs transition-all duration-300 relative group flex items-center justify-center ${
                    leftCollapsed ? 'px-0' : 'px-4'
                  } ${
                    chat.id === activeChatId 
                      ? 'text-cyan bg-gradient-to-r from-cyan/10 to-transparent' 
                      : 'text-muted hover:text-cyan hover:bg-cyan/5'
                  }`}
                >
                  {chat.id === activeChatId && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-cyan shadow-[0_0_10px_var(--cyan)]/40 rounded-r-full" />
                  )}
                  <div className={`flex items-center justify-center relative z-10 ${leftCollapsed ? 'w-auto' : 'w-full space-x-3 overflow-hidden'}`}>
                    <MessageSquare 
                      size={16} 
                      className={`shrink-0 transition-all ${chat.id === activeChatId ? 'text-cyan shadow-[0_0_8px_var(--cyan)]/20' : 'text-muted group-hover:text-cyan'}`} 
                      fill={chat.id === activeChatId ? 'currentColor' : 'none'}
                    />
                    {!leftCollapsed && <span className="truncate font-semibold flex-1 text-left">{chat.title}</span>}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-line">
          <button className={`w-full bg-line/50 hover:bg-line text-text text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center space-x-2 ${leftCollapsed ? 'p-2' : ''}`}>
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            {!leftCollapsed && <span className="truncate">Export</span>}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile (Click outside to close) */}
      {(!leftCollapsed || !rightCollapsed) && (
        <div 
          onClick={() => {
            setLeftCollapsed(true);
            setRightCollapsed(true);
          }}
          className="absolute inset-0 bg-bg/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300" 
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-bg border-r border-line overflow-hidden relative">
        {/* Combined Mobile Header: Toggles, Title & Mode */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-line bg-panel/50 backdrop-blur-md z-20 shrink-0 gap-2">
          <div className="flex items-center space-x-1 shrink-0">
            <button onClick={() => setLeftCollapsed(false)} className="p-1.5 text-muted hover:text-cyan transition-all">
              <PanelLeft size={18} />
            </button>
            <div className="w-px h-4 bg-line mx-1" />
            <h2 className="font-bold text-[11px] text-text truncate max-w-[80px]">{sessions[activeChatId]?.title}</h2>
          </div>

          <div className="flex bg-bg/50 p-0.5 rounded-lg border border-line shrink-0">
            {['auto', 'docs', 'full'].map(mode => (
              <button 
                key={mode}
                onClick={() => setAiMode(mode as 'auto' | 'docs' | 'full')}
                className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all capitalize ${aiMode === mode ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                {mode === 'docs' ? 'Docs' : mode === 'full' ? 'Full' : 'Auto'}
              </button>
            ))}
          </div>

          <button onClick={() => setRightCollapsed(false)} className="p-1.5 text-muted hover:text-cyan transition-all shrink-0">
            <PanelRight size={18} />
          </button>
        </div>

        {/* Desktop Chat Header */}
        <div className="hidden md:flex px-6 py-4 border-b border-line items-center justify-between bg-panel/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-sm text-text truncate">{sessions[activeChatId]?.title}</h2>
            <div className="flex items-center space-x-2 text-[10px] text-muted"><div className="w-1.5 h-1.5 rounded-full bg-green" /><span className="truncate">Ready</span></div>
          </div>
          
          <div className="flex items-center">
            <div className="flex bg-bg/50 p-1 rounded-xl border border-line">
              {['auto', 'docs', 'full'].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setAiMode(mode as 'auto' | 'docs' | 'full')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all capitalize ${aiMode === mode ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {rightCollapsed && (
              <button 
                onClick={() => setRightCollapsed(false)} 
                className="p-2 text-muted hover:text-cyan transition-all ml-4 hidden md:block"
              >
                <PanelRight size={18} className="shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {(isLoading || isSwitching) ? (
            <div className="flex-1 p-6 space-y-6">
              <div className="w-1/2 h-20 bg-line/20 rounded-xl animate-pulse" />
              <div className="w-1/3 h-12 bg-cyan/5 rounded-xl ml-auto animate-pulse" />
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-8">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex animate-cel-reveal ${
                      msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center w-full' : 'justify-start'
                    }`}
                  >
                    <div className={`${
                      msg.sender === 'system' 
                        ? 'w-full px-4' 
                        : 'max-w-[95%] md:max-w-[70%] p-4 rounded-2xl'
                    } ${
                      msg.sender === 'user' 
                        ? 'bg-cyan text-bg rounded-tr-none' 
                        : msg.sender === 'system' 
                          ? 'bg-transparent' 
                          : 'bg-panel border border-line rounded-tl-none text-text'
                    }`}>
                      <RichMessage text={msg.text} sender={msg.sender} />
                      {msg.sender === 'tutor' && (
                        <div className="mt-3 pt-3 border-t border-line/30 flex items-center justify-between text-[9px]">
                          <div className={`flex items-center space-x-1.5 font-bold uppercase tracking-wider ${
                            msg.source === 'Cloud AI' ? 'text-cyan' : 'text-purple'
                          }`}>
                            {msg.source === 'Cloud AI' ? <Globe size={11} /> : <BookOpen size={11} />}
                            <span className="truncate">{msg.source}</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 text-muted">
                            <button className="hover:text-cyan transition-colors"><ThumbsUp size={12} /></button>
                            <button className="hover:text-red transition-colors"><ThumbsDown size={12} /></button>
                            <button onClick={() => navigator.clipboard.writeText(msg.text)} className="hover:text-cyan transition-colors"><Copy size={12} /></button>
                          </div>
                        </div>
                      )}
                      {msg.sender === 'tutor' && msg.source === 'Course docs' && msg.text.toLowerCase().includes('cloud ai') && (
                        <button 
                          onClick={() => { 
                            handleSendMessage(chatMessages.filter(m => m.sender === 'user').slice(-1)[0]?.text || 'Use Cloud AI', true); 
                          }}
                          className="mt-3 bg-transparent border border-cyan text-cyan text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-cyan hover:text-bg transition-all flex items-center justify-center space-x-2"
                        >
                          <BookOpen size={14} />
                          <span>Ask Cloud AI</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start"><div className="bg-panel border border-line p-4 rounded-2xl rounded-tl-none flex space-x-1"><div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" /></div></div>
                )}
              </div>

              <div className="p-4 border-t border-line bg-transparent">
                <div className="max-w-4xl mx-auto space-y-4">
                  {chatMessages.filter(m => m.sender === 'user').length === 0 && (
                    <div className="flex flex-wrap gap-2 px-2">
                      {suggestedPrompts.map((p, i) => <button key={i} onClick={() => handleSendMessage(p)} className="text-[10px] bg-panel border border-line px-3 py-1.5 rounded-full text-muted hover:text-cyan truncate max-w-[150px] transition-all">{p}</button>)}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 bg-panel rounded-full px-4 py-1.5 transition-all">
                    <button className="p-2 text-muted hover:text-text transition-colors grow-0 shrink-0">
                      <Plus size={20} />
                    </button>
                    
                    <AutoExpandingTextarea value={chatInput} onChange={setChatInput} onSend={handleSendMessage} disabled={isTyping} />
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <button className="p-2 text-muted hover:text-text transition-colors">
                        <Mic size={20} />
                      </button>
                      
                      <button 
                        onClick={() => handleSendMessage()} 
                        disabled={!chatInput.trim()} 
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg ${
                          chatInput.trim() 
                            ? 'bg-cyan text-bg scale-100 shadow-cyan/20' 
                            : 'bg-line/20 text-muted/40 scale-95 opacity-50'
                        }`}
                      >
                        <ArrowUp size={20} className="shrink-0" />
                      </button>
                    </div>
                  </div>
                  <div className="text-center mt-1.5">
                    <p className="text-[10px] text-muted/100">Manthio AI can make mistakes. Please verify important information.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Context Widgets */}
      <div className={`transition-all duration-300 bg-panel border-l border-line shrink-0 flex flex-col absolute md:relative top-0 bottom-0 right-0 h-full z-40 shadow-2xl md:shadow-none overflow-hidden ${
        rightCollapsed ? 'w-0' : 'w-[180px] md:w-[180px] lg:w-[210px] xl:w-[240px]'
      }`}>
        <div className={`h-full flex flex-col transition-opacity duration-300 ${rightCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="p-4 border-b border-line flex items-center justify-between relative shrink-0">
            <button 
              onClick={() => setRightCollapsed(true)}
              className="p-1 rounded-md text-muted hover:text-cyan transition-colors shrink-0 z-10"
            >
              <PanelRightClose size={18} className="shrink-0" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h4 className="font-bold text-[10px] uppercase text-muted tracking-wider truncate">Context</h4>
            </div>
            <BookOpen size={16} className="text-cyan shrink-0 z-10" />
          </div>

          <div className="p-4 space-y-6 overflow-y-auto flex-1">
            <div className="bg-bg border border-line p-3 rounded-xl space-y-3 shrink-0">
              <div className="font-bold text-xs truncate">{activeContext.module}</div>
              <div className="w-full bg-line h-1 rounded-full"><div className="bg-cyan h-full" style={{ width: `${activeContext.progress}%` }} /></div>
              <p className="text-[10px] text-muted truncate">{activeContext.lesson}</p>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest truncate">Weak Points</div>
              <div className="space-y-1">
                {activeContext.weakPoints.map((wp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-bg border border-line rounded-lg text-[10px]">
                    <span className="truncate flex-1 pr-2">{wp.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${wp.color}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest truncate">Snippets</div>
              <div className="space-y-1">
                {activeContext.snippets.map((snip, i) => (
                  <div key={i} className="p-2 bg-bg border border-line rounded-lg space-y-1 overflow-hidden">
                    <div className="font-bold text-[10px] truncate">{snip.title}</div>
                    <div className="text-[9px] text-muted truncate italic">{snip.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
