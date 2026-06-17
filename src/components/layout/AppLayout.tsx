import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useXP } from '../../context/XPContext';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

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
  const { toasts, removeToast, celebrationActive, dismissCelebration, levelUpTo } = useXP();
  
  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={onNavigate} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <TopBar onNavigate={onNavigate} />

        {/* Content View Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-180px)]">
            {children}
          </div>
          
          {/* Footer inside main layout frame */}
          <Footer />
        </main>
      </div>

      {/* Toast Notifications System Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full">
        {toasts.map(toast => {
          const isXp = toast.type === 'xp';
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          
          return (
            <div 
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              className={`p-4 rounded-xl border shadow-lg cursor-pointer flex items-center justify-between transition-all duration-300 ${
                isXp ? 'bg-cyan/10 border-cyan text-cyan' :
                isSuccess ? 'bg-green/10 border-green text-green' :
                isError ? 'bg-red/10 border-red text-red' :
                'bg-panel border-line text-muted'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs font-semibold leading-normal">
                {isSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : 
                 isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : 
                 <Sparkles className="w-4 h-4 shrink-0" />}
                <span>{toast.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Celebration Modal Overlay (REQ-LEVEL-003) */}
      {celebrationActive && levelUpTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm">
          <div className="bg-panel border border-line p-8 rounded-2xl shadow-2xl text-center max-w-md w-full space-y-6">
            <div className="w-20 h-20 bg-cyan/15 text-cyan border border-cyan/35 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              {levelUpTo}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text uppercase tracking-tight">Level Aufstieg! 🎉</h2>
              <p className="text-muted text-xs leading-relaxed">
                Glückwunsch Alex! Du hast Level {levelUpTo} erreicht. Dein Fleiß zahlt sich aus.
              </p>
            </div>
            
            <button
              onClick={dismissCelebration}
              className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              WEITER LERNEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
