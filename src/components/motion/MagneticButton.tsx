import React, { useRef } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
import { Link } from '../../context/RouterContext';

export interface MagneticButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
  isExternal?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  to,
  onClick,
  children,
  variant = 'primary',
  className = '',
  isExternal = false,
  type = 'button',
  disabled = false
}) => {
  const btnRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Smooth spring physics for magnetic cursor attraction
  const x = useSpring(0, { stiffness: 350, damping: 22 });
  const y = useSpring(0, { stiffness: 350, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !btnRef.current || disabled) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Attract towards cursor by up to 8px
    const distanceX = (e.clientX - centerX) * 0.18;
    const distanceY = (e.clientY - centerY) * 0.18;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variantStyles = {
    primary:
      'bg-[#006A4E] hover:bg-[#00523C] text-white shadow-[0_8px_20px_-4px_rgba(0,106,78,0.4)] border border-emerald-400/20',
    secondary:
      'bg-white hover:bg-[#FAF7F2] active:bg-[#F2ECE1] text-slate-800 border border-[#D8CFC4] hover:border-[#006A4E] hover:text-[#006A4E] shadow-2xs',
    outline:
      'bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white/60 shadow-xs',
    danger:
      'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-[0_8px_20px_-4px_rgba(225,29,72,0.4)] border border-rose-400/20'
  };

  const innerContent = (
    <motion.div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: shouldReduceMotion ? 0 : x, y: shouldReduceMotion ? 0 : y }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-colors cursor-pointer select-none overflow-hidden group touch-manipulation ${
        variantStyles[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      {/* Radiant Sweep Shimmer Highlight */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} isExternal={isExternal} className="inline-block">
        {innerContent}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-block bg-transparent p-0 border-0">
      {innerContent}
    </button>
  );
};

