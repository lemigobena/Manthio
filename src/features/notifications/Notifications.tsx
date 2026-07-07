import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import type { AppNotification } from '../../types';
import { Bell, BookOpen, MessageSquare, AlertCircle, Award, Target, CheckCircle } from 'lucide-react';

interface NotificationsProps {
  onNavigate: (page: string) => void;
}

// ── Category accent map (left bar + bg tint) ─────────────────────────────────
const accentMap: Record<string, { bar: string; bg: string; icon: React.ReactNode }> = {
  course: {
    bar: 'border-l-cyan',
    bg: 'bg-cyan/5',
    icon: <BookOpen className="w-4 h-4 text-cyan" />
  },
  social: {
    bar: 'border-l-purple',
    bg: 'bg-purple/5',
    icon: <MessageSquare className="w-4 h-4 text-purple" />
  },
  system: {
    bar: 'border-l-yellow',
    bg: 'bg-yellow/5',
    icon: <AlertCircle className="w-4 h-4 text-yellow" />
  },
  gamification: {
    bar: 'border-l-green',
    bg: 'bg-green/5',
    icon: <Award className="w-4 h-4 text-green" />
  },
  marketing: {
    bar: 'border-l-orange',
    bg: 'bg-orange/5',
    icon: <Target className="w-4 h-4 text-orange" />
  }
};

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read);

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) onNavigate(n.link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          <p className="text-sm text-muted mt-1">Stay updated with your learning progress and community.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('settings:preferences')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-bg border border-line hover:border-cyan text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer text-text whitespace-nowrap"
          >
            Preferences
          </button>
          <button
            onClick={markAllAsRead}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan/10 text-cyan hover:bg-cyan/20 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 border-b border-line pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${filter === 'all' ? 'bg-text text-bg' : 'text-muted hover:text-text bg-bg border border-line'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${filter === 'unread' ? 'bg-text text-bg' : 'text-muted hover:text-text bg-bg border border-line'}`}
        >
          Unread
        </button>
      </div>

      {/* Notification list */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">You're all caught up!</p>
            <p className="text-xs mt-1 opacity-60">No notifications to show.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const cat = n.critical ? null : accentMap[n.category];
            const barClass = n.critical ? 'border-l-red' : (cat?.bar ?? 'border-l-muted');
            const bgClass  = n.critical ? 'bg-red/5'   : (cat?.bg  ?? 'bg-bg/40');
            const iconNode = n.critical
              ? <AlertCircle className="w-4 h-4 text-red" />
              : (cat?.icon ?? <Bell className="w-4 h-4 text-muted" />);

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`
                  flex items-start gap-3 p-4
                  border border-line/40 border-l-[4px] ${barClass}
                  rounded-xl shadow-sm cursor-pointer
                  transition-all duration-200
                  ${n.read
                    ? 'opacity-55 hover:opacity-80 bg-bg/30'
                    : `${bgClass} hover:brightness-[1.04]`}
                `}
              >
                {/* Category icon */}
                <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-bg border border-line/40 shadow-sm">
                  {iconNode}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-bold text-sm leading-snug ${n.critical ? 'text-red' : 'text-text'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-muted whitespace-nowrap shrink-0 pt-0.5">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                </div>

                {/* Mark-read button */}
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                    className="shrink-0 mt-0.5 p-1 text-muted hover:text-cyan transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
