import React from 'react';
import Modal from './Modal';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  achievementName?: string;
  points?: number;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  achievementName,
  points
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="relative flex flex-col items-center text-center py-4 space-y-6 overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow/20 blur-[60px] -z-10 animate-pulse" />
        
        {/* Hero Illustration/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-yellow/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative p-6 bg-gradient-to-br from-yellow to-orange rounded-3xl shadow-xl shadow-yellow/20 rotate-3">
            <Trophy size={64} className="text-panel" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-yellow animate-bounce" size={24} />
          <Star className="absolute -bottom-4 -left-4 text-purple animate-ping duration-[3000ms]" size={20} />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-text bg-gradient-to-r from-yellow via-white to-yellow bg-clip-text">
            {title}
          </h2>
          <p className="text-muted text-lg">
            {subtitle}
          </p>
        </div>

        {achievementName && (
          <div className="px-6 py-4 bg-panel2 rounded-2xl border border-line w-full">
            <p className="text-sm uppercase tracking-widest text-muted font-bold mb-1">UNLOCKED</p>
            <p className="text-xl font-display font-bold text-cyan">{achievementName}</p>
            {points && (
              <div className="mt-2 text-sm text-yellow font-mono">
                +{points} XP EARNED
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-text text-panel font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/40"
        >
          Collect Rewards
        </button>
      </div>
    </Modal>
  );
};

export default CelebrationModal;
