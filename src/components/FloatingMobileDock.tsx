import React from 'react';
import { motion } from 'motion/react';
import { Link, useRouter } from '../context/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { Droplet, Heart, Users, Home } from 'lucide-react';

export const FloatingMobileDock: React.FC = () => {
  const { currentPage } = useRouter();
  const { isBn } = useLanguage();

  // Do not obstruct admin dashboard or full-screen workflows
  if (currentPage === 'admin') return null;

  const NAV_ITEMS = [
    {
      id: 'home',
      label: isBn ? 'হোম' : 'Home',
      subLabel: null,
      path: 'home',
      icon: Home,
      highlight: false
    },
    {
      id: 'blood',
      label: isBn ? 'রক্তদান' : 'Blood',
      subLabel: '(LifeLine)',
      path: 'blood-donation',
      icon: Droplet,
      highlight: true
    },
    {
      id: 'donate',
      label: isBn ? 'অনুদান' : 'Donate',
      subLabel: null,
      path: 'donate',
      icon: Heart,
      highlight: false
    },
    {
      id: 'volunteer',
      label: isBn ? 'স্বেচ্ছাসেবী' : 'Volunteer',
      subLabel: null,
      path: 'volunteer',
      icon: Users,
      highlight: false
    }
  ];

  return (
    <div className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <motion.nav
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.1 }}
        className="pointer-events-auto flex items-center justify-around gap-1 px-2.5 py-1.5 rounded-full bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.45)] text-white max-w-sm w-full mx-auto"
        role="navigation"
        aria-label={isBn ? 'মোবাইল দ্রুত নেভিগেশন ডক' : 'Mobile Quick Action Navigation'}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPage === item.path ||
            (item.path === 'home' && (currentPage === 'home' || !currentPage)) ||
            (item.path === 'blood-donation' && currentPage.startsWith('blood-donation'));

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation cursor-pointer select-none text-center min-w-0 ${
                isActive ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileDockPill"
                  className="absolute inset-0 bg-white/20 rounded-full border border-white/25 shadow-inner -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className={`relative shrink-0 ${item.highlight ? 'text-rose-400' : isActive ? 'text-emerald-300' : 'text-slate-300'}`}>
                <Icon className="w-4 h-4" />
                {item.highlight && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>

              <div className="flex flex-col items-center leading-none">
                <span className={`text-[10px] tracking-tight ${isActive ? 'font-extrabold text-white' : 'font-medium text-slate-200'}`}>
                  {item.label}
                </span>
                {item.subLabel && (
                  <span className="text-[7.5px] font-mono font-bold text-rose-300 tracking-tighter mt-0.5 leading-none">
                    {item.subLabel}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
};
