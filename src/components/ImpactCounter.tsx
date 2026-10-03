import React from 'react';
import { ImpactMetric } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Users, HeartHandshake, Flag, Sparkles, Award, MapPin } from 'lucide-react';
import { AnimatedCounter } from './motion/AnimatedCounter';

const METRIC_ICONS: Record<string, React.ReactNode> = {
  Users: <Users className="w-6 h-6 text-[#006A4E]" />,
  HeartHandshake: <HeartHandshake className="w-6 h-6 text-[#006A4E]" />,
  Flag: <Flag className="w-6 h-6 text-[#006A4E]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#D97706]" />,
  Award: <Award className="w-6 h-6 text-[#006A4E]" />,
  MapPin: <MapPin className="w-6 h-6 text-[#006A4E]" />
};

interface ImpactCounterProps {
  metric: ImpactMetric;
}

export const ImpactCounter: React.FC<ImpactCounterProps> = ({ metric }) => {
  const { tText } = useLanguage();

  const icon = METRIC_ICONS[metric.iconName] || <Sparkles className="w-6 h-6 text-[#006A4E]" />;

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-[#EAE3D9] p-6 sm:p-7 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between items-center text-center space-y-4 relative overflow-hidden group w-full">
      {/* Decorative top accent */}
      <div className="w-14 h-1 bg-gradient-to-r from-[#006A4E] via-[#008562] to-[#D97706] rounded-full" />

      {/* Icon & Counter Body */}
      <div className="space-y-3 flex flex-col items-center w-full">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:border-[#006A4E]/40 transition-all duration-300">
          {icon}
        </div>

        {/* Number and Label */}
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            <AnimatedCounter value={metric.value} />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-[#006A4E] font-display">
            {tText(metric.label)}
          </h4>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
          {tText(metric.description)}
        </p>
      </div>

      {/* Verified Groundwork Marker */}
      <div className="pt-3 border-t border-[#EAE3D9]/60 w-full flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-pulse" />
        <span>Verified Groundwork</span>
      </div>
    </div>
  );
};
