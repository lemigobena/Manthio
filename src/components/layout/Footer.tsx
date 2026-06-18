import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    onNavigate(pageId);
  };

  return (
    <footer className="bg-panel border-t border-line py-6 px-6 mt-12 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
        <div>
          <span>&copy; {currentYear} </span>
          <span className="font-bold text-text">Manthio</span>
          <span> &middot; Powered by </span>
          <a 
            href="https://apigenio.ch" 
            target="_blank" 
            rel="noreferrer" 
            className="text-cyan hover:underline font-semibold"
          >
            apigenio GmbH
          </a>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2">
          {/* Row 1 on mobile (3 items) */}
          <button 
            onClick={(e) => handleLinkClick(e, 'help-center')} 
            className="hover:text-cyan transition-colors cursor-pointer text-xs font-semibold"
          >
            Help Center
          </button>
          <button 
            onClick={(e) => handleLinkClick(e, 'privacy')} 
            className="hover:text-cyan transition-colors cursor-pointer text-xs font-semibold"
          >
            Privacy Policy
          </button>
          <button 
            onClick={(e) => handleLinkClick(e, 'terms')} 
            className="hover:text-cyan transition-colors cursor-pointer text-xs font-semibold"
          >
            Terms of Use
          </button>
          {/* Force line break on mobile only */}
          <div className="basis-full h-0 md:hidden" />
          {/* Row 2 on mobile (2 items) */}
          <button 
            onClick={(e) => handleLinkClick(e, 'cookies')} 
            className="hover:text-cyan transition-colors cursor-pointer text-xs font-semibold"
          >
            Cookie Settings
          </button>
          <button 
            onClick={(e) => handleLinkClick(e, 'imprint')} 
            className="hover:text-cyan transition-colors cursor-pointer text-xs font-semibold"
          >
            Imprint
          </button>
        </div>
      </div>
    </footer>
  );
};
