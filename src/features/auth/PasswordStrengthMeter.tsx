import React from 'react';

export interface PasswordStrengthMeterProps {
  password?: string;
}

const calculatePasswordStrength = (pass?: string) => {
  let score = 0;
  if (!pass) return score;
  if (pass.length >= 12) score += 2;
  else if (pass.length >= 8) score += 1;
  
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score; // Max is 6
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = calculatePasswordStrength(password);
  
  const getStrengthColor = () => {
    if (strength < 3) return 'bg-red-500';
    if (strength < 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (!password) return '';
    if (strength < 3) return 'Weak';
    if (strength < 5) return 'Good';
    return 'Strong';
  };

  const strengthColor = getStrengthColor();
  const textColor = strength < 3 ? 'text-red-500' : strength < 5 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-line rounded-full flex gap-1 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div 
            key={s} 
            className={`flex-1 h-full transition-all duration-300 ${s <= strength ? strengthColor : 'bg-transparent'}`}
          ></div>
        ))}
      </div>
      <div className={`flex justify-between text-[0.75rem] mt-1 ${password ? textColor : 'text-muted'}`}>
        <span>Password Strength:</span>
        <span className="font-bold">{getStrengthText()}</span>
      </div>
      {password && password.length < 12 && (
        <div className="text-[0.7rem] text-red-500 mt-1">Minimum 12 characters required.</div>
      )}
    </div>
  );
};
