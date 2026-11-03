import React from 'react';
import { motion } from 'motion/react';
import { Droplet } from 'lucide-react';

export interface ExactBloodGroupSelectorProps {
  selected: string;
  onSelect: (group: string) => void;
  counts: Record<string, { total: number; ready: number }>;
  isBn: boolean;
}

export const ExactBloodGroupSelector: React.FC<ExactBloodGroupSelectorProps> = ({
  selected,
  onSelect,
  counts,
  isBn
}) => {
  const groups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const activeStats = counts[selected] || { total: 0, ready: 0 };

  return (
    <div className="relative rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-[#061A12] via-[#07130E] to-[#0A1F16] p-3 sm:p-3.5 shadow-xl text-left">
      {/* Header Row: Title & Live Exact Match Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF1E44] to-[#B00C28] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,30,68,0.3)] border border-white/20">
            <Droplet className="h-3.5 w-3.5 fill-current" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-1.5">
              <span>{isBn ? 'প্রয়োজনীয় রক্তের গ্রুপ নির্বাচন করুন' : 'Select Required Blood Group'}</span>
              <span className="text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 font-bold">
                {isBn ? 'সম-গ্রুপ' : 'Exact Match'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 hidden sm:block">
              {isBn
                ? 'হাসপাতাল প্রটোকল অনুযায়ী নির্দিষ্ট গ্রুপের রক্তদাতা ও লাইভ প্রাপ্যতা স্ট্যাটাস'
                : 'Hospital protocol strictly mandates exact blood group matching for patient safety'}
            </p>
          </div>
        </div>

        {/* Live Exact Group Status Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#082218]/90 px-2.5 py-1 text-xs font-medium text-emerald-300 shadow-sm">
          <span className="font-extrabold text-white font-display">
            {selected === 'ALL' ? (isBn ? 'সকল গ্রুপ' : 'All') : (isBn ? `গ্রুপ ${selected}` : selected)}
          </span>
          <span className="text-emerald-600">•</span>
          <span className="flex items-center gap-1 font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {activeStats.ready} {isBn ? 'প্রস্তুত' : 'Ready'}
            </span>
          </span>
          <span className="text-slate-400 text-xs font-mono">
            ({activeStats.total})
          </span>
        </div>
      </div>

      {/* Tactile Compact Switcher Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2">
        {groups.map((group) => {
          const stat = counts[group] || { total: 0, ready: 0 };
          const isSelected = selected === group;
          const hasDonors = stat.total > 0;

          return (
            <motion.button
              whileHover={hasDonors || isSelected ? { y: -1.5 } : {}}
              whileTap={hasDonors || isSelected ? { scale: 0.96 } : {}}
              key={group}
              type="button"
              onClick={() => onSelect(group)}
              className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 sm:py-2 px-1 transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-rose-400/80 bg-gradient-to-b from-[#FF1E44] via-[#E01035] to-[#B00C28] text-white shadow-[0_0_20px_rgba(255,30,68,0.5)] scale-[1.03] z-10'
                  : hasDonors
                    ? 'border border-white/10 bg-[#071D14]/80 text-white hover:border-emerald-500/40 hover:bg-[#0A261B] shadow-2xs'
                    : 'border border-white/5 bg-white/[0.02] text-slate-500 opacity-45 cursor-not-allowed'
              }`}
            >
              {/* Ready Indicator Beacon */}
              {stat.ready > 0 && !isSelected && (
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5" title={`${stat.ready} ready`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
              )}

              <span className="text-xs sm:text-sm font-black tracking-tight font-display">
                {group === 'ALL' ? (isBn ? 'সকল' : 'All') : group}
              </span>

              <span
                className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] sm:text-xs font-mono font-bold ${
                  isSelected
                    ? 'bg-black/30 text-white'
                    : hasDonors
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500'
                }`}
              >
                {stat.total}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Bangladesh Transfusion & Clinical Safety Advisory */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-slate-300">
        <span className="text-emerald-400 shrink-0 font-bold">✓</span>
        <span className="truncate">
          {isBn
            ? 'ক্লিনিক্যাল প্রটোকল অনুযায়ী রোগীর সুরক্ষায় সম-গ্রুপের রক্ত পরিসঞ্চালন আবশ্যক। ল্যাব ক্রস-ম্যাচিং বাধ্যতামূলক।'
            : 'Exact blood group matching is strictly required for clinical safety. Hospital lab cross-match is mandatory.'}
        </span>
      </div>
    </div>
  );
};
