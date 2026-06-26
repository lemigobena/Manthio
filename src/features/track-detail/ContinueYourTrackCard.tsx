import React from 'react';
import { ArrowRight, Zap, MapPin, Trophy } from 'lucide-react';
import { TRACKS, COURSES } from '../../services/mockData';
import { useTrack } from './useTrack';
import { calculateTrackProgress } from '../../services/progressUtils';
import type { CareerTrack, Course } from '../../types';

interface ContinueYourTrackCardProps {
  onNavigate: (page: string) => void;
  setActiveTrackId: (id: string) => void;
}

export const ContinueYourTrackCard: React.FC<ContinueYourTrackCardProps> = ({
  onNavigate,
  setActiveTrackId,
}) => {
  const { progressMap, completedLessonIds } = useTrack();

  // Find the first enrolled, non-completed track
  const activeEntry = Object.values(progressMap).find(
    p => p.enrolledAt && !p.completedAt
  );

  const activeTrack = activeEntry
    ? TRACKS.find(t => t.id === activeEntry.trackId)
    : null;

  if (!activeTrack || !activeEntry) {
    // No active track — exploration CTA
    return (
      <div className="bg-panel border border-line rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan">Career Path</span>
          </div>
          <h3 className="font-black text-text text-base">No active track yet</h3>
          <p className="text-xs text-muted leading-relaxed max-w-xs">
            Career tracks guide you through a sequence of courses toward a professional outcome.
          </p>
        </div>
        <button
          onClick={() => onNavigate('catalog')}
          className="shrink-0 relative z-10 bg-cyan hover:bg-cyan2 text-bg font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(0,245,228,0.2)] hover:translate-y-[-2px]"
        >
          Explore Tracks
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Build milestones map (same logic as TrackDetail)
  const mappedMilestones = activeTrack.milestones.flatMap((ms, msIdx) =>
    ms.courses.length > 0
      ? ms.courses.map((courseEntry, cIdx) => ({
          id: `${ms.id}-${courseEntry.id}`,
          label: cIdx === 0 ? ms.title : `${ms.title} — Extra`,
          courseId: courseEntry.id,
          isOptional: courseEntry.isOptional,
          prerequisiteMilestoneIds: msIdx === 0 ? [] : [
            `${activeTrack.milestones[msIdx - 1].id}-${activeTrack.milestones[msIdx - 1].courses[0]?.id}`
          ],
          order: msIdx * 10 + cIdx,
        }))
      : [{
          id: `${ms.id}-empty`,
          label: ms.title,
          courseId: '',
          isOptional: false,
          prerequisiteMilestoneIds: [],
          order: msIdx * 10,
        }]
  );

  const totalRequired = mappedMilestones.filter(m => !m.isOptional).length;
  const completedRequired = mappedMilestones.filter(
    m => !m.isOptional && activeEntry.completedMilestoneIds.includes(m.id)
  ).length;
  
  // REQ-PROGRESS-002: Dynamic track progress consistency
  const progressPct = calculateTrackProgress(activeTrack as unknown as CareerTrack, COURSES as unknown as Course[], completedLessonIds);

  // Next milestone
  const nextMilestone = mappedMilestones.find(
    m => !activeEntry.completedMilestoneIds.includes(m.id)
  );

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 space-y-4 relative overflow-hidden group hover:border-cyan/30 transition-all">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-cyan/8 transition-all" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan">Active Track</span>
          </div>
          <h3 className="font-black text-text text-sm md:text-base leading-snug line-clamp-1">
            {activeTrack.title}
          </h3>
        </div>
        <span className="shrink-0 text-xl font-black text-cyan tabular-nums">{progressPct}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 space-y-1">
        <div className="h-2 bg-bg border border-line rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan rounded-full shadow-[0_0_8px_rgba(0,245,228,0.4)] transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted font-bold">
          {completedRequired} / {totalRequired} required milestones
        </p>
      </div>

      {/* Next milestone */}
      {nextMilestone && (
        <div className="relative z-10 flex items-center gap-2 bg-bg/60 border border-line rounded-xl px-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan block">Next Up</span>
            <span className="text-xs font-bold text-text truncate">{nextMilestone.label}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="relative z-10 flex gap-2">
        <button
          onClick={() => {
            setActiveTrackId(activeTrack.id);
            onNavigate('track-detail');
          }}
          className="flex-1 bg-cyan hover:bg-cyan2 text-bg font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,245,228,0.2)] hover:translate-y-[-1px]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Continue
        </button>
        <button
          onClick={() => {
            setActiveTrackId(activeTrack.id);
            onNavigate('track-detail');
          }}
          className="border border-line hover:border-cyan/40 text-text text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:bg-bg/60"
        >
          View Path
        </button>
      </div>
    </div>
  );
};
