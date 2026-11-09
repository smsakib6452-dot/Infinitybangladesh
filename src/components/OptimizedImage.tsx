import React, { useState } from 'react';
import { getAssetUrl, FALLBACK_LOGO_URL, handleImageError } from '../lib/utils/assetHelper';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  /** Fixed or maximum display width in pixels for srcset generation & CDN optimization */
  width?: number | string;
  /** Fixed display height in pixels */
  height?: number | string;
  /** Optional aspect ratio (e.g. "16/9", "4/3", "1/1") to preserve layout and prevent CLS */
  aspectRatio?: string;
  /** Mark as high priority for Largest Contentful Paint (LCP) elements like hero banners */
  priority?: boolean;
  /** Custom fallback image if source fails to load */
  fallbackSrc?: string;
  /** Specific crop or focal position (e.g. "center 20%", "top center") */
  cropPosition?: string;
  /** Cloudinary quality parameter (default: "auto:eco") */
  quality?: string | number;
  /** Maximum candidate width in srcset (default: 800 to prevent oversized downloads on high-DPI mobile) */
  maxCandidateWidth?: number;
}

/**
 * Builds an optimized Cloudinary delivery URL with f_auto, q_auto:eco, and dimensional constraints.
 */
export function buildCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
  } = {}
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const parts = url.split('/upload/');
  if (parts.length < 2) return url;

  const prefix = parts[0] + '/upload';
  let remainder = parts.slice(1).join('/upload/');

  // Assemble transformation directives
  const transforms: string[] = ['f_auto', `q_${options.quality || 'auto:eco'}`];

  if (options.format) {
    transforms[0] = `f_${options.format}`;
  }

  if (options.width) {
    transforms.push(`w_${Math.round(options.width)}`);
  }

  if (options.height) {
    transforms.push(`h_${Math.round(options.height)}`);
  }

  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  } else if (options.width || options.height) {
    transforms.push('c_limit');
  }

  const transformStr = transforms.join(',');

  // If URL already contains an existing automated transformation segment, strip it
  if (remainder.startsWith('f_auto') || remainder.startsWith('w_') || remainder.startsWith('q_')) {
    const slashIdx = remainder.indexOf('/');
    if (slashIdx !== -1) {
      remainder = remainder.slice(slashIdx + 1);
    }
  }

  return `${prefix}/${transformStr}/${remainder}`;
}

/**
 * Generates responsive srcset for Cloudinary images capped at mobile budget.
 */
function generateCloudinarySrcSet(
  url: string,
  maxCandidateWidth: number = 800,
  quality: string | number = 'auto:eco'
): string | undefined {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return undefined;
  }

  // Standard candidate widths: 480w for 1x mobile/cards, 800w cap for DPR 2-3 phones. 1200w only for full-width desktop
  const widths = [480, 800];
  if (maxCandidateWidth >= 1200) {
    widths.push(1200);
  }

  return widths
    .map(w => `${buildCloudinaryUrl(url, { width: w, quality })} ${w}w`)
    .join(', ');
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  sizes,
  loading,
  priority = false,
  fetchPriority,
  decoding,
  className = '',
  style = {},
  fallbackSrc = FALLBACK_LOGO_URL,
  cropPosition,
  quality = 'auto:eco',
  maxCandidateWidth = 800,
  onError,
  ...restProps
}) => {
  const [hasError, setHasError] = useState(false);

  // Resolve asset URL across relative paths and environment base URLs
  const resolvedSrc = getAssetUrl(src);

  if (!resolvedSrc || hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt || 'Infinity Bangladesh'}
        className={className}
        style={{
          aspectRatio: aspectRatio || style.aspectRatio,
          objectPosition: cropPosition || style.objectPosition,
          ...style
        }}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        {...restProps}
      />
    );
  }

  const isCloudinary = resolvedSrc.includes('cloudinary.com') && resolvedSrc.includes('/upload/');
  const numericWidth = typeof width === 'number' ? width : typeof width === 'string' && !isNaN(Number(width)) ? Number(width) : undefined;
  const numericHeight = typeof height === 'number' ? height : typeof height === 'string' && !isNaN(Number(height)) ? Number(height) : undefined;

  // Optimized base src (800w safe default for crisp DPR 2 mobile/tablet with eco compression)
  const baseTargetWidth = numericWidth ? Math.min(numericWidth, maxCandidateWidth) : Math.min(800, maxCandidateWidth);
  const optimizedSrc = isCloudinary
    ? buildCloudinaryUrl(resolvedSrc, {
        width: baseTargetWidth,
        height: numericHeight,
        quality
      })
    : resolvedSrc;

  // Responsive srcset capped according to container requirement
  const srcSet = isCloudinary
    ? generateCloudinarySrcSet(resolvedSrc, maxCandidateWidth, quality)
    : undefined;

  // Default responsive sizes if none provided
  const computedSizes = sizes || (srcSet ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined);

  // Eager for LCP priority elements, lazy for everything else
  const computedLoading = priority ? 'eager' : loading || 'lazy';
  const computedFetchPriority = priority ? 'high' : fetchPriority || 'auto';
  const computedDecoding = priority ? 'sync' : decoding || 'async';

  const combinedStyle: React.CSSProperties = {
    ...style
  };

  if (aspectRatio) {
    combinedStyle.aspectRatio = aspectRatio;
  }
  if (cropPosition) {
    combinedStyle.objectPosition = cropPosition;
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    handleImageError(e, fallbackSrc);
    if (onError) onError(e);
  };

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={computedSizes}
      alt={alt}
      width={width}
      height={height}
      loading={computedLoading}
      fetchPriority={computedFetchPriority}
      decoding={computedDecoding}
      className={className}
      style={combinedStyle}
      onError={handleError}
      {...restProps}
    />
  );
};
