import React, { useState } from 'react';
import { Check, Lock, Search, ChevronDown, ChevronRight, Menu } from 'lucide-react';
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
          className="fixed inset-0 bg-black/50 z-30 min-[1200px]:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      <div className={`bg-panel border-r border-line flex flex-col overflow-hidden shrink-0 transition-all absolute min-[1200px]:relative z-40 h-full ${
        isOpen 
          ? 'w-full md:w-[280px] opacity-100 pointer-events-auto shadow-2xl min-[1200px]:shadow-none' 
          : 'w-0 opacity-0 pointer-events-none min-[1200px]:w-16 min-[1200px]:opacity-100 min-[1200px]:pointer-events-auto'
      }`}>
        <div className="p-4 border-b border-line flex items-center justify-between shrink-0 h-[53px]">
          {isOpen ? (
            <h3 
              className="font-bold text-xs uppercase text-muted tracking-wider cursor-pointer hover:text-text transition-colors"
              onClick={() => setIsOpen(false)}
              title="Collapse Curriculum"
            >
              Curriculum
            </h3>
          ) : (
            <span title="Expand Curriculum">
              <Menu 
                className="w-5 h-5 text-muted mx-auto cursor-pointer hover:text-cyan transition-colors" 
                onClick={() => setIsOpen(true)}
              />
            </span>
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
                className="w-full bg-bg border border-line text-xs rounded-lg pl-9 pr-3 py-2 text-text focus:outline-none focus:border-cyan"
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
            
            if (!isOpen) {
              // Icon strip view
              const hasActiveLesson = mod.lessons.some(l => l.id === currentLesson.id);
              const allCompleted = mod.lessons.every(l => l.status === 'completed');
              
              return (
                <div 
                  key={mod.id} 
                  className={`w-10 h-10 mx-auto rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    hasActiveLesson ? 'bg-cyan/20 border border-cyan' : 
                    allCompleted ? 'bg-green/10 text-green' : 'bg-bg hover:bg-line/50 text-muted'
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
                  <span className="text-[10px] font-bold">M{mod.number}</span>
                  {allCompleted && <Check className="w-3 h-3 text-green mt-0.5" />}
                </div>
              );
            }

            // Full view
            return (
              <div key={mod.id} className="space-y-1">
                <button 
                  onClick={() => toggleModule(mod.id)}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-text bg-bg/50 hover:bg-line/50 rounded-lg uppercase tracking-wide flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span>Module {mod.number}</span>
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-muted" />}
                </button>
                
                {!isCollapsed && (
                  <>
                    <div className="px-3 text-xs font-semibold text-text mb-2 pt-1">
                      {mod.title}
                    </div>
                    <div className="space-y-0.5">
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
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-start justify-between transition-colors ${
                              isActive ? 'bg-cyan/10 text-cyan font-bold border-l-[3px] border-cyan' :
                              isLocked ? 'text-muted cursor-not-allowed opacity-60' : 'text-text hover:bg-bg/60 cursor-pointer font-medium'
                            }`}
                          >
                            <div className="flex flex-col pr-2 flex-1">
                              <span className="line-clamp-2">{les.title}</span>
                              {les.microChunkable && (
                                <span className="text-[9px] text-muted mt-1 uppercase font-bold tracking-wider">
                                  Micro-chunks
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 text-[10px] text-muted mt-0.5 flex items-center">
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
