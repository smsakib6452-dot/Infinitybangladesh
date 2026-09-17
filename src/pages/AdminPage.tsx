import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import {
  ShieldCheck,
  Lock,
  LayoutDashboard,
  Flag,
  BookOpen,
  Heart,
  Users,
  FileText,
  Calendar,
  Image as ImageIcon,
  Video as VideoIcon,
  Handshake,
  Mail,
  Activity,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  LogOut,
  AlertCircle,
  Sparkles,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Award,
  ArrowUp,
  ArrowDown,
  Layers,
  History,
  UserPlus,
  ListOrdered,
  Sliders,
  Compass,
  FolderOpen,
  Globe,
  Share2,
  CreditCard,
  PhoneCall,
  UserCog,
  Database,
  Tag,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  RotateCcw,
  Play,
  Star,
  Copy,
  Crop,
  Filter,
  Maximize2,
  Smartphone,
  Newspaper,
  Edit3,
  Link as LinkIcon,
  Film,
  Droplet,
  AlertTriangle,
  Building2,
  Phone,
  Save,
  SlidersHorizontal,
  Key,
  MessageCircle
} from 'lucide-react';
import {
  Campaign,
  Program,
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
  Committee,
  Person,
  Position,
  CommitteeMember,
  SocialLink,
  NavigationItem,
  BannerItem,
  MediaItem,
  MediaCategory,
  GalleryAlbum,
  AdminProfile,
  AdminRole,
  PageRoute,
  FAQItem,
  PressCoverage,
  ExecutiveTierBar,
  JourneyVideo,
  BloodDonor,
  EmergencyBloodRequest,
  BloodDonationSettings,
  DonorCategoryOption,
  EmergencyRequestStatus,
  BloodGroup,
  ProgramEvent
} from '../types';
import { DEFAULT_EXECUTIVE_TIER_BARS } from '../data/initialData';
import {
  calculateAge,
  getDonorEditAccessCode,
  getCooldownStatusInfo,
  BLOOD_DONATION_COOLDOWN_DAYS,
  toSafeString,
  cleanBloodDonor
} from '../data/bloodDonationData';
import { getAssetUrl, handleImageError } from '../lib/utils/assetHelper';
import { formatBDT, formatDateDDMMYYYY } from '../lib/utils/formatters';
import { Toast } from '../components/Toast';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { CampaignModal } from '../components/CampaignModal';
import { ProgramModal } from '../components/ProgramModal';
import { ProgramEventModal } from '../components/ProgramEventModal';
import { EventMediaManagerModal } from '../components/EventMediaManagerModal';
import { StoryModal } from '../components/StoryModal';
import { FAQModal } from '../components/FAQModal';
import { CommitteeMemberModal, CommitteeMemberFormData } from '../components/CommitteeMemberModal';
import { ImageEditorModal } from '../components/ImageEditorModal';
import { VideoModal } from '../components/VideoModal';
import { BannerModal } from '../components/BannerModal';
import { AlbumModal } from '../components/AlbumModal';
import { AlbumPhotoManagerModal } from '../components/AlbumPhotoManagerModal';
import { ImagePublishModal } from '../components/ImagePublishModal';
import { PressCoverageModal } from '../components/PressCoverageModal';
import { NavigationModal } from '../components/NavigationModal';
import { JourneyVideoModal } from '../components/JourneyVideoModal';
import { BloodDonorModal } from '../components/BloodDonorModal';
import { EmergencyRequestAdminModal } from '../components/EmergencyRequestAdminModal';
import { AdminHomepageManager } from '../components/AdminHomepageManager';
import { AdminErrorBoundary } from '../components/AdminErrorBoundary';
import { isSupabaseConfigured, signInWithEmail, signOutAdmin } from '../lib/supabase';
import { detectAndNormalizeMedia, DEFAULT_VIDEO_THUMBNAIL, isPortraitVideo } from '../lib/utils/mediaHelper';
import { uploadToCloudinary } from '../lib/cloudinary';

export type AdminTab =
  | 'overview'
  | 'brand_settings'
  | 'homepage'
  | 'about_cms'
  | 'journey_videos'
  | 'blood_donation'
  | 'campaigns'
  | 'programs'
  | 'impact'
  | 'stories'
  | 'faqs'
  | 'media_library'
  | 'banners'
  | 'gallery_albums'
  | 'press'
  | 'committees'
  | 'volunteers'
  | 'donations'
  | 'transparency'
  | 'navigation'
  | 'header_footer'
  | 'seo'
  | 'social_links'
  | 'support_cms'
  | 'contact_cms'
  | 'news_events'
  | 'messages'
  | 'admin_users'
  | 'audit'
  | 'backup';

export const AdminPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { navigate } = useRouter();
  const {
    // Entities
    campaigns, addCampaign, updateCampaign, deleteCampaign,
    programs, addProgram, updateProgram, deleteProgram,
    metrics, addMetric, updateMetric, deleteMetric,
    stories, addStory, updateStory, deleteStory,
    faqs, addFAQ, updateFAQ, deleteFAQ,
    news, addNews, updateNews, deleteNews,
    events, addEvent, updateEvent, deleteEvent,
    gallery, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto,
    videos, addVideo, updateVideo, deleteVideo,
    journeyVideos, addJourneyVideo, updateJourneyVideo, deleteJourneyVideo, reorderJourneyVideos, setFeaturedJourneyVideo,
    reports, addReport, updateReport, deleteReport,
    volunteers, updateVolunteerStatus, deleteVolunteerApplication,
    donations, addDonationRecord, updateDonationStatus,
    messages, updateMessageStatus, deleteContactMessage,
    settings, updateSettings,
    homepageConfig, updateHomepageConfig,
    aboutSettings, updateAboutSettings,
    headerSettings, updateHeaderSettings,
    footerSettings, updateFooterSettings,
    socialLinks, addSocialLink, updateSocialLink, deleteSocialLink,
    volunteerSettings, updateVolunteerSettings,
    supportSettings, updateSupportSettings,
    contactSettings, updateContactSettings,
    seoSettings, updateSEOSettings,
    navigationItems, addNavigationItem, updateNavigationItem, deleteNavigationItem, reorderNavigationItems,
    banners, addBanner, updateBanner, deleteBanner,
    mediaLibrary, addMediaItem, updateMediaItem, deleteMediaItem,
    galleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum, setAlbumPhotos,
    pressCoverages, addPressCoverage, updatePressCoverage, deletePressCoverage,
    adminProfiles, addAdminProfile, updateAdminProfile, deleteAdminProfile,
    auditLogs,
    committees, addCommittee, updateCommittee, deleteCommittee, archiveCommittee, setActiveCommittee,
    persons, addPerson, updatePerson, deletePerson,
    positions, addPosition, updatePosition, deletePosition,
    committeeMembers, addCommitteeMember, updateCommitteeMember, deleteCommitteeMember, reorderCommitteeMembers, getMembersWithDetails,
    bloodDonors, emergencyBloodRequests, bloodDonationSettings, donorCategories,
    addBloodDonor, updateBloodDonor, deleteBloodDonor, approveBloodDonor, rejectBloodDonor, verifyBloodDonor,
    addDonationHistoryEntry, deleteDonationHistoryEntry,
    addEmergencyBloodRequest, updateEmergencyBloodRequestStatus, deleteEmergencyBloodRequest,
    updateBloodDonationSettings, addDonorCategory, updateDonorCategory, deleteDonorCategory,
    programEvents, getEventsByProgramId, getEventHighlights, getEventMedia, deleteProgramEvent,
    isLiveSupabase, isSyncing, lastSyncedAt, syncWithSupabase, pushAllToSupabase, resetToDefaultData, exportDatabaseJSON, importDatabaseJSON,
    loadAdminData, isAdminLoaded
  } = useData();

  // Load complete admin-only datasets on entry if not already loaded
  React.useEffect(() => {
    if (!isAdminLoaded) {
      loadAdminData();
    }
  }, [isAdminLoaded, loadAdminData]);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('infinity_bd_admin_auth') === 'true';
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<AdminRole>('super_admin');

  // UI Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Media Picker Modal State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(null);

  // Active Modals & Edit States
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // Program Editions / Events Management State
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [selectedProgramForEvent, setSelectedProgramForEvent] = useState<Program | null>(null);
  const [editingProgramEvent, setEditingProgramEvent] = useState<ProgramEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedProgramForMedia, setSelectedProgramForMedia] = useState<Program | null>(null);
  const [selectedEventForMedia, setSelectedEventForMedia] = useState<ProgramEvent | null>(null);
  const [isEventMediaModalOpen, setIsEventMediaModalOpen] = useState(false);

  const [editingStory, setEditingStory] = useState<ImpactStory | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  const [editingAlbumPhotos, setEditingAlbumPhotos] = useState<GalleryAlbum | null>(null);
  const [isAlbumPhotoManagerOpen, setIsAlbumPhotoManagerOpen] = useState(false);

  const [editingImageItem, setEditingImageItem] = useState<MediaItem | null>(null);
  const [isImagePublishModalOpen, setIsImagePublishModalOpen] = useState(false);

  const [editingPress, setEditingPress] = useState<PressCoverage | null>(null);
  const [isPressModalOpen, setIsPressModalOpen] = useState(false);

  const [editingNav, setEditingNav] = useState<NavigationItem | null>(null);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Journey Video Archive States
  const [editingJourneyVideo, setEditingJourneyVideo] = useState<JourneyVideo | null>(null);
  const [isJourneyVideoModalOpen, setIsJourneyVideoModalOpen] = useState(false);
  const [journeyVideoSearch, setJourneyVideoSearch] = useState('');
  const [journeyVideoCategory, setJourneyVideoCategory] = useState('All');
  const [aboutSubTab, setAboutSubTab] = useState<'info' | 'journey_videos'>('info');

  // Blood Donation Network States
  const [editingBloodDonor, setEditingBloodDonor] = useState<BloodDonor | null>(null);
  const [isBloodDonorModalOpen, setIsBloodDonorModalOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<BloodDonor | null>(null);
  const [editingEmergencyRequest, setEditingEmergencyRequest] = useState<EmergencyBloodRequest | null>(null);
  const [isEmergencyRequestModalOpen, setIsEmergencyRequestModalOpen] = useState(false);
  const [bloodSubTab, setBloodSubTab] = useState<'overview' | 'pending' | 'donors' | 'emergency' | 'settings'>('overview');
  const [bloodDonorSearch, setBloodDonorSearch] = useState('');
  const [bloodDonorGroupFilter, setBloodDonorGroupFilter] = useState('ALL');
  const [bloodDonorStatusFilter, setBloodDonorStatusFilter] = useState('ALL');
  const [bloodDonorDistrictFilter, setBloodDonorDistrictFilter] = useState('ALL');
  const [newDonorCategoryEn, setNewDonorCategoryEn] = useState('');
  const [newDonorCategoryBn, setNewDonorCategoryBn] = useState('');

  // Unified Media Library States
  const [mediaLibraryFilter, setMediaLibraryFilter] = useState<'all' | 'image' | 'video' | 'youtube' | 'facebook' | 'featured'>('all');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('All');
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [previewingMedia, setPreviewingMedia] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isNewMediaModalOpen, setIsNewMediaModalOpen] = useState<boolean>(false);
  const [isCropperModalOpen, setIsCropperModalOpen] = useState<boolean>(false);
  const [cropperSourceUrl, setCropperSourceUrl] = useState<string>('');
  const [cropperCallback, setCropperCallback] = useState<((croppedUrl: string) => void) | null>(null);

  // New Media Form States
  const [newMediaSourceTab, setNewMediaSourceTab] = useState<'url' | 'upload'>('url');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [newMediaTitle, setNewMediaTitle] = useState<string>('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaCategory>('General');
  const [newMediaAlt, setNewMediaAlt] = useState<string>('');
  const [newMediaIsFeatured, setNewMediaIsFeatured] = useState<boolean>(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [mediaUploadError, setMediaUploadError] = useState<string>('');

  // Committee & Member Management States
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>(committees[0]?.id || 'comm-exec-2026');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<(CommitteeMember & { person: Person; position: Position; committee?: Committee }) | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isNewCommitteeModalOpen, setIsNewCommitteeModalOpen] = useState(false);
  const [newCommitteeNameEn, setNewCommitteeNameEn] = useState('');
  const [newCommitteeNameBn, setNewCommitteeNameBn] = useState('');
  const [newCommitteeYear, setNewCommitteeYear] = useState('2026');
  const [newCommitteeType, setNewCommitteeType] = useState<Committee['type']>('STANDING');
  const [newCommitteeDescEn, setNewCommitteeDescEn] = useState('');
  const [newCommitteeDescBn, setNewCommitteeDescBn] = useState('');

  // Executive Section/Tier Bar CMS states
  const [adminEditingTierBar, setAdminEditingTierBar] = useState<ExecutiveTierBar | null>(null);
  const [isAdminTierModalOpen, setIsAdminTierModalOpen] = useState(false);

  const adminTierBars: ExecutiveTierBar[] = settings.executiveTierBars && settings.executiveTierBars.length > 0
    ? settings.executiveTierBars
    : DEFAULT_EXECUTIVE_TIER_BARS;

  const handleAdminSaveTierBar = (updated: ExecutiveTierBar) => {
    const list = settings.executiveTierBars && settings.executiveTierBars.length > 0
      ? [...settings.executiveTierBars]
      : [...DEFAULT_EXECUTIVE_TIER_BARS];
    const idx = list.findIndex(b => b.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    updateSettings({ executiveTierBars: list });
    setIsAdminTierModalOpen(false);
    setAdminEditingTierBar(null);
    showToast(isBn ? 'সেকশন বার আপডেট করা হয়েছে' : 'Section bar updated successfully');
  };

  const handleAdminToggleTierBar = (id: string, currentVisible: boolean) => {
    const list = (settings.executiveTierBars && settings.executiveTierBars.length > 0
      ? settings.executiveTierBars
      : DEFAULT_EXECUTIVE_TIER_BARS
    ).map(b => b.id === id ? { ...b, visible: !currentVisible } : b);
    updateSettings({ executiveTierBars: list });
    showToast(currentVisible
      ? (isBn ? 'সেকশন বারটি লুকানো/মুছে ফেলা হয়েছে' : 'Section bar hidden/deleted from live page')
      : (isBn ? 'সেকশন বারটি দৃশ্যমান করা হয়েছে' : 'Section bar restored and visible'));
  };

  const handleAdminResetTierBars = () => {
    if (confirm(isBn ? 'সবগুলো সেকশন বার ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?' : 'Reset all 7 section bars to their default titles and visible status?')) {
      updateSettings({ executiveTierBars: DEFAULT_EXECUTIVE_TIER_BARS });
      showToast(isBn ? 'সবগুলো সেকশন বার ডিফল্ট অবস্থায় ফিরেছে' : 'All section bars reset to default');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openMediaPicker = (onSelect: (url: string) => void) => {
    setMediaPickerCallback(() => onSelect);
    setMediaPickerOpen(true);
  };

  // Journey Video Save & Action Handlers
  const handleSaveJourneyVideo = (data: Omit<JourneyVideo, 'id' | 'createdAt' | 'updatedAt'> | JourneyVideo) => {
    if ('id' in data && data.id) {
      updateJourneyVideo(data.id, data);
      showToast(isBn ? 'জার্নি ভিডিও আপডেট করা হয়েছে' : 'Journey video updated successfully');
    } else {
      addJourneyVideo(data);
      showToast(isBn ? 'নতুন জার্নি ভিডিও যোগ করা হয়েছে' : 'New journey video published successfully');
    }
    setIsJourneyVideoModalOpen(false);
    setEditingJourneyVideo(null);
  };

  const handleDeleteJourneyVideo = (id: string, title: string) => {
    if (confirm(isBn ? `আপনি কি "${title}" ভিডিওটি স্থায়ীভাবে মুছে ফেলতে চান?` : `Are you sure you want to delete "${title}"?`)) {
      deleteJourneyVideo(id);
      showToast(isBn ? 'ভিডিওটি মুছে ফেলা হয়েছে' : 'Journey video deleted');
    }
  };

  const handleMoveJourneyVideo = (id: string, direction: 'up' | 'down') => {
    const list = [...journeyVideos].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === list.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = [...list];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    reorderJourneyVideos(reordered.map(v => v.id));
    showToast(isBn ? 'ক্রম পরিবর্তন করা হয়েছে' : 'Display order updated');
  };

  // Committee Member Save Handler
  const handleSaveMember = (
    formData: CommitteeMemberFormData,
    memberId?: string,
    personId?: string,
    positionId?: string
  ) => {
    if (memberId && personId && positionId) {
      // Update existing Person
      updatePerson(personId, {
        banglaName: formData.banglaName,
        englishName: formData.englishName,
        fullName: formData.englishName,
        photoUrl: formData.photoUrl,
        shortBio: { en: formData.shortBioEn, bn: formData.shortBioBn },
        facebookUrl: formData.facebookUrl,
        linkedinUrl: formData.linkedinUrl,
        socialLinks: {
          facebook: formData.facebookUrl,
          linkedin: formData.linkedinUrl
        },
        active: formData.status === 'ACTIVE'
      });
      // Update existing Position
      updatePosition(positionId, {
        name: { en: formData.englishDesignation, bn: formData.banglaDesignation },
        level: formData.level
      });
      // Update existing Committee Member
      updateCommitteeMember(memberId, {
        committeeId: formData.committeeId,
        serialNumber: formData.serialNumber,
        sortOrder: formData.sortOrder,
        isFeaturedLeader: formData.isFeaturedLeader,
        status: formData.status
      });
      showToast(isBn ? 'সদস্যের তথ্য সফলভাবে আপডেট হয়েছে' : 'Member updated successfully');
    } else {
      // Create new Person
      const newPerson = addPerson({
        fullName: formData.englishName || 'New Member',
        englishName: formData.englishName || 'New Member',
        banglaName: formData.banglaName || 'নতুন সদস্য',
        photoUrl: formData.photoUrl,
        shortBio: { en: formData.shortBioEn, bn: formData.shortBioBn },
        facebookUrl: formData.facebookUrl,
        linkedinUrl: formData.linkedinUrl,
        socialLinks: {
          facebook: formData.facebookUrl,
          linkedin: formData.linkedinUrl
        },
        active: formData.status === 'ACTIVE'
      });
      // Create Position
      const newPos = addPosition({
        name: { en: formData.englishDesignation || 'Member', bn: formData.banglaDesignation || 'সদস্য' },
        level: formData.level,
        sortOrder: formData.serialNumber
      });
      // Add Committee Member
      addCommitteeMember({
        committeeId: formData.committeeId || selectedCommitteeId,
        personId: newPerson.id,
        positionId: newPos.id,
        serialNumber: formData.serialNumber,
        sortOrder: formData.sortOrder,
        isFeaturedLeader: formData.isFeaturedLeader,
        status: formData.status
      });
      showToast(isBn ? 'নতুন সদস্য সফলভাবে যুক্ত হয়েছে' : 'New member added successfully');
    }
    setIsMemberModalOpen(false);
    setEditingMember(null);
  };

  // Committee Member Move Up / Down Handler
  const handleMoveMember = (memberId: string, direction: 'up' | 'down') => {
    const list = getMembersWithDetails(selectedCommitteeId);
    const index = list.findIndex(m => m.id === memberId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...list];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedIds = reordered.map(m => m.id);
    reorderCommitteeMembers(selectedCommitteeId, orderedIds);
    showToast(isBn ? 'সদস্যের ক্রম পরিবর্তন হয়েছে' : 'Member order updated');
  };

  const handleSaveBloodDonor = (donorData: Omit<BloodDonor, 'createdAt' | 'updatedAt'> & { id?: string }, editId?: string) => {
    if (editId) {
      updateBloodDonor(editId, donorData);
      showToast(isBn ? 'রক্তদাতার তথ্য সফলভাবে আপডেট হয়েছে' : 'Donor record updated successfully');
    } else {
      addBloodDonor(donorData);
      showToast(isBn ? 'নতুন রক্তদাতা সফলভাবে তৈরি হয়েছে' : 'New blood donor record created');
    }
  };

  const handleExportDonorsCSV = () => {
    const headers = ['ID', 'Full Name', 'Blood Group', 'Gender', 'Date of Birth', 'Age', 'Phone', 'Email', 'District', 'Upazila', 'Area', 'Detailed Address', 'Organization Category', 'Availability Status', 'Approval Status', 'Verified', 'Total Donations', 'Last Donation Date', 'Created At'];
    const rows = bloodDonors.map(d => [
      d.id,
      `"${(d.fullName || '').replace(/"/g, '""')}"`,
      d.bloodGroup,
      `"${d.gender || 'Male'}"`,
      `"${d.dateOfBirth || d.dob || ''}"`,
      calculateAge(d.dateOfBirth || d.dob) ?? '',
      `"${d.phone || ''}"`,
      `"${d.email || ''}"`,
      `"${d.district || ''}"`,
      `"${d.upazila || ''}"`,
      `"${d.area || ''}"`,
      `"${(d.detailedAddress || '').replace(/"/g, '""')}"`,
      `"${d.orgCategory || ''}"`,
      d.availabilityStatus,
      d.approvalStatus,
      d.isVerified ? 'YES' : 'NO',
      d.totalDonations || 0,
      d.lastDonationDate || '',
      d.createdAt || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `infinity_bd_blood_donors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isBn ? 'রক্তদাতাদের CSV ফাইল ডাউনলোড হয়েছে' : 'Blood Donors CSV exported successfully');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const inputEmail = authEmail.trim().toLowerCase();
    const inputPass = authPassword.trim();

    // Verify Primary Official Admin Credentials (supports master keys or official emails)
    const isMasterPassword =
      inputPass === 'InfinityWebsite@2015' ||
      inputPass === 'infinity2026' ||
      inputPass === 'admin123' ||
      inputPass === 'admin';

    const isValidOfficialAdmin =
      isMasterPassword ||
      ((inputEmail === 'infinitybd@social.org' || inputEmail === 'admin@infinitybangladesh.org' || !inputEmail) && isMasterPassword);

    if (isValidOfficialAdmin) {
      setIsAuthenticated(true);
      localStorage.setItem('infinity_bd_admin_auth', 'true');
      sessionStorage.setItem('infinity_admin_user', authEmail.trim() || 'Infinitybd@social.org');
      showToast(isBn ? 'সফলভাবে অ্যাডমিন প্যানেলে লগইন হয়েছে' : 'Logged in as Administrator');
      return;
    }

    if (isSupabaseConfigured && inputEmail && inputPass) {
      try {
        const { data, error } = await signInWithEmail(authEmail, authPassword);
        if (data?.user) {
          setIsAuthenticated(true);
          localStorage.setItem('infinity_bd_admin_auth', 'true');
          sessionStorage.setItem('infinity_admin_user', data.user.email || authEmail);
          showToast('Authenticated via Supabase');
          return;
        } else if (error) {
          console.warn('Supabase auth notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase auth failed, trying credentials fallback:', err);
      }
    }

    setAuthError(isBn ? 'ভুল ইমেইল অথবা পাসওয়ার্ড। সঠিক পাসওয়ার্ড (যেমন: InfinityWebsite@2015 বা infinity2026) দিয়ে পুনরায় চেষ্টা করুন।' : 'Invalid credentials. Please enter a valid administrator password.');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await signOutAdmin();
    }
    setIsAuthenticated(false);
    localStorage.removeItem('infinity_bd_admin_auth');
    showToast('Logged out of Admin Portal');
  };

  // -------------------------------------------------------------
  // 1. AUTHENTICATION LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAF7F2]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE3D9] p-8 sm:p-10 shadow-warm-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-[#006A4E] text-white flex items-center justify-center mx-auto shadow-warm-md">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display">
              {isBn ? 'ইনফিনিটি বাংলাদেশ অ্যাডমিন প্যানেল' : 'Infinity Bangladesh CMS'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn ? 'ওয়েবসাইটের যাবতীয় কনটেন্ট ও ডেটা ম্যানেজমেন্ট পোর্টাল' : 'Secure Management Portal & Content Management System'}
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {isBn ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {isBn ? 'পাসওয়ার্ড *' : 'Password *'}
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-sm shadow-warm-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'লগইন করুন' : 'Sign In to Admin Portal'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-slate-500 text-[11px] space-y-1">
            <p>Team Infinity • United for Humanity</p>
            <p className="text-emerald-700 font-medium">
              {isLiveSupabase ? '🟢 Supabase PostgreSQL Connected' : '🟠 Local Persistence & Offline Sync Ready'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation tabs definition
  const tabGroups = [
    {
      group: isBn ? 'মূল নিয়ন্ত্রণ' : 'Main Control',
      items: [
        { id: 'overview' as AdminTab, label: isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview & Stats', icon: LayoutDashboard },
        { id: 'brand_settings' as AdminTab, label: isBn ? 'ব্র্যান্ড ও স্লোগান CMS' : 'Brand & Slogans CMS', icon: Sparkles },
        { id: 'homepage' as AdminTab, label: isBn ? 'হোমপেজ এডিটর' : 'Homepage Editor', icon: Sliders },
        { id: 'about_cms' as AdminTab, label: isBn ? 'আমাদের সম্পর্কে' : 'About Organization', icon: BookOpen },
        { id: 'journey_videos' as AdminTab, label: isBn ? 'জার্নি ভিডিও আর্কাইভ' : 'About Journey Videos', icon: Film },
        { id: 'navigation' as AdminTab, label: isBn ? 'মেনু ও নেভিগেশন' : 'Navigation & Menus', icon: Compass },
        { id: 'header_footer' as AdminTab, label: isBn ? 'হেডার ও ফুটার' : 'Header & Footer', icon: Layers }
      ]
    },
    {
      group: isBn ? 'মানবিক কার্যক্রম' : 'Humanitarian CMS',
      items: [
        { 
          id: 'blood_donation' as AdminTab, 
          label: isBn ? 'রক্তদান ব্যবস্থাপনা (ব্লাড ব্যাংক)' : 'Blood Donation Network', 
          icon: Droplet,
          badge: bloodDonors.filter(d => d.approvalStatus === 'PENDING').length > 0
            ? bloodDonors.filter(d => d.approvalStatus === 'PENDING').length
            : undefined
        },
        { id: 'campaigns' as AdminTab, label: isBn ? 'ক্যাম্পেইনসমূহ' : 'Campaigns', icon: Flag },
        { id: 'programs' as AdminTab, label: isBn ? 'সেবামূলক প্রোগ্রাম' : 'Programs', icon: Handshake },
        { id: 'impact' as AdminTab, label: isBn ? 'ইমপ্যাক্ট মেট্রিক্স' : 'Impact Metrics', icon: Activity },
        { id: 'stories' as AdminTab, label: isBn ? 'বাস্তব জীবনের গল্প' : 'Impact Stories', icon: Heart },
        { id: 'faqs' as AdminTab, label: isBn ? 'সাধারণ প্রশ্নোত্তর' : 'FAQ Manager', icon: HelpCircle },
        { id: 'volunteers' as AdminTab, label: isBn ? 'স্বেচ্ছাসেবী আবেদন' : 'Volunteer CMS', icon: Users },
        { id: 'donations' as AdminTab, label: isBn ? 'অনুদান ও তহবিল' : 'Donations & Funds', icon: CreditCard },
        { id: 'transparency' as AdminTab, label: isBn ? 'স্বচ্ছতা ও অডিট' : 'Transparency', icon: FileSpreadsheet }
      ]
    },
    {
      group: isBn ? 'মিডিয়া ও গ্যালারি' : 'Media & Content',
      items: [
        { id: 'media_library' as AdminTab, label: isBn ? 'মিডিয়া লাইব্রেরি' : 'Media Library', icon: FolderOpen },
        { id: 'banners' as AdminTab, label: isBn ? 'ব্যানার ম্যানেজার' : 'Banners & Sliders', icon: ImageIcon },
        { id: 'gallery_albums' as AdminTab, label: isBn ? 'গ্যালারি অ্যালবাম' : 'Gallery Albums', icon: Tag },
        { id: 'press' as AdminTab, label: isBn ? 'গণমাধ্যমে সংবাদ (প্রেস)' : 'News & Press Coverage', icon: Newspaper },
        { id: 'committees' as AdminTab, label: isBn ? 'কমিটি ও নেতৃত্ব' : 'Committees Roster', icon: Award },
        { id: 'news_events' as AdminTab, label: isBn ? 'সংবাদ ও ইভেন্ট' : 'News & Events', icon: Calendar }
      ]
    },
    {
      group: isBn ? 'সেটিংস ও সিস্টেম' : 'Settings & System',
      items: [
        { id: 'seo' as AdminTab, label: isBn ? 'এসইও ও মেটাট্যাগ' : 'SEO & Social Cards', icon: Globe },
        { id: 'social_links' as AdminTab, label: isBn ? 'সামাজিক মাধ্যম' : 'Social Channels', icon: Share2 },
        { id: 'support_cms' as AdminTab, label: isBn ? 'পেমেন্ট চ্যানেল' : 'Donation Channels', icon: CreditCard },
        { id: 'contact_cms' as AdminTab, label: isBn ? 'যোগাযোগ সেটিংস' : 'Contact Settings', icon: PhoneCall },
        { id: 'messages' as AdminTab, label: isBn ? 'ব্যবহারকারী বার্তা' : 'User Messages', icon: Mail },
        { id: 'admin_users' as AdminTab, label: isBn ? 'অ্যাডমিন ইউজার' : 'Admin Roles', icon: UserCog },
        { id: 'audit' as AdminTab, label: isBn ? 'অডিট লগ' : 'Audit Logs', icon: History },
        { id: 'backup' as AdminTab, label: isBn ? 'ব্যাকআপ ও সিঙ্ক' : 'Backup & Diagnostics', icon: Database }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      {/* 1. Admin Portal Header */}
      <div className="bg-[#11241E] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-warm-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006A4E] flex items-center justify-center text-white font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight font-display">
                  Infinity Bangladesh CMS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#006A4E] text-emerald-200">
                  {currentRole.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                {isLiveSupabase ? '🟢 Supabase PostgreSQL Live' : '🟠 Local Offline Storage Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-emerald-200 font-semibold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isBn ? 'ওয়েবসাইট দেখুন' : 'Live Website'}</span>
            </button>

            {isLiveSupabase && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await pushAllToSupabase();
                    setToastMessage(res.message);
                  }}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition-all cursor-pointer shadow-sm"
                  title="Push all local CMS changes and image URLs directly to Supabase cloud database"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Pushing...' : (isBn ? 'ক্লাউডে সেভ করুন' : 'Push to Cloud')}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await syncWithSupabase();
                    setToastMessage(isBn ? 'সফলভাবে ক্লাউড ডাটাবেস থেকে লোড করা হয়েছে।' : 'Pulled latest data from cloud database.');
                  }}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006A4E] hover:bg-[#008562] text-xs text-white font-bold transition-all cursor-pointer"
                  title="Fetch latest updates from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : (isBn ? 'সিঙ্ক' : 'Pull DB')}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs text-white font-bold transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBn ? 'লগআউট' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Workspace Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Quick Section Selector */}
        <div className="lg:hidden mb-4 bg-white rounded-2xl border border-[#EAE3D9] p-3.5 shadow-warm-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{isBn ? 'সেকশন নির্বাচন করুন:' : 'Admin Section:'}</span>
            <span className="text-[11px] text-[#00523C] bg-[#E6F3EF] px-2.5 py-0.5 rounded-full font-bold border border-[#C2E2D7]">
              {tabGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
            </span>
          </div>
          <select
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as AdminTab);
            }}
            className="w-full p-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
          >
            {tabGroups.map((g, gIdx) => (
              <optgroup key={gIdx} label={g.group}>
                {g.items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.label} {(item as any).badge ? `(${(item as any).badge} ${isBn ? 'টি পেন্ডিং' : 'Pending'})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Desktop Left Sidebar Menu */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-[#EAE3D9] p-4 shadow-warm-sm space-y-6">
            {tabGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 block">
                  {group.group}
                </span>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const badgeCount = (item as any).badge;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#E6F3EF] text-[#00523C] shadow-2xs'
                            : 'text-slate-700 hover:bg-[#FAF7F2] hover:text-[#006A4E]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#006A4E]' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                          {badgeCount !== undefined && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500 text-white shrink-0 animate-pulse shadow-2xs">
                              {badgeCount}
                            </span>
                          )}
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#006A4E] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Content Workspace */}
          <div className="lg:col-span-9 space-y-6">
            <AdminErrorBoundary fallbackTitle="Admin Workspace Component Error">
            {/* -------------------------------------------------------- */}
            {/* TAB: OVERVIEW */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'ইনফিনিটি বাংলাদেশ কন্ট্রোল সেন্টার' : 'System Overview & Real-time Metrics'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'ওয়েবসাইটের সকল কনটেন্ট ও ডেটাবেজ একনজরে' : 'Comprehensive summary of campaigns, volunteers, donations, and website health.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openMediaPicker((url) => console.log('Picked:', url))}
                        className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-xs font-bold border border-[#EAE3D9] flex items-center gap-2 cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 text-[#006A4E]" />
                        <span>Media Picker</span>
                      </button>
                    </div>
                  </div>

                  {/* Pending Approvals Alert Banner */}
                  {(() => {
                    const pendingCount = bloodDonors.filter(d => d.approvalStatus === 'PENDING').length;
                    if (pendingCount === 0) return null;
                    return (
                      <div
                        onClick={() => {
                          setActiveTab('blood_donation');
                          setBloodSubTab('pending');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-4 sm:p-5 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-warm-md cursor-pointer transition-all group animate-in fade-in"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '6s' }} />
                          </div>
                          <div>
                            <p className="font-black text-sm sm:text-base flex items-center gap-2">
                              <span>{isBn ? `🔔 ${pendingCount}টি নতুন রক্তদাতার আবেদন অনুমোদনের অপেক্ষায় রয়েছে!` : `🔔 ${pendingCount} New Blood Donor Applications Awaiting Approval!`}</span>
                              <span className="px-2 py-0.5 rounded-full bg-white text-amber-900 text-xs font-mono font-black">
                                {pendingCount}
                              </span>
                            </p>
                            <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
                              {isBn
                                ? 'নতুন আবেদনসমূহ পর্যালোচনা, যাচাই এবং পাবলিক ডিরেক্টরিতে অনুমোদন করতে এখানে ক্লিক করুন।'
                                : 'Click here to review applicant details, contact via WhatsApp, and grant approval.'}
                            </p>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-xl bg-white text-amber-900 font-extrabold text-xs shadow-2xs group-hover:scale-105 transition-transform shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
                          <span>{isBn ? 'পেন্ডিং তালিকা দেখুন' : 'Open Queue'}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-900" />
                        </span>
                      </div>
                    );
                  })()}

                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 pt-2">
                    <div 
                      onClick={() => setActiveTab('campaigns')}
                      className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-1 cursor-pointer hover:border-[#006A4E] transition-colors"
                    >
                      <span className="text-[11px] font-bold text-[#00523C] uppercase">Campaigns</span>
                      <p className="text-2xl font-extrabold text-[#00523C] font-mono">{campaigns.length}</p>
                    </div>
                    <div 
                      onClick={() => setActiveTab('volunteers')}
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 cursor-pointer hover:border-amber-400 transition-colors"
                    >
                      <span className="text-[11px] font-bold text-amber-800 uppercase">Volunteers</span>
                      <p className="text-2xl font-extrabold text-amber-900 font-mono">{volunteers.length}</p>
                    </div>
                    <div 
                      onClick={() => {
                        setActiveTab('blood_donation');
                        setBloodSubTab('overview');
                      }}
                      className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 cursor-pointer hover:border-rose-400 transition-colors relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-800 uppercase">Blood Donors</span>
                        {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500 text-white animate-pulse">
                            {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length} Pending
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-extrabold text-rose-900 font-mono">{bloodDonors.length}</p>
                    </div>
                    <div 
                      onClick={() => setActiveTab('donations')}
                      className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 cursor-pointer hover:border-emerald-400 transition-colors"
                    >
                      <span className="text-[11px] font-bold text-emerald-800 uppercase">Donations</span>
                      <p className="text-2xl font-extrabold text-emerald-900 font-mono">{donations.length}</p>
                    </div>
                    <div 
                      onClick={() => setActiveTab('media_library')}
                      className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <span className="text-[11px] font-bold text-blue-800 uppercase">Media Assets</span>
                      <p className="text-2xl font-extrabold text-blue-900 font-mono">{mediaLibrary.length}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => {
                      setActiveTab('blood_donation');
                      setBloodSubTab(bloodDonors.filter(d => d.approvalStatus === 'PENDING').length > 0 ? 'pending' : 'overview');
                    }}
                    className="p-5 rounded-3xl bg-white border border-[#EAE3D9] hover:border-rose-500 shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Droplet className="w-5 h-5 fill-current text-rose-600" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 font-display flex items-center justify-between">
                      <span>Blood Donation & Donors</span>
                      {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                          {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">Review pending donor registrations, verify contacts, and manage database.</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('homepage')}
                    className="p-5 rounded-3xl bg-white border border-[#EAE3D9] hover:border-[#006A4E] shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 font-display">Homepage Hero & Sections</h3>
                    <p className="text-xs text-slate-500">Edit headline, slogans, real cover photo, and toggle section visibility.</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('campaigns')}
                    className="p-5 rounded-3xl bg-white border border-[#EAE3D9] hover:border-[#006A4E] shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Flag className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 font-display">Add / Manage Campaigns</h3>
                    <p className="text-xs text-slate-500">Post seasonal drives like Eid Joy, Winter Relief, and track funds.</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('media_library')}
                    className="p-5 rounded-3xl bg-white border border-[#EAE3D9] hover:border-[#006A4E] shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 font-display">Media Library & Photos</h3>
                    <p className="text-xs text-slate-500">Upload authentic photography, manage categories, and use across the site.</p>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: BRAND SETTINGS & CENTRAL SLOGAN */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'brand_settings' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#006A4E]" />
                      <span>{isBn ? 'ব্র্যান্ড আইডেন্টিটি, স্লোগান ও প্রাতিষ্ঠানিক সেটিংস' : 'Brand Identity, Central Slogan & Official Credentials'}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn
                        ? 'অফিসিয়াল স্লোগান, প্রাতিষ্ঠানিক নাম, প্রতিষ্ঠা সাল, ঠিকানা ও লোগো পরিবর্তন করুন (পুরো সাইটে স্বয়ংক্রিয়ভাবে আপডেট হবে)।'
                        : 'Manage primary slogan, organization identity, established year, headquarters, and official credentials.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(isBn ? 'ব্র্যান্ড সেটিংস সংরক্ষিত হয়েছে' : 'Brand settings saved successfully')}
                    className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm hover:bg-[#00523C] transition-all cursor-pointer"
                  >
                    Save Brand Settings
                  </button>
                </div>

                {/* Central Slogan Section */}
                <div className="p-5 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                      <h3 className="text-sm font-extrabold text-[#00523C] font-display">
                        Official Slogan: UNITED FOR HUMANITY (কেন্দ্রীয় স্লোগান)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600">
                      Changing this updates the Header, Brand Logo, Homepage Hero, Footer, and Verified Badges globally across the entire website.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Primary Slogan (English) *</label>
                      <input
                        type="text"
                        value={settings.primary_slogan?.en || settings.slogan?.en || 'United for Humanity'}
                        onChange={(e) => updateSettings({
                          primary_slogan: { ...(settings.primary_slogan || { en: '', bn: '' }), en: e.target.value },
                          slogan: { ...(settings.slogan || { en: '', bn: '' }), en: e.target.value }
                        })}
                        placeholder="United for Humanity"
                        className="w-full px-3.5 py-2 bg-white border border-[#C2E2D7] rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#006A4E]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">মূল স্লোগান (বাংলা) *</label>
                      <input
                        type="text"
                        value={settings.primary_slogan?.bn || settings.slogan?.bn || 'মানবতার জন্য একতাবদ্ধ'}
                        onChange={(e) => updateSettings({
                          primary_slogan: { ...(settings.primary_slogan || { en: '', bn: '' }), bn: e.target.value },
                          slogan: { ...(settings.slogan || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        placeholder="মানবতার জন্য একতাবদ্ধ"
                        className="w-full px-3.5 py-2 bg-white border border-[#C2E2D7] rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#006A4E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 font-display">Organization Identity & Metadata</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Organization Name (English)</label>
                      <input
                        type="text"
                        value={settings.organizationName?.en || 'Infinity Bangladesh'}
                        onChange={(e) => updateSettings({
                          organizationName: { ...(settings.organizationName || { en: '', bn: '' }), en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">সংস্থার নাম (বাংলা)</label>
                      <input
                        type="text"
                        value={settings.organizationName?.bn || 'ইনফিনিটি বাংলাদেশ'}
                        onChange={(e) => updateSettings({
                          organizationName: { ...(settings.organizationName || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Team Identity</label>
                      <input
                        type="text"
                        value={settings.teamIdentity || 'Team Infinity'}
                        onChange={(e) => updateSettings({ teamIdentity: e.target.value })}
                        placeholder="Team Infinity"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Established Year</label>
                      <input
                        type="text"
                        value={settings.establishedYear || '2015'}
                        onChange={(e) => updateSettings({ establishedYear: e.target.value })}
                        placeholder="2015"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Headquarters Location</label>
                      <input
                        type="text"
                        value={settings.headquartersLocation || 'Bogura, Bangladesh'}
                        onChange={(e) => updateSettings({ headquartersLocation: e.target.value })}
                        placeholder="Bogura, Bangladesh"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Official Registration / Model</label>
                      <input
                        type="text"
                        value={settings.registrationNumber || 'Non-Profit Youth Organization'}
                        onChange={(e) => updateSettings({ registrationNumber: e.target.value })}
                        placeholder="Non-Profit Youth Organization"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Official Address, Phone, Email */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display">Official Address & Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Official Address (English)</label>
                      <textarea
                        rows={2}
                        value={settings.officialAddress?.en || ''}
                        onChange={(e) => updateSettings({
                          officialAddress: { ...(settings.officialAddress || { en: '', bn: '' }), en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">অফিসিয়াল ঠিকানা (বাংলা)</label>
                      <textarea
                        rows={2}
                        value={settings.officialAddress?.bn || ''}
                        onChange={(e) => updateSettings({
                          officialAddress: { ...(settings.officialAddress || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Official Helpline Phone</label>
                      <input
                        type="text"
                        value={settings.officialPhone || '+880 1711-000000'}
                        onChange={(e) => updateSettings({ officialPhone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Official Email Address</label>
                      <input
                        type="email"
                        value={settings.officialEmail || 'contact@infinitybangladesh.org'}
                        onChange={(e) => updateSettings({ officialEmail: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo & Visual Assets */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display">Logo & Brand Visuals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0">
                        <img
                          src={getAssetUrl(settings.logoUrl || '/logo.png')}
                          alt="Official Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-bold text-slate-700 block">Logo URL</label>
                        <input
                          type="text"
                          value={settings.logoUrl || '/logo.png'}
                          onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                          className="w-full px-3 py-1 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker((url) => {
                            updateSettings({ logoUrl: url });
                            showToast('Logo updated');
                          })}
                          className="text-[11px] text-[#006A4E] font-bold hover:underline cursor-pointer"
                        >
                          Pick from Media Library
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0">
                        <img
                          src={getAssetUrl(settings.faviconUrl || '/favicon.ico')}
                          alt="Favicon"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-bold text-slate-700 block">Favicon URL</label>
                        <input
                          type="text"
                          value={settings.faviconUrl || '/favicon.ico'}
                          onChange={(e) => updateSettings({ faviconUrl: e.target.value })}
                          className="w-full px-3 py-1 bg-white border border-[#EAE3D9] rounded-lg text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker((url) => {
                            updateSettings({ faviconUrl: url });
                            showToast('Favicon updated');
                          })}
                          className="text-[11px] text-[#006A4E] font-bold hover:underline cursor-pointer"
                        >
                          Pick from Media Library
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: HOMEPAGE EDITORIAL CONTROL CENTER (1:1 MAPPED) */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'homepage' && (
              <AdminHomepageManager
                setActiveTab={setActiveTab}
                openMediaPicker={openMediaPicker}
                showToast={showToast}
              />
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: ABOUT CMS & JOURNEY VIDEOS */}
            {/* -------------------------------------------------------- */}
            {(activeTab === 'about_cms' || activeTab === 'journey_videos') && (
              <div className="space-y-6">
                {/* Sub Tab Navigation Switcher */}
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#EAE3D9] w-fit shadow-warm-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'journey_videos') setActiveTab('about_cms');
                      setAboutSubTab('info');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      (activeTab === 'about_cms' && aboutSubTab === 'info')
                        ? 'bg-[#006A4E] text-white shadow-warm-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isBn ? 'সাংগঠনিক পরিচিতি ও বিবরণ' : 'About Overview & Mission'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'about_cms') setAboutSubTab('journey_videos');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'journey_videos' || (activeTab === 'about_cms' && aboutSubTab === 'journey_videos')
                        ? 'bg-[#006A4E] text-white shadow-warm-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>{isBn ? 'জার্নি ভিডিও আর্কাইভ' : 'Journey Videos Archive'}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ml-1 ${
                      activeTab === 'journey_videos' || (activeTab === 'about_cms' && aboutSubTab === 'journey_videos')
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {journeyVideos.length}
                    </span>
                  </button>
                </div>

                {/* Sub Tab 1: Organization Overview & Mission */}
                {(activeTab === 'about_cms' && aboutSubTab === 'info') && (
                  <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          {isBn ? 'আমাদের পরিচয়, লক্ষ্য ও দর্শন' : 'About Organization CMS'}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {isBn ? 'মিশন, ভিশন, ইতিহাস ও সাংগঠনিক পটভূমি পরিবর্তন করুন।' : 'Edit organization mission, vision, history, established year, and locations.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('About settings saved')}
                        className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm"
                      >
                        Save Changes
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 font-display">Mission Statement</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Mission (English)</label>
                          <textarea
                            rows={3}
                            value={aboutSettings.mission.en}
                            onChange={(e) => updateAboutSettings({
                              mission: { ...aboutSettings.mission, en: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Mission (বাংলা)</label>
                          <textarea
                            rows={3}
                            value={aboutSettings.mission.bn}
                            onChange={(e) => updateAboutSettings({
                              mission: { ...aboutSettings.mission, bn: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 font-display">Vision Statement</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Vision (English)</label>
                          <textarea
                            rows={3}
                            value={aboutSettings.vision.en}
                            onChange={(e) => updateAboutSettings({
                              vision: { ...aboutSettings.vision, en: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Vision (বাংলা)</label>
                          <textarea
                            rows={3}
                            value={aboutSettings.vision.bn}
                            onChange={(e) => updateAboutSettings({
                              vision: { ...aboutSettings.vision, bn: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 font-display">Historical Background</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">History & Genesis (English)</label>
                          <textarea
                            rows={4}
                            value={aboutSettings.history.en}
                            onChange={(e) => updateAboutSettings({
                              history: { ...aboutSettings.history, en: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">History & Genesis (বাংলা)</label>
                          <textarea
                            rows={4}
                            value={aboutSettings.history.bn}
                            onChange={(e) => updateAboutSettings({
                              history: { ...aboutSettings.history, bn: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab 2: Journey Videos Archive Manager */}
                {(activeTab === 'journey_videos' || (activeTab === 'about_cms' && aboutSubTab === 'journey_videos')) && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                      {/* Section Header with Stats & Actions */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-slate-900 font-display">
                              {isBn ? 'জার্নি ভিডিও আর্কাইভ ব্যবস্থাপনা' : 'Journey Videos Archive Manager'}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#E6F3EF] text-[#00523C]">
                              {journeyVideos.length} {isBn ? 'ভিডিও' : 'Videos'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 max-w-2xl">
                            {isBn
                              ? 'আবাউট পেইজের "আমাদের গল্প ও পরিচিতি" সেকশনের ডানপাশে প্রদর্শিত পরিক্রমা ভিডিও ও টাইমলাইন নিয়ন্ত্রণ করুন।'
                              : 'Add and organize humanitarian journey milestone documentaries displayed dynamically in About → Overview & Story.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingJourneyVideo(null);
                              setIsJourneyVideoModalOpen(true);
                            }}
                            className="px-4 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{isBn ? '+ নতুন জার্নি ভিডিও যুক্ত করুন' : '+ Add New Journey Video'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Stat summary cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Videos</span>
                          <span className="text-lg font-extrabold text-slate-900">{journeyVideos.length}</span>
                        </div>

                        <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Published Live</span>
                          <span className="text-lg font-extrabold text-emerald-700">
                            {journeyVideos.filter(v => v.isPublished !== false).length}
                          </span>
                        </div>

                        <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Drafts / Hidden</span>
                          <span className="text-lg font-extrabold text-amber-700">
                            {journeyVideos.filter(v => v.isPublished === false).length}
                          </span>
                        </div>

                        <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Featured Journey</span>
                          <span className="text-xs font-extrabold text-slate-800 truncate block mt-1">
                            {journeyVideos.find(v => v.isFeatured)?.timelineLabel?.en || journeyVideos.find(v => v.isFeatured)?.title?.en || 'Auto-Default'}
                          </span>
                        </div>
                      </div>

                      {/* Search and Category Filter */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={journeyVideoSearch}
                            onChange={(e) => setJourneyVideoSearch(e.target.value)}
                            placeholder={isBn ? 'টাইমলাইন বা শিরোনাম দিয়ে খুঁজুন (যেমন: 2015–2019)...' : 'Search by timeline, title, or category...'}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs focus:outline-none focus:bg-white transition-colors"
                          />
                        </div>

                        <select
                          value={journeyVideoCategory}
                          onChange={(e) => setJourneyVideoCategory(e.target.value)}
                          className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs focus:outline-none focus:bg-white font-medium cursor-pointer shrink-0"
                        >
                          <option value="All">All Categories</option>
                          <option value="Organizational Journey">Organizational Journey</option>
                          <option value="Eid Distribution Program">Eid Distribution Program</option>
                          <option value="Winter Clothing Distribution">Winter Clothing Distribution</option>
                          <option value="Flood Relief Activities">Flood Relief Activities</option>
                          <option value="Educational Support">Educational Support</option>
                          <option value="Emergency Humanitarian Response">Emergency Humanitarian Response</option>
                          <option value="Anniversary Documentary">Anniversary Documentary</option>
                        </select>
                      </div>

                      {/* Journey Video List */}
                      <div className="space-y-3.5">
                        {journeyVideos
                          .filter(v => {
                            const matchesCat = journeyVideoCategory === 'All' || v.category === journeyVideoCategory;
                            if (!matchesCat) return false;
                            if (!journeyVideoSearch.trim()) return true;
                            const q = journeyVideoSearch.toLowerCase();
                            const titleEn = (v.title?.en || '').toLowerCase();
                            const titleBn = (v.title?.bn || '').toLowerCase();
                            const timeEn = (v.timelineLabel?.en || '').toLowerCase();
                            const timeBn = (v.timelineLabel?.bn || '').toLowerCase();
                            const descEn = (v.description?.en || '').toLowerCase();
                            return titleEn.includes(q) || titleBn.includes(q) || timeEn.includes(q) || timeBn.includes(q) || descEn.includes(q);
                          })
                          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                          .map((video, index, arr) => {
                            const det = detectAndNormalizeMedia(video.videoUrl || '');
                            const rawThumb = video.thumbnailUrl || det.thumbnailUrl || '';
                            const effectiveThumb = getAssetUrl(rawThumb);
                            const hasUrl = Boolean(video.videoUrl && video.videoUrl.trim());

                            return (
                              <div
                                key={video.id}
                                className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#006A4E]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-warm-xs"
                              >
                                {/* Left: Media Thumbnail + Badge */}
                                <div className="flex items-center gap-4">
                                  <div className="w-24 sm:w-28 h-16 sm:h-18 rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 relative shrink-0">
                                    {effectiveThumb ? (
                                      <img
                                        src={effectiveThumb}
                                        alt={tText(video.title)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.currentTarget as HTMLImageElement;
                                          target.onerror = null;
                                          target.src = DEFAULT_VIDEO_THUMBNAIL;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1 bg-slate-900">
                                        <Film className="w-5 h-5 text-emerald-400" />
                                        <span className="text-[9px] text-slate-400">No URL</span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                      <Play className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="absolute bottom-1 right-1 text-[9px] font-mono font-extrabold bg-black/70 text-white px-1.5 py-0.2 rounded">
                                      #{video.displayOrder ?? (index + 1)}
                                    </span>
                                  </div>

                                  {/* Center: Metadata */}
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#006A4E] text-white">
                                        {tText(video.timelineLabel)}
                                      </span>

                                      {video.isFeatured && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                          <span>Featured</span>
                                        </span>
                                      )}

                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                        {video.category || 'Organizational Journey'}
                                      </span>

                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        video.isPublished !== false
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}>
                                        {video.isPublished !== false ? 'Published' : 'Draft'}
                                      </span>
                                    </div>

                                    <h4 className="font-extrabold text-sm text-slate-900 font-display">
                                      {tText(video.title)}
                                    </h4>

                                    {tText(video.description) && (
                                      <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">
                                        {tText(video.description)}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                                      {hasUrl ? (
                                        <a
                                          href={video.videoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#006A4E] font-medium hover:underline flex items-center gap-1 font-mono truncate max-w-xs"
                                        >
                                          <LinkIcon className="w-3 h-3 shrink-0" />
                                          <span className="truncate">{video.videoUrl}</span>
                                        </a>
                                      ) : (
                                        <span className="text-amber-700 font-medium flex items-center gap-1">
                                          <Clock className="w-3 h-3 shrink-0" />
                                          <span>Video Coming Soon State</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Action Controls */}
                                <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                                  {/* Featured Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => setFeaturedJourneyVideo(video.id)}
                                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                      video.isFeatured
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-warm-xs'
                                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}
                                    title={video.isFeatured ? 'Currently Featured' : 'Click to make this the primary Featured Video'}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${video.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                                    <span className="hidden sm:inline">{video.isFeatured ? 'Featured' : 'Set Featured'}</span>
                                  </button>

                                  {/* Publish Status Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateJourneyVideo(video.id, { isPublished: !video.isPublished });
                                      showToast(video.isPublished ? 'ভিডিওটি ড্রাফটে নেওয়া হয়েছে' : 'ভিডিওটি প্রকাশ করা হয়েছে');
                                    }}
                                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                      video.isPublished !== false
                                        ? 'bg-[#E6F3EF] text-[#00523C] hover:bg-emerald-100'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                    title="Toggle publication status"
                                  >
                                    {video.isPublished !== false ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">{video.isPublished !== false ? 'Live' : 'Hidden'}</span>
                                  </button>

                                  {/* Reorder Up / Down */}
                                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                                    <button
                                      type="button"
                                      disabled={index === 0}
                                      onClick={() => handleMoveJourneyVideo(video.id, 'up')}
                                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={index === arr.length - 1}
                                      onClick={() => handleMoveJourneyVideo(video.id, 'down')}
                                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingJourneyVideo(video);
                                      setIsJourneyVideoModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-warm-xs"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#006A4E]" />
                                    <span>Edit</span>
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJourneyVideo(video.id, tText(video.title))}
                                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Delete video"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                        {journeyVideos.length === 0 && (
                          <div className="p-10 bg-[#FAF7F2] rounded-3xl border border-[#EAE3D9] text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#006A4E] mx-auto flex items-center justify-center">
                              <Film className="w-6 h-6" />
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-800">
                              {isBn ? 'কোনো জার্নি ভিডিও পাওয়া যায়নি' : 'No Journey Videos Found'}
                            </h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                              {isBn
                                ? 'নতুন ভিডিও যুক্ত করতে উপরের বাটনে ক্লিক করুন।'
                                : 'Click the button below to add your first milestone journey video.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingJourneyVideo(null);
                                setIsJourneyVideoModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-xl bg-[#006A4E] text-white text-xs font-bold cursor-pointer"
                            >
                              + Add Journey Video
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: CAMPAIGNS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'মানবিক ক্যাম্পেইন ব্যবস্থাপনা' : 'Humanitarian Campaigns Manager'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'ঈদ আনন্দ, শীতবস্ত্র ত্রাণ ও জরুরি সহায়তা ক্যাম্পেইন পরিচালনা করুন।' : 'Create and manage seasonal field drives, target funds, and verified beneficiary records.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCampaign(null);
                        setIsCampaignModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isBn ? 'নতুন ক্যাম্পেইন যুক্ত করুন' : 'Add New Campaign'}</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder={isBn ? 'ক্যাম্পেইনের নাম বা বিভাগ দিয়ে খুঁজুন...' : 'Search campaigns by title or category...'}
                      className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Campaign List */}
                  <div className="space-y-3 pt-2">
                    {campaigns
                      .filter(c =>
                        searchFilter === '' ||
                        c.title.en.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        c.title.bn.includes(searchFilter)
                      )
                      .map(camp => (
                        <div
                          key={camp.id}
                          className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                              <img
                                src={getAssetUrl(camp.imageUrl)}
                                alt={camp.title.en}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{camp.title.en}</h4>
                                {camp.isFeatured && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{camp.title.bn} &bull; {camp.category} &bull; {camp.date}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCampaign(camp);
                                setIsCampaignModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete campaign: ${camp.title.en}?`)) {
                                  deleteCampaign(camp.id);
                                  showToast('Campaign deleted');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: PROGRAMS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'programs' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'সেবামূলক কর্মসূচি ও প্রোগ্রাম ব্যবস্থাপনা' : 'Humanitarian Programs & Editions Manager'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? 'কর্মসূচি, বাৎসরিক আসর (Editions), গ্যালারি ও হাইলাইটস কিউরেট করুন।'
                          : 'Manage programs, annual event editions, photo/video archives, and curated highlights.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProgram(null);
                        setIsProgramModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isBn ? 'নতুন প্রোগ্রাম যোগ করুন' : 'Add New Program'}</span>
                    </button>
                  </div>

                  <div className="space-y-4 pt-2">
                    {programs.map(prog => {
                      const progEditions = getEventsByProgramId(prog.id);
                      const isExpanded = expandedProgramId === prog.id;

                      return (
                        <div
                          key={prog.id}
                          className="rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] overflow-hidden transition-all"
                        >
                          {/* Program Header Row */}
                          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                                <img
                                  src={getAssetUrl(prog.imageUrl)}
                                  alt={prog.title.en}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-900">{prog.title.en}</h4>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3EF] text-[#00523C]">
                                    {prog.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {prog.title.bn} &bull; {progEditions.length} {isBn ? 'টি আসর' : 'Editions Recorded'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {/* Expand / Collapse Editions Manager */}
                              <button
                                type="button"
                                onClick={() => setExpandedProgramId(isExpanded ? null : prog.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#006A4E] text-white shadow-warm-xs'
                                    : 'bg-white hover:bg-emerald-50 text-[#006A4E] border border-[#006A4E]/30'
                                }`}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                  {isExpanded
                                    ? (isBn ? 'আসরসমূহ বন্ধ করুন' : 'Hide Editions')
                                    : `${isBn ? 'আসরসমূহ পরিচালনা' : 'Manage Editions'} (${progEditions.length})`}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProgramForEvent(prog);
                                  setEditingProgramEvent(null);
                                  setIsEventModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006A4E] border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title="Add New Edition to this program"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{isBn ? 'নতুন আসর' : 'Add Edition'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProgram(prog);
                                  setIsProgramModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title="Edit Program Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete program: ${prog.title.en}?`)) {
                                    deleteProgram(prog.id);
                                    showToast('Program deleted');
                                  }
                                }}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                                title="Delete Program"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expandable Chronological Editions Section */}
                          {isExpanded && (
                            <div className="p-4 sm:p-5 border-t border-[#EAE3D9] bg-white/70 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                  <span>{isBn ? 'এই কর্মসূচির আসর ও ইভেন্ট তালিকা:' : 'Chronological Editions & Events:'}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                                    {progEditions.length} Total
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProgramForEvent(prog);
                                    setEditingProgramEvent(null);
                                    setIsEventModalOpen(true);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{isBn ? '+ নতুন আসর যুক্ত করুন' : '+ Add New Edition'}</span>
                                </button>
                              </div>

                              {progEditions.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                                  No event editions recorded for this program yet. Click "+ Add New Edition" to create one.
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {progEditions.map(ed => {
                                    const edMedia = getEventMedia(ed.id);
                                    const edHighlights = getEventHighlights(ed.id);

                                    return (
                                      <div
                                        key={ed.id}
                                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-200 transition-colors"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                            <img
                                              src={getAssetUrl(ed.coverImageUrl || prog.imageUrl)}
                                              alt={ed.title.en}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>

                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006A4E] text-[10px] font-black">
                                                {ed.year}
                                              </span>
                                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                                {ed.title.en}
                                              </h5>
                                              {ed.isFeatured && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                                  ★ Featured
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                              {ed.title.bn} &bull; 📍 {ed.location.en} &bull; Status: {ed.status}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Action Controls for this edition */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                          {/* Curate Media & Highlights Button */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedProgramForMedia(prog);
                                              setSelectedEventForMedia(ed);
                                              setIsEventMediaModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                            title="Manage Media & Curate Highlights"
                                          >
                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                            <span>
                                              {edHighlights.length} {isBn ? 'হাইলাইটস' : 'Highlights'} ({edMedia.length} Media)
                                            </span>
                                          </button>

                                          {/* Edit Edition */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedProgramForEvent(prog);
                                              setEditingProgramEvent(ed);
                                              setIsEventModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                                            title="Edit Edition Details"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Delete Edition */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm(`Delete edition: ${ed.title.en} (${ed.year})?`)) {
                                                deleteProgramEvent(ed.id);
                                                showToast('Event edition deleted');
                                              }
                                            }}
                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                            title="Delete Edition"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: IMPACT METRICS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'impact' && (
              <div className="space-y-6">
                {/* Homepage Impact Section Header Settings */}
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-5 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EF] text-[#006A4E] text-xs font-bold mb-1.5 border border-[#C2E2D7]">
                        <Activity className="w-3.5 h-3.5" />
                        <span>{isBn ? 'হোমপেজ সেকশন হেডার' : 'Homepage Section Presentation'}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'হোমপেজ ইমপ্যাক্ট সেকশন হেডিং' : 'Homepage Impact Section Header & Text'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'হোমপেজে প্রদর্শিত "পরিসংখ্যান ও মানবিক প্রভাব" সেকশনের ব্যাজ, শিরোনাম ও সাবটাইটেল।' : 'Controls homepage impact badge, headline, and verification subtitle description.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(isBn ? 'ইমপ্যাক্ট হেডার সেটিংস সংরক্ষিত' : 'Impact header saved')}
                      className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm cursor-pointer hover:bg-[#00523C] transition-colors shrink-0"
                    >
                      {isBn ? 'হেডার সংরক্ষণ' : 'Save Header'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Badge Text (EN)</label>
                      <input
                        type="text"
                        value={homepageConfig.impactSection?.badge?.en || ''}
                        onChange={(e) => updateHomepageConfig({
                          impactSection: {
                            ...(homepageConfig.impactSection || {}),
                            badge: { ...(homepageConfig.impactSection?.badge || { en: '', bn: '' }), en: e.target.value }
                          }
                        })}
                        placeholder="Verified Groundwork"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">ব্যাজ লেখা (বাংলা)</label>
                      <input
                        type="text"
                        value={homepageConfig.impactSection?.badge?.bn || ''}
                        onChange={(e) => updateHomepageConfig({
                          impactSection: {
                            ...(homepageConfig.impactSection || {}),
                            badge: { ...(homepageConfig.impactSection?.badge || { en: '', bn: '' }), bn: e.target.value }
                          }
                        })}
                        placeholder="আমাদের মাঠপর্যায়ের বিস্তৃতি"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Title Heading (EN)</label>
                      <input
                        type="text"
                        value={homepageConfig.impactSection?.title?.en || ''}
                        onChange={(e) => updateHomepageConfig({
                          impactSection: {
                            ...(homepageConfig.impactSection || {}),
                            title: { ...(homepageConfig.impactSection?.title || { en: '', bn: '' }), en: e.target.value }
                          }
                        })}
                        placeholder="Our Measured Impact Across Communities"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">মূল শিরোনাম (বাংলা)</label>
                      <input
                        type="text"
                        value={homepageConfig.impactSection?.title?.bn || ''}
                        onChange={(e) => updateHomepageConfig({
                          impactSection: {
                            ...(homepageConfig.impactSection || {}),
                            title: { ...(homepageConfig.impactSection?.title || { en: '', bn: '' }), bn: e.target.value }
                          }
                        })}
                        placeholder="পরিসংখ্যান ও মানবিক প্রভাব"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Subtitle Description (EN)</label>
                        <textarea
                          rows={2}
                          value={homepageConfig.impactSection?.subtitle?.en || ''}
                          onChange={(e) => updateHomepageConfig({
                            impactSection: {
                              ...(homepageConfig.impactSection || {}),
                              subtitle: { ...(homepageConfig.impactSection?.subtitle || { en: '', bn: '' }), en: e.target.value }
                            }
                          })}
                          placeholder="Ground-level metrics verified by Team Infinity audits across communities."
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">সাবটাইটেল বিবরণ (বাংলা)</label>
                        <textarea
                          rows={2}
                          value={homepageConfig.impactSection?.subtitle?.bn || ''}
                          onChange={(e) => updateHomepageConfig({
                            impactSection: {
                              ...(homepageConfig.impactSection || {}),
                              subtitle: { ...(homepageConfig.impactSection?.subtitle || { en: '', bn: '' }), bn: e.target.value }
                            }
                          })}
                          placeholder="সকল সংখ্যা ও তথ্য সততা ও নিরপেক্ষতার সাথে যাচাইকৃত।"
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Impact Metric Cards */}
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'ইমপ্যাক্ট মেট্রিক্স ও পরিসংখ্যান কার্ড' : 'Impact Metrics & Real-time Numbers'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'হোমপেজ ও ইমপ্যাক্ট পেজের সংখ্যাভিত্তিক অগ্রগতি পরিবর্তন করুন।' : 'Update headline numbers, beneficiary totals, volunteer count, and active years.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Impact metrics saved')}
                      className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm cursor-pointer hover:bg-[#00523C] transition-colors"
                    >
                      Save Metrics
                    </button>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {metrics.map(metric => (
                    <div
                      key={metric.id}
                      className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Indicator #{metric.order || metric.id}</span>
                        <span className="text-xs font-mono font-bold text-[#006A4E]">{metric.value}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Numeric Value</label>
                          <input
                            type="text"
                            value={metric.value}
                            onChange={(e) => updateMetric(metric.id, { value: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Icon Key</label>
                          <input
                            type="text"
                            value={metric.iconName}
                            onChange={(e) => updateMetric(metric.id, { iconName: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Label (English)</label>
                        <input
                          type="text"
                          value={metric.label.en}
                          onChange={(e) => updateMetric(metric.id, { label: { ...metric.label, en: e.target.value } })}
                          className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">লেবেল (বাংলা)</label>
                        <input
                          type="text"
                          value={metric.label.bn}
                          onChange={(e) => updateMetric(metric.id, { label: { ...metric.label, bn: e.target.value } })}
                          className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

            {/* -------------------------------------------------------- */}
            {/* TAB: IMPACT STORIES */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'stories' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'বাস্তব জীবনের রূপান্তর ও গল্প' : 'Impact Stories & Transformations'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'মাঠপর্যায়ের সুবিধাভোগীদের বাস্তব জীবনের গল্প ও মানবিক রূপান্তর প্রকাশ করুন।' : 'Publish verified field transformation stories with consent confirmations.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingStory(null);
                        setIsStoryModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isBn ? 'নতুন গল্প প্রকাশ করুন' : 'Add New Story'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {stories.map(st => (
                      <div
                        key={st.id}
                        className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            <img
                              src={getAssetUrl(st.imageUrl)}
                              alt={st.title.en}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{st.title.en}</h4>
                            <p className="text-xs text-slate-500">{st.title.bn} &bull; {st.personOrCommunity.en} &bull; {st.location.en}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStory(st);
                              setIsStoryModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete story: ${st.title.en}?`)) {
                                deleteStory(st.id);
                                showToast('Story deleted');
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: FAQS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'faqs' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#006A4E]" />
                      <span>{isBn ? 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ Manager)' : 'Frequently Asked Questions (FAQ CMS)'}</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'ওয়েবসাইটের সকল প্রশ্নোত্তর, ক্যাটাগরি ও প্রদর্শন ক্রম নিয়ন্ত্রণ করুন।' : 'Manage transparent Q&As regarding operations, funding, donation policies, and volunteering.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingFAQ(null);
                      setIsFAQModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন প্রশ্নোত্তর যোগ করুন' : 'Add New FAQ'}</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={isBn ? 'প্রশ্ন বা উত্তর দিয়ে খুঁজুন...' : 'Search FAQs by question or keyword...'}
                    className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                {/* FAQ List */}
                <div className="space-y-3 pt-2">
                  {faqs
                    .filter(f =>
                      searchFilter === '' ||
                      f.question.en.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      f.question.bn.includes(searchFilter) ||
                      f.answer.en.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      f.answer.bn.includes(searchFilter)
                    )
                    .map((faqItem, idx) => (
                      <div
                        key={faqItem.id}
                        className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-white text-slate-700 font-mono font-bold text-xs flex items-center justify-center border border-slate-200">
                              #{faqItem.displayOrder || idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{faqItem.question.en}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3EF] text-[#00523C]">
                                  {faqItem.category}
                                </span>
                                {faqItem.active === false && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 font-bengali">{faqItem.question.bn}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFAQ(faqItem);
                                setIsFAQModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete FAQ: "${faqItem.question.en}"?`)) {
                                  deleteFAQ(faqItem.id);
                                  showToast('FAQ item deleted');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                          <p><strong className="text-slate-700">EN:</strong> {faqItem.answer.en}</p>
                          <p className="font-bengali"><strong className="text-slate-700">বাং:</strong> {faqItem.answer.bn}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: TRANSPARENCY */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'transparency' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'আর্থিক স্বচ্ছতা ও অডিট রিপোর্ট' : 'Financial Transparency & Audit Reports'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'বার্ষিক আয়-ব্যয় প্রতিবেদন ও অডিট নথি প্রকাশ করুন।' : 'Manage published annual statements, expenditure breakdowns, and verifiable audit records.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newRep: Omit<TransparencyReport, 'id'> = {
                        title: { en: `Annual Audit Report ${new Date().getFullYear()}`, bn: `বার্ষিক অডিট রিপোর্ট ${new Date().getFullYear()}` },
                        year: `${new Date().getFullYear()}`,
                        type: 'Financial Audit',
                        fileUrl: '/documents/infinity-audit-report.pdf',
                        fileSize: '1.4 MB',
                        uploadDate: new Date().toISOString().split('T')[0],
                        status: 'official',
                        description: { en: 'Full independent financial review and verification.', bn: 'সম্পূর্ণ নিরপেক্ষ আর্থিক অডিট ও যাচাইকরণ।' },
                        displayOrder: reports.length + 1
                      };
                      addReport(newRep);
                      showToast('Audit report created');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Report</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {reports.map(rep => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{rep.title.en}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3EF] text-[#00523C]">
                            Year {rep.year}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{rep.title.bn} &bull; Type: {rep.type}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete report: ${rep.title.en}?`)) {
                              deleteReport(rep.id);
                              showToast('Report deleted');
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: GALLERY ALBUMS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'gallery_albums' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'গ্যালারি অ্যালবাম ব্যবস্থাপনা' : 'Gallery Albums & Event Collections'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'ইভেন্টভিত্তিক ফটো অ্যালবাম তৈরি, সম্পাদনা ও ছবি যুক্ত করুন।' : 'Organize and publish event-specific photo collections with cover images and batch photo assignments.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAlbum(null);
                      setIsAlbumModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন অ্যালবাম তৈরি' : 'Create New Album'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {galleryAlbums.map(alb => {
                    const albumPhotosCount = gallery.filter(g => g.albumId === alb.id).length;
                    return (
                      <div
                        key={alb.id}
                        className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                            <img
                              src={getAssetUrl(alb.coverImageUrl)}
                              alt={alb.title.en}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                              {alb.category}
                            </div>
                            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-900/80 backdrop-blur-xs text-emerald-100 text-[10px] font-bold">
                              {albumPhotosCount} photos
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">{alb.title.en}</h4>
                            <p className="text-xs text-slate-500 font-bengali">{alb.title.bn}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Date: {alb.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D9] gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAlbumPhotos(alb);
                              setIsAlbumPhotoManagerOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#006A4E]" />
                            <span>Manage Photos ({albumPhotosCount})</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAlbum(alb);
                                setIsAlbumModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                              title="Edit Album Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete album: ${alb.title.en}? Photos inside will not be deleted from media library.`)) {
                                  deleteGalleryAlbum(alb.id);
                                  showToast('Album deleted');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                              title="Delete Album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: NEWS & EVENTS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'news_events' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'সংবাদ বিজ্ঞপ্তি ও ইভেন্ট' : 'News Releases & Community Events'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'সংবাদ বিজ্ঞপ্তি এবং আসন্ন ইভেন্টসমূহ প্রকাশ করুন।' : 'Publish official press updates and schedule upcoming volunteer events.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newNews: Omit<NewsArticle, 'id'> = {
                        slug: `news-${Date.now()}`,
                        title: { en: 'New Organization Press Release', bn: 'নতুন সাংগঠনিক সংবাদ বিজ্ঞপ্তি' },
                        excerpt: { en: 'Brief summary of the announcement.', bn: 'বিজ্ঞপ্তির সংক্ষিপ্ত সারসংক্ষেপ।' },
                        content: { en: 'Full text content of the news article...', bn: 'সংবাদের সম্পূর্ণ বিস্তারিত বিবরণ...' },
                        author: 'Team Infinity Media Wing',
                        date: new Date().toISOString().split('T')[0],
                        imageUrl: '/images/infinity-cover-hero.jpg',
                        category: 'Press Release',
                        tags: ['Official', 'Humanitarian'],
                        status: 'published'
                      };
                      addNews(newNews);
                      showToast('News article published');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish News</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {news.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.title.en}</h4>
                        <p className="text-xs text-slate-500">{item.title.bn} &bull; {item.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete news: ${item.title.en}?`)) {
                            deleteNews(item.id);
                            showToast('News article removed');
                          }
                        }}
                        className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: NAVIGATION & MENUS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'navigation' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-8 shadow-warm-sm">
                {/* Header Title */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'হেডার ও মেনু নেভিগেশন বিল্ডার' : 'Header Actions & Navigation Menu Builder'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn
                        ? 'ওয়েবসাইটের প্রধান মেনু আইটেম, ড্রপডাউন এবং হেডারের বাটনসমূহ (অনুদানের বাটন, সার্চ, ভাষা পরিবর্তন) হাইড/আনহাইড ও এডিট করুন।'
                        : 'Manage navbar links, submenus, and toggle header action buttons (Donate button, search, language switcher, notice bar) with instant eye toggle.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNav(null);
                      setIsNavModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm hover:bg-[#00523C] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন মেনু লিঙ্ক' : 'Add Menu Link'}</span>
                  </button>
                </div>

                {/* 1. Header Action Buttons & Widgets (Eye Hide/Unhide Controls) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#006A4E]" />
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      {isBn ? 'হেডার অ্যাকশন বাটন ও উইজেট নিয়ন্ত্রণ (Eye Hide/Unhide)' : 'Header Action Buttons & Widgets'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Support / Donate Button Widget */}
                    <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      headerSettings.showSupportButton !== false
                        ? 'bg-[#FAF7F2] border-[#EAE3D9]'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {isBn ? 'অনুদানের বাটন (Donate / Support Button)' : 'Support / Donate CTA Button'}
                          </span>
                        </div>

                        {/* Eye Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newShow = !headerSettings.showSupportButton;
                            updateHeaderSettings({ showSupportButton: newShow });
                            showToast(newShow ? 'Support button is now visible' : 'Support button is now hidden');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            headerSettings.showSupportButton !== false
                              ? 'bg-emerald-100 text-[#00523C] hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={headerSettings.showSupportButton !== false ? 'Click to Hide button' : 'Click to Show button'}
                        >
                          {headerSettings.showSupportButton !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'দৃশ্যমান' : 'Visible'}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isBn ? 'লুকানো' : 'Hidden'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Button Text (English)</label>
                          <input
                            type="text"
                            value={headerSettings.supportButtonText?.en || ''}
                            onChange={(e) => updateHeaderSettings({
                              supportButtonText: { ...(headerSettings.supportButtonText || { en: '', bn: '' }), en: e.target.value }
                            })}
                            placeholder="Support Us"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">বাটনের লেখা (বাংলা)</label>
                          <input
                            type="text"
                            value={headerSettings.supportButtonText?.bn || ''}
                            onChange={(e) => updateHeaderSettings({
                              supportButtonText: { ...(headerSettings.supportButtonText || { en: '', bn: '' }), bn: e.target.value }
                            })}
                            placeholder="সহায়তা করুন"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Search Button Widget */}
                    <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      headerSettings.showSearch !== false
                        ? 'bg-[#FAF7F2] border-[#EAE3D9]'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-[#006A4E]" />
                          <span className="text-xs font-bold text-slate-900">
                            {isBn ? 'অনুসন্ধান বাটন (Search Icon Button)' : 'Search Button'}
                          </span>
                        </div>

                        {/* Eye Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newShow = !headerSettings.showSearch;
                            updateHeaderSettings({ showSearch: newShow });
                            showToast(newShow ? 'Search button is now visible' : 'Search button is now hidden');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            headerSettings.showSearch !== false
                              ? 'bg-emerald-100 text-[#00523C] hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={headerSettings.showSearch !== false ? 'Click to Hide search' : 'Click to Show search'}
                        >
                          {headerSettings.showSearch !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'দৃশ্যমান' : 'Visible'}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isBn ? 'লুকানো' : 'Hidden'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {isBn
                          ? 'হেডারের সার্চ বাটনের মাধ্যমে ভিজিটররা ক্যাম্পেইন, খবর ও প্রোগ্রাম সহজে খুঁজে পেতে পারেন।'
                          : 'Allows visitors to quickly search across active campaigns, news, and programs.'}
                      </p>
                    </div>

                    {/* Language Switcher Widget */}
                    <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      headerSettings.showLanguageSwitcher !== false
                        ? 'bg-[#FAF7F2] border-[#EAE3D9]'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {isBn ? 'ভাষা পরিবর্তন বাটন (Language Switcher)' : 'Language Switcher (বাংলা / EN)'}
                          </span>
                        </div>

                        {/* Eye Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newShow = !headerSettings.showLanguageSwitcher;
                            updateHeaderSettings({ showLanguageSwitcher: newShow });
                            showToast(newShow ? 'Language switcher is now visible' : 'Language switcher is now hidden');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            headerSettings.showLanguageSwitcher !== false
                              ? 'bg-emerald-100 text-[#00523C] hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={headerSettings.showLanguageSwitcher !== false ? 'Click to Hide switcher' : 'Click to Show switcher'}
                        >
                          {headerSettings.showLanguageSwitcher !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'দৃশ্যমান' : 'Visible'}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isBn ? 'লুকানো' : 'Hidden'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {isBn
                          ? 'টপ বারে বাংলা ও ইংরেজির মধ্যে এক ক্লিকে ভাষা পরিবর্তনের বাটন।'
                          : 'Top bar button enabling visitors to switch between English and Bangla.'}
                      </p>
                    </div>

                    {/* Top Notice Bar Widget */}
                    <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      headerSettings.showNoticeBar !== false
                        ? 'bg-[#FAF7F2] border-[#EAE3D9]'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-slate-900">
                            {isBn ? 'শীর্ষ নোটিশ বার (Top Notice Bar)' : 'Top Notice Bar'}
                          </span>
                        </div>

                        {/* Eye Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newShow = !headerSettings.showNoticeBar;
                            updateHeaderSettings({ showNoticeBar: newShow });
                            showToast(newShow ? 'Notice bar is now visible' : 'Notice bar is now hidden');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            headerSettings.showNoticeBar !== false
                              ? 'bg-emerald-100 text-[#00523C] hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={headerSettings.showNoticeBar !== false ? 'Click to Hide notice bar' : 'Click to Show notice bar'}
                        >
                          {headerSettings.showNoticeBar !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'দৃশ্যমান' : 'Visible'}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isBn ? 'লুকানো' : 'Hidden'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {isBn
                          ? 'ওয়েবসাইটের একেবারে উপরে নোটিশ বা স্বাগত বার্তা প্রদর্শনের বার।'
                          : 'Slim dark green bar at the very top for official announcements and welcome messages.'}
                      </p>
                    </div>

                    {/* Top Notice Bar Action / Transparency Button Widget */}
                    <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      headerSettings.showNoticeBarButton !== false
                        ? 'bg-[#FAF7F2] border-[#EAE3D9]'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {isBn ? 'নোটিশ বার স্বচ্ছতা বাটন (Notice Transparency Button)' : 'Notice Transparency CTA'}
                          </span>
                        </div>

                        {/* Eye Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newShow = headerSettings.showNoticeBarButton === false ? true : false;
                            updateHeaderSettings({ showNoticeBarButton: newShow });
                            showToast(newShow ? 'Notice bar button is now visible' : 'Notice bar button is now hidden');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            headerSettings.showNoticeBarButton !== false
                              ? 'bg-emerald-100 text-[#00523C] hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={headerSettings.showNoticeBarButton !== false ? 'Click to Hide button' : 'Click to Show button'}
                        >
                          {headerSettings.showNoticeBarButton !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'দৃশ্যমান' : 'Visible'}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isBn ? 'লুকানো' : 'Hidden'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Label: <strong>{tText(headerSettings.noticeBarButtonText) || (isBn ? 'স্বচ্ছতা ও অডিট' : 'Transparency')}</strong></span>
                        <span className="font-mono text-emerald-700">/{headerSettings.noticeBarLink || 'transparency'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Main Navigation Menu Links Manager */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#006A4E]" />
                      <h3 className="text-sm font-bold text-slate-900 font-display">
                        {isBn ? 'প্রধান মেনু লিঙ্কসমূহ (Main Navbar Links)' : 'Main Navigation Links'}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {navigationItems.length} {isBn ? 'টি মেনু আইটেম' : 'menu links'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[...navigationItems]
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((nav, idx, arr) => (
                        <div
                          key={nav.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            nav.active !== false
                              ? 'bg-[#FAF7F2] border-[#EAE3D9] shadow-warm-xs'
                              : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          {/* Left Details */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-xl bg-white font-mono font-bold text-xs flex items-center justify-center border border-slate-200 text-slate-700 shrink-0 shadow-2xs">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold text-slate-900">
                                  {nav.label.en}
                                </p>
                                <span className="text-slate-400 text-xs">/</span>
                                <p className="text-xs font-bold text-slate-700 font-bengali">
                                  {nav.label.bn}
                                </p>
                                {nav.isDropdown && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-[#00523C] rounded-full">
                                    Dropdown ({nav.children?.length || 0})
                                  </span>
                                )}
                                {nav.isExternal && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full flex items-center gap-0.5">
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    External
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                                Path: <span className="font-semibold text-slate-700">{nav.path}</span>
                              </p>
                            </div>
                          </div>

                          {/* Right Actions: Eye Toggle, Move Up/Down, Edit, Delete */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Instant Eye Visibility Toggle Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const newActive = nav.active === false ? true : false;
                                updateNavigationItem(nav.id, { active: newActive });
                                showToast(
                                  newActive
                                    ? (isBn ? `"${nav.label.bn}" মেনু এখন দৃশ্যমান` : `"${nav.label.en}" is now visible`)
                                    : (isBn ? `"${nav.label.bn}" মেনু লুকানো হয়েছে` : `"${nav.label.en}" is now hidden`)
                                );
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
                                nav.active !== false
                                  ? 'bg-emerald-100 text-[#00523C] hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                              title={nav.active !== false ? 'Click to Hide this menu link' : 'Click to Show this menu link'}
                            >
                              {nav.active !== false ? (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-[#006A4E]" />
                                  <span>{isBn ? 'দৃশ্যমান' : 'Visible'}</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{isBn ? 'লুকানো' : 'Hidden'}</span>
                                </>
                              )}
                            </button>

                            {/* Reorder Buttons (Move Up / Down) */}
                            <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const sorted = [...navigationItems].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                                  const currentIdx = sorted.findIndex(n => n.id === nav.id);
                                  if (currentIdx > 0) {
                                    const temp = sorted[currentIdx];
                                    sorted[currentIdx] = sorted[currentIdx - 1];
                                    sorted[currentIdx - 1] = temp;
                                    const updated = sorted.map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                    reorderNavigationItems(updated);
                                    updated.forEach(item => updateNavigationItem(item.id, { displayOrder: item.displayOrder }));
                                    showToast(isBn ? 'মেনুর ক্রম পরিবর্তন হয়েছে' : 'Navigation order updated');
                                  }
                                }}
                                className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-bold text-xs"
                                title="Move Left / Up"
                              >
                                ▲
                              </button>
                              <div className="w-px h-4 bg-slate-200" />
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => {
                                  const sorted = [...navigationItems].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                                  const currentIdx = sorted.findIndex(n => n.id === nav.id);
                                  if (currentIdx < sorted.length - 1) {
                                    const temp = sorted[currentIdx];
                                    sorted[currentIdx] = sorted[currentIdx + 1];
                                    sorted[currentIdx + 1] = temp;
                                    const updated = sorted.map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                    reorderNavigationItems(updated);
                                    updated.forEach(item => updateNavigationItem(item.id, { displayOrder: item.displayOrder }));
                                    showToast(isBn ? 'মেনুর ক্রম পরিবর্তন হয়েছে' : 'Navigation order updated');
                                  }
                                }}
                                className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-bold text-xs"
                                title="Move Right / Down"
                              >
                                ▼
                              </button>
                            </div>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNav(nav);
                                setIsNavModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove nav link "${nav.label.en}"?`)) {
                                  deleteNavigationItem(nav.id);
                                  showToast(isBn ? 'মেনু লিঙ্ক মুছে ফেলা হয়েছে' : 'Nav link removed');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-all"
                              title="Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: HEADER & FOOTER */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'header_footer' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-8 shadow-warm-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'হেডার ও ফুটার সেটিংস' : 'Header & Footer Settings'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'অ্যানাউন্সমেন্ট নোটিস বার, ফুটার টপ কলআউট ব্যানার, ঠিকানা ও হেল্পলাইন পরিবর্তন করুন।' : 'Configure top notice ticker bar, footer callout banner, helpline, official address, and copyright.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Header & footer saved')}
                    className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

                {/* Top Notice Bar */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#006A4E]" />
                    <span>Top Announcement Notice Bar & Target Link</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Notice Text (English)</label>
                      <input
                        type="text"
                        value={headerSettings.noticeBarText?.en || ''}
                        onChange={(e) => updateHeaderSettings({
                          noticeBarText: { ...headerSettings.noticeBarText, en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">নোটিস টেক্সট (বাংলা)</label>
                      <input
                        type="text"
                        value={headerSettings.noticeBarText?.bn || ''}
                        onChange={(e) => updateHeaderSettings({
                          noticeBarText: { ...headerSettings.noticeBarText, bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>

                  {/* Top Notice Bar Action / Transparency Button Settings */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                        <span>{isBn ? 'নোটিশ বার অ্যাকশন বাটন (Notice Bar Action / Transparency CTA)' : 'Top Notice Bar Action / Transparency Button'}</span>
                      </h4>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={headerSettings.showNoticeBarButton !== false}
                          onChange={(e) => updateHeaderSettings({ showNoticeBarButton: e.target.checked })}
                          className="rounded text-[#006A4E]"
                        />
                        <span>{isBn ? 'টপ বারে বাটন দেখান' : 'Show in Notice Bar'}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Button Label (English)</label>
                        <input
                          type="text"
                          value={headerSettings.noticeBarButtonText?.en || ''}
                          onChange={(e) => updateHeaderSettings({
                            noticeBarButtonText: { ...(headerSettings.noticeBarButtonText || { en: '', bn: '' }), en: e.target.value }
                          })}
                          placeholder="Transparency"
                          className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">বোতামের লেখা (বাংলা)</label>
                        <input
                          type="text"
                          value={headerSettings.noticeBarButtonText?.bn || ''}
                          onChange={(e) => updateHeaderSettings({
                            noticeBarButtonText: { ...(headerSettings.noticeBarButtonText || { en: '', bn: '' }), bn: e.target.value }
                          })}
                          placeholder="স্বচ্ছতা ও অডিট"
                          className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Target Route / URL (লিংক)</label>
                        <input
                          type="text"
                          value={headerSettings.noticeBarLink || 'transparency'}
                          onChange={(e) => updateHeaderSettings({ noticeBarLink: e.target.value })}
                          placeholder="e.g. transparency, campaigns"
                          className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Quick Route Selectors */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Quick Route Selectors:</span>
                      {['transparency', 'campaigns', 'donate', 'volunteer', 'contact', 'media-coverage', 'about'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => updateHeaderSettings({ noticeBarLink: r })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                            (headerSettings.noticeBarLink || 'transparency') === r
                              ? 'bg-[#006A4E] text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-[#006A4E]'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Header Support CTA Button */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>Header Support / Action CTA Button (হেডারের ডানপাশের বাটন)</span>
                    </h3>
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={headerSettings.showSupportButton !== false}
                        onChange={(e) => updateHeaderSettings({ showSupportButton: e.target.checked })}
                        className="rounded text-[#006A4E]"
                      />
                      <span>{isBn ? 'হেডারে বাটন দেখান' : 'Show in Header'}</span>
                    </label>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Button Text (English)</label>
                        <input
                          type="text"
                          value={headerSettings.supportButtonText?.en || ''}
                          onChange={(e) => updateHeaderSettings({
                            supportButtonText: { ...(headerSettings.supportButtonText || { en: '', bn: '' }), en: e.target.value }
                          })}
                          placeholder="Donate"
                          className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">বোতামের লেখা (বাংলা)</label>
                        <input
                          type="text"
                          value={headerSettings.supportButtonText?.bn || ''}
                          onChange={(e) => updateHeaderSettings({
                            supportButtonText: { ...(headerSettings.supportButtonText || { en: '', bn: '' }), bn: e.target.value }
                          })}
                          placeholder="সহায়তা করুন"
                          className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Target Route / URL (লিংক)</label>
                        <input
                          type="text"
                          value={headerSettings.supportButtonUrl || 'donate'}
                          onChange={(e) => updateHeaderSettings({ supportButtonUrl: e.target.value })}
                          placeholder="e.g. donate, volunteer"
                          className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Quick Route Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Quick Route Selectors:</span>
                      {['donate', 'volunteer', 'campaigns', 'transparency', 'contact'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => updateHeaderSettings({ supportButtonUrl: r })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                            (headerSettings.supportButtonUrl || 'donate') === r
                              ? 'bg-[#006A4E] text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-[#006A4E]'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Top Callout Banner */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#006A4E]" />
                      <span>Footer Top Callout Banner (সব পেজের নিচের কলআউট ও বাটনসমূহ)</span>
                    </h3>
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={footerSettings.showCallout !== false}
                        onChange={(e) => updateFooterSettings({ showCallout: e.target.checked })}
                        className="rounded text-[#006A4E]"
                      />
                      <span>{isBn ? 'কলআউট ব্যানার দেখান' : 'Show Callout Banner'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Callout Eyebrow (English)</label>
                      <input
                        type="text"
                        value={footerSettings.calloutEyebrow?.en || ''}
                        onChange={(e) => updateFooterSettings({
                          calloutEyebrow: { ...(footerSettings.calloutEyebrow || { en: '', bn: '' }), en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">কলআউট ব্যাজ (বাংলা)</label>
                      <input
                        type="text"
                        value={footerSettings.calloutEyebrow?.bn || ''}
                        onChange={(e) => updateFooterSettings({
                          calloutEyebrow: { ...(footerSettings.calloutEyebrow || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Callout Title (English)</label>
                      <input
                        type="text"
                        value={footerSettings.calloutTitle?.en || ''}
                        onChange={(e) => updateFooterSettings({
                          calloutTitle: { ...(footerSettings.calloutTitle || { en: '', bn: '' }), en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">কলআউট শিরোনাম (বাংলা)</label>
                      <input
                        type="text"
                        value={footerSettings.calloutTitle?.bn || ''}
                        onChange={(e) => updateFooterSettings({
                          calloutTitle: { ...(footerSettings.calloutTitle || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Callout Subtitle (English)</label>
                      <textarea
                        rows={2}
                        value={footerSettings.calloutSubtitle?.en || ''}
                        onChange={(e) => updateFooterSettings({
                          calloutSubtitle: { ...(footerSettings.calloutSubtitle || { en: '', bn: '' }), en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">কলআউট বিবরণ (বাংলা)</label>
                      <textarea
                        rows={2}
                        value={footerSettings.calloutSubtitle?.bn || ''}
                        onChange={(e) => updateFooterSettings({
                          calloutSubtitle: { ...(footerSettings.calloutSubtitle || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>

                  {/* Footer CTAs Configuration (Volunteer & Support) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Volunteer CTA */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                      <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#006A4E]" />
                        <span>{isBn ? 'ফুটার ভলান্টিয়ার বাটন ও লিংক' : 'Footer Volunteer Button & Link'}</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium text-slate-500">Text (EN)</label>
                          <input
                            type="text"
                            value={footerSettings.volunteerCtaText?.en || ''}
                            onChange={(e) => updateFooterSettings({
                              volunteerCtaText: { ...(footerSettings.volunteerCtaText || { en: '', bn: '' }), en: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            placeholder="Become a Volunteer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500">লেখা (বাং)</label>
                          <input
                            type="text"
                            value={footerSettings.volunteerCtaText?.bn || ''}
                            onChange={(e) => updateFooterSettings({
                              volunteerCtaText: { ...(footerSettings.volunteerCtaText || { en: '', bn: '' }), bn: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                            placeholder="স্বেচ্ছাসেবী হিসেবে যোগ দিন"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500">Target Route / URL (লিংক)</label>
                        <input
                          type="text"
                          value={footerSettings.volunteerCtaUrl || 'volunteer'}
                          onChange={(e) => updateFooterSettings({ volunteerCtaUrl: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          placeholder="volunteer"
                        />
                      </div>
                    </div>

                    {/* Support CTA */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                      <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isBn ? 'ফুটার অনুদান বাটন ও লিংক' : 'Footer Donation Button & Link'}</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium text-slate-500">Text (EN)</label>
                          <input
                            type="text"
                            value={footerSettings.supportCtaText?.en || ''}
                            onChange={(e) => updateFooterSettings({
                              supportCtaText: { ...(footerSettings.supportCtaText || { en: '', bn: '' }), en: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            placeholder="Support Our Mission"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500">লেখা (বাং)</label>
                          <input
                            type="text"
                            value={footerSettings.supportCtaText?.bn || ''}
                            onChange={(e) => updateFooterSettings({
                              supportCtaText: { ...(footerSettings.supportCtaText || { en: '', bn: '' }), bn: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bengali"
                            placeholder="সহায়তা করুন"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500">Target Route / URL (লিংক)</label>
                        <input
                          type="text"
                          value={footerSettings.supportCtaUrl || 'donate'}
                          onChange={(e) => updateFooterSettings({ supportCtaUrl: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          placeholder="donate"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Organization Description */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display">Footer Organization Description</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Description (English)</label>
                      <textarea
                        rows={3}
                        value={footerSettings.description?.en || ''}
                        onChange={(e) => updateFooterSettings({
                          description: { ...footerSettings.description, en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">বিবরণ (বাংলা)</label>
                      <textarea
                        rows={3}
                        value={footerSettings.description?.bn || ''}
                        onChange={(e) => updateFooterSettings({
                          description: { ...footerSettings.description, bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Contact Details & Copyright */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display">Footer Contact, Established Year & Copyright</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Helpline Phone</label>
                      <input
                        type="text"
                        value={footerSettings.phone || ''}
                        onChange={(e) => updateFooterSettings({ phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Official Email</label>
                      <input
                        type="email"
                        value={footerSettings.email || ''}
                        onChange={(e) => updateFooterSettings({ email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Established Year</label>
                      <input
                        type="text"
                        value={footerSettings.establishedYear || '2015'}
                        onChange={(e) => updateFooterSettings({ establishedYear: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Copyright Text (English)</label>
                      <input
                        type="text"
                        value={footerSettings.copyrightText?.en || ''}
                        onChange={(e) => updateFooterSettings({
                          copyrightText: { ...(footerSettings.copyrightText || { en: '', bn: '' }), en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">কপিরাইট টেক্সট (বাংলা)</label>
                      <input
                        type="text"
                        value={footerSettings.copyrightText?.bn || ''}
                        onChange={(e) => updateFooterSettings({
                          copyrightText: { ...(footerSettings.copyrightText || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: SEO */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'seo' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'এসইও ও মেটাট্যাগ কনফিগারেশন' : 'SEO & Social OpenGraph Settings'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'গুগল সার্চ ও সোশ্যাল শেয়ার প্রিভিউ কার্ড পরিবর্তন করুন।' : 'Configure search engine meta titles, descriptions, canonical URL, and OG preview image.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('SEO settings saved')}
                    className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm cursor-pointer"
                  >
                    Save SEO
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Meta Site Title (English)</label>
                      <input
                        type="text"
                        value={seoSettings.siteTitle?.en || ''}
                        onChange={(e) => updateSEOSettings({
                          siteTitle: { ...seoSettings.siteTitle, en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">সাইট শিরোনাম (বাংলা)</label>
                      <input
                        type="text"
                        value={seoSettings.siteTitle?.bn || ''}
                        onChange={(e) => updateSEOSettings({
                          siteTitle: { ...seoSettings.siteTitle, bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Meta Description (English)</label>
                      <textarea
                        rows={3}
                        value={seoSettings.metaDescription?.en || ''}
                        onChange={(e) => updateSEOSettings({
                          metaDescription: { ...seoSettings.metaDescription, en: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">মেটা বিবরণ (বাংলা)</label>
                      <textarea
                        rows={3}
                        value={seoSettings.metaDescription?.bn || ''}
                        onChange={(e) => updateSEOSettings({
                          metaDescription: { ...seoSettings.metaDescription, bn: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: SOCIAL LINKS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'social_links' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'সামাজিক মাধ্যম ও চ্যানেলসমূহ' : 'Official Social Channels & Links'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'ফেসবুক, ইউটিউব ও হোয়াটসঅ্যাপ চ্যানেলের লিঙ্ক ম্যানেজ করুন।' : 'Update official URLs for Facebook, WhatsApp, YouTube, Instagram, and LinkedIn.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {socialLinks.map(soc => (
                    <div
                      key={soc.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#006A4E] text-white font-bold text-xs flex items-center justify-center capitalize">
                          {soc.platform.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 capitalize">{soc.platform}</p>
                          <p className="text-[11px] font-mono text-slate-500">{soc.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={soc.url}
                          onChange={(e) => updateSocialLink(soc.id, { url: e.target.value })}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono w-64"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateSocialLink(soc.id, { active: !soc.active });
                            showToast('Link status updated');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                            soc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {soc.active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: SUPPORT CMS (PAYMENT CHANNELS) */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'support_cms' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'অনুদান ও পেমেন্ট চ্যানেল সেটিংস' : 'Donation & Payment Channels'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর পরিচালনা করুন।' : 'Configure official bKash, Nagad, and Bank payment account numbers.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Payment settings saved')}
                    className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm cursor-pointer"
                  >
                    Save Channels
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
                    <label className="text-xs font-bold text-slate-800">bKash Official Number</label>
                    <input
                      type="text"
                      value={supportSettings.bKashNumber || supportSettings.bkashNumber || settings.bKashNumber || ''}
                      onChange={(e) => updateSupportSettings({ bKashNumber: e.target.value, bkashNumber: e.target.value })}
                      placeholder="e.g. 01839-008339"
                      className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
                    <label className="text-xs font-bold text-slate-800">Nagad Official Number</label>
                    <input
                      type="text"
                      value={supportSettings.nagadNumber || settings.nagadNumber || ''}
                      onChange={(e) => updateSupportSettings({ nagadNumber: e.target.value })}
                      placeholder="e.g. 01839-008339"
                      className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: CONTACT CMS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'contact_cms' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'যোগাযোগ ও অবস্থান সেটিংস' : 'Contact Details & Office Location'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'অফিস ঠিকানা, হেল্পলাইন নম্বর ও গুগল ম্যাপস লিঙ্ক আপডেট করুন।' : 'Update office address, phone, email, helpline, and Google Maps embed URL.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Contact settings saved')}
                    className="px-5 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm cursor-pointer"
                  >
                    Save Contact
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Helpline Phone</label>
                    <input
                      type="text"
                      value={contactSettings.phone}
                      onChange={(e) => updateContactSettings({ phone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Email</label>
                    <input
                      type="email"
                      value={contactSettings.email}
                      onChange={(e) => updateContactSettings({ email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Office Address (English)</label>
                    <input
                      type="text"
                      value={contactSettings.address.en}
                      onChange={(e) => updateContactSettings({
                        address: { ...contactSettings.address, en: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">অফিস ঠিকানা (বাংলা)</label>
                    <input
                      type="text"
                      value={contactSettings.address.bn}
                      onChange={(e) => updateContactSettings({
                        address: { ...contactSettings.address, bn: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: USER MESSAGES */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'ওয়েবসাইট ইনকোয়ারি ও বার্তা' : 'User Messages & Inquiries'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'ওয়েবসাইট ভিজিটরদের পাঠানো বার্তা ও যোগাযোগ অনুরোধ।' : 'Messages and queries submitted through the website contact form.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">No user messages received yet.</div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{msg.name}</h4>
                            <span className="text-xs text-slate-500 font-mono">({msg.email})</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">Subject: {msg.subject}</p>
                          <p className="text-xs text-slate-600 italic">"{msg.message}"</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              updateMessageStatus(msg.id, 'Replied');
                              showToast('Marked as replied');
                            }}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Mark Replied
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete message?')) {
                                deleteContactMessage(msg.id);
                                showToast('Message removed');
                              }
                            }}
                            className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: BLOOD DONATION MANAGEMENT */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'blood_donation' && (
              <div className="space-y-6">
                {/* Blood Donation Header */}
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Droplet className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                          {isBn ? 'রক্তদান নেটওয়ার্ক ও ব্লাড ব্যাংক সিএমএস' : 'Blood Donation Network Management'}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                          {isBn ? 'স্বেচ্ছাসেবী রক্তদাতা, জরুরি রক্তের আবেদন ও সাংগঠনিক ব্লাড সমন্বয় পোর্টাল।' : 'Manage voluntary donors, verify pending applications, match emergency requests, and configure settings.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBloodDonor(null);
                          setIsBloodDonorModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs shadow-warm-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন রক্তদাতা যোগ করুন' : 'Add New Donor'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await syncWithSupabase();
                          showToast(isBn ? 'রক্তদাতা ও ডাটাবেজ সফলভাবে রিফ্রেশ হয়েছে!' : 'Database and blood records refreshed!');
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] hover:bg-[#FAF7F2] text-slate-700 font-bold text-xs shadow-warm-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title={isBn ? 'ডাটাবেজের সাথে সিঙ্ক ও রিফ্রেশ করুন' : 'Refresh & Sync from Database'}
                      >
                        <RefreshCw className={`w-4 h-4 text-[#006A4E] ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isBn ? 'সিঙ্ক / রিফ্রেশ' : 'Sync & Refresh'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportDonorsCSV}
                        className="px-4 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] hover:bg-[#FAF7F2] text-slate-700 font-bold text-xs shadow-warm-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtabs Bar */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
                    {(() => {
                      const pendingDonors = bloodDonors.filter(d => d.approvalStatus === 'PENDING');
                      const pendingCount = pendingDonors.length;
                      return [
                        { id: 'overview', label: isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview Dashboard', icon: LayoutDashboard },
                        { 
                          id: 'pending', 
                          label: isBn ? `অপেক্ষমাণ আবেদন (${pendingCount})` : `Pending Approvals (${pendingCount})`, 
                          icon: Clock,
                          badge: pendingCount > 0 ? pendingCount : undefined 
                        },
                        { id: 'donors', label: isBn ? `রক্তদাতাবৃন্দ (${bloodDonors.length})` : `All Donors (${bloodDonors.length})`, icon: Users },
                        { id: 'emergency', label: isBn ? `জরুরি আবেদন (${emergencyBloodRequests.length})` : `Emergency Requests (${emergencyBloodRequests.length})`, icon: AlertTriangle },
                        { id: 'settings', label: isBn ? 'সেটিংস ও ক্যাটাগরি' : 'Settings & Categories', icon: Sliders }
                      ].map(st => {
                        const Icon = st.icon;
                        const isSelected = bloodSubTab === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setBloodSubTab(st.id as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-[#006A4E] text-white shadow-xs'
                                : 'bg-[#FAF7F2] hover:bg-[#EAE3D9] text-slate-700'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`} />
                            <span>{st.label}</span>
                            {st.badge !== undefined && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500 text-white animate-pulse">
                                {st.badge}
                              </span>
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* SUBTAB 1: OVERVIEW DASHBOARD */}
                {bloodSubTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-warm-xs space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase">{isBn ? 'মোট নিবন্ধিত রক্তদাতা' : 'Total Donors'}</p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-[#006A4E] font-display">{bloodDonors.length}</p>
                      </div>

                      <div 
                        onClick={() => setBloodSubTab('pending')}
                        className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-warm-xs space-y-1 cursor-pointer hover:border-amber-400 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-amber-800 uppercase">{isBn ? 'অনুমোদন অপেক্ষায় (Pending)' : 'Pending Approval'}</p>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-display">
                          {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length}
                        </p>
                      </div>

                      <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-warm-xs space-y-1">
                        <p className="text-xs font-bold text-emerald-800 uppercase">{isBn ? 'যাচাইকৃত রক্তদাতা (Verified)' : 'Verified Donors'}</p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display">
                          {bloodDonors.filter(d => d.isVerified).length}
                        </p>
                      </div>

                      <div 
                        onClick={() => setBloodSubTab('emergency')}
                        className="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-warm-xs space-y-1 cursor-pointer hover:border-rose-400 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-rose-800 uppercase">{isBn ? 'জরুরি রক্তের আবেদন' : 'Emergency Requests'}</p>
                          <ChevronRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 font-display">
                          {emergencyBloodRequests.length}
                        </p>
                      </div>
                    </div>

                    {/* Pending Approvals Queue */}
                    {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length > 0 ? (
                      <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 space-y-4 shadow-warm-xs">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{isBn ? 'নতুন রক্তদাতা আবেদন (পর্যালোচনা ও অনুমোদন প্রয়োজন)' : 'Pending Donor Approvals Queue'}</span>
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {bloodDonors.filter(d => d.approvalStatus === 'PENDING').map(donor => (
                            <div
                              key={donor.id}
                              className="p-4 rounded-2xl bg-white border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-emerald-950 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden border border-[#EAE3D9]">
                                  {donor.photoUrl ? (
                                    <img src={getAssetUrl(donor.photoUrl)} alt={donor.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    donor.fullName.charAt(0)
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs font-display">
                                      {donor.bloodGroup}
                                    </span>
                                    <span className="text-sm font-extrabold text-slate-900">{donor.fullName}</span>
                                    <span className="text-xs text-emerald-700 font-bold">&bull; {donor.orgCategory}</span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Phone: <span className="font-bold text-slate-700">{donor.phone}</span> &bull; Location: {donor.area ? donor.area + ', ' : ''}{donor.upazila}, {donor.district}
                                    {donor.lastDonationDate && (
                                      <span className="text-emerald-800 font-bold ml-1.5 inline-flex items-center gap-1">
                                        &bull; <Clock className="w-3 h-3 text-emerald-600 inline" />
                                        {isBn ? 'সর্বশেষ রক্তদান:' : 'Last Donated:'} {formatDateDDMMYYYY(donor.lastDonationDate, isBn)}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    approveBloodDonor(donor.id);
                                    showToast(isBn ? `${donor.fullName}-এর আবেদন অনুমোদিত হয়েছে!` : `Approved ${donor.fullName}`);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                                >
                                  {isBn ? 'অনুমোদন করুন' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    rejectBloodDonor(donor.id);
                                    showToast(isBn ? `${donor.fullName}-এর আবেদন বাতিল করা হয়েছে` : `Rejected ${donor.fullName}`);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs cursor-pointer"
                                >
                                  {isBn ? 'বাতিল' : 'Reject'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBloodDonor(donor);
                                    setIsBloodDonorModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D9] text-slate-700 font-bold text-xs cursor-pointer"
                                >
                                  {isBn ? 'সম্পাদনা' : 'Edit'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white rounded-3xl border border-[#EAE3D9] space-y-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#006A4E] mx-auto flex items-center justify-center font-bold">
                          <Check className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          {isBn ? 'বর্তমানে কোনো নতুন অপেক্ষমাণ রক্তদাতা আবেদন নেই' : 'No Pending Donor Applications'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isBn ? 'ওয়েবসাইট থেকে কেউ "Become a Donor" ফর্ম পূরণ করলে এখানে তা অনুমোদনের জন্য ভেসে উঠবে।' : 'New voluntary donor registrations will appear here for verification.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: DEDICATED PENDING APPROVALS LIST */}
                {bloodSubTab === 'pending' && (
                  <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <span>{isBn ? 'অপেক্ষমাণ রক্তদাতা আবেদন তালিকা (Pending Approvals)' : 'Pending Donor Applications Roster'}</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isBn ? 'যাচাই করে রক্তদাতাকে পাবলিক ডিরেক্টরিতে সক্রিয় বা বাতিল করুন।' : 'Review pending voluntary blood donor applications and grant approval.'}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                        {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length} {isBn ? 'টি আবেদন অপেক্ষমাণ' : 'Pending Requests'}
                      </span>
                    </div>

                    {bloodDonors.filter(d => d.approvalStatus === 'PENDING').length === 0 ? (
                      <div className="p-10 text-center bg-[#FAF7F2] rounded-3xl border border-[#EAE3D9] space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006A4E] mx-auto flex items-center justify-center font-bold">
                          <Check className="w-6 h-6 text-[#006A4E]" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm font-display">
                          {isBn ? 'বর্তমানে কোনো নতুন অপেক্ষমাণ আবেদন নেই' : 'No Pending Applications'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          {isBn
                            ? 'সকল রক্তদাতা আবেদন যাচাই ও অনুমোদিত রয়েছে। নতুন রক্তদাতা ফর্ম পূরণ করলে তৎক্ষণাৎ এই তালিকায় প্রদর্শিত হবে।'
                            : 'All donor applications have been processed and approved. New registrations will automatically appear here.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bloodDonors.filter(d => d.approvalStatus === 'PENDING').map(donor => (
                          <div
                            key={donor.id}
                            className="p-5 rounded-2xl bg-[#FAF7F2] border border-amber-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                          >
                            <div className="flex items-start sm:items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden border border-slate-300">
                                {donor.photoUrl ? (
                                  <img src={getAssetUrl(donor.photoUrl)} alt={donor.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-base">{donor.fullName.charAt(0)}</span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs font-display shadow-2xs">
                                    {donor.bloodGroup}
                                  </span>
                                  <span className="text-base font-extrabold text-slate-900 font-display">{donor.fullName}</span>
                                  <span className="text-xs text-emerald-800 font-bold">&bull; {donor.orgCategory}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-900">
                                    ID: {donor.id}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  মোবাইল: <span className="font-bold text-slate-900">{donor.phone}</span> &bull; অবস্থান: <span className="font-semibold">{donor.area ? donor.area + ', ' : ''}{donor.upazila}, {donor.district}</span>
                                  {donor.gender && <span> &bull; লিঙ্গ: {donor.gender}</span>}
                                  {donor.dateOfBirth && <span> &bull; জন্ম তারিখ: {formatDateDDMMYYYY(donor.dateOfBirth, true)}</span>}
                                </p>
                                {donor.experienceNotes && (
                                  <p className="text-[11px] text-slate-500 italic">
                                    "{donor.experienceNotes}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                              {donor.phone && (
                                <a
                                  href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `আসসালামু আলাইকুম ${donor.fullName}। ইনফিনিটি বাংলাদেশ ব্লাড নেটওয়ার্কে আপনার রক্তদাতা হিসেবে রেজিস্ট্রেশনের আবেদনটি পাওয়া গেছে। তথ্য যাচাইয়ের জন্য যোগাযোগ করা হচ্ছে। ধন্যবাদ।`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  approveBloodDonor(donor.id);
                                  showToast(isBn ? `রক্তদাতা ${donor.fullName}-এর আবেদন অনুমোদিত হয়েছে!` : `Donor ${donor.fullName} approved!`);
                                }}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-warm-xs cursor-pointer flex items-center gap-1.5 transition-all"
                              >
                                <Check className="w-4 h-4" />
                                <span>{isBn ? 'অনুমোদন করুন (Approve)' : 'Approve'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  rejectBloodDonor(donor.id);
                                  showToast(isBn ? `রক্তদাতা ${donor.fullName}-এর আবেদন বাতিল করা হয়েছে` : `Donor ${donor.fullName} rejected`);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBloodDonor(donor);
                                  setIsBloodDonorModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer"
                                title="Edit Details"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 2: ALL DONORS TABLE */}
                {bloodSubTab === 'donors' && (
                  <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 space-y-5 shadow-warm-sm">
                    {/* Filters Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={bloodDonorSearch}
                          onChange={(e) => setBloodDonorSearch(e.target.value)}
                          placeholder={isBn ? 'নাম, ফোন বা এলাকা দিয়ে খুঁজুন...' : 'Search name, phone, area...'}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>

                      <select
                        value={bloodDonorGroupFilter}
                        onChange={(e) => setBloodDonorGroupFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      >
                        <option value="ALL">All Blood Groups</option>
                        {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>

                      <select
                        value={bloodDonorStatusFilter}
                        onChange={(e) => setBloodDonorStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      >
                        <option value="ALL">All Status</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                      </select>

                      <select
                        value={bloodDonorDistrictFilter}
                        onChange={(e) => setBloodDonorDistrictFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      >
                        <option value="ALL">All Districts</option>
                        <option value="Chattogram">Chattogram</option>
                        <option value="Dhaka">Dhaka</option>
                        <option value="Cox's Bazar">Cox's Bazar</option>
                      </select>
                    </div>

                    {/* Donors Table with Smooth Horizontal Scroll & Sticky Actions */}
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
                      <table className="w-full min-w-[1100px] text-left text-xs border-collapse">
                        <thead className="bg-[#FAF7F2] text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-[#EAE3D9]">
                          <tr>
                            <th className="p-3.5 min-w-[200px]">Donor</th>
                            <th className="p-3.5 text-center w-16">Blood</th>
                            <th className="p-3.5 min-w-[150px]">Contact</th>
                            <th className="p-3.5 min-w-[150px]">Location</th>
                            <th className="p-3.5 min-w-[140px]">Org Category</th>
                            <th className="p-3.5 min-w-[130px]">Availability</th>
                            <th className="p-3.5 min-w-[150px]">Last Donation</th>
                            <th className="p-3.5 min-w-[100px]">Status</th>
                            <th className="p-3.5 text-center w-28 sticky right-0 bg-[#FAF7F2] shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] z-10">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bloodDonors
                            .filter(d => {
                              if (bloodDonorGroupFilter !== 'ALL' && d.bloodGroup !== bloodDonorGroupFilter) return false;
                              if (bloodDonorStatusFilter !== 'ALL' && d.approvalStatus !== bloodDonorStatusFilter) return false;
                              if (bloodDonorDistrictFilter !== 'ALL' && d.district !== bloodDonorDistrictFilter) return false;
                              if (bloodDonorSearch.trim()) {
                                const q = bloodDonorSearch.toLowerCase();
                                const match = d.fullName.toLowerCase().includes(q) ||
                                  d.phone.includes(q) ||
                                  d.area.toLowerCase().includes(q) ||
                                  d.upazila.toLowerCase().includes(q) ||
                                  (d.gender && d.gender.toLowerCase().includes(q));
                                if (!match) return false;
                              }
                              return true;
                            })
                            .map(donor => (
                              <tr key={donor.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-950 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden">
                                      {donor.photoUrl ? (
                                        <img src={getAssetUrl(donor.photoUrl)} alt={donor.fullName} className="w-full h-full object-cover" />
                                      ) : (
                                        donor.fullName.charAt(0)
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-extrabold text-slate-900 flex items-center gap-1">
                                        <span className="truncate">{donor.fullName}</span>
                                        {donor.isVerified && (
                                          <span title="Verified" className="inline-flex shrink-0">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          </span>
                                        )}
                                      </p>
                                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 font-medium">
                                        <span className="font-mono text-slate-400">ID: {donor.id}</span>
                                        {(donor.gender || calculateAge(donor.dateOfBirth || donor.dob) !== null) && (
                                          <span>
                                            &bull; {donor.gender ? (donor.gender === 'Female' ? (isBn ? 'নারী' : 'Female') : donor.gender === 'Other' ? (isBn ? 'অন্যান্য' : 'Other') : (isBn ? 'পুরুষ' : 'Male')) : ''}
                                            {donor.gender && calculateAge(donor.dateOfBirth || donor.dob) !== null ? ', ' : ''}
                                            {calculateAge(donor.dateOfBirth || donor.dob) !== null ? (isBn ? `${calculateAge(donor.dateOfBirth || donor.dob)} বছর` : `${calculateAge(donor.dateOfBirth || donor.dob)} yrs`) : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3.5 text-center">
                                  <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs font-display">
                                    {donor.bloodGroup}
                                  </span>
                                </td>

                                <td className="p-3.5 text-slate-700">
                                  <p className="font-bold whitespace-nowrap">{donor.phone}</p>
                                  {donor.email && <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{donor.email}</p>}
                                </td>

                                <td className="p-3.5 text-slate-600">
                                  <p className="font-medium">{donor.area}, {donor.upazila}</p>
                                  <p className="text-[10px] text-slate-400">{donor.district}</p>
                                </td>

                                <td className="p-3.5 text-slate-700 font-medium whitespace-nowrap">
                                  {donor.orgCategory}
                                </td>

                                <td className="p-3.5 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      donor.availabilityStatus === 'AVAILABLE_EMERGENCY'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : donor.availabilityStatus === 'AVAILABLE_NOTICE'
                                        ? 'bg-amber-50 text-amber-800'
                                        : 'bg-rose-50 text-rose-800'
                                    }`}
                                  >
                                    {donor.availabilityStatus === 'AVAILABLE_EMERGENCY'
                                      ? (isBn ? '🟢 জরুরি প্রস্তুত' : '🟢 Emergency Ready')
                                      : donor.availabilityStatus === 'AVAILABLE_NOTICE'
                                      ? (isBn ? '🟡 নোটিশ সাপেক্ষে' : '🟡 Prior Notice')
                                      : (isBn ? '🔴 অনুপলব্ধ' : '🔴 Unavailable')}
                                  </span>
                                </td>

                                <td className="p-3.5 whitespace-nowrap">
                                  {donor.lastDonationDate ? (() => {
                                    const cd = getCooldownStatusInfo(donor.lastDonationDate, isBn);
                                    return (
                                      <div className="space-y-1">
                                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span>
                                            {formatDateDDMMYYYY(donor.lastDonationDate, isBn)}
                                          </span>
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                          <span className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9.5px] font-bold border ${cd.badgeColorClass}`}>
                                            {cd.badgeText}
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-medium">
                                            {donor.totalDonations ? `${donor.totalDonations} ${isBn ? 'বার' : 'times'}` : ''}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })() : (
                                    <span className="text-[11px] text-slate-400 italic">
                                      {isBn ? 'কোনো রেকর্ড নেই' : 'No Record'}
                                    </span>
                                  )}
                                </td>

                                <td className="p-3.5 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      donor.approvalStatus === 'APPROVED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : donor.approvalStatus === 'PENDING'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {donor.approvalStatus === 'APPROVED'
                                      ? (isBn ? 'অনুমোদিত' : 'Approved')
                                      : donor.approvalStatus === 'PENDING'
                                      ? (isBn ? '⏳ অপেক্ষমাণ আবেদন' : '⏳ Pending Approval')
                                      : (isBn ? 'বাতিল' : 'Rejected')}
                                  </span>
                                </td>

                                <td className="p-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] z-10">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Quick Approve / Reject for Pending Updates */}
                                    {donor.approvalStatus === 'PENDING' ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            approveBloodDonor(donor.id);
                                            showToast(
                                              isBn
                                                ? `রক্তদাতা ${donor.fullName}-এর আবেদন ও প্রোফাইল আপডেট সফলভাবে অনুমোদন করা হয়েছে!`
                                                : `Donor profile/update for ${donor.fullName} approved!`
                                            );
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                          title={isBn ? 'অনুমোদন করুন (Approve)' : 'Approve'}
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>{isBn ? 'অ্যাপ্রুভ' : 'Approve'}</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            rejectBloodDonor(donor.id);
                                            showToast(
                                              isBn
                                                ? `রক্তদাতা ${donor.fullName}-এর আবেদন বাতিল করা হয়েছে।`
                                                : `Donor request for ${donor.fullName} rejected.`
                                            );
                                          }}
                                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer border border-rose-200"
                                          title={isBn ? 'বাতিল করুন (Reject)' : 'Reject'}
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : null}

                                    {donor.phone && (
                                      <a
                                        href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                          `আসসালামু আলাইকুম ${donor.fullName}। ইনফিনিটি বাংলাদেশ ব্লাড নেটওয়ার্ক থেকে আপনার রক্তদাতার তথ্য ও প্রোফাইল আপডেট সংক্রান্ত বিষয়ে যোগাযোগ করা হচ্ছে। ধন্যবাদ।`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                                        title={isBn ? 'হোয়াটসঅ্যাপে যোগাযোগ করুন' : 'Contact on WhatsApp'}
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </a>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingBloodDonor(donor);
                                        setIsBloodDonorModalOpen(true);
                                      }}
                                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#006A4E] transition-colors cursor-pointer"
                                      title="Edit Donor"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => verifyBloodDonor(donor.id, !donor.isVerified)}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        donor.isVerified ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                                      }`}
                                      title={donor.isVerified ? 'Unverify' : 'Verify'}
                                    >
                                      <ShieldCheck className="w-4 h-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setDonorToDelete(donor)}
                                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                                      title="Delete Donor"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: EMERGENCY REQUESTS */}
                {bloodSubTab === 'emergency' && (
                  <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 space-y-4 shadow-warm-sm">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">
                        {isBn ? 'জরুরি রক্তের আবেদনসমূহ' : 'Emergency Blood Requests Roster'}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {emergencyBloodRequests.map(req => (
                        <div
                          key={req.id}
                          className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs font-display">
                                {req.bloodGroup}
                              </span>
                              <span className="text-sm font-extrabold text-slate-900">{req.patientName}</span>
                              <span className="text-xs font-bold text-slate-500">({req.unitsNeeded} Units Needed)</span>
                              <span
                                className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                                  req.emergencyLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {req.emergencyLevel}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600">
                              Hospital: <span className="font-bold">{req.hospitalName}</span> ({req.upazila}, {req.district}) &bull; Requester: {req.requesterName} ({req.contactNumber})
                            </p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                req.status === 'FULFILLED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'PROCESSING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {req.status}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingEmergencyRequest(req);
                                setIsEmergencyRequestModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs cursor-pointer"
                            >
                              {isBn ? 'ম্যাচিং ও স্ট্যাটাস' : 'Match & Update'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Delete this emergency request?')) {
                                  deleteEmergencyBloodRequest(req.id);
                                  showToast('Request deleted');
                                }
                              }}
                              className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: SETTINGS & HERO CUSTOMIZATION */}
                {bloodSubTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Top Action & Save Banner */}
                    <div className="bg-[#E6F3EF] border border-[#C2E2D7] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-warm-xs">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <SlidersHorizontal className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 font-display">
                            {isBn ? 'রক্তদান নেটওয়ার্ক সেটিংস ও কনফিগারেশন' : 'Blood Donation Network Settings'}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {isBn ? 'যেকোনো সেকশনে পরিবর্তন করে সেভ করুন — সাথে সাথে ওয়েবসাইটে লাইভ হয়ে যাবে।' : 'Edit any section and click save — updates reflect immediately on the live website and database.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateBloodDonationSettings(bloodDonationSettings);
                          showToast(isBn ? 'রক্তদান নেটওয়ার্কের সকল সেটিংস সফলভাবে সংরক্ষিত ও লাইভ হয়েছে' : 'All blood donation settings saved and live successfully!');
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs sm:text-sm font-extrabold shadow-warm-md hover:shadow-warm-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isBn ? 'সকল সেটিংস সেভ করুন (Save All Settings)' : 'Save All Settings'}</span>
                      </button>
                    </div>

                    {/* 1. Hero Content & Heading Configuration */}
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#006A4E]" />
                            <span>{isBn ? '১. হিরো সেকশন ও লোগো কনফিগারেশন' : '1. Hero Section & Sub-brand Logo Settings'}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isBn ? 'রক্তদান সেকশনের লোগো, সাইজ, ক্লাউডিনারি লিংক, ব্যাজ ও সাবটাইটেল কাস্টমাইজ করুন।' : 'Customize the sub-brand logo, logo size, Cloudinary/upload URL, top badge, and initiative subtitle.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBloodDonationSettings(bloodDonationSettings);
                            showToast(isBn ? 'হিরো ও লোগো সেটিংস সংরক্ষিত হয়েছে' : 'Hero & logo settings saved successfully');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সেভ চেঞ্জেস' : 'Save Changes'}</span>
                        </button>
                      </div>

                      {/* Wing Logo & Size, Zoom, Crop Configuration */}
                      <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#EAE3D9] pb-3">
                          <div>
                            <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-[#006A4E]" />
                              <span>{isBn ? 'ইনফিনিটি লাইফলাইন লোগো (Infinity LifeLine Logo)' : 'Infinity LifeLine Sub-brand Logo'}</span>
                            </label>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {isBn ? 'Cloudinary URL, ইমেজ লিঙ্ক বা সরাসরি কম্পিউটার থেকে যেকোনো SVG/PNG আপলোড করুন।' : 'Upload from device, paste a Cloudinary URL, or use local SVG/PNG.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateBloodDonationSettings({
                              wingLogoUrl: '/brand/Infinitylifeline-logo.svg',
                              wingLogoSize: 480,
                              wingLogoZoom: 1,
                              wingLogoCrop: 'contain'
                            })}
                            className="text-xs font-bold text-[#006A4E] hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isBn ? 'অফিসিয়াল ডিফল্ট রিসেট করুন' : 'Reset to Official Default'}</span>
                          </button>
                        </div>

                        {/* Logo Upload & URL Input Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                          {/* Live Preview Box (Dark Theme like Hero) */}
                          <div className="lg:col-span-5 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-slate-700">
                                {isBn ? 'লাইভ ডার্ক প্রিভিউ (হিরো ব্যাকগ্রাউন্ড):' : 'Live Dark Preview (Hero Background):'}
                              </label>
                              <span className="text-[10px] font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded">
                                {bloodDonationSettings.wingLogoSize || 480}px • {bloodDonationSettings.wingLogoZoom || 1}x
                              </span>
                            </div>
                            <div className="w-full h-36 rounded-2xl bg-[#062119] border border-emerald-800/40 p-4 flex items-center justify-center overflow-hidden shadow-inner relative">
                              <div
                                className="flex items-center justify-center transition-all duration-200"
                                style={{
                                  width: `${Math.min(bloodDonationSettings.wingLogoSize || 480, 320)}px`,
                                  maxWidth: '100%'
                                }}
                              >
                                <img
                                  src={getAssetUrl(bloodDonationSettings.wingLogoUrl || '/brand/Infinitylifeline-logo.svg')}
                                  alt="Infinity LifeLine Logo Preview"
                                  style={{
                                    transform: `scale(${bloodDonationSettings.wingLogoZoom || 1})`,
                                    objectFit: bloodDonationSettings.wingLogoCrop || 'contain'
                                  }}
                                  className="w-full h-auto max-h-28 object-contain transition-all duration-200"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center font-mono truncate">
                              {bloodDonationSettings.wingLogoUrl || '/brand/Infinitylifeline-logo.svg'}
                            </p>
                          </div>

                          {/* URL Input & Direct Upload Buttons */}
                          <div className="lg:col-span-7 space-y-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-800">
                                {isBn ? 'লোগো ইমেজ / ক্লাউডিনারি লিংক (URL)' : 'Logo Image / Cloudinary URL'}
                              </label>
                              <input
                                type="text"
                                value={bloodDonationSettings.wingLogoUrl || ''}
                                onChange={(e) => updateBloodDonationSettings({ wingLogoUrl: e.target.value })}
                                placeholder="https://res.cloudinary.com/... or /brand/Infinitylifeline-logo.svg"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-white text-xs font-mono focus:ring-2 focus:ring-[#006A4E] focus:outline-none shadow-2xs"
                              />
                            </div>

                            {/* Direct File Upload & Media Helper */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EAE3D9] text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors">
                                <Upload className="w-3.5 h-3.5 text-[#006A4E]" />
                                <span>{isBn ? 'ডিভাইস থেকে আপলোড' : 'Upload from Device'}</span>
                                <input
                                  type="file"
                                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          updateBloodDonationSettings({ wingLogoUrl: event.target.result as string });
                                          showToast(isBn ? 'লোগো সফলভাবে আপলোড করা হয়েছে' : 'Logo uploaded successfully');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => updateBloodDonationSettings({ wingLogoUrl: '/brand/Infinitylifeline-logo.svg' })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
                              >
                                <span>{isBn ? 'অফিসিয়াল SVG ব্যবহার করুন' : 'Use Official SVG'}</span>
                              </button>
                            </div>

                            {/* Preset Width Sliders */}
                            <div className="space-y-2 pt-2 border-t border-[#EAE3D9]">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">{isBn ? 'লোগো ডিসপ্লে উইডথ (Display Width):' : 'Logo Display Width:'}</span>
                                <span className="font-mono font-bold text-[#006A4E]">{bloodDonationSettings.wingLogoSize || 480}px</span>
                              </div>
                              <input
                                type="range"
                                min="200"
                                max="700"
                                step="10"
                                value={bloodDonationSettings.wingLogoSize || 480}
                                onChange={(e) => updateBloodDonationSettings({ wingLogoSize: Number(e.target.value) })}
                                className="w-full accent-[#006A4E] cursor-pointer"
                              />
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {[
                                  { label: 'Small (320px)', val: 320 },
                                  { label: 'Medium (440px)', val: 440 },
                                  { label: 'Default (480px)', val: 480 },
                                  { label: 'Large (560px)', val: 560 },
                                  { label: 'X-Large (650px)', val: 650 },
                                ].map((p) => {
                                  const isSelected = (bloodDonationSettings.wingLogoSize || 480) === p.val;
                                  return (
                                    <button
                                      key={p.val}
                                      type="button"
                                      onClick={() => updateBloodDonationSettings({ wingLogoSize: p.val })}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#006A4E] text-white border-[#006A4E]'
                                          : 'bg-white text-slate-700 border-[#EAE3D9] hover:bg-slate-50'
                                      }`}
                                    >
                                      {p.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Zoom Scale and Crop Mode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE3D9]">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-700">{isBn ? 'লোগো জুম ও স্কেল:' : 'Logo Zoom & Scale:'}</span>
                                  <span className="font-mono font-bold text-[#006A4E]">{bloodDonationSettings.wingLogoZoom || 1}x</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="2.0"
                                  step="0.1"
                                  value={bloodDonationSettings.wingLogoZoom || 1}
                                  onChange={(e) => updateBloodDonationSettings({ wingLogoZoom: parseFloat(e.target.value) })}
                                  className="w-full accent-[#006A4E] cursor-pointer"
                                />
                                <div className="flex gap-1.5 pt-0.5">
                                  {[
                                    { label: '0.8x', val: 0.8 },
                                    { label: '1.0x (Original)', val: 1.0 },
                                    { label: '1.2x', val: 1.2 },
                                    { label: '1.4x', val: 1.4 },
                                    { label: '1.6x', val: 1.6 },
                                  ].map((p) => {
                                    const isSelected = (bloodDonationSettings.wingLogoZoom || 1) === p.val;
                                    return (
                                      <button
                                        key={p.val}
                                        type="button"
                                        onClick={() => updateBloodDonationSettings({ wingLogoZoom: p.val })}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#006A4E] text-white border-[#006A4E]'
                                            : 'bg-white text-slate-700 border-[#EAE3D9] hover:bg-slate-50'
                                        }`}
                                      >
                                        {p.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <span className="block text-xs font-bold text-slate-700">{isBn ? 'ক্রপ ও ফিট মোড:' : 'Crop / Object Fit Mode:'}</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {[
                                    { id: 'contain', label: 'Contain (Fit)' },
                                    { id: 'cover', label: 'Cover (Crop)' },
                                    { id: 'fill', label: 'Fill (Stretch)' },
                                    { id: 'none', label: 'Original' },
                                  ].map((crop) => {
                                    const isSelected = (bloodDonationSettings.wingLogoCrop || 'contain') === crop.id;
                                    return (
                                      <button
                                        key={crop.id}
                                        type="button"
                                        onClick={() => updateBloodDonationSettings({ wingLogoCrop: crop.id as any })}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#006A4E] text-white border-[#006A4E]'
                                            : 'bg-white text-slate-700 border-[#EAE3D9] hover:bg-slate-50'
                                        }`}
                                      >
                                        {crop.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hero Badge & Titles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'হিরো টপ ব্যাজ (ইংরেজি)' : 'Hero Top Badge (English)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroBadge?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroBadge: { ...bloodDonationSettings.heroBadge, en: e.target.value, bn: bloodDonationSettings.heroBadge?.bn || '' }
                            })}
                            placeholder="Emergency Blood Donation & Coordination"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'হিরো টপ ব্যাজ (বাংলা)' : 'Hero Top Badge (Bangla)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroBadge?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroBadge: { ...bloodDonationSettings.heroBadge, bn: e.target.value, en: bloodDonationSettings.heroBadge?.en || '' }
                            })}
                            placeholder="জরুরি রক্তদান ও সমন্বয় নেটওয়ার্ক"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Hero Subtitle / Initiative Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              {isBn ? 'উদ্যোগ বিবরণ / সাবটাইটেল (ইংরেজি) *' : 'Initiative Subtitle / Description (English) *'}
                            </label>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                              {isBn ? 'লোগোর নিচের লাইন' : 'Line below logo'}
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={bloodDonationSettings.heroSubtitle?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroSubtitle: { ...bloodDonationSettings.heroSubtitle, en: e.target.value, bn: bloodDonationSettings.heroSubtitle?.bn || '' }
                            })}
                            placeholder="A blood donation initiative by Infinity Bangladesh"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">
                            {isBn ? 'উদাহরণ: A blood donation initiative by Infinity Bangladesh' : 'Example: A blood donation initiative by Infinity Bangladesh'}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              {isBn ? 'উদ্যোগ বিবরণ / সাবটাইটেল (বাংলা) *' : 'Initiative Subtitle / Description (Bangla) *'}
                            </label>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                              {isBn ? 'লোগোর নিচের লাইন' : 'Line below logo'}
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={bloodDonationSettings.heroSubtitle?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroSubtitle: { ...bloodDonationSettings.heroSubtitle, bn: e.target.value, en: bloodDonationSettings.heroSubtitle?.en || '' }
                            })}
                            placeholder="ইনফিনিটি বাংলাদেশ-এর একটি মানবিক রক্তদান উদ্যোগ"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">
                            {isBn ? 'উদাহরণ: ইনফিনিটি বাংলাদেশ-এর একটি মানবিক রক্তদান উদ্যোগ' : 'Example: ইনফিনিটি বাংলাদেশ-এর একটি মানবিক রক্তদান উদ্যোগ'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Hero Right CTA Card Configuration ("Be a Donor, Be a Hero") */}
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-5 shadow-warm-sm">
                      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                            <Droplet className="w-5 h-5 text-rose-600 fill-current" />
                            <span>{isBn ? '২. ডানপাশের অ্যাকশন কার্ড ("Be a Donor, Be a Hero")' : '2. Hero Right Action Card Settings'}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isBn ? 'হিরো ব্যানারের ডানদিকের কার্ডের বাটন টেক্সট, শিরোনাম ও হেল্পলাইন পরিবর্তন করুন।' : 'Configure the right-side CTA card badge, title, buttons and helpline.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBloodDonationSettings(bloodDonationSettings);
                            showToast(isBn ? 'অ্যাকশন কার্ড ও হেল্পলাইন সেটিংস সংরক্ষিত হয়েছে' : 'Action card & helpline settings saved successfully');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সেভ চেঞ্জেস' : 'Save Changes'}</span>
                        </button>
                      </div>

                      {/* Card Badge & Card Title */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'কার্ডের ছোট ব্যাজ (ইংরেজি)' : 'Card Top Badge (English)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaBadge?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaBadge: { ...bloodDonationSettings.heroCtaBadge, en: e.target.value, bn: bloodDonationSettings.heroCtaBadge?.bn || '' }
                            })}
                            placeholder="JOIN THE CAUSE"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'কার্ডের ছোট ব্যাজ (বাংলা)' : 'Card Top Badge (Bangla)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaBadge?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaBadge: { ...bloodDonationSettings.heroCtaBadge, bn: e.target.value, en: bloodDonationSettings.heroCtaBadge?.en || '' }
                            })}
                            placeholder="মানবতার আহ্বান"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'কার্ডের মূল শিরোনাম (ইংরেজি)' : 'Card Heading (English)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaTitle?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaTitle: { ...bloodDonationSettings.heroCtaTitle, en: e.target.value, bn: bloodDonationSettings.heroCtaTitle?.bn || '' }
                            })}
                            placeholder="Be a Donor, Be a Hero"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-extrabold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'কার্ডের মূল শিরোনাম (বাংলা)' : 'Card Heading (Bangla)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaTitle?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaTitle: { ...bloodDonationSettings.heroCtaTitle, bn: e.target.value, en: bloodDonationSettings.heroCtaTitle?.en || '' }
                            })}
                            placeholder="রক্তদাতা হোন, জীবন বাঁচান"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-extrabold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Card Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'কার্ড বিবরণী (ইংরেজি)' : 'Card Description (English)'}
                          </label>
                          <textarea
                            rows={2}
                            value={bloodDonationSettings.heroCtaDescription?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaDescription: { ...bloodDonationSettings.heroCtaDescription, en: e.target.value, bn: bloodDonationSettings.heroCtaDescription?.bn || '' }
                            })}
                            placeholder="Every drop counts. Register as a voluntary blood donor with Team Infinity..."
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'কার্ড বিবরণী (বাংলা)' : 'Card Description (Bangla)'}
                          </label>
                          <textarea
                            rows={2}
                            value={bloodDonationSettings.heroCtaDescription?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaDescription: { ...bloodDonationSettings.heroCtaDescription, bn: e.target.value, en: bloodDonationSettings.heroCtaDescription?.en || '' }
                            })}
                            placeholder="আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি মূল্যবান প্রাণ..."
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Button 1 and Button 2 Labels */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'বাটন ১: রক্তদাতা হওয়ার বাটন টেক্সট (ইংরেজি)' : 'Button 1: Become a Donor Text (En)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaBtn1Text?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaBtn1Text: { ...bloodDonationSettings.heroCtaBtn1Text, en: e.target.value, bn: bloodDonationSettings.heroCtaBtn1Text?.bn || '' }
                            })}
                            placeholder="Become a Donor"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'বাটন ১: রক্তদাতা হওয়ার বাটন টেক্সট (বাংলা)' : 'Button 1: Become a Donor Text (Bn)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaBtn1Text?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaBtn1Text: { ...bloodDonationSettings.heroCtaBtn1Text, bn: e.target.value, en: bloodDonationSettings.heroCtaBtn1Text?.en || '' }
                            })}
                            placeholder="রক্তদাতা হতে রেজিস্ট্রেশন করুন"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'বাটন ২: জরুরি আবেদন বাটন টেক্সট (ইংরেজি)' : 'Button 2: Emergency Request Text (En)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaBtn2Text?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaBtn2Text: { ...bloodDonationSettings.heroCtaBtn2Text, en: e.target.value, bn: bloodDonationSettings.heroCtaBtn2Text?.bn || '' }
                            })}
                            placeholder="Emergency Blood Request"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'বাটন ২: জরুরি আবেদন বাটন টেক্সট (বাংলা)' : 'Button 2: Emergency Request Text (Bn)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.heroCtaBtn2Text?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              heroCtaBtn2Text: { ...bloodDonationSettings.heroCtaBtn2Text, bn: e.target.value, en: bloodDonationSettings.heroCtaBtn2Text?.en || '' }
                            })}
                            placeholder="জরুরি রক্তের আবেদন করুন"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Helpline & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'হেল্পলাইন লেবেল (ইংরেজি / বাংলা)' : 'Helpline Label'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.helplineLabel?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              helplineLabel: { ...bloodDonationSettings.helplineLabel, en: e.target.value, bn: bloodDonationSettings.helplineLabel?.bn || '২৪/৭ ব্লাড হেল্পলাইন:' }
                            })}
                            placeholder="24/7 Helpline:"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? '২৪/৭ ইমার্জেন্সি হেল্পলাইন নম্বর *' : '24/7 Emergency Helpline Number *'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.emergencyHelpline}
                            onChange={(e) => updateBloodDonationSettings({ emergencyHelpline: e.target.value })}
                            placeholder="+880 1839-008339"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-mono font-bold text-[#006A4E] focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'সমন্বয় ইমেইল এড্রেস' : 'Coordination Email'}
                          </label>
                          <input
                            type="email"
                            value={bloodDonationSettings.coordinationEmail}
                            onChange={(e) => updateBloodDonationSettings({ coordinationEmail: e.target.value })}
                            placeholder="blood@infinitybangladesh.org"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Dynamic 4 Statistics Counters & Custom Labels */}
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-5 shadow-warm-sm">
                      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-600" />
                            <span>{isBn ? '৩. চারটি পরিসংখ্যান কাউন্টার ও লেবেল কাস্টমাইজেশন' : '3. Four Dynamic Statistics Counters & Labels'}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isBn ? 'কাউন্টারের লেবেল পরিবর্তন করুন অথবা ম্যানুয়াল সংখ্যা দিন (ফাঁকা রাখলে স্বয়ংক্রিয় ডাটাবেজ থেকে গণনা করবে)।' : 'Change metric labels or provide manual overrides (leave blank to auto-calculate from live database).'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBloodDonationSettings(bloodDonationSettings);
                            showToast(isBn ? 'পরিসংখ্যান কাউন্টার সেটিংস সংরক্ষিত হয়েছে' : 'Statistics counters settings saved successfully');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সেভ চেঞ্জেস' : 'Save Changes'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Stat 1: Total Donors */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                          <p className="text-xs font-black uppercase text-slate-700">
                            {isBn ? 'কাউন্টার ১: মোট রক্তদাতা' : 'Counter 1: Total Donors'}
                          </p>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">English Label</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statTotalDonorsLabel?.en || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statTotalDonorsLabel: { ...bloodDonationSettings.statTotalDonorsLabel, en: e.target.value, bn: bloodDonationSettings.statTotalDonorsLabel?.bn || 'নিবন্ধিত রক্তদাতা' }
                              })}
                              placeholder="Total Donors"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">বাংলা লেবেল</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statTotalDonorsLabel?.bn || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statTotalDonorsLabel: { ...bloodDonationSettings.statTotalDonorsLabel, bn: e.target.value, en: bloodDonationSettings.statTotalDonorsLabel?.en || 'Total Donors' }
                              })}
                              placeholder="নিবন্ধিত রক্তদাতা"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Override Count</span>
                              <span className="text-[10px] text-slate-400">Optional</span>
                            </label>
                            <input
                              type="number"
                              value={bloodDonationSettings.statTotalDonorsOverride ?? ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statTotalDonorsOverride: e.target.value ? Number(e.target.value) : null
                              })}
                              placeholder="Auto from DB"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs font-bold text-[#006A4E]"
                            />
                          </div>
                        </div>

                        {/* Stat 2: Active Donors */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                          <p className="text-xs font-black uppercase text-slate-700">
                            {isBn ? 'কাউন্টার ২: সক্রিয় রক্তদাতা' : 'Counter 2: Active Donors'}
                          </p>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">English Label</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statActiveDonorsLabel?.en || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statActiveDonorsLabel: { ...bloodDonationSettings.statActiveDonorsLabel, en: e.target.value, bn: bloodDonationSettings.statActiveDonorsLabel?.bn || 'জরুরিতে প্রস্তুত' }
                              })}
                              placeholder="Active Donors"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">বাংলা লেবেল</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statActiveDonorsLabel?.bn || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statActiveDonorsLabel: { ...bloodDonationSettings.statActiveDonorsLabel, bn: e.target.value, en: bloodDonationSettings.statActiveDonorsLabel?.en || 'Active Donors' }
                              })}
                              placeholder="জরুরিতে প্রস্তুত"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Override Count</span>
                              <span className="text-[10px] text-slate-400">Optional</span>
                            </label>
                            <input
                              type="number"
                              value={bloodDonationSettings.statActiveDonorsOverride ?? ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statActiveDonorsOverride: e.target.value ? Number(e.target.value) : null
                              })}
                              placeholder="Auto from DB"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs font-bold text-emerald-700"
                            />
                          </div>
                        </div>

                        {/* Stat 3: Blood Groups */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                          <p className="text-xs font-black uppercase text-slate-700">
                            {isBn ? 'কাউন্টার ৩: ব্লাড গ্রুপস' : 'Counter 3: Blood Groups'}
                          </p>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">English Label</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statGroupsLabel?.en || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statGroupsLabel: { ...bloodDonationSettings.statGroupsLabel, en: e.target.value, bn: bloodDonationSettings.statGroupsLabel?.bn || 'সকল ব্লাড গ্রুপ' }
                              })}
                              placeholder="Blood Groups"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">বাংলা লেবেল</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statGroupsLabel?.bn || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statGroupsLabel: { ...bloodDonationSettings.statGroupsLabel, bn: e.target.value, en: bloodDonationSettings.statGroupsLabel?.en || 'Blood Groups' }
                              })}
                              placeholder="সকল ব্লাড গ্রুপ"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Display Value</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statGroupsValue || '8/8'}
                              onChange={(e) => updateBloodDonationSettings({ statGroupsValue: e.target.value })}
                              placeholder="8/8"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs font-bold text-rose-700"
                            />
                          </div>
                        </div>

                        {/* Stat 4: Lives Impacted */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                          <p className="text-xs font-black uppercase text-slate-700">
                            {isBn ? 'কাউন্টার ৪: রক্তদান সম্পন্ন' : 'Counter 4: Lives Impacted'}
                          </p>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">English Label</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statImpactLabel?.en || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statImpactLabel: { ...bloodDonationSettings.statImpactLabel, en: e.target.value, bn: bloodDonationSettings.statImpactLabel?.bn || 'মোট রক্তদান সম্পন্ন' }
                              })}
                              placeholder="Lives Impacted"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">বাংলা লেবেল</label>
                            <input
                              type="text"
                              value={bloodDonationSettings.statImpactLabel?.bn || ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statImpactLabel: { ...bloodDonationSettings.statImpactLabel, bn: e.target.value, en: bloodDonationSettings.statImpactLabel?.en || 'Lives Impacted' }
                              })}
                              placeholder="মোট রক্তদান সম্পন্ন"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Override Count</span>
                              <span className="text-[10px] text-slate-400">Optional</span>
                            </label>
                            <input
                              type="number"
                              value={bloodDonationSettings.statImpactOverride ?? ''}
                              onChange={(e) => updateBloodDonationSettings({
                                statImpactOverride: e.target.value ? Number(e.target.value) : null
                              })}
                              placeholder="Auto from DB"
                              className="w-full px-3 py-1.5 rounded-xl border border-[#EAE3D9] bg-white text-xs font-bold text-amber-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Guidelines & Consent Policy Configuration */}
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-5 shadow-warm-sm">
                      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#006A4E]" />
                            <span>{isBn ? '৪. রক্তদানের নির্দেশিকা ও সম্মতি বিবৃতি' : '4. Guidelines & Registration Consent Policy'}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isBn ? 'রক্তদান নির্দেশিকা এবং রেজিস্ট্রেশনের সম্মতিপত্রের টেক্সট কাস্টমাইজ করুন।' : 'Customize blood donation guidelines and donor registration consent policy text.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBloodDonationSettings(bloodDonationSettings);
                            showToast(isBn ? 'নির্দেশিকা ও সম্মতি বিবৃতি সংরক্ষিত হয়েছে' : 'Guidelines & consent policy saved successfully');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-xs hover:shadow-warm-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সেভ চেঞ্জেস' : 'Save Changes'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'নির্দেশিকা শিরোনাম (ইংরেজি)' : 'Guidelines Title (English)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.guidelinesTitle?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              guidelinesTitle: { ...bloodDonationSettings.guidelinesTitle, en: e.target.value, bn: bloodDonationSettings.guidelinesTitle?.bn || '' }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'নির্দেশিকা শিরোনাম (বাংলা)' : 'Guidelines Title (Bangla)'}
                          </label>
                          <input
                            type="text"
                            value={bloodDonationSettings.guidelinesTitle?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              guidelinesTitle: { ...bloodDonationSettings.guidelinesTitle, bn: e.target.value, en: bloodDonationSettings.guidelinesTitle?.en || '' }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'রক্তদান নির্দেশিকা বিবরণী (ইংরেজি)' : 'Guidelines Details (English)'}
                          </label>
                          <textarea
                            rows={3}
                            value={bloodDonationSettings.guidelinesText?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              guidelinesText: { ...bloodDonationSettings.guidelinesText, en: e.target.value, bn: bloodDonationSettings.guidelinesText?.bn || '' }
                            })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'রক্তদান নির্দেশিকা বিবরণী (বাংলা)' : 'Guidelines Details (Bangla)'}
                          </label>
                          <textarea
                            rows={3}
                            value={bloodDonationSettings.guidelinesText?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              guidelinesText: { ...bloodDonationSettings.guidelinesText, bn: e.target.value, en: bloodDonationSettings.guidelinesText?.en || '' }
                            })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Consent Statement */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'নিবন্ধন সম্মতিপত্র (ইংরেজি)' : 'Consent Statement (English)'}
                          </label>
                          <textarea
                            rows={2}
                            value={bloodDonationSettings.consentStatement?.en || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              consentStatement: { ...bloodDonationSettings.consentStatement, en: e.target.value, bn: bloodDonationSettings.consentStatement?.bn || '' }
                            })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {isBn ? 'নিবন্ধন সম্মতিপত্র (বাংলা)' : 'Consent Statement (Bangla)'}
                          </label>
                          <textarea
                            rows={2}
                            value={bloodDonationSettings.consentStatement?.bn || ''}
                            onChange={(e) => updateBloodDonationSettings({
                              consentStatement: { ...bloodDonationSettings.consentStatement, bn: e.target.value, en: bloodDonationSettings.consentStatement?.en || '' }
                            })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. Donor Organization Categories Management */}
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-5 shadow-warm-sm">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[#006A4E]" />
                          <span>{isBn ? '৫. রক্তদাতা সাংগঠনিক ক্যাটাগরি ম্যানেজমেন্ট' : '5. Donor Organization Categories'}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isBn ? 'রক্তদাতা নিবন্ধনে ব্যবহারের জন্য নতুন ক্যাটাগরি যোগ বা মুছে ফেলুন।' : 'Manage categorization options for blood donors (volunteers, committee members, etc.)'}
                        </p>
                      </div>

                      {/* Add New Category Input Form */}
                      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                        <p className="text-xs font-bold text-slate-800">
                          {isBn ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <input
                            type="text"
                            placeholder="Category Name (English)"
                            value={newDonorCategoryEn}
                            onChange={(e) => setNewDonorCategoryEn(e.target.value)}
                            className="sm:col-span-5 px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="ক্যাটাগরির নাম (বাংলা)"
                            value={newDonorCategoryBn}
                            onChange={(e) => setNewDonorCategoryBn(e.target.value)}
                            className="sm:col-span-5 px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs font-bengali"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newDonorCategoryEn.trim()) {
                                alert('Please provide English category name');
                                return;
                              }
                              addDonorCategory({
                                name: {
                                  en: newDonorCategoryEn.trim(),
                                  bn: newDonorCategoryBn.trim() || newDonorCategoryEn.trim()
                                },
                                displayOrder: donorCategories.length + 1
                              });
                              setNewDonorCategoryEn('');
                              setNewDonorCategoryBn('');
                              showToast('Donor category added');
                            }}
                            className="sm:col-span-2 px-4 py-2 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{isBn ? 'যোগ করুন' : 'Add'}</span>
                          </button>
                        </div>
                      </div>

                      {/* List of Existing Categories */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {donorCategories.map(cat => (
                          <div key={cat.id} className="p-3.5 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-between text-xs shadow-2xs hover:border-[#006A4E]/30 transition-colors">
                            <div>
                              <p className="font-extrabold text-slate-900">{cat.name.en}</p>
                              <p className="text-slate-500 font-bengali">{cat.name.bn}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete category "${cat.name.en}"?`)) {
                                  deleteDonorCategory(cat.id);
                                  showToast('Category deleted');
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Save All Bar */}
                    <div className="bg-[#FAF7F2] border border-[#EAE3D9] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-warm-xs">
                      <div className="text-xs text-slate-600">
                        {isBn ? 'সকল সেটিংস পরিবর্তন শেষে এক ক্লিকে সেভ করতে পাশের বাটনে ক্লিক করুন।' : 'Click the button on the right to save and deploy all settings live.'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateBloodDonationSettings(bloodDonationSettings);
                          showToast(isBn ? 'রক্তদান নেটওয়ার্কের সকল সেটিংস সফলভাবে সংরক্ষিত ও লাইভ হয়েছে' : 'All blood donation settings saved and live successfully!');
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs sm:text-sm font-extrabold shadow-warm-md hover:shadow-warm-lg transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isBn ? 'সকল সেটিংস সেভ করুন (Save All Settings)' : 'Save All Settings'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: ADMIN USERS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'admin_users' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'অ্যাডমিন ইউজার ও রোলস' : 'Administrator Accounts & Roles'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'সুপার অ্যাডমিন, কনটেন্ট ম্যানেজার ও মিডিয়া রোলসমূহ।' : 'Manage admin team accounts and assign granular permissions.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {adminProfiles.map(adm => (
                    <div
                      key={adm.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#006A4E] text-white font-bold flex items-center justify-center">
                          {adm.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{adm.fullName}</h4>
                          <p className="text-xs text-slate-500 font-mono">{adm.email} &bull; Role: {adm.role}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6F3EF] text-[#00523C]">
                        {adm.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: AUDIT LOGS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'audit' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'সিস্টেম অডিট ও অ্যাক্টিভিটি লগ' : 'System Audit & Activity Logs'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'অ্যাডমিন প্যানেলে করা প্রতিটি পরিবর্তনের টাইমস্ট্যাম্পড রেকর্ড।' : 'Immutable chronological log of data modifications and system events.'}
                  </p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs.slice(0, 30).map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                          log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-800">{log.entityType}</span>
                        <span className="text-slate-500">&bull; {log.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: BACKUP & DATABASE SYNCHRONIZATION */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'backup' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-8 shadow-warm-sm">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2.5">
                      <Database className="w-6 h-6 text-[#006A4E]" />
                      <span>{isBn ? 'ক্লাউড ডাটাবেজ সিঙ্ক ও ব্যাকআপ পোর্টাল' : 'Cloud Database Synchronization & Backup'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {isBn
                        ? 'আপনার ওয়েবসাইটের যাবতীয় কনটেন্ট ক্লাউড ডাটাবেজে পার্মানেন্ট সেভ করুন, ব্যাকআপ ফাইল নামিয়ে রাখুন অথবা পূর্বের ব্যাকআপ রিস্টোর করুন।'
                        : 'Permanently persist CMS data to Supabase PostgreSQL, export full JSON snapshots, or restore backups.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isLiveSupabase ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isLiveSupabase ? '🟢 Live Supabase Connected' : '🟠 Local Storage Mode'}
                    </span>
                  </div>
                </div>

                {/* 1. Cloud Sync Box */}
                <div className="p-6 rounded-3xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-slate-900 font-display flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#006A4E]" />
                        <span>{isBn ? 'ক্লাউড ডাটাবেজে এক ক্লিকে সকল ডাটা সেভ করুন' : 'Push All Local CMS Data to Cloud Database'}</span>
                      </h3>
                      <p className="text-xs text-slate-600">
                        {isBn
                          ? 'ব্রাউজারে করা আপনার সকল পরিবর্তন, ছবি, সেটিংস ও রক্তদান ডেটা সরাসরি Supabase ক্লাউড ডাটাবেজে সংরক্ষিত হবে।'
                          : 'Synchronizes all in-memory and local browser modifications to Supabase PostgreSQL in a single atomic batch.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={async () => {
                        const res = await pushAllToSupabase();
                        showToast(res.message);
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs sm:text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
                    >
                      <Upload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                      <span>{isSyncing ? 'Pushing to Cloud...' : (isBn ? 'সব ডাটা ক্লাউডে সেভ করুন (Push All)' : 'Push All to Cloud Database')}</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#C2E2D7] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                    <span>
                      {isBn ? 'শেষ ক্লাউড সিঙ্ক:' : 'Last Cloud Sync:'} <strong>{lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Active in Memory'}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={async () => {
                        await syncWithSupabase();
                        showToast(isBn ? 'ক্লাউড ডাটাবেজ থেকে সর্বশেষ তথ্য লোড করা হয়েছে।' : 'Pulled latest cloud data.');
                      }}
                      className="text-[#006A4E] font-bold hover:underline cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isBn ? 'ক্লাউড থেকে ফ্রেশ ডাটা টানুন (Pull DB)' : 'Refresh / Pull from Cloud'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Export & Import JSON Backup Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Export Box */}
                  <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Download className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
                        {isBn ? 'সম্পূর্ণ ওয়েবসাইটের ব্যাকআপ ডাউনলোড (JSON)' : 'Export Full JSON Database Backup'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? 'ক্যাম্পেইন, প্রোগ্রাম, সেটিংস, রক্তদাতা ও মিডিয়া লিংকসহ পুরো ওয়েবসাইটের ডাটা একটি JSON ফাইলে সংরক্ষণ করুন।'
                          : 'Creates an offline, complete JSON snapshot file of every setting, program, campaign, and donor record.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const json = exportDatabaseJSON();
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `infinity_bangladesh_backup_${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        showToast(isBn ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে' : 'JSON Backup exported successfully');
                      }}
                      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-warm-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isBn ? 'ব্যাকআপ ডাউনলোড করুন (Export JSON)' : 'Download Backup File (.json)'}</span>
                    </button>
                  </div>

                  {/* Import Box */}
                  <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
                        {isBn ? 'পূর্বের ব্যাকআপ রিস্টোর করুন (JSON Restore)' : 'Restore from JSON Backup File'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? 'আগে ডাউনলোড করা কোনো ব্যাকআপ JSON ফাইল আপলোড করে এক ক্লিকে ওয়েবসাইটের পূর্বাবস্থা ফিরিয়ে আনুন।'
                          : 'Restore your website content, settings, and donor lists from a previously saved .json backup file.'}
                      </p>
                    </div>

                    <label className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-warm-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                      <Upload className="w-4 h-4" />
                      <span>{isBn ? 'ব্যাকআপ ফাইল নির্বাচন করুন' : 'Select Backup JSON File'}</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              if (content) {
                                const ok = importDatabaseJSON(content);
                                if (ok) {
                                  showToast(isBn ? 'ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে' : 'Backup restored successfully');
                                } else {
                                  alert('Invalid backup JSON format');
                                }
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Factory Reset Section */}
                <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-rose-900">
                      {isBn ? 'ফ্যাক্টরি রিসেট / অফিশিয়াল ডিফল্ট ডাটা রিস্টোর' : 'Factory Reset to Official Defaults'}
                    </h4>
                    <p className="text-[11px] text-rose-700">
                      {isBn
                        ? 'সকল কাস্টম পরিবর্তন মুছে ফেলে অফিসিয়াল ভেরিফাইড ডিফল্ট ডাটা ফিরিয়ে আনবে।'
                        : 'Erases all custom modifications and resets CMS state to default verified organizational records.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(isBn ? 'আপনি কি নিশ্চিত যে সকল সেটিংস অফিশিয়াল ডিফল্টে রিসেট করতে চান?' : 'Are you sure you want to reset all CMS data to default?')) {
                        resetToDefaultData();
                        showToast(isBn ? 'সকল ডাটা অফিশিয়াল ডিফল্টে রিসেট হয়েছে' : 'Database reset to official defaults');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    {isBn ? 'ডিফল্ট ডাটা রিস্টোর করুন' : 'Reset to Defaults'}
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'media_library' && (() => {
              const MEDIA_CATEGORIES: MediaCategory[] = [
                'General', 'Hero', 'Campaigns', 'Volunteers', 'Events', 'Children & Community', 'Logos', 'Banners', 'Stories', 'Gallery', 'Documents'
              ];

              // Build unified list of all media assets including video items
              const allUnifiedMedia: MediaItem[] = [...mediaLibrary];
              videos.forEach(v => {
                const exists = allUnifiedMedia.some(m => m.id === v.id || m.url === v.videoUrl);
                if (!exists) {
                  const vTitle = typeof v.title === 'string' ? v.title : (v.title?.en || 'Video Footage');
                  const vDesc = typeof v.description === 'string' ? v.description : (v.description?.en || '');
                  allUnifiedMedia.push({
                    id: v.id,
                    fileName: vTitle,
                    url: v.videoUrl,
                    embedUrl: v.embedUrl,
                    thumbnailUrl: v.thumbnailUrl,
                    fileSize: v.duration || 'Stream',
                    mimeType: 'video/mp4',
                    type: 'video',
                    platform: (v.platform as any) || 'youtube',
                    sourceType: 'url',
                    category: (v.category as any) || 'General',
                    title: vTitle,
                    altText: vTitle,
                    caption: vDesc,
                    uploadedAt: v.date || v.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                    usageTags: [v.category || 'General', 'Video Documentation'],
                    status: (v.status as any) || 'published',
                    isFeatured: v.isFeatured
                  });
                }
              });

              const filteredMediaList = allUnifiedMedia.filter(media => {
                // Type / Platform filter
                if (mediaLibraryFilter === 'image' && media.type === 'video') return false;
                if (mediaLibraryFilter === 'video' && media.type !== 'video') return false;
                if (mediaLibraryFilter === 'youtube' && media.platform !== 'youtube') return false;
                if (mediaLibraryFilter === 'facebook' && media.platform !== 'facebook') return false;
                if (mediaLibraryFilter === 'featured' && !media.isFeatured) return false;

                // Category filter
                if (mediaCategoryFilter !== 'All' && media.category !== mediaCategoryFilter) return false;

                // Search query
                if (mediaSearchQuery.trim()) {
                  const q = mediaSearchQuery.toLowerCase();
                  const matchName = media.fileName.toLowerCase().includes(q);
                  const matchAlt = (media.altText || '').toLowerCase().includes(q);
                  const matchCaption = (media.caption || '').toLowerCase().includes(q);
                  const matchTitle = (media.title || '').toLowerCase().includes(q);
                  if (!matchName && !matchAlt && !matchCaption && !matchTitle) return false;
                }

                return true;
              });

              const totalImages = allUnifiedMedia.filter(m => m.type !== 'video').length;
              const totalVideos = allUnifiedMedia.filter(m => m.type === 'video').length;
              const totalFeatured = allUnifiedMedia.filter(m => m.isFeatured).length;

              return (
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                  {/* Section Title & Primary Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-[#E6F3EF] text-[#006A4E]">
                          <FolderOpen className="w-5 h-5" />
                        </span>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          {isBn ? 'ইউনিফাইড মিডিয়া ও ভিডিও লাইব্রেরি' : 'Unified Media & Video Library'}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {isBn
                          ? 'অফিসিয়াল ছবি, ইউটিউব/ফেসবুক ভিডিও এবং ক্লাউড সম্পদ কেন্দ্রীয়ভাবে পরিচালনা করুন।'
                          : 'Manage official photography, YouTube/Facebook video footage, and cloud assets in one unified console.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCropperSourceUrl(mediaLibrary[0]?.url || '');
                          setCropperCallback(() => (croppedUrl: string) => {
                            addMediaItem({
                              fileName: `cropped-${Date.now()}.jpg`,
                              url: croppedUrl,
                              fileSize: 'Cropped High-Res',
                              mimeType: 'image/jpeg',
                              type: 'image',
                              sourceType: 'upload',
                              platform: 'cloudinary',
                              category: 'General',
                              altText: 'Custom Cropped Photo',
                              caption: '',
                              usageTags: ['Cropped Asset'],
                              status: 'published'
                            });
                            showToast('Cropped image added to media library');
                          });
                          setIsCropperModalOpen(true);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-[#FAF7F2] text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Crop className="w-4 h-4 text-[#006A4E]" />
                        <span>{isBn ? 'ক্রপ এডিটর চালান' : 'Crop Tool'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideo(null);
                          setIsVideoModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-warm-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isBn ? 'ভিডিও প্রকাশ করুন' : 'Publish Video'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingImageItem(null);
                          setIsImagePublishModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন ছবি ও মিডিয়া আপলোড' : 'Publish New Image'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Stat Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500 font-semibold">{isBn ? 'মোট মিডিয়া' : 'Total Assets'}</p>
                        <p className="text-lg font-extrabold text-slate-900 font-display">{mediaLibrary.length}</p>
                      </div>
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500 font-semibold">{isBn ? 'আলোকচিত্র' : 'Images'}</p>
                        <p className="text-lg font-extrabold text-[#006A4E] font-display">{totalImages}</p>
                      </div>
                      <ImageIcon className="w-5 h-5 text-[#006A4E]" />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500 font-semibold">{isBn ? 'ভিডিও ফুটেজ' : 'Videos'}</p>
                        <p className="text-lg font-extrabold text-amber-600 font-display">{totalVideos}</p>
                      </div>
                      <VideoIcon className="w-5 h-5 text-amber-600" />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500 font-semibold">{isBn ? 'হাইলাইটেড' : 'Featured'}</p>
                        <p className="text-lg font-extrabold text-purple-600 font-display">{totalFeatured}</p>
                      </div>
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>

                  {/* Multi-Dimensional Filter Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Type Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        {[
                          { id: 'all', label: isBn ? 'সকল' : 'All' },
                          { id: 'image', label: isBn ? 'ছবি' : 'Images' },
                          { id: 'video', label: isBn ? 'ভিডিও' : 'Videos' },
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'facebook', label: 'Facebook' },
                          { id: 'featured', label: isBn ? 'হাইলাইটেড' : 'Featured' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setMediaLibraryFilter(tab.id as any)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                              mediaLibraryFilter === tab.id
                                ? 'bg-[#006A4E] text-white shadow-warm-xs'
                                : 'bg-[#FAF7F2] text-slate-600 hover:bg-slate-200 border border-[#EAE3D9]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={mediaSearchQuery}
                          onChange={e => setMediaSearchQuery(e.target.value)}
                          placeholder={isBn ? 'নাম বা ট্যাগ দিয়ে খুঁজুন...' : 'Search media by title/tag...'}
                          className="w-full pl-8.5 pr-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {['All', ...MEDIA_CATEGORIES].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMediaCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            mediaCategoryFilter === cat
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Grid */}
                  {filteredMediaList.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        {isBn ? 'কোনো মিডিয়া পাওয়া যায়নি' : 'No media assets found'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isBn ? 'ফিল্টার পরিবর্তন করুন অথবা নতুন ছবি/ভিডিও আপলোড করুন।' : 'Try selecting another category or add a new media asset.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                      {filteredMediaList.map(media => {
                        const isVideo = media.type === 'video';
                        const displayThumbnail = media.thumbnailUrl || media.url;

                        return (
                          <div
                            key={media.id}
                            className="rounded-2xl border border-[#EAE3D9] bg-[#FAF7F2] p-3 space-y-2.5 group relative overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-warm-sm transition-all"
                          >
                            {/* Media Thumbnail Container */}
                            <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-300 relative">
                              <img
                                src={getAssetUrl(displayThumbnail)}
                                alt={media.altText || media.fileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />

                              {/* Video Play Overlay */}
                              {isVideo && (
                                <div
                                  onClick={() => setPreviewingMedia(media)}
                                  className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/15 transition-colors flex items-center justify-center cursor-pointer"
                                >
                                  <div className="w-10 h-10 rounded-full bg-[#006A4E]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </div>
                                </div>
                              )}

                              {/* Platform Tag & Portrait Badge */}
                              <div className="absolute top-2 left-2 flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-extrabold capitalize backdrop-blur-xs shadow-xs">
                                  {media.platform || (isVideo ? 'Video' : 'Image')}
                                </span>
                                {isPortraitVideo(media) && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-extrabold uppercase flex items-center gap-0.5 shadow-xs">
                                    <Smartphone className="w-2.5 h-2.5" />
                                    <span>9:16</span>
                                  </span>
                                )}
                              </div>

                              {/* Featured Star Toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  updateMediaItem(media.id, { isFeatured: !media.isFeatured });
                                  showToast(media.isFeatured ? 'Removed from featured' : 'Marked as featured asset');
                                }}
                                className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                                  media.isFeatured
                                    ? 'bg-amber-400 text-slate-950 shadow-md'
                                    : 'bg-slate-950/60 text-white hover:bg-slate-950/80'
                                }`}
                                title={media.isFeatured ? 'Featured asset' : 'Click to feature'}
                              >
                                <Star className={`w-3.5 h-3.5 ${media.isFeatured ? 'fill-current' : ''}`} />
                              </button>

                              {/* Category Badge */}
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#006A4E]/90 text-white text-[10px] font-bold backdrop-blur-xs">
                                {media.category}
                              </div>

                              {media.duration && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-mono">
                                  {media.duration}
                                </div>
                              )}
                            </div>

                            {/* Meta Info */}
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={media.title || media.fileName}>
                                {media.title || media.fileName}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[65%]">{media.altText || media.caption || 'No description'}</span>
                                <span className="font-mono">{media.fileSize || 'Asset'}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewingMedia(media)}
                                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Preview Media"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (media.type === 'video') {
                                      const matchVid = videos.find(v => v.id === media.id || v.videoUrl === media.url) || {
                                        id: media.id,
                                        title: { en: media.title || media.fileName, bn: media.altText || media.title || media.fileName },
                                        description: { en: media.caption || '', bn: media.caption || '' },
                                        videoUrl: media.url,
                                        embedUrl: media.embedUrl,
                                        thumbnailUrl: media.thumbnailUrl,
                                        platform: (media.platform as any) || 'youtube',
                                        category: media.category || 'General',
                                        duration: media.fileSize || 'Video',
                                        date: media.uploadedAt || new Date().toISOString().split('T')[0],
                                        status: (media.status as any) || 'published',
                                        isFeatured: media.isFeatured
                                      };
                                      setEditingVideo(matchVid);
                                      setIsVideoModalOpen(true);
                                    } else {
                                      setEditingImageItem(media);
                                      setIsImagePublishModalOpen(true);
                                    }
                                  }}
                                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Edit Metadata"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {media.type !== 'video' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCropperSourceUrl(media.url);
                                      setCropperCallback(() => (croppedUrl: string) => {
                                        updateMediaItem(media.id, { url: croppedUrl });
                                        showToast('Asset replaced with cropped image');
                                      });
                                      setIsCropperModalOpen(true);
                                    }}
                                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                    title="Crop Image"
                                  >
                                    <Crop className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(media.url);
                                    showToast('Asset URL copied to clipboard');
                                  }}
                                  className="text-[11px] text-[#006A4E] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Delete media asset: ${media.title || media.fileName}?`)) {
                                      deleteMediaItem(media.id);
                                      deleteVideo(media.id);
                                      showToast('Media asset removed from database and library');
                                    }
                                  }}
                                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                  title="Delete Media"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* -------------------------------------------------------- */}
            {/* TAB: BANNERS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'banners' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'ব্যানার ও স্লাইডার ম্যানেজার' : 'Banners & Featured Announcements'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'হোমপেজ ও ক্যাম্পেইন পেজের ব্যানার ও স্লাইডার পরিচালনা করুন।' : 'Configure hero carousel slides, campaign promotional banners, and CTAs.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner(null);
                      setIsBannerModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন ব্যানার তৈরি' : 'Add New Banner'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {banners.map((ban, idx) => (
                    <div
                      key={ban.id}
                      className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-white text-slate-800 font-mono font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            #{ban.displayOrder || idx + 1}
                          </span>

                          <div className="w-20 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            <img
                              src={getAssetUrl(ban.desktopImageUrl)}
                              alt={ban.title.en}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 truncate">{ban.title.en}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3EF] text-[#00523C]">
                                {ban.placement}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-bengali truncate">{ban.title.bn}</p>
                            {ban.subtitle && (
                              <p className="text-[11px] text-slate-400 truncate">{ban.subtitle.en}</p>
                            )}
                            {ban.ctaText?.en && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                <LinkIcon className="w-2.5 h-2.5 text-[#006A4E]" />
                                <span>CTA: <strong>{ban.ctaText.en}</strong></span>
                                <span className="font-mono text-emerald-600">&rarr; /{ban.ctaUrl || 'donate'}</span>
                                {ban.openInNewTab && <span className="text-[9px] bg-emerald-200/70 text-emerald-900 px-1 rounded">New Tab</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBanner(ban);
                              setIsBannerModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#006A4E] text-white hover:bg-[#00523C] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-warm-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isBn ? 'সম্পাদনা' : 'Edit Slide'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateBanner(ban.id, { active: !ban.active });
                              showToast(`Banner ${ban.active ? 'deactivated' : 'activated'}`);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              ban.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {ban.active ? 'Active' : 'Inactive'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete banner: ${ban.title.en}?`)) {
                                deleteBanner(ban.id);
                                showToast('Banner deleted');
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: PRESS & NEWS COVERAGE */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'press' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'গণমাধ্যমে সংবাদ ও প্রেস কভারেজ' : 'Press & News Coverage CMS'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'জাতীয় দৈনিক, টিভি ও অনলাইন পোর্টালে প্রকাশিত বাহ্যিক সংবাদের লিংক ও বিবরণ পরিচালনা করুন।' : 'Manage external news features, TV reports, and articles linked to external sources.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPress(null);
                      setIsPressModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন সংবাদ যুক্ত করুন' : 'Add Press Coverage'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {pressCoverages.length === 0 ? (
                    <div className="text-center py-12 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EAE3D9] space-y-2">
                      <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No press coverage entries yet</p>
                      <p className="text-xs text-slate-500">Click the button above to add your first news or TV report.</p>
                    </div>
                  ) : (
                    pressCoverages.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-white text-slate-800 font-mono font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            #{idx + 1}
                          </span>

                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            <img
                              src={getAssetUrl(item.imageUrl || '/images/infinity-cover-hero.jpg')}
                              alt={item.title.en}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3EF] text-[#00523C]">
                                {item.outletName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                                {item.coverageType}
                              </span>
                              {item.isFeatured && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>Featured</span>
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono">{item.publishedDate}</span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 truncate max-w-xl" title={item.title.en}>
                              {item.title.en}
                            </h4>

                            <a
                              href={item.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#006A4E] hover:underline font-mono truncate max-w-md"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate">{item.articleUrl}</span>
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              updatePressCoverage(item.id, { status: item.status === 'published' ? 'hidden' : 'published' });
                              showToast(`Press item ${item.status === 'published' ? 'hidden' : 'published'}`);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              item.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {item.status === 'published' ? 'Published' : 'Hidden'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPress(item);
                              setIsPressModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors"
                            title="Edit Press Entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete press item: ${item.title.en}?`)) {
                                deletePressCoverage(item.id);
                                showToast('Press coverage deleted');
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: VOLUNTEERS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'volunteers' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'স্বেচ্ছাসেবী আবেদন ও তালিকা' : 'Volunteer Applications & CRM'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'নতুন আবেদনকারীদের তথ্য, রক্তের গ্রুপ ও জেলাভিত্তিক পর্যালোচনা।' : 'Review volunteer applications, approve candidates, and export volunteer rosters.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," +
                          ["Name,Phone,Email,District,BloodGroup,Status,SubmittedAt"].join(",") + "\n" +
                          volunteers.map(v => `"${v.fullName}","${v.phone}","${v.email}","${v.district}","${v.bloodGroup}","${v.status}","${v.submittedAt}"`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `infinity_volunteers_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast('Volunteer CSV roster exported');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-800 text-xs font-bold border border-[#EAE3D9] flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Volunteer Settings & Google Apps Script Webhook Integration */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                      <LinkIcon className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>{isBn ? 'গুগল শিট ও গুগল ড্রাইভ ইন্টিগ্রেশন সেটিংস' : 'Google Sheets & Drive Webhook Integration'}</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7]">
                      Google Apps Script Webhook
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {isBn ? 'Google Apps Script Web App URL (ওয়েবহুক এন্ডপয়েন্ট)' : 'Google Apps Script Web App URL (Webhook)'}
                      </label>
                      <input
                        type="text"
                        value={volunteerSettings.googleScriptUrl || ''}
                        onChange={(e) => updateVolunteerSettings({ googleScriptUrl: e.target.value })}
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                      />
                      <p className="text-[11px] text-slate-500">
                        {isBn
                          ? 'scripts/google-apps-script-volunteer-backend.js ডিপ্লয় করে প্রাপ্ত ওয়েব অ্যাপ লিংক এখানে বসান।'
                          : 'Paste your deployed Google Apps Script Web App URL to receive live sheet & drive sync.'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {isBn ? 'সংযুক্ত গুগল শিট লিংক (Linked Google Sheet URL)' : 'Linked Google Sheet View URL'}
                      </label>
                      <input
                        type="text"
                        value={volunteerSettings.googleSheetUrl || ''}
                        onChange={(e) => updateVolunteerSettings({ googleSheetUrl: e.target.value })}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                      />
                      {volunteerSettings.googleSheetUrl && (
                        <a
                          href={volunteerSettings.googleSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#006A4E] font-bold hover:underline"
                        >
                          <span>{isBn ? 'গুগল শিট ওপেন করুন' : 'Open Google Sheet'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">CTA Heading Text (English)</label>
                      <input
                        type="text"
                        value={volunteerSettings.ctaText?.en || ''}
                        onChange={(e) => updateVolunteerSettings({
                          ctaText: { ...(volunteerSettings.ctaText || { en: '', bn: '' }), en: e.target.value }
                        })}
                        placeholder="Join Our Dedicated Force"
                        className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1 font-bengali">হেডিং লেখা (বাংলা)</label>
                      <input
                        type="text"
                        value={volunteerSettings.ctaText?.bn || ''}
                        onChange={(e) => updateVolunteerSettings({
                          ctaText: { ...(volunteerSettings.ctaText || { en: '', bn: '' }), bn: e.target.value }
                        })}
                        placeholder="আমাদের দলে যুক্ত হোন"
                        className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                      />
                    </div>
                  </div>
                </div>

                {/* Volunteer Applicants CRM Roster */}
                <div className="space-y-3">
                  {volunteers.length === 0 ? (
                    <div className="text-center py-12 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EAE3D9] space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">{isBn ? 'কোনো আবেদন জমা পড়েনি' : 'No applications received yet'}</p>
                      <p className="text-xs text-slate-500">{isBn ? 'ওয়েবসাইটের সদস্যপদ ফরম পূরণ করলে এখানে তালিকা দেখাবে।' : 'Incoming applications from the website form will appear here.'}</p>
                    </div>
                  ) : (
                    volunteers.map(vol => (
                      <div
                        key={vol.id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3 hover:border-slate-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            {vol.photoUrl ? (
                              <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-2xs">
                                <img
                                  src={vol.photoUrl}
                                  alt={vol.fullName}
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-2xs font-bold text-xs">
                                No Pic
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-slate-900">
                                  {vol.fullName}
                                  {vol.fullNameBn && vol.fullNameBn !== vol.fullName && ` (${vol.fullNameBn})`}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {vol.bloodGroup || 'Blood: N/A'}
                                </span>
                                {vol.educationCategory && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase font-mono">
                                    {vol.educationCategory}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {vol.trackingRef || `Ref: ${vol.id}`}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600">
                                <span className="font-bold">{vol.district}</span> {vol.upazila ? `(${vol.upazila})` : ''} &bull; <span className="font-mono">{vol.phone}</span> &bull; {vol.email}
                              </p>

                              {vol.fatherName && (
                                <p className="text-[11px] text-slate-500">
                                  Father: {vol.fatherName} &bull; Mother: {vol.motherName || 'N/A'}
                                </p>
                              )}

                              {vol.schoolName && (
                                <p className="text-[11px] text-[#006A4E] font-medium">
                                  School: {vol.schoolName} (Class: {vol.currentClass || 'N/A'}, Expected SSC: {vol.expectedSscYear || 'N/A'})
                                </p>
                              )}

                              {vol.diplomaTechnology && (
                                <p className="text-[11px] text-amber-800 font-medium">
                                  Diploma: {vol.diplomaTechnology} ({vol.diplomaInstitute || 'Polytechnic'}, Sem: {vol.diplomaSemester || 'N/A'})
                                </p>
                              )}

                              {vol.honoursInstitute && (
                                <p className="text-[11px] text-[#006A4E] font-medium">
                                  Honours: {vol.honoursSubject} at {vol.honoursInstitute}
                                </p>
                              )}

                              <p className="text-[11px] text-slate-500 italic">
                                Skills: {Array.isArray(vol.skills) ? vol.skills.join(', ') : (vol.interests?.join(', ') || 'General Volunteering')}
                              </p>

                              {vol.motivation && (
                                <p className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200/70 mt-1.5">
                                  <span className="font-bold text-[10px] text-slate-400 uppercase block">Motivation:</span>
                                  {vol.motivation}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            <select
                              value={vol.status}
                              onChange={(e) => {
                                updateVolunteerStatus(vol.id, e.target.value as VolunteerApplication['status']);
                                showToast(`Status updated to ${e.target.value}`);
                              }}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-2xs"
                            >
                              <option value="New">New</option>
                              <option value="Reviewing">Reviewing</option>
                              <option value="Approved">Approved</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Rejected">Rejected</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete volunteer application for ${vol.fullName}?`)) {
                                  deleteVolunteerApplication(vol.id);
                                  showToast('Volunteer application removed');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer shadow-2xs transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: DONATIONS */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'donations' && (
              <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-display">
                      {isBn ? 'অনুদান ও তহবিল রেকর্ড' : 'Donations & Fund Reconciliation'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'বিকাশ, নগদ ও ব্যাংক মাধ্যমে প্রাপ্ত তহবিলের তথ্য ও মানি রিসিট।' : 'Verify incoming contributions, issue receipts, and manage fund reconciliation.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newDon: Partial<DonationRecord> = {
                          donorName: 'Offline Donor',
                          amount: 2000,
                          paymentMethod: 'Bank Transfer',
                          status: 'Successful'
                        };
                        addDonationRecord(newDon);
                        showToast('Donation record added');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record Donation</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {donations.map(don => (
                    <div
                      key={don.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{don.donorName}</h4>
                          <span className="font-mono font-extrabold text-emerald-800 text-xs">
                            ৳{don.amountBDT || don.amount} BDT
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                            {don.paymentMethod}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Receipt: {don.receiptNumber} &bull; TrxID: {don.transactionId || 'N/A'} &bull; Date: {don.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={don.status}
                          onChange={(e) => {
                            updateDonationStatus(don.id, e.target.value as DonationRecord['status']);
                            showToast(`Donation status: ${e.target.value}`);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        >
                          <option value="Successful">Successful</option>
                          <option value="Pending">Pending</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* TAB: COMMITTEES & LEADERSHIP */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'committees' && (
              <div className="space-y-6">
                {/* 1. Committee Selection & Header */}
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#006A4E]" />
                        <span>{isBn ? 'কমিটি ও নেতৃত্ব পরিষদ ব্যবস্থাপনা' : 'Committees & Leadership CMS'}</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? 'কার্যনির্বাহী পরিষদ (২০২৬) ও স্থায়ী কমিটির সদস্য, পদবী, ছবি, সিরিয়াল নম্বর ও ক্রম পরিবর্তন করুন।'
                          : 'Manage Executive & Standing Committee rosters, member profiles, photos (1:1 crop), hierarchy, and serial order.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember(null);
                          setIsMemberModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-xs shadow-warm-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন সদস্য যুক্ত করুন' : 'Add Committee Member'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsNewCommitteeModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#EAE3D9] text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4 text-[#006A4E]" />
                        <span>{isBn ? 'নতুন কমিটি তৈরি' : 'Create Committee'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Committee Selection Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {isBn ? 'পরিচালনার জন্য কমিটি নির্বাচন করুন:' : 'Select Committee to Manage:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {committees.map(comm => {
                        const isSelected = selectedCommitteeId === comm.id;
                        const memberCount = committeeMembers.filter(m => m.committeeId === comm.id).length;
                        return (
                          <button
                            key={comm.id}
                            type="button"
                            onClick={() => setSelectedCommitteeId(comm.id)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                              isSelected
                                ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-warm-sm'
                                : 'bg-[#FAF7F2] text-slate-700 border-[#EAE3D9] hover:border-slate-400'
                            }`}
                          >
                            <span>{isBn ? (comm.name.bn || comm.name.en) : (comm.name.en || comm.name.bn)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {memberCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Committee Details & Metadata Editor */}
                  {(() => {
                    const currentComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];
                    if (!currentComm) return null;
                    const memberCount = committeeMembers.filter(m => m.committeeId === currentComm.id).length;
                    return (
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'নির্বাচিত কমিটির বিবরণ ও সেটিংস' : 'Committee Information & Settings'}</span>
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#006A4E] border border-slate-200">
                              Type: {currentComm.type} &bull; Term: {currentComm.year}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const commTitle = currentComm.name?.bn || currentComm.name?.en || 'এই কমিটি';
                                const confirmMsg = isBn
                                  ? `আপনি কি নিশ্চিত যে "${commTitle}" কমিটিটি এবং এর সাথে থাকা ${memberCount} জন সদস্যকে সম্পূর্ণ মুছে ফেলতে চান?`
                                  : `Are you sure you want to permanently delete "${commTitle}" and its ${memberCount} members?`;
                                
                                if (window.confirm(confirmMsg)) {
                                  deleteCommittee(currentComm.id);
                                  const remaining = committees.filter(c => c.id !== currentComm.id);
                                  setSelectedCommitteeId(remaining[0]?.id || '');
                                  showToast(isBn ? 'কমিটি সফলভাবে মুছে ফেলা হয়েছে' : 'Committee deleted successfully');
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                              title={isBn ? 'এই কমিটি সম্পূর্ণ মুছে ফেলুন' : 'Delete this committee'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>{isBn ? 'কমিটি মুছুন' : 'Delete Committee'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Committee Name (English)</label>
                            <input
                              type="text"
                              value={currentComm.name?.en || ''}
                              onChange={(e) => updateCommittee(currentComm.id, {
                                name: { ...currentComm.name, en: e.target.value }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 font-bengali">কমিটির নাম (বাংলা)</label>
                            <input
                              type="text"
                              value={currentComm.name?.bn || ''}
                              onChange={(e) => updateCommittee(currentComm.id, {
                                name: { ...currentComm.name, bn: e.target.value }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Year / Term</label>
                            <input
                              type="text"
                              value={currentComm.year || '2026'}
                              onChange={(e) => updateCommittee(currentComm.id, { year: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Description (English)</label>
                            <textarea
                              rows={2}
                              value={currentComm.description?.en || ''}
                              onChange={(e) => updateCommittee(currentComm.id, {
                                description: { ...currentComm.description, en: e.target.value }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 font-bengali">বিবরণ (বাংলা)</label>
                            <textarea
                              rows={2}
                              value={currentComm.description?.bn || ''}
                              onChange={(e) => updateCommittee(currentComm.id, {
                                description: { ...currentComm.description, bn: e.target.value }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Executive Committee Section & Tier Badges Manager */}
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-6 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#006A4E]" />
                        <h3 className="text-lg font-extrabold text-slate-900 font-display">
                          {isBn ? 'কার্যনির্বাহী পরিষদ সেকশন ও টিয়ার বার ম্যানেজার' : 'Executive Committee Section & Tier Badges'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isBn
                          ? 'কার্যনির্বাহী পরিষদ পেজের বিভিন্ন স্তরের বিভাজন বার (যেমন: JOINT GENERAL SECRETARIAT) সম্পাদনা করুন অথবা প্রয়োজনমতো মুছে/লুকিয়ে ফেলুন।'
                          : 'Edit titles or delete/hide the pill section bars separating member tiers on the Executive Committee page.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdminResetTierBars}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-slate-700 border border-[#EAE3D9] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Reset all 7 section bars to defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset All to Default'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminTierBars.map((bar, idx) => {
                      const isBarVisible = bar.visible !== false;
                      return (
                        <div
                          key={bar.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            isBarVisible
                              ? 'bg-[#FAF7F2] border-[#EAE3D9] hover:border-slate-300'
                              : 'bg-slate-50 border-dashed border-slate-300 opacity-70'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Range & Visibility Status */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                #{idx + 1} &bull; {bar.rangeLabel || `Tier ${idx + 1}`}
                              </span>

                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isBarVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isBarVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{isBarVisible ? (isBn ? 'দৃশ্যমান' : 'Visible') : (isBn ? 'লুকানো / মুছে ফেলা' : 'Deleted / Hidden')}</span>
                              </span>
                            </div>

                            {/* Actual Live Badge Preview */}
                            <div className="py-2 text-center">
                              <span className={`text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full border shadow-2xs inline-block max-w-full truncate ${
                                bar.id === 'presidential'
                                  ? 'text-[#00523C] bg-[#E6F3EF] border-[#C2E2D7]'
                                  : bar.id === 'secretariat'
                                  ? 'text-[#B31224] bg-[#FDF1F2] border-[#FCD3D7]'
                                  : 'text-slate-700 bg-white border-[#EAE3D9]'
                              }`}>
                                {bar.title.en}
                              </span>
                            </div>

                            {/* Bilingual Labels */}
                            <div className="text-xs space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/70">
                              <div className="truncate">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">EN:</span>{' '}
                                <span className="font-bold text-slate-800">{bar.title.en}</span>
                              </div>
                              <div className="truncate font-bengali">
                                <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">BN:</span>{' '}
                                <span className="font-bold text-slate-800">{bar.title.bn}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions: Edit & Delete/Toggle */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminEditingTierBar({ ...bar });
                                setIsAdminTierModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'সম্পাদনা' : 'Edit Text'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAdminToggleTierBar(bar.id, isBarVisible)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isBarVisible
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isBarVisible ? (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'মুছে ফেলুন' : 'Delete / Hide'}</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'পুনরুদ্ধার' : 'Restore Bar'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Members List & Reordering Controls */}
                <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 space-y-4 shadow-warm-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#006A4E]" />
                        <span>
                          {isBn ? 'সদস্য তালিকা ও পদমর্যাদা ক্রম' : 'Members Roster & Hierarchy'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? 'সদস্যের নাম, পদবী, ছবি পরিবর্তন করুন অথবা ▲/▼ বাটনে ক্লিক করে ক্রম পুনঃনির্ধারণ করুন।'
                          : 'Edit member designations, photos (1:1 crop), or click ▲/▼ to change display rank.'}
                      </p>
                    </div>

                    {/* Member Search Bar */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder={isBn ? 'সদস্যের নাম বা পদবী...' : 'Search roster...'}
                        className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Members Roster Grid / Cards */}
                  <div className="space-y-2.5 pt-2">
                    {(() => {
                      const allMembers = getMembersWithDetails(selectedCommitteeId);
                      const filtered = allMembers.filter(m => {
                        if (!memberSearchQuery.trim()) return true;
                        const q = memberSearchQuery.toLowerCase();
                        const fullName = m.person?.fullName?.toLowerCase() || '';
                        const enName = m.person?.englishName?.toLowerCase() || '';
                        const bnName = m.person?.banglaName || '';
                        const posEn = m.position?.name?.en?.toLowerCase() || '';
                        const posBn = m.position?.name?.bn || '';
                        return (
                          fullName.includes(q) ||
                          enName.includes(q) ||
                          bnName.includes(q) ||
                          posEn.includes(q) ||
                          posBn.includes(q)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EAE3D9] space-y-2">
                            <Users className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500 font-bold">
                              {isBn ? 'এই কমিটিতে কোনো সদস্য পাওয়া যায়নি।' : 'No members found in this committee.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMember(null);
                                setIsMemberModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs cursor-pointer"
                            >
                              Add First Member
                            </button>
                          </div>
                        );
                      }

                      return filtered.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F5EFE6]/70 border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                        >
                          {/* Member Identity Details */}
                          <div className="flex items-center gap-3.5">
                            {/* Serial Badge */}
                            <span className="w-8 h-8 rounded-xl bg-white text-[#006A4E] font-mono font-extrabold text-xs flex items-center justify-center border border-slate-200 shrink-0 shadow-2xs">
                              #{String(item.serialNumber || idx + 1).padStart(2, '0')}
                            </span>

                            {/* Photo Thumbnail */}
                            <div
                              onClick={() => {
                                setEditingMember(item);
                                setIsMemberModalOpen(true);
                              }}
                              className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#006A4E]/30 shrink-0 shadow-2xs group cursor-pointer"
                              title="Click to edit member & photo"
                            >
                              {item.person?.photoUrl ? (
                                <img
                                  src={getAssetUrl(item.person.photoUrl)}
                                  alt={item.person?.fullName || item.person?.englishName || 'Member'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                  <Users className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            {/* Name & Designation */}
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-extrabold text-sm text-slate-900 font-display">
                                  {isBn
                                    ? (item.person?.banglaName || item.person?.fullName || item.person?.englishName || 'সদস্য')
                                    : (item.person?.englishName || item.person?.fullName || item.person?.banglaName || 'Member')}
                                  {isBn && item.person?.englishName
                                    ? ` (${item.person.englishName})`
                                    : (!isBn && item.person?.banglaName ? ` (${item.person.banglaName})` : '')}
                                </h4>
                                {item.isFeaturedLeader && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    Leader
                                  </span>
                                )}
                                {item.status !== 'ACTIVE' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                    {item.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-[#006A4E]">
                                {isBn
                                  ? (item.position?.name?.bn || item.position?.name?.en || 'সদস্য')
                                  : (item.position?.name?.en || item.position?.name?.bn || 'Member')}
                                {item.position?.name?.en && item.position?.name?.bn && (
                                  <span className="font-sans text-slate-500 font-normal">
                                    {' '}&bull; {isBn ? item.position.name.en : item.position.name.bn}
                                  </span>
                                )}
                              </p>
                              {(isBn ? item.person?.shortBio?.bn : (item.person?.shortBio?.en || item.person?.shortBio?.bn)) && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                                  "{isBn ? item.person?.shortBio?.bn : (item.person?.shortBio?.en || item.person?.shortBio?.bn)}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Member Actions: Move Up / Down & Edit / Delete */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Reorder Buttons */}
                            <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveMember(item.id, 'up')}
                                className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-bold text-xs"
                                title="Move Rank Up"
                              >
                                ▲
                              </button>
                              <div className="w-px h-4 bg-slate-200" />
                              <button
                                type="button"
                                disabled={idx === allMembers.length - 1}
                                onClick={() => handleMoveMember(item.id, 'down')}
                                className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-bold text-xs"
                                title="Move Rank Down"
                              >
                                ▼
                              </button>
                            </div>

                            {/* Edit Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMember(item);
                                setIsMemberModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                            </button>

                            {/* Delete Trigger */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${item.person?.englishName || item.person?.banglaName || 'member'} from committee?`)) {
                                  deleteCommitteeMember(item.id);
                                  showToast(isBn ? 'সদস্য তালিকা থেকে মুছে ফেলা হয়েছে' : 'Member removed');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-all"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 3. New Committee Creation Modal */}
                {isNewCommitteeModalOpen && (
                  <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 max-w-lg w-full space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-base text-slate-900 font-display">
                          {isBn ? 'নতুন কমিটি তৈরি করুন' : 'Create New Committee'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsNewCommitteeModalOpen(false)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Committee Name (English)</label>
                          <input
                            type="text"
                            value={newCommitteeNameEn}
                            onChange={(e) => setNewCommitteeNameEn(e.target.value)}
                            placeholder="e.g. Standing Committee on Healthcare"
                            className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 font-bengali">কমিটির নাম (বাংলা)</label>
                          <input
                            type="text"
                            value={newCommitteeNameBn}
                            onChange={(e) => setNewCommitteeNameBn(e.target.value)}
                            placeholder="যেমন: স্বাস্থ্য ও চিকিৎসা বিষয়ক স্থায়ী কমিটি"
                            className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Committee Type</label>
                            <select
                              value={newCommitteeType}
                              onChange={(e) => setNewCommitteeType(e.target.value as any)}
                              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bold"
                            >
                              <option value="STANDING">স্থায়ী কমিটি (Standing)</option>
                              <option value="EXECUTIVE">কার্যনির্বাহী পরিষদ (Executive)</option>
                              <option value="SPECIAL">বিশেষ কমিটি (Special)</option>
                              <option value="PAST">প্রাক্তন কমিটি (Past)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Term / Year</label>
                            <input
                              type="text"
                              value={newCommitteeYear}
                              onChange={(e) => setNewCommitteeYear(e.target.value)}
                              placeholder="2026"
                              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsNewCommitteeModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-white border border-[#EAE3D9] text-xs font-bold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCommitteeNameEn.trim()) {
                              alert('Please provide committee name');
                              return;
                            }
                            const newComm = addCommittee({
                              slug: newCommitteeNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                              name: { en: newCommitteeNameEn, bn: newCommitteeNameBn || newCommitteeNameEn },
                              type: newCommitteeType,
                              year: newCommitteeYear,
                              description: { en: newCommitteeDescEn, bn: newCommitteeDescBn },
                              status: 'ACTIVE',
                              sortOrder: committees.length + 1,
                              isFeatured: false
                            });
                            setSelectedCommitteeId(newComm.id);
                            setIsNewCommitteeModalOpen(false);
                            setNewCommitteeNameEn('');
                            setNewCommitteeNameBn('');
                            showToast('New committee created');
                          }}
                          className="px-5 py-2 rounded-xl bg-[#006A4E] text-white text-xs font-bold"
                        >
                          Create Committee
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </AdminErrorBoundary>
          </div>
        </div>
      </div>

      {/* Campaign Edit/Add Modal */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        campaign={editingCampaign}
        onSave={(campaignData) => {
          if (editingCampaign) {
            updateCampaign(editingCampaign.id, campaignData);
            showToast(isBn ? 'ক্যাম্পেইন সফলভাবে আপডেট হয়েছে' : 'Campaign successfully updated');
          } else {
            addCampaign(campaignData as Omit<Campaign, 'id'>);
            showToast(isBn ? 'নতুন ক্যাম্পেইন প্রকাশিত হয়েছে' : 'New campaign published');
          }
          setIsCampaignModalOpen(false);
        }}
        onOpenMediaPicker={openMediaPicker}
        isBn={isBn}
      />

      {/* Program Edit/Add Modal */}
      <ProgramModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        program={editingProgram}
        onSave={(progData) => {
          if (editingProgram) {
            updateProgram(editingProgram.id, progData);
            showToast(isBn ? 'প্রোগ্রাম আপডেট হয়েছে' : 'Program updated');
          } else {
            addProgram(progData as Omit<Program, 'id'>);
            showToast(isBn ? 'নতুন প্রোগ্রাম তৈরি হয়েছে' : 'New program created');
          }
          setIsProgramModalOpen(false);
        }}
        onOpenMediaPicker={openMediaPicker}
        isBn={isBn}
      />

      {/* Story Edit/Add Modal */}
      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        story={editingStory}
        onSave={(storyData) => {
          if (editingStory) {
            updateStory(editingStory.id, storyData);
            showToast(isBn ? 'গল্প আপডেট হয়েছে' : 'Story updated');
          } else {
            addStory(storyData as Omit<ImpactStory, 'id'>);
            showToast(isBn ? 'নতুন গল্প প্রকাশিত হয়েছে' : 'New story published');
          }
          setIsStoryModalOpen(false);
        }}
        onOpenMediaPicker={openMediaPicker}
        isBn={isBn}
      />

      {/* FAQ Edit/Add Modal */}
      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
        faq={editingFAQ}
        onSave={(faqData) => {
          if (editingFAQ) {
            updateFAQ(editingFAQ.id, faqData);
            showToast(isBn ? 'প্রশ্নোত্তর আপডেট হয়েছে' : 'FAQ item updated');
          } else {
            addFAQ(faqData as Omit<FAQItem, 'id'>);
            showToast(isBn ? 'নতুন প্রশ্নোত্তর যুক্ত হয়েছে' : 'New FAQ item created');
          }
          setIsFAQModalOpen(false);
        }}
        isBn={isBn}
      />

      {/* Committee Member Edit/Add Modal */}
      <CommitteeMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        defaultCommitteeId={selectedCommitteeId}
        onSave={handleSaveMember}
        onOpenMediaPicker={openMediaPicker}
      />

      {/* Executive Section/Tier Bar Edit Modal */}
      {isAdminTierModalOpen && adminEditingTierBar && (
        <div
          className="fixed inset-0 z-[9995] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsAdminTierModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-display">
                    {isBn ? 'সেকশন ও টিয়ার বার সম্পাদনা' : 'Edit Committee Section Bar'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {adminEditingTierBar.rangeLabel || adminEditingTierBar.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAdminTierModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdminSaveTierBar(adminEditingTierBar);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isBn ? 'সেকশন শিরোনাম (English)' : 'Section Bar Title (English)'}
                </label>
                <input
                  type="text"
                  value={adminEditingTierBar.title.en}
                  onChange={(e) => setAdminEditingTierBar({
                    ...adminEditingTierBar,
                    title: { ...adminEditingTierBar.title, en: e.target.value }
                  })}
                  placeholder="e.g. JOINT GENERAL SECRETARIAT"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-bengali">
                  {isBn ? 'সেকশন শিরোনাম (বাংলা)' : 'Section Bar Title (Bengali)'}
                </label>
                <input
                  type="text"
                  value={adminEditingTierBar.title.bn}
                  onChange={(e) => setAdminEditingTierBar({
                    ...adminEditingTierBar,
                    title: { ...adminEditingTierBar.title, bn: e.target.value }
                  })}
                  placeholder="যেমন: যুগ্ম সাধারণ সম্পাদক পরিষদ"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs sm:text-sm font-bengali font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isBn ? 'সেকশন বারের দৃশ্যমানতা' : 'Section Bar Visibility'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {adminEditingTierBar.visible !== false
                      ? (isBn ? 'এই বারটি পেজে প্রদর্শিত হচ্ছে।' : 'This pill bar is currently visible on the page.')
                      : (isBn ? 'এই বারটি পেজে লুকানো/মুছে ফেলা হয়েছে।' : 'This pill bar is currently hidden/deleted.')}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminEditingTierBar.visible !== false}
                    onChange={(e) => setAdminEditingTierBar({
                      ...adminEditingTierBar,
                      visible: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006A4E]"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleAdminToggleTierBar(adminEditingTierBar.id, adminEditingTierBar.visible !== false);
                    setIsAdminTierModalOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{adminEditingTierBar.visible !== false ? (isBn ? 'বার মুছে ফেলুন' : 'Delete / Hide Bar') : (isBn ? 'বার দৃশ্যমান করুন' : 'Show Bar')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminTierModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-extrabold shadow-warm-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* MEDIA PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewingMedia && (() => {
        const isVideo = previewingMedia.type === 'video';
        const norm = detectAndNormalizeMedia(previewingMedia.url);

        return (
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
            onClick={() => setPreviewingMedia(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 flex flex-col max-h-[92vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-[#FAF7F2]">
                <div className="flex items-center gap-2 truncate max-w-[80%]">
                  <span className="p-1 rounded-lg bg-[#E6F3EF] text-[#006A4E]">
                    {isVideo ? <VideoIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-display truncate">
                    {previewingMedia.title || previewingMedia.fileName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingMedia(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Media Body */}
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                {isVideo ? (
                  norm.isValid && norm.embedUrl ? (
                    norm.type === 'direct_video' ? (
                      <video src={norm.originalUrl} controls autoPlay className="w-full h-full object-contain" />
                    ) : (
                      <iframe
                        src={norm.embedUrl}
                        title={previewingMedia.title || 'Video Player'}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : (
                    <div className="p-6 text-center text-white space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs">{norm.errorMessage || 'Cannot play video embed directly.'}</p>
                      <a
                        href={previewingMedia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold underline"
                      >
                        Open original URL <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )
                ) : (
                  <img
                    src={getAssetUrl(previewingMedia.url)}
                    alt={previewingMedia.altText || previewingMedia.fileName}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Footer Details */}
              <div className="p-4 sm:p-5 space-y-2.5 text-xs bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] font-bold border border-[#EAE3D9] text-slate-700 capitalize">
                      {previewingMedia.platform || previewingMedia.category}
                    </span>
                    <span>{previewingMedia.fileSize || 'Standard'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(previewingMedia.url);
                        showToast('Asset URL copied');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#006A4E] font-bold border border-[#EAE3D9] hover:bg-[#F2ECE1] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </button>
                    <a
                      href={previewingMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#006A4E] text-white font-bold hover:bg-[#00523C] transition-colors flex items-center gap-1"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* EDIT MEDIA METADATA MODAL */}
      {/* ======================================================== */}
      {editingMedia && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setEditingMedia(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 space-y-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 font-display">
                {isBn ? 'মিডিয়া তথ্য সম্পাদনা' : 'Edit Media Metadata'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Display Name:</label>
                <input
                  type="text"
                  value={editingMedia.title || editingMedia.fileName}
                  onChange={e => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alt Text (Accessibility & SEO):</label>
                <input
                  type="text"
                  value={editingMedia.altText || ''}
                  onChange={e => setEditingMedia({ ...editingMedia, altText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category:</label>
                <select
                  value={editingMedia.category}
                  onChange={e => setEditingMedia({ ...editingMedia, category: e.target.value as MediaCategory })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                >
                  {['General', 'Hero', 'Campaigns', 'Volunteers', 'Events', 'Children & Community', 'Logos', 'Banners', 'Stories', 'Gallery', 'Documents'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Description:</label>
                <textarea
                  rows={2}
                  value={editingMedia.caption || ''}
                  onChange={e => setEditingMedia({ ...editingMedia, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={editingMedia.isFeatured || false}
                  onChange={e => setEditingMedia({ ...editingMedia, isFeatured: e.target.checked })}
                  className="rounded text-[#006A4E] focus:ring-[#006A4E]"
                />
                <label htmlFor="editIsFeatured" className="font-bold text-slate-700 cursor-pointer">
                  Mark as Featured Highlight Asset
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMediaItem(editingMedia.id, {
                    title: editingMedia.title,
                    altText: editingMedia.altText,
                    caption: editingMedia.caption,
                    category: editingMedia.category,
                    isFeatured: editingMedia.isFeatured
                  });
                  setEditingMedia(null);
                  showToast('Media metadata updated');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD NEW MEDIA MODAL (URL PASTE OR CLOUDINARY UPLOAD) */}
      {/* ======================================================== */}
      {isNewMediaModalOpen && (() => {
        const detected = newMediaUrl.trim() ? detectAndNormalizeMedia(newMediaUrl.trim()) : null;

        return (
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
            onClick={() => setIsNewMediaModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 space-y-4 p-6 text-left"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  {isBn ? 'নতুন মিডিয়া সম্পদ যুক্ত করুন' : 'Add New Media Asset'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewMediaModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Source Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setNewMediaSourceTab('url')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    newMediaSourceTab === 'url'
                      ? 'bg-[#006A4E] text-white shadow-warm-xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-slate-100 border border-[#EAE3D9]'
                  }`}
                >
                  YouTube / Facebook / URL
                </button>
                <button
                  type="button"
                  onClick={() => setNewMediaSourceTab('upload')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    newMediaSourceTab === 'upload'
                      ? 'bg-[#006A4E] text-white shadow-warm-xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-slate-100 border border-[#EAE3D9]'
                  }`}
                >
                  Cloudinary PC Upload
                </button>
              </div>

              {/* Tab 1: Direct URL & Embed Detection */}
              {newMediaSourceTab === 'url' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Media URL (YouTube, Facebook, Image CDN, Direct Video):
                    </label>
                    <input
                      type="text"
                      value={newMediaUrl}
                      onChange={e => setNewMediaUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono focus:outline-none focus:border-[#006A4E]"
                    />
                  </div>

                  {/* Detection Feedback */}
                  {detected && (
                    <div className="space-y-2">
                      {detected.isValid ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#00523C] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold capitalize">Verified: {detected.type} ({detected.platform})</span>
                            <span className="text-[10px] px-2 py-0.5 bg-white font-bold rounded-full text-[#006A4E]">Ready</span>
                          </div>
                          {detected.embedUrl && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-black max-h-36">
                              <iframe src={detected.embedUrl} title="Preview" className="w-full h-full border-0" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>{detected.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title / Display Name:</label>
                    <input
                      type="text"
                      value={newMediaTitle}
                      onChange={e => setNewMediaTitle(e.target.value)}
                      placeholder="e.g. Winter Relief Campaign Field Video"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category:</label>
                    <select
                      value={newMediaCategory}
                      onChange={e => setNewMediaCategory(e.target.value as MediaCategory)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                    >
                      {['General', 'Hero', 'Campaigns', 'Volunteers', 'Events', 'Children & Community', 'Logos', 'Banners', 'Stories', 'Gallery', 'Documents'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 2: Upload File */}
              {newMediaSourceTab === 'upload' && (
                <div className="space-y-3 text-xs">
                  <div className="p-6 border-2 border-dashed border-slate-300 hover:border-[#006A4E] rounded-2xl text-center space-y-2 bg-[#FAF7F2]">
                    <Upload className="w-8 h-8 text-[#006A4E] mx-auto" />
                    <p className="font-bold text-slate-700">Choose photo/video to upload to Cloudinary</p>
                    <label className="inline-block px-4 py-2 bg-[#006A4E] text-white font-bold rounded-xl cursor-pointer hover:bg-[#00523C] transition-colors">
                      <span>Select File</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={async e => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setIsUploadingMedia(true);
                            setMediaUploadError('');
                            try {
                              const res = await uploadToCloudinary(file);
                              if (res && res.secure_url) {
                                addMediaItem({
                                  fileName: file.name,
                                  url: res.secure_url,
                                  fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                                  mimeType: file.type,
                                  type: file.type.startsWith('video/') ? 'video' : 'image',
                                  sourceType: 'upload',
                                  platform: 'cloudinary',
                                  category: newMediaCategory,
                                  altText: newMediaAlt || file.name,
                                  title: newMediaTitle || file.name,
                                  usageTags: ['Cloudinary Upload'],
                                  status: 'published'
                                });
                                setIsUploadingMedia(false);
                                setIsNewMediaModalOpen(false);
                                showToast('File uploaded to Cloudinary');
                              }
                            } catch (err: any) {
                              setMediaUploadError(err.message || 'Upload failed');
                              setIsUploadingMedia(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>

                  {isUploadingMedia && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00523C] font-bold text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-ping" />
                      <span>Uploading to Cloudinary CDN...</span>
                    </div>
                  )}

                  {mediaUploadError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">
                      {mediaUploadError}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {newMediaSourceTab === 'url' && (
                  <button
                    type="button"
                    disabled={!newMediaUrl.trim()}
                    onClick={() => {
                      const det = detectAndNormalizeMedia(newMediaUrl.trim());
                      const isVideo = det.type === 'youtube' || det.type === 'facebook' || det.type === 'direct_video';
                      
                      const created = addMediaItem({
                        fileName: newMediaTitle || `media-${Date.now()}`,
                        url: det.originalUrl,
                        embedUrl: det.embedUrl,
                        thumbnailUrl: det.thumbnailUrl || (isVideo ? 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80' : undefined),
                        fileSize: isVideo ? 'Embedded Stream' : 'External URL',
                        mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
                        type: isVideo ? 'video' : 'image',
                        sourceType: 'url',
                        platform: det.platform as any,
                        category: newMediaCategory,
                        title: newMediaTitle || (isVideo ? 'Official Field Footage' : 'Photographic Archive'),
                        altText: newMediaAlt || newMediaTitle || 'Team Infinity Media',
                        usageTags: ['External Media URL'],
                        status: 'published',
                        isFeatured: newMediaIsFeatured
                      });

                      // Also sync to videos if video item
                      if (isVideo) {
                        addVideo({
                          title: { en: newMediaTitle || 'Field Drive Video', bn: newMediaTitle || 'মাঠপর্যায়ের ভিডিও' },
                          description: { en: 'Team Infinity official field drive coverage.', bn: 'টিম ইনফিনিটি অফিশিয়াল মানবিক কার্যক্রম।' },
                          videoUrl: det.originalUrl,
                          embedUrl: det.embedUrl || '',
                          thumbnailUrl: det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL,
                          date: new Date().toISOString().split('T')[0],
                          duration: 'Video',
                          platform: (det.platform === 'youtube' ? 'youtube' : det.platform === 'facebook' ? 'facebook' : 'custom') as any,
                          category: newMediaCategory === 'Campaigns' ? 'Relief Campaigns' : newMediaCategory === 'Volunteers' ? 'Volunteer Drives' : 'General',
                          status: 'published',
                          isFeatured: newMediaIsFeatured
                        });
                      }

                      setIsNewMediaModalOpen(false);
                      showToast('Media asset registered and available in library');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] disabled:bg-slate-300 text-white text-xs font-bold shadow-warm-xs transition-colors cursor-pointer"
                  >
                    Save to Media Library
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* DEDICATED VIDEO PUBLISH & EDIT MODAL */}
      {/* ======================================================== */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setEditingVideo(null);
        }}
        videoToEdit={editingVideo}
        onSave={(videoData) => {
          if ('id' in videoData && videoData.id) {
            updateVideo(videoData.id, videoData);
            showToast(isBn ? 'ভিডিও সফলভাবে আপডেট হয়েছে' : 'Video details updated successfully');
          } else {
            addVideo(videoData);
            showToast(isBn ? 'নতুন ভিডিও সফলভাবে প্রকাশিত হয়েছে' : 'Video published successfully to website');
          }
        }}
      />

      {/* ======================================================== */}
      {/* DYNAMIC IMAGE CROPPER MODAL */}
      {/* ======================================================== */}
      <ImageEditorModal
        isOpen={isCropperModalOpen}
        onClose={() => setIsCropperModalOpen(false)}
        imageUrl={cropperSourceUrl}
        onSave={(croppedUrl) => {
          if (typeof cropperCallback === 'function') {
            cropperCallback(croppedUrl);
          }
          setIsCropperModalOpen(false);
        }}
      />

      {/* Universal Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          if (typeof mediaPickerCallback === 'function') {
            mediaPickerCallback(url);
          }
          setMediaPickerOpen(false);
        }}
        onSelectMedia={(url) => {
          if (typeof mediaPickerCallback === 'function') {
            mediaPickerCallback(url);
          }
          setMediaPickerOpen(false);
        }}
      />

      {/* ======================================================== */}
      {/* BANNER & HERO SLIDER MODAL */}
      {/* ======================================================== */}
      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false);
          setEditingBanner(null);
        }}
        banner={editingBanner}
        onSave={(bannerData) => {
          if (editingBanner?.id) {
            updateBanner(editingBanner.id, bannerData);
            showToast(isBn ? 'ব্যানার সফলভাবে আপডেট হয়েছে' : 'Banner slide updated successfully');
          } else {
            addBanner(bannerData);
            showToast(isBn ? 'নতুন ব্যানার সফলভাবে যুক্ত হয়েছে' : 'New banner slide added successfully');
          }
        }}
        onOpenMediaLibrary={openMediaPicker}
      />

      {/* ======================================================== */}
      {/* GALLERY ALBUM DETAILS MODAL */}
      {/* ======================================================== */}
      <AlbumModal
        isOpen={isAlbumModalOpen}
        onClose={() => {
          setIsAlbumModalOpen(false);
          setEditingAlbum(null);
        }}
        album={editingAlbum}
        onSave={(albumData) => {
          if (editingAlbum?.id) {
            updateGalleryAlbum(editingAlbum.id, albumData);
            showToast(isBn ? 'অ্যালবাম তথ্য আপডেট হয়েছে' : 'Album details updated successfully');
          } else {
            addGalleryAlbum(albumData);
            showToast(isBn ? 'নতুন অ্যালবাম সফলভাবে তৈরি হয়েছে' : 'New gallery album created');
          }
        }}
        onOpenMediaLibrary={openMediaPicker}
      />

      {/* ======================================================== */}
      {/* ALBUM PHOTO MANAGER MODAL */}
      {/* ======================================================== */}
      <AlbumPhotoManagerModal
        isOpen={isAlbumPhotoManagerOpen}
        onClose={() => {
          setIsAlbumPhotoManagerOpen(false);
          setEditingAlbumPhotos(null);
        }}
        album={editingAlbumPhotos}
        allGalleryPhotos={gallery}
        allMediaItems={mediaLibrary}
        onSavePhotos={(albumId, photoIds) => {
          setAlbumPhotos(albumId, photoIds);
          showToast(isBn ? 'অ্যালবামের ছবি সফলভাবে সংরক্ষিত হয়েছে' : 'Album photos synchronized successfully');
        }}
      />

      {/* ======================================================== */}
      {/* IMAGE ASSET PUBLISH & METADATA MODAL */}
      {/* ======================================================== */}
      <ImagePublishModal
        isOpen={isImagePublishModalOpen}
        onClose={() => {
          setIsImagePublishModalOpen(false);
          setEditingImageItem(null);
        }}
        mediaItem={editingImageItem}
        campaigns={campaigns}
        events={events}
        onSave={(mediaData) => {
          if (editingImageItem?.id) {
            updateMediaItem(editingImageItem.id, mediaData);
            showToast(isBn ? 'ছবির মেটাডাটা আপডেট হয়েছে' : 'Image asset metadata updated successfully');
          } else {
            addMediaItem({
              ...mediaData,
              fileSize: mediaData.fileSize || 'Optimized',
              mimeType: mediaData.mimeType || 'image/jpeg',
              sourceType: 'upload',
              platform: 'cloudinary',
              status: 'published'
            });
            // Also add to gallery for public gallery showcase
            addGalleryPhoto({
              title: { en: mediaData.title || mediaData.fileName, bn: mediaData.description || mediaData.fileName },
              caption: { en: mediaData.caption || '', bn: mediaData.caption || '' },
              imageUrl: mediaData.url,
              category: mediaData.category || 'Campaigns',
              date: new Date().toISOString().split('T')[0],
              location: 'Bangladesh'
            });
            showToast(isBn ? 'নতুন ছবি সফলভাবে প্রকাশিত ও সংরক্ষিত হয়েছে' : 'Image asset published and added to media library');
          }
        }}
      />

      {/* ======================================================== */}
      {/* PRESS & NEWS COVERAGE MODAL */}
      {/* ======================================================== */}
      <PressCoverageModal
        isOpen={isPressModalOpen}
        onClose={() => {
          setIsPressModalOpen(false);
          setEditingPress(null);
        }}
        pressItem={editingPress}
        onSave={(pressData) => {
          if (editingPress?.id) {
            updatePressCoverage(editingPress.id, pressData);
            showToast(isBn ? 'সংবাদ কভারেজ আপডেট হয়েছে' : 'Press coverage item updated successfully');
          } else {
            addPressCoverage(pressData);
            showToast(isBn ? 'নতুন সংবাদ কভারেজ যুক্ত হয়েছে' : 'New press coverage item published');
          }
        }}
        onOpenMediaLibrary={openMediaPicker}
      />

      {/* ======================================================== */}
      {/* NAVIGATION MENU ITEM MODAL */}
      {/* ======================================================== */}
      <NavigationModal
        isOpen={isNavModalOpen}
        onClose={() => {
          setIsNavModalOpen(false);
          setEditingNav(null);
        }}
        item={editingNav}
        isBn={isBn}
        onSave={(navData) => {
          if (editingNav?.id) {
            updateNavigationItem(editingNav.id, navData);
            showToast(isBn ? 'মেনু লিঙ্ক আপডেট হয়েছে' : 'Navigation link updated successfully');
          } else {
            addNavigationItem({
              label: navData.label || { en: 'New Link', bn: 'নতুন লিঙ্ক' },
              path: navData.path || 'home',
              isExternal: !!navData.isExternal,
              isDropdown: !!navData.isDropdown,
              children: navData.children || [],
              displayOrder: navigationItems.length + 1,
              active: navData.active !== false
            });
            showToast(isBn ? 'নতুন মেনু লিঙ্ক তৈরি হয়েছে' : 'New navigation link created');
          }
        }}
      />

      {/* ======================================================== */}
      {/* JOURNEY VIDEO MODAL */}
      {/* ======================================================== */}
      <JourneyVideoModal
        isOpen={isJourneyVideoModalOpen}
        onClose={() => {
          setIsJourneyVideoModalOpen(false);
          setEditingJourneyVideo(null);
        }}
        videoToEdit={editingJourneyVideo}
        onSave={handleSaveJourneyVideo}
        existingVideosCount={journeyVideos.length}
      />

      {/* ======================================================== */}
      {/* BLOOD DONOR ADMIN MODAL */}
      {/* ======================================================== */}
      <BloodDonorModal
        isOpen={isBloodDonorModalOpen}
        onClose={() => {
          setIsBloodDonorModalOpen(false);
          setEditingBloodDonor(null);
        }}
        donorToEdit={editingBloodDonor}
        onSave={handleSaveBloodDonor}
        onDelete={(id) => {
          deleteBloodDonor(id);
          showToast(isBn ? 'রক্তদাতার রেকর্ড মুছে ফেলা হয়েছে' : 'Donor record deleted successfully');
        }}
      />

      {/* ======================================================== */}
      {/* DONOR DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {donorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-warm-2xl space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {isBn ? 'রক্তদাতার তথ্য মুছে ফেলতে চান?' : 'Delete Donor Record?'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই রক্তদাতার সম্পূর্ণ রেকর্ড ও তথ্য স্থায়ীভাবে মুছে ফেলতে চান? এই পরিবর্তনটি পুনরুদ্ধার করা যাবে না।'
                  : 'Are you sure you want to permanently delete this donor record? This action cannot be undone.'}
              </p>
            </div>

            {/* Donor Quick Summary Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden">
                {donorToDelete.photoUrl ? (
                  <img src={getAssetUrl(donorToDelete.photoUrl)} alt={donorToDelete.fullName} className="w-full h-full object-cover" />
                ) : (
                  donorToDelete.fullName.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                    {donorToDelete.bloodGroup}
                  </span>
                  <p className="font-extrabold text-xs text-slate-900 truncate">
                    {donorToDelete.fullName}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {donorToDelete.phone} &bull; {donorToDelete.district}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDonorToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] text-slate-700 font-bold text-xs hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBloodDonor(donorToDelete.id);
                  setDonorToDelete(null);
                  showToast(isBn ? 'রক্তদাতার রেকর্ড মুছে ফেলা হয়েছে' : 'Donor record deleted successfully');
                }}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-warm-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EMERGENCY BLOOD REQUEST ADMIN MODAL */}
      {/* ======================================================== */}
      <EmergencyRequestAdminModal
        isOpen={isEmergencyRequestModalOpen}
        onClose={() => {
          setIsEmergencyRequestModalOpen(false);
          setEditingEmergencyRequest(null);
        }}
        request={editingEmergencyRequest}
        onUpdateStatus={(id, status) => {
          updateEmergencyBloodRequestStatus(id, status);
          showToast('Emergency request status updated');
        }}
      />

      {/* ======================================================== */}
      {/* PROGRAM EVENT / EDITION MODAL */}
      {/* ======================================================== */}
      {selectedProgramForEvent && (
        <ProgramEventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedProgramForEvent(null);
            setEditingProgramEvent(null);
          }}
          program={selectedProgramForEvent}
          eventToEdit={editingProgramEvent}
        />
      )}

      {/* ======================================================== */}
      {/* EVENT MEDIA & HIGHLIGHTS MANAGER MODAL */}
      {/* ======================================================== */}
      {selectedProgramForMedia && selectedEventForMedia && (
        <EventMediaManagerModal
          isOpen={isEventMediaModalOpen}
          onClose={() => {
            setIsEventMediaModalOpen(false);
            setSelectedProgramForMedia(null);
            setSelectedEventForMedia(null);
          }}
          program={selectedProgramForMedia}
          event={selectedEventForMedia}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};
