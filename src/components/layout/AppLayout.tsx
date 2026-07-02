import React, { useState, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useNotifications } from '../../context/NotificationContext';
import type { LiveNotificationToast } from '../../context/NotificationContext';
import type { ToastMessage } from '../../context/XPContext';
import { AlertCircle, CheckCircle, Sparkles, Info, X, Bell, BookOpen, MessageSquare, Award, Target } from 'lucide-react';

interface ToastItemProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, removeToast }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwipeGesture = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
    isSwipeGesture.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isSwipeGesture.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = Math.abs(currentY - startY.current);

    if (diffY > 30 && Math.abs(diffX) < 15) {
      isSwipeGesture.current = false;
      setIsDragging(false);
      setDragX(0);
      return;
    }

    setDragX(diffX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragX) > 80) {
      const exitDirection = dragX > 0 ? 500 : -500;
      setDragX(exitDirection);
      removeToast(toast.id);
    } else {
      setDragX(0);
    }
  };

  const isXp = toast.type === 'xp';
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  const dragOpacity = Math.max(0, 1 - Math.abs(dragX) / 250);
  const hasSwiped = dragX !== 0;

  const animationClass = toast.isDismissing && !hasSwiped
    ? 'toast-item-exit'
    : !toast.isDismissing
      ? 'toast-item-enter'
      : '';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: dragX !== 0 ? `translateX(${dragX}px)` : undefined,
        opacity: dragX !== 0 ? dragOpacity : undefined,
        transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
      }}
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-center justify-between gap-3 backdrop-blur-md select-none touch-pan-y ${animationClass} ${
        isXp ? 'bg-cyan/10 border-cyan/40 text-cyan' :
        isSuccess ? 'bg-green/10 border-green/40 text-green' :
        isError ? 'bg-red/10 border-red/40 text-red' :
        'bg-panel border-line text-muted'
      }`}
    >
      <div className="flex items-center space-x-2.5 text-xs font-semibold leading-normal min-w-0">
        {isXp && <Sparkles className="w-4 h-4 shrink-0" />}
        {isSuccess && <CheckCircle className="w-4 h-4 shrink-0" />}
        {isError && <AlertCircle className="w-4 h-4 shrink-0" />}
        {isInfo && <Info className="w-4 h-4 shrink-0" />}
        <span className="truncate">{toast.text}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isError && toast.onRetry && (
          <button
            onClick={(e) => { e.stopPropagation(); toast.onRetry?.(); removeToast(toast.id); }}
            className="text-[10px] font-black uppercase tracking-wider bg-red/15 hover:bg-red/25 text-red px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        )}
        <button
          onClick={() => removeToast(toast.id)}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            isXp ? 'hover:bg-cyan/20' :
            isSuccess ? 'hover:bg-green/20' :
            isError ? 'hover:bg-red/20' :
            'hover:bg-line'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── Live Notification Toast (banner style) ────────────────────────────────────
interface NotifToastItemProps {
  toast: LiveNotificationToast;
  onDismiss: (toastId: string) => void;
  onMarkRead: (id: string) => void;
}

const NOTIF_ACCENT: Record<string, { bar: string; bg: string; border: string; icon: React.ReactNode }> = {
  course:       { bar: 'border-l-cyan',   bg: 'bg-cyan/10',   border: 'border-cyan/30',   icon: <BookOpen     className="w-4 h-4 text-cyan"   /> },
  social:       { bar: 'border-l-purple', bg: 'bg-purple/10', border: 'border-purple/30', icon: <MessageSquare className="w-4 h-4 text-purple" /> },
  system:       { bar: 'border-l-yellow', bg: 'bg-yellow/10', border: 'border-yellow/30', icon: <AlertCircle  className="w-4 h-4 text-yellow"  /> },
  gamification: { bar: 'border-l-green',  bg: 'bg-green/10',  border: 'border-green/30',  icon: <Award        className="w-4 h-4 text-green"   /> },
  marketing:    { bar: 'border-l-orange', bg: 'bg-orange/10', border: 'border-orange/30', icon: <Target       className="w-4 h-4 text-orange"  /> },
};

const NotifToastItem: React.FC<NotifToastItemProps> = ({ toast, onDismiss, onMarkRead }) => {
  const accent = toast.critical
    ? { bar: 'border-l-red', bg: 'bg-red/10', border: 'border-red/30', icon: <AlertCircle className="w-4 h-4 text-red" /> }
    : (NOTIF_ACCENT[toast.category] ?? { bar: 'border-l-muted', bg: 'bg-panel', border: 'border-line', icon: <Bell className="w-4 h-4 text-muted" /> });

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl
        border border-l-[4px] shadow-xl backdrop-blur-md
        ${accent.bar} ${accent.bg} ${accent.border}
        animate-[slideIn_0.35s_cubic-bezier(0.22,1,0.36,1)]
      `}
    >
      {/* Icon */}
      <div className="shrink-0 p-1.5 rounded-lg bg-bg/60 border border-line/30">
        {accent.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-xs leading-snug ${toast.critical ? 'text-red' : 'text-text'}`}>
          {toast.title}
        </p>
        <p className="text-[11px] text-muted leading-relaxed mt-0.5 line-clamp-2">
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => { onMarkRead(toast.id); onDismiss(toast.toastId); }}
        className="shrink-0 p-1 text-muted hover:text-text transition-colors rounded-md hover:bg-bg/40"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  activePage, 
  onNavigate 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toasts, removeToast, celebrationActive, dismissCelebration, levelUpTo } = useXP();
  const { liveToasts, dismissLiveToast, markAsRead } = useNotifications();
  const { isAuthenticated } = useAuth();
  
  const mainRef = useRef<HTMLElement>(null);
  
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [activePage]);
  
  const isPublicView = !isAuthenticated || activePage === 'explore';
  
  return (
    <div className={`group/layout flex h-[100dvh] overflow-hidden bg-bg text-text relative ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Global Mouse Spotlight Effect removed */}
      {/* Sidebar Navigation */}
      {!isPublicView && (
        <Sidebar 
          activePage={activePage} 
          onNavigate={onNavigate} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <TopBar 
          onNavigate={onNavigate} 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          activePage={activePage}
          isPublicView={isPublicView}
        />

        {/* Content View Body */}
        <main ref={mainRef} className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-[44px] py-6 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1">
            {children}
          </div>
          
          {activePage !== 'checkout' && activePage !== 'community' && activePage !== 'ai-tutor' && activePage !== 'completed-course' && (
            <div className="mt-auto pt-6">
              <Footer onNavigate={onNavigate} />
            </div>
          )}
        </main>
      </div>

      {/* Toast Notifications System Overlay */}
      {/* REQ-TOAST-001: bottom-right on desktop, top-centre on mobile/tablet */}
      <div className={`fixed z-[80] flex flex-col max-lg:flex-col-reverse max-w-sm w-full pointer-events-none
        bottom-6 right-6 space-y-2.5
        max-lg:top-4 max-lg:bottom-auto max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:right-auto max-lg:px-4 max-lg:space-y-0 max-lg:space-y-reverse max-lg:gap-2.5
      `}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>

      {/* Live Notification Toast Overlay — bottom-right desktop / top-center mobile */}
      <div className={`fixed z-[79] flex flex-col-reverse max-w-sm w-full pointer-events-none gap-2.5
        bottom-6 right-6
        max-lg:flex-col max-lg:top-[72px] max-lg:bottom-auto max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:right-auto max-lg:px-4
      `}>
        {liveToasts.map(toast => (
          <NotifToastItem key={toast.toastId} toast={toast} onDismiss={dismissLiveToast} onMarkRead={markAsRead} />
        ))}
      </div>

      {/* Celebration Modal Overlay (REQ-LEVEL-003) */}
      {celebrationActive && levelUpTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm">
          <div className="bg-panel border border-line p-8 rounded-2xl shadow-2xl text-center max-w-md w-full space-y-6">
            <div className="w-20 h-20 bg-cyan/15 text-cyan border border-cyan/35 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              {levelUpTo}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text uppercase tracking-tight">Level Up! 🎉</h2>
              <p className="text-muted text-xs leading-relaxed">
                Congratulations Alex! You have reached Level {levelUpTo}. Your hard work is paying off.
              </p>
            </div>
            
            <button
              onClick={dismissCelebration}
              className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              CONTINUE LEARNING
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
