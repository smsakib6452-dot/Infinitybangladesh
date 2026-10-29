import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PageRoute } from '../types';

interface RouterContextType {
  currentPage: PageRoute;
  currentSlug: string | null;
  subSlug: string | null;
  queryParams: Record<string, string>;
  navigate: (page: PageRoute, slug?: string | null, subSlug?: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parseCurrentLocation(): {
  page: PageRoute;
  slug: string | null;
  subSlug: string | null;
  queryParams: Record<string, string>;
} {
  if (typeof window === 'undefined') {
    return { page: 'home', slug: null, subSlug: null, queryParams: {} };
  }

  let rawPath = '';
  let queryString = '';

  // 1. Check for legacy hash routes (e.g. #/about, #/blood-donation) and smoothly migrate
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  if (rawHash) {
    const [hPath, hQuery] = rawHash.split('?');
    rawPath = hPath || '';
    queryString = hQuery || '';

    // Cleanly migrate browser URL without page reload
    const cleanMigratedUrl = `/${rawPath}${queryString ? `?${queryString}` : ''}`;
    try {
      window.history.replaceState(null, '', cleanMigratedUrl);
    } catch {
      // Ignore in restricted environments
    }
  } else {
    // 2. Standard HTML5 pathname
    rawPath = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '').trim();
    queryString = window.location.search.replace(/^\?/, '').trim();
  }

  const parsedParams: Record<string, string> = {};
  let queryParamSlug: string | null = null;
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((val, key) => {
      parsedParams[key] = val;
    });
    queryParamSlug =
      searchParams.get('id') ||
      searchParams.get('year') ||
      searchParams.get('comm') ||
      searchParams.get('event') ||
      searchParams.get('program');
  }

  if (!rawPath || rawPath === 'home' || rawPath === 'index.html') {
    return {
      page: 'home',
      slug: null,
      subSlug: null,
      queryParams: parsedParams,
    };
  }

  const parts = rawPath.split('/').filter(Boolean);

  if (parts.length === 1) {
    const single = parts[0];
    if (single === 'standing-committee' || single === 'standing-committees') {
      return { page: 'about/standing-committees', slug: queryParamSlug, subSlug: null, queryParams: parsedParams };
    }
    if (single === 'executive-committee') {
      return { page: 'about/executive-committee', slug: queryParamSlug, subSlug: null, queryParams: parsedParams };
    }
    if (single === 'past-committees') {
      return { page: 'about/past-committees', slug: queryParamSlug, subSlug: null, queryParams: parsedParams };
    }
    if (single === 'team') {
      return { page: 'team', slug: queryParamSlug, subSlug: null, queryParams: parsedParams };
    }
    return { page: single as PageRoute, slug: queryParamSlug, subSlug: null, queryParams: parsedParams };
  }

  const root = parts[0];
  const sub = parts[1];
  const extra = parts[2] || queryParamSlug;

  if (root === 'about') {
    if (sub === 'standing-committees' || sub === 'standing-committee') {
      return { page: 'about/standing-committees', slug: extra || null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'executive-committee') {
      return { page: 'about/executive-committee', slug: extra || null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'past-committees') {
      return { page: 'about/past-committees', slug: extra || null, subSlug: null, queryParams: parsedParams };
    }
    return { page: `about/${sub}` as PageRoute, slug: extra || null, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'team') {
    if (sub === 'executive-committee') {
      return { page: 'about/executive-committee', slug: extra || null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'standing-committee' || sub === 'standing-committees') {
      return { page: 'about/standing-committees', slug: extra || null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'past-committees') {
      return { page: 'about/past-committees', slug: extra || null, subSlug: null, queryParams: parsedParams };
    }
    return { page: 'team', slug: extra || null, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'campaigns') {
    return { page: 'campaigns/detail', slug: sub, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'programs') {
    if (parts.length >= 3) {
      return { page: 'programs/event-detail', slug: sub, subSlug: parts[2], queryParams: parsedParams };
    }
    return { page: 'programs/detail', slug: sub, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'stories') {
    return { page: 'stories/detail', slug: sub, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'news') {
    return { page: 'news/detail', slug: sub, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'events') {
    return { page: 'events/detail', slug: sub, subSlug: null, queryParams: parsedParams };
  }

  if (root === 'blood-donation') {
    if (sub === 'emergency-request') {
      return { page: 'blood-donation/emergency-request', slug: null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'become-donor') {
      return { page: 'blood-donation/become-donor', slug: null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'find-donor') {
      return { page: 'blood-donation/find-donor', slug: null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'statistics') {
      return { page: 'blood-donation/statistics', slug: null, subSlug: null, queryParams: parsedParams };
    }
    if (sub === 'update-donor') {
      return { page: 'blood-donation/update-donor', slug: null, subSlug: null, queryParams: parsedParams };
    }
    return { page: 'blood-donation', slug: null, subSlug: null, queryParams: parsedParams };
  }

  return { page: rawPath as PageRoute, slug: extra || null, subSlug: null, queryParams: parsedParams };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = parseCurrentLocation();
  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [currentSlug, setCurrentSlug] = useState<string | null>(initial.slug);
  const [subSlug, setSubSlug] = useState<string | null>(initial.subSlug);
  const [queryParams, setQueryParams] = useState<Record<string, string>>(initial.queryParams);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync with browser Back/Forward and URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const next = parseCurrentLocation();
      setCurrentPage(next.page);
      setCurrentSlug(next.slug);
      setSubSlug(next.subSlug);
      setQueryParams(next.queryParams);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = useCallback(
    (page: PageRoute, slug: string | null = null, subSlugParam: string | null = null) => {
      setCurrentPage(page);
      setCurrentSlug(slug);
      setSubSlug(subSlugParam);
      window.scrollTo(0, 0);

      let targetPath: string = page;
      if (page === 'campaigns/detail' && slug) targetPath = `campaigns/${slug}`;
      else if (page === 'programs/event-detail' && slug && subSlugParam) targetPath = `programs/${slug}/${subSlugParam}`;
      else if (page === 'programs/detail' && slug) targetPath = `programs/${slug}`;
      else if (page === 'stories/detail' && slug) targetPath = `stories/${slug}`;
      else if (page === 'news/detail' && slug) targetPath = `news/${slug}`;
      else if (page === 'events/detail' && slug) targetPath = `events/${slug}`;
      else if (page === 'gallery' && slug) targetPath = `gallery?event=${encodeURIComponent(slug)}`;
      else if (page === 'about/past-committees' && slug) targetPath = `team/past-committees?id=${encodeURIComponent(slug)}`;
      else if (page === 'team/past-committees' && slug) targetPath = `team/past-committees?id=${encodeURIComponent(slug)}`;

      const cleanUrl = targetPath === 'home' || targetPath === '' ? '/' : `/${targetPath}`;
      const currentFullUrl = window.location.pathname + window.location.search;

      if (currentFullUrl !== cleanUrl) {
        try {
          window.history.pushState(null, '', cleanUrl);
        } catch {
          window.location.hash = `/${targetPath === 'home' ? '' : targetPath}`;
        }
      }
    },
    []
  );

  // Global search modal shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        currentSlug,
        subSlug,
        queryParams,
        navigate,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export { Link, getHref } from '../components/Link';
export type { LinkProps } from '../components/Link';
