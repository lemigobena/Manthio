import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronRight, ChevronLeft } from 'lucide-react';
import { useXP } from '../../../context/XPContext';
import type { Lesson, ChatMessage } from '../../../types';

interface ToolsPaneProps {
  currentLesson: Lesson;
  isOpen: boolean;
}

export const ToolsPane: React.FC<ToolsPaneProps> = ({ currentLesson, isOpen }) => {
  const { addXp } = useXP();
  
  // REQ-PLAYER-012 AI Tutor tab opens by default if the lesson type is complex (code, math); Notes tab default otherwise.
  const isComplex = currentLesson.type === 'Code' || currentLesson.type === 'Assignment';
  const [activeTab, setActiveTab] = useState<'ai' | 'notes' | 'bookmarks' | 'resources'>(
    isComplex ? 'ai' : 'notes'
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'right' ? 150 : -150, behavior: 'smooth' });
    }
  };

  // AI chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 'm1', 
      sender: 'tutor', 
      text: `Hello! I am your AI Tutor. Feel free to ask me questions about "${currentLesson.title}"!`, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      source: 'Course docs' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Notes state
  const [noteText, setNoteText] = useState(() => {
    return localStorage.getItem(`note-${currentLesson.id}`) || '';
  });

  // Bookmarks state
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return localStorage.getItem(`bookmark-${currentLesson.id}`) === 'true';
  });

  // Reset state when lesson changes — this is a legitimate "sync from props" pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(
      (currentLesson.type === 'Code' || currentLesson.type === 'Assignment') ? 'ai' : 'notes'
    );
    setNoteText(localStorage.getItem(`note-${currentLesson.id}`) || '');
    setIsBookmarked(localStorage.getItem(`bookmark-${currentLesson.id}`) === 'true');

    const handleStorage = () => setIsBookmarked(localStorage.getItem(`bookmark-${currentLesson.id}`) === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentLesson.id, currentLesson.type]);

  const handleSaveNote = () => {
    localStorage.setItem(`note-${currentLesson.id}`, noteText);
  };

  const handleToggleBookmark = () => {
    const newValue = !isBookmarked;
    setIsBookmarked(newValue);
    localStorage.setItem(`bookmark-${currentLesson.id}`, String(newValue));
    window.dispatchEvent(new Event('storage'));
  };

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
      const replyText = `Good question about "${currentLesson.title}"! Let's look at it socratically. What do you think happens?`;

      const tutorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Course docs'
      };
      setChatMessages(prev => [...prev, tutorMsg]);
      addXp(10, 'Asked AI Tutor a question');
    }, 1500);
  };

  return (
    <div className={`bg-panel border-l border-line flex flex-col overflow-hidden shrink-0 transition-all absolute right-0 md:relative z-40 h-full ${
      isOpen 
        ? 'w-full md:w-[360px] opacity-100 pointer-events-auto' 
        : 'w-0 opacity-0 pointer-events-none md:w-0'
    }`}>
      {/* Header Tabs */}
      <div className="relative border-b border-line bg-bg/40 flex items-center shrink-0">
        
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 hidden md:flex justify-start items-center bg-gradient-to-r from-[#1a1d21] to-transparent pointer-events-none p-1.5 z-10">
            <span title="Scroll Left" className="pointer-events-auto">
              <button 
                onClick={() => scrollTabs('left')}
                className="p-1.5 rounded-lg bg-panel border border-line shadow-sm text-muted hover:text-cyan cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}

        <div 
          ref={scrollRef} 
          onScroll={checkScroll}
          className="flex overflow-x-auto scrollbar-hide p-1.5 gap-4 flex-1 scroll-smooth px-2"
        >
          {(['ai', 'notes', 'bookmarks', 'resources'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 text-[10px] font-bold rounded-lg uppercase transition-colors min-w-[80px] shrink-0 ${
                activeTab === tab ? 'bg-panel text-cyan border border-line shadow-sm' : 'bg-transparent text-muted hover:bg-bg/50 hover:text-text cursor-pointer'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 hidden md:flex justify-end items-center bg-gradient-to-l from-[#1a1d21] to-transparent pointer-events-none p-1.5 z-10">
            <span title="Scroll Right" className="pointer-events-auto">
              <button 
                onClick={() => scrollTabs('right')}
                className="p-1.5 rounded-lg bg-panel border border-line shadow-sm text-muted hover:text-cyan cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`space-y-1 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-cyan text-bg font-semibold rounded-tr-none' : 'bg-bg border border-line rounded-tl-none text-text shadow-sm'}`}>
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
                </div>
              ))}
              {isTyping && (
                <div className="text-[10px] text-muted flex items-center space-x-1.5 italic px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" />
                  <span>AI Tutor is responding...</span>
                </div>
              )}
            </div>

            {/* Input Chat Block */}
            <div className="pt-4 border-t border-line mt-4 flex items-center space-x-2 shrink-0">
              <input 
                type="text" 
                placeholder="Ask a question... (Cmd+K)" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-bg border border-line text-xs rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan shadow-inner"
                id="ai-tutor-input"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-cyan hover:bg-cyan2 text-bg p-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Personal notes for this lesson</label>
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={handleSaveNote}
                placeholder="Write important notes here. Markdown is supported. Auto-saves."
                className="flex-1 w-full p-4 bg-bg border border-line rounded-xl text-xs text-text focus:outline-none focus:border-cyan resize-none font-mono leading-relaxed"
              />
            </div>
          </div>
        )}



        {activeTab === 'bookmarks' && (
          <div className="space-y-4 flex flex-col h-full">
            {!isBookmarked ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-muted space-y-2">
                <span>No bookmarks saved for this lesson.</span>
                <button onClick={handleToggleBookmark} className="text-cyan font-bold hover:underline cursor-pointer">Add Bookmark</button>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                <div className="bg-bg border border-cyan/30 rounded-xl p-3 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">Lesson Bookmark</span>
                    <button onClick={handleToggleBookmark} className="text-[10px] text-red hover:underline cursor-pointer">Remove</button>
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed">
                    You have bookmarked this lesson. It will appear in your global bookmarks folder on your dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4 flex flex-col h-full">
            <div className="space-y-2">
              <div className="bg-bg border border-line rounded-xl p-3 flex justify-between items-center cursor-pointer hover:border-cyan transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text">Lesson Slides</span>
                  <span className="text-[10px] text-muted">PDF • 2.4 MB</span>
                </div>
                <span className="text-cyan font-bold text-xs uppercase">Download</span>
              </div>
              {currentLesson.type === 'Code' && (
                <div className="bg-bg border border-line rounded-xl p-3 flex justify-between items-center cursor-pointer hover:border-cyan transition-colors">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-text">Starter Code</span>
                     <span className="text-[10px] text-muted">ZIP • 14 KB</span>
                  </div>
                  <span className="text-cyan font-bold text-xs uppercase">Download</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
