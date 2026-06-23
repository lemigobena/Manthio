import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Download, Search, 
  MessageSquare, Plus, Trash2, ChevronLeft, 
  ChevronRight, X, FileText, Clock, Settings2
} from 'lucide-react';
import type { Lesson } from '../../../types';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Note {
  id: string;
  pageNumber: number;
  text: string;
  timestamp: string;
}

interface WindowFind {
  find: (str: string, caseSensitive: boolean, backwards: boolean, wrapAround: boolean, wholeWord: boolean, searchInFrames: boolean, showDialog: boolean) => boolean;
}

interface PdfRendererProps {
  lesson: Lesson;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({ lesson }) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Monitor container size for responsive width
  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Subtract padding/margins (48px total for sm+)
        const width = entries[0].contentRect.width;
        setContainerWidth(width - (width < 640 ? 32 : 48));
      }
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    if (!scrollContainerRef.current || !numPages) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '1', 10);
          setCurrentPage(pageNum);
        }
      });
    }, { 
      root: scrollContainerRef.current, 
      rootMargin: '-20% 0px -40% 0px', 
      threshold: 0 
    });

    const timeout = setTimeout(() => {
      Object.values(pageRefs.current).forEach(el => {
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [numPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError('');
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

  const jumpToPage = (pageNumber: number) => {
    const el = pageRefs.current[pageNumber];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setCurrentPage(pageNumber);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim() !== '') {
      const win = window as unknown as WindowFind;
      if (win.find) {
        const found = win.find(searchText, false, e.shiftKey, true, false, true, false);
        if (!found) {
          window.getSelection()?.removeAllRanges();
          win.find(searchText, false, e.shiftKey, true, false, true, false);
        }
      }
    }
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      pageNumber: currentPage,
      text: newNoteText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotes([note, ...notes]);
    setNewNoteText('');
    setShowNoteInput(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  // Dynamic PDF width based on container and zoom
  const pdfWidth = Math.min(containerWidth, 900) * scale;

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full overflow-hidden bg-bg relative font-sans text-text">
      {/* Top Navigation Bar */}
      <div className="h-14 sm:h-16 bg-panel/80 backdrop-blur-md border-b border-line px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="hidden sm:flex p-2 bg-cyan/10 rounded-lg shrink-0">
            <FileText className="w-4 h-4 text-cyan" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-muted uppercase font-bold tracking-widest truncate hidden sm:block">Reader</span>
            <h1 className="text-xs sm:text-sm font-bold truncate leading-tight">{lesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center bg-bg/50 border border-line rounded-xl px-3 h-9 group focus-within:border-cyan/50 transition-all w-48 lg:w-64">
            <Search className="w-3.5 h-3.5 text-muted group-focus-within:text-cyan" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-transparent border-none text-[11px] focus:ring-0 w-full placeholder:text-muted/50 ml-2" 
            />
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={`p-2 rounded-xl transition-all relative ${isNotesOpen ? 'bg-cyan text-bg shadow-lg shadow-cyan/20' : 'bg-panel border border-line text-muted hover:text-text'}`}
            >
              <MessageSquare className="w-4 h-4" />
              {notes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red text-white text-[8px] flex items-center justify-center rounded-full border-2 border-bg">
                  {notes.length}
                </span>
              )}
            </button>
            <div className="h-6 w-px bg-line hidden sm:block" />
            <div className="hidden sm:flex items-center bg-panel border border-line rounded-xl p-0.5">
              <button onClick={zoomOut} className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-text transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-[10px] font-mono px-2 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-text transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div className="h-6 w-px bg-line" />
            <a 
              href={lesson.contentUrl || "/Manthio_Learner_Frontend_Requirements.pdf"} 
              download 
              className="p-2 bg-text text-bg rounded-xl hover:scale-105 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={viewportRef} className="flex-1 flex overflow-hidden relative">
        {/* PDF Viewport */}
        <div 
          ref={scrollContainerRef} 
          className="flex-1 overflow-y-auto scrollbar-hide bg-[#1a1d21] pt-6 sm:pt-10 pb-32 flex flex-col items-center"
        >
          {error && (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="bg-panel border border-line p-8 rounded-3xl text-center max-w-sm">
                <X className="w-12 h-12 text-red mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Unavailable</h3>
                <p className="text-xs text-muted mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-text text-bg rounded-xl text-xs font-bold uppercase">Retry</button>
              </div>
            </div>
          )}

          {!error && (
            <Document 
              file={lesson.contentUrl || "/Manthio_Learner_Frontend_Requirements.pdf"} 
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => setError(err.message)}
              className="flex flex-col items-center w-full"
              loading={
                <div className="mt-20 flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-cyan/10 border-t-cyan rounded-full animate-spin mb-4" />
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Loading Pages</span>
                </div>
              }
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <div 
                  key={`page_${index + 1}`} 
                  ref={el => { pageRefs.current[index + 1] = el; }}
                  data-page-number={index + 1}
                  className="mb-6 sm:mb-10 shadow-2xl relative group bg-white overflow-hidden transition-all duration-300 mx-auto"
                  style={{ width: pdfWidth }}
                >
                   <Page 
                     pageNumber={index + 1} 
                     scale={scale} 
                     width={Math.min(containerWidth, 900)}
                     renderTextLayer={true}
                     renderAnnotationLayer={false}
                     className="max-w-full"
                   />
                   
                   {/* Contextual Actions (Mobile-Optimized) */}
                   <button 
                      onClick={() => {
                        jumpToPage(index + 1);
                        setIsNotesOpen(true);
                        setShowNoteInput(true);
                      }}
                      className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black/80 backdrop-blur text-white p-3 rounded-2xl shadow-xl opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                   >
                     <Plus className="w-5 h-5" />
                   </button>
                </div>
              ))}
            </Document>
          )}
        </div>

        {/* Improved Notes Panel (Floating Sidebar Style) */}
        {isNotesOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-panel/95 backdrop-blur-2xl border-l border-line z-40 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
            <div className="p-4 sm:p-6 border-b border-line flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-cyan" />
                <h3 className="font-bold text-sm tracking-tight text-text">Notes</h3>
              </div>
              <button 
                onClick={() => setIsNotesOpen(false)}
                className="p-2 hover:bg-bg rounded-lg text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {showNoteInput ? (
                <div className="bg-bg border border-cyan/30 rounded-2xl p-4 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center text-[10px] font-bold text-cyan uppercase tracking-widest">
                    <span>Annotating Page {currentPage}</span>
                  </div>
                  <textarea 
                    autoFocus
                    placeholder="Capture your thoughts..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full bg-transparent border-none text-[11px] text-text focus:ring-0 min-h-[120px] resize-none"
                  />
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowNoteInput(false)}
                      className="flex-1 py-2.5 bg-panel border border-line rounded-xl text-[10px] font-bold uppercase hover:bg-bg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={addNote}
                      className="flex-2 py-2.5 bg-cyan text-bg rounded-xl text-[10px] font-bold uppercase hover:bg-cyan2 shadow-lg shadow-cyan/20 transition-all"
                    >
                      Save Progress
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowNoteInput(true)}
                  className="w-full py-4 border-2 border-dashed border-line rounded-2xl flex flex-col items-center justify-center space-y-2 text-muted hover:border-cyan/50 hover:text-cyan transition-all group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  <span className="text-[10px] font-bold uppercase">New Insight</span>
                </button>
              )}

              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="group p-4 bg-bg border border-line rounded-2xl hover:border-cyan/30 transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <button 
                        onClick={() => jumpToPage(note.pageNumber)}
                        className="text-[10px] font-bold text-cyan px-2 py-0.5 bg-cyan/10 rounded flex items-center hover:bg-cyan/20"
                      >
                        P{note.pageNumber}
                      </button>
                      <div className="flex items-center space-x-3">
                        <span className="text-[9px] text-muted flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {note.timestamp}
                        </span>
                        <button onClick={() => deleteNote(note.id)} className="text-red/40 hover:text-red transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-text/80 leading-relaxed break-words">{note.text}</p>
                  </div>
                ))}
                
                {notes.length === 0 && !showNoteInput && (
                  <div className="py-20 text-center opacity-40">
                    <Settings2 className="w-10 h-10 mx-auto mb-4" />
                    <p className="text-[11px] uppercase tracking-widest font-bold">No insights yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Floating Bottom Navigation */}
      {numPages && (
        <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center bg-panel/90 backdrop-blur-xl border border-line px-2 py-1.5 rounded-[20px] z-[50] shadow-2xl scale-100 transition-all hover:scale-[1.02]">
          <button 
            onClick={() => jumpToPage(Math.max(currentPage - 1, 1))}
            className="p-3 text-muted hover:text-cyan disabled:opacity-20 transition-colors"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center px-4 border-x border-line h-8">
            <span className="text-sm font-bold text-text w-6 text-center">{currentPage}</span>
            <span className="text-[10px] font-bold text-muted uppercase mx-2 tracking-tighter">/</span>
            <span className="text-sm font-bold text-muted/60 w-6 text-center">{numPages}</span>
          </div>

          <button 
            onClick={() => jumpToPage(Math.min(currentPage + 1, numPages))}
            className="p-3 text-muted hover:text-cyan disabled:opacity-20 transition-colors"
            disabled={currentPage === numPages}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
