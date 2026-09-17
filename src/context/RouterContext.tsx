import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [subSlug, setSubSlug] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync with URL hash or pathname for reload/back button
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#/', '').replace('#', '');
      if (!rawHash) {
        setCurrentPage('home');
        setCurrentSlug(null);
        setSubSlug(null);
        setQueryParams({});
        return;
      }

      // Handle query params in hash (e.g. gallery?event=pevt-eid-2024 or team/past-committees?id=comm-exec-2025)
      const [hashPath, queryString] = rawHash.split('?');
      let queryParamSlug: string | null = null;
      const parsedParams: Record<string, string> = {};
      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((val, key) => {
          parsedParams[key] = val;
        });
        queryParamSlug = searchParams.get('id') || searchParams.get('year') || searchParams.get('comm') || searchParams.get('event') || searchParams.get('program');
      }
      setQueryParams(parsedParams);

      const parts = hashPath.split('/');
      if (parts.length === 1) {
        if (
          parts[0] === 'team' ||
          parts[0] === 'executive-committee' ||
          parts[0] === 'standing-committee' ||
          parts[0] === 'past-committees'
        ) {
          setCurrentPage('team');
          setCurrentSlug(queryParamSlug);
          setSubSlug(null);
        } else {
          setCurrentPage(parts[0] as PageRoute);
          setCurrentSlug(queryParamSlug);
          setSubSlug(null);
        }
      } else if (parts.length >= 2) {
        const root = parts[0];
        const sub = parts[1];
        const extra = parts[2] || queryParamSlug;

        if (root === 'about') {
          if (sub === 'standing-committees' || sub === 'standing-committee') {
            setCurrentPage('about/standing-committees');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          } else if (sub === 'executive-committee') {
            setCurrentPage('about/executive-committee');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          } else if (sub === 'past-committees') {
            setCurrentPage('about/past-committees');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          } else {
            setCurrentPage(`about/${sub}` as PageRoute);
            setCurrentSlug(extra || null);
            setSubSlug(null);
          }
        } else if (root === 'team') {
          if (sub === 'executive-committee') {
            setCurrentPage('about/executive-committee');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          } else if (sub === 'standing-committee' || sub === 'standing-committees') {
            setCurrentPage('about/standing-committees');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          } else if (sub === 'past-committees') {
            setCurrentPage('about/past-committees');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          } else {
            setCurrentPage('team');
            setCurrentSlug(extra || null);
            setSubSlug(null);
          }
        } else if (root === 'campaigns') {
          setCurrentPage('campaigns/detail');
          setCurrentSlug(sub);
          setSubSlug(null);
        } else if (root === 'programs') {
          if (parts.length >= 3) {
            setCurrentPage('programs/event-detail');
            setCurrentSlug(sub);
            setSubSlug(parts[2]);
          } else {
            setCurrentPage('programs/detail');
            setCurrentSlug(sub);
            setSubSlug(null);
          }
        } else if (root === 'stories') {
          setCurrentPage('stories/detail');
          setCurrentSlug(sub);
          setSubSlug(null);
        } else if (root === 'news') {
          setCurrentPage('news/detail');
          setCurrentSlug(sub);
          setSubSlug(null);
        } else if (root === 'events') {
          setCurrentPage('events/detail');
          setCurrentSlug(sub);
          setSubSlug(null);
        } else {
          setCurrentPage(hashPath as PageRoute);
          setCurrentSlug(extra || null);
          setSubSlug(null);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: PageRoute, slug: string | null = null, subSlugParam: string | null = null) => {
    setCurrentPage(page);
    setCurrentSlug(slug);
    setSubSlug(subSlugParam);
    window.scrollTo(0, 0);

    let hash: string = page;
    if (page === 'campaigns/detail' && slug) hash = `campaigns/${slug}`;
    if (page === 'programs/event-detail' && slug && subSlugParam) hash = `programs/${slug}/${subSlugParam}`;
    else if (page === 'programs/detail' && slug) hash = `programs/${slug}`;
    if (page === 'stories/detail' && slug) hash = `stories/${slug}`;
    if (page === 'news/detail' && slug) hash = `news/${slug}`;
    if (page === 'events/detail' && slug) hash = `events/${slug}`;
    if (page === 'gallery' && slug) hash = `gallery?event=${slug}`;
    if (page === 'about/past-committees' && slug) hash = `team/past-committees?id=${slug}`;
    if (page === 'team/past-committees' && slug) hash = `team/past-committees?id=${slug}`;

    window.location.hash = `/${hash === 'home' ? '' : hash}`;
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K search
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
        setIsSearchOpen
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

