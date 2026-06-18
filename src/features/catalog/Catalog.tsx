import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Search, SlidersHorizontal, BookOpen, Award, Clock, AlertCircle } from 'lucide-react';

interface CatalogProps {
  onNavigate: (page: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onNavigate }) => {
  const { setActiveCourseId } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // Loading & Error States (REQ-LOAD-002, REQ-LOAD-004)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

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

  // Filter courses
  const filteredCourses = COURSES.filter(course => {
    // Tab filtering
    if (activeTab === 'enrolled' && !course.enrolled) return false;
    if (activeTab === 'completed' && course.progress < 100) return false;

    // Search query filtering
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) && !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter selectors
    if (selectedLevel !== 'All' && course.level !== selectedLevel) return false;
    if (selectedFormat !== 'All' && course.format !== selectedFormat) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Course Catalog</h1>
          <p className="text-muted text-sm mt-1">Discover new topics or continue your existing courses.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search for courses or topics..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); simulateLoad(); }}
            className="w-full bg-panel border border-line rounded-xl pl-10 pr-4 py-2 text-sm text-text focus:border-cyan focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-muted" />
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex space-x-1 bg-panel border border-line p-1 rounded-xl">
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
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4 h-4 text-muted" />
          
          <select 
            value={selectedLevel}
            onChange={(e) => { setSelectedLevel(e.target.value); simulateLoad(); }}
            className="bg-panel border border-line text-xs rounded-lg px-3 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="Foundation">Foundation</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select 
            value={selectedFormat}
            onChange={(e) => { setSelectedFormat(e.target.value); simulateLoad(); }}
            className="bg-panel border border-line text-xs rounded-lg px-3 py-1.5 text-text focus:outline-none focus:border-cyan cursor-pointer"
          >
            <option value="All">All Formats</option>
            <option value="flipped">Flipped (Hybrid)</option>
            <option value="self-paced">Self-paced</option>
            <option value="cohort">Cohort</option>
          </select>
        </div>
      </div>

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
              className="bg-panel border border-line rounded-2xl overflow-hidden flex flex-col justify-between h-[400px]"
            >
              <div>
                {/* Header Image Skeleton */}
                <div className="h-44 bg-bg border-b border-line animate-pulse relative">
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
      ) : filteredCourses.length === 0 ? (
        /* REQ-LOAD-001: Every list view has a defined empty state with primary action */
        <div className="text-center py-16 bg-panel border border-line rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          {activeTab === 'enrolled' ? (
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
                onClick={() => { setSelectedLevel('All'); setSelectedFormat('All'); setSearchQuery(''); }}
                className="mt-5 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {filteredCourses.map(course => (
            <div 
              key={course.id} 
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-bg/90 backdrop-blur border border-line text-[10px] px-2 py-0.5 rounded font-bold uppercase text-text">
                      {course.level}
                    </span>
                    <span className="bg-cyan/95 text-bg text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {course.format === 'flipped' ? 'Flipped' : course.format === 'self-paced' ? 'Self-paced' : 'Cohort'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-text hover:text-cyan transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted text-xs line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 pt-3 text-xs text-muted">
                    <div className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{course.xpReward} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.format === 'flipped' ? '2 Days + Self-study' : 'Self-paced'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0 border-t border-line mt-4 flex items-center justify-between">
                <div>
                  {course.enrolled ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted font-semibold block">Progress</span>
                      <span className="text-xs font-bold text-cyan">{course.progress}% completed</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-text">{course.price}</span>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setActiveCourseId(course.id);
                    if (course.enrolled) {
                      onNavigate('learning-path');
                    } else {
                      onNavigate('course-detail');
                    }
                  }}
                  className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {course.enrolled ? 'Continue' : 'Details & Booking'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
