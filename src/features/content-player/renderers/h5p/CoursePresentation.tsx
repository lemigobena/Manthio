import React, { useState } from 'react';
import type { H5PCoursePresentationData } from '../../../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CoursePresentationProps {
  data: H5PCoursePresentationData;
  onComplete: (scorePercentage?: number) => void;
}

export const CoursePresentation: React.FC<CoursePresentationProps> = ({ data, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set([0]));

  const nextSlide = () => {
    if (currentSlide < data.slides.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      setCompletedSlides(prev => new Set(prev).add(next));
      
      if (next === data.slides.length - 1) {
        onComplete(100); // 100% score for finishing presentation
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = data.slides[currentSlide];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[500px] md:h-[600px] bg-bg border border-line rounded-2xl shadow-xl overflow-hidden">
      
      {/* Slide Content Area */}
      <div className="flex-1 relative bg-panel m-2 sm:m-4 rounded-xl border border-line overflow-y-auto sm:overflow-hidden flex flex-col sm:block p-4 sm:p-0 gap-4">
        {[...slide.elements].sort((a, b) => a.y - b.y).map(element => {
          return (
            <div
              key={element.id}
              className="relative sm:absolute w-full sm:w-[var(--w)] h-auto sm:h-[var(--h)] left-auto sm:left-[var(--x)] top-auto sm:top-[var(--y)] shrink-0"
              style={{
                '--x': `${element.x}%`,
                '--y': `${element.y}%`,
                '--w': `${element.width}%`,
                '--h': `${element.height}%`
              } as React.CSSProperties}
            >
              {element.type === 'text' && (
                <div className="w-full h-full flex items-center justify-center sm:p-4">
                  <div className="text-text font-medium text-center text-sm sm:text-base md:text-lg [&>h2]:text-lg [&>h2]:sm:text-xl [&>h2]:md:text-2xl [&>h2]:font-bold [&>h2]:mb-2" dangerouslySetInnerHTML={{ __html: element.content }} />
                </div>
              )}
              {element.type === 'image' && (
                <div className="w-full h-full flex items-center justify-center py-2 sm:py-0">
                  <img src={element.content} alt="" className="max-w-full max-h-[250px] sm:max-h-full object-contain rounded-lg shadow-md" />
                </div>
              )}
              {element.type === 'video' && (
                <div className="w-full h-full flex items-center justify-center bg-black/10 rounded-lg">
                  <video src={element.content} controls className="max-w-full max-h-full rounded-lg" />
                </div>
              )}
              {/* Note: Simplified rendering. For real H5P, we would render inner interactions here */}
              {element.type === 'question' && (
                <div className="w-full h-full flex items-center justify-center bg-cyan/10 rounded-lg border border-cyan/30 p-4 flex-col text-center">
                  <h3 className="font-bold text-cyan mb-2">Interactive Question</h3>
                  <p className="text-sm text-text">{element.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Presentation Controls */}
      <div className="h-16 border-t border-line bg-bg flex items-center justify-between px-6 shrink-0">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
            currentSlide === 0 ? 'text-muted cursor-not-allowed opacity-50' : 'text-text hover:bg-line/50'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          {data.slides.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide 
                  ? 'bg-cyan w-6' 
                  : completedSlides.has(idx) 
                    ? 'bg-cyan/50' 
                    : 'bg-line'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === data.slides.length - 1}
          className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
            currentSlide === data.slides.length - 1 
              ? 'text-muted cursor-not-allowed opacity-50' 
              : 'text-cyan hover:bg-cyan/10 font-bold'
          }`}
        >
          <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
