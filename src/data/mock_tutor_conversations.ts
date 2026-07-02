// This file contains the MOCK_TUTOR_CONVERSATIONS data objects.
export const MOCK_TUTOR_CONVERSATIONS = [
  {
    id: 'conv-1',
    userId: 'u1',
    title: 'Understanding Docker Volumes',
    preview: 'Can you explain how bind mounts differ from named volumes in Docker?',
    createdAt: '2026-06-18T16:45:00Z'
  },
  {
    id: 'conv-2',
    userId: 'u1',
    title: 'Debugging Python Reference Error',
    preview: 'I got an UnboundLocalError when trying to modify a variable inside a function.',
    createdAt: '2026-06-19T11:20:00Z'
  },
  {
    id: 'conv-3',
    userId: 'u2', // Should NOT show up for user u1
    title: 'Advanced Git Rebase',
    preview: 'How do I interactively rebase the last 5 commits?',
    createdAt: '2026-06-20T15:10:00Z'
  }
];
