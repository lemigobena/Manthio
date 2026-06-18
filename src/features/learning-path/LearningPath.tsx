import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { Check, Lock, Play, ChevronDown, ChevronUp, Clock, HelpCircle, FileText, Code2, Users, MapPin, Calendar, AlertCircle } from 'lucide-react';
import type { Lesson, LessonType } from '../../types';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ onNavigate }) => {
  const { activeCourseId } = useAuth();
  const { addXp } = useXP();
  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'py-mod-3': true // Expand Workshop A by default
  });

  // Loading & Error States (REQ-LOAD-002, REQ-LOAD-004)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const simulateLoad = () => {
    setIsLoading(true);
    setIsError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return timer;
  };

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 750);
  };

  const toggleExpand = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    simulateLoad();
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'Video': return <Play className="w-4 h-4 text-cyan" />;
      case 'Article': return <FileText className="w-4 h-4 text-muted" />;
      case 'Quiz': return <HelpCircle className="w-4 h-4 text-yellow" />;
      case 'Code': return <Code2 className="w-4 h-4 text-cyan" />;
      case 'Live Event': return <Users className="w-4 h-4 text-purple" />;
      default: return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const startLesson = (lesson: Lesson) => {
    if (lesson.status === 'locked') return;
    addXp(10, `Lesson ${lesson.title} started`);
    onNavigate('content-player');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Course Header Summary Card */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] text-cyan font-bold uppercase tracking-wider bg-bg px-2 py-0.5 rounded border border-line">
              {course.level} • {course.format === 'flipped' ? 'Flipped Bootcamp' : 'Self-Paced'}
            </span>
            
            <h1 className="text-2xl font-bold text-text mt-2">{course.title} Learning Path</h1>
            <p className="text-muted text-xs mt-1">{course.description}</p>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-muted">Course Progress</span>
            <div className="text-2xl font-bold text-cyan">{course.progress}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line">
          <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${course.progress}%` }} />
        </div>
      </div>

      {isError ? (
        /* REQ-LOAD-004: Failed load show error state with retry action */
        <div className="text-center py-16 max-w-md mx-auto my-6 space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-bold text-text text-base">Failed to load learning path</h3>
            <p className="text-muted text-xs max-w-xs mx-auto">We couldn't connect to retrieve the modules list. Please try again.</p>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading ? (
        /* REQ-LOAD-002: Skeleton loader mimicking vertical timeline modules */
        <div className="relative pl-8 space-y-8 mt-8">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-line" />
          {[1, 2].map(i => (
            <div key={i} className="relative animate-pulse">
              <div className="absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 bg-bg border-line flex items-center justify-center z-10" />
              <div className="bg-panel border border-line rounded-2xl p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-3.5 bg-line rounded w-32" />
                  <div className="h-5 bg-line rounded w-2/3" />
                  <div className="h-3 bg-line rounded w-full" />
                  <div className="h-3 bg-line rounded w-4/5" />
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4 mt-2">
                  <div className="h-3.5 bg-line rounded w-20" />
                  <div className="h-6 bg-line rounded w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Timeline of Modules */
        <div className="relative pl-8 space-y-8 mt-8 animate-[fadeIn_0.3s_ease-out]">
          {/* Main timeline line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-line" />

          {course.modules.map((mod, idx) => {
            const isCompleted = mod.status === 'Completed';
            const isInProgress = mod.status === 'In progress';
            const isLocked = mod.status === 'Locked';
            const isExpanded = expandedModules[mod.id];
            
            return (
              <div key={mod.id} className="relative">
                
                {/* Timeline dot connector */}
                <div 
                  className={`absolute -left-[33px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                    isCompleted ? 'bg-green border-green text-bg' :
                    isInProgress ? 'bg-panel border-cyan text-cyan animate-pulse' :
                    isLocked ? 'bg-bg border-line text-muted' : 'bg-bg border-line text-text'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : 
                   isLocked ? <Lock className="w-3.5 h-3.5" /> : 
                   <span className="text-xs font-bold">{idx + 1}</span>}
                </div>

                {/* Module Card */}
                <div 
                  className={`bg-panel border rounded-2xl overflow-hidden transition-all ${
                    isInProgress ? 'border-cyan shadow-lg shadow-cyan/5' :
                    isLocked ? 'border-line opacity-60' : 'border-line'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-cyan font-bold uppercase tracking-wider">
                            Module {mod.number} • {mod.type}
                          </span>
                          {isInProgress && (
                            <span className="bg-cyan/15 text-cyan text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                              In Progress
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-text mt-1">{mod.title}</h3>
                        <p className="text-muted text-xs leading-relaxed max-w-2xl">{mod.description}</p>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <span className="text-xs text-muted flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{mod.duration}</span>
                        </span>
                        <button 
                          onClick={() => toggleExpand(mod.id)}
                          className="p-1 rounded bg-bg border border-line text-muted hover:text-text cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Scheduled info for Flipped session */}
                    {mod.scheduledTime && (
                      <div className="bg-bg border border-line rounded-xl p-3.5 mt-4 text-xs space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-4 text-muted">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-4 h-4 text-purple" />
                            <span>{mod.scheduledTime}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-purple" />
                            <span>{mod.venue}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => onNavigate('live-session')}
                          className="bg-purple text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider"
                        >
                          Directions & Details
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Lessons (Bausteine) list when expanded */}
                  {isExpanded && mod.lessons.length > 0 && (
                    <div className="border-t border-line bg-bg/25 divide-y divide-line p-4 space-y-2.5">
                      {mod.lessons.map(les => {
                        const lesLocked = les.status === 'locked';
                        return (
                          <div 
                            key={les.id} 
                            onClick={() => startLesson(les)}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border border-line hover:border-cyan/40 bg-panel transition-all ${
                              lesLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-bg border border-line rounded-lg">
                                {getLessonIcon(les.type)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sm text-text">{les.title}</span>
                                  {les.required && (
                                    <span className="text-[9px] bg-red/10 text-red px-1.5 py-0.5 rounded font-bold uppercase">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted mt-1 block">Lesson type: {les.type} • Duration: {les.duration}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 mt-3 sm:mt-0 self-end sm:self-center">
                              {les.bloomLevel && (
                                <span className="bg-purple/10 text-purple text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                  {les.bloomLevel}
                                </span>
                              )}
                              
                              {les.status === 'completed' ? (
                                <span className="text-green text-xs font-bold flex items-center space-x-1">
                                  <Check className="w-4 h-4 stroke-[3px]" />
                                  <span>Done</span>
                                </span>
                              ) : les.status === 'locked' ? (
                                <Lock className="w-4 h-4 text-muted" />
                              ) : (
                                <button className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-colors">
                                  Start
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
