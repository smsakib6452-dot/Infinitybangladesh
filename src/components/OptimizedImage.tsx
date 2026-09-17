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
  /** Cloudinary quality parameter (default: "auto") */
  quality?: string | number;
}

/**
 * Builds an optimized Cloudinary delivery URL with f_auto, q_auto, and dimensional constraints.
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
  const transforms: string[] = ['f_auto', `q_${options.quality || 'auto'}`];

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
 * Generates responsive srcset for Cloudinary images.
 */
function generateCloudinarySrcSet(url: string, baseWidth?: number): string | undefined {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return undefined;
  }

  let widths: number[];
  if (baseWidth && baseWidth > 0) {
    // Generate fractional/multiples around the target display width
    widths = [
      Math.round(baseWidth * 0.5),
      Math.round(baseWidth),
      Math.round(baseWidth * 1.5),
      Math.round(baseWidth * 2)
    ].filter((w, i, arr) => w >= 150 && arr.indexOf(w) === i);
  } else {
    // Standard responsive widths
    widths = [360, 640, 768, 1024, 1280, 1536];
  }

  return widths
    .map(w => `${buildCloudinaryUrl(url, { width: w })} ${w}w`)
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
  quality = 'auto',
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

  // Optimized base src
  const optimizedSrc = isCloudinary
    ? buildCloudinaryUrl(resolvedSrc, {
        width: numericWidth,
        height: numericHeight,
        quality
      })
    : resolvedSrc;

  // Responsive srcset
  const srcSet = isCloudinary
    ? generateCloudinarySrcSet(resolvedSrc, numericWidth)
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
