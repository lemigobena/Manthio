import React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lesson } from '../../../types';

interface PlayerBottomBarProps {
  currentLesson: Lesson;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
}

export const PlayerBottomBar: React.FC<PlayerBottomBarProps> = ({
  currentLesson,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onMarkComplete
}) => {
  // If the system can automatically detect completion (like a Quiz passing, or Video watching),
  // we might want to hide manual mark complete. For now, following REQ-PLAYER-063:
  // Lessons retain manual affordance only when system cannot detect. 
  // We'll mock auto-detectable by hiding the manual button if it's already completed.
  const isCompleted = currentLesson.status === 'completed';

  return (
    <div className="bg-panel border-t border-line px-4 py-3 md:px-6 md:py-4 flex items-center justify-between z-20 shrink-0">
      <button 
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${
          hasPrevious ? 'bg-bg hover:bg-line border border-line text-text cursor-pointer' : 'opacity-50 cursor-not-allowed text-muted'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous Lesson</span>
      </button>
      
      <div className="flex-1 flex justify-center px-4">
        {!isCompleted ? (
          <button 
            onClick={onMarkComplete}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-cyan/20"
          >
            <span>MARK AS DONE (+50 XP)</span>
          </button>
        ) : (
          <button 
            disabled
            className="bg-bg border border-green/30 text-green text-xs font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 opacity-80 cursor-default"
          >
            <Check className="w-4 h-4 stroke-[3px]" />
            <span>COMPLETED</span>
          </button>
        )}
      </div>

      <button 
        onClick={onNext}
        disabled={!hasNext}
        className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${
          hasNext ? 'bg-bg hover:bg-line border border-line text-text cursor-pointer' : 'opacity-50 cursor-not-allowed text-muted'
        }`}
      >
        <span className="hidden sm:inline">Next Lesson</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
