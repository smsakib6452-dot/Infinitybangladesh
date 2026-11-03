import React, { useState, useMemo } from 'react';
import { GalleryPhoto } from '../../types';
import { Link } from '../../context/RouterContext';
import { useData } from '../../context/DataContext';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { OptimizedImage } from '../OptimizedImage';
import { detectAndNormalizeMedia } from '../../lib/utils/mediaHelper';
import {
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface GalleryPreviewSectionProps {
  gallery: GalleryPhoto[];
  gallerySection: any;
  onSelectPhoto: (index: number) => void;
  isBn: boolean;
  tText: (value: any) => string;
}

export const GalleryPreviewSection: React.FC<GalleryPreviewSectionProps> = ({
  gallery,
  gallerySection,
  onSelectPhoto,
  isBn,
  tText
}) => {
  const { journeyVideos } = useData();

  // Published Journey Videos sorted by display order
  const publishedVideos = useMemo(() => {
    if (!journeyVideos || journeyVideos.length === 0) return [];
    return journeyVideos
      .filter(v => v.isPublished !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [journeyVideos]);

  const defaultVideoId = useMemo(() => {
    const featured = publishedVideos.find(v => v.isFeatured);
    if (featured) return featured.id;
    return publishedVideos[0]?.id || '';
  }, [publishedVideos]);

  const [selectedVideoId, setSelectedVideoId] = useState<string>(defaultVideoId);

  // Sync if publishedVideos loads asynchronously
  React.useEffect(() => {
    if (!selectedVideoId && defaultVideoId) {
      setSelectedVideoId(defaultVideoId);
    }
  }, [defaultVideoId, selectedVideoId]);

  const activeVideo = useMemo(() => {
    return publishedVideos.find(v => v.id === selectedVideoId) || publishedVideos[0] || null;
  }, [publishedVideos, selectedVideoId]);

  const mediaInfo = useMemo(() => {
    if (!activeVideo?.videoUrl) return null;
    return detectAndNormalizeMedia(activeVideo.videoUrl);
  }, [activeVideo?.videoUrl]);

  const displayedPhotos = useMemo(() => gallery.slice(0, 6), [gallery]);

  // Dynamically balance grid columns so 5 or 6 photos span the width symmetrically
  const gridClasses = useMemo(() => {
    if (displayedPhotos.length === 5) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4.5 max-w-7xl mx-auto';
    }
    return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-7xl mx-auto';
  }, [displayedPhotos.length]);

  return (
    <section key="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
      {/* 1. Header */}
      <SectionHeading
        badge={tText(gallerySection?.badge) || (isBn ? 'ভিজ্যুয়াল ডকুমেন্টস ও মেমোরি' : 'Visual Documentation')}
        title={tText(gallerySection?.title) || (isBn ? 'মাঠপর্যায়ের স্মৃতি ও জীবন্ত তথ্যচিত্র' : 'Moments of Humanity in Action')}
        subtitle={
          tText(gallerySection?.subtitle) || (
            isBn
              ? 'আমাদের প্রতিটি মানবিক উদ্যোগ ও সেবামূলক মুহূর্তের প্রামাণ্য আলোকচিত্র ও ভিডিও দলিল।'
              : 'Capturing youth volunteerism, festive smiles, and documentary archives.'
          )
        }
      />

      {/* 2. Top Spotlight: Featured Documentary Video (1-Click Embedded Player) */}
      {activeVideo && (
        <div className="max-w-4xl mx-auto space-y-3.5 sm:space-y-4">
          {/* Episode Switcher if multiple journey videos exist */}
          {publishedVideos.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {publishedVideos.map((vid) => {
                const isSelected = vid.id === (activeVideo?.id || selectedVideoId);
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => setSelectedVideoId(vid.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#006A4E] text-white shadow-warm-xs'
                        : 'bg-white text-slate-700 hover:bg-[#FAF7F2] border border-[#EAE3D9]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{tText(vid.timelineLabel) || 'পর্ব'}</span>
                    <span className="text-xs opacity-85">({tText(vid.title)})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 1-Click Embedded Video Screen */}
          <div className="rounded-3xl overflow-hidden shadow-warm-xl border-4 border-white bg-slate-950 aspect-16/9 relative">
            {mediaInfo?.type === 'direct_video' ? (
              <video
                src={mediaInfo.originalUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (mediaInfo?.embedUrl || activeVideo.embedUrl) ? (
              <iframe
                src={mediaInfo?.embedUrl || activeVideo.embedUrl}
                title={tText(activeVideo.title) || 'Infinity Bangladesh Documentary'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center">
                <p className="text-sm font-medium text-slate-300">
                  {isBn ? 'ভিডিও লিঙ্ক লোড করা সম্ভব হয়নি।' : 'Video stream unavailable.'}
                </p>
              </div>
            )}
          </div>

          {/* Video Metadata & Source Links */}
          <div className="bg-white rounded-2xl border border-[#EAE3D9] p-4 sm:p-5 shadow-warm-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-[#006A4E] text-xs font-bold border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{tText(activeVideo.timelineLabel) || '২০১৫–২০২৫'}</span>
                </span>
                <span className="text-xs text-slate-500 font-medium truncate">
                  {activeVideo.category || 'Organizational Journey'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display font-bengali">
                {tText(activeVideo.title) || (isBn ? 'ইনফিনিটি বাংলাদেশ পরিক্রমা' : 'Infinity Bangladesh Journey')}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 font-bengali">
                {tText(activeVideo.description)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {activeVideo.videoUrl && (
                <a
                  href={activeVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-xs font-bold border border-[#D8CFC4] hover:border-[#006A4E] hover:text-[#006A4E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isBn ? 'সরাসরি প্ল্যাটফর্মে দেখুন' : 'Watch on Source'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <Link
                to="about/story"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isBn ? 'পরিক্রমা আর্কাইভ' : 'Journey Archive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Photos Grid (Directly beneath video) */}
      <div className="space-y-4 sm:space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base font-display">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#006A4E]" />
            <span>{isBn ? 'মাঠপর্যায়ের নির্বাচিত আলোকচিত্র' : 'Curated Field Moments'}</span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            {isBn ? 'ক্লিক করে পূর্ণাঙ্গ ছবিতে দেখুন' : 'Click to enlarge in lightbox'}
          </span>
        </div>

        <StaggerGroup className={gridClasses}>
          {displayedPhotos.map((photo, i) => {
            const isFeaturedOdd = displayedPhotos.length === 5 && i === 0;
            return (
              <StaggerItem
                key={photo.id}
                className={isFeaturedOdd ? "col-span-2 sm:col-span-1 w-full" : "w-full"}
              >
                <div
                  onClick={() => onSelectPhoto(i)}
                  data-cursor="view"
                  className={`gallery-lightbox-trigger group relative w-full rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-warm-xs hover:shadow-warm-md border border-[#EAE3D9] transition-all transform hover:-translate-y-1 ${
                    isFeaturedOdd ? 'aspect-16/10 sm:aspect-square' : 'aspect-square'
                  }`}
                >
                  <OptimizedImage
                    src={photo.imageUrl}
                    alt={tText(photo.title)}
                    width={isFeaturedOdd ? 700 : 380}
                    aspectRatio={isFeaturedOdd ? "16/10" : "1/1"}
                    sizes={isFeaturedOdd ? "(max-width: 640px) 100vw, 200px" : "(max-width: 640px) 150px, 200px"}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-2.5 sm:p-2.5 transition-all">
                    <span className="text-[11px] sm:text-xs text-white font-bold line-clamp-2 leading-snug drop-shadow-sm font-bengali">
                      {tText(photo.title)}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>

      {/* 4. Streamlined View All Media Action */}
      <div className="text-center pt-2 sm:pt-4">
        <Link
          to={gallerySection?.viewAllUrl || "gallery"}
          className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-[#FAF7F2] active:bg-[#F2ECE1] text-[#006A4E] text-xs sm:text-sm font-bold border border-[#EAE3D9] shadow-warm-xs hover:shadow-warm-sm transition-all transform hover:-translate-y-0.5 cursor-pointer group select-none"
        >
          <span>{tText(gallerySection?.viewAllText) || (isBn ? 'সম্পূর্ণ ফটো ও ভিডিও অ্যালবাম দেখুন' : 'Explore Complete Media Album')}</span>
          <ArrowRight className="w-4 h-4 text-[#006A4E] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
