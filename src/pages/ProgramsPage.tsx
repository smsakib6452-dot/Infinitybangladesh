import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { ProgramCard } from '../components/ProgramCard';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';

export const ProgramsPage: React.FC = () => {
  const { isBn } = useLanguage();
  const { programs } = useData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'স্থায়ী ও মৌসুমী উদ্যোগ' : 'Core Humanitarian Initiatives'}
          title={isBn ? 'আমাদের মানবিক কার্যক্রমসমূহ' : 'Our Programs & Focus Areas'}
          subtitle={
            isBn
              ? 'সুবিধাবঞ্চিত শিশু, অসহায় পরিবার এবং প্রান্তিক জনগোষ্ঠীর টেকসই সুরক্ষায় টিম ইনফিনিটির মূল কার্যক্রম।'
              : 'Explore the strategic programs of Infinity Bangladesh designed to bring lasting relief, education, and dignity.'
          }
        />
      </ScrollReveal>

      <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {programs.map(p => (
          <StaggerItem key={p.id} className="h-full flex">
            <ProgramCard program={p} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
};
