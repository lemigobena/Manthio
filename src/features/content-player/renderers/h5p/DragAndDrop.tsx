import React, { useState, useRef, useEffect } from 'react';
import type { H5PDragAndDropData } from '../../../../types';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface DragAndDropProps {
  data: H5PDragAndDropData;
  onComplete: () => void;
}

export const DragAndDrop: React.FC<DragAndDropProps> = ({ data, onComplete }) => {
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

  // Map of draggableItem id -> dropZone id
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      setPlacements(prev => ({ ...prev, [itemId]: zoneId }));
    }
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleRemoveFromZone = (itemId: string) => {
    if (isSubmitted) return;
    setPlacements(prev => {
      const newPlacements = { ...prev };
      delete newPlacements[itemId];
      return newPlacements;
    });
  };

  const unplacedItems = data.draggableItems.filter(item => !placements[item.id]);
  const allPlaced = Object.keys(placements).length === data.draggableItems.length;

  const handleSubmit = () => {
    setIsSubmitted(true);
    
    // Check if all placements are correct
    let allCorrect = true;
    for (const [itemId, zoneId] of Object.entries(placements)) {
      const zone = data.dropZones.find(z => z.id === zoneId);
      if (!zone || !zone.acceptsIds.includes(itemId)) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleReset = () => {
    setPlacements({});
    setIsSubmitted(false);
  };

  const checkCorrectness = (itemId: string, zoneId: string) => {
    if (!isSubmitted) return null;
    const zone = data.dropZones.find(z => z.id === zoneId);
    return zone?.acceptsIds.includes(itemId) ?? false;
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-bg border border-line rounded-xl overflow-hidden shadow-xl">
      <div className={`bg-panel px-6 py-4 border-b border-line flex shrink-0 ${
        containerWidth < 640 ? 'flex-col gap-4 items-stretch' : 'justify-between items-center'
      }`}>
        <h2 className="text-xl font-bold truncate">Drag and Drop Match</h2>
        <div className={`flex items-center gap-3 ${
          containerWidth < 640 ? 'justify-between flex-wrap w-full' : ''
        }`}>
          <button 
            onClick={handleReset}
            className="text-muted hover:text-text px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allPlaced || isSubmitted}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              !allPlaced || isSubmitted
                ? 'bg-line text-muted cursor-not-allowed opacity-50'
                : 'bg-cyan hover:bg-cyan2 text-bg shadow-lg shadow-cyan/20'
            }`}
          >
            Check Answers
          </button>
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden relative ${
        containerWidth < 850 ? 'flex-col' : 'flex-row'
      }`}>
        {/* Drop Zones Area */}
        <div className="flex-1 p-8 overflow-y-auto relative">
          
          <div className={`grid gap-6 relative z-10 ${
            containerWidth < 600 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {data.dropZones.map(zone => {
              const placedItemsInZone = data.draggableItems.filter(item => placements[item.id] === zone.id);
              
              return (
                <div 
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  className={`border-2 border-dashed rounded-xl p-6 min-h-[160px] flex flex-col transition-colors ${
                    isSubmitted ? 'border-line' : 'border-line hover:border-cyan hover:bg-cyan/5'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-4 text-center opacity-80">{zone.label}</h3>
                  <div className="flex-1 flex flex-wrap gap-3 items-start justify-center">
                    {placedItemsInZone.map(item => {
                      const isCorrect = checkCorrectness(item.id, zone.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleRemoveFromZone(item.id)}
                          className={`px-4 py-2 rounded-lg shadow-sm font-medium cursor-pointer transition-all ${
                            isCorrect === null 
                              ? 'bg-panel border border-line hover:border-cyan text-text'
                              : isCorrect 
                                ? 'bg-green/20 border border-green text-green'
                                : 'bg-red/20 border border-red text-red'
                          }`}
                        >
                          {item.content}
                          {isCorrect === true && <CheckCircle2 className="w-4 h-4 inline-block ml-2" />}
                        </div>
                      )
                    })}
                    {placedItemsInZone.length === 0 && (
                      <div className="text-muted text-sm my-auto opacity-50 italic">
                        Drop items here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Draggable Items Bank */}
        <div className={`bg-panel border-line p-6 flex flex-col shrink-0 ${
          containerWidth < 850 
            ? 'w-full border-t max-h-[160px] overflow-y-auto' 
            : 'w-80 border-l'
        }`}>
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted mb-6">Word Bank</h3>
          
          <div className="flex flex-wrap gap-3">
            {unplacedItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`px-4 py-3 rounded-lg bg-bg border border-line cursor-grab active:cursor-grabbing font-medium shadow-sm transition-all hover:border-cyan hover:shadow-cyan/10 ${
                  draggedItemId === item.id ? 'opacity-50 scale-95' : 'hover:-translate-y-0.5'
                }`}
              >
                {item.content}
              </div>
            ))}
            {unplacedItems.length === 0 && (
              <div className="w-full py-8 text-center text-muted italic flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-green/50 mb-2" />
                All items placed!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
