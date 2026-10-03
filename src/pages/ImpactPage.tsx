import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { ImpactCounter } from '../components/ImpactCounter';
import { StoryCard } from '../components/StoryCard';
import { VerifiedOrganizationPledge } from '../components/OfficialInfoBadge';
import { ArrowLeft, ShieldCheck, Heart, MapPin, Sparkles } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const { isBn } = useLanguage();
  const { metrics, stories } = useData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14 sm:space-y-16">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'বাস্তব পরিবর্তন ও মূল্যায়ন' : 'Measurable Change'}
          title={isBn ? 'আমাদের কাজের প্রভাব ও পরিসংখ্যান' : 'Our Measured Community Impact'}
          subtitle={
            isBn
              ? 'প্রতিটি সংখ্যা মানুষের হাসির প্রতীক। সততা এবং মাঠপর্যায়ের হিসাবের ভিত্তিতে সংগৃহীত তথ্যাবলী।'
              : 'Explore the verified impact numbers and authentic stories of change across communities in Bangladesh.'
          }
        />
      </ScrollReveal>

      {/* Metrics Grid */}
      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {metrics.map(m => (
          <StaggerItem key={m.id} className="w-full flex h-full">
            <ImpactCounter key={m.id} metric={m} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Verified Org Pledge */}
      <ScrollReveal effect="fade-up" delay={0.1}>
        <VerifiedOrganizationPledge />
      </ScrollReveal>

      {/* Human Stories Section */}
      <div className="space-y-8 pt-4">
        <ScrollReveal effect="fade-up" className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00523C] bg-[#E6F3EF] px-3.5 py-1 rounded-full border border-[#C2E2D7]">
            {isBn ? 'মানবিক দলিল' : 'Human Stories'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
            {isBn ? 'বাস্তব জীবনের অমলিন গল্প' : 'Stories of Hope and Transformation'}
          </h2>
          <p className="text-sm text-slate-600">
            {isBn
              ? 'ব্যক্তির আত্মসম্মান ও সম্মতি রক্ষা করে সংকলিত বাস্তব অভিজ্ঞতা।'
              : 'True narratives of dignity, relief, and hope documented with strict beneficiary consent.'}
          </p>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {stories.map(story => (
            <StaggerItem key={story.id} className="w-full flex h-full">
              <StoryCard story={story} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
};

export const StoryDetailPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { currentSlug } = useRouter();
  const { stories } = useData();

  const story = stories.find(s => s.slug === currentSlug) || stories[0];

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 font-display">
          {isBn ? 'গল্পটি পাওয়া যায়নি' : 'Story Not Found'}
        </h2>
        <Link
          to="stories"
          className="px-5 py-2.5 bg-[#006A4E] text-white rounded-2xl text-sm font-bold cursor-pointer inline-block"
        >
          {isBn ? 'গল্পের তালিকায় ফিরে যান' : 'Back to Stories'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Back button */}
      <Link
        to="stories"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#006A4E] hover:text-[#00523C] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'সকল গল্পে ফিরে যান' : 'Back to Stories & Impact'}</span>
      </Link>

      {/* Header */}
      <ScrollReveal effect="fade-up" className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-[#006A4E] font-bold">
            <MapPin className="w-3.5 h-3.5" />
            {tText(story.location)}
          </span>
          <span>&bull;</span>
          <span>{story.date}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          {tText(story.title)}
        </h1>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F3EF] text-[#00523C] text-xs font-bold border border-[#C2E2D7]">
          <span>{tText(story.personOrCommunity)}</span>
        </div>
      </ScrollReveal>

      {/* Image with Consent Badge */}
      <ScrollReveal effect="fade-up" delay={0.1}>
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-warm-xl border-4 border-white aspect-16/9 bg-slate-100">
        <img
          src={story.imageUrl}
          alt={tText(story.title)}
          className="w-full h-full object-cover"
        />
        {story.consentConfirmed && (
          <div className="absolute bottom-4 right-4 bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? 'সম্মতি নিশ্চিতকৃত' : 'Consent Verified'}</span>
          </div>
        )}
      </div>
      </ScrollReveal>

      {/* Story Content */}
      <ScrollReveal effect="fade-up" delay={0.2} className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-10 space-y-6 shadow-warm-sm">
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
          <p>{tText(story.story)}</p>
        </div>

        {/* Impact Box */}
        <div className="p-5 sm:p-6 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] space-y-2">
          <span className="text-xs font-bold text-[#006A4E] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {isBn ? 'বাস্তব প্রভাব ও পরিবর্তন' : 'Documented Impact'}
          </span>
          <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
            {tText(story.impact)}
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};
