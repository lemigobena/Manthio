import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { 
  LayoutDashboard, BookOpen, Compass, BrainCircuit, PieChart, 
  Folder, MessagesSquare, Settings, ChevronLeft, X, Video
} from 'lucide-react';

function useAnimatedValue(endValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(endValue);
  const currentVisual = useRef(endValue);

  useEffect(() => {
    if (currentVisual.current === endValue) return;
    
    const startValue = currentVisual.current;
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const nextVal = startValue + (endValue - startValue) * easeProgress;
      currentVisual.current = nextVal;
      // We round for display
      setDisplayValue(Math.round(nextVal));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        currentVisual.current = endValue;
        setDisplayValue(endValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  return displayValue;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  collapsed, 
  setCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { user } = useAuth();
  const { xp, level, currentXpInLevel, xpNeededForNextLevel } = useXP();

  const progressPercentage = Math.round((currentXpInLevel / xpNeededForNextLevel) * 100);
  
  // Animate these values for a smooth flow
  const animatedXp = useAnimatedValue(xp, 1500);
  const animatedProgress = useAnimatedValue(progressPercentage, 1500);

  // Swipe-left-to-close tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Swipe left at least 50px, and more horizontal than vertical
    if (deltaX < -50 && deltaY < Math.abs(deltaX)) {
      setIsMobileOpen(false);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleNavigate = (id: string) => {
    onNavigate(id);
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catalog', icon: Compass },
    { id: 'learning-path', label: 'Learning Path', icon: BookOpen },
    { id: 'ai-tutor', label: 'AI Tutor', icon: BrainCircuit },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'resources', label: 'Files', icon: Folder },
    { id: 'community', label: 'Community', icon: MessagesSquare },
    { id: 'live-sessions', label: 'Live Sessions', icon: Video },
  ];

  const bottomItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {/* Actual Sidebar */}
      <div 
        className={`bg-panel h-[100dvh] flex flex-col transition-all duration-300 border-r border-line z-[70]
          ${(collapsed && !isMobileOpen) ? 'w-[68px]' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative top-0 left-0
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Brand Header */}
        <div className="pt-3 pb-6 px-4 flex flex-col items-center justify-center relative">
          {/* Mobile/Tablet Close Button inside Sidebar */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-cyan transition-colors cursor-pointer"
            title="Close menu"
          >
            <X size={18} />
          </button>

          <div className="overflow-hidden w-full flex justify-center py-2">
            <img 
              src="/Branding/primary/logo_7_prio_1_variation.png" 
              alt="Logo" 
              className={`transition-all duration-300 mb-[-20px] ${(collapsed && !isMobileOpen) ? 'w-full h-16 scale-[2.2] translate-x-[-2px]' : 'w-[90%] h-auto max-h-32'} object-contain`}
            />
          </div>
          {(!collapsed || isMobileOpen) && (
            <div className="flex flex-col items-center overflow-hidden">
              <span className="text-[10px] font-bold text-muted/50 uppercase tracking-[0.4em] whitespace-nowrap overflow-hidden">
                Premium E-Learning
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="flex flex-col">
            {/* Nav Items */}
            {[...navItems, ...bottomItems].map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              const isWide = !collapsed || isMobileOpen;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center transition-all duration-300 relative group cursor-pointer ${
                    !isWide ? 'justify-center py-4' : 'px-4 py-3'
                  } ${
                    isActive 
                      ? 'text-cyan bg-gradient-to-r from-cyan/10 to-transparent' 
                      : 'text-muted hover:text-cyan hover:bg-cyan/5'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-cyan shadow-[0_0_10px_var(--cyan)]/40 rounded-r-full" />
                  )}

                  <div className={`flex items-center relative z-10 ${!isWide ? '' : 'space-x-3'}`}>
                    <div className="transition-all duration-300">
                      {isActive ? (
                        <div className="text-cyan">
                          {item.id === 'dashboard' && <LayoutDashboard size={16} fill="currentColor" strokeWidth={1.5} />}
                          {item.id === 'catalog' && (
                            <div className="relative">
                              <Compass size={16} strokeWidth={1.5} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 bg-cyan rounded-full" />
                              </div>
                            </div>
                          )}
                          {item.id === 'learning-path' && <BookOpen size={16} fill="currentColor" fillOpacity={0.4} strokeWidth={1.5} />}
                          {item.id === 'ai-tutor' && <BrainCircuit size={16} fill="currentColor" strokeWidth={1.5} />}
                          {item.id === 'analytics' && (
                            <div className="relative">
                              <PieChart size={16} strokeWidth={1.5} />
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute inset-0 w-4 h-4 text-cyan">
                                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 12A10 10 0 0 0 12 2v10z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                          {item.id === 'settings' && (
                            <div className="relative">
                              <Settings size={16} fill="currentColor" strokeWidth={1.5} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[6px] h-[6px] bg-panel rounded-full border border-cyan/30" />
                              </div>
                            </div>
                          )}
                          {item.id === 'live-session' && <Video size={16} fill="currentColor" fillOpacity={0.4} strokeWidth={1.5} />}
                          {!['dashboard', 'catalog', 'learning-path', 'ai-tutor', 'analytics', 'settings', 'live-session'].includes(item.id) && (
                            <Icon size={16} fill="currentColor" strokeWidth={1.5} />
                          )}
                        </div>
                      ) : (
                        <Icon size={16} fill="none" strokeWidth={2} className="text-muted group-hover:text-cyan transition-colors" />
                      )}
                    </div>
                    {isWide && (
                      <span className={`text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${
                        isActive ? 'text-cyan' : 'text-muted'
                      }`}>
                        {item.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Section: Rank & Profile */}
        <div className="p-3 space-y-2 text-left border-t border-line/30">
          {(!collapsed || isMobileOpen) && (
            <div className="pt-2">
              <div className="flex items-center gap-4 mb-3 px-2">
                <div className="relative">
                  <img 
                    src={user?.avatar || "https://ui-avatars.com/api/?name=Alex+Chen&background=0D1117&color=00F5D4"} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover border border-line" 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green border-2 border-panel rounded-full" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5 overflow-hidden">
                    <span className="text-sm font-bold text-text truncate tracking-tight whitespace-nowrap">{user?.name || "Alex Chen"}</span>
                    <span className="text-[10px] font-bold text-cyan ml-2">LVL {level}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 overflow-hidden">
                    <span className="text-[9px] font-bold text-cyan uppercase tracking-wider whitespace-nowrap">{animatedXp.toLocaleString()} XP</span>
                    <span className="text-[9px] font-bold text-muted">{animatedProgress}%</span>
                  </div>
                  <div className="w-full h-[2px] bg-line/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan"
                      style={{ width: `${animatedProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(collapsed && !isMobileOpen) && (
            <div className="flex flex-col items-center py-2">
              {/* Circular XP progress ring around avatar */}
              <div className="relative w-11 h-11">
                {/* SVG ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                  {/* Track */}
                  <circle
                    cx="22" cy="22" r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-line/40"
                  />
                  {/* Progress */}
                  <circle
                    cx="22" cy="22" r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - animatedProgress / 100)}`}
                    className="text-cyan transition-all duration-700 ease-out drop-shadow-[0_0_4px_rgba(0,255,242,0.6)]"
                  />
                </svg>
                {/* Avatar inside ring */}
                <img
                  src={user?.avatar || "https://ui-avatars.com/api/?name=Alex+Chen&background=0D1117&color=00F5D4"}
                  alt="Avatar"
                  className="absolute inset-[4px] w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="hidden lg:flex justify-center w-full">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center justify-center border border-line/30 text-muted hover:text-cyan hover:border-cyan/50 hover:bg-cyan/5 transition-all duration-300 group ${
                collapsed ? 'w-10 h-10 rounded-full' : 'w-full py-2 rounded-xl'
              }`}
            >
              <div className={`flex items-center gap-3 ${collapsed ? '' : 'w-full px-4 justify-between overflow-hidden'}`}>
                {!collapsed && <span className="text-[10px] font-black tracking-widest whitespace-nowrap overflow-hidden">Collapse Menu</span>}
                <div className={`transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}>
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
