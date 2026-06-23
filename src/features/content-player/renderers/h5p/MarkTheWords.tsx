import React, { useState } from 'react';
import type { H5PMarkTheWordsData } from '../../../../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MarkTheWordsProps {
  data: H5PMarkTheWordsData;
  onComplete: (scorePercentage?: number) => void;
}

export const MarkTheWords: React.FC<MarkTheWordsProps> = ({ data, onComplete }) => {
  // Split words by space for simplicity
  const words = data.text.split(' ');
  
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isChecked, setIsChecked] = useState(false);

  const toggleWord = (index: number) => {
    if (isChecked) return; // prevent toggling after check
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleCheck = () => {
    setIsChecked(true);
    
    // Calculate score
    let correctPicks = 0;
    selectedIndices.forEach(idx => {
      if (data.correctWordIndices.includes(idx)) correctPicks++;
    });
    
    const totalCorrectRequired = data.correctWordIndices.length;
    let score = (correctPicks / totalCorrectRequired) * 100;
    
    const wrongPicks = selectedIndices.size - correctPicks;
    score = Math.max(0, score - (wrongPicks * (100 / totalCorrectRequired)));

    onComplete(score);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-panel border border-line rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-bold text-text mb-6">Mark the correct words</h2>
      <p className="text-sm text-muted mb-4">Click on the words to select them.</p>
      
      <div className="text-lg leading-loose text-text font-medium bg-bg/50 p-6 rounded-xl border border-line flex flex-wrap gap-x-2 gap-y-3">
        {words.map((word, index) => {
          const isSelected = selectedIndices.has(index);
          const isCorrectAnswer = data.correctWordIndices.includes(index);
          
          let stateClasses: string;
          
          if (isChecked) {
            if (isSelected && isCorrectAnswer) {
              stateClasses = "bg-green text-bg font-bold border-green"; // Correctly selected
            } else if (isSelected && !isCorrectAnswer) {
              stateClasses = "bg-red text-bg font-bold border-red"; // Incorrectly selected
            } else if (!isSelected && isCorrectAnswer) {
              stateClasses = "border-orange border-2 text-orange font-bold border-dashed"; // Missed
            } else {
              stateClasses = "opacity-50 cursor-default border-transparent"; // Neither selected nor correct
            }
          } else if (isSelected) {
            stateClasses = "bg-cyan text-bg font-bold border-cyan cursor-pointer";
          } else {
            stateClasses = "border-transparent hover:bg-line/50 cursor-pointer";
          }

          return (
            <button
              key={index}
              onClick={() => toggleWord(index)}
              disabled={isChecked}
              className={`px-1.5 py-0.5 rounded transition-all border ${stateClasses}`}
            >
              {word}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        {isChecked && (
          <div className="flex items-center space-x-2">
            {Array.from(selectedIndices).every(i => data.correctWordIndices.includes(i)) && data.correctWordIndices.every(i => selectedIndices.has(i)) ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green" />
                <span className="text-green font-bold">Perfect! You found all the words.</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red" />
                <span className="text-red font-bold">Not quite right. Keep trying.</span>
              </>
            )}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex gap-4">
          {isChecked && (
            <button
              onClick={() => {
                setIsChecked(false);
                setSelectedIndices(new Set());
              }}
              className="bg-bg border border-line text-text hover:border-cyan/50 font-bold px-6 py-3 rounded-xl transition-all"
            >
              Retry
            </button>
          )}
          <button
            onClick={handleCheck}
            disabled={isChecked}
            className={`font-black px-8 py-3 rounded-xl transition-transform shadow-lg ${isChecked ? 'bg-line text-muted cursor-not-allowed shadow-none' : 'bg-cyan hover:bg-cyan2 text-bg hover:-translate-y-0.5 shadow-cyan/20'}`}
          >
            Check Answers
          </button>
        </div>
      </div>
    </div>
  );
};
