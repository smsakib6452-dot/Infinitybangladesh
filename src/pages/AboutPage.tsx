import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { OfficialInfoBadge, VerifiedOrganizationPledge } from '../components/OfficialInfoBadge';
import { JourneyVideoArchive } from '../components/JourneyVideoArchive';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { getAssetUrl } from '../lib/utils/assetHelper';
import {
  Heart,
  Users,
  Target,
  Eye,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface AboutPageProps {
  initialTab?: 'overview' | 'mission-vision' | 'team';
}

export const AboutPage: React.FC<AboutPageProps> = ({ initialTab = 'overview' }) => {
  const { isBn, tText } = useLanguage();
  const { navigate, currentPage } = useRouter();
  const { aboutSettings, settings } = useData();

  const orgName = settings.organizationName || (isBn ? 'ইনফিনিটি বাংলাদেশ' : 'Infinity Bangladesh');
  const teamId = settings.teamIdentity || 'Team Infinity';
  const sloganText = isBn
    ? (settings.primary_slogan?.bn || settings.slogan?.bn || 'মানবতার জন্য একতাবদ্ধ')
    : (settings.primary_slogan?.en || settings.slogan?.en || settings.tagline || 'United for Humanity');
  const estYear = aboutSettings.establishedYear || settings.establishedYear || '2015';
  const headLocation = aboutSettings.location || settings.officialAddress || 'Hathazari, Chattogram, Bangladesh';

  const [activeTab, setActiveTab] = useState<'overview' | 'mission-vision' | 'team'>(() => {
    if (currentPage === 'about/mission-vision') return 'mission-vision';
    return initialTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      {/* Header Banner */}
      <ScrollReveal effect="fade-up" className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{tText(aboutSettings.title) || (isBn ? 'আমাদের পরিচিতি ও ইতিহাস' : 'About Infinity Bangladesh')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          {teamId} — {sloganText}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {tText(aboutSettings.subtitle) || (isBn
            ? `${estYear} সালে চট্টগ্রামের হাটহাজারী থেকে একদল স্বপ্নবান তরুণের হাত ধরে যাত্রা শুরু। দেশের সচেতন যুবসমাজকে একত্রিত করে সুবিধাবঞ্চিত ও প্রান্তিক জনগোষ্ঠীর মুখে হাসি ফোটাতে আমাদের নিরন্তর প্রচেষ্টা।`
            : `Founded in ${headLocation} in ${estYear}. Uniting passionate youth changemakers across Bangladesh to serve underprivileged children and distressed communities with empathy, dignity, and radical transparency.`)}
        </p>

        {/* Sub Navigation Tabs */}
        <div className="pt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#006A4E] text-white shadow-warm-sm'
                : 'bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9]'
            }`}
          >
            {isBn ? 'সংক্ষিপ্ত পরিচয় ও গল্প' : 'Overview & Story'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mission-vision')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'mission-vision'
                ? 'bg-[#006A4E] text-white shadow-warm-sm'
                : 'bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9]'
            }`}
          >
            {isBn ? 'লক্ষ্য ও মূল্যবোধ' : 'Mission & Values'}
          </button>
        </div>
      </ScrollReveal>

      {/* TAB 1: OVERVIEW & STORY */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Main Story & Purpose */}
          <ScrollReveal effect="fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isBn ? `প্রতিষ্ঠা: ${estYear} সাল` : `Established in ${estYear}`}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                  {isBn ? 'আমাদের সূচনার কথা' : 'Our Story & Purpose'}
                </h2>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {tText(aboutSettings.history) || (isBn
                    ? `${orgName} কোনো বাণিজ্যিক প্রতিষ্ঠান বা কৃত্রিম এনজিও নয়। এটি চট্টগ্রামের হাটহাজারী থেকে যাত্রা শুরু করা এমন কিছু সহৃদয় তরুণ-তরুণীর সম্মিলিত প্রয়াস, যারা সমাজের অবহেলিত মানুষের বেদনাকে হৃদয়ে অনুভব করে নিজেদের জায়গা থেকে এগিয়ে এসেছেন।`
                    : `${orgName} was born from a simple yet powerful belief in ${headLocation}: real change happens when compassionate youth decide not to look away. Driven entirely by volunteers, ${teamId} unites changemakers across Bangladesh to address grassroots vulnerabilities.`)}
                </p>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {isBn
                    ? 'পথশিশুদের ঈদের নতুন জামা দেওয়া থেকে শুরু করে তীব্র শীতে কম্বল বিতরণ এবং আকস্মিক বন্যায় দুর্গতদের কাছে খাবার পৌঁছে দেওয়া — প্রতিটি পদক্ষেপে আমাদের একমাত্র উদ্দেশ্য থাকে মানুষের মুখে হাসি ফোটানো এবং তাদের মানবিক মর্যাদা অটুট রাখা।'
                    : 'From providing brand-new festive clothing to street children during Eid, to midnight blanket drives during cold waves, our initiatives are shaped by genuine empathy, respect, and zero waste.'}
                </p>

                <div className="p-4 bg-[#E6F3EF] rounded-2xl border border-[#C2E2D7] space-y-2">
                  <div className="flex items-center gap-2 text-[#00523C] font-bold text-xs sm:text-sm">
                    <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                    {isBn ? 'অফিসিয়াল সাংগঠনিক তথ্য ও অবস্থান' : 'Official Governance & Location'}
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {isBn
                      ? `হেডকোয়ার্টার: ${headLocation}। সকল প্রাতিষ্ঠানিক সনদ, সরকারি নিরীক্ষা ও অনুদানের হিসাব স্বচ্ছতার সাথে সংরক্ষিত।`
                      : `Headquarters: ${headLocation}. Established in ${estYear}. Maintained strictly according to factual verified status without fabricated figures.`}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6">
                <JourneyVideoArchive headLocation={headLocation} estYear={estYear} />
              </div>
            </div>
          </ScrollReveal>

          {/* Pillars of Action */}
          <div className="space-y-4 pt-6">
            <div className="text-center space-y-1.5 max-w-xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                {isBn ? 'আমাদের তিনটি মূল ভিত্তি' : 'Our Three Ethical Pillars'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'যে তিনটি মূলনীতির ওপর ইনফিনিটি বাংলাদেশের সকল মানবিক কার্যক্রম প্রতিষ্ঠিত।' : 'The core ethical pillars guiding every initiative of Team Infinity.'}
              </p>
            </div>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <StaggerItem className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xs border border-[#EAE3D9] space-y-4 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group">
                <div className="w-10 h-1 bg-gradient-to-r from-[#006A4E] to-emerald-400 rounded-full" />
                <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] text-[#006A4E] border border-[#C2E2D7] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 font-display">
                    {isBn ? 'মানবিক মর্যাদা রক্ষা' : 'Human Dignity First'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isBn
                      ? 'সহায়তা প্রদান কোনো অনুগ্রহ নয়, বরং মানুষের অধিকার। তাই ছবি তোলার নামে উপকারভোগীকে অমর্যাদা করা আমাদের নীতিবিরুদ্ধ।'
                      : 'Aid is a human right, not a favor. We strictly protect beneficiary privacy and avoid humiliating public photography.'}
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xs border border-[#EAE3D9] space-y-4 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group">
                <div className="w-10 h-1 bg-gradient-to-r from-[#006A4E] to-emerald-400 rounded-full" />
                <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] text-[#006A4E] border border-[#C2E2D7] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 font-display">
                    {isBn ? 'শতভাগ প্রকাশ্য স্বচ্ছতা' : 'Radical Transparency'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isBn
                      ? 'সংগৃহীত প্রতিটি অর্থের সদ্ব্যবহার নিশ্চিত করে বিস্তারিত হিসাব ও বিতরণ রিপোর্ট জনসমক্ষে প্রকাশ করা হয়।'
                      : 'Every single donation is documented and verified through regular audit reports and public expense records.'}
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xs border border-[#EAE3D9] space-y-4 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group">
                <div className="w-10 h-1 bg-gradient-to-r from-[#006A4E] to-emerald-400 rounded-full" />
                <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] text-[#006A4E] border border-[#C2E2D7] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 font-display">
                    {isBn ? 'স্বেচ্ছাসেবী তারুণ্য' : 'Youth Leadership'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isBn
                      ? 'দেশের সচেতন তরুণ প্রজন্মকে ইতিবাচক সামাজিক কর্মকাণ্ডে সম্পৃক্ত করে দক্ষ ও দায়িত্বশীল নাগরিক হিসেবে গড়ে তোলা।'
                      : 'Empowering students and young professionals to lead humanitarian drives with high ethical standards.'}
                  </p>
                </div>
              </StaggerItem>
            </StaggerGroup>
          </div>

          {/* 11-Year Journey Milestone Timeline */}
          <div className="pt-10 sm:pt-14 space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? '১১ বছরের মানবিক পথচলা' : '11-Year Journey (2015 – 2026)'}</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                {isBn ? 'ঐতিহাসিক মাইলফলক ও মানবতার অভিযাত্রা' : 'Key Milestones of Compassion'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isBn
                  ? '২০১৫ সালে হাটহাজারীর একদল স্বপ্নবান তরুণের হাত ধরে শুরু হওয়া ক্ষুদ্র উদ্যোগ আজ দেশজুড়ে এক বিশ্বাসযোগ্য মানবিক প্ল্যাটফর্ম।'
                  : 'From grassroots initiatives in 2015 to nationwide crisis responses, trace the milestone chapters of Team Infinity.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[
                {
                  year: '2015',
                  title: { bn: 'যাত্রার আনুষ্ঠানিক সূচনা', en: 'Foundation & First Step' },
                  location: { bn: 'হাটহাজারী, চট্টগ্রাম', en: 'Hathazari, Chattogram' },
                  desc: {
                    bn: 'সমাজের সুবিধাবঞ্চিত শিশুদের মুখে হাসি ফোটানোর স্বপ্ন নিয়ে একদল তরুণ শিক্ষার্থীর হাত ধরে ইনফিনিটি বাংলাদেশের জন্ম।',
                    en: 'Founded in Hathazari by passionate youth dedicated to uplifting underprivileged children and distressed families.'
                  },
                  tag: { bn: 'প্রতিষ্ঠা', en: 'Founded' },
                  icon: Sparkles
                },
                {
                  year: '2018',
                  title: { bn: 'শীতবস্ত্র ও শিক্ষা সহায়তা বিস্তার', en: 'Winter Relief & Education Drives' },
                  location: { bn: 'প্রান্তিক জনপদ', en: 'Grassroots Communities' },
                  desc: {
                    bn: 'তীব্র শীতে অসহায় প্রবীণ ও শিশুদের উষ্ণ কম্বল এবং অসচ্ছল শিক্ষার্থীদের শিক্ষাসামগ্রী পৌঁছে দেওয়ার স্থায়ী কর্মসূচি শুরু।',
                    en: 'Expanded grassroots winter warmth packages and stationery support for marginalized rural students.'
                  },
                  tag: { bn: 'সম্প্রসারণ', en: 'Expansion' },
                  icon: Heart
                },
                {
                  year: '2020',
                  title: { bn: 'কোভিড-১৯ দুর্যোগ সহায়তা মিশন', en: 'COVID-19 Pandemic Response' },
                  location: { bn: 'জরুরি এলাকা', en: 'Emergency Relief' },
                  desc: {
                    bn: 'মহামারীর ক্রান্তিলগ্নে দিনমজুর ও কর্মহীন পরিবারের ঘরে ঘরে নীরবে পৌঁছে দেওয়া হয় জরুরি খাদ্যসামগ্রী ও সুরক্ষা কিট।',
                    en: 'Provided emergency grocery rations and essential sanitation supplies to daily-wage workers during lockdowns.'
                  },
                  tag: { bn: 'জরুরি ত্রাণ', en: 'Emergency Aid' },
                  icon: ShieldCheck
                },
                {
                  year: '2022',
                  title: { bn: 'ইনফিনিটি লাইফলাইন রক্তদান নেটওয়ার্ক', en: 'Infinity Blood Lifeline Network' },
                  location: { bn: 'সারাদেশে', en: 'Nationwide' },
                  desc: {
                    bn: 'জরুরি রক্তের প্রয়োজনে মুমূর্ষু রোগীর পাশে দাঁড়াতে তরুণ রক্তদাতাদের সমন্বয়ে গড়ে ওঠে এক নির্ভরযোগ্য রক্তদান পরিবার।',
                    en: 'Launched dedicated voluntary blood donation network connecting donors with patients in emergency critical care.'
                  },
                  tag: { bn: 'লাইফলাইন', en: 'Blood Network' },
                  icon: Calendar
                },
                {
                  year: '2024',
                  title: { bn: 'পূর্বাঞ্চলীয় ভয়াবহ বন্যা পুনর্বাসন', en: 'Eastern Flood Rescue & Rebuild' },
                  location: { bn: 'ফেনী, নোয়াখালী ও কুমিল্লা', en: 'Feni, Noakhali & Cumilla' },
                  desc: {
                    bn: 'আকস্মিক বন্যায় পানিবন্দী হাজারো মানুষের মাঝে শুকনো খাবার, বিশুদ্ধ পানি, স্যালাইন ও গৃহনির্মাণ সামগ্রী বিতরণ।',
                    en: 'Mobilized massive ground rescue, clean drinking water, medical kits, and post-flood rehabilitation drives.'
                  },
                  tag: { bn: 'পুনর্বাসন', en: 'Rehabilitation' },
                  icon: Users
                },
                {
                  year: '2026',
                  title: { bn: 'ডিজিটাল রূপান্তর ও তারুণ্যের ঐক্য', en: 'Digital Platform & Verified Impact' },
                  location: { bn: 'বাংলাদেশ', en: 'Across Bangladesh' },
                  desc: {
                    bn: '১০০% স্বচ্ছতা, জবাবদিহিতা ও আধুনিক ডিজিটাল প্ল্যাটফর্মের মাধ্যমে দেশজুড়ে মানবিক তারুণ্যকে এক পতাকাতলে আনয়ন।',
                    en: 'Uniting conscious youth nationwide with transparent digital governance, audited groundwork, and zero waste.'
                  },
                  tag: { bn: 'বর্তমান ও ভবিষ্যৎ', en: 'Present & Beyond' },
                  icon: Award
                }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="relative bg-white/95 backdrop-blur-xs rounded-3xl border border-[#EAE3D9] p-6 sm:p-7 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-4 group hover:border-[#006A4E]/40"
                  >
                    {/* Top Bar: Year & Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#004835] text-white flex items-center justify-center font-bold font-display text-sm shadow-xs border border-white/20">
                          {item.year}
                        </div>
                        <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
                          {isBn ? item.tag.bn : item.tag.en}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-[#006A4E] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#006A4E] group-hover:text-white transition-all">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Milestone Title & Location */}
                    <div className="space-y-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 font-display group-hover:text-[#006A4E] transition-colors">
                        {isBn ? item.title.bn : item.title.en}
                      </h4>
                      <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#006A4E] shrink-0" />
                        <span>{isBn ? item.location.bn : item.location.en}</span>
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal pt-2 border-t border-slate-100">
                      {isBn ? item.desc.bn : item.desc.en}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISSION, VISION & VALUES */}
      {activeTab === 'mission-vision' && (
        <div className="space-y-12">
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <StaggerItem className="bg-gradient-to-br from-[#006A4E] to-[#0A382A] text-white rounded-3xl p-8 sm:p-10 space-y-4 shadow-warm-lg">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-200 flex items-center justify-center border border-white/20">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-display">
                {isBn ? 'আমাদের লক্ষ্য (Mission)' : 'Our Mission'}
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                {tText(aboutSettings.mission) || (isBn
                  ? 'সুবিধাবঞ্চিত শিশু ও দারিদ্র্যপীড়িত জনগোষ্ঠীর সামাজিক সুরক্ষা, শিক্ষা সহায়তা, দুর্যোগকালীন পুনর্বাসন এবং মৌসুমি খাদ্য ও বস্ত্র সহায়তা পৌঁছে দেওয়া — সম্পূর্ণ নিরপেক্ষতা, স্বচ্ছতা এবং পরম আন্তরিকতার সাথে।'
                  : 'To stand with underprivileged children and distressed families through seasonal welfare drives, educational supplies, winter relief, and disaster aid, driven by youth volunteers with total transparency and dignity.')}
              </p>
            </StaggerItem>

            {/* Vision */}
            <StaggerItem className="bg-gradient-to-br from-[#11241E] to-[#0A1612] text-white rounded-3xl p-8 sm:p-10 space-y-4 shadow-warm-lg border border-emerald-900/60">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 text-amber-400 flex items-center justify-center border border-emerald-800">
                <Eye className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-display">
                {isBn ? 'আমাদের রূপকল্প (Vision)' : 'Our Vision'}
              </h2>
              <p className="text-emerald-200/90 text-xs sm:text-sm leading-relaxed">
                {tText(aboutSettings.vision) || (isBn
                  ? 'একটি মানবিক, সহানুভূতিশীল ও বৈষম্যহীন বাংলাদেশ গড়ে তোলা — যেখানে প্রতিটি শিশুর মুখে হাসি থাকবে, প্রতিটি মানুষ সম্মানের সাথে বাঁচবে এবং যুবসমাজ ইতিবাচক সমাজ গঠনে নেতৃত্ব দেবে।'
                  : 'To inspire a compassionate, resilient Bangladesh where every child has access to basic care and education, every vulnerable citizen is treated with dignity, and youth actively shape a better society.')}
              </p>
            </StaggerItem>
          </StaggerGroup>

          {/* Core Values */}
          <ScrollReveal effect="fade-up" className="space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900 text-center font-display">
              {isBn ? 'আমাদের মূল মূল্যবোধসমূহ' : 'Our Core Values'}
            </h3>

            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StaggerItem className="p-6 bg-white rounded-3xl border border-[#EAE3D9] space-y-2 shadow-warm-sm hover:-translate-y-1 transition-all">
                <span className="text-xs font-bold uppercase text-[#006A4E] tracking-wider">01. Humanity</span>
                <h4 className="text-lg font-bold text-slate-900 font-display">{isBn ? 'মানবতা' : 'Humanity'}</h4>
                <p className="text-xs text-slate-600">{isBn ? 'মানুষের কষ্ট লাঘব করাই আমাদের সর্বপ্রধান ব্রত।' : 'Alleviating human suffering with genuine empathy.'}</p>
              </StaggerItem>

              <StaggerItem className="p-6 bg-white rounded-3xl border border-[#EAE3D9] space-y-2 shadow-warm-sm hover:-translate-y-1 transition-all">
                <span className="text-xs font-bold uppercase text-[#006A4E] tracking-wider">02. Integrity</span>
                <h4 className="text-lg font-bold text-slate-900 font-display">{isBn ? 'সততা ও স্বচ্ছতা' : 'Integrity'}</h4>
                <p className="text-xs text-slate-600">{isBn ? 'অর্থ ও তথ্যের সঠিক হিসাব সংরক্ষণ এবং জবাবদিহিতা।' : 'Uncompromising honesty in fund stewardship.'}</p>
              </StaggerItem>

              <StaggerItem className="p-6 bg-white rounded-3xl border border-[#EAE3D9] space-y-2 shadow-warm-sm hover:-translate-y-1 transition-all">
                <span className="text-xs font-bold uppercase text-[#006A4E] tracking-wider">03. Dignity</span>
                <h4 className="text-lg font-bold text-slate-900 font-display">{isBn ? 'মর্যাদাবোধ' : 'Dignity'}</h4>
                <p className="text-xs text-slate-600">{isBn ? 'উপকারভোগীর আত্মসম্মানকে সর্বোচ্চ মূল্যায়ন করা।' : 'Upholding self-respect in every interaction.'}</p>
              </StaggerItem>

              <StaggerItem className="p-6 bg-white rounded-3xl border border-[#EAE3D9] space-y-2 shadow-warm-sm hover:-translate-y-1 transition-all">
                <span className="text-xs font-bold uppercase text-[#006A4E] tracking-wider">04. Unity</span>
                <h4 className="text-lg font-bold text-slate-900 font-display">{isBn ? 'একতা ও ভ্রাতৃত্ব' : 'Unity'}</h4>
                <p className="text-xs text-slate-600">{isBn ? 'টিম ইনফিনিটি একতাবদ্ধ পরিবারের মতো কাজ করে।' : 'Standing as one dedicated family for humanity.'}</p>
              </StaggerItem>
            </StaggerGroup>
          </ScrollReveal>
        </div>
      )}

      {/* Verified Org Pledge */}
      <ScrollReveal effect="fade-up">
        <VerifiedOrganizationPledge />
      </ScrollReveal>
    </div>
  );
};
