export type Language = 'en' | 'bn';

export type PageRoute = 
  | 'home'
  | 'about'
  | 'about/story'
  | 'about/mission-vision'
  | 'about/team'
  | 'about/executive-committee'
  | 'about/standing-committees'
  | 'about/past-committees'
  | 'team'
  | 'team/executive-committee'
  | 'team/standing-committee'
  | 'team/past-committees'
  | 'programs'
  | 'programs/detail'
  | 'programs/event-detail'
  | 'campaigns'
  | 'campaigns/detail'
  | 'impact'
  | 'stories'
  | 'stories/detail'
  | 'events'
  | 'events/detail'
  | 'news'
  | 'news/detail'
  | 'gallery'
  | 'videos'
  | 'media-coverage'
  | 'volunteer'
  | 'donate'
  | 'partners'
  | 'transparency'
  | 'reports'
  | 'contact'
  | 'blood-donation'
  | 'blood-donation/find-donor'
  | 'blood-donation/become-donor'
  | 'blood-donation/update-donor'
  | 'blood-donation/emergency-request'
  | 'blood-donation/statistics'
  | 'privacy'
  | 'terms'
  | 'faq'
  | '404'
  | 'admin';

export interface BilingualText {
  en: string;
  bn: string;
}

export interface BilingualList {
  en: string[];
  bn: string[];
}

export type AdminRole = 'super_admin' | 'content_admin' | 'media_manager' | 'viewer';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLoginAt?: string;
  isActive: boolean;
}

// ----------------------------------------------------
// HOMEPAGE CONFIGURATION & SECTIONS
// ----------------------------------------------------
export interface HeroTrustIndicator {
  icon: string; // 'ShieldCheck' | 'CheckCircle2' | 'Sparkles' | 'Heart' | 'Users'
  text: BilingualText;
  active: boolean;
}

export interface HeroConfig {
  eyebrow: BilingualText;
  headlineMain: BilingualText;
  headlineHighlight: BilingualText;
  description: BilingualText;
  primaryCta: {
    text: BilingualText;
    url: string;
    openInNewTab?: boolean;
    active: boolean;
  };
  secondaryCta: {
    text: BilingualText;
    url: string;
    openInNewTab?: boolean;
    active: boolean;
  };
  storyCta: {
    text: BilingualText;
    url: string;
    active: boolean;
  };
  heroImageUrl: string;
  heroImageAlt: string;
  heroImageCaption?: string;
  heroImageCropPosition: string; // e.g. 'center center', 'center top', '50% 20%'
  badgeYear: string;
  badgeLocation: string;
  badgeTag: string;
  badgeTitle?: BilingualText;
  trustIndicators: HeroTrustIndicator[];
}

export interface AboutPreviewConfig {
  eyebrow: BilingualText;
  titleMain: BilingualText;
  titleHighlight: BilingualText;
  description: BilingualText;
  quoteText?: BilingualText;
  quoteAuthor?: string;
  missionHeading?: BilingualText;
  missionText?: BilingualText;
  visionHeading?: BilingualText;
  visionText?: BilingualText;
  ctaText: BilingualText;
  ctaUrl: string;
  secondaryCtaText?: BilingualText;
  secondaryCtaUrl?: string;
  imageUrl: string;
  imageAlt?: string;
  imageCrop?: string;
  imageBadgeTitle?: BilingualText;
  imageBadgeSubtitle?: BilingualText;
}

export interface HomepageVolunteerBanner {
  eyebrow?: BilingualText;
  badge?: BilingualText;
  title: BilingualText;
  subtitle?: BilingualText;
  description?: BilingualText;
  primaryCtaText?: BilingualText;
  primaryCtaUrl?: string;
  secondaryCtaText?: BilingualText;
  secondaryCtaUrl?: string;
  primaryButtonText?: BilingualText;
  primaryButtonUrl?: string;
  secondaryButtonText?: BilingualText;
  secondaryButtonUrl?: string;
}

export interface HomepageSupportBanner {
  title: BilingualText;
  subtitle?: BilingualText;
  description?: BilingualText;
  primaryCtaText?: BilingualText;
  primaryCtaUrl?: string;
  secondaryCtaText?: BilingualText;
  secondaryCtaUrl?: string;
  primaryButtonText?: BilingualText;
  primaryButtonUrl?: string;
  secondaryButtonText?: BilingualText;
  secondaryButtonUrl?: string;
}

export interface SectionHeaderConfig {
  badge?: BilingualText;
  title?: BilingualText;
  subtitle?: BilingualText;
  viewAllText?: BilingualText;
  viewAllUrl?: string;
  readArticleText?: BilingualText;
  [key: string]: any;
}

export interface CampaignsSectionConfig extends SectionHeaderConfig {
  featuredBadgeText?: BilingualText;
  featuredDetailsText?: BilingualText;
  featuredDetailsUrl?: string;
  featuredSupportText?: BilingualText;
  featuredSupportUrl?: string;
}

export interface LifeLineSectionConfig extends SectionHeaderConfig {
  narrativeChips?: BilingualText[];
  chip1?: BilingualText;
  chip2?: BilingualText;
  chip3?: BilingualText;
  chip4?: BilingualText;
  description?: BilingualText;
  findDonorBtnText?: BilingualText;
  findDonorBtnUrl?: string;
  becomeDonorBtnText?: BilingualText;
  becomeDonorBtnUrl?: string;
  emergencyReqBtnText?: BilingualText;
  emergencyReqBtnUrl?: string;
  coordinationTitle?: BilingualText;
  coordinationBadge?: BilingualText;
  portalLinkText?: BilingualText;
  portalUrl?: string;
}

export interface TransparencySectionConfig extends SectionHeaderConfig {
  pill1?: BilingualText;
  pill2?: BilingualText;
  pill3?: BilingualText;
}

export interface HomepageConfig {
  hero: HeroConfig;
  aboutPreview: AboutPreviewConfig;
  volunteerBanner?: HomepageVolunteerBanner;
  supportBanner?: HomepageSupportBanner;
  impactSection?: SectionHeaderConfig;
  programsSection?: SectionHeaderConfig;
  campaignsSection?: CampaignsSectionConfig;
  storiesSection?: SectionHeaderConfig;
  lifelineSection?: LifeLineSectionConfig;
  gallerySection?: SectionHeaderConfig;
  pressSection?: SectionHeaderConfig;
  transparencySection?: TransparencySectionConfig;
  sectionHeaders?: Record<string, SectionHeaderConfig>;
  sectionOrder: string[]; // e.g. ['hero', 'impact', 'about', 'programs', 'campaigns', 'stories', 'lifeline', 'gallery', 'press', 'volunteer', 'transparency', 'support']
  sectionVisibility: {
    hero?: boolean;
    impact?: boolean;
    about?: boolean;
    programs?: boolean;
    campaigns?: boolean;
    stories?: boolean;
    lifeline?: boolean;
    blood_donation?: boolean;
    gallery?: boolean;
    press?: boolean;
    volunteer?: boolean;
    transparency?: boolean;
    support?: boolean;
    [key: string]: boolean | undefined;
  };
}

// ----------------------------------------------------
// GLOBAL HEADER, FOOTER, AND NAVIGATION
// ----------------------------------------------------
export interface HeaderSettings {
  logoUrl: string;
  logoAlt: string;
  showNoticeBar: boolean;
  noticeBarText: BilingualText;
  noticeBarLink?: string;
  noticeBarButtonText?: BilingualText;
  showNoticeBarButton?: boolean;
  showSearch: boolean;
  showLanguageSwitcher: boolean;
  supportButtonText: BilingualText;
  supportButtonUrl: string;
  showSupportButton: boolean;
}

export interface FooterLinkItem {
  label: BilingualText;
  url: string;
  isExternal?: boolean;
}

export interface FooterColumn {
  title: BilingualText;
  links: FooterLinkItem[];
}

export interface FooterSettings {
  footerLogoUrl: string;
  description: BilingualText;
  address: string;
  phone: string;
  email: string;
  copyrightText: BilingualText;
  establishedYear?: string;
  showNewsletter?: boolean;
  showCallout?: boolean;
  navColumns?: FooterColumn[];
  calloutEyebrow?: BilingualText;
  calloutTitle?: BilingualText;
  calloutSubtitle?: BilingualText;
  volunteerCtaText?: BilingualText;
  volunteerCtaUrl?: string;
  supportCtaText?: BilingualText;
  supportCtaUrl?: string;
}

export type SocialPlatform = 'facebook' | 'youtube' | 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label: string;
  active: boolean;
  displayOrder: number;
}

export interface NavigationSubItem {
  id: string;
  label: BilingualText;
  path: PageRoute | string;
  isExternal?: boolean;
  active?: boolean;
  isNestedDropdown?: boolean;
  children?: NavigationSubItem[];
}

export interface NavigationItem {
  id: string;
  label: BilingualText;
  path: PageRoute | string;
  isExternal?: boolean;
  isDropdown?: boolean;
  children?: NavigationSubItem[];
  displayOrder: number;
  active: boolean;
}

// ----------------------------------------------------
// BANNERS & PROMOTIONS
// ----------------------------------------------------
export interface BannerItem {
  id: string;
  title: BilingualText;
  subtitle?: BilingualText;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  ctaText?: BilingualText;
  ctaUrl?: string;
  openInNewTab?: boolean;
  startDate?: string;
  endDate?: string;
  placement: 'homepage_hero' | 'announcement_top' | 'campaign_feature' | 'popup';
  displayOrder: number;
  active: boolean;
}

// ----------------------------------------------------
// MEDIA LIBRARY & GALLERIES
// ----------------------------------------------------
export type MediaCategory =
  | 'Hero'
  | 'Campaigns'
  | 'Relief Campaigns'
  | 'Volunteer Drives'
  | 'Community Impact'
  | 'Volunteers'
  | 'Events'
  | 'Children & Community'
  | 'Logos'
  | 'Banners'
  | 'Stories'
  | 'Gallery'
  | 'Documents'
  | 'General';

export type MediaType = 'image' | 'video';
export type MediaSourceType = 'upload' | 'url' | 'youtube' | 'facebook' | 'direct';
export type MediaPlatform = 'local' | 'cloudinary' | 'youtube' | 'facebook' | 'direct';

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  fileSize: string;
  mimeType: string;
  category: MediaCategory;
  altText: string;
  caption?: string;
  uploadedAt: string;
  usageTags: string[]; // e.g. ['Homepage Hero', 'Eid Joy Campaign']
  type?: MediaType;
  sourceType?: MediaSourceType;
  platform?: MediaPlatform;
  embedUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  aspectRatio?: '1:1' | '4:5' | '3:4' | '4:3' | '16:9' | '21:9' | '9:16' | '16/9' | '9/16' | 'landscape' | 'portrait' | 'free' | string;
  isShorts?: boolean;
  status?: 'published' | 'draft';
  isFeatured?: boolean;
  duration?: string;
  updatedAt?: string;
}

export interface GalleryPhoto {
  id: string;
  albumId?: string;
  title: BilingualText;
  caption?: BilingualText;
  imageUrl: string;
  category: 'Campaigns' | 'Volunteers' | 'Children' | 'Events' | 'Distribution' | 'Awareness' | 'Community' | string;
  date: string;
  location?: BilingualText | string;
  campaignSlug?: string;
  displayOrder?: number;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: BilingualText;
  description: BilingualText;
  coverImageUrl: string;
  category: string;
  date: string;
  photos: GalleryPhoto[];
  isPublished: boolean;
  displayOrder: number;
}

// ----------------------------------------------------
// PROGRAM, CAMPAIGN & IMPACT ENTITIES
// ----------------------------------------------------
export interface ImpactMetric {
  id: string;
  label: BilingualText;
  value: string; // e.g. "15,000+", "350+", "45+", "10+ Years"
  description: BilingualText;
  iconName: string;
  order: number;
  active?: boolean;
}

export interface Program {
  id: string;
  slug: string;
  title: BilingualText;
  category: string;
  shortDescription: BilingualText;
  fullDetails: BilingualText;
  fullDescription?: BilingualText;
  impactHighlights: BilingualList;
  impactPoints?: BilingualList | string[];
  imageUrl: string;
  iconName: string;
  status: 'active' | 'planning' | 'archived';
  displayOrder?: number;
  eventsCount?: number;
  featuredEventId?: string;
}

export interface ProgramEventMetric {
  label: BilingualText;
  value: string;
}

export interface ProgramEvent {
  id: string;
  programId: string;
  slug: string;
  title: BilingualText;
  year: number;
  dateRange?: BilingualText;
  startDate?: string;
  endDate?: string;
  location: BilingualText;
  coverImageUrl: string;
  shortDescription: BilingualText;
  fullStory?: BilingualText;
  objectives?: BilingualList;
  impactMetrics?: ProgramEventMetric[];
  status: 'completed' | 'ongoing' | 'upcoming' | 'archived';
  displayOrder?: number;
  isFeatured?: boolean;
}

export interface EventMedia {
  id: string;
  eventId: string;
  mediaId: string;
  isHighlight: boolean;
  highlightOrder?: number;
  customCaption?: BilingualText;
  customAlt?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: BilingualText;
  date: string;
  endDate?: string;
  location: BilingualText;
  category: string;
  description: BilingualText;
  details?: BilingualText;
  objectives: BilingualList;
  activities: BilingualList;
  beneficiaries?: BilingualText;
  beneficiariesCount?: number | string;
  volunteersCount?: number | string;
  impact?: BilingualText;
  status: 'active' | 'upcoming' | 'completed' | 'archived';
  isFeatured: boolean;
  targetAmountBDT?: string;
  raisedAmountBDT?: string;
  imageUrl: string;
  galleryImages: string[];
  videoUrl?: string;
  reportUrl?: string;
  displayOrder?: number;
}

export interface ImpactStory {
  id: string;
  slug: string;
  title: BilingualText;
  personOrCommunity: BilingualText;
  location: BilingualText;
  date: string;
  story: BilingualText;
  impact: BilingualText;
  imageUrl: string;
  campaignSlug?: string;
  consentConfirmed: boolean;
  isFeatured?: boolean;
  status?: 'published' | 'draft' | 'archived';
  tags?: string[];
  seoTitle?: BilingualText;
  seoDescription?: BilingualText;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: BilingualText;
  excerpt: BilingualText;
  content: BilingualText;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
}

export type PressCoverageType = 'newspaper' | 'tv' | 'online' | 'blog' | 'social';

export interface PressCoverage {
  id: string;
  outletName: string; // e.g. "Prothom Alo", "The Daily Star", "Somoy TV", "Personal Blog"
  outletLogoUrl?: string;
  title: BilingualText;
  articleUrl: string; // Target external link opening in new tab
  excerpt: BilingualText;
  coverageType: PressCoverageType;
  publishedDate: string;
  imageUrl?: string;
  isFeatured?: boolean;
  status: 'published' | 'hidden';
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: BilingualText;
  date: string;
  time: string;
  location: BilingualText;
  description: BilingualText;
  imageUrl: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationOpen: boolean;
}

export interface VideoItem {
  id: string;
  title: BilingualText;
  videoUrl: string;
  platform: 'youtube' | 'facebook' | 'direct' | 'custom' | string;
  duration?: string;
  thumbnailUrl: string;
  date: string;
  description: BilingualText;
  embedUrl?: string;
  category?: string;
  status?: 'published' | 'draft' | string;
  isFeatured?: boolean;
  sourceType?: 'youtube' | 'facebook' | 'url' | 'upload' | string;
  aspectRatio?: '16/9' | '9/16' | '16:9' | '9:16' | 'landscape' | 'portrait' | string;
  isShorts?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransparencyReport {
  id: string;
  title: BilingualText;
  type: 'Annual Report' | 'Campaign Report' | 'Financial Audit' | 'Policy' | 'Legal/Registration Document' | string;
  year: string;
  description: BilingualText;
  uploadDate: string;
  fileUrl: string;
  fileSize: string;
  status: 'official' | 'pending_verification' | 'draft';
  displayOrder?: number;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  type: 'Institutional' | 'Community Alliance' | 'Resource Partner' | 'Academic';
  description: BilingualText;
  partnershipYear: string;
  since?: string;
}

// ----------------------------------------------------
// VOLUNTEER, DONATION & CONTACT SETTINGS
// ----------------------------------------------------
export interface VolunteerSettings {
  ctaText: BilingualText;
  googleFormUrl: string;
  googleScriptUrl?: string; // Google Apps Script Web App Webhook URL
  googleSheetUrl?: string; // Linked Google Sheet view URL
  description: BilingualText;
  coverImageUrl: string;
  benefits: BilingualList;
  requirements: BilingualList;
  contactEmail: string;
}

export interface SupportSettings {
  ctaText: BilingualText;
  description: BilingualText;
  bKashNumber: string;
  bkashNumber?: string;
  bKashType: string;
  nagadNumber: string;
  nagadType: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName: string;
    routingNumber: string;
  };
  qrCodeImageUrl?: string;
  paymentInstructions: BilingualText;
  supportEmail: string;
  supportPhone: string;
}

export interface ContactSettings {
  address: BilingualText;
  phone: string;
  email: string;
  officeHours: BilingualText;
  workingHours?: BilingualText | string;
  title?: BilingualText | string;
  subtitle?: BilingualText | string;
  googleMapsEmbedUrl: string;
  emergencyHelpline?: string;
}

export type EducationCategory =
  | 'high_school' // উচ্চ বিদ্যালয়ে অধ্যয়নরত (SSC পাস করেনি)
  | 'ssc' // SSC / সমমান পাস
  | 'hsc' // HSC / সমমান পাস
  | 'diploma' // Diploma
  | 'honours' // Honours (স্নাতক / অনার্স)
  | 'masters' // Masters (স্নাতকোত্তর / মাস্টার্স)
  | 'other'; // অন্যান্য

export interface VolunteerApplication {
  id: string;
  // Section 1: Basic Profile & Photo
  fullName: string;
  fullNameBn?: string;
  fullNameEn?: string;
  email: string;
  photoUrl?: string;
  photoBase64?: string;

  // Section 2: Family & Guardian
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;

  // Section 3: Address & Contact
  phone: string;
  whatsapp?: string;
  facebookUrl?: string;
  district: string;
  upazila?: string;
  presentAddressDetails?: string;
  permanentDistrict?: string;
  permanentUpazila?: string;
  permanentAddressDetails?: string;
  isSameAddress?: boolean;

  // Section 4: Personal & Health
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
  bloodGroup?: string;
  nidOrBirthCert?: string;
  age?: number | string;

  // Section 5: Educational Information (Conditional)
  educationCategory?: EducationCategory | string;
  occupation?: string;
  // High School
  schoolName?: string;
  currentClass?: string;
  expectedSscYear?: string;
  // SSC
  sscInstitution?: string;
  sscGroup?: string;
  sscPassingYear?: string;
  sscBoard?: string;
  // HSC
  hscInstitution?: string;
  hscGroup?: string;
  hscPassingYear?: string;
  hscBoard?: string;
  // Diploma
  diplomaTechnology?: string;
  diplomaInstitute?: string;
  diplomaDepartment?: string;
  diplomaSemester?: string;
  diplomaStatus?: 'running' | 'completed' | string;
  diplomaPassingYear?: string;
  // Honours
  honoursInstitute?: string;
  honoursSubject?: string;
  honoursDepartment?: string;
  honoursYear?: string;
  honoursStatus?: 'running' | 'completed' | string;
  honoursPassingYear?: string;
  // Masters
  mastersInstitute?: string;
  mastersSubject?: string;
  mastersDepartment?: string;
  mastersStatus?: 'running' | 'completed' | string;
  mastersPassingYear?: string;
  // Other
  otherEducation?: string;

  // Section 6: Skills & Availability
  skills?: string[];
  areasOfInterest?: string[];
  interests?: string[];
  availability?: string;

  // Section 7: Infinity & Motivation
  referralSource?: string;
  hasPreviousVolunteering?: boolean;
  previousExperience?: string;
  motivation?: string;
  message?: string;

  // Section 8: Agreement & Status
  agreedCodeOfConduct?: boolean;
  agreedTruthfulness?: boolean;
  consent?: boolean;
  trackingRef?: string;
  drivePhotoUrl?: string;
  sheetSynced?: boolean;
  submittedAt?: string;
  appliedAt?: string;
  status: 'New' | 'Reviewing' | 'Approved' | 'Rejected' | 'Contacted' | 'approved' | 'pending' | 'contacted';
  adminNotes?: string;
}

export interface DonationRecord {
  id: string;
  receiptNumber?: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount?: number;
  amountBDT?: number;
  currency?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  donationType?: 'one-time' | 'monthly' | 'campaign-specific' | string;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Online Gateway' | 'In-Kind / Physical Support' | string;
  transactionId?: string;
  date?: string;
  donatedAt?: string;
  status: 'Pending' | 'Successful' | 'Failed' | 'Refunded' | 'received' | 'pending' | string;
  isAnonymous?: boolean;
  notes?: string;
  note?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'Unread' | 'Read' | 'Replied' | 'Archived';
}

export interface FAQItem {
  id: string;
  question: BilingualText;
  answer: BilingualText;
  category?: string;
  displayOrder?: number;
  active?: boolean;
}

// ----------------------------------------------------
// SITE SETTINGS, SEO & AUDIT
// ----------------------------------------------------
export interface ExecutiveTierBar {
  id: string;
  title: BilingualText;
  visible: boolean;
  rangeLabel?: string;
}

export interface SiteSettings {
  organizationName: any;
  teamIdentity: string;
  tagline: string;
  slogan?: BilingualText;
  primary_slogan?: BilingualText;
  establishedYear?: string;
  headquartersLocation?: string;
  logoUrl?: string;
  faviconUrl?: string;
  country: string;
  officialAddress: any;
  officialPhone: string;
  officialEmail: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  bKashNumber: string;
  nagadNumber: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName: string;
    routingNumber: string;
  };
  bannerAnnouncement: BilingualText;
  showAnnouncementBanner: boolean;
  registrationNumber: string;
  executiveTierBars?: ExecutiveTierBar[];
}

export interface AboutSettings {
  title: BilingualText;
  subtitle: BilingualText;
  mission: BilingualText;
  vision: BilingualText;
  history: BilingualText;
  establishedYear: string;
  location: string;
  heroImageUrl: string;
  secondaryImageUrl?: string;
  ctaText?: BilingualText;
  ctaUrl?: string;
  journeyVideoArchiveEnabled?: boolean;
}

export interface GlobalSEOSettings {
  siteTitle: BilingualText;
  metaDescription: BilingualText;
  keywords: string[];
  ogImageUrl: string;
  organizationName: string;
  canonicalUrl: string;
}

export interface PageSEO {
  id: string;
  pageRoute: string;
  title: BilingualText;
  metaDescription: BilingualText;
  ogTitle?: BilingualText;
  ogDescription?: BilingualText;
  ogImageUrl?: string;
  keywords?: string[];
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityType?: string;
  entityId: string;
  timestamp: string;
  details: string;
}

// ----------------------------------------------------
// COMMITTEES & LEADERSHIP
// ----------------------------------------------------
export type CommitteeType = 'EXECUTIVE' | 'STANDING' | 'SPECIAL' | 'PAST' | 'OTHER';

export interface Committee {
  id: string;
  slug: string;
  name: BilingualText;
  type: CommitteeType;
  year: string;
  description: BilingualText;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  sortOrder: number;
  isFeatured: boolean;
  bannerImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Person {
  id: string;
  fullName: string;
  banglaName: string;
  englishName: string;
  photoUrl?: string;
  photoPosition?: string; // e.g. 'center top', '50% 15%', 'center center'
  photoZoom?: number; // scale multiplier e.g. 1.0 to 2.0
  shortBio?: BilingualText;
  fullBio?: BilingualText;
  district?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
    phone?: string;
  };
  joiningYear?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Position {
  id: string;
  name: BilingualText;
  level: number; // 1 = President/Top, 2 = VP/Senior VP, 3 = GS, 4 = Joint/Dept Secretary, 5 = Member
  sortOrder: number;
  description?: BilingualText;
}

export interface CommitteeMember {
  id: string;
  committeeId: string;
  personId: string;
  positionId: string;
  serialNumber: number; // 1, 2, 3 ... 27
  sortOrder: number;
  isFeaturedLeader: boolean;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'FORMER' | 'INACTIVE' | 'ARCHIVED';
  person?: Person;
  position?: Position;
  committee?: Committee;
}

// ----------------------------------------------------
// JOURNEY VIDEO ARCHIVE (ABOUT PAGE)
// ----------------------------------------------------
export interface JourneyVideo {
  id: string;
  title: BilingualText;
  timelineLabel: BilingualText;
  description: BilingualText;
  category: string;
  videoUrl: string;
  videoPlatform: 'auto' | 'youtube' | 'facebook' | 'direct' | string;
  embedUrl?: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// BLOOD DONATION NETWORK TYPES
// ----------------------------------------------------
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type DonorAvailabilityStatus = 'AVAILABLE_EMERGENCY' | 'AVAILABLE_NOTICE' | 'UNAVAILABLE';

export type DonorApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type EmergencyLevel = 'CRITICAL' | 'URGENT' | 'NORMAL';

export type EmergencyRequestStatus = 'PENDING' | 'PROCESSING' | 'FULFILLED' | 'CANCELLED';

export interface BloodDonationHistoryEntry {
  id: string;
  donorId: string;
  donationDate: string; // YYYY-MM-DD
  hospital: string;
  district: string;
  donationType: 'VOLUNTARY' | 'EMERGENCY' | 'CAMPAIGN';
  recipientReference?: string;
  notes?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface BloodDonor {
  id: string;
  fullName: string;
  bloodGroup: BloodGroup;
  gender?: 'Male' | 'Female' | 'Other' | string;
  dateOfBirth?: string;
  dob?: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  district: string;
  upazila: string;
  area: string;
  detailedAddress?: string; // Private / Admin only
  orgCategory: string; // 'Open Voluntary Blood Donor' | 'Executive Committee' | 'Standing Committee' | 'Infinity Bangladesh Member' | custom
  committeePosition?: string;
  availabilityStatus: DonorAvailabilityStatus;
  firstDonationDate?: string;
  lastDonationDate?: string;
  totalDonations: number;
  experienceNotes?: string;
  isVerified: boolean;
  approvalStatus: DonorApprovalStatus;
  privacyConsent: boolean;
  showPhonePublicly: boolean;
  donationHistory?: BloodDonationHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyBloodRequest {
  id: string;
  requesterName: string;
  contactNumber: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  district: string;
  upazila: string;
  emergencyLevel: EmergencyLevel;
  requiredDate: string;
  additionalNotes?: string;
  status: EmergencyRequestStatus;
  matchedDonorIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodDonationSettings {
  wingLogoUrl?: string;
  wingLogoSize?: number;
  wingLogoZoom?: number;
  wingLogoCrop?: 'contain' | 'cover' | 'fill' | 'none';
  heroBadge?: BilingualText;
  heroTitle: BilingualText;
  heroSubtitle: BilingualText;
  heroCtaBadge?: BilingualText;
  heroCtaTitle?: BilingualText;
  heroCtaDescription?: BilingualText;
  heroCtaBtn1Text?: BilingualText;
  heroCtaBtn2Text?: BilingualText;
  statTotalDonorsLabel?: BilingualText;
  statActiveDonorsLabel?: BilingualText;
  statGroupsLabel?: BilingualText;
  statGroupsValue?: string;
  statImpactLabel?: BilingualText;
  statTotalDonorsOverride?: number | null;
  statActiveDonorsOverride?: number | null;
  statImpactOverride?: number | null;
  emergencyHelpline: string;
  helplineLabel?: BilingualText;
  coordinationEmail: string;
  guidelinesTitle: BilingualText;
  guidelinesText: BilingualText;
  consentStatement: BilingualText;
  enablePublicDirectContact: boolean;
}

export interface DonorCategoryOption {
  id: string;
  name: BilingualText;
  badgeColor?: string;
  displayOrder: number;
  isDefault?: boolean;
}


