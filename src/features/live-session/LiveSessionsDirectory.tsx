import React, { useState } from 'react';
import { 
  Video, Calendar, Clock, Search, Play, 
  ChevronRight, PlayCircle
} from 'lucide-react';
import { liveSessionsData } from './data/liveSessionsData';
import type { LiveSessionData } from './data/liveSessionsData';

interface LiveSessionsDirectoryProps {
  onNavigate: (page: string) => void;
}

export const LiveSessionsDirectory: React.FC<LiveSessionsDirectoryProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const allSessions = Object.values(liveSessionsData);
  
  const filteredSessions = allSessions.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || 
           s.description.toLowerCase().includes(q) || 
           s.trainer.name.toLowerCase().includes(q) ||
           s.tags.some(t => t.toLowerCase().includes(q));
  });
  
  const liveSessions = filteredSessions.filter(s => s.state === 'live');
  const upcomingSessions = filteredSessions.filter(s => s.state === 'pre').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const pastSessions = filteredSessions.filter(s => s.state === 'post').sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleSessionClick = (id: string) => {
    onNavigate(`live-session:${id}`);
  };

  const SessionCard = ({ session, isLive = false, isPast = false }: { session: LiveSessionData, isLive?: boolean, isPast?: boolean }) => {
    const date = new Date(session.startTime);
    
    return (
      <div 
        onClick={() => handleSessionClick(session.id)}
        className="group relative bg-panel border border-line rounded-2xl overflow-hidden cursor-pointer hover:border-cyan/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan/10"
      >
        {isLive && (
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-red/10 text-red px-3 py-1.5 rounded-full border border-red/20 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse shadow-[0_0_8px_var(--red)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Now</span>
          </div>
        )}

        <div className="aspect-video relative overflow-hidden bg-bg">
          {/* Abstract background gradient based on ID */}
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${
            isLive ? 'from-cyan to-purple' : isPast ? 'from-purple to-bg' : 'from-bg to-cyan'
          }`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,228,0.15)_0%,transparent_70%)]" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            {isPast ? <PlayCircle size={48} className="text-text/80 group-hover:text-cyan transition-colors group-hover:scale-110 duration-300" /> 
                    : <Video size={40} className={`mb-4 ${isLive ? 'text-cyan' : 'text-muted'} group-hover:scale-110 transition-transform duration-300`} />}
            {!isPast && (
              <h3 className="text-lg font-bold text-text mb-2 leading-tight max-w-xs">{session.title}</h3>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {isPast && (
            <h3 className="text-base font-bold text-text leading-tight group-hover:text-cyan transition-colors">{session.title}</h3>
          )}

          <div className="flex items-center space-x-3 text-xs text-muted">
            <div className="flex items-center space-x-1.5">
              <Calendar size={14} className="text-cyan" />
              <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock size={14} className="text-purple" />
              <span>{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({session.duration}m)</span>
            </div>
          </div>

          <p className="text-[11px] text-text/70 line-clamp-2 leading-relaxed">
            {session.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <div className="flex items-center space-x-2">
              <img src={session.trainer.avatar} alt={session.trainer.name} className="w-6 h-6 rounded-full border border-line" />
              <span className="text-[11px] font-medium text-text">{session.trainer.name}</span>
            </div>
            
            {isLive ? (
              <button className="text-[10px] font-bold text-bg bg-cyan px-3 py-1.5 rounded-lg flex items-center space-x-1 group-hover:shadow-[0_0_15px_rgba(0,245,228,0.4)] transition-all">
                <span>Join</span>
                <ChevronRight size={14} />
              </button>
            ) : isPast ? (
              <span className="text-[10px] font-bold text-cyan flex items-center space-x-1">
                <span>Watch</span>
                <Play size={10} />
              </span>
            ) : (
              <button className="text-[10px] font-bold text-cyan bg-cyan/10 px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-colors">
                RSVP
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full space-y-8 animate-cel-reveal p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-cyan mb-2">
            <Video size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Directory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tight">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple">Sessions</span>
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Join interactive masterclasses, Q&A sessions, and deep dives with expert trainers.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-panel border border-line rounded-xl px-4 py-2.5 flex items-center space-x-2 w-full md:w-64 focus-within:border-cyan transition-colors">
            <Search size={16} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search sessions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none !outline-none focus:outline-none text-xs text-text w-full"
            />
          </div>
        </div>
      </div>

      {/* Global Empty State */}
      {filteredSessions.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-line rounded-2xl bg-panel/50 mt-8">
          <Search size={48} className="text-muted/50 mb-4" />
          <h3 className="text-lg font-bold text-text mb-2">No sessions found</h3>
          <p className="text-sm text-muted">We couldn't find any sessions matching "{searchQuery}".</p>
        </div>
      )}

      {filteredSessions.length > 0 && (
        <>
          {/* Live Now */}
      {liveSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
            <span>Live Now</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {liveSessions.map(session => (
              <SessionCard key={session.id} session={session} isLive />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {(upcomingSessions.length > 0 || !searchQuery) && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text flex items-center space-x-2">
          <Calendar size={18} className="text-cyan" />
          <span>Upcoming Sessions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {upcomingSessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
          {upcomingSessions.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-line rounded-2xl">
              <Calendar size={32} className="text-muted mb-3" />
              <p className="text-sm text-muted">No upcoming sessions scheduled.</p>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Past Sessions */}
      {(pastSessions.length > 0 || !searchQuery) && (
        <div className="space-y-4 pt-8 border-t border-line">
        <h2 className="text-lg font-bold text-text flex items-center space-x-2">
          <Play size={18} className="text-purple" />
          <span>Past Sessions Library</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {pastSessions.map(session => (
            <SessionCard key={session.id} session={session} isPast />
          ))}
          {pastSessions.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-line rounded-2xl">
              <Video size={32} className="text-muted mb-3" />
              <p className="text-sm text-muted">No recorded sessions available yet.</p>
            </div>
          )}
        </div>
        </div>
      )}
    </>
      )}
    </div>
  );
};
