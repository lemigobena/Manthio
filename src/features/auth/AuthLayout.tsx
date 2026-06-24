import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

const CAROUSEL_DATA = [
  {
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1200",
    heading: "Master the\nArchitecture of Tomorrow"
  },
  {
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1200",
    heading: "Elevate Your\nTechnical Craftsmanship"
  },
  {
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200",
    heading: "Scale Your Impact,\nLead the Tech Frontier"
  }
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex bg-bg font-sans selection:bg-cyan/30 overflow-hidden overscroll-none transition-colors duration-500">
      
      {/* Left Side: Visual Panel Container */}
      <section className="hidden lg:flex w-[48%] h-full p-4 shrink-0">
        <div className={`relative w-full h-full rounded-[1rem] overflow-hidden shadow-2xl transition-all duration-500 ${isDark ? 'ring-1 ring-white/5' : 'ring-1 ring-black/5'}`}>
          
          {/* Automatic Carousel Images */}
          {CAROUSEL_DATA.map((slide, index) => (
            <div 
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img 
                src={slide.image} 
                alt={`Slide ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          
          {/* Transition-aware Overlay */}
          <div className={`absolute inset-0 z-20 transition-all duration-500 ${
            isDark 
              ? 'bg-linear-to-b from-cyan/10 via-transparent to-bg/90' 
              : 'bg-linear-to-b from-cyan/5 via-transparent to-black/60'
          }`} />
          
          {/* Content inside the image container */}
          <div className="absolute inset-0 p-10 flex flex-col justify-between z-30">
            {/* Branding Logo */}
            <img 
              src="/Branding/primary/logo_7_prio_1_variation.png" 
              alt="Manthio Logo" 
              className="absolute top-0 left-[-28px] w-50 brightness-0 invert" 
            />

            <div className="flex justify-end items-start w-full">
              <button 
                onClick={() => onNavigate('explore')}
                className="px-5 py-2 bg-white/20 border border-white/20 rounded-full text-white text-[11px] font-bold flex items-center gap-2 hover:bg-white/30 transition-all uppercase tracking-wider"
              >
                Back to website
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 11L11 1M11 1H3M11 1V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="h-[120px] flex flex-col justify-end">
                {CAROUSEL_DATA.map((slide, index) => (
                  <h2 
                    key={index}
                    className={`absolute text-4xl xl:text-5xl font-extrabold text-white leading-tight transition-all duration-1000 ${index === currentSlide ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}`}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {slide.heading}
                  </h2>
                ))}
              </div>
              
              <div className="flex gap-2 relative z-40">
                {CAROUSEL_DATA.map((_, i) => (
                  <div 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1 cursor-pointer rounded-full transition-all duration-300 ${i === currentSlide ? 'w-12 bg-cyan' : 'w-6 bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Form Panel Area */}
      <section className="flex-1 h-full overflow-y-auto flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 bg-bg transition-colors duration-500 relative">
        {/* Theme Toggle (Mobile & Desktop) */}
        <div className="absolute top-8 right-8 z-50">
          <button 
            onClick={toggleTheme}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg ${
              isDark 
                ? 'bg-panel border border-line text-cyan hover:bg-line group' 
                : 'bg-white border border-black/5 text-cyan hover:shadow-cyan/10'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>

        <div className="w-full max-w-[460px] mx-auto py-12">
          {children}
        </div>
      </section>

    </div>
  );
};
