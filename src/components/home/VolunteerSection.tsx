import React from 'react';
import { Link } from '../../context/RouterContext';
import { ScrollReveal } from '../motion/ScrollReveal';
import { Sparkles, ArrowRight, Users } from 'lucide-react';

interface VolunteerSectionProps {
  volunteerBanner: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({
  volunteerBanner,
  isBn,
  tText
}) => {
  return (
    <section key="volunteer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-[#021811] via-[#05291E] to-[#01140E] rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl border border-emerald-600/30 ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <ScrollReveal effect="slide-right" className="lg:col-span-8 space-y-3 sm:space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>{tText(volunteerBanner?.badge || volunteerBanner?.eyebrow) || (isBn ? 'স্বেচ্ছাসেবী পরিবারে স্বাগতম' : 'Be Part of Team Infinity')}</span>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display leading-snug sm:leading-tight">
              {tText(volunteerBanner?.title) || (isBn ? 'মানবতার সেবায় আপনিও হতে পারেন অগ্রদূত' : 'Empower Communities with Your Time & Passion')}
            </h2>

            <p className="text-xs sm:text-base text-emerald-200/90 leading-relaxed max-w-2xl font-normal">
              {tText(volunteerBanner?.subtitle || volunteerBanner?.description) || (isBn
                ? 'টিম ইনফিনিটি একটি তারুণ্যনির্ভর স্বচ্ছ মানবিক পরিবার। আপনার মেধা ও সহমর্মিতা দিয়ে একজন মানুষের মুখে হাসি ফোটাতে আমাদের সাথে যুক্ত হোন।'
                : 'Join a vibrant, ethical youth community committed to transparent grassroots humanitarian action across Bangladesh.')}
            </p>
          </ScrollReveal>

          <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-4 flex flex-row sm:flex-row lg:flex-col gap-2.5 sm:gap-3 justify-center">
            <Link
              to={volunteerBanner?.primaryButtonUrl || volunteerBanner?.primaryCtaUrl || 'volunteer'}
              className="flex-1 lg:w-full py-2.5 sm:py-3.5 px-3.5 sm:px-6 rounded-xl sm:rounded-2xl bg-[#006A4E] hover:bg-[#008562] active:bg-[#004D38] text-white font-extrabold text-[11px] sm:text-sm shadow-warm-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transform hover:-translate-y-0.5 text-center"
            >
              <span className="truncate">{tText(volunteerBanner?.primaryButtonText || volunteerBanner?.primaryCtaText) || (isBn ? 'স্বেচ্ছাসেবী আবেদন' : 'Become a Volunteer')}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <Link
              to={volunteerBanner?.secondaryButtonUrl || volunteerBanner?.secondaryCtaUrl || 'about/executive-committee'}
              className="flex-1 lg:w-full py-2.5 sm:py-3.5 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-[11px] sm:text-sm border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">{tText(volunteerBanner?.secondaryButtonText || volunteerBanner?.secondaryCtaText) || (isBn ? 'নেতৃত্ব দেখুন' : 'Meet Our Team')}</span>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
