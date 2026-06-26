import React, { useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
  points,
}) => {
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

  // Trigger body scroll lock and confetti
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const duration = 3 * 1000;
      const end = Date.now() + duration;

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            startVelocity: 85, // Shoots higher to reach the top
            origin: { x: 0, y: 1 },
            colors: ['#00F5E4', '#A33AFF', '#FFD166', '#FF7B00', '#22C55E'],
            zIndex: 101, // Above the overlay
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            startVelocity: 85, // Shoots higher to reach the top
            origin: { x: 1, y: 1 },
            colors: ['#00F5E4', '#A33AFF', '#FFD166', '#FF7B00', '#22C55E'],
            zIndex: 101,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };

        frame();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
      {/* Blurred Full-screen Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/70 backdrop-blur-xl transition-opacity duration-500 animate-[fadeIn_0.5s_ease-out]" 
        onClick={onClose} 
      />



      <div className="relative z-20 flex flex-col items-center text-center p-8 max-w-xl w-full mx-auto space-y-8">




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
        <div className="space-y-3 z-10 animate-cel-reveal" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-4xl md:text-5xl font-display font-black text-text tracking-tight drop-shadow-lg">
            {title}
          </h2>
          <p className="text-muted text-lg md:text-xl leading-relaxed max-w-[400px] mx-auto font-medium drop-shadow-md">
            {subtitle}
          </p>
        </div>

        {/* ── Achievement Badge ── */}
        {achievementName && (
          <div
            className="w-full relative flex flex-col items-center animate-cel-reveal"
            style={{ animationDelay: '0.3s' }}
          >
            <Trophy
              size={56}
              strokeWidth={1}
              className="absolute right-1/2 translate-x-32 bottom-0 text-cyan/20 -rotate-12 pointer-events-none"
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
        <div className="animate-cel-reveal" style={{ animationDelay: '0.45s' }}>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-cyan hover:bg-cyan2 text-bg font-bold text-base transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] cursor-pointer"
          >
            Collect Rewards
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;
