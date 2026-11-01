import React, { useMemo } from 'react';
import { Campaign } from '../../types';
import { Link } from '../../context/RouterContext';
import { SectionHeading } from '../SectionHeading';
import { ScrollReveal } from '../motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { CampaignCard } from '../CampaignCard';
import { OptimizedImage } from '../OptimizedImage';
import { Sparkles, ArrowRight, Heart, Users, MapPin } from 'lucide-react';

interface CampaignsSectionProps {
  featuredCampaign?: Campaign;
  otherCampaigns: Campaign[];
  campaignsSection: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const CampaignsSection: React.FC<CampaignsSectionProps> = ({
  featuredCampaign,
  otherCampaigns,
  campaignsSection,
  isBn,
  tText
}) => {
  // Prevent duplicate photo repetition with Hero section
  const campaignImage = useMemo(() => {
    if (!featuredCampaign?.imageUrl || featuredCampaign.imageUrl === '/images/infinity-cover-hero.jpg') {
      return 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80';
    }
    return featuredCampaign.imageUrl;
  }, [featuredCampaign?.imageUrl]);

  return (
    <section key="campaigns" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        badge={tText(campaignsSection?.badge) || (isBn ? 'মাঠপর্যায়ের ক্যাম্পেইন' : 'Active Field Drives')}
        title={tText(campaignsSection?.title) || (isBn ? 'চলমান মানবিক ক্যাম্পেইন ও সেবা' : 'Ongoing Relief Drives & Campaigns')}
        subtitle={
          tText(campaignsSection?.subtitle) || (
            isBn
              ? 'জরুরি মুহূর্ত ও ক্রান্তিলগ্নে সুবিধাবঞ্চিত অসহায় মানুষের পাশে আমাদের বিশেষ কর্মসূচি।'
              : 'Targeted emergency drives reaching marginalized families and vulnerable communities.'
          )
        }
      />

      <div className="space-y-8">
        {featuredCampaign && (
          <ScrollReveal effect="fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center bg-white rounded-3xl sm:rounded-[2.5rem] border border-[#EAE3D9] p-4.5 sm:p-8 lg:p-10 shadow-[0_12px_40px_-15px_rgba(0,106,78,0.08)]">
              <div className="lg:col-span-6 space-y-3 sm:space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-[#006A4E] text-[11px] sm:text-xs font-extrabold border border-emerald-200 shadow-2xs">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                  <span>{tText(campaignsSection?.featuredBadgeText) || (isBn ? 'বিশেষ ফিচার্ড ক্যাম্পেইন' : 'Featured Campaign')}</span>
                </div>

                <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-display leading-snug sm:leading-tight">
                  {tText(featuredCampaign.title)}
                </h3>

                <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-normal">
                  {tText(featuredCampaign.description)}
                </p>

                {/* Micro Meta Strip */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 font-medium">
                  {featuredCampaign.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>{tText(featuredCampaign.location)}</span>
                    </span>
                  )}
                  {featuredCampaign.beneficiariesCount && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>{featuredCampaign.beneficiariesCount} {isBn ? 'জন উপকৃত' : 'beneficiaries'}</span>
                    </span>
                  )}
                </div>

                <div className="pt-2 sm:pt-3 flex flex-row items-center gap-2 sm:gap-3">
                  <Link
                    to={campaignsSection?.featuredDetailsUrl || "campaigns/detail"}
                    slug={featuredCampaign.slug}
                    className="flex-1 sm:flex-initial px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-[11px] sm:text-sm font-bold shadow-warm-xs hover:shadow-warm-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center"
                  >
                    <span className="truncate">{tText(campaignsSection?.featuredDetailsText) || (isBn ? 'বিস্তারিত দেখুন' : 'View Details')}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>

                  <Link
                    to={campaignsSection?.featuredSupportUrl || "donate"}
                    className="flex-1 sm:flex-initial px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-[11px] sm:text-sm font-bold border border-[#EAE3D9] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center whitespace-nowrap"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                    <span className="truncate">{tText(campaignsSection?.featuredSupportText) || (isBn ? 'অনুদান দিন' : 'Donate Now')}</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-warm-xl border-4 border-white aspect-16/10 bg-slate-900 relative">
                <OptimizedImage
                  src={campaignImage}
                  alt={tText(featuredCampaign.title)}
                  width={700}
                  aspectRatio="16/10"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Category Badge Pill on image */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {featuredCampaign.category || (isBn ? 'মানবিক ক্যাম্পেইন' : 'Relief Drive')}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {otherCampaigns.length > 0 && (
          <StaggerGroup className="flex flex-wrap justify-center gap-6 pt-4">
            {otherCampaigns.map((c) => (
              <StaggerItem key={c.id} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm flex">
                <CampaignCard campaign={c} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
};
