import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import type { Lesson } from '../../../types';

interface ExternalLinkRendererProps {
  lesson: Lesson;
}

export const ExternalLinkRenderer: React.FC<ExternalLinkRendererProps> = ({ lesson }) => {
  return (
    <div className="p-6 md:p-10 space-y-6 w-full max-w-2xl flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-cyan/10 flex items-center justify-center mb-2">
        <ExternalLink className="w-8 h-8 text-cyan" />
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold text-text">{lesson.title}</h2>
      
      <p className="text-sm leading-relaxed text-muted max-w-md">
        This lesson references external material. We have curated this resource because it provides the best explanation of the current topic.
      </p>

      <div className="bg-bg border border-line rounded-xl p-4 flex items-start space-x-3 text-left w-full">
        <Info className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-text uppercase tracking-wider mb-1">Reason for inclusion</p>
          <p className="text-xs text-muted leading-relaxed">
            The official Python documentation provides an interactive shell where you can test code snippets directly in your browser without installing anything.
          </p>
        </div>
      </div>

      <a 
        href="#" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-cyan hover:bg-cyan2 text-bg px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-cyan/20 transition-all flex items-center space-x-2 w-full justify-center"
      >
        <span>Open Resource in New Tab</span>
        <ExternalLink className="w-4 h-4" />
      </a>

      <p className="text-[10px] text-muted italic mt-4">
        Make sure to return here and explicitly click "Mark as Done" once you've reviewed the material.
      </p>
    </div>
  );
};
