import React from 'react';
import { Campaign } from '../../types';
import { Link } from '../../context/RouterContext';
import { SectionHeading } from '../SectionHeading';
import { ScrollReveal } from '../motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { CampaignCard } from '../CampaignCard';
import { OptimizedImage } from '../OptimizedImage';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-[2.5rem] border border-[#EAE3D9] p-6 sm:p-8 lg:p-10 shadow-warm-md">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006A4E] text-xs font-extrabold border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{tText(campaignsSection?.featuredBadgeText) || (isBn ? 'বিশেষ ফিচার্ড ক্যাম্পেইন' : 'Featured Campaign')}</span>
                </div>

                <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-display">
                  {tText(featuredCampaign.title)}
                </h3>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {tText(featuredCampaign.description)}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to={campaignsSection?.featuredDetailsUrl || "campaigns/detail"}
                    slug={featuredCampaign.slug}
                    className="px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs sm:text-sm font-bold shadow-warm-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{tText(campaignsSection?.featuredDetailsText) || (isBn ? 'ক্যাম্পেইন বিবরণ দেখুন' : 'View Campaign Details')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={campaignsSection?.featuredSupportUrl || "donate"}
                    className="px-6 py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-xs sm:text-sm font-bold border border-[#EAE3D9] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{tText(campaignsSection?.featuredSupportText) || (isBn ? 'সহায়তা করুন' : 'Support Campaign')}</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-warm-md border-2 border-white aspect-16/10 bg-slate-100">
                <OptimizedImage
                  src={featuredCampaign.imageUrl}
                  alt={tText(featuredCampaign.title)}
                  width={700}
                  aspectRatio="16/10"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="w-full h-full object-cover"
                />
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
