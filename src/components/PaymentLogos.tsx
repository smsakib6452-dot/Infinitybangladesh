import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * Authentic Official bKash Vector Logo
 * Features the signature origami bird in official bKash magenta palette (#E2136E)
 */
export const BkashLogo: React.FC<LogoProps> = ({ className = 'h-6 w-auto', showText = true }) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Official bKash Origami Bird SVG */}
      <svg
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto shrink-0 aspect-[12/10]"
        aria-label="bKash"
      >
        <path d="M72 12L98 38L72 50L72 12Z" fill="#D81765" />
        <path d="M72 12L42 30L55 48L72 12Z" fill="#C21359" />
        <path d="M42 30L12 40L38 52L42 30Z" fill="#E2136E" />
        <path d="M38 52L10 65L42 62L38 52Z" fill="#F01F78" />
        <path d="M42 62L62 90L72 50L42 62Z" fill="#A80E4C" />
        <path d="M72 50L108 55L98 38L72 50Z" fill="#E2136E" />
        <path d="M72 50L88 82L62 90L72 50Z" fill="#910A40" />
        <path d="M98 38L118 42L108 55L98 38Z" fill="#F01F78" />
      </svg>

      {showText && (
        <span className="font-extrabold tracking-tight text-[#E2136E] text-base leading-none font-sans">
          bKash
        </span>
      )}
    </div>
  );
};

/**
 * Authentic Official Nagad Vector Logo
 * Features the signature swirling flame icon in official fiery red-orange palette (#ED1C24 / #F7931E)
 */
export const NagadLogo: React.FC<LogoProps> = ({ className = 'h-6 w-auto', showText = true }) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Official Nagad Swirl Flame SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto shrink-0 aspect-square"
        aria-label="Nagad"
      >
        <defs>
          <linearGradient id="nagadFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBB03B" />
            <stop offset="35%" stopColor="#F7931E" />
            <stop offset="75%" stopColor="#ED1C24" />
            <stop offset="100%" stopColor="#C1272D" />
          </linearGradient>
        </defs>
        <path
          d="M50 8C48 24 34 32 26 44C16 58 20 80 38 90C56 100 80 92 88 74C96 56 86 38 74 28C68 23 60 18 58 12C56 10 52 6 50 8Z"
          fill="url(#nagadFlame)"
        />
        <path
          d="M54 28C50 38 38 46 36 56C34 66 42 76 52 78C62 80 72 74 74 64C76 54 68 44 62 38C58 34 56 30 54 28Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
        <path
          d="M50 44C47 50 42 54 42 60C42 66 47 70 52 70C57 70 61 66 61 60C61 54 56 48 50 44Z"
          fill="#ED1C24"
        />
      </svg>

      {showText && (
        <span className="font-black tracking-tight text-[#ED1C24] text-base leading-none font-sans flex items-baseline gap-1">
          <span>নগদ</span>
          <span className="text-xs font-bold text-[#F7931E]">Nagad</span>
        </span>
      )}
    </div>
  );
};

/**
 * Distinguished Bank Transfer Vector Badge
 * Clean, official neoclassical architectural emblem
 */
export const BankLogo: React.FC<LogoProps> = ({ className = 'h-6 w-auto', showText = true }) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto shrink-0 aspect-square"
        aria-label="Bank Transfer"
      >
        <rect width="100" height="100" rx="20" fill="#004835" />
        <path d="M50 20L20 36H80L50 20Z" fill="#F8FAFC" />
        <rect x="25" y="42" width="8" height="28" rx="2" fill="#E2E8F0" />
        <rect x="41" y="42" width="8" height="28" rx="2" fill="#E2E8F0" />
        <rect x="57" y="42" width="8" height="28" rx="2" fill="#E2E8F0" />
        <rect x="73" y="42" width="8" height="28" rx="2" fill="#E2E8F0" />
        <rect x="18" y="74" width="64" height="8" rx="2" fill="#F8FAFC" />
      </svg>

      {showText && (
        <span className="font-extrabold tracking-tight text-[#006A4E] text-sm leading-none font-display">
          Bank Transfer
        </span>
      )}
    </div>
  );
};
