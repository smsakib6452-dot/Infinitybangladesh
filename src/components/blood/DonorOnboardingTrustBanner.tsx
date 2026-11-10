import React from 'react';
import { ChevronDown, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface DonorOnboardingTrustBannerProps {
  isBn: boolean;
  emergencyHelpline?: string;
  onScrollToForm?: () => void;
}

export const DonorOnboardingTrustBanner: React.FC<DonorOnboardingTrustBannerProps> = ({
  isBn,
  emergencyHelpline = '01839008339',
  onScrollToForm
}) => {
  const cleanHelpline = (emergencyHelpline || '01839008339').replace(/[^0-9+]/g, '');

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
      className="mb-6 rounded-3xl bg-[#06140E] border border-[#008764]/25 p-3.5 sm:p-4 md:py-4 md:px-5 shadow-warm-md text-white overflow-hidden transition-all"
      role="region"
      aria-label={isBn ? 'রক্তদাতা নিবন্ধন পরিচিতি' : 'Blood Donor Onboarding Overview'}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-5">
        {/* Left Column: Brand, Headline & Desktop Trust Note */}
        <div className="space-y-1.5 md:space-y-2 min-w-0 flex-1">
          {/* Top Brand Strip: Logo + Slogan Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <img
              src="/brand/Infinitylifeline-logo.webp"
              alt="Infinity LifeLine"
              width={760}
              height={330}
              loading="eager"
              decoding="async"
              className="h-8 sm:h-9 md:h-11 w-auto object-contain shrink-0"
            />
            <div className="hidden sm:block w-px h-4 bg-emerald-500/25 shrink-0" aria-hidden="true" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00281D] text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-400/30 shrink-0">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{isBn ? 'একটি রক্তবিন্দু, অনন্ত আশা' : 'One Drop, Infinity Hope'}</span>
            </div>
          </div>

          {/* Big Headline */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-[25px] font-extrabold text-white font-display tracking-tight leading-snug">
            {isBn ? 'আপনার রক্ত, কারও নতুন জীবন' : 'Your blood can give someone a new life'}
          </p>

          {/* Desktop Trust Note */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-300/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {isBn
                ? 'নম্বর দেখানো-না-দেখানো আপনার সিদ্ধান্ত'
                : 'Showing your phone number is your choice'}
            </span>
          </div>
        </div>

        {/* Right Column: CTA Button & Desktop Helpline */}
        <div className="flex flex-col items-stretch md:items-end justify-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleActionClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs sm:text-sm shadow-warm-sm transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06140E] active:scale-[0.98]"
          >
            <span>{isBn ? 'রক্তদাতা হিসেবে নাম লেখান' : 'Register as a donor'}</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>

          {/* Desktop-only Helpline Link */}
          <a
            href={`tel:${cleanHelpline}`}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 hover:text-white transition-colors underline-offset-4 hover:underline py-0.5"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>{isBn ? 'রক্ত দরকার? হেল্পলাইনে কল করুন' : 'Need blood? Call the helpline'}</span>
          </a>
        </div>
      </div>

      {/* Mobile-only Bottom Strip: Trust Note + Helpline in a single balanced line */}
      <div className="md:hidden mt-2.5 pt-2 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-emerald-300/90 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {isBn
              ? 'নম্বর দেখানো-না-দেখানো আপনার সিদ্ধান্ত'
              : 'Showing your phone number is your choice'}
          </span>
        </div>

        <a
          href={`tel:${cleanHelpline}`}
          className="inline-flex items-center gap-1 text-emerald-200 hover:text-white font-semibold underline-offset-2 hover:underline shrink-0"
        >
          <Phone className="w-3 h-3 text-emerald-300 shrink-0" />
          <span>{isBn ? 'রক্ত দরকার? হেল্পলাইনে কল করুন' : 'Need blood? Call the helpline'}</span>
        </a>
      </div>
    </div>
  );
};

export default DonorOnboardingTrustBanner;
