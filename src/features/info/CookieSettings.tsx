import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { ArrowLeft } from 'lucide-react';

interface CookieSettingsProps {
  onNavigate: (page: string) => void;
}

export const CookieSettings: React.FC<CookieSettingsProps> = ({ onNavigate }) => {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back navigation */}
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center space-x-1.5 text-xs text-muted hover:text-cyan transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Container Card */}
      <div className="bg-panel border border-line rounded-2xl p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-text">Cookie Settings</h2>
          <p className="text-xs text-muted mt-1">Configure your privacy preferences. Changing settings takes effect immediately.</p>
        </div>

        <div className="space-y-4 max-w-xl border-t border-line/30 pt-6">
          {/* Option 1: Necessary */}
          <div className="flex items-center justify-between p-4 border border-line rounded-xl bg-bg/25">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-text">Necessary Cookies</h4>
              <p className="text-[10px] text-muted">Required for key system functionalities: keeping you signed in, loading course progress, and persisting dark/light design choices.</p>
            </div>
            <div className="flex items-center bg-cyan/15 border border-cyan/20 px-2 py-1 rounded text-[10px] font-bold text-cyan uppercase select-none">
              Always Active
            </div>
          </div>

          {/* Option 2: Analytics */}
          <div className="flex items-center justify-between p-4 border border-line rounded-xl bg-bg/25">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-text">Performance & Analytics</h4>
              <p className="text-[10px] text-muted">Helps us collect anonymous usage data to evaluate lesson completion times, search performance bottlenecks, and refine syllabus content.</p>
            </div>
            <button 
              onClick={() => setAnalyticsCookies(!analyticsCookies)}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer shrink-0 ${analyticsCookies ? 'bg-cyan' : 'bg-line'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-panel shadow transition-all duration-300 transform ${analyticsCookies ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Option 3: Marketing */}
          <div className="flex items-center justify-between p-4 border border-line rounded-xl bg-bg/25">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-text">Personalization & Promotions</h4>
              <p className="text-[10px] text-muted">Used to deliver promotional discount updates on upcoming advanced bootcamps and customized learning pathway offers based on completed courses.</p>
            </div>
            <button 
              onClick={() => setMarketingCookies(!marketingCookies)}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer shrink-0 ${marketingCookies ? 'bg-cyan' : 'bg-line'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-panel shadow transition-all duration-300 transform ${marketingCookies ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSaveCookies}
              className="bg-cyan hover:bg-cyan2 text-bg font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              Save Preferences
            </button>
            {!cookieXpClaimed && (
              <span className="text-[10px] font-bold text-yellow animate-pulse">
                ✨ Setting preferences awards +50 XP!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
