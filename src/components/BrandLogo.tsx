import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ShieldCheck, Info } from 'lucide-react';
import { getAssetUrl } from '../lib/utils/assetHelper';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showBadge?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showTagline = true,
  showBadge = true,
  layout = 'horizontal'
}) => {
  const { isBn, tText } = useLanguage();
  const { settings, headerSettings } = useData();
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isLight = variant === 'light';

  const logoSizes = {
    sm: {
      imgWrapper: 'w-7 h-7 sm:w-8 sm:h-8',
      title: 'text-xs sm:text-sm font-extrabold',
      sub: 'text-[9px] sm:text-[10px] tracking-wider font-semibold',
      badge: 'text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5'
    },
    md: {
      imgWrapper: 'w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 lg:w-10 lg:h-10 xl:w-11 xl:h-11',
      title: 'text-sm sm:text-base lg:text-base xl:text-lg font-extrabold',
      sub: 'text-[10px] sm:text-xs tracking-wider font-semibold',
      badge: 'text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5'
    },
    lg: {
      imgWrapper: 'w-11 h-11 sm:w-13 sm:h-13',
      title: 'text-lg sm:text-xl font-extrabold',
      sub: 'text-xs sm:text-sm tracking-wider font-semibold',
      badge: 'text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5'
    },
    xl: {
      imgWrapper: 'w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20',
      title: 'text-xl sm:text-2xl lg:text-3xl font-extrabold',
      sub: 'text-xs sm:text-sm tracking-wider font-semibold',
      badge: 'text-xs px-2.5 sm:px-3 py-1'
    }
  };

  const currentSize = logoSizes[size];

  const logoSrc = headerSettings.logoUrl || settings.logoUrl || '/brand/infinity-logo.png';
  const orgName = settings.organizationName || (isBn ? 'ইনফিনিটি বাংলাদেশ' : 'Infinity Bangladesh');
  const teamId = settings.teamIdentity || 'Team Infinity';
  const sloganText = isBn
    ? (settings.primary_slogan?.bn || settings.slogan?.bn || 'মানবতার জন্য একতাবদ্ধ')
    : (settings.primary_slogan?.en || settings.slogan?.en || settings.tagline || 'United for Humanity');

  return (
    <>
      <div
        className={`flex ${
          layout === 'vertical' ? 'flex-col items-center text-center' : 'items-center'
        } gap-2 sm:gap-2.5 select-none group cursor-pointer`}
      >
        {/* Official Brand Emblem Mark */}
        <div
          className={`relative ${currentSize.imgWrapper} rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs border ${
            isLight
              ? 'bg-white p-0.5 border-teal-500/40 shadow-teal-950/40'
              : 'bg-white p-0.5 border-emerald-700/20 shadow-slate-900/10'
          }`}
          title={`${orgName} (${teamId} — ${sloganText})`}
        >
          {!imgError ? (
            <img
              src={getAssetUrl(logoSrc)}
              alt={`${orgName} Official Logo`}
              className="w-full h-full object-contain rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#006A4E] to-[#0F172A] flex items-center justify-center p-1 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3/4 h-3/4"
              >
                <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.356-8-5.096 0-5.096 8 0 8 5.223 0 7.261-8 12.356-8z" />
              </svg>
            </div>
          )}
        </div>

        {/* Brand Name & Tagline Typography */}
        <div className={`flex flex-col leading-tight min-w-0 ${layout === 'vertical' ? 'items-center' : ''}`}>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
            <span
              className={`tracking-tight font-display whitespace-nowrap ${currentSize.title} ${
                isLight ? 'text-white' : 'text-slate-900'
              }`}
            >
              {orgName}
            </span>

            {showBadge && (
              <>
                <span
                  className={`hidden 2xl:inline-flex items-center rounded-full font-bold uppercase tracking-wider shrink-0 ${currentSize.badge} ${
                    isLight
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]'
                  }`}
                >
                  {teamId}
                </span>

                {/* Info Icon Indicator directly next to title/badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className={`hidden 2xl:inline-flex p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity shrink-0 cursor-pointer ${
                    isLight ? 'text-teal-300 hover:text-white' : 'text-slate-400 hover:text-[#006A4E]'
                  }`}
                  title="Official brand identity verification details"
                  aria-label="Brand Asset Information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {showTagline && (
            <span
              className={`uppercase mt-0.5 truncate hidden sm:block ${currentSize.sub} ${
                isLight ? 'text-teal-200/90' : 'text-[#006A4E]'
              }`}
            >
              {sloganText}
            </span>
          )}
        </div>
      </div>

      {/* Official Brand Identity Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5 text-[#006A4E] font-bold text-base sm:text-lg">
                <ShieldCheck className="w-5 h-5 text-[#006A4E]" />
                Official Brand Identity Architecture
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-4 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] mb-4">
              <img
                src={getAssetUrl(logoSrc)}
                alt={`${orgName} Logo`}
                className="w-14 h-14 object-contain rounded-full bg-white p-1 border border-slate-200"
              />
              <div>
                <p className="font-extrabold text-slate-900 text-base">{orgName}</p>
                <p className="text-xs font-semibold text-[#006A4E]">{teamId} — {sloganText}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Established {settings.establishedYear || '2015'} &bull; {settings.officialAddress || 'Hathazari, Chattogram'}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <p>
                <strong className="text-slate-900">Official Brand Integrity:</strong> The {orgName} brand mark incorporates the symbolic infinity emblem with Bangladeshi green & red wings, representing eternal compassion, youth solidarity, and national service.
              </p>
              <p>
                <strong className="text-slate-900">Headquarters:</strong> {settings.officialAddress || 'Hathazari, Chattogram, Bangladesh'}.
              </p>
              <p className="text-slate-500 text-[11px]">
                Preserved in authentic proportions as mandated by organizational governance.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};