import React, { useState } from 'react';
import { Brain, Zap, Star, X } from 'lucide-react';
import type { SelfAssessmentLevel } from '../../types';

interface SelfAssessmentStripProps {
  currentLevel: SelfAssessmentLevel;
  onChange: (level: SelfAssessmentLevel) => void;
  isEnrolled: boolean;
}

const LEVELS: { key: SelfAssessmentLevel; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'nothing',
    label: 'I Know Nothing',
    sublabel: 'Start from the very beginning',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-orange',
  },
  {
    key: 'basics',
    label: 'I Know the Basics',
    sublabel: 'Familiar with fundamentals',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-cyan',
  },
  {
    key: 'experience',
    label: 'I Have Experience',
    sublabel: 'Ready to advance quickly',
    icon: <Star className="w-4 h-4" />,
    color: 'text-purple',
  },
];

// -- Diagnostic mini-quiz (REQ-TRACK-002) --
const QUIZ_QUESTIONS = [
  {
    q: 'Have you written any code in the language covered by this track?',
    options: ['Never', 'A little bit', 'Yes, regularly'],
    weights: [0, 1, 2],
  },
  {
    q: 'Have you completed any formal or structured course on this topic before?',
    options: ['No', 'An intro course', 'Multiple courses'],
    weights: [0, 1, 2],
  },
  {
    q: 'Can you explain what a function or method is without looking it up?',
    options: ["Not really", 'I have a rough idea', 'Yes, confidently'],
    weights: [0, 1, 2],
  },
  {
    q: 'Have you built any project (even personal/hobby) related to this domain?',
    options: ['No project', 'One small project', 'Multiple projects'],
    weights: [0, 1, 2],
  },
];

const scoreToLevel = (score: number): SelfAssessmentLevel => {
  if (score <= 2) return 'nothing';
  if (score <= 5) return 'basics';
  return 'experience';
};

export const SelfAssessmentStrip: React.FC<SelfAssessmentStripProps> = ({
  currentLevel,
  onChange,
  isEnrolled,
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<SelfAssessmentLevel | null>(null);

  const handleQuizAnswer = (weight: number) => {
    const newAnswers = [...answers, weight];
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setQuizStep(s => s + 1);
    } else {
      const total = newAnswers.reduce((a, b) => a + b, 0);
      const rec = scoreToLevel(total);
      setQuizResult(rec);
      setAnswers(newAnswers);
    }
  };

  const applyQuizResult = () => {
    if (quizResult) {
      onChange(quizResult);
      setShowQuiz(false);
      setQuizStep(0);
      setAnswers([]);
      setQuizResult(null);
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuizStep(0);
    setAnswers([]);
    setQuizResult(null);
  };

  const levelConfig: Record<SelfAssessmentLevel, { accent: string; bg: string; ring: string }> = {
    nothing:    { accent: 'border-orange/50 text-orange',    bg: 'bg-orange/10',   ring: 'ring-orange/20' },
    basics:     { accent: 'border-cyan/50 text-cyan',        bg: 'bg-cyan/10',     ring: 'ring-cyan/20' },
    experience: { accent: 'border-purple/50 text-purple',    bg: 'bg-purple/10',   ring: 'ring-purple/20' },
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-1 p-1 bg-bg border border-line rounded-xl w-full lg:w-fit">
          {LEVELS.map(lvl => {
            const isActive = currentLevel === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => onChange(lvl.key)}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all text-center whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-panel text-cyan shadow-sm border border-line'
                    : 'bg-panel/20 text-muted hover:text-text border border-line/60 hover:border-line'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
        
        {!showQuiz && (
          <div className="text-[10px] font-bold text-muted">
            Not sure? <button onClick={() => setShowQuiz(true)} className="text-cyan hover:underline cursor-pointer">Find out here</button>
          </div>
        )}
      </div>

      {/* Skippable notice */}
      {!showQuiz && !isEnrolled && (
        <p className="text-[10px] text-muted italic">
          Enroll to activate skippable highlighting based on your level.
        </p>
      )}

      {/* Diagnostic Quiz Panel */}
      {showQuiz && (
        <div className="bg-bg border border-line rounded-xl p-5 space-y-5 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan">
              Diagnostic Quiz — {quizResult ? 'Result' : `${quizStep + 1} / ${QUIZ_QUESTIONS.length}`}
            </span>
            <button onClick={resetQuiz} className="text-muted hover:text-text p-1 rounded transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {quizResult ? (
            /* Result Screen */
            <div className="space-y-4 text-center">
              <div className={`text-4xl font-black ${levelConfig[quizResult].accent.split(' ')[1]}`}>
                {quizResult === 'nothing' ? '🌱' : quizResult === 'basics' ? '⚡' : '🚀'}
              </div>
              <div>
                <div className="text-base font-black text-text mb-1">
                  We recommend: <span className={levelConfig[quizResult].accent.split(' ')[1]}>
                    {LEVELS.find(l => l.key === quizResult)?.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  Based on your answers, this starting level will optimize your learning path.
                  You can always adjust it manually.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={applyQuizResult}
                  className="bg-cyan hover:bg-cyan2 text-bg text-[11px] font-black px-5 py-2 rounded-lg transition-all"
                >
                  Apply This Level
                </button>
                <button
                  onClick={resetQuiz}
                  className="bg-bg border border-line text-text text-[11px] font-bold px-4 py-2 rounded-lg transition-all hover:border-cyan/30"
                >
                  Keep Current
                </button>
              </div>
            </div>
          ) : (
            /* Question Screen */
            <div className="space-y-4">
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < quizStep ? 'bg-cyan' : i === quizStep ? 'bg-cyan/50' : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-text leading-relaxed">
                {QUIZ_QUESTIONS[quizStep].q}
              </p>
              <div className="space-y-2">
                {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[quizStep].weights[i])}
                    className="w-full text-left px-4 py-3 rounded-xl border border-line hover:border-cyan/40 hover:bg-cyan/5 text-[12px] font-bold text-text transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
