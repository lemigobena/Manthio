import React, { useState } from 'react';
import { FORUM_THREADS } from '../../services/mockData';
import { useXP } from '../../context/XPContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ArrowUp, Check, Sparkles, Send, Plus } from 'lucide-react';
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
  
  // Modals
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        addToast('success', 'Beitrag bewertet.');
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
      timestamp: 'Gerade eben'
    };

    setThreads(prev => [newThread, ...prev]);
    setNewTitle('');
    setNewBody('');
    setNewThreadOpen(false);
    addXp(25, 'Community Thread erstellt');
    addToast('success', '+25 XP — Community Thread erstellt!');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Community & Forum</h1>
          <p className="text-muted text-sm mt-1">Stelle Fragen, hilf Kommilitonen und diskutiere Kursinhalte.</p>
        </div>

        <button 
          onClick={() => setNewThreadOpen(true)}
          className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>FRAGE STELLEN</span>
        </button>
      </div>

      {activeThread ? (
        // Thread Detail View
        <div className="space-y-6 max-w-3xl">
          <button 
            onClick={() => setActiveThread(null)}
            className="text-cyan hover:underline text-xs font-semibold"
          >
            &larr; Zurück zum Forum
          </button>

          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-[10px] text-cyan font-bold uppercase tracking-wider bg-bg px-2 py-0.5 rounded border border-line">
                {activeThread.category} &bull; {activeThread.moduleName}
              </span>
              <h2 className="text-xl font-bold text-text mt-3">{activeThread.title}</h2>
              <span className="text-[10px] text-muted block mt-1">
                Gepostet von {activeThread.author} &bull; {activeThread.timestamp}
              </span>
            </div>

            <p className="text-sm text-text leading-relaxed bg-bg/20 p-4 rounded-xl border border-line">
              {activeThread.body}
            </p>

            <div className="flex items-center space-x-4 pt-2 border-t border-line text-xs text-muted">
              <span>{activeThread.upvotes} Upvotes</span>
              <span>{activeThread.commentsCount} Kommentare</span>
            </div>
          </div>

          {/* AI Auto-Answer simulation */}
          <div className="bg-panel/50 border border-purple/35 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-purple/5 to-transparent pointer-events-none" />
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple" />
              <span className="text-[10px] text-purple uppercase font-bold tracking-wider">KI-Tutor Auto-Antwort</span>
            </div>
            <p className="text-xs text-text leading-relaxed italic bg-bg/40 p-3.5 rounded-xl border border-line">
              Sokratische Hilfestellung: Um diesen PowerShell ExecutionPolicy-Fehler zu beheben, musst du eventuell die Richtlinie für deinen lokalen Benutzer anpassen. Öffne die PowerShell als Administrator und gib `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` ein. Weißt du, warum PowerShell standardmäßig Skripte blockiert?
            </p>
          </div>

          {/* Add Reply Area */}
          <div className="bg-panel border border-line rounded-2xl p-4 flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Schreibe eine Antwort..." 
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              className="flex-1 bg-bg border border-line text-xs rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-cyan"
            />
            <button 
              onClick={() => {
                if (!replyInput.trim()) return;
                addXp(10, 'Forum-Antwort gepostet');
                addToast('success', 'Antwort erfolgreich gepostet!');
                setReplyInput('');
              }}
              className="bg-cyan hover:bg-cyan2 text-bg p-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Threads List
        <div className="space-y-4">
          {threads.map(thread => (
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
                <div className="flex items-center space-x-4 pt-1 text-[10px] text-muted">
                  <span>Autor: {thread.author}</span>
                  <span>{thread.timestamp}</span>
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{thread.commentsCount}</span>
                  </span>
                  {thread.hasAcceptedAnswer && (
                    <span className="text-green font-semibold flex items-center space-x-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Gelöst</span>
                    </span>
                  )}
                </div>
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
            <h3 className="font-bold text-base text-text border-b border-line pb-3">Neues Forum-Thema erstellen</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-muted font-bold uppercase">Titel der Frage</label>
                <input 
                  type="text" 
                  placeholder="Wie verwende ich *args in Funktionen?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-muted font-bold uppercase">Beschreibung</label>
                <textarea 
                  placeholder="Beschreibe deine Frage ausführlich. Code-Snippets können im Markdown-Format eingefügt werden..."
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
                Abbrechen
              </button>
              <button 
                onClick={handleCreateThread}
                className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-lg text-center cursor-pointer"
              >
                Erstellen (+25 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
