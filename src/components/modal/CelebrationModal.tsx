import React, { useMemo } from 'react';
import Modal from './Modal';
import { GraduationCap, Sparkles, Trophy } from 'lucide-react';

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
  // Restore the original falling confetti style
  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => {
      const colors = ['var(--cyan)', 'var(--purple)', 'var(--yellow)', 'var(--orange)', 'var(--green)'];
      return {
        id: i,
        // eslint-disable-next-line react-hooks/purity
        left:  `${Math.random() * 100}%`,
        // eslint-disable-next-line react-hooks/purity
        w:     `${Math.random() * 8 + 4}px`,
        // eslint-disable-next-line react-hooks/purity
        h:     `${Math.random() * 8 + 4}px`,
        bg:    colors[i % colors.length],
        // eslint-disable-next-line react-hooks/purity
        delay: `${Math.random() * 2}s`, 
        // eslint-disable-next-line react-hooks/purity
        dur:   `${3 + Math.random() * 2}s`,
      };
    }),
    [],
  );

  // Orbit dots remain for the elegant centerpiece
  const orbitDots = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size:   i % 2 === 0 ? 4 : 3,
      offset: `${(360 / 6) * i}deg`,
      color:  i % 3 === 0 ? 'bg-cyan' : i % 3 === 1 ? 'bg-purple' : 'bg-yellow',
      radius: 52 + (i % 2) * 8,
    })),
    [],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="relative flex flex-col items-center text-center py-4 space-y-6 overflow-hidden">

        {/* ── Original Falling Confetti ── */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-cel-fall"
              style={{
                top: '-20px',
                left: p.left,
                width:  p.w,
                height: p.h,
                borderRadius: '2px',
                backgroundColor: p.bg,
                animationDelay:    p.delay,
                animationDuration: p.dur,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* ── Ambient Glow (contained within overflow-hidden) ── */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-cyan/8 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-cyan/10 blur-[40px] pointer-events-none" />
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-purple/6 blur-[30px] pointer-events-none" />

        {/* ── Hero Icon with Orbital Ring ── */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Slow orbital ring */}
          <div className="absolute inset-0 animate-cel-orbit" style={{ animationDuration: '20s' }}>
            {orbitDots.map((d) => (
              <div
                key={d.id}
                className={`absolute rounded-full ${d.color} opacity-60`}
                style={{
                  width:  d.size,
                  height: d.size,
                  top:  '50%',
                  left: '50%',
                  transform: `rotate(${d.offset}) translateX(${d.radius}px) translateY(-50%)`,
                }}
              />
            ))}
          </div>

          {/* Reverse-orbit faint ring */}
          <div
            className="absolute inset-[-8px] rounded-full border border-dashed border-line/30 animate-cel-orbit"
            style={{ animationDuration: '30s', animationDirection: 'reverse' }}
          />

          {/* Floating icon */}
          <div className="animate-cel-float">
            <GraduationCap
              size={64}
              strokeWidth={1.4}
              className="text-cyan drop-shadow-[0_0_24px_rgba(0,245,228,0.35)]"
            />
          </div>
        </div>

        {/* ── Title + Subtitle ── */}
        <div className="space-y-1.5 z-10 animate-cel-reveal" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-2xl font-display font-bold text-text tracking-tight">
            {title}
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-[260px] mx-auto">
            {subtitle}
          </p>
        </div>

        {/* ── Achievement Badge ── */}
        {achievementName && (
          <div
            className="w-full px-5 py-4 bg-panel2/40 backdrop-blur-sm rounded-2xl border border-line relative overflow-hidden group animate-cel-reveal"
            style={{ animationDelay: '0.3s' }}
          >
            <Trophy
              size={56}
              strokeWidth={1}
              className="absolute right-2 bottom-1 text-line/20 -rotate-12 transition-transform group-hover:scale-110 pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted font-bold">
                Achievement Unlocked
              </span>
              <h3 className="text-lg font-display font-bold text-text italic">
                {achievementName}
              </h3>
              {points != null && (
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-yellow/10 border border-yellow/20 rounded-full">
                  <Sparkles size={12} className="text-yellow" />
                  <span className="text-xs text-yellow font-mono font-bold">+{points} XP</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CTA Button ── */}
        <div className="w-full animate-cel-reveal" style={{ animationDelay: '0.45s' }}>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-cyan hover:bg-cyan2 text-bg font-bold text-base transition-all active:scale-[0.97] shadow-lg shadow-cyan/15"
          >
            Collect Rewards
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CelebrationModal;
