import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';

interface QuizEngineProps {
  onComplete?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ onComplete }) => {
  const { addXp, addToast } = useXP();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = {
    text: 'Which keyword is used to define a function in Python?',
    options: ['function', 'def', 'func', 'define'],
    correctIndex: 1,
    explanation: 'The def keyword introduces a function definition in Python.'
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setSubmitted(true);
    
    if (selectedAnswer === question.correctIndex) {
      addXp(25, 'Quiz question answered correctly');
      addToast('success', '+25 XP — Correct!');
    } else {
      addToast('error', 'Wrong answer. See explanation.');
    }

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 space-y-4 max-w-lg">
      <div className="flex items-center space-x-2 border-b border-line pb-3">
        <HelpCircle className="w-4 h-4 text-cyan" />
        <h3 className="font-bold text-xs uppercase text-muted tracking-wider">Quiz: Python Basics</h3>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold text-text leading-relaxed">
          {question.text}
        </p>

        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.correctIndex;
            
            let optionStyle = 'border-line text-text hover:border-cyan/50';
            if (isSelected) {
              optionStyle = 'border-cyan bg-cyan/10 text-cyan';
            }
            if (submitted) {
              if (isCorrect) {
                optionStyle = 'border-green bg-green/10 text-green font-bold';
              } else if (isSelected) {
                optionStyle = 'border-red bg-red/10 text-red';
              } else {
                optionStyle = 'border-line opacity-50 text-muted';
              }
            }

            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => setSelectedAnswer(idx)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${optionStyle} ${!submitted ? 'cursor-pointer' : ''}`}
              >
                <span>{opt}</span>
                {submitted && isCorrect && <CheckCircle className="w-4.5 h-4.5 text-green" />}
                {submitted && isSelected && !isCorrect && <XCircle className="w-4.5 h-4.5 text-red" />}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className="p-3 bg-bg/50 border border-line rounded-xl text-[11px] text-muted leading-relaxed">
            <span className="font-bold text-text block mb-1">Explanation:</span>
            {question.explanation}
          </div>
        )}

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={`w-full font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
              selectedAnswer === null ? 'bg-line text-muted cursor-not-allowed' : 'bg-cyan hover:bg-cyan2 text-bg'
            }`}
          >
            Check Answer (+25 XP)
          </button>
        )}
      </div>
    </div>
  );
};
