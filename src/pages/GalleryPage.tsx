import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { Image as ImageIcon, Video, Newspaper, Calendar, Sparkles, Search, Tag } from 'lucide-react';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { getAssetUrl, handleImageError } from '../lib/utils/assetHelper';
import { GalleryPhoto } from '../types';

export const GalleryPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { queryParams, currentSlug, navigate } = useRouter();
  const { mediaLibrary, gallery, programEvents, eventMediaList, programs } = useData();

  // Active filter eventId from queryParams or currentSlug (e.g. ?event=pevt-eid-2024 or #gallery/pevt-eid-2024)
  const initialEventId = queryParams?.event || queryParams?.program || (currentSlug && currentSlug.startsWith('pevt-') ? currentSlug : '');
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Sync if URL query param changes
  React.useEffect(() => {
    if (queryParams?.event) {
      setSelectedEventId(queryParams.event);
    }
  }, [queryParams]);

  const activeEvent = programEvents.find(e => e.id === selectedEventId || e.slug === selectedEventId);
  const activeProgram = activeEvent ? programs.find(p => p.id === activeEvent.programId) : null;

  // Unify dynamic images from mediaLibrary & gallery with event association
  const allPhotos: (GalleryPhoto & { usageTags?: string[]; eventId?: string; isHighlight?: boolean })[] = useMemo(() => {
    // Map media items
    const mediaImages = mediaLibrary
      .filter(m => m.type !== 'video' && m.status !== 'draft')
      .map(item => {
        const matchingEm = eventMediaList.find(em => em.mediaId === item.id);

        return {
          id: item.id,
          title: {
            en: item.title || item.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            bn: item.altText || item.title || item.fileName
          },
          caption: {
            en: item.caption || item.altText || 'Infinity Bangladesh Official Photographic Record',
            bn: item.altText || item.caption || 'ইনফিনিটি বাংলাদেশ অফিসিয়াল আলোকচিত্র'
          },
          imageUrl: item.url,
          category: item.category || 'General',
          date: item.uploadedAt || 'Official Archive',
          usageTags: item.usageTags || [],
          eventId: matchingEm?.eventId,
          isHighlight: matchingEm?.isHighlight
        };
      });

    if (mediaImages.length > 0) {
      return mediaImages;
    }

    return gallery;
  }, [mediaLibrary, gallery, eventMediaList]);

  // Dynamically compute unique category filter tabs
  const categoryTabs = useMemo(() => {
    const standardTabs = [
      { id: 'All', labelEn: 'All Photos', labelBn: 'সকল ছবি' },
      { id: 'Campaigns', labelEn: 'Campaigns', labelBn: 'ত্রাণ অভিযান' },
      { id: 'Events', labelEn: 'Events', labelBn: 'কর্মসূচি ও ইভেন্ট' },
      { id: 'Volunteers', labelEn: 'Volunteers & Leadership', labelBn: 'স্বেচ্ছাসেবী ও পরিষদ' },
      { id: 'Hero', labelEn: 'Highlights', labelBn: 'প্রধান মুহূর্ত' },
      { id: 'Logos', labelEn: 'Brand & Emblems', labelBn: 'ব্র্যান্ড ও প্রতীক' }
    ];

    const presentCats = new Set<string>();
    allPhotos.forEach(p => {
      if (p.category) presentCats.add(p.category);
      if (p.usageTags) {
        p.usageTags.forEach(t => presentCats.add(t));
      }
    });

    return standardTabs.filter(tab => {
      if (tab.id === 'All') return true;
      return Array.from(presentCats).some(c => c.toLowerCase().includes(tab.id.toLowerCase()));
    });
  }, [allPhotos]);

  // Filtered photos based on active category, event filter & search query
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(item => {
      // Event filter
      if (selectedEventId) {
        // If an event is explicitly selected, check if this photo is linked to this event
        const matchingEm = eventMediaList.find(em => em.mediaId === item.id && (em.eventId === selectedEventId || em.eventId === activeEvent?.id));
        if (!matchingEm && item.eventId !== selectedEventId) {
          return false;
        }
      }

      // Category / Tag filter
      let matchesCat = true;
      if (activeCategory !== 'All') {
        const catLower = activeCategory.toLowerCase();
        const itemCat = (item.category || '').toLowerCase();
        const hasTagMatch = (item.usageTags || []).some(tag => tag.toLowerCase().includes(catLower));
        matchesCat = itemCat.includes(catLower) || catLower.includes(itemCat) || hasTagMatch;
      }

      // Search query filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rawTitle = item.title as any;
        const rawCaption = item.caption as any;
        const titleEn = typeof rawTitle === 'string' ? rawTitle.toLowerCase() : (rawTitle?.en ? String(rawTitle.en).toLowerCase() : '');
        const titleBn = typeof rawTitle === 'string' ? rawTitle.toLowerCase() : (rawTitle?.bn ? String(rawTitle.bn).toLowerCase() : '');
        const capEn = typeof rawCaption === 'string' ? rawCaption.toLowerCase() : (rawCaption?.en ? String(rawCaption.en).toLowerCase() : '');
        const capBn = typeof rawCaption === 'string' ? rawCaption.toLowerCase() : (rawCaption?.bn ? String(rawCaption.bn).toLowerCase() : '');
        const cat = (item.category || '').toLowerCase();
        const tags = (item.usageTags || []).join(' ').toLowerCase();

        matchesSearch = titleEn.includes(q) || titleBn.includes(q) || capEn.includes(q) || capBn.includes(q) || cat.includes(q) || tags.includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }, [allPhotos, selectedEventId, activeEvent, eventMediaList, activeCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12 overflow-x-hidden">
      {/* Header Banner */}
      <ScrollReveal effect="fade-up">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBn ? 'মাঠপর্যায়ের স্মৃতি ও তথ্যচিত্র' : 'Visual Archives'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            {isBn ? 'আলোকচিত্র ও মাঠপর্যায়ের গ্যালারি' : 'Photo Documentation Gallery'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {isBn
              ? 'আমাদের বিভিন্ন কার্যক্রম, ত্রাণ বিতরণ ও মানবিক মুহূর্তের সংরক্ষিত আলোকচিত্র।'
              : 'Explore ground-level documentation capturing moments of hope, solidarity, and volunteer dedication.'}
          </p>

          {/* Media & Gallery In-Page Sub Navigation Switcher */}
          <div className="pt-3 flex flex-wrap justify-center gap-2 sm:gap-3">
          <Link
            to="gallery"
            className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#006A4E] text-white shadow-warm-sm flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isBn ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery'}</span>
          </Link>
          <Link
            to="videos"
            className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9] hover:border-[#006A4E]/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4 text-[#006A4E]" />
            <span>{isBn ? 'ভিডিও তথ্যচিত্র' : 'Video Documentation'}</span>
          </Link>
          <Link
            to="news"
            className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9] hover:border-[#006A4E]/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Newspaper className="w-4 h-4 text-[#006A4E]" />
            <span>{isBn ? 'সংবাদ ও বিজ্ঞপ্তি' : 'News & Announcements'}</span>
          </Link>
          <Link
            to="events"
            className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9] hover:border-[#006A4E]/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#006A4E]" />
            <span>{isBn ? 'ইভেন্ট ও কর্মসূচি' : 'Events & Schedules'}</span>
          </Link>
        </div>
      </div>
      </ScrollReveal>

      {/* Active Event Filter Banner (Bi-directional Navigation) */}
      {activeEvent && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl border border-emerald-200 p-4 sm:p-6 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#006A4E] uppercase tracking-wider">
                {isBn ? 'বাছাইকৃত আসরের গ্যালারি' : 'Showing Event Gallery'}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                {tText(activeEvent.title)} ({activeEvent.year})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {activeProgram && (
              <button
                onClick={() => navigate('programs/event-detail', activeProgram.slug, activeEvent.slug)}
                className="px-4 py-2 rounded-xl bg-[#006A4E] text-white hover:bg-[#00523C] text-xs font-bold transition-all shadow-warm-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{isBn ? 'এই আসরের বিবরণ দেখুন' : 'View Event Details'}</span>
                <span>→</span>
              </button>
            )}
            <button
              onClick={() => {
                setSelectedEventId('');
                navigate('gallery');
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
            >
              {isBn ? 'ফিল্টার মুছুন' : 'Clear Filter'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 w-full max-w-full overflow-hidden">
        {/* Dynamic Category Filter Pills + Event Selector */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 w-full max-w-full">
          {/* Event Dropdown selector if multiple events exist */}
          {programEvents.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                if (e.target.value) {
                  navigate('gallery', e.target.value);
                } else {
                  navigate('gallery');
                }
              }}
              className="w-full sm:w-auto max-w-full sm:max-w-xs truncate px-3.5 py-2 rounded-2xl text-xs font-bold bg-white border border-[#EAE3D9] text-slate-700 hover:border-[#006A4E] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="">{isBn ? '🎯 সকল ইভেন্ট / আসর' : '🎯 All Events / Editions'}</option>
              {programEvents.map(pe => (
                <option key={pe.id} value={pe.id}>
                  {pe.year} — {tText(pe.title)}
                </option>
              ))}
            </select>
          )}

          {categoryTabs.map(tab => {
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#006A4E] text-white shadow-warm-sm scale-102'
                    : 'bg-white border border-[#EAE3D9] text-slate-700 hover:bg-[#FAF7F2]'
                }`}
              >
                {isBn ? tab.labelBn : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ছবি ও অ্যালবাম খুঁজুন...' : 'Search photo archive...'}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] shadow-warm-xs"
          />
        </div>
      </div>

      {/* Grid of Dynamic Photos */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE3D9] shadow-warm-sm max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {isBn ? 'কোনো ছবি পাওয়া যায়নি' : 'No Photos Found'}
          </h3>
          <p className="text-slate-500 text-xs">
            {isBn
              ? 'বাছাইকৃত ক্যাটাগরির সাথে মিলে এমন কোনো ছবি নেই।'
              : 'No photographs match the active filter or search keyword.'}
          </p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {filteredPhotos.map((photo, index) => {
            const photoTitle = tText(photo.title) || 'Infinity Bangladesh Photo';
            const photoCaption = tText(photo.caption);

            return (
              <StaggerItem
                key={photo.id}
                className="h-full flex"
              >
                <div
                  onClick={() => setSelectedImageIndex(index)}
                  className="group bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 h-full w-full"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={getAssetUrl(photo.imageUrl)}
                      alt={photoTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu ease-out"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#006A4E]/90 text-white backdrop-blur-xs shadow-xs">
                      {photo.category}
                    </span>
                    {photo.isHighlight && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                        ⭐ Highlight
                      </span>
                    )}
                    <div className="absolute inset-0 bg-[#006A4E]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#006A4E] transition-colors line-clamp-1 font-display">
                      {photoTitle}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-auto pt-1">
                      <span className="truncate max-w-[70%]">{photoCaption}</span>
                      <span>{photo.date || 'Recent'}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      {/* Lightbox */}
      {selectedImageIndex !== null && (
        <GalleryLightbox
          photos={filteredPhotos}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
};

