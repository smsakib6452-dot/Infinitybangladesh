import React from 'react';
import { Link } from '../../context/RouterContext';
import { ScrollReveal } from '../motion/ScrollReveal';
import { OptimizedImage } from '../OptimizedImage';
import {
  Heart,
  Users,
  Play,
  MapPin,
  CheckCircle2,
  Sparkles,
  Award,
  ShieldCheck
} from 'lucide-react';

interface HeroSectionProps {
  hero: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, isBn, tText }) => {
  const rawDescription = tText(hero.description) || '';
  const cleanDescription = rawDescription.replace(/^["“'”]+|["“'”]+$/g, '').trim();

  const renderTrustIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle2':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-amber-700" />;
      case 'Heart':
        return <Heart className="w-3.5 h-3.5 text-rose-600" />;
      case 'Users':
        return <Users className="w-3.5 h-3.5 text-[#006A4E]" />;
      case 'Award':
        return <Award className="w-3.5 h-3.5 text-blue-600" />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />;
    }
  };

  return (
    <section key="hero" className="relative bg-[#FAF7F2] pt-5 sm:pt-12 lg:pt-16 pb-10 sm:pb-16 lg:pb-20 border-b border-[#EAE3D9]/70">
      {/* Subtle Organic Background Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-[#006A4E]/10 rounded-full blur-3xl" />
        <svg className="absolute right-0 top-1/4 w-72 h-72 text-[#EAE3D9]/60" viewBox="0 0 200 200" fill="none">
          <path d="M20,100 C60,20 140,20 180,100 C140,180 60,180 20,100 Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <ScrollReveal effect="slide-right" className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F3EF]/90 backdrop-blur-xs border border-[#C2E2D7] text-[#00523C] text-[11px] sm:text-sm font-extrabold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-pulse shrink-0" />
              <span className="tracking-wide">
                {tText(hero.eyebrow)}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.16] font-display">
              {tText(hero.headlineMain)}{' '}
              <span className="text-[#006A4E] relative inline-block">
                {tText(hero.headlineHighlight)}
                <svg className="absolute -bottom-1 left-0 w-full h-2.5 sm:h-3 text-[#D97706]/40 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0,15 Q50,0 100,15 L100,20 L0,20 Z" />
                </svg>
              </span>
            </h1>

            {/* Supporting Description - Compact & Punchy on Mobile */}
            <p className="text-xs sm:text-lg text-slate-600 leading-relaxed sm:leading-8 max-w-2xl font-normal line-clamp-3 sm:line-clamp-none">
              {cleanDescription}
            </p>

            {/* CTA Action Cluster - Side-by-side on mobile, zero robot overlap */}
            <div className="pt-1 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-center sm:gap-4">
              {hero.primaryCta?.active && (
                <Link
                  to={hero.primaryCta.url}
                  isExternal={hero.primaryCta.openInNewTab}
                  className="px-3 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#006A4E] hover:bg-[#00523C] active:bg-[#00402E] text-white text-xs sm:text-base font-extrabold shadow-warm-md hover:shadow-warm-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer transform hover:-translate-y-0.5 touch-min-btn text-center"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white shrink-0" />
                  <span className="truncate">{tText(hero.primaryCta.text)}</span>
                </Link>
              )}

              {hero.secondaryCta?.active && (
                <Link
                  to={hero.secondaryCta.url}
                  isExternal={hero.secondaryCta.openInNewTab}
                  className="px-2 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-[#FAF7F2] active:bg-[#F2ECE1] text-slate-800 text-[11.5px] sm:text-base font-bold border-2 border-[#D8CFC4] hover:border-[#006A4E] hover:text-[#006A4E] shadow-warm-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer transform hover:-translate-y-0.5 touch-min-btn text-center whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#006A4E] shrink-0" />
                  <span>{isBn ? (hero.secondaryCta.text?.bn || 'স্বেচ্ছাসেবী আবেদন') : 'Join as Volunteer'}</span>
                </Link>
              )}

              {hero.storyCta?.active && (
                <div className="col-span-2 sm:col-span-1 pt-0.5 sm:pt-0 flex justify-center sm:justify-start">
                  <Link
                    to={hero.storyCta.url}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#006A4E] px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E6F3EF] flex items-center justify-center text-[#006A4E]">
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                    </div>
                    <span>{tText(hero.storyCta.text)}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3 Hero Trust Indicators */}
            <div className="pt-4 sm:pt-7 border-t border-[#EAE3D9] grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs text-slate-700">
              {hero.trustIndicators?.filter((t: any) => t.active).map((indicator: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#EAE3D9] shadow-2xs hover:shadow-warm-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#E6F3EF] flex items-center justify-center shrink-0 border border-[#C2E2D7]/60 shadow-xs">
                    {renderTrustIcon(indicator.icon)}
                  </div>
                  <span className="font-bold text-slate-800 leading-snug text-[11px] sm:text-xs">{tText(indicator.text)}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right Column: Hero Real Photography Container */}
          <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="absolute -inset-3 bg-gradient-to-tr from-[#D97706]/20 via-[#006A4E]/15 to-transparent rounded-[2.5rem] blur-xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#D97706]/15 rounded-full blur-2xl" />

            {/* Hero Card Container */}
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-warm-xl border-4 border-white bg-[#0F221D]">
              <div className="relative w-full aspect-16/10 sm:aspect-5/4 lg:aspect-4/5 overflow-hidden">
                <OptimizedImage
                  src={hero.heroImageUrl}
                  alt={hero.heroImageAlt || 'Infinity Bangladesh Official Photo'}
                  cropPosition={hero.heroImageCropPosition || 'center center'}
                  className="w-full h-full object-cover"
                  priority
                  aspectRatio="4/3"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent pointer-events-none" />

                {/* Floating Established 2015 Badge */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/90 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl border border-white/70 flex items-center justify-between gap-3 transition-transform duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#004835] text-white flex items-center justify-center font-bold font-display text-sm shrink-0 shadow-md border border-white/20">
                      {hero.badgeYear || '2015'}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 font-display tracking-tight">
                        {tText(hero.badgeTitle) || (isBn ? `প্রতিষ্ঠিত ${hero.badgeYear || '২০১৫'}` : `Established ${hero.badgeYear || '2015'}`)}
                      </p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-[#006A4E] shrink-0" />
                        <span>{hero.badgeLocation || 'Hathazari, Chattogram'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7] shadow-xs">
                      {hero.badgeTag || 'Team Infinity'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
