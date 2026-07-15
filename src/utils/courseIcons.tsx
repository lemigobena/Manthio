import { createElement } from 'react';
import type React from 'react';
import { Globe } from 'lucide-react';
import type { LessonType } from '../types';
import { getCourseIconType, getLessonIconType } from './courseIconUtils';

// Component wrappers around the icon lookups in courseIconUtils.ts.
// Kept in their own file so it only exports components (react-refresh rule);
// createElement avoids the "component created during render" pattern.

/** Rendered course icon. `hint` is the topic text (e.g. `${title} ${id}`);
 *  style with `className` as usual. */
export const CourseIcon: React.FC<{ hint: string; className?: string }> = ({ hint, className = 'w-4 h-4' }) =>
  createElement(getCourseIconType(hint), { className });

/** Rendered lesson-type icon; style with `className` as usual. */
export const LessonIcon: React.FC<{ type: LessonType; className?: string }> = ({ type, className = 'w-3.5 h-3.5' }) =>
  createElement(getLessonIconType(type), { className });

/** Icon for cross-course/general contexts (e.g. the "general" community channel). */
export const GeneralIcon = Globe;
