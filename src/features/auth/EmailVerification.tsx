import React, { useState, useRef } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EmailVerificationProps {
  onNavigate: (page: string) => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ onNavigate }) => {
  const { user, setIsEmailVerified } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const firstInputRef = useRef<HTMLInputElement>(null);

  const focusFirst = () => setTimeout(() => firstInputRef.current?.focus(), 50);

  const handleVerify = () => {
    setIsLoading(true);
    setStatus('idle');
    const fullCode = code.join('');
    
    // Simulate verification delay
    setTimeout(() => {
      setIsLoading(false);
      if (fullCode === '111111') {
        setStatus('error');
        
        setTimeout(() => {
          setCode(['', '', '', '', '', '']);
          setStatus('idle');
          focusFirst();
        }, 500);
      } else {
        setStatus('success');
        setTimeout(() => {
          setIsEmailVerified(true);
          onNavigate('onboarding');
        }, 1000);
      }
    }, 1500);
  };

  const handleResend = () => {
    setResendStatus('sending');
    setCode(['', '', '', '', '', '']);
    setTimeout(() => {
      setResendStatus('sent');
      focusFirst();
      setTimeout(() => setResendStatus('idle'), 3000);
    }, 1000);
  };

  const isComplete = code.every(digit => digit !== '');

  return (
    <div className="flex flex-col h-full justify-center">
      <header className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-cyan/10 rounded-2xl flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-cyan" />
        </div>
        <h1 className="text-3xl font-bold text-text tracking-tight mb-3">
          Check your email
        </h1>
        <p className="text-muted max-w-sm mx-auto text-sm leading-relaxed px-4">
          We sent a verification code to <span className="text-text font-semibold break-all">{user?.email || 'your email'}</span>.
          Enter it below to secure your account.
        </p>
      </header>

      <div className="space-y-8 max-w-sm mx-auto w-full">
        {/* Mock code entry */}
        <div className="flex gap-2 sm:gap-3 justify-center px-2">
          {code.map((digit, i) => {
            const borderClass = status === 'error' ? 'border-red-500 text-red-500' : status === 'success' ? 'border-green-500 text-green-500' : 'border-line focus:border-cyan';
            return (
              <input
                key={i}
                ref={i === 0 ? firstInputRef : undefined}
                type="text"
                maxLength={1}
                className={`w-10 h-12 sm:w-12 sm:h-14 bg-panel border-2 rounded-xl text-center text-lg sm:text-xl font-bold transition-colors !outline-none ${borderClass} ${status === 'idle' ? 'text-text' : ''}`}
                value={digit}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                  if (pastedData) {
                    const newCode = [...code];
                    for (let j = 0; j < pastedData.length; j++) {
                      newCode[j] = pastedData[j];
                    }
                    setCode(newCode);
                    setStatus('idle');
                    
                    const nextIndex = Math.min(pastedData.length, 5);
                    setTimeout(() => {
                      document.getElementById(`code-${nextIndex}`)?.focus();
                    }, 10);
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  const newCode = [...code];
                  newCode[i] = val;
                  setCode(newCode);
                  setStatus('idle');
                  
                  // Auto-advance
                  if (val && i < 5) {
                    const nextInput = document.getElementById(`code-${i + 1}`);
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && i > 0) {
                    const prevInput = document.getElementById(`code-${i - 1}`);
                    prevInput?.focus();
                  } else if (e.key === 'Enter' && isComplete) {
                    handleVerify();
                  }
                }}
                id={`code-${i}`}
              />
            );
          })}
        </div>

        <button
          onClick={handleVerify}
          disabled={!isComplete || isLoading}
          className="w-full bg-cyan hover:bg-cyan2 disabled:opacity-50 disabled:hover:bg-cyan text-bg font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan/20 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify email <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          {resendStatus === 'sent' ? (
            <p className="text-sm text-green-500 font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> New code sent
            </p>
          ) : (
            <p className="text-sm text-muted">
              Didn't receive it?{' '}
              <button 
                onClick={handleResend}
                disabled={resendStatus === 'sending'}
                className="text-cyan font-semibold hover:underline"
              >
                {resendStatus === 'sending' ? 'Sending...' : 'Click to resend'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
