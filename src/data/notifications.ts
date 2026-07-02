import type { AppNotification } from '../types';

// This file contains the mock notifications specifically generated for each user.
// It includes system alerts, course updates, and community activity.

export const USER_NOTIFICATIONS: AppNotification[] = [
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
  USER_NOTIFICATIONS.push({
    id: `n-mock-${i}`,
    category: 'marketing',
    title: `New Course Recommendation ${i + 1}`,
    message: 'Check out this new course we think you might like.',
    time: `${i + 3} days ago`,
    read: true,
    critical: false
  });
}
