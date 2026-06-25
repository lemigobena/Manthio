import React, { useState } from 'react';
import { COURSES, TRACKS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { 
  Check, Lock, Play, ChevronDown, ChevronUp, ChevronRight, Clock, HelpCircle, 
  FileText, Code2, Users, MapPin, Calendar, AlertCircle,
  Target, Award, BookOpen, Bookmark, MessageSquare, ExternalLink, Zap, User,
  ShieldCheck, CheckCircle
} from 'lucide-react';
import type { Lesson, LessonType } from '../../types';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ onNavigate }) => {
  const { activeCourseId, activeTrackId, setActiveCourseId } = useAuth();
  const { addXp } = useXP();
  
  const track = activeTrackId ? TRACKS.find(t => t.id === activeTrackId) : null;
  const course = track 
    ? (COURSES.find(c => c.id === activeCourseId) || COURSES.find(c => c.id === track.milestones[0].courses[0].id) || COURSES[0])
    : (COURSES.find(c => c.id === activeCourseId) || COURSES[0]);

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return null;
    return course.modules[0]?.id || null;
  });
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

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
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const startLesson = (lesson: Lesson) => {
    if (lesson.status === 'locked') return;
    addXp(10, `Lesson ${lesson.title} started`);
    onNavigate('content-player');
  };

  const completedCount = course.modules.filter(m => m.status === 'Completed').length;
  const inProgressModule = course.modules.find(m => m.status === 'In progress') || 
                           course.modules.find(m => m.status === 'Open');

  return (
    <div className="relative -mx-3 md:-mx-[44px] -my-6 bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="space-y-6 pb-32 max-w-[1600px] mx-auto">
      {/* 14.2 Header Card & Stats */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] text-cyan font-bold uppercase tracking-wider bg-bg px-2 py-0.5 rounded border border-line">
              {track ? track.level : course.level} • {course.format === 'flipped' ? 'Flipped Bootcamp' : 'Self-Paced'}
            </span>
            <h1 className="text-2xl font-bold text-text mt-2">
              {track ? track.title : `${course.title} Learning Path`}
            </h1>
            <p className="text-muted text-xs mt-1">
              {track ? `Track Focus: ${course.title} — ${course.description}` : course.description}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-muted">{track ? 'Track Progress' : 'Course Progress'}</span>
            <div className="text-2xl font-bold text-cyan">{track ? track.progress : course.progress}%</div>
          </div>
        </div>

        <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line">
          <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${track ? track.progress : course.progress}%` }} />
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
        <div className="relative pl-8 space-y-8 mt-8">
          {/* 14.4 REQ-PATH-003 Dynamic Connector */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-line rounded-full" />
          <div className="absolute left-[15px] top-4 w-0.5 bg-cyan rounded-full transition-all duration-1000" style={{ height: `${track ? track.progress : course.progress}%` }} />

          {track ? (
            // Track Milestone Timeline
            track.milestones.map((milestone, idx) => {
              const isCompleted = milestone.status === 'completed';
              const isInProgress = milestone.status === 'active';
              const isLocked = milestone.status === 'locked';
              
              return (
                <div key={milestone.id} className="relative">
                  <div 
                    className={`absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                      isCompleted ? 'bg-green border-green text-bg' :
                      isInProgress ? 'bg-panel border-cyan text-cyan' :
                      'bg-bg border-line text-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : 
                     isLocked ? <Lock className="w-3.5 h-3.5" /> : 
                     <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>

                  <div className={`bg-panel border rounded-2xl p-6 space-y-5 ${isInProgress ? 'border-cyan shadow-lg shadow-cyan/5' : 'border-line opacity-80'}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isInProgress ? 'text-cyan' : isCompleted ? 'text-green' : 'text-muted'}`}>
                            MILESTONE {idx + 1} {isCompleted ? '• COMPLETED' : isInProgress ? '• CURRENT FOCUS' : ''}
                          </span>
                          {isInProgress && (
                            <span className="bg-cyan/10 text-cyan border border-cyan/20 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                              Active Phase
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-xl text-text">{milestone.title}</h3>
                        <p className="text-muted text-xs leading-relaxed max-w-2xl">{milestone.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Milestone Progress</div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-bg border border-line rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isCompleted ? 'bg-green' : 'bg-cyan'} transition-all duration-1000`} 
                              style={{ width: `${isCompleted ? 100 : isInProgress ? 45 : 0}%` }} 
                            />
                          </div>
                          <span className="text-xs font-black text-text">{isCompleted ? '100%' : isInProgress ? '45%' : '0%'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill Badges (REQ-TRACK-005 placeholder) */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-muted bg-bg/50 px-2 py-1 rounded border border-line">
                        <Zap className="w-3 h-3 text-cyan" /> Core Systems
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-muted bg-bg/50 px-2 py-1 rounded border border-line">
                        <Award className="w-3 h-3 text-purple" /> Architecture
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                      {milestone.courses.map((mCourseEntry) => {
                        const mCourse = COURSES.find(c => c.id === mCourseEntry.id);
                        if (!mCourse) return null;
                        const isCourseExpanded = expandedCourseId === mCourse.id;

                        return (
                          <div key={mCourse.id} className="lg:col-span-2 group/course">
                            <div className="bg-bg/40 border border-line p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between group hover:border-cyan/30 transition-all gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg border border-line shrink-0">
                                  <img src={mCourse.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-text truncate group-hover:text-cyan transition-colors">{mCourse.title}</h4>
                                    {mCourseEntry.isOptional && <span className="bg-purple/10 text-purple text-[8px] font-black px-1.5 py-0.5 rounded border border-purple/20 uppercase">Optional</span>}
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-muted font-bold">
                                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mCourse.duration}</div>
                                    <div className="flex items-center gap-1 text-cyan"><Award className="w-3 h-3" /> +{mCourse.xpReward} XP</div>
                                  </div>
                                  <div className="text-[10px] text-muted flex items-center gap-1.5 pt-1">
                                    <User className="w-3 h-3" /> <span>Trainer: {mCourse.trainer.name}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setActiveCourseId(mCourse.id);
                                    onNavigate('content-player');
                                  }}
                                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                                    isInProgress 
                                      ? 'bg-cyan text-bg hover:bg-cyan2 shadow-lg shadow-cyan/10' 
                                      : 'bg-line/10 text-muted cursor-not-allowed'
                                  }`}
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  {isCompleted ? 'Review' : 'Continue'}
                                </button>
                                <button 
                                  onClick={() => {
                                    setExpandedCourseId(isCourseExpanded ? null : mCourse.id);
                                  }}
                                  className={`px-4 py-2 bg-panel border ${isCourseExpanded ? 'border-cyan text-cyan' : 'border-line text-text'} hover:border-cyan/30 text-[10px] font-black rounded-xl transition-all flex items-center gap-2`}
                                >
                                  {isCourseExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  <span>Details</span>
                                </button>
                              </div>
                            </div>

                            {/* Inline Course Modules for Track View (Universal) */}
                            {isCourseExpanded && (
                              <div className="mt-3 ml-4 sm:ml-8 border-l-2 border-line/50 space-y-3 animate-[slideDown_0.3s_ease-out]">
                                {mCourse.modules.map((mMod, mIdx) => (
                                  <div key={mMod.id} className="relative pl-5 sm:pl-6 group/mod">
                                    <div className="absolute left-[-5px] top-3 w-2 h-2 rounded-full bg-line group-hover/mod:bg-cyan transition-colors" />
                                    <div className="bg-bg/20 border border-line/30 rounded-xl p-3 flex items-center justify-between hover:bg-bg/40 transition-all">
                                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                        <span className="text-[10px] font-black text-muted opacity-50 shrink-0">#{(mIdx + 1).toString().padStart(2, '0')}</span>
                                        <div className="space-y-0.5 min-w-0">
                                          <div className="text-xs font-bold text-text truncate">{mMod.title}</div>
                                          <div className="text-[9px] text-muted font-bold flex items-center gap-2 flex-wrap">
                                            <span className="uppercase">{mMod.type}</span>
                                            <span>•</span>
                                            <span>{mMod.duration}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <button className="p-1.5 text-muted hover:text-cyan transition-all shrink-0">
                                        <Play className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Course Module Timeline (Existing)
            course.modules.map((mod, idx) => {
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
                <div key={mod.id} className="relative">
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

                  {/* 14.3 Module Card */}
                  <div 
                    className={`bg-panel border rounded-2xl overflow-hidden transition-all ${
                      isInProgress ? 'border-cyan shadow-lg shadow-cyan/5' : 
                      isLocked ? 'border-line opacity-60' : 'border-line'}`}
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
                            </span>
                            
                            <span className={`flex items-center space-x-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              mod.type !== 'Self-study' ? 'bg-purple/10 text-purple border-purple/20' : 'bg-bg text-muted border-line italic'
                            }`}>
                              {mod.type === 'In-person session' ? <Users className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                              <span>{mod.type}</span>
                            </span>

                            {materialCounts.quiz > 0 && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow/10 text-yellow border border-yellow/20">Quiz Included</span>}
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

                          {/* 14.3.1 Material Chips */}
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center space-x-1 text-[10px] text-muted"><Clock className="w-3 h-3" /> <span>{mod.duration}</span></div>
                            {materialCounts.video > 0 && <div className="flex items-center space-x-1 text-[10px] text-muted border-l border-line pl-3"><Play className="w-3 h-3" /> <span>{materialCounts.video} Videos</span></div>}
                            {materialCounts.code > 0 && <div className="flex items-center space-x-1 text-[10px] text-muted border-l border-line pl-3"><Code2 className="w-3 h-3" /> <span>{materialCounts.code} Exercises</span></div>}
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
                           <div className="flex items-center space-x-2 mb-3"><Target className="w-4 h-4 text-cyan" /> <span className="text-[11px] font-black text-muted uppercase tracking-wider">Learning Objectives</span></div>
                           <div className="text-sm text-muted leading-relaxed italic border-l-2 border-cyan/50 pl-5 max-w-3xl">
                              Unlock the core potential of this module by applying industry-standard methods to solve enterprise-scale challenges. 
                              You will build a robust foundation in {(mod.title).toLowerCase()} while preparing for advanced certifications.
                           </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                          <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2 opacity-50">Curriculum Structure</div>
                          {mod.lessons.map(les => (
                            /* 14.6.2 Lesson card */
                            <div key={les.id} onClick={() => startLesson(les)} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${les.status === 'locked' ? 'opacity-50 grayscale cursor-not-allowed border-line' : 'bg-panel border-line hover:border-cyan/40 cursor-pointer shadow-sm hover:translate-x-1 duration-300'}`}>
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

                              <div className="flex items-center space-x-3 mt-3 sm:mt-0 self-end sm:self-center">
                                <div className="flex items-center space-x-1 border-r border-line pr-2 mr-1">
                                   <button className="p-1.5 text-muted hover:text-cyan transition-colors"><Bookmark className="w-3.5 h-3.5" /></button>
                                   <button className="p-1.5 text-muted hover:text-cyan transition-colors"><MessageSquare className="w-3.5 h-3.5" /></button>
                                </div>
                                {les.status === 'completed' ? (
                                  <span className="text-green text-xs font-bold flex items-center space-x-1"><Check className="w-4 h-4 stroke-[3px]" /> <span>Done</span></span>
                                ) : les.status === 'locked' ? (
                                  /* REQ-PATH-024: Locked tooltip */
                                  <div 
                                    title="Complete previous lesson to unlock"
                                    className="cursor-help"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-muted" />
                                  </div>
                                ) : (
                                  <button className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase">Start</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Certificate Milestone */}
          <div className="relative">
            <div className={`absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${course.progress === 100 ? 'bg-yellow border-yellow text-bg' : 'bg-bg border-line text-muted opacity-50'}`}>
              <Award className="w-4 h-4" />
            </div>
            <div className={`bg-panel border rounded-2xl p-6 border-dashed ${course.progress === 100 ? 'border-yellow' : 'border-line opacity-60'}`}>
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
