import type { ResourceFile } from '../types';

// This file contains the RESOURCES data objects.
export const RESOURCES: ResourceFile[] = [
  {
    id: 'file-zip',
    name: 'Source Assets.zip',
    type: 'archive',
    courseName: 'Design Systems',
    uploadDate: 'Apr 05, 2026',
    accessLevel: 'All Learners',
    size: '15.4 MB',
    url: '/resource/source-assets.zip'
  },
  { 
    id: 'file-1', 
    name: 'Manthio Requirements.pdf', 
    type: 'pdf', 
    courseName: 'Project Management', 
    uploadDate: 'Jan 15, 2026', 
    accessLevel: 'All Learners', 
    size: '1.2 MB', 
    url: 'public/Manthio_Learner_Frontend_Requirements.pdf' 
  },
  { 
    id: 'file-2', 
    name: 'Branding Overview.png', 
    type: 'image', 
    courseName: 'Design Systems', 
    uploadDate: 'Feb 01, 2026', 
    accessLevel: 'All Learners', 
    size: '850 KB', 
    url: '/resource/branding-overview.png' 
  },
  { 
    id: 'file-3', 
    name: 'Python Utility Script.py', 
    type: 'code', 
    courseName: 'Python Bootcamp', 
    uploadDate: 'Feb 10, 2026', 
    accessLevel: 'All Learners', 
    size: '4 KB', 
    url: '/resource/script.py' 
  },
  { 
    id: 'file-4', 
    name: 'Data Analysis Lab.ipynb', 
    type: 'notebook', 
    courseName: 'Python Bootcamp', 
    uploadDate: 'Feb 12, 2026', 
    accessLevel: 'Cohort Only', 
    size: '12 KB', 
    url: '/resource/analysis.ipynb' 
  },
  { 
    id: 'file-5', 
    name: 'Brand Foundation.docx', 
    type: 'office', 
    courseName: 'Design Systems', 
    uploadDate: 'Feb 15, 2026', 
    accessLevel: 'All Learners', 
    size: '2.5 MB', 
    url: '/resource/brand-foundation.docx' 
  },
  { 
    id: 'file-6', 
    name: 'Platform Notes.txt', 
    type: 'code', 
    courseName: 'Project Management', 
    uploadDate: 'Feb 18, 2026', 
    accessLevel: 'All Learners', 
    size: '1 KB', 
    url: '/resource/notes.txt' 
  },
  {
    id: 'file-7',
    name: 'Introduction to Manthio.mp4',
    type: 'video',
    courseName: 'Design Systems',
    uploadDate: 'Mar 01, 2026',
    accessLevel: 'All Learners',
    size: '1 MB',
    url: '/resource/sample.mp4'
  }
];
