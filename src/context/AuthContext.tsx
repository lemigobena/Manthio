import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { USER_PROFILES } from '../data/user_profiles';
import { COURSES, TRACKS } from '../services/mockData';

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
  isEmailVerified: boolean;
  setIsEmailVerified: (verified: boolean) => void;
  is2FAEnabled: boolean;
  setIs2FAEnabled: (enabled: boolean) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  updateProfile: (name: string, bio: string, avatar?: string, backgroundImage?: string) => void;
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
  activeTrackId: string | null;
  setActiveTrackId: (id: string | null) => void;
  checkoutItem: { type: 'course' | 'track'; id: string } | null;
  setCheckoutItem: (item: { type: 'course' | 'track'; id: string } | null) => void;
  selectedFormat: string | null;
  setSelectedFormat: (format: string | null) => void;
  skipAuth: () => void;
  saveEnrollments: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getCustomProfiles = (): Record<string, UserProfile> => {
  try {
    const raw = localStorage.getItem('custom_user_profiles');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveCustomProfile = (profile: UserProfile) => {
  try {
    const current = getCustomProfiles();
    current[profile.email.toLowerCase()] = profile;
    localStorage.setItem('custom_user_profiles', JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save custom profile', e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
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

  const [activeTrackId, setActiveTrackIdState] = useState<string | null>(() => {
    return localStorage.getItem('activeTrackId') || null;
  });

  const [selectedFormat, setSelectedFormatState] = useState<string | null>(() => {
    return localStorage.getItem('selectedFormat') || null;
  });

  const [isEmailVerified, setIsEmailVerifiedState] = useState<boolean>(() => {
    return localStorage.getItem('isEmailVerified') === 'true';
  });

  const [is2FAEnabled, setIs2FAEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('is2FAEnabled') === 'true';
  });

  const [checkoutItem, setCheckoutItemState] = useState<{ type: 'course' | 'track'; id: string } | null>(null);

  const saveEnrollments = () => {
    if (!user) return;
    const enrolledCourses = COURSES.filter(c => c.enrolled).map(c => c.id);
    const enrolledTracks = TRACKS.filter(t => t.enrolled).map(t => t.id);
    localStorage.setItem(`enrolled_courses_${user.email}`, JSON.stringify(enrolledCourses));
    localStorage.setItem(`enrolled_tracks_${user.email}`, JSON.stringify(enrolledTracks));
  };

  const loadEnrollments = (email: string) => {
    const coursesKey = `enrolled_courses_${email}`;
    const tracksKey = `enrolled_tracks_${email}`;
    let enrolledCourses: string[] = [];
    let enrolledTracks: string[] = [];

    if (localStorage.getItem(coursesKey) !== null) {
      enrolledCourses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
      enrolledTracks = JSON.parse(localStorage.getItem(tracksKey) || '[]');
    } else {
      // Initialize defaults based on user profile
      const cleanEmail = email.toLowerCase();
      if (cleanEmail === 'alex.chen@example.com') {
        enrolledCourses = ['python-bootcamp', 'git-essentials', 'sql-databases'];
        enrolledTracks = ['python-production-engineer'];
      } else if (cleanEmail === 'sarah.jenkins@example.com') {
        enrolledCourses = ['react-web-development', 'api-design-fastapi'];
        enrolledTracks = [];
      } else if (cleanEmail === 'liam.zhao@example.com') {
        enrolledCourses = ['docker-containers', 'kubernetes-production'];
        enrolledTracks = ['cloud-devops-engineer'];
      } else if (cleanEmail === 'elena.rostova@example.com') {
        enrolledCourses = ['python-bootcamp', 'git-essentials'];
        enrolledTracks = ['python-production-engineer'];
      } else if (cleanEmail === 'marcus.vance@example.com') {
        enrolledCourses = ['python-bootcamp', 'git-essentials', 'sql-databases', 'api-design-fastapi'];
        enrolledTracks = ['python-production-engineer'];
      } else {
        enrolledCourses = [];
        enrolledTracks = [];
      }
      localStorage.setItem(coursesKey, JSON.stringify(enrolledCourses));
      localStorage.setItem(tracksKey, JSON.stringify(enrolledTracks));
    }

    COURSES.forEach(c => {
      c.enrolled = enrolledCourses.includes(c.id);
    });
    TRACKS.forEach(t => {
      t.enrolled = enrolledTracks.includes(t.id);
    });
  };

  // Sync in-memory enrollment states when user changes
  useEffect(() => {
    if (user) {
      loadEnrollments(user.email);
    } else {
      COURSES.forEach(c => {
        c.enrolled = false;
      });
      TRACKS.forEach(t => {
        t.enrolled = false;
      });
    }
  }, [user]);

  const setActiveCourseId = (id: string | null) => {
    setActiveCourseIdState(id);
    if (id) localStorage.setItem('activeCourseId', id);
    else localStorage.removeItem('activeCourseId');
  };

  const setActiveTrackId = (id: string | null) => {
    setActiveTrackIdState(id);
    if (id) localStorage.setItem('activeTrackId', id);
    else localStorage.removeItem('activeTrackId');
  };

  const setIsEmailVerified = (verified: boolean) => {
    setIsEmailVerifiedState(verified);
    localStorage.setItem('isEmailVerified', String(verified));
  };

  const setIs2FAEnabled = (enabled: boolean) => {
    setIs2FAEnabledState(enabled);
    localStorage.setItem('is2FAEnabled', String(enabled));
  };

  const setCheckoutItem = (item: { type: 'course' | 'track'; id: string } | null) => {
    setCheckoutItemState(item);
  };

  const setSelectedFormat = (format: string | null) => {
    setSelectedFormatState(format);
    if (format) localStorage.setItem('selectedFormat', format);
    else localStorage.removeItem('selectedFormat');
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check custom profiles first
    const customProfiles = getCustomProfiles();
    let foundProfile = customProfiles[cleanEmail];

    // Check mock profiles next
    if (!foundProfile) {
      const match = Object.values(USER_PROFILES).find(p => p.email.toLowerCase() === cleanEmail);
      if (match) {
        foundProfile = match;
      }
    }

    // Reject non-existent profiles (require signup first)
    if (!foundProfile) {
      return false;
    }

    // Verify Password
    const expectedPassword = foundProfile.password || 'password123';
    if (password !== expectedPassword) {
      return false;
    }

    setUser(foundProfile);
    localStorage.setItem('user', JSON.stringify(foundProfile));

    if (cleanEmail === 'sophia.martinez@example.com') {
      setIsOnboardingCompleted(false);
      localStorage.setItem('isOnboardingCompleted', 'false');
    } else {
      setIsOnboardingCompleted(true);
      localStorage.setItem('isOnboardingCompleted', 'true');
    }

    let defaultCourseId = 'python-bootcamp';
    let defaultTrackId: string | null = null;
    if (cleanEmail === 'alex.chen@example.com') {
      defaultCourseId = 'python-bootcamp';
      defaultTrackId = 'python-production-engineer';
    } else if (cleanEmail === 'sarah.jenkins@example.com') {
      defaultCourseId = 'react-web-development';
    } else if (cleanEmail === 'liam.zhao@example.com') {
      defaultCourseId = 'docker-containers';
      defaultTrackId = 'cloud-devops-engineer';
    } else if (cleanEmail === 'elena.rostova@example.com') {
      defaultCourseId = 'python-bootcamp';
      defaultTrackId = 'python-production-engineer';
    } else if (cleanEmail === 'marcus.vance@example.com') {
      defaultCourseId = 'python-bootcamp';
      defaultTrackId = 'python-production-engineer';
    }

    setActiveCourseId(defaultCourseId);
    setActiveTrackId(defaultTrackId);

    return true;
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: UserProfile = {
      name,
      email: cleanEmail,
      password,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      bio: 'Ready to start learning software engineering!',
      level: 1,
      xp: 0,
      currentXpInLevel: 0,
      xpNeededForNextLevel: 10000,
      streak: 0,
      streakFreezeAvailable: true
    };

    saveCustomProfile(newUser);
    setUser(newUser);
    setIsOnboardingCompleted(false);
    setIsOnboardingSkipped(false);
    setOnboardingAnswers(null);

    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('isOnboardingCompleted', 'false');
    localStorage.setItem('isOnboardingSkipped', 'false');
    localStorage.removeItem('onboardingAnswers');
    localStorage.removeItem('onboarding_current_step');
    localStorage.removeItem('onboarding_reason');
    localStorage.removeItem('onboarding_time_commitment');
    localStorage.removeItem('onboarding_avatar');

    setActiveCourseId(null);
    setActiveTrackId(null);

    return true;
  };

  const signOut = () => {
    setIsEmailVerifiedState(false);
    localStorage.removeItem('isEmailVerified');
    setIs2FAEnabledState(false);
    localStorage.removeItem('is2FAEnabled');
    setUser(null);
    localStorage.removeItem('user');
  };

  const skipAuth = () => {
    const guestUser: UserProfile = {
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
    };
    setUser(guestUser);
    setIsOnboardingCompleted(true);
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isOnboardingCompleted', 'true');
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    setIsOnboardingCompleted(true);
    setIsOnboardingSkipped(false);
    setOnboardingAnswers(answers);
    localStorage.setItem('isOnboardingCompleted', 'true');
    localStorage.setItem('isOnboardingSkipped', 'false');
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
    saveEnrollments();
  };

  const skipOnboarding = () => {
    setIsOnboardingCompleted(true);
    setIsOnboardingSkipped(true);
    localStorage.setItem('isOnboardingCompleted', 'true');
    localStorage.setItem('isOnboardingSkipped', 'true');
    saveEnrollments();
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

  const updateProfile = (name: string, bio: string, avatar?: string, backgroundImage?: string) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, name, bio, ...(avatar ? { avatar } : {}), ...(backgroundImage ? { backgroundImage } : {}) };
      localStorage.setItem('user', JSON.stringify(updated));
      saveCustomProfile(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isEmailVerified,
      setIsEmailVerified,
      is2FAEnabled,
      setIs2FAEnabled,
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
      setActiveCourseId,
      activeTrackId,
      setActiveTrackId,
      checkoutItem,
      setCheckoutItem,
      selectedFormat,
      setSelectedFormat,
      skipAuth,
      saveEnrollments
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

