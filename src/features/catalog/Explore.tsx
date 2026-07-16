import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { COURSES, TRACKS } from '../../services/mockData';
import { useTrack } from '../track-detail/useTrack';
import { useAuth } from '../../context/AuthContext';
import { Search, SlidersHorizontal, BookOpen, Award, Clock, AlertCircle, Star, ArrowRight, Command, Cloud, Database, Hexagon, Box, CheckCircle2, ChevronDown, Check, X, Terminal } from 'lucide-react';
import heroImage from '../../assets/hero-student.png';
import { ParticleNetwork } from '../../components/ui/ParticleNetwork';
import type { CareerTrack } from '../../types';

interface ExploreDropdownOption { label: string; value: string; }
interface ExploreDropdownProps {
  label: string;
  value: string;
  options: ExploreDropdownOption[];
  onChange: (v: string) => void;
}

const ExploreDropdown: React.FC<ExploreDropdownProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;
  const isFiltered = value !== 'All' && value !== options[0]?.value;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Flip the menu to right-aligned when it would overflow the viewport's right edge
  useLayoutEffect(() => {
    if (open && ref.current && menuRef.current) {
      const triggerRect = ref.current.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth;
      setAlignRight(triggerRect.left + menuWidth > window.innerWidth - 8);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
          isFiltered
            ? 'bg-cyan/15 border-cyan text-cyan shadow-[0_0_10px_rgba(0,255,242,0.15)]'
            : 'bg-panel border-line text-muted hover:border-cyan/50 hover:text-text'
        } ${open ? 'border-cyan/60' : ''}`}
      >
        <span>{isFiltered ? `${label}: ${selectedLabel}` : label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div ref={menuRef} className={`absolute top-full mt-2 z-50 min-w-[150px] bg-panel/95 backdrop-blur-xl border border-line/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${alignRight ? 'right-0' : 'left-0'}`}>
          <div className="p-1.5 space-y-0.5">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[11px] font-medium transition-all duration-150 text-left cursor-pointer ${
                  opt.value === value
                    ? 'bg-cyan/15 text-cyan'
                    : 'text-muted hover:bg-line/50 hover:text-text'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const stem = (word: string) => word.toLowerCase().replace(/(ing|ed|s)$/i, '');

// Theme-responsive tag colors per course format (static classes for the Tailwind scanner)
const formatTagClasses: Record<string, string> = {
  'self-paced': 'bg-tag-selfpaced text-bg',
  'cohort': 'bg-tag-cohort text-bg',
  'flipped': 'bg-cyan/80 text-bg',
  'Multiple formats': 'bg-green/80 text-bg',
};

// Level badge (Foundation, Intermediate, Advanced) — theme-responsive over the card image
const levelTagClasses = 'bg-panel/90 backdrop-blur-md text-text';

const fuzzyMatch = (query: string, text: string): boolean => {
  if (!query || !text) return false;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  
  const qWords = q.split(/\s+/).map(stem).filter(Boolean);
  const tWords = t.split(/\W+/).map(stem).filter(Boolean);
  
  if (qWords.length === 0) return true;
  
  for (const qw of qWords) {
    let found = false;
    for (const tw of tWords) {
      if (tw.includes(qw)) { found = true; break; }
      const threshold = qw.length <= 4 ? 1 : 2;
      if (Math.abs(qw.length - tw.length) <= threshold && levenshtein(qw, tw) <= threshold) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
};

interface ExploreProps {
  onNavigate: (page: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({ onNavigate }) => {
  const { setActiveCourseId, setActiveTrackId, isAuthenticated } = useAuth();
  const { getProgress, getTrackPercentage } = useTrack();
  const [discoveryMode, setDiscoveryMode] = useState<'courses' | 'tracks'>('tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Recommended');

  // Loading & Error States (REQ-LOAD-002, REQ-LOAD-004)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [enrollCourse, setEnrollCourse] = useState<typeof COURSES[0] | null>(null);

  // Motion and Animation States
  const [scrollY, setScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  React.useEffect(() => {
    localStorage.setItem('catalogDiscoveryMode', discoveryMode);
  }, [discoveryMode]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const simulateLoad = () => {
    setIsLoading(true);
    setIsError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return timer;
  };

  const handleDiscoveryModeChange = (mode: 'courses' | 'tracks') => {
    setDiscoveryMode(mode);
    simulateLoad();
  };

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 850);
  };

  // Unique values for filters
  const topics = Array.from(new Set(COURSES.map(c => c.topic))).filter(Boolean) as string[];

  // Filter courses
  const filteredCourses = (discoveryMode === 'courses' ? COURSES : []).filter(course => {

    // Search query filtering
    if (searchQuery) {
      const matchTitle = fuzzyMatch(searchQuery, course.title);
      const matchDesc = fuzzyMatch(searchQuery, course.description);
      const matchTrainer = fuzzyMatch(searchQuery, course.trainer.name);
      const matchTags = (course.tags || []).some(tag => fuzzyMatch(searchQuery, tag));
      
      if (!matchTitle && !matchDesc && !matchTrainer && !matchTags) return false;
    }

    // Filter selectors
    if (selectedLevel !== 'All' && course.level !== selectedLevel) return false;
    if (selectedFormat !== 'All' && course.format !== selectedFormat) return false;
    if (selectedTopic !== 'All' && course.topic !== selectedTopic) return false;
    if (selectedLanguage !== 'All' && course.language !== selectedLanguage) return false;

    return true;
  });

  // Sort logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'Newest') return b.id.localeCompare(a.id); // Mocking newest
    if (sortBy === 'Most popular') return (b.ratingCount || 0) - (a.ratingCount || 0);
    if (sortBy === 'Highest rated') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
    return 0; // Recommended
  });

  const tracksToShow = discoveryMode === 'tracks' ? TRACKS.filter(t => {
    // Search and Level filtering
    if (searchQuery) {
      const matchTitle = fuzzyMatch(searchQuery, t.title);
      const matchDesc = fuzzyMatch(searchQuery, t.outcomeStatement);
      const matchTags = (t.tags || []).some(tag => fuzzyMatch(searchQuery, tag));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    
    if (selectedLevel !== 'All' && t.level !== selectedLevel) return false;
    
    // Tracks filters
    if (selectedGoal !== 'All') {
      const goalType = t.id.includes('cloud') ? 'Role' : t.id.includes('data') ? 'Certification' : 'Role';
      if (goalType !== selectedGoal) return false;
    }
    
    if (selectedTimeRange !== 'All') {
      const hours = parseInt(t.estimatedTime.split(' ')[0]);
      if (selectedTimeRange === '<20' && hours >= 20) return false;
      if (selectedTimeRange === '20-40' && (hours < 20 || hours > 40)) return false;
      if (selectedTimeRange === '40+' && hours <= 40) return false;
    }

    return true;
  }) : [];

  const renderFirstCTA = () => (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col md:flex-row py-16 my-16 group gap-8 md:gap-12 w-full items-center relative isolate">
      {/* Full-bleed background breakout */}
      <div className="absolute top-0 w-[100vw] h-full bg-panel -z-10" style={{ left: 'calc(50% - 50vw)' }} />
      
      <div className="flex-1 space-y-6 relative z-10 flex flex-col justify-center items-start w-full">
        <h3 className="text-3xl md:text-4xl font-black text-text font-display leading-tight">
          Elevate your learning experience
        </h3>
        <div className="space-y-4 w-full">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan mt-1 shrink-0" />
            <div>
              <h4 className="font-bold text-text">Organization Sponsors</h4>
              <p className="text-muted text-sm">Let your employer invest in your growth by covering the cost of your courses.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple mt-1 shrink-0" />
            <div>
              <h4 className="font-bold text-text">Live Sessions</h4>
              <p className="text-muted text-sm">Join real-time interactive classes with expert instructors.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-yellow mt-1 shrink-0" />
            <div>
              <h4 className="font-bold text-text">Direct Tutor Chat</h4>
              <p className="text-muted text-sm">Chat with your tutor anytime you need help or guidance.</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('signup')}
          className="px-8 py-3 bg-transparent border border-cyan text-cyan hover:bg-cyan/10 font-bold rounded-xl transition-all cursor-pointer hover:-translate-y-1 mt-4"
        >
          Discover All Features
        </button>
      </div>
      <div className="flex-1 relative flex items-center justify-end w-full">
        <div className="flex flex-col gap-4 w-full max-w-lg z-10">
          <div className="flex gap-4">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80" 
              alt="Organization Sponsors" 
              className="w-1/2 h-32 md:h-40 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
            />
            <img 
              src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&auto=format&fit=crop&q=80" 
              alt="Live Sessions" 
              className="w-1/2 h-32 md:h-40 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80" 
              alt="Chat with Tutor" 
              className="w-1/2 h-32 md:h-40 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) rotate(2deg); }
          50% { transform: translateY(10px) rotate(0deg); }
        }
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          50% { transform: translateY(120vh); opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 7s ease-in-out infinite;
        }
      `}</style>
      {!isAuthenticated && (
        <>
          <div className="relative w-[100vw] ml-[calc(50%-50vw)] overflow-hidden mb-20 flex flex-col items-center justify-center min-h-[90svh] pt-12 lg:pt-28 pb-12" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
          
          {/* Moving Particle Network Background */}
          <div className="absolute top-0 left-0 w-full h-full lg:h-[120vh] pointer-events-none z-0 overflow-hidden">
             {/* Base dark/cyan glow */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.05)_0%,transparent_80%)] z-0" />
             
             {/* The dynamic network canvas */}
             <ParticleNetwork className="z-10" />
             
             {/* Fades on the edges to blend into the rest of the page */}
             <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg z-20" />
             <div className="absolute inset-0 bg-gradient-to-r from-bg/40 via-transparent to-bg z-20" />
          </div>


          <div 
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan/10 rounded-full blur-[80px] opacity-30 pointer-events-none transition-transform duration-1000"
            style={{ transform: `translate(-50%, ${scrollY * 0.2}px)` }}
          />
          <div 
            className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple/10 rounded-full blur-[60px] opacity-20 pointer-events-none transition-transform duration-1000"
            style={{ transform: `translate(-50%, ${scrollY * 0.1}px)` }}
          />

          {/* Main Hero Split Content (Inspired by mockup) */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-4 md:px-8 max-w-[1400px] mx-auto gap-8 lg:gap-12 mt-4 lg:mt-8 w-full">
            
            {/* Top Left Confetti (Yellow Dashes) */}
            <div className="absolute top-[-5%] left-[2%] opacity-60 hidden lg:block">
              <svg width="80" height="80" viewBox="0 0 100 100" className="text-yellow stroke-current stroke-[5] stroke-linecap-round">
                <line x1="20" y1="30" x2="35" y2="25" />
                <line x1="10" y1="50" x2="25" y2="45" />
                <line x1="15" y1="70" x2="30" y2="60" />
                <line x1="40" y1="20" x2="55" y2="15" />
                <line x1="35" y1="40" x2="50" y2="35" />
                <line x1="30" y1="85" x2="40" y2="70" />
                <line x1="55" y1="55" x2="70" y2="50" />
                <line x1="65" y1="30" x2="80" y2="30" />
              </svg>
            </div>

            {/* Left: Text Content */}
            <div className="flex-1 flex flex-col items-start text-left space-y-4 w-full lg:max-w-2xl relative z-20">
              
              {/* Subtitle Above */}
              <div className="text-cyan font-bold tracking-wide text-sm md:text-base">
                Start your favourite course
              </div>

              {/* Main Title */}
              <h1 className="text-[32px] leading-[1.3] sm:text-4xl lg:text-5xl xl:text-6xl font-black text-text font-display sm:leading-[1.1] tracking-tight">
                Learn anywhere.<br />
                Build your <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple">
                  career.
                  {/* Swoosh Underline */}
                  <svg className="absolute w-full h-4 -bottom-2 left-0 text-cyan opacity-80" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M5,15 Q100,0 195,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <path d="M15,19 Q100,5 185,19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                  </svg>
                </span>
              </h1>

              <p className="text-muted text-base md:text-lg leading-relaxed max-w-md mt-4">
                Accelerate your journey with interactive, hands-on courses.
              </p>

              {/* Button */}
              <div className="pt-6">
                <button 
                  onClick={() => onNavigate('signup')} 
                  className="px-8 py-4 bg-cyan text-bg hover:bg-cyan/90 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] cursor-pointer flex items-center justify-center gap-2 text-base hover:-translate-y-1 tracking-wide"
                >
                  Start Your Journey
                  <svg 
                    xmlns="http://www.w3.org" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5} 
                    stroke="currentColor" 
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Student Image & Badges */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-[600px] mx-auto lg:mx-0 flex justify-center items-end mt-16 lg:mt-0">
               
               {/* Arrow pointing down-left towards center */}
               <div className="absolute top-[10%] left-[-15%] hidden lg:block opacity-60 text-yellow z-0">
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M90,20 Q50,10 20,60" />
                     <path d="M20,60 L40,55 M20,60 L25,40" />
                  </svg>
               </div>
               
               {/* Arrow pointing up-right from bottom */}
               <div className="absolute bottom-[30%] right-[-10%] hidden lg:block opacity-60 text-cyan z-0">
                  <svg width="60" height="120" viewBox="0 0 60 120" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M10,110 Q50,60 20,10" />
                     <path d="M20,10 L40,20 M20,10 L10,30" />
                  </svg>
               </div>

               {/* Center Floating Badge (Courses) */}
               <div className="absolute top-[15%] lg:top-[25%] left-0 lg:-left-12 z-20 flex flex-col items-center animate-float">
                 <div className="w-32 h-32 rounded-full bg-panel/95 border-2 border-cyan/40 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.25)] backdrop-blur-md relative">
                   <Terminal className="w-8 h-8 text-cyan mb-1" />
                   <span className="text-2xl font-black text-text">1,235</span>
                   <span className="text-sm text-muted font-medium">courses</span>
                   {/* Decorative underline swooshes */}
                   <svg className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-8 text-cyan opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M10,15 Q50,30 90,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      <path d="M20,25 Q50,35 80,25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60" />
                   </svg>
                 </div>
               </div>

               {/* Image */}
               <img 
                 src={heroImage} 
                 alt="Student studying with laptop" 
                 className="w-full h-auto object-contain z-10 scale-[1.15] -translate-y-4"
                 style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
               />


            </div>
          </div>
        </div>
          
        {/* --- REDSUN TEMPLATE LAYOUT EXTENSIONS --- */}
          
          {/* Logo Marquee */}
          <div className="w-full mt-24 mb-16 px-4">
            <p className="text-center text-muted text-sm font-semibold mb-8 uppercase tracking-wider">Join 4,000+ developers already growing</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
               <div className="flex items-center space-x-2"><Command className="w-6 h-6"/><span className="font-bold text-lg">TechCorp</span></div>
               <div className="flex items-center space-x-2"><Cloud className="w-6 h-6"/><span className="font-bold text-lg">CloudSync</span></div>
               <div className="flex items-center space-x-2"><Database className="w-6 h-6"/><span className="font-bold text-lg">DataFlow</span></div>
               <div className="flex items-center space-x-2"><Hexagon className="w-6 h-6"/><span className="font-bold text-lg">HexaBuild</span></div>
               <div className="flex items-center space-x-2"><Box className="w-6 h-6"/><span className="font-bold text-lg">Boxed</span></div>
            </div>
          </div>



          {/* Powerful Features Vertical Alternating list */}
          <div id="section-features" className="w-full max-w-[1300px] mx-auto mb-24 space-y-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">Powerful Features</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">Explore the frontier of coding evolution. Our latest features redefine the boundaries of what's possible in learning.</p>
            </div>

            {/* Feature 1 (Text Left, Image Right) - AI Sessions */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="md:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-text">AI Sessions, get unstuck in seconds</h3>
                <p className="text-muted text-lg leading-relaxed">
                  Get unstuck instantly with our state-of-the-art AI tutor that understands your code and guides you without giving away the answers.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-cyan"/><span className="text-text font-medium">Context-aware AI that reads your code.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-cyan"/><span className="text-text font-medium">Guided hints never spoils the solution.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-cyan"/><span className="text-text font-medium">Available 24/7 for any language or topic.</span></li>
                </ul>
                <div className="pt-4">
                  {/* Desktop button only; mobile variant placed after the card */}
                  <button onClick={() => onNavigate('signin')} className="hidden md:flex items-center space-x-2 text-cyan font-bold hover:text-cyan2 transition-colors cursor-pointer">
                    <span>Try AI Tutor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 w-full h-[400px] bg-bg border border-line rounded-3xl overflow-hidden relative group">
                 <img 
                    src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop&q=80" 
                    alt="AI Tutor Session" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan/20 to-purple/20 mix-blend-overlay group-hover:opacity-50 transition-opacity" />
              </div>
              {/* Mobile-only button placed after the card so it appears below the card on phones */}
              <div className="w-full md:hidden flex justify-center">
                <button onClick={() => onNavigate('signin')} className="flex items-center space-x-2 text-cyan font-bold hover:text-cyan2 transition-colors py-3 cursor-pointer">
                  <span>Try AI Tutor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 2 (Image Left, Text Right) - Multiple Format Courses */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="md:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-text">Multiple formats to fit your learning style</h3>
                <p className="text-muted text-lg leading-relaxed">
                  Whether you prefer learning on your own schedule or thriving in a group setting, we offer flexible course formats designed for you.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-green"/><span className="text-text font-medium">Self-paced: Learn at your own speed, anytime.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-green"/><span className="text-text font-medium">Cohort: Join a group of peers and learn together.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-green"/><span className="text-text font-medium">Flipped: Review materials beforehand, engage deeply in sessions.</span></li>
                </ul>
                <div className="pt-4">
                  {/* Desktop button only; mobile variant placed after the card */}
                  <button onClick={() => onNavigate('courses')} className="hidden md:flex items-center space-x-2 text-green font-bold hover:text-green/80 transition-colors cursor-pointer">
                    <span>Explore Formats</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 w-full h-[400px] bg-bg border border-line rounded-3xl overflow-hidden relative group">
                 <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80" 
                    alt="Multiple Format Courses" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-tr from-green/20 to-teal/20 mix-blend-overlay group-hover:opacity-50 transition-opacity" />
              </div>
              {/* Mobile-only button placed after the card so it appears below the card on phones */}
              <div className="w-full md:hidden flex justify-center">
                <button onClick={() => onNavigate('courses')} className="flex items-center space-x-2 text-green font-bold hover:text-green/80 transition-colors py-3 cursor-pointer">
                  <span>Explore Formats</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 3 (Text Left, Image Right) - Top Management */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="md:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-text">Top Management, to help you see the bigger picture</h3>
                <p className="text-muted text-lg leading-relaxed">
                  Track your progress across multiple courses, view your skill tree, and identify areas for improvement instantly.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-cyan"/><span className="text-text font-medium">Customizable layouts for efficient coding.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-cyan"/><span className="text-text font-medium">Font preferences to match your style.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-cyan"/><span className="text-text font-medium">Create multiple profiles for versatility.</span></li>
                </ul>
                <div className="pt-4">
                  {/* Desktop button only; mobile variant placed after the card */}
                  <button onClick={() => onNavigate('signin')} className="hidden md:flex items-center space-x-2 text-cyan font-bold hover:text-cyan2 transition-colors cursor-pointer">
                    <span>See Doc</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 w-full h-[400px] bg-bg border border-line rounded-3xl overflow-hidden relative group">
                 <img 
                    src="https://images.unsplash.com/photo-1649478680984-01586ce84ac0?w=800&auto=format&fit=crop&q=80" 
                    alt="Management Dashboard" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan/20 to-purple/20 mix-blend-overlay group-hover:opacity-50 transition-opacity" />
              </div>
              {/* Mobile-only button placed after the card so it appears below the card on phones */}
              <div className="w-full md:hidden flex justify-center">
                <button onClick={() => onNavigate('signin')} className="flex items-center space-x-2 text-cyan font-bold hover:text-cyan2 transition-colors py-3 cursor-pointer">
                  <span>See Doc</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature 4 (Image Left, Text Right) - Real-time Collaboration */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="md:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-text">Real-time collaboration and feedback</h3>
                <p className="text-muted text-lg leading-relaxed">
                  Code alongside peers or get instant reviews from our AI. Never get stuck on a difficult problem again.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-purple"/><span className="text-text font-medium">Live multiplayer coding sessions.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-purple"/><span className="text-text font-medium">Instant AI code reviews.</span></li>
                  <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-purple"/><span className="text-text font-medium">Shareable workspace links.</span></li>
                </ul>
                <div className="pt-4">
                  {/* Desktop-only button; mobile copy below the card */}
                  <button onClick={() => onNavigate('signin')} className="hidden md:flex items-center space-x-2 text-purple font-bold hover:text-purple/80 transition-colors cursor-pointer">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 w-full h-[400px] bg-bg border border-line rounded-3xl overflow-hidden relative group">
                 <img 
                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80" 
                    alt="Team Collaboration" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-tl from-purple/20 to-cyan/20 mix-blend-overlay group-hover:opacity-50 transition-opacity" />
              </div>
              {/* Mobile-only button placed after the card so it appears below the card on phones */}
              <div className="w-full md:hidden flex justify-center">
                <button onClick={() => onNavigate('signin')} className="flex items-center space-x-2 text-purple font-bold hover:text-purple/80 transition-colors py-3 cursor-pointer">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Feature 5 (Text Left, Image Right) - Streaks & Gamification */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 max-w-[1300px] mx-auto mb-24">
            <div className="md:w-1/2 space-y-6">
              <h3 className="text-3xl font-bold text-text">Keep your momentum with Streaks & XP</h3>
              <p className="text-muted text-lg leading-relaxed">
                Stay motivated and build a daily learning habit. Earn XP for every course completed, maintain your daily streaks, and climb the leaderboard.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-yellow"/><span className="text-text font-medium">Daily streak tracking and reminders.</span></li>
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-yellow"/><span className="text-text font-medium">Earn XP to unlock new badges and avatars.</span></li>
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-yellow"/><span className="text-text font-medium">Compete with peers on the leaderboard.</span></li>
              </ul>
              <div className="pt-4">
                <button onClick={() => onNavigate('signup')} className="hidden md:flex items-center space-x-2 text-yellow font-bold hover:text-yellow/80 transition-colors cursor-pointer">
                  <span>Start Your Streak</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="md:w-1/2 w-full h-[400px] bg-bg border border-line rounded-3xl overflow-hidden relative group">
               <img
                  src="https://cdn.dribbble.com/userupload/42944401/file/original-43d273b30cd843b5293edaa8ee39617c.png?resize=752x&vertical=center"
                  alt="Streaks & XP"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-yellow/10 to-orange/10 mix-blend-overlay group-hover:opacity-50 transition-opacity pointer-events-none" />
            </div>
            <div className="w-full md:hidden flex justify-center">
              <button onClick={() => onNavigate('signup')} className="flex items-center space-x-2 text-yellow font-bold hover:text-yellow/80 transition-colors py-3 cursor-pointer">
                <span>Start Your Streak</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Auto-Scrolling Marquee Section */}
          <div id="section-stack" className="relative w-screen left-1/2 -translate-x-1/2 bg-bg pt-16 pb-24 overflow-hidden border-y border-line/50">
            <style>{`
              @keyframes marquee-left {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes marquee-right {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
              .animate-marquee-left {
                animation: marquee-left 40s linear infinite;
              }
              .animate-marquee-right {
                animation: marquee-right 40s linear infinite;
              }
              .marquee-track {
                width: max-content;
              }
            `}</style>
            
            <div className="text-center max-w-3xl mx-auto px-6 mb-16 relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-[64px] font-medium text-text mb-6 font-display tracking-tight leading-[1.1]">
                Master the Most<br className="hidden md:block"/> In-Demand Tech
              </h2>
              <p className="text-muted text-base md:text-xl mb-10 max-w-2xl mx-auto font-light">
                Learn modern frameworks, languages, and tools through hands-on, interactive coding sessions.
              </p>
              <button 
                onClick={() => onNavigate('signup')} 
                className="bg-cyan hover:bg-cyan2 text-bg px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] cursor-pointer flex items-center gap-2 mx-auto hover:-translate-y-1"
              >
                Start Learning Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Marquee Tracks */}
            <div className="flex flex-col gap-6 relative z-0">
              {/* Fade Edges */}
              <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

              {/* Track 1 (Left) */}
              <div className="flex animate-marquee-left gap-6 marquee-track hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-6 shrink-0">
                    {[
                      { name: 'Python', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
                      { name: 'JavaScript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
                      { name: 'AWS', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
                      { name: 'C++', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg' },
                      { name: 'React', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
                      { name: 'Docker', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
                      { name: 'Node.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
                      { name: 'Git', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
                    ].map((icon, j) => (
                      <div key={j} className="w-32 h-20 md:w-48 md:h-28 rounded-2xl bg-panel flex items-center justify-center shrink-0 border border-line/20 shadow-lg hover:border-cyan/50 transition-colors cursor-pointer group">
                        <img src={icon.url} alt={icon.name} className="w-10 h-10 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Track 2 (Right) */}
              <div className="flex animate-marquee-right gap-6 marquee-track hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-6 shrink-0">
                    {[
                      { name: 'Go', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg' },
                      { name: 'TypeScript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
                      { name: 'PostgreSQL', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
                      { name: 'Kubernetes', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg' },
                      { name: 'Rust', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg' },
                      { name: 'Next.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
                      { name: 'Vue.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg' },
                      { name: 'Linux', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg' },
                    ].map((icon, j) => (
                      <div key={j} className="w-32 h-20 md:w-48 md:h-28 rounded-2xl bg-panel flex items-center justify-center shrink-0 border border-line/20 shadow-lg hover:border-cyan/50 transition-colors cursor-pointer group">
                        {icon.name === 'Next.js' ? 
                           <img src={icon.url} alt={icon.name} className="w-10 h-10 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform duration-500 dark:invert" />
                           :
                           <img src={icon.url} alt={icon.name} className="w-10 h-10 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform duration-500" />
                        }
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-16 text-sm text-muted relative z-10">
              <div className="text-center">
                 <h4 className="font-bold text-text mb-1">Industry Standard</h4>
                 <p className="text-xs max-w-[120px]">Learn the tools used by top tech companies.</p>
              </div>
              <div className="text-center">
                 <h4 className="font-bold text-text mb-1">Hands-on Practice</h4>
                 <p className="text-xs max-w-[120px]">Write code directly in the browser.</p>
              </div>
              <div className="text-center">
                 <h4 className="font-bold text-text mb-1">AI Guided</h4>
                 <p className="text-xs max-w-[120px]">Get instant feedback and help when stuck.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* REQ-CATALOG-002: Discovery Modes */}
      <div id="section-courses" className="flex justify-center mb-2">
        <div className="bg-panel border border-line p-1 rounded-2xl flex space-x-1 shadow-sm">
          <button 
            onClick={() => handleDiscoveryModeChange('tracks')}
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${discoveryMode === 'tracks' ? 'bg-cyan text-bg shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'text-muted hover:text-text hover:bg-bg/50'}`}
          >
            Tracks
          </button>
          <button 
            onClick={() => handleDiscoveryModeChange('courses')}
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${discoveryMode === 'courses' ? 'bg-cyan text-bg shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'text-muted hover:text-text hover:bg-bg/50'}`}
          >
            Courses
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {discoveryMode === 'tracks' ? 'Career Tracks' : 'Course Catalog'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {discoveryMode === 'tracks' 
              ? 'Multi-course sequences designed for defined professional outcomes.' 
              : 'Discover individual topics or continue your existing courses.'}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder={discoveryMode === 'tracks' ? "Search tracks..." : "Search for courses or topics..."} 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); simulateLoad(); }}
            className="w-full bg-panel border border-line rounded-xl pl-10 pr-4 py-2 text-sm text-text focus:border-cyan focus:outline-none !outline-none transition-colors shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-muted" />
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex space-x-1 bg-panel border border-line p-1 rounded-xl">
          <div className="px-4 py-1.5 text-xs font-semibold text-muted">
            {discoveryMode === 'courses' ? 'All Courses' : 'Curated Curriculum'}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted hidden sm:block" />

          <ExploreDropdown
            label="Level"
            value={selectedLevel}
            onChange={(v) => { setSelectedLevel(v); simulateLoad(); }}
            options={[
              { label: 'All Levels', value: 'All' },
              { label: 'Foundation', value: 'Foundation' },
              { label: 'Intermediate', value: 'Intermediate' },
              { label: 'Advanced', value: 'Advanced' },
            ]}
          />

          {discoveryMode === 'courses' && (
            <>
              <ExploreDropdown
                label="Topic"
                value={selectedTopic}
                onChange={(v) => { setSelectedTopic(v); simulateLoad(); }}
                options={[{ label: 'All Topics', value: 'All' }, ...topics.map((t): ExploreDropdownOption => ({ label: t, value: t }))]}
              />

              <ExploreDropdown
                label="Format"
                value={selectedFormat}
                onChange={(v) => { setSelectedFormat(v); simulateLoad(); }}
                options={[
                  { label: 'All Formats', value: 'All' },
                  { label: 'Flipped', value: 'flipped' },
                  { label: 'Self-paced', value: 'self-paced' },
                  { label: 'Cohort', value: 'cohort' },
                ]}
              />

              <ExploreDropdown
                label="Language"
                value={selectedLanguage}
                onChange={(v) => { setSelectedLanguage(v); simulateLoad(); }}
                options={[
                  { label: 'All Languages', value: 'All' },
                  { label: 'English', value: 'English' },
                  { label: 'German', value: 'German' },
                  { label: 'French', value: 'French' },
                ]}
              />

              <ExploreDropdown
                label="Sort"
                value={sortBy}
                onChange={(v) => { setSortBy(v); simulateLoad(); }}
                options={[
                  { label: 'Recommended', value: 'Recommended' },
                  { label: 'Newest', value: 'Newest' },
                  { label: 'Most popular', value: 'Most popular' },
                  { label: 'Highest rated', value: 'Highest rated' },
                  { label: 'A–Z', value: 'Alphabetical' },
                ]}
              />
            </>
          )}

          {discoveryMode === 'tracks' && (
            <>
              <ExploreDropdown
                label="Goal"
                value={selectedGoal}
                onChange={(v) => { setSelectedGoal(v); simulateLoad(); }}
                options={[
                  { label: 'All Goals', value: 'All' },
                  { label: 'Certification', value: 'Certification' },
                  { label: 'Role', value: 'Role' },
                  { label: 'Project', value: 'Project' },
                  { label: 'Topic', value: 'Topic' },
                ]}
              />

              <ExploreDropdown
                label="Duration"
                value={selectedTimeRange}
                onChange={(v) => { setSelectedTimeRange(v); simulateLoad(); }}
                options={[
                  { label: 'Any Duration', value: 'All' },
                  { label: 'Under 20h', value: '<20' },
                  { label: '20–40h', value: '20-40' },
                  { label: '40h+', value: '40+' },
                ]}
              />
            </>
          )}
        </div>
      </div>

      {/* REQ-CATALOG-004: Active Filter Chips */}
      {(() => {
        const activeFilters = [];
        if (selectedLevel !== 'All') activeFilters.push({ label: `Level: ${selectedLevel}`, clear: () => setSelectedLevel('All') });
        if (discoveryMode === 'courses') {
          if (selectedTopic !== 'All') activeFilters.push({ label: `Topic: ${selectedTopic}`, clear: () => setSelectedTopic('All') });
          if (selectedFormat !== 'All') activeFilters.push({ label: `Format: ${selectedFormat}`, clear: () => setSelectedFormat('All') });
          if (selectedLanguage !== 'All') activeFilters.push({ label: `Language: ${selectedLanguage}`, clear: () => setSelectedLanguage('All') });
        } else {
          if (selectedGoal !== 'All') activeFilters.push({ label: `Goal: ${selectedGoal}`, clear: () => setSelectedGoal('All') });
          if (selectedTimeRange !== 'All') activeFilters.push({ label: `Time: ${selectedTimeRange}`, clear: () => setSelectedTimeRange('All') });
        }

        if (activeFilters.length === 0) return null;

        return (
          <div className="flex flex-wrap items-center gap-2 -mt-2 pb-4">
            <span className="text-[10px] text-muted font-bold uppercase mr-1">Active Filters:</span>
            {activeFilters.map((filter, i) => (
              <span key={i} className="flex items-center space-x-1 bg-cyan/10 border border-cyan/20 text-cyan text-[11px] font-bold px-2.5 py-1 rounded-lg">
                <span>{filter.label}</span>
                <button onClick={() => { filter.clear(); simulateLoad(); }} className="hover:text-text cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button 
              onClick={() => {
                setSelectedLevel('All');
                setSelectedTopic('All');
                setSelectedFormat('All');
                setSelectedLanguage('All');
                setSelectedGoal('All');
                setSelectedTimeRange('All');
                simulateLoad();
              }} 
              className="text-[10px] font-bold text-muted hover:text-text cursor-pointer uppercase underline underline-offset-2 ml-2"
            >
              Clear All
            </button>
          </div>
        );
      })()}

      {/* REQ-LOAD-004: Failed load with retry action */}
      {isError ? (
        <div className="text-center py-16 max-w-md mx-auto my-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-bold text-text text-base">Failed to load courses</h3>
            <p className="text-muted text-xs max-w-xs mx-auto">We encountered an issue retrieving the course list. Please check your network connection.</p>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading ? (
        /* REQ-LOAD-002: Skeleton loader mimicking layout shape */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className="bg-panel border border-line rounded-2xl overflow-hidden flex flex-col justify-between h-[420px]"
            >
              <div>
                {/* Header Image Skeleton */}
                <div className="h-46 bg-bg border-b border-line animate-pulse relative">
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="h-4 w-14 bg-line rounded animate-pulse" />
                    <div className="h-4 w-16 bg-line rounded animate-pulse" />
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="p-5 space-y-4">
                  <div className="h-5 bg-line rounded w-3/4 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-line rounded w-full animate-pulse" />
                    <div className="h-3 bg-line rounded w-5/6 animate-pulse" />
                    <div className="h-3 bg-line rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-4 pt-3">
                    <div className="h-3.5 bg-line rounded w-16 animate-pulse" />
                    <div className="h-3.5 bg-line rounded w-20 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Action Bar Skeleton */}
              <div className="p-5 pt-0 border-t border-line mt-4 flex items-center justify-between">
                <div className="h-4 bg-line rounded w-16 animate-pulse" />
                <div className="h-8 bg-line rounded w-28 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (discoveryMode === 'courses' ? sortedCourses : tracksToShow).length === 0 ? (
        /* REQ-LOAD-001: Every list view has a defined empty state with primary action */
        <div className="text-center py-16 bg-panel border border-line rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          {discoveryMode === 'courses' ? (
              <>
                <h3 className="font-bold text-text">No courses found</h3>
                <p className="text-muted text-sm mt-1 max-w-sm mx-auto">Adjust your search query or filter selectors to find matching courses.</p>
                <button 
                  onClick={() => { setSelectedLevel('All'); setSelectedFormat('All'); setSelectedTopic('All'); setSearchQuery(''); }}
                  className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </>
          ) : (
            <>
              <h3 className="font-bold text-text">No tracks found</h3>
              <p className="text-muted text-sm mt-1 max-w-sm mx-auto">Adjust your search query or level selector to find matching career tracks.</p>
              <button 
                onClick={() => { setSelectedLevel('All'); setSearchQuery(''); }}
                className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {discoveryMode === 'courses' ? sortedCourses.slice(0, !isAuthenticated ? 6 : undefined).map((course, index) => (
            <React.Fragment key={course.id}>
              {/* First CTA: Image Split Design */}
              {!isAuthenticated && index === 3 && renderFirstCTA()}

            <div 
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:translate-y-[-4px] duration-300 h-[420px]"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm ${levelTagClasses}`}>
                      {course.level}
                    </span>
                    <span className={`backdrop-blur-md text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm ${formatTagClasses[course.format] ?? 'bg-cyan/80 text-bg'}`}>
                      {course.format}
                    </span>
                    {course.tags?.map(tag => (
                      <span key={tag} className={`backdrop-blur-md text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm whitespace-nowrap bg-tag-skill text-bg`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {course.startDate && (
                    <div className="absolute bottom-2 right-3 bg-bg/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-cyan border border-cyan/30 shadow-sm">
                      Starts: {course.startDate}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-text group-hover:text-cyan transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-muted text-[11px] line-clamp-2 leading-relaxed min-h-[32px]">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 pt-2.5 text-[11px] font-bold">
                    <div className="flex items-center space-x-1.5 h-4">
                      <Award className="w-4 h-4 text-cyan flex-shrink-0" />
                      <span className="text-text inline-flex items-center">+{course.xpReward} XP</span>
                    </div>
                    <div className="flex items-center space-x-1.5 h-4">
                      <Clock className="w-4 h-4 text-cyan flex-shrink-0" />
                      <span className="text-text inline-flex items-center">{course.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-4 border-t border-line mt-auto flex items-center justify-between bg-bg/20">
                <div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted font-bold uppercase mb-0.5 tracking-tight">Booking Info</span>
                    <span className="text-[15px] font-black text-text tracking-tight">
                      {course.priceStatus === 'included' ? 'Included' : course.priceStatus === 'employer' ? 'Company Paid' : course.price}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setActiveTrackId(null);
                    setActiveCourseId(course.id);
                    if (course.priceStatus === 'included' || course.priceStatus === 'employer') {
                      setEnrollCourse(course);
                    } else {
                      onNavigate('course-detail');
                    }
                  }}
                  className={`relative overflow-hidden group/btn bg-cyan hover:bg-cyan/90 text-bg text-[12px] font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)] hover:translate-y-[-2px] cursor-pointer`}
                >
                  <span className="relative z-10">Enrol Now</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              </div>
            </div>
            </React.Fragment>
          )) : tracksToShow.slice(0, !isAuthenticated ? 6 : undefined).map((track, index) => (
            <React.Fragment key={track.id}>
              {/* First CTA: Image Split Design */}
              {!isAuthenticated && index === 3 && renderFirstCTA()}

            <div 
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:translate-y-[-4px] duration-300 h-[420px]"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm ${levelTagClasses}`}>
                      {track.level}
                    </span>
                    <span className={`backdrop-blur-md text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm whitespace-nowrap bg-cyan text-bg`}>
                        Career Track
                    </span>
                    {track.tags?.map(tag => (
                      <span key={tag} className={`backdrop-blur-md text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm whitespace-nowrap bg-tag-skill text-bg`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-2 right-3 bg-bg/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-black text-cyan border border-cyan/30 shadow-sm uppercase tracking-wider">
                    {track.coursesCount} Courses in Path
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-text group-hover:text-cyan transition-colors line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-muted text-[11px] line-clamp-2 leading-relaxed min-h-[32px]">
                    {track.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 pt-2.5 text-[11px] font-bold">
                    <div className="flex items-center space-x-1.5 h-4">
                      <Clock className="w-4 h-4 text-cyan flex-shrink-0" />
                      <span className="text-text inline-flex items-center">{track.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-4 border-t border-line mt-auto flex items-center justify-between gap-3 bg-bg/20">
                <div className="min-w-0">
                  {getTrackPercentage(track as unknown as CareerTrack) === 100 || !!getProgress(track.id)?.enrolledAt || track.enrolled ? (
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
                        {getTrackPercentage(track as unknown as CareerTrack) === 100 ? (
                          <div className="bg-green/10 p-1.5 rounded-full ring-2 ring-green/20">
                            <CheckCircle2 className="w-5 h-5 text-green" />
                          </div>
                        ) : (
                          <div className="relative w-9 h-9">
                            <svg className="w-9 h-9 -rotate-90">
                              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-line opacity-20" />
                              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={100} strokeDashoffset={100 - (100 * getTrackPercentage(track as unknown as CareerTrack)) / 100} className="text-cyan transition-all duration-1000 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-text">
                              {getTrackPercentage(track as unknown as CareerTrack)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-cyan font-black leading-none mb-1 uppercase tracking-wider truncate">
                          {getTrackPercentage(track as unknown as CareerTrack) === 100 ? 'Completed' : 'Active'}
                        </span>
                        <span className="text-[12px] font-bold text-text opacity-80 truncate">
                          {getTrackPercentage(track as unknown as CareerTrack) === 100 ? 'Review Final Step' : 'Resume Learning'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-muted font-bold uppercase mb-0.5 tracking-tight truncate">Multi Course</span>
                      <span className="text-[15px] font-black text-text tracking-tight uppercase truncate">CHF {((track as unknown as CareerTrack).coursesCount * 120 * 0.8).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setActiveTrackId(track.id);
                    onNavigate('track-detail');
                  }}
                  className="relative overflow-hidden group/btn bg-cyan hover:bg-cyan/90 text-bg text-[12px] font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)] hover:translate-y-[-2px] cursor-pointer"
                >
                  <span className="relative z-10">
                    {track.progress === 100 ? 'Review' : (!!getProgress(track.id)?.enrolledAt || track.enrolled) ? 'Continue' : 'Enrol'}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              </div>
            </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Login to see more CTA */}
      {!isAuthenticated && (discoveryMode === 'courses' ? sortedCourses.length > 6 : tracksToShow.length > 6) && (
        <div className="mt-12 flex justify-center w-full max-w-[1300px] mx-auto">
           <button 
             onClick={() => onNavigate('signin')} 
             className="bg-transparent border-2 border-cyan text-cyan hover:bg-cyan/10 font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
           >
             Login to see more {discoveryMode === 'courses' ? 'courses' : 'tracks'}
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Testimonial Section */}
      {!isAuthenticated && (
        <div id="section-testimonials" className="w-full max-w-[1300px] mx-auto mt-24 mb-10">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-cyan mb-3">What our learners say</span>
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">Loved by Developers</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">Join thousands of engineers who've accelerated their careers with Manthio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Manthio helped me land a Senior React Developer role in just 3 months. The interactive projects are a game-changer.", author: "Sarah Jenkins", role: "Frontend Engineer @ TechFlow", avatar: "SJ", color: "from-cyan to-blue-500" },
              { text: "The AI tutor feels like pair programming with a senior dev. It explains the 'why' behind the code, not just the 'how'.", author: "David Chen", role: "Full Stack Developer @ Vercel", avatar: "DC", color: "from-purple to-pink-500" },
              { text: "I've tried many platforms, but Manthio's career tracks provide the most structured and practical learning experience.", author: "Elena Rodriguez", role: "Data Scientist @ Meta", avatar: "ER", color: "from-yellow to-orange-400" },
              { text: "The streak system kept me consistent. I went from beginner to getting my AWS certification in 60 days.", author: "James Okafor", role: "Cloud Engineer @ AWS", avatar: "JO", color: "from-green to-teal-400" },
              { text: "The course content is incredibly up-to-date. I learned Docker and Kubernetes concepts I'm already using at work.", author: "Aisha Patel", role: "DevOps Engineer @ Spotify", avatar: "AP", color: "from-blue-400 to-cyan" },
              { text: "Manthio's community is everything. Got a job referral from a peer I met in a live coding session!", author: "Marcus Liu", role: "Backend Developer @ Stripe", avatar: "ML", color: "from-pink-400 to-purple" },
            ].map((t, i) => (
              <div key={i} className="bg-panel border border-line rounded-2xl p-6 flex flex-col gap-4 hover:border-cyan/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.05)] transition-all duration-300 group">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow text-yellow" />)}
                </div>
                <p className="text-text/90 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-line">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>{t.avatar}</div>
                  <div>
                    <p className="font-bold text-text text-sm">{t.author}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
          {enrollCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-panel border border-line rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan/10 mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-cyan" />
                </div>
                <h3 className="text-lg font-bold text-text text-center mb-2">Access Granted</h3>
                <p className="text-sm text-muted text-center mb-6">
                  You are enrolling in <strong className="text-text">{enrollCourse.title}</strong>. This access is {enrollCourse.priceStatus === 'included' ? 'included in your active subscription plan' : 'provided by your employer'}.
                </p>
                <div className="flex flex-col space-y-3">
                  <button 
                    onClick={() => {
                      onNavigate('course-detail');
                      setEnrollCourse(null);
                    }}
                    className="bg-cyan hover:bg-cyan/90 text-bg font-black py-3 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs"
                  >
                    Proceed to Course Details
                  </button>
                  <button 
                    onClick={() => setEnrollCourse(null)}
                    className="text-muted hover:text-text font-bold py-2 transition-colors text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

    </div>
  );
};


