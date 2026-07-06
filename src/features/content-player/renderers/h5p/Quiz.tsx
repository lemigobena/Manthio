import React, { useState } from 'react';
import type { H5PQuizData } from '../../../../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizProps {
  data: H5PQuizData;
  onComplete: (scorePercentage?: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({ data, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correctCount = data.questions.filter(
      q => answers[q.id] === q.correctAnswerIndex
    ).length;
    const score = (correctCount / data.questions.length) * 100;
    onComplete(score);
  };

  const allAnswered = data.questions.length > 0 && Object.keys(answers).length === data.questions.length;

  return (
    <div className="w-full max-w-3xl mx-auto bg-panel border border-line rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-xl space-y-4 sm:space-y-8">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-text mb-1 sm:mb-2">Quiz</h2>
        <p className="text-xs sm:text-base text-muted">Answer all questions to complete the quiz.</p>
      </div>

      <div className="space-y-3 sm:space-y-6">
        {data.questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswerIndex;

          return (
            <div key={q.id} className="bg-bg/50 border border-line rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-text mb-3 sm:mb-6 leading-snug sm:leading-relaxed flex items-start">
                <span className="inline-flex shrink-0 items-center justify-center w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-cyan/10 text-cyan font-black mr-2 sm:mr-3 mt-0.5 sm:mt-0 text-xs sm:text-base">
                  {idx + 1}
                </span>
                <span>{q.question}</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  let btnClass = "border-line hover:border-cyan text-text bg-panel hover:bg-cyan/5";
                  
                  if (submitted) {
                    if (optIdx === q.correctAnswerIndex) {
                      btnClass = "border-green bg-green/10 text-green font-bold shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                    } else if (isSelected && !isCorrect) {
                      btnClass = "border-red bg-red/10 text-red";
                    } else {
                      btnClass = "border-line opacity-40 bg-panel";
                    }
                  } else if (isSelected) {
                    btnClass = "border-cyan bg-cyan/10 text-cyan font-bold ring-2 ring-cyan/20";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left px-3 py-2 sm:px-5 sm:py-4 rounded-lg sm:rounded-xl border transition-all duration-200 transform text-xs sm:text-base ${
                        !submitted && !isSelected ? 'hover:-translate-y-0.5' : ''
                      } ${btnClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              
              {submitted && (
                <div className="mt-4 flex items-center space-x-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green" />
                      <span className="text-sm font-bold text-green">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red" />
                      <span className="text-sm font-bold text-red">Incorrect.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center sm:justify-end pt-3 sm:pt-4 border-t border-line">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitted}
          className={`w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg text-sm sm:text-base ${
            !allAnswered || submitted
              ? 'bg-line text-muted cursor-not-allowed shadow-none'
              : 'bg-cyan hover:bg-cyan2 text-bg hover:-translate-y-0.5 shadow-cyan/20'
          }`}
        >
          {submitted ? 'Quiz Submitted' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
};
