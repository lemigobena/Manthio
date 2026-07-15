import React, { useMemo } from 'react';
import {
  Check, Play, Lock, Clock, BookOpen, BarChart3, Zap,
  GitBranch, Terminal, Network, Boxes, Activity, Database, FlaskConical, Code2, GraduationCap,
} from 'lucide-react';
import { COURSES } from '../../services/mockData';
import type { SelfAssessmentLevel } from '../../types';

interface MilestoneData {
  id: string;
  label: string;
  courseId: string;
  isOptional?: boolean;
  prerequisiteMilestoneIds: string[];
  order: number;
  isSubCourse?: boolean;
  primaryIndex?: number;
}

type MilestoneState = 'completed' | 'current' | 'available' | 'locked';

interface TrackPathMapProps {
  milestones: MilestoneData[];
  completedMilestoneIds: string[];
  selfAssessmentLevel: SelfAssessmentLevel;
  isEnrolled: boolean;
  onNavigateToCourse: (id: string, target: 'course-detail' | 'learning-path') => void;
}

const SKIPPABLE: Record<string, string[]> = {
  nothing: [],
  basics: ['git-essentials', 'markdown-developers'],
  experience: ['python-bootcamp', 'git-essentials', 'command-line-basics'],
};

// Icon per course topic (falls back to a graduation cap).
const TOPIC_ICONS: Record<string, React.ElementType> = {
  'Python': Code2,
  'Version Control': GitBranch,
  'OS': Terminal,
  'Networking': Network,
  'Kubernetes': Boxes,
  'Automation': Zap,
  'Monitoring': Activity,
  'Data': Database,
  'Testing': FlaskConical,
};

// Vertical distance between course nodes and the snake pattern of horizontal
// node positions (% of container width) the path winds through. Nodes alternate
// sides so the description card can fill the free half of the row.
const SEGMENT_H = 185;
const TOP_PAD = 80;
const BOTTOM_PAD = 110;
const X_PATTERN = [26, 72, 34, 66, 24, 70];

const STATE_LABELS: Record<MilestoneState, { text: string; cls: string }> = {
  completed: { text: 'Completed', cls: 'text-green' },
  current:   { text: 'Up next',   cls: 'text-cyan' },
  available: { text: 'Available', cls: 'text-text/60' },
  locked:    { text: 'Locked',    cls: 'text-muted' },
};

export const TrackPathMap: React.FC<TrackPathMapProps> = ({
  milestones,
  completedMilestoneIds,
  selfAssessmentLevel,
  isEnrolled,
  onNavigateToCourse,
}) => {
  const filteredMilestones = useMemo(() => {
    if (selfAssessmentLevel === 'experience') {
      return milestones.filter(ms => !ms.isOptional);
    }
    if (selfAssessmentLevel === 'basics') {
      let optionalCount = 0;
      return milestones.filter(ms => {
        if (ms.isOptional) {
          optionalCount++;
          return optionalCount % 2 === 1;
        }
        return true;
      });
    }
    return milestones;
  }, [milestones, selfAssessmentLevel]);

  const enriched = useMemo(() => {
    const base = filteredMilestones.map((ms, idx) => {
      const isCompleted = completedMilestoneIds.includes(ms.id);
      const isPrevDoneOrSkippable = idx === 0 || (() => {
        const prev = filteredMilestones[idx - 1];
        const prevDone = completedMilestoneIds.includes(prev.id);
        const prevSkip = isEnrolled && (SKIPPABLE[selfAssessmentLevel as keyof typeof SKIPPABLE]?.includes(prev.courseId) || false);
        return prevDone || prevSkip;
      })();
      return { ms, isCompleted, isUnlocked: isPrevDoneOrSkippable };
    });
    // Only the first unlocked, uncompleted milestone is 'current' — the rest are 'available'.
    const currentIdx = base.findIndex(b => !b.isCompleted && b.isUnlocked);
    return base.map((b, idx) => {
      const state: MilestoneState = b.isCompleted ? 'completed'
        : !b.isUnlocked ? 'locked'
        : idx === currentIdx ? 'current'
        : 'available';
      // Node position on the winding path
      const x = X_PATTERN[idx % X_PATTERN.length];
      const y = TOP_PAD + idx * SEGMENT_H;
      return { ms: b.ms, state, x, y };
    });
  }, [filteredMilestones, completedMilestoneIds, isEnrolled, selfAssessmentLevel]);

  const totalHeight = TOP_PAD + Math.max(0, enriched.length - 1) * SEGMENT_H + BOTTOM_PAD;

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      {/* Tiled road segments between consecutive nodes — S-curves, not straight lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {enriched.slice(0, -1).map((node, idx) => {
          const next = enriched[idx + 1];
          // Cubic S-curve: leave the node straight down, swing sideways mid-way,
          // and arrive at the next node from straight above.
          const midY = (node.y + next.y) / 2;
          const d = `M ${node.x} ${node.y} C ${node.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
          return (
            <path
              key={node.ms.id}
              d={d}
              fill="none"
              className={
                node.state === 'completed' && next.state === 'completed' ? 'stroke-green/70'
                : next.state === 'locked' ? 'stroke-line' : 'stroke-cyan/40'
              }
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray="2 20"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Course nodes + description cards */}
      {enriched.map(({ ms, state, x, y }) => {
        const course = COURSES.find(c => c.id === ms.courseId);
        const lessonCount = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0;
        const onLeft = x <= 50; // node on left half → card fills the right half
        const TopicIcon = TOPIC_ICONS[course?.topic ?? ''] ?? GraduationCap;
        const stateLabel = STATE_LABELS[state];

        const circleCls =
          state === 'completed' ? 'bg-green text-bg shadow-[0_4px_14px_rgba(43,222,126,0.35)]'
          : state === 'current' ? 'bg-cyan text-bg ring-4 ring-cyan/20 shadow-[0_4px_18px_rgba(0,245,228,0.35)]'
          : state === 'available' ? 'bg-panel text-cyan border-2 border-cyan/40 shadow-md'
          : 'bg-panel text-muted/60 border-2 border-line shadow-sm';

        return (
          <div key={ms.id} className="absolute inset-x-0" style={{ top: y }}>
            {/* ── Node circle on the path ── */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${x}%` }}
            >
              {/* Milestone label above primary course nodes */}
              {!ms.isSubCourse && (
                <div className="absolute bottom-[calc(100%+10px)] whitespace-nowrap bg-panel border border-line rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-text shadow-md">
                  {ms.label}
                </div>
              )}

              <button
                type="button"
                onClick={() => onNavigateToCourse(ms.courseId, state === 'locked' ? 'course-detail' : 'learning-path')}
                className={`relative w-[70px] h-[70px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${circleCls}`}
                aria-label={course?.title ?? ms.label}
              >
                {state === 'current' ? (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                ) : (
                  <TopicIcon className="w-6 h-6" />
                )}
                {state === 'locked' && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-panel border border-line flex items-center justify-center shadow-sm">
                    <Lock className="w-3 h-3 text-muted" />
                  </span>
                )}
                {state === 'completed' && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-panel border border-green/40 flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 text-green" strokeWidth={3.5} />
                  </span>
                )}
              </button>

              {/* START HERE bubble on the current course */}
              {state === 'current' && (
                <div className="absolute top-[calc(100%+8px)] whitespace-nowrap bg-cyan text-bg text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 shadow-lg animate-bounce [animation-duration:2s]">
                  Start here
                </div>
              )}
            </div>

            {/* Connector stub from node to its card */}
            <div
              className={`absolute top-0 h-[3px] -translate-y-1/2 rounded-full ${
                state === 'completed' ? 'bg-green/50' : state === 'locked' ? 'bg-line' : 'bg-cyan/40'
              }`}
              style={onLeft
                ? { left: `calc(${x}% + 35px)`, width: `calc(${100 - x}% - 35px - 47%)` }
                : { right: `calc(${100 - x}% + 35px)`, width: `calc(${x}% - 35px - 47%)` }}
            />

            {/* ── Description card on the free side ── */}
            <button
              type="button"
              onClick={() => onNavigateToCourse(ms.courseId, 'course-detail')}
              className={`absolute top-0 -translate-y-1/2 w-[45%] text-left bg-panel border rounded-2xl p-4 shadow-md transition-all hover:shadow-lg hover:-translate-y-[calc(50%+2px)] ${
                state === 'current' ? 'border-cyan/40 ring-1 ring-cyan/20' : 'border-line hover:border-cyan/30'
              } ${state === 'locked' ? 'opacity-70' : ''}`}
              style={onLeft ? { right: '2%' } : { left: '2%' }}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-black text-text leading-tight line-clamp-2">
                  {course?.title ?? ms.label}
                </h4>
                <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap mt-0.5 ${stateLabel.cls}`}>
                  {stateLabel.text}
                </span>
              </div>

              <p className="text-[10px] text-text/70 leading-snug line-clamp-2 mt-1.5">
                {course?.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[9px] font-bold text-muted">
                {course?.duration && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                )}
                {lessonCount > 0 && (
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {lessonCount} lessons</span>
                )}
                {course?.level && (
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {course.level}</span>
                )}
                {!!course?.xpReward && (
                  <span className="flex items-center gap-1 text-cyan"><Zap className="w-3 h-3 fill-current" /> {course.xpReward} XP</span>
                )}
                {ms.isOptional && (
                  <span className="text-[8px] font-black uppercase text-purple tracking-widest bg-purple/10 px-1.5 py-0.5 rounded">
                    Optional
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};
