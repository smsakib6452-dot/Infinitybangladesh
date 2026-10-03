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
 * High-End Vector Silhouette for Male Donors
 * Minimalist, respectful, modern corporate healthcare aesthetic
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
      <linearGradient id="maleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="50%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>
      <linearGradient id="maleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    {/* Rich Emerald Background */}
    <rect width="100" height="100" fill="url(#maleGrad)" />
    
    {/* Subtle Background Glow Circle */}
    <circle cx="50" cy="40" r="32" fill="#ffffff" fillOpacity="0.08" />

    {/* Male Hair & Head */}
    <g fill="url(#maleGlow)">
      {/* Modern Hairstyle Silhouette */}
      <path d="M50 20C40 20 34 26 34 35C34 37 34.5 39 35 41C34.2 41.5 33.5 42.5 33.5 44C33.5 46 35 47.5 37 47.5C37.5 47.5 38 47.3 38.5 47C40 54 44.5 59 50 59C55.5 59 60 54 61.5 47C62 47.3 62.5 47.5 63 47.5C65 47.5 66.5 46 66.5 44C66.5 42.5 65.8 41.5 65 41C65.5 39 66 37 66 35C66 26 60 20 50 20Z" />
      
      {/* Neck */}
      <path d="M44 57H56V67C56 68 53 70 50 70C47 70 44 68 44 67V57Z" />

      {/* Shoulders & Chest */}
      <path d="M50 71C38 71 27 76 22 83C20.5 85 20 87 20 90V100H80V90C80 87 79.5 85 78 83C73 76 62 71 50 71Z" />
    </g>

    {/* Clean Collar/Shirt Accent */}
    <path
      d="M50 70L42 81H58L50 70Z"
      fill="#047857"
      fillOpacity="0.3"
    />
  </svg>
);

/**
 * High-End Vector Silhouette for Female Donors
 * Culturally respectful, dignified, elegant modest silhouette
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
      <linearGradient id="femaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="50%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>
      <linearGradient id="femaleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#e6fffa" stopOpacity="0.82" />
      </linearGradient>
    </defs>
    {/* Deep Teal-Emerald Background */}
    <rect width="100" height="100" fill="url(#femaleGrad)" />
    
    {/* Soft Halo */}
    <circle cx="50" cy="40" r="32" fill="#ffffff" fillOpacity="0.08" />

    {/* Elegant Modest Silhouette (Face & Veil/Hijab Contour) */}
    <g fill="url(#femaleGlow)">
      {/* Face Oval */}
      <ellipse cx="50" cy="41" rx="11" ry="14" fill="#f0fdfa" />
      
      {/* Elegant Draped Silhouette / Modest Veil */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 18C36 18 31 28 31 42C31 52 35 59 39 65C34 68 25 74 21 82C19.5 85 19 88 19 91V100H81V91C81 88 80.5 85 79 82C75 74 66 68 61 65C65 59 69 52 69 42C69 28 64 18 50 18ZM42 33C42 28.5 45.5 25 50 25C54.5 25 58 28.5 58 33C58 42 56 49 50 51C44 49 42 42 42 33Z"
      />
    </g>

    {/* Subtle Soft Rose Gold Pin Accent for Warmth */}
    <circle cx="50" cy="64" r="2" fill="#fb7185" fillOpacity="0.9" />
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
