import React from 'react';
import { NewsArticle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link } from '../context/RouterContext';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { getAssetUrl } from '../lib/utils/assetHelper';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { isBn, tText } = useLanguage();

  return (
    <article className="group bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-lg motion-card-hover transition-all duration-300 flex flex-col justify-between w-full h-full">
      <Link to="news/detail" slug={article.slug} className="block relative aspect-16/9 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={getAssetUrl(article.imageUrl)}
          alt={tText(article.title)}
          className="w-full h-full object-cover motion-img-zoom"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#006A4E] text-white backdrop-blur-xs shadow-xs">
          {article.category}
        </span>
      </Link>

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
              {article.date}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <User className="w-3.5 h-3.5 text-[#006A4E]" />
              <span className="truncate">{article.author}</span>
            </span>
          </div>

          <Link to="news/detail" slug={article.slug} className="block group/title">
            <h3 className="text-lg font-bold text-slate-900 group-hover/title:text-[#006A4E] transition-colors line-clamp-2 font-display leading-snug">
              {tText(article.title)}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {tText(article.excerpt)}
          </p>
        </div>

        {/* Tags and Action - Pinned uniformly */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[60%]">
            <Tag className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{article.tags.join(', ')}</span>
          </div>

          <Link
            to="news/detail"
            slug={article.slug}
            className="text-xs sm:text-sm font-bold text-[#006A4E] hover:text-[#00523C] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isBn ? 'পড়ুন' : 'Read Full Story'}</span>
            <ArrowRight className="w-4 h-4 group-arrow-hover" />
          </Link>
        </div>
      </div>
    </article>
  );
};

