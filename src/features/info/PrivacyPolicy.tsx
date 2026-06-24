import React, { useState } from 'react';

interface PrivacyPolicyProps {
  onNavigate: (page: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  const [activeSection, setActiveSection] = useState('welcome');

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  const SECTIONS = [
    { id: 'welcome', label: 'Privacy Commitment' },
    { id: 'information', label: 'Information We Collect' },
    { id: 'usage', label: 'How We Use Your Data' },
    { id: 'cookies', label: 'Cookies and Analytics' },
    { id: 'sharing', label: 'Data Sharing' },
    { id: 'contact', label: 'Contact Information' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-8 md:pt-16">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-text font-display">
          Privacy <span className="text-purple">Policy</span>
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
                    ? 'border-purple text-purple' 
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
            <h3 className="text-xl font-bold text-text">Privacy Commitment</h3>
            <p className="text-sm text-muted leading-relaxed">
              At Manthio, we are committed to protecting the privacy of our learners. This privacy policy explains how we collect, use, and safe-keep your data when using our premium e-learning platform.
            </p>
          </div>

          <div id="information" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Information We Collect</h3>
            <p className="text-sm text-muted leading-relaxed">
              We collect information necessary to deliver and personalize your learning experience. This includes account profile information (your name, email address, avatar icon), platform statistics (XP, level completions, lesson statuses), and technical information (IP addresses, cookie preferences).
            </p>
          </div>

          <div id="usage" className="space-y-4">
            <h3 className="text-xl font-bold text-text">How We Use Your Data</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
              <li>To verify your access to courses, modules, and resources.</li>
              <li>To track streaks, analytics, and reward achievements.</li>
              <li>To power interactive elements like user-specific AI tutoring logs.</li>
              <li>To send system updates, and respond to support messages.</li>
            </ul>
          </div>

          <div id="cookies" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Cookies and Analytics</h3>
            <p className="text-sm text-muted leading-relaxed">
              We use cookies to retain your login session and store local preferences (such as your sidebar layout configuration and active theme). You can modify cookie settings under our Cookie Settings panel.
            </p>
          </div>

          <div id="sharing" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Data Sharing and Third Parties</h3>
            <p className="text-sm text-muted leading-relaxed">
              Manthio does not sell or lease your personal data. We only share data with authorized subprocessors critical for training support (such as authentication or cloud hosting services).
            </p>
          </div>

          <div id="contact" className="space-y-4">
            <h3 className="text-xl font-bold text-text">Contact Information</h3>
            <p className="text-sm text-muted leading-relaxed">
              For questions regarding data erasure or compliance, please file a support message under our Help Center.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
