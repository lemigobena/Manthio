import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTrack } from '../track-detail/useTrack';
import { COURSES, TRACKS } from '../../services/mockData';
import { ContentPlayer } from '../content-player/ContentPlayer';
import { ContinueYourTrackCard } from '../track-detail/ContinueYourTrackCard';
import { 
  Play,
  BookOpen,
  Sparkles,
  ArrowRight, 
  RefreshCw, 
  X, 
  Code,
  Layout,
  Database,
  Cloud,
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
  Star
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
    <div className={`bg-bg/40 border border-line ${accentColor} border-l-4 rounded-lg p-4 lg:p-3 xl:p-4 space-y-2 lg:space-y-1.5 xl:space-y-2 transition-all hover:bg-bg/60`}>
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

const FlipUnit: React.FC<{ value: string, label: string, size?: 'sm' | 'md' | 'lg' }> = ({ value, label, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-10 h-12 md:w-12 md:h-14' : size === 'lg' ? 'w-16 h-20 md:w-24 md:h-28' : 'w-14 h-18 md:w-20 md:h-24';
  const textClasses = size === 'sm' ? 'text-lg md:text-xl' : size === 'lg' ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl';

  return (
    <div className="flex flex-col items-center space-y-1 md:space-y-2">
      <div className={`relative ${sizeClasses} bg-panel border border-line rounded-xl overflow-hidden shadow-xl flex flex-col`}>
        {/* Top half */}
        <div className="h-1/2 bg-panel2 border-b border-line/30 flex items-end justify-center overflow-hidden">
          <span className={`${textClasses} font-mono font-black text-text translate-y-1/2 leading-none uppercase`}>{value}</span>
        </div>
        {/* Bottom half */}
        <div className="h-1/2 flex items-start justify-center overflow-hidden">
          <span className={`${textClasses} font-mono font-black text-text -translate-y-1/2 leading-none uppercase`}>{value}</span>
        </div>
        {/* Divider Hinge */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-bg/80 z-10" />
        <div className="absolute top-1/2 left-0 w-1 h-3 bg-line -translate-y-1/2 rounded-r" />
        <div className="absolute top-1/2 right-0 w-1 h-3 bg-line -translate-y-1/2 rounded-l" />
      </div>
      <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
};

// High-fidelity Sticky Note Stat component inspired by Skale design
const StickyNoteStat: React.FC<{ 
  label: string; 
  value: string | number; 
  subtext: string; 
  color: 'peach' | 'lavender' | 'sky' | 'mint';
  rotation: string;
  onClick?: () => void;
}> = ({ label, value, subtext, color, rotation, onClick }) => {
  const bgStyles = {
    peach: 'bg-[#FFF0EB] border-[#FFD9CF] dark:bg-orange/10 dark:border-orange/20',
    lavender: 'bg-[#F5F0FF] border-[#E0D4FF] dark:bg-purple/10 dark:border-purple/20',
    sky: 'bg-[#E8F8FF] border-[#BDEBFF] dark:bg-cyan/10 dark:border-cyan/20',
    mint: 'bg-[#EFFDF5] border-[#D1F7E3] dark:bg-green/10 dark:border-green/20',
  }[color];

  const pinStyles = {
    peach: 'bg-orange shadow-[0_0_10px_rgba(255,123,0,0.5)]',
    lavender: 'bg-purple shadow-[0_0_10px_rgba(163,58,255,0.5)]',
    sky: 'bg-cyan shadow-[0_0_10px_rgba(0,255,242,0.5)]',
    mint: 'bg-green shadow-[0_0_10px_rgba(34,197,94,0.5)]',
  }[color];

  return (
    <button 
      onClick={onClick}
      className={`group relative ${bgStyles} border-b-4 border-r-2 p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] shadow-xl ${rotation} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* 3D Glass Pin Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${pinStyles} relative opacity-80`}>
          <div className="absolute inset-0 bg-white/40 rounded-full blur-[1px]" />
        </div>
        <div className="w-0.5 h-3 bg-gray-400/30 -mt-1" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center justify-between min-h-[110px] pt-1">
        <div className="space-y-1">
          <h3 className="text-[9px] font-black text-text uppercase tracking-[0.2em] opacity-40">{label}</h3>
          <div className="text-3xl font-black text-text tracking-tight leading-none">{value}</div>
        </div>
        <p className="text-[11px] text-muted font-bold leading-relaxed italic mt-3 max-w-[150px]">
          "{subtext}"
        </p>
      </div>
    </button>
  );
};

// Neural Activity Chart - High Fidelity Bar Visualization
const NeuralActivityChart: React.FC<{ heroState?: string }> = ({ heroState }) => {
  // Minutes of learning per day (Mon–Sun)
  let data = [
    { day: 'M', mins: 42, label: 'Mon' },
    { day: 'T', mins: 78, label: 'Tue' },
    { day: 'W', mins: 55, label: 'Wed' },
    { day: 'T', mins: 110, label: 'Thu' },
    { day: 'F', mins: 90, label: 'Fri' },
    { day: 'S', mins: 30, label: 'Sat' },
    { day: 'S', mins: 95, label: 'Sun' },
  ];

  if (heroState === 'long-break') {
    data = data.map(d => ({ ...d, mins: 0 }));
  }

  const maxMins = Math.max(1, ...data.map(d => d.mins));

  return (
    // Give the chart a clear minimum height so bars can breathe
    <div className="bg-panel border border-line rounded-2xl p-5 lg:p-3 xl:p-5 flex flex-col flex-1 min-h-50 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 lg:mb-4 xl:mb-5">
        <div className="flex items-center gap-3 lg:gap-2 xl:gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse shadow-[0_0_6px_rgba(0,255,242,0.6)] shrink-0" />
          <h3 className="text-[11px] lg:text-[8px] xl:text-[11px] font-semibold text-text/50 uppercase tracking-[0.3em] lg:tracking-[0.1em] xl:tracking-[0.3em] truncate">
            <span className="lg:hidden xl:inline">Neural </span>Velocity
          </h3>
        </div>
        <span className="text-[10px] lg:text-[8px] xl:text-[10px] font-bold text-cyan/70 tabular-nums whitespace-nowrap ml-2">
          {data.reduce((s, d) => s + d.mins, 0)} <span className="opacity-50">min / wk</span>
        </span>
      </div>

      {/* Empty State Overlay for Long Break */}
      {heroState === 'long-break' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none mt-10">
          <span className="bg-panel/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[11px] font-bold text-muted border border-line shadow-sm uppercase tracking-wider">
            No actions this week
          </span>
        </div>
      )}

      {/* Bars — use fixed container height and percentage heights for each bar */}
      <div className="flex-1 flex items-end gap-2 min-h-0 h-full relative">
        {data.map((d, i) => {
          const ratio = d.mins / maxMins;
          return (
            <div key={i} className="flex-1 flex flex-col h-full items-center justify-end gap-1.5 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text text-bg text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-black whitespace-nowrap z-20 pointer-events-none shadow-xl">
                {d.label}: {d.mins} min
              </div>

              {/* Bar container controls visual height via child height percentage */}
              <div className="w-full h-[86%] flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 cursor-pointer relative overflow-hidden bg-cyan/20 border-t-2 border-cyan/40 group-hover:bg-cyan/40`}
                  style={{ height: `${Math.max(6, Math.round(ratio * 100))}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
                </div>
              </div>

              {/* Day label */}
              <span className={`text-[9px] font-black uppercase shrink-0 transition-colors text-muted group-hover:text-text`}>
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
  const { level, streak, xp, addToast } = useXP();
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

  // Progress Sync States (REQ-LOAD-003)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState('');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Page Mount Loading State (REQ-LOAD-002)
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  // Mock toggle for Pre-cohort state
  const [heroState, setHeroState] = useState<'normal' | 'pre-cohort' | 'long-break' | 'all-completed'>(mockState || 'normal');

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 950);
    return () => {
      clearTimeout(timer);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const handleStartSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStep('Initializing sync engine...');
    syncIntervalRef.current = setInterval(() => {
      setSyncProgress(prev => {
        const next = Math.min(prev + 1.25, 100);
        if (next >= 100) {
          if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
          setIsSyncing(false);
          addToast('success', '✓ Workspace synced successfully');
          return 100;
        }
        if (next < 25) setSyncStep('Updating local module schemas...');
        else if (next < 55) setSyncStep('Caching lesson assets...');
        else if (next < 85) setSyncStep('Optimizing offline search index...');
        else setSyncStep('Finalizing local manifest...');
        return next;
      });
    }, 50);
  };

  const handleCancelSync = () => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    setIsSyncing(false);
    setSyncProgress(0);
    setSyncStep('');
    addToast('info', 'Sync cancelled');
  };

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* Hero Greeting Section */}
          <div className="pt-2">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  {getGreeting()}, {user?.name.split(' ')[0]} 👋
                </h1>
              </div>
              {heroState === 'pre-cohort' ? (
                <div className="bg-panel border border-cyan/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan/20 transition-all duration-700" />
                  
                  <div className="relative z-10 space-y-4 w-full">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan">Cohort Pre-Start</span>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-text leading-tight mb-2">Winter '26 Engineering Cohort</h2>
                      <p className="text-muted text-sm md:text-base max-w-xl">
                        Your cohort officially kicks off soon. While you wait, we highly recommend reviewing the pre-reading materials below to ensure you hit the ground running.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => onNavigate('learning-path')}
                        className="bg-cyan hover:bg-cyan2 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,242,0.3)] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Access Pre-Reading
                      </button>
                      <button 
                        onClick={() => onNavigate('community')}
                        className="bg-bg border border-line hover:border-cyan/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Introduce Yourself
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative z-10 hidden md:flex items-center space-x-3 md:space-x-4 shrink-0 mr-[30px]">
                    <FlipUnit value="14" label="Days" size="lg" />
                    <FlipUnit value="08" label="Hours" size="lg" />
                  </div>
                </div>
              ) : heroState === 'long-break' ? (
                <div className="bg-panel border border-orange/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-orange/20 transition-all duration-700" />
                  <div className="relative z-10 space-y-4 w-full">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange">Welcome Back</span>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-text leading-tight mb-2">It's been a while!</h2>
                      <p className="text-muted text-sm md:text-base max-w-xl">You've been away for over 30 days. Don't worry, we've saved your progress. Would you like a quick refresher or to dive right back in?</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button onClick={() => onNavigate('learning-path')} className="bg-orange hover:bg-orange/90 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,123,0,0.3)] active:scale-95 flex items-center justify-center gap-2"><Play className="w-4 h-4" />Resume Module</button>
                      <button onClick={() => onNavigate('ai-tutor')} className="bg-bg border border-line hover:border-orange/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" />Quick Refresher</button>
                    </div>
                  </div>
                </div>
              ) : heroState === 'all-completed' ? (
                <div className="bg-panel border border-yellow/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-yellow/20 transition-all duration-700" />
                  <div className="relative z-10 space-y-4 w-full">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow">Legendary Status</span>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-text leading-tight mb-2">Outstanding Achievement!</h2>
                      <p className="text-muted text-sm md:text-base max-w-xl">You have successfully completed all available courses in your track. Your dedication is truly inspiring. What's next on your journey?</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button onClick={() => onNavigate('catalog')} className="bg-yellow hover:bg-yellow/90 text-bg text-xs font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] active:scale-95 flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" />Explore New Tracks</button>
                      <button onClick={() => onNavigate('profile')} className="bg-bg border border-line hover:border-yellow/30 text-text text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"><Award className="w-4 h-4" />View Certificate</button>
                    </div>
                  </div>
                </div>
              ) : primaryActive.type !== 'none' ? (
                <p className="text-muted text-sm md:text-base">
                  You are currently {primaryActive.type === 'track' ? 'on the track' : 'learning'} <span className="text-cyan font-semibold">{primaryActive.data.title}</span>. 
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
              ) : (
                <div className="bg-panel border border-cyan/20 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan/10 transition-all duration-700" />
                  
                  <div className="relative z-10 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow">Personalised Recommendation</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-text leading-tight mb-2">Python Fundamentals</h2>
                    <p className="text-muted text-sm md:text-base max-w-xl">
                      Based on your onboarding profile and interest in robust software engineering, we recommend beginning your journey with our foundational Python track.
                    </p>
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full">
                    <button 
                      onClick={() => onNavigate('course/python-basics')}
                      className="w-full sm:w-auto bg-cyan hover:bg-cyan2 text-bg text-xs font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,242,0.3)] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Track
                    </button>
                    <button 
                      onClick={() => onNavigate('browse-courses')}
                      className="w-full sm:w-auto bg-bg hover:bg-line border border-line text-text text-xs font-bold px-8 py-3.5 rounded-xl transition-all active:scale-95 text-center"
                    >
                      Explore All Paths
                    </button>
                  </div>
                </div>
              )}

              {lastViewedLesson.lesson && (
                <div 
                  onClick={() => setShowQuickSession(true)}
                  className="mt-3 p-4 bg-cyan/5 hover:bg-cyan/10 border border-cyan/30 hover:border-cyan/50 rounded-2xl text-xs text-muted flex items-start space-x-3 max-w-2xl cursor-pointer transition-all duration-300 active:scale-[0.99] group/quick"
                >
                  <div className="p-2.5 rounded-xl bg-cyan/10 text-cyan shrink-0 group-hover/quick:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan mb-1">Quick Session (Resume learning)</div>
                    <p className="text-text font-bold text-sm truncate">
                      Last viewed: {lastViewedLesson.lesson.title}
                    </p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      Module: {lastViewedLesson.module?.title} • {lastViewedLesson.lesson.duration}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted/50 self-center group-hover/quick:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid - Sticky Note Style */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-12 mt-8 md:mt-12 mb-8 md:mb-10">
              <StickyNoteStat 
                label="Learning Level"
                value={heroState === 'pre-cohort' ? 1 : heroState === 'all-completed' ? 50 : level}
                subtext={heroState === 'pre-cohort' ? 'Ready to begin your journey' : heroState === 'all-completed' ? 'Master of the academy' : 'Mastering the core foundations of engineering'}
                color="peach"
                rotation="md:rotate-1"
                onClick={() => onNavigate('analytics')}
              />
              <StickyNoteStat 
                label="Current Streak"
                value={heroState === 'pre-cohort' || heroState === 'long-break' ? '0 Days' : heroState === 'all-completed' ? '120 Days' : `${streak} Days`}
                subtext={heroState === 'pre-cohort' ? 'Start your streak soon' : heroState === 'long-break' ? 'Time to rebuild momentum' : 'Consistency is the key to mental muscle memory'}
                color="lavender"
                rotation="md:-rotate-2"
                onClick={() => onNavigate('analytics')}
              />
              <StickyNoteStat 
                label="Total XP Pool"
                value={heroState === 'pre-cohort' ? '0' : heroState === 'all-completed' ? '12,500' : xp.toLocaleString()}
                subtext="Points earned through vigorous laboratory work"
                color="sky"
                rotation="md:rotate-2"
                onClick={() => onNavigate('analytics')}
              />
              <StickyNoteStat 
                label="Module Progress"
                value={heroState === 'pre-cohort' ? '0/10' : heroState === 'all-completed' ? '10/10' : '2/10'}
                subtext={heroState === 'all-completed' ? 'All modules mastered' : 'Keep moving forward, one block at a time'}
                color="mint"
                rotation="md:-rotate-1"
                onClick={() => onNavigate('learning-path')}
              />
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
            
            {/* Left Column (Courses & Activity) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ── Continue Your Track Card (REQ-TRACK-010) ── */}
              <ContinueYourTrackCard onNavigate={onNavigate} setActiveTrackId={setActiveTrackId} forceNoTrack={heroState === 'pre-cohort'} />

              {/* Active Course Card (Continue Learning CTA) */}
              {activeCourse && heroState !== 'all-completed' && (
                <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-6">
                      <div>
                        <span className="bg-orange/20 text-orange border border-orange/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Active Course
                        </span>
                        <h2 className="text-xl lg:text-lg xl:text-xl font-bold mt-2">{activeCourse.title}</h2>
                      </div>
                      <div className="shrink-0">
                        {/* Mobile: Circular Progress */}
                        <div className="md:hidden">
                          <RingProgress progress={46} size={56} strokeWidth={4} />
                        </div>
                        {/* Desktop: Pill Progress */}
                        <div className="hidden md:block">
                          <PillProgress progress={46} />
                        </div>
                      </div>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">
                      {activeCourse.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line">
                    <div className="text-xs text-muted">
                      {primaryActive.type === 'track' ? 'Current Focus:' : 'Continue with:'} <span className="text-text font-medium">
                        {primaryActive.type === 'track' 
                          ? (primaryActive.data.milestones.find(m => m.status === 'active')?.title)
                          : 'Variables, Data Types & Operators'}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        if (primaryActive.type === 'track') {
                          setActiveTrackId(primaryActive.data.id);
                        } else if (primaryActive.type === 'course') {
                          setActiveCourseId(primaryActive.data.id);
                        }
                        onNavigate('content-player');
                      }}
                      className="bg-cyan hover:bg-cyan2 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Continue learning</span>
                    </button>
                  </div>
                </div>
              )}

              {heroState === 'all-completed' && (
                <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-6">
                      <div>
                        <span className="bg-purple/20 text-purple border border-purple/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Recommended Course
                        </span>
                        <h2 className="text-xl lg:text-lg xl:text-xl font-bold mt-2">Advanced System Architecture</h2>
                      </div>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">
                      Now that you've mastered the fundamentals, dive deep into scalable, distributed systems and enterprise architecture patterns.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-muted">
                      <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-purple" /> Advanced</div>
                      <div className="w-1 h-1 rounded-full bg-line" />
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 12h 30m</div>
                      <div className="w-1 h-1 rounded-full bg-line" />
                      <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow fill-current" /> 4.9 (2.1k)</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line">
                    <div className="text-xs text-muted">
                      Start your next journey
                    </div>
                    <button 
                      onClick={() => {
                        setActiveCourseId('advanced-system-architecture'); // Mock ID
                        onNavigate('learning-path');
                      }}
                      className="bg-purple hover:bg-purple/90 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>View course</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Enrolled Courses Grid: Redesigned based on screenshot */}
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
                
                <div className="space-y-4">
                  {displayCourses.map((course, index) => {
                    const colors = ['cyan', 'purple', 'yellow', 'green'];
                    const color = colors[index % colors.length];
                    
                    // Helper to get specific icon for each course
                    const getCourseIcon = (title: string) => {
                      const lowerTitle = title.toLowerCase();
                      if (lowerTitle.includes('python') || lowerTitle.includes('code') || lowerTitle.includes('programming')) return <Code className="w-8 h-8 md:w-12 md:h-12 text-bg" />;
                      if (lowerTitle.includes('react') || lowerTitle.includes('frontend') || lowerTitle.includes('interface')) return <Layout className="w-8 h-8 md:w-12 md:h-12 text-bg" />;
                      if (lowerTitle.includes('data') || lowerTitle.includes('analytics') || lowerTitle.includes('science')) return <Database className="w-8 h-8 md:w-12 md:h-12 text-bg" />;
                      if (lowerTitle.includes('git') || lowerTitle.includes('github')) return (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-8 h-8 md:w-12 md:h-12 text-bg"
                        >
                          <circle cx="5" cy="6" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/><path d="m15 9-3-3 3-3"/><circle cx="19" cy="18" r="3"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m9 15 3 3-3 3"/>
                        </svg>
                      );
                      if (lowerTitle.includes('cloud') || lowerTitle.includes('infrastructure')) return <Cloud className="w-8 h-8 md:w-12 md:h-12 text-bg" />;
                      return <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-bg" />;
                    };

                    let rightSection: React.ReactNode | null;
                    if (heroState === 'all-completed' || course.title === 'Command Line Basics' || course.progress === 100) {
                      rightSection = (
                        <div className="flex flex-col items-center justify-center space-y-4 h-full">
                          <div className="w-12 h-12 rounded-full bg-yellow/20 flex items-center justify-center border-2 border-yellow/30">
                            <Trophy className="w-6 h-6 text-yellow" />
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-base font-black text-text">Well done!</div>
                            <div className="text-xs text-muted">Course completed</div>
                          </div>
                          <button onClick={() => { onNavigate('completed-course:' + course.id); }} className={`w-full flex items-center justify-center space-x-2 border-2 border-yellow text-yellow hover:bg-yellow hover:text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-all mt-3`}>
                            <span>Review</span>
                          </button>
                        </div>
                      );
                    } else if (course.title === 'Testing Course') {
                      rightSection = (
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="flex flex-col items-center">
                            <RingProgress progress={0} size={60} strokeWidth={5} color="#475569" />
                            <span className="text-[10px] text-muted font-bold mt-2 uppercase tracking-widest">Complete</span>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveCourseId(course.id);
                              onNavigate('learning-path');
                            }}
                            className={`w-full flex items-center justify-center space-x-2 bg-${color} hover:brightness-110 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md`}
                          >
                            <span>Continue</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    } else if (course.title === 'Python Bootcamp') {
                      rightSection = (
                        <div className="flex flex-col items-center justify-center space-y-4 h-full">
                          <div className="flex flex-col items-center mt-auto">
                            <RingProgress progress={46} size={72} strokeWidth={6} color={color === 'cyan' ? '#00fff2' : color === 'purple' ? '#b624ff' : color === 'yellow' ? '#ffb800' : '#00ff9d'} />
                            <span className="text-[10px] text-muted font-bold mt-3 uppercase tracking-widest">In Progress</span>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveCourseId(course.id);
                              onNavigate('learning-path');
                            }}
                            className={`w-full flex items-center justify-center space-x-2 bg-${color} hover:brightness-110 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md mt-auto`}
                          >
                            <span>Continue</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    } else if (course.title === 'SQL & Relational Databases') {
                      rightSection = (
                        <div className="flex flex-col space-y-4 justify-between h-full">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-muted" /></div>
                              <div>
                                <div className="text-[9px] text-muted font-bold uppercase tracking-widest">Est. Time</div>
                                <div className="text-xs font-black text-text mt-0.5">9h 20m</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-muted" /></div>
                              <div>
                                <div className="text-[9px] text-muted font-bold uppercase tracking-widest">Lessons</div>
                                <div className="text-xs font-black text-text mt-0.5">5 of 28</div>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveCourseId(course.id);
                              onNavigate('learning-path');
                            }}
                            className={`w-full flex items-center justify-center space-x-2 bg-${color} hover:brightness-110 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md mt-auto`}
                          >
                            <span>Continue</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    } else {
                       rightSection = (
                         <div className="flex flex-col items-center justify-center h-full">
                           <button 
                              onClick={() => {
                                setActiveCourseId(course.id);
                                onNavigate('learning-path');
                              }}
                              className={`w-full flex items-center justify-center space-x-2 bg-${color} hover:brightness-110 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md`}
                            >
                              <span>Continue</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                       );
                    }

                    return (
                      <div key={course.id} className="course-card flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg bg-panel border border-line hover:bg-panel2 transition-all">
                        {/* Left colored block */}
                        <div className={`course-card-left relative w-full md:w-36 lg:hidden xl:flex xl:w-44 flex-col items-center justify-center py-6 md:py-0 bg-${color} flex-shrink-0 overflow-hidden ${'flex'}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent mix-blend-overlay" />
                          <div className="relative z-10 flex flex-col items-center space-y-3">
                            {getCourseIcon(course.title)}
                            <span className="text-[9px] font-black text-bg/90 uppercase tracking-[0.3em]">
                              MODULE
                            </span>
                          </div>
                        </div>

                        {/* Middle Content */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              {course.progress === 100 ? (
                                <div className="flex items-center space-x-1 px-2 py-0.5 rounded border border-yellow/30 bg-yellow/10">
                                  <Check className="w-3 h-3 text-yellow" />
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-yellow">Completed</span>
                                </div>
                              ) : (
                                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border border-${color}/30 bg-${color}/10`}>
                                  <div className={`w-1.5 h-1.5 rounded-full bg-${color}`} />
                                  <span className={`text-[9px] font-bold uppercase tracking-wider text-${color}`}>In Progress</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg md:text-xl text-text">{course.title}</h4>
                              <p className="text-muted text-xs mt-1.5 leading-relaxed max-w-sm lg:max-w-md line-clamp-2 md:line-clamp-none">{course.description}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 w-full max-w-sm">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted mb-2">
                              <span>Progress</span>
                              <span className={`text-${color}`}>{course.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-bg rounded-full overflow-hidden border border-line/50">
                              <div 
                                className={`h-full bg-${color} transition-all duration-1000`} 
                                style={{ width: `${course.progress}%` }} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right Stats Section */}
                        <div className="course-card-right w-full md:w-52 lg:w-60 p-5 md:p-6 border-t md:border-t-0 md:border-l border-line bg-panel2/30 flex flex-col justify-center shrink-0">
                          {rightSection}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (Community Events, Recommendations, and Weak Points) */}
            <div className="flex flex-col gap-6">
              
              {/* REQ-DASH-007: Activity Chart - Right Column Visualization */}
              <NeuralActivityChart heroState={heroState} />
              
              {/* REQ-DASH-010: Upcoming Events */}
              <div className="bg-panel border border-line rounded-2xl p-6 lg:p-4 xl:p-6 space-y-5 lg:space-y-4 xl:space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange" />
                    <h3 className="font-bold text-base lg:text-sm xl:text-base text-text">Upcoming Events</h3>
                  </div>
                  <button 
                    onClick={() => onNavigate('live-sessions')}
                    className="text-cyan hover:text-cyan2 text-[10px] lg:text-[9px] xl:text-[10px] uppercase tracking-wider font-bold transition-colors"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4 lg:space-y-3 xl:space-y-4">
                  {/* Event 1 - Live Session */}
                  <div className="flex gap-4 lg:gap-3 xl:gap-4 group">
                    <div className="flex flex-col items-center mt-0.5 shrink-0 w-12 lg:w-10 xl:w-12">
                      <div className="text-[10px] lg:text-[8px] xl:text-[10px] font-bold text-muted uppercase">Today</div>
                      <div className="text-lg lg:text-base xl:text-lg font-black text-text leading-none mt-1">18:00</div>
                    </div>
                    <div className="w-0.5 bg-purple/30 group-hover:bg-purple transition-colors rounded-full" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-purple/20 text-purple text-[8px] lg:text-[7px] xl:text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Live Session</span>
                        <span className="text-[9px] lg:text-[8px] xl:text-[9px] text-muted font-bold flex items-center gap-1"><MapPin className="w-2.5 h-2.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5"/> Zürich Lab</span>
                      </div>
                      <h4 className="font-bold text-sm lg:text-xs xl:text-sm text-text leading-snug">Flipped Session A</h4>
                      <p className="text-xs lg:text-[10px] xl:text-xs text-muted mb-2">Python Basics Review & Group Exercise</p>
                      <button 
                        onClick={() => onNavigate('live-session')}
                        className="text-cyan hover:text-cyan2 text-xs lg:text-[10px] xl:text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <span>Join Session</span>
                        <ArrowRight className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Event 2 - Assignment Deadline */}
                  <div className="flex gap-4 lg:gap-3 xl:gap-4 group">
                    <div className="flex flex-col items-center mt-0.5 shrink-0 w-12 lg:w-10 xl:w-12">
                      <div className="text-[10px] lg:text-[8px] xl:text-[10px] font-bold text-muted uppercase">Tmrw</div>
                      <div className="text-lg lg:text-base xl:text-lg font-black text-text leading-none mt-1">23:59</div>
                    </div>
                    <div className="w-0.5 bg-yellow/30 group-hover:bg-yellow transition-colors rounded-full" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-yellow/20 text-yellow text-[8px] lg:text-[7px] xl:text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Deadline</span>
                      </div>
                      <h4 className="font-bold text-sm lg:text-xs xl:text-sm text-text leading-snug">Capstone Draft</h4>
                      <p className="text-xs lg:text-[10px] xl:text-xs text-muted">Submit initial project architecture.</p>
                    </div>
                  </div>

                  {/* Event 3 - Cohort Milestone */}
                  <div className="flex gap-4 lg:gap-3 xl:gap-4 group">
                    <div className="flex flex-col items-center mt-0.5 shrink-0 w-12 lg:w-10 xl:w-12">
                      <div className="text-[10px] lg:text-[8px] xl:text-[10px] font-bold text-muted uppercase">Oct 12</div>
                      <div className="text-lg lg:text-base xl:text-lg font-black text-text leading-none mt-1">09:00</div>
                    </div>
                    <div className="w-0.5 bg-cyan/30 group-hover:bg-cyan transition-colors rounded-full" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-cyan/20 text-cyan text-[8px] lg:text-[7px] xl:text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Milestone</span>
                      </div>
                      <h4 className="font-bold text-sm lg:text-xs xl:text-sm text-text leading-snug">Module 1 Unlock</h4>
                      <p className="text-xs lg:text-[10px] xl:text-xs text-muted">Next phase of Python engineering.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Insights Section (High Fidelity Design) */}
              <div className="bg-panel border border-line rounded-2xl p-6 lg:p-4 xl:p-6 space-y-6 lg:space-y-4 xl:space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan/10 border border-cyan/20 rounded-xl text-cyan">
                    <Cpu className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
                  </div>
                  <h3 className="text-lg lg:text-base xl:text-lg font-bold text-text">Neural Insights</h3>
                </div>

                <div className="space-y-4 lg:space-y-3 xl:space-y-4">
                  <NeuralInsightCard 
                    category="Recommendation" 
                    text="Based on your 92% Focus, I suggest moving to the **Practical Lab: GPU Cluster Optimization**." 
                    color="cyan" 
                  />
                  <NeuralInsightCard 
                    category="Knowledge Gap" 
                    text="Your retention in 'Probability' is slightly lower. Try the 5-minute refresher before the next module." 
                    color="purple" 
                  />
                  <NeuralInsightCard 
                    category="Sync Alert" 
                    text="Three peers in your cohort are starting 'LLM Fine-tuning' now. Join the collaborative session?" 
                    color="cyan" 
                  />
                </div>

                <button 
                  onClick={() => onNavigate('ai-tutor')}
                  className="w-full bg-transparent hover:bg-cyan/5 border border-cyan/30 text-cyan text-xs lg:text-[10px] xl:text-xs font-bold py-3 lg:py-2.5 xl:py-3 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center space-x-2 lg:space-x-1.5 xl:space-x-2"
                >
                  <MessageSquare className="w-4 h-4 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                  <span>Chat with Neural Tutor</span>
                </button>
              </div>

              {/* REQ-LOAD-003: Progress indicators for long operations with Cancel option */}
              <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className={`w-4 h-4 text-cyan ${isSyncing ? 'animate-spin' : ''}`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Offline Workspace Sync</h3>
                  </div>
                  <span className="bg-cyan/15 text-cyan text-[10px] px-2 py-0.5 rounded font-bold uppercase">Local Cache</span>
                </div>
                
                {!isSyncing && syncProgress === 0 ? (
                  <div className="space-y-3">
                    <p className="text-muted text-xs leading-relaxed">
                      Download and cache all bootcamp video lessons, resources, and quiz databases for offline learning access.
                    </p>
                    <button 
                      onClick={handleStartSync}
                      className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Start Offline Sync
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted truncate max-w-[70%] font-semibold block">{syncStep}</span>
                      <span className="font-bold text-text shrink-0">{Math.floor(syncProgress)}%</span>
                    </div>
                    
                    {/* Horizontal Progress Bar */}
                    <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden border border-line">
                      <div 
                        className="h-full bg-cyan transition-all duration-100 ease-out" 
                        style={{ width: `${syncProgress}%` }} 
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={handleCancelSync}
                        className="w-full bg-red/10 hover:bg-red/20 text-red border border-red/20 hover:border-red/35 text-xs font-semibold py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel Sync</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
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
        </div>
      )}

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
