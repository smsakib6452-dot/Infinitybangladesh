import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Campaign,
  Program,
  ProgramEvent,
  EventMedia,
  ImpactMetric,
  ImpactStory,
  NewsArticle,
  EventItem,
  GalleryPhoto,
  VideoItem,
  TransparencyReport,
  Partner,
  VolunteerApplication,
  DonationRecord,
  ContactMessage,
  SiteSettings,
  AuditLog,
  Committee,
  Person,
  Position,
  CommitteeMember,
  HomepageConfig,
  AboutSettings,
  HeaderSettings,
  FooterSettings,
  SocialLink,
  VolunteerSettings,
  SupportSettings,
  ContactSettings,
  GlobalSEOSettings,
  NavigationItem,
  BannerItem,
  MediaItem,
  GalleryAlbum,
  AdminProfile,
  FAQItem,
  PressCoverage,
  JourneyVideo,
  BloodDonor,
  BloodDonationHistoryEntry,
  EmergencyBloodRequest,
  BloodDonationSettings,
  DonorCategoryOption,
  EmergencyRequestStatus,
  BloodGroup
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_PROGRAMS,
  INITIAL_PROGRAM_EVENTS,
  INITIAL_EVENT_MEDIA,
  INITIAL_IMPACT_METRICS,
  INITIAL_IMPACT_STORIES,
  INITIAL_NEWS,
  INITIAL_EVENTS,
  INITIAL_GALLERY,
  INITIAL_VIDEOS,
  INITIAL_REPORTS,
  INITIAL_PARTNERS,
  INITIAL_SITE_SETTINGS,
  INITIAL_VOLUNTEER_APPLICATIONS,
  INITIAL_DONATIONS,
  INITIAL_POSITIONS,
  INITIAL_COMMITTEES,
  INITIAL_PERSONS,
  INITIAL_COMMITTEE_MEMBERS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_ABOUT_SETTINGS,
  INITIAL_HEADER_SETTINGS,
  INITIAL_FOOTER_SETTINGS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_VOLUNTEER_SETTINGS,
  INITIAL_SUPPORT_SETTINGS,
  INITIAL_CONTACT_SETTINGS,
  INITIAL_SEO_SETTINGS,
  INITIAL_NAVIGATION_ITEMS,
  INITIAL_BANNERS,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_GALLERY_ALBUMS,
  INITIAL_ADMIN_PROFILES,
  INITIAL_FAQS,
  INITIAL_PRESS_COVERAGE,
  INITIAL_JOURNEY_VIDEOS,
  DEFAULT_EXECUTIVE_TIER_BARS,
  INITIAL_BLOOD_DONORS,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_BLOOD_SETTINGS,
  DEFAULT_DONOR_CATEGORIES
} from '../data/initialData';
import { cleanBloodDonor, cleanEmergencyRequest } from '../data/bloodDonationData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFreshImageUrl } from '../lib/cloudinary';
import { detectAndNormalizeMedia, DEFAULT_VIDEO_THUMBNAIL } from '../lib/utils/mediaHelper';

interface DataContextType {
  // Entities
  campaigns: Campaign[];
  programs: Program[];
  programEvents: ProgramEvent[];
  eventMediaList: EventMedia[];
  metrics: ImpactMetric[];
  stories: ImpactStory[];
  news: NewsArticle[];
  events: EventItem[];
  gallery: GalleryPhoto[];
  videos: VideoItem[];
  journeyVideos: JourneyVideo[];
  bloodDonors: BloodDonor[];
  emergencyBloodRequests: EmergencyBloodRequest[];
  bloodDonationSettings: BloodDonationSettings;
  donorCategories: DonorCategoryOption[];
  reports: TransparencyReport[];
  partners: Partner[];
  volunteers: VolunteerApplication[];
  donations: DonationRecord[];
  messages: ContactMessage[];
  faqs: FAQItem[];
  settings: SiteSettings;
  homepageConfig: HomepageConfig;
  aboutSettings: AboutSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  socialLinks: SocialLink[];
  volunteerSettings: VolunteerSettings;
  supportSettings: SupportSettings;
  contactSettings: ContactSettings;
  seoSettings: GlobalSEOSettings;
  navigationItems: NavigationItem[];
  banners: BannerItem[];
  mediaLibrary: MediaItem[];
  galleryAlbums: GalleryAlbum[];
  pressCoverages: PressCoverage[];
  adminProfiles: AdminProfile[];
  auditLogs: AuditLog[];
  committees: Committee[];
  persons: Person[];
  positions: Position[];
  committeeMembers: CommitteeMember[];

  // System & Connection State
  isLiveSupabase: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  previewMode: boolean;

  // Mutations: Homepage & Global CMS Settings
  updateHomepageConfig: (newConfig: Partial<HomepageConfig>) => void;
  updateAboutSettings: (newSettings: Partial<AboutSettings>) => void;
  updateHeaderSettings: (newSettings: Partial<HeaderSettings>) => void;
  updateFooterSettings: (newSettings: Partial<FooterSettings>) => void;
  updateVolunteerSettings: (newSettings: Partial<VolunteerSettings>) => void;
  updateSupportSettings: (newSettings: Partial<SupportSettings>) => void;
  updateContactSettings: (newSettings: Partial<ContactSettings>) => void;
  updateSEOSettings: (newSettings: Partial<GlobalSEOSettings>) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;

  // FAQs
  addFAQ: (faq: Omit<FAQItem, 'id'>) => FAQItem;
  updateFAQ: (id: string, faq: Partial<FAQItem>) => void;
  deleteFAQ: (id: string) => void;

  // Contact Messages
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>) => ContactMessage;

  // Social Links
  addSocialLink: (link: Omit<SocialLink, 'id'>) => void;
  updateSocialLink: (id: string, link: Partial<SocialLink>) => void;
  deleteSocialLink: (id: string) => void;

  // Navigation
  addNavigationItem: (item: Omit<NavigationItem, 'id'>) => void;
  updateNavigationItem: (id: string, item: Partial<NavigationItem>) => void;
  deleteNavigationItem: (id: string) => void;
  reorderNavigationItems: (items: NavigationItem[]) => void;

  // Banners
  addBanner: (banner: Omit<BannerItem, 'id'>) => void;
  updateBanner: (id: string, banner: Partial<BannerItem>) => void;
  deleteBanner: (id: string) => void;

  // Media Library & Albums
  addMediaItem: (media: Omit<MediaItem, 'id' | 'uploadedAt'>) => MediaItem;
  updateMediaItem: (id: string, media: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  addGalleryAlbum: (album: Omit<GalleryAlbum, 'id'>) => GalleryAlbum;
  updateGalleryAlbum: (id: string, album: Partial<GalleryAlbum>) => void;
  deleteGalleryAlbum: (id: string) => void;
  setAlbumPhotos: (albumId: string, photoIds: string[]) => void;

  // Press & Media Coverage
  addPressCoverage: (press: Omit<PressCoverage, 'id'>) => PressCoverage;
  updatePressCoverage: (id: string, press: Partial<PressCoverage>) => void;
  deletePressCoverage: (id: string) => void;

  // Core Programs & Campaigns
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Campaign;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  addProgram: (program: Omit<Program, 'id'>) => Program;
  updateProgram: (id: string, program: Partial<Program>) => void;
  deleteProgram: (id: string) => void;

  // Program Events / Editions
  addProgramEvent: (event: Omit<ProgramEvent, 'id'>) => ProgramEvent;
  updateProgramEvent: (id: string, updates: Partial<ProgramEvent>) => void;
  deleteProgramEvent: (id: string) => void;
  reorderProgramEvents: (programId: string, orderedIds: string[]) => void;

  // Event Media & Highlights Curation
  addMediaToEvent: (eventId: string, mediaId: string, isHighlight?: boolean, caption?: { en: string; bn: string }) => EventMedia;
  removeMediaFromEvent: (eventId: string, mediaId: string) => void;
  toggleEventHighlight: (eventId: string, mediaId: string, isHighlight?: boolean) => void;
  reorderEventHighlights: (eventId: string, orderedMediaIds: string[]) => void;
  setEventHighlights: (eventId: string, highlightMediaIds: string[]) => void;

  // Helper Selectors for Program Architecture
  getEventsByProgramId: (programId: string) => ProgramEvent[];
  getProgramEventBySlug: (programSlug: string, eventSlug: string) => { program?: Program; event?: ProgramEvent } | null;
  getEventMedia: (eventId: string) => (EventMedia & { media: MediaItem })[];
  getEventHighlights: (eventId: string) => (EventMedia & { media: MediaItem })[];

  addMetric: (metric: Omit<ImpactMetric, 'id'>) => ImpactMetric;
  updateMetric: (id: string, metric: Partial<ImpactMetric>) => void;
  deleteMetric: (id: string) => void;

  addStory: (story: Omit<ImpactStory, 'id'>) => ImpactStory;
  updateStory: (id: string, story: Partial<ImpactStory>) => void;
  deleteStory: (id: string) => void;

  addNews: (newsItem: Omit<NewsArticle, 'id'>) => NewsArticle;
  updateNews: (id: string, newsItem: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;

  addEvent: (eventItem: Omit<EventItem, 'id'>) => EventItem;
  updateEvent: (id: string, eventItem: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;

  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id'>) => GalleryPhoto;
  updateGalleryPhoto: (id: string, photo: Partial<GalleryPhoto>) => void;
  deleteGalleryPhoto: (id: string) => void;

  addVideo: (video: Omit<VideoItem, 'id'>) => VideoItem;
  updateVideo: (id: string, video: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  reorderVideos: (orderedIds: string[]) => void;

  // Journey Videos (About Overview & Story)
  addJourneyVideo: (video: Omit<JourneyVideo, 'id' | 'createdAt' | 'updatedAt'>) => JourneyVideo;
  updateJourneyVideo: (id: string, video: Partial<JourneyVideo>) => void;
  deleteJourneyVideo: (id: string) => void;
  reorderJourneyVideos: (orderedIds: string[]) => void;
  setFeaturedJourneyVideo: (id: string) => void;

  // Blood Donation Network
  addBloodDonor: (donor: Omit<BloodDonor, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => BloodDonor;
  updateBloodDonor: (id: string, updates: Partial<BloodDonor>) => void;
  deleteBloodDonor: (id: string) => void;
  approveBloodDonor: (id: string) => void;
  rejectBloodDonor: (id: string) => void;
  verifyBloodDonor: (id: string, isVerified?: boolean) => void;
  addDonationHistoryEntry: (donorId: string, entry: Omit<BloodDonationHistoryEntry, 'id' | 'donorId' | 'createdAt'>) => BloodDonationHistoryEntry;
  deleteDonationHistoryEntry: (donorId: string, entryId: string) => void;
  addEmergencyBloodRequest: (req: Omit<EmergencyBloodRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => EmergencyBloodRequest;
  updateEmergencyBloodRequestStatus: (id: string, status: EmergencyRequestStatus) => void;
  deleteEmergencyBloodRequest: (id: string) => void;
  updateBloodDonationSettings: (settings: Partial<BloodDonationSettings>) => void;
  addDonorCategory: (category: Omit<DonorCategoryOption, 'id'>) => DonorCategoryOption;
  updateDonorCategory: (id: string, updates: Partial<DonorCategoryOption>) => void;
  deleteDonorCategory: (id: string) => void;

  addReport: (report: Omit<TransparencyReport, 'id'>) => TransparencyReport;
  updateReport: (id: string, report: Partial<TransparencyReport>) => void;
  deleteReport: (id: string) => void;

  addPartner: (partner: Omit<Partner, 'id'>) => Partner;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;

  // Interactions: Volunteers, Donations, Messages
  submitVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>) => string;
  addVolunteerApplication: (app: Partial<VolunteerApplication>) => string;
  updateVolunteerStatus: (id: string, status: VolunteerApplication['status'], adminNotes?: string) => void;
  deleteVolunteerApplication: (id: string) => void;

  submitDonation: (donation: Omit<DonationRecord, 'id' | 'date' | 'status'>) => string;
  addDonationRecord: (donation: Partial<DonationRecord>) => DonationRecord;
  updateDonationStatus: (id: string, status: DonationRecord['status']) => void;

  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>) => void;
  updateMessageStatus: (id: string, status: ContactMessage['status']) => void;
  deleteContactMessage: (id: string) => void;

  // Admin Profiles & Roles
  addAdminProfile: (profile: Omit<AdminProfile, 'id'>) => AdminProfile;
  updateAdminProfile: (id: string, profile: Partial<AdminProfile>) => void;
  deleteAdminProfile: (id: string) => void;

  // Committee & Leadership Mutations
  addCommittee: (committee: Omit<Committee, 'id'>) => Committee;
  updateCommittee: (id: string, committee: Partial<Committee>) => void;
  deleteCommittee: (id: string) => void;
  archiveCommittee: (id: string) => void;
  setActiveCommittee: (id: string) => void;

  addPerson: (person: Omit<Person, 'id'>) => Person;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  addPosition: (pos: Omit<Position, 'id'>) => Position;
  updatePosition: (id: string, pos: Partial<Position>) => void;
  deletePosition: (id: string) => void;

  addCommitteeMember: (member: Omit<CommitteeMember, 'id'>) => CommitteeMember;
  updateCommitteeMember: (id: string, member: Partial<CommitteeMember>) => void;
  deleteCommitteeMember: (id: string) => void;
  reorderCommitteeMembers: (committeeId: string, orderedMemberIds: string[]) => void;
  getMembersWithDetails: (committeeId?: string) => (CommitteeMember & { person: Person; position: Position; committee?: Committee })[];

  // Global System Controls
  setPreviewMode: (enabled: boolean) => void;
  syncWithSupabase: (forceAdmin?: boolean) => Promise<void>;
  loadAdminData: () => Promise<void>;
  isAdminLoaded: boolean;
  pushAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  resetToDefaultData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const CURRENT_DATA_VERSION = '2026.08.27.1788020980284';
const DATA_VERSION_KEY = 'infinity_data_version';
const STORAGE_PREFIX = 'infinity_bd_v2_';

// Safe version marker without deleting user customized data
(() => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!localStorage.getItem(DATA_VERSION_KEY)) {
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      }
    }
  } catch (e) {
    console.warn('Storage check warning:', e);
  }
})();

function getStoredOrDefault<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);

  // Deleted IDs tracker to prevent resurrection across page reloads & sync
  const deletedIdsRef = useRef<Set<string>>(new Set(getStoredOrDefault<string[]>('deleted_video_ids', [])));
  const deletedDonorIdsRef = useRef<Set<string>>(new Set(getStoredOrDefault<string[]>('deleted_donor_ids', [])));
  const deletedRequestIdsRef = useRef<Set<string>>(new Set(getStoredOrDefault<string[]>('deleted_emergency_request_ids', [])));

  // 1. Site Settings & Global Configurations
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const stored = getStoredOrDefault<SiteSettings>('settings', INITIAL_SITE_SETTINGS);
    if (stored?.executiveTierBars && Array.isArray(stored.executiveTierBars)) {
      stored.executiveTierBars = stored.executiveTierBars.map(b => {
        if (b.id === 'organizingFinance' && (b.title?.en === 'Organizing & Finance Secretariat' || b.title?.bn === 'সাংগঠনিক ও অর্থ বিভাগ')) {
          return {
            ...b,
            title: {
              en: 'Other Executive Committee Members',
              bn: 'অন্যান্য কার্যনির্বাহী কমিটির সদস্যবৃন্দ'
            }
          };
        }
        return b;
      });
    } else {
      stored.executiveTierBars = DEFAULT_EXECUTIVE_TIER_BARS;
    }
    return stored;
  });
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => {
    const stored = getStoredOrDefault<HomepageConfig>('homepageConfig', INITIAL_HOMEPAGE_CONFIG);
    return {
      ...INITIAL_HOMEPAGE_CONFIG,
      ...stored,
      hero: { ...INITIAL_HOMEPAGE_CONFIG.hero, ...(stored?.hero || {}) },
      aboutPreview: { ...INITIAL_HOMEPAGE_CONFIG.aboutPreview, ...(stored?.aboutPreview || {}) },
      volunteerBanner: { ...INITIAL_HOMEPAGE_CONFIG.volunteerBanner, ...(stored?.volunteerBanner || {}) },
      supportBanner: { ...INITIAL_HOMEPAGE_CONFIG.supportBanner, ...(stored?.supportBanner || {}) },
      impactSection: { ...INITIAL_HOMEPAGE_CONFIG.impactSection, ...(stored?.impactSection || {}) },
      programsSection: { ...INITIAL_HOMEPAGE_CONFIG.programsSection, ...(stored?.programsSection || {}) },
      campaignsSection: { ...INITIAL_HOMEPAGE_CONFIG.campaignsSection, ...(stored?.campaignsSection || {}) },
      storiesSection: { ...INITIAL_HOMEPAGE_CONFIG.storiesSection, ...(stored?.storiesSection || {}) },
      lifelineSection: { ...INITIAL_HOMEPAGE_CONFIG.lifelineSection, ...(stored?.lifelineSection || {}) },
      gallerySection: { ...INITIAL_HOMEPAGE_CONFIG.gallerySection, ...(stored?.gallerySection || {}) },
      pressSection: { ...INITIAL_HOMEPAGE_CONFIG.pressSection, ...(stored?.pressSection || {}) },
      transparencySection: { ...INITIAL_HOMEPAGE_CONFIG.transparencySection, ...(stored?.transparencySection || {}) },
      sectionOrder: stored?.sectionOrder && stored.sectionOrder.length > 0 ? stored.sectionOrder : INITIAL_HOMEPAGE_CONFIG.sectionOrder,
      sectionVisibility: { ...INITIAL_HOMEPAGE_CONFIG.sectionVisibility, ...(stored?.sectionVisibility || {}) }
    };
  });
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(() => {
    const stored = getStoredOrDefault<AboutSettings>('aboutSettings', INITIAL_ABOUT_SETTINGS);
    return {
      ...INITIAL_ABOUT_SETTINGS,
      ...stored,
      journeyVideoArchiveEnabled: stored?.journeyVideoArchiveEnabled ?? true
    };
  });
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(() => {
    const stored = getStoredOrDefault<HeaderSettings>('headerSettings', INITIAL_HEADER_SETTINGS);
    if (
      stored?.noticeBarText?.en?.includes('Team Infinity | United for Humanity') ||
      stored?.noticeBarText?.bn?.includes('টিম ইনফিনিটি | মানবতার জন্য একতাবদ্ধ')
    ) {
      stored.noticeBarText = INITIAL_HEADER_SETTINGS.noticeBarText;
    }
    return stored;
  });
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(() => getStoredOrDefault('footerSettings', INITIAL_FOOTER_SETTINGS));
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => getStoredOrDefault('socialLinks', INITIAL_SOCIAL_LINKS));
  const [volunteerSettings, setVolunteerSettings] = useState<VolunteerSettings>(() => getStoredOrDefault('volunteerSettings', INITIAL_VOLUNTEER_SETTINGS));
  const [supportSettings, setSupportSettings] = useState<SupportSettings>(() => getStoredOrDefault('supportSettings', INITIAL_SUPPORT_SETTINGS));
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => getStoredOrDefault('contactSettings', INITIAL_CONTACT_SETTINGS));
  const [seoSettings, setSeoSettings] = useState<GlobalSEOSettings>(() => getStoredOrDefault('seoSettings', INITIAL_SEO_SETTINGS));
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(() => {
    const stored = getStoredOrDefault<NavigationItem[]>('navigationItems', INITIAL_NAVIGATION_ITEMS);
    if (!Array.isArray(stored) || stored.length === 0) return INITIAL_NAVIGATION_ITEMS;

    const merged = [...stored];
    INITIAL_NAVIGATION_ITEMS.forEach(initItem => {
      const idx = merged.findIndex(m => m.id === initItem.id || m.path === initItem.path);
      if (idx === -1) {
        merged.push(initItem);
      } else if (initItem.id === 'nav-blood' || initItem.id === 'nav-5') {
        // Ensure sub-items and active state are preserved
        merged[idx] = {
          ...initItem,
          ...merged[idx],
          active: true,
          children: initItem.children || merged[idx].children
        };
      }
    });
    return merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  });
  const [banners, setBanners] = useState<BannerItem[]>(() => getStoredOrDefault('banners', INITIAL_BANNERS));
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => {
    const stored = getStoredOrDefault<MediaItem[]>('mediaLibrary', INITIAL_MEDIA_LIBRARY);
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_video_ids', []));
    const duplicateMediaIds = new Set(['med-1787510104630-ge4c', 'med-1787512571793-d8o9', 'med-1787513124016-73mc']);
    return stored.filter(m => m.id !== 'vid-1' && !deletedSet.has(m.id) && !duplicateMediaIds.has(m.id) && !(m.url && m.url.includes('dQw4w9WgXcQ')));
  });
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(() => getStoredOrDefault('galleryAlbums', INITIAL_GALLERY_ALBUMS));
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>(() => getStoredOrDefault('adminProfiles', INITIAL_ADMIN_PROFILES));

  // 2. Core Entities
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getStoredOrDefault('campaigns', INITIAL_CAMPAIGNS));
  const [programs, setPrograms] = useState<Program[]>(() => getStoredOrDefault('programs', INITIAL_PROGRAMS));
  const [programEvents, setProgramEvents] = useState<ProgramEvent[]>(() => {
    const stored = getStoredOrDefault<ProgramEvent[]>('programEvents', INITIAL_PROGRAM_EVENTS);
    if (!Array.isArray(stored) || stored.length === 0) return INITIAL_PROGRAM_EVENTS;
    const merged = [...stored];
    INITIAL_PROGRAM_EVENTS.forEach(initEvt => {
      if (!merged.some(m => m.id === initEvt.id || (m.programId === initEvt.programId && m.slug === initEvt.slug))) {
        merged.push(initEvt);
      }
    });
    return merged;
  });
  const [eventMediaList, setEventMediaList] = useState<EventMedia[]>(() => {
    const stored = getStoredOrDefault<EventMedia[]>('eventMediaList', INITIAL_EVENT_MEDIA);
    if (!Array.isArray(stored) || stored.length === 0) return INITIAL_EVENT_MEDIA;
    const merged = [...stored];
    INITIAL_EVENT_MEDIA.forEach(initEm => {
      if (!merged.some(m => m.id === initEm.id || (m.eventId === initEm.eventId && m.mediaId === initEm.mediaId))) {
        merged.push(initEm);
      }
    });
    return merged;
  });
  const [metrics, setMetrics] = useState<ImpactMetric[]>(() => getStoredOrDefault('metrics', INITIAL_IMPACT_METRICS));
  const [stories, setStories] = useState<ImpactStory[]>(() => getStoredOrDefault('stories', INITIAL_IMPACT_STORIES));
  const [news, setNews] = useState<NewsArticle[]>(() => getStoredOrDefault('news', INITIAL_NEWS));
  const [events, setEvents] = useState<EventItem[]>(() => getStoredOrDefault('events', INITIAL_EVENTS));
  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => getStoredOrDefault('gallery', INITIAL_GALLERY));
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const stored = getStoredOrDefault<VideoItem[]>('videos', INITIAL_VIDEOS);
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_video_ids', []));
    const duplicateVideoIds = new Set([
      'vid-1787510104630',
      'vid-1787513033697',
      'vid-1787512940555',
      'vid-1787513124016',
      'vid-1787512571793',
      'vid-1787554234983',
      'vid-1787547567877',
      'vid-1787554099447',
      'vid-1787547018353'
    ]);
    return stored.filter(v => v.id !== 'vid-1' && !deletedSet.has(v.id) && !duplicateVideoIds.has(v.id) && !(v.videoUrl && v.videoUrl.includes('dQw4w9WgXcQ')));
  });
  const [journeyVideos, setJourneyVideos] = useState<JourneyVideo[]>(() => {
    const stored = getStoredOrDefault<JourneyVideo[]>('journeyVideos', INITIAL_JOURNEY_VIDEOS);
    if (Array.isArray(stored) && stored.length > 0) {
      const merged = [...stored];
      INITIAL_JOURNEY_VIDEOS.forEach(initV => {
        const idx = merged.findIndex(m => m.id === initV.id);
        if (idx === -1) {
          merged.push(initV);
        } else if (!merged[idx].videoUrl || merged[idx].videoUrl.includes('dQw4w9WgXcQ')) {
          merged[idx] = { ...merged[idx], ...initV };
        }
      });
      return merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return INITIAL_JOURNEY_VIDEOS;
  });
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() => {
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_donor_ids', []));
    const stored = getStoredOrDefault<BloodDonor[]>('bloodDonors', INITIAL_BLOOD_DONORS);
    const legacyMockIds = new Set(['donor-1', 'donor-2', 'donor-3', 'donor-4', 'donor-5', 'donor-6', 'donor-7', 'donor-8', 'donor-9', 'donor-10']);
    const donorMap = new Map<string, BloodDonor>();
    INITIAL_BLOOD_DONORS.forEach(d => {
      if (!deletedSet.has(d.id) && !legacyMockIds.has(d.id)) {
        donorMap.set(d.id, cleanBloodDonor(d));
      }
    });
    if (Array.isArray(stored)) {
      stored.forEach(d => {
        if (!deletedSet.has(d.id) && !legacyMockIds.has(d.id)) {
          donorMap.set(d.id, cleanBloodDonor(d));
        }
      });
    }
    return Array.from(donorMap.values());
  });
  const [emergencyBloodRequests, setEmergencyBloodRequests] = useState<EmergencyBloodRequest[]>(() => {
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_emergency_request_ids', []));
    const stored = getStoredOrDefault<EmergencyBloodRequest[]>('emergencyRequests', INITIAL_EMERGENCY_REQUESTS);
    const legacyMockReqIds = new Set(['req-1', 'req-2', 'req-3']);
    if (Array.isArray(stored)) {
      return stored
        .filter(r => !deletedSet.has(r.id) && !legacyMockReqIds.has(r.id))
        .map(r => cleanEmergencyRequest(r));
    }
    return [];
  });
  const [bloodDonationSettings, setBloodDonationSettings] = useState<BloodDonationSettings>(() => {
    const stored = getStoredOrDefault<any>('bloodDonationSettings', INITIAL_BLOOD_SETTINGS);
    const resolvedWingLogo = stored?.wingLogoUrl || INITIAL_BLOOD_SETTINGS.wingLogoUrl || '/brand/Infinitylifeline-logo.svg';
    return {
      ...INITIAL_BLOOD_SETTINGS,
      ...(stored || {}),
      wingLogoUrl: resolvedWingLogo,
      wingLogoSize: typeof stored?.wingLogoSize === 'number' ? stored.wingLogoSize : (INITIAL_BLOOD_SETTINGS.wingLogoSize || 480),
      wingLogoZoom: typeof stored?.wingLogoZoom === 'number' ? stored.wingLogoZoom : 1,
      wingLogoCrop: stored?.wingLogoCrop || 'contain',
      heroBadge: { ...INITIAL_BLOOD_SETTINGS.heroBadge, ...(stored?.heroBadge || {}) },
      heroTitle: { ...INITIAL_BLOOD_SETTINGS.heroTitle, ...(stored?.heroTitle || {}) },
      heroSubtitle: { ...INITIAL_BLOOD_SETTINGS.heroSubtitle, ...(stored?.heroSubtitle || {}) },
      heroCtaBadge: { ...INITIAL_BLOOD_SETTINGS.heroCtaBadge, ...(stored?.heroCtaBadge || {}) },
      heroCtaTitle: { ...INITIAL_BLOOD_SETTINGS.heroCtaTitle, ...(stored?.heroCtaTitle || {}) },
      heroCtaDescription: { ...INITIAL_BLOOD_SETTINGS.heroCtaDescription, ...(stored?.heroCtaDescription || {}) },
      heroCtaBtn1Text: { ...INITIAL_BLOOD_SETTINGS.heroCtaBtn1Text, ...(stored?.heroCtaBtn1Text || {}) },
      heroCtaBtn2Text: { ...INITIAL_BLOOD_SETTINGS.heroCtaBtn2Text, ...(stored?.heroCtaBtn2Text || {}) },
      statTotalDonorsLabel: { ...INITIAL_BLOOD_SETTINGS.statTotalDonorsLabel, ...(stored?.statTotalDonorsLabel || {}) },
      statActiveDonorsLabel: { ...INITIAL_BLOOD_SETTINGS.statActiveDonorsLabel, ...(stored?.statActiveDonorsLabel || {}) },
      statGroupsLabel: { ...INITIAL_BLOOD_SETTINGS.statGroupsLabel, ...(stored?.statGroupsLabel || {}) },
      statImpactLabel: { ...INITIAL_BLOOD_SETTINGS.statImpactLabel, ...(stored?.statImpactLabel || {}) },
      helplineLabel: { ...INITIAL_BLOOD_SETTINGS.helplineLabel, ...(stored?.helplineLabel || {}) },
      guidelinesTitle: { ...INITIAL_BLOOD_SETTINGS.guidelinesTitle, ...(stored?.guidelinesTitle || {}) },
      guidelinesText: { ...INITIAL_BLOOD_SETTINGS.guidelinesText, ...(stored?.guidelinesText || {}) },
      consentStatement: { ...INITIAL_BLOOD_SETTINGS.consentStatement, ...(stored?.consentStatement || {}) },
    };
  });
  const [donorCategories, setDonorCategories] = useState<DonorCategoryOption[]>(() => {
    const stored = getStoredOrDefault<DonorCategoryOption[]>('donorCategories', DEFAULT_DONOR_CATEGORIES);
    if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_DONOR_CATEGORIES;

    // Check if stored categories contain outdated names or old order
    const hasOutdated = stored.some(c => {
      const en = typeof c.name === 'object' ? c.name.en : c.name;
      return en === 'Infinity Bangladesh Volunteer' || en === 'External Blood Donor' || (en === 'External Blood Donor' && c.displayOrder !== 1);
    });

    if (hasOutdated) {
      const migrated = stored.map(c => {
        const en = typeof c.name === 'object' ? c.name.en : c.name;
        if (en === 'External Blood Donor' || c.id === 'cat-ext' || c.id === 'cat-open') {
          return {
            ...c,
            id: 'cat-open',
            name: { en: 'Open Voluntary Blood Donor', bn: 'উন্মুক্ত স্বেচ্ছাসেবী রক্তদাতা' },
            badgeColor: '#E11D48',
            displayOrder: 1,
            isDefault: true
          };
        }
        if (en === 'Executive Committee' || c.id === 'cat-exec') {
          return {
            ...c,
            id: 'cat-exec',
            name: { en: 'Executive Committee', bn: 'কার্যনির্বাহী পরিষদ' },
            badgeColor: '#D97706',
            displayOrder: 2,
            isDefault: true
          };
        }
        if (en === 'Standing Committee' || c.id === 'cat-standing' || c.id === 'cat-1787889544113') {
          return {
            ...c,
            id: 'cat-standing',
            name: { en: 'Standing Committee', bn: 'স্থায়ী কমিটি' },
            badgeColor: '#2563EB',
            displayOrder: 3,
            isDefault: true
          };
        }
        if (en === 'Infinity Bangladesh Volunteer' || c.id === 'cat-vol' || c.id === 'cat-member') {
          return {
            ...c,
            id: 'cat-member',
            name: { en: 'Infinity Bangladesh Member', bn: 'ইনফিনিটি বাংলাদেশ পরিবারের সদস্য' },
            badgeColor: '#006A4E',
            displayOrder: 4,
            isDefault: true
          };
        }
        return c;
      });

      const catIds = new Set(migrated.map(m => m.id));
      DEFAULT_DONOR_CATEGORIES.forEach(def => {
        if (!catIds.has(def.id)) {
          migrated.push(def);
        }
      });

      migrated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(migrated));
      } catch {}
      return migrated;
    }

    return [...stored].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  });
  const [reports, setReports] = useState<TransparencyReport[]>(() => getStoredOrDefault('reports', INITIAL_REPORTS));
  const [pressCoverages, setPressCoverages] = useState<PressCoverage[]>(() => getStoredOrDefault('pressCoverages', INITIAL_PRESS_COVERAGE));
  const [partners, setPartners] = useState<Partner[]>(() => getStoredOrDefault('partners', INITIAL_PARTNERS));
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>(() => getStoredOrDefault('volunteers', INITIAL_VOLUNTEER_APPLICATIONS));
  const [donations, setDonations] = useState<DonationRecord[]>(() => getStoredOrDefault('donations', INITIAL_DONATIONS));
  const [messages, setMessages] = useState<ContactMessage[]>(() => getStoredOrDefault('messages', []));
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getStoredOrDefault('faqs', INITIAL_FAQS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStoredOrDefault('auditLogs', []));

  // 3. Committees & Leadership
  const [committees, setCommittees] = useState<Committee[]>(() => {
    const stored = getStoredOrDefault<Committee[]>('committees', INITIAL_COMMITTEES);
    return stored.filter(c => {
      if (c.type === 'STANDING' && c.id !== 'comm-stand-central') return false;
      return true;
    });
  });
  const [persons, setPersons] = useState<Person[]>(() => getStoredOrDefault('persons', INITIAL_PERSONS));
  const [positions, setPositions] = useState<Position[]>(() => getStoredOrDefault('positions', INITIAL_POSITIONS));
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => {
    const stored = getStoredOrDefault<CommitteeMember[]>('committeeMembers', INITIAL_COMMITTEE_MEMBERS);
    const validCommitteeIds = new Set(['comm-exec-2026', 'comm-stand-central', 'comm-exec-2025', 'comm-exec-2024', 'comm-exec-2023']);
    return stored.filter(cm => validCommitteeIds.has(cm.committeeId));
  });

  // Targeted debounced localStorage auto-sync per entity
  const persistQueueRef = useRef<Record<string, any>>({});
  const persistEntity = useCallback((key: string, data: any) => {
    if (persistQueueRef.current[key]) {
      clearTimeout(persistQueueRef.current[key]);
    }
    persistQueueRef.current[key] = setTimeout(() => {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
      } catch (err) {
        console.warn(`Error persisting ${key} to localStorage:`, err);
      }
      delete persistQueueRef.current[key];
    }, 400);
  }, []);

  useEffect(() => { persistEntity('settings', settings); }, [settings, persistEntity]);
  useEffect(() => { persistEntity('homepageConfig', homepageConfig); }, [homepageConfig, persistEntity]);
  useEffect(() => { persistEntity('aboutSettings', aboutSettings); }, [aboutSettings, persistEntity]);
  useEffect(() => { persistEntity('headerSettings', headerSettings); }, [headerSettings, persistEntity]);
  useEffect(() => { persistEntity('footerSettings', footerSettings); }, [footerSettings, persistEntity]);
  useEffect(() => { persistEntity('socialLinks', socialLinks); }, [socialLinks, persistEntity]);
  useEffect(() => { persistEntity('volunteerSettings', volunteerSettings); }, [volunteerSettings, persistEntity]);
  useEffect(() => { persistEntity('supportSettings', supportSettings); }, [supportSettings, persistEntity]);
  useEffect(() => { persistEntity('contactSettings', contactSettings); }, [contactSettings, persistEntity]);
  useEffect(() => { persistEntity('seoSettings', seoSettings); }, [seoSettings, persistEntity]);
  useEffect(() => { persistEntity('navigationItems', navigationItems); }, [navigationItems, persistEntity]);
  useEffect(() => { persistEntity('banners', banners); }, [banners, persistEntity]);
  useEffect(() => { persistEntity('mediaLibrary', mediaLibrary); }, [mediaLibrary, persistEntity]);
  useEffect(() => { persistEntity('galleryAlbums', galleryAlbums); }, [galleryAlbums, persistEntity]);
  useEffect(() => { persistEntity('pressCoverages', pressCoverages); }, [pressCoverages, persistEntity]);
  useEffect(() => { persistEntity('adminProfiles', adminProfiles); }, [adminProfiles, persistEntity]);
  useEffect(() => { persistEntity('campaigns', campaigns); }, [campaigns, persistEntity]);
  useEffect(() => { persistEntity('programs', programs); }, [programs, persistEntity]);
  useEffect(() => { persistEntity('programEvents', programEvents); }, [programEvents, persistEntity]);
  useEffect(() => { persistEntity('eventMediaList', eventMediaList); }, [eventMediaList, persistEntity]);
  useEffect(() => { persistEntity('metrics', metrics); }, [metrics, persistEntity]);
  useEffect(() => { persistEntity('stories', stories); }, [stories, persistEntity]);
  useEffect(() => { persistEntity('news', news); }, [news, persistEntity]);
  useEffect(() => { persistEntity('events', events); }, [events, persistEntity]);
  useEffect(() => { persistEntity('gallery', gallery); }, [gallery, persistEntity]);
  useEffect(() => { persistEntity('videos', videos); }, [videos, persistEntity]);
  useEffect(() => { persistEntity('journeyVideos', journeyVideos); }, [journeyVideos, persistEntity]);
  useEffect(() => { persistEntity('reports', reports); }, [reports, persistEntity]);
  useEffect(() => { persistEntity('partners', partners); }, [partners, persistEntity]);
  useEffect(() => { persistEntity('volunteers', volunteers); }, [volunteers, persistEntity]);
  useEffect(() => { persistEntity('donations', donations); }, [donations, persistEntity]);
  useEffect(() => { persistEntity('messages', messages); }, [messages, persistEntity]);
  useEffect(() => { persistEntity('faqs', faqs); }, [faqs, persistEntity]);
  useEffect(() => { persistEntity('auditLogs', auditLogs); }, [auditLogs, persistEntity]);
  useEffect(() => { persistEntity('bloodDonors', bloodDonors); }, [bloodDonors, persistEntity]);
  useEffect(() => { persistEntity('emergencyRequests', emergencyBloodRequests); }, [emergencyBloodRequests, persistEntity]);
  useEffect(() => { persistEntity('bloodDonationSettings', bloodDonationSettings); }, [bloodDonationSettings, persistEntity]);
  useEffect(() => { persistEntity('donorCategories', donorCategories); }, [donorCategories, persistEntity]);
  useEffect(() => { persistEntity('committees', committees); }, [committees, persistEntity]);
  useEffect(() => { persistEntity('persons', persons); }, [persons, persistEntity]);
  useEffect(() => { persistEntity('positions', positions); }, [positions, persistEntity]);
  useEffect(() => { persistEntity('committeeMembers', committeeMembers); }, [committeeMembers, persistEntity]);

  // Multi-tab cross-storage auto synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue || !e.key.startsWith(STORAGE_PREFIX)) return;
      try {
        const entityKey = e.key.replace(STORAGE_PREFIX, '');
        const parsed = JSON.parse(e.newValue);
        if (entityKey === 'videos' && Array.isArray(parsed)) {
          setVideos(parsed);
        } else if (entityKey === 'bloodDonors' && Array.isArray(parsed)) {
          setBloodDonors(parsed);
        } else if (entityKey === 'emergencyRequests' && Array.isArray(parsed)) {
          setEmergencyBloodRequests(parsed);
        } else if (entityKey === 'bloodDonationSettings' && parsed && typeof parsed === 'object') {
          setBloodDonationSettings(parsed);
        } else if (entityKey === 'donorCategories' && Array.isArray(parsed)) {
          setDonorCategories(parsed);
        } else if (entityKey === 'campaigns' && Array.isArray(parsed)) {
          setCampaigns(parsed);
        } else if (entityKey === 'programs' && Array.isArray(parsed)) {
          setPrograms(parsed);
        } else if (entityKey === 'programEvents' && Array.isArray(parsed)) {
          setProgramEvents(parsed);
        } else if (entityKey === 'eventMediaList' && Array.isArray(parsed)) {
          setEventMediaList(parsed);
        } else if (entityKey === 'mediaLibrary' && Array.isArray(parsed)) {
          setMediaLibrary(parsed);
        } else if (entityKey === 'gallery' && Array.isArray(parsed)) {
          setGallery(parsed);
        } else if (entityKey === 'persons' && Array.isArray(parsed)) {
          setPersons(parsed);
        } else if (entityKey === 'committees' && Array.isArray(parsed)) {
          setCommittees(parsed);
        } else if (entityKey === 'positions' && Array.isArray(parsed)) {
          setPositions(parsed);
        } else if (entityKey === 'committeeMembers' && Array.isArray(parsed)) {
          setCommitteeMembers(parsed);
        } else if (entityKey === 'news' && Array.isArray(parsed)) {
          setNews(parsed);
        } else if (entityKey === 'events' && Array.isArray(parsed)) {
          setEvents(parsed);
        } else if (entityKey === 'journeyVideos' && Array.isArray(parsed)) {
          setJourneyVideos(parsed);
        } else if (entityKey === 'homepageConfig' && parsed && typeof parsed === 'object') {
          setHomepageConfig(parsed);
        } else if (entityKey === 'aboutSettings' && parsed && typeof parsed === 'object') {
          setAboutSettings(parsed);
        } else if (entityKey === 'headerSettings' && parsed && typeof parsed === 'object') {
          setHeaderSettings(parsed);
        } else if (entityKey === 'footerSettings' && parsed && typeof parsed === 'object') {
          setFooterSettings(parsed);
        } else if (entityKey === 'settings' && parsed && typeof parsed === 'object') {
          setSettings(parsed);
        }
      } catch (err) {
        console.warn('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Audit Logging helper
  const logAudit = useCallback((action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user: sessionStorage.getItem('infinity_admin_user') || 'Admin',
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  // Generic DB Upsert helper with clean single-attempt and safe schema compatibility fallback
  const safeDbUpsert = useCallback(async (tableName: string, data: any) => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from(tableName).upsert(data);
      if (error) {
        const colMatch = error.message.match(/Could not find the '([^']+)' column/i)
          || error.message.match(/column (?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+) does not exist/i);
        if (colMatch && colMatch[1]) {
          const fallbackData = { ...data };
          delete fallbackData[colMatch[1]];
          const { error: retryError } = await supabase.from(tableName).upsert(fallbackData);
          if (retryError && import.meta.env.DEV) {
            console.warn(`Supabase upsert fallback failed on ${tableName}:`, retryError.message);
          }
        } else if (import.meta.env.DEV) {
          console.warn(`Supabase upsert error on ${tableName}:`, error.message);
        }
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn(`Supabase network error on ${tableName}:`, err.message);
      }
    }
  }, []);

  const safeDbDelete = useCallback(async (tableName: string, matchColumn: string, matchValue: any) => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from(tableName).delete().eq(matchColumn, matchValue);
      if (error) {
        console.warn(`Supabase delete error on ${tableName}:`, error.message);
      }
    } catch (err: any) {
      console.warn(`Supabase network delete error on ${tableName}:`, err.message);
    }
  }, []);

  // Supabase Fetch & Sync implementation: Queries ALL tables across the CMS
  const syncWithSupabase = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      setIsSyncing(true);

      // 1. Site Settings
      const { data: siteData } = await supabase.from('site_settings').select('*').single();
      if (siteData) {
        setSettings(prev => ({
          ...prev,
          organizationName: prev.organizationName || siteData.organization_name,
          teamIdentity: prev.teamIdentity || siteData.team_identity,
          tagline: prev.tagline || siteData.tagline,
          officialAddress: prev.officialAddress || siteData.official_address,
          officialPhone: prev.officialPhone || siteData.official_phone,
          officialEmail: prev.officialEmail || siteData.official_email,
          establishedYear: prev.establishedYear || siteData.established_year,
          logoUrl: getFreshImageUrl(prev.logoUrl || siteData.logo_url),
          faviconUrl: getFreshImageUrl(prev.faviconUrl || siteData.favicon_url),
          country: prev.country || siteData.country
        }));
      }

      // 2. Homepage Config
      const { data: homeData } = await supabase.from('homepage_config').select('*').single();
      if (homeData) {
        setHomepageConfig(prev => {
          let syncedHero = {
            ...prev.hero,
            headlineMain: prev.hero?.headlineMain?.bn ? prev.hero.headlineMain : (homeData.hero?.headlineMain || prev.hero.headlineMain),
            headlineHighlight: prev.hero?.headlineHighlight?.bn ? prev.hero.headlineHighlight : (homeData.hero?.headlineHighlight || prev.hero.headlineHighlight),
            description: prev.hero?.description?.bn ? prev.hero.description : (homeData.hero?.description || prev.hero.description),
            heroImageUrl: getFreshImageUrl(prev.hero?.heroImageUrl || homeData.hero?.heroImageUrl)
          };
          const secHeaders = (homeData.volunteer_banner as any)?.section_headers || (homeData.hero as any)?.section_headers || {};
          return {
            ...prev,
            hero: syncedHero,
            aboutPreview: {
              ...prev.aboutPreview,
              titleMain: prev.aboutPreview?.titleMain?.bn ? prev.aboutPreview.titleMain : (homeData.about_preview?.titleMain || prev.aboutPreview.titleMain),
              description: prev.aboutPreview?.description?.bn ? prev.aboutPreview.description : (homeData.about_preview?.description || prev.aboutPreview.description),
              imageUrl: getFreshImageUrl(prev.aboutPreview?.imageUrl || homeData.about_preview?.imageUrl)
            },
            volunteerBanner: { ...(homeData.volunteer_banner || {}), ...prev.volunteerBanner },
            supportBanner: { ...(homeData.support_banner || {}), ...prev.supportBanner },
            impactSection: secHeaders.impact || (homeData as any).impact_section || prev.impactSection,
            programsSection: secHeaders.programs || (homeData as any).programs_section || prev.programsSection,
            campaignsSection: secHeaders.campaigns || (homeData as any).campaigns_section || prev.campaignsSection,
            storiesSection: secHeaders.stories || (homeData as any).stories_section || prev.storiesSection,
            lifelineSection: secHeaders.lifeline || (homeData as any).lifeline_section || prev.lifelineSection,
            gallerySection: secHeaders.gallery || (homeData as any).gallery_section || prev.gallerySection,
            pressSection: secHeaders.press || (homeData as any).press_section || prev.pressSection,
            transparencySection: secHeaders.transparency || (homeData as any).transparency_section || prev.transparencySection,
            sectionOrder: prev.sectionOrder && prev.sectionOrder.length > 0 ? prev.sectionOrder : (homeData.section_order || prev.sectionOrder),
            sectionVisibility: { ...(homeData.section_visibility || {}), ...prev.sectionVisibility }
          };
        });
      }

      // 3. About Settings
      const { data: aboutData } = await supabase.from('about_settings').select('*').single();
      if (aboutData) {
        setAboutSettings(prev => ({
          ...prev,
          title: prev.title?.bn ? prev.title : (aboutData.title || prev.title),
          subtitle: prev.subtitle?.bn ? prev.subtitle : (aboutData.subtitle || prev.subtitle),
          mission: prev.mission?.bn ? prev.mission : (aboutData.mission || prev.mission),
          vision: prev.vision?.bn ? prev.vision : (aboutData.vision || prev.vision),
          history: prev.history?.bn ? prev.history : (aboutData.history || prev.history),
          establishedYear: prev.establishedYear || aboutData.established_year,
          location: prev.location || aboutData.location,
          heroImageUrl: getFreshImageUrl(prev.heroImageUrl || aboutData.hero_image_url),
          secondaryImageUrl: getFreshImageUrl(prev.secondaryImageUrl || aboutData.secondary_image_url)
        }));
      }

      // 4. Header Settings
      const { data: headerData } = await supabase.from('header_settings').select('*').single();
      if (headerData) {
        setHeaderSettings(prev => ({
          ...prev,
          logoUrl: getFreshImageUrl(prev.logoUrl || headerData.logo_url),
          showNoticeBar: prev.showNoticeBar ?? headerData.show_notice_bar,
          noticeBarText: prev.noticeBarText?.bn ? prev.noticeBarText : (headerData.notice_bar_text || prev.noticeBarText),
          noticeBarLink: prev.noticeBarLink || headerData.notice_bar_link,
          noticeBarButtonText: prev.noticeBarButtonText?.bn ? prev.noticeBarButtonText : (headerData.notice_bar_button_text || prev.noticeBarButtonText),
          showNoticeBarButton: prev.showNoticeBarButton ?? headerData.show_notice_bar_button ?? true,
          supportButtonText: prev.supportButtonText?.bn ? prev.supportButtonText : (headerData.support_button_text || prev.supportButtonText),
          supportButtonUrl: prev.supportButtonUrl || headerData.support_button_url,
          showSupportButton: prev.showSupportButton ?? headerData.show_support_button
        }));
      }

      // 5. Footer Settings
      const { data: footerData } = await supabase.from('footer_settings').select('*').single();
      if (footerData) {
        setFooterSettings(prev => ({
          ...prev,
          footerLogoUrl: getFreshImageUrl(prev.footerLogoUrl || footerData.footer_logo_url),
          description: prev.description?.bn ? prev.description : (footerData.description || prev.description),
          address: prev.address || footerData.address || '',
          phone: prev.phone || footerData.phone || '',
          email: prev.email || footerData.email || '',
          copyrightText: prev.copyrightText?.bn ? prev.copyrightText : (footerData.copyright_text || prev.copyrightText),
          calloutEyebrow: prev.calloutEyebrow || footerData.callout_eyebrow,
          calloutTitle: prev.calloutTitle || footerData.callout_title,
          calloutSubtitle: prev.calloutSubtitle || footerData.callout_subtitle,
          volunteerCtaText: prev.volunteerCtaText || footerData.volunteer_cta_text,
          volunteerCtaUrl: prev.volunteerCtaUrl || footerData.volunteer_cta_url,
          supportCtaText: prev.supportCtaText || footerData.support_cta_text,
          supportCtaUrl: prev.supportCtaUrl || footerData.support_cta_url
        }));
      }

      // 6. Programs
      const { data: progData } = await supabase.from('programs').select('*').order('display_order', { ascending: true });
      if (progData && progData.length > 0) {
        const remotePrograms: Program[] = progData.map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category,
          shortDescription: p.short_description,
          fullDetails: p.full_details,
          impactHighlights: p.impact_highlights || { en: [], bn: [] },
          imageUrl: getFreshImageUrl(p.image_url),
          iconName: p.icon_name || 'HeartHandshake',
          status: p.status as Program['status'],
          displayOrder: p.display_order
        }));
        setPrograms(prevLocal => {
          const remoteIds = new Set(remotePrograms.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePrograms] : remotePrograms;
        });
      }

      // 7. Campaigns
      const { data: campData } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      if (campData && campData.length > 0) {
        const remoteCampaigns: Campaign[] = campData.map(c => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          date: c.date,
          endDate: c.end_date,
          location: c.location,
          category: c.category,
          description: c.description,
          details: c.details,
          objectives: c.objectives || { en: [], bn: [] },
          activities: c.activities || { en: [], bn: [] },
          beneficiaries: c.beneficiaries,
          beneficiariesCount: c.beneficiaries_count,
          volunteersCount: c.volunteers_count,
          impact: c.impact,
          status: c.status as Campaign['status'],
          isFeatured: c.is_featured,
          targetAmountBDT: c.target_amount_bdt,
          raisedAmountBDT: c.raised_amount_bdt,
          imageUrl: getFreshImageUrl(c.image_url),
          galleryImages: (c.gallery_images || []).map((img: string) => getFreshImageUrl(img)),
          videoUrl: c.video_url,
          reportUrl: c.report_url
        }));
        setCampaigns(prevLocal => {
          const remoteIds = new Set(remoteCampaigns.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteCampaigns] : remoteCampaigns;
        });
      }

      // 7.5. Impact Metrics
      const { data: metricData } = await supabase.from('impact_metrics').select('*').order('order', { ascending: true });
      if (metricData && metricData.length > 0) {
        const remoteMetrics: ImpactMetric[] = metricData.map(m => ({
          id: m.id,
          label: m.label,
          value: m.value,
          description: m.description,
          iconName: m.icon_name || m.iconName || 'HeartHandshake',
          order: m.order
        }));
        setMetrics(prevLocal => {
          const remoteIds = new Set(remoteMetrics.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteMetrics] : remoteMetrics;
        });
      }

      // 8. Stories
      const { data: storyData } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      if (storyData && storyData.length > 0) {
        const remoteStories: ImpactStory[] = storyData.map(s => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          personOrCommunity: s.person_or_community,
          location: s.location,
          date: s.date,
          story: s.story,
          impact: s.impact,
          imageUrl: getFreshImageUrl(s.image_url),
          campaignSlug: s.campaign_slug,
          consentConfirmed: s.consent_confirmed,
          isFeatured: s.is_featured,
          status: s.status
        }));
        setStories(prevLocal => {
          const remoteIds = new Set(remoteStories.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteStories] : remoteStories;
        });
      }

      // 9. Persons & Leadership (Committee Members)
      const { data: personData } = await supabase.from('persons').select('*').order('created_at', { ascending: true });
      if (personData && personData.length > 0) {
        const remotePersons: Person[] = personData.map(p => ({
          id: p.id,
          fullName: p.full_name,
          banglaName: p.bangla_name,
          englishName: p.english_name,
          photoUrl: getFreshImageUrl(p.photo_url),
          photoPosition: p.photo_position || 'center top',
          photoZoom: Number(p.photo_zoom) || 1.0,
          shortBio: p.short_bio,
          fullBio: p.full_bio,
          district: p.district,
          facebookUrl: p.facebook_url,
          linkedinUrl: p.linkedin_url,
          email: p.email,
          phone: p.phone,
          socialLinks: p.social_links,
          joiningYear: p.joining_year,
          active: p.active
        }));
        setPersons(prevLocal => {
          const remoteIds = new Set(remotePersons.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePersons] : remotePersons;
        });
      }

      // 9.5. Positions
      const { data: posData } = await supabase.from('positions').select('*').order('sort_order', { ascending: true });
      if (posData && posData.length > 0) {
        const remotePositions: Position[] = posData.map(p => ({
          id: p.id,
          name: p.name,
          level: Number(p.level) || 5,
          sortOrder: Number(p.sort_order) || 10,
          description: p.description
        }));
        setPositions(prevLocal => {
          const remoteIds = new Set(remotePositions.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePositions] : remotePositions;
        });
      }

      // 10. Committees
      const { data: comData } = await supabase.from('committees').select('*').order('sort_order', { ascending: true });
      if (comData && comData.length > 0) {
        const remoteCommittees: Committee[] = comData.map(c => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          type: c.type,
          year: c.year,
          description: c.description,
          status: c.status,
          sortOrder: c.sort_order,
          isFeatured: c.is_featured,
          bannerImageUrl: getFreshImageUrl(c.banner_image_url)
        }));
        setCommittees(prevLocal => {
          const remoteIds = new Set(remoteCommittees.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteCommittees] : remoteCommittees;
        });
      }

      // 11. Committee Members mapping
      const { data: memData } = await supabase.from('committee_members').select('*').order('sort_order', { ascending: true });
      if (memData && memData.length > 0) {
        const remoteMembers: CommitteeMember[] = memData.map(m => ({
          id: m.id,
          committeeId: m.committee_id,
          personId: m.person_id,
          positionId: m.position_id,
          serialNumber: m.serial_number,
          sortOrder: m.sort_order,
          isFeaturedLeader: m.is_featured_leader,
          startDate: m.start_date,
          endDate: m.end_date,
          status: m.status
        }));
        setCommitteeMembers(prevLocal => {
          const remoteIds = new Set(remoteMembers.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteMembers] : remoteMembers;
        });
      }

      // 12. Media Library
      const { data: mediaData } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
      if (mediaData && Array.isArray(mediaData)) {
        const remoteMedia: MediaItem[] = mediaData
          .filter(m => m.id !== 'vid-1' && !deletedIdsRef.current.has(m.id) && !(m.url && m.url.includes('dQw4w9WgXcQ')))
          .map(m => ({
            id: m.id,
            fileName: m.file_name,
            url: getFreshImageUrl(m.url),
            fileSize: m.file_size,
            mimeType: m.mime_type,
            category: m.category,
            altText: m.alt_text,
            caption: m.caption,
            uploadedAt: m.uploaded_at || m.created_at,
            usageTags: m.usage_tags || []
          }));

        setMediaLibrary(prevLocal => {
          const remoteIds = new Set(remoteMedia.map(r => r.id));
          const localOnly = prevLocal.filter(l => 
            l.id !== 'vid-1' && 
            !remoteIds.has(l.id) && 
            !deletedIdsRef.current.has(l.id) && 
            !(l.url && l.url.includes('dQw4w9WgXcQ'))
          );
          const merged = localOnly.length > 0 ? [...localOnly, ...remoteMedia] : remoteMedia;
          try {
            localStorage.setItem(`${STORAGE_PREFIX}mediaLibrary`, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // 13. Gallery Photos
      const { data: galData } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
      if (galData && Array.isArray(galData)) {
        const remoteGallery = galData
          .filter(g => !deletedIdsRef.current.has(g.id))
          .map(g => ({
            id: g.id,
            albumId: g.album_id,
            title: g.title,
            caption: g.caption,
            imageUrl: getFreshImageUrl(g.image_url),
            category: g.category,
            date: g.date,
            location: g.location,
            campaignSlug: g.campaign_slug,
            displayOrder: g.display_order
          }));

        setGallery(prevLocal => {
          const remoteIds = new Set(remoteGallery.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id) && !deletedIdsRef.current.has(l.id));
          const merged = localOnly.length > 0 ? [...localOnly, ...remoteGallery] : remoteGallery;
          try {
            localStorage.setItem(`${STORAGE_PREFIX}gallery`, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // 14. Partners
      const { data: partData } = await supabase.from('partners').select('*').order('partnership_year', { ascending: false });
      if (partData && partData.length > 0) {
        const remotePartners: Partner[] = partData.map(p => ({
          id: p.id,
          name: p.name,
          logoUrl: getFreshImageUrl(p.logo_url),
          website: p.website,
          type: p.type,
          description: p.description,
          partnershipYear: p.partnership_year
        }));
        setPartners(prevLocal => {
          const remoteIds = new Set(remotePartners.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePartners] : remotePartners;
        });
      }

      // 15. News & Articles
      const { data: newsData } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
      if (newsData && newsData.length > 0) {
        const remoteNews: NewsArticle[] = newsData.map(n => ({
          id: n.id,
          slug: n.slug,
          title: n.title,
          excerpt: n.excerpt,
          content: n.content,
          category: n.category,
          author: n.author,
          date: n.date,
          imageUrl: getFreshImageUrl(n.image_url),
          tags: n.tags || [],
          status: n.status
        }));
        setNews(prevLocal => {
          const remoteIds = new Set(remoteNews.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteNews] : remoteNews;
        });
      }

      // 16. Events
      const { data: evData } = await supabase.from('event_items').select('*').order('created_at', { ascending: false });
      if (evData && evData.length > 0) {
        const remoteEvents: EventItem[] = evData.map(e => ({
          id: e.id,
          slug: e.slug,
          title: e.title,
          date: e.date,
          time: e.time,
          location: e.location,
          description: e.description,
          imageUrl: getFreshImageUrl(e.image_url),
          status: e.status,
          registrationOpen: e.registration_open
        }));
        setEvents(prevLocal => {
          const remoteIds = new Set(remoteEvents.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteEvents] : remoteEvents;
        });
      }

      // 17. Video Documentation & Footage
      const { data: vidData } = await supabase.from('video_items').select('*').order('created_at', { ascending: false });
      if (vidData && Array.isArray(vidData)) {
        const remoteVideos: VideoItem[] = vidData
          .filter(v => v.id !== 'vid-1' && !deletedIdsRef.current.has(v.id) && !(v.video_url && v.video_url.includes('dQw4w9WgXcQ')))
          .map(v => {
            const det = detectAndNormalizeMedia(v.video_url || '');
            const isShorts = v.is_shorts ?? det.isShorts;
            const aspectRatio = v.aspect_ratio || det.aspectRatio || (isShorts ? '9/16' : '16/9');
            return {
              id: v.id,
              title: v.title,
              videoUrl: det.originalUrl || v.video_url,
              embedUrl: v.embed_url || det.embedUrl || '',
              thumbnailUrl: getFreshImageUrl(v.thumbnail_url || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL),
              platform: v.platform || det.platform || 'youtube',
              duration: v.duration || (isShorts ? 'Shorts' : 'Video'),
              date: v.date || '',
              description: v.description || { en: '', bn: '' },
              category: v.category || 'General',
              status: v.status || 'published',
              isFeatured: v.is_featured ?? false,
              sourceType: v.source_type || 'url',
              aspectRatio,
              isShorts,
              displayOrder: v.display_order ?? undefined,
              createdAt: v.created_at,
              updatedAt: v.updated_at
            };
          });

        // Apply saved video sequence order if present
        try {
          const savedOrderStr = localStorage.getItem(`${STORAGE_PREFIX}video_order`);
          if (savedOrderStr) {
            const savedOrder: string[] = JSON.parse(savedOrderStr);
            if (Array.isArray(savedOrder) && savedOrder.length > 0) {
              const orderMap = new Map(savedOrder.map((id, idx) => [id, idx + 1]));
              remoteVideos.forEach(v => {
                if (orderMap.has(v.id)) {
                  v.displayOrder = orderMap.get(v.id);
                }
              });
            }
          }
        } catch {}

        setVideos(prevLocal => {
          const remoteIds = new Set(remoteVideos.map(r => r.id));
          const duplicateVideoIds = new Set([
            'vid-1787510104630',
            'vid-1787513033697',
            'vid-1787512940555',
            'vid-1787513124016',
            'vid-1787512571793',
            'vid-1787554234983',
            'vid-1787547567877',
            'vid-1787554099447',
            'vid-1787547018353'
          ]);
          const localOnly = prevLocal.filter(l => 
            l.id !== 'vid-1' && 
            !remoteIds.has(l.id) && 
            !deletedIdsRef.current.has(l.id) && 
            !duplicateVideoIds.has(l.id) &&
            !(l.videoUrl && l.videoUrl.includes('dQw4w9WgXcQ'))
          );
          if (localOnly.length > 0) {
            localOnly.forEach(l => {
              safeDbUpsert('video_items', {
                id: l.id,
                title: l.title,
                video_url: l.videoUrl,
                embed_url: l.embedUrl,
                thumbnail_url: l.thumbnailUrl,
                platform: l.platform,
                duration: l.duration,
                date: l.date,
                description: l.description,
                category: l.category,
                status: l.status,
                is_featured: l.isFeatured,
                source_type: l.sourceType,
                aspect_ratio: l.aspectRatio,
                is_shorts: l.isShorts,
                display_order: l.displayOrder,
                created_at: l.createdAt || new Date().toISOString(),
                updated_at: l.updatedAt || new Date().toISOString()
              });
            });
            const merged = [...localOnly, ...remoteVideos];
            merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            return merged;
          }
          remoteVideos.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          return remoteVideos;
        });
      }

      // 17.5. Blood Donation Network - Public Safe Query (Approved Donors Only for public)
      let bloodDonorsData: any[] | null = null;
      try {
        const isAdminSession = typeof window !== 'undefined' && (
          window.location.hash.includes('admin') ||
          localStorage.getItem('infinity_bd_admin_auth') === 'true'
        );

        const query = isAdminSession
          ? supabase.from('blood_donors').select('*').order('created_at', { ascending: false })
          : supabase.from('blood_donors')
              .select('id, full_name, blood_group, district, upazila, area, org_category, availability_status, total_donations, photo_url, show_phone_publicly, phone, approval_status, is_verified')
              .eq('approval_status', 'APPROVED')
              .order('created_at', { ascending: false });

        const { data: bData, error: bErr } = await query;
        if (!bErr && Array.isArray(bData)) {
          bloodDonorsData = bData;
        } else if (bErr && import.meta.env.DEV) {
          console.warn('Supabase blood_donors query warning:', bErr.message);
        }
      } catch (err: any) {
        if (import.meta.env.DEV) {
          console.warn('Supabase blood_donors fetch error:', err.message);
        }
      }

      const legacyMockIds = new Set(['donor-1', 'donor-2', 'donor-3', 'donor-4', 'donor-5', 'donor-6', 'donor-7', 'donor-8', 'donor-9', 'donor-10']);

      if (bloodDonorsData && Array.isArray(bloodDonorsData)) {
        bloodDonorsData.forEach(d => {
          if (legacyMockIds.has(d.id)) {
            supabase.from('blood_donors').delete().eq('id', d.id).then(() => {});
          }
        });

        const remoteDonors: BloodDonor[] = bloodDonorsData
          .filter(d => !deletedDonorIdsRef.current.has(d.id) && !legacyMockIds.has(d.id))
          .map(d => {
            const canShowPhone = d.gender === 'Male' || Boolean(d.show_phone_publicly ?? d.show_phone_number_publicly);
            return {
              id: d.id,
              fullName: d.full_name,
              bloodGroup: d.blood_group,
              gender: d.gender || 'Male',
              dateOfBirth: d.date_of_birth || d.dob,
              dob: d.date_of_birth || d.dob,
              phone: canShowPhone ? d.phone : '',
              email: d.email || undefined,
              photoUrl: getFreshImageUrl(d.photo_url),
              district: d.district,
              upazila: d.upazila,
              area: d.area,
              detailedAddress: d.detailed_address,
              orgCategory: d.org_category || 'General Voluntary Donor',
              committeePosition: d.committee_position,
              availabilityStatus: d.availability_status || 'AVAILABLE_EMERGENCY',
              lastDonationDate: d.last_donation_date || undefined,
              totalDonations: Number(d.total_donations) || 0,
              experienceNotes: d.experience_notes,
              privacyConsent: d.privacy_consent ?? d.consent_confirmed ?? true,
              showPhonePublicly: canShowPhone,
              approvalStatus: d.approval_status || 'APPROVED',
              isVerified: d.is_verified ?? false,
              donationHistory: Array.isArray(d.blood_donation_history) ? d.blood_donation_history.map((h: any) => ({
                id: h.id,
                donorId: h.donor_id,
                donationDate: h.donation_date,
                patientName: h.patient_name,
                hospitalName: h.hospital_name,
                location: h.location,
                notes: h.notes,
                recordedAt: h.created_at || h.recorded_at
              })) : [],
              createdAt: d.created_at,
              updatedAt: d.updated_at
            };
          });
        setBloodDonors(prevLocal => {
          const remoteIds = new Set(remoteDonors.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          const merged = [...remoteDonors, ...localOnly];
          try {
            localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // 17.6. Emergency Blood Requests Sync
      try {
        const { data: emgData, error: emgErr } = await supabase
          .from('emergency_blood_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (!emgErr && Array.isArray(emgData)) {
          const remoteRequests: EmergencyBloodRequest[] = emgData
            .filter(r => !deletedRequestIdsRef.current.has(r.id))
            .map(r => cleanEmergencyRequest({
              id: r.id,
              requesterName: r.requester_name,
              contactNumber: r.contact_number,
              patientName: r.patient_name,
              bloodGroup: r.blood_group,
              unitsNeeded: Number(r.units_needed) || 1,
              hospitalName: r.hospital_name,
              district: r.district,
              upazila: r.upazila,
              emergencyLevel: r.emergency_level || 'URGENT',
              requiredDate: r.required_date,
              additionalNotes: r.additional_notes,
              status: r.status || 'PENDING',
              matchedDonorIds: Array.isArray(r.matched_donor_ids) ? r.matched_donor_ids : [],
              createdAt: r.created_at,
              updatedAt: r.updated_at
            }));
          setEmergencyBloodRequests(prevLocal => {
            const remoteIds = new Set(remoteRequests.map(r => r.id));
            const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
            const merged = [...remoteRequests, ...localOnly];
            try {
              localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch (err: any) {
        console.warn('Supabase emergency_blood_requests network warning:', err.message);
      }

      const { data: bSettingsData } = await supabase.from('blood_donation_settings').select('*').single();
      if (bSettingsData) {
        setBloodDonationSettings(prevLocal => {
          // If local has custom logo or settings, do NOT let remote empty/default overwrite it
          const localHasCustomLogo = prevLocal.wingLogoUrl && prevLocal.wingLogoUrl !== INITIAL_BLOOD_SETTINGS.wingLogoUrl;
          const remoteLogo = bSettingsData.wing_logo_url;
          
          const resolvedLogo = localHasCustomLogo 
            ? prevLocal.wingLogoUrl 
            : (remoteLogo || prevLocal.wingLogoUrl || INITIAL_BLOOD_SETTINGS.wingLogoUrl);

          const remoteBSettings: BloodDonationSettings = {
            ...INITIAL_BLOOD_SETTINGS,
            ...prevLocal,
            wingLogoUrl: resolvedLogo,
            wingLogoSize: prevLocal.wingLogoSize || bSettingsData.wing_logo_size || INITIAL_BLOOD_SETTINGS.wingLogoSize,
            wingLogoZoom: prevLocal.wingLogoZoom ?? bSettingsData.wing_logo_zoom ?? 1,
            wingLogoCrop: prevLocal.wingLogoCrop || bSettingsData.wing_logo_crop || 'contain',
            heroBadge: prevLocal.heroBadge?.bn ? prevLocal.heroBadge : (bSettingsData.hero_badge || prevLocal.heroBadge),
            heroTitle: prevLocal.heroTitle?.bn ? prevLocal.heroTitle : (bSettingsData.hero_title || prevLocal.heroTitle),
            heroSubtitle: prevLocal.heroSubtitle?.bn ? prevLocal.heroSubtitle : (bSettingsData.hero_subtitle || prevLocal.heroSubtitle),
            heroCtaBadge: prevLocal.heroCtaBadge?.bn ? prevLocal.heroCtaBadge : (bSettingsData.hero_cta_badge || prevLocal.heroCtaBadge),
            heroCtaTitle: prevLocal.heroCtaTitle?.bn ? prevLocal.heroCtaTitle : (bSettingsData.hero_cta_title || prevLocal.heroCtaTitle),
            heroCtaDescription: prevLocal.heroCtaDescription?.bn ? prevLocal.heroCtaDescription : (bSettingsData.hero_cta_description || prevLocal.heroCtaDescription),
            heroCtaBtn1Text: prevLocal.heroCtaBtn1Text?.bn ? prevLocal.heroCtaBtn1Text : (bSettingsData.hero_cta_btn1_text || prevLocal.heroCtaBtn1Text),
            heroCtaBtn2Text: prevLocal.heroCtaBtn2Text?.bn ? prevLocal.heroCtaBtn2Text : (bSettingsData.hero_cta_btn2_text || prevLocal.heroCtaBtn2Text),
            statTotalDonorsLabel: prevLocal.statTotalDonorsLabel?.bn ? prevLocal.statTotalDonorsLabel : (bSettingsData.stat_total_donors_label || prevLocal.statTotalDonorsLabel),
            statActiveDonorsLabel: prevLocal.statActiveDonorsLabel?.bn ? prevLocal.statActiveDonorsLabel : (bSettingsData.stat_active_donors_label || prevLocal.statActiveDonorsLabel),
            statGroupsLabel: prevLocal.statGroupsLabel?.bn ? prevLocal.statGroupsLabel : (bSettingsData.stat_groups_label || prevLocal.statGroupsLabel),
            statGroupsValue: prevLocal.statGroupsValue || bSettingsData.stat_groups_value || INITIAL_BLOOD_SETTINGS.statGroupsValue,
            statImpactLabel: prevLocal.statImpactLabel?.bn ? prevLocal.statImpactLabel : (bSettingsData.stat_impact_label || prevLocal.statImpactLabel),
            statTotalDonorsOverride: prevLocal.statTotalDonorsOverride ?? bSettingsData.stat_total_donors_override ?? null,
            statActiveDonorsOverride: prevLocal.statActiveDonorsOverride ?? bSettingsData.stat_active_donors_override ?? null,
            statImpactOverride: prevLocal.statImpactOverride ?? bSettingsData.stat_impact_override ?? null,
            emergencyHelpline: prevLocal.emergencyHelpline || bSettingsData.emergency_helpline || INITIAL_BLOOD_SETTINGS.emergencyHelpline,
            helplineLabel: prevLocal.helplineLabel?.bn ? prevLocal.helplineLabel : (bSettingsData.helpline_label || prevLocal.helplineLabel),
            coordinationEmail: prevLocal.coordinationEmail || bSettingsData.coordination_email || INITIAL_BLOOD_SETTINGS.coordinationEmail,
            guidelinesTitle: prevLocal.guidelinesTitle?.bn ? prevLocal.guidelinesTitle : (bSettingsData.guidelines_title || prevLocal.guidelinesTitle),
            guidelinesText: prevLocal.guidelinesText?.bn ? prevLocal.guidelinesText : (bSettingsData.guidelines_text || prevLocal.guidelinesText),
            consentStatement: prevLocal.consentStatement?.bn ? prevLocal.consentStatement : (bSettingsData.consent_statement || prevLocal.consentStatement),
            enablePublicDirectContact: prevLocal.enablePublicDirectContact ?? bSettingsData.enable_public_direct_contact ?? true
          };
          try {
            localStorage.setItem(`${STORAGE_PREFIX}bloodDonationSettings`, JSON.stringify(remoteBSettings));
          } catch {}
          return remoteBSettings;
        });
      }

      // 18. Press & Media Coverage
      const { data: pressData } = await supabase.from('press_coverage').select('*').order('published_date', { ascending: false });
      if (pressData && Array.isArray(pressData) && pressData.length > 0) {
        const remotePress: PressCoverage[] = pressData.map(p => ({
          id: p.id,
          outletName: p.outlet_name || p.outletName || '',
          outletLogoUrl: getFreshImageUrl(p.outlet_logo_url || p.outletLogoUrl),
          title: p.title || { en: '', bn: '' },
          articleUrl: p.article_url || p.articleUrl || '',
          excerpt: p.excerpt || { en: '', bn: '' },
          coverageType: p.coverage_type || p.coverageType || 'newspaper',
          publishedDate: p.published_date || p.publishedDate || '',
          imageUrl: getFreshImageUrl(p.image_url || p.imageUrl),
          isFeatured: p.is_featured ?? p.isFeatured ?? false,
          status: p.status || 'published',
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        setPressCoverages(prevLocal => {
          const remoteIds = new Set(remotePress.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          if (localOnly.length > 0) {
            localOnly.forEach(l => {
              safeDbUpsert('press_coverage', {
                id: l.id,
                outlet_name: l.outletName,
                outlet_logo_url: l.outletLogoUrl,
                title: l.title,
                article_url: l.articleUrl,
                excerpt: l.excerpt,
                coverage_type: l.coverageType,
                published_date: l.publishedDate,
                image_url: l.imageUrl,
                is_featured: l.isFeatured,
                status: l.status,
                created_at: l.createdAt || new Date().toISOString(),
                updated_at: l.updatedAt || new Date().toISOString()
              });
            });
            return [...localOnly, ...remotePress];
          }
          return remotePress;
        });
      }

      setLastSyncedAt(new Date());

      // If in admin mode or explicitly requested, also sync admin-specific datasets
      const isAdminContext = typeof window !== 'undefined' && (
        window.location.hash.includes('admin') ||
        localStorage.getItem('infinity_bd_admin_auth') === 'true'
      );
      if (isAdminContext) {
        loadAdminData();
      }
    } catch (err) {
      console.error('Supabase sync exception:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Dedicated Admin-Only Data Loader: Fetches heavy admin management tables on demand
  const loadAdminData = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      // 1. Volunteer Applications
      const { data: volData } = await supabase.from('volunteer_applications').select('*').order('submitted_at', { ascending: false });
      if (volData && Array.isArray(volData)) {
        setVolunteers(volData.map(v => ({
          id: v.id,
          fullName: v.full_name,
          email: v.email,
          phone: v.phone,
          district: v.district,
          institution: v.institution || '',
          occupation: v.occupation || '',
          bloodGroup: v.blood_group || '',
          skills: v.skills || [],
          preferredAreas: v.preferred_areas || [],
          availability: v.availability || '',
          message: v.message || '',
          agreedCodeOfConduct: v.agreed_code_of_conduct ?? true,
          status: v.status || 'New',
          adminNotes: v.admin_notes || '',
          submittedAt: v.submitted_at
        })));
      }

      // 2. Donation Records
      const { data: donData } = await supabase.from('donation_records').select('*').order('donated_at', { ascending: false });
      if (donData && Array.isArray(donData)) {
        setDonations(donData.map(d => ({
          id: d.id,
          receiptNumber: d.receipt_number || d.id,
          donorName: d.donor_name,
          donorEmail: d.donor_email || '',
          donorPhone: d.donor_phone || '',
          amountBDT: Number(d.amount_bdt) || 0,
          campaignSlug: d.campaign_slug || '',
          campaignTitle: d.campaign_title || '',
          donationType: d.donation_type || 'one-time',
          paymentMethod: d.payment_method || 'bKash',
          transactionId: d.transaction_id || '',
          status: d.status || 'Successful',
          isAnonymous: d.is_anonymous ?? false,
          notes: d.notes || '',
          date: d.donated_at
        })));
      }

      // 3. Contact Messages
      const { data: msgData } = await supabase.from('contact_messages').select('*').order('submitted_at', { ascending: false });
      if (msgData && Array.isArray(msgData)) {
        setMessages(msgData.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone || '',
          subject: m.subject || '',
          message: m.message || '',
          status: m.status || 'Unread',
          submittedAt: m.submitted_at
        })));
      }

      // 4. Admin Profiles
      const { data: admData } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
      if (admData && Array.isArray(admData)) {
        setAdminProfiles(admData.map(a => ({
          id: a.id,
          email: a.email,
          fullName: a.full_name,
          role: a.role || 'super_admin',
          avatarUrl: getFreshImageUrl(a.avatar_url),
          isActive: a.is_active ?? true,
          lastLoginAt: a.last_login_at,
          createdAt: a.created_at
        })));
      }

      // 5. Audit Logs
      const { data: logData } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
      if (logData && Array.isArray(logData)) {
        setAuditLogs(logData.map(l => ({
          id: l.id,
          user: l.user_email || 'Admin',
          userEmail: l.user_email,
          action: l.action,
          entity: l.entity,
          entityId: l.entity_id,
          details: l.details,
          timestamp: l.timestamp
        })));
      }

      // 6. Media Library
      const { data: medData } = await supabase.from('media_library').select('*').order('uploaded_at', { ascending: false });
      if (medData && Array.isArray(medData)) {
        setMediaLibrary(medData.map(m => ({
          id: m.id,
          fileName: m.file_name,
          url: getFreshImageUrl(m.url),
          fileSize: m.file_size || '0 KB',
          mimeType: m.mime_type || 'image/jpeg',
          category: m.category || 'General',
          altText: m.alt_text || '',
          caption: m.caption || '',
          usageTags: m.usage_tags || [],
          uploadedAt: m.uploaded_at
        })));
      }

      setIsAdminLoaded(true);
    } catch (err) {
      console.warn('Admin dataset sync notice:', err);
    }
  }, []);

  // Targeted single-table refetcher for granular Realtime events
  const refetchTable = useCallback(async (tableName: string) => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      if (tableName === 'campaigns') {
        const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (data) {
          setCampaigns(data.map(c => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            category: c.category,
            status: c.status,
            goalBDT: Number(c.goal_bdt) || 0,
            raisedBDT: Number(c.raised_bdt) || 0,
            donorsCount: Number(c.donors_count) || 0,
            description: c.description,
            beneficiaries: c.beneficiaries,
            date: c.date,
            location: c.location,
            imageUrl: getFreshImageUrl(c.image_url),
            secondaryImageUrl: getFreshImageUrl(c.secondary_image_url),
            isFeatured: c.is_featured ?? false,
            displayOrder: c.display_order || 0,
            objectives: c.objectives || { en: [], bn: [] },
            activities: c.activities || { en: [], bn: [] },
            galleryImages: (c.gallery_images || []).map((img: string) => getFreshImageUrl(img))
          })));
        }
      } else if (tableName === 'homepage_config') {
        const { data } = await supabase.from('homepage_config').select('*').single();
        if (data) {
          setHomepageConfig(prev => ({
            ...prev,
            hero: { ...prev.hero, ...(data.hero || {}) },
            aboutPreview: { ...prev.aboutPreview, ...(data.about_preview || {}) },
            sectionOrder: data.section_order || prev.sectionOrder,
            sectionVisibility: { ...(data.section_visibility || {}), ...prev.sectionVisibility }
          }));
        }
      } else if (tableName === 'blood_donors') {
        const { data } = await supabase.from('blood_donors').select('*').order('created_at', { ascending: false });
        if (data) {
          setBloodDonors(data.map(cleanBloodDonor));
        }
      } else if (tableName === 'emergency_blood_requests') {
        const { data } = await supabase.from('emergency_blood_requests').select('*').order('created_at', { ascending: false });
        if (data) {
          setEmergencyBloodRequests(data.map(cleanEmergencyRequest));
        }
      } else if (tableName === 'site_settings') {
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setSettings(prev => ({
            ...prev,
            organizationName: data.organization_name || prev.organizationName,
            officialPhone: data.official_phone || prev.officialPhone,
            officialEmail: data.official_email || prev.officialEmail,
            officialAddress: data.official_address || prev.officialAddress
          }));
        }
      }
    } catch (err) {
      console.warn(`Targeted refetch failed on ${tableName}:`, err);
    }
  }, []);

  // Cooldown tracker for revalidation
  const lastRevalidateRef = useRef<number>(Date.now());

  // Sync on initial mount & throttled dynamic window revalidation (no 20s polling)
  useEffect(() => {
    if (isSupabaseConfigured) {
      syncWithSupabase();
    }

    // Dynamic revalidation with 5-minute cooldown when user switches tabs or window regains focus
    const handleRevalidate = () => {
      const now = Date.now();
      if (isSupabaseConfigured && document.visibilityState === 'visible' && (now - lastRevalidateRef.current > 300000)) {
        lastRevalidateRef.current = now;
        syncWithSupabase();
      }
    };

    window.addEventListener('focus', handleRevalidate);
    window.addEventListener('online', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    return () => {
      window.removeEventListener('focus', handleRevalidate);
      window.removeEventListener('online', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
    };
  }, [syncWithSupabase]);

  // Targeted Realtime: Scoped to Admin session and granular table events
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    const isAdminSession = typeof window !== 'undefined' && (
      window.location.hash.includes('admin') ||
      localStorage.getItem('infinity_bd_admin_auth') === 'true'
    );

    // Public visitors do not subscribe to full-database realtime events
    if (!isAdminSession) return;

    try {
      const channel = supabase
        .channel('infinity-admin-targeted-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          if (payload.table) {
            refetchTable(payload.table);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel error:', err);
    }
  }, [refetchTable]);

  // Push ALL local state to Supabase in one click
  const pushAllToSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase credentials are not configured in .env' };
    }

    try {
      setIsSyncing(true);

      // Site settings
      await supabase.from('site_settings').upsert({
        id: 'default',
        organization_name: settings.organizationName,
        team_identity: settings.teamIdentity,
        tagline: settings.tagline,
        country: settings.country,
        official_address: settings.officialAddress,
        official_phone: settings.officialPhone,
        official_email: settings.officialEmail,
        established_year: settings.establishedYear || '2015',
        logo_url: settings.logoUrl || '',
        favicon_url: settings.faviconUrl || '',
        updated_at: new Date().toISOString()
      });

      // Homepage config
      const safeVolBannerForPush = {
        ...(homepageConfig.volunteerBanner || {}),
        section_headers: {
          impact: homepageConfig.impactSection,
          programs: homepageConfig.programsSection,
          campaigns: homepageConfig.campaignsSection,
          stories: homepageConfig.storiesSection,
          lifeline: homepageConfig.lifelineSection,
          gallery: homepageConfig.gallerySection,
          press: homepageConfig.pressSection,
          transparency: homepageConfig.transparencySection
        }
      };

      await supabase.from('homepage_config').upsert({
        id: 'default',
        hero: homepageConfig.hero,
        about_preview: homepageConfig.aboutPreview,
        volunteer_banner: safeVolBannerForPush,
        support_banner: homepageConfig.supportBanner,
        section_order: homepageConfig.sectionOrder,
        section_visibility: homepageConfig.sectionVisibility,
        updated_at: new Date().toISOString()
      });

      // About settings
      await supabase.from('about_settings').upsert({
        id: 'default',
        title: aboutSettings.title,
        subtitle: aboutSettings.subtitle,
        mission: aboutSettings.mission,
        vision: aboutSettings.vision,
        history: aboutSettings.history,
        established_year: aboutSettings.establishedYear,
        location: aboutSettings.location,
        hero_image_url: aboutSettings.heroImageUrl,
        secondary_image_url: aboutSettings.secondaryImageUrl || '',
        updated_at: new Date().toISOString()
      });

      // Header settings
      await supabase.from('header_settings').upsert({
        id: 'default',
        logo_url: headerSettings.logoUrl,
        show_notice_bar: headerSettings.showNoticeBar,
        notice_bar_text: headerSettings.noticeBarText,
        notice_bar_link: headerSettings.noticeBarLink || 'transparency',
        show_search: headerSettings.showSearch,
        show_language_switcher: headerSettings.showLanguageSwitcher,
        support_button_text: headerSettings.supportButtonText,
        support_button_url: headerSettings.supportButtonUrl || 'donate',
        show_support_button: headerSettings.showSupportButton,
        updated_at: new Date().toISOString()
      });

      // Footer settings
      await supabase.from('footer_settings').upsert({
        id: 'default',
        footer_logo_url: footerSettings.footerLogoUrl,
        description: footerSettings.description,
        address: footerSettings.address,
        phone: footerSettings.phone,
        email: footerSettings.email,
        copyright_text: footerSettings.copyrightText,
        callout_eyebrow: footerSettings.calloutEyebrow,
        callout_title: footerSettings.calloutTitle,
        callout_subtitle: footerSettings.calloutSubtitle,
        volunteer_cta_text: footerSettings.volunteerCtaText,
        volunteer_cta_url: footerSettings.volunteerCtaUrl || 'volunteer',
        support_cta_text: footerSettings.supportCtaText,
        support_cta_url: footerSettings.supportCtaUrl || 'donate',
        updated_at: new Date().toISOString()
      });

      // Programs
      for (const p of programs) {
        await supabase.from('programs').upsert({
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category,
          short_description: p.shortDescription,
          full_details: p.fullDetails,
          impact_highlights: p.impactHighlights,
          image_url: p.imageUrl,
          icon_name: p.iconName,
          status: p.status,
          display_order: p.displayOrder || 0,
          updated_at: new Date().toISOString()
        });
      }

      // Campaigns
      for (const c of campaigns) {
        await supabase.from('campaigns').upsert({
          id: c.id,
          slug: c.slug,
          title: c.title,
          date: c.date,
          end_date: c.endDate || '',
          location: c.location,
          category: c.category,
          description: c.description,
          details: c.details,
          objectives: c.objectives,
          activities: c.activities,
          beneficiaries: c.beneficiaries,
          beneficiaries_count: c.beneficiariesCount,
          volunteers_count: c.volunteersCount,
          impact: c.impact,
          status: c.status,
          is_featured: c.isFeatured,
          target_amount_bdt: c.targetAmountBDT || '',
          raised_amount_bdt: c.raisedAmountBDT || '',
          image_url: c.imageUrl,
          gallery_images: c.galleryImages,
          video_url: c.videoUrl || '',
          report_url: c.reportUrl || '',
          display_order: c.displayOrder || 0,
          updated_at: new Date().toISOString()
        });
      }

      // Impact Metrics
      for (const m of metrics) {
        await supabase.from('impact_metrics').upsert({
          id: m.id,
          label: m.label,
          value: m.value,
          description: m.description,
          icon_name: m.iconName,
          order: m.order,
          updated_at: new Date().toISOString()
        });
      }

      // Persons & Leadership photos
      for (const per of persons) {
        await supabase.from('persons').upsert({
          id: per.id,
          full_name: per.fullName,
          bangla_name: per.banglaName,
          english_name: per.englishName,
          photo_url: per.photoUrl || '',
          photo_position: per.photoPosition || 'center top',
          photo_zoom: per.photoZoom || 1.0,
          short_bio: per.shortBio,
          full_bio: per.fullBio,
          district: per.district || '',
          facebook_url: per.facebookUrl || '',
          linkedin_url: per.linkedinUrl || '',
          email: per.email || '',
          phone: per.phone || '',
          social_links: per.socialLinks,
          joining_year: per.joiningYear || '',
          active: per.active,
          updated_at: new Date().toISOString()
        });
      }

      // Positions
      for (const pos of positions) {
        await supabase.from('positions').upsert({
          id: pos.id,
          name: pos.name,
          level: pos.level,
          sort_order: pos.sortOrder,
          description: pos.description
        });
      }

      // Committees
      for (const com of committees) {
        await supabase.from('committees').upsert({
          id: com.id,
          slug: com.slug,
          name: com.name,
          type: com.type,
          year: com.year,
          description: com.description,
          status: com.status,
          sort_order: com.sortOrder,
          is_featured: com.isFeatured,
          banner_image_url: com.bannerImageUrl || '',
          updated_at: new Date().toISOString()
        });
      }

      // Committee Members
      for (const mem of committeeMembers) {
        await supabase.from('committee_members').upsert({
          id: mem.id,
          committee_id: mem.committeeId,
          person_id: mem.personId,
          position_id: mem.positionId,
          serial_number: mem.serialNumber,
          sort_order: mem.sortOrder,
          is_featured_leader: mem.isFeaturedLeader,
          start_date: mem.startDate || '',
          end_date: mem.endDate || '',
          status: mem.status
        });
      }

      // Media Library
      for (const med of mediaLibrary) {
        await supabase.from('media_library').upsert({
          id: med.id,
          file_name: med.fileName,
          url: med.url,
          file_size: med.fileSize,
          mime_type: med.mimeType,
          category: med.category,
          alt_text: med.altText,
          caption: med.caption || '',
          usage_tags: med.usageTags,
          uploaded_at: new Date().toISOString()
        });
      }

      // Videos Documentation & Footage
      for (const vid of videos) {
        const det = detectAndNormalizeMedia(vid.videoUrl || '');
        await supabase.from('video_items').upsert({
          id: vid.id,
          title: vid.title,
          video_url: vid.videoUrl,
          embed_url: vid.embedUrl || det.embedUrl || '',
          thumbnail_url: vid.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL,
          platform: vid.platform || det.platform || 'youtube',
          duration: vid.duration || '',
          date: vid.date || new Date().toISOString().split('T')[0],
          description: vid.description,
          category: vid.category || 'General',
          status: vid.status || 'published',
          is_featured: vid.isFeatured || false,
          source_type: vid.sourceType || 'url',
          aspect_ratio: vid.aspectRatio || '16/9',
          is_shorts: vid.isShorts || false,
          created_at: vid.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Journey Videos
      for (const jvid of journeyVideos) {
        const det = detectAndNormalizeMedia(jvid.videoUrl || '');
        await supabase.from('journey_videos').upsert({
          id: jvid.id,
          title: jvid.title,
          timeline_label: jvid.timelineLabel,
          description: jvid.description,
          category: jvid.category || 'Organizational Journey',
          video_url: jvid.videoUrl || '',
          video_platform: jvid.videoPlatform || det.platform || 'auto',
          embed_url: jvid.embedUrl || det.embedUrl || '',
          thumbnail_url: jvid.thumbnailUrl || det.thumbnailUrl || '',
          display_order: jvid.displayOrder ?? 0,
          is_published: jvid.isPublished ?? true,
          is_featured: jvid.isFeatured ?? false,
          created_at: jvid.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Blood Donors
      for (const d of bloodDonors) {
        if (deletedDonorIdsRef.current.has(d.id)) continue;
        await supabase.from('blood_donors').upsert({
          id: d.id,
          full_name: d.fullName,
          blood_group: d.bloodGroup,
          gender: d.gender || null,
          date_of_birth: d.dateOfBirth || d.dob || null,
          phone: d.phone,
          email: d.email || null,
          photo_url: d.photoUrl || null,
          district: d.district,
          upazila: d.upazila,
          area: d.area,
          detailed_address: d.detailedAddress || null,
          org_category: d.orgCategory,
          committee_position: d.committeePosition || null,
          availability_status: d.availabilityStatus,
          first_donation_date: d.firstDonationDate || null,
          last_donation_date: d.lastDonationDate || null,
          total_donations: d.totalDonations,
          experience_notes: d.experienceNotes || null,
          is_verified: d.isVerified,
          approval_status: d.approvalStatus,
          privacy_consent: d.privacyConsent,
          show_phone_publicly: d.showPhonePublicly,
          created_at: d.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Emergency Blood Requests
      for (const r of emergencyBloodRequests) {
        if (deletedRequestIdsRef.current.has(r.id)) continue;
        await supabase.from('emergency_blood_requests').upsert({
          id: r.id,
          requester_name: r.requesterName,
          contact_number: r.contactNumber,
          patient_name: r.patientName,
          blood_group: r.bloodGroup,
          units_needed: r.unitsNeeded,
          hospital_name: r.hospitalName,
          district: r.district,
          upazila: r.upazila,
          emergency_level: r.emergencyLevel,
          required_date: r.requiredDate,
          additional_notes: r.additionalNotes || null,
          status: r.status,
          matched_donor_ids: r.matchedDonorIds,
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Blood Donation Settings
      await supabase.from('blood_donation_settings').upsert({
        id: 'default_blood_settings',
        wing_logo_url: bloodDonationSettings.wingLogoUrl,
        wing_logo_size: bloodDonationSettings.wingLogoSize,
        wing_logo_zoom: bloodDonationSettings.wingLogoZoom,
        wing_logo_crop: bloodDonationSettings.wingLogoCrop,
        hero_badge: bloodDonationSettings.heroBadge,
        hero_title: bloodDonationSettings.heroTitle,
        hero_subtitle: bloodDonationSettings.heroSubtitle,
        hero_cta_badge: bloodDonationSettings.heroCtaBadge,
        hero_cta_title: bloodDonationSettings.heroCtaTitle,
        hero_cta_description: bloodDonationSettings.heroCtaDescription,
        hero_cta_btn1_text: bloodDonationSettings.heroCtaBtn1Text,
        hero_cta_btn2_text: bloodDonationSettings.heroCtaBtn2Text,
        stat_total_donors_label: bloodDonationSettings.statTotalDonorsLabel,
        stat_active_donors_label: bloodDonationSettings.statActiveDonorsLabel,
        stat_groups_label: bloodDonationSettings.statGroupsLabel,
        stat_groups_value: bloodDonationSettings.statGroupsValue,
        stat_impact_label: bloodDonationSettings.statImpactLabel,
        stat_total_donors_override: bloodDonationSettings.statTotalDonorsOverride,
        stat_active_donors_override: bloodDonationSettings.statActiveDonorsOverride,
        stat_impact_override: bloodDonationSettings.statImpactOverride,
        emergency_helpline: bloodDonationSettings.emergencyHelpline,
        helpline_label: bloodDonationSettings.helplineLabel,
        coordination_email: bloodDonationSettings.coordinationEmail,
        guidelines_title: bloodDonationSettings.guidelinesTitle,
        guidelines_text: bloodDonationSettings.guidelinesText,
        consent_statement: bloodDonationSettings.consentStatement,
        enable_public_direct_contact: bloodDonationSettings.enablePublicDirectContact,
        updated_at: new Date().toISOString()
      });

      setLastSyncedAt(new Date());
      logAudit('SYNC', 'Database', 'full_push', 'Pushed all local CMS entities to Supabase Cloud Database');
      return { success: true, message: 'Successfully synchronized all CMS data and cloud image URLs to Supabase!' };
    } catch (err: any) {
      console.error('Push to Supabase failed:', err);
      return { success: false, message: err.message || 'Failed to push data to Supabase.' };
    } finally {
      setIsSyncing(false);
    }
  }, [
    settings, homepageConfig, aboutSettings, headerSettings, footerSettings,
    programs, campaigns, positions, persons, committees, committeeMembers, mediaLibrary, videos, journeyVideos,
    bloodDonors, emergencyBloodRequests, bloodDonationSettings, logAudit
  ]);

  // MUTATIONS: Global Settings
  const updateHomepageConfig = useCallback((newConfig: Partial<HomepageConfig>) => {
    setHomepageConfig(prev => {
      const updated: HomepageConfig = {
        ...prev,
        ...newConfig,
        hero: newConfig.hero
          ? {
              ...prev.hero,
              ...newConfig.hero,
              heroImageUrl: getFreshImageUrl(newConfig.hero.heroImageUrl || prev.hero.heroImageUrl)
            }
          : prev.hero,
        aboutPreview: newConfig.aboutPreview
          ? {
              ...prev.aboutPreview,
              ...newConfig.aboutPreview,
              imageUrl: getFreshImageUrl(newConfig.aboutPreview.imageUrl || prev.aboutPreview.imageUrl)
            }
          : prev.aboutPreview,
        volunteerBanner: newConfig.volunteerBanner ? { ...prev.volunteerBanner, ...newConfig.volunteerBanner } : prev.volunteerBanner,
        supportBanner: newConfig.supportBanner ? { ...prev.supportBanner, ...newConfig.supportBanner } : prev.supportBanner,
        impactSection: newConfig.impactSection ? { ...prev.impactSection, ...newConfig.impactSection } : prev.impactSection,
        programsSection: newConfig.programsSection ? { ...prev.programsSection, ...newConfig.programsSection } : prev.programsSection,
        campaignsSection: newConfig.campaignsSection ? { ...prev.campaignsSection, ...newConfig.campaignsSection } : prev.campaignsSection,
        storiesSection: newConfig.storiesSection ? { ...prev.storiesSection, ...newConfig.storiesSection } : prev.storiesSection,
        lifelineSection: newConfig.lifelineSection ? { ...prev.lifelineSection, ...newConfig.lifelineSection } : prev.lifelineSection,
        gallerySection: newConfig.gallerySection ? { ...prev.gallerySection, ...newConfig.gallerySection } : prev.gallerySection,
        pressSection: newConfig.pressSection ? { ...prev.pressSection, ...newConfig.pressSection } : prev.pressSection,
        transparencySection: newConfig.transparencySection ? { ...prev.transparencySection, ...newConfig.transparencySection } : prev.transparencySection,
        sectionOrder: newConfig.sectionOrder || prev.sectionOrder,
        sectionVisibility: newConfig.sectionVisibility ? { ...prev.sectionVisibility, ...newConfig.sectionVisibility } : prev.sectionVisibility
      };
      logAudit('UPDATE', 'HomepageConfig', 'homepage', 'Updated homepage hero, sections, or visibility');

      try {
        localStorage.setItem(`${STORAGE_PREFIX}homepageConfig`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('infinity_homepage_config_updated', { detail: updated }));
      } catch (e) {
        console.warn('Failed to save homepageConfig to localStorage:', e);
      }

      const safeVolunteerBanner = {
        ...(updated.volunteerBanner || {}),
        section_headers: {
          impact: updated.impactSection,
          programs: updated.programsSection,
          campaigns: updated.campaignsSection,
          stories: updated.storiesSection,
          lifeline: updated.lifelineSection,
          gallery: updated.gallerySection,
          press: updated.pressSection,
          transparency: updated.transparencySection
        }
      };

      safeDbUpsert('homepage_config', {
        id: 'default',
        hero: updated.hero,
        about_preview: updated.aboutPreview,
        volunteer_banner: safeVolunteerBanner,
        support_banner: updated.supportBanner,
        section_order: updated.sectionOrder,
        section_visibility: updated.sectionVisibility,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateAboutSettings = useCallback((newSettings: Partial<AboutSettings>) => {
    setAboutSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        heroImageUrl: getFreshImageUrl(newSettings.heroImageUrl || prev.heroImageUrl),
        secondaryImageUrl: getFreshImageUrl(newSettings.secondaryImageUrl || prev.secondaryImageUrl)
      };
      logAudit('UPDATE', 'AboutSettings', 'about', 'Updated organization about settings');

      safeDbUpsert('about_settings', {
        id: 'default',
        title: updated.title,
        subtitle: updated.subtitle,
        mission: updated.mission,
        vision: updated.vision,
        history: updated.history,
        established_year: updated.establishedYear,
        location: updated.location,
        hero_image_url: updated.heroImageUrl,
        secondary_image_url: updated.secondaryImageUrl || '',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateHeaderSettings = useCallback((newSettings: Partial<HeaderSettings>) => {
    setHeaderSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        logoUrl: getFreshImageUrl(newSettings.logoUrl || prev.logoUrl)
      };
      logAudit('UPDATE', 'HeaderSettings', 'header', 'Updated header notice bar or navigation settings');

      safeDbUpsert('header_settings', {
        id: 'default',
        logo_url: updated.logoUrl,
        show_notice_bar: updated.showNoticeBar,
        notice_bar_text: updated.noticeBarText,
        notice_bar_link: updated.noticeBarLink || 'transparency',
        notice_bar_button_text: updated.noticeBarButtonText,
        show_notice_bar_button: updated.showNoticeBarButton,
        show_search: updated.showSearch,
        show_language_switcher: updated.showLanguageSwitcher,
        support_button_text: updated.supportButtonText,
        support_button_url: updated.supportButtonUrl || 'donate',
        show_support_button: updated.showSupportButton,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateFooterSettings = useCallback((newSettings: Partial<FooterSettings>) => {
    setFooterSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        footerLogoUrl: getFreshImageUrl(newSettings.footerLogoUrl || prev.footerLogoUrl)
      };
      logAudit('UPDATE', 'FooterSettings', 'footer', 'Updated footer text, address, or copyright');

      safeDbUpsert('footer_settings', {
        id: 'default',
        footer_logo_url: updated.footerLogoUrl,
        description: updated.description,
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        copyright_text: updated.copyrightText,
        callout_eyebrow: updated.calloutEyebrow,
        callout_title: updated.calloutTitle,
        callout_subtitle: updated.calloutSubtitle,
        volunteer_cta_text: updated.volunteerCtaText,
        volunteer_cta_url: updated.volunteerCtaUrl || 'volunteer',
        support_cta_text: updated.supportCtaText,
        support_cta_url: updated.supportCtaUrl || 'donate',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateVolunteerSettings = useCallback((newSettings: Partial<VolunteerSettings>) => {
    setVolunteerSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        coverImageUrl: getFreshImageUrl(newSettings.coverImageUrl || prev.coverImageUrl)
      };
      logAudit('UPDATE', 'VolunteerSettings', 'volunteer', 'Updated volunteer CTA, benefits or form link');

      safeDbUpsert('volunteer_settings', {
        id: 'default',
        cta_text: updated.ctaText,
        google_form_url: updated.googleFormUrl,
        description: updated.description,
        cover_image_url: updated.coverImageUrl,
        benefits: updated.benefits,
        requirements: updated.requirements,
        contact_email: updated.contactEmail,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateSupportSettings = useCallback((newSettings: Partial<SupportSettings>) => {
    setSupportSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        qrCodeImageUrl: getFreshImageUrl(newSettings.qrCodeImageUrl || prev.qrCodeImageUrl)
      };
      logAudit('UPDATE', 'SupportSettings', 'support', 'Updated payment instructions, bKash, Nagad or bank details');

      safeDbUpsert('support_settings', {
        id: 'default',
        cta_text: updated.ctaText,
        description: updated.description,
        bkash_number: updated.bKashNumber || updated.bkashNumber,
        bkash_type: updated.bKashType,
        nagad_number: updated.nagadNumber,
        nagad_type: updated.nagadType,
        bank_details: updated.bankDetails,
        qr_code_image_url: updated.qrCodeImageUrl || '',
        payment_instructions: updated.paymentInstructions,
        support_email: updated.supportEmail,
        support_phone: updated.supportPhone,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateContactSettings = useCallback((newSettings: Partial<ContactSettings>) => {
    setContactSettings(prev => {
      const updated = { ...prev, ...newSettings };
      logAudit('UPDATE', 'ContactSettings', 'contact', 'Updated official contact phone, email or address');

      safeDbUpsert('contact_settings', {
        id: 'default',
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        office_hours: updated.officeHours,
        google_maps_embed_url: updated.googleMapsEmbedUrl,
        emergency_helpline: updated.emergencyHelpline || '',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateSEOSettings = useCallback((newSettings: Partial<GlobalSEOSettings>) => {
    setSeoSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        ogImageUrl: getFreshImageUrl(newSettings.ogImageUrl || prev.ogImageUrl)
      };
      logAudit('UPDATE', 'SEOSettings', 'seo', 'Updated global SEO meta tags');

      safeDbUpsert('seo_settings', {
        id: 'default',
        site_title: updated.siteTitle,
        meta_description: updated.metaDescription,
        keywords: updated.keywords,
        og_image_url: updated.ogImageUrl,
        organization_name: updated.organizationName,
        canonical_url: updated.canonicalUrl,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        logoUrl: getFreshImageUrl(newSettings.logoUrl || prev.logoUrl),
        faviconUrl: getFreshImageUrl(newSettings.faviconUrl || prev.faviconUrl)
      };
      logAudit('UPDATE', 'SiteSettings', 'site', 'Updated main site settings');

      safeDbUpsert('site_settings', {
        id: 'default',
        organization_name: updated.organizationName,
        team_identity: updated.teamIdentity,
        tagline: updated.tagline,
        country: updated.country,
        official_address: updated.officialAddress,
        official_phone: updated.officialPhone,
        official_email: updated.officialEmail,
        established_year: updated.establishedYear || '2015',
        logo_url: updated.logoUrl || '',
        favicon_url: updated.faviconUrl || '',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit, safeDbUpsert]);

  // MUTATIONS: Social Links
  const addSocialLink = useCallback((link: Omit<SocialLink, 'id'>) => {
    const id = `soc-${Date.now()}`;
    const newLink: SocialLink = { ...link, id };
    setSocialLinks(prev => [...prev, newLink]);
    logAudit('CREATE', 'SocialLink', id, `Added ${link.platform} link`);
    safeDbUpsert('social_links', newLink);
  }, [logAudit, safeDbUpsert]);

  const updateSocialLink = useCallback((id: string, link: Partial<SocialLink>) => {
    setSocialLinks(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...link } : s);
      const match = updated.find(s => s.id === id);
      if (match) safeDbUpsert('social_links', match);
      return updated;
    });
    logAudit('UPDATE', 'SocialLink', id, 'Updated social link details');
  }, [logAudit, safeDbUpsert]);

  const deleteSocialLink = useCallback((id: string) => {
    setSocialLinks(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE', 'SocialLink', id, 'Deleted social link');
    safeDbDelete('social_links', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Navigation Items
  const addNavigationItem = useCallback((item: Omit<NavigationItem, 'id'>) => {
    const id = `nav-${Date.now()}`;
    const newItem: NavigationItem = { ...item, id };
    setNavigationItems(prev => [...prev, newItem]);
    logAudit('CREATE', 'NavigationItem', id, `Added navigation link: ${item.label.en}`);
    safeDbUpsert('navigation_items', newItem);
  }, [logAudit, safeDbUpsert]);

  const updateNavigationItem = useCallback((id: string, item: Partial<NavigationItem>) => {
    setNavigationItems(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, ...item } : n);
      const match = updated.find(n => n.id === id);
      if (match) safeDbUpsert('navigation_items', match);
      return updated;
    });
    logAudit('UPDATE', 'NavigationItem', id, 'Updated navigation item');
  }, [logAudit, safeDbUpsert]);

  const deleteNavigationItem = useCallback((id: string) => {
    setNavigationItems(prev => prev.filter(n => n.id !== id));
    logAudit('DELETE', 'NavigationItem', id, 'Deleted navigation item');
    safeDbDelete('navigation_items', 'id', id);
  }, [logAudit, safeDbDelete]);

  const reorderNavigationItems = useCallback((items: NavigationItem[]) => {
    setNavigationItems(items);
    logAudit('UPDATE', 'NavigationItems', 'reorder', 'Reordered navigation menu items');
  }, [logAudit]);

  // MUTATIONS: Banners
  const addBanner = useCallback((banner: Omit<BannerItem, 'id'>) => {
    const id = `ban-${Date.now()}`;
    const newBanner: BannerItem = {
      ...banner,
      id,
      desktopImageUrl: getFreshImageUrl(banner.desktopImageUrl),
      mobileImageUrl: banner.mobileImageUrl ? getFreshImageUrl(banner.mobileImageUrl) : ''
    };
    setBanners(prev => [...prev, newBanner]);
    logAudit('CREATE', 'BannerItem', id, `Created banner: ${banner.title.en}`);
    safeDbUpsert('banners', newBanner);
  }, [logAudit, safeDbUpsert]);

  const updateBanner = useCallback((id: string, banner: Partial<BannerItem>) => {
    setBanners(prev => {
      const updated = prev.map(b => {
        if (b.id !== id) return b;
        return {
          ...b,
          ...banner,
          desktopImageUrl: banner.desktopImageUrl ? getFreshImageUrl(banner.desktopImageUrl) : b.desktopImageUrl,
          mobileImageUrl: banner.mobileImageUrl ? getFreshImageUrl(banner.mobileImageUrl) : b.mobileImageUrl
        };
      });
      const match = updated.find(b => b.id === id);
      if (match) safeDbUpsert('banners', match);
      return updated;
    });
    logAudit('UPDATE', 'BannerItem', id, 'Updated banner details');
  }, [logAudit, safeDbUpsert]);

  const deleteBanner = useCallback((id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    logAudit('DELETE', 'BannerItem', id, 'Deleted banner');
    safeDbDelete('banners', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Media Library & Albums
  const addMediaItem = useCallback((media: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const id = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMedia: MediaItem = {
      ...media,
      id,
      url: getFreshImageUrl(media.url),
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMediaLibrary(prev => [newMedia, ...prev]);
    logAudit('CREATE', 'MediaItem', id, `Uploaded media: ${media.fileName}`);

    safeDbUpsert('media_library', {
      id: newMedia.id,
      file_name: newMedia.fileName,
      url: newMedia.url,
      file_size: newMedia.fileSize,
      mime_type: newMedia.mimeType,
      category: newMedia.category,
      alt_text: newMedia.altText,
      caption: newMedia.caption || '',
      usage_tags: newMedia.usageTags,
      uploaded_at: new Date().toISOString()
    });

    return newMedia;
  }, [logAudit, safeDbUpsert]);

  const updateMediaItem = useCallback((id: string, media: Partial<MediaItem>) => {
    setMediaLibrary(prev => {
      const updated = prev.map(m => {
        if (m.id !== id) return m;
        return {
          ...m,
          ...media,
          url: media.url ? getFreshImageUrl(media.url) : m.url
        };
      });
      const match = updated.find(m => m.id === id);
      if (match) {
        safeDbUpsert('media_library', {
          id: match.id,
          file_name: match.fileName,
          url: match.url,
          file_size: match.fileSize,
          mime_type: match.mimeType,
          category: match.category,
          alt_text: match.altText,
          caption: match.caption || '',
          usage_tags: match.usageTags
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'MediaItem', id, 'Updated media metadata/alt-text');
  }, [logAudit, safeDbUpsert]);

  const deleteMediaItem = useCallback(async (id: string) => {
    deletedIdsRef.current.add(id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_video_ids`, JSON.stringify(Array.from(deletedIdsRef.current)));
    } catch (e) {
      console.warn('Storage error on deleted_video_ids:', e);
    }

    setMediaLibrary(prev => {
      const next = prev.filter(m => m.id !== id && m.url !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}mediaLibrary`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setVideos(prev => {
      const next = prev.filter(v => v.id !== id && v.videoUrl !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setGallery(prev => {
      const next = prev.filter(g => g.id !== id && g.imageUrl !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}gallery`, JSON.stringify(next));
      } catch {}
      return next;
    });

    logAudit('DELETE', 'MediaItem', id, 'Deleted media asset');

    if (supabase && isSupabaseConfigured) {
      try {
        const [res1, res2, res3] = await Promise.allSettled([
          supabase.from('media_library').delete().eq('id', id),
          supabase.from('video_items').delete().eq('id', id),
          supabase.from('gallery_photos').delete().eq('id', id)
        ]);
        if (res1.status === 'rejected' || (res1.status === 'fulfilled' && res1.value.error)) {
          console.error('Supabase media_library delete warning:', res1);
        }
        if (res2.status === 'rejected' || (res2.status === 'fulfilled' && res2.value.error)) {
          console.error('Supabase video_items delete warning:', res2);
        }
      } catch (err) {
        console.error('Supabase delete exception:', err);
      }
    }
  }, [logAudit]);

  const addGalleryAlbum = useCallback((album: Omit<GalleryAlbum, 'id'>) => {
    const id = `alb-${Date.now()}`;
    const newAlbum: GalleryAlbum = {
      ...album,
      id,
      coverImageUrl: getFreshImageUrl(album.coverImageUrl)
    };
    setGalleryAlbums(prev => [...prev, newAlbum]);
    logAudit('CREATE', 'GalleryAlbum', id, `Created album: ${album.title.en}`);

    safeDbUpsert('gallery_albums', {
      id: newAlbum.id,
      slug: newAlbum.slug,
      title: newAlbum.title,
      description: newAlbum.description,
      cover_image_url: newAlbum.coverImageUrl,
      category: newAlbum.category,
      date: newAlbum.date,
      is_published: newAlbum.isPublished,
      display_order: newAlbum.displayOrder
    });

    return newAlbum;
  }, [logAudit, safeDbUpsert]);

  const updateGalleryAlbum = useCallback((id: string, album: Partial<GalleryAlbum>) => {
    setGalleryAlbums(prev => {
      const updated = prev.map(a => {
        if (a.id !== id) return a;
        return {
          ...a,
          ...album,
          coverImageUrl: album.coverImageUrl ? getFreshImageUrl(album.coverImageUrl) : a.coverImageUrl
        };
      });
      const match = updated.find(a => a.id === id);
      if (match) {
        safeDbUpsert('gallery_albums', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          description: match.description,
          cover_image_url: match.coverImageUrl,
          category: match.category,
          date: match.date,
          is_published: match.isPublished,
          display_order: match.displayOrder
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'GalleryAlbum', id, 'Updated gallery album');
  }, [logAudit, safeDbUpsert]);

  const deleteGalleryAlbum = useCallback((id: string) => {
    setGalleryAlbums(prev => prev.filter(a => a.id !== id));
    logAudit('DELETE', 'GalleryAlbum', id, 'Deleted gallery album');
    safeDbDelete('gallery_albums', 'id', id);
  }, [logAudit, safeDbDelete]);

  const setAlbumPhotos = useCallback((albumId: string, photoIds: string[]) => {
    setGallery(prev => {
      const updated = prev.map(photo => {
        if (photoIds.includes(photo.id)) {
          const newPhoto = { ...photo, albumId, displayOrder: photoIds.indexOf(photo.id) + 1 };
          safeDbUpsert('gallery_photos', {
            id: newPhoto.id,
            album_id: albumId,
            title: newPhoto.title,
            caption: newPhoto.caption,
            image_url: newPhoto.imageUrl,
            category: newPhoto.category,
            date: newPhoto.date,
            location: newPhoto.location,
            campaign_slug: newPhoto.campaignSlug || '',
            display_order: newPhoto.displayOrder || 0
          });
          return newPhoto;
        } else if (photo.albumId === albumId) {
          const newPhoto = { ...photo, albumId: undefined };
          safeDbUpsert('gallery_photos', {
            id: newPhoto.id,
            album_id: null,
            title: newPhoto.title,
            caption: newPhoto.caption,
            image_url: newPhoto.imageUrl,
            category: newPhoto.category,
            date: newPhoto.date,
            location: newPhoto.location,
            campaign_slug: newPhoto.campaignSlug || '',
            display_order: newPhoto.displayOrder || 0
          });
          return newPhoto;
        }
        return photo;
      });
      return updated;
    });

    setGalleryAlbums(prev => {
      return prev.map(alb => {
        if (alb.id !== albumId) return alb;
        return {
          ...alb,
          photos: gallery.filter(g => photoIds.includes(g.id))
        };
      });
    });

    logAudit('UPDATE', 'GalleryAlbum', albumId, `Updated photos in album (${photoIds.length} photos assigned)`);
  }, [gallery, logAudit, safeDbUpsert]);

  // MUTATIONS: Press & Media Coverage
  const addPressCoverage = useCallback((press: Omit<PressCoverage, 'id'>) => {
    const id = `press-${Date.now()}`;
    const newPress: PressCoverage = {
      ...press,
      id,
      imageUrl: press.imageUrl ? getFreshImageUrl(press.imageUrl) : undefined,
      outletLogoUrl: press.outletLogoUrl ? getFreshImageUrl(press.outletLogoUrl) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPressCoverages(prev => [newPress, ...prev]);
    logAudit('CREATE', 'PressCoverage', id, `Added press coverage: ${press.title.en}`);

    safeDbUpsert('press_coverage', {
      id: newPress.id,
      outlet_name: newPress.outletName,
      outlet_logo_url: newPress.outletLogoUrl,
      title: newPress.title,
      article_url: newPress.articleUrl,
      excerpt: newPress.excerpt,
      coverage_type: newPress.coverageType,
      published_date: newPress.publishedDate,
      image_url: newPress.imageUrl,
      is_featured: newPress.isFeatured,
      status: newPress.status,
      created_at: newPress.createdAt,
      updated_at: newPress.updatedAt
    });

    return newPress;
  }, [logAudit, safeDbUpsert]);

  const updatePressCoverage = useCallback((id: string, press: Partial<PressCoverage>) => {
    setPressCoverages(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...press,
          imageUrl: press.imageUrl ? getFreshImageUrl(press.imageUrl) : p.imageUrl,
          outletLogoUrl: press.outletLogoUrl ? getFreshImageUrl(press.outletLogoUrl) : p.outletLogoUrl,
          updatedAt: new Date().toISOString()
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('press_coverage', {
          id: match.id,
          outlet_name: match.outletName,
          outlet_logo_url: match.outletLogoUrl,
          title: match.title,
          article_url: match.articleUrl,
          excerpt: match.excerpt,
          coverage_type: match.coverageType,
          published_date: match.publishedDate,
          image_url: match.imageUrl,
          is_featured: match.isFeatured,
          status: match.status,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'PressCoverage', id, 'Updated press coverage details');
  }, [logAudit, safeDbUpsert]);

  const deletePressCoverage = useCallback((id: string) => {
    setPressCoverages(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'PressCoverage', id, 'Deleted press coverage item');
    safeDbDelete('press_coverage', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Core Programs & Campaigns
  const addCampaign = useCallback((campaign: Omit<Campaign, 'id'>) => {
    const id = `camp-${Date.now()}`;
    const newCamp: Campaign = {
      ...campaign,
      id,
      imageUrl: getFreshImageUrl(campaign.imageUrl),
      galleryImages: (campaign.galleryImages || []).map(img => getFreshImageUrl(img))
    };
    setCampaigns(prev => [newCamp, ...prev]);
    logAudit('CREATE', 'Campaign', id, `Created campaign: ${campaign.title.en}`);

    safeDbUpsert('campaigns', {
      id: newCamp.id,
      slug: newCamp.slug,
      title: newCamp.title,
      date: newCamp.date,
      end_date: newCamp.endDate || '',
      location: newCamp.location,
      category: newCamp.category,
      description: newCamp.description,
      details: newCamp.details,
      objectives: newCamp.objectives,
      activities: newCamp.activities,
      beneficiaries: newCamp.beneficiaries,
      beneficiaries_count: newCamp.beneficiariesCount,
      volunteers_count: newCamp.volunteersCount,
      impact: newCamp.impact,
      status: newCamp.status,
      is_featured: newCamp.isFeatured,
      target_amount_bdt: newCamp.targetAmountBDT || '',
      raised_amount_bdt: newCamp.raisedAmountBDT || '',
      image_url: newCamp.imageUrl,
      gallery_images: newCamp.galleryImages,
      video_url: newCamp.videoUrl || '',
      report_url: newCamp.reportUrl || '',
      display_order: newCamp.displayOrder || 0,
      updated_at: new Date().toISOString()
    });

    return newCamp;
  }, [logAudit, safeDbUpsert]);

  const updateCampaign = useCallback((id: string, campaign: Partial<Campaign>) => {
    setCampaigns(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...campaign,
          imageUrl: campaign.imageUrl ? getFreshImageUrl(campaign.imageUrl) : c.imageUrl,
          galleryImages: campaign.galleryImages ? campaign.galleryImages.map(img => getFreshImageUrl(img)) : c.galleryImages
        };
      });
      const match = updated.find(c => c.id === id);
      if (match) {
        safeDbUpsert('campaigns', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          date: match.date,
          end_date: match.endDate || '',
          location: match.location,
          category: match.category,
          description: match.description,
          details: match.details,
          objectives: match.objectives,
          activities: match.activities,
          beneficiaries: match.beneficiaries,
          beneficiaries_count: match.beneficiariesCount,
          volunteers_count: match.volunteersCount,
          impact: match.impact,
          status: match.status,
          is_featured: match.isFeatured,
          target_amount_bdt: match.targetAmountBDT || '',
          raised_amount_bdt: match.raisedAmountBDT || '',
          image_url: match.imageUrl,
          gallery_images: match.galleryImages,
          video_url: match.videoUrl || '',
          report_url: match.reportUrl || '',
          display_order: match.displayOrder || 0,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Campaign', id, 'Updated campaign details or gallery');
  }, [logAudit, safeDbUpsert]);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    logAudit('DELETE', 'Campaign', id, 'Deleted campaign');
    safeDbDelete('campaigns', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addProgram = useCallback((program: Omit<Program, 'id'>) => {
    const id = `prog-${Date.now()}`;
    const newProg: Program = {
      ...program,
      id,
      imageUrl: getFreshImageUrl(program.imageUrl)
    };
    setPrograms(prev => [...prev, newProg]);
    logAudit('CREATE', 'Program', id, `Created program: ${program.title.en}`);

    safeDbUpsert('programs', {
      id: newProg.id,
      slug: newProg.slug,
      title: newProg.title,
      category: newProg.category,
      short_description: newProg.shortDescription,
      full_details: newProg.fullDetails,
      impact_highlights: newProg.impactHighlights,
      image_url: newProg.imageUrl,
      icon_name: newProg.iconName,
      status: newProg.status,
      display_order: newProg.displayOrder || 0,
      updated_at: new Date().toISOString()
    });

    return newProg;
  }, [logAudit, safeDbUpsert]);

  const updateProgram = useCallback((id: string, program: Partial<Program>) => {
    setPrograms(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...program,
          imageUrl: program.imageUrl ? getFreshImageUrl(program.imageUrl) : p.imageUrl
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('programs', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          category: match.category,
          short_description: match.shortDescription,
          full_details: match.fullDetails,
          impact_highlights: match.impactHighlights,
          image_url: match.imageUrl,
          icon_name: match.iconName,
          status: match.status,
          display_order: match.displayOrder || 0,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Program', id, 'Updated program info');
  }, [logAudit, safeDbUpsert]);

  const deleteProgram = useCallback((id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Program', id, 'Deleted program');
    safeDbDelete('programs', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Program Events / Editions
  const addProgramEvent = useCallback((event: Omit<ProgramEvent, 'id'>) => {
    const id = `pevt-${Date.now()}`;
    const newEvt: ProgramEvent = {
      ...event,
      id,
      coverImageUrl: getFreshImageUrl(event.coverImageUrl)
    };
    setProgramEvents(prev => [newEvt, ...prev]);
    logAudit('CREATE', 'ProgramEvent', id, `Created event edition: ${event.title.en}`);

    safeDbUpsert('program_events', {
      id: newEvt.id,
      program_id: newEvt.programId,
      slug: newEvt.slug,
      title: newEvt.title,
      year: newEvt.year,
      date_range: newEvt.dateRange,
      start_date: newEvt.startDate || null,
      end_date: newEvt.endDate || null,
      location: newEvt.location,
      cover_image_url: newEvt.coverImageUrl,
      short_description: newEvt.shortDescription,
      full_story: newEvt.fullStory || null,
      objectives: newEvt.objectives || null,
      impact_metrics: newEvt.impactMetrics || [],
      status: newEvt.status,
      display_order: newEvt.displayOrder || 0,
      is_featured: newEvt.isFeatured || false,
      updated_at: new Date().toISOString()
    });

    return newEvt;
  }, [logAudit, safeDbUpsert]);

  const updateProgramEvent = useCallback((id: string, updates: Partial<ProgramEvent>) => {
    setProgramEvents(prev => {
      const updated = prev.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          ...updates,
          coverImageUrl: updates.coverImageUrl ? getFreshImageUrl(updates.coverImageUrl) : e.coverImageUrl
        };
      });
      const match = updated.find(e => e.id === id);
      if (match) {
        safeDbUpsert('program_events', {
          id: match.id,
          program_id: match.programId,
          slug: match.slug,
          title: match.title,
          year: match.year,
          date_range: match.dateRange,
          start_date: match.startDate || null,
          end_date: match.endDate || null,
          location: match.location,
          cover_image_url: match.coverImageUrl,
          short_description: match.shortDescription,
          full_story: match.fullStory || null,
          objectives: match.objectives || null,
          impact_metrics: match.impactMetrics || [],
          status: match.status,
          display_order: match.displayOrder || 0,
          is_featured: match.isFeatured || false,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'ProgramEvent', id, 'Updated program event/edition');
  }, [logAudit, safeDbUpsert]);

  const deleteProgramEvent = useCallback((id: string) => {
    setProgramEvents(prev => prev.filter(e => e.id !== id));
    setEventMediaList(prev => prev.filter(em => em.eventId !== id));
    logAudit('DELETE', 'ProgramEvent', id, 'Deleted program event edition');
    safeDbDelete('program_events', 'id', id);
    safeDbDelete('event_media', 'event_id', id);
  }, [logAudit, safeDbDelete]);

  const reorderProgramEvents = useCallback((programId: string, orderedIds: string[]) => {
    setProgramEvents(prev => {
      const idOrderMap = new Map(orderedIds.map((id, index) => [id, index + 1]));
      return prev.map(evt => {
        if (evt.programId === programId && idOrderMap.has(evt.id)) {
          return { ...evt, displayOrder: idOrderMap.get(evt.id) };
        }
        return evt;
      });
    });
    logAudit('REORDER', 'ProgramEvent', programId, `Reordered editions for program ${programId}`);
  }, [logAudit]);

  // Event Media & Highlights Curation Mutations
  const addMediaToEvent = useCallback((eventId: string, mediaId: string, isHighlight: boolean = false, caption?: { en: string; bn: string }) => {
    const id = `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEm: EventMedia = {
      id,
      eventId,
      mediaId,
      isHighlight,
      highlightOrder: isHighlight ? 1 : undefined,
      customCaption: caption
    };
    setEventMediaList(prev => {
      if (prev.some(em => em.eventId === eventId && em.mediaId === mediaId)) {
        return prev;
      }
      return [...prev, newEm];
    });
    logAudit('ATTACH', 'EventMedia', id, `Attached media ${mediaId} to event ${eventId}`);

    safeDbUpsert('event_media', {
      id: newEm.id,
      event_id: newEm.eventId,
      media_id: newEm.mediaId,
      is_highlight: newEm.isHighlight,
      highlight_order: newEm.highlightOrder || null,
      custom_caption: newEm.customCaption || null,
      custom_alt: newEm.customAlt || null,
      updated_at: new Date().toISOString()
    });

    return newEm;
  }, [logAudit, safeDbUpsert]);

  const removeMediaFromEvent = useCallback((eventId: string, mediaId: string) => {
    setEventMediaList(prev => prev.filter(em => !(em.eventId === eventId && em.mediaId === mediaId)));
    logAudit('DETACH', 'EventMedia', `${eventId}_${mediaId}`, `Removed media from event`);
    if (isSupabaseConfigured && supabase) {
      supabase.from('event_media').delete().match({ event_id: eventId, media_id: mediaId }).then();
    }
  }, [logAudit]);

  const toggleEventHighlight = useCallback((eventId: string, mediaId: string, isHighlight?: boolean) => {
    setEventMediaList(prev => {
      const match = prev.find(em => em.eventId === eventId && em.mediaId === mediaId);
      const nextHighlight = isHighlight !== undefined ? isHighlight : !match?.isHighlight;
      const currentHighlights = prev.filter(em => em.eventId === eventId && em.isHighlight);
      const nextOrder = nextHighlight ? (currentHighlights.length + 1) : undefined;

      const updated = prev.map(em => {
        if (em.eventId === eventId && em.mediaId === mediaId) {
          return {
            ...em,
            isHighlight: nextHighlight,
            highlightOrder: nextOrder
          };
        }
        return em;
      });

      const target = updated.find(em => em.eventId === eventId && em.mediaId === mediaId);
      if (target) {
        safeDbUpsert('event_media', {
          id: target.id,
          event_id: target.eventId,
          media_id: target.mediaId,
          is_highlight: target.isHighlight,
          highlight_order: target.highlightOrder || null,
          custom_caption: target.customCaption || null,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'EventMediaHighlight', `${eventId}_${mediaId}`, 'Toggled event media highlight status');
  }, [logAudit, safeDbUpsert]);

  const reorderEventHighlights = useCallback((eventId: string, orderedMediaIds: string[]) => {
    setEventMediaList(prev => {
      const idOrderMap = new Map(orderedMediaIds.map((id, index) => [id, index + 1]));
      return prev.map(em => {
        if (em.eventId === eventId && idOrderMap.has(em.mediaId)) {
          return {
            ...em,
            isHighlight: true,
            highlightOrder: idOrderMap.get(em.mediaId)
          };
        }
        return em;
      });
    });
    logAudit('REORDER', 'EventHighlights', eventId, `Reordered highlights for event ${eventId}`);
  }, [logAudit]);

  const setEventHighlights = useCallback((eventId: string, highlightMediaIds: string[]) => {
    const highlightSet = new Set(highlightMediaIds);
    const idOrderMap = new Map(highlightMediaIds.map((id, index) => [id, index + 1]));

    setEventMediaList(prev => {
      return prev.map(em => {
        if (em.eventId === eventId) {
          const isH = highlightSet.has(em.mediaId);
          return {
            ...em,
            isHighlight: isH,
            highlightOrder: isH ? idOrderMap.get(em.mediaId) : undefined
          };
        }
        return em;
      });
    });
    logAudit('CURATE', 'EventHighlights', eventId, `Updated curated highlights (${highlightMediaIds.length} items) for event ${eventId}`);
  }, [logAudit]);

  // Helper Selectors
  const getEventsByProgramId = useCallback((programId: string): ProgramEvent[] => {
    return programEvents
      .filter(e => e.programId === programId)
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [programEvents]);

  const getProgramEventBySlug = useCallback((programSlug: string, eventSlug: string) => {
    const prog = programs.find(p => p.slug === programSlug || p.id === programSlug);
    if (!prog) return null;
    const evt = programEvents.find(e => (e.programId === prog.id) && (e.slug === eventSlug || e.id === eventSlug));
    return { program: prog, event: evt };
  }, [programs, programEvents]);

  const getEventMedia = useCallback((eventId: string) => {
    const ems = eventMediaList.filter(em => em.eventId === eventId);
    return ems.map(em => {
      const media = mediaLibrary.find(m => m.id === em.mediaId) || {
        id: em.mediaId,
        fileName: 'Media File',
        url: '',
        fileSize: '',
        mimeType: 'image/jpeg',
        category: 'Events',
        altText: '',
        uploadedAt: '',
        usageTags: []
      } as MediaItem;
      return { ...em, media };
    }).filter(em => Boolean(em.media.url));
  }, [eventMediaList, mediaLibrary]);

  const getEventHighlights = useCallback((eventId: string) => {
    const all = getEventMedia(eventId);
    return all
      .filter(item => item.isHighlight)
      .sort((a, b) => (a.highlightOrder || 999) - (b.highlightOrder || 999));
  }, [getEventMedia]);

  const addMetric = useCallback((metric: Omit<ImpactMetric, 'id'>) => {
    const id = `met-${Date.now()}`;
    const newMet: ImpactMetric = { ...metric, id };
    setMetrics(prev => [...prev, newMet]);
    logAudit('CREATE', 'ImpactMetric', id, `Added metric: ${metric.label.en}`);
    safeDbUpsert('impact_metrics', newMet);
    return newMet;
  }, [logAudit, safeDbUpsert]);

  const updateMetric = useCallback((id: string, metric: Partial<ImpactMetric>) => {
    setMetrics(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...metric } : m);
      const match = updated.find(m => m.id === id);
      if (match) safeDbUpsert('impact_metrics', match);
      return updated;
    });
    logAudit('UPDATE', 'ImpactMetric', id, 'Updated impact metric');
  }, [logAudit, safeDbUpsert]);

  const deleteMetric = useCallback((id: string) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', 'ImpactMetric', id, 'Deleted metric');
    safeDbDelete('impact_metrics', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addStory = useCallback((story: Omit<ImpactStory, 'id'>) => {
    const id = `story-${Date.now()}`;
    const newStory: ImpactStory = {
      ...story,
      id,
      imageUrl: getFreshImageUrl(story.imageUrl)
    };
    setStories(prev => [newStory, ...prev]);
    logAudit('CREATE', 'ImpactStory', id, `Published story: ${story.title.en}`);

    safeDbUpsert('stories', {
      id: newStory.id,
      slug: newStory.slug,
      title: newStory.title,
      person_or_community: newStory.personOrCommunity,
      location: newStory.location,
      date: newStory.date,
      story: newStory.story,
      impact: newStory.impact,
      image_url: newStory.imageUrl,
      campaign_slug: newStory.campaignSlug || '',
      consent_confirmed: newStory.consentConfirmed,
      is_featured: newStory.isFeatured,
      status: newStory.status,
      updated_at: new Date().toISOString()
    });

    return newStory;
  }, [logAudit, safeDbUpsert]);

  const updateStory = useCallback((id: string, story: Partial<ImpactStory>) => {
    setStories(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          ...story,
          imageUrl: story.imageUrl ? getFreshImageUrl(story.imageUrl) : s.imageUrl
        };
      });
      const match = updated.find(s => s.id === id);
      if (match) {
        safeDbUpsert('stories', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          person_or_community: match.personOrCommunity,
          location: match.location,
          date: match.date,
          story: match.story,
          impact: match.impact,
          image_url: match.imageUrl,
          campaign_slug: match.campaignSlug || '',
          consent_confirmed: match.consentConfirmed,
          is_featured: match.isFeatured,
          status: match.status,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'ImpactStory', id, 'Updated story content');
  }, [logAudit, safeDbUpsert]);

  const deleteStory = useCallback((id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE', 'ImpactStory', id, 'Deleted story');
    safeDbDelete('stories', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addNews = useCallback((newsItem: Omit<NewsArticle, 'id'>) => {
    const id = `news-${Date.now()}`;
    const newN: NewsArticle = {
      ...newsItem,
      id,
      imageUrl: getFreshImageUrl(newsItem.imageUrl)
    };
    setNews(prev => [newN, ...prev]);
    logAudit('CREATE', 'NewsArticle', id, `Added news: ${newsItem.title.en}`);

    safeDbUpsert('news_articles', {
      id: newN.id,
      slug: newN.slug,
      title: newN.title,
      excerpt: newN.excerpt,
      content: newN.content,
      category: newN.category,
      author: newN.author,
      date: newN.date,
      image_url: newN.imageUrl,
      tags: newN.tags,
      status: newN.status,
      updated_at: new Date().toISOString()
    });

    return newN;
  }, [logAudit, safeDbUpsert]);

  const updateNews = useCallback((id: string, newsItem: Partial<NewsArticle>) => {
    setNews(prev => {
      const updated = prev.map(n => {
        if (n.id !== id) return n;
        return {
          ...n,
          ...newsItem,
          imageUrl: newsItem.imageUrl ? getFreshImageUrl(newsItem.imageUrl) : n.imageUrl
        };
      });
      const match = updated.find(n => n.id === id);
      if (match) {
        safeDbUpsert('news_articles', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          excerpt: match.excerpt,
          content: match.content,
          category: match.category,
          author: match.author,
          date: match.date,
          image_url: match.imageUrl,
          tags: match.tags,
          status: match.status,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'NewsArticle', id, 'Updated news article');
  }, [logAudit, safeDbUpsert]);

  const deleteNews = useCallback((id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    logAudit('DELETE', 'NewsArticle', id, 'Deleted news article');
    safeDbDelete('news_articles', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addEvent = useCallback((eventItem: Omit<EventItem, 'id'>) => {
    const id = `ev-${Date.now()}`;
    const newEv: EventItem = {
      ...eventItem,
      id,
      imageUrl: getFreshImageUrl(eventItem.imageUrl)
    };
    setEvents(prev => [newEv, ...prev]);
    logAudit('CREATE', 'EventItem', id, `Added event: ${eventItem.title.en}`);

    safeDbUpsert('event_items', {
      id: newEv.id,
      slug: newEv.slug,
      title: newEv.title,
      date: newEv.date,
      time: newEv.time,
      location: newEv.location,
      description: newEv.description,
      image_url: newEv.imageUrl,
      status: newEv.status,
      registration_open: newEv.registrationOpen,
      updated_at: new Date().toISOString()
    });

    return newEv;
  }, [logAudit, safeDbUpsert]);

  const updateEvent = useCallback((id: string, eventItem: Partial<EventItem>) => {
    setEvents(prev => {
      const updated = prev.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          ...eventItem,
          imageUrl: eventItem.imageUrl ? getFreshImageUrl(eventItem.imageUrl) : e.imageUrl
        };
      });
      const match = updated.find(e => e.id === id);
      if (match) {
        safeDbUpsert('event_items', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          date: match.date,
          time: match.time,
          location: match.location,
          description: match.description,
          image_url: match.imageUrl,
          status: match.status,
          registration_open: match.registrationOpen,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'EventItem', id, 'Updated event details');
  }, [logAudit, safeDbUpsert]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE', 'EventItem', id, 'Deleted event');
    safeDbDelete('event_items', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addGalleryPhoto = useCallback((photo: Omit<GalleryPhoto, 'id'>) => {
    const id = `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPhoto: GalleryPhoto = {
      ...photo,
      id,
      imageUrl: getFreshImageUrl(photo.imageUrl)
    };
    setGallery(prev => [newPhoto, ...prev]);
    logAudit('CREATE', 'GalleryPhoto', id, `Added gallery photo: ${photo.title.en}`);

    safeDbUpsert('gallery_photos', {
      id: newPhoto.id,
      album_id: newPhoto.albumId || null,
      title: newPhoto.title,
      caption: newPhoto.caption,
      image_url: newPhoto.imageUrl,
      category: newPhoto.category,
      date: newPhoto.date,
      location: newPhoto.location,
      campaign_slug: newPhoto.campaignSlug || '',
      display_order: newPhoto.displayOrder || 0
    });

    return newPhoto;
  }, [logAudit, safeDbUpsert]);

  const updateGalleryPhoto = useCallback((id: string, photo: Partial<GalleryPhoto>) => {
    setGallery(prev => {
      const updated = prev.map(g => {
        if (g.id !== id) return g;
        return {
          ...g,
          ...photo,
          imageUrl: photo.imageUrl ? getFreshImageUrl(photo.imageUrl) : g.imageUrl
        };
      });
      const match = updated.find(g => g.id === id);
      if (match) {
        safeDbUpsert('gallery_photos', {
          id: match.id,
          album_id: match.albumId || null,
          title: match.title,
          caption: match.caption,
          image_url: match.imageUrl,
          category: match.category,
          date: match.date,
          location: match.location,
          campaign_slug: match.campaignSlug || '',
          display_order: match.displayOrder || 0
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'GalleryPhoto', id, 'Updated gallery photo metadata');
  }, [logAudit, safeDbUpsert]);

  const deleteGalleryPhoto = useCallback((id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    logAudit('DELETE', 'GalleryPhoto', id, 'Deleted photo');
    safeDbDelete('gallery_photos', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addVideo = useCallback((video: Omit<VideoItem, 'id'>) => {
    const id = `vid-${Date.now()}`;
    const det = detectAndNormalizeMedia(video.videoUrl || '');
    const cleanThumbnail = video.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL;
    const cleanEmbed = video.embedUrl || det.embedUrl || '';
    const cleanTitle = typeof video.title === 'string'
      ? { en: video.title, bn: video.title }
      : (video.title || { en: 'Field Video', bn: 'মাঠপর্যায়ের ভিডিও' });
    const cleanDescription = typeof video.description === 'string'
      ? { en: video.description, bn: video.description }
      : (video.description || { en: '', bn: '' });

    const isShorts = video.isShorts ?? det.isShorts;
    const aspectRatio = video.aspectRatio || det.aspectRatio || (isShorts ? '9/16' : '16/9');

    const newVid: VideoItem = {
      ...video,
      id,
      title: cleanTitle,
      description: cleanDescription,
      videoUrl: det.originalUrl || video.videoUrl,
      embedUrl: cleanEmbed,
      thumbnailUrl: getFreshImageUrl(cleanThumbnail),
      platform: video.platform || det.platform || 'youtube',
      category: video.category || 'General',
      status: video.status || 'published',
      isFeatured: video.isFeatured ?? false,
      sourceType: video.sourceType || 'url',
      aspectRatio,
      isShorts,
      displayOrder: video.displayOrder || (videos.length + 1),
      date: video.date || new Date().toISOString().split('T')[0],
      duration: video.duration || (isShorts ? 'Shorts' : 'Video'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVideos(prev => [newVid, ...prev]);
    logAudit('CREATE', 'VideoItem', id, `Added video: ${cleanTitle.en || cleanTitle.bn}`);

    // Also mirror to mediaLibrary so it appears across media tabs and gallery
    setMediaLibrary(prev => {
      if (prev.some(m => m.id === id || m.url === newVid.videoUrl)) return prev;
      const newMedia: MediaItem = {
        id,
        fileName: cleanTitle.en || cleanTitle.bn || 'Video Asset',
        url: newVid.videoUrl,
        type: 'video',
        thumbnailUrl: newVid.thumbnailUrl,
        fileSize: 'External Stream',
        mimeType: 'video/embed',
        category: (newVid.category as any) || 'General',
        altText: cleanTitle.en || cleanTitle.bn,
        caption: cleanDescription.en || cleanDescription.bn,
        platform: newVid.platform as any,
        duration: newVid.duration,
        aspectRatio: newVid.aspectRatio,
        isShorts: newVid.isShorts,
        usageTags: ['Video Gallery', 'Field Footage'],
        uploadedAt: new Date().toISOString(),
        isFeatured: newVid.isFeatured,
        status: (newVid.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft'
      };
      safeDbUpsert('media_library', {
        id: newMedia.id,
        file_name: newMedia.fileName,
        url: newMedia.url,
        file_size: newMedia.fileSize,
        mime_type: newMedia.mimeType,
        category: newMedia.category,
        alt_text: newMedia.altText,
        caption: newMedia.caption || '',
        usage_tags: newMedia.usageTags,
        uploaded_at: newMedia.uploadedAt
      });
      return [newMedia, ...prev];
    });

    safeDbUpsert('video_items', {
      id: newVid.id,
      title: newVid.title,
      video_url: newVid.videoUrl,
      embed_url: newVid.embedUrl || '',
      thumbnail_url: newVid.thumbnailUrl,
      platform: newVid.platform,
      duration: newVid.duration || '',
      date: newVid.date,
      description: newVid.description,
      category: newVid.category,
      status: newVid.status,
      is_featured: newVid.isFeatured,
      source_type: newVid.sourceType,
      aspect_ratio: newVid.aspectRatio,
      is_shorts: newVid.isShorts,
      display_order: newVid.displayOrder,
      created_at: newVid.createdAt,
      updated_at: newVid.updatedAt
    });

    return newVid;
  }, [logAudit, safeDbUpsert, videos.length]);

  const updateVideo = useCallback((id: string, video: Partial<VideoItem>) => {
    setVideos(prev => {
      const updated = prev.map(v => {
        if (v.id !== id) return v;
        const nextVideoUrl = video.videoUrl !== undefined ? video.videoUrl : v.videoUrl;
        const det = detectAndNormalizeMedia(nextVideoUrl);
        const nextThumbnail = video.thumbnailUrl !== undefined
          ? (video.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL)
          : (v.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL);
        const nextEmbed = video.embedUrl !== undefined
          ? (video.embedUrl || det.embedUrl || '')
          : (v.embedUrl || det.embedUrl || '');
        const isShorts = video.isShorts !== undefined ? video.isShorts : (v.isShorts ?? det.isShorts);
        const aspectRatio = video.aspectRatio !== undefined ? video.aspectRatio : (v.aspectRatio || det.aspectRatio);

        return {
          ...v,
          ...video,
          videoUrl: det.originalUrl || nextVideoUrl,
          embedUrl: nextEmbed,
          thumbnailUrl: nextThumbnail ? getFreshImageUrl(nextThumbnail) : v.thumbnailUrl,
          aspectRatio,
          isShorts,
          displayOrder: video.displayOrder !== undefined ? video.displayOrder : v.displayOrder,
          updatedAt: new Date().toISOString()
        };
      });

      const match = updated.find(v => v.id === id);
      if (match) {
        safeDbUpsert('video_items', {
          id: match.id,
          title: match.title,
          video_url: match.videoUrl,
          embed_url: match.embedUrl || '',
          thumbnail_url: match.thumbnailUrl,
          platform: match.platform,
          duration: match.duration || '',
          date: match.date,
          description: match.description,
          category: match.category || 'General',
          status: match.status || 'published',
          is_featured: match.isFeatured || false,
          source_type: match.sourceType || 'url',
          aspect_ratio: match.aspectRatio || '16/9',
          is_shorts: match.isShorts || false,
          display_order: match.displayOrder,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'VideoItem', id, 'Updated video metadata');
  }, [logAudit, safeDbUpsert]);

  const deleteVideo = useCallback(async (id: string) => {
    deletedIdsRef.current.add(id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_video_ids`, JSON.stringify(Array.from(deletedIdsRef.current)));
    } catch (e) {
      console.warn('Storage error on deleted_video_ids:', e);
    }

    setVideos(prev => {
      const next = prev.filter(v => v.id !== id && v.videoUrl !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setMediaLibrary(prev => {
      const next = prev.filter(m => m.id !== id && m.url !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}mediaLibrary`, JSON.stringify(next));
      } catch {}
      return next;
    });

    logAudit('DELETE', 'VideoItem', id, 'Deleted video permanently');

    if (supabase && isSupabaseConfigured) {
      try {
        const [res1, res2] = await Promise.allSettled([
          supabase.from('video_items').delete().eq('id', id),
          supabase.from('media_library').delete().eq('id', id)
        ]);
        if (res1.status === 'rejected' || (res1.status === 'fulfilled' && res1.value.error)) {
          console.error('Supabase video_items delete failed:', res1);
        }
        if (res2.status === 'rejected' || (res2.status === 'fulfilled' && res2.value.error)) {
          console.error('Supabase media_library delete failed:', res2);
        }
      } catch (err) {
        console.error('Supabase delete exception:', err);
      }
    }
  }, [logAudit]);

  const reorderVideos = useCallback((orderedIds: string[]) => {
    setVideos(prev => {
      const idMap = new Map(prev.map(item => [item.id, item]));
      const reordered: VideoItem[] = [];

      orderedIds.forEach((id, index) => {
        const item = idMap.get(id);
        if (item) {
          const updatedItem: VideoItem = { ...item, displayOrder: index + 1, updatedAt: new Date().toISOString() };
          reordered.push(updatedItem);
          safeDbUpsert('video_items', {
            id: updatedItem.id,
            title: updatedItem.title,
            video_url: updatedItem.videoUrl,
            embed_url: updatedItem.embedUrl || '',
            thumbnail_url: updatedItem.thumbnailUrl,
            platform: updatedItem.platform,
            duration: updatedItem.duration || '',
            date: updatedItem.date,
            description: updatedItem.description,
            category: updatedItem.category,
            status: updatedItem.status,
            is_featured: updatedItem.isFeatured,
            source_type: updatedItem.sourceType,
            aspect_ratio: updatedItem.aspectRatio,
            is_shorts: updatedItem.isShorts,
            display_order: updatedItem.displayOrder,
            created_at: updatedItem.createdAt || new Date().toISOString(),
            updated_at: updatedItem.updatedAt
          });
        }
      });

      prev.forEach(item => {
        if (!orderedIds.includes(item.id)) {
          reordered.push(item);
        }
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(reordered));
        localStorage.setItem(`${STORAGE_PREFIX}video_order`, JSON.stringify(orderedIds));
      } catch (e) {
        console.warn('Storage error on reorderVideos:', e);
      }

      return reordered;
    });
    logAudit('UPDATE', 'VideoItem', 'bulk', 'Reordered video items sequence');
  }, [logAudit, safeDbUpsert]);

  // ----------------------------------------------------
  // JOURNEY VIDEOS (ABOUT OVERVIEW & STORY)
  // ----------------------------------------------------
  const addJourneyVideo = useCallback((video: Omit<JourneyVideo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `jvid-${Date.now()}`;
    const det = detectAndNormalizeMedia(video.videoUrl || '');
    const cleanEmbed = video.embedUrl || det.embedUrl || '';
    const cleanThumbnail = video.thumbnailUrl || det.thumbnailUrl || '';
    const cleanTitle = typeof video.title === 'string'
      ? { en: video.title, bn: video.title }
      : (video.title || { en: 'Infinity Bangladesh Journey', bn: 'ইনফিনিটি বাংলাদেশ পরিক্রমা' });
    const cleanTimeline = typeof video.timelineLabel === 'string'
      ? { en: video.timelineLabel, bn: video.timelineLabel }
      : (video.timelineLabel || { en: 'Journey', bn: 'পরিক্রমা' });
    const cleanDescription = typeof video.description === 'string'
      ? { en: video.description, bn: video.description }
      : (video.description || { en: '', bn: '' });

    const newVid: JourneyVideo = {
      ...video,
      id,
      title: cleanTitle,
      timelineLabel: cleanTimeline,
      description: cleanDescription,
      category: video.category || 'Organizational Journey',
      videoUrl: video.videoUrl || '',
      videoPlatform: video.videoPlatform || det.platform || 'auto',
      embedUrl: cleanEmbed,
      thumbnailUrl: cleanThumbnail ? getFreshImageUrl(cleanThumbnail) : '',
      displayOrder: video.displayOrder ?? (journeyVideos.length + 1),
      isPublished: video.isPublished ?? true,
      isFeatured: video.isFeatured ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setJourneyVideos(prev => {
      let list = prev;
      if (newVid.isFeatured) {
        list = list.map(v => ({ ...v, isFeatured: false }));
      }
      return [...list, newVid].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });

    logAudit('CREATE', 'JourneyVideo', id, `Added journey video: ${cleanTimeline.en || cleanTitle.en}`);

    if (newVid.isFeatured && supabase && isSupabaseConfigured) {
      void supabase.from('journey_videos').update({ is_featured: false }).neq('id', id);
    }

    safeDbUpsert('journey_videos', {
      id: newVid.id,
      title: newVid.title,
      timeline_label: newVid.timelineLabel,
      description: newVid.description,
      category: newVid.category,
      video_url: newVid.videoUrl,
      video_platform: newVid.videoPlatform,
      embed_url: newVid.embedUrl || '',
      thumbnail_url: newVid.thumbnailUrl || '',
      display_order: newVid.displayOrder,
      is_published: newVid.isPublished,
      is_featured: newVid.isFeatured,
      created_at: newVid.createdAt,
      updated_at: newVid.updatedAt
    });

    return newVid;
  }, [journeyVideos.length, logAudit, safeDbUpsert]);

  const updateJourneyVideo = useCallback((id: string, video: Partial<JourneyVideo>) => {
    setJourneyVideos(prev => {
      const willBeFeatured = video.isFeatured === true;
      const updated = prev.map(v => {
        if (v.id !== id) {
          if (willBeFeatured) return { ...v, isFeatured: false };
          return v;
        }
        const nextVideoUrl = video.videoUrl !== undefined ? video.videoUrl : v.videoUrl;
        const det = detectAndNormalizeMedia(nextVideoUrl);
        const nextEmbed = video.embedUrl !== undefined
          ? (video.embedUrl || det.embedUrl || '')
          : (v.embedUrl || det.embedUrl || '');
        const nextThumbnail = video.thumbnailUrl !== undefined
          ? (video.thumbnailUrl || det.thumbnailUrl || '')
          : (v.thumbnailUrl || det.thumbnailUrl || '');

        return {
          ...v,
          ...video,
          embedUrl: nextEmbed,
          thumbnailUrl: nextThumbnail ? getFreshImageUrl(nextThumbnail) : '',
          updatedAt: new Date().toISOString()
        };
      }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      const match = updated.find(v => v.id === id);
      if (match) {
        if (willBeFeatured && supabase && isSupabaseConfigured) {
          void supabase.from('journey_videos').update({ is_featured: false }).neq('id', id);
        }

        safeDbUpsert('journey_videos', {
          id: match.id,
          title: match.title,
          timeline_label: match.timelineLabel,
          description: match.description,
          category: match.category || 'Organizational Journey',
          video_url: match.videoUrl || '',
          video_platform: match.videoPlatform || 'auto',
          embed_url: match.embedUrl || '',
          thumbnail_url: match.thumbnailUrl || '',
          display_order: match.displayOrder ?? 0,
          is_published: match.isPublished ?? true,
          is_featured: match.isFeatured ?? false,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });

    logAudit('UPDATE', 'JourneyVideo', id, 'Updated journey video');
  }, [logAudit, safeDbUpsert]);

  const deleteJourneyVideo = useCallback((id: string) => {
    setJourneyVideos(prev => {
      const next = prev.filter(v => v.id !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}journeyVideos`, JSON.stringify(next));
      } catch {}
      return next;
    });

    logAudit('DELETE', 'JourneyVideo', id, 'Deleted journey video');
    safeDbDelete('journey_videos', 'id', id);
  }, [logAudit, safeDbDelete]);

  const reorderJourneyVideos = useCallback((orderedIds: string[]) => {
    setJourneyVideos(prev => {
      const idMap = new Map(prev.map(item => [item.id, item]));
      const reordered: JourneyVideo[] = [];

      orderedIds.forEach((id, index) => {
        const item = idMap.get(id);
        if (item) {
          const updatedItem = { ...item, displayOrder: index + 1, updatedAt: new Date().toISOString() };
          reordered.push(updatedItem);
          safeDbUpsert('journey_videos', {
            id: updatedItem.id,
            title: updatedItem.title,
            timeline_label: updatedItem.timelineLabel,
            description: updatedItem.description,
            category: updatedItem.category,
            video_url: updatedItem.videoUrl,
            video_platform: updatedItem.videoPlatform,
            embed_url: updatedItem.embedUrl || '',
            thumbnail_url: updatedItem.thumbnailUrl || '',
            display_order: updatedItem.displayOrder,
            is_published: updatedItem.isPublished,
            is_featured: updatedItem.isFeatured,
            created_at: updatedItem.createdAt || new Date().toISOString(),
            updated_at: updatedItem.updatedAt
          });
        }
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}journeyVideos`, JSON.stringify(reordered));
      } catch {}
      return reordered;
    });

    logAudit('REORDER', 'JourneyVideo', 'bulk', 'Updated journey videos display sequence');
  }, [logAudit, safeDbUpsert]);

  const setFeaturedJourneyVideo = useCallback((id: string) => {
    setJourneyVideos(prev => {
      const updated = prev.map(v => ({
        ...v,
        isFeatured: v.id === id,
        updatedAt: v.id === id ? new Date().toISOString() : v.updatedAt
      }));

      if (supabase && isSupabaseConfigured) {
        void supabase.from('journey_videos').update({ is_featured: false }).neq('id', id).then(() => {
          void supabase?.from('journey_videos').update({ is_featured: true }).eq('id', id);
        });
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}journeyVideos`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAudit('UPDATE', 'JourneyVideo', id, 'Set as primary featured journey video');
  }, [logAudit]);

  // ----------------------------------------------------
  // BLOOD DONATION NETWORK MUTATIONS
  // ----------------------------------------------------
  const calculateDonorStats = (history: BloodDonationHistoryEntry[] = [], currentFirst?: string, currentLast?: string, currentTotal: number = 0) => {
    if (!history || history.length === 0) {
      return {
        totalDonations: currentTotal,
        firstDonationDate: currentFirst,
        lastDonationDate: currentLast
      };
    }
    const sorted = [...history].sort((a, b) => new Date(a.donationDate).getTime() - new Date(b.donationDate).getTime());
    return {
      totalDonations: history.length,
      firstDonationDate: sorted[0].donationDate,
      lastDonationDate: sorted[sorted.length - 1].donationDate
    };
  };

  const addBloodDonor = useCallback((donor: Omit<BloodDonor, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const id = donor.id?.trim() || `donor-${Date.now()}`;
    if (deletedDonorIdsRef.current.has(id)) {
      deletedDonorIdsRef.current.delete(id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}deleted_donor_ids`, JSON.stringify(Array.from(deletedDonorIdsRef.current)));
      } catch {}
    }
    const stats = calculateDonorStats(donor.donationHistory || [], donor.firstDonationDate, donor.lastDonationDate, donor.totalDonations || 0);
    const newDonor: BloodDonor = cleanBloodDonor({
      ...donor,
      id,
      fullName: donor.fullName.trim(),
      bloodGroup: donor.bloodGroup,
      phone: donor.phone.trim(),
      email: donor.email?.trim() || undefined,
      photoUrl: donor.photoUrl ? getFreshImageUrl(donor.photoUrl) : undefined,
      district: donor.district,
      upazila: donor.upazila,
      area: donor.area.trim(),
      detailedAddress: donor.detailedAddress?.trim() || undefined,
      orgCategory: donor.orgCategory,
      committeePosition: donor.committeePosition?.trim() || undefined,
      availabilityStatus: donor.availabilityStatus || 'AVAILABLE_EMERGENCY',
      totalDonations: stats.totalDonations,
      firstDonationDate: stats.firstDonationDate,
      lastDonationDate: stats.lastDonationDate,
      isVerified: donor.isVerified ?? false,
      approvalStatus: donor.approvalStatus || 'APPROVED',
      privacyConsent: donor.privacyConsent ?? true,
      showPhonePublicly: donor.gender === 'Male' ? true : (donor.showPhonePublicly ?? false),
      donationHistory: (donor.donationHistory || []).map(h => ({ ...h, donorId: id })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setBloodDonors(prev => {
      const updated = [newDonor, ...prev.filter(d => d.id !== id)];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbUpsert('blood_donors', {
      id: newDonor.id,
      full_name: newDonor.fullName,
      blood_group: newDonor.bloodGroup,
      gender: newDonor.gender || null,
      date_of_birth: newDonor.dateOfBirth || newDonor.dob || null,
      phone: newDonor.phone,
      email: newDonor.email || null,
      photo_url: newDonor.photoUrl || null,
      district: newDonor.district,
      upazila: newDonor.upazila,
      area: newDonor.area,
      detailed_address: newDonor.detailedAddress || null,
      org_category: newDonor.orgCategory,
      committee_position: newDonor.committeePosition || null,
      availability_status: newDonor.availabilityStatus,
      first_donation_date: newDonor.firstDonationDate || null,
      last_donation_date: newDonor.lastDonationDate || null,
      total_donations: newDonor.totalDonations,
      experience_notes: newDonor.experienceNotes || null,
      is_verified: newDonor.isVerified,
      approval_status: newDonor.approvalStatus,
      privacy_consent: newDonor.privacyConsent,
      show_phone_publicly: newDonor.showPhonePublicly,
      created_at: newDonor.createdAt,
      updated_at: newDonor.updatedAt
    });

    logAudit('CREATE', 'BloodDonor', id, `Registered blood donor: ${donor.fullName} (${donor.bloodGroup})`);
    return newDonor;
  }, [logAudit, safeDbUpsert]);

  const updateBloodDonor = useCallback((id: string, updates: Partial<BloodDonor>) => {
    setBloodDonors(prev => {
      const newId = updates.id?.trim() || id;
      const updated = prev.map(d => {
        if (d.id !== id) return d;
        const mergedHistory = updates.donationHistory !== undefined ? updates.donationHistory : (d.donationHistory || []);
        const stats = calculateDonorStats(
          mergedHistory,
          updates.firstDonationDate ?? d.firstDonationDate,
          updates.lastDonationDate ?? d.lastDonationDate,
          updates.totalDonations ?? d.totalDonations
        );

        return cleanBloodDonor({
          ...d,
          ...updates,
          id: newId,
          photoUrl: updates.photoUrl !== undefined ? (updates.photoUrl ? getFreshImageUrl(updates.photoUrl) : undefined) : d.photoUrl,
          totalDonations: stats.totalDonations,
          firstDonationDate: stats.firstDonationDate,
          lastDonationDate: stats.lastDonationDate,
          donationHistory: mergedHistory.map(h => ({ ...h, donorId: newId })),
          updatedAt: new Date().toISOString()
        });
      });

      const match = updated.find(d => d.id === newId);
      if (match) {
        if (newId !== id) {
          safeDbDelete('blood_donors', 'id', id);
        }
        safeDbUpsert('blood_donors', {
          id: match.id,
          full_name: match.fullName,
          blood_group: match.bloodGroup,
          gender: match.gender || null,
          date_of_birth: match.dateOfBirth || match.dob || null,
          phone: match.phone,
          email: match.email || null,
          photo_url: match.photoUrl || null,
          district: match.district,
          upazila: match.upazila,
          area: match.area,
          detailed_address: match.detailedAddress || null,
          org_category: match.orgCategory,
          committee_position: match.committeePosition || null,
          availability_status: match.availabilityStatus,
          first_donation_date: match.firstDonationDate || null,
          last_donation_date: match.lastDonationDate || null,
          total_donations: match.totalDonations,
          experience_notes: match.experienceNotes || null,
          is_verified: match.isVerified,
          approval_status: match.approvalStatus,
          privacy_consent: match.privacyConsent,
          show_phone_publicly: match.showPhonePublicly,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAudit('UPDATE', 'BloodDonor', id, `Updated blood donor: ${updates.fullName || id}`);
  }, [logAudit, safeDbDelete, safeDbUpsert]);

  const deleteBloodDonor = useCallback((id: string) => {
    const cleanId = id?.trim();
    if (!cleanId) return;
    deletedDonorIdsRef.current.add(cleanId);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_donor_ids`, JSON.stringify(Array.from(deletedDonorIdsRef.current)));
    } catch {}

    setBloodDonors(prev => {
      const filtered = prev.filter(d => d.id !== cleanId && d.id.trim() !== cleanId);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    logAudit('DELETE', 'BloodDonor', cleanId, 'Deleted blood donor');
    if (supabase && isSupabaseConfigured) {
      Promise.resolve(supabase.from('blood_donation_history').delete().eq('donor_id', cleanId))
        .then(() => (supabase ? Promise.resolve(supabase.from('blood_donors').delete().eq('id', cleanId)) : undefined))
        .catch(err => console.warn('Supabase donor delete error (handled):', err));
    }
  }, [logAudit]);

  const approveBloodDonor = useCallback((id: string) => {
    updateBloodDonor(id, { approvalStatus: 'APPROVED' });
    logAudit('APPROVE', 'BloodDonor', id, 'Approved blood donor application');
  }, [updateBloodDonor, logAudit]);

  const rejectBloodDonor = useCallback((id: string) => {
    updateBloodDonor(id, { approvalStatus: 'REJECTED' });
    logAudit('REJECT', 'BloodDonor', id, 'Rejected blood donor application');
  }, [updateBloodDonor, logAudit]);

  const verifyBloodDonor = useCallback((id: string, isVerified: boolean = true) => {
    updateBloodDonor(id, { isVerified });
    logAudit('VERIFY', 'BloodDonor', id, `Updated verification status to: ${isVerified}`);
  }, [updateBloodDonor, logAudit]);

  const addDonationHistoryEntry = useCallback((donorId: string, entry: Omit<BloodDonationHistoryEntry, 'id' | 'donorId' | 'createdAt'>) => {
    const histId = `hist-${Date.now()}`;
    const newEntry: BloodDonationHistoryEntry = {
      ...entry,
      id: histId,
      donorId,
      createdAt: new Date().toISOString()
    };

    setBloodDonors(prev => {
      const updated = prev.map(d => {
        if (d.id !== donorId) return d;
        const currentHist = d.donationHistory || [];
        const nextHist = [newEntry, ...currentHist];
        const stats = calculateDonorStats(nextHist, d.firstDonationDate, d.lastDonationDate, d.totalDonations);
        return {
          ...d,
          totalDonations: stats.totalDonations,
          firstDonationDate: stats.firstDonationDate,
          lastDonationDate: stats.lastDonationDate,
          donationHistory: nextHist,
          updatedAt: new Date().toISOString()
        };
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbUpsert('blood_donation_history', {
      id: newEntry.id,
      donor_id: donorId,
      donation_date: newEntry.donationDate,
      hospital: newEntry.hospital,
      district: newEntry.district,
      donation_type: newEntry.donationType,
      recipient_reference: newEntry.recipientReference || null,
      notes: newEntry.notes || null,
      is_verified: newEntry.isVerified,
      created_at: newEntry.createdAt || new Date().toISOString()
    });

    logAudit('CREATE', 'BloodDonationHistory', histId, `Added donation history for donor ${donorId}`);
    return newEntry;
  }, [logAudit, safeDbUpsert]);

  const deleteDonationHistoryEntry = useCallback((donorId: string, entryId: string) => {
    setBloodDonors(prev => {
      const updated = prev.map(d => {
        if (d.id !== donorId) return d;
        const currentHist = d.donationHistory || [];
        const nextHist = currentHist.filter(h => h.id !== entryId);
        const stats = calculateDonorStats(nextHist, d.firstDonationDate, d.lastDonationDate, Math.max(0, d.totalDonations - 1));
        return {
          ...d,
          totalDonations: stats.totalDonations,
          firstDonationDate: stats.firstDonationDate,
          lastDonationDate: stats.lastDonationDate,
          donationHistory: nextHist,
          updatedAt: new Date().toISOString()
        };
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbDelete('blood_donation_history', 'id', entryId);
    logAudit('DELETE', 'BloodDonationHistory', entryId, `Deleted donation history record`);
  }, [logAudit, safeDbDelete]);

  const addEmergencyBloodRequest = useCallback((req: Omit<EmergencyBloodRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const id = `req-${Date.now()}`;
    const newReq: EmergencyBloodRequest = cleanEmergencyRequest({
      ...req,
      id,
      requesterName: req.requesterName.trim(),
      contactNumber: req.contactNumber.trim(),
      patientName: req.patientName.trim(),
      hospitalName: req.hospitalName.trim(),
      district: req.district,
      upazila: req.upazila,
      additionalNotes: req.additionalNotes?.trim() || undefined,
      status: 'PENDING',
      matchedDonorIds: req.matchedDonorIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setEmergencyBloodRequests(prev => {
      const updated = [newReq, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbUpsert('emergency_blood_requests', {
      id: newReq.id,
      requester_name: newReq.requesterName,
      contact_number: newReq.contactNumber,
      patient_name: newReq.patientName,
      blood_group: newReq.bloodGroup,
      units_needed: newReq.unitsNeeded,
      hospital_name: newReq.hospitalName,
      district: newReq.district,
      upazila: newReq.upazila,
      emergency_level: newReq.emergencyLevel,
      required_date: newReq.requiredDate,
      additional_notes: newReq.additionalNotes || null,
      status: newReq.status,
      matched_donor_ids: newReq.matchedDonorIds,
      created_at: newReq.createdAt,
      updated_at: newReq.updatedAt
    });

    logAudit('CREATE', 'EmergencyBloodRequest', id, `Created emergency request for ${newReq.patientName} (${newReq.bloodGroup})`);
    return newReq;
  }, [logAudit, safeDbUpsert]);

  const updateEmergencyBloodRequestStatus = useCallback((id: string, status: EmergencyRequestStatus) => {
    setEmergencyBloodRequests(prev => {
      const updated = prev.map(r => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          updatedAt: new Date().toISOString()
        };
      });

      const match = updated.find(r => r.id === id);
      if (match) {
        safeDbUpsert('emergency_blood_requests', {
          id: match.id,
          requester_name: match.requesterName,
          contact_number: match.contactNumber,
          patient_name: match.patientName,
          blood_group: match.bloodGroup,
          units_needed: match.unitsNeeded,
          hospital_name: match.hospitalName,
          district: match.district,
          upazila: match.upazila,
          emergency_level: match.emergencyLevel,
          required_date: match.requiredDate,
          additional_notes: match.additionalNotes || null,
          status: match.status,
          matched_donor_ids: match.matchedDonorIds,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAudit('UPDATE', 'EmergencyBloodRequest', id, `Updated emergency request status to: ${status}`);
  }, [logAudit, safeDbUpsert]);

  const deleteEmergencyBloodRequest = useCallback((id: string) => {
    deletedRequestIdsRef.current.add(id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_emergency_request_ids`, JSON.stringify(Array.from(deletedRequestIdsRef.current)));
    } catch (e) {
      console.warn('Storage error on deleted_emergency_request_ids:', e);
    }

    setEmergencyBloodRequests(prev => {
      const filtered = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    safeDbDelete('emergency_blood_requests', 'id', id);
    logAudit('DELETE', 'EmergencyBloodRequest', id, 'Deleted emergency blood request');
  }, [logAudit, safeDbDelete]);

  const updateBloodDonationSettings = useCallback((newSettings: Partial<BloodDonationSettings>) => {
    setBloodDonationSettings(prev => {
      const updated = { ...prev, ...newSettings };
      safeDbUpsert('blood_donation_settings', {
        id: 'default_blood_settings',
        wing_logo_url: updated.wingLogoUrl,
        wing_logo_size: updated.wingLogoSize,
        wing_logo_zoom: updated.wingLogoZoom,
        wing_logo_crop: updated.wingLogoCrop,
        hero_badge: updated.heroBadge,
        hero_title: updated.heroTitle,
        hero_subtitle: updated.heroSubtitle,
        hero_cta_badge: updated.heroCtaBadge,
        hero_cta_title: updated.heroCtaTitle,
        hero_cta_description: updated.heroCtaDescription,
        hero_cta_btn1_text: updated.heroCtaBtn1Text,
        hero_cta_btn2_text: updated.heroCtaBtn2Text,
        stat_total_donors_label: updated.statTotalDonorsLabel,
        stat_active_donors_label: updated.statActiveDonorsLabel,
        stat_groups_label: updated.statGroupsLabel,
        stat_groups_value: updated.statGroupsValue,
        stat_impact_label: updated.statImpactLabel,
        stat_total_donors_override: updated.statTotalDonorsOverride,
        stat_active_donors_override: updated.statActiveDonorsOverride,
        stat_impact_override: updated.statImpactOverride,
        emergency_helpline: updated.emergencyHelpline,
        helpline_label: updated.helplineLabel,
        coordination_email: updated.coordinationEmail,
        guidelines_title: updated.guidelinesTitle,
        guidelines_text: updated.guidelinesText,
        consent_statement: updated.consentStatement,
        enable_public_direct_contact: updated.enablePublicDirectContact,
        updated_at: new Date().toISOString()
      });
      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonationSettings`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logAudit('UPDATE', 'BloodDonationSettings', 'default_blood_settings', 'Updated blood donation settings');
  }, [logAudit, safeDbUpsert]);

  const addDonorCategory = useCallback((cat: Omit<DonorCategoryOption, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: DonorCategoryOption = { ...cat, id };
    setDonorCategories(prev => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logAudit('CREATE', 'DonorCategory', id, `Added donor category: ${cat.name.en}`);
    return newCat;
  }, [logAudit]);

  const updateDonorCategory = useCallback((id: string, updates: Partial<DonorCategoryOption>) => {
    setDonorCategories(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logAudit('UPDATE', 'DonorCategory', id, `Updated donor category`);
  }, [logAudit]);

  const deleteDonorCategory = useCallback((id: string) => {
    setDonorCategories(prev => {
      const filtered = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    logAudit('DELETE', 'DonorCategory', id, `Deleted donor category`);
  }, [logAudit]);

  const addReport = useCallback((report: Omit<TransparencyReport, 'id'>) => {
    const id = `rep-${Date.now()}`;
    const newRep: TransparencyReport = { ...report, id };
    setReports(prev => [...prev, newRep]);
    logAudit('CREATE', 'TransparencyReport', id, `Added report: ${report.title.en}`);

    safeDbUpsert('transparency_reports', {
      id: newRep.id,
      title: newRep.title,
      type: newRep.type,
      year: newRep.year,
      description: newRep.description,
      upload_date: newRep.uploadDate,
      file_url: newRep.fileUrl,
      file_size: newRep.fileSize,
      status: newRep.status,
      display_order: newRep.displayOrder || 0,
      updated_at: new Date().toISOString()
    });

    return newRep;
  }, [logAudit, safeDbUpsert]);

  const updateReport = useCallback((id: string, report: Partial<TransparencyReport>) => {
    setReports(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...report } : r);
      const match = updated.find(r => r.id === id);
      if (match) safeDbUpsert('transparency_reports', match);
      return updated;
    });
    logAudit('UPDATE', 'TransparencyReport', id, 'Updated report');
  }, [logAudit, safeDbUpsert]);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    logAudit('DELETE', 'TransparencyReport', id, 'Deleted report');
    safeDbDelete('transparency_reports', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addPartner = useCallback((partner: Omit<Partner, 'id'>) => {
    const id = `part-${Date.now()}`;
    const newPart: Partner = {
      ...partner,
      id,
      logoUrl: partner.logoUrl ? getFreshImageUrl(partner.logoUrl) : ''
    };
    setPartners(prev => [...prev, newPart]);
    logAudit('CREATE', 'Partner', id, `Added partner: ${partner.name}`);

    safeDbUpsert('partners', {
      id: newPart.id,
      name: newPart.name,
      logo_url: newPart.logoUrl || '',
      website: newPart.website || '',
      type: newPart.type,
      description: newPart.description,
      partnership_year: newPart.partnershipYear,
      updated_at: new Date().toISOString()
    });

    return newPart;
  }, [logAudit, safeDbUpsert]);

  const updatePartner = useCallback((id: string, partner: Partial<Partner>) => {
    setPartners(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...partner,
          logoUrl: partner.logoUrl ? getFreshImageUrl(partner.logoUrl) : p.logoUrl
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('partners', {
          id: match.id,
          name: match.name,
          logo_url: match.logoUrl || '',
          website: match.website || '',
          type: match.type,
          description: match.description,
          partnership_year: match.partnershipYear,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Partner', id, 'Updated partner details');
  }, [logAudit, safeDbUpsert]);

  const deletePartner = useCallback((id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Partner', id, 'Deleted partner');
    safeDbDelete('partners', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Volunteers, Donations, Messages
  const submitVolunteerApplication = useCallback((app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>): string => {
    const id = `vol-${Date.now()}`;
    const newApp: VolunteerApplication = {
      ...app,
      id,
      submittedAt: new Date().toISOString(),
      status: 'New'
    };
    setVolunteers(prev => [newApp, ...prev]);
    logAudit('SUBMIT', 'VolunteerApplication', id, `New application from ${app.fullName}`);
    safeDbUpsert('volunteer_applications', newApp);
    return id;
  }, [logAudit, safeDbUpsert]);

  const addVolunteerApplication = useCallback((app: Partial<VolunteerApplication>): string => {
    const id = app.id || `vol-${Date.now()}`;
    const newApp: VolunteerApplication = {
      id,
      fullName: app.fullName || 'Anonymous Volunteer',
      email: app.email || '',
      phone: app.phone || '',
      district: app.district || 'Chattogram',
      submittedAt: app.submittedAt || new Date().toISOString(),
      status: app.status || 'New',
      ...app
    };
    setVolunteers(prev => [newApp, ...prev]);
    logAudit('CREATE', 'VolunteerApplication', id, `Added manual volunteer record: ${newApp.fullName}`);
    safeDbUpsert('volunteer_applications', newApp);
    return id;
  }, [logAudit, safeDbUpsert]);

  const updateVolunteerStatus = useCallback((id: string, status: VolunteerApplication['status'], adminNotes?: string) => {
    setVolunteers(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, status, adminNotes: adminNotes !== undefined ? adminNotes : v.adminNotes } : v);
      const match = updated.find(v => v.id === id);
      if (match) safeDbUpsert('volunteer_applications', match);
      return updated;
    });
    logAudit('UPDATE', 'VolunteerApplication', id, `Changed status to ${status}`);
  }, [logAudit, safeDbUpsert]);

  const deleteVolunteerApplication = useCallback((id: string) => {
    setVolunteers(prev => prev.filter(v => v.id !== id));
    logAudit('DELETE', 'VolunteerApplication', id, 'Deleted volunteer application');
    safeDbDelete('volunteer_applications', 'id', id);
  }, [logAudit, safeDbDelete]);

  const submitDonation = useCallback((donation: Omit<DonationRecord, 'id' | 'date' | 'status'>): string => {
    const id = `don-${Date.now()}`;
    const newDon: DonationRecord = {
      ...donation,
      id,
      date: new Date().toISOString(),
      status: 'Pending'
    };
    setDonations(prev => [newDon, ...prev]);
    logAudit('SUBMIT', 'DonationRecord', id, `Donation submitted by ${donation.donorName}: ৳${donation.amountBDT || donation.amount || 0}`);
    safeDbUpsert('donation_records', newDon);
    return id;
  }, [logAudit, safeDbUpsert]);

  const addDonationRecord = useCallback((donation: Partial<DonationRecord>): DonationRecord => {
    const id = donation.id || `don-${Date.now()}`;
    const newDon: DonationRecord = {
      id,
      donorName: donation.donorName || 'Anonymous Supporter',
      paymentMethod: donation.paymentMethod || 'bKash',
      date: donation.date || new Date().toISOString(),
      status: donation.status || 'Successful',
      ...donation
    };
    setDonations(prev => [newDon, ...prev]);
    logAudit('CREATE', 'DonationRecord', id, `Recorded donation: ৳${newDon.amountBDT || newDon.amount || 0}`);
    safeDbUpsert('donation_records', newDon);
    return newDon;
  }, [logAudit, safeDbUpsert]);

  const updateDonationStatus = useCallback((id: string, status: DonationRecord['status']) => {
    setDonations(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, status } : d);
      const match = updated.find(d => d.id === id);
      if (match) safeDbUpsert('donation_records', match);
      return updated;
    });
    logAudit('UPDATE', 'DonationRecord', id, `Changed donation status to ${status}`);
  }, [logAudit, safeDbUpsert]);

  const submitContactMessage = useCallback((msg: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>) => {
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };
    setMessages(prev => [newMsg, ...prev]);
    logAudit('SUBMIT', 'ContactMessage', id, `Received message from ${msg.name}`);
    safeDbUpsert('contact_messages', newMsg);
  }, [logAudit, safeDbUpsert]);

  const addContactMessage = useCallback((msg: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>): ContactMessage => {
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };
    setMessages(prev => [newMsg, ...prev]);
    logAudit('SUBMIT', 'ContactMessage', id, `Received message from ${msg.name}`);
    safeDbUpsert('contact_messages', newMsg);
    return newMsg;
  }, [logAudit, safeDbUpsert]);

  const updateMessageStatus = useCallback((id: string, status: ContactMessage['status']) => {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      const match = updated.find(m => m.id === id);
      if (match) safeDbUpsert('contact_messages', match);
      return updated;
    });
    logAudit('UPDATE', 'ContactMessage', id, `Changed status to ${status}`);
  }, [logAudit, safeDbUpsert]);

  const deleteContactMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', 'ContactMessage', id, 'Deleted contact message');
    safeDbDelete('contact_messages', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Admin Profiles
  const addAdminProfile = useCallback((profile: Omit<AdminProfile, 'id'>): AdminProfile => {
    const id = `adm-${Date.now()}`;
    const newProf: AdminProfile = {
      ...profile,
      id,
      avatarUrl: profile.avatarUrl ? getFreshImageUrl(profile.avatarUrl) : ''
    };
    setAdminProfiles(prev => [...prev, newProf]);
    logAudit('CREATE', 'AdminProfile', id, `Added admin profile: ${profile.fullName}`);
    return newProf;
  }, [logAudit]);

  const updateAdminProfile = useCallback((id: string, profile: Partial<AdminProfile>) => {
    setAdminProfiles(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        ...profile,
        avatarUrl: profile.avatarUrl ? getFreshImageUrl(profile.avatarUrl) : p.avatarUrl
      };
    }));
    logAudit('UPDATE', 'AdminProfile', id, 'Updated admin profile');
  }, [logAudit]);

  const deleteAdminProfile = useCallback((id: string) => {
    setAdminProfiles(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'AdminProfile', id, 'Deleted admin profile');
  }, [logAudit]);

  // MUTATIONS: FAQs
  const addFAQ = useCallback((faq: Omit<FAQItem, 'id'>): FAQItem => {
    const id = `faq-${Date.now()}`;
    const newFAQ: FAQItem = { ...faq, id };
    setFaqs(prev => [...prev, newFAQ]);
    logAudit('CREATE', 'FAQ', id, `Added FAQ: ${faq.question.en}`);
    safeDbUpsert('faqs', newFAQ);
    return newFAQ;
  }, [logAudit, safeDbUpsert]);

  const updateFAQ = useCallback((id: string, faq: Partial<FAQItem>) => {
    setFaqs(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...faq } : f);
      const match = updated.find(f => f.id === id);
      if (match) safeDbUpsert('faqs', match);
      return updated;
    });
    logAudit('UPDATE', 'FAQ', id, 'Updated FAQ');
  }, [logAudit, safeDbUpsert]);

  const deleteFAQ = useCallback((id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    logAudit('DELETE', 'FAQ', id, 'Deleted FAQ');
    safeDbDelete('faqs', 'id', id);
  }, [logAudit, safeDbDelete]);

  // MUTATIONS: Committees & Leadership
  const addCommittee = useCallback((committee: Omit<Committee, 'id'>): Committee => {
    const id = `com-${Date.now()}`;
    const newCom: Committee = {
      ...committee,
      id,
      bannerImageUrl: committee.bannerImageUrl ? getFreshImageUrl(committee.bannerImageUrl) : ''
    };
    setCommittees(prev => [...prev, newCom]);
    logAudit('CREATE', 'Committee', id, `Created committee: ${committee.name.en}`);

    safeDbUpsert('committees', {
      id: newCom.id,
      slug: newCom.slug,
      name: newCom.name,
      type: newCom.type,
      year: newCom.year,
      description: newCom.description,
      status: newCom.status,
      sort_order: newCom.sortOrder,
      is_featured: newCom.isFeatured,
      banner_image_url: newCom.bannerImageUrl || '',
      updated_at: new Date().toISOString()
    });

    return newCom;
  }, [logAudit, safeDbUpsert]);

  const updateCommittee = useCallback((id: string, committee: Partial<Committee>) => {
    setCommittees(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...committee,
          bannerImageUrl: committee.bannerImageUrl ? getFreshImageUrl(committee.bannerImageUrl) : c.bannerImageUrl
        };
      });
      const match = updated.find(c => c.id === id);
      if (match) {
        safeDbUpsert('committees', {
          id: match.id,
          slug: match.slug,
          name: match.name,
          type: match.type,
          year: match.year,
          description: match.description,
          status: match.status,
          sort_order: match.sortOrder,
          is_featured: match.isFeatured,
          banner_image_url: match.bannerImageUrl || '',
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Committee', id, 'Updated committee information');
  }, [logAudit, safeDbUpsert]);

  const deleteCommittee = useCallback((id: string) => {
    setCommittees(prev => prev.filter(c => c.id !== id));
    setCommitteeMembers(prev => prev.filter(m => m.committeeId !== id));
    logAudit('DELETE', 'Committee', id, 'Deleted committee and linked member mappings');
    safeDbDelete('committees', 'id', id);
  }, [logAudit, safeDbDelete]);

  const archiveCommittee = useCallback((id: string) => {
    setCommittees(prev => prev.map(c => c.id === id ? { ...c, status: 'ARCHIVED' } : c));
    logAudit('UPDATE', 'Committee', id, 'Archived committee');
  }, [logAudit]);

  const setActiveCommittee = useCallback((id: string) => {
    setCommittees(prev => prev.map(c => ({
      ...c,
      status: c.id === id ? 'ACTIVE' : (c.status === 'ACTIVE' ? 'ARCHIVED' : c.status)
    })));
    logAudit('UPDATE', 'Committee', id, 'Set as current active executive committee');
  }, [logAudit]);

  const addPerson = useCallback((person: Omit<Person, 'id'>): Person => {
    const id = `per-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPerson: Person = {
      ...person,
      id,
      photoUrl: person.photoUrl ? getFreshImageUrl(person.photoUrl) : ''
    };
    setPersons(prev => [...prev, newPerson]);
    logAudit('CREATE', 'Person', id, `Added person: ${person.englishName}`);

    safeDbUpsert('persons', {
      id: newPerson.id,
      full_name: newPerson.fullName,
      bangla_name: newPerson.banglaName,
      english_name: newPerson.englishName,
      photo_url: newPerson.photoUrl || '',
      photo_position: newPerson.photoPosition || 'center top',
      photo_zoom: newPerson.photoZoom || 1.0,
      short_bio: newPerson.shortBio,
      full_bio: newPerson.fullBio,
      district: newPerson.district || '',
      facebook_url: newPerson.facebookUrl || '',
      linkedin_url: newPerson.linkedinUrl || '',
      email: newPerson.email || '',
      phone: newPerson.phone || '',
      social_links: newPerson.socialLinks,
      joining_year: newPerson.joiningYear || '',
      active: newPerson.active,
      updated_at: new Date().toISOString()
    });

    return newPerson;
  }, [logAudit, safeDbUpsert]);

  const updatePerson = useCallback((id: string, person: Partial<Person>) => {
    setPersons(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...person,
          photoUrl: person.photoUrl ? getFreshImageUrl(person.photoUrl) : p.photoUrl
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('persons', {
          id: match.id,
          full_name: match.fullName,
          bangla_name: match.banglaName,
          english_name: match.englishName,
          photo_url: match.photoUrl || '',
          photo_position: match.photoPosition || 'center top',
          photo_zoom: match.photoZoom || 1.0,
          short_bio: match.shortBio,
          full_bio: match.fullBio,
          district: match.district || '',
          facebook_url: match.facebookUrl || '',
          linkedin_url: match.linkedinUrl || '',
          email: match.email || '',
          phone: match.phone || '',
          social_links: match.socialLinks,
          joining_year: match.joiningYear || '',
          active: match.active,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Person', id, 'Updated person profile/photo');
  }, [logAudit, safeDbUpsert]);

  const deletePerson = useCallback((id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    setCommitteeMembers(prev => prev.filter(m => m.personId !== id));
    logAudit('DELETE', 'Person', id, 'Deleted person profile');
    safeDbDelete('persons', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addPosition = useCallback((pos: Omit<Position, 'id'>): Position => {
    const id = `pos-${Date.now()}`;
    const newPos: Position = { ...pos, id };
    setPositions(prev => [...prev, newPos]);
    logAudit('CREATE', 'Position', id, `Added position: ${pos.name.en}`);
    safeDbUpsert('positions', newPos);
    return newPos;
  }, [logAudit, safeDbUpsert]);

  const updatePosition = useCallback((id: string, pos: Partial<Position>) => {
    setPositions(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...pos } : p);
      const match = updated.find(p => p.id === id);
      if (match) safeDbUpsert('positions', match);
      return updated;
    });
    logAudit('UPDATE', 'Position', id, 'Updated position');
  }, [logAudit, safeDbUpsert]);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Position', id, 'Deleted position');
    safeDbDelete('positions', 'id', id);
  }, [logAudit, safeDbDelete]);

  const addCommitteeMember = useCallback((member: Omit<CommitteeMember, 'id'>): CommitteeMember => {
    const id = `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMem: CommitteeMember = { ...member, id };
    setCommitteeMembers(prev => [...prev, newMem]);
    logAudit('CREATE', 'CommitteeMember', id, `Added member to committee ${member.committeeId}`);

    safeDbUpsert('committee_members', {
      id: newMem.id,
      committee_id: newMem.committeeId,
      person_id: newMem.personId,
      position_id: newMem.positionId,
      serial_number: newMem.serialNumber,
      sort_order: newMem.sortOrder,
      is_featured_leader: newMem.isFeaturedLeader,
      start_date: newMem.startDate || '',
      end_date: newMem.endDate || '',
      status: newMem.status
    });

    return newMem;
  }, [logAudit, safeDbUpsert]);

  const updateCommitteeMember = useCallback((id: string, member: Partial<CommitteeMember>) => {
    setCommitteeMembers(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...member } : m);
      const match = updated.find(m => m.id === id);
      if (match) {
        safeDbUpsert('committee_members', {
          id: match.id,
          committee_id: match.committeeId,
          person_id: match.personId,
          position_id: match.positionId,
          serial_number: match.serialNumber,
          sort_order: match.sortOrder,
          is_featured_leader: match.isFeaturedLeader,
          start_date: match.startDate || '',
          end_date: match.endDate || '',
          status: match.status
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'CommitteeMember', id, 'Updated committee member assignment');
  }, [logAudit, safeDbUpsert]);

  const deleteCommitteeMember = useCallback((id: string) => {
    setCommitteeMembers(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', 'CommitteeMember', id, 'Removed member from committee');
    safeDbDelete('committee_members', 'id', id);
  }, [logAudit, safeDbDelete]);

  const reorderCommitteeMembers = useCallback((committeeId: string, orderedMemberIds: string[]) => {
    setCommitteeMembers(prev => {
      return prev.map(m => {
        if (m.committeeId === committeeId) {
          const index = orderedMemberIds.indexOf(m.id);
          if (index !== -1) {
            const newOrder = index + 1;
            safeDbUpsert('committee_members', {
              id: m.id,
              committee_id: m.committeeId,
              person_id: m.personId,
              position_id: m.positionId,
              serial_number: newOrder,
              sort_order: newOrder,
              is_featured_leader: m.isFeaturedLeader,
              status: m.status
            });
            return {
              ...m,
              serialNumber: newOrder,
              sortOrder: newOrder
            };
          }
        }
        return m;
      });
    });
    logAudit('UPDATE', 'CommitteeMembers', committeeId, 'Reordered committee members lineup');
  }, [logAudit, safeDbUpsert]);

  const getMembersWithDetails = useCallback((committeeId?: string) => {
    const filtered = committeeId
      ? committeeMembers.filter(m => m.committeeId === committeeId)
      : committeeMembers;

    const personsMap = new Map<string, Person>();
    for (let i = 0; i < persons.length; i++) {
      personsMap.set(persons[i].id, persons[i]);
    }
    const positionsMap = new Map<string, Position>();
    for (let i = 0; i < positions.length; i++) {
      positionsMap.set(positions[i].id, positions[i]);
    }
    const committeesMap = new Map<string, Committee>();
    for (let i = 0; i < committees.length; i++) {
      committeesMap.set(committees[i].id, committees[i]);
    }

    const fallbackPerson: Person = {
      id: '',
      fullName: 'Unknown Member',
      banglaName: 'সদস্য',
      englishName: 'Unknown Member',
      active: true
    };
    const fallbackPosition: Position = {
      id: '',
      name: { en: 'Executive Member', bn: 'কার্যনির্বাহী সদস্য' },
      level: 5,
      sortOrder: 20
    };

    return filtered
      .map(m => ({
        ...m,
        person: personsMap.get(m.personId) || { ...fallbackPerson, id: m.personId },
        position: positionsMap.get(m.positionId) || { ...fallbackPosition, id: m.positionId },
        committee: committeesMap.get(m.committeeId)
      }))
      .sort((a, b) => (a.sortOrder || a.serialNumber || 0) - (b.sortOrder || b.serialNumber || 0));
  }, [committeeMembers, persons, positions, committees]);

  // GLOBAL DATABASE BACKUP, EXPORT & IMPORT
  const exportDatabaseJSON = useCallback(() => {
    const data = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      organization: 'Infinity Bangladesh',
      slogan: 'United for Humanity',
      settings,
      homepageConfig,
      aboutSettings,
      headerSettings,
      footerSettings,
      socialLinks,
      volunteerSettings,
      supportSettings,
      contactSettings,
      seoSettings,
      navigationItems,
      banners,
      mediaLibrary,
      galleryAlbums,
      pressCoverages,
      adminProfiles,
      campaigns,
      programs,
      programEvents,
      eventMediaList,
      metrics,
      stories,
      news,
      events,
      gallery,
      videos,
      journeyVideos,
      bloodDonors,
      emergencyBloodRequests,
      bloodDonationSettings,
      donorCategories,
      reports,
      partners,
      volunteers,
      donations,
      messages,
      committees,
      persons,
      positions,
      committeeMembers,
      auditLogs
    };
    return JSON.stringify(data, null, 2);
  }, [
    settings, homepageConfig, aboutSettings, headerSettings, footerSettings,
    socialLinks, volunteerSettings, supportSettings, contactSettings, seoSettings,
    navigationItems, banners, mediaLibrary, galleryAlbums, pressCoverages, adminProfiles,
    campaigns, programs, programEvents, eventMediaList, metrics, stories, news, events, gallery, videos, journeyVideos,
    bloodDonors, emergencyBloodRequests, bloodDonationSettings, donorCategories,
    reports, partners, volunteers, donations, messages, committees,
    persons, positions, committeeMembers, auditLogs
  ]);

  const importDatabaseJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.homepageConfig) setHomepageConfig(parsed.homepageConfig);
      if (parsed.aboutSettings) setAboutSettings(parsed.aboutSettings);
      if (parsed.headerSettings) setHeaderSettings(parsed.headerSettings);
      if (parsed.footerSettings) setFooterSettings(parsed.footerSettings);
      if (parsed.socialLinks) setSocialLinks(parsed.socialLinks);
      if (parsed.volunteerSettings) setVolunteerSettings(parsed.volunteerSettings);
      if (parsed.supportSettings) setSupportSettings(parsed.supportSettings);
      if (parsed.contactSettings) setContactSettings(parsed.contactSettings);
      if (parsed.seoSettings) setSeoSettings(parsed.seoSettings);
      if (parsed.navigationItems) setNavigationItems(parsed.navigationItems);
      if (parsed.banners) setBanners(parsed.banners);
      if (parsed.mediaLibrary) setMediaLibrary(parsed.mediaLibrary);
      if (parsed.galleryAlbums) setGalleryAlbums(parsed.galleryAlbums);
      if (parsed.pressCoverages) setPressCoverages(parsed.pressCoverages);
      if (parsed.adminProfiles) setAdminProfiles(parsed.adminProfiles);
      if (parsed.campaigns) setCampaigns(parsed.campaigns);
      if (parsed.programs) setPrograms(parsed.programs);
      if (parsed.programEvents) setProgramEvents(parsed.programEvents);
      if (parsed.eventMediaList) setEventMediaList(parsed.eventMediaList);
      if (parsed.metrics) setMetrics(parsed.metrics);
      if (parsed.stories) setStories(parsed.stories);
      if (parsed.news) setNews(parsed.news);
      if (parsed.events) setEvents(parsed.events);
      if (parsed.gallery) setGallery(parsed.gallery);
      if (parsed.videos) setVideos(parsed.videos);
      if (parsed.journeyVideos) setJourneyVideos(parsed.journeyVideos);
      if (parsed.bloodDonors) setBloodDonors(parsed.bloodDonors);
      if (parsed.emergencyBloodRequests) setEmergencyBloodRequests(parsed.emergencyBloodRequests);
      if (parsed.bloodDonationSettings) setBloodDonationSettings(parsed.bloodDonationSettings);
      if (parsed.donorCategories) setDonorCategories(parsed.donorCategories);
      if (parsed.reports) setReports(parsed.reports);
      if (parsed.partners) setPartners(parsed.partners);
      if (parsed.volunteers) setVolunteers(parsed.volunteers);
      if (parsed.donations) setDonations(parsed.donations);
      if (parsed.messages) setMessages(parsed.messages);
      if (parsed.committees) setCommittees(parsed.committees);
      if (parsed.persons) setPersons(parsed.persons);
      if (parsed.positions) setPositions(parsed.positions);
      if (parsed.committeeMembers) setCommitteeMembers(parsed.committeeMembers);

      logAudit('IMPORT', 'Database', 'full_restore', 'Restored complete database snapshot from JSON backup');
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }, [logAudit]);

  const resetToDefaultData = useCallback(() => {
    setSettings(INITIAL_SITE_SETTINGS);
    setHomepageConfig(INITIAL_HOMEPAGE_CONFIG);
    setAboutSettings(INITIAL_ABOUT_SETTINGS);
    setHeaderSettings(INITIAL_HEADER_SETTINGS);
    setFooterSettings(INITIAL_FOOTER_SETTINGS);
    setSocialLinks(INITIAL_SOCIAL_LINKS);
    setVolunteerSettings(INITIAL_VOLUNTEER_SETTINGS);
    setSupportSettings(INITIAL_SUPPORT_SETTINGS);
    setContactSettings(INITIAL_CONTACT_SETTINGS);
    setSeoSettings(INITIAL_SEO_SETTINGS);
    setNavigationItems(INITIAL_NAVIGATION_ITEMS);
    setBanners(INITIAL_BANNERS);
    setMediaLibrary(INITIAL_MEDIA_LIBRARY);
    setGalleryAlbums(INITIAL_GALLERY_ALBUMS);
    setPressCoverages(INITIAL_PRESS_COVERAGE);
    setAdminProfiles(INITIAL_ADMIN_PROFILES);
    setCampaigns(INITIAL_CAMPAIGNS);
    setPrograms(INITIAL_PROGRAMS);
    setProgramEvents(INITIAL_PROGRAM_EVENTS);
    setEventMediaList(INITIAL_EVENT_MEDIA);
    setMetrics(INITIAL_IMPACT_METRICS);
    setStories(INITIAL_IMPACT_STORIES);
    setNews(INITIAL_NEWS);
    setEvents(INITIAL_EVENTS);
    setGallery(INITIAL_GALLERY);
    setVideos(INITIAL_VIDEOS);
    setJourneyVideos(INITIAL_JOURNEY_VIDEOS);
    setBloodDonors(INITIAL_BLOOD_DONORS);
    setEmergencyBloodRequests(INITIAL_EMERGENCY_REQUESTS);
    setBloodDonationSettings(INITIAL_BLOOD_SETTINGS);
    setDonorCategories(DEFAULT_DONOR_CATEGORIES);
    setReports(INITIAL_REPORTS);
    setPartners(INITIAL_PARTNERS);
    setVolunteers(INITIAL_VOLUNTEER_APPLICATIONS);
    setDonations(INITIAL_DONATIONS);
    setMessages([]);
    setCommittees(INITIAL_COMMITTEES);
    setPersons(INITIAL_PERSONS);
    setPositions(INITIAL_POSITIONS);
    setCommitteeMembers(INITIAL_COMMITTEE_MEMBERS);
    setAuditLogs([]);

    // Clear local storage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith('infinity_bd_')) {
        localStorage.removeItem(key);
      }
    });

    logAudit('RESET', 'Database', 'factory_reset', 'Reset all CMS entities to verified official defaults');
  }, [logAudit]);

  return (
    <DataContext.Provider
      value={{
        campaigns,
        programs,
        programEvents,
        eventMediaList,
        metrics,
        stories,
        news,
        events,
        gallery,
        videos,
        journeyVideos,
        reports,
        partners,
        volunteers,
        donations,
        messages,
        faqs,
        settings,
        homepageConfig,
        aboutSettings,
        headerSettings,
        footerSettings,
        socialLinks,
        volunteerSettings,
        supportSettings,
        contactSettings,
        seoSettings,
        navigationItems,
        banners,
        mediaLibrary,
        galleryAlbums,
        pressCoverages,
        adminProfiles,
        auditLogs,
        committees,
        persons,
        positions,
        committeeMembers,

        isLiveSupabase: isSupabaseConfigured,
        isSyncing,
        lastSyncedAt,
        previewMode,

        updateHomepageConfig,
        updateAboutSettings,
        updateHeaderSettings,
        updateFooterSettings,
        updateVolunteerSettings,
        updateSupportSettings,
        updateContactSettings,
        updateSEOSettings,
        updateSettings,

        addFAQ,
        updateFAQ,
        deleteFAQ,

        addContactMessage,

        addSocialLink,
        updateSocialLink,
        deleteSocialLink,

        addNavigationItem,
        updateNavigationItem,
        deleteNavigationItem,
        reorderNavigationItems,

        addBanner,
        updateBanner,
        deleteBanner,

        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        addGalleryAlbum,
        updateGalleryAlbum,
        deleteGalleryAlbum,
        setAlbumPhotos,

        addPressCoverage,
        updatePressCoverage,
        deletePressCoverage,

        addCampaign,
        updateCampaign,
        deleteCampaign,

        addProgram,
        updateProgram,
        deleteProgram,

        addProgramEvent,
        updateProgramEvent,
        deleteProgramEvent,
        reorderProgramEvents,

        addMediaToEvent,
        removeMediaFromEvent,
        toggleEventHighlight,
        reorderEventHighlights,
        setEventHighlights,

        getEventsByProgramId,
        getProgramEventBySlug,
        getEventMedia,
        getEventHighlights,

        addMetric,
        updateMetric,
        deleteMetric,

        addStory,
        updateStory,
        deleteStory,

        addNews,
        updateNews,
        deleteNews,

        addEvent,
        updateEvent,
        deleteEvent,

        addGalleryPhoto,
        updateGalleryPhoto,
        deleteGalleryPhoto,

        addVideo,
        updateVideo,
        deleteVideo,
        reorderVideos,

        addJourneyVideo,
        updateJourneyVideo,
        deleteJourneyVideo,
        reorderJourneyVideos,
        setFeaturedJourneyVideo,

        bloodDonors,
        emergencyBloodRequests,
        bloodDonationSettings,
        donorCategories,

        addBloodDonor,
        updateBloodDonor,
        deleteBloodDonor,
        approveBloodDonor,
        rejectBloodDonor,
        verifyBloodDonor,
        addDonationHistoryEntry,
        deleteDonationHistoryEntry,
        addEmergencyBloodRequest,
        updateEmergencyBloodRequestStatus,
        deleteEmergencyBloodRequest,
        updateBloodDonationSettings,
        addDonorCategory,
        updateDonorCategory,
        deleteDonorCategory,

        addReport,
        updateReport,
        deleteReport,

        addPartner,
        updatePartner,
        deletePartner,

        submitVolunteerApplication,
        addVolunteerApplication,
        updateVolunteerStatus,
        deleteVolunteerApplication,

        submitDonation,
        addDonationRecord,
        updateDonationStatus,

        submitContactMessage,
        updateMessageStatus,
        deleteContactMessage,

        addAdminProfile,
        updateAdminProfile,
        deleteAdminProfile,

        addCommittee,
        updateCommittee,
        deleteCommittee,
        archiveCommittee,
        setActiveCommittee,

        addPerson,
        updatePerson,
        deletePerson,

        addPosition,
        updatePosition,
        deletePosition,

        addCommitteeMember,
        updateCommitteeMember,
        deleteCommitteeMember,
        reorderCommitteeMembers,
        getMembersWithDetails,

        setPreviewMode,
        syncWithSupabase,
        loadAdminData,
        isAdminLoaded,
        pushAllToSupabase,
        resetToDefaultData,
        exportDatabaseJSON,
        importDatabaseJSON
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
