export type SessionState = 'pre' | 'live' | 'post';

export interface LiveSessionData {
  id: string;
  title: string;
  description: string;
  trainer: {
    name: string;
    role: string;
    avatar: string;
    status: string;
  };
  startTime: string; // ISO String
  duration: number; // minutes
  state: SessionState;
  tags: string[];
  materials: { name: string; size: string }[];
  recording?: string;
  notes?: string[];
  assignments?: { id: number; title: string; status: string }[];
}

export const liveSessionsData: Record<string, LiveSessionData> = {
  'session-1': {
    id: 'session-1',
    title: "Advanced React Patterns & Performance",
    description: "Deep dive into React 19's new features including useActionState, better hydration, and architecture patterns for large-scale enterprise apps.",
    trainer: {
      name: "Dr. Sarah Chen",
      role: "Lead Frontend Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      status: "Available"
    },
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 90,
    state: 'post',
    tags: ['React 19', 'Performance', 'Architecture'],
    materials: [
      { name: "Preparation Slides.pdf", size: "2.4 MB" },
      { name: "Code Snippets.zip", size: "1.1 MB" }
    ],
    recording: "https://example.com/recording",
    notes: [
      "React Compiler will handle memoization automatically in most cases.",
      "The useActionState hook simplifies form handling significantly.",
      "Server Components are recommended for data fetching to reduce bundle size."
    ],
    assignments: [
      { id: 1, title: "Refactor existing form to use useActionState", status: "pending" },
      { id: 2, title: "Implement a Server Component for the dashboard", status: "pending" }
    ]
  },
  'session-2': {
    id: 'session-2',
    title: "Building Real-Time Apps with WebSockets",
    description: "Learn how to build scalable real-time applications using WebSockets, handling reconnection, state synchronization, and race conditions.",
    trainer: {
      name: "Marcus Johnson",
      role: "Senior Backend Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      status: "In Session"
    },
    startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    duration: 60,
    state: 'live',
    tags: ['WebSockets', 'Real-time', 'Node.js'],
    materials: [
      { name: "WebSocket Architecture.pdf", size: "1.8 MB" },
      { name: "Starter Repo Link.txt", size: "1 KB" }
    ],
  },
  'session-3': {
    id: 'session-3',
    title: "Mastering Tailwind CSS v4",
    description: "Explore the new features of Tailwind CSS v4, including the new engine, CSS variables approach, and performance improvements.",
    trainer: {
      name: "Elena Rodriguez",
      role: "UI/UX Developer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      status: "Offline"
    },
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    duration: 45,
    state: 'pre',
    tags: ['Tailwind', 'CSS', 'Design Systems'],
    materials: [
      { name: "Pre-reading: Tailwind v4 Alpha.pdf", size: "3.2 MB" }
    ],
  },
  'session-4': {
    id: 'session-4',
    title: "Next.js App Router Masterclass",
    description: "Comprehensive guide to the Next.js App Router. We'll cover layouts, loading states, error handling, and server actions.",
    trainer: {
      name: "Dr. Sarah Chen",
      role: "Lead Frontend Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      status: "Offline"
    },
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    duration: 120,
    state: 'pre',
    tags: ['Next.js', 'React', 'Fullstack'],
    materials: [
      { name: "Next.js App Router Cheat Sheet.pdf", size: "1.5 MB" }
    ],
  },
  'session-5': {
    id: 'session-5',
    title: "Mastering Framer Motion",
    description: "Learn how to create fluid, beautiful animations in React using Framer Motion.",
    trainer: {
      name: "David Kim",
      role: "Creative Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      status: "In Session"
    },
    startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    duration: 90,
    state: 'live',
    tags: ['Animation', 'React', 'Framer Motion'],
    materials: [{ name: "Animation Curves.pdf", size: "2.1 MB" }],
  },
  'session-6': {
    id: 'session-6',
    title: "GraphQL API Design",
    description: "Best practices for designing scalable GraphQL APIs, handling authentication, and resolving N+1 problems.",
    trainer: {
      name: "Anita Desai",
      role: "Backend Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      status: "In Session"
    },
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: 60,
    state: 'live',
    tags: ['GraphQL', 'API', 'Backend'],
    materials: [{ name: "Schema Design Patterns.pdf", size: "1.2 MB" }],
  },
  'session-7': {
    id: 'session-7',
    title: "Advanced TypeScript Techniques",
    description: "Dive deep into advanced type manipulation, conditional types, and template literal types in TypeScript.",
    trainer: {
      name: "Alex Johnson",
      role: "TypeScript Core Team",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      status: "Offline"
    },
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    state: 'pre',
    tags: ['TypeScript', 'Advanced', 'Types'],
    materials: [],
  },
  'session-8': {
    id: 'session-8',
    title: "Web Accessibility (A11y) Deep Dive",
    description: "Ensure your applications are usable by everyone. We'll cover ARIA, keyboard navigation, and screen reader testing.",
    trainer: {
      name: "Maria Garcia",
      role: "A11y Specialist",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      status: "Offline"
    },
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    state: 'pre',
    tags: ['A11y', 'HTML', 'Accessibility'],
    materials: [{ name: "WCAG Checklist.pdf", size: "0.8 MB" }],
  },
  'session-9': {
    id: 'session-9',
    title: "Introduction to WebGL and Three.js",
    description: "Start building 3D experiences on the web using WebGL and the Three.js library.",
    trainer: {
      name: "David Kim",
      role: "Creative Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      status: "Available"
    },
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    state: 'post',
    tags: ['WebGL', 'Three.js', '3D'],
    materials: [],
    recording: "https://example.com/recording9"
  },
  'session-10': {
    id: 'session-10',
    title: "State Management in 2026",
    description: "Comparing Redux Toolkit, Zustand, Jotai, and native React context. When to use which tool.",
    trainer: {
      name: "Dr. Sarah Chen",
      role: "Lead Frontend Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      status: "Available"
    },
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    state: 'post',
    tags: ['React', 'State', 'Zustand', 'Redux'],
    materials: [{ name: "Comparison Matrix.pdf", size: "1.1 MB" }],
    recording: "https://example.com/recording10"
  },
  'session-11': {
    id: 'session-11',
    title: "Serverless Node.js with AWS Lambda",
    description: "Deploying and scaling Node.js applications effortlessly using AWS Lambda and Serverless Framework.",
    trainer: {
      name: "Marcus Johnson",
      role: "Senior Backend Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      status: "Available"
    },
    startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    state: 'post',
    tags: ['Node.js', 'AWS', 'Serverless'],
    materials: [],
    recording: "https://example.com/recording11"
  },
  'session-12': {
    id: 'session-12',
    title: "Building Micro-Frontends",
    description: "Architectural patterns for splitting monolithic frontend applications into manageable micro-frontends using Module Federation.",
    trainer: {
      name: "Anita Desai",
      role: "Backend Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      status: "Available"
    },
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    state: 'post',
    tags: ['Architecture', 'Webpack', 'Micro-Frontends'],
    materials: [{ name: "Webpack Configs.zip", size: "2.3 MB" }],
    recording: "https://example.com/recording12"
  },
  'session-13': {
    id: 'session-13',
    title: "CSS Grid and Flexbox Masterclass",
    description: "Deep dive into advanced CSS layouts, subgrid, and modern responsive design without media queries.",
    trainer: {
      name: "Elena Rodriguez",
      role: "UI/UX Developer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      status: "Available"
    },
    startTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    state: 'post',
    tags: ['CSS', 'Layout', 'Grid', 'Flexbox'],
    materials: [{ name: "Layout Cheatsheet.pdf", size: "3.5 MB" }],
    recording: "https://example.com/recording13"
  }
};
