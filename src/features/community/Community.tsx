import React, { useState } from 'react';
import { FORUM_THREADS } from '../../services/mockData';
import { useXP } from '../../context/XPContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ArrowUp, Check, Sparkles, Send, Plus, Search, AlertCircle } from 'lucide-react';
import type { ForumThread } from '../../types';

interface CommunityProps {
  onNavigate?: (page: string) => void;
}

export const Community: React.FC<CommunityProps> = () => {
  const { addXp, addToast } = useXP();
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>(FORUM_THREADS);
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  // Search & States (REQ-LOAD-001, REQ-LOAD-002, REQ-LOAD-004)
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Modals
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const simulateLoad = () => {
    setIsLoading(true);
    setIsError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return timer;
  };

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        addToast('success', 'Post rated.');
        return { ...t, upvotes: t.upvotes + 1 };
      }
      return t;
    }));
  };

  const handleCreateThread = () => {
    if (!newTitle.trim() || !newBody.trim()) return;

    const newThread: ForumThread = {
      id: Math.random().toString(),
      title: newTitle,
      author: user?.name || 'Alex Chen',
      body: newBody,
      category: 'Python Bootcamp',
      moduleName: 'General',
      upvotes: 1,
      commentsCount: 0,
      hasAcceptedAnswer: false,
      timestamp: 'Just now'
    };

    setThreads(prev => [newThread, ...prev]);
    setNewTitle('');
    setNewBody('');
    setNewThreadOpen(false);
    addXp(25, 'Community thread created');
    addToast('success', '+25 XP — Community thread created!');
  };

  // Filter threads by search query
  const filteredThreads = threads.filter(thread => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      thread.title.toLowerCase().includes(q) ||
      thread.body.toLowerCase().includes(q) ||
      thread.category.toLowerCase().includes(q) ||
      thread.author.toLowerCase().includes(q)
    );
  });  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Community & Forum</h1>
          <p className="text-muted text-sm mt-1">Ask questions, help classmates, and discuss course content.</p>
        </div>

        <div className="flex items-center space-x-3 self-start">
          {/* Search bar inside forum */}
          {!activeThread && (
            <div className="relative w-44 sm:w-56">
              <input 
                type="text" 
                placeholder="Search threads..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); simulateLoad(); }}
                className="w-full bg-panel border border-line rounded-xl pl-8 pr-3 py-2 text-xs text-text focus:outline-none focus:border-cyan transition-colors"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted" />
            </div>
          )}

          <button 
            onClick={() => setNewThreadOpen(true)}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ASK A QUESTION</span>
          </button>
        </div>
      </div>

      {isError ? (
        /* REQ-LOAD-004: Failed load show error state with retry action */
        <div className="text-center py-16 max-w-md mx-auto my-6 space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-bold text-text text-base">Failed to load forum threads</h3>
            <p className="text-muted text-xs max-w-xs mx-auto">We couldn't reach the forum database. Please check your connection and try again.</p>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : activeThread ? (
        // Thread Detail View
        <div className="space-y-6 max-w-3xl animate-[fadeIn_0.3s_ease-out]">
          <button 
            onClick={() => setActiveThread(null)}
            className="text-cyan hover:underline text-xs font-semibold cursor-pointer"
          >
            &larr; Back to forum
          </button>

          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-[10px] text-cyan font-bold uppercase tracking-wider bg-bg px-2 py-0.5 rounded border border-line">
                {activeThread.category} &bull; {activeThread.moduleName}
              </span>
              <h2 className="text-xl font-bold text-text mt-3">{activeThread.title}</h2>
              <span className="text-[10px] text-muted block mt-1">
                Posted by {activeThread.author} &bull; {activeThread.timestamp}
              </span>
            </div>

            <p className="text-sm text-text leading-relaxed bg-bg/20 p-4 rounded-xl border border-line">
              {activeThread.body}
            </p>

            <div className="flex items-center space-x-4 pt-2 border-t border-line text-xs text-muted">
              <span>{activeThread.upvotes} Upvotes</span>
              <span>{activeThread.commentsCount} Comments</span>
            </div>
          </div>

          {/* AI Auto-Answer simulation */}
          <div className="bg-panel/50 border border-purple/35 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-purple/5 to-transparent pointer-events-none" />
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple" />
              <span className="text-[10px] text-purple uppercase font-bold tracking-wider">AI Tutor Auto-Answer</span>
            </div>
            <p className="text-xs text-text leading-relaxed italic bg-bg/40 p-3.5 rounded-xl border border-line">
              Socratic assistance: To fix this PowerShell ExecutionPolicy error, you might need to adjust the policy for your local user. Open PowerShell as an administrator and enter `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. Do you know why PowerShell blocks scripts by default?
            </p>
          </div>

          {/* Add Reply Area */}
          <div className="bg-panel border border-line rounded-2xl p-4 flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Write a reply..." 
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              className="flex-1 bg-bg border border-line text-xs rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-cyan"
            />
            <button 
              onClick={() => {
                if (!replyInput.trim()) return;
                addXp(10, 'Forum reply posted');
                addToast('success', 'Reply successfully posted!');
                setReplyInput('');
              }}
              className="bg-cyan hover:bg-cyan2 text-bg p-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isLoading ? (
        /* REQ-LOAD-002: Skeleton loader mimicking horizontal thread cards */
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className="bg-panel border border-line rounded-xl p-5 flex items-start gap-4 justify-between animate-pulse"
            >
              <div className="space-y-3.5 flex-1">
                <div className="space-y-2.5">
                  <div className="h-4 bg-line rounded w-28" />
                  <div className="h-5 bg-line rounded w-1/2" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-line rounded w-full" />
                  <div className="h-3 bg-line rounded w-5/6" />
                </div>
                <div className="h-3 bg-line rounded w-36" />
              </div>
              <div className="w-10 h-12 bg-line rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredThreads.length === 0 ? (
        /* REQ-LOAD-001: Every list view has a defined empty state with primary action */
        <div className="text-center py-16 bg-panel border border-line rounded-2xl animate-[fadeIn_0.3s_ease-out]">
          <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="font-bold text-text text-base">No discussions found</h3>
          <p className="text-muted text-sm mt-1 max-w-sm mx-auto">No threads matched your search query. Try clearing the query or start a new topic.</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button 
              onClick={() => { setSearchQuery(''); simulateLoad(); }}
              className="bg-bg hover:bg-line border border-line text-text text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Clear Search
            </button>
            <button 
              onClick={() => setNewThreadOpen(true)}
              className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Ask a Question
            </button>
          </div>
        </div>
      ) : (
        // Threads List
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          {filteredThreads.map(thread => (
            <div 
              key={thread.id} 
              onClick={() => setActiveThread(thread)}
              className="bg-panel border border-line rounded-xl p-5 flex items-start gap-4 hover:border-cyan/50 transition-colors cursor-pointer justify-between"
            >
              <div className="space-y-2 flex-1">
                <div>
                  <span className="text-[9px] text-cyan font-bold uppercase tracking-wider bg-bg px-2 py-0.5 rounded border border-line">
                    {thread.category} &bull; {thread.moduleName}
                  </span>
                  <h3 className="font-bold text-base text-text mt-2 hover:text-cyan transition-colors line-clamp-1">
                    {thread.title}
                  </h3>
                </div>
                <p className="text-muted text-xs line-clamp-2 leading-relaxed">
                  {thread.body}
                </p>
                <span className="flex items-center space-x-4 pt-1 text-[10px] text-muted">
                  <span>Author: {thread.author}</span>
                  <span>{thread.timestamp}</span>
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{thread.commentsCount}</span>
                  </span>
                  {thread.hasAcceptedAnswer && (
                    <span className="text-green font-semibold flex items-center space-x-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Solved</span>
                    </span>
                  )}
                </span>
              </div>

              {/* Vote block */}
              <button 
                onClick={(e) => handleVote(thread.id, e)}
                className="bg-bg hover:bg-line border border-line px-3 py-2.5 rounded-xl text-center flex flex-col items-center justify-center space-y-1 hover:border-cyan/50 transition-colors cursor-pointer shrink-0"
              >
                <ArrowUp className="w-4 h-4 text-muted" />
                <span className="text-xs font-bold">{thread.upvotes}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Thread Modal */}
      {newThreadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm">
          <div className="bg-panel border border-line p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-text border-b border-line pb-3">Create new forum topic</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-muted font-bold uppercase">Question Title</label>
                <input 
                  type="text" 
                  placeholder="How do I use *args in functions?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan"
                />
              </div>
...
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-muted font-bold uppercase">Description</label>
                <textarea 
                  placeholder="Describe your question in detail. Code snippets can be inserted in Markdown format..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full h-32 bg-bg border border-line rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setNewThreadOpen(false)}
                className="flex-1 bg-bg hover:bg-line border border-line text-xs font-semibold py-2.5 rounded-lg text-center"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateThread}
                className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-lg text-center cursor-pointer"
              >
                Create (+25 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
