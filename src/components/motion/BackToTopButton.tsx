import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Back to Top"
          className="fixed bottom-4 left-4 sm:bottom-24 sm:right-6 z-40 p-3 sm:p-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] active:bg-[#00402E] text-white shadow-warm-lg hover:shadow-warm-xl border border-emerald-600/30 transition-all cursor-pointer group flex items-center justify-center touch-manipulation active:scale-95"
        >
          <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
