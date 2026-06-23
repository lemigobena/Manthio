import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useXP } from '../../context/XPContext';
import type { NotificationCategory, AppNotification } from '../../types';
import {
  Bell, BookOpen, MessageSquare, AlertCircle, Award, Target,
  Trash2, ChevronRight, Zap, Shield, ShoppingBag, CheckCheck, ArrowLeft
} from 'lucide-react';

interface NotificationTestPageProps {
  onNavigate: (page: string) => void;
}

// ─── individual notification presets ────────────────────────────────────────
const PRESETS: {
  label: string;
  color: string;
  icon: React.ReactNode;
  payload: Omit<AppNotification, 'id' | 'time' | 'read'>;
}[] = [
  {
    label: 'New Module Unlocked',
    color: 'cyan',
    icon: <BookOpen className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '🎉 New Module Unlocked',
      message: 'Module 5: Advanced React Patterns is now available for you.',
      critical: false,
      link: 'learning-path'
    }
  },
  {
    label: 'Assignment Due',
    color: 'yellow',
    icon: <BookOpen className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '⚠️ Assignment Due Tomorrow',
      message: 'Your Python capstone project submission closes in 24 hours.',
      critical: true,
      link: 'learning-path'
    }
  },
  {
    label: 'Live Session Reminder',
    color: 'red',
    icon: <Zap className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '🔴 Live session starts in 15 min!',
      message: 'Module 3 Q&A with the instructor is starting soon — join now.',
      critical: true,
      link: 'live-session'
    }
  },
  {
    label: 'Certificate Ready',
    color: 'green',
    icon: <Award className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '🎓 Certificate Ready',
      message: 'You completed React Fundamentals! Download your certificate now.',
      critical: false,
      link: 'profile'
    }
  },
  {
    label: 'Forum Reply',
    color: 'purple',
    icon: <MessageSquare className="w-5 h-5" />,
    payload: {
      category: 'social',
      title: 'New reply to your thread',
      message: 'Maria replied to "How does useCallback differ from useMemo?"',
      critical: false,
      link: 'community'
    }
  },
  {
    label: 'Answer Marked Best',
    color: 'purple',
    icon: <CheckCheck className="w-5 h-5" />,
    payload: {
      category: 'social',
      title: '⭐ Your answer was marked best!',
      message: 'Your answer in "Python list comprehension pitfalls" was accepted.',
      critical: false,
      link: 'community'
    }
  },
  {
    label: 'Subscription Renewing',
    color: 'yellow',
    icon: <Shield className="w-5 h-5" />,
    payload: {
      category: 'system',
      title: 'Subscription renewing soon',
      message: 'Your Premium plan renews on July 1st. No action needed.',
      critical: false,
      link: 'settings:billing'
    }
  },
  {
    label: 'New Device Login',
    color: 'red',
    icon: <AlertCircle className="w-5 h-5" />,
    payload: {
      category: 'system',
      title: '🔐 Login from new device',
      message: 'Someone signed in from Chrome on Linux. Was this you?',
      critical: true,
      link: 'settings:account'
    }
  },
  {
    label: 'Streak in Danger',
    color: 'orange',
    icon: <Zap className="w-5 h-5" />,
    payload: {
      category: 'gamification',
      title: '🔥 Streak in danger!',
      message: 'Complete one lesson today to protect your 12-day streak.',
      critical: true,
      link: 'dashboard'
    }
  },
  {
    label: 'Badge Earned',
    color: 'green',
    icon: <Award className="w-5 h-5" />,
    payload: {
      category: 'gamification',
      title: '🏆 New badge unlocked: Fast Learner',
      message: 'You completed 5 lessons in a single day. Incredible focus!',
      critical: false,
      link: 'analytics'
    }
  },
  {
    label: 'New Courses Available',
    color: 'muted',
    icon: <Target className="w-5 h-5" />,
    payload: {
      category: 'marketing',
      title: 'New courses just added',
      message: 'Check out 3 new courses we added this week that match your interests.',
      critical: false,
      link: 'browse-courses'
    }
  },
  {
    label: 'Special Offer',
    color: 'orange',
    icon: <ShoppingBag className="w-5 h-5" />,
    payload: {
      category: 'marketing',
      title: '🎁 50% off – this weekend only!',
      message: 'Upgrade to the yearly plan and save €120 before Sunday midnight.',
      critical: false,
      link: 'settings:billing'
    }
  },
  // ── Additional types ──────────────────────────────────────────────────────
  {
    label: 'Mention in Forum',
    color: 'purple',
    icon: <MessageSquare className="w-5 h-5" />,
    payload: {
      category: 'social',
      title: '@you were mentioned',
      message: 'Jordan mentioned you in "Best practices for async/await in Python".',
      critical: false,
      link: 'community'
    }
  },
  {
    label: 'XP Milestone Reached',
    color: 'yellow',
    icon: <Zap className="w-5 h-5" />,
    payload: {
      category: 'gamification',
      title: '⚡ XP Milestone: 1,000 XP!',
      message: 'You crossed the 1,000 XP threshold. Keep going — next milestone at 2,500 XP.',
      critical: false,
      link: 'analytics'
    }
  },
  {
    label: 'Level Up',
    color: 'green',
    icon: <Award className="w-5 h-5" />,
    payload: {
      category: 'gamification',
      title: '🆙 You reached Level 5!',
      message: 'Congratulations! Your dedication has leveled you up to Level 5: Code Apprentice.',
      critical: false,
      link: 'analytics'
    }
  },
  {
    label: 'Password Changed',
    color: 'red',
    icon: <Shield className="w-5 h-5" />,
    payload: {
      category: 'system',
      title: '🔑 Password changed',
      message: 'Your account password was changed successfully. If this was not you, contact support immediately.',
      critical: true,
      link: 'settings:account'
    }
  },
  {
    label: 'Quiz Results Ready',
    color: 'cyan',
    icon: <CheckCheck className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '📊 Quiz graded: 90%',
      message: 'Your Module 3 quiz has been graded. You scored 90% — excellent work!',
      critical: false,
      link: 'learning-path'
    }
  },
  {
    label: 'Leaderboard Rank Change',
    color: 'orange',
    icon: <Award className="w-5 h-5" />,
    payload: {
      category: 'gamification',
      title: '📈 You moved up to #3 on the leaderboard!',
      message: 'Your recent activity pushed you from #5 to #3. Keep up the pace!',
      critical: false,
      link: 'analytics'
    }
  },
  {
    label: 'Peer Joined Your Course',
    color: 'purple',
    icon: <MessageSquare className="w-5 h-5" />,
    payload: {
      category: 'social',
      title: '👋 A friend joined your course',
      message: 'Sam just enrolled in Python Bootcamp. You can study together now!',
      critical: false,
      link: 'community'
    }
  },
  {
    label: 'Course Recommendation',
    color: 'muted',
    icon: <BookOpen className="w-5 h-5" />,
    payload: {
      category: 'marketing',
      title: '💡 Recommended for you',
      message: 'Based on your progress, "Advanced Django REST APIs" is a great next step.',
      critical: false,
      link: 'browse-courses'
    }
  },
  {
    label: 'Upcoming Live Event',
    color: 'yellow',
    icon: <Zap className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '📅 Live workshop tomorrow',
      message: 'Don\'t forget: "Advanced Python Patterns" live session is tomorrow at 18:00 UTC.',
      critical: false,
      link: 'live-session'
    }
  },
  {
    label: 'Assignment Graded',
    color: 'green',
    icon: <CheckCheck className="w-5 h-5" />,
    payload: {
      category: 'course',
      title: '✅ Assignment graded: A',
      message: 'Your capstone project submission received an A grade. View the instructor feedback.',
      critical: false,
      link: 'learning-path'
    }
  }
];

const CATEGORY_GROUPS: { key: NotificationCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'course', label: 'Course', icon: <BookOpen className="w-4 h-4" />, color: 'text-cyan' },
  { key: 'social', label: 'Social', icon: <MessageSquare className="w-4 h-4" />, color: 'text-purple' },
  { key: 'system', label: 'System', icon: <AlertCircle className="w-4 h-4" />, color: 'text-yellow' },
  { key: 'gamification', label: 'Gamification', icon: <Award className="w-4 h-4" />, color: 'text-green' },
  { key: 'marketing', label: 'Marketing', icon: <Target className="w-4 h-4" />, color: 'text-orange' }
];

export const NotificationTestPage: React.FC<NotificationTestPageProps> = ({ onNavigate }) => {
  const { addNotification, dismissAll, markAllAsRead, notifications, unreadCount } = useNotifications();
  const { addToast } = useXP();
  const [fired, setFired] = useState<string[]>([]);

  const fire = (preset: typeof PRESETS[number]) => {
    addNotification(preset.payload);
    setFired(prev => [preset.label, ...prev.slice(0, 4)]);
  };

  const fireAll = () => {
    PRESETS.forEach((p, i) => {
      setTimeout(() => {
        addNotification(p.payload);
      }, i * 120);
    });
    setFired(['All fired!']);
  };

  const colorClass: Record<string, string> = {
    cyan: 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20',
    purple: 'bg-purple/10 border-purple/30 text-purple hover:bg-purple/20',
    yellow: 'bg-yellow/10 border-yellow/30 text-yellow hover:bg-yellow/20',
    green: 'bg-green/10 border-green/30 text-green hover:bg-green/20',
    red: 'bg-red/10 border-red/30 text-red hover:bg-red/20',
    orange: 'bg-orange/10 border-orange/30 text-orange hover:bg-orange/20',
    muted: 'bg-bg border-line text-muted hover:bg-panel'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-1 p-2 rounded-xl border border-line bg-bg hover:border-cyan text-muted hover:text-cyan transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-6 h-6 text-cyan" />
            <h1 className="text-2xl font-black text-text">Notification Test Lab</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded-full">Developer</span>
          </div>
          <p className="text-sm text-muted">
            Fire any notification type in real-time and see it appear in the bell icon and the Notifications page.
          </p>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="flex flex-wrap gap-3 p-4 bg-panel border border-line rounded-2xl items-center">
        <div className="flex gap-6 flex-1">
          <div className="text-center">
            <div className="text-2xl font-black text-text">{notifications.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-cyan">{unreadCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Unread</div>
          </div>
          {CATEGORY_GROUPS.map(g => (
            <div key={g.key} className="text-center hidden sm:block">
              <div className={`text-2xl font-black ${g.color}`}>
                {notifications.filter(n => n.category === g.key).length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted font-bold">{g.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onNavigate('notifications')}
            className="px-3 py-2 bg-cyan/10 text-cyan text-xs font-bold border border-cyan/30 rounded-xl hover:bg-cyan/20 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" /> View Page
          </button>
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 bg-bg text-muted text-xs font-bold border border-line rounded-xl hover:border-cyan hover:text-cyan transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Read All
          </button>
          <button
            onClick={dismissAll}
            className="px-3 py-2 bg-red/10 text-red text-xs font-bold border border-red/30 rounded-xl hover:bg-red/20 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Last Fired Log */}
      {fired.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted px-1">
          <span className="font-bold text-cyan">Recently fired →</span>
          {fired.map((f, i) => (
            <span key={i} className="px-2 py-0.5 bg-bg border border-line rounded-full">{f}</span>
          ))}
        </div>
      )}

      {/* Fire All + Bulk Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={fireAll}
          className="flex items-center justify-between gap-3 p-5 bg-gradient-to-br from-cyan/15 to-purple/10 border border-cyan/30 rounded-2xl hover:border-cyan/60 transition-all group cursor-pointer"
        >
          <div className="text-left">
            <div className="font-black text-text text-base">🚀 Fire ALL Notifications</div>
            <div className="text-xs text-muted mt-0.5">Sends all {PRESETS.length} preset types at once (staggered 120ms each)</div>
          </div>
          <ChevronRight className="w-5 h-5 text-cyan group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
        <button
          onClick={() => {
            addNotification({
              category: 'system',
              title: '🔴 Critical Override Test',
              message: 'This critical notification bypasses Do Not Disturb. It cannot be ignored.',
              critical: true,
            });
            setFired(prev => ['Critical Override', ...prev.slice(0, 4)]);
          }}
          className="flex items-center justify-between gap-3 p-5 bg-red/5 border border-red/30 rounded-2xl hover:border-red/60 hover:bg-red/10 transition-all group cursor-pointer"
        >
          <div className="text-left">
            <div className="font-black text-red text-base">🔴 Critical Override (REQ-NOTIF-004)</div>
            <div className="text-xs text-muted mt-0.5">Fires a system-critical notification that always shows, regardless of DND</div>
          </div>
          <ChevronRight className="w-5 h-5 text-red group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>

      {/* Fire by Category */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Fire by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CATEGORY_GROUPS.map(g => {
            const presets = PRESETS.filter(p => p.payload.category === g.key);
            return (
              <button
                key={g.key}
                onClick={() => {
                  presets.forEach((p, i) => setTimeout(() => { addNotification(p.payload); }, i * 100));
                  setFired(prev => [`All ${g.label}`, ...prev.slice(0, 4)]);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-panel border border-line rounded-2xl hover:border-cyan/50 hover:bg-bg transition-all cursor-pointer group"
              >
                <span className={`${g.color} group-hover:scale-110 transition-transform`}>{g.icon}</span>
                <span className="text-xs font-bold text-text">{g.label}</span>
                <span className="text-[10px] text-muted">{presets.length} types</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Presets grouped by category */}
      {CATEGORY_GROUPS.map(g => {
        const presets = PRESETS.filter(p => p.payload.category === g.key);
        return (
          <div key={g.key}>
            <div className={`flex items-center gap-2 mb-3`}>
              <span className={g.color}>{g.icon}</span>
              <h2 className="text-sm font-black uppercase tracking-widest text-muted">{g.label} Notifications</h2>
              <span className="text-[10px] text-muted bg-bg border border-line px-2 py-0.5 rounded-full font-bold">{presets.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => fire(preset)}
                  className={`flex items-center gap-3 p-4 border rounded-xl text-left transition-all cursor-pointer ${colorClass[preset.color] ?? colorClass['muted']}`}
                >
                  <div className="shrink-0">{preset.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-tight">{preset.label}</div>
                    <div className="text-[11px] opacity-70 truncate capitalize">{preset.payload.critical ? '🔴 Critical' : '⚪ Normal'}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Toast Notification & Swipe Gesture Dev Sandbox */}
      <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-black text-text flex items-center space-x-2 uppercase tracking-widest mb-1">
            <span>🛠️ Developer Toast & Gesture Sandbox</span>
          </h2>
          <p className="text-xs text-muted">
            Test gamified toast notifications, stacking bounds, and mobile gestures.
            On desktop, toasts slide in bottom-right. On mobile, they slide in top-center.
            Swipe left or right on a phone screen to dismiss them dynamically.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              addToast('xp', '+25 XP — Quiz answered correctly');
              setTimeout(() => addToast('success', '✓ File uploaded'), 300);
              setTimeout(() => addToast('info', 'Your session will expire in 10 minutes'), 600);
            }}
            className="bg-cyan hover:bg-cyan2 text-bg font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
          >
            Fire Staggered Toasts (Max 3)
          </button>
          <button
            onClick={() => {
              addToast('error', 'Something went wrong, please try again', () => {
                addToast('success', '✓ Retry successful!');
              });
            }}
            className="bg-red/15 hover:bg-red/25 text-red font-bold text-xs px-5 py-3 rounded-xl border border-red/30 transition-colors cursor-pointer"
          >
            Fire Error with Retry
          </button>
          <button
            onClick={() => {
              addToast('xp', '+10 XP — Fast read completion');
            }}
            className="bg-bg hover:bg-line border border-line text-text font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
          >
            Fire Single XP
          </button>
        </div>
      </div>

      {/* Custom builder */}
      <CustomNotificationBuilder onFire={(n) => { addNotification(n); setFired(prev => ['Custom', ...prev.slice(0, 4)]); }} />
    </div>
  );
};

// ─── Custom Notification Builder ─────────────────────────────────────────────
const CustomNotificationBuilder: React.FC<{
  onFire: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
}> = ({ onFire }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('course');
  const [critical, setCritical] = useState(false);

  const handleFire = () => {
    if (!title.trim()) return;
    onFire({ title, message, category, critical });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="p-6 bg-panel border border-line rounded-2xl space-y-4">
      <h2 className="font-black text-text text-sm uppercase tracking-widest">🛠️ Custom Notification Builder</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-muted block mb-1">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. New achievement unlocked!"
            className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-sm text-text focus:border-cyan outline-none transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-muted block mb-1">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Detailed description of the notification..."
            rows={2}
            className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-sm text-text focus:border-cyan outline-none transition-colors resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted block mb-1">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as NotificationCategory)}
            className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-sm text-text focus:border-cyan outline-none transition-colors cursor-pointer"
          >
            <option value="course">Course</option>
            <option value="social">Social</option>
            <option value="system">System</option>
            <option value="gamification">Gamification</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-line rounded-xl w-full bg-bg hover:border-red/40 transition-colors">
            <input
              type="checkbox"
              checked={critical}
              onChange={e => setCritical(e.target.checked)}
              className="w-4 h-4 accent-red cursor-pointer"
            />
            <span className="text-sm font-bold text-text">Mark as Critical</span>
          </label>
        </div>
      </div>
      <button
        onClick={handleFire}
        disabled={!title.trim()}
        className="w-full bg-cyan hover:bg-cyan2 disabled:opacity-40 disabled:cursor-not-allowed text-bg font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer"
      >
        Fire Custom Notification
      </button>
    </div>
  );
};
