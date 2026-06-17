import React, { useState } from 'react';
import { useXP } from '../../context/XPContext';
import { Calendar, Users, Sparkles } from 'lucide-react';

interface LiveSessionProps {
  onNavigate?: (page: string) => void;
}

export const LiveSession: React.FC<LiveSessionProps> = () => {
  const { addXp, addToast } = useXP();
  const [sessionState, setSessionState] = useState<'pre' | 'live' | 'post'>('pre');
  const [trainerInput, setTrainerInput] = useState('');

  const joinLiveCall = () => {
    setSessionState('live');
    addXp(25, 'Live-Session beigetreten');
    addToast('success', 'Verbindung zum Live-Server hergestellt.');
  };

  const endLiveCall = () => {
    setSessionState('post');
    addXp(50, 'Live-Session erfolgreich beendet');
    addToast('success', '+50 XP — Live-Session abgeschlossen!');
  };

  const handleMessageTrainer = () => {
    if (!trainerInput.trim()) return;
    addToast('success', 'Nachricht erfolgreich an Trainer übermittelt!');
    setTrainerInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Live-Session (Synchrones Lernen)</h1>
        <p className="text-muted text-sm mt-1">Nimm an geplanten Meetings teil und tausche dich mit Dozenten aus.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Conference Block */}
        <div className="lg:col-span-2 space-y-6">
          
          {sessionState === 'pre' && (
            <div className="bg-panel border border-line rounded-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-purple/15 text-purple rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-text">Python Bootcamp - Day 1 Morning</h2>
                <p className="text-muted text-xs">
                  Dieses Meeting startet in Kürze. Bitte bereite dein Setup und Fragen vor.
                </p>
                <div className="text-2xl font-bold text-cyan mt-3">Start in: 04:32 Min</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
                <button 
                  onClick={joinLiveCall}
                  className="flex-1 bg-cyan hover:bg-cyan2 text-bg font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Sitzung betreten
                </button>
              </div>
            </div>
          )}

          {sessionState === 'live' && (
            <div className="bg-panel border border-line rounded-2xl overflow-hidden flex flex-col h-[480px]">
              <div className="bg-bg border-b border-line px-4 py-3 flex items-center justify-between text-xs font-semibold text-text">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
                  <span>LIVE • Whereby Videointegration</span>
                </div>
                <span>Zeit abgelaufen: 45:12</span>
              </div>
              
              {/* Simulated Conference Video Screen */}
              <div className="flex-1 bg-[#12161a] relative flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                  <Users className="w-16 h-16 text-muted/50 mx-auto" />
                  <div>
                    <h3 className="font-bold text-sm text-text">David Pinezich präsentiert:</h3>
                    <p className="text-xs text-muted">"Debugging und modularer Aufbau in venv Umgebungen"</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg border-t border-line px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-muted">Teilnehmer: 6 Studierende</span>
                <button 
                  onClick={endLiveCall}
                  className="bg-red hover:bg-red/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Sitzung verlassen
                </button>
              </div>
            </div>
          )}

          {sessionState === 'post' && (
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-text">Sitzung beendet! 🎉</h2>
              <p className="text-muted text-xs">
                Die Aufzeichnung und die Zusammenfassungen dieser Live-Sitzung sind in Kürze verfügbar.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg border border-line p-4 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-purple flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>KI-Zusammenfassung</span>
                  </div>
                  <p className="text-muted">
                    In dieser Session wurden setupbezogene Probleme mit Powershell-Execution-Policies behoben und die Wichtigkeit virtueller Umgebungen vertieft.
                  </p>
                </div>

                <div className="bg-bg border border-line p-4 rounded-xl space-y-3 text-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-text">Unterlagen & Links</h4>
                    <p className="text-muted mt-1">Hier findest du die genutzten Präsentationen.</p>
                  </div>
                  <button className="bg-panel hover:bg-line border border-line py-2 rounded-lg font-bold text-[10px] uppercase">Download Slides</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Trainer Asynchronous Communication */}
        <div className="space-y-6">
          <div className="bg-panel border border-line rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Fragen an Trainer</h3>
            <p className="text-muted text-xs leading-relaxed">
              Für blockierende Fragen außerhalb von Live-Sitzungen kannst du David eine Direktnachricht schicken.
            </p>
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] text-muted font-bold uppercase">Deine Nachricht</label>
              <textarea 
                value={trainerInput}
                onChange={(e) => setTrainerInput(e.target.value)}
                placeholder="Hallo David, ich hänge bei Übung 3..."
                className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan h-24 resize-none"
              />
            </div>
            <button 
              onClick={handleMessageTrainer}
              className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Absenden
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
