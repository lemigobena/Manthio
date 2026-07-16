import React, { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { COURSES, TRACKS } from '../../services/mockData';
import { Award, BookOpen, ChevronLeft, Clock, Layers, Star, Trash2, X } from 'lucide-react';
import type { CareerTrack, Course } from '../../types';

const RECENT_KEY = 'manthio_catalog_recent_searches';

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

interface CatalogSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCourse: (course: Course) => void;
  onOpenTrack: (track: CareerTrack) => void;
}

export const CatalogSearch: React.FC<CatalogSearchProps> = ({ isOpen, onClose, onOpenCourse, onOpenTrack }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecent);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularTopics = ['Python', 'React', 'Docker', 'SQL', 'Cloud', 'Data'];

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const courseFuse = useMemo(
    () => new Fuse(COURSES, {
      threshold: 0.4,
      ignoreLocation: true,
      keys: ['title', 'description', 'topic', 'tags', 'trainer.name'],
    }),
    []
  );
  const trackFuse = useMemo(
    () => new Fuse(TRACKS as unknown as CareerTrack[], {
      threshold: 0.4,
      ignoreLocation: true,
      keys: ['title', 'description', 'outcomeStatement', 'tags'],
    }),
    []
  );

  const trimmed = query.trim();
  const matchedCourses = trimmed ? courseFuse.search(trimmed).map(r => r.item).slice(0, 8) : [];
  const matchedTracks = trimmed ? trackFuse.search(trimmed).map(r => r.item).slice(0, 4) : [];
  const hasResults = matchedCourses.length > 0 || matchedTracks.length > 0;

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== term.toLowerCase());
      return [term.trim(), ...filtered].slice(0, 6);
    });
  };

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleClearOrClose = () => {
    if (query) {
      setQuery('');
      inputRef.current?.focus();
    } else {
      handleClose();
    }
  };

  const submitSearch = () => {
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    addRecentSearch(trimmed);
    inputRef.current?.blur();
  };

  const selectTrack = (track: CareerTrack) => {
    addRecentSearch(query || track.title);
    handleClose();
    onOpenTrack(track);
  };

  const selectCourse = (course: Course) => {
    addRecentSearch(query || course.title);
    handleClose();
    onOpenCourse(course);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-bg flex flex-col animate-[fadeIn_0.15s_ease-out] pt-[76px]">
      {/* Search header: back button + visible text box */}
      <div className="flex items-center px-3 py-3 border-b border-line gap-2 shrink-0">
        <button
          onClick={handleClose}
          title="Back to catalog"
          className="p-2 rounded-xl text-muted hover:text-text hover:bg-panel transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search courses and tracks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') handleClose();
              if (e.key === 'Enter') submitSearch();
            }}
            className="w-full bg-panel border border-line rounded-xl pl-4 pr-10 py-2.5 text-sm text-text placeholder:text-muted/50 outline-none !outline-none focus:outline-none focus:ring-0 focus:border-line transition-colors"
          />
          {query && (
            <button
              onClick={handleClearOrClose}
              title="Clear search text"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted hover:text-text transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!trimmed ? (
          <div className="space-y-6">
            {/* Recent searches */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Recent Searches</span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => setRecentSearches([])}
                    className="text-[11px] font-semibold text-cyan hover:text-cyan/80 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-0.5">
                  {recentSearches.map(term => (
                    <div
                      key={term}
                      onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                      className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-panel transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 text-xs font-semibold text-text min-w-0">
                        <Clock className="w-4 h-4 text-muted group-hover:text-cyan transition-colors shrink-0" />
                        <span className="truncate">{term}</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setRecentSearches(prev => prev.filter(t => t !== term));
                        }}
                        className="p-1 text-muted hover:text-red rounded-lg transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-line text-center text-xs text-muted/60">
                  No recent searches yet
                </div>
              )}
            </div>

            {/* Popular topics */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Popular Topics</span>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => { setQuery(topic); inputRef.current?.focus(); }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-panel border border-line hover:border-cyan text-text hover:text-cyan transition-all cursor-pointer"
                  >
                    #{topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : hasResults ? (
          <div className="space-y-5">
            {/* Tracks */}
            {matchedTracks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Career Tracks</span>
                <div className="space-y-1.5">
                  {matchedTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => selectTrack(track)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-line bg-panel hover:border-cyan/50 transition-all cursor-pointer text-left"
                    >
                      <img src={track.imageUrl} alt={track.title} className="w-14 h-14 rounded-lg object-cover border border-line shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-text truncate">{track.title}</h4>
                        <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{track.outcomeStatement}</p>
                        <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-muted">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-cyan" />{track.coursesCount} courses</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan" />{track.estimatedTime}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/20">
                        Track
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {matchedCourses.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Courses</span>
                <div className="space-y-1.5">
                  {matchedCourses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => selectCourse(course)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-line bg-panel hover:border-cyan/50 transition-all cursor-pointer text-left"
                    >
                      <img src={course.imageUrl} alt={course.title} className="w-14 h-14 rounded-lg object-cover border border-line shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-text truncate">{course.title}</h4>
                        <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{course.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-muted">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan" />{course.duration}</span>
                          <span className="flex items-center gap-1"><Award className="w-3 h-3 text-cyan" />+{course.xpReward} XP</span>
                          {course.rating !== undefined && (
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow fill-yellow" />{course.rating}</span>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                        course.enrolled
                          ? 'bg-green/10 text-green border-green/20'
                          : 'bg-bg text-muted border-line'
                      }`}>
                        {course.enrolled ? 'Enrolled' : course.level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-panel border border-line flex items-center justify-center mx-auto text-muted">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text">No courses or tracks found for "{trimmed}"</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try keywords like "Python", "Cloud", "Data" — or check the spelling.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
