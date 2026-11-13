import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Sliders,
  RotateCcw,
  Check,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Target,
  Eye,
  EyeOff,
  Sparkles,
  ImageIcon,
  FolderOpen,
  ShieldCheck,
  Activity,
  Users,
  UserCheck,
  BookOpen,
  Flag,
  Heart,
  HeartPulse,
  Droplet,
  Search,
  Newspaper,
  ShieldAlert,
  Phone
} from 'lucide-react';
import { AdminTab } from '../pages/AdminPage';
import { getAssetUrl } from '../lib/utils/assetHelper';

interface AdminHomepageManagerProps {
  setActiveTab: (tab: AdminTab) => void;
  openMediaPicker: (onSelect: (url: string) => void) => void;
  showToast: (msg: string) => void;
}

export const AdminHomepageManager: React.FC<AdminHomepageManagerProps> = ({
  setActiveTab,
  openMediaPicker,
  showToast
}) => {
  const { isBn, tText } = useLanguage();
  const {
    homepageConfig,
    updateHomepageConfig,
    aboutSettings,
    bloodDonationSettings,
    updateBloodDonationSettings,
    metrics,
    programs,
    campaigns,
    stories,
    gallery,
    pressCoverages,
    bloodDonors,
    emergencyBloodRequests
  } = useData();

  const totalRegisteredDonors = bloodDonors.filter(d => d.approvalStatus === 'APPROVED').length;
  const totalActiveDonors = bloodDonors.filter(d => d.approvalStatus === 'APPROVED' && d.availabilityStatus !== 'UNAVAILABLE').length;
  const pendingBloodRequests = emergencyBloodRequests.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length;

  const toggleSectionVisibility = (sectionKey: string) => {
    const isCurrentlyVisible = homepageConfig.sectionVisibility?.[sectionKey] !== false;
    const nextState = !isCurrentlyVisible;
    const newVis: Record<string, boolean> = {
      ...(homepageConfig.sectionVisibility || {}),
      [sectionKey]: nextState
    };

    // Sync alias variations to ensure 100% reliability across all keys
    if (sectionKey === 'volunteer') {
      newVis.volunteerBanner = nextState;
      newVis.volunteer_banner = nextState;
    } else if (sectionKey === 'support') {
      newVis.supportBanner = nextState;
      newVis.support_banner = nextState;
    } else if (sectionKey === 'transparency') {
      newVis.transparencySection = nextState;
      newVis.transparency_section = nextState;
    } else if (sectionKey === 'lifeline' || sectionKey === 'blood_donation') {
      newVis.lifeline = nextState;
      newVis.blood_donation = nextState;
      newVis.lifelineSection = nextState;
    } else if (sectionKey === 'about' || sectionKey === 'about_preview') {
      newVis.about = nextState;
      newVis.about_preview = nextState;
      newVis.aboutPreview = nextState;
    } else if (sectionKey === 'programs') {
      newVis.programsSection = nextState;
    } else if (sectionKey === 'campaigns') {
      newVis.campaignsSection = nextState;
    } else if (sectionKey === 'stories') {
      newVis.storiesSection = nextState;
    } else if (sectionKey === 'gallery') {
      newVis.gallerySection = nextState;
    } else if (sectionKey === 'press') {
      newVis.pressSection = nextState;
    } else if (sectionKey === 'impact') {
      newVis.impactSection = nextState;
    }

    updateHomepageConfig({ sectionVisibility: newVis });
    showToast(nextState ? (isBn ? `হোমপেজে '${sectionKey}' সক্রিয় করা হয়েছে` : `Shown '${sectionKey}' on homepage`) : (isBn ? `হোমপেজ থেকে '${sectionKey}' লুকানো হয়েছে` : `Hidden '${sectionKey}' from homepage`));
  };

  const renderSectionVisibilityButton = (sectionKey: string) => {
    const isVisible = homepageConfig.sectionVisibility?.[sectionKey] !== false;
    return (
      <button
        type="button"
        onClick={() => toggleSectionVisibility(sectionKey)}
        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${isVisible
            ? 'bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7] hover:bg-[#D1ECE3]'
            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
        title={isVisible ? 'Click to hide this section from Homepage' : 'Click to show this section on Homepage'}
      >
        {isVisible ? <Eye className="w-3.5 h-3.5 text-[#006A4E]" /> : <EyeOff className="w-3.5 h-3.5 text-rose-600" />}
        <span>{isVisible ? (isBn ? 'হোমপেজে দৃশ্যমান (Active)' : 'Active on Homepage') : (isBn ? 'লুকানো রয়েছে (Hidden)' : 'Hidden from Homepage')}</span>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header Control Bar */}
      <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F3EF] text-[#006A4E] text-xs font-extrabold mb-2 border border-[#C2E2D7]">
            <Sliders className="w-3.5 h-3.5" />
            <span>{isBn ? '১:১ হোমপেজ এডিটর কন্ট্রোল সেন্টার' : '1:1 Homepage Editorial Control Center'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
            {isBn ? 'হোমপেজ এডিটর ও সেকশন ম্যানেজার' : 'Homepage Hero, Banners & Section Manager'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {isBn
              ? 'পাবলিক হোমপেজের প্রতিটি সেকশন হুবহু একই ক্রমে এখানে সাজানো। যেকোনো সেকশনের লেখা, ছবি, বাটন ও দৃশ্যমানতা সরাসরি পরিবর্তন করুন।'
              : 'Every public homepage section is organized in the exact 1:1 sequence below. Directly customize text, images, action CTAs, and visibility.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              const defaultOrder = [
                'hero',
                'impact',
                'about',
                'programs',
                'campaigns',
                'stories',
                'lifeline',
                'gallery',
                'press',
                'volunteer',
                'transparency',
                'support'
              ];
              updateHomepageConfig({ sectionOrder: defaultOrder });
              showToast('Reset section order to default layout');
            }}
            className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D9] text-slate-700 text-xs font-bold border border-[#EAE3D9] flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'ডিফল্ট ক্রম' : 'Reset Order'}</span>
          </button>

          <button
            type="button"
            onClick={() => showToast(isBn ? 'হোমপেজ সেটিংস সংরক্ষিত' : 'Homepage settings saved')}
            className="px-5 py-2 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isBn ? 'সংরক্ষণ সম্পন্ন' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Master Section Sequence & Visibility Quick Map */}
      <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#006A4E]" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              {isBn ? 'হোমপেজ সেকশন ক্রম ও দৃশ্যমানতা টেবিল' : 'Homepage Section Sequence & Visibility Quick Map'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {homepageConfig.sectionOrder.length} {isBn ? 'টি সেকশন সক্রিয়' : 'Sections Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {homepageConfig.sectionOrder.map((sectionKey, index) => {
            const isVisible = homepageConfig.sectionVisibility[sectionKey] !== false;
            const sectionNames: Record<string, { num: string; en: string; bn: string }> = {
              hero: { num: '01', en: 'Hero Banner & Slogan', bn: 'হিরো ব্যানার ও মূল স্লোগান' },
              impact: { num: 'CMS', en: 'Impact Metrics (Managed in Impact CMS)', bn: 'পরিসংখ্যান (ইমপ্যাক্ট ট্যাবে পরিচালিত)' },
              about: { num: '02', en: 'About Preview & Purpose', bn: 'সংগঠন পরিচিতি ও লক্ষ্য' },
              programs: { num: '03', en: 'Flagship Programs', bn: 'ধারাবাহিক মানবিক কর্মসূচি' },
              campaigns: { num: '04', en: 'Relief Drives & Campaigns', bn: 'মাঠপর্যায়ের ক্যাম্পেইন' },
              stories: { num: '05', en: 'Impact Stories of Hope', bn: 'বাস্তব জীবনের রূপান্তরের গল্প' },
              lifeline: { num: '06', en: 'Infinity LifeLine Spotlight', bn: 'ইনফিনিটি লাইফলাইন রক্তদান স্পটলাইট' },
              blood_donation: { num: '06', en: 'Infinity LifeLine Spotlight', bn: 'ইনফিনিটি লাইফলাইন রক্তদান স্পটলাইট' },
              gallery: { num: '07', en: 'Photo Gallery & Moments', bn: 'মাঠপর্যায়ের স্মৃতি ও আলোকচিত্র' },
              press: { num: '08', en: 'News & Media Coverage', bn: 'গণমাধ্যমে প্রকাশিত প্রতিবেদন' },
              volunteer: { num: '09', en: 'Volunteer CTA Banner', bn: 'স্বেচ্ছাসেবী আহ্বান ব্যানার' },
              transparency: { num: '10', en: 'Transparency Pledge', bn: 'স্বচ্ছতা ও সততার অঙ্গীকার' },
              support: { num: '11', en: 'Support & Donation Banner', bn: 'অনলাইন অনুদান ও সহায়তা ব্যানার' }
            };
            const sInfo = sectionNames[sectionKey] || { num: `0${index + 1}`, en: `${sectionKey} Section`, bn: `${sectionKey} সেকশন` };

            return (
              <div
                key={sectionKey}
                className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-white text-slate-800 text-xs font-extrabold flex items-center justify-center border border-slate-200 shrink-0 font-mono">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {isBn ? sInfo.bn : sInfo.en}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      id: {sectionKey}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      if (index === 0) return;
                      const newOrder = [...homepageConfig.sectionOrder];
                      const temp = newOrder[index - 1];
                      newOrder[index - 1] = newOrder[index];
                      newOrder[index] = temp;
                      updateHomepageConfig({ sectionOrder: newOrder });
                      showToast(`Moved ${sectionKey} up`);
                    }}
                    className="p-1 rounded-lg bg-white border border-slate-200 hover:border-[#006A4E] hover:text-[#006A4E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={index === homepageConfig.sectionOrder.length - 1}
                    onClick={() => {
                      if (index === homepageConfig.sectionOrder.length - 1) return;
                      const newOrder = [...homepageConfig.sectionOrder];
                      const temp = newOrder[index + 1];
                      newOrder[index + 1] = newOrder[index];
                      newOrder[index] = temp;
                      updateHomepageConfig({ sectionOrder: newOrder });
                      showToast(`Moved ${sectionKey} down`);
                    }}
                    className="p-1 rounded-lg bg-white border border-slate-200 hover:border-[#006A4E] hover:text-[#006A4E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(sectionKey)}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${isVisible ? 'bg-[#E6F3EF] text-[#00523C]' : 'bg-slate-200 text-slate-600'
                      }`}
                    title={isVisible ? 'Visible on Homepage (Click to hide)' : 'Hidden from Homepage (Click to show)'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 01. HERO SECTION */}
      {/* ============================================================= */}
      <div id="sec-01-hero" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        {/* Card Header & 1:1 Mapping Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              01
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'হিরো সেকশন (Hero Section)' : 'Hero Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: Hero Headline, Slogan, Real Photo, Badges & 3 CTAs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('hero')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'hero'
            </span>
          </div>
        </div>

        {/* Slogan & Eyebrow */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hero Slogan & Eyebrow Badge (আইব্রো ব্যাজ)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eyebrow (English)</label>
              <input
                type="text"
                value={homepageConfig.hero.eyebrow.en}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, eyebrow: { ...homepageConfig.hero.eyebrow, en: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eyebrow (বাংলা)</label>
              <input
                type="text"
                value={homepageConfig.hero.eyebrow.bn}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, eyebrow: { ...homepageConfig.hero.eyebrow, bn: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>
        </div>

        {/* Main Headlines */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Main Headline & Green Highlight (মূল শিরোনাম ও হাইলাইট)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Headline Main (English)</label>
              <input
                type="text"
                value={homepageConfig.hero.headlineMain.en}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, headlineMain: { ...homepageConfig.hero.headlineMain, en: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Headline Highlight (English)</label>
              <input
                type="text"
                value={homepageConfig.hero.headlineHighlight.en}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, headlineHighlight: { ...homepageConfig.hero.headlineHighlight, en: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Headline Main (বাংলা)</label>
              <input
                type="text"
                value={homepageConfig.hero.headlineMain.bn}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, headlineMain: { ...homepageConfig.hero.headlineMain, bn: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Headline Highlight (বাংলা)</label>
              <input
                type="text"
                value={homepageConfig.hero.headlineHighlight.bn}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, headlineHighlight: { ...homepageConfig.hero.headlineHighlight, bn: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>
        </div>

        {/* Supporting Description */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Supporting Description (বিবরণ প্যারাগ্রাফ)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description (English)</label>
              <textarea
                rows={3}
                value={homepageConfig.hero.description.en}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, description: { ...homepageConfig.hero.description, en: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">বিবরণ (বাংলা)</label>
              <textarea
                rows={3}
                value={homepageConfig.hero.description.bn}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, description: { ...homepageConfig.hero.description, bn: e.target.value } }
                })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>
        </div>

        {/* Hero Real Photography & Established Badge */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#006A4E]" />
              <span>Hero Cover Photo, Crop & Badges (হিরো কভার ফটো ও ব্যাজ)</span>
            </h4>
            <button
              type="button"
              onClick={() => openMediaPicker((url) => {
                updateHomepageConfig({
                  hero: { ...homepageConfig.hero, heroImageUrl: url }
                });
                showToast('Hero image updated from Media Library');
              })}
              className="text-xs text-[#006A4E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Pick from Media Library</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-4 aspect-4/3 rounded-2xl overflow-hidden border border-[#EAE3D9] bg-slate-100 relative">
              <img
                src={getAssetUrl(homepageConfig.hero.heroImageUrl)}
                alt="Hero Preview"
                style={{ objectPosition: homepageConfig.hero.heroImageCropPosition || 'center center' }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-lg truncate">
                Crop: {homepageConfig.hero.heroImageCropPosition || 'center center'}
              </div>
            </div>

            <div className="sm:col-span-8 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hero Image URL</label>
                <input
                  type="text"
                  value={homepageConfig.hero.heroImageUrl}
                  onChange={(e) => updateHomepageConfig({
                    hero: { ...homepageConfig.hero, heroImageUrl: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Badge Title (EN)</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.badgeTitle?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      hero: {
                        ...homepageConfig.hero,
                        badgeTitle: { ...(homepageConfig.hero.badgeTitle || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Established 2015"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">ব্যাজ শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.badgeTitle?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      hero: {
                        ...homepageConfig.hero,
                        badgeTitle: { ...(homepageConfig.hero.badgeTitle || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="প্রতিষ্ঠিত ২০১৫"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Established Year</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.badgeYear}
                    onChange={(e) => updateHomepageConfig({
                      hero: { ...homepageConfig.hero, badgeYear: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Badge Location</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.badgeLocation}
                    onChange={(e) => updateHomepageConfig({
                      hero: { ...homepageConfig.hero, badgeLocation: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Badge Tag</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.badgeTag}
                    onChange={(e) => updateHomepageConfig({
                      hero: { ...homepageConfig.hero, badgeTag: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Image Alt & Crop Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Image Alt Text (SEO)</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.heroImageAlt || ''}
                    onChange={(e) => updateHomepageConfig({
                      hero: { ...homepageConfig.hero, heroImageAlt: e.target.value }
                    })}
                    placeholder="Infinity Bangladesh Humanitarian Group Photo"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Crop Position (CSS)</label>
                  <input
                    type="text"
                    value={homepageConfig.hero.heroImageCropPosition || 'center center'}
                    onChange={(e) => updateHomepageConfig({
                      hero: { ...homepageConfig.hero, heroImageCropPosition: e.target.value }
                    })}
                    placeholder="center center"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Quick Crop Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {['center center', 'center top', 'top center', 'center bottom', '50% 20%'].map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateHomepageConfig({
                      hero: { ...homepageConfig.hero, heroImageCropPosition: pos }
                    })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${(homepageConfig.hero.heroImageCropPosition || 'center center') === pos
                      ? 'bg-[#006A4E] text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-[#006A4E]'
                      }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Hero Trust Indicators */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
            <span>Hero Trust & Verification Badges (৩টি ট্রাস্ট ব্যাজ)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(homepageConfig.hero.trustIndicators || []).map((indicator, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    Badge #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedIndicators = [...(homepageConfig.hero.trustIndicators || [])];
                      updatedIndicators[idx] = { ...updatedIndicators[idx], active: !updatedIndicators[idx].active };
                      updateHomepageConfig({ hero: { ...homepageConfig.hero, trustIndicators: updatedIndicators } });
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${indicator.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                  >
                    {indicator.active ? 'Active' : 'Hidden'}
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-600 block">Text (EN)</label>
                  <input
                    type="text"
                    value={indicator.text?.en || ''}
                    onChange={(e) => {
                      const updatedIndicators = [...(homepageConfig.hero.trustIndicators || [])];
                      updatedIndicators[idx] = {
                        ...updatedIndicators[idx],
                        text: { ...(updatedIndicators[idx]?.text || { en: '', bn: '' }), en: e.target.value }
                      };
                      updateHomepageConfig({ hero: { ...homepageConfig.hero, trustIndicators: updatedIndicators } });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-600 block">লেখা (বাংলা)</label>
                  <input
                    type="text"
                    value={indicator.text?.bn || ''}
                    onChange={(e) => {
                      const updatedIndicators = [...(homepageConfig.hero.trustIndicators || [])];
                      updatedIndicators[idx] = {
                        ...updatedIndicators[idx],
                        text: { ...(updatedIndicators[idx]?.text || { en: '', bn: '' }), bn: e.target.value }
                      };
                      updateHomepageConfig({ hero: { ...homepageConfig.hero, trustIndicators: updatedIndicators } });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Hero Action CTA Buttons */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Hero Action CTA Buttons (হিরো ৩টি অ্যাকশন বাটন)
          </h4>

          {/* 1. Primary CTA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006A4E]" />
                <span className="text-xs font-extrabold text-slate-900">
                  {isBn ? '১. প্রাথমিক বোতাম (Primary Heart Button)' : '1. Primary CTA (Heart Button)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateHomepageConfig({
                  hero: {
                    ...homepageConfig.hero,
                    primaryCta: { ...homepageConfig.hero.primaryCta, active: !homepageConfig.hero.primaryCta.active }
                  }
                })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${homepageConfig.hero.primaryCta.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {homepageConfig.hero.primaryCta.active ? 'Active' : 'Hidden'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Button Text (English)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.primaryCta.text.en}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      primaryCta: {
                        ...homepageConfig.hero.primaryCta,
                        text: { ...homepageConfig.hero.primaryCta.text, en: e.target.value }
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">বোতামের লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.primaryCta.text.bn}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      primaryCta: {
                        ...homepageConfig.hero.primaryCta,
                        text: { ...homepageConfig.hero.primaryCta.text, bn: e.target.value }
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Target Route / URL (লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.primaryCta.url}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      primaryCta: { ...homepageConfig.hero.primaryCta, url: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. Secondary CTA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="text-xs font-extrabold text-slate-900">
                  {isBn ? '২. দ্বিতীয় বোতাম (Secondary Volunteer Button)' : '2. Secondary CTA (Users Button)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateHomepageConfig({
                  hero: {
                    ...homepageConfig.hero,
                    secondaryCta: { ...homepageConfig.hero.secondaryCta, active: !homepageConfig.hero.secondaryCta.active }
                  }
                })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${homepageConfig.hero.secondaryCta.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {homepageConfig.hero.secondaryCta.active ? 'Active' : 'Hidden'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Button Text (English)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.secondaryCta.text.en}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      secondaryCta: {
                        ...homepageConfig.hero.secondaryCta,
                        text: { ...homepageConfig.hero.secondaryCta.text, en: e.target.value }
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">বোতামের লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.secondaryCta.text.bn}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      secondaryCta: {
                        ...homepageConfig.hero.secondaryCta,
                        text: { ...homepageConfig.hero.secondaryCta.text, bn: e.target.value }
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Target Route / URL (লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.secondaryCta.url}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      secondaryCta: { ...homepageConfig.hero.secondaryCta, url: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Story / Video CTA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-extrabold text-slate-900">
                  {isBn ? '৩. গল্প / ভিডিও বোতাম (Story Play Button)' : '3. Story / Video CTA (Play Button)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateHomepageConfig({
                  hero: {
                    ...homepageConfig.hero,
                    storyCta: { ...homepageConfig.hero.storyCta, active: !homepageConfig.hero.storyCta.active }
                  }
                })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${homepageConfig.hero.storyCta.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {homepageConfig.hero.storyCta.active ? 'Active' : 'Hidden'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Button Text (English)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.storyCta.text.en}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      storyCta: {
                        ...homepageConfig.hero.storyCta,
                        text: { ...homepageConfig.hero.storyCta.text, en: e.target.value }
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">বোতামের লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.storyCta.text.bn}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      storyCta: {
                        ...homepageConfig.hero.storyCta,
                        text: { ...homepageConfig.hero.storyCta.text, bn: e.target.value }
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Target Route / URL (লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.hero.storyCta.url}
                  onChange={(e) => updateHomepageConfig({
                    hero: {
                      ...homepageConfig.hero,
                      storyCta: { ...homepageConfig.hero.storyCta, url: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ============================================================= */}
      {/* 02. ABOUT / WHO WE ARE SECTION (UNIFIED SINGLE EDITOR) */}
      {/* ============================================================= */}
      <div id="sec-02-about" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-8 shadow-warm-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-warm-xs">
              02
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {isBn ? 'সংগঠন পরিচিতি ও মূল বার্তা (About / Who We Are)' : 'About & Purpose Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "People First. Humanity Always" — Headline, Mission/Vision, CTAs & Photo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('about')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'about'
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. EYEBROW, HEADLINES & STORY DESCRIPTION */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>✍️</span>
            <span>1. Headlines, Eyebrow & Story Description (আইব্রো, মূল শিরোনাম ও পরিচিতি)</span>
          </h4>

          {/* Eyebrow Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eyebrow Pill (English)</label>
              <input
                type="text"
                value={homepageConfig.aboutPreview?.eyebrow?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  aboutPreview: {
                    ...homepageConfig.aboutPreview,
                    eyebrow: { ...(homepageConfig.aboutPreview?.eyebrow || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="Who We Are"
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">আইব্রো ব্যাজ (বাংলা)</label>
              <input
                type="text"
                value={homepageConfig.aboutPreview?.eyebrow?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  aboutPreview: {
                    ...homepageConfig.aboutPreview,
                    eyebrow: { ...(homepageConfig.aboutPreview?.eyebrow || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="আমাদের পরিচয় ও লক্ষ্য"
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>

          {/* Main Title & Highlight Accent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English Headline */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider block">
                English Headline Structure
              </span>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Main Title (Dark Text)</label>
                <input
                  type="text"
                  value={homepageConfig.aboutPreview?.titleMain?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      titleMain: { ...(homepageConfig.aboutPreview?.titleMain || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="People First. Humanity Always."
                  className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-700 font-bold">Highlight Accent (Emerald Green)</label>
                <input
                  type="text"
                  value={homepageConfig.aboutPreview?.titleHighlight?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      titleHighlight: { ...(homepageConfig.aboutPreview?.titleHighlight || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="Serving with Empathy."
                  className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold text-[#006A4E]"
                />
              </div>
            </div>

            {/* Bengali Headline */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider block">
                বাংলা শিরোনামের গঠন
              </span>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">মূল শিরোনাম (কালো অক্ষর)</label>
                <input
                  type="text"
                  value={homepageConfig.aboutPreview?.titleMain?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      titleMain: { ...(homepageConfig.aboutPreview?.titleMain || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="মানুষের পাশে দাঁড়ানোই আমাদের ব্রত —"
                  className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold font-bengali text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-700 font-bold">হাইলাইট শিরোনাম (সবুজ হাইলাইট)</label>
                <input
                  type="text"
                  value={homepageConfig.aboutPreview?.titleHighlight?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      titleHighlight: { ...(homepageConfig.aboutPreview?.titleHighlight || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="অকৃত্রিম সেবায়, ভালোবাসার বন্ধনে।"
                  className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold font-bengali text-[#006A4E]"
                />
              </div>
            </div>
          </div>

          {/* Narrative Story Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Narrative Description (English)</label>
              <textarea
                rows={3}
                value={homepageConfig.aboutPreview?.description?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  aboutPreview: {
                    ...homepageConfig.aboutPreview,
                    description: { ...(homepageConfig.aboutPreview?.description || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="Founded in Hathazari, Chattogram in 2015, Infinity Bangladesh has grown into a transparent youth humanitarian platform."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs leading-relaxed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">পরিচিতি ও বিবরণ (বাংলা)</label>
              <textarea
                rows={3}
                value={homepageConfig.aboutPreview?.description?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  aboutPreview: {
                    ...homepageConfig.aboutPreview,
                    description: { ...(homepageConfig.aboutPreview?.description || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="২০১৫ সালে চট্টগ্রামের হাটহাজারী থেকে যাত্রা শুরু করে ইনফিনিটি বাংলাদেশ আজ দেশজুড়ে এক স্বচ্ছ ও নিবেদিত তারুণ্যের শক্তিতে পরিণত হয়েছে।"
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. COVER PHOTO, CROP PRESETS & FLOATING OVERLAY BADGES */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>📸</span>
              <span>2. Cover Photo, Focus Crop & Floating Badges (ছবি, ক্রপ ও ওভারলে ব্যাজ)</span>
            </h4>
            <button
              type="button"
              onClick={() => openMediaPicker((url) => {
                updateHomepageConfig({
                  aboutPreview: {
                    ...homepageConfig.aboutPreview,
                    imageUrl: url
                  }
                });
                showToast('About cover photo updated from Media Library');
              })}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isBn ? 'মিডিয়া গ্যালারি থেকে ছবি নির্বাচন' : 'Pick from Media Library'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live Thumbnail on Left */}
            <div className="lg:col-span-4 space-y-2">
              <div className="aspect-4/3 rounded-2xl overflow-hidden border-2 border-white shadow-warm-xs bg-slate-900 relative">
                <img
                  src={getAssetUrl(homepageConfig.aboutPreview?.imageUrl || aboutSettings.heroImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80')}
                  alt={homepageConfig.aboutPreview?.imageAlt || 'About Preview'}
                  style={{ objectPosition: homepageConfig.aboutPreview?.imageCrop || 'center center' }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white space-y-0.5 min-w-0">
                    <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide truncate">
                      {tText(homepageConfig.aboutPreview?.imageBadgeTitle) || 'TEAM INFINITY — UNITED FOR HUMANITY'}
                    </p>
                    <p className="text-[9px] text-slate-200 truncate">
                      {tText(homepageConfig.aboutPreview?.imageBadgeSubtitle) || 'Serving underserved communities since 2015'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center text-[10px] text-slate-500 font-mono">
                Live Crop: <span className="text-[#006A4E] font-bold">{homepageConfig.aboutPreview?.imageCrop || 'center center'}</span>
              </div>
            </div>

            {/* Photo Controls on Right */}
            <div className="lg:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Image Direct URL (ছবির লিংক)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.imageUrl || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        imageUrl: e.target.value
                      }
                    })}
                    placeholder="https://res.cloudinary.com/... or /images/..."
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alt Text (বিকল্প নাম)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.imageAlt || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        imageAlt: e.target.value
                      }
                    })}
                    placeholder="Team Infinity"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Quick Crop Presets */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Quick Focus Crop (কুইক ক্রপ পজিশন)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { label: 'Center', val: 'center center' },
                    { label: 'Top', val: 'center top' },
                    { label: 'Bottom', val: 'center bottom' },
                    { label: 'Left', val: 'left center' },
                    { label: 'Right', val: 'right center' },
                    { label: 'Top-Right', val: 'right top' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => updateHomepageConfig({
                        aboutPreview: {
                          ...homepageConfig.aboutPreview,
                          imageCrop: preset.val
                        }
                      })}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${(homepageConfig.aboutPreview?.imageCrop || 'center center') === preset.val
                        ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-2xs'
                        : 'bg-white text-slate-700 border-[#EAE3D9] hover:bg-slate-50'
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Overlay Badge Texts */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] space-y-2.5">
                <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block">
                  ⭐ Photo Floating Overlay Badge (ছবির উপর ভাসমান হলুদ ও সাদা ব্যাজ)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-700">Yellow Badge Title (EN)</label>
                    <input
                      type="text"
                      value={homepageConfig.aboutPreview?.imageBadgeTitle?.en || ''}
                      onChange={(e) => updateHomepageConfig({
                        aboutPreview: {
                          ...homepageConfig.aboutPreview,
                          imageBadgeTitle: { ...(homepageConfig.aboutPreview?.imageBadgeTitle || { en: '', bn: '' }), en: e.target.value }
                        }
                      })}
                      placeholder="TEAM INFINITY — UNITED FOR HUMANITY"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-700">হলুদ ব্যাজ শিরোনাম (বাংলা)</label>
                    <input
                      type="text"
                      value={homepageConfig.aboutPreview?.imageBadgeTitle?.bn || ''}
                      onChange={(e) => updateHomepageConfig({
                        aboutPreview: {
                          ...homepageConfig.aboutPreview,
                          imageBadgeTitle: { ...(homepageConfig.aboutPreview?.imageBadgeTitle || { en: '', bn: '' }), bn: e.target.value }
                        }
                      })}
                      placeholder="টিম ইনফিনিটি — মানবতার জন্য একতাবদ্ধ"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold font-bengali text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Subtitle Text (EN)</label>
                    <input
                      type="text"
                      value={homepageConfig.aboutPreview?.imageBadgeSubtitle?.en || ''}
                      onChange={(e) => updateHomepageConfig({
                        aboutPreview: {
                          ...homepageConfig.aboutPreview,
                          imageBadgeSubtitle: { ...(homepageConfig.aboutPreview?.imageBadgeSubtitle || { en: '', bn: '' }), en: e.target.value }
                        }
                      })}
                      placeholder="Serving underserved communities since 2015"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">সাবটাইটেল লেখা (বাংলা)</label>
                    <input
                      type="text"
                      value={homepageConfig.aboutPreview?.imageBadgeSubtitle?.bn || ''}
                      onChange={(e) => updateHomepageConfig({
                        aboutPreview: {
                          ...homepageConfig.aboutPreview,
                          imageBadgeSubtitle: { ...(homepageConfig.aboutPreview?.imageBadgeSubtitle || { en: '', bn: '' }), bn: e.target.value }
                        }
                      })}
                      placeholder="২০১৫ সাল থেকে সুবিধাবঞ্চিত মানুষের পাশে"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. MISSION & VISION FEATURE CARDS */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>🎯</span>
            <span>3. Mission & Vision Feature Cards (আমাদের লক্ষ্য ও দর্শন সংক্ষিপ্ত কার্ড)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mission Card Form */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#006A4E]" />
                <span>🎯 Mission Card (আমাদের লক্ষ্য)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Heading (EN)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.missionHeading?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        missionHeading: { ...(homepageConfig.aboutPreview?.missionHeading || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Our Mission"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.missionHeading?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        missionHeading: { ...(homepageConfig.aboutPreview?.missionHeading || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="আমাদের লক্ষ্য"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Short Mission Text (EN)</label>
                <textarea
                  rows={2}
                  value={homepageConfig.aboutPreview?.missionText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      missionText: { ...(homepageConfig.aboutPreview?.missionText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="To restore human dignity and bring hope to vulnerable communities."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">সংক্ষিপ্ত লক্ষ্য বিবরণ (বাংলা)</label>
                <textarea
                  rows={2}
                  value={homepageConfig.aboutPreview?.missionText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      missionText: { ...(homepageConfig.aboutPreview?.missionText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="সুবিধাবঞ্চিত মানুষের মর্যাদা রক্ষা ও আশার আলো ছড়ানো।"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                />
              </div>
            </div>

            {/* Vision Card Form */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#006A4E]" />
                <span>👁️ Vision Card (আমাদের দর্শন)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Heading (EN)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.visionHeading?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        visionHeading: { ...(homepageConfig.aboutPreview?.visionHeading || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Our Vision"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.visionHeading?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        visionHeading: { ...(homepageConfig.aboutPreview?.visionHeading || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="আমাদের দর্শন"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Short Vision Text (EN)</label>
                <textarea
                  rows={2}
                  value={homepageConfig.aboutPreview?.visionText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      visionText: { ...(homepageConfig.aboutPreview?.visionText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="A compassionate society where every underprivileged person receives dignity."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">সংক্ষিপ্ত দর্শন বিবরণ (বাংলা)</label>
                <textarea
                  rows={2}
                  value={homepageConfig.aboutPreview?.visionText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      visionText: { ...(homepageConfig.aboutPreview?.visionText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="একটি সহানুভূতিশীল সমাজ গঠন যেখানে প্রতিটি মানুষ মর্যাদা পাবে।"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. ACTION BUTTONS & ROUTES */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>🔘</span>
            <span>4. Action Buttons & Navigation (অ্যাকশন বোতাম ও রুট লিংক)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Story Button */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-xs font-extrabold text-[#006A4E] flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Primary Button (মূল বোতাম)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Button Text (EN)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.ctaText?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        ctaText: { ...(homepageConfig.aboutPreview?.ctaText || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Explore Our Full Journey"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">বোতামের লেখা (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.ctaText?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        ctaText: { ...(homepageConfig.aboutPreview?.ctaText || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="আমাদের সম্পূর্ণ গল্প পড়ুন"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold">Target Route / URL (লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.aboutPreview?.ctaUrl || 'about/story'}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      ctaUrl: e.target.value
                    }
                  })}
                  placeholder="about/story"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono font-bold text-[#006A4E]"
                />
              </div>
            </div>

            {/* Secondary Committee Button */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#006A4E]" />
                <span>Secondary Button (নেতৃত্ব কমিটি)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Button Text (EN)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.secondaryCtaText?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        secondaryCtaText: { ...(homepageConfig.aboutPreview?.secondaryCtaText || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Executive Team"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">বোতামের লেখা (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.aboutPreview?.secondaryCtaText?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      aboutPreview: {
                        ...homepageConfig.aboutPreview,
                        secondaryCtaText: { ...(homepageConfig.aboutPreview?.secondaryCtaText || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="নেতৃত্ব কমিটি"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold">Target Route / URL (লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.aboutPreview?.secondaryCtaUrl || 'about/executive-committee'}
                  onChange={(e) => updateHomepageConfig({
                    aboutPreview: {
                      ...homepageConfig.aboutPreview,
                      secondaryCtaUrl: e.target.value
                    }
                  })}
                  placeholder="about/executive-committee"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANEL 5: FULL ABOUT CMS SHORTCUT */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'লক্ষ্য ও দর্শন (Mission & Vision) পূর্ণাঙ্গ ডাটা সংযোগ' : 'Mission & Vision Full CMS Gateway'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? `মিশন: ${tText(aboutSettings.mission)} | দর্শন: ${tText(aboutSettings.vision)}`
                : `Mission: ${aboutSettings.mission.en} | Vision: ${aboutSettings.vision.en}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('about_cms')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isBn ? 'সম্পূর্ণ পরিচিতি এডিট করুন →' : 'Edit Full Organization About CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 03. FLAGSHIP PROGRAMS SECTION */}
      {/* ============================================================= */}
      <div id="sec-03-programs" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              03
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'ধারাবাহিক কর্মসূচি সেকশন (Flagship Programs)' : 'Flagship Programs Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "Sustainable Humanitarian Initiatives" — Header & View All CTA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('programs')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'programs'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.programsSection?.badge?.en || ''}
              onChange={(e) => updateHomepageConfig({
                programsSection: {
                  ...(homepageConfig.programsSection || {}),
                  badge: { ...(homepageConfig.programsSection?.badge || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Flagship Programs"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.programsSection?.badge?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                programsSection: {
                  ...(homepageConfig.programsSection || {}),
                  badge: { ...(homepageConfig.programsSection?.badge || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="স্থায়ী কার্যক্রম"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
            <input
              type="text"
              value={homepageConfig.programsSection?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                programsSection: {
                  ...(homepageConfig.programsSection || {}),
                  title: { ...(homepageConfig.programsSection?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Sustainable Humanitarian Initiatives"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.programsSection?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                programsSection: {
                  ...(homepageConfig.programsSection || {}),
                  title: { ...(homepageConfig.programsSection?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="ধারাবাহিক মানবিক কর্মসূচি ও ইভেন্ট"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subtitle Description (EN)</label>
              <textarea
                rows={2}
                value={homepageConfig.programsSection?.subtitle?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  programsSection: {
                    ...(homepageConfig.programsSection || {}),
                    subtitle: { ...(homepageConfig.programsSection?.subtitle || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="Recurring seasonal programs providing dignified Eid gifts, winter protection, and relief."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সাবটাইটেল বিবরণ (বাংলা)</label>
              <textarea
                rows={2}
                value={homepageConfig.programsSection?.subtitle?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  programsSection: {
                    ...(homepageConfig.programsSection || {}),
                    subtitle: { ...(homepageConfig.programsSection?.subtitle || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="প্রতি বছর নিয়মিতভাবে আয়োজিত সুবিধাবঞ্চিত মানুষের ঈদ আনন্দ, শীতবস্ত্র ও জরুরি খাদ্য কর্মসূচি।"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">View All Button Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.programsSection?.viewAllText?.en || ''}
              onChange={(e) => updateHomepageConfig({
                programsSection: {
                  ...(homepageConfig.programsSection || {}),
                  viewAllText: { ...(homepageConfig.programsSection?.viewAllText || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="View All Programs & Events"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">বাটন লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.programsSection?.viewAllText?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                programsSection: {
                  ...(homepageConfig.programsSection || {}),
                  viewAllText: { ...(homepageConfig.programsSection?.viewAllText || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="সকল কর্মসূচি ও ইভেন্ট তালিকা দেখুন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>
        </div>

        {/* Programs CMS Shortcut */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'কর্মসূচি ও ইভেন্ট কার্ড কন্টেন্ট' : 'Program Cards Content (3 cards displayed on Homepage)'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? `বর্তমান কর্মসূচি তালিকা: ${programs.map(p => isBn ? p.title.bn : p.title.en).join(', ')}`
                : `Active programs: ${programs.map(p => p.title.en).join(', ')}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('programs')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isBn ? 'কর্মসূচি ম্যানেজ করুন →' : 'Manage Flagship Programs CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 04. RELIEF CAMPAIGNS SECTION */}
      {/* ============================================================= */}
      <div id="sec-04-campaigns" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              04
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'মাঠপর্যায়ের ক্যাম্পেইন সেকশন (Relief Drives & Campaigns)' : 'Relief Campaigns Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "Ongoing Relief Drives & Campaigns" — Header & Featured Badge
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('campaigns')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'campaigns'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.campaignsSection?.badge?.en || ''}
              onChange={(e) => updateHomepageConfig({
                campaignsSection: {
                  ...(homepageConfig.campaignsSection || {}),
                  badge: { ...(homepageConfig.campaignsSection?.badge || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Active Field Drives"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.campaignsSection?.badge?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                campaignsSection: {
                  ...(homepageConfig.campaignsSection || {}),
                  badge: { ...(homepageConfig.campaignsSection?.badge || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="মাঠপর্যায়ের ক্যাম্পেইন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
            <input
              type="text"
              value={homepageConfig.campaignsSection?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                campaignsSection: {
                  ...(homepageConfig.campaignsSection || {}),
                  title: { ...(homepageConfig.campaignsSection?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Ongoing Relief Drives & Campaigns"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.campaignsSection?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                campaignsSection: {
                  ...(homepageConfig.campaignsSection || {}),
                  title: { ...(homepageConfig.campaignsSection?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="চলমান মানবিক ক্যাম্পেইন ও সেবা"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Featured Card Badge (EN)</label>
              <input
                type="text"
                value={homepageConfig.campaignsSection?.featuredBadgeText?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  campaignsSection: {
                    ...(homepageConfig.campaignsSection || {}),
                    featuredBadgeText: { ...(homepageConfig.campaignsSection?.featuredBadgeText || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="Featured Campaign"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ফিচার্ড কার্ড ব্যাজ (বাংলা)</label>
              <input
                type="text"
                value={homepageConfig.campaignsSection?.featuredBadgeText?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  campaignsSection: {
                    ...(homepageConfig.campaignsSection || {}),
                    featuredBadgeText: { ...(homepageConfig.campaignsSection?.featuredBadgeText || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="বিশেষ ফিচার্ড ক্যাম্পেইন"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>

          {/* Featured Campaign Action CTA Buttons */}
          <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100">
            <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
              Featured Campaign Action Buttons (ফিচার্ড কার্ডের বোতামসমূহ)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Details CTA */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] space-y-2">
                <span className="text-xs font-bold text-[#006A4E] block">1. Details Button (বিবরণ দেখুন)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Text (EN)</label>
                    <input
                      type="text"
                      value={homepageConfig.campaignsSection?.featuredDetailsText?.en || ''}
                      onChange={(e) => updateHomepageConfig({
                        campaignsSection: {
                          ...(homepageConfig.campaignsSection || {}),
                          featuredDetailsText: { ...(homepageConfig.campaignsSection?.featuredDetailsText || { en: '', bn: '' }), en: e.target.value }
                        }
                      })}
                      placeholder="View Campaign Details"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">লেখা (বাংলা)</label>
                    <input
                      type="text"
                      value={homepageConfig.campaignsSection?.featuredDetailsText?.bn || ''}
                      onChange={(e) => updateHomepageConfig({
                        campaignsSection: {
                          ...(homepageConfig.campaignsSection || {}),
                          featuredDetailsText: { ...(homepageConfig.campaignsSection?.featuredDetailsText || { en: '', bn: '' }), bn: e.target.value }
                        }
                      })}
                      placeholder="ক্যাম্পেইন বিবরণ দেখুন"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Target Route</label>
                  <input
                    type="text"
                    value={homepageConfig.campaignsSection?.featuredDetailsUrl || 'campaigns/detail'}
                    onChange={(e) => updateHomepageConfig({
                      campaignsSection: {
                        ...(homepageConfig.campaignsSection || {}),
                        featuredDetailsUrl: e.target.value
                      }
                    })}
                    placeholder="campaigns/detail"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Secondary Support CTA */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] space-y-2">
                <span className="text-xs font-bold text-rose-700 block">2. Support Button (সহায়তা করুন)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Text (EN)</label>
                    <input
                      type="text"
                      value={homepageConfig.campaignsSection?.featuredSupportText?.en || ''}
                      onChange={(e) => updateHomepageConfig({
                        campaignsSection: {
                          ...(homepageConfig.campaignsSection || {}),
                          featuredSupportText: { ...(homepageConfig.campaignsSection?.featuredSupportText || { en: '', bn: '' }), en: e.target.value }
                        }
                      })}
                      placeholder="Support Campaign"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">লেখা (বাংলা)</label>
                    <input
                      type="text"
                      value={homepageConfig.campaignsSection?.featuredSupportText?.bn || ''}
                      onChange={(e) => updateHomepageConfig({
                        campaignsSection: {
                          ...(homepageConfig.campaignsSection || {}),
                          featuredSupportText: { ...(homepageConfig.campaignsSection?.featuredSupportText || { en: '', bn: '' }), bn: e.target.value }
                        }
                      })}
                      placeholder="সহায়তা করুন"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Target Route</label>
                  <input
                    type="text"
                    value={homepageConfig.campaignsSection?.featuredSupportUrl || 'donate'}
                    onChange={(e) => updateHomepageConfig({
                      campaignsSection: {
                        ...(homepageConfig.campaignsSection || {}),
                        featuredSupportUrl: e.target.value
                      }
                    })}
                    placeholder="donate"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns CMS Shortcut */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'ক্যাম্পেইন কন্টেন্ট ও ফিচার্ড নির্ধারণ' : 'Campaign Cards Content & Goal Progress'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? `বর্তমান ক্যাম্পেইন সংখ্যা: ${campaigns.length}টি (ফিচার্ড: ${campaigns.find(c => c.isFeatured)?.title?.bn || 'নির্ধারিত'})`
                : `Total active campaigns: ${campaigns.length} (Featured: ${campaigns.find(c => c.isFeatured)?.title?.en || 'Auto'})`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{isBn ? 'ক্যাম্পেইন ম্যানেজ করুন →' : 'Manage Relief Campaigns CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 05. IMPACT STORIES SECTION */}
      {/* ============================================================= */}
      <div id="sec-05-stories" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              05
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'মানবিক রূপান্তরের গল্প সেকশন (Impact Stories)' : 'Impact Stories Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "Stories of Hope & Grassroots Change" — Header & View All CTA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('stories')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'stories'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.storiesSection?.badge?.en || ''}
              onChange={(e) => updateHomepageConfig({
                storiesSection: {
                  ...(homepageConfig.storiesSection || {}),
                  badge: { ...(homepageConfig.storiesSection?.badge || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Human Dignity"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.storiesSection?.badge?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                storiesSection: {
                  ...(homepageConfig.storiesSection || {}),
                  badge: { ...(homepageConfig.storiesSection?.badge || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="মানবিক দলিল"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
            <input
              type="text"
              value={homepageConfig.storiesSection?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                storiesSection: {
                  ...(homepageConfig.storiesSection || {}),
                  title: { ...(homepageConfig.storiesSection?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Stories of Hope & Grassroots Change"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.storiesSection?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                storiesSection: {
                  ...(homepageConfig.storiesSection || {}),
                  title: { ...(homepageConfig.storiesSection?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="বাস্তব জীবনের রূপান্তরের গল্প"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">View All Button Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.storiesSection?.viewAllText?.en || ''}
              onChange={(e) => updateHomepageConfig({
                storiesSection: {
                  ...(homepageConfig.storiesSection || {}),
                  viewAllText: { ...(homepageConfig.storiesSection?.viewAllText || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Read All Human Stories"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">বাটন লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.storiesSection?.viewAllText?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                storiesSection: {
                  ...(homepageConfig.storiesSection || {}),
                  viewAllText: { ...(homepageConfig.storiesSection?.viewAllText || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="সকল গল্প পড়ুন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>
        </div>

        {/* Stories CMS Shortcut */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'বাস্তব জীবনের প্রামাণ্য গল্প কন্টেন্ট' : 'Story Records & Beneficiary Consent'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? `সংরক্ষিত গল্পের সংখ্যা: ${stories.length}টি (হোমপেজে প্রথম ২টি প্রদর্শিত)`
                : `Total story records: ${stories.length} (First 2 featured on Homepage)`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isBn ? 'গল্প আর্কাইভ ম্যানেজ করুন →' : 'Manage Impact Stories CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 06. INFINITY LIFELINE SPOTLIGHT */}
      {/* ============================================================= */}
      <div id="sec-06-lifeline" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-7 shadow-warm-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#04140F] text-rose-400 font-extrabold flex items-center justify-center font-mono text-sm shadow-xs border border-emerald-900/60">
              06
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <span>{isBn ? 'ইনফিনিটি লাইফলাইন স্পটলাইট (Infinity LifeLine Blood Spotlight)' : 'Infinity LifeLine Blood Spotlight'}</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </h3>
              <p className="text-xs font-bold text-[#BE123C]">
                {isBn
                  ? 'হোমপেজের জরুরি রক্তদান উদ্যোগ — লোগো, বার্তা, গল্প চিপস, ৩টি অ্যাকশন বোতাম ও লাইভ সমন্বয় নেটওয়ার্ক নিয়ন্ত্রণ'
                  : 'Controls Homepage: Sub-brand Identity, Narrative Story Chips, 3 Action CTAs & Live Coordination Panel'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('lifeline')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'lifeline'
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANEL 1: BRAND IDENTITY, EYEBROW & SUBTITLE TAGLINE */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>{isBn ? '১. আইব্রো ও উদ্যোগের ট্যাগলাইন' : '1. Eyebrow Badge & Initiative Tagline'}</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              EN & BN Dual Support
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* English Narrative Card */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block border-b border-[#EAE3D9] pb-1.5">
                English Content (ইংরেজি সংস্করণ)
              </span>

              {/* Eyebrow Badge (EN) */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Eyebrow Badge (Top Pill)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.badge?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      badge: { ...(homepageConfig.lifelineSection?.badge || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="INFINITY LIFELINE — BLOOD INITIATIVE"
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bold text-emerald-900"
                />
              </div>

              {/* Subtitle / Initiative Tagline (EN) */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Initiative Tagline / Subtitle</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.subtitle?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      subtitle: { ...(homepageConfig.lifelineSection?.subtitle || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="An Emergency Blood Donation Initiative by Infinity Bangladesh 🩸"
                  className="w-full px-3 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Bengali Narrative Card */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block border-b border-[#EAE3D9] pb-1.5">
                বাংলা সংস্করণ (Bengali Content)
              </span>

              {/* Eyebrow Badge (BN) */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">আইব্রো ব্যাজ (শীর্ষ পিল)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.badge?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      badge: { ...(homepageConfig.lifelineSection?.badge || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="ইনফিনিটি লাইফলাইন — জরুরি রক্তদান"
                  className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bold font-bengali text-emerald-900"
                />
              </div>

              {/* Subtitle / Initiative Tagline (BN) */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">উদ্যোগের ট্যাগলাইন / সাবটাইটেল</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.subtitle?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      subtitle: { ...(homepageConfig.lifelineSection?.subtitle || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="ইনফিনিটি বাংলাদেশ-এর একটি জরুরি মানবিক রক্তদান উদ্যোগ 🩸"
                  className="w-full px-3 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-semibold font-bengali text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Sub-brand Animated Logo Quick Setup Box */}
          <div className="p-4 rounded-2xl bg-[#04140F] text-white border border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#08221A] border border-emerald-700/50 p-2 flex items-center justify-center shrink-0">
                <img
                  src={getAssetUrl(bloodDonationSettings.wingLogoUrl || '/brand/Infinitylifeline-logo.webp')}
                  alt="Infinity LifeLine Logo Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = '/brand/Infinitylifeline-logo.webp';
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>{isBn ? 'ইনফিনিটি লাইফলাইন এনিমেটেড উইং লোগো' : 'Infinity LifeLine Official Animated Logo'}</span>
                </p>
                <p className="text-[11px] text-slate-300 font-mono">
                  {bloodDonationSettings.wingLogoUrl || '/brand/Infinitylifeline-logo.webp'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openMediaPicker((url) => updateBloodDonationSettings({ wingLogoUrl: url }))}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isBn ? 'লোগো পরিবর্তন' : 'Change Logo'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blood_donation')}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isBn ? 'লোগো জুম ও ক্রপ কন্ট্রোল →' : 'Logo Zoom & Crop →'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANEL 2: 3 LIFELINE ACTION BUTTONS (CRIMSON, EMERALD, GHOST) */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-rose-600" />
              <span>{isBn ? '২. ৩টি লাইফলাইন অ্যাকশন বোতাম ও রুট লিংক' : '2. Three LifeLine Action Buttons & Target Routes'}</span>
            </h4>
            <span className="text-[10px] text-slate-500">
              {isBn ? 'হোমপেজের মূল বোতামসমূহ' : 'Main CTA Triggers on Homepage'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Button 1: Crimson Red Find a Donor */}
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-rose-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <span className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-rose-600" />
                  <span>1. Find a Donor (রক্তদাতা খুঁজুন)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Crimson
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Button Text (English)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.findDonorBtnText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      findDonorBtnText: { ...(homepageConfig.lifelineSection?.findDonorBtnText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="Find a Donor"
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">বোতামের লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.findDonorBtnText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      findDonorBtnText: { ...(homepageConfig.lifelineSection?.findDonorBtnText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="রক্তদাতা খুঁজুন"
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold font-bengali text-slate-800"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-rose-700 font-bold">Target Route (পেজ লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.findDonorBtnUrl || 'blood-donation/find-donor'}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      findDonorBtnUrl: e.target.value
                    }
                  })}
                  placeholder="blood-donation/find-donor"
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-bold text-rose-900"
                />
              </div>
            </div>

            {/* Button 2: Emerald Green Become a Blood Donor */}
            <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#C2E2D7] pb-2">
                <span className="text-xs font-extrabold text-[#006A4E] flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>2. Become a Donor (রক্তদাতা হোন)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006A4E] text-white">
                  Emerald
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Button Text (English)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.becomeDonorBtnText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      becomeDonorBtnText: { ...(homepageConfig.lifelineSection?.becomeDonorBtnText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="Become a Blood Donor"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#C2E2D7] rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">বোতামের লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.becomeDonorBtnText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      becomeDonorBtnText: { ...(homepageConfig.lifelineSection?.becomeDonorBtnText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="রক্তদাতা হোন"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#C2E2D7] rounded-lg text-xs font-bold font-bengali text-slate-800"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-emerald-800 font-bold">Target Route (পেজ লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.becomeDonorBtnUrl || 'blood-donation/become-donor'}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      becomeDonorBtnUrl: e.target.value
                    }
                  })}
                  placeholder="blood-donation/become-donor"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#C2E2D7] rounded-lg text-xs font-mono font-bold text-emerald-900"
                />
              </div>
            </div>

            {/* Button 3: Outline Rose Emergency Request */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-2">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>3. Emergency Request (আবেদন)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-white">
                  Ghost
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Button Text (English)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.emergencyReqBtnText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      emergencyReqBtnText: { ...(homepageConfig.lifelineSection?.emergencyReqBtnText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="Emergency Request"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">বোতামের লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.emergencyReqBtnText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      emergencyReqBtnText: { ...(homepageConfig.lifelineSection?.emergencyReqBtnText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="জরুরি রক্তের আবেদন"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold font-bengali text-slate-800"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-slate-600 font-bold">Target Route (পেজ লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.emergencyReqBtnUrl || 'blood-donation/emergency-request'}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      emergencyReqBtnUrl: e.target.value
                    }
                  })}
                  placeholder="blood-donation/emergency-request"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANEL 3: LIVE COORDINATION NETWORK PANEL & 24/7 HELPLINE */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? '৩. লাইভ সমন্বয় প্যানেল হেডার ও ২৪/৭ হেল্পলাইন' : '3. Live Coordination Panel Header & 24/7 Helpline'}</span>
            </h4>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Live Real-Time Indicators
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel Header & Badge */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block border-b border-[#EAE3D9] pb-1.5">
                Panel Header Titles & Live Badge
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">Panel Title (English)</label>
                  <input
                    type="text"
                    value={homepageConfig.lifelineSection?.coordinationTitle?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      lifelineSection: {
                        ...(homepageConfig.lifelineSection || {}),
                        coordinationTitle: { ...(homepageConfig.lifelineSection?.coordinationTitle || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Live Coordination Network"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">প্যানেল শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.lifelineSection?.coordinationTitle?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      lifelineSection: {
                        ...(homepageConfig.lifelineSection || {}),
                        coordinationTitle: { ...(homepageConfig.lifelineSection?.coordinationTitle || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="লাইভ রক্তদান সমন্বয় নেটওয়ার্ক"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold font-bengali text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">Status Badge (English)</label>
                  <input
                    type="text"
                    value={homepageConfig.lifelineSection?.coordinationBadge?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      lifelineSection: {
                        ...(homepageConfig.lifelineSection || {}),
                        coordinationBadge: { ...(homepageConfig.lifelineSection?.coordinationBadge || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="LIVE"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono font-bold text-emerald-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">স্ট্যাটাস ব্যাজ (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.lifelineSection?.coordinationBadge?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      lifelineSection: {
                        ...(homepageConfig.lifelineSection || {}),
                        coordinationBadge: { ...(homepageConfig.lifelineSection?.coordinationBadge || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="সক্রিয়"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bold font-bengali text-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* 24/7 Helpline & Gateway Footnote Link */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block border-b border-[#EAE3D9] pb-1.5">
                24/7 Helpline & Gateway Portal Link
              </span>

              {/* 24/7 Emergency Helpline Number */}
              <div className="space-y-1">
                <label className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-rose-600" />
                  <span>২৪/৭ জরুরি হেল্পলাইন নম্বর (24/7 Emergency Helpline Phone)</span>
                </label>
                <input
                  type="text"
                  value={bloodDonationSettings.emergencyHelpline || '+880 1839-008339'}
                  onChange={(e) => updateBloodDonationSettings({ emergencyHelpline: e.target.value })}
                  placeholder="+880 1839-008339"
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-mono font-extrabold text-rose-900"
                />
              </div>

              {/* Gateway Link Texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">Portal Footnote Text (EN)</label>
                  <input
                    type="text"
                    value={homepageConfig.lifelineSection?.portalLinkText?.en || ''}
                    onChange={(e) => updateHomepageConfig({
                      lifelineSection: {
                        ...(homepageConfig.lifelineSection || {}),
                        portalLinkText: { ...(homepageConfig.lifelineSection?.portalLinkText || { en: '', bn: '' }), en: e.target.value }
                      }
                    })}
                    placeholder="Explore Full LifeLine Portal & Guidelines"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">পোর্টাল লিংক লেখা (বাংলা)</label>
                  <input
                    type="text"
                    value={homepageConfig.lifelineSection?.portalLinkText?.bn || ''}
                    onChange={(e) => updateHomepageConfig({
                      lifelineSection: {
                        ...(homepageConfig.lifelineSection || {}),
                        portalLinkText: { ...(homepageConfig.lifelineSection?.portalLinkText || { en: '', bn: '' }), bn: e.target.value }
                      }
                    })}
                    placeholder="সম্পূর্ণ রক্তদান কার্যক্রম ও নির্দেশিকা দেখুন"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-bengali"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">Target Route (পেজ লিংক)</label>
                <input
                  type="text"
                  value={homepageConfig.lifelineSection?.portalUrl || 'blood-donation'}
                  onChange={(e) => updateHomepageConfig({
                    lifelineSection: {
                      ...(homepageConfig.lifelineSection || {}),
                      portalUrl: e.target.value
                    }
                  })}
                  placeholder="blood-donation"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANEL 4: LIVE DATABASE CONNECTION & FULL BLOOD CMS GATEWAY */}
        {/* ------------------------------------------------------------- */}
        <div className="p-5 rounded-2xl bg-[#04140F] text-white border border-emerald-900/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1.5">
            <p className="text-xs font-extrabold text-emerald-300 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-rose-400 fill-rose-400 animate-heartbeat" />
              <span>{isBn ? 'লাইভ রক্তদান সমন্বয় ডেটাবেজ ও ৪টি মেট্রিক ইনডিকেটর' : 'Live LifeLine Coordination Database & 4 Metric Indicators'}</span>
            </p>
            <p className="text-[11px] text-slate-300">
              {isBn
                ? `নিবন্ধিত রক্তদাতা: ${totalRegisteredDonors} জন | জরুরিতে প্রস্তুত: ${totalActiveDonors} জন | গ্রুপ: ৮/৮ | লাইভ আবেদন: ${pendingBloodRequests}টি`
                : `Registered Donors: ${totalRegisteredDonors} | Ready: ${totalActiveDonors} | Groups: 8/8 | Live Requests: ${pendingBloodRequests}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('blood_donation')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0 transform hover:-translate-y-0.5 active:scale-98"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isBn ? 'সম্পূর্ণ রক্তদান নেটওয়ার্ক CMS পরিচালনা করুন →' : 'Manage Blood Donation CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 07. PHOTO GALLERY SECTION */}
      {/* ============================================================= */}
      <div id="sec-07-gallery" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              07
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'মাঠপর্যায়ের স্মৃতি ও আলোকচিত্র (Photo Gallery)' : 'Photo Gallery Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "Moments of Humanity in Action" — Header & View All CTA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('gallery')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'gallery'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.gallerySection?.badge?.en || ''}
              onChange={(e) => updateHomepageConfig({
                gallerySection: {
                  ...(homepageConfig.gallerySection || {}),
                  badge: { ...(homepageConfig.gallerySection?.badge || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Visual Documentation"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.gallerySection?.badge?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                gallerySection: {
                  ...(homepageConfig.gallerySection || {}),
                  badge: { ...(homepageConfig.gallerySection?.badge || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="আলোকচিত্রে টিম ইনফিনিটি"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
            <input
              type="text"
              value={homepageConfig.gallerySection?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                gallerySection: {
                  ...(homepageConfig.gallerySection || {}),
                  title: { ...(homepageConfig.gallerySection?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Moments of Humanity in Action"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.gallerySection?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                gallerySection: {
                  ...(homepageConfig.gallerySection || {}),
                  title: { ...(homepageConfig.gallerySection?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="মাঠপর্যায়ের স্মৃতি ও আলোকচিত্র"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">View All Button Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.gallerySection?.viewAllText?.en || ''}
              onChange={(e) => updateHomepageConfig({
                gallerySection: {
                  ...(homepageConfig.gallerySection || {}),
                  viewAllText: { ...(homepageConfig.gallerySection?.viewAllText || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="View Full Photo Gallery"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">বাটন লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.gallerySection?.viewAllText?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                gallerySection: {
                  ...(homepageConfig.gallerySection || {}),
                  viewAllText: { ...(homepageConfig.gallerySection?.viewAllText || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="সম্পূর্ণ ফটো গ্যালারি দেখুন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>
        </div>

        {/* Gallery CMS Shortcut */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'ফটো অ্যালবাম ও মিডিয়া লাইব্রেরি সংযোগ' : 'Photo Gallery Records (First 6 photos on Homepage)'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? `সংরক্ষিত ছবির সংখ্যা: ${gallery.length}টি`
                : `Total gallery photos in repository: ${gallery.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('gallery_albums')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isBn ? 'ফটো অ্যালবাম ম্যানেজ করুন →' : 'Manage Gallery & Albums CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 08. PRESS / MEDIA COVERAGE SECTION */}
      {/* ============================================================= */}
      <div id="sec-08-press" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              08
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'গণমাধ্যম ও প্রেস সেকশন (Press & Media Coverage)' : 'Press & Media Coverage Section'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "Featured Press & Media Coverage" — Header & View All CTA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('press')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'press'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.badge?.en || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  badge: { ...(homepageConfig.pressSection?.badge || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="In The News"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.badge?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  badge: { ...(homepageConfig.pressSection?.badge || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="গণমাধ্যমে আমরা"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  title: { ...(homepageConfig.pressSection?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Featured Press & Media Coverage"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  title: { ...(homepageConfig.pressSection?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="জাতীয় গণমাধ্যমে প্রকাশিত প্রতিবেদন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">View All Button Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.viewAllText?.en || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  viewAllText: { ...(homepageConfig.pressSection?.viewAllText || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="View All Press Coverage"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">বাটন লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.viewAllText?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  viewAllText: { ...(homepageConfig.pressSection?.viewAllText || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="সকল সংবাদ দেখুন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Article Link Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.readArticleText?.en || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  readArticleText: { ...(homepageConfig.pressSection?.readArticleText || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Read Article"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">প্রতিবেদন লিংক লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.pressSection?.readArticleText?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                pressSection: {
                  ...(homepageConfig.pressSection || {}),
                  readArticleText: { ...(homepageConfig.pressSection?.readArticleText || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="প্রতিবেদন পড়ুন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>
        </div>

        {/* Press CMS Shortcut */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'সংবাদ প্রতিবেদন ও গণমাধ্যম আর্কাইভ' : 'Published Press Coverage (3 articles displayed on Homepage)'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? `সংরক্ষিত সংবাদের সংখ্যা: ${pressCoverages.length}টি`
                : `Total published press records: ${pressCoverages.filter(p => p.status === 'published').length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('press')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রেস কভারেজ ম্যানেজ করুন →' : 'Manage Press Articles CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 09. VOLUNTEER CTA BANNER */}
      {/* ============================================================= */}
      <div id="sec-09-volunteer" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#11241E] text-emerald-300 font-extrabold flex items-center justify-center font-mono text-sm shadow-xs border border-emerald-800">
              09
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'স্বেচ্ছাসেবী আহ্বান ব্যানার (Volunteer CTA Banner)' : 'Volunteer CTA Banner'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: "Empower Communities with Your Time & Passion" — Dark Emerald Volunteer Banner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('volunteer')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'volunteer'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Eyebrow Badge (EN)</label>
            <input
              type="text"
              value={homepageConfig.volunteerBanner?.badge?.en || homepageConfig.volunteerBanner?.eyebrow?.en || ''}
              onChange={(e) => updateHomepageConfig({
                volunteerBanner: {
                  ...homepageConfig.volunteerBanner,
                  badge: { ...(homepageConfig.volunteerBanner?.badge || { en: '', bn: '' }), en: e.target.value },
                  eyebrow: { ...(homepageConfig.volunteerBanner?.eyebrow || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Be Part of Team Infinity"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">আইব্রো ব্যাজ (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.volunteerBanner?.badge?.bn || homepageConfig.volunteerBanner?.eyebrow?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                volunteerBanner: {
                  ...homepageConfig.volunteerBanner,
                  badge: { ...(homepageConfig.volunteerBanner?.badge || { en: '', bn: '' }), bn: e.target.value },
                  eyebrow: { ...(homepageConfig.volunteerBanner?.eyebrow || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="স্বেচ্ছাসেবী পরিবারে স্বাগতম"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Headline Title (EN)</label>
            <input
              type="text"
              value={homepageConfig.volunteerBanner?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                volunteerBanner: {
                  ...homepageConfig.volunteerBanner,
                  title: { ...(homepageConfig.volunteerBanner?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Empower Communities with Your Time & Passion"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.volunteerBanner?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                volunteerBanner: {
                  ...homepageConfig.volunteerBanner,
                  title: { ...(homepageConfig.volunteerBanner?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="মানবতার সেবায় আপনিও হতে পারেন অগ্রদূত"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subtitle Description (EN)</label>
              <textarea
                rows={2}
                value={homepageConfig.volunteerBanner?.subtitle?.en || homepageConfig.volunteerBanner?.description?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  volunteerBanner: {
                    ...homepageConfig.volunteerBanner,
                    subtitle: { ...(homepageConfig.volunteerBanner?.subtitle || { en: '', bn: '' }), en: e.target.value },
                    description: { ...(homepageConfig.volunteerBanner?.description || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="Join a vibrant, ethical youth community committed to transparent grassroots humanitarian action..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সাবটাইটেল বিবরণ (বাংলা)</label>
              <textarea
                rows={2}
                value={homepageConfig.volunteerBanner?.subtitle?.bn || homepageConfig.volunteerBanner?.description?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  volunteerBanner: {
                    ...homepageConfig.volunteerBanner,
                    subtitle: { ...(homepageConfig.volunteerBanner?.subtitle || { en: '', bn: '' }), bn: e.target.value },
                    description: { ...(homepageConfig.volunteerBanner?.description || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="টিম ইনফিনিটি একটি তারুণ্যনির্ভর স্বচ্ছ মানবিক পরিবার..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>

          {/* Primary Button */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
            <span className="text-xs font-extrabold text-slate-900 block">Primary Button (যোগ দিন বোতাম)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Text (EN)</label>
                <input
                  type="text"
                  value={homepageConfig.volunteerBanner?.primaryButtonText?.en || homepageConfig.volunteerBanner?.primaryCtaText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    volunteerBanner: {
                      ...homepageConfig.volunteerBanner,
                      primaryButtonText: { ...(homepageConfig.volunteerBanner?.primaryButtonText || { en: '', bn: '' }), en: e.target.value },
                      primaryCtaText: { ...(homepageConfig.volunteerBanner?.primaryCtaText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  placeholder="Become a Volunteer"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.volunteerBanner?.primaryButtonText?.bn || homepageConfig.volunteerBanner?.primaryCtaText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    volunteerBanner: {
                      ...homepageConfig.volunteerBanner,
                      primaryButtonText: { ...(homepageConfig.volunteerBanner?.primaryButtonText || { en: '', bn: '' }), bn: e.target.value },
                      primaryCtaText: { ...(homepageConfig.volunteerBanner?.primaryCtaText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                  placeholder="স্বেচ্ছাসেবী হিসেবে যোগ দিন"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Target Route</label>
                <input
                  type="text"
                  value={homepageConfig.volunteerBanner?.primaryButtonUrl || homepageConfig.volunteerBanner?.primaryCtaUrl || 'volunteer'}
                  onChange={(e) => updateHomepageConfig({
                    volunteerBanner: {
                      ...homepageConfig.volunteerBanner,
                      primaryButtonUrl: e.target.value,
                      primaryCtaUrl: e.target.value
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  placeholder="volunteer"
                />
              </div>
            </div>
          </div>

          {/* Secondary Button */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
            <span className="text-xs font-extrabold text-slate-900 block">Secondary Button (নেতৃত্ব বোতাম)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Text (EN)</label>
                <input
                  type="text"
                  value={homepageConfig.volunteerBanner?.secondaryButtonText?.en || homepageConfig.volunteerBanner?.secondaryCtaText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    volunteerBanner: {
                      ...homepageConfig.volunteerBanner,
                      secondaryButtonText: { ...(homepageConfig.volunteerBanner?.secondaryButtonText || { en: '', bn: '' }), en: e.target.value },
                      secondaryCtaText: { ...(homepageConfig.volunteerBanner?.secondaryCtaText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  placeholder="Meet Our Team"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.volunteerBanner?.secondaryButtonText?.bn || homepageConfig.volunteerBanner?.secondaryCtaText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    volunteerBanner: {
                      ...homepageConfig.volunteerBanner,
                      secondaryButtonText: { ...(homepageConfig.volunteerBanner?.secondaryButtonText || { en: '', bn: '' }), bn: e.target.value },
                      secondaryCtaText: { ...(homepageConfig.volunteerBanner?.secondaryCtaText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                  placeholder="আমাদের নেতৃত্ব দেখুন"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Target Route</label>
                <input
                  type="text"
                  value={homepageConfig.volunteerBanner?.secondaryButtonUrl || homepageConfig.volunteerBanner?.secondaryCtaUrl || 'about/executive-committee'}
                  onChange={(e) => updateHomepageConfig({
                    volunteerBanner: {
                      ...homepageConfig.volunteerBanner,
                      secondaryButtonUrl: e.target.value,
                      secondaryCtaUrl: e.target.value
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  placeholder="about/executive-committee"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 10. INSTITUTIONAL TRANSPARENCY PLEDGE */}
      {/* ============================================================= */}
      <div id="sec-10-transparency" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#006A4E] text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              10
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'স্বচ্ছতা ও সততার অঙ্গীকার (Transparency Pledge)' : 'Institutional Transparency Pledge'}
              </h3>
              <p className="text-xs font-bold text-[#006A4E]">
                Controls Homepage: Verified Organization Pledge & Transparency Guarantee Card
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('transparency')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'transparency'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
            <input
              type="text"
              value={homepageConfig.transparencySection?.badge?.en || ''}
              onChange={(e) => updateHomepageConfig({
                transparencySection: {
                  ...(homepageConfig.transparencySection || {}),
                  badge: { ...(homepageConfig.transparencySection?.badge || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Verified Grassroots Organization"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.transparencySection?.badge?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                transparencySection: {
                  ...(homepageConfig.transparencySection || {}),
                  badge: { ...(homepageConfig.transparencySection?.badge || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="যাচাইকৃত মানবিক সংগঠন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
            <input
              type="text"
              value={homepageConfig.transparencySection?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                transparencySection: {
                  ...(homepageConfig.transparencySection || {}),
                  title: { ...(homepageConfig.transparencySection?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Team Infinity Bangladesh"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.transparencySection?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                transparencySection: {
                  ...(homepageConfig.transparencySection || {}),
                  title: { ...(homepageConfig.transparencySection?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="টিম ইনফিনিটি বাংলাদেশ"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description / Subtitle (EN)</label>
              <textarea
                rows={2}
                value={homepageConfig.transparencySection?.description?.en || homepageConfig.transparencySection?.subtitle?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  transparencySection: {
                    ...(homepageConfig.transparencySection || {}),
                    description: { ...(homepageConfig.transparencySection?.description || { en: '', bn: '' }), en: e.target.value },
                    subtitle: { ...(homepageConfig.transparencySection?.subtitle || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="A dedicated voluntary organization based in Hathazari, Chattogram..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">বিবরণ / সাবটাইটেল (বাংলা)</label>
              <textarea
                rows={2}
                value={homepageConfig.transparencySection?.description?.bn || homepageConfig.transparencySection?.subtitle?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  transparencySection: {
                    ...(homepageConfig.transparencySection || {}),
                    description: { ...(homepageConfig.transparencySection?.description || { en: '', bn: '' }), bn: e.target.value },
                    subtitle: { ...(homepageConfig.transparencySection?.subtitle || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="চট্টগ্রামের হাটহাজারীতে প্রতিষ্ঠিত একটি নির্ভরযোগ্য ও অলাভজনক মানবিক সংগঠন..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>

          {/* 3 Integrity Badges / Pills */}
          <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100">
            <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
              Integrity & Transparency Highlights (৩টি সততা ও নিশ্চয়তা পিল)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pill 1 */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] space-y-1.5">
                <span className="text-[11px] font-bold text-[#006A4E] block">1. Pill 1 (১০০% স্বচ্ছ হিসাব)</span>
                <input
                  type="text"
                  value={homepageConfig.transparencySection?.pill1?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    transparencySection: {
                      ...(homepageConfig.transparencySection || {}),
                      pill1: { ...(homepageConfig.transparencySection?.pill1 || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="100% Transparent Accounts"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={homepageConfig.transparencySection?.pill1?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    transparencySection: {
                      ...(homepageConfig.transparencySection || {}),
                      pill1: { ...(homepageConfig.transparencySection?.pill1 || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="১০০% স্বচ্ছ হিসাব"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                />
              </div>

              {/* Pill 2 */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] space-y-1.5">
                <span className="text-[11px] font-bold text-[#006A4E] block">2. Pill 2 (জিরো ফি বিকল্প)</span>
                <input
                  type="text"
                  value={homepageConfig.transparencySection?.pill2?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    transparencySection: {
                      ...(homepageConfig.transparencySection || {}),
                      pill2: { ...(homepageConfig.transparencySection?.pill2 || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="Zero Admin Fee Option"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={homepageConfig.transparencySection?.pill2?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    transparencySection: {
                      ...(homepageConfig.transparencySection || {}),
                      pill2: { ...(homepageConfig.transparencySection?.pill2 || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="জিরো এডমিন ফি বিকল্প"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                />
              </div>

              {/* Pill 3 */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] space-y-1.5">
                <span className="text-[11px] font-bold text-[#006A4E] block">3. Pill 3 (পাবলিক অডিট)</span>
                <input
                  type="text"
                  value={homepageConfig.transparencySection?.pill3?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    transparencySection: {
                      ...(homepageConfig.transparencySection || {}),
                      pill3: { ...(homepageConfig.transparencySection?.pill3 || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  placeholder="Open Public Audits"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={homepageConfig.transparencySection?.pill3?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    transparencySection: {
                      ...(homepageConfig.transparencySection || {}),
                      pill3: { ...(homepageConfig.transparencySection?.pill3 || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  placeholder="পাবলিক অডিট রিপোর্টস"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transparency CMS Shortcut */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">
              {isBn ? 'স্বচ্ছতা নীতিমালা ও অডিট রিপোর্টস ডাটা' : 'Institutional Transparency Pledge & Reports'}
            </p>
            <p className="text-[11px] text-slate-600">
              {isBn
                ? 'পাবলিক হোমপেজে সংগঠন পরিচিতি, ১০০% স্বচ্ছ হিসাব ও ডাউনলোডযোগ্য অডিট রিপোর্টের নিশ্চয়তা কার্ড প্রদর্শিত হয়।'
                : 'Renders the Verified Organization Badge, financial integrity pledge, and audit downloads.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('transparency')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#E6F3EF] text-[#006A4E] text-xs font-bold border border-[#C2E2D7] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBn ? 'স্বচ্ছতা রিপোর্টস ম্যানেজ করুন →' : 'Manage Transparency CMS →'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 11. SUPPORT & ONLINE DONATION BANNER */}
      {/* ============================================================= */}
      <div id="sec-11-support" className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-amber-600 text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-xs">
              11
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {isBn ? 'অনলাইন অনুদান ও সহায়তা ব্যানার (Support & Donation Banner)' : 'Support & Donation Banner'}
              </h3>
              <p className="text-xs font-bold text-amber-700">
                Controls Homepage: "Stand With Infinity Bangladesh" — Bottom Donation & Audit Banner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderSectionVisibilityButton('support')}
            <span className="text-[11px] text-slate-500 bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D9] font-mono">
              sectionKey: 'support'
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Headline Title (EN)</label>
            <input
              type="text"
              value={homepageConfig.supportBanner?.title?.en || ''}
              onChange={(e) => updateHomepageConfig({
                supportBanner: {
                  ...(homepageConfig.supportBanner || {} as any),
                  title: { ...(homepageConfig.supportBanner?.title || { en: '', bn: '' }), en: e.target.value }
                }
              })}
              placeholder="Stand With Infinity Bangladesh"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={homepageConfig.supportBanner?.title?.bn || ''}
              onChange={(e) => updateHomepageConfig({
                supportBanner: {
                  ...(homepageConfig.supportBanner || {} as any),
                  title: { ...(homepageConfig.supportBanner?.title || { en: '', bn: '' }), bn: e.target.value }
                }
              })}
              placeholder="সহযোগিতার হাত বাড়িয়ে দিন"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subtitle Description (EN)</label>
              <textarea
                rows={2}
                value={homepageConfig.supportBanner?.subtitle?.en || ''}
                onChange={(e) => updateHomepageConfig({
                  supportBanner: {
                    ...(homepageConfig.supportBanner || {} as any),
                    subtitle: { ...(homepageConfig.supportBanner?.subtitle || { en: '', bn: '' }), en: e.target.value }
                  }
                })}
                placeholder="Your contributions directly fund verified clothes, nourishment, and winter protection..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সাবটাইটেল বিবরণ (বাংলা)</label>
              <textarea
                rows={2}
                value={homepageConfig.supportBanner?.subtitle?.bn || ''}
                onChange={(e) => updateHomepageConfig({
                  supportBanner: {
                    ...(homepageConfig.supportBanner || {} as any),
                    subtitle: { ...(homepageConfig.supportBanner?.subtitle || { en: '', bn: '' }), bn: e.target.value }
                  }
                })}
                placeholder="আপনার আর্থিক সহযোগিতা সরাসরি সুবিধাবঞ্চিত শিশুদের নতুন পোশাক..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
              />
            </div>
          </div>

          {/* Primary Button */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
            <span className="text-xs font-extrabold text-slate-900 block">Primary Button (অনুদান বোতাম)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Text (EN)</label>
                <input
                  type="text"
                  value={homepageConfig.supportBanner?.primaryButtonText?.en || homepageConfig.supportBanner?.primaryCtaText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    supportBanner: {
                      ...(homepageConfig.supportBanner || {} as any),
                      primaryButtonText: { ...(homepageConfig.supportBanner?.primaryButtonText || { en: '', bn: '' }), en: e.target.value },
                      primaryCtaText: { ...(homepageConfig.supportBanner?.primaryCtaText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  placeholder="Donate to Infinity Bangladesh"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.supportBanner?.primaryButtonText?.bn || homepageConfig.supportBanner?.primaryCtaText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    supportBanner: {
                      ...(homepageConfig.supportBanner || {} as any),
                      primaryButtonText: { ...(homepageConfig.supportBanner?.primaryButtonText || { en: '', bn: '' }), bn: e.target.value },
                      primaryCtaText: { ...(homepageConfig.supportBanner?.primaryCtaText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                  placeholder="অনলাইন অনুদান প্রদান"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Target Route</label>
                <input
                  type="text"
                  value={homepageConfig.supportBanner?.primaryButtonUrl || homepageConfig.supportBanner?.primaryCtaUrl || 'donate'}
                  onChange={(e) => updateHomepageConfig({
                    supportBanner: {
                      ...(homepageConfig.supportBanner || {} as any),
                      primaryButtonUrl: e.target.value,
                      primaryCtaUrl: e.target.value
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  placeholder="donate"
                />
              </div>
            </div>
          </div>

          {/* Secondary Button */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
            <span className="text-xs font-extrabold text-slate-900 block">Secondary Button (অডিট বোতাম)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Text (EN)</label>
                <input
                  type="text"
                  value={homepageConfig.supportBanner?.secondaryButtonText?.en || homepageConfig.supportBanner?.secondaryCtaText?.en || ''}
                  onChange={(e) => updateHomepageConfig({
                    supportBanner: {
                      ...(homepageConfig.supportBanner || {} as any),
                      secondaryButtonText: { ...(homepageConfig.supportBanner?.secondaryButtonText || { en: '', bn: '' }), en: e.target.value },
                      secondaryCtaText: { ...(homepageConfig.supportBanner?.secondaryCtaText || { en: '', bn: '' }), en: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  placeholder="Audit & Expense Logs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">লেখা (বাংলা)</label>
                <input
                  type="text"
                  value={homepageConfig.supportBanner?.secondaryButtonText?.bn || homepageConfig.supportBanner?.secondaryCtaText?.bn || ''}
                  onChange={(e) => updateHomepageConfig({
                    supportBanner: {
                      ...(homepageConfig.supportBanner || {} as any),
                      secondaryButtonText: { ...(homepageConfig.supportBanner?.secondaryButtonText || { en: '', bn: '' }), bn: e.target.value },
                      secondaryCtaText: { ...(homepageConfig.supportBanner?.secondaryCtaText || { en: '', bn: '' }), bn: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                  placeholder="স্বচ্ছতা ও অডিট রিপোর্ট"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold">Target Route</label>
                <input
                  type="text"
                  value={homepageConfig.supportBanner?.secondaryButtonUrl || homepageConfig.supportBanner?.secondaryCtaUrl || 'transparency'}
                  onChange={(e) => updateHomepageConfig({
                    supportBanner: {
                      ...(homepageConfig.supportBanner || {} as any),
                      secondaryButtonUrl: e.target.value,
                      secondaryCtaUrl: e.target.value
                    }
                  })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  placeholder="transparency"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
