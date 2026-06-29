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
  preCourseRequirements?: {
    hardware?: string[];
    software?: string[];
    knowledge?: string[];
  };
  preCourseTasks?: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    type: 'setup' | 'video' | 'quiz' | 'check';
  }[];
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

export type H5PType = 'InteractiveVideo' | 'BranchingScenario' | 'DragAndDrop' | 'FillInTheBlanks' | 'MarkTheWords' | 'CoursePresentation' | 'Quiz' | 'Flashcards' | 'Timeline' | 'Composite';

export interface H5PInteractiveVideoData {
  videoUrl: string;
  interactions: {
    time: number;
    type: 'multiple-choice' | 'true-false';
    question: string;
    options: string[];
    correctAnswerIndex: number;
    pauseVideo: boolean;
  }[];
}

export interface H5PBranchingScenarioNode {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  choices: {
    text: string;
    nextId: string | null;
  }[];
}

export interface H5PDragAndDropData {
  backgroundImageUrl?: string;
  dropZones: {
    id: string;
    label: string;
    acceptsIds: string[];
  }[];
  draggableItems: {
    id: string;
    label: string;
    type: 'text' | 'image';
    content: string;
  }[];
}

export interface H5PFillInTheBlanksData {
  text: string; // use __BLANK__ for the blank spaces
  blanks: {
    correctAnswers: string[];
    hint?: string;
  }[];
}

export interface H5PMarkTheWordsData {
  text: string; // The full text
  correctWordIndices: number[]; // Indices of the words that should be marked
}

export interface H5PCoursePresentationData {
  slides: {
    id: string;
    elements: {
      id: string;
      type: 'text' | 'image' | 'video' | 'question';
      content: string; // Simplified payload for slide element
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  }[];
}

export interface H5PQuizData {
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
}

export interface H5PFlashcardsData {
  cards: {
    id: string;
    front: string;
    back: string;
  }[];
}

export interface H5PTimelineData {
  events: {
    id: string;
    year: string;
    title: string;
    description: string;
  }[];
}

export interface H5PCompositeData {
  items: H5PData[];
}

export interface H5PData {
  type: H5PType;
  interactiveVideo?: H5PInteractiveVideoData;
  branchingScenario?: {
    startNodeId: string;
    nodes: H5PBranchingScenarioNode[];
  };
  dragAndDrop?: H5PDragAndDropData;
  fillInTheBlanks?: H5PFillInTheBlanksData;
  markTheWords?: H5PMarkTheWordsData;
  coursePresentation?: H5PCoursePresentationData;
  quiz?: H5PQuizData;
  flashcards?: H5PFlashcardsData;
  timeline?: H5PTimelineData;
  composite?: H5PCompositeData;
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
  h5pData?: H5PData;
  unlockCondition?: string;
  completionCriteria?: {
    type: 'scroll' | 'video_watch' | 'auto'; // 'auto' = no gating, mark done freely
    threshold?: number; // e.g. 0.9 = 90% scroll / video watch
  };
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
  prepModules?: string[]; // IDs of modules that must be completed before this session
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
  preCourseTasks?: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    type: 'setup' | 'video' | 'quiz' | 'check';
  }[];
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

export type SelfAssessmentLevel = 'nothing' | 'basics' | 'experience';

export interface UserTrackProgress {
  userId: string;
  trackId: string;
  enrolledAt: Date | null;
  completedAt: Date | null;
  selfAssessmentLevel: SelfAssessmentLevel;
  completedMilestoneIds: string[];
  bookmarkedAt: Date | null;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  backgroundImage?: string;
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
  source?: 'Course docs' | 'Cloud AI' | 'Sandbox Evaluation' | string;
  sourceLink?: string;
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

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface TutorConversation {
  id: string;
  userId: string;
  title: string;
  preview: string;
  createdAt: string;
}

export type NotificationCategory = 'course' | 'social' | 'system' | 'gamification' | 'marketing';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  critical: boolean;
  link?: string;
}

export interface NotificationPreferences {
  course: { email: boolean; push: boolean; inApp: boolean };
  social: { email: boolean; push: boolean; inApp: boolean };
  system: { email: boolean; push: boolean; inApp: boolean };
  gamification: { email: boolean; push: boolean; inApp: boolean };
  marketing: { email: boolean; push: boolean; inApp: boolean };
  digest: 'instant' | 'daily' | 'weekly';
}
