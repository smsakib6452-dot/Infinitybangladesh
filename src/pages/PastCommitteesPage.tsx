import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import { Link } from '../components/Link';
import { SectionHeading } from '../components/SectionHeading';
import {
  History,
  Calendar,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  LayoutGrid
} from 'lucide-react';
import { getAssetUrl, handleImageError } from '../lib/utils/assetHelper';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { ExecutiveAvatar } from '../components/ExecutiveAvatar';
import { CommitteeNavigation } from '../components/CommitteeNavigation';

export const PastCommitteesPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { currentSlug } = useRouter();
  const { committees, getMembersWithDetails } = useData();

  const pastCommittees = committees
    .filter(c => c.type === 'PAST' || c.status === 'ARCHIVED')
    .sort((a, b) => {
      const yearA = parseInt(a.year || '0', 10);
      const yearB = parseInt(b.year || '0', 10);
      return yearB - yearA;
    });

  const [expandedId, setExpandedId] = useState<string | null>(pastCommittees[0]?.id || null);

  // Auto-expand committee when matching currentSlug (by id, slug, or year)
  useEffect(() => {
    if (currentSlug && pastCommittees.length > 0) {
      const matched = pastCommittees.find(
        c => c.id === currentSlug || c.slug === currentSlug || c.year === currentSlug
      );
      if (matched) {
        setExpandedId(matched.id);
      }
    }
  }, [currentSlug, pastCommittees]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-14">
      {/* Header Banner */}
      <ScrollReveal effect="fade-up">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F3EF] text-[#00523C] text-xs font-extrabold uppercase tracking-wider border border-[#C2E2D7]">
            <History className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{isBn ? 'সাংগঠনিক ইতিহাস ও নেতৃত্ব' : 'Leadership Archive'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            {isBn ? 'প্রাক্তন কার্যনির্বাহী কমিটি আর্কাইভ' : 'Past Committees & Leadership Archive'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {isBn
              ? 'ইনফিনিটি বাংলাদেশ-এর সূচনালগ্ন (২০১৫) থেকে বিভিন্ন বর্ষে নিষ্ঠা ও সততার সাথে দায়িত্ব পালনকারী প্রাক্তন নেতৃবৃন্দের গৌরবময় অবদান।'
              : 'Preserving the historic legacy and humanitarian contributions of previous executive leadership councils across service years since 2015.'}
          </p>

          {/* Sub-navigation */}
          <CommitteeNavigation activeTab="past" />
        </div>
      </ScrollReveal>

      {/* Past Committees List */}
      <StaggerGroup className="space-y-6">
        {pastCommittees.length > 0 ? (
          pastCommittees.map(comm => {
            const isExpanded = expandedId === comm.id;
            const members = getMembersWithDetails(comm.id);

            return (
              <StaggerItem key={comm.id}>
                <div
                  className="bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all duration-300"
                >
                  <div
                    onClick={() => toggleExpand(comm.id)}
                    className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
                          {isBn ? 'আর্কাইভ বর্ষ:' : 'Service Term:'} {comm.year}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                        {tText(comm.name)}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {tText(comm.description)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500">
                        {members.length} {isBn ? 'জন সদস্য' : 'Members'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-slate-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 sm:p-8 pt-0 border-t border-slate-100 bg-[#FAF7F2]">
                      <StaggerGroup className="flex flex-wrap justify-center gap-4 pt-6">
                        {members.map(m => (
                          <StaggerItem
                            key={m.id}
                            className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] max-w-xs"
                          >
                            <div
                              className="bg-white rounded-2xl p-4 border border-[#EAE3D9] shadow-2xs text-center space-y-2 hover:border-[#006A4E] hover:shadow-warm-sm transition-all duration-200 flex flex-col justify-between h-full"
                            >
                              <div className="mx-auto w-16 h-20 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border border-[#006A4E]/30 flex items-center justify-center shadow-xs">
                                <ExecutiveAvatar
                                  photoUrl={m.person.photoUrl}
                                  fullName={m.person.fullName}
                                  photoPosition={m.person.photoPosition}
                                  photoZoom={m.person.photoZoom}
                                  variant="emerald"
                                />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                                  {isBn ? m.person.banglaName : m.person.fullName}
                                </h4>
                                <span className="text-[11px] font-bold text-[#006A4E] block">
                                  {isBn ? m.position.name.bn : m.position.name.en}
                                </span>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerGroup>
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-12 text-center text-slate-500 text-sm">
            {isBn ? 'কোনো সংরক্ষিত আর্কাইভ তথ্য পাওয়া যায়নি।' : 'No past committees archived yet.'}
          </div>
        )}
      </StaggerGroup>
    </div>
  );
};
