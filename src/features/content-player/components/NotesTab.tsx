import React, { useState, useEffect } from 'react';
import { Tag, Search, Download, Edit3, Eye, FileText, Plus, X } from 'lucide-react';
import type { Lesson } from '../../../types';
import { MarkdownWithCodeBlocks } from '../../ai-tutor/components/AITutorChat';

interface NotesTabProps {
  currentLesson: Lesson;
}

export const NotesTab: React.FC<NotesTabProps> = ({ currentLesson }) => {
  const [noteText, setNoteText] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | ''>('');
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{lessonId: string, text: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load initial data
  useEffect(() => {
    setNoteText(localStorage.getItem(`note-${currentLesson.id}`) || '');
    try {
      const savedTags = JSON.parse(localStorage.getItem(`tags-${currentLesson.id}`) || '[]');
      setTags(savedTags);
    } catch {
      setTags([]);
    }
  }, [currentLesson.id]);

  // Listen for storage events (e.g., from AI Tutor "Save to Notes")
  useEffect(() => {
    const handleStorage = () => {
      // We manually dispatch this in AITutorChat
      setNoteText(localStorage.getItem(`note-${currentLesson.id}`) || '');
    };
    window.addEventListener('noteUpdated', handleStorage);
    return () => window.removeEventListener('noteUpdated', handleStorage);
  }, [currentLesson.id]);

  // Auto-save debounce
  useEffect(() => {
    if (!noteText) return;
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      localStorage.setItem(`note-${currentLesson.id}`, noteText);
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [noteText, currentLesson.id]);

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    const newTags = [...tags, tagInput.trim()];
    setTags(newTags);
    setTagInput('');
    localStorage.setItem(`tags-${currentLesson.id}`, JSON.stringify(newTags));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    localStorage.setItem(`tags-${currentLesson.id}`, JSON.stringify(newTags));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results: {lessonId: string, text: string}[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('note-')) {
        const text = localStorage.getItem(key) || '';
        if (text.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            lessonId: key.replace('note-', ''),
            text: text.length > 100 ? text.substring(0, 100) + '...' : text
          });
        }
      }
    }
    setSearchResults(results);
  };

  const exportMarkdown = () => {
    const blob = new Blob([noteText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${currentLesson.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // A simple window.print() that specifically targets the preview area
    // For a real app, this would use react-pdf or similar, but print dialog is standard.
    window.print();
  };

  const insertTimestamp = () => {
    // Placeholder for video timestamp
    const timestamp = `[00:00] `;
    setNoteText(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + timestamp);
  };

  if (isSearching) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setIsSearching(false); setSearchQuery(''); }}
            className="text-xs text-muted hover:text-cyan flex items-center space-x-1"
          >
            <X size={14} /> <span>Close Search</span>
          </button>
        </div>
        <div className="bg-bg border border-line rounded-xl px-3 py-2 flex items-center space-x-2">
          <Search size={14} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search all notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-xs text-text flex-1"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {searchQuery && searchResults.length === 0 && (
            <div className="text-xs text-muted text-center pt-8">No matching notes found.</div>
          )}
          {searchResults.map((result, i) => (
            <div key={i} className="bg-bg border border-line rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-cyan uppercase tracking-widest">Lesson {result.lessonId}</span>
              <p className="text-xs text-text/80">{result.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full relative" id="notes-print-area">
      {/* Header Actions */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsEditing(true)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isEditing ? 'bg-cyan text-bg' : 'bg-bg text-muted hover:text-text border border-line'}`}
          >
            <Edit3 size={12} />
            <span>Write</span>
          </button>
          <button 
            onClick={() => setIsEditing(false)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!isEditing ? 'bg-cyan text-bg' : 'bg-bg text-muted hover:text-text border border-line'}`}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-muted font-medium w-16 text-right">{saveStatus}</span>
          <button onClick={() => setIsSearching(true)} className="p-1.5 text-muted hover:text-cyan rounded-lg hover:bg-bg transition-colors" title="Search all notes">
            <Search size={14} />
          </button>
          <button onClick={exportMarkdown} className="p-1.5 text-muted hover:text-cyan rounded-lg hover:bg-bg transition-colors" title="Export Markdown">
            <Download size={14} />
          </button>
          <button onClick={exportPDF} className="p-1.5 text-muted hover:text-cyan rounded-lg hover:bg-bg transition-colors" title="Print to PDF">
            <FileText size={14} />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center flex-wrap gap-2 shrink-0">
        <Tag size={12} className="text-muted" />
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-cyan/10 text-cyan border border-cyan/20 rounded-full text-[10px] font-bold flex items-center space-x-1">
            <span>{tag}</span>
            <X size={10} className="cursor-pointer hover:text-white" onClick={() => handleRemoveTag(tag)} />
          </span>
        ))}
        <div className="flex items-center space-x-1 bg-bg border border-line rounded-full px-2 py-0.5">
          <input 
            type="text" 
            placeholder="Add tag..." 
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="bg-transparent border-none focus:outline-none text-[10px] text-text w-16"
          />
          <Plus size={10} className="text-cyan cursor-pointer" onClick={handleAddTag} />
        </div>
      </div>

      {/* Editor / Preview */}
      {isEditing ? (
        <div className="flex-1 flex flex-col relative">
          <textarea 
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write important notes here. Markdown is supported. Auto-saves."
            className="flex-1 w-full p-4 bg-bg border border-line rounded-xl text-xs text-text focus:outline-none focus:border-cyan resize-none font-mono leading-relaxed"
          />
          {currentLesson.type === 'Video' && (
            <button 
              onClick={insertTimestamp}
              className="absolute bottom-4 right-4 bg-panel/80 backdrop-blur-md border border-line px-2 py-1 rounded text-[10px] font-bold text-cyan hover:bg-cyan hover:text-bg transition-colors"
            >
              Insert [00:00]
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-bg border border-line rounded-xl p-4 scrollbar-hide">
          {noteText ? (
             <MarkdownWithCodeBlocks content={noteText} />
          ) : (
             <div className="text-xs text-muted italic flex items-center justify-center h-full">Nothing to preview.</div>
          )}
        </div>
      )}
    </div>
  );
};
