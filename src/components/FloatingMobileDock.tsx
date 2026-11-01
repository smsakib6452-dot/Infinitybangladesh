import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useRouter } from '../context/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { Droplet, Users, Home, Menu, X } from 'lucide-react';

export const FloatingMobileDock: React.FC = () => {
  const { currentPage } = useRouter();
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

  // Do not obstruct admin dashboard or full-screen workflows
  if (currentPage === 'admin') return null;

  const handleToggleMenu = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

  const isHomeActive = currentPage === 'home' || !currentPage;
  const isBloodActive = currentPage.startsWith('blood-donation');
  const isTeamActive = currentPage.startsWith('team');

  return (
    <div className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <motion.nav
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.1 }}
        className="pointer-events-auto flex items-center justify-around gap-1 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-[#EAE3D9] shadow-[0_12px_36px_rgba(0,106,78,0.14)] text-slate-700 max-w-sm w-full mx-auto"
        role="navigation"
        aria-label={isBn ? 'মোবাইল দ্রুত নেভিগেশন ডক' : 'Mobile Quick Action Navigation'}
      >
        {/* 1. Home Tab */}
        <Link
          to="home"
          className={`relative flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer select-none text-center min-w-0 ${
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
          <Home className={`w-4 h-4 shrink-0 ${isHomeActive && !isMenuOpen ? 'text-[#006A4E]' : 'text-slate-500'}`} />
          <span className={`text-[10px] tracking-tight leading-none ${isHomeActive && !isMenuOpen ? 'font-extrabold text-[#006A4E]' : 'font-medium text-slate-700'}`}>
            {isBn ? 'হোম' : 'Home'}
          </span>
        </Link>

        {/* 2. Blood (LifeLine) Tab */}
        <Link
          to="blood-donation"
          className={`relative flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer select-none text-center min-w-0 ${
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
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[10px] tracking-tight ${isBloodActive && !isMenuOpen ? 'font-extrabold text-rose-700' : 'font-semibold text-slate-800'}`}>
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
          className={`relative flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer select-none text-center min-w-0 ${
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
          <Users className={`w-4 h-4 shrink-0 ${isTeamActive && !isMenuOpen ? 'text-[#006A4E]' : 'text-slate-500'}`} />
          <span className={`text-[10px] tracking-tight leading-none ${isTeamActive && !isMenuOpen ? 'font-extrabold text-[#006A4E]' : 'font-medium text-slate-700'}`}>
            {isBn ? 'আমাদের টিম' : 'Our Team'}
          </span>
        </Link>

        {/* 4. More (Drawer Toggle) Tab */}
        <button
          type="button"
          onClick={handleToggleMenu}
          className={`relative flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer select-none text-center min-w-0 ${
            isMenuOpen ? 'text-[#006A4E]' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label={isMenuOpen ? (isBn ? 'মেনু বন্ধ করুন' : 'Close menu') : (isBn ? 'আরও মেনু খুলুন' : 'Open more menu options')}
          aria-expanded={isMenuOpen}
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
          <span className={`text-[10px] tracking-tight leading-none ${isMenuOpen ? 'font-extrabold text-[#006A4E]' : 'font-medium text-slate-700'}`}>
            {isMenuOpen ? (isBn ? 'বন্ধ' : 'Close') : (isBn ? 'আরও' : 'More')}
          </span>
        </button>
      </motion.nav>
    </div>
  );
};
