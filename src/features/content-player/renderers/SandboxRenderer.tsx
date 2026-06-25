import React, { useState, useEffect, useRef } from 'react';
import type { Lesson, SandboxFile } from '../../../types';
import { useXP } from '../../../context/XPContext';
import { useModal } from '../../../context/ModalContext';
import { MonacoEditor } from './components/MonacoEditor';
import { ExecutionPanel } from './components/ExecutionPanel';
import { FileCode, TerminalSquare } from 'lucide-react';

interface SandboxRendererProps {
  lesson: Lesson;
  onComplete: () => void;
}

export const SandboxRenderer: React.FC<SandboxRendererProps> = ({ lesson, onComplete }) => {
  const { addXp } = useXP();
  const { openModal } = useModal();
  const sandboxData = lesson.sandboxData;
  
  // States
  const [submitted, setSubmitted] = useState(lesson.status === 'completed');
  
  const [files, setFiles] = useState<SandboxFile[]>(() => {
    if (!sandboxData) return [];
    const saved = localStorage.getItem(`sandbox_${lesson.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length === sandboxData.files.length) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved sandbox code", e);
      }
    }
    return sandboxData.files;
  });
  
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  // Execution States
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'tests'>('output');
  const [testResults, setTestResults] = useState<{id: string, name: string, passed: boolean, error?: string}[]>([]);

  // Resizing States
  const [panelSize, setPanelSize] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = () => {
    // e.preventDefault() is often problematic on touchstart if not passive, but fine here
    setIsDragging(true);

    const isColumn = window.innerWidth < 768;

    const handleMove = (clientX: number, clientY: number) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (isColumn) {
          const newHeight = containerRect.bottom - clientY;
          if (newHeight > 150 && newHeight < containerRect.height - 150) {
            setPanelSize(newHeight);
          }
        } else {
          const newWidth = containerRect.right - clientX;
          if (newWidth > 250 && newWidth < containerRect.width - 250) {
            setPanelSize(newWidth);
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while dragging
      if (e.cancelable) e.preventDefault(); 
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  // Load from LocalStorage if lesson changes
  useEffect(() => {
    if (!sandboxData) return;
    const saved = localStorage.getItem(`sandbox_${lesson.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length === sandboxData.files.length) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFiles(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved sandbox code", e);
      }
    }
    setFiles(sandboxData.files);
  }, [lesson.id, sandboxData]);

  // Save to LocalStorage
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode === undefined) return;
    
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[activeFileIndex] = { ...newFiles[activeFileIndex], code: newCode };
      localStorage.setItem(`sandbox_${lesson.id}`, JSON.stringify(newFiles));
      return newFiles;
    });
  };

  const handleReset = () => {
    openModal('confirmation', {
      title: 'Reset Sandbox',
      description: 'Are you sure you want to reset all files to their original state? This will erase your code.',
      props: {
        confirmText: 'Reset Code',
        variant: 'danger',
        onConfirm: () => {
          if (sandboxData) {
            setFiles(sandboxData.files);
            localStorage.removeItem(`sandbox_${lesson.id}`);
            setOutput(null);
            setTestResults([]);
          }
        }
      }
    });
  };

  const handleRun = () => {
    if (!sandboxData) return;
    
    setIsRunning(true);
    setActiveTab('output');
    setOutput("Executing code...\n");
    setTestResults([]);

    // Simulated execution latency
    setTimeout(() => {
      let outText = "Running Python 3.12 (Pyodide)\n";
      const results = sandboxData.tests.map((test, index) => {
        // Mock execution results based on user request: one correct and one error
        const passed = index === 0;
        let error = undefined;
        
        if (!passed) {
          error = `AssertionError: assert custom_greeting("Alice") == "Hello, Alice!"\nFound: None`;
        }
        
        return { id: test.id, name: test.name, passed, error };
      });

      outText += "\n> hello world\n";

      setTestResults(results);
      setOutput(outText);
      setActiveTab('tests');
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!submitted) {
      addXp(75, 'Code exercise submitted');
      setSubmitted(true);
      
      const userCode = files.map(f => `// ${f.path}\n${f.code}`).join('\n\n');
      window.dispatchEvent(new CustomEvent('sandbox_submit', { detail: { code: userCode } }));
      
      onComplete();
    }
  };

  const activeFile = files[activeFileIndex];
  const allTestsPassed = testResults.length > 0 && testResults.every(t => t.passed);
  const hasEdited = sandboxData ? JSON.stringify(files) !== JSON.stringify(sandboxData.files) : false;

  if (!sandboxData || files.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-muted">
        No sandbox data available for this lesson.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] w-full overflow-hidden border border-line rounded-xl bg-bg shadow-xl">
      {/* Top Header */}
      <div className="bg-panel border-b border-line px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-text">
          <TerminalSquare className="w-5 h-5 text-cyan" />
          <span className="font-bold tracking-wide">Interactive Sandbox</span>
          <span className="bg-cyan/10 text-cyan px-2 py-0.5 rounded text-[10px] font-bold uppercase ml-2">
            {sandboxData.language}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSubmit}
            disabled={submitted || (!allTestsPassed && !hasEdited && !submitted)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              submitted 
                ? 'bg-green/20 text-green border border-green cursor-default' 
                : (allTestsPassed || hasEdited)
                  ? 'bg-cyan hover:bg-cyan2 text-bg cursor-pointer shadow-lg shadow-cyan/20'
                  : 'bg-line text-muted cursor-not-allowed opacity-50'
            }`}
          >
            {submitted ? 'Submitted!' : 'Submit to AI Tutor (+75 XP)'}
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div 
        ref={containerRef}
        className={`flex-1 flex flex-col md:flex-row overflow-hidden relative ${isDragging ? 'select-none pointer-events-none' : ''}`}
      >
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-[300px] pointer-events-auto">
          {/* File Explorer Tabs */}
          <div className="flex overflow-x-auto border-b border-line bg-bg shrink-0 scrollbar-hide">
            {files.map((file, index) => (
              <button
                key={file.path}
                onClick={() => setActiveFileIndex(index)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono border-r border-line transition-colors ${
                  activeFileIndex === index 
                    ? 'bg-panel text-cyan border-b-2 border-b-cyan' 
                    : 'text-muted hover:text-text hover:bg-panel/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.path}</span>
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            {activeFile && (
              <MonacoEditor
                code={activeFile.code}
                language={sandboxData.language}
                onChange={handleCodeChange}
                path={activeFile.path}
              />
            )}
          </div>
        </div>

        {/* Resizer Handle */}
        <div 
          onMouseDown={startResize}
          onTouchStart={startResize}
          className="flex md:hidden h-1.5 hover:h-2 w-full bg-line hover:bg-cyan/50 cursor-row-resize z-10 transition-colors shrink-0 pointer-events-auto"
          title="Drag to resize"
        />
        <div 
          onMouseDown={startResize}
          onTouchStart={startResize}
          className="hidden md:flex w-1 hover:w-1.5 h-full bg-line hover:bg-cyan/50 cursor-col-resize z-10 transition-colors shrink-0 pointer-events-auto"
          title="Drag to resize"
        />

        {/* Execution & Output Panel */}
        <div 
          className="shrink-0 border-t md:border-t-0 md:border-l border-line pointer-events-auto min-h-[150px] md:min-h-0 md:min-w-[300px]"
          style={{ 
            '--panel-size': `${panelSize}px`,
            height: window.innerWidth < 768 ? 'var(--panel-size)' : '100%',
            width: window.innerWidth < 768 ? '100%' : 'var(--panel-size)'
          } as React.CSSProperties}
        >
          <div className="h-full w-full">
            <ExecutionPanel
              output={output}
              tests={testResults}
              isRunning={isRunning}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onRun={handleRun}
              onReset={handleReset}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
