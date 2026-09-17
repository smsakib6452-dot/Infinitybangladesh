import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import {
  BloodDonor,
  BloodGroup,
  DonorAvailabilityStatus,
  EmergencyBloodRequest,
  EmergencyLevel
} from '../types';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import {
  getUpazilasForDistrict,
  calculateAge,
  isEligibleToDonate,
  getCooldownStatusInfo,
  BLOOD_DONATION_COOLDOWN_DAYS,
  getDonorPhoneVisibility,
  maskPhoneNumber,
  toSafeString,
  cleanBloodDonor,
  cleanEmergencyRequest,
  getDonorEditAccessCode,
  verifyDonorAccessCode,
  MASTER_ADMIN_PASSCODES
} from '../data/bloodDonationData';
import { getAssetUrl } from '../lib/utils/assetHelper';
import { SectionHeading } from '../components/SectionHeading';
import { BloodDonorProfileModal } from '../components/BloodDonorProfileModal';
import { EmergencyBloodContactModal } from '../components/EmergencyBloodContactModal';
import { ImageEditorModal } from '../components/ImageEditorModal';
import { DateInput } from '../components/DateInput';
import { formatDateDDMMYYYY } from '../lib/utils/formatters';
import {
  Droplet,
  Search,
  Heart,
  Users,
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Info,
  Award,
  Activity,
  UserPlus,
  UserCheck,
  HelpCircle,
  Check,
  Building2,
  Flame,
  Plus,
  Camera,
  Upload,
  Trash2,
  ImageIcon,
  Edit3,
  HeartPulse,
  RefreshCw,
  Crop,
  Sliders,
  ZoomIn,
  Lock,
  Unlock,
  Key,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';
import { LifeLineHeroLogoAnimation } from '../components/motion/LifeLineHeroLogoAnimation';

interface BloodDonationPageProps {
  initialTab?: 'find-donor' | 'become-donor' | 'update-donor' | 'emergency-request' | 'donors' | 'statistics' | 'guidelines';
}

export const BloodDonationPage: React.FC<BloodDonationPageProps> = ({
  initialTab = 'find-donor'
}) => {
  const { isBn, tText } = useLanguage();
  const {
    bloodDonors,
    emergencyBloodRequests,
    bloodDonationSettings,
    donorCategories,
    addBloodDonor,
    updateBloodDonor,
    addEmergencyBloodRequest
  } = useData();
  const { currentPage, navigate } = useRouter();

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    'find-donor' | 'become-donor' | 'update-donor' | 'emergency-request' | 'donors' | 'statistics' | 'guidelines'
  >(() => {
    if (currentPage === 'blood-donation/find-donor') return 'find-donor';
    if (currentPage === 'blood-donation/become-donor') return 'become-donor';
    if (currentPage === 'blood-donation/update-donor') return 'update-donor';
    if (currentPage === 'blood-donation/emergency-request') return 'emergency-request';
    if (currentPage === 'blood-donation/statistics') return 'statistics';
    return initialTab;
  });

  // Smooth animated scroll to active form / content section
  const scrollToFormSection = useCallback((tabId?: 'find-donor' | 'become-donor' | 'update-donor' | 'emergency-request' | 'donors' | 'statistics' | 'guidelines') => {
    if (tabId) {
      setActiveTab(tabId);
    }
    const executeScroll = () => {
      const targetEl =
        (tabId === 'become-donor' ? document.getElementById('become-donor-section') : null) ||
        (tabId === 'update-donor' ? document.getElementById('update-donor-section') : null) ||
        (tabId === 'emergency-request' ? document.getElementById('emergency-request-section') : null) ||
        document.getElementById('blood-main-content-section') ||
        document.getElementById('blood-tabs-nav');

      if (targetEl) {
        const yOffset = -80; // offset for sticky header & sticky tabs
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    };

    setTimeout(executeScroll, 50);
    setTimeout(executeScroll, 180);
  }, []);

  useEffect(() => {
    if (currentPage === 'blood-donation/find-donor') {
      setActiveTab('find-donor');
    } else if (currentPage === 'blood-donation/become-donor') {
      setActiveTab('become-donor');
      scrollToFormSection('become-donor');
    } else if (currentPage === 'blood-donation/update-donor') {
      setActiveTab('update-donor');
      scrollToFormSection('update-donor');
    } else if (currentPage === 'blood-donation/emergency-request') {
      setActiveTab('emergency-request');
      scrollToFormSection('emergency-request');
    } else if (currentPage === 'blood-donation/statistics') {
      setActiveTab('statistics');
      scrollToFormSection('statistics');
    } else if (initialTab) {
      setActiveTab(initialTab);
      if (initialTab !== 'find-donor') {
        scrollToFormSection(initialTab);
      }
    }
  }, [currentPage, initialTab, scrollToFormSection]);

  // Modals state
  const [selectedDonorForProfile, setSelectedDonorForProfile] = useState<BloodDonor | null>(null);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<BloodDonor | null>(null);

  // ----------------------------------------------------
  // IMAGE CROPPER & ZOOM MODAL STATE (1:1 Aspect Ratio)
  // ----------------------------------------------------
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageUrl, setCropperImageUrl] = useState('');
  const [cropperTitle, setCropperTitle] = useState('');
  const [cropperCallback, setCropperCallback] = useState<((croppedUrl: string) => void) | null>(null);

  // ----------------------------------------------------
  // SEARCH & FILTER STATE (FIND A DONOR)
  // ----------------------------------------------------
  const [searchBloodGroup, setSearchBloodGroup] = useState<string>('ALL');
  const [searchGender, setSearchGender] = useState<string>('ALL');
  const [searchDistrict, setSearchDistrict] = useState<string>('ALL');
  const [searchUpazila, setSearchUpazila] = useState<string>('ALL');
  const [searchArea, setSearchArea] = useState<string>('');
  const [searchAvailability, setSearchAvailability] = useState<string>('ALL');
  const [searchOrgCategory, setSearchOrgCategory] = useState<string>('ALL');

  // Pagination for Donors Directory (12 for 3-column desktop grid alignment)
  const [displayCount, setDisplayCount] = useState<number>(12);

  // Available Upazilas for selected district in search
  const availableUpazilas = useMemo(() => {
    if (searchDistrict === 'ALL') return [];
    return getUpazilasForDistrict(searchDistrict);
  }, [searchDistrict]);

  // ----------------------------------------------------
  // BECOME A DONOR FORM STATE
  // ----------------------------------------------------
  const [regFullName, setRegFullName] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('O+');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other' | string>('Male');
  const [regDateOfBirth, setRegDateOfBirth] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhotoUrl, setRegPhotoUrl] = useState('');
  const [regPhotoFileName, setRegPhotoFileName] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const regPhotoInputRef = useRef<HTMLInputElement>(null);
  const [regDistrict, setRegDistrict] = useState('Chattogram');
  const [regUpazila, setRegUpazila] = useState('Hathazari');
  const [regArea, setRegArea] = useState('');
  const [regDetailedAddress, setRegDetailedAddress] = useState('');
  const [regOrgCategory, setRegOrgCategory] = useState('Open Voluntary Blood Donor');
  const [regCommitteePosition, setRegCommitteePosition] = useState('');
  const [regAvailability, setRegAvailability] = useState<DonorAvailabilityStatus>('AVAILABLE_EMERGENCY');
  const [regLastDonationDate, setRegLastDonationDate] = useState('');
  const [regTotalDonations, setRegTotalDonations] = useState<number>(0);
  const [regExperienceNotes, setRegExperienceNotes] = useState('');
  const [regConsent, setRegConsent] = useState(true);
  const [regShowPhone, setRegShowPhone] = useState(true);
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [regRefId, setRegRefId] = useState('');
  const [regWhatsAppUrl, setRegWhatsAppUrl] = useState('');
  const [regFormError, setRegFormError] = useState<string | null>(null);

  // Handle Donor Photo Selection with interactive Crop & Zoom Modal
  const handleDonorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setRegFormError(
        isBn
          ? 'অনুগ্রহ করে JPG, JPEG, PNG বা WebP ফরম্যাটের ছবি আপলোড করুন।'
          : 'Please upload a JPG, JPEG, PNG, or WebP format image.'
      );
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setRegFormError(
        isBn
          ? 'ছবির সাইজ ১০ মেগাবাইট (10MB)-এর কম হতে হবে।'
          : 'Image size must be under 10MB.'
      );
      return;
    }

    setRegPhotoFileName(file.name);
    setRegFormError(null);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const src = readerEvent.target?.result as string;
      if (src) {
        setCropperImageUrl(src);
        setCropperTitle(isBn ? 'রক্তদাতার ছবি ক্রপ ও জুম এডিটর (১:১)' : 'Donor Photo Zoom & Crop (1:1)');
        setCropperCallback(() => (croppedUrl: string) => {
          setRegPhotoUrl(croppedUrl);
        });
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenPhotoCropper = (currentUrl: string, isUpdate: boolean = false) => {
    if (!currentUrl) return;
    setCropperImageUrl(currentUrl);
    setCropperTitle(isBn ? 'ছবি ক্রপ ও জুম এডিটর (১:১)' : 'Photo Zoom & Crop (1:1)');
    setCropperCallback(() => (croppedUrl: string) => {
      if (isUpdate) {
        setUpdPhotoUrl(croppedUrl);
      } else {
        setRegPhotoUrl(croppedUrl);
      }
    });
    setCropperOpen(true);
  };

  const handleRemoveDonorPhoto = () => {
    setRegPhotoUrl('');
    setRegPhotoFileName('');
    if (regPhotoInputRef.current) {
      regPhotoInputRef.current.value = '';
    }
  };

  const resetDonorRegistrationForm = () => {
    setRegFullName('');
    setRegBloodGroup('O+');
    setRegGender('Male');
    setRegDateOfBirth('');
    setRegPhone('');
    setRegEmail('');
    setRegPhotoUrl('');
    setRegPhotoFileName('');
    if (regPhotoInputRef.current) {
      regPhotoInputRef.current.value = '';
    }
    setRegDistrict('Chattogram');
    setRegUpazila('Hathazari');
    setRegArea('');
    setRegDetailedAddress('');
    setRegOrgCategory('Open Voluntary Blood Donor');
    setRegCommitteePosition('');
    setRegAvailability('AVAILABLE_EMERGENCY');
    setRegLastDonationDate('');
    setRegTotalDonations(0);
    setRegExperienceNotes('');
    setRegConsent(true);
    setRegShowPhone(true);
    setRegFormError(null);
    setRegSubmitted(false);
    setRegWhatsAppUrl('');
  };

  // ----------------------------------------------------
  // DONOR SELF-UPDATE FORM STATE (WITH ADMIN WHATSAPP SUBMISSION)
  // ----------------------------------------------------
  const [updSearchQuery, setUpdSearchQuery] = useState('');
  const [updSearchError, setUpdSearchError] = useState<string | null>(null);
  const [matchedDonor, setMatchedDonor] = useState<BloodDonor | null>(null);
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState<string>('');

  // Form Fields for Update
  const [updFullName, setUpdFullName] = useState('');
  const [updBloodGroup, setUpdBloodGroup] = useState<BloodGroup>('O+');
  const [updGender, setUpdGender] = useState<'Male' | 'Female' | 'Other' | string>('Male');
  const [updDateOfBirth, setUpdDateOfBirth] = useState('');
  const [updPhone, setUpdPhone] = useState('');
  const [updEmail, setUpdEmail] = useState('');
  const [updPhotoUrl, setUpdPhotoUrl] = useState('');
  const [updPhotoFileName, setUpdPhotoFileName] = useState('');
  const [updDistrict, setUpdDistrict] = useState('Chattogram');
  const [updUpazila, setUpdUpazila] = useState('Hathazari');
  const [updArea, setUpdArea] = useState('');
  const [updDetailedAddress, setUpdDetailedAddress] = useState('');
  const [updOrgCategory, setUpdOrgCategory] = useState('Open Voluntary Blood Donor');
  const [updCommitteePosition, setUpdCommitteePosition] = useState('');
  const [updAvailability, setUpdAvailability] = useState<DonorAvailabilityStatus>('AVAILABLE_EMERGENCY');
  const [updLastDonationDate, setUpdLastDonationDate] = useState('');
  const [updTotalDonations, setUpdTotalDonations] = useState<number>(0);
  const [updExperienceNotes, setUpdExperienceNotes] = useState('');
  const [updShowPhone, setUpdShowPhone] = useState(true);
  const [updFormError, setUpdFormError] = useState<string | null>(null);
  const [updSubmitted, setUpdSubmitted] = useState(false);
  const [isUpdatingDonor, setIsUpdatingDonor] = useState(false);
  const updPhotoInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Upazilas for Update form
  const availableUpazilasForUpdate = useMemo(() => {
    return getUpazilasForDistrict(updDistrict);
  }, [updDistrict]);

  const populateUpdateForm = (rawDonor: BloodDonor) => {
    const donor = cleanBloodDonor(rawDonor);
    setMatchedDonor(donor);
    setUpdFullName(toSafeString(donor.fullName, ''));
    setUpdBloodGroup(donor.bloodGroup || 'O+');
    setUpdGender(donor.gender || 'Male');
    setUpdDateOfBirth(toSafeString(donor.dateOfBirth || donor.dob, ''));
    setUpdPhone(toSafeString(donor.phone, ''));
    setUpdEmail(toSafeString(donor.email, ''));
    setUpdPhotoUrl(toSafeString(donor.photoUrl, ''));
    setUpdPhotoFileName('');
    setUpdDistrict(toSafeString(donor.district, 'Chattogram'));
    setUpdUpazila(toSafeString(donor.upazila, 'Hathazari'));
    setUpdArea(toSafeString(donor.area, ''));
    setUpdDetailedAddress(toSafeString(donor.detailedAddress, ''));
    setUpdOrgCategory(toSafeString(donor.orgCategory, 'Open Voluntary Blood Donor'));
    setUpdCommitteePosition(toSafeString(donor.committeePosition, ''));
    setUpdAvailability(donor.availabilityStatus || 'AVAILABLE_EMERGENCY');
    setUpdLastDonationDate(toSafeString(donor.lastDonationDate, ''));
    setUpdTotalDonations(Number(donor.totalDonations) || 0);
    setUpdExperienceNotes(toSafeString(donor.experienceNotes, ''));
    setUpdShowPhone(donor.gender === 'Male' ? true : Boolean(donor.showPhonePublicly));
    setUpdFormError(null);
    setUpdSubmitted(false);
    setUpdSearchError(null);
    setUpdSearchQuery(toSafeString(donor.phone || donor.id, ''));
  };

  const handleSearchDonorForUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUpdSearchError(null);
    const query = updSearchQuery.trim();
    if (!query) {
      setUpdSearchError(
        isBn
          ? 'অনুগ্রহ করে আপনার নিবন্ধিত মোবাইল নম্বর বা ডোনার আইডি প্রদান করুন।'
          : 'Please enter your registered phone number or Donor ID.'
      );
      return;
    }

    const cleanQuery = query.replace(/\D/g, '');
    const found = bloodDonors.find(d => {
      if (d.id.toLowerCase() === query.toLowerCase()) return true;
      const cleanPhone = d.phone ? d.phone.replace(/\D/g, '') : '';
      if (cleanQuery.length >= 10 && cleanPhone.includes(cleanQuery)) return true;
      if (d.phone && d.phone.includes(query)) return true;
      return false;
    });

    if (found) {
      populateUpdateForm(found);
    } else {
      setUpdSearchError(
        isBn
          ? 'প্রদত্ত মোবাইল নম্বর বা আইডি অনুযায়ী কোনো রক্তদাতার তথ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন অথবা নতুন রক্তদাতা হিসেবে নিবন্ধন করুন।'
          : 'No donor profile found with this mobile number or ID. Please check the number or register as a new donor.'
      );
    }
  };

  const handleResetUpdateFlow = () => {
    setMatchedDonor(null);
    setUpdSearchQuery('');
    setUpdSubmitted(false);
    setUpdFormError(null);
    setUpdSearchError(null);
    setSubmittedWhatsAppUrl('');
  };

  // One-click "Donated Today" action (Sets last donation to today, adds +1 to total donations, sets cooldown)
  const handleSetDonatedToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setUpdLastDonationDate(todayStr);
    setUpdTotalDonations(prev => (Number(prev) || 0) + 1);
    setUpdAvailability('UNAVAILABLE');
    if (updFormError?.includes('তারিখ') || updFormError?.includes('date')) {
      setUpdFormError(null);
    }
  };

  // Handle Photo selection with Cropper in Update Form
  const handleUpdatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUpdFormError(
        isBn
          ? 'অনুগ্রহ করে JPG, JPEG, PNG বা WebP ফরম্যাটের ছবি আপলোড করুন।'
          : 'Please upload a JPG, JPEG, PNG, or WebP format image.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUpdFormError(
        isBn
          ? 'ছবির সাইজ ১০ মেগাবাইট (10MB)-এর কম হতে হবে।'
          : 'Image size must be under 10MB.'
      );
      return;
    }

    setUpdPhotoFileName(file.name);
    setUpdFormError(null);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const src = readerEvent.target?.result as string;
      if (src) {
        setCropperImageUrl(src);
        setCropperTitle(isBn ? 'রক্তদাতার নতুন ছবি ক্রপ ও জুম এডিটর (১:১)' : 'Donor Photo Zoom & Crop (1:1)');
        setCropperCallback(() => (croppedUrl: string) => {
          setUpdPhotoUrl(croppedUrl);
        });
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveUpdatePhoto = () => {
    setUpdPhotoUrl('');
    setUpdPhotoFileName('');
    if (updPhotoInputRef.current) {
      updPhotoInputRef.current.value = '';
    }
  };

  const handleDonorUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedDonor) return;
    setUpdFormError(null);

    if (!updFullName.trim() || !updPhone.trim() || !updDistrict || !updUpazila || !updDateOfBirth || updDateOfBirth.length < 10) {
      setUpdFormError(
        isBn
          ? 'অনুগ্রহ করে জন্ম তারিখসহ (দিন, মাস, বছর) সকল আবশ্যকীয় তথ্য সঠিকভাবে পূরণ করুন।'
          : 'Please fill in all required fields including a complete Date of Birth (Day, Month, Year).'
      );
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (updDateOfBirth > todayStr) {
      setUpdFormError(isBn ? 'জন্ম তারিখ আজকের বা অতীতের তারিখ হতে হবে।' : 'Date of birth cannot be in the future.');
      return;
    }

    const calculatedAge = calculateAge(updDateOfBirth);
    if (calculatedAge !== null && calculatedAge < 18) {
      setUpdFormError(
        isBn
          ? `স্বেচ্ছায় রক্তদানের জন্য প্রার্থীর বয়স কমপক্ষে ১৮ বছর হতে হবে (আপনার বর্তমান বয়স ${calculatedAge} বছর)।`
          : `Minimum age required for voluntary blood donation is 18 years (current calculated age is ${calculatedAge} years).`
      );
      return;
    }

    const cleanPhone = updPhone.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setUpdFormError(
        isBn
          ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 018XXXXXXXX)'
          : 'Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 018XXXXXXXX)'
      );
      return;
    }

    if (updLastDonationDate && updLastDonationDate > todayStr) {
      setUpdFormError(
        isBn
          ? 'সর্বশেষ রক্তদানের তারিখ আজকের বা অতীতের তারিখ হতে হবে, ভবিষ্যতের তারিখ নির্বাচন করা যাবে না।'
          : 'Last donation date cannot be in the future. Please select today or a past date.'
      );
      return;
    }

    setIsUpdatingDonor(true);
    try {
      // 1. Update with PENDING status so Admin verifies & approves
      updateBloodDonor(matchedDonor.id, {
        fullName: updFullName.trim(),
        bloodGroup: updBloodGroup,
        gender: updGender,
        dateOfBirth: updDateOfBirth || undefined,
        dob: updDateOfBirth || undefined,
        phone: cleanPhone,
        email: updEmail.trim() || undefined,
        photoUrl: updPhotoUrl.trim() || undefined,
        district: updDistrict,
        upazila: updUpazila,
        area: updArea.trim(),
        detailedAddress: updDetailedAddress.trim() || undefined,
        orgCategory: updOrgCategory,
        committeePosition: updCommitteePosition.trim() || undefined,
        availabilityStatus: updAvailability,
        lastDonationDate: updLastDonationDate || undefined,
        totalDonations: Number(updTotalDonations) || 0,
        experienceNotes: updExperienceNotes.trim() || undefined,
        showPhonePublicly: updGender === 'Male' ? true : updShowPhone,
        approvalStatus: 'APPROVED', // Live immediately across Directory and Stats
        updatedAt: new Date().toISOString()
      });

      // 2. Generate WhatsApp message for Admin
      const cleanHelpline = (bloodDonationSettings.emergencyHelpline || '+8801839008339').replace(/[^0-9]/g, '');
      const lastDonationText = updLastDonationDate
        ? `${updLastDonationDate} (${updLastDonationDate === todayStr ? 'আজকে রক্তদান করেছি' : 'সর্বশেষ তারিখ'})`
        : 'রেকর্ড নেই';
      const availabilityText = updAvailability === 'AVAILABLE_EMERGENCY'
        ? 'জরুরি প্রয়োজনে প্রস্তুত'
        : updAvailability === 'AVAILABLE_NOTICE'
        ? 'নোটিশ সাপেক্ষে প্রস্তুত'
        : 'সাময়িক অনুপলব্ধ';

      const whatsappMsg = encodeURIComponent(
        `আসসালামু আলাইকুম অ্যাডমিন,\nআমি ${updFullName.trim()} (রক্তদাতা আইডি: ${matchedDonor.id}, মোবাইল: ${cleanPhone})।\nআমি ইনফিনিটি বাংলাদেশ ব্লাড নেটওয়ার্কে আমার রক্তদানের তথ্য / প্রোফাইল আপডেট করেছি।\n\n📋 আপডেটের বিবরণ:\n• রক্ত গ্রুপ: ${updBloodGroup}\n• সর্বশেষ রক্তদান: ${lastDonationText}\n• মোট রক্তদান: ${updTotalDonations || 0} বার\n• অবস্থান: ${updArea ? updArea + ', ' : ''}${updUpazila}, ${updDistrict}\n• প্রাপ্যতা: ${availabilityText}\n\nঅনুগ্রহ করে আমার মোবাইল নম্বর যাচাই করে অ্যাডমিন ড্যাশবোর্ড থেকে আমার প্রোফাইল আপডেটটি অনুমোদন (Approve) করুন। ধন্যবাদ।`
      );
      const waUrl = `https://wa.me/${cleanHelpline}?text=${whatsappMsg}`;
      setSubmittedWhatsAppUrl(waUrl);

      // Open WhatsApp automatically
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        // Pop-up blocker fallback handled in UI
      }

      setUpdSubmitted(true);
    } catch (err) {
      setUpdFormError(isBn ? 'তথ্য হালনাগাদ করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to update donor information. Please try again.');
    } finally {
      setIsUpdatingDonor(false);
    }
  };

  // ----------------------------------------------------
  // EMERGENCY BLOOD REQUEST FORM STATE
  // ----------------------------------------------------
  const [emgRequesterName, setEmgRequesterName] = useState('');
  const [emgContactNumber, setEmgContactNumber] = useState('');
  const [emgPatientName, setEmgPatientName] = useState('');
  const [emgBloodGroup, setEmgBloodGroup] = useState<BloodGroup>('O+');
  const [emgUnits, setEmgUnits] = useState<number>(1);
  const [emgHospital, setEmgHospital] = useState('');
  const [emgDistrict, setEmgDistrict] = useState('Chattogram');
  const [emgUpazila, setEmgUpazila] = useState('Hathazari');
  const [emgUrgency, setEmgUrgency] = useState<EmergencyLevel>('URGENT');
  const [emgRequiredDate, setEmgRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [emgNotes, setEmgNotes] = useState('');
  const [emgSubmitted, setEmgSubmitted] = useState(false);
  const [emgRefId, setEmgRefId] = useState('');
  const [emgFormError, setEmgFormError] = useState<string | null>(null);

  // ----------------------------------------------------
  // LIVE COMPUTED STATISTICS
  // ----------------------------------------------------
  const stats = useMemo(() => {
    const approvedDonors = bloodDonors.filter(d => d.approvalStatus === 'APPROVED');
    const activeDonors = approvedDonors.filter(d => d.availabilityStatus === 'AVAILABLE_EMERGENCY');
    const totalDonationsCount = approvedDonors.reduce((acc, d) => acc + (d.totalDonations || 0), 0);

    const groupCounts: Record<BloodGroup, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
    };

    approvedDonors.forEach(d => {
      if (groupCounts[d.bloodGroup] !== undefined) {
        groupCounts[d.bloodGroup]++;
      }
    });

    const activeEmergencyRequests = emergencyBloodRequests.filter(
      r => r.status === 'PENDING' || r.status === 'PROCESSING'
    );

    return {
      totalDonors: approvedDonors.length,
      activeDonors: activeDonors.length,
      totalGroups: 8,
      totalDonations: totalDonationsCount,
      groupCounts,
      activeEmergencyRequests: activeEmergencyRequests.length
    };
  }, [bloodDonors, emergencyBloodRequests]);

  // ----------------------------------------------------
  // FILTERED DONORS FOR SEARCH
  // ----------------------------------------------------
  const filteredDonors = useMemo(() => {
    return bloodDonors.filter(d => {
      if (d.approvalStatus !== 'APPROVED') return false;
      if (searchBloodGroup !== 'ALL' && d.bloodGroup !== searchBloodGroup) return false;
      if (searchGender !== 'ALL' && (d.gender || 'Male') !== searchGender) return false;
      if (searchDistrict !== 'ALL' && d.district.toLowerCase() !== searchDistrict.toLowerCase()) return false;
      if (searchUpazila !== 'ALL' && d.upazila.toLowerCase() !== searchUpazila.toLowerCase()) return false;
      if (searchArea.trim() && !d.area.toLowerCase().includes(searchArea.toLowerCase())) return false;
      if (searchAvailability !== 'ALL' && d.availabilityStatus !== searchAvailability) return false;
      if (searchOrgCategory !== 'ALL' && d.orgCategory !== searchOrgCategory) return false;
      return true;
    });
  }, [
    bloodDonors,
    searchBloodGroup,
    searchGender,
    searchDistrict,
    searchUpazila,
    searchArea,
    searchAvailability,
    searchOrgCategory
  ]);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleDonorRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegFormError(null);

    if (!regFullName.trim() || !regPhone.trim() || !regDistrict || !regUpazila || !regDateOfBirth || regDateOfBirth.length < 10) {
      setRegFormError(isBn ? 'অনুগ্রহ করে জন্ম তারিখসহ (দিন, মাস, বছর) সকল আবশ্যকীয় তথ্য সঠিকভাবে পূরণ করুন।' : 'Please fill in all required fields including a complete Date of Birth (Day, Month, Year).');
      return;
    }

    // Validate Date of Birth
    const todayStr = new Date().toISOString().split('T')[0];
    if (regDateOfBirth > todayStr) {
      setRegFormError(isBn ? 'জন্ম তারিখ আজকের বা অতীতের তারিখ হতে হবে।' : 'Date of birth cannot be in the future.');
      return;
    }

    const calculatedAge = calculateAge(regDateOfBirth);
    if (calculatedAge !== null && calculatedAge < 18) {
      setRegFormError(
        isBn
          ? `স্বেচ্ছায় রক্তদানের জন্য প্রার্থীর বয়স কমপক্ষে ১৮ বছর হতে হবে (আপনার বর্তমান বয়স ${calculatedAge} বছর)।`
          : `Minimum age required for voluntary blood donation is 18 years (current calculated age is ${calculatedAge} years).`
      );
      return;
    }

    // Validate 11-digit BD Phone Number (e.g. 01XXXXXXXXX)
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setRegFormError(
        isBn
          ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 018XXXXXXXX)'
          : 'Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 018XXXXXXXX)'
      );
      return;
    }

    // Validate No Future Dates for Blood Donation
    if (regLastDonationDate && regLastDonationDate > todayStr) {
      setRegFormError(
        isBn
          ? 'সর্বশেষ রক্তদানের তারিখ আজকের বা অতীতের তারিখ হতে হবে, ভবিষ্যতের তারিখ নির্বাচন করা যাবে না।'
          : 'Last donation date cannot be in the future. Please select today or a past date.'
      );
      return;
    }

    const newDonor = addBloodDonor({
      fullName: regFullName.trim(),
      bloodGroup: regBloodGroup,
      gender: regGender,
      dateOfBirth: regDateOfBirth,
      dob: regDateOfBirth,
      phone: cleanPhone,
      email: regEmail.trim() || undefined,
      photoUrl: regPhotoUrl.trim() || undefined,
      district: regDistrict,
      upazila: regUpazila,
      area: regArea.trim(),
      detailedAddress: regDetailedAddress.trim() || undefined,
      orgCategory: regOrgCategory,
      committeePosition: regCommitteePosition.trim() || undefined,
      availabilityStatus: regAvailability,
      lastDonationDate: regLastDonationDate || undefined,
      totalDonations: Number(regTotalDonations) || 0,
      experienceNotes: regExperienceNotes.trim() || undefined,
      isVerified: false,
      approvalStatus: 'PENDING', // Sent to Admin Pending Queue for review & approval
      privacyConsent: regConsent,
      showPhonePublicly: regGender === 'Male' ? true : regShowPhone,
      donationHistory: []
    });

    const cleanHelpline = (bloodDonationSettings.emergencyHelpline || '+8801839008339').replace(/[^0-9]/g, '');
    const lastDonationText = regLastDonationDate ? `${regLastDonationDate}` : 'রেকর্ড নেই';
    const whatsappMsg = encodeURIComponent(
      `আসসালামু আলাইকুম অ্যাডমিন,\nআমি ${regFullName.trim()} (রক্তের গ্রুপ: ${regBloodGroup}, মোবাইল: ${cleanPhone})।\nআমি ইনফিনিটি বাংলাদেশ রক্তদান নেটওয়ার্কে নতুন রক্তদাতা হিসেবে রেজিস্ট্রেশন করেছি।\n\n📋 রেজিস্ট্রেশন বিবরণ:\n• রেফারেন্স আইডি: ${newDonor.id}\n• রক্তের গ্রুপ: ${regBloodGroup}\n• অবস্থান: ${regArea ? regArea.trim() + ', ' : ''}${regUpazila}, ${regDistrict}\n• সর্বশেষ রক্তদান: ${lastDonationText}\n\nঅনুগ্রহ করে আমার আবেদনটি যাচাই করে অ্যাডমিন ড্যাশবোর্ড থেকে অনুমোদন (Approve) করুন। ধন্যবাদ।`
    );
    const waUrl = `https://wa.me/${cleanHelpline}?text=${whatsappMsg}`;
    setRegWhatsAppUrl(waUrl);

    setRegRefId(newDonor.id);
    setRegSubmitted(true);
  };

  const handleEmergencyRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emgRequesterName.trim() || !emgContactNumber.trim() || !emgPatientName.trim() || !emgHospital.trim()) return;

    // Validate 11-digit BD Phone Number
    const cleanPhone = emgContactNumber.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      alert(
        isBn
          ? 'যোগাযোগের জন্য সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 018XXXXXXXX)'
          : 'Please enter a valid 11-digit Bangladeshi contact number (e.g. 018XXXXXXXX)'
      );
      return;
    }

    // Auto-match donors
    const matched = bloodDonors.filter(
      d => d.approvalStatus === 'APPROVED' && d.bloodGroup === emgBloodGroup && d.availabilityStatus !== 'UNAVAILABLE'
    ).map(d => d.id);

    const newReq = addEmergencyBloodRequest({
      requesterName: emgRequesterName.trim(),
      contactNumber: cleanPhone,
      patientName: emgPatientName.trim(),
      bloodGroup: emgBloodGroup,
      unitsNeeded: Number(emgUnits) || 1,
      hospitalName: emgHospital.trim(),
      district: emgDistrict,
      upazila: emgUpazila,
      emergencyLevel: emgUrgency,
      requiredDate: emgRequiredDate,
      additionalNotes: emgNotes.trim() || undefined,
      matchedDonorIds: matched
    });

    const cleanHelpline = (bloodDonationSettings.emergencyHelpline || '+8801839008339').replace(/[^0-9]/g, '');
    const emgWhatsAppMsg = encodeURIComponent(
      `🚨 জরুরি রক্তের আবেদন!\n\n📋 বিবরণ:\n• রোগীর নাম: ${emgPatientName.trim()}\n• রক্তের গ্রুপ: ${emgBloodGroup} (${emgUnits || 1} ব্যাগ)\n• হাসপাতাল: ${emgHospital.trim()}\n• অবস্থান: ${emgUpazila}, ${emgDistrict}\n• যোগাযোগের নম্বর: ${cleanPhone}\n• প্রয়োজনীয় তারিখ: ${emgRequiredDate || 'জরুরি'}\n• অনুরোধকারী: ${emgRequesterName.trim()}\n\nঅনুগ্রহ করে জরুরিভাবে রক্তদাতা সমন্বয়ে সহায়তা করুন।`
    );
    const emgWaUrl = `https://wa.me/${cleanHelpline}?text=${emgWhatsAppMsg}`;

    try {
      window.open(emgWaUrl, '_blank');
    } catch (e) {
      // Pop-up blocker fallback
    }

    setEmgRefId(newReq.id);
    setEmgSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] pb-16 sm:pb-24">
      {/* 1. HERO SECTION & LIVE STATISTICS */}
      <section className="relative overflow-hidden bg-[#062119] bg-gradient-to-b from-[#041E16] via-[#08281F] to-[#051C14] text-white pt-10 sm:pt-14 pb-14 sm:pb-16 border-b border-emerald-950/60">
        <div className="absolute inset-0 bg-[radial-gradient(#006A4E_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Hero Brand Hierarchy & Live Stats */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <ScrollReveal effect="fade-up" delay={0.1}>
                {/* Top Badge: Emergency Blood Donation & Coordination */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#0D2E24]/90 text-emerald-200 border border-emerald-700/30 backdrop-blur-md shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {tText(bloodDonationSettings.heroBadge) || (isBn ? 'জরুরি রক্তদান ও সমন্বয় নেটওয়ার্ক' : 'Emergency Blood Donation & Coordination')}
                  </span>
                </div>

                {/* Sub-brand Main Logo with Signature Opening Animation */}
                <div className="pt-1 flex items-center justify-center lg:justify-start">
                  <LifeLineHeroLogoAnimation
                    logoUrl={bloodDonationSettings.wingLogoUrl || '/brand/Infinitylifeline-logo.svg'}
                    logoSize={bloodDonationSettings.wingLogoSize || 480}
                    logoZoom={bloodDonationSettings.wingLogoZoom || 1}
                    logoCrop={bloodDonationSettings.wingLogoCrop || 'contain'}
                  />
                </div>

                {/* Initiative Subtitle */}
                <div className="mt-3 text-center lg:text-left">
                  <p className="text-xs sm:text-sm text-emerald-100/85 font-medium max-w-xl leading-relaxed flex items-center justify-center lg:justify-start gap-1.5">
                    <span>
                      {tText(bloodDonationSettings.heroSubtitle) || (
                        isBn
                          ? 'ইনফিনিটি বাংলাদেশ-এর একটি জরুরি মানবিক রক্তদান উদ্যোগ 🩸'
                          : 'An Emergency Blood Donation Initiative by Infinity Bangladesh 🩸'
                      )}
                    </span>
                  </p>
                </div>

                {/* 4 Dynamic Statistics Counters (matching screenshot exactly) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
                  {/* 1. Total Donors */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2A21]/90 backdrop-blur-md border border-emerald-800/30 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-emerald-500/40 transition-all">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      <AnimatedCounter value={Number(bloodDonationSettings.statTotalDonorsOverride ?? stats.totalDonors) || 0} />
                    </p>
                    <p className="text-[11px] font-medium text-slate-300">
                      {tText(bloodDonationSettings.statTotalDonorsLabel) || (isBn ? 'নিবন্ধিত রক্তদাতা' : 'Total Donors')}
                    </p>
                  </div>

                  {/* 2. Active Donors */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2A21]/90 backdrop-blur-md border border-emerald-800/30 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-emerald-500/40 transition-all">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      <AnimatedCounter value={Number(bloodDonationSettings.statActiveDonorsOverride ?? stats.activeDonors) || 0} />
                    </p>
                    <p className="text-[11px] font-medium text-slate-300">
                      {tText(bloodDonationSettings.statActiveDonorsLabel) || (isBn ? 'জরুরিতে প্রস্তুত' : 'Active Donors')}
                    </p>
                  </div>

                  {/* 3. Blood Groups */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2A21]/90 backdrop-blur-md border border-emerald-800/30 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-rose-500/40 transition-all">
                    <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      {bloodDonationSettings.statGroupsValue ? (
                        bloodDonationSettings.statGroupsValue
                      ) : (
                        <><AnimatedCounter value={stats.totalGroups} />/8</>
                      )}
                    </p>
                    <p className="text-[11px] font-medium text-slate-300">
                      {tText(bloodDonationSettings.statGroupsLabel) || (isBn ? 'সকল ব্লাড গ্রুপ' : 'Blood Groups')}
                    </p>
                  </div>

                  {/* 4. Lives Impacted */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2A21]/90 backdrop-blur-md border border-emerald-800/30 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-amber-500/40 transition-all">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-display">
                      <AnimatedCounter
                        value={
                          `${(bloodDonationSettings.statImpactOverride !== null && bloodDonationSettings.statImpactOverride !== undefined
                            ? Number(bloodDonationSettings.statImpactOverride) || 0
                            : Number(stats.totalDonations) || 0)}+`
                        }
                      />
                    </p>
                    <p className="text-[11px] font-medium text-slate-300">
                      {tText(bloodDonationSettings.statImpactLabel) || (isBn ? 'মোট রক্তদান সম্পন্ন' : 'Lives Impacted')}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Hero CTA Card (matching screenshot) */}
            <div className="lg:col-span-5 relative">
              <ScrollReveal effect="slide-left" delay={0.2}>
                <div className="relative rounded-[32px] bg-white p-7 sm:p-8 text-slate-900 shadow-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Droplet className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        {tText(bloodDonationSettings.heroCtaBadge) || (isBn ? 'মানবতার আহ্বান' : 'JOIN THE CAUSE')}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-0.5">
                        {tText(bloodDonationSettings.heroCtaTitle) || (isBn ? 'রক্তদাতা হোন, জীবন বাঁচান' : 'Be a Donor, Be a Hero')}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {tText(bloodDonationSettings.heroCtaDescription) || (isBn
                      ? 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি মূল্যবান প্রাণ। টিম ইনফিনিটির সাথে রক্তদাতা হিসেবে যুক্ত হতে এখনই রেজিস্ট্রেশন করুন।'
                      : 'Every drop counts. Register as a voluntary blood donor with Team Infinity and become someone’s lifeline in moments of crisis.')}
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => scrollToFormSection('become-donor')}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#006A4E] hover:bg-[#00553E] text-white font-extrabold text-sm shadow-warm-md transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {tText(bloodDonationSettings.heroCtaBtn1Text) || (isBn ? 'রক্তদাতা হতে রেজিস্ট্রেশন করুন' : 'Become a Donor')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToFormSection('emergency-request')}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-sm shadow-warm-md transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {tText(bloodDonationSettings.heroCtaBtn2Text) || (isBn ? 'জরুরি রক্তের আবেদন করুন' : 'Emergency Blood Request')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToFormSection('update-donor')}
                      className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#006A4E] border border-[#006A4E]/25 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:border-[#006A4E]/50 active:scale-98"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>
                        {isBn ? 'ইতিমধ্যে রক্তদাতা? তথ্য বা শেষ রক্তদানের তারিখ আপডেট করুন' : 'Already a Donor? Update Profile / Last Donation'}
                      </span>
                    </button>
                  </div>

                  {/* 24/7 Helpline Badge */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Phone className="w-4 h-4 text-[#006A4E]" />
                      <span>
                        {tText(bloodDonationSettings.helplineLabel) || (isBn ? '২৪/৭ ব্লাড হেল্পলাইন:' : '24/7 Helpline:')}
                      </span>
                    </div>
                    <a
                      href={`tel:${bloodDonationSettings.emergencyHelpline}`}
                      className="font-extrabold text-[#006A4E] hover:underline"
                    >
                      {bloodDonationSettings.emergencyHelpline}
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <section id="blood-tabs-nav" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 scroll-smooth">
              {[
                { id: 'find-donor', label: isBn ? 'রক্তদাতা খুঁজুন' : 'Find a Donor', icon: Search },
                { id: 'become-donor', label: isBn ? 'রক্তদাতা হন' : 'Become a Donor', icon: UserPlus },
                { id: 'update-donor', label: isBn ? 'তথ্য হালনাগাদ' : 'Update Profile', icon: Edit3 },
                { id: 'emergency-request', label: isBn ? 'জরুরি রক্তের আবেদন' : 'Emergency Request', icon: AlertTriangle, badge: stats.activeEmergencyRequests ? `${stats.activeEmergencyRequests}` : undefined },
                { id: 'donors', label: isBn ? 'রক্তদাতা তালিকা' : 'Our Donors', icon: Users },
                { id: 'statistics', label: isBn ? 'রক্তদান পরিসংখ্যান' : 'Blood Statistics', icon: Activity },
                { id: 'guidelines', label: isBn ? 'নির্দেশিকা ও তথ্য' : 'Guidelines', icon: Info }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToFormSection(tab.id as any)}
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#006A4E] text-white shadow-warm-sm ring-2 ring-emerald-500/20 scale-[1.02]'
                        : 'bg-white hover:bg-[#FAF7F2] text-slate-700 border border-[#EAE3D9]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
      </section>

      {/* 3. TAB VIEWS CONTENT */}
      <main id="blood-main-content-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 scroll-mt-28">
        {/* ==================================================== */}
        {/* TAB 1: FIND A DONOR (ADVANCED SEARCH) */}
        {/* ==================================================== */}
        {activeTab === 'find-donor' && (
          <div className="space-y-8">
            {/* Search Filter Card */}
            <ScrollReveal effect="fade-up">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-warm-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'স্বেচ্ছাসেবী রক্তদাতা অনুসন্ধান করুন' : 'Advanced Blood Donor Search'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {isBn ? 'রক্তের গ্রুপ, জেলা এবং এলাকা নির্বাচন করে নিকটস্থ রক্তদাতা খুঁজুন' : 'Filter by blood group, district, and area to locate matching donors near you'}
                  </p>
                </div>

                <div className="text-xs font-bold text-[#006A4E] bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  {filteredDonors.length} {isBn ? 'জন উপযুক্ত রক্তদাতা প্রস্তুত' : 'Donors Matched'}
                </div>
              </div>

              {/* Blood Group Quick Selector Pills */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {isBn ? 'রক্তের গ্রুপ নির্বাচন করুন:' : 'Select Blood Group:'}
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchBloodGroup('ALL')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      searchBloodGroup === 'ALL'
                        ? 'bg-[#006A4E] text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-[#EAE3D9] hover:bg-slate-50'
                    }`}
                  >
                    {isBn ? 'সকল' : 'All'}
                  </button>
                  {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => {
                    const isSelected = searchBloodGroup === bg;
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setSearchBloodGroup(bg)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs scale-105'
                            : 'bg-white text-slate-800 border-[#EAE3D9] hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        {bg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* District */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isBn ? 'জেলা' : 'District'}</label>
                  <select
                    value={searchDistrict}
                    onChange={(e) => {
                      setSearchDistrict(e.target.value);
                      setSearchUpazila('ALL');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="ALL">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
                    {BANGLADESH_DISTRICTS.map(d => (
                      <option key={d.nameEn} value={d.nameEn}>
                        {d.nameEn} ({d.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isBn ? 'উপজেলা / থানা' : 'Upazila / Thana'}</label>
                  <select
                    value={searchUpazila}
                    onChange={(e) => setSearchUpazila(e.target.value)}
                    disabled={searchDistrict === 'ALL'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none disabled:opacity-50"
                  >
                    <option value="ALL">{isBn ? 'সকল উপজেলা' : 'All Upazilas'}</option>
                    {availableUpazilas.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isBn ? 'লিঙ্গ' : 'Gender'}</label>
                  <select
                    value={searchGender}
                    onChange={(e) => setSearchGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="ALL">{isBn ? 'সকল লিঙ্গ' : 'All Genders'}</option>
                    <option value="Male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                    <option value="Female">{isBn ? 'নারী (Female)' : 'Female'}</option>
                    <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                  </select>
                </div>

                {/* Availability */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isBn ? 'প্রাপ্যতা স্ট্যাটাস' : 'Availability'}</label>
                  <select
                    value={searchAvailability}
                    onChange={(e) => setSearchAvailability(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="ALL">{isBn ? 'সকল প্রাপ্যতা' : 'All Availability'}</option>
                    <option value="AVAILABLE_EMERGENCY">🟢 {isBn ? 'জরুরি রক্তদানে প্রস্তুত' : 'Available for Emergency'}</option>
                    <option value="AVAILABLE_NOTICE">🟡 {isBn ? 'পূর্বে জানালে প্রস্তুত' : 'Available with Notice'}</option>
                  </select>
                </div>

                {/* Organization Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">{isBn ? 'সংগঠনের ক্যাটাগরি' : 'Org Category'}</label>
                  <select
                    value={searchOrgCategory}
                    onChange={(e) => setSearchOrgCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="ALL">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                    {donorCategories.map(cat => {
                      const nameEn = typeof cat.name === 'object' ? (cat.name.en || '') : cat.name;
                      const nameBn = typeof cat.name === 'object' ? (cat.name.bn || '') : '';
                      return (
                        <option key={cat.id} value={nameEn}>
                          {isBn ? (nameBn || nameEn) : nameEn}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Donor Results Grid */}
            <ScrollReveal effect="fade-up" delay={0.1} className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-lg font-extrabold text-slate-900 font-display">
                    {isBn ? 'উপলব্ধ রক্তদাতাবৃন্দ' : 'Available Blood Donors'} ({filteredDonors.length})
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#006A4E] border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isBn ? 'লাইভ ডিরেক্টরি' : 'Live Directory'}</span>
                </span>
              </div>

              {filteredDonors.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-[#EAE3D9] shadow-warm-xs space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                    <Droplet className="w-8 h-8 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 font-display">
                      {isBn ? 'কোনো রক্তদাতা খুঁজে পাওয়া যায়নি' : 'No Matching Donors Found'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isBn
                        ? 'আপনার নির্বাচিত ফিল্টারের সাথে কোনো রক্তদাতা মেলেনি। ফিল্টার পরিবর্তন করুন অথবা তাৎক্ষণিক জরুরি আবেদন পোস্ট করুন।'
                        : 'Try adjusting your search criteria or submit an emergency request to notify our voluntary coordinators.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToFormSection('emergency-request')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-warm-sm transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isBn ? 'জরুরি রক্তের আবেদন করুন' : 'Post Emergency Request'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDonors.slice(0, displayCount).map(donor => {
                    const isAvailEmg = donor.availabilityStatus === 'AVAILABLE_EMERGENCY';
                    const donorAge = calculateAge(donor.dateOfBirth || donor.dob);
                    const genderLabel = donor.gender === 'Female' ? (isBn ? 'নারী' : 'Female') : donor.gender === 'Other' ? (isBn ? 'অন্যান্য' : 'Other') : (isBn ? 'পুরুষ' : 'Male');

                    return (
                      <div
                        key={donor.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EAE3D9] shadow-warm-sm hover:shadow-warm-md transition-all hover:-translate-y-0.5 space-y-4 relative flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          {/* Card Header: Avatar, Blood Group & Availability */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-950 border-2 border-[#EAE3D9] shrink-0">
                                {donor.photoUrl ? (
                                  <img
                                    src={getAssetUrl(donor.photoUrl)}
                                    alt={donor.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-base font-extrabold font-display bg-gradient-to-br from-emerald-800 to-emerald-950">
                                    {donor.fullName.charAt(0)}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-display truncate">
                                    {donor.fullName}
                                  </h4>
                                  {donor.isVerified && (
                                    <span title="Verified Donor" className="inline-flex shrink-0">
                                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-block text-[11px] text-[#006A4E] font-bold truncate">
                                    {donor.orgCategory}
                                  </span>
                                  {(donor.gender || donorAge !== null) && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      &bull; {donor.gender ? genderLabel : ''}{donor.gender && donorAge !== null ? ', ' : ''}{donorAge !== null ? (isBn ? `${donorAge} বছর` : `${donorAge} yrs`) : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-xs font-display shadow-xs shrink-0">
                              {donor.bloodGroup}
                            </span>
                          </div>

                          {/* Location & Availability Pill */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{donor.area}, {donor.upazila}, {donor.district}</span>
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold ${
                                  isAvailEmg
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : donor.availabilityStatus === 'AVAILABLE_NOTICE'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isAvailEmg ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                <span>{isAvailEmg ? (isBn ? 'জরুরিতে প্রস্তুত' : 'Ready for Emergency') : (isBn ? 'নোটিশে প্রস্তুত' : 'With Notice')}</span>
                              </span>

                              <span className="font-bold text-slate-500">
                                {donor.totalDonations} {isBn ? 'বার রক্তদান' : 'donations'}
                              </span>
                            </div>

                            {donor.lastDonationDate && (() => {
                              const cd = getCooldownStatusInfo(donor.lastDonationDate, isBn);
                              return (
                                <div className={`flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-xl font-bold border ${cd.badgeColorClass}`}>
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{cd.badgeText}</span>
                                </div>
                              );
                            })()}

                            {/* Phone Visibility Status Pill on Card */}
                            {(() => {
                              const phoneVis = getDonorPhoneVisibility(donor);
                              if (phoneVis.reason === 'WITHIN_90_DAYS_COOLDOWN') {
                                return (
                                  <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span className="truncate">
                                      {isBn
                                        ? `🔒 রক্তদানের পর ৯০ দিন বিশ্রামে (নম্বর হাইড - আর ${phoneVis.daysRemainingIn90Days} দিন)`
                                        : `🔒 In 90d recovery (Phone hidden - ${phoneVis.daysRemainingIn90Days}d left)`}
                                    </span>
                                  </div>
                                );
                              }
                              if (phoneVis.reason === 'FEMALE_PRIVATE' || phoneVis.reason === 'OTHER_PRIVATE') {
                                return (
                                  <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                    <ShieldCheck className="w-3 h-3 text-[#006A4E] shrink-0" />
                                    <span className="truncate">
                                      {isBn ? '🔒 প্রাইভেসির জন্য নম্বর গোপন (হেল্পলাইন)' : '🔒 Private (Helpline Coordinated)'}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <div className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-xl font-bold bg-emerald-50/70 text-emerald-950 border border-emerald-200/80">
                                  <span className="flex items-center gap-1 text-[#006A4E]">
                                    <Phone className="w-3 h-3 text-[#006A4E] shrink-0" />
                                    <span>{isBn ? 'সরাসরি কল উন্মুক্ত' : 'Direct Call Public'}</span>
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-800">{donor.phone}</span>
                                </div>
                              );
                            })()}
                          </div>

                          {donor.experienceNotes && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D9]/60">
                              "{donor.experienceNotes}"
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedDonorForProfile(donor)}
                            className="py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-slate-700 font-bold text-xs border border-[#EAE3D9] transition-all cursor-pointer text-center"
                          >
                            {isBn ? 'প্রোফাইল দেখুন' : 'View Profile'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedDonorForContact(donor)}
                            className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{isBn ? 'যোগাযোগ' : 'Contact'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {filteredDonors.length > displayCount && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setDisplayCount(prev => prev + 6)}
                    className="px-6 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] text-slate-700 font-extrabold text-xs hover:bg-[#FAF7F2] shadow-warm-xs transition-all cursor-pointer"
                  >
                    {isBn ? 'আরও রক্তদাতা লোড করুন' : 'Load More Donors'} ({filteredDonors.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </ScrollReveal>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: BECOME A DONOR (REGISTRATION FORM) */}
        {/* ==================================================== */}
        {activeTab === 'become-donor' && (
          <ScrollReveal effect="fade-up">
            <div id="become-donor-section" className="max-w-3xl mx-auto space-y-8">
            {regSubmitted ? (
              <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-emerald-200 shadow-warm-lg space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006A4E] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'আপনার রক্তদাতা নিবন্ধন সফল হয়েছে!' : 'Donor Registration Submitted!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {isBn
                      ? 'স্বেচ্ছাসেবী রক্তদাতা হিসেবে আবেদনের জন্য ধন্যবাদ। আমাদের টিম শীঘ্রই তথ্য যাচাই করে আপনার প্রোফাইলটি পাবলিক ডিরেক্টরিতে সক্রিয় করবে।'
                      : 'Thank you for registering. Your profile is currently under review by Team Infinity coordinators and will be verified shortly.'}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] inline-block text-xs font-mono font-bold text-slate-700">
                  Reference ID: <span className="text-[#006A4E]">{regRefId}</span>
                </div>

                {/* Helpful Admin Notification Info Tip */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-left max-w-lg mx-auto flex items-start gap-3 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-emerald-950">
                      {isBn ? '💡 দ্রুত প্রোফাইল লাইভ করার জন্য:' : '💡 For Faster Live Verification:'}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {isBn
                        ? 'আপনার রেজিস্ট্রেশনটি অ্যাডমিন অনুমোদনের অপেক্ষায় জমা হয়েছে। ওয়েবসাইটে প্রোফাইল দ্রুত লাইভ করার জন্য আপনি চাইলে নিচের বাটনে ক্লিক করে সরাসরি অ্যাডমিনকে হোয়াটসঅ্যাপে জানিয়ে দিতে পারেন।'
                        : 'Your registration is in the admin review queue. To have your profile verified and made live on the website faster, you can optionally notify the admin via WhatsApp below.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {regWhatsAppUrl && (
                    <a
                      href={regWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isBn ? 'হোয়াটসঅ্যাপে অ্যাডমিনকে জানান' : 'Notify Admin on WhatsApp'}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      resetDonorRegistrationForm();
                      setActiveTab('find-donor');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs shadow-warm-sm transition-all cursor-pointer"
                  >
                    {isBn ? 'রক্তদাতা ডিরেক্টরিতে ফিরে যান' : 'Back to Donor Directory'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#EAE3D9] shadow-warm-md space-y-8">
                <div className="border-b border-slate-100 pb-5 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    <UserPlus className="w-3.5 h-3.5 text-[#006A4E]" />
                    <span>{isBn ? 'নতুন রক্তদাতা অন্তর্ভুক্তি' : 'Volunteer Donor Onboarding'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'রক্তদাতা হিসেবে রেজিস্ট্রেশন করুন' : 'Become a Voluntary Blood Donor'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {isBn ? 'সঠিক তথ্য প্রদান করুন। সংবেদনশীল তথ্য গোপনীয়তা নীতিমালার অধীনে সংরক্ষিত থাকবে।' : 'Please provide verified information. Your sensitive contact details will remain protected under our privacy safeguards.'}
                  </p>
                </div>

                <form onSubmit={handleDonorRegisterSubmit} className="space-y-6">
                  {/* Basic Profile */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isBn ? '১. ব্যক্তিগত তথ্য ও রক্তের গ্রুপ' : '1. Personal Details & Blood Group'}
                    </h4>

                    {/* Optional Profile Photo Upload & URL */}
                    <div className="space-y-2.5 p-4 rounded-3xl bg-[#FAF7F2] border-2 border-dashed border-[#EAE3D9] hover:border-[#006A4E] transition-colors">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#006A4E]" />
                          <span>{isBn ? 'প্রোফাইল ছবি (ঐচ্ছিক)' : 'Profile Photo (Optional)'}</span>
                        </label>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {isBn ? 'ঐচ্ছিক — ছবি ছাড়াও জমা দেওয়া যাবে' : 'Optional — Can submit without photo'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {regPhotoUrl ? (
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#006A4E] shadow-warm-sm shrink-0 bg-white group">
                            <img
                              src={getAssetUrl(regPhotoUrl)}
                              alt="Donor Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveDonorPhoto}
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer text-[10px] font-bold"
                              title={isBn ? 'ছবি মুছুন' : 'Remove Photo'}
                            >
                              <Trash2 className="w-4 h-4 text-rose-300" />
                              <span>{isBn ? 'মুছুন' : 'Remove'}</span>
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => regPhotoInputRef.current?.click()}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-[#006A4E] hover:border-[#006A4E] transition-all cursor-pointer shrink-0 shadow-2xs group"
                            title={isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload photo'}
                          >
                            <Camera className="w-7 h-7 mb-1 text-slate-400 group-hover:scale-110 group-hover:text-[#006A4E] transition-all" />
                            <span className="text-[10px] font-bold uppercase text-center px-1 text-slate-600 group-hover:text-[#006A4E]">
                              {isBn ? 'ছবি আপলোড' : 'Upload'}
                            </span>
                          </div>
                        )}

                        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1 w-full">
                          <input
                            ref={regPhotoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleDonorPhotoUpload}
                            className="hidden"
                          />
                          <div className="flex flex-wrap sm:flex-nowrap gap-2">
                            <button
                              type="button"
                              onClick={() => regPhotoInputRef.current?.click()}
                              className="px-4 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#006A4E]" />
                              <span>
                                {regPhotoUrl
                                  ? (isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo')
                                  : (isBn ? 'ডিভাইস থেকে ছবি আপলোড' : 'Upload from Device')}
                              </span>
                            </button>

                            {regPhotoUrl && (
                              <button
                                type="button"
                                onClick={() => handleOpenPhotoCropper(regPhotoUrl, false)}
                                className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006A4E] border border-emerald-300 text-xs font-bold shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                                title={isBn ? 'ছবি জুম ও ক্রপ করুন' : 'Crop & Zoom Photo'}
                              >
                                <Crop className="w-3.5 h-3.5" />
                                <span>{isBn ? 'ক্রপ / জুম করুন' : 'Crop / Zoom'}</span>
                              </button>
                            )}

                            <input
                              type="url"
                              value={regPhotoUrl.startsWith('data:') ? '' : regPhotoUrl}
                              onChange={(e) => {
                                setRegPhotoUrl(e.target.value);
                                setRegPhotoFileName('');
                              }}
                              placeholder={isBn ? 'অথবা সরাসরি ছবির লিঙ্ক দিন (URL)' : 'Or paste direct Image URL...'}
                              className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                            />
                          </div>

                          <p className="text-[11px] text-slate-500">
                            {isBn
                              ? 'JPG, PNG বা WebP ফরম্যাট। জুম ইন/আউট ও ১:১ স্কয়ার ক্রপিং সুবিধা উপলব্ধ। (ছবি না দিলেও নিবন্ধন সম্পন্ন হবে)'
                              : 'Supported: JPG, PNG, WebP. Full Zoom & 1:1 Square Cropper included. Photo is optional.'}
                          </p>

                          {regPhotoFileName && (
                            <p className="text-[11px] font-mono text-[#006A4E] truncate flex items-center justify-center sm:justify-start gap-1 font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{regPhotoFileName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name & Blood Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'পূর্ণ নাম *' : 'Full Name *'}</label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Tanvir Hossain"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none font-medium"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'রক্তের গ্রুপ *' : 'Blood Group *'}</label>
                        <select
                          value={regBloodGroup}
                          onChange={(e) => setRegBloodGroup(e.target.value as BloodGroup)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-black text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          <option value="A+">A+ (Positive)</option>
                          <option value="A-">A- (Negative)</option>
                          <option value="B+">B+ (Positive)</option>
                          <option value="B-">B- (Negative)</option>
                          <option value="O+">O+ (Positive)</option>
                          <option value="O-">O- (Negative)</option>
                          <option value="AB+">AB+ (Positive)</option>
                          <option value="AB-">AB- (Negative)</option>
                        </select>
                      </div>
                    </div>

                    {/* Gender & Date of Birth (with Age Indicator) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'লিঙ্গ (Gender) *' : 'Gender *'}</label>
                        <select
                          value={regGender}
                          onChange={(e) => {
                            const newGender = e.target.value;
                            setRegGender(newGender);
                            if (newGender === 'Male') {
                              setRegShowPhone(true);
                            }
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          <option value="Male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                          <option value="Female">{isBn ? 'নারী (Female)' : 'Female'}</option>
                          <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                        </select>
                      </div>

                      <div className="sm:col-span-8 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
                            <span>{isBn ? 'জন্ম তারিখ (Date of Birth) *' : 'Date of Birth *'}</span>
                          </label>
                          {regDateOfBirth && (() => {
                            const age = calculateAge(regDateOfBirth);
                            if (age === null) return null;
                            const isEligible = age >= 18;
                            return (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                isEligible
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                              }`}>
                                <span>{isBn ? `বয়স: ${age} বছর` : `Age: ${age} yrs`}</span>
                                <span>{isEligible ? (isBn ? '✓ (১৮+ যোগ্য)' : '✓ (Eligible)') : (isBn ? '⚠️ (১৮ এর কম)' : '⚠️ (< 18 yrs)')}</span>
                              </span>
                            );
                          })()}
                        </div>

                        <DateInput
                          value={regDateOfBirth}
                          onChange={(val) => {
                            setRegDateOfBirth(val);
                            if (!val) {
                              setRegFormError(null);
                              return;
                            }
                            const age = calculateAge(val);
                            if (age !== null && age < 18) {
                              setRegFormError(
                                isBn
                                  ? `সতর্কতা: স্বেচ্ছায় রক্তদানের জন্য প্রার্থীর বয়স কমপক্ষে ১৮ বছর হতে হবে (আপনার বর্তমান বয়স ${age} বছর)।`
                                  : `Warning: Minimum age for voluntary blood donation is 18 years (current calculated age is ${age} years).`
                              );
                            } else if (regFormError?.includes('১৮') || regFormError?.includes('18')) {
                              setRegFormError(null);
                            }
                          }}
                          isBn={isBn}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          minYear={1940}
                          maxYear={new Date().getFullYear()}
                        />

                        {regDateOfBirth && calculateAge(regDateOfBirth) !== null && calculateAge(regDateOfBirth)! < 18 ? (
                          <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{isBn ? 'রক্তদানের জন্য সর্বনিম্ন বয়স ১৮ বছর হতে হবে।' : 'Minimum age required for donating blood is 18 years.'}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isBn ? 'সঠিক জন্ম তারিখ দিন (রক্তদানের বয়স যাচাইয়ের জন্য আবশ্যক)' : 'Required to verify donor age eligibility (18+)'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500 font-medium">
                          {isBn ? '১১ ডিজিটের মোবাইল নম্বর (যেমন: 018XXXXXXXX)' : '11-digit BD mobile number (e.g. 018XXXXXXXX)'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="donor@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isBn ? '২. বর্তমান অবস্থান ও ঠিকানা' : '2. Location & Area'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'জেলা *' : 'District *'}</label>
                        <select
                          value={regDistrict}
                          onChange={(e) => {
                            setRegDistrict(e.target.value);
                            const ups = getUpazilasForDistrict(e.target.value);
                            setRegUpazila(ups[0] || 'Sadar');
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          {BANGLADESH_DISTRICTS.map(d => (
                            <option key={d.nameEn} value={d.nameEn}>
                              {d.nameEn} ({d.nameBn})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'উপজেলা / থানা *' : 'Upazila / Thana *'}</label>
                        <select
                          value={regUpazila}
                          onChange={(e) => setRegUpazila(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          {getUpazilasForDistrict(regDistrict).map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'পাড়া / এলাকা *' : 'General Area *'}</label>
                        <input
                          type="text"
                          required
                          value={regArea}
                          onChange={(e) => setRegArea(e.target.value)}
                          placeholder="e.g. Fatehabad / College Road"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{isBn ? 'বিস্তারিত আবাসিক ঠিকানা (গোপন রাখা হবে)' : 'Detailed Address (Protected & Private)'}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Private</span>
                      </label>
                      <input
                        type="text"
                        value={regDetailedAddress}
                        onChange={(e) => setRegDetailedAddress(e.target.value)}
                        placeholder="House #, Road #, Village..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Organization & Availability */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isBn ? '৩. সাংগঠনিক তথ্য ও প্রাপ্যতা' : '3. Organization & Availability'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'সংগঠনের সাথে সম্পর্ক' : 'Organization Category'}</label>
                        <select
                          value={regOrgCategory}
                          onChange={(e) => setRegOrgCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          {donorCategories.map(cat => {
                            const nameEn = typeof cat.name === 'object' ? (cat.name.en || '') : cat.name;
                            const nameBn = typeof cat.name === 'object' ? (cat.name.bn || '') : '';
                            return (
                              <option key={cat.id} value={nameEn}>
                                {nameEn} {nameBn ? `(${nameBn})` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'বর্তমান প্রাপ্যতা' : 'Availability Status'}</label>
                        <select
                          value={regAvailability}
                          onChange={(e) => setRegAvailability(e.target.value as DonorAvailabilityStatus)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          <option value="AVAILABLE_EMERGENCY">🟢 {isBn ? 'জরুরি প্রয়োজনে যেকোনো সময় প্রস্তুত' : 'Available for Emergency'}</option>
                          <option value="AVAILABLE_NOTICE">🟡 {isBn ? 'পূর্বে জানালে প্রস্তুত' : 'Available with Prior Notice'}</option>
                          <option value="UNAVAILABLE">🔴 {isBn ? 'সাময়িক বিরতিতে আছেন' : 'Temporarily Unavailable'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'পূর্বে মোট রক্তদান করেছেন' : 'Total Previous Donations'}</label>
                        <input
                          type="number"
                          min="0"
                          value={regTotalDonations}
                          onChange={(e) => setRegTotalDonations(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{isBn ? 'সর্বশেষ রক্তদানের তারিখ' : 'Last Donation Date'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date().toISOString().split('T')[0];
                              setRegLastDonationDate(today);
                              setRegTotalDonations(prev => (Number(prev) || 0) + 1);
                              setRegAvailability('UNAVAILABLE');
                              if (regFormError?.includes('তারিখ') || regFormError?.includes('date')) {
                                setRegFormError(null);
                              }
                            }}
                            className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 cursor-pointer flex items-center gap-1"
                            title={isBn ? 'আজকে রক্তদান করেছেন হিসেবে সেট করুন' : 'Mark as Donated Today'}
                          >
                            <Droplet className="w-3 h-3 fill-current text-rose-600" />
                            <span>{isBn ? 'আজকে রক্তদান করেছি' : 'Donated Today'}</span>
                          </button>
                        </label>
                        <DateInput
                          value={regLastDonationDate}
                          onChange={(val) => {
                            setRegLastDonationDate(val);
                            const today = new Date().toISOString().split('T')[0];
                            if (val && val > today) {
                              setRegFormError(
                                isBn
                                  ? 'সর্বশেষ রক্তদানের তারিখ আজকের বা অতীতের তারিখ হতে হবে, ভবিষ্যতের নয়।'
                                  : 'Last donation date cannot be in the future.'
                              );
                            } else if (regFormError?.includes('তারিখ') || regFormError?.includes('date')) {
                              setRegFormError(null);
                            }
                          }}
                          isBn={isBn}
                          max={new Date().toISOString().split('T')[0]}
                          minYear={2010}
                          maxYear={new Date().getFullYear()}
                          showQuickToday
                        />
                        {regLastDonationDate && regLastDonationDate > new Date().toISOString().split('T')[0] ? (
                          <div className="p-2 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-900 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>
                              {isBn
                                ? 'ভবিষ্যতের কোনো তারিখ রক্তদানের তারিখ হতে পারে না। অনুগ্রহ করে অতীতের বা আজকের সঠিক তারিখ দিন।'
                                : 'Future date cannot be a past blood donation date. Please select today or a past date.'}
                            </span>
                          </div>
                        ) : regLastDonationDate ? (() => {
                          const cooldown = getCooldownStatusInfo(regLastDonationDate, isBn);
                          return (
                            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 shadow-2xs ${cooldown.badgeColorClass} animate-in fade-in`}>
                              <HeartPulse className="w-4 h-4 shrink-0 mt-0.5" />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-extrabold text-[11.5px]">{cooldown.badgeText}</p>
                                  {cooldown.daysPassed !== null && (
                                    <span className="text-[9.5px] font-bold opacity-80 font-mono">
                                      {isBn ? `${cooldown.daysPassed} দিন পার` : `${cooldown.daysPassed}d`}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10.5px] opacity-90 leading-tight">{cooldown.description}</p>
                              </div>
                            </div>
                          );
                        })() : (
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isBn ? 'রক্তদানের তারিখ দিলে ৯০ দিনের (৩ মাস) কুলডাউন হিসাব স্বয়ংক্রিয়ভাবে দেখাবে' : 'Cooldown status calculated on 90-day interval rule'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">{isBn ? 'রক্তদানের অভিজ্ঞতা বা বিশেষ বার্তা' : 'Experience or Motivation'}</label>
                      <textarea
                        rows={2}
                        value={regExperienceNotes}
                        onChange={(e) => setRegExperienceNotes(e.target.value)}
                        placeholder="e.g. Regular voluntary blood donor..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Consent & Privacy Checkboxes */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed">
                      <input
                        type="checkbox"
                        required
                        checked={regConsent}
                        onChange={(e) => setRegConsent(e.target.checked)}
                        className="w-4 h-4 text-[#006A4E] rounded-md mt-0.5 focus:ring-[#006A4E]"
                      />
                      <span>
                        {tText(bloodDonationSettings.consentStatement) || (isBn
                          ? 'আমি স্বেচ্ছায় রক্তদাতা হিসেবে নিবন্ধিত হতে সম্মত এবং জরুরি প্রয়োজনে ইনফিনিটি বাংলাদেশ কর্তৃক রক্তদানের সমন্বয়ে তথ্য ব্যবহারে সম্মতি দিচ্ছি।'
                          : 'I agree to voluntary blood donor registration and consent to Team Infinity using my information for coordination.')}
                      </span>
                    </label>

                    {regGender === 'Male' ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5 leading-relaxed">
                        <ShieldCheck className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#00523C]">
                            {isBn ? 'মোবাইল নম্বর স্বয়ংক্রিয়ভাবে উন্মুক্ত (পাবলিক) থাকবে' : 'Mobile number will be automatically public'}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {isBn
                              ? 'পুরুষ রক্তদাতাদের ক্ষেত্রে জরুরি প্রয়োজনে দ্রুত রক্ত পাওয়ার স্বার্থে যোগাযোগের নম্বর উন্মুক্ত রাখা হয় (তবে রক্তদানের পর ৯০ দিন সবার নম্বরই স্বয়ংক্রিয়ভাবে হাইড থাকবে)।'
                              : 'Male donor contact numbers are automatically public for rapid emergency coordination (kept hidden for 90 days after each donation).'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/60">
                        <input
                          type="checkbox"
                          checked={regShowPhone}
                          onChange={(e) => setRegShowPhone(e.target.checked)}
                          className="w-4 h-4 text-[#006A4E] rounded-md mt-0.5 focus:ring-[#006A4E]"
                        />
                        <div>
                          <span className="font-bold text-slate-800">
                            {isBn
                              ? 'নারী রক্তদাতা প্রাইভেসি: পাবলিক ডিরেক্টরিতে সরাসরি কল অপশন ও নম্বর উন্মুক্ত রাখুন'
                              : 'Female Donor Privacy: Allow direct public call button and phone number'}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {isBn
                              ? 'প্রাইভেসি সুরক্ষায় এটি আনচেক রাখলে আপনার নম্বর জনসাধারণের কাছে গোপন থাকবে এবং হেল্পলাইনের মাধ্যমে রক্তের ব্যবস্থা করা হবে।'
                              : 'For privacy, keeping this unchecked hides your phone number from the public; requests route through 24/7 Helpline.'}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Prominent Error Banner */}
                  {regFormError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-warm-xs animate-in fade-in">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-rose-950">{isBn ? 'আবেদন জমাদানে ত্রুটি:' : 'Submission Error:'}</p>
                        <p className="font-medium text-rose-800 mt-0.5 leading-relaxed">{regFormError}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={Boolean(regLastDonationDate && regLastDonationDate > new Date().toISOString().split('T')[0])}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-warm-md transition-all flex items-center justify-center gap-2 ${
                      regLastDonationDate && regLastDonationDate > new Date().toISOString().split('T')[0]
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80'
                        : 'bg-[#006A4E] hover:bg-[#00523C] text-white cursor-pointer transform hover:-translate-y-0.5'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {regLastDonationDate && regLastDonationDate > new Date().toISOString().split('T')[0]
                        ? (isBn ? 'ভবিষ্যতের তারিখ সংশোধন করুন' : 'Correct Future Date')
                        : (isBn ? 'রক্তদাতা আবেদন জমা দিন' : 'Submit Donor Registration')}
                    </span>
                  </button>
                </form>
              </div>
            )}
            </div>
          </ScrollReveal>
        )}

        {/* ==================================================== */}
        {/* TAB 3: UPDATE DONOR PROFILE & LAST DONATION RECORD */}
        {/* ==================================================== */}
        {activeTab === 'update-donor' && (
          <ScrollReveal effect="fade-up">
            <div id="update-donor-section" className="max-w-3xl mx-auto space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#EAE3D9] shadow-warm-sm space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    <Edit3 className="w-3.5 h-3.5 text-[#006A4E]" />
                    <span>{isBn ? 'রক্তদাতার প্রোফাইল ও রেকর্ড হালনাগাদ' : 'Donor Profile & History Update'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'রক্তদানের তথ্য বা প্রোফাইল আপডেট করুন' : 'Update Your Blood Donor Profile'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    {isBn
                      ? 'নিবন্ধিত মোবাইল নম্বর দিয়ে প্রোফাইল খুঁজুন। সর্বশেষ রক্তদানের তারিখ (৯০ দিনের কুলডাউন হিসাবসহ), ছবি, এলাকা/ঠিকানা ও প্রাপ্যতা সহজে আপডেট করুন।'
                      : 'Find your profile by registered mobile number. Easily update your last donation date (with 90-day cooldown calculation), photo, address, and availability.'}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-950 text-emerald-100 rounded-2xl border border-emerald-800/40 text-center shrink-0 shadow-xs max-w-xs sm:max-w-none">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নিরাপদ রক্তদানের ব্যবধান' : 'Safe Donation Interval'}</span>
                  </div>
                  <p className="text-lg font-extrabold text-white font-display mt-0.5">
                    {isBn ? '৯০ দিন (৩ মাস)' : '90 Days (3 Months)'}
                  </p>
                  <p className="text-[10px] text-emerald-300/80">
                    {isBn ? 'স্বাস্থ্যের পূর্ণ সুরক্ষায়' : 'For optimal health & recovery'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: Donor Mobile / ID Lookup */}
            {!matchedDonor && !updSubmitted && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-warm-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#006A4E]" />
                    <span>{isBn ? '১. আপনার প্রোফাইল অনুসন্ধান করুন' : '1. Search Your Donor Profile'}</span>
                  </h3>
                </div>

                <form onSubmit={handleSearchDonorForUpdate} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1 min-w-0">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={updSearchQuery}
                        onChange={(e) => {
                          setUpdSearchQuery(e.target.value);
                          if (updSearchError) setUpdSearchError(null);
                        }}
                        placeholder={isBn ? 'রেজিস্টার্ড ১১ ডিজিট মোবাইল নম্বর দিন (যেমন: 018XXXXXXXX)...' : 'Enter registered 11-digit mobile number (e.g. 018XXXXXXXX)...'}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00553E] text-white font-extrabold text-xs sm:text-sm shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>{isBn ? 'প্রোফাইল খুঁজুন' : 'Find Profile'}</span>
                    </button>
                  </div>

                  {updSearchError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">{updSearchError}</p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('become-donor')}
                          className="text-rose-700 font-extrabold underline hover:text-rose-900 text-[11px] block cursor-pointer"
                        >
                          {isBn ? '→ নতুন রক্তদাতা হিসেবে নিবন্ধন করুন' : '→ Register as a New Donor'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Step 2: Matched Donor Form or Success Screen */}
            {updSubmitted ? (
              <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-emerald-200 shadow-warm-lg space-y-6 animate-in fade-in">
                <div className="w-18 h-18 rounded-full bg-emerald-100 text-[#006A4E] mx-auto flex items-center justify-center shadow-warm-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    {isBn ? 'তথ্য আপডেটের আবেদন সফলভাবে জমা হয়েছে!' : 'Update Request Submitted Successfully!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {isBn
                      ? 'আপনার রক্তদানের রেকর্ড ও ঠিকানার আবেদনটি সিস্টেমে সংরক্ষিত হয়েছে। অননুমোদিত সম্পাদন রোধে অ্যাডমিন আপনার হোয়াটসঅ্যাপ মেসেজ ও মোবাইল নম্বর যাচাই করে অনুমোদন করলেই এটি লাইভ হবে।'
                      : 'Your donation record and profile update request has been submitted. For data security, it will go live once Admin verifies your mobile number on WhatsApp and approves it from the Admin Dashboard.'}
                  </p>
                </div>

                {/* WhatsApp Admin Request Banner */}
                {submittedWhatsAppUrl && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 max-w-lg mx-auto space-y-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                      <MessageCircle className="w-5 h-5 text-emerald-700" />
                      <span>{isBn ? 'অ্যাডমিনকে হোয়াটসঅ্যাপে মেসেজ পাঠানো হয়েছে' : 'Admin WhatsApp Notification'}</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {isBn
                        ? 'হোয়াটসঅ্যাপ নিজে থেকে চালু না হলে নিচের বাটনে ক্লিক করে অ্যাডমিনকে আপনার আবেদনটি পাঠিয়ে দিন যাতে দ্রুত অনুমোদন পাওয়া যায়।'
                        : 'If WhatsApp did not open automatically, please click below to send your request message to Admin for fast approval.'}
                    </p>
                    <a
                      href={submittedWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm shadow-warm-md hover:shadow-warm-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                      <span>{isBn ? '💬 অ্যাডমিনকে হোয়াটসঅ্যাপে মেসেজ পাঠান' : '💬 Send WhatsApp Message to Admin'}</span>
                    </a>
                  </div>
                )}

                {/* Cooldown Status Summary Card */}
                {updLastDonationDate && (() => {
                  const cooldown = getCooldownStatusInfo(updLastDonationDate, isBn);
                  return (
                    <div className={`p-4.5 rounded-2xl border max-w-md mx-auto text-left space-y-1.5 ${cooldown.badgeColorClass}`}>
                      <div className="flex items-center gap-2 font-extrabold text-xs">
                        <HeartPulse className="w-4 h-4" />
                        <span>{cooldown.badgeText}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {cooldown.description}
                      </p>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetUpdateFlow();
                      setActiveTab('find-donor');
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00553E] text-white font-extrabold text-xs shadow-warm-sm transition-all cursor-pointer"
                  >
                    {isBn ? 'রক্তদাতা ডিরেক্টরিতে যান' : 'Go to Donor Directory'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetUpdateFlow}
                    className="px-5 py-3 rounded-2xl bg-white border border-[#EAE3D9] text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {isBn ? 'আরেকটি প্রোফাইল আপডেট' : 'Update Another'}
                  </button>
                </div>
              </div>
            ) : matchedDonor ? (
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#EAE3D9] shadow-warm-md space-y-8 animate-in fade-in">
                {/* Active Donor Banner with Verified Status */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-emerald-800 shrink-0 border-2 border-emerald-500/40">
                      {updPhotoUrl ? (
                        <img src={getAssetUrl(updPhotoUrl)} alt={updFullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-xl">
                          {updFullName ? updFullName.charAt(0) : 'D'}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-black rounded-tl-md">
                        {updBloodGroup}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-extrabold text-white font-display">
                          {updFullName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                          {updBloodGroup}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-0.5">
                        ID: <span className="font-mono">{matchedDonor.id}</span> &bull; {updDistrict}, {updUpazila}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetUpdateFlow}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isBn ? 'অন্য নম্বর দিয়ে খুঁজুন' : 'Search Another'}</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleDonorUpdateSubmit} className="space-y-8">
                  {/* ==================================================== */}
                  {/* SECTION 1: LAST DONATION & 120-DAY COOLDOWN */}
                  {/* ==================================================== */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF7F2] border-2 border-[#EAE3D9] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 font-display">
                          <Clock className="w-4 h-4 text-rose-600" />
                          <span>{isBn ? '১. সর্বশেষ রক্তদান ও ৯০ দিনের কুলডাউন হিসাব' : '1. Last Donation & 90-Day Cooldown Tracker'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isBn ? 'রক্তদানের তারিখ আপডেট করলে মোট রক্তদান বৃদ্ধি পাবে ও কুলডাউন হিসাব আপডেট হবে' : 'Updating donation date calculates cooldown status and increments total count'}
                        </p>
                      </div>

                      {/* Quick Shortcut Button */}
                      <button
                        type="button"
                        onClick={handleSetDonatedToday}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-warm-xs transition-all flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5 shrink-0"
                        title={isBn ? 'আজকে রক্তদান করেছেন হিসেবে সেট করুন' : 'Mark as Donated Today'}
                      >
                        <Droplet className="w-3.5 h-3.5 fill-current" />
                        <span>{isBn ? 'আজকে রক্তদান করেছি' : 'Donated Today'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Last Donation Date */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{isBn ? 'সর্বশেষ রক্তদানের তারিখ *' : 'Last Donation Date *'}</span>
                          {updLastDonationDate && (
                            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {formatDateDDMMYYYY(updLastDonationDate, isBn)}
                            </span>
                          )}
                        </label>
                        <DateInput
                          value={updLastDonationDate}
                          onChange={(val) => {
                            setUpdLastDonationDate(val);
                            const today = new Date().toISOString().split('T')[0];
                            if (val && val > today) {
                              setUpdFormError(
                                isBn
                                  ? 'সর্বশেষ রক্তদানের তারিখ আজকের বা অতীতের তারিখ হতে হবে, ভবিষ্যতের নয়।'
                                  : 'Last donation date cannot be in the future.'
                              );
                            } else if (updFormError?.includes('তারিখ') || updFormError?.includes('date')) {
                              setUpdFormError(null);
                            }
                          }}
                          isBn={isBn}
                          max={new Date().toISOString().split('T')[0]}
                          minYear={2010}
                          maxYear={new Date().getFullYear()}
                          showQuickToday
                        />
                      </div>

                      {/* Total Donations Count */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{isBn ? 'মোট কতবার রক্তদান করেছেন' : 'Total Donations Count'}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isBn ? 'সংখ্যা বাড়ানো বা কমানো যাবে' : 'Adjustable'}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={updTotalDonations}
                            onChange={(e) => setUpdTotalDonations(Math.max(0, Number(e.target.value)))}
                            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-white text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setUpdTotalDonations(prev => (Number(prev) || 0) + 1)}
                            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006A4E] border border-emerald-300 font-extrabold text-xs cursor-pointer"
                            title={isBn ? '১ বাড়ান' : 'Increment by 1'}
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Live 90-Day Cooldown Status Card */}
                    {updLastDonationDate ? (() => {
                      const cooldown = getCooldownStatusInfo(updLastDonationDate, isBn);
                      return (
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs shadow-2xs ${cooldown.badgeColorClass} animate-in fade-in`}>
                          <HeartPulse className="w-5 h-5 shrink-0 mt-0.5" />
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-extrabold text-sm tracking-tight">
                                {cooldown.badgeText}
                              </p>
                              {cooldown.daysPassed !== null && (
                                <span className="px-2.5 py-0.5 rounded-full bg-white/70 text-[10px] font-extrabold shadow-2xs">
                                  {isBn ? `রক্তদানের পর ${cooldown.daysPassed} দিন পার` : `${cooldown.daysPassed} days passed`}
                                </span>
                              )}
                            </div>
                            <p className="text-xs opacity-90 leading-relaxed">
                              {cooldown.description}
                            </p>
                            {!cooldown.isEligible && (
                              <p className="text-[11px] font-bold text-rose-900 bg-rose-100/80 p-2 rounded-xl border border-rose-200 mt-1">
                                💡 {isBn
                                  ? 'পরামর্শ: যেহেতু ৯০ দিন পূর্ণ হয়নি, আপনার প্রাপ্যতা স্ট্যাটাস "সাময়িক বিরতিতে আছেন" নির্বাচন করা শ্রেয়।'
                                  : 'Advice: As 90 days have not passed, setting availability to "Temporarily Unavailable" is recommended.'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })() : (
                      <p className="text-[11px] text-slate-500 italic">
                        {isBn ? 'রক্তদানের তারিখ নির্বাচন করলে এখানে ৯০ দিনের কুলডাউন হিসাব প্রদর্শিত হবে।' : 'Select a donation date to compute the 90-day cooldown status.'}
                      </p>
                    )}
                  </div>

                  {/* ==================================================== */}
                  {/* SECTION 2: PHOTO UPDATE & CROP */}
                  {/* ==================================================== */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        {isBn ? '২. প্রোফাইল ছবি ও রূপরেখা (১:১ ক্রপ ও জুম)' : '2. Profile Photo (1:1 Zoom & Crop)'}
                      </h4>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                        {isBn ? 'জুম ও ক্রপ সমর্থিত' : 'Zoom & Crop Supported'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {updPhotoUrl ? (
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#006A4E] shadow-warm-sm shrink-0 bg-white group">
                          <img
                            src={getAssetUrl(updPhotoUrl)}
                            alt="Donor Update Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveUpdatePhoto}
                            className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer text-[10px] font-bold"
                            title={isBn ? 'ছবি মুছুন' : 'Remove Photo'}
                          >
                            <Trash2 className="w-4 h-4 text-rose-300" />
                            <span>{isBn ? 'মুছুন' : 'Remove'}</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => updPhotoInputRef.current?.click()}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-[#006A4E] hover:border-[#006A4E] transition-all cursor-pointer shrink-0 shadow-2xs group"
                          title={isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload photo'}
                        >
                          <Camera className="w-7 h-7 mb-1 text-slate-400 group-hover:scale-110 group-hover:text-[#006A4E] transition-all" />
                          <span className="text-[10px] font-bold uppercase text-center px-1 text-slate-600 group-hover:text-[#006A4E]">
                            {isBn ? 'ছবি দিন' : 'Upload'}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2 text-center sm:text-left min-w-0 flex-1 w-full">
                        <input
                          ref={updPhotoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleUpdatePhotoUpload}
                          className="hidden"
                        />
                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                          <button
                            type="button"
                            onClick={() => updPhotoInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#006A4E]" />
                            <span>
                              {updPhotoUrl
                                ? (isBn ? 'নতুন ছবি আপলোড' : 'Upload New Photo')
                                : (isBn ? 'ডিভাইস থেকে ছবি আপলোড' : 'Upload from Device')}
                            </span>
                          </button>

                          {updPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => handleOpenPhotoCropper(updPhotoUrl, true)}
                              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006A4E] border border-emerald-300 text-xs font-bold shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                              title={isBn ? 'ছবি ক্রপ ও জুম করুন' : 'Crop & Zoom Photo'}
                            >
                              <Crop className="w-3.5 h-3.5" />
                              <span>{isBn ? 'ক্রপ / জুম করুন' : 'Crop / Zoom'}</span>
                            </button>
                          )}

                          <input
                            type="url"
                            value={updPhotoUrl.startsWith('data:') ? '' : updPhotoUrl}
                            onChange={(e) => {
                              setUpdPhotoUrl(e.target.value);
                              setUpdPhotoFileName('');
                            }}
                            placeholder={isBn ? 'অথবা সরাসরি ছবির লিঙ্ক দিন (URL)' : 'Or paste direct Image URL...'}
                            className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <p className="text-[11px] text-slate-500">
                          {isBn
                            ? 'ছবি সিলেক্ট করার সাথে সাথেই ক্রপ ও জুম ইন/আউট এডিটর ওপেন হবে।'
                            : 'Cropper with Zoom in/out and 1:1 framing will open upon file selection.'}
                        </p>

                        {updPhotoFileName && (
                          <p className="text-[11px] font-mono text-[#006A4E] truncate flex items-center justify-center sm:justify-start gap-1 font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{updPhotoFileName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ==================================================== */}
                  {/* SECTION 3: LOCATION & ADDRESS UPDATES */}
                  {/* ==================================================== */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isBn ? '৩. বর্তমান অবস্থান ও ঠিকানা পরিবর্তন' : '3. Location & Address Changes'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* District Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'জেলা (District) *' : 'District *'}</label>
                        <select
                          value={updDistrict}
                          onChange={(e) => {
                            const newDistrict = e.target.value;
                            setUpdDistrict(newDistrict);
                            const upazilas = getUpazilasForDistrict(newDistrict);
                            if (upazilas.length > 0) {
                              setUpdUpazila(upazilas[0]);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          {BANGLADESH_DISTRICTS.map(d => (
                            <option key={d.nameEn} value={d.nameEn}>
                              {d.nameEn} ({d.nameBn})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic Upazila */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'উপজেলা / থানা *' : 'Upazila / Thana *'}</label>
                        <select
                          value={updUpazila}
                          onChange={(e) => setUpdUpazila(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          {availableUpazilasForUpdate.map(upz => (
                            <option key={upz} value={upz}>{upz}</option>
                          ))}
                        </select>
                      </div>

                      {/* Area */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'নির্দিষ্ট এলাকা / গ্রাম *' : 'Area / Locality *'}</label>
                        <input
                          type="text"
                          required
                          value={updArea}
                          onChange={(e) => setUpdArea(e.target.value)}
                          placeholder="e.g. Fatehabad / College Road"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{isBn ? 'বিস্তারিত আবাসিক ঠিকানা (গোপন রাখা হবে)' : 'Detailed Address (Protected & Private)'}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Private</span>
                      </label>
                      <input
                        type="text"
                        value={updDetailedAddress}
                        onChange={(e) => setUpdDetailedAddress(e.target.value)}
                        placeholder="House #, Road #, Village..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ==================================================== */}
                  {/* SECTION 4: PERSONAL & CONTACT INFORMATION */}
                  {/* ==================================================== */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isBn ? '৪. ব্যক্তিগত ও যোগাযোগের তথ্য' : '4. Personal & Contact Details'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'পূর্ণ নাম *' : 'Full Name *'}</label>
                        <input
                          type="text"
                          required
                          value={updFullName}
                          onChange={(e) => setUpdFullName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none font-medium"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'রক্তের গ্রুপ *' : 'Blood Group *'}</label>
                        <select
                          value={updBloodGroup}
                          onChange={(e) => setUpdBloodGroup(e.target.value as BloodGroup)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-black text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          <option value="A+">A+ (Positive)</option>
                          <option value="A-">A- (Negative)</option>
                          <option value="B+">B+ (Positive)</option>
                          <option value="B-">B- (Negative)</option>
                          <option value="O+">O+ (Positive)</option>
                          <option value="O-">O- (Negative)</option>
                          <option value="AB+">AB+ (Positive)</option>
                          <option value="AB-">AB- (Negative)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'লিঙ্গ (Gender) *' : 'Gender *'}</label>
                        <select
                          value={updGender}
                          onChange={(e) => {
                            const newGender = e.target.value;
                            setUpdGender(newGender);
                            if (newGender === 'Male') {
                              setUpdShowPhone(true);
                            }
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          <option value="Male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                          <option value="Female">{isBn ? 'নারী (Female)' : 'Female'}</option>
                          <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                        </select>
                      </div>

                      <div className="sm:col-span-8 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
                          <span>{isBn ? 'জন্ম তারিখ (Date of Birth) *' : 'Date of Birth *'}</span>
                        </label>
                        <DateInput
                          value={updDateOfBirth}
                          onChange={(val) => setUpdDateOfBirth(val)}
                          isBn={isBn}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          minYear={1940}
                          maxYear={new Date().getFullYear()}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}</span>
                          <span className="text-[10px] text-slate-400">১১ ডিজিট (01XXXXXXXXX)</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={updPhone}
                          onChange={(e) => setUpdPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                        <input
                          type="email"
                          value={updEmail}
                          onChange={(e) => setUpdEmail(e.target.value)}
                          placeholder="donor@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ==================================================== */}
                  {/* SECTION 5: AVAILABILITY & EXPERIENCE NOTES */}
                  {/* ==================================================== */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {isBn ? '৫. প্রাপ্যতা স্ট্যাটাস ও বার্তা' : '5. Availability Status & Message'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'সংগঠনের সাথে সম্পর্ক' : 'Organization Category'}</label>
                        <select
                          value={updOrgCategory}
                          onChange={(e) => setUpdOrgCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          {donorCategories.map(cat => {
                            const nameEn = typeof cat.name === 'object' ? (cat.name.en || '') : cat.name;
                            const nameBn = typeof cat.name === 'object' ? (cat.name.bn || '') : '';
                            return (
                              <option key={cat.id} value={nameEn}>
                                {nameEn} {nameBn ? `(${nameBn})` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'বর্তমান প্রাপ্যতা স্ট্যাটাস *' : 'Availability Status *'}</label>
                        <select
                          value={updAvailability}
                          onChange={(e) => setUpdAvailability(e.target.value as DonorAvailabilityStatus)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        >
                          <option value="AVAILABLE_EMERGENCY">🟢 {isBn ? 'জরুরি প্রয়োজনে যেকোনো সময় প্রস্তুত' : 'Available for Emergency'}</option>
                          <option value="AVAILABLE_NOTICE">🟡 {isBn ? 'পূর্বে জানালে প্রস্তুত' : 'Available with Prior Notice'}</option>
                          <option value="UNAVAILABLE">🔴 {isBn ? 'সাময়িক বিরতিতে আছেন / সম্প্রতি রক্তদান করেছেন' : 'Temporarily Unavailable (Resting)'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">{isBn ? 'রক্তদানের অভিজ্ঞতা বা বিশেষ বার্তা' : 'Experience or Motivation'}</label>
                      <textarea
                        rows={2}
                        value={updExperienceNotes}
                        onChange={(e) => setUpdExperienceNotes(e.target.value)}
                        placeholder="e.g. Regular voluntary blood donor..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      />
                    </div>

                    {updGender === 'Male' ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5 leading-relaxed pt-1">
                        <ShieldCheck className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#00523C]">
                            {isBn ? 'মোবাইল নম্বর স্বয়ংক্রিয়ভাবে উন্মুক্ত (পাবলিক) থাকবে' : 'Mobile number will be automatically public'}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {isBn
                              ? 'পুরুষ রক্তদাতাদের যোগাযোগের নম্বর উন্মুক্ত রাখা হয় যাতে প্রয়োজনে দ্রুত যোগাযোগ করা যায় (তবে রক্তদানের পর ৯০ দিন সবার নম্বরই স্বয়ংক্রিয়ভাবে হাইড থাকবে)।'
                              : 'Male donor phone numbers remain public for direct emergency access (hidden for 90 days after donation).'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/60 pt-1">
                        <input
                          type="checkbox"
                          checked={updShowPhone}
                          onChange={(e) => setUpdShowPhone(e.target.checked)}
                          className="w-4 h-4 text-[#006A4E] rounded-md mt-0.5 focus:ring-[#006A4E]"
                        />
                        <div>
                          <span className="font-bold text-slate-800">
                            {isBn
                              ? 'নারী রক্তদাতা প্রাইভেসি: পাবলিক ডিরেক্টরিতে সরাসরি কল অপশন ও নম্বর উন্মুক্ত রাখুন'
                              : 'Female Donor Privacy: Allow direct public call button and phone number'}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {isBn
                              ? 'প্রাইভেসি সুরক্ষায় এটি আনচেক রাখলে আপনার নম্বর জনসাধারণের কাছে গোপন থাকবে এবং হেল্পলাইনের মাধ্যমে রক্তের ব্যবস্থা করা হবে।'
                              : 'For privacy, keeping this unchecked hides your phone number from the public; requests route through 24/7 Helpline.'}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Form Error Banner */}
                  {updFormError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-warm-xs animate-in fade-in">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-rose-950">{isBn ? 'হালনাগাদ করতে ত্রুটি:' : 'Update Error:'}</p>
                        <p className="font-medium text-rose-800 mt-0.5 leading-relaxed">{updFormError}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button & Admin WhatsApp Notification Note */}
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5 fill-current" />
                      <p className="leading-relaxed">
                        {isBn
                          ? 'নিরাপত্তার স্বার্থে সাবমিট বাটনে চাপলে স্বয়ংক্রিয়ভাবে অ্যাডমিনকে হোয়াটসঅ্যাপে আবেদন পাঠানো হবে। অ্যাডমিন আপনার নম্বর দেখে ড্যাশবোর্ড থেকে অ্যাপ্রুভ (অনুমোদন) করলেই তথ্যটি ডিরেক্টরিতে লাইভ হবে।'
                          : 'For security, submitting will automatically notify Admin on WhatsApp. Once Admin verifies and approves the request from the dashboard, updates will appear live in the Directory.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        disabled={isUpdatingDonor || Boolean(updLastDonationDate && updLastDonationDate > new Date().toISOString().split('T')[0])}
                        className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-extrabold text-sm shadow-warm-md transition-all flex items-center justify-center gap-2.5 ${
                          updLastDonationDate && updLastDonationDate > new Date().toISOString().split('T')[0]
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80'
                            : 'bg-[#006A4E] hover:bg-[#00523C] text-white cursor-pointer transform hover:-translate-y-0.5'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-300 fill-current" />
                        <span>
                          {isUpdatingDonor
                            ? (isBn ? 'আবেদন সাবমিট হচ্ছে...' : 'Submitting Request...')
                            : (isBn ? 'তথ্য হালনাগাদ আবেদন সাবমিট করুন ও হোয়াটসঅ্যাপে পাঠান' : 'Submit Update Request & Send via WhatsApp')}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetUpdateFlow}
                        className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white border border-[#EAE3D9] text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer text-center"
                      >
                        {isBn ? 'বাতিল' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : null}
            </div>
          </ScrollReveal>
        )}


        {/* ==================================================== */}
        {/* TAB 4: EMERGENCY BLOOD REQUEST (FORM & LIVE BOARD) */}
        {/* ==================================================== */}
        {activeTab === 'emergency-request' && (
          <ScrollReveal effect="fade-up">
            <div id="emergency-request-section" className="space-y-10">
            {/* Urgent Hotline Top Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-900 text-white shadow-warm-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-display">
                    {isBn ? 'তাৎক্ষণিক অতি-জরুরি রক্তের প্রয়োজন?' : 'Need Critical Emergency Blood Immediately?'}
                  </h3>
                  <p className="text-xs text-rose-100">
                    {isBn ? 'ইনফিনিটি বাংলাদেশ ২৪/৭ ইমার্জেন্সি ব্লাড হেল্পলাইনে সরাসরি কল করুন' : 'Call our 24/7 dedicated volunteer emergency helpline desk directly'}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${bloodDonationSettings.emergencyHelpline}`}
                className="px-6 py-2.5 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-rose-600" />
                <span>{bloodDonationSettings.emergencyHelpline}</span>
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Emergency Request Submission Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-warm-sm space-y-6">
                {emgSubmitted ? (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'জরুরি রক্তের আবেদন গৃহীত হয়েছে!' : 'Emergency Request Broadcasted!'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isBn
                          ? 'আমাদের স্বেচ্ছাসেবক কো-অর্ডিনেটরগণ ম্যাচিং রক্তদাতাদের সাথে যোগাযোগ শুরু করেছেন।'
                          : 'Our voluntary team is actively coordinating matching available donors for this request.'}
                      </p>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] inline-block text-xs font-mono font-bold text-slate-700">
                      Req ID: <span className="text-rose-600">{emgRefId}</span>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setEmgSubmitted(false)}
                        className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                      >
                        {isBn ? 'নতুন আবেদন করুন' : 'Post Another Request'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-slate-100 pb-3 space-y-0.5">
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
                        {isBn ? 'জরুরি রক্তের আবেদন ফরম' : 'Emergency Blood Request Form'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'রোগীর সঠিক তথ্য ও হাসপাতালের বিবরণ প্রদান করুন' : 'Provide patient details and hospital location'}
                      </p>
                    </div>

                    <form onSubmit={handleEmergencyRequestSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'আবেদনকারীর নাম *' : 'Requester Name *'}</label>
                          <input
                            type="text"
                            required
                            value={emgRequesterName}
                            onChange={(e) => setEmgRequesterName(e.target.value)}
                            placeholder="e.g. Faruk Ahmed"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'যোগাযোগের মোবাইল নম্বর *' : 'Contact Phone *'}</label>
                          <input
                            type="tel"
                            required
                            maxLength={11}
                            value={emgContactNumber}
                            onChange={(e) => setEmgContactNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-500 font-medium">
                            {isBn ? '১১ ডিজিটের মোবাইল নম্বর' : '11-digit BD mobile number'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6 space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'রোগীর নাম ও বয়স *' : 'Patient Name & Age *'}</label>
                          <input
                            type="text"
                            required
                            value={emgPatientName}
                            onChange={(e) => setEmgPatientName(e.target.value)}
                            placeholder="e.g. Rashedul Islam (Age 32)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'প্রয়োজনীয় গ্রুপ *' : 'Blood Group *'}</label>
                          <select
                            value={emgBloodGroup}
                            onChange={(e) => setEmgBloodGroup(e.target.value as BloodGroup)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-black text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'পরিমাণ (ব্যাগ) *' : 'Units (Bags) *'}</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            required
                            value={emgUnits}
                            onChange={(e) => setEmgUnits(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="sm:col-span-1 space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'জেলা *' : 'District *'}</label>
                          <select
                            value={emgDistrict}
                            onChange={(e) => {
                              setEmgDistrict(e.target.value);
                              const ups = getUpazilasForDistrict(e.target.value);
                              setEmgUpazila(ups[0] || 'Sadar');
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          >
                            {BANGLADESH_DISTRICTS.map(d => (
                              <option key={d.nameEn} value={d.nameEn}>{d.nameEn}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'উপজেলা / থানা *' : 'Upazila *'}</label>
                          <select
                            value={emgUpazila}
                            onChange={(e) => setEmgUpazila(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          >
                            {getUpazilasForDistrict(emgDistrict).map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'জরুরিতা লেভেল *' : 'Urgency Level *'}</label>
                          <select
                            value={emgUrgency}
                            onChange={(e) => setEmgUrgency(e.target.value as EmergencyLevel)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs font-extrabold text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          >
                            <option value="CRITICAL">🔴 Critical (তাৎক্ষণিক)</option>
                            <option value="URGENT">🟡 Urgent (আজকে)</option>
                            <option value="NORMAL">🟢 Normal (আগামীকাল/নির্ধারিত)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'হাসপাতালের নাম *' : 'Hospital Name *'}</label>
                          <input
                            type="text"
                            required
                            value={emgHospital}
                            onChange={(e) => setEmgHospital(e.target.value)}
                            placeholder="e.g. CMCH / Parkview Hospital"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">{isBn ? 'প্রয়োজনের তারিখ *' : 'Required Date *'}</label>
                          <DateInput
                            value={emgRequiredDate}
                            onChange={(val) => setEmgRequiredDate(val)}
                            isBn={isBn}
                            required
                            minYear={new Date().getFullYear() - 1}
                            maxYear={new Date().getFullYear() + 2}
                            yearOrder="asc"
                            showQuickToday
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-800">{isBn ? 'রোগীর বিবরণ / ওয়ার্ড / কেবিন নম্বর' : 'Ward / Bed / Notes'}</label>
                        <textarea
                          rows={2}
                          value={emgNotes}
                          onChange={(e) => setEmgNotes(e.target.value)}
                          placeholder="e.g. ICU Bed 12, surgery scheduled at 10 AM..."
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-warm-sm transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isBn ? 'জরুরি আবেদন প্রচার করুন' : 'Broadcast Emergency Request'}</span>
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Right Column: Public Live Emergency Requests Board */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span>{isBn ? 'লাইভ জরুরি রক্তের নোটিশ বোর্ড' : 'Live Emergency Board'}</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {emergencyBloodRequests.length} {isBn ? 'টি আবেদন' : 'Requests'}
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {emergencyBloodRequests.map(req => {
                    const isPending = req.status === 'PENDING' || req.status === 'PROCESSING';
                    return (
                      <div
                        key={req.id}
                        className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 ${
                          req.emergencyLevel === 'CRITICAL'
                            ? 'bg-rose-50/80 border-rose-200'
                            : 'bg-white border-[#EAE3D9]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-rose-700 font-display">
                                {req.bloodGroup}
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                ({req.unitsNeeded} {isBn ? 'ব্যাগ প্রয়োজন' : 'Units Needed'})
                              </span>
                              <span
                                className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold uppercase ${
                                  req.emergencyLevel === 'CRITICAL'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {req.emergencyLevel}
                              </span>
                            </div>

                            <p className="text-xs font-extrabold text-slate-900">
                              {req.patientName}
                            </p>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'FULFILLED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold">{req.hospitalName}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{req.upazila}, {req.district}</span>
                            <span className="text-slate-400">&bull; {req.requiredDate}</span>
                          </p>
                        </div>

                        {req.additionalNotes && (
                          <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-100">
                            "{req.additionalNotes}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {isBn ? 'রক্ত দিতে আগ্রহী?' : 'Can you donate?'}
                          </span>
                          <a
                            href={`tel:${req.contactNumber}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{isBn ? 'সরাসরি কল করুন' : 'Call Contact'}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>
          </ScrollReveal>
        )}

        {/* ==================================================== */}
        {/* TAB 4: OUR DONORS DIRECTORY */}
        {/* ==================================================== */}
        {activeTab === 'donors' && (
          <ScrollReveal effect="fade-up">
            <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                  {isBn ? 'আমাদের স্বেচ্ছাসেবী রক্তদাতাবৃন্দ' : 'Verified Voluntary Donors Directory'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isBn ? 'মানবতার সেবায় আত্মনিবেদিত টিম ইনফিনিটির গর্বিত রক্তযোদ্ধারা' : 'Proud blood donors standing united for humanity across Bangladesh'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('become-donor')}
                className="px-5 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs shadow-warm-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isBn ? 'রক্তদাতা হিসেবে যুক্ত হন' : 'Join as a Donor'}</span>
              </button>
            </div>

            {/* Donor Table/Card Roster */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDonors.map(donor => (
                <div
                  key={donor.id}
                  className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-warm-xs hover:shadow-warm-sm transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-950 border border-[#EAE3D9] shrink-0">
                          {donor.photoUrl ? (
                            <img
                              src={getAssetUrl(donor.photoUrl)}
                              alt={donor.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-base font-extrabold font-display bg-emerald-900">
                              {donor.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 font-display truncate">
                            {donor.fullName}
                          </h4>
                          <span className="text-[11px] font-bold text-emerald-700 block truncate">
                            {donor.orgCategory}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-black text-xs font-display shrink-0">
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{donor.area}, {donor.upazila}, {donor.district}</span>
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-bold text-slate-500">
                          {isBn ? `মোট রক্তদান: ${donor.totalDonations} বার` : `Total: ${donor.totalDonations} times`}
                        </span>
                        {donor.isVerified && (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isBn ? 'যাচাইকৃত' : 'Verified'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDonorForProfile(donor)}
                      className="flex-1 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D9] text-slate-800 font-bold text-xs border border-[#EAE3D9] transition-colors text-center cursor-pointer"
                    >
                      {isBn ? 'বিস্তারিত প্রোফাইল' : 'Full Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDonorForContact(donor)}
                      className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors cursor-pointer"
                      title="Contact Donor"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </ScrollReveal>
        )}

        {/* ==================================================== */}
        {/* TAB 5: BLOOD DONATION STATISTICS */}
        {/* ==================================================== */}
        {activeTab === 'statistics' && (
          <ScrollReveal effect="fade-up">
            <div className="space-y-8">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                {isBn ? 'রক্তদান নেটওয়ার্ক পরিসংখ্যান' : 'Blood Donation Network Statistics'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isBn ? 'লাইভ ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে পরিগণিত রক্তদানের পরিসংখ্যান' : 'Dynamic verified statistics computed in real-time from our central database'}
              </p>
            </div>

            {/* 8 Blood Groups Distribution Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                {isBn ? 'রক্তের গ্রুপভিত্তিক রক্তদাতা বণ্টন' : 'Blood Group Donor Distribution'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => {
                  const count = stats.groupCounts[bg] || 0;
                  const percentage = stats.totalDonors > 0 ? Math.round((count / stats.totalDonors) * 100) : 0;
                  return (
                    <div
                      key={bg}
                      className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-warm-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-black text-sm font-display flex items-center justify-center shadow-xs">
                          {bg}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {percentage}%
                        </span>
                      </div>

                      <div>
                        <p className="text-2xl font-extrabold text-slate-900 font-display">
                          <AnimatedCounter value={count} />
                        </p>
                        <p className="text-[11px] font-bold text-slate-500">
                          {isBn ? 'নিবন্ধিত রক্তদাতা' : 'Registered Donors'}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#006A4E] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall Network Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-6 rounded-3xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-2">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {isBn ? 'মোট সফল রক্তদান' : 'Total Successful Donations'}
                </p>
                <p className="text-3xl font-extrabold text-[#006A4E] font-display">
                  <AnimatedCounter value={stats.totalDonations} /> {isBn ? 'ব্যাগ' : 'Bags'}
                </p>
                <p className="text-xs text-emerald-900">
                  {isBn ? 'হাসপাতালে রোগীর সংকটকালীন মুহূর্তে প্রদত্ত' : 'Delivered directly to critical emergency cases'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 space-y-2">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  {isBn ? 'সক্রিয় জরুরি আবেদন' : 'Active Emergency Requests'}
                </p>
                <p className="text-3xl font-extrabold text-amber-700 font-display">
                  <AnimatedCounter value={stats.activeEmergencyRequests} />
                </p>
                <p className="text-xs text-amber-900">
                  {isBn ? 'কো-অর্ডিনেটরগণ সরাসরি পর্যবেক্ষণ করছেন' : 'Currently being coordinated by volunteer desk'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  {isBn ? 'জরুরি রক্তদানে প্রস্তুত' : 'Immediate Emergency Readiness'}
                </p>
                <p className="text-3xl font-extrabold text-rose-600 font-display">
                  <AnimatedCounter value={stats.activeDonors} /> {isBn ? 'জন' : 'Donors'}
                </p>
                <p className="text-xs text-rose-900">
                  {isBn ? 'তাৎক্ষণিক হাসপাতালে পৌঁছাতে প্রস্তুত' : 'Available within minimum response window'}
                </p>
              </div>
            </div>
            </div>
          </ScrollReveal>
        )}

        {/* ==================================================== */}
        {/* TAB 6: GUIDELINES & SAFETY TIPS */}
        {/* ==================================================== */}
        {activeTab === 'guidelines' && (
          <ScrollReveal effect="fade-up">
            <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                {tText(bloodDonationSettings.guidelinesTitle) || (isBn ? 'রক্তদানের সাধারণ নিয়মাবলী ও স্বাস্থ্য তথ্য' : 'Blood Donation Guidelines & Health Safety')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isBn ? 'একজন সুস্থ মানুষ নিরাপদে রক্তদানের জন্য যে বিষয়গুলো জানা জরুরি' : 'Essential medical criteria and tips for safe voluntary blood donation'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Eligibility Criteria */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE3D9] shadow-warm-xs space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006A4E] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  {isBn ? 'রক্তদানের প্রাথমিক যোগ্যতা' : 'Basic Donor Eligibility'}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'বয়স: ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে।' : 'Age between 18 and 60 years.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'ওজন: পুরুষদের ক্ষেত্রে ন্যূনতম ৫০ কেজি, নারীদের ৪৫ কেজি।' : 'Weight: Minimum 50kg for males, 45kg for females.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'ব্যবধান: পূর্ববর্তী রক্তদানের পর কমপক্ষে ৩ মাস (৯০ দিন) অতিক্রান্ত হতে হবে।' : 'Interval: At least 90 days (3 months) since last donation.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                    <span>{isBn ? 'হিমোগ্লোবিন: স্বাভাবিক মাত্রা (পুরুষ ১২.৫+, নারী ১২.০+) বজায় থাকতে হবে।' : 'Hemoglobin: Within standard clinical thresholds.'}</span>
                  </li>
                </ul>
              </div>

              {/* Before Donation */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE3D9] shadow-warm-xs space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  {isBn ? 'রক্তদানের পূর্বে ও পরের করণীয়' : 'Preparation & Post-Donation'}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{isBn ? 'রক্তদানের পূর্বে পর্যাপ্ত পানি ও পুষ্টিকর খাবার গ্রহণ করুন, খালি পেটে রক্তদান করবেন না।' : 'Drink plenty of water and eat a healthy meal prior to donation.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{isBn ? 'পূর্ববর্তী রাতে কমপক্ষে ৬-৮ ঘণ্টা ভালো ঘুম নিশ্চিত করুন।' : 'Ensure 6-8 hours of sound sleep the night before.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{isBn ? 'রক্তদানের পর ১০-১৫ মিনিট বিশ্রাম নিন এবং পর্যাপ্ত তরল পান করুন।' : 'Rest for 10-15 minutes and take fluids immediately after.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{isBn ? 'রক্তদানের দিন ভারী শারীরিক ব্যায়াম বা পরিশ্রম থেকে বিরত থাকুন।' : 'Avoid heavy physical lifting for the remainder of the day.'}</span>
                  </li>
                </ul>
              </div>
            </div>
            </div>
          </ScrollReveal>
        )}
      </main>

      {/* Profile Detail Modal */}
      {selectedDonorForProfile && (
        <BloodDonorProfileModal
          isOpen={Boolean(selectedDonorForProfile)}
          donor={selectedDonorForProfile}
          onClose={() => setSelectedDonorForProfile(null)}
          onContactClick={(donor) => {
            setSelectedDonorForProfile(null);
            setSelectedDonorForContact(donor);
          }}
          onUpdateClick={(donor) => {
            setSelectedDonorForProfile(null);
            populateUpdateForm(donor);
            scrollToFormSection('update-donor');
          }}
        />
      )}

      {/* Contact / Helpline Modal */}
      {selectedDonorForContact && (
        <EmergencyBloodContactModal
          isOpen={Boolean(selectedDonorForContact)}
          donor={selectedDonorForContact}
          emergencyHelpline={bloodDonationSettings.emergencyHelpline}
          onClose={() => setSelectedDonorForContact(null)}
          onOpenEmergencyRequest={() => {
            setSelectedDonorForContact(null);
            scrollToFormSection('emergency-request');
          }}
        />
      )}

      {/* Interactive Image Cropper Modal (1:1 Aspect Ratio with Zoom In/Out, Pan, Rotate, Flip) */}
      <ImageEditorModal
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setCropperCallback(null);
        }}
        imageUrl={cropperImageUrl}
        title={cropperTitle || (isBn ? 'ছবি ক্রপ ও জুম এডিটর (১:১)' : 'Photo Zoom & Crop (1:1)')}
        defaultAspectRatio="1:1"
        allowedAspectRatios={['1:1', '4:5', '3:4', 'free']}
        onSave={(croppedDataUrl) => {
          if (cropperCallback) {
            cropperCallback(croppedDataUrl);
          }
          setCropperOpen(false);
          setCropperCallback(null);
        }}
      />
    </div>
  );
};
