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
    <div className="w-full space-y-16 pb-16">
      {data.items.map((item, idx) => {
        const isCompleted = completedItems.has(idx);
        
        return (
          <div key={idx} className="relative bg-bg rounded-3xl border border-line p-6 md:p-10 shadow-lg hover:shadow-xl transition-shadow">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  isCompleted ? 'bg-green/10 text-green' : 'bg-cyan/10 text-cyan'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text uppercase tracking-wide">
                    Section {idx + 1}
                  </h2>
                  <p className="text-muted text-sm font-medium">
                    {item.type.replace(/([A-Z])/g, ' $1').trim()} Challenge
                  </p>
                </div>
              </div>
              {isCompleted && (
                <div className="bg-green/10 text-green px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  Completed
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
