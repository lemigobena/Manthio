import type { UserProfile } from '../types';

// This file contains the user profile data that varies from user to user.
// It includes user preferences, onboarding status, and personal details.
export const USER_PROFILES: Record<string, UserProfile> = {
  'user-1': {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
    bio: 'Software Developer & Python Enthusiast. Enrolled in Python Bootcamp by Apigenio.',
    level: 42,
    xp: 42500,
    currentXpInLevel: 2500,
    xpNeededForNextLevel: 10000,
    streak: 12,
    streakFreezeAvailable: true
  },
  'user-2': {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
    bio: 'Frontend enthusiast learning React & API design at my own pace.',
    level: 8,
    xp: 8200,
    currentXpInLevel: 200,
    xpNeededForNextLevel: 10000,
    streak: 5,
    streakFreezeAvailable: false
  },
  'user-3': {
    name: 'Liam Zhao',
    email: 'liam.zhao@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
    bio: 'Incoming Cloud DevOps student. Excited to get started soon!',
    level: 1,
    xp: 0,
    currentXpInLevel: 0,
    xpNeededForNextLevel: 10000,
    streak: 0,
    streakFreezeAvailable: true
  },
  'user-4': {
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
    bio: 'Returning backend developer. Catching up on Python Bootcamp.',
    level: 25,
    xp: 25400,
    currentXpInLevel: 5400,
    xpNeededForNextLevel: 10000,
    streak: 0,
    lastActiveDate: '2026-05-15T12:00:00Z',
    streakFreezeAvailable: true
  },
  'user-5': {
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
    bio: 'Graduate of Python Production Engineer career path. Looking for junior developer roles.',
    level: 95,
    xp: 95000,
    currentXpInLevel: 5000,
    xpNeededForNextLevel: 10000,
    streak: 85,
    streakFreezeAvailable: true
  },
  'user-6': {
    name: 'Noah Miller',
    email: 'noah.miller@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
    bio: 'Ready to start learning software engineering!',
    level: 1,
    xp: 0,
    currentXpInLevel: 0,
    xpNeededForNextLevel: 10000,
    streak: 0,
    streakFreezeAvailable: true
  },
  'user-7': {
    name: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150',
    bio: 'Just signed up. Deciding on my study objectives.',
    level: 1,
    xp: 0,
    currentXpInLevel: 0,
    xpNeededForNextLevel: 10000,
    streak: 0,
    streakFreezeAvailable: true
  },
  'guest': {
    name: 'Guest Developer',
    email: 'guest@example.com',
    password: 'password123',
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


