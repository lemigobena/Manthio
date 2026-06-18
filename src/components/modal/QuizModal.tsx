import React, { useState } from 'react';
import Modal from './Modal';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onComplete: (answers: Record<number, string>) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  questions,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const isLastStep = currentStep === questions.length - 1;
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(answers);
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const selectOption = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quiz: Step ${currentStep + 1} of ${questions.length}`} size="lg">
      <div className="space-y-8">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Question Area */}
        <div className="min-h-[300px] flex flex-col justify-center space-y-8 animate-in slide-in-from-right-8 duration-300">
          <h2 className="text-2xl font-display font-bold text-text leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => selectOption(option)}
                className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                  answers[currentQuestion.id] === option
                    ? 'border-cyan bg-cyan/5 text-cyan'
                    : 'border-line hover:border-muted text-muted hover:text-text'
                }`}
              >
                <span className="font-medium">{option}</span>
                {answers[currentQuestion.id] === option && <CheckCircle2 size={20} />}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-line">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-muted hover:text-text'
            }`}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              answers[currentQuestion.id]
                ? 'bg-cyan text-panel hover:bg-cyan2 shadow-cyan/20'
                : 'bg-line text-muted cursor-not-allowed shadow-none'
            }`}
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QuizModal;
