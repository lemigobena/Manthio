import React, { useMemo, useState, useEffect } from 'react';
import {
  Clock, User, ChevronRight, GraduationCap,
  CheckCircle2, Play, Circle, Lock
} from 'lucide-react';
import { COURSES } from '../../services/mockData';
import { ParticleNetwork } from '../../components/ui/ParticleNetwork';
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
  trackTitle: string;
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

// Background artwork for the course content panel (served from public/images).
const COURSE_BG_IMAGE = '/images/pythonbg.png';

// The app shell scrolls in an inner <main> container, not the window.
const getScrollParent = (el: HTMLElement): HTMLElement | null => {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
};

// Extra pinned scroll distance after the last course is selected, so its content
// holds on screen before the panels release and continue up the page.
const PIN_HOLD_PX = 400;

// List pixels moved per page-scroll pixel while pinned. Below 1 the course list
// crawls: the user has to scroll ~1/PIN_SCROLL_SPEED× further to pass each course,
// so none of them can be flung past without being selected.
const PIN_SCROLL_SPEED = 0.1;

// How long the incoming course card takes to slide in from the right and cover
// the previous one.
const SLIDE_DURATION_MS = 500;

export const TrackPathBrowser: React.FC<TrackPathBrowserProps> = ({
  trackTitle,
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

  const enriched = useMemo(() => {
    let currentAssigned = false;
    return filteredMilestones.map((ms, idx) => {
      const isCompleted = completedMilestoneIds.includes(ms.id);
      const isPrevDoneOrSkippable = idx === 0 || (() => {
        const prev = filteredMilestones[idx - 1];
        const prevDone = completedMilestoneIds.includes(prev.id);
        const prevSkip = isEnrolled && (SKIPPABLE[selfAssessmentLevel as keyof typeof SKIPPABLE]?.includes(prev.courseId) || false);
        return prevDone || prevSkip;
      })();
      // Only the first unlocked, uncompleted milestone is 'current' (where the user
      // should resume) — any further unlocked ones are 'available'.
      let state: MilestoneState;
      if (isCompleted) {
        state = 'completed';
      } else if (isPrevDoneOrSkippable) {
        state = currentAssigned ? 'available' : 'current';
        currentAssigned = true;
      } else {
        state = 'locked';
      }
      return { ms, state };
    });
  }, [filteredMilestones, completedMilestoneIds, isEnrolled, selfAssessmentLevel]);

  const defaultId = useMemo(() => {
    const current = enriched.find(e => e.state === 'current');
    return (current ?? enriched[0])?.ms.id ?? null;
  }, [enriched]);

  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const manualSelectRef = React.useRef(false);
  const listScrollRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  // How much the course list overflows its container — this is the extra page-scroll
  // distance during which both panels stay pinned while the courses scroll through.
  const [pinScrollRange, setPinScrollRange] = useState(0);

  const orderedIds = useMemo(() => enriched.map(e => e.ms.id), [enriched]);
  const orderedIdsRef = React.useRef(orderedIds);
  orderedIdsRef.current = orderedIds;

  // Scroll-driven selection never jumps: it walks one course per frame toward the
  // course under the reading line, so a fast fling still selects every course in
  // between instead of skipping them.
  const selectedIdRef = React.useRef(selectedId);
  const targetIdxRef = React.useRef<number | null>(null);
  const stepRafRef = React.useRef<number | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const stepTowardTarget = React.useCallback(() => {
    stepRafRef.current = null;
    const ids = orderedIdsRef.current;
    const target = targetIdxRef.current;
    if (target == null || !ids.length) return;

    const curIdx = ids.indexOf(selectedIdRef.current ?? '');
    // Unknown current selection — snap to the target directly.
    const nextIdx = curIdx === -1 ? target : curIdx + Math.sign(target - curIdx);
    if (nextIdx === curIdx) return;

    selectedIdRef.current = ids[nextIdx];
    setSelectedId(ids[nextIdx]);
    if (nextIdx !== target) {
      stepRafRef.current = requestAnimationFrame(stepTowardTarget);
    }
  }, []);

  const cancelStepper = React.useCallback(() => {
    if (stepRafRef.current != null) {
      cancelAnimationFrame(stepRafRef.current);
      stepRafRef.current = null;
    }
  }, []);

  useEffect(() => cancelStepper, [cancelStepper]);

  // Load the course content for the course under the "reading line". The line travels
  // from the top of the list (0% scrolled → first course) to the bottom (100% scrolled
  // → last course), so the pin holds through every course, first to last.
  const syncSelectionToScroll = React.useCallback(() => {
    const scroller = listScrollRef.current;
    if (!scroller || manualSelectRef.current) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / maxScroll)) : 0.5;
    const lineY = scrollerRect.top + progress * scrollerRect.height;

    let bestId: string | null = null;
    let bestDist = Infinity;
    scroller.querySelectorAll<HTMLElement>('[data-milestone-id]').forEach(node => {
      const r = node.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - lineY);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = node.getAttribute('data-milestone-id');
      }
    });
    if (bestId) {
      targetIdxRef.current = orderedIdsRef.current.indexOf(bestId);
      if (stepRafRef.current == null) stepTowardTarget();
    }
  }, [stepTowardTarget]);

  useEffect(() => {
    if (!selectedId || !enriched.some(e => e.ms.id === selectedId)) {
      setSelectedId(defaultId);
    }
  }, [defaultId, enriched, selectedId]);

  // Measure the list overflow (desktop only — mobile scrolls the list natively).
  useEffect(() => {
    const scroller = listScrollRef.current;
    if (!scroller) return;

    const measure = () => {
      setPinScrollRange(
        window.innerWidth < 1024 ? 0 : Math.max(0, scroller.scrollHeight - scroller.clientHeight)
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [enriched]);

  // While the panels are pinned, scrolling the page drives the course list:
  // both containers stay static and only the courses scroll through.
  // NOTE: the app scrolls inside <main> (AppLayout), not the window — so the
  // listener must be attached to the actual scroll parent.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const scroller = listScrollRef.current;
    if (!wrapper || !scroller || pinScrollRange === 0) return;

    const scrollParent = getScrollParent(wrapper);
    const listenTarget: HTMLElement | Window = scrollParent ?? window;

    const onScroll = () => {
      if (window.innerWidth < 1024) return;
      // The sticky row pins 16px (top-4) below the scrollport's top edge
      const pinTop = (scrollParent ? scrollParent.getBoundingClientRect().top : 0) + 16;
      const rect = wrapper.getBoundingClientRect();
      // Damped: page scroll converts to list scroll at PIN_SCROLL_SPEED, so the
      // courses drift by slowly even when the page is flung.
      scroller.scrollTop = Math.min(pinScrollRange, Math.max(0, (pinTop - rect.top) * PIN_SCROLL_SPEED));
      syncSelectionToScroll();
    };

    onScroll();
    listenTarget.addEventListener('scroll', onScroll, { passive: true });
    return () => listenTarget.removeEventListener('scroll', onScroll);
  }, [pinScrollRange, syncSelectionToScroll]);

  // NOTE: there is deliberately no listener on the list's own scroll events —
  // the roadmap can be browsed by scrolling it directly (hidden scrollbar) without
  // changing the selected course. Selection only follows the pinned page scroll
  // (which calls syncSelectionToScroll itself) or explicit clicks.

  const selected = enriched.find(e => e.ms.id === selectedId) ?? enriched[0];
  const selectedCourse: Course | undefined = selected ? COURSES.find(c => c.id === selected.ms.courseId) : undefined;

  // Slide-over transition: when the selection changes, the outgoing card stays in
  // place while the incoming one slides in from the right and covers it exactly.
  // The change is detected during render (not in an effect) so the incoming card
  // already knows it is covering another one on its very first frame — otherwise
  // it would mount as a "fresh" card and fade in transparent over the old one.
  // The outgoing card is dropped once the slide has finished.
  const currentShownId = selected?.ms.id ?? null;
  const [prevShownId, setPrevShownId] = useState<string | null>(currentShownId);
  const [outgoingId, setOutgoingId] = useState<string | null>(null);

  if (prevShownId !== currentShownId) {
    setPrevShownId(currentShownId);
    if (prevShownId != null) setOutgoingId(prevShownId);
  }

  useEffect(() => {
    if (outgoingId == null) return;
    const t = setTimeout(() => setOutgoingId(null), SLIDE_DURATION_MS + 100);
    return () => clearTimeout(t);
  }, [outgoingId]);

  const outgoing = outgoingId && outgoingId !== selected?.ms.id
    ? enriched.find(e => e.ms.id === outgoingId)
    : undefined;
  const outgoingCourse: Course | undefined = outgoing
    ? COURSES.find(c => c.id === outgoing.ms.courseId)
    : undefined;

  return (
    <div ref={wrapperRef} className="relative z-10">
    {/* Pinned row: roadmap + course content at equal height. Both go static together,
        then the remaining page scroll (the spacer below) drives the course list. */}
    <div className="lg:sticky lg:top-4 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* ── Left: roadmap container — same height as the course content panel. */}
      <aside className="w-full lg:w-[320px] lg:shrink-0">
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-[calc(100dvh-5rem)] lg:max-h-[850px]">
          {/* Header — stays put */}
          <div className="flex items-center gap-2 px-1 pb-3 border-b border-line/60 shrink-0">
            <GraduationCap className="w-4 h-4 text-cyan" />
            <span className="text-[10px] font-black uppercase text-text tracking-widest">Course Roadmap</span>
            <span className="ml-auto text-[10px] font-bold text-muted">
              {enriched.length} steps
            </span>
          </div>

          {/* Internal scroller — directly scrollable (hidden scrollbar) without affecting
              the selected course; the page scroll still drives it while pinned. */}
          <div
            ref={listScrollRef}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide overscroll-contain pt-4 -mr-3 pr-3"
          >
            {/* Track title — fills the gap above the first course */}
            <h3 className="pl-6 pr-2 pb-1 text-sm font-black text-text leading-snug tracking-tight">
              {trackTitle}
            </h3>
            <ul className="relative space-y-1.5 mt-2 pl-6">
            {/* Continuous vertical rod for the timeline — neutral spine; the completed stretch is painted green per item */}
            <div className="absolute left-[5px] top-10 bottom-8 w-[3px] rounded-full bg-line/60 z-0" />

            {enriched.map(({ ms, state }, idx) => {
              const course = COURSES.find(c => c.id === ms.courseId);
              const isSelected = ms.id === selectedId;
              const isSub = ms.isSubCourse || false;
              const nextIsSub = enriched[idx + 1]?.ms.isSubCourse || false;

              return (
                <li key={ms.id} data-milestone-id={ms.id} className="relative z-10">
                  {/* Green overlay on the spine for the completed stretch of the track */}
                  {state === 'completed' && (
                    <div
                      className={`absolute left-[-19px] w-[3px] rounded-full bg-green -z-10 ${
                        idx === 0 ? 'top-10' : 'top-[-8px]'
                      } ${idx === enriched.length - 1 ? 'bottom-8' : 'bottom-[-8px]'}`}
                    />
                  )}

                  {isSub ? (
                    nextIsSub ? (
                      <>
                        {/* Rod drops from the initial course's dot and continues straight down to the next sub-course… */}
                        <div className={`absolute left-[21px] top-[-26px] bottom-[-6px] w-[2px] -z-10 ${
                          state === 'completed' ? 'bg-green' : 'bg-cyan/30'
                        }`} />
                        {/* …with a stub arm into this sub-course's dot */}
                        <div className={`absolute left-[21px] top-[29px] w-[25px] h-[2px] -z-10 ${
                          state === 'completed' ? 'bg-green' : 'bg-cyan/30'
                        }`} />
                      </>
                    ) : (
                      /* Bended rod: drops from the initial course's dot and bends into this last sub-course's dot */
                      <div className={`absolute left-[21px] top-[-26px] w-[25px] h-[57px] border-l-2 border-b-2 rounded-bl-[10px] -z-10 ${
                        state === 'completed' ? 'border-green' : 'border-cyan/30'
                      }`} />
                    )
                  ) : (
                    /* Branch: rod from the spine directly into the milestone's initial course dot */
                    <div className={`absolute left-[-18px] top-[68px] w-10 h-[2px] -z-10 ${
                      state === 'completed' ? 'bg-green' : 'bg-cyan/30'
                    }`} />
                  )}

                  {/* Continue the green fill from the last completed course down to the
                      "you are here" beacon — on the spine for initial courses, on the
                      drop rod for sub-courses */}
                  {state === 'current' && idx > 0 && enriched[idx - 1].state === 'completed' && (
                    isSub ? (
                      <div className="absolute left-[21px] top-[-26px] h-[56px] w-[2px] bg-green -z-10" />
                    ) : (
                      <div className="absolute left-[-19px] top-[-8px] h-[77px] w-[3px] rounded-full bg-green -z-10" />
                    )
                  )}

                  {/* "You are here" beacon: circular green light fading in and out, sitting ON the rod
                      — on the main spine for initial courses, on the branch rod for sub-courses */}
                  {state === 'current' && (
                    <div
                      className={`absolute w-[14px] h-[14px] z-20 pointer-events-none ${
                        isSub ? 'left-[15px] top-[23px]' : 'left-[-25px] top-[62px]'
                      }`}
                    >
                      <span className="absolute inset-0 rounded-full bg-green/60 animate-ping [animation-duration:2s]" />
                      <span className="absolute inset-[3px] rounded-full bg-green animate-pulse [animation-duration:2s] shadow-[0_0_10px_rgba(43,222,126,0.8)]" />
                    </div>
                  )}

                  {!isSub && (
                    <div className="pt-4 pb-2 pl-3">
                      <span className="text-[10px] font-black uppercase text-muted/60 tracking-widest">
                        {ms.label}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      manualSelectRef.current = true;
                      cancelStepper();
                      targetIdxRef.current = null;
                      setSelectedId(ms.id);

                      // Scroll so the reading line lands on this item (keeps click + scrollspy in agreement)
                      const scroller = listScrollRef.current;
                      const el = scroller?.querySelector(`[data-milestone-id="${ms.id}"]`) as HTMLElement | null;
                      if (scroller && el) {
                        const r = el.getBoundingClientRect();
                        const sRect = scroller.getBoundingClientRect();
                        const itemCenter = r.top - sRect.top + scroller.scrollTop + r.height / 2;
                        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
                        const target = maxScroll > 0
                          ? Math.min(maxScroll, Math.max(0, (itemCenter * maxScroll) / (maxScroll + scroller.clientHeight)))
                          : 0;
                        const wrapper = wrapperRef.current;
                        if (window.innerWidth >= 1024 && pinScrollRange > 0 && wrapper) {
                          // Desktop: the list is driven by the page scroll — move the
                          // scroll parent to the position that maps to this list offset
                          // (inverse of the damped mapping, hence / PIN_SCROLL_SPEED).
                          const scrollParent = getScrollParent(wrapper);
                          const pinTop = (scrollParent ? scrollParent.getBoundingClientRect().top : 0) + 16;
                          const delta = wrapper.getBoundingClientRect().top - pinTop + target / PIN_SCROLL_SPEED;
                          (scrollParent ?? window).scrollBy({ top: delta, behavior: 'smooth' });
                        } else {
                          scroller.scrollTo({ top: target, behavior: 'smooth' });
                        }
                      }

                      // Release manual override after scroll completes
                      setTimeout(() => { manualSelectRef.current = false; }, 1000);
                    }}
                    className={`text-left group relative flex items-center gap-3.5 py-3 px-3 rounded-2xl transition-all duration-300 bg-bg/60 ${isSub ? 'ml-6 w-[calc(100%-1.5rem)]' : 'w-full'
                      } ${isSelected
                        ? 'bg-bg border border-line shadow-md z-20'
                        : 'border border-transparent hover:bg-bg'
                      }`}
                  >
                    {/* State icon: completed / current / available / locked */}
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0 bg-bg rounded-full">
                      <span
                        className={`absolute inset-0 rounded-full transition-transform duration-300 ${isSelected ? 'scale-100 opacity-20' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-10'
                          } ${
                            state === 'completed' ? 'bg-green'
                            : state === 'current' ? 'bg-green'
                            : state === 'available' ? 'bg-cyan'
                            : 'bg-muted'
                          }`}
                      />
                      {state === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 relative z-10 text-green" />
                      ) : state === 'current' ? (
                        <Play className="w-3.5 h-3.5 shrink-0 relative z-10 text-green fill-green" />
                      ) : state === 'locked' ? (
                        <Lock className="w-3.5 h-3.5 shrink-0 relative z-10 text-muted" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 shrink-0 relative z-10 text-cyan/60" />
                      )}
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
        </div>
      </aside>

      {/* ── Right: course content panel — equal height, static alongside the roadmap ── */}
      <section className="relative flex-1 min-w-0 h-[600px] lg:h-[calc(100dvh-5rem)] lg:max-h-[850px]">
        {selected && selectedCourse ? (
          <>
            {/* Outgoing card holds still underneath while the new one slides over it */}
            {outgoing && outgoingCourse && (
              <div key={outgoing.ms.id} className="absolute inset-0 z-0">
                <CourseDetailPanel
                  course={outgoingCourse}
                  milestone={outgoing.ms}
                  state={outgoing.state}
                  completedLessonIds={completedLessonIds}
                  onNavigateToCourse={onNavigateToCourse}
                  animateEntry={false}
                />
              </div>
            )}
            {/* Incoming card slides in from the right, landing exactly on top */}
            <div key={selected.ms.id} className="absolute inset-0 z-10 slide-over-card">
              <CourseDetailPanel
                course={selectedCourse}
                milestone={selected.ms}
                state={selected.state}
                completedLessonIds={completedLessonIds}
                onNavigateToCourse={onNavigateToCourse}
                animateEntry={!outgoing}
              />
            </div>
            <style>{`
              @keyframes slide-over-from-right {
                from { transform: translateX(calc(100% + 2rem)); }
                to { transform: translateX(0); }
              }
              .slide-over-card {
                animation: slide-over-from-right ${SLIDE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
              }
            `}</style>
          </>
        ) : (
          <div className="bg-panel border border-line rounded-2xl p-8 text-center text-muted">
            No course selected.
          </div>
        )}
      </section>
    </div>

    {/* Spacer: page-scroll distance consumed while pinned — translated into the course
        list scrolling through the roadmap at PIN_SCROLL_SPEED (page distance grows by
        its inverse). The extra PIN_HOLD_PX keeps both panels static after the LAST
        course is reached, so its content is shown before they release. */}
    <div
      style={{ height: pinScrollRange > 0 ? pinScrollRange / PIN_SCROLL_SPEED + PIN_HOLD_PX : 0 }}
      className="hidden lg:block"
      aria-hidden="true"
    />
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
  animateEntry: boolean;
}> = ({ course, milestone, state, completedLessonIds, onNavigateToCourse, animateEntry }) => {
  const progress = calculateCourseProgress(course, completedLessonIds);
  // Cards taking part in a slide-over transition must be fully opaque from the
  // first frame — only a fresh standalone card gets the fade/rise entry.
  const [entered, setEntered] = useState(!animateEntry);

  useEffect(() => {
    if (!animateEntry) return;
    const t = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(t);
  }, [animateEntry]);

  const primaryCtaLabel = (state === 'completed' || progress === 100) ? 'Review course'
    : state === 'locked' ? 'Preview' : progress > 0 ? 'Continue' : 'Start course';

  const imageUrl = COURSE_BG_IMAGE;

  return (
    <div
      className={`relative w-full h-[600px] lg:h-full rounded-[2rem] overflow-hidden transition-all duration-1000 ease-out border border-line/30 shadow-sm flex flex-col bg-panel ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      {/* ── Full-bleed Background Image — soft-fades out toward every edge ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={imageUrl}
          alt={course.title}
          className={`w-full h-full object-cover transition-transform duration-[1500ms] ease-out ${entered ? 'scale-100' : 'scale-105'
            } ${state === 'locked' ? 'opacity-40 grayscale blur-[2px]' : ''}`}
          style={{
            maskImage: 'radial-gradient(ellipse 75% 75% at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>

      {/* ── Animated particle network (same as the landing hero) filling the empty top
          area, fading out toward the content below and the image on the right ── */}
      <div
        className="absolute inset-x-0 top-0 h-[45%] z-10 pointer-events-none hidden lg:block overflow-hidden"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 100% at 20% 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 100% at 20% 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 95%)',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.05)_0%,transparent_80%)]" />
        <ParticleNetwork />
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

      {/* ── Main Content overlay (bottom aligned) — theme-colored scrim for text legibility ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-10 lg:p-14 pb-10 lg:pb-14 flex flex-col justify-end pointer-events-none bg-gradient-to-t from-bg/80 via-bg/40 to-transparent">

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
                  ? 'bg-panel border border-line text-text hover:bg-bg'
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
        <div className="absolute bottom-12 right-12 bg-panel/90 backdrop-blur-xl border border-line/40 rounded-full p-2 pr-6 flex items-center gap-4 shadow-xl pointer-events-auto">
          {course.trainer.avatar ? (
            <img src={course.trainer.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-bg shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center border-2 border-bg shadow-sm">
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
