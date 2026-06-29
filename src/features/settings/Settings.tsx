import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Shield, CreditCard, Sliders, Lock, ChevronDown, ChevronUp, Download, Trash2, Mail, Key, ShieldCheck, Link as LinkIcon, AlertCircle, User, Phone, MapPin } from 'lucide-react';
import type { NotificationPreferences, NotificationCategory } from '../../types';

type TabType = 'account' | 'billing' | 'preferences' | 'privacy';

interface SettingsProps {
  initialTab?: TabType;
  onNavigate?: (page: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ initialTab = 'account', onNavigate }) => {
  const { user, is2FAEnabled, setIs2FAEnabled } = useAuth();
  const { addToast } = useXP();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<TabType | null>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Modals state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalTarget, setPasswordModalTarget] = useState<'email' | 'password' | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalTarget, setConfirmModalTarget] = useState<'delete' | 'cancel_sub' | null>(null);

  // Preferences state
  const { preferences, updatePreferences } = useNotifications();
  const [language, setLanguage] = useState('EN');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState('1');
  const [aiMode, setAiMode] = useState('auto');

  // Privacy state
  const [dataAnonymisation, setDataAnonymisation] = useState(true);
  const [aiMemory, setAiMemory] = useState(true);

  // Auto-select tab when widening to desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setActiveTab(prev => prev === null ? 'account' : prev);
      }
    };

    handleResize(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleResize);
    } else {
      mediaQuery.addListener(handleResize);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleResize);
      } else {
        mediaQuery.removeListener(handleResize);
      }
    };
  }, []);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);

  // Helper for auto-save feedback
  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(value);
    addToast('success', 'Preference saved automatically.');
  };

  const handleSelect = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    addToast('success', 'Preference saved automatically.');
  };

  const handleDataExport = () => {
    addToast('success', 'Data export started. You will receive an email within 24 hours with your JSON archive.');
  };

  const openPasswordModal = (target: 'email' | 'password') => {
    setPasswordModalTarget(target);
    setPasswordModalOpen(true);
  };

  const openConfirmModal = (target: 'delete' | 'cancel_sub') => {
    setConfirmModalTarget(target);
    setConfirmModalOpen(true);
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account & Security', icon: Shield },
    { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
    { id: 'preferences', label: 'Appearance & Preferences', icon: Sliders },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account data, subscriptions, preferences, and privacy.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-panel border border-line p-2 rounded-2xl shrink-0 h-fit space-y-1">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${activeTab === tab.id ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area (Mobile Accordion / Desktop Pane) */}
        <div className="flex-1 space-y-4 lg:space-y-0">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="block lg:contents bg-panel lg:bg-transparent border border-line lg:border-none rounded-2xl lg:rounded-none overflow-hidden mb-4 lg:mb-0">
                {/* Mobile Accordion Header */}
                <button
                  onClick={() => setActiveTab(isActive ? null : tab.id)}
                  className={`lg:hidden w-full flex items-center justify-between p-4 transition-colors ${isActive ? 'bg-cyan/5 border-b border-line' : ''}`}
                >
                  <div className={`flex items-center space-x-3 ${isActive ? 'text-cyan' : 'text-text'}`}>
                    <tab.icon className="w-5 h-5" />
                    <span className="font-bold">{tab.label}</span>
                  </div>
                  {isActive ? <ChevronUp size={20} className="text-cyan" /> : <ChevronDown size={20} className="text-muted" />}
                </button>

                {/* Content Pane */}
                <div className={`lg:bg-panel lg:border lg:border-line lg:rounded-2xl p-4 sm:p-6 lg:p-8 bg-bg/20 ${isActive ? 'block' : 'hidden'}`}>
                  {isActive && tab.id === 'account' && (
                    <AccountTab 
                      user={user!} 
                      is2FAEnabled={is2FAEnabled}
                      setIs2FAEnabled={setIs2FAEnabled}
                      onEditEmail={() => openPasswordModal('email')}
                      onEditPassword={() => openPasswordModal('password')}
                      onExport={handleDataExport}
                      onDelete={() => openConfirmModal('delete')}
                      onRestartOnboarding={() => onNavigate?.('onboarding')}
                    />
                  )}
                  {isActive && tab.id === 'billing' && (
                    <BillingTab onCancelSub={() => openConfirmModal('cancel_sub')} />
                  )}
                  {isActive && tab.id === 'preferences' && (
                    <PreferencesTab 
                      themeMode={theme} setThemeMode={(v) => setTheme(v as 'light' | 'dark' | 'system')}
                      language={language} setLanguage={(v) => handleSelect(setLanguage, v)}
                      preferences={preferences} updatePreferences={updatePreferences}
                      reducedMotion={reducedMotion} setReducedMotion={(v) => handleToggle(setReducedMotion, v)}
                      soundEnabled={soundEnabled} setSoundEnabled={(v) => handleToggle(setSoundEnabled, v)}
                      videoSpeed={videoSpeed} setVideoSpeed={(v) => handleSelect(setVideoSpeed, v)}
                      aiMode={aiMode} setAiMode={(v) => handleSelect(setAiMode, v)}
                    />
                  )}
                  {isActive && tab.id === 'privacy' && (
                    <PrivacyTab 
                      dataAnonymisation={dataAnonymisation} setDataAnonymisation={(v) => handleToggle(setDataAnonymisation, v)}
                      aiMemory={aiMemory} setAiMemory={(v) => handleToggle(setAiMemory, v)}
                      marketingOptIn={marketingOptIn} setMarketingOptIn={(v) => handleToggle(setMarketingOptIn, v)}
                      analyticsOptIn={analyticsOptIn} setAnalyticsOptIn={(v) => handleToggle(setAnalyticsOptIn, v)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {passwordModalOpen && (
        <PasswordConfirmModal 
          target={passwordModalTarget!} 
          onClose={() => setPasswordModalOpen(false)} 
          onConfirm={() => {
            addToast('success', `${passwordModalTarget === 'email' ? 'Email' : 'Password'} updated successfully.`);
            setPasswordModalOpen(false);
          }}
        />
      )}

      {confirmModalOpen && (
        <TypedConfirmModal 
          target={confirmModalTarget!} 
          onClose={() => setConfirmModalOpen(false)} 
          onConfirm={() => {
            if (confirmModalTarget === 'delete') {
              addToast('info', 'Account deletion requested. 30-day grace period started.');
            } else {
              addToast('info', 'Subscription cancelled.');
            }
            setConfirmModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

/* ─── Tabs Components ────────────────────────────────────────────────────── */

interface AccountTabProps {
  user: { name?: string; email?: string };
  is2FAEnabled: boolean;
  setIs2FAEnabled: (enabled: boolean) => void;
  onEditEmail: () => void;
  onEditPassword: () => void;
  onExport: () => void;
  onDelete: () => void;
  onRestartOnboarding: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({ user, is2FAEnabled, setIs2FAEnabled, onEditEmail, onEditPassword, onExport, onDelete, onRestartOnboarding }) => {
  const { addToast } = useXP();
  const [isSetup2FA, setIsSetup2FA] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');
  return (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div>
      <h2 className="text-xl font-bold text-text">Account & Security</h2>
      <p className="text-muted text-sm mt-1">Manage your credentials and security settings.</p>
    </div>

    <div className="space-y-4">
      {/* Email */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
            <Mail className="text-cyan" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-text">Email address</h4>
            <p className="text-xs text-muted mt-0.5">{user.email} (change requires re-verification)</p>
          </div>
        </div>
        <button onClick={onEditEmail} className="px-4 py-2 bg-panel border border-line hover:border-cyan hover:text-cyan rounded-lg text-xs font-bold transition-colors">Change</button>
      </div>

      {/* Password */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
            <Key className="text-purple" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-text">Password change</h4>
            <p className="text-xs text-muted mt-0.5">Last changed 3 months ago</p>
          </div>
        </div>
        <button onClick={onEditPassword} className="px-4 py-2 bg-panel border border-line hover:border-purple hover:text-purple rounded-lg text-xs font-bold transition-colors">Change</button>
      </div>

      {/* 2FA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
            <ShieldCheck className="text-green" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-text">Two-factor authentication</h4>
            <p className="text-xs text-muted mt-0.5">
              {is2FAEnabled ? 'Active. Extra layer of security added.' : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>
        
        {isSetup2FA ? (
          <div className="flex flex-col gap-2 p-3 bg-panel rounded-xl border border-line w-full max-w-sm">
            <div className="bg-white w-24 h-24 mx-auto rounded-lg flex items-center justify-center">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example" alt="QR Code" className="w-20 h-20" />
            </div>
            <p className="text-xs text-center text-muted">Scan with Google Authenticator or Authy</p>
            <input 
              type="text" 
              placeholder="6-digit code" 
              className="bg-bg border border-line rounded-lg px-3 py-2 text-sm text-center tracking-[0.5em] font-bold" 
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={() => setIsSetup2FA(false)} className="flex-1 py-2 text-xs font-bold text-muted hover:text-text transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  setIs2FAEnabled(true);
                  setIsSetup2FA(false);
                  addToast('success', 'Two-Factor Authentication enabled.');
                }}
                disabled={twoFaCode.length !== 6}
                className="flex-1 py-2 bg-cyan text-bg hover:bg-cyan2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                Verify & Enable
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => {
              if (is2FAEnabled) {
                setIs2FAEnabled(false);
                addToast('success', 'Two-Factor Authentication disabled.');
              } else {
                setIsSetup2FA(true);
              }
            }} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${is2FAEnabled ? 'bg-red/10 text-red hover:bg-red/20' : 'bg-cyan text-bg hover:bg-cyan2'}`}
          >
            {is2FAEnabled ? 'Disable 2FA' : 'Setup 2FA'}
          </button>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
            <LinkIcon className="text-muted" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-text">Connected accounts (Google, Microsoft, etc.)</h4>
            <p className="text-xs text-muted mt-0.5">Link external providers for quick login</p>
          </div>
        </div>
        <button onClick={() => addToast('success', 'Redirecting to OAuth provider management...')} className="px-4 py-2 bg-panel border border-line hover:border-cyan rounded-lg text-xs font-bold transition-colors">Manage</button>
      </div>
    </div>

    {/* Personal Information */}
    <div className="pt-6 border-t border-line space-y-4">
      <div>
        <h3 className="font-bold text-text">Personal Information</h3>
        <p className="text-muted text-sm mt-1">Used for billing, invoicing, and certificate generation.</p>
      </div>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
              <User className="text-cyan" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text">Legal Full Name</h4>
              <p className="text-xs text-muted mt-0.5">{user.name}</p>
            </div>
          </div>
          <button onClick={() => addToast('success', 'Opening name editor...')} className="px-4 py-2 bg-panel border border-line hover:border-cyan hover:text-cyan rounded-lg text-xs font-bold transition-colors">Edit</button>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
              <Phone className="text-purple" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text">Phone Number</h4>
              <p className="text-xs text-muted mt-0.5">+41 79 123 45 67</p>
            </div>
          </div>
          <button onClick={() => addToast('success', 'Opening phone number editor...')} className="px-4 py-2 bg-panel border border-line hover:border-purple hover:text-purple rounded-lg text-xs font-bold transition-colors">Edit</button>
        </div>

        {/* Address */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center shrink-0">
              <MapPin className="text-green" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text">Billing & Mailing Address</h4>
              <p className="text-xs text-muted mt-0.5">Musterstrasse 1, PO Box 123, 8000 Zürich, Switzerland</p>
            </div>
          </div>
          <button onClick={() => addToast('success', 'Opening address editor...')} className="px-4 py-2 bg-panel border border-line hover:border-green hover:text-green rounded-lg text-xs font-bold transition-colors">Edit</button>
        </div>
      </div>
    </div>

    {/* Account Setup */}
    <div className="pt-6 border-t border-line space-y-4">
      <h3 className="font-bold text-text">Account Setup</h3>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
        <div>
          <h4 className="font-bold text-sm text-text">Repeat onboarding</h4>
          <p className="text-xs text-muted mt-0.5">Revisit the initial setup process to configure your goals and interests.</p>
        </div>
        <button onClick={onRestartOnboarding} className="px-4 py-2 bg-panel border border-line hover:border-cyan hover:text-cyan rounded-lg text-xs font-bold transition-colors shrink-0">
          Start Onboarding
        </button>
      </div>
    </div>

    {/* Data & Deletion */}
    <div className="pt-6 border-t border-line space-y-4">
      <h3 className="font-bold text-text">Data & Privacy Control</h3>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg border border-line rounded-xl gap-4">
        <div>
          <h4 className="font-bold text-sm text-text">Data export</h4>
          <p className="text-xs text-muted mt-0.5">Download all your data as JSON.</p>
        </div>
        <button onClick={onExport} className="flex items-center space-x-2 px-4 py-2 bg-panel border border-line hover:border-cyan rounded-lg text-xs font-bold transition-colors shrink-0">
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red/5 border border-red/20 rounded-xl gap-4">
        <div>
          <h4 className="font-bold text-sm text-red">Delete account</h4>
          <p className="text-xs text-red/70 mt-0.5">Permanently delete your account (with grace period).</p>
        </div>
        <button onClick={onDelete} className="flex items-center space-x-2 px-4 py-2 bg-red hover:bg-red/90 text-white rounded-lg text-xs font-bold transition-colors shrink-0">
          <Trash2 size={14} />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  </div>
  );
};

interface BillingTabProps {
  onCancelSub: () => void;
}

const BillingTab: React.FC<BillingTabProps> = ({ onCancelSub }) => {
  const { addToast } = useXP();
  return (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div>
      <h2 className="text-xl font-bold text-text">Subscription and Billing</h2>
      <p className="text-muted text-sm mt-1">Manage your current plan and payment methods.</p>
    </div>

    {/* Plans Overview */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-bg border border-line p-5 rounded-xl text-center space-y-4">
        <h4 className="font-bold text-sm text-muted">BASIC</h4>
        <div className="text-2xl font-black text-text">Free</div>
        <p className="text-xs text-muted h-10">Essential tools, limited AI Tutor.</p>
        <button className="w-full border border-line text-xs font-bold py-2.5 rounded-lg text-muted cursor-not-allowed">Included</button>
      </div>
      
      <div className="bg-cyan/5 border border-cyan p-5 rounded-xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-cyan text-bg text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">Current</div>
        <h4 className="font-bold text-sm text-cyan mt-2">PREMIUM</h4>
        <div className="text-2xl font-black text-text">CHF 9.99 <span className="text-xs font-normal text-muted">/mo</span></div>
        <p className="text-xs text-text h-10">Unlimited AI Tutor, detailed analytics.</p>
        <button onClick={() => addToast('success', 'Opening billing portal...')} className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-lg transition-colors">Manage Plan</button>
      </div>

      <div className="bg-bg border border-line p-5 rounded-xl text-center space-y-4">
        <h4 className="font-bold text-sm text-purple">BUSINESS</h4>
        <div className="text-2xl font-black text-text">Custom</div>
        <p className="text-xs text-muted h-10">For companies & enterprise teams.</p>
        <button onClick={() => addToast('success', 'Redirecting to upgrade options...')} className="w-full border border-line hover:border-purple hover:text-purple text-xs font-bold py-2.5 rounded-lg text-text transition-colors">Upgrade</button>
      </div>
    </div>
    <div className="flex justify-end -mt-2">
      <button onClick={() => addToast('success', 'Opening plan comparison...')} className="text-cyan text-xs font-bold hover:underline">View Plan comparison and upgrade path</button>
    </div>

    {/* Course-Bundled Subscriptions */}
    <div className="pt-6 border-t border-line space-y-4">
      <h3 className="font-bold text-text">Course-bundled subscriptions</h3>
      <div className="p-4 bg-bg border border-line rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-text">Premium (2 Months)</span>
              <span className="bg-cyan/20 text-cyan text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active</span>
            </div>
            <p className="text-xs text-muted mt-1">Included with <span className="text-text font-semibold">Python Bootcamp</span> enrollment.</p>
          </div>
          <div className="text-right text-xs">
            <div className="text-muted">Activated: <span className="text-text">Jun 14, 2026</span></div>
            <div className="text-muted mt-0.5">Expires: <span className="text-text">Aug 14, 2026</span></div>
          </div>
        </div>
      </div>
    </div>

    {/* Payment & Invoices */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-line">
      <div className="space-y-4">
        <h3 className="font-bold text-text">Payment methods management</h3>
        <div className="p-4 bg-bg border border-line rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-panel border border-line rounded flex items-center justify-center">
              <span className="text-xs font-black italic">VISA</span>
            </div>
            <div>
              <div className="font-bold text-sm text-text">•••• •••• •••• 4242</div>
              <div className="text-[10px] text-muted">Expires 12/28</div>
            </div>
          </div>
          <button onClick={() => addToast('success', 'Opening payment method editor...')} className="text-cyan text-xs font-bold hover:underline">Edit</button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-text">Invoice/receipt history with download</h3>
        <div className="bg-bg border border-line rounded-xl divide-y divide-line">
          {[
            { date: 'Jun 14, 2026', desc: 'Python Bootcamp Bundle', amount: 'CHF 1,000.00' },
            { date: 'May 01, 2026', desc: 'Premium Subscription', amount: 'CHF 9.99' }
          ].map((inv, i) => (
            <div key={i} className="p-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-text">{inv.desc}</div>
                <div className="text-muted">{inv.date}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-bold">{inv.amount}</span>
                <button onClick={() => addToast('success', 'Downloading PDF invoice...')} className="text-cyan hover:underline">PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="pt-6 flex justify-end">
      <button onClick={onCancelSub} className="text-red text-xs font-bold hover:underline">Cancel subscription</button>
    </div>
  </div>
  );
};

interface PreferencesTabProps {
  themeMode: string;
  setThemeMode: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  videoSpeed: string;
  setVideoSpeed: (v: string) => void;
  aiMode: string;
  setAiMode: (v: string) => void;
}

const USFlag = () => (
  <span className="relative w-4 h-3 inline-flex flex-col justify-between bg-white rounded-[2px] overflow-hidden border border-line mr-2 shrink-0">
    <span className="h-[2px] bg-red-500 w-full" />
    <span className="h-[2px] bg-red-500 w-full" />
    <span className="h-[2px] bg-red-500 w-full" />
    <span className="absolute top-0 left-0 w-2 h-1.5 bg-blue-600" />
  </span>
);

const DEFlag = () => (
  <span className="w-4 h-3 inline-flex flex-col rounded-[2px] overflow-hidden border border-line mr-2 shrink-0">
    <span className="h-[4px] bg-black w-full" />
    <span className="h-[4px] bg-red-500 w-full" />
    <span className="h-[4px] bg-yellow-500 w-full" />
  </span>
);

const PreferencesTab: React.FC<PreferencesTabProps> = ({ themeMode, setThemeMode, language, setLanguage, preferences, updatePreferences, reducedMotion, setReducedMotion, soundEnabled, setSoundEnabled, videoSpeed, setVideoSpeed, aiMode, setAiMode }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div>
      <h2 className="text-xl font-bold text-text">Preferences</h2>
      <p className="text-muted text-sm mt-1">Customize your learning experience and interface.</p>
    </div>

    <div className="space-y-6">
      {/* UI & Language */}
      <div className="space-y-4">
        <h3 className="font-bold text-text text-sm uppercase tracking-wider text-muted">Display & Language</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="p-4 bg-bg border border-line rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-text">Theme</div>
            </div>
            <CustomDropdown 
              value={themeMode} 
              onChange={setThemeMode} 
              options={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' }
              ]} 
            />
          </div>
          <div className="p-4 bg-bg border border-line rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-text">Language</div>
            </div>
            <CustomDropdown 
              value={language} 
              onChange={setLanguage} 
              options={[
                { 
                  label: (
                    <span className="flex items-center">
                      <USFlag />
                      <span>English</span>
                    </span>
                  ), 
                  value: 'EN' 
                },
                { 
                  label: (
                    <span className="flex items-center">
                      <DEFlag />
                      <span>Deutsch</span>
                    </span>
                  ), 
                  value: 'DE' 
                }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="font-bold text-text text-sm uppercase tracking-wider text-muted">Notification Preferences</h3>
        
        <div className="p-4 bg-bg border border-line rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-muted border-b border-line">
                <th className="pb-3 font-semibold">Notification Type</th>
                <th className="pb-3 font-semibold text-center">In-App</th>
                <th className="pb-3 font-semibold text-center">Email</th>
                <th className="pb-3 font-semibold text-center">Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                { key: 'course', label: 'Course Updates', desc: 'Lessons, modules, assignments' },
                { key: 'social', label: 'Social & Community', desc: 'Forum replies, mentions' },
                { key: 'system', label: 'System Alerts', desc: 'Security, billing, account' },
                { key: 'gamification', label: 'Gamification', desc: 'Streaks, badges, milestones' },
                { key: 'marketing', label: 'Marketing', desc: 'Offers and news' }
              ].map((type) => {
                const k = type.key as NotificationCategory;
                return (
                  <tr key={k}>
                    <td className="py-3">
                      <div className="font-bold text-text">{type.label}</div>
                      <div className="text-[10px] text-muted">{type.desc}</div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => updatePreferences({ [k]: { ...preferences[k], inApp: !preferences[k].inApp } })}
                          className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${preferences[k].inApp ? 'bg-cyan' : 'bg-line'}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${preferences[k].inApp ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => updatePreferences({ [k]: { ...preferences[k], email: !preferences[k].email } })}
                          className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${preferences[k].email ? 'bg-cyan' : 'bg-line'}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${preferences[k].email ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => updatePreferences({ [k]: { ...preferences[k], push: !preferences[k].push } })}
                          className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${preferences[k].push ? 'bg-cyan' : 'bg-line'}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${preferences[k].push ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 bg-bg border border-line rounded-xl mt-2">
          <div>
            <div className="font-bold text-sm text-text">Notification Digest</div>
            <div className="text-xs text-muted mt-0.5">How often to receive low-priority alerts via email.</div>
          </div>
          <CustomDropdown 
            value={preferences.digest} 
            onChange={(val) => updatePreferences({ digest: val as 'instant' | 'daily' | 'weekly' })} 
            options={[
              { label: 'Instant', value: 'instant' },
              { label: 'Daily Digest', value: 'daily' },
              { label: 'Weekly Digest', value: 'weekly' }
            ]} 
          />
        </div>
      </div>

      {/* Accessibility & Playback */}
      <div className="space-y-4">
        <h3 className="font-bold text-text text-sm uppercase tracking-wider text-muted">Accessibility & Media</h3>
        <div className="space-y-2">
          <ToggleRow label="Reduced motion" description="Minimize animations and transitions." checked={reducedMotion} onChange={setReducedMotion} />
          <ToggleRow label="Sound effects on/off" description="Play sounds on XP gain and leveling up." checked={soundEnabled} onChange={setSoundEnabled} />
          <div className="flex items-center justify-between p-4 bg-bg border border-line rounded-xl">
            <div>
              <div className="font-bold text-sm text-text">Default video playback speed</div>
              <div className="text-xs text-muted mt-0.5">Initial playback rate for course content.</div>
            </div>
            <CustomDropdown 
              value={videoSpeed} 
              onChange={setVideoSpeed} 
              options={[
                { label: '0.75x', value: '0.75' },
                { label: '1.0x', value: '1' },
                { label: '1.25x', value: '1.25' },
                { label: '1.5x', value: '1.5' },
                { label: '2.0x', value: '2' }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* AI Mode */}
      <div className="space-y-4">
        <h3 className="font-bold text-text text-sm uppercase tracking-wider text-muted">AI Tutor default mode</h3>
        <div className="p-4 bg-bg border border-line rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-text">Inference Mode</div>
            <CustomDropdown 
              value={aiMode} 
              onChange={setAiMode} 
              options={[
                { label: 'Auto', value: 'auto' },
                { label: 'Course docs only', value: 'local' },
                { label: 'Full Cloud AI', value: 'cloud' }
              ]} 
            />
          </div>
          <div className="p-3 bg-panel border border-line rounded-lg text-xs text-muted leading-relaxed">
            <strong className="text-text block mb-1">Cost and privacy trade-offs (see §16.10, §31.5):</strong>
            Auto-routing keeps course-specific questions strictly on our Local AI infrastructure to protect your data and reduce costs. Only complex queries are routed to Cloud LLM providers. Selecting "Course docs only" disables Cloud AI entirely.
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface PrivacyTabProps {
  dataAnonymisation: boolean;
  setDataAnonymisation: (v: boolean) => void;
  aiMemory: boolean;
  setAiMemory: (v: boolean) => void;
  marketingOptIn: boolean;
  setMarketingOptIn: (v: boolean) => void;
  analyticsOptIn: boolean;
  setAnalyticsOptIn: (v: boolean) => void;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ dataAnonymisation, setDataAnonymisation, aiMemory, setAiMemory, marketingOptIn, setMarketingOptIn, analyticsOptIn, setAnalyticsOptIn }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div>
      <h2 className="text-xl font-bold text-text">Privacy</h2>
      <p className="text-muted text-sm mt-1">Control how your data is used and shared.</p>
    </div>

    <div className="space-y-6">
      <div className="space-y-2">
        <ToggleRow 
          label="Data Anonymisation" 
          description="Hide from leaderboards." 
          checked={dataAnonymisation} onChange={setDataAnonymisation} 
        />
        <ToggleRow 
          label="AI Tutor Memory" 
          description="Allow the AI Tutor to remember your previous conversations to provide better context." 
          checked={aiMemory} onChange={setAiMemory} 
        />
        <ToggleRow 
          label="Marketing Communications" 
          description="Receive emails about new courses, features, and special offers." 
          checked={marketingOptIn} onChange={setMarketingOptIn} 
        />
        <ToggleRow 
          label="Analytics & Improvement" 
          description="Allow Manthio to collect usage data to improve the platform." 
          checked={analyticsOptIn} onChange={setAnalyticsOptIn} 
        />
      </div>

      <div className="p-4 bg-purple/5 border border-purple/20 rounded-xl space-y-2">
        <div className="flex items-center space-x-2 text-purple font-bold text-sm">
          <ShieldCheck size={16} />
          <span>Transparency & Compliance</span>
        </div>
        <p className="text-xs text-text/80 leading-relaxed">
          We comply strictly with EU GDPR and Swiss DPA regulations. Your course-document questions stay entirely on the Apigenio infrastructure and are never used to train third-party models. For full details, review our Privacy Policy section §16.10.
        </p>
      </div>
    </div>
  </div>
);

/* ─── UI Helpers ─────────────────────────────────────────────────────────── */

const ToggleRow = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-4 bg-bg border border-line rounded-xl cursor-pointer hover:border-cyan/50 transition-colors" onClick={() => onChange(!checked)}>
    <div className="pr-4">
      <div className="font-bold text-sm text-text">{label}</div>
      <div className="text-xs text-muted mt-0.5">{description}</div>
    </div>
    <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ${checked ? 'bg-cyan' : 'bg-line'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

/* ─── Modals ─────────────────────────────────────────────────────────────── */

interface PasswordConfirmModalProps {
  target: 'email' | 'password';
  onClose: () => void;
  onConfirm: (val: string) => void;
}

const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({ target, onClose, onConfirm }) => {
  const [pass, setPass] = useState('');
  const [newVal, setNewVal] = useState('');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-panel border border-line rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-text">Change {target === 'email' ? 'Email' : 'Password'}</h3>
          <p className="text-xs text-muted mt-1">Please confirm your current password to continue.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Current Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan" autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">New {target === 'email' ? 'Email Address' : 'Password'}</label>
            <input type={target === 'email' ? 'email' : 'password'} value={newVal} onChange={e => setNewVal(e.target.value)} className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan" />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 bg-bg border border-line text-text text-sm font-bold rounded-xl hover:bg-line transition-colors">Cancel</button>
          <button onClick={() => onConfirm(newVal)} disabled={!pass || !newVal} className="flex-1 py-2 bg-cyan text-bg text-sm font-bold rounded-xl hover:bg-cyan2 transition-colors disabled:opacity-50">Confirm</button>
        </div>
      </div>
    </div>
  );
};

interface TypedConfirmModalProps {
  target: 'delete' | 'cancel_sub';
  onClose: () => void;
  onConfirm: () => void;
}

const TypedConfirmModal: React.FC<TypedConfirmModalProps> = ({ target, onClose, onConfirm }) => {
  const [input, setInput] = useState('');
  const expected = target === 'delete' ? 'DELETE ACCOUNT' : 'CANCEL SUBSCRIPTION';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-panel border border-red/30 rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-6">
        <div className="flex items-center space-x-3 text-red">
          <AlertCircle size={24} />
          <h3 className="text-lg font-bold">Are you sure?</h3>
        </div>
        
        <p className="text-sm text-text leading-relaxed">
          This action is destructive and cannot be easily reversed.
          Please type <strong className="bg-bg border border-line px-1 rounded">{expected}</strong> to confirm.
        </p>

        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder={expected}
          className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm outline-none focus:border-red" 
          autoFocus 
        />

        <div className="flex items-center space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 bg-bg border border-line text-text text-sm font-bold rounded-xl hover:bg-line transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={input !== expected} className="flex-1 py-2 bg-red text-white text-sm font-bold rounded-xl hover:bg-red/90 transition-colors disabled:opacity-50">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const CustomDropdown = ({ value, options, onChange }: { value: string, options: {label: React.ReactNode, value: string}[], onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-2 bg-panel border border-line text-sm rounded-lg px-3 py-1.5 outline-none hover:border-cyan min-w-[120px] justify-between"
      >
        <span className="text-text font-medium">{selectedLabel}</span>
        <ChevronDown size={14} className="text-muted ml-2 shrink-0" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-panel border border-line rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${value === opt.value ? 'bg-cyan/10 text-cyan font-bold' : 'text-text hover:bg-bg'}`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-cyan" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
