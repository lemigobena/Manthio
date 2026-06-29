import React, { useState, useRef, useEffect } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { 
  Check, Lock, Play, ChevronDown, ChevronUp, ChevronRight, Clock, HelpCircle, 
  FileText, Code2, Users, MapPin, Calendar, AlertCircle,
  Target, Award, BookOpen, Bookmark, MessageSquare, ExternalLink,
  ShieldCheck, CheckCircle, Video, Gamepad2, ClipboardEdit
} from 'lucide-react';
import { useTrack } from '../track-detail/useTrack';
import { calculateCourseProgress } from '../../services/progressUtils';
import { useModal } from '../../context/ModalContext';
import type { Course, LessonType } from '../../types';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

const getLearningObjectives = (modTitle: string) => {
  const title = modTitle.toLowerCase();
  if (title.includes('setup') || title.includes('basics') || title.includes('syntax')) {
    return [
      'Set up local virtual environments and configure requirements.',
      'Understand and apply standard variables, operators, and basic syntax.',
      'Write, structure, and execute your first standalone scripts.'
    ];
  }
  if (title.includes('flow') || title.includes('control') || title.includes('conditional')) {
    return [
      'Construct if/else conditional blocks to steer script execution.',
      'Work with basic comparison and boolean logic operators.',
      'Implement nested branch paths to handle complex scenarios.'
    ];
  }
  if (title.includes('function')) {
    return [
      'Define modular reusable functions with parameters and return values.',
      'Differentiate scopes between global and local variable bindings.',
      'Leverage keyword arguments and fallback defaults inside calls.'
    ];
  }
  if (title.includes('loop') || title.includes('list') || title.includes('collection')) {
    return [
      'Iterate through collections (lists, tuples, dicts) using loops.',
      'Draft elegant list comprehensions to filter and transform data.',
      'Manage collection state and apply item lookups efficiently.'
    ];
  }
  if (title.includes('oop') || title.includes('classes') || title.includes('object')) {
    return [
      'Model real-world entities using classes and initializers.',
      'Apply class inheritance to share common state and behavior.',
      'Differentiate instance variables from class-level attributes.'
    ];
  }
  return [
    `Master the fundamental blocks of ${modTitle}.`,
    'Apply these theoretical concepts to real-world code exercises.',
    'Test outcomes using custom scripts and assertion statements.'
  ];
};

export const LearningPath: React.FC<LearningPathProps> = ({ onNavigate }) => {
  const { activeCourseId } = useAuth();
  const { addXp } = useXP();
  const { completedLessonIds } = useTrack();
  const { openModal } = useModal();
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());

  const toggleBookmark = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setBookmarkedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };
  
  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const displayedProgress = course.id === 'python-bootcamp' ? 46 : calculateCourseProgress(course as Course, completedLessonIds);

  const getRemainingTime = (mod: typeof course.modules[0]) => {
    const incomplete = mod.lessons.filter(l => !completedLessonIds.includes(l.id));
    if (incomplete.length === 0) return '0 min left';
    let mins = 0;
    incomplete.forEach(l => {
      const dur = l.duration.toLowerCase();
      if (dur.includes('h')) {
        mins += parseFloat(dur) * 60;
      } else {
        mins += parseInt(dur) || 10;
      }
    });
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = Math.round(mins % 60);
      return `${hrs}h ${remainingMins > 0 ? remainingMins + 'm' : ''} left`;
    }
    return `${Math.round(mins)} min left`;
  };

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return null;
    return course.modules[0]?.id || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpandedModuleId(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 750);
  };

  const toggleExpand = (modId: string) => {
    // REQ-PATH-020: Mobile navigation vs Desktop expansion
    if (window.innerWidth < 768) {
      onNavigate(`module-detail:${modId}`);
      return;
    }
    setExpandedModuleId(prev => prev === modId ? null : modId);
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'Video': return <Play className="w-3.5 h-3.5" />;
      case 'Article': return <FileText className="w-3.5 h-3.5" />;
      case 'Quiz': return <HelpCircle className="w-3.5 h-3.5" />;
      case 'Code': return <Code2 className="w-3.5 h-3.5" />;
      case 'Live Event': return <Users className="w-3.5 h-3.5" />;
      case 'H5P': return <Gamepad2 className="w-3.5 h-3.5" />;
      case 'Assignment': return <ClipboardEdit className="w-3.5 h-3.5" />;
      case 'External': return <ExternalLink className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };


  const completedCount = course.modules.filter(m => m.status === 'Completed').length;
  const inProgressModule = course.modules.find(m => m.status === 'In progress') || 
                           course.modules.find(m => m.status === 'Open');

  // DOM-measured tracker fill
  const timelineRef = useRef<HTMLDivElement>(null);
  const [trackerFillPx, setTrackerFillPx] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!timelineRef.current) return;
      const container = timelineRef.current;
      // Find the active module row — direct child of timeline container
      const activeRow = container.querySelector('[data-active-row="true"]') as HTMLElement | null;
      if (activeRow) {
        // Icon is absolutely positioned at top-1.5 (6px), height 32px → center at 22px
        setTrackerFillPx(activeRow.offsetTop + 22);
      } else {
        const allCompleted = course.modules.every(m => m.status === 'Completed');
        setTrackerFillPx(allCompleted ? container.scrollHeight : 0);
      }
    };
    const t = setTimeout(measure, 80);
    return () => clearTimeout(t);
  }, [expandedModuleId, course.modules, isLoading]);

  return (
    <div className="relative -mx-3 md:-mx-[44px] -my-6 bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="space-y-6 pb-32 max-w-[1600px] mx-auto">
      {/* 14.2 Header Card & Stats */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] text-cyan font-bold uppercase tracking-wider bg-bg px-2 py-0.5 rounded border border-line">
              {course.level} • {course.format === 'flipped' ? 'Flipped Bootcamp' : course.format === 'cohort' ? 'Cohort Based' : 'Self-Paced'}
            </span>
            <h1 className="text-2xl font-bold text-text mt-2">{course.title} Learning Path</h1>
            <p className="text-muted text-xs mt-1">{course.description}</p>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-muted">Course Progress</span>
            <div className="text-2xl font-bold text-cyan">{displayedProgress}%</div>
          </div>
        </div>

        <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line">
          <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${displayedProgress}%` }} />
        </div>

        {/* Header Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-2 rounded-xl bg-bg/30 border border-line/50">
            <div className="text-[9px] text-muted uppercase font-bold tracking-tighter">Modules</div>
            <div className="text-sm font-bold text-text">{completedCount}/{course.modules.length}</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-bg/30 border border-line/50">
            <div className="text-[9px] text-muted uppercase font-bold tracking-tighter">Time Left</div>
            <div className="text-sm font-bold text-text">~4 hrs</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-bg/30 border border-line/50">
            <div className="text-[9px] text-muted uppercase font-bold tracking-tighter">XP Earned</div>
            <div className="text-sm font-bold text-yellow">{course.progress * 10} XP</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-bg/30 border border-line/50">
            <div className="text-[9px] text-muted uppercase font-bold tracking-tighter">Streak</div>
            <div className="text-sm font-bold text-cyan">12 Days</div>
          </div>
        </div>

        {/* 14.2 Primary CTA */}
        <button 
          onClick={() => onNavigate('content-player')}
          className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-cyan/10"
        >
          <Play className="w-4 h-4 fill-current" />
          <span className="text-[11px] uppercase tracking-widest">Continue: {inProgressModule?.title}</span>
        </button>
      </div>

      {isError ? (
        <div className="text-center py-16 max-w-md mx-auto space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-bold text-text text-base">Failed to load learning path</h3>
            <p className="text-muted text-xs">We couldn't connect to retrieve the modules list. Please try again.</p>
          </div>
          <button onClick={handleRetry} className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer">Retry Connection</button>
        </div>
      ) : isLoading ? (
        <div className="relative pl-8 space-y-8 mt-8">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-line" />
          {[1, 2].map(i => (
            <div key={i} className="relative animate-pulse">
              <div className="absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 bg-bg border-line z-10" />
              <div className="bg-panel border border-line rounded-2xl p-5 space-y-4">
                <div className="space-y-2"><div className="h-4 bg-line rounded w-32" /><div className="h-3 bg-line rounded w-full" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 14.2 Timeline */
        <div className="relative pl-8 space-y-8 mt-8" ref={timelineRef}>
          {/* 14.4 REQ-PATH-003 Dynamic Connector: completed=filled, in-progress=animated, locked=dashed */}
          {/* Base track line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-line/40 rounded-full" />
          {/* Dashed locked segment — renders over full length, clipped by the cyan fill */}
          <div
            className="absolute left-[14px] top-4 bottom-4 bg-transparent"
            style={{ 
              borderLeft: '2px dashed',
              borderColor: 'color-mix(in srgb, var(--color-line, #334155) 60%, transparent)',
            }}
          />
          {/* Cyan completed/in-progress fill — covers and hides the dashed section up to active module */}
          <div
            className="absolute left-[15px] top-4 w-0.5 bg-cyan rounded-full transition-all duration-700"
            style={{ height: `${trackerFillPx}px` }}
          />
          {/* REQ-PATH-003: Animated pulse on the active module position */}
          {trackerFillPx > 0 && (
            <div
              className="absolute left-[11px] w-2 h-2 rounded-full bg-cyan animate-ping z-20"
              style={{ top: `calc(${trackerFillPx}px - 4px + 1rem)` }}
            />
          )}

          <>
            {/* Course Module Timeline */}
            {course.modules.map((mod, idx) => {
              const isCompleted = mod.status === 'Completed';
              const isInProgress = mod.status === 'In progress';
              const isLocked = mod.status === 'Locked';
              const isExpanded = expandedModuleId === mod.id;
              
              const materialCounts = {
                video: mod.lessons.filter(l => l.type === 'Video').length,
                code: mod.lessons.filter(l => l.type === 'Code').length,
                quiz: mod.lessons.filter(l => l.type === 'Quiz').length,
              };

              return (
                <div key={mod.id} className="relative" data-active-row={isInProgress ? "true" : undefined}>
                  {/* ... icon ... */}
                  <div 
                    className={`absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                      isCompleted ? 'bg-green border-green text-bg' :
                      isInProgress ? 'bg-panel border-cyan text-cyan' :
                      isLocked ? 'bg-bg border-line text-muted' : 'bg-bg border-line text-text'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : 
                     isLocked ? <Lock className="w-3.5 h-3.5" /> : 
                     <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>

                  {/* 14.3 Module Card — REQ-PATH-006: Completed = reduced weight, REQ-PATH-007: Locked tooltip on wrapper */}
                  <div 
                    className={`bg-panel border rounded-2xl overflow-hidden transition-all ${
                      isInProgress ? 'border-cyan shadow-lg shadow-cyan/5' : 
                      isLocked ? 'border-line/50 opacity-55' : 
                      isCompleted ? 'border-line opacity-80' : 'border-line'}`}
                    title={isLocked ? `Complete Module ${idx} to unlock this module` : undefined}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* 14.3.1 Status & Type Badges (REQ-PATH-012) */}
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              isCompleted ? 'bg-green/10 text-green border-green/20' : 
                              isInProgress ? 'bg-cyan/10 text-cyan border-cyan/20' : 
                              (isLocked && mod.availableDate) ? 'bg-purple/10 text-purple border-purple/20' :
                              'bg-line/20 text-muted border-line/30'
                            }`}>
                              {isLocked && mod.availableDate ? `Available ${mod.availableDate}` : mod.status}
                              {isInProgress && (
                                <span className="ml-1 text-[8px] opacity-70">
                                  ({Math.round((mod.lessons.filter(l => l.status === 'completed').length / mod.lessons.length) * 100)}%)
                                </span>
                              )}
                            </span>
                            
                            <span className={`flex items-center space-x-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              mod.type !== 'Self-study' ? 'bg-purple/10 text-purple border-purple/20' : 'bg-bg text-muted border-line italic'
                            }`}>
                              {mod.type === 'In-person session' ? <Users className="w-3 h-3" /> : 
                               mod.type === 'Live online session' ? <Video className="w-3 h-3" /> : 
                               <BookOpen className="w-3 h-3" />}
                              <span>{mod.type}</span>
                            </span>

                            {/* REQ-PATH-005: Quiz shortcut — opens quiz without entering Content Player */}
                            {materialCounts.quiz > 0 && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (!isLocked) {
                                    openModal('quiz', {
                                      props: {
                                        questions: [
                                          { id: 1, text: `What is the primary goal of ${mod.title}?`, options: ['To learn basics', 'To build projects', 'To pass a test', 'All of the above'] },
                                          { id: 2, text: 'Which of the following is correct?', options: ['A', 'B', 'C', 'D'] }
                                        ],
                                        onComplete: () => {
                                          addXp(50, `Completed quiz for ${mod.title}`);
                                        }
                                      }
                                    });
                                  } 
                                }}
                                title={isLocked ? `Complete Module ${idx} to unlock` : 'Jump straight to quiz'}
                                className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors ${
                                  isLocked 
                                    ? 'bg-line/10 text-muted border-line/30 cursor-not-allowed' 
                                    : 'bg-yellow/10 text-yellow border-yellow/20 hover:bg-yellow/20 cursor-pointer'
                                }`}
                              >
                                ⚡ Take Quiz
                              </button>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-lg text-text mt-1">{mod.title}</h3>
                          <p className="text-muted text-xs leading-relaxed max-w-2xl">{mod.description}</p>
                          
                          {/* REQ-PATH-016 & REQ-CHECKOUT-022: Prerequisites (Prep work) */}
                          {( (mod.prerequisites && mod.prerequisites.length > 0) || (mod.prepModules && mod.prepModules.length > 0) ) && (
                            <div className="flex flex-col bg-bg/50 border border-line/40 rounded-xl p-3.5 mt-3 max-w-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className={`w-4 h-4 ${mod.type === 'In-person session' ? 'text-purple' : 'text-cyan'}`} />
                                <span className={`font-black text-[10px] uppercase tracking-wider ${mod.type === 'In-person session' ? 'text-purple' : 'text-cyan'}`}>
                                  Required Preparation
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                {/* Text-based prerequisites */}
                                {mod.prerequisites?.map((p: string, i: number) => (
                                  <div key={i} className="text-[10px] text-text/80 flex items-start gap-2.5 leading-snug">
                                    <div className="w-1.5 h-1.5 bg-muted/40 rounded-full mt-1.5 shrink-0" />
                                    <span>{p}</span>
                                  </div>
                                ))}

                                {/* Module-based prerequisites (REQ-CHECKOUT-022) */}
                                {mod.prepModules?.map((prepId) => {
                                  const prepMod = course.modules.find(m => m.id === prepId);
                                  if (!prepMod) return null;
                                  const isPrepDone = prepMod.status === 'Completed';
                                  
                                  return (
                                    <div key={prepId} className="flex items-center justify-between p-2 rounded-lg bg-panel/50 border border-line/40">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isPrepDone ? 'bg-green/10 text-green' : 'bg-bg/40 text-muted'}`}>
                                          {isPrepDone ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        </div>
                                        <span className="text-[10px] font-bold text-text truncate">
                                          Complete {prepMod.title}
                                        </span>
                                      </div>
                                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${isPrepDone ? 'bg-green/20 text-green' : 'bg-line text-muted'}`}>
                                        {isPrepDone ? 'DONE' : 'PENDING'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 14.3.1 Material Chips — REQ-PATH-004: Hover to peek lesson titles */}
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center space-x-1 text-[10px] text-muted"><Clock className="w-3 h-3" /> <span>{mod.duration}</span></div>
                            {materialCounts.video > 0 && (
                              <div className="relative group/peek">
                                <div className="flex items-center space-x-1 text-[10px] text-muted border-l border-line pl-3 cursor-default hover:text-cyan transition-colors">
                                  <Play className="w-3 h-3" /> <span>{materialCounts.video} Videos</span>
                                </div>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/peek:flex flex-col gap-1.5 bg-panel border border-cyan/30 rounded-xl p-3 shadow-xl shadow-cyan/5 z-50 min-w-[220px] animate-in fade-in zoom-in-95 duration-150">
                                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-cyan/20 mb-0.5">
                                    <Play className="w-3 h-3 text-cyan" />
                                    <span className="text-[9px] font-black text-cyan uppercase tracking-wider">Video Lessons</span>
                                  </div>
                                  {mod.lessons.filter(l => l.type === 'Video').map(l => (
                                    <div key={l.id} className="flex items-center gap-2 text-xs text-text font-medium">
                                      <div className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
                                      <span className="truncate">{l.title}</span>
                                      <span className="text-cyan text-[10px] font-bold ml-auto shrink-0">{l.duration}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {materialCounts.code > 0 && (
                              <div className="relative group/peekcode">
                                <div className="flex items-center space-x-1 text-[10px] text-muted border-l border-line pl-3 cursor-default hover:text-cyan transition-colors">
                                  <Code2 className="w-3 h-3" /> <span>{materialCounts.code} Exercises</span>
                                </div>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/peekcode:flex flex-col gap-1.5 bg-panel border border-cyan/30 rounded-xl p-3 shadow-xl shadow-cyan/5 z-50 min-w-[230px] animate-in fade-in zoom-in-95 duration-150">
                                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-cyan/20 mb-0.5">
                                    <Code2 className="w-3 h-3 text-cyan" />
                                    <span className="text-[9px] font-black text-cyan uppercase tracking-wider">Code Exercises</span>
                                  </div>
                                  {mod.lessons.filter(l => l.type === 'Code').map(l => (
                                    <div key={l.id} className="flex items-center gap-2 text-xs text-text font-medium">
                                      <div className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
                                      <span className="truncate">{l.title}</span>
                                      <span className="text-cyan text-[10px] font-bold ml-auto shrink-0">{l.duration}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0 self-end sm:self-center">
                          <button 
                            onClick={() => !isLocked && onNavigate('content-player')}
                            className={`min-w-[100px] px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                              isCompleted ? 'bg-line/20 text-text hover:bg-line/30' : 
                              isInProgress ? 'bg-cyan text-bg hover:bg-cyan2 shadow-lg shadow-cyan/10' : 
                              'bg-line/10 text-muted cursor-not-allowed'
                            }`}
                          >
                            {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                          </button>

                          <button
                            onClick={() => toggleExpand(mod.id)}
                            className="flex items-center justify-center space-x-1.5 cursor-pointer group
                              md:text-[12px] md:text-muted md:hover:text-cyan md:transition-colors md:p-0 md:bg-transparent md:border-0
                              text-[11px] font-bold w-full border border-line bg-panel hover:border-cyan/50 hover:text-cyan text-muted px-4 py-2 rounded-lg transition-all md:w-auto"
                          >
                            <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                            <div>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 hidden md:block" />}
                              <ChevronRight className="w-3.5 h-3.5 md:hidden" />
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* 14.3.1 Scheduled info (REQ-PATH-013, REQ-PATH-015) */}
                      {mod.scheduledTime && (
                        <div className="bg-bg/60 border border-line/50 rounded-xl p-3.5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-purple shadow-sm">
                          <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-text/80">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-purple" />
                              <span>{mod.scheduledTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-purple" />
                              <span>{mod.venue}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button className="text-[9px] font-bold text-purple px-2.5 py-1.5 rounded-lg bg-purple/10 border border-purple/20 hover:bg-purple/20 transition-colors">Add to Calendar</button>
                             <button onClick={() => onNavigate('live-session')} className="text-[9px] font-bold text-bg px-2.5 py-1.5 rounded-lg bg-purple hover:bg-purple/90 shadow-lg shadow-purple/10 transition-all">Get Directions</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 14.6 Module Expansion */}
                    {isExpanded && (
                      <div className="border-t border-line bg-bg/25">
                        {/* Learning Objectives */}
                        <div className="p-6 md:p-8 border-b border-line bg-bg/40">
                           <div className="flex items-center space-x-2 mb-4"><Target className="w-4 h-4 text-cyan" /> <span className="text-[11px] font-black text-muted uppercase tracking-wider">Learning Objectives</span></div>
                           <ul className="space-y-2 border-l-2 border-cyan/50 pl-5 max-w-3xl">
                              {getLearningObjectives(mod.title).map((obj, i) => (
                                <li key={i} className="text-sm text-text/80 flex items-start gap-2.5">
                                  <div className="w-1.5 h-1.5 bg-cyan rounded-full mt-2 shrink-0" />
                                  <span>{obj}</span>
                                </li>
                              ))}
                           </ul>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pb-2 border-b border-line/30">
                            <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] opacity-60">Curriculum Structure</div>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted font-semibold bg-bg/50 border border-line px-3 py-1.5 rounded-xl">
                              <span className="text-cyan">{getRemainingTime(mod)}</span>
                              <span className="opacity-40">•</span>
                              <span>{mod.lessons.length} Lessons</span>
                              {materialCounts.video > 0 && <><span className="opacity-40">•</span><span>{materialCounts.video} Videos</span></>}
                              {mod.lessons.filter(l => l.type === 'Article').length > 0 && <><span className="opacity-40">•</span><span>{mod.lessons.filter(l => l.type === 'Article').length} Articles</span></>}
                              {materialCounts.code > 0 && <><span className="opacity-40">•</span><span>{materialCounts.code} Exercises</span></>}
                              {materialCounts.quiz > 0 && <><span className="opacity-40">•</span><span>{materialCounts.quiz} Quizzes</span></>}
                            </div>
                          </div>
                          {mod.lessons.map(les => (
                            /* 14.6.2 Lesson card */
                            <div 
                              key={les.id}
                              onClick={() => {
                                if (les.status !== 'locked') {
                                  localStorage.setItem('manthio_active_lesson', les.id);
                                  onNavigate('content-player');
                                }
                              }}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${
                                les.status === 'locked' 
                                  ? 'bg-bg/50 border-line opacity-60 grayscale cursor-not-allowed' 
                                  : 'bg-panel border-line hover:border-cyan/40 cursor-pointer shadow-sm active:scale-[0.98] hover:translate-x-1 duration-300'
                              }`}
                              title={les.status === 'locked' ? (les.unlockCondition || 'Complete previous lesson to unlock') : undefined}
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl border ${les.status === 'completed' ? 'bg-green/10 border-green/20 text-green' : les.status === 'in_progress' ? 'bg-cyan text-bg border-cyan' : 'bg-bg border-line text-muted'}`}>
                                  {getLessonIcon(les.type)}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                     <span className="font-bold text-base text-text">{les.title}</span>
                                     {les.required ? (
                                       <span className="text-[8px] bg-red/10 text-red px-1.5 py-0.5 rounded font-black uppercase">Required</span>
                                     ) : (
                                       /* REQ-PATH-023: Optional chip */
                                       <span className="text-[8px] bg-bg border border-line text-muted px-1.5 py-0.5 rounded font-black uppercase">Optional</span>
                                     )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-[11px] text-muted font-medium">
                                     <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {les.duration}</span>
                                     <span className="w-1.5 h-1.5 rounded-full bg-line" />
                                     <span className="font-black text-purple/80 uppercase tracking-tight">{les.bloomLevel}</span>
                                     <span className="w-1.5 h-1.5 rounded-full bg-line" />
                                     <div className="flex space-x-0.5 items-center">
                                        <span className="mr-1.5 opacity-60">Complexity:</span>
                                        {[1, 2, 3].map(d => <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= (les.difficulty || 2) ? 'bg-cyan' : 'bg-line'}`} />)}
                                     </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center mt-3 sm:mt-0 self-end sm:self-center min-w-[200px] justify-end">
                                <div className="flex items-center space-x-1 border-r border-line pr-3 mr-3">
                                   <button 
                                      onClick={(e) => toggleBookmark(e, les.id)}
                                      className={`p-1.5 transition-colors ${bookmarkedLessons.has(les.id) ? 'text-cyan' : 'text-muted hover:text-cyan'}`}
                                   >
                                      <Bookmark className={`w-3.5 h-3.5 ${bookmarkedLessons.has(les.id) ? 'fill-cyan' : ''}`} />
                                   </button>
                                   <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (les.status !== 'locked') onNavigate('content-player:notes');
                                      }} 
                                      className="p-1.5 text-muted hover:text-cyan transition-colors"
                                   >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                                <div className="flex items-center space-x-3 w-[100px] justify-end shrink-0">
                                   {/* Status Indicator */}
                                   {(() => {
                                     const status = completedLessonIds.includes(les.id) ? 'completed' : les.status;
                                     if (status === 'locked') {
                                       return <span className="text-muted text-[10px] font-bold flex items-center space-x-1 uppercase tracking-wider"><Lock className="w-3.5 h-3.5" /> <span>Locked</span></span>;
                                     }
                                     return null;
                                   })()}
                                   
                                   {/* Primary Action */}
                                   {(() => {
                                     const status = completedLessonIds.includes(les.id) ? 'completed' : les.status;
                                     if (status === 'locked') {
                                       return (
                                         <button disabled className="w-full bg-bg border border-line text-muted text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase cursor-not-allowed">
                                           Locked
                                         </button>
                                       );
                                     }
                                     
                                     const buttonClass = status === 'completed' 
                                       ? "bg-bg border border-line hover:border-cyan text-text" 
                                       : status === 'in_progress'
                                       ? "bg-bg border border-cyan text-cyan hover:bg-cyan/10"
                                       : "bg-cyan hover:bg-cyan2 text-bg border border-cyan";
                                     
                                     const buttonText = status === 'completed' ? 'Review' 
                                       : status === 'in_progress' ? 'Continue' : 'Start';
                                       
                                     return (
                                       <button 
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           localStorage.setItem('manthio_active_lesson', les.id);
                                           onNavigate('content-player');
                                         }}
                                         className={`w-full ${buttonClass} text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-all`}
                                       >
                                         {buttonText}
                                       </button>
                                     );
                                   })()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>

          {/* Certificate Milestone */}
          <div className="relative">
            <div className={`absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${displayedProgress === 100 ? 'bg-yellow border-yellow text-bg' : 'bg-bg border-line text-muted opacity-50'}`}>
              <Award className="w-4 h-4" />
            </div>
            <div className={`bg-panel border rounded-2xl p-6 border-dashed ${displayedProgress === 100 ? 'border-yellow' : 'border-line opacity-60'}`}>
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                     <h3 className="font-bold text-lg text-text">Course Certificate</h3>
                     <p className="text-muted text-xs max-w-md">Complete all modules to unlock your official {course.title} diploma.</p>
                  </div>
                  {course.progress === 100 ? (
                    <button className="bg-yellow text-bg px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                       <ExternalLink className="w-3.5 h-3.5" />
                       View Certificate
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted text-[10px] font-bold uppercase tracking-widest"><Lock className="w-3 h-3" /> Locked</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
