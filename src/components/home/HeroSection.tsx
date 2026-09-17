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
    <section key="hero" className="relative bg-[#FAF7F2] pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 border-b border-[#EAE3D9]/70">
      {/* Subtle Organic Background Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-[#006A4E]/10 rounded-full blur-3xl" />
        <svg className="absolute right-0 top-1/4 w-72 h-72 text-[#EAE3D9]/60" viewBox="0 0 200 200" fill="none">
          <path d="M20,100 C60,20 140,20 180,100 C140,180 60,180 20,100 Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <ScrollReveal effect="slide-right" className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F3EF] border border-[#C2E2D7] text-[#00523C] text-xs sm:text-sm font-extrabold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-pulse" />
              <span className="tracking-wide">
                {tText(hero.eyebrow)}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] font-display">
              {tText(hero.headlineMain)}{' '}
              <span className="text-[#006A4E] relative inline-block">
                {tText(hero.headlineHighlight)}
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#D97706]/40 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0,15 Q50,0 100,15 L100,20 L0,20 Z" />
                </svg>
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-normal">
              {tText(hero.description)}
            </p>

            {/* CTA Action Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              {hero.primaryCta?.active && (
                <Link
                  to={hero.primaryCta.url}
                  isExternal={hero.primaryCta.openInNewTab}
                  className="px-6 sm:px-7 py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] active:bg-[#00402E] text-white text-sm sm:text-base font-extrabold shadow-warm-md hover:shadow-warm-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 touch-min-btn"
                >
                  <Heart className="w-5 h-5 fill-white text-white" />
                  <span>{tText(hero.primaryCta.text)}</span>
                </Link>
              )}

              {hero.secondaryCta?.active && (
                <Link
                  to={hero.secondaryCta.url}
                  isExternal={hero.secondaryCta.openInNewTab}
                  className="px-6 sm:px-7 py-3.5 rounded-2xl bg-white hover:bg-[#FAF7F2] active:bg-[#F2ECE1] text-slate-800 text-sm sm:text-base font-bold border-2 border-[#D8CFC4] hover:border-[#006A4E] hover:text-[#006A4E] shadow-warm-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 touch-min-btn"
                >
                  <Users className="w-5 h-5 text-[#006A4E]" />
                  <span>{tText(hero.secondaryCta.text)}</span>
                </Link>
              )}

              {hero.storyCta?.active && (
                <Link
                  to={hero.storyCta.url}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#006A4E] px-3 py-2 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E6F3EF] flex items-center justify-center text-[#006A4E]">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <span>{tText(hero.storyCta.text)}</span>
                </Link>
              )}
            </div>

            {/* 3 Hero Trust Indicators */}
            <div className="pt-6 sm:pt-7 border-t border-[#EAE3D9] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs text-slate-700">
              {hero.trustIndicators?.filter((t: any) => t.active).map((indicator: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-[#EAE3D9]/80 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#E6F3EF] flex items-center justify-center shrink-0">
                    {renderTrustIcon(indicator.icon)}
                  </div>
                  <span className="font-bold">{tText(indicator.text)}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right Column: Hero Real Photography Container */}
          <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="absolute -inset-3 bg-gradient-to-tr from-[#D97706]/20 via-[#006A4E]/15 to-transparent rounded-[2.5rem] blur-xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#D97706]/15 rounded-full blur-2xl" />

            {/* Hero Card Container */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-warm-xl border-4 border-white bg-[#0F221D]">
              <div className="relative w-full aspect-4/3 sm:aspect-5/4 lg:aspect-4/5 overflow-hidden">
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
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-warm-lg border border-[#EAE3D9] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006A4E] text-white flex items-center justify-center font-bold font-display text-sm shrink-0 shadow-xs">
                      {hero.badgeYear || '2015'}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 font-display">
                        {tText(hero.badgeTitle) || (isBn ? `প্রতিষ্ঠিত ${hero.badgeYear || '২০১৫'}` : `Established ${hero.badgeYear || '2015'}`)}
                      </p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-[#006A4E]" />
                        <span>{hero.badgeLocation || 'Hathazari, Chattogram'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
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
