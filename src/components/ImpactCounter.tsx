import React from 'react';
import { ImpactMetric } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Users, HeartHandshake, Flag, Sparkles, Award, MapPin } from 'lucide-react';
import { AnimatedCounter } from './motion/AnimatedCounter';
import { SpotlightBentoCard } from './motion/SpotlightBentoCard';

const METRIC_ICONS: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#006A4E]" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-[#006A4E]" />,
  Flag: <Flag className="w-5 h-5 sm:w-6 sm:h-6 text-[#006A4E]" />,
  Sparkles: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#D97706]" />,
  Award: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#006A4E]" />,
  MapPin: <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#006A4E]" />
};

interface ImpactCounterProps {
  metric: ImpactMetric;
  isHero?: boolean;
}

export const ImpactCounter: React.FC<ImpactCounterProps> = ({ metric, isHero = false }) => {
  const { isBn, tText } = useLanguage();

  const icon = METRIC_ICONS[metric.iconName] || <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#006A4E]" />;

  if (isHero) {
    return (
      <SpotlightBentoCard
        glowColor="rgba(0, 106, 78, 0.22)"
        className="flex flex-col justify-between w-full h-full p-5 sm:p-7 lg:p-8 bg-gradient-to-br from-white via-[#F7FAF8] to-white border border-[#C2E2D7]/90 shadow-warm-xs hover:shadow-warm-md"
      >
        {/* Top Header Pill Row */}
        <div className="flex items-center justify-between gap-3 w-full mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EF] border border-[#C2E2D7] text-[#006A4E] text-xs font-extrabold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-pulse" />
            <span>{isBn ? 'প্রধান মানবিক প্রভাব' : 'Anchor Humanitarian Metric'}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium font-bengali">
            {isBn ? 'যাচাইকৃত পরিসংখ্যান' : '100% Verified'}
          </span>
        </div>

        {/* Hero Content Body: Horizontal Flex on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center my-auto">
          {/* Left: Icon & Expansive Counter */}
          <div className="sm:col-span-7 flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#006A4E]/60 transition-all duration-300">
              {React.cloneElement(icon as React.ReactElement<any>, {
                className: 'w-7 h-7 sm:w-8 sm:h-8 text-[#006A4E]'
              })}
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-display font-bengali leading-none">
                <AnimatedCounter value={metric.value} />
              </div>
              <h4 className="text-base sm:text-xl font-extrabold text-[#006A4E] font-display font-bengali leading-snug">
                {tText(metric.label)}
              </h4>
            </div>
          </div>

          {/* Right: Narrative Description & Trust Indicator */}
          <div className="sm:col-span-5 space-y-2 border-t sm:border-t-0 sm:border-l border-[#EAE3D9] pt-3 sm:pt-0 sm:pl-5 text-left">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bengali font-normal">
              {tText(metric.description)}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#006A4E] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isBn ? 'সরাসরি তৃণমূল পর্যায়ে সরবরাহকৃত' : 'Delivered directly to beneficiaries'}</span>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Accent Bar */}
        <div className="mt-4 sm:mt-5 w-full h-1 bg-gradient-to-r from-[#006A4E] via-[#008562] to-[#D97706]/70 rounded-full" />
      </SpotlightBentoCard>
    );
  }

  return (
    <SpotlightBentoCard
      glowColor="rgba(0, 106, 78, 0.15)"
      className="flex flex-col items-center text-center space-y-2.5 sm:space-y-4 w-full h-full p-4 sm:p-6"
    >
      {/* Decorative top accent */}
      <div className="w-8 sm:w-14 h-1 bg-gradient-to-r from-[#006A4E] via-[#008562] to-[#D97706] rounded-full mx-auto" />

      {/* Icon & Counter Body */}
      <div className="space-y-2 sm:space-y-3 flex flex-col items-center w-full my-auto">
        {/* Icon */}
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] shadow-xs flex items-center justify-center group-hover:scale-110 group-hover:border-[#006A4E]/50 group-hover:shadow-warm-sm transition-all duration-300">
          {icon}
        </div>

        {/* Number and Label */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="text-2.5xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display font-bengali leading-none">
            <AnimatedCounter value={metric.value} />
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-[#006A4E] font-display font-bengali leading-snug">
            {tText(metric.label)}
          </h4>
        </div>

        {/* Description - High contrast & legible Bangla typography */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xs font-bengali">
          {tText(metric.description)}
        </p>
      </div>
    </SpotlightBentoCard>
  );
};
