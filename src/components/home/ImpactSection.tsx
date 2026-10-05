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

      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
        {metrics.map((m) => (
          <StaggerItem key={m.id} className="flex h-full w-full">
            <ImpactCounter metric={m} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
};
