import {
  BloodDonor,
  EmergencyBloodRequest,
  BloodDonationSettings,
  DonorCategoryOption
} from '../types';

/**
 * Common Upazilas / Thanas for Chattogram and major divisions
 */
export const CHATTOGRAM_UPAZILAS = [
  'Hathazari',
  'Raozan',
  'Fatikchhari',
  'Sitakunda',
  'Mirsharai',
  'Boalkhali',
  'Patiya',
  'Anwara',
  'Chandanaish',
  'Satkania',
  'Lohagara',
  'Banshkhali',
  'Karnafuli',
  'Rangunia',
  'Sandwip',
  'Panchlaish (City)',
  'Kotwali (City)',
  'Khulshi (City)',
  'Halishahar (City)',
  'Agrabad / Double Mooring',
  'Bayezid (City)',
  'Bakalia (City)',
  'Chandgaon (City)',
  'Chawkbazar (City)',
  'Pahartali (City)',
  'Patenga (City)'
];

export const DHAKA_UPAZILAS = [
  'Dhanmondi',
  'Mirpur',
  'Mohammadpur',
  'Gulshan',
  'Banani',
  'Uttara',
  'Motijheel',
  'Shahbagh',
  'Badda',
  'Tejgaon',
  'Savar',
  'Dhamrai',
  'Keraniganj'
];

/**
 * Safe String Resolver to prevent React Error #31 (Objects are not valid as a React child)
 */
export function toSafeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.nameEn || val.nameBn || val.en || val.bn || val.name?.en || val.name?.bn || val.name || fallback;
  }
  return fallback;
}

/**
 * Sanitizes any BloodDonor object to ensure no nested objects exist in string fields
 */
export function cleanBloodDonor(d: any): BloodDonor {
  if (!d) return d;
  const district = toSafeString(d.district, 'Chattogram');
  const upazila = toSafeString(d.upazila, 'Sadar');
  const area = toSafeString(d.area, '');
  const detailedAddress = toSafeString(d.detailedAddress, '');
  let orgCategory = toSafeString(d.orgCategory, 'Open Voluntary Blood Donor');
  if (orgCategory === 'Infinity Bangladesh Volunteer' || orgCategory === 'Executive Committee' || orgCategory === 'Standing Committee') {
    orgCategory = 'Infinity Bangladesh Member';
  } else if (orgCategory === 'External Blood Donor') {
    orgCategory = 'Open Voluntary Blood Donor';
  }
  const committeePosition = d.committeePosition ? toSafeString(d.committeePosition, '') : (d.orgCategory === 'Executive Committee' || d.orgCategory === 'Standing Committee' ? d.orgCategory : undefined);
  const fullName = toSafeString(d.fullName, '');
  const phone = toSafeString(d.phone, '');
  const email = toSafeString(d.email, '');
  const gender = toSafeString(d.gender, 'Male');
  // Male donors are automatically public; Female/Other donors follow their privacy preference
  const showPhonePublicly = d.showPhonePublicly !== undefined ? Boolean(d.showPhonePublicly) : (gender === 'Male');

  return {
    ...d,
    fullName,
    gender,
    phone,
    email,
    district,
    upazila,
    area,
    detailedAddress,
    orgCategory,
    showPhonePublicly,
    committeePosition: committeePosition || undefined
  };
}

/**
 * Sanitizes any EmergencyBloodRequest object
 */
export function cleanEmergencyRequest(r: any): EmergencyBloodRequest {
  if (!r) return r;
  const district = toSafeString(r.district, 'Chattogram');
  const upazila = toSafeString(r.upazila, 'Sadar');
  const requesterName = toSafeString(r.requesterName, '');
  const patientName = toSafeString(r.patientName, '');
  const hospitalName = toSafeString(r.hospitalName, '');
  const contactNumber = toSafeString(r.contactNumber, '');

  return {
    ...r,
    district,
    upazila,
    requesterName,
    patientName,
    hospitalName,
    contactNumber
  };
}

/**
 * Master Admin Access Passcodes that always unlock profile editing
 */
export const MASTER_ADMIN_PASSCODES: string[] = [];

/**
 * Generates or retrieves deterministic 6-digit donor edit access passcode
 */
export function getDonorEditAccessCode(donor: BloodDonor): string {
  if (!donor) return '';
  if ((donor as any).editPasscode) return String((donor as any).editPasscode);

  const raw = `${donor.id}_${donor.phone || '01800000000'}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash % 900000) + 100000;
  return String(code);
}

/**
 * Validates donor edit passcode against Admin code or Master passcodes
 */
export function verifyDonorAccessCode(donor: BloodDonor, inputCode: string): boolean {
  if (!donor || !inputCode) return false;
  const cleanInput = inputCode.trim();
  const isAdminAuth = typeof window !== 'undefined' && localStorage.getItem('infinity_bd_admin_auth') === 'true' && Boolean(sessionStorage.getItem('infinity_admin_user'));
  if (isAdminAuth || (MASTER_ADMIN_PASSCODES.length > 0 && MASTER_ADMIN_PASSCODES.includes(cleanInput))) {
    return true;
  }
  const expectedCode = getDonorEditAccessCode(donor);
  return cleanInput === expectedCode;
}

/**
 * Helper to get available upazilas by district
 */
export function getUpazilasForDistrict(districtName: any): string[] {
  const norm = toSafeString(districtName).toLowerCase().trim();
  if (norm === 'chattogram' || norm === 'chittagong') {
    return CHATTOGRAM_UPAZILAS;
  }
  if (norm === 'dhaka') {
    return DHAKA_UPAZILAS;
  }
  return [
    'Sadar / Central',
    'North Upazila',
    'South Upazila',
    'East Upazila',
    'West Upazila'
  ];
}

/**
 * Cooldown period in days between blood donations (90 days = 3 months)
 */
export const BLOOD_DONATION_COOLDOWN_DAYS = 90;

/**
 * Period in days during which a donor's mobile number is hidden after donating blood (90 days)
 */
export const BLOOD_DONATION_PHONE_HIDE_DAYS = 90;

/**
 * Safely masks a mobile number for privacy (e.g. 01839008339 -> 018•••••39)
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length < 7) return '••••••••';
  const start = clean.slice(0, 3);
  const end = clean.slice(-2);
  return `${start}•••••${end}`;
}

export type DonorPhoneVisibilityReason =
  | 'WITHIN_90_DAYS_COOLDOWN'
  | 'PENDING_APPROVAL'
  | 'UNVERIFIED_DONOR'
  | 'CONSENT_WITHHELD'
  | 'INVALID_DONATION_DATE'
  | 'DONOR_PREFERENCE_PRIVATE'
  | 'OPTED_IN_ELIGIBLE'
  | 'MALE_PUBLIC'
  | 'FEMALE_OPTED_IN'
  | 'FEMALE_PRIVATE'
  | 'OTHER_PRIVATE'
  | 'NO_PHONE';

export interface DonorPhoneVisibility {
  isPublic: boolean;
  reason: DonorPhoneVisibilityReason;
  messageBn: string;
  messageEn: string;
  maskedPhone: string;
  displayPhone: string;
  daysPassedSinceDonation: number | null;
  daysRemainingIn90Days: number | null;
  isWithin90Days: boolean;
}

export interface DonationCooldownEvaluation {
  isValidDate: boolean;
  isNeverDonated: boolean;
  isFutureDate: boolean;
  isMalformedOrImpossible: boolean;
  cooldownActive: boolean;
  isEligible: boolean;
  daysPassed: number | null;
  daysRemaining: number;
}

/**
 * Deterministic Asia/Dhaka 90-Day Blood Donation Cooldown Evaluator
 * Partitions date input into 5 distinct states:
 * 1. Never Donated (NULL / empty) -> Eligible
 * 2. Valid Past Date < 90 days -> Cooldown Active
 * 3. Valid Past Date >= 90 days -> Eligible
 * 4. Future Date -> Invalid / Fail Closed
 * 5. Malformed or Impossible Date (e.g. 2023-02-29) -> Invalid / Fail Closed
 */
export function evaluateDonationCooldown(lastDonationDateStr?: string | null): DonationCooldownEvaluation {
  if (!lastDonationDateStr || !lastDonationDateStr.trim()) {
    return {
      isValidDate: true,
      isNeverDonated: true,
      isFutureDate: false,
      isMalformedOrImpossible: false,
      cooldownActive: false,
      isEligible: true,
      daysPassed: null,
      daysRemaining: 0
    };
  }

  const trimmed = lastDonationDateStr.trim();
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(trimmed);
  if (!match) {
    return {
      isValidDate: false,
      isNeverDonated: false,
      isFutureDate: false,
      isMalformedOrImpossible: true,
      cooldownActive: true,
      isEligible: false,
      daysPassed: null,
      daysRemaining: 90
    };
  }

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  // Calendar validation (leap year, impossible days)
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  if (
    dateObj.getUTCFullYear() !== y ||
    dateObj.getUTCMonth() !== m - 1 ||
    dateObj.getUTCDate() !== d
  ) {
    return {
      isValidDate: false,
      isNeverDonated: false,
      isFutureDate: false,
      isMalformedOrImpossible: true,
      cooldownActive: true,
      isEligible: false,
      daysPassed: null,
      daysRemaining: 90
    };
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const parts = formatter.formatToParts(new Date());
  let dhakaY = 0, dhakaM = 0, dhakaD = 0;
  for (const part of parts) {
    if (part.type === 'year') dhakaY = parseInt(part.value, 10);
    if (part.type === 'month') dhakaM = parseInt(part.value, 10);
    if (part.type === 'day') dhakaD = parseInt(part.value, 10);
  }

  const donationEpochDay = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const currentEpochDay = Math.floor(Date.UTC(dhakaY, dhakaM - 1, dhakaD) / 86400000);
  const diffDays = currentEpochDay - donationEpochDay;

  if (diffDays < 0) {
    return {
      isValidDate: false,
      isNeverDonated: false,
      isFutureDate: true,
      isMalformedOrImpossible: false,
      cooldownActive: true,
      isEligible: false,
      daysPassed: null,
      daysRemaining: 90
    };
  }

  if (diffDays < 90) {
    return {
      isValidDate: true,
      isNeverDonated: false,
      isFutureDate: false,
      isMalformedOrImpossible: false,
      cooldownActive: true,
      isEligible: false,
      daysPassed: diffDays,
      daysRemaining: 90 - diffDays
    };
  }

  return {
    isValidDate: true,
    isNeverDonated: false,
    isFutureDate: false,
    isMalformedOrImpossible: false,
    cooldownActive: false,
    isEligible: true,
    daysPassed: diffDays,
    daysRemaining: 0
  };
}

/**
 * 6-Condition Fail-Closed Phone Visibility Gate (Gender Neutral)
 * Reveals raw phone ONLY when all 6 conditions pass:
 * 1. approvalStatus === 'APPROVED'
 * 2. isVerified === true
 * 3. privacyConsent === true
 * 4. Valid, non-future last donation date
 * 5. 90-day cooldown expired (or never donated)
 * 6. showPhonePublicly === true
 */
export function getDonorPhoneVisibility(donor: Partial<BloodDonor> | null | undefined): DonorPhoneVisibility {
  const rawPhone = donor?.phone ? String(donor.phone).trim() : '';
  const maskedPhone = maskPhoneNumber(rawPhone);

  if (!donor || !rawPhone) {
    return {
      isPublic: false,
      reason: 'NO_PHONE',
      messageBn: 'কোনো ফোন নম্বর সংরক্ষিত নেই',
      messageEn: 'No phone number on record',
      maskedPhone: '',
      displayPhone: '',
      daysPassedSinceDonation: null,
      daysRemainingIn90Days: null,
      isWithin90Days: false
    };
  }

  const cooldown = evaluateDonationCooldown(donor.lastDonationDate);

  if (donor.approvalStatus !== 'APPROVED') {
    return {
      isPublic: false,
      reason: 'PENDING_APPROVAL',
      messageBn: 'রক্তদাতার আবেদনটি অ্যাডমিন দ্বারা যাচাই ও অনুমোদনের অপেক্ষায় রয়েছে।',
      messageEn: 'Donor profile is pending administrative verification and approval.',
      maskedPhone,
      displayPhone: maskedPhone,
      daysPassedSinceDonation: cooldown.daysPassed,
      daysRemainingIn90Days: cooldown.daysRemaining,
      isWithin90Days: cooldown.cooldownActive
    };
  }

  if (donor.isVerified !== true) {
    return {
      isPublic: false,
      reason: 'UNVERIFIED_DONOR',
      messageBn: 'রক্তদাতার প্রোফাইলটি এখনো যাচাই সম্পন্ন হয়নি।',
      messageEn: 'Donor profile verification has not been completed.',
      maskedPhone,
      displayPhone: maskedPhone,
      daysPassedSinceDonation: cooldown.daysPassed,
      daysRemainingIn90Days: cooldown.daysRemaining,
      isWithin90Days: cooldown.cooldownActive
    };
  }

  if (donor.privacyConsent !== true) {
    return {
      isPublic: false,
      reason: 'CONSENT_WITHHELD',
      messageBn: 'রক্তদাতা যোগাযোগের তথ্য প্রকাশের সম্মতি প্রত্যাহার বা প্রদান করেননি।',
      messageEn: 'Donor privacy consent is not active.',
      maskedPhone,
      displayPhone: maskedPhone,
      daysPassedSinceDonation: cooldown.daysPassed,
      daysRemainingIn90Days: cooldown.daysRemaining,
      isWithin90Days: cooldown.cooldownActive
    };
  }

  if (!cooldown.isValidDate) {
    return {
      isPublic: false,
      reason: 'INVALID_DONATION_DATE',
      messageBn: 'রক্তদানের তারিখে অসংগতি থাকায় সুরক্ষার্থে নম্বর গোপন রাখা হয়েছে।',
      messageEn: 'Phone number is hidden due to invalid donation date record.',
      maskedPhone,
      displayPhone: maskedPhone,
      daysPassedSinceDonation: null,
      daysRemainingIn90Days: 90,
      isWithin90Days: true
    };
  }

  if (cooldown.cooldownActive) {
    return {
      isPublic: false,
      reason: 'WITHIN_90_DAYS_COOLDOWN',
      messageBn: `রক্তদানের পর ৯০ দিন শারীরিক বিশ্রামের নিয়ম থাকায় নম্বর গোপন রাখা হয়েছে (আর ${cooldown.daysRemaining} দিন পর নম্বর উন্মুক্ত হবে)।`,
      messageEn: `Phone number is hidden during the 90-day post-donation recovery period (${cooldown.daysRemaining} days remaining).`,
      maskedPhone,
      displayPhone: maskedPhone,
      daysPassedSinceDonation: cooldown.daysPassed,
      daysRemainingIn90Days: cooldown.daysRemaining,
      isWithin90Days: true
    };
  }

  if (!donor.showPhonePublicly) {
    return {
      isPublic: false,
      reason: 'DONOR_PREFERENCE_PRIVATE',
      messageBn: 'রক্তদাতার ব্যক্তিগত পছন্দের কারণে সরাসরি নম্বর গোপন রাখা হয়েছে। হেল্পলাইনের মাধ্যমে যোগাযোগ করুন।',
      messageEn: 'Phone number is kept private by donor choice. Please contact via 24/7 Helpline.',
      maskedPhone,
      displayPhone: maskedPhone,
      daysPassedSinceDonation: cooldown.daysPassed,
      daysRemainingIn90Days: null,
      isWithin90Days: false
    };
  }

  return {
    isPublic: true,
    reason: 'OPTED_IN_ELIGIBLE',
    messageBn: 'যাচাইকৃত রক্তদাতার সাথে সরাসরি যোগাযোগের নম্বর উন্মুক্ত রয়েছে।',
    messageEn: 'Verified donor phone number is public for direct emergency contact.',
    maskedPhone,
    displayPhone: rawPhone,
    daysPassedSinceDonation: cooldown.daysPassed,
    daysRemainingIn90Days: 0,
    isWithin90Days: false
  };
}

export function isEligibleToDonate(lastDonationDate?: string): {
  eligible: boolean;
  daysRemaining: number;
  daysPassed: number | null;
  nextEligibleDateStr: string | null;
} {
  if (!lastDonationDate) {
    return {
      eligible: true,
      daysRemaining: 0,
      daysPassed: null,
      nextEligibleDateStr: null
    };
  }

  const lastDate = new Date(lastDonationDate);
  if (isNaN(lastDate.getTime())) {
    return {
      eligible: true,
      daysRemaining: 0,
      daysPassed: null,
      nextEligibleDateStr: null
    };
  }

  const today = new Date();
  const diffTime = today.getTime() - lastDate.getTime();
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + BLOOD_DONATION_COOLDOWN_DAYS);
  const nextEligibleDateStr = nextDate.toISOString().split('T')[0];

  if (daysPassed >= BLOOD_DONATION_COOLDOWN_DAYS) {
    return {
      eligible: true,
      daysRemaining: 0,
      daysPassed,
      nextEligibleDateStr
    };
  }

  const daysRemaining = Math.max(0, BLOOD_DONATION_COOLDOWN_DAYS - daysPassed);
  return {
    eligible: false,
    daysRemaining,
    daysPassed: Math.max(0, daysPassed),
    nextEligibleDateStr
  };
}

/**
 * Format donation cooldown text for UI badges and banners
 */
export function getCooldownStatusInfo(lastDonationDate?: string, isBn: boolean = true) {
  const result = isEligibleToDonate(lastDonationDate);

  if (!lastDonationDate || result.daysPassed === null) {
    return {
      isEligible: true,
      badgeText: isBn ? 'রক্তদানে প্রস্তুত' : 'Eligible to Donate',
      badgeColorClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      description: isBn
        ? 'পূর্ববর্তী রক্তদানের কোনো রেকর্ড নেই, আপনি রক্তদানের জন্য সম্পূর্ণ প্রস্তুত।'
        : 'No previous donation record found. You are eligible to donate.'
    };
  }

  if (result.eligible) {
    return {
      isEligible: true,
      daysPassed: result.daysPassed,
      badgeText: isBn ? 'রক্তদানে সম্পূর্ণ প্রস্তুত' : 'Ready & Eligible to Donate',
      badgeColorClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      description: isBn
        ? `সর্বশেষ রক্তদানের পর ${result.daysPassed} দিন অতিক্রান্ত হয়েছে (৯০ দিন সম্পন্ন)। আপনি নিরাপদে রক্তদান করতে পারবেন।`
        : `${result.daysPassed} days have passed since your last donation (90-day cooldown complete). You are ready to donate safely.`
    };
  }

  return {
    isEligible: false,
    daysRemaining: result.daysRemaining,
    daysPassed: result.daysPassed,
    nextEligibleDateStr: result.nextEligibleDateStr,
    badgeText: isBn ? `৯০ দিন পূর্ণ হতে আর ${result.daysRemaining} দিন বাকি` : `${result.daysRemaining} days remaining in 90-day cooldown`,
    badgeColorClass: 'bg-rose-50 text-rose-800 border-rose-300',
    description: isBn
      ? `আপনার শেষ রক্তদানের পর ${result.daysPassed} দিন পার হয়েছে। সুস্থতার জন্য ৯০ দিন (৩ মাস) পূর্ণ হওয়া পর্যন্ত বিশ্রাম নেওয়া আবশ্যক। আগামী ${result.nextEligibleDateStr} থেকে রক্তদানে সক্ষম হবেন।`
      : `${result.daysPassed} days passed since last donation. 90-day cooldown required for safe donation. Eligible again on ${result.nextEligibleDateStr}.`
  };
}

/**
 * Calculate age in years from a Date of Birth string (YYYY-MM-DD)
 * Evaluated deterministically at Asia/Dhaka midnight with strict calendar validation.
 */
export function calculateAge(dobString?: string): number | null {
  if (!dobString || typeof dobString !== 'string') return null;
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(dobString.trim());
  if (!match) return null;

  const birthYear = parseInt(match[1], 10);
  const birthMonth = parseInt(match[2], 10);
  const birthDay = parseInt(match[3], 10);

  // Calendar validation (leap year, impossible days)
  const testDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
  if (
    testDate.getUTCFullYear() !== birthYear ||
    testDate.getUTCMonth() !== birthMonth - 1 ||
    testDate.getUTCDate() !== birthDay
  ) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const parts = formatter.formatToParts(new Date());
  let dhakaY = 0, dhakaM = 0, dhakaD = 0;
  for (const part of parts) {
    if (part.type === 'year') dhakaY = parseInt(part.value, 10);
    if (part.type === 'month') dhakaM = parseInt(part.value, 10);
    if (part.type === 'day') dhakaD = parseInt(part.value, 10);
  }

  let age = dhakaY - birthYear;
  if (dhakaM < birthMonth || (dhakaM === birthMonth && dhakaD < birthDay)) {
    age--;
  }
  return age >= 0 ? age : null;
}

export const DEFAULT_DONOR_CATEGORIES: DonorCategoryOption[] = [
  {
    id: 'cat-open',
    name: {
      en: 'Open Voluntary Blood Donor',
      bn: 'উন্মুক্ত স্বেচ্ছাসেবী রক্তদাতা'
    },
    badgeColor: '#E11D48',
    displayOrder: 1,
    isDefault: true
  },
  {
    id: 'cat-member',
    name: {
      en: 'Infinity Bangladesh Member',
      bn: 'ইনফিনিটি বাংলাদেশ সদস্য'
    },
    badgeColor: '#006A4E',
    displayOrder: 2,
    isDefault: true
  }
];

/**
 * Initial Default Blood Donation Settings
 */
export const INITIAL_BLOOD_SETTINGS: BloodDonationSettings = {
  wingLogoUrl: '/brand/Infinitylifeline-logo.svg',
  wingLogoSize: 480,
  wingLogoZoom: 1,
  wingLogoCrop: 'contain',
  heroBadge: {
    en: 'Emergency Blood Donation & Coordination 📍',
    bn: 'জরুরি রক্তদান ও সমন্বয় নেটওয়ার্ক 📍'
  },
  heroTitle: {
    en: 'Infinity Blood Donation Network',
    bn: 'ইনফিনিটি বাংলাদেশ রক্তদান নেটওয়ার্ক'
  },
  heroSubtitle: {
    en: 'An Emergency Blood Donation Initiative by Infinity Bangladesh 🩸',
    bn: 'ইনফিনিটি বাংলাদেশ-এর একটি জরুরি রক্তদান উদ্যোগ 🩸'
  },
  heroCtaBadge: {
    en: 'JOIN THE CAUSE',
    bn: 'মানবতার আহ্বান'
  },
  heroCtaTitle: {
    en: 'Be a Donor, Be a Hero',
    bn: 'রক্তদাতা হোন, জীবন বাঁচান'
  },
  heroCtaDescription: {
    en: 'Every drop counts. Register as a voluntary blood donor with Team Infinity and become someone’s lifeline in moments of crisis.',
    bn: 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি মূল্যবান প্রাণ। ইনফিনিটি বাংলাদেশ রক্তদান নেটওয়ার্কে রক্তদাতা হিসেবে যুক্ত হতে এখনই রেজিস্ট্রেশন করুন।'
  },
  heroCtaBtn1Text: {
    en: 'Become a Donor',
    bn: 'রক্তদাতা হতে রেজিস্ট্রেশন করুন'
  },
  heroCtaBtn2Text: {
    en: 'Emergency Blood Request',
    bn: 'জরুরি রক্তের আবেদন করুন'
  },
  statTotalDonorsLabel: {
    en: 'Total Donors',
    bn: 'নিবন্ধিত রক্তদাতা'
  },
  statActiveDonorsLabel: {
    en: 'Active Donors',
    bn: 'জরুরিতে প্রস্তুত'
  },
  statGroupsLabel: {
    en: 'Blood Groups',
    bn: 'সকল ব্লাড গ্রুপ'
  },
  statGroupsValue: '8/8',
  statImpactLabel: {
    en: 'Total Donor Experience',
    bn: 'রক্তদানের মোট অভিজ্ঞতা'
  },
  statTotalDonorsOverride: null,
  statActiveDonorsOverride: null,
  statImpactOverride: null,
  emergencyHelpline: '+880 1839-008339',
  helplineLabel: {
    en: '24/7 Helpline:',
    bn: '২৪/৭ ব্লাড হেল্পলাইন:'
  },
  coordinationEmail: 'blood@infinitybangladesh.org',
  guidelinesTitle: {
    en: 'Blood Donation Guidelines & Eligibility',
    bn: 'রক্তদানের নীতিমালা ও আবশ্যিক নির্দেশিকা'
  },
  guidelinesText: {
    en: 'Age: 18-60 years. Minimum Weight: 45kg for females, 50kg for males. Interval: At least 90 days (3 months) between donations.',
    bn: 'বয়স: ১৮-৬০ বছর। সর্বনিম্ন ওজন: মহিলাদের ৪৫ কেজি, পুরুষদের ৫০ কেজি। ব্যবধান: প্রতি ৩ মাস (৯০ দিন) পর পর রক্তদান করা নিরাপদ।'
  },
  consentStatement: {
    en: 'I hereby confirm my willingness to be a voluntary blood donor and consent to Infinity Bangladesh coordinating blood requests.',
    bn: 'আমি স্বেচ্ছায় রক্তদাতা হিসেবে নিবন্ধিত হতে সম্মত এবং ইনফিনিটি বাংলাদেশ কর্তৃক রক্তদানের সমন্বয়ে তথ্য ব্যবহারে সম্মতি দিচ্ছি।'
  },
  enablePublicDirectContact: true
};

/**
 * Initial Seed Blood Donors: Real donor records are managed dynamically via Supabase
 * with server-side Row Level Security. Never commit personal contact numbers or home
 * addresses into client-side production JavaScript bundles.
 */
export const INITIAL_BLOOD_DONORS: BloodDonor[] = [];

/**
 * Initial Active Emergency Blood Requests (Real requests submitted via form or admin)
 */
export const INITIAL_EMERGENCY_REQUESTS: EmergencyBloodRequest[] = [];

