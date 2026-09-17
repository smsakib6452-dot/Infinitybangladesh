import React from 'react';

/**
 * Robust React.lazy wrapper that automatically handles stale chunk load errors 
 * when a new version of the site is deployed to Vercel/GitHub Pages.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ [key: string]: any }>,
  exportName?: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const reloadKey = 'app-chunk-reload-timestamp';
    const lastReload = Number(sessionStorage.getItem(reloadKey) || '0');
    const now = Date.now();
    const hasRecentlyReloaded = now - lastReload < 15000; // 15 seconds debounce to avoid loops

    try {
      const module = await componentImport();
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      if (module.default) {
        return { default: module.default };
      }
      return module as { default: T };
    } catch (error: any) {
      const errorMsg = String(error?.message || error || '');
      const isChunkLoadFailed =
        error?.name === 'ChunkLoadError' ||
        /failed to fetch dynamically imported module/i.test(errorMsg) ||
        /dynamically imported module/i.test(errorMsg) ||
        /loading chunk/i.test(errorMsg) ||
        /error loading dynamically imported module/i.test(errorMsg);

      if (isChunkLoadFailed && !hasRecentlyReloaded) {
        sessionStorage.setItem(reloadKey, String(now));
        console.warn('Stale chunk detected following a new deployment. Auto-reloading page...', error);
        window.location.reload();
        // Return a promise that never resolves while the page reloads
        return new Promise<{ default: T }>(() => {});
      }

      throw error;
    }
  });
}
