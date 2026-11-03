import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getAssetUrl } from '../../lib/utils/assetHelper';

interface LifeLineHeroLogoAnimationProps {
  logoUrl?: string;
  logoSize?: number;
  logoZoom?: number;
  logoCrop?: React.CSSProperties['objectFit'];
}

export const LifeLineHeroLogoAnimation: React.FC<LifeLineHeroLogoAnimationProps> = ({
  logoUrl = '/brand/Infinitylifeline-logo.svg',
  logoSize = 440,
  logoZoom = 1,
  logoCrop = 'contain'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'falling' | 'impact' | 'settled'>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Centroid calibrated to Infinitylifeline-logo.svg vector droplet
  // In viewBox 0 0 1903 826:
  // Droplet X: (289.33 + 517.33)/2 = 403.33 -> 403.33/1903 = 21.2%
  // Droplet Y: (205.83 + 525.33)/2 = 365.58 -> 365.58/826 = 44.3%
  const targetLeftPercent = 21.2;
  const targetTopPercent = 44.3;

  const triggerDropAnimation = useCallback(() => {
    if (shouldReduceMotion) {
      setPhase('settled');
      return;
    }

    setPhase('falling');

    // 1. 0 - 650ms: Drop falls smoothly under gravity
    // 2. 650ms: Lands precisely on droplet, triggers impact wave rings
    const tImpact = setTimeout(() => {
      setPhase('impact');
    }, 650);

    // 3. 2200ms: Waves smoothly dissipate, logo vector rests 100% crisp
    const tSettle = setTimeout(() => {
      setPhase('settled');
    }, 2200);

    return () => {
      clearTimeout(tImpact);
      clearTimeout(tSettle);
    };
  }, [shouldReduceMotion]);

  // Initial trigger + Gentle periodic heartbeat life-cycle (every 7.5 seconds)
  useEffect(() => {
    if (shouldReduceMotion) {
      setPhase('settled');
      return;
    }

    const initialTimer = setTimeout(() => {
      triggerDropAnimation();
    }, 400);

    const interval = setInterval(() => {
      setCycleCount(c => c + 1);
      triggerDropAnimation();
    }, 7500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerDropAnimation, shouldReduceMotion]);

  return (
    <div
      className="relative select-none cursor-pointer group"
      onClick={() => triggerDropAnimation()}
      title="Click to replay lifeline drop animation"
      style={{
        width: `${logoSize}px`,
        maxWidth: '100%'
      }}
    >
      {/* 1. Main Authentic Logo (Source of Truth - 100% Crisp & Preserved) */}
      <div className="relative w-full overflow-visible">
        <img
          src={getAssetUrl(logoUrl)}
          alt="Infinity LifeLine - One Drop, Infinity Hope"
          style={{
            transform: `scale(${logoZoom})`,
            transformOrigin: 'left center',
            objectFit: logoCrop
          }}
          className="w-full h-auto object-contain mx-auto lg:mx-0 drop-shadow-md transition-all duration-200"
          loading="eager"
        />

        {/* 2. DYNAMIC FALLING DROP & IMPACT LAYER */}
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {/* A. Organic Blood Drop Falling from the Top */}
          {phase === 'falling' && (
            <motion.div
              key={`falling-drop-${cycleCount}`}
              initial={{
                y: -65,
                scaleY: 1.3,
                scaleX: 0.85,
                opacity: 0
              }}
              animate={{
                y: 0,
                scaleY: [1.3, 1.15, 0.95],
                scaleX: [0.85, 0.95, 1.1],
                opacity: [0, 0.95, 1]
              }}
              transition={{
                duration: 0.65,
                ease: [0.45, 0, 0.7, 1]
              }}
              style={{
                position: 'absolute',
                left: `${targetLeftPercent}%`,
                top: `${targetTopPercent}%`
              }}
              className="z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 24 32"
                className="w-5 h-7 filter drop-shadow-[0_4px_10px_rgba(255,30,68,0.7)]"
                fill="none"
              >
                <defs>
                  <linearGradient id={`bloodDropGrad-${cycleCount}`} x1="12" y1="0" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF6B8B" />
                    <stop offset="40%" stopColor="#FF1E44" />
                    <stop offset="100%" stopColor="#8A0014" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 C12 2, 2 15, 2 22 C2 27.52 6.48 32 12 32 C17.52 32 22 27.52 22 22 C22 15, 12 2, 12 2 Z"
                  fill={`url(#bloodDropGrad-${cycleCount})`}
                />
                {/* Glossy specular reflection */}
                <ellipse cx="8.5" cy="18" rx="2" ry="4.5" fill="white" opacity="0.6" transform="rotate(-15 8.5 18)" />
              </svg>
            </motion.div>
          )}

          {/* B. Impact Shockwave Ripples (Outward radiating on landing, ZERO tagline collision) */}
          {phase === 'impact' && (
            <>
              {/* Primary Crimson Impact Ripple */}
              <motion.div
                key={`impact-crimson-${cycleCount}`}
                initial={{ scale: 0.7, opacity: 0.9 }}
                animate={{ scale: 1.45, opacity: 0 }}
                transition={{
                  duration: 1.4,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  left: `${targetLeftPercent}%`,
                  top: `${targetTopPercent}%`
                }}
                className="z-10 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[44px] rounded-[48%] border-2 border-[#FF1E44]/80 shadow-[0_0_12px_rgba(255,30,68,0.5)] pointer-events-none bg-transparent"
              />

              {/* Secondary Emerald Resonance Ripple */}
              <motion.div
                key={`impact-emerald-${cycleCount}`}
                initial={{ scale: 0.75, opacity: 0.75 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{
                  duration: 1.6,
                  delay: 0.15,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  left: `${targetLeftPercent}%`,
                  top: `${targetTopPercent}%`
                }}
                className="z-10 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[44px] rounded-[48%] border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.4)] pointer-events-none bg-transparent"
              />
            </>
          )}

          {/* C. Ambient Living Pulse (Gentle rhythmic breathing between cycles, zero fill to preserve crisp vector) */}
          <motion.div
            animate={{
              scale: [0.98, 1.06, 0.98],
              opacity: [0.25, 0.55, 0.25]
            }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: `${targetLeftPercent}%`,
              top: `${targetTopPercent}%`
            }}
            className="z-5 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[46px] rounded-[46%] border border-rose-500/30 pointer-events-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};
