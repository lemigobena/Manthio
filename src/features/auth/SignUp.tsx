import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Explicitly navigate without constraints
    const fullName = `${firstName || 'Alex'} ${lastName || 'Chen'}`.trim();
    await signUp(fullName, email || 'newuser@example.com', password || 'password');
    onNavigate('onboarding');
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <header className="mb-8">
        <h1 className="text-[2.75rem] font-bold text-text tracking-tight leading-tight mb-3 transition-colors duration-500">
          Create an account
        </h1>
        <p className="text-sm text-muted transition-colors duration-500">
          Already have an account? <button onClick={() => onNavigate('signin')} className="text-cyan underline font-medium hover:text-cyan/80 transition-colors cursor-pointer">Log in</button>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="First name"
            className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 !outline-none focus:border-cyan transition-all text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Last name"
            className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 !outline-none focus:border-cyan transition-all text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input 
          type="email" 
          placeholder="Email"
          className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 !outline-none focus:border-cyan transition-all text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password"
            className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 !outline-none focus:border-cyan transition-all text-sm pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {/* Custom Modern Checkbox: Terms */}
          <label className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <div className="w-5 h-5 rounded-lg border-2 border-line bg-panel transition-all duration-300 peer-checked:bg-cyan peer-checked:border-cyan peer-focus:ring-2 peer-focus:ring-cyan/40 flex items-center justify-center">
                <svg 
                  className={`w-3 h-3 text-bg transition-opacity duration-300 ${agree ? 'opacity-100' : 'opacity-0'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-[0.875rem] font-medium text-muted leading-none select-none transition-colors duration-500">
              I agree to the <button type="button" className="text-cyan hover:text-cyan/80 underline transition-colors">Terms & Conditions</button>
            </span>
          </label>

          {/* Custom Modern Checkbox: Marketing */}
          <label className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
              />
              <div className="w-5 h-5 rounded-lg border-2 border-line bg-panel transition-all duration-300 peer-checked:bg-cyan peer-checked:border-cyan peer-focus:ring-2 peer-focus:ring-cyan/40 flex items-center justify-center">
                <svg 
                  className={`w-3 h-3 text-bg transition-opacity duration-300 ${marketingConsent ? 'opacity-100' : 'opacity-0'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-[0.875rem] font-medium text-muted leading-none select-none transition-colors duration-500">
              Optional marketing consent
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !agree}
          className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-[0.875rem] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-cyan/10 text-sm mt-2 active:scale-[0.98] cursor-pointer"
        >
          {isLoading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line transition-colors duration-500"></div>
        </div>
        <div className="relative flex justify-center text-[0.65rem] uppercase tracking-widest">
          <span className="px-3 font-bold bg-bg text-muted transition-colors duration-500">
            Or register with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button" className="flex items-center justify-center gap-2.5 bg-panel border border-line rounded-xl py-3 font-bold text-text hover:border-cyan transition-all text-sm active:scale-[0.98] cursor-pointer">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4.5 h-4.5" alt="Google" />
          Google
        </button>
        <button type="button" className="flex items-center justify-center gap-2.5 bg-panel border border-line rounded-xl py-3 font-bold text-text hover:border-cyan transition-all text-sm active:scale-[0.98] cursor-pointer">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/apple.svg" className={`w-5 h-5 transition-all ${isDark ? 'invert' : ''}`} alt="Apple" />
          Apple
        </button>
      </div>
    </div>
  );
};
