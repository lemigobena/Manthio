import React, { useState } from 'react';
import { RESOURCES } from '../../services/mockData';
import { Search, FolderOpen, FileText, Video, FolderArchive, ArrowDownToLine, Eye, AlertCircle } from 'lucide-react';
import type { ResourceFile } from '../../types';

interface ResourcesProps {
  onNavigate?: (page: string) => void;
}

export const Resources: React.FC<ResourcesProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [previewFile, setPreviewFile] = useState<ResourceFile | null>(null);

  // Loading & Error States (REQ-LOAD-002, REQ-LOAD-004)
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

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
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase()) && !file.courseName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'All' && file.type !== selectedType) return false;
    return true;
  });

  const getFileIcon = (type: ResourceFile['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red" />;
      case 'video': return <Video className="w-4 h-4 text-cyan" />;
      case 'archive': return <FolderArchive className="w-4 h-4 text-yellow" />;
      default: return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Resource Center</h1>
          <p className="text-muted text-sm mt-1">Central access to all course materials, PDF documents, and reference files.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); simulateLoad(); }}
              className="bg-panel border border-line text-xs rounded-lg pl-8 pr-4 py-2 text-text focus:outline-none focus:border-cyan w-48"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted" />
          </div>

          <select 
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); simulateLoad(); }}
            className="bg-panel border border-line text-xs rounded-lg px-3 py-2 text-text focus:outline-none focus:border-cyan cursor-pointer"
          >
            <option value="All">All file types</option>
            <option value="pdf">PDF documents</option>
            <option value="video">Video lessons</option>
            <option value="archive">Archives (ZIP)</option>
          </select>
        </div>
      </div>

      {/* Info Notice (REQ-RES-007) */}
      <div className="bg-panel/40 border border-line p-3.5 rounded-xl text-xs text-muted">
        As a student, you can view and download course resources, but you cannot upload your own files here. Submissions are made directly in the learning path.
      </div>

      {/* REQ-LOAD-004: Failed load with retry action */}
      {isError ? (
        <div className="text-center py-16 bg-panel border border-line rounded-2xl max-w-md mx-auto my-6 space-y-4 shadow-xl">
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
        /* Files Table (REQ-RES-001) */
        <div className="bg-panel border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg/40 border-b border-line text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Affiliation</th>
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
                    <td className="p-4">
                      <div className="h-4 bg-line rounded w-12" />
                    </td>
                    <td className="p-4">
                      <div className="h-3.5 bg-line rounded w-12" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="h-6 bg-line rounded w-16 ml-auto" />
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
                      onClick={() => { setSelectedType('All'); setSearchQuery(''); }}
                      className="mt-4 bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-bg/20 transition-colors">
                    <td className="p-4 font-semibold text-text flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span>{file.name}</span>
                    </td>
                    <td className="p-4 text-muted uppercase font-bold text-[9px]">{file.type}</td>
                    <td className="p-4 text-muted">{file.courseName}</td>
                    <td className="p-4">
                      <span className="bg-bg border border-line px-2 py-0.5 rounded text-[10px] text-muted">
                        {file.accessLevel}
                      </span>
                    </td>
                    <td className="p-4 text-muted">{file.size}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setPreviewFile(file)}
                        className="p-1 rounded bg-bg border border-line text-muted hover:text-cyan cursor-pointer inline-flex items-center justify-center"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="p-1 rounded bg-bg border border-line text-muted hover:text-cyan inline-flex items-center justify-center"
                        title="Download"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* File Preview Drawer Overlay */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm">
          <div className="bg-panel border border-line p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="font-bold text-sm text-text flex items-center space-x-2">
                {getFileIcon(previewFile.type)}
                <span>File Preview</span>
              </h3>
              <button 
                onClick={() => setPreviewFile(null)}
                className="text-muted hover:text-text font-bold text-xs"
              >
                Close
              </button>
            </div>
            
            <div className="bg-bg border border-line rounded-xl p-4 space-y-2 text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted mx-auto mb-2" />
              <h4 className="font-bold text-sm text-text">{previewFile.name}</h4>
              <p className="text-xs text-muted">{previewFile.courseName} &middot; {previewFile.size}</p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setPreviewFile(null)}
                className="flex-1 bg-bg hover:bg-line border border-line text-xs font-semibold py-2.5 rounded-lg text-center"
              >
                Cancel
              </button>
              <button 
                onClick={() => setPreviewFile(null)}
                className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-lg text-center cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
