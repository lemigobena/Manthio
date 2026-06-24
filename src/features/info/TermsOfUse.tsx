import React, { useState } from 'react';

interface TermsOfUseProps {
  onNavigate: (page: string) => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = () => {
  const [activeSection, setActiveSection] = useState('welcome');

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  const SECTIONS = [
    { id: 'welcome', label: 'Welcome to Manthio' },
    { id: 'acceptable-use', label: 'Acceptable Use' },
    { id: 'account-responsibility', label: 'Account Responsibility' },
    { id: 'ai-tutor', label: 'AI Tutor Fair Use Policy' },
    { id: 'liability', label: 'Liability Limitation' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-8 md:pt-16">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-text font-display">
          Terms of <span className="text-cyan">Use</span>
        </h1>
        <p className="text-sm text-muted uppercase tracking-widest">Last Updated: June 18, 2026</p>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24 relative">
        {/* Sidebar TOC */}
        <div className="md:w-64 shrink-0">
          <div className="sticky top-24 flex flex-col">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`text-left px-4 py-3 text-sm font-semibold transition-all border-l-2 ${
                  activeSection === s.id 
                    ? 'border-cyan text-cyan' 
                    : 'border-line text-muted hover:text-text hover:border-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-16">
          <div id="welcome" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Welcome to Manthio</h3>
            <p className="text-sm text-muted leading-relaxed">
              By accessing or using our website, courses, and integrated e-learning services, you agree to comply with and be bound by the following terms.
            </p>
          </div>

          <div id="acceptable-use" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Acceptable Use</h3>
            <p className="text-sm text-muted leading-relaxed">
              You agree to use the workspace exclusively for personal educational purposes. You may not distribute, reproduce, or resell course slides, templates, datasets, or video resources without express written permission from apigenio GmbH.
            </p>
          </div>

          <div id="account-responsibility" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Account Responsibility</h3>
            <p className="text-sm text-muted leading-relaxed">
              You are responsible for keeping your credentials confidential. You agree to notify us immediately of any unauthorized access. Accounts sharing learning materials with external users are subject to suspension.
            </p>
          </div>

          <div id="ai-tutor" className="space-y-4">
            <h3 className="text-xl font-bold text-text">AI Tutor Fair Use Policy</h3>
            <p className="text-sm text-muted leading-relaxed">
              Our AI Tutor system is provided for real-time guidance and grading feedback. Automated spamming of the tutor interface with irrelevant text or programmatic scripts is prohibited to maintain server response times.
            </p>
          </div>

          <div id="liability" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Liability Limitation</h3>
            <p className="text-sm text-muted leading-relaxed">
              Manthio represents professional training guidelines. We make no guarantees about specific job placements or certification conversions. Manthio is not liable for errors or database downtime beyond our control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
