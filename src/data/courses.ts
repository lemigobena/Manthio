import type { Course } from '../types';
import { TRAINERS } from './trainers';

// This file contains the COURSES data objects.
export const COURSES: Course[] = [

  {
    id: 'git-version-control',
    title: 'Git Version Control',
    description: 'Master Git branches, rebasing, and collaborative workflows.',
    longDescription: 'Comprehensive guide to Git.',
    level: 'Foundation',
    format: 'self-paced',
    topic: 'Version Control',
    duration: '2 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 150,
    price: 'CHF 50.00',
    rating: 4.8,
    ratingCount: 120,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'linux-administration',
    title: 'Linux Administration',
    description: 'Deep dive into Linux system administration and OS fundamentals.',
    longDescription: 'Linux OS internals, permissions, and process management.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'OS',
    duration: '4 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 200,
    price: 'CHF 80.00',
    rating: 4.6,
    ratingCount: 85,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'networking-fundamentals',
    title: 'Networking Fundamentals',
    description: 'Understand TCP/IP, DNS, routing, and load balancing.',
    longDescription: 'Network concepts for cloud engineers.',
    level: 'Foundation',
    format: 'self-paced',
    topic: 'Networking',
    duration: '3 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 180,
    price: 'CHF 60.00',
    rating: 4.7,
    ratingCount: 92,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'kubernetes-for-beginners',
    title: 'Kubernetes for Beginners',
    description: 'Introduction to Pods, Deployments, and Services.',
    longDescription: 'Start your Kubernetes journey.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'Kubernetes',
    duration: '5 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 250,
    price: 'CHF 100.00',
    rating: 4.9,
    ratingCount: 210,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1667372459510-55b5e2087cd0?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'kubernetes-advanced',
    title: 'Kubernetes Advanced',
    description: 'Ingress, Network Policies, and StatefulSets.',
    longDescription: 'Advanced Kubernetes topics.',
    level: 'Advanced',
    format: 'self-paced',
    topic: 'Kubernetes',
    duration: '6 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 300,
    price: 'CHF 120.00',
    rating: 4.8,
    ratingCount: 150,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'ansible-configuration',
    title: 'Ansible Configuration',
    description: 'Automate server configuration with Ansible.',
    longDescription: 'Ansible playbooks and roles.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'Automation',
    duration: '4 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 220,
    price: 'CHF 90.00',
    rating: 4.7,
    ratingCount: 88,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'monitoring-prometheus',
    title: 'Monitoring with Prometheus',
    description: 'Set up metrics and alerts with Prometheus and Grafana.',
    longDescription: 'Observability stack.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'Monitoring',
    duration: '3.5 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 200,
    price: 'CHF 85.00',
    rating: 4.8,
    ratingCount: 95,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'advanced-python',
    title: 'Advanced Python',
    description: 'Metaclasses, concurrency, and decorators.',
    longDescription: 'Deep Python concepts.',
    level: 'Advanced',
    format: 'self-paced',
    topic: 'Python',
    duration: '5 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 250,
    price: 'CHF 90.00',
    rating: 4.8,
    ratingCount: 110,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'fastapi-backend',
    title: 'FastAPI Backend',
    description: 'Build fast APIs with Python and FastAPI.',
    longDescription: 'Modern API development.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'Python',
    duration: '4 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 220,
    price: 'CHF 85.00',
    rating: 4.9,
    ratingCount: 130,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'apache-spark-basics',
    title: 'Apache Spark Basics',
    description: 'Big data processing with PySpark.',
    longDescription: 'Distributed data pipelines.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'Data',
    duration: '5 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 240,
    price: 'CHF 95.00',
    rating: 4.7,
    ratingCount: 75,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },
  {
    id: 'snowflake-data-warehouse',
    title: 'Snowflake Data Warehouse',
    description: 'Cloud data warehousing with Snowflake.',
    longDescription: 'Modern data stack.',
    level: 'Intermediate',
    format: 'self-paced',
    topic: 'Data',
    duration: '4 Hours',
    language: 'English',
    priceStatus: 'included',
    xpReward: 210,
    price: 'CHF 90.00',
    rating: 4.8,
    ratingCount: 88,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80',
    trainer: Object.values(TRAINERS)[0],
    learningOutcomes: [
      'Understand the core concepts and principles.',
      'Apply best practices in real-world scenarios.',
      'Build and deploy scalable solutions.'
    ],
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction',
        description: 'Get started with the basics.',
        duration: '1h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'les-1', title: 'Welcome', type: 'Video', duration: '10min', status: 'not_started', required: true, bloomLevel: 'Remember' },
          { id: 'les-2', title: 'Core Concepts', type: 'Article', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' }
        ]
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts.',
        duration: '2h',
        status: 'Locked',
        type: 'Self-study',
        lessons: [
          { id: 'les-3', title: 'Advanced Theory', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { id: 'les-4', title: 'Practical Exercise', type: 'Code', duration: '1h', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-auto-1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Great course! Very informative and well structured.',
        date: '2026-06-15',
        isVerified: true,
        helpfulCount: 10
      },
      {
        id: 'rev-auto-2',
        userName: 'Bob S.',
        rating: 4,
        comment: 'Good content, but I wish it went a bit deeper into some topics.',
        date: '2026-05-20',
        isVerified: true,
        helpfulCount: 5
      }
    ]
  },

  {
    id: 'test-course',
    title: 'Testing Course',
    description: 'A simple course with 2 lessons to test completion flow.',
    longDescription: 'This course is built for quickly testing the completion module.',
    level: 'Foundation',
    format: 'self-paced',
    topic: 'Testing',
    duration: '5 Mins',
    language: 'English',
    tags: ['New'],
    priceStatus: 'included',
    xpReward: 100,
    price: 'Free',
    rating: 5.0,
    ratingCount: 1,
    enrolled: true,
    progress: 100,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: ['Finish lesson 1', 'Finish lesson 2'],
    modules: [
      {
        id: 'test-mod-1',
        number: 1,
        title: 'Testing Module',
        description: 'Module containing exactly two lessons.',
        duration: '5min',
        status: 'In progress',
        type: 'Self-study',
        lessons: [
          { id: 'test-les-1', title: 'Lesson 1', type: 'Article', duration: '2min', status: 'in_progress', required: true, bloomLevel: 'Remember' },
          { id: 'test-les-2', title: 'Lesson 2', type: 'Quiz', duration: '3min', status: 'locked', required: true, bloomLevel: 'Apply' }
        ]
      }
    ],
    reviews: []
  },
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
    preCourseTasks: [
      { id: 'task-py-1', title: 'Python 3.11 Setup', description: 'Install Python and verify via terminal.', status: 'completed', type: 'setup' },
      { id: 'task-py-2', title: 'Welcome & Strategy', description: 'Watch the bootcamp kick-off video.', status: 'pending', type: 'video' },
      { id: 'task-py-3', title: 'Prerequisites Check', description: 'Confirm your environment is ready.', status: 'pending', type: 'quiz' }
    ],
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
          { id: 'py-les-1-1', title: 'Install Python & Set up IDE', type: 'Video', duration: '20min', status: 'completed', required: true, bloomLevel: 'Remember', microChunkable: true, checkpoints: 4 },
          { id: 'py-les-1-2', title: 'Python Cheatsheet', type: 'PDF', duration: '10min', status: 'completed', required: true, bloomLevel: 'Remember' },
          { id: 'py-les-1-3', title: 'Variables & Data Types', type: 'Article', duration: '25min', status: 'completed', required: true, bloomLevel: 'Understand' },
          { 
            id: 'py-les-1-4', 
            title: 'Your first script', 
            type: 'Code', 
            duration: '20min', 
            status: 'in_progress', 
            required: true, 
            bloomLevel: 'Apply',
            sandboxData: {
              language: 'python',
              files: [
                {
                  path: 'src/main.py',
                  code: '# Write a function that returns "Hello, World!"\n\ndef greet():\n    pass\n\nprint(greet())\n'
                },
                {
                  path: 'utils/helper.py',
                  code: '# Helper functions can go here\ndef custom_greeting(name):\n    return f"Hello, {name}!"\n'
                }
              ],
              tests: [
                {
                  id: 'test-1',
                  name: 'Should return "Hello, World!"',
                  code: 'assert greet() == "Hello, World!"'
                },
                {
                  id: 'test-2',
                  name: 'Should handle custom names (Hidden Test)',
                  code: 'from utils.helper import custom_greeting\nassert custom_greeting("Alice") == "Hello, Alice!"',
                  hidden: true
                }
              ]
            }
          },
          { 
            id: 'py-les-1-5', 
            title: 'Interactive Flow Quiz', 
            type: 'H5P', 
            duration: '15min', 
            status: 'completed', 
            required: true, 
            bloomLevel: 'Apply',
            h5pData: {
              type: 'Composite',
              composite: {
                items: [
                  {
                    type: 'InteractiveVideo',
                    interactiveVideo: {
                      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
                      interactions: [
                        { time: 15, type: 'multiple-choice', question: 'What is the girl looking for?', options: ['A dragon', 'A sword', 'A boy'], correctAnswerIndex: 0, pauseVideo: true },
                        { time: 30, type: 'multiple-choice', question: 'Who is the girl speaking to?', options: ['A shaman', 'A guard', 'A merchant'], correctAnswerIndex: 0, pauseVideo: true },
                        { time: 45, type: 'multiple-choice', question: 'What weapon is the girl holding?', options: ['A bow', 'A spear', 'A staff'], correctAnswerIndex: 1, pauseVideo: true }
                      ]
                    }
                  },
                  {
                    type: 'BranchingScenario',
                    branchingScenario: {
                      startNodeId: 'node1',
                      nodes: [
                        { id: 'node1', title: 'Debugging KeyError', content: 'You see a KeyError when accessing a dict. What do you do?', choices: [{ text: 'Use dict.get()', nextId: 'node2' }, { text: 'Ignore it', nextId: 'node3' }] },
                        { id: 'node2', title: 'Safe Access', content: 'You used dict.get(), but it returned None. Now what?', choices: [{ text: 'Provide a default value', nextId: 'node4' }, { text: 'Raise another error', nextId: 'node3' }] },
                        { id: 'node3', title: 'Fail', content: 'The program crashes.', choices: [] },
                        { id: 'node4', title: 'Success', content: 'Your code is robust!', choices: [] }
                      ]
                    }
                  },
                  {
                    type: 'DragAndDrop',
                    dragAndDrop: {
                      backgroundImageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60',
                      dropZones: [{ id: 'z1', label: 'List', acceptsIds: ['d1'] }, { id: 'z2', label: 'Tuple', acceptsIds: ['d2'] }, { id: 'z3', label: 'Set', acceptsIds: ['d3'] }],
                      draggableItems: [{ id: 'd1', label: 'List', type: 'text', content: '[1, 2, 3]' }, { id: 'd2', label: 'Tuple', type: 'text', content: '(1, 2, 3)' }, { id: 'd3', label: 'Set', type: 'text', content: '{1, 2, 3}' }]
                    }
                  },
                  {
                    type: 'FillInTheBlanks',
                    fillInTheBlanks: {
                      text: 'To define a function, use __BLANK__. To return a value, use __BLANK__. To yield a value in a generator, use __BLANK__.',
                      blanks: [{ correctAnswers: ['def'], hint: 'Short for define' }, { correctAnswers: ['return'], hint: 'Output keyword' }, { correctAnswers: ['yield'], hint: 'Generator keyword' }]
                    }
                  },
                  {
                    type: 'MarkTheWords',
                    markTheWords: {
                      text: 'Lists and dictionaries are mutable, while tuples and strings are immutable.',
                      correctWordIndices: [0, 2, 6, 8]
                    }
                  },
                  {
                    type: 'CoursePresentation',
                    coursePresentation: {
                      slides: [
                        { id: 's1', elements: [
                          { id: 'e1', type: 'text', content: '<h2>Python OOP: Classes</h2><p>Classes encapsulate data and behavior.</p>', x: 10, y: 5, width: 80, height: 20 },
                          { id: 'img1', type: 'image', content: '/images/oop_classes_diagram_1782205252964.png', x: 10, y: 25, width: 80, height: 70 }
                        ] },
                        { id: 's2', elements: [
                          { id: 'e2', type: 'text', content: '<h2>The __init__ method</h2><p>Initializes a new instance of a class.</p>', x: 10, y: 5, width: 80, height: 20 },
                          { id: 'img2', type: 'image', content: '/images/init_method_diagram_1782205265997.png', x: 10, y: 25, width: 80, height: 70 }
                        ] },
                        { id: 's3', elements: [
                          { id: 'e3', type: 'text', content: '<h2>Inheritance</h2><p>Child classes inherit from parent classes.</p>', x: 10, y: 5, width: 80, height: 20 },
                          { id: 'img3', type: 'image', content: '/images/inheritance_diagram_1782205277306.png', x: 10, y: 25, width: 80, height: 70 }
                        ] }
                      ]
                    }
                  },
                  {
                    type: 'Quiz',
                    quiz: {
                      questions: [
                        { id: 'q1', question: 'What does the len() function do?', options: ['Returns memory size', 'Returns the number of items', 'Converts to string'], correctAnswerIndex: 1 },
                        { id: 'q2', question: 'How do you insert an item at a specific index in a list?', options: ['list.add()', 'list.append()', 'list.insert()'], correctAnswerIndex: 2 },
                        { id: 'q3', question: 'Which operator is used for exponentiation?', options: ['^', '**', '//'], correctAnswerIndex: 1 }
                      ]
                    }
                  },
                  {
                    type: 'Flashcards',
                    flashcards: {
                      cards: [
                        { id: 'f1', front: '__str__', back: 'Returns a human-readable string representation.' },
                        { id: 'f2', front: '__len__', back: 'Called by the len() built-in function.' },
                        { id: 'f3', front: '__iter__', back: 'Returns an iterator object.' }
                      ]
                    }
                  },
                  {
                    type: 'Timeline',
                    timeline: {
                      events: [
                        { id: 't1', year: '2000', title: 'Python 2.0', description: 'Introduced list comprehensions and garbage collection system.' },
                        { id: 't2', year: '2008', title: 'Python 3.0', description: 'Major revision focusing on fixing core design flaws (strings are Unicode by default).' },
                        { id: 't3', year: '2021', title: 'Python 3.10', description: 'Introduced structural pattern matching (match/case statements).' }
                      ]
                    }
                  }
                ]
              }
            }
          },
          { id: 'py-les-1-6', title: 'Setup Verification', type: 'Assignment', duration: '15min', status: 'in_progress', required: true, bloomLevel: 'Apply' },
          { id: 'py-les-1-7', title: 'Official Docs Link', type: 'External', duration: '5min', status: 'not_started', required: false, bloomLevel: 'Remember' },
          { 
            id: 'py-les-1-8', 
            title: 'Review Quiz', 
            type: 'H5P', 
            duration: '10min', 
            status: 'not_started', 
            required: true, 
            bloomLevel: 'Remember',
            h5pData: {
              type: 'FillInTheBlanks',
              fillInTheBlanks: {
                text: 'To print something to the console in Python, you use the __BLANK__ function. A sequence of characters is called a __BLANK__.',
                blanks: [
                  { correctAnswers: ['print', 'print()'], hint: 'Output function' },
                  { correctAnswers: ['string', 'str'], hint: 'Data type for text' }
                ]
              }
            }
          }
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
        prepModules: ['py-mod-1', 'py-mod-2'],
        lessons: [
          { id: 'py-les-3-1', title: 'Setup verification, first scripts live', type: 'Article', duration: '15min', status: 'in_progress', required: true, bloomLevel: 'Analyse', completionCriteria: { type: 'scroll', threshold: 0.9 } },
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
          { id: 'py-les-5-1', title: 'Conditions & Loops', type: 'Video', duration: '25min', status: 'locked', required: true, bloomLevel: 'Remember', unlockCondition: 'Complete Module 4 to unlock' },
          { id: 'py-les-5-2', title: 'List Comprehensions', type: 'Article', duration: '20min', status: 'locked', required: true, bloomLevel: 'Understand', unlockCondition: 'Available 18 May' },
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
    id: 'advanced-python-engineering',
    title: 'Advanced Python Engineering',
    description: 'Master advanced Python paradigms, async programming, and system design. Ideal for developers moving towards senior roles.',
    longDescription: 'This intensive flipped bootcamp focuses on enterprise-grade Python. You will dive deep into asynchronous programming, decorators, context managers, and advanced system architecture. Learn to build high-performance, scalable applications with direct coaching from senior IT architects.',
    level: 'Advanced',
    format: 'flipped',
    topic: 'Python',
    duration: '3 Days',
    language: 'English',
    tags: ['Advanced', 'Intensive'],
    priceStatus: 'employer',
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
    cohortProgress: {
      minParticipants: 4,
      currentParticipants: 3,
      maxParticipants: 10,
      confirmationDate: '2026-07-20'
    },
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
        },
        preCourseRequirements: {
          hardware: ['Laptop with 8GB RAM', 'Admin rights to install software'],
          software: ['Git Bash / Terminal', 'VS Code', 'GitHub Account'],
          knowledge: ['Command line basics', 'Basic file management']
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
          { 
            id: 'md-les-1-1', 
            title: 'Identify Markdown Syntax', 
            type: 'H5P', 
            duration: '15min', 
            status: 'not_started', 
            required: true, 
            bloomLevel: 'Remember',
            h5pData: {
              type: 'MarkTheWords',
              markTheWords: {
                text: 'To create a heading you use the # symbol. For bold text you use ** double asterisks **. For italics you use _ underscores _.',
                correctWordIndices: [7, 18, 19, 20, 27, 28, 29]
              }
            }
          },
          { 
            id: 'md-les-1-2', 
            title: 'Complete the Markdown', 
            type: 'H5P', 
            duration: '20min', 
            status: 'not_started', 
            required: true, 
            bloomLevel: 'Understand',
            h5pData: {
              type: 'FillInTheBlanks',
              fillInTheBlanks: {
                text: 'To create a hyperlink in Markdown, you wrap the link text in __BLANK__ and the URL in __BLANK__.',
                blanks: [
                  { correctAnswers: ['[ ]', 'brackets', 'square brackets'], hint: 'Symbol for text' },
                  { correctAnswers: ['( )', 'parentheses', 'round brackets'], hint: 'Symbol for URL' }
                ]
              }
            }
          },
          {
            id: 'md-les-1-3',
            title: 'Markdown Presentation',
            type: 'H5P',
            duration: '25min',
            status: 'not_started',
            required: true,
            bloomLevel: 'Understand',
            h5pData: {
              type: 'CoursePresentation',
              coursePresentation: {
                slides: [
                  {
                    id: 'slide-1',
                    elements: [
                      { id: 'el-1', type: 'text', content: '<h1 style="font-size:2rem; font-weight:bold; color:#2dd4bf;">Welcome to Markdown</h1>', x: 10, y: 30, width: 80, height: 20 },
                      { id: 'el-2', type: 'text', content: '<p style="font-size:1.25rem;">Learn how to format text quickly and efficiently.</p>', x: 10, y: 50, width: 80, height: 20 }
                    ]
                  },
                  {
                    id: 'slide-2',
                    elements: [
                      { id: 'el-3', type: 'text', content: '<h2>Images</h2><p>Use ![alt text](url) to embed images.</p>', x: 10, y: 20, width: 80, height: 30 },
                      { id: 'el-4', type: 'image', content: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80', x: 20, y: 50, width: 60, height: 40 }
                    ]
                  },
                  {
                    id: 'slide-3',
                    elements: [
                      { id: 'el-5', type: 'question', content: 'What symbol is used for an unordered list?', x: 20, y: 30, width: 60, height: 40 }
                    ]
                  }
                ]
              }
            }
          }
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
          { id: 'sql-les-1-3', title: 'Inserting and Selecting Data', type: 'Code', duration: '35min', status: 'not_started', required: true, bloomLevel: 'Apply' },
          { 
            id: 'sql-les-1-4', 
            title: 'Match Database Terminology', 
            type: 'H5P', 
            duration: '10min', 
            status: 'not_started', 
            required: true, 
            bloomLevel: 'Understand',
            h5pData: {
              type: 'DragAndDrop',
              dragAndDrop: {
                dropZones: [
                  { id: 'zone-1', label: 'Primary Key', acceptsIds: ['item-1', 'item-4'] },
                  { id: 'zone-2', label: 'Foreign Key', acceptsIds: ['item-2'] },
                  { id: 'zone-3', label: 'Index', acceptsIds: ['item-3'] }
                ],
                draggableItems: [
                  { id: 'item-1', label: 'Item 1', type: 'text', content: 'Unique identifier for a row' },
                  { id: 'item-2', label: 'Item 2', type: 'text', content: 'References a column in another table' },
                  { id: 'item-3', label: 'Item 3', type: 'text', content: 'Improves query speed' },
                  { id: 'item-4', label: 'Item 4', type: 'text', content: 'Cannot be NULL' }
                ]
              }
            }
          }
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
    priceStatus: 'paid',
    bundledSubscription: {
      durationMonths: 2,
      valueAmount: 'CHF 60.00',
      label: 'Premium Platform Access'
    },
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
          { id: 'ai-les-3-2', title: 'Zero vs Few-shot Prompting', type: 'Video', duration: '30min', status: 'locked', required: true, bloomLevel: 'Understand' },
          { 
            id: 'ai-les-3-3', 
            title: 'AI Ethics Decision Tree', 
            type: 'H5P', 
            duration: '20min', 
            status: 'locked', 
            required: true, 
            bloomLevel: 'Apply',
            h5pData: {
              type: 'BranchingScenario',
              branchingScenario: {
                startNodeId: 'node-1',
                nodes: [
                  {
                    id: 'node-1',
                    title: 'The Hiring Algorithm',
                    content: 'Your company wants to deploy an AI model to pre-screen job applicants based on historical hiring data. What is your primary concern?',
                    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
                    choices: [
                      { text: 'Historical bias being replicated by the model', nextId: 'node-2' },
                      { text: 'The compute cost of running the model', nextId: 'node-3' }
                    ]
                  },
                  {
                    id: 'node-2',
                    title: 'Addressing Bias',
                    content: 'Excellent point. Historical data often contains unconscious human biases. How do you mitigate this?',
                    choices: [
                      { text: 'Remove explicit protected attributes (e.g., gender, race)', nextId: 'node-4' },
                      { text: 'Audit the data for proxy variables and ensure balanced representation', nextId: 'node-5' }
                    ]
                  },
                  {
                    id: 'node-3',
                    title: 'Wrong Priority',
                    content: 'While cost is important, deploying a biased model can lead to severe reputational damage and legal consequences. You need to focus on fairness first.',
                    choices: [
                      { text: 'Re-evaluate priorities', nextId: 'node-1' }
                    ]
                  },
                  {
                    id: 'node-4',
                    title: 'Proxy Variables Remain',
                    content: 'Simply removing explicit attributes isn\'t enough. The model might pick up on "proxy" variables like zip code or alma mater that correlate heavily with protected attributes.',
                    choices: [
                      { text: 'Audit the data instead', nextId: 'node-5' }
                    ]
                  },
                  {
                    id: 'node-5',
                    title: 'Correct Approach',
                    content: 'You successfully audited the dataset and established fairness constraints during training. The model is now much safer to deploy.',
                    choices: []
                  }
                ]
              }
            }
          }
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
    cohortProgress: {
      minParticipants: 5,
      currentParticipants: 2,
      maxParticipants: 15,
      confirmationDate: '2026-08-15'
    },
    preCourseRequirements: {
      hardware: ['Modern Laptop (Apple M1 or i5 equivalent)', '16GB RAM recommended'],
      software: ['Docker Desktop installed', 'Python 3.12+', 'VS Code with Python extension'],
      knowledge: ['Proficiency in Python basics', 'Understanding of HTTP methods']
    },
    preCourseTasks: [
      { id: 'task-fast-1', title: 'Install Docker & FastAPI', description: 'Ensure docker is running and install fastapi[all] via pip.', status: 'pending', type: 'setup' },
      { id: 'task-fast-2', title: 'Watch: The Async Mindset', description: 'Mandatory 10-min video on asynchronous programming in Python.', status: 'pending', type: 'video' },
      { id: 'task-fast-3', title: 'Hello World API', description: 'Run a minimal FastAPI server and access /docs.', status: 'pending', type: 'quiz' }
    ],
    modules: [
      {
        id: 'fast-mod-1',
        number: 1,
        title: 'Async Handlers & Pydantic',
        description: 'FastAPI features, Pydantic type specifications, automatic query parameter extraction.',
        duration: '4.5h',
        status: 'Open',
        type: 'Live online session',
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
        type: 'Live online session',
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
    enrolled: true,
    progress: 26,
    imageUrl: 'https://images.unsplash.com/photo-1573496773905-f5b17e717f05?auto=format&fit=crop&w=800&q=80',
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
        type: 'Live online session',
        availableDate: 'Oct 24, 09:00',
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
        type: 'In-person session',
        availableDate: 'Oct 26, 14:00',
        scheduledTime: 'Oct 26, 14:00 - 18:00',
        venue: 'Room 302, Engineering Block',
        prerequisites: [
          'Complete Module 2 labs',
          'Draft database topology schema'
        ],
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
  },
  {
    id: 'github-actions-automation',
    title: 'GitHub Actions & CI/CD Mastery',
    description: 'Automate your entire build, test, and deployment workflow with GitHub Actions.',
    longDescription: 'Learn to build professional-grade CI/CD pipelines. We cover runner configurations, multi-stage builds, matrix testing, secret management, and continuous deployment to AWS/Azure.',
    level: 'Intermediate',
    format: 'flipped',
    duration: '8 Hours',
    xpReward: 1200,
    price: 'CHF 850.00',
    rating: 4.8,
    ratingCount: 156,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1760536928911-40831dacdbc3?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['marc-kaufmann'],
    learningOutcomes: [
      'Write complex YAML workflows from scratch.',
      'Configure self-hosted runners for private infra.',
      'Implement gated deployments with environment protection.',
      'Automate semantic versioning and changelog generation.'
    ],
    modules: [
      {
        id: 'ga-mod-1',
        number: 1,
        title: 'Workflows & Events',
        description: 'YAML syntax, triggers, push vs pull requests, schedule events.',
        duration: '2h',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'ga-les-1-1', title: 'YAML Anatomy for Actions', type: 'Video', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'ga-les-1-2', title: 'Triggering on specific events', type: 'Code', duration: '40min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'terraform-iac-fundamentals',
    title: 'Terraform & Infrastructure as Code',
    description: 'Learn to provision and manage cloud resources across AWS and Azure using Terraform.',
    longDescription: 'Master IaC with Terraform. Learn HCL syntax, state management, modules, and how to build reproducible environments for development and production.',
    level: 'Intermediate',
    format: 'self-paced',
    duration: '10 Hours',
    xpReward: 1500,
    price: 'CHF 950.00',
    rating: 4.9,
    ratingCount: 88,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['marc-kaufmann'],
    learningOutcomes: ['Write HCL code', 'Manage remote state', 'Build reusable modules'],
    modules: [
      {
        id: 'tf-mod-1',
        number: 1,
        title: 'HCL Syntax & Providers',
        description: 'Learn the fundamentals of HashiCorp Configuration Language.',
        duration: '45min',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'tf-les-1-1', title: 'Terraform Workflow Intro', type: 'Video', duration: '15min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'tf-les-1-2', title: 'Configuring AWS Provider', type: 'Code', duration: '30min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'python-data-processing',
    title: 'Python for Data Engineering',
    description: 'Techniques for processing large datasets efficiently using Pandas and NumPy.',
    longDescription: 'Learn to build robust data processing pipelines. We cover data cleaning, transformation, vectorized operations, and memory optimization for big data tasks.',
    level: 'Intermediate',
    format: 'flipped',
    duration: '12 Hours',
    xpReward: 1400,
    price: 'CHF 1,100.00',
    rating: 4.7,
    ratingCount: 62,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1642775196125-38a9eb496568?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['david-pinezich'],
    learningOutcomes: ['Pandas optimization', 'Data cleaning at scale'],
    modules: [
      {
        id: 'pdy-mod-1',
        number: 1,
        title: 'Pandas & NumPy Essentials',
        description: 'Master the core libraries for data manipulation in Python.',
        duration: '65min',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'pdy-les-1-1', title: 'Vectorized Operations', type: 'Video', duration: '20min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'pdy-les-1-2', title: 'Cleaning Messy Data', type: 'Code', duration: '45min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  },
  {
    id: 'airflow-etl-automation',
    title: 'Data Orchestration with Airflow',
    description: 'Schedule and monitor complex data pipelines with Apache Airflow.',
    longDescription: 'Learn to write DAGs, handle retries, and manage dependencies in your data stack using the industry-standard orchestration tool.',
    level: 'Advanced',
    format: 'self-paced',
    duration: '14 Hours',
    xpReward: 1800,
    price: 'CHF 1,250.00',
    rating: 4.8,
    ratingCount: 45,
    enrolled: false,
    progress: 0,
    imageUrl: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?auto=format&fit=crop&w=800&q=80',
    trainer: TRAINERS['marc-kaufmann'],
    learningOutcomes: ['Write Airflow DAGs', 'Manage Task Groups', 'Scale with Executors'],
    modules: [
      {
        id: 'af-mod-1',
        number: 1,
        title: 'DAG Design & Scheduling',
        description: 'Learn the core concepts of Airflow DAGs.',
        duration: '60min',
        status: 'Open',
        type: 'Self-study',
        lessons: [
          { id: 'af-les-1-1', title: 'Introduction to Airflow 2.x', type: 'Video', duration: '25min', status: 'not_started', required: true, bloomLevel: 'Understand' },
          { id: 'af-les-1-2', title: 'Your First Python Operator', type: 'Code', duration: '35min', status: 'not_started', required: true, bloomLevel: 'Apply' }
        ]
      }
    ]
  }
];
