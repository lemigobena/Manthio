import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

interface OnboardingProps {
  onNavigate: (page: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const { completeOnboarding } = useAuth();
  const { addXp } = useXP();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    completeOnboarding({ reason, timePerWeek: timeCommitment });
    addXp(150, 'Willkommens-Onboarding abgeschlossen');
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-xl mx-auto bg-panel border border-line rounded-2xl p-6 md:p-8 space-y-6 shadow-xl my-12">
      
      {/* Progress header bar */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>Willkommen bei Manthio</span>
        <span>Schritt {step} von 4</span>
      </div>
      <div className="w-full h-1 bg-bg rounded-full overflow-hidden border border-line">
        <div className="h-full bg-cyan transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-cyan/15 border border-cyan/35 rounded-full flex items-center justify-center mx-auto text-cyan">
            <Sparkles className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-text uppercase tracking-tight">Deine Reise beginnt!</h1>
            <p className="text-muted text-xs leading-relaxed max-w-sm mx-auto">
              Manthio verbindet praxisnahe Bootcamp-Curricula mit intelligenter, auf dich zugeschnittener KI-Unterstützung.
            </p>
          </div>
          <button 
            onClick={nextStep}
            className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full flex items-center justify-center space-x-2"
          >
            <span>LOSGEHT\'S</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text">Was führt dich zu uns?</h2>
            <p className="text-muted text-xs">Passe deinen KI-Tutor und deine Ziele an.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted font-bold uppercase">Hauptmotivation</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'career', label: 'Karrierewechsel / Berufliche Weiterbildung' },
                  { id: 'skill', label: 'Eine spezifische Fähigkeit aufbauen' },
                  { id: 'employer', label: 'Zuweisung durch meinen Arbeitgeber' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setReason(opt.label)}
                    className={`text-left p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${reason === opt.label ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/50 text-text'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] text-muted font-bold uppercase">Wöchentliches Zeitbudget</label>
              <div className="grid grid-cols-3 gap-2">
                {['< 2 Std', '2-5 Std', '5-10 Std'].map(time => (
                  <button
                    key={time}
                    onClick={() => setTimeCommitment(time)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${timeCommitment === time ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line hover:border-cyan/50 text-text'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={nextStep}
            disabled={!reason || !timeCommitment}
            className={`font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full flex items-center justify-center space-x-2 ${(!reason || !timeCommitment) ? 'bg-line text-muted cursor-not-allowed' : 'bg-cyan hover:bg-cyan2 text-bg'}`}
          >
            <span>WEITER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text">Dein Avatar</h2>
            <p className="text-muted text-xs">Wähle dein Profilbild aus.</p>
          </div>

          <div className="flex justify-center items-center space-x-4 py-4">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150" 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-2 border-cyan object-cover" 
            />
          </div>

          <button 
            onClick={nextStep}
            className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full flex items-center justify-center space-x-2"
          >
            <span>WEITER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text">Dein erster empfohlener Kurs</h2>
            <p className="text-muted text-xs">Basierend auf deinen Antworten empfehlen wir:</p>
          </div>

          <div className="bg-bg border border-line rounded-xl p-4 flex gap-4">
            <BookOpen className="w-10 h-10 text-cyan shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-text">Python Bootcamp (Flipped)</h3>
              <p className="text-muted text-xs mt-1">Ideal für den Einstieg in die strukturierte Entwicklung mit persönlicher Betreuung.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-line">
            <button 
              onClick={handleFinish}
              className="flex-1 border border-line text-xs font-semibold py-3 rounded-xl text-center hover:border-cyan transition-colors"
            >
              Katalog durchsuchen
            </button>
            <button 
              onClick={handleFinish}
              className="flex-1 bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-3 rounded-xl text-center cursor-pointer"
            >
              Kurs starten (+150 XP)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
