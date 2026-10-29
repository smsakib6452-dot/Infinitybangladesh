import React from 'react';
import { useRouter } from '../context/RouterContext';
import { PageRoute } from '../types';

export function getHref(to?: PageRoute | string, slug?: string | null): string {
  if (!to) return '/';
  
  const toStr = String(to).trim();
  
  if (
    toStr.startsWith('http://') ||
    toStr.startsWith('https://') ||
    toStr.startsWith('mailto:') ||
    toStr.startsWith('tel:')
  ) {
    return toStr;
  }

  // Strip leading '#' or '/'
  const clean = toStr.replace(/^#\/?/, '').replace(/^\//, '');

  if (!clean || clean === 'home') {
    return '/';
  }

  if (clean === 'campaigns/detail' && slug) {
    return `/campaigns/${slug}`;
  }
  if (clean === 'programs/detail' && slug) {
    return `/programs/${slug}`;
  }
  if (clean === 'stories/detail' && slug) {
    return `/stories/${slug}`;
  }
  if (clean === 'news/detail' && slug) {
    return `/news/${slug}`;
  }
  if (clean === 'events/detail' && slug) {
    return `/events/${slug}`;
  }
  if (clean === 'gallery' && slug) {
    return `/gallery?event=${encodeURIComponent(slug)}`;
  }
  if ((clean === 'about/past-committees' || clean === 'team/past-committees') && slug) {
    return `/team/past-committees?id=${encodeURIComponent(slug)}`;
  }

  return `/${clean}`;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: PageRoute | string;
  slug?: string | null;
  isExternal?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to = 'home', slug = null, isExternal, onClick, target, rel, children, className = '', ...rest }, ref) => {
    const { navigate } = useRouter();

    const isExplicitExternal =
      isExternal ||
      (typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://')));

    const computedHref = getHref(to, slug);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e);
      }

      // If default was prevented by onClick or user opened in new tab with modifier keys / middle click
      if (e.defaultPrevented || isExplicitExternal || target === '_blank') {
        return;
      }

      // Allow standard browser new tab/window keyboard shortcuts (Ctrl+Click, Cmd+Click, Shift+Click, Alt+Click, middle mouse button)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      // Smooth client-side HTML5 History routing for normal left clicks
      e.preventDefault();
      navigate(to as PageRoute, slug);
    };

    const finalTarget = isExplicitExternal ? target || '_blank' : target;
    const finalRel = isExplicitExternal ? rel || 'noopener noreferrer' : rel;

    return (
      <a
        ref={ref}
        href={computedHref}
        target={finalTarget}
        rel={finalRel}
        onClick={handleClick}
        className={className}
        {...rest}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';
