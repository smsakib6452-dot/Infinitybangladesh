import React from 'react';
import { Link } from '../../context/RouterContext';
import { ScrollReveal } from '../motion/ScrollReveal';
import { HandHeart, Heart, ShieldCheck } from 'lucide-react';

interface SupportSectionProps {
  supportBanner: any;
  isBn: boolean;
  tText: (value: any) => string;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  supportBanner,
  isBn,
  tText
}) => {
  return (
    <ScrollReveal effect="fade-up" key="support" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-[#FAF7F2] to-white rounded-[2.5rem] border border-[#EAE3D9] p-8 sm:p-12 text-center space-y-6 shadow-warm-md">
        <div className="w-14 h-14 rounded-3xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center mx-auto shadow-warm-xs">
          <HandHeart className="w-7 h-7" />
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {tText(supportBanner?.title) || (isBn ? 'সহযোগিতার হাত বাড়িয়ে দিন' : 'Stand With Infinity Bangladesh')}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {tText(supportBanner?.subtitle) || (isBn
              ? 'আপনার আর্থিক সহযোগিতা সরাসরি সুবিধাবঞ্চিত শিশুদের নতুন পোশাক, রমজানের খাদ্য এবং শীতের কম্বল হিসেবে রূপান্তরিত হয়।'
              : 'Your contributions directly fund verified clothes, nourishment, and winter protection for those who need it most.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to={supportBanner?.primaryButtonUrl || supportBanner?.primaryCtaUrl || 'donate'}
            className="px-8 py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs sm:text-sm shadow-warm-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>{tText(supportBanner?.primaryButtonText || supportBanner?.primaryCtaText) || (isBn ? 'অনলাইন অনুদান প্রদান' : 'Donate to Infinity Bangladesh')}</span>
          </Link>

          <Link
            to={supportBanner?.secondaryButtonUrl || supportBanner?.secondaryCtaUrl || 'transparency'}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 font-bold text-xs sm:text-sm border border-[#EAE3D9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
            <span>{tText(supportBanner?.secondaryButtonText || supportBanner?.secondaryCtaText) || (isBn ? 'স্বচ্ছতা ও অডিট রিপোর্ট' : 'Audit & Expense Logs')}</span>
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
};
