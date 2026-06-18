import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ImprintProps {
  onNavigate: (page: string) => void;
}

export const Imprint: React.FC<ImprintProps> = ({ onNavigate }) => {
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
          <h2 className="text-2xl font-black tracking-tight text-text">Imprint</h2>
          <p className="text-xs text-muted mt-1">Legal notice and corporate registry information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted leading-relaxed border-t border-line/30 pt-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Company Information</h4>
              <p className="font-semibold text-text">apigenio GmbH</p>
              <p>Zurich, Switzerland</p>
              <p>Web: <a href="https://apigenio.ch" target="_blank" rel="noreferrer" className="text-cyan hover:underline">apigenio.ch</a></p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Managing Directors</h4>
              <p className="text-text">David Pinezich</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Contact E-Mail</h4>
              <p className="text-text">info@apigenio.ch</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Corporate Register</h4>
              <p>Register Court: Commercial Register Zurich</p>
              <p>UID / Business ID: <span className="font-mono text-text">CHE-XXX.XXX.XXX</span></p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Disclaimer</h4>
              <p>
                Despite careful review, apigenio GmbH assumes no liability for the content of external links. The operators of linked pages are solely responsible for their content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
