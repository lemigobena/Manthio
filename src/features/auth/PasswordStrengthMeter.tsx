import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red';
    if (strength <= 4) return 'bg-yellow';
    return 'bg-green';
  };

  const getStrengthText = () => {
    if (!password) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const strengthColor = getStrengthColor();
  const textColor = strength <= 2 ? 'text-red' : strength <= 4 ? 'text-yellow' : 'text-green';

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-line rounded-full flex gap-1 overflow-hidden">
        {[1, 2, 3, 4, 5].map((s) => (
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
    </div>
  );
};
