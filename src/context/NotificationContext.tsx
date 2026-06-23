import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppNotification, NotificationPreferences } from '../types';

// A live toast is just a notification with an auto-dismiss ID
export interface LiveNotificationToast extends AppNotification {
  toastId: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  liveToasts: LiveNotificationToast[];
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  dismissAll: () => void;
  dismissLiveToast: (toastId: string) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: AppNotification[] = [
  {
    id: 'n-1',
    category: 'course',
    title: 'Live session starting soon!',
    message: 'The Q&A session for Module 3 starts in 15 minutes.',
    time: '15 mins ago',
    read: false,
    critical: true,
    link: 'live-session'
  },
  {
    id: 'n-2',
    category: 'gamification',
    title: 'Streak in danger! 🔥',
    message: 'Complete a lesson today to keep your 12-day streak alive.',
    time: '2 hours ago',
    read: false,
    critical: true
  },
  {
    id: 'n-3',
    category: 'social',
    title: 'New reply to your thread',
    message: 'Alex commented on "How to use useEffect properly?"',
    time: '5 hours ago',
    read: false,
    critical: false,
    link: 'community'
  },
  {
    id: 'n-4',
    category: 'system',
    title: 'Subscription renewed',
    message: 'Your Premium plan was successfully renewed.',
    time: '1 day ago',
    read: true,
    critical: false,
    link: 'settings:billing'
  },
  {
    id: 'n-5',
    category: 'course',
    title: 'Certificate ready 🎓',
    message: 'You have completed Python Bootcamp. Download your certificate!',
    time: '2 days ago',
    read: true,
    critical: false,
    link: 'profile'
  },
];

// Generate 20 more mock notifications
for (let i = 0; i < 20; i++) {
  initialNotifications.push({
    id: `n-mock-${i}`,
    category: 'marketing',
    title: `New Course Recommendation ${i + 1}`,
    message: 'Check out this new course we think you might like.',
    time: `${i + 3} days ago`,
    read: true,
    critical: false
  });
}

const defaultPreferences: NotificationPreferences = {
  course: { email: true, push: true, inApp: true },
  social: { email: false, push: true, inApp: true },
  system: { email: true, push: true, inApp: true },
  gamification: { email: false, push: false, inApp: true },
  marketing: { email: false, push: false, inApp: true },
  digest: 'instant'
};

// Max live toasts visible simultaneously
const MAX_LIVE_TOASTS = 4;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [liveToasts, setLiveToasts] = useState<LiveNotificationToast[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updatePreferences = (prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const dismissLiveToast = useCallback((toastId: string) => {
    setLiveToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const id = `n-live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newN: AppNotification = { ...n, id, time: 'just now', read: false };

    // Add to main notification list
    setNotifications(prev => [newN, ...prev]);

    // Add to live toast queue (cap at MAX_LIVE_TOASTS)
    const toastId = `toast-${id}`;
    const toast: LiveNotificationToast = { ...newN, toastId };
    setLiveToasts(prev => [toast, ...prev].slice(0, MAX_LIVE_TOASTS));

    // Auto-dismiss after 5s (critical = 8s)
    const delay = n.critical ? 8000 : 5000;
    setTimeout(() => {
      setLiveToasts(prev => prev.filter(t => t.toastId !== toastId));
    }, delay);
  }, []);

  const dismissAll = () => {
    setNotifications([]);
    setLiveToasts([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      liveToasts,
      preferences,
      markAsRead,
      markAllAsRead,
      addNotification,
      dismissAll,
      dismissLiveToast,
      updatePreferences,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
