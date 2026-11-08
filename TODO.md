# Infinity Bangladesh — Verification & Sourcing TODO

## 1. Unsplash Stock Image Replacements (Audit & Action Required)

Per organizational guidelines, all real-world impact sections must represent authentic humanitarian groundwork. Stock photography is strictly decoupled and replaced with branded, accessible `<PlaceholderImage>` components until official field photography is uploaded.

| Component / Section | File Path | Original Unsplash Asset | Current Replacement | Verification Status |
|---|---|---|---|---|
| Campaigns Section (Featured Drive fallback) | `src/components/home/CampaignsSection.tsx` | `https://images.unsplash.com/photo-1593113598332-cd288d649433` | `<PlaceholderImage label="অনুমোদিত ছবি শীঘ্রই আসছে" />` | **Decoupled & Replaced** (Pending authentic high-res field photo from Team Infinity media team) |

---

## 2. Media Optimization Tracker

- `brand/infi-robot.png` (110 KB) -> Replaced with right-sized WebP `brand/infi-robot.webp` (4.8 KB)
- `brand/infi-robot.jpg` & `brand/infi-robot-backup.png` -> Confirmed unreferenced across codebase and purged
- `images/infinity-cover-hero.jpg` (189 KB) -> Optimized WebP generated + `<picture>` responsive srcset (640w & 1200w) + WebP preload in `index.html`
- `images/events/winter-warmth.jpg` (221 KB) -> WebP asset generated (162 KB)
- `brand/Infinitylifeline-logo.svg` (211 KB embedded rasters) -> WebP alternative generated (141 KB)

---

## 3. Video Facade Poster Replacements (Audit & Action Required)

The featured documentary on the homepage now uses a zero-external-request click-to-load facade with a branded WebP placeholder (`public/images/gallery/video-poster-placeholder.webp`). Replace this placeholder with an authentic 1280x720 video still / frame captured directly from Team Infinity's official documentary footage.

| Video / Section | File Path | Current Placeholder | Target Replacement | Verification Status |
|---|---|---|---|---|
| Featured Documentary Player | `public/images/gallery/video-poster-placeholder.webp` | Branded SVG-derived WebP (18 KB) | High-res 1280x720 authentic documentary frame | **Awaiting authentic field video frame from Team Infinity** |


