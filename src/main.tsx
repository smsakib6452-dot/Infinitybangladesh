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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
