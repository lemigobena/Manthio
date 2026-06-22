import React, { useState } from 'react';
import { ChevronLeft, Bookmark } from 'lucide-react';
import { useXP } from '../../../context/XPContext';
import type { Course, Lesson } from '../../../types';

interface PlayerTopBarProps {
  course: Course;
  currentLesson: Lesson;
  toolsOpen: boolean;
  setToolsOpen: (open: boolean) => void;
  curriculumOpen: boolean;
  setCurriculumOpen: (open: boolean) => void;
  onNavigate: (page: string) => void;
}

export const PlayerTopBar: React.FC<PlayerTopBarProps> = ({
  course,
  currentLesson,
  toolsOpen,
  setToolsOpen,
  curriculumOpen,
  setCurriculumOpen,
  onNavigate
}) => {
  const { addToast } = useXP();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    addToast(
      isBookmarked ? 'info' : 'success', 
      isBookmarked ? 'Removed from bookmarks.' : 'Lesson bookmarked successfully!'
    );
  };

  // Find current module index and total lessons for progress
  let lessonCurrent = 0;
  let lessonTotal = 0;
  let moduleProgress = 0;

  course.modules.forEach(m => {
    if (m.lessons.some(l => l.id === currentLesson.id)) {
      lessonTotal = m.lessons.length;
      lessonCurrent = m.lessons.findIndex(l => l.id === currentLesson.id) + 1;
      const completedCount = m.lessons.filter(l => l.status === 'completed').length;
      moduleProgress = Math.round((completedCount / lessonTotal) * 100) || 0;
    }
  });

  return (
    <div className="bg-panel border-b border-line px-4 md:px-6 py-3 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => onNavigate('learning-path')}
          className="p-1.5 rounded-lg bg-bg border border-line text-muted hover:text-text cursor-pointer transition-colors"
          title="Back to Learning Path"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="hidden sm:block">
          <span className="text-[10px] text-muted font-semibold uppercase block truncate max-w-[200px] md:max-w-md">{course.title}</span>
          <h1 className="text-sm font-bold text-text truncate max-w-[200px] md:max-w-md">{currentLesson.title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex flex-col items-end w-40">
          <div className="flex justify-between items-center w-full mb-1.5">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Module Progress</span>
            <span className="text-[10px] font-bold text-cyan">{moduleProgress}%</span>
          </div>
          <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line/50 relative shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan/50 to-cyan rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,255,255,0.4)]" 
              style={{ width: `${moduleProgress}%` }} 
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-white/40 blur-[1px]" />
            </div>
          </div>
          <span className="text-[9px] text-muted/70 mt-1.5 font-medium">{lessonCurrent} of {lessonTotal} lessons completed</span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${isBookmarked ? 'bg-cyan/15 text-cyan' : 'bg-transparent text-muted hover:bg-line/50 hover:text-text'}`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <div className="w-px h-4 bg-line mx-1 hidden md:block"></div>
          
          <button 
            onClick={() => {
              setCurriculumOpen(!curriculumOpen);
              if (!curriculumOpen && window.innerWidth < 1200) setToolsOpen(false);
            }}
            className={`p-2 rounded-lg transition-colors cursor-pointer block min-[1200px]:hidden ${curriculumOpen ? 'bg-cyan/15 text-cyan' : 'bg-transparent text-muted hover:bg-line/50 hover:text-text'}`}
            title="Toggle Curriculum"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="9" x2="9" y1="3" y2="21"/>
              {curriculumOpen && <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4z" fill="currentColor" stroke="none" />}
            </svg>
          </button>

          <button 
            onClick={() => {
              setToolsOpen(!toolsOpen);
              if (!toolsOpen && window.innerWidth < 1200) setCurriculumOpen(false);
            }}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${toolsOpen ? 'bg-cyan/15 text-cyan' : 'bg-transparent text-muted hover:bg-line/50 hover:text-text'}`}
            title="Toggle AI Tutor & Tools"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="15" x2="15" y1="3" y2="21"/>
              {toolsOpen && <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4z" fill="currentColor" stroke="none" />}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
