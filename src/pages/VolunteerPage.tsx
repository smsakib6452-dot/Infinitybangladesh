import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SectionHeading } from '../components/SectionHeading';
import { DateInput } from '../components/DateInput';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import { getAssetUrl } from '../lib/utils/assetHelper';
import {
  Users,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  HelpCircle,
  FileCheck,
  ExternalLink,
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';
import { EducationCategory, VolunteerApplication } from '../types';
import { ScrollReveal } from '../components/motion/ScrollReveal';
export const VolunteerPage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const { volunteerSettings, addVolunteerApplication } = useData();

  // Wizard Step State (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Anti-spam honeypot
  const [honeypot, setHoneypot] = useState<string>('');

  // ----------------------------------------------------
  // SECTION 1: Basic Profile & Photo
  // ----------------------------------------------------
  const [email, setEmail] = useState('');
  const [fullNameBn, setFullNameBn] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // SECTION 2: Family & Guardian Information
  // ----------------------------------------------------
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // ----------------------------------------------------
  // SECTION 3: Address & Contact Details
  // ----------------------------------------------------
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSameWhatsapp, setIsSameWhatsapp] = useState(true);
  const [facebookUrl, setFacebookUrl] = useState('');

  const [presentDistrict, setPresentDistrict] = useState('Chattogram');
  const [presentUpazila, setPresentUpazila] = useState('');
  const [presentAddressDetails, setPresentAddressDetails] = useState('');

  const [isSameAddress, setIsSameAddress] = useState(true);
  const [permanentDistrict, setPermanentDistrict] = useState('Chattogram');
  const [permanentUpazila, setPermanentUpazila] = useState('');
  const [permanentAddressDetails, setPermanentAddressDetails] = useState('');

  // ----------------------------------------------------
  // SECTION 4: Personal & Health Information
  // ----------------------------------------------------
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [nidOrBirthCert, setNidOrBirthCert] = useState('');

  // ----------------------------------------------------
  // SECTION 5: Educational Information (Conditional)
  // ----------------------------------------------------
  const [educationCategory, setEducationCategory] = useState<EducationCategory>('honours');
  const [occupation, setOccupation] = useState('');

  // 1. High School
  const [schoolName, setSchoolName] = useState('');
  const [currentClass, setCurrentClass] = useState('১০ম');
  const [expectedSscYear, setExpectedSscYear] = useState('2026');

  // 2. SSC
  const [sscInstitution, setSscInstitution] = useState('');
  const [sscGroup, setSscGroup] = useState('বিজ্ঞান');
  const [sscPassingYear, setSscPassingYear] = useState('2024');
  const [sscBoard, setSscBoard] = useState('Chattogram');

  // 3. HSC
  const [hscInstitution, setHscInstitution] = useState('');
  const [hscGroup, setHscGroup] = useState('বিজ্ঞান');
  const [hscPassingYear, setHscPassingYear] = useState('2024');
  const [hscBoard, setHscBoard] = useState('Chattogram');

  // 4. Diploma
  const [diplomaTechnology, setDiplomaTechnology] = useState('');
  const [diplomaInstitute, setDiplomaInstitute] = useState('');
  const [diplomaDepartment, setDiplomaDepartment] = useState('');
  const [diplomaSemester, setDiplomaSemester] = useState('৪র্থ পর্ব');
  const [diplomaStatus, setDiplomaStatus] = useState<'running' | 'completed'>('running');
  const [diplomaPassingYear, setDiplomaPassingYear] = useState('2026');

  // 5. Honours
  const [honoursInstitute, setHonoursInstitute] = useState('');
  const [honoursSubject, setHonoursSubject] = useState('');
  const [honoursDepartment, setHonoursDepartment] = useState('');
  const [honoursYear, setHonoursYear] = useState('৩য় বর্ষ / ৬ষ্ঠ সেমিস্টার');
  const [honoursStatus, setHonoursStatus] = useState<'running' | 'completed'>('running');
  const [honoursPassingYear, setHonoursPassingYear] = useState('2026');

  // 6. Masters
  const [mastersInstitute, setMastersInstitute] = useState('');
  const [mastersSubject, setMastersSubject] = useState('');
  const [mastersDepartment, setMastersDepartment] = useState('');
  const [mastersStatus, setMastersStatus] = useState<'running' | 'completed'>('running');
  const [mastersPassingYear, setMastersPassingYear] = useState('2026');

  // 7. Other
  const [otherEducation, setOtherEducation] = useState('');

  // ----------------------------------------------------
  // SECTION 6: Skills & Areas of Interest
  // ----------------------------------------------------
  const [skills, setSkills] = useState<string[]>(['মাঠপর্যায়ে ত্রাণ ও সামগ্রী বিতরণ']);
  const [availability, setAvailability] = useState('সপ্তাহে ৩-৫ ঘণ্টা');

  // ----------------------------------------------------
  // SECTION 7: Infinity Bangladesh & Motivation
  // ----------------------------------------------------
  const [referralSource, setReferralSource] = useState('ফেসবুক / সোশ্যাল মিডিয়া');
  const [hasPreviousVolunteering, setHasPreviousVolunteering] = useState(false);
  const [previousExperience, setPreviousExperience] = useState('');
  const [motivation, setMotivation] = useState('');

  // ----------------------------------------------------
  // SECTION 8: Oath, Agreement & Confirmation
  // ----------------------------------------------------
  const [agreedCodeOfConduct, setAgreedCodeOfConduct] = useState(false);
  const [agreedTruthfulness, setAgreedTruthfulness] = useState(false);

  // Sync WhatsApp when phone changes if same is checked
  useEffect(() => {
    if (isSameWhatsapp) {
      setWhatsapp(phone);
    }
  }, [phone, isSameWhatsapp]);

  // Handle Photo Selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStepError(isBn ? 'অনুগ্রহ করে JPG, JPEG, PNG বা WebP ফরম্যাটের ছবি আপলোড করুন।' : 'Please upload JPG, JPEG, PNG or WebP image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStepError(isBn ? 'ছবির সাইজ ৫ মেগাবাইট (5MB)-এর কম হতে হবে।' : 'Image size must be under 5MB.');
      return;
    }

    setPhotoFileName(file.name);
    setStepError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64('');
    setPhotoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Skill Options
  const skillOptions = [
    { id: 'মাঠপর্যায়ে ত্রাণ ও সামগ্রী বিতরণ', bn: 'মাঠপর্যায়ে ত্রাণ ও সামগ্রী বিতরণ', en: 'Field Distribution & Relief' },
    { id: 'গ্রাফিক ডিজাইন ও কন্টেন্ট রাইটিং', bn: 'গ্রাফিক ডিজাইন ও কন্টেন্ট রাইটিং', en: 'Graphic Design & Content Writing' },
    { id: 'ভিডিও এডিটিং ও সিনেমাটোগ্রাফি', bn: 'ভিডিও এডিটিং ও সিনেমাটোগ্রাফি', en: 'Video Editing & Cinematography' },
    { id: 'আলোকচিত্র ও মিডিয়া ডকুমেন্টেশন', bn: 'আলোকচিত্র ও মিডিয়া ডকুমেন্টেশন', en: 'Photography & Media' },
    { id: 'ইভেন্ট ও স্টেজ ম্যানেজমেন্ট', bn: 'ইভেন্ট ও স্টেজ ম্যানেজমেন্ট', en: 'Event & Stage Management' },
    { id: 'আইটি, ওয়েব ও সোশ্যাল মিডিয়া', bn: 'আইটি, ওয়েব ও সোশ্যাল মিডিয়া', en: 'IT, Web & Social Media' },
    { id: 'জরুরি দুর্যোগ মোকাবেলা দল', bn: 'জরুরি দুর্যোগ মোকাবেলা দল', en: 'Emergency Disaster Response' },
    { id: 'লজিস্টিকস ও পরিবহন ব্যবস্থাপনা', bn: 'লজিস্টিকস ও পরিবহন ব্যবস্থাপনা', en: 'Logistics & Supply Chain' },
    { id: 'তহবিল সংগ্রহ ও জনসংযোগ', bn: 'তহবিল সংগ্রহ ও জনসংযোগ', en: 'Fundraising & Public Relations' },
    { id: 'চিকিৎসা ও প্রাথমিক স্বাস্থ্যসেবা', bn: 'চিকিৎসা ও প্রাথমিক স্বাস্থ্যসেবা', en: 'Medical & First Aid Support' }
  ];

  const handleSkillToggle = (id: string) => {
    setSkills(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Education Category Options
  const educationCategoryOptions: { id: EducationCategory; bn: string; en: string; descBn: string; descEn: string }[] = [
    {
      id: 'high_school',
      bn: 'উচ্চ বিদ্যালয়ে অধ্যয়নরত (SSC পাস করেনি)',
      en: 'High School Student (Pre-SSC)',
      descBn: 'যারা বর্তমানে ৬ষ্ঠ থেকে ১০ম শ্রেণিতে পড়ছে',
      descEn: 'Students currently in Class 6 to 10'
    },
    {
      id: 'ssc',
      bn: 'SSC / সমমান পাস',
      en: 'SSC / Equivalent Passed',
      descBn: 'এসএসসি বা সমমান পরীক্ষায় উত্তীর্ণ',
      descEn: 'Passed Secondary School Certificate'
    },
    {
      id: 'hsc',
      bn: 'HSC / সমমান পাস',
      en: 'HSC / Equivalent Passed',
      descBn: 'এইচএসসি বা আলিম পরীক্ষায় উত্তীর্ণ',
      descEn: 'Passed Higher Secondary Certificate'
    },
    {
      id: 'diploma',
      bn: 'Diploma (ডিপ্লোমা ইন ইঞ্জিনিয়ারিং/অন্যান্য)',
      en: 'Diploma in Engineering / Technical',
      descBn: 'পলিটেকনিক বা ডিপ্লোমা অধ্যয়নরত বা সম্পন্ন',
      descEn: 'Polytechnic or Technical Diploma running / completed'
    },
    {
      id: 'honours',
      bn: 'Honours (স্নাতক / অনার্স / ডিগ্রী)',
      en: 'Honours / Bachelor Degree',
      descBn: 'বিশ্ববিদ্যালয় বা কলেজে স্নাতক পর্যায়ে',
      descEn: 'University or College undergraduate'
    },
    {
      id: 'masters',
      bn: 'Masters (স্নাতকোত্তর / মাস্টার্স)',
      en: 'Masters / Postgraduate',
      descBn: 'স্নাতকোত্তর পর্যায়ে অধ্যয়নরত বা সম্পন্ন',
      descEn: 'Postgraduate degree running / completed'
    },
    {
      id: 'other',
      bn: 'অন্যান্য (Other Qualification)',
      en: 'Other Qualification',
      descBn: 'অন্যান্য কারিগরি বা বিশেষ শিক্ষাগত যোগ্যতা',
      descEn: 'Other vocational or specialized education'
    }
  ];

  // ----------------------------------------------------
  // VALIDATION PER STEP
  // ----------------------------------------------------
  const validateStep = (stepNumber: number): boolean => {
    setStepError(null);

    if (stepNumber === 1) {
      if (!fullNameBn.trim() && !fullNameEn.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
        return false;
      }
      if (!email.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন।' : 'Please enter your email address.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setStepError(isBn ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.');
        return false;
      }
      if (!photoBase64) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার একটি পাসপোর্ট সাইজের স্পষ্ট ছবি আপলোড করুন।' : 'Please upload a clear passport-sized photo.');
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (!fatherName.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে পিতার নাম লিখুন।' : "Please enter your father's name.");
        return false;
      }
      if (!motherName.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে মাতার নাম লিখুন।' : "Please enter your mother's name.");
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      if (!phone.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার সচল মোবাইল নম্বর দিন।' : 'Please enter your mobile phone number.');
        return false;
      }
      const phoneClean = phone.replace(/[^0-9+]/g, '');
      if (phoneClean.length < 10) {
        setStepError(isBn ? 'অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (উদা: 01XXXXXXXXX)।' : 'Please provide a valid 11-digit mobile number.');
        return false;
      }
      if (!presentAddressDetails.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার বর্তমান ঠিকানা বিস্তারিত লিখুন।' : 'Please enter your present address details.');
        return false;
      }
      if (!isSameAddress && !permanentAddressDetails.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার স্থায়ী ঠিকানা বিস্তারিত লিখুন।' : 'Please enter your permanent address details.');
        return false;
      }
      return true;
    }

    if (stepNumber === 4) {
      if (!dob) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার জন্ম তারিখ নির্বাচন করুন।' : 'Please select your date of birth.');
        return false;
      }
      if (!bloodGroup) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার রক্তের গ্রুপ নির্বাচন করুন।' : 'Please select your blood group.');
        return false;
      }
      return true;
    }

    if (stepNumber === 5) {
      if (!educationCategory) {
        setStepError(isBn ? 'অনুগ্রহ করে আপনার শিক্ষাগত অবস্থা নির্বাচন করুন।' : 'Please select your educational status.');
        return false;
      }
      if (educationCategory === 'high_school') {
        if (!schoolName.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে বিদ্যালয়ের নাম লিখুন।' : 'Please enter your school name.');
          return false;
        }
        if (!currentClass.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে বর্তমান শ্রেণি লিখুন।' : 'Please enter your current class.');
          return false;
        }
        if (!expectedSscYear.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে সম্ভাব্য SSC পরীক্ষার বছর লিখুন।' : 'Please enter your expected SSC year.');
          return false;
        }
      } else if (educationCategory === 'ssc') {
        if (!sscInstitution.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে SSC শিক্ষা প্রতিষ্ঠানের নাম লিখুন।' : 'Please enter your SSC institution name.');
          return false;
        }
      } else if (educationCategory === 'hsc') {
        if (!hscInstitution.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে কলেজের নাম লিখুন।' : 'Please enter your college name.');
          return false;
        }
      } else if (educationCategory === 'diploma') {
        if (!diplomaTechnology.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে ডিপ্লোমা টেকনোলজি/বিষয় উল্লেখ করুন।' : 'Please enter your diploma technology/subject.');
          return false;
        }
        if (!diplomaInstitute.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে পলিটেকনিক বা ইনস্টিটিউটের নাম লিখুন।' : 'Please enter your polytechnic or institute name.');
          return false;
        }
      } else if (educationCategory === 'honours') {
        if (!honoursInstitute.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে বিশ্ববিদ্যালয় বা কলেজের নাম লিখুন।' : 'Please enter your university or college name.');
          return false;
        }
        if (!honoursSubject.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে বিষয় বা বিভাগ উল্লেখ করুন।' : 'Please enter your subject or department.');
          return false;
        }
      } else if (educationCategory === 'masters') {
        if (!mastersInstitute.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে বিশ্ববিদ্যালয় বা প্রতিষ্ঠানের নাম লিখুন।' : 'Please enter your university/institute name.');
          return false;
        }
      } else if (educationCategory === 'other') {
        if (!otherEducation.trim()) {
          setStepError(isBn ? 'অনুগ্রহ করে আপনার শিক্ষাগত বিবরণ লিখুন।' : 'Please describe your educational qualification.');
          return false;
        }
      }
      return true;
    }

    if (stepNumber === 6) {
      if (skills.length === 0) {
        setStepError(isBn ? 'অনুগ্রহ করে অন্তত একটি আগ্রহ বা দক্ষতার ক্ষেত্র নির্বাচন করুন।' : 'Please select at least one skill or interest area.');
        return false;
      }
      return true;
    }

    if (stepNumber === 7) {
      if (!motivation.trim()) {
        setStepError(isBn ? 'অনুগ্রহ করে ইনফিনিটি বাংলাদেশে যোগদানের কারণ ও উদ্দেশ্য সংক্ষেপে লিখুন।' : 'Please briefly write your motivation for joining.');
        return false;
      }
      return true;
    }

    if (stepNumber === 8) {
      if (!agreedCodeOfConduct) {
        setStepError(isBn ? 'অনুগ্রহ করে সংগঠনের শপথ ও নৈতিক আচরণবিধির সাথে সম্মতি প্রকাশ করুন।' : 'Please accept the code of conduct and organizational oath.');
        return false;
      }
      if (!agreedTruthfulness) {
        setStepError(isBn ? 'অনুগ্রহ করে তথ্যের নির্ভুলতা সংক্রান্ত প্রত্যয়নে টিক দিন।' : 'Please affirm that all provided information is accurate.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setStepError(null);
      setCurrentStep(prev => Math.min(prev + 1, 8));
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStepError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // SUBMISSION HANDLER
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      // Bot detected silently
      return;
    }

    for (let step = 1; step <= 8; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        window.scrollTo({ top: 350, behavior: 'smooth' });
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const fullApplicantName = fullNameBn.trim() || fullNameEn.trim() || 'Volunteer Applicant';
    const trackingRefId = `INF-VOL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const applicationPayload: Partial<VolunteerApplication> = {
      fullName: fullApplicantName,
      fullNameBn: fullNameBn.trim(),
      fullNameEn: fullNameEn.trim(),
      email: email.trim(),
      photoUrl: photoBase64,
      photoBase64: photoBase64,

      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      guardianPhone: guardianPhone.trim(),

      phone: phone.trim(),
      whatsapp: isSameWhatsapp ? phone.trim() : (whatsapp.trim() || phone.trim()),
      facebookUrl: facebookUrl.trim(),

      district: presentDistrict,
      upazila: presentUpazila.trim(),
      presentAddressDetails: presentAddressDetails.trim(),

      permanentDistrict: isSameAddress ? presentDistrict : permanentDistrict,
      permanentUpazila: isSameAddress ? presentUpazila.trim() : permanentUpazila.trim(),
      permanentAddressDetails: isSameAddress ? presentAddressDetails.trim() : permanentAddressDetails.trim(),
      isSameAddress,

      dob,
      gender,
      bloodGroup,
      nidOrBirthCert: nidOrBirthCert.trim(),

      educationCategory,
      occupation: occupation.trim(),

      schoolName: schoolName.trim(),
      currentClass: currentClass.trim(),
      expectedSscYear: expectedSscYear.trim(),

      sscInstitution: sscInstitution.trim(),
      sscGroup: sscGroup.trim(),
      sscPassingYear: sscPassingYear.trim(),
      sscBoard: sscBoard.trim(),

      hscInstitution: hscInstitution.trim(),
      hscGroup: hscGroup.trim(),
      hscPassingYear: hscPassingYear.trim(),
      hscBoard: hscBoard.trim(),

      diplomaTechnology: diplomaTechnology.trim(),
      diplomaInstitute: diplomaInstitute.trim(),
      diplomaDepartment: diplomaDepartment.trim(),
      diplomaSemester: diplomaSemester.trim(),
      diplomaStatus,
      diplomaPassingYear: diplomaPassingYear.trim(),

      honoursInstitute: honoursInstitute.trim(),
      honoursSubject: honoursSubject.trim(),
      honoursDepartment: honoursDepartment.trim(),
      honoursYear: honoursYear.trim(),
      honoursStatus,
      honoursPassingYear: honoursPassingYear.trim(),

      mastersInstitute: mastersInstitute.trim(),
      mastersSubject: mastersSubject.trim(),
      mastersDepartment: mastersDepartment.trim(),
      mastersStatus,
      mastersPassingYear: mastersPassingYear.trim(),

      otherEducation: otherEducation.trim(),

      skills,
      areasOfInterest: skills,
      interests: skills,
      availability,

      referralSource,
      hasPreviousVolunteering,
      previousExperience: previousExperience.trim(),
      motivation: motivation.trim(),
      message: motivation.trim(),

      agreedCodeOfConduct,
      agreedTruthfulness,
      consent: true,
      trackingRef: trackingRefId,
      status: 'New',
      submittedAt: new Date().toISOString()
    };

    try {
      // 1. Save locally and in Supabase CRM
      const ref = addVolunteerApplication(applicationPayload);
      setSubmittedRef(trackingRefId || ref);

      // 2. Dispatch to Google Apps Script Web App Endpoint
      const DEFAULT_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcxmsl9WY-EPo5OMdnouohrwCx1m93BM_DoPZhKTh1Gfi-BdyQ4bncu2hkXq4-vcoN/exec';
      const scriptUrl = volunteerSettings.googleScriptUrl || DEFAULT_GOOGLE_SCRIPT_URL;
      if (scriptUrl && scriptUrl.startsWith('http')) {
        try {
          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors', // standard cross-origin for Google Apps Script Web App
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationPayload)
          });
        } catch (fetchErr) {
          console.warn('Google Apps Script submission notice:', fetchErr);
        }
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(
        isBn
          ? 'দুঃখিত, আপনার আবেদন জমা দেওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'
          : 'Sorry, your application could not be submitted. Please try again in a few moments.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
    setSubmittedRef('');
    setPhotoBase64('');
    setFullNameBn('');
    setFullNameEn('');
    setEmail('');
    setFatherName('');
    setMotherName('');
    setPhone('');
    setWhatsapp('');
    setFacebookUrl('');
    setMotivation('');
    setAgreedCodeOfConduct(false);
    setAgreedTruthfulness(false);
  };

  // Step Section Labels
  const sectionSteps = [
    { num: 1, titleBn: 'পরিচিতি ও ছবি', titleEn: 'Profile & Photo', icon: User },
    { num: 2, titleBn: 'পারিবারিক তথ্য', titleEn: 'Family Info', icon: Home },
    { num: 3, titleBn: 'ঠিকানা ও যোগাযোগ', titleEn: 'Address & Contact', icon: MapPin },
    { num: 4, titleBn: 'ব্যক্তিগত তথ্য', titleEn: 'Personal Info', icon: Calendar },
    { num: 5, titleBn: 'শিক্ষাগত যোগ্যতা', titleEn: 'Education', icon: GraduationCap },
    { num: 6, titleBn: 'দক্ষতা ও সময়', titleEn: 'Skills & Availability', icon: Briefcase },
    { num: 7, titleBn: 'ইনফিনিটি ও প্রেরণা', titleEn: 'Infinity & Motivation', icon: Sparkles },
    { num: 8, titleBn: 'শপথ ও চুক্তি', titleEn: 'Oath & Submit', icon: ShieldCheck }
  ];

  const benefitsList = isBn
    ? volunteerSettings.benefits?.bn || [
        'মাঠপর্যায়ে সরাসরি সামাজিক কাজের বাস্তব অভিজ্ঞতা ও টিমওয়ার্ক',
        'অফিসিয়াল সার্টিফিকেট ও নেতৃত্বের স্বীকৃতি',
        'দুর্যোগ মোকাবেলা, ইভেন্ট ব্যবস্থাপনা ও মাঠপর্যায়ের মানবিক প্রশিক্ষণ',
        'দেশজুড়ে মানবিক কাজে নিবেদিত তরুণদের সাথে ইতিবাচক নেটওয়ার্ক'
      ]
    : volunteerSettings.benefits?.en || [
        'Hands-on grassroots field experience across seasonal drives',
        'Official Certificate of Humanitarian Service & leadership recognition',
        'Disaster preparedness, event management & ethical volunteering training',
        'Vibrant network of passionate young changemakers across Bangladesh'
      ];

  const requirementsList = isBn
    ? volunteerSettings.requirements?.bn || [
        'মানবকল্যাণে নিঃস্বার্থভাবে কাজ করার আন্তরিক ইচ্ছা ও নিষ্ঠা',
        'সংগঠনের গঠনতন্ত্র, শৃঙ্খলা ও শিশু সুরক্ষা নীতিমালার প্রতি পূর্ণ শ্রদ্ধাশীলতা',
        'মাঠপর্যায়ে দলগত শৃঙ্খলা, সহমর্মিতা ও নির্ভরযোগ্যতা বজায় রাখা'
      ]
    : volunteerSettings.requirements?.en || [
        'Dedication to selfless humanitarian service with compassion',
        'Strict adherence to Team Infinity Code of Conduct & child safety rules',
        'Mutual respect, teamwork, and reliability during field drives'
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-14">
      {/* Header Section */}
      <ScrollReveal effect="fade-up">
        <SectionHeading
          badge={isBn ? 'স্বেচ্ছাসেবী পরিবারে স্বাগতম' : 'Be Part of Team Infinity'}
          title={tText(volunteerSettings.ctaText) || (isBn ? 'স্বেচ্ছাসেবী হিসেবে যোগ দিন / সদস্যপদ আবেদন' : 'Join as Volunteer / Membership Application')}
          subtitle={
            tText(volunteerSettings.description) ||
            (isBn
              ? 'আপনার মেধা, সময় এবং সহমর্মিতা দিয়ে একজন মানুষের মুখে হাসি ফোটাতে ইনফিনিটি বাংলাদেশের সাথে যুক্ত হোন।'
              : 'Join a vibrant, ethical youth community committed to transparent grassroots humanitarian action across Bangladesh.')
          }
        />
      </ScrollReveal>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: 8-Section Application Form */}
        <ScrollReveal effect="fade-up" className="lg:col-span-8">
          {isSubmitted ? (
            /* ======================================================== */
            /* SUCCESS CONFIRMATION SCREEN                             */
            /* ======================================================== */
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center space-y-7 shadow-warm-lg animate-in zoom-in-95">
              <div className="w-20 h-20 bg-[#E6F3EF] text-[#006A4E] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F3EF] text-[#00523C] border border-[#C2E2D7] uppercase tracking-wider">
                  {isBn ? 'আবেদন সফল হয়েছে' : 'Application Received'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                  {isBn ? 'আপনার সদস্যপদ আবেদন সফলভাবে জমা হয়েছে!' : 'Application Successfully Submitted!'}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {isBn
                    ? 'আমাদের টিম আপনার তথ্য ও প্রোফাইল যাচাই করে অতি দ্রুত মোবাইল বা হোয়াটসঅ্যাপের মাধ্যমে যোগাযোগ করবে। ইনফিনিটি পরিবারের সাথে থাকার জন্য আপনাকে আন্তরিক ধন্যবাদ।'
                    : 'Our team will review your application and contact you via phone or WhatsApp shortly. Thank you for stepping forward for humanity.'}
                </p>
              </div>

              {/* Reference Tracking Box */}
              <div className="p-5 bg-gradient-to-br from-[#FAF7F2] to-white rounded-3xl border border-[#EAE3D9] max-w-md mx-auto space-y-2 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  {isBn ? 'আপনার অফিসিয়াল আবেদন রেফারেন্স ট্র্যাকিং নম্বর' : 'Official Tracking Reference Number'}
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono font-extrabold text-base sm:text-lg text-[#006A4E] tracking-wider select-all">
                    {submittedRef}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedRef && (
                  <p className="text-[10px] text-emerald-700 font-bold">
                    {isBn ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to clipboard!'}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isBn ? 'আপনার আবেদন ও ছবি গুগল ড্রাইভ ও শিটে সংরক্ষিত হয়েছে।' : 'Application & photo securely synced to Google Drive & Sheets.'}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-3 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs sm:text-sm font-bold transition-all shadow-warm-sm cursor-pointer"
                >
                  {isBn ? 'নতুন আরেকটি আবেদন করুন' : 'Submit Another Application'}
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 8-STEP WIZARD FORM                                       */
            /* ======================================================== */
            <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-10 space-y-8 shadow-warm-md">
              {/* Form Progress Header */}
              <div className="space-y-4 border-b border-slate-100 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-[#006A4E] uppercase tracking-widest bg-[#E6F3EF] px-3 py-1 rounded-full border border-[#C2E2D7] inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006A4E] animate-pulse" />
                        {isBn ? `ধাপ ${currentStep} / ৮` : `Section ${currentStep} of 8`}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {isBn ? 'ইনফিনিটি ভলান্টিয়ার আবেদন' : 'Volunteer Application'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-2 flex items-center gap-2">
                      <span>{isBn ? sectionSteps[currentStep - 1].titleBn : sectionSteps[currentStep - 1].titleEn}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#EAE3D9]">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isBn ? 'অগ্রগতি:' : 'Progress:'}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-[#006A4E]">
                      {Math.round((currentStep / 8) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Elevated Progress Bar */}
                <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden border border-[#EAE3D9] p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#006A4E] via-[#008966] to-[#00A878] h-full transition-all duration-500 rounded-full shadow-xs"
                    style={{ width: `${(currentStep / 8) * 100}%` }}
                  />
                </div>

                {/* Step Icons Pill Bar with Premium Frosted Design */}
                <div className="p-1.5 sm:p-2 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] grid grid-cols-8 gap-1 shadow-inner">
                  {sectionSteps.map((s) => {
                    const Icon = s.icon;
                    const isActive = s.num === currentStep;
                    const isDone = s.num < currentStep;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => {
                          if (s.num < currentStep) {
                            setCurrentStep(s.num);
                          }
                        }}
                        disabled={s.num > currentStep}
                        className={`flex flex-col items-center gap-1 p-1 sm:p-1.5 rounded-xl transition-all duration-200 select-none ${
                          isActive
                            ? 'bg-white shadow-warm-xs ring-2 ring-[#006A4E] text-[#006A4E]'
                            : isDone
                            ? 'text-emerald-700 cursor-pointer hover:bg-white/80'
                            : 'text-slate-400 opacity-60 cursor-not-allowed'
                        }`}
                        title={isBn ? s.titleBn : s.titleEn}
                      >
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                            isActive
                              ? 'bg-[#006A4E] text-white shadow-2xs font-extrabold'
                              : isDone
                              ? 'bg-[#E6F3EF] text-[#006A4E] font-bold'
                              : 'bg-slate-200/70 text-slate-500'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        </div>
                        <span className="text-[9px] font-bold hidden md:inline truncate max-w-full text-center">
                          {s.num}. {isBn ? s.titleBn.split(' ')[0] : s.titleEn.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Honeypot field (hidden from humans) */}
              <input
                type="text"
                name="website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Step Error Banner */}
              {stepError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{stepError}</span>
                </div>
              )}

              {/* Form Body By Step */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* -------------------------------------------------------- */}
                {/* SECTION 1: Basic Profile, Email & Photo                  */}
                {/* -------------------------------------------------------- */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'আপনার নাম, ইমেইল এবং একটি স্পষ্ট পাসপোর্ট সাইজের ছবি আপলোড করুন। এই তথ্য দিয়ে আপনার সদস্য প্রোফাইল তৈরি হবে।'
                        : 'Please provide your full name, email, and a clear passport-sized photograph.'}
                    </div>

                    {/* Photo Upload Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'আপনার পাসপোর্ট সাইজের স্পষ্ট ছবি (Passport Photo) *' : 'Passport Size Photo *'}
                        </label>
                        <span className="text-[10px] font-bold text-[#006A4E] bg-[#E6F3EF] px-2.5 py-0.5 rounded-full border border-[#C2E2D7] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006A4E]" />
                          {isBn ? 'গুগল ড্রাইভে ক্লাউড সিঙ্ক হবে' : 'Synced to Google Drive'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-3xl bg-gradient-to-br from-[#FAF7F2] to-white border-2 border-dashed border-[#D5C9B8] hover:border-[#006A4E] transition-all shadow-2xs">
                        {photoBase64 ? (
                          <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-[#006A4E] shadow-warm-sm shrink-0 bg-white">
                            <img
                              src={photoBase64}
                              alt="Applicant Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-28 h-36 rounded-2xl bg-white border-2 border-dashed border-[#C2E2D7] hover:border-[#006A4E] flex flex-col items-center justify-center text-slate-400 hover:text-[#006A4E] transition-all cursor-pointer shrink-0 shadow-2xs group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#E6F3EF] flex items-center justify-center text-[#006A4E] mb-2 group-hover:scale-110 transition-transform">
                              <Camera className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-tight">{isBn ? 'ছবি নির্বাচন' : 'Select Photo'}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">{isBn ? 'পাসপোর্ট সাইজ' : 'Passport Size'}</span>
                          </div>
                        )}

                        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#006A4E]" />
                            <span>{photoBase64 ? (isBn ? 'অন্য ছবি নির্বাচন করুন' : 'Change Photo') : (isBn ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload from Device')}</span>
                          </button>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {isBn
                              ? 'JPG, JPEG, PNG অথবা WebP ফরম্যাট। সর্বোচ্চ সাইজ: ৫ মেগাবাইট (5MB)। ছবি স্বয়ংক্রিয়ভাবে গুগল ড্রাইভ ফোল্ডারে সংরক্ষিত হবে।'
                              : 'Supported formats: JPG, PNG, WebP. Maximum size: 5MB. Photo will be automatically archived in Google Drive.'}
                          </p>
                          {photoFileName && (
                            <p className="text-[11px] font-mono text-[#006A4E] truncate font-bold">
                              &bull; {photoFileName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Bengali */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 font-bengali">
                          {isBn ? 'পূর্ণ নাম (বাংলায়) *' : 'Full Name (in Bengali) *'}
                        </label>
                        <input
                          type="text"
                          value={fullNameBn}
                          onChange={(e) => setFullNameBn(e.target.value)}
                          placeholder="উদা: শাহিদুল আলম"
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                          required
                        />
                      </div>

                      {/* Name English */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 uppercase">
                          {isBn ? 'Name (in English - Capital letters) *' : 'Full Name (English) *'}
                        </label>
                        <input
                          type="text"
                          value={fullNameEn}
                          onChange={(e) => setFullNameEn(e.target.value)}
                          placeholder="e.g. SHAHIDUL ALAM"
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'সচল ইমেইল ঠিকানা (Email Address) *' : 'Email Address *'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 2: Family & Guardian Information                 */}
                {/* -------------------------------------------------------- */}
                {currentStep === 2 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'সংগঠনের অভ্যন্তরীণ ডাটাবেজ ও জরুরি যোগাযোগের জন্য অভিভাবক সম্পর্কিত তথ্য প্রদান করুন।'
                        : 'Please provide parent and guardian information for internal records and emergency contacts.'}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 font-bengali">
                          {isBn ? 'পিতার নাম (Father\'s Name) *' : "Father's Name *"}
                        </label>
                        <input
                          type="text"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          placeholder={isBn ? 'পিতার সম্পূর্ণ নাম লিখুন' : "Enter father's full name"}
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 font-bengali">
                          {isBn ? 'মাতার নাম (Mother\'s Name) *' : "Mother's Name *"}
                        </label>
                        <input
                          type="text"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          placeholder={isBn ? 'মাতার সম্পূর্ণ নাম লিখুন' : "Enter mother's full name"}
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'অভিভাবকের বিকল্প মোবাইল নম্বর (Guardian Phone - ঐচ্ছিক)' : 'Guardian Contact Number (Optional)'}
                        </label>
                        <input
                          type="tel"
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 3: Address & Contact Details                     */}
                {/* -------------------------------------------------------- */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Phones & Social */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'সচল মোবাইল নম্বর (Mobile Number) *' : 'Mobile Phone Number *'}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) *' : 'WhatsApp Number *'}
                        </label>
                        <input
                          type="tel"
                          value={isSameWhatsapp ? phone : whatsapp}
                          disabled={isSameWhatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className={`w-full px-4 py-2.5 border rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] ${
                            isSameWhatsapp ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#FAF7F2] border-[#EAE3D9] focus:bg-white'
                          }`}
                        />
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={isSameWhatsapp}
                            onChange={(e) => setIsSameWhatsapp(e.target.checked)}
                            className="rounded text-[#006A4E] focus:ring-[#006A4E]"
                          />
                          <span className="text-[11px] text-slate-600 font-medium">
                            {isBn ? 'মোবাইল নম্বরের অনুরূপ (Same as mobile)' : 'Same as Mobile Phone'}
                          </span>
                        </label>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'ফেসবুক প্রোফাইল লিংক (Facebook Profile URL)' : 'Facebook Profile Link'}
                        </label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/yourprofile"
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Present Address */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#006A4E]" />
                        <span>{isBn ? 'বর্তমান ঠিকানা (Present Address) *' : 'Present Address *'}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            {isBn ? 'বর্তমান জেলা *' : 'District *'}
                          </label>
                          <select
                            value={presentDistrict}
                            onChange={(e) => setPresentDistrict(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                          >
                            {BANGLADESH_DISTRICTS.map(d => (
                              <option key={d.nameEn} value={d.nameEn}>
                                {isBn ? d.nameBn : d.nameEn} ({d.division})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            {isBn ? 'উপজেলা / থানা' : 'Upazila / Thana'}
                          </label>
                          <input
                            type="text"
                            value={presentUpazila}
                            onChange={(e) => setPresentUpazila(e.target.value)}
                            placeholder={isBn ? 'উদা: পাঁচলাইশ / কোতোয়ালী' : 'e.g. Panchlaish / Kotwali'}
                            className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700">
                            {isBn ? 'বিস্তারিত ঠিকানা (বাসা/রোড/এলাকা) *' : 'Address Details (House/Road/Area) *'}
                          </label>
                          <input
                            type="text"
                            value={presentAddressDetails}
                            onChange={(e) => setPresentAddressDetails(e.target.value)}
                            placeholder={isBn ? 'উদা: বাসা নং ১২, রোড নং ৩, খুলশী' : 'e.g. House 12, Road 3, Khulshi'}
                            className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-[#006A4E]" />
                          <span>{isBn ? 'স্থায়ী ঠিকানা (Permanent Address) *' : 'Permanent Address *'}</span>
                        </h4>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSameAddress}
                            onChange={(e) => setIsSameAddress(e.target.checked)}
                            className="rounded text-[#006A4E] focus:ring-[#006A4E]"
                          />
                          <span className="text-[11px] text-slate-700 font-bold">
                            {isBn ? 'বর্তমান ঠিকানার অনুরূপ' : 'Same as Present'}
                          </span>
                        </label>
                      </div>

                      {!isSameAddress && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'স্থায়ী জেলা *' : 'District *'}
                            </label>
                            <select
                              value={permanentDistrict}
                              onChange={(e) => setPermanentDistrict(e.target.value)}
                              className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            >
                              {BANGLADESH_DISTRICTS.map(d => (
                                <option key={d.nameEn} value={d.nameEn}>
                                  {isBn ? d.nameBn : d.nameEn} ({d.division})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'স্থায়ী উপজেলা / থানা' : 'Upazila / Thana'}
                            </label>
                            <input
                              type="text"
                              value={permanentUpazila}
                              onChange={(e) => setPermanentUpazila(e.target.value)}
                              placeholder={isBn ? 'উপজেলা / থানা লিখুন' : 'Enter Upazila / Thana'}
                              className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'স্থায়ী বিস্তারিত ঠিকানা (গ্রাম/ডাকঘর/উপজেলা) *' : 'Permanent Address Details *'}
                            </label>
                            <input
                              type="text"
                              value={permanentAddressDetails}
                              onChange={(e) => setPermanentAddressDetails(e.target.value)}
                              placeholder={isBn ? 'গ্রাম, ডাকঘর, উপজেলা' : 'Village, Post Office, Upazila'}
                              className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 4: Personal & Health Information                 */}
                {/* -------------------------------------------------------- */}
                {currentStep === 4 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'রক্তদান ও জরুরি প্রয়োজনে টিম সমন্বয়ের জন্য আপনার ব্যক্তিগত ও স্বাস্থ্যগত তথ্য প্রদান করুন।'
                        : 'Personal and health details are used for emergency blood donor mapping and team records.'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* DOB */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'জন্ম তারিখ (Date of Birth) *' : 'Date of Birth *'}
                        </label>
                        <DateInput
                          value={dob}
                          onChange={(val) => setDob(val)}
                          isBn={isBn}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          minYear={1940}
                          maxYear={new Date().getFullYear()}
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'লিঙ্গ (Gender) *' : 'Gender *'}
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                        >
                          <option value="Male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                          <option value="Female">{isBn ? 'নারী (Female)' : 'Female'}</option>
                          <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                        </select>
                      </div>

                      {/* Blood Group */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'রক্তের গ্রুপ (Blood Group) *' : 'Blood Group *'}
                        </label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white font-bold"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'].map(bg => (
                            <option key={bg} value={bg}>
                              {bg === 'Unknown' ? (isBn ? 'জানি না (Unknown)' : 'Unknown') : bg}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* NID / Birth Cert */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'NID / জন্ম নিবন্ধন নম্বর (ঐচ্ছিক)' : 'NID / Birth Certificate (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={nidOrBirthCert}
                          onChange={(e) => setNidOrBirthCert(e.target.value)}
                          placeholder={isBn ? 'জাতীয় পরিচয়পত্র বা জন্ম সনদ নম্বর' : 'NID or Birth Registration No.'}
                          className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 5: Educational Information (CRITICAL CONDITIONAL) */}
                {/* -------------------------------------------------------- */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'আপনার বর্তমান শিক্ষাগত অবস্থা নির্বাচন করুন। আপনি যে ক্যাটাগরি নির্বাচন করবেন শুধু সেই সম্পর্কিত নির্দিষ্ট তথ্য চাওয়া হবে।'
                        : 'Select your current educational status. Only relevant fields for your chosen pathway will be displayed.'}
                    </div>

                    {/* Educational Status Selector Radio/Cards */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-800">
                        {isBn ? 'বর্তমান শিক্ষাগত অবস্থা নির্বাচন করুন (Educational Status) *' : 'Select Educational Status *'}
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {educationCategoryOptions.map((opt) => {
                          const isSelected = educationCategory === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setEducationCategory(opt.id)}
                              className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'bg-[#E6F3EF] border-[#006A4E] text-[#00523C] font-bold shadow-2xs'
                                  : 'bg-[#FAF7F2] border-[#EAE3D9] text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#006A4E] bg-[#006A4E] text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-bold">{isBn ? opt.bn : opt.en}</span>
                                <span className="text-[10px] text-slate-500 font-normal">{isBn ? opt.descBn : opt.descEn}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 1: High School (Pre-SSC)        */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'high_school' && (
                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                          <span>{isBn ? 'উচ্চ বিদ্যালয়ের তথ্য (SSC পাস করেনি)' : 'High School Information'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিদ্যালয়ের নাম (School Name) *' : 'School Name *'}
                            </label>
                            <input
                              type="text"
                              value={schoolName}
                              onChange={(e) => setSchoolName(e.target.value)}
                              placeholder={isBn ? 'উদা: চট্টগ্রাম সরকারি উচ্চ বিদ্যালয়' : 'e.g. Chittagong Govt. High School'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বর্তমান শ্রেণি (Current Class) *' : 'Current Class *'}
                            </label>
                            <input
                              type="text"
                              value={currentClass}
                              onChange={(e) => setCurrentClass(e.target.value)}
                              placeholder={isBn ? 'উদা: ৯ম / ১০ম' : 'e.g. Class 9 / 10'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'সম্ভাব্য SSC পরীক্ষার বছর *' : 'Expected SSC Year *'}
                            </label>
                            <input
                              type="text"
                              value={expectedSscYear}
                              onChange={(e) => setExpectedSscYear(e.target.value)}
                              placeholder="2026 / 2027"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 2: SSC Passed                   */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'ssc' && (
                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                          <span>{isBn ? 'SSC / সমমান পরীক্ষার তথ্য' : 'SSC / Equivalent Information'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'SSC / সমমানের প্রতিষ্ঠান *' : 'SSC Institution Name *'}
                            </label>
                            <input
                              type="text"
                              value={sscInstitution}
                              onChange={(e) => setSscInstitution(e.target.value)}
                              placeholder={isBn ? 'প্রতিষ্ঠানের নাম লিখুন' : 'Enter Institution Name'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিভাগ / গ্রুপ (Group)' : 'Group / Department'}
                            </label>
                            <select
                              value={sscGroup}
                              onChange={(e) => setSscGroup(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            >
                              <option value="বিজ্ঞান">{isBn ? 'বিজ্ঞান (Science)' : 'Science'}</option>
                              <option value="ব্যবসায় শিক্ষা">{isBn ? 'ব্যবসায় শিক্ষা (Commerce)' : 'Commerce'}</option>
                              <option value="মানবিক">{isBn ? 'মানবিক (Humanities)' : 'Humanities'}</option>
                              <option value="ভোকেশনাল">{isBn ? 'ভোকেশনাল (Vocational)' : 'Vocational'}</option>
                              <option value="অন্যান্য">{isBn ? 'অন্যান্য' : 'Other'}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'পাশের বছর (Passing Year)' : 'Passing Year'}
                            </label>
                            <input
                              type="text"
                              value={sscPassingYear}
                              onChange={(e) => setSscPassingYear(e.target.value)}
                              placeholder="2024"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'শিক্ষা বোর্ড (Board)' : 'Education Board'}
                            </label>
                            <input
                              type="text"
                              value={sscBoard}
                              onChange={(e) => setSscBoard(e.target.value)}
                              placeholder="Chattogram / Dhaka"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 3: HSC Passed                   */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'hsc' && (
                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                          <span>{isBn ? 'HSC / সমমান পরীক্ষার তথ্য' : 'HSC / Equivalent Information'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'কলেজের নাম (College Name) *' : 'College Name *'}
                            </label>
                            <input
                              type="text"
                              value={hscInstitution}
                              onChange={(e) => setHscInstitution(e.target.value)}
                              placeholder={isBn ? 'উদা: চট্টগ্রাম কলেজ' : 'e.g. Chittagong College'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিভাগ / গ্রুপ (Group)' : 'Group / Department'}
                            </label>
                            <select
                              value={hscGroup}
                              onChange={(e) => setHscGroup(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            >
                              <option value="বিজ্ঞান">{isBn ? 'বিজ্ঞান (Science)' : 'Science'}</option>
                              <option value="ব্যবসায় শিক্ষা">{isBn ? 'ব্যবসায় শিক্ষা (Commerce)' : 'Commerce'}</option>
                              <option value="মানবিক">{isBn ? 'মানবিক (Humanities)' : 'Humanities'}</option>
                              <option value="অন্যান্য">{isBn ? 'অন্যান্য' : 'Other'}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'পাশের বছর (Passing Year)' : 'Passing Year'}
                            </label>
                            <input
                              type="text"
                              value={hscPassingYear}
                              onChange={(e) => setHscPassingYear(e.target.value)}
                              placeholder="2024"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'শিক্ষা বোর্ড (Board)' : 'Education Board'}
                            </label>
                            <input
                              type="text"
                              value={hscBoard}
                              onChange={(e) => setHscBoard(e.target.value)}
                              placeholder="Chattogram / Dhaka"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 4: Diploma (DEDICATED CATEGORY) */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'diploma' && (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <GraduationCap className="w-4 h-4 text-amber-700" />
                          <span>{isBn ? 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / টেকনিক্যাল তথ্য (Diploma)' : 'Diploma in Engineering / Technical Details'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'ডিপ্লোমা টেকনোলজি / বিষয় (Technology / Subject) *' : 'Diploma Technology / Subject *'}
                            </label>
                            <input
                              type="text"
                              value={diplomaTechnology}
                              onChange={(e) => setDiplomaTechnology(e.target.value)}
                              placeholder={isBn ? 'উদা: সিভিল / কম্পিউটার / ইলেকট্রিক্যাল / মেকানিক্যাল' : 'e.g. Civil / Computer / Electrical'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'ডিপার্টমেন্ট (Department)' : 'Department'}
                            </label>
                            <input
                              type="text"
                              value={diplomaDepartment}
                              onChange={(e) => setDiplomaDepartment(e.target.value)}
                              placeholder={isBn ? 'উদা: CST / Civil' : 'e.g. CST / Civil'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'পলিটেকনিক / ইনস্টিটিউট নাম (Polytechnic / Institute) *' : 'Polytechnic / Institute Name *'}
                            </label>
                            <input
                              type="text"
                              value={diplomaInstitute}
                              onChange={(e) => setDiplomaInstitute(e.target.value)}
                              placeholder={isBn ? 'উদা: চট্টগ্রাম পলিটেকনিক ইনস্টিটিউট' : 'e.g. Chittagong Polytechnic Institute'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বর্তমান সেমিস্টার / পর্ব' : 'Current Semester / Year'}
                            </label>
                            <input
                              type="text"
                              value={diplomaSemester}
                              onChange={(e) => setDiplomaSemester(e.target.value)}
                              placeholder={isBn ? 'উদা: ৪র্থ পর্ব / ৬ষ্ঠ পর্ব' : 'e.g. 4th / 6th Semester'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বর্তমান অবস্থা (Status)' : 'Status'}
                            </label>
                            <select
                              value={diplomaStatus}
                              onChange={(e) => setDiplomaStatus(e.target.value as 'running' | 'completed')}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            >
                              <option value="running">{isBn ? 'অধ্যয়নরত (Running)' : 'Running'}</option>
                              <option value="completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'পাশের বছর / সম্ভাব্য বছর' : 'Passing / Expected Year'}
                            </label>
                            <input
                              type="text"
                              value={diplomaPassingYear}
                              onChange={(e) => setDiplomaPassingYear(e.target.value)}
                              placeholder="2026"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 5: Honours (Bachelor)           */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'honours' && (
                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                          <span>{isBn ? 'স্নাতক / অনার্স / ডিগ্রী সম্পর্কিত তথ্য' : 'Honours / Undergraduate Information'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিশ্ববিদ্যালয় / কলেজের নাম (University / College) *' : 'University / College Name *'}
                            </label>
                            <input
                              type="text"
                              value={honoursInstitute}
                              onChange={(e) => setHonoursInstitute(e.target.value)}
                              placeholder={isBn ? 'উদা: চট্টগ্রাম বিশ্ববিদ্যালয়' : 'e.g. University of Chittagong'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিষয় / ডিপার্টমেন্ট (Subject / Department) *' : 'Subject / Department *'}
                            </label>
                            <input
                              type="text"
                              value={honoursSubject}
                              onChange={(e) => setHonoursSubject(e.target.value)}
                              placeholder={isBn ? 'উদা: অর্থনীতি / সমাজবিজ্ঞান / সিএসই' : 'e.g. Economics / CSE / BBA'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'শিক্ষাবর্ষ / সেমিস্টার' : 'Current Year / Semester'}
                            </label>
                            <input
                              type="text"
                              value={honoursYear}
                              onChange={(e) => setHonoursYear(e.target.value)}
                              placeholder={isBn ? 'উদা: ৩য় বর্ষ / ৬ষ্ঠ সেমিস্টার' : 'e.g. 3rd Year / 6th Sem'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বর্তমান অবস্থা (Status)' : 'Status'}
                            </label>
                            <select
                              value={honoursStatus}
                              onChange={(e) => setHonoursStatus(e.target.value as 'running' | 'completed')}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            >
                              <option value="running">{isBn ? 'অধ্যয়নরত (Running)' : 'Running'}</option>
                              <option value="completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'পাশের বছর / সম্ভাব্য বছর' : 'Passing / Expected Year'}
                            </label>
                            <input
                              type="text"
                              value={honoursPassingYear}
                              onChange={(e) => setHonoursPassingYear(e.target.value)}
                              placeholder="2026"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 6: Masters                      */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'masters' && (
                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                          <span>{isBn ? 'স্নাতকোত্তর / মাস্টার্স সম্পর্কিত তথ্য' : 'Masters / Postgraduate Information'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিশ্ববিদ্যালয় / ইনস্টিটিউট নাম *' : 'University / Institute Name *'}
                            </label>
                            <input
                              type="text"
                              value={mastersInstitute}
                              onChange={(e) => setMastersInstitute(e.target.value)}
                              placeholder={isBn ? 'বিশ্ববিদ্যালয়ের নাম লিখুন' : 'Enter University Name'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বিষয় / ডিপার্টমেন্ট' : 'Subject / Department'}
                            </label>
                            <input
                              type="text"
                              value={mastersSubject}
                              onChange={(e) => setMastersSubject(e.target.value)}
                              placeholder={isBn ? 'মাস্টার্স বিষয়' : 'Masters Subject'}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'বর্তমান অবস্থা' : 'Status'}
                            </label>
                            <select
                              value={mastersStatus}
                              onChange={(e) => setMastersStatus(e.target.value as 'running' | 'completed')}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            >
                              <option value="running">{isBn ? 'অধ্যয়নরত (Running)' : 'Running'}</option>
                              <option value="completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              {isBn ? 'পাশের বছর / সম্ভাব্য বছর' : 'Passing / Expected Year'}
                            </label>
                            <input
                              type="text"
                              value={mastersPassingYear}
                              onChange={(e) => setMastersPassingYear(e.target.value)}
                              placeholder="2026"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------------------------------------------- */}
                    {/* CONDITIONAL SUB-FORM 7: Other Education              */}
                    {/* ---------------------------------------------------- */}
                    {educationCategory === 'other' && (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-800">
                          {isBn ? 'আপনার শিক্ষাগত যোগ্যতা ও পেশাগত বিবরণ বিস্তারিত লিখুন *' : 'Describe your educational and vocational details *'}
                        </label>
                        <textarea
                          rows={3}
                          value={otherEducation}
                          onChange={(e) => setOtherEducation(e.target.value)}
                          placeholder={isBn ? 'আপনার শিক্ষাগত যোগ্যতা ও বিশেষ কোর্সের বিবরণ লিখুন...' : 'Write details of your qualifications and courses...'}
                          className="w-full px-4 py-2.5 bg-white border border-[#EAE3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 6: Skills & Areas of Interest                    */}
                {/* -------------------------------------------------------- */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'আপনার বিশেষ দক্ষতা ও যে ক্ষেত্রগুলোতে কাজ করতে আগ্রহী সেগুলো নির্বাচন করুন (একাধিক নির্বাচনযোগ্য)।'
                        : 'Select the skills and functional areas where you would like to contribute.'}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-800">
                        {isBn ? 'কাজের আগ্রহ ও দক্ষতার ক্ষেত্রসমূহ *' : 'Areas of Interest & Special Skills *'}
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {skillOptions.map(opt => {
                          const isChecked = skills.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSkillToggle(opt.id)}
                              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-[#E6F3EF] border-[#C2E2D7] text-[#00523C] font-bold shadow-2xs'
                                  : 'bg-[#FAF7F2] border-[#EAE3D9] text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-[#006A4E] border-[#006A4E] text-white' : 'border-slate-300 bg-white'}`}>
                                {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <span className="truncate">{isBn ? opt.bn : opt.en}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-800">
                        {isBn ? 'সপ্তাহে কত সময় স্বেচ্ছাসেবী কাজে দিতে পারবেন? *' : 'Weekly Availability *'}
                      </label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white font-bold"
                      >
                        <option value="সপ্তাহে ১-২ ঘণ্টা">{isBn ? 'সপ্তাহে ১-২ ঘণ্টা (1-2 Hours/Week)' : '1-2 Hours/Week'}</option>
                        <option value="সপ্তাহে ৩-৫ ঘণ্টা">{isBn ? 'সপ্তাহে ৩-৫ ঘণ্টা (3-5 Hours/Week)' : '3-5 Hours/Week'}</option>
                        <option value="ছুটির দিনগুলোতে (Weekends)">{isBn ? 'ছুটির দিনগুলোতে (Weekends Only)' : 'Weekends Only'}</option>
                        <option value="জরুরি প্রয়োজনে যেকোনো সময়">{isBn ? 'জরুরি প্রয়োজনে যেকোনো সময় (Emergency On-Call)' : 'Emergency On-Call'}</option>
                        <option value="সার্বক্ষণিক / নিয়মিত">{isBn ? 'সার্বক্ষণিক / নিয়মিত (Regular / Flexible)' : 'Regular / Flexible'}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 7: Infinity Bangladesh & Motivation              */}
                {/* -------------------------------------------------------- */}
                {currentStep === 7 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'সংগঠনে আপনার আগ্রহ, অনুপ্রেরণা এবং পূর্ব অভিজ্ঞতা আমাদের সাথে শেয়ার করুন।'
                        : 'Share your background, inspiration, and expectations for joining Team Infinity.'}
                    </div>

                    {/* How did you know */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        {isBn ? 'আপনি কীভাবে ইনফিনিটি বাংলাদেশ সম্পর্কে জেনেছেন? *' : 'How did you hear about Infinity Bangladesh? *'}
                      </label>
                      <select
                        value={referralSource}
                        onChange={(e) => setReferralSource(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                      >
                        <option value="ফেসবুক / সোশ্যাল মিডিয়া">{isBn ? 'ফেসবুক / সোশ্যাল মিডিয়া (Facebook / Social Media)' : 'Facebook / Social Media'}</option>
                        <option value="বন্ধু / পরিবারের সদস্য">{isBn ? 'বন্ধু / পরিবারের সদস্য (Friend / Family Member)' : 'Friend / Family'}</option>
                        <option value="পূর্ববর্তী ইভেন্ট বা ক্যাম্পেইন">{isBn ? 'পূর্ববর্তী ইভেন্ট বা ক্যাম্পেইন (Event / Drive)' : 'Past Event / Drive'}</option>
                        <option value="সংবাদমাধ্যম বা ওয়েবসাইট">{isBn ? 'সংবাদমাধ্যম বা ওয়েবসাইট (News / Website)' : 'News / Website'}</option>
                        <option value="অন্যান্য">{isBn ? 'অন্যান্য মাধ্যম (Other)' : 'Other'}</option>
                      </select>
                    </div>

                    {/* Previous Volunteering */}
                    <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasPreviousVolunteering}
                          onChange={(e) => setHasPreviousVolunteering(e.target.checked)}
                          className="rounded text-[#006A4E] focus:ring-[#006A4E]"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {isBn ? 'পূর্বে কোনো সামাজিক বা স্বেচ্ছাসেবী সংস্থায় কাজ করার অভিজ্ঞতা আছে?' : 'Do you have previous volunteering experience?'}
                        </span>
                      </label>

                      {hasPreviousVolunteering && (
                        <div className="pt-2 animate-in fade-in space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            {isBn ? 'সংস্থার নাম ও কাজের বিবরণ সংক্ষেপে লিখুন:' : 'Organization name and role details:'}
                          </label>
                          <input
                            type="text"
                            value={previousExperience}
                            onChange={(e) => setPreviousExperience(e.target.value)}
                            placeholder={isBn ? 'উদা: রেড ক্রিসেন্ট সোসাইটিতে ২ বছর ভলান্টিয়ারিং করেছি' : 'e.g. Served 2 years with Red Crescent'}
                            className="w-full px-3.5 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Motivation textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 font-bengali">
                        {isBn ? 'কেন ইনফিনিটি বাংলাদেশে যোগ দিতে চান এবং আপনার প্রত্যাশা কী? *' : 'Why do you want to join Infinity Bangladesh and what are your expectations? *'}
                      </label>
                      <textarea
                        rows={4}
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        placeholder={isBn ? 'আপনার অনুভূতি, আগ্রহ ও অনুপ্রেরণার কথা বিস্তারিত লিখুন...' : 'Share your motivation and goals for joining Team Infinity...'}
                        className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SECTION 8: Oath, Agreement & Confirmation                */}
                {/* -------------------------------------------------------- */}
                {currentStep === 8 && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Oath Card */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-3 shadow-warm-xs">
                      <div className="flex items-center gap-2 text-[#00523C] font-extrabold text-sm font-display">
                        <ShieldCheck className="w-5 h-5 text-[#006A4E]" />
                        <span>{isBn ? 'শপথ ও নৈতিক অঙ্গীকারনামা' : 'Oath & Humanitarian Commitment'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#00523C] leading-relaxed font-bengali">
                        {isBn
                          ? '“আমি শপথ করছি যে, ইনফিনিটি বাংলাদেশ-এর গঠনতন্ত্র, লক্ষ্য, উদ্দেশ্য ও নৈতিক আচরণবিধি পূর্ণ আনুগত্যের সাথে মেনে চলব। আর্তমানবতার সেবা, সুবিধাবঞ্চিত মানুষের ক্ষমতায়ন এবং সমাজের ইতিবাচক পরিবর্তনে নিবেদিত থাকব। যেকোনো রাজনৈতিক বা ব্যক্তিগত সংকীর্ণতার ঊর্ধ্বে থেকে সততা ও শৃঙ্খলার সাথে দায়িত্ব পালন করব।”'
                          : '"I pledge to abide by the constitution, mission, and code of conduct of Infinity Bangladesh. I will dedicate myself to selfless humanitarian service, empowering the underprivileged, and upholding institutional integrity above all personal or political biases."'}
                      </p>
                    </div>

                    {/* Checkbox Agreements */}
                    <div className="space-y-3 p-4 sm:p-5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedCodeOfConduct}
                          onChange={(e) => setAgreedCodeOfConduct(e.target.checked)}
                          className="mt-1 rounded text-[#006A4E] focus:ring-[#006A4E]"
                          required
                        />
                        <span className="text-xs text-slate-800 leading-relaxed font-bold">
                          {isBn
                            ? 'আমি উল্লেখিত শপথ, নৈতিক আচরণবিধি ও শর্তাবলী সতর্কতার সাথে পড়েছি এবং তাতে সম্পূর্ণরূপে সম্মতি জ্ঞাপন করছি। *'
                            : 'I have read and fully agreed to the oath, terms and conditions, and code of conduct. *'}
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                        <input
                          type="checkbox"
                          checked={agreedTruthfulness}
                          onChange={(e) => setAgreedTruthfulness(e.target.checked)}
                          className="mt-1 rounded text-[#006A4E] focus:ring-[#006A4E]"
                          required
                        />
                        <span className="text-xs text-slate-800 leading-relaxed font-bold">
                          {isBn
                            ? 'আমি প্রত্যয়ন করছি যে এই আবেদনপত্রে প্রদত্ত সকল তথ্য সত্য, সঠিক ও যাচাইযোগ্য। *'
                            : 'I certify that all information provided in this application is true, accurate, and verifiable. *'}
                        </span>
                      </label>
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* NAVIGATION CONTROLS (Back / Next / Submit)               */}
                {/* -------------------------------------------------------- */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#EAE3D9] text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{isBn ? 'পূর্ববর্তী ধাপ' : 'Previous'}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 8 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-warm-xs transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <span>{isBn ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] text-white text-sm font-extrabold shadow-warm-sm transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isBn ? 'আবেদন জমা হচ্ছে...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isBn ? 'আবেদন সম্পন্ন করুন' : 'Submit Application'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </ScrollReveal>

        {/* Right Column: Why Join & Guidelines */}
        <ScrollReveal effect="slide-left" delay={0.2} className="lg:col-span-4 space-y-6">
          {/* Benefits Card */}
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-7 space-y-5 shadow-warm-sm hover:shadow-warm-md transition-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#006A4E]" />
                <span>{isBn ? 'কেন ইনফিনিটিতে যোগ দেবেন?' : 'Why Join Infinity?'}</span>
              </h3>
              <span className="text-[10px] font-bold text-[#006A4E] bg-[#E6F3EF] px-2 py-0.5 rounded-full border border-[#C2E2D7]">
                {isBn ? 'সুবিধাসমূহ' : 'Benefits'}
              </span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {benefitsList.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code of Conduct & Safety */}
          <div className="bg-gradient-to-br from-[#FAF7F2] to-white rounded-3xl border border-[#EAE3D9] p-6 space-y-4 shadow-warm-xs">
            <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2 border-b border-[#EAE3D9] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
              <span>{isBn ? 'স্বেচ্ছাসেবী নীতিমালা ও নিরাপত্তা' : 'Code of Conduct & Ethics'}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              {requirementsList.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006A4E] mt-1.5 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Support Helpline */}
          <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 text-center space-y-4 shadow-warm-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center mx-auto shadow-inner">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-slate-900 font-display">
                {isBn ? 'আবেদনে কোনো সমস্যা হচ্ছে?' : 'Need Help with Applying?'}
              </h5>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {isBn
                  ? 'আমাদের হটলাইনে অথবা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।'
                  : 'Contact our volunteer coordinator team directly via WhatsApp or phone.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="https://wa.me/8801839008339"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>WhatsApp: +880 1839-008339</span>
              </a>
              <a
                href="tel:+8801839008339"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#EAE3D9] text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#006A4E]" />
                <span>{isBn ? 'কল করুন: 01839-008339' : 'Call Helpline'}</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
