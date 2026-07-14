import React from 'react';
import { LEARNER_AVATARS, hashNum } from './socialUtils';

// ── Shared "social proof + reactions" primitives ─────────────────────────────
// Lightweight, presentational helpers used across the Learning Path and
// Course Detail pages to give the product a modern, social feel.

export const AvatarStack: React.FC<{ seed: string; count?: number; size?: number }> = ({ seed, count = 3, size = 22 }) => {
  const start = hashNum(seed, 0, LEARNER_AVATARS.length - 1);
  return (
    <div className="flex items-center -space-x-2 shrink-0">
      {Array.from({ length: count }, (_, i) => (
        <img
          key={i}
          src={LEARNER_AVATARS[(start + i) % LEARNER_AVATARS.length]}
          alt=""
          style={{ width: size, height: size }}
          className="rounded-full border-2 border-panel object-cover"
        />
      ))}
    </div>
  );
};

export const ReactionPill: React.FC<{
  icon: React.ReactNode; count?: number; active?: boolean;
  activeClass: string; label: string; onClick: (e: React.MouseEvent) => void;
}> = ({ icon, count, active = false, activeClass, label, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all active:scale-90 ${
      active ? activeClass : 'bg-bg border-line/60 text-muted hover:text-text hover:border-line'
    }`}
  >
    <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</span>
    {count !== undefined && <span className="tabular-nums">{count}</span>}
    <span className="uppercase tracking-wider">{label}</span>
  </button>
);
