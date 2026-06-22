import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { COURSES } from '../../services/mockData';
import {
  Camera, Edit3, Save, X, Eye, EyeOff, Globe, Users, Lock,
  BookOpen, CheckCircle, Clock, Award, Flame, Zap, ChevronDown
} from 'lucide-react';

type ProfileVisibility = 'public' | 'cohort' | 'private';

interface PublicProfileProps {
  onNavigate: (page: string) => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { addToast, level, xp } = useXP();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // Track which courses are hidden
  const enrolledCourses = COURSES.filter(c => c.enrolled);
  const [hiddenCourseIds, setHiddenCourseIds] = useState<Set<string>>(new Set());

  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  const notStartedCourses = enrolledCourses.filter(c => c.progress === 0);

  const toggleCourseVisibility = (courseId: string) => {
    setHiddenCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const nameRef = useRef<HTMLHeadingElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);

  const handleSave = () => {
    const newName = nameRef.current?.textContent?.trim() || user?.name || '';
    const newBio = bioRef.current?.textContent?.trim() || user?.bio || '';
    updateProfile(newName, newBio, avatarPreview || undefined);
    setIsEditing(false);
    setAvatarPreview(null);
    addToast('success', 'Profile updated successfully! +10 XP');
  };

  const handleCancel = () => {
    if (nameRef.current) nameRef.current.textContent = user?.name || '';
    if (bioRef.current) bioRef.current.textContent = user?.bio || '';
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const visibilityConfig = {
    public: { label: 'Public', icon: Globe, desc: 'Visible to everyone' },
    cohort: { label: 'Cohort Only', icon: Users, desc: 'Visible to your classmates' },
    private: { label: 'Private', icon: Lock, desc: 'Only visible to you' },
  };

  const currentVis = visibilityConfig[visibility];
  const VisIcon = currentVis.icon;

  const displayAvatar = avatarPreview || user?.avatar;
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Public Profile</h1>
        <p className="text-muted text-sm mt-1">Manage how others see you on the platform.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-panel border border-line rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-br from-cyan/30 via-purple/20 to-cyan/10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,210,211,0.15),transparent_70%)]" />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6 -mt-14 sm:-mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-panel bg-panel overflow-hidden shadow-lg">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-cyan/20 flex items-center justify-center text-cyan text-3xl font-black">
                    {initials}
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-bg/60 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={24} className="text-text" />
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <h2
                ref={nameRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-xl sm:text-2xl font-black text-text outline-none ${isEditing ? 'border-b-2 border-cyan/60 cursor-text' : ''}`}
              >
                {user?.name}
              </h2>
              <p
                ref={bioRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-sm text-muted mt-1 max-w-md leading-relaxed outline-none ${isEditing ? 'border-b border-cyan/30 cursor-text' : ''}`}
              >
                {user?.bio || 'No bio yet.'}
              </p>
            </div>

            {/* Edit / Save Buttons */}
            <div className="shrink-0 flex items-center space-x-2 sm:self-start sm:pt-16">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1.5 bg-bg border border-line text-muted hover:text-text px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1.5 bg-cyan hover:bg-cyan2 text-bg px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>Save</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 bg-bg border border-line hover:border-cyan text-muted hover:text-cyan px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-bg border border-line rounded-xl px-3.5 py-2">
              <Award size={16} className="text-cyan" />
              <span className="text-xs font-bold text-text">Level {level}</span>
            </div>
            <div className="flex items-center space-x-2 bg-bg border border-line rounded-xl px-3.5 py-2">
              <Zap size={16} className="text-yellow" />
              <span className="text-xs font-bold text-text">{xp.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center space-x-2 bg-bg border border-line rounded-xl px-3.5 py-2">
              <Flame size={16} className="text-orange" />
              <span className="text-xs font-bold text-text">{user?.streak || 0} Day Streak</span>
            </div>
            <div className="flex items-center space-x-2 bg-bg border border-line rounded-xl px-3.5 py-2">
              <BookOpen size={16} className="text-purple" />
              <span className="text-xs font-bold text-text">{enrolledCourses.length} Courses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Visibility Toggle */}
      <div className="bg-panel border border-line rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-text text-sm">Profile Visibility</h3>
            <p className="text-xs text-muted mt-0.5">Control who can see your profile information.</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center space-x-2 bg-bg border border-line hover:border-cyan rounded-xl px-4 py-2.5 text-xs font-semibold text-text transition-colors"
            >
              <VisIcon size={14} className="text-cyan" />
              <span>{currentVis.label}</span>
              <ChevronDown size={14} className="text-muted" />
            </button>
            {showVisibilityMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-panel border border-line rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50">
                {(Object.keys(visibilityConfig) as ProfileVisibility[]).map(key => {
                  const cfg = visibilityConfig[key];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => { setVisibility(key); setShowVisibilityMenu(false); }}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 text-xs transition-colors ${
                        visibility === key ? 'bg-cyan/10 text-cyan' : 'text-muted hover:bg-line hover:text-text'
                      }`}
                    >
                      <Icon size={16} />
                      <div>
                        <div className="font-bold">{cfg.label}</div>
                        <div className="text-[10px] text-muted mt-0.5">{cfg.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visible Courses */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="font-bold text-text text-sm">Visible Courses</h3>
          <p className="text-xs text-muted mt-0.5">Toggle which courses are shown on your public profile.</p>
        </div>

        {/* Completed */}
        {completedCourses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle size={14} className="text-green" />
              <span className="text-[10px] font-bold text-green uppercase tracking-wider">Completed</span>
            </div>
            <div className="space-y-2">
              {completedCourses.map(course => (
                <CourseVisibilityRow
                  key={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl}
                  progress={course.progress}
                  isHidden={hiddenCourseIds.has(course.id)}
                  onToggle={() => toggleCourseVisibility(course.id)}
                  onNavigate={() => { onNavigate(`course-detail`); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgressCourses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-cyan" />
              <span className="text-[10px] font-bold text-cyan uppercase tracking-wider">In Progress</span>
            </div>
            <div className="space-y-2">
              {inProgressCourses.map(course => (
                <CourseVisibilityRow
                  key={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl}
                  progress={course.progress}
                  isHidden={hiddenCourseIds.has(course.id)}
                  onToggle={() => toggleCourseVisibility(course.id)}
                  onNavigate={() => { onNavigate(`course-detail`); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Not Started */}
        {notStartedCourses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BookOpen size={14} className="text-muted" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Not Started</span>
            </div>
            <div className="space-y-2">
              {notStartedCourses.map(course => (
                <CourseVisibilityRow
                  key={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl}
                  progress={course.progress}
                  isHidden={hiddenCourseIds.has(course.id)}
                  onToggle={() => toggleCourseVisibility(course.id)}
                  onNavigate={() => { onNavigate(`course-detail`); }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Course Visibility Row ──────────────────────────────── */
interface CourseVisibilityRowProps {
  title: string;
  imageUrl: string;
  progress: number;
  isHidden: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

const CourseVisibilityRow: React.FC<CourseVisibilityRowProps> = ({
  title, imageUrl, progress, isHidden, onToggle, onNavigate
}) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
    isHidden ? 'bg-bg/50 border-line/50 opacity-60' : 'bg-bg border-line'
  }`}>
    <img
      src={imageUrl}
      alt={title}
      className="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer"
      onClick={onNavigate}
    />
    <div className="flex-1 min-w-0">
      <h4
        className="text-xs font-bold text-text truncate cursor-pointer hover:text-cyan transition-colors"
        onClick={onNavigate}
      >
        {title}
      </h4>
      <div className="flex items-center space-x-2 mt-1">
        <div className="w-20 h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-muted font-semibold">{progress}%</span>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors ${
        isHidden
          ? 'text-muted hover:text-text hover:bg-line'
          : 'text-cyan hover:bg-cyan/10'
      }`}
      title={isHidden ? 'Show on profile' : 'Hide from profile'}
    >
      {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);
