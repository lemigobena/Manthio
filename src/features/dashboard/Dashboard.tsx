import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { COURSES } from '../../services/mockData';
import { useModal } from '../../context/ModalContext';
import { 
  Play,
  Award,
  BookOpen,
  Sparkles,
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  X, 
  Code,
  Layout,
  Database,
  Cloud,
  Cpu,
  MessageSquare
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
  const { user, setActiveCourseId } = useAuth();
  const { level, streak, xp, addToast } = useXP();
  const { openModal } = useModal();

  // Progress Sync States (REQ-LOAD-003)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState('');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Page Mount Loading State (REQ-LOAD-002)
  const [isPageLoading, setIsPageLoading] = useState(true);

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
    addToast('info', 'Sync cancelled');
  };

  const enrolledCourses = COURSES.filter(c => c.enrolled).slice(0, 4);
  const activeCourse = enrolledCourses.find(c => c.progress > 0 && c.progress < 100) || enrolledCourses[0];



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
          {/* Hero Greeting Section */}
          <div className="pt-2">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  {getGreeting()}, {user?.name.split(' ')[0]} 👋
                </h1>
              </div>
              {activeCourse ? (
                <p className="text-muted text-sm md:text-base">
                  You are currently learning <span className="text-cyan font-semibold">{activeCourse.title}</span>. Active module:{' '}
                  <span className="text-text font-semibold">
                    Module {activeCourse.modules.find(m => m.status === 'In progress')?.number || 1}:{' '}
                    {activeCourse.modules.find(m => m.status === 'In progress')?.title}
                  </span>.
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
                      Continue with: <span className="text-text font-medium">Variables, Data Types & Operators</span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveCourseId(activeCourse.id);
                        onNavigate('content-player');
                      }}
                      className="bg-cyan hover:bg-cyan2 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>OPEN LEARNING PATH</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Enrolled Courses Grid: Alternating Step Design */}
              <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-2xl font-bold tracking-tight">Your Courses</h3>
                  <button 
                    onClick={() => onNavigate('catalog')}
                    className="text-cyan hover:text-cyan2 text-sm font-bold flex items-center space-x-1 transition-colors"
                  >
                    <span>Show all</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {enrolledCourses.map((course, index) => {
                    const stepNumber = (index + 1).toString().padStart(2, '0');
                    const isEven = index % 2 !== 0;
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

                    return (
                      <div key={course.id} className={`flex flex-col md:items-stretch gap-0 md:gap-4 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                        {/* Course Icon Step / Mobile Badge Header */}
                        <div className={`relative w-full md:w-32 flex flex-row md:flex-col items-center justify-between md:justify-center px-6 py-4 md:p-4 bg-${color} rounded-t-2xl md:rounded-2xl shadow-xl z-20 flex-shrink-0`}>
                          <div className="flex items-center md:flex-col md:items-center">
                            <div className="mr-4 md:mr-0 md:mb-3">
                              {getCourseIcon(course.title)}
                            </div>
                            <span className="text-[11px] md:text-sm font-black text-bg/90 uppercase tracking-[0.25em]">
                              MODULE
                            </span>
                          </div>
                          
                          <div className="md:hidden">
                             <div className="text-[14px] font-black text-bg/90 px-3 py-1 rounded-full bg-bg/20 border border-bg/30">
                               {stepNumber}
                             </div>
                          </div>
                          
                          {/* Triangle Pointer: Hidden on mobile, visible on desktop */}
                          <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-${color} rotate-45 ${isEven ? '-left-1' : '-right-1'} -z-10`} />
                        </div>

                        {/* Content Box */}
                        <div className="flex-1 bg-panel border border-line rounded-b-2xl md:rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:bg-panel2 transition-all group overflow-hidden">
                          <div className="space-y-2">
                            <h4 className="font-bold text-lg text-text group-hover:text-cyan transition-colors">{course.title}</h4>
                            <p className="text-muted text-sm line-clamp-2 md:line-clamp-3 leading-relaxed">{course.description}</p>
                          </div>
                          
                          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 w-full max-w-xs space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-bg rounded-full overflow-hidden border border-line/30">
                                <div 
                                  className={`h-full bg-${color} transition-all duration-1000`} 
                                  style={{ width: `${course.progress}%` }} 
                                />
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => {
                                setActiveCourseId(course.id);
                                onNavigate('learning-path');
                              }}
                              className={`w-full sm:w-auto bg-${color} hover:brightness-110 text-bg text-xs font-black px-8 py-3 rounded-xl transition-all active:scale-95 shadow-md uppercase tracking-wider`}
                            >
                              {course.progress === 100 ? 'Review' : 'Continue'}
                            </button>
                          </div>
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
          
          {/* Toast Notification & Swipe Gesture Dev Sandbox */}
          <div className="bg-panel border border-line rounded-2xl p-5 space-y-4 mt-6">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center space-x-2">
                <span>🛠️ Developer Toast & Gesture Sandbox</span>
              </h3>
              <p className="text-[11px] text-muted mt-1">
                Test gamified toast notifications, stacking bounds, and mobile gestures.
                On desktop, toasts slide in bottom-right. On mobile, they slide in top-center.
                Swipe left or right on a phone screen to dismiss them dynamically.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  addToast('xp', '+25 XP — Quiz answered correctly');
                  setTimeout(() => addToast('success', '✓ File uploaded'), 300);
                  setTimeout(() => addToast('info', 'Your session will expire in 10 minutes'), 600);
                }}
                className="bg-cyan hover:bg-cyan2 text-bg font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Fire Staggered Toasts (Max 3)
              </button>
              <button
                onClick={() => {
                  addToast('error', 'Something went wrong, please try again', () => {
                    addToast('success', '✓ Retry successful!');
                  });
                }}
                className="bg-red/15 hover:bg-red/25 text-red font-bold text-xs px-4 py-2.5 rounded-xl border border-red/30 transition-colors cursor-pointer"
              >
                Fire Error with Retry
              </button>
              <button
                onClick={() => {
                  addToast('xp', '+10 XP — Fast read completion');
                }}
                className="bg-bg hover:bg-line border border-line text-text font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Fire Single XP
              </button>
            </div>
          </div>

      {/* Modal System Showcase */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan" />
          <h2 className="text-xl font-bold font-display">Modal System Showcase</h2>
        </div>
        <p className="text-muted text-sm">
          Experience the high-fidelity modal overlay system with focus trapping, responsive design, and premium animations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => openModal('confirmation', {
              title: 'Reset Progress?',
              description: 'This action is irreversible. All your module progress and quiz scores will be permanently deleted.',
              props: {
                onConfirm: () => console.log('Reset confirmed'),
                confirmText: 'Yes, Reset All',
                variant: 'danger'
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-red/10 border border-red/20 rounded-xl hover:bg-red/20 transition-all group"
          >
            <AlertCircle className="w-8 h-8 text-red mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-red">Confirmation</span>
          </button>

          <button
            onClick={() => openModal('form', {
              title: 'Add Learning Note',
              props: {
                onSubmit: (data: unknown) => console.log('Form submitted', data),
                children: (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted">Topic</label>
                      <input 
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-text focus:border-cyan outline-none transition-all" 
                        placeholder="e.g. Asynchronous Python"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted">Note</label>
                      <textarea 
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-text focus:border-cyan outline-none transition-all min-h-[120px]" 
                        placeholder="What did you learn today?"
                      />
                    </div>
                  </div>
                )
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-cyan/10 border border-cyan/20 rounded-xl hover:bg-cyan/20 transition-all group"
          >
            <BookOpen className="w-8 h-8 text-cyan mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-cyan">Form Entry</span>
          </button>

          <button
            onClick={() => openModal('celebration', {
              title: 'New Rank: Alchemist!',
              description: 'You have mastered the fundamental transformations of code.',
              props: {
                achievementName: 'Master of Reactivity',
                points: 500
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-yellow/10 border border-yellow/20 rounded-xl hover:bg-yellow/20 transition-all group"
          >
            <Award className="w-8 h-8 text-yellow mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-yellow">Celebration</span>
          </button>

          <button
            onClick={() => openModal('quiz', {
              props: {
                questions: [
                  { 
                    id: 1, 
                    text: 'Which hook should be used for side effects in React?', 
                    options: ['useState', 'useEffect', 'useContext', 'useReducer'] 
                  },
                  { 
                    id: 2, 
                    text: 'What is the purpose of React.memo()?', 
                    options: ['State management', 'Routing', 'Performance optimization', 'Styling'] 
                  }
                ],
                onComplete: (answers: unknown) => console.log('Quiz complete', answers)
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-purple/10 border border-purple/20 rounded-xl hover:bg-purple/20 transition-all group"
          >
            <Sparkles className="w-8 h-8 text-purple mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-purple">Multi-step Quiz</span>
          </button>
        </div>
        </div>
      </div>
      )}
    </div>
  );
};
