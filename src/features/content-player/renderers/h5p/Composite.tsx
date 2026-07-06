import React, { useState } from 'react';
import type { H5PCompositeData } from '../../../../types';
import { H5PNode } from '../H5PNode';

interface CompositeProps {
  data: H5PCompositeData;
  onComplete: (scorePercentage?: number) => void;
}

export const Composite: React.FC<CompositeProps> = ({ data, onComplete }) => {
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [scores, setScores] = useState<Record<number, number>>({});

  const handleItemComplete = (index: number, scorePercentage?: number) => {
    const newCompleted = new Set(completedItems);
    newCompleted.add(index);
    setCompletedItems(newCompleted);

    if (scorePercentage !== undefined) {
      setScores(prev => ({ ...prev, [index]: scorePercentage }));
    }

    if (newCompleted.size === data.items.length) {
      // Calculate average score if any
      const currentScores = { ...scores };
      if (scorePercentage !== undefined) {
        currentScores[index] = scorePercentage;
      }
      
      const scoreValues = Object.values(currentScores);
      if (scoreValues.length > 0) {
        const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
        onComplete(average);
      } else {
        onComplete(100);
      }
    }
  };

  return (
    <div className="w-full space-y-6 pb-6">
      {data.items.map((item, idx) => {
        const isCompleted = completedItems.has(idx);
        
        return (
          <div key={idx} className="relative bg-bg rounded-2xl border border-line p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 md:mb-5 pb-3 border-b border-line">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0 ${
                  isCompleted ? 'bg-green/10 text-green' : 'bg-cyan/10 text-cyan'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-text uppercase tracking-wide leading-tight">
                    Section {idx + 1}
                  </h2>
                  <p className="text-muted text-[10px] md:text-xs font-medium mt-0.5">
                    {item.type.replace(/([A-Z])/g, ' $1').trim()} Challenge
                  </p>
                </div>
              </div>
              {isCompleted && (
                <div className="bg-green/10 text-green px-3 py-1 rounded-lg font-bold text-xs flex items-center shrink-0">
                  ✓ Completed
                </div>
              )}
            </div>

            {/* H5P Content */}
            <div className={isCompleted ? 'opacity-80' : ''}>
              <H5PNode 
                data={item} 
                onComplete={(score) => handleItemComplete(idx, score)} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
