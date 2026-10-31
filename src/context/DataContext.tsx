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
  EmergencyRequestStatus
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
  INITIAL_BLOOD_DONORS,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_BLOOD_SETTINGS,
  DEFAULT_DONOR_CATEGORIES
} from '../data/initialData';
import { cleanBloodDonor, cleanEmergencyRequest } from '../data/bloodDonationData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFreshImageUrl } from '../lib/cloudinary';
import { detectAndNormalizeMedia, DEFAULT_VIDEO_THUMBNAIL, isBlacklistedMedia } from '../lib/utils/mediaHelper';
import { STORAGE_PREFIX, DATA_VERSION_KEY, CURRENT_DATA_VERSION, getStoredOrDefault, saveToStorage } from './dataStorage';
import { safeDbUpsert, safeDbDelete, createAuditLog, REMOTE_CMS_MUTATIONS_LOCKED } from './dbAdapter';
import { useBloodDonationSlice } from './slices/useBloodDonationSlice';
import { useMediaSlice } from './slices/useMediaSlice';
import { useGovernanceSlice } from './slices/useGovernanceSlice';
import { useHumanitarianSlice } from './slices/useHumanitarianSlice';
import { useSettingsSlice } from './slices/useSettingsSlice';

export interface DataContextType {
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // System states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const isSyncInProgressRef = useRef<boolean>(false);
  const [isAdminLoaded, setIsAdminLoaded] = useState<boolean>(false);

  // Global audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    getStoredOrDefault('auditLogs', [])
  );

  const logAudit = useCallback((action: string, entity: string, entityId: string, details: string) => {
    const newLog = createAuditLog(action, entity, entityId, details);
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}auditLogs`, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Instantiate Domain Slices
  const blood = useBloodDonationSlice(logAudit);
  const media = useMediaSlice(logAudit);
  const gov = useGovernanceSlice(logAudit);
  const hum = useHumanitarianSlice(logAudit, media.mediaLibrary);
  const setSlice = useSettingsSlice(logAudit);

  // Multi-tab cross-storage auto synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue || !e.key.startsWith(STORAGE_PREFIX)) return;
      try {
        const entityKey = e.key.replace(STORAGE_PREFIX, '');
        const parsed = JSON.parse(e.newValue);
        if (entityKey === 'videos' && Array.isArray(parsed)) {
          media.setVideos(parsed.filter(v => !isBlacklistedMedia(v.id, v.videoUrl)));
        } else if (entityKey === 'bloodDonors' && Array.isArray(parsed)) {
          blood.setBloodDonors(parsed);
        } else if (entityKey === 'emergencyRequests' && Array.isArray(parsed)) {
          blood.setEmergencyBloodRequests(parsed);
        } else if (entityKey === 'bloodDonationSettings' && parsed && typeof parsed === 'object') {
          blood.setBloodDonationSettings(parsed);
        } else if (entityKey === 'donorCategories' && Array.isArray(parsed)) {
          blood.setDonorCategories(parsed);
        } else if (entityKey === 'campaigns' && Array.isArray(parsed)) {
          hum.setCampaigns(parsed);
        } else if (entityKey === 'programs' && Array.isArray(parsed)) {
          hum.setPrograms(parsed);
        } else if (entityKey === 'programEvents' && Array.isArray(parsed)) {
          hum.setProgramEvents(parsed);
        } else if (entityKey === 'eventMediaList' && Array.isArray(parsed)) {
          hum.setEventMediaList(parsed);
        } else if (entityKey === 'mediaLibrary' && Array.isArray(parsed)) {
          media.setMediaLibrary(parsed.filter(m => !isBlacklistedMedia(m.id, m.url)));
        } else if (entityKey === 'gallery' && Array.isArray(parsed)) {
          media.setGallery(parsed);
        } else if (entityKey === 'persons' && Array.isArray(parsed)) {
          gov.setPersons(parsed);
        } else if (entityKey === 'committees' && Array.isArray(parsed)) {
          gov.setCommittees(parsed);
        } else if (entityKey === 'positions' && Array.isArray(parsed)) {
          gov.setPositions(parsed);
        } else if (entityKey === 'committeeMembers' && Array.isArray(parsed)) {
          gov.setCommitteeMembers(parsed);
        } else if (entityKey === 'news' && Array.isArray(parsed)) {
          hum.setNews(parsed);
        } else if (entityKey === 'events' && Array.isArray(parsed)) {
          hum.setEvents(parsed);
        } else if (entityKey === 'journeyVideos' && Array.isArray(parsed)) {
          media.setJourneyVideos(parsed);
        } else if (entityKey === 'homepageConfig' && parsed && typeof parsed === 'object') {
          setSlice.setHomepageConfig(parsed);
        } else if (entityKey === 'aboutSettings' && parsed && typeof parsed === 'object') {
          setSlice.setAboutSettings(parsed);
        } else if (entityKey === 'headerSettings' && parsed && typeof parsed === 'object') {
          setSlice.setHeaderSettings(parsed);
        } else if (entityKey === 'footerSettings' && parsed && typeof parsed === 'object') {
          setSlice.setFooterSettings(parsed);
        } else if (entityKey === 'settings' && parsed && typeof parsed === 'object') {
          setSlice.setSettings(parsed);
        }
      } catch (err) {
        console.warn('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [blood, media, gov, hum, setSlice]);

  // Load Admin Data
  const loadAdminData = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      const { data: volData } = await supabase.from('volunteer_applications').select('*').order('submitted_at', { ascending: false });
      if (volData && Array.isArray(volData)) {
        hum.setVolunteers(volData.map(v => ({
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

      const { data: donData } = await supabase.from('donation_records').select('*').order('donated_at', { ascending: false });
      if (donData && Array.isArray(donData)) {
        hum.setDonations(donData.map(d => ({
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

      const { data: msgData } = await supabase.from('contact_messages').select('*').order('submitted_at', { ascending: false });
      if (msgData && Array.isArray(msgData)) {
        setSlice.setMessages(msgData.map(m => ({
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

      const { data: admData } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
      if (admData && Array.isArray(admData)) {
        gov.setAdminProfiles(admData.map(a => ({
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

      const { data: medData } = await supabase.from('media_library').select('*').order('uploaded_at', { ascending: false });
      if (medData && Array.isArray(medData)) {
        media.setMediaLibrary(medData
          .filter(m => !isBlacklistedMedia(m.id, m.url))
          .map(m => ({
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
          }))
        );
      }

      setIsAdminLoaded(true);
    } catch (err) {
      console.warn('Admin dataset sync notice:', err);
    }
  }, [hum, setSlice, gov, media]);

  // Supabase Fetch & Sync implementation
  const syncWithSupabase = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      setIsSyncing(true);

      // 1. Site Settings
      const { data: siteData } = await supabase.from('site_settings').select('*').single();
      if (siteData) {
        setSlice.setSettings(prev => ({
          ...prev,
          organizationName: prev.organizationName || siteData.organization_name,
          teamIdentity: prev.teamIdentity || siteData.team_identity,
          tagline: prev.tagline || siteData.tagline,
          officialAddress: siteData.official_address || prev.officialAddress,
          officialPhone: siteData.official_phone || prev.officialPhone,
          officialEmail: (siteData.official_email && !siteData.official_email.includes('infinitybangladesh.org'))
            ? siteData.official_email
            : (prev.officialEmail && !prev.officialEmail.includes('infinitybangladesh.org') ? prev.officialEmail : 'smsakib6452@gmail.com'),
          establishedYear: siteData.established_year || prev.establishedYear,
          logoUrl: getFreshImageUrl(prev.logoUrl || siteData.logo_url),
          faviconUrl: getFreshImageUrl(prev.faviconUrl || siteData.favicon_url),
          country: prev.country || siteData.country
        }));
      }

      // 2. Homepage Config
      const { data: homeData } = await supabase.from('homepage_config').select('*').single();
      if (homeData) {
        setSlice.setHomepageConfig(prev => {
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
        setSlice.setAboutSettings(prev => ({
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
        setSlice.setHeaderSettings(prev => ({
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
        setSlice.setFooterSettings(prev => ({
          ...prev,
          footerLogoUrl: getFreshImageUrl(prev.footerLogoUrl || footerData.footer_logo_url),
          description: prev.description?.bn ? prev.description : (footerData.description || prev.description),
          address: footerData.address || prev.address || '',
          phone: footerData.phone || prev.phone || '',
          email: (footerData.email && !footerData.email.includes('infinitybangladesh.org'))
            ? footerData.email
            : (prev.email && !prev.email.includes('infinitybangladesh.org') ? prev.email : 'smsakib6452@gmail.com'),
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
        hum.setPrograms(prevLocal => {
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
        hum.setCampaigns(prevLocal => {
          const remoteIds = new Set(remoteCampaigns.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteCampaigns] : remoteCampaigns;
        });
      }

      // 8. Impact Metrics
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
        hum.setMetrics(prevLocal => {
          const remoteIds = new Set(remoteMetrics.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteMetrics] : remoteMetrics;
        });
      }

      // 9. Stories
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
        hum.setStories(prevLocal => {
          const remoteIds = new Set(remoteStories.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteStories] : remoteStories;
        });
      }

      // 10. Persons & Leadership
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
        gov.setPersons(prevLocal => {
          const remoteIds = new Set(remotePersons.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePersons] : remotePersons;
        });
      }

      // 11. Positions
      const { data: posData } = await supabase.from('positions').select('*').order('sort_order', { ascending: true });
      if (posData && posData.length > 0) {
        const remotePositions: Position[] = posData.map(p => ({
          id: p.id,
          name: p.name,
          level: Number(p.level) || 5,
          sortOrder: Number(p.sort_order) || 10,
          description: p.description
        }));
        gov.setPositions(prevLocal => {
          const remoteIds = new Set(remotePositions.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePositions] : remotePositions;
        });
      }

      // 12. Committees
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
        gov.setCommittees(prevLocal => {
          const remoteIds = new Set(remoteCommittees.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteCommittees] : remoteCommittees;
        });
      }

      // 13. Committee Members mapping
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
        gov.setCommitteeMembers(prevLocal => {
          const remoteIds = new Set(remoteMembers.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteMembers] : remoteMembers;
        });
      }

      // 14. Media Library
      const { data: mediaData } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
      if (mediaData && Array.isArray(mediaData)) {
        const remoteMedia: MediaItem[] = mediaData
          .filter(m => !isBlacklistedMedia(m.id, m.url))
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

        media.setMediaLibrary(prevLocal => {
          const remoteIds = new Set(remoteMedia.map(r => r.id));
          const localOnly = prevLocal.filter(l => !isBlacklistedMedia(l.id, l.url) && !remoteIds.has(l.id));
          const merged = localOnly.length > 0 ? [...localOnly, ...remoteMedia] : remoteMedia;
          const cleanMerged = merged.filter(m => !isBlacklistedMedia(m.id, m.url));
          try {
            localStorage.setItem(`${STORAGE_PREFIX}mediaLibrary`, JSON.stringify(cleanMerged));
          } catch {}
          return cleanMerged;
        });
      }

      // 15. Gallery Photos
      const { data: galData } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
      if (galData && Array.isArray(galData)) {
        const remoteGallery = galData.map(g => ({
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

        media.setGallery(prevLocal => {
          const remoteIds = new Set(remoteGallery.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          const merged = localOnly.length > 0 ? [...localOnly, ...remoteGallery] : remoteGallery;
          try {
            localStorage.setItem(`${STORAGE_PREFIX}gallery`, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // 16. Partners
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
        hum.setPartners(prevLocal => {
          const remoteIds = new Set(remotePartners.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remotePartners] : remotePartners;
        });
      }

      // 17. News & Articles
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
        hum.setNews(prevLocal => {
          const remoteIds = new Set(remoteNews.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteNews] : remoteNews;
        });
      }

      // 18. Events
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
        hum.setEvents(prevLocal => {
          const remoteIds = new Set(remoteEvents.map(r => r.id));
          const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
          return localOnly.length > 0 ? [...localOnly, ...remoteEvents] : remoteEvents;
        });
      }

      // 19. Video Documentation & Footage
      const { data: vidData } = await supabase.from('video_items').select('*').order('created_at', { ascending: false });
      if (vidData && Array.isArray(vidData)) {
        const remoteVideos: VideoItem[] = vidData
          .filter(v => !isBlacklistedMedia(v.id, v.video_url) && !(v.video_url && v.video_url.includes('dQw4w9WgXcQ')))
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

        media.setVideos(prevLocal => {
          const remoteIds = new Set(remoteVideos.map(r => r.id));
          const localOnly = prevLocal.filter(l =>
            !isBlacklistedMedia(l.id, l.videoUrl) &&
            !remoteIds.has(l.id) &&
            !(l.videoUrl && l.videoUrl.includes('dQw4w9WgXcQ'))
          );
          const cleanMerged = [...localOnly, ...remoteVideos].filter(v => !isBlacklistedMedia(v.id, v.videoUrl));
          cleanMerged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          try {
            localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(cleanMerged));
          } catch {}
          return cleanMerged;
        });
      }

      // 20. Blood Donors
      try {
        // In Phase 1.1: Public blood reads must strictly query public_blood_donors view only.
        const query = supabase.from('public_blood_donors').select('*');

        const { data: bData, error: bError } = await query;
        if (bError) {
          if (import.meta.env.DEV) console.warn('Public blood donors view read notice (fail closed):', bError.message);
        } else if (bData && Array.isArray(bData)) {
          const legacyMockIds = new Set(['donor-1', 'donor-2', 'donor-3', 'donor-4', 'donor-5', 'donor-6', 'donor-7', 'donor-8', 'donor-9', 'donor-10']);
          const remoteDonors: BloodDonor[] = bData
            .filter(d => !legacyMockIds.has(d.id))
            .map(d => ({
              id: d.id,
              fullName: d.full_name,
              bloodGroup: d.blood_group,
              gender: d.gender || 'Male',
              dateOfBirth: d.date_of_birth || d.dob,
              dob: d.date_of_birth || d.dob,
              phone: d.phone || '',
              email: d.email || undefined,
              photoUrl: getFreshImageUrl(d.photo_url),
              district: d.district,
              upazila: d.upazila,
              area: d.area,
              orgCategory: (d.org_category === 'Executive Committee' || d.org_category === 'Standing Committee' || d.org_category === 'Infinity Bangladesh Volunteer')
                ? 'Infinity Bangladesh Member'
                : (d.org_category || 'Open Voluntary Blood Donor'),
              committeePosition: d.committee_position || ((d.org_category === 'Executive Committee' || d.org_category === 'Standing Committee') ? d.org_category : undefined),
              availabilityStatus: d.availability_status || 'AVAILABLE_EMERGENCY',
              lastDonationDate: d.last_donation_date || undefined,
              totalDonations: Number(d.total_donations) || 0,
              experienceNotes: d.experience_notes,
              privacyConsent: d.privacy_consent ?? true,
              showPhonePublicly: Boolean(d.show_phone_publicly ?? (d.phone && !d.phone.includes('*'))),
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
            }));

          blood.setBloodDonors(prevLocal => {
            const remoteIds = new Set(remoteDonors.map(r => r.id));
            const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
            const merged = [...remoteDonors, ...localOnly];
            saveToStorage('bloodDonors', merged);
            return merged;
          });
        }
      } catch (err: any) {
        if (import.meta.env.DEV) console.warn('Supabase blood_donors sync notice:', err.message);
      }

      // 21. Emergency Blood Requests
      try {
        // In Phase 1.1: Public emergency reads must strictly query public_emergency_requests view only.
        const query = supabase.from('public_emergency_requests').select('*');

        const { data: emgData, error: emgError } = await query;
        if (emgError) {
          if (import.meta.env.DEV) console.warn('Public emergency requests view read notice (fail closed):', emgError.message);
        } else if (emgData && Array.isArray(emgData)) {
          const remoteRequests: EmergencyBloodRequest[] = emgData.map(r => cleanEmergencyRequest({
            id: r.id,
            requesterName: r.requester_name || 'Coordinator Desk',
            contactNumber: r.coordinator_contact || r.contact_number || '',
            patientName: r.patient_label || r.patient_name || 'Emergency Patient',
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

          blood.setEmergencyBloodRequests(prevLocal => {
            const remoteIds = new Set(remoteRequests.map(r => r.id));
            const localOnly = prevLocal.filter(l => !remoteIds.has(l.id));
            const merged = [...remoteRequests, ...localOnly];
            saveToStorage('emergencyRequests', merged);
            return merged;
          });
        }
      } catch (err: any) {
        if (import.meta.env.DEV) console.warn('Supabase emergency requests sync notice:', err.message);
      }

      // 22. Blood Donation Settings
      const { data: bSettingsData } = await supabase.from('blood_donation_settings').select('*').single();
      if (bSettingsData) {
        blood.setBloodDonationSettings(prevLocal => {
          const localHasCustomLogo = prevLocal.wingLogoUrl && prevLocal.wingLogoUrl !== INITIAL_BLOOD_SETTINGS.wingLogoUrl;
          const remoteLogo = bSettingsData.wing_logo_url;
          const resolvedLogo = localHasCustomLogo
            ? prevLocal.wingLogoUrl
            : (remoteLogo || prevLocal.wingLogoUrl || INITIAL_BLOOD_SETTINGS.wingLogoUrl);

          const isOldImpactLabel = !bSettingsData.stat_impact_label ||
            bSettingsData.stat_impact_label.en === 'Lives Impacted' ||
            bSettingsData.stat_impact_label === 'Lives Impacted';
          const resolvedImpactLabel = isOldImpactLabel ? INITIAL_BLOOD_SETTINGS.statImpactLabel : (bSettingsData.stat_impact_label || INITIAL_BLOOD_SETTINGS.statImpactLabel);

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
            statTotalDonorsLabel: prevLocal.statTotalDonorsLabel?.bn ? prevLocal.statTotalDonorsLabel : (bSettingsData.stat_total_donors_label || prevLocal.statTotalDonorsLabel),
            statActiveDonorsLabel: prevLocal.statActiveDonorsLabel?.bn ? prevLocal.statActiveDonorsLabel : (bSettingsData.stat_active_donors_label || prevLocal.statActiveDonorsLabel),
            statGroupsLabel: prevLocal.statGroupsLabel?.bn ? prevLocal.statGroupsLabel : (bSettingsData.stat_groups_label || prevLocal.statGroupsLabel),
            statImpactLabel: resolvedImpactLabel,
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

      setLastSyncedAt(new Date());

      const isAdminContext = typeof window !== 'undefined' && (
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
  }, [blood, media, gov, hum, setSlice, loadAdminData]);

  // Initial mount & visibility revalidation
  const lastRevalidateRef = useRef<number>(Date.now());
  useEffect(() => {
    if (isSupabaseConfigured) {
      syncWithSupabase();
    }

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

  // Push ALL local state to Supabase
  const pushAllToSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (REMOTE_CMS_MUTATIONS_LOCKED) {
      if (import.meta.env?.DEV) {
        console.warn('[SECURITY] Remote synchronization is locked during Phase 1.1 security baseline.');
      }
      return {
        success: false,
        message: 'Remote database synchronization is locked during Phase 1.1 security baseline. All modifications are safely preserved in local demonstration state only.'
      };
    }

    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase credentials are not configured in .env' };
    }

    if (isSyncInProgressRef.current) {
      return { success: false, message: 'A synchronization operation is already in progress.' };
    }

    isSyncInProgressRef.current = true;
    try {
      setIsSyncing(true);

      // Site settings
      try {
        const { error } = await supabase.from('site_settings').upsert({
          id: 'default',
          organization_name: setSlice.settings.organizationName,
          team_identity: setSlice.settings.teamIdentity,
          tagline: setSlice.settings.tagline,
          country: setSlice.settings.country,
          official_address: setSlice.settings.officialAddress,
          official_phone: setSlice.settings.officialPhone,
          official_email: setSlice.settings.officialEmail,
          established_year: setSlice.settings.establishedYear || '2015',
          logo_url: setSlice.settings.logoUrl || '',
          favicon_url: setSlice.settings.faviconUrl || '',
          updated_at: new Date().toISOString()
        });
        if (error) console.warn('site_settings push notice:', error.message);
      } catch (e: any) {
        console.warn('site_settings push exception:', e.message);
      }

      // Homepage config
      try {
        const safeVolBannerForPush = {
          ...(setSlice.homepageConfig.volunteerBanner || {}),
          section_headers: {
            impact: setSlice.homepageConfig.impactSection,
            programs: setSlice.homepageConfig.programsSection,
            campaigns: setSlice.homepageConfig.campaignsSection,
            stories: setSlice.homepageConfig.storiesSection,
            lifeline: setSlice.homepageConfig.lifelineSection,
            gallery: setSlice.homepageConfig.gallerySection,
            press: setSlice.homepageConfig.pressSection,
            transparency: setSlice.homepageConfig.transparencySection
          }
        };

        const { error } = await supabase.from('homepage_config').upsert({
          id: 'default',
          hero: setSlice.homepageConfig.hero,
          about_preview: setSlice.homepageConfig.aboutPreview,
          volunteer_banner: safeVolBannerForPush,
          support_banner: setSlice.homepageConfig.supportBanner,
          section_order: setSlice.homepageConfig.sectionOrder,
          section_visibility: setSlice.homepageConfig.sectionVisibility,
          updated_at: new Date().toISOString()
        });
        if (error) console.warn('homepage_config push notice:', error.message);
      } catch (e: any) {
        console.warn('homepage_config push exception:', e.message);
      }

      // Programs
      for (const p of hum.programs) {
        try {
          const { error } = await supabase.from('programs').upsert({
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
          if (error) console.warn('programs push notice:', error.message);
        } catch (e: any) {
          console.warn('programs push exception:', e.message);
        }
      }

      // Campaigns
      for (const c of hum.campaigns) {
        try {
          const { error } = await supabase.from('campaigns').upsert({
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
          if (error) console.warn('campaigns push notice:', error.message);
        } catch (e: any) {
          console.warn('campaigns push exception:', e.message);
        }
      }

      // Blood Donors
      for (const d of blood.bloodDonors) {
        try {
          const { error } = await supabase.from('blood_donors').upsert({
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
          if (error) console.warn('blood_donors push notice:', error.message);
        } catch (e: any) {
          console.warn('blood_donors push exception:', e.message);
        }
      }

      setLastSyncedAt(new Date());
      logAudit('SYNC', 'Database', 'full_push', 'Pushed all local CMS entities to Supabase Cloud Database');
      return { success: true, message: 'Successfully synchronized all CMS data and cloud image URLs to Supabase!' };
    } catch (err: any) {
      console.error('Push to Supabase failed:', err);
      return { success: false, message: err.message || 'Failed to push data to Supabase.' };
    } finally {
      isSyncInProgressRef.current = false;
      setIsSyncing(false);
    }
  }, [setSlice, hum, blood, logAudit]);

  // Backup, Export & Import
  const exportDatabaseJSON = useCallback(() => {
    const data = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      organization: 'Infinity Bangladesh',
      slogan: 'United for Humanity',
      settings: setSlice.settings,
      homepageConfig: setSlice.homepageConfig,
      aboutSettings: setSlice.aboutSettings,
      headerSettings: setSlice.headerSettings,
      footerSettings: setSlice.footerSettings,
      socialLinks: setSlice.socialLinks,
      volunteerSettings: setSlice.volunteerSettings,
      supportSettings: setSlice.supportSettings,
      contactSettings: setSlice.contactSettings,
      seoSettings: setSlice.seoSettings,
      navigationItems: setSlice.navigationItems,
      banners: media.banners,
      mediaLibrary: media.mediaLibrary,
      galleryAlbums: media.galleryAlbums,
      pressCoverages: media.pressCoverages,
      adminProfiles: gov.adminProfiles,
      campaigns: hum.campaigns,
      programs: hum.programs,
      programEvents: hum.programEvents,
      eventMediaList: hum.eventMediaList,
      metrics: hum.metrics,
      stories: hum.stories,
      news: hum.news,
      events: hum.events,
      gallery: media.gallery,
      videos: media.videos,
      journeyVideos: media.journeyVideos,
      bloodDonors: blood.bloodDonors,
      emergencyBloodRequests: blood.emergencyBloodRequests,
      bloodDonationSettings: blood.bloodDonationSettings,
      donorCategories: blood.donorCategories,
      reports: hum.reports,
      partners: hum.partners,
      volunteers: hum.volunteers,
      donations: hum.donations,
      messages: setSlice.messages,
      committees: gov.committees,
      persons: gov.persons,
      positions: gov.positions,
      committeeMembers: gov.committeeMembers,
      auditLogs
    };
    return JSON.stringify(data, null, 2);
  }, [setSlice, media, gov, hum, blood, auditLogs]);

  const importDatabaseJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setSlice.setSettings(parsed.settings);
      if (parsed.homepageConfig) setSlice.setHomepageConfig(parsed.homepageConfig);
      if (parsed.aboutSettings) setSlice.setAboutSettings(parsed.aboutSettings);
      if (parsed.headerSettings) setSlice.setHeaderSettings(parsed.headerSettings);
      if (parsed.footerSettings) setSlice.setFooterSettings(parsed.footerSettings);
      if (parsed.socialLinks) setSlice.setSocialLinks(parsed.socialLinks);
      if (parsed.volunteerSettings) setSlice.setVolunteerSettings(parsed.volunteerSettings);
      if (parsed.supportSettings) setSlice.setSupportSettings(parsed.supportSettings);
      if (parsed.contactSettings) setSlice.setContactSettings(parsed.contactSettings);
      if (parsed.seoSettings) setSlice.setSeoSettings(parsed.seoSettings);
      if (parsed.navigationItems) setSlice.setNavigationItems(parsed.navigationItems);
      if (parsed.banners) media.setBanners(parsed.banners);
      if (parsed.mediaLibrary) media.setMediaLibrary(parsed.mediaLibrary);
      if (parsed.galleryAlbums) media.setGalleryAlbums(parsed.galleryAlbums);
      if (parsed.pressCoverages) media.setPressCoverages(parsed.pressCoverages);
      if (parsed.adminProfiles) gov.setAdminProfiles(parsed.adminProfiles);
      if (parsed.campaigns) hum.setCampaigns(parsed.campaigns);
      if (parsed.programs) hum.setPrograms(parsed.programs);
      if (parsed.programEvents) hum.setProgramEvents(parsed.programEvents);
      if (parsed.eventMediaList) hum.setEventMediaList(parsed.eventMediaList);
      if (parsed.metrics) hum.setMetrics(parsed.metrics);
      if (parsed.stories) hum.setStories(parsed.stories);
      if (parsed.news) hum.setNews(parsed.news);
      if (parsed.events) hum.setEvents(parsed.events);
      if (parsed.gallery) media.setGallery(parsed.gallery);
      if (parsed.videos) media.setVideos(parsed.videos);
      if (parsed.journeyVideos) media.setJourneyVideos(parsed.journeyVideos);
      if (parsed.bloodDonors) blood.setBloodDonors(parsed.bloodDonors);
      if (parsed.emergencyBloodRequests) blood.setEmergencyBloodRequests(parsed.emergencyBloodRequests);
      if (parsed.bloodDonationSettings) blood.setBloodDonationSettings(parsed.bloodDonationSettings);
      if (parsed.donorCategories) blood.setDonorCategories(parsed.donorCategories);
      if (parsed.reports) hum.setReports(parsed.reports);
      if (parsed.partners) hum.setPartners(parsed.partners);
      if (parsed.volunteers) hum.setVolunteers(parsed.volunteers);
      if (parsed.donations) hum.setDonations(parsed.donations);
      if (parsed.messages) setSlice.setMessages(parsed.messages);
      if (parsed.committees) gov.setCommittees(parsed.committees);
      if (parsed.persons) gov.setPersons(parsed.persons);
      if (parsed.positions) gov.setPositions(parsed.positions);
      if (parsed.committeeMembers) gov.setCommitteeMembers(parsed.committeeMembers);

      logAudit('IMPORT', 'Database', 'full_restore', 'Restored complete database snapshot from JSON backup');
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }, [setSlice, media, gov, hum, blood, logAudit]);

  const resetToDefaultData = useCallback(() => {
    setSlice.setSettings(INITIAL_SITE_SETTINGS);
    setSlice.setHomepageConfig(INITIAL_HOMEPAGE_CONFIG);
    setSlice.setAboutSettings(INITIAL_ABOUT_SETTINGS);
    setSlice.setHeaderSettings(INITIAL_HEADER_SETTINGS);
    setSlice.setFooterSettings(INITIAL_FOOTER_SETTINGS);
    setSlice.setSocialLinks(INITIAL_SOCIAL_LINKS);
    setSlice.setVolunteerSettings(INITIAL_VOLUNTEER_SETTINGS);
    setSlice.setSupportSettings(INITIAL_SUPPORT_SETTINGS);
    setSlice.setContactSettings(INITIAL_CONTACT_SETTINGS);
    setSlice.setSeoSettings(INITIAL_SEO_SETTINGS);
    setSlice.setNavigationItems(INITIAL_NAVIGATION_ITEMS);
    setSlice.setFaqs(INITIAL_FAQS);
    setSlice.setMessages([]);
    media.setBanners(INITIAL_BANNERS);
    media.setMediaLibrary(INITIAL_MEDIA_LIBRARY);
    media.setGalleryAlbums(INITIAL_GALLERY_ALBUMS);
    media.setPressCoverages(INITIAL_PRESS_COVERAGE);
    gov.setAdminProfiles(INITIAL_ADMIN_PROFILES);
    hum.setCampaigns(INITIAL_CAMPAIGNS);
    hum.setPrograms(INITIAL_PROGRAMS);
    hum.setProgramEvents(INITIAL_PROGRAM_EVENTS);
    hum.setEventMediaList(INITIAL_EVENT_MEDIA);
    hum.setMetrics(INITIAL_IMPACT_METRICS);
    hum.setStories(INITIAL_IMPACT_STORIES);
    hum.setNews(INITIAL_NEWS);
    hum.setEvents(INITIAL_EVENTS);
    media.setGallery(INITIAL_GALLERY);
    media.setVideos(INITIAL_VIDEOS);
    media.setJourneyVideos(INITIAL_JOURNEY_VIDEOS);
    blood.setBloodDonors(INITIAL_BLOOD_DONORS);
    blood.setEmergencyBloodRequests(INITIAL_EMERGENCY_REQUESTS);
    blood.setBloodDonationSettings(INITIAL_BLOOD_SETTINGS);
    blood.setDonorCategories(DEFAULT_DONOR_CATEGORIES);
    hum.setReports(INITIAL_REPORTS);
    hum.setPartners(INITIAL_PARTNERS);
    hum.setVolunteers(INITIAL_VOLUNTEER_APPLICATIONS);
    hum.setDonations(INITIAL_DONATIONS);
    gov.setCommittees(INITIAL_COMMITTEES);
    gov.setPersons(INITIAL_PERSONS);
    gov.setPositions(INITIAL_POSITIONS);
    gov.setCommitteeMembers(INITIAL_COMMITTEE_MEMBERS);
    setAuditLogs([]);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith('infinity_bd_')) {
        localStorage.removeItem(key);
      }
    });

    logAudit('RESET', 'Database', 'factory_reset', 'Reset all CMS entities to verified official defaults');
  }, [setSlice, media, gov, hum, blood, logAudit]);

  const value: DataContextType = {
    // Entities from Slices
    campaigns: hum.campaigns,
    programs: hum.programs,
    programEvents: hum.programEvents,
    eventMediaList: hum.eventMediaList,
    metrics: hum.metrics,
    stories: hum.stories,
    news: hum.news,
    events: hum.events,
    gallery: media.gallery,
    videos: media.videos,
    journeyVideos: media.journeyVideos,
    reports: hum.reports,
    partners: hum.partners,
    volunteers: hum.volunteers,
    donations: hum.donations,
    messages: setSlice.messages,
    faqs: setSlice.faqs,
    settings: setSlice.settings,
    homepageConfig: setSlice.homepageConfig,
    aboutSettings: setSlice.aboutSettings,
    headerSettings: setSlice.headerSettings,
    footerSettings: setSlice.footerSettings,
    socialLinks: setSlice.socialLinks,
    volunteerSettings: setSlice.volunteerSettings,
    supportSettings: setSlice.supportSettings,
    contactSettings: setSlice.contactSettings,
    seoSettings: setSlice.seoSettings,
    navigationItems: setSlice.navigationItems,
    banners: media.banners,
    mediaLibrary: media.mediaLibrary,
    galleryAlbums: media.galleryAlbums,
    pressCoverages: media.pressCoverages,
    adminProfiles: gov.adminProfiles,
    auditLogs,
    committees: gov.committees,
    persons: gov.persons,
    positions: gov.positions,
    committeeMembers: gov.committeeMembers,

    // Blood Donation Network
    bloodDonors: blood.bloodDonors,
    emergencyBloodRequests: blood.emergencyBloodRequests,
    bloodDonationSettings: blood.bloodDonationSettings,
    donorCategories: blood.donorCategories,

    // System & Connection State
    isLiveSupabase: isSupabaseConfigured,
    isSyncing,
    lastSyncedAt,
    previewMode,
    setPreviewMode,
    syncWithSupabase,
    loadAdminData,
    isAdminLoaded,
    pushAllToSupabase,
    resetToDefaultData,
    exportDatabaseJSON,
    importDatabaseJSON,

    // Settings Mutations
    updateHomepageConfig: setSlice.updateHomepageConfig,
    updateAboutSettings: setSlice.updateAboutSettings,
    updateHeaderSettings: setSlice.updateHeaderSettings,
    updateFooterSettings: setSlice.updateFooterSettings,
    updateVolunteerSettings: setSlice.updateVolunteerSettings,
    updateSupportSettings: setSlice.updateSupportSettings,
    updateContactSettings: setSlice.updateContactSettings,
    updateSEOSettings: setSlice.updateSEOSettings,
    updateSettings: setSlice.updateSettings,
    addFAQ: setSlice.addFAQ,
    updateFAQ: setSlice.updateFAQ,
    deleteFAQ: setSlice.deleteFAQ,
    addContactMessage: setSlice.addContactMessage,
    addSocialLink: setSlice.addSocialLink,
    updateSocialLink: setSlice.updateSocialLink,
    deleteSocialLink: setSlice.deleteSocialLink,
    addNavigationItem: setSlice.addNavigationItem,
    updateNavigationItem: setSlice.updateNavigationItem,
    deleteNavigationItem: setSlice.deleteNavigationItem,
    reorderNavigationItems: setSlice.reorderNavigationItems,

    // Media Mutations
    addBanner: media.addBanner,
    updateBanner: media.updateBanner,
    deleteBanner: media.deleteBanner,
    addMediaItem: media.addMediaItem,
    updateMediaItem: media.updateMediaItem,
    deleteMediaItem: media.deleteMediaItem,
    addGalleryAlbum: media.addGalleryAlbum,
    updateGalleryAlbum: media.updateGalleryAlbum,
    deleteGalleryAlbum: media.deleteGalleryAlbum,
    setAlbumPhotos: media.setAlbumPhotos,
    addPressCoverage: media.addPressCoverage,
    updatePressCoverage: media.updatePressCoverage,
    deletePressCoverage: media.deletePressCoverage,
    addGalleryPhoto: media.addGalleryPhoto,
    updateGalleryPhoto: media.updateGalleryPhoto,
    deleteGalleryPhoto: media.deleteGalleryPhoto,
    addVideo: media.addVideo,
    updateVideo: media.updateVideo,
    deleteVideo: media.deleteVideo,
    reorderVideos: media.reorderVideos,
    addJourneyVideo: media.addJourneyVideo,
    updateJourneyVideo: media.updateJourneyVideo,
    deleteJourneyVideo: media.deleteJourneyVideo,
    reorderJourneyVideos: media.reorderJourneyVideos,
    setFeaturedJourneyVideo: media.setFeaturedJourneyVideo,

    // Humanitarian Mutations
    addCampaign: hum.addCampaign,
    updateCampaign: hum.updateCampaign,
    deleteCampaign: hum.deleteCampaign,
    addProgram: hum.addProgram,
    updateProgram: hum.updateProgram,
    deleteProgram: hum.deleteProgram,
    addProgramEvent: hum.addProgramEvent,
    updateProgramEvent: hum.updateProgramEvent,
    deleteProgramEvent: hum.deleteProgramEvent,
    reorderProgramEvents: hum.reorderProgramEvents,
    addMediaToEvent: hum.addMediaToEvent,
    removeMediaFromEvent: hum.removeMediaFromEvent,
    toggleEventHighlight: hum.toggleEventHighlight,
    reorderEventHighlights: hum.reorderEventHighlights,
    setEventHighlights: hum.setEventHighlights,
    getEventsByProgramId: hum.getEventsByProgramId,
    getProgramEventBySlug: hum.getProgramEventBySlug,
    getEventMedia: hum.getEventMedia,
    getEventHighlights: hum.getEventHighlights,
    addMetric: hum.addMetric,
    updateMetric: hum.updateMetric,
    deleteMetric: hum.deleteMetric,
    addStory: hum.addStory,
    updateStory: hum.updateStory,
    deleteStory: hum.deleteStory,
    addNews: hum.addNews,
    updateNews: hum.updateNews,
    deleteNews: hum.deleteNews,
    addEvent: hum.addEvent,
    updateEvent: hum.updateEvent,
    deleteEvent: hum.deleteEvent,
    addReport: hum.addReport,
    updateReport: hum.updateReport,
    deleteReport: hum.deleteReport,
    addPartner: hum.addPartner,
    updatePartner: hum.updatePartner,
    deletePartner: hum.deletePartner,
    submitVolunteerApplication: hum.submitVolunteerApplication,
    addVolunteerApplication: hum.addVolunteerApplication,
    updateVolunteerStatus: hum.updateVolunteerStatus,
    deleteVolunteerApplication: hum.deleteVolunteerApplication,
    submitDonation: hum.submitDonation,
    addDonationRecord: hum.addDonationRecord,
    updateDonationStatus: hum.updateDonationStatus,
    submitContactMessage: setSlice.submitContactMessage,
    updateMessageStatus: setSlice.updateMessageStatus,
    deleteContactMessage: setSlice.deleteContactMessage,

    // Blood Network Mutations
    addBloodDonor: blood.addBloodDonor,
    updateBloodDonor: blood.updateBloodDonor,
    deleteBloodDonor: blood.deleteBloodDonor,
    approveBloodDonor: blood.approveBloodDonor,
    rejectBloodDonor: blood.rejectBloodDonor,
    verifyBloodDonor: blood.verifyBloodDonor,
    addDonationHistoryEntry: blood.addDonationHistoryEntry,
    deleteDonationHistoryEntry: blood.deleteDonationHistoryEntry,
    addEmergencyBloodRequest: blood.addEmergencyBloodRequest,
    updateEmergencyBloodRequestStatus: blood.updateEmergencyBloodRequestStatus,
    deleteEmergencyBloodRequest: blood.deleteEmergencyBloodRequest,
    updateBloodDonationSettings: blood.updateBloodDonationSettings,
    addDonorCategory: blood.addDonorCategory,
    updateDonorCategory: blood.updateDonorCategory,
    deleteDonorCategory: blood.deleteDonorCategory,

    // Governance Mutations
    addAdminProfile: gov.addAdminProfile,
    updateAdminProfile: gov.updateAdminProfile,
    deleteAdminProfile: gov.deleteAdminProfile,
    addCommittee: gov.addCommittee,
    updateCommittee: gov.updateCommittee,
    deleteCommittee: gov.deleteCommittee,
    archiveCommittee: gov.archiveCommittee,
    setActiveCommittee: gov.setActiveCommittee,
    addPerson: gov.addPerson,
    updatePerson: gov.updatePerson,
    deletePerson: gov.deletePerson,
    addPosition: gov.addPosition,
    updatePosition: gov.updatePosition,
    deletePosition: gov.deletePosition,
    addCommitteeMember: gov.addCommitteeMember,
    updateCommitteeMember: gov.updateCommitteeMember,
    deleteCommitteeMember: gov.deleteCommitteeMember,
    reorderCommitteeMembers: gov.reorderCommitteeMembers,
    getMembersWithDetails: gov.getMembersWithDetails
  };

  return (
    <DataContext.Provider value={value}>
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
export default DataContext;
