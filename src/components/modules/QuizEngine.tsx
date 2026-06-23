import React, { useState, useCallback } from 'react';
import { useXP } from '../../context/XPContext';
import { HelpCircle, CheckCircle, XCircle, Brain, Timer, CheckSquare, ChevronRight, RefreshCw } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

type QuestionType = 'multiple-choice' | 'multi-select' | 'boolean' | 'retrieval';

interface Question {
  text: string;
  options: string[];
  correctIndex?: number; // For single choice
  correctIndices?: number[]; // For multi-select
  explanation: string;
  topic: string;
  type: QuestionType;
  srsLevel?: number; // 0-5 for Spaced Repetition mastery
}

interface QuizEngineProps {
  onComplete?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ onComplete }) => {
  const { addXp, addToast } = useXP();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const questions: Question[] = [
    {
      text: 'Which keyword is used to define a function in Python?',
      options: ['function', 'def', 'func', 'define'],
      correctIndex: 1,
      explanation: 'The def keyword introduces a function definition in Python.',
      topic: 'Python Syntax',
      type: 'multiple-choice',
      srsLevel: 3
    },
    {
      text: 'Which of the following are valid Python numeric types?',
      options: ['int', 'float', 'complex', 'double'],
      correctIndices: [0, 1, 2],
      explanation: 'Python 3 has int, float, and complex. "double" is not a separate type in Python.',
      topic: 'Python Syntax',
      type: 'multi-select',
      srsLevel: 1
    },
    {
      text: 'Is Python an interpreted language?',
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: 'Python is an interpreted, high-level, general-purpose programming language.',
      topic: 'Architectural Concepts',
      type: 'boolean',
      srsLevel: 5
    },
    {
      text: 'Explain the purpose of the "self" parameter in Python class methods.',
      options: ['It refers to the instance of the class.', 'It is a keyword like "this" in Java.', 'It allows access to attributes and methods.', 'All of the above.'],
      correctIndex: 3,
      explanation: 'Self represents the instance of the object itself, allowing the method to access class attributes.',
      topic: 'OOP Concepts',
      type: 'retrieval',
      srsLevel: 2
    }
  ];

  const totalQuestions = questions.length;
  const question = questions[currentQuestionIndex];

  const handleSubmit = () => {
    const isMulti = question.type === 'multi-select';
    if (!isMulti && selectedAnswer === null) return;
    if (isMulti && selectedAnswers.length === 0) return;

    setSubmitted(true);
    
    const isCorrect = isMulti
      ? selectedAnswers.length === (question.correctIndices?.length || 0) && 
        selectedAnswers.every(idx => question.correctIndices?.includes(idx))
      : selectedAnswer === question.correctIndex;

    const topic = question.topic;
    analyticsService.recordQuizAnswer(topic, isCorrect, question.text, question.explanation);

    if (isCorrect) {
      addXp(25, 'Quiz question answered correctly');
      addToast('success', '+25 XP — Correct!');
      setScore(prev => prev + 1);
    } else {
      addToast('error', 'Incorrect. Review the explanation.');
    }
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setSubmitted(false);
      setRecallRevealed(false);
    } else {
      setShowResultModal(true);
      if (onComplete) onComplete();
    }
  }, [currentQuestionIndex, totalQuestions, onComplete]);

  const handleToggleMulti = (idx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

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
    <div ref={containerRef} tabIndex={0} className="p-6 space-y-5 w-full max-w-xl outline-none focus:ring-2 focus:ring-cyan/30 rounded-2xl bg-panel/30 border border-line/50">
      <div className="flex items-start justify-between border-b border-line pb-4 gap-2">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-cyan/10 rounded-lg shrink-0">
            {question.type === 'retrieval' ? <Brain className="w-4 h-4 text-cyan" /> : <HelpCircle className="w-4 h-4 text-cyan" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-xs uppercase text-text tracking-wider leading-tight break-words">Quiz: Python Mastery</h3>
            <div className="flex items-center space-x-2 mt-1 min-w-0 overflow-hidden">
              <span className="text-[10px] text-muted flex items-center min-w-0">
                <Timer className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">Spaced Repetition Active</span>
              </span>
              <div className="flex space-x-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1 rounded-full ${i < (question.srsLevel || 0) ? 'bg-cyan' : 'bg-line'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted bg-bg border border-line px-2 py-1 rounded-md shrink-0">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan uppercase tracking-widest">{question.type.replace('-', ' ')}</span>
            {question.type === 'retrieval' && !recallRevealed && (
              <span className="text-[10px] text-muted italic">Retrieval Practice</span>
            )}
          </div>
          <p className="text-sm font-semibold text-text leading-relaxed">
            {question.text}
          </p>
        </div>

        {question.type === 'retrieval' && !recallRevealed ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-line rounded-2xl bg-bg/20">
            <div className="w-12 h-12 bg-cyan/5 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-6 h-6 text-cyan/50" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-text">Recall the answer in your mind</p>
              <p className="text-[10px] text-muted mt-1">Don't rush! Active recall builds stronger connections.</p>
            </div>
            <button
              onClick={() => setRecallRevealed(true)}
              className="flex items-center space-x-2 bg-text text-bg px-6 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
            >
              <span>Reveal Options</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {question.options.map((opt, idx) => {
              const isMulti = question.type === 'multi-select';
              const isSelected = isMulti ? selectedAnswers.includes(idx) : selectedAnswer === idx;
              const isCorrect = isMulti ? question.correctIndices?.includes(idx) : idx === question.correctIndex;
              
              let optionStyle = 'border-line text-text hover:border-cyan/50 hover:bg-cyan/5';
              if (isSelected) {
                optionStyle = 'border-cyan bg-cyan/10 text-cyan';
              }
              if (submitted) {
                if (isCorrect) {
                  optionStyle = 'border-green bg-green/10 text-green font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]';
                } else if (isSelected) {
                  optionStyle = 'border-red bg-red/10 text-red';
                } else {
                  optionStyle = 'border-line opacity-40 text-muted';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => isMulti ? handleToggleMulti(idx) : setSelectedAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${optionStyle} ${!submitted ? 'cursor-pointer group' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-cyan border-cyan' : 'border-line group-hover:border-cyan/50'
                    }`}>
                      {isSelected && (
                        isMulti ? <CheckSquare className="w-3.5 h-3.5 text-bg" /> : <div className="w-2 h-2 rounded-full bg-bg" />
                      )}
                    </div>
                    <span>{opt}</span>
                  </div>
                  {submitted && isCorrect && <CheckCircle className="w-4.5 h-4.5 text-green" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-4.5 h-4.5 text-red" />}
                </button>
              );
            })}
          </div>
        )}

        {submitted && (
          <div className="p-4 bg-bg/50 border border-line rounded-xl text-[11px] text-muted leading-relaxed animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-3 h-3 text-cyan" />
              <span className="font-bold text-text uppercase tracking-widest text-[9px]">Deep Insight</span>
            </div>
            {question.explanation}
          </div>
        )}

        {submitted ? (
          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer bg-cyan hover:bg-cyan2 text-bg shadow-lg shadow-cyan/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>{currentQuestionIndex < questions.length - 1 ? 'Next Challenge' : 'See Results'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          (!question.type.includes('retrieval') || recallRevealed) && (
            <button
              onClick={handleSubmit}
              disabled={question.type === 'multi-select' ? selectedAnswers.length === 0 : selectedAnswer === null}
              className={`w-full font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 ${
                (question.type === 'multi-select' ? selectedAnswers.length === 0 : selectedAnswer === null)
                  ? 'bg-line text-muted cursor-not-allowed opacity-50' 
                  : 'bg-cyan hover:bg-cyan2 text-bg shadow-cyan/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Verify Answer (+25 XP)</span>
            </button>
          )
        )}
      </div>

      {showResultModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div className="bg-bg border border-line rounded-3xl p-10 max-w-sm w-full flex flex-col items-center text-center shadow-2xl scale-100 animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-cyan/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-cyan" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green text-bg text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                +100 XP
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Mastery Updated</h2>
            <p className="text-muted text-sm mb-8 leading-relaxed">
              Your retrieval performance was exceptional. <br/>
              Next review in <span className="text-cyan font-bold">4 days</span>.
            </p>
            
            <div className="w-full bg-panel rounded-2xl p-4 mb-8 space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                <span>Accuracy</span>
                <span className="text-text">{Math.round((score/questions.length)*100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan transition-all duration-1000" 
                  style={{ width: `${(score/questions.length)*100}%` }}
                />
              </div>
            </div>

            <button 
              onClick={handleCloseModal}
              className="bg-text text-bg hover:bg-text/90 px-10 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer w-full hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Continue Journey</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
