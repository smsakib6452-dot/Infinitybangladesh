import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { getAssetUrl } from '../lib/utils/assetHelper';
import { isPortraitVideo } from '../lib/utils/mediaHelper';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Star,
  Image as ImageIcon,
  Play,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Heart,
  Users,
  ShieldCheck
} from 'lucide-react';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { ImageReveal } from '../components/motion/ImageReveal';

export const ProgramEventDetailPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { currentSlug, subSlug, navigate } = useRouter();
  const { programs, getProgramEventBySlug, getEventsByProgramId, getEventHighlights, getEventMedia } = useData();

  // Active Lightbox state
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  // Lookup program & event edition
  const found = getProgramEventBySlug(currentSlug || '', subSlug || '');
  const program = found?.program || programs.find(p => p.slug === currentSlug) || programs[0];
  const allProgramEditions = program ? getEventsByProgramId(program.id) : [];
  const event = found?.event || allProgramEditions[0];

  if (!program || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900 font-display">
          {isBn ? 'ইভেন্ট বা আসরটি পাওয়া যায়নি' : 'Event Edition Not Found'}
        </h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">
          {isBn
            ? 'অনুরোধকৃত ইভেন্টটি খুঁজে পাওয়া যায়নি অথবা তা সরিয়ে ফেলা হয়েছে।'
            : 'The requested event edition could not be found or has been moved.'}
        </p>
        <Link
          to="programs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#006A4E] text-white rounded-2xl text-sm font-bold shadow-warm-sm hover:bg-[#00523C] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'সকল কার্যক্রমে ফিরে যান' : 'Back to All Programs'}</span>
        </Link>
      </div>
    );
  }

  // Get curated highlights & all media for this event
  const highlights = getEventHighlights(event.id);
  const allMedia = getEventMedia(event.id);

  // Compute Prev & Next edition for pagination
  const currentIdx = allProgramEditions.findIndex(e => e.id === event.id);
  const nextEdition = currentIdx > 0 ? allProgramEditions[currentIdx - 1] : null; // newer edition
  const prevEdition = currentIdx < allProgramEditions.length - 1 ? allProgramEditions[currentIdx + 1] : null; // older edition

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium text-slate-500">
          <Link to="home" className="hover:text-[#006A4E] transition-colors cursor-pointer">
            {isBn ? 'হোম' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to="programs" className="hover:text-[#006A4E] transition-colors cursor-pointer">
            {isBn ? 'আমাদের কাজ' : 'Our Work'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => navigate('programs/detail', program.slug)}
            className="hover:text-[#006A4E] transition-colors cursor-pointer text-left truncate max-w-[180px] sm:max-w-xs"
          >
            {tText(program.title)}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-900 truncate max-w-[200px]">
            {tText(event.title)}
          </span>
        </nav>

        {/* Edition Switcher Bar */}
        {allProgramEditions.length > 1 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-3 sm:p-4 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-50 text-[#006A4E] font-extrabold text-xs">
                {allProgramEditions.length}
              </span>
              <span className="text-xs font-bold text-slate-700">
                {isBn ? 'এই উদ্যোগের অন্যান্য আসরসমূহ:' : 'Editions of this Initiative:'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
              {allProgramEditions.map(ed => {
                const isActive = ed.id === event.id;
                return (
                  <button
                    key={ed.id}
                    onClick={() => navigate('programs/event-detail', program.slug, ed.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#006A4E] text-white shadow-warm-sm ring-2 ring-[#006A4E]/20'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006A4E]'
                    }`}
                  >
                    {ed.year}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hero Banner Section */}
        <ScrollReveal effect="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 p-6 sm:p-10 shadow-warm-md">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-[#006A4E] border border-emerald-200">
                  {event.year} {isBn ? 'আসর' : 'Edition'}
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {event.status === 'completed'
                    ? (isBn ? 'সম্পন্ন কার্যক্রম' : 'Completed')
                    : event.status === 'ongoing'
                    ? (isBn ? 'চলমান উদ্যোগ' : 'Ongoing')
                    : (isBn ? 'আসন্ন উদ্যোগ' : 'Upcoming')}
                </span>
                {event.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {isBn ? 'প্রধান আসর' : 'Featured'}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display leading-[1.15]">
                {tText(event.title)}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#006A4E] shrink-0" />
                  <span>{tText(event.location)}</span>
                </div>
                {event.dateRange && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-[#006A4E] shrink-0" />
                    <span>{tText(event.dateRange)}</span>
                  </div>
                )}
              </div>

              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
                {tText(event.shortDescription)}
              </p>

              {/* Impact Metric Quick Counters */}
              {event.impactMetrics && event.impactMetrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {event.impactMetrics.map((met, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-100/80"
                    >
                      <div className="text-xl sm:text-2xl font-black text-[#006A4E] font-display">
                        {met.value}
                      </div>
                      <div className="text-xs font-bold text-slate-600 mt-0.5">
                        {tText(met.label)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Call to actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('gallery', event.id)}
                  className="px-6 py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-warm-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{isBn ? 'এই আসরের পূর্ণাঙ্গ গ্যালারি দেখুন' : 'Explore Full Event Gallery'}</span>
                  {allMedia.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {allMedia.length}
                    </span>
                  )}
                </button>
                <Link
                  to="donate"
                  className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>{isBn ? 'সহায়তা করুন' : 'Support Us'}</span>
                </Link>
              </div>
            </div>

            {/* Cover Photo Presentation */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-warm-xl border-4 border-white bg-slate-100 group">
                <ImageReveal
                  src={getAssetUrl(event.coverImageUrl || program.imageUrl)}
                  alt={tText(event.title)}
                  aspectRatio="aspect-[4/3]"
                  imgClassName="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 text-white text-xs font-semibold">
                  <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {event.year} Official Event Edition
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Narrative & Objectives */}
        <ScrollReveal effect="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {event.fullStory && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    {isBn ? 'কার্যক্রমের প্রেক্ষাপট ও বাস্তবায়ন গল্প' : 'Event Story & Execution'}
                  </h2>
                  <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {tText(event.fullStory)}
                  </div>
                </div>
              )}

              {event.objectives && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    {isBn ? 'মূল লক্ষ্য ও অর্জিত সাফল্য' : 'Key Objectives & Impact'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(isBn ? event.objectives.bn : event.objectives.en).map((obj, oIdx) => (
                      <div
                        key={oIdx}
                        className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-xs sm:text-sm text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Program Context Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-warm-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006A4E] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isBn ? 'মূল কর্মসূচি' : 'Parent Initiative'}
                    </div>
                    <h4 className="text-base font-black text-slate-900 font-display">
                      {tText(program.title)}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tText(program.shortDescription)}
                </p>

                <button
                  onClick={() => navigate('programs/detail', program.slug)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isBn ? 'সম্পূর্ণ কর্মসূচির বিবরণ দেখুন' : 'View Parent Program Details'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ADMIN-SELECTED HIGHLIGHTS GRID (Single Source of Truth) */}
        <ScrollReveal effect="fade-up">
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{isBn ? 'নির্বাচিত বিশেষ মুহূর্তসমূহ' : 'Curated Highlights'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                  {isBn ? 'আলোকচিত্র ও ভিডিও হাইলাইটস' : 'Event Media Highlights'}
                </h2>
              </div>

              <button
                onClick={() => navigate('gallery', event.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-warm-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <ImageIcon className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'সকল মিডিয়া গ্যালারিতে দেখুন' : 'View All Media in Gallery'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {highlights.length > 0 ? (
              <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {highlights.map((item, hIdx) => {
                  const isVideo = item.media.type === 'video' || item.media.mimeType?.includes('video') || Boolean(item.media.embedUrl);
                  const captionText = item.customCaption ? tText(item.customCaption) : item.media.caption || item.media.altText;

                  return (
                    <StaggerItem key={item.id}>
                      <div
                        onClick={() => setActiveMediaIndex(hIdx)}
                        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                      >
                        <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                          <img
                            src={getAssetUrl(item.media.thumbnailUrl || item.media.url)}
                            alt={item.customAlt || item.media.altText || 'Highlight'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Highlight Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>#{item.highlightOrder || hIdx + 1}</span>
                          </div>

                          {/* Video Indicator */}
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/90 text-[#006A4E] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>

                        {captionText && (
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed line-clamp-2">
                              {captionText}
                            </p>
                            <div className="text-[11px] text-[#006A4E] font-bold mt-2 flex items-center gap-1">
                              <span>{isVideo ? (isBn ? 'ভিডিও দেখুন' : 'Watch Video') : (isBn ? 'বড় করে দেখুন' : 'View Full Image')}</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        )}
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006A4E] flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? 'হাইলাইটস সাজানো হচ্ছে' : 'Highlights Coming Soon'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isBn
                  ? 'এই আসরের মিডিয়া ফাইলসমূহ মূল গ্যালারিতে সংরক্ষিত রয়েছে। পূর্ণাঙ্গ গ্যালারি এক্সপ্লোর করুন।'
                  : 'Media files for this event are available in our central photo & video gallery.'}
              </p>
              <button
                onClick={() => navigate('gallery', event.id)}
                className="mt-2 px-5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006A4E] font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isBn ? 'পূর্ণাঙ্গ গ্যালারি দেখুন' : 'Explore Full Gallery'}</span>
              </button>
            </div>
          )}
          </div>
        </ScrollReveal>

        {/* Bottom Edition Navigation Footer */}
        <ScrollReveal effect="fade-up">
          <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevEdition ? (
              <button
                onClick={() => navigate('programs/event-detail', program.slug, prevEdition.slug)}
                className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 text-left transition-all flex items-center gap-3 cursor-pointer group"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#006A4E] shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isBn ? 'পূর্ববর্তী আসর' : 'Previous Edition'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                    {tText(prevEdition.title)} ({prevEdition.year})
                  </div>
                </div>
              </button>
            ) : <div />}

            {nextEdition ? (
              <button
                onClick={() => navigate('programs/event-detail', program.slug, nextEdition.slug)}
                className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 text-right transition-all flex items-center justify-end gap-3 cursor-pointer group ml-auto w-full"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isBn ? 'পরবর্তী আসর' : 'Next Edition'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                    {tText(nextEdition.title)} ({nextEdition.year})
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#006A4E] shrink-0" />
              </button>
            ) : <div />}
          </div>
        </ScrollReveal>

      </div>

      {/* Lightbox Modal for Highlights */}
      {activeMediaIndex !== null && highlights[activeMediaIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveMediaIndex(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          {activeMediaIndex > 0 && (
            <button
              onClick={() => setActiveMediaIndex(activeMediaIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next button */}
          {activeMediaIndex < highlights.length - 1 && (
            <button
              onClick={() => setActiveMediaIndex(activeMediaIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            {(() => {
              const currentItem = highlights[activeMediaIndex];
              const isVid = currentItem.media.type === 'video' || currentItem.media.embedUrl;

              if (isVid && currentItem.media.embedUrl) {
                const isPortrait = isPortraitVideo(currentItem.media);
                return (
                  <div className={`w-full ${isPortrait ? 'aspect-[9/16] max-w-sm mx-auto max-h-[75vh]' : 'aspect-video'} rounded-2xl overflow-hidden shadow-2xl bg-black`}>
                    <iframe
                      src={currentItem.media.embedUrl}
                      title={currentItem.media.altText}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }

              return (
                <img
                  src={getAssetUrl(currentItem.media.url)}
                  alt={currentItem.customAlt || currentItem.media.altText}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                />
              );
            })()}

            <div className="mt-4 text-center text-white max-w-2xl px-4">
              <div className="text-xs text-amber-300 font-bold mb-1">
                ⭐ Highlight #{activeMediaIndex + 1} of {highlights.length}
              </div>
              <p className="text-sm font-medium text-slate-200">
                {highlights[activeMediaIndex].customCaption
                  ? tText(highlights[activeMediaIndex].customCaption!)
                  : highlights[activeMediaIndex].media.caption || highlights[activeMediaIndex].media.altText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
