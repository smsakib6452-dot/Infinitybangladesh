import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type RevealEffect = 'fade-up' | 'fade-in' | 'scale-up' | 'slide-right' | 'slide-left';

interface ScrollRevealProps {
  children: React.ReactNode;
  effect?: RevealEffect;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  viewportMargin?: string;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  effect = 'fade-up',
  delay = 0,
  duration = 0.55,
  distance = 24,
  className = '',
  viewportMargin = '0px'
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Normalize delay: if passed as milliseconds (e.g. 100, 200), convert to seconds (0.1, 0.2)
  const normalizedDelay = delay >= 10 ? delay / 1000 : delay;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  // On mobile screens (<640px), horizontal sliding causes temporary horizontal viewport scrolling
  // Convert horizontal slide to subtle fade-up on mobile for zero horizontal overflow
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const safeEffect = isMobile && (effect === 'slide-right' || effect === 'slide-left') ? 'fade-up' : effect;

  const getInitial = () => {
    switch (safeEffect) {
      case 'fade-up':
        return { opacity: 0, y: isMobile ? 12 : distance };
      case 'fade-in':
        return { opacity: 0 };
      case 'scale-up':
        return { opacity: 0, scale: 0.96 };
      case 'slide-right':
        return { opacity: 0, x: -distance };
      case 'slide-left':
        return { opacity: 0, x: distance };
      default:
        return { opacity: 0, y: isMobile ? 12 : distance };
    }
  };

  const getAnimate = () => {
    switch (safeEffect) {
      case 'fade-up':
        return { opacity: 1, y: 0 };
      case 'fade-in':
        return { opacity: 1 };
      case 'scale-up':
        return { opacity: 1, scale: 1 };
      case 'slide-right':
        return { opacity: 1, x: 0 };
      case 'slide-left':
        return { opacity: 1, x: 0 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once: true, margin: viewportMargin as any, amount: 0.02 }}
      transition={{
        duration,
        delay: normalizedDelay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
