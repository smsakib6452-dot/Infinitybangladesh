import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { JourneyVideo } from '../types';
import { getAssetUrl } from '../lib/utils/assetHelper';
import {
  detectAndNormalizeMedia,
  DEFAULT_VIDEO_THUMBNAIL,
  getYouTubeEmbedUrl,
  getFacebookEmbedUrl,
  isFacebookVideoUrl,
  ensureAutoplayEmbedUrl
} from '../lib/utils/mediaHelper';
import {
  Play,
  Calendar,
  ExternalLink,
  ChevronDown,
  Clock,
  Sparkles,
  Film,
  RotateCcw,
  AlertCircle,
  Maximize2
} from 'lucide-react';

interface JourneyVideoArchiveProps {
  headLocation?: string;
  estYear?: string;
}

export const JourneyVideoArchive: React.FC<JourneyVideoArchiveProps> = ({
  headLocation = 'Hathazari, Chattogram, Bangladesh',
  estYear = '2015'
}) => {
  const { isBn, tText } = useLanguage();
  const { journeyVideos, aboutSettings, settings } = useData();

  const effectiveLocation = headLocation || aboutSettings.location || settings.officialAddress || 'Hathazari, Chattogram, Bangladesh';
  const effectiveEstYear = estYear || aboutSettings.establishedYear || settings.establishedYear || '2015';

  // 1. Filter published videos and sort by display order
  const publishedVideos = useMemo(() => {
    return journeyVideos
      .filter(v => v.isPublished !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [journeyVideos]);

  // 2. Select initial active video: featured one, or first available
  const defaultVideoId = useMemo(() => {
    const featured = publishedVideos.find(v => v.isFeatured);
    if (featured) return featured.id;
    return publishedVideos[0]?.id || '';
  }, [publishedVideos]);

  const [selectedId, setSelectedId] = useState<string>(defaultVideoId);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [embedError, setEmbedError] = useState<boolean>(false);

  // Sync selectedId when publishedVideos changes if current selection is invalid
  useEffect(() => {
    if (!publishedVideos.some(v => v.id === selectedId)) {
      setSelectedId(defaultVideoId);
      setIsPlaying(false);
      setEmbedError(false);
    }
  }, [publishedVideos, defaultVideoId, selectedId]);

  // Reset playing state when switching timeline tab
  const handleSelectTimeline = (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setIsPlaying(false);
    setEmbedError(false);
    setIsDropdownOpen(false);
  };

  // Find currently selected video record
  const currentVideo: JourneyVideo | undefined = useMemo(() => {
    return publishedVideos.find(v => v.id === selectedId) || publishedVideos[0];
  }, [publishedVideos, selectedId]);

  // Detect media URL format & embed information with guaranteed autoplay for 1-click playback
  const mediaInfo = useMemo(() => {
    if (!currentVideo || !currentVideo.videoUrl?.trim()) return null;
    const rawUrl = currentVideo.videoUrl.trim();
    const det = detectAndNormalizeMedia(rawUrl);

    if (det.type === 'youtube' && det.videoId) {
      return {
        ...det,
        embedUrl: getYouTubeEmbedUrl(det.videoId, { autoplay: true, rel: 0, mute: true })
      };
    }

    if (det.type === 'facebook' || isFacebookVideoUrl(rawUrl)) {
      return {
        ...det,
        embedUrl: getFacebookEmbedUrl(rawUrl, { autoplay: true })
      };
    }

    if (currentVideo.embedUrl && currentVideo.embedUrl.trim()) {
      return {
        ...det,
        embedUrl: ensureAutoplayEmbedUrl(currentVideo.embedUrl, rawUrl)
      };
    }

    return {
      ...det,
      embedUrl: ensureAutoplayEmbedUrl(det.embedUrl, rawUrl)
    };
  }, [currentVideo]);

  const rawThumbnail = currentVideo?.thumbnailUrl || mediaInfo?.thumbnailUrl || aboutSettings.heroImageUrl || '/images/infinity-cover-hero.jpg';
  const effectiveThumbnail = getAssetUrl(rawThumbnail);
  const hasValidVideoUrl = Boolean(currentVideo && currentVideo.videoUrl && currentVideo.videoUrl.trim().length > 0);

  // Limit direct top buttons to first 3 items if more exist
  const primaryPills = publishedVideos.slice(0, 3);
  const extraPills = publishedVideos.slice(3);

  // If no published videos at all, show fallback photo
  if (publishedVideos.length === 0) {
    return (
      <div className="relative">
        <div className="rounded-3xl overflow-hidden shadow-warm-xl border-4 border-white aspect-video bg-slate-100">
          <img
            src={getAssetUrl(aboutSettings.heroImageUrl || '/images/infinity-cover-hero.jpg')}
            alt="Infinity Bangladesh Field Service"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-3.5 -left-3.5 bg-[#006A4E] text-white px-4 py-2.5 rounded-2xl shadow-warm-md text-xs font-bold border border-emerald-400">
          <span>{effectiveLocation.split(',')[0]} &bull; Est. {effectiveEstYear}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Dynamic Timeline Navigation Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 max-w-full">
          {primaryPills.map(video => {
            const isSelected = video.id === currentVideo?.id;
            const timelineText = tText(video.timelineLabel) || (typeof video.timelineLabel === 'string' ? video.timelineLabel : 'Timeline');
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => handleSelectTimeline(video.id)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#006A4E] text-white shadow-warm-sm ring-2 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9] hover:border-[#006A4E]/30'
                }`}
                title={tText(video.title)}
              >
                <Calendar className={`w-3 h-3 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`} />
                <span>{timelineText}</span>
              </button>
            );
          })}

          {/* Extra journeys dropdown if > 3 exist */}
          {extraPills.length > 0 && (
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-1 border ${
                  extraPills.some(v => v.id === currentVideo?.id)
                    ? 'bg-[#006A4E] text-white border-emerald-600 shadow-warm-sm'
                    : 'bg-white hover:bg-[#FAF7F2] text-slate-700 border-[#EAE3D9]'
                }`}
              >
                <span>{isBn ? 'আরও ভিডিও' : 'More Videos'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-56 rounded-2xl bg-white border border-[#EAE3D9] shadow-warm-lg z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                    {extraPills.map(video => {
                      const isSelected = video.id === currentVideo?.id;
                      const timelineText = tText(video.timelineLabel) || (typeof video.timelineLabel === 'string' ? video.timelineLabel : 'Timeline');
                      return (
                        <button
                          key={video.id}
                          type="button"
                          onClick={() => handleSelectTimeline(video.id)}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#E6F3EF] text-[#00523C] font-extrabold'
                              : 'text-slate-700 hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <span className="truncate">{timelineText} — {tText(video.title)}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#006A4E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Category Pill Tag */}
        {currentVideo?.category && (
          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
            {currentVideo.category}
          </span>
        )}
      </div>

      {/* 2. Professional 16:9 Video Card & Player Container */}
      <div className="relative group">
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-video bg-black relative flex items-center justify-center ring-1 ring-slate-900/10">
          {/* STATE A: ACTIVE EMBEDDED PLAYER */}
          {isPlaying && hasValidVideoUrl && (mediaInfo?.embedUrl || mediaInfo?.type === 'direct_video') && !embedError ? (
            <div className="w-full h-full relative bg-black flex flex-col justify-between overflow-hidden">
              {mediaInfo?.type === 'direct_video' ? (
                <video
                  src={mediaInfo.originalUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain absolute inset-0 z-0"
                />
              ) : (
                <iframe
                  src={mediaInfo?.embedUrl}
                  title={tText(currentVideo.title) || 'Infinity Bangladesh Journey Video'}
                  className="w-full h-full border-0 absolute inset-0 z-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onError={() => setEmbedError(true)}
                />
              )}

              {/* Floating Glassmorphism Player Control Bar */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10 opacity-90 hover:opacity-100 transition-opacity">
                {currentVideo.videoUrl ? (
                  <a
                    href={currentVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-[11px] font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md border border-white/20 hover:scale-105"
                    title="Open on Source Platform"
                  >
                    <span>{mediaInfo?.platform === 'facebook' ? (isBn ? 'ফেসবুকে দেখুন' : 'Watch on Facebook') : (isBn ? 'ইউটিউবে দেখুন' : 'Watch on YouTube')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="pointer-events-auto px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-[11px] font-bold backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-md border border-white/20 hover:scale-105"
                  title="Return to Preview"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isBn ? 'প্রিভিউ' : 'Close Player'}</span>
                </button>
              </div>
            </div>
          ) : isPlaying && hasValidVideoUrl && embedError ? (
            /* STATE B: EMBED ERROR / BLOCKED IFRAME FALLBACK */
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
              <img
                src={effectiveThumbnail}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <div className="relative z-10 space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-amber-400 border border-white/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm sm:text-base">
                  {mediaInfo?.platform === 'facebook'
                    ? (isBn ? 'ফেসবুকে ভিডিওটি দেখুন' : 'Watch this video on Facebook')
                    : (isBn ? 'ইউটিউবে ভিডিওটি খুলুন' : 'Open Video on YouTube')}
                </h4>
                <p className="text-xs text-slate-300">
                  {isBn
                    ? 'ব্রাউজার সীমাবদ্ধতার কারণে ভিডিওটি সরাসরি অফিসিয়াল মাধ্যমে দেখার পরামর্শ দেওয়া হচ্ছে।'
                    : 'Direct embed playback is restricted by your browser. You can watch the full video directly on the source platform.'}
                </p>
                <a
                  href={currentVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs shadow-warm-md transition-all cursor-pointer"
                >
                  <span>{isBn ? 'সরাসরি ভিডিও প্লে করুন' : 'Watch Original Video'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : hasValidVideoUrl ? (
            /* STATE C: CINEMATIC THUMBNAIL WITH PULSING PLAY BUTTON */
            <div
              className="w-full h-full relative cursor-pointer group/thumb select-none"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={effectiveThumbnail}
                alt={tText(currentVideo.title) || 'Infinity Bangladesh Journey'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = DEFAULT_VIDEO_THUMBNAIL;
                }}
              />

              {/* Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity" />

              {/* Centered Glowing Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <span className="absolute -inset-2.5 rounded-full bg-emerald-500/35 animate-ping" />
                  <div className="relative w-15 sm:w-16 h-15 sm:h-16 rounded-full bg-[#006A4E] text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover/thumb:scale-110 group-hover/thumb:bg-emerald-600 border-2 border-white/60">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Floating Timeline Tag on Top Right */}
              <div className="absolute top-3.5 right-3.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-warm-sm">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{tText(currentVideo.timelineLabel)}</span>
              </div>

              {/* Card Footer Details Overlaid on Thumbnail */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#006A4E] text-emerald-100 border border-emerald-400/40">
                    {isBn ? 'ভিডিও ডকুমেন্টারি' : 'Official Journey Archive'}
                  </span>
                  {currentVideo.isFeatured && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/90 text-white flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{isBn ? 'বিশেষ পরিক্রমা' : 'Featured'}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-display text-white drop-shadow-md truncate">
                  {tText(currentVideo.title)}
                </h3>

                {tText(currentVideo.description) && (
                  <p className="text-xs text-slate-200 line-clamp-1 leading-relaxed drop-shadow-sm">
                    {tText(currentVideo.description)}
                  </p>
                )}

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold backdrop-blur-sm transition-all shadow-sm cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isBn ? 'ভিডিও চালান' : 'Play Video'}</span>
                  </button>

                  {currentVideo.videoUrl && (
                    <a
                      href={currentVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-black/60 hover:bg-black text-slate-200 hover:text-white text-[11px] font-bold backdrop-blur-sm transition-all border border-white/20"
                    >
                      <span>{mediaInfo?.platform === 'facebook' ? (isBn ? 'ফেসবুকে দেখুন' : 'Watch on Facebook') : (isBn ? 'সরাসরি লিঙ্ক' : 'Source Link')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* STATE D: CLEAN "VIDEO COMING SOON" STATE */
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-[#11241E] to-[#0A1612]">
              {effectiveThumbnail && (
                <img
                  src={effectiveThumbnail}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                />
              )}
              <div className="relative z-10 space-y-2.5 max-w-xs sm:max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-800/80 shadow-warm-sm">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 mb-1">
                    {tText(currentVideo.timelineLabel)}
                  </span>
                  <h4 className="font-extrabold text-base text-white font-display">
                    {tText(currentVideo.title)}
                  </h4>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed line-clamp-2">
                  {tText(currentVideo.description) || (isBn
                    ? 'আমাদের এই পর্বের প্রামাণ্যচিত্রটি শীঘ্রই এখানে সরাসরি উপভোগ করতে পারবেন।'
                    : 'The documentary video for this milestone journey will be uploaded shortly.')}
                </p>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-emerald-100 text-xs font-bold border border-white/15">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'ভিডিওটি শীঘ্রই আসছে' : 'Video Coming Soon'}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Est. Badge at bottom left matching original card style */}
        <div className="absolute -bottom-3 -left-3 bg-[#006A4E] text-white px-3.5 py-2 rounded-2xl shadow-warm-md text-xs font-bold border border-emerald-400 z-10 flex items-center gap-1.5">
          <span>{effectiveLocation.split(',')[0]} &bull; Est. {effectiveEstYear}</span>
        </div>
      </div>
    </div>
  );
};
