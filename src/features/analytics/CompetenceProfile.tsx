import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { ChevronLeft, Target, Trophy, AlertTriangle, TrendingUp, Sparkles, BookOpen, CheckCircle2, Zap } from 'lucide-react';

interface CompetenceProfileProps {
  onNavigate: (page: string) => void;
}

export const CompetenceProfile: React.FC<CompetenceProfileProps> = ({ onNavigate }) => {
  const [data, setData] = useState(() => analyticsService.getAnalyticsData());

  useEffect(() => {
    const handleUpdate = () => {
      setData(analyticsService.getAnalyticsData());
    };
    window.addEventListener('manthio_analytics_update', handleUpdate);
    return () => window.removeEventListener('manthio_analytics_update', handleUpdate);
  }, []);

  const competencies = Object.entries(data.competencies).sort((a, b) => b[1] - a[1]);
  const strengths = competencies.slice(0, 3);
  const areasForImprovement = competencies.filter(([, score]) => score < 50);

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Proficient';
    if (score >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const getStatusStyle = (score: number) => {
    if (score >= 80) return 'text-purple bg-purple/10 border-purple/30';
    if (score >= 60) return 'text-cyan bg-cyan/10 border-cyan/30';
    if (score >= 40) return 'text-orange bg-orange/10 border-orange/30';
    return 'text-red bg-red/10 border-red/30';
  };

  const getSkillDescription = (score: number, skill: string) => {
    if (score >= 80) return `Demonstrates strong mastery and fluid application of ${skill} concepts in complex scenarios.`;
    if (score >= 60) return `Solid understanding of ${skill}. Capable of solving standard problems independently.`;
    if (score >= 40) return `Grasps the fundamentals of ${skill} but may need guidance on advanced implementations.`;
    return `Currently building foundational knowledge in ${skill}. Focus on core concepts.`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-2">
        <button 
          onClick={() => onNavigate('analytics')}
          className="flex items-center gap-1.5 w-fit py-1.5 px-2 -ml-2 hover:bg-bg rounded-lg transition-colors border border-transparent hover:border-line group text-muted hover:text-text"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-bold">Back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text font-display leading-tight">Competence Profile Details</h1>
          <p className="text-muted text-sm mt-1">A deep dive into your technical skills and learning progression.</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-text">Top Strengths</h2>
              <p className="text-xs text-muted">Your highest rated skills</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {strengths.map(([skill, score], idx) => (
              <div key={skill} className="flex items-center gap-4 group">
                <div className="w-6 text-center font-display font-bold text-muted/50 group-hover:text-purple/50 transition-colors">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-sm text-text">{skill}</span>
                    <span className="font-mono text-xs text-purple font-bold">{score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-line/50">
                    <div className="h-full bg-purple transition-all duration-1000 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-text">Focus Areas</h2>
              <p className="text-xs text-muted">Skills requiring attention</p>
            </div>
          </div>
          
          {areasForImprovement.length > 0 ? (
            <div className="space-y-4">
              {areasForImprovement.slice(0, 3).map(([skill, score]) => (
                <div key={skill} className="flex items-center gap-4 group">
                  <div className="p-1.5 rounded-lg bg-orange/10 text-orange group-hover:bg-orange group-hover:text-bg transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm text-text">{skill}</span>
                      <span className="font-mono text-xs text-orange font-bold">{score}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-line/50">
                      <div className="h-full bg-orange transition-all duration-1000 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center text-muted">
              <Sparkles className="w-8 h-8 text-cyan/50 mb-2" />
              <p className="text-sm font-medium">No major knowledge gaps detected!</p>
              <p className="text-xs mt-1">Keep up the good work and push your limits.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Grid */}
      <div className="bg-panel border border-line rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-base text-text font-display">Detailed Breakdown</h2>
            <p className="text-xs text-muted">All tracked competencies and their current proficiency levels</p>
          </div>
          <div className="p-2 bg-cyan/10 text-cyan rounded-lg border border-cyan/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competencies.map(([skill, score]) => {
            const weakness = data.weaknesses.find(w => w.topic === skill && !w.resolved);

            return (
              <div key={skill} className="p-5 border border-line rounded-xl bg-bg hover:border-line/80 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-base text-text">{skill}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusStyle(score)}`}>
                      {getStatusText(score)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted leading-relaxed mb-5">
                    {getSkillDescription(score, skill)}
                  </p>
                  
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>Proficiency</span>
                      <span className="font-mono font-bold text-text">{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-panel rounded-full overflow-hidden border border-line">
                      <div className="h-full bg-cyan transition-all duration-1000 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>

                  {weakness && (
                    <div className="mb-5 p-3 bg-orange/5 border border-orange/20 rounded-lg flex gap-3 items-start">
                      <AlertTriangle className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-orange mb-1">Active Gap Identified</p>
                        <p className="text-[10px] text-orange/80 leading-snug">{weakness.gapDescription}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-line/50">
                  <span className="text-[10px] text-muted flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Last practiced recently
                  </span>
                  <div className="flex items-center gap-3">
                    {weakness ? (
                      <button 
                        onClick={() => onNavigate(`ai-tutor:remediation-${weakness.id}`)}
                        className="text-[10px] font-bold bg-cyan text-bg hover:bg-cyan2 transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Fix Gap with AI</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => onNavigate('catalog')}
                        className="text-[10px] font-bold text-cyan hover:text-cyan2 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Find related courses</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
