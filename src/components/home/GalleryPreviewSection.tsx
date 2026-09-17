import React from 'react';
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

      <StaggerGroup className="flex flex-wrap justify-center items-center gap-3.5 sm:gap-4 max-w-7xl mx-auto">
        {gallery.slice(0, 6).map((photo, i) => (
          <StaggerItem
            key={photo.id}
            className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.7rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(16.666%-0.85rem)] max-w-[190px] flex-shrink-0"
          >
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

      <div className="text-center pt-8">
        <Link
          to={gallerySection?.viewAllUrl || "gallery"}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 font-extrabold text-xs sm:text-sm border border-[#EAE3D9] shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>{tText(gallerySection?.viewAllText) || (isBn ? 'সম্পূর্ণ ফটো গ্যালারি দেখুন' : 'View Full Photo Gallery')}</span>
          <ArrowRight className="w-4 h-4 text-[#006A4E]" />
        </Link>
      </div>
    </section>
  );
};
