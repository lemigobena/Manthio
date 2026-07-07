import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useXP } from '../../context/XPContext';
import { HelpCircle, CheckCircle, XCircle, Brain, Timer, CheckSquare, ChevronRight, RefreshCw, Play, Trophy, Keyboard } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

type QuestionType = 'multiple-choice' | 'multi-select' | 'boolean' | 'retrieval' | 'text-input';
type QuizPhase = 'intro' | 'quiz' | 'result';

interface Question {
  text: string;
  options?: string[]; // Optional for text-input
  correctIndex?: number; // For single choice
  correctIndices?: number[]; // For multi-select
  correctAnswer?: string; // For text-input
  explanation: string;
  topic: string;
  type: QuestionType;
  srsLevel?: number; // 0-5 for Spaced Repetition mastery
}

interface QuizEngineProps {
  onComplete?: () => void;
  timeLimit?: number; // in seconds
  passingThreshold?: number; // percentage
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ onComplete, timeLimit = 300, passingThreshold = 70 }) => {
  const { addXp, addToast } = useXP();
  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [textInput, setTextInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      text: 'What do we call the process of repeating information at increasing intervals?',
      correctAnswer: 'Spaced Repetition',
      explanation: 'Spaced repetition is a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material.',
      topic: 'Learning Science',
      type: 'text-input',
      srsLevel: 2
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

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerActive && timeLeft > 0 && phase === 'quiz') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPhase('result');
            setTimerActive(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, phase, onComplete]);

  const startQuiz = () => {
    setPhase('quiz');
    setTimerActive(true);
  };

  const handleSubmit = () => {
    const isMulti = question.type === 'multi-select';
    const isText = question.type === 'text-input';
    
    if (!isMulti && !isText && selectedAnswer === null) return;
    if (isMulti && selectedAnswers.length === 0) return;
    if (isText && !textInput.trim()) return;

    setSubmitted(true);
    
    const isCorrect = isMulti
      ? selectedAnswers.length === (question.correctIndices?.length || 0) &&
        selectedAnswers.every(idx => question.correctIndices?.includes(idx))
      : isText
        ? textInput.trim().toLowerCase() === question.correctAnswer?.toLowerCase()
        : selectedAnswer === question.correctIndex;

    analyticsService.recordQuizAnswer(question.topic, isCorrect, question.text, question.explanation);

    if (isCorrect) {
      addXp(25, 'Quiz question answered correctly');
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
      setTextInput('');
      setSubmitted(false);
      setRecallRevealed(false);
    } else {
      setPhase('result');
      setTimerActive(false);
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
    setPhase('intro');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setTextInput('');
    setSubmitted(false);
    setScore(0);
    setTimeLeft(timeLimit);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (phase === 'intro') {
    return (
      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 w-full max-w-3xl rounded-2xl bg-panel/30 border border-line/50 text-center flex flex-col items-center mx-auto">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan/10 rounded-full flex items-center justify-center mb-1 sm:mb-2">
          <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-cyan animate-pulse" />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-text leading-tight px-2">Python Mastery Assessment</h2>
          <p className="text-[11px] sm:text-sm text-muted max-w-xs mx-auto">Validate your understanding of Python syntax and core architectural concepts.</p>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 w-full pt-2 sm:pt-4">
          <div className="p-3 sm:p-4 bg-bg/50 rounded-2xl border border-line flex flex-row xs:flex-col items-center justify-between xs:justify-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan" />
            <div className="text-right xs:text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-muted uppercase">Questions</p>
              <p className="text-xs sm:text-sm font-bold text-text">{questions.length}</p>
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-bg/50 rounded-2xl border border-line flex flex-row xs:flex-col items-center justify-between xs:justify-center gap-2">
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan" />
            <div className="text-right xs:text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-muted uppercase">Time Limit</p>
              <p className="text-xs sm:text-sm font-bold text-text">{formatTime(timeLimit)}</p>
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-bg/50 rounded-2xl border border-line flex flex-row xs:flex-col items-center justify-between xs:justify-center gap-2">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan" />
            <div className="text-right xs:text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-muted uppercase">Pass At</p>
              <p className="text-xs sm:text-sm font-bold text-text">{passingThreshold}%</p>
            </div>
          </div>
        </div>

        <button 
          onClick={startQuiz}
          className="w-full mt-4 sm:mt-6 bg-cyan hover:bg-cyan2 text-bg py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-cyan/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
        >
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Initialize Assessment</span>
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const accuracy = Math.round((score / questions.length) * 100);
    const passed = accuracy >= passingThreshold;

    return (
      <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 w-full max-w-3xl rounded-2xl bg-panel/30 border border-line/50 text-center flex flex-col items-center mx-auto">
        <div className="relative">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${passed ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
            {passed ? <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" /> : <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />}
          </div>
          <div className={`absolute -top-1 -right-2 sm:-top-2 sm:-right-4 px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-bold shadow-lg ${passed ? 'bg-green text-bg' : 'bg-red text-bg'}`}>
            {accuracy}% ACCURACY
          </div>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-text leading-tight">{passed ? 'Mastery Confirmed' : 'Assessment Incomplete'}</h2>
          <p className="text-[11px] sm:text-sm text-muted px-4">
            {passed 
              ? 'You have demonstrated sufficient understanding to proceed to the next module.' 
              : 'Your score was below the passing threshold. Review the material and try again.'}
          </p>
        </div>

        <div className="w-full space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <div className="bg-bg/50 border border-line rounded-2xl p-4 sm:p-6 flex items-center justify-around">
            <div className="text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-muted uppercase tracking-widest mb-1">XP Earned</p>
              <p className="text-xl sm:text-2xl font-bold text-cyan">+{score * 25}</p>
            </div>
            <div className="w-px h-8 sm:h-10 bg-line" />
            <div className="text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Next Review</p>
              <p className="text-xl sm:text-2xl font-bold text-text">{passed ? '4 Days' : 'Soon'}</p>
            </div>
          </div>

          <button 
            onClick={handleCloseModal}
            className="w-full bg-cyan text-bg py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{passed ? 'Continue Learning' : 'Retry Assessment'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-4 sm:p-6 space-y-4 sm:space-y-5 w-full max-w-3xl outline-none rounded-2xl bg-panel/30 border border-line/50 relative overflow-hidden mx-auto">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-line/20">
        <div 
          className="h-full bg-cyan transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,245,228,0.5)]"
          style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex items-start justify-between border-b border-line pb-4 gap-2 pt-2">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-cyan/10 rounded-lg shrink-0">
            {question.type === 'retrieval' ? <Brain className="w-4 h-4 text-cyan" /> : <HelpCircle className="w-4 h-4 text-cyan" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-xs uppercase text-text tracking-wider leading-tight truncate">Quiz: Python Mastery</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[10px] text-muted flex items-center">
                <Timer className="w-3 h-3 mr-1" />
                <span className={timeLeft < 60 ? 'text-red font-bold animate-pulse' : ''}>{formatTime(timeLeft)} remaining</span>
              </span>
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
            <Brain className="w-10 h-10 text-cyan/30 animate-pulse" />
            <div className="text-center px-6">
              <p className="text-xs font-bold text-text">Active Recall Initiative</p>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">Cognitive science shows that forcing your brain to retrieve info builds stronger neural paths than re-reading.</p>
            </div>
            <button
              onClick={() => setRecallRevealed(true)}
              className="flex items-center space-x-2 bg-cyan text-bg px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
            >
              <span>Verify My Knowledge</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : question.type === 'text-input' ? (
          <div className="space-y-3">
            <div className="relative group">
              <Keyboard className="absolute left-4 top-4 w-4 h-4 text-muted group-focus-within:text-cyan transition-colors" />
              <input 
                type="text"
                autoFocus
                disabled={submitted}
                placeholder="Type your answer here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim() && !submitted) handleSubmit();
                  else if (e.key === 'Enter' && submitted) handleNext();
                }}
                className={`w-full bg-bg !border ${submitted ? '!border-line opacity-50' : '!border-line focus:!border-cyan'} !outline-none rounded-xl pl-12 pr-4 py-4 text-sm text-text !focus:outline-none !ring-0 transition-all placeholder:text-muted/50`}
              />
            </div>
            {submitted && (
               <div className={`text-[10px] font-bold uppercase tracking-wider ${textInput.toLowerCase().trim() === question.correctAnswer?.toLowerCase() ? 'text-green' : 'text-red'}`}>
                 Expected: <span className="font-mono">{question.correctAnswer}</span>
               </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {question.options?.map((opt, idx) => {
              const isMulti = question.type === 'multi-select';
              const isSelected = isMulti ? selectedAnswers.includes(idx) : selectedAnswer === idx;
              const isCorrectOptions = isMulti ? question.correctIndices?.includes(idx) : idx === question.correctIndex;
              
              let style = 'border-line text-muted hover:border-cyan/50 hover:bg-cyan/5';
              if (isSelected) style = 'border-cyan bg-cyan/10 text-cyan';
              if (submitted) {
                if (isCorrectOptions) style = 'border-green bg-green/10 text-green font-bold';
                else if (isSelected) style = 'border-red bg-red/10 text-red';
                else style = 'border-line opacity-40 grayscale';
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => isMulti ? handleToggleMulti(idx) : setSelectedAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${style} ${!submitted ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-cyan border-cyan' : 'border-line'}`}>
                      {isSelected && (isMulti ? <CheckSquare className="w-3.5 h-3.5 text-bg" /> : <div className="w-2 h-2 rounded-full bg-bg" />)}
                    </div>
                    <span>{opt}</span>
                  </div>
                  {submitted && isCorrectOptions && <CheckCircle className="w-4 h-4 text-green" />}
                  {submitted && isSelected && !isCorrectOptions && <XCircle className="w-4 h-4 text-red" />}
                </button>
              );
            })}
          </div>
        )}

        {submitted && (
          <div className="p-4 bg-cyan/5 border border-cyan/10 rounded-xl text-[11px] text-muted leading-relaxed animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-3.5 h-3.5 text-cyan" />
              <span className="font-bold text-text uppercase tracking-widest text-[9px]">Neural Feedback</span>
            </div>
            {question.explanation}
          </div>
        )}

        {submitted ? (
          <button
            onClick={handleNext}
            className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan/20 hover:scale-[1.02] active:scale-95"
          >
            <span>{currentQuestionIndex < questions.length - 1 ? 'Next Challenge' : 'Synthesize Results'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          (!question.type.includes('retrieval') || recallRevealed) && (
            <button
              onClick={handleSubmit}
              disabled={
                (question.type === 'multi-select' && selectedAnswers.length === 0) || 
                (question.type === 'text-input' && !textInput.trim()) ||
                (question.type !== 'multi-select' && question.type !== 'text-input' && selectedAnswer === null)
              }
              className={`w-full font-bold py-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg ${
                ((question.type === 'multi-select' && selectedAnswers.length === 0) || 
                 (question.type === 'text-input' && !textInput.trim()) ||
                 (question.type !== 'multi-select' && question.type !== 'text-input' && selectedAnswer === null))
                  ? 'bg-line/50 text-muted opacity-50 cursor-not-allowed' 
                  : 'bg-cyan hover:bg-cyan2 text-bg shadow-cyan/20 hover:scale-[1.02] active:scale-95 transition-all'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Verify Answer (+25 XP)</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
