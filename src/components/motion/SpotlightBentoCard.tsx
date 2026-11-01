import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

export interface SpotlightBentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  badge?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const SpotlightBentoCard: React.FC<SpotlightBentoCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(0, 106, 78, 0.12)',
  badge,
  variant = 'light'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isDark = variant === 'dark';

  // Mouse coordinate motion values
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Smooth spring physics for 3D card tilt
  const rotateX = useSpring(0, { stiffness: 280, damping: 28 });
  const rotateY = useSpring(0, { stiffness: 280, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);

    // Subtle 3D tilt calculation (-3.5deg to +3.5deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -3.5;
    const rotY = ((x - centerX) / centerX) * 3.5;

    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(-1000);
    mouseY.set(-1000);
    rotateX.set(0);
    rotateY.set(0);
  };

  const spotlightBg = useMotionTemplate`
    radial-gradient(
      380px circle at ${mouseX}px ${mouseY}px,
      ${glowColor},
      transparent 80%
    )
  `;

  const borderMask = useMotionTemplate`
    radial-gradient(
      220px circle at ${mouseX}px ${mouseY}px,
      black,
      transparent
    )
  `;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-3xl backdrop-blur-md transition-shadow duration-300 group overflow-hidden ${
        isDark
          ? 'bg-[#06241B]/95 border border-emerald-700/40 text-white shadow-lg shadow-black/30'
          : 'bg-white/95 border border-[#EAE3D9] text-slate-800 shadow-warm-xs'
      } ${
        isHovered
          ? isDark
            ? 'shadow-[0_20px_45px_-12px_rgba(16,185,129,0.25)] border-emerald-500/60'
            : 'shadow-[0_20px_45px_-12px_rgba(0,106,78,0.12)] border-[#006A4E]/35'
          : ''
      } ${className.includes('p-') ? '' : 'p-5 sm:p-7'} ${className}`}
    >
      {/* 1. Hardware-Accelerated Dynamic Spotlight Glow */}
      {!shouldReduceMotion && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
          style={{ background: spotlightBg }}
        />
      )}

      {/* 2. Specular Bevel Border Highlight */}
      {!shouldReduceMotion && (
        <motion.div
          className={`pointer-events-none absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isDark ? 'border-emerald-400/50' : 'border-white/80'
          }`}
          style={{
            maskImage: borderMask,
            WebkitMaskImage: borderMask,
          }}
        />
      )}

      {/* Optional Badge */}
      {badge && <div className="mb-3 sm:mb-4">{badge}</div>}

      {/* Card Content with subtle 3D depth pop */}
      <div style={{ transform: shouldReduceMotion ? 'none' : 'translateZ(10px)' }} className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

