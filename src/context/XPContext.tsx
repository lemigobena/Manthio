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

export const XPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('xp') || '42500'));
  const [level, setLevel] = useState(1);
  const [currentXpInLevel, setCurrentXpInLevel] = useState(0);
  const [xpNeededForNextLevel, setXpNeededForNextLevel] = useState(10000);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak') || '12'));
  const [streakFreezeAvailable, setStreakFreezeAvailable] = useState(() => localStorage.getItem('streakFreezeAvailable') !== 'false');
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);

  // Calculate Level and progress from XP
  // REQ-LEVEL-002 XP required per level follows a curve: Level N requires 10,000 * (1 + 0.1 * N) XP.
  useEffect(() => {
    let tempXp = xp;
    let currentLvl = 1;
    
    while (true) {
      const needed = Math.floor(10000 * (1 + 0.1 * currentLvl));
      if (tempXp >= needed) {
        tempXp -= needed;
        currentLvl++;
      } else {
        setCurrentXpInLevel(tempXp);
        setXpNeededForNextLevel(needed);
        break;
      }
    }
    
    // Check if level increased
    const savedLevel = localStorage.getItem('level');
    if (savedLevel) {
      const prevLvl = Number(savedLevel);
      if (currentLvl > prevLvl) {
        setLevelUpTo(currentLvl);
        setCelebrationActive(true);
      }
    }
    
    setLevel(currentLvl);
    localStorage.setItem('level', currentLvl.toString());
    localStorage.setItem('xp', xp.toString());
  }, [xp]);

  const addXp = (amount: number, reason: string) => {
    setXp(prev => prev + amount);
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
    const id = Math.random().toString(36).substring(2, 9);
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

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) throw new Error('useXP must be used within an XPProvider');
  return context;
};
