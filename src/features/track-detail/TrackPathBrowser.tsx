import React, { useMemo, useState, useEffect } from 'react';
import {
  Clock, User, ChevronRight, GraduationCap, Heart, Bookmark
} from 'lucide-react';
import { COURSES } from '../../services/mockData';
import type { Course, SelfAssessmentLevel } from '../../types';
import { calculateCourseProgress } from '../../services/progressUtils';

interface MilestoneData {
  id: string;
  label: string;
  courseId: string;
  isOptional?: boolean;
  prerequisiteMilestoneIds: string[];
  order: number;
  isSubCourse?: boolean;
  primaryIndex?: number;
}

type MilestoneState = 'completed' | 'current' | 'available' | 'locked';

interface TrackPathBrowserProps {
  milestones: MilestoneData[];
  completedMilestoneIds: string[];
  selfAssessmentLevel: SelfAssessmentLevel;
  isEnrolled: boolean;
  completedLessonIds: string[];
  onNavigateToCourse: (id: string, target: 'course-detail' | 'learning-path') => void;
}

const SKIPPABLE: Record<string, string[]> = {
  nothing: [],
  basics: ['git-essentials', 'markdown-developers'],
  experience: ['python-bootcamp', 'git-essentials', 'command-line-basics'],
};

const COURSE_IMAGES: Record<string, string> = {
  'python-bootcamp': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
  'git-essentials': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop',
  'aws-practitioner': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
  'data-analysis': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop'
};

export const TrackPathBrowser: React.FC<TrackPathBrowserProps> = ({
  milestones,
  completedMilestoneIds,
  selfAssessmentLevel,
  isEnrolled,
  completedLessonIds,
  onNavigateToCourse,
}) => {
  const filteredMilestones = useMemo(() => {
    if (selfAssessmentLevel === 'experience') {
      return milestones.filter(ms => !ms.isOptional);
    }
    if (selfAssessmentLevel === 'basics') {
      let optionalCount = 0;
      return milestones.filter(ms => {
        if (ms.isOptional) {
          optionalCount++;
          return optionalCount % 2 === 1;
        }
        return true;
      });
    }
    return milestones;
  }, [milestones, selfAssessmentLevel]);

  const enriched = useMemo(() => filteredMilestones.map((ms, idx) => {
    const isCompleted = completedMilestoneIds.includes(ms.id);
    const isPrevDoneOrSkippable = idx === 0 || (() => {
      const prev = filteredMilestones[idx - 1];
      const prevDone = completedMilestoneIds.includes(prev.id);
      const prevSkip = isEnrolled && (SKIPPABLE[selfAssessmentLevel as keyof typeof SKIPPABLE]?.includes(prev.courseId) || false);
      return prevDone || prevSkip;
    })();
    const state: MilestoneState = isCompleted ? 'completed' : (isPrevDoneOrSkippable ? 'current' : 'locked');
    return { ms, state };
  }), [filteredMilestones, completedMilestoneIds, isEnrolled, selfAssessmentLevel]);

  const defaultId = useMemo(() => {
    const current = enriched.find(e => e.state === 'current');
    return (current ?? enriched[0])?.ms.id ?? null;
  }, [enriched]);

  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const manualSelectRef = React.useRef(false);

  useEffect(() => {
    if (!selectedId || !enriched.some(e => e.ms.id === selectedId)) {
      setSelectedId(defaultId);
    }
  }, [defaultId, enriched, selectedId]);

  // Scrollspy Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualSelectRef.current) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-milestone-id');
            if (id) {
              setSelectedId(id);
            }
          }
        });
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 }
    );

    const nodes = document.querySelectorAll('[data-milestone-id]');
    nodes.forEach(node => observer.observe(node));

    return () => observer.disconnect();
  }, [enriched]);

  const selected = enriched.find(e => e.ms.id === selectedId) ?? enriched[0];
  const selectedCourse: Course | undefined = selected ? COURSES.find(c => c.id === selected.ms.courseId) : undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10 lg:items-start">
      {/* ── Left: tall naturally scrolling tree ── */}
      <aside className="w-full lg:w-[320px] lg:shrink-0 pb-10 lg:pb-[60vh]">
        <div className="space-y-4">
          {/* Header — plain, no chrome */}
          <div className="flex items-center gap-2 px-1">
            <GraduationCap className="w-4 h-4 text-cyan" />
            <span className="text-[10px] font-black uppercase text-text tracking-widest">Course Roadmap</span>
            <span className="ml-auto text-[10px] font-bold text-muted">
              {enriched.length} steps
            </span>
          </div>

          <ul className="relative space-y-1.5 mt-2">
            {/* Continuous vertical rod for the timeline */}
            <div className="absolute left-[21px] top-10 bottom-8 w-px bg-line border-l border-line/60 z-0" />

            {enriched.map(({ ms, state }, idx) => {
              const course = COURSES.find(c => c.id === ms.courseId);
              const isSelected = ms.id === selectedId;
              const isSub = ms.isSubCourse || false;

              return (
                <li key={ms.id} data-milestone-id={ms.id} className="relative z-10">
                  {/* L-connector rod for sub-courses */}
                  {isSub && (
                    <div className="absolute left-[21px] top-6 w-6 h-px bg-line/60 -z-10" />
                  )}

                  {!isSub && (
                    <div className="pt-4 pb-2 pl-3 bg-bg/80 backdrop-blur-sm">
                      <span className="text-[10px] font-black uppercase text-muted/60 tracking-widest">
                        {ms.label}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      manualSelectRef.current = true;
                      setSelectedId(ms.id);

                      // Smooth scroll to the item
                      const el = document.querySelector(`[data-milestone-id="${ms.id}"]`);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 200;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }

                      // Release manual override after scroll completes
                      setTimeout(() => { manualSelectRef.current = false; }, 1000);
                    }}
                    className={`w-full text-left group relative flex items-center gap-3.5 py-3 px-3 rounded-2xl transition-all duration-300 bg-bg ${isSub ? 'ml-6 w-[calc(100%-1.5rem)]' : ''
                      } ${isSelected
                        ? 'border border-line shadow-md translate-x-1 z-20'
                        : 'border border-transparent hover:bg-panel/40 hover:translate-x-0.5'
                      }`}
                  >
                    {/* Clean State Indicator */}
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0 bg-bg rounded-full">
                      <span
                        className={`absolute inset-0 rounded-full transition-transform duration-300 ${isSelected ? 'scale-100 opacity-20' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-10'
                          } ${
                            state === 'completed' ? 'bg-green'
                            : state === 'current' ? 'bg-cyan'
                            : 'bg-muted'
                          }`}
                      />
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 relative z-10 transition-colors ${
                          state === 'completed' ? 'bg-green'
                          : state === 'current' ? 'bg-cyan animate-pulse shadow-[0_0_8px_rgba(0,245,228,0.5)]'
                          : state === 'locked' ? 'bg-line border border-line/50'
                          : 'bg-bg border border-cyan/40'
                        }`}
                      />
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-tight truncate transition-colors ${isSelected ? 'text-text' : state === 'locked' ? 'text-muted/70' : 'text-text/90 group-hover:text-text'
                        }`}>
                        {course?.title ?? ms.label}
                      </p>
                      {course && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-muted font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </p>
                          {ms.isOptional && (
                            <span className="text-[8px] font-black uppercase text-purple tracking-widest bg-purple/10 px-1.5 py-0.5 rounded">
                              Optional
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-all ${isSelected ? 'text-cyan opacity-100 translate-x-0' : 'text-muted/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-cyan'
                        }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* ── Right: sticky animated detail panel — sits high so full content stays inside the viewport ── */}
      <section className="flex-1 min-w-0 lg:sticky lg:top-4 lg:h-[calc(100dvh-5rem)] lg:max-h-[850px]">
        {selected && selectedCourse ? (
          <CourseDetailPanel
            key={selectedCourse.id}
            course={selectedCourse}
            milestone={selected.ms}
            state={selected.state}
            completedLessonIds={completedLessonIds}
            onNavigateToCourse={onNavigateToCourse}
          />
        ) : (
          <div className="bg-panel border border-line rounded-2xl p-8 text-center text-muted">
            No course selected.
          </div>
        )}
      </section>
    </div>
  );
};

// ── Right side detail panel ──
const CourseDetailPanel: React.FC<{
  course: Course;
  milestone: MilestoneData;
  state: MilestoneState;
  completedLessonIds: string[];
  onNavigateToCourse: (id: string, target: 'course-detail' | 'learning-path') => void;
}> = ({ course, milestone, state, completedLessonIds, onNavigateToCourse }) => {
  const progress = calculateCourseProgress(course, completedLessonIds);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(t);
  }, []);

  const primaryCtaLabel = (state === 'completed' || progress === 100) ? 'Review course'
    : state === 'locked' ? 'Preview' : progress > 0 ? 'Continue' : 'Start course';

  const stateChip: { label: string; cls: string } = {
    completed: { label: 'Completed', cls: 'bg-green/20 border-green/40 text-green' },
    current: { label: 'Ready to start', cls: 'bg-cyan/20 border-cyan/40 text-cyan' },
    available: { label: 'Available', cls: 'bg-bg/70 border-line text-text' },
    locked: { label: 'Locked', cls: 'bg-line/30 border-line text-muted' },
  }[state];

  const imageUrl = COURSE_IMAGES[course.id] || COURSE_IMAGES.default;
  const hash = Math.abs(course.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));
  const students = (10 + (hash % 40) + (hash % 10) / 10).toFixed(1);
  const bookmarks = (1 + (hash % 8) + (hash % 10) / 10).toFixed(1);
  const loved = 90 + (hash % 10);

  return (
    <div
      className={`relative w-full h-[600px] lg:h-full bg-[#fcfcfb] dark:bg-[#0A0A0A] rounded-[2rem] overflow-hidden transition-all duration-700 ease-out border border-line/30 shadow-sm flex flex-col ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      {/* ── Faint Vertical Grid Lines ── */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-16 z-0">
        <div className="w-px h-full bg-line/40" />
        <div className="w-px h-full bg-line/40" />
        <div className="w-px h-full bg-line/40" />
        <div className="w-px h-full bg-line/40" />
      </div>

      {/* ── Seamless Hero Image ── */}
      <div className="absolute inset-0 -top-10 -left-10 -right-10 bottom-1/4 pointer-events-none z-0 flex items-start justify-center">
        <img
          src={imageUrl}
          alt={course.title}
          className={`w-[85%] h-[95%] object-cover object-top transition-transform duration-[1500ms] ease-out mix-blend-multiply dark:mix-blend-lighten ${entered ? 'scale-100' : 'scale-105'
            } ${state === 'locked' ? 'opacity-40 grayscale blur-[2px]' : 'opacity-90'}`}
          style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)' }}
        />
      </div>

      {/* ── Top Right floating chips (menu style) ── */}
      <div className="absolute top-10 right-10 flex flex-col items-end gap-1.5 z-20 text-[11px] font-medium text-text/80 tracking-wide">
        <div className="flex items-center gap-3 text-text font-bold text-xs mb-1">
          <span className="w-4 h-[2px] bg-[#5BB8AC]" /> {stateChip.label}
        </div>
        {milestone.isOptional && (
          <div>Recommended</div>
        )}

        {progress > 0 && (
          <div className="text-green font-bold mt-1">{progress}% Completed</div>
        )}

        <div className="flex flex-col items-end gap-2 mt-4 pt-4 border-t border-line/40">
          <div className="flex items-center gap-2">
            <span>{students}k Students</span>
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span>{bookmarks}k Bookmarks</span>
            <Bookmark className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span>{loved}% Loved it</span>
            <Heart className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ── Left side small floating text ── */}
      <div className="absolute top-[30%] left-10 lg:left-12 max-w-[240px] z-20 hidden lg:block overflow-hidden max-h-[40%]">
        <div className="text-xl font-light text-muted/40 mb-2">+</div>
        <div className="text-[11px] text-text/80 leading-relaxed font-medium space-y-1.5">
          <p className="font-bold text-text uppercase tracking-widest text-[9px]">Course Goals</p>
          <ul className="space-y-1">
            {course.learningOutcomes?.slice(0, 3).map((goal, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-[#5BB8AC] mt-0.5">•</span>
                <span className="line-clamp-2">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Main Content overlay (bottom aligned) ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-10 lg:p-14 pb-10 lg:pb-14 flex flex-col justify-end pointer-events-none bg-gradient-to-t from-[#fcfcfb] dark:from-[#0A0A0A] via-[#fcfcfb]/80 dark:via-[#0A0A0A]/80 to-transparent">

        <div className="max-w-2xl pointer-events-auto">
          {/* Milestone eyebrow */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-muted mb-3 tracking-widest uppercase">
            {milestone.label}
          </div>

          <h3 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-text leading-[1.05] mb-6 drop-shadow-sm line-clamp-3">
            {course.title}.
          </h3>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateToCourse(course.id, state === 'locked' ? 'course-detail' : 'learning-path')}
              className={`text-sm font-medium py-3.5 px-8 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 ${state === 'locked'
                ? 'bg-line border border-line text-muted'
                : (progress === 100 || state === 'completed')
                  ? 'bg-white border border-line text-text hover:bg-panel'
                  : 'bg-[#5BB8AC] hover:bg-[#4FA398] text-white shadow-[0_8px_20px_rgba(91,184,172,0.3)]'
                }`}
            >
              {primaryCtaLabel}
            </button>
            <button
              onClick={() => onNavigateToCourse(course.id, 'course-detail')}
              className="text-sm font-medium text-muted hover:text-text transition-colors flex items-center gap-2"
            >
              Details
            </button>
          </div>
        </div>

        {/* ── Floating Info Pill (bottom right) ── */}
        <div className="absolute bottom-12 right-12 bg-[#eef3f0]/90 dark:bg-panel/90 backdrop-blur-xl border border-line/40 rounded-full p-2 pr-6 flex items-center gap-4 shadow-xl pointer-events-auto">
          {course.trainer.avatar ? (
            <img src={course.trainer.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-panel shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center border-2 border-white dark:border-panel shadow-sm">
              <User className="w-5 h-5 text-cyan" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text leading-tight">{course.trainer.name}</span>
            <span className="text-[10px] text-muted">Instructor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
