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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-[2.5rem] border border-[#EAE3D9] p-6 sm:p-10 lg:p-12 shadow-warm-md">
        <ScrollReveal effect="slide-right" className="lg:col-span-6 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6F3EF] border border-[#C2E2D7] text-[#00523C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{tText(aboutPreview?.eyebrow) || tText(defaultEyebrow)}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display leading-tight">
            {tText(aboutPreview?.titleMain) || tText(defaultTitleMain)}{' '}
            <span className="text-[#006A4E]">{tText(aboutPreview?.titleHighlight) || tText(defaultTitleHighlight)}</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {tText(aboutPreview?.description) || tText(defaultDesc)}
          </p>

          {/* Mission & Vision Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9]/80">
              <Target className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{tText(aboutPreview?.missionHeading) || (isBn ? 'আমাদের লক্ষ্য' : 'Our Mission')}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">{tText(aboutPreview?.missionText) || tText(aboutSettings?.mission)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9]/80">
              <Eye className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{tText(aboutPreview?.visionHeading) || (isBn ? 'আমাদের দর্শন' : 'Our Vision')}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">{tText(aboutPreview?.visionText) || tText(aboutSettings?.vision)}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              to={aboutPreview?.ctaUrl || 'about/story'}
              className="px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs sm:text-sm font-bold shadow-warm-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{tText(aboutPreview?.ctaText) || (isBn ? 'আমাদের সম্পূর্ণ যাত্রা পড়ুন' : 'Read Our Full Story')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={aboutPreview?.secondaryCtaUrl || "about/executive-committee"}
              className="px-5 py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-xs sm:text-sm font-bold border border-[#D8CFC4] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#006A4E]" />
              <span>{tText(aboutPreview?.secondaryCtaText) || (isBn ? 'নেতৃত্ব কমিটি' : 'Executive Team')}</span>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden shadow-warm-lg border-2 border-white aspect-4/3 bg-slate-900 relative">
            <OptimizedImage
              src={aboutPreview?.imageUrl || aboutSettings?.heroImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80'}
              alt={aboutPreview?.imageAlt || "Team Infinity Bangladesh"}
              cropPosition={aboutPreview?.imageCrop || 'center center'}
              aspectRatio="4/3"
              sizes="(max-width: 1024px) 100vw, 600px"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  {tText(aboutPreview?.imageBadgeTitle) || (isBn ? 'টিম ইনফিনিটি — মানবতার জন্য একতাবদ্ধ' : 'TEAM INFINITY — UNITED FOR HUMANITY')}
                </p>
                <p className="text-sm font-medium text-slate-200">
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
