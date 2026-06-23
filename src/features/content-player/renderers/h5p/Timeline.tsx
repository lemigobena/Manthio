import React, { useState, useEffect } from 'react';
import type { H5PTimelineData } from '../../../../types';
import { CheckCircle2 } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto bg-panel border border-line rounded-2xl p-8 shadow-xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-line">
        <div>
          <h2 className="text-2xl font-bold text-text">Timeline</h2>
          <p className="text-muted text-sm mt-1">Scroll and explore all events to complete.</p>
        </div>
        {completed && (
          <div className="flex items-center space-x-2 text-green font-bold bg-green/10 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>Completed</span>
          </div>
        )}
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
                <span className="text-cyan font-black tracking-widest text-sm uppercase block mb-2 bg-cyan/10 inline-block px-3 py-1 rounded-md">
                  {event.year}
                </span>
                <h3 className="text-2xl font-bold text-text mb-3 leading-tight">{event.title}</h3>
                <p className="text-muted leading-relaxed max-w-2xl text-lg">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
