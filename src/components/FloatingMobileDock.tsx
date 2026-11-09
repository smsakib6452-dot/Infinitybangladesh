import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link, useRouter } from '../context/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { Droplet, Users, Home, Menu, X } from 'lucide-react';

export const FloatingMobileDock: React.FC = () => {
  const { currentPage, isSearchOpen } = useRouter();
  const { isBn } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync with Navbar mobileMenuOpen state
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isOpen === 'boolean') {
        setIsMenuOpen(customEvent.detail.isOpen);
      }
    };
    window.addEventListener('mobile-menu-state-change', handleStateChange);
    return () => window.removeEventListener('mobile-menu-state-change', handleStateChange);
  }, []);

  // Safe haptic feedback helper for mobile touch interaction
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore devices without vibration support
      }
    }
  }, []);

  const handleToggleMenu = () => {
    triggerHaptic();
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

  // Do not obstruct admin dashboard or active modal overlays
  if (currentPage === 'admin' || isSearchOpen) return null;

  const isHomeActive = currentPage === 'home' || !currentPage;
  const isBloodActive = currentPage.startsWith('blood-donation');
  const isTeamActive = currentPage.startsWith('team');

  return (
    <div className="md:hidden fixed bottom-3 inset-x-0 z-[110] flex justify-center px-3 pointer-events-none pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)]">
      <motion.nav
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.08 }}
        className="pointer-events-auto flex items-center justify-around gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-white/95 md:backdrop-blur-xl border border-[#EAE3D9] shadow-warm-lg text-slate-700 max-w-[350px] w-[calc(100vw-1.5rem)] mx-auto select-none"
        role="navigation"
        aria-label={isBn ? 'মোবাইল দ্রুত নেভিগেশন ডক' : 'Mobile Quick Action Navigation'}
      >
        {/* 1. Home Tab */}
        <Link
          to="home"
          onClick={triggerHaptic}
          className={`relative flex-1 min-h-[46px] py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer text-center min-w-0 ${
            isHomeActive && !isMenuOpen ? 'text-[#006A4E]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isHomeActive && !isMenuOpen && (
            <motion.div
              layoutId="activeMobileDockPill"
              className="absolute inset-0 bg-[#E6F3EF] rounded-full border border-[#C2E2D7] shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Home className={`w-4 h-4 shrink-0 transition-transform ${isHomeActive && !isMenuOpen ? 'text-[#006A4E] scale-105' : 'text-slate-500'}`} />
          <span className={`text-[10px] tracking-tight leading-none truncate max-w-full ${isHomeActive && !isMenuOpen ? 'font-extrabold text-[#006A4E]' : 'font-medium text-slate-700'}`}>
            {isBn ? 'হোম' : 'Home'}
          </span>
        </Link>

        {/* 2. Blood (LifeLine) Tab */}
        <Link
          to="blood-donation"
          onClick={triggerHaptic}
          className={`relative flex-1 min-h-[46px] py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer text-center min-w-0 ${
            isBloodActive && !isMenuOpen ? 'text-rose-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isBloodActive && !isMenuOpen && (
            <motion.div
              layoutId="activeMobileDockPill"
              className="absolute inset-0 bg-rose-50 rounded-full border border-rose-200 shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div className="relative shrink-0 text-rose-600">
            <Droplet className="w-4 h-4 fill-rose-500/20" />
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5 pointer-events-none">
              <span
                className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"
                style={{ animationIterationCount: 3 }}
              />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
            </span>
          </div>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[10px] tracking-tight leading-none ${isBloodActive && !isMenuOpen ? 'font-extrabold text-rose-700' : 'font-semibold text-slate-800'}`}>
              {isBn ? 'রক্তদান' : 'Blood'}
            </span>
            <span className="text-[7.5px] font-mono font-bold text-rose-600 tracking-tighter mt-0.5 leading-none">
              (LifeLine)
            </span>
          </div>
        </Link>

        {/* 3. Meet Our Team Tab */}
        <Link
          to="team/executive-committee"
          onClick={triggerHaptic}
          className={`relative flex-1 min-h-[46px] py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer text-center min-w-0 ${
            isTeamActive && !isMenuOpen ? 'text-[#006A4E]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isTeamActive && !isMenuOpen && (
            <motion.div
              layoutId="activeMobileDockPill"
              className="absolute inset-0 bg-[#E6F3EF] rounded-full border border-[#C2E2D7] shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Users className={`w-4 h-4 shrink-0 transition-transform ${isTeamActive && !isMenuOpen ? 'text-[#006A4E] scale-105' : 'text-slate-500'}`} />
          <span className={`text-[10px] tracking-tight leading-none truncate max-w-full ${isTeamActive && !isMenuOpen ? 'font-extrabold text-[#006A4E]' : 'font-medium text-slate-700'}`}>
            {isBn ? 'আমাদের টিম' : 'Our Team'}
          </span>
        </Link>

        {/* 4. More (Drawer Toggle) Tab */}
        <button
          type="button"
          onClick={handleToggleMenu}
          className={`relative flex-1 min-h-[46px] py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer text-center min-w-0 ${
            isMenuOpen ? 'text-[#006A4E]' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label={isMenuOpen ? (isBn ? 'মেনু বন্ধ করুন' : 'Close menu') : (isBn ? 'আরও মেনু বিকল্প' : 'More menu options')}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          {isMenuOpen && (
            <motion.div
              layoutId="activeMobileDockPill"
              className="absolute inset-0 bg-[#E6F3EF] rounded-full border border-[#C2E2D7] shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          {isMenuOpen ? (
            <X className="w-4 h-4 shrink-0 text-[#006A4E]" />
          ) : (
            <Menu className="w-4 h-4 shrink-0 text-slate-600" />
          )}
          <span className={`text-[10px] tracking-tight leading-none truncate max-w-full ${isMenuOpen ? 'font-extrabold text-[#006A4E]' : 'font-medium text-slate-700'}`}>
            {isMenuOpen ? (isBn ? 'বন্ধ' : 'Close') : (isBn ? 'আরও' : 'More')}
          </span>
        </button>
      </motion.nav>
    </div>
  );
};
