import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { COURSES } from '../../services/mockData';
import { 
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  User,
  Sun,
  Moon
} from 'lucide-react';

interface OnboardingProps {
  onNavigate: (page: string) => void;
}

// Generate an Initials Avatar URL using the well-known ui-avatars.com service
const generateInitialsAvatar = (name: string, isLight: boolean): string => {
  const bg = isLight ? 'FAF6EE' : '0D1117';
  const color = isLight ? '0D7D6E' : '00F5D4';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${color}&size=128&bold=true`;
};

export const Onboarding: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const { 
    user, 
    completeOnboarding, 
    skipOnboarding, 
    setActiveCourseId,
    updateProfile 
  } = useAuth();
  const { addXp, addToast } = useXP();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem('onboarding_current_step');
    return saved ? parseInt(saved, 10) : 0;
  });



  // Step 2 inputs
  const [reason, setReason] = useState<string>(() => {
    return localStorage.getItem('onboarding_reason') || '';
  });
  const [timeCommitment, setTimeCommitment] = useState<string>(() => {
    return localStorage.getItem('onboarding_time_commitment') || '';
  });

  // Step 3 inputs
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('onboarding_avatar') || user?.avatar || '';
  });

  const [prevTheme, setPrevTheme] = useState(theme);
  if (theme !== prevTheme && avatar && avatar.startsWith('https://ui-avatars.com/api/') && user) {
    setPrevTheme(theme);
    const initialsDataUrl = generateInitialsAvatar(user.name, theme === 'light');
    if (avatar !== initialsDataUrl) {
      setAvatar(initialsDataUrl);
    }
  }

  // Step 4 recommended courses selection
  const [selectedCourseId, setSelectedCourseId] = useState<string>('python-bootcamp');

  // Carousel active index (Step 1)
  const [activeIndex, setActiveIndex] = useState<number>(0);



  // Swipe state for Video Slider
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      setSwipeStartX(e.touches[0].clientX);
    } else {
      setSwipeStartX(e.clientX);
    }
  };

  const handleSwipeEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (swipeStartX === null) return;
    
    const endX = 'changedTouches' in e 
      ? e.changedTouches[0].clientX 
      : (e as React.MouseEvent).clientX;

    const diff = swipeStartX - endX;
    
    // threshold for swipe
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left -> next slide
        if (activeIndex < 5) {
          setActiveIndex(prev => prev + 1);
        }
      } else {
        // Swiped right -> previous slide
        if (activeIndex > 0) {
          setActiveIndex(prev => prev - 1);
        }
      }
    }
    
    setSwipeStartX(null);
  };

  // Wheel state for Video Slider
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    // Only process dominant horizontal scrolling with a threshold
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      if (wheelTimeoutRef.current) return; // Ignore if in cooldown
      
      if (e.deltaX > 0) {
        // Scrolled right -> next slide
        if (activeIndex < 5) {
          setActiveIndex(prev => prev + 1);
        }
      } else {
        // Scrolled left -> previous slide
        if (activeIndex > 0) {
          setActiveIndex(prev => prev - 1);
        }
      }
      
      // Cooldown to prevent runaway scrolling
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    }
  };

  // Sync state changes to local storage for REQ-ONBOARD-003
  useEffect(() => {
    localStorage.setItem('onboarding_current_step', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('onboarding_reason', reason);
  }, [reason]);

  useEffect(() => {
    localStorage.setItem('onboarding_time_commitment', timeCommitment);
  }, [timeCommitment]);

  useEffect(() => {
    localStorage.setItem('onboarding_avatar', avatar);
  }, [avatar]);



  // Recommendations mapping based on step 2 choices
  const getRecommendedCourses = () => {
    if (reason === 'Career Change / Professional Development' || reason === 'Assigned by my employer') {
      return COURSES.filter(c => ['python-bootcamp', 'sql-databases', 'git-essentials'].includes(c.id));
    }
    if (reason === 'Building a specific skill') {
      return COURSES.filter(c => ['react-web-development', 'api-design-fastapi', 'sql-databases'].includes(c.id));
    }
    // Default or curiosity
    return COURSES.filter(c => ['ai-fundamentals', 'command-line-basics', 'markdown-developers'].includes(c.id));
  };

  const recommendedCourses = getRecommendedCourses();

  // Set default selection when course recommendations update
  const [prevReason, setPrevReason] = useState(reason);
  if (reason !== prevReason) {
    setPrevReason(reason);
    if (recommendedCourses.length > 0 && selectedCourseId !== recommendedCourses[0].id) {
      setSelectedCourseId(recommendedCourses[0].id);
    }
  }

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSkipStep = () => {
    if (step === 2) {
      setReason('Curiosity');
    }
    if (step === 3) {
      setTimeCommitment('2-5 Hrs');
    }
    if (step === 4) {
      // Leave avatar as default
      setAvatar(user?.avatar || '');
    }
    nextStep();
  };

  const handleSkipOnboarding = () => {
    skipOnboarding();
    addToast('info', 'Onboarding skipped. You can complete your profile later from settings.');
    onNavigate('dashboard');
  };

  const handleStartSelectedCourse = () => {
    const courseToStart = COURSES.find(c => c.id === selectedCourseId);
    if (courseToStart) {
      courseToStart.enrolled = true;
      setActiveCourseId(courseToStart.id);
    }
    if (user && avatar && avatar !== user.avatar) {
      updateProfile(user.name, user.bio, avatar);
    }
    completeOnboarding({ reason: reason || 'Curiosity', timePerWeek: timeCommitment || '2-5 Hrs' });
    addXp(150, 'Completed first-time onboarding (+150 XP)');
    addToast('success', `Enrolled in ${courseToStart?.title || 'Course'}! Welcome to Manthio.`);
    onNavigate('dashboard');
  };

  const handleBrowseCatalog = () => {
    if (user && avatar && avatar !== user.avatar) {
      updateProfile(user.name, user.bio, avatar);
    }
    completeOnboarding({ reason: reason || 'Curiosity', timePerWeek: timeCommitment || '2-5 Hrs' });
    onNavigate('catalog');
  };

  // Read upload image file
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateInitials = () => {
    if (user) {
      const initialsDataUrl = generateInitialsAvatar(user.name, theme === 'light');
      setAvatar(initialsDataUrl);
    }
  };

  // Video player slide text helper
  const renderSlideDetails = () => {
    const slides = [
      {
        title: 'Flipped Classroom Philosophy',
        description: 'Learn the core theoretical concepts at your own pace through rich videos and documents. Live trainer hours are reserved exclusively for hands-on application and interactive pair debugging.',
        badge: '01. THE METHOD'
      },
      {
        title: 'Personalized AI Tutor Guidance',
        description: 'An AI-powered tutor trained directly on official course specifications. Ask questions 24/7, get instant code feedback, and resolve learning obstacles without waiting.',
        badge: '02. INTELLIGENT HELP'
      },
      {
        title: 'Interactive Web REPL',
        description: 'Practice directly inside the browser using our playground. Compile scripts, solve coding puzzles, and complete mock tasks that get instantly graded by the grading engine.',
        badge: '03. CONSOLE EXPERIENCE'
      },
      {
        title: 'XP Levels & Streak Bonuses',
        description: 'Collect Experience Points (XP) for everything you achieve. Build a daily coding streak, level up your developer profile, and stay motivated on your path.',
        badge: '04. ENGAGEMENT SYSTEM'
      },
      {
        title: 'Certificates & Employer Sync',
        description: 'Earn official course completion certificates verified on the blockchain. Sync your training logs with your employer portal to demonstrate progress and request sponsorships.',
        badge: '05. CERTIFICATION'
      },
      {
        title: 'Community Forums & Live Events',
        description: 'Connect with other learners, form peer coding study circles, participate in weekly Q&A workshops with certified trainers, and collaborate on real-world projects.',
        badge: '06. NETWORK'
      }
    ];
    return slides[activeIndex] || slides[0];
  };

  const activeSlide = renderSlideDetails();

  const mockups = [
    <video src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4" className="w-full h-full object-cover rounded-[32px] bg-black" controls playsInline />,
    <video src="https://assets.mixkit.co/videos/preview/mixkit-hacker-working-in-a-dark-room-428-large.mp4" className="w-full h-full object-cover rounded-[32px] bg-black" controls playsInline />,
    <video src="https://assets.mixkit.co/videos/preview/mixkit-man-typing-on-his-computer-keyboard-172-large.mp4" className="w-full h-full object-cover rounded-[32px] bg-black" controls playsInline />,
    <video src="https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-225-large.mp4" className="w-full h-full object-cover rounded-[32px] bg-black" controls playsInline />,
    <video src="https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-laptop-while-sitting-in-office-427-large.mp4" className="w-full h-full object-cover rounded-[32px] bg-black" controls playsInline />,
    <video src="https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-close-up-165-large.mp4" className="w-full h-full object-cover rounded-[32px] bg-black" controls playsInline />
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      
      {/* Header bar with global skip */}
      {step > 0 && (
        <div className="flex items-center justify-between border-b border-line pb-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="space-y-1">
            <span className="text-cyan font-black text-sm uppercase tracking-widest font-display">MANTHIO</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-cyan' : s < step ? 'w-4 bg-cyan/50' : 'w-4 bg-line'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* REQ-ONBOARD-001 / REQ-ONBOARD-002: Global Onboarding Skip Button & Theme Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkipOnboarding}
              className="text-xs font-semibold text-muted hover:text-cyan border border-line hover:border-cyan px-3 py-1.5 rounded-xl transition-all cursor-pointer bg-bg/50"
            >
              Skip Onboarding
            </button>
            <button 
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text hover:border-cyan transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to light design' : 'Switch to dark design'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Form Container with Glassmorphism / Shadow Panel */}
      <div className={`relative overflow-hidden ${step === 0 ? '' : step === 1 ? 'py-2' : 'bg-panel border border-line rounded-3xl p-5 md:p-6 shadow-2xl'}`}>
        
        {step === 0 && (
          <div className="relative h-[calc(100vh-2rem)] flex flex-col items-center justify-between py-4 overflow-hidden">
            {/* Floating Theme Toggle in Top Right of Step 0 Splash Screen */}
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-panel border border-line text-muted hover:text-text hover:border-cyan transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Switch to light design' : 'Switch to dark design'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Background glowing gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--cyan)_0%,transparent_60%)] opacity-[0.08] dark:opacity-[0.04] pointer-events-none" />
            
            {/* Logo viewport */}
            <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center py-8 select-none">
              <style>{`
                @keyframes buttonEntrance {
                  0% { transform: translateY(20px); opacity: 0; }
                  100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes logoPulseRipple {
                  0% { opacity: 0.1; filter: drop-shadow(0 0 0 rgba(0, 255, 255, 0)); transform: scale(0.98); }
                  50% { opacity: 1; filter: drop-shadow(0 0 40px rgba(0, 255, 255, 0.5)); transform: scale(1.02); }
                  100% { opacity: 0.1; filter: drop-shadow(0 0 0 rgba(0, 255, 255, 0)); transform: scale(0.98); }
                }
                @keyframes shine {
                  0% { background-position: -200% -200%; }
                  100% { background-position: 200% 200%; }
                }
                .anim-logo-pulse { animation: logoPulseRipple 4s ease-in-out infinite; }
                .anim-shine { animation: shine 4s infinite linear, logoPulseRipple 4s ease-in-out infinite; }
                .anim-button-entrance { animation: buttonEntrance 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.5s both; }
                .anim-skip-entrance { animation: buttonEntrance 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.8s both; }
              `}</style>
              <div className="relative w-[540px] md:w-[720px] lg:w-[960px] h-auto flex items-center justify-center">
                <img
                  src="/Branding/primary/logo_7_prio_1_variation.png"
                  alt="Manthio Logo"
                  className="w-full h-auto object-contain anim-logo-pulse pointer-events-none select-none"
                />
                {/* Inclined Swiper Shine Effect */}
                <div 
                  className="absolute inset-0 w-full h-full pointer-events-none anim-shine"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 70%)',
                    backgroundSize: '300% 300%',
                    mixBlendMode: 'overlay',
                    maskImage: 'url(/Branding/primary/logo_7_prio_1_variation.png)',
                    WebkitMaskImage: 'url(/Branding/primary/logo_7_prio_1_variation.png)',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat'
                  }}
                />
              </div>
            </div>

            {/* Subtitle and Controls Group */}
            <div className="w-full flex flex-col items-center space-y-6 relative z-20 pb-8">
              <p className="text-muted text-sm md:text-base lg:text-lg font-bold tracking-[0.25em] uppercase max-w-lg anim-button-entrance text-center">
                Interactive Peer-to-Peer Study Hub
              </p>

              <div className="anim-button-entrance">
                <button
                  onClick={() => setStep(1)}
                  className="bg-cyan hover:bg-cyan2 text-bg font-bold px-10 py-4.5 rounded-2xl transition-all cursor-pointer flex items-center space-x-3 text-base md:text-lg hover:scale-105 active:scale-95 shadow-lg shadow-cyan/15 hover:shadow-cyan/25 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 text-bg group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="anim-skip-entrance">
                <button
                  onClick={handleSkipOnboarding}
                  className="text-sm font-semibold text-muted hover:text-cyan hover:underline transition-all cursor-pointer bg-transparent border-none"
                >
                  Skip and go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Welcome & Video Slider */}
        {step === 1 && (
          <>
            {/* Background SVG Watermark */}
            <div className="absolute -right-6 -bottom-6 w-80 h-80 pointer-events-none opacity-[0.08] dark:opacity-[0.04] z-0 select-none">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                  }
                  @keyframes pulse-glow {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.7; }
                  }
                  @keyframes rotate-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  .anim-float { animation: float 3s ease-in-out infinite; }
                  .anim-float-delayed { animation: float 3s ease-in-out infinite; animation-delay: 1.5s; }
                  .anim-pulse { animation: pulse-glow 2s ease-in-out infinite; }
                  .anim-rotate { animation: rotate-slow 20s linear infinite; transform-origin: 100px 100px; }
                `}</style>
                <circle cx="100" cy="100" r="70" fill="none" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="4 4" className="anim-rotate" />
                <g className="anim-float">
                  <rect x="60" y="80" width="80" height="50" rx="4" fill="var(--panel)" stroke="var(--line)" stroke-width="2" />
                  <rect x="66" y="86" width="68" height="38" rx="2" fill="var(--bg)" />
                  <line x1="72" y1="94" x2="100" y2="94" stroke="var(--cyan)" stroke-width="2.5" stroke-linecap="round" />
                  <line x1="72" y1="102" x2="114" y2="102" stroke="var(--purple)" stroke-width="2.5" stroke-linecap="round" />
                  <line x1="72" y1="110" x2="90" y2="110" stroke="var(--yellow)" stroke-width="2.5" stroke-linecap="round" />
                  <path d="M50,130 L150,130 L160,136 L40,136 Z" fill="var(--panel)" stroke="var(--line)" stroke-width="2" stroke-linejoin="round" />
                  <line x1="90" y1="133" x2="110" y2="133" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" />
                </g>
                <g className="anim-float-delayed" transform="translate(140, 60)">
                  <circle cx="10" cy="10" r="14" fill="var(--purple)" opacity="0.15" className="anim-pulse" />
                  <path d="M10,2 L12,8 L18,10 L12,12 L10,18 L8,12 L2,10 L8,8 Z" fill="var(--purple)" />
                </g>
                <g className="anim-float" transform="translate(35, 50)">
                  <circle cx="15" cy="15" r="18" fill="var(--cyan)" opacity="0.15" className="anim-pulse" />
                  <path d="M5,10 C5,7 8,5 12,5 C16,5 19,7 19,10 C19,13 16,15 12,15 L9,18 L9,15 C6.5,14.5 5,12.5 5,10 Z" fill="var(--cyan)" />
                </g>
                <g className="anim-float-delayed" transform="translate(100, 25)">
                  <circle cx="10" cy="10" r="12" fill="var(--yellow)" opacity="0.15" className="anim-pulse" />
                  <path d="M10,3 L12.5,8 L18,8.5 L14,12 L15.5,17.5 L10,14.5 L4.5,17.5 L6,12 L2,8.5 L7.5,8 Z" fill="var(--yellow)" />
                </g>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center py-4 w-full max-w-sm md:max-w-2xl lg:max-w-5xl mx-auto">
              
              <div className="text-center space-y-2 mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-text uppercase tracking-tight">
                  {activeSlide.title}
                </h1>
                <p className="text-muted text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
                  {activeSlide.description}
                </p>
              </div>

              {/* Carousel */}
              <div 
                className="relative w-full overflow-hidden py-2 cursor-grab active:cursor-grabbing mb-4 carousel-container"
                onMouseDown={handleSwipeStart}
                onMouseUp={handleSwipeEnd}
                onMouseLeave={handleSwipeEnd}
                onTouchStart={handleSwipeStart}
                onTouchEnd={handleSwipeEnd}
              >
                <style>{`
                  .carousel-container {
                    --card-width: 280px;
                    --card-height: 480px;
                    --card-gap: 16px;
                  }
                  @media (min-width: 768px) {
                    .carousel-container {
                      --card-width: 560px;
                      --card-height: 380px;
                      --card-gap: 24px;
                    }
                  }
                  @media (min-width: 1024px) {
                    .carousel-container {
                      --card-width: 640px;
                      --card-height: 440px;
                      --card-gap: 32px;
                    }
                  }
                `}</style>
                <div 
                  className="flex items-center transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(calc(50% - calc(var(--card-width) * ${activeIndex}) - calc(var(--card-gap) * ${activeIndex}) - calc(var(--card-width) / 2)))` }} 
                  onWheel={handleWheel}
                >
                  {mockups.map((Mockup, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <div 
                        key={idx} 
                        className={`shrink-0 rounded-[32px] transition-all duration-500 flex flex-col select-none overflow-hidden ${
                          isActive 
                            ? 'scale-100 opacity-100 bg-bg border-2 border-cyan/30 shadow-2xl shadow-cyan/10 pointer-events-auto' 
                            : 'scale-[0.85] opacity-40 bg-bg/50 border border-line grayscale-[50%] pointer-events-none'
                        }`}
                        style={{ 
                          width: 'var(--card-width)', 
                          height: 'var(--card-height)', 
                          marginRight: idx === 5 ? 0 : 'var(--card-gap)' 
                        }}
                      >
                        <div className="relative z-10 w-full h-full">
                          {Mockup}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center space-x-2 mb-4">
                {[0,1,2,3,4,5].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex ? 'w-6 bg-text' : 'w-2 bg-line hover:bg-text/50'
                    }`}
                  />
                ))}
              </div>

              {/* Button & Skip Step */}
              <div className="flex flex-col items-center space-y-2 w-full">
                <button
                  onClick={() => {
                    if (activeIndex < 5) {
                      setActiveIndex(prev => prev + 1);
                    } else {
                      nextStep();
                    }
                  }}
                  className="bg-text text-bg font-bold px-10 py-4.5 rounded-full transition-all cursor-pointer flex items-center space-x-2 text-base md:text-lg hover:scale-105 active:scale-95 shadow-lg w-full justify-center max-w-[320px]"
                >
                  <span>{activeIndex === 5 ? 'Continue to Goals' : 'Continue'}</span>
                  {activeIndex < 5 ? (
                    <ChevronRight className="w-5 h-5 text-bg" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-bg" />
                  )}
                </button>

                <button
                  onClick={nextStep}
                  className="text-sm font-semibold text-muted hover:text-cyan transition-all cursor-pointer bg-transparent border-none hover:underline"
                >
                  Skip Videos
                </button>
              </div>

            </div>
        </>
        )}

        {/* Step 2 — Goals */}
        {step === 2 && (
          <>
            {/* Background SVG Watermark */}
            <div className="absolute -right-6 -bottom-6 w-80 h-80 pointer-events-none opacity-[0.08] dark:opacity-[0.04] z-0 select-none">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes target-pulse {
                    0%, 100% { transform: scale(0.97); }
                    50% { transform: scale(1.03); }
                  }
                  @keyframes draw-line {
                    from { stroke-dashoffset: 200; }
                    to { stroke-dashoffset: 0; }
                  }
                  .anim-target { animation: target-pulse 3s ease-in-out infinite; transform-origin: 100px 100px; }
                  .anim-path { stroke-dasharray: 200; stroke-dashoffset: 200; animation: draw-line 2.5s ease-out forwards; }
                `}</style>
                <circle cx="100" cy="100" r="60" fill="var(--cyan)" opacity="0.03" />
                <g className="anim-target">
                  <circle cx="100" cy="100" r="45" fill="none" stroke="var(--line)" stroke-width="3" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="var(--line)" stroke-width="2" />
                  <circle cx="100" cy="100" r="15" fill="var(--cyan)" opacity="0.15" stroke="var(--cyan)" stroke-width="1.5" />
                  <circle cx="100" cy="100" r="6" fill="var(--cyan)" />
                </g>
                <g transform="translate(130, 60) rotate(-45)">
                  <line x1="0" y1="0" x2="60" y2="0" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round" />
                  <polygon points="0,0 -8,-4 -5,0 -8,4" fill="var(--text)" />
                  <path d="M50,-5 L60,-5 L56,0 L60,5 L50,5 Z" fill="var(--muted)" />
                </g>
                <path d="M30,160 Q70,140 100,100 T170,40" fill="none" stroke="var(--cyan)" stroke-width="3" stroke-linecap="round" className="anim-path" />
                <circle cx="170" cy="40" r="5" fill="var(--cyan)" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="text-left space-y-1 border-b border-line pb-3">
                <h2 className="text-2xl md:text-3xl font-black text-text font-display uppercase">STEP 2 — WHAT ARE YOUR GOALS?</h2>
                <p className="text-muted text-sm md:text-base">
                  Your selections will customize your dashboard prompts and optimize your AI Tutor's responses.
                </p>
              </div>

            <div className="space-y-4">
              {/* Motivation Question */}
              <div className="space-y-2">
                <label className="text-xs text-muted font-bold uppercase tracking-wider block px-1">What brings you to Manthio?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'Career growth', label: 'Career Growth', desc: 'Transitioning roles or professional development.' },
                    { id: 'Specific skill', label: 'Specific Skill', desc: 'Focusing on mastering one programming stack.' },
                    { id: 'Curiosity', label: 'Curiosity', desc: 'Exploring and coding for personal interest.' },
                    { id: 'Employer assigned', label: 'Employer Assigned', desc: 'Required as part of corporate training.' }
                  ].map(opt => {
                    const isSelected = reason === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setReason(opt.id)}
                        className={`text-left p-6 min-h-[110px] md:min-h-[120px] rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          isSelected ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-cyan bg-cyan' : 'border-muted'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-bg stroke-[3px]" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm md:text-base text-text">{opt.label}</h4>
                          <p className="text-xs md:text-sm text-muted leading-relaxed">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-line mt-4">
              <button
                onClick={prevStep}
                className="text-sm font-bold text-muted hover:text-text px-4 py-2.5 rounded-xl border border-line hover:border-muted flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSkipStep}
                  className="text-sm font-semibold text-muted hover:text-cyan border border-transparent hover:border-line px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Skip Step
                </button>
                <button
                  onClick={nextStep}
                  disabled={!reason}
                  className={`font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 text-sm md:text-base hover:scale-105 active:scale-95 shadow-lg ${
                    (!reason) 
                      ? 'bg-line text-muted cursor-not-allowed opacity-50 shadow-none' 
                      : 'bg-cyan hover:bg-cyan2 text-bg shadow-cyan/15'
                  }`}
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Step 3 — Time Commitment */}
        {step === 3 && (
          <>
            {/* Background SVG Watermark */}
            <div className="absolute -right-6 -bottom-6 w-80 h-80 pointer-events-none opacity-[0.08] dark:opacity-[0.04] z-0 select-none">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes target-pulse {
                    0%, 100% { transform: scale(0.97); }
                    50% { transform: scale(1.03); }
                  }
                  .anim-target { animation: target-pulse 3s ease-in-out infinite; transform-origin: 100px 100px; }
                `}</style>
                <circle cx="100" cy="100" r="60" fill="var(--cyan)" opacity="0.03" />
                <g className="anim-target">
                  <circle cx="100" cy="100" r="45" fill="none" stroke="var(--line)" stroke-width="3" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="var(--line)" stroke-width="2" />
                  <circle cx="100" cy="100" r="15" fill="var(--cyan)" opacity="0.15" stroke="var(--cyan)" stroke-width="1.5" />
                  <circle cx="100" cy="100" r="6" fill="var(--cyan)" />
                </g>
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="text-left space-y-1 border-b border-line pb-3">
                <h2 className="text-2xl md:text-3xl font-black text-text font-display uppercase">STEP 3 — TIME COMMITMENT</h2>
                <p className="text-muted text-sm md:text-base">
                  We'll adapt your learning path based on how much time you have.
                </p>
              </div>

            <div className="space-y-4">
              {/* Time commitment Question */}
              <div className="space-y-2">
                <label className="text-xs text-muted font-bold uppercase tracking-wider block px-1">Time per week you can invest?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: '< 2h', label: '< 2 hours', desc: 'Casual study' },
                    { id: '2–5h', label: '2–5 hours', desc: 'Balanced pace' },
                    { id: '5–10h', label: '5–10 hours', desc: 'Accelerated' },
                    { id: '> 10h', label: '> 10 hours', desc: 'Bootcamp mode' }
                  ].map(opt => {
                    const isSelected = timeCommitment === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTimeCommitment(opt.id)}
                        className={`text-center p-5 min-h-[100px] md:min-h-[110px] rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                          isSelected ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'
                        }`}
                      >
                        <span className="font-bold text-sm md:text-base text-text">{opt.label}</span>
                        <span className="text-xs text-muted font-medium">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-line mt-4">
              <button
                onClick={prevStep}
                className="text-sm font-bold text-muted hover:text-text px-4 py-2.5 rounded-xl border border-line hover:border-muted flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSkipStep}
                  className="text-sm font-semibold text-muted hover:text-cyan border border-transparent hover:border-line px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Skip Step
                </button>
                <button
                  onClick={nextStep}
                  disabled={!timeCommitment}
                  className={`font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 text-sm md:text-base hover:scale-105 active:scale-95 shadow-lg ${
                    (!timeCommitment) 
                      ? 'bg-line text-muted cursor-not-allowed opacity-50 shadow-none' 
                      : 'bg-cyan hover:bg-cyan2 text-bg shadow-cyan/15'
                  }`}
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Step 4 — Profile Picture */}
        {step === 4 && (
          <>
            {/* Background SVG Watermark */}
            <div className="absolute -right-6 -bottom-6 w-80 h-80 pointer-events-none opacity-[0.08] dark:opacity-[0.04] z-0 select-none">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes scan-glow {
                    0%, 100% { transform: scale(0.96); opacity: 0.3; }
                    50% { transform: scale(1.04); opacity: 0.8; }
                  }
                  .anim-scan { animation: scan-glow 2.5s ease-in-out infinite; transform-origin: 100px 100px; }
                `}</style>
                <circle cx="100" cy="100" r="55" fill="var(--purple)" opacity="0.03" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="var(--purple)" stroke-width="2.5" stroke-dasharray="10 6" className="anim-scan" />
                <g transform="translate(65, 60)">
                  <circle cx="35" cy="25" r="18" fill="none" stroke="var(--text)" stroke-width="3" />
                  <path d="M5,70 C5,45 65,45 65,70" fill="none" stroke="var(--text)" stroke-width="3" stroke-linecap="round" />
                </g>
                <path d="M40,40 L42,45 L47,47 L42,49 L40,54 L38,49 L33,47 L38,45 Z" fill="var(--cyan)" />
                <path d="M150,140 L151.5,144 L155.5,145.5 L151.5,147 L150,151 L148.5,147 L144.5,145.5 L148.5,144 Z" fill="var(--yellow)" />
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="text-left space-y-1 border-b border-line pb-3">
                <h2 className="text-2xl md:text-3xl font-black text-text font-display uppercase">STEP 4 — SETUP PROFILE PICTURE</h2>
                <p className="text-muted text-sm md:text-base">
                  Customize your visual presence. Upload an avatar image file or generate initials-based badge.
                </p>
              </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
              
              {/* Large Avatar preview */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan via-purple to-yellow rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-32 h-32 rounded-full border-4 border-cyan bg-bg overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted" />
                  )}
                </div>
              </div>

              {/* Select Options */}
              <div className="space-y-3 max-w-sm w-full">
                <div className="space-y-1">
                  <label className="text-xs text-muted font-black uppercase tracking-wider block px-1">Initials Generator</label>
                  <button
                    onClick={handleGenerateInitials}
                    className="w-full bg-cyan/10 border border-cyan/30 hover:border-cyan text-cyan text-sm font-bold p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4 text-cyan" />
                    <span>Generate Initials Badge</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted font-black uppercase tracking-wider block px-1">Upload File</label>
                  <label className="w-full bg-panel border border-line hover:border-cyan text-text text-sm font-bold p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 text-center select-none border-dashed bg-bg/20">
                    <Camera className="w-4 h-4 text-muted" />
                    <span>Choose Picture File</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-line mt-4">
              <button
                onClick={prevStep}
                className="text-sm font-bold text-muted hover:text-text px-4 py-2.5 rounded-xl border border-line hover:border-muted flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-3">
                {/* REQ-ONBOARD-002: Independent step-skippability */}
                <button
                  onClick={handleSkipStep}
                  className="text-sm font-semibold text-muted hover:text-cyan border border-transparent hover:border-line px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Skip Step
                </button>
                <button
                  onClick={nextStep}
                  className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 text-sm md:text-base hover:scale-105 active:scale-95 shadow-lg shadow-cyan/15"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Step 5 — Recommendations */}
        {step === 5 && (
          <>
            {/* Background SVG Watermark */}
            <div className="absolute -right-6 -bottom-6 w-80 h-80 pointer-events-none opacity-[0.08] dark:opacity-[0.04] z-0 select-none">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes book-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(1.5deg); }
                  }
                  @keyframes sparkle-drift {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translate(var(--dx), var(--dy)) scale(1.2); opacity: 0; }
                  }
                  .anim-book { animation: book-float 4s ease-in-out infinite; transform-origin: 100px 100px; }
                  .sparkle-1 { animation: sparkle-drift 3s ease-out infinite; --dx: -20px; --dy: -35px; }
                  .sparkle-2 { animation: sparkle-drift 3.5s ease-out infinite; animation-delay: 1s; --dx: 20px; --dy: -30px; }
                `}</style>
                <g className="anim-book">
                  <path d="M40,130 C70,125 100,135 100,135 C100,135 130,125 160,130 L160,80 C130,75 100,85 100,85 C100,85 70,75 40,80 Z" fill="var(--panel)" stroke="var(--line)" stroke-width="2" />
                  <line x1="100" y1="85" x2="100" y2="135" stroke="var(--line)" stroke-width="2" />
                  <line x1="52" y1="94" x2="88" y2="92" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" />
                  <line x1="52" y1="104" x2="84" y2="102" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" />
                  <line x1="112" y1="92" x2="148" y2="94" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" />
                  <line x1="112" y1="102" x2="144" y2="104" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" />
                </g>
                <g transform="translate(100, 80)">
                  <g className="sparkle-1">
                    <path d="M0,-5 L2,-2 L5,0 L2,2 L0,5 L-2,2 L-5,0 L-2,-2 Z" fill="var(--cyan)" />
                  </g>
                  <g className="sparkle-2">
                    <path d="M0,-4 L1.5,-1.5 L4,0 L1.5,1.5 L0,4 L-1.5,1.5 L-4,0 L-1.5,-1.5 Z" fill="var(--yellow)" />
                  </g>
                </g>
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="text-left space-y-1 border-b border-line pb-3">
                <h2 className="text-2xl md:text-3xl font-black text-text font-display uppercase">STEP 5 — YOUR RECOMMENDED STARTERS</h2>
                <p className="text-muted text-sm md:text-base">
                  Based on your goals ({reason || 'Curiosity'} / {timeCommitment || '2-5h'}), we recommend starting with one of these courses:
                </p>
              </div>

            {/* Recommendation Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedCourses.map(course => {
                const isSelected = selectedCourseId === course.id;
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`text-left rounded-2xl border overflow-hidden transition-all cursor-pointer flex flex-col min-h-[380px] bg-bg/25 group ${
                      isSelected ? 'border-cyan ring-1 ring-cyan bg-cyan/5' : 'border-line hover:border-cyan/40 hover:bg-bg/40'
                    }`}
                  >
                    {/* Image thumb */}
                    <div className="h-36 w-full relative overflow-hidden bg-panel shrink-0">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
                      <span className="absolute bottom-2 left-2 text-[9px] bg-panel/90 border border-line text-text px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                        {course.format.toUpperCase()}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-muted">
                          <span>{course.level}</span>
                          <span className="text-yellow font-bold font-semibold">★ {course.rating}</span>
                        </div>
                        <h4 className="font-bold text-sm md:text-base text-text line-clamp-1 group-hover:text-cyan transition-colors">{course.title}</h4>
                        <p className="text-xs text-muted leading-relaxed line-clamp-3">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-line text-xs text-muted">
                        <span>Reward</span>
                        <span className="text-cyan font-bold">+{course.xpReward} XP</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Call to action tools */}
            <div className="flex items-center justify-between pt-4 border-t border-line mt-4 flex-wrap gap-4">
              <button
                onClick={prevStep}
                className="text-sm font-bold text-muted hover:text-text px-4 py-2.5 rounded-xl border border-line hover:border-muted flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBrowseCatalog}
                  className="text-sm font-semibold text-muted hover:text-cyan border border-line hover:border-cyan px-4 py-2.5 rounded-xl transition-all cursor-pointer bg-bg/50"
                >
                  Browse All Courses
                </button>
                <button
                  onClick={handleStartSelectedCourse}
                  className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 text-sm md:text-base hover:scale-105 active:scale-95 shadow-lg shadow-cyan/15"
                >
                  <span>Start Course (+150 XP)</span>
                  <ChevronRight className="w-4 h-4 text-bg" />
                </button>
              </div>
            </div>
          </div>
        </>
        )}

      </div>
    </div>
  );
};
