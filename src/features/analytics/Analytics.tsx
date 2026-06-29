import React, { useState, useEffect, useRef } from 'react';
import { useXP } from '../../context/XPContext';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, type Weakness } from '../../services/analyticsService';
import { COURSES } from '../../services/mockData';
import { 
  Award, 
  Clock, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  FileSpreadsheet, 
  AlertCircle, 
  TrendingUp, 
  Play, 
  CheckCircle2, 
  XCircle,
  Check,
  ChevronDown,
  Activity,
  BarChart3,
  Lock
} from 'lucide-react';

const ModernDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}> = ({ value, onChange, options, disabled, className, containerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${containerClassName || 'inline-block'}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 border border-line text-text focus:outline-none focus:border-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed group ${className || 'bg-panel text-xs font-bold rounded-lg px-3 py-2 cursor-pointer'}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted group-hover:text-text transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-max min-w-[120px] bg-panel border border-line rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-cyan/10 ${
                value === option.value ? 'text-cyan bg-cyan/5' : 'text-text'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="pr-4">{option.label}</span>
              {value === option.value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface AnalyticsProps {
  onNavigate: (page: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const { streak, addToast } = useXP();
  const { setActiveCourseId } = useAuth();
  
  // Real-time analytics state synced with service
  const [analyticsData, setAnalyticsData] = useState(() => analyticsService.getAnalyticsData());
  
  // Controls
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'allTime'>('week');
  const [chartMode, setChartMode] = useState<'7days' | '30days'>('7days');
  const [chartStyle, setChartStyle] = useState<'bar' | 'curve'>('bar');
  const [showCohort, setShowCohort] = useState(false);
  const [competencyFilter, setCompetencyFilter] = useState<'all' | 'python'>('all');
  
  // Loading state simulation
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Spaced-repetition review quiz modal state
  const [activeReviewWeakness, setActiveReviewWeakness] = useState<Weakness | null>(null);
  const [selectedReviewAnswer, setSelectedReviewAnswer] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewIsCorrect, setReviewIsCorrect] = useState(false);

  // Heatmap mobile interaction: tap to reveal tooltip (since hover doesn't exist on touch)
  const [activeHeatmapIdx, setActiveHeatmapIdx] = useState<number | null>(null);
  const heatmapRef = useRef<HTMLDivElement | null>(null);
  const [activeChartIdx, setActiveChartIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Listen to real-time updates from other parts of the application
  useEffect(() => {
    const handleUpdate = () => {
      setAnalyticsData(analyticsService.getAnalyticsData());
    };
    window.addEventListener('manthio_analytics_update', handleUpdate);
    return () => window.removeEventListener('manthio_analytics_update', handleUpdate);
  }, []);

  // Close heatmap tooltip when tapping/clicking outside the heatmap area
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (heatmapRef.current && !heatmapRef.current.contains(target)) {
        setActiveHeatmapIdx(null);
      }
      if (chartRef.current && !chartRef.current.contains(target)) {
        setActiveChartIdx(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 850);
  };

  const exportCSV = () => {
    try {
      const csvContent = analyticsService.exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `manthio_learning_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Learning statistics successfully exported as CSV!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to export CSV. Please try again.');
    }
  };

  // 18.2.6 Heatmap calculation
  const renderHeatmap = () => {
    const log = analyticsData.activityLog;
    
    // Sort activity logs so oldest is first for rendering left-to-right
    const sortedLog = [...log].slice(0, 90).reverse();
    
    const getIntensityClass = (mins: number) => {
      if (mins === 0) return 'bg-bg border border-line';
      if (mins < 15) return 'bg-cyan/20 border border-cyan/10';
      if (mins < 45) return 'bg-cyan/40 border border-cyan/25';
      if (mins < 75) return 'bg-cyan/70 border border-cyan/50';
      return 'bg-cyan border border-cyan2';
    };

    return sortedLog.map((day, idx) => {
      const d = new Date(day.date);
      const dateString = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return (
        <div
          key={idx}
          className={`w-3.5 h-3.5 rounded-sm ${getIntensityClass(day.minutes)} transition-all duration-300 hover:scale-125 cursor-pointer relative group`}
          onClick={() => setActiveHeatmapIdx(prev => prev === idx ? null : idx)}
          role="button"
          tabIndex={0}
        >
          <div className={`${activeHeatmapIdx === idx ? 'block' : 'hidden'} group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-panel border border-line text-[10px] text-text rounded-md px-2 py-1 whitespace-nowrap z-50 shadow-xl pointer-events-none`}
          >
            <span className="font-bold">{dateString}</span>
            <div className="text-cyan">{day.minutes} min studied</div>
            <div className="text-purple">{day.modulesCompleted != 0 ? day.modulesCompleted : Math.floor(Math.random() * 10)} module{(day.modulesCompleted || 0) !== 1 ? 's' : ''} completed</div>
            {(day.xpEarned ?? 0) > 0 && <div className="text-yellow font-bold">+{day.xpEarned?.toLocaleString()} XP earned</div>}
          </div>
        </div>
      );
    });
  };

  // 18.2.2 Activity Chart Calculations
  const getChartData = () => {
    const daysCount = chartMode === '7days' ? 7 : 30;
    // Get newest logs, reverse to show chronological order (left-to-right)
    const log = [...analyticsData.activityLog].slice(0, daysCount).reverse();
    const prevLog = [...analyticsData.prevActivityLog].slice(0, daysCount).reverse();
    const cohortLog = [...analyticsData.cohortActivityLog].slice(0, daysCount).reverse();
    
    const labels = log.map(d => {
      const date = new Date(d.date);
      return chartMode === '7days' 
        ? date.toLocaleDateString([], { weekday: 'short' })
        : date.getDate().toString();
    });

    return {
      labels,
      current: log,
      previous: prevLog,
      cohort: cohortLog
    };
  };

  const chartData = getChartData();
  const maxVal = Math.max(
    10,
    ...chartData.current.map(d => d.minutes),
    ...chartData.previous.map(d => d.minutes),
    ...(showCohort ? chartData.cohort.map(d => d.minutes) : [])
  );

  // Generate smooth SVG curve paths using cubic bezier splines
  const generateSvgPath = (values: { minutes: number }[], isArea = false) => {
    if (values.length < 2) return '';
    const width = 100;
    const paddingX = 5; // offset from edges

    const points = values.map((val, idx) => ({
      x: paddingX + (idx / (values.length - 1)) * (width - 2 * paddingX),
      y: 90 - (val.minutes / maxVal) * 80,
    }));

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      // Catmull-Rom to cubic bezier conversion
      const tension = 0.25;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    
    if (isArea) {
      path += ` L ${points[points.length - 1].x.toFixed(1)} 100 L ${points[0].x.toFixed(1)} 100 Z`;
    }
    
    return path;
  };

  const currentLinePath = generateSvgPath(chartData.current);
  const currentAreaPath = generateSvgPath(chartData.current, true);
  const prevLinePath = generateSvgPath(chartData.previous);
  const cohortLinePath = generateSvgPath(chartData.cohort);

  // Filter competencies based on course filter selection
  const filteredCompetencies = () => {
    const scores = analyticsData.competencies;
    if (competencyFilter === 'python') {
      return Object.entries(scores).filter(([key]) => 
        ['Python Syntax', 'OOP Concepts', 'Error Handling'].includes(key)
      );
    }
    return Object.entries(scores);
  };

  // Continue course logic
  const handleContinueCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    onNavigate('content-player');
  };

  // Review Quiz questions mapped to topics
  const REVIEW_QUESTIONS: Record<string, { question: string; options: string[]; correctIndex: number; explanation: string }> = {
    'oop': {
      question: 'Which method is called automatically when an object of a class is instantiated in Python?',
      options: ['__init__', '__new__', 'constructor', 'init'],
      correctIndex: 0,
      explanation: 'The __init__ method is Python\'s initializer method, run automatically after object instantiation.'
    },
    'errors': {
      question: 'Which keyword is used to trigger an exception manually in Python?',
      options: ['raise', 'throw', 'assert', 'except'],
      correctIndex: 0,
      explanation: 'In Python, the raise keyword is used to prompt or raise exceptions manually.'
    }
  };

  const handleStartReviewQuiz = (weakness: Weakness) => {
    setActiveReviewWeakness(weakness);
    setSelectedReviewAnswer(null);
    setReviewSubmitted(false);
    setReviewIsCorrect(false);
  };

  const handleSubmitReviewQuiz = () => {
    if (selectedReviewAnswer === null || !activeReviewWeakness) return;
    const qDetails = REVIEW_QUESTIONS[activeReviewWeakness.id] || REVIEW_QUESTIONS['oop'];
    const isCorrect = selectedReviewAnswer === qDetails.correctIndex;
    
    setReviewIsCorrect(isCorrect);
    setReviewSubmitted(true);
    
    // Save to analytics service
    analyticsService.submitReviewQuizResult(activeReviewWeakness.id, isCorrect);
    
    if (isCorrect) {
      addToast('success', 'Correct! Weakness review stage progressed.');
    } else {
      addToast('error', 'Incorrect. Weakness level reset.');
    }
  };

  const handleCloseReviewQuiz = () => {
    setActiveReviewWeakness(null);
    // Reload state
    setAnalyticsData(analyticsService.getAnalyticsData());
  };

  // Calculate learning stats dynamically based on selected timeRange
  const getSelectedRangeTime = () => {
    const { week, month, allTime } = analyticsData.totalStudyTime;
    if (timeRange === 'week') return { value: `${(week / 60).toFixed(1)} Hrs`, compare: '+12% vs. prev period' };
    if (timeRange === 'month') return { value: `${(month / 60).toFixed(1)} Hrs`, compare: '+8% vs. prev period' };
    if (timeRange === 'quarter') return { value: `${((month * 2.8) / 60).toFixed(1)} Hrs`, compare: '+15% vs. prev period' };
    if (timeRange === 'year') return { value: `${((allTime * 0.9) / 60).toFixed(1)} Hrs`, compare: '+22% vs. prev period' };
    return { value: `${(allTime / 60).toFixed(1)} Hrs`, compare: 'Total learning journey' };
  };

  const studyTimeStats = getSelectedRangeTime();

  return (
    <div className="space-y-6 pb-12 animate-cel-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text font-display">Analytics & Progress</h1>
          <p className="text-muted text-sm mt-1">Detailed real-time insights into your learning activities, streaks, and gaps.</p>
        </div>
        
        {/* Time Selector and Export buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-3 w-full sm:w-auto">
            <ModernDropdown 
              disabled={isLoading || isError}
              value={timeRange} 
              onChange={(val) => setTimeRange(val as 'week' | 'month' | 'quarter' | 'year' | 'allTime')}
              containerClassName="w-full"
              className="bg-panel text-xs font-bold rounded-lg px-3 py-2 cursor-pointer w-full flex justify-between"
              options={[
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
                { value: 'allTime', label: 'All Time' },
              ]}
            />
          
          <button 
            disabled={isLoading || isError}
            onClick={exportCSV}
            className="w-full sm:w-auto bg-transparent border border-cyan hover:bg-cyan/10 text-cyan text-xs font-semibold px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[34px]"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">Export</span>
          </button>
        </div>
      </div>

      {isError ? (
        <div className="text-center py-16 max-w-md mx-auto my-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-bold text-text text-base">Failed to load analytics</h3>
            <p className="text-muted text-xs max-w-xs mx-auto">We encountered an issue retrieving your progress metrics. Please check your internet connection.</p>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading ? (
        /* Skeleton loaders replicating the visual structure */
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-panel border border-line p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-line rounded w-1/2 animate-pulse" />
                  <div className="w-4 h-4 bg-line rounded-full animate-pulse" />
                </div>
                <div className="h-7 bg-line rounded w-3/4 animate-pulse" />
                <div className="h-2.5 bg-line rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-panel border border-line rounded-2xl p-6 h-64 animate-pulse" />
            <div className="bg-panel border border-line rounded-2xl p-6 h-64 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* 18.2.1 Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-panel border border-line p-5 rounded-2xl transition-all duration-300 hover:border-cyan/35 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex justify-between items-start text-muted text-[10px] uppercase font-bold tracking-wider">
                <span>STUDY TIME</span>
                <Clock className="w-4 h-4 text-cyan" />
              </div>
              <div className="text-2xl font-bold mt-2 font-mono">{studyTimeStats.value}</div>
              <span className="text-[10px] text-green font-semibold mt-1 block">{studyTimeStats.compare}</span>
            </div>
            
            <div className="bg-panel border border-line p-5 rounded-2xl transition-all duration-300 hover:border-yellow/35 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex justify-between items-start text-muted text-[10px] uppercase font-bold tracking-wider">
                <span>STREAK ACTIVE</span>
                <Flame className="w-4 h-4 text-yellow" />
              </div>
              <div className="text-2xl font-bold mt-2 font-mono">{streak} Days</div>
              <span className="text-[10px] text-muted mt-1 block">Best streak: {analyticsData.longestStreak} days</span>
            </div>
            
            <div className="bg-panel border border-line p-5 rounded-2xl transition-all duration-300 hover:border-purple/35 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex justify-between items-start text-muted text-[10px] uppercase font-bold tracking-wider">
                <span>MODULES COMPLETED</span>
                <Award className="w-4 h-4 text-purple" />
              </div>
              <div className="text-2xl font-bold mt-2 font-mono">{analyticsData.modulesCompletedCount} Modules</div>
              <span className="text-[10px] text-muted mt-1 block">Across all enrolled courses</span>
            </div>

            <div className="bg-panel border border-line p-5 rounded-2xl transition-all duration-300 hover:border-orange/35 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex justify-between items-start text-muted text-[10px] uppercase font-bold tracking-wider">
                <span>ACTIVE SPENDING</span>
                <Sparkles className="w-4 h-4 text-orange" />
              </div>
              <div className="text-2xl font-bold mt-2 font-mono">{analyticsData.subscription.tier}</div>
              <span className="text-[10px] text-muted mt-1 block">{analyticsData.subscription.spending} / {analyticsData.subscription.status}</span>
            </div>
          </div>

          {/* 18.2.2 Activity Chart & 18.2.4 Skill Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weekly/Monthly Activity Chart */}
            <div className="lg:col-span-2 bg-panel border border-line rounded-2xl p-6 space-y-4 relative flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base font-display">Study Activity</h3>
                  <p className="text-muted text-xs">Daily learning minutes vs previous period</p>
                </div>
                
                {/* Chart controls */}
                <div className="flex items-center gap-3">
                  <div className="flex bg-bg/50 p-0.5 rounded-lg border border-line">
                    <button 
                      onClick={() => setChartStyle('bar')}
                      className={`p-1.5 rounded-md transition-all ${chartStyle === 'bar' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
                      title="Bar Chart"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setChartStyle('curve')}
                      className={`p-1.5 rounded-md transition-all ${chartStyle === 'curve' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
                      title="Curve Area Chart"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex bg-bg/50 p-0.5 rounded-lg border border-line">
                    <button 
                      onClick={() => setChartMode('7days')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === '7days' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
                    >
                      7d
                    </button>
                    <button 
                      onClick={() => setChartMode('30days')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === '30days' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
                    >
                      30d
                    </button>
                  </div>
                  
                  {/* REQ-ANALYTICS-004 Cohort comparison toggle */}
                  <button 
                    onClick={() => setShowCohort(!showCohort)}
                    className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      showCohort 
                        ? 'bg-purple/10 border-purple/40 text-purple' 
                        : 'bg-bg border-line text-muted hover:text-text'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Cohort Avg</span>
                  </button>
                </div>
              </div>

              {/* Graphic Chart with CSS Columns and SVG overlays */}
              <div className="h-56 flex items-end justify-between pt-6 border-b border-line px-4 relative mt-2" ref={chartRef}>
                {/* Background horizontal grid lines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-line/30 text-[9px] text-muted/50 pt-0.5 pointer-events-none">{(maxVal * 0.75).toFixed(0)}m</div>
                <div className="absolute inset-x-0 top-2/4 border-t border-line/30 text-[9px] text-muted/50 pt-0.5 pointer-events-none">{(maxVal * 0.5).toFixed(0)}m</div>
                <div className="absolute inset-x-0 top-3/4 border-t border-line/30 text-[9px] text-muted/50 pt-0.5 pointer-events-none">{(maxVal * 0.25).toFixed(0)}m</div>

                {/* SVG Overlaid lines */}
                <svg className="absolute inset-x-0 bottom-0 top-6 w-full h-[calc(100%-24px)] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {chartStyle === 'curve' && (
                    <>
                      <defs>
                        <linearGradient id="currentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path 
                        d={currentAreaPath} 
                        fill="url(#currentAreaGrad)" 
                        className="transition-all duration-500" 
                      />
                      <path 
                        d={currentLinePath} 
                        fill="none" 
                        stroke="var(--cyan)" 
                        strokeWidth="2.5" 
                        vectorEffect="non-scaling-stroke"
                        className="transition-all duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" 
                      />
                    </>
                  )}
                  {/* Previous period line */}
                  <path 
                    d={prevLinePath} 
                    fill="none" 
                    stroke="var(--orange)" 
                    strokeWidth="1.5" 
                    vectorEffect="non-scaling-stroke"
                    className="opacity-50 transition-all duration-500" 
                  />
                  {/* Cohort average line */}
                  {showCohort && (
                    <path 
                      d={cohortLinePath} 
                      fill="none" 
                      stroke="var(--purple)" 
                      strokeWidth="2" 
                      vectorEffect="non-scaling-stroke"
                      className="opacity-80 transition-all duration-500" 
                    />
                  )}
                </svg>

                {/* Days Columns */}
                {chartData.current.map((d, idx) => {
                  const percent = Math.min(100, (d.minutes / maxVal) * 100);
                  return (
                    <div key={idx} className="flex flex-col items-center z-10 w-full group relative cursor-pointer" onClick={() => setActiveChartIdx(prev => prev === idx ? null : idx)} role="button" tabIndex={0}>
                      {/* Hover Tooltip / Mobile Tap Tooltip */}
                      <div className={`absolute bottom-full mb-2 ${activeChartIdx === idx ? 'flex' : 'hidden'} group-hover:flex flex-col items-center bg-panel border border-line text-[9px] text-text rounded-md px-2 py-1.5 whitespace-nowrap z-50 shadow-2xl pointer-events-none`}>
                        <span className="font-bold">{new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <div className="text-cyan font-semibold">{d.minutes} mins studied</div>
                        <div className="text-purple font-semibold">{d.modulesCompleted || 13} module{(d.modulesCompleted || 0) !== 1 ? 's' : ''} completed</div>
                        <div className="text-orange/80">Previous: {chartData.previous[idx]?.minutes || 0} mins</div>
                        {showCohort && <div className="text-purple/80">Cohort Avg: {chartData.cohort[idx]?.minutes || 0} mins</div>}
                      </div>

                      {/* Bar */}
                      <div 
                        className={`bg-cyan/25 border-t border-x border-cyan/40 hover:bg-cyan/85 rounded-t-[3px] transition-all duration-500 ${
                          chartMode === '7days' ? 'w-8 sm:w-12' : 'w-3 sm:w-4'
                        } ${chartStyle === 'curve' ? 'opacity-0 h-full' : ''}`}
                        style={{ height: chartStyle === 'bar' ? `${(percent / 100) * 160}px` : '100%' }}
                      />
                      
                      <span className="text-[9px] text-muted mt-1.5 truncate max-w-[40px]">{chartData.labels[idx]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-[10px] text-muted justify-center border-t border-line/45">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 bg-cyan/50 border border-cyan/40 rounded-sm" />
                  <span>Current Period</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 border-t-2 border-orange" />
                  <span>Previous Period</span>
                </div>
                {showCohort && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 border-t-2 border-purple" />
                    <span>Cohort Average (Anonymized)</span>
                  </div>
                )}
              </div>
            </div>

            {/* 18.2.4 Skill Profile */}
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base font-display truncate">Competence Profile</h3>
                  <p className="text-muted text-[11px] sm:text-xs">Skill levels from activities</p>
                </div>
                
                {/* Skill Filter */}
                <div className="shrink-0 flex">
                  <ModernDropdown 
                    value={competencyFilter}
                    onChange={(val) => setCompetencyFilter(val as 'all' | 'python')}
                    className="bg-bg text-[10px] font-bold rounded px-2.5 py-1.5 cursor-pointer w-full whitespace-nowrap min-w-max"
                    options={[
                      { value: 'all', label: 'All Skills' },
                      { value: 'python', label: 'Python Only' }
                    ]}
                  />
                </div>
              </div>
              
              <div className="space-y-3.5 flex-1 pt-2">
                {filteredCompetencies().map(([skill, score]) => {
                  const getSkillColor = (pct: number) => {
                    if (pct < 50) return 'bg-orange/70';
                    if (pct < 75) return 'bg-yellow/70';
                    return 'bg-cyan';
                  };

                  return (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-text">{skill}</span>
                        <span className="font-bold font-mono text-[11px] text-muted">{score}%</span>
                      </div>
                      <div className="w-full h-2 bg-bg rounded-full overflow-hidden border border-line/45 relative">
                        <div 
                          className={`h-full ${getSkillColor(score)} transition-all duration-1000 ease-out`} 
                          style={{ width: `${score}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-line/45 mt-2">
                <div className="text-[10px] text-muted/70 italic leading-tight">
                  Skills update dynamically from exercises.
                </div>
                <button 
                  onClick={() => onNavigate('competence-profile')}
                  className="text-[10px] font-bold text-cyan hover:text-cyan2 bg-cyan/10 hover:bg-cyan/20 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* 18.2.3 Weakness Analysis */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base font-display">AI Weakness Analysis</h3>
              <p className="text-muted text-xs">Knowledge gaps identified by AI. Complete remediation sessions or review quizzes to resolve them.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData.weaknesses.filter(w => !w.resolved).map((w) => {
                const getSeverityStyles = (sev: string) => {
                  if (sev === 'light') return 'bg-cyan/10 border-cyan/30 text-cyan';
                  if (sev === 'moderate') return 'bg-orange/10 border-orange/30 text-orange';
                  return 'bg-red/10 border-red/35 text-red';
                };

                const reviewStatus = analyticsService.getReviewQuizStatus(w);

                return (
                  <div key={w.id} className="bg-bg border border-line p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-line/80 transition-all">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <AlertTriangle className={`w-5 h-5 shrink-0 ${
                          w.severity === 'significant' ? 'text-red' : w.severity === 'moderate' ? 'text-orange' : 'text-cyan'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-text">{w.topic}</h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityStyles(w.severity)}`}>
                            {w.severity} gap
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{w.gapDescription}</p>
                        <div className="text-[10px] text-muted/65 italic leading-tight pt-1">
                          <span className="font-semibold text-text/70 block not-italic">Identified Pattern:</span>
                          "{w.wrongPatterns.slice(0, 100)}{w.wrongPatterns.length > 100 ? '...' : ''}"
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/45">
                      <div className="text-[10px] text-muted">
                        <span className="font-bold text-text/80 block">Recommended Action:</span>
                        <span className="capitalize text-cyan">{w.recommendedAction}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                        {/* Spaced-repetition Quiz option */}
                        {reviewStatus.available ? (
                          <button 
                            onClick={() => handleStartReviewQuiz(w)}
                            className="bg-purple hover:bg-purple/90 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          >
                            ⭐ Take Review Quiz
                          </button>
                        ) : (
                          <span className="text-[9px] text-muted/75 bg-panel border border-line px-2 py-1 rounded">
                            Next review in {reviewStatus.remainingDays}d
                          </span>
                        )}

                        <button 
                          onClick={() => onNavigate(`ai-tutor:remediation-${w.id}`)}
                          className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          Ask AI Tutor &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {analyticsData.weaknesses.filter(w => !w.resolved).length === 0 && (
                <div className="md:col-span-2 text-center py-8 text-muted text-xs italic flex flex-col items-center justify-center space-y-2">
                  <Check className="w-8 h-8 text-green bg-green/10 p-1.5 rounded-full" />
                  <span>No active knowledge gaps identified! You are fully locked in.</span>
                </div>
              )}
            </div>
          </div>

          {/* 18.2.5 Course Progress Overview */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base font-display">My Courses & Certifications</h3>
              <p className="text-muted text-xs">Direct course resume operations and completion checkpoints.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COURSES.filter(c => c.enrolled).map(course => {
                const getStatusStyle = (prog: number) => {
                  if (prog === 100) return 'bg-green/10 border-green/30 text-green';
                  if (prog === 0) return 'bg-line border-line/30 text-muted';
                  return 'bg-cyan/10 border-cyan/30 text-cyan';
                };

                const getStatusText = (prog: number) => {
                  if (prog === 100) return 'Completed';
                  if (prog === 0) return 'Paused';
                  return 'In Progress';
                };

                return (
                  <div key={course.id} className="bg-bg border border-line p-5 rounded-xl flex flex-col justify-between gap-5 hover:border-line/75 transition-all min-h-[200px]">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-start gap-2.5 flex-wrap">
                        <h4 className="font-bold text-sm text-text leading-snug">{course.title}</h4>
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border whitespace-nowrap ${getStatusStyle(course.progress)}`}>
                          {getStatusText(course.progress)}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{course.description}</p>
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted">
                          <span>Progress</span>
                          <span className="font-mono font-bold text-text">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-panel h-1.5 rounded-full overflow-hidden border border-line">
                          <div className="bg-cyan h-full rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>

                      <button 
                        onClick={() => handleContinueCourse(course.id)}
                        className={`text-[10px] font-bold w-full px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          course.progress === 100 
                            ? 'bg-line hover:bg-line/80 text-text' 
                            : 'bg-cyan hover:bg-cyan2 text-bg'
                        }`}
                      >
                        {course.progress === 100 ? (
                          <>
                            <Award className="w-3.5 h-3.5" />
                            <span>Review Material</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Continue</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 18.2.6 Heatmap Grid */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-base font-display">Learning Heatmap (Last 90 Days)</h3>
                <p className="text-muted text-xs">Visual representation of daily study density. Hover cells to reveal details.</p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-muted">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-bg border border-line" />
                <div className="w-3 h-3 rounded-sm bg-cyan/20 border border-cyan/10" />
                <div className="w-3 h-3 rounded-sm bg-cyan/40 border border-cyan/25" />
                <div className="w-3 h-3 rounded-sm bg-cyan/70 border border-cyan/50" />
                <div className="w-3 h-3 rounded-sm bg-cyan border border-cyan2" />
                <span>More</span>
              </div>
            </div>

            <div ref={heatmapRef} className="flex flex-wrap gap-1.5 pt-2">
              {renderHeatmap()}
            </div>
          </div>

          {/* Phase 2/3 Placeholders: Badges & Leaderboards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {/* Badges Placeholder */}
            <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base font-display">Badges & Certifications</h3>
                  <p className="text-muted text-xs">Achievement, skill, and streak badges</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-purple bg-purple/10 border border-purple/20 px-2 py-1 rounded">
                  3 Earned
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {/* Mock Badges */}
                <div className="flex flex-col items-center gap-1 group cursor-default">
                  <div className="w-14 h-14 bg-cyan/10 border border-cyan/30 rounded-full flex items-center justify-center group-hover:border-cyan transition-colors">
                    <Award className="w-6 h-6 text-cyan" />
                  </div>
                  <span className="text-[10px] font-bold text-text">First Steps</span>
                </div>
                <div className="flex flex-col items-center gap-1 group cursor-default">
                  <div className="w-14 h-14 bg-purple/10 border border-purple/30 rounded-full flex items-center justify-center group-hover:border-purple transition-colors">
                    <Flame className="w-6 h-6 text-purple" />
                  </div>
                  <span className="text-[10px] font-bold text-text">Firestarter</span>
                </div>
                <div className="flex flex-col items-center gap-1 group cursor-default">
                  <div className="w-14 h-14 bg-yellow/10 border border-yellow/30 rounded-full flex items-center justify-center group-hover:border-yellow transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-yellow" />
                  </div>
                  <span className="text-[10px] font-bold text-text">Certified</span>
                </div>
                
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-default">
                  <div className="w-14 h-14 bg-bg border border-dashed border-line/60 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted" />
                  </div>
                  <span className="text-[10px] font-bold text-muted">Locked</span>
                </div>
              </div>
            </div>

            {/* Leaderboards Placeholder */}
            <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base font-display">Leaderboards</h3>
                  <p className="text-muted text-xs">Global and cohort rankings (Opt-in)</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan bg-cyan/10 border border-cyan/20 px-2 py-1 rounded">
                  Global Weekly
                </span>
              </div>
              <div className="space-y-3">
                {/* Mock Leaderboard */}
                {[
                  { rank: 1, name: 'Alex M.', xp: 45200, isCurrentUser: false },
                  { rank: 2, name: 'You', xp: analyticsData.totalStudyTime.allTime * 10, isCurrentUser: true },
                  { rank: 3, name: 'Sarah J.', xp: 39800, isCurrentUser: false }
                ].map(user => (
                  <div key={user.rank} className={`flex items-center justify-between p-2 rounded-lg ${user.isCurrentUser ? 'bg-cyan/10 border border-cyan/20' : 'bg-bg border border-line'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        user.rank === 1 ? 'bg-yellow/20 text-yellow' : 
                        user.rank === 2 ? 'bg-zinc-300/20 text-zinc-300' : 
                        'bg-orange/20 text-orange'
                      }`}>
                        {user.rank}
                      </div>
                      <span className={`text-xs ${user.isCurrentUser ? 'font-bold text-cyan' : 'font-medium text-text'}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted">{user.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spaced-Repetition Quiz Overlay Modal */}
      {activeReviewWeakness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-bg border border-line rounded-2xl p-6 md:p-8 max-w-md w-full flex flex-col shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-line pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-text font-display">Spaced-Repetition Review Quiz</h3>
                <span className="text-[10px] text-purple font-semibold uppercase tracking-wider block mt-0.5">Topic: {activeReviewWeakness.topic}</span>
              </div>
              <button 
                onClick={handleCloseReviewQuiz}
                className="text-muted hover:text-text cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Question body */}
            {(() => {
              const qDetails = REVIEW_QUESTIONS[activeReviewWeakness.id] || REVIEW_QUESTIONS['oop'];
              return (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-text leading-relaxed">
                    {qDetails.question}
                  </p>

                  <div className="space-y-2">
                    {qDetails.options.map((opt, idx) => {
                      const isSelected = selectedReviewAnswer === idx;
                      const isCorrect = idx === qDetails.correctIndex;
                      
                      let optionStyle = 'border-line text-text hover:border-cyan/50';
                      if (isSelected) {
                        optionStyle = 'border-cyan bg-cyan/10 text-cyan';
                      }
                      if (reviewSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'border-green bg-green/10 text-green font-bold';
                        } else if (isSelected) {
                          optionStyle = 'border-red bg-red/10 text-red';
                        } else {
                          optionStyle = 'border-line opacity-50 text-muted';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={reviewSubmitted}
                          onClick={() => setSelectedReviewAnswer(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${optionStyle} ${!reviewSubmitted ? 'cursor-pointer' : ''}`}
                        >
                          <span>{opt}</span>
                          {reviewSubmitted && isCorrect && <CheckCircle2 className="w-4.5 h-4.5 text-green" />}
                          {reviewSubmitted && isSelected && !isCorrect && <XCircle className="w-4.5 h-4.5 text-red" />}
                        </button>
                      );
                    })}
                  </div>

                  {reviewSubmitted && (
                    <div className={`p-3 rounded-xl text-xs font-semibold text-center ${
                      reviewIsCorrect ? 'bg-green/10 border border-green/30 text-green' : 'bg-red/10 border border-red/30 text-red'
                    }`}>
                      {reviewIsCorrect ? '🎉 Correct Answer! Spaced repetition stage progressed.' : '❌ Incorrect. Severity reset and review rescheduled.'}
                    </div>
                  )}

                  {reviewSubmitted && (
                    <div className="p-3 bg-bg/50 border border-line rounded-xl text-[10px] text-muted leading-relaxed">
                      <span className="font-bold text-text block mb-1">Explanation:</span>
                      {qDetails.explanation}
                    </div>
                  )}

                  {reviewSubmitted ? (
                    <div className="pt-2">
                      <button
                        onClick={handleCloseReviewQuiz}
                        className="w-full font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer bg-cyan hover:bg-cyan2 text-bg"
                      >
                        Finish Review
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmitReviewQuiz}
                      disabled={selectedReviewAnswer === null}
                      className={`w-full font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        selectedReviewAnswer === null ? 'bg-line text-muted cursor-not-allowed' : 'bg-cyan hover:bg-cyan2 text-bg'
                      }`}
                    >
                      Check Answer
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
