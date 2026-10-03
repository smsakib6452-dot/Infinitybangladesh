import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { StaggerGroup, StaggerItem } from '../components/motion/StaggerGroup';
import { Handshake, Globe, ExternalLink, ShieldCheck, Building2, GraduationCap, Users2, Sparkles, Send } from 'lucide-react';
import { Toast } from '../components/Toast';

export const PartnersPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { partners } = useData();
  const { navigate } = useRouter();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [partnerOrgName, setPartnerOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partnershipType, setPartnershipType] = useState('Institutional');
  const [proposalDetails, setProposalDetails] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const categories = [
    { key: 'All', labelEn: 'All Collaborators', labelBn: 'সকল পার্টনার' },
    { key: 'Institutional', labelEn: 'Institutional & NGOs', labelBn: 'প্রাতিষ্ঠানিক ও এনজিও' },
    { key: 'Academic', labelEn: 'Academic & Campus Clubs', labelBn: 'শিক্ষা প্রতিষ্ঠান ও ক্যাম্পাস ক্লাব' },
    { key: 'Community Alliance', labelEn: 'Community Alliances', labelBn: 'সামাজিক জোট' },
    { key: 'Resource Partner', labelEn: 'Resource Partners', labelBn: 'রিসোর্স পার্টনার' },
  ];

  const filteredPartners = activeCategory === 'All'
    ? partners
    : partners.filter((p) => p.type === activeCategory);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(
      isBn
        ? 'আপনার পার্টনারশিপ প্রস্তাবনাটি সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি যোগাযোগ করবেন।'
        : 'Partnership inquiry submitted successfully. Our team will review your proposal.'
    );
    setShowToast(true);
    setPartnerOrgName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setProposalDetails('');
  };

  const getPartnerIcon = (type: string) => {
    switch (type) {
      case 'Academic':
        return GraduationCap;
      case 'Community Alliance':
        return Users2;
      default:
        return Building2;
    }
  };

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header */}
        <ScrollReveal effect="fade-up" className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F3EF] border border-[#C2E2D7] rounded-full text-[#00523C] text-xs font-extrabold uppercase tracking-wider">
            <Handshake className="w-3.5 h-3.5" />
            <span>{isBn ? 'সহযোগী ও অংশীদারিত্ব' : 'Partners & Institutional Alliances'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
            {isBn ? 'ঐক্যের শক্তিতে মানবিক পরিবর্তন' : 'Collaborating for Greater Humanitarian Impact'}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {isBn
              ? 'টিম ইনফিনিটি বিশ্বাস করে পারস্পরিক সহযোগিতা ও তরুণদের ঐক্যবদ্ধ প্রচেষ্টায় যেকোনো কঠিন মানবিক সংকট মোকাবিলা সম্ভব।'
              : 'Team Infinity partners with youth clubs, academic institutions, and verified social organizations across Bangladesh to amplify community service.'}
          </p>
        </ScrollReveal>

        {/* Category Filters */}
        <ScrollReveal effect="fade-up" delay={0.1} className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-[#006A4E] text-white shadow-warm-sm'
                  : 'bg-white text-slate-700 border border-[#EAE3D9] hover:bg-[#FAF7F2]'
              }`}
            >
              {isBn ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </ScrollReveal>

        {/* Partners Grid */}
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredPartners.map((partner) => {
            const Icon = getPartnerIcon(partner.type);
            return (
              <StaggerItem
                key={partner.id}
                className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm hover:shadow-warm-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group w-full h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] text-[#006A4E] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-[#006A4E] bg-[#E6F3EF] px-3 py-0.5 rounded-full border border-[#C2E2D7]">
                      {partner.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#006A4E] transition-colors font-display">
                      {typeof partner.name === 'string' ? partner.name : tText(partner.name as any)}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>{isBn ? 'সহযোগিতা বর্ষ:' : 'Alliance Since:'}</span>
                      <strong className="text-slate-700">{partner.since || partner.partnershipYear}</strong>
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {tText(partner.description)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  {partner.website && partner.website !== '#' ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-[#006A4E] hover:underline"
                    >
                      <span>{isBn ? 'ওয়েবসাইট দেখুন' : 'Visit Website'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">{isBn ? 'স্থানীয় সহযোগী সংস্থা' : 'Local Community Partner'}</span>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Partnership Proposal Form */}
        <ScrollReveal effect="fade-up" delay={0.2} className="bg-white rounded-3xl border border-[#EAE3D9] p-8 sm:p-12 shadow-warm-md max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {isBn ? 'আমাদের সাথে যৌথভাবে কাজ করতে চান?' : 'Interested in Partnering With Us?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {isBn
                ? 'শিক্ষা প্রতিষ্ঠান, স্বেচ্ছাসেবী ক্লাব বা করপোরেট সিএসআর উদ্যোগে আমাদের সাথে যুক্ত হতে নিচের তথ্যগুলো পূরণ করুন।'
                : 'Send an institutional collaboration inquiry to align our grassroots campaigns with your community vision.'}
            </p>
          </div>

          <form onSubmit={handleInquirySubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'সংস্থার নাম *' : 'Organization Name *'}</label>
                <input
                  type="text"
                  required
                  value={partnerOrgName}
                  onChange={(e) => setPartnerOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'যোগাযোগকারী ব্যক্তি *' : 'Contact Person *'}</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'অফিসিয়াল ইমেইল *' : 'Official Email *'}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'ফোন নম্বর *' : 'Phone Number *'}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'প্রস্তাবনার বিবরণ *' : 'Collaboration Proposal *'}</label>
              <textarea
                rows={4}
                required
                value={proposalDetails}
                onChange={(e) => setProposalDetails(e.target.value)}
                placeholder={isBn ? 'কীভাবে একসাথে কাজ করতে চান সংক্ষেপে লিখুন...' : 'Briefly describe how you envision partnering with Team Infinity...'}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs sm:text-sm shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>{isBn ? 'পার্টনারশিপ প্রস্তাবনা পাঠান' : 'Submit Partnership Inquiry'}</span>
            </button>
          </form>
        </ScrollReveal>

        {/* Toast */}
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};
