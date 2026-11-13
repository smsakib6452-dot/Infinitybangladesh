import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-recover from stale bundle chunks on new Vercel/GitHub deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error (stale chunk after new deploy), auto-reloading...', event);
  const reloadKey = 'vite-preload-error-reload-time';
  const lastReload = Number(sessionStorage.getItem(reloadKey) || '0');
  const now = Date.now();
  if (now - lastReload > 12000) {
    sessionStorage.setItem(reloadKey, String(now));
    window.location.reload();
  }
});

// Pause infinite CSS animations when offscreen to conserve mobile CPU/battery
if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const ANIM_SELECTOR =
    '.animate-ping, .animate-pulse, .animate-spin, .animate-bounce, .animate-heartbeat, .animate-ambient-shimmer, .animate-lifeline-ripple, .animate-lifeline-glow, .animate-blob, .animate-float';

  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('anim-paused');
        } else {
          entry.target.classList.add('anim-paused');
        }
      });
    },
    { rootMargin: '50px' }
  );

  const observeAnimElements = () => {
    document.querySelectorAll(ANIM_SELECTOR).forEach((el) => animObserver.observe(el));

    // Keep observer in sync with React dynamic DOM mutations (batched via rAF to avoid main-thread churn)
    if ('MutationObserver' in window) {
      let rafId: number | null = null;
      const pendingAddedNodes: Element[] = [];
      const pendingRemovedNodes: Element[] = [];

      const processPendingNodes = () => {
        rafId = null;
        for (let i = 0; i < pendingRemovedNodes.length; i++) {
          const el = pendingRemovedNodes[i];
          if (!el.isConnected) {
            if (el.matches?.(ANIM_SELECTOR)) animObserver.unobserve(el);
            el.querySelectorAll?.(ANIM_SELECTOR).forEach((child) => {
              if (!child.isConnected) animObserver.unobserve(child);
            });
          }
        }
        for (let i = 0; i < pendingAddedNodes.length; i++) {
          const el = pendingAddedNodes[i];
          if (!el.isConnected) continue;
          if (el.matches?.(ANIM_SELECTOR)) animObserver.observe(el);
          el.querySelectorAll?.(ANIM_SELECTOR).forEach((child) => {
            if (child.isConnected) animObserver.observe(child);
          });
        }
        pendingAddedNodes.length = 0;
        pendingRemovedNodes.length = 0;
      };

      const mutationObserver = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          for (let j = 0; j < m.addedNodes.length; j++) {
            const n = m.addedNodes[j];
            if (n.nodeType === Node.ELEMENT_NODE) pendingAddedNodes.push(n as Element);
          }
          for (let j = 0; j < m.removedNodes.length; j++) {
            const n = m.removedNodes[j];
            if (n.nodeType === Node.ELEMENT_NODE) pendingRemovedNodes.push(n as Element);
          }
        }

        if (rafId === null) {
          rafId = requestAnimationFrame(processPendingNodes);
        }
      });

      const rootTarget = document.getElementById('root') || document.body || document.documentElement;
      mutationObserver.observe(rootTarget, {
        childList: true,
        subtree: true,
      });

      window.addEventListener(
        'pagehide',
        () => {
          if (rafId !== null) cancelAnimationFrame(rafId);
          mutationObserver.disconnect();
          animObserver.disconnect();
        },
        { once: true }
      );
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAnimElements, { once: true });
  } else {
    setTimeout(observeAnimElements, 200);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
