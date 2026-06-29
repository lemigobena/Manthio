import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { COURSES } from '../../services/mockData';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Sun,
  Moon,
  Brain,
  Bot,
  Sparkles,
  BookOpen,
  Code2,
  Globe,
  Upload,
} from 'lucide-react';
// Import custom avatars
import boy from '../../assets/avatars/boy.png';
import girl from '../../assets/avatars/girl.png';
import man from '../../assets/avatars/man.png';
import man1 from '../../assets/avatars/man(1).png';
import woman from '../../assets/avatars/woman.png';
import woman1 from '../../assets/avatars/woman(1).png';
import woman2 from '../../assets/avatars/woman(2).png';
import fox from '../../assets/avatars/fox.png';
import rabbit from '../../assets/avatars/rabbit.png';
import profile from '../../assets/avatars/profile.png';
import avatarAsset from '../../assets/avatars/avatar.png';
import AvatarAssetLarge from '../../assets/avatars/Avatar.png';

interface OnboardingProps {
  onNavigate: (page: string) => void;
}

// Avatar presets for quick selection
const AVATAR_PRESETS = [
  boy,
  girl,
  man,
  man1,
  woman,
  woman1,
  woman2,
  fox,
  rabbit,
  profile,
  avatarAsset,
  AvatarAssetLarge,
];

export const Onboarding: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const {
    user,
    completeOnboarding,
    skipOnboarding,
    setActiveCourseId,
    updateProfile
  } = useAuth();
  const { addXp, addToast } = useXP();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem('onboarding_current_step');
    return saved ? parseInt(saved, 10) : 0;
  });



  // Step 2 inputs
  const [reason, setReason] = useState<string>(() => {
    return localStorage.getItem('onboarding_reason') || 'Career growth';
  });
  const [timeCommitment, setTimeCommitment] = useState<string>(() => {
    return localStorage.getItem('onboarding_time_commitment') || '< 2h';
  });
  const [experienceLevel, setExperienceLevel] = useState<string>(() => {
    return localStorage.getItem('onboarding_experience_level') || 'Beginner';
  });
  const [interestedSubject, setInterestedSubject] = useState<string>(() => {
    return localStorage.getItem('onboarding_interested_subject') || 'AI';
  });

  // Step 3 inputs
  const [avatar, setAvatar] = useState<string>(() => {
    const saved = localStorage.getItem('onboarding_avatar');
    // Ignore old cached placeholder URLs or empty strings
    if (saved && (saved.includes('dicebear.com') || saved.includes('pravatar.cc') || saved === '')) {
      return AVATAR_PRESETS[0];
    }
    return saved || AVATAR_PRESETS[0];
  });


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
    localStorage.setItem('onboarding_experience_level', experienceLevel);
  }, [experienceLevel]);

  useEffect(() => {
    localStorage.setItem('onboarding_interested_subject', interestedSubject);
  }, [interestedSubject]);

  useEffect(() => {
    localStorage.setItem('onboarding_avatar', avatar);
  }, [avatar]);

  // Recommendations mapping based on step 2 choices
  const getRecommendedCourses = () => {
    if (reason === 'Career growth' || reason === 'Employer assigned') {
      return COURSES.filter(c => ['python-bootcamp', 'sql-databases', 'git-essentials'].includes(c.id));
    }
    if (reason === 'Specific skill') {
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
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleSkipOnboarding = () => {
    const finalAvatar = avatar || boy;
    if (user && (finalAvatar !== user.avatar)) {
      updateProfile(user.name, user.bio, finalAvatar, user.backgroundImage || '');
    }
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
    const finalAvatar = avatar || boy;
    if (user && (finalAvatar !== user.avatar)) {
      updateProfile(user.name, user.bio, finalAvatar, user.backgroundImage || '');
    }
    completeOnboarding({ reason: reason || 'Curiosity', timePerWeek: timeCommitment || '2-5 Hrs' });
    addXp(150, 'Completed first-time onboarding (+150 XP)');
    addToast('success', `Enrolled in ${courseToStart?.title || 'Course'}! Welcome to Manthio.`);
    onNavigate('dashboard');
  };

  const handleBrowseCatalog = () => {
    const finalAvatar = avatar || boy;
    if (user && (finalAvatar !== user.avatar)) {
      updateProfile(user.name, user.bio, finalAvatar, user.backgroundImage || '');
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

  // Video player slide text helper


  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-bg flex flex-col">

      {/* TOP RIGHT UTILITIES (Global) */}
      {step > 0 && (
        <div className="md:absolute md:top-8 md:right-8 z-50 flex items-center space-x-2 p-4 md:p-0 w-full md:w-auto justify-between md:justify-end bg-bg/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-line md:border-none">
          <div className="md:hidden flex items-center">
            <span className="text-cyan font-bold text-[10px] uppercase tracking-widest">Manthio</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkipOnboarding}
              className="h-8 md:h-9 flex items-center text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-bg px-3 md:px-4 bg-cyan hover:opacity-90 rounded-md transition-all cursor-pointer shadow-md"
            >
              Skip Onboarding
            </button>
            <button
              onClick={toggleTheme}
              className="h-8 md:h-9 w-8 md:w-9 flex items-center justify-center rounded-md bg-cyan text-bg hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-3.5 md:w-4 h-3.5 md:h-4" /> : <Moon className="w-3.5 md:w-4 h-3.5 md:h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className={`flex-1 relative w-full h-full ${(step === 2 || step > 2) ? 'overflow-y-auto md:overflow-hidden bg-bg' : 'overflow-hidden'}`}>

        {step === 0 && (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-bg overflow-hidden pt-12">
            {/* --- MAIN CONTENT AREA WITH ORBITS --- */}
            <div className="relative flex items-center justify-center w-full h-[80%] flex-1">

              {/* --- ORBITAL SYSTEM CONTAINER (Locked Aspect Ratio for Perfect Alignment) --- */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1000px] pointer-events-none z-0 scale-[0.6] lg:scale-[0.8] xl:scale-100 origin-center">

                {/* ORBITAL SVG LAYER */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 1600 1000" fill="none">
                    {/* Highly Visible Expanded Orbits */}
                    <circle cx="800" cy="500" r="350" stroke="var(--line)" strokeWidth="1.5" strokeOpacity="0.8" />
                    <circle cx="800" cy="500" r="520" stroke="var(--line)" strokeWidth="1.5" strokeOpacity="0.6" />
                    <circle cx="800" cy="500" r="720" stroke="var(--line)" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>
                </div>

                {/* FLOATING NODES - Identical Coordinate System */}
                <div className="absolute inset-0">

                  {/* INNER ORBIT (R=350) */}
                  <div className="absolute flex items-center justify-center" style={{ left: 800 + 350 * 0.707 - 20, top: 500 - 350 * 0.707 - 20 }}>
                    <div className="w-10 h-10 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="absolute flex items-center space-x-1.5 opacity-60" style={{ left: 800 + 350 * 0.94 - 10, top: 500 - 350 * 0.34 - 10 }}>
                    <div className="bg-panel p-1 rounded shadow-sm border border-line">
                      <svg className="w-3 h-3 text-muted" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a.2 .2 0 010 2l-3-3a.2 .2 0 00-.2 .2H4a2 2 0 01-2-2V5z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-text/40">32</span>
                  </div>
                  <div className="absolute -translate-x-1/2" style={{ left: 800, top: 500 + 350 - 10 }}>
                    <svg className="w-5 h-5 text-text/30" fill="currentColor" viewBox="0 0 24 24"><path d="M13.16 12.46L18 11.23L6.00001 5L10.23 18.23L12.46 13.16L17 17.71L17.71 17L13.16 12.46Z" /></svg>
                  </div>
                  <div className="absolute flex items-center space-x-1" style={{ left: 800 - 350 * 0.866 - 15, top: 500 + 350 * 0.5 - 10 }}>
                    <span className="text-sm">🏅</span>
                    <span className="text-[10px] font-bold text-text/40">35</span>
                  </div>
                  <div className="absolute" style={{ left: 800 - 350 * 0.866 - 20, top: 500 - 350 * 0.5 - 20 }}>
                    <img src="https://i.pravatar.cc/150?u=11" className="w-10 h-10 rounded-full border-2 border-bg" alt="" />
                  </div>

                  {/* MIDDLE ORBIT (R=520) */}
                  <div className="absolute" style={{ left: 800 - 520 * 0.707 - 22, top: 500 - 520 * 0.707 - 22 }}>
                    <img src="https://i.pravatar.cc/150?u=12" className="w-11 h-11 rounded-full border-2 border-bg shadow-xl" alt="" />
                  </div>
                  <div className="absolute flex items-center space-x-1.5 opacity-50" style={{ left: 800 - 520 * 0.866 - 15, top: 500 - 520 * 0.5 - 15 }}>
                    <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                    <span className="text-[11px] font-bold text-text/40">10</span>
                  </div>
                  <div className="absolute -translate-y-1/2 -translate-x-1/2 flex items-center justify-center" style={{ left: 800 - 520, top: 500 }}>
                    <div className="w-11 h-11 rounded-full bg-purple/10 border border-purple/30 flex items-center justify-center text-purple shadow-xl">
                      <Code2 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute" style={{ left: 800 - 520 * 0.94 - 40, top: 500 + 520 * 0.34 - 15 }}>
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-green/30 bg-green/5 text-[10px] font-black text-green uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-green" />
                      <span>Verified Solution</span>
                    </div>
                  </div>
                  <div className="absolute" style={{ left: 800 - 520 * 0.707 - 20, top: 500 + 520 * 0.707 - 20 }}>
                    <img src="https://i.pravatar.cc/150?u=14" className="w-10 h-10 rounded-full border-2 border-bg shadow-md" alt="" />
                  </div>
                  <div className="absolute flex items-center space-x-3" style={{ left: 800 - 520 * 0.17 - 25, top: 500 - 520 * 0.98 - 25 }}>
                    <div className="w-10 h-10 rounded-xl bg-panel border border-line flex items-center justify-center text-cyan shadow-xl">
                      <Brain className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-text/40">4</span>
                  </div>
                  <div className="absolute flex items-center space-x-2" style={{ left: 800 - 520 * 0.5 - 30, top: 500 + 520 * 0.866 - 25 }}>
                    <div className="w-11 h-11 rounded-2xl bg-panel border border-line flex items-center justify-center animate-[cel-float_4s_infinite] shadow-2xl text-purple">
                      <Bot className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black text-text/40">4</span>
                  </div>

                  <div className="absolute" style={{ left: 800 + 520 * 0.866 - 18, top: 500 - 520 * 0.5 - 18 }}>
                    <img src="https://i.pravatar.cc/150?u=15" className="w-9 h-9 rounded-full border-2 border-bg opacity-70" alt="" />
                  </div>
                  <div className="absolute -translate-y-1/2 flex flex-col items-center" style={{ left: 800 + 520 - 22, top: 500 }}>
                    <div className="w-11 h-11 rounded-[22px] bg-panel border border-line flex items-center justify-center text-cyan shadow-xl animate-pulse">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="mt-1 flex items-center space-x-0.5">
                      <span className="text-[10px] font-bold text-text/40">AI Powered</span>
                    </div>
                  </div>
                  <div className="absolute -translate-x-1/2" style={{ left: 800 + 520 * 0.866, top: 500 + 520 * 0.5 - 20 }}>
                    <img src="https://i.pravatar.cc/150?u=16" className="w-10 h-10 rounded-full border-2 border-bg shadow-md" alt="" />
                  </div>
                  <div className="absolute -translate-x-1/2" style={{ left: 800 + 520 * 0.5, top: 500 + 520 * 0.866 - 22 }}>
                    <div className="w-11 h-11 rounded-full bg-green text-bg shadow-2xl flex items-center justify-center">
                      <Check className="w-6 h-6 stroke-[4]" />
                    </div>
                  </div>

                  {/* OUTER ORBIT (R=720) */}
                  <div className="absolute flex items-center space-x-3" style={{ left: 800 + 720 * 0.866 - 30, top: 500 - 720 * 0.5 - 24 }}>
                    <div className="w-12 h-12 rounded-full bg-panel border border-line flex items-center justify-center relative shadow-xl">
                      <svg className="w-6 h-6 text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                      <div className="absolute -right-3 top-0 bg-red text-white p-1 rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 22 12.28 18.6 15.36 13.45 20.03L12 21.35z" /></svg>
                      </div>
                    </div>
                    <span className="text-[12px] font-black text-text/30">10</span>
                  </div>
                  <div className="absolute flex items-center space-x-3 opacity-80" style={{ left: 800 + 720 - 25, top: 485 }}>
                    <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    <span className="text-[12px] font-black text-text/30">68</span>
                  </div>
                  <div className="absolute flex items-center justify-center" style={{ left: 800 + 720 * 0.866 - 24, top: 500 + 720 * 0.5 - 24 }}>
                    <div className="w-12 h-12 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center text-orange shadow-2xl">
                      <Globe className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute" style={{ left: 800 + 720 * 0.707 - 25, top: 500 + 720 * 0.707 - 25 }}>
                    <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,207,63,0.5)]">✨</span>
                  </div>

                  <div className="absolute translate-x-[-150px] translate-y-[280px]" style={{ left: 400, top: 500 }}>
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className="absolute inset-0 bg-purple/20 rounded-full blur-3xl animate-pulse" />
                      <span className="text-9xl select-none filter drop-shadow-2xl">🎓</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* --- CENTRAL TEXT BLOCK (Pixel-aligned to image - Manthio Colors) --- */}
              <div className="relative z-10 flex flex-col items-center text-center max-w-xl px-6 animate-[cel-reveal_0.8s_ease-out]">
                <h1 className="text-4xl md:text-6xl font-[900] text-cyan leading-[1.1] tracking-[-0.03em] mb-4 font-sans drop-shadow-sm">
                  Welcome to Manthio {user?.name?.split(' ')[0] || ''} 👋
                </h1>

                <h2 className="text-2xl md:text-3xl font-normal text-text mb-8 opacity-90">
                  The home <br className="md:hidden" /> for peer learning
                </h2>

                <p className="text-text/70 text-base md:text-lg font-medium leading-relaxed mb-8 max-w-md">
                  Join a community of developers mastering skills together. Share knowledge, collaborate on code, and earn verified recognition.
                </p>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="h-[56px] px-10 rounded-xl bg-cyan hover:bg-cyan2 text-bg text-[16px] font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,228,0.25)] flex items-center space-x-2 cursor-pointer group"
                  >
                    <span>Get started learning</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

            </div>

            {/* --- SUB-HERO SLOGAN --- */}
            <div className="relative z-20 pb-16 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-text tracking-tight">
                Dedicated space for knowledge.
              </h2>
            </div>

          </div>
        )}



        {/* Step 1 — Full Screen Immersive Tour */}
        {step === 1 && (
          <div
            className="relative h-full w-full flex flex-col items-center justify-center bg-bg overflow-hidden animate-[fadeIn_0.5s_ease-out]"
            onMouseDown={handleSwipeStart}
            onMouseUp={handleSwipeEnd}
            onMouseLeave={handleSwipeEnd}
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
            onWheel={handleWheel}
          >
            {/* 4 SEASONS SLIDING TRACK */}
            <div
              className="absolute inset-0 flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const s = [
                  { title: 'Flipped Classroom Philosophy', largeTitle: 'METHOD', badge: '01. THE METHOD', video: '/onboarding-videos/video1.mp4', desc: 'Learn core theoretical concepts at your own pace through rich videos and documents. Live trainer hours are reserved for hands-on application.' },
                  { title: 'Personalized AI Guidance', largeTitle: 'AI-TUTOR', badge: '02. INTELLIGENT HELP', video: '/onboarding-videos/video2.mp4', desc: 'An AI-powered tutor trained directly on official specifications. Ask questions 24/7, get instant code feedback.' },
                  { title: 'Interactive Web REPL', largeTitle: 'PLAY', badge: '03. CONSOLE EXPERIENCE', video: '/onboarding-videos/video3.mp4', desc: 'Practice directly inside the browser using our playground. Compile scripts and solve coding puzzles.' },
                  { title: 'XP Levels & Streak Bonuses', largeTitle: 'STATS', badge: '04. ENGAGEMENT SYSTEM', video: '/onboarding-videos/video4.mp4', desc: 'Collect Experience Points (XP) for everything you achieve. Build a daily coding streak and level up.' },
                  { title: 'Verified Certificates', largeTitle: 'PRO', badge: '05. CERTIFICATION', video: '/onboarding-videos/video5.mp4', desc: 'Earn official course completion certificates verified on the blockchain.' },
                  { title: 'Community Forums', largeTitle: 'HUB', badge: '06. NETWORK', video: '/onboarding-videos/video6.mp4', desc: 'Connect with other learners, form peer coding study circles, and participate in workshops.' }
                ][idx];

                return (
                  <div key={idx} className="relative h-full w-full shrink-0 overflow-hidden">
                    {/* Background Video Visual */}
                    <div className="absolute inset-0 bg-bg">
                      <video
                        src={s.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-100"
                      />
                    </div>

                    {/* DESKTOP: Mathematical ln(1/n) curve wash */}
                    <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
                      <svg className="w-full h-full" viewBox="0 0 1600 1000" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mathWashGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--bg)" stopOpacity="0" />
                            <stop offset="100%" stopColor="var(--bg)" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0,0 
                             L 0,100 
                             C 200,500 600,900 1400,1000 
                             L 0,1000 
                             Z"
                          fill="url(#mathWashGrad)"
                          className="opacity-60 dark:opacity-80"
                        />
                      </svg>
                    </div>
                    {/* DESKTOP: Atmospheric blur follow-up */}
                    <div
                      className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-bg to-transparent pointer-events-none z-0 opacity-80 hidden md:block backdrop-blur-md"
                      style={{ clipPath: 'path("M0,0 C200,450 600,850 1400,900 L1400,900 L1400,1000 L0,1000 Z")' }}
                    />

                    {/* MOBILE: Simple full-width bottom gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-bg via-bg/70 to-transparent pointer-events-none z-0 md:hidden" />

                    {/* CONTENT OVERLAY - BOTTOM LEFT */}
                    <div className="absolute inset-x-0 bottom-0 px-6 md:px-12 pb-24 md:pb-14 flex flex-col items-start text-left max-w-xl md:max-w-sm lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl z-10 transition-all">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 mb-3 md:mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                        <span className="text-[8px] md:text-[9px] font-black text-cyan uppercase tracking-[0.2em]">{s.badge}</span>
                      </div>

                      <h2 className={`text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black leading-tight mb-2 md:mb-3 drop-shadow-sm ${resolvedTheme === 'dark' ? 'text-white' : 'text-text'}`}>
                        {s.title}
                      </h2>

                      <p className={`text-[11px] md:text-xs lg:text-[13px] xl:text-sm font-medium leading-relaxed max-w-[85%] md:max-w-[280px] lg:max-w-md xl:max-w-lg ${resolvedTheme === 'dark' ? 'text-white/60' : 'text-text/70'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTTOM RIGHT CONTROLS */}
            <div className="absolute bottom-6 md:bottom-12 right-4 md:right-10 z-30 flex flex-col items-end space-y-4 md:space-y-6">
              {/* Micro Pagination Tracker */}
              <div className="flex space-x-1.5 pr-0.5">
                {[0, 1, 2, 3, 4, 5].map(idx => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-0.5 md:h-1 transition-all duration-500 rounded-full cursor-pointer ${idx === activeIndex ? 'w-6 md:w-8 bg-cyan' : 'w-2 md:w-3 bg-line hover:bg-text/30'
                      }`}
                  />
                ))}
              </div>

              {/* Ultra-Micro Light Primary Action */}
              <button
                onClick={() => {
                  if (activeIndex < 5) {
                    setActiveIndex(prev => prev + 1);
                  } else {
                    nextStep();
                  }
                }}
                className="h-[36px] md:h-[40px] px-5 md:px-6 rounded-lg bg-cyan text-bg text-[11px] md:text-[12px] font-black hover:opacity-90 active:bg-cyan/80 transition-all shadow-md flex items-center space-x-2 cursor-pointer group"
              >
                <span>{activeIndex === 5 ? 'Start' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
        )}

        {/* Step 2 — Unified Questionnaire */}
{step === 2 && (
  <div className="
    w-full bg-bg animate-[fadeIn_0.5s_ease-out]
    flex flex-col
    md:flex-row md:h-full md:overflow-hidden
  ">

    {/* LEFT PANEL */}
    <div className="
      w-full md:w-[38%] lg:w-[35%]
      bg-gradient-to-br from-panel2 via-panel to-bg
      flex flex-col justify-center
      p-8 md:p-12 lg:p-16
      border-b md:border-b-0 md:border-r border-line
      relative overflow-hidden shrink-0
    ">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cyan/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 space-y-5">
        <div className="w-12 h-12 border border-cyan rounded-xl flex items-center justify-center text-cyan shadow-sm">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-3">
          <h2 className="text-[clamp(20px,5vw,40px)] md:text-[clamp(22px,4vw,48px)] font-black text-text font-sans tracking-tight leading-tight">
            Define <br />Your Journey
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-sm">
            Answer a few questions to help us tailor your curriculum, AI responses, and course recommendations for maximum growth.
          </p>
        </div>
      </div>
    </div>

    {/* RIGHT PANEL */}
    {/*
      Desktop: fixed-height flex column.
        - Top area (flex-1, overflow-y-auto): scrolls internally if needed
        - Content inside is flex + items-center so it's vertically centered
        - Bottom bar (shrink-0): sticky Continue button, never overlaps
      Mobile: just flows naturally, no fixed heights
    */}
    <div className="flex-1 bg-panel md:min-h-0 md:flex md:flex-col">

      {/* Scrollable area — on desktop this is the bounded region between top bar and button */}
      <div className="
        flex-1 md:min-h-0 scrollbar-hide
        flex flex-col md:justify-center md:mt-10 overflow-hidden
      ">
        <div className="max-w-3xl mx-auto w-full px-6 md:px-8 py-6 md:py-8 flex flex-col gap-[50px]">

          {/* Primary Goal */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Primary Goal</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Career growth', label: 'Career Growth' },
                { id: 'Specific skill', label: 'Specific Skill' },
                { id: 'Curiosity', label: 'Curiosity' },
                { id: 'Employer assigned', label: 'Employer Assigned' }
              ].map(opt => {
                const isSelected = reason === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setReason(opt.id)}
                    className={`text-left p-3.5 min-h-[60px] rounded-xl border-2 transition-all cursor-pointer flex items-center space-x-3 ${isSelected ? 'border-cyan bg-cyan/10 shadow-sm' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan bg-cyan' : 'border-muted'}`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-bg stroke-[3px]" />}
                    </div>
                    <h4 className="font-bold text-sm text-text">{opt.label}</h4>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Experience Level</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Beginner', label: 'Beginner' },
                { id: 'Intermediate', label: 'Intermediate' },
                { id: 'Advanced', label: 'Advanced' },
                { id: 'Expert', label: 'Expert' }
              ].map(opt => {
                const isSelected = experienceLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setExperienceLevel(opt.id)}
                    className={`text-center p-3 min-h-[60px] rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${isSelected ? 'border-cyan bg-cyan/10 shadow-sm' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'}`}
                  >
                    <span className="font-bold text-sm text-text">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Commitment */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Time Commitment</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '< 2h', label: '< 2 hours' },
                { id: '2–5h', label: '2–5 hours' },
                { id: '5–10h', label: '5–10 hours' },
                { id: '> 10h', label: '> 10 hours' }
              ].map(opt => {
                const isSelected = timeCommitment === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTimeCommitment(opt.id)}
                    className={`text-center p-3 min-h-[60px] rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${isSelected ? 'border-cyan bg-cyan/10 shadow-sm' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'}`}
                  >
                    <span className="font-bold text-sm text-text">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Interest */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Choose your Subjects</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'AI', label: 'AI / Machine Learning' },
                { id: 'Software Dev', label: 'Software Dev' },
                { id: 'Cloud', label: 'Cloud & DevOps' },
                { id: 'Cybersecurity', label: 'Cybersecurity' },
                { id: 'Data', label: 'Data & Analytics' },
                { id: 'Other', label: 'Other Topics' }
              ].map(opt => {
                const isSelected = interestedSubject === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setInterestedSubject(opt.id)}
                    className={`text-left p-3 min-h-[60px] rounded-xl border-2 transition-all cursor-pointer flex items-center space-x-3 ${isSelected ? 'border-cyan ring-1 ring-cyan bg-cyan/5' : 'border-line hover:border-cyan/40 hover:bg-bg/40 bg-bg/20'}`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-cyan border-cyan' : 'border-line bg-panel'}`}>
                      {isSelected && <Check className="w-3 h-3 text-bg stroke-[3px]" />}
                    </div>
                    <h4 className="font-bold text-sm text-text truncate">{opt.label}</h4>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue button — MOBILE ONLY (inline, at bottom of content flow) */}
          <div className="pt-2 md:hidden">
            <button
              onClick={nextStep}
              disabled={!reason || !experienceLevel || !timeCommitment || !interestedSubject}
              className={`w-full h-8 flex items-center justify-center text-[8px] font-black uppercase tracking-widest rounded-md transition-all group ${(!reason || !experienceLevel || !timeCommitment || !interestedSubject)
                ? 'bg-line text-muted cursor-not-allowed opacity-50'
                : 'bg-cyan text-bg cursor-pointer hover:opacity-90 active:scale-95 shadow-md'}`}
            >
              <span>Continue</span>
              <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Continue button — DESKTOP ONLY (pinned to bottom of right panel, never overlaps content) */}
      <div className="hidden md:flex shrink-0 px-4 md:px-10 py-4 bg-panel border-t border-line justify-end">
        <button
          onClick={nextStep}
          disabled={!reason || !experienceLevel || !timeCommitment || !interestedSubject}
          className={`h-8 md:h-9 px-3 md:px-4 flex items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-md group ${(!reason || !experienceLevel || !timeCommitment || !interestedSubject)
            ? 'bg-line text-muted cursor-not-allowed opacity-50 shadow-none'
            : 'bg-cyan text-bg cursor-pointer hover:opacity-90 active:bg-cyan/80 transition-all shadow-md'}`}
        >
          <span>Continue</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

    </div>
  </div>
)}

        {/* Step 3 — Profile Picture */}
        {step === 3 && (
          <div className="
            w-full bg-bg animate-[fadeIn_0.5s_ease-out]
            flex flex-col
            md:flex-row md:h-full md:overflow-hidden
          ">

            {/* LEFT PANEL */}
            <div className="
              w-full md:w-[38%] lg:w-[35%]
              bg-gradient-to-br from-panel2 via-panel to-bg
              flex flex-col justify-center
              p-8 md:p-12 lg:p-16
              border-b md:border-b-0 md:border-r border-line
              relative overflow-hidden shrink-0
            ">
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cyan/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <div className="w-12 h-12 border border-cyan rounded-xl flex items-center justify-center text-cyan shadow-sm">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-text font-sans tracking-tight leading-tight">
                    Finalize <br />Your Identity
                  </h2>
                  <p className="text-muted text-sm md:text-base leading-relaxed max-w-sm">
                    Customize your visual presence. People with profile pictures are 3x more likely to finish courses and engage with mentors.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 bg-panel md:min-h-0 md:flex md:flex-col">
              <div className="
                flex-1 md:min-h-0 md:overflow-y-auto scrollbar-hide
                flex flex-col md:justify-center
                pt-16 md:pt-24
              ">
                <div className="max-w-xl mx-auto w-full px-6 md:px-8 py-8 md:py-12 space-y-10">

                  <div className="flex flex-col items-center justify-center space-y-8">
                    {/* Large Avatar preview */}
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-tr from-cyan via-purple to-yellow rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative w-32 md:w-40 h-32 md:h-40 rounded-full border-4 border-cyan bg-bg overflow-hidden flex items-center justify-center shadow-2xl">
                        <img
                          src={avatar || boy}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-10 h-10 bg-cyan text-bg rounded-full flex items-center justify-center shadow-lg border-2 border-panel">
                        <Camera className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="w-full space-y-6 mt-12">

                      {/* Upload Options */}
                      <div className="w-full">
                        <button
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="flex items-center justify-center space-x-3 p-4 w-full bg-bg/20 border-2 border-line hover:border-cyan/40 hover:bg-bg/40 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-cyan/10 text-cyan flex items-center justify-center shrink-0">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-text">Upload Custom Image</div>
                            <div className="text-[11px] text-muted">JPEG, PNG, WEBP</div>
                          </div>
                        </button>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>

                      {/* Avatar Presets */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted uppercase tracking-wider">Or Choose a Preset</span>
                          <div className="h-px flex-1 bg-line ml-4" />
                        </div>
                        <div className="grid grid-cols-6 gap-3 sm:gap-4 pb-2">
                          {AVATAR_PRESETS.map((pUrl, idx) => {
                            const isSelected = avatar === pUrl;
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => setAvatar(pUrl)}
                                className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 cursor-pointer ${isSelected ? 'border-cyan ring-2 ring-cyan/30 scale-110 z-10' : 'border-line hover:border-cyan/40 bg-bg/50'}`}
                              >
                                <img src={pUrl} alt={`Preset ${idx}`} className="w-full h-full object-contain p-0.5" />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-cyan/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-bg stroke-[3px]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue button — MOBILE ONLY */}
                  <div className="pt-4 md:hidden">
                    <button
                      onClick={nextStep}
                      className="w-full h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-md transition-all bg-cyan text-bg cursor-pointer hover:opacity-90 active:bg-cyan/80 shadow-md"
                    >
                      <span>Complete Setup</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue button — DESKTOP ONLY */}
              <div className="hidden md:flex shrink-0 px-4 md:px-10 py-6 bg-panel border-t border-line justify-end">
                <button
                  onClick={nextStep}
                  className="h-9 px-6 flex items-center text-[10px] font-black uppercase tracking-widest transition-all rounded-md group bg-cyan text-bg cursor-pointer hover:opacity-90 active:bg-cyan/80 shadow-md"
                >
                  <span>Complete Setup</span>
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Step 4 — Recommendations */}
        {step === 4 && (
          <div className="
            w-full bg-bg animate-[fadeIn_0.5s_ease-out]
            flex flex-col
            md:flex-row md:h-full md:overflow-hidden
          ">

            {/* LEFT PANEL */}
            <div className="
              w-full md:w-[38%] lg:w-[35%]
              bg-gradient-to-br from-panel2 via-panel to-bg
              flex flex-col justify-center
              p-8 md:p-12 lg:p-16
              border-b md:border-b-0 md:border-r border-line
              relative overflow-hidden shrink-0
            ">
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cyan/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <div className="w-12 h-12 border border-cyan rounded-xl flex items-center justify-center text-cyan shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-text font-sans tracking-tight leading-tight">
                    Your Tailored <br />Path Awaits
                  </h2>
                  <p className="text-muted text-sm md:text-base leading-relaxed max-w-sm">
                    Based on your interest in <span className="text-cyan font-bold">{interestedSubject || 'Tech'}</span> and your <span className="text-cyan font-bold">{timeCommitment || 'flexible'}</span> schedule, these starters are perfectly tuned for your success.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 bg-panel md:min-h-0 md:flex md:flex-col">
              <div className="
                flex-1 md:min-h-0 md:overflow-y-auto scrollbar-hide
                flex flex-col md:justify-center
                pt-16 md:pt-24
              ">
                <div className="max-w-4xl mx-auto w-full px-6 md:px-8 py-8 md:py-12 space-y-8">
                  
                  <div className="space-y-2 text-center md:text-left">
                    <div className="text-xs font-bold text-muted uppercase tracking-wider">Recommended Starters</div>
                    <h3 className="text-xl md:text-2xl font-black text-text font-display">Pick a course to start your journey</h3>
                  </div>

                  {/* Recommendation Course Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedCourses.map(course => {
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <button
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`text-left rounded-2xl border overflow-hidden transition-all cursor-pointer flex flex-col min-h-[340px] bg-bg/25 group relative ${isSelected ? 'border-cyan ring-1 ring-cyan bg-cyan/5' : 'border-line hover:border-cyan/40 hover:bg-bg/40'}`}
                        >
                          {/* Image thumb */}
                          <div className="h-32 w-full relative overflow-hidden bg-panel shrink-0">
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
                            <span className="absolute bottom-2 left-2 text-[9px] bg-panel/90 border border-line text-text px-2 py-0.5 rounded font-black tracking-wider uppercase">
                              {course.format}
                            </span>
                          </div>

                          {/* Meta info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
                                <span>{course.level}</span>
                                <span className="text-yellow text-xs">★ {course.rating}</span>
                              </div>
                              <h4 className="font-bold text-sm text-text line-clamp-1 group-hover:text-cyan transition-colors">{course.title}</h4>
                              <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                                {course.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-line text-[10px] font-bold text-muted uppercase">
                              <span>Reward</span>
                              <span className="text-cyan">+{course.xpReward} XP</span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-cyan text-bg rounded-full flex items-center justify-center shadow-lg animate-bounce">
                              <Check className="w-3 h-3 stroke-[4px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation — MOBILE ONLY */}
                  <div className="pt-6 flex flex-col space-y-3 md:hidden">
                    <button
                      onClick={handleStartSelectedCourse}
                      className="w-full h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-md transition-all bg-cyan text-bg shadow-md"
                    >
                      <span>Start {recommendedCourses.find(c => c.id === selectedCourseId)?.title || 'Course'}</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                    <button
                      onClick={handleBrowseCatalog}
                      className="h-9 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-cyan border-2 border-cyan/30 rounded-md hover:border-cyan transition-all"
                    >
                      <span>Browse All Courses</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation — DESKTOP ONLY */}
              <div className="hidden md:flex shrink-0 px-4 md:px-10 py-6 bg-panel border-t border-line items-center justify-end space-x-4">
                <button
                  onClick={handleBrowseCatalog}
                  className="h-9 px-6 flex items-center text-[10px] font-black uppercase tracking-widest text-cyan border-2 border-cyan/30 rounded-md hover:border-cyan transition-colors"
                >
                  Browse Catalog
                </button>
                <button
                  onClick={handleStartSelectedCourse}
                  className="h-9 px-6 flex items-center text-[10px] font-black uppercase tracking-widest rounded-md transition-all bg-cyan text-bg hover:opacity-90 active:bg-cyan/80 shadow-md group"
                >
                  <span>Start Selected Course</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
