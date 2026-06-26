import React, { useEffect, useRef } from 'react';
import { X, Download, Trophy, Star, Award, Sparkles } from 'lucide-react';

interface TrackCompletionModalProps {
  trackTitle: string;
  completedAt: Date;
  learnerName: string;
  onClose: () => void;
}

// Confetti particle
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 1.2}s`,
  color: ['#00F5E4', '#9D6CFF', '#FFCF3F', '#2BDE7E', '#FF8C42'][Math.floor(Math.random() * 5)],
  size: `${6 + Math.random() * 8}px`,
  duration: `${2.5 + Math.random() * 1.5}s`,
}));

export const TrackCompletionModal: React.FC<TrackCompletionModalProps> = ({
  trackTitle,
  completedAt,
  learnerName,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple certificate PDF generation via print
  const handleDownloadCertificate = () => {
    const certWindow = window.open('', '_blank');
    if (!certWindow) return;

    const formatted = completedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate — ${trackTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1123px; height: 794px;
            background: linear-gradient(135deg, #060809 0%, #0F1417 50%, #0a1a20 100%);
            font-family: 'DM Sans', sans-serif;
            color: #EDF2F6;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .cert {
            width: 900px;
            border: 2px solid rgba(0,245,228,0.3);
            border-radius: 24px;
            padding: 56px 64px;
            text-align: center;
            background: rgba(15,20,23,0.9);
            position: relative;
          }
          .cert::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 24px;
            background: radial-gradient(ellipse at top, rgba(0,245,228,0.06) 0%, transparent 70%);
          }
          .glow-ring {
            width: 100px; height: 100px;
            background: radial-gradient(circle, rgba(0,245,228,0.2), transparent);
            border: 2px solid rgba(0,245,228,0.5);
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex; align-items: center; justify-content: center;
            font-size: 36px;
          }
          .label {
            font-size: 11px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(0,245,228,0.7);
            font-weight: 700;
            margin-bottom: 12px;
          }
          .name {
            font-family: 'Syne', sans-serif;
            font-size: 42px;
            font-weight: 800;
            color: #EDF2F6;
            margin-bottom: 16px;
          }
          .track {
            font-family: 'Syne', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #00F5E4;
            margin-bottom: 24px;
            padding: 12px 24px;
            border: 1px solid rgba(0,245,228,0.3);
            border-radius: 12px;
            display: inline-block;
            background: rgba(0,245,228,0.05);
          }
          .date { color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 32px; }
          .credit {
            background: rgba(255,207,63,0.1);
            border: 1px solid rgba(255,207,63,0.3);
            border-radius: 12px;
            padding: 12px 24px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #FFCF3F;
            font-weight: 700;
            font-size: 14px;
          }
          .divider {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.08);
            margin: 28px 0;
          }
          .issued { font-size: 11px; color: rgba(255,255,255,0.3); }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="glow-ring">🏆</div>
          <div class="label">Certificate of Completion</div>
          <div class="name">${learnerName}</div>
          <p style="color:rgba(255,255,255,0.5); font-size:14px; margin-bottom:16px;">has successfully completed the career track</p>
          <div class="track">${trackTitle}</div>
          <div class="date">Completed on ${formatted}</div>
          <hr class="divider" />
          <div class="credit">
            🎖️ &nbsp;$9.00 Credit Reward Granted &nbsp;•&nbsp; Manthio Learning Platform
          </div>
          <p class="issued" style="margin-top:24px;">Issued by Manthio · Verified digital record</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    certWindow.document.close();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const formattedDate = completedAt.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-sm opacity-0"
            style={{
              left: p.left,
              top: '-10px',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animation: `cel-fall ${p.duration} ${p.delay} ease-in forwards`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="relative z-10 bg-panel border border-cyan/30 rounded-3xl p-8 md:p-12 max-w-xl w-full text-center space-y-6 shadow-[0_0_80px_rgba(0,245,228,0.15)] animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text p-2 rounded-xl hover:bg-bg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-yellow/10 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-yellow/10 border-2 border-yellow/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,207,63,0.3)]">
            <Trophy className="w-10 h-10 text-yellow fill-yellow/30" />
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow fill-yellow" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-text leading-tight">
            🎉 Track Complete!
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Congratulations, <span className="text-text font-bold">{learnerName}</span>! You've completed:
          </p>
          <div className="bg-bg border border-cyan/30 rounded-xl px-4 py-3 inline-block">
            <p className="text-cyan font-black text-base">{trackTitle}</p>
          </div>
          <p className="text-muted/60 text-xs">{formattedDate}</p>
        </div>

        {/* Credits */}
        <div className="bg-yellow/5 border border-yellow/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-yellow" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-yellow uppercase tracking-wider">$9 Reward Credit Granted</div>
            <div className="text-[10px] text-muted mt-0.5">Applied to your account balance for future course enrollment.</div>
          </div>
        </div>

        {/* Certificate download + close */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadCertificate}
            className="flex-1 bg-cyan hover:bg-cyan2 text-bg font-black text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,245,228,0.25)] hover:shadow-[0_6px_30px_rgba(0,245,228,0.4)] hover:translate-y-[-2px]"
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-bg border border-line hover:border-cyan/30 text-text font-bold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-cyan" />
            View Track Summary
          </button>
        </div>

        <p className="text-[10px] text-muted/60">
          Phase 2: Credly badge integration coming soon.
        </p>
      </div>

      {/* Hidden canvas (reserved for future particle effects) */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
