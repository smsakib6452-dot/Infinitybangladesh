import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Link } from '../components/Link';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { OfficialInfoBadge } from '../components/OfficialInfoBadge';
import {
  Users,
  ShieldCheck,
  Award,
  Calendar,
  Search,
  Sparkles,
  ArrowRight,
  MapPin,
  LayoutGrid,
  Edit2,
  Trash2,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { CommitteeMember, Person, Position, ExecutiveTierBar } from '../types';
import { DEFAULT_EXECUTIVE_TIER_BARS } from '../data/initialData';
import { getAssetUrl, handleImageError } from '../lib/utils/assetHelper';
import { ExecutiveAvatar } from '../components/ExecutiveAvatar';
import { CommitteeNavigation } from '../components/CommitteeNavigation';

export const ExecutiveCommitteePage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { committees, getMembersWithDetails, settings, updateSettings } = useData();

  const activeExecCommittee =
    committees.find(c => c.type === 'EXECUTIVE' && c.status === 'ACTIVE') ||
    committees.find(c => c.type === 'EXECUTIVE') ||
    committees[0];
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<(CommitteeMember & { person: Person; position: Position }) | null>(null);

  // Section / Tier Bar Editing State
  const [editingTierBar, setEditingTierBar] = useState<ExecutiveTierBar | null>(null);
  const [isEditingTierModalOpen, setIsEditingTierModalOpen] = useState(false);

  const committeeIdToUse = selectedCommitteeId || activeExecCommittee?.id || 'comm-exec-2026';
  const currentCommittee = committees.find(c => c.id === committeeIdToUse) || activeExecCommittee;
  const allMembers = getMembersWithDetails(committeeIdToUse).filter(
    m => m.status === 'ACTIVE' && m.person?.active !== false
  );

  // Dynamic Tier Bars configuration from settings with fallbacks
  const tierBars: ExecutiveTierBar[] = settings.executiveTierBars && settings.executiveTierBars.length > 0
    ? settings.executiveTierBars
    : DEFAULT_EXECUTIVE_TIER_BARS;

  const getTierBar = (id: string, defaultEn: string, defaultBn: string, rangeLabel?: string): ExecutiveTierBar => {
    const found = tierBars.find(b => b.id === id);
    if (!found) {
      return {
        id,
        title: { en: defaultEn, bn: defaultBn },
        visible: true,
        rangeLabel
      };
    }
    const resolvedEn = (found.id === 'organizingFinance' && (found.title?.en === 'Organizing & Finance Secretariat' || !found.title?.en))
      ? defaultEn
      : (found.title?.en ?? defaultEn);
    const resolvedBn = (found.id === 'organizingFinance' && (found.title?.bn === 'সাংগঠনিক ও অর্থ বিভাগ' || !found.title?.bn))
      ? defaultBn
      : (found.title?.bn ?? defaultBn);

    return {
      ...found,
      title: {
        en: resolvedEn,
        bn: resolvedBn
      },
      visible: found.visible !== false,
      rangeLabel: found.rangeLabel || rangeLabel
    };
  };

  const handleSaveTierBar = (bar: ExecutiveTierBar) => {
    const currentList = settings.executiveTierBars && settings.executiveTierBars.length > 0
      ? [...settings.executiveTierBars]
      : [...DEFAULT_EXECUTIVE_TIER_BARS];
    const idx = currentList.findIndex(b => b.id === bar.id);
    if (idx >= 0) {
      currentList[idx] = bar;
    } else {
      currentList.push(bar);
    }
    updateSettings({ executiveTierBars: currentList });
    setIsEditingTierModalOpen(false);
    setEditingTierBar(null);
  };

  const handleDeleteTierBar = (id: string) => {
    const currentList = settings.executiveTierBars && settings.executiveTierBars.length > 0
      ? [...settings.executiveTierBars]
      : [...DEFAULT_EXECUTIVE_TIER_BARS];
    const updated = currentList.map(b => b.id === id ? { ...b, visible: false } : b);
    updateSettings({ executiveTierBars: updated });
    setIsEditingTierModalOpen(false);
    setEditingTierBar(null);
  };

  const handleRestoreTierBars = () => {
    updateSettings({ executiveTierBars: DEFAULT_EXECUTIVE_TIER_BARS });
  };

  const renderTierBar = (
    bar: ExecutiveTierBar,
    defaultEn: string,
    defaultBn: string,
    accentColor?: 'green' | 'red' | 'default'
  ) => {
    if (!bar || bar.visible === false) return null;

    const colorClasses = accentColor === 'green'
      ? 'text-[#00523C] bg-gradient-to-r from-[#E6F3EF] to-[#D5EDE6] border-[#A8DAC9] shadow-warm-xs'
      : accentColor === 'red'
      ? 'text-[#B31224] bg-gradient-to-r from-[#FDF1F2] to-[#FCE4E7] border-[#F9BDC4] shadow-warm-xs'
      : 'text-slate-700 bg-gradient-to-r from-[#FAF7F2] to-[#F2EDE4] border-[#DFD7CC] shadow-warm-xs';

    return (
      <div className="w-full flex items-center justify-center gap-3 sm:gap-4 my-5 sm:my-7 px-2">
        <div className="h-px flex-1 max-w-xs sm:max-w-md bg-gradient-to-r from-transparent via-slate-300 to-slate-200" />

        <div className="relative inline-flex items-center justify-center group/tierbar shrink-0">
          <span className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border transition-all text-center inline-block ${colorClasses}`}>
            {isBn ? bar.title.bn : bar.title.en}
          </span>

          {/* Quick Edit & Delete Actions (Positioned absolutely to avoid shifting center position) */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/tierbar:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={() => {
                setEditingTierBar({ ...bar });
                setIsEditingTierModalOpen(true);
              }}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#006A4E] shadow-2xs transition-colors cursor-pointer"
              title={isBn ? 'এই সেকশন বার সম্পাদনা করুন' : 'Edit Section Bar'}
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(isBn ? `আপনি কি "${bar.title.bn || bar.title.en}" বারটি লুকাতে/মুছতে চান?` : `Hide/Delete the "${bar.title.en}" section bar?`)) {
                  handleDeleteTierBar(bar.id);
                }
              }}
              className="p-1 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 shadow-2xs transition-colors cursor-pointer"
              title={isBn ? 'এই সেকশন বার মুছে ফেলুন' : 'Delete/Hide Section Bar'}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="h-px flex-1 max-w-xs sm:max-w-md bg-gradient-to-l from-transparent via-slate-200 to-slate-300" />
      </div>
    );
  };

  // Sort members by serial number / sort order
  const sortedMembers = [...allMembers].sort(
    (a, b) => (a.serialNumber || a.sortOrder || 0) - (b.serialNumber || b.sortOrder || 0)
  );

  // Helper to safely get member by serial number or fallback index
  const getMember = (serialNum: number, fallbackIdx: number) => {
    return sortedMembers.find(m => m.serialNumber === serialNum) || sortedMembers[fallbackIdx];
  };

  // Section 1: #1 to #5 (LOCKED: President, VPs, GS)
  const member1 = getMember(1, 0);
  const members2to4 = [getMember(2, 1), getMember(3, 2), getMember(4, 3)].filter(
    (m): m is CommitteeMember & { person: Person; position: Position } => Boolean(m)
  );
  const member5 = getMember(5, 4);

  // Section 2: #6 to #10 (Joint General Secretaries - 5 cards in 1 row)
  const members6to10 = [6, 7, 8, 9, 10]
    .map((num, i) => getMember(num, 5 + i))
    .filter((m): m is CommitteeMember & { person: Person; position: Position } => Boolean(m));

  // Section 3: #11 to #16 (Organizing & Finance - 6 cards in 1 row)
  // Visual order: [ #12, #11★, #13, #15, #14★, #16 ]
  const section3Items = [
    { member: getMember(12, 11), isHighlighted: false },
    { member: getMember(11, 10), isHighlighted: true },
    { member: getMember(13, 12), isHighlighted: false },
    { member: getMember(15, 14), isHighlighted: false },
    { member: getMember(14, 13), isHighlighted: true },
    { member: getMember(16, 15), isHighlighted: false }
  ].filter((item): item is { member: CommitteeMember & { person: Person; position: Position }; isHighlighted: boolean } =>
    Boolean(item.member)
  );

  // Section 4: #17 to #22 (Publicity & IT - 6 cards in 1 row)
  // Visual order: [ #18, #17★, #19, #21, #20★, #22 ]
  const section4Items = [
    { member: getMember(18, 17), isHighlighted: false },
    { member: getMember(17, 16), isHighlighted: true },
    { member: getMember(19, 18), isHighlighted: false },
    { member: getMember(21, 20), isHighlighted: false },
    { member: getMember(20, 19), isHighlighted: true },
    { member: getMember(22, 21), isHighlighted: false }
  ].filter((item): item is { member: CommitteeMember & { person: Person; position: Position }; isHighlighted: boolean } =>
    Boolean(item.member)
  );

  // Section 5: #23 to last member (Supporting & Executive Members)
  const members23Plus = sortedMembers.filter(
    m => (m.serialNumber || 0) >= 23 || (!m.serialNumber && sortedMembers.indexOf(m) >= 22)
  );

  // Filter members if search query exists
  const isSearchActive = Boolean(searchQuery.trim());
  const searchResults = isSearchActive
    ? allMembers.filter(m => {
        const q = searchQuery.toLowerCase();
        const nameMatch =
          m.person.fullName.toLowerCase().includes(q) || m.person.banglaName.toLowerCase().includes(q);
        const posMatch =
          m.position.name.en.toLowerCase().includes(q) || m.position.name.bn.toLowerCase().includes(q);
        return nameMatch || posMatch;
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-14">
      {/* Header Banner */}
      <ScrollReveal effect="fade-up" className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F3EF] text-[#00523C] text-xs font-extrabold uppercase tracking-wider border border-[#C2E2D7]">
          <Award className="w-3.5 h-3.5 text-[#006A4E]" />
          <span>{isBn ? 'কার্যনির্বাহী পরিষদ' : 'Executive Leadership'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          {isBn ? 'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী কমিটি' : 'Infinity Bangladesh Executive Committee'}
          {currentCommittee && (
            <span className="text-[#006A4E] ml-2 font-display">
              — {currentCommittee.year}
            </span>
          )}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
          {isBn
            ? 'টিম ইনফিনিটির মানবিক উদ্যোগ, মাঠপর্যায়ের ত্রাণ ও সেবা কার্যক্রম পরিচালনায় নিবেদিত নির্বাচিত কার্যনির্বাহী নেতৃত্ব।'
            : 'The dedicated executive body spearheading humanitarian drives, child empowerment, and volunteer initiatives across Bangladesh.'}
        </p>

        {/* Committee Sub-Navigation */}
        <CommitteeNavigation activeTab="executive" year={currentCommittee?.year} />
      </ScrollReveal>

      {/* Official Hierarchy & Search Bar */}
      <ScrollReveal effect="fade-up" delay={0.1} className="bg-white rounded-[2.5rem] border border-[#EAE3D9] p-6 sm:p-10 space-y-10 sm:space-y-12 shadow-warm-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-[#006A4E]" />
              {tText(currentCommittee.name)}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isBn ? 'মোট কার্যনির্বাহী সদস্য:' : 'Total Executive Members:'} <span className="font-bold text-slate-800">{allMembers.length} {isBn ? 'জন' : 'Leaders'}</span> &bull; {isBn ? 'অনুমোদিত প্রাতিষ্ঠানিক তালিকা' : 'Official Verified Roster'}
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

        {/* SEARCH RESULTS VIEW */}
        {isSearchActive ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-600 bg-[#FAF7F2] px-4 py-1.5 rounded-full border border-[#EAE3D9]">
                {isBn
                  ? `অনুসন্ধানের ফলাফল: ${searchResults.length} জন সদস্য পাওয়া গেছে`
                  : `Search Results: ${searchResults.length} member(s) found`}
              </span>
            </div>

            {searchResults.length > 0 ? (
              <StaggerGroup className="flex flex-wrap justify-center items-start gap-3 sm:gap-3.5 lg:gap-4 max-w-5xl mx-auto">
                {searchResults.map(m => (
                  <StaggerItem
                    key={m.id}
                    className="w-full max-w-[155px] sm:max-w-[170px] lg:max-w-[175px] xl:max-w-[185px] flex-shrink-0"
                  >
                    <div
                      onClick={() => setSelectedMember(m)}
                      className="group cursor-pointer bg-[#FAF7F2] hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 text-center border border-[#EAE3D9] hover:border-[#006A4E] hover:shadow-warm-md transition-all relative flex flex-col items-center h-full"
                    >
                      <div className="absolute top-2 right-2 bg-white text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        #{String(m.serialNumber).padStart(2, '0')}
                      </div>

                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-t-full rounded-b-xl overflow-hidden bg-slate-900 border border-slate-700/60 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0">
                        <ExecutiveAvatar
                          photoUrl={m.person.photoUrl}
                          fullName={m.person.fullName}
                          photoPosition={m.person.photoPosition}
                          photoZoom={m.person.photoZoom}
                          variant="emerald"
                        />
                      </div>

                      <div className="w-full">
                        <h4 className="text-xs sm:text-[13px] lg:text-[13.5px] font-bold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words">
                          {isBn ? m.person.banglaName : m.person.fullName}
                        </h4>

                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/70">
                          <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-slate-600 line-clamp-2 leading-tight block break-words">
                            {isBn ? m.position.name.bn : m.position.name.en}
                          </span>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                {isBn ? 'কোন সদস্য পাওয়া যায়নি।' : 'No members found matching your search.'}
              </div>
            )}
          </div>
        ) : (
          /* MASTER LAYOUT STRUCTURE */
          <div className="space-y-12 sm:space-y-16">
            {/* ============================================================ */}
            {/* SECTION 1 — MEMBERS #1–#5 (LOCKED: PRESIDENT, VPS, GS)       */}
            {/* ============================================================ */}
            <div className="executive-top space-y-8 sm:space-y-10">
              {/* TIER 1: PRESIDENT (#1) */}
              {member1 && (
                <div className="space-y-4 pt-2">
                  {renderTierBar(
                    getTierBar('presidential', 'Presidential Leadership', 'সভাপতি পরিষদ', 'Member #01'),
                    'Presidential Leadership',
                    'সভাপতি পরিষদ',
                    'green'
                  )}

                  <ScrollReveal effect="fade-up" className="flex justify-center">
                    <div
                      key={member1.id}
                      onClick={() => setSelectedMember(member1)}
                      className="group relative cursor-pointer max-w-sm w-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-warm-lg border-2 border-[#006A4E]/40 hover:border-[#006A4E] transition-all transform hover:-translate-y-1"
                    >
                      <div className="absolute top-4 right-4 bg-[#E6F3EF] text-[#00523C] font-mono font-bold text-xs px-2.5 py-1 rounded-full border border-[#C2E2D7]">
                        #{String(member1.serialNumber).padStart(2, '0')}
                      </div>

                      <div className="relative mx-auto w-32 h-36 sm:w-36 sm:h-40 rounded-t-full rounded-b-2xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border-2 border-[#006A4E]/40 shadow-inner mb-4 flex items-center justify-center">
                        <ExecutiveAvatar
                          photoUrl={member1.person.photoUrl}
                          fullName={member1.person.fullName}
                          photoPosition={member1.person.photoPosition}
                          photoZoom={member1.person.photoZoom}
                          variant="emerald"
                        />
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 group-hover:text-[#006A4E] transition-colors">
                        {isBn ? member1.person.banglaName : member1.person.fullName}
                      </h3>

                      <div className="mt-2 inline-block px-3.5 py-1 rounded-full bg-[#006A4E] text-white font-extrabold text-xs shadow-xs">
                        {isBn ? member1.position.name.bn : member1.position.name.en}
                      </div>

                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {member1.person.shortBio
                          ? tText(member1.person.shortBio)
                          : isBn
                          ? 'ইনফিনিটি বাংলাদেশ-এর সম্মানিত সভাপতি।'
                          : 'President of Infinity Bangladesh.'}
                      </p>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* TIER 2: SENIOR VICE PRESIDENT & VICE PRESIDENTS (#2–#4) */}
              {members2to4.length > 0 && (
                <div className="space-y-4 pt-4">
                  {renderTierBar(
                    getTierBar('vicePresidential', 'Vice Presidential Leadership', 'সহ-সভাপতি পরিষদ', 'Members #02–#04'),
                    'Vice Presidential Leadership',
                    'সহ-সভাপতি পরিষদ'
                  )}

                  <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {members2to4.map(m => (
                      <StaggerItem key={m.id}>
                        <div
                          onClick={() => setSelectedMember(m)}
                          className="group cursor-pointer bg-white text-slate-900 rounded-3xl p-5 sm:p-6 text-center shadow-warm-sm border border-[#EAE3D9] hover:border-[#006A4E] transition-all transform hover:-translate-y-1 relative h-full flex flex-col justify-between items-center"
                        >
                          <div className="absolute top-3 right-3 bg-[#FAF7F2] text-slate-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border border-[#EAE3D9]">
                            #{String(m.serialNumber).padStart(2, '0')}
                          </div>

                          <div className="w-full flex flex-col items-center">
                            <div className="relative mx-auto w-24 h-28 sm:w-28 sm:h-32 rounded-t-full rounded-b-2xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border border-[#006A4E]/30 mb-3 flex items-center justify-center shadow-xs">
                              <ExecutiveAvatar
                                photoUrl={m.person.photoUrl}
                                fullName={m.person.fullName}
                                photoPosition={m.person.photoPosition}
                                photoZoom={m.person.photoZoom}
                                variant="emerald"
                              />
                            </div>

                            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 group-hover:text-[#006A4E] transition-colors">
                              {isBn ? m.person.banglaName : m.person.fullName}
                            </h3>
                          </div>

                          <div className="mt-3 inline-block px-3 py-1 rounded-full bg-[#FAF7F2] text-slate-700 font-semibold text-xs border border-[#EAE3D9]">
                            {isBn ? m.position.name.bn : m.position.name.en}
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                </div>
              )}

              {/* TIER 3: GENERAL SECRETARY (#5) */}
              {member5 && (
                <div className="space-y-4 pt-4">
                  {renderTierBar(
                    getTierBar('secretariat', 'Secretariat Leadership', 'সাধারণ সম্পাদক', 'Member #05'),
                    'Secretariat Leadership',
                    'সাধারণ সম্পাদক',
                    'red'
                  )}

                  <ScrollReveal effect="fade-up" className="flex justify-center">
                    <div
                      key={member5.id}
                      onClick={() => setSelectedMember(member5)}
                      className="group relative cursor-pointer max-w-sm w-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-warm-lg border-2 border-[#D4182E]/40 hover:border-[#D4182E] transition-all transform hover:-translate-y-1"
                    >
                      <div className="absolute top-4 right-4 bg-[#FDF1F2] text-[#B31224] font-mono font-bold text-xs px-2.5 py-1 rounded-full border border-[#FCD3D7]">
                        #{String(member5.serialNumber).padStart(2, '0')}
                      </div>

                      <div className="relative mx-auto w-32 h-36 sm:w-36 sm:h-40 rounded-t-full rounded-b-2xl overflow-hidden bg-gradient-to-b from-[#8B0D1D] to-[#360208] border-2 border-[#D4182E]/40 shadow-inner mb-4 flex items-center justify-center">
                        <ExecutiveAvatar
                          photoUrl={member5.person.photoUrl}
                          fullName={member5.person.fullName}
                          photoPosition={member5.person.photoPosition}
                          photoZoom={member5.person.photoZoom}
                          variant="crimson"
                        />
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 group-hover:text-[#D4182E] transition-colors">
                        {isBn ? member5.person.banglaName : member5.person.fullName}
                      </h3>

                      <div className="mt-2 inline-block px-3.5 py-1 rounded-full bg-[#D4182E] text-white font-extrabold text-xs shadow-xs">
                        {isBn ? member5.position.name.bn : member5.position.name.en}
                      </div>

                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {member5.person.shortBio
                          ? tText(member5.person.shortBio)
                          : isBn
                          ? 'ইনফিনিটি বাংলাদেশ-এর সাধারণ সম্পাদক।'
                          : 'General Secretary of Infinity Bangladesh.'}
                      </p>
                    </div>
                  </ScrollReveal>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SECTION 2 — MEMBERS #6–#10 (JOINT GENERAL SECRETARIES)       */}
            {/* ============================================================ */}
            {members6to10.length > 0 && (
              <div className="executive-five space-y-4 pt-6 border-t border-slate-100">
                {renderTierBar(
                  getTierBar('jointSecretariat', 'Joint General Secretariat', 'যুগ্ম সাধারণ সম্পাদক পরিষদ', 'Members #06–#10'),
                  'Joint General Secretariat',
                  'যুগ্ম সাধারণ সম্পাদক পরিষদ'
                )}

                <StaggerGroup className="flex flex-wrap lg:flex-nowrap justify-center items-start gap-3 sm:gap-3.5 lg:gap-4 max-w-5xl mx-auto">
                  {members6to10.map(m => (
                    <StaggerItem
                      key={m.id}
                      className="w-full max-w-[155px] sm:max-w-[170px] lg:max-w-[175px] xl:max-w-[185px] flex-shrink-0"
                    >
                      <div
                        onClick={() => setSelectedMember(m)}
                        className="group cursor-pointer bg-[#FAF7F2] hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 text-center border border-[#EAE3D9] hover:border-[#006A4E] hover:shadow-warm-md transition-all relative flex flex-col items-center h-full"
                      >
                        <div className="absolute top-2 right-2 bg-white text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                          #{String(m.serialNumber).padStart(2, '0')}
                        </div>

                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-[#8B0D1D] to-[#360208] border border-rose-600/60 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0">
                          <ExecutiveAvatar
                            photoUrl={m.person.photoUrl}
                            fullName={m.person.fullName}
                            photoPosition={m.person.photoPosition}
                            photoZoom={m.person.photoZoom}
                            variant="crimson"
                          />
                        </div>

                        <div className="w-full">
                          <h4 className="text-xs sm:text-[13px] lg:text-[13.5px] font-bold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words">
                            {isBn ? m.person.banglaName : m.person.fullName}
                          </h4>

                          <div className="mt-1.5 pt-1.5 border-t border-slate-200/70">
                            <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-slate-600 line-clamp-2 leading-tight block break-words">
                              {isBn ? m.position.name.bn : m.position.name.en}
                            </span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            )}

            {/* ============================================================ */}
            {/* SECTION 3 — MEMBERS #11–#16 (ORGANIZING & FINANCE)           */}
            {/* Visual Order: [ #12, #11★, #13, #15, #14★, #16 ]             */}
            {/* ============================================================ */}
            {section3Items.length > 0 && (
              <div className="executive-six-a space-y-4 pt-6 border-t border-slate-100">
                {renderTierBar(
                  getTierBar('organizingFinance', 'Other Executive Committee Members', 'অন্যান্য কার্যনির্বাহী কমিটির সদস্যবৃন্দ', 'Members #11–#16'),
                  'Other Executive Committee Members',
                  'অন্যান্য কার্যনির্বাহী কমিটির সদস্যবৃন্দ'
                )}

                <StaggerGroup className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 max-w-6xl mx-auto">
                  {section3Items.map(({ member: m, isHighlighted }) => (
                    <StaggerItem
                      key={m.id}
                      className={
                        isHighlighted
                          ? 'w-full max-w-[175px] sm:max-w-[190px] lg:max-w-[184px] xl:max-w-[195px] flex-shrink-0'
                          : 'w-full max-w-[150px] sm:max-w-[165px] lg:max-w-[158px] xl:max-w-[168px] flex-shrink-0'
                      }
                    >
                      <div
                        onClick={() => setSelectedMember(m)}
                        className={
                          isHighlighted
                            ? 'group cursor-pointer bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-center border-2 border-[#006A4E]/50 hover:border-[#006A4E] shadow-warm-md hover:shadow-warm-lg transition-all relative flex flex-col items-center h-full'
                            : 'group cursor-pointer bg-[#FAF7F2] hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 text-center border border-[#EAE3D9] hover:border-[#006A4E] hover:shadow-warm-md transition-all relative flex flex-col items-center h-full'
                        }
                      >
                        <div
                          className={
                            isHighlighted
                              ? 'absolute top-2.5 right-2.5 bg-[#E6F3EF] text-[#00523C] font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border border-[#C2E2D7] shadow-2xs'
                              : 'absolute top-2 right-2 bg-white text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs'
                          }
                        >
                          #{String(m.serialNumber).padStart(2, '0')}
                        </div>

                        <div
                          className={
                            isHighlighted
                              ? 'w-20 h-24 sm:w-24 sm:h-28 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border border-[#006A4E]/40 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0'
                              : 'w-16 h-20 sm:w-20 sm:h-24 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700/60 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0'
                          }
                        >
                          <ExecutiveAvatar
                            photoUrl={m.person.photoUrl}
                            fullName={m.person.fullName}
                            photoPosition={m.person.photoPosition}
                            photoZoom={m.person.photoZoom}
                            variant={isHighlighted ? 'emerald' : 'slate'}
                          />
                        </div>

                        <div className="w-full">
                          <h4
                            className={
                              isHighlighted
                                ? 'text-sm sm:text-[14.5px] lg:text-[15px] font-extrabold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words'
                                : 'text-xs sm:text-[13px] lg:text-[13.5px] font-bold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words'
                            }
                          >
                            {isBn ? m.person.banglaName : m.person.fullName}
                          </h4>

                          <div className={isHighlighted ? 'mt-1.5 pt-1.5 border-t border-[#006A4E]/20' : 'mt-1.5 pt-1.5 border-t border-slate-200/70'}>
                            <span
                              className={
                                isHighlighted
                                  ? 'text-[11px] sm:text-[12px] font-bold text-[#006A4E] line-clamp-2 leading-tight block break-words'
                                  : 'text-[10.5px] sm:text-[11.5px] font-semibold text-slate-600 line-clamp-2 leading-tight block break-words'
                              }
                            >
                              {isBn ? m.position.name.bn : m.position.name.en}
                            </span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            )}

            {/* ============================================================ */}
            {/* SECTION 4 — MEMBERS #17–#22 (PUBLICITY, MEDIA & IT)          */}
            {/* Visual Order: [ #18, #17★, #19, #21, #20★, #22 ]             */}
            {/* ============================================================ */}
            {section4Items.length > 0 && (
              <div className="executive-six-b space-y-4 pt-6 border-t border-slate-100">
                {renderTierBar(
                  getTierBar('publicityMediaIt', 'Publicity, Media & IT Secretariat', 'প্রচার, তথ্য ও প্রযুক্তি বিভাগ', 'Members #17–#22'),
                  'Publicity, Media & IT Secretariat',
                  'প্রচার, তথ্য ও প্রযুক্তি বিভাগ'
                )}

                <StaggerGroup className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 max-w-6xl mx-auto">
                  {section4Items.map(({ member: m, isHighlighted }) => (
                    <StaggerItem
                      key={m.id}
                      className={
                        isHighlighted
                          ? 'w-full max-w-[175px] sm:max-w-[190px] lg:max-w-[184px] xl:max-w-[195px] flex-shrink-0'
                          : 'w-full max-w-[150px] sm:max-w-[165px] lg:max-w-[158px] xl:max-w-[168px] flex-shrink-0'
                      }
                    >
                      <div
                        onClick={() => setSelectedMember(m)}
                        className={
                          isHighlighted
                            ? 'group cursor-pointer bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-center border-2 border-[#006A4E]/50 hover:border-[#006A4E] shadow-warm-md hover:shadow-warm-lg transition-all relative flex flex-col items-center h-full'
                            : 'group cursor-pointer bg-[#FAF7F2] hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 text-center border border-[#EAE3D9] hover:border-[#006A4E] hover:shadow-warm-md transition-all relative flex flex-col items-center h-full'
                        }
                      >
                        <div
                          className={
                            isHighlighted
                              ? 'absolute top-2.5 right-2.5 bg-[#E6F3EF] text-[#00523C] font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border border-[#C2E2D7] shadow-2xs'
                              : 'absolute top-2 right-2 bg-white text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs'
                          }
                        >
                          #{String(m.serialNumber).padStart(2, '0')}
                        </div>

                        <div
                          className={
                            isHighlighted
                              ? 'w-20 h-24 sm:w-24 sm:h-28 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-[#004835] to-[#00261C] border border-[#006A4E]/40 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0'
                              : 'w-16 h-20 sm:w-20 sm:h-24 rounded-t-full rounded-b-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700/60 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0'
                          }
                        >
                          <ExecutiveAvatar
                            photoUrl={m.person.photoUrl}
                            fullName={m.person.fullName}
                            photoPosition={m.person.photoPosition}
                            photoZoom={m.person.photoZoom}
                            variant={isHighlighted ? 'emerald' : 'slate'}
                          />
                        </div>

                        <div className="w-full">
                          <h4
                            className={
                              isHighlighted
                                ? 'text-sm sm:text-[14.5px] lg:text-[15px] font-extrabold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words'
                                : 'text-xs sm:text-[13px] lg:text-[13.5px] font-bold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words'
                            }
                          >
                            {isBn ? m.person.banglaName : m.person.fullName}
                          </h4>

                          <div className={isHighlighted ? 'mt-1.5 pt-1.5 border-t border-[#006A4E]/20' : 'mt-1.5 pt-1.5 border-t border-slate-200/70'}>
                            <span
                              className={
                                isHighlighted
                                  ? 'text-[11px] sm:text-[12px] font-bold text-[#006A4E] line-clamp-2 leading-tight block break-words'
                                  : 'text-[10.5px] sm:text-[11.5px] font-semibold text-slate-600 line-clamp-2 leading-tight block break-words'
                              }
                            >
                              {isBn ? m.position.name.bn : m.position.name.en}
                            </span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            )}

            {/* ============================================================ */}
            {/* SECTION 5 — MEMBERS #23 TO LAST MEMBER (SUPPORTING MEMBERS) */}
            {/* Centered wrapping layout (Row 1: 5 cards, Row 2: centered)   */}
            {/* ============================================================ */}
            {members23Plus.length > 0 && (
              <div className="executive-supporting space-y-4 pt-6 border-t border-slate-100">
                {renderTierBar(
                  getTierBar('departmentalExecutive', 'Other Executive Committee Members', 'অন্যান্য কার্যনির্বাহী কমিটির সদস্যবৃন্দ', 'Members #23+'),
                  'Other Executive Committee Members',
                  'অন্যান্য কার্যনির্বাহী কমিটির সদস্যবৃন্দ'
                )}

                <StaggerGroup className="flex flex-wrap justify-center items-start gap-3 sm:gap-3.5 lg:gap-4 max-w-5xl mx-auto">
                  {members23Plus.map(m => (
                    <StaggerItem
                      key={m.id}
                      className="w-full max-w-[155px] sm:max-w-[170px] lg:max-w-[175px] xl:max-w-[185px] flex-shrink-0"
                    >
                      <div
                        onClick={() => setSelectedMember(m)}
                        className="group cursor-pointer bg-[#FAF7F2] hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 text-center border border-[#EAE3D9] hover:border-[#006A4E] hover:shadow-warm-md transition-all relative flex flex-col items-center h-full"
                      >
                        <div className="absolute top-2 right-2 bg-white text-slate-700 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                          #{String(m.serialNumber).padStart(2, '0')}
                        </div>

                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-t-full rounded-b-xl overflow-hidden bg-slate-900 border border-slate-700/60 mb-2 sm:mb-2.5 flex items-center justify-center shadow-xs flex-shrink-0">
                          <ExecutiveAvatar
                            photoUrl={m.person.photoUrl}
                            fullName={m.person.fullName}
                            photoPosition={m.person.photoPosition}
                            photoZoom={m.person.photoZoom}
                            variant="slate"
                          />
                        </div>

                        <div className="w-full">
                          <h4 className="text-xs sm:text-[13px] lg:text-[13.5px] font-bold text-slate-900 leading-tight group-hover:text-[#006A4E] transition-colors font-display line-clamp-2 break-words">
                            {isBn ? m.person.banglaName : m.person.fullName}
                          </h4>

                          <div className="mt-1.5 pt-1.5 border-t border-slate-200/70">
                            <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-slate-600 line-clamp-2 leading-tight block break-words">
                              {isBn ? m.position.name.bn : m.position.name.en}
                            </span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            )}
          </div>
        )}
      </ScrollReveal>

      {/* Quick Tier Bar Edit/Delete Modal */}
      {isEditingTierModalOpen && editingTierBar && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditingTierModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-display">
                    {isBn ? 'সেকশন ও টিয়ার বার সম্পাদনা' : 'Edit Committee Section Bar'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {editingTierBar.rangeLabel || editingTierBar.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingTierModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTierBar(editingTierBar);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isBn ? 'সেকশন শিরোনাম (English)' : 'Section Bar Title (English)'}
                </label>
                <input
                  type="text"
                  value={editingTierBar.title.en}
                  onChange={(e) => setEditingTierBar({
                    ...editingTierBar,
                    title: { ...editingTierBar.title, en: e.target.value }
                  })}
                  placeholder="e.g. JOINT GENERAL SECRETARIAT"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-bengali">
                  {isBn ? 'সেকশন শিরোনাম (বাংলা)' : 'Section Bar Title (Bengali)'}
                </label>
                <input
                  type="text"
                  value={editingTierBar.title.bn}
                  onChange={(e) => setEditingTierBar({
                    ...editingTierBar,
                    title: { ...editingTierBar.title, bn: e.target.value }
                  })}
                  placeholder="যেমন: যুগ্ম সাধারণ সম্পাদক পরিষদ"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs sm:text-sm font-bengali font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isBn ? 'সেকশন বারের দৃশ্যমানতা' : 'Section Bar Visibility'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {editingTierBar.visible
                      ? (isBn ? 'এই বারটি পেজে প্রদর্শিত হচ্ছে।' : 'This pill bar is currently visible on the page.')
                      : (isBn ? 'এই বারটি পেজে লুকানো/মুছে ফেলা হয়েছে।' : 'This pill bar is currently hidden/deleted.')}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTierBar.visible !== false}
                    onChange={(e) => setEditingTierBar({
                      ...editingTierBar,
                      visible: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006A4E]"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(isBn ? 'আপনি কি এই সেকশন বারটি লুকাতে/মুছতে চান?' : 'Delete / Hide this section bar?')) {
                      handleDeleteTierBar(editingTierBar.id);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'বার মুছে ফেলুন' : 'Delete / Hide Bar'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTierModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-extrabold shadow-warm-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  {isBn ? 'ক্রমিক নং:' : 'Serial No:'} #{String(selectedMember.serialNumber).padStart(2, '0')}
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
                <span className="font-medium text-slate-800">{tText(currentCommittee.name)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'কার্যকাল:' : 'Tenure Year:'}</span>
                <span className="font-bold text-slate-900">{currentCommittee.year}</span>
              </div>
              {selectedMember.person.district && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{isBn ? 'জেলা:' : 'District:'}</span>
                  <span className="text-slate-800">{selectedMember.person.district}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-center bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EAE3D9]">
              {selectedMember.person.shortBio
                ? tText(selectedMember.person.shortBio)
                : isBn
                ? 'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদের সম্মানিত সদস্য।'
                : 'Distinguished member of Infinity Bangladesh Executive Council.'}
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
