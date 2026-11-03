import React from 'react';
import { motion } from 'motion/react';
import { Program } from '../../types';
import { Link } from '../../context/RouterContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import { spring } from '../../lib/motion/tokens';

interface ProgramsSectionProps {
  programs: Program[];
  programsSection: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  programsSection,
  isBn,
  tText
}) => {
  return (
    <section key="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] p-5 sm:p-7 shadow-warm-xs flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7]">
            <BookOpen className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{tText(programsSection?.badge) || (isBn ? 'স্থায়ী কার্যক্রম ও ইভেন্ট' : 'Flagship Initiatives')}</span>
          </div>
          <h3 className="text-base sm:text-xl font-extrabold text-slate-900 font-display font-bengali tracking-tight">
            {tText(programsSection?.title) || (isBn ? 'ধারাবাহিক মানবিক কর্মসূচি ও ইভেন্ট' : 'Sustainable Humanitarian Initiatives')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 font-bengali max-w-xl leading-relaxed">
            {tText(programsSection?.subtitle) || (
              isBn
                ? 'সুবিধাবঞ্চিত শিশুদের শিক্ষা উপকরণ, নিয়মিত খাদ্য ও শীতবস্ত্র কর্মসূচির পূর্ণাঙ্গ তালিকা।'
                : 'Seasonal relief, education aid, and community welfare programs.'
            )}
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={spring.snappy}
          className="shrink-0 w-full sm:w-auto"
        >
          <Link
            to={programsSection?.viewAllUrl || "programs"}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-3.5 rounded-xl bg-white hover:bg-[#006A4E] text-slate-800 hover:text-white border border-[#EAE3D9] hover:border-[#006A4E] text-xs sm:text-sm font-bold shadow-2xs hover:shadow-warm-xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{tText(programsSection?.viewAllText) || (isBn ? 'সকল স্থায়ী কর্মসূচি দেখুন' : 'Explore All Programs')}</span>
            <ArrowRight className="w-4 h-4 text-[#006A4E] group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
