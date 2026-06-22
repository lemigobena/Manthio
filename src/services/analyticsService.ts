// Real-time Analytics & Progress Service for Manthio

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

const STORAGE_KEY = 'manthio_analytics_data';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate historical days
const generateHistoryDays = (count: number, offsetDays = 0): ActivityDay[] => {
  const days: ActivityDay[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - offsetDays);

  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    // Simulate realistic study minutes (sinusoidal + noise)
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    let baseMins = 30 + Math.sin(i * 0.4) * 20;
    if (dayOfWeek === 0 || dayOfWeek === 6) baseMins -= 15; // less on weekends
    const minutes = Math.max(0, Math.floor(baseMins + Math.random() * 15));
    
    // Modules completed on some days
    const modulesCompleted = (i > 0 && i % 12 === 0) ? 1 : 0;

    days.push({
      date: dateStr,
      minutes,
      modulesCompleted
    });
  }
  return days;
};

// Initial default state
const getInitialData = (): AnalyticsData => {
  const activityLog = generateHistoryDays(90, 0);
  const prevActivityLog = generateHistoryDays(30, 30);
  const cohortActivityLog = generateHistoryDays(30, 0).map(day => ({
    ...day,
    minutes: Math.max(10, Math.floor(35 + Math.sin(new Date(day.date).getDate() * 0.2) * 10 + Math.random() * 8))
  }));

  // Sync initial streak with localStorage if exists
  const currentStreak = Number(localStorage.getItem('streak') || '12');

  // Sum historical minutes
  const weekMins = activityLog.slice(0, 7).reduce((sum, d) => sum + d.minutes, 0);
  const monthMins = activityLog.slice(0, 30).reduce((sum, d) => sum + d.minutes, 0);
  const allTimeMins = activityLog.reduce((sum, d) => sum + d.minutes, 0) + 1200; // base offset

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
        detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
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
        detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        reviewCycleDays: [1, 3, 7, 21],
        currentCycleIdx: 1,
        lastReviewAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // reviewed 1 day ago
        resolved: false
      }
    ],
    activityLog,
    prevActivityLog,
    cohortActivityLog
  };
};

export const analyticsService = {
  // Load data from localStorage or initialize
  getAnalyticsData(): AnalyticsData {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Keep streak in sync with XPContext
        const currentStreak = Number(localStorage.getItem('streak') || '12');
        parsed.streak = currentStreak;
        if (currentStreak > parsed.longestStreak) {
          parsed.longestStreak = currentStreak;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse analytics data', e);
      }
    }
    const initial = getInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  // Save data back to localStorage
  saveAnalyticsData(data: AnalyticsData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Also dispatch event for real-time update in active views
    window.dispatchEvent(new Event('manthio_analytics_update'));
  },

  // Track active study minutes
  incrementStudyTime(minutes: number) {
    const data = this.getAnalyticsData();
    const todayStr = formatDate(new Date());

    // Update today's entry
    let todayEntry = data.activityLog.find(d => d.date === todayStr);
    if (!todayEntry) {
      todayEntry = { date: todayStr, minutes: 0, modulesCompleted: 0 };
      data.activityLog.unshift(todayEntry);
    }
    todayEntry.minutes += minutes;

    // Recalculate sums
    data.totalStudyTime.week += minutes;
    data.totalStudyTime.month += minutes;
    data.totalStudyTime.allTime += minutes;

    this.saveAnalyticsData(data);
  },

  // Track modules completed
  recordModuleCompleted() {
    const data = this.getAnalyticsData();
    const todayStr = formatDate(new Date());

    let todayEntry = data.activityLog.find(d => d.date === todayStr);
    if (!todayEntry) {
      todayEntry = { date: todayStr, minutes: 0, modulesCompleted: 0 };
      data.activityLog.unshift(todayEntry);
    }
    todayEntry.modulesCompleted += 1;
    data.modulesCompletedCount += 1;

    this.saveAnalyticsData(data);
  },

  // Log quiz/exercise results to track weaknesses or competencies
  recordQuizAnswer(topic: string, isCorrect: boolean, questionText: string, explanation: string) {
    const data = this.getAnalyticsData();

    // 1. Update Competency Score
    const currentScore = data.competencies[topic] || 50;
    if (isCorrect) {
      data.competencies[topic] = Math.min(100, currentScore + 4);
    } else {
      data.competencies[topic] = Math.max(10, currentScore - 6);

      // 2. Identify/Update Weakness
      let weakness = data.weaknesses.find(w => w.topic.toLowerCase() === topic.toLowerCase() && !w.resolved);
      if (!weakness) {
        // Create new weakness
        const id = topic.toLowerCase().replace(/\s+/g, '-');
        weakness = {
          id,
          topic,
          gapDescription: `Struggled with questions related to ${topic} in recent exercises.`,
          wrongPatterns: `Incorrectly answered: "${questionText}". Explanation provided: "${explanation}"`,
          remediationPlan: [
            `Explain the basic principles of ${topic}.`,
            `How do you fix a bug related to ${topic}?`,
            `Provide a practical example of ${topic} implementation.`
          ],
          severity: 'light',
          recommendedAction: 'revisit lesson',
          detectedAt: new Date().toISOString(),
          reviewCycleDays: [1, 3, 7, 21],
          currentCycleIdx: 0,
          lastReviewAt: null,
          resolved: false
        };
        data.weaknesses.push(weakness);
      } else {
        // Elevate severity and update wrong patterns
        if (weakness.severity === 'light') weakness.severity = 'moderate';
        else if (weakness.severity === 'moderate') weakness.severity = 'significant';
        
        weakness.wrongPatterns = `${weakness.wrongPatterns} | Also missed: "${questionText}"`;
        weakness.detectedAt = new Date().toISOString();
      }
    }

    this.saveAnalyticsData(data);
  },

  // Reset spaced repetition intervals or resolve a weakness
  resolveWeakness(id: string) {
    const data = this.getAnalyticsData();
    const weaknessIndex = data.weaknesses.findIndex(w => w.id === id);
    if (weaknessIndex !== -1) {
      data.weaknesses[weaknessIndex].resolved = true;
      // Increment competence as it is resolved
      const topic = data.weaknesses[weaknessIndex].topic;
      data.competencies[topic] = Math.min(100, (data.competencies[topic] || 50) + 15);
      
      this.saveAnalyticsData(data);
    }
  },

  // Perform a spaced repetition review quiz submission
  submitReviewQuizResult(id: string, isCorrect: boolean) {
    const data = this.getAnalyticsData();
    const weakness = data.weaknesses.find(w => w.id === id);
    if (weakness) {
      weakness.lastReviewAt = new Date().toISOString();
      if (isCorrect) {
        // Progress down the spaced repetition path
        if (weakness.currentCycleIdx < weakness.reviewCycleDays.length - 1) {
          weakness.currentCycleIdx += 1;
        } else {
          // Fully resolved after day 21 review
          weakness.resolved = true;
          data.competencies[weakness.topic] = Math.min(100, (data.competencies[weakness.topic] || 50) + 15);
        }
      } else {
        // Reset to day 1 check on failure
        weakness.currentCycleIdx = 0;
        weakness.severity = 'significant';
      }
      this.saveAnalyticsData(data);
    }
  },

  // Get status of review quiz (available vs countdown)
  getReviewQuizStatus(weakness: Weakness): { available: boolean; remainingDays: number } {
    if (weakness.resolved) return { available: false, remainingDays: 0 };
    
    const baseTime = weakness.lastReviewAt ? new Date(weakness.lastReviewAt).getTime() : new Date(weakness.detectedAt).getTime();
    const targetDays = weakness.reviewCycleDays[weakness.currentCycleIdx];
    const targetTime = baseTime + targetDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now >= targetTime) {
      return { available: true, remainingDays: 0 };
    } else {
      const diffMs = targetTime - now;
      const remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
      return { available: false, remainingDays };
    }
  },

  // Generate CSV string representing analytics logs
  exportToCSV(): string {
    const data = this.getAnalyticsData();
    let csv = 'Manthio Progress & Learning Analytics Export\n';
    csv += `Generated at,${new Date().toLocaleString()}\n\n`;

    // 1. Stats
    csv += 'STATISTICS\n';
    csv += `Study Time (Week),${(data.totalStudyTime.week / 60).toFixed(1)} hours\n`;
    csv += `Study Time (Month),${(data.totalStudyTime.month / 60).toFixed(1)} hours\n`;
    csv += `Study Time (All Time),${(data.totalStudyTime.allTime / 60).toFixed(1)} hours\n`;
    csv += `Modules Completed,${data.modulesCompletedCount}\n`;
    csv += `Current Streak,${data.streak} days\n`;
    csv += `Longest Streak,${data.longestStreak} days\n`;
    csv += `Subscription Tier,${data.subscription.tier}\n`;
    csv += `Active Spending,${data.subscription.spending}\n\n`;

    // 2. Competencies
    csv += 'COMPETENCY RATINGS\n';
    csv += 'Competency,Score\n';
    Object.entries(data.competencies).forEach(([k, v]) => {
      csv += `"${k}",${v}%\n`;
    });
    csv += '\n';

    // 3. Weaknesses
    csv += 'WEAKNESSES AND GAPS IDENTIFIED\n';
    csv += 'Topic,Severity,Status,Detected At,Last Review\n';
    data.weaknesses.forEach(w => {
      csv += `"${w.topic}",${w.severity},${w.resolved ? 'Resolved' : 'Active'},${w.detectedAt},${w.lastReviewAt || 'Never'}\n`;
    });
    csv += '\n';

    // 4. Daily logs
    csv += 'DAILY LEARNING LOG (LAST 90 DAYS)\n';
    csv += 'Date,Minutes Studied,Modules Completed\n';
    data.activityLog.forEach(day => {
      csv += `${day.date},${day.minutes},${day.modulesCompleted}\n`;
    });

    return csv;
  }
};
