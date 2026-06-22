import React from 'react';
import type { Lesson } from '../../../types';

interface H5PRendererProps {
  lesson: Lesson;
}

export const H5PRenderer: React.FC<H5PRendererProps> = ({ lesson }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a]">
      <div className="bg-bg border-b border-line px-4 py-3 flex justify-between items-center text-white text-xs shrink-0">
        <span className="font-bold opacity-80">{lesson.title}</span>
        <span className="bg-cyan px-2 py-0.5 rounded text-bg font-bold uppercase tracking-wider">H5P Interactive</span>
      </div>
      <div className="flex-1 w-full bg-black relative">
        {/* Real H5P Template using iframe */}
        <iframe 
          src="https://h5p.org/h5p/embed/611" 
          className="absolute inset-0 w-full h-full border-none"
          allowFullScreen={true}
          allow="geolocation *; microphone *; camera *; midi *; vr *"
          title="Interactive Video Template"
        />
      </div>
      <div className="bg-bg border-t border-line px-4 py-3 shrink-0 flex items-center justify-center">
        <p className="text-xs text-muted">
          This is a live template of H5P Interactive Video embedded via iframe.
        </p>
      </div>
    </div>
  );
};
