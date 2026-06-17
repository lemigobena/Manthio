import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Shield, CreditCard, Sliders } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
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
      user.name = name;
      user.bio = bio;
      localStorage.setItem('user', JSON.stringify(user));
      addToast('success', 'Profil erfolgreich gespeichert.');
    }
  };

  const handleExportData = () => {
    addToast('success', 'Datenauszug (JSON) wird generiert. Du erhältst in Kürze eine E-Mail.');
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Möchtest du dein Konto wirklich dauerhaft löschen? Diese Aktion wird nach 30 Tagen unwiderruflich ausgeführt.');
    if (confirm) {
      addToast('info', 'Kontolöschung angefordert. 30 Tage Kulanzfrist läuft.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Einstellungen</h1>
        <p className="text-muted text-sm mt-1">Verwalte deine Kontodaten, Abonnements und Benachrichtigungen.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Sub Tabs */}
        <div className="w-full lg:w-60 bg-panel border border-line p-2 rounded-2xl shrink-0 h-fit space-y-1">
          <button 
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'profile' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <User className="w-4 h-4" />
            <span>Öffentliches Profil</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('account')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'account' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <Shield className="w-4 h-4" />
            <span>Konto & Sicherheit</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('billing')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'billing' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Abonnements & Preise</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('preferences')}
            className={`w-full flex items-center space-x-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer ${activeSubTab === 'preferences' ? 'bg-cyan/10 text-cyan' : 'text-muted hover:text-text hover:bg-bg/40'}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Darstellung & Präferenzen</span>
          </button>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="flex-1 bg-panel border border-line rounded-2xl p-6">
          
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Öffentliches Profil</h2>
              
              <div className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-muted font-bold uppercase">Name (Wird auf Zertifikaten verwendet)</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-cyan max-w-md"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-muted font-bold uppercase">Biografie</label>
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
                ÄNDERUNGEN SPEICHERN
              </button>
            </div>
          )}

          {activeSubTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Konto & Datensicherheit</h2>
              <p className="text-muted text-xs leading-relaxed max-w-md">
                Gemäß EU-DSGVO und Schweizer DSG hast du jederzeit das Recht auf Auskunft über deine gespeicherten Aktivitätsdaten.
              </p>
              
              <div className="pt-4 border-t border-line space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-bg rounded-xl border border-line max-w-md">
                  <div>
                    <h4 className="font-bold text-xs">Datenauszug anfordern</h4>
                    <p className="text-[10px] text-muted mt-0.5">Erhalte alle Lernprotokolle und Chatverläufe als JSON-Archiv.</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="bg-panel border border-line hover:border-cyan text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors"
                  >
                    Export anfordern
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red/5 border border-red/20 rounded-xl max-w-md">
                  <div>
                    <h4 className="font-bold text-xs text-red">Konto löschen</h4>
                    <p className="text-[10px] text-muted mt-0.5">Lösche alle Daten unwiderruflich nach einer Kulanzfrist von 30 Tagen.</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="bg-red hover:bg-red/90 text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    Konto löschen
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Abonnements & Preise</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-bg border border-line p-5 rounded-xl text-center space-y-4">
                  <h4 className="font-bold text-sm text-muted">BASIS</h4>
                  <div className="text-xl font-bold">Gratis</div>
                  <p className="text-[10px] text-muted">Essenzielle Werkzeuge, limitierter KI-Tutor.</p>
                  <button className="w-full border border-line text-xs font-semibold py-2 rounded-lg text-muted cursor-not-allowed">Aktiv</button>
                </div>
                
                <div className="bg-bg border border-cyan p-5 rounded-xl text-center space-y-4 relative">
                  <span className="absolute top-2 inset-x-0 mx-auto text-[9px] bg-cyan/15 text-cyan border border-cyan/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit">
                    Aktueller Plan
                  </span>
                  <h4 className="font-bold text-sm text-cyan mt-2">PREMIUM</h4>
                  <div className="text-xl font-bold">CHF 9.99 <span className="text-xs text-muted">/ Mon</span></div>
                  <p className="text-[10px] text-muted">Unbegrenzter KI-Tutor, detaillierte Analytics.</p>
                  <button className="w-full bg-cyan text-bg text-xs font-bold py-2 rounded-lg">Aktiviert &bull; Arbeitgeber</button>
                </div>

                <div className="bg-bg border border-line p-5 rounded-xl text-center space-y-4">
                  <h4 className="font-bold text-sm text-purple">BUSINESS</h4>
                  <div className="text-xl font-bold">Individ.</div>
                  <p className="text-[10px] text-muted">Für Firmen & Teams, Enterprise-Lizenzen.</p>
                  <button className="w-full border border-line text-xs font-semibold py-2 rounded-lg text-text hover:border-cyan">Kontakt</button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text">Darstellung & Präferenzen</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between max-w-md p-3.5 bg-bg border border-line rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs">Anzeigemodus</h4>
                    <p className="text-[10px] text-muted mt-0.5">Umschalten zwischen Hellem und Dunklem Thema.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="bg-cyan hover:bg-cyan2 text-bg text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-colors"
                  >
                    {theme === 'dark' ? 'Dark-Modus aktiv' : 'Light-Modus aktiv'}
                  </button>
                </div>

                <div className="flex items-center justify-between max-w-md p-3.5 bg-bg border border-line rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs">Soundeffekte</h4>
                    <p className="text-[10px] text-muted mt-0.5">Töne bei XP-Gewinn und Abschlüssen abspielen.</p>
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
                    <h4 className="font-bold text-xs">Standard Videogeschwindigkeit</h4>
                    <p className="text-[10px] text-muted mt-0.5">Wähle deine bevorzugte Wiedergabegeschwindigkeit.</p>
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
