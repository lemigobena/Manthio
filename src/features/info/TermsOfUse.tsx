import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfUseProps {
  onNavigate: (page: string) => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ onNavigate }) => {
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
          <h2 className="text-2xl font-black tracking-tight text-text">Terms of Use</h2>
          <p className="text-[10px] text-muted uppercase tracking-widest mt-1">Last Updated: June 18, 2026</p>
        </div>

        <div className="text-xs text-muted leading-relaxed space-y-4 max-w-3xl border-t border-line/30 pt-6">
          <p>
            Welcome to Manthio. By accessing or using our website, courses, and integrated e-learning services, you agree to comply with and be bound by the following terms.
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">1. Acceptable Use</h3>
            <p>
              You agree to use the workspace exclusively for personal educational purposes. You may not distribute, reproduce, or resell course slides, templates, datasets, or video resources without express written permission from apigenio GmbH.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">2. Account Responsibility</h3>
            <p>
              You are responsible for keeping your credentials confidential. You agree to notify us immediately of any unauthorized access. Accounts sharing learning materials with external users are subject to suspension.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">3. AI Tutor Fair Use Policy</h3>
            <p>
              Our AI Tutor system is provided for real-time guidance and grading feedback. Automated spamming of the tutor interface with irrelevant text or programmatic scripts is prohibited to maintain server response times.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">4. Liability Limitation</h3>
            <p>
              Manthio represents professional training guidelines. We make no guarantees about specific job placements or certification conversions. Manthio is not liable for errors or database downtime beyond our control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
