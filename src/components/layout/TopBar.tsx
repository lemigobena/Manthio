import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Flame, Sun, Moon, Bell } from 'lucide-react';

interface TopBarProps {
  onNavigate: (page: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { streak } = useXP();
  const { theme, toggleTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Keyboard shortcut listener (Cmd/Ctrl + K) - REQ-TOPBAR-001
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notifications = [
    { id: 1, text: 'Live session starts in 5 minutes!', time: '2 min ago', critical: true },
    { id: 2, text: 'Congratulations! You have completed Module 2.', time: '1 hr ago', critical: false },
    { id: 3, text: 'AI Tutor has rated your code task.', time: '3 hrs ago', critical: false }
  ];

  return (
    <div className="bg-panel border-b border-line h-16 px-6 flex items-center justify-between shrink-0 relative z-40">
      
      {/* Global Search Input */}
      <div className="relative w-80 max-w-xs sm:max-w-sm hidden sm:block">
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search... (Cmd+K)" 
          className="w-full bg-bg border border-line rounded-xl pl-9 pr-4 py-1.5 text-xs text-text focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
        />
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
      </div>

      <div className="flex items-center space-x-4 ml-auto sm:ml-0">
        
        {/* Streak Flame Indicator (REQ-TOPBAR-003) */}
        <button 
          onClick={() => onNavigate('analytics')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-bg border border-line hover:border-yellow group transition-all duration-300 cursor-pointer"
          title="Your daily activity"
        >
          <Flame className="w-4 h-4 text-yellow group-hover:animate-bounce transition-transform duration-500 fill-yellow/10" />
          <span className="text-xs font-bold text-text">{streak} Days</span>
        </button>

        {/* Theme Toggle (REQ-NFR-053) */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to light design' : 'Switch to dark design'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown (REQ-TOPBAR-002) */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red" />
          </button>

          {/* Notifications Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-panel border border-line rounded-2xl shadow-xl p-4 space-y-3 z-50">
              <div className="flex justify-between items-center border-b border-line pb-2">
                <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Notifications</h4>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[10px] text-cyan hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl border text-xs space-y-1 ${n.critical ? 'bg-red/10 border-red/30' : 'bg-bg/40 border-line'}`}
                  >
                    <p className="font-medium text-text">{n.text}</p>
                    <span className="text-[10px] text-muted block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar */}
        {user && (
          <button 
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-2 p-1.5 rounded-xl bg-bg border border-line hover:border-cyan transition-all cursor-pointer"
          >
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-line object-cover" />
            <span className="text-xs font-semibold text-text hidden md:inline">{user.name.split(' ')[0]}</span>
          </button>
        )}

      </div>

    </div>
  );
};
