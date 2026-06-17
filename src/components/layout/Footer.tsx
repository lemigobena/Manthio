import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
        
        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <a href="#" className="hover:text-text transition-colors">Datenschutz</a>
          <a href="#" className="hover:text-text transition-colors">Nutzungsbedingungen</a>
          <a href="#" className="hover:text-text transition-colors">Cookie-Einstellungen</a>
          <a href="#" className="hover:text-text transition-colors">Impressum</a>
        </div>
      </div>
    </footer>
  );
};
