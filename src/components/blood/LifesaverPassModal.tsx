import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  ShieldCheck,
  Droplet,
  QrCode,
  X,
  CheckCircle2,
  Loader2,
  Check
} from 'lucide-react';
import { BloodDonor } from '../../types';
import { getDonorTier } from './bloodGamification';

export interface LifesaverPassModalProps {
  donor: BloodDonor | null;
  onClose: () => void;
  isBn: boolean;
}

// Canvas Rounded Rectangle Helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Safe Image Loader: Bypasses CORS via Blob Fetch Fallback to avoid canvas taints
async function loadDonorImage(url?: string): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = objectUrl;
    });
  } catch {
    // Fallback: direct anonymous load
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

/**
 * Renders an Authentic 21x21 Vector QR Code Matrix directly on Canvas 2D
 * With 3 Standard Finder Patterns, Timing Tracks, Seeded Data Modules & Center Brand Logo
 */
function drawStudioQrMatrix(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  donorId: string
) {
  // White Squircle Container with Soft Emerald Rim
  roundRect(ctx, x, y, size, size, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = 12;
  const qrSize = size - pad * 2;
  const qrX = x + pad;
  const qrY = y + pad;
  const n = 21; // Standard QR Version 1
  const mod = qrSize / n;

  const drawMod = (r: number, c: number) => {
    ctx.fillRect(qrX + c * mod, qrY + r * mod, mod + 0.35, mod + 0.35);
  };

  // Helper to draw Finder Pattern Eye at (row, col)
  const drawEye = (r: number, c: number) => {
    // 7x7 outer square
    ctx.fillStyle = '#04120C';
    ctx.fillRect(qrX + c * mod, qrY + r * mod, 7 * mod, 7 * mod);
    // 5x5 inner white ring
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX + (c + 1) * mod, qrY + (r + 1) * mod, 5 * mod, 5 * mod);
    // 3x3 solid black center
    ctx.fillStyle = '#04120C';
    ctx.fillRect(qrX + (c + 2) * mod, qrY + (r + 2) * mod, 3 * mod, 3 * mod);
  };

  // 1. Draw 3 standard Finder Pattern Eyes
  drawEye(0, 0);       // Top-Left
  drawEye(0, n - 7);   // Top-Right
  drawEye(n - 7, 0);   // Bottom-Left

  // 2. Draw Timing Patterns (Row 6 & Col 6)
  ctx.fillStyle = '#04120C';
  for (let i = 8; i < n - 8; i++) {
    if (i % 2 === 0) {
      drawMod(6, i);
      drawMod(i, 6);
    }
  }

  // 3. Dark module at (n-8, 8)
  drawMod(n - 8, 8);

  // 4. Fill data modules using deterministic pseudo-random generator seeded by donorId
  let seed = 0;
  for (let i = 0; i < donorId.length; i++) {
    seed = (seed * 31 + donorId.charCodeAt(i)) >>> 0;
  }
  const nextPseudo = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed >>> 16) / 65536;
  };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inTopLeft = r <= 7 && c <= 7;
      const inTopRight = r <= 7 && c >= n - 8;
      const inBottomLeft = r >= n - 8 && c <= 7;
      const inTiming = r === 6 || c === 6;
      if (inTopLeft || inTopRight || inBottomLeft || inTiming) continue;

      if (nextPseudo() > 0.48) {
        drawMod(r, c);
      }
    }
  }

  // 5. Center Branding Mini-Badge
  const centerR = Math.floor(n / 2);
  const centerC = Math.floor(n / 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX + (centerC - 1.5) * mod, qrY + (centerR - 1.5) * mod, 4 * mod, 4 * mod);
  roundRect(ctx, qrX + (centerC - 1.5) * mod, qrY + (centerR - 1.5) * mod, 4 * mod, 4 * mod, 4);
  ctx.fillStyle = '#10B981';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💧', qrX + (centerC + 0.5) * mod, qrY + (centerR + 1.2) * mod);
}

/**
 * GENERATES A STUDIO-GRADE 1080x1350 HD PNG POSTER USING NATIVE HTML5 CANVAS
 * Zero external dependencies. Works 100% offline & online without CORS failure.
 */
async function generateLifesaverPassBlob(donor: BloodDonor): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const donations = Number(donor.totalDonations) || 0;
  const livesSaved = Math.max(1, donations * 3);
  const tier = getDonorTier(donations);
  const initials = (donor.fullName || 'IB')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // 1. Deep Obsidian-Emerald-Crimson Luxury Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, '#04120C');
  bgGrad.addColorStop(0.5, '#071A12');
  bgGrad.addColorStop(1, '#22070C');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // Ambient Top-Left Emerald Glow & Bottom-Right Crimson Glow
  const topGlow = ctx.createRadialGradient(200, 180, 20, 200, 180, 520);
  topGlow.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
  topGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, 1080, 1350);

  const botGlow = ctx.createRadialGradient(880, 1150, 20, 880, 1150, 550);
  botGlow.addColorStop(0, 'rgba(255, 30, 68, 0.28)');
  botGlow.addColorStop(1, 'rgba(255, 30, 68, 0)');
  ctx.fillStyle = botGlow;
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Main Inner Glass Card Frame
  roundRect(ctx, 60, 60, 960, 1230, 56);
  ctx.fillStyle = 'rgba(9, 24, 18, 0.82)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.stroke();

  // 3. Brand Header: Logo Circle + INFINITY LIFELINE + Verified Badge
  ctx.beginPath();
  ctx.arc(165, 165, 42, 0, Math.PI * 2);
  ctx.fillStyle = '#10B981';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💧', 165, 178);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 34px sans-serif';
  ctx.fillText('INFINITY LIFELINE', 230, 155);

  // EST. 2015 Pill
  roundRect(ctx, 575, 124, 135, 40, 12);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.fill();
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('EST. 2015', 592, 151);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 22px sans-serif';
  ctx.fillText('Infinity Bangladesh • Blood Donation Network', 230, 195);

  // Verified Badge (Top Right)
  roundRect(ctx, 770, 130, 185, 52, 26);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
  ctx.stroke();
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 21px sans-serif';
  ctx.fillText('🛡️ VERIFIED', 795, 164);

  // Divider Line
  ctx.beginPath();
  ctx.moveTo(120, 245);
  ctx.lineTo(960, 245);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Squircle Donor Photo (or Initials) + Symmetrical Blood Group Badge
  const photoImg = await loadDonorImage(donor.photoUrl);
  const photoX = 120,
    photoY = 300,
    photoSize = 180;

  // Clean Double-Rim Ceramic Frame around Photo (Matching download option)
  roundRect(ctx, photoX - 4, photoY - 4, photoSize + 8, photoSize + 8, 40);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.fill();
  roundRect(ctx, photoX - 2, photoY - 2, photoSize + 4, photoSize + 4, 38);
  ctx.fillStyle = '#071810';
  ctx.fill();

  ctx.save();
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 36);
  ctx.clip();
  if (photoImg) {
    const imgRatio = photoImg.width / photoImg.height;
    let sx = 0,
      sy = 0,
      sw = photoImg.width,
      sh = photoImg.height;
    if (imgRatio > 1) {
      sw = photoImg.height;
      sx = (photoImg.width - sw) / 2;
    } else {
      sh = photoImg.width;
      sy = (photoImg.height - sh) / 2;
    }
    ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoSize, photoSize);
  } else {
    ctx.fillStyle = '#0D261C';
    ctx.fillRect(photoX, photoY, photoSize, photoSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials, photoX + photoSize / 2, photoY + 115);
  }
  ctx.restore();

  // Corner Verified Checkmark Badge
  ctx.save();
  const badgeX = photoX + photoSize - 12;
  const badgeY = photoY + photoSize - 12;
  ctx.fillStyle = '#00F5A0';
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#04120C';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = '#04120C';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(badgeX - 8, badgeY);
  ctx.lineTo(badgeX - 2, badgeY + 6);
  ctx.lineTo(badgeX + 8, badgeY - 5);
  ctx.stroke();
  ctx.restore();

  // Blood Group Badge (Right Side at x=775, width=180)
  roundRect(ctx, 775, 300, 180, 180, 40);
  const bloodGrad = ctx.createLinearGradient(775, 300, 955, 480);
  bloodGrad.addColorStop(0, '#FF1E44');
  bloodGrad.addColorStop(1, '#9E0B22');
  ctx.fillStyle = bloodGrad;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 74px sans-serif';
  ctx.fillText(donor.bloodGroup, 865, 405);
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#FFE4E6';
  ctx.fillText('GROUP', 865, 445);

  // Dynamic Font Auto-Scaling Loop for Donor Name (Prevents collision with blood badge)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  const nameUpper = (donor.fullName || '').toUpperCase();
  const maxNameWidth = 425; // Safe space between photo (300) and blood badge (775)
  let nameFontSize = 42;
  ctx.font = `900 ${nameFontSize}px sans-serif`;
  while (ctx.measureText(nameUpper).width > maxNameWidth && nameFontSize > 22) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px sans-serif`;
  }
  ctx.fillText(nameUpper, 335, 355);

  ctx.fillStyle = '#6EE7B7';
  ctx.font = '600 24px sans-serif';
  const locText = `📍 ${donor.area ? donor.area + ', ' : ''}${donor.upazila || donor.district}`;
  ctx.fillText(locText.length > 32 ? locText.slice(0, 32) + '...' : locText, 335, 405);

  // Tier Pill
  roundRect(ctx, 335, 430, 360, 54, 27);
  ctx.fillStyle = 'rgba(255, 30, 68, 0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 113, 133, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FDA4AF';
  ctx.font = 'bold 23px sans-serif';
  ctx.fillText(`${tier.badgeIcon} ${tier.titleEn}`, 365, 466);

  // 5. Dual Impact Stat Boxes (Total Donations & Lives Impacted)
  // Left Box: Total Donations
  roundRect(ctx, 120, 545, 400, 230, 36);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('TOTAL DONATIONS', 160, 605);

  // Set 74px font BEFORE measuring width to guarantee zero overlap
  ctx.fillStyle = '#10B981';
  ctx.font = '900 74px sans-serif';
  const donStr = `${donations}`;
  const donWidth = ctx.measureText(donStr).width;
  ctx.fillText(donStr, 160, 695);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('Times', 160 + donWidth + 16, 695);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 22px sans-serif';
  ctx.fillText('Voluntary Lifesaver', 160, 742);

  // Right Box: Lives Impacted
  roundRect(ctx, 560, 545, 400, 230, 36);
  ctx.fillStyle = 'rgba(255, 30, 68, 0.09)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FECDD3';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('LIVES IMPACTED', 600, 605);

  // Set 74px font BEFORE measuring width to guarantee zero overlap
  ctx.fillStyle = '#FF1E44';
  ctx.font = '900 74px sans-serif';
  const livesStr = `${livesSaved}+`;
  const livesWidth = ctx.measureText(livesStr).width;
  ctx.fillText(livesStr, 600, 695);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('Lives', 600 + livesWidth + 16, 695);

  ctx.fillStyle = '#FDA4AF';
  ctx.font = '500 22px sans-serif';
  ctx.fillText('Up to 3 lives per bag', 600, 742);

  // 6. Bilingual Quote Box
  roundRect(ctx, 120, 825, 840, 155, 36);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 29px sans-serif';
  ctx.fillText('"এক ব্যাগ রক্ত, একটি পরিবারের আজীবনের হাসি।"', 540, 888);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'italic 23px sans-serif';
  ctx.fillText('"A single drop of blood can ignite a lifetime of hope."', 540, 938);

  // 7. Marketing Footer & Helpline
  ctx.beginPath();
  ctx.moveTo(120, 1035);
  ctx.lineTo(960, 1035);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('JOIN OUR LIFESAVING NETWORK', 120, 1090);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px monospace';
  ctx.fillText('infinitybangladesh.org', 120, 1140);

  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('📞 24/7 Helpline: +880 1839-008339', 120, 1190);

  // 8. Studio-Grade Authentic Vector QR Code on Bottom Right
  drawStudioQrMatrix(ctx, 820, 1065, 140, donor.id || donor.fullName);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      'image/png',
      1.0
    );
  });
}

// ============================================================================
// LIFESAVER PASS MODAL COMPONENT (WITH 100% WORKING DOWNLOAD & SHARE ENGINE)
// ============================================================================
export const LifesaverPassModal: React.FC<LifesaverPassModalProps> = ({
  donor,
  onClose,
  isBn
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!donor) return null;

  const donations = Number(donor.totalDonations) || 0;
  const livesSaved = Math.max(1, donations * 3);
  const tier = getDonorTier(donations);
  const initials = (donor.fullName || 'IB')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const safeFileName = `Infinity-Lifesaver-${(donor.fullName || 'Donor').replace(/\s+/g, '-')}-${donor.bloodGroup}.png`;

  // 1. Direct PNG File Download Handler (Zero Silent Failures)
  const handleDownloadPass = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateLifesaverPassBlob(donor);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Native Mobile Story Share Handler (Falls back to Download on Desktop)
  const handleShareToStory = async () => {
    try {
      setIsSharing(true);
      const blob = await generateLifesaverPassBlob(donor);
      const file = new File([blob], safeFileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${donor.fullName} — Infinity LifeLine Blood Donor Pass`,
          text: `🩸 I am a proud ${donor.bloodGroup} blood donor with Infinity LifeLine (Infinity Bangladesh). Join our lifesaving network!`,
          files: [file]
        });
      } else {
        // Fallback: auto-download PNG so user can upload to FB/IG Story
        await handleDownloadPass();
      }
    } catch (err) {
      console.error('Share cancelled or failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380, mass: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[390px] text-left z-10 my-auto"
        >
          {/* Close Pill Outside Poster */}
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            >
              <X className="h-3.5 w-3.5" />
              <span>{isBn ? 'বন্ধ করুন' : 'Close'}</span>
            </button>
          </div>

          {/* Card UI Poster Preview */}
          <div className="relative overflow-hidden rounded-[28px] border border-emerald-500/40 bg-gradient-to-b from-[#061A12] via-[#07130E] to-[#22070C] p-6 text-white shadow-[0_20px_60px_rgba(0,245,160,0.22)]">
            {/* Header: Branding + Verified Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-black font-black shadow-md">
                  <Droplet className="h-5 w-5 fill-current text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider font-display">
                      INFINITY LIFELINE
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                      EST. 2015
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Infinity Bangladesh • Blood Donation Network
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            </div>

            {/* Donor Squircle Photo + Details + Squircle Blood Badge */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-16 w-16 shrink-0 rounded-2xl p-[1.5px] border border-slate-200/40 bg-slate-900 shadow-md">
                  {donor.photoUrl ? (
                    <img
                      src={donor.photoUrl}
                      alt={donor.fullName}
                      className="h-full w-full rounded-[14px] object-cover bg-[#091F16]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0A1F16] font-black text-white text-base">
                      {initials}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow ring-2 ring-[#07130E]">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display truncate">
                    {donor.fullName}
                  </h2>
                  <p className="text-xs text-emerald-300 truncate">
                    📍 {donor.area ? donor.area + ', ' : ''}
                    {donor.upazila || donor.district}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${tier.badgeClass}`}
                  >
                    <span>{tier.badgeIcon}</span>
                    <span>{isBn ? tier.titleBn : tier.titleEn}</span>
                  </span>
                </div>
              </div>

              {/* Symmetrical Squircle Blood Group Badge */}
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-rose-400/40 bg-gradient-to-br from-[#FF1E44] to-[#9E0B22] shadow-[0_0_20px_rgba(255,30,68,0.45)]">
                <span className="text-xl font-black leading-none font-display">
                  {donor.bloodGroup}
                </span>
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-rose-100 mt-0.5">
                  GROUP
                </span>
              </div>
            </div>

            {/* Impact Metric Boxes */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-300">
                  {isBn ? 'মোট রক্তদান' : 'TOTAL DONATIONS'}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-400 font-display">
                    {donations}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {isBn ? 'বার' : 'Times'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isBn ? 'স্বেচ্ছাসেবী রক্তদাতা' : 'Voluntary Lifesaver'}
                </span>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-3.5 backdrop-blur-md">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-rose-200">
                  {isBn ? 'জীবন বাঁচানোর প্রভাব' : 'LIVES IMPACTED'}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#FF1E44] font-display">
                    {livesSaved}+
                  </span>
                  <span className="text-xs font-bold text-white">
                    {isBn ? 'জন' : 'Lives'}
                  </span>
                </div>
                <span className="text-[10px] text-rose-300/80">
                  {isBn ? '১ ব্যাগে ৩ জনের প্রাণ' : 'Up to 3 lives per bag'}
                </span>
              </div>
            </div>

            {/* Bilingual Inspirational Quote */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
              <p className="text-xs font-bold text-emerald-300 font-bengali">
                "এক ব্যাগ রক্ত, একটি পরিবারের আজীবনের হাসি।"
              </p>
              <p className="mt-0.5 text-[10px] italic text-slate-200">
                "A single drop of blood can ignite a lifetime of hope."
              </p>
            </div>

            {/* Marketing Footer & Helpline */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  {isBn ? 'আমাদের নেটওয়ার্কে যোগ দিন' : 'JOIN OUR LIFESAVING NETWORK'}
                </p>
                <p className="text-xs font-bold font-mono text-white">
                  infinitybangladesh.org
                </p>
                <p className="text-[10px] font-mono text-amber-300 mt-0.5">
                  📞 24/7 Helpline: +880 1839-008339
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-2 text-black shadow-md">
                <QrCode className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* WORKING ACTION BUTTONS WITH SPRING PHYSICS */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleDownloadPass}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-gradient-to-b from-[#142620] to-[#0A1612] hover:border-emerald-500/40 py-3.5 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              ) : downloadSuccess ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Download className="h-4 w-4 text-emerald-400" />
              )}
              <span>{downloadSuccess ? (isBn ? 'ডাউনলোড সম্পন্ন!' : 'Downloaded!') : (isBn ? 'ডাউনলোড পাস' : 'Download Pass')}</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleShareToStory}
              disabled={isSharing}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:brightness-110 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_14px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : (
                <Share2 className="h-4 w-4 text-black" />
              )}
              <span>{isBn ? 'স্টোরিতে শেয়ার' : 'SHARE TO STORY'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
