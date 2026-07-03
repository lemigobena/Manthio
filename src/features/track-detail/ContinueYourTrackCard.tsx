import React, { useState } from 'react';
import { ArrowRight, MapPin, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { PillProgress, RingProgress } from '../dashboard/Dashboard';
import { TRACKS } from '../../services/mockData';
import { useTrack } from './useTrack';
import type { UserTrackProgress } from '../../types';

interface ContinueYourTrackCardProps {
  onNavigate: (page: string) => void;
  setActiveTrackId: (id: string) => void;
  forceNoTrack?: boolean;
}

const TrackItem: React.FC<{ 
  activeEntry: UserTrackProgress; 
  onNavigate: (path: string) => void; 
  setActiveTrackId: (id: string) => void; 
}> = ({ activeEntry, onNavigate, setActiveTrackId }) => {
  const { restartTrack, getTrackPercentage } = useTrack();
  const activeTrack = TRACKS.find(t => t.id === activeEntry.trackId);
  if (!activeTrack) return null;

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

  const progressPct = getTrackPercentage(activeTrack);
  const isCompleted = activeEntry.completedAt != null || progressPct === 100;

  const nextMilestone = mappedMilestones.find(
    m => !activeEntry.completedMilestoneIds.includes(m.id)
  );

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-6">
          <div>
            <span className="bg-cyan/20 text-cyan border border-cyan/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Active Track
            </span>
            <h2 className="text-xl lg:text-lg xl:text-xl font-bold mt-2">{activeTrack.title}</h2>
          </div>
          <div className="shrink-0">
            <div className="md:hidden">
              <RingProgress progress={progressPct} size={56} strokeWidth={4} color="#00F5E4" />
            </div>
            <div className="hidden md:block">
              <PillProgress progress={progressPct} />
            </div>
          </div>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          {activeTrack.description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line">
        <div className="text-xs text-muted">
          Next Up: <span className="text-text font-medium">{nextMilestone ? nextMilestone.label : "Complete!"}</span>
        </div>
        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <button
                onClick={() => restartTrack(activeTrack.id)}
                className="bg-bg border border-line hover:border-cyan text-text text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Start Anew
              </button>
              <button
                onClick={() => {
                  setActiveTrackId(activeTrack.id);
                  onNavigate('track-detail');
                }}
                className="bg-cyan hover:bg-cyan2 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Review track</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setActiveTrackId(activeTrack.id);
                onNavigate('track-detail');
              }}
              className="bg-cyan hover:bg-cyan2 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Continue track</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ContinueYourTrackCard: React.FC<ContinueYourTrackCardProps> = ({
  onNavigate,
  setActiveTrackId,
  forceNoTrack,
}) => {
  const { progressMap } = useTrack();
  const [isExpanded, setIsExpanded] = useState(false);

  const allActiveEntries = Object.values(progressMap).filter(
    p => p.enrolledAt
  ).sort((a, b) => {
    const aTime = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
    const bTime = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
    return bTime - aTime;
  });

  if (forceNoTrack || allActiveEntries.length === 0) {
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

  const visibleEntries = isExpanded ? allActiveEntries : allActiveEntries.slice(0, 1);

  return (
    <div className="space-y-4">
      {visibleEntries.map(entry => (
        <TrackItem 
          key={entry.trackId} 
          activeEntry={entry} 
          onNavigate={onNavigate} 
          setActiveTrackId={setActiveTrackId} 
        />
      ))}
      
      {allActiveEntries.length > 1 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-cyan transition-colors"
          >
            {isExpanded ? (
              <>Hide additional tracks <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show {allActiveEntries.length - 1} other active track{allActiveEntries.length > 2 ? 's' : ''} <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
