import type React from 'react';
import { FaPython, FaCode, FaDatabase, FaMobileAlt, FaFigma, FaGithub, FaGitAlt, FaReact, FaLinux, FaDocker, FaJava, FaJs } from 'react-icons/fa';
import { Globe, Play, FileText, HelpCircle, Code2, Users, MousePointerClick, ClipboardEdit, ExternalLink, type LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';
import type { LessonType } from '../types';

// ── Centralized course/topic → icon mapping ──────────────────────────────────
// Single source of truth for the tech-specific icons used across the app
// (Learning Path hero, Community channels, dashboards, …).
// Order matters: more specific keywords must come before generic ones
// (e.g. "github" before "git", "react" before "web").
const ICON_RULES: Array<{ keywords: string[]; Icon: IconType }> = [
  { keywords: ['python'],                              Icon: FaPython },
  { keywords: ['github'],                              Icon: FaGithub },
  { keywords: ['git'],                                 Icon: FaGitAlt },
  { keywords: ['react'],                               Icon: FaReact },
  { keywords: ['javascript', 'typescript', 'node'],    Icon: FaJs },
  { keywords: ['java'],                                Icon: FaJava },
  { keywords: ['linux', 'bash', 'shell'],              Icon: FaLinux },
  { keywords: ['docker', 'kubernetes', 'devops'],      Icon: FaDocker },
  { keywords: ['data', 'sql'],                         Icon: FaDatabase },
  { keywords: ['mobile', 'app', 'ios', 'android'],     Icon: FaMobileAlt },
  { keywords: ['ui', 'ux', 'design', 'figma'],         Icon: FaFigma },
  { keywords: ['web', 'html', 'css'],                  Icon: FaCode },
];

/** Resolve the icon component for a course/channel from free-text hints
 *  (title, id, slug — pass whatever identifies the topic). */
export const getCourseIconType = (...hints: Array<string | undefined>): IconType => {
  const keyword = hints.filter(Boolean).join(' ').toLowerCase();
  return ICON_RULES.find(rule => rule.keywords.some(k => keyword.includes(k)))?.Icon ?? FaCode;
};

/** Rendered course icon. `hint` is the topic text (e.g. `${title} ${id}`);
 *  style with `className` as usual. */
export const CourseIcon: React.FC<{ hint: string; className?: string }> = ({ hint, className = 'w-4 h-4' }) => {
  const Icon = getCourseIconType(hint);
  return <Icon className={className} />;
};

/** Icon for cross-course/general contexts (e.g. the "general" community channel). */
export const GeneralIcon = Globe;

// ── Lesson-type → icon mapping ────────────────────────────────────────────────
// Shared by the Learning Path lesson list, Course Detail curriculum, and the
// Content Player curriculum pane.
const LESSON_TYPE_ICONS: Record<string, LucideIcon> = {
  'Video':      Play,
  'Article':    FileText,
  'Quiz':       HelpCircle,
  'Code':       Code2,
  'Live Event': Users,
  'H5P':        MousePointerClick,
  'Assignment': ClipboardEdit,
  'External':   ExternalLink,
};

export const getLessonIconType = (type: LessonType): LucideIcon =>
  LESSON_TYPE_ICONS[type] ?? FileText;

/** Rendered lesson-type icon; style with `className` as usual. */
export const LessonIcon: React.FC<{ type: LessonType; className?: string }> = ({ type, className = 'w-3.5 h-3.5' }) => {
  const Icon = getLessonIconType(type);
  return <Icon className={className} />;
};
