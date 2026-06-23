import React from 'react';
import { Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
}

interface ExecutionPanelProps {
  output: string | null;
  tests: TestResult[];
  isRunning: boolean;
  activeTab: 'output' | 'tests';
  setActiveTab: (tab: 'output' | 'tests') => void;
  onRun: () => void;
  onReset: () => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  output,
  tests,
  isRunning,
  activeTab,
  setActiveTab,
  onRun,
  onReset
}) => {
  const allTestsPassed = tests.length > 0 && tests.every(t => t.passed);
  const passCount = tests.filter(t => t.passed).length;

  return (
    <div className="flex flex-col h-full bg-panel border-l border-line overflow-hidden">
      {/* Header Tabs & Controls */}
      <div className="flex items-center justify-between px-2 bg-bg border-b border-line shrink-0 h-[48px]">
        <div className="flex space-x-1 h-full">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 text-xs font-bold uppercase tracking-wider transition-colors h-full flex items-center border-b-2 ${
              activeTab === 'output' ? 'border-cyan text-text' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Output
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 text-xs font-bold uppercase tracking-wider transition-colors h-full flex items-center border-b-2 ${
              activeTab === 'tests' ? 'border-cyan text-text' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Test Cases {tests.length > 0 && `(${passCount}/${tests.length})`}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="p-1.5 text-muted hover:text-orange hover:bg-orange/10 rounded-lg transition-colors cursor-pointer"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isRunning ? 'bg-line text-muted cursor-wait' : 'bg-green/10 text-green hover:bg-green/20 cursor-pointer border border-green/30'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'output' ? (
          <div className="p-4 font-mono text-xs text-text whitespace-pre-wrap">
            {output === null ? (
              <span className="text-muted/50 italic">Click Run to execute your code...</span>
            ) : (
              output
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {tests.length === 0 ? (
              <span className="text-muted/50 italic text-xs">No tests run yet.</span>
            ) : (
              <div className="space-y-2">
                {tests.map(test => (
                  <div key={test.id} className={`p-3 rounded-xl border ${test.passed ? 'bg-green/5 border-green/20' : 'bg-red/5 border-red/20'}`}>
                    <div className="flex items-center space-x-2">
                      {test.passed ? <CheckCircle className="w-4 h-4 text-green" /> : <XCircle className="w-4 h-4 text-red" />}
                      <span className={`text-sm font-semibold ${test.passed ? 'text-green' : 'text-red'}`}>
                        {test.name}
                      </span>
                    </div>
                    {!test.passed && test.error && (
                      <div className="mt-2 p-2 bg-black/50 rounded font-mono text-[10px] text-red/80 whitespace-pre-wrap">
                        {test.error}
                      </div>
                    )}
                  </div>
                ))}
                
                {allTestsPassed && (
                  <div className="mt-4 p-4 bg-green/10 border border-green/30 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-1">🎉</span>
                    <span className="text-green font-bold text-sm">All tests passed!</span>
                    <span className="text-green/70 text-xs">You can now submit your solution.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
