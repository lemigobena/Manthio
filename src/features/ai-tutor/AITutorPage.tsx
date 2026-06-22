import React, { useState, useRef, useEffect } from 'react';
import { useXP } from '../../context/XPContext';
import { BookOpen, 
  Mic, ThumbsUp, ThumbsDown, Copy, Plus, Search, MessageSquare,
  Share2, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, ArrowUp,
  Globe
} from 'lucide-react';
import type { ChatMessage } from '../../types';

interface AITutorPageProps {
  onNavigate?: (page: string) => void;
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

export const AITutorPage: React.FC<AITutorPageProps> = () => {
  const { addXp } = useXP();
  const [aiMode, setAiMode] = useState<'auto' | 'docs' | 'full'>('auto');
  const [chatInput, setChatInput] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_SESSIONS['chat-1'].messages);
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

  const historyGroups = [
    { label: 'Today', items: [{ id: 'chat-1', title: 'Recursion Base Case', date: '14:30' }] },
    { label: 'Yesterday', items: [{ id: 'chat-2', title: 'Difference List vs Tuple', date: 'Jun 21' }] },
    { label: 'Last Week', items: [
      { id: 'chat-3', title: 'Error with venv PowerShell', date: 'Jun 12' },
      { id: 'chat-4', title: 'Simple arithmetic operators', date: 'Jun 08' }
    ]}
  ];

  const handleSelectChat = (id: string) => {
    if (!MOCK_SESSIONS[id]) return;
    setIsSwitching(true);
    setActiveChatId(id);
    setTimeout(() => {
      setChatMessages(MOCK_SESSIONS[id].messages);
      setIsSwitching(false);
    }, 400);
  };

  const activeContext = MOCK_SESSIONS[activeChatId]?.context || MOCK_SESSIONS['chat-1'].context;

  const suggestedPrompts = [
    "Explain decorators with an example",
    "How does recursion work in Python?",
    "Show me a list comprehension for even numbers"
  ];

  const handleSendMessage = (textOverride?: string, forceCloud?: boolean) => {
    const messageText = textOverride || chatInput;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    if (aiMode === 'docs' && messageText.toLowerCase().includes('general') && !forceCloud) {
      setTimeout(() => {
        const fallbackMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'tutor',
          text: 'I can\'t find this in the local course materials. Would you like me to ask the Cloud AI for a general answer?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Course docs'
        };
        setChatMessages(prev => [...prev, fallbackMsg]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    setTimeout(() => {
      const tutorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'tutor',
        text: forceCloud 
          ? 'Connecting to Cloud AI... Here is a general answer based on global knowledge: Recursion is a fundamental computer science concept...' 
          : 'Based on the curriculum, recursion is a key concept where functions call themselves. For this specific query, I recommend checking Module 6.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: (forceCloud || aiMode === 'full') ? 'Cloud AI' : 'Course docs'
      };
      setChatMessages(prev => [...prev, tutorMsg]);
      setIsTyping(false);
      addXp(10, 'Asked AI Tutor');
    }, 1500);
  };

  return (
    <div className="h-[750px] max-h-[85vh] flex flex-col md:flex-row bg-bg border border-line rounded-2xl overflow-hidden relative shadow-sm mb-12">
      
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
        {/* Mobile Header Buttons */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-line bg-panel/30 z-20 shrink-0">
          <button onClick={() => setLeftCollapsed(false)} className="p-2 text-muted hover:text-cyan transition-all">
            <PanelLeft size={20} />
          </button>
          <button onClick={() => setRightCollapsed(false)} className="p-2 text-muted hover:text-cyan transition-all">
            <PanelRight size={20} />
          </button>
        </div>

        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-panel/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-sm text-text truncate">{MOCK_SESSIONS[activeChatId]?.title}</h2>
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
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
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
                        : 'max-w-[85%] md:max-w-[70%] p-4 rounded-2xl'
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
