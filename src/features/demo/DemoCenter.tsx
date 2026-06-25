import React from 'react';
import { useModal } from '../../context/ModalContext';
import { Sparkles, AlertCircle, BookOpen, Award, Bell, ArrowRight, ArrowLeft } from 'lucide-react';

interface DemoCenterProps {
  onNavigate: (page: string) => void;
}

export const DemoCenter: React.FC<DemoCenterProps> = ({ onNavigate }) => {
  const { openModal } = useModal();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-1 p-2 rounded-xl border border-line bg-bg hover:border-cyan text-muted hover:text-cyan transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-cyan" />
            <h1 className="text-2xl font-black text-text">Developer Demo Center</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <p className="text-sm text-muted">
            Access developer tools, UI showcases, and interactive sandboxes for testing system components.
          </p>
        </div>
      </div>

      {/* Notification Test Lab Link */}
      <button
        onClick={() => onNavigate('notification-test')}
        className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan/10 rounded-xl">
            <Bell className="w-6 h-6 text-cyan" />
          </div>
          <div className="text-left">
            <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Notification Test Lab</span>
            <span className="block text-sm text-muted mt-1">Fire, inspect and customize all notification types in real-time, including toast gestures.</span>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
      </button>

      {/* Modal System Showcase */}
      <div className="bg-panel border border-line rounded-2xl p-8 space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-cyan" />
          <h2 className="text-xl font-bold font-display">Modal System Showcase</h2>
        </div>
        <p className="text-muted text-sm">
          Experience the high-fidelity modal overlay system with focus trapping, responsive design, and premium animations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => openModal('confirmation', {
              title: 'Reset Progress?',
              description: 'This action is irreversible. All your module progress and quiz scores will be permanently deleted.',
              props: {
                onConfirm: () => console.log('Reset confirmed'),
                confirmText: 'Yes, Reset All',
                variant: 'danger'
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-red/10 border border-red/20 rounded-xl hover:bg-red/20 transition-all group cursor-pointer"
          >
            <AlertCircle className="w-8 h-8 text-red mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-red">Confirmation</span>
          </button>

          <button
            onClick={() => openModal('form', {
              title: 'Add Learning Note',
              props: {
                onSubmit: (data: unknown) => console.log('Form submitted', data),
                children: (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted">Topic</label>
                      <input 
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-text focus:border-cyan !outline-none transition-all" 
                        placeholder="e.g. Asynchronous Python"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted">Note</label>
                      <textarea 
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-text focus:border-cyan !outline-none transition-all min-h-[120px]" 
                        placeholder="What did you learn today?"
                      />
                    </div>
                  </div>
                )
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-cyan/10 border border-cyan/20 rounded-xl hover:bg-cyan/20 transition-all group cursor-pointer"
          >
            <BookOpen className="w-8 h-8 text-cyan mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-cyan">Form Entry</span>
          </button>

          <button
            onClick={() => openModal('celebration', {
              title: 'New Rank: Alchemist!',
              description: 'You have mastered the fundamental transformations of code.',
              props: {
                achievementName: 'Master of Reactivity',
                points: 500
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-yellow/10 border border-yellow/20 rounded-xl hover:bg-yellow/20 transition-all group cursor-pointer"
          >
            <Award className="w-8 h-8 text-yellow mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-yellow">Celebration</span>
          </button>

          <button
            onClick={() => openModal('quiz', {
              props: {
                questions: [
                  { 
                    id: 1, 
                    text: 'Which hook should be used for side effects in React?', 
                    options: ['useState', 'useEffect', 'useContext', 'useReducer'] 
                  },
                  { 
                    id: 2, 
                    text: 'What is the purpose of React.memo()?', 
                    options: ['State management', 'Routing', 'Performance optimization', 'Styling'] 
                  }
                ],
                onComplete: (answers: unknown) => console.log('Quiz complete', answers)
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-purple/10 border border-purple/20 rounded-xl hover:bg-purple/20 transition-all group cursor-pointer"
          >
            <Sparkles className="w-8 h-8 text-purple mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-purple">Multi-step Quiz</span>
          </button>
        </div>
      </div>

    </div>
  );
};
