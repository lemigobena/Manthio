import React, { useState, useEffect, useRef } from 'react';

const MOCK_TRANSCRIPT = [
  { t: 0, text: "Welcome back everyone. In today's session, we are going to explore the core architecture that drives modern applications. We've spent the last few lessons discussing the theory, but now it's time to see it in action." },
  { t: 10, text: "If you look at the diagram on screen, you'll notice that the pipeline is split into three distinct phases. The ingestion phase, the processing phase, and finally the delivery phase. Each of these requires careful consideration." },
  { t: 25, text: "Now, a common mistake here is tightly coupling the processing phase to the ingestion phase. When you do that, your system loses scalability. Remember the principle of single responsibility we covered earlier?" }
];

const formatTime = (time: number) => {
  if (isNaN(time)) return '00:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const TranscriptTab: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{time: number}>;
      setCurrentTime(customEvent.detail.time);
    };
    window.addEventListener('video_time_update', handleTimeUpdate);
    return () => window.removeEventListener('video_time_update', handleTimeUpdate);
  }, []);

  useEffect(() => {
    const activeLine = MOCK_TRANSCRIPT.find(line => currentTime >= line.t && currentTime < line.t + 10);
    if (activeLine && containerRef.current && lineRefs.current[activeLine.t]) {
      const el = lineRefs.current[activeLine.t];
      const container = containerRef.current;
      if (el) {
        if (activeLine.t === 0) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } else {
          container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
        }
      }
    }
  }, [currentTime]);

  const jumpToTime = (t: number) => {
    window.dispatchEvent(new CustomEvent('video_jump', { detail: { time: t } }));
  };

  return (
    <div ref={containerRef} className="relative space-y-4 text-sm text-muted leading-relaxed h-full pr-2 overflow-y-auto custom-scrollbar">
      {MOCK_TRANSCRIPT.map(line => (
        <div 
          key={line.t}
          ref={el => { lineRefs.current[line.t] = el; }}
          className={`flex space-x-4 p-3 rounded-lg transition-colors cursor-pointer group ${currentTime >= line.t && currentTime < line.t + 10 ? 'bg-cyan/10 border border-cyan/20' : 'hover:bg-line/20 border border-transparent'}`} 
          onClick={() => jumpToTime(line.t)}
        >
          <span className="text-cyan font-mono text-xs pt-1 shrink-0 group-hover:text-cyan/80">
            {formatTime(line.t)}
          </span>
          <p className={currentTime >= line.t && currentTime < line.t + 10 ? 'text-text font-medium' : ''}>{line.text}</p>
        </div>
      ))}
    </div>
  );
};
