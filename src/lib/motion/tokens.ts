/**
 * Unified Physics Spring & Motion Design Tokens
 * 
 * Benchmarked against Linear, Apple, and Vercel design standards.
 * All transitions prioritize 60fps hardware-accelerated transforms (opacity, transform)
 * and provide mathematically balanced spring dynamics (stiffness, damping, mass).
 */

export const spring = {
  /**
   * Snappy: Fast, immediate tactile response with minimal overshoot.
   * Ideal for buttons, micro-toggles, pills, tabs, and icon clicks.
   */
  snappy: {
    type: 'spring' as const,
    stiffness: 520,
    damping: 34,
    mass: 0.8,
  },

  /**
   * Smooth: Natural, organic deceleration with a balanced curve.
   * Ideal for cards, modals, flyouts, and list reveals.
   */
  smooth: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 28,
    mass: 1,
  },

  /**
   * Gentle: Soft, expansive and cinematic motion.
   * Ideal for hero headers, large spatial surfaces, and full-bleed image reveals.
   */
  gentle: {
    type: 'spring' as const,
    stiffness: 130,
    damping: 22,
    mass: 1.1,
  },

  /**
   * Bouncy: Energetic rebound with a noticeable physical bounce.
   * Ideal for celebratory alerts, badges, success checkmarks, and notification pings.
   */
  bouncy: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 18,
    mass: 0.8,
  },
} as const;

export const stagger = {
  tight: 0.04,
  base: 0.08,
  relaxed: 0.14,
} as const;

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.55,
  cinematic: 0.85,
} as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
  appleSmooth: [0.25, 0.1, 0.25, 1] as const,
} as const;

/**
 * Common Entrance Animation Variants
 */
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.smooth,
  },
};

export const fadeInScaleVariants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.smooth,
  },
};

export const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.base,
      delayChildren: 0.06,
    },
  },
};

export const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.smooth,
  },
};

