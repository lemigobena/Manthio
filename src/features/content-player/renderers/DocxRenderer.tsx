import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { FileText, Download, Printer, ZoomIn, ZoomOut } from 'lucide-react';

interface DocxRendererProps {
  lesson: {
    title: string;
    contentUrl?: string;
  };
}

export const DocxRenderer: React.FC<DocxRendererProps> = ({ lesson }) => {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const loadDocx = async () => {
      if (!lesson.contentUrl) {
        setError('No document URL provided.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(lesson.contentUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(result.value);
        
        if (result.messages.length > 0) {
          console.warn('Mammoth messages:', result.messages);
        }
      } catch (err) {
        console.error('Error loading DOCX:', err);
        setError('Failed to convert Word document. Please download to view.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocx();
  }, [lesson.contentUrl]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-muted animate-pulse font-medium">Rendering document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-panel/30 rounded-2xl border border-line border-dashed m-6">
        <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center text-red mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">Unavailable Preview</h3>
        <p className="text-muted mb-8 max-w-md">{error}</p>
        <a 
          href={lesson.contentUrl} 
          download 
          className="inline-flex items-center space-x-2 bg-blue hover:bg-blue-hover text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
        >
          <Download className="w-5 h-5" />
          <span>Download to View</span>
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] overflow-hidden rounded-xl border border-line shadow-2xl">
      {/* Word Toolbar */}
      <div className="bg-white border-b border-line px-4 py-3 flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue flex items-center justify-center text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-text truncate max-w-[200px]">{lesson.title}</span>
            <span className="text-[9px] text-muted uppercase tracking-wider font-bold">Microsoft Word</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-muted">
          <div className="flex items-center space-x-2 bg-bg/50 px-2 py-1 rounded-lg">
            <ZoomOut className="w-4 h-4 cursor-pointer hover:text-text" onClick={() => setZoom(z => Math.max(z - 10, 50))} />
            <span className="text-[10px] font-mono min-w-[30px] text-center font-bold text-text">{zoom}%</span>
            <ZoomIn className="w-4 h-4 cursor-pointer hover:text-text" onClick={() => setZoom(z => Math.min(z + 10, 200))} />
          </div>
          <div className="h-4 w-px bg-line" />
          <Printer className="w-4 h-4 hover:text-blue cursor-pointer transition-colors" onClick={handlePrint} />
          <a href={lesson.contentUrl} download>
             <Download className="w-4 h-4 hover:text-blue cursor-pointer transition-colors" />
          </a>
        </div>
      </div>

      {/* A4 Paper Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center bg-[#f0f2f5] scrollbar-thin scrollbar-thumb-line">
        <div 
          className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.1)] p-[2cm] min-h-[29.7cm] transition-all duration-300 origin-top"
          style={{ 
            width: '21cm', 
            transform: `scale(${zoom / 100})`,
            marginBottom: '4cm'
          }}
        >
          <div 
            className="docx-content prose prose-sm max-w-none text-[#2b2b2b]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .docx-content h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; color: #2b579a; border-bottom: 2pt solid #2b579a; padding-bottom: 4pt; }
        .docx-content h2 { font-size: 18pt; font-weight: bold; margin: 18pt 0 10pt; color: #2b579a; }
        .docx-content h3 { font-size: 14pt; font-weight: bold; margin: 14pt 0 8pt; color: #2b579a; }
        .docx-content p { font-size: 11pt; line-height: 1.5; margin-bottom: 10pt; text-align: justify; }
        .docx-content ul, .docx-content ol { margin-bottom: 10pt; padding-left: 20pt; }
        .docx-content li { font-size: 11pt; margin-bottom: 4pt; }
        .docx-content table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; border: 1pt solid #ccc; }
        .docx-content td, .docx-content th { border: 1pt solid #ccc; padding: 6pt; font-size: 10pt; }
        .docx-content b, .docx-content strong { font-weight: bold; }
        .docx-content i, .docx-content em { font-style: italic; }
      `}} />
    </div>
  );
};
