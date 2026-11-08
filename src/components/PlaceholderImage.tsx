import React from 'react';
import { ImageOff } from 'lucide-react';

interface PlaceholderImageProps {
  className?: string;
  label?: string;
  aspectRatio?: string;
}

/**
 * PlaceholderImage — intentional brand-gradient placeholder used wherever
 * an Unsplash stock photo would otherwise appear. Listed in TODO.md.
 *
 * Visual: brand-green-to-teal gradient, centred icon, small "Illustrative image" caption.
 * Fully accessible: role="img" + aria-label.
 */
export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  className = '',
  label = 'Illustrative image',
  aspectRatio,
}) => {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Brand gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #006A4E 0%, #0F4C3A 40%, #003829 70%, #0F172A 100%)',
        }}
      />

      {/* Subtle geometric texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
        }}
      />

      {/* Soft ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(0,135,100,0.4) 0%, transparent 70%)',
          top: '20%',
          left: '20%',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center select-none">
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <ImageOff className="w-7 h-7 text-white/80" />
        </div>
        <p
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

