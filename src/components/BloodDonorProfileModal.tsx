import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BloodDonor } from '../types';
import { getAssetUrl } from '../lib/utils/assetHelper';
import { DonorAvatar } from './DonorAvatar';
import { calculateAge, getCooldownStatusInfo, BLOOD_DONATION_COOLDOWN_DAYS, cleanBloodDonor, getDonorPhoneVisibility } from '../data/bloodDonationData';
import { formatDateDDMMYYYY } from '../lib/utils/formatters';
import {
  X,
  ShieldCheck,
  MapPin,
  Droplet,
  Phone,
  Clock,
  Award,
  AlertCircle,
  Calendar,
  User,
  Edit3,
  HeartPulse
} from 'lucide-react';

interface BloodDonorProfileModalProps {
  donor: BloodDonor | null;
  isOpen: boolean;
  onClose: () => void;
  onContactClick: (donor: BloodDonor) => void;
  onUpdateClick?: (donor: BloodDonor) => void;
}

export const BloodDonorProfileModal: React.FC<BloodDonorProfileModalProps> = ({
  donor: rawDonor,
  isOpen,
  onClose,
  onContactClick,
  onUpdateClick
}) => {
  const { isBn } = useLanguage();

  if (!isOpen || !rawDonor) return null;

  const donor = cleanBloodDonor(rawDonor);
  const age = calculateAge(donor.dateOfBirth || donor.dob);
  const genderLabel = donor.gender === 'Female' ? (isBn ? 'নারী (Female)' : 'Female') : donor.gender === 'Other' ? (isBn ? 'অন্যান্য (Other)' : 'Other') : (isBn ? 'পুরুষ (Male)' : 'Male');

  const getAvailabilityBadge = () => {
    switch (donor.availabilityStatus) {
      case 'AVAILABLE_EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isBn ? 'জরুরি রক্তদানে প্রস্তুত' : 'Available for Emergency'}</span>
          </span>
        );
      case 'AVAILABLE_NOTICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{isBn ? 'পূর্বে জানালে প্রস্তুত' : 'Available with Prior Notice'}</span>
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>{isBn ? 'সাময়িক বিরতিতে আছেন' : 'Temporarily Unavailable'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-warm-2xl border border-[#EAE3D9] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-[#006A4E] to-[#00523C] text-white p-6 sm:p-7 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            {/* Avatar & Blood Group Badge */}
            <div className="relative shrink-0">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl overflow-hidden border-3 border-white/60 shadow-lg bg-emerald-950">
                <DonorAvatar
                  photoUrl={donor.photoUrl}
                  fullName={donor.fullName}
                  gender={donor.gender}
                  className="w-full h-full"
                />
              </div>
              <div className="absolute -bottom-2.5 -right-2.5 px-2.5 py-0.5 rounded-xl bg-rose-600 text-white font-black font-display text-xs sm:text-sm border-2 border-white shadow-md flex items-center gap-0.5">
                <Droplet className="w-3 h-3 fill-current" />
                <span>{donor.bloodGroup}</span>
              </div>
            </div>

            {/* Donor Main Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                  {donor.fullName}
                </h2>
                {donor.isVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30"
                    title={isBn ? 'ইনফিনিটি বাংলাদেশ কর্তৃক যাচাইকৃত' : 'Verified by Team Infinity'}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isBn ? 'যাচাইকৃত রক্তদাতা' : 'Verified Donor'}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-100/90 font-medium">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15">
                  {donor.orgCategory}
                </span>
                {donor.committeePosition && (
                  <span className="text-emerald-200">&bull; {donor.committeePosition}</span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-200/90 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{donor.area}, {donor.upazila}, {donor.district}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
          {/* Status & Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {isBn ? 'বর্তমান প্রাপ্যতা স্ট্যাটাস' : 'Availability Status'}
              </p>
              {getAvailabilityBadge()}
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center sm:text-right">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {isBn ? 'মোট রক্তদান' : 'Total Donations'}
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-[#006A4E] font-display">
                  {donor.totalDonations} {isBn ? 'বার' : 'Times'}
                </p>
              </div>
            </div>
          </div>

          {/* Gender & Age / Date of Birth Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3D9] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'লিঙ্গ' : 'Gender'}</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{genderLabel}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3D9] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006A4E] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'বয়স ও জন্ম তারিখ' : 'Age & Birth Date'}</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                  {age !== null ? (isBn ? `${age} বছর` : `${age} years`) : (isBn ? 'নির্দিষ্ট নয়' : 'Not specified')}
                  {(donor.dateOfBirth || donor.dob) ? (
                    <span className="text-[11px] font-normal text-slate-400 ml-1">
                      ({formatDateDDMMYYYY(donor.dateOfBirth || donor.dob || '', isBn)})
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </div>

          {/* Key Milestones (Last Blood Donation & 90-Day Cooldown) */}
          <div className="p-4.5 rounded-2xl bg-white border border-[#EAE3D9] space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{isBn ? 'সর্বশেষ রক্তদানের তারিখ' : 'Last Blood Donation'}</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 font-display">
                  {donor.lastDonationDate ? (
                    formatDateDDMMYYYY(donor.lastDonationDate, isBn)
                  ) : (
                    (isBn ? 'রেকর্ড সংরক্ষিত নেই' : 'No Record')
                  )}
                </p>
              </div>
              {donor.lastDonationDate && (
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">
                  {formatDateDDMMYYYY(donor.lastDonationDate, isBn)}
                </span>
              )}
            </div>

            {/* 90-Day Cooldown Eligibility Indicator */}
            {donor.lastDonationDate && (() => {
              const cooldownInfo = getCooldownStatusInfo(donor.lastDonationDate, isBn);
              return (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${cooldownInfo.badgeColorClass}`}>
                  <HeartPulse className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold tracking-tight">
                      {cooldownInfo.badgeText}
                    </p>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      {cooldownInfo.description}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Phone & Contact Privacy Status */}
          {(() => {
            const phoneVis = getDonorPhoneVisibility(donor);
            return (
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                    <Phone className="w-4 h-4 text-[#006A4E]" />
                    <span>{isBn ? 'মোবাইল নম্বর ও যোগাযোগ প্রাপ্যতা' : 'Phone & Contact Availability'}</span>
                  </div>
                  {phoneVis.isPublic ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {isBn ? 'সরাসরি কল উন্মুক্ত' : 'Direct Call Public'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      {phoneVis.reason === 'WITHIN_90_DAYS_COOLDOWN'
                        ? (isBn ? '৯০ দিন বিশ্রামে (সুরক্ষিত)' : '90-Day Recovery')
                        : (isBn ? 'প্রাইভেসি সুরক্ষিত' : 'Private')}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="font-mono text-sm sm:text-base font-extrabold text-slate-800">
                    {phoneVis.isPublic ? donor.phone : phoneVis.maskedPhone}
                  </div>
                  {phoneVis.isPublic && donor.phone && (
                    <a
                      href={`tel:${donor.phone.replace(/[^0-9+]/g, '')}`}
                      className="px-3 py-1.5 rounded-xl bg-[#006A4E] text-white text-xs font-bold hover:bg-[#00523C] flex items-center gap-1 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কল করুন' : 'Call'}</span>
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                  {isBn ? phoneVis.messageBn : phoneVis.messageEn}
                </p>
              </div>
            );
          })()}

          {/* Donation Experience Notes */}
          {donor.experienceNotes && (
            <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-1.5">
              <div className="flex items-center gap-2 text-[#00523C] font-bold text-xs">
                <Award className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'রক্তদানের অভিজ্ঞতা ও বার্তা' : 'Donation Experience & Message'}</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                "{donor.experienceNotes}"
              </p>
            </div>
          )}

          {/* Privacy Note & Self-Update Prompt */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-[11px] text-amber-900 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'রক্তদাতার ব্যক্তিগত গোপনীয়তা রক্ষার স্বার্থে সম্পূর্ণ আবাসিক ঠিকানা ও ব্যক্তিগত যোগাযোগ তথ্য ফিল্টারকৃত রাখা হয়েছে।'
                  : 'Exact residential addresses are protected under donor privacy safeguards.'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{isBn ? 'এটি কি আপনার প্রোফাইল?' : 'Is this your profile?'}</span>
            {onUpdateClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpdateClick(donor);
                }}
                className="font-bold text-[#006A4E] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isBn ? 'তথ্য হালনাগাদ করুন' : 'Update Info'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] text-slate-700 font-bold text-xs hover:bg-[#FAF7F2] transition-all cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onContactClick(donor);
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-warm-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isBn ? 'রক্তদাতার সাথে যোগাযোগ' : 'Contact Donor / Help'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
