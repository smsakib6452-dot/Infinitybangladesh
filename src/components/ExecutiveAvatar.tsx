import React, { useState } from 'react';
import { getAssetUrl } from '../lib/utils/assetHelper';

interface ExecutiveAvatarProps {
  photoUrl?: string | null;
  fullName: string;
  photoPosition?: string;
  photoZoom?: number;
  className?: string;
  imgClassName?: string;
  variant?: 'emerald' | 'crimson' | 'slate' | 'gold';
}

/**
 * Distinguished Executive Vector Avatar Silhouette
 * Designed specifically for leadership councils & committee rosters.
 * Provides a respectful, high-end portrait silhouette when a photograph is unavailable.
 */
export const ExecutiveSilhouetteSvg: React.FC<{
  className?: string;
  variant?: 'emerald' | 'crimson' | 'slate' | 'gold';
}> = ({ className = 'w-full h-full', variant = 'emerald' }) => {
  const gradientId = `exec-bg-${variant}`;
  const collarId = `exec-collar-${variant}`;

  const colors = {
    emerald: {
      stop1: '#004D38',
      stop2: '#003325',
      stop3: '#001A13',
      ambient: '#34D399',
      suit: '#00261C',
      shirt: '#E6F3EF',
      tie: '#10B981'
    },
    crimson: {
      stop1: '#8B0D1D',
      stop2: '#5F0611',
      stop3: '#360208',
      ambient: '#F87171',
      suit: '#3A030A',
      shirt: '#FDF1F2',
      tie: '#D4182E'
    },
    slate: {
      stop1: '#1E293B',
      stop2: '#0F172A',
      stop3: '#020617',
      ambient: '#94A3B8',
      suit: '#0A0F1D',
      shirt: '#F8FAFC',
      tie: '#64748B'
    },
    gold: {
      stop1: '#785A12',
      stop2: '#533D08',
      stop3: '#302203',
      ambient: '#FBBF24',
      suit: '#291E04',
      shirt: '#FEF9C3',
      tie: '#D97706'
    }
  }[variant];

  return (
    <svg
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.stop1} />
          <stop offset="55%" stopColor={colors.stop2} />
          <stop offset="100%" stopColor={colors.stop3} />
        </linearGradient>

        <linearGradient id={collarId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={colors.shirt} />
        </linearGradient>
      </defs>

      {/* Background Frame */}
      <rect width="100" height="115" fill={`url(#${gradientId})`} />

      {/* Subtle Ambient Backlight Glow */}
      <circle cx="50" cy="48" r="38" fill={colors.ambient} fillOpacity="0.12" />

      {/* Executive Suit Shoulders */}
      <path
        d="M10 115C10 94 22 84 38 81L45 86C48 88 52 88 55 86L62 81C78 84 90 94 90 115H10Z"
        fill={colors.suit}
      />

      {/* Formal Shirt V-Neck & Lapel */}
      <path
        d="M38 81L46 95L50 99L54 95L62 81L56 79L50 85L44 79L38 81Z"
        fill={`url(#${collarId})`}
      />

      {/* Elegant Tie Knot & Line */}
      <path
        d="M48 86L52 86L53 98L50 105L47 98L48 86Z"
        fill={colors.tie}
      />

      {/* Neck */}
      <path
        d="M42 55H58V78C58 81 55 84 50 84C45 84 42 81 42 78V55Z"
        fill="#F8FAFC"
      />

      {/* Ears */}
      <circle cx="31" cy="48" r="4.5" fill="#F8FAFC" />
      <circle cx="69" cy="48" r="4.5" fill="#F8FAFC" />

      {/* Natural Head / Face Contour */}
      <ellipse cx="50" cy="48" rx="17" ry="20" fill="#FFFFFF" />

      {/* Distinguished Executive Hairstyle */}
      <path
        d="M31 44C30 30 38 22 50 22C62 22 70 30 69 44C66 39 61 35 54 35C45 35 41 33 37 36C34 38 32 41 31 44Z"
        fill={colors.suit}
      />
      {/* Hair subtle depth highlight */}
      <path
        d="M38 27C42 24 47 23 53 24C59 25 64 27 66 31C62 28 57 26 51 26C45 26 41 27 38 27Z"
        fill={colors.ambient}
        fillOpacity="0.4"
      />
    </svg>
  );
};

export const ExecutiveAvatar: React.FC<ExecutiveAvatarProps> = ({
  photoUrl,
  fullName,
  photoPosition = 'center 15%',
  photoZoom,
  className = 'w-full h-full',
  imgClassName = 'w-full h-full object-cover select-none pointer-events-none transform-gpu',
  variant = 'emerald'
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanPhotoUrl = photoUrl && photoUrl.trim() !== '' ? photoUrl : null;

  if (!cleanPhotoUrl || hasError) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
        <ExecutiveSilhouetteSvg className="w-full h-full" variant={variant} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={getAssetUrl(cleanPhotoUrl)}
        alt={fullName}
        className={imgClassName}
        style={{
          objectPosition: photoPosition,
          transform: photoZoom && photoZoom > 1 ? `scale(${photoZoom})` : undefined
        }}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};
