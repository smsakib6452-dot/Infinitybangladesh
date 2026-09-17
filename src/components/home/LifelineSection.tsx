import React from 'react';
import { Link } from '../../context/RouterContext';
import { ScrollReveal } from '../motion/ScrollReveal';
import { AnimatedCounter } from '../motion/AnimatedCounter';
import { LifeLineHeroLogoAnimation } from '../motion/LifeLineHeroLogoAnimation';
import {
  Droplet,
  HeartPulse,
  Search,
  ShieldAlert,
  Users,
  UserCheck,
  Heart,
  Phone,
  ArrowRight
} from 'lucide-react';

interface LifelineSectionProps {
  lifelineSection: any;
  bloodDonationSettings: any;
  totalRegisteredDonors: number;
  totalActiveDonors: number;
  totalLivesImpacted: number;
  isBn: boolean;
  tText: (value: any) => string;
}

export const LifelineSection: React.FC<LifelineSectionProps> = ({
  lifelineSection,
  bloodDonationSettings,
  totalRegisteredDonors,
  totalActiveDonors,
  totalLivesImpacted,
  isBn,
  tText
}) => {
  return (
    <section key="lifeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal effect="fade-up">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#02130D] via-[#062017] to-[#03150E] text-white p-6 sm:p-9 lg:p-12 border border-emerald-600/25 ring-1 ring-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          {/* 1. Ambient Emerald & Ruby Atmosphere + Subtle Dot Matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(#006A4E_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none animate-lifeline-glow" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-900/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
            {/* LEFT / PRIMARY VISUAL AREA: Brand Identity, Storytelling & CTAs */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left flex flex-col justify-center">
              {/* Eyebrow Badge: Emergency Blood Initiative */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-inner">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <Droplet className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-heartbeat" />
                  <span>
                    {tText(lifelineSection?.badge) || tText(bloodDonationSettings?.heroBadge) || (isBn ? 'ইনফিনিটি লাইফলাইন — জরুরি রক্তদান' : 'INFINITY LIFELINE — BLOOD INITIATIVE')}
                  </span>
                </div>
              </div>

              {/* Official Sub-brand Animated Logo */}
              <div className="flex items-center justify-center lg:justify-start py-0.5">
                <LifeLineHeroLogoAnimation
                  logoUrl={bloodDonationSettings?.wingLogoUrl || '/brand/Infinitylifeline-logo.svg'}
                  logoSize={440}
                  logoZoom={bloodDonationSettings?.wingLogoZoom || 1}
                  logoCrop={bloodDonationSettings?.wingLogoCrop || 'contain'}
                />
              </div>

              {/* Initiative Tagline (Single Crisp Line) */}
              <div className="text-center lg:text-left">
                <p className="text-xs sm:text-sm font-semibold text-emerald-200/90 tracking-wide flex items-center justify-center lg:justify-start gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                  <span>
                    {tText(lifelineSection?.subtitle) || tText(bloodDonationSettings?.heroSubtitle) || (
                      isBn
                        ? 'ইনফিনিটি বাংলাদেশ-এর একটি জরুরি মানবিক রক্তদান উদ্যোগ 🩸'
                        : 'An Emergency Blood Donation Initiative by Infinity Bangladesh 🩸'
                    )}
                  </span>
                </p>
              </div>

              {/* 3 Action CTA Buttons (Single Elegant Row on Desktop) */}
              <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                {/* PRIMARY: Find a Donor */}
                <Link
                  to={lifelineSection?.findDonorBtnUrl || "blood-donation/find-donor"}
                  className="px-4.5 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_25px_rgba(225,29,72,0.6)] transform hover:-translate-y-0.5 active:scale-98 min-h-[44px] shrink-0 transition-all duration-200"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{tText(lifelineSection?.findDonorBtnText) || (isBn ? 'রক্তদাতা খুঁজুন' : 'Find a Donor')}</span>
                </Link>

                {/* SECONDARY: Become a Blood Donor */}
                <Link
                  to={lifelineSection?.becomeDonorBtnUrl || "blood-donation/become-donor"}
                  className="px-4.5 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-[#006A4E] to-[#008763] hover:from-[#007A5A] hover:to-[#009970] text-white border border-emerald-400/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,106,78,0.35)] hover:shadow-[0_6px_25px_rgba(0,106,78,0.5)] transform hover:-translate-y-0.5 active:scale-98 min-h-[44px] transition-all duration-200 shrink-0"
                >
                  <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300 fill-rose-300" />
                  <span>{tText(lifelineSection?.becomeDonorBtnText) || (isBn ? 'রক্তদাতা হোন' : 'Become a Blood Donor')}</span>
                </Link>

                {/* TERTIARY: Emergency Request */}
                <Link
                  to={lifelineSection?.emergencyReqBtnUrl || "blood-donation/emergency-request"}
                  className="px-4 sm:px-4.5 py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 border border-rose-600/40 hover:border-rose-400 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] shadow-sm transform hover:-translate-y-0.5 active:scale-98 shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                  <span>{tText(lifelineSection?.emergencyReqBtnText) || (isBn ? 'জরুরি আবেদন' : 'Emergency Request')}</span>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Refined Live Coordination Panel */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-[2rem] bg-[#051B13]/90 border border-emerald-500/25 p-5 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 backdrop-blur-xl shadow-2xl hover:border-emerald-400/40 transition-all duration-300">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      {tText(lifelineSection?.coordinationTitle) || (isBn ? 'লাইভ রক্তদান সমন্বয় নেটওয়ার্ক' : 'Live Coordination Network')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 tracking-wider">
                    {tText(lifelineSection?.coordinationBadge) || (isBn ? 'সক্রিয়' : 'LIVE')}
                  </span>
                </div>

                {/* 4 Real Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* 1. Total Registered Donors */}
                  <div className="p-3.5 rounded-2xl bg-[#07241A]/90 border border-emerald-600/25 text-center flex flex-col items-center justify-center gap-1 hover:border-emerald-400/50 hover:bg-[#0A2E22] transform hover:-translate-y-1 transition-all duration-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      <AnimatedCounter value={totalRegisteredDonors} />+
                    </p>
                    <p className="text-[11px] font-medium text-emerald-200/80">
                      {tText(bloodDonationSettings?.statTotalDonorsLabel) || (isBn ? 'নিবন্ধিত রক্তদাতা' : 'Registered Donors')}
                    </p>
                  </div>

                  {/* 2. Active Emergency Donors */}
                  <div className="p-3.5 rounded-2xl bg-[#07241A]/90 border border-emerald-600/25 text-center flex flex-col items-center justify-center gap-1 hover:border-emerald-400/50 hover:bg-[#0A2E22] transform hover:-translate-y-1 transition-all duration-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      <AnimatedCounter value={totalActiveDonors} />+
                    </p>
                    <p className="text-[11px] font-medium text-emerald-200/80">
                      {tText(bloodDonationSettings?.statActiveDonorsLabel) || (isBn ? 'জরুরিতে প্রস্তুত' : 'Ready Donors')}
                    </p>
                  </div>

                  {/* 3. Blood Groups Covered */}
                  <div className="p-3.5 rounded-2xl bg-[#0A1F1B]/90 border border-rose-800/25 text-center flex flex-col items-center justify-center gap-1 hover:border-rose-500/40 hover:bg-[#122722] transform hover:-translate-y-1 transition-all duration-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      {bloodDonationSettings?.statGroupsValue || '8/8'}
                    </p>
                    <p className="text-[11px] font-medium text-rose-200/80">
                      {tText(bloodDonationSettings?.statGroupsLabel) || (isBn ? 'সকল ব্লাড গ্রুপ' : 'Blood Groups')}
                    </p>
                  </div>

                  {/* 4. Lives Impacted */}
                  <div className="p-3.5 rounded-2xl bg-[#0A1F1B]/90 border border-amber-700/25 text-center flex flex-col items-center justify-center gap-1 hover:border-amber-400/40 hover:bg-[#122722] transform hover:-translate-y-1 transition-all duration-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-amber-300 font-display">
                      <AnimatedCounter value={`${totalLivesImpacted}+`} />
                    </p>
                    <p className="text-[11px] font-medium text-amber-200/80">
                      {tText(bloodDonationSettings?.statImpactLabel) || (isBn ? 'রক্তদান সম্পন্ন' : 'Lives Impacted')}
                    </p>
                  </div>
                </div>

                {/* 24/7 Helpline Bar */}
                {bloodDonationSettings?.emergencyHelpline && (
                  <div className="p-3.5 rounded-2xl bg-[#041610] border border-emerald-600/30 flex items-center justify-between text-xs text-slate-300 shadow-inner">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span className="text-emerald-100/90 font-medium">{isBn ? '২৪/৭ জরুরি হেল্পলাইন:' : '24/7 Helpline:'}</span>
                    </div>
                    <a
                      href={`tel:${bloodDonationSettings.emergencyHelpline.replace(/[^0-9+]/g, '')}`}
                      className="font-bold text-emerald-300 hover:text-white font-mono tracking-wide transition-colors flex items-center gap-1"
                    >
                      <span>{bloodDonationSettings.emergencyHelpline}</span>
                    </a>
                  </div>
                )}

                {/* Gateway Footnote link to full Blood Donation experience */}
                <div className="pt-0.5 text-center">
                  <Link
                    to={lifelineSection?.portalUrl || "blood-donation"}
                    className="group text-xs text-emerald-300/90 hover:text-emerald-100 font-semibold inline-flex items-center gap-1.5 transition-all duration-200"
                  >
                    <span>{tText(lifelineSection?.portalLinkText) || (isBn ? 'সম্পূর্ণ রক্তদান কার্যক্রম ও নির্দেশিকা দেখুন' : 'Explore Full LifeLine Portal & Guidelines')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
