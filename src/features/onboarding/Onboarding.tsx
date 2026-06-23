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
  Sun,
  Moon,
  Brain,
  Bot,
  Sparkles,
  BookOpen,
  Code2,
  Globe
} from 'lucide-react';
import defaultAvatar from '../../assets/Avatar.png';

interface OnboardingProps {
  onNavigate: (page: string) => void;
}

// Removed generateInitialsAvatar

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
  const [experienceLevel, setExperienceLevel] = useState<string>(() => {
    return localStorage.getItem('onboarding_experience_level') || '';
  });
  const [learningPreference, setLearningPreference] = useState<string>(() => {
    return localStorage.getItem('onboarding_learning_preference') || '';
  });
  const [interestedSubject, setInterestedSubject] = useState<string>(() => {
    return localStorage.getItem('onboarding_interested_subject') || '';
  });

  // Step 3 inputs
  const [avatar, setAvatar] = useState<string>(() => {
    const saved = localStorage.getItem('onboarding_avatar');
    // Ignore old cached placeholder URLs
    if (saved && (saved.includes('unsplash.com') || saved.includes('ui-avatars.com'))) {
      return '';
    }
    return saved || '';
  });

  const [backgroundImage, setBackgroundImage] = useState<string>(() => {
    return localStorage.getItem('onboarding_bg_image') || '';
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
    localStorage.setItem('onboarding_learning_preference', learningPreference);
  }, [learningPreference]);

  useEffect(() => {
    localStorage.setItem('onboarding_interested_subject', interestedSubject);
  }, [interestedSubject]);

  useEffect(() => {
    localStorage.setItem('onboarding_avatar', avatar);
  }, [avatar]);

  useEffect(() => {
    localStorage.setItem('onboarding_bg_image', backgroundImage);
  }, [backgroundImage]);

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
      setAvatar(defaultAvatar);
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
    const finalAvatar = avatar || defaultAvatar;
    if (user && (finalAvatar !== user.avatar || backgroundImage !== user.backgroundImage)) {
      updateProfile(user.name, user.bio, finalAvatar, backgroundImage);
    }
    completeOnboarding({ reason: reason || 'Curiosity', timePerWeek: timeCommitment || '2-5 Hrs' });
    addXp(150, 'Completed first-time onboarding (+150 XP)');
    addToast('success', `Enrolled in ${courseToStart?.title || 'Course'}! Welcome to Manthio.`);
    onNavigate('dashboard');
  };

  const handleBrowseCatalog = () => {
    const finalAvatar = avatar || defaultAvatar;
    if (user && (finalAvatar !== user.avatar || backgroundImage !== user.backgroundImage)) {
      updateProfile(user.name, user.bio, finalAvatar, backgroundImage);
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

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBackgroundImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Video player slide text helper
  

  return (
    <div className={`${(step === 0 || step === 1) ? 'w-full h-[100dvh] overflow-hidden bg-bg' : 'max-w-6xl mx-auto px-4 py-4 space-y-4'}`}>
      
      {/* Header bar with global skip - Hidden for Step 0 & 1 */}
      {step > 1 && (
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

      {/* Main Form Container - Full Screen for Step 0 & 1 */}
      <div className={`relative overflow-hidden w-full h-full ${(step === 0 || step === 1) ? '' : 'bg-panel border border-line rounded-3xl p-5 md:p-6 shadow-2xl'}`}>
        
        {step === 0 && (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-bg overflow-hidden pt-12">
            {/* Theme Toggle - Positioned like the image's top-right utility group */}
            <div className="absolute top-8 right-8 z-50 flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className="h-9 px-4 flex items-center justify-center rounded-lg bg-text text-bg text-sm font-bold hover:scale-105 transition-all cursor-pointer shadow-sm"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

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
                <div className="absolute flex items-center justify-center" style={{ left: 800 + 350*0.707 - 20, top: 500 - 350*0.707 - 20 }}>
                  <div className="w-10 h-10 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute flex items-center space-x-1.5 opacity-60" style={{ left: 800 + 350*0.94 - 10, top: 500 - 350*0.34 - 10 }}>
                  <div className="bg-panel p-1 rounded shadow-sm border border-line">
                    <svg className="w-3 h-3 text-muted" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a.2 .2 0 010 2l-3-3a.2 .2 0 00-.2 .2H4a2 2 0 01-2-2V5z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-text/40">32</span>
                </div>
                <div className="absolute -translate-x-1/2" style={{ left: 800, top: 500 + 350 - 10 }}>
                  <svg className="w-5 h-5 text-text/30" fill="currentColor" viewBox="0 0 24 24"><path d="M13.16 12.46L18 11.23L6.00001 5L10.23 18.23L12.46 13.16L17 17.71L17.71 17L13.16 12.46Z"/></svg>
                </div>
                <div className="absolute flex items-center space-x-1" style={{ left: 800 - 350*0.866 - 15, top: 500 + 350*0.5 - 10 }}>
                   <span className="text-sm">🏅</span>
                   <span className="text-[10px] font-bold text-text/40">35</span>
                </div>
                <div className="absolute" style={{ left: 800 - 350*0.866 - 20, top: 500 - 350*0.5 - 20 }}>
                  <img src="https://i.pravatar.cc/150?u=11" className="w-10 h-10 rounded-full border-2 border-bg" alt="" />
                </div>

                {/* MIDDLE ORBIT (R=520) */}
                <div className="absolute" style={{ left: 800 - 520*0.707 - 22, top: 500 - 520*0.707 - 22 }}>
                  <img src="https://i.pravatar.cc/150?u=12" className="w-11 h-11 rounded-full border-2 border-bg shadow-xl" alt="" />
                </div>
                <div className="absolute flex items-center space-x-1.5 opacity-50" style={{ left: 800 - 520*0.866 - 15, top: 500 - 520*0.5 - 15 }}>
                  <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  <span className="text-[11px] font-bold text-text/40">10</span>
                </div>
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex items-center justify-center" style={{ left: 800 - 520, top: 500 }}>
                  <div className="w-11 h-11 rounded-full bg-purple/10 border border-purple/30 flex items-center justify-center text-purple shadow-xl">
                    <Code2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute" style={{ left: 800 - 520*0.94 - 40, top: 500 + 520*0.34 - 15 }}>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-green/30 bg-green/5 text-[10px] font-black text-green uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-green" />
                    <span>Verified Solution</span>
                  </div>
                </div>
                <div className="absolute" style={{ left: 800 - 520*0.707 - 20, top: 500 + 520*0.707 - 20 }}>
                  <img src="https://i.pravatar.cc/150?u=14" className="w-10 h-10 rounded-full border-2 border-bg shadow-md" alt="" />
                </div>
                <div className="absolute flex items-center space-x-3" style={{ left: 800 - 520*0.17 - 25, top: 500 - 520*0.98 - 25 }}>
                  <div className="w-10 h-10 rounded-xl bg-panel border border-line flex items-center justify-center text-cyan shadow-xl">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black text-text/40">4</span>
                </div>
                <div className="absolute flex items-center space-x-2" style={{ left: 800 - 520*0.5 - 30, top: 500 + 520*0.866 - 25 }}>
                  <div className="w-11 h-11 rounded-2xl bg-panel border border-line flex items-center justify-center animate-[cel-float_4s_infinite] shadow-2xl text-purple">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black text-text/40">4</span>
                </div>

                <div className="absolute" style={{ left: 800 + 520*0.866 - 18, top: 500 - 520*0.5 - 18 }}>
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
                <div className="absolute -translate-x-1/2" style={{ left: 800 + 520*0.866, top: 500 + 520*0.5 - 20 }}>
                  <img src="https://i.pravatar.cc/150?u=16" className="w-10 h-10 rounded-full border-2 border-bg shadow-md" alt="" />
                </div>
                <div className="absolute -translate-x-1/2" style={{ left: 800 + 520*0.5, top: 500 + 520*0.866 - 22 }}>
                  <div className="w-11 h-11 rounded-full bg-green text-bg shadow-2xl flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[4]" />
                  </div>
                </div>

                {/* OUTER ORBIT (R=720) */}
                <div className="absolute flex items-center space-x-3" style={{ left: 800 + 720*0.866 - 30, top: 500 - 720*0.5 - 24 }}>
                  <div className="w-12 h-12 rounded-full bg-panel border border-line flex items-center justify-center relative shadow-xl">
                     <svg className="w-6 h-6 text-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                     <div className="absolute -right-3 top-0 bg-red text-white p-1 rounded-full shadow-sm">
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 22 12.28 18.6 15.36 13.45 20.03L12 21.35z"/></svg>
                     </div>
                  </div>
                  <span className="text-[12px] font-black text-text/30">10</span>
                </div>
                <div className="absolute flex items-center space-x-3 opacity-80" style={{ left: 800 + 720 - 25, top: 485 }}>
                   <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                   <span className="text-[12px] font-black text-text/30">68</span>
                </div>
                <div className="absolute flex items-center justify-center" style={{ left: 800 + 720*0.866 - 24, top: 500 + 720*0.5 - 24 }}>
                   <div className="w-12 h-12 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center text-orange shadow-2xl">
                     <Globe className="w-6 h-6" />
                   </div>
                </div>
                <div className="absolute" style={{ left: 800 + 720*0.707 - 25, top: 500 + 720*0.707 - 25 }}>
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
                <span className="text-cyan font-black text-[13px] uppercase tracking-[0.2em] mb-6 drop-shadow-[0_0_8px_rgba(0,245,228,0.3)]">Manthio Study Hub</span>
                
                <h1 className="text-4xl md:text-6xl font-[900] text-text leading-[1.1] tracking-[-0.03em] mb-6 font-sans">
                  The home <br /> for peer <br /> learning
                </h1>
                
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
              {[0,1,2,3,4,5].map((idx) => {
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
                             C 100,500 400,900 1100,1000 
                             L 0,1000 
                             Z" 
                          fill="url(#mathWashGrad)" 
                          className="opacity-60 dark:opacity-80"
                        />
                      </svg>
                    </div>
                    {/* DESKTOP: Atmospheric blur follow-up */}
                    <div 
                      className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-bg to-transparent pointer-events-none z-0 opacity-50 hidden md:block"
                      style={{ clipPath: 'path("M0,0 C100,450 400,850 1100,900 L1100,900 L1100,1000 L0,1000 Z")' }}
                    />

                    {/* MOBILE: Simple full-width bottom gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-[55%] bg-gradient-to-t from-bg via-bg/70 to-transparent pointer-events-none z-0 md:hidden" />

                    {/* CONTENT OVERLAY - BOTTOM LEFT */}
                    <div className="absolute inset-x-0 bottom-0 px-6 md:px-12 pb-24 md:pb-14 flex flex-col items-start text-left max-w-xl z-10 transition-all">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 mb-3 md:mb-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                         <span className="text-[8px] md:text-[9px] font-black text-cyan uppercase tracking-[0.2em]">{s.badge}</span>
                      </div>

                      <h2 className={`text-xl md:text-4xl font-black leading-tight mb-2 md:mb-3 drop-shadow-sm ${theme === 'dark' ? 'text-white' : 'text-text'}`}>
                        {s.title}
                      </h2>

                      <p className={`text-[11px] md:text-sm font-medium leading-relaxed max-w-[85%] md:max-w-md ${theme === 'dark' ? 'text-white/60' : 'text-text/70'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TOP RIGHT UTILITIES */}
            <div className="absolute top-4 md:top-8 right-4 md:right-8 z-50 flex items-center space-x-2">
              <button
                onClick={handleSkipOnboarding}
                className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-text hover:text-cyan px-3 md:px-4 py-1.5 md:py-2 bg-bg/80 backdrop-blur-md border border-line rounded-lg md:rounded-xl transition-all cursor-pointer shadow-xl"
              >
                Skip Onboarding
              </button>
              <button 
                onClick={toggleTheme}
                className="h-8 md:h-10 w-8 md:w-10 flex items-center justify-center rounded-lg md:rounded-xl bg-bg/80 backdrop-blur-md border border-line text-text hover:text-cyan transition-all cursor-pointer shadow-xl"
              >
                {theme === 'dark' ? <Sun className="w-3.5 md:w-4 h-3.5 md:h-4" /> : <Moon className="w-3.5 md:w-4 h-3.5 md:h-4" />}
              </button>
            </div>

            {/* BOTTOM RIGHT CONTROLS */}
            <div className="absolute bottom-6 md:bottom-12 right-4 md:right-10 z-30 flex flex-col items-end space-y-4 md:space-y-6">
              {/* Micro Pagination Tracker */}
              <div className="flex space-x-1.5 pr-0.5">
                {[0,1,2,3,4,5].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-0.5 md:h-1 transition-all duration-500 rounded-full cursor-pointer ${
                      idx === activeIndex ? 'w-6 md:w-8 bg-cyan' : 'w-2 md:w-3 bg-line hover:bg-text/30'
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
                className="h-[36px] md:h-[40px] px-5 md:px-6 rounded-lg bg-cyan/10 border border-cyan/20 text-cyan text-[11px] md:text-[12px] font-black hover:bg-cyan/20 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center space-x-2 cursor-pointer group"
              >
                <span>{activeIndex === 5 ? 'Start' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
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
              {/* Experience Level Question */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-muted font-bold uppercase tracking-wider block px-1">What best describes your current experience level?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        className={`text-center p-4 min-h-[60px] md:min-h-[70px] rounded-2xl border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                          isSelected ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'
                        }`}
                      >
                        <span className="font-bold text-sm md:text-base text-text">{opt.label}</span>
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
                  disabled={!reason || !experienceLevel}
                  className={`font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 text-sm md:text-base hover:scale-105 active:scale-95 shadow-lg ${
                    (!reason || !experienceLevel) 
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
                <h2 className="text-2xl md:text-3xl font-black text-text font-display uppercase">STEP 3 — PREFERENCES</h2>
                <p className="text-muted text-sm md:text-base">
                  We'll adapt your learning path based on your preferences.
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

              {/* Learning Preference Question */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-muted font-bold uppercase tracking-wider block px-1">How do you prefer to learn?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Self-paced', label: 'Self-paced courses' },
                    { id: 'Live cohort', label: 'Live cohort sessions' },
                    { id: 'Hybrid', label: 'Hybrid (self-study + workshops)' },
                    { id: 'No preference', label: 'No preference' }
                  ].map(opt => {
                    const isSelected = learningPreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setLearningPreference(opt.id)}
                        className={`text-center p-3 min-h-[60px] rounded-2xl border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                          isSelected ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'
                        }`}
                      >
                        <span className="font-bold text-xs md:text-sm text-text">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interested Subjects Question */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-muted font-bold uppercase tracking-wider block px-1">What subjects are you most interested in right now?</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'AI', label: 'Artificial Intelligence' },
                    { id: 'Software Dev', label: 'Programming & Software Dev' },
                    { id: 'Cloud', label: 'Cloud & DevOps' },
                    { id: 'Cybersecurity', label: 'Cybersecurity' },
                    { id: 'Data', label: 'Data & Analytics' },
                    { id: 'Other', label: 'Other' }
                  ].map(opt => {
                    const isSelected = interestedSubject === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setInterestedSubject(opt.id)}
                        className={`text-center p-3 min-h-[60px] rounded-2xl border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                          isSelected ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/40 bg-bg/20 hover:bg-bg/40'
                        }`}
                      >
                        <span className="font-bold text-xs md:text-sm text-text">{opt.label}</span>
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
                  disabled={!timeCommitment || !learningPreference || !interestedSubject}
                  className={`font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 text-sm md:text-base hover:scale-105 active:scale-95 shadow-lg ${
                    (!timeCommitment || !learningPreference || !interestedSubject) 
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

            <div className="flex flex-col items-center justify-center gap-6 py-4">
              
              {/* Large Avatar preview */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan via-purple to-yellow rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-32 h-32 rounded-full border-4 border-cyan bg-bg overflow-hidden flex items-center justify-center">
                  <img 
                    src={avatar || defaultAvatar} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

              {/* Select Options */}
              <div className="space-y-4 max-w-sm w-full">
                <div className="space-y-1">
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
                
                <div className="space-y-1 pt-2">
                  <label className="text-xs text-muted font-black uppercase tracking-wider block px-1">Background Image</label>
                  <label className="w-full bg-panel border border-line hover:border-cyan text-text text-sm font-bold p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 text-center select-none border-dashed bg-bg/20">
                    <Camera className="w-4 h-4 text-muted" />
                    <span>Choose Background File</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleBgUpload}
                      className="hidden"
                    />
                  </label>
                  {backgroundImage && (
                    <div className="mt-2 text-xs text-cyan text-center font-bold flex items-center justify-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Background uploaded</span>
                    </div>
                  )}
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
