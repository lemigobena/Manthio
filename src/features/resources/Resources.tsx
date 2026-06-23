import React, { useState } from 'react';
import { RESOURCES } from '../../services/mockData';
import { 
  Search, FolderOpen, FileText, Video, FolderArchive, ArrowDownToLine, 
  Eye, AlertCircle, Bookmark, Share2, Filter, ChevronDown, 
  FileCode, Database, ImageIcon, Notebook as NotebookIcon, Calendar, X
} from 'lucide-react';
import type { ResourceFile, Lesson } from '../../types';
import { PdfRenderer } from '../content-player/renderers/PdfRenderer';
import { DocxRenderer } from '../content-player/renderers/DocxRenderer';
import { CodeRenderer } from '../content-player/renderers/CodeRenderer';

interface ResourcesProps {
  onNavigate?: (page: string) => void;
}

export const Resources: React.FC<ResourcesProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All Courses');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('All Levels');
  const [view, setView] = useState<'My Files' | 'Knowledge Base'>('My Files');
  const [layout, setLayout] = useState<'table' | 'grid'>('table');
  const [previewFile, setPreviewFile] = useState<ResourceFile | null>(null);
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);

  // Loading & Error States (REQ-LOAD-002, REQ-LOAD-004)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    let active = true;
    if (previewFile?.url && ['code', 'notebook', 'office'].includes(previewFile.type)) {
      fetch(previewFile.url)
        .then(res => res.text())
        .then(text => {
          if (active) setFetchedContent(text);
        })
        .catch(err => {
          console.error("Failed to fetch file content:", err);
          if (active) setFetchedContent("Failed to load file content.");
        });
    }
    return () => { 
      active = false;
      setFetchedContent(null);
    };
  }, [previewFile]);

  const simulateLoad = () => {
    setIsLoading(true);
    setIsError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return timer;
  };

  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 750);
  };

  const filteredFiles = RESOURCES.filter(file => {
    if (searchQuery && 
        !file.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !file.courseName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'All' && file.type !== selectedType) return false;
    if (selectedCourse !== 'All Courses' && file.courseName !== selectedCourse) return false;
    if (selectedAccessLevel !== 'All Levels' && file.accessLevel !== selectedAccessLevel) return false;
    return true;
  }).sort((a, b) => a.courseName.localeCompare(b.courseName));

  const courses = Array.from(new Set(RESOURCES.map(f => f.courseName)));
  const accessLevels = Array.from(new Set(RESOURCES.map(f => f.accessLevel)));

  const getFileIcon = (type: ResourceFile['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red" />;
      case 'video': return <Video className="w-4 h-4 text-cyan" />;
      case 'archive': return <FolderArchive className="w-4 h-4 text-yellow" />;
      case 'notebook': return <NotebookIcon className="w-4 h-4 text-purple" />;
      case 'code': return <FileCode className="w-4 h-4 text-green" />;
      case 'office': return <Database className="w-4 h-4 text-blue" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-pink" />;
      default: return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Resource Center</h1>
            <p className="text-muted text-sm mt-1">Centralised access to all files associated with your enrolled courses.</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-panel border border-line rounded-xl p-1 w-fit">
            <button 
              onClick={() => { setView('My Files'); simulateLoad(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'My Files' ? 'bg-bg text-cyan shadow-sm' : 'text-muted hover:text-text'}`}
            >
              My Files
            </button>
            <button 
              onClick={() => { setView('Knowledge Base'); simulateLoad(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'Knowledge Base' ? 'bg-bg text-cyan shadow-sm' : 'text-muted hover:text-text'}`}
            >
              Knowledge Base
            </button>
          </div>
        </div>

        {/* Stats & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-panel/30 border border-line/50 rounded-2xl p-4">
          <div className="flex items-center space-x-6">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted">Total Files</p>
              <p className="text-lg font-bold text-text">{filteredFiles.length}</p>
            </div>
            <div className="w-px h-8 bg-line" />
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted">Storage Used</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-bold text-text">124 MB</p>
                <div className="w-24 h-1.5 bg-bg border border-line rounded-full overflow-hidden">
                  <div className="h-full bg-cyan w-[15%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden md:flex items-center bg-bg border border-line rounded-xl p-1">
              <button 
                onClick={() => setLayout('table')}
                className={`p-1.5 rounded-lg transition-all ${layout === 'table' ? 'bg-panel text-cyan shadow-sm' : 'text-muted hover:text-text'}`}
                title="Table View"
              >
                <div className="w-4 h-4 flex flex-col space-y-1 justify-center">
                  <div className="h-0.5 w-full bg-current" />
                  <div className="h-0.5 w-full bg-current opacity-60" />
                  <div className="h-0.5 w-full bg-current opacity-30" />
                </div>
              </button>
              <button 
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg transition-all ${layout === 'grid' ? 'bg-panel text-cyan shadow-sm' : 'text-muted hover:text-text'}`}
                title="Grid View"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current" />
                  <div className="bg-current opacity-60" />
                  <div className="bg-current opacity-60" />
                  <div className="bg-current opacity-30" />
                </div>
              </button>
            </div>

            <div className="relative flex-1 md:flex-initial">
              <input 
                type="text" 
                placeholder="Search filename or content..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); simulateLoad(); }}
                className="bg-bg border border-line text-xs rounded-xl pl-9 pr-4 py-2.5 text-text focus:outline-none focus:border-cyan w-full md:w-64 transition-all"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
            </div>
            
            <button className="lg:hidden p-2.5 rounded-xl bg-bg border border-line text-muted">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select 
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); simulateLoad(); }}
              className="appearance-none bg-panel border border-line text-[11px] rounded-xl pl-9 pr-8 py-2 text-text focus:outline-none focus:border-cyan cursor-pointer transition-all hover:bg-line/20"
            >
              <option value="All">All File Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="video">Video Lessons</option>
              <option value="archive">Archives (ZIP)</option>
              <option value="notebook">Jupyter Notebooks</option>
              <option value="code">Code Files</option>
              <option value="office">Office Docs</option>
              <option value="image">Images</option>
            </select>
            <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          <div className="relative group">
            <select 
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); simulateLoad(); }}
              className="appearance-none bg-panel border border-line text-[11px] rounded-xl pl-9 pr-8 py-2 text-text focus:outline-none focus:border-cyan cursor-pointer transition-all hover:bg-line/20"
            >
              <option value="All Courses">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <FolderOpen className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          <div className="relative group">
            <select 
              value={selectedAccessLevel}
              onChange={(e) => { setSelectedAccessLevel(e.target.value); simulateLoad(); }}
              className="appearance-none bg-panel border border-line text-[11px] rounded-xl pl-9 pr-8 py-2 text-text focus:outline-none focus:border-cyan cursor-pointer transition-all hover:bg-line/20"
            >
              <option value="All Levels">All Access Levels</option>
              {accessLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          <div className="relative group">
            <button className="flex items-center space-x-2 bg-panel border border-line text-[11px] rounded-xl px-3 py-2 text-text hover:bg-line/20 transition-all cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-muted" />
              <span>Date Range</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Notice (REQ-RES-007) */}
      <div className="bg-panel/40 border border-line p-3.5 rounded-xl text-xs text-muted">
        As a student, you can view and download course resources, but you cannot upload your own files here. Submissions are made directly in the learning path.
      </div>

      {/* REQ-LOAD-004: Failed load with retry action */}
      {view === 'Knowledge Base' ? (
        <div className="bg-panel border border-line rounded-2xl py-24 text-center space-y-4">
          <div className="w-16 h-16 bg-cyan/10 rounded-full flex items-center justify-center mx-auto text-cyan">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text">Knowledge Base Search</h3>
            <p className="text-muted text-sm max-w-sm mx-auto">Explore across all courses and platforms for scripts, snippets and reference docs.</p>
          </div>
          <div className="relative max-w-md mx-auto px-4">
             <span className="bg-cyan/10 text-cyan text-[10px] font-bold px-3 py-1 rounded-full border border-cyan/20">Phase 2 Feature</span>
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-16 max-w-md mx-auto my-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red/10 border border-red/35 flex items-center justify-center mx-auto text-red animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-bold text-text text-base">Failed to load resources</h3>
            <p className="text-muted text-xs max-w-xs mx-auto">We encountered an issue retrieving the resources. Please check your network connection.</p>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${layout === 'table' ? 'md:hidden' : ''}`}>
          {isLoading ? (
            [1, 2, 3, 4, 8].map(i => (
              <div key={i} className="bg-panel border border-line rounded-2xl p-4 animate-pulse space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-12 bg-line rounded-lg" />
                  <div className="w-16 h-6 bg-line rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-line rounded w-3/4" />
                  <div className="h-3 bg-line rounded w-1/2" />
                </div>
                <div className="pt-2 border-t border-line flex justify-between">
                  <div className="h-3 bg-line rounded w-12" />
                  <div className="h-3 bg-line rounded w-12" />
                </div>
              </div>
            ))
          ) : filteredFiles.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted bg-panel border border-line rounded-2xl">
               <FolderOpen className="w-12 h-12 text-muted mx-auto mb-3" />
               <p className="font-bold text-text">No resource files found</p>
               <button 
                  onClick={() => { setSelectedType('All'); setSearchQuery(''); setSelectedCourse('All Courses'); setSelectedAccessLevel('All Levels'); }}
                  className="mt-4 bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-4 py-2 rounded-xl"
                >
                  Reset Filters
                </button>
            </div>
          ) : (
            filteredFiles.map(file => (
              <div key={file.id} className="bg-panel border border-line rounded-2xl p-4 hover:border-cyan/50 transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 bg-bg border border-line rounded-xl">
                    {getFileIcon(file.type)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase tracking-wider border ${
                    file.accessLevel === 'All Learners' ? 'bg-green/10 text-green border-green/20' : 
                    file.accessLevel === 'Cohort Only' ? 'bg-cyan/10 text-cyan border-cyan/20' : 
                    'bg-yellow/10 text-yellow border-yellow/20'
                  }`}>
                    {file.accessLevel.split(' ')[0]}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0 mb-4">
                  <h4 className="text-sm font-bold text-text truncate group-hover:text-cyan transition-colors" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[11px] text-muted truncate mt-1">{file.courseName}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-line/50 text-[10px] text-muted">
                  <span className="font-medium">{file.size}</span>
                  <span>{file.uploadDate}</span>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <button 
                    onClick={() => setPreviewFile(file)}
                    className="flex-1 bg-bg hover:bg-line border border-line text-[10px] font-bold py-2 rounded-lg transition-colors"
                  >
                    Preview
                  </button>
                  <button className="p-2 rounded-lg bg-bg border border-line hover:text-cyan transition-colors">
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Files Table (REQ-RES-001) */}
        <div className={`bg-panel border border-line rounded-2xl overflow-hidden ${layout === 'grid' ? 'hidden' : 'hidden md:block'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg/40 border-b border-line text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Affiliation</th>
                <th className="p-4 hidden min-[1225px]:table-cell">Date</th>
                <th className="p-4">Permission</th>
                <th className="p-4">Size</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                /* REQ-LOAD-002: Skeleton loader mimicking the table structure */
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-line rounded shrink-0" />
                      <div className="h-3.5 bg-line rounded w-36" />
                    </td>
                    <td className="p-4">
                      <div className="h-3.5 bg-line rounded w-10" />
                    </td>
                    <td className="p-4">
                      <div className="h-3.5 bg-line rounded w-24" />
                    </td>
                    <td className="p-4 hidden min-[1225px]:table-cell">
                      <div className="h-3.5 bg-line rounded w-16" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-line rounded w-12" />
                    </td>
                    <td className="p-4">
                      <div className="h-3.5 bg-line rounded w-12" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="h-6 bg-line rounded w-24 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredFiles.length === 0 ? (
                /* REQ-LOAD-001: Every list view has a defined empty state with primary action */
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted">
                    <FolderOpen className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="font-bold text-text">No resource files found</p>
                    <p className="text-muted text-xs mt-1 max-w-xs mx-auto">No resources match your search criteria or type filter settings.</p>
                    <button 
                      onClick={() => { setSelectedType('All'); setSearchQuery(''); setSelectedCourse('All Courses'); setSelectedAccessLevel('All Levels'); }}
                      className="mt-4 bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-bg/20 transition-colors group">
                    <td className="p-4 font-semibold text-text flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </td>
                    <td className="p-4 text-muted uppercase font-bold text-[9px]">{file.type}</td>
                    <td className="p-4 text-muted">{file.courseName}</td>
                    <td className="p-4 text-muted hidden min-[1225px]:table-cell">{file.uploadDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${
                        file.accessLevel === 'All Learners' ? 'bg-green/10 text-green border-green/20' : 
                        file.accessLevel === 'Cohort Only' ? 'bg-cyan/10 text-cyan border-cyan/20' : 
                        'bg-yellow/10 text-yellow border-yellow/20'
                      }`}>
                        {file.accessLevel}
                      </span>
                    </td>
                    <td className="p-4 text-muted font-medium">{file.size}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 rounded-lg bg-bg border border-line text-muted hover:text-cyan transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="p-1.5 rounded-lg bg-bg border border-line text-muted hover:text-cyan transition-colors"
                          title="Download"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </a>
                        <button 
                          className="p-1.5 rounded-lg bg-bg border border-line text-muted hover:text-cyan transition-colors"
                          title="Save to notes"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-1.5 rounded-lg bg-bg border border-line text-muted hover:text-cyan transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* File Preview Drawer Overlay */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-bg/95 backdrop-blur-2xl p-0 sm:p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className={`bg-panel border border-line rounded-none sm:rounded-2xl w-full sm:w-[95%] md:w-[90%] max-w-6xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col h-full sm:h-[90vh] ${
              ['video', 'image'].includes(previewFile.type) ? '' : 'min-h-[70vh] md:min-h-[85vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Simplified for PDF, Standard for others */}
            {previewFile.type !== 'pdf' ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg/30 border-b border-line px-4 sm:px-6 py-4 gap-4 sm:gap-0">
                <div className="flex items-center space-x-3 min-w-0 w-full">
                  <div className="p-2 bg-panel rounded-xl border border-line">
                    {getFileIcon(previewFile.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-text leading-tight truncate">{previewFile.name}</h3>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold truncate">
                      {previewFile.courseName} &middot; {previewFile.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <button className="p-2 rounded-xl hover:bg-line/20 text-muted transition-colors"><Bookmark className="w-4 h-4" /></button>
                  <button className="p-2 rounded-xl hover:bg-line/20 text-muted transition-colors"><Share2 className="w-4 h-4" /></button>
                  <div className="w-px h-6 bg-line mx-2" />
                  <button onClick={() => setPreviewFile(null)} className="p-1.5 rounded-xl hover:bg-red/10 text-muted hover:text-red transition-all group"><X className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
                </div>
              </div>
            ) : (
              <div className="absolute top-4 right-4 z-[60] flex items-center space-x-2">
                 <button 
                  onClick={() => setPreviewFile(null)} 
                  className="p-2 bg-black/50 backdrop-blur rounded-xl text-white hover:bg-red/80 transition-all shadow-xl"
                  title="Exit Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className={`flex-1 overflow-hidden flex flex-col ${previewFile.type === 'pdf' ? 'p-0' : 'bg-bg/50 p-2 sm:p-4 md:p-6'}`}>
              <div className={`w-full flex-1 flex flex-col overflow-hidden rounded-none ${previewFile.type === 'pdf' ? '' : 'rounded-xl border border-line shadow-inner'}`}>
                {previewFile.type === 'video' && previewFile.url ? (
                  <div className="flex-1 w-full flex items-center justify-center bg-black/5 rounded-xl overflow-hidden min-h-0">
                    <video src={previewFile.url} controls className="w-full h-auto max-h-full object-contain outline-none rounded-xl" />
                  </div>
                ) : previewFile.type === 'pdf' ? (
                  <div className="w-full h-full flex flex-col items-center min-h-0 overflow-hidden">
                    <PdfRenderer lesson={{ title: previewFile.name, type: 'PDF', id: previewFile.id, contentUrl: previewFile.url } as Lesson} />
                  </div>
                ) : previewFile.type === 'office' ? (
                  <DocxRenderer lesson={{ title: previewFile.name, contentUrl: previewFile.url || '' }} />
                ) : (previewFile.type === 'code' || previewFile.type === 'notebook') && (fetchedContent || previewFile.realContent) ? (
                  <CodeRenderer fileName={previewFile.name} content={fetchedContent || previewFile.realContent || ''} />
                ) : previewFile.type === 'image' && previewFile.url ? (
                  <div className="flex-1 w-full flex items-center justify-center p-4 bg-panel min-h-0">
                    <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 bg-panel">
                    <FolderOpen className="w-20 h-20 text-muted/40" />
                    <div className="space-y-1">
                      <p className="font-bold text-text">Preview Unvailable</p>
                      <p className="text-xs text-muted">Optimizing display for {previewFile.type} format...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Hidden for PDF, Standard for others */}
            {previewFile.type !== 'pdf' && (
              <div className="bg-bg/30 border-t border-line p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center space-x-2 text-muted text-[10px] font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Confidential Material &middot; Strictly Controlled Access</span>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setPreviewFile(null)} className="bg-panel hover:bg-line border border-line text-xs font-bold px-6 py-2.5 rounded-xl text-text transition-colors">Cancel</button>
                  <button onClick={() => setPreviewFile(null)} className="bg-cyan hover:bg-cyan2 text-bg text-xs font-extrabold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan/10 cursor-pointer flex items-center space-x-2">
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
