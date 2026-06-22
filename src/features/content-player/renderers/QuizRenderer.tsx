import React from 'react';
import { QuizEngine } from '../../../components/modules/QuizEngine';
import type { Lesson } from '../../../types';

interface QuizRendererProps {
  lesson: Lesson;
  onComplete: () => void;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({ onComplete }) => {
  return (
    <div className="w-full flex justify-center py-8">
      <QuizEngine onComplete={onComplete} />
    </div>
  );
};
