// This file contains quiz and assessment questions that vary based on the course or weakness.

export const QUIZ_QUESTIONS = [
  {
    q: 'Have you written any code in the language covered by this track?',
    options: ['Never', 'A little bit', 'Yes, regularly'],
    weights: [0, 1, 2],
  },
  {
    q: 'Have you completed any formal or structured course on this topic before?',
    options: ['No', 'An intro course', 'Multiple courses'],
    weights: [0, 1, 2],
  },
  {
    q: 'Can you explain what a function or method is without looking it up?',
    options: ["Not really", 'I have a rough idea', 'Yes, confidently'],
    weights: [0, 1, 2],
  },
  {
    q: 'Have you built any project (even personal/hobby) related to this domain?',
    options: ['No project', 'One small project', 'Multiple projects'],
    weights: [0, 1, 2],
  },
];

export const REVIEW_QUESTIONS: Record<string, { question: string; options: string[]; correctIndex: number; explanation: string }> = {
    'oop': {
      question: 'Which method is called automatically when an object of a class is instantiated in Python?',
      options: ['__init__', '__new__', 'constructor', 'init'],
      correctIndex: 0,
      explanation: 'The __init__ method is Python\'s initializer method, run automatically after object instantiation.'
    },
    'errors': {
      question: 'Which keyword is used to trigger an exception manually in Python?',
      options: ['raise', 'throw', 'assert', 'except'],
      correctIndex: 0,
      explanation: 'In Python, the raise keyword is used to prompt or raise exceptions manually.'
    }
  };

