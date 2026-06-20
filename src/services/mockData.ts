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
    topic: 'Python',
    duration: '2 Days',
    language: 'English',
    tags: ['Bestseller'],
    priceStatus: 'paid',
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
    bundledSubscription: {
      durationMonths: 2,
      valueAmount: 'CHF 60.00',
      label: 'Premium Platform Access'
    },
    cohortProgress: {
      minParticipants: 3,
      currentParticipants: 2,
      maxParticipants: 10,
      confirmationDate: '2026-06-25'
    },
    preCourseRequirements: {
      hardware: ['Laptop with at least 8GB RAM', 'Webcam and Microphone for workshops'],
      software: ['Python 3.11+', 'Visual Studio Code', 'Git installed'],
      knowledge: ['Basic computer literacy', 'Understanding of logic (if/then)', 'Commitment to 4h prep time']
    },
    cancellationPolicy: 'Full refund up to 7 days before start. 50% refund between 7 days and 48 hours. No refund within 48 hours of session start.',
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
          { id: 'py-les-1-1', title: 'Install Python & Set up IDE', type: 'Video', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-1-2', title: 'REPL, Scripts & venv', type: 'Video', duration: '25min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-1-3', title: 'Variables & Data Types', type: 'Article', duration: '25min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-1-4', title: 'Your first script', type: 'Code', duration: '20min', status: 'completed', required: true, bloomLevel: 'Apply' }
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
          { id: 'py-les-2-1', title: 'Arithmetic & Logical Operators', type: 'Video', duration: '15min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-2-2', title: 'String Manipulation & f-Strings', type: 'Article', duration: '30min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-2-3', title: 'Console Input and Output', type: 'Code', duration: '25min', status: 'completed', required: true, bloomLevel: 'Apply' },
          { id: 'py-les-2-4', title: 'Review Quiz: Basics', type: 'Quiz', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember' }
        ]
      },
      {
        id: 'py-mod-3',
        number: 3,
        title: 'Workshop A: Setup Verification & Review',
        description: 'Synchronous in-person review of modules 1-2. Troubleshooting setups, live code reviews, and pair debugging.',
        duration: '0.5 day',
        status: 'In progress',
        type: 'In-person session',
        scheduledTime: 'Saturday, 09:00 - 12:30',
        venue: 'apigenio Training Centre, Muri',
        lessons: [
          { id: 'py-les-3-1', title: 'Setup verification, first scripts live', type: 'Live Event', duration: '120min', status: 'in_progress', required: true, bloomLevel: 'Analyse' },
          { id: 'py-les-3-2', title: 'Joint Debugging & Peer Review', type: 'Live Event', duration: '90min', status: 'not_started', required: true, bloomLevel: 'Analyse' }
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
          { id: 'py-les-4-1', title: 'Lists & Tuples in Detail', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-4-2', title: 'Dictionaries & Sets', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-4-3', title: 'Exercise: Manipulating Data Structures', type: 'Code', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Apply' }
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
          { id: 'py-les-5-1', title: 'Conditions & Loops', type: 'Video', duration: '25min', status: 'locked', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-5-2', title: 'List Comprehensions', type: 'Article', duration: '20min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-5-3', title: 'Exercise: Loops and Comprehensions', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
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
          { id: 'py-les-6-1', title: 'Defining Functions', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-6-2', title: 'Local vs Global Scope', type: 'Article', duration: '20min', status: 'locked', required: true, bloomLevel: 'Remember' },
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
          { id: 'py-les-7-1', title: 'Using the Standard Library', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-7-2', title: 'Writing Own Modules', type: 'Article', duration: '25min', status: 'locked', required: true, bloomLevel: 'Understand' },
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
          { id: 'py-les-8-1', title: 'Exception Handling (try/except)', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-8-2', title: 'Reading & Writing Files', type: 'Article', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'py-les-8-3', title: 'Exercise: Processing CSV Data', type: 'Code', duration: '30min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'py-mod-9',
        number: 9,
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
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Marc S.',
        rating: 5,
        comment: 'The flipped classroom model really works. I could prepare at my own pace and the in-person workshops were incredibly valuable for clearing up my misunderstandings.',
        date: '2026-05-12',
        isVerified: true,
        helpfulCount: 24
      },
      {
        id: 'rev-2',
        userName: 'Elena R.',
        rating: 5,
        comment: 'David is an excellent trainer. The capstone project was challenging but very rewarding. Highly recommended for complete beginners!',
        date: '2026-04-28',
        isVerified: true,
        helpfulCount: 18
      },
      {
        id: 'rev-3',
        userName: 'Thomas K.',
        rating: 4,
        comment: 'Great overview of Python. The modules are structured logically. I would have liked a bit more focus on async programming, but for a Foundation course it is perfect.',
        date: '2026-04-15',
        isVerified: true,
        helpfulCount: 12
      }
    ]
  },
  {
    id: 'advanced-python',
    title: 'Advanced Python Engineering',
    description: 'Master advanced Python paradigms, async programming, and system design. Ideal for developers moving towards senior roles.',
    longDescription: 'This intensive flipped bootcamp focuses on enterprise-grade Python. You will dive deep into asynchronous programming, decorators, context managers, and advanced system architecture. Learn to build high-performance, scalable applications with direct coaching from senior IT architects.',
    level: 'Advanced',
    format: 'flipped',
    topic: 'Python',
    duration: '3 Days',
    language: 'English',
    tags: ['Advanced', 'Intensive'],
    priceStatus: 'paid',
    xpReward: 1200,
    price: 'CHF 1\'800.00',
    rating: 4.9,
    ratingCount: 56,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Implement complex asynchronous workflows using asyncio.',
      'Design high-performance systems with multiprocessing and threading.',
      'Master advanced design patterns (Factory, Singleton, Repository).',
      'Optimize memory usage and execution speed for large-scale apps.',
      'Automate enterprise deployments with advanced CI/CD pipelines.'
    ],
    modules: [
      {
        id: 'adv-py-mod-1',
        number: 1,
        title: 'Asynchronous Paradigms',
        description: 'Deep dive into event loops, coroutines, and async/await syntax.',
        duration: '2h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'adv-py-les-1-1', title: 'The Event Loop Explained', type: 'Video', duration: '40min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'adv-py-les-1-2', title: 'Async/Await Patterns', type: 'Code', duration: '50min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'adv-rev-1',
        userName: 'Sven L.',
        rating: 5,
        comment: 'This course is a beast. Asyncio was always a black box for me, but the senior IT architects explains it with such clarity. Well worth the price.',
        date: '2026-06-05',
        isVerified: true,
        helpfulCount: 32
      },
      {
        id: 'adv-rev-2',
        userName: 'Marta P.',
        rating: 5,
        comment: 'The focus on enterprise-grade patterns is what sets this apart. We started implementing the Repository pattern at work the day after the bootcamp.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 15
      }
    ]
  },
  {
    id: 'git-essentials',
    title: 'Git Essentials',
    description: 'Master version control basics, commits, branching, merging, and collaboration with GitHub.',
    longDescription: 'Get up to speed with Git, the industry-standard version control system. In this short course, you will learn how to track file versions, create branches, resolve merge conflicts, and collaborate using GitHub.',
    level: 'Foundation',
    format: 'Multiple formats',
    topic: 'Git',
    duration: '2 Hours',
    language: 'English',
    tags: ['New'],
    priceStatus: 'included',
    xpReward: 150,
    price: 'CHF 90.00',
    rating: 4.6,
    ratingCount: 41,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1654277041218-84424c78f0ae?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    availableFormats: [
      {
        format: 'self-paced',
        price: 'CHF 250.00',
        features: { aiTutor: true, peerCohort: false, inPerson: false, certificate: true }
      },
      {
        format: 'cohort',
        price: 'CHF 650.00',
        features: { aiTutor: true, peerCohort: true, inPerson: false, certificate: true },
        bundledSubscription: {
          durationMonths: 1,
          valueAmount: 'CHF 30.00',
          label: 'Premium Access'
        },
        cohortProgress: {
          minParticipants: 3,
          currentParticipants: 5,
          maxParticipants: 12,
          confirmationDate: '2026-07-01'
        }
      },
      {
        format: 'flipped',
        price: 'CHF 950.00',
        features: { aiTutor: true, peerCohort: true, inPerson: true, certificate: true },
        bundledSubscription: {
          durationMonths: 2,
          valueAmount: 'CHF 60.00',
          label: 'Premium Access'
        }
      }
    ],
    learningOutcomes: [
      'Initialize Git repositories and record changes using commits.',
      'Navigate branch histories and execute branch merges.',
      'Resolve merge conflicts confidently.',
      'Push and pull code using remote repositories on GitHub.'
    ],
    modules: [
      {
        id: 'git-mod-1',
        number: 1,
        title: 'Git Basics & Branching',
        description: 'Repository setup, commits, branches, merges, and pushing to GitHub.',
        duration: '2h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'git-les-1-1', title: 'What is Version Control?', type: 'Video', duration: '15min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'git-les-1-2', title: 'Initializing Repos & Committing', type: 'Code', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { id: 'git-les-1-3', title: 'Branching and Merging', type: 'Code', duration: '35min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { id: 'git-les-1-4', title: 'Quiz: Git Commands', type: 'Quiz', duration: '15min', status: 'not_started', required: true, bloomLevel: 'Remember' }
        ]
      }
    ],
    reviews: [
      {
        id: 'git-rev-1',
        userName: 'Oliver B.',
        rating: 4,
        comment: 'Exactly what I needed. I used Git before but never really understood what was happening "under the hood" until now.',
        date: '2026-06-10',
        isVerified: true,
        helpfulCount: 8
      },
      {
        id: 'git-rev-2',
        userName: 'Sarah J.',
        rating: 5,
        comment: 'The merge conflict resolution exercises were the best. Finally I don’t freak out when I see a conflict!',
        date: '2026-05-30',
        isVerified: true,
        helpfulCount: 21
      }
    ]
  },
  {
    id: 'command-line-basics',
    title: 'Command Line Basics',
    description: 'Learn to navigate directories, manipulate files, and run scripts directly from your terminal.',
    longDescription: 'The command line is a developer\'s best friend. This course covers everything from simple shell commands, file path patterns, piping outputs, to basic environment settings.',
    level: 'Foundation',
    format: 'self-paced',
    topic: 'Terminal',
    duration: '1.5 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 120,
    price: 'CHF 75.00',
    rating: 4.5,
    ratingCount: 38,
    enrolled: true,
    progress: 100,
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Navigate directory hierarchies using cd, ls, and pwd.',
      'Create, copy, and delete files and folders using the shell.',
      'Redirect command outputs and use basic environment variables.'
    ],
    modules: [
      {
        id: 'cmd-mod-1',
        number: 1,
        title: 'Shell Navigation & Operations',
        description: 'Shell overview, standard commands, directories, and paths.',
        duration: '1.5h',
        status: 'Completed',
        type: 'Self-study',
        lessons: [
          { id: 'cmd-les-1-1', title: 'Terminal vs Shell', type: 'Video', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'cmd-les-1-2', title: 'Navigation Commands', type: 'Code', duration: '30min', status: 'completed', required: true, bloomLevel: 'Apply' },
          { id: 'cmd-les-1-3', title: 'File Operations & Wildcards', type: 'Code', duration: '30min', status: 'completed', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'markdown-developers',
    title: 'Markdown for Developers',
    description: 'Write beautiful readmes, documentation, and formatted notes using Markdown syntax.',
    longDescription: 'Learn Markdown, the standard markup language used for writing web-formatted text. Great for document formatting on GitHub, blogs, and corporate wikis.',
    level: 'Foundation',
    duration: '48 hours',
    format: 'self-paced',
    xpReward: 80,
    price: 'CHF 40.00',
    rating: 4.7,
    ratingCount: 54,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Format headers, lists, code snippets, and blocks.',
      'Incorporate hyperlinks, images, and tables.',
      'Adopt clean README layouts for open source projects.'
    ],
    preCourseRequirements: {
      hardware: ['Any computer with a modern web browser'],
      software: ['Web browser (Chrome, Firefox, Safari)', 'A text editor (Notepad, VS Code, or similar)'],
      knowledge: ['Basic typing skills', 'Comfort with navigating web pages']
    },
    cancellationPolicy: 'Self-paced courses are eligible for a full refund within 30 days of purchase if less than 20% of the content has been accessed.',
    modules: [
      {
        id: 'md-mod-1',
        number: 1,
        title: 'Markdown Syntax',
        description: 'Text styles, links, code blocks, lists, and tables.',
        duration: '1.0h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'md-les-1-1', title: 'Formatting Text & Lists', type: 'Article', duration: '25min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'md-les-1-2', title: 'Embedding Code and Media', type: 'Article', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      }
    ]
  },
  {
    id: 'sql-databases',
    title: 'SQL & Relational Databases',
    description: 'Understand schemas, relationships, joins, and write complex queries with SQL.',
    longDescription: 'Data is the core of every system. Learn the design principles of relational schemas, tables, indices, foreign keys, and write optimal SELECT, JOIN, and aggregation queries in PostgreSQL and SQLite.',
    level: 'Intermediate',
    format: 'self-paced',
    duration: '4 Days',
    xpReward: 350,
    price: 'CHF 320.00',
    rating: 4.7,
    ratingCount: 93,
    enrolled: true,
    progress: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Model relational databases with 1-to-N and N-to-N schemas.',
      'Write complex queries using JOIN, WHERE, GROUP BY, and HAVING.',
      'Optimize queries using indexes and execution analysis.'
    ],
    modules: [
      {
        id: 'sql-mod-1',
        number: 1,
        title: 'Relational Design & Tables',
        description: 'Database engines, creating tables, primary keys, and data types.',
        duration: '2.5h',
        status: 'In progress',
        type: 'Self-study',
        lessons: [
          { id: 'sql-les-1-1', title: 'Database Fundamentals', type: 'Video', duration: '30min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'sql-les-1-2', title: 'Defining Schemas & Tables', type: 'Code', duration: '40min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { id: 'sql-les-1-3', title: 'Inserting and Selecting Data', type: 'Code', duration: '35min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'sql-mod-2',
        number: 2,
        title: 'Joins and Aggregations',
        description: 'Inner, outer, and left joins, grouping results, and basic math aggregates.',
        duration: '3h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'sql-les-2-1', title: 'The power of JOIN', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'sql-les-2-2', title: 'SUM, AVG, COUNT and GROUP BY', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' },
          { id: 'sql-les-2-3', title: 'Filtering with HAVING', type: 'Quiz', duration: '20min', status: 'locked', required: true, bloomLevel: 'Analyse' }
        ]
      },
      {
        id: 'sql-mod-3',
        number: 3,
        title: 'Performance & Indexes',
        description: 'How databases find rows, building indexes, and execution plans.',
        duration: '2.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'sql-les-3-1', title: 'Why queries get slow', type: 'Video', duration: '25min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'sql-les-3-2', title: 'Creating Indexes', type: 'Code', duration: '40min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'sql-rev-1',
        userName: 'Fabian Z.',
        rating: 5,
        comment: 'Very practical. Using PostgreSQL for the exercises made it real. The JOIN logic is explained much better than in any online tutorial I found.',
        date: '2026-06-01',
        isVerified: true,
        helpfulCount: 14
      },
      {
        id: 'sql-rev-2',
        userName: 'Andrea M.',
        rating: 4,
        comment: 'The performance module was a real eye-opener. I never knew how much difference a simple index could make.',
        date: '2026-05-15',
        isVerified: true,
        helpfulCount: 9
      }
    ]
  },
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'An introduction to neural networks, embeddings, and prompting techniques for technical professionals.',
    longDescription: 'Explore artificial intelligence from a practical engineering view. Learn about feed-forward layers, weights, vectors, cosine similarity, embeddings, and prompt structures for LLMs.',
    level: 'Intermediate',
    format: 'self-paced',
    duration: '1 Week',
    xpReward: 400,
    price: 'CHF 490.00',
    rating: 4.9,
    ratingCount: 82,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Articulate basic neural network architectures.',
      'Explain embeddings and perform vector calculations.',
      'Draft highly reliable prompt structures using systemic variables.'
    ],
    modules: [
      {
        id: 'ai-mod-1',
        number: 1,
        title: 'Neural Nets & Weights',
        description: 'Layers, activations, weights, training cycles, and gradients.',
        duration: '3h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'ai-les-1-1', title: 'Intuition behind Neural Nets', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'ai-les-1-2', title: 'Weights & Activations', type: 'Article', duration: '35min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'ai-les-1-3', title: 'Review Quiz: Neural Basics', type: 'Quiz', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Remember' }
        ]
      },
      {
        id: 'ai-mod-2',
        number: 2,
        title: 'Embeddings & Vectors',
        description: 'High-dimensional space, word vectors, similarity metrics.',
        duration: '3.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'ai-les-2-1', title: 'Vectors and Spaces', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Remember' },
          { id: 'ai-les-2-2', title: 'Calculating Cosine Similarity', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' },
          { id: 'ai-les-2-3', title: 'Exercise: Embedding Database Query', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'ai-mod-3',
        number: 3,
        title: 'Prompt Engineering',
        description: 'System instructions, zero-shot/few-shot prompts, RAG architectures.',
        duration: '3.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'ai-les-3-1', title: 'Structuring System Commands', type: 'Article', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'ai-les-3-2', title: 'Zero vs Few-shot Prompting', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' }
        ]
      }
    ]
  },
  {
    id: 'react-web-development',
    title: 'Web Development with React',
    description: 'Learn dynamic UI state management, hooks, routing, and structuring scalable Single Page Applications with React.',
    longDescription: 'React changed frontend architecture. Learn how to break layouts into functional components, utilize state hooks (useState, useEffect, useContext), configure routing, and optimize bundle sizing.',
    level: 'Intermediate',
    format: 'self-paced',
    xpReward: 450,
    price: 'CHF 390.00',
    rating: 4.7,
    duration: '1 Month',
    ratingCount: 65,
    enrolled: true,
    progress: 45,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Build reusable UI components in JSX.',
      'Control page states using React Hooks.',
      'Configure client-side routing and clean layouts.'
    ],
    modules: [
      {
        id: 'react-mod-1',
        number: 1,
        title: 'React Basics & JSX',
        description: 'Setting up projects, components, properties, and rendering lists.',
        duration: '3h',
        status: 'Completed',
        type: 'Self-study',
        lessons: [
          { id: 'react-les-1-1', title: 'React vs Vanilla JS', type: 'Video', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'react-les-1-2', title: 'Understanding JSX Structure', type: 'Article', duration: '35min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { id: 'react-les-1-3', title: 'First Component Exercise', type: 'Code', duration: '45min', status: 'completed', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'react-mod-2',
        number: 2,
        title: 'State & Event Handlers',
        description: 'Using useState, form inputs, handling clicks, and local state lifecycles.',
        duration: '4h',
        status: 'In progress',
        type: 'Self-study',
        lessons: [
          { id: 'react-les-2-1', title: 'Why State is Needed', type: 'Video', duration: '30min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { id: 'react-les-2-2', title: 'The useState Hook in Detail', type: 'Code', duration: '50min', status: 'in_progress', required: true, bloomLevel: 'Apply' },
          { id: 'react-les-2-3', title: 'Practice: Dynamic Input Fields', type: 'Code', duration: '40min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'react-mod-3',
        number: 3,
        title: 'Effects & API Fetching',
        description: 'Handling side effects with useEffect, loading indicators, and external API requests.',
        duration: '4h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'react-les-3-1', title: 'Understanding Side Effects', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'react-les-3-2', title: 'Fetching Data inside useEffect', type: 'Code', duration: '50min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'react-mod-4',
        number: 4,
        title: 'Routing with React Router',
        description: 'Browser routes, dynamic URL parameters, navigation links, and layout templates.',
        duration: '4h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'react-les-4-1', title: 'Configuring App Routes', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Apply' },
          { id: 'react-les-4-2', title: 'Dynamic Routes & useParams', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'docker-containers',
    title: 'Docker & Containerization',
    description: 'Package your applications, manage environments, and orchestrate containers with Docker Compose.',
    longDescription: 'Work environment synchronization can be painful. This course introduces Docker containerization, Dockerfiles, volume bindings, ports exposure, and orchestrating multiple services using Docker Compose.',
    level: 'Intermediate',
    format: 'cohort',
    duration: '10 Days',
    xpReward: 380,
    price: 'CHF 550.00',
    rating: 4.8,
    ratingCount: 77,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Write Dockerfiles for Node, Python, and Go applications.',
      'Share local source code folders using volume mounts.',
      'Deploy database and app services with Docker Compose.'
    ],
    modules: [
      {
        id: 'dock-mod-1',
        number: 1,
        title: 'Containers and Images',
        description: 'Docker architecture, images vs containers, executing run commands.',
        duration: '4h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'dock-les-1-1', title: 'The Problem Docker Solves', type: 'Video', duration: '25min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'dock-les-1-2', title: 'Docker CLI commands', type: 'Code', duration: '45min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { id: 'dock-les-1-3', title: 'Writing your first Dockerfile', type: 'Code', duration: '50min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'dock-mod-2',
        number: 2,
        title: 'Volumes and Networks',
        description: 'Data persistence, named volumes, bridge networks, and linking containers.',
        duration: '4h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'dock-les-2-1', title: 'Data Persistence in Container Land', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'dock-les-2-2', title: 'Bridge Networks and Container Resolution', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'dock-mod-3',
        number: 3,
        title: 'Docker Compose',
        description: 'Defining compose.yml configs, multi-container stacks, environment variables.',
        duration: '4h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'dock-les-3-1', title: 'Orchestrating stacks with Compose', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'dock-les-3-2', title: 'Connecting database and app servers', type: 'Code', duration: '50min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'api-design-fastapi',
    title: 'API Design with FastAPI',
    description: 'Build high-performance, asynchronous REST APIs with FastAPI, Pydantic, and automatic OpenAPI docs.',
    longDescription: 'Python APIs must be fast and easy to document. Explore FastAPI, utilize Pydantic models for request validation, configure background workers, and write clean dependency injection schemas.',
    level: 'Advanced',
    format: 'cohort',
    duration: '50 Hours',
    xpReward: 500,
    price: 'CHF 890.00',
    rating: 4.9,
    ratingCount: 52,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Build robust API endpoints using async/await handlers.',
      'Implement strict validation models with Pydantic.',
      'Configure authentication guards using JWT tokens.'
    ],
    modules: [
      {
        id: 'fast-mod-1',
        number: 1,
        title: 'Async Handlers & Pydantic',
        description: 'FastAPI features, Pydantic type specifications, automatic query parameter extraction.',
        duration: '4.5h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'fast-les-1-1', title: 'Why FastAPI beats older tools', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'fast-les-1-2', title: 'Designing Pydantic Schema inputs', type: 'Code', duration: '50min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { id: 'fast-les-1-3', title: 'CRUD routes implementation', type: 'Code', duration: '50min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'fast-mod-2',
        number: 2,
        title: 'Dependency Injection',
        description: 'FastAPI Depends parameters, database session injection, reusable auth logic.',
        duration: '4.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'fast-les-2-1', title: 'Dependency Injection Principles', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'fast-les-2-2', title: 'Writing Custom Dependencies', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'fast-mod-3',
        number: 3,
        title: 'JWT Authentication',
        description: 'Creating hash functions, signing tokens, authentication header authorization.',
        duration: '4.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'fast-les-3-1', title: 'Securing API Routes with JWT', type: 'Video', duration: '40min', status: 'locked', required: true, bloomLevel: 'Apply' },
          { id: 'fast-les-3-2', title: 'Token validation logic', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'fast-mod-4',
        number: 4,
        title: 'Background Tasks',
        description: 'Executing tasks out of request loops, emails dispatch, database triggers.',
        duration: '4.5h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'fast-les-4-1', title: 'Scheduling background workers', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'fast-les-4-2', title: 'Deploying workers safely', type: 'Code', duration: '45min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'fullstack-production-arch',
    title: 'Full Stack Production Architecture',
    description: 'Master enterprise deployments, caching strategies, load balancing, CI/CD pipelines, and secure cloud setups.',
    longDescription: 'Take applications to enterprise scale. This comprehensive course covers horizontal scaling, SSL configurations, proxying with Nginx, database replication, caching with Redis, and writing secure CI/CD build scripts.',
    level: 'Advanced',
    format: 'cohort',
    duration: '2 Days',
    xpReward: 800,
    price: 'CHF 1\'800.00',
    rating: 4.9,
    ratingCount: 37,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: [
      'Design horizontally scalable architectures.',
      'Configure Nginx reverse proxies with SSL certificates.',
      'Optimize responses using Redis cache layers.',
      'Deploy applications using fully automated CI/CD pipelines.'
    ],
    modules: [
      {
        id: 'arch-mod-1',
        number: 1,
        title: 'Load Balancing & Nginx',
        description: 'Reverse proxies, round-robin rules, SSL termination, proxy headers.',
        duration: '6h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'arch-les-1-1', title: 'Scaling Out vs Scaling Up', type: 'Video', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'arch-les-1-2', title: 'Configuring Nginx reverse proxy', type: 'Code', duration: '60min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { id: 'arch-les-1-3', title: 'SSL Certs with Let\'s Encrypt', type: 'Code', duration: '50min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'arch-mod-2',
        number: 2,
        title: 'Redis Caching layers',
        description: 'In-memory stores, string/hash records, cache invalidation protocols.',
        duration: '6h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'arch-les-2-1', title: 'Why DB queries are slow', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'arch-les-2-2', title: 'Redis client set and get caching', type: 'Code', duration: '60min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'arch-mod-3',
        number: 3,
        title: 'Database Replication',
        description: 'Primary/replica topologies, read-write splitting, connection pools.',
        duration: '6h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'arch-les-3-1', title: 'Topologies for High Availability', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'arch-les-3-2', title: 'Configuring Read Splitting', type: 'Code', duration: '50min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'arch-mod-4',
        number: 4,
        title: 'CI/CD Automation pipelines',
        description: 'Runner setups, test environments, docker image repository uploads.',
        duration: '7h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'arch-les-4-1', title: 'Introduction to GitHub Actions', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'arch-les-4-2', title: 'Building clean multi-stage docker pipelines', type: 'Code', duration: '60min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'arch-mod-5',
        number: 5,
        title: 'Docker Swarm & Kubernetes',
        description: 'Orchestrating containers, rolling updates, health checks.',
        duration: '7h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'arch-les-5-1', title: 'Orchestration Essentials', type: 'Video', duration: '35min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'arch-les-5-2', title: 'Rolling Updates and Service Health', type: 'Code', duration: '55min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      },
      {
        id: 'arch-mod-6',
        number: 6,
        title: 'System Security Audits',
        description: 'DDoS mitigation, SQL injections scanning, firewall rules.',
        duration: '8h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'arch-les-6-1', title: 'Security Best Practices', type: 'Video', duration: '40min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'arch-les-6-2', title: 'Vulnerability Scanning Tools', type: 'Code', duration: '60min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  }
];

export const TRACKS: CareerTrack[] = [
  {
    id: 'python-production-engineer',
    title: 'Become a Python Production Engineer',
    description: 'Master the complete Python ecosystem for production environments.',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    level: 'Advanced',
    tags: ['Career Track', 'Top Rated'],
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
  { id: 'file-1', name: 'Python Bootcamp - Module 1 Materials', type: 'pdf', courseName: 'Python Bootcamp', uploadDate: 'Jan 15, 2026', accessLevel: 'All Learners', size: '2.4 MB' },
  { id: 'file-2', name: 'Lecture Script AI Week 03.pdf', type: 'pdf', courseName: 'AI Fundamentals', uploadDate: 'Yesterday, 14:30', accessLevel: 'Cohort Only', size: '1.8 MB' },
  { id: 'file-3', name: 'React Hooks Crashcourse.mp4', type: 'video', courseName: 'Web Development with React', uploadDate: 'Jan 10, 2026', accessLevel: 'All Learners', size: '45 MB' },
  { id: 'file-4', name: 'Python_Exercises_Set_2.zip', type: 'archive', courseName: 'Python Bootcamp', uploadDate: 'Jan 08, 2026', accessLevel: 'All Learners', size: '1.2 MB' },
  { id: 'file-5', name: 'IT Security Cheatsheet.pdf', type: 'pdf', courseName: 'IT Security Basics', uploadDate: 'Jan 05, 2026', accessLevel: 'All Learners', size: '420 KB' }
];

export const FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'What is the difference between a list and a tuple?',
    author: 'Marc K.',
    body: "I'm currently learning the data structure module in Python and wondering when to use a tuple instead of a list. Immutability is clear, but are there performance differences or other rules of thumb?",
    category: 'Python Bootcamp',
    moduleName: 'Data Structures',
    upvotes: 8,
    commentsCount: 3,
    hasAcceptedAnswer: true,
    timestamp: 'Jun 14, 2026'
  },
  {
    id: 'thread-2',
    title: 'Error message when activating "venv" under Windows PowerShell',
    author: 'Tanya S.',
    body: 'When I try to activate my venv via `.\\venv\\Scripts\\Activate.ps1`, I get an Execution_Policies error from Windows. What can I do?',
    category: 'Python Bootcamp',
    moduleName: 'Setup & Python Basics',
    upvotes: 12,
    commentsCount: 5,
    hasAcceptedAnswer: true,
    timestamp: 'Yesterday, 18:22',
    isAnonymous: false
  }
];
