import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'xp' | 'success' | 'error' | 'info';
  text: string;
}

interface XPContextType {
  xp: number;
  level: number;
  streak: number;
  xpNeededForNextLevel: number;
  currentXpInLevel: number;
  streakFreezeAvailable: boolean;
  addXp: (amount: number, reason: string) => void;
  incrementStreak: () => void;
  useStreakFreeze: () => boolean;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], text: string) => void;
  removeToast: (id: string) => void;
  celebrationActive: boolean;
  dismissCelebration: () => void;
  levelUpTo: number | null;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

const calculateLevelFromXp = (xpVal: number) => {
  let tempXp = xpVal;
  let lvl = 1;
  while (true) {
    const needed = Math.floor(10000 * (1 + 0.1 * lvl));
    if (tempXp >= needed) {
      tempXp -= needed;
      lvl++;
    } else {
      return { level: lvl, currentXpInLevel: tempXp, xpNeededForNextLevel: needed };
    }
  }
};

let toastIdCounter = 0;

export const XPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('xp') || '42500'));
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak') || '12'));
  const [streakFreezeAvailable, setStreakFreezeAvailable] = useState(() => localStorage.getItem('streakFreezeAvailable') !== 'false');
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);

  // Derive Level and progress from XP
  // REQ-LEVEL-002 XP required per level follows a curve: Level N requires 10,000 * (1 + 0.1 * N) XP.
  const { level, currentXpInLevel, xpNeededForNextLevel } = calculateLevelFromXp(xp);

  useEffect(() => {
    localStorage.setItem('level', level.toString());
    localStorage.setItem('xp', xp.toString());
  }, [level, xp]);

  const addXp = (amount: number, reason: string) => {
    const nextXp = xp + amount;
    const prevLvl = calculateLevelFromXp(xp).level;
    const nextLvl = calculateLevelFromXp(nextXp).level;
    if (nextLvl > prevLvl) {
      setLevelUpTo(nextLvl);
      setCelebrationActive(true);
    }
    setXp(nextXp);
    addToast('xp', `+${amount} XP — ${reason}`);
  };

  const incrementStreak = () => {
    setStreak(prev => {
      const next = prev + 1;
      localStorage.setItem('streak', next.toString());
      return next;
    });
  };

  const useStreakFreeze = () => {
    if (streakFreezeAvailable) {
      setStreakFreezeAvailable(false);
      localStorage.setItem('streakFreezeAvailable', 'false');
      addToast('info', 'Streak freeze applied for today!');
      return true;
    }
    return false;
  };

  const addToast = (type: ToastMessage['type'], text: string) => {
    const id = `toast-${++toastIdCounter}`;
    const duration = type === 'error' ? 5000 : 3000; // REQ-TOAST-002
    
    setToasts(prev => {
      // Maximum 3 visible at once (REQ-TOAST-004)
      const next = [...prev, { id, type, text }];
      if (next.length > 3) {
        return next.slice(next.length - 3);
      }
      return next;
    });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const dismissCelebration = () => {
    setCelebrationActive(false);
    setLevelUpTo(null);
  };

  return (
    <XPContext.Provider value={{
      xp,
      level,
      streak,
      xpNeededForNextLevel,
      currentXpInLevel,
      streakFreezeAvailable,
      addXp,
      incrementStreak,
      useStreakFreeze,
      toasts,
      addToast,
      removeToast,
      celebrationActive,
      dismissCelebration,
      levelUpTo
    }}>
      {children}
    </XPContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) throw new Error('useXP must be used within an XPProvider');
  return context;
};
