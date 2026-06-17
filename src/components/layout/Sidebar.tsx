import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { 
  LayoutDashboard, BookOpen, Compass, Sparkles, LineChart, 
  FolderKanban, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  collapsed, 
  setCollapsed 
}) => {
  const { user, signOut } = useAuth();
  const { level, currentXpInLevel, xpNeededForNextLevel } = useXP();

  const progressPercentage = Math.round((currentXpInLevel / xpNeededForNextLevel) * 100);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'catalog', label: 'Browse Courses', icon: <Compass className="w-4 h-4" /> },
    { id: 'learning-path', label: 'Learning Path', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai-tutor', label: 'AI Tutor', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <LineChart className="w-4 h-4" /> },
    { id: 'resources', label: 'Files', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'community', label: 'Community', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div 
      className={`bg-panel border-r border-line h-screen flex flex-col justify-between transition-all duration-300 relative ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-line flex items-center justify-between">
        {!collapsed && (
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan text-xl font-black font-display tracking-tight">MANTHIO</span>
            </div>
            <span className="text-[9px] text-muted font-bold block uppercase mt-0.5">by apigenio GmbH</span>
          </div>
        )}
        {collapsed && (
          <span className="text-cyan text-xl font-black font-display mx-auto">M</span>
        )}
      </div>

      {/* Level and XP Progress (REQ-SIDEBAR-001) */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-line space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted">Level {level}</span>
            <span className="text-cyan">{progressPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-line">
            <div className="h-full bg-cyan transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="text-[10px] text-muted text-right">
            {currentXpInLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
          </div>
        </div>
      )}

      {/* Main Navigation Items (REQ-SIDEBAR-001) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center p-3 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                isActive ? 'bg-cyan/10 text-cyan border-l-2 border-cyan' : 'text-muted hover:text-text hover:bg-bg/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={isActive ? 'text-cyan' : 'text-muted group-hover:text-text'}>
                  {item.icon}
                </div>
                {!collapsed && <span>{item.label}</span>}
              </div>
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-20 bg-panel border border-line text-text px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Collapse Toggle & User Info */}
      <div className="p-3 border-t border-line space-y-3">
        {/* Collapse button toggle (REQ-SIDEBAR-004) */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl bg-bg/50 hover:bg-bg border border-line text-muted hover:text-text transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User mini-card */}
        {user && (
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-bg/40 border border-line/50 ${collapsed ? 'justify-center' : ''}`}>
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-line object-cover" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text truncate">{user.name}</p>
                <p className="text-[10px] text-muted truncate">Level {level} Explorer</p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={signOut}
                className="text-muted hover:text-red transition-colors p-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
