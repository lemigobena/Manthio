import React, { useState, useRef, useEffect } from 'react';
import type { H5PBranchingScenarioNode } from '../../../../types';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface BranchingScenarioProps {
  nodes: H5PBranchingScenarioNode[];
  startNodeId: string;
  onComplete: () => void;
}

export const BranchingScenario: React.FC<BranchingScenarioProps> = ({ nodes, startNodeId, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [currentNodeId, setCurrentNodeId] = useState<string>(startNodeId);

  const currentNode = nodes.find(n => n.id === currentNodeId);

  if (!currentNode) {
    return <div className="p-8 text-center text-red">Error: Node {currentNodeId} not found.</div>;
  }

  const handleChoice = (nextId: string | null) => {
    if (nextId) {
      setCurrentNodeId(nextId);
    } else {
      // End of branch
      onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentNodeId(startNodeId);
  };

  const isEndNode = currentNode.choices.length === 0;

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-bg border border-line rounded-xl overflow-hidden shadow-xl">
      <div className={`bg-panel px-6 py-4 border-b border-line flex shrink-0 ${
        containerWidth < 640 ? 'flex-col gap-3 items-stretch' : 'justify-between items-center'
      }`}>
        <h2 className="text-xl font-bold truncate" title={currentNode.title}>{currentNode.title}</h2>
        <button 
          onClick={handleRestart}
          className={`text-muted hover:text-text transition-colors flex items-center space-x-2 text-sm font-bold shrink-0 ${
            containerWidth < 640 ? 'justify-center w-full border border-cyan text-cyan py-2 rounded-lg' : ''
          }`}
        >
          <RotateCcw className="w-4 h-4 text-cyan" />
          <span className='text-cyan'>Restart Scenario</span>
        </button>
      </div>

      <div className={`flex-1 flex overflow-hidden relative ${
        containerWidth < 850 ? 'flex-col' : 'flex-row'
      }`}>
        {/* Media / Content Area */}
        <div className={`flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center border-line ${
          containerWidth < 850 ? 'border-b' : 'border-r'
        }`}>
          {currentNode.mediaUrl && (
            <img 
              src={currentNode.mediaUrl} 
              alt={currentNode.title}
              className="max-h-64 w-auto object-contain rounded-xl shadow-lg mb-8"
            />
          )}
          <div className="prose prose-invert max-w-2xl text-center">
            <p className="text-lg leading-relaxed">{currentNode.content}</p>
          </div>
        </div>

        {/* Choices Area */}
        <div className={`bg-panel p-6 flex flex-col shrink-0 overflow-y-auto ${
          containerWidth < 850 ? 'w-full max-h-[250px]' : 'w-96'
        }`}>
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-6">
            {isEndNode ? 'Conclusion' : 'What will you do?'}
          </h3>

          {isEndNode ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 bg-cyan/20 rounded-full flex items-center justify-center text-cyan">
                <ArrowRight className="w-8 h-8" />
              </div>
              <p className="text-center font-bold">You have reached the end of this scenario.</p>
              <button
                onClick={() => onComplete()}
                className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan/20"
              >
                Complete Module
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentNode.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice.nextId)}
                  className="w-full text-left bg-bg hover:bg-line border border-line hover:border-cyan text-text p-4 rounded-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="font-medium pr-8">{choice.text}</p>
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-hover:text-cyan transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
