import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Link } from '../components/Link';
import { SectionHeading } from '../components/SectionHeading';
import { OfficialInfoBadge } from '../components/OfficialInfoBadge';
import {
  Layers,
  Award,
  Users,
  ShieldCheck,
  BookOpen,
  Heart,
  Briefcase,
  ArrowRight,
  Calendar,
  Sparkles,
  LayoutGrid,
  Search
} from 'lucide-react';
import { CommitteeMember, Person, Position } from '../types';
import { getAssetUrl, handleImageError } from '../lib/utils/assetHelper';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { ExecutiveAvatar } from '../components/ExecutiveAvatar';
import { CommitteeNavigation } from '../components/CommitteeNavigation';

export const StandingCommitteesPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { committees, getMembersWithDetails } = useData();

  const [selectedMember, setSelectedMember] = useState<(CommitteeMember & { person: Person; position: Position }) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Single unified Standing Committee
  const standingCommittee =
    committees.find(c => c.type === 'STANDING' && c.status === 'ACTIVE') ||
    committees.find(c => c.id === 'comm-stand-central') ||
    committees.find(c => c.type === 'STANDING');

  const allMembers = standingCommittee ? getMembersWithDetails(standingCommittee.id) : [];

  // Filter members if search query exists
  const filteredMembers = allMembers.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = m.person.fullName.toLowerCase().includes(q) || m.person.banglaName.toLowerCase().includes(q);
    const posMatch = m.position.name.en.toLowerCase().includes(q) || m.position.name.bn.toLowerCase().includes(q);
    return nameMatch || posMatch;
  });

  // Hierarchy grouping
  const isChairman = (m: CommitteeMember & { position: Position }) => {
    const posName = (m.position?.name?.en || '').toLowerCase();
    return (m.position?.level === 1 || posName.includes('chairman')) && !posName.includes('vice');
  };

  const isViceChairman = (m: CommitteeMember & { position: Position }) => {
    const posName = (m.position?.name?.en || '').toLowerCase();
    return m.position?.level === 2 || posName.includes('vice-chairman') || posName.includes('vice chairman');
  };

  const chairman = filteredMembers.filter(isChairman);
  const viceChairmen = filteredMembers.filter(isViceChairman);
  const regularMembers = filteredMembers.filter(m => !isChairman(m) && !isViceChairman(m));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-14">
      {/* Header Banner */}
      <ScrollReveal effect="fade-up">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F3EF] text-[#00523C] text-xs font-extrabold uppercase tracking-wider border border-[#C2E2D7]">
            <Layers className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{isBn ? 'স্থায়ী পরিষদ ও দিকনির্দেশনা' : 'Standing Governance Council'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            {isBn ? 'ইনফিনিটি বাংলাদেশ স্থায়ী কমিটি' : 'Infinity Bangladesh Standing Committee'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {isBn
              ? 'টিম ইনফিনিটির প্রাতিষ্ঠানিক নীতি নির্ধারণ, দীর্ঘমেয়াদী কৌশলগত পরিকল্পনা এবং মানবিক কার্যক্রমের ধারাবাহিকতা রক্ষায় নিবেদিত স্থায়ী পরিষদ।'
              : 'The permanent governance body providing strategic leadership, institutional policy oversight, and ethical guidance for Infinity Bangladesh.'}
          </p>

          {/* Sub-navigation */}
          <CommitteeNavigation activeTab="standing" />
        </div>
      </ScrollReveal>

      {/* STANDING COMMITTEE HIERARCHY & MEMBERS */}
      <ScrollReveal effect="fade-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EAE3D9] p-6 sm:p-10 space-y-8 shadow-warm-md relative overflow-hidden">
          {/* Committee Title Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-[#006A4E]" />
                {standingCommittee ? tText(standingCommittee.name) : (isBn ? 'ইনফিনিটি বাংলাদেশ স্থায়ী কমিটি' : 'Infinity Bangladesh Standing Committee')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn ? 'মোট স্থায়ী সদস্য:' : 'Total Standing Members:'} <span className="font-bold text-slate-800">{allMembers.length} {isBn ? 'জন' : 'Leaders'}</span> &bull; {isBn ? 'অনুমোদিত কেন্দ্রীয় স্থায়ী পরিষদ' : 'Central Standing Council'}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'সদস্য বা পদবী খুঁজুন...' : 'Search member or position...'}
                className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white transition-all"
              />
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#FAF7F2] rounded-3xl border border-dashed border-[#EAE3D9]">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                {searchQuery
                  ? (isBn ? 'অনুসন্ধানের সাথে কোনো সদস্য মেলেনি।' : 'No members matched your search criteria.')
                  : (isBn ? 'এই কমিটিতে এখনও কোনো সদস্য যুক্ত করা হয়নি।' : 'No members assigned to this standing committee yet.')}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* TIER 1: CHAIRMAN */}
              {chairman.length > 0 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B31224] bg-[#FDF1F2] px-3.5 py-1 rounded-full border border-[#FCD3D7]">
                      {isBn ? 'চেয়ারম্যান' : 'Chairman'}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    {chairman.map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="group relative cursor-pointer max-w-xs sm:max-w-sm w-full bg-white text-slate-900 rounded-3xl p-6 text-center shadow-warm-lg border-2 border-[#D4182E]/40 hover:border-[#D4182E] transition-all transform hover:-translate-y-1"
                      >
                        <div className="absolute top-3 right-3 bg-[#FDF1F2] text-[#B31224] font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#FCD3D7]">
                          #{String(m.serialNumber || 1).padStart(2, '0')}
                        </div>

                        <div className="mx-auto w-28 h-32 sm:w-32 sm:h-36 rounded-t-full rounded-b-2xl overflow-hidden bg-gradient-to-b from-[#8B0D1D] to-[#360208] border-2 border-[#D4182E]/40 shadow-inner mb-3.5 flex items-center justify-center">
                          <ExecutiveAvatar
                            photoUrl={m.person.photoUrl}
                            fullName={m.person.fullName}
                            photoPosition={m.person.photoPosition}
                            photoZoom={m.person.photoZoom}
                            variant="crimson"
                          />
                        </div>

                        <div className="bg-[#D4182E] text-white rounded-2xl py-2 px-3 shadow-xs space-y-0.5">
                          <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-display text-white transition-colors">
                            {isBn ? m.person.banglaName : m.person.fullName}
                          </h3>
                          <div className="text-[11px] font-bold text-rose-100 uppercase tracking-wider">
                            {isBn ? m.position.name.bn : m.position.name.en}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TIER 2: VICE-CHAIRMEN */}
              {viceChairmen.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B31224] bg-[#FDF1F2] px-3.5 py-1 rounded-full border border-[#FCD3D7]">
                      {isBn ? 'ভাইস-চেয়ারম্যান পরিষদ' : 'Vice-Chairmen'}
                    </span>
                  </div>

                  <StaggerGroup className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
                    {viceChairmen.map(m => (
                      <StaggerItem
                        key={m.id}
                        className="w-full sm:w-[calc(50%-0.75rem)] max-w-xs"
                      >
                        <div
                          onClick={() => setSelectedMember(m)}
                          className="group relative cursor-pointer bg-white text-slate-900 rounded-3xl p-5 text-center shadow-warm-sm border border-[#EAE3D9] hover:border-[#D4182E] transition-all transform hover:-translate-y-1 h-full"
                        >
                          <div className="absolute top-3 right-3 bg-[#FAF7F2] text-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#EAE3D9]">
                            #{String(m.serialNumber || 2).padStart(2, '0')}
                          </div>

                          <div className="mx-auto w-24 h-28 sm:w-28 sm:h-32 rounded-t-full rounded-b-2xl overflow-hidden bg-gradient-to-b from-[#8B0D1D] to-[#360208] border border-[#D4182E]/30 mb-3 flex items-center justify-center shadow-xs">
                            <ExecutiveAvatar
                              photoUrl={m.person.photoUrl}
                              fullName={m.person.fullName}
                              photoPosition={m.person.photoPosition}
                              photoZoom={m.person.photoZoom}
                              variant="crimson"
                            />
                          </div>

                          <div className="bg-[#FAF7F2] border border-[#EAE3D9] text-slate-900 rounded-2xl py-1.5 px-3 shadow-2xs space-y-0.5">
                            <h4 className="text-sm sm:text-base font-bold font-display text-slate-900 group-hover:text-[#D4182E] transition-colors">
                              {isBn ? m.person.banglaName : m.person.fullName}
                            </h4>
                            <div className="text-[10px] font-bold text-[#D4182E] uppercase tracking-wider">
                              {isBn ? m.position.name.bn : m.position.name.en}
                            </div>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                </div>
              )}

              {/* TIER 3: REGULAR MEMBERS */}
              {regularMembers.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00523C] bg-[#E6F3EF] px-3.5 py-1 rounded-full border border-[#C2E2D7]">
                      {isBn ? 'স্থায়ী কমিটির সদস্যবৃন্দ' : 'Committee Members'}
                    </span>
                  </div>

                  <StaggerGroup className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
                    {regularMembers.map(m => (
                      <StaggerItem
                        key={m.id}
                        className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-xs"
                      >
                        <div
                          onClick={() => setSelectedMember(m)}
                          className="group relative cursor-pointer bg-[#FAF7F2] rounded-3xl p-4 text-center shadow-2xs border border-[#EAE3D9] hover:border-[#006A4E] hover:shadow-warm-md transition-all transform hover:-translate-y-1 flex flex-col justify-between h-full"
                        >
                          <div className="absolute top-2.5 right-2.5 bg-white text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                            #{String(m.serialNumber || 0).padStart(2, '0')}
                          </div>

                          <div>
                            <div className="mx-auto w-20 h-24 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border border-[#006A4E]/30 mb-2.5 flex items-center justify-center shadow-xs">
                              <ExecutiveAvatar
                                photoUrl={m.person.photoUrl}
                                fullName={m.person.fullName}
                                photoPosition={m.person.photoPosition}
                                photoZoom={m.person.photoZoom}
                                variant="emerald"
                              />
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display group-hover:text-[#006A4E] transition-colors leading-snug">
                              {isBn ? m.person.banglaName : m.person.fullName}
                            </h4>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-[#006A4E] uppercase tracking-wider block">
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
          )}
        </div>
      </ScrollReveal>

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-3">
              <div className="mx-auto w-24 h-28 rounded-t-full rounded-b-2xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border-2 border-[#006A4E] shadow-md flex items-center justify-center">
                <ExecutiveAvatar
                  photoUrl={selectedMember.person.photoUrl}
                  fullName={selectedMember.person.fullName}
                  photoPosition={selectedMember.person.photoPosition}
                  photoZoom={selectedMember.person.photoZoom}
                  variant="emerald"
                />
              </div>

              <div className="space-y-1">
                <span className="inline-block font-mono text-xs font-bold text-[#006A4E] bg-[#E6F3EF] px-2.5 py-0.5 rounded-full border border-[#C2E2D7]">
                  {isBn ? 'ক্রমিক নং:' : 'Serial No:'} #{String(selectedMember.serialNumber || 0).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  {isBn ? selectedMember.person.banglaName : selectedMember.person.fullName}
                </h3>
                <p className="text-sm font-bold text-[#006A4E]">
                  {isBn ? selectedMember.position.name.bn : selectedMember.position.name.en}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'সংগঠন:' : 'Organization:'}</span>
                <span className="font-bold text-slate-900">Infinity Bangladesh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'কমিটি:' : 'Committee:'}</span>
                <span className="font-medium text-slate-800">
                  {standingCommittee ? tText(standingCommittee.name) : 'Standing Committee'}
                </span>
              </div>
              {selectedMember.person.district && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'জেলা:' : 'District:'}</span>
                  <span className="font-medium text-slate-800">{selectedMember.person.district}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-center bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EAE3D9]">
              {selectedMember.person.shortBio ? tText(selectedMember.person.shortBio) : (isBn ? 'ইনফিনিটি বাংলাদেশ স্থায়ী কমিটির সম্মানিত সদস্য।' : 'Distinguished member of Infinity Bangladesh Standing Committee.')}
            </p>

            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="w-full py-2.5 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
