import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Play, Clock, Lock,
  Target, Bookmark, MessageSquare,
  FileText, Code2, HelpCircle, Users, ExternalLink, Gamepad2, ClipboardEdit
} from 'lucide-react';
import { useTrack } from '../track-detail/useTrack';
import type { LessonType } from '../../types';

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

interface ModuleDetailProps {
  moduleId: string;
  onNavigate: (page: string) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({ moduleId, onNavigate }) => {
  const { activeCourseId } = useAuth();
  const { completedLessonIds } = useTrack();
  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const module = course.modules.find(m => m.id === moduleId);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());

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

  const toggleBookmark = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setBookmarkedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center text-red">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text">Module Not Found</h2>
        <button 
          onClick={() => onNavigate('learning-path')}
          className="text-cyan font-bold hover:underline"
        >
          Return to Learning Path
        </button>
      </div>
    );
  }

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'Video': return <Play className="w-4 h-4" />;
      case 'Article': return <FileText className="w-4 h-4" />;
      case 'Quiz': return <HelpCircle className="w-4 h-4" />;
      case 'Code': return <Code2 className="w-4 h-4" />;
      case 'Live Event': return <Users className="w-4 h-4" />;
      case 'H5P': return <Gamepad2 className="w-4 h-4" />;
      case 'Assignment': return <ClipboardEdit className="w-4 h-4" />;
      case 'External': return <ExternalLink className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isCompleted = module.status === 'Completed';
  const isInProgress = module.status === 'In progress';
  const isLocked = module.status === 'Locked';

  return (
    <div className="relative h-[calc(100dvh-64px)] -mx-3 md:-mx-[44px] -my-6 overflow-y-auto bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="pb-20 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('learning-path')}
          className="flex items-center space-x-2 text-muted hover:text-text transition-colors group"
        >
          <div className="p-2 rounded-lg bg-panel border border-line group-hover:border-cyan/50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Back to Path</span>
        </button>
        
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
          isCompleted ? 'bg-green/10 text-green border-green/20' : 
          isInProgress ? 'bg-cyan/10 text-cyan border-cyan/20' : 
          'bg-line/20 text-muted border-line/30'
        }`}>
          {module.status}
        </span>
      </div>

      {/* Module Hero Section */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <span className="text-8xl font-black">{module.number}</span>
        </div>
        
        <div className="space-y-1 relative z-10">
          <div className="text-cyan text-[10px] font-black uppercase tracking-widest">Module {module.number}</div>
          <h1 className="text-2xl font-black text-text leading-tight">{module.title}</h1>
        </div>
        
        <p className="text-muted text-sm leading-relaxed relative z-10">
          {module.description}
        </p>

        <div className="flex items-center space-x-6 pt-2 text-[11px] font-bold text-muted relative z-10">
          <div className="flex items-center space-x-1.5"><Clock className="w-4 h-4" /> <span>{module.duration} Total Time</span></div>
          <div className="flex items-center space-x-1.5 border-l border-line pl-6"><Play className="w-4 h-4" /> <span>{module.lessons.length} Lessons</span></div>
        </div>
      </div>

      {/* Learning Objectives Card */}
      <div className="bg-bg/40 border border-line rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-cyan" />
          <h2 className="text-xs font-black uppercase tracking-widest text-text">Learning Objectives</h2>
        </div>
        <ul className="space-y-2 border-l-2 border-cyan/50 pl-5">
          {getLearningObjectives(module.title).map((obj, i) => (
            <li key={i} className="text-sm text-text/80 flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-cyan rounded-full mt-2 shrink-0" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lessons List */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line/30">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted">Building Blocks</h2>
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted font-semibold bg-panel border border-line px-3 py-1 rounded-xl w-fit">
            <span className="text-cyan">{getRemainingTime(module)}</span>
            <span className="opacity-40">•</span>
            <span>{module.lessons.length} Lessons</span>
            {module.lessons.filter(l => l.type === 'Video').length > 0 && <><span className="opacity-40">•</span><span>{module.lessons.filter(l => l.type === 'Video').length} Videos</span></>}
            {module.lessons.filter(l => l.type === 'Article').length > 0 && <><span className="opacity-40">•</span><span>{module.lessons.filter(l => l.type === 'Article').length} Articles</span></>}
            {module.lessons.filter(l => l.type === 'Code').length > 0 && <><span className="opacity-40">•</span><span>{module.lessons.filter(l => l.type === 'Code').length} Exercises</span></>}
            {module.lessons.filter(l => l.type === 'Quiz').length > 0 && <><span className="opacity-40">•</span><span>{module.lessons.filter(l => l.type === 'Quiz').length} Quizzes</span></>}
          </div>
        </div>
        <div className="space-y-3">
          {module.lessons.map(lesson => (
            <div 
              key={lesson.id}
              onClick={() => {
                if (lesson.status !== 'locked') {
                  localStorage.setItem('manthio_active_lesson', lesson.id);
                  onNavigate('content-player');
                }
              }}
              className={`p-4 rounded-2xl border transition-all ${
                lesson.status === 'locked' 
                  ? 'bg-bg/50 border-line opacity-60 grayscale cursor-not-allowed' 
                  : 'bg-panel border-line hover:border-cyan/40 cursor-pointer shadow-sm active:scale-[0.98]'
              }`}
              title={lesson.status === 'locked' ? (lesson.unlockCondition || 'Complete previous lesson to unlock') : undefined}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-xl border ${
                    lesson.status === 'completed' ? 'bg-green/10 border-green/20 text-green' : 
                    lesson.status === 'in_progress' ? 'bg-cyan text-bg border-cyan' : 
                    'bg-bg border-line text-muted'
                  }`}>
                    {getLessonIcon(lesson.type)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text">{lesson.title}</span>
                      {lesson.required ? (
                        <span className="text-[8px] bg-red/10 text-red px-1.5 py-0.5 rounded-md font-black uppercase">Required</span>
                      ) : (
                        <span className="text-[8px] bg-bg border border-line text-muted px-1.5 py-0.5 rounded-md font-black uppercase">Optional</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-muted">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.duration}</span>
                      <span className="w-1 h-1 rounded-full bg-line" />
                      <span className="font-black text-purple/70 uppercase">{lesson.bloomLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-3 w-[100px] justify-end">
                  {/* Status Indicator */}
                  {(() => {
                    if (lesson.status === 'locked') {
                      return <span className="text-muted text-[10px] font-bold flex items-center space-x-1 uppercase tracking-wider"><Lock className="w-3.5 h-3.5" /> <span>Locked</span></span>;
                    }
                    return null;
                  })()}

                  {/* Primary Action */}
                  {(() => {
                    if (lesson.status === 'locked') {
                      return (
                        <button disabled className="w-full bg-bg border border-line text-muted text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase cursor-not-allowed">
                          Locked
                        </button>
                      );
                    }
                    
                    const buttonClass = lesson.status === 'completed' 
                      ? "bg-bg border border-line hover:border-cyan text-text" 
                      : lesson.status === 'in_progress'
                      ? "bg-bg border border-cyan text-cyan hover:bg-cyan/10"
                      : "bg-cyan hover:bg-cyan2 text-bg border border-cyan";
                    
                    const buttonText = lesson.status === 'completed' ? 'Review' 
                      : lesson.status === 'in_progress' ? 'Continue' : 'Start';
                      
                    return (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem('manthio_active_lesson', lesson.id);
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

              {/* Lesson Utility Actions - Mobile focused */}
              <div className="flex items-center space-x-1.5 pt-4 mt-4 border-t border-line/40">
                 <button 
                    onClick={(e) => toggleBookmark(e, lesson.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl bg-bg border border-line text-[10px] font-bold transition-colors ${
                      bookmarkedLessons.has(lesson.id) ? 'text-cyan border-cyan/30' : 'text-muted hover:text-text'
                    }`}
                 >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedLessons.has(lesson.id) ? 'fill-cyan' : ''}`} />
                    <span>{bookmarkedLessons.has(lesson.id) ? 'Saved' : 'Save'}</span>
                 </button>
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (lesson.status !== 'locked') onNavigate('content-player:notes');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl bg-bg border border-line text-[10px] font-bold text-muted hover:text-text transition-colors"
                 >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discuss</span>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Progress Ribbon (Preserved Progress REQ-PATH-025) */}
      {!isLocked && (
        <div className="sticky bottom-4 mx-4 bg-cyan text-bg p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-[slideUp_0.4s_ease-out]">
          <div className="space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Overall Module Progress</div>
            <div className="text-lg font-black">{module.status === 'Completed' ? '100% DONE' : 'STILL LEARNING'}</div>
          </div>
          <button 
            onClick={() => onNavigate('content-player')}
            className="bg-bg text-text font-black px-6 py-2 rounded-xl text-xs uppercase"
          >
            {module.status === 'Completed' ? 'Review' : 'Continue'}
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
