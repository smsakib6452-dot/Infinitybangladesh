import React from 'react';
import { ClipboardList, ShieldCheck, UserCheck, PhoneCall, Sparkles } from 'lucide-react';

interface DonorOnboardingTrustBannerProps {
  isBn: boolean;
  emergencyHelpline?: string;
}

export const DonorOnboardingTrustBanner: React.FC<DonorOnboardingTrustBannerProps> = ({
  isBn,
  emergencyHelpline = '01839008339'
}) => {
  return (
    <div
      className="mb-6 rounded-3xl bg-[#00523C] border border-[#008764]/30 p-5 sm:p-7 shadow-warm-md text-white"
      role="region"
      aria-label={isBn ? 'রক্তদাতা নিবন্ধন পরিচিতি' : 'Blood Donor Onboarding Overview'}
    >
      {/* 1. Header & Slogan */}
      <div className="space-y-1.5 border-b border-emerald-500/25 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003829] text-emerald-300 text-[11px] font-bold border border-emerald-400/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{isBn ? 'একটি রক্তবিন্দু, অনন্ত আশা' : 'One Drop, Infinity Hope'}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
          {isBn ? 'একটি রক্তবিন্দু, অনন্ত আশা' : 'One Drop, Infinity Hope'}
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
          {isBn
            ? 'রক্তদাতা হিসেবে নাম লেখান। জরুরি মুহূর্তে রক্তের প্রয়োজনে থাকা মানুষের পাশে দাঁড়ানোর সুযোগ।'
            : 'Register as a blood donor. Be ready to stand by someone in an emergency.'}
        </p>
      </div>

      {/* 2. Three Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4">
        {/* Pillar 1 */}
        <div className="rounded-2xl bg-[#003829]/75 border border-emerald-400/20 p-3.5 sm:p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#00281d] text-emerald-300 text-xs font-black flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-xs">
              ১
            </span>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-emerald-300 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isBn ? 'ফর্ম পূরণ করুন' : 'Fill out the form'}
              </h4>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-100/85 leading-relaxed pl-8">
            {isBn
              ? 'নাম, রক্তের গ্রুপ, যোগাযোগ ও এলাকার তথ্য দিন।'
              : 'Enter your name, blood group, contact and area.'}
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-2xl bg-[#003829]/75 border border-emerald-400/20 p-3.5 sm:p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#00281d] text-emerald-300 text-xs font-black flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-xs">
              ২
            </span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isBn ? 'নম্বর দেখানো আপনার সিদ্ধান্ত' : 'Showing phone is your choice'}
              </h4>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-100/85 leading-relaxed pl-8">
            {isBn
              ? 'ফর্মে ঠিক করুন আপনার ফোন নম্বর তালিকায় দেখানো হবে কিনা। না দেখাতে চাইলে ভলান্টিয়ার ডেস্ক যোগাযোগ করিয়ে দেবে।'
              : 'Choose in the form whether your phone number is shown in the list. If hidden, the volunteer desk connects people with you.'}
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="rounded-2xl bg-[#003829]/75 border border-emerald-400/20 p-3.5 sm:p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#00281d] text-emerald-300 text-xs font-black flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-xs">
              ৩
            </span>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isBn ? 'যাচাইয়ের পর তালিকায়' : 'Listed after verification'}
              </h4>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-100/85 leading-relaxed pl-8">
            {isBn
              ? 'আমাদের স্বেচ্ছাসেবকরা তথ্য যাচাই করার পর আপনার নাম তালিকায় আসে।'
              : 'After our volunteers review your details, you appear in the donor list.'}
          </p>
        </div>
      </div>

      {/* 3. Footer Strip */}
      <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="inline-flex items-center gap-2 text-emerald-200 font-semibold">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>
            {isBn
              ? `জরুরি রক্তের প্রয়োজনে হেল্পলাইন: ${emergencyHelpline} · বিনামূল্যে সেবা`
              : `Emergency helpline: ${emergencyHelpline} · Free service`}
          </span>
        </div>
        <span className="text-[11px] text-emerald-300/80 font-medium">
          {isBn ? 'ইনফিনিটি বাংলাদেশ লাইফলাইন উদ্যোগ' : 'Infinity Bangladesh LifeLine Initiative'}
        </span>
      </div>
    </div>
  );
};
export default DonorOnboardingTrustBanner;

