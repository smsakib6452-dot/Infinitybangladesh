import React, { useMemo } from 'react';
import { GalleryPhoto } from '../../types';
import { Link } from '../../context/RouterContext';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { OptimizedImage } from '../OptimizedImage';
import { ArrowRight } from 'lucide-react';

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
  const displayedPhotos = useMemo(() => gallery.slice(0, 6), [gallery]);

  // Dynamically balance grid columns so 5 or 6 photos span the width symmetrically
  const gridClasses = useMemo(() => {
    if (displayedPhotos.length === 5) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4.5 max-w-7xl mx-auto';
    }
    return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-7xl mx-auto';
  }, [displayedPhotos.length]);

  return (
    <section key="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        badge={tText(gallerySection?.badge) || (isBn ? 'আলোকচিত্রে টিম ইনফিনিটি' : 'Visual Documentation')}
        title={tText(gallerySection?.title) || (isBn ? 'মাঠপর্যায়ের স্মৃতি ও আলোকচিত্র' : 'Moments of Humanity in Action')}
        subtitle={
          tText(gallerySection?.subtitle) || (
            isBn
              ? 'আমাদের প্রতিটি মানবিক মুহূর্তের স্বচ্ছ ও মর্যাদাপূর্ণ আলোকচিত্র দলিল।'
              : 'Capturing youth volunteerism, festive smiles, and transparent distribution drives.'
          )
        }
      />

      <StaggerGroup className={gridClasses}>
        {displayedPhotos.map((photo, i) => (
          <StaggerItem key={photo.id} className="w-full">
            <div
              onClick={() => onSelectPhoto(i)}
              data-cursor="view"
              className="gallery-lightbox-trigger group relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-warm-xs hover:shadow-warm-md border border-[#EAE3D9] transition-all transform hover:-translate-y-1"
            >
              <OptimizedImage
                src={photo.imageUrl}
                alt={tText(photo.title)}
                width={380}
                aspectRatio="1/1"
                sizes="(max-width: 640px) 150px, 200px"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-2.5 transition-all">
                <span className="text-[11px] text-white font-bold truncate leading-tight drop-shadow-sm">
                  {tText(photo.title)}
                </span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="text-center pt-6 sm:pt-8">
        <Link
          to={gallerySection?.viewAllUrl || "gallery"}
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 text-[11px] sm:text-sm font-bold border border-[#EAE3D9] shadow-warm-xs transition-all inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
        >
          <span>{tText(gallerySection?.viewAllText) || (isBn ? 'সম্পূর্ণ আলোকচিত্র গ্যালারি দেখুন' : 'View Full Gallery & Albums')}</span>
          <ArrowRight className="w-4 h-4 text-[#006A4E]" />
        </Link>
      </div>
    </section>
  );
};
