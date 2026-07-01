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
  isSubCourse?: boolean;
  primaryIndex?: number;
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
  zIndex: number;
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
  zIndex,
  nextState,
}) => {
  const course = COURSES.find(c => c.id === milestone.courseId);
  const isEven = (milestone.primaryIndex ?? index) % 2 === 0;
  const isSubCourse = milestone.isSubCourse || false;

  const nodeColors: Record<MilestoneState, string> = {
    completed: 'border-green bg-green shadow-[0_0_14px_rgba(43,222,126,0.35)]',
    current:   'border-cyan bg-cyan ring-4 ring-cyan/20 animate-pulse shadow-[0_0_18px_rgba(0,245,228,0.4)]',
    available: 'border-white/40 bg-bg',
    locked:    'border-white/10 bg-bg/40',
  };

  const borderColor = state === 'completed' ? 'border-green' : state === 'current' ? 'border-cyan' : 'border-cyan/40';

  return (
    <div className="relative w-full flex flex-col items-center" style={{ zIndex }}>
      {/* ── Central Spine Segment ── */}
      {!isLast && (
        <div 
          className={`absolute top-[30px] bottom-[-40px] w-0.75 left-1/2 -translate-x-1/2 z-0 hidden min-[1200px]:block ${
            nextState === 'locked' 
              ? 'border-l-[3px] border-dashed border-line/40 bg-transparent' 
              : state === 'completed' ? 'bg-green' : 'bg-cyan/40'
          }`}
        />
      )}

      {/* ── Mobile View: Left-Aligned Spine ── */}
      {/* Mobile Spine Segment */}
      {!isLast && (
        <div 
          className={`absolute top-[30px] bottom-[-40px] w-[3px] left-[32px] z-0 min-[1200px]:hidden ${
            nextState === 'locked' 
              ? 'border-l-[3px] border-dashed border-line/40 bg-transparent' 
              : state === 'completed' ? 'bg-green' : 'bg-cyan/40'
          }`}
        />
      )}
      
      <div className={`min-[1200px]:hidden relative z-10 flex flex-col items-start w-full px-4 ${isSubCourse ? 'pb-4 pt-0' : 'pb-8 pt-4'}`}>
        {!isSubCourse ? (
          <div className="relative w-full">
            {/* Title Box (Centered on spine) */}
            <div className="relative z-10 pl-[12px]">
              <div className="bg-panel border border-line rounded-lg px-4 py-1.5 mb-6 shadow-xl inline-block whitespace-nowrap">
                 <span className="text-[10px] font-black uppercase text-text tracking-widest">{milestone.label}</span>
              </div>
            </div>
            
            {/* Inner Content */}
            <div className="relative w-full pl-[56px]">
              {/* Dot on Spine */}
              <div className={`absolute left-[16px] -translate-x-1/2 top-[4px] w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${nodeColors[state]}`}>
                {state === 'completed' && <CheckCircle className="w-4 h-4 text-bg fill-bg" />}
                {state === 'locked' && <Lock className="w-3.5 h-3.5 text-muted" />}
                {state === 'current' && <div className="w-2.5 h-2.5 rounded-full bg-bg" />}
              </div>

              {/* Straight Horizontal branch connector */}
              <div className="w-full relative">
                <div className={`absolute top-[20px] left-[-24px] right-[50%] h-[3px] border-t-[3px] ${borderColor} z-[-1]`} />
                {course && <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} fullWidth completedLessonIds={completedLessonIds} />}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full pl-[56px]">
             {/* Vertical connector from the card above */}
             <div className="w-full mt-2 relative">
               <div className={`absolute -top-[120px] h-[120px] left-1/2 w-[3px] border-l-[3px] ${borderColor} z-[-1] -translate-x-1/2`} />
               {course && <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} fullWidth completedLessonIds={completedLessonIds} />}
             </div>
          </div>
        )}
      </div>

      {/* ── Desktop View: Unified Grid ── */}
      <div className={`hidden min-[1200px]:grid grid-cols-[1fr_120px_1fr] w-full max-w-6xl gap-8 relative items-start ${isSubCourse ? 'pb-8 pt-0' : 'pb-20 pt-4'}`}>
        
        {/* Left Column (Card) */}
        <div className={`flex flex-col items-end ${isSubCourse ? 'pt-0' : 'pt-[54px]'} relative`}>
           {isEven && course && (
             <>
                {/* Connector from title center to card center */}
                {!isSubCourse ? (
                  <div className={`absolute top-[14px] left-1/2 right-[-76px] h-[40px] border-t-[3px] border-l-[3px] rounded-tl-[20px] ${borderColor} z-[-1]`} />
                ) : (
                  <div className={`absolute -top-[220px] h-[220px] left-1/2 w-[3px] border-l-[3px] ${borderColor} z-0`} />
                )}
                <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} completedLessonIds={completedLessonIds} />
             </>
           )}
        </div>

        {/* Center Column (Node) */}
        <div className="relative z-10 flex flex-col items-center">
           {!isSubCourse && (
             <>
               {/* Milestone Header (Floating label) */}
               <div className="relative bg-panel border border-line rounded-lg px-4 py-1.5 mb-4 shadow-xl text-center z-10">
                  <span className="text-[10px] font-black uppercase text-text tracking-widest">{milestone.label}</span>
               </div>

               {/* Circle */}
               <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${nodeColors[state]}`}>
                 {state === 'completed' && <CheckCircle className="w-4 h-4 text-bg fill-bg" />}
                 {state === 'locked' && <Lock className="w-3.5 h-3.5 text-muted" />}
                 {state === 'current' && <div className="w-2.5 h-2.5 rounded-full bg-bg" />}
               </div>
             </>
           )}
        </div>

        {/* Right Column (Card) */}
        <div className={`flex flex-col items-start ${isSubCourse ? 'pt-0' : 'pt-[54px]'} relative`}>
           {!isEven && course && (
             <>
                {/* Connector from title center to card center */}
                {!isSubCourse ? (
                  <div className={`absolute top-[14px] right-1/2 left-[-76px] h-[40px] border-t-[3px] border-r-[3px] rounded-tr-[20px] ${borderColor} z-[-1]`} />
                ) : (
                  <div className={`absolute -top-[220px] h-[220px] left-1/2 w-[3px] border-l-[3px] ${borderColor} z-0`} />
                )}
                <CourseCard course={course} state={state} isSkippable={isSkippable} isOptional={isOptional} onNavigate={onNavigateToCourse} completedLessonIds={completedLessonIds} />
             </>
           )}
        </div>
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  // REQ-TRACK-001: Increase visibility (reduced blur shading)
  const cardOpacity = isSkippable ? 'opacity-60' : state === 'locked' ? 'opacity-80' : 'opacity-100';
  const cardBorder  = state === 'current' ? 'border-cyan/40 shadow-xl shadow-cyan/10 ring-1 ring-cyan/20' : 'border-line';

  // Calculate dynamic progress
  const progress = calculateCourseProgress(course, completedLessonIds);

  return (
    <div className={`w-full ${fullWidth ? 'max-w-3xl' : 'max-w-[520px]'} mx-auto relative z-10 bg-[#13141a] rounded-2xl transition-all duration-300`}>
      <div className={`bg-[#13141a] border ${cardBorder} rounded-2xl overflow-hidden group hover:border-cyan/40 transition-all flex flex-col relative ${cardOpacity}`}>
        {isOptional && (
          <div className="absolute top-0 right-0 origin-top-right scale-[0.8] lg:scale-100 z-20 pointer-events-none">
            <div className="absolute top-[20px] -right-[32px] w-[130px] bg-gradient-to-r from-purple to-cyan text-bg text-[9px] font-black uppercase tracking-widest text-center py-1.5 rotate-45 shadow-xl">
              Recommended
            </div>
          </div>
        )}
        <div className="flex h-40">
        {/* Thumbnail (Fixed Width) */}
        <div className="relative w-40 shrink-0 overflow-hidden bg-bg border-r border-line/50">
          <img 
            src={course.imageUrl} 
            className={`w-full h-full object-cover transition-all duration-700 ${state === 'locked' ? 'opacity-60 grayscale-[0.2]' : 'group-hover:scale-110'}`} 
          />
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
            <div className={`flex items-start justify-between gap-2 ${isOptional ? 'pr-7' : ''}`}>
              <h4 className="text-[12px] font-black leading-tight text-text group-hover:text-cyan transition-colors line-clamp-2">{course.title}</h4>
              {progress > 0 && <span className="text-[9px] font-black text-green whitespace-nowrap mt-0.5">{progress}%</span>}
            </div>
            <div className="flex items-center gap-3 text-[9px] text-muted font-bold">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
              <span className="flex items-center gap-1 truncate"><User className="w-3 h-3" /> {course.trainer.name.split(' ')[0]}</span>
            </div>
            <p className="text-[10px] text-text/80 line-clamp-2 mt-1.5 leading-tight">{course.description}</p>
          </div>
          
          <div className="flex flex-col gap-1.5">
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
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] font-bold text-cyan text-left hover:underline flex items-center gap-1"
            >
              {isExpanded ? 'Hide details' : 'More details'}
            </button>
          </div>
        </div>
        </div>

        {/* Expanded Details */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] border-t border-line/50 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className="p-4 bg-line/10">
              {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-text uppercase tracking-wider">What you'll learn</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {course.learningOutcomes.map((outcome, idx) => (
                      <span key={idx} className="bg-bg border border-line text-text/90 text-[9px] px-2 py-1 rounded-md shadow-sm">
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-text uppercase tracking-wider">Topics</h5>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-bg border border-line text-text/90 text-[9px] px-2 py-1 rounded-md shadow-sm">
                      {course.topic}
                    </span>
                    {course.tags?.map((tag, idx) => (
                      <span key={idx} className="bg-bg border border-line text-text/90 text-[9px] px-2 py-1 rounded-md shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
        const dynamicIsOptional = ms.isOptional ?? false;

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
            zIndex={100 - idx}
          />
        );
      })}
    </div>
  );
};
