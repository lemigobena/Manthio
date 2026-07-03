import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronDown, BookOpen, Layers, PlayCircle, MessageSquarePlus,
  Video, Code, Award, Clock, Gamepad2, ClipboardEdit, ExternalLink, FileText, Check
} from 'lucide-react';
import { COURSES } from '../../../data/courses';
import type { Course, Module, Lesson } from '../../../types';

interface ContextSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (context: { course?: Course; module?: Module; lesson?: Lesson }) => void;
}

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'Video': return <Video className="w-4 h-4" />;
    case 'Code': return <Code className="w-4 h-4" />;
    case 'Quiz': return <Award className="w-4 h-4" />;
    case 'Live Event': return <Clock className="w-4 h-4" />;
    case 'H5P': return <Gamepad2 className="w-4 h-4" />;
    case 'Assignment': return <ClipboardEdit className="w-4 h-4" />;
    case 'External': return <ExternalLink className="w-4 h-4" />;
    case 'Article': return <FileText className="w-4 h-4" />;
    default: return <PlayCircle className="w-4 h-4" />;
  }
};

// Shared item renderer
const ItemButton = ({
  icon,
  label,
  sublabel,
  isSelected,
  hasChevron,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  isSelected: boolean;
  hasChevron?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center justify-between p-2.5 border-b border-line/30 last:border-b-0 transition-all ${
      isSelected ? 'bg-cyan/15 text-cyan' : 'text-text hover:text-cyan md:hover:text-text md:hover:bg-line/20'
    }`}
  >
    <div className="min-w-0 pr-2 flex items-center gap-3">
      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-cyan/20 text-cyan' : 'bg-line/30 text-muted'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-xs line-clamp-2">{label}</div>
        <div className="text-[10px] opacity-70 truncate mt-0.5">{sublabel}</div>
      </div>
    </div>
    {hasChevron && (
      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5' : 'opacity-50'}`} />
    )}
    {!hasChevron && isSelected && (
      <Check className="w-4 h-4 shrink-0 text-cyan" />
    )}
  </button>
);

// --- Mobile Accordion Section ---
const MobileAccordionSection = ({
  icon,
  title,
  isOpen: sectionOpen,
  onToggle,
  placeholder,
  selectedLabel,
  children,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  placeholder: string;
  selectedLabel?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <div className={`border border-line rounded-xl overflow-hidden transition-opacity flex flex-col ${disabled ? 'opacity-40 pointer-events-none' : ''} ${sectionOpen ? 'flex-1 min-h-0 h-[0px]' : 'shrink-0'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-line/30 hover:bg-line/40 transition-colors shrink-0"
    >
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${selectedLabel ? 'bg-cyan/20 text-cyan' : 'bg-line/30 text-muted'}`}>
          {icon}
        </div>
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{title}</div>
          <div className={`text-xs font-semibold mt-0.5 truncate max-w-[220px] ${selectedLabel ? 'text-cyan' : 'text-muted/60'}`}>
            {selectedLabel || placeholder}
          </div>
        </div>
      </div>
      <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${sectionOpen ? 'rotate-180' : ''}`} />
    </button>

    {sectionOpen && (
      <div className="border-t border-line flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </div>
    )}
  </div>
);

export const ContextSelectorModal: React.FC<ContextSelectorModalProps> = ({ isOpen, onClose, onStartChat }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Mobile accordion open states
  const [mobileCourseOpen, setMobileCourseOpen] = useState(true);
  const [mobileModuleOpen, setMobileModuleOpen] = useState(false);
  const [mobileLessonOpen, setMobileLessonOpen] = useState(false);

  if (!isOpen) return null;

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId);
  const selectedModule = selectedCourse?.modules.find((m) => m.id === selectedModuleId);
  const selectedLesson = selectedModule?.lessons.find((l) => l.id === selectedLessonId);

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedModuleId(null);
    setSelectedLessonId(null);
    // Mobile: close course, open module
    setMobileCourseOpen(false);
    setMobileModuleOpen(true);
    setMobileLessonOpen(false);
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(null);
    // Mobile: close module, open lesson
    setMobileModuleOpen(false);
    setMobileLessonOpen(true);
  };

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setMobileLessonOpen(false);
  };

  const handleStart = () => {
    onStartChat({ course: selectedCourse, module: selectedModule, lesson: selectedLesson });
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    setSelectedLessonId(null);
    setMobileCourseOpen(true);
    setMobileModuleOpen(false);
    setMobileLessonOpen(false);
  };

  const canStart = !!selectedCourse;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="min-h-[90vh] relative bg-panel border border-line shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line shrink-0 bg-panel/50 backdrop-blur-md">
          <div>
            <h2 className="text-sm font-bold text-text">New Conversation</h2>
            <p className="text-[10px] text-muted mt-0.5">Select a context level to focus the AI Tutor</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-line/50 rounded-lg text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Mobile: Sequential Accordions ── */}
        <div className="md:hidden flex-1 p-4 gap-3 flex flex-col min-h-0">
          <MobileAccordionSection
            icon={<BookOpen className="w-4 h-4" />}
            title="Course"
            isOpen={mobileCourseOpen}
            onToggle={() => {
              if (!mobileCourseOpen) {
                setMobileCourseOpen(true);
                setMobileModuleOpen(false);
                setMobileLessonOpen(false);
              } else {
                setMobileCourseOpen(false);
              }
            }}
            placeholder="Select a course..."
            selectedLabel={selectedCourse?.title}
          >
            {COURSES.map((course) => (
              <ItemButton
                key={course.id}
                icon={<BookOpen className="w-4 h-4" />}
                label={course.title}
                sublabel={course.topic}
                isSelected={selectedCourseId === course.id}
                hasChevron={false}
                onClick={() => handleCourseClick(course.id)}
              />
            ))}
          </MobileAccordionSection>

          <MobileAccordionSection
            icon={<Layers className="w-4 h-4" />}
            title="Module"
            isOpen={mobileModuleOpen}
            onToggle={() => {
              if (!mobileModuleOpen) {
                setMobileModuleOpen(true);
                setMobileCourseOpen(false);
                setMobileLessonOpen(false);
              } else {
                setMobileModuleOpen(false);
              }
            }}
            placeholder="Select a module..."
            selectedLabel={selectedModule ? selectedModule.title : undefined}
            disabled={!selectedCourse}
          >
            {selectedCourse?.modules.map((mod) => (
              <ItemButton
                key={mod.id}
                icon={<Layers className="w-4 h-4" />}
                label={mod.title}
                sublabel={`${mod.lessons.length} lessons`}
                isSelected={selectedModuleId === mod.id}
                hasChevron={false}
                onClick={() => handleModuleClick(mod.id)}
              />
            ))}
          </MobileAccordionSection>

          <MobileAccordionSection
            icon={<PlayCircle className="w-4 h-4" />}
            title="Lesson"
            isOpen={mobileLessonOpen}
            onToggle={() => {
              if (!mobileLessonOpen) {
                setMobileLessonOpen(true);
                setMobileCourseOpen(false);
                setMobileModuleOpen(false);
              } else {
                setMobileLessonOpen(false);
              }
            }}
            placeholder="Select a lesson (optional)..."
            selectedLabel={selectedLesson?.title}
            disabled={!selectedModule}
          >
            {selectedModule?.lessons.map((lesson) => (
              <ItemButton
                key={lesson.id}
                icon={getLessonIcon(lesson.type)}
                label={lesson.title}
                sublabel={`${lesson.type} • ${lesson.duration}`}
                isSelected={selectedLessonId === lesson.id}
                hasChevron={false}
                onClick={() => handleLessonClick(lesson.id)}
              />
            ))}
          </MobileAccordionSection>
        </div>

        {/* ── Desktop: Miller Columns ── */}
        <div className="hidden md:flex flex-1 overflow-hidden min-h-[300px]">
          {/* Courses Column */}
          <div className="w-1/3 border-r border-line flex flex-col shrink-0 bg-bg/30">
            <div className="p-2 border-b border-line shrink-0 bg-panel text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Courses
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {COURSES.map((course) => (
                <ItemButton
                  key={course.id}
                  icon={<BookOpen className="w-4 h-4" />}
                  label={course.title}
                  sublabel={course.topic}
                  isSelected={selectedCourseId === course.id}
                  hasChevron
                  onClick={() => handleCourseClick(course.id)}
                />
              ))}
            </div>
          </div>

          {/* Modules Column */}
          {selectedCourse && (
            <div className={`${selectedModule ? 'w-1/3 shrink-0' : 'flex-1'} border-r border-line flex flex-col bg-bg/30 animate-in slide-in-from-left-4 fade-in duration-200`}>
              <div className="p-2 border-b border-line shrink-0 bg-panel text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                Modules
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {selectedCourse.modules.map((mod) => (
                  <ItemButton
                    key={mod.id}
                    icon={<Layers className="w-4 h-4" />}
                    label={mod.title}
                    sublabel={`${mod.lessons.length} lessons`}
                    isSelected={selectedModuleId === mod.id}
                    hasChevron
                    onClick={() => handleModuleClick(mod.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lessons Column */}
          {selectedModule && (
            <div className="flex-1 flex flex-col bg-bg/30 animate-in slide-in-from-left-4 fade-in duration-200">
              <div className="p-2 border-b border-line shrink-0 bg-panel text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <PlayCircle className="w-3.5 h-3.5" />
                Lessons
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {selectedModule.lessons.map((lesson) => (
                  <ItemButton
                    key={lesson.id}
                    icon={getLessonIcon(lesson.type)}
                    label={lesson.title}
                    sublabel={`${lesson.type} • ${lesson.duration}`}
                    isSelected={selectedLessonId === lesson.id}
                    hasChevron={false}
                    onClick={() => handleLessonClick(lesson.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line shrink-0 bg-panel/50 backdrop-blur-md flex items-center justify-between">
          <div className="text-[10px] text-muted hidden md:block">
            {selectedLesson ? (
              <span>Context: <strong>{selectedLesson.title}</strong></span>
            ) : selectedModule ? (
              <span>Context: <strong>Module {selectedModule.number}</strong></span>
            ) : selectedCourse ? (
              <span>Context: <strong>{selectedCourse.title}</strong></span>
            ) : (
              <span>Please select a context level</span>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-line/30 hover:bg-line/50 text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-cyan text-bg hover:bg-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Create Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
