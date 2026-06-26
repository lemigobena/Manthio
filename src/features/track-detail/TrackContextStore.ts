import { createContext } from 'react';
import type { CareerTrack, SelfAssessmentLevel, UserTrackProgress } from '../../types';

interface TrackContextType {
  progressMap: Record<string, UserTrackProgress>;
  completedLessonIds: string[];
  enrollInTrack: (trackId: string) => void;
  bookmarkTrack: (trackId: string) => void;
  setSelfAssessment: (trackId: string, level: SelfAssessmentLevel) => void;
  completeMilestone: (trackId: string, milestoneId: string) => void;
  completeLesson: (lessonId: string) => void;
  getProgress: (trackId: string) => UserTrackProgress | null;
  getTrackPercentage: (track: CareerTrack) => number;
  showCompletionModal: boolean;
  completionTrackTitle: string;
  dismissCompletionModal: () => void;
}

export const TrackContext = createContext<TrackContextType | undefined>(undefined);
export type { TrackContextType };
