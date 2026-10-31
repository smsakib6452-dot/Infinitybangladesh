import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Lock, HeartHandshake, UserCheck, FileText, CheckCircle2, Trash2, Cookie, Mail } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { isBn } = useLanguage();

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F3EF] border border-[#C2E2D7] rounded-full text-[#00523C] text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{isBn ? 'গোপনীয়তা ও তথ্য সুরক্ষা নীতিমালা' : 'Privacy & Data Protection Policy'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            {isBn ? 'স্বচ্ছতা ও মানবিক মর্যাদায় আমাদের প্রতিশ্রুতি' : 'Privacy, Dignity & Transparency'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isBn ? 'সর্বশেষ হালনাগাদ: ২০২৬ | ইনফিনিটি বাংলাদেশ (প্রতিষ্ঠিত ২০১৫, হাটহাজারী)' : 'Last Updated: 2026 | Infinity Bangladesh (Established 2015, Hathazari)'}
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EAE3D9] shadow-warm-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              {isBn ? 'মানবিক মর্যাদা ও ফটোগ্রাফি' : 'Dignity & Media Consent'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'সুবিধাবঞ্চিত বা অসহায় ব্যক্তিদের অসম্মানজনক কোনো ছবি তোলা বা প্রকাশ করা কঠোরভাবে নিষিদ্ধ।'
                : 'Beneficiaries are never photographed in degrading or patronizing conditions. Consent is paramount.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#EAE3D9] shadow-warm-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              {isBn ? 'স্বেচ্ছাসেবক তথ্য সুরক্ষা' : 'Volunteer Data Security'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'স্বেচ্ছাসেবকদের ব্যক্তিগত তথ্য কেবলমাত্র প্রাতিষ্ঠানিক সমন্বয়ে ব্যবহৃত হয়।'
                : 'Volunteer application data is stored securely and never shared with third parties.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#EAE3D9] shadow-warm-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              {isBn ? 'দাতার আর্থিক নিরাপত্তা' : 'Donor Privacy & Audit'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'অনুদানের তথ্য হিসাব নিরীক্ষার স্বার্থে সংরক্ষিত থাকলেও সংবেদনশীল আর্থিক তথ্য কখনো প্রকাশ করা হয় না।'
                : 'Donation transaction records are retained solely for public auditing without compromising sensitive identity.'}
            </p>
          </div>
        </div>

        {/* Detailed Policy Content */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#EAE3D9] shadow-warm-sm space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display">
              <FileText className="w-5 h-5 text-[#006A4E]" />
              <span>{isBn ? '১. ভূমিকা ও পরিচয়' : '1. Overview & Organizational Commitment'}</span>
            </h2>
            <p>
              {isBn
                ? 'ইনফিনিটি বাংলাদেশ (টিম ইনফিনিটি — United for Humanity) ২০১৫ সালে প্রতিষ্ঠিত একটি যুব স্বেচ্ছাসেবী সামাজিক সংগঠন। আমরা আমাদের সমর্থক, স্বেচ্ছাসেবী, দাতা এবং সেবাগ্রহীতা সকলের গোপনীয়তা ও ব্যক্তিগত তথ্যের নিরাপত্তাকে সর্বোচ্চ গুরুত্ব দিই।'
                : 'Infinity Bangladesh (operating under the team identity "Team Infinity" and tagline "United for Humanity", established in Hathazari in 2015) is committed to protecting the privacy, dignity, and personal data of our volunteers, supporters, donors, and community beneficiaries.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display">
              <CheckCircle2 className="w-5 h-5 text-[#006A4E]" />
              <span>{isBn ? '২. কোন তথ্য সংগ্রহ করা হয়' : '2. Information We Collect'}</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>
                <strong>{isBn ? 'স্বেচ্ছাসেবী নিবন্ধন:' : 'Volunteer Applications:'}</strong>{' '}
                {isBn ? 'নাম, ইমেইল, ফোন নম্বর, জেলা, উপজেলা, বয়স, পেশা ও রক্তগ্রুপ।' : 'Full name, email address, phone number, district, upazila, age, occupation, blood group, and skills.'}
              </li>
              <li>
                <strong>{isBn ? 'অনুদান রেকর্ড:' : 'Donation Logs:'}</strong>{' '}
                {isBn ? 'দাতার নাম (বা বেনামী অনুরোধ), ইমেইল, অনুদানের পরিমাণ, লেনদেন বা রেফারেন্স আইডি।' : 'Donor name (or anonymous request), contact email/phone, contributed amount, and transaction reference ID.'}
              </li>
              <li>
                <strong>{isBn ? 'যোগাযোগ বার্তা:' : 'Contact Inquiries:'}</strong>{' '}
                {isBn ? 'আপনার প্রেরিত বার্তা, নাম, বিষয় এবং যোগাযোগের মাধ্যম।' : 'Inquiry subject, sender name, message contents, and email address.'}
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display">
              <Trash2 className="w-5 h-5 text-[#006A4E]" />
              <span>{isBn ? '৩. তথ্য সংশোধন ও স্থায়ীভাবে মুছে ফেলার অধিকার (Right to be Forgotten)' : '3. Data Rectification & Permanent Deletion Rights'}</span>
            </h2>
            <p>
              {isBn
                ? 'যেকোনো নিবন্ধিত রক্তদাতা, স্বেচ্ছাসেবী বা সেবাগ্রহীতা যেকোনো সময় তাদের সংরক্ষিত প্রোফাইল বা তথ্য সম্পূর্ণভাবে হালনাগাদ অথবা স্থায়ীভাবে মুছে ফেলার পূর্ণ অধিকার রাখেন। আপনার তথ্য মুছে ফেলতে চাইলে আমাদের জরুরি হেল্পলাইন (+880 1839-008339)-এ কল করে অথবা smsakib6452@gmail.com ঠিকানায় "Data Removal Request" উল্লেখ করে ইমেইল পাঠালে অনতিবিলম্বে তা ডাটাবেজ থেকে অপসারণ করা হবে।'
                : 'All registered blood donors, volunteers, and supporters possess the absolute right to request rectification, export, or permanent deletion of their personal records at any time. To exercise your right to be forgotten, please contact our helpline at +880 1839-008339 or email smsakib6452@gmail.com with the subject "Data Removal Request". Requests are honored promptly.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display">
              <Cookie className="w-5 h-5 text-[#006A4E]" />
              <span>{isBn ? '৪. জিরো-ট্র্যাকিং কুকি ও লোকালস্টোরেজ নীতিমালা' : '4. Zero-Tracking Cookies & Local Storage Disclosure'}</span>
            </h2>
            <p>
              {isBn
                ? 'ইনফিনিটি বাংলাদেশ কোনো বাণিজ্যিক ট্র্যাকিং কুকি, রি-টার্গেটিং বিজ্ঞাপন পিক্সেল, বা তথ্য ব্রোকার ব্যবহার করে না। আমাদের ওয়েবসাইট কেবলমাত্র আপনার ব্রাউজারের লোকালস্টোরেজ (LocalStorage) ব্যবহার করে ভাষা পছন্দ (বাংলা/ইংরেজি) এবং অফলাইন ক্যাশ সংরক্ষণের জন্য। আপনার ব্যক্তিগত ডেটা কোনো বিজ্ঞাপনী নেটওয়ার্কের কাছে বিক্রি বা শেয়ার করা হয় না।'
                : 'Infinity Bangladesh operates under strict privacy-first ethics. We do NOT deploy third-party advertising cookies, behavioural cross-site tracking pixels, or commercial data brokerage scripts. Client storage (LocalStorage/IndexedDB) is utilized strictly for localized language preferences (Bengali/English) and offline application caching.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display">
              <Mail className="w-5 h-5 text-[#006A4E]" />
              <span>{isBn ? '৫. অফিসিয়াল ডাটা কন্ট্রোলার ও যোগাযোগ' : '5. Data Controller & Official Grievance Contact'}</span>
            </h2>
            <div className="bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl p-4 sm:p-5 text-xs text-slate-700 space-y-1.5">
              <p><strong>{isBn ? 'সংগঠন:' : 'Organization:'}</strong> Infinity Bangladesh (Team Infinity — United for Humanity)</p>
              <p><strong>{isBn ? 'প্রধান কার্যালয়:' : 'Headquarters:'}</strong> Hathazari, Chattogram - 4330, Bangladesh</p>
              <p><strong>{isBn ? 'অফিসিয়াল ইমেইল:' : 'Official Email:'}</strong> smsakib6452@gmail.com</p>
              <p><strong>{isBn ? 'জরুরি হেল্পলাইন:' : 'Helpline:'}</strong> +880 1839-008339</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
