import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { Award, Clock, Flame, Sparkles, AlertTriangle, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface AnalyticsProps {
  onNavigate: (page: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const { streak, addToast } = useXP();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Loading & Error States (REQ-LOAD-002, REQ-LOAD-004)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
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

  // Generate mock data for the 90-day learning activity heatmap
  const renderHeatmap = () => {
    const cells = [];
    const intensityClasses = ['bg-bg border border-line', 'bg-cyan/20 border border-cyan/10', 'bg-cyan/40 border border-cyan/25', 'bg-cyan/70 border border-cyan/50', 'bg-cyan border border-cyan2'];
    
    for (let i = 0; i < 90; i++) {
      // Simulate random intensity
      const val = Math.floor(Math.sin(i * 0.15) * 2 + 2) % 5;
      cells.push(
        <div 
          key={i} 
          className={`w-3.5 h-3.5 rounded-sm ${intensityClasses[val]} transition-colors hover:scale-110`}
          title={`Day ${i + 1}: ${val * 15} minutes studied`}
        />
      );
    }
    return cells;
  };

  const exportCSV = () => {
    addToast('success', 'Learning statistics successfully exported as CSV!');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics & Progress</h1>
          <p className="text-muted text-sm mt-1">Detailed insights into your learning activities and skills.</p>
        </div>
        
        {/* Time selector and Export button */}
        <div className="flex items-center space-x-3">
          <select 
            disabled={isLoading || isError}
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className={`bg-panel border border-line text-xs rounded-lg px-3 py-2 text-text focus:outline-none focus:border-cyan cursor-pointer ${(isLoading || isError) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>
          
          <button 
            disabled={isLoading || isError}
            onClick={exportCSV}
            className={`bg-bg hover:bg-line border border-line text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${(isLoading || isError) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileSpreadsheet className="w-4 h-4 text-muted" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* REQ-LOAD-004: Failed load with retry action */}
      {isError ? (
        <div className="text-center py-16 bg-panel border border-line rounded-2xl max-w-md mx-auto my-6 space-y-4 shadow-xl">
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
        /* REQ-LOAD-002: Skeleton loader mimicking analytics layout */
        <div className="space-y-6">
          {/* Stats Skeleton */}
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

          {/* Charts & Profiles Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-panel border border-line rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-line rounded w-1/4 animate-pulse" />
                <div className="h-3.5 bg-line rounded w-1/6 animate-pulse" />
              </div>
              <div className="h-48 flex items-end justify-between pt-6 border-b border-line px-4 relative">
                {[40, 65, 85, 100, 30, 20, 55].map((h, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-2 w-full">
                    <div className="h-2.5 bg-line rounded w-6 animate-pulse" />
                    <div 
                      className="w-8 bg-line/50 rounded-t-md animate-pulse"
                      style={{ height: `${(h / 120) * 120}px` }}
                    />
                    <div className="h-2.5 bg-line rounded w-8 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
              <div className="h-4 bg-line rounded w-2/3 animate-pulse" />
              <div className="space-y-4 pt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-line rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-line rounded w-8 animate-pulse" />
                    </div>
                    <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-line">
                      <div className="h-full bg-line w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap Skeleton */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-line rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-line rounded w-1/4 animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {Array.from({ length: 90 }).map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded-sm bg-line/30 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Weakness Skeleton */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div className="h-4 bg-line rounded w-1/4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-bg border border-line p-4 rounded-xl flex items-start space-x-3">
                  <div className="w-5 h-5 bg-line rounded-full shrink-0 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-line rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-line rounded w-5/6 animate-pulse" />
                    <div className="h-3 bg-line rounded w-2/3 animate-pulse" />
                    <div className="h-2.5 bg-line rounded w-1/4 pt-1 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-panel border border-line p-5 rounded-2xl">
              <div className="flex justify-between items-start text-muted text-xs">
                <span>STUDY TIME</span>
                <Clock className="w-4 h-4 text-cyan" />
              </div>
              <div className="text-2xl font-bold mt-2">18.5 Hrs</div>
              <span className="text-[10px] text-green font-semibold mt-1 block">+12% vs. previous week</span>
            </div>
            
            <div className="bg-panel border border-line p-5 rounded-2xl">
              <div className="flex justify-between items-start text-muted text-xs">
                <span>STREAK RECORD</span>
                <Flame className="w-4 h-4 text-yellow" />
              </div>
              <div className="text-2xl font-bold mt-2">{streak} Days</div>
              <span className="text-[10px] text-muted mt-1 block">Current streak active</span>
            </div>
            
            <div className="bg-panel border border-line p-5 rounded-2xl">
              <div className="flex justify-between items-start text-muted text-xs">
                <span>COMPLETED</span>
                <Award className="w-4 h-4 text-green" />
              </div>
              <div className="text-2xl font-bold mt-2">2 Modules</div>
              <span className="text-[10px] text-muted mt-1 block">In 1 active courses</span>
            </div>

            <div className="bg-panel border border-line p-5 rounded-2xl">
              <div className="flex justify-between items-start text-muted text-xs">
                <span>SUBSCRIPTION</span>
                <Sparkles className="w-4 h-4 text-purple" />
              </div>
              <div className="text-2xl font-bold mt-2">Premium</div>
              <span className="text-[10px] text-muted mt-1 block">Active via employer</span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weekly Activity Line Representation */}
            <div className="lg:col-span-2 bg-panel border border-line rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Weekly Activity</h3>
                <span className="text-xs text-muted">Average: 2.6 Hrs / Day</span>
              </div>
              
              {/* Simulating a graphic line chart with divs */}
              <div className="h-48 flex items-end justify-between pt-6 border-b border-line px-4 relative">
                {/* Background grids */}
                <div className="absolute inset-x-0 top-1/4 border-t border-line/40 text-[9px] text-muted/60 pt-0.5">3 Hrs</div>
                <div className="absolute inset-x-0 top-2/4 border-t border-line/40 text-[9px] text-muted/60 pt-0.5">2 Hrs</div>
                <div className="absolute inset-x-0 top-3/4 border-t border-line/40 text-[9px] text-muted/60 pt-0.5">1 Hr</div>

                {/* Days Bars */}
                {[
                  { day: 'Mon', min: 38 },
                  { day: 'Tue', min: 62 },
                  { day: 'Wed', min: 86 },
                  { day: 'Thu', min: 100 },
                  { day: 'Fri', min: 28 },
                  { day: 'Sat', min: 16 },
                  { day: 'Sun', min: 52 }
                ].map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-2 z-10 w-full">
                    <span className="text-[10px] text-cyan font-bold">{d.min}m</span>
                    <div 
                      className="w-8 bg-cyan/85 hover:bg-cyan rounded-t-md transition-all duration-300"
                      style={{ height: `${(d.min / 120) * 120}px` }}
                    />
                    <span className="text-[10px] text-muted">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Profile Radar Simulator */}
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-base">Python Competence Profile</h3>
              
              <div className="space-y-3 pt-2">
                {[
                  { skill: 'Abstract Logic', pct: 88 },
                  { skill: 'Python Syntax', pct: 70 },
                  { skill: 'OOP Concepts', pct: 45 },
                  { skill: 'Error Handling', pct: 38 }
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-text">{s.skill}</span>
                      <span className="text-cyan font-bold">{s.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-line">
                      <div className="h-full bg-cyan" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GitHub-style Heatmap */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Learning Activity (Last 90 Days)</h3>
              <div className="flex items-center space-x-2 text-[10px] text-muted">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded-sm bg-bg border border-line" />
                <div className="w-3.5 h-3.5 rounded-sm bg-cyan/20 border border-cyan/10" />
                <div className="w-3.5 h-3.5 rounded-sm bg-cyan/40 border border-cyan/25" />
                <div className="w-3.5 h-3.5 rounded-sm bg-cyan/70 border border-cyan/50" />
                <div className="w-3.5 h-3.5 rounded-sm bg-cyan border border-cyan2" />
                <span>More</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {renderHeatmap()}
            </div>
          </div>

          {/* Weakness Deep-Dive */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base">Weakness Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg border border-line p-4 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-text">OOP Concepts</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Difficulties in understanding inheritance and class instantiation in Module 6.
                  </p>
                  <button 
                    onClick={() => onNavigate('ai-tutor')}
                    className="text-cyan hover:underline text-xs font-semibold mt-2 block"
                  >
                    Start exercise with AI Tutor
                  </button>
                </div>
              </div>
              
              <div className="bg-bg border border-line p-4 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-text">Error Handling</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Exceptions and try-except blocks were answered incorrectly several times in the last quiz questions.
                  </p>
                  <button 
                    onClick={() => onNavigate('ai-tutor')}
                    className="text-cyan hover:underline text-xs font-semibold mt-2 block"
                  >
                    Start remediation session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
