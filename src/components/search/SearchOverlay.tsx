import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, X, BookOpen, Clock, FileText, MessageSquare, 
  Trash2, Video, Code, Award, CheckCircle, HelpCircle as QuestionIcon,
  Gamepad2, ClipboardEdit, ExternalLink
} from 'lucide-react';
import { COURSES, RESOURCES, FORUM_CHANNELS, MOCK_NOTES, MOCK_TUTOR_CONVERSATIONS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import type { Lesson } from '../../types';
import Fuse from 'fuse.js';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onNavigate: (page: string) => void;
}

interface FlattenedLesson extends Lesson {
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  moduleNumber: number;
}

// Flatten all lessons across courses (pre-calculated once at module level)
const allLessons: FlattenedLesson[] = COURSES.flatMap(course => 
  course.modules.flatMap(module => 
    module.lessons.map(lesson => ({
      ...lesson,
      courseId: course.id,
      courseTitle: course.title,
      moduleTitle: module.title,
      moduleNumber: module.number
    }))
  )
);

type FlatResultItem = 
  | { type: 'course'; id: string; title: string; courseId: string; enrolled: boolean; data: typeof COURSES[0] }
  | { type: 'lesson'; id: string; title: string; courseId: string; data: FlattenedLesson }
  | { type: 'resource'; id: string; title: string; data: typeof RESOURCES[0] }
  | { type: 'thread'; id: string; title: string; data: typeof FORUM_CHANNELS[0]['messages'][0] }
  | { type: 'note'; id: string; title: string; data: typeof MOCK_NOTES[0] }
  | { type: 'tutor'; id: string; title: string; data: typeof MOCK_TUTOR_CONVERSATIONS[0] };

const allMessages = FORUM_CHANNELS.flatMap(ch => ch.messages);

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onOpen, onNavigate }) => {
  const { setActiveCourseId, user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopResultsRef = useRef<HTMLDivElement>(null);
  const mobileResultsRef = useRef<HTMLDivElement>(null);

  // Persistence of recent searches in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse recent searches from localStorage', e);
    }
    return ["Python basics", "React hooks", "Docker compose", "SQL joins"];
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setSelectedIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const popularTopics = ["Python", "React", "Docker", "SQL", "Git", "FastAPI"];

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const handleClearOrClose = () => {
    if (query) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    localStorage.setItem('recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Focus input when overlay is opened (without setting React state)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Global keydown listeners for escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Search logic: token-based matching across categories
  const getFilteredResults = () => {
    if (!debouncedQuery.trim()) return null;

    const fuseOptions = {
      includeScore: true,
      threshold: 0.4, // Allows some typos
      ignoreLocation: true
    };

    const courseFuse = new Fuse(COURSES, { ...fuseOptions, keys: ['title', 'description', 'level', 'format', 'learningOutcomes'] });
    const lessonFuse = new Fuse(allLessons, { ...fuseOptions, keys: ['title', 'courseTitle', 'moduleTitle'] });
    const resourceFuse = new Fuse(RESOURCES, { ...fuseOptions, keys: ['name', 'courseName', 'type'] });
    const threadFuse = new Fuse(allMessages, { ...fuseOptions, keys: ['title', 'body', 'category', 'moduleName'] });

    // Personal entities
    const userNotes = MOCK_NOTES.filter(n => user && n.userId === 'u1');
    const userTutor = MOCK_TUTOR_CONVERSATIONS.filter(t => user && t.userId === 'u1');
    const noteFuse = new Fuse(userNotes, { ...fuseOptions, keys: ['title', 'content'] });
    const tutorFuse = new Fuse(userTutor, { ...fuseOptions, keys: ['title', 'preview'] });

    const matchedCourses = courseFuse.search(debouncedQuery).map(res => res.item).slice(0, 4);
    const matchedLessons = lessonFuse.search(debouncedQuery).map(res => res.item).slice(0, 4);
    const matchedResources = resourceFuse.search(debouncedQuery).map(res => res.item).slice(0, 4);
    const matchedThreads = threadFuse.search(debouncedQuery).map(res => res.item).slice(0, 4);
    const matchedNotes = noteFuse.search(debouncedQuery).map(res => res.item).slice(0, 4);
    const matchedTutor = tutorFuse.search(debouncedQuery).map(res => res.item).slice(0, 4);

    const totalCount = matchedCourses.length + matchedLessons.length + matchedResources.length + matchedThreads.length + matchedNotes.length + matchedTutor.length;

    return {
      courses: matchedCourses,
      lessons: matchedLessons,
      resources: matchedResources,
      threads: matchedThreads,
      notes: matchedNotes,
      tutor: matchedTutor,
      totalCount
    };
  };

  const results = getFilteredResults();
  const flatResults: FlatResultItem[] = [];

  if (results) {
    results.courses.forEach(c => flatResults.push({ type: 'course', id: `c-${c.id}`, title: c.title, courseId: c.id, enrolled: c.enrolled, data: c }));
    results.lessons.forEach(l => flatResults.push({ type: 'lesson', id: `l-${l.id}`, title: l.title, courseId: l.courseId, data: l }));
    results.resources.forEach(r => flatResults.push({ type: 'resource', id: `r-${r.id}`, title: r.name, data: r }));
    results.threads.forEach(t => flatResults.push({ type: 'thread', id: `t-${t.id}`, title: t.title, data: t }));
    results.notes.forEach(n => flatResults.push({ type: 'note', id: `n-${n.id}`, title: n.title, data: n }));
    results.tutor.forEach(t => flatResults.push({ type: 'tutor', id: `tu-${t.id}`, title: t.title, data: t }));
  }

  // Scroll active item into view
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    const container = isDesktop ? desktopResultsRef.current : mobileResultsRef.current;
    if (container && selectedIndex >= 0) {
      const selectedEl = container.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, flatResults.length]);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 6);
    });
  };

  const deleteRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(t => t !== term));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
  };


  const handleSelectResult = (item: FlatResultItem) => {
    addRecentSearch(query || item.title);
    
    switch (item.type) {
      case 'course':
        setActiveCourseId(item.courseId);
        onNavigate(item.enrolled ? 'learning-path' : 'course-detail');
        break;
      case 'lesson':
        setActiveCourseId(item.courseId);
        onNavigate('content-player');
        break;
      case 'resource':
        onNavigate('resources');
        break;
      case 'thread':
        onNavigate('community');
        break;
      case 'note':
        onNavigate('profile');
        break;
      case 'tutor':
        onNavigate('ai-tutor');
        break;
    }
    handleClose();
  };

  // Keyboard navigation inside input / overlay
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (flatResults.length === 0) return;
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      if (flatResults.length === 0) return;
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults.length > 0) {
        const selectedItem = flatResults[selectedIndex];
        if (selectedItem) {
          handleSelectResult(selectedItem);
        }
      } else if (query.trim()) {
        addRecentSearch(query);
        handleClose();
      }
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="w-4 h-4 text-cyan" />;
      case 'Code': return <Code className="w-4 h-4 text-yellow" />;
      case 'Quiz': return <Award className="w-4 h-4 text-purple" />;
      case 'Live Event': return <Clock className="w-4 h-4 text-orange" />;
      case 'H5P': return <Gamepad2 className="w-4 h-4 text-pink-400" />;
      case 'Assignment': return <ClipboardEdit className="w-4 h-4 text-blue-400" />;
      case 'External': return <ExternalLink className="w-4 h-4 text-green-400" />;
      default: return <BookOpen className="w-4 h-4 text-muted" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red" />;
      case 'video': return <Video className="w-4 h-4 text-cyan" />;
      default: return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const renderSearchResults = (containerRef: React.RefObject<HTMLDivElement>) => (
    <>
      {/* Dynamic Content Body */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
          {/* Default state when query is empty */}
          {!query.trim() ? (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Recent Searches</span>
                  {recentSearches.length > 0 && (
                    <button 
                      onClick={clearAllRecent}
                      className="text-[11px] font-semibold text-cyan hover:underline hover:text-cyan2 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>
                {recentSearches.length > 0 ? (
                  <div className="space-y-0.5 max-w-2xl">
                    {recentSearches.map((search, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setQuery(search);
                          inputRef.current?.focus();
                        }}
                        className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-bg/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 text-xs font-semibold text-text min-w-0">
                          <Clock className="w-4 h-4 text-muted group-hover:text-cyan transition-colors shrink-0" />
                          <span className="truncate">{search}</span>
                        </div>
                        <button 
                          onClick={(e) => deleteRecentSearch(e, search)}
                          className="p-1 text-muted hover:text-red hover:bg-line/45 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-line bg-bg/10 text-center text-xs text-muted/60 max-w-2xl">
                    No recent searches yet
                  </div>
                )}
              </div>

              {/* Popular tags/topics */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Popular Topics</span>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(topic);
                        inputRef.current?.focus();
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-bg/60 border border-line hover:border-cyan text-text hover:text-cyan transition-all cursor-pointer"
                    >
                      #{topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : flatResults.length > 0 ? (
            /* Results listing */
            <div className="space-y-5">
              {/* Courses Category */}
              {results && results.courses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Courses</span>
                  <div className="space-y-1.5">
                    {results.courses.map((course) => {
                      const flatIndex = flatResults.findIndex(item => item.id === `c-${course.id}`);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <div
                          key={course.id}
                          data-index={flatIndex}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => handleSelectResult(flatResults[flatIndex])}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all cursor-pointer gap-2 ${
                            isSelected 
                              ? 'bg-line/40 border-cyan shadow-sm shadow-cyan/5' 
                              : 'bg-bg/20 border-line hover:border-line/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-panel border border-line rounded-lg text-cyan">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-text">{course.title}</h4>
                              <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{course.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-line bg-panel text-muted">
                              {course.level}
                            </span>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                              course.enrolled 
                                ? 'bg-green/10 text-green border border-green/20' 
                                : 'bg-cyan/15 text-cyan border border-cyan/20'
                            }`}>
                              {course.enrolled ? 'Enrolled' : 'Available'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lessons & Topics Category */}
              {results && results.lessons.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Lessons & Syllabus</span>
                  <div className="space-y-1.5">
                    {results.lessons.map((lesson) => {
                      const flatIndex = flatResults.findIndex(item => item.id === `l-${lesson.id}`);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <div
                          key={lesson.id}
                          data-index={flatIndex}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => handleSelectResult(flatResults[flatIndex])}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-line/40 border-cyan shadow-sm shadow-cyan/5' 
                              : 'bg-bg/20 border-line hover:border-line/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-panel border border-line rounded-lg">
                              {getLessonIcon(lesson.type)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-text truncate">{lesson.title}</h4>
                              <p className="text-[10px] text-muted truncate mt-0.5">
                                Module {lesson.moduleNumber}: {lesson.moduleTitle} • {lesson.courseTitle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted">{lesson.duration}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Files & Resources Category */}
              {results && results.resources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Resources & Scripts</span>
                  <div className="space-y-1.5">
                    {results.resources.map((res) => {
                      const flatIndex = flatResults.findIndex(item => item.id === `r-${res.id}`);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <div
                          key={res.id}
                          data-index={flatIndex}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => handleSelectResult(flatResults[flatIndex])}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-line/40 border-cyan shadow-sm shadow-cyan/5' 
                              : 'bg-bg/20 border-line hover:border-line/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-panel border border-line rounded-lg">
                              {getResourceIcon(res.type)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-text truncate">{res.name}</h4>
                              <p className="text-[10px] text-muted truncate mt-0.5">
                                {res.courseName} • Size: {res.size}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-line bg-panel text-muted shrink-0">
                            {res.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Forum Category */}
              {results && results.threads.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Community Discussions</span>
                  <div className="space-y-1.5">
                    {results.threads.map((thread) => {
                      const flatIndex = flatResults.findIndex(item => item.id === `t-${thread.id}`);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <div
                          key={thread.id}
                          data-index={flatIndex}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => handleSelectResult(flatResults[flatIndex])}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-line/40 border-cyan shadow-sm shadow-cyan/5' 
                              : 'bg-bg/20 border-line hover:border-line/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-panel border border-line rounded-lg text-purple">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-text truncate">{thread.title}</h4>
                              <p className="text-[10px] text-muted truncate mt-0.5">
                                by {thread.author} in {thread.category} • {thread.replies.length} replies
                              </p>
                            </div>
                          </div>
                          {thread.hasAcceptedAnswer && (
                            <span className="flex items-center gap-1 text-[9px] bg-green/10 text-green border border-green/20 font-bold px-1.5 py-0.5 rounded shrink-0">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Solved
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes Category */}
              {results && results.notes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Personal Notes</span>
                  <div className="space-y-1.5">
                    {results.notes.map((note) => {
                      const flatIndex = flatResults.findIndex(item => item.id === `n-${note.id}`);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <div
                          key={note.id}
                          data-index={flatIndex}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => handleSelectResult(flatResults[flatIndex])}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-line/40 border-cyan shadow-sm shadow-cyan/5' 
                              : 'bg-bg/20 border-line hover:border-line/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-panel border border-line rounded-lg text-yellow">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-text truncate">{note.title}</h4>
                              <p className="text-[10px] text-muted truncate mt-0.5">{note.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Tutor Category */}
              {results && results.tutor.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">AI Tutor Conversations</span>
                  <div className="space-y-1.5">
                    {results.tutor.map((chat) => {
                      const flatIndex = flatResults.findIndex(item => item.id === `tu-${chat.id}`);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <div
                          key={chat.id}
                          data-index={flatIndex}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => handleSelectResult(flatResults[flatIndex])}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-line/40 border-cyan shadow-sm shadow-cyan/5' 
                              : 'bg-bg/20 border-line hover:border-line/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-panel border border-line rounded-lg text-green">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-text truncate">{chat.title}</h4>
                              <p className="text-[10px] text-muted truncate mt-0.5">{chat.preview}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state for active search queries that yield no results */
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-panel border border-line flex items-center justify-center mx-auto text-muted">
                <QuestionIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-text">No matches found for "{query}"</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Try searching for keywords like "Python", "React", "Docker", "Database", "tuple", or check spelling.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Keybind Help */}
        {flatResults.length > 0 && (
          <div className="bg-panel2 border-t border-line px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-muted shrink-0">
            <div className="flex items-center gap-4">
              <span className="hidden md:flex items-center gap-1.5">
                <span className="bg-bg px-1 py-0.5 rounded border border-line font-mono">↑↓</span>
                Navigate
              </span>
              <span className="hidden md:flex items-center gap-1.5">
                <span className="bg-bg px-1.5 py-0.5 rounded border border-line font-mono">↵</span>
                Select
              </span>
              <button onClick={handleClose} className="flex items-center gap-1.5 cursor-pointer hover:text-text transition-colors">
                <span className="bg-bg p-1 rounded border border-line"><X className="w-3 h-3" /></span>
                <span className="hidden md:inline">Close</span>
              </button>
            </div>
            <div className="text-right">
              Found {flatResults.length} {flatResults.length === 1 ? 'result' : 'results'}
            </div>
          </div>
        )}
    </>
  );

  return (
    <>
      {/* Desktop Search Input & Dropdown */}
      <div className="relative w-full hidden md:block z-[70]">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${isOpen ? 'text-cyan' : 'text-muted'}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search courses, lessons, resources..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onFocus={onOpen}
          onKeyDown={handleKeyDown}
          className={`w-full bg-bg border pl-10 pr-4 py-2 text-sm text-text focus:outline-none transition-all search-overlay-input ${
            isOpen ? 'bg-panel border-line rounded-t-2xl rounded-b-none border-b-0 relative z-[65]' : 'rounded-2xl border-line hover:border-line/80'
          }`}
        />
        {!isOpen && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] bg-panel border border-line px-1.5 py-0.5 rounded font-bold text-muted font-mono select-none pointer-events-none">
            <span>⌘</span>K
          </kbd>
        )}
        {isOpen && query && (
          <button 
            onClick={handleClearOrClose} 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-line/50 rounded-lg text-muted hover:text-text transition-colors z-[65]"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Desktop Dropdown */}
        <div 
          className={`absolute top-full left-0 w-full bg-panel flex flex-col overflow-hidden transition-all duration-300 transform origin-top border border-line rounded-b-2xl border-t-0 shadow-2xl ${
            isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
          } max-h-[80vh] z-[64]`}
        >
          {renderSearchResults(desktopResultsRef)}
        </div>
      </div>

      {/* Desktop Backdrop */}
      <div 
        className={`hidden md:block fixed inset-0 z-[60] bg-bg/40 backdrop-blur-[2px] transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Mobile Overlay */}
      <div className={`md:hidden fixed inset-0 z-[80] bg-panel flex flex-col transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center px-4 py-3 border-b border-line gap-3 relative shrink-0">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-text text-sm sm:text-base placeholder:text-muted/50 py-1"
          />
          <button 
            onClick={handleClearOrClose} 
            className="p-1.5 hover:bg-bg rounded-lg text-muted hover:text-text transition-colors cursor-pointer flex items-center shrink-0"
            title={query ? "Clear search text" : "Close search"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderSearchResults(mobileResultsRef)}
      </div>
    </>
  );
};
