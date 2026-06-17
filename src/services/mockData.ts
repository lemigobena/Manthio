import type { Course, CareerTrack, ResourceFile, ForumThread, Trainer } from '../types';

export const TRAINERS: Record<string, Trainer> = {
  'david-pinezich': {
    id: 'david-pinezich',
    name: 'David Pinezich',
    title: 'Experienced IT Architect & Python Trainer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150',
    bio: 'Experienced IT architect and trainer specializing in Python, Cloud Architecture, and Enterprise Security. David has over 15 years of industry experience and has led bootcamps for major corporations in Switzerland.',
    linkedIn: 'https://linkedin.com/in/davidpinezich',
    website: 'https://apigenio.ch'
  }
};

export const COURSES: Course[] = [
  {
    id: 'python-bootcamp',
    title: 'Python Bootcamp',
    description: 'From zero to confident Python developer. Learn syntax, structures, functions, and complete your first real project with direct access to an experienced instructor.',
    longDescription: 'Our two-day Python Bootcamp takes you from zero to confident Python developer. You\'ll learn alongside other students with direct access to an experienced instructor. From basic syntax through data structures and functions to your first real project — all with live feedback and hands-on exercises.',
    level: 'Foundation',
    format: 'flipped',
    xpReward: 600,
    price: 'CHF 1\'000.00',
    rating: 4.8,
    ratingCount: 124,
    enrolled: true,
    progress: 26,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Write clean, readable Python code following PEP 8 guidelines.',
      'Work with variables, operators, and build control flows using loops and conditionals.',
      'Utilize standard data structures like Lists, Tuples, Sets, and Dictionaries.',
      'Structure code with reusable Functions and explore scopes.',
      'Organize code using Modules, Packages, and virtual environments.',
      'Handle errors gracefully and read/write file systems.',
      'Build a command-line interface (CLI) application as a capstone project.'
    ],
    modules: [
      {
        id: 'py-mod-1',
        number: 1,
        title: 'Setup & Python Basics',
        description: 'Installation, virtual environments, REQ-REPL, basic syntax, variables, data types and your first scripts.',
        duration: '1.5h',
        status: 'Completed',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-1-1', title: 'Python installieren & IDE einrichten', type: 'Video', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-1-2', title: 'REPL, Skripte & venv', type: 'Video', duration: '25min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-1-3', title: 'Variablen & Datentypen', type: 'Article', duration: '25min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-1-4', title: 'Dein erstes Skript', type: 'Code', duration: '20min', status: 'completed', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'py-mod-2',
        number: 2,
        title: 'Operators, Strings & I/O',
        description: 'Basic operators (arithmetic, logical), string formatting, parsing console inputs and simple console printing.',
        duration: '1.5h',
        status: 'Completed',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-2-1', title: 'Arithmetische & logische Operatoren', type: 'Video', duration: '15min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-2-2', title: 'String-Manipulation & f-Strings', type: 'Article', duration: '30min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-2-3', title: 'Konsoleneingabe und -ausgabe', type: 'Code', duration: '25min', status: 'completed', required: true, bloomLevel: 'Apply' },
          { id: 'py-les-2-4', title: 'Wiederholungsquiz: Grundlagen', type: 'Quiz', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember' }
        ]
      },
      {
        id: 'py-mod-3',
        number: 3, // In-person session Workshop A
        title: 'Workshop A: Setup Verification & Review',
        description: 'Synchronous in-person review of modules 1-2. Troubleshooting setups, live code reviews, and pair debugging.',
        duration: '0.5 day',
        status: 'In progress',
        type: 'In-person session',
        scheduledTime: 'Saturday, 09:00 - 12:30',
        venue: 'apigenio Training Centre, Muri',
        lessons: [
          { id: 'py-les-3-1', title: 'Setup verification, first scripts live', type: 'Live Event', duration: '120min', status: 'in_progress', required: true, bloomLevel: 'Analyse' },
          { id: 'py-les-3-2', title: 'Gemeinsames Debugging & Peer Review', type: 'Live Event', duration: '90min', status: 'not_started', required: true, bloomLevel: 'Analyse' }
        ]
      },
      {
        id: 'py-mod-4',
        number: 4,
        title: 'Data Structures',
        description: 'Operations with Python list, tuple, sets and dictionary structures. Performance considerations.',
        duration: '1.5h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-4-1', title: 'Listen & Tuples im Detail', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-4-2', title: 'Dictionaries & Sets', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-4-3', title: 'Übung: Datenstrukturen manipulieren', type: 'Code', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'py-mod-5',
        number: 5,
        title: 'Control Flow & Comprehensions',
        description: 'For & while loops, if-elif-else statements, and Python\'s powerful list and dictionary comprehensions.',
        duration: '1.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-5-1', title: 'Bedingungen & Schleifen', type: 'Video', duration: '25min', status: 'locked', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-5-2', title: 'List-Comprehensions', type: 'Article', duration: '20min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-5-3', title: 'Übung: Schleifen und Comprehensions', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'py-mod-6',
        number: 6,
        title: 'Functions & Scope',
        description: 'Defining functions, arguments (*args, **kwargs), return values, global vs local scope, and lambda functions.',
        duration: '1.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-6-1', title: 'Funktionen definieren', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-6-2', title: 'Lokaler vs globaler Scope', type: 'Article', duration: '20min', status: 'locked', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-6-3', title: 'Worked Example: Faded Guidance Exercise', type: 'Code', duration: '40min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'py-mod-7',
        number: 7,
        title: 'Modules, Packages & Environments',
        description: 'Importing modules, structuring packages, pip package manager, and utilizing virtual environment configurations.',
        duration: '1.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-7-1', title: 'Standardbibliothek nutzen', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-7-2', title: 'Eigene Module schreiben', type: 'Article', duration: '25min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-7-3', title: 'Pip & requirements.txt', type: 'Video', duration: '20min', status: 'locked', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'py-mod-8',
        number: 8,
        title: 'Error Handling & File I/O',
        description: 'Try-except blocks, handling multiple exceptions, custom exceptions, and reading/writing text & CSV files.',
        duration: '1.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'py-les-8-1', title: 'Ausnahmebehandlung (try/except)', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-8-2', title: 'Dateien lesen & schreiben', type: 'Article', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-8-3', title: 'Übung: CSV-Daten verarbeiten', type: 'Code', duration: '30min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'py-mod-9',
        number: 9, // Workshop B
        title: 'Workshop B: Capstone Project & Feedback',
        description: 'Synchronous in-person final session. Presenting your expense CLI project, pair coding reviews, and final trainer feedback.',
        duration: '0.5 day',
        status: 'Locked',
        type: 'In-person session',
        scheduledTime: 'Saturday, 13:30 - 17:00',
        venue: 'apigenio Training Centre, Muri',
        lessons: [
          { id: 'py-les-9-1', title: 'Project Presentation & Code Critique', type: 'Live Event', duration: '120min', status: 'locked', required: true, bloomLevel: 'Evaluate' },
          { id: 'py-les-9-2', title: 'Feedback & Platform Certificates', type: 'Live Event', duration: '90min', status: 'locked', required: true, bloomLevel: 'Create' }
        ]
      }
    ]
  },
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'An introduction to neural networks, embeddings, and prompting techniques for technical professionals.',
    level: 'Intermediate',
    format: 'self-paced',
    xpReward: 400,
    price: 'CHF 490.00',
    rating: 4.9,
    ratingCount: 82,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    modules: []
  },
  {
    id: 'react-web-development',
    title: 'Webentwicklung mit React',
    description: 'Learn dynamic UI state management, hooks, routing, and structuring scalable Single Page Applications with React.',
    level: 'Intermediate',
    format: 'self-paced',
    xpReward: 450,
    price: 'CHF 390.00',
    rating: 4.7,
    ratingCount: 65,
    enrolled: true,
    progress: 45,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    modules: []
  }
];

export const TRACKS: CareerTrack[] = [
  {
    id: 'python-production-engineer',
    title: 'Become a Python Production Engineer',
    outcomeStatement: 'Master Python from base syntax to production-grade services, testing structures, database integrations, and automated pipelines.',
    estimatedTime: '36 hours + 2 in-person sessions',
    coursesCount: 3,
    progress: 38,
    milestones: [
      { id: 'mile-1', title: 'Start with Basics', description: 'Complete Python Bootcamp to gain foundational syntax skills.', courseIds: ['python-bootcamp'], status: 'active' },
      { id: 'mile-2', title: 'Object-Oriented Programming', description: 'Dive into intermediate OOP and design patterns.', courseIds: [], status: 'locked' },
      { id: 'mile-3', title: 'Production & APIs', description: 'Build REST APIs and deploy with Docker.', courseIds: [], status: 'locked' }
    ]
  }
];

export const RESOURCES: ResourceFile[] = [
  { id: 'file-1', name: 'Python Bootcamp - Modul 1 Unterlagen', type: 'pdf', courseName: 'Python Bootcamp', uploadDate: '15. Jan 2026', accessLevel: 'All Learners', size: '2.4 MB' },
  { id: 'file-2', name: 'Vorlesungsskript KI Woche 03.pdf', type: 'pdf', courseName: 'KI Grundlagen', uploadDate: 'Gestern, 14:30', accessLevel: 'Cohort Only', size: '1.8 MB' },
  { id: 'file-3', name: 'React Hooks Crashcourse.mp4', type: 'video', courseName: 'Webentwicklung mit React', uploadDate: '10. Jan 2026', accessLevel: 'All Learners', size: '45 MB' },
  { id: 'file-4', name: 'Python_Übungen_Set_2.zip', type: 'archive', courseName: 'Python Bootcamp', uploadDate: '08. Jan 2026', accessLevel: 'All Learners', size: '1.2 MB' },
  { id: 'file-5', name: 'IT Security Cheatsheet.pdf', type: 'pdf', courseName: 'IT Security Basics', uploadDate: '05. Jan 2026', accessLevel: 'All Learners', size: '420 KB' }
];

export const FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Was ist der Unterschied zwischen einer Liste und einem Tuple?',
    author: 'Marc K.',
    body: 'Ich lerne gerade das Datenstruktur-Modul in Python und frage mich, wann man ein Tuple statt einer Liste verwenden sollte. Die Unveränderlichkeit ist klar, aber gibt es Performance-Unterschiede oder andere Faustregeln?',
    category: 'Python Bootcamp',
    moduleName: 'Data Structures',
    upvotes: 8,
    commentsCount: 3,
    hasAcceptedAnswer: true,
    timestamp: '14. Jun 2026'
  },
  {
    id: 'thread-2',
    title: 'Fehlermeldung bei "venv" Aktivierung unter Windows PowerShell',
    author: 'Tanya S.',
    body: 'Wenn ich versuche mein venv zu aktivieren via `.\\venv\\Scripts\\Activate.ps1`, bekomme ich einen Execution_Policies Fehler von Windows. Was kann ich tun?',
    category: 'Python Bootcamp',
    moduleName: 'Setup & Python Basics',
    upvotes: 12,
    commentsCount: 5,
    hasAcceptedAnswer: true,
    timestamp: 'Gestern, 18:22',
    isAnonymous: false
  }
];
