import React, { useEffect, useState } from 'react';
import type { Lesson } from '../../../types';
import { H5PNode } from './H5PNode';

interface H5PRendererProps {
  lesson: Lesson;
  onComplete: (xpAmount?: number) => void;
}

export const H5PRenderer: React.FC<H5PRendererProps> = ({ lesson, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset completion state if lesson changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCompleted(false);
  }, [lesson.id]);

  const handleComplete = (scorePercentage?: number) => {
    if (!isCompleted) {
      setIsCompleted(true);
      // Let's assume standard H5P is 50 XP, but can be scaled by score.
      const xp = scorePercentage !== undefined ? Math.floor(50 * (scorePercentage / 100)) : 50;
      onComplete(Math.max(10, xp)); // Give at least 10 XP if completed
    }
  };

  const h5pData = lesson.h5pData;

  if (!h5pData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted">
        Error: No H5P data configured for this lesson.
      </div>
    );
  }

  const renderComponent = () => {
    return <H5PNode data={h5pData} onComplete={handleComplete} />;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-bg border-b border-line px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-text opacity-80">{lesson.title}</span>
          <span className="bg-cyan/10 px-2 py-0.5 rounded text-cyan text-[10px] font-bold uppercase tracking-wider">
            Interactive: {h5pData.type}
          </span>
        </div>
        {isCompleted && (
          <span className="text-green text-sm font-bold animate-fade-in">Completed!</span>
        )}
      </div>
      <div className="flex-1 w-full bg-bg relative p-4 md:p-6 overflow-hidden">
        {renderComponent()}
      </div>
    </div>
  );
};
