import React, { useState, useEffect } from 'react';
import { useXP } from '../../../context/XPContext';
import type { Lesson, ChatMessage } from '../../../types';
import { AITutorChat } from '../../ai-tutor/components/AITutorChat';
import { NotesTab } from './NotesTab';

interface ToolsPaneProps {
  currentLesson: Lesson;
  isOpen: boolean;
  initialTab?: string;
}

export const ToolsPane: React.FC<ToolsPaneProps> = ({ currentLesson, isOpen, initialTab }) => {
  const { addXp } = useXP();
  
  // REQ-PLAYER-012 AI Tutor tab opens by default if the lesson type is complex (code, math); Notes tab default otherwise.
  const isComplex = currentLesson.type === 'Code' || currentLesson.type === 'Assignment';
  const [activeTab, setActiveTab] = useState<'ai' | 'notes' | 'bookmarks' | 'resources'>(
    (initialTab as 'ai' | 'notes' | 'bookmarks' | 'resources') || (isComplex ? 'ai' : 'notes')
  );



  // AI chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      id: 'm1', 
      sender: 'tutor', 
      text: `Hello! I am your AI Tutor. Feel free to ask me questions about "${currentLesson.title}"!`, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      source: 'Course docs',
      sourceLink: '#/docs/tools-pane/intro'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Notes state (moved to NotesTab)

  // Bookmarks state
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return localStorage.getItem(`bookmark-${currentLesson.id}`) === 'true';
  });

  // Reset state when lesson changes — this is a legitimate "sync from props" pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(
      (initialTab as 'ai' | 'notes' | 'bookmarks' | 'resources') || ((currentLesson.type === 'Code' || currentLesson.type === 'Assignment') ? 'ai' : 'notes')
    );
    setIsBookmarked(localStorage.getItem(`bookmark-${currentLesson.id}`) === 'true');

    const handleStorage = () => setIsBookmarked(localStorage.getItem(`bookmark-${currentLesson.id}`) === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentLesson.id, currentLesson.type, initialTab]);


  const handleToggleBookmark = () => {
    const newValue = !isBookmarked;
    setIsBookmarked(newValue);
    localStorage.setItem(`bookmark-${currentLesson.id}`, String(newValue));
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const handleSandboxSubmit = (e: Event) => {
      const customEvent = e as CustomEvent<{code: string}>;
      setActiveTab('ai');
      
      const userMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'user',
        text: `Please review my sandbox submission:\n\n\`\`\`python\n${customEvent.detail.code}\n\`\`\``,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        const replyText = `Great job! Your script executed successfully. 🚀\n\n**Output:**\n\`\`\`text\nHello, World!\n\`\`\`\n\n**Test Cases:**\n✅ Should return "Hello, World!"\n✅ Should handle custom names (Hidden Test)\n\nExcellent work completing your first script! Let me know if you have any questions about how this worked.`;
        
        const tutorMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'tutor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Sandbox Evaluation'
        };
        setChatMessages(prev => [...prev, tutorMsg]);
      }, 2000);
    };

    window.addEventListener('sandbox_submit', handleSandboxSubmit);
    return () => window.removeEventListener('sandbox_submit', handleSandboxSubmit);
  }, []);

  const handleSendMessage = (textOverride?: string, forceCloud?: boolean) => {
    const text = textOverride || chatInput;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textOverride) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = forceCloud 
        ? `I searched the Cloud AI for you. "${currentLesson.title}" is an interesting topic.`
        : `Good question about "${currentLesson.title}"! Let's look at it socratically. What do you think happens?`;

      const tutorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: forceCloud ? 'Cloud AI' : 'Course docs',
        sourceLink: forceCloud ? undefined : '#/docs/course-docs/specific-topic'
      };
      setChatMessages(prev => [...prev, tutorMsg]);
      addXp(10, 'Asked AI Tutor a question');
    }, 1500);
  };

  const handleSaveToNotes = (text: string) => {
    const currentNote = localStorage.getItem(`note-${currentLesson.id}`) || '';
    const updatedNote = currentNote + (currentNote ? '\n\n' : '') + `> **AI Tutor:**\n> ${text.replace(/\n/g, '\n> ')}`;
    localStorage.setItem(`note-${currentLesson.id}`, updatedNote);
    window.dispatchEvent(new Event('noteUpdated'));
    setActiveTab('notes');
  };

  return (
    <div className={`bg-panel border-l border-line flex flex-col overflow-hidden shrink-0 transition-all absolute right-0 min-[1024px]:relative z-40 h-full ${
      isOpen 
        ? 'w-full md:w-[320px] opacity-100 pointer-events-auto shadow-2xl min-[1024px]:shadow-none' 
        : 'w-0 opacity-0 pointer-events-none min-[1024px]:w-0'
    }`}>
      {/* Header Tabs */}
      <div className="border-b border-line bg-bg/40 flex items-center shrink-0 w-full px-2 h-[44px]">
        <div className="grid grid-cols-4 gap-1 w-full">
          {(['ai', 'notes', 'bookmarks', 'resources'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-1 py-2 text-[10px] font-bold rounded-lg uppercase transition-colors w-full shrink-0 text-center ${
                activeTab === tab 
                  ? 'bg-cyan/10 text-cyan border border-cyan/30 shadow-sm' 
                  : 'bg-transparent text-muted hover:bg-cyan/5 hover:text-cyan cursor-pointer'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full -m-4">
            <AITutorChat
              messages={chatMessages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              suggestedPrompts={['Can you explain the main concept?', 'Give me a quiz on this']}
              embedded={true}
              onSaveToNotes={handleSaveToNotes}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesTab currentLesson={currentLesson} />
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
