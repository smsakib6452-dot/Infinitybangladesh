import React from 'react';
import { Program } from '../../types';
import { Link } from '../../context/RouterContext';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { ProgramCard } from '../ProgramCard';
import { ArrowRight } from 'lucide-react';

interface ProgramsSectionProps {
  programs: Program[];
  programsSection: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  programs,
  programsSection,
  isBn,
  tText
}) => {
  return (
    <section key="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        badge={tText(programsSection?.badge) || (isBn ? 'স্থায়ী কার্যক্রম' : 'Flagship Programs')}
        title={tText(programsSection?.title) || (isBn ? 'ধারাবাহিক মানবিক কর্মসূচি ও ইভেন্ট' : 'Sustainable Humanitarian Initiatives')}
        subtitle={
          tText(programsSection?.subtitle) || (
            isBn
              ? 'প্রতি বছর নিয়মিতভাবে আয়োজিত সুবিধাবঞ্চিত মানুষের ঈদ আনন্দ, শীতবস্ত্র ও জরুরি খাদ্য কর্মসূচি।'
              : 'Recurring seasonal programs providing dignified Eid gifts, winter protection, and relief.'
          )
        }
      />

      <StaggerGroup className="flex flex-wrap justify-center gap-6 sm:gap-8">
        {programs.slice(0, 3).map((program) => (
          <StaggerItem key={program.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-sm flex">
            <ProgramCard program={program} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="text-center pt-8">
        <Link
          to={programsSection?.viewAllUrl || "programs"}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 text-xs sm:text-sm font-bold border border-[#EAE3D9] shadow-warm-xs transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{tText(programsSection?.viewAllText) || (isBn ? 'সকল কর্মসূচি ও ইভেন্ট তালিকা দেখুন' : 'View All Programs & Events')}</span>
          <ArrowRight className="w-4 h-4 text-[#006A4E]" />
        </Link>
      </div>
    </section>
  );
};
