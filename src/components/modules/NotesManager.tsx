import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Bookmark, Plus, Search, 
  Trash2, ChevronRight, Clock, 
  Download, ExternalLink, Save, 
  FileText, Tag
} from 'lucide-react';
import { useXP } from '../../context/XPContext';

export interface NoteAnchor {
  type: 'timestamp' | 'page' | 'line' | 'general';
  value?: string | number;
  context?: string; // e.g., lesson name or code file path
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  anchor?: NoteAnchor;
  updatedAt: number;
  courseId?: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  note?: string;
  anchor: NoteAnchor;
  courseId: string;
  createdAt: number;
}

interface NotesManagerProps {
  courseId: string;
  currentAnchor?: NoteAnchor;
  onJumpToAnchor?: (anchor: NoteAnchor) => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({ 
  courseId, 
  currentAnchor,
  onJumpToAnchor 
}) => {
  const { addToast } = useXP();
  const [activeTab, setActiveTab] = useState<'notes' | 'bookmarks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(`manthio_notes_${courseId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem(`manthio_bookmarks_${courseId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // Persistence Hooks
  useEffect(() => {
    localStorage.setItem(`manthio_notes_${courseId}`, JSON.stringify(notes));
  }, [notes, courseId]);

  useEffect(() => {
    localStorage.setItem(`manthio_bookmarks_${courseId}`, JSON.stringify(bookmarks));
  }, [bookmarks, courseId]);

  const handleSaveNote = useCallback(() => {
    if (!editingNoteId) return;
    setNotes(prev => prev.map(n => 
      n.id === editingNoteId 
        ? { ...n, content: noteContent, title: noteTitle, tags: noteTags, updatedAt: Date.now() } 
        : n
    ));
  }, [editingNoteId, noteContent, noteTitle, noteTags]);

  // Auto-save logic (REQ-NOTES-001)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editingNoteId && noteContent) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        handleSaveNote();
      }, 5000);
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [editingNoteId, noteContent, handleSaveNote]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: currentAnchor ? `Notes for ${currentAnchor.type} ${currentAnchor.value || ''}` : 'New Insight',
      content: '',
      tags: [],
      anchor: currentAnchor,
      updatedAt: Date.now(),
      courseId
    };
    setNotes([newNote, ...notes]);
    setEditingNoteId(newNote.id);
    setNoteContent('');
    setNoteTitle(newNote.title);
    setNoteTags([]);
    setIsPreview(false);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(notes.filter(n => n.id !== id));
    if (editingNoteId === id) setEditingNoteId(null);
    addToast('success', 'Note purged from local memory.');
  };

  const handleAddBookmark = () => {
    if (!currentAnchor) return;
    const newBookmark: BookmarkItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Bookmark: ${currentAnchor.type} ${currentAnchor.value || ''}`,
      anchor: currentAnchor,
      courseId,
      createdAt: Date.now()
    };
    setBookmarks([newBookmark, ...bookmarks]);
    addToast('success', 'Neural marker placed.');
  };

  const handleExport = (note?: Note) => {
    const content = note 
      ? `# ${note.title}\n\n${note.content}` 
      : notes.map(n => `# ${n.title}\n\n${n.content}`).join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note ? `${note.title.replace(/\s+/g, '_')}.md` : 'Manthio_Notes_Vault.md';
    a.click();
    addToast('success', 'Memory vault exported successfully.');
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-cyan mt-4 mb-2">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-cyan mt-3 mb-1">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-text mt-2 mb-1">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-[11px] list-disc text-muted">{line.replace('- ', '')}</li>;
      if (line.startsWith('```')) return <div key={i} className="bg-bg border border-line p-2 rounded-lg font-mono text-[10px] my-2 overflow-x-auto text-cyan">{line.replace('```', '')}</div>;
      return <p key={i} className="text-[11px] text-muted leading-relaxed min-h-[1em]">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-bg/80 border-l border-line shadow-2xl backdrop-blur-3xl animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-5 border-b border-line flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan/10 rounded-xl">
            <MessageSquare className="w-4 h-4 text-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-text">Cognitive Vault</h3>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Ensemble Notes</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'notes' ? 'bg-cyan text-bg shadow-md shadow-cyan/20' : 'hover:bg-bg/50 text-muted'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'bookmarks' ? 'bg-cyan text-bg shadow-md shadow-cyan/20' : 'hover:bg-bg/50 text-muted'}`}
          >
            Markers
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 space-y-3">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted group-focus-within:text-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="Neural search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg border border-line rounded-xl pl-9 pr-4 py-2 text-xs text-text !outline-none focus:outline-none focus:border-cyan transition-all placeholder:text-muted/50"
          />
        </div>

        {activeTab === 'notes' ? (
          <button 
            onClick={handleCreateNote}
            className="w-full py-2.5 bg-text text-bg rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-text/5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Insight</span>
          </button>
        ) : (
          <button 
            onClick={handleAddBookmark}
            disabled={!currentAnchor}
            className="w-full py-2.5 border-2 border-dashed border-line rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted hover:border-cyan/40 hover:text-cyan transition-all flex items-center justify-center space-x-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Place Neural Marker</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      {editingNoteId ? (
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden border-b border-line">
          <div className="space-y-4 flex flex-col h-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between shrink-0">
               <button 
                onClick={() => { handleSaveNote(); setEditingNoteId(null); }}
                className="text-[10px] font-bold text-muted hover:text-cyan flex items-center space-x-1 cursor-pointer"
               >
                 <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                 <span>Back to Vault</span>
               </button>
               <div className="flex space-x-1.5 shrink-0">
                  <button 
                    onClick={() => { handleSaveNote(); setEditingNoteId(null); addToast('success', 'Neural pattern committed to memory.'); }}
                    className="p-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan hover:text-bg transition-all flex items-center space-x-2 cursor-pointer"
                    title="Manual Commit & Close"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider pr-1">Save</span>
                  </button>
                  <button 
                    onClick={() => setIsPreview(!isPreview)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${isPreview ? 'bg-panel border-cyan text-cyan' : 'bg-bg border-line text-muted'}`}
                    title="Toggle Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleExport(notes.find(n => n.id === editingNoteId))}
                    className="p-2 rounded-lg bg-bg border border-line text-muted hover:text-cyan transition-all cursor-pointer"
                    title="Export as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>

            <input 
              type="text" 
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-transparent border-b border-line py-2 text-sm font-bold text-text !outline-none focus:outline-none focus:border-cyan placeholder:text-muted/30 shrink-0"
              placeholder="Insight Designation..."
            />

            <div className="flex items-center space-x-2 shrink-0">
              <Tag className="w-3.5 h-3.5 text-muted" />
              <input 
                type="text"
                placeholder="Add tags (comma separated)..."
                value={noteTags.join(', ')}
                onChange={(e) => setNoteTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                className="bg-transparent text-[10px] font-bold text-cyan uppercase placeholder:text-muted/30 focus:outline-none !outline-none"
              />
            </div>

            {isPreview ? (
              <div className="bg-bg/50 border border-line rounded-2xl p-4 flex-1 overflow-y-auto prose-invert">
                {renderMarkdown(noteContent)}
              </div>
            ) : (
              <textarea 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                autoFocus
                placeholder="Capture your thoughts... Use # for headings and ``` for code."
                className="flex-1 w-full bg-bg border border-line rounded-2xl p-4 text-[11px] text-text focus:outline-none focus:border-cyan transition-all resize-none shadow-inner overflow-y-auto overscroll-contain !outline-none"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {activeTab === 'notes' ? (
            <div className="space-y-3">
              {filteredNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setNoteTitle(note.title);
                    setNoteContent(note.content);
                    setNoteTags(note.tags);
                    setIsPreview(false);
                  }}
                  className="group p-4 bg-bg border border-line rounded-2xl hover:border-cyan/40 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-cyan" />
                      <h4 className="text-xs font-bold text-text max-w-[150px] truncate">{note.title || 'Untitled'}</h4>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-red transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-muted line-clamp-2 mb-3 leading-relaxed">
                    {note.content || 'Zero data recorded...'}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-muted/60 font-bold">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {note.anchor && (
                       <div className="flex items-center space-x-1 text-cyan/70">
                          <ExternalLink className="w-3 h-3" />
                          <span className="uppercase tracking-tighter">{note.anchor.type} {note.anchor.value}</span>
                       </div>
                    )}
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {note.tags.map((tag, idx) => (
                        <span key={idx} className="bg-cyan/10 text-cyan text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-40">
                  <div className="w-16 h-16 bg-line rounded-full flex items-center justify-center mx-auto">
                     <Clock className="w-8 h-8 text-muted" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-widest text-text">No matching insights</p>
                    <p className="text-[10px] text-muted">Your neural vault is sparse in this sector.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
               {filteredBookmarks.map(bookmark => (
                  <div 
                    key={bookmark.id}
                    onClick={() => onJumpToAnchor?.(bookmark.anchor)}
                    className="group p-4 bg-bg border border-line rounded-2xl hover:border-cyan/40 transition-all cursor-pointer flex items-center space-x-4"
                  >
                     <div className="w-10 h-10 rounded-xl bg-panel border border-line flex items-center justify-center text-cyan group-hover:bg-cyan group-hover:text-bg transition-colors">
                        <Bookmark className="w-4 h-4" />
                     </div>
                     <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-text truncate mb-1">{bookmark.title}</h4>
                        <div className="flex items-center space-x-2 text-[9px] text-muted font-bold uppercase tracking-widest">
                           <span className="text-cyan">{bookmark.anchor.type}</span>
                           <div className="w-1 h-1 rounded-full bg-line" />
                           <span>{bookmark.anchor.value || 'Generic'}</span>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-muted opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
               ))}
               {filteredBookmarks.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-40">
                  <div className="w-16 h-16 bg-line rounded-full flex items-center justify-center mx-auto text-muted">
                     <Bookmark className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-widest text-text">No active markers</p>
                    <p className="text-[10px] text-muted">Place markers to jump between neural clusters.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      {!editingNoteId && (
        <div className="p-4 border-t border-line bg-bg/20 flex items-center justify-between">
           <button 
            onClick={() => handleExport()}
            className="flex items-center space-x-2 text-[9px] font-bold text-muted hover:text-cyan transition-colors uppercase tracking-widest"
           >
              <Download className="w-3 h-3" />
              <span>Bulk Vault Export</span>
           </button>
           <div className="flex items-center space-x-2 text-[9px] text-muted/40 font-bold uppercase tracking-widest">
              <Save className="w-3 h-3" />
              <span>Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>
      )}
    </div>
  );
};

function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
