import React, { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number; // duration in seconds, e.g. 1.8
  className?: string;
}

/**
 * AnimatedCounter
 *
 * The final value is always present in the DOM via `data-target` and `aria-label`
 * so crawlers, screen readers, and noscript users always read the real number.
 * The count-up animation is purely visual (aria-hidden on the animated span).
 */

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.8,
  className = ''
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const shouldReduceMotion = useReducedMotion();
  const finalValue = String(value);
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (typeof value === 'number') return '0';
    return String(value).replace(/\d+/g, '0');
  });

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) {
        setDisplayValue(finalValue);
      }
      return;
    }

    const valStr = finalValue;

    // Special ratio case e.g. "8/8"
    if (valStr.includes('/')) {
      const parts = valStr.split('/');
      const numTarget = parseInt(parts[0].replace(/,/g, ''), 10);
      const denom = parts[1];
      if (isNaN(numTarget)) {
        setDisplayValue(valStr);
        return;
      }

      let startTime: number | null = null;
      let animFrameId: number;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        // easeOutExpo curve
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentNum = Math.round(easeProgress * numTarget);
        setDisplayValue(`${currentNum}/${denom}`);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(valStr);
        }
      };

      animFrameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animFrameId);
    }

    // Extract numbers, prefixes, suffixes (e.g. "+", "৳", "%", "k", "M")
    const match = valStr.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
    if (!match) {
      setDisplayValue(valStr);
      return;
    }

    const prefix = match[1] || '';
    const numRaw = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetNum = parseFloat(numRaw);
    const hasDecimals = numRaw.includes('.');
    const decimalPlaces = hasDecimals ? numRaw.split('.')[1].length : 0;
    const hasCommas = match[2].includes(',');

    if (isNaN(targetNum)) {
      setDisplayValue(valStr);
      return;
    }

    let startTime: number | null = null;
    let animFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // easeOutExpo curve
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentNum = targetNum * easeProgress;

      let formattedNum = hasDecimals ? currentNum.toFixed(decimalPlaces) : Math.round(currentNum).toString();
      if (hasCommas) {
        const parts = formattedNum.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formattedNum = parts.join('.');
      }

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(valStr);
      }
    };

    animFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameId);
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    /*
     * Accessible Counter Pattern for CSR (Client-Side Rendered):
     * - sr-only span guarantees screen readers announce the final static number once
     * - aria-hidden animated span isolates visual number ticking from assistive technology
     * - data-target provides a persistent numerical hook for automated inspection
     */
    <span ref={ref} className={className} data-target={finalValue}>
      <span className="sr-only">{finalValue}</span>
      <span aria-hidden="true">{shouldReduceMotion ? finalValue : displayValue}</span>
    </span>
  );
};
