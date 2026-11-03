import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useReducedMotion } from 'motion/react';
import {
  Users,
  UserCheck,
  Droplet,
  Heart,
  AlertTriangle,
  UserPlus,
  Edit3,
  PhoneCall
} from 'lucide-react';
import { LifeLineHeroLogoAnimation } from '../motion/LifeLineHeroLogoAnimation';

// --- ANIMATED SPRING COUNTER HOOK ---
const AnimatedHeroCounter: React.FC<{ value: number | string; suffix?: string }> = ({ value, suffix = '' }) => {
  const numericVal = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = Math.max(1, Math.ceil(numericVal / steps));

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericVal) {
        setDisplay(numericVal);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericVal]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
};

export interface InfinityLifeLineHeroProps {
  onEmergencyRequest?: () => void;
  onBecomeDonor?: () => void;
  onUpdateDate?: () => void;
  stats: {
    totalDonors: number;
    activeDonors: number;
    totalGroups: number;
    totalDonations: number;
  };
  bloodDonationSettings?: any;
  isBn: boolean;
}

export const InfinityLifeLineHero: React.FC<InfinityLifeLineHeroProps> = ({
  onEmergencyRequest,
  onBecomeDonor,
  onUpdateDate,
  stats,
  bloodDonationSettings = {},
  isBn
}) => {
  // 3D Tilt Physics for the Right CTA Card
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 25 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const totalDonors = Number(bloodDonationSettings?.statTotalDonorsOverride ?? stats.totalDonors) || 0;
  const activeDonors = Number(bloodDonationSettings?.statActiveDonorsOverride ?? stats.activeDonors) || 0;
  const totalGroups = stats.totalGroups || 8;
  const totalExperience = bloodDonationSettings?.statImpactOverride && Number(bloodDonationSettings.statImpactOverride) > 0
    ? Number(bloodDonationSettings.statImpactOverride)
    : Math.max(Number(stats.totalDonations) || 0, 82);
  const helplineNumber = bloodDonationSettings?.emergencyHelpline || '+880 1839-008339';
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#04120C] pt-6 sm:pt-8 pb-8 sm:pb-10 lg:py-8 px-4 sm:px-8 select-none border-b border-emerald-950/80">
      {/* 1. AMBIENT BACKGROUND GLOW ORBS & FLOATING BIO-PARTICLES */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {shouldReduceMotion ? (
          <>
            <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-[100px]" />
            <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-[#FF1E44]/15 blur-[100px]" />
          </>
        ) : (
          <>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.22, 0.35, 0.22] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[130px]"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.18, 0.32, 0.18] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-[#FF1E44]/20 blur-[140px]"
            />

            {/* Subtle Floating Bio-Luminescent Particles (Hidden on mobile to save GPU fill rate) */}
            <div className="hidden md:block">
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '-20%', opacity: [0, 0.45, 0] }}
                  transition={{
                    duration: 7 + i * 1.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'linear',
                  }}
                  style={{ left: `${12 + i * 11}%` }}
                  className={`absolute bottom-0 h-1.5 w-1.5 rounded-full ${
                    i % 2 === 0 ? 'bg-[#FF1E44] shadow-[0_0_10px_#FF1E44]' : 'bg-emerald-400 shadow-[0_0_10px_#10B981]'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        {/* ================= LEFT COLUMN: ANIMATED LOGO, HEADLINE & 4 SLEEK STATS ================= */}
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
          
          {/* Top Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#082218]/90 px-3.5 py-1 text-xs font-semibold text-emerald-300 shadow-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>
              {isBn ? 'জরুরি রক্তদান ও সমন্বয় নেটওয়ার্ক' : 'Emergency Blood Donation & Coordination'}
            </span>
            <span className="text-[#FF1E44]">📍</span>
          </motion.div>

          {/* THE STAR OF THE SHOW: AUTHENTIC OFFICIAL BRAND LOGO WITH LIVING DROP MICRO-ANIMATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pt-1 flex flex-col items-center lg:items-start"
          >
            <LifeLineHeroLogoAnimation
              logoUrl="/brand/Infinitylifeline-logo.svg"
              logoSize={440}
            />
            {/* Single Non-Repetitive Initiative Line (No repetition of LifeLine or One Drop) */}
            <p className="mt-2 text-xs sm:text-sm text-emerald-200/90 flex items-center gap-1.5 font-medium text-center lg:text-left">
              <span>{isBn ? 'ইনফিনিটি বাংলাদেশ-এর একটি জরুরি মানবিক রক্তদান উদ্যোগ' : 'An Emergency Blood Donation Initiative by Infinity Bangladesh'}</span>
              <span className="inline-block animate-bounce text-[#FF1E44]">🩸</span>
            </p>
          </motion.div>

          {/* 4 Sleek, Compact & Proportional Metric Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
            {[
              { icon: Users, label: isBn ? 'নিবন্ধিত রক্তদাতা' : 'Total Donors', val: totalDonors, suffix: '', color: 'text-white', iconBg: 'bg-emerald-500/15 text-emerald-400' },
              { icon: UserCheck, label: isBn ? 'জরুরিতে প্রস্তুত' : 'Active Donors', val: activeDonors, suffix: '', color: 'text-emerald-400', iconBg: 'bg-emerald-500/15 text-emerald-400' },
              { icon: Droplet, label: isBn ? 'ব্লাড গ্রুপ' : 'Blood Groups', val: totalGroups, suffix: '/8', color: 'text-white', iconBg: 'bg-[#FF1E44]/15 text-[#FF1E44]' },
              { icon: Heart, label: isBn ? 'রক্তদান সম্পন্ন' : 'Total Donations', val: totalExperience, suffix: '+', color: 'text-amber-400', iconBg: 'bg-amber-500/15 text-amber-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.08 }}
                  whileHover={{ y: -3, borderColor: 'rgba(16,185,129,0.45)' }}
                  className="group rounded-xl sm:rounded-2xl border border-white/10 bg-[#071D14]/80 hover:bg-[#0A261B] p-2.5 sm:p-3 text-center backdrop-blur-md transition-all shadow-md"
                >
                  <div className={`mx-auto mb-1.5 flex h-6.5 w-6.5 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl ${stat.iconBg} transition-transform group-hover:scale-105`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className={`text-lg sm:text-xl font-black tracking-tight ${stat.color} font-display leading-tight`}>
                    <AnimatedHeroCounter value={stat.val} suffix={stat.suffix} />
                  </div>
                  <div className="mt-0.5 text-[10px] sm:text-[10.5px] font-medium text-slate-300 leading-tight truncate">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: 3D MAGNETIC ACTION CARD ================= */}
        <div className="lg:col-span-5" style={{ perspective: 1000 }}>
          <motion.div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{ rotateX, rotateY }}
            initial={{ opacity: 0, scale: 0.92, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.45, type: 'spring' }}
            className="relative overflow-hidden rounded-[28px] border border-emerald-500/25 bg-gradient-to-b from-[#092419]/95 to-[#05140E]/95 p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl text-left"
          >
            {/* Moving Specular Sheen */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#FF1E44]/15 blur-3xl" />

            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {/* Pulsing Mini Blood Drop Avatar */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FF1E44]/30 bg-[#FF1E44]/15 text-[#FF1E44]">
                  <motion.div
                    animate={shouldReduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Droplet className="h-6 w-6 fill-current" />
                  </motion.div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF1E44]/30 bg-[#FF1E44]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF1E44] animate-ping" />
                    {isBn ? 'মানবতার আহ্বান' : 'JOIN THE CAUSE'}
                  </span>
                  <h3 className="mt-1 text-xl font-black text-white tracking-tight">
                    {isBn ? 'রক্তদাতা হোন, জীবন বাঁচান' : 'Be a Donor, Be a Hero'}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeDonors} {isBn ? 'প্রস্তুত' : 'Ready'}
              </span>
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300">
              {isBn
                ? 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি মূল্যবান প্রাণ। ইনফিনিটি বাংলাদেশ রক্তদান নেটওয়ার্কে রক্তদাতা হিসেবে যুক্ত হতে এখনই রেজিস্ট্রেশন করুন।'
                : 'Every drop counts. Register as a voluntary blood donor with Team Infinity and become someone\'s lifeline in moments of crisis.'}
            </p>

            {/* Primary CTA Buttons with Shimmer & Tactile Press */}
            <div className="mt-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                onClick={onEmergencyRequest}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#E61032] via-[#FF1E44] to-[#D10D2B] py-3.5 px-6 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,30,68,0.4)] transition-all cursor-pointer"
              >
                {/* Animated Light Sweep Across Button */}
                {!shouldReduceMotion && (
                  <motion.span
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                  />
                )}
                <AlertTriangle className="h-4 w-4" />
                <span>{isBn ? 'জরুরি রক্তের আবেদন করুন' : 'Emergency Blood Request'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.015, backgroundColor: 'rgba(16, 185, 129, 0.18)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onBecomeDonor}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 py-3.5 px-6 text-sm font-bold text-white transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <span>{isBn ? 'রক্তদাতা হতে রেজিস্ট্রেশন করুন' : 'Become a Donor'}</span>
              </motion.button>
            </div>

            {/* Update Last Donation Date Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onUpdateDate}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isBn ? 'পূর্বে রক্ত দিয়েছেন? শেষ রক্তদানের তারিখ আপডেট করুন' : 'Already a donor? Update last donation date'}</span>
              </button>
            </div>

            {/* 24/7 Helpline Footer Pill */}
            <a
              href={`tel:${helplineNumber.replace(/[^0-9+]/g, '')}`}
              className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs transition-colors hover:border-emerald-500/40"
            >
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                {isBn ? '২৪/৭ ব্লাড হেল্পলাইন:' : '24/7 Helpline:'}
              </span>
              <span className="font-mono font-bold text-emerald-400 tracking-wide">
                {helplineNumber}
              </span>
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

