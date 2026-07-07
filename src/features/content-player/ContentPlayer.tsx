import React, { useState, useEffect, useCallback } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useModal } from '../../context/ModalContext';
import type { Lesson, Course } from '../../types';

// Components
import { PlayerTopBar } from './components/PlayerTopBar';
import { PlayerBottomBar } from './components/PlayerBottomBar';
import { CurriculumPane } from './components/CurriculumPane';
import { ToolsPane } from './components/ToolsPane';

// Renderers
import { VideoRenderer } from './renderers/VideoRenderer';
import { PdfRenderer } from './renderers/PdfRenderer';
import { ArticleRenderer } from './renderers/ArticleRenderer';
import { QuizRenderer } from './renderers/QuizRenderer';
import { SandboxRenderer } from './renderers/SandboxRenderer';
import { H5PRenderer } from './renderers/H5PRenderer';
import { AssignmentRenderer } from './renderers/AssignmentRenderer';
import { ExternalLinkRenderer } from './renderers/ExternalLinkRenderer';

interface ContentPlayerProps {
  onNavigate: (page: string) => void;
  initialTab?: string;
  isQuickSession?: boolean;
  onCloseQuickSession?: () => void;
}

export const ContentPlayer: React.FC<ContentPlayerProps> = ({ onNavigate, initialTab, isQuickSession = false, onCloseQuickSession }) => {
  const { activeCourseId } = useAuth();
  const { addXp, addToast } = useXP();
  const { openModal } = useModal();
  
  // Find current course and module
  const [course, setCourse] = useState<Course>(() => {
    return COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  });

  const [currentLesson, setCurrentLesson] = useState<Lesson>(() => {
    // REQ-PATH-022 Check for active lesson passed via localStorage
    const activeLessonId = localStorage.getItem('manthio_active_lesson');
    if (activeLessonId) {
      const explicitLesson = course.modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId);
      if (explicitLesson) {
        // Clear it once consumed (optional, but good practice if we only want it on entry, 
        // though we'll sync it below to preserve reloads anyway)
        return explicitLesson;
      }
    }
    const currentModule = course.modules.find(m => m.status === 'In progress') || course.modules[0];
    return currentModule.lessons.find(l => l.status === 'in_progress') || currentModule.lessons[0];
  });

  // Sync active lesson to localStorage for reloads
  useEffect(() => {
    localStorage.setItem('manthio_active_lesson', currentLesson.id);
  }, [currentLesson.id]);

  // Responsive layout defaults (simple width check)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1400;
  
  const [curriculumOpen, setCurriculumOpen] = useState(!isMobile && !isTablet && !isQuickSession);
  const [toolsOpen, setToolsOpen] = useState(!!initialTab && !isQuickSession);

  // Mutual-exclusion check on resize
  useEffect(() => {
    if (windowWidth < 1400 && curriculumOpen && toolsOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToolsOpen(false);
    }
  }, [windowWidth, curriculumOpen, toolsOpen]);

  // Mutual-exclusion: below 1400px only one sidebar open at a time
  const handleSetCurriculumOpen = useCallback((open: boolean) => {
    if (isQuickSession) return;
    setCurriculumOpen(open);
    if (open && window.innerWidth < 1400) setToolsOpen(false);
  }, [isQuickSession]);

  const handleSetToolsOpen = useCallback((open: boolean) => {
    if (isQuickSession) return;
    setToolsOpen(open);
    if (open && window.innerWidth < 1400) setCurriculumOpen(false);
  }, [isQuickSession]);

  // Flatten lessons to find previous/next easily
  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  // REQ-PLAYER-020/021 — criteria gating
  // A lesson with scroll/video criteria starts locked; others start open.
  const [criteriaUnlocked, setCriteriaUnlocked] = useState<Record<string, boolean>>({});

  const lessonNeedsCriteria = !!currentLesson.completionCriteria && currentLesson.completionCriteria.type !== 'auto';
  const effectiveCriteriaMet =
    currentLesson.status === 'completed' ||
    !lessonNeedsCriteria ||
    !!criteriaUnlocked[currentLesson.id];

  const handleCriteriaMet = useCallback(() => {
    setCriteriaUnlocked(prev => ({ ...prev, [currentLesson.id]: true }));
  }, [currentLesson.id]);

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  }, [hasPrevious, currentIndex, allLessons]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, allLessons]);

  const markLessonComplete = useCallback((xpAmountOrEvent?: number | React.MouseEvent | unknown) => {
    const xpAmount = typeof xpAmountOrEvent === 'number' ? xpAmountOrEvent : 50;

    if (currentLesson.status !== 'completed') {
      // Award specified XP (default 50) per lesson completion
      addXp(xpAmount, `Lesson "${currentLesson.title}" completed`);
      
      // Update local state to show it's completed (mocking backend)
      setCourse(prev => {
        const newCourse = { ...prev };
        for (const mod of newCourse.modules) {
          const lesson = mod.lessons.find(l => l.id === currentLesson.id);
          if (lesson) {
            lesson.status = 'completed';
            
            // Auto-Completion Check (REQ-PLAYER-060)
            const allCompleted = mod.lessons.every(l => l.status === 'completed');
            if (allCompleted && mod.status !== 'Completed') {
              mod.status = 'Completed';
              addXp(200, `Module "${mod.title}" completed`);
              
              // Unlock next module
              const modIndex = newCourse.modules.findIndex(m => m.id === mod.id);
              if (modIndex < newCourse.modules.length - 1) {
                newCourse.modules[modIndex + 1].status = 'In progress';
                newCourse.modules[modIndex + 1].lessons.forEach(l => {
                  if(l.status === 'locked') l.status = 'not_started';
                });
              } else {
                // Course completion (REQ-PLAYER-061)
                addXp(1000, `Course "${newCourse.title}" completed`);
                openModal('celebration', {
                  title: 'Congratulations!',
                  description: `You have finished the course successfully.`,
                  props: { achievementName: 'Course Graduate', points: 1000 }
                });
              }
            }
            break;
          }
        }
        return newCourse;
      });

      // Update current lesson ref so UI re-renders status
      setCurrentLesson(prev => ({ ...prev, status: 'completed' }));
    }
  }, [currentLesson, addXp, openModal]);

  // Keyboard Shortcuts (REQ-PLAYER-040 - 045)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'k':
        case 'K':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleSetToolsOpen(true);
            setTimeout(() => document.getElementById('ai-tutor-input')?.focus(), 100);
          }
          break;
        case '?':
          addToast('info', 'Shortcuts: Left/Right (nav), F (fullscreen), Cmd+K (AI Tutor)');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, addToast, handleSetToolsOpen]);

  useEffect(() => {
    const handleSandboxSubmit = () => {
      handleSetToolsOpen(true);
    };
    window.addEventListener('sandbox_submit', handleSandboxSubmit);
    return () => window.removeEventListener('sandbox_submit', handleSandboxSubmit);
  }, [handleSetToolsOpen]);

  const renderCenterContent = () => {
    switch (currentLesson.type) {
      case 'Video':
        return <VideoRenderer lesson={currentLesson} />;
      case 'PDF':
        return <PdfRenderer lesson={currentLesson} />;
      case 'Article':
        return <ArticleRenderer lesson={currentLesson} onCriteriaMet={handleCriteriaMet} />;
      case 'Quiz':
        return <QuizRenderer lesson={currentLesson} onComplete={markLessonComplete} />;
      case 'Code':
        return <SandboxRenderer lesson={currentLesson} onComplete={markLessonComplete} />;
      case 'H5P':
        return <H5PRenderer lesson={currentLesson} onComplete={markLessonComplete} />;
      case 'Assignment':
        return <AssignmentRenderer lesson={currentLesson} onComplete={markLessonComplete} />;
      case 'External':
        return <ExternalLinkRenderer lesson={currentLesson} />;
      default:
        return <ArticleRenderer lesson={currentLesson} onCriteriaMet={handleCriteriaMet} />;
    }
  };

  return (
    <div className={`flex flex-col bg-bg overflow-hidden relative ${
      isQuickSession 
        ? 'w-full h-full' 
        : 'h-[calc(100dvh-64px)] -mx-3 md:-mx-[44px] -my-6 border-y border-line'
    }`}>
      <PlayerTopBar 
        course={course}
        currentLesson={currentLesson}
        toolsOpen={toolsOpen}
        setToolsOpen={handleSetToolsOpen}
        curriculumOpen={curriculumOpen}
        setCurriculumOpen={handleSetCurriculumOpen}
        onNavigate={onNavigate}
        isQuickSession={isQuickSession}
        onCloseQuickSession={onCloseQuickSession}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isQuickSession && (
          <CurriculumPane 
            course={course} 
            currentLesson={currentLesson} 
            onSelectLesson={setCurrentLesson} 
            isOpen={curriculumOpen}
            setIsOpen={handleSetCurriculumOpen}
          />
        )}

        <div className={`flex-1 bg-bg flex flex-col items-center ${
          ['PDF', 'Code', 'H5P'].includes(currentLesson.type) 
            ? 'p-2 md:py-3 md:px-4 overflow-hidden' 
            : 'px-2 py-4 sm:p-4 md:p-6 overflow-y-auto'
        }`}>
          <div className={`w-full ${((!curriculumOpen && !toolsOpen) || ['PDF', 'Code', 'H5P'].includes(currentLesson.type)) ? 'max-w-[1400px]' : 'max-w-4xl'} transition-all duration-500 ease-in-out flex-1 flex flex-col items-center min-h-0`}>
            {renderCenterContent()}
          </div>
        </div>

        {!isQuickSession && (
          <ToolsPane 
            currentLesson={currentLesson} 
            isOpen={toolsOpen} 
            initialTab={initialTab} 
            setIsOpen={handleSetToolsOpen} 
          />
        )}
      </div>

      {!isQuickSession && (
        <PlayerBottomBar 
          currentLesson={currentLesson}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onMarkComplete={markLessonComplete}
          criteriaMet={effectiveCriteriaMet}
      />
      )}
    </div>
  );
};
