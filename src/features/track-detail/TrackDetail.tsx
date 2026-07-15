import React, { useState, useEffect } from 'react';
import {
  Clock, BookOpen, Bookmark, BookmarkCheck,
  ChevronLeft, Target, Users, ArrowRight, CheckCircle, Lock, Sparkles, Rocket, TrendingUp
} from 'lucide-react';
import { TRACKS, COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useTrack } from './useTrack';
import { RingProgress } from '../dashboard/Dashboard';
import { SelfAssessmentStrip } from './SelfAssessmentStrip';
import { TrackPathBrowser } from './TrackPathBrowser';
import { TrackVisualPath } from './TrackVisualPath';
import { TrackPathMap } from './TrackPathMap';
import { TrackCompletionModal } from './TrackCompletionModal';
import { useNotifications } from '../../context/NotificationContext';
import { calculateTrackProgress } from '../../services/progressUtils';
import type { Course, CareerTrack } from '../../types';
import heroStudentImg from '../../assets/hero-student.png';
import manthioLogo from '../../assets/logo_7_prio_1_variation-cropped.png';
import avatarBoy from '../../assets/avatars/boy.png';
import avatarGirl from '../../assets/avatars/girl.png';
import avatarWoman1 from '../../assets/avatars/woman(1).png';

interface TrackDetailProps {
  onNavigate: (page: string) => void;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  certification: '🏅 Certification',
  role: '💼 Role',
  project: '🛠️ Project',
  topic: '📚 Topic',
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
  const isEnrolled = !!(progress?.enrolledAt) || track.enrolled;
  const displayAsEnrolled = isEnrolled;
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
  // Learning path per viewport: phones (<768px) keep the original vertical path,
  // tablets and small desktops (768–1279px) get the game-style course map, and
  // large desktops (≥1280px) get the pinned roadmap browser.
  const getViewport = () =>
    window.matchMedia('(max-width: 767px)').matches ? 'phone'
    : window.matchMedia('(max-width: 1279px)').matches ? 'tablet'
    : 'desktop';
  const [viewport, setViewport] = useState<'phone' | 'tablet' | 'desktop'>(getViewport);

  useEffect(() => {
    const queries = ['(max-width: 767px)', '(max-width: 1279px)'].map(q => window.matchMedia(q));
    const onChange = () => setViewport(getViewport());
    queries.forEach(mq => mq.addEventListener('change', onChange));
    return () => queries.forEach(mq => mq.removeEventListener('change', onChange));
  }, []);

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
              className={`flex items-center gap-2 px-5 py-2 rounded font-bold text-[11px] border transition-all uppercase tracking-wider shadow-sm hover:shadow-md hover:translate-y-[-1px] ${isBookmarked
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

        {/* ── Hero: Two-Card Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Card 1: Track intro with decorative shapes + cutout human image */}
          <div
            className="@container track-hero-card relative rounded-2xl overflow-hidden border border-line shadow-lg flex flex-col h-full"
          >
            <style>{`
              .track-hero-card {
                background: linear-gradient(135deg, #0A2A2E 0%, #0F4A4A 40%, #00A899 100%);
                --hero-text: #FFFFFF;
                --hero-text-muted: rgba(255, 255, 255, 0.8);
                --hero-btn-text: #0A2A2E;
              }
              [data-theme='light'] .track-hero-card {
                background: linear-gradient(135deg, #3FA79A 0%, #5BB8AC 40%, #8DCFC5 100%);
                --hero-text: #0A2A2E;
                --hero-text-muted: rgba(10, 42, 46, 0.75);
                --hero-btn-text: #0A2A2E;
              }
            `}</style>
            {/* Decorative shapes — Manthio brand palette */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Gold-toned accent blobs */}
              <div className="absolute top-4 right-1/3 w-28 h-28 rounded-full bg-yellow/25 blur-2xl" />
              <div className="absolute -bottom-8 right-4 w-44 h-44 rounded-full bg-cyan/30 blur-2xl" />
              {/* Subtle ring accents */}
              <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full border-4 border-yellow/20" />
              <div className="absolute bottom-10 right-1/3 w-12 h-12 rounded-full border-2 border-white/15" />
              {/* Manthio logo watermark — large, ghosted behind the hero */}
              <img
                src={manthioLogo}
                alt=""
                className="absolute top-1/2 right-0 -translate-y-1/2 w-60 h-auto opacity-[0.08] pointer-events-none select-none"
              />
              {/* Star sparkle accent */}
              <svg className="absolute top-4 right-1/4 w-5 h-5 text-yellow/60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5z" />
              </svg>
              <svg className="absolute bottom-8 right-[45%] w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>

            {/* Layout: stacked (text top, image bottom) when narrow; side-by-side when wider */}
            <div className="relative flex flex-col @[300px]:grid @[300px]:grid-cols-5 flex-1 min-h-[260px]">
              <div
                className="@[300px]:col-span-3 p-3 @[360px]:p-5 @[560px]:p-7 flex flex-col justify-between @[440px]:justify-center @[560px]:justify-between gap-2 @[420px]:gap-4 z-10 @[300px]:h-full"
                style={{ color: 'var(--hero-text)' }}
              >
                <div className="flex gap-1.5 flex-wrap">
                  <span
                    className="text-[9px] @[360px]:text-[10px] @[520px]:text-[11px] font-bold uppercase px-2 @[420px]:px-2.5 py-0.5 @[420px]:py-1 rounded border"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--hero-text) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--hero-text) 25%, transparent)', color: 'var(--hero-text)' }}
                  >
                    {GOAL_TYPE_LABELS[goalType]}
                  </span>
                  <span
                    className="text-[9px] @[360px]:text-[10px] @[520px]:text-[11px] font-bold uppercase px-2 @[420px]:px-2.5 py-0.5 @[420px]:py-1 rounded border"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--hero-text) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--hero-text) 25%, transparent)', color: 'var(--hero-text)' }}
                  >
                    {difficulty}
                  </span>
                </div>
                <div className="space-y-1.5 @[420px]:space-y-3 @[300px]:flex-1 flex flex-col @[300px]:justify-center">
                  <h1 className="text-base @[360px]:text-lg @[420px]:text-xl @[520px]:text-2xl @[640px]:text-3xl @[720px]:text-[30px] font-black leading-tight">
                    {track.title}
                  </h1>
                  <p
                    className="text-[10px] @[360px]:text-[11px] @[420px]:text-xs @[560px]:text-sm @[640px]:text-base leading-relaxed"
                    style={{ color: 'var(--hero-text-muted)' }}
                  >
                    Grow with expert-led courses from top instructors.
                  </p>
                </div>
                {displayAsEnrolled ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onNavigate('signin');
                        return;
                      }
                      const next = mappedMilestones.find(m => !completedMilestoneIds.includes(m.id) && m.courseId);
                      if (next?.courseId) {
                        handleNavigateToCourse(next.courseId, 'learning-path');
                      } else if (mappedMilestones[0]?.courseId) {
                        handleNavigateToCourse(mappedMilestones[0].courseId, 'learning-path');
                      }
                    }}
                    className="self-start bg-cyan hover:bg-cyan2 text-bg font-black text-[10px] @[360px]:text-[11px] @[420px]:text-xs @[520px]:text-sm px-3 @[420px]:px-5 py-1.5 @[420px]:py-2.5 rounded-xl transition-all flex items-center gap-1.5 @[420px]:gap-2 shadow-lg shadow-cyan/20 active:scale-[0.98] cursor-pointer"
                  >
                    {completedRequired === totalMilestones ? 'Review Track' : 'Continue Learning'}
                    <ArrowRight className="w-3 h-3 @[420px]:w-3.5 @[420px]:h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCheckoutItem({ type: 'track', id: track.id });
                      onNavigate('checkout');
                    }}
                    className="self-start bg-cyan hover:bg-cyan2 text-bg font-black text-[10px] @[360px]:text-[11px] @[420px]:text-xs @[520px]:text-sm px-3 @[420px]:px-5 py-1.5 @[420px]:py-2.5 rounded-xl transition-all flex items-center gap-1.5 @[420px]:gap-2 shadow-lg shadow-cyan/20 active:scale-[0.98] cursor-pointer"
                  >
                    Start for Free
                    <ArrowRight className="w-3 h-3 @[420px]:w-3.5 @[420px]:h-3.5" />
                  </button>
                )}
              </div>
              {/* Image column — width-based sizing so it scales with card width */}
              <div className="@[300px]:col-span-2 relative flex-1 min-h-[100px] @[300px]:min-h-0">
                <img
                  src={heroStudentImg}
                  alt="Learner"
                  className="absolute right-0 bottom-0 z-10 w-[55%] @[300px]:w-[95%] @[520px]:w-full max-w-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Info laid out with small images, icons, and design accents */}
          <div className="relative bg-panel border border-line rounded-2xl overflow-hidden shadow-lg">
            {/* Decorative shapes */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-cyan/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-purple/10 blur-2xl" />
            </div>

            <div className="relative p-6 md:p-7 space-y-4 min-h-[240px]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-cyan tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Track Overview
                  </div>
                  <h2 className="text-lg md:text-xl font-black leading-tight text-text">
                    What you'll master
                  </h2>
                </div>
                {/* Small avatar cluster */}
                <div className="flex -space-x-2 shrink-0">
                  <img
                    src={avatarGirl}
                    alt="Learner"
                    className="w-8 h-8 shrink-0 aspect-square rounded-full border-2 border-line object-cover bg-panel"
                  />
                  <img
                    src={avatarBoy}
                    alt="Learner"
                    className="w-8 h-8 shrink-0 aspect-square rounded-full border-2 border-line object-cover bg-panel"
                  />
                  <img
                    src={avatarWoman1}
                    alt="Learner"
                    className="w-8 h-8 shrink-0 aspect-square rounded-full border-2 border-line object-cover bg-panel"
                  />
                  <div className="w-8 h-8 shrink-0 aspect-square rounded-full border-2 border-line bg-cyan/20 text-cyan text-[9px] font-black flex items-center justify-center leading-none">
                    +{enrolledCourseCount}
                  </div>
                </div>
              </div>

              <p className="text-muted text-xs md:text-sm leading-relaxed">
                {track.outcomeStatement}
              </p>

              {/* Info tile grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-cyan/15 text-cyan flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase text-muted tracking-wider truncate">Duration</p>
                    <p className="text-[11px] font-bold text-text truncate">{track.estimatedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-purple/15 text-purple flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase text-muted tracking-wider truncate">Courses</p>
                    <p className="text-[11px] font-bold text-text truncate">{enrolledCourseCount} courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-orange/15 text-orange flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase text-muted tracking-wider truncate">Milestones</p>
                    <p className="text-[11px] font-bold text-text truncate">{track.milestones.length} stages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-green/15 text-green flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase text-muted tracking-wider truncate">Level</p>
                    <p className="text-[11px] font-bold text-text capitalize truncate">{track.level}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-muted">
                <Rocket className="w-3.5 h-3.5 text-cyan" />
                Join {enrolledCourseCount * 1284}+ learners already on this path
              </div>
            </div>
          </div>
        </div>

        {/* ── Contents displayed after the hero cards ── */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <p className="text-muted text-sm md:text-base leading-relaxed max-w-3xl">
              {track.outcomeStatement}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted">
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

            {!displayAsEnrolled && (
              <p className="text-[11px] text-muted font-medium italic">
                Browse the full path below without enrolling.
              </p>
            )}
          </div>

          {/* Progress card (enrolled only AND authenticated) */}
          {(displayAsEnrolled && isAuthenticated) && (
            <div className="relative bg-panel border border-line rounded-2xl overflow-hidden shadow-lg w-full max-w-sm lg:w-auto lg:shrink-0">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-cyan/10 blur-2xl" />
              </div>
              <div className="relative p-5 flex items-center gap-4">
                <RingProgress progress={progressPct} size={72} strokeWidth={10} color="var(--cyan)" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-muted tracking-widest">
                    Track Progress
                  </p>
                  <p className="text-sm font-bold text-text mt-0.5">
                    {completedRequired} of {totalMilestones} required milestones
                  </p>
                </div>
              </div>
            </div>
          )}
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

          {viewport === 'phone' ? (
            <TrackVisualPath
              milestones={mappedMilestones}
              completedMilestoneIds={completedMilestoneIds}
              selfAssessmentLevel={selfLevel}
              isEnrolled={displayAsEnrolled}
              completedLessonIds={completedLessonIds}
              onNavigateToCourse={(id, target) => handleNavigateToCourse(id, target)}
            />
          ) : viewport === 'tablet' ? (
            <TrackPathMap
              milestones={mappedMilestones}
              completedMilestoneIds={completedMilestoneIds}
              selfAssessmentLevel={selfLevel}
              isEnrolled={displayAsEnrolled}
              onNavigateToCourse={(id, target) => handleNavigateToCourse(id, target)}
            />
          ) : (
            <TrackPathBrowser
              trackTitle={track.title}
              milestones={mappedMilestones}
              completedMilestoneIds={completedMilestoneIds}
              selfAssessmentLevel={selfLevel}
              isEnrolled={displayAsEnrolled}
              completedLessonIds={completedLessonIds}
              onNavigateToCourse={(id, target) => handleNavigateToCourse(id, target)}
            />
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {TRACKS.filter(t => t.id !== track.id).slice(0, 3).map(sibling => (
                <button
                  key={sibling.id}
                  onClick={() => {
                    setActiveTrackId(sibling.id);
                    // Already on track-detail, just reload
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group relative flex flex-col min-h-[300px] bg-panel border border-line rounded-3xl overflow-hidden text-left transition-all duration-300 hover:border-cyan/50 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-1"
                >
                  {/* Cover image with scrim + floating badges */}
                  <div className="h-44 w-full shrink-0 overflow-hidden relative">
                    <img
                      src={sibling.imageUrl}
                      alt={sibling.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      style={{
                        // Dissolve the image itself into the card panel: fully opaque
                        // until ~60% down, then a smooth fade to nothing at the bottom.
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                      }}
                    />

                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg/70 backdrop-blur-md border border-line/50 text-[9px] font-black uppercase tracking-widest text-text">
                      <TrendingUp className="w-3 h-3 text-cyan" />
                      {sibling.level}
                    </span>

                    <span className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-cyan text-bg shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-2.5">
                    <h4 className="font-black text-sm text-text group-hover:text-cyan transition-colors line-clamp-2 leading-snug">
                      {sibling.title}
                    </h4>
                    <p className="text-[11px] text-muted line-clamp-2 leading-relaxed flex-1">
                      {sibling.outcomeStatement}
                    </p>

                    {sibling.tags && sibling.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sibling.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-panel2 border border-line/60 text-[9px] font-bold text-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[10px] text-muted font-bold pt-3 mt-auto border-t border-line/50">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan" />{sibling.estimatedTime}</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-cyan" />{sibling.coursesCount} courses</span>
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
