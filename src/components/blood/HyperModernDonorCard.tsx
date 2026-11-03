import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  MessageSquare,
  MapPin,
  ShieldCheck,
  QrCode,
  Clock,
  User
} from 'lucide-react';
import { BloodDonor } from '../../types';
import { isEligibleToDonate, getDonorPhoneVisibility, cleanBloodDonor } from '../../data/bloodDonationData';
import { getDonorTier } from './bloodGamification';

export interface HyperModernDonorCardProps {
  donor: BloodDonor;
  isBn: boolean;
  onOpenPass: (donor: BloodDonor) => void;
  onViewProfile?: (donor: BloodDonor) => void;
  emergencyHelpline: string;
  className?: string;
}

export const HyperModernDonorCard: React.FC<HyperModernDonorCardProps> = ({
  donor: rawDonor,
  isBn,
  onOpenPass,
  onViewProfile,
  emergencyHelpline,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const donor = cleanBloodDonor(rawDonor);
  const tier = getDonorTier(donor.totalDonations || 0);
  const phoneVis = getDonorPhoneVisibility(donor);
  const eligibility = isEligibleToDonate(donor.lastDonationDate);

  // Recovery Calculation
  const isCooldown = !eligibility.eligible;

  // Gender-based Direct Contact Rule:
  // 1. If in 90-day cooldown -> always Volunteer Desk (recovering)
  // 2. If eligible:
  //    - Male -> directly callable (Call & WhatsApp)
  //    - Female / Other -> protected via Volunteer Desk unless showPhonePublicly is explicitly true
  const isMale = (donor.gender || 'Male') === 'Male';
  const rawPhone = donor.phone ? String(donor.phone).trim() : '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const hasPhone = Boolean(cleanPhone.length >= 6 && !rawPhone.includes('*'));
  const canDirectContact = !isCooldown && hasPhone && (isMale || Boolean(donor.showPhonePublicly) || phoneVis.isPublic);

  const waFormattedPhone = cleanPhone.startsWith('880')
    ? cleanPhone
    : cleanPhone.startsWith('0')
    ? `88${cleanPhone}`
    : cleanPhone;

  return (
    <motion.div
      layoutId={`donor-card-${donor.id}`}
      ref={cardRef}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-[#061A12] via-[#07130E] to-[#14060A] p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-emerald-400/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)] text-left transition-all ${className}`}
    >
      {/* TOP ROW: Clean Modern Square Avatar + Identity + Symmetrical Blood Group Badge (Middle-Aligned) */}
      <div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Clean Luxury Soft-Corner Square Avatar (Strictly Non-Circular / rounded-xl) */}
            <div
              className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => onViewProfile && onViewProfile(donor)}
              title={isBn ? 'সম্পূর্ণ প্রোফাইল দেখুন' : 'View Full Profile'}
            >
              {/* Inner Photo Container (Clips image only, NOT the outer badge) */}
              <div className="w-full h-full rounded-xl border border-white/20 bg-[#091F16] overflow-hidden shadow-xs">
                {donor.photoUrl ? (
                  <img
                    src={donor.photoUrl}
                    alt={donor.fullName}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0A1F16] font-black text-emerald-400 text-sm">
                    {(donor.fullName || 'IB')
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* Verified Badge: 100% Unclipped, positioned on top with high z-index */}
              {donor.isVerified && (
                <span
                  title={isBn ? 'ইনফিনিটি বাংলাদেশ কর্তৃক ভেরিফাইড রক্তদাতা' : 'Verified Donor by Infinity Bangladesh'}
                  className="absolute -bottom-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-white shadow-md ring-2 ring-[#07130E]"
                >
                  <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                </span>
              )}
            </div>

            {/* Name + Gamified Rank Badge */}
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewProfile && onViewProfile(donor)}
                className="text-left w-full group/name cursor-pointer"
              >
                <h3 className="text-sm sm:text-base font-extrabold text-white group-hover/name:text-emerald-300 transition-colors truncate font-display">
                  {donor.fullName}
                </h3>
              </button>

              {/* Gamified Rank Badge */}
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${tier.badgeClass}`}
                >
                  <span>{tier.badgeIcon}</span>
                  <span>{isBn ? tier.titleBn : tier.titleEn}</span>
                  <span className="opacity-75 font-mono font-bold">({donor.totalDonations || 0}x)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Symmetrical Modern Square Blood Group Badge (rounded-xl) */}
          <div
            className="relative shrink-0 flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-rose-400/40 bg-gradient-to-br from-[#FF1E44] to-[#9E0B22] text-white shadow-[0_0_20px_rgba(255,30,68,0.35)] transition-transform group-hover:scale-105"
            title={isBn ? `রক্তের গ্রুপ: ${donor.bloodGroup}` : `Blood Group: ${donor.bloodGroup}`}
          >
            <span className="text-base sm:text-lg font-black leading-none font-display text-white">
              {donor.bloodGroup}
            </span>
            <span className="text-[7.5px] font-mono uppercase tracking-widest text-rose-100 mt-0.5">
              GROUP
            </span>
          </div>
        </div>

        {/* STATUS BAR: Single Unified Ready Badge vs Dignified Medical Recovery Rest Period */}
        <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
          {!isCooldown && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isBn ? 'রক্তদানে প্রস্তুত' : 'Ready to Donate'}</span>
            </span>
          )}

          {/* Dignified Humanitarian Post-Donation Rest Indicator (Respectful Medical Language) */}
          {isCooldown && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-teal-500/15 px-2.5 py-0.5 text-[10.5px] font-bold text-teal-300 shadow-2xs">
                <Clock className="h-3 w-3 text-teal-400 shrink-0" />
                <span>
                  {isBn
                    ? `বিশ্রামকাল (আর ${eligibility.daysRemaining} দিন পর প্রস্তুত)`
                    : `Post-Donation Rest (${eligibility.daysRemaining}d left)`}
                </span>
              </div>
            </div>
          )}

          <span className="text-[10.5px] text-slate-400 font-medium shrink-0">
            {donor.gender === 'Female' ? (isBn ? 'নারী' : 'Female') : donor.gender === 'Other' ? (isBn ? 'অন্যান্য' : 'Other') : (isBn ? 'পুরুষ' : 'Male')}
          </span>
        </div>

        {/* MIDDLE META STRIP: Location & Last Donation */}
        <div className="relative z-10 mt-2.5 flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-xs text-slate-300 border border-white/10">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate font-medium text-slate-200">
              {donor.area ? `${donor.area}, ` : ''}{donor.upazila || donor.district}
            </span>
          </span>
          <span className="font-mono text-[11px] text-emerald-400/90 shrink-0">
            {donor.lastDonationDate
              ? (isBn ? `সর্বশেষ: ${donor.lastDonationDate}` : `Last: ${donor.lastDonationDate}`)
              : (isBn ? 'প্রথম রক্তদান করবেন' : 'First Time Donor')}
          </span>
        </div>
      </div>

      {/* BOTTOM ACTION BAR: Tactile Premium Action Cluster */}
      <div className="relative z-10 mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-1.5">
        {/* Pass Button */}
        <button
          type="button"
          onClick={() => onOpenPass(donor)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-white hover:text-emerald-300 px-2.5 sm:px-3 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
          title={isBn ? 'ডিজিটাল ডোনার আইডি পাস ও স্টোরি কার্ড দেখুন' : 'View Digital Donor ID Pass'}
        >
          <QrCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">{isBn ? 'ডোনার পাস' : 'Pass'}</span>
        </button>

        {/* Profile Button */}
        {onViewProfile && (
          <button
            type="button"
            onClick={() => onViewProfile(donor)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white px-2.5 sm:px-3 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            title={isBn ? 'সম্পূর্ণ প্রোফাইল দেখুন' : 'View Full Profile'}
          >
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">{isBn ? 'প্রোফাইল' : 'Profile'}</span>
          </button>
        )}

        {/* Direct Call / WhatsApp OR Volunteer Desk (Gender-Protected) */}
        {canDirectContact ? (
          <div className="flex flex-1 items-center gap-1.5">
            <a
              href={`tel:${rawPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#FF1E44] via-[#E61237] to-[#B80A28] border border-rose-500/50 text-white px-2.5 py-2 text-xs font-extrabold shadow-[0_0_20px_rgba(255,30,68,0.35)] hover:brightness-110 hover:-translate-y-0.5 transition-all cursor-pointer active:translate-y-0 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 fill-current" />
              <span>{isBn ? 'কল' : 'Call'}</span>
            </a>
            <a
              href={`https://wa.me/${waFormattedPhone}?text=${encodeURIComponent(
                isBn
                  ? `আসসালামু আলাইকুম ${donor.fullName}, ইনফিনিটি লাইফলাইন থেকে জরুরি প্রয়োজনে আপনার সাথে যোগাযোগ করছি।`
                  : `Hello ${donor.fullName}, contacting you from Infinity LifeLine regarding emergency blood.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#25D366] via-[#1EBE5D] to-[#128C7E] border border-emerald-400/50 text-white px-2.5 py-2 text-xs font-extrabold shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:brightness-105 hover:-translate-y-0.5 transition-all cursor-pointer active:translate-y-0 active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        ) : (
          <a
            href={`tel:${emergencyHelpline}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#006A4E] via-[#005C43] to-[#004D38] border border-emerald-600/50 text-white px-3 py-2 text-xs font-extrabold shadow-[0_0_15px_rgba(0,106,78,0.25)] hover:brightness-110 hover:-translate-y-0.5 transition-all cursor-pointer active:translate-y-0 active:scale-95"
            title={isCooldown ? (isBn ? 'রক্তদান-পরবর্তী বিশ্রামে থাকায় সমন্বয়ের জন্য হেল্পলাইন' : 'In post-donation rest period') : (isBn ? 'ব্যক্তিগত সুরক্ষার জন্য হেল্পলাইনের মাধ্যমে যোগাযোগ' : 'Protected via Volunteer Desk')}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isBn ? 'ভলান্টিয়ার ডেস্ক' : 'Volunteer Desk'}</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};
