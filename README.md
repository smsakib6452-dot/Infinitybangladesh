# Infinity Bangladesh — Complete Website & Fully Editable Admin CMS
> **Official Slogan:** UNITED FOR HUMANITY  
> **Team Identity:** Team Infinity  
> **Location:** Hathazari, Chattogram, Bangladesh  
> **Established:** 2015  
> **Official Facebook:** [https://www.facebook.com/infinitybangladesh](https://www.facebook.com/infinitybangladesh)  
> **Official Website:** [https://infinitybangladesh.vercel.app](https://infinitybangladesh.vercel.app)

---

## 🌟 1. Overview & Architectural Vision

**Infinity Bangladesh (Team Infinity — United for Humanity)** is a youth-driven, non-profit humanitarian organization founded in Hathazari, Chattogram in 2015. Over the past decade, it has empowered underprivileged children, delivered festive Eid gifts, distributed winter warmth, and provided emergency relief across Bangladesh.

This codebase delivers a **production-ready, fully content-manageable humanitarian organization platform** with a **secure Admin Panel/CMS powered by Supabase (PostgreSQL, Auth, Storage, RLS)** and **dual fallback/offline persistence**.

### Key Architectural Strengths:
1. **100% Content Manageable**: Administrators can edit almost every visible and functional part of the website without touching code (Hero headline, CTAs, real cover photos, about mission/vision, campaigns, programs, stories, media library, banners, volunteer applications, donations, navigation menus, header notice bar, footer, and SEO).
2. **Dual Operation (Supabase + Offline Fallback)**: Operates seamlessly whether connected to a live Supabase PostgreSQL backend or in local offline persistence mode, preventing crashes during development or pre-configuration.
3. **Strict Fact Verification & Authentic Media**: Uses official real photography (e.g. Eid Joy group photograph in Hathazari) and the official authoritative logo without AI distortion or invented facts.
4. **Universal Media Picker**: Media assets can be uploaded once to the Media Library (with Supabase Storage support) and attached to any campaign, banner, or page section with a single click.

---

## 🏛️ 2. Leadership & Committee Architecture

The platform provides a dynamic, database-backed Committee & Governance System that supports multi-year terms without being locked to any single year:

### A. Executive Committee 2026 (27 Executive Leaders)
- **Tier 1 (President)**: **#01** Md. Shahidul Alam Sakib (*মোঃ শাহিদুল আলম সাকিব*) — Emerald hero arch card.
- **Tier 2 (Senior VP & Vice Presidents)**: **#02** Mohammad Ismail (*সিনিয়র সহ-সভাপতি*), **#03** Joinul Abedin (*সহ-সভাপতি*), **#04** Sohel Akram Sobuj (*সহ-সভাপতি*).
- **Tier 3 (General Secretary)**: **#05** Salimur Rahman Opi (*সাধারণ সম্পাদক*) — Highlight leadership card.
- **Tier 4 (Joint General Secretaries & Departmental Secretaries)**: **#06 to #27** (*Organizing, Finance, Student Affairs, Publicity, Office, Cultural, Relief & Disaster, Sports, Social Welfare*).
- **Public URL**: `/#/about/executive-committee`

### B. Standing Committee (Permanent Governance Council)
- **Tier 1 (Chairman)**: **#01** Sakib Al Karim (*সাকিব আল করিম*)
- **Tier 2 (Vice-Chairmen)**: **#02** Tamimul Hasib Rimad (*তামীমুল হাসিব রিমাদ*), **#03** Shifat Sattar (*শিফাত সাত্তার*)
- **Tier 3 (Committee Members)**: **#04** Ishtiaqe Ahmed, **#05** Chaity Debi Piya, **#06** Rakib Ahmed, **#07** Md Ashraful Islam, **#08** Tanveer Haidar Rakib, **#09** Md Arshad.
- **Public URL**: `/#/about/standing-committees`

### C. Past Committees & Historical Archive
- Archives former executive councils (e.g., 2025 Executive Committee) with collapsible member rosters and historical contributions.
- **Public URL**: `/#/about/past-committees`

---

## 🛠️ 3. Technology Stack

- **Frontend Core:** React 19, TypeScript (Strict), Vite 6
- **Styling:** Tailwind CSS v4 (Modern semantic design tokens, glassmorphism, responsive cards)
- **Typography:** English (`Plus Jakarta Sans`), Bengali (`Hind Siliguri`, `Noto Sans Bengali`)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Storage Buckets, Auth)
- **File & Media Storage:** Supabase Storage (`infinity-media`, `infinity-documents`)
- **Icons & UI:** Lucide React, Custom SVG Brand System
- **State & Sync:** Single-source-of-truth `DataContext` with instant localStorage persistence, offline JSON backup/restore, and Supabase real-time sync.

---

## 🚀 4. Supabase Setup & Database Migration

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **Anon Public Key** in **Project Settings > API**.

### Step 2: Run Database Migration
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste into the SQL Editor.
3. Click **RUN** to create:
   - 20+ Relational Tables (`homepage_config`, `campaigns`, `programs`, `media_library`, `site_settings`, `volunteers`, `donations`, etc.)
   - Row Level Security (RLS) policies (Public read, authenticated admin write)
   - Auto-updating `updated_at` triggers
   - Storage buckets (`infinity-media`, `infinity-documents`)

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_STORAGE_BUCKET=infinity-media
```

---

## 💻 5. Local Development Commands

```bash
# 1. Clone the repository
git clone https://github.com/your-username/infinity-bangladesh.git
cd infinity-bangladesh

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Start local development server
npm run dev

# 5. Build for production (verifies zero TypeScript errors)
npm run build

# 6. Preview production build locally
npm run preview
```

Your application will be live at `http://localhost:3000/`.

---

## 🔐 6. Admin Management Portal (CMS)

- **URL:** `/#/admin` (or click **Admin** in the header / footer)
- **Default Offline Development Passcode:** `admin123` or `infinity2026`
- **CMS Modules:**
  1. **Dashboard Overview:** Real-time KPI counters, quick action shortcuts, sync status.
  2. **Homepage Editor:** Edit Hero headline, slogans, real cover photo, CTAs, trust badges, section order, and section visibility.
  3. **About Organization CMS:** Edit mission, vision, history, established year, and locations.
  4. **Campaigns Manager:** Create, edit, and publish seasonal relief drives, target funds, and raised BDT.
  5. **Programs Manager:** Manage core humanitarian programs (Child Welfare, Winter Relief, Emergency Aid).
  6. **Impact Metrics:** Live verifiable impact numbers and descriptions.
  7. **Impact Stories:** Publish verified human transformation stories with beneficiary consent flags.
  8. **Media Library:** Upload real photos, filter by category (Hero, Events, Logos, Volunteers), copy URLs, and select via Media Picker.
  9. **Banners & Sliders:** Manage hero and promotional banners and CTAs.
  10. **Gallery Albums:** Manage albums and photo collections.
  11. **Committees & Leadership:** Manage Executive Committee 2026, Standing Committee, and Past Committees.
  12. **Volunteer CMS:** Review volunteer applications, approve candidates, and export CSV rosters.
  13. **Donations & Funds:** Track incoming bKash, Nagad, and Bank contributions, and issue verified digital money receipts.
  14. **Transparency & Audit:** Upload audited financial statements and itemized expense reports.
  15. **Navigation Builder:** Add, edit, reorder navigation links and dropdown menus.
  16. **Header & Footer Settings:** Update announcement notice bar, footer address, helpline, and copyright text.
  17. **SEO & Social Cards:** Manage meta titles, descriptions, keywords, and OpenGraph images.
  18. **Social Links:** Manage official Facebook, YouTube, Instagram, LinkedIn, and WhatsApp channels.
  19. **Donation Channels:** Manage bKash, Nagad, and Bank account details.
  20. **Contact Settings:** Manage official address, phone, email, helpline, and Google Maps embed URL.
  21. **Admin Users & Roles:** Manage `super_admin`, `content_admin`, `media_manager`, and `viewer` roles.
  22. **Database Backup & Diagnostics:** Export complete database snapshot as timestamped `.JSON`, restore from JSON, or factory reset.

---

## 🌐 7. Deployment Instructions

### Option A: Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project in Vercel.
3. In **Project Settings > Environment Variables**, add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_STORAGE_BUCKET`.
4. Deploy!

### Option B: Netlify
1. Connect your GitHub repository in Netlify.
2. Build command: `npm run build` | Publish directory: `dist`
3. Add environment variables in Netlify site settings.
4. Deploy!

### Option C: GitHub Pages
The project includes automated scripts for GitHub Pages with SPA 404 routing:
```bash
npm run build
# The build script automatically generates dist/404.html, dist/.nojekyll, and copies to docs/
```

---

## 📜 8. License & Organizational Integrity

© 2015–2026 **Infinity Bangladesh** (*Team Infinity*). All rights reserved.  
**United for Humanity.**
