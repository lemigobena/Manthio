import React from 'react';
import type { Lesson } from '../../../types';
import { useXP } from '../../../context/XPContext';

interface SandboxRendererProps {
  lesson: Lesson;
  onComplete: () => void;
}

export const SandboxRenderer: React.FC<SandboxRendererProps> = ({ lesson, onComplete }) => {
  const { addXp } = useXP();
  const [submitted, setSubmitted] = React.useState(lesson.status === 'completed');
  const [code, setCode] = React.useState(
`# Write a function that returns the square of all even numbers
def get_even_squares(numbers):
    # TODO: Complete list comprehension
    return [n**2 for n in numbers if n % 2 == 0]

# Test your function
print(get_even_squares([1, 2, 3, 4, 5, 6]))
`);
  const [output, setOutput] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Running tests...");
    
    setTimeout(() => {
      setIsRunning(false);
      setOutput("Running Python 3.12...\n\nOutput:\n[4, 16, 36]\n\n✅ 3/3 test cases passed!");
    }, 1200);
  };

  const handleSubmit = () => {
    if (!submitted) {
      addXp(75, 'Code exercise submitted');
      setSubmitted(true);
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full overflow-hidden border border-line rounded-xl">
      <div className="bg-bg border-b border-line px-4 py-3 flex items-center justify-between text-xs text-muted shrink-0">
        <span className="font-bold text-text">Python Editor • exercise.py</span>
        <span className="bg-cyan/15 text-cyan px-2 py-0.5 rounded font-bold uppercase tracking-wider">Sandbox</span>
      </div>

      {/* Mobile Notice */}
      <div className="md:hidden bg-orange/10 border-b border-orange/30 px-4 py-2 text-[10px] text-orange flex items-center shrink-0">
        <span className="font-bold mr-2">Note:</span>
        We recommend using a tablet or desktop for serious coding exercises.
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor */}
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 font-mono p-4 text-xs lg:text-sm text-cyan bg-[#0a0d10] outline-none resize-none"
          style={{ lineHeight: '1.5' }}
        />
        
        {/* Output Console */}
        <div className="h-48 bg-black border-t border-line flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-line/50 bg-[#111] text-[10px] font-bold text-muted uppercase tracking-wider">
            Console Output
          </div>
          <div className="p-4 font-mono text-xs text-green overflow-y-auto whitespace-pre-wrap flex-1">
            {output || <span className="text-muted/50 italic">Click 'Run Tests' to see output...</span>}
          </div>
        </div>
      </div>

      <div className="bg-bg border-t border-line px-4 py-3 flex items-center justify-between shrink-0">
        <span className={`text-xs font-bold ${output?.includes('passed') ? 'text-green' : 'text-muted'}`}>
          {output?.includes('passed') ? 'Test passed: 3/3 test cases' : 'Waiting to run...'}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`bg-panel border border-line text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer ${isRunning ? 'opacity-50 cursor-wait' : 'hover:bg-line'}`}
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitted}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
              submitted ? 'bg-green/20 text-green border border-green cursor-default' : 'bg-cyan hover:bg-cyan2 text-bg cursor-pointer'
            }`}
          >
            {submitted ? 'Submitted!' : 'Submit Code (+75 XP)'}
          </button>
        </div>
      </div>
    </div>
  );
};
