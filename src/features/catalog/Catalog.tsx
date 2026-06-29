import React, { useState } from 'react';
import { COURSES, TRACKS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { Search, SlidersHorizontal, BookOpen, Award, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTrack } from '../track-detail/useTrack';
import { calculateCourseProgress } from '../../services/progressUtils';
import type { CareerTrack, Course } from '../../types';

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

interface CatalogProps {
  onNavigate: (page: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onNavigate }) => {
  const { setActiveCourseId, setActiveTrackId } = useAuth();
  const { addToast } = useXP();
  const { getTrackPercentage, completedLessonIds } = useTrack();
  const [discoveryMode, setDiscoveryMode] = useState<'courses' | 'tracks'>(() => {
    const lastUsed = localStorage.getItem('catalogDiscoveryMode');
    return (lastUsed as 'courses' | 'tracks') || (COURSES.some(c => c.enrolled) ? 'courses' : 'tracks');
  });
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'completed'>(() => {
    return COURSES.some(c => c.enrolled) ? 'enrolled' : 'all';
  });
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

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
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
  const topics = Array.from(new Set(COURSES.map(c => c.topic))).filter(Boolean);

  // Filter courses
  const filteredCourses = (discoveryMode === 'courses' ? COURSES : []).filter(course => {
    // Tab filtering
    if (activeTab === 'enrolled' && !course.enrolled) return false;
    if (activeTab === 'completed' && course.progress < 100) return false;

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
    // Tab filtering
    if (activeTab === 'enrolled' && !t.enrolled) return false;
    if (activeTab === 'completed' && t.progress < 100) return false;

    // Search and Level filtering
    if (searchQuery) {
      const matchTitle = fuzzyMatch(searchQuery, t.title);
      const matchDesc = fuzzyMatch(searchQuery, t.outcomeStatement);
      const matchTags = (t.tags || []).some(tag => fuzzyMatch(searchQuery, tag));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    
    if (selectedLevel !== 'All' && t.level !== selectedLevel) return false;
    
    // REQ-TRACK-022 filters
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
          {discoveryMode === 'courses' ? (
            <>
              <button 
                onClick={() => handleTabChange('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'all' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                All Courses ({COURSES.length})
              </button>
              <button 
                onClick={() => handleTabChange('enrolled')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'enrolled' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                My Courses ({COURSES.filter(c => c.enrolled).length})
              </button>
              <button 
                onClick={() => handleTabChange('completed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'completed' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                Completed ({COURSES.filter(c => c.progress === 100).length})
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleTabChange('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'all' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                All Tracks ({TRACKS.length})
              </button>
              <button 
                onClick={() => handleTabChange('enrolled')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'enrolled' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                My Tracks ({TRACKS.filter(t => t.enrolled).length})
              </button>
              <button 
                onClick={() => handleTabChange('completed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'completed' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
              >
                Completed ({TRACKS.filter(t => t.progress === 100).length})
              </button>
            </>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-muted hidden sm:block" />
          
          <select 
            value={selectedLevel}
            onChange={(e) => { setSelectedLevel(e.target.value); simulateLoad(); }}
            className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
          >
            <option value="All">Level: All</option>
            <option value="Foundation">Foundation</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {discoveryMode === 'courses' && (
            <>
              <select 
                value={selectedTopic}
                onChange={(e) => { setSelectedTopic(e.target.value); simulateLoad(); }}
                className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
              >
                <option value="All">Topic: All</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select 
                value={selectedFormat}
                onChange={(e) => { setSelectedFormat(e.target.value); simulateLoad(); }}
                className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
              >
                <option value="All">Format: All</option>
                <option value="flipped">Flipped</option>
                <option value="self-paced">Self-paced</option>
                <option value="cohort">Cohort</option>
              </select>

              <select 
                value={selectedLanguage}
                onChange={(e) => { setSelectedLanguage(e.target.value); simulateLoad(); }}
                className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
              >
                <option value="All">Language: All</option>
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="French">French</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); simulateLoad(); }}
                className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
              >
                <option value="Recommended">Sort: Recommended</option>
                <option value="Newest">Newest</option>
                <option value="Most popular">Most popular</option>
                <option value="Highest rated">Highest rated</option>
                <option value="Alphabetical">A-Z</option>
              </select>
            </>
          )}

          {discoveryMode === 'tracks' && (
            <>
              <select 
                value={selectedGoal}
                onChange={(e) => { setSelectedGoal(e.target.value); simulateLoad(); }}
                className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
              >
                <option value="All">Goal: All</option>
                <option value="Certification">Certification</option>
                <option value="Role">Role</option>
                <option value="Project">Project</option>
                <option value="Topic">Topic</option>
              </select>

              <select 
                value={selectedTimeRange}
                onChange={(e) => { setSelectedTimeRange(e.target.value); simulateLoad(); }}
                className="bg-panel border border-line text-[11px] rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
              >
                <option value="All">Time: All</option>
                <option value="<20">Under 20h</option>
                <option value="20-40">20-40h</option>
                <option value="40+">40h+</option>
              </select>
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
            activeTab === 'enrolled' ? (
              <>
                <h3 className="font-bold text-text">No active courses</h3>
                <p className="text-muted text-sm mt-1 max-w-sm mx-auto">You haven't enrolled in any courses yet — browse the catalog to find a course.</p>
                <button 
                  onClick={() => handleTabChange('all')}
                  className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Browse Catalog
                </button>
              </>
            ) : activeTab === 'completed' ? (
              <>
                <h3 className="font-bold text-text">No completed courses</h3>
                <p className="text-muted text-sm mt-1 max-w-sm mx-auto">You haven't completed any courses yet. Resume your learning path to finish.</p>
                <button 
                  onClick={() => handleTabChange('enrolled')}
                  className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Resume Active Course
                </button>
              </>
            ) : (
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
            )
          ) : (
            activeTab === 'enrolled' ? (
              <>
                <h3 className="font-bold text-text">No active tracks</h3>
                <p className="text-muted text-sm mt-1 max-w-sm mx-auto">You haven't enrolled in any career tracks yet — browse the list to find a track.</p>
                <button 
                  onClick={() => handleTabChange('all')}
                  className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Browse Tracks
                </button>
              </>
            ) : activeTab === 'completed' ? (
              <>
                <h3 className="font-bold text-text">No completed tracks</h3>
                <p className="text-muted text-sm mt-1 max-w-sm mx-auto">You haven't completed any tracks yet. Keep learning to reach your goals.</p>
                <button 
                  onClick={() => handleTabChange('enrolled')}
                  className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Resume Active Track
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
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {discoveryMode === 'courses' ? sortedCourses.map(course => (
            <div 
              key={course.id} 
              onClick={() => {
                setActiveTrackId(null);
                setActiveCourseId(course.id);
                onNavigate('course-detail');
              }}
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:translate-y-[-4px] duration-300 h-[420px] cursor-pointer"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-85 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-60" />
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
                  {course.enrolled ? (
                    <div className="flex items-center space-x-3">
                      {/* Progress Ring or Completed Icon */}
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        {course.progress === 100 ? (
                          <div className="bg-green/10 p-1.5 rounded-full ring-2 ring-green/20">
                            <CheckCircle className="w-5 h-5 text-green" />
                          </div>
                        ) : (
                          <div className="relative w-9 h-9">
                            <svg className="w-9 h-9 -rotate-90">
                              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-line opacity-20" />
                              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={100} strokeDashoffset={100 - (100 * course.progress) / 100} className="text-cyan transition-all duration-1000 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-text">
                              {course.progress}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-cyan font-black leading-none mb-1 uppercase tracking-wider">
                          {course.progress === 100 ? 'Completed' : 'Active'}
                        </span>
                        <span className="text-[12px] font-bold text-text opacity-80">
                          {course.progress === 100 ? 'Content Reviewed' : 'Continue Course'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted font-bold uppercase mb-0.5 tracking-tight">Price Status</span>
                      <span className="text-[13px] font-black text-text tracking-tight">
                        {course.priceStatus === 'included' ? 'Included in your plan' : 
                         course.priceStatus === 'employer' ? 'Provided by your employer' : 
                         course.price}
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering card click
                    setActiveTrackId(null);
                    setActiveCourseId(course.id);
                    const cProg = calculateCourseProgress(course as unknown as Course, completedLessonIds);
                    if (cProg === 100) {
                      onNavigate('course-detail');
                    } else if (course.enrolled) {
                      onNavigate('learning-path');
                    } else if (course.priceStatus === 'included' || course.priceStatus === 'employer') {
                      addToast('success', `🎓 Enrolled in ${course.title} — access granted via ${course.priceStatus === 'included' ? 'your plan' : 'your employer'}.`);
                      onNavigate('learning-path');
                    } else {
                      onNavigate('checkout');
                    }
                  }}
                  className={`relative overflow-hidden group/btn bg-cyan hover:bg-cyan/90 text-bg text-[12px] font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)] hover:translate-y-[-2px] cursor-pointer`}
                >
                  <span className="relative z-10">
                    {calculateCourseProgress(course as unknown as Course, completedLessonIds) === 100 ? 'Review' : course.enrolled ? 'Continue' : 'Enrol Now'}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              </div>
            </div>
          )) : tracksToShow.map(track => (
            <div 
              key={track.id} 
              onClick={() => {
                setActiveTrackId(track.id);
                onNavigate('track-detail');
              }}
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:translate-y-[-4px] duration-300 h-[420px] cursor-pointer"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-85 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-60" />
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
                  {track.enrolled ? (
                    <div className="flex items-center space-x-3">
                      {/* Progress Ring or Completed Icon */}
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        {getTrackPercentage(track as unknown as CareerTrack) === 100 ? (
                          <div className="bg-green/10 p-1.5 rounded-full ring-2 ring-green/20">
                            <CheckCircle className="w-5 h-5 text-green" />
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
                      <div className="flex flex-col">
                        <span className="text-[10px] text-cyan font-black leading-none mb-1 uppercase tracking-wider">
                          {getTrackPercentage(track as unknown as CareerTrack) === 100 ? 'Completed' : 'Active'}
                        </span>
                        <span className="text-[12px] font-bold text-text opacity-80">
                          {getTrackPercentage(track as unknown as CareerTrack) === 100 ? 'Review Final Step' : 'Resume Learning'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted font-bold uppercase mb-0.5 tracking-tight">Track Path</span>
                      <span className="text-[13px] font-black text-text tracking-tight uppercase">Multi-Course</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTrackId(track.id);
                    onNavigate('track-detail');
                  }}
                  className="relative overflow-hidden group/btn bg-cyan hover:bg-cyan/90 text-bg text-[12px] font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)] hover:translate-y-[-2px] cursor-pointer"
                >
                  <span className="relative z-10">
                    {track.progress === 100 ? 'Review' : track.enrolled ? 'Continue' : 'Enrol'}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
