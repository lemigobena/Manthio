import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, Star, Award, CheckCircle, Clock, BrainCircuit, Globe, User, BookOpen, HelpCircle, ShieldCheck, Zap, ChevronRight, Users, ArrowRight, Laptop, PlayCircle, Bookmark, Share2, MessageSquare, Info, Eye, Lock, Play, FileText, Code2, Monitor, LayoutGrid, FolderOpen, Route } from 'lucide-react';
import { useXP } from '../../context/XPContext';
import { useTrack } from '../track-detail/useTrack';
import { calculateCourseProgress } from '../../services/progressUtils';
import { AvatarStack } from '../../components/social/SocialKit';
import { hashNum } from '../../components/social/socialUtils';
import type { Course, Review, LessonType } from '../../types';

// Lesson-type → icon (module curriculum list)
const getLessonTypeIcon = (type: LessonType) => {
  switch (type) {
    case 'Video':      return <Play className="w-3.5 h-3.5 fill-current" />;
    case 'Article':    return <FileText className="w-3.5 h-3.5" />;
    case 'Quiz':       return <HelpCircle className="w-3.5 h-3.5" />;
    case 'Code':       return <Code2 className="w-3.5 h-3.5" />;
    case 'Live Event': return <Users className="w-3.5 h-3.5" />;
    default:           return <FileText className="w-3.5 h-3.5" />;
  }
};

interface CourseDetailProps {
  onNavigate: (page: string) => void;
  isPublic?: boolean;
}

// Uniform section header: icon chip + title + optional subtitle — keeps every section identical
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; tint?: string }> = ({ icon, title, subtitle, tint = 'bg-cyan/10' }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-xl shrink-0 ${tint}`}>{icon}</div>
    <div>
      <h2 className="text-xl font-bold text-text tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-muted font-medium mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const MOCK_DATES = {
  todayStr: new Date(Date.now()).toLocaleDateString(),
  nextWeekStr: new Date(Date.now() + 86400000 * 7).toLocaleDateString(),
  nextTwoWeeksStr: new Date(Date.now() + 86400000 * 14).toLocaleDateString(),
};

export const CourseDetail: React.FC<CourseDetailProps> = ({ onNavigate, isPublic }) => {
  const { user, activeCourseId, selectedFormat, setSelectedFormat, setActiveCourseId, setActiveTrackId } = useAuth();
  const { addToast, addXp } = useXP();
  const { completedLessonIds } = useTrack();
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [savedOn, setSavedOn] = useState(false);
  const [followOn, setFollowOn] = useState(false);
  // Rate + submit testimonial
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const { todayStr, nextWeekStr, nextTwoWeeksStr } = MOCK_DATES;

  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];

  // Social-proof numbers (deterministic, stable across renders)
  const enrolledCount = course.enrolled ? hashNum(course.id, 3200, 14800) : hashNum(course.id, 800, 5200);
  const onlineNow      = hashNum(course.id + 'live', 30, 210);

  const displayTitle = course.title;
  const displayImageUrl = course.imageUrl;
  const displayLevel = course.level;
  const displayEnrolled = course.enrolled;

  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Initialize global format (for courses)
  React.useEffect(() => {
    if (course) {
      const isFormatAvailable = course.availableFormats?.some(f => f.format === selectedFormat) || course.format === selectedFormat;

      if (!selectedFormat || !isFormatAvailable) {
        if (course.availableFormats && course.availableFormats.length > 0) {
          setSelectedFormat(course.availableFormats[0].format);
        } else {
          setSelectedFormat(course.format);
        }
      }
    }
  }, [course, selectedFormat, setSelectedFormat]);

  const enrolled = displayEnrolled;

  const activeFormatData = course?.availableFormats?.find(f => f.format === selectedFormat);
  const activeBundle = activeFormatData?.bundledSubscription || course?.bundledSubscription;
  const activeCohort = activeFormatData?.cohortProgress || course?.cohortProgress;

  const toggleModule = (index: number) => {
    setActiveModuleIndex(prev => (prev === index ? null : index));
  };

  const handleEnroll = () => {
    if (isPublic) {
      onNavigate('signin');
      return;
    }

    // Direct access for included or employer sponsored courses
    if (course?.priceStatus === 'included' || course?.priceStatus === 'employer') {
      const bundleInfo = activeBundle ? ` + ${activeBundle.durationMonths}m ${activeBundle.label} activated!` : '';
      addToast('success', `🎓 Enrolled in ${displayTitle}— access via ${course.priceStatus === 'included' ? 'your plan' : 'your employer'}.${bundleInfo}`);
      onNavigate('learning-path');
      return;
    }

    if (!enrolled) {
      onNavigate('checkout');
    }
  };

  const trainerCourses = COURSES.filter(c => course ? (c.trainer.id === course.trainer.id && c.id !== course.id) : false).slice(0, 2);
  const relatedCourses = COURSES.filter(c => course ? c.id !== course.id : true).slice(0, 3);

  const faqs = [
    { q: "Do I need any prior programming knowledge?", a: "For this Foundation course, no deep experience is required. However, being comfortable with basic computer operations and logical thinking will help you progress faster." },
    { q: "Is the software required free?", a: "Yes, we exclusively use open-source tools like Python, VS Code, and Git. We'll guide you through the entire installation process in the first module." },
    { q: "What if I miss a live workshop session?", a: "Workshop sessions are highly interactive and not recorded to protect student privacy. If you miss one, we provide detailed debrief materials, but we strongly recommend attending for the live feedback." }
  ];

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewText.trim()) {
      addToast('error', 'Please add a star rating and a short review before submitting.');
      return;
    }
    const newReview: Review = {
      id: `my-review-${myReviews.length}-${reviewText.length}`,
      userName: user?.name || 'You',
      userAvatar: user?.avatar,
      rating: reviewRating,
      comment: reviewText.trim(),
      date: new Date(Date.now()).toISOString(),
      isVerified: true,
      helpfulCount: 0,
    };
    setMyReviews(prev => [newReview, ...prev]);
    setReviewRating(0);
    setHoverRating(0);
    setReviewText('');
    setShowReviewForm(false);
    addXp(75, 'Shared a course review');
    addToast('success', '🎉 Thanks! Your testimonial has been posted.');
  };

  return (
    <div className="relative -mx-3 md:-mx-[44px] -my-6 bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="space-y-8 pb-32 max-w-[1600px] mx-auto">
        {/* Course Hero Header */}
      <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center shadow-sm">
        <div className="w-full md:w-1/3 h-48 bg-bg rounded-xl overflow-hidden border border-line">
          <img src={displayImageUrl} alt={displayTitle} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-bg border border-line text-[10px] px-2.5 py-1 rounded font-bold uppercase text-text shadow-sm">
              {displayLevel}
            </span>
            <div className="flex flex-wrap gap-2">
              {course?.format === 'Multiple formats' ? (
                <span className="bg-bg border border-cyan text-cyan text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm">
                  Multi-Mode Available
                </span>
              ) : (
                <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm ${
                  selectedFormat === 'flipped' ? 'bg-cyan text-bg' :
                  selectedFormat === 'cohort' ? 'bg-purple text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {selectedFormat === 'flipped' ? 'Flipped Bootcamp' :
                   selectedFormat === 'cohort' ? 'Cohort-Based' :
                   'Self-Paced'}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-text tracking-tight break-words hyphens-auto w-full">{displayTitle}</h1>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl font-medium line-clamp-3">
            {course!.longDescription || course!.description}
          </p>

          {/* Consolidated meta row — rating · students · duration · language */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-text">
              <Star className="w-3.5 h-3.5 text-orange fill-orange" />
              <span>{course?.rating || 4.8}</span>
              <span className="text-muted font-medium">({course?.ratingCount || 100})</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-line" />
            <div className="flex items-center gap-1.5 text-text"><Clock className="w-3.5 h-3.5 text-cyan" />{course?.duration}</div>
            <span className="w-1 h-1 rounded-full bg-line" />
            <div className="flex items-center gap-1.5 text-text"><Globe className="w-3.5 h-3.5 text-cyan" />{course?.language || 'English'}</div>
            <span className="w-1 h-1 rounded-full bg-line" />
            <div className="flex items-center gap-1.5 text-purple"><Award className="w-3.5 h-3.5" />+{course?.xpReward || 1500} XP</div>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
            <AvatarStack seed={course.id} count={4} size={26} />
            <span className="text-xs text-muted font-semibold">
              <span className="text-text font-bold">{enrolledCount.toLocaleString()}</span> enrolled
              <span className="mx-1.5 opacity-40">·</span>
              <span className="inline-flex items-center gap-1 text-green font-bold align-middle">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />{onlineNow} learning now
              </span>
            </span>
          </div>

          {/* Cohort Progress Bar (REQ-CHECKOUT-015) */}
          {activeCohort && (
            <div className="pt-2 max-w-sm">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                <span className={activeCohort.currentParticipants < activeCohort.minParticipants ? "text-orange" : "text-green"}>
                  {activeCohort.currentParticipants < activeCohort.minParticipants ? "Reservation Status" : "Booking Confirmed"}
                </span>
                <span className="text-text font-bold">
                  {activeCohort.currentParticipants} / {activeCohort.maxParticipants} <span className="text-muted">Seats</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-bg border border-line rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${activeCohort.currentParticipants < activeCohort.minParticipants ? 'bg-orange animate-[pulse_2s_infinite]' : 'bg-green shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`}
                  style={{ width: `${(activeCohort.currentParticipants / activeCohort.maxParticipants) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-muted font-bold mt-1.5 flex items-center gap-1.5 italic">
                <Users className="w-3 h-3 text-cyan" />
                {activeCohort.currentParticipants < activeCohort.minParticipants
                  ? `Only ${activeCohort.minParticipants - activeCohort.currentParticipants} more bookings needed to trigger confirmation.`
                  : `Hurry! Only ${activeCohort.maxParticipants - activeCohort.currentParticipants} seats remaining for this session.`}
              </p>
            </div>
          )}

          <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
            {/* CTA logic based on enrollment and progress */}
            {(calculateCourseProgress(course as unknown as Course, completedLessonIds) < 100) ? (
              enrolled ? (
                <button
                  onClick={() => onNavigate('learning-path')}
                  className="bg-cyan hover:bg-cyan/90 text-bg font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(45,212,191,0.2)] hover:translate-y-[-2px] cursor-pointer w-full sm:w-auto text-center uppercase tracking-wider text-xs"
                >
                  Continue learning
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <button
                    onClick={handleEnroll}
                    className="bg-cyan hover:bg-cyan/90 text-bg font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(45,212,191,0.2)] hover:translate-y-[-2px] cursor-pointer w-full sm:w-auto text-center uppercase tracking-wider text-xs whitespace-nowrap"
                  >
                    {course!.priceStatus === 'included' ? 'Enrol now (Included in Plan)' :
                     course!.priceStatus === 'employer' ? 'Enrol now (Employer Sponsored)' :
                     `Enrol now for ${course!.availableFormats?.find(f => f.format === selectedFormat)?.price || course!.price}`}
                  </button>
                  <div className="flex items-center space-x-2 bg-bg/50 border border-line px-4 py-3.5 rounded-xl">
                    <BrainCircuit className="w-4 h-4 text-orange" />
                    <span className="text-[10px] text-muted font-bold uppercase">Includes Premium AI Access</span>
                  </div>
                </div>
              )
            ) : (
              <button
                onClick={() => onNavigate('completed-course:' + course?.id)}
                className="bg-cyan hover:bg-cyan/90 text-bg font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(45,212,191,0.2)] hover:translate-y-[-2px] cursor-pointer w-full sm:w-auto text-center uppercase tracking-wider text-xs"
              >
                Review Course
              </button>
            )}
          </div>
        </div>

        {/* Quick actions — save / discuss / share (top-right corner toolbar) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            onClick={() => setSavedOn(v => !v)}
            title={savedOn ? 'Saved' : 'Save course'}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-90 backdrop-blur-md ${
              savedOn ? 'bg-cyan/15 border-cyan/40 text-cyan' : 'bg-bg/70 border-line text-muted hover:text-text hover:border-line'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${savedOn ? 'fill-cyan' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('community')}
            title="Discuss"
            className="w-9 h-9 rounded-full border border-line bg-bg/70 text-muted hover:text-text hover:border-line flex items-center justify-center transition-all active:scale-90 backdrop-blur-md"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => addToast('success', '🔗 Course link copied to clipboard!')}
            title="Share"
            className="w-9 h-9 rounded-full border border-line bg-bg/70 text-muted hover:text-text hover:border-line flex items-center justify-center transition-all active:scale-90 backdrop-blur-md"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Completion Badge (Bottom Right) */}
        {(calculateCourseProgress(course as unknown as Course, completedLessonIds) === 100) && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-green/10 border border-green/30 px-4 py-1 rounded-l shadow-[0_4px_20px_rgba(34,197,94,0.1)] backdrop-blur-md">
            <div className="bg-green/20 p-1 rounded-full">
              <CheckCircle className="w-4 h-4 text-green" />
            </div>
            <span className="text-[10px] font-black text-green uppercase tracking-[0.1em]">Completed</span>
          </div>
        )}
      </div>

      {/* Multi-mode Comparison View - Full Width Original Design */}
      {course?.availableFormats && (
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-6 mt-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <SectionHeader icon={<Zap className="w-5 h-5 text-cyan" />} title="Choose your learning experience" />
            <span className="text-[10px] font-bold text-cyan bg-cyan/10 px-3 py-1 rounded-full uppercase tracking-wider">Multi-Format Available</span>
          </div>

          {(() => {
            const FEATURE_ROWS = [
              { key: 'aiTutor', label: 'AI Tutor Allowance', sub: '24/7 personalized support', has: (f: NonNullable<Course['availableFormats']>[number]) => !!f.features.aiTutor },
              { key: 'peerCohort', label: 'Peer Cohort Access', sub: 'Learn with a community', has: (f: NonNullable<Course['availableFormats']>[number]) => !!f.features.peerCohort },
              { key: 'inPerson', label: 'In-Person Component', sub: 'Expert-led workshops', has: (f: NonNullable<Course['availableFormats']>[number]) => !!f.features.inPerson },
              { key: 'certificate', label: 'Certificate Eligibility', sub: 'Verified skill credentials', has: (f: NonNullable<Course['availableFormats']>[number]) => !!f.features.certificate },
            ];
            const formatLabel = (fmt: string) => fmt === 'flipped' ? 'Flipped' : fmt === 'cohort' ? 'Cohort' : 'Self-Paced';
            const selectFormat = (fmt: typeof selectedFormat) => {
              setSelectedFormat(fmt);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            const selectButton = (f: NonNullable<Course['availableFormats']>[number]) => (
              <button
                onClick={() => selectFormat(f.format)}
                className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedFormat === f.format
                    ? 'bg-cyan text-bg shadow-[0_4px_15px_rgba(45,212,191,0.3)]'
                    : 'bg-bg border border-line text-text hover:border-cyan/50'
                }`}
              >
                {selectedFormat === f.format ? 'Selected' : 'Select'}
              </button>
            );

            return (
              <>
                {/* Mobile: stacked format cards */}
                <div className="md:hidden space-y-3">
                  {course?.availableFormats?.map(f => (
                    <div
                      key={f.format}
                      className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                        selectedFormat === f.format ? 'border-cyan/50 bg-cyan/5' : 'border-line bg-bg'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-widest ${selectedFormat === f.format ? 'text-cyan' : 'text-muted'}`}>
                            {formatLabel(f.format)}
                          </div>
                          <div className="text-base font-bold text-text">{f.price}</div>
                        </div>
                        {f.bundledSubscription && (
                          <div className="text-right">
                            <span className="text-xs font-black text-cyan block">+{f.bundledSubscription.durationMonths}m bundle</span>
                            <span className="text-[9px] text-muted font-bold uppercase">worth {f.bundledSubscription.valueAmount}</span>
                          </div>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {FEATURE_ROWS.map(row => (
                          <li key={row.key} className={`flex items-center gap-2 text-xs ${row.has(f) ? 'text-text font-medium' : 'text-muted/50 line-through'}`}>
                            {row.has(f)
                              ? <CheckCircle className="w-3.5 h-3.5 text-green shrink-0" />
                              : <span className="w-3.5 text-center shrink-0">—</span>}
                            {row.label}
                          </li>
                        ))}
                      </ul>
                      {selectButton(f)}
                    </div>
                  ))}
                </div>

                {/* md+: comparison table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line/50">
                        <th className="py-4 text-[10px] font-black uppercase text-muted tracking-widest w-1/3">Feature</th>
                        {course?.availableFormats?.map(f => (
                          <th key={f.format} className="py-4 px-4 text-center">
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedFormat === f.format ? 'text-cyan' : 'text-muted'}`}>
                              {formatLabel(f.format)}
                            </div>
                            <div className="text-sm font-bold text-text">{f.price}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURE_ROWS.map(row => (
                        <tr key={row.key} className="border-b border-line/30">
                          <td className="py-4 pr-4">
                            <div className="text-xs font-bold text-text">{row.label}</div>
                            <div className="text-[10px] text-muted">{row.sub}</div>
                          </td>
                          {course?.availableFormats?.map(f => (
                            <td key={f.format} className="py-4 px-4 text-center">
                              {row.has(f) ? <CheckCircle className="w-4 h-4 text-green mx-auto" /> : <span className="text-muted opacity-20">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-b border-line/30">
                        <td className="py-4 pr-4">
                          <div className="text-xs font-bold text-text">Platform Access Bundle</div>
                          <div className="text-[10px] text-muted">Premium subscription included</div>
                        </td>
                        {course?.availableFormats?.map(f => (
                          <td key={f.format} className="py-4 px-4 text-center">
                            {f.bundledSubscription ? (
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-cyan">+{f.bundledSubscription.durationMonths}m</span>
                                <span className="text-[8px] text-muted font-bold uppercase truncate max-w-[80px]">worth {f.bundledSubscription.valueAmount}</span>
                              </div>
                            ) : <span className="text-muted opacity-20">—</span>}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-6"></td>
                        {course?.availableFormats?.map(f => (
                          <td key={f.format} className="py-6 px-4 text-center">
                            {selectButton(f)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
            </div>
      )}

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Format & Delivery Section */}
          <div className="py-6 border-b border-line">
            {/* Section Header */}
            <div className="mb-6">
              <SectionHeader
                icon={<LayoutGrid className="w-5 h-5 text-cyan" />}
                title="Format & Delivery"
                subtitle="How this course is structured and delivered"
              />
            </div>

            {/* Bento layout: hero tile w/ delivery flow + detail & stat tiles */}
            {(() => {
              const fmtKey = (selectedFormat === 'flipped' || course?.format === 'flipped') ? 'flipped' : selectedFormat === 'cohort' ? 'cohort' : 'self';
              const themes = {
                flipped: {
                  Icon: Globe,
                  badge: 'Flipped Bootcamp',
                  headline: 'In-Person + Self-Study Hybrid',
                  tagline: 'Absorb theory at your own pace, then apply it live in the room.',
                  accent: 'text-cyan', soft: 'bg-cyan/10', border: 'border-cyan/30', dot: 'bg-cyan', glow: 'bg-cyan/10', hoverBorder: 'hover:border-cyan/40',
                  flow: [
                    { title: 'Self-Study', sub: 'Units 1–3 online' },
                    { title: 'Workshop I', sub: `${todayStr} · Muri/Bern` },
                    { title: 'Self-Study', sub: 'Units 4–7 online' },
                    { title: 'Capstone', sub: `${nextWeekStr} · Muri/Bern` },
                  ],
                  details: [
                    { Icon: Globe, title: 'In-Person Sessions', body: <>apigenio Training Centre, Muri/Bern<br /><span className="text-text/80 font-medium">{todayStr} & {nextWeekStr}</span></> },
                    { Icon: BookOpen, title: 'Self-Study Windows', body: <>Units 1–3 before session 1<br />Units 4–7 before capstone</> },
                  ],
                  time: '10.5h self-study + 2 half-day workshops',
                },
                cohort: {
                  Icon: Users,
                  badge: 'Cohort-Based',
                  headline: 'Live Expert-Led Journey',
                  tagline: 'Learn alongside a fixed group with weekly live guidance.',
                  accent: 'text-purple', soft: 'bg-purple/10', border: 'border-purple/30', dot: 'bg-purple', glow: 'bg-purple/20', hoverBorder: 'hover:border-purple/40',
                  flow: [
                    { title: 'Enrol', sub: 'Secure your seat' },
                    { title: 'Kick-Off', sub: nextTwoWeeksStr },
                    { title: 'Live Sessions', sub: 'Tuesdays 18:00 CET' },
                    { title: 'Graduation', sub: 'Certificate & outcomes' },
                  ],
                  details: [
                    { Icon: Clock, title: 'Schedule & Start Date', body: <>Next cohort: <span className="text-text/80 font-medium">{nextTwoWeeksStr}</span><br />Live sessions: Tuesdays 18:00 CET</> },
                    { Icon: Award, title: 'Past Outcomes', body: <ul className="space-y-0.5"><li>85% promotion within 6 months</li><li>+18% avg. salary increase</li><li>100+ satisfied graduates</li></ul> },
                  ],
                  time: '8-week journey · weekly live sessions',
                },
                self: {
                  Icon: Monitor,
                  badge: 'Self-Paced',
                  headline: 'Learn At Your Own Rhythm',
                  tagline: 'Full access from day one — you set the tempo, we keep the lights on.',
                  accent: 'text-amber-400', soft: 'bg-amber-400/10', border: 'border-amber-400/30', dot: 'bg-amber-400', glow: 'bg-amber-400/20', hoverBorder: 'hover:border-amber-400/40',
                  flow: [
                    { title: 'Enrol', sub: 'Instant access' },
                    { title: 'Learn', sub: 'At your own pace' },
                    { title: 'Practice', sub: 'Labs, quizzes & projects' },
                    { title: 'Certify', sub: 'Verified credential' },
                  ],
                  details: [
                    { Icon: Monitor, title: 'Self-Paced Access', body: <>Unrestricted access to all materials with AI Tutor available 24/7</> },
                    { Icon: BookOpen, title: 'Interactive Content', body: <>Coding environments, quizzes & real-world projects</> },
                  ],
                  time: course?.format === 'Multiple formats'
                    ? 'Self-Paced, Cohort, or Flipped'
                    : `Recommended: 8–10h/week over ${course?.duration}`,
                },
              };
              const t = themes[fmtKey];
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Hero tile */}
                  <div className="sm:col-span-2 relative rounded-2xl border border-line bg-panel overflow-hidden">
                    <div className={`absolute -top-16 -left-16 w-52 h-52 rounded-full ${t.glow} blur-3xl opacity-30 pointer-events-none`} />
                    <t.Icon className={`absolute -right-6 -bottom-10 w-44 h-44 ${t.accent} opacity-6 pointer-events-none`} strokeWidth={1} />
                    <div className="relative p-5">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${t.border} ${t.soft} ${t.accent}`}>
                            <t.Icon className="w-3 h-3" />
                            {t.badge}
                          </span>
                          <h3 className="text-xl font-black text-text tracking-tight mt-2.5">{t.headline}</h3>
                          <p className="text-[12px] text-muted mt-1">{t.tagline}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${t.border} ${t.soft}`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.dot}`} />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${t.accent}`}>Active</span>
                        </div>
                      </div>

                      {/* Delivery flow timeline */}
                      <div className="mt-5 pt-4 border-t border-line/60">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Delivery Flow</span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-3 mt-3">
                          {t.flow.map((step, i) => (
                            <div key={i} className="relative flex sm:flex-col items-start gap-3 sm:gap-2.5">
                              {/* connector — vertical on mobile, horizontal on sm+ */}
                              {i < t.flow.length - 1 && (
                                <>
                                  <div className={`sm:hidden absolute left-[13px] top-8 -bottom-3 w-px ${t.soft}`} />
                                  <div className={`hidden sm:block absolute top-[13px] left-9 right-1 h-px ${t.soft}`} />
                                </>
                              )}
                              <div className={`relative z-10 shrink-0 w-7 h-7 rounded-full ${t.soft} border ${t.border} flex items-center justify-center text-[10px] font-black ${t.accent}`}>
                                {i + 1}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-text tracking-widest block">{step.title}</span>
                                <p className="text-[11px] text-muted leading-snug mt-0.5">{step.sub}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail tiles */}
                  {t.details.map((d, i) => (
                    <div key={i} className={`rounded-2xl border border-line bg-panel p-4 transition-colors ${t.hoverBorder}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${t.border} ${t.soft} shrink-0`}>
                          <d.Icon className={`w-4 h-4 ${t.accent}`} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">{d.title}</span>
                          <div className="text-[11px] text-muted leading-relaxed">{d.body}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Time Commitment */}
                  <div className="rounded-2xl border border-line bg-panel p-4 hover:border-cyan/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20 shrink-0">
                        <Clock className="w-4 h-4 text-cyan" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-text uppercase tracking-widest block mb-0.5">Time Commitment</span>
                        <p className="text-[11px] text-muted leading-snug">{t.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate */}
                  <div className="rounded-2xl border border-line bg-panel p-4 hover:border-cyan/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20 shrink-0">
                        <ShieldCheck className="w-4 h-4 text-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-text uppercase tracking-widest block mb-0.5">Verifiable Certificate</span>
                        <p className="text-[11px] text-muted leading-snug">Industry-recognized credential upon completion</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Preparation & Onboarding Surface (REQ-CHECKOUT-020 & 021) - Flipped only */}
          {selectedFormat === 'flipped' && ( (activeFormatData?.preCourseRequirements || course?.preCourseRequirements) || (activeFormatData?.preCourseTasks || course?.preCourseTasks) ) && (() => {
            const requirements = activeFormatData?.preCourseRequirements || course?.preCourseRequirements;
            const tasks = activeFormatData?.preCourseTasks || course?.preCourseTasks;

            return (
              <div className="py-6 border-b border-line space-y-4">
                <div className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${enrolled ? 'bg-cyan/5 border-cyan/30' : 'bg-panel border-line'}`}>
                  <h3 className="font-lg font-black text-text tracking-wider flex items-center gap-2">
                    {enrolled ? <BrainCircuit className="w-4 h-4 text-cyan" /> : <Laptop className="w-4 h-4 text-cyan" />}
                    {enrolled ? 'Get Ready Path' : 'Pre-Course Preparation'}
                  </h3>

                  {!enrolled && requirements && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      {requirements.hardware && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-muted uppercase tracking-tight">Hardware</span>
                          <ul className="space-y-1">
                            {requirements.hardware.map((item, i) => (
                              <li key={i} className="text-[10px] text-text font-medium flex items-start gap-2 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {requirements.software && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-muted uppercase tracking-tight">Software Setup</span>
                          <ul className="space-y-1">
                            {requirements.software.map((item, i) => (
                              <li key={i} className="text-[10px] text-text font-medium flex items-start gap-2 leading-snug">
                                <CheckCircle className="w-3.5 h-3.5 text-cyan mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {enrolled && tasks && (
                    <div className="space-y-3 animate-in fade-in zoom-in duration-500">
                      <p className="text-[10px] text-muted font-medium italic leading-relaxed">
                        Welcome aboard! Complete these tasks to ensure a smooth start to your session.
                      </p>
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-line/50 hover:border-cyan/30 transition-colors group cursor-pointer">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-green/10 text-green' : 'bg-bg border border-line text-muted'}`}>
                              {task.type === 'video' ? <PlayCircle className="w-3.5 h-3.5" /> :
                               task.type === 'setup' ? <Laptop className="w-3.5 h-3.5" /> :
                               <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[10px] font-bold text-text truncate">{task.title}</h4>
                              <p className="text-[8px] text-muted font-medium truncate">{task.description}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-muted group-hover:text-cyan transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Preparation & Readiness (REQ-CHECKOUT-020) */}
          {(course && course.preCourseRequirements) && (
            <div className="py-8 border-b border-line space-y-6">
              <SectionHeader icon={<Zap className="w-5 h-5 text-cyan" />} title="Preparation & Readiness" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-4">
                  {course?.preCourseRequirements?.hardware && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-muted tracking-widest pl-1 border-l-2 border-cyan/30 ml-1">Included Hardware</span>
                      <ul className="space-y-2">
                        {course.preCourseRequirements.hardware.map((item, id) => (
                          <li key={id} className="flex items-start space-x-3 text-xs text-text font-medium bg-bg/40 p-3 rounded-xl border border-line/30">
                            <CheckCircle className="w-4 h-4 text-green mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course?.preCourseRequirements?.software && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-muted tracking-widest pl-1 border-l-2 border-cyan/30 ml-1">Software Stack</span>
                      <ul className="space-y-2">
                        {course.preCourseRequirements.software.map((item, id) => (
                          <li key={id} className="flex items-start space-x-3 text-xs text-text font-medium bg-bg/40 p-3 rounded-xl border border-line/30">
                            <CheckCircle className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {course?.preCourseRequirements?.knowledge && (
                    <div className="bg-bg/60 border border-line rounded-2xl p-5 space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-orange" />
                        <span className="text-[10px] font-black uppercase text-text tracking-widest">Entry Knowledge Check</span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed font-medium">
                        To ensure the best learning experience, we recommend having familiarized yourself with:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {course.preCourseRequirements.knowledge.map((item, id) => (
                          <span key={id} className="bg-panel border border-line text-[10px] text-text px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2">
                        <div className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter opacity-50 flex items-center space-x-2">
                          <HelpCircle className="w-3 h-3" />
                          <span>Not sure if you are ready? Take the entry quiz.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5 border border-dashed border-line rounded-2xl bg-bg/20">
                    <p className="text-[10px] text-muted leading-relaxed text-center font-bold italic">
                      "Great courses rely on prepared learners. Please ensure all base prerequisites are met before starting the first lesson."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Learning Outcomes */}
          {course?.learningOutcomes && (
            <div className="py-6 border-b border-line space-y-4">
              <SectionHeader icon={<Award className="w-5 h-5 text-cyan" />} title="What you will learn in this course" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course?.learningOutcomes?.map((outcome, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm text-text leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-green shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Preview */}
          <div className="py-8 border-b border-line space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <SectionHeader
                icon={<FolderOpen className="w-5 h-5 text-cyan" />}
                title="Curriculum & Modules"
                subtitle={`Foundations of ${course?.topic} build block by block.`}
              />
              {course?.modules && course.modules.length > 0 && (
                <button
                  onClick={() => onNavigate('content-player')}
                  className="flex items-center space-x-2 bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Preview 1st Lesson</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {course?.modules && course?.modules?.map((mod, idx) => {
                const isOpen = activeModuleIndex === idx;
                return (
                  <div
                    key={mod.id}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isOpen ? 'bg-panel border-cyan/40 shadow-sm' : 'bg-panel border-line hover:border-cyan/30'
                    }`}
                  >
                    {/* Module header row */}
                    <button
                      onClick={() => toggleModule(idx)}
                      className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left ${isOpen ? 'border-b border-line' : ''}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-sm font-bold truncate ${isOpen ? 'text-cyan' : 'text-text'}`}>
                          <span className="tabular-nums">{String(mod.number).padStart(2, '0')}.</span> {mod.title}
                        </span>
                        <span title={mod.description} className="shrink-0 text-muted/50 hover:text-cyan transition-colors cursor-help">
                          <Info className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan' : 'text-muted'}`} />
                    </button>

                    {/* Lessons */}
                    {isOpen && (
                      <div>
                        {mod.lessons.map(les => {
                          const locked = les.status === 'locked';
                          return (
                            <button
                              key={les.id}
                              onClick={() => {
                                if (!locked) {
                                  localStorage.setItem('manthio_active_lesson', les.id);
                                  onNavigate('content-player');
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 text-left transition-colors ${
                                locked ? 'opacity-55 cursor-not-allowed' : 'hover:bg-bg cursor-pointer'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-bg border border-line flex items-center justify-center text-muted shrink-0">
                                {getLessonTypeIcon(les.type)}
                              </div>
                              <span className="flex-1 min-w-0 text-[13px] text-text truncate">{les.title}</span>
                              <span className="text-[11px] text-muted font-medium shrink-0 tabular-nums">{les.duration}</span>
                              {locked
                                ? <Lock className="w-3.5 h-3.5 text-muted shrink-0" />
                                : <Eye className="w-3.5 h-3.5 text-muted shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


          {/* Reviews and Testimonials Section (Moved Up) */}
          <div className="py-8 border-b border-line space-y-8">
            <div className="flex items-center justify-between gap-3">
              <SectionHeader icon={<Star className="w-5 h-5 text-orange fill-orange" />} title="Reviews & Testimonials" tint="bg-orange/10" />
              {!showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="shrink-0 flex items-center gap-2 bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20 px-4 py-2 rounded-xl transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Write a review</span>
                  <span className="sm:hidden">Review</span>
                </button>
              )}
            </div>

            {/* Rate + submit testimonial form */}
            {showReviewForm && (
              <div className="bg-bg/40 border border-cyan/30 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <img src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150'} alt={user?.name || 'You'} className="w-10 h-10 rounded-full border border-line object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-text">{user?.name || 'You'}</h4>
                    <p className="text-[10px] text-muted">Share your experience with this course</p>
                  </div>
                </div>

                {/* Interactive star rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star className={`w-6 h-6 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-orange fill-orange' : 'text-line'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted">
                    {(hoverRating || reviewRating) > 0
                      ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || reviewRating]
                      : 'Tap to rate'}
                  </span>
                </div>

                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you enjoy? What could be better? Your honest feedback helps other learners."
                  className="w-full bg-panel border border-line rounded-xl p-3 text-sm text-text placeholder:text-muted/60 !outline-none resize-none focus:outline-none focus:border-cyan/50 transition-colors"
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted font-medium">{reviewText.length}/500</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowReviewForm(false); setReviewRating(0); setHoverRating(0); setReviewText(''); }}
                      className="text-xs font-bold text-muted hover:text-text px-4 py-2 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="bg-cyan hover:bg-cyan/90 text-bg font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)]"
                    >
                      Post Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-line">
              {/* Rating Summary */}
              <div className="space-y-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-text">{course?.rating || 4.9}</span>
                  <span className="text-muted font-bold text-sm">/ 5.0</span>
                </div>
                <div className="flex text-orange">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(course?.rating || 4.9) ? 'fill-orange' : 'opacity-20'}`} />
                  ))}
                </div>
                <p className="text-xs text-muted font-medium">Based on {course?.ratingCount || 42} verified reviews</p>
              </div>

              {/* Rating Breakdown Bars */}
              <div className="md:col-span-2 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = star === 5 ? 85 : star === 4 ? 12 : 1; // Mock percentages
                  return (
                    <div key={star} className="flex items-center space-x-3 text-xs">
                      <span className="w-12 text-muted font-bold">{star} Stars</span>
                      <div className="flex-1 h-1.5 bg-bg border border-line rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted font-bold">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {[...myReviews, ...(course?.reviews || [])].slice(0, visibleReviews + myReviews.length).map((review: Review) => {
                const isMine = myReviews.some(r => r.id === review.id);
                return (
                <div key={review.id} className={`space-y-4 py-6 border-b border-line last:border-0 last:pb-0 ${isMine ? 'bg-cyan/[0.04] -mx-3 px-3 rounded-xl border-b-0 pb-4' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={review.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150'} alt={review.userName} className="w-10 h-10 rounded-full border border-line object-cover" />
                      <div>
                        <h4 className="font-bold text-sm text-text flex items-center gap-2">
                          {review.userName}
                          {isMine && <span className="text-[9px] bg-cyan/15 text-cyan px-1.5 py-0.5 rounded font-black tracking-wider">Your review</span>}
                        </h4>
                        <p className="text-[10px] text-muted">{new Date(review.date).toLocaleDateString()} • Student</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-cyan fill-cyan' : 'text-line'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed font-medium">"{review.comment}"</p>
                </div>
                );
              })}

              {course?.reviews && visibleReviews < course.reviews.length && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => setVisibleReviews(prev => prev + 3)}
                    className="text-xs font-bold uppercase tracking-widest text-cyan hover:text-cyan/80 transition-colors"
                  >
                    Show More Reviews
                  </button>
                </div>
              )}
              {(!course?.reviews || course?.reviews?.length === 0) && myReviews.length === 0 && (
                <p className="text-sm text-muted text-center py-4 italic">No reviews yet — be the first to share your experience!</p>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-8 space-y-6">
            <SectionHeader icon={<HelpCircle className="w-5 h-5 text-cyan" />} title="Frequently Asked Questions" />

            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div key={i} className="group border-b border-line pb-4 last:border-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full text-left"
                    >
                      <h4 className={`text-sm font-bold transition-colors mb-2 flex items-center justify-between ${isOpen ? 'text-cyan' : 'text-text group-hover:text-cyan'}`}>
                        {faq.q}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan opacity-100' : 'rotate-0 opacity-30'}`} />
                      </h4>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </div>

        {/* Right Column (Sidebar Information) */}
        <div className="lg:h-full relative">
          <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center">
            <div className="space-y-6 w-full">
          {/* Lead Trainer Card */}
          <div className="bg-panel border border-line rounded-2xl p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Lead Trainer</h3>
                <div className="flex items-center space-x-3">
                  {course?.trainer?.linkedIn && (
                    <a href={course?.trainer?.linkedIn} target="_blank" rel="noreferrer" className="text-muted hover:text-cyan transition-colors" title="LinkedIn">
                      <Users className="w-4 h-4" />
                    </a>
                  )}
                  {course?.trainer?.website && (
                    <a href={course?.trainer?.website} target="_blank" rel="noreferrer" className="text-muted hover:text-cyan transition-colors" title="Personal Site">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={course?.trainer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150'} alt={course?.trainer?.name || 'Lead Trainer'} className="w-12 h-12 rounded-full border border-line object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-text text-sm leading-snug">{course?.trainer?.name || 'Multiple Trainers'}</h4>
                  <p className="text-muted text-xs truncate">{course?.trainer?.title || 'Industry Experts'}</p>
                </div>
              </div>
              {/* Followers + Follow — social profile stats row */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted font-semibold">
                  <span className="text-text font-bold">{hashNum((course?.trainer?.name || 'trainer') + 'f', 4, 42)}.{hashNum(course?.trainer?.name || 'trainer', 0, 9)}k</span> followers
                </p>
                <button
                  onClick={() => { setFollowOn(v => !v); if (!followOn) addToast('success', `You're now following ${course?.trainer?.name || 'this trainer'}.`); }}
                  className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-lg border transition-all active:scale-95 ${
                    followOn ? 'bg-bg border-line text-muted' : 'bg-cyan border-cyan text-bg hover:bg-cyan/90'
                  }`}
                >
                  {followOn ? 'Following' : 'Follow'}
                </button>
              </div>
              <p className="text-muted text-xs leading-relaxed line-clamp-3">
                {course?.trainer?.bio || 'This course is led by industry experts with over 15 years of combined experience in the field.'}
              </p>
            </div>

            {/* More from this Trainer - Integrated List */}
            {trainerCourses.length > 0 && (
              <div className="pt-4 border-t border-line space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted">More from this expert</h4>
                <div className="space-y-2">
                  {trainerCourses.map(tc => (
                    <button
                      key={tc.id}
                      onClick={() => {
                        setActiveCourseId(tc.id);
                        onNavigate('course-detail');
                      }}
                      className="group flex items-center space-x-3 text-left w-full p-2 rounded-xl border border-line hover:border-cyan/50 hover:bg-cyan/5 transition-all pl-4"
                    >
                      <img src={tc.imageUrl} className="w-10 h-10 rounded shadow-sm object-cover shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-text group-hover:text-cyan transition-colors line-clamp-2 leading-tight">
                          {tc.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all duration-300 mr-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Pricing Info (Exclusive for non-enrolled) */}
          {!enrolled && (
            <div className="bg-panel border border-line rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <div className="p-4 space-y-3">
                {course!.priceStatus === 'paid' || !course!.priceStatus ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Total Price</h3>
                      <div className="text-right">
                        <span className="text-xl font-black text-text block">
                          {activeFormatData?.price || course!.price}
                        </span>
                        {activeBundle && (
                          <span className="text-[10px] text-cyan font-bold block mt-0.5 animate-pulse">
                            Includes {activeBundle.durationMonths}m {activeBundle.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {activeBundle && (
                      <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-cyan font-black uppercase tracking-tight">Included Value</span>
                          <span className="text-text font-black">Worth {activeBundle.valueAmount}</span>
                        </div>
                        <p className="text-[9px] text-muted leading-tight font-medium italic">
                          Your purchase includes {activeBundle.durationMonths} months of Premium platform access for AI Tutor and resource analytics, worth {activeBundle.valueAmount}, which activates upon enrollment.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-cyan">
                      <ShieldCheck className="w-6 h-6" />
                      <h3 className="font-bold text-sm uppercase tracking-wider">Access Covered</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan/5 border border-cyan/20">
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        {course!.priceStatus === 'included'
                          ? "Included in your active subscription plan."
                          : "Access fully sponsored by your employer."}
                      </p>
                    </div>
                  </div>
                )}

                {activeCohort && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted">
                      <span>Booking Status</span>
                      <span className={`${activeCohort.currentParticipants >= activeCohort.minParticipants ? 'text-green' : 'text-orange'}`}>
                        {activeCohort.currentParticipants}/{activeCohort.maxParticipants} Seats
                      </span>
                    </div>
                    <div className="h-1.5 bg-bg border border-line rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${activeCohort.currentParticipants >= activeCohort.minParticipants ? 'bg-green shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-orange shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`}
                        style={{ width: `${(activeCohort.currentParticipants / activeCohort.maxParticipants) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-muted leading-tight font-medium">
                      {activeCohort.currentParticipants < activeCohort.minParticipants
                        ? `Course starts once ${activeCohort.minParticipants} participants book. Confirmation by ${new Date(activeCohort.confirmationDate).toLocaleDateString()}.`
                        : `Course confirmed. Limited seats remaining.`}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2 text-xs text-muted">
                    <CheckCircle className="w-4 h-4 text-green" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-cyan hover:bg-cyan/90 text-bg font-black py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] uppercase tracking-widest text-[10px] cursor-pointer"
                  >
                    {isPublic ? 'Login to get the course' :
                     (course!.priceStatus !== 'paid' && course!.priceStatus) ? 'Get Started Now' :
                     (activeCohort && activeCohort.currentParticipants < activeCohort.minParticipants ? 'Reserve Your Seat' : 'Confirm Booking')}
                  </button>
                  {course!.priceStatus === 'paid' && (
                    <button className="w-full text-[9px] font-black text-cyan hover:text-cyan/80 transition-colors uppercase tracking-widest pt-1 opacity-70">
                      Team / Corporate Purchase?
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Courses */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <SectionHeader icon={<Route className="w-5 h-5 text-cyan" />} title="Similar Learning Paths" />
          <button className="text-cyan text-xs font-bold hover:underline">View All Courses</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCourses.map(rc => (
            <div
              key={rc.id}
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between group h-[380px]"
            >
              <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                <img src={rc.imageUrl} alt={rc.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="bg-bg/90 backdrop-blur border border-line text-[9px] px-2 py-0.5 rounded font-bold uppercase text-text">
                    {rc.level}
                  </span>
                  <span className="bg-cyan text-bg text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                    {rc.format}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-text group-hover:text-cyan transition-colors line-clamp-1 mb-2">
                  {rc.title}
                </h3>
                <p className="text-muted text-[11px] line-clamp-2 leading-relaxed mb-4">
                  {rc.description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                  <span className="text-text font-black text-sm">{rc.price}</span>
                  <button
                    onClick={() => {
                      setActiveTrackId(null);
                      setActiveCourseId(rc.id);
                      onNavigate('course-detail');
                    }}
                    className="text-cyan text-[10px] font-black uppercase tracking-widest hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
  );
};
