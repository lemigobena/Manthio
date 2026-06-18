import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SignInProps {
  onNavigate: (page: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigate }) => {
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) onNavigate('dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <header className="mb-8">
        <h1 className="text-[2.75rem] font-bold text-text tracking-tight leading-tight mb-3 transition-colors duration-500">
          Welcome back
        </h1>
        <p className="text-sm text-muted transition-colors duration-500">
          New here? <button onClick={() => onNavigate('signup')} className="text-cyan underline font-medium hover:text-cyan/80 transition-colors cursor-pointer">Create account</button>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email"
          className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 outline-hidden focus:border-cyan transition-all text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />

        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password"
            className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 outline-hidden focus:border-cyan transition-all text-sm pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-end pt-1">
           <button type="button" className="text-sm font-medium text-muted hover:text-text transition-colors cursor-pointer">
             Forgot password?
           </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-[0.875rem] rounded-xl transition-all disabled:opacity-50 mt-4 shadow-lg shadow-cyan/10 text-sm active:scale-[0.98] cursor-pointer"
        >
          {isLoading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line transition-colors duration-500"></div>
        </div>
        <div className="relative flex justify-center text-[0.65rem] uppercase tracking-widest">
          <span className="px-3 font-bold bg-bg text-muted transition-colors duration-500">
            Or log in with
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
