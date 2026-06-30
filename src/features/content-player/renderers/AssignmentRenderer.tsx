import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useXP } from '../../../context/XPContext';
import type { Lesson } from '../../../types';

interface AssignmentRendererProps {
  lesson: Lesson;
  onComplete: () => void;
}
export const AssignmentRenderer: React.FC<AssignmentRendererProps> = ({ lesson, onComplete }) => {
  const { addXp, addToast } = useXP();
  const [submitted, setSubmitted] = useState(lesson.status === 'completed');
  const [submissionType, setSubmissionType] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textSubmission, setTextSubmission] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (submissionType === 'file' && !selectedFile) {
      addToast('error', 'Please select a file first.');
      return;
    }
    if (submissionType === 'text' && textSubmission.trim().length === 0) {
      addToast('error', 'Please enter your submission text.');
      return;
    }
    setSubmitted(true);
    addXp(100, 'Assignment submitted');
    onComplete();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text mb-2">Assignment: {lesson.title}</h2>
        <div className="text-xs text-muted flex items-center space-x-4 font-semibold uppercase tracking-wider">
          <span>Estimated time: {lesson.duration}</span>
          <span className="text-orange">Deadline: Next Friday</span>
        </div>
      </div>

      <div className="bg-bg border border-line rounded-xl p-5 text-sm leading-relaxed text-text">
        <h3 className="font-bold mb-2">Briefing</h3>
        <p className="opacity-80">
          Please download the starter template attached to this lesson and complete the missing functions as instructed in the previous video. 
          Once you have verified your script runs without errors, upload your `.py` file below.
        </p>
        <button className="mt-4 flex items-center space-x-2 text-cyan font-bold hover:underline cursor-pointer text-xs uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Download Starter Template</span>
        </button>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <div className="flex bg-panel border border-line rounded-lg overflow-hidden w-fit">
            <button 
              onClick={() => setSubmissionType('file')}
              className={`px-4 py-2 text-xs font-bold transition-colors ${submissionType === 'file' ? 'bg-cyan text-bg' : 'text-text hover:bg-bg'}`}
            >
              File Upload
            </button>
            <button 
              onClick={() => setSubmissionType('text')}
              className={`px-4 py-2 text-xs font-bold transition-colors ${submissionType === 'text' ? 'bg-cyan text-bg' : 'text-text hover:bg-bg'}`}
            >
              Text Submission
            </button>
          </div>

          {submissionType === 'file' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 ${selectedFile ? 'border-cyan bg-cyan/5' : 'border-dashed border-line bg-bg/50'} rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-bg transition-colors cursor-pointer group`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".py,.zip,.pdf"
              />
              <div className="w-16 h-16 rounded-full bg-panel flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Upload className={`w-8 h-8 ${selectedFile ? 'text-green' : 'text-cyan'}`} />
              </div>
              
              {selectedFile ? (
                <div className="text-center">
                  <p className="font-bold text-green">File Selected</p>
                  <p className="text-xs text-text mt-1 font-mono bg-panel px-2 py-1 rounded">{selectedFile.name}</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-text">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted mt-1">Supported files: .py, .zip, .pdf (Max 10MB)</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={textSubmission}
              onChange={(e) => setTextSubmission(e.target.value)}
              placeholder="Type your assignment submission here..."
              className="w-full min-h-[200px] p-4 bg-bg border border-line rounded-xl text-sm focus:ring-2 focus:ring-cyan/30 focus:border-cyan outline-none resize-y"
            />
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={(submissionType === 'file' && !selectedFile) || (submissionType === 'text' && !textSubmission.trim())}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                (submissionType === 'file' && selectedFile) || (submissionType === 'text' && textSubmission.trim())
                  ? 'bg-cyan hover:bg-cyan2 text-bg shadow-cyan/20 cursor-pointer' 
                  : 'bg-line text-muted cursor-not-allowed'
              }`}
            >
              Submit Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green/10 border border-green rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green" />
            <h3 className="font-bold text-green text-lg">Submission Received!</h3>
            <p className="text-xs text-green/80 max-w-sm">
              Your assignment has been submitted successfully.
            </p>
          </div>
          
          <div className="bg-panel border border-line rounded-xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan"></span>
              <span>Trainer Feedback</span>
            </h3>
            {lesson.status === 'completed' ? (
              <p className="text-sm text-text leading-relaxed">
                "Great work! Your solution is very efficient and handles edge cases properly. I specifically liked how you structured the validation checks. Keep it up!"
                <br /><br />
                <span className="text-xs text-muted font-bold">— David Pinezich</span>
              </p>
            ) : (
              <p className="text-sm text-muted italic">
                Awaiting review from your trainer. You'll be notified when feedback is available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
