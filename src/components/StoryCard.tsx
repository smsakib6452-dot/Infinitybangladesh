import React from 'react';
import { ImpactStory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link } from '../context/RouterContext';
import { Heart, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface StoryCardProps {
  story: ImpactStory;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const { isBn, tText } = useLanguage();

  return (
    <div className="group bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-lg motion-card-hover transition-all duration-300 flex flex-col w-full">
      <Link
        to="stories/detail"
        slug={story.slug}
        className="block relative aspect-16/10 overflow-hidden bg-slate-100"
      >
        <OptimizedImage
          src={story.imageUrl}
          alt={tText(story.title)}
          className="w-full h-full object-cover motion-img-zoom"
          width={600}
          aspectRatio="16/10"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 backdrop-blur-xs shadow-xs border border-slate-200">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{tText(story.personOrCommunity)}</span>
        </div>

        <div className="absolute bottom-3 left-3 text-xs text-white/95 bg-slate-950/70 px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-300" />
          <span>{tText(story.location)}</span>
        </div>
      </Link>

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link to="stories/detail" slug={story.slug} className="block group/title">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover/title:text-[#006A4E] transition-colors line-clamp-2 font-display">
              {tText(story.title)}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {tText(story.story)}
          </p>
        </div>

        <div className="p-3.5 bg-[#E6F3EF] rounded-2xl border border-[#C2E2D7] text-xs text-[#00523C] space-y-1">
          <strong className="block font-bold">{isBn ? 'বাস্তব মানবিক প্রভাব:' : 'Verified Human Impact:'}</strong>
          <span className="line-clamp-2 leading-relaxed">{tText(story.impact)}</span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link
            to="stories/detail"
            slug={story.slug}
            className="text-xs sm:text-sm font-bold text-[#006A4E] hover:text-[#00523C] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isBn ? 'সম্পূর্ণ গল্প পড়ুন' : 'Read Full Story'}</span>
            <ArrowRight className="w-4 h-4 group-arrow-hover" />
          </Link>

          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />
            {isBn ? 'সম্মতিমূলক' : 'Consent-based'}
          </span>
        </div>
      </div>
    </div>
  );
};

