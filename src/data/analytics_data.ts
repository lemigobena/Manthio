
// This file contains user analytics data such as study time, streak, xp, and module completion.
// This data is highly variable and depends on individual user progression.

export interface Weakness {
  id: string;
  topic: string;
  gapDescription: string;
  wrongPatterns: string;
  remediationPlan: string[];
  severity: 'light' | 'moderate' | 'significant';
  recommendedAction: 'revisit lesson' | 'do exercise set' | 'ask Tutor' | 'attend trainer office hours';
  detectedAt: string;
  reviewCycleDays: number[]; // [1, 3, 7, 21]
  currentCycleIdx: number; // 0, 1, 2, 3
  lastReviewAt: string | null;
  resolved: boolean;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  modulesCompleted: number;
  xpEarned?: number;
}

export interface AnalyticsData {
  totalStudyTime: {
    week: number; // in minutes
    month: number;
    allTime: number;
  };
  modulesCompletedCount: number;
  streak: number;
  longestStreak: number;
  subscription: {
    tier: string;
    spending: string;
    status: string;
  };
  competencies: Record<string, number>;
  weaknesses: Weakness[];
  activityLog: ActivityDay[];
  prevActivityLog: ActivityDay[];
  cohortActivityLog: ActivityDay[];
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const generateHistoryDays = (count: number, offsetDays = 0): ActivityDay[] => {
  const days: ActivityDay[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - offsetDays);

  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    const dayOfWeek = d.getDay();
    let baseMins = 30 + Math.sin(i * 0.4) * 20;
    if (dayOfWeek === 0 || dayOfWeek === 6) baseMins -= 15;
    const minutes = Math.max(0, Math.floor(baseMins + Math.random() * 15));
    
    const modulesCompleted = (i > 0 && i % 12 === 0) ? 1 : 0;
    const xpEarned = Math.floor(minutes * 5 + modulesCompleted * 500 + Math.random() * 50);

    days.push({
      date: dateStr,
      minutes,
      modulesCompleted,
      xpEarned
    });
  }
  return days;
};

export const getInitialData = (): AnalyticsData => {
  const activityLog = generateHistoryDays(90, 0);
  const prevActivityLog = generateHistoryDays(30, 30);
  const cohortActivityLog = generateHistoryDays(30, 0).map(day => ({
    ...day,
    minutes: Math.max(10, Math.floor(35 + Math.sin(new Date(day.date).getDate() * 0.2) * 10 + Math.random() * 8))
  }));

  const currentStreak = 12;

  const weekMins = activityLog.slice(0, 7).reduce((sum, d) => sum + d.minutes, 0);
  const monthMins = activityLog.slice(0, 30).reduce((sum, d) => sum + d.minutes, 0);
  const allTimeMins = activityLog.reduce((sum, d) => sum + d.minutes, 0) + 1200;

  return {
    totalStudyTime: {
      week: weekMins,
      month: monthMins,
      allTime: allTimeMins
    },
    modulesCompletedCount: 2,
    streak: currentStreak,
    longestStreak: Math.max(currentStreak, 15),
    subscription: {
      tier: 'Premium',
      spending: "CHF 1'000.00",
      status: 'Active via employer'
    },
    competencies: {
      'Python Syntax': 70,
      'OOP Concepts': 45,
      'Error Handling': 38,
      'Abstract Logic': 88,
      'File I/O': 60,
      'Data Structures': 75
    },
    weaknesses: [
      {
        id: 'oop',
        topic: 'OOP Concepts',
        gapDescription: 'Difficulties in understanding inheritance, class instantiation, and polymorphism in Python.',
        wrongPatterns: 'Directly instantiates abstract base classes; confuses super() inheritance chain syntax; uses multiple inheritance incorrectly.',
        remediationPlan: [
          'What is the main difference between single inheritance and multiple inheritance?',
          'Can you write a class Child that inherits from Parent and uses super() in its constructor?',
          'Why does Python allow multiple inheritance and what is the Method Resolution Order (MRO)?'
        ],
        severity: 'significant',
        recommendedAction: 'attend trainer office hours',
        detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reviewCycleDays: [1, 3, 7, 21],
        currentCycleIdx: 0,
        lastReviewAt: null,
        resolved: false
      },
      {
        id: 'errors',
        topic: 'Error Handling',
        gapDescription: 'Exceptions and try-except blocks were answered incorrectly several times in the last quiz questions.',
        wrongPatterns: 'Catches generic Exception rather than specific exception types; forgets to handle finally or else blocks properly.',
        remediationPlan: [
          "Why is catching 'Exception' generally considered a bad practice in Python?",
          'Explain the execution order of try-except-else-finally blocks.',
          'How do you raise a custom exception with a custom message?'
        ],
        severity: 'moderate',
        recommendedAction: 'do exercise set',
        detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reviewCycleDays: [1, 3, 7, 21],
        currentCycleIdx: 1,
        lastReviewAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resolved: false
      }
    ],
    activityLog,
    prevActivityLog,
    cohortActivityLog
  };
};

export const ANALYTICS_DATA: Record<string, AnalyticsData> = {
  'user-1': getInitialData()
};
