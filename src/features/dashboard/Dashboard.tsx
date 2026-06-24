import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { COURSES, TRACKS } from '../../services/mockData';
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
  TrendingUp,
  Trophy,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
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
    <div className={`bg-bg/40 border border-line ${accentColor} border-l-4 rounded-lg p-4 space-y-2 transition-all hover:bg-bg/60`}>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{category}</span>
      <p className="text-xs text-text font-medium leading-relaxed italic">
        "{text}"
      </p>
    </div>
  );
};

// Progress Indicator for mobile with smooth SVG animations
const RingProgress: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({ 
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
const PillProgress: React.FC<{ progress: number }> = ({ progress }) => {
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
const NeuralActivityChart: React.FC = () => {
  // Minutes of learning per day (Mon–Sun)
  const data = [
    { day: 'M', mins: 42, label: 'Mon' },
    { day: 'T', mins: 78, label: 'Tue' },
    { day: 'W', mins: 55, label: 'Wed' },
    { day: 'T', mins: 110, label: 'Thu' },
    { day: 'F', mins: 90, label: 'Fri' },
    { day: 'S', mins: 30, label: 'Sat' },
    { day: 'S', mins: 95, label: 'Sun' },
  ];
  const maxMins = Math.max(...data.map(d => d.mins));

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse shadow-[0_0_6px_rgba(0,255,242,0.6)]" />
          <h3 className="text-[11px] font-semibold text-text/50 uppercase tracking-[0.3em]">Neural Velocity</h3>
        </div>
        <span className="text-[10px] font-bold text-cyan/70 tabular-nums">
          {data.reduce((s, d) => s + d.mins, 0)} <span className="opacity-50">min / wk</span>
        </span>
      </div>

      {/* Bars — flex-1 fills all remaining card height */}
      <div className="flex-1 flex items-end gap-2 min-h-0">
        {data.map((d, i) => {
          const ratio = d.mins / maxMins;
          return (
            <div key={i} className="flex-1 flex flex-col h-full items-center justify-end gap-1.5 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text text-bg text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-black whitespace-nowrap z-20 pointer-events-none shadow-xl">
                {d.label}: {d.mins} min
              </div>
              {/* Spacer pushes bar down proportionally */}
              <div className="w-full" style={{ flex: 1 - ratio }} />
              {/* Bar fills its proportional share */}
              <div
                className={`w-full rounded-t-md transition-all duration-500 cursor-pointer relative overflow-hidden bg-cyan/20 border-t-2 border-cyan/40 group-hover:bg-cyan/40`}
                style={{ flex: ratio }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
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

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, setActiveCourseId, setActiveTrackId, isOnboardingSkipped, resetOnboarding, onboardingAnswers } = useAuth();
  const { level, streak, xp, addToast } = useXP();

  // Progress Sync States (REQ-LOAD-003)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState('');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Page Mount Loading State (REQ-LOAD-002)
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

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

  const enrolledTracks = TRACKS.filter(t => t.enrolled);
  const enrolledCourses = COURSES.filter(c => c.enrolled).slice(0, 4);
  
  const activeTrack = enrolledTracks.find(t => t.progress > 0 && t.progress < 100) || enrolledTracks[0];
  const activeCourse = enrolledCourses.find(c => c.progress > 0 && c.progress < 100) || enrolledCourses[0];

  const primaryActive: (
    { type: 'track'; data: typeof TRACKS[0] } | 
    { type: 'course'; data: typeof COURSES[0] } |
    { type: 'none'; data: null }
  ) = (activeTrack && activeTrack.enrolled) 
    ? { type: 'track', data: activeTrack } 
    : (activeCourse && activeCourse.enrolled)
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
                  className="text-muted hover:text-text p-2 hover:bg-bg rounded-lg transition-colors cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hero Greeting Section */}
          <div className="pt-2">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  {getGreeting()}, {user?.name.split(' ')[0]} 👋
                </h1>
              </div>
              {primaryActive.type !== 'none' ? (
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
                <div className="bg-panel border border-line rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan/10 transition-all duration-700" />
                  <div className="relative z-10 space-y-2 text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-black text-text leading-tight">Master Your Next Frontier §11.4</h2>
                    <p className="text-muted text-sm md:text-base max-w-lg">
                      You haven't started a technical track yet. Explore our curated laboratory paths and build your engineering legacy today.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('browse-courses')}
                    className="relative z-10 w-full md:w-auto bg-cyan hover:bg-cyan2 text-bg text-xs font-black px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                  >
                    Begin Discovery
                  </button>
                </div>
              )}

              {onboardingAnswers && (
                <div className="mt-3 p-3 bg-bg/40 border border-line rounded-xl text-xs text-muted flex items-start space-x-2.5 max-w-2xl">
                  <span className="text-cyan font-bold select-none shrink-0">💡 AI TUTOR PATH:</span>
                  <div>
                    {onboardingAnswers.timePerWeek === '< 2h' && (
                      <p>Since you have less than 2 hours to invest this week, keep it bite-sized! Study 15 minutes a day to lock in your daily streak.</p>
                    )}
                    {onboardingAnswers.timePerWeek === '2–5h' && (
                      <p>With 2–5 hours per week, try finishing 1 module every 3 days. Your AI Tutor will guide you on the key concepts.</p>
                    )}
                    {onboardingAnswers.timePerWeek === '5–10h' && (
                      <p>Aiming for 5–10 hours! You are on an accelerated path. Review Modules 2 and 4 early to secure your Capstone project timeline.</p>
                    )}
                    {onboardingAnswers.timePerWeek === '> 10h' && (
                      <p>Bootcamp mode active! (&gt;10 hours/week). We recommend completing 2 lessons per day and submitting 1 code critique to your AI Tutor.</p>
                    )}
                    <span className="text-[10px] text-cyan/70 mt-1 block font-semibold hover:underline cursor-pointer" onClick={() => onNavigate('ai-tutor')}>
                      Ask your AI Tutor about customized schedule tips &rarr;
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid - Sticky Note Style */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-12 mt-8 md:mt-12 mb-8 md:mb-10">
              <StickyNoteStat 
                label="Learning Level"
                value={level}
                subtext="Mastering the core foundations of engineering"
                color="peach"
                rotation="md:rotate-1"
                onClick={() => onNavigate('analytics')}
              />
              <StickyNoteStat 
                label="Current Streak"
                value={`${streak} Days`}
                subtext="Consistency is the key to mental muscle memory"
                color="lavender"
                rotation="md:-rotate-2"
                onClick={() => onNavigate('analytics')}
              />
              <StickyNoteStat 
                label="Total XP Pool"
                value={xp.toLocaleString()}
                subtext="Points earned through vigorous laboratory work"
                color="sky"
                rotation="md:rotate-2"
                onClick={() => onNavigate('analytics')}
              />
              <StickyNoteStat 
                label="Module Progress"
                value="2/10"
                subtext="Keep moving forward, one block at a time"
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
              
              {/* Active Course Card (Continue Learning CTA) */}
              {activeCourse && (
                <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-6">
                      <div>
                        <span className="bg-orange/20 text-orange border border-orange/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Active Course
                        </span>
                        <h2 className="text-xl font-bold mt-2">{activeCourse.title}</h2>
                      </div>
                      <div className="shrink-0">
                        {/* Mobile: Circular Progress */}
                        <div className="md:hidden">
                          <RingProgress progress={activeCourse.progress} size={56} strokeWidth={4} />
                        </div>
                        {/* Desktop: Pill Progress */}
                        <div className="hidden md:block">
                          <PillProgress progress={activeCourse.progress} />
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
                        onNavigate('learning-path');
                      }}
                      className="bg-cyan hover:bg-cyan2 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{primaryActive.type === 'track' ? 'RESUME TRACK PATH' : 'OPEN LEARNING PATH'}</span>
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
                  <button 
                    onClick={() => onNavigate('catalog')}
                    className="text-cyan hover:text-cyan2 text-sm font-bold flex items-center space-x-1 transition-colors"
                  >
                    <span>View all courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {enrolledCourses.map((course, index) => {
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
                    if (course.title === 'Testing Course') {
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
                        <div className="flex flex-col space-y-4 justify-between h-full">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-muted" /></div>
                              <div>
                                <div className="text-[9px] text-muted font-bold uppercase tracking-widest">Est. Time</div>
                                <div className="text-xs font-black text-text mt-0.5">12h 45m</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center shrink-0"><PlayCircle className="w-4 h-4 text-muted" /></div>
                              <div>
                                <div className="text-[9px] text-muted font-bold uppercase tracking-widest">Lessons</div>
                                <div className="text-xs font-black text-text mt-0.5">8 of 30</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-muted" /></div>
                              <div>
                                <div className="text-[9px] text-muted font-bold uppercase tracking-widest">Next Up</div>
                                <div className="text-xs font-black text-text mt-0.5 truncate max-w-[120px]">Functions</div>
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
                    } else if (course.title === 'Command Line Basics') {
                      rightSection = (
                        <div className="flex flex-col items-center justify-center space-y-4 h-full">
                          <div className="w-12 h-12 rounded-full bg-yellow/20 flex items-center justify-center border-2 border-yellow/30">
                            <Trophy className="w-6 h-6 text-yellow" />
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-base font-black text-text">Well done!</div>
                            <div className="text-xs text-muted">Course completed</div>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveCourseId(course.id);
                              onNavigate('learning-path');
                            }}
                            className={`w-full flex items-center justify-center space-x-2 border-2 border-yellow text-yellow hover:bg-yellow hover:text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-all mt-3`}
                          >
                            <span>Review</span>
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
                      <div key={course.id} className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg bg-panel border border-line hover:bg-panel2 transition-all">
                        {/* Left colored block */}
                        <div className={`relative w-full md:w-36 lg:w-44 flex flex-col items-center justify-center py-6 md:py-0 bg-${color} flex-shrink-0 overflow-hidden`}>
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
                        <div className="w-full md:w-52 lg:w-60 p-5 md:p-6 border-t md:border-t-0 md:border-l border-line bg-panel2/30 flex flex-col justify-center shrink-0">
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
              <NeuralActivityChart />
              
              {/* Upcoming Community Event */}
              <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Upcoming Session</h3>
                  </div>
                  <span className="bg-purple/20 text-purple text-[10px] px-2 py-0.5 rounded font-bold">TODAY</span>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-text">Flipped Session A</h4>
                  <p className="text-xs text-muted">Python Basics Review & Group Exercise</p>
                  <p className="text-[10px] text-muted pt-1">Time: 18:00 - 20:00 &bull; Venue: Zürich Lab Room 4</p>
                  <button 
                    onClick={() => onNavigate('live-session')}
                    className="text-cyan hover:text-cyan2 text-xs font-semibold flex items-center space-x-1 pt-1"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Neural Insights Section (High Fidelity Design) */}
              <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan/10 border border-cyan/20 rounded-xl text-cyan">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Neural Insights</h3>
                </div>

                <div className="space-y-4">
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
                  className="w-full bg-transparent hover:bg-cyan/5 border border-cyan/30 text-cyan text-xs font-bold py-3 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
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
          
          {/* Explore Catalog Link */}
          <button
            onClick={() => onNavigate('explore')}
            className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r from-cyan/10 to-blue-500/10 border border-cyan/30 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer group shadow-lg shadow-cyan/5 mt-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-panel rounded-xl shadow-inner border border-line">
                <BookOpen className="w-6 h-6 text-cyan group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-lg font-black text-text group-hover:text-cyan transition-colors tracking-tight">Explore All Courses</span>
                <span className="block text-sm text-muted mt-1">Browse the full catalog without personalized filters or enrolled statuses.</span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
          </button>

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
    </div>
  );
};
