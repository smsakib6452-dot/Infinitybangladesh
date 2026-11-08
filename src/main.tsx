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
    '.animate-heartbeat, .animate-ambient-shimmer, .animate-lifeline-ripple, .animate-lifeline-glow, .animate-pulse';

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
    { rootMargin: '80px' }
  );

  const handleNode = (node: Node, isAdd: boolean) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (el.matches?.(ANIM_SELECTOR)) {
      if (isAdd) animObserver.observe(el);
      else animObserver.unobserve(el);
    }
    el.querySelectorAll?.(ANIM_SELECTOR).forEach((child) => {
      if (isAdd) animObserver.observe(child);
      else animObserver.unobserve(child);
    });
  };

  const observeAnimElements = () => {
    document.querySelectorAll(ANIM_SELECTOR).forEach((el) => animObserver.observe(el));

    // Keep observer in sync with React dynamic DOM mutations
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => handleNode(node, true));
          mutation.removedNodes.forEach((node) => handleNode(node, false));
        });
      });

      const rootTarget = document.getElementById('root') || document.body || document.documentElement;
      mutationObserver.observe(rootTarget, {
        childList: true,
        subtree: true,
      });
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
