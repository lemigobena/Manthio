import React, { useState, useEffect } from 'react';
import {
  Clock, BookOpen, Award, Bookmark, BookmarkCheck,
  ChevronLeft, Target, Users, Zap, ArrowRight, CheckCircle, Lock
} from 'lucide-react';
import { TRACKS, COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useTrack } from './useTrack';
import { SelfAssessmentStrip } from './SelfAssessmentStrip';
import { TrackVisualPath } from './TrackVisualPath';
import { TrackCompletionModal } from './TrackCompletionModal';
import { useNotifications } from '../../context/NotificationContext';
import { calculateTrackProgress } from '../../services/progressUtils';
import type { Course, CareerTrack } from '../../types';

interface TrackDetailProps {
  onNavigate: (page: string) => void;
}

const GOAL_TYPE_COLORS: Record<string, string> = {
  certification: 'bg-cyan text-bg border-cyan',
  role:          'bg-purple text-white border-purple',
  project:       'bg-orange text-white border-orange',
  topic:         'bg-green text-white border-green',
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  certification: '🏅 Certification',
  role:          '💼 Role',
  project:       '🛠️ Project',
  topic:         '📚 Topic',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'bg-bg text-text border-line',
  intermediate: 'bg-bg text-text border-line',
  advanced:     'bg-bg text-text border-line',
};

export const TrackDetail: React.FC<TrackDetailProps> = ({ onNavigate }) => {
  const { activeTrackId, user, setActiveCourseId, setActiveTrackId, setCheckoutItem, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const {
    bookmarkTrack, setSelfAssessment, getProgress,
    dismissCompletionModal, completedLessonIds
  } = useTrack();

  // Find the track from TRACKS — fall back to first track if none set
  const track = TRACKS.find(t => t.id === activeTrackId) ?? TRACKS[0];

  const progress = getProgress(track.id);
  const isEnrolled = !!(progress?.enrolledAt);
  const displayAsEnrolled = !isAuthenticated ? true : isEnrolled;
  const isBookmarked = !!(progress?.bookmarkedAt);
  const selfLevel = progress?.selfAssessmentLevel ?? 'nothing';
  // Build the milestones in the new extended format
  // The existing CareerTrack milestones use {id, title, courses[], status}
  // We map to our visual path format
  const mappedMilestones = track.milestones.flatMap((ms, msIdx) =>
    ms.courses.length > 0
      ? ms.courses.map((courseEntry, cIdx) => ({
          id: `${ms.id}-${courseEntry.id}`,
          label: cIdx === 0 ? ms.title : `${ms.title} — Extra`,
          courseId: courseEntry.id,
          isOptional: courseEntry.isOptional,
          isSubCourse: cIdx > 0,
          primaryIndex: msIdx,
          prerequisiteMilestoneIds: msIdx === 0 ? [] : [
            `${track.milestones[msIdx - 1].id}-${track.milestones[msIdx - 1].courses[0]?.id}`
          ],
          order: msIdx * 10 + cIdx,
        }))
      : [{
          id: `${ms.id}-empty`,
          label: ms.title,
          courseId: '',
          isOptional: false,
          isSubCourse: false,
          primaryIndex: msIdx,
          prerequisiteMilestoneIds: msIdx === 0 ? [] : [
            `${track.milestones[msIdx - 1].id}-${track.milestones[msIdx - 1].courses[0]?.id}`
          ],
          order: msIdx * 10,
        }]
  );

  const totalMilestones = mappedMilestones.filter(m => !m.isOptional).length;
  const isMockCompleted = track.progress === 100;
  const completedMilestoneIds = isMockCompleted 
    ? mappedMilestones.map(m => m.id) 
    : (progress?.completedMilestoneIds ?? []);
  
  
  const completedRequired = mappedMilestones.filter(m => !m.isOptional && completedMilestoneIds.includes(m.id)).length;
  const isCompletedTrack = isMockCompleted || completedRequired === totalMilestones;
  
  // REQ-PROGRESS-002: Dynamic track progress based on lessons
  const progressPct = isCompletedTrack 
    ? 100 
    : calculateTrackProgress(track as unknown as CareerTrack, COURSES as unknown as Course[], completedLessonIds);

  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 600);
    return () => clearTimeout(t);
  }, [track.id]);

  const handleEnroll = () => {
    setShowEnrollConfirm(false);
    setCheckoutItem({ type: 'track', id: track.id });
    onNavigate('checkout');
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      onNavigate('signin');
      return;
    }
    bookmarkTrack(track.id);
    addNotification({
      category: 'course',
      title: isBookmarked ? 'Bookmark removed' : `Track bookmarked`,
      message: isBookmarked ? '' : `"${track.title}" saved to your bookmarks.`,
      critical: false,
    });
  };

  const handleNavigateToCourse = (courseId: string, targetPage: 'course-detail' | 'learning-path' = 'course-detail') => {
    if (!isAuthenticated) {
      onNavigate('signin');
      return;
    }
    setActiveTrackId(null);
    setActiveCourseId(courseId);
    onNavigate(targetPage);
  };

  // Derived extras
  const enrolledCourseCount = track.milestones.reduce((acc, ms) => acc + ms.courses.length, 0);

  // Tags used in catalog
  const goalType = track.id.includes('cloud') ? 'role'
    : track.id.includes('data') ? 'certification'
    : 'role';

  const difficulty: 'beginner' | 'intermediate' | 'advanced' =
    track.level === 'Advanced' ? 'advanced'
    : track.level === 'Intermediate' ? 'intermediate'
    : 'beginner';

  if (isPageLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-panel rounded-xl w-48" />
        <div className="h-64 bg-panel rounded-2xl" />
        <div className="h-24 bg-panel rounded-2xl" />
        <div className="h-56 bg-panel rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="relative -mx-3 md:-mx-[44px] -my-6 bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">

        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2 text-muted hover:text-cyan text-xs font-bold transition-colors uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4" />
              All Tracks
            </button>
          ) : <div />}

          {/* Bookmark Button */}
          {isAuthenticated && (
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-5 py-2 rounded font-bold text-[11px] border transition-all uppercase tracking-wider shadow-sm hover:shadow-md hover:translate-y-[-1px] ${
                isBookmarked
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-line bg-panel hover:border-cyan/50 text-text hover:text-cyan'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this track'}
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isBookmarked ? 'Saved' : 'Save Track'}
            </button>
          )}
        </div>

        {/* ── Hero Header ── */}
        <div className="relative bg-panel border border-line rounded-2xl overflow-hidden">
          {/* Banner image */}
          <div className="h-64 md:h-80 relative overflow-hidden">
            <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-90 block" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            {/* Goal type chip */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border shadow-sm ${GOAL_TYPE_COLORS[goalType]}`}>
                {GOAL_TYPE_LABELS[goalType]}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border shadow-sm ${DIFFICULTY_COLORS[difficulty]}`}>
                {difficulty}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-text leading-tight">
              {track.title}
            </h1>
            <p className="text-muted text-sm md:text-base leading-relaxed max-w-3xl">
              {track.outcomeStatement}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan" />
                {track.estimatedTime}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan" />
                {enrolledCourseCount} Courses
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan" />
                {track.milestones.length} Milestones
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan" />
                {track.level}
              </span>
            </div>

            {/* Progress bar (enrolled only AND authenticated) */}
            {(displayAsEnrolled && isAuthenticated) && (
              <div className="space-y-1.5 max-w-sm">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted">
                  <span>Track Progress</span>
                  <span className="text-cyan">{progressPct}%</span>
                </div>
                <div className="h-2 bg-bg border border-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan shadow-[0_0_10px_rgba(0,245,228,0.4)] transition-all duration-1000 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted">
                  {completedRequired} of {totalMilestones} required milestones
                </p>
              </div>
            )}

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {displayAsEnrolled ? (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      onNavigate('signin');
                      return;
                    }
                    // Navigate to first uncompleted milestone's course
                    const next = mappedMilestones.find(m => !completedMilestoneIds.includes(m.id) && m.courseId);
                    if (next?.courseId) {
                      handleNavigateToCourse(next.courseId, 'learning-path');
                    } else if (mappedMilestones[0]?.courseId) {
                      handleNavigateToCourse(mappedMilestones[0].courseId, 'learning-path');
                    }
                  }}
                  className="relative overflow-hidden group bg-cyan hover:bg-cyan2 text-bg font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,245,228,0.25)] hover:shadow-[0_6px_30px_rgba(0,245,228,0.4)] hover:translate-y-[-2px] flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {completedRequired === totalMilestones ? 'Review Track' : 'Continue Learning'}
                  <div className="absolute inset-0 bg-white/15 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              ) : (
                <button
                  onClick={() => setShowEnrollConfirm(true)}
                  className="relative overflow-hidden group bg-cyan hover:bg-cyan2 text-bg font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,245,228,0.25)] hover:shadow-[0_6px_30px_rgba(0,245,228,0.4)] hover:translate-y-[-2px] flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  {isCompletedTrack ? 'Start A New' : 'Start Your Journey'}
                  <div className="absolute inset-0 bg-white/15 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-15deg]" />
                </button>
              )}
              {!displayAsEnrolled && (
                <p className="self-center text-[11px] text-muted font-medium italic">
                  Browse the full path below without enrolling.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enroll Confirm Banner */}
        {showEnrollConfirm && (
          <div className="bg-cyan/5 border border-cyan/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="space-y-1">
              <h3 className="font-black text-text text-sm">Start your journey on this track?</h3>
              <p className="text-[11px] text-muted">
                Enrolling marks this as your active track and enables progress tracking.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleEnroll}
                className="bg-cyan hover:bg-cyan2 text-bg font-black text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Enroll Now
              </button>
              <button
                onClick={() => setShowEnrollConfirm(false)}
                className="border border-line text-muted hover:text-text text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Self-Assessment Strip ── */}
        {!isCompletedTrack && (
          <SelfAssessmentStrip
            currentLevel={selfLevel}
            onChange={(level) => {
              if (!isAuthenticated) {
                onNavigate('signin');
                return;
              }
              setSelfAssessment(track.id, level);
            }}
            isEnrolled={displayAsEnrolled}
          />
        )}

        {/* ── Visual Path (REQ-TRACK-001) ── */}
        <div className="py-6 space-y-12">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-[10px] font-black uppercase text-cyan tracking-widest">
               Track Roadmap
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-text">Learning Path</h2>
            <p className="text-sm text-muted max-w-2xl">
              {displayAsEnrolled
                ? 'Your milestone-by-milestone journey through this track.'
                : 'Browse the full track structure — enroll to start tracking progress.'}
            </p>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold text-muted pt-4">
              {[
                { dot: 'bg-green shadow-[0_0_8px_rgba(43,222,126,0.5)]', label: 'Completed' },
                { dot: 'bg-cyan animate-pulse shadow-[0_0_10px_rgba(0,245,228,0.6)]', label: 'Current' },
                { dot: 'bg-bg border-2 border-cyan/40', label: 'Available' },
                { icon: <Lock className="w-3 h-3 text-muted" />, label: 'Locked' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5">
                  {l.dot ? <span className={`w-3 h-3 rounded-full flex-shrink-0 ${l.dot}`} /> : l.icon}
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          <TrackVisualPath
            milestones={mappedMilestones}
            completedMilestoneIds={completedMilestoneIds}
            selfAssessmentLevel={selfLevel}
            isEnrolled={displayAsEnrolled}
            completedLessonIds={completedLessonIds}
            onNavigateToCourse={(id, target) => handleNavigateToCourse(id, target)}
          />
        </div>

        {/* ── Sibling Tracks ── */}
        {TRACKS.filter(t => t.id !== track.id).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-black text-text text-base">Other Career Tracks</h3>
              <button
                onClick={() => onNavigate('catalog')}
                className="text-cyan hover:text-cyan2 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                View all <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRACKS.filter(t => t.id !== track.id).slice(0, 3).map(sibling => (
                <button
                  key={sibling.id}
                  onClick={() => {
                    setActiveTrackId(sibling.id);
                    // Already on track-detail, just reload
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex flex-col min-h-[260px] bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/40 transition-all text-left hover:shadow-xl hover:translate-y-[-2px] duration-300"
                >
                  <div className="h-36 w-full shrink-0 overflow-hidden relative">
                    <img src={sibling.imageUrl} alt={sibling.title} className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col space-y-2">
                    <h4 className="font-black text-sm text-text group-hover:text-cyan transition-colors line-clamp-2">{sibling.title}</h4>
                    <p className="text-[11px] text-muted line-clamp-3 leading-relaxed flex-1">{sibling.outcomeStatement}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted font-bold pt-2 mt-auto border-t border-line/50">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan" />{sibling.estimatedTime}</span>
                      <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-cyan" />{sibling.level}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Track Completion Modal */}
      {showCompletion && (
        <TrackCompletionModal
          trackTitle={track.title}
          completedAt={new Date()}
          learnerName={user?.name ?? 'Learner'}
          onClose={() => { setShowCompletion(false); dismissCompletionModal(); }}
        />
      )}
    </div>
  );
};
