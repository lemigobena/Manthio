import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';

interface CookieSettingsProps {
  onNavigate: (page: string) => void;
}

export const CookieSettings: React.FC<CookieSettingsProps> = () => {
  const { addToast, addXp } = useXP();

  // Cookie Settings State
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [cookieXpClaimed, setCookieXpClaimed] = useState(() => {
    return localStorage.getItem('cookie-xp-claimed') === 'true';
  });

  const handleSaveCookies = () => {
    addToast('success', 'Cookie preferences saved!');
    if (!cookieXpClaimed) {
      addXp(50, 'Setting cookie preferences');
      setCookieXpClaimed(true);
      localStorage.setItem('cookie-xp-claimed', 'true');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 flex flex-col items-center justify-center h-full py-4">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-text font-display">
          Cookie <span className="text-cyan">Settings</span>
        </h1>
        <p className="text-sm text-muted uppercase tracking-widest">Manage your preferences</p>
      </div>

      <div className="w-full space-y-4">
        {/* Option 1: Necessary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-line rounded-xl bg-bg/25 hover:bg-bg/40 transition-colors gap-4">
          <div className="space-y-1.5 pr-6">
            <h4 className="text-sm font-bold text-text">Necessary Cookies</h4>
            <p className="text-xs text-muted leading-relaxed">Required for key system functionalities: keeping you signed in, loading course progress, and persisting dark/light design choices.</p>
          </div>
          <div className="flex items-center bg-cyan/15 border border-cyan/20 px-3 py-1.5 rounded text-[10px] font-bold text-cyan uppercase select-none shrink-0 self-start sm:self-auto">
            Always Active
          </div>
        </div>

        {/* Option 2: Analytics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-line rounded-xl bg-bg/25 hover:bg-bg/40 transition-colors gap-4">
          <div className="space-y-1.5 pr-6">
            <h4 className="text-sm font-bold text-text">Performance & Analytics</h4>
            <p className="text-xs text-muted leading-relaxed">Helps us collect anonymous usage data to evaluate lesson completion times, search performance bottlenecks, and refine syllabus content.</p>
          </div>
          <button 
            onClick={() => setAnalyticsCookies(!analyticsCookies)}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer shrink-0 self-start sm:self-auto ${analyticsCookies ? 'bg-cyan' : 'bg-line'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-panel shadow transition-all duration-300 transform ${analyticsCookies ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Option 3: Marketing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-line rounded-xl bg-bg/25 hover:bg-bg/40 transition-colors gap-4">
          <div className="space-y-1.5 pr-6">
            <h4 className="text-sm font-bold text-text">Personalization & Promotions</h4>
            <p className="text-xs text-muted leading-relaxed">Used to deliver promotional discount updates on upcoming advanced bootcamps and customized learning pathway offers based on completed courses.</p>
          </div>
          <button 
            onClick={() => setMarketingCookies(!marketingCookies)}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer shrink-0 self-start sm:self-auto ${marketingCookies ? 'bg-cyan' : 'bg-line'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-panel shadow transition-all duration-300 transform ${marketingCookies ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="pt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleSaveCookies}
            className="bg-cyan hover:bg-cyan2 text-bg font-bold text-sm px-8 py-3 rounded-xl transition-colors cursor-pointer text-center w-full sm:w-auto"
          >
            Save Preferences
          </button>
          {!cookieXpClaimed && (
            <span className="text-xs font-bold text-yellow animate-pulse">
              ✨ Setting preferences awards +50 XP!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
