import React from 'react';
import { ImpactMetric } from '../../types';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { ImpactCounter } from '../ImpactCounter';

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

      <StaggerGroup className="flex flex-wrap justify-center gap-5 sm:gap-6">
        {metrics.map((m) => (
          <StaggerItem key={m.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.15rem)] max-w-xs flex">
            <ImpactCounter metric={m} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
};
