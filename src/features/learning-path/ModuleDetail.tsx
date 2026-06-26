import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Play, Clock, Lock,
  Target, Bookmark, MessageSquare,
  FileText, Code2, HelpCircle, Users, ExternalLink, Gamepad2, ClipboardEdit
} from 'lucide-react';
import type { LessonType } from '../../types';

interface ModuleDetailProps {
  moduleId: string;
  onNavigate: (page: string) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({ moduleId, onNavigate }) => {
  const { activeCourseId } = useAuth();
  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const module = course.modules.find(m => m.id === moduleId);
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
        <div className="text-sm text-muted leading-relaxed">
          In this module, you will master the fundamental principles of {module.title.toLowerCase()} through 
          hands-on labs and theoretical deep-dives. By the end, you'll be able to apply these concepts 
          to complex production environments.
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted">Building Blocks</h2>
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
                    
                    let buttonClass = "";
                    if (lesson.status === 'completed') {
                      buttonClass = "bg-bg border border-line hover:border-cyan text-text";
                    } else if (lesson.status === 'in_progress') {
                      buttonClass = "bg-bg border border-cyan text-cyan hover:bg-cyan/10";
                    } else {
                      buttonClass = "bg-cyan hover:bg-cyan2 text-bg border border-cyan";
                    }
                    
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
