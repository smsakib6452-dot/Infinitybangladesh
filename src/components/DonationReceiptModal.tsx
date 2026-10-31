import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Download, Printer, X, CheckCircle2, Heart } from 'lucide-react';
import { formatBDT } from '../lib/utils/formatters';
import { ModalShell } from './ModalShell';

export interface DonationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationData: {
    receiptNumber: string;
    donorName: string;
    amountBDT: number;
    paymentMethod: string;
    campaignTitle: string;
    transactionId?: string;
    date: string;
    donationType: string;
  };
}

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({
  isOpen,
  onClose,
  donationData
}) => {
  const { isBn } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={isBn ? 'অনুদান নিশ্চিতকরণ রসিদ' : 'Official Donation Receipt'}
      className="max-w-lg print:shadow-none print:border-none"
    >
      {/* Header Ribbon */}
      <div className="bg-gradient-to-r from-[#006A4E] to-[#0F4C3A] px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight font-display">Infinity Bangladesh</h3>
            <p className="text-xs text-emerald-100 font-bold">Team Infinity — United for Humanity</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white print:hidden cursor-pointer"
          aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Receipt Content */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="text-center pb-4 border-b border-slate-100">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#E6F3EF] text-[#00523C] rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-[#C2E2D7]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006A4E]" />
            {isBn ? 'অনুদান নিশ্চিতকরণ রসিদ' : 'Official Donation Receipt'}
          </span>
          <h4 className="text-3xl font-extrabold text-slate-900 mt-1 font-display">
            {formatBDT(donationData.amountBDT, isBn)}
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {isBn ? 'রসিদ নং:' : 'Receipt No:'} <strong className="text-[#006A4E]">{donationData.receiptNumber}</strong>
          </p>
        </div>

        <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EAE3D9] space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">{isBn ? 'দাতার নাম:' : 'Donor Name:'}</span>
            <span className="font-bold text-slate-900">{donationData.donorName}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">{isBn ? 'ক্যাম্পেইন:' : 'Campaign / Purpose:'}</span>
            <span className="font-semibold text-slate-900 text-right max-w-[220px] truncate">{donationData.campaignTitle}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">{isBn ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
            <span className="font-bold text-[#006A4E]">{donationData.paymentMethod}</span>
          </div>
          {donationData.transactionId && (
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">{isBn ? 'ট্রানজেকশন আইডি:' : 'Trx ID:'}</span>
              <span className="font-mono font-medium text-slate-800">{donationData.transactionId}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">{isBn ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
            <span className="text-slate-700 font-medium">{donationData.date}</span>
          </div>
        </div>

        <div className="bg-[#E6F3EF] border border-[#C2E2D7] rounded-2xl p-3.5 flex items-start gap-3 text-xs text-[#00523C]">
          <Heart className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isBn
              ? 'আপনার সহায়তা সরাসরি মাঠপর্যায়ে মানুষের মুখে হাসি ফোটাতে ব্যবহৃত হবে। শতভাগ স্বচ্ছতার সাথে আমরা প্রতিটি টাকার হিসাব সংরক্ষণ করি।'
              : 'Your support directly reaches vulnerable people. Infinity Bangladesh maintains transparent audits for every fund.'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-warm-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'রসিদ প্রিন্ট করুন' : 'Print Official Receipt'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700 font-bold text-xs sm:text-sm border border-[#EAE3D9] transition-colors cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
