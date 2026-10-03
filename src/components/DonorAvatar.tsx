import React, { useState } from 'react';
import { getAssetUrl } from '../lib/utils/assetHelper';

interface DonorAvatarProps {
  photoUrl?: string | null;
  fullName: string;
  gender?: string | null;
  className?: string;
  imgClassName?: string;
}

/**
 * Natural Anatomical Vector Avatar for Male Donors
 * Clean, well-proportioned modern haircut, natural neck, and shoulders
 */
export const MaleAvatarSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="maleBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="60%" stopColor="#044e3b" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>
      <linearGradient id="maleShirt" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>

    {/* Background */}
    <rect width="100" height="100" fill="url(#maleBg)" />

    {/* Subtle Ambient Glow */}
    <circle cx="50" cy="45" r="36" fill="#ffffff" fillOpacity="0.05" />

    {/* Shoulders & Shirt */}
    <path
      d="M16 100C16 85 27 75 41 73L45 77C48 80 52 80 55 77L59 73C73 75 84 85 84 100H16Z"
      fill="url(#maleShirt)"
    />

    {/* Neck */}
    <path
      d="M43 53H57V76C57 78 54 81 50 81C46 81 43 78 43 76V53Z"
      fill="#f8fafc"
    />

    {/* Ears */}
    <circle cx="33" cy="46" r="4.5" fill="#f8fafc" />
    <circle cx="67" cy="46" r="4.5" fill="#f8fafc" />

    {/* Natural Head / Face Contour */}
    <ellipse cx="50" cy="46" rx="16" ry="19" fill="#ffffff" />

    {/* Handsome Modern Hairstyle */}
    <path
      d="M33 43C32 29 40 21 50 21C61 21 68 28 67 43C64 38 60 34 54 34C46 34 42 32 38 35C35 37 34 40 33 43Z"
      fill="#032d23"
    />
    {/* Subtle Hair Highlight */}
    <path
      d="M39 25C43 23 48 22 53 23C58 24 62 26 64 30C61 27 56 25 51 25C46 25 42 26 39 25Z"
      fill="#065f46"
      fillOpacity="0.6"
    />
  </svg>
);

/**
 * Natural Anatomical Vector Avatar for Female Donors
 * Culturally respectful, dignified modest hijab silhouette with balanced curves
 */
export const FemaleAvatarSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="femaleBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="60%" stopColor="#0d5f58" />
        <stop offset="100%" stopColor="#042f2e" />
      </linearGradient>
      <linearGradient id="femaleScarf" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#042f2e" />
        <stop offset="100%" stopColor="#021c1b" />
      </linearGradient>
      <linearGradient id="femaleDress" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ccfbf1" />
        <stop offset="100%" stopColor="#99f6e4" />
      </linearGradient>
    </defs>

    {/* Background */}
    <rect width="100" height="100" fill="url(#femaleBg)" />

    {/* Subtle Ambient Glow */}
    <circle cx="50" cy="45" r="36" fill="#ffffff" fillOpacity="0.05" />

    {/* Shoulders & Modest Attire */}
    <path
      d="M16 100C16 85 27 75 42 73L50 78L58 73C73 75 84 85 84 100H16Z"
      fill="url(#femaleDress)"
    />

    {/* Modest Hijab Outer Contour (Natural Drape over head & neck) */}
    <path
      d="M50 19C34 19 30 30 30 46C30 59 36 72 43 78C47 81 53 81 57 78C64 72 70 59 70 46C70 30 66 19 50 19Z"
      fill="url(#femaleScarf)"
    />

    {/* Face Opening (Naturally revealed face) */}
    <ellipse cx="50" cy="46" rx="12.5" ry="15.5" fill="#ffffff" />

    {/* Modest Underscarf Band Accent */}
    <path
      d="M38 36C42 33 46 32 50 32C54 32 58 33 62 36C60 34 56 33 50 33C45 33 41 34 38 36Z"
      fill="#14b8a6"
    />

    {/* Scarf Pin Accent at Neck */}
    <circle cx="50" cy="74" r="2.5" fill="#f43f5e" />
  </svg>
);

/**
 * Universal Donor Avatar Component
 * - Displays uploaded image if present
 * - Gracefully falls back to polished Male / Female vector silhouette if image is absent or broken
 */
export const DonorAvatar: React.FC<DonorAvatarProps> = ({
  photoUrl,
  fullName,
  gender = 'Male',
  className = 'w-12 h-12 rounded-2xl overflow-hidden',
  imgClassName = 'w-full h-full object-cover'
}) => {
  const [imgError, setImgError] = useState(false);

  const cleanUrl = photoUrl ? getAssetUrl(photoUrl.trim()) : '';
  const isFemale = gender?.toLowerCase() === 'female' || gender === 'মহিলা' || gender === 'নারী';
  const hasValidPhoto = Boolean(cleanUrl && !imgError);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {hasValidPhoto ? (
        <img
          src={cleanUrl}
          alt={fullName}
          className={imgClassName}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : isFemale ? (
        <FemaleAvatarSvg className="w-full h-full" />
      ) : (
        <MaleAvatarSvg className="w-full h-full" />
      )}
    </div>
  );
};

export default DonorAvatar;
