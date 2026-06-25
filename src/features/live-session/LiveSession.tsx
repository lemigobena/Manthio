import React, { useState } from 'react';
import { 
  Video, Users, MessageSquare, BookOpen, Clock, Calendar, 
  Download, ArrowRight, CheckCircle2, Play, Sparkles, 
  Send, Hand, BarChart3, Bot, ChevronRight, Mail,
  ExternalLink, Info, Star, Plus, ShieldCheck, ArrowUp
} from 'lucide-react';
import { AITutorChat } from '../ai-tutor/components/AITutorChat';
import type { ChatMessage } from '../../types';

import { liveSessionsData } from './data/liveSessionsData';
import type { SessionState } from './data/liveSessionsData';

interface LiveSessionProps {
  sessionId?: string;
  onNavigate?: (page: string) => void;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ sessionId = 'session-1', onNavigate }) => {
  const sessionData = liveSessionsData[sessionId] || liveSessionsData['session-1'];
  
  const [sessionState, setSessionState] = useState<SessionState>(sessionData.state || 'pre');
  const [showTrainerDirect, setShowTrainerDirect] = useState(false);

  if (showTrainerDirect) {
    return (
      <TrainerDirectView 
        trainer={sessionData.trainer} 
        onBack={() => setShowTrainerDirect(false)} 
      />
    );
  }

  return (
    <div className="min-h-full space-y-6 animate-cel-reveal">
      {/* Header / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-1">
            <Video size={12} className="text-cyan" />
            <span 
              className="text-muted hover:text-cyan cursor-pointer transition-colors"
              onClick={() => onNavigate?.('live-sessions')}
            >
              Live Sessions
            </span>
            <ChevronRight size={10} />
            <span className="text-text">Session View</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">{sessionData.title}</h1>
        </div>
      </div>

      {sessionState === 'pre' && (
        <PreSessionView 
          data={sessionData} 
          onJoin={() => setSessionState('live')} 
          onContactTrainer={() => setShowTrainerDirect(true)}
        />
      )}
      {sessionState === 'live' && (
        <ActiveSessionView 
          data={sessionData} 
          onLeave={() => setSessionState('post')}
          onNavigate={onNavigate}
        />
      )}
      {sessionState === 'post' && (
        <PostSessionView 
          data={sessionData} 
          onContactTrainer={() => setShowTrainerDirect(true)}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const FlipUnit: React.FC<{ value: string, label: string }> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-14 h-18 md:w-20 md:h-24 bg-panel border border-line rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top half */}
        <div className="h-1/2 bg-panel2 border-b border-line/30 flex items-end justify-center overflow-hidden">
          <span className="text-2xl md:text-4xl font-mono font-black text-text translate-y-1/2 leading-none uppercase">{value}</span>
        </div>
        {/* Bottom half */}
        <div className="h-1/2 flex items-start justify-center overflow-hidden">
          <span className="text-2xl md:text-4xl font-mono font-black text-text -translate-y-1/2 leading-none uppercase">{value}</span>
        </div>
        {/* Divider Hinge */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-bg/80 z-10" />
        <div className="absolute top-1/2 left-0 w-1 h-3 bg-line -translate-y-1/2 rounded-r" />
        <div className="absolute top-1/2 right-0 w-1 h-3 bg-line -translate-y-1/2 rounded-l" />
      </div>
      <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
};

const PreSessionView: React.FC<{ 
  data: any, 
  onJoin: () => void,
  onContactTrainer: () => void
}> = ({ data, onContactTrainer }) => {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '03', mins: '18', secs: '45' });

  React.useEffect(() => {
    const timer = setInterval(() => {
      // Simulate countdown
      setTimeLeft(prev => {
        const s = parseInt(prev.secs);
        const m = parseInt(prev.mins);
        if (s > 0) return { ...prev, secs: (s - 1).toString().padStart(2, '0') };
        if (m > 0) return { ...prev, mins: (m - 1).toString().padStart(2, '0'), secs: '59' };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-panel border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="h-64 md:h-72 bg-gradient-to-br from-panel2 to-bg flex items-center justify-center relative overflow-hidden">
             {/* Abstract background graphics */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-cyan/5 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple/5 rounded-full blur-[100px] -ml-48 -mb-48 animate-pulse" />
             
             <div className="relative flex flex-col items-center space-y-10">
                <h2 className="text-3xl md:text-5xl font-bold text-text uppercase tracking-tight">COMING SOON</h2>

                <div className="flex space-x-3 md:space-x-6">
                   <FlipUnit value={timeLeft.days} label="Days" />
                   <FlipUnit value={timeLeft.hours} label="Hours" />
                   <FlipUnit value={timeLeft.mins} label="Minutes" />
                   <FlipUnit value={timeLeft.secs} label="Seconds" />
                </div>
             </div>
          </div>
        </div>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold text-text">About this Session</h3>
            <p className="text-base text-muted leading-relaxed max-w-3xl">{data.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-line/20">
            <button disabled className="bg-line/50 text-muted text-xs font-bold px-8 py-4 rounded-xl flex items-center space-x-3 cursor-not-allowed border border-line/20 shadow-lg">
              <Video size={18} />
              <span>Join Session (Locked)</span>
            </button>
            <div className="px-4 py-3 bg-panel border border-line/50 rounded-xl flex items-center space-x-3 text-xs text-muted font-medium">
              <Info size={16} className="text-cyan animate-pulse" />
              <span>The join button opens 10 minutes before the start time.</span>
            </div>
          </div>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-6">
          <h3 className="text-sm font-bold text-text mb-4 flex items-center space-x-2">
            <BookOpen size={16} className="text-purple" />
            <span>Pre-session Materials</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.materials.map((file: any, i: number) => (
              <div key={i} className="group bg-bg border border-line rounded-xl p-4 flex items-center justify-between hover:border-cyan/50 transition-all cursor-pointer">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 bg-panel2 rounded-lg flex items-center justify-center text-muted group-hover:text-cyan transition-colors">
                    <Download size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-text truncate">{file.name}</div>
                    <div className="text-[10px] text-muted">{file.size}</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest">Your Trainer</h3>
            <div className="flex items-center space-x-3">
              <img src={data.trainer.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div>
                <div className="text-xs font-bold text-text">{data.trainer.name}</div>
                <div className="text-[10px] text-muted">{data.trainer.role}</div>
              </div>
            </div>
            <button 
              onClick={onContactTrainer}
              className="w-full bg-cyan text-bg text-[11px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_var(--cyan)]/10 hover:shadow-[0_0_20px_var(--cyan)]/20"
            >
              <MessageSquare size={16} />
              <span>Contact Trainer</span>
            </button>
          </div>

          <div className="pt-6 border-t border-line space-y-4">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest">Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs text-text">
                <Calendar size={16} className="text-cyan" />
                <span>Today, June 22nd</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-text">
                <Clock size={16} className="text-cyan" />
                <span>14:30 - 16:00 CET</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="w-full bg-line/30 hover:bg-line text-text text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-2">
                <Plus size={14} />
                <span>Add to Google Calendar</span>
              </button>
              <button className="w-full bg-line/30 hover:bg-line text-text text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-2">
                <Plus size={14} />
                <span>Add to Outlook / iCal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple/10 to-cyan/10 border border-purple/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2 text-purple font-bold text-[10px] uppercase tracking-widest">
              <Sparkles size={14} />
              <span>AI Prep Hint</span>
            </div>
            <p className="text-xs text-text/80 leading-relaxed italic">
              "Dr. Sarah often asks about the 'Closure' concept in the first 5 minutes. Refresh your knowledge of Module 2.1 to be ready for the icebreaker poll!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveSessionView: React.FC<{ 
  data: any, 
  onLeave: () => void,
  onNavigate?: (page: string) => void
}> = ({ data, onLeave, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'materials' | 'ai-tutor'>('chat');
  const [groupChatInput, setGroupChatInput] = useState('');
  const [groupChatMessages, setGroupChatMessages] = useState<any[]>([
    {
      id: 'msg-1',
      sender: 'Alex M.',
      isUser: false,
      isTutor: false,
      isModerator: false,
      time: '14:55',
      text: 'Is there any performance overhead when using useActionState compared to standard useEffect?'
    },
    {
      id: 'msg-2',
      sender: 'Moderator',
      isUser: false,
      isTutor: false,
      isModerator: true,
      time: '14:56',
      text: 'Great question Alex! Sarah will address this in the Q&A section in 5 minutes.'
    },
    {
      id: 'msg-3',
      sender: 'AI Tutor Hint',
      isUser: false,
      isTutor: true,
      isModerator: false,
      time: '14:56',
      text: "Wait, are you wondering about 'memoization'? I have a snippet for that in the local resources."
    }
  ]);

  const handleGroupChatSend = () => {
    if (!groupChatInput.trim()) return;
    const userMsg = {
      id: Math.random().toString(),
      sender: 'You',
      isUser: true,
      isTutor: false,
      isModerator: false,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: groupChatInput
    };
    setGroupChatMessages(prev => [...prev, userMsg]);
    setGroupChatInput('');
  };

  const handleGroupChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGroupChatSend();
    }
  };

  const [aiChatInput, setAiChatInput] = useState('');
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { 
      id: 'ls-msg-1',
      sender: 'system', 
      text: 'Tutor is context-aware of current slide: "React 19 Server Components"', 
      timestamp: '14:29' 
    },
    { 
      id: 'ls-msg-2',
      sender: 'tutor', 
      text: "Hello! I'm your private AI Tutor. Ask me anything about today's session without interrupting the group.", 
      source: 'Course docs',
      sourceLink: '#/docs/react-19/server-components',
      timestamp: '14:30'
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleAiSend = (textOverride?: string, forceCloud?: boolean) => {
    const text = textOverride || aiChatInput;
    if (!text.trim()) return;
    const userMsg: ChatMessage = { 
      id: Math.random().toString(),
      sender: 'user', 
      text,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setAiMessages(prev => [...prev, userMsg]);
    if (!textOverride) setAiChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      setAiMessages(prev => [...prev, { 
        id: Math.random().toString(),
        sender: 'tutor', 
        text: forceCloud 
          ? "I searched the Cloud AI for you. React 19 introduces 'useActionState' which is designed to help manage forms, replacing some complex useState/useEffect combos." 
          : "That's a great question about React 19! The 'useActionState' hook essentially manages form status, errors, and data in a unified way, which is what Sarah is showing right now.",
        source: forceCloud ? 'Cloud AI' : 'Course docs',
        sourceLink: forceCloud ? undefined : '#/docs/react-19/use-action-state',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setIsAiTyping(false);
    }, 1500);
  };
  
  return (
    <div className="lg:h-[700px] flex flex-col lg:flex-row gap-4">
      {/* Video Area */}
      <div className="flex-1 flex flex-col bg-bg border border-line rounded-2xl overflow-hidden relative group">
        {/* Placeholder for embedded video */}
        <div className="flex-1 bg-panel2 flex flex-col items-center justify-center relative">
          <div className="p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-cyan/10 border border-cyan/20 rounded-full flex items-center justify-center mx-auto text-cyan animate-pulse">
              <Video size={48} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-text">Session Stream Active</h3>
              <p className="text-sm text-muted">Awaiting trainer start signal...</p>
            </div>
            <div className="flex items-center justify-center space-x-3 text-xs text-muted">
              <div className="flex items-center space-x-1"><Users size={14} /> <span>128 attending</span></div>
              <div className="w-1 h-1 rounded-full bg-line" />
              <div className="flex items-center space-x-1 text-green"><ShieldCheck size={14} /> <span>Secure Link</span></div>
            </div>
          </div>

          {/* Desktop Only: Video Controls Bar (Overlay) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center space-x-4 bg-bg/80 backdrop-blur-xl border border-line p-2 px-6 rounded-2xl shadow-2xl transition-all opacity-0 group-hover:opacity-100">
             <button className="p-3 text-muted hover:text-white hover:bg-red rounded-xl transition-all" onClick={onLeave}>
               <Users size={20} />
             </button>
             <div className="w-px h-6 bg-line mx-2" />
             <button className="p-3 text-muted hover:text-bg hover:bg-cyan rounded-xl transition-all"><Hand size={20} /></button>
             <button className="p-3 text-muted hover:text-bg hover:bg-cyan rounded-xl transition-all"><Video size={20} /></button>
             <button className="p-3 text-muted hover:text-bg hover:bg-cyan rounded-xl transition-all"><BarChart3 size={20} /></button>
          </div>
        </div>
        
        {/* Mobile Only: Functional Bar (Below Video, No Overlay) */}
        <div className="flex lg:hidden flex-col bg-panel border-t border-line">
           {/* Section 1: Session Info & Zoom */}
           <div className="p-4 border-b border-line/50 hidden lg:flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-text truncate max-w-[200px]">{data.title}</span>
              </div>
              <button className="bg-cyan/10 text-cyan border border-cyan/20 p-2 px-4 rounded-full text-[10px] font-bold flex items-center space-x-1">
                 <ExternalLink size={12} />
                 <span>Zoom</span>
              </button>
           </div>
           
           {/* Section 2: Controls */}
           <div className="p-4 grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center space-y-1 bg-red/10 border border-red/20 p-3 rounded-2xl text-red transition-all active:scale-90 shadow-sm" onClick={onLeave}>
                 <Users size={20} />
                 <span className="text-[8px] font-bold uppercase">Leave</span>
              </button>
              <button className="flex flex-col items-center space-y-1 bg-cyan/10 border border-cyan/20 p-3 rounded-2xl text-cyan transition-all active:scale-90 shadow-sm">
                 <Hand size={20} />
                 <span className="text-[8px] font-bold uppercase">Raise</span>
              </button>
              <button className="flex flex-col items-center space-y-1 bg-cyan/10 border border-cyan/20 p-3 rounded-2xl text-cyan transition-all active:scale-90 shadow-sm">
                 <Video size={20} />
                 <span className="text-[8px] font-bold uppercase">Camera</span>
              </button>
              <button className="flex flex-col items-center space-y-1 bg-cyan/10 border border-cyan/20 p-3 rounded-2xl text-cyan transition-all active:scale-90 shadow-sm">
                 <BarChart3 size={20} />
                 <span className="text-[8px] font-bold uppercase">Polls</span>
              </button>
           </div>
        </div>
        
        {/* Desktop Only: Session Bottom Info (Standard Box) */}
        <div className="hidden lg:flex p-4 bg-panel border-t border-line items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-text">Live: {data.title}</span>
          </div>
          <button className="text-[10px] font-bold text-muted hover:text-cyan transition-colors flex items-center space-x-1">
            <ExternalLink size={12} />
            <span>Open in Zoom</span>
          </button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-80 h-[500px] lg:h-full bg-panel border border-line rounded-2xl flex flex-col overflow-hidden">
        <div className="flex border-b border-line">
          {([
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'ai-tutor', icon: Bot, label: 'AI Tutor' },
            { id: 'polls', icon: BarChart3, label: 'Polls' },
            { id: 'materials', icon: BookOpen, label: 'Resources' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex flex-col items-center space-y-1 transition-all relative ${
                activeTab === tab.id ? 'text-cyan' : 'text-muted hover:text-text'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan shadow-[0_0_10px_var(--cyan)]" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 space-y-4">
                {groupChatMessages.map((msg) => {
                  if (msg.isTutor) {
                    return (
                      <div key={msg.id} className="bg-purple/5 border border-purple/20 rounded-xl p-3 flex space-x-3">
                        <Bot size={16} className="text-purple shrink-0" />
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-purple uppercase tracking-widest">{msg.sender}</span>
                          <p className="text-[10px] text-text/90 italic">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={msg.id} className="bg-bg/50 rounded-xl p-3 border border-line/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold ${msg.isModerator ? 'text-cyan' : msg.isUser ? 'text-green' : 'text-purple'}`}>
                          {msg.sender}
                        </span>
                        <span className="text-[9px] text-muted">{msg.time}</span>
                      </div>
                      <p className="text-[11px] text-text leading-relaxed">{msg.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-line space-y-3 shrink-0">
                 <div className="flex items-center space-x-2 bg-bg border border-line rounded-xl px-3 py-1.5">
                   <input 
                     type="text" 
                     placeholder="Type a message..." 
                     className="flex-1 bg-transparent border-none text-[11px] focus:outline-none text-text"
                     value={groupChatInput}
                     onChange={(e) => setGroupChatInput(e.target.value)}
                     onKeyDown={handleGroupChatKeyDown}
                   />
                   <button 
                     onClick={handleGroupChatSend}
                     disabled={!groupChatInput.trim()}
                     className={`transition-transform ${groupChatInput.trim() ? 'text-cyan hover:scale-110' : 'text-muted/50 cursor-not-allowed'}`}
                   >
                     <Send size={16} />
                   </button>
                 </div>
              </div>
            </>
          )}

          {activeTab === 'ai-tutor' && (
            <div className="flex-1 flex flex-col h-full -m-4">
              <AITutorChat
                messages={aiMessages}
                isTyping={isAiTyping}
                onSendMessage={handleAiSend}
                suggestedPrompts={['What is React 19?', 'Can you explain useActionState?']}
                embedded={true}
                onSourceClick={() => onNavigate && onNavigate('content-player')}
              />
            </div>
          )}

          {activeTab === 'polls' && (
            <div className="space-y-6">
              <div className="space-y-3">
                 <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Poll</div>
                 <div className="bg-bg border border-line rounded-xl p-4 space-y-4">
                   <p className="text-xs font-bold text-text">Which React version are you currently using in production?</p>
                   <div className="space-y-2">
                     <button className="w-full text-left p-3 rounded-lg bg-line/30 hover:bg-line/50 border border-line transition-all text-[11px]">React 17 or older</button>
                     <button className="w-full text-left p-3 rounded-lg bg-cyan/10 border border-cyan text-cyan transition-all text-[11px] flex items-center justify-between">
                       <span>React 18</span>
                       <CheckCircle2 size={14} />
                     </button>
                     <button className="w-full text-left p-3 rounded-lg bg-line/30 hover:bg-line/50 border border-line transition-all text-[11px]">React 19 (Alpha/Beta)</button>
                   </div>
                 </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-line">
                 <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Past Poll Results</div>
                 <div className="bg-bg border border-line rounded-xl p-4 space-y-3">
                    <p className="text-[11px] text-muted">"Have you used Server Actions before?"</p>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] mb-1"><span>Yes</span><span>62%</span></div>
                        <div className="w-full bg-line h-1 rounded-full overflow-hidden"><div className="bg-cyan h-full w-[62%]" /></div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] mb-1"><span>No</span><span>38%</span></div>
                        <div className="w-full bg-line h-1 rounded-full overflow-hidden"><div className="bg-muted h-full w-[38%]" /></div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-3">
               {data.materials.map((file: any, i: number) => (
                <div key={i} className="bg-bg border border-line rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Download size={16} className="text-muted" />
                    <span className="text-[11px] text-text truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <button className="text-cyan text-[10px] font-bold">Get</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostSessionView: React.FC<{ data: any, onContactTrainer: () => void }> = ({ data, onContactTrainer }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Video Recording */}
        <div className="bg-panel border border-line rounded-2xl overflow-hidden group">
          <div className="aspect-video bg-panel2 flex items-center justify-center relative cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
              alt="" 
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-20 h-20 bg-cyan text-bg rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,245,228,0.3)] transition-all group-hover:scale-110">
              <Play size={32} fill="currentColor" />
            </div>
            <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-bg/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-line">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text">Recording Available</span>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between border-t border-line">
            <div className="flex items-center space-x-4">
               <button className="text-[11px] font-bold text-text flex items-center space-x-2 bg-line/30 px-4 py-2 rounded-xl hover:bg-line transition-all">
                 <Download size={14} />
                 <span>Download Session</span>
               </button>
               <button className="text-[11px] font-bold text-muted hover:text-text transition-colors">
                 Share with peers
               </button>
            </div>
            <span className="text-[10px] text-muted font-medium">Recorded today, 14:30 - 16:04 (94 mins)</span>
          </div>
        </div>

        {/* Poll Results */}
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-text flex items-center space-x-2">
            <BarChart3 size={16} className="text-cyan" />
            <span>Session Poll Results</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg border border-line rounded-xl p-4 space-y-3">
               <p className="text-[11px] font-bold text-text">Which React version are you currently using in production?</p>
               <div className="space-y-2">
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] mb-1 text-muted"><span>React 17 or older</span><span>15%</span></div>
                   <div className="w-full bg-line h-1.5 rounded-full overflow-hidden"><div className="bg-muted h-full w-[15%]" /></div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] mb-1 text-cyan font-bold"><span>React 18</span><span>75%</span></div>
                   <div className="w-full bg-line h-1.5 rounded-full overflow-hidden"><div className="bg-cyan h-full w-[75%]" /></div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] mb-1 text-muted"><span>React 19 (Alpha/Beta)</span><span>10%</span></div>
                   <div className="w-full bg-line h-1.5 rounded-full overflow-hidden"><div className="bg-muted h-full w-[10%]" /></div>
                 </div>
               </div>
            </div>
            
            <div className="bg-bg border border-line rounded-xl p-4 space-y-3">
               <p className="text-[11px] font-bold text-text">Have you used Server Actions before?</p>
               <div className="space-y-2">
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] mb-1 text-cyan font-bold"><span>Yes</span><span>62%</span></div>
                   <div className="w-full bg-line h-1.5 rounded-full overflow-hidden"><div className="bg-cyan h-full w-[62%]" /></div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] mb-1 text-muted"><span>No</span><span>38%</span></div>
                   <div className="w-full bg-line h-1.5 rounded-full overflow-hidden"><div className="bg-muted h-full w-[38%]" /></div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* AI Notes */}
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center space-x-2">
              <Sparkles size={16} className="text-purple" />
              <span>AI-Generated Key Takeaways</span>
            </h3>
            <button className="text-[10px] font-bold text-cyan flex items-center space-x-1">
              <Download size={12} />
              <span>Export Notes</span>
            </button>
          </div>
          <div className="space-y-4">
            {data.notes.map((note: string, i: number) => (
              <div key={i} className="flex space-x-4 py-3 border-b border-line/30 last:border-0">
                <div className="w-6 h-6 rounded-lg bg-purple/10 flex items-center justify-center text-purple text-xs shrink-0">{i+1}</div>
                <p className="text-xs text-text/90 leading-relaxed font-medium">{note}</p>
              </div>
            ))}
          </div>
          <div className="bg-panel2 rounded-xl p-4 border border-line flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center text-muted">
                  <BarChart3 size={16} />
                </div>
                <div>
                   <div className="text-[11px] font-bold text-text">Overall Participation Score</div>
                   <div className="text-[10px] text-muted">Top 5% of this session</div>
                </div>
             </div>
             <div className="text-xl font-bold text-green">+450 XP</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
          <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest">Follow-up Assignments</h3>
          <div className="space-y-3">
             {data.assignments.map((task: any) => (
               <div key={task.id} className="group bg-bg border border-line rounded-xl p-4 space-y-3 hover:border-cyan/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Project {task.id}</span>
                    <span className="w-2 h-2 rounded-full bg-yellow shadow-[0_0_8px_var(--yellow)]" />
                  </div>
                  <p className="text-xs font-bold text-text group-hover:text-cyan transition-colors">{task.title}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-muted">Due in 3 days</span>
                    <ArrowRight size={14} className="text-muted" />
                  </div>
               </div>
             ))}
          </div>
          <button className="w-full bg-cyan text-bg text-[11px] font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_var(--cyan)]/10 hover:shadow-[0_0_20px_var(--cyan)]/20">
             Submit All Deliverables
          </button>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
           <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest">Trainer Support</h3>
           <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <img src={data.trainer.avatar} className="w-10 h-10 rounded-lg object-cover" alt="" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green border-2 border-panel rounded-full" />
              </div>
              <div>
                 <div className="text-[11px] font-bold text-text">Trainer is available</div>
                 <div className="text-[10px] text-muted">Office hours: Tue @ 17:00</div>
              </div>
           </div>
           <div className="flex flex-col space-y-2">
              <button 
                onClick={onContactTrainer}
                className="w-full bg-line/50 hover:bg-line text-text text-[10px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare size={14} />
                <span>Message Dr. Sarah</span>
              </button>
              <button className="w-full bg-line/50 hover:bg-line text-text text-[10px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 italic">
                <Calendar size={14} />
                <span>Book 15min Slot</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

const TrainerDirectView: React.FC<{ 
  trainer: any, 
  onBack: () => void 
}> = ({ trainer, onBack }) => {
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1', sender: 'trainer', text: "Hi Alex! Thanks for the questions about the Performance module. I've sent you some additional reading materials over email, but let me know if you want to discuss the memoization part here.", time: "Jun 12, 10:15 AM", type: 'text'
    },
    {
      id: '2', sender: 'user', text: "Thanks Dr. Sarah! I'm particularly interested in how useMemo compares to using fixed constants outside the component for purely static lists. Does the check itself have a meaningful overhead?", time: "Jun 12, 11:20 AM", type: 'text', read: true
    },
    {
      id: '3', sender: 'trainer', text: "Exactly! Fixed constants are always better if the data is truly static. The document above shows the micro-benchmarks for the dependency array check. It's negligible but worth understanding!", time: "Jun 12, 11:45 AM", type: 'resource'
    }
  ]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: generateId(),
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    
    // Simulate trainer response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: 'trainer',
        text: "That's a great question! Let's explore that further in our next session.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      }]);
    }, 1500);
  };

  // Lock scroll only for this view
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="h-[85vh] min-h-[750px] max-h-[100vh] md:max-h-[90vh] max-md:h-[calc(100dvh-64px)] flex flex-col bg-bg border border-line rounded-2xl max-md:rounded-none max-md:border-none max-md:-mx-3 max-md:-mt-6 max-md:-mb-12 overflow-hidden animate-cel-reveal relative shadow-sm md:mb-12 mb-0">
      {/* Combined Mobile Header (matches AI Tutor style) */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-line bg-panel/50 backdrop-blur-md z-20 shrink-0 gap-2">
        <div className="flex items-center space-x-1 shrink-0">
          <button onClick={onBack} className="p-1.5 text-muted hover:text-cyan transition-all">
            <ArrowRight className="rotate-180" size={18} />
          </button>
          <div className="w-px h-4 bg-line mx-1" />
          <div className="flex items-center space-x-2">
            <img src={trainer.avatar} className="w-6 h-6 rounded-lg object-cover" alt="" />
            <h2 className="font-bold text-[11px] text-text truncate max-w-[100px]">{trainer.name}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-muted hover:text-cyan transition-all"><Star size={16} /></button>
          <button className="p-1.5 text-muted hover:text-cyan transition-all"><Info size={16} /></button>
        </div>
      </div>

      {/* Desktop Header (Preserved) */}
      <div className="hidden md:flex px-6 py-4 border-b border-line bg-panel/50 items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-line rounded-lg text-muted transition-colors">
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <div className="flex items-center space-x-3">
             <div className="relative">
                <img src={trainer.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green border-2 border-panel rounded-full shadow-[0_0_5px_rgba(43,222,126,0.5)]" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-text">{trainer.name}</h3>
                <div className="text-[10px] text-muted">Usually responds in 4 hours • {trainer.status}</div>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button className="p-2 text-muted hover:text-cyan transition-colors"><Star size={18} /></button>
           <button className="p-2 text-muted hover:text-cyan transition-colors"><Info size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center">
           <span className="px-3 py-1 bg-panel border border-line rounded-full text-[9px] font-bold text-muted uppercase tracking-widest">Conversation Started 2 weeks ago</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[65%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-cyan text-bg rounded-tr-none' : 'bg-panel border border-line rounded-tl-none'}`}>
              {msg.type === 'resource' && (
                <div className="flex items-center space-x-3 mb-3 bg-bg/50 p-2 rounded-xl">
                   <div className="w-8 h-8 bg-purple/20 text-purple rounded-lg flex items-center justify-center"><BookOpen size={16} /></div>
                   <div>
                      <div className="text-[10px] font-bold text-text">Resource: Overhead Analysis</div>
                      <div className="text-[9px] text-muted">PDF Document • 4.2 MB</div>
                   </div>
                </div>
              )}
              <p className={`text-xs leading-relaxed ${msg.sender === 'user' ? 'font-medium text-bg' : 'text-text'}`}>{msg.text}</p>
              <div className={`mt-2 text-[9px] ${msg.sender === 'user' ? 'text-bg/60' : 'text-muted'}`}>
                {msg.time} {msg.read && '• Read'}
              </div>
            </div>
          </div>
        ))}


        <div className={`max-w-[80%] md:max-w-[65%] transition-all duration-500 overflow-hidden ${isAnswerExpanded ? 'bg-purple/10 border-purple/40 ring-1 ring-purple/20' : 'bg-purple/5 border-purple/20'} border rounded-2xl p-4 flex flex-col space-y-3 relative`}>
           <div className="flex items-start space-x-3">
             <Bot size={18} className="text-purple shrink-0 mt-1" />
             <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-purple uppercase tracking-widest">AI Pre-screening ACTIVE</span>
                    <div className="px-2 py-0.5 bg-purple/10 rounded text-[9px] text-purple">Opt-in Enabled</div>
                  </div>
                  {isAnswerExpanded && (
                    <button onClick={() => setIsAnswerExpanded(false)} className="text-[10px] font-bold text-muted hover:text-purple transition-colors flex items-center space-x-1">
                      <ChevronRight size={12} className="rotate-90" />
                      <span>Collapse</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-text/80 italic leading-relaxed">Alex, I detected you might be wanting to ask about React 19's 'use' hook for data fetching. Dr. Sarah has already covered this in a 'Answer for Cohort' post. Would you like to read that before sending your message?</p>
                
                {isAnswerExpanded && (
                  <div className="mt-4 p-4 bg-bg/60 rounded-xl border border-purple/20 space-y-3 animate-slide-up">
                    <div className="text-[10px] font-bold text-purple uppercase tracking-widest border-b border-purple/10 pb-2">Cohort Answer: Data Fetching React 19</div>
                    <p className="text-xs text-text/110 leading-relaxed">
                      For data fetching, React 19 introduces the <code className="bg-purple/10 px-1 rounded text-purple">use</code> hook. Unlike existing hooks, <code className="bg-purple/10 px-1 rounded text-purple">use</code> can be called within loops and conditional statements. Sarah recommends this pattern for fetching shared configuration data that avoids redundant network requests.
                    </p>
                    <div className="flex items-center space-x-2 pt-2 text-[10px] text-muted italic">
                      <Users size={12} />
                      <span>32 other learners found this helpful</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                   <button 
                    onClick={() => setIsAnswerExpanded(!isAnswerExpanded)}
                    className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${
                      isAnswerExpanded 
                        ? 'bg-purple text-white border-purple' 
                        : 'text-purple border-purple/30 hover:border-purple hover:bg-purple/5'
                    }`}
                   >
                    {isAnswerExpanded ? 'Check other resources' : 'View Cohort Answer'}
                   </button>
                   
                   <button onClick={handleSendMessage} className="text-[10px] font-bold px-3 py-1 bg-cyan/10 text-cyan border border-cyan/30 rounded-lg hover:bg-cyan hover:text-bg hover:border-cyan transition-all">
                     Send to Trainer anyway
                   </button>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-transparent border-t border-line/30">
         <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 bg-panel rounded-full px-4 py-1.5 transition-all focus-within:shadow-[0_0_20px_rgba(0,245,228,0.05)] border border-line/50">
               <button className="p-2 text-muted hover:text-cyan transition-colors shrink-0">
                  <Plus size={20} />
               </button>
               
               <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask a question or share progress..."
                  rows={1}
                  className="flex-1 bg-transparent border-none text-xs py-3 text-text !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 resize-none min-h-[44px] max-h-[120px]"
               />
               
               <div className="flex items-center space-x-2 shrink-0">
                  <button className="p-2 text-muted hover:text-cyan transition-colors">
                     <Mail size={20} />
                  </button>
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg ${
                      chatInput.trim() 
                        ? 'bg-cyan text-bg scale-100 shadow-cyan/20' 
                        : 'bg-line/20 text-muted/40 scale-95 opacity-50'
                    }`}
                  >
                     <ArrowUp size={20} />
                  </button>
               </div>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-muted/80 italic flex items-center justify-center space-x-1 font-medium">
                 <ShieldCheck size={12} className="text-cyan/60" />
                 <span>This conversation is private between you and your trainer.</span>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
