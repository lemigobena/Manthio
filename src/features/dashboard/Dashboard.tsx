import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { COURSES } from '../../services/mockData';
import { useModal } from '../../context/ModalContext';
import { Play, Flame, Award, BookOpen, AlertCircle, ArrowRight, Sparkles, RefreshCw, X } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, setActiveCourseId, isOnboardingSkipped, resetOnboarding, onboardingAnswers } = useAuth();
  const { level, streak, xp, addToast } = useXP();

  // Progress Sync States (REQ-LOAD-003)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState('');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Page Mount Loading State (REQ-LOAD-002)
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  // Clear timers and handle mount load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 850);
    return () => {
      clearTimeout(timer);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const handleStartSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStep('Connecting to sync service...');

    syncIntervalRef.current = setInterval(() => {
      setSyncProgress(prev => {
        const next = prev + 2.5;
        if (next >= 100) {
          if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
          setIsSyncing(false);
          addToast('success', '✓ Offline sync completed successfully');
          return 100;
        }

        // Update step messaging dynamically based on progress percent
        if (next < 25) {
          setSyncStep('Downloading modules database structure...');
        } else if (next < 55) {
          setSyncStep('Caching video lessons & exercises...');
        } else if (next < 85) {
          setSyncStep('Downloading interactive quiz templates...');
        } else {
          setSyncStep('Finalizing local cache storage compilation...');
        }

        return next;
      });
    }, 100); // 100 ticks of 100ms = 4 seconds total duration (satisfies > 3 seconds requirement)
  };

  const handleCancelSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    setIsSyncing(false);
    setSyncProgress(0);
    setSyncStep('');
    addToast('info', 'Sync operation cancelled by user');
  };
  const { openModal } = useModal();

  // Find enrolled courses
  const enrolledCourses = COURSES.filter(c => c.enrolled);
  const activeCourse = COURSES.find(c => c.id === 'python-bootcamp');

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
          <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-cyan/10 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  {getGreeting()}, {user?.name.split(' ')[0]} 👋
                </h1>
              </div>
              {activeCourse && (
                <p className="text-muted text-sm md:text-base">
                  You are currently learning <span className="text-cyan font-semibold">{activeCourse.title}</span>. Active module:{' '}
                  <span className="text-text font-semibold">
                    Module {activeCourse.modules.find(m => m.status === 'In progress')?.number || 1}:{' '}
                    {activeCourse.modules.find(m => m.status === 'In progress')?.title}
                  </span>.
                </p>
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
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <button 
                  onClick={() => onNavigate('analytics')}
                  className="bg-bg border border-line p-4 rounded-xl text-left hover:border-cyan transition-colors"
                >
                  <div className="flex items-center justify-between text-muted mb-1 text-xs">
                    <span>LEVEL</span>
                    <Award className="w-4 h-4 text-cyan" />
                  </div>
                  <div className="text-xl font-bold">{level}</div>
                  <span className="text-xs text-muted">Level 42 Explorer</span>
                </button>
                <div className="bg-bg border border-line p-4 rounded-xl text-left">
                  <div className="flex items-center justify-between text-muted mb-1 text-xs">
                    <span>STREAK</span>
                    <Flame className="w-4 h-4 text-yellow" />
                  </div>
                  <div className="text-xl font-bold">{streak} Days</div>
                  <span className="text-xs text-muted">Record: 15 Days</span>
                </div>
                <button 
                  onClick={() => onNavigate('analytics')}
                  className="bg-bg border border-line p-4 rounded-xl text-left hover:border-cyan transition-colors"
                >
                  <div className="flex items-center justify-between text-muted mb-1 text-xs">
                    <span>TOTAL XP</span>
                    <Sparkles className="w-4 h-4 text-purple" />
                  </div>
                  <div className="text-xl font-bold">{xp.toLocaleString()}</div>
                  <span className="text-xs text-muted">Next level in {10000 - (xp % 10000)} XP</span>
                </button>
                <button 
                  onClick={() => onNavigate('learning-path')}
                  className="bg-bg border border-line p-4 rounded-xl text-left hover:border-cyan transition-colors"
                >
                  <div className="flex items-center justify-between text-muted mb-1 text-xs">
                    <span>MODULE</span>
                    <BookOpen className="w-4 h-4 text-green" />
                  </div>
                  <div className="text-xl font-bold">2/10</div>
                  <span className="text-xs text-muted">Completed</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Courses & Activity) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Course Card (Continue Learning CTA) */}
              {activeCourse && (
                <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-orange/20 text-orange border border-orange/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        Active Course
                      </span>
                      <h2 className="text-xl font-bold mt-2">{activeCourse.title}</h2>
                      <p className="text-muted text-sm mt-1">{activeCourse.description}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-line flex items-center justify-center relative">
                      <div className="text-sm font-bold">{activeCourse.progress}%</div>
                      {/* Simplistic visual circular border representation */}
                      <svg className="absolute -inset-1 w-18 h-18 rotate-[-90deg]">
                        <circle 
                          cx="36" cy="36" r="30" 
                          fill="none" 
                          stroke="var(--cyan)" 
                          strokeWidth="4" 
                          strokeDasharray={`${2 * Math.PI * 30}`} 
                          strokeDashoffset={`${2 * Math.PI * 30 * (1 - activeCourse.progress / 100)}`}
                          className="transition-all duration-500"
                        />
                      </svg>
                    </div>
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

              {/* Enrolled Courses Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Your Courses</h3>
                  <button 
                    onClick={() => onNavigate('catalog')}
                    className="text-cyan hover:text-cyan2 text-sm font-semibold flex items-center space-x-1"
                  >
                    <span>Show all</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between hover:border-cyan/50 transition-colors">
                      <div>
                        <span className="text-[10px] text-muted font-bold tracking-wider uppercase bg-bg px-2 py-0.5 rounded border border-line">
                          {course.level}
                        </span>
                        <h4 className="font-bold text-base mt-2 text-text">{course.title}</h4>
                        <p className="text-muted text-xs line-clamp-2 mt-1">{course.description}</p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-bg rounded-full overflow-hidden">
                            <div className="h-full bg-cyan" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-muted">{course.progress}%</span>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setActiveCourseId(course.id);
                            onNavigate('learning-path');
                          }}
                          className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Community Events, Recommendations, and Weak Points) */}
            <div className="space-y-6">
              
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

              {/* AI Tutor Recommendations */}
              <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted">AI Tutor Recommendations</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-bg border border-line rounded-lg p-3 text-xs space-y-2">
                    <span className="text-[10px] bg-cyan/15 text-cyan px-2 py-0.5 rounded font-semibold">Current Module</span>
                    <p className="font-medium text-text">Practice now: OOP Concepts • 10 min</p>
                    <p className="text-muted">Based on your learning path: "Classes and Objects in Python"</p>
                  </div>
                  <div className="bg-bg border border-line rounded-lg p-3 text-xs space-y-2">
                    <span className="text-[10px] bg-purple/15 text-purple px-2 py-0.5 rounded font-semibold">Weak Points</span>
                    <p className="font-medium text-text">Review: Recursion Quiz • 8 min</p>
                    <p className="text-muted">Close your knowledge gap with recursive function calls.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('ai-tutor')}
                  className="w-full bg-bg hover:bg-line border border-line hover:border-cyan text-text text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Talk to AI Tutor
                </button>
              </div>

              {/* My Weaknesses */}
              <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted">My Weak Points</h3>
                  </div>
                  <span className="bg-yellow/20 text-yellow text-[10px] px-2 py-0.5 rounded font-bold">3 Gaps</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['OOP Concepts', 'Recursion', 'List Comprehensions'].map((weakness, idx) => (
                    <span key={idx} className="bg-bg border border-line text-xs px-3 py-1.5 rounded-lg text-text flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red" />
                      <span>{weakness}</span>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2 pt-2">
                  <button 
                    onClick={() => onNavigate('analytics')}
                    className="flex-1 bg-bg hover:bg-line border border-line text-xs font-semibold py-2 rounded-lg text-center"
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => onNavigate('ai-tutor')}
                    className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-xs font-semibold py-2 rounded-lg text-center"
                  >
                    Analyze
                  </button>
                </div>
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
