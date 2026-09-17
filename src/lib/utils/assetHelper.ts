/**
 * Helper to resolve asset URLs across different hosting environments
 * (e.g. GitHub Pages subpaths '/Infinitybanagladesh/', root domains, and Vercel)
 */
export const getAssetUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

export const FALLBACK_LOGO_URL = getAssetUrl('brand/infinity-logo.png');

/**
 * Safe error handler for HTML images.
 * Immediately unbinds onerror to prevent infinite repaint and flickering loops.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallbackUrl: string = FALLBACK_LOGO_URL): void => {
  const target = e.currentTarget;
  if (!target) return;
  target.onerror = null; // PREVENT RECURSIVE FLICKER LOOP
  target.src = fallbackUrl;
};

