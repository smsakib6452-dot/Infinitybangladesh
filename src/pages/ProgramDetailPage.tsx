import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { CampaignCard } from '../components/CampaignCard';
import { getAssetUrl } from '../lib/utils/assetHelper';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';

export const ProgramDetailPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { currentSlug, navigate } = useRouter();
  const { programs, campaigns, getEventsByProgramId, getEventHighlights } = useData();

  const program = programs.find(p => p.slug === currentSlug) || programs[0];

  if (!program) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {isBn ? 'কর্মসূচি পাওয়া যায়নি' : 'Program Not Found'}
        </h2>
        <Link
          to="programs"
          className="px-5 py-2.5 bg-[#006A4E] text-white rounded-2xl text-sm font-bold shadow-warm-sm cursor-pointer inline-block"
        >
          {isBn ? 'সকল কর্মসূচিতে ফিরে যান' : 'Back to Programs'}
        </Link>
      </div>
    );
  }

  // Related campaigns
  const relatedCampaigns = campaigns.filter(c => c.category === program.category || c.slug.includes(program.slug.slice(0, 4)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      <ScrollReveal effect="fade-up">
        {/* Back Button */}
        <Link
          to="programs"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#006A4E] hover:text-[#00523C] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'সকল কার্যক্রমে ফিরে যান' : 'Back to All Programs'}</span>
        </Link>

        {/* Program Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
              {program.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              {tText(program.title)}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              {tText(program.shortDescription)}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="donate"
                className="px-6 py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-warm-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>{isBn ? 'এই উদ্যোগে সহায়তা দিন' : 'Support This Program'}</span>
              </Link>

              <Link
                to="volunteer"
                className="px-6 py-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 font-bold text-sm border border-[#EAE3D9] inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'স্বেচ্ছাসেবী হিসেবে যোগ দিন' : 'Volunteer With Us'}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-4/3 rounded-[2.5rem] overflow-hidden shadow-warm-xl border-4 border-white bg-slate-100">
              <img
                src={getAssetUrl(program.imageUrl)}
                alt={tText(program.title)}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Program Details & Impact Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <ScrollReveal effect="fade-up" delay={0.1} className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm h-full">
            <h3 className="text-xl font-bold text-slate-900 font-display">
              {isBn ? 'কর্মসূচির বিশদ বিবরণ ও কৌশল' : 'Program Scope & Approach'}
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm">
              {tText(program.fullDescription || program.fullDetails)}
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">
                {isBn ? 'মূল কার্যপদ্ধতি ও লক্ষ্যসমূহ:' : 'Key Methodologies & Goals:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const hl = program.impactHighlights || (program.impactPoints as any);
                  if (!hl) return null;
                  const list = isBn ? hl.bn : hl.en;
                  if (!Array.isArray(list)) return null;
                  return list.map((point: string, index: number) => (
                    <div key={index} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Sidebar info */}
        <ScrollReveal effect="slide-left" delay={0.2} className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 space-y-4 shadow-warm-sm">
            <h4 className="font-bold text-slate-900 text-base font-display">
              {isBn ? 'কর্মসূচি সম্পর্কিত তথ্য' : 'Program Metadata'}
            </h4>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'ক্যাটাগরি:' : 'Category:'}</span>
                <span className="font-bold text-slate-900">{program.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'মডেল:' : 'Model:'}</span>
                <span className="font-bold text-[#006A4E]">{isBn ? 'স্বেচ্ছাসেবী পরিচালিত' : 'Volunteer-Driven'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">{isBn ? 'জবাবদিহিতা:' : 'Auditing:'}</span>
                <span className="font-bold text-emerald-700">{isBn ? 'শতভাগ নিরীক্ষিত' : '100% Verified'}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* CHRONOLOGICAL EDITIONS / EVENTS SECTION */}
      {(() => {
        const editions = getEventsByProgramId(program.id);
        if (editions.length === 0) return null;

        return (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-[#006A4E] border border-emerald-200 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{editions.length} {isBn ? 'টি ঐতিহাসিক আসর ও কার্যক্রম' : 'Annual Editions Recorded'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                  {isBn ? 'বাৎসরিক আসর ও কার্যক্রমের ইতিহাস' : 'Program Editions & Event Timeline'}
                </h2>
              </div>

              <button
                onClick={() => navigate('gallery', program.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-warm-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <span>{isBn ? 'এই কর্মসূচির গ্যালারি দেখুন' : 'Explore Program Media'}</span>
                <Sparkles className="w-4 h-4 text-[#006A4E]" />
              </button>
            </div>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {editions.map(ed => {
                const edHighlights = getEventHighlights(ed.id);

                return (
                  <StaggerItem
                    key={ed.id}
                    className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={getAssetUrl(ed.coverImageUrl || program.imageUrl)}
                        alt={tText(ed.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-black">
                          {ed.year}
                        </span>
                        {ed.isFeatured && (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[11px] font-extrabold shadow-sm">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      {edHighlights.length > 0 && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-bold">
                          ⭐ {edHighlights.length} {isBn ? 'হাইলাইটস' : 'Highlights'}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-[#006A4E] transition-colors line-clamp-2 font-display">
                          {tText(ed.title)}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <span>📍 {tText(ed.location)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {tText(ed.shortDescription)}
                        </p>
                      </div>

                      {/* Impact metrics preview */}
                      {ed.impactMetrics && ed.impactMetrics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                          {ed.impactMetrics.slice(0, 2).map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#006A4E] text-[11px] font-bold"
                            >
                              {m.value} {tText(m.label)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Navigation CTA */}
                      <button
                        onClick={() => navigate('programs/event-detail', program.slug, ed.slug)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#006A4E] text-slate-800 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-[#006A4E] group-hover:text-white mt-auto"
                      >
                        <span>{isBn ? 'আসরের গল্প ও হাইলাইটস দেখুন' : 'Explore Edition Story & Media'}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        );
      })()}

      {/* Related Campaigns */}
      {relatedCampaigns.length > 0 && (
        <ScrollReveal className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900 font-display">
            {isBn ? 'এই কর্মসূচির আওতায় পরিচালিত ক্যাম্পেইন' : 'Campaigns Under This Program'}
          </h3>
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {relatedCampaigns.map(c => (
              <StaggerItem key={c.id} className="h-full flex">
                <CampaignCard campaign={c} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </ScrollReveal>
      )}
    </div>
  );
};
