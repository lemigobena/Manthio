import type { Trainer } from '../types';

// This file contains the TRAINERS data objects.
export const TRAINERS: Record<string, Trainer> = {
  'david-pinezich': {
    id: 'david-pinezich',
    name: 'David Pinezich',
    title: 'Experienced IT Architect & Python Trainer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150',
    bio: 'Experienced IT architect and trainer specializing in Python, Cloud Architecture, and Enterprise Security. David has over 15 years of industry experience and has led bootcamps for major corporations in Switzerland.',
    linkedIn: 'https://linkedin.com/in/davidpinezich',
    website: 'https://apigenio.ch'
  },
  'marc-kaufmann': {
    id: 'marc-kaufmann',
    name: 'Marc Kaufmann',
    title: 'DevOps & Automation Engineer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
    bio: 'Expert in streamlining development pipelines and cloud-native deployments. Marc has helped dozens of teams migrate to automated CI/CD workflows and high-availability container clusters.',
    linkedIn: 'https://linkedin.com/in/marckaufmann'
  }
};
