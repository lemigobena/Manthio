import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (page: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
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
          <h2 className="text-2xl font-black tracking-tight text-text">Privacy Policy</h2>
          <p className="text-[10px] text-muted uppercase tracking-widest mt-1">Last Updated: June 18, 2026</p>
        </div>

        <div className="text-xs text-muted leading-relaxed space-y-4 max-w-3xl border-t border-line/30 pt-6">
          <p>
            At Manthio, we are committed to protecting the privacy of our learners. This privacy policy explains how we collect, use, and safe-keep your data when using our premium e-learning platform.
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">1. Information We Collect</h3>
            <p>
              We collect information necessary to deliver and personalize your learning experience. This includes account profile information (your name, email address, avatar icon), platform statistics (XP, level completions, lesson statuses), and technical information (IP addresses, cookie preferences).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">2. How We Use Your Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To verify your access to courses, modules, and resources.</li>
              <li>To track streaks, analytics, and reward achievements.</li>
              <li>To power interactive elements like user-specific AI tutoring logs.</li>
              <li>To send system updates, and respond to support messages.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">3. Cookies and Analytics</h3>
            <p>
              We use cookies to retain your login session and store local preferences (such as your sidebar layout configuration and active theme). You can modify cookie settings under our Cookie Settings panel.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">4. Data Sharing and Third Parties</h3>
            <p>
              Manthio does not sell or lease your personal data. We only share data with authorized subprocessors critical for training support (such as authentication or cloud hosting services).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">5. Contact Information</h3>
            <p>
              For questions regarding data erasure or compliance, please file a support message under our Help Center.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
