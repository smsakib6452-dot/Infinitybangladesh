import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { NewsCard } from '../components/NewsCard';
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Tag,
  BookOpen
} from 'lucide-react';

export const NewsPage: React.FC = () => {
  const { isBn } = useLanguage();
  const { news } = useData();

  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Campaign Updates', 'Announcements', 'Relief Drives', 'Press Release'];

  const filteredNews = news.filter(n => {
    if (categoryFilter === 'All') return true;
    return n.category === categoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-14">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'সংবাদ ও হালনাগাদ' : 'Press & Updates'}
          title={isBn ? 'সংবাদ ও বিজ্ঞপ্তি' : 'Latest News & Announcements'}
          subtitle={
            isBn
              ? 'টিম ইনফিনিটির মাঠপর্যায়ের কার্যক্রম, নতুন উদ্যোগ ও প্রাতিষ্ঠানিক খবরাখবর।'
              : 'Read the official stories, media releases, and operational updates from Infinity Bangladesh.'
          }
        />
      </ScrollReveal>

      {/* Categories */}
      <ScrollReveal effect="fade-up" delay={0.1} className="flex flex-wrap items-center justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#006A4E] text-white shadow-warm-sm'
                : 'bg-white border border-[#EAE3D9] text-slate-700 hover:bg-[#FAF7F2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </ScrollReveal>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16 p-6 bg-white rounded-3xl border border-[#EAE3D9] space-y-3 shadow-warm-xs">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">
            {isBn ? 'এই ক্যাটাগরিতে কোনো সংবাদ নেই।' : 'No news articles found for this category.'}
          </p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredNews.map(article => (
            <StaggerItem key={article.id} className="h-full flex">
              <NewsCard article={article} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
};

export const NewsDetailPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { currentSlug } = useRouter();
  const { news } = useData();

  const article = news.find(n => n.slug === currentSlug) || news[0];

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 font-display">
          {isBn ? 'সংবাদ পাওয়া যায়নি' : 'Article Not Found'}
        </h2>
        <Link
          to="news"
          className="px-5 py-2.5 bg-[#006A4E] text-white rounded-2xl text-sm font-bold cursor-pointer inline-block"
        >
          {isBn ? 'সকল সংবাদে ফিরে যান' : 'Back to News'}
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tText(article.title),
        text: tText(article.excerpt),
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isBn ? 'লিঙ্কটি কপি করা হয়েছে!' : 'Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Back button and share */}
      <div className="flex items-center justify-between">
        <Link
          to="news"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#006A4E] hover:text-[#00523C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'সকল সংবাদে ফিরে যান' : 'Back to News'}</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-700 text-xs font-bold border border-[#EAE3D9] transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{isBn ? 'শেয়ার' : 'Share'}</span>
        </button>
      </div>

      {/* Header */}
      <ScrollReveal effect="fade-up" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{article.date}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span>{article.author}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          {tText(article.title)}
        </h1>
      </ScrollReveal>

      {/* Featured Image */}
      <ScrollReveal effect="fade-up" delay={0.1}>
        <div className="rounded-[2.5rem] overflow-hidden shadow-warm-xl border-4 border-white aspect-16/9 bg-slate-100">
          <img
            src={article.imageUrl}
            alt={tText(article.title)}
            className="w-full h-full object-cover"
          />
        </div>
      </ScrollReveal>

      {/* Content */}
      <ScrollReveal effect="fade-up" delay={0.2} className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-10 space-y-6 shadow-warm-sm">
        <p className="text-base sm:text-lg text-slate-900 font-semibold leading-relaxed border-b border-slate-100 pb-4">
          {tText(article.excerpt)}
        </p>

        <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
          <p>{tText(article.content)}</p>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {article.tags.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 font-medium">
                #{t}
              </span>
            ))}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
};
