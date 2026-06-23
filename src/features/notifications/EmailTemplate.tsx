import React from 'react';
import { Mail, Settings, Globe } from 'lucide-react';

interface EmailTemplateProps {
  title?: string;
  message?: string;
  previewText?: string;
  category?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  title = "Live session starting soon!",
  message = "The Q&A session for Module 3 starts in 15 minutes. Join now to ask your questions directly to the instructors.",
  previewText = "Module 3 Q&A is starting...",
  category = "Course Update",
  ctaText = "Join Live Session",
  ctaLink = "#"
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-bg border border-line rounded-3xl overflow-hidden shadow-2xl my-8 font-sans">
      {/* Hidden Preview Text for Email Clients */}
      <div className="hidden text-transparent text-xs leading-none h-0 opacity-0">
        {previewText}
      </div>

      {/* Header */}
      <div className="bg-panel border-b border-line p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-cyan">
          <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center border border-cyan/20">
            <Mail className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-text">Manthio</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted border border-line px-3 py-1 rounded-full bg-bg">
          {category}
        </span>
      </div>

      {/* Body */}
      <div className="p-8 md:p-12 space-y-6 bg-bg">
        <h1 className="text-3xl font-black text-text leading-tight">{title}</h1>
        
        <p className="text-muted leading-relaxed text-lg">
          {message}
        </p>

        {ctaText && (
          <div className="pt-6">
            <a 
              href={ctaLink}
              className="inline-block bg-cyan text-bg font-bold text-sm px-8 py-4 rounded-xl hover:bg-cyan2 transition-colors shadow-lg shadow-cyan/20"
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-panel p-8 border-t border-line text-center space-y-6">
        <div className="flex items-center justify-center gap-4 text-muted">
          <a href="#" className="hover:text-cyan transition-colors"><Globe className="w-5 h-5" /></a>
          <a href="#" className="hover:text-cyan transition-colors"><Settings className="w-5 h-5" /></a>
        </div>
        
        <div className="text-xs text-muted space-y-2">
          <p>© 2026 Manthio GmbH. All rights reserved.</p>
          <p>
            You are receiving this email because of your notification preferences.
            <br />
            <a href="#" className="text-cyan hover:underline">Manage preferences</a> • <a href="#" className="text-cyan hover:underline">Unsubscribe</a>
          </p>
        </div>
      </div>
    </div>
  );
};
