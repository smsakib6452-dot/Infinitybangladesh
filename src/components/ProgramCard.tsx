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
    <div className="group bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-7 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between hover:border-[#006A4E]/40 w-full h-full">
      <div className="space-y-4">
        {/* Icon & Category */}
        <div className="flex items-center justify-between">
          <Link
            to="programs/detail"
            slug={program.slug}
            className="w-13 h-13 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center group-hover:bg-[#006A4E] group-hover:text-white transition-all duration-300 shadow-xs"
          >
            {icon}
          </Link>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9]">
            {program.category}
          </span>
        </div>

        {/* Title */}
        <Link to="programs/detail" slug={program.slug} className="block group/title">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover/title:text-[#006A4E] transition-colors font-display">
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

      {/* Footer Action - Pinned uniformly to bottom */}
      <div className="pt-5 mt-auto border-t border-slate-100/80 flex items-center justify-between gap-3">
        <Link
          to="programs/detail"
          slug={program.slug}
          className="text-xs sm:text-sm font-bold text-[#006A4E] hover:text-[#00523C] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{isBn ? 'সম্পূর্ণ বিবরণ' : 'Explore Details'}</span>
          <ArrowRight className="w-4 h-4 group-arrow-hover" />
        </Link>

        <Link
          to="donate"
          className="px-3 py-1.5 rounded-xl bg-[#E6F3EF] hover:bg-[#006A4E] text-[#006A4E] hover:text-white transition-all inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
          title="Support this program"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>{isBn ? 'সহায়তা' : 'Support'}</span>
        </Link>
      </div>
    </div>
  );
};

