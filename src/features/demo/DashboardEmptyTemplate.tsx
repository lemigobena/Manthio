import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, MessageSquare, Cpu, BookOpen, RefreshCw, Award, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COURSES } from '../../services/mockData';

// High-fidelity Sticky Note Stat component copied from Dashboard for the template
const StickyNoteStat: React.FC<{ 
  label: string; 
  value: string | number; 
  subtext: string; 
  color: 'peach' | 'lavender' | 'sky' | 'mint';
  rotation: string;
  onClick?: () => void;
}> = ({ label, value, subtext, color, rotation, onClick }) => {
  const bgStyles = {
    peach: 'bg-[#FFF0EB] border-[#FFD9CF] dark:bg-orange/10 dark:border-orange/20',
    lavender: 'bg-[#F5F0FF] border-[#E0D4FF] dark:bg-purple/10 dark:border-purple/20',
    sky: 'bg-[#E8F8FF] border-[#BDEBFF] dark:bg-cyan/10 dark:border-cyan/20',
    mint: 'bg-[#EFFDF5] border-[#D1F7E3] dark:bg-green/10 dark:border-green/20',
  }[color];

  const pinStyles = {
    peach: 'bg-orange shadow-[0_0_10px_rgba(255,123,0,0.5)]',
    lavender: 'bg-purple shadow-[0_0_10px_rgba(163,58,255,0.5)]',
    sky: 'bg-cyan shadow-[0_0_10px_rgba(0,255,242,0.5)]',
    mint: 'bg-green shadow-[0_0_10px_rgba(34,197,94,0.5)]',
  }[color];

  return (
    <button 
      onClick={onClick}
      className={`group relative ${bgStyles} border-b-4 border-r-2 p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] shadow-xl ${rotation} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${pinStyles} relative opacity-80`}>
          <div className="absolute inset-0 bg-white/40 rounded-full blur-[1px]" />
        </div>
        <div className="w-0.5 h-3 bg-gray-400/30 -mt-1" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center justify-between min-h-[110px] pt-1">
        <div className="space-y-1">
          <h3 className="text-[9px] font-black text-text uppercase tracking-[0.2em] opacity-40">{label}</h3>
          <div className="text-3xl font-black text-text tracking-tight leading-none">{value}</div>
        </div>
        <p className="text-[11px] text-muted font-bold leading-relaxed italic mt-3 max-w-[150px]">
          "{subtext}"
        </p>
      </div>
    </button>
  );
};

// Neural Activity Chart - Empty State
const NeuralActivityChartEmpty: React.FC = () => {
  const data = [
    { day: 'M', mins: 0, label: 'Mon' },
    { day: 'T', mins: 0, label: 'Tue' },
    { day: 'W', mins: 0, label: 'Wed' },
    { day: 'T', mins: 0, label: 'Thu' },
    { day: 'F', mins: 0, label: 'Fri' },
    { day: 'S', mins: 0, label: 'Sat' },
    { day: 'S', mins: 0, label: 'Sun' },
  ];

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 flex flex-col flex-1 min-h-50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan/50 shadow-[0_0_6px_rgba(0,255,242,0.2)]" />
          <h3 className="text-[11px] font-semibold text-text/50 uppercase tracking-[0.3em]">Neural Velocity</h3>
        </div>
        <span className="text-[10px] font-bold text-cyan/30 tabular-nums">
          0 <span className="opacity-50">min / wk</span>
        </span>
      </div>

      <div className="flex-1 flex items-end gap-2 min-h-0 h-full">
        {data.map((d, i) => {
          return (
            <div key={i} className="flex-1 flex flex-col h-full items-center justify-end gap-1.5 group relative">
              <div className="w-full h-[86%] flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 cursor-pointer relative overflow-hidden bg-cyan/5 border-t-2 border-cyan/10`}
                  style={{ height: `6%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5" />
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase shrink-0 transition-colors text-muted group-hover:text-text`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DashboardEmptyTemplate: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-[fadeIn_0.3s_ease-out]">
      {showBanner && (
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow/15 via-yellow/5 to-panel border border-yellow/20 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow" />
          <div className="flex items-start space-x-3.5 pl-2 max-w-2xl">
            <div className="p-2.5 bg-yellow/10 border border-yellow/20 text-yellow rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-text">Welcome to the Academy!</h3>
              <p className="text-muted text-xs leading-relaxed">
                Start your journey by enrolling in a track. Let's begin your engineering legacy.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto shrink-0 pl-2 md:pl-0">
            <button
              onClick={() => onNavigate('onboarding')}
              className="bg-yellow hover:opacity-90 text-bg text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-yellow/10 flex items-center space-x-1.5 hover:scale-105 active:scale-95"
            >
              <span>Setup Profile</span>
              <ArrowRight className="w-3.5 h-3.5 text-bg" />
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-muted hover:text-text p-2 hover:bg-bg rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="pt-2">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {getGreeting()}, {user?.name.split(' ')[0] || 'Explorer'} 👋
            </h1>
          </div>
          <div className="bg-panel border border-line rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan/10 transition-all duration-700" />
            <div className="relative z-10 space-y-2 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black text-text leading-tight">Master Your Next Frontier</h2>
              <p className="text-muted text-sm md:text-base max-w-lg">
                You haven't started a technical track yet. Explore our curated laboratory paths and build your engineering legacy today.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('explore')}
              className="relative z-10 w-full md:w-auto bg-cyan hover:bg-cyan2 text-bg text-xs font-black px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              Begin Discovery
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid - Sticky Note Style (Empty Values) */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-12 mt-8 md:mt-12 mb-8 md:mb-10">
          <StickyNoteStat 
            label="Learning Level"
            value={0}
            subtext="Ready to master the core foundations"
            color="peach"
            rotation="md:rotate-1"
          />
          <StickyNoteStat 
            label="Current Streak"
            value="0 Days"
            subtext="Start learning today to build your streak"
            color="lavender"
            rotation="md:-rotate-2"
          />
          <StickyNoteStat 
            label="Total XP Pool"
            value="0"
            subtext="Points to be earned through laboratory work"
            color="sky"
            rotation="md:rotate-2"
          />
          <StickyNoteStat 
            label="Module Progress"
            value="0/0"
            subtext="Enroll in a track to track module progress"
            color="mint"
            rotation="md:-rotate-1"
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
        
        {/* Left Column (Courses & Activity) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">Your Learning</h3>
                <p className="text-muted text-sm">Track your progress and continue building new skills.</p>
              </div>
            </div>
            
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-line rounded-2xl bg-panel/50">
              <BookOpen size={48} className="text-muted/50 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No active courses yet</h3>
              <p className="text-sm text-muted mb-6">Head to the catalog to find your first course.</p>
              <button 
                onClick={() => onNavigate('catalog')}
                className="bg-panel border border-line hover:border-cyan text-text px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Recommended Courses */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-lg font-bold text-text">Recommended for You</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {COURSES.slice(0, 3).map(course => (
                  <div 
                    key={course.id} 
                    onClick={() => {
                      onNavigate('course-detail');
                    }}
                    className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300 h-[340px] cursor-pointer"
                  >
                    <div>
                      {/* Header Image */}
                      <div className="h-32 relative bg-bg overflow-hidden border-b border-line">
                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="bg-bg/40 backdrop-blur-md border border-white/20 text-[9px] px-2 py-0.5 rounded font-bold uppercase text-white">
                            {course.level}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-text group-hover:text-cyan transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-muted text-[10px] line-clamp-2 leading-relaxed min-h-[30px]">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 pt-1 text-[10px] font-bold">
                          <div className="flex items-center space-x-1 h-3">
                            <Award className="w-3 h-3 text-cyan flex-shrink-0" />
                            <span className="text-text">+{course.xpReward} XP</span>
                          </div>
                          <div className="flex items-center space-x-1 h-3">
                            <Clock className="w-3 h-3 text-cyan flex-shrink-0" />
                            <span className="text-text">{course.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 pt-3 border-t border-line mt-auto flex items-center justify-between bg-bg/20">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted font-bold uppercase mb-0.5">Price</span>
                        <span className="text-[11px] font-black text-text">
                          {course.priceStatus === 'included' ? 'Included' : course.price}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('checkout');
                        }}
                        className="bg-cyan hover:bg-cyan/90 text-bg text-[10px] font-black px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        Enrol
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Community Events, Recommendations, and Weak Points) */}
        <div className="flex flex-col gap-6">
          
          <NeuralActivityChartEmpty />
          
          {/* Upcoming Community Event (Empty state) */}
          <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Upcoming Session</h3>
              </div>
            </div>
            <div className="py-4 text-center">
              <p className="text-sm text-muted">No upcoming sessions right now. Keep an eye out for new events!</p>
            </div>
          </div>

          {/* Neural Insights Section (Empty) */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan/10 border border-cyan/20 rounded-xl text-cyan">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text">Neural Insights</h3>
            </div>

            <div className="space-y-4">
               <div className="bg-bg/50 border border-line rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-purple" />
                 <div className="space-y-1">
                   <h4 className="text-xs font-bold text-purple uppercase tracking-widest">Welcome</h4>
                   <p className="text-sm text-text leading-relaxed">
                     I'm your AI Tutor. Once you begin your track, I'll analyze your performance and provide tailored recommendations here.
                   </p>
                 </div>
               </div>
            </div>

            <button 
              onClick={() => onNavigate('ai-tutor')}
              className="w-full bg-transparent hover:bg-cyan/5 border border-cyan/30 text-cyan text-xs font-bold py-3 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Neural Tutor</span>
            </button>
          </div>

          {/* Offline Workspace Sync */}
          <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-cyan" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Offline Workspace Sync</h3>
              </div>
              <span className="bg-cyan/15 text-cyan text-[10px] px-2 py-0.5 rounded font-bold uppercase">Local Cache</span>
            </div>
            <div className="space-y-3">
              <p className="text-muted text-xs leading-relaxed">
                Download and cache all bootcamp video lessons, resources, and quiz databases for offline learning access.
              </p>
              <button 
                className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-center"
              >
                Start Offline Sync
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
