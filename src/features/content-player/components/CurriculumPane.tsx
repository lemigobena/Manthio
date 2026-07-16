import React, { useState } from 'react';
import { Check, Lock, Search, ChevronDown, ChevronRight, PanelLeft, PanelLeftClose } from 'lucide-react';
import { CourseIcon, LessonIcon } from '../../../utils/courseIcons';
import type { Course, Lesson } from '../../../types';

interface CurriculumPaneProps {
  course: Course;
  currentLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const CurriculumPane: React.FC<CurriculumPaneProps> = ({
  course,
  currentLesson,
  onSelectLesson,
  isOpen,
  setIsOpen
}) => {
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleModule = (moduleId: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <>
      {/* Backdrop overlay for tablet/mobile when drawer is open */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-transparent z-30 min-[1024px]:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      <div className={`bg-panel border-r border-line flex flex-col overflow-hidden shrink-0 transition-all absolute min-[1024px]:relative z-40 h-full ${
        isOpen 
          ? 'w-[280px] max-w-[85vw] opacity-100 pointer-events-auto shadow-2xl min-[1024px]:shadow-none' 
          : 'w-0 opacity-0 pointer-events-none min-[1024px]:w-16 min-[1024px]:opacity-100 min-[1024px]:pointer-events-auto'
      }`}>
        <div className="px-4 border-b border-line flex items-center justify-between shrink-0 h-[44px]">
          {isOpen ? (
            <>
              <h3 className="font-bold text-xs uppercase text-muted tracking-wider">
                Curriculum
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted hover:text-cyan transition-colors cursor-pointer hidden min-[1024px]:block"
                title="Collapse Curriculum"
              >
                <PanelLeftClose className="w-5 h-5 shrink-0" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="w-full flex justify-center p-1 text-muted hover:text-cyan transition-colors cursor-pointer"
              title="Expand Curriculum"
            >
              <PanelLeft className="w-5 h-5 shrink-0" />
            </button>
          )}
        </div>
        
        {/* Search within the curriculum */}
        <div className={`px-4 py-3 border-b border-line shrink-0 flex justify-center ${!isOpen ? 'px-0' : ''}`}>
          {isOpen ? (
            <div className="relative w-full">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search lessons..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg border border-line text-xs rounded-lg pl-9 pr-3 py-2 text-text focus:outline-none focus:border-cyan !outline-none"
              />
            </div>
          ) : (
            <span title="Search lessons">
              <Search className="w-5 h-5 text-muted cursor-pointer hover:text-cyan transition-colors" onClick={() => setIsOpen(true)} />
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-hide">
          {course.modules.map(mod => {
            const filteredLessons = mod.lessons.filter(les => 
              les.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (searchQuery && filteredLessons.length === 0) return null;

            const isCollapsed = searchQuery ? false : collapsedModules[mod.id];
            
            // Module state → icon tint: cyan when finished, normal when unlocked, muted when locked
            const allCompleted = mod.lessons.every(l => l.status === 'completed');
            const allLocked = mod.lessons.every(l => l.status === 'locked');
            const moduleIconClass = allCompleted ? 'text-cyan' :
              allLocked ? 'text-muted/50' : 'text-muted';

            if (!isOpen) {
              // Icon strip view
              const hasActiveLesson = mod.lessons.some(l => l.id === currentLesson.id);

              return (
                <div
                  key={mod.id}
                  className={`w-10 h-10 mx-auto rounded-lg flex flex-col items-center justify-center transition-colors ${
                    hasActiveLesson ? 'bg-cyan/20 border border-cyan text-cyan cursor-pointer' :
                    allCompleted ? 'bg-cyan/10 text-cyan cursor-pointer' :
                    allLocked ? 'bg-bg text-muted/50 cursor-not-allowed' :
                    'bg-bg hover:bg-line/50 text-muted cursor-pointer'
                  }`}
                  title={`Module ${mod.number}: ${mod.title}`}
                  onClick={() => {
                    // If clicking icon strip module, we can just select the first not completed lesson
                    const nextLesson = mod.lessons.find(l => l.status !== 'completed' && l.status !== 'locked') || mod.lessons[0];
                    if (nextLesson && nextLesson.status !== 'locked') {
                      onSelectLesson(nextLesson);
                    }
                  }}
                >
                  <CourseIcon hint={`${mod.title} ${course.title}`} className="w-4 h-4" />
                  <span className="text-[8px] font-bold mt-0.5">M{mod.number}</span>
                </div>
              );
            }

            // Full view
            return (
              <div key={mod.id} className="space-y-1">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full text-left px-3 py-2 text-[11px] font-bold text-text bg-bg/50 hover:bg-line/50 rounded-lg uppercase tracking-wide flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className={`flex items-center justify-center shrink-0 ${moduleIconClass}`}>
                    <CourseIcon hint={`${mod.title} ${course.title}`} className="w-4 h-4" />
                  </span>
                  <span className="flex-1">Module {mod.number}</span>
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />}
                </button>

                {!isCollapsed && (
                  <>
                    <div className="px-3 text-xs font-semibold text-text mb-2 pt-1">
                      {mod.title}
                    </div>
                    <div className="divide-y divide-line/40">
                      {filteredLessons.map(les => {
                        const isActive = les.id === currentLesson.id;
                        const isLocked = les.status === 'locked';
                        const isCompleted = les.status === 'completed';

                        return (
                          <button
                            key={les.id}
                            onClick={() => {
                              if (!isLocked) {
                                onSelectLesson(les);
                                if (window.innerWidth < 1200) {
                                  setIsOpen(false);
                                }
                              }
                            }}
                            disabled={isLocked}
                            className={`group w-full text-left pl-2 pr-3 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-all duration-200 ${
                              isActive ? 'bg-cyan/10 text-cyan font-bold shadow-[inset_0_0_0_1px_rgba(0,245,228,0.25)]' :
                              isLocked ? 'text-muted cursor-not-allowed opacity-60' :
                              'text-text hover:bg-bg/80 cursor-pointer font-medium'
                            }`}
                          >
                            {/* Lesson-type icon chip */}
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-px transition-colors ${
                              isActive ? 'bg-cyan/15 text-cyan' :
                              isCompleted ? 'bg-green/10 text-green' :
                              isLocked ? 'bg-line/30 text-muted' :
                              'bg-line/40 text-muted group-hover:bg-cyan/10 group-hover:text-cyan'
                            }`}>
                              <LessonIcon type={les.type} className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex flex-col pr-2 flex-1 min-w-0">
                              <span className={isActive ? 'line-clamp-2' : 'line-clamp-1'}>{les.title}</span>
                              {les.microChunkable && (
                                <span className="text-[9px] text-muted mt-1 uppercase font-bold tracking-wider">
                                  Micro-chunks
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 text-[10px] text-muted mt-1 flex items-center">
                              {isCompleted ? <Check className="w-3.5 h-3.5 text-green" /> :
                               isLocked ? <Lock className="w-3.5 h-3.5" /> : les.duration}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
