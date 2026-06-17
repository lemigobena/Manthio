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
    addXp(25, 'Joined live session');
    addToast('success', 'Connected to live server.');
  };

  const endLiveCall = () => {
    setSessionState('post');
    addXp(50, 'Live session ended successfully');
    addToast('success', '+50 XP — Live session completed!');
  };

  const handleMessageTrainer = () => {
    if (!trainerInput.trim()) return;
    addToast('success', 'Message successfully sent to trainer!');
    setTrainerInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Live Session (Synchronous Learning)</h1>
        <p className="text-muted text-sm mt-1">Participate in scheduled meetings and interact with instructors.</p>
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
                  This meeting will start shortly. Please prepare your setup and questions.
                </p>
                <div className="text-2xl font-bold text-cyan mt-3">Starts in: 04:32 Min</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
                <button 
                  onClick={joinLiveCall}
                  className="flex-1 bg-cyan hover:bg-cyan2 text-bg font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Join Session
                </button>
              </div>
            </div>
          )}

          {sessionState === 'live' && (
            <div className="bg-panel border border-line rounded-2xl overflow-hidden flex flex-col h-[480px]">
              <div className="bg-bg border-b border-line px-4 py-3 flex items-center justify-between text-xs font-semibold text-text">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
                  <span>LIVE • Whereby Video Integration</span>
                </div>
                <span>Time elapsed: 45:12</span>
              </div>
              
              {/* Simulated Conference Video Screen */}
              <div className="flex-1 bg-[#12161a] relative flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                  <Users className="w-16 h-16 text-muted/50 mx-auto" />
                  <div>
                    <h3 className="font-bold text-sm text-text">David Pinezich presents:</h3>
                    <p className="text-xs text-muted">"Debugging and modular structure in venv environments"</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg border-t border-line px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-muted">Participants: 6 students</span>
                <button 
                  onClick={endLiveCall}
                  className="bg-red hover:bg-red/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Leave Session
                </button>
              </div>
            </div>
          )}

          {sessionState === 'post' && (
            <div className="bg-panel border border-line rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-text">Session ended! 🎉</h2>
              <p className="text-muted text-xs">
                The recording and summaries of this live session will be available shortly.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg border border-line p-4 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-purple flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Summary</span>
                  </div>
                  <p className="text-muted">
                    In this session, setup-related issues with Powershell Execution Policies were resolved and the importance of virtual environments was deepened.
                  </p>
                </div>

                <div className="bg-bg border border-line p-4 rounded-xl space-y-3 text-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-text">Documents & Links</h4>
                    <p className="text-muted mt-1">Here you can find the presentations used.</p>
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
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Questions to Trainer</h3>
            <p className="text-muted text-xs leading-relaxed">
              For blocking questions outside of live sessions, you can send David a direct message.
            </p>
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] text-muted font-bold uppercase">Your Message</label>
              <textarea 
                value={trainerInput}
                onChange={(e) => setTrainerInput(e.target.value)}
                placeholder="Hi David, I'm stuck on Exercise 3..."
                className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-text focus:outline-none focus:border-cyan h-24 resize-none"
              />
            </div>
            <button 
              onClick={handleMessageTrainer}
              className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
