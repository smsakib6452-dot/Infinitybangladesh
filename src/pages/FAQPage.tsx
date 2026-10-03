import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Link } from '../context/RouterContext';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { ChevronDown, HelpCircle, Search, Phone, ArrowRight } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { faqs } = useData();

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activeFaqs = useMemo(() => {
    return faqs
      .filter(f => f.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [faqs]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    activeFaqs.forEach(f => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [activeFaqs]);

  const filteredFaqs = useMemo(() => {
    return activeFaqs.filter(faq => {
      const q = tText(faq.question).toLowerCase();
      const a = tText(faq.answer).toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || q.includes(query) || a.includes(query);
      const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [activeFaqs, searchQuery, selectedCategory, tText]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'সাধারণ প্রশ্নোত্তর' : 'Knowledge Base'}
          title={isBn ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}
          subtitle={
            isBn
              ? 'সংগঠনের পরিচালনা, অনুদান, স্বচ্ছতা ও স্বেচ্ছাসেবা সংক্রান্ত গুরুত্বপূর্ণ তথ্যাবলী।'
              : 'Find answers to common questions about our mission, transparency, volunteering, and donation stewardship.'
          }
        />
      </ScrollReveal>

      {/* Search & Category Filter */}
      <ScrollReveal effect="fade-up" delay={0.1} className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'প্রশ্ন বা উত্তর দিয়ে খুঁজুন...' : 'Search questions or keywords...'}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EAE3D9] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] shadow-warm-xs text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#006A4E] text-white shadow-warm-xs'
                    : 'bg-white border border-[#EAE3D9] text-slate-600 hover:bg-[#FAF7F2]'
                }`}
              >
                {cat === 'All' ? (isBn ? 'সকল প্রশ্ন' : 'All Topics') : cat}
              </button>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* Accordion list */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE3D9] space-y-3 p-6 shadow-warm-xs">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">
            {isBn ? 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো প্রশ্ন পাওয়া যায়নি।' : 'No questions found matching your search.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="text-xs font-bold text-[#006A4E] hover:underline cursor-pointer"
          >
            {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <StaggerGroup className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem
                key={faq.id || index}
                className="bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#006A4E] transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg flex items-center gap-3 font-display">
                    <HelpCircle className="w-5 h-5 text-[#006A4E] shrink-0" />
                    <span>{tText(faq.question)}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#006A4E]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#FAF7F2]">
                    {tText(faq.answer)}
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      {/* Support / Helpdesk Box */}
      <ScrollReveal effect="fade-up" delay={0.2}>
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#006A4E]/5 via-[#FAF7F2] to-white rounded-3xl border border-[#EAE3D9] shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {isBn ? 'আপনার প্রশ্নের উত্তর খুঁজে পাননি?' : 'Still Have Questions?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {isBn
                ? 'আমাদের সার্বক্ষণিক হেল্পলাইন ও সাপোর্ট টিম আপনার যেকোনো জিজ্ঞাসায় সহযোগিতা করতে প্রস্তুত।'
                : 'Our coordination team is here 24/7 to provide information, verify relief drives, or assist you.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:01886224424"
              className="px-5 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold transition-all shadow-warm-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>01886-224424</span>
            </a>

            <Link
              to="contact"
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-[#EAE3D9] text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isBn ? 'যোগাযোগ ফর্ম' : 'Contact Us'}</span>
              <ArrowRight className="w-4 h-4 text-[#006A4E]" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
