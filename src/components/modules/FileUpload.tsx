import React, { useState, useRef } from 'react';
import { 
  Upload, File, CheckCircle, 
  Image as ImageIcon, FileText, Trash2, 
  RefreshCw, CloudUpload, Paperclip, User
} from 'lucide-react';
import { useXP } from '../../context/XPContext';

type UploadMode = 'avatar' | 'assignment' | 'attachment';

interface FileUploadProps {
  mode: UploadMode;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  onUploadComplete?: (files: File[]) => void;
}

type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  status: 'staged' | 'uploading' | 'verifying' | 'completed' | 'error';
  error?: string;
  previewUrl?: string;
};

export const FileUpload: React.FC<FileUploadProps> = ({ 
  mode, 
  maxSize = 50, 
  allowedTypes = [], 
  onUploadComplete 
}) => {
  const { addToast } = useXP();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUpload = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress: 100, status: 'verifying' } : f
        ));

        setTimeout(() => {
          setFiles(prev => {
            const updated = prev.map(f => 
              f.id === id ? { ...f, status: 'completed' as const } : f
            );
            if (updated.every(f => f.status === 'completed')) {
              onUploadComplete?.(updated.map(u => u.file));
              addToast('success', 'Transfer sequence completed successfully.');
            }
            return updated;
          });
        }, 1500);
      } else {
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress } : f
        ));
      }
    }, 400);
  };

  const startAllUploads = () => {
    files.forEach(f => {
      if (f.status === 'staged') startUpload(f.id);
    });
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: UploadingFile[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach(file => {
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxSize}MB limit.`);
        return;
      }

      if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.match(type))) {
        errors.push(`${file.name} is not a supported file type.`);
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const stagedFile: UploadingFile = {
        id,
        file,
        progress: 0,
        status: 'staged',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };

      validFiles.push(stagedFile);
    });

    if (errors.length > 0) addToast('error', errors[0]);

    if (mode === 'avatar') {
      setFiles(validFiles.slice(0, 1));
    } else {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const renderFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-cyan" />;
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4 text-red" />;
    return <File className="w-4 h-4 text-muted" />;
  };

  if (mode === 'avatar') {
    const avatarFile = files[0];
    return (
      <div className="flex flex-col items-center space-y-5">
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group ${
            isDragging ? 'border-cyan bg-cyan/5 scale-105' : 'border-line hover:border-cyan/50 hover:bg-panel/50'
          }`}
        >
          {avatarFile?.previewUrl ? (
            <img src={avatarFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted group-hover:text-cyan transition-colors">
              <User className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Update</span>
            </div>
          )}
          
          {(avatarFile?.status === 'uploading' || avatarFile?.status === 'verifying') && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="w-full bg-line/20 h-1 rounded-full overflow-hidden">
                 <div className="bg-cyan h-full transition-all duration-300 shadow-[0_0_8px_rgba(0,245,228,0.5)]" style={{ width: `${avatarFile.progress}%` }} />
               </div>
            </div>
          )}

          {avatarFile?.status === 'staged' && (
             <div className="absolute inset-0 bg-cyan/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle className="w-8 h-8 text-cyan" />
             </div>
          )}
          
          {avatarFile?.status === 'completed' && (
             <div className="absolute top-1 right-1 bg-green text-bg p-1 rounded-full shadow-lg z-10">
                <CheckCircle className="w-3 h-3" />
             </div>
          )}
        </div>

        {avatarFile?.status === 'staged' && (
          <button 
            onClick={startAllUploads}
            className="px-6 py-2 bg-text text-bg rounded-xl text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-xl animate-in fade-in zoom-in"
          >
            Confirm Identity
          </button>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFiles(e.target.files)} 
        />
      </div>
    );
  }

  const stagedFilesCount = files.filter(f => f.status === 'staged').length;

  return (
    <div className="w-full space-y-6">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative py-14 px-8 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center space-y-5 cursor-pointer transition-all ${
          isDragging 
            ? 'border-cyan bg-cyan/5 scale-[1.01] shadow-[0_0_50px_rgba(0,245,228,0.08)]' 
            : 'border-line hover:border-cyan/40 hover:bg-panel/40'
        }`}
      >
        <div className="p-4.5 bg-cyan/10 rounded-2xl border border-cyan/20">
          <Upload className={`w-8 h-8 text-cyan transition-transform duration-500 ${isDragging ? 'scale-110 -translate-y-1' : ''}`} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-sm text-text">Sub-Space Transfer Node</h3>
          <p className="text-[11px] text-muted mt-1 leading-relaxed max-w-[200px] mx-auto">
            Drag files here or click to engage the local directory picker.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold text-cyan uppercase tracking-widest bg-cyan/5 px-4 py-2 rounded-xl border border-cyan/20">
           <span>MAX: {maxSize}MB</span>
           <div className="w-1 h-1 rounded-full bg-cyan/30" />
           <span>JSON, PDF, IMG</span>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center">
              <Paperclip className="w-3.5 h-3.5 mr-2 text-cyan" />
              Transfer Queue ({files.length})
            </span>
            {stagedFilesCount > 0 && (
               <button 
                onClick={startAllUploads}
                className="flex items-center space-x-2 bg-cyan text-bg px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase hover:bg-cyan2 shadow-lg shadow-cyan/20 transition-all hover:scale-[1.02] active:scale-95"
               >
                 <CloudUpload className="w-3 h-3" />
                 <span>Execute Upload ({stagedFilesCount})</span>
               </button>
            )}
          </div>

          <div className="space-y-2.5">
            {files.map(f => (
              <div key={f.id} className="group p-4 bg-panel/30 border border-line rounded-2xl hover:border-cyan/30 transition-all flex items-center space-x-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-bg border border-line flex items-center justify-center shrink-0 relative">
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : renderFileIcon(f.file)}
                  
                  {f.status === 'completed' && (
                    <div className="absolute -top-1.5 -right-1.5 bg-green text-bg p-1 rounded-full shadow-lg ring-2 ring-panel animate-in zoom-in">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 truncate pr-4">
                      <h4 className="text-xs font-bold text-text truncate">{f.file.name}</h4>
                      <p className="text-[10px] text-muted font-mono">{ (f.file.size / 1024 / 1024).toFixed(2) } MB</p>
                    </div>
                    {f.status === 'staged' && (
                      <button 
                        onClick={(e) => removeFile(f.id, e)}
                        className="p-1.5 bg-bg/50 border border-line rounded-lg text-muted hover:text-red hover:border-red/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {f.status !== 'staged' && (
                    <div className="relative">
                      <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden border border-line/20">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            f.status === 'error' ? 'bg-red shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            f.status === 'verifying' ? 'bg-yellow-500 animate-pulse' :
                            f.status === 'completed' ? 'bg-green' : 'bg-cyan shadow-[0_0_8px_rgba(0,245,228,0.5)]'
                          }`}
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {f.status === 'uploading' && (
                            <span className="text-[9px] text-cyan font-bold inline-flex items-center animate-pulse">
                              <CloudUpload className="w-3 h-3 mr-1" />
                              Transmitting: {Math.round(f.progress)}%
                            </span>
                          )}
                          {f.status === 'verifying' && (
                            <span className="text-[9px] text-yellow-500 font-extrabold inline-flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Syncing Metadata...
                            </span>
                          )}
                          {f.status === 'completed' && (
                            <span className="text-[9px] text-green font-bold inline-flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Storage Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {f.status === 'staged' && (
                    <div className="flex items-center space-x-2 text-[9px] text-muted/60 font-bold uppercase tracking-widest">
                       <CheckCircle className="w-3 h-3" />
                       <span>Ready for sequence</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

