import type { ChatMessage } from '../types';

export interface ChatSessionData {
  id: string;
  title: string;
  messages: ChatMessage[];
  context: {
    module: string;
    lesson: string;
    progress: number;
    weakPoints: { label: string; color: string }[];
    snippets: { title: string; content: string }[];
  };
}

// This file contains the AI Tutor chat sessions data that varies from user to user.
// Each user can have multiple chat sessions with messages and context.
export const AI_SESSIONS: Record<string, ChatSessionData> = {
  'chat-1': {
    id: 'chat-1',
    title: 'Contextual Awareness (16.5)',
    messages: [
      { id: 's1', sender: 'system', text: 'Session started: Module 3 Context Active', timestamp: '14:29' },
      { id: 'm1', sender: 'tutor', text: 'Hello! I see you\'re working on Module 3: Workshop A. I also notice you\'ve struggled with OOP Concepts in the past. How can I help you today?', timestamp: '14:30', source: 'Course docs', sourceLink: '#/docs/module-3/oop-concepts' }
    ],
    context: {
      module: 'Module 3: Workshop A',
      lesson: 'Lesson 4.2: OOP & Recursion',
      progress: 60,
      weakPoints: [
        { label: 'OOP Concepts', color: 'bg-red' },
        { label: 'Recursion', color: 'bg-orange' }
      ],
      snippets: [
        { title: 'Class Definition', content: '"class Node: def __init__(self):..."' }
      ]
    }
  },
  'chat-2': {
    id: 'chat-2',
    title: 'Rich Content Demo (16.4.2)',
    messages: [
      { id: 's2', sender: 'system', text: 'History Loaded: Yesterday', timestamp: 'Jun 21 16:00' },
      { id: 'u2', sender: 'user', text: 'Can you show me a Python code block and some math?', timestamp: '16:05' },
      { id: 'm2', sender: 'tutor', text: 'Certainly! Here is a simple Python function to calculate the area of a circle:\n\n```python\nimport math\n\ndef circle_area(radius):\n    return math.pi * (radius ** 2)\n```\n\nThe mathematical formula for this is:\n\n$$ A = \\pi r^2 $$\n\nWhere $A$ is the area and $r$ is the radius.', timestamp: '16:06', source: 'Course docs', sourceLink: '#/docs/python-math/formulas' }
    ],
    context: {
      module: 'Module 2: Math and Logic',
      lesson: 'Lesson 2.1: Advanced Math',
      progress: 100,
      weakPoints: [],
      snippets: []
    }
  },
  'chat-3': {
    id: 'chat-3',
    title: 'Source Fallback (16.10.3)',
    messages: [
      { id: 's3', sender: 'system', text: 'Diagnostic Mode: Source Engine Testing', timestamp: 'Jun 08 10:00' },
      { id: 'u3', sender: 'user', text: 'What is the speed of light in a vacuum?', timestamp: '10:01' },
      { 
        id: 'm3', 
        sender: 'tutor', 
        text: 'I can\'t find specific data about physical constants in the Python Bootcamp materials. Would you like me to ask the Cloud AI?', 
        timestamp: '10:02', 
        source: 'Course docs',
        sourceLink: '#/docs/python/constants'
      }
    ],
    context: {
      module: 'Module 1: Setup',
      lesson: 'Lesson 1.4: Virtual Environments',
      progress: 85,
      weakPoints: [],
      snippets: []
    }
  },
  'chat-4': {
    id: 'chat-4',
    title: 'Rate Limit (16.9)',
    messages: [
      { id: 's4', sender: 'system', text: 'Session: Rate Limit Test', timestamp: 'Jun 08 10:00' },
      { id: 'u4', sender: 'user', text: 'Please analyze this 5000 line dataset.', timestamp: '10:01' },
      { id: 'sys1', sender: 'system', text: 'You\'ve reached today\'s free AI Tutor limit (10/10 messages). Please upgrade to PRO for unlimited access, or try again tomorrow.', timestamp: '10:02' }
    ],
    context: {
      module: 'Module 1: Intro',
      lesson: 'Lesson 1.1: Math Operators',
      progress: 20,
      weakPoints: [],
      snippets: []
    }
  },
  'chat-5': {
    id: 'chat-5',
    title: 'Socratic Mode (16.9.1)',
    messages: [
      { id: 's5', sender: 'system', text: 'Socratic Comprehension Probe Active', timestamp: 'Jun 08 10:00' },
      { id: 'u5', sender: 'user', text: 'Can you just give me the answer for the exercise 4.1? My code keeps failing.', timestamp: '10:01' },
      { id: 'm5', sender: 'tutor', text: 'I noticed your loop condition is causing an infinite loop. Instead of giving you the exact answer, can you tell me in your own words what happens when `i` is never incremented inside the `while` block?', timestamp: '10:02', source: 'Course docs' }
    ],
    context: {
      module: 'Module 4: Loops',
      lesson: 'Exercise 4.1',
      progress: 40,
      weakPoints: [],
      snippets: []
    }
  }
};

