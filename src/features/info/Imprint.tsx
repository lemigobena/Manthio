import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ImprintProps {
  onNavigate: (page: string) => void;
}

export const Imprint: React.FC<ImprintProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 flex flex-col justify-center h-full py-4">
      {/* Back navigation */}
      {isAuthenticated && (
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-1.5 text-xs text-muted hover:text-cyan transition-colors cursor-pointer group mb-8 self-start"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-text font-display">
          Imp<span className="text-cyan">rint</span>
        </h1>
        <p className="text-sm text-muted uppercase tracking-widest">Legal & Registry Info</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted leading-relaxed">
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
            <p className="text-xs">
              Despite careful review, apigenio GmbH assumes no liability for the content of external links. The operators of linked pages are solely responsible for their content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
