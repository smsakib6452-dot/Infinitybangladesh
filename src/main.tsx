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

  const observeAnimElements = () => {
    document
      .querySelectorAll('.animate-heartbeat, .animate-ambient-shimmer, .animate-lifeline-ripple, .animate-lifeline-glow, .animate-pulse')
      .forEach((el) => animObserver.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAnimElements, { once: true });
  } else {
    setTimeout(observeAnimElements, 500);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
