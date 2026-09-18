import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { VerifiedOrganizationPledge } from '../components/OfficialInfoBadge';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { contactSettings, settings, addContactMessage } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });
    setIsSent(true);
  };

  const address = contactSettings.address || settings.officialAddress || 'Hathazari, Chattogram, Bangladesh';
  const emailAddr = contactSettings.email || settings.officialEmail || 'smsakib6452@gmail.com';
  const phoneNum = contactSettings.phone || settings.officialPhone || '+880 1800-000000';
  const hours = contactSettings.workingHours || (isBn ? 'শনিবার - বৃহস্পতিবার: সকাল ৯টা - সন্ধ্যা ৬টা' : 'Sat - Thu: 9:00 AM - 6:00 PM');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'যোগাযোগ ও তথ্যসেবা' : 'Connect With Us'}
        title={tText(contactSettings.title as any) || (isBn ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with Team Infinity')}
        subtitle={
          tText(contactSettings.subtitle as any) || (isBn
            ? 'যেকোনো পরামর্শ, সহযোগিতা বা তথ্যের প্রয়োজনে আমাদের সাথে নির্দ্বিধায় যোগাযোগ করুন।'
            : 'Whether you want to partner with us, ask a question, or visit our volunteer hubs, we are here for you.')
        }
      />
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <ScrollReveal effect="fade-up" delay={0.1} className="lg:col-span-7">
          {isSent ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center space-y-6 shadow-warm-md animate-in zoom-in-95">
              <div className="w-16 h-16 bg-[#E6F3EF] text-[#006A4E] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  {isBn ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {isBn
                    ? 'আমাদের কমিউনিকেশন টিম দ্রুত আপনার সাথে যোগাযোগ করবে।'
                    : 'Thank you for reaching out. Our team will review your inquiry and respond promptly.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setMessage('');
                }}
                className="px-6 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-10 space-y-5 shadow-warm-md"
            >
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  {isBn ? 'সরাসরি বার্তা পাঠান' : 'Send Direct Message'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn ? 'আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর প্রদান করি।' : 'We usually respond within 24 hours.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isBn ? 'আপনার নাম' : 'Your Name'} *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={isBn ? 'নাম লিখুন' : 'Full Name'}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isBn ? 'ইমেইল' : 'Email'} *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isBn ? 'ফোন নম্বর' : 'Phone'}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isBn ? 'বিষয়' : 'Subject'}</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                  >
                    <option value="General Inquiry">{isBn ? 'সাধারণ তথ্য' : 'General Inquiry'}</option>
                    <option value="Volunteering">{isBn ? 'স্বেচ্ছাসেবী সংক্রান্ত' : 'Volunteering'}</option>
                    <option value="Donation">{isBn ? 'অনুদান ও হিসাব' : 'Donation & Receipts'}</option>
                    <option value="Partnership">{isBn ? 'পার্টনারশিপ / সহযোগিতা' : 'Partnership'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{isBn ? 'আপনার বার্তা' : 'Message'} *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={isBn ? 'আপনার বার্তা বা প্রশ্ন লিখুন...' : 'Write your message or inquiry here...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs sm:text-sm focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs sm:text-sm shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>{isBn ? 'বার্তা পাঠান' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </ScrollReveal>

        {/* Right Info Column */}
        <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {isBn ? 'অফিসিয়াল যোগাযোগের ঠিকানা' : 'Official Contact Information'}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">{isBn ? 'হেডকোয়ার্টার:' : 'Headquarters:'}</strong>
                  <p className="text-slate-600 text-xs">{typeof address === 'string' ? address : tText(address as any)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">{isBn ? 'ইমেইল:' : 'Email:'}</strong>
                  <a href={`mailto:${emailAddr}`} className="text-[#006A4E] hover:underline text-xs">{emailAddr}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">{isBn ? 'ফোন নম্বর:' : 'Phone:'}</strong>
                  <a href={`tel:${phoneNum}`} className="text-[#006A4E] hover:underline text-xs">{phoneNum}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">{isBn ? 'কার্যকাল:' : 'Operational Hours:'}</strong>
                  <p className="text-slate-600 text-xs">{typeof hours === 'string' ? hours : tText(hours as any)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF7F2] rounded-3xl border border-[#EAE3D9] p-6 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
              <span>{isBn ? 'সরাসরি সেবা ও তথ্য নিরাপত্তা' : 'Direct Service & Privacy'}</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'আপনার সকল ব্যক্তিগত তথ্য গোপনীয়তার সাথে সংরক্ষণ করা হয় এবং কখনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।'
                : 'All inquiries and contact information are treated with strict confidentiality.'}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
