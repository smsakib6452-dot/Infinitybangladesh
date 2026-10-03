import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { OfficialInfoBadge, VerifiedOrganizationPledge } from '../components/OfficialInfoBadge';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Receipt,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Send,
  Building,
  Smartphone,
  Info
} from 'lucide-react';
import { BkashLogo, NagadLogo, BankLogo } from '../components/PaymentLogos';

export const DonatePage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { campaigns, supportSettings, settings, addDonationRecord } = useData();

  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]?.title.en || 'General Humanitarian Fund');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Bank Transfer' | 'In-Kind / Physical Support'>('bKash');
  const [amount, setAmount] = useState<number | string>(1000);
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');

  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    donorName: string;
    amount: number;
    campaign: string;
    date: string;
    method: string;
    trxId?: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount) || 0;
    const effectiveName = isAnonymous ? (isBn ? 'নাম প্রকাশে অনিচ্ছুক শুভাকাঙ্ক্ষী' : 'Anonymous Supporter') : donorName;

    const record = {
      donorName: effectiveName,
      isAnonymous,
      donorEmail,
      donorPhone,
      amount: numericAmount,
      amountBDT: numericAmount,
      campaignSlug: selectedCampaign,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      notes: note.trim() || undefined
    };

    const newRecord = addDonationRecord(record);

    setReceiptData({
      receiptNumber: newRecord.receiptNumber,
      donorName: effectiveName,
      amount: numericAmount,
      campaign: selectedCampaign,
      date: new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      method: paymentMethod,
      trxId: transactionId.trim() || undefined
    });
  };

  const bKashNum = supportSettings.bKashNumber || settings.bKashNumber || '01800-000000';
  const nagadNum = supportSettings.nagadNumber || settings.nagadNumber || '01800-000000';
  const bankDet = supportSettings.bankDetails || settings.bankDetails;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'স্বচ্ছ ও দায়িত্বশীল অনুদান' : 'Honest Fund Stewardship'}
          title={tText(supportSettings.ctaText) || (isBn ? 'আপনার সহায়তায় হাসবে সুবিধাবঞ্চিত মানুষ' : 'Support Our Humanitarian Missions')}
          subtitle={
            tText(supportSettings.description) ||
            (isBn
              ? 'টিম ইনফিনিটি সংগৃহীত প্রতিটি অনুদানের যথাযথ ব্যবহার নিশ্চিত করে এবং পূর্ণাঙ্গ অডিট রিপোর্ট প্রকাশ করে।'
              : 'Every Taka donated directly funds field procurement for underprivileged children and distressed families.')
          }
        />
      </ScrollReveal>

      {/* Verified Org Pledge */}
      <ScrollReveal effect="fade-up" delay={0.1}>
        <VerifiedOrganizationPledge />
      </ScrollReveal>

      {/* Official Payment Channels Status */}
      <ScrollReveal effect="fade-up" delay={0.2} className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {isBn ? 'অফিসিয়াল একাউন্ট ও মার্চেন্ট চ্যানেল' : 'Verified Donation Accounts'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn ? 'অনুমোদিত চ্যানেলে সরাসরি সহায়তা পাঠানো যাবে।' : 'Send your contributions directly through verified accounts.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* bKash Official Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#FFF5F8] to-[#FFFFFF] border border-[#FAD2E1] hover:border-[#E2136E]/40 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <BkashLogo className="h-7 w-auto" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E2136E]/10 text-[#E2136E]">
                {supportSettings.bKashType || (isBn ? 'মার্চেন্ট / পার্সোনাল' : 'Merchant / Personal')}
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                {isBn ? 'বিকাশ একাউন্ট নম্বর' : 'bKash Account Number'}
              </span>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#F5CEDC]">
                <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 tracking-wide">{bKashNum}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(bKashNum, 'bkash')}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#E2136E] hover:bg-[#C21359] text-white transition-colors cursor-pointer"
                  title="Copy bKash Number"
                >
                  {copiedField === 'bkash' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-rose-100/60">
              <span>{isBn ? 'কাউন্টার / রেফারেন্স:' : 'Counter / Reference:'}</span>
              <span className="font-semibold text-slate-700">Infinity</span>
            </div>
          </div>

          {/* Nagad Official Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#FFF7F0] to-[#FFFFFF] border border-[#FCE1CE] hover:border-[#F7931E]/40 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <NagadLogo className="h-7 w-auto" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ED1C24]/10 text-[#ED1C24]">
                {supportSettings.nagadType || (isBn ? 'অফিসিয়াল পার্সোনাল' : 'Official Personal')}
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                {isBn ? 'নগদ একাউন্ট নম্বর' : 'Nagad Account Number'}
              </span>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#FAD9C4]">
                <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 tracking-wide">{nagadNum}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(nagadNum, 'nagad')}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#ED1C24] hover:bg-[#C1272D] text-white transition-colors cursor-pointer"
                  title="Copy Nagad Number"
                >
                  {copiedField === 'nagad' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-orange-100/60">
              <span>{isBn ? 'রেফারেন্স:' : 'Reference:'}</span>
              <span className="font-semibold text-slate-700">Infinity</span>
            </div>
          </div>

          {/* Bank Official Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#F2F9F6] to-[#FFFFFF] border border-[#CDE5DC] hover:border-[#006A4E]/40 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <BankLogo className="h-7 w-auto" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#006A4E]/10 text-[#006A4E]">
                {bankDet.branchName || (isBn ? 'চট্টগ্রাম শাখা' : 'Chattogram')}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {bankDet.bankName}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${bankDet.bankName} | A/C: ${bankDet.accountNumber} | Name: ${bankDet.accountName} | Branch: ${bankDet.branchName || ''}`, 'bank')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006A4E] hover:text-[#004835] cursor-pointer"
                  title="Copy Bank Info"
                >
                  {copiedField === 'bank' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{isBn ? 'সব কপি' : 'Copy All'}</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-[#CCE3DA]">
                <p className="text-xs font-mono font-bold text-slate-900 truncate">{bankDet.accountName}</p>
                <p className="text-sm font-mono font-extrabold text-[#006A4E] tracking-wider">{bankDet.accountNumber}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100/60">
              <span>{isBn ? 'রাউটিং নং:' : 'Routing No:'}</span>
              <span className="font-mono font-semibold text-slate-700">{bankDet.routingNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {supportSettings.paymentInstructions && (
          <div className="p-3.5 bg-[#E6F3EF] border border-[#C2E2D7] rounded-2xl flex items-start gap-2.5 text-xs text-[#00523C]">
            <Info className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
            <p>{tText(supportSettings.paymentInstructions)}</p>
          </div>
        )}
      </ScrollReveal>

      {/* Main Donation Form & Instant Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Donation Form */}
        <ScrollReveal effect="slide-right" className="lg:col-span-7">
          <form
            onSubmit={handleDonationSubmit}
            className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-10 space-y-6 shadow-warm-md"
          >
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                {isBn ? 'অনুদানের তথ্য নিশ্চিতকরণ' : 'Contribution Details Form'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'আপনার অবদানের বিবরণ নিশ্চিত করতে ফরমটি পূরণ করুন।' : 'Record your contribution for verified receipt generation.'}
              </p>
            </div>

            {/* Amount Selection - Free Custom Amount (No presets, full freedom) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  {isBn ? 'অনুদানের পরিমাণ (Amount in BDT) *' : 'Donation Amount (BDT) *'}
                </label>
                <span className="text-[11px] text-slate-500">
                  {isBn ? 'যেকোনো পরিমাণ নির্ধারণ করতে পারেন' : 'Enter any amount of your choice'}
                </span>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-extrabold font-serif text-[#006A4E]">৳</span>
                </div>
                <input
                  type="number"
                  min="10"
                  step="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={isBn ? 'যেমন: ৫০০, ১০০০, ৫০০০...' : 'e.g. 500, 1000, 5000...'}
                  className="w-full pl-12 pr-16 py-3.5 bg-[#FAF7F2] border-2 border-[#EAE3D9] focus:border-[#006A4E] rounded-2xl text-xl sm:text-2xl font-mono font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm focus:outline-none focus:bg-white transition-all shadow-inner"
                />
                <div className="absolute right-4 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
                  BDT
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isBn
                  ? 'আপনার সামর্থ্য অনুযায়ী যেকোনো অঙ্কের অর্থ সরাসরি সুবিধাবঞ্চিত মানুষের সাহায্যে ব্যবহৃত হবে।'
                  : 'Whatever amount you are capable of giving will be channeled directly to ground relief.'}
              </p>
            </div>

            {/* Campaign Destination */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {isBn ? 'যে তহবিলে অনুদান দিতে চান *' : 'Target Fund / Campaign *'}
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
              >
                <option value="General Humanitarian Fund">
                  {isBn ? 'সাধারণ মানবিক তহবিল' : 'General Humanitarian Fund'}
                </option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.title.en}>
                    {tText(c.title)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Selector with Official Visual Badges */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {isBn ? 'অনুদান প্রদানের মাধ্যম (Payment Channel) *' : 'Payment Channel *'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                    paymentMethod === 'bKash'
                      ? 'border-[#E2136E] bg-[#FFF5F8] ring-2 ring-[#E2136E]/20 shadow-sm'
                      : 'border-[#EAE3D9] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700'
                  }`}
                >
                  <BkashLogo className="h-5 w-auto" />
                  <span className="text-xs font-bold text-slate-800">bKash</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                    paymentMethod === 'Nagad'
                      ? 'border-[#ED1C24] bg-[#FFF7F0] ring-2 ring-[#ED1C24]/20 shadow-sm'
                      : 'border-[#EAE3D9] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700'
                  }`}
                >
                  <NagadLogo className="h-5 w-auto" />
                  <span className="text-xs font-bold text-slate-800">{isBn ? 'নগদ' : 'Nagad'}</span>
                </button>

                {/* Bank */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                    paymentMethod === 'Bank Transfer'
                      ? 'border-[#006A4E] bg-[#F2F9F6] ring-2 ring-[#006A4E]/20 shadow-sm'
                      : 'border-[#EAE3D9] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700'
                  }`}
                >
                  <BankLogo className="h-5 w-auto" />
                  <span className="text-xs font-bold text-slate-800">{isBn ? 'ব্যাংক হিসাব' : 'Bank'}</span>
                </button>

                {/* In-Kind */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('In-Kind / Physical Support')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                    paymentMethod === 'In-Kind / Physical Support'
                      ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20 shadow-sm'
                      : 'border-[#EAE3D9] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{isBn ? 'সরাসরি পণ্য/সাহায্য' : 'In-Kind Aid'}</span>
                </button>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {isBn ? 'ট্রানজেকশন আইডি (TrxID) / ব্যাংক ভাউচার নং' : 'Transaction ID (TrxID) / Voucher'}
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={isBn ? 'উদা: 9J3K8L2P' : 'e.g. 9J3K8L2P or Bank Slip No'}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
              />
            </div>

            {/* Donor Identity */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  {isBn ? 'দাতার পরিচয়' : 'Donor Information'}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-[#006A4E] focus:ring-[#006A4E]"
                  />
                  <span>{isBn ? 'গোপন রাখুন (Anonymous)' : 'Make donation anonymous'}</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-1.5 sm:col-span-2">
                    <input
                      type="text"
                      required={!isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={isBn ? 'আপনার নাম *' : 'Your Full Name *'}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder={isBn ? 'মোবাইল নম্বর (এসএমএস রিসিটের জন্য)' : 'Phone (for SMS receipt)'}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder={isBn ? 'ইমেইল (ই-রিসিটের জন্য)' : 'Email (for e-receipt)'}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Note / Blessing */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {isBn ? 'বিশেষ বার্তা বা দোয়া (ঐচ্ছিক)' : 'Message or Dedication (Optional)'}
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isBn ? 'আপনার অনুভূতি বা পরামর্শ লিখুন...' : 'Add a note or prayer...'}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-sm shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isBn ? 'অনুদান নিশ্চিত করুন ও রিসিট নিন' : 'Confirm Contribution & Get Receipt'}</span>
            </button>
          </form>
        </ScrollReveal>

        {/* Right Receipt / Verification Panel */}
        <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-5 relative">
          <div className="sticky top-24">
            {receiptData ? (
              <div className="bg-white rounded-3xl border border-emerald-300 p-6 sm:p-8 space-y-6 shadow-warm-lg animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-[#006A4E] font-bold text-sm">
                    <Receipt className="w-5 h-5" />
                    <span>{isBn ? 'ডিজিটাল মানি রিসিট' : 'Verified Digital Receipt'}</span>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {receiptData.receiptNumber}
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{isBn ? 'দাতার নাম:' : 'Donor Name:'}</span>
                    <span className="font-bold text-slate-900">{receiptData.donorName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{isBn ? 'পরিমাণ:' : 'Amount:'}</span>
                    <span className="font-extrabold text-emerald-800 font-mono text-base">৳{receiptData.amount.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{isBn ? 'তহবিল:' : 'Target Fund:'}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{receiptData.campaign}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Method:'}</span>
                    <span className="font-medium text-slate-800">{receiptData.method}</span>
                  </div>
                  {receiptData.trxId && (
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-500">{isBn ? 'ট্রানজেকশন নং:' : 'TrxID:'}</span>
                      <span className="font-mono font-bold text-slate-900">{receiptData.trxId}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{isBn ? 'তারিখ:' : 'Date:'}</span>
                    <span className="font-medium text-slate-800">{receiptData.date}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] text-[11px] text-slate-600 text-center">
                  {isBn
                    ? 'টিম ইনফিনিটিতে আস্থা রাখার জন্য আপনাকে আন্তরিক ধন্যবাদ।'
                    : 'Infinity Bangladesh thanks you for standing united for humanity.'}
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isBn ? 'রিসিট প্রিন্ট / সংরক্ষণ করুন' : 'Print / Save Official Receipt'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex items-center gap-3 text-slate-900 font-bold font-display">
                  <ShieldCheck className="w-6 h-6 text-[#006A4E]" />
                  <span>{isBn ? '১০০% স্বচ্ছতা ও অডিট নিশ্চয়তা' : '100% Stewardship & Audit'}</span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'প্রতিটি টাকার ভাউচার ও ব্যাংক বিবরণ সংরক্ষিত থাকে।' : 'Itemized vendor receipts and field distribution logs maintained.'}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'নিয়মিত আয়-ব্যয় ও বাৎসরিক স্বচ্ছতা রিপোর্ট প্রকাশ করা হয়।' : 'Periodic transparency audits published on the website.'}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'স্বেচ্ছাসেবীদের অক্লান্ত পরিশ্রমে প্রশাসনিক খরচ সর্বনিম্ন রাখা হয়।' : 'Volunteer-run model ensuring maximum funds reach beneficiaries.'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
