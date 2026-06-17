import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { COURSES } from '../../services/mockData';
import { Play, Flame, Award, BookOpen, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, setActiveCourseId } = useAuth();
  const { level, streak, xp } = useXP();

  // Find enrolled courses
  const enrolledCourses = COURSES.filter(c => c.enrolled);
  const activeCourse = COURSES.find(c => c.id === 'python-bootcamp');

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Hero Greeting Section */}
      <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-cyan/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {getGreeting()}, {user?.name.split(' ')[0]} 👋
            </h1>
          </div>
          {activeCourse && (
            <p className="text-muted text-sm md:text-base">
              You are currently learning <span className="text-cyan font-semibold">{activeCourse.title}</span>. Active module:{' '}
              <span className="text-text font-semibold">
                Module {activeCourse.modules.find(m => m.status === 'In progress')?.number || 1}:{' '}
                {activeCourse.modules.find(m => m.status === 'In progress')?.title}
              </span>.
            </p>
          )}
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <button 
              onClick={() => onNavigate('analytics')}
              className="bg-bg border border-line p-4 rounded-xl text-left hover:border-cyan transition-colors"
            >
              <div className="flex items-center justify-between text-muted mb-1 text-xs">
                <span>LEVEL</span>
                <Award className="w-4 h-4 text-cyan" />
              </div>
              <div className="text-xl font-bold">{level}</div>
              <span className="text-xs text-muted">Level 42 Explorer</span>
            </button>
            <div className="bg-bg border border-line p-4 rounded-xl text-left">
              <div className="flex items-center justify-between text-muted mb-1 text-xs">
                <span>STREAK</span>
                <Flame className="w-4 h-4 text-yellow" />
              </div>
              <div className="text-xl font-bold">{streak} Days</div>
              <span className="text-xs text-muted">Record: 15 Days</span>
            </div>
            <button 
              onClick={() => onNavigate('analytics')}
              className="bg-bg border border-line p-4 rounded-xl text-left hover:border-cyan transition-colors"
            >
              <div className="flex items-center justify-between text-muted mb-1 text-xs">
                <span>TOTAL XP</span>
                <Sparkles className="w-4 h-4 text-purple" />
              </div>
              <div className="text-xl font-bold">{xp.toLocaleString()}</div>
              <span className="text-xs text-muted">Next level in {10000 - (xp % 10000)} XP</span>
            </button>
            <button 
              onClick={() => onNavigate('learning-path')}
              className="bg-bg border border-line p-4 rounded-xl text-left hover:border-cyan transition-colors"
            >
              <div className="flex items-center justify-between text-muted mb-1 text-xs">
                <span>MODULE</span>
                <BookOpen className="w-4 h-4 text-green" />
              </div>
              <div className="text-xl font-bold">2/10</div>
              <span className="text-xs text-muted">Completed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Courses & Activity) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Course Card (Continue Learning CTA) */}
          {activeCourse && (
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-orange/20 text-orange border border-orange/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    Active Course
                  </span>
                  <h2 className="text-xl font-bold mt-2">{activeCourse.title}</h2>
                  <p className="text-muted text-sm mt-1">{activeCourse.description}</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-line flex items-center justify-center relative">
                  <div className="text-sm font-bold">{activeCourse.progress}%</div>
                  {/* Simplistic visual circular border representation */}
                  <svg className="absolute -inset-1 w-18 h-18 rotate-[-90deg]">
                    <circle 
                      cx="36" cy="36" r="30" 
                      fill="none" 
                      stroke="var(--cyan)" 
                      strokeWidth="4" 
                      strokeDasharray={`${2 * Math.PI * 30}`} 
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - activeCourse.progress / 100)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line">
                <div className="text-xs text-muted">
                  Continue with: <span className="text-text font-medium">Variables, Data Types & Operators</span>
                </div>
                <button 
                  onClick={() => {
                    setActiveCourseId(activeCourse.id);
                    onNavigate('content-player');
                  }}
                  className="bg-cyan hover:bg-cyan2 text-bg font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>OPEN LEARNING PATH</span>
                </button>
              </div>
            </div>
          )}

          {/* Enrolled Courses Grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Your Courses</h3>
              <button 
                onClick={() => onNavigate('catalog')}
                className="text-cyan hover:text-cyan2 text-sm font-semibold flex items-center space-x-1"
              >
                <span>Show all</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map(course => (
                <div key={course.id} className="bg-panel border border-line rounded-xl p-4 flex flex-col justify-between hover:border-cyan/50 transition-colors">
                  <div>
                    <span className="text-[10px] text-muted font-bold tracking-wider uppercase bg-bg px-2 py-0.5 rounded border border-line">
                      {course.level}
                    </span>
                    <h4 className="font-bold text-base mt-2 text-text">{course.title}</h4>
                    <p className="text-muted text-xs line-clamp-2 mt-1">{course.description}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-2 bg-bg rounded-full overflow-hidden">
                        <div className="h-full bg-cyan" style={{ width: `${course.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-muted">{course.progress}%</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setActiveCourseId(course.id);
                        onNavigate('learning-path');
                      }}
                      className="text-cyan hover:underline text-xs font-bold"
                    >
                      Resume course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (AI recommendations, weaknesses, events) */}
        <div className="space-y-6">
          
          {/* Upcoming Live Session Banner */}
          <div className="bg-gradient-to-r from-red/20 to-orange/20 border border-red/40 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-text">Next Session</h4>
              <p className="text-xs text-muted">
                Live session starts in 5 minutes — Python Bootcamp Day 1 Morning
              </p>
              <button 
                onClick={() => onNavigate('live-session')}
                className="text-cyan hover:text-cyan2 text-xs font-semibold flex items-center space-x-1 pt-1"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Tutor Recommendations */}
          <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted">AI Tutor Recommendations</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-bg border border-line rounded-lg p-3 text-xs space-y-2">
                <span className="text-[10px] bg-cyan/15 text-cyan px-2 py-0.5 rounded font-semibold">Current Module</span>
                <p className="font-medium text-text">Practice now: OOP Concepts • 10 min</p>
                <p className="text-muted">Based on your learning path: "Classes and Objects in Python"</p>
              </div>
              <div className="bg-bg border border-line rounded-lg p-3 text-xs space-y-2">
                <span className="text-[10px] bg-purple/15 text-purple px-2 py-0.5 rounded font-semibold">Weak Points</span>
                <p className="font-medium text-text">Review: Recursion Quiz • 8 min</p>
                <p className="text-muted">Close your knowledge gap with recursive function calls.</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('ai-tutor')}
              className="w-full bg-bg hover:bg-line border border-line hover:border-cyan text-text text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Talk to AI Tutor
            </button>
          </div>

          {/* My Weaknesses */}
          <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted">My Weak Points</h3>
              </div>
              <span className="bg-yellow/20 text-yellow text-[10px] px-2 py-0.5 rounded font-bold">3 Gaps</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['OOP Concepts', 'Recursion', 'List Comprehensions'].map((weakness, idx) => (
                <span key={idx} className="bg-bg border border-line text-xs px-3 py-1.5 rounded-lg text-text flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red" />
                  <span>{weakness}</span>
                </span>
              ))}
            </div>
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => onNavigate('analytics')}
                className="flex-1 bg-bg hover:bg-line border border-line text-xs font-semibold py-2 rounded-lg text-center"
              >
                Details
              </button>
              <button 
                onClick={() => onNavigate('ai-tutor')}
                className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-xs font-semibold py-2 rounded-lg text-center"
              >
                Analyze
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
