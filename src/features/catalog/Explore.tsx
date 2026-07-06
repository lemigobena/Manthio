import React, { useState, useRef, useEffect } from 'react';
import { COURSES, TRACKS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Search, SlidersHorizontal, BookOpen, Award, Clock, AlertCircle, Sparkles, Star, Play, Zap, ArrowRight, Code, Command, Cloud, Database, Hexagon, Box, Bot, CheckCircle2, ChevronDown, Check, X } from 'lucide-react';
import heroImage from '../../assets/hero-student.png';
import { ParticleNetwork } from '../../components/ui/ParticleNetwork';

interface ExploreDropdownOption { label: string; value: string; }
interface ExploreDropdownProps {
  label: string;
  value: string;
  options: ExploreDropdownOption[];
  onChange: (v: string) => void;
}

const ExploreDropdown: React.FC<ExploreDropdownProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;
  const isFiltered = value !== 'All' && value !== options[0]?.value;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <div className="absolute top-full mt-2 left-0 z-50 min-w-[150px] bg-panel/95 backdrop-blur-xl border border-line/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
  const [ctaSlide, setCtaSlide] = useState(0);

  // Motion and Animation States
  const [scrollY, setScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) return;
    const interval = setInterval(() => {
      setCtaSlide(s => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
          <div className="relative w-[100vw] ml-[calc(50%-50vw)] overflow-hidden mb-20 flex flex-col items-center min-h-[90svh] pt-12 lg:pt-28 pb-12">
          
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


          {/* Abstract Background Elements (the 'glowing circle' behind the app from Redsun) */}
          <div 
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan/10 rounded-full blur-[120px] opacity-70 pointer-events-none transition-transform duration-1000"
            style={{ transform: `translate(-50%, ${scrollY * 0.2}px)` }}
          />
          <div 
            className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple/10 rounded-full blur-[100px] opacity-50 pointer-events-none transition-transform duration-1000"
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
            <div className="flex-1 flex flex-col items-center text-center space-y-4 w-full lg:max-w-2xl relative z-20">
              
              {/* Subtitle Above */}
              <div className="text-cyan font-bold tracking-wide text-sm md:text-base">
                Start your favourite course
              </div>

              {/* Main Title */}
              <h1 className="text-[32px] leading-[1.3] sm:text-4xl lg:text-5xl xl:text-6xl font-black text-text font-display sm:leading-[1.1] tracking-tight">
                Now learning from<br />
                anywhere, and build<br />
                your <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple">
                  bright career.
                  {/* Swoosh Underline */}
                  <svg className="absolute w-full h-4 -bottom-2 left-0 text-cyan opacity-80" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M5,15 Q100,0 195,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <path d="M15,19 Q100,5 185,19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                  </svg>
                </span>
              </h1>

              {/* Description */}
              <p className="text-muted text-base md:text-lg leading-relaxed max-w-md mt-4">
                It has survived not only five centuries but also the leap into electronic typesetting.
              </p>

              {/* Button */}
              <div className="pt-6">
                <button 
                  onClick={() => onNavigate('signup')} 
                  className="px-8 py-4 bg-cyan text-bg hover:bg-cyan/90 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] cursor-pointer flex items-center justify-center gap-2 text-base hover:-translate-y-1 tracking-wide"
                >
                  Start Your Journey
                  <svg 
                    xmlns="http://w3.org" 
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
                   <BookOpen className="w-8 h-8 text-cyan mb-1" />
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
               />

               {/* Top Right Floating Badge (Rating) */}
               <div className="absolute top-[5%] right-0 lg:-right-8 z-20 bg-bg/95 backdrop-blur-xl rounded-full px-6 py-4 border border-line shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-float-reverse flex items-center gap-2">
                 <span className="text-2xl font-black text-text">4.8</span>
                 <Star className="w-6 h-6 text-yellow fill-yellow" />
                 <span className="text-sm text-muted font-medium hidden sm:inline ml-2">rating (86k)</span>
               </div>
            </div>
          </div>

          {/* Visual "App" Block Below (Giant overlapping cards/UI representation) */}
          <div className="relative z-20 w-full max-w-5xl mx-auto mt-16 px-4" style={{ perspective: '1200px' }}>
            <div 
              className="relative w-full h-[400px] md:h-[500px] bg-panel/80 backdrop-blur-xl border border-line rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all duration-300 ease-out"
              style={{
                transform: `rotateX(${Math.max(0, 20 - scrollY * 0.05)}deg) scale(${Math.min(1, 0.9 + scrollY * 0.0002)}) translateY(${scrollY * 0.1}px)`,
                transformStyle: 'preserve-3d',
                boxShadow: `0 ${Math.max(20, 50 - scrollY * 0.1)}px ${Math.max(40, 100 - scrollY * 0.1)}px rgba(0,0,0,0.4)`
              }}
            >
              
              {/* Fake Browser Header */}
              <div className="h-12 bg-bg/50 border-b border-line flex items-center px-6 space-x-2 relative">
                <div className="flex space-x-2 absolute left-6">
                  <div className="w-3 h-3 rounded-full bg-red" />
                  <div className="w-3 h-3 rounded-full bg-yellow" />
                  <div className="w-3 h-3 rounded-full bg-green" />
                </div>
                <div className="mx-auto bg-panel border border-line rounded-md px-3 py-1.5 text-[10px] text-muted flex items-center justify-center space-x-2 w-1/2 md:w-1/3">
                  <Code className="w-3 h-3" />
                  <span>manthio.app/workspace</span>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 p-8 font-mono text-sm leading-relaxed relative flex items-center justify-center bg-bg/30 overflow-hidden">
                {/* Inner Glowing orb inside app */}
                <div className="absolute w-[300px] h-[300px] bg-cyan/10 rounded-full blur-[80px]" />
                
                {/* Central Floating Code Snippet */}
                <div className="relative z-10 w-full max-w-lg bg-panel border border-line rounded-xl p-6 shadow-2xl text-left animate-float">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-line/50">
                    <span className="text-xs text-muted">train_model.py</span>
                    <Play className="w-4 h-4 text-cyan cursor-pointer hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-purple">def <span className="text-cyan">train_model</span><span className="text-text">(data):</span></div>
                  <div className="pl-4 text-muted"># Initialize neural network</div>
                  <div className="pl-4 text-text">model = Sequential([</div>
                  <div className="pl-8 text-yellow">Dense(128, activation='relu'),</div>
                  <div className="pl-8 text-yellow">Dropout(0.2),</div>
                  <div className="pl-8 text-yellow">Dense(10, activation='softmax')</div>
                  <div className="pl-4 text-text">])</div>
                  <div className="pl-4 text-purple">return <span className="text-text">model.fit(data)</span></div>
                  <div className="mt-6 flex items-center space-x-2 animate-pulse text-cyan">
                    <span className="w-2 h-4 bg-cyan inline-block"></span>
                    <span className="text-xs">AI Tutor is analyzing your code...</span>
                  </div>
                </div>

                {/* Overlapping Terminal Card */}
                <div className="absolute right-[-10px] sm:right-10 bottom-[-10px] sm:bottom-10 z-20 w-64 bg-bg/95 backdrop-blur-xl border border-cyan/30 rounded-xl shadow-[0_0_30px_rgba(45,212,191,0.15)] p-4 animate-float-reverse">
                  <div className="flex items-center space-x-2 text-cyan font-bold text-xs mb-2">
                    <Zap className="w-3.5 h-3.5 fill-cyan" />
                    <span>Real-time Output</span>
                  </div>
                  <div className="font-mono text-[10px] text-muted space-y-1">
                    <div>&gt; Build successful</div>
                    <div className="text-text">&gt; Training Epoch 1/10...</div>
                    <div className="text-green">&gt; Accuracy: 94.2%</div>
                  </div>
                </div>
              </div>
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

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 mb-20">
              {/* Box 4 (Wide, text left, image right) */}
              <div className="bento-card relative w-full bg-panel border border-line rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between hover:border-cyan transition-colors overflow-hidden group cursor-pointer">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-cyan/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="md:w-1/2 z-10 text-center md:text-left mb-8 md:mb-0">
                  <h6 className="text-3xl font-bold text-text mb-4 group-hover:text-cyan transition-colors">AI Sessions</h6>
                  <p className="text-muted text-lg max-w-md mx-auto md:mx-0">Get unstuck instantly with our state-of-the-art AI tutor that understands your code and guides you without giving away the answers.</p>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-end z-10 w-full">
                  <div className="w-full max-w-sm h-48 bg-bg rounded-2xl border border-line shadow-2xl flex flex-col p-4 transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(45,212,191,0.15)] transition-all">
                    <div className="flex items-center space-x-2 mb-4">
                       <Bot className="w-6 h-6 text-cyan" />
                       <span className="font-bold text-sm text-text">Tutor</span>
                    </div>
                    <div className="bg-panel rounded-lg p-3 text-xs text-muted font-mono mb-2">
                       "It looks like you're missing a parenthesis on line 4. Try checking the syntax for the print function."
                    </div>
                    <div className="bg-cyan/10 border border-cyan/30 rounded-lg p-3 text-xs text-cyan font-mono ml-4 self-end">
                       "Ah, I see! print('hello')!"
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Powerful Features Vertical Alternating list */}
          <div className="w-full max-w-7xl mx-auto px-4 mb-24 space-y-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">Powerful Features</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">Explore the frontier of coding evolution. Our latest features redefine the boundaries of what's possible in learning.</p>
            </div>

            {/* Feature 1 (Text Left, Image Right) */}
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
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80" 
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

            {/* Feature 2 (Image Left, Text Right) */}
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
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80" 
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
        </>
      )}

      {/* REQ-CATALOG-002: Discovery Modes */}
      <div className="flex justify-center mb-2">
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
          {discoveryMode === 'courses' ? sortedCourses.map((course, index) => (
            <React.Fragment key={course.id}>
              {/* First CTA: Image Split Design */}
              {!isAuthenticated && index === 3 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-panel border border-line rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl shadow-bg/50 my-16 group">
                  <div className="p-8 md:p-12 flex-1 space-y-6 relative z-10 bg-gradient-to-br from-panel to-bg/80 flex flex-col justify-center items-start">
                    <div className="inline-flex items-center space-x-2 bg-cyan/10 text-cyan px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Manthio Pro</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-text font-display leading-tight">
                      Learn faster with AI-powered tutoring
                    </h3>
                    <p className="text-muted text-base md:text-lg leading-relaxed max-w-xl">
                      Experience our revolutionary in-browser coding environments paired with 24/7 AI guidance. We don't just show you how to code, we code with you.
                    </p>
                    <button 
                      onClick={() => onNavigate('signup')}
                      className="px-8 py-4 bg-text text-bg hover:bg-cyan hover:text-bg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] cursor-pointer hover:-translate-y-1 mt-4"
                    >
                      Start Free Trial
                    </button>
                  </div>
                  <div className="flex-1 min-h-[300px] relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80" 
                      alt="Team collaborating" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/50 to-transparent md:w-1/2" />
                  </div>
                </div>
              )}

              {/* Second CTA: Testimonial Carousel Design */}
              {!isAuthenticated && index === 9 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-bg border border-indigo-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl my-16 flex flex-col items-center justify-center min-h-[400px]">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                  
                  <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-8">What our learners say</h3>
                    
                    <div className="relative h-[200px] flex items-center justify-center">
                      {[
                        { text: "Manthio helped me land a Senior React Developer role in just 3 months. The interactive projects are a game-changer.", author: "Sarah Jenkins", role: "Frontend Engineer @ TechFlow" },
                        { text: "The AI tutor feels like pair programming with a senior dev. It explains the 'why' behind the code, not just the 'how'.", author: "David Chen", role: "Full Stack Developer" },
                        { text: "I've tried many platforms, but Manthio's career tracks provide the most structured and practical learning experience.", author: "Elena Rodriguez", role: "Data Scientist" }
                      ].map((slide, i) => (
                        <div 
                          key={i} 
                          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 transform ${ctaSlide === i ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95 pointer-events-none'}`}
                        >
                          <div className="flex gap-1 mb-6">
                            {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-yellow text-yellow" />)}
                          </div>
                          <p className="text-xl md:text-3xl font-medium text-text leading-tight mb-8 max-w-3xl">"{slide.text}"</p>
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-white font-bold text-xl shadow-lg">{slide.author.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-text">{slide.author}</p>
                              <p className="text-xs text-muted">{slide.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 mt-10">
                      {[0,1,2].map(i => (
                        <button 
                          key={i} 
                          onClick={() => setCtaSlide(i)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${ctaSlide === i ? 'bg-indigo-400 w-8' : 'bg-line hover:bg-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            <div 
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:translate-y-[-4px] duration-300 h-[420px]"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="bg-bg/40 backdrop-blur-md border border-white/20 text-[10px] px-2.5 py-1 rounded font-bold uppercase text-white shadow-sm">
                      {course.level}
                    </span>
                    <span className="bg-cyan/80 backdrop-blur-md text-bg text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm">
                      {course.format}
                    </span>
                    {course.tags?.map(tag => (
                      <span key={tag} className="bg-amber-500/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm whitespace-nowrap">
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
                    onNavigate('course-detail');
                  }}
                  className={`relative overflow-hidden group/btn bg-cyan hover:bg-cyan/90 text-bg text-[12px] font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)] hover:translate-y-[-2px] cursor-pointer`}
                >
                  <span className="relative z-10">Enrol Now</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              </div>
            </div>
            </React.Fragment>
          )) : tracksToShow.map(track => (
            <div 
              key={track.id} 
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:translate-y-[-4px] duration-300 h-[420px]"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="bg-bg/40 backdrop-blur-md border border-white/20 text-[10px] px-2.5 py-1 rounded font-bold uppercase text-white shadow-sm">
                      {track.level}
                    </span>
                    {track.tags?.map(tag => (
                      <span key={tag} className={`${tag=="Career Track"  ? "bg-cyan/80" : "bg-amber-500/80"}  backdrop-blur-md text-bg text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm whitespace-nowrap`}>
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
              <div className="p-5 pt-4 border-t border-line mt-auto flex items-center justify-between bg-bg/20">
                <div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted font-bold uppercase mb-0.5 tracking-tight">Track Path</span>
                    <span className="text-[15px] font-black text-text tracking-tight uppercase">Multi-Course</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setActiveTrackId(track.id);
                    onNavigate('track-detail');
                  }}
                  className="relative overflow-hidden group/btn bg-cyan hover:bg-cyan/90 text-bg text-[12px] font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)] hover:translate-y-[-2px] cursor-pointer"
                >
                  <span className="relative z-10">Enrol Now</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

          {/* Features Combined Card */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 mt-40 mb-20">
            <div className="bg-bg/50 border border-line rounded-[2.5rem] p-6 md:p-8 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Section 1 */}
                <div className="relative border border-line rounded-3xl flex flex-col items-center text-center justify-between min-h-[300px] group cursor-pointer overflow-hidden hover:border-cyan transition-colors">
                  <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80" alt="Interactive" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 dark:opacity-50 dark:group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-bg/70 dark:via-bg/10" />
                  </div>
                  <div className="absolute inset-0 bg-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-end p-8">
                    <h6 className="text-xl font-bold text-white mb-2 group-hover:text-cyan transition-colors drop-shadow-md">Interactive</h6>
                    <p className="text-white/80 text-sm drop-shadow-md">Write code directly in your browser with instant feedback.</p>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="relative border border-line rounded-3xl flex flex-col items-center text-center justify-between min-h-[300px] group cursor-pointer overflow-hidden hover:border-purple transition-colors">
                  <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Users" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 dark:opacity-50 dark:group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-bg/70 dark:via-bg/10" />
                  </div>
                  <div className="absolute inset-0 bg-purple/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-end p-8">
                    <h6 className="text-xl font-bold text-white mb-2 group-hover:text-purple transition-colors drop-shadow-md">Community</h6>
                    <p className="text-white/80 text-sm drop-shadow-md">Join a global community of passionate learners.</p>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="relative border border-line rounded-3xl flex flex-col items-center text-center justify-between min-h-[300px] group cursor-pointer overflow-hidden hover:border-yellow transition-colors">
                  <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" alt="Create" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 dark:opacity-50 dark:group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-bg/70 dark:via-bg/10" />
                  </div>
                  <div className="absolute inset-0 bg-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-end p-8">
                    <h6 className="text-xl font-bold text-white mb-2 group-hover:text-yellow transition-colors drop-shadow-md">Create</h6>
                    <p className="text-white/80 text-sm drop-shadow-md">Build real-world projects to add to your portfolio.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

    </div>
  );
};

