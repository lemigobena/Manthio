import React, { useState, useEffect } from 'react';
import { useXP } from '../../context/XPContext';
import { useAuth } from '../../context/AuthContext';
import { Search, MessageSquare, Share2, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Plus } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { analyticsService } from '../../services/analyticsService';
import { AITutorChat } from './components/AITutorChat';
import { ContextSelectorModal } from './components/ContextSelectorModal';
import type { Course, Module, Lesson } from '../../types';

interface AITutorPageProps {
  onNavigate?: (page: string) => void;
  initialTab?: string;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Ignore
    }
  }
  return Date.now().toString() + Math.random().toString(36).substring(2);
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
    title: 'Contextual Awareness (16.5)',
    messages: [
      { id: 's1', sender: 'system', text: 'Session started: Module 3 Context Active', timestamp: '14:29' },
      { id: 'm1', sender: 'tutor', text: 'Hello! I see you\'re working on Module 3: Workshop A. I also notice you\'ve struggled with OOP Concepts in the past. How can I help you today?', timestamp: '14:30', source: 'Course docs', sourceLink: '#/docs/module-3/oop-concepts' }
    ],
    context: {
      module: 'Module 3: Workshop A',
      lesson: 'Lesson 4.2: OOP & Recursion',
      progress: 60,
      weakPoints: [
        { label: 'OOP Concepts', color: 'bg-red' },
        { label: 'Recursion', color: 'bg-orange' }
      ],
      snippets: [
        { title: 'Class Definition', content: '"class Node: def __init__(self):..."' }
      ]
    }
  },
  'chat-2': {
    id: 'chat-2',
    title: 'Rich Content Demo (16.4.2)',
    messages: [
      { id: 's2', sender: 'system', text: 'History Loaded: Yesterday', timestamp: 'Jun 21 16:00' },
      { id: 'u2', sender: 'user', text: 'Can you show me a Python code block and some math?', timestamp: '16:05' },
      { id: 'm2', sender: 'tutor', text: 'Certainly! Here is a simple Python function to calculate the area of a circle:\n\n```python\nimport math\n\ndef circle_area(radius):\n    return math.pi * (radius ** 2)\n```\n\nThe mathematical formula for this is:\n\n$$ A = \\pi r^2 $$\n\nWhere $A$ is the area and $r$ is the radius.', timestamp: '16:06', source: 'Course docs', sourceLink: '#/docs/python-math/formulas' }
    ],
    context: {
      module: 'Module 2: Math and Logic',
      lesson: 'Lesson 2.1: Advanced Math',
      progress: 100,
      weakPoints: [],
      snippets: []
    }
  },
  'chat-3': {
    id: 'chat-3',
    title: 'Source Fallback (16.10.3)',
    messages: [
      { id: 's3', sender: 'system', text: 'Diagnostic Mode: Source Engine Testing', timestamp: 'Jun 08 10:00' },
      { id: 'u3', sender: 'user', text: 'What is the speed of light in a vacuum?', timestamp: '10:01' },
      { 
        id: 'm3', 
        sender: 'tutor', 
        text: 'I can\'t find specific data about physical constants in the Python Bootcamp materials. Would you like me to ask the Cloud AI?', 
        timestamp: '10:02', 
        source: 'Course docs',
        sourceLink: '#/docs/python/constants'
      }
    ],
    context: {
      module: 'Module 1: Setup',
      lesson: 'Lesson 1.4: Virtual Environments',
      progress: 85,
      weakPoints: [],
      snippets: []
    }
  },
  'chat-4': {
    id: 'chat-4',
    title: 'Rate Limit (16.9)',
    messages: [
      { id: 's4', sender: 'system', text: 'Session: Rate Limit Test', timestamp: 'Jun 08 10:00' },
      { id: 'u4', sender: 'user', text: 'Please analyze this 5000 line dataset.', timestamp: '10:01' },
      { id: 'sys1', sender: 'system', text: 'You\'ve reached today\'s free AI Tutor limit (10/10 messages). Please upgrade to PRO for unlimited access, or try again tomorrow.', timestamp: '10:02' }
    ],
    context: {
      module: 'Module 1: Intro',
      lesson: 'Lesson 1.1: Math Operators',
      progress: 20,
      weakPoints: [],
      snippets: []
    }
  },
  'chat-5': {
    id: 'chat-5',
    title: 'Socratic Mode (16.9.1)',
    messages: [
      { id: 's5', sender: 'system', text: 'Socratic Comprehension Probe Active', timestamp: 'Jun 08 10:00' },
      { id: 'u5', sender: 'user', text: 'Can you just give me the answer for the exercise 4.1? My code keeps failing.', timestamp: '10:01' },
      { id: 'm5', sender: 'tutor', text: 'I noticed your loop condition is causing an infinite loop. Instead of giving you the exact answer, can you tell me in your own words what happens when `i` is never incremented inside the `while` block?', timestamp: '10:02', source: 'Course docs' }
    ],
    context: {
      module: 'Module 4: Loops',
      lesson: 'Exercise 4.1',
      progress: 40,
      weakPoints: [],
      snippets: []
    }
  }
};

export const AITutorPage: React.FC<AITutorPageProps> = ({ initialTab, onNavigate }) => {
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
              id: generateId(), 
              sender: 'system', 
              text: `Socratic Remediation Mode Active: Focused on ${weakness.topic}`, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
            { 
              id: generateId(), 
              sender: 'system', 
              text: `Learner wrong-answer pattern: "${weakness.wrongPatterns}"`, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
            { 
              id: generateId(), 
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
            id: generateId(), 
            sender: 'system', 
            text: `Socratic Remediation Mode Active: Focused on ${weakness.topic}`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          },
          { 
            id: generateId(), 
            sender: 'system', 
            text: `Learner wrong-answer pattern: "${weakness.wrongPatterns}"`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          },
          { 
            id: generateId(), 
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
    
    const messages = [...MOCK_SESSIONS[activeChatId]?.messages || MOCK_SESSIONS['chat-1'].messages];
    const tutorMsgIndex = messages.findIndex(m => m.sender === 'tutor');
    if (tutorMsgIndex !== -1 && activeChatId === 'chat-1') {
      messages[tutorMsgIndex] = { ...messages[tutorMsgIndex], text: welcomeText };
    }
    return messages;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Collapse States
  const [leftCollapsed, setLeftCollapsed] = useState(() => window.innerWidth < 768); 
  const [rightCollapsed, setRightCollapsed] = useState(() => window.innerWidth < 768); 
  const [isSwitching, setIsSwitching] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);


  const remediationSessions = Object.values(sessions).filter(s => s.id.startsWith('remediation-'));
  const newSessions = Object.values(sessions).filter(s => !['chat-1', 'chat-2', 'chat-3', 'chat-4', 'chat-5'].includes(s.id) && !s.id.startsWith('remediation-'));

  const historyGroups = [
    { 
      label: 'Today', 
      items: [
        ...newSessions.map(s => ({ id: s.id, title: s.title, date: 'Now' })),
        ...remediationSessions.map(s => ({ id: s.id, title: s.title, date: 'Now' })),
        { id: 'chat-1', title: 'Contextual Awareness', date: '14:30' },
        { id: 'chat-2', title: 'Rich Content Demo', date: '16:00' }
      ] 
    },
    { label: 'Yesterday', items: [
      { id: 'chat-3', title: 'Source Fallback', date: 'Jun 21' },
      { id: 'chat-4', title: 'Rate Limit Warning', date: 'Jun 21' },
      { id: 'chat-5', title: 'Socratic Mode', date: 'Jun 21' }
    ]},
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

  const handleStartNewChat = (context: { course?: Course; module?: Module; lesson?: Lesson }) => {
    setIsSelectorOpen(false);
    
    if (!context.course) return;

    const newChatId = `chat-${generateId()}`;
    const title = context.lesson 
      ? context.lesson.title 
      : context.module 
        ? context.module.title
        : `${context.course.title} Chat`;

    const newSession: ChatSessionData = {
      id: newChatId,
      title,
      messages: [
        {
          id: generateId(),
          sender: 'system',
          text: `Session started: ${title}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: generateId(),
          sender: 'tutor',
          text: `Hello! I see you want to discuss ${title}. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      context: {
        module: context.module ? context.module.title : context.course.title,
        lesson: context.lesson ? context.lesson.title : 'General Discussion',
        progress: 0,
        weakPoints: [],
        snippets: []
      }
    };

    setSessions(prev => ({ ...prev, [newChatId]: newSession }));
    
    // Select the newly created chat (bypassing handleSelectChat to avoid stale state)
    setIsSwitching(true);
    setActiveChatId(newChatId);
    setTimeout(() => {
      setChatMessages(newSession.messages);
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

  const handleExportMarkdown = () => {
    let markdown = `# ${sessions[activeChatId]?.title || 'AI Tutor Session'}\n\n`;
    chatMessages.forEach(msg => {
      if (msg.sender === 'user') {
        markdown += `**User:**\n${msg.text}\n\n`;
      } else if (msg.sender === 'tutor') {
        markdown += `**AI Tutor** (${msg.source || 'Course docs'}):\n${msg.text}\n\n`;
      } else if (msg.sender === 'system') {
        markdown += `_${msg.text}_\n\n`;
      }
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(sessions[activeChatId]?.title || 'chat').replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToNotes = (text: string) => {
    // Generate a predictable mock lesson ID from the lesson name
    const lessonId = activeContext.lesson.replace(/[\s\W]+/g, '-').toLowerCase();
    const currentNote = localStorage.getItem(`note-${lessonId}`) || '';
    const updatedNote = currentNote + (currentNote ? '\n\n' : '') + `> **AI Tutor:**\n> ${text.replace(/\n/g, '\n> ')}`;
    localStorage.setItem(`note-${lessonId}`, updatedNote);
    window.dispatchEvent(new Event('noteUpdated'));
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
            <button 
              onClick={() => setIsSelectorOpen(true)}
              className="p-1 hover:bg-line rounded transition-colors text-muted hover:text-cyan"
            >
              <Plus className="w-5 h-5" />
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
              className="w-full bg-bg border border-line focus:border-cyan rounded-lg py-1.5 pl-8 pr-3 text-[11px] focus:outline-none !outline-none"
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
          <button onClick={handleExportMarkdown} className={`w-full bg-line/50 hover:bg-line text-text text-[11px] font-bold py-2 ${leftCollapsed ? 'rounded-3xl' : 'rounded-xl'} transition-all flex items-center justify-center space-x-2 ${leftCollapsed ? 'p-2' : ''}`}>
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
            <AITutorChat
              messages={chatMessages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              suggestedPrompts={suggestedPrompts}
              onSourceClick={() => onNavigate && onNavigate('content-player')}
              onSaveToNotes={handleSaveToNotes}
            />
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
              <h4 className="font-bold text-xs uppercase text-muted tracking-wider truncate">Context</h4>
            </div>
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

      <ContextSelectorModal 
        isOpen={isSelectorOpen} 
        onClose={() => setIsSelectorOpen(false)} 
        onStartChat={handleStartNewChat} 
      />
    </div>
  );
};
