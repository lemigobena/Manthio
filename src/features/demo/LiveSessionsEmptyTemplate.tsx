import React, { useState } from 'react';
import { Video, Calendar, Search } from 'lucide-react';

export const LiveSessionsEmptyTemplate: React.FC<{ onNavigate?: (p: string) => void }> = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-full space-y-8 animate-cel-reveal p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-cyan mb-2">
            <Video size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Directory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple">Sessions</span>
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Join interactive masterclasses, Q&A sessions, and deep dives with expert trainers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-panel border border-line rounded-xl px-4 py-2.5 flex items-center space-x-2 w-full md:w-64 focus-within:border-cyan transition-colors">
            <Search size={16} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search sessions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs text-text w-full"
            />
          </div>
        </div>
      </div>

      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-line rounded-2xl bg-panel/50 mt-8">
        <Calendar size={48} className="text-muted/50 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No sessions available</h3>
        <p className="text-sm text-muted">There are currently no live or upcoming sessions.</p>
      </div>
    </div>
  );
};
