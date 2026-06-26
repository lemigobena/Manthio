import React from 'react';
import { CheckCircle, Lock, Clock, User, Zap, Layers } from 'lucide-react';
import { COURSES } from '../../services/mockData';
import type { Course, SelfAssessmentLevel } from '../../types';
import { calculateCourseProgress } from '../../services/progressUtils';

interface MilestoneData {
  id: string;
  label: string;
  courseId: string;
  isOptional?: boolean;
  prerequisiteMilestoneIds: string[];
  order: number;
}

type MilestoneState = 'completed' | 'current' | 'available' | 'locked';

interface MilestoneNodeProps {
  milestone: MilestoneData;
  state: MilestoneState;
  isSkippable: boolean;
  isOptional: boolean;
  isLast: boolean;
  completedLessonIds: string[];
  onNavigateToCourse: (courseId: string, target: 'course-detail' | 'learning-path') => void;
  index: number;
  nextState?: MilestoneState;
}

const MilestoneNode: React.FC<MilestoneNodeProps> = ({
  milestone,
  state,
  isSkippable,
  isOptional,
  isLast,
  completedLessonIds,
  onNavigateToCourse,
  index,
  nextState,
}) => {
  const course = COURSES.find(c => c.id === milestone.courseId);
  const isEven = index % 2 === 0;

  const nodeColors: Record<MilestoneState, string> = {
    completed: 'border-green bg-green shadow-[0_0_14px_rgba(43,222,126,0.35)]',
    current:   'border-cyan bg-cyan ring-4 ring-cyan/20 animate-pulse shadow-[0_0_18px_rgba(0,245,228,0.4)]',
    available: 'border-white/40 bg-bg',
    locked:    'border-white/10 bg-bg/40',
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* ── Central Spine Segment ── */}
      {!isLast && (
        <div 
          className={`absolute top-8 bottom-[-40px] w-0.75 left-1/2 -translate-x-1/2 z-0 hidden lg:block ${
            nextState === 'locked' 
              ? 'border-l-[3px] border-dashed border-line/40 bg-transparent' 
              : state === 'completed' ? 'bg-green' : 'bg-cyan/40'
          }`}
        />
      )}

      {/* ── Milestone Node (Central) ── */}
      <div className="relative z-10 flex flex-col items-center py-4">
        {/* Milestone Header (Floating label) */}
        <div className="bg-panel border border-line rounded-lg px-4 py-1.5 mb-4 shadow-xl">
           <span className="text-[10px] font-black uppercase text-text tracking-widest">{milestone.label}</span>
        </div>

        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${nodeColors[state]}`}
        >
          {state === 'completed' && <CheckCircle className="w-4 h-4 text-bg fill-bg" />}
          {state === 'locked' && <Lock className="w-3.5 h-3.5 text-muted" />}
          {state === 'current' && <div className="w-2.5 h-2.5 rounded-full bg-bg" />}
        </div>
      </div>

      {/* ── Desktop View: Left/Right Alternation ── */}
      <div className="hidden lg:grid grid-cols-2 w-full max-w-4xl gap-8 relative -mt-8 mb-12">
        {/* Left Side Container */}
        <div className={`flex flex-col justify-center items-end ${!isEven ? 'opacity-0 pointer-events-none' : ''}`}>
           {isEven && course && (
             <div className="flex items-center gap-0">
                <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} completedLessonIds={completedLessonIds} />
                <div className="w-12 h-[3px] bg-cyan/40 relative shrink-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan" />
                </div>
             </div>
           )}
        </div>

        {/* Right Side Container */}
        <div className={`flex flex-col justify-center items-start ${isEven ? 'opacity-0 pointer-events-none' : ''}`}>
           {!isEven && course && (
             <div className="flex items-center gap-0">
                <div className="w-12 h-[3px] bg-cyan/40 relative shrink-0">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan" />
                </div>
                <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} completedLessonIds={completedLessonIds} />
             </div>
           )}
        </div>
      </div>

      {/* ── Mobile View: Vertical Stack ── */}
      <div className="lg:hidden w-full px-4 pb-12">
        {course && (
          <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} fullWidth completedLessonIds={completedLessonIds} />
        )}
      </div>
    </div>
  );
};

const CourseCard: React.FC<{ 
  course: Course; 
  state: MilestoneState; 
  isSkippable: boolean; 
  isOptional: boolean; 
  completedLessonIds: string[];
  onNavigate: (id: string, target: 'course-detail' | 'learning-path') => void; 
  fullWidth?: boolean 
}> = ({
  course, state, isSkippable, isOptional, completedLessonIds, onNavigate, fullWidth
}) => {
  // REQ-TRACK-001: Increase visibility (reduced blur shading)
  const cardOpacity = isSkippable ? 'opacity-60' : state === 'locked' ? 'opacity-80' : 'opacity-100';
  const cardBorder  = state === 'current' ? 'border-cyan/40 shadow-xl shadow-cyan/10 ring-1 ring-cyan/20' : 'border-line';

  // Calculate dynamic progress
  const progress = calculateCourseProgress(course, completedLessonIds);

  return (
    <div className={`${fullWidth ? 'w-full max-w-3xl mx-auto' : 'w-[380px]'} ${cardOpacity} transition-all duration-300`}>
      <div className={`bg-panel border ${cardBorder} rounded-2xl overflow-hidden group hover:border-cyan/40 transition-all flex h-40`}>
        {/* Thumbnail (Fixed Width) */}
        <div className="relative w-40 shrink-0 overflow-hidden bg-bg border-r border-line/50">
          <img 
            src={course.imageUrl} 
            className={`w-full h-full object-cover transition-all duration-700 ${state === 'locked' ? 'opacity-60 grayscale-[0.2]' : 'group-hover:scale-110'}`} 
          />
          {isOptional && (
            <div className="absolute top-2 left-2 z-20 bg-purple text-bg text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tighter">Optional</div>
          )}
          {state === 'locked' && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/10">
              <Lock className="w-5 h-5 text-muted/40" />
            </div>
          )}
          {/* Progress Overlay */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-bg/40">
              <div className="h-full bg-green shadow-[0_0_8px_rgba(43,222,126,0.6)]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[12px] font-black leading-tight text-text group-hover:text-cyan transition-colors line-clamp-1">{course.title}</h4>
              {progress > 0 && <span className="text-[9px] font-black text-green whitespace-nowrap">{progress}%</span>}
            </div>
            <div className="flex items-center gap-3 text-[9px] text-muted font-bold">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
              <span className="flex items-center gap-1 truncate"><User className="w-3 h-3" /> {course.trainer.name.split(' ')[0]}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
             <button 
              onClick={() => onNavigate(course.id, state === 'locked' ? 'course-detail' : 'learning-path')} 
              className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-[10px] font-black py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 uppercase tracking-tight"
             >
               <Zap className="w-3 h-3 fill-current" /> {state === 'locked' ? 'View' : 'Start'}
             </button>
             <button 
              onClick={() => onNavigate(course.id, 'course-detail')} 
              className="px-2 py-1.5 border border-line rounded-lg hover:border-cyan/30 text-muted transition-colors"
             >
               <Layers className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrackVisualPath: React.FC<{ 
  milestones: MilestoneData[]; 
  completedMilestoneIds: string[]; 
  selfAssessmentLevel: SelfAssessmentLevel; 
  isEnrolled: boolean; 
  completedLessonIds: string[];
  onNavigateToCourse: (id: string, target: 'course-detail' | 'learning-path') => void 
}> = ({
  milestones, completedMilestoneIds, selfAssessmentLevel, isEnrolled, completedLessonIds, onNavigateToCourse
}) => {
  const SKIPPABLE: Record<string, string[]> = {
    nothing: [],
    basics: ['git-essentials', 'markdown-developers'],
    experience: ['python-bootcamp', 'git-essentials', 'command-line-basics']
  };

  return (
    <div className="flex flex-col items-center pt-8 pb-20">
      {milestones.map((ms, idx) => {
        const isCompleted = completedMilestoneIds.includes(ms.id);
        const skippable = isEnrolled && (SKIPPABLE[selfAssessmentLevel as keyof typeof SKIPPABLE]?.includes(ms.courseId) || false);

        // REQ-TRACK-001: Skippable milestones don't block the path.
        const isPrevDoneOrSkippable = idx === 0 || (() => {
          const prevMs = milestones[idx - 1];
          const prevIsCompleted = completedMilestoneIds.includes(prevMs.id);
          const prevIsSkippable = isEnrolled && (SKIPPABLE[selfAssessmentLevel as keyof typeof SKIPPABLE]?.includes(prevMs.courseId) || false);
          return prevIsCompleted || prevIsSkippable;
        })();

        const state = isCompleted ? 'completed' : (isPrevDoneOrSkippable ? 'current' : 'locked');
        
        // REQ-TRACK-001: Clicking a tab adjusts which courses are highlighted as needed vs. optional.
        const dynamicIsOptional = selfAssessmentLevel === 'nothing' ? false : (ms.isOptional ?? false);

        const nextMs = milestones[idx + 1];
        const nextIsCompleted = nextMs ? completedMilestoneIds.includes(nextMs.id) : false;
        const nextIsPrevDone = completedMilestoneIds.includes(ms.id);
        const nextState = nextMs ? (nextIsCompleted ? 'completed' : (nextIsPrevDone ? 'current' : 'locked')) : undefined;

        return (
          <MilestoneNode
            key={ms.id}
            index={idx}
            milestone={ms}
            state={state}
            nextState={nextState}
            isSkippable={skippable}
            isOptional={dynamicIsOptional}
            isLast={idx === milestones.length - 1}
            completedLessonIds={completedLessonIds}
            onNavigateToCourse={onNavigateToCourse}
          />
        );
      })}
    </div>
  );
};
