import React, { useMemo, useRef, useState } from 'react';
import { COURSES, TRACKS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { hashNum, LEARNER_AVATARS } from '../../components/social/socialUtils';
import { CatalogSearch } from './CatalogSearch';
import type { CareerTrack, Course } from '../../types';
import {
  Award,
  Bookmark,
  ChevronRight,
  Clock,
  Heart,
  Layers,
  MessageCircle,
  Search,
  Send,
  Share2,
  Star,
  X,
} from 'lucide-react';

// ── localStorage persistence helpers ─────────────────────────────────────────
const LIKES_KEY = 'manthio_feed_likes';
const SAVES_KEY = 'manthio_feed_saves';
const commentsKey = (courseId: string) => `manthio_feed_comments_${courseId}`;

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

interface FeedComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

// Course or track — anything the social rail (like/comment/save/share) can target.
interface FeedSubject {
  id: string;
  title: string;
  description: string;
}

// Deterministic mock comments so every course feels alive without a backend.
const SEED_AUTHORS = ['Lena K.', 'Marco T.', 'Priya S.', 'Jonas W.', 'Aisha B.', 'Tom R.'];
const SEED_TEXTS = [
  'This one finally made the concepts click for me 🔥',
  'Enrolled last week — the pacing is perfect.',
  'The hands-on labs in this course are top tier.',
  'Adding this to my learning plan for sure.',
  'Trainer explains everything so clearly 👏',
  'Did anyone pair this with the live sessions?',
  'Great starting point before the advanced material.',
  'The XP grind on this one is so worth it 😄',
];

const getSeededComments = (subject: FeedSubject): FeedComment[] => {
  const count = hashNum(subject.id + '-comments', 2, 4);
  const offset = hashNum(subject.id, 0, SEED_TEXTS.length - 1);
  return Array.from({ length: count }, (_, i) => ({
    id: `seed-${subject.id}-${i}`,
    author: SEED_AUTHORS[(offset + i) % SEED_AUTHORS.length],
    avatar: LEARNER_AVATARS[(offset + i) % LEARNER_AVATARS.length],
    text: SEED_TEXTS[(offset + i) % SEED_TEXTS.length],
    time: `${hashNum(subject.id + i, 1, 6)}d`,
  }));
};

// Compact display for seeded social counts (e.g. 1.2k).
const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

// ── Action rail button (TikTok-style) ────────────────────────────────────────
const RailButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeClass?: string;
  onClick: () => void;
}> = ({ icon, label, active = false, activeClass = '', onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group">
    <span
      className={`w-11 h-11 rounded-full flex items-center justify-center border backdrop-blur-md shadow-md transition-all duration-200 active:scale-90 ${active ? activeClass : 'bg-bg/40 border-line/60 text-text group-hover:border-cyan/50'
        }`}
    >
      {icon}
    </span>
    <span className="text-[10px] font-bold text-text/80 drop-shadow-sm tabular-nums">{label}</span>
  </button>
);

interface CatalogFeedProps {
  onNavigate: (page: string) => void;
  onSwitchToGrid: () => void;
}

export const CatalogFeed: React.FC<CatalogFeedProps> = ({ onNavigate }) => {
  const { user, setActiveCourseId, setActiveTrackId } = useAuth();
  const { addToast } = useXP();
  const { resolvedTheme } = useTheme();

  // Resolve each track's courses from its milestones (deduped, unknown ids skipped)
  const feedTracks = useMemo(() => {
    return TRACKS.map(track => {
      const ids = Array.from(new Set(track.milestones.flatMap(m => m.courses.map(c => c.id))));
      const courses = ids
        .map(id => COURSES.find(c => c.id === id))
        .filter((c): c is Course => Boolean(c));
      return { track, courses };
    }).filter(item => item.courses.length > 0);
  }, []);

  const [trackIndex, setTrackIndex] = useState(0);
  const [courseIndexes, setCourseIndexes] = useState<Record<string, number>>({});
  const horizRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const verticalRef = useRef<HTMLDivElement | null>(null);

  // TikTok-style category tabs on top of the feed
  const categories = [
    { id: 'tracks', label: 'Tracks' },
    { id: 'courses', label: 'Courses' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'my', label: 'My Courses' },
  ];
  const [selectedCategory, setSelectedCategory] = useState('tracks');

  const visibleTracks = useMemo(() => {
    if (selectedCategory === 'tracks') return feedTracks;
    // Course-centric categories: flatten to one course per vertical page (deduped)
    const seen = new Set<string>();
    return feedTracks.flatMap(({ track, courses }) =>
      courses
        .filter(c => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          if (selectedCategory === 'recommended') return !c.enrolled;
          if (selectedCategory === 'my') return c.enrolled;
          return true;
        })
        .map(c => ({ track, courses: [c] }))
    );
  }, [feedTracks, selectedCategory]);

  const selectCategory = (id: string) => {
    if (id === selectedCategory) return;
    setSelectedCategory(id);
    setTrackIndex(0);
    setCourseIndexes({});
    verticalRef.current?.scrollTo({ top: 0 });
  };

  // Social state (persisted)
  const [likedIds, setLikedIds] = useState<string[]>(() => readJson<string[]>(LIKES_KEY, []));
  const [savedIds, setSavedIds] = useState<string[]>(() => readJson<string[]>(SAVES_KEY, []));
  const [commentsFor, setCommentsFor] = useState<FeedSubject | null>(null);
  const [userComments, setUserComments] = useState<FeedComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleLike = (courseId: string) => {
    setLikedIds(prev => {
      const next = prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId];
      localStorage.setItem(LIKES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleSave = (courseId: string) => {
    const isSaved = savedIds.includes(courseId);
    setSavedIds(prev => {
      const next = isSaved ? prev.filter(id => id !== courseId) : [...prev, courseId];
      localStorage.setItem(SAVES_KEY, JSON.stringify(next));
      return next;
    });
    if (!isSaved) addToast('success', 'Saved to your bookmarks');
  };

  const openComments = (subject: FeedSubject) => {
    setUserComments(readJson<FeedComment[]>(commentsKey(subject.id), []));
    setCommentDraft('');
    setCommentsFor(subject);
  };

  const postComment = () => {
    if (!commentsFor || !commentDraft.trim()) return;
    const comment: FeedComment = {
      id: `user-${Date.now()}`,
      author: user?.name || 'You',
      avatar: user?.avatar || LEARNER_AVATARS[0],
      text: commentDraft.trim(),
      time: 'now',
    };
    const next = [comment, ...userComments];
    setUserComments(next);
    localStorage.setItem(commentsKey(commentsFor.id), JSON.stringify(next));
    setCommentDraft('');
  };

  const shareSubject = async (subject: FeedSubject, kind: 'course' | 'track') => {
    const url = `${window.location.origin}/?${kind}=${subject.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: subject.title, text: subject.description, url });
      } catch {
        /* user dismissed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', `${kind === 'track' ? 'Track' : 'Course'} link copied to clipboard`);
    } catch {
      addToast('error', `Could not copy the ${kind} link`);
    }
  };

  const openCourse = (course: Course) => {
    setActiveTrackId(null);
    setActiveCourseId(course.id);
    onNavigate('course-detail');
  };

  const openLearningPath = (course: Course) => {
    setActiveTrackId(null);
    setActiveCourseId(course.id);
    onNavigate('learning-path');
  };

  const openTrack = (track: CareerTrack) => {
    setActiveCourseId(null);
    setActiveTrackId(track.id);
    onNavigate('track-detail');
  };

  const handleVerticalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== trackIndex) setTrackIndex(Math.min(Math.max(idx, 0), visibleTracks.length - 1));
  };

  const handleHorizontalScroll = (trackId: string) => (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCourseIndexes(prev => (prev[trackId] === idx ? prev : { ...prev, [trackId]: idx }));
  };

  const scrollToCourse = (trackId: string, idx: number) => {
    const el = horizRefs.current[trackId];
    if (el) el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="fixed inset-0 z-40 bg-bg overflow-hidden">
      {/* HEADER — category tabs + search, below the app top bar */}
      <div className="absolute inset-x-0 top-[76px] z-30 flex flex-col justify-center pointer-events-none">
        {/* CATEGORY TABS (TikTok-style: plain text, active one highlighted) */}
        <div className="relative flex items-center px-4">
          <div className="pointer-events-auto flex-1 flex items-center justify-center gap-5 overflow-x-auto scrollbar-hide">
            {categories.map(cat => {
              const active = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={`relative shrink-0 pb-1.5 text-[11px] font-black tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] ${active ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                >
                  {cat.label}
                  {/* Short active-indicator bar (TikTok-style) */}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
          {/* SEARCH (TikTok-style: icon at the right of the tabs) */}
          <button
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="pointer-events-auto shrink-0 ml-3 -mt-1.5 p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* VERTICAL TRACK FEED */}
      <div
        ref={verticalRef}
        onScroll={handleVerticalScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide overscroll-contain"
      >
        {visibleTracks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 px-8 text-center">
            <Layers className="w-10 h-10 text-muted" />
            <p className="text-sm font-bold text-text">Nothing here yet</p>
            <p className="text-xs text-muted">
              {selectedCategory === 'my'
                ? "You haven't enrolled in any courses yet — check out the recommendations."
                : 'No courses match this category yet.'}
            </p>
            <button
              onClick={() => selectCategory(selectedCategory === 'my' ? 'recommended' : 'tracks')}
              className="mt-2 h-9 px-5 rounded-lg bg-cyan text-bg text-[11px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              {selectedCategory === 'my' ? 'View Recommended' : 'Back to Tracks'}
            </button>
          </div>
        )}
        {visibleTracks.map(({ track, courses }, tIdx) => {
          const sectionKey = `${track.id}-${courses[0]?.id ?? tIdx}`;
          // In the Tracks category the first slide introduces the track itself;
          // swiping right reveals its courses in milestone order.
          const hasIntro = selectedCategory === 'tracks';
          const slideCount = courses.length + (hasIntro ? 1 : 0);
          const slideIdx = Math.min(courseIndexes[sectionKey] ?? 0, slideCount - 1);
          const activeCourse = hasIntro
            ? slideIdx === 0
              ? null
              : courses[slideIdx - 1]
            : courses[slideIdx];

          return (
            <section key={sectionKey} className="relative h-full w-full snap-start snap-always overflow-hidden">
              {/* HORIZONTAL SLIDER (track intro first, then one course per slide) */}
              <div
                ref={el => { horizRefs.current[sectionKey] = el; }}
                onScroll={handleHorizontalScroll(sectionKey)}
                className="h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain"
              >
                {hasIntro && (
                  <div className="relative h-full w-full shrink-0 snap-center overflow-hidden">
                    {/* Background track image */}
                    <div className="absolute inset-0 bg-bg">
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-[55%] bg-gradient-to-t from-bg via-bg/70 to-transparent pointer-events-none z-0" />

                    {/* CONTENT OVERLAY — BOTTOM LEFT */}
                    <div className="absolute inset-x-0 bottom-0 px-5 pb-8 pr-20 flex flex-col items-start text-left z-10">
                      <span className="flex items-center gap-1.5 mb-2 bg-cyan/15 border border-cyan/40 text-cyan text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
                        <Layers className="w-3 h-3" /> Career Track
                      </span>

                      <h2
                        className={`text-xl md:text-2xl font-black leading-tight mb-2 drop-shadow-sm ${isDark ? 'text-white' : 'text-text'
                          }`}
                      >
                        {track.title}
                      </h2>

                      <p
                        className={`text-[11px] md:text-xs font-medium leading-relaxed line-clamp-2 mb-3 ${isDark ? 'text-white/60' : 'text-text/70'
                          }`}
                      >
                        {track.outcomeStatement || track.description}
                      </p>

                      {/* Meta chips */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] font-bold">
                        <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded uppercase">
                          {track.level}
                        </span>
                        <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded">
                          <Clock className="w-3 h-3 text-cyan" /> {track.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded">
                          <Layers className="w-3 h-3 text-cyan" /> {track.coursesCount} courses
                        </span>
                      </div>

                      {/* CTAs */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openTrack(track)}
                          className="h-9 px-5 rounded-lg bg-cyan text-bg text-[11px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                          {track.progress === 100 ? 'Review' : track.enrolled ? 'Continue' : 'View Track'}
                        </button>
                        <button
                          onClick={() => scrollToCourse(sectionKey, 1)}
                          className="h-9 px-4 rounded-lg border-2 border-cyan/30 text-cyan text-[11px] font-black uppercase tracking-wider hover:border-cyan active:scale-95 transition-all flex items-center gap-1.5 bg-bg/30 backdrop-blur-sm cursor-pointer"
                        >
                          Courses
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {courses.map(course => {
                  return (
                    <div key={course.id} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
                      {/* Background course image (stand-in for the onboarding video) */}
                      <div className="absolute inset-0 bg-bg">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>

                      {/* Bottom gradient wash (same treatment as onboarding mobile slides) */}
                      <div className="absolute bottom-0 left-0 w-full h-[55%] bg-gradient-to-t from-bg via-bg/70 to-transparent pointer-events-none z-0" />

                      {/* CONTENT OVERLAY — BOTTOM LEFT (onboarding style) */}
                      <div className="absolute inset-x-0 bottom-0 px-5 pb-8 pr-20 flex flex-col items-start text-left z-10">
                        <h2
                          className={`text-xl md:text-2xl font-black leading-tight mb-2 drop-shadow-sm ${isDark ? 'text-white' : 'text-text'
                            }`}
                        >
                          {course.title}
                        </h2>

                        <p
                          className={`text-[11px] md:text-xs font-medium leading-relaxed line-clamp-2 mb-3 ${isDark ? 'text-white/60' : 'text-text/70'
                            }`}
                        >
                          {course.description}
                        </p>

                        {/* Meta chips */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] font-bold">
                          <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded uppercase">
                            {course.level}
                          </span>
                          <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded">
                            <Clock className="w-3 h-3 text-cyan" /> {course.duration}
                          </span>
                          <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded">
                            <Award className="w-3 h-3 text-cyan" /> +{course.xpReward} XP
                          </span>
                          {course.rating !== undefined && (
                            <span className="flex items-center gap-1 bg-bg/50 backdrop-blur-md border border-line/60 text-text px-2 py-1 rounded">
                              <Star className="w-3 h-3 text-yellow fill-yellow" /> {course.rating}
                            </span>
                          )}
                        </div>

                        {/* Trainer */}
                        <div className="flex items-center gap-2 mb-4">
                          <img
                            src={course.trainer.avatar}
                            alt={course.trainer.name}
                            className="w-6 h-6 rounded-full border border-line object-cover"
                          />
                          <span className="text-[11px] font-bold text-text/90 drop-shadow-sm">
                            {course.trainer.name}
                          </span>
                          <span className="text-[10px] text-muted truncate max-w-[140px]">
                            {course.trainer.title}
                          </span>
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openCourse(course)}
                            className="h-9 px-5 rounded-lg bg-cyan text-bg text-[11px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                          >
                            {course.progress === 100 ? 'Review' : course.enrolled ? 'Continue' : 'View Course'}
                          </button>
                          <button
                            onClick={() => openLearningPath(course)}
                            className="h-9 px-4 rounded-lg border-2 border-cyan/30 text-cyan text-[11px] font-black uppercase tracking-wider hover:border-cyan active:scale-95 transition-all flex items-center gap-1.5 bg-bg/30 backdrop-blur-sm cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Learning Path
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SLIDE PAGINATION BARS (within this track) — bottom of the screen */}
              {slideCount > 1 && (
                <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
                  {Array.from({ length: slideCount }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToCourse(sectionKey, idx)}
                      className={`pointer-events-auto h-0.5 transition-all duration-500 rounded-full cursor-pointer ${idx === slideIdx ? 'w-6 bg-cyan' : 'w-2 bg-line hover:bg-text/30'
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* ACTION RAIL — RIGHT SIDE (like / comment / bookmark / share) */}
              {(() => {
                // On the track intro slide the rail targets the track itself.
                const subject: FeedSubject | null = activeCourse ?? (hasIntro ? track : null);
                if (!subject) return null;
                const kind = activeCourse ? 'course' : 'track';
                const liked = likedIds.includes(subject.id);
                const saved = savedIds.includes(subject.id);
                const likeCount = hashNum(subject.id + '-likes', 180, 2400) + (liked ? 1 : 0);
                const commentCount =
                  getSeededComments(subject).length +
                  readJson<FeedComment[]>(commentsKey(subject.id), []).length;
                const saveCount = hashNum(subject.id + '-saves', 40, 600) + (saved ? 1 : 0);

                return (
                  <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-4">
                    <RailButton
                      icon={<Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />}
                      label={formatCount(likeCount)}
                      active={liked}
                      activeClass="bg-red/15 border-red/40 text-red"
                      onClick={() => toggleLike(subject.id)}
                    />
                    <RailButton
                      icon={<MessageCircle className="w-5 h-5" />}
                      label={formatCount(commentCount)}
                      onClick={() => openComments(subject)}
                    />
                    <RailButton
                      icon={<Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />}
                      label={formatCount(saveCount)}
                      active={saved}
                      activeClass="bg-cyan/15 border-cyan/40 text-cyan"
                      onClick={() => toggleSave(subject.id)}
                    />
                    <RailButton
                      icon={<Share2 className="w-5 h-5" />}
                      label="Share"
                      onClick={() => shareSubject(subject, kind)}
                    />
                  </div>
                );
              })()}
            </section>
          );
        })}
      </div>

      {/* SEARCH OVERLAY (catalog-only: courses and tracks) */}
      <CatalogSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCourse={openCourse}
        onOpenTrack={openTrack}
      />

      {/* COMMENTS BOTTOM SHEET */}
      {commentsFor && (
        <div className="absolute inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setCommentsFor(null)}
          />
          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 max-h-[70%] bg-panel border-t border-line rounded-t-2xl flex flex-col shadow-2xl animate-[slide-up_0.3s_cubic-bezier(0.22,1,0.36,1)]">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-black text-text">Testimonials</h3>
                <p className="text-[10px] text-muted truncate">{commentsFor.title}</p>
              </div>
              <button
                onClick={() => setCommentsFor(null)}
                className="p-1.5 rounded-md text-muted hover:text-text hover:bg-line/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[180px]">
              {[...userComments, ...getSeededComments(commentsFor)].map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-8 h-8 rounded-full border border-line object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-bold text-text">{comment.author}</span>
                      <span className="text-[9px] text-muted">{comment.time}</span>
                    </div>
                    <p className="text-xs text-text/80 leading-relaxed break-words">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-line shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
              <img
                src={user?.avatar || LEARNER_AVATARS[0]}
                alt=""
                className="w-8 h-8 rounded-full border border-line object-cover shrink-0"
              />
              <input
                type="text"
                value={commentDraft}
                onChange={e => setCommentDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') postComment(); }}
                placeholder="Add a comment..."
                className="flex-1 bg-bg border border-line rounded-full px-4 py-2 text-xs text-text focus:border-cyan focus:outline-none transition-colors"
              />
              <button
                onClick={postComment}
                disabled={!commentDraft.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${commentDraft.trim()
                    ? 'bg-cyan text-bg hover:opacity-90 active:scale-90 cursor-pointer'
                    : 'bg-line text-muted cursor-not-allowed'
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
