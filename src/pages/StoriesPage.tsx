import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useRouter, Link } from '../context/RouterContext';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { SocialShareModal } from '../components/SocialShareModal';
import { Heart, Sparkles, ShieldCheck, Share2, MapPin, Calendar, ArrowRight } from 'lucide-react';

export const StoriesPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { stories } = useData();

  const [shareStory, setShareStory] = useState<{ title: string; slug: string } | null>(null);

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header */}
        <ScrollReveal effect="fade-up" className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F3EF] border border-[#C2E2D7] rounded-full text-[#00523C] text-xs font-extrabold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>{isBn ? 'মানবিক দলিল ও বাস্তব গল্প' : 'Impact Stories & Human Realities'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
            {isBn ? 'প্রতিটি মানুষের মুখে হাসি ফোটানোর গল্প' : 'Stories of Dignity, Hope & Transformation'}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {isBn
              ? 'টিম ইনফিনিটির স্বেচ্ছাসেবী কার্যক্রম কীভাবে প্রান্তিক মানুষের জীবনে ইতিবাচক প্রভাব ফেলেছে তার সত্য ও মর্যাদাপূর্ণ বিবরণ।'
              : 'Authentic accounts of change across communities in Bangladesh, documented with strict beneficiary consent and human dignity.'}
          </p>
        </ScrollReveal>

        {/* Stories Grid */}
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {stories.map((story) => (
            <StaggerItem
              key={story.id}
              className="h-full flex"
            >
              <div className="bg-white rounded-[2.5rem] border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between group h-full w-full">
                <div>
                  {/* Photo with Consent Badge */}
                  <Link
                    to="stories/detail"
                    slug={story.slug}
                    className="block relative aspect-16/9 bg-slate-900 overflow-hidden shrink-0"
                  >
                    <img
                      src={story.imageUrl}
                      alt={tText(story.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-md text-emerald-300 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tText(story.location)}</span>
                    </div>
                    {story.consentConfirmed && (
                      <div className="absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isBn ? 'সম্মতি নিশ্চিতকৃত' : 'Consent Verified'}</span>
                      </div>
                    )}
                  </Link>

                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-extrabold text-[#00523C] bg-[#E6F3EF] px-3 py-1 rounded-full border border-[#C2E2D7]">
                        {tText(story.personOrCommunity)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {story.date}
                      </span>
                    </div>

                    <Link to="stories/detail" slug={story.slug} className="block group/title">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover/title:text-[#006A4E] transition-colors leading-snug font-display">
                        {tText(story.title)}
                      </h2>
                    </Link>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {tText(story.story)}
                    </p>

                    <div className="bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl p-4 space-y-1">
                      <span className="text-xs font-bold text-[#006A4E] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {isBn ? 'বাস্তব প্রভাব ও পরিবর্তন' : 'Measured Impact'}
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {tText(story.impact)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions - Pinned */}
                <div className="p-6 sm:p-8 pt-4 flex items-center justify-between border-t border-slate-100 mt-auto">
                  <Link
                    to="stories/detail"
                    slug={story.slug}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#006A4E] hover:text-[#00523C] transition-colors cursor-pointer"
                  >
                    <span>{isBn ? 'সম্পূর্ণ গল্প পড়ুন' : 'Read Full Story'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShareStory({ title: tText(story.title), slug: story.slug })}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Share Modal */}
        {shareStory && (
          <SocialShareModal
            isOpen={!!shareStory}
            onClose={() => setShareStory(null)}
            title={shareStory.title}
            path={`stories/${shareStory.slug}`}
          />
        )}
      </div>
    </div>
  );
};
