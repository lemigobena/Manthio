import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Shield, CreditCard, Sliders } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useXP();
  const { theme, toggleTheme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'account' | 'billing' | 'preferences'>('profile');

  // Input states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState('1');

  const handleSaveProfile = () => {
    if (user) {
      updateProfile(name, bio);
      addToast('success', 'Profile successfully saved.');
    }
  };

  const handleExportData = () => {
    addToast('success', 'Data extract (JSON) is being generated. You will receive an email shortly.');
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Do you really want to permanently delete your account? This action will be executed irreversibly after 30 days.');
    if (confirm) {
      addToast('info', 'Account deletion requested. 30-day grace period is running.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account data, subscriptions, and notifications.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Sub Tabs */}
        <div className="w-full lg:w-60 bg-panel border border-line p-2 rounded-2xl shrink-0 h-fit space-y-1">
          <button 
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'profile' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <User className="w-4 h-4" />
            <span>Public Profile</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('account')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'account' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <Shield className="w-4 h-4" />
            <span>Account & Security</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('billing')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'billing' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscriptions & Pricing</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('preferences')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'preferences' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Appearance & Preferences</span>
          </button>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="flex-1 bg-panel border border-line rounded-2xl p-6">
          
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Public Profile</h2>
              
              <div className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-muted font-bold uppercase">Name (Used on certificates)</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-cyan max-w-md"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-muted font-bold uppercase">Biography</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-cyan h-28 max-w-md resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveProfile}
                className="bg-cyan hover:bg-cyan2 text-bg text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                SAVE CHANGES
              </button>
            </div>
          )}

          {activeSubTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Account & Data Security</h2>
              <p className="text-muted text-xs leading-relaxed max-w-md">
                According to EU GDPR and Swiss DPA, you have the right to information about your stored activity data at any time.
              </p>
              
              <div className="pt-4 border-t border-line space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-bg rounded-xl border border-line max-w-md">
                  <div>
                    <h4 className="font-bold text-xs">Request Data Extract</h4>
                    <p className="text-[10px] text-muted mt-0.5">Receive all learning logs and chat histories as a JSON archive.</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="bg-panel border border-line hover:border-cyan text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors"
                  >
                    Request Export
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red/5 border border-red/20 rounded-xl max-w-md">
                  <div>
                    <h4 className="font-bold text-xs text-red">Delete Account</h4>
                    <p className="text-[10px] text-muted mt-0.5">Delete all data irreversibly after a 30-day grace period.</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="bg-red hover:bg-red/90 text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Subscriptions & Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-bg border border-line p-5 rounded-xl text-center space-y-4">
                  <h4 className="font-bold text-sm text-muted">BASIC</h4>
                  <div className="text-xl font-bold">Free</div>
                  <p className="text-[10px] text-muted">Essential tools, limited AI Tutor.</p>
                  <button className="w-full border border-line text-xs font-semibold py-2 rounded-lg text-muted cursor-not-allowed">Active</button>
                </div>
                
                <div className="bg-bg border border-cyan p-5 rounded-xl text-center space-y-4 relative">
                  <span className="absolute top-2 inset-x-0 mx-auto text-[9px] bg-cyan/15 text-cyan border border-cyan/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit">
                    Current Plan
                  </span>
                  <h4 className="font-bold text-sm text-cyan mt-2">PREMIUM</h4>
                  <div className="text-xl font-bold">CHF 9.99 <span className="text-xs text-muted">/ mon</span></div>
                  <p className="text-[10px] text-muted">Unlimited AI Tutor, detailed analytics.</p>
                  <button className="w-full bg-cyan text-bg text-xs font-bold py-2 rounded-lg">Activated &bull; Employer</button>
                </div>

                <div className="bg-bg border border-line p-5 rounded-xl text-center space-y-4">
                  <h4 className="font-bold text-sm text-purple">BUSINESS</h4>
                  <div className="text-xl font-bold">Individ.</div>
                  <p className="text-[10px] text-muted">For companies & teams, enterprise licenses.</p>
                  <button className="w-full border border-line text-xs font-semibold py-2 rounded-lg text-text hover:border-cyan">Contact</button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Appearance & Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between max-w-md p-3.5 bg-bg border border-line rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs">Display Mode</h4>
                    <p className="text-[10px] text-muted mt-0.5">Switch between light and dark theme.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-colors"
                  >
                    {theme === 'dark' ? 'Dark mode active' : 'Light mode active'}
                  </button>
                </div>

                <div className="flex items-center justify-between max-w-md p-3.5 bg-bg border border-line rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs">Sound Effects</h4>
                    <p className="text-[10px] text-muted mt-0.5">Play sounds on XP gain and completions.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 text-cyan accent-cyan focus:ring-cyan rounded"
                  />
                </div>

                <div className="flex items-center justify-between max-w-md p-3.5 bg-bg border border-line rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs">Default Video Speed</h4>
                    <p className="text-[10px] text-muted mt-0.5">Choose your preferred playback speed.</p>
                  </div>
                  <select 
                    value={videoSpeed} 
                    onChange={(e) => setVideoSpeed(e.target.value)}
                    className="bg-panel border border-line text-xs rounded-lg px-2 py-1 text-text focus:outline-none"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
