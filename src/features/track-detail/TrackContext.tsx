import React, { useState, useCallback, useEffect } from 'react';
import { TRACKS, COURSES } from '../../services/mockData';
import { isCourseCompleted, calculateTrackProgress } from '../../services/progressUtils';
import type { Course, SelfAssessmentLevel, UserTrackProgress, CareerTrack } from '../../types';
import { TrackContext } from './TrackContextStore';

// Force-clean stale HMR-polluted localStorage keys
['track_progress_v3','track_progress_v4','track_progress_v5','track_progress_v6'].forEach(k => localStorage.removeItem(k));

const TRACK_STORAGE_KEY = 'track_progress_v7';
const LESSON_STORAGE_KEY = 'lesson_progress_v3';

function loadTrackProgress(): Record<string, UserTrackProgress> {
  try {
    const raw = localStorage.getItem(TRACK_STORAGE_KEY);
    if (!raw) {
      return {
        'python-production-engineer': {
          userId: 'u1',
          trackId: 'python-production-engineer',
          enrolledAt: new Date(Date.now()),
          completedAt: null,
          selfAssessmentLevel: 'nothing',
          completedMilestoneIds: [
            'py-mile-1-python-bootcamp',
            'py-mile-1-test-course',
            'py-mile-2-git-version-control',
            'py-mile-2-git-essentials',
            'py-mile-3-advanced-python',
            'py-mile-3-fastapi-backend',
            'py-mile-3-apache-spark-basics'
          ],
          bookmarkedAt: null,
        },
        'cloud-devops-engineer': {
          userId: 'u1',
          trackId: 'cloud-devops-engineer',
          enrolledAt: new Date(Date.now() - 1000000),
          completedAt: null,
          selfAssessmentLevel: 'nothing',
          completedMilestoneIds: [],
          bookmarkedAt: null,
        },
        'fullstack-javascript': {
          userId: 'u1',
          trackId: 'fullstack-javascript',
          enrolledAt: new Date(Date.now()),
          completedAt: null,
          selfAssessmentLevel: 'nothing',
          completedMilestoneIds: ['fs-mile-1-advanced-python'],
          bookmarkedAt: null,
        },
        'web-development-basics': {
          userId: 'u1',
          trackId: 'web-development-basics',
          enrolledAt: new Date(Date.now() - 10000000),
          completedAt: new Date(Date.now() - 5000000),
          selfAssessmentLevel: 'nothing',
          completedMilestoneIds: [
            'web-mile-1-command-line-basics',
            'web-mile-2-git-essentials',
            'web-mile-3-linux-administration'
          ],
          bookmarkedAt: null,
        }
      };
    }
    const parsed = JSON.parse(raw);
    for (const key of Object.keys(parsed)) {
      if (parsed[key].enrolledAt) parsed[key].enrolledAt = new Date(parsed[key].enrolledAt);
      if (parsed[key].completedAt) parsed[key].completedAt = new Date(parsed[key].completedAt);
      if (parsed[key].bookmarkedAt) parsed[key].bookmarkedAt = new Date(parsed[key].bookmarkedAt);
    }
    return parsed;
  } catch {
    return {};
  }
}

function loadLessonProgress(): string[] {
  try {
    const raw = localStorage.getItem(LESSON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const TrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressMap, setProgressMap] = useState<Record<string, UserTrackProgress>>(() => loadTrackProgress());
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => loadLessonProgress());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionTrackTitle, setCompletionTrackTitle] = useState('');

  // Persist Lesson Progress
  useEffect(() => {
    localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(completedLessonIds));
  }, [completedLessonIds]);

  // Persist Track Progress
  useEffect(() => {
    localStorage.setItem(TRACK_STORAGE_KEY, JSON.stringify(progressMap));
  }, [progressMap]);

  const updateTrack = useCallback((trackId: string, updater: (prev: UserTrackProgress) => UserTrackProgress) => {
    setProgressMap(prev => {
      const current = prev[trackId] || {
        userId: 'u1',
        trackId,
        enrolledAt: null,
        completedAt: null,
        selfAssessmentLevel: 'nothing' as SelfAssessmentLevel,
        completedMilestoneIds: [],
        bookmarkedAt: null,
      };
      return { ...prev, [trackId]: updater(current) };
    });
  }, []);

  const enrollInTrack = useCallback((trackId: string) => {
    updateTrack(trackId, prev => ({
      ...prev,
      enrolledAt: prev.enrolledAt ?? new Date(),
    }));
  }, [updateTrack]);

  const bookmarkTrack = useCallback((trackId: string) => {
    updateTrack(trackId, prev => ({
      ...prev,
      bookmarkedAt: prev.bookmarkedAt ? null : new Date(),
    }));
  }, [updateTrack]);

  const restartTrack = useCallback((trackId: string) => {
    updateTrack(trackId, prev => ({
      ...prev,
      completedAt: null,
      completedMilestoneIds: [],
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
      
      // REQ-PROGRESS-001: Sync milestones immediately on lesson completion
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
    if (track.progress === 100) return 100;
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
      restartTrack,
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
