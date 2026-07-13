import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTrack } from '../track-detail/useTrack';
import { COURSES, TRACKS } from '../../services/mockData';
import { ContentPlayer } from '../content-player/ContentPlayer';
import {
  Play,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  X,
  Cpu,
  MessageSquare,
  Check,
  Clock,
  PlayCircle,
  Trophy,
  ChevronRight,
  Calendar,
  MapPin,
  Award,
  Star,
  Users,
  AlertCircle,
  Globe
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  mockState?: 'normal' | 'pre-cohort' | 'long-break' | 'all-completed';
}// Sub-component for individual Neural Insight Card
const NeuralInsightCard: React.FC<{
  category: string;
  text: string;
  color: 'cyan' | 'purple' | 'yellow' | 'orange';
}> = ({ category, text, color }) => {
  const accentColor = {
    cyan: 'border-l-cyan ring-cyan/10',
    purple: 'border-l-purple ring-purple/10',
    yellow: 'border-l-yellow ring-yellow/10',
    orange: 'border-l-orange ring-orange/10',
  }[color];

  const labelColor = {
    cyan: 'text-cyan',
    purple: 'text-purple',
    yellow: 'text-yellow',
    orange: 'text-orange',
  }[color];

  return (
    <div className={`bg-panel border border-line ${accentColor} border-l-4 rounded-lg p-4 lg:p-3 xl:p-4 space-y-2 lg:space-y-1.5 xl:space-y-2 transition-all hover:bg-panel hover:shadow-sm`}>
      <span className={`text-[10px] lg:text-[8px] xl:text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{category}</span>
      <p className="text-xs lg:text-[10px] xl:text-xs text-text font-medium leading-relaxed italic">
        "{text}"
      </p>
    </div>
  );
};

// Progress Indicator for mobile with smooth SVG animations
export const RingProgress: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({
  progress, size = 64, strokeWidth = 5, color = 'var(--cyan)'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-line"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[12px] font-bold text-text tabular-nums">{progress}%</span>
    </div>
  );
};

// High-fidelity Pill Progress component for desktop
export const PillProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const getStatusLabel = (val: number) => {
    if (val === 0) return "Not started yet";
    if (val < 25) return "Just getting started...";
    if (val < 50) return "Gathering momentum...";
    if (val < 75) return "Past the halfway mark!";
    if (val < 90) return "Almost there...";
    if (val < 100) return "Securing the finish...";
    return "Course complete!";
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[280px] min-w-[200px] shrink-0">
      <div className="text-[10px] font-bold text-right text-text uppercase tracking-widest opacity-60 pr-10">
        {getStatusLabel(progress)}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 h-6 bg-bg border-2 border-cyan/40 rounded-full overflow-hidden p-0.5 shadow-[0_0_15px_-5px_rgba(0,255,242,0.3)]">
          <div
            className="h-full bg-gradient-to-r from-cyan/20 to-cyan rounded-full relative transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Thumb/Knob element */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan rounded-full shadow-[0_0_10px_rgba(0,255,242,0.8)]" />
          </div>
        </div>
        <div className="text-sm font-black text-text font-mono shrink-0">{progress}%</div>
      </div>
    </div>
  );
};

// const FlipUnit: React.FC<{ value: string, label: string, size?: 'sm' | 'md' | 'lg' }> = ({ value, label, size = 'md' }) => {
//   const sizeClasses = size === 'sm' ? 'w-10 h-12 md:w-12 md:h-14' : size === 'lg' ? 'w-16 h-20 md:w-24 md:h-28' : 'w-14 h-18 md:w-20 md:h-24';
//   const textClasses = size === 'sm' ? 'text-lg md:text-xl' : size === 'lg' ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl';

//   return (
//     <div className="flex flex-col items-center space-y-1 md:space-y-2">
//       <div className={`relative ${sizeClasses} bg-panel border border-line rounded-xl overflow-hidden shadow-xl flex flex-col`}>
//         {/* Top half */}
//         <div className="h-1/2 bg-panel2 border-b border-line/30 flex items-end justify-center overflow-hidden">
//           <span className={`${textClasses} font-mono font-black text-text translate-y-1/2 leading-none uppercase`}>{value}</span>
//         </div>
//         {/* Bottom half */}
//         <div className="h-1/2 flex items-start justify-center overflow-hidden">
//           <span className={`${textClasses} font-mono font-black text-text -translate-y-1/2 leading-none uppercase`}>{value}</span>
//         </div>
//         {/* Divider Hinge */}
//         <div className="absolute top-1/2 left-0 right-0 h-px bg-bg/80 z-10" />
//         <div className="absolute top-1/2 left-0 w-1 h-3 bg-line -translate-y-1/2 rounded-r" />
//         <div className="absolute top-1/2 right-0 w-1 h-3 bg-line -translate-y-1/2 rounded-l" />
//       </div>
//       <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{label}</span>
//     </div>
//   );
// };

// High-fidelity Stat Card based on new UI
const StatCard: React.FC<{
  label: string;
  value: string | number;
  subtext: string;
  color: 'peach' | 'lavender' | 'sky' | 'mint';
  onClick?: () => void;
}> = ({ label, value, subtext, color, onClick }) => {
  const bgStyles = {
    peach: 'bg-[#FFF0EB] text-[#333] dark:bg-orange/20 dark:text-text dark:border dark:border-orange/30',
    mint: 'bg-[#EFFDF5] text-[#333] dark:bg-green/20 dark:text-text dark:border dark:border-green/30',
    lavender: 'bg-[#F5F0FF] text-[#333] dark:bg-purple/20 dark:text-text dark:border dark:border-purple/30',
    sky: 'bg-[#E8F8FF] text-[#333] dark:bg-cyan/20 dark:text-text dark:border dark:border-cyan/30',
  }[color];

  return (
    <div
      onClick={onClick}
      className={`relative ${bgStyles} p-4 md:p-5 rounded-2xl flex flex-col justify-between h-full cursor-pointer transition-all hover:-translate-y-1 hover:scale-[1.02] shadow-sm dark:shadow-none`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-text/80">{label}</span>
        <div className="bg-white dark:bg-panel rounded-xl p-1.5 shadow-sm border border-transparent dark:border-line">
          <ArrowUpRight className="w-4 h-4 text-gray-500 dark:text-muted" />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold tracking-tight mb-1">{value}</div>
        <div className="text-[10px] text-gray-500 dark:text-muted font-medium">{subtext}</div>
      </div>
    </div>
  );
};


// High-fidelity Analytic Graph based on new UI
const AnalyticGraphCard: React.FC<{ heroState?: string }> = ({ heroState }) => {
  let data = [
    { day: 'Sun', mins: 33 },
    { day: 'Mon', mins: 28 },
    { day: 'Tue', mins: 40 },
    { day: 'Wed', mins: 46, highlight: true },
    { day: 'Thu', mins: 28 },
    { day: 'Fri', mins: 40 },
    { day: 'Sat', mins: 33 },
    { day: 'Sun', mins: 38 },
    { day: 'Mon', mins: 26 },
    { day: 'Tue', mins: 37 },
    { day: 'Wed', mins: 21 },
    { day: 'Thu', mins: 33 },
  ];

  if (heroState === 'long-break') {
    data = data.map(d => ({ ...d, mins: 0 }));
  }

  const maxMins = Math.max(1, ...data.map(d => d.mins));

  return (
    <div className="bg-[#24968B] rounded-2xl p-5 md:p-6 text-white flex flex-col h-full relative overflow-hidden shadow-lg">
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
          <h3 className="text-lg md:text-xl font-medium mb-1">Neural Velocity</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold">{data.reduce((s, d) => s + d.mins, 0)} min</span>
            <span className="bg-[#5AC6B9] text-white text-[10px] md:text-xs px-2 py-1 rounded-md font-medium">+3.4%</span>
          </div>
        </div>
        <button className="bg-[#5AC6B9] hover:bg-[#4EAD9F] text-white text-[10px] md:text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium">
          12 Days
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>


      {/* Empty State Overlay for Long Break */}
      {heroState === 'long-break' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none mt-10">
          <span className="bg-[#1C7A70]/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[11px] font-bold text-white shadow-sm uppercase tracking-wider">
            No actions this week
          </span>
        </div>
      )}
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 z-10 mt-2">
        {data.map((d, i) => {
          const ratio = d.mins / maxMins;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-20 pointer-events-none shadow-xl">
                {d.day}: {d.mins} min
              </div>
              <div className="w-full h-24 md:h-32 flex items-end justify-center">
                <div
                  className={`w-full max-w-[16px] md:max-w-[20px] rounded-sm transition-all duration-500 ${d.highlight ? 'bg-transparent border-t-2 border-x-2 border-[#FFE8B3] relative' : 'bg-[#FFE8B3]'}`}
                  style={{ height: `${Math.max(5, ratio * 100)}%` }}
                >
                  {d.highlight && (
                    <div className="absolute inset-0 opacity-50" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #FFE8B3 2px, #FFE8B3 4px)'
                    }} />
                  )}
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] text-white/80 font-medium transition-colors group-hover:text-white">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, mockState }) => {
  const { user, setActiveCourseId, setActiveTrackId, isOnboardingSkipped, resetOnboarding, activeCourseId } = useAuth();
  const { level, streak, xp } = useXP();
  useTrack();

  const [showQuickSession, setShowQuickSession] = useState(false);

  // Get last viewed lesson
  const lastViewedLesson = (() => {
    const courseId = activeCourseId || 'python-bootcamp';
    const courseObj = COURSES.find(c => c.id === courseId) || COURSES[0];
    const activeLessonId = localStorage.getItem('manthio_active_lesson');
    if (activeLessonId) {
      const les = courseObj.modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId);
      if (les) {
        const mod = courseObj.modules.find(m => m.lessons.some(l => l.id === activeLessonId));
        return { lesson: les, module: mod, course: courseObj };
      }
    }
    // Fallback: first incomplete or first lesson
    const currentModule = courseObj.modules?.find(m => m.status === 'In progress') || courseObj.modules?.[0];
    if (!currentModule) {
      return { lesson: null, module: null, course: courseObj };
    }
    const les = currentModule.lessons?.find(l => l.status === 'in_progress') || currentModule.lessons?.[0];
    return { lesson: les, module: currentModule, course: courseObj };
  })();

  // Page Mount Loading State (REQ-LOAD-002)
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  // Mock toggle for Pre-cohort state
  const [heroState, setHeroState] = useState<'normal' | 'pre-cohort' | 'long-break' | 'all-completed'>(mockState || 'normal');

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 950);
    return () => clearTimeout(timer);
  }, []);


  let displayTracks = TRACKS.filter(t => t.enrolled);
  let displayCourses = COURSES.filter(c => c.enrolled).slice(0, 4);

  if (heroState === 'all-completed') {
    displayTracks = displayTracks.map(t => ({ ...t, progress: 100 }));
    displayCourses = displayCourses.map(c => ({ ...c, progress: 100 }));
  } else if (heroState === 'pre-cohort') {
    displayTracks = [];
    // Keep displayCourses populated as before
  }

  const activeTrack = displayTracks.find(t => t.progress > 0 && t.progress < 100) || (heroState === 'all-completed' ? undefined : displayTracks[0]);
  const activeCourse = displayCourses.find(c => c.progress > 0 && c.progress < 100) || (heroState === 'all-completed' ? undefined : displayCourses[0]);

  const primaryActive: (
    { type: 'track'; data: typeof TRACKS[0] } |
    { type: 'course'; data: typeof COURSES[0] } |
    { type: 'none'; data: null }
  ) = (activeTrack && activeTrack.enrolled && heroState !== 'all-completed')
      ? { type: 'track', data: activeTrack }
      : (activeCourse && activeCourse.enrolled && heroState !== 'all-completed')
        ? { type: 'course', data: activeCourse }
        : { type: 'none', data: null };



  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {isPageLoading ? (
        /* REQ-LOAD-002: Dashboard Skeleton Loader mimicking the final page layout */
        <div className="space-y-6 animate-pulse">
          {/* Hero Greeting Skeleton */}
          <div className="bg-panel border border-line rounded-2xl p-6 h-36" />

          {/* Quick Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 group-[.sidebar-expanded]/layout:min-[1024px]:max-[1155px]:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-panel border border-line p-4 rounded-xl h-24" />
            ))}
          </div>

          {/* Columns Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-panel border border-line rounded-2xl h-44" />
              <div className="space-y-4">
                <div className="h-6 bg-panel rounded w-28" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-panel border border-line rounded-xl h-36" />
                  <div className="bg-panel border border-line rounded-xl h-36" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-panel border border-line rounded-xl h-32" />
              <div className="bg-panel border border-line rounded-xl h-48" />
              <div className="bg-panel border border-line rounded-xl h-36" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          {/* REQ-ONBOARD-001 Complete Profile banner for skipped onboarding */}
          {isOnboardingSkipped && showBanner && (
            <div className="relative overflow-hidden bg-gradient-to-r from-yellow/15 via-yellow/5 to-panel border border-yellow/20 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow" />
              <div className="flex items-start space-x-3.5 pl-2 max-w-2xl">
                <div className="p-2.5 bg-yellow/10 border border-yellow/20 text-yellow rounded-xl shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-text">Complete Your Profile!</h3>
                  <p className="text-muted text-xs leading-relaxed">
                    Set up your weekly learning goals, time budget, and initials or custom profile picture to get tailored course recommendations from your AI Tutor and personalized metrics.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto shrink-0 pl-2 md:pl-0">
                <button
                  onClick={() => {
                    resetOnboarding();
                    onNavigate('onboarding');
                  }}
                  className="bg-yellow hover:opacity-90 text-bg text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-yellow/10 flex items-center space-x-1.5 hover:scale-105 active:scale-95"
                >
                  <span>Complete Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bg" />
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-text hover:text-cyan transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Dev mock toggle */}
          <div className="flex justify-end gap-2 mb-2">
            <button onClick={() => setHeroState('normal')} className={`text-[10px] border border-line px-2 py-1 rounded transition-colors ${heroState === 'normal' ? 'bg-cyan text-bg' : 'text-muted bg-panel hover:bg-line'}`}>Normal</button>
            <button onClick={() => setHeroState('pre-cohort')} className={`text-[10px] border border-line px-2 py-1 rounded transition-colors ${heroState === 'pre-cohort' ? 'bg-cyan text-bg' : 'text-muted bg-panel hover:bg-line'}`}>Pre-Cohort</button>
            <button onClick={() => setHeroState('long-break')} className={`text-[10px] border border-line px-2 py-1 rounded transition-colors ${heroState === 'long-break' ? 'bg-cyan text-bg' : 'text-muted bg-panel hover:bg-line'}`}>Long Break</button>
            <button onClick={() => setHeroState('all-completed')} className={`text-[10px] border border-line px-2 py-1 rounded transition-colors ${heroState === 'all-completed' ? 'bg-cyan text-bg' : 'text-muted bg-panel hover:bg-line'}`}>Completed</button>
          </div>

          {/* Unified Global Greeting Card */}
          <div className="rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden group mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan/10 transition-all duration-700" />

            <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between gap-6">

              <div className="flex-1 flex flex-col justify-center space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  {getGreeting()}, {user?.name.split(' ')[0]} 👋
                </h1>

                {heroState === 'pre-cohort' ? (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan">Cohort Pre-Start</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text leading-tight mb-2">Winter '26 Engineering Cohort</h2>
                      <p className="text-muted text-sm md:text-base">
                        Your cohort officially kicks off soon. While you wait, we highly recommend reviewing the pre-reading materials below to ensure you hit the ground running.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button onClick={() => onNavigate('learning-path')} className="bg-cyan hover:bg-cyan2 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,242,0.3)] active:scale-95 flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" /> Access Pre-Reading
                      </button>
                      <button onClick={() => onNavigate('catalog')} className="bg-bg border border-line hover:border-cyan/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                        Browse Curriculum
                      </button>
                    </div>
                  </div>
                ) : heroState === 'long-break' ? (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-orange animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange">Welcome Back</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text leading-tight mb-2">Ready to dive back in?</h2>
                      <p className="text-muted text-sm md:text-base">
                        It's been a while since your last session. Don't worry, we've saved your spot. Would you like a quick refresher on your previous module before continuing?
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button onClick={() => setShowQuickSession(true)} className="bg-orange hover:bg-orange/90 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,107,74,0.3)] active:scale-95 flex items-center justify-center gap-2">
                        <PlayCircle className="w-4 h-4" /> Start Refresher
                      </button>
                      <button onClick={() => onNavigate('learning-path')} className="bg-bg border border-line hover:border-orange/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-center">
                        Jump to Curriculum
                      </button>
                    </div>
                  </div>
                ) : heroState === 'all-completed' ? (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow">Track Completed</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text leading-tight mb-2">Incredible Milestone Achieved!</h2>
                      <p className="text-muted text-sm md:text-base">
                        You have successfully completed all available courses in your track. Your dedication is truly inspiring. What's next on your journey?
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button onClick={() => onNavigate('catalog')} className="bg-yellow hover:bg-yellow/90 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] active:scale-95 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> Explore New Tracks
                      </button>
                      <button onClick={() => onNavigate('profile')} className="bg-bg border border-line hover:border-yellow/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Award className="w-4 h-4" /> View Certificate
                      </button>
                    </div>
                  </div>
                ) : primaryActive.type !== 'none' ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan">Active Journey</span>
                    </div>
                    <p className="text-muted text-sm md:text-base leading-relaxed max-w-xl">
                      You are currently {primaryActive.type === 'track' ? 'on the track' : 'learning'} <span className="text-text font-bold">{primaryActive.data.title}</span>.
                      {primaryActive.type === 'course' && (
                        <>
                          {' '}Active module:{' '}
                          <span className="text-text font-semibold">
                            {primaryActive.data.modules.find(m => m.status === 'In progress')?.number || 1}:{' '}
                            {primaryActive.data.modules.find(m => m.status === 'In progress')?.title}
                          </span>.
                        </>
                      )}
                      {primaryActive.type === 'track' && (
                        <>
                          {' '}Current focus:{' '}
                          <span className="text-text font-semibold">
                            {primaryActive.data.milestones.find(m => m.status === 'active')?.title}
                          </span>.
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-yellow animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow">Personalised Recommendation</span>
                    </div>
                    <h2 className="text-xl font-black text-text leading-tight mb-2">Python Fundamentals</h2>
                    <p className="text-muted text-sm md:text-base">
                      Based on your onboarding profile and interest in robust software engineering, we recommend beginning your journey with our foundational Python track.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button onClick={() => onNavigate('course/python-basics')} className="bg-cyan hover:bg-cyan2 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,242,0.3)] active:scale-95 flex items-center justify-center gap-2">
                        <PlayCircle className="w-4 h-4" /> Start Track
                      </button>
                      <button onClick={() => onNavigate('browse-courses')} className="bg-bg border border-line hover:border-cyan/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-center">
                        Explore All Paths
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {lastViewedLesson.lesson && (
                <div className="lg:w-[350px] shrink-0 flex items-center lg:items-end pb-2 lg:pb-0">
                  <div
                    onClick={() => setShowQuickSession(true)}
                    className="w-full bg-cyan hover:bg-cyan2 text-bg p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(0,255,242,0.2)] hover:shadow-[0_0_20px_rgba(0,255,242,0.4)] hover:-translate-y-1 group/quick relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover/quick:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-bg/80 mb-1 flex items-center gap-1.5">
                          Quick Session <ChevronRight className="w-3 h-3 group-hover/quick:translate-x-1 transition-transform" />
                        </div>
                        <p className="font-bold text-sm leading-snug">
                          {lastViewedLesson.lesson.title}
                        </p>
                      </div>
                      <div className="bg-bg/10 rounded-full p-2 group-hover/quick:scale-110 transition-transform duration-300">
                        <PlayCircle className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                    <div className="relative z-10 text-[11px] font-medium text-bg/70 bg-bg/5 p-2 rounded-lg backdrop-blur-sm">
                      Mod: {lastViewedLesson.module?.title} • {lastViewedLesson.lesson.duration}m
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Stats & Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* 4 Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Learning Level"
                value={heroState === 'pre-cohort' ? 1 : heroState === 'all-completed' ? 50 : level}
                subtext={heroState === 'pre-cohort' ? 'Ready to begin your journey' : heroState === 'all-completed' ? 'Master of the academy' : 'Mastering the core foundations of engineering'}
                color="peach"
                onClick={() => onNavigate('analytics')}
              />
              <StatCard
                label="Current Streak"
                value={heroState === 'pre-cohort' || heroState === 'long-break' ? '0 Days' : heroState === 'all-completed' ? '120 Days' : `${streak} Days`}
                subtext={heroState === 'pre-cohort' ? 'Start your streak soon' : heroState === 'long-break' ? 'Time to rebuild momentum' : 'Consistency is the key to mental muscle memory'}
                color="mint"
                onClick={() => onNavigate('analytics')}
              />
              <StatCard
                label="Total XP Pool"
                value={heroState === 'pre-cohort' ? '0' : heroState === 'all-completed' ? '12,500' : xp.toLocaleString()}
                subtext="Points earned through vigorous laboratory work"
                color="lavender"
                onClick={() => onNavigate('analytics')}
              />
              <StatCard
                label="Module Progress"
                value={heroState === 'pre-cohort' ? '0/10' : heroState === 'all-completed' ? '10/10' : '2/10'}
                subtext={heroState === 'all-completed' ? 'All modules mastered' : 'Keep moving forward, one block at a time'}
                color="sky"
                onClick={() => onNavigate('learning-path')}
              />
            </div>
            {/* Chart Card */}
            <AnalyticGraphCard heroState={heroState} />
          </div>



          {/* Full-Width Continue Learning Section */}
          <div className="mb-8 w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-text">Continue Learning</h3>
                <p className="text-muted text-sm mt-1">Pick up right where you left off.</p>
              </div>
              <button onClick={() => onNavigate('catalog')} className="text-cyan hover:text-cyan2 text-sm font-bold flex items-center gap-1 transition-colors shrink-0">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

              {/* Card 1: Active Track */}
              {activeTrack && heroState !== 'pre-cohort' && heroState !== 'all-completed' ? (
                <div className="bg-panel border border-line rounded-2xl p-5 md:p-6 flex flex-col hover:border-cyan/30 transition-all duration-300 group shadow-sm hover:shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black tracking-widest text-cyan uppercase">Active Track</span>
                      <h4 className="font-bold text-text text-base leading-tight truncate mt-0.5">{activeTrack.title}</h4>
                      <p className="text-[11px] font-semibold tracking-wider text-muted uppercase mt-0.5 truncate">{activeTrack.level}</p>
                    </div>
                  </div>

                  <p className="text-muted text-sm leading-relaxed line-clamp-2 flex-1 mb-4">{activeTrack.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-medium text-muted mb-1">
                      <div className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-cyan" /> {activeTrack.progress}% complete</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {activeTrack.estimatedTime}</div>
                    </div>
                    <div className="h-2 bg-line rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan to-cyan2 rounded-full transition-all duration-500"
                        style={{ width: `${activeTrack.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActiveTrackId(activeTrack.id); onNavigate('track-detail'); }}
                      className="flex-1 bg-cyan hover:bg-cyan2 text-bg font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,245,228,0.2)] hover:shadow-[0_0_20px_rgba(0,245,228,0.35)]"
                    >
                      <Play className="w-4 h-4 fill-current" /> Continue Track
                    </button>
                    <button
                      onClick={() => { setActiveTrackId(activeTrack.id); onNavigate('track-detail'); }}
                      className="px-4 bg-bg border border-line hover:border-cyan/40 text-text font-semibold text-sm py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-panel border border-line rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[220px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center relative z-10">
                    <MapPin className="w-5 h-5 text-cyan" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-text text-base">No Active Track</h4>
                    <p className="text-muted text-xs mt-1 max-w-[220px] leading-relaxed">Career tracks guide you step-by-step toward a professional outcome.</p>
                  </div>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="relative z-10 w-full bg-cyan hover:bg-cyan2 text-bg font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,245,228,0.2)]"
                  >
                    Explore Tracks <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Card 2: Active Course */}
              {activeCourse && heroState !== 'all-completed' ? (
                <div className="bg-panel border border-line rounded-2xl p-5 md:p-6 flex flex-col hover:border-cyan/30 transition-all duration-300 group shadow-sm hover:shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black tracking-widest text-cyan uppercase">Active Course</span>
                      <h4 className="font-bold text-text text-base leading-tight truncate mt-0.5">{activeCourse.title}</h4>
                      <p className="text-[11px] font-semibold tracking-wider text-muted uppercase mt-0.5 truncate">{activeCourse.level}</p>
                    </div>
                  </div>

                  <p className="text-muted text-sm leading-relaxed line-clamp-2 flex-1 mb-4">{activeCourse.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-medium text-muted mb-1">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan" />
                        {activeCourse.modules.filter(m => m.status === 'Completed').length}/{activeCourse.modules.length} Modules
                      </div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {activeCourse.duration}</div>
                    </div>
                    <div className="h-2 bg-line rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan to-cyan2 rounded-full transition-all duration-500"
                        style={{ width: `${activeCourse.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActiveCourseId(activeCourse.id); onNavigate('content-player'); }}
                      className="flex-1 bg-cyan hover:bg-cyan2 text-bg font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,245,228,0.2)] hover:shadow-[0_0_20px_rgba(0,245,228,0.35)]"
                    >
                      <Play className="w-4 h-4 fill-current" /> Resume Course
                    </button>
                    <button
                      onClick={() => { setActiveCourseId(activeCourse.id); onNavigate('learning-path'); }}
                      className="px-4 bg-bg border border-line hover:border-cyan/40 text-text font-semibold text-sm py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-panel border border-line rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[220px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center relative z-10">
                    <BookOpen className="w-5 h-5 text-cyan" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-text text-base">No Active Course</h4>
                    <p className="text-muted text-xs mt-1 max-w-[220px] leading-relaxed">Pick up a course and start building your skills today.</p>
                  </div>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="relative z-10 w-full bg-cyan hover:bg-cyan2 text-bg font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,245,228,0.2)]"
                  >
                    Browse Courses <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">

            {/* Left Column (Courses & Activity) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Enrolled Courses Grid: Image-top card design */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">Your Learning</h3>
                    <p className="text-muted text-sm">Track your progress and continue building new skills.</p>
                  </div>
                  <button onClick={() => onNavigate('catalog')} className="text-cyan hover:text-cyan2 text-sm font-bold flex items-center space-x-1 transition-colors">
                    <span>View all courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {displayCourses.map((course, index) => {
                    const colors = ['cyan', 'purple', 'yellow', 'green'];
                    const color = colors[index % colors.length];
                    const isCompleted = course.progress === 100 || heroState === 'all-completed' || course.title === 'Command Line Basics';
                    const completedModules = course.modules.filter(m => m.status === 'Completed').length;
                    const totalModules = course.modules.length;
                    const progress = isCompleted ? 100 : course.progress;

                    // SVG progress ring values
                    const radius = 22;
                    const circumference = 2 * Math.PI * radius;
                    const strokeOffset = circumference * (1 - progress / 100);

                    // Color mapping for SVG stroke
                    const strokeColor = color === 'cyan' ? 'var(--color-cyan)' : color === 'purple' ? '#b624ff' : color === 'yellow' ? '#ffb800' : '#00ff9d';

                    // Static class map so Tailwind can detect these at build time
                    const upNextClasses = {
                      cyan:   { wrap: 'bg-cyan/5 border-cyan/15',     icon: 'text-cyan' },
                      purple: { wrap: 'bg-purple/5 border-purple/15', icon: 'text-purple' },
                      yellow: { wrap: 'bg-yellow/5 border-yellow/15', icon: 'text-yellow' },
                      green:  { wrap: 'bg-green/5 border-green/15',   icon: 'text-green' },
                    }[color] ?? { wrap: 'bg-cyan/5 border-cyan/15', icon: 'text-cyan' };

                    return (
                      <div
                        key={course.id}
                        className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/30 transition-all duration-300 group shadow-sm hover:shadow-xl cursor-pointer flex flex-col"
                        onClick={() => { setActiveCourseId(course.id); onNavigate(isCompleted ? 'completed-course:' + course.id : 'learning-path'); }}
                      >
                        {/* Hero Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          {/* Status badge */}
                          {isCompleted ? (
                            <span className="absolute top-3 left-3 bg-yellow/90 text-black text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                              <Check className="w-3 h-3" /> Completed
                            </span>
                          ) : (
                            <span className={`absolute top-3 left-3 bg-${color}/90 text-bg text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg backdrop-blur-sm`}>
                              In Progress
                            </span>
                          )}
                          <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg backdrop-blur-sm">
                            {course.level}
                          </span>
                          {/* XP badge on image bottom */}
                          <span className="absolute bottom-3 right-3 bg-black/60 text-yellow text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> {course.xpReward} XP
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          {/* Title */}
                          <h4 className="font-bold text-text text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-cyan transition-colors">{course.title}</h4>

                          {/* Description — 3 lines */}
                          <p className="text-muted text-xs leading-relaxed line-clamp-3 mb-4">{course.description}</p>

                          {/* Tags / Format pills */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-${color}/10 text-${color} border border-${color}/20`}>
                              {course.format}
                            </span>
                            {(course.tags ?? []).slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-line/60 text-muted border border-line">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Next lesson / completion strip — always shown for equal height */}
                          {isCompleted ? (
                            <div className="flex items-center gap-2 bg-yellow/5 border border-yellow/15 rounded-xl px-3 py-2.5 mb-4">
                              <Trophy className="w-4 h-4 text-yellow shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-0.5">All Done</p>
                                <p className="text-xs font-semibold text-text truncate">All modules completed</p>
                              </div>
                              <span className="ml-auto text-[10px] font-bold text-yellow shrink-0">100%</span>
                            </div>
                          ) : course.modules[0]?.lessons[0] ? (
                            <div className={`flex items-center gap-2 ${upNextClasses.wrap} border rounded-xl px-3 py-2.5 mb-4`}>
                              <PlayCircle className={`w-4 h-4 ${upNextClasses.icon} shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-0.5">Up Next</p>
                                <p className="text-xs font-semibold text-text truncate">{course.modules[0].lessons[0].title}</p>
                              </div>
                              <span className="ml-auto text-[10px] font-bold text-muted shrink-0">{course.modules[0].lessons[0].duration}</span>
                            </div>
                          ) : null}

                          {/* Divider — mt-auto pushes everything below it to the card bottom */}
                          <div className="border-t border-line mt-auto mb-4" />

                          {/* Stats Row + Circular Progress */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <BookOpen className={`w-3.5 h-3.5 text-${color}`} />
                                <span className="font-semibold">{completedModules}/{totalModules} Modules</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <Clock className={`w-3.5 h-3.5 text-${color}`} />
                                <span className="font-semibold">{course.duration}</span>
                              </div>
                              {course.trainer && (
                                <div className="flex items-center gap-1.5 text-xs text-muted">
                                  <Award className={`w-3.5 h-3.5 text-${color}`} />
                                  <span className="font-semibold truncate max-w-[120px]">{course.trainer.name}</span>
                                </div>
                              )}
                            </div>

                            {/* Circular Progress */}
                            <div className="relative w-16 h-16 shrink-0">
                              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeWidth="4.5" className="text-line" />
                                <circle
                                  cx="32" cy="32" r={radius} fill="none"
                                  stroke={strokeColor}
                                  strokeWidth="4.5"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeOffset}
                                  className="transition-all duration-700"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-xs font-extrabold text-${color} leading-none`}>{progress}%</span>
                                <span className="text-[8px] text-muted font-bold uppercase tracking-wider leading-none mt-0.5">done</span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Pill */}
                          {isCompleted ? (
                            <div className="bg-yellow/10 border border-yellow/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                              <span className="text-xs font-semibold text-yellow flex items-center gap-1.5">
                                <Trophy className="w-3 h-3" /> Course completed — Review
                              </span>
                              <ChevronRight className="w-4 h-4 text-yellow" />
                            </div>
                          ) : (
                            <div className={`bg-${color}/10 border border-${color}/20 rounded-xl px-4 py-2.5 flex items-center justify-between`}>
                              <span className={`text-xs font-semibold text-${color} flex items-center gap-1.5`}>
                                <Play className="w-3 h-3 fill-current" /> Continue where you left off
                              </span>
                              <ChevronRight className={`w-4 h-4 text-${color}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (Community Events, Recommendations, and Weak Points) */}
            <div className="flex flex-col gap-6">

              {/* REQ-DASH-010: Upcoming Events */}
              <div className="rounded-2xl p-6 lg:p-4 xl:p-6 space-y-5 lg:space-y-3 xl:space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange" />
                    <h3 className="font-bold text-base lg:text-sm xl:text-base text-text">Upcoming Events</h3>
                  </div>
                  <button
                    onClick={() => onNavigate('live-sessions')}
                    className="text-cyan hover:text-cyan2 text-[10px] uppercase tracking-wider font-bold transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3 lg:space-y-2 xl:space-y-3">

                  {/* Event 1 - Live Session */}
                  <div className="group relative bg-panel border border-line hover:border-purple/40 rounded-xl p-4 lg:p-3 xl:p-4 transition-all duration-200 hover:shadow-md">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple rounded-l-xl" />
                    <div className="pl-3 lg:pl-2 xl:pl-3">
                      <div className="flex items-start justify-between gap-2 mb-2 lg:mb-1.5 xl:mb-2">
                        <div className="flex items-center gap-2 lg:gap-1.5 xl:gap-2 flex-wrap">
                          <span className="bg-purple/20 text-purple text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Live Session</span>
                          <span className="text-[9px] text-muted font-bold flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Zürich Lab</span>
                        </div>
                        <div className="flex items-center gap-1 bg-red/10 text-red text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 border border-red/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse inline-block" />
                          Today
                        </div>
                      </div>
                      <h4 className="font-bold text-sm lg:text-[13px] xl:text-sm text-text leading-snug mb-0.5">Flipped Session A — Python Basics</h4>
                      <p className="text-xs lg:text-[11px] xl:text-xs text-muted mb-3 lg:mb-2 xl:mb-3 leading-relaxed">Review of core syntax & collaborative group exercises with your cohort peers.</p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 lg:gap-2 xl:gap-3 text-[10px] lg:text-[9px] xl:text-[10px] text-muted font-semibold min-w-0">
                          <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3 shrink-0" /> 18:00 – 19:30</span>
                          <span className="flex items-center gap-1 whitespace-nowrap"><Users className="w-3 h-3 shrink-0" /> 12 attending</span>
                        </div>
                        <button
                          onClick={() => onNavigate('live-session')}
                          className="bg-purple hover:brightness-110 text-white text-[10px] font-black uppercase tracking-wider px-3 lg:px-2.5 xl:px-3 py-1.5 lg:py-1 xl:py-1.5 rounded-lg transition-all active:scale-95 shrink-0"
                        >
                          Join Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Event 2 - Assignment Deadline */}
                  <div className="group relative bg-panel border border-line hover:border-yellow/40 rounded-xl p-4 lg:p-3 xl:p-4 transition-all duration-200 hover:shadow-md">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow rounded-l-xl" />
                    <div className="pl-3 lg:pl-2 xl:pl-3">
                      <div className="flex items-start justify-between gap-2 mb-2 lg:mb-1.5 xl:mb-2 flex-wrap">
                        <span className="bg-yellow/20 text-yellow text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Deadline</span>
                        <span className="text-[9px] text-muted font-bold shrink-0">Tomorrow · 23:59</span>
                      </div>
                      <h4 className="font-bold text-sm lg:text-[13px] xl:text-sm text-text leading-snug mb-0.5">Capstone Draft Submission</h4>
                      <p className="text-xs lg:text-[11px] xl:text-xs text-muted mb-3 lg:mb-2 xl:mb-3 leading-relaxed">Submit your initial project architecture for peer and mentor review.</p>
                      <div className="flex items-center justify-between gap-2 flex-wrap lg:flex-nowrap">
                        <div className="flex items-center gap-1 text-[10px] lg:text-[9px] xl:text-[10px] text-yellow font-bold min-w-0">
                          <AlertCircle className="w-3 h-3 shrink-0" /> <span className="truncate">Don't miss it</span>
                        </div>
                        <button className="border border-yellow/40 text-yellow hover:bg-yellow/10 text-[10px] font-black uppercase tracking-wider px-3 lg:px-2.5 xl:px-3 py-1.5 lg:py-1 xl:py-1.5 rounded-lg transition-all shrink-0">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Event 3 - Workshop */}
                  <div className="group relative bg-panel border border-line hover:border-cyan/40 rounded-xl p-4 lg:p-3 xl:p-4 transition-all duration-200 hover:shadow-md">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan rounded-l-xl" />
                    <div className="pl-3 lg:pl-2 xl:pl-3">
                      <div className="flex items-start justify-between gap-2 mb-2 lg:mb-1.5 xl:mb-2">
                        <div className="flex items-center gap-2 lg:gap-1.5 xl:gap-2 flex-wrap">
                          <span className="bg-cyan/20 text-cyan text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Workshop</span>
                          <span className="text-[9px] text-muted font-bold flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> Online</span>
                        </div>
                        <span className="text-[9px] text-muted font-bold shrink-0">Oct 12 · 10:00</span>
                      </div>
                      <h4 className="font-bold text-sm lg:text-[13px] xl:text-sm text-text leading-snug mb-0.5">Prompt Engineering Deep Dive</h4>
                      <p className="text-xs lg:text-[11px] xl:text-xs text-muted mb-3 lg:mb-2 xl:mb-3 leading-relaxed">Hands-on workshop covering zero-shot, few-shot and chain-of-thought techniques.</p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 lg:gap-2 xl:gap-3 text-[10px] lg:text-[9px] xl:text-[10px] text-muted font-semibold min-w-0">
                          <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3 shrink-0" /> 2h</span>
                          <span className="flex items-center gap-1 whitespace-nowrap"><Users className="w-3 h-3 shrink-0" /> 34 seats left</span>
                        </div>
                        <button className="border border-cyan/40 text-cyan hover:bg-cyan/10 text-[10px] font-black uppercase tracking-wider px-3 lg:px-2.5 xl:px-3 py-1.5 lg:py-1 xl:py-1.5 rounded-lg transition-all shrink-0">
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>



                </div>
              </div>

              {/* Neural Insights Section (High Fidelity Design) */}
              <div className="rounded-2xl p-6 lg:p-4 xl:p-6 space-y-6 lg:space-y-4 xl:space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan/10 border border-cyan/20 rounded-xl text-cyan">
                    <Cpu className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
                  </div>
                  <h3 className="text-lg lg:text-base xl:text-lg font-bold text-text">Neural Insights</h3>
                </div>

                <div className="space-y-4 lg:space-y-3 xl:space-y-4">
                  <NeuralInsightCard
                    category="Recommendation"
                    text="Based on your 92% Focus, I suggest moving to the Practical Lab: GPU Cluster Optimization. This will help you maintain your current learning momentum."
                    color="cyan"
                  />
                  <NeuralInsightCard
                    category="Knowledge Gap"
                    text="Your retention in 'Probability' is slightly lower. Try the 5-minute refresher before the next module. Reinforcing this concept now will improve your performance in upcoming lessons."
                    color="purple"
                  />
                  <NeuralInsightCard
                    category="Sync Alert"
                    text="Three peers in your cohort are starting 'LLM Fine-tuning' now. Join the collaborative session? Working together can accelerate your understanding through shared discussions."
                    color="cyan"
                  />
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => onNavigate('ai-tutor')}
                    className="w-fit px-8 bg-transparent hover:bg-cyan/5 border border-cyan/30 text-cyan text-xs lg:text-[10px] xl:text-xs font-bold py-3 lg:py-2.5 xl:py-3 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center space-x-2 lg:space-x-1.5 xl:space-x-2"
                  >
                    <MessageSquare className="w-4 h-4 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                    <span>Chat with Neural Tutor</span>
                  </button>
                </div>
              </div>
            </div>


          </div>

        </div>
      )}

      {/* Demo Center Link */}
      <button
        onClick={() => onNavigate('demo-center')}
        className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r from-purple/10 to-cyan/10 border border-purple/30 hover:border-cyan/50 rounded-2xl transition-all cursor-pointer group shadow-lg shadow-purple/5 mt-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-panel rounded-xl shadow-inner border border-line">
            <Sparkles className="w-6 h-6 text-purple group-hover:text-cyan transition-colors" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-text group-hover:text-cyan transition-colors tracking-tight">Developer Demo Center</span>
            <span className="block text-sm text-muted mt-1">Access modal showcases, notification testing labs, and interactive UI sandboxes.</span>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
      </button>

      {showQuickSession && (
        <div
          onClick={() => setShowQuickSession(false)}
          className="fixed inset-0 bg-bg/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full max-w-[1400px] max-h-[90dvh] bg-panel border border-line rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 relative cursor-default"
          >
            <ContentPlayer
              isQuickSession={true}
              onCloseQuickSession={() => setShowQuickSession(false)}
              onNavigate={(page) => {
                setShowQuickSession(false);
                onNavigate(page);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
