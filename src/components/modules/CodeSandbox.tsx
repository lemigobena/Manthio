import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { Code2, CheckCircle2, RotateCcw } from 'lucide-react';

interface CodeSandboxProps {
  starterCode?: string;
  onSuccess?: () => void;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({ 
  starterCode = '# Define a function that returns the sum of a and b\ndef sum(a, b):\n    pass', 
  onSuccess 
}) => {
  const { addXp, addToast } = useXP();
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [testsPassed, setTestsPassed] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setOutput('Running test cases...');
    
    setTimeout(() => {
      setRunning(false);
      // Basic simulation based on code input
      if (code.includes('return a + b') || code.includes('return b+a') || code.includes('a+b')) {
        setOutput('Output:\nTest case 1 (sum(2, 3) == 5): SUCCESS\nTest case 2 (sum(-1, 5) == 4): SUCCESS\n\nAll tests passed successfully!');
        setTestsPassed(true);
      } else {
        setOutput('Output:\nTest case 1 (sum(2, 3) == 5): FAILED\nExpected: 5\nReceived: None\n\nFailed at test case 1.');
        setTestsPassed(false);
      }
    }, 1000);
  };

  const handleSubmit = () => {
    if (testsPassed) {
      addXp(75, 'Code exercise solved');
      addToast('success', '+75 XP — Exercise submitted!');
      if (onSuccess) onSuccess();
    } else {
      addToast('error', 'Please run the code and pass all tests first.');
    }
  };

  const handleReset = () => {
    setCode(starterCode);
    setOutput('');
    setTestsPassed(false);
  };

  return (
    <div className="bg-panel border border-line rounded-2xl overflow-hidden flex flex-col h-96">
      
      {/* Editor Header */}
      <div className="bg-bg border-b border-line px-4 py-2.5 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan" />
          <span className="font-semibold text-text">Code Sandbox</span>
        </div>
        <button 
          onClick={handleReset}
          className="hover:text-text flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Editor & Console split */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden font-mono text-xs">
        {/* Code area */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-4 bg-[#090b0d] text-text border-r border-line outline-none resize-none font-mono"
        />

        {/* Console output */}
        <div className="w-full sm:w-64 bg-[#0a0d10] p-4 flex flex-col justify-between overflow-y-auto border-t sm:border-t-0 border-line">
          <div>
            <span className="text-[10px] text-muted font-bold block mb-2 uppercase">Console</span>
            <pre className="text-[11px] text-muted whitespace-pre-wrap">{output || 'No execution yet.'}</pre>
          </div>

          {testsPassed && (
            <div className="text-green text-xs font-semibold flex items-center space-x-1 pt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready for submission!</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="bg-bg border-t border-line px-4 py-3 flex justify-between items-center shrink-0">
        <button 
          onClick={handleRun}
          disabled={running}
          className="bg-bg hover:bg-line border border-line text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          {running ? 'Running...' : 'Run Code'}
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!testsPassed}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            testsPassed ? 'bg-cyan hover:bg-cyan2 text-bg' : 'bg-line text-muted cursor-not-allowed'
          }`}
        >
          Submit Exercise (+75 XP)
        </button>
      </div>

    </div>
  );
};
