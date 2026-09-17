import React, { useEffect, useState, useRef } from 'react';

/**
 * CustomCursor: Ultra-lightweight, GPU-accelerated desktop cursor.
 * - Auto-disabled on touch/mobile devices & coarse pointer devices.
 * - Auto-disabled when prefers-reduced-motion is active.
 * - pointer-events: none ensures zero interference with links, inputs, and modals.
 */
export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState<'default' | 'pointer' | 'view' | 'text'>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');

  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);
  const isLoopRunning = useRef(false);

  useEffect(() => {
    // Check if device supports fine hover (desktop/mouse) and not reduced motion
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    // Smooth lerp loop for the outer follower ring; auto-pauses when at rest
    const renderLoop = () => {
      const ease = 0.22;
      const dx = mousePos.current.x - followerPos.current.x;
      const dy = mousePos.current.y - followerPos.current.y;

      if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
        followerPos.current.x = mousePos.current.x;
        followerPos.current.y = mousePos.current.y;
        if (followerRef.current) {
          followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0)`;
        }
        isLoopRunning.current = false;
        rafId.current = null;
        return;
      }

      followerPos.current.x += dx * ease;
      followerPos.current.y += dy * ease;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    const startLoopIfNeeded = () => {
      if (!isLoopRunning.current) {
        isLoopRunning.current = true;
        rafId.current = requestAnimationFrame(renderLoop);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);

      // Directly update the center dot position via GPU transform for zero latency
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Wake up the follower lerp loop on movement
      startLoopIfNeeded();

      // Check hovered element for cursor state
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], label, select, .cursor-pointer');
      const textInput = target.closest('input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[type="search"], textarea');
      const viewTrigger = target.closest('[data-cursor="view"], .gallery-lightbox-trigger');

      if (viewTrigger) {
        setCursorState('view');
        setCursorLabel('VIEW');
      } else if (textInput) {
        setCursorState('text');
        setCursorLabel('');
      } else if (interactive) {
        setCursorState('pointer');
        setCursorLabel('');
      } else {
        setCursorState('default');
        setCursorLabel('');
      }
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      isLoopRunning.current = false;
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* 1. Precise Center Dot */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-[#006A4E] pointer-events-none z-[99999] transition-opacity duration-200 ${
          visible && cursorState !== 'text' ? 'opacity-90' : 'opacity-0'
        } ${cursorState === 'view' ? 'scale-0' : 'scale-100'}`}
        style={{ willChange: 'transform' }}
      />

      {/* 2. Outer Smooth Follower Ring */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[99998] transition-[opacity,width,height,margin,background-color,border-color] duration-200 ease-out flex items-center justify-center ${
          visible && cursorState !== 'text' ? 'opacity-100' : 'opacity-0'
        } ${
          cursorState === 'pointer'
            ? '-ml-5 -mt-5 w-10 h-10 rounded-full border border-[#006A4E]/60 bg-[#006A4E]/10 backdrop-blur-[0.5px]'
            : cursorState === 'view'
            ? '-ml-7 -mt-7 w-14 h-14 rounded-full bg-[#006A4E] text-white text-[10px] font-bold tracking-widest uppercase shadow-lg'
            : '-ml-3.5 -mt-3.5 w-7 h-7 rounded-full border border-[#006A4E]/30 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      >
        {cursorState === 'view' && cursorLabel && (
          <span className="select-none pointer-events-none">{cursorLabel}</span>
        )}
      </div>
    </>
  );
};
