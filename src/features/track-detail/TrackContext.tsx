import React, { useState, useCallback, useEffect } from 'react';
import { TRACKS, COURSES } from '../../services/mockData';
import { isCourseCompleted, calculateTrackProgress, calculateCourseProgress } from '../../services/progressUtils';
import type { Course, SelfAssessmentLevel, UserTrackProgress, CareerTrack } from '../../types';
import { TrackContext } from './TrackContextStore';
import { useAuth } from '../../context/AuthContext';

const getCourseLessonIds = (courseId: string): string[] => {
  const course = COURSES.find(c => c.id === courseId);
  if (!course) return [];
  return course.modules.flatMap(m => m.lessons).map(l => l.id);
};

const getCoursePercentageLessons = (courseId: string, percentage: number): string[] => {
  const allIds = getCourseLessonIds(courseId);
  const count = Math.round((allIds.length * percentage) / 100);
  return allIds.slice(0, count);
};

const getInitialLessonsForUser = (email: string): string[] => {
  const cleanEmail = email.toLowerCase();
  if (cleanEmail === 'alex.chen@example.com') {
    return [
      ...getCourseLessonIds('git-essentials'),
      ...getCoursePercentageLessons('python-bootcamp', 45),
      ...getCoursePercentageLessons('sql-databases', 10),
    ];
  }
  if (cleanEmail === 'sarah.jenkins@example.com') {
    return [
      ...getCoursePercentageLessons('react-web-development', 30),
      ...getCoursePercentageLessons('api-design-fastapi', 15),
    ];
  }
  if (cleanEmail === 'elena.rostova@example.com') {
    return [
      ...getCourseLessonIds('git-essentials'),
      ...getCoursePercentageLessons('python-bootcamp', 65),
    ];
  }
  if (cleanEmail === 'marcus.vance@example.com') {
    return [
      ...getCourseLessonIds('python-bootcamp'),
      ...getCourseLessonIds('git-essentials'),
      ...getCourseLessonIds('sql-databases'),
      ...getCourseLessonIds('api-design-fastapi'),
    ];
  }
  return [];
};

const getInitialTrackForUser = (email: string): Record<string, UserTrackProgress> => {
  const cleanEmail = email.toLowerCase();
  const pythonTrackId = 'python-production-engineer';
  const devopsTrackId = 'cloud-devops-engineer';
  
  const createBaseTrack = (trackId: string, enrolledDaysAgo: number) => ({
    userId: cleanEmail,
    trackId,
    enrolledAt: new Date(Date.now() - enrolledDaysAgo * 24 * 60 * 60 * 1000),
    completedAt: null,
    selfAssessmentLevel: 'nothing' as const,
    completedMilestoneIds: [],
    bookmarkedAt: null,
  });

  if (cleanEmail === 'alex.chen@example.com') {
    return {
      [pythonTrackId]: {
        ...createBaseTrack(pythonTrackId, 15),
        selfAssessmentLevel: 'basics',
      }
    };
  }
  if (cleanEmail === 'elena.rostova@example.com') {
    return {
      [pythonTrackId]: {
        ...createBaseTrack(pythonTrackId, 45),
        selfAssessmentLevel: 'basics',
      }
    };
  }
  if (cleanEmail === 'marcus.vance@example.com') {
    return {
      [pythonTrackId]: {
        ...createBaseTrack(pythonTrackId, 90),
        completedAt: new Date(),
        selfAssessmentLevel: 'experience',
        completedMilestoneIds: ['m1', 'm2', 'm3'],
      }
    };
  }
  if (cleanEmail === 'liam.zhao@example.com') {
    return {
      [devopsTrackId]: createBaseTrack(devopsTrackId, 1),
    };
  }
  return {};
};

export const TrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, saveEnrollments } = useAuth();
  
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTrackProgress>>({});
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionTrackTitle, setCompletionTrackTitle] = useState('');

  // Synchronize loading and user profile switching
  useEffect(() => {
    const email = user ? user.email : 'guest';
    if (email === currentUserEmail) return;

    const lessonKey = `lesson_progress_v2_${email}`;
    const trackKey = `track_progress_v2_${email}`;

    let savedLessons = localStorage.getItem(lessonKey);
    let savedTrack = localStorage.getItem(trackKey);

    if (savedLessons === null && user) {
      const initialLessons = getInitialLessonsForUser(user.email);
      const initialTrack = getInitialTrackForUser(user.email);
      savedLessons = JSON.stringify(initialLessons);
      savedTrack = JSON.stringify(initialTrack);
      localStorage.setItem(lessonKey, savedLessons);
      localStorage.setItem(trackKey, savedTrack);
    }

    const parsedLessons = savedLessons ? JSON.parse(savedLessons) : [];
    const parsedTrack = savedTrack ? JSON.parse(savedTrack) : {};

    setCompletedLessonIds(parsedLessons);
    setProgressMap(parsedTrack);
    setCurrentUserEmail(email);
  }, [user, currentUserEmail]);

  // Persist Lesson Progress safely
  useEffect(() => {
    const email = user ? user.email : 'guest';
    if (email !== currentUserEmail) return;
    localStorage.setItem(`lesson_progress_v2_${email}`, JSON.stringify(completedLessonIds));
  }, [completedLessonIds, user, currentUserEmail]);

  // Persist Track Progress safely
  useEffect(() => {
    const email = user ? user.email : 'guest';
    if (email !== currentUserEmail) return;
    localStorage.setItem(`track_progress_v2_${email}`, JSON.stringify(progressMap));
  }, [progressMap, user, currentUserEmail]);

  // Synchronize dynamic progress and lesson statuses in the COURSES and TRACKS arrays in memory
  useEffect(() => {
    COURSES.forEach(c => {
      let previousModuleCompleted = true; // First module is unlocked by default

      c.modules.forEach((mod, modIdx) => {
        // Determine if this module is unlocked (either first module, or previous module was completed)
        const isUnlocked = modIdx === 0 || previousModuleCompleted;

        if (!isUnlocked) {
          mod.status = 'Locked';
          mod.lessons.forEach(l => {
            l.status = 'locked';
          });
          return;
        }

        let allLessonsCompleted = true;
        let foundFirstIncomplete = false;

        mod.lessons.forEach(l => {
          const isCompleted = completedLessonIds.includes(l.id);

          if (isCompleted) {
            l.status = 'completed';
          } else {
            allLessonsCompleted = false;
            if (!foundFirstIncomplete) {
              l.status = 'in_progress';
              foundFirstIncomplete = true;
            } else {
              l.status = 'locked';
            }
          }
        });

        if (allLessonsCompleted) {
          mod.status = 'Completed';
          previousModuleCompleted = true;
        } else {
          mod.status = 'In progress';
          previousModuleCompleted = false;
        }
      });

      // Calculate dynamic course progress
      c.progress = calculateCourseProgress(c as unknown as Course, completedLessonIds);
    });

    TRACKS.forEach(t => {
      t.progress = calculateTrackProgress(t as unknown as CareerTrack, COURSES as unknown as Course[], completedLessonIds);
    });
  }, [completedLessonIds]);

  const updateTrack = useCallback((trackId: string, updater: (prev: UserTrackProgress) => UserTrackProgress) => {
    setProgressMap(prev => {
      const email = user ? user.email : 'guest';
      const current = prev[trackId] || {
        userId: email,
        trackId,
        enrolledAt: null,
        completedAt: null,
        selfAssessmentLevel: 'nothing' as SelfAssessmentLevel,
        completedMilestoneIds: [],
        bookmarkedAt: null,
      };
      return { ...prev, [trackId]: updater(current) };
    });
  }, [user]);

  const enrollInTrack = useCallback((trackId: string) => {
    updateTrack(trackId, prev => ({
      ...prev,
      enrolledAt: prev.enrolledAt ?? new Date(),
    }));

    const track = TRACKS.find(t => t.id === trackId);
    if (track) {
      track.enrolled = true;
      saveEnrollments();
    }
  }, [updateTrack, saveEnrollments]);

  const bookmarkTrack = useCallback((trackId: string) => {
    updateTrack(trackId, prev => ({
      ...prev,
      bookmarkedAt: prev.bookmarkedAt ? null : new Date(),
    }));
  }, [updateTrack]);

  const setSelfAssessment = useCallback((trackId: string, level: SelfAssessmentLevel) => {
    updateTrack(trackId, prev => ({ ...prev, selfAssessmentLevel: level }));
  }, [updateTrack]);

  const completeMilestone = useCallback((trackId: string, milestoneId: string) => {
    updateTrack(trackId, prev => {
      const ids = prev.completedMilestoneIds.includes(milestoneId)
        ? prev.completedMilestoneIds
        : [...prev.completedMilestoneIds, milestoneId];
      return { ...prev, completedMilestoneIds: ids };
    });
  }, [updateTrack]);

  const completeLesson = useCallback((lessonId: string) => {
    setCompletedLessonIds(prevLessons => {
      if (prevLessons.includes(lessonId)) return prevLessons;
      const nextLessons = [...prevLessons, lessonId];
      
      setProgressMap(currentMap => {
        const freshMap = { ...currentMap };
        let changed = false;

        Object.keys(freshMap).forEach(tId => {
          const track = TRACKS.find(t => t.id === tId);
          if (!track || !freshMap[tId].enrolledAt) return;

          const progress = freshMap[tId];
          track.milestones.forEach(ms => {
            ms.courses.forEach(c => {
              const courseData = COURSES.find(cd => cd.id === c.id);
              if (courseData && isCourseCompleted(courseData as unknown as Course, nextLessons)) {
                const msUiId = `${ms.id}-${c.id}`;
                if (!progress.completedMilestoneIds.includes(msUiId)) {
                  progress.completedMilestoneIds = [...progress.completedMilestoneIds, msUiId];
                  changed = true;
                }
              }
            });
          });
        });

        return changed ? freshMap : currentMap;
      });

      return nextLessons;
    });
  }, []);

  const getProgress = useCallback((trackId: string) => {
    return progressMap[trackId] || null;
  }, [progressMap]);

  const getTrackPercentage = useCallback((track: CareerTrack) => {
    return calculateTrackProgress(track as unknown as CareerTrack, COURSES as unknown as Course[], completedLessonIds);
  }, [completedLessonIds]);

  const dismissCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
    setCompletionTrackTitle('');
  }, []);

  return (
    <TrackContext.Provider value={{
      progressMap,
      completedLessonIds,
      enrollInTrack,
      bookmarkTrack,
      setSelfAssessment,
      completeMilestone,
      completeLesson,
      getProgress,
      getTrackPercentage,
      showCompletionModal,
      completionTrackTitle,
      dismissCompletionModal,
    }}>
      {children}
    </TrackContext.Provider>
  );
};

