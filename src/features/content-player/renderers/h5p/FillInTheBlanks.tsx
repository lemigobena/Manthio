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
    <div className="w-full max-w-3xl mx-auto bg-panel border border-line rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-bold text-text mb-6">Fill in the missing words</h2>
      
      <div className="text-lg leading-loose text-text font-medium bg-bg/50 p-6 rounded-xl border border-line">
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
                  className={`w-32 px-3 py-1 bg-bg border-b-2 text-center focus:outline-none transition-colors ${
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

      <div className="mt-8 flex items-center justify-between">
        {results !== null && (
          <div className="flex items-center space-x-2">
            {results.every(r => r) ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green" />
                <span className="text-green font-bold">Perfect! All blanks are correct.</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red" />
                <span className="text-red font-bold">Some answers are incorrect. Please try again.</span>
              </>
            )}
          </div>
        )}
        <div className="flex-1" />
        <button
          onClick={handleCheck}
          className="bg-cyan hover:bg-cyan2 text-bg font-black px-8 py-3 rounded-xl transition-transform hover:-translate-y-0.5 shadow-lg shadow-cyan/20"
        >
          Check Answers
        </button>
      </div>
    </div>
  );
};
