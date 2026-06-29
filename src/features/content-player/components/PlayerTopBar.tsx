import React, { useState } from 'react';
import { ChevronLeft, Bookmark, PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from 'lucide-react';
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
    <div className="bg-panel border-b border-line px-4 md:px-6 flex items-center justify-between z-20 shrink-0 h-[44px]">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => onNavigate('learning-path')}
          className="p-1 rounded-lg bg-bg border border-line text-muted hover:text-text cursor-pointer transition-colors"
          title="Back to Learning Path"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        
        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-[10px] text-muted font-bold uppercase truncate max-w-[150px] md:max-w-[250px]">{course.title}</span>
          <span className="text-line text-xs font-bold">•</span>
          <h1 className="text-xs font-bold text-text truncate max-w-[150px] md:max-w-[250px]">{currentLesson.title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-3 text-[10px] font-bold">
          <span className="text-muted uppercase tracking-wider">Module Progress: {moduleProgress}%</span>
          <div className="w-24 h-1.5 bg-bg rounded-full overflow-hidden border border-line/50 relative shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan/50 to-cyan rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,255,255,0.4)]" 
              style={{ width: `${moduleProgress}%` }} 
            />
          </div>
          <span className="text-muted/70 font-medium">{lessonCurrent}/{lessonTotal} Completed</span>
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
            onClick={() => setCurriculumOpen(!curriculumOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer block min-[1024px]:hidden text-muted hover:text-cyan ${curriculumOpen ? 'text-cyan' : ''}`}
            title="Toggle Curriculum"
          >
            {curriculumOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setToolsOpen(!toolsOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer text-muted hover:text-cyan ${toolsOpen ? 'text-cyan' : ''}`}
            title="Toggle AI Tutor & Tools"
          >
            {toolsOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
