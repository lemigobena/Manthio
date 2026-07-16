import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import {
  Check, Lock, Play, ChevronDown, ChevronUp, Clock,
  FileText, Code2, Users, MapPin, Calendar, AlertCircle,
  Target, Award, Bookmark, MessageSquare, ExternalLink,
  ShieldCheck, CheckCircle, Video, Flame, StickyNote,
} from 'lucide-react';
import { CourseIcon, LessonIcon } from '../../utils/courseIcons';
import { useTrack } from '../track-detail/useTrack';
import { calculateCourseProgress } from '../../services/progressUtils';
import { useModal } from '../../context/ModalContext';
import type { Course, LessonType } from '../../types';

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

const getLearningObjectives = (modTitle: string) => {
  const title = modTitle.toLowerCase();
  if (title.includes('setup') || title.includes('basics') || title.includes('syntax')) {
    return [
      'Set up local virtual environments and configure requirements.',
      'Understand and apply standard variables, operators, and basic syntax.',
      'Write, structure, and execute your first standalone scripts.'
    ];
  }
  if (title.includes('flow') || title.includes('control') || title.includes('conditional')) {
    return [
      'Construct if/else conditional blocks to steer script execution.',
      'Work with basic comparison and boolean logic operators.',
      'Implement nested branch paths to handle complex scenarios.'
    ];
  }
  if (title.includes('function')) {
    return [
      'Define modular reusable functions with parameters and return values.',
      'Differentiate scopes between global and local variable bindings.',
      'Leverage keyword arguments and fallback defaults inside calls.'
    ];
  }
  if (title.includes('loop') || title.includes('list') || title.includes('collection')) {
    return [
      'Iterate through collections (lists, tuples, dicts) using loops.',
      'Draft elegant list comprehensions to filter and transform data.',
      'Manage collection state and apply item lookups efficiently.'
    ];
  }
  if (title.includes('oop') || title.includes('classes') || title.includes('object')) {
    return [
      'Model real-world entities using classes and initializers.',
      'Apply class inheritance to share common state and behavior.',
      'Differentiate instance variables from class-level attributes.'
    ];
  }
  return [
    `Master the fundamental blocks of ${modTitle}.`,
    'Apply these theoretical concepts to real-world code exercises.',
    'Test outcomes using custom scripts and assertion statements.'
  ];
};

// ── SVG progress ring — used only in the header ──────────────────────────────
const ProgressRing: React.FC<{
  pct: number; size: number; stroke: number;
  color?: string; trackColor?: string; children?: React.ReactNode;
}> = ({ pct, size, stroke, color = 'var(--cyan)', trackColor = 'var(--line)', children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={trackColor} strokeWidth={stroke} strokeOpacity={0.35} />
        {pct > 0 && (
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        )}
      </svg>
      {children && <div className="relative z-10 flex items-center justify-center">{children}</div>}
    </div>
  );
};

// ── Square module thumbnail (menta-style) ────────────────────────────────────
const ModuleThumbnail: React.FC<{
  type: string; title: string;
  isCompleted: boolean; isLocked: boolean; isInProgress: boolean;
}> = ({ type, title, isCompleted, isLocked, isInProgress }) => {
  const initials = title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const isSession = type === 'In-person session' || type === 'Live online session';

  const cls = isCompleted  ? 'bg-green/10 border-green/20 text-green'
    : isLocked             ? 'bg-line/20 border-line/30 text-muted'
    : isSession            ? 'bg-purple/10 border-purple/20 text-purple'
    : isInProgress         ? 'bg-cyan/10 border-cyan/20 text-cyan'
    : 'bg-bg border-line text-muted';

  return (
    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 font-bold text-[11px] select-none ${cls}`}>
      {isCompleted ? <Check className="w-4 h-4 stroke-[2.5px]" /> :
       isLocked    ? <Lock className="w-4 h-4" /> :
       type === 'In-person session'  ? <Users className="w-4 h-4" /> :
       type === 'Live online session' ? <Video className="w-4 h-4" /> :
       <span>{initials}</span>}
    </div>
  );
};

// ── Social proof + reactions (lightweight, menta-style engagement) ───────────
const LEARNER_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&h=100',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=100&h=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100',
];

// deterministic pseudo-count so the numbers stay stable across re-renders
const hashNum = (str: string, min: number, max: number) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
};

const AvatarStack: React.FC<{ seed: string; count?: number; size?: number }> = ({ seed, count = 3, size = 22 }) => {
  const start = hashNum(seed, 0, LEARNER_AVATARS.length - 1);
  return (
    <div className="flex items-center -space-x-2 shrink-0">
      {Array.from({ length: count }, (_, i) => (
        <img
          key={i}
          src={LEARNER_AVATARS[(start + i) % LEARNER_AVATARS.length]}
          alt=""
          style={{ width: size, height: size }}
          className="rounded-full border-2 border-panel object-cover"
        />
      ))}
    </div>
  );
};

const ReactionButton: React.FC<{
  icon: React.ReactNode; count: number; active: boolean;
  activeClass: string; label: string; onClick: (e: React.MouseEvent) => void;
}> = ({ icon, count, active, activeClass, label, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-bold transition-all active:scale-90 ${
      active ? activeClass : 'bg-bg border-line/60 text-muted hover:text-text hover:border-line'
    }`}
  >
    <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="tabular-nums">{count}</span>
  </button>
);

export const LearningPath: React.FC<LearningPathProps> = ({ onNavigate }) => {
  const { activeCourseId } = useAuth();
  const { addXp } = useXP();
  const { completedLessonIds } = useTrack();
  const { openModal } = useModal();
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());
  const [justCompletedIds, setJustCompletedIds] = useState<Set<string>>(new Set());
  const [reactions, setReactions] = useState<Record<string, boolean>>({});

  const toggleReaction = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setReactions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBookmark = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setBookmarkedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId); else next.add(lessonId);
      return next;
    });
  };

  const triggerComplete = (id: string) => {
    setJustCompletedIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setJustCompletedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 280);
  };

  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const displayedProgress = course.id === 'python-bootcamp' ? 46 : calculateCourseProgress(course as Course, completedLessonIds);

  const getRemainingTime = (mod: typeof course.modules[0]) => {
    const incomplete = mod.lessons.filter(l => !completedLessonIds.includes(l.id));
    if (incomplete.length === 0) return '0 min left';
    let mins = 0;
    incomplete.forEach(l => {
      const dur = l.duration.toLowerCase();
      mins += dur.includes('h') ? parseFloat(dur) * 60 : (parseInt(dur) || 10);
    });
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60), rem = Math.round(mins % 60);
      return `${hrs}h ${rem > 0 ? rem + 'm' : ''} left`;
    }
    return `${Math.round(mins)} min left`;
  };

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return null;
    return course.modules[0]?.id || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError]   = useState(false);

  React.useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 768) setExpandedModuleId(null); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setIsError(false); setIsLoading(true);
    setTimeout(() => setIsLoading(false), 750);
  };

  const toggleExpand = (modId: string) => {
    // REQ-PATH-020
    if (window.innerWidth < 768) { onNavigate(`module-detail:${modId}`); return; }
    setExpandedModuleId(prev => prev === modId ? null : modId);
  };

  const getLessonIcon = (type: LessonType) => <LessonIcon type={type} className="w-3.5 h-3.5" />;

  const completedCount    = course.modules.filter(m => m.status === 'Completed').length;
  const courseLearners    = hashNum(course.id, 1200, 8600);
  const onlineNow         = hashNum(course.id + 'live', 40, 240);

  return (
    <div className="relative -mx-3 md:-mx-[44px] -my-6 bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="space-y-5 pb-32 max-w-[1600px] mx-auto">

        {/* ══════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════ */}
        <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
            {/* Large progress ring */}
            <ProgressRing pct={displayedProgress} size={92} stroke={5}>
              <div className="flex items-center justify-center rounded-full bg-panel2 shadow-inner"
                style={{ width: 78, height: 78 }}>
                {(() => {
                  const hint = `${course.title} ${course.id}`;
                  return <CourseIcon hint={hint} className="w-9 h-9 text-cyan" />;
                })()}
              </div>
            </ProgressRing>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-2">
                <span className="text-[10px] text-cyan font-bold uppercase tracking-wider bg-cyan/10 px-2.5 py-1 rounded-md border border-cyan/20">
                  {course.level}
                </span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider bg-bg px-2.5 py-1 rounded-md border border-line">
                  {course.format === 'flipped' ? 'Flipped Bootcamp' : course.format === 'cohort' ? 'Cohort Based' : 'Self-Paced'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-text leading-tight">{course.title}</h1>
              <p className="text-muted text-sm mt-1.5 leading-relaxed max-w-2xl mx-auto md:mx-0">{course.description}</p>

              {/* Social proof strip */}
              <div className="mt-3 flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                <AvatarStack seed={course.id} count={4} size={24} />
                <span className="text-[11px] text-muted font-semibold">
                  <span className="text-text font-bold">{courseLearners.toLocaleString()}</span> learners on this path
                  <span className="mx-1.5 opacity-40">·</span>
                  <span className="inline-flex items-center gap-1 text-green font-bold align-middle">
                    <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />{onlineNow} online
                  </span>
                </span>
              </div>
            </div>
            
            {/* Primary CTA moved to right on desktop */}
            <div className="w-full md:w-auto shrink-0 md:pt-4">
              <button
                onClick={() => onNavigate('content-player')}
                className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:shadow-[0_0_20px_rgba(var(--cyan-rgb),0.3)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span className="text-xs uppercase tracking-widest">
                  Continue Learning
                </span>
              </button>
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-6 border-t border-line/50">
            {/* Completion */}
            <div className="group/stat bg-bg/50 border border-line/50 rounded-xl p-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-[0_6px_20px_rgba(var(--cyan-rgb),0.07)]">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:-rotate-3">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Completion</span>
                <span className="text-xl md:text-2xl font-black text-text leading-none">{displayedProgress}%</span>
              </div>
            </div>

            {/* Modules */}
            <div className="group/stat bg-bg/50 border border-line/50 rounded-xl p-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
              <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:-rotate-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Modules</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-black text-text leading-none">{completedCount}</span>
                  <span className="text-xs font-bold text-muted">/ {course.modules.length}</span>
                </div>
              </div>
            </div>

            {/* Est. Time */}
            <div className="group/stat bg-bg/50 border border-line/50 rounded-xl p-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
              <div className="w-10 h-10 rounded-xl bg-green/10 text-green flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:-rotate-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Est. Time</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-black text-text leading-none">24</span>
                  <span className="text-xs font-bold text-muted">hrs</span>
                </div>
              </div>
            </div>

            {/* Activity Streak (accented) */}
            <div className="group/stat relative overflow-hidden bg-gradient-to-br from-orange/10 to-bg border border-orange/30 rounded-xl p-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange/50 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)]">
              <Flame className="absolute -right-3 -top-3 w-20 h-20 text-orange opacity-10 transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-6" />
              <div className="w-10 h-10 rounded-xl bg-orange/15 text-orange flex items-center justify-center shrink-0 relative z-10 transition-transform duration-300 group-hover/stat:scale-110">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0 relative z-10">
                <span className="block text-[10px] font-bold text-orange uppercase tracking-wider mb-1">Streak</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-black text-text leading-none">12</span>
                  <span className="text-xs font-bold text-orange">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ERROR / LOADING / CURRICULUM
        ══════════════════════════════════════════════════════ */}
        {isError ? (
          <div className="text-center py-16 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 px-4">
              <h3 className="font-bold text-text text-base">Failed to load learning path</h3>
              <p className="text-muted text-xs">We couldn't connect to retrieve the modules list. Please try again.</p>
            </div>
            <button onClick={handleRetry} className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer">Retry Connection</button>
          </div>

        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-panel border border-line rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-line/30 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-line/30 rounded w-2/5" />
                    <div className="h-2.5 bg-line/20 rounded w-3/4" />
                  </div>
                  <div className="w-20 h-8 bg-line/20 rounded-lg shrink-0" />
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* ══════════════════════════════════════════════════════
              MODULE GROUP LIST — menta-style grouped containers
          ══════════════════════════════════════════════════════ */
          <div className="space-y-3">
            {/* Section label */}
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[12px] font-black text-muted tracking-[0.15em]">Curriculum</h2>
              <span className="text-[10px] text-muted">{course.modules.length} modules · {completedCount} completed</span>
            </div>

            {course.modules.map((mod, idx) => {
              const isCompleted  = mod.status === 'Completed';
              const isInProgress = mod.status === 'In progress';
              const isLocked     = mod.status === 'Locked';
              const isExpanded   = expandedModuleId === mod.id;
              const isJustCompleted = justCompletedIds.has(mod.id);
              const doneLessons  = mod.lessons.filter(l => l.status === 'completed').length;
              const modPct       = mod.lessons.length > 0
                ? isCompleted ? 100 : Math.round((doneLessons / mod.lessons.length) * 100)
                : 0;
              const materialCounts = {
                video: mod.lessons.filter(l => l.type === 'Video').length,
                code:  mod.lessons.filter(l => l.type === 'Code').length,
                quiz:  mod.lessons.filter(l => l.type === 'Quiz').length,
              };
              // Engagement (social proof + reactions)
              const modLearners  = hashNum(mod.id, 24, 460);
              const fireCount    = hashNum(mod.id + 'fire', 8, 140);
              const commentCount = hashNum(mod.id + 'cmt', 2, 26);
              const fireOn       = !!reactions[mod.id + ':fire'];

              return (
                <div
                  key={mod.id}
                  style={isJustCompleted ? { animation: 'var(--animate-milestone-complete)' } : undefined}
                  className={`bg-panel border rounded-2xl overflow-hidden transition-all duration-300 group hover:border-cyan/40 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(var(--cyan-rgb),0.08)] ${
                    isInProgress ? 'border-cyan/40 shadow-[0_0_15px_rgba(var(--cyan-rgb),0.05)]' :
                    isLocked     ? 'border-line/40 opacity-80' :
                    isCompleted  ? 'border-line/50'    :
                    'border-line'
                  }`}
                  title={isLocked ? `Complete Module ${idx} to unlock this module` : undefined}
                >

                  {/* ── Module header row ── */}
                  <div
                    className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 cursor-pointer group min-h-[96px]"
                    onClick={() => toggleExpand(mod.id)}
                  >
                    {/* Thumbnail + title — kept side-by-side on all breakpoints */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    {/* Square thumbnail (menta-style) */}
                    <ModuleThumbnail
                      type={mod.type} title={mod.title}
                      isCompleted={isCompleted} isLocked={isLocked} isInProgress={isInProgress}
                    />

                    {/* Title + description */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      <div>
                        {/* Top: index + status badge */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-black text-muted uppercase tracking-widest">Module {idx + 1}</span>

                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          isCompleted  ? 'bg-green/10 text-green border-green/20' :
                          isInProgress ? 'bg-cyan/10 text-cyan border-cyan/20' :
                          (isLocked && mod.availableDate) ? 'bg-line/10 text-muted border-line/30' :
                          'bg-line/20 text-muted border-line/30'
                        }`}>
                          {isLocked && mod.availableDate ? `Available ${mod.availableDate}` : mod.status}
                          {isInProgress && <span className="ml-1 opacity-70">· {modPct}%</span>}
                        </span>

                        {(mod.type === 'In-person session' || mod.type === 'Live online session') && (
                          <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-purple/10 text-purple border-purple/20">
                            {mod.type === 'In-person session' ? <Users className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                            {mod.type}
                          </span>
                        )}

                        {/* Quiz shortcut — REQ-PATH-005 */}
                        {materialCounts.quiz > 0 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (!isLocked) {
                                openModal('quiz', {
                                  props: {
                                    questions: [
                                      { id: 1, text: `What is the primary goal of ${mod.title}?`, options: ['To learn basics','To build projects','To pass a test','All of the above'] },
                                      { id: 2, text: 'Which of the following is correct?', options: ['A','B','C','D'] }
                                    ],
                                    onComplete: () => { addXp(50, `Completed quiz for ${mod.title}`); triggerComplete(mod.id); }
                                  }
                                });
                              }
                            }}
                            title={isLocked ? `Complete Module ${idx} to unlock` : 'Jump straight to quiz'}
                            className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors ${
                              isLocked ? 'bg-line/10 text-muted border-line/30 cursor-not-allowed' :
                              'bg-yellow/10 text-yellow border-yellow/20 hover:bg-yellow/20 cursor-pointer'
                            }`}
                          >⚡ Quiz</button>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-text leading-snug">{mod.title}</h3>
                      <p className="text-muted text-xs mt-0.5 line-clamp-1">{mod.description}</p>

                        {/* Inline progress bar */}
                        {isInProgress && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-line/30 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan rounded-full transition-all duration-500" style={{ width: `${modPct}%` }} />
                            </div>
                            <span className="text-[9px] text-muted shrink-0">{doneLessons}/{mod.lessons.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats row */}
                      {/* Stats row */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-bold text-muted">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />1.5h</span>
                        
                        {materialCounts.video > 0 && (
                          <>
                            <div className="w-[1px] h-3 bg-line/50" />
                            {/* Clickable Tooltip for Videos */}
                            <button onClick={e => e.stopPropagation()} className="relative group/tooltip-video flex items-center">
                              <span className="flex items-center gap-1.5 cursor-help hover:text-cyan transition-colors">
                                <Play className="w-3 h-3 fill-transparent stroke-[2px]" />{materialCounts.video} Videos
                              </span>
                              
                              {/* Tooltip Popup */}
                              <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-[240px] opacity-0 translate-y-1 pointer-events-none group-focus/tooltip-video:opacity-100 group-focus/tooltip-video:translate-y-0 group-focus/tooltip-video:pointer-events-auto group-hover/tooltip-video:opacity-100 group-hover/tooltip-video:translate-y-0 group-hover/tooltip-video:pointer-events-auto transition-all duration-200 z-50 text-left cursor-default">
                                <div className="bg-panel border border-cyan/30 shadow-[0_10px_30px_rgba(var(--cyan-rgb),0.1)] rounded-xl p-3 relative">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-cyan mb-2">
                                    <Play className="w-3 h-3" /> Videos
                                  </div>
                                  <div className="space-y-2">
                                    {mod.lessons.filter(l => l.type === 'Video').map((l, i) => (
                                      <div key={i} className="flex items-center justify-between text-text/80 text-[10px] font-medium">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <div className="w-1 h-1 rounded-full bg-cyan shrink-0" />
                                          <span className="truncate">{l.title}</span>
                                        </div>
                                        <span className="text-cyan font-bold shrink-0 ml-2 text-[9px]">{l.duration}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                        
                        {(materialCounts.code > 0 || materialCounts.quiz > 0) && (
                          <>
                            <div className="w-[1px] h-3 bg-line/50" />
                            {/* Clickable Tooltip for Exercises */}
                            <button onClick={e => e.stopPropagation()} className="relative group/tooltip flex items-center">
                              <span className="flex items-center gap-1.5 cursor-help hover:text-cyan transition-colors">
                                <Code2 className="w-3 h-3" />{materialCounts.code + materialCounts.quiz} Exercises
                              </span>
                              
                              {/* Tooltip Popup */}
                              <div className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-[240px] opacity-0 translate-y-1 pointer-events-none group-focus/tooltip:opacity-100 group-focus/tooltip:translate-y-0 group-focus/tooltip:pointer-events-auto group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:pointer-events-auto transition-all duration-200 z-50 text-left cursor-default">
                                <div className="bg-panel border border-cyan/30 shadow-[0_10px_30px_rgba(var(--cyan-rgb),0.1)] rounded-xl p-3 relative">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-cyan mb-2">
                                    <Code2 className="w-3 h-3" /> Code Exercises
                                  </div>
                                  <div className="space-y-2">
                                    {mod.lessons.filter(l => l.type === 'Code' || l.type === 'Quiz').map((l, i) => (
                                      <div key={i} className="flex items-center justify-between text-text/80 text-[10px] font-medium">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <div className="w-1 h-1 rounded-full bg-cyan shrink-0" />
                                          <span className="truncate">{l.title}</span>
                                        </div>
                                        <span className="text-cyan font-bold shrink-0 ml-2 text-[9px]">{l.duration}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between self-stretch shrink-0 py-0.5 mt-3 sm:mt-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => !isLocked && onNavigate('content-player')}
                        className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                          isCompleted  ? 'bg-line/20 text-text hover:bg-line/30' :
                          isInProgress ? 'bg-cyan text-bg hover:bg-cyan2' :
                          'bg-line/10 text-muted cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                      </button>

                      <button
                        onClick={() => toggleExpand(mod.id)}
                        className="text-[10px] font-bold text-muted hover:text-text flex items-center gap-1 transition-colors mt-auto pt-2 cursor-pointer"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        View details {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Scheduled session strip (always visible when present + not expanded) */}
                  {mod.scheduledTime && !isExpanded && (
                    <div className="mx-4 mb-4 bg-bg/60 border border-line/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-2 border-l-cyan/40">
                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-text/80">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan" /><span>{mod.scheduledTime}</span></div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan" /><span>{mod.venue}</span></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-[9px] font-bold text-muted px-2.5 py-1.5 rounded-lg bg-bg border border-line hover:border-cyan/40 transition-colors">Add to Calendar</button>
                        <button onClick={() => onNavigate('live-session')} className="text-[9px] font-bold text-bg px-2.5 py-1.5 rounded-lg bg-cyan hover:bg-cyan2 transition-colors">Get Directions</button>
                      </div>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════════
                      EXPANDED CONTENT — menta-style flat rows inside
                  ════════════════════════════════════════════════ */}
                  {isExpanded && (
                    <div className="border-t border-line">

                      {/* Prereqs / prep */}
                      {((mod.prerequisites && mod.prerequisites.length > 0) || (mod.prepModules && mod.prepModules.length > 0)) && (
                        <div className="px-4 py-3 bg-bg/40 border-b border-line/50">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
                            <span className="font-black text-[10px] uppercase tracking-wider text-cyan">Required Preparation</span>
                          </div>
                          <div className="space-y-1.5">
                            {mod.prerequisites?.map((p: string, i: number) => (
                              <div key={i} className="text-[10px] text-text/80 flex items-start gap-2 leading-snug">
                                <div className="w-1 h-1 bg-muted/50 rounded-full mt-1.5 shrink-0" />
                                <span>{p}</span>
                              </div>
                            ))}
                            {mod.prepModules?.map(prepId => {
                              const prepMod = course.modules.find(m => m.id === prepId);
                              if (!prepMod) return null;
                              const isDone = prepMod.status === 'Completed';
                              return (
                                <div key={prepId} className="flex items-center gap-2 p-1.5 rounded-lg bg-panel/50 border border-line/30">
                                  <div className={`w-3.5 h-3.5 shrink-0 ${isDone ? 'text-green' : 'text-muted'}`}>
                                    {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  </div>
                                  <span className="text-[10px] font-bold text-text">Complete {prepMod.title}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Scheduled session (expanded) */}
                      {mod.scheduledTime && (
                        <div className="px-4 py-3 bg-bg/40 border-b border-line/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-text/80">
                              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan" /><span>{mod.scheduledTime}</span></div>
                              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan" /><span>{mod.venue}</span></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="text-[9px] font-bold text-muted px-2.5 py-1.5 rounded-lg bg-bg border border-line hover:border-cyan/40 transition-colors">Add to Calendar</button>
                              <button onClick={() => onNavigate('live-session')} className="text-[9px] font-bold text-bg px-2.5 py-1.5 rounded-lg bg-cyan hover:bg-cyan2 transition-colors">Get Directions</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Learning objectives */}
                      <div className="px-4 py-3 bg-bg/30 border-b border-line/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-3.5 h-3.5 text-cyan" />
                          <span className="text-[10px] font-black text-muted uppercase tracking-wider">Learning Objectives</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {getLearningObjectives(mod.title).map((obj, i) => (
                            <li key={i} className="text-[11px] text-text/80 flex items-start gap-2.5">
                              <div className="w-1 h-1 bg-cyan rounded-full mt-1.5 shrink-0" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* ── Lesson rows — flat, menta-style ── */}
                      {/* Curriculum header */}
                      <div className="px-4 py-2.5 flex items-center justify-between border-b border-line/30 bg-bg/20">
                        <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Lessons</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted">
                          <span className="text-cyan font-bold">{getRemainingTime(mod)}</span>
                          <span className="opacity-40">·</span>
                          <span>{mod.lessons.length} total</span>
                          {materialCounts.video > 0 && <><span className="opacity-40">·</span><span>{materialCounts.video} videos</span></>}
                          {materialCounts.code  > 0 && <><span className="opacity-40">·</span><span>{materialCounts.code} exercises</span></>}
                          {materialCounts.quiz  > 0 && <><span className="opacity-40">·</span><span>{materialCounts.quiz} quizzes</span></>}
                        </div>
                      </div>

                      {/* Flat lesson rows */}
                      <div className="divide-y divide-line/40">
                        {mod.lessons.map(les => {
                          const status  = completedLessonIds.includes(les.id) ? 'completed' : les.status;
                          const locked  = status === 'locked';
                          const done    = status === 'completed';
                          const active  = status === 'in_progress';

                          return (
                            <div
                              key={les.id}
                              onClick={() => {
                                if (!locked) {
                                  localStorage.setItem('manthio_active_lesson', les.id);
                                  onNavigate('content-player');
                                }
                              }}
                              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                locked
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-bg/50 cursor-pointer'
                              }`}
                              title={locked ? (les.unlockCondition || 'Complete previous lesson to unlock') : undefined}
                            >
                              {/* Lesson type icon — small square badge (completed = cyan variant of the type icon) */}
                              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                                done   ? 'bg-cyan/10 border-cyan/20 text-cyan' :
                                active ? 'bg-transparent border-cyan text-cyan' :
                                'bg-bg border-line text-muted'
                              }`}>
                                {getLessonIcon(les.type)}
                              </div>

                              {/* Title + meta */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`text-sm font-medium truncate ${done ? 'text-text/60' : 'text-text'}`}>
                                    {les.title}
                                  </span>
                                  {les.required
                                    ? <span className="text-[8px] bg-red/10 text-red px-1.5 py-0.5 rounded font-black uppercase shrink-0">Required</span>
                                    : <span className="text-[8px] bg-bg border border-line text-muted px-1.5 py-0.5 rounded font-black uppercase shrink-0">Optional</span>
                                  }
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{les.duration}</span>
                                  <span className="opacity-40">·</span>
                                  <span className="uppercase tracking-tight font-bold opacity-70">{les.bloomLevel}</span>
                                  <span className="opacity-40">·</span>
                                  <span className="flex items-center gap-0.5">
                                    {[1,2,3].map(d => (
                                      <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= (les.difficulty||2) ? 'bg-cyan' : 'bg-line'}`} />
                                    ))}
                                  </span>
                                </div>
                              </div>

                              {/* Right: bookmark + notes + action */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={e => toggleBookmark(e, les.id)}
                                  className={`p-1.5 rounded transition-colors ${bookmarkedLessons.has(les.id) ? 'text-cyan' : 'text-muted hover:text-cyan'}`}
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${bookmarkedLessons.has(les.id) ? 'fill-cyan' : ''}`} />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); if (!locked) onNavigate('content-player:notes'); }}
                                  className="p-1.5 text-muted hover:text-cyan transition-colors rounded"
                                  title="Add a note"
                                >
                                  <StickyNote className="w-3.5 h-3.5" />
                                </button>

                                <div className="w-[88px] flex justify-end ml-1 shrink-0">
                                  {locked ? (
                                    <div className="flex items-center justify-center w-full gap-1 text-muted text-[10px] font-bold px-2 py-1.5 rounded-lg bg-bg border border-line/50">
                                      <Lock className="w-3 h-3" /><span>Locked</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        localStorage.setItem('manthio_active_lesson', les.id);
                                        onNavigate('content-player');
                                      }}
                                      className={`text-[10px] w-full text-center font-bold px-1 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                                        done   ? 'bg-bg border border-line hover:border-cyan text-text' :
                                        active ? 'bg-bg border border-cyan text-cyan hover:bg-cyan/10' :
                                        'bg-cyan hover:bg-cyan2 text-bg border border-transparent'
                                      }`}
                                    >
                                      {done ? 'Review' : active ? 'Continue' : 'Start'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Engagement footer (social proof + reactions) ── */}
                  <div className="px-4 sm:px-5 md:px-6 py-3 border-t border-line/40 bg-bg/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AvatarStack seed={mod.id} />
                      <span className="text-[10px] sm:text-[11px] text-muted font-semibold truncate">
                        <span className="text-text font-bold">{modLearners}</span>{' '}
                        {isCompleted? 'learned this' : 'learning now'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ReactionButton
                        label="Fire" active={fireOn}
                        activeClass="bg-orange/10 border-orange/30 text-orange"
                        onClick={e => toggleReaction(e, mod.id + ':fire')}
                        icon={<Flame className={`w-3.5 h-3.5 ${fireOn ? 'fill-orange' : ''}`} />}
                        count={fireCount + (fireOn ? 1 : 0)}
                      />
                      <button
                        onClick={e => { e.stopPropagation(); onNavigate('community'); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-line/60 bg-bg text-muted hover:text-text hover:border-line text-[11px] font-bold transition-all"
                        title="Discussion"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{commentCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Certificate milestone — social post style */}
            {(() => {
              const certUnlocked = displayedProgress === 100;
              const certEarners = hashNum(course.id + 'cert', 140, 2400);
              return (
                <div className={`bg-panel border rounded-2xl overflow-hidden transition-all ${certUnlocked ? 'border-yellow/40' : 'border-line/50'}`}>
                  {/* Post header */}
                  <div className={`flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 ${certUnlocked ? '' : 'opacity-55'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${certUnlocked ? 'bg-yellow/10' : 'bg-bg border border-line'}`}>
                          <Award className={`w-5 h-5 ${certUnlocked ? 'text-yellow' : 'text-muted'}`} />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-panel ${certUnlocked ? 'bg-yellow' : 'bg-line'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-text truncate">Course Certificate</h3>
                          {certUnlocked && <CheckCircle className="w-3.5 h-3.5 text-yellow shrink-0" />}
                        </div>
                        <span className="text-xs text-muted">Official {course.title} diploma</span>
                      </div>
                    </div>
                    {certUnlocked
                      ? <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-yellow/10 text-yellow">Unlocked</span>
                      : <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-bg border border-line text-muted">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                    }
                  </div>

                  {/* Post body */}
                  <p className={`px-4 sm:px-5 pt-3 pb-4 text-xs text-muted leading-relaxed ${certUnlocked ? '' : 'opacity-55'}`}>
                    {certUnlocked
                      ? 'You made it — your verifiable credential is ready to view and share with your network.'
                      : `Complete all modules to unlock your official ${course.title} diploma and share it with your network.`}
                  </p>

                  {/* Engagement footer */}
                  <div className="px-4 sm:px-5 py-3 border-t border-line/40 bg-bg/30 flex flex-wrap items-center justify-between gap-3">
                    <div className={`flex items-center gap-2.5 min-w-0 ${certUnlocked ? '' : 'opacity-55'}`}>
                      <AvatarStack seed={course.id + 'cert'} />
                      <span className="text-[10px] sm:text-[11px] text-muted font-semibold truncate">
                        <span className="text-text font-bold">{certEarners.toLocaleString()}</span> earned this
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {certUnlocked
                        ? <button className="flex items-center gap-1.5 bg-yellow text-bg px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 hover:bg-yellow/90">
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </button>
                        : <span className="text-[10px] text-muted font-bold tabular-nums px-2">{displayedProgress}% there</span>
                      }
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
