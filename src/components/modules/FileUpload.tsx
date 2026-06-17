import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { UploadCloud, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess?: (filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const { addToast } = useXP();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('scanning');
      
      // Simulate virus scanning and progress upload (REQ-UPLOAD-003)
      setTimeout(() => {
        setStatus('success');
        addToast('success', `File "${selected.name}" successfully uploaded.`);
        if (onUploadSuccess) onUploadSuccess(selected.name);
      }, 2000);
    }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 space-y-4 max-w-sm">
      <div className="flex items-center space-x-2 border-b border-line pb-3">
        <UploadCloud className="w-4 h-4 text-cyan" />
        <h3 className="font-bold text-xs uppercase text-muted tracking-wider">File Upload (Assignments)</h3>
      </div>

      <div className="relative border-2 border-dashed border-line rounded-xl p-6 text-center hover:border-cyan/50 transition-colors">
        <input 
          type="file" 
          onChange={handleFileChange}
          disabled={status === 'scanning'}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {status === 'idle' && (
          <div className="space-y-2">
            <UploadCloud className="w-10 h-10 text-muted mx-auto" />
            <div>
              <p className="text-xs font-semibold text-text">Click to select or drag & drop</p>
              <p className="text-[10px] text-muted mt-1">PDF, ZIP, IPYNB up to 50 MB</p>
            </div>
          </div>
        )}

        {status === 'scanning' && (
          <div className="space-y-2 py-2">
            <div className="w-8 h-8 rounded-full border-2 border-cyan/25 border-t-cyan animate-spin mx-auto" />
            <p className="text-xs font-bold text-cyan">Virus scan & upload in progress...</p>
          </div>
        )}

        {status === 'success' && file && (
          <div className="space-y-2">
            <CheckCircle className="w-10 h-10 text-green mx-auto" />
            <div>
              <p className="text-xs font-bold text-text truncate max-w-[200px] mx-auto">{file.name}</p>
              <p className="text-[10px] text-green font-semibold mt-1">Securely uploaded & virus-scanned</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
