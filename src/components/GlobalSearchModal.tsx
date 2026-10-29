import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Search,
  X,
  Flag,
  BookOpen,
  Heart,
  FileText,
  Calendar,
  ArrowRight,
  Droplet
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useRouter();
  const { isBn, tText } = useLanguage();
  const { campaigns, programs, news, stories, events, reports, bloodDonors } = useData();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Handle physical Escape key press to dismiss modal (WCAG 2.2 AA)
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search through all entities
  const matchingCampaigns = cleanQuery
    ? campaigns.filter(
        c =>
          c.title.en.toLowerCase().includes(cleanQuery) ||
          c.title.bn.toLowerCase().includes(cleanQuery) ||
          c.description.en.toLowerCase().includes(cleanQuery) ||
          c.description.bn.toLowerCase().includes(cleanQuery) ||
          c.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingPrograms = cleanQuery
    ? programs.filter(
        p =>
          p.title.en.toLowerCase().includes(cleanQuery) ||
          p.title.bn.toLowerCase().includes(cleanQuery) ||
          p.shortDescription.en.toLowerCase().includes(cleanQuery) ||
          p.shortDescription.bn.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingStories = cleanQuery
    ? stories.filter(
        s =>
          s.title.en.toLowerCase().includes(cleanQuery) ||
          s.title.bn.toLowerCase().includes(cleanQuery) ||
          s.story.en.toLowerCase().includes(cleanQuery) ||
          s.story.bn.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingNews = cleanQuery
    ? news.filter(
        n =>
          n.title.en.toLowerCase().includes(cleanQuery) ||
          n.title.bn.toLowerCase().includes(cleanQuery) ||
          n.excerpt.en.toLowerCase().includes(cleanQuery) ||
          n.excerpt.bn.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingEvents = cleanQuery
    ? events.filter(
        e =>
          e.title.en.toLowerCase().includes(cleanQuery) ||
          e.title.bn.toLowerCase().includes(cleanQuery) ||
          e.description.en.toLowerCase().includes(cleanQuery) ||
          e.description.bn.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingReports = cleanQuery
    ? reports.filter(
        r =>
          r.title.en.toLowerCase().includes(cleanQuery) ||
          r.title.bn.toLowerCase().includes(cleanQuery) ||
          r.description.en.toLowerCase().includes(cleanQuery) ||
          r.type.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingDonors = cleanQuery
    ? bloodDonors.filter(
        d =>
          d.approvalStatus === 'APPROVED' &&
          (d.fullName.toLowerCase().includes(cleanQuery) ||
            d.bloodGroup.toLowerCase().includes(cleanQuery) ||
            d.district.toLowerCase().includes(cleanQuery) ||
            d.upazila.toLowerCase().includes(cleanQuery) ||
            d.area.toLowerCase().includes(cleanQuery) ||
            d.orgCategory.toLowerCase().includes(cleanQuery))
      )
    : [];

  const totalResults =
    matchingCampaigns.length +
    matchingPrograms.length +
    matchingStories.length +
    matchingNews.length +
    matchingEvents.length +
    matchingReports.length +
    matchingDonors.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      onClick={() => setIsSearchOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={isBn ? 'ইনফিনিটি গ্লোবাল অনুসন্ধান' : 'Infinity Global Search'}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#EAE3D9] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-[#FAF7F2]">
          <Search className="w-5 h-5 text-[#006A4E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              isBn
                ? 'ক্যাম্পেইন, প্রোগ্রাম, সংবাদ, গল্প কিংবা রিপোর্ট খুঁজুন...'
                : 'Search campaigns, programs, news, stories, reports...'
            }
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={isBn ? 'অনুসন্ধান মুছুন' : 'Clear search'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
            aria-label={isBn ? 'বন্ধ করুন' : 'Close search dialog'}
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
          {!cleanQuery && (
            <div className="py-8 text-center text-slate-500 text-sm space-y-2">
              <p className="font-bold text-slate-800">
                {isBn ? 'ইনফিনিটি বাংলাদেশ-এর তথ্যাবলী খুঁজুন' : 'Search Infinity Bangladesh Knowledge Base'}
              </p>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'যেমন: সুবিধাবঞ্চিতদের সাথে ঈদ আনন্দ, রমজান ফুড প্যাক, শীতবস্ত্র, স্বেচ্ছাসেবী, অডিট...'
                  : 'Try typing "Eid", "Ramadan", "Winter", "Volunteer", "Audit", "Child Welfare"...'}
              </p>
            </div>
          )}

          {cleanQuery && totalResults === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm space-y-2">
              <p className="font-semibold text-slate-700">
                {isBn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found for this search'}
              </p>
              <p className="text-xs text-slate-400">
                {isBn ? 'অনুগ্রহ করে ভিন্ন কোনো শব্দ দিয়ে চেষ্টা করুন।' : 'Try using different keywords or check spelling.'}
              </p>
            </div>
          )}

          {/* Campaigns */}
          {matchingCampaigns.length > 0 && (
            <div className="pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5 mb-2">
                <Flag className="w-3.5 h-3.5" />
                {isBn ? 'ক্যাম্পেইনসমূহ' : 'Campaigns'} ({matchingCampaigns.length})
              </span>
              <div className="space-y-1.5">
                {matchingCampaigns.map(c => (
                  <Link
                    key={c.id}
                    to="campaigns/detail"
                    slug={c.slug}
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-[#E6F3EF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                        {tText(c.title)}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tText(c.description)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006A4E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Programs */}
          {matchingPrograms.length > 0 && (
            <div className="pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                {isBn ? 'কার্যক্রম / প্রোগ্রাম' : 'Programs'} ({matchingPrograms.length})
              </span>
              <div className="space-y-1.5">
                {matchingPrograms.map(p => (
                  <Link
                    key={p.id}
                    to="programs/detail"
                    slug={p.slug}
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-[#E6F3EF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                        {tText(p.title)}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tText(p.shortDescription)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006A4E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Blood Donors */}
          {matchingDonors.length > 0 && (
            <div className="pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5 mb-2">
                <Droplet className="w-3.5 h-3.5 text-rose-600 fill-current" />
                {isBn ? 'রক্তদাতা' : 'Blood Donors'} ({matchingDonors.length})
              </span>
              <div className="space-y-1.5">
                {matchingDonors.map(d => (
                  <Link
                    key={d.id}
                    to="blood-donation/find-donor"
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-[#E6F3EF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E] flex items-center gap-2">
                        <span>{d.fullName}</span>
                        <span className="px-2 py-0.2 rounded-md bg-rose-600 text-white text-[10px] font-black">{d.bloodGroup}</span>
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{d.area}, {d.upazila}, {d.district} &bull; {d.orgCategory}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006A4E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Stories */}
          {matchingStories.length > 0 && (
            <div className="pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                {isBn ? 'মানবিক গল্প' : 'Impact Stories'} ({matchingStories.length})
              </span>
              <div className="space-y-1.5">
                {matchingStories.map(s => (
                  <Link
                    key={s.id}
                    to="stories/detail"
                    slug={s.slug}
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-[#E6F3EF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                        {tText(s.title)}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tText(s.story)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006A4E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {matchingNews.length > 0 && (
            <div className="pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5" />
                {isBn ? 'সংবাদ' : 'News'} ({matchingNews.length})
              </span>
              <div className="space-y-1.5">
                {matchingNews.map(n => (
                  <Link
                    key={n.id}
                    to="news/detail"
                    slug={n.slug}
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-[#E6F3EF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                        {tText(n.title)}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tText(n.excerpt)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006A4E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {matchingEvents.length > 0 && (
            <div className="pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {isBn ? 'ইভেন্ট' : 'Events'} ({matchingEvents.length})
              </span>
              <div className="space-y-1.5">
                {matchingEvents.map(e => (
                  <Link
                    key={e.id}
                    to="events/detail"
                    slug={e.slug}
                    onClick={() => setIsSearchOpen(false)}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-[#E6F3EF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E]">
                        {tText(e.title)}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tText(e.description)}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006A4E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
