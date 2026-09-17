import React from 'react';
import { Campaign } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link } from '../context/RouterContext';
import { MapPin, Calendar, ArrowRight, Heart } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, featured = false }) => {
  const { isBn, tText } = useLanguage();

  const statusColors = {
    active: 'bg-[#E6F3EF] text-[#00523C] border-[#C2E2D7]',
    upcoming: 'bg-amber-50 text-amber-800 border-amber-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const statusLabels = {
    active: isBn ? 'চলমান' : 'Active',
    upcoming: isBn ? 'আসন্ন' : 'Upcoming',
    completed: isBn ? 'সম্পন্ন' : 'Completed'
  };

  return (
    <div
      className={`group bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-lg motion-card-hover transition-all duration-300 flex flex-col w-full ${
        featured ? 'ring-2 ring-[#006A4E]/30' : ''
      }`}
    >
      {/* Campaign Image Link */}
      <Link
        to="campaigns/detail"
        slug={campaign.slug}
        className="block relative aspect-16/10 overflow-hidden bg-slate-100"
      >
        <OptimizedImage
          src={campaign.imageUrl}
          alt={tText(campaign.title)}
          className="w-full h-full object-cover motion-img-zoom"
          width={600}
          aspectRatio="16/10"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Status Badge & Category */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-xs ${
              statusColors[campaign.status]
            }`}
          >
            {statusLabels[campaign.status]}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-950/70 text-white backdrop-blur-xs">
            {campaign.category}
          </span>
        </div>

        {/* Date & Location Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/95 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            {campaign.date}
          </span>
          <span className="flex items-center gap-1 truncate max-w-[50%]">
            <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate">{tText(campaign.location)}</span>
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link to="campaigns/detail" slug={campaign.slug} className="block group/title">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover/title:text-[#006A4E] transition-colors line-clamp-2 font-display">
              {tText(campaign.title)}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {tText(campaign.description)}
          </p>
        </div>

        {/* Beneficiaries Note */}
        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
          <strong className="text-slate-700">{isBn ? 'উপকারভোগী:' : 'Beneficiaries:'}</strong>{' '}
          <span className="line-clamp-1">{tText(campaign.beneficiaries)}</span>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <Link
            to="campaigns/detail"
            slug={campaign.slug}
            className="text-xs sm:text-sm font-bold text-[#006A4E] hover:text-[#00523C] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Campaign'}</span>
            <ArrowRight className="w-4 h-4 group-arrow-hover" />
          </Link>

          <Link
            to="donate"
            className="px-3 py-1.5 rounded-xl bg-[#E6F3EF] hover:bg-[#006A4E] text-[#006A4E] hover:text-white transition-all inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Support this campaign"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{isBn ? 'সহায়তা' : 'Support'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

