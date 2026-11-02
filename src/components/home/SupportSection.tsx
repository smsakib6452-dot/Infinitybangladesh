import React from 'react';
import { Link } from '../../context/RouterContext';
import { ScrollReveal } from '../motion/ScrollReveal';
import { Heart, Users, ShieldCheck, ArrowRight, Sparkles, HandHeart } from 'lucide-react';

interface SupportSectionProps {
  supportBanner: any;
  volunteerBanner?: any;
  transparencyConfig?: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  supportBanner,
  volunteerBanner,
  transparencyConfig,
  isBn,
  tText
}) => {
  return (
    <section key="support" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal effect="fade-up">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#FAF7F2] via-white to-[#F5EFE6] border border-[#E8DFD3] p-6 sm:p-10 lg:p-14 text-center shadow-[0_16px_50px_-12px_rgba(0,106,78,0.1)]">
          {/* Subtle warm & emerald atmospheric glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-[#E6F3EF] border border-[#C2E2D7] text-[#006A4E] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>
              {isBn ? 'একতাবদ্ধ মানবিক উদ্যোগ • টিম ইনফিনিটি' : 'UNITED FOR HUMANITY • TEAM INFINITY'}
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-snug sm:leading-tight max-w-3xl mx-auto">
            {tText(supportBanner?.title) || (isBn ? 'মানবতার কল্যাণে আমাদের পাশে থাকুন' : 'Stand With Infinity Bangladesh')}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mt-2.5 sm:mt-3 font-normal">
            {tText(supportBanner?.subtitle) || (isBn
              ? 'আপনার আর্থিক অনুদান সুবিধাবঞ্চিত মানুষের মুখে হাসি ফোটায় এবং আপনার সক্রিয় অংশগ্রহণ সমাজে স্থায়ী পরিবর্তন আনে। আসুন, একসাথে মানুষের পাশে দাঁড়াই।'
              : 'Whether through life-saving financial donations or volunteering your passionate time, every single contribution directly builds dignified lives across Bangladesh.')}
          </p>

          {/* Master Action Pathways (Donation + Volunteer) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-5 sm:pt-7 max-w-lg mx-auto">
            {/* Primary Action: Online Donation */}
            <Link
              to={supportBanner?.primaryButtonUrl || supportBanner?.primaryCtaUrl || 'donate'}
              className="w-full sm:w-auto min-h-[46px] sm:min-h-[50px] px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#006A4E] via-[#007A5A] to-[#008763] hover:from-[#005B43] hover:to-[#007052] text-white font-extrabold text-xs sm:text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
            >
              <Heart className="w-4 h-4 fill-white shrink-0" />
              <span>{tText(supportBanner?.primaryButtonText) || (isBn ? 'অনলাইন অনুদান দিন' : 'Support Our Work')}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            {/* Secondary Action: Volunteer Application */}
            <Link
              to={volunteerBanner?.primaryButtonUrl || volunteerBanner?.primaryCtaUrl || 'volunteer'}
              className="w-full sm:w-auto min-h-[46px] sm:min-h-[50px] px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 hover:text-[#006A4E] font-bold text-xs sm:text-sm border border-[#D5C9B8] hover:border-[#006A4E]/50 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
            >
              <Users className="w-4 h-4 text-[#006A4E] shrink-0" />
              <span>{tText(volunteerBanner?.primaryButtonText) || (isBn ? 'স্বেচ্ছাসেবী হিসেবে যোগ দিন' : 'Join as Volunteer')}</span>
            </Link>
          </div>

          {/* Integrated Transparency & Accountability Assurance Strip */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-7 border-t border-[#EAE3D9] flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[11px] sm:text-xs text-slate-600">
            <Link
              to="transparency"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-[#E5DDD2] hover:border-[#006A4E]/40 hover:text-[#006A4E] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />
              <span className="font-semibold">{isBn ? '১০০% নিরীক্ষিত স্বচ্ছ তহবিল' : '100% Audited Fund Tracking'}</span>
            </Link>

            <span className="hidden sm:inline text-slate-300">•</span>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-[#E5DDD2]">
              <HandHeart className="w-3.5 h-3.5 text-[#006A4E]" />
              <span className="font-semibold">{isBn ? 'তৃণমূল পর্যায়ে সরাসরি বিতরণ' : 'Direct Grassroots Delivery'}</span>
            </div>

            <span className="hidden sm:inline text-slate-300">•</span>

            <Link
              to="transparency"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-[#E5DDD2] hover:border-[#006A4E]/40 hover:text-[#006A4E] transition-colors"
            >
              <span className="font-semibold">{isBn ? 'প্রকাশ্য অডিট রিপোর্ট দেখুন →' : 'View Public Audit Reports →'}</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
