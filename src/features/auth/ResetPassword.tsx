import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { calculatePasswordStrength } from './passwordUtils';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate setting new password
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  const isPasswordValid = password.length >= 12 && calculatePasswordStrength(password) >= 5 && password === confirmPassword;

  return (
    <div className="flex flex-col h-full justify-center">
      {!isSuccess && (
        <header className="mb-8">
          <div className="w-16 h-16 bg-cyan/10 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8 text-cyan" />
          </div>
          <h1 className="text-[2.75rem] font-bold text-text tracking-tight leading-tight mb-3 transition-colors duration-500">
            Create new password
          </h1>
          <p className="text-sm text-muted transition-colors duration-500 max-w-sm">
            Please enter your new password below. Ensure it meets the minimum security requirements.
          </p>
        </header>
      )}

      {isSuccess ? (
        <div className="text-center space-y-6 animate-cel-reveal">
          <div className="w-16 h-16 bg-cyan/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-cyan/5">
            <svg 
              className="w-8 h-8 text-cyan animate-bounce" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-text text-2xl tracking-tight">Password Reset Complete</h3>
            <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
              Your password has been successfully updated. Please use your new password to log in.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('signin')}
            className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-[0.875rem] rounded-xl transition-all shadow-lg shadow-cyan/10 text-sm active:scale-[0.98] cursor-pointer"
          >
            Log in with new password
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="New password"
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

          <PasswordStrengthMeter password={password} />

          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm new password"
              className={`w-full bg-panel border rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 !outline-none transition-all text-sm pr-12 ${
                confirmPassword && password !== confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-line focus:border-cyan'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 font-medium transition-colors">Passwords do not match</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !isPasswordValid}
            className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-[0.875rem] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-cyan/10 text-sm active:scale-[0.98] cursor-pointer mt-2"
          >
            {isLoading ? "Saving..." : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
};
