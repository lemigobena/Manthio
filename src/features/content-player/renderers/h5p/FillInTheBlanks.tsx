import React, { useState } from 'react';
import type { H5PFillInTheBlanksData } from '../../../../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FillInTheBlanksProps {
  data: H5PFillInTheBlanksData;
  onComplete: (scorePercentage?: number) => void;
}

export const FillInTheBlanks: React.FC<FillInTheBlanksProps> = ({ data, onComplete }) => {
  // Extract parts of text split by __BLANK__
  const parts = data.text.split('__BLANK__');
  
  // State for user answers
  const [answers, setAnswers] = useState<string[]>(Array(data.blanks.length).fill(''));
  const [results, setResults] = useState<boolean[] | null>(null);
  
  const handleCheck = () => {
    const newResults = answers.map((answer, idx) => {
      const correctAnswers = data.blanks[idx].correctAnswers.map(a => a.toLowerCase().trim());
      return correctAnswers.includes(answer.toLowerCase().trim());
    });
    setResults(newResults);
    
    const correctCount = newResults.filter(r => r).length;
    const score = (correctCount / data.blanks.length) * 100;
    
    // Check if all are correct
    if (newResults.every(r => r)) {
      onComplete(score);
    } else if (newResults.some(r => r)) {
      // Partial completion can also submit score if desired, but let's 
      // just wait for perfect for this type. Or we can submit partial score?
      // The requirement says "When a learner finishes an activity... Score = 8/10".
      // Let's pass the score up if they click check.
      onComplete(score);
    } else {
      onComplete(0);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-panel border border-line rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
      <h2 className="text-lg md:text-xl font-bold text-text mb-4 md:mb-6">Fill in the missing words</h2>
      
      <div className="text-sm sm:text-base md:text-lg leading-loose text-text font-medium bg-bg/50 p-4 sm:p-6 rounded-xl border border-line">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <span className="inline-block mx-1 align-middle">
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                    setResults(null); // Reset results on change
                  }}
                  className={`w-28 sm:w-32 md:w-40 px-2 py-1 bg-bg border-b-2 text-center focus:outline-none transition-colors text-sm sm:text-base ${
                    results === null 
                      ? 'border-line focus:border-cyan text-text' 
                      : results[index] 
                        ? 'border-green text-green font-bold' 
                        : 'border-red text-red'
                  }`}
                  placeholder={data.blanks[index]?.hint || ''}
                />
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {results !== null && (
          <div className="flex items-center space-x-2 text-center sm:text-left">
            {results.every(r => r) ? (
              <>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green shrink-0" />
                <span className="text-green font-bold text-sm sm:text-base">Perfect! All blanks are correct.</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red shrink-0" />
                <span className="text-red font-bold text-sm sm:text-base">Some answers are incorrect. Please try again.</span>
              </>
            )}
          </div>
        )}
        <div className="flex-1 hidden sm:block" />
        <button
          onClick={handleCheck}
          className="w-full sm:w-auto bg-cyan hover:bg-cyan2 text-bg font-black px-6 md:px-8 py-2 md:py-3 rounded-xl transition-transform hover:-translate-y-0.5 shadow-lg shadow-cyan/20 text-sm md:text-base"
        >
          Check Answers
        </button>
      </div>
    </div>
  );
};
