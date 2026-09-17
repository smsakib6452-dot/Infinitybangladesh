import React from 'react';
import { PressCoverage } from '../../types';
import { Link } from '../../context/RouterContext';
import { SectionHeading } from '../SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerGroup';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface PressSectionProps {
  pressCoverages: PressCoverage[];
  pressSection: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const PressSection: React.FC<PressSectionProps> = ({
  pressCoverages,
  pressSection,
  isBn,
  tText
}) => {
  const featuredPress = pressCoverages.filter(p => p.status === 'published').slice(0, 3);
  if (featuredPress.length === 0) return null;

  return (
    <section key="press" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeading
          badge={tText(pressSection?.badge) || (isBn ? 'গণমাধ্যমে আমরা' : 'In The News')}
          title={tText(pressSection?.title) || (isBn ? 'জাতীয় গণমাধ্যমে প্রকাশিত প্রতিবেদন' : 'Featured Press & Media Coverage')}
          subtitle={tText(pressSection?.subtitle) || (isBn ? 'ইনফিনিটি বাংলাদেশের মানবিক ত্রাণ বিতরণ ও কার্যক্রম নিয়ে প্রকাশিত খবরের একাংশ।' : 'Independent news articles and TV features covering Team Infinity humanitarian drives.')}
        />

        <Link
          to={pressSection?.viewAllUrl || "media-coverage"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] hover:border-[#006A4E] text-[#006A4E] text-xs font-bold shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer group shrink-0"
        >
          <span>{tText(pressSection?.viewAllText) || (isBn ? 'সকল সংবাদ দেখুন' : 'View All Press Coverage')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <StaggerGroup className="flex flex-wrap justify-center gap-6">
        {featuredPress.map((item) => (
          <StaggerItem
            key={item.id}
            className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm bg-white rounded-3xl border border-[#EAE3D9] p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-extrabold text-[#006A4E] uppercase tracking-wider text-[11px]">
                  {item.outletName}
                </span>
                <span className="text-[11px] text-slate-400">{item.publishedDate}</span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 group-hover:text-[#006A4E] transition-colors leading-snug">
                {isBn ? item.title.bn : item.title.en}
              </h4>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {isBn ? item.excerpt.bn : item.excerpt.en}
              </p>
            </div>

            <a
              href={item.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006A4E] hover:text-[#00523C] pt-2 border-t border-slate-100"
            >
              <span>{tText(pressSection?.readArticleText) || (isBn ? 'প্রতিবেদন পড়ুন' : 'Read Article')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
};
