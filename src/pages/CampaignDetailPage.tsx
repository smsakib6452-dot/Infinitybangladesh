import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { CampaignCard } from '../components/CampaignCard';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { getAssetUrl } from '../lib/utils/assetHelper';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Heart,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

export const CampaignDetailPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { currentSlug } = useRouter();
  const { campaigns } = useData();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const campaign = campaigns.find(c => c.slug === currentSlug) || campaigns[0];

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {isBn ? 'ক্যাম্পেইন পাওয়া যায়নি' : 'Campaign Not Found'}
        </h2>
        <Link
          to="campaigns"
          className="px-5 py-2.5 bg-[#006A4E] text-white rounded-2xl text-sm font-bold shadow-warm-sm cursor-pointer inline-block"
        >
          {isBn ? 'সকল ক্যাম্পেইনে ফিরে যান' : 'Back to Campaigns'}
        </Link>
      </div>
    );
  }

  const otherCampaigns = campaigns.filter(c => c.id !== campaign.id).slice(0, 3);

  // Gallery items formatted for lightbox
  const galleryItems = campaign.galleryImages.map((img, i) => ({
    id: `camp-img-${i}`,
    title: campaign.title,
    caption: campaign.title,
    imageUrl: img,
    category: 'Campaigns' as const,
    date: campaign.date
  }));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tText(campaign.title),
        text: tText(campaign.description),
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isBn ? 'লিঙ্কটি কপি করা হয়েছে!' : 'Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Back button and Share */}
      <div className="flex items-center justify-between">
        <Link
          to="campaigns"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#006A4E] hover:text-[#00523C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'সকল ক্যাম্পেইনে ফিরে যান' : 'Back to All Campaigns'}</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-700 text-xs font-bold border border-[#EAE3D9] transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{isBn ? 'শেয়ার করুন' : 'Share Campaign'}</span>
        </button>
      </div>

      {/* Hero Section */}
      <ScrollReveal effect="fade-up" className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
            {campaign.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{campaign.date}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{tText(campaign.location)}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          {tText(campaign.title)}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl font-normal">
          {tText(campaign.description)}
        </p>
      </ScrollReveal>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Media & Story */}
        <div className="lg:col-span-8 space-y-10">
          <ScrollReveal effect="fade-up" className="rounded-[2.5rem] overflow-hidden shadow-warm-xl border-4 border-white aspect-16/9 bg-slate-100">
            <img
              src={getAssetUrl(campaign.imageUrl)}
              alt={tText(campaign.title)}
              className="w-full h-full object-cover"
            />
          </ScrollReveal>

          {/* Objectives */}
          <ScrollReveal effect="fade-up" delay={0.1} className="p-6 sm:p-8 bg-white rounded-3xl border border-[#EAE3D9] space-y-4 shadow-warm-sm">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#006A4E]" />
              <span>{isBn ? 'ক্যাম্পেইনের মূল লক্ষ্যসমূহ' : 'Key Campaign Objectives'}</span>
            </h3>
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(isBn ? campaign.objectives.bn : campaign.objectives.en).map((obj, index) => (
                <StaggerItem key={index} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs sm:text-sm text-slate-700">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </ScrollReveal>

          {/* Detailed Narrative */}
          <ScrollReveal effect="fade-up" delay={0.2} className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {isBn ? 'ক্যাম্পেইন বিবরণ ও বাস্তবায়ন পরিকল্পনা' : 'Implementation Narrative & Impact'}
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm">
              {tText(campaign.details)}
            </p>
          </ScrollReveal>

          {/* Photo Gallery Grid */}
          {campaign.galleryImages.length > 0 && (
            <ScrollReveal effect="fade-up" delay={0.3} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                {isBn ? 'মাঠপর্যায়ের আলোকচিত্র' : 'Field Photo Documentation'}
              </h3>
              <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {campaign.galleryImages.map((img, i) => (
                  <StaggerItem key={i}>
                    <div
                      onClick={() => setLightboxIndex(i)}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer shadow-warm-sm border border-[#EAE3D9] group"
                    >
                      <img
                        src={getAssetUrl(img)}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </ScrollReveal>
          )}
        </div>

        {/* Right Column: Support / Donation Box */}
        <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#EAE3D9] space-y-6 shadow-warm-md sticky top-24">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#006A4E] bg-[#E6F3EF] px-3 py-1 rounded-full border border-[#C2E2D7]">
                {isBn ? 'সহায়তার সুযোগ' : 'Get Involved'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                {isBn ? 'এই উদ্যোগে সহায়তা দিন' : 'Support This Campaign'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isBn
                  ? 'আপনার সহযোগিতা সরাসরি মাঠপর্যায়ে উপকারভোগীদের কাছে পৌঁছে দেওয়া হবে।'
                  : 'Your contribution is directly transformed into verified aid on the ground.'}
              </p>
            </div>

            {/* Target & Funding Progress if available */}
            {(() => {
              const targetNum = campaign.targetAmountBDT ? parseFloat(campaign.targetAmountBDT.replace(/[^0-9.]/g, '')) : 0;
              const raisedNum = campaign.raisedAmountBDT ? parseFloat(campaign.raisedAmountBDT.replace(/[^0-9.]/g, '')) : 0;
              const hasFunding = !isNaN(targetNum) && targetNum > 0 && !isNaN(raisedNum);
              const pct = hasFunding ? Math.min(100, Math.round((raisedNum / targetNum) * 100)) : 0;

              if (!hasFunding) return null;

              return (
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{isBn ? 'তহবিল লক্ষ্য:' : 'Goal:'} ৳{targetNum.toLocaleString('en-IN')}</span>
                    <span className="text-[#006A4E] font-extrabold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#006A4E] to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-right">
                    {isBn ? 'সংগৃহীত:' : 'Raised:'} ৳{raisedNum.toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })()}

            {/* Beneficiaries & Volunteers Stats if available */}
            {((campaign.beneficiariesCount && Number(campaign.beneficiariesCount) > 0) || (campaign.volunteersCount && Number(campaign.volunteersCount) > 0)) && (
              <div className="grid grid-cols-2 gap-2 text-center">
                {Boolean(campaign.beneficiariesCount && Number(campaign.beneficiariesCount) > 0) && (
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                    <div className="text-base font-extrabold text-[#006A4E]">{campaign.beneficiariesCount}+</div>
                    <div className="text-[11px] font-medium text-slate-600">{isBn ? 'উপকারভোগী' : 'Beneficiaries'}</div>
                  </div>
                )}
                {Boolean(campaign.volunteersCount && Number(campaign.volunteersCount) > 0) && (
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                    <div className="text-base font-extrabold text-amber-600">{campaign.volunteersCount}+</div>
                    <div className="text-[11px] font-medium text-slate-600">{isBn ? 'স্বেচ্ছাসেবী' : 'Volunteers'}</div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Link
                to="donate"
                className="w-full py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-sm shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>{isBn ? 'অনলাইন অনুদান প্রদান' : 'Donate to Campaign'}</span>
              </Link>

              <Link
                to="volunteer"
                className="w-full py-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 font-bold text-sm border border-[#EAE3D9] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'স্বেচ্ছাসেবী হিসেবে যোগ দিন' : 'Volunteer for this Drive'}</span>
              </Link>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-[#00523C]">
                <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? '১০০% স্বচ্ছতা অঙ্গীকার' : '100% Transparency Pledge'}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isBn
                  ? 'ক্যাম্পেইন সমাপ্তির পর সকল ব্যয়ের ভাউচার এবং নিরীক্ষা রিপোর্ট প্রকাশ করা হয়।'
                  : 'Comprehensive expense reports and distribution logs are published for complete public auditing.'}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Other campaigns */}
      {otherCampaigns.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900 font-display">
            {isBn ? 'অন্যান্য ক্যাম্পেইনসমূহ' : 'Other Active Initiatives'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {otherCampaigns.map(c => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          photos={galleryItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};
