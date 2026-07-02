import type { UserProfile } from '../types';

// This file contains the user profile data that varies from user to user.
// It includes user preferences, onboarding status, and personal details.
export const USER_PROFILES: Record<string, UserProfile> = {
  'user-1': {
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      bio: 'Software Developer & Python Enthusiast. Enrolled in Python Bootcamp by Apigenio.',
      level: 42,
      xp: 42500,
      currentXpInLevel: 2500,
      xpNeededForNextLevel: 10000,
      streak: 12,
      streakFreezeAvailable: true
    },
  'guest': {
      name: 'Guest Developer',
      email: 'guest@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      bio: 'Exploring the platform as a guest.',
      level: 1,
      xp: 0,
      currentXpInLevel: 0,
      xpNeededForNextLevel: 10000,
      streak: 0,
      streakFreezeAvailable: true
    }
};
