import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { Check, Lock, Play, ChevronDown, ChevronUp, Clock, HelpCircle, FileText, Code2, Users, MapPin, Calendar } from 'lucide-react';
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

  const toggleExpand = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
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
    addXp(10, `Lektion ${lesson.title} gestartet`);
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
            <h1 className="text-2xl font-bold text-text mt-2">{course.title} Lernpfad</h1>
            <p className="text-muted text-xs mt-1">{course.description}</p>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-muted">Kursfortschritt</span>
            <div className="text-2xl font-bold text-cyan">{course.progress}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line">
          <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${course.progress}%` }} />
        </div>
      </div>

      {/* Timeline of Modules */}
      <div className="relative pl-8 space-y-8 mt-8">
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
                          Modul {mod.number} • {mod.type}
                        </span>
                        {isInProgress && (
                          <span className="bg-cyan/15 text-cyan text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                            In Bearbeitung
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
                        Wegbeschreibung & Details
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
                                    Erforderlich
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted mt-1 block">Lektionstyp: {les.type} • Dauer: {les.duration}</span>
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
                                <span>Erledigt</span>
                              </span>
                            ) : les.status === 'locked' ? (
                              <Lock className="w-4 h-4 text-muted" />
                            ) : (
                              <button className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-colors">
                                Starten
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
    </div>
  );
};
