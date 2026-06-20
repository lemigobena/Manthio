import React, { useState, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useXP } from '../../context/XPContext';
import type { ToastMessage } from '../../context/XPContext';
import { AlertCircle, CheckCircle, Sparkles, Info, X } from 'lucide-react';

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
  
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg text-text">
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={onNavigate} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <TopBar 
          onNavigate={onNavigate} 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Content View Body */}
        <main className="flex-1 overflow-y-auto px-[44px] py-6">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-180px)]">
            {children}
          </div>
          
          {/* Footer inside main layout frame - hidden on checkout for single-screen focus */}
          {activePage !== 'checkout' && <Footer onNavigate={onNavigate} />}
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
