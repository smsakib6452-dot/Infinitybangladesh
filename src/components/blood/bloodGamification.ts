export interface GamifiedTier {
  titleEn: string;
  titleBn: string;
  badgeIcon: string;
  ringClass: string;
  badgeClass: string;
}

export function getDonorTier(donations: number): GamifiedTier {
  const count = Number(donations) || 0;
  if (count >= 20) {
    return {
      titleEn: 'Legend of Humanity',
      titleBn: 'মানবতার কিংবদন্তি',
      badgeIcon: '👑',
      ringClass: 'p-[2.5px] bg-gradient-to-tr from-amber-400 via-[#FF1E44] to-emerald-400 shadow-[0_0_14px_rgba(251,191,36,0.45)]',
      badgeClass: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300/90 text-amber-950 font-black shadow-2xs'
    };
  }
  if (count >= 8) {
    return {
      titleEn: 'Crimson Guardian',
      titleBn: 'রক্তবীজ অভিভাবক',
      badgeIcon: '🔥',
      ringClass: 'p-[2px] bg-gradient-to-tr from-[#FF1E44] via-rose-500 to-amber-500 shadow-[0_0_12px_rgba(255,30,68,0.35)]',
      badgeClass: 'bg-rose-50/90 border-rose-200/90 text-rose-950 font-extrabold shadow-2xs'
    };
  }
  if (count >= 3) {
    return {
      titleEn: 'Silver Lifesaver',
      titleBn: 'সিলভার লাইফসেভার',
      badgeIcon: '⚡',
      ringClass: 'p-[2px] bg-gradient-to-tr from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
      badgeClass: 'bg-teal-50/90 border-teal-200/90 text-teal-950 font-extrabold shadow-2xs'
    };
  }
  return {
    titleEn: 'Rising Hero',
    titleBn: 'উদীয়মান আলোকবর্তিকা',
    badgeIcon: '🌱',
    ringClass: 'p-[1.5px] bg-emerald-500/50',
    badgeClass: 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950 font-extrabold shadow-2xs'
  };
}
