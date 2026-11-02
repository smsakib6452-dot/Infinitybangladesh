import React from 'react';
import { Program } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link } from '../context/RouterContext';
import {
  Gift,
  Utensils,
  Sun,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Heart
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Gift: <Gift className="w-6 h-6" />,
  Utensils: <Utensils className="w-6 h-6" />,
  Sun: <Sun className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />
};

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const { isBn, tText } = useLanguage();

  const icon = ICON_MAP[program.iconName] || <Sparkles className="w-6 h-6" />;

  return (
    <div className="group bg-white rounded-3xl border border-[#EAE3D9] p-4.5 sm:p-7 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between hover:border-[#006A4E]/40 w-full h-full">
      <div className="space-y-3.5 sm:space-y-4">
        {/* Icon & Category */}
        <div className="flex items-center justify-between">
          <Link
            to="programs/detail"
            slug={program.slug}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center group-hover:bg-[#006A4E] group-hover:text-white transition-all duration-300 shadow-xs"
          >
            {icon}
          </Link>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9]">
            {program.category}
          </span>
        </div>

        {/* Title */}
        <Link to="programs/detail" slug={program.slug} className="block group/title">
          <h3 className="text-base sm:text-xl font-extrabold text-slate-900 group-hover/title:text-[#006A4E] transition-colors font-display leading-snug">
            {tText(program.title)}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
          {tText(program.shortDescription)}
        </p>

        {/* Highlights bullets */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          {(isBn ? program.impactHighlights.bn : program.impactHighlights.en).slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006A4E] mt-1.5 shrink-0" />
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action - Confident Single Primary Action Bar */}
      <div className="pt-4 mt-auto border-t border-slate-100/80 flex items-center">
        <Link
          to="programs/detail"
          slug={program.slug}
          className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#006A4E] text-slate-800 hover:text-white border border-[#EAE3D9] hover:border-[#006A4E] transition-all text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer group/btn shadow-2xs hover:shadow-xs"
        >
          <span>{isBn ? 'কর্মসূচির বিস্তারিত ও প্রভাব' : 'Explore Program & Impact'}</span>
          <ArrowRight className="w-4 h-4 text-[#006A4E] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};

