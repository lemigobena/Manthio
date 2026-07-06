import React, { useState } from 'react';
import type { H5PFlashcardsData } from '../../../../types';
import { ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';

interface FlashcardsProps {
  data: H5PFlashcardsData;
  onComplete: (scorePercentage?: number) => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ data, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Mark as viewed when flipped
    const newViewed = new Set(viewedCards);
    newViewed.add(currentIndex);
    setViewedCards(newViewed);
    
    if (newViewed.size === data.cards.length && !completed) {
      setCompleted(true);
      onComplete(100);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const currentCard = data.cards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto bg-panel border border-line rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-text">Flashcards</h2>
        <span className="text-sm font-bold text-muted bg-bg px-3 py-1 rounded-full border border-line">
          {currentIndex + 1} / {data.cards.length}
        </span>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full h-56 sm:h-72 md:h-96 [perspective:1000px] cursor-pointer group"
        onClick={handleFlip}
      >
        <div 
          className={`w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-panel to-bg border border-line rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 sm:p-10 text-center shadow-lg group-hover:shadow-cyan/20 group-hover:border-cyan/50 transition-all duration-300">
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text to-cyan leading-tight">{currentCard.front}</h3>
            <p className="absolute bottom-4 sm:bottom-6 text-xs sm:text-sm text-cyan font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <RotateCw className="w-4 h-4 animate-spin-slow" /> Click to reveal
            </p>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-cyan/20 to-cyan/5 border-2 border-cyan rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 sm:p-10 text-center shadow-xl">
            <p className="text-xl sm:text-2xl text-text font-medium leading-relaxed">{currentCard.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col-reverse sm:flex-row justify-between items-center mt-6 md:mt-8 gap-4 sm:gap-0">
        <div className="flex justify-between w-full sm:w-auto gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-3 sm:px-4 py-2 font-bold rounded-lg transition-colors text-sm sm:text-base ${
              currentIndex === 0 ? 'text-muted opacity-50 cursor-not-allowed' : 'text-text hover:bg-line'
            }`}
          >
            Previous
          </button>
          
          {/* Mobile only next button, hidden on sm and above */}
          <button
            onClick={handleNext}
            disabled={currentIndex === data.cards.length - 1}
            className={`sm:hidden px-3 py-2 font-bold rounded-lg transition-colors flex items-center space-x-1 text-sm ${
              currentIndex === data.cards.length - 1 ? 'text-muted opacity-50 cursor-not-allowed' : 'text-cyan hover:bg-cyan/10'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {completed && (
          <div className="flex items-center space-x-2 text-green font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Completed</span>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={currentIndex === data.cards.length - 1}
          className={`hidden sm:flex px-4 py-2 font-bold rounded-lg transition-colors items-center space-x-2 text-base ${
            currentIndex === data.cards.length - 1 ? 'text-muted opacity-50 cursor-not-allowed' : 'text-cyan hover:bg-cyan/10'
          }`}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
