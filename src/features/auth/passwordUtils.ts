export const calculatePasswordStrength = (pass?: string) => {
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
