import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { ChevronDown, ChevronUp, Star, Award, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface CourseDetailProps {
  onNavigate: (page: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ onNavigate }) => {
  const { activeCourseId } = useAuth();
  const { addXp } = useXP();
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(0);
  
  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const [enrolled, setEnrolled] = useState(course.enrolled);

  const toggleModule = (index: number) => {
    setActiveModuleIndex(prev => (prev === index ? null : index));
  };

  const handleEnroll = async () => {
    if (!enrolled) {
      setEnrolled(true);
      // In a real app, this would update the global state or database
      addXp(100, 'Course booking completed');
      onNavigate('learning-path');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Course Hero Header */}
      <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/3 h-48 bg-bg rounded-xl overflow-hidden border border-line">
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-bg border border-line text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase text-text">
              {course.level}
            </span>
            <span className="bg-cyan/15 text-cyan text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase">
              {course.format === 'flipped' ? 'Flipped Bootcamp' : 'Self-Paced Course'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-text">{course.title}</h1>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl">
            {course.longDescription || course.description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-sm text-muted">
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-yellow fill-current" />
              <span className="text-text font-bold">{course.rating || 4.8}</span>
              <span>({course.ratingCount || 100} ratings)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-purple" />
              <span>+{course.xpReward} XP Reward</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            {enrolled ? (
              <button 
                onClick={() => onNavigate('learning-path')}
                className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full sm:w-auto text-center"
              >
                OPEN LEARNING PATH
              </button>
            ) : (
              <>
                <button 
                  onClick={handleEnroll}
                  className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  Book now for {course.price}
                </button>
                <span className="text-xs text-muted">Includes 2 months of premium AI Tutor access</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Learning Outcomes */}
          {course.learningOutcomes && (
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-text">What you will learn in this course</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm text-text leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-green shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Preview */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-text">Curriculum & Modules</h2>
            <p className="text-muted text-xs">Click on a module to show individual lessons (building blocks).</p>
            
            <div className="space-y-3">
              {course.modules && course.modules.map((mod, idx) => {
                const isOpen = activeModuleIndex === idx;
                return (
                  <div key={mod.id} className="border border-line rounded-xl overflow-hidden">
                    <button 
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between p-4 bg-bg/50 hover:bg-bg transition-colors text-left"
                    >
                      <div>
                        <span className="text-[10px] text-cyan font-bold uppercase tracking-wider block">
                          Modul {mod.number} • {mod.type}
                        </span>
                        <span className="font-bold text-sm md:text-base text-text mt-1 block">
                          {mod.title}
                        </span>
                        <span className="text-xs text-muted block mt-1 line-clamp-1">
                          {mod.description}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-muted hidden sm:inline">{mod.duration}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="p-4 bg-bg border-t border-line space-y-2">
                        {mod.lessons.map(les => (
                          <div key={les.id} className="flex items-center justify-between py-2 text-xs hover:bg-panel p-2 rounded transition-colors">
                            <div className="flex items-center space-x-2">
                              <span className="bg-panel border border-line px-2 py-0.5 rounded text-[10px] uppercase font-bold text-muted">
                                {les.type}
                              </span>
                              <span className="font-medium text-text">{les.title}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-muted">
                              {les.bloomLevel && (
                                <span className="bg-purple/10 text-purple text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                                  {les.bloomLevel}
                                </span>
                              )}
                              <span>{les.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Information) */}
        <div className="space-y-6">
          {/* Trainer Card */}
          <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Your Trainer</h3>
            <div className="flex items-center space-x-3">
              <img src={course.trainer.avatar} alt={course.trainer.name} className="w-12 h-12 rounded-full border border-line object-cover" />
              <div>
                <h4 className="font-bold text-text text-sm">{course.trainer.name}</h4>
                <p className="text-muted text-xs">{course.trainer.title}</p>
              </div>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              {course.trainer.bio}
            </p>
            {course.trainer.linkedIn && (
              <a href={course.trainer.linkedIn} target="_blank" rel="noreferrer" className="text-cyan hover:underline text-xs font-semibold block">
                View LinkedIn Profile
              </a>
            )}
          </div>

          {/* Flipped Format Details Widget */}
          {course.format === 'flipped' && (
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Flipped Classroom Info</h3>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-muted">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-text">Hybrid Rhythm:</strong> 7 self-study modules online (approx. 10.5 hours) + 2 half-day in-person workshops.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-text">Min. Group Size:</strong> Starts from 3 participants, limited group size of max. 8 for maximum support.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Award className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-text">Certificate:</strong> Completing the capstone project unlocks the verifiable Credly certificate.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
