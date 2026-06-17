import React, { useState } from 'react';
import { COURSES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Search, SlidersHorizontal, BookOpen, Award, Clock } from 'lucide-react';

interface CatalogProps {
  onNavigate: (page: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onNavigate }) => {
  const { setActiveCourseId } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // Filter courses
  const filteredCourses = COURSES.filter(course => {
    // Tab filtering
    if (activeTab === 'enrolled' && !course.enrolled) return false;
    if (activeTab === 'completed' && course.progress < 100) return false;

    // Search query filtering
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) && !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter selectors
    if (selectedLevel !== 'All' && course.level !== selectedLevel) return false;
    if (selectedFormat !== 'All' && course.format !== selectedFormat) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Kurskatalog</h1>
          <p className="text-muted text-sm mt-1">Entdecke neue Themen oder führe deine bestehenden Kurse fort.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Nach Kursen oder Themen suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-panel border border-line rounded-xl pl-10 pr-4 py-2 text-sm text-text focus:border-cyan focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-muted" />
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex space-x-1 bg-panel border border-line p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'all' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
          >
            Alle Kurse ({COURSES.length})
          </button>
          <button 
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'enrolled' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
          >
            Meine Kurse ({COURSES.filter(c => c.enrolled).length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'completed' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}
          >
            Abgeschlossen ({COURSES.filter(c => c.progress === 100).length})
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4 h-4 text-muted" />
          
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-panel border border-line text-xs rounded-lg px-3 py-1.5 text-text focus:outline-none focus:border-cyan"
          >
            <option value="All">Alle Niveaus</option>
            <option value="Foundation">Grundlagen</option>
            <option value="Intermediate">Mittelstufe</option>
            <option value="Advanced">Fortgeschritten</option>
          </select>

          <select 
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="bg-panel border border-line text-xs rounded-lg px-3 py-1.5 text-text focus:outline-none focus:border-cyan"
          >
            <option value="All">Alle Formate</option>
            <option value="flipped">Flipped (Hybrid)</option>
            <option value="self-paced">Selbstgesteuert</option>
            <option value="cohort">Kohorte</option>
          </select>
        </div>
      </div>

      {/* Grid of Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-line rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="font-bold text-text">Keine Kurse gefunden</h3>
          <p className="text-muted text-sm mt-1">Passe deine Such- oder Filtereinstellungen an.</p>
          <button 
            onClick={() => { setSelectedLevel('All'); setSelectedFormat('All'); setSearchQuery(''); setActiveTab('all'); }}
            className="mt-4 bg-cyan hover:bg-cyan2 text-bg text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div 
              key={course.id} 
              className="bg-panel border border-line rounded-2xl overflow-hidden hover:border-cyan/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Image */}
                <div className="h-44 relative bg-bg overflow-hidden border-b border-line">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-bg/90 backdrop-blur border border-line text-[10px] px-2 py-0.5 rounded font-bold uppercase text-text">
                      {course.level}
                    </span>
                    <span className="bg-cyan/95 text-bg text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {course.format === 'flipped' ? 'Flipped' : course.format === 'self-paced' ? 'Self-paced' : 'Cohort'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-text hover:text-cyan transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted text-xs line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 pt-3 text-xs text-muted">
                    <div className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{course.xpReward} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.format === 'flipped' ? '2 Tage + Self-study' : 'Selbstgesteuert'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0 border-t border-line mt-4 flex items-center justify-between">
                <div>
                  {course.enrolled ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted font-semibold block">Fortschritt</span>
                      <span className="text-xs font-bold text-cyan">{course.progress}% abgeschlossen</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-text">{course.price}</span>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setActiveCourseId(course.id);
                    if (course.enrolled) {
                      onNavigate('learning-path');
                    } else {
                      onNavigate('course-detail');
                    }
                  }}
                  className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {course.enrolled ? 'Fortsetzen' : 'Details & Buchung'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
