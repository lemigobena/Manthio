/**
 * Utility functions to calculate consistent progress percentages across courses and tracks.
 * Calculation is based on the count of completed lesson IDs.
 */

export interface Lesson {
  id: string;
  required?: boolean;
}

export interface Module {
  id: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  modules: Module[];
}

export interface Milestone {
  courses: { id: string; isOptional?: boolean }[];
}

export interface Track {
  milestones: Milestone[];
}

/**
 * Calculates the progress percentage for a single module.
 */
export function calculateModuleProgress(module: Module, completedLessonIds: string[]): number {
  if (!module.lessons || module.lessons.length === 0) return 0;
  
  const completedCount = module.lessons.filter(l => completedLessonIds.includes(l.id)).length;
  return Math.round((completedCount / module.lessons.length) * 100);
}

/**
 * Calculates the progress percentage for an entire course.
 */
export function calculateCourseProgress(course: Course, completedLessonIds: string[]): number {
  const allLessons = course.modules.flatMap(m => m.lessons);
  if (allLessons.length === 0) return 0;
  
  const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
  return Math.round((completedCount / allLessons.length) * 100);
}

/**
 * Calculates the progress percentage for a career track based on its constituent courses.
 * Only non-optional courses are factored into the global track percentage logic.
 */
export function calculateTrackProgress(track: any, allCourses: Course[], completedLessonIds: string[]): number {
  const trackCourseIds = track.milestones?.flatMap((ms: any) =>
    ms.courses.filter((c: any) => !c.isOptional).map((c: any) => c.id)
  ) || [];

  if (trackCourseIds.length === 0) return track.progress || 0;

  const relevantCourses = allCourses.filter(c => trackCourseIds.includes(c.id));
  const allLessons = relevantCourses.flatMap(c => c.modules?.flatMap(m => m.lessons) || []);

  if (allLessons.length === 0) return track.progress || 0;

  const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
  const calculated = Math.round((completedCount / allLessons.length) * 100);
  
  return Math.max(track.progress || 0, calculated);
}

/**
 * Checks if a course is fully completed.
 */
export function isCourseCompleted(course: Course, completedLessonIds: string[]): boolean {
  const allLessons = course.modules.flatMap(m => m.lessons);
  if (allLessons.length === 0) return false;
  
  return allLessons.every(l => completedLessonIds.includes(l.id));
}
