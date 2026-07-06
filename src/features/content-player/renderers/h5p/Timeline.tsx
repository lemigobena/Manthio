import React, { useState, useEffect } from 'react';
import type { H5PTimelineData } from '../../../../types';


interface TimelineProps {
  data: H5PTimelineData;
  onComplete: (scorePercentage?: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ data, onComplete }) => {
  const [viewedEvents, setViewedEvents] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const handleView = (id: string) => {
    const newViewed = new Set(viewedEvents);
    newViewed.add(id);
    setViewedEvents(newViewed);
    
    if (newViewed.size === data.events.length && !completed) {
      setCompleted(true);
      onComplete(100);
    }
  };

  // If there are no events, auto-complete
  useEffect(() => {
    if (data.events.length === 0 && !completed) {
      setTimeout(() => {
        setCompleted(true);
        onComplete(100);
      }, 0);
    }
  }, [data.events.length, completed, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-panel border border-line rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 pb-4 border-b border-line gap-4 sm:gap-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text">Timeline</h2>
          <p className="text-muted text-xs sm:text-sm mt-1">Scroll and explore all events to complete.</p>
        </div>
      </div>

      <div className="relative border-l-2 border-line ml-4 space-y-16 pb-8">
        {data.events.map((event) => {
          const isViewed = viewedEvents.has(event.id);
          
          return (
            <div 
              key={event.id} 
              className="relative pl-10 group cursor-pointer"
              onMouseEnter={() => handleView(event.id)}
              onClick={() => handleView(event.id)}
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 transition-all duration-300 ${
                isViewed ? 'bg-cyan border-panel shadow-[0_0_15px_rgba(45,212,191,0.5)] scale-110' : 'bg-line border-panel group-hover:bg-cyan/50 group-hover:scale-110'
              }`} />
              
              <div className={`transition-all duration-500 transform ${
                isViewed ? 'opacity-100 translate-x-0' : 'opacity-60 group-hover:opacity-100 group-hover:translate-x-2'
              }`}>
                <span className="text-cyan font-black tracking-widest text-xs sm:text-sm uppercase block mb-1.5 sm:mb-2 bg-cyan/10 inline-block px-2 sm:px-3 py-1 rounded-md">
                  {event.year}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text mb-2 sm:mb-3 leading-tight">{event.title}</h3>
                <p className="text-muted leading-relaxed max-w-2xl text-sm sm:text-base md:text-lg">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
