import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Download, Search, 
  MessageSquare, Plus, ChevronLeft, 
  ChevronRight, X, FileText
} from 'lucide-react';
import { NotesManager } from '../../../components/modules/NotesManager';
import type { Lesson } from '../../../types';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface WindowFind {
  find: (str: string, caseSensitive: boolean, backwards: boolean, wrapAround: boolean, wholeWord: boolean, searchInFrames: boolean, showDialog: boolean) => boolean;
}

interface PdfRendererProps {
  lesson: Lesson;
  onClose?: () => void;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({ lesson, onClose }) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
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

  // Dynamic PDF width based on container and zoom
  const pdfWidth = Math.min(containerWidth, 900) * scale;

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full overflow-hidden bg-bg relative font-sans text-text">
      {/* Top Navigation Bar */}
      <div className="h-11 sm:h-12 bg-panel/80 backdrop-blur-md border-b border-line px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="hidden sm:flex p-1.5 bg-cyan/10 rounded-lg shrink-0">
            <FileText className="w-4 h-4 text-cyan" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[9px] text-muted uppercase font-bold tracking-widest truncate hidden sm:block">Reader</span>
            <h1 className="text-xs sm:text-sm font-bold truncate leading-tight whitespace-nowrap">{lesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center bg-bg/50 border border-line rounded-full px-3 h-8 group focus-within:border-cyan/50 transition-all w-48 lg:w-64">
            <Search className="w-3.5 h-3.5 text-muted group-focus-within:text-cyan" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-transparent !border-none text-[11px] !focus:ring-0 !outline-none !ring-0 !shadow-none w-full placeholder:text-muted/50 ml-2 rounded-full" 
            />
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={`p-2 rounded-xl transition-all relative ${isNotesOpen ? 'bg-cyan text-bg shadow-lg shadow-cyan/20' : 'bg-panel border border-line text-muted hover:text-text'}`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-line hidden sm:block" />
            <div className="hidden sm:flex items-center bg-panel border border-line rounded-xl p-0.5">
              <button onClick={zoomOut} className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-text transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-[10px] font-mono px-2 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-text transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div className="h-6 w-px bg-line" />
            <div className="flex items-center space-x-1 sm:space-x-2">
              <a 
                href={lesson.contentUrl || "/Manthio_Learner_Frontend_Requirements.pdf"} 
                download 
                className="p-2 bg-text text-bg rounded-xl hover:scale-105 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
              </a>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="p-2 bg-red/10 border border-red/20 text-red rounded-xl hover:bg-red hover:text-white transition-all shadow-md ml-1 sm:ml-2"
                  title="Close Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={viewportRef} 
        className="flex-1 flex overflow-hidden relative"
      >
        {/* PDF Viewport */}
        <div 
          ref={scrollContainerRef} 
          onClick={(e) => {
            // Only close if clicking the viewport background, not the document itself
            if (e.target === e.currentTarget && isNotesOpen) {
              setIsNotesOpen(false);
            }
          }}
          className="flex-1 overflow-y-auto scrollbar-hide bg-bg/60 backdrop-blur-sm pt-4 sm:pt-6 pb-24 flex flex-col items-center"
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
                  className="mb-6 sm:mb-10 shadow-[0_0_50px_rgba(0,245,228,0.1)] relative group bg-white overflow-hidden transition-all duration-300 mx-auto"
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

        {/* Integrated High-Fidelity Notes & Bookmarks Manager */}
        {isNotesOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-panel/95 backdrop-blur-2xl border-l border-line z-40 flex flex-col shadow-[-10px_0_50px_rgba(0,245,228,0.2)]">
            <div className="absolute top-4 right-4 z-[50]">
              <button 
                onClick={() => setIsNotesOpen(false)}
                className="p-2 hover:bg-bg rounded-lg text-muted transition-colors"
                title="Collapse Vault"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NotesManager 
              courseId={lesson.id} 
              currentAnchor={{ type: 'page', value: currentPage }} 
              onJumpToAnchor={(anchor) => {
                if (anchor.type === 'page' && typeof anchor.value === 'number') {
                  jumpToPage(anchor.value);
                }
              }}
            />
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
