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
      <div className="bg-gradient-to-br from-[#FAF7F2] via-white to-[#F6F1EA] rounded-3xl sm:rounded-[2.5rem] border border-[#EAE3D9] p-5 sm:p-10 lg:p-12 text-center space-y-4 sm:space-y-6 shadow-warm-lg hover:shadow-warm-xl transition-shadow duration-300">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-[#E6F3EF] text-[#006A4E] border border-[#C2E2D7]/70 flex items-center justify-center mx-auto shadow-xs">
          <HandHeart className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        <div className="max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
          <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-display leading-snug sm:leading-tight">
            {tText(supportBanner?.title) || (isBn ? 'সহযোগিতার হাত বাড়িয়ে দিন' : 'Stand With Infinity Bangladesh')}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {tText(supportBanner?.subtitle) || (isBn
              ? 'আপনার আর্থিক সহযোগিতা সরাসরি সুবিধাবঞ্চিত শিশুদের নতুন পোশাক, রমজানের খাদ্য এবং শীতের কম্বল হিসেবে রূপান্তরিত হয়।'
              : 'Your contributions directly fund verified clothes, nourishment, and winter protection for those who need it most.')}
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 pt-1 sm:pt-2">
          <Link
            to={supportBanner?.primaryButtonUrl || supportBanner?.primaryCtaUrl || 'donate'}
            className="flex-1 sm:flex-initial px-3.5 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-[11px] sm:text-sm shadow-warm-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transform hover:-translate-y-0.5 text-center"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
            <span className="truncate">{tText(supportBanner?.primaryButtonText) || (isBn ? 'অনলাইন অনুদান' : 'Online Donation')}</span>
          </Link>

          <Link
            to={supportBanner?.secondaryButtonUrl || supportBanner?.secondaryCtaUrl || 'transparency'}
            className="flex-1 sm:flex-initial px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-[#FAF7F2] text-slate-800 font-bold text-[11px] sm:text-sm border border-[#EAE3D9] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006A4E] shrink-0" />
            <span className="truncate">{tText(supportBanner?.secondaryButtonText) || (isBn ? 'অডিট রিপোর্ট' : 'Audit Logs')}</span>
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
};
