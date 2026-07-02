import type { ForumChannel } from '../types';

// This file contains the FORUM_CHANNELS data objects.
export const FORUM_CHANNELS: ForumChannel[] = [
  {
    id: 'general',
    name: 'general',
    courseId: 'all',
    description: 'General discussion and announcements for all learners.',
    isJoined: true,
    messages: [
      {
        id: 'msg-gen-1',
        title: 'Welcome to the Manthio Community!',
        author: 'System',
        body: 'Feel free to ask any general questions here. Course-specific questions should be asked in the respective course channels.',
        category: 'General',
        upvotes: 24,
        replies: [],
        hasAcceptedAnswer: false,
        timestamp: 'Jan 01, 2026',
        tags: ['welcome']
      }
    ]
  },
  {
    id: 'ch-python-bootcamp',
    name: 'python-bootcamp',
    courseId: 'python-bootcamp',
    description: 'Python syntax, data structures, and OOP paradigms.',
    isJoined: true,
    messages: [
      {
        id: 'msg-py-1',
        title: 'What is the difference between a list and a tuple?',
        author: 'Marc K.',
        body: "I'm currently learning the data structure module in Python and wondering when to use a tuple instead of a list. Immutability is clear, but are there performance differences or other rules of thumb?",
        category: 'Python Bootcamp',
        moduleName: 'Data Structures',
        upvotes: 8,
        replies: [
          {
            id: 'rep-py-1-1',
            author: 'Dr. Sarah Chen',
            body: 'Tuples are generally slightly faster and consume less memory than lists because they have a fixed size. Use them for heterogeneous data or data that absolutely should not change during execution.',
            timestamp: 'Jun 14, 2026',
            upvotes: 5,
            isAcceptedAnswer: true,
          }
        ],
        hasAcceptedAnswer: true,
        timestamp: 'Jun 14, 2026',
        tags: ['data-structures', 'performance']
      },
      {
        id: 'msg-py-2',
        title: 'Error message when activating "venv" under Windows PowerShell',
        author: 'Tanya S.',
        body: 'When I try to activate my venv via `.\\venv\\Scripts\\Activate.ps1`, I get an Execution_Policies error from Windows. What can I do?',
        category: 'Python Bootcamp',
        moduleName: 'Setup & Python Basics',
        upvotes: 12,
        replies: [
          {
            id: 'rep-py-2-1',
            author: 'AI Tutor',
            body: 'Socratic assistance: To fix this PowerShell ExecutionPolicy error, you might need to adjust the policy for your local user. Open PowerShell as an administrator and enter `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. Do you know why PowerShell blocks scripts by default?',
            timestamp: 'Yesterday, 18:22',
            upvotes: 2,
            isAiSuggested: true
          }
        ],
        hasAcceptedAnswer: false,
        timestamp: 'Yesterday, 18:22',
        isAnonymous: false,
        tags: ['venv', 'windows']
      }
    ]
  },
  {
    id: 'ch-react-web-development',
    name: 'react-web-development',
    courseId: 'react-web-development',
    description: 'Learn dynamic UI state management, hooks, and routing.',
    isJoined: true,
    messages: [
      {
        id: 'msg-react-1',
        title: 'useEffect vs useLayoutEffect?',
        author: 'Alex Chen',
        body: 'When exactly should I reach for useLayoutEffect instead of useEffect? The docs say it fires synchronously after all DOM mutations but before browser paint.',
        category: 'Web Development with React',
        moduleName: 'Hooks',
        upvotes: 4,
        replies: [],
        hasAcceptedAnswer: false,
        timestamp: '2 hours ago',
        tags: ['hooks', 'useEffect']
      }
    ]
  }
];
