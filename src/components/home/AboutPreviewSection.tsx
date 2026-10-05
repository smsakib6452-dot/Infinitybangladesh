import React from 'react';
import { Link } from '../../context/RouterContext';
import { ScrollReveal } from '../motion/ScrollReveal';
import { OptimizedImage } from '../OptimizedImage';
import { Sparkles, Target, Eye, ArrowRight, Users } from 'lucide-react';

interface AboutPreviewSectionProps {
  aboutPreview: any;
  aboutSettings: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const AboutPreviewSection: React.FC<AboutPreviewSectionProps> = ({
  aboutPreview,
  aboutSettings,
  isBn,
  tText
}) => {
  const defaultEyebrow = { en: 'Who We Are', bn: 'আমাদের পরিচয় ও লক্ষ্য' };
  const defaultTitleMain = { en: 'People First. Humanity Always.', bn: 'মানুষের পাশে দাঁড়ানোর অঙ্গীকারে রত —' };
  const defaultTitleHighlight = { en: 'Serving with Empathy.', bn: 'অকৃত্রিম সেবায়, ভালোবাসার বন্ধনে।' };
  const defaultDesc = {
    en: 'Founded in Hathazari, Chattogram in 2015, Infinity Bangladesh has grown into a transparent youth humanitarian platform.',
    bn: '২০১৫ সালে চট্টগ্রামের হাটহাজারী থেকে যাত্রা শুরু করে ইনফিনিটি বাংলাদেশ আজ দেশজুড়ে এক স্বচ্ছ ও নিবেদিত তারুণ্যের শক্তিতে পরিণত হয়েছে।'
  };

  return (
    <section key="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center bg-white rounded-3xl sm:rounded-[2.5rem] border border-[#EAE3D9] p-4.5 sm:p-10 lg:p-12 shadow-warm-md">
        <ScrollReveal effect="slide-right" className="lg:col-span-6 space-y-3.5 sm:space-y-5 text-left">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#E6F3EF] border border-[#C2E2D7] text-[#00523C] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
            <span>{tText(aboutPreview?.eyebrow) || tText(defaultEyebrow)}</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display leading-snug sm:leading-tight">
            {tText(aboutPreview?.titleMain) || tText(defaultTitleMain)}{' '}
            <span className="text-[#006A4E]">{tText(aboutPreview?.titleHighlight) || tText(defaultTitleHighlight)}</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-normal">
            {tText(aboutPreview?.description) || tText(defaultDesc)}
          </p>

          {/* Mission & Vision Feature Highlights - Compact 2-Col Micro Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1.5">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#006A4E]/30 transition-colors shadow-2xs">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center shrink-0 border border-[#C2E2D7]/60 shadow-xs">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 font-display truncate">{tText(aboutPreview?.missionHeading) || (isBn ? 'আমাদের লক্ষ্য' : 'Our Mission')}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2">{tText(aboutPreview?.missionText) || tText(aboutSettings?.mission)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#006A4E]/30 transition-colors shadow-2xs">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center shrink-0 border border-[#C2E2D7]/60 shadow-xs">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 font-display truncate">{tText(aboutPreview?.visionHeading) || (isBn ? 'আমাদের দর্শন' : 'Our Vision')}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2">{tText(aboutPreview?.visionText) || tText(aboutSettings?.vision)}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs - Balanced Ergonomic Row */}
          <div className="pt-1.5 sm:pt-2 flex flex-row items-center gap-2 sm:gap-3">
            <Link
              to={aboutPreview?.ctaUrl || 'about/story'}
              className="flex-1 sm:flex-initial px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#006A4E] hover:bg-[#00523C] active:bg-[#00402E] text-white text-[11px] sm:text-sm font-bold shadow-warm-xs hover:shadow-warm-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transform hover:-translate-y-0.5 text-center"
            >
              <span className="truncate">{tText(aboutPreview?.ctaText) || (isBn ? 'সম্পূর্ণ যাত্রা' : 'Full Story')}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <Link
              to={aboutPreview?.secondaryCtaUrl || "about/executive-committee"}
              className="flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-[11px] sm:text-sm font-bold border border-[#D8CFC4] hover:border-[#006A4E] hover:text-[#006A4E] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transform hover:-translate-y-0.5 text-center whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-[#006A4E] shrink-0" />
              <span className="truncate">{tText(aboutPreview?.secondaryCtaText) || (isBn ? 'নেতৃত্ব কমিটি' : 'Executive Team')}</span>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden shadow-warm-xl border-4 border-white aspect-4/3 bg-slate-900 relative">
            <OptimizedImage
              src={aboutPreview?.imageUrl || aboutSettings?.heroImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80'}
              alt={aboutPreview?.imageAlt || "Team Infinity Bangladesh"}
              cropPosition={aboutPreview?.imageCrop || 'center center'}
              aspectRatio="4/3"
              sizes="(max-width: 1024px) 100vw, 600px"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Caption Overlay - Center aligned for photographic symmetry */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex items-end justify-center text-center">
              <div className="text-white space-y-1 flex flex-col items-center max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                  <span>{tText(aboutPreview?.imageBadgeTitle) || (isBn ? 'টিম ইনফিনিটি — মানবতার জন্য একতাবদ্ধ' : 'TEAM INFINITY — UNITED FOR HUMANITY')}</span>
                </div>
                <p className="text-[11px] sm:text-sm font-medium text-slate-200 leading-snug line-clamp-1 sm:line-clamp-none text-center">
                  {tText(aboutPreview?.imageBadgeSubtitle) || (isBn ? '২০১৫ সাল থেকে সুবিধাবঞ্চিত মানুষের পাশে' : 'Serving underserved communities since 2015')}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
