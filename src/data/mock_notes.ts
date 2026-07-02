// This file contains the MOCK_NOTES data objects.
export const MOCK_NOTES = [
  {
    id: 'note-1',
    userId: 'u1', // Matches default mock user ID
    title: 'Python Notes: Lists vs Tuples',
    content: 'Tuples are immutable. Lists are mutable. Use tuples for fixed data like coordinates.',
    createdAt: '2026-06-20T10:00:00Z'
  },
  {
    id: 'note-2',
    userId: 'u1',
    title: 'React Hooks Reminders',
    content: 'Always include all dependencies in the useEffect dependency array to avoid stale closures.',
    createdAt: '2026-06-21T14:30:00Z'
  },
  {
    id: 'note-3',
    userId: 'u2', // Should NOT show up for user u1
    title: 'Secret Project Notes',
    content: 'This note belongs to someone else and should not be searchable.',
    createdAt: '2026-06-22T09:00:00Z'
  }
];
