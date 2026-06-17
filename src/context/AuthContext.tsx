import React, { createContext, useContext, useState } from 'react';
import type { UserProfile } from '../types';

interface OnboardingAnswers {
  reason: string;
  timePerWeek: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved);
    // Return a default mock user (Alex Chen, Level 42) for testing out of the box
    return {
      name: 'Alex Chen',
      email: 'alex.chen@manthio.io',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      bio: 'Software Developer & Python Enthusiast. Enrolled in Python Bootcamp by Apigenio.',
      level: 42,
      xp: 42500,
      currentXpInLevel: 2500,
      xpNeededForNextLevel: 10000,
      streak: 12,
      streakFreezeAvailable: true
    };
  });

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() => {
    return localStorage.getItem('isOnboardingCompleted') === 'true';
  });

  const [activeCourseId, setActiveCourseIdState] = useState<string | null>(() => {
    return localStorage.getItem('activeCourseId') || 'python-bootcamp';
  });

  const setActiveCourseId = (id: string | null) => {
    setActiveCourseIdState(id);
    if (id) localStorage.setItem('activeCourseId', id);
    else localStorage.removeItem('activeCourseId');
  };

  const signIn = async (email: string, _password: string): Promise<boolean> => {
    // Basic mock authentication
    const mockUser: UserProfile = {
      name: 'Alex Chen',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      bio: 'Software Developer & Python Enthusiast. Enrolled in Python Bootcamp by Apigenio.',
      level: 42,
      xp: 42500,
      currentXpInLevel: 2500,
      xpNeededForNextLevel: 10000,
      streak: 12,
      streakFreezeAvailable: true
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return true;
  };

  const signUp = async (name: string, email: string, _password: string): Promise<boolean> => {
    const mockUser: UserProfile = {
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      bio: 'Enrolled in Python Bootcamp by Apigenio.',
      level: 1,
      xp: 0,
      currentXpInLevel: 0,
      xpNeededForNextLevel: 10000,
      streak: 0,
      streakFreezeAvailable: true
    };
    setUser(mockUser);
    setIsOnboardingCompleted(false);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isOnboardingCompleted', 'false');
    return true;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    setIsOnboardingCompleted(true);
    localStorage.setItem('isOnboardingCompleted', 'true');
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isOnboardingCompleted,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      activeCourseId,
      setActiveCourseId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
