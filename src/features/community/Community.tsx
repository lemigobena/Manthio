import React, { useState, useEffect, useRef } from 'react';
import { FORUM_CHANNELS, COURSES } from '../../services/mockData';
import { useXP } from '../../context/XPContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MessageSquare, ArrowUp, ArrowDown, Check, Sparkles, Send, Hash, X, MessageCircle, ChevronRight, PanelLeft, PanelLeftClose, PanelRightClose, Code, Image as ImageIcon, ArrowLeft, Bell, BellOff } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ForumChannel, ChannelMessage, ForumReply } from '../../types';

interface CommunityProps {
  onNavigate?: (page: string) => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

export const Community: React.FC<CommunityProps> = () => {
  const { resolvedTheme } = useTheme();
  const { addXp, addToast } = useXP();
  const { user } = useAuth();
  const [channels, setChannels] = useState<ForumChannel[]>(FORUM_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [showCodeLangMenu, setShowCodeLangMenu] = useState(false);
  const [showReplyCodeLangMenu, setShowReplyCodeLangMenu] = useState(false);
  const codeLangs = [
    'javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql',
    'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'dart', 'scala', 'r', 'markdown', 'yaml', 'xml', 'graphql', 'dockerfile'
  ];

  const feedEndRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const prevChannelIdRef = useRef<string | null>(null);
  const prevThreadIdRef = useRef<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  
  const handleLanguageSelect = (lang: string) => {
    setNewThreadBody(prev => prev + (prev.length > 0 ? '\n' : '') + `\`\`\`${lang}\n// Your ${lang} code here\n\`\`\`\n`);
    setShowCodeLangMenu(false);
  };

  const handleReplyLanguageSelect = (lang: string) => {
    setReplyInput(prev => prev + (prev.length > 0 ? '\n' : '') + `\`\`\`${lang}\n// Your ${lang} code here\n\`\`\`\n`);
    setShowReplyCodeLangMenu(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewThreadBody(prev => prev + (prev.length > 0 ? '\n' : '') + `![${file.name}](${url})\n`);
      addToast('success', 'Image attached to your message');
    }
  };

  const handleReplyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReplyInput(prev => prev + (prev.length > 0 ? '\n' : '') + `![${file.name}](${url})\n`);
      addToast('success', 'Image attached to your message');
    }
  };

  const renderBody = (body: string) => {
    // Split by code blocks first
    const codeSegments = body.split(/(```[\s\S]*?```)/g);
    const isDark = resolvedTheme === 'dark';
    
    return codeSegments.map((segment, idx) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const match = segment.match(/^```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```$/);
        const language = match && match[1] ? match[1] : 'javascript';
        const codeContent = match && match[2] ? match[2].replace(/\n$/, '') : segment.slice(3, -3).replace(/^\n/, '');
        
        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border border-line/50 shadow-sm">
            <div className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider border-b border-line/20 flex items-center justify-between" style={{ backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5', color: isDark ? '#7A8FA0' : '#6E6650' }}>
              <span>{language}</span>
            </div>
            <SyntaxHighlighter
              language={language}
              style={isDark ? vscDarkPlus : vs}
              customStyle={{ margin: 0, padding: '1rem', background: isDark ? '#1E1E1E' : '#F5F5F5', fontSize: '13px' }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // For non-code segments, split by image tags
      const imgSegments = segment.split(/(!\[.*?\]\(.*?\))/g);
      return imgSegments.map((imgSeg, i2) => {
        const imgMatch = imgSeg.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          return (
            <img 
              key={`${idx}-${i2}`} 
              src={imgMatch[2]} 
              alt={imgMatch[1]} 
              className="max-w-full sm:max-w-sm max-h-64 object-cover rounded-xl mt-2 mb-2 border border-line" 
            />
          );
        }
        return <span key={`${idx}-${i2}`}>{imgSeg}</span>;
      });
    });
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeThread = activeChannel?.messages.find(m => m.id === activeThreadId);

  // Scroll behavior for channels
  useEffect(() => {
    if (prevChannelIdRef.current !== activeChannelId) {
      // Navigated to a new channel -> scroll to top
      if (feedScrollRef.current) feedScrollRef.current.scrollTop = 0;
      prevChannelIdRef.current = activeChannelId;
    } else {
      // Same channel, messages changed -> scroll to bottom
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChannelId, activeChannel?.messages.length]);

  // Scroll behavior for threads
  useEffect(() => {
    if (prevThreadIdRef.current !== activeThreadId) {
      // Navigated to a new thread -> scroll to top
      if (threadScrollRef.current) threadScrollRef.current.scrollTop = 0;
      prevThreadIdRef.current = activeThreadId;
    } else {
      // Same thread, replies changed -> scroll to bottom
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, activeThread?.replies.length]);

  const getDateGroup = (timestamp: string) => {
    if (timestamp.includes('ago') || timestamp.includes('AM') || timestamp.includes('PM') || /^\d{1,2}:\d{2}/.test(timestamp)) return 'Today';
    if (timestamp.toLowerCase().includes('yesterday')) return 'Yesterday';
    return timestamp.split(',')[0].trim();
  };

  // Simulate AI Tutor auto-answer (5 seconds)
  useEffect(() => {
    if (!activeChannel) return;
    
    // Check if the latest message was posted by the user, and has no replies
    const latestMessage = activeChannel.messages[activeChannel.messages.length - 1];
    
    if (latestMessage && latestMessage.author === (user?.name || 'Alex Chen') && latestMessage.replies.length === 0 && !latestMessage.hasAcceptedAnswer) {
      const timer = setTimeout(() => {
        setChannels(prev => prev.map(ch => {
          if (ch.id !== activeChannelId) return ch;
          return {
            ...ch,
            messages: ch.messages.map(msg => {
              if (msg.id !== latestMessage.id) return msg;
              return {
                ...msg,
                replies: [...msg.replies, {
                  id: generateId(),
                  author: 'AI Tutor',
                  body: `Socratic assistance: Based on your question about "${latestMessage.title}", have you considered reviewing the core documentation for this topic? Often, the solution lies in understanding the base paradigm. What specific part is causing the error?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  upvotes: 0,
                  isAiSuggested: true
                }]
              };
            })
          };
        }));
        addToast('info', 'AI Tutor has suggested an answer!');
      }, 5000); // 5s delay for testing
      
      return () => clearTimeout(timer);
    }
  }, [activeChannelId, channels, activeChannel, user?.name, addToast]);

  const handlePostThread = () => {
    if (!newThreadBody.trim()) return;
    const finalTitle = newThreadTitle.trim() || `Question ${activeChannel ? activeChannel.messages.length + 1 : 1}`;
    const newMsg: ChannelMessage = {
      id: generateId(),
      title: finalTitle,
      author: user?.name || 'Alex Chen',
      body: newThreadBody,
      category: activeChannel?.name || 'General',
      upvotes: 1,
      replies: [],
      hasAcceptedAnswer: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return { ...ch, messages: [...ch.messages, newMsg] };
    }));
    
    setNewThreadTitle('');
    setNewThreadBody('');
    addXp(25, 'Community thread created');
    addToast('success', '+25 XP — Community thread created!');
  };

  const handlePostReply = () => {
    if (!replyInput.trim() || !activeThreadId) return;
    const newRep: ForumReply = {
      id: generateId(),
      author: user?.name || 'Alex Chen',
      body: replyInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upvotes: 1
    };

    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return {
        ...ch,
        messages: ch.messages.map(msg => {
          if (msg.id !== activeThreadId) return msg;
          return { ...msg, replies: [...msg.replies, newRep] };
        })
      };
    }));
    
    setReplyInput('');
    addXp(10, 'Forum reply posted');
    addToast('success', '+10 XP — Reply posted!');
  };

  const handleUpvoteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return {
        ...ch,
        messages: ch.messages.map(msg => {
          if (msg.id !== threadId) return msg;
          return { ...msg, upvotes: msg.upvotes + 1 };
        })
      };
    }));
  };

  const handleDownvoteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return {
        ...ch,
        messages: ch.messages.map(msg => {
          if (msg.id !== threadId) return msg;
          return { ...msg, upvotes: msg.upvotes - 1 };
        })
      };
    }));
  };

  const handleUpvoteReply = (replyId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return {
        ...ch,
        messages: ch.messages.map(msg => {
          if (msg.id !== activeThreadId) return msg;
          return {
            ...msg,
            replies: msg.replies.map(rep => {
              if (rep.id !== replyId) return rep;
              return { ...rep, upvotes: rep.upvotes + 1 };
            })
          };
        })
      };
    }));
  };

  const handleDownvoteReply = (replyId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return {
        ...ch,
        messages: ch.messages.map(msg => {
          if (msg.id !== activeThreadId) return msg;
          return {
            ...msg,
            replies: msg.replies.map(rep => {
              if (rep.id !== replyId) return rep;
              return { ...rep, upvotes: rep.upvotes - 1 };
            })
          };
        })
      };
    }));
  };

  const handleMarkAccepted = (replyId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== activeChannelId) return ch;
      return {
        ...ch,
        messages: ch.messages.map(msg => {
          if (msg.id !== activeThreadId) return msg;
          return {
            ...msg,
            hasAcceptedAnswer: true,
            replies: msg.replies.map(rep => {
              if (rep.id !== replyId) return { ...rep, isAcceptedAnswer: false };
              return { ...rep, isAcceptedAnswer: true };
            })
          };
        })
      };
    }));
    addXp(15, 'Accepted answer marked');
    addToast('success', 'Answer accepted! +15 XP');
  };

  const toggleMuteChannel = (channelId: string) => {
    setMutedChannels(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
    const isMuted = !mutedChannels.has(channelId);
    addToast('info', isMuted ? `Muted notifications for #${activeChannel?.name}` : `Unmuted notifications for #${activeChannel?.name}`);
  };

  return (
    <div className="relative flex h-[calc(100dvh-64px)] -mx-3 md:-mx-[44px] -my-6 border-y border-line overflow-hidden bg-bg">
      {/* 1. Sidebar (Channels) */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : `-translate-x-full ${activeThreadId ? 'min-[1400px]:translate-x-0' : 'md:translate-x-0'}`}
        absolute ${activeThreadId ? 'min-[1400px]:relative' : 'md:relative'} z-20 w-64 h-full bg-panel border-r border-line flex flex-col transition-transform duration-300
      `}>
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="font-bold text-text">Workspace</h2>
          <button className={`${activeThreadId ? 'min-[1400px]:hidden' : 'md:hidden'} text-muted hover:text-text`} onClick={() => setIsSidebarOpen(false)}>
            <PanelLeftClose size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-[10px] font-bold text-muted uppercase tracking-wider">Channels</div>
          <div className="space-y-0.5 px-2">
            {channels.map(channel => {
              const course = COURSES.find(c => c.id === channel.courseId);
              const imageUrl = course?.imageUrl || 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=100&h=100';
              return (
                <button
                  key={channel.id}
                  onClick={() => { setActiveChannelId(channel.id); setActiveThreadId(null); setSelectedTag(null); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center space-x-3 text-sm transition-colors ${
                    activeChannelId === channel.id ? 'bg-cyan/10 text-cyan font-bold' : 'text-muted hover:text-cyan'
                  }`}
                >
                  <img src={imageUrl} alt={channel.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className={`${activeThreadId ? 'min-[1400px]:hidden' : 'md:hidden'} fixed inset-0 z-10 bg-bg/80 backdrop-blur-sm`} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 2. Main Feed (Channel Messages) */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeThreadId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="h-14 border-b border-line flex items-center px-4 justify-between bg-bg/50 backdrop-blur-md shrink-0 relative gap-4">
          <div className="flex items-center space-x-3 min-w-0 shrink-0">
            <button className={`${activeThreadId ? 'min-[1400px]:hidden' : 'md:hidden'} text-muted hover:text-text shrink-0`} onClick={() => setIsSidebarOpen(true)}>
              <PanelLeft size={20} />
            </button>
            <div className="font-bold text-text flex items-center gap-2 whitespace-nowrap">
              <div className="flex items-center space-x-1">
                <Hash size={18} className="text-muted shrink-0" />
                <span>{activeChannel?.name}</span>
              </div>
              {selectedTag && (
                <div className="flex items-center space-x-1 px-2 py-0.5 text-xs bg-cyan/10 border border-cyan/30 text-cyan rounded-md shrink-0">
                  <span>#{selectedTag}</span>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 min-w-0 flex-1 justify-end">
            <div className="text-xs text-muted truncate hidden sm:block text-right flex-1 min-w-0">
              {activeChannel?.description}
            </div>
            {activeChannel && (
              <button
                onClick={() => toggleMuteChannel(activeChannel.id)}
                className={`flex items-center justify-center sm:space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  mutedChannels.has(activeChannel.id)
                    ? 'bg-red/10 text-red border-red/20 hover:bg-red/20'
                    : 'bg-bg text-muted border-line hover:border-cyan/40 hover:text-cyan'
                }`}
                title={mutedChannels.has(activeChannel.id) ? "Unmute channel" : "Mute channel notifications"}
              >
                {mutedChannels.has(activeChannel.id) ? <BellOff size={14} /> : <Bell size={14} />}
                <span className="hidden sm:inline">{mutedChannels.has(activeChannel.id) ? 'Muted' : 'Mute'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={feedScrollRef}>
          {activeChannel?.messages
            .filter(msg => !selectedTag || msg.tags?.includes(selectedTag))
            .map((msg, index) => {
              const currentDate = getDateGroup(msg.timestamp);
              const prevMessage = activeChannel.messages[index - 1];
              const showDateHeader = index === 0 || getDateGroup(prevMessage.timestamp) !== currentDate;

              return (
                <React.Fragment key={msg.id}>
                  {showDateHeader && (
                    <div className="flex items-center space-x-4 my-6">
                      <div className="h-px bg-line flex-1" />
                      <span className="text-[10px] font-bold text-cyan capitalize tracking-wider">{currentDate}</span>
                      <div className="h-px bg-line flex-1" />
                    </div>
                  )}
                  <div 
                    onClick={() => setActiveThreadId(msg.id)}
                    className={`flex space-x-3 group cursor-pointer p-3 -mx-3 rounded-xl transition-all duration-200 ${
                      activeThreadId === msg.id 
                        ? 'bg-cyan/5 border border-cyan/20 shadow-sm' 
                        : 'hover:bg-panel/40 border border-transparent hover:shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center shrink-0 text-purple font-bold">
                      {msg.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold text-text text-sm">{msg.author}</span>
                        <span className="text-[10px] text-muted">{msg.timestamp}</span>
                      </div>
                      <div className="mt-1">
                        <h4 className="font-bold text-text text-base">{msg.title}</h4>
                        <div className="text-text/90 text-sm mt-1 whitespace-pre-wrap">{renderBody(msg.body)}</div>
                      </div>
                      
                      {msg.tags && msg.tags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1.5 mt-2">
                          {msg.tags.map(tag => (
                            <button 
                              key={tag} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag === selectedTag ? null : tag);
                              }}
                              className={`text-[10px] bg-transparent border transition-colors cursor-pointer px-2 py-0.5 rounded-md ${
                                selectedTag === tag 
                                  ? 'border-cyan bg-cyan/10 text-cyan font-semibold' 
                                  : 'border-cyan/30 text-cyan hover:border-cyan hover:bg-cyan/5'
                              }`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-3 mt-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-muted text-sm font-bold min-w-[20px] text-center">{msg.upvotes}</span>
                          <div className="flex items-center space-x-2 rounded-lg p-0.5">
                            <button 
                              onClick={(e) => handleUpvoteThread(msg.id, e)}
                              className="bg-line/20 p-1.5 text-muted hover:text-cyan hover:bg-cyan/10 rounded-md transition-colors cursor-pointer"
                              title="Helpful"
                            >
                              <ArrowUp size={18} />
                            </button>
                            <button 
                              onClick={(e) => handleDownvoteThread(msg.id, e)}
                              className="bg-line/20 p-1.5 text-muted hover:text-red hover:bg-red/10 rounded-md transition-colors cursor-pointer"
                              title="Not Helpful"
                            >
                              <ArrowDown size={18} />
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveThreadId(msg.id); }}
                          className="flex items-center space-x-1 text-muted hover:text-purple text-xs font-semibold px-2 py-1 rounded hover:bg-purple/10 transition-colors cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          <span>{msg.replies.length} replies</span>
                        </button>
                        {msg.hasAcceptedAnswer && (
                          <div className="flex items-center space-x-1 text-green text-[10px] font-bold px-2 py-1 rounded bg-green/10 border border-green/20">
                            <Check size={12} strokeWidth={3} />
                            <span>Solved</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Inline reply preview if it has replies but thread is closed */}
                      {msg.replies.length > 0 && activeThreadId !== msg.id && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); setActiveThreadId(msg.id); }}
                          className="mt-2 flex items-center space-x-2 text-xs text-cyan cursor-pointer group"
                        >
                          <div className="w-6 h-6 rounded-md bg-cyan/20 flex items-center justify-center text-cyan shrink-0">
                            <MessageCircle size={12} />
                          </div>
                          <span className="font-semibold hidden sm:inline">{msg.replies.length} replies</span>
                          <span className="text-muted group-hover:underline decoration-cyan">Last reply from {msg.replies[msg.replies.length - 1].author}</span>
                          <ChevronRight size={14} className="text-muted" />
                        </div>
                      )}
              </div>
            </div>
            {index < activeChannel.messages.length - 1 && (
              <div className="h-px bg-line/40 mt-2" />
            )}
            </React.Fragment>
          );
        })}
          <div ref={feedEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-bg border-t border-line shrink-0">
          <div className="bg-panel border border-line rounded-xl focus-within:border-cyan transition-colors overflow-hidden">
            <div className="px-3 py-2">
              <input 
                type="text"
                placeholder="Question Title (Optional)"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-text !outline-none border-none focus:ring-0 focus:outline-none placeholder:font-normal"
              />
            </div>
            <div className="px-3 py-2 border-t border-line/50">
              <textarea 
                placeholder={`Ask the community in #${activeChannel?.name}...`}
                value={newThreadBody}
                onChange={(e) => setNewThreadBody(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-sm text-text !outline-none border-none focus:ring-0 focus:outline-none resize-none"
              />
            </div>
            <div className="bg-line/20 px-3 py-2 flex items-center justify-between border-t border-line/50">
              <div className="flex items-center space-x-2 text-muted relative">
                <button onClick={() => setShowCodeLangMenu(!showCodeLangMenu)} className="p-1.5 hover:bg-line hover:text-cyan rounded-lg transition-colors" title="Insert Code Snippet"><Code size={16} /></button>
                {showCodeLangMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-panel border border-line rounded-xl shadow-lg shadow-black/50 overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-line text-[10px] font-bold text-muted uppercase tracking-wider">Select Language</div>
                    <div className="max-h-48 overflow-y-auto">
                      {codeLangs.map(lang => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageSelect(lang)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-line hover:text-cyan transition-colors"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-line hover:text-cyan rounded-lg transition-colors" title="Upload Image"><ImageIcon size={16} /></button>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>
              <button 
                onClick={handlePostThread}
                disabled={!newThreadBody.trim()}
                className="bg-cyan hover:bg-cyan2 text-bg px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Send size={14} />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Thread Pane (Right) */}
      {activeThread && (
        <div className="absolute lg:relative inset-0 lg:inset-auto z-30 lg:z-auto w-full lg:w-[400px] xl:w-[450px] bg-panel border-l border-line flex flex-col shrink-0 animate-slide-in-right">
          <div className="h-14 border-b border-line flex items-center px-4 justify-between bg-bg/50 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-2">
              <button 
                className="lg:hidden p-1 -ml-1 text-muted hover:text-text rounded-lg hover:bg-line transition-colors mr-1" 
                onClick={() => setActiveThreadId(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <span className="font-bold text-text">Thread</span>
              <span className="text-xs font-normal text-muted bg-line px-2 py-0.5 rounded">#{activeChannel?.name}</span>
            </div>
            <button className="hidden lg:block p-2 text-muted hover:text-text rounded-lg hover:bg-line transition-colors" onClick={() => setActiveThreadId(null)}>
              <PanelRightClose size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" ref={threadScrollRef}>
            {/* Original Post */}
            <div className="p-5 border-b border-line">
              <div className="flex space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center shrink-0 text-purple font-bold">
                  {activeThread.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-bold text-text text-sm">{activeThread.author}</span>
                    <span className="text-[10px] text-muted">{activeThread.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-text text-base mt-1">{activeThread.title}</h4>
                  <div className="text-text/90 text-sm mt-2 whitespace-pre-wrap">{renderBody(activeThread.body)}</div>
                  {activeThread.tags && activeThread.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 mt-3">
                      {activeThread.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag === selectedTag ? null : tag);
                            if (window.innerWidth < 1024) {
                              setActiveThreadId(null);
                            }
                          }}
                          className={`text-[10px] bg-transparent border px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                            selectedTag === tag 
                              ? 'border-cyan bg-cyan/10 text-cyan font-semibold' 
                              : 'border-cyan/30 text-cyan hover:border-cyan hover:bg-cyan/5'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4 ml-13">
                <div className="flex items-center space-x-3">
                  <span className="text-muted text-sm font-bold min-w-[20px] text-center">{activeThread.upvotes}</span>
                  <div className="flex items-center space-x-2 rounded-lg p-0.5">
                    <button onClick={(e) => handleUpvoteThread(activeThread.id, e)} className="bg-line/20 p-1.5 text-muted hover:text-cyan hover:bg-cyan/10 rounded-md transition-colors" title="Helpful"><ArrowUp size={18} /></button>
                    <button onClick={(e) => handleDownvoteThread(activeThread.id, e)} className="bg-line/20 p-1.5 text-muted hover:text-red hover:bg-red/10 rounded-md transition-colors" title="Not Helpful"><ArrowDown size={18} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="p-5 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-px bg-line flex-1" />
                <span className="text-[10px] font-bold text-muted uppercase">{activeThread.replies.length} replies</span>
                <div className="h-px bg-line flex-1" />
              </div>

              {activeThread.replies.map(reply => (
                <div key={reply.id} className="flex space-x-3 relative group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${reply.isAiSuggested ? 'bg-purple text-bg' : 'bg-cyan/20 text-cyan'}`}>
                    {reply.isAiSuggested ? <Sparkles size={16} /> : reply.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-bold text-text text-sm">{reply.author}</span>
                      {reply.isAiSuggested && <span className="text-[9px] bg-purple/20 text-purple px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">AI</span>}
                      <span className="text-[10px] text-muted">{reply.timestamp}</span>
                    </div>
                    
                    <div className={`mt-1 text-sm p-3 rounded-xl border ${reply.isAcceptedAnswer ? 'bg-green/5 border-green/30 text-green-100' : reply.isAiSuggested ? 'bg-purple/5 border-purple/20 text-text/90' : 'bg-bg/50 border-line text-text/90'} whitespace-pre-wrap leading-relaxed`}>
                      {renderBody(reply.body)}
                    </div>

                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-muted text-sm font-bold min-w-[20px] text-center">{reply.upvotes}</span>
                        <div className="flex items-center space-x-2 rounded-lg p-0.5">
                          <button 
                            onClick={() => handleUpvoteReply(reply.id)}
                            className="bg-line/20 p-1.5 text-muted hover:text-cyan hover:bg-cyan/10 rounded-md transition-colors"
                            title="Helpful"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button 
                            onClick={() => handleDownvoteReply(reply.id)}
                            className="bg-line/20 p-1.5 text-muted hover:text-red hover:bg-red/10 rounded-md transition-colors"
                            title="Not Helpful"
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {reply.isAcceptedAnswer ? (
                        <div className="flex items-center space-x-1 text-green text-xs font-bold px-2 py-1">
                          <Check size={14} strokeWidth={3} />
                          <span>Accepted Answer</span>
                        </div>
                      ) : (
                        !activeThread.hasAcceptedAnswer && activeThread.author === user?.name && (
                          <button 
                            onClick={() => handleMarkAccepted(reply.id)}
                            className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 text-muted hover:text-green text-xs font-semibold px-2 py-1 rounded hover:bg-green/10 transition-all"
                          >
                            <Check size={12} />
                            <span>Mark accepted</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
          </div>

          {/* Reply Input */}
          <div className="p-4 bg-bg border-t border-line shrink-0">
            <div className="bg-panel border border-line rounded-xl focus-within:border-purple transition-colors overflow-hidden">
              <div className="px-3 py-2 border-line/50">
                <textarea 
                  placeholder={`Reply to ${activeThread.author}...`}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent text-sm text-text !outline-none border-none focus:ring-0 focus:outline-none resize-none max-h-32 overflow-y-auto"
                />
              </div>
              <div className="bg-line/20 px-3 py-2 flex items-center justify-between border-t border-line/50">
                <div className="flex items-center space-x-2 text-muted relative">
                  <button onClick={() => setShowReplyCodeLangMenu(!showReplyCodeLangMenu)} className="p-1.5 hover:bg-line hover:text-purple rounded-lg transition-colors" title="Insert Code Snippet"><Code size={16} /></button>
                  {showReplyCodeLangMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-panel border border-line rounded-xl shadow-lg shadow-black/50 overflow-hidden z-50">
                      <div className="px-3 py-2 border-b border-line text-[10px] font-bold text-muted uppercase tracking-wider">Select Language</div>
                      <div className="max-h-48 overflow-y-auto">
                        {codeLangs.map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleReplyLanguageSelect(lang)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-line hover:text-purple transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button onClick={() => replyFileInputRef.current?.click()} className="p-1.5 hover:bg-line hover:text-purple rounded-lg transition-colors" title="Upload Image"><ImageIcon size={16} /></button>
                  <input type="file" accept="image/*" className="hidden" ref={replyFileInputRef} onChange={handleReplyImageUpload} />
                </div>
                <button 
                  onClick={handlePostReply}
                  disabled={!replyInput.trim()}
                  className="bg-purple hover:bg-purple/90 text-bg px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shrink-0"
                >
                  <Send size={14} />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
