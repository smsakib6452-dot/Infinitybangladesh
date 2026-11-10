import React from 'react';
import { ChevronDown, Droplet } from 'lucide-react';

interface DonorOnboardingTrustBannerProps {
  isBn: boolean;
  readyDonorsCount?: number;
  onScrollToForm?: () => void;
}

export const DonorOnboardingTrustBanner: React.FC<DonorOnboardingTrustBannerProps> = ({
  isBn,
  readyDonorsCount = 0,
  onScrollToForm
}) => {
  const showReadyPill = typeof readyDonorsCount === 'number' && readyDonorsCount >= 5;

  const handleActionClick = () => {
    if (onScrollToForm) {
      onScrollToForm();
      return;
    }

    if (typeof window === 'undefined') return;

    const target =
      document.getElementById('regFullName') ||
      document.querySelector('form input[type="text"]') ||
      document.querySelector('form');

    if (!target) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    target.scrollIntoView({
      behavior: isReduced ? 'auto' : 'smooth',
      block: 'center'
    });

    // Desktop: focus the input for immediate keyboard entry.
    // Touch/Mobile: do NOT focus, so the virtual keyboard does not obscure the form.
    if (!isTouch && 'focus' in target && typeof (target as HTMLElement).focus === 'function') {
      (target as HTMLElement).focus({ preventScroll: true });
    }
  };

  return (
    <div
      className="mb-6 rounded-3xl bg-gradient-to-b from-[#092419] to-[#05140E] border border-emerald-500/25 p-3.5 sm:p-4 md:py-3.5 md:px-5 lg:px-6 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] text-white overflow-hidden transition-all"
      role="region"
      aria-label={isBn ? 'রক্তদাতা নিবন্ধন পরিচিতি' : 'Blood Donor Onboarding Overview'}
    >
      <style>{`
        @keyframes donorCtaPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .donor-cta-pulse {
            animation: donorCtaPulse 0.8s ease-in-out 3;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-3.5 md:gap-5">
        {/* Left Section (Mobile: Centered Logo + Optional Pill; Desktop: Left-aligned Logo + Pill) */}
        <div className="flex flex-col items-center md:flex-row md:items-center gap-2 sm:gap-2.5 shrink-0">
          <img
            src="/brand/Infinitylifeline-logo.webp"
            alt="Infinity LifeLine"
            width={760}
            height={330}
            loading="eager"
            decoding="async"
            className="h-14 md:h-[60px] w-auto object-contain shrink-0"
          />

          {showReadyPill && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>
                {readyDonorsCount} {isBn ? 'প্রস্তুত' : 'Ready'}
              </span>
            </span>
          )}
        </div>

        {/* Center Section: Two-line Headline + Tagline */}
        <div className="text-center md:text-left min-w-0 flex-1 space-y-0.5 sm:space-y-1">
          <p className="text-xs sm:text-sm font-medium text-white/90 leading-tight">
            {isBn ? 'আজ আপনার রক্ত,' : 'Give blood today.'}
          </p>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-amber-400 font-display tracking-tight leading-snug text-balance">
            {isBn ? 'কারও আগামীকাল' : 'Give someone a tomorrow.'}
          </p>
          <p className="text-[11px] sm:text-xs text-emerald-300 font-medium leading-tight">
            {isBn ? 'প্রতিটি ফোঁটাই গুরুত্বপূর্ণ' : 'Every drop counts.'}
          </p>
        </div>

        {/* Right Section: Action Button with gentle 3-pulse transform */}
        <div className="flex flex-col items-stretch md:items-end justify-center shrink-0">
          <button
            type="button"
            onClick={handleActionClick}
            className="donor-cta-pulse inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#006A4E] to-[#007857] hover:brightness-105 text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(0,106,78,0.35)] transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06140E] active:scale-[0.98]"
          >
            <Droplet className="w-3.5 h-3.5 text-[#FF1E44] fill-[#FF1E44] shrink-0" />
            <span>{isBn ? 'রক্তদাতা হিসেবে নাম লেখান' : 'Register as a donor'}</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorOnboardingTrustBanner;
