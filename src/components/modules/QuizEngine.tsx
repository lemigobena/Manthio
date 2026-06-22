import React, { useState, useCallback } from 'react';
import { useXP } from '../../context/XPContext';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

interface QuizEngineProps {
  onComplete?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ onComplete }) => {
  const { addXp, addToast } = useXP();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const questions = [
    {
      text: 'Which keyword is used to define a function in Python?',
      options: ['function', 'def', 'func', 'define'],
      correctIndex: 1,
      explanation: 'The def keyword introduces a function definition in Python.',
      topic: 'Python Syntax'
    },
    {
      text: 'What data type is the result of 3 / 2 in Python 3?',
      options: ['int', 'float', 'decimal', 'double'],
      correctIndex: 1,
      explanation: 'In Python 3, division with / always returns a float.',
      topic: 'Python Syntax'
    },
    {
      text: 'Which of these is NOT a core data structure in Python?',
      options: ['List', 'Dictionary', 'Array', 'Tuple'],
      correctIndex: 2,
      explanation: 'Array is not a built-in core data structure in Python (Lists are used instead). Arrays require importing the array module or using NumPy.',
      topic: 'OOP Concepts'
    },
    {
      text: 'Which block is executed in Python whether an exception is raised or not?',
      options: ['finally', 'except', 'catch', 'always'],
      correctIndex: 0,
      explanation: 'The finally block is always executed, clean-up code is typically placed there.',
      topic: 'Error Handling'
    }
  ];

  const totalQuestions = questions.length;
  const question = questions[currentQuestionIndex];

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setSubmitted(true);
    
    const isCorrect = selectedAnswer === question.correctIndex;
    const topic = question.topic;
    
    // Log performance in analytics service
    analyticsService.recordQuizAnswer(topic, isCorrect, question.text, question.explanation);

    if (isCorrect) {
      addXp(25, 'Quiz question answered correctly');
      addToast('success', '+25 XP — Correct!');
      setScore(prev => prev + 1);
    } else {
      addToast('error', 'Wrong answer. See explanation.');
    }
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      setShowResultModal(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentQuestionIndex, totalQuestions, onComplete]);

  const handleCloseModal = () => {
    setShowResultModal(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setScore(0);
  };

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    }
  }, [currentQuestionIndex]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        e.stopPropagation();
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        e.preventDefault();
        handlePrev();
      }
    };

    // To avoid conflicting with Video renderer arrows, we should ideally bind this to a ref 
    // or stop propagation, but since they are rendered together sometimes, we can attach to the document 
    // and rely on focus, or just let them both trigger (skipping video and changing question simultaneously).
    // A better approach is to bind to the container if it has focus, but standard practice for these apps 
    // is to just have the listener active when the component is mounted.
    const element = containerRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (element) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [currentQuestionIndex, submitted, handleNext, handlePrev]); // Depend on state to ensure handleNext has fresh state

  return (
    <div ref={containerRef} tabIndex={0} className="p-5 space-y-4 w-full max-w-lg outline-none focus:ring-2 focus:ring-cyan/30 rounded-2xl">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-cyan" />
          <h3 className="font-bold text-xs uppercase text-muted tracking-wider">Quiz: Python Basics</h3>
        </div>
        <span className="text-xs font-mono text-muted bg-panel px-2 py-0.5 rounded">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
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

        {submitted && (
          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer bg-cyan hover:bg-cyan2 text-bg"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
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

      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-bg border border-line rounded-2xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-cyan/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-cyan" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Quiz Completed!</h2>
            <p className="text-muted text-sm mb-6">
              You scored <span className="text-cyan font-bold text-lg mx-1">{score}</span> out of <span className="font-bold text-text mx-1">{questions.length}</span>.
            </p>
            <button 
              onClick={handleCloseModal}
              className="bg-cyan hover:bg-cyan2 text-bg px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-colors cursor-pointer w-full"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
