import React from 'react';
import { ImpactStory } from '../../types';
import { Link } from '../../context/RouterContext';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { StoryCard } from '../StoryCard';
import { ArrowRight } from 'lucide-react';

interface StoriesSectionProps {
  stories: ImpactStory[];
  storiesSection: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  storiesSection,
  isBn,
  tText
}) => {
  return (
    <section key="stories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        badge={tText(storiesSection?.badge) || (isBn ? 'মানবিক দলিল' : 'Human Dignity')}
        title={tText(storiesSection?.title) || (isBn ? 'বাস্তব জীবনের রূপান্তরের গল্প' : 'Stories of Hope & Grassroots Change')}
        subtitle={
          tText(storiesSection?.subtitle) || (
            isBn
              ? 'সম্মতি ও আত্মমর্যাদা বজায় রেখে সংকলিত বাস্তব ঘটনার প্রামাণ্য বিবরণ।'
              : 'Authentic accounts of community impact documented with verified beneficiary consent.'
          )
        }
      />

      <StaggerGroup className="flex flex-wrap justify-center gap-8">
        {stories.map((story) => (
          <StaggerItem key={story.id} className="w-full md:w-[calc(50%-1rem)] max-w-lg flex">
            <StoryCard story={story} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="text-center pt-8">
        <Link
          to={storiesSection?.viewAllUrl || "stories"}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 text-xs sm:text-sm font-bold border border-[#EAE3D9] shadow-warm-xs transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{tText(storiesSection?.viewAllText) || (isBn ? 'সকল গল্প পড়ুন' : 'Read All Human Stories')}</span>
          <ArrowRight className="w-4 h-4 text-[#006A4E]" />
        </Link>
      </div>
    </section>
  );
};
