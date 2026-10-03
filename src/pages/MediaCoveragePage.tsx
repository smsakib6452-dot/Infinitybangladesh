import React, { useState } from 'react';
import { Newspaper, ExternalLink, Search, Calendar, Tv, Globe, BookOpen, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { PressCoverageType } from '../types';
import { getAssetUrl, handleImageError } from '../lib/utils/assetHelper';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';

export const MediaCoveragePage: React.FC = () => {
  const { pressCoverages, settings } = useData();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const publishedItems = pressCoverages.filter(p => p.status === 'published');

  const filteredItems = publishedItems.filter(item => {
    const matchesType = selectedType === 'all' || item.coverageType === selectedType;
    const matchesSearch = !searchQuery ||
      item.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.bn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: PressCoverageType) => {
    switch (type) {
      case 'tv':
        return <Tv className="w-3.5 h-3.5" />;
      case 'online':
        return <Globe className="w-3.5 h-3.5" />;
      case 'blog':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'social':
        return <Share2 className="w-3.5 h-3.5" />;
      case 'newspaper':
      default:
        return <Newspaper className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type: PressCoverageType) => {
    switch (type) {
      case 'tv':
        return isBn ? 'টিভি প্রতিবেদন' : 'TV & Broadcast';
      case 'online':
        return isBn ? 'অনলাইন নিউজ' : 'Online News';
      case 'blog':
        return isBn ? 'ব্লগ ও ফিচার' : 'Blog & Feature';
      case 'social':
        return isBn ? 'সোশ্যাল মিডিয়া' : 'Social Spotlight';
      case 'newspaper':
      default:
        return isBn ? 'জাতীয় সংবাদপত্র' : 'Newspaper';
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#006A4E]/10 via-[#FAF7F2] to-[#FCFBF7] border-b border-[#EAE3D9] py-16 sm:py-20">
        <ScrollReveal effect="fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#006A4E]/20 text-[#006A4E] text-xs font-extrabold shadow-warm-sm">
              <Newspaper className="w-4 h-4" />
              <span>{isBn ? 'গণমাধ্যমে ইনফিনিটি বাংলাদেশ' : 'Media Coverage & Press Mentions'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display tracking-tight max-w-3xl mx-auto leading-tight">
              {isBn ? 'জাতীয় গণমাধ্যমে আমাদের কার্যক্রমের প্রতিফলন' : 'In The News & External Press Coverage'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {isBn
                ? 'দৈনিক সংবাদপত্র, জাতীয় টিভি চ্যানেল এবং অনলাইন পোর্টালে প্রকাশিত ইনফিনিটি বাংলাদেশের মানবিক অভিযান ও স্বচ্ছতার প্রতিবেদন।'
                : 'Independent journalism, TV broadcasts, and verified news features highlighting Team Infinity’s humanitarian relief drives and volunteer impact.'}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE3D9] shadow-warm-sm">
          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', labelEn: 'All Coverage', labelBn: 'সকল সংবাদ' },
              { id: 'newspaper', labelEn: 'Newspapers', labelBn: 'সংবাদপত্র' },
              { id: 'tv', labelEn: 'TV & Video', labelBn: 'টিভি প্রতিবেদন' },
              { id: 'online', labelEn: 'Online Portals', labelBn: 'অনলাইন পোর্টাল' },
              { id: 'blog', labelEn: 'Blogs & Articles', labelBn: 'ব্লগ ও নিবন্ধ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-[#006A4E] text-white shadow-warm-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {isBn ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'সংবাদ বা পত্রিকা খুঁজুন...' : 'Search news or outlet...'}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none transition-colors"
            />
          </div>
        </div>

        {/* News Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3D9] shadow-warm-sm space-y-4">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              {isBn ? 'কোনো সংবাদ প্রতিবেদন পাওয়া যায়নি' : 'No press coverage items found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBn ? 'ভিন্ন কোনো ফিল্টার বা অনুসন্ধান শব্দ ব্যবহার করে দেখুন।' : 'Try changing your search keyword or selected category tab.'}
            </p>
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {filteredItems.map(item => (
              <StaggerItem
                key={item.id}
                className="h-full flex"
              >
                <article className="group bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 h-full w-full">
                  {/* Feature Image Header */}
                  <a
                    href={item.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-[16/10] overflow-hidden bg-slate-100 shrink-0"
                  >
                    <img
                      src={getAssetUrl(item.imageUrl || '/images/infinity-cover-hero.jpg')}
                      alt={isBn ? item.title.bn : item.title.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu ease-out"
                      onError={handleImageError}
                    />

                    {/* Coverage Type Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                      {getTypeIcon(item.coverageType)}
                      <span>{getTypeLabel(item.coverageType)}</span>
                    </div>

                    {item.isFeatured && (
                      <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                  </a>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Publisher Outlet & Date */}
                      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                        <span className="font-extrabold text-[#006A4E] text-xs uppercase tracking-wider">
                          {item.outletName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.publishedDate}</span>
                        </div>
                      </div>

                      {/* Headline */}
                      <a
                        href={item.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group/title"
                      >
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-display leading-snug group-hover/title:text-[#006A4E] transition-colors">
                          {isBn ? item.title.bn : item.title.en}
                        </h3>
                      </a>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {isBn ? item.excerpt.bn : item.excerpt.en}
                      </p>
                    </div>

                    {/* External Read Button (target="_blank") */}
                    <div className="pt-3 border-t border-slate-100 mt-auto">
                      <a
                        href={item.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#006A4E] text-[#006A4E] hover:text-white border border-[#EAE3D9] hover:border-transparent text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn cursor-pointer shadow-2xs"
                      >
                        <span>{isBn ? 'মূল প্রতিবেদন পড়ুন / দেখুন' : 'Read Full Article / Report'}</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </section>
    </div>
  );
};
