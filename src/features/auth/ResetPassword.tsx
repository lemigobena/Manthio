import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { calculatePasswordStrength } from './passwordUtils';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate setting new password and logging in
    setTimeout(async () => {
      await signIn('user@example.com', password); // We mock the user email
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => onNavigate('dashboard'), 1500);
    }, 1200);
  };

  const isPasswordValid = password.length >= 12 && calculatePasswordStrength(password) >= 5;

  return (
    <div className="flex flex-col h-full justify-center">
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

      {isSuccess ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center text-green-500 font-bold">
          Password reset successful! Redirecting...
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

          <button 
            type="submit" 
            disabled={isLoading || !isPasswordValid}
            className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-[0.875rem] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-cyan/10 text-sm active:scale-[0.98] cursor-pointer mt-4"
          >
            {isLoading ? "Saving..." : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
};
