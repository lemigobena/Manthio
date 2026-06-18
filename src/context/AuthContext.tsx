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
  onboardingAnswers: OnboardingAnswers | null;
  isOnboardingSkipped: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  updateProfile: (name: string, bio: string, avatar?: string) => void;
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

  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(() => {
    const saved = localStorage.getItem('onboardingAnswers');
    return saved ? JSON.parse(saved) : null;
  });

  const [isOnboardingSkipped, setIsOnboardingSkipped] = useState(() => {
    return localStorage.getItem('isOnboardingSkipped') === 'true';
  });

  const [activeCourseId, setActiveCourseIdState] = useState<string | null>(() => {
    return localStorage.getItem('activeCourseId') || 'python-bootcamp';
  });

  const setActiveCourseId = (id: string | null) => {
    setActiveCourseIdState(id);
    if (id) localStorage.setItem('activeCourseId', id);
    else localStorage.removeItem('activeCourseId');
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    void password;
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

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    void password;
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
    setIsOnboardingSkipped(false);
    setOnboardingAnswers(null);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isOnboardingCompleted', 'false');
    localStorage.setItem('isOnboardingSkipped', 'false');
    localStorage.removeItem('onboardingAnswers');
    localStorage.removeItem('onboarding_current_step');
    localStorage.removeItem('onboarding_reason');
    localStorage.removeItem('onboarding_time_commitment');
    localStorage.removeItem('onboarding_avatar');
    return true;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    setIsOnboardingCompleted(true);
    setIsOnboardingSkipped(false);
    setOnboardingAnswers(answers);
    localStorage.setItem('isOnboardingCompleted', 'true');
    localStorage.setItem('isOnboardingSkipped', 'false');
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
  };

  const skipOnboarding = () => {
    setIsOnboardingCompleted(true);
    setIsOnboardingSkipped(true);
    localStorage.setItem('isOnboardingCompleted', 'true');
    localStorage.setItem('isOnboardingSkipped', 'true');
  };

  const resetOnboarding = () => {
    setIsOnboardingCompleted(false);
    setIsOnboardingSkipped(false);
    setOnboardingAnswers(null);
    localStorage.setItem('isOnboardingCompleted', 'false');
    localStorage.setItem('isOnboardingSkipped', 'false');
    localStorage.removeItem('onboardingAnswers');
    localStorage.removeItem('onboarding_current_step');
    localStorage.removeItem('onboarding_reason');
    localStorage.removeItem('onboarding_time_commitment');
    localStorage.removeItem('onboarding_avatar');
  };

  const updateProfile = (name: string, bio: string, avatar?: string) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, name, bio, ...(avatar ? { avatar } : {}) };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isOnboardingCompleted,
      onboardingAnswers,
      isOnboardingSkipped,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      skipOnboarding,
      resetOnboarding,
      updateProfile,
      activeCourseId,
      setActiveCourseId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
