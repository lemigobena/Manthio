import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full justify-center relative">
      <button 
        onClick={() => onNavigate('signin')}
        className="absolute top-0 left-0 p-2 text-muted hover:text-text transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to log in
      </button>

      <header className="mb-8 mt-12">
        <h1 className="text-[2.75rem] font-bold text-text tracking-tight leading-tight mb-3 transition-colors duration-500">
          Reset password
        </h1>
        <p className="text-sm text-muted transition-colors duration-500 max-w-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </header>

      {isSent ? (
        <div className="bg-cyan/10 border border-cyan/30 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-cyan/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-text text-lg">Check your email</h3>
            <p className="text-sm text-muted mt-2">
              We've sent a password reset link to <span className="font-semibold text-text">{email}</span>.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('reset-password')}
            className="w-full bg-panel hover:bg-line text-text font-bold py-[0.875rem] rounded-xl transition-all shadow-sm text-sm border border-line"
          >
            Simulate clicking link
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email"
            required
            className="w-full bg-panel border border-line rounded-xl px-5 py-[0.875rem] text-text placeholder:text-muted/50 !outline-none focus:border-cyan transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button 
            type="submit" 
            disabled={isLoading || !email}
            className="w-full bg-cyan hover:bg-cyan2 text-bg font-bold py-[0.875rem] rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-cyan/10 text-sm active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
};
