import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Download, Search, Maximize } from 'lucide-react';
import type { Lesson } from '../../../types';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfRendererProps {
  lesson: Lesson;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({ lesson }) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!scrollContainerRef.current || !numPages) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '1', 10);
          setCurrentPage(pageNum);
        }
      });
    }, { root: null, rootMargin: '-10% 0px -40% 0px', threshold: 0 });

    const timeout = setTimeout(() => {
      const pageElements = scrollContainerRef.current?.querySelectorAll('.pdf-page-container');
      pageElements?.forEach(el => observer.observe(el));
    }, 500);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [numPages]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale(s => Math.min(s + 0.5, 3.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim() !== '') {
      // Use the browser's robust native find API to handle cross-chunk PDF text
      const win = window as unknown as { find: (str: string, caseSensitive: boolean, backwards: boolean, wrapAround: boolean, wholeWord: boolean, searchInFrames: boolean, showDialog: boolean) => boolean };
      const found = win.find(searchText, false, e.shiftKey, true, false, true, false);
      if (!found) {
        // If not found (reached the end), clear selection and wrap around to the top
        window.getSelection()?.removeAllRanges();
        win.find(searchText, false, e.shiftKey, true, false, true, false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full overflow-hidden bg-[#1a1d21] relative">
      <div className="bg-bg border-b border-line px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2 text-xs font-bold text-text">
          <span className="bg-cyan/15 text-cyan px-2 py-1 rounded hidden sm:inline-block">PDF</span>
          <span className="hidden sm:inline-block truncate max-w-[150px]">{lesson.title}.pdf</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 text-muted">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Find in document..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-panel border border-line rounded text-xs pl-7 pr-2 py-1 focus:outline-none focus:border-cyan w-28 sm:w-32 transition-all focus:w-36 sm:focus:w-48" 
            />
          </div>
          <div className="h-4 w-px bg-line" />
          <ZoomOut className="w-4 h-4 hover:text-text cursor-pointer" onClick={zoomOut} />
          <span className="text-[10px] font-mono">{Math.round(scale * 100)}%</span>
          <ZoomIn className="w-4 h-4 hover:text-text cursor-pointer" onClick={zoomIn} />
          <div className="h-4 w-px bg-line" />
          <span title="Fullscreen">
            <Maximize className="w-4 h-4 hover:text-text cursor-pointer" onClick={toggleFullscreen} />
          </span>
          <span title="Download">
            <a href="/Manthio_Learner_Frontend_Requirements.pdf" download className="hover:text-text"><Download className="w-4 h-4 cursor-pointer" /></a>
          </span>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex-1 bg-[#1a1d21] overflow-y-auto relative flex justify-center py-4">
        {error && (
          <div className="text-red-500 bg-red-500/10 p-4 rounded text-center">
            Failed to load PDF: {error}
          </div>
        )}
        {!error && (
          <Document 
            file="/Manthio_Learner_Frontend_Requirements.pdf" 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => setError(err.message)}
            className="flex flex-col items-center max-w-full w-full"
            loading={<div className="text-white">Loading PDF...</div>}
            error={<div className="text-red-500">Error loading PDF.</div>}
            noData={<div className="text-white">No PDF file specified.</div>}
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <div 
                key={`page_${index + 1}`} 
                data-page-number={index + 1}
                className="pdf-page-container mb-4 shadow-xl max-w-full overflow-x-auto bg-white p-2 min-h-[500px] flex justify-center"
              >
                 <Page 
                   pageNumber={index + 1} 
                   scale={scale} 
                   width={Math.min(window.innerWidth - 40, 800)}
                   renderTextLayer={true}
                   renderAnnotationLayer={false}
                   onLoadError={(err) => console.error("Page error:", err.message)}
                   className="max-w-full"
                 />
              </div>
            ))}
          </Document>
        )}

      </div>

      {numPages && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white text-xs px-4 py-2 rounded-full z-50 shadow-2xl pointer-events-none transition-all">
          Page {currentPage} of {numPages}
        </div>
      )}
    </div>
  );
};
