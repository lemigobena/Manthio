import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Sun, Moon, Bell, User, Sliders, LogOut, Menu, X } from 'lucide-react';
import { SearchOverlay } from '../search/SearchOverlay';

interface TopBarProps {
  onNavigate: (page: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onNavigate,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { user, signOut } = useAuth();
  const { streak } = useXP();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [overlayCoords, setOverlayCoords] = useState<{ top: number; left: number } | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const updateCoords = useCallback(() => {
    if (searchButtonRef.current) {
      const rect = searchButtonRef.current.getBoundingClientRect();
      setOverlayCoords({
        top: rect.bottom + 10,
        left: rect.left
      });
    }
  }, []);

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(updateCoords, 0);
  }, [updateCoords]);

  useEffect(() => {
    if (searchOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [searchOpen, updateCoords]);

  // Keyboard shortcut listener (Cmd/Ctrl + K) - REQ-TOPBAR-001
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenSearch]);

  // Click outside handlers to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
    setProfileOpen(false);
  };

  const handleToggleProfile = () => {
    setProfileOpen(prev => !prev);
    setNotificationsOpen(false);
  };

  const notifications = [
    { id: 1, text: 'Live session starts in 5 minutes!', time: '2 min ago', critical: true },
    { id: 2, text: 'Congratulations! You have completed Module 2.', time: '1 hr ago', critical: false },
    { id: 3, text: 'AI Tutor has rated your code task.', time: '3 hrs ago', critical: false }
  ];

  return (
    <div className="bg-panel border-b border-line h-16 px-[26px] shrink-0 relative z-[60]">
      <div className="max-w-[1360px] mx-auto h-full flex items-center justify-between gap-5 w-full">
        {/* Mobile/Tablet Menu Button Toggle */}
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-muted hover:text-cyan hover:bg-cyan/10 transition-colors cursor-pointer shrink-0"
          title="Toggle menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Global Search Button Trigger (Interactive Command Palette) */}
        <div className="relative flex-1 max-w-xl hidden md:block">
          <button 
            ref={searchButtonRef}
            onClick={handleOpenSearch}
            className="w-full bg-bg border border-line rounded-2xl pl-10 pr-4 py-2 text-sm text-muted/60 hover:text-muted hover:border-cyan hover:ring-1 hover:ring-cyan transition-all text-left flex items-center justify-between cursor-text focus:outline-none"
          >
            <span className="text-xs">Search... (Cmd+K)</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-panel border border-line px-1.5 py-0.5 rounded font-bold text-muted font-mono select-none">
              <span>⌘</span>K
            </kbd>
          </button>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>

        <div className="flex items-center space-x-4 ml-auto shrink-0">
          
          {/* Mobile Search Icon (<768px) */}
          <button 
            onClick={handleOpenSearch}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Streak Flame Indicator (REQ-TOPBAR-003) */}
          <button 
            onClick={() => onNavigate('analytics')}
            className="h-9 flex items-center space-x-1.5 px-3 rounded-full bg-bg border border-line hover:border-yellow group transition-all duration-300 cursor-pointer"
            title="Your daily activity"
          >
            {/* Streak Flame Emoji: Expands and bounces on hover */}
            <div className="relative w-[18px] h-[18px] flex items-center justify-center select-none shrink-0 transition-transform duration-300 group-hover:scale-125">
              <span className="text-sm inline-block group-hover:animate-bounce">🔥</span>
            </div>
            <span className="text-xs font-bold text-text">
              {streak}<span className="hidden md:inline"> Days</span>
            </span>
          </button>

          {/* Theme Toggle (REQ-NFR-053) */}
          <button 
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light design' : 'Switch to dark design'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown (REQ-TOPBAR-002) */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={handleToggleNotifications}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red" />
            </button>

            {/* Notifications Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-panel border border-line rounded-2xl shadow-xl p-4 space-y-3 z-50">
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

          {/* User Profile avatar & Dropdown */}
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={handleToggleProfile}
                className={`h-9 w-9 flex items-center justify-center rounded-full bg-bg border transition-all cursor-pointer ${
                  profileOpen ? 'border-cyan ring-1 ring-cyan' : 'border-line hover:border-cyan'
                }`}
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-panel/95 backdrop-blur-md border border-line rounded-2xl shadow-2xl p-2 z-50 space-y-1 transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                  {/* User Info Header */}
                  <div className="px-3 py-2 border-b border-line mb-1">
                    <p className="text-xs font-bold text-text truncate">{user.name}</p>
                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                  </div>
                  
                  {/* Profile Link */}
                  <button 
                    onClick={() => {
                      onNavigate('settings:profile');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-cyan hover:bg-cyan/10 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-cyan" />
                    <span>Profile</span>
                  </button>
                  
                  {/* Settings Link */}
                  <button 
                    onClick={() => {
                      onNavigate('settings:preferences');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-cyan hover:bg-cyan/10 transition-colors text-left cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-cyan" />
                    <span>Settings</span>
                  </button>
                  
                  {/* Sign out */}
                  <button 
                    onClick={() => {
                      signOut();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red hover:bg-red/10 transition-colors text-left cursor-pointer border-t border-line mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      <SearchOverlay 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onNavigate={onNavigate} 
        coords={overlayCoords}
      />
    </div>
  );
};
