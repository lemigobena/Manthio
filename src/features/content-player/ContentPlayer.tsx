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
}

export const ContentPlayer: React.FC<ContentPlayerProps> = ({ onNavigate, initialTab }) => {
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
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
  
  const [curriculumOpen, setCurriculumOpen] = useState(!isMobile && !isTablet);
  const [toolsOpen, setToolsOpen] = useState(!!initialTab);

  // Flatten lessons to find previous/next easily
  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

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
      addToast('success', `+${xpAmount} XP — Lesson completed!`);
      
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
              addToast('success', '🎉 Module Completed! +200 XP Bonus!');
              
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
                addToast('success', '🏆 Course Completed! +1000 XP! Certificate available.');
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
  }, [currentLesson, addXp, addToast, openModal]);

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
            setToolsOpen(true);
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
  }, [handlePrevious, handleNext, addToast]);

  useEffect(() => {
    const handleSandboxSubmit = () => {
      setToolsOpen(true);
    };
    window.addEventListener('sandbox_submit', handleSandboxSubmit);
    return () => window.removeEventListener('sandbox_submit', handleSandboxSubmit);
  }, []);

  const renderCenterContent = () => {
    switch (currentLesson.type) {
      case 'Video':
        return <VideoRenderer lesson={currentLesson} />;
      case 'PDF':
        return <PdfRenderer lesson={currentLesson} />;
      case 'Article':
        return <ArticleRenderer lesson={currentLesson} />;
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
        return <ArticleRenderer lesson={currentLesson} />;
    }
  };

  return (
    <div className="h-[calc(100dvh-64px)] flex flex-col -mx-3 md:-mx-[44px] -my-6 bg-bg overflow-hidden relative border-y border-line">
      <PlayerTopBar 
        course={course}
        currentLesson={currentLesson}
        toolsOpen={toolsOpen}
        setToolsOpen={setToolsOpen}
        curriculumOpen={curriculumOpen}
        setCurriculumOpen={setCurriculumOpen}
        onNavigate={onNavigate}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <CurriculumPane 
          course={course} 
          currentLesson={currentLesson} 
          onSelectLesson={setCurrentLesson} 
          isOpen={curriculumOpen}
          setIsOpen={setCurriculumOpen}
        />

        <div className="flex-1 bg-bg flex flex-col overflow-y-auto p-4 md:p-6 items-center">
          <div className={`w-full ${(!curriculumOpen && !toolsOpen) ? 'max-w-[1400px]' : 'max-w-4xl'} transition-all duration-500 ease-in-out flex-1 flex flex-col items-center`}>
            {renderCenterContent()}
          </div>
        </div>

        <ToolsPane currentLesson={currentLesson} isOpen={toolsOpen} initialTab={initialTab} />
      </div>

      <PlayerBottomBar 
        currentLesson={currentLesson}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onMarkComplete={markLessonComplete}
      />
    </div>
  );
};
