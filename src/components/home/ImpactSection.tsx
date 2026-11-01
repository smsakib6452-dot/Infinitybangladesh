import React, { useMemo } from 'react';
import { ImpactMetric } from '../../types';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { ImpactCounter } from '../ImpactCounter';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ImpactSectionProps {
  metrics: ImpactMetric[];
  impactSection: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const ImpactSection: React.FC<ImpactSectionProps> = ({
  metrics,
  impactSection,
  isBn,
  tText
}) => {
  // Dynamically balance grid columns based on active metrics count to eliminate empty grid holes
  const gridClasses = useMemo(() => {
    if (metrics.length === 1) return 'grid grid-cols-1 max-w-md mx-auto';
    if (metrics.length === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto';
    if (metrics.length === 3) return 'grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto';
    return 'grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 max-w-6xl mx-auto';
  }, [metrics.length]);

  return (
    <section key="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        badge={tText(impactSection?.badge) || (isBn ? 'আমাদের মাঠপর্যায়ের বিস্তৃতি' : 'Verified Groundwork')}
        title={tText(impactSection?.title) || (isBn ? 'পরিসংখ্যান ও মানবিক প্রভাব' : 'Our Measured Impact Across Communities')}
        subtitle={
          tText(impactSection?.subtitle) || (
            isBn
              ? 'সকল সংখ্যা ও তথ্য সততা ও নিরপেক্ষতার সাথে যাচাইকৃত।'
              : 'Ground-level metrics verified by Team Infinity audits across communities.'
          )
        }
      />

      <StaggerGroup className={gridClasses}>
        {metrics.map((m) => (
          <StaggerItem key={m.id} className="flex h-full w-full">
            <ImpactCounter metric={m} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* 100% Charity Integrity Assurance Strip */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 rounded-2xl bg-white border border-[#EAE3D9] text-[#00523C] text-xs font-bold shadow-2xs">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
            {isBn ? '১০০% চ্যারিটি নীতি' : '100% Charity Model'}
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-700">{isBn ? '০% প্রশাসনিক কর্তন' : 'Zero Administrative Cuts'}</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-700">{isBn ? 'সম্পূর্ণ উন্মুক্ত ও নিরীক্ষিত স্বচ্ছতা' : '100% Audited Transparency'}</span>
        </div>
      </div>
    </section>
  );
};
