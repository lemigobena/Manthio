import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Sun, Moon, Bell, User, Sliders, LogOut, Menu, X, BookOpen, MessageSquare, AlertCircle, Award, Target } from 'lucide-react';
import { SearchOverlay } from '../search/SearchOverlay';
import { useNotifications } from '../../context/NotificationContext';

interface TopBarProps {
  onNavigate: (page: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  activePage?: string;
  isPublicView?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onNavigate,
  isMobileOpen,
  setIsMobileOpen,
  isPublicView
}) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { streak } = useXP();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

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

  const recentNotifications = notifications.slice(0, 20);

  if (isPublicView) {
    return (
      <div className="bg-panel border-b border-line h-16 px-3 md:px-6 lg:px-8 shrink-0 relative z-[60]">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between w-full">
          <div className="min-w-0 shrink">
            <img 
              src="/Branding/primary/logo_7_prio_1_variation.png" 
              alt="Manthio Logo" 
              className="h-[90px] sm:h-[120px] md:h-24 lg:h-30 -ml-[25px] sm:-ml-[35px] md:-ml-[45px] cursor-pointer object-left object-contain transition-transform hover:scale-105"
              onClick={() => onNavigate('explore')}
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0 ml-1">
            <button onClick={toggleTheme} className="p-1 sm:p-2 rounded-xl text-muted hover:text-text hover:bg-bg/50 transition-colors">
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            {isAuthenticated ? (
              <button onClick={() => onNavigate('dashboard')} className="bg-cyan hover:bg-cyan2 text-bg text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap">
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => { signOut(); onNavigate('signin'); }} className="bg-transparent border border-cyan text-cyan hover:bg-cyan/10 text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap">
                  Login
                </button>
                <button onClick={() => { onNavigate('signup'); }} className="bg-cyan hover:bg-cyan2 text-bg text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel border-b border-line h-16 max-[374px]:px-2 px-3 md:px-6 lg:px-8 shrink-0 relative z-[60]">
      <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between gap-5 max-[374px]:gap-2 w-full">
        {/* Mobile/Tablet Menu Button Toggle */}
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-muted hover:text-cyan transition-colors cursor-pointer shrink-0"
          title="Toggle menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Global Search Component (Handles both Desktop Input and full overlay) */}
        <div className={`relative flex-1 hidden md:block z-[65] transition-all duration-300 ease-out ${searchOpen ? 'max-w-[1000px]' : 'max-w-xl'}`}>
          <SearchOverlay 
            isOpen={searchOpen} 
            onClose={() => setSearchOpen(false)} 
            onOpen={() => setSearchOpen(true)}
            onNavigate={onNavigate} 
          />
        </div>

        <div className="flex items-center space-x-4 max-[374px]:space-x-2 ml-auto shrink-0">
          
          {/* Mobile Search Icon (<768px) */}
          <button 
            onClick={handleOpenSearch}
            className="md:hidden h-9 w-9 max-[374px]:h-8 max-[374px]:w-8 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Streak Flame Indicator (REQ-TOPBAR-003) */}
          <button 
            onClick={() => onNavigate('analytics')}
            className="h-9 max-[374px]:h-8 flex items-center space-x-1.5 px-3 max-[374px]:px-2 rounded-full bg-bg border border-line hover:border-yellow group transition-all duration-300 cursor-pointer"
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
            className="h-9 w-9 max-[374px]:h-8 max-[374px]:w-8 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer"
            title={resolvedTheme === 'dark' ? 'Switch to light design' : 'Switch to dark design'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown (REQ-TOPBAR-002) */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={handleToggleNotifications}
              className="h-9 w-9 max-[374px]:h-8 max-[374px]:w-8 flex items-center justify-center rounded-xl bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red text-white text-[9px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {notificationsOpen && (
              <div className="absolute max-[429px]:fixed max-[429px]:inset-x-3 max-[429px]:top-[72px] max-[429px]:mt-0 max-[429px]:w-auto right-0 top-full mt-2 w-[340px] bg-panel border border-line rounded-2xl shadow-xl p-0 z-50 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center border-b border-line p-3 shrink-0 bg-panel">
                  <h4 className="font-bold text-xs uppercase text-muted tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-cyan hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto p-2 space-y-1">
                  {recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-muted text-xs">No notifications yet.</div>
                  ) : (
                    recentNotifications.map(n => {
                        const accentMap: Record<string, string> = {
                          course: 'border-l-cyan bg-cyan/5',
                          social: 'border-l-purple bg-purple/5',
                          system: 'border-l-yellow bg-yellow/5',
                          gamification: 'border-l-green bg-green/5',
                          marketing: 'border-l-orange bg-orange/5',
                        };
                        const iconMap: Record<string, React.ReactNode> = {
                          course: <BookOpen className="w-3.5 h-3.5 text-cyan" />,
                          social: <MessageSquare className="w-3.5 h-3.5 text-purple" />,
                          system: <AlertCircle className="w-3.5 h-3.5 text-yellow" />,
                          gamification: <Award className="w-3.5 h-3.5 text-green" />,
                          marketing: <Target className="w-3.5 h-3.5 text-orange" />,
                        };
                        const criticalOverride = n.critical ? 'border-l-red bg-red/5' : '';
                        return (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              if (!n.read) markAsRead(n.id);
                              if (n.link) {
                                onNavigate(n.link);
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border-l-[3px] border border-line/40 text-xs cursor-pointer transition-all shadow-sm ${
                              !n.read
                                ? (criticalOverride || accentMap[n.category] || 'bg-bg border-l-cyan bg-cyan/5')
                                : 'bg-bg/30 border-l-line opacity-60 hover:opacity-80'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-bg/80 border border-line/30">
                              {n.critical
                                ? <AlertCircle className="w-3.5 h-3.5 text-red" />
                                : (iconMap[n.category] ?? <Bell className="w-3.5 h-3.5 text-muted" />)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-1">
                                <p className={`font-bold leading-tight truncate ${n.critical ? 'text-red' : 'text-text'}`}>{n.title}</p>
                                <span className="text-[9px] text-muted whitespace-nowrap shrink-0 pt-0.5">{n.time}</span>
                              </div>
                              <p className="text-muted line-clamp-2 leading-relaxed mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
                <div className="p-2 border-t border-line shrink-0 bg-panel">
                  <button
                    onClick={() => {
                      onNavigate('notifications');
                      setNotificationsOpen(false);
                    }}
                    className="w-full text-center text-xs font-bold text-cyan hover:text-cyan2 p-2"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile avatar & Dropdown */}
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={handleToggleProfile}
                className={`h-9 w-9 max-[374px]:h-8 max-[374px]:w-8 flex items-center justify-center rounded-full bg-bg border transition-all cursor-pointer ${
                  profileOpen ? 'border-cyan ring-1 ring-cyan' : 'border-line hover:border-cyan'
                }`}
              >
                <div className="relative w-8 h-8 max-[374px]:w-7 max-[374px]:h-7">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 max-[374px]:w-7 max-[374px]:h-7 rounded-full object-cover" />
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-panel shadow-[0_0_6px_rgba(43,222,126,0.7)]" />
                </div>

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
                      onNavigate('profile');
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
                      onNavigate('signin');
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
      
      {/* Mobile Search Overlay Wrapper */}
      <div className="md:hidden">
        <SearchOverlay 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
          onOpen={() => setSearchOpen(true)}
          onNavigate={onNavigate} 
        />
      </div>
    </div>
  );
};
