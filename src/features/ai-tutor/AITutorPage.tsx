import React, { useState, useRef, useEffect } from 'react';
import { useXP } from '../../context/XPContext';
import { 
  MessageSquare, Send, BookOpen, AlertCircle, HelpCircle, 
  Mic, Paperclip, ThumbsUp, ThumbsDown, Copy, Plus, Search, 
  ChevronRight, Bookmark, Maximize2, BrainCircuit,
  Share2, Save
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import type { ChatMessage } from '../../types';

interface AITutorPageProps {
  onNavigate: (page: string) => void;
}

// --- Sub-components ---

const RichMessage: React.FC<{ text: string; sender: 'user' | 'tutor' | 'system' }> = ({ text, sender }) => {
  if (sender === 'system') {
    return <div className="text-center italic text-muted text-[10px] my-4 px-8 border-y border-line/30 py-2">{text}</div>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          
          if (!inline && match) {
            return (
              <div className="relative group my-3">
                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(codeString);
                    }}
                    className="p-1.5 bg-bg/80 border border-line rounded hover:bg-bg transition-colors text-muted hover:text-cyan"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl !bg-bg !border !border-line !p-4 !m-0"
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }
          return (
            <code className="bg-bg/50 px-1.5 py-0.5 rounded text-cyan border border-line/50 font-mono text-[0.9em]" {...props}>
              {children}
            </code>
          );
        },
        // Handle math notation
        p: ({ children }) => {
          // Simple heuristic for KaTeX search
          if (typeof children === 'string') {
            if (children.includes('$$')) {
              const parts = children.split('$$');
              return (
                <p>
                  {parts.map((part, i) => i % 2 === 0 ? part : <BlockMath key={i} math={part} />)}
                </p>
              );
            }
            if (children.includes('$')) {
              const parts = children.split('$');
              return (
                <p>
                  {parts.map((part, i) => i % 2 === 0 ? part : <InlineMath key={i} math={part} />)}
                </p>
              );
            }
          }
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        a: ({ href, children }) => (
          <a href={href} className="text-cyan underline hover:text-cyan2 transition-colors">
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mb-1 mt-3 first:mt-0">{children}</h2>,
      }}
    >
      {text}
    </ReactMarkdown>
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
      placeholder="Ask a question or paste a code snippet..."
      rows={1}
      className="flex-1 bg-bg border border-line text-xs rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-cyan resize-none min-h-[42px] max-h-[200px] transition-[border-color]"
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
      { id: 'm1', sender: 'tutor', text: 'Hello Alex! I see you\'re working on **Module 3: Workshop A**. I am your personal AI Tutor. How can I help you today with the Python Bootcamp?', timestamp: '14:30', source: 'Course docs' }
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
      { id: 'm2', sender: 'tutor', text: 'Tuples should be used for **immutable** data—items that shouldn\'t change during execution. Lists are for collections where you need to add, remove, or modify items.\n\nUse tuples for coordinates (x, y) or fixed config values.', timestamp: '16:06', source: 'Course docs' }
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
      { id: 'm3', sender: 'tutor', text: 'This is common on Windows. Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` in your terminal to allow the virtual environment to activate.', timestamp: '09:13', source: 'Cloud AI' }
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
        text: 'I can\'t find specific data about physical constants in the **Python Bootcamp** materials. Would you like me to ask the **Cloud AI** (General LLM)?', 
        timestamp: '10:02', 
        source: 'Course docs'
      },
      { id: 'u4b', sender: 'user', text: 'How do I use bitwise operators?', timestamp: '10:15' },
      { 
        id: 'm4b', 
        sender: 'tutor', 
        text: 'Bitwise operators in Python (`&`, `|`, `^`, etc.) let you manipulate data at the bit level. \n\n*Note: This information was not found in course docs; automatically switched to general AI.*', 
        timestamp: '10:16', 
        source: 'Cloud AI'
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

export const AITutorPage: React.FC<AITutorPageProps> = ({ onNavigate }) => {
  const { addXp, addToast } = useXP();
  const [aiMode, setAiMode] = useState<'auto' | 'docs' | 'full'>('auto');
  const [chatInput, setChatInput] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_SESSIONS['chat-1'].messages);
  const [isTyping, setIsTyping] = useState(false);
  const [isReasoning, setIsReasoning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, isReasoning]);

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 850);
  };

  const historyGroups = [
    {
      label: 'Today',
      items: [
        { id: 'chat-1', title: 'Recursion Base Case', date: '14:30' }
      ]
    },
    {
      label: 'Yesterday',
      items: [
        { id: 'chat-2', title: 'Difference List vs Tuple', date: 'Jun 21' },
      ]
    },
    {
      label: 'Last Week',
      items: [
        { id: 'chat-3', title: 'Error with venv PowerShell', date: 'Jun 12' },
        { id: 'chat-4', title: 'Simple arithmetic operators', date: 'Jun 08' }
      ]
    }
  ];

  const [isSwitching, setIsSwitching] = useState(false);

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

  const handleSendMessage = (textOverride?: string) => {
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
    setIsReasoning(true);

    setTimeout(() => {
      setIsReasoning(false);
      
      // Simulate gradual response start after reasoning
      setTimeout(() => {
        setIsTyping(false);
        let replyText: string;
        let source: ChatMessage['source'];
        let documents: ChatMessage['documents'];

        // REQ-TUTOR-070: Fallback logic for docs-only mode
        if (aiMode === 'docs' && messageText.toLowerCase().includes('general')) {
          const fallbackMsg: ChatMessage = {
            id: crypto.randomUUID(),
            sender: 'tutor',
            text: 'I can\'t find this in the course materials. Would you like me to ask the **Cloud AI**?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'Course docs'
          };
          setChatMessages(prev => [...prev, fallbackMsg]);
          setIsTyping(false);
          return;
        }

        if (aiMode === 'full' || (aiMode === 'auto' && messageText.toLowerCase().includes('general'))) {
          replyText = 'Here is an explanation from **general LLM knowledge**:\n\nRecursion is a programming method in which a function calls itself. \n\n```python\ndef countdown(n):\n    if n <= 0:\n        return\n    print(n)\n    countdown(n-1)\n```\n\nIn Python, we must always define a termination condition (**Base Case**), otherwise a `RecursionError` occurs.';
          source = 'Cloud AI';
        } else {
          replyText = '### Socratic hint\n\nYou are trying to form a sum over a list recursively. \n\nWhat is your **Base Case** (the simplest case where the function stops immediately)? \n\nThink about what happens when the list is empty: $\\sum_{i \\in \\emptyset} i = ?$.';
          source = 'Course docs';
          documents = [{ title: 'Module 6 - Functions and Recursion', location: 'Section 4.1', url: '#' }];
        }

        const tutorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'tutor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source,
          documents
        };
        setChatMessages(prev => [...prev, tutorMsg]);
        addXp(10, 'Asked AI Tutor a question');
      }, 800);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row -m-6 bg-bg overflow-hidden">
      

      {/* Left Column: Chat Sessions History */}
      <div className="w-full md:w-64 bg-panel border-r border-line flex flex-col shrink-0">
        <div className="p-4 border-b border-line space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[10px] uppercase text-muted tracking-wider">History</h3>
            <button className="p-1 hover:bg-line rounded transition-colors text-muted hover:text-cyan">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-bg border border-line rounded-lg py-1.5 pl-8 pr-3 text-[11px] focus:outline-none focus:border-cyan/50"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-2.5 py-1">
                <div className="w-4 h-4 bg-line rounded-full animate-pulse shrink-0" />
                <div className="h-3 bg-line rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {historyGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 py-1 text-[9px] font-bold text-muted/60 uppercase tracking-widest">{group.label}</div>
                {group.items.map(chat => (
                  <button 
                    key={chat.id} 
                    onClick={() => handleSelectChat(chat.id)}
                    className={`w-full text-left px-4 py-3 text-xs transition-all duration-300 relative group flex items-center justify-between ${
                      chat.id === activeChatId 
                        ? 'text-cyan bg-gradient-to-r from-cyan/10 to-transparent' 
                        : 'text-muted hover:text-cyan hover:bg-cyan/5'
                    }`}
                  >
                    {chat.id === activeChatId && (
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-cyan shadow-[0_0_10px_var(--cyan)]/40 rounded-r-full" />
                    )}
                    <div className="flex items-center space-x-3 truncate relative z-10">
                      <MessageSquare 
                        size={16}
                        className={`shrink-0 transition-all ${chat.id === activeChatId ? 'text-cyan shadow-[0_0_8px_var(--cyan)]/20' : 'text-muted group-hover:text-cyan'}`} 
                        fill={chat.id === activeChatId ? 'currentColor' : 'none'}
                        strokeWidth={chat.id === activeChatId ? 1.5 : 2}
                      />
                      <span className={`truncate font-semibold tracking-wide ${chat.id === activeChatId ? 'text-cyan' : 'text-muted group-hover:text-cyan'}`}>
                        {chat.title}
                      </span>
                    </div>
                    <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0 font-bold">{chat.date}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-line">
          <button className="w-full bg-line/50 hover:bg-line text-text text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center space-x-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>
      </div>

      {/* Center Panel: Active Chat Feed */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg/25">
        
        {/* Header Mode Controls */}
        <div className="bg-panel border-b border-line px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 z-10 shrink-0">
          <div>
            <h1 className="text-sm font-bold text-text">AI Tutor Chat</h1>
            <span className="text-[10px] text-muted block mt-0.5">Alex Chen • Level 42 Explorer</span>
          </div>

          {/* AI Mode Selector (REQ-TUTOR-060) */}
          <div className="flex bg-bg border border-line p-0.5 rounded-lg text-xs self-start sm:self-center">
            <button 
              disabled={isLoading || isError}
              onClick={() => setAiMode('auto')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${aiMode === 'auto' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'} ${(isLoading || isError) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Auto
            </button>
            <button 
              disabled={isLoading || isError}
              onClick={() => {
                setAiMode('docs');
                addToast('info', 'Questions remain on apigenio infrastructure.');
              }}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${aiMode === 'docs' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'} ${(isLoading || isError) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Documents
            </button>
            <button 
              disabled={isLoading || isError}
              onClick={() => setAiMode('full')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${aiMode === 'full' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'} ${(isLoading || isError) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Full AI
            </button>
          </div>
        </div>
        {/* REQ-LOAD-004: Failed load with retry action */}
        {isError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-text text-base">Failed to connect to AI Tutor</h3>
              <p className="text-muted text-xs max-w-xs mx-auto">We encountered an issue establishing a secure connection to the AI Tutor service.</p>
            </div>
            <button 
              onClick={handleRetry}
              className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (isLoading || isSwitching) ? (
          /* REQ-LOAD-002: skeleton loader */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="flex items-start space-x-3 max-w-[70%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-line animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-line rounded w-full animate-pulse" />
                  <div className="h-3.5 bg-line rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-panel border-t border-line p-4 min-h-[80px]" />
          </div>
        ) : (
          <>
            {/* Message List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'} group animate-cel-reveal`}
                >
                  <div className={`relative max-w-[85%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`p-4 rounded-2xl text-xs md:text-[13px] leading-relaxed relative ${
                      msg.sender === 'user' 
                        ? 'bg-cyan text-bg font-medium rounded-tr-none shadow-lg shadow-cyan/10' 
                        : msg.sender === 'system'
                        ? 'bg-transparent text-muted'
                        : 'bg-panel border border-line rounded-tl-none text-text shadow-sm'
                    }`}>
                      <RichMessage text={msg.text} sender={msg.sender} />

                      {/* REQ-TUTOR-070: Fallback Action Button (Checking for 'Cloud AI' and 'ask' to identify escalation intent) */}
                      {msg.source === 'Course docs' && msg.text.toLowerCase().includes('cloud ai') && msg.text.toLowerCase().includes('ask') && (
                        <div className="mt-4 pb-2">
                          <button 
                            onClick={() => {
                              addToast('success', 'Switching to Cloud AI for this query...');
                              setAiMode('full');
                              // Automatically trigger a follow-up answer from the Cloud
                              setIsTyping(true);
                              setTimeout(() => {
                                const cloudMsg: ChatMessage = {
                                  id: crypto.randomUUID(),
                                  sender: 'tutor',
                                  text: 'I have retrieved this from the **Cloud AI**:\n\nFor general arithmetic or broad Python concepts (like bitwise operators) not covered in your specific curriculum docs, the cloud engine uses its global training data. Is there a specific operator you\'d like to see an example of?',
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  source: 'Cloud AI'
                                };
                                setChatMessages(prev => [...prev, cloudMsg]);
                                setIsTyping(false);
                              }, 1500);
                            }}
                            className="bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-cyan hover:text-bg transition-all flex items-center space-x-2"
                          >
                            <BrainCircuit className="w-3.5 h-3.5" />
                            <span>Confirm: Ask Cloud AI</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Message Actions (Persistent for tutor messages) */}
                      {msg.sender === 'tutor' && (
                        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-line/30">
                          <button className="p-1 text-muted hover:text-cyan transition-colors" title="Mark as helpful">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 text-muted hover:text-red transition-colors" title="Mark as unhelpful">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 text-muted hover:text-cyan transition-colors ml-auto" title="Save as note">
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(msg.text)}
                            className="p-1 text-muted hover:text-cyan transition-colors" 
                            title="Copy message"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {msg.sender !== 'system' && (
                      <div className={`flex items-center space-x-2 text-[9px] text-muted mt-1.5 px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-between'}`}>
                        {msg.sender === 'tutor' && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{msg.timestamp}</span>
                            {msg.source && (
                              <div className="group/tooltip relative">
                                <span className={`border px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-tight transition-colors ${
                                  msg.source === 'Course docs' 
                                    ? 'bg-cyan/10 border-cyan/20 text-cyan' 
                                    : 'bg-purple/10 border-purple/20 text-purple'
                                }`}>
                                  {msg.source}
                                </span>
                                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-panel2 border border-line rounded-lg text-[10px] text-text opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all z-20 shadow-2xl translate-y-1 group-hover/tooltip:translate-y-0">
                                  <div className="font-bold mb-1 flex items-center space-x-2">
                                    {msg.source === 'Course docs' ? (
                                      <>
                                        <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
                                        <span>Local Engine (Grounded)</span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-2 h-2 rounded-full bg-purple shadow-[0_0_8px_var(--purple)]" />
                                        <span>Cloud Engine (General)</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted leading-relaxed">
                                    {msg.source === 'Course docs' 
                                      ? 'This answer is derived exclusively from Manthio\'s verified curriculum. It prioritizes accuracy and instructional safety.' 
                                      : 'This answer uses broad AI knowledge. Useful for general coding, debugging, and cross-domain questions outside the course scope.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {msg.sender === 'user' && <span>{msg.timestamp}</span>}
                      </div>
                    )}
                    
                    {/* Citations if Local AI */}
                    {msg.documents && msg.documents.length > 0 && (
                      <div className="pl-4 border-l-2 border-cyan/30 text-[10px] text-muted mt-3 space-y-1.5 animate-cel-reveal">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-muted/60 flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span>References</span>
                        </span>
                        {msg.documents.map((doc, idx) => (
                          <a key={idx} href={doc.url} className="text-cyan hover:text-cyan2 flex items-center space-x-1.5 group/link">
                            <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                            <span className="underline decoration-cyan/30 underline-offset-2">{doc.title}</span>
                            <span className="text-[8px] text-muted ml-auto">({doc.location})</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isReasoning && (
                <div className="text-[10px] text-muted flex items-center space-x-3 px-2 py-3 bg-panel/30 rounded-xl border border-line/30 max-w-[200px] animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" />
                  </div>
                  <span className="font-medium italic">Tutor is thinking...</span>
                </div>
              )}

              {isTyping && !isReasoning && (
                <div className="text-[10px] text-muted flex items-center space-x-1.5 italic px-2 animate-pulse">
                  <div className="w-3 h-3 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
                  <span>AI Tutor is responding...</span>
                </div>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="bg-panel border-t border-line p-4 shrink-0 transition-all">
              <div className="max-w-4xl mx-auto space-y-4">
                
                {/* Suggested Prompts */}
                {!chatInput && chatMessages.length < 5 && (
                  <div className="flex flex-wrap gap-2 animate-cel-reveal">
                    {suggestedPrompts.map((prompt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[10px] bg-bg border border-line hover:border-cyan/40 hover:bg-cyan/5 text-muted hover:text-cyan px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-end space-x-3 bg-bg border border-line rounded-2xl p-2 focus-within:border-cyan/50 transition-colors shadow-inner">
                  <div className="flex items-center space-x-1 mb-1">
                    <button className="p-2 text-muted hover:text-cyan transition-colors" title="Attach file (Phase 2)">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <div className="group relative">
                      <button className="p-2 text-muted hover:text-purple transition-colors" title="Voice mode (Coming soon)">
                        <Mic className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-panel2 border border-line rounded text-[8px] text-text opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-30">
                        Voice: Coming Soon
                      </div>
                    </div>
                  </div>
                  
                  <AutoExpandingTextarea 
                    value={chatInput}
                    onChange={setChatInput}
                    onSend={handleSendMessage}
                    disabled={isTyping || isReasoning}
                  />

                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() || isTyping || isReasoning}
                    className={`p-2.5 rounded-xl transition-all mb-0.5 ${chatInput.trim() && !isTyping ? 'bg-cyan text-bg hover:bg-cyan2 shadow-lg shadow-cyan/20' : 'bg-line text-muted cursor-not-allowed'}`}
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between px-2">
                  <div className="text-[9px] text-muted flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green" />
                      <span>Ready</span>
                    </div>
                    <span>•</span>
                    <span>AI can make mistakes. Grounded in Python Bootcamp.</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-[9px] font-bold text-muted uppercase tracking-tighter">
                    <span>Markdown</span>
                    <span>Latex</span>
                    <span>Code</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column: Context Widgets */}
      <div className="w-full md:w-64 bg-panel border-l border-line p-4 shrink-0 space-y-6 overflow-y-auto hidden lg:block">
        {(isLoading || isSwitching) ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-3.5 bg-line rounded w-1/2 animate-pulse" />
              <div className="h-16 bg-bg border border-line rounded-xl animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-3.5 bg-line rounded w-1/3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-10 bg-bg border border-line rounded-xl animate-pulse" />
                <div className="h-10 bg-bg border border-line rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3.5 bg-line rounded w-1/2 animate-pulse" />
              <div className="h-24 bg-bg border border-line rounded-xl animate-pulse" />
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-xs text-muted">
            Failed to load context.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-cyan" />
                <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Active Module</h4>
              </div>
              <div className="bg-bg border border-line p-3 rounded-xl text-xs space-y-2 group hover:border-cyan/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-text">{activeContext.module}</div>
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3 h-3 text-muted hover:text-cyan" />
                  </button>
                </div>
                <div className="w-full bg-line h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan h-full transition-all duration-700" style={{ width: `${activeContext.progress}%` }} />
                </div>
                <p className="text-[10px] text-muted">{activeContext.lesson}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-yellow" />
                <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Weak Points</h4>
              </div>
              <div className="space-y-2">
                {activeContext.weakPoints.length > 0 ? (
                  activeContext.weakPoints.map((weak, idx) => (
                    <div key={idx} className="bg-bg border border-line p-2.5 rounded-xl text-xs text-text flex items-center justify-between hover:border-yellow/30 transition-colors">
                      <span>{weak.label}</span>
                      <span className={`w-2 h-2 rounded-full ${weak.color}`} />
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-muted italic px-2">No weak points detected yet.</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-purple" />
                <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Saved Snippets</h4>
              </div>
              <div className="space-y-2">
                {activeContext.snippets.map((snippet, idx) => (
                  <div key={idx} className="bg-bg border border-line p-2.5 rounded-xl text-xs flex flex-col space-y-1.5 hover:border-purple/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text truncate">{snippet.title}</span>
                      <Save className="w-3 h-3 text-purple" />
                    </div>
                    <p className="text-[10px] text-muted line-clamp-1 italic">{snippet.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-cyan" />
                <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Recommended</h4>
              </div>
              <div className="bg-cyan/5 border border-cyan/20 p-3 rounded-xl text-xs text-text space-y-2">
                <p className="text-[10px] text-muted font-medium">To fix your OOP gap:</p>
                <button 
                  onClick={() => {
                    addToast('info', 'Exercise started');
                    onNavigate('content-player');
                  }}
                  className="w-full bg-cyan text-bg py-2 rounded-lg font-bold uppercase text-[9px] shadow-lg shadow-cyan/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Start: Class Quiz
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
