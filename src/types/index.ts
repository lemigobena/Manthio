export type CourseFormat = 'self-paced' | 'cohort' | 'flipped' | "Multiple formats";
export type CourseLevel = 'Foundation' | 'Intermediate' | 'Advanced';
export type LessonType = 'Video' | 'Article' | 'Quiz' | 'Code' | 'H5P' | 'Assignment' | 'External' | 'Live Event' | 'PDF';
export type LessonStatus = 'completed' | 'in_progress' | 'not_started' | 'locked';
export type ModuleStatus = 'Completed' | 'In progress' | 'Open' | 'Locked';
export type ModuleType = 'Self-study' | 'Live online session' | 'In-person session';
export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Evaluate' | 'Create';

export interface FormatOption {
  format: CourseFormat;
  price: string;
  features: {
    aiTutor: boolean;
    peerCohort: boolean;
    inPerson: boolean;
    certificate: boolean;
  };
  bundledSubscription?: {
    durationMonths: number;
    valueAmount: string;
    label: string;
  };
  cohortProgress?: {
    minParticipants: number;
    currentParticipants: number;
    maxParticipants: number;
    confirmationDate: string;
  };
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  linkedIn?: string;
  website?: string;
}

export interface SandboxFile {
  path: string;
  code: string;
  hidden?: boolean;
}

export interface SandboxTest {
  id: string;
  name: string;
  code: string;
  hidden?: boolean;
}

export interface SandboxData {
  language: 'python' | 'javascript' | 'sql';
  files: SandboxFile[];
  tests: SandboxTest[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  status: LessonStatus;
  difficulty?: 1 | 2 | 3;
  bloomLevel?: BloomLevel;
  required: boolean;
  contentUrl?: string;
  estimatedRemainingTime?: string;
  microChunkable?: boolean;
  checkpoints?: number;
  sandboxData?: SandboxData;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  status: ModuleStatus;
  type: ModuleType;
  lessons: Lesson[];
  scheduledTime?: string;
  venue?: string;
  availableDate?: string;
  prerequisites?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  level: CourseLevel;
  format: CourseFormat;
  topic?: string;
  duration: string;
  language?: string;
  tags?: ('Bestseller' | 'New' | 'Limited cohort' | 'Advanced' | "Intensive")[];
  priceStatus?: 'paid' | 'included' | 'employer';
  xpReward: number;
  price: string;
  rating?: number;
  ratingCount?: number;
  enrolled: boolean;
  progress: number; // percentage
  imageUrl: string;
  trainer: Trainer;
  learningOutcomes?: string[];
  modules: Module[];
  startDate?: string;
  availableFormats?: FormatOption[];
  reviews?: Review[];
  bundledSubscription?: {
    durationMonths: number;
    valueAmount: string;
    label: string;
  };
  cohortProgress?: {
    minParticipants: number;
    currentParticipants: number;
    maxParticipants: number;
    confirmationDate: string;
  };
  preCourseRequirements?: {
    hardware?: string[];
    software?: string[];
    knowledge?: string[];
  };
  cancellationPolicy?: string;
}

export interface CareerTrack {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: CourseLevel;
  tags?: string[];
  outcomeStatement: string;
  estimatedTime: string;
  coursesCount: number;
  progress: number; // percentage
  enrolled: boolean;
  milestones: {
    id: string;
    title: string;
    description: string;
    courses: {
      id: string;
      isOptional?: boolean;
    }[];
    status: 'completed' | 'active' | 'locked';
  }[];
  selfAssessmentOptions?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  currentXpInLevel: number;
  xpNeededForNextLevel: number;
  streak: number;
  lastActiveDate?: string;
  streakFreezeAvailable: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor' | 'system';
  text: string;
  timestamp: string;
  source?: 'Course docs' | 'Cloud AI';
  documents?: {
    title: string;
    location: string;
    url: string;
  }[];
}

export interface ResourceFile {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'archive' | 'notebook' | 'code' | 'office' | 'image';
  courseName: string;
  uploadDate: string;
  accessLevel: 'All Learners' | 'Trainers Only' | 'Cohort Only';
  size: string;
  downloadUrl?: string;
  realContent?: string;
  url?: string;
}

export interface ForumReply {
  id: string;
  author: string;
  avatar?: string;
  body: string;
  timestamp: string;
  upvotes: number;
  isAcceptedAnswer?: boolean;
  isAiSuggested?: boolean;
  isAnonymous?: boolean;
}

export interface ChannelMessage {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  body: string;
  category: string; // The course name
  moduleName?: string;
  tags?: string[];
  upvotes: number;
  replies: ForumReply[];
  hasAcceptedAnswer: boolean;
  timestamp: string;
  isAnonymous?: boolean;
}

export interface ForumChannel {
  id: string;
  name: string; // e.g. "python-bootcamp"
  courseId: string;
  description?: string;
  isJoined: boolean;
  messages: ChannelMessage[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  helpfulCount: number;
}
