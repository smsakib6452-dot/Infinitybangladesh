import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { CampaignCard } from '../components/CampaignCard';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { Flag, Filter } from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const { isBn } = useLanguage();
  const { campaigns } = useData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const filteredCampaigns = campaigns.filter(c => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'মাঠপর্যায়ের উদ্যোগ' : 'Field Initiatives'}
          title={isBn ? 'আমাদের ক্যাম্পেইনসমূহ' : 'Our Campaigns'}
          subtitle={
            isBn
              ? 'সুবিধাবঞ্চিত শিশু ও দারিদ্র্যপীড়িত জনগোষ্ঠীর সহায়তায় পরিচালিত সকল মৌসুমী ও নিয়মিত ক্যাম্পেইন।'
              : 'Explore all active, upcoming, and completed humanitarian campaigns organized by Team Infinity across Bangladesh.'
          }
        />
      </ScrollReveal>

      {/* Filter Tabs */}
      <ScrollReveal effect="fade-up" delay={0.1}>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-[#EAE3D9] shadow-warm-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#006A4E]" />
          <span>{isBn ? 'ফিল্টার করুন:' : 'Filter Status:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#006A4E] text-white shadow-warm-sm'
                : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700 border border-[#EAE3D9]'
            }`}
          >
            {isBn ? 'সকল ক্যাম্পেইন' : 'All Campaigns'} ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#006A4E] text-white shadow-warm-sm'
                : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700 border border-[#EAE3D9]'
            }`}
          >
            {isBn ? 'চলমান' : 'Active'} ({campaigns.filter(c => c.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('upcoming')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'upcoming'
                ? 'bg-[#D97706] text-white shadow-warm-sm'
                : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700 border border-[#EAE3D9]'
            }`}
          >
            {isBn ? 'আসন্ন' : 'Upcoming'} ({campaigns.filter(c => c.status === 'upcoming').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-slate-800 text-white shadow-warm-sm'
                : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700 border border-[#EAE3D9]'
            }`}
          >
            {isBn ? 'সম্পন্ন' : 'Completed'} ({campaigns.filter(c => c.status === 'completed').length})
          </button>
        </div>
      </div>
      </ScrollReveal>

      {/* Grid of campaigns */}
      {filteredCampaigns.length === 0 ? (
        <ScrollReveal effect="fade-up" delay={0.2}>
          <div className="text-center py-16 p-6 bg-white rounded-3xl border border-[#EAE3D9] space-y-3 shadow-warm-xs">
            <Flag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">
              {isBn ? 'এই ক্যাটাগরিতে কোনো ক্যাম্পেইন নেই।' : 'No campaigns found for this filter.'}
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredCampaigns.map(campaign => (
            <StaggerItem key={campaign.id} className="h-full flex">
              <CampaignCard campaign={campaign} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
};
