import React, { useState } from 'react';
import { COURSES, TRACKS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronUp, Star, Award, CheckCircle, Clock, Sparkles, Globe, User, BookOpen, HelpCircle, ShieldCheck, Zap, Layers, ChevronRight, Users, ArrowRight, Laptop, PlayCircle, Box } from 'lucide-react';
import { useXP } from '../../context/XPContext';
import { useTrack } from '../track-detail/useTrack';
import { calculateCourseProgress } from '../../services/progressUtils';
import type { CareerTrack, Course, Review } from '../../types';

interface CourseDetailProps {
  onNavigate: (page: string) => void;
  isPublic?: boolean;
}

const MOCK_DATES = {
  todayStr: new Date(Date.now()).toLocaleDateString(),
  nextWeekStr: new Date(Date.now() + 86400000 * 7).toLocaleDateString(),
  nextTwoWeeksStr: new Date(Date.now() + 86400000 * 14).toLocaleDateString(),
};

export const CourseDetail: React.FC<CourseDetailProps> = ({ onNavigate, isPublic }) => {
  const { activeCourseId, activeTrackId, selectedFormat, setSelectedFormat, setActiveCourseId, setActiveTrackId } = useAuth();
  const { addToast } = useXP();
  const { getTrackPercentage, completedLessonIds } = useTrack();
  const [visibleReviews, setVisibleReviews] = useState(3);
  const { todayStr, nextWeekStr, nextTwoWeeksStr } = MOCK_DATES;
  
  // Decide what to show: Track or Course
  // If we came from a track click, activeTrackId will be set.
  const track = activeTrackId ? TRACKS.find(t => t.id === activeTrackId) : null;
  const course = track ? null : (COURSES.find(c => c.id === activeCourseId) || COURSES[0]);
  
  const displayTitle = track ? track.title : course!.title;
  const displayImageUrl = track ? track.imageUrl : course!.imageUrl;
  const displayLevel = track ? track.level : course!.level;
  const displayEnrolled = track ? track.enrolled : course!.enrolled;

  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [assessmentLevel, setAssessmentLevel] = useState<number>(0);

  // Initialize global format (for courses)
  React.useEffect(() => {
    if (!track && course) {
      const isFormatAvailable = course.availableFormats?.some(f => f.format === selectedFormat) || course.format === selectedFormat;
      
      if (!selectedFormat || !isFormatAvailable) {
        if (course.availableFormats && course.availableFormats.length > 0) {
          setSelectedFormat(course.availableFormats[0].format);
        } else {
          setSelectedFormat(course.format);
        }
      }
    }
  }, [course, track, selectedFormat, setSelectedFormat]);
  
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

  return (
    <div className="relative -mx-3 md:-mx-[44px] -my-6 bg-bg border-y border-line px-3 md:px-[44px] py-6">
      <div className="space-y-8 pb-32 max-w-[1600px] mx-auto">
        {/* Course Hero Header */}
      <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/3 h-48 bg-bg rounded-xl overflow-hidden border border-line">
          <img src={displayImageUrl} alt={displayTitle} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-bg border border-line text-[10px] px-2.5 py-1 rounded font-bold uppercase text-text shadow-sm">
              {displayLevel}
            </span>
            {track ? (
              <span className="bg-cyan text-bg text-[10px] px-2.5 py-1 rounded font-bold uppercase shadow-sm">
                Career Track
              </span>
            ) : (
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
            )}
            <span className="bg-bg/40 backdrop-blur-md border border-line text-[10px] px-2.5 py-1 rounded font-bold uppercase text-muted flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan" />
              {track ? track.estimatedTime : course?.duration}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tight">{displayTitle}</h1>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            {track ? track.description : (course!.longDescription || course!.description)}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-xs text-muted font-bold">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= 4 ? 'text-cyan fill-cyan' : 'text-line'}`} />
                ))}
              </div>
              <span className="text-text">{course?.rating || 4.8}</span>
              <span className="opacity-60">({course?.ratingCount || 100} students)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-purple/10 text-purple">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-text">+{course?.xpReward || 1500} XP Reward</span>
            </div>
            {course && (
              <div className="flex items-center space-x-2">
                <img src={course?.trainer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150'} alt={course?.trainer?.name || 'Trainer'} className="w-5 h-5 rounded-full border border-line object-cover" />
                <span className="text-text">Trainer: <span className="text-cyan">{course?.trainer?.name}</span></span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-cyan" />
              <span className="text-text">{course?.language || 'English'}</span>
            </div>
            {track && (
              <div className="flex items-center space-x-2 text-cyan">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-text">{track.estimatedTime}</span>
              </div>
            )}
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
            {(track ? getTrackPercentage(track as unknown as CareerTrack) < 100 : calculateCourseProgress(course as unknown as Course, completedLessonIds) < 100) ? (
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
                    <Sparkles className="w-4 h-4 text-orange" />
                    <span className="text-[10px] text-muted font-bold uppercase">Includes Premium AI Access</span>
                  </div>
                </div>
              )
            ) : null /* No primary CTA if finished */}
          </div>
        </div>
        
        {/* Track Progress Indicator (REQ-TRACK-011) */}
        {track && (
          <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Track Progress</span>
              <span className="text-xl font-black text-cyan">{getTrackPercentage(track as unknown as CareerTrack)}%</span>
            </div>
            <div className="w-48 h-1.5 bg-bg border border-line rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan shadow-[0_0_10px_rgba(0,245,212,0.4)] transition-all duration-1000" 
                style={{ width: `${getTrackPercentage(track as unknown as CareerTrack)}%` }} 
              />
            </div>
          </div>
        )}

        {/* Completion Badge (Bottom Right) */}
        {(track ? getTrackPercentage(track as unknown as CareerTrack) === 100 : calculateCourseProgress(course as unknown as Course, completedLessonIds) === 100) && (
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text">Choose your learning experience</h2>
            <span className="text-[10px] font-bold text-cyan bg-cyan/10 px-3 py-1 rounded-full uppercase tracking-wider">Multi-Format Available</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line/50">
                  <th className="py-4 text-[10px] font-black uppercase text-muted tracking-widest w-1/3">Feature</th>
                  {course?.availableFormats?.map(f => (
                    <th key={f.format} className="py-4 px-4 text-center">
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedFormat === f.format ? 'text-cyan' : 'text-muted'}`}>
                        {f.format === 'flipped' ? 'Flipped' : f.format === 'cohort' ? 'Cohort' : 'Self-Paced'}
                      </div>
                      <div className="text-sm font-bold text-text">{f.price}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                    <tr className="border-b border-line/30">
                      <td className="py-4 pr-4">
                        <div className="text-xs font-bold text-text">AI Tutor Allowance</div>
                        <div className="text-[10px] text-muted">24/7 personalized support</div>
                      </td>
                      {course?.availableFormats?.map(f => (
                        <td key={f.format} className="py-4 px-4 text-center">
                          {f.features.aiTutor ? <CheckCircle className="w-4 h-4 text-green mx-auto" /> : <span className="text-muted opacity-20">—</span>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line/30">
                      <td className="py-4 pr-4">
                        <div className="text-xs font-bold text-text">Peer Cohort Access</div>
                        <div className="text-[10px] text-muted">Learn with a community</div>
                      </td>
                      {course?.availableFormats?.map(f => (
                        <td key={f.format} className="py-4 px-4 text-center">
                          {f.features.peerCohort ? <CheckCircle className="w-4 h-4 text-green mx-auto" /> : <span className="text-muted opacity-20">—</span>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line/30">
                      <td className="py-4 pr-4">
                        <div className="text-xs font-bold text-text">In-Person Component</div>
                        <div className="text-[10px] text-muted">Expert-led workshops</div>
                      </td>
                      {course?.availableFormats?.map(f => (
                        <td key={f.format} className="py-4 px-4 text-center">
                          {f.features.inPerson ? <CheckCircle className="w-4 h-4 text-green mx-auto" /> : <span className="text-muted opacity-20">—</span>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-line/30">
                      <td className="py-4 pr-4">
                        <div className="text-xs font-bold text-text">Certificate Eligibility</div>
                        <div className="text-[10px] text-muted">Verified skill credentials</div>
                      </td>
                      {course?.availableFormats?.map(f => (
                        <td key={f.format} className="py-4 px-4 text-center">
                          {f.features.certificate ? <CheckCircle className="w-4 h-4 text-green mx-auto" /> : <span className="text-muted opacity-20">—</span>}
                        </td>
                      ))}
                    </tr>
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
                          <button
                            onClick={() => {
                              setSelectedFormat(f.format);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              selectedFormat === f.format 
                                ? 'bg-cyan text-bg shadow-[0_4px_15px_rgba(45,212,191,0.3)]' 
                                : 'bg-bg border border-line text-text hover:border-cyan/50'
                            }`}
                          >
                            {selectedFormat === f.format ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
      )}

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Format & Delivery Section */}
          <div className="py-6 border-b border-line space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-panel border border-line">
                <Box className="w-4 h-4 text-cyan" />
              </div>
              <h2 className="text-xl font-bold text-text">Format & Delivery</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DESCRIPTION BLOCK (Left Column, spans 2 rows) */}
              {(selectedFormat === 'flipped' || course?.format === 'flipped') ? (
                <div className="p-5 rounded-2xl bg-panel border border-line shadow-sm space-y-4 md:row-span-2 h-full flex flex-col justify-center">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-bg border border-line">
                      <Globe className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">In-Person Sessions</span>
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        Location: apigenio Training Centre, Muri/Bern.<br/>
                        Dates: {todayStr} & {nextWeekStr}<br/>
                        Bring: Laptop and valid ID.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 pt-4 border-t border-line/50">
                    <div className="p-2 rounded-xl bg-bg border border-line">
                      <BookOpen className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">Self-Study Windows</span>
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        Complete units 1–3 before session 1. Complete units 4–7 before final capstone.
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedFormat === 'cohort' ? (
                <div className="p-5 rounded-2xl bg-panel border border-line shadow-sm space-y-4 md:row-span-2 h-full flex flex-col justify-center">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-bg border border-line">
                      <Clock className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">Schedule & Start Date</span>
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        Next cohort starts: {nextTwoWeeksStr}<br/>
                        Live sessions: Tuesdays at 18:00 CET.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 pt-4 border-t border-line/50">
                    <div className="p-2 rounded-xl bg-bg border border-line">
                      <Award className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">Past Outcomes</span>
                      <ul className="text-xs text-muted leading-relaxed font-medium list-disc pl-3">
                        <li>85% promotion rate within 6 months</li>
                        <li>Average salary increase of +18%</li>
                        <li>High satisfaction from 100+ graduates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-panel border border-line shadow-sm space-y-4 md:row-span-2 h-full flex flex-col justify-center">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-bg border border-line">
                      <Sparkles className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">Self-Paced Learning</span>
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        Learn entirely at your own pace with unrestricted access to all materials and AI Tutor available 24/7.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 pt-4 border-t border-line/50">
                    <div className="p-2 rounded-xl bg-bg border border-line">
                      <BookOpen className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">Interactive Content</span>
                      <p className="text-xs text-muted leading-relaxed font-medium">
                        Engage with interactive coding environments, quizzes, and projects to solidify your knowledge.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Commitment (Right Top) */}
              <div className="p-5 rounded-2xl bg-panel border border-line shadow-sm h-full flex flex-col justify-center">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-xl bg-bg border border-line shrink-0">
                    <Clock className="w-4 h-4 text-cyan" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1.5">Time Commitment</span>
                    <p className="text-xs text-muted leading-relaxed font-medium">
                      {track ? `Estimated path duration: ${track.estimatedTime}.` : 
                       selectedFormat === 'flipped' ? "7 self-study modules (10.5h) + 2 half-day workshops." :
                       selectedFormat === 'cohort' ? "8-week structured journey with weekly live expert sessions." :
                       course?.format === 'Multiple formats' ? "Flexible delivery. Select between Self-Paced, Cohort, or Flipped models below." :
                       `Complete at your own pace. Recommended: 8-10h/week over ${course?.duration}.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate (Right Bottom) */}
              <div className="p-5 rounded-2xl bg-panel border border-line shadow-sm flex items-start sm:items-center justify-between h-full flex-col sm:flex-row">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-xl bg-bg border border-line shrink-0">
                    <ShieldCheck className="w-4 h-4 text-cyan" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text uppercase tracking-widest block mb-1">Verifiable Certificate Included</span>
                    <span className="text-xs text-muted font-medium">Industry recognized credential upon completion</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 pr-2 mt-4 sm:mt-0">
                  <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Preparation & Onboarding Surface (REQ-CHECKOUT-020 & 021) - Flipped only */}
          {selectedFormat === 'flipped' && ( (activeFormatData?.preCourseRequirements || course?.preCourseRequirements) || (activeFormatData?.preCourseTasks || course?.preCourseTasks) ) && (() => {
            const requirements = activeFormatData?.preCourseRequirements || course?.preCourseRequirements;
            const tasks = activeFormatData?.preCourseTasks || course?.preCourseTasks;
            
            return (
              <div className="py-6 border-b border-line space-y-4">
                <div className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${enrolled ? 'bg-cyan/5 border-cyan/30' : 'bg-panel border-line'}`}>
                  <h3 className="text-xs font-black uppercase text-text tracking-wider flex items-center gap-2">
                    {enrolled ? <Sparkles className="w-4 h-4 text-cyan" /> : <Laptop className="w-4 h-4 text-cyan" />}
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
          {((course && course.preCourseRequirements) || (track && track.level === 'Advanced')) && (
            <div className="py-8 border-b border-line space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan/10">
                  <Zap className="w-5 h-5 text-cyan" />
                </div>
                <h2 className="text-xl font-bold text-text">Preparation & Readiness</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-4">
                  {(course?.preCourseRequirements?.hardware || track) && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-muted tracking-widest pl-1 border-l-2 border-cyan/30 ml-1">Included Hardware</span>
                      <ul className="space-y-2">
                        {(course?.preCourseRequirements?.hardware || ['High-performance laptop', 'Reliable internet connection']).map((item, id) => (
                          <li key={id} className="flex items-start space-x-3 text-xs text-text font-medium bg-bg/40 p-3 rounded-xl border border-line/30">
                            <CheckCircle className="w-4 h-4 text-green mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(course?.preCourseRequirements?.software || track) && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-muted tracking-widest pl-1 border-l-2 border-cyan/30 ml-1">Software Stack</span>
                      <ul className="space-y-2">
                        {(course?.preCourseRequirements?.software || ['Local Development Environment', 'Docker Desktop', 'Git Vendor Account']).map((item, id) => (
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
                  {(course?.preCourseRequirements?.knowledge || track) && (
                    <div className="bg-bg/60 border border-line rounded-2xl p-5 space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-orange" />
                        <span className="text-[10px] font-black uppercase text-text tracking-widest">Entry Knowledge Check</span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed font-medium">
                        To ensure the best learning experience, we recommend having familiarized yourself with:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(course?.preCourseRequirements?.knowledge || ['Programming Fundamentals', 'Basic CLI usage', 'Logical Reasoning']).map((item, id) => (
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
                      "Career tracks rely on prepared learners. Please ensure all base prerequisites are met before starting the first course."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          
          {/* Learning Outcomes */}
          {(course?.learningOutcomes || track?.outcomeStatement) && (
            <div className="py-6 border-b border-line space-y-4">
              <h2 className="text-xl font-bold text-text">{track ? 'Outcome Statement' : 'What you will learn in this course'}</h2>
              {track ? (
                <p className="text-sm text-text leading-relaxed">{track.outcomeStatement}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course?.learningOutcomes?.map((outcome, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm text-text leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-green shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Curriculum Preview / Career Track Path */}
          <div className="py-8 border-b border-line space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-text">{track ? 'Path & Milestones' : 'Curriculum & Modules'}</h2>
                <p className="text-muted text-xs font-medium mt-1">
                  {track 
                    ? `Sequential path through ${track.coursesCount} specialised courses.` 
                    : `Foundations of ${course?.topic} build block by block.`}
                </p>
              </div>
              {!track && course?.modules && course.modules.length > 0 && (
                <button
                  onClick={() => onNavigate('content-player')}
                  className="flex items-center space-x-2 bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Preview 1st Lesson</span>
                </button>
              )}
            </div>

            {/* Self-Assessment Tabs (REQ-TRACK-001) */}
            {track?.selfAssessmentOptions && (
              <div className="flex items-center gap-1 p-1 bg-bg border border-line rounded-xl w-fit">
                {track.selfAssessmentOptions.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => setAssessmentLevel(i)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      assessmentLevel === i 
                        ? 'bg-cyan text-bg shadow-lg shadow-cyan/20' 
                        : 'text-muted hover:text-text hover:bg-panel'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            
            <div className="space-y-4">
              {track ? (
                // Track Path Design (Vertical Flow with branching courses)
                <div className="relative pt-4 pb-8">
                  {/* Central Spine Connector */}
                  <div className="absolute left-[31px] top-0 bottom-0 w-[2px] bg-line/30 hidden md:block" />
                  
                  <div className="space-y-12">
                    {track.milestones.map((milestone, idx) => {
                      const status = milestone.status;
                      const isCompleted = status === 'completed';
                      const isActive = status === 'active';
                      const isEven = idx % 2 === 0;
                      
                      return (
                        <div key={milestone.id} className="relative">
                          {/* Milestone Node Dot */}
                          <div className={`absolute left-[24px] top-4 w-4 h-4 rounded-full border-2 bg-bg z-20 transition-all duration-500 hidden md:block ${isCompleted ? 'border-green bg-green shadow-[0_0_10px_rgba(34,197,94,0.3)]' : isActive ? 'border-cyan bg-cyan ring-4 ring-cyan/20 animate-pulse' : 'border-line'}`} />
                          
                          <div className="flex flex-col space-y-4">
                            {/* Milestone Title Header */}
                            <div className="md:pl-16 space-y-1">
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-cyan' : isCompleted ? 'text-green' : 'text-muted'}`}>
                                MILESTONE {idx + 1} {isCompleted ? '• COMPLETED' : isActive ? '• CURRENT FOCUS' : ''}
                              </span>
                              <h3 className="text-lg font-black text-text">{milestone.title}</h3>
                              <p className="text-xs text-muted leading-relaxed max-w-xl">{milestone.description}</p>
                            </div>

                            {/* Course Cards Branching Off (Alternating L/R on desktop) */}
                            <div className={`flex flex-wrap gap-4 md:pl-16 ${isEven ? 'md:justify-start' : 'md:justify-start'}`}>
                              {milestone.courses.length > 0 ? milestone.courses.map((mCourseEntry) => {
                                const mCourse = COURSES.find(c => c.id === mCourseEntry.id);
                                if (!mCourse) return null;
                                
                                return (
                                  <div key={mCourse.id} className="relative group">
                                    {/* Optional Ribbon (REQ-TRACK-001) */}
                                    {mCourseEntry.isOptional && (
                                      <div className="absolute -top-2 -right-2 z-30 bg-purple text-bg text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter transform rotate-3">
                                        Optional
                                      </div>
                                    )}

                                    <div className={`w-full md:w-[320px] bg-panel border rounded-2xl overflow-hidden transition-all duration-300 p-4 space-y-4 hover:border-cyan/50 hover:shadow-xl hover:shadow-cyan/5 ${isActive ? 'border-cyan/20 bg-bg/40' : 'border-line opacity-80'}`}>
                                      <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg border border-line shrink-0">
                                          <img src={mCourse.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                          <h4 className="text-sm font-bold text-text line-clamp-1 group-hover:text-cyan transition-colors">{mCourse.title}</h4>
                                          <div className="flex items-center gap-2 text-[10px] text-muted font-bold">
                                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mCourse.duration}</div>
                                            <div className="w-1 h-1 bg-line rounded-full" />
                                            <div className="truncate">{mCourse.trainer.name}</div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => onNavigate('content-player')}
                                          className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-[10px] font-black p-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase"
                                        >
                                          <Zap className="w-3 h-3 fill-current" />
                                          Start
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setActiveTrackId(null);
                                            setActiveCourseId(mCourse.id);
                                            onNavigate('course-detail');
                                          }}
                                          className="flex-1 bg-bg border border-line hover:border-cyan/30 text-text text-[10px] font-black p-2 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase"
                                        >
                                          <Layers className="w-3 h-3" />
                                          Details
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }) : (
                                <div className="text-[10px] text-muted italic p-4 border border-dashed border-line rounded-xl w-full">
                                  Checkpoint milestone: Complete previous courses to unlock next steps.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Course Modules Design
                course?.modules && course?.modules?.map((mod, idx) => {
                  const isOpen = activeModuleIndex === idx;
                  const bgClass = isOpen ? 'bg-cyan/5 border-cyan/30 shadow-sm' : 'bg-panel/60 border-line shadow-sm hover:border-cyan/30 hover:bg-panel/90';
                  return (
                    <div key={mod.id} className={`border ${bgClass} rounded-2xl transition-all overflow-hidden`}>
                      <button 
                        onClick={() => toggleModule(idx)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex space-x-4">
                          <div className="hidden sm:flex flex-col items-center justify-center w-10 h-10 bg-panel border border-line rounded-xl text-cyan font-black text-xs">
                            {mod.number}
                          </div>
                          <div>
                            <span className="text-[9px] text-cyan font-black uppercase tracking-widest block opacity-70">
                              {mod.type} • {mod.duration}
                            </span>
                            <span className="font-bold text-sm md:text-base text-text mt-1 block">
                              {mod.title}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-muted">
                          <span className="text-[10px] font-bold uppercase opacity-60 hidden sm:inline">
                            {mod.lessons.length} Lessons
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-0 space-y-3">
                          <p className="text-xs text-muted mb-4 leading-relaxed border-l-2 border-line pl-4">
                            {mod.description}
                          </p>
                          <div className="space-y-2">
                            {mod.lessons.map(les => (
                              <div key={les.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-bg border border-line/40 shadow-sm group hover:border-cyan/30 hover:shadow-md transition-all">
                                <div className="flex items-center space-x-3">
                                  <div className="p-1.5 rounded-lg bg-panel border border-line group-hover:border-cyan/20">
                                    <Zap className="w-3 h-3 text-cyan/50 group-hover:text-cyan" />
                                  </div>
                                  <span className="font-bold text-[11px] text-text opacity-90 group-hover:opacity-100 transition-opacity">{les.title}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-[9px] font-black uppercase text-muted tracking-wider opacity-60">
                                    {les.type}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted w-10 text-right">{les.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>


          {/* Reviews and Testimonials Section (Moved Up) */}
          <div className="py-8 border-b border-line space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-orange/10">
                  <Star className="w-5 h-5 text-orange fill-orange" />
                </div>
                <h2 className="text-xl font-bold text-text tracking-tight">Reviews & Testimonials</h2>
              </div>
            </div>

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
              {(course?.reviews || []).slice(0, visibleReviews).map((review: Review) => (
                <div key={review.id} className="space-y-4 pb-6 border-b border-line last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={review.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150'} alt={review.userName} className="w-10 h-10 rounded-full border border-line object-cover" />
                      <div>
                        <h4 className="font-bold text-sm text-text">{review.userName}</h4>
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
              ))}
              
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
              {(!course?.reviews || course?.reviews?.length === 0) && (
                <p className="text-sm text-muted text-center py-4 italic">No reviews available yet for this {track ? 'track' : 'course'}.</p>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-8 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan/10">
                <HelpCircle className="w-5 h-5 text-cyan" />
              </div>
              <h2 className="text-xl font-bold text-text tracking-tight">Frequently Asked Questions</h2>
            </div>
            
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
              <div className="flex items-center space-x-3">
                <img src={course?.trainer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150'} alt={course?.trainer?.name || 'Lead Trainer'} className="w-12 h-12 rounded-full border border-line object-cover" />
                <div>
                  <h4 className="font-bold text-text text-sm">{course?.trainer?.name || 'Multiple Trainers'}</h4>
                  <p className="text-muted text-xs">{course?.trainer?.title || 'Industry Experts'}</p>
                </div>
              </div>
              <p className="text-muted text-xs leading-relaxed line-clamp-3">
                {course?.trainer?.bio || 'This career track is curated and led by multiple industry experts with over 15 years of common experience in the field.'}
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
                          {track ? (track.level === 'Advanced' ? 'CHF 2\'500.00' : 'CHF 1\'800.00') : (activeFormatData?.price || course!.price)}
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
          <h2 className="text-2xl font-black text-text tracking-tight uppercase">Similar Learning Paths</h2>
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
