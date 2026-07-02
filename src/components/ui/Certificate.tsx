import React from 'react';

// Cursive / Serif Google fonts loaded dynamically
const fontStylesheet = `
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
  
  .font-script {
    font-family: 'Great Vibes', cursive;
  }
  .font-serif-elegant {
    font-family: 'Playfair Display', Georgia, serif;
  }
`;

export interface CertificateProps {
  recipientName: string;
  courseName: string;
  completionDate: string;
  platformName: string;
  instructorName?: string;
  certificateId?: string;
  className?: string;
  logoUrl?: string;
  isCaptureTemplate?: boolean;
}

export const Certificate: React.FC<CertificateProps> = ({
  recipientName,
  courseName,
  completionDate,
  platformName,
  instructorName = 'Authorized Signature',
  certificateId = 'CERT-100-XYZ',
  className = '',
  logoUrl,
  isCaptureTemplate = false,
}) => {
  const baseClasses = [
    '@container relative bg-white text-[#2A221A] overflow-hidden select-none',
    isCaptureTemplate ? '' : 'w-full aspect-[1.6/1] rounded-[1.5cqw] shadow-2xl border border-line/10',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses}>
      {/* Dynamic Font Styling Injection */}
      <style dangerouslySetInnerHTML={{ __html: fontStylesheet }} />

      {/* ──────────────────────────────────────────────────────── */}
      {/* SVG DECORATIVE GRADIENTS & DEFS */}
      {/* ──────────────────────────────────────────────────────── */}
      <svg className="absolute w-0 h-0 z-0">
        <defs>
          {/* Metallic Gold Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="25%" stopColor="#FCF6BA" />
            <stop offset="50%" stopColor="#B38728" />
            <stop offset="75%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>

          {/* Primary/Secondary Brand Gradients (Purple to Cyan) */}
          <linearGradient id="brandGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--purple)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
          <linearGradient id="brandGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--cyan2)" />
            <stop offset="100%" stopColor="var(--purple)" />
          </linearGradient>
        </defs>
      </svg>

      {/* ──────────────────────────────────────────────────────── */}
      {/* CORNER WAVE BANDS (Background z-0) */}
      {/* ──────────────────────────────────────────────────────── */}
      {/* Top-Left Waves */}
      <svg className="absolute top-0 left-0 w-[55%] h-[55%] pointer-events-none z-0" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Deep Brand Background Wave */}
        <path d="M0 0 H 340 C 260 110, 140 230, 0 300 Z" fill="url(#brandGrad1)" opacity="0.15" />
        {/* Middle wave */}
        <path d="M0 0 H 290 C 220 90, 120 190, 0 240 Z" fill="url(#brandGrad2)" opacity="0.85" />
        {/* Front wave */}
        <path d="M0 0 H 240 C 180 80, 100 160, 0 200 Z" fill="url(#brandGrad1)" />
        {/* Thin Gold accent trim lines */}
        <path d="M 240 0 C 180 80, 100 160, 0 200" stroke="url(#goldGrad)" strokeWidth="4" />
        <path d="M 290 0 C 220 90, 120 190, 0 240" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* Bottom-Right Waves */}
      <svg className="absolute bottom-0 right-0 w-[50%] h-[50%] pointer-events-none z-0" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Deep Brand Background Wave */}
        <path d="M500 400 H 160 C 240 290, 360 170, 500 100 Z" fill="url(#brandGrad1)" opacity="0.15" />
        {/* Middle wave */}
        <path d="M500 400 H 210 C 280 310, 380 210, 500 160 Z" fill="url(#brandGrad2)" opacity="0.85" />
        {/* Front wave */}
        <path d="M500 400 H 260 C 320 320, 400 240, 500 200 Z" fill="url(#brandGrad1)" />
        {/* Thin Gold accent trim lines */}
        <path d="M 260 400 C 320 320, 400 240, 500 200" stroke="url(#goldGrad)" strokeWidth="4" />
        <path d="M 210 400 C 280 310, 380 210, 500 160" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* ──────────────────────────────────────────────────────── */}
      {/* AWARD BADGE WITH RIBBON TAILS (TOP-LEFT - Static) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="absolute top-[6%] left-[6%] w-[13%] aspect-square flex items-center justify-center z-10">
        {/* Ribbon Tails */}
        <svg className="absolute top-[65%] w-[80%] h-[90%] drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Ribbon */}
          <path d="M25 0 L25 85 L45 72 L65 85 L65 0" fill="var(--purple)" opacity="0.95" />
          <path d="M25 0 L25 85 L45 72 L65 85 L65 0" stroke="url(#goldGrad)" strokeWidth="2" />
          {/* Right Ribbon (rotated/shifted) */}
          <path d="M45 0 L45 95 L65 82 L85 95 L85 0" fill="var(--cyan2)" opacity="0.9" />
          <path d="M45 0 L45 95 L65 82 L85 95 L85 0" stroke="url(#goldGrad)" strokeWidth="2" />
        </svg>

        {/* Outer Gold Scalloped Starburst Seal */}
        <div className="absolute inset-0 rounded-full">
          <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 2.5 L55.3 12.5 L66.2 9.9 L67.8 21 L78.4 21.9 L76 32.8 L84.4 39.9 L78.6 49.5 L84.4 59.1 L76 66.2 L78.4 77.1 L67.8 78 L66.2 89.1 L55.3 86.5 L50 96.5 L44.7 86.5 L33.8 89.1 L32.2 78 L21.6 77.1 L24 66.2 L15.6 59.1 L21.4 49.5 L15.6 39.9 L24 32.8 L21.6 21.9 L32.2 21 L33.8 9.9 L44.7 12.5 Z" fill="url(#goldGrad)" />
            {/* Inner Brand Ring - Fixed Dark color for high contrast */}
            <circle cx="50" cy="50" r="38" fill="#0F1417" stroke="url(#goldGrad)" strokeWidth="2.5" />
            {/* Small Inner gold circle */}
            <circle cx="50" cy="50" r="32" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="3 2" />
          </svg>
          
          {/* Badge Central Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[0.7cqw] font-bold tracking-widest text-[#FFCF3F] uppercase leading-none">VERIFIED</span>
            <svg className="w-[2cqw] h-[2cqw] mt-[0.1cqw] text-[#FFCF3F]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[0.8cqw] font-extrabold text-[#EDF2F6] leading-none mt-[0.05cqw]">PASSED</span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* BRAND LOGO (TOP-RIGHT) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="absolute top-[3%] right-[-8%] w-[40%] h-[24%] flex items-center justify-end z-10">
        <img 
          src={logoUrl || "/src/assets/logo_7_prio_1_variation.png"} 
          alt="Platform Logo" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA (Foreground z-10) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-between py-[6%] px-[4%] text-center z-10 pointer-events-auto">
        
        {/* Top Header Group */}
        <div className="space-y-[0.2cqw]">
          <p className="text-[1.2cqw] font-bold tracking-[0.25em] text-muted uppercase leading-none">
            {platformName}
          </p>
          <div className="w-[6cqw] h-[0.2cqw] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-[0.5cqw]" />
        </div>

        {/* Certificate Title */}
        <div className="space-y-[0.3cqw]">
          <h1 className="text-[4cqw] font-extrabold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#2A221A] via-[#B38728] to-[#2A221A] leading-none font-serif-elegant">
            Certificate of Completion
          </h1>
          <p className="text-[1.1cqw] tracking-[0.3em] font-extrabold text-muted uppercase">
            For outstanding academic achievement
          </p>
        </div>

        {/* Presentation Line */}
        <div>
          <span className="text-[1.1cqw] italic tracking-widest text-[#6E6650]/80 uppercase">
            This certificate is proudly presented to
          </span>
        </div>

        {/* Recipient Name */}
        <div className="relative inline-block mx-auto min-w-[20cqw] border-b border-[#D4AF37]/30 pb-[0.5cqw]">
          <h2 className="text-[5.5cqw] font-script text-transparent bg-clip-text bg-gradient-to-r from-[#2A221A] via-[#AA771C] to-[#2A221A] px-[2cqw] leading-none select-text">
            {recipientName}
          </h2>
          {/* Decorative mini diamonds under name */}
          <div className="absolute bottom-[-0.4cqw] left-1/2 -translate-x-1/2 flex items-center gap-[0.3cqw] bg-white px-[0.5cqw]">
            <span className="w-[0.4cqw] h-[0.4cqw] rotate-45 bg-[#D4AF37]" />
            <span className="w-[0.6cqw] h-[0.6cqw] rotate-45 bg-[#AA771C]" />
            <span className="w-[0.4cqw] h-[0.4cqw] rotate-45 bg-[#D4AF37]" />
          </div>
        </div>

        {/* Body sentence */}
        <div className="max-w-[80%] mx-auto">
          <p className="text-[1.4cqw] text-[#2A221A]/80 leading-relaxed font-sans font-medium">
            has successfully completed the course <strong className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A221A] to-[#B38728] font-bold">{courseName}</strong> on <span className="font-semibold text-muted select-text">{completionDate}</span>
          </p>
        </div>

        {/* Bottom Metadata Fields */}
        <div className="grid grid-cols-2 gap-[15%] pt-[1cqw] px-[5%]">
          {/* Date Column */}
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-[#D4AF37]/40 pb-[0.3cqw] font-semibold text-[1.2cqw] text-[#2A221A]/70 select-text">
              {completionDate}
            </div>
            <span className="text-[0.9cqw] font-bold tracking-widest text-muted uppercase mt-[0.3cqw]">
              Date
            </span>
          </div>

          {/* Signature Column */}
          <div className="flex flex-col items-center relative right-[6cqw]">
            <div className="w-full border-b border-[#D4AF37]/40 pb-[0.1cqw] font-script text-[2.2cqw] text-[#2A221A]/90 select-text leading-none h-[2.5cqw] flex items-end justify-center">
              {instructorName}
            </div>
            <span className="text-[0.9cqw] font-bold tracking-widest text-muted uppercase mt-[0.3cqw] whitespace-nowrap">
              Authorized Signature
            </span>
          </div>
        </div>

        {/* Certificate ID / Traceability */}
        {certificateId && (
          <div className="absolute bottom-[1.5cqw] left-0 right-0 text-center pointer-events-none">
            <span className="text-[1cqw] font-mono font-bold tracking-widest text-[#2A221A]/70 uppercase">
              ID: {certificateId} &nbsp;•&nbsp; Verification Security Enabled
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

