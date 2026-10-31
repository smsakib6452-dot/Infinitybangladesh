import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { BloodDonor, BloodGroup, DonorAvailabilityStatus, DonorApprovalStatus, BloodDonationHistoryEntry } from '../types';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import { getUpazilasForDistrict, calculateAge, getCooldownStatusInfo } from '../data/bloodDonationData';
import { getAssetUrl } from '../lib/utils/assetHelper';
import {
  X,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Calendar,
  Droplet,
  MapPin,
  Building2,
  FileText,
  User,
  Phone,
  Mail,
  ImageIcon,
  Upload,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import { DateInput } from './DateInput';

interface BloodDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorToEdit?: BloodDonor | null;
  onSave: (donorData: Omit<BloodDonor, 'createdAt' | 'updatedAt'> & { id?: string }, editId?: string) => void;
  onDelete?: (id: string) => void;
}

export const BloodDonorModal: React.FC<BloodDonorModalProps> = ({
  isOpen,
  onClose,
  donorToEdit,
  onSave,
  onDelete
}) => {
  const { isBn } = useLanguage();
  const { donorCategories } = useData();

  const [customId, setCustomId] = useState('');
  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | string>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [district, setDistrict] = useState('Chattogram');
  const [upazila, setUpazila] = useState('Hathazari');
  const [area, setArea] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [orgCategory, setOrgCategory] = useState('Open Voluntary Blood Donor');
  const [committeePosition, setCommitteePosition] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<DonorAvailabilityStatus>('AVAILABLE_EMERGENCY');
  const [approvalStatus, setApprovalStatus] = useState<DonorApprovalStatus>('APPROVED');
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [showPhonePublicly, setShowPhonePublicly] = useState<boolean>(true);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [experienceNotes, setExperienceNotes] = useState('');
  const [donationHistory, setDonationHistory] = useState<BloodDonationHistoryEntry[]>([]);

  // History inline form state
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [newHistDate, setNewHistDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHistHospital, setNewHistHospital] = useState('');
  const [newHistDistrict, setNewHistDistrict] = useState('Chattogram');
  const [newHistType, setNewHistType] = useState<'VOLUNTARY' | 'EMERGENCY' | 'CAMPAIGN'>('VOLUNTARY');
  const [newHistRef, setNewHistRef] = useState('');
  const [newHistNotes, setNewHistNotes] = useState('');

  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const adminPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setModalError(isBn ? 'অনুগ্রহ করে JPG, PNG বা WebP ফরম্যাটের ছবি দিন।' : 'Please upload JPG, PNG or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError(isBn ? 'ছবির সাইজ ৫MB-এর কম হতে হবে।' : 'File size must be under 5MB.');
      return;
    }

    setModalError(null);
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setPhotoUrl(re.target?.result as string);
        }
      };
      img.onerror = () => {
        setPhotoUrl(re.target?.result as string);
      };
      img.src = re.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (donorToEdit) {
      setCustomId(donorToEdit.id || '');
      setFullName(donorToEdit.fullName || '');
      setBloodGroup(donorToEdit.bloodGroup || 'O+');
      setGender(donorToEdit.gender || 'Male');
      setDateOfBirth(donorToEdit.dateOfBirth || donorToEdit.dob || '');
      setPhone(donorToEdit.phone || '');
      setEmail(donorToEdit.email || '');
      setPhotoUrl(donorToEdit.photoUrl || '');
      setDistrict(donorToEdit.district || 'Chattogram');
      setUpazila(donorToEdit.upazila || 'Hathazari');
      setArea(donorToEdit.area || '');
      setDetailedAddress(donorToEdit.detailedAddress || '');
      let initialCat = donorToEdit.orgCategory || 'Open Voluntary Blood Donor';
      if (initialCat === 'Infinity Bangladesh Volunteer') initialCat = 'Infinity Bangladesh Member';
      if (initialCat === 'External Blood Donor') initialCat = 'Open Voluntary Blood Donor';
      setOrgCategory(initialCat);
      setCommitteePosition(donorToEdit.committeePosition || '');
      setAvailabilityStatus(donorToEdit.availabilityStatus || 'AVAILABLE_EMERGENCY');
      setApprovalStatus(donorToEdit.approvalStatus || 'APPROVED');
      setIsVerified(donorToEdit.isVerified ?? true);
      setShowPhonePublicly(donorToEdit.showPhonePublicly ?? false);
      setLastDonationDate(donorToEdit.lastDonationDate || '');
      setTotalDonations(donorToEdit.totalDonations ?? 0);
      setExperienceNotes(donorToEdit.experienceNotes || '');
      setDonationHistory(donorToEdit.donationHistory || []);
    } else {
      setCustomId('');
      setFullName('');
      setBloodGroup('O+');
      setGender('Male');
      setDateOfBirth('');
      setPhone('');
      setEmail('');
      setPhotoUrl('');
      setDistrict('Chattogram');
      setUpazila('Hathazari');
      setArea('');
      setDetailedAddress('');
      setOrgCategory('Open Voluntary Blood Donor');
      setCommitteePosition('');
      setAvailabilityStatus('AVAILABLE_EMERGENCY');
      setApprovalStatus('APPROVED');
      setIsVerified(true);
      setShowPhonePublicly(true);
      setLastDonationDate('');
      setTotalDonations(0);
      setExperienceNotes('');
      setDonationHistory([]);
    }
  }, [donorToEdit, isOpen]);

  const availableUpazilas = getUpazilasForDistrict(district);

  const handleAddHistoryEntry = () => {
    if (!newHistDate || !newHistHospital.trim() || !newHistDistrict) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (newHistDate > todayStr) {
      alert(
        isBn
          ? 'রক্তদানের তারিখ অতীতের অথবা আজকের তারিখ হতে হবে, ভবিষ্যতের নয়।'
          : 'Donation date cannot be in the future.'
      );
      return;
    }

    const newEntry: BloodDonationHistoryEntry = {
      id: `hist_${Date.now()}`,
      donorId: donorToEdit?.id || customId || 'temp',
      donationDate: newHistDate,
      hospital: newHistHospital.trim(),
      district: newHistDistrict,
      donationType: newHistType,
      recipientReference: newHistRef.trim() || undefined,
      notes: newHistNotes.trim() || undefined,
      isVerified: true
    };
    const updated = [newEntry, ...donationHistory];
    setDonationHistory(updated);
    setTotalDonations(updated.length);

    // Auto-update last donation date to newest entry
    const dates = updated.map(h => h.donationDate).filter(Boolean).sort();
    if (dates.length > 0) {
      setLastDonationDate(dates[dates.length - 1]);
    }

    setNewHistHospital('');
    setNewHistRef('');
    setNewHistNotes('');
    setShowAddHistory(false);
  };

  const handleRemoveHistoryEntry = (id: string) => {
    const updated = donationHistory.filter(h => h.id !== id);
    setDonationHistory(updated);
    setTotalDonations(Math.max(0, updated.length));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!fullName.trim() || !phone.trim() || !district || !upazila || !dateOfBirth || dateOfBirth.length < 10) {
      setModalError(
        isBn
          ? 'অনুগ্রহ করে জন্ম তারিখসহ (দিন, মাস, বছর) সকল আবশ্যকীয় তথ্য সঠিকভাবে পূরণ করুন।'
          : 'Please fill in all required fields including a complete Date of Birth (Day, Month, Year).'
      );
      return;
    }

    // Validate 11-digit BD Phone Number
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setModalError(
        isBn
          ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 018XXXXXXXX)'
          : 'Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 018XXXXXXXX)'
      );
      return;
    }

    // Validate Date of Birth
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateOfBirth > todayStr) {
      setModalError(
        isBn
          ? 'জন্ম তারিখ আজকের বা অতীতের তারিখ হতে হবে, ভবিষ্যতের নয়।'
          : 'Date of birth cannot be in the future.'
      );
      return;
    }

    const calculatedAge = calculateAge(dateOfBirth);
    if (calculatedAge !== null && calculatedAge < 18) {
      setModalError(
        isBn
          ? `স্বেচ্ছায় রক্তদানের জন্য প্রার্থীর বয়স কমপক্ষে ১৮ বছর হতে হবে (বর্তমান বয়স ${calculatedAge} বছর)।`
          : `Minimum age required for voluntary blood donation is 18 years (current calculated age is ${calculatedAge} years).`
      );
      return;
    }

    // Validate No Future Dates
    if (lastDonationDate && lastDonationDate > todayStr) {
      setModalError(
        isBn
          ? 'সর্বশেষ রক্তদানের তারিখ আজকের বা অতীতের তারিখ হতে হবে, ভবিষ্যতের নয়।'
          : 'Last donation date cannot be in the future.'
      );
      return;
    }

    onSave({
      id: customId.trim() || (donorToEdit ? donorToEdit.id : undefined),
      fullName: fullName.trim(),
      bloodGroup,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      dob: dateOfBirth || undefined,
      phone: cleanPhone,
      email: email.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      district,
      upazila,
      area: area.trim(),
      detailedAddress: detailedAddress.trim() || undefined,
      orgCategory,
      committeePosition: committeePosition.trim() || undefined,
      availabilityStatus,
      approvalStatus,
      isVerified,
      showPhonePublicly,
      lastDonationDate: lastDonationDate || undefined,
      totalDonations: Number(totalDonations) || donationHistory.length || 0,
      experienceNotes: experienceNotes.trim() || undefined,
      privacyConsent: true,
      donationHistory
    }, donorToEdit?.id);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-warm-2xl border border-[#EAE3D9] overflow-hidden my-8 max-h-[92vh] flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#006A4E] to-[#00523C] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Droplet className="w-5 h-5 fill-current text-rose-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">
                  {donorToEdit ? (isBn ? 'রক্তদাতার তথ্য সম্পাদনা' : 'Edit Blood Donor Profile') : (isBn ? 'নতুন রক্তদাতা যোগ করুন' : 'Add New Blood Donor')}
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium">
                  {isBn ? 'ইনফিনিটি বাংলাদেশ রক্তদান নেটওয়ার্ক সিএমএস' : 'Infinity Bangladesh Blood Donation Network CMS'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
            {/* Section 1: Basic Profile */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? '১. প্রাথমিক পরিচয় ও রক্তদানের গ্রুপ' : '1. Basic Profile & Blood Group'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{isBn ? 'ডোনার আইডি *' : 'Donor ID *'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {isBn ? '(ফাঁকা রাখলে অটো আইডি)' : '(Auto if left blank)'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder={isBn ? 'যেমন: IBD-001 বা DONOR-101' : 'e.g. IBD-001 or DONOR-101'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-mono font-bold text-[#006A4E] focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shadman Sakib"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-rose-700 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="A+">A+ (A Positive)</option>
                    <option value="A-">A- (A Negative)</option>
                    <option value="B+">B+ (B Positive)</option>
                    <option value="B-">B- (B Negative)</option>
                    <option value="O+">O+ (O Positive)</option>
                    <option value="O-">O- (O Negative)</option>
                    <option value="AB+">AB+ (AB Positive)</option>
                    <option value="AB-">AB- (AB Negative)</option>
                  </select>
                </div>
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'লিঙ্গ (Gender)' : 'Gender'}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => {

                      setGender(e.target.value);



                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="Male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                    <option value="Female">{isBn ? 'নারী (Female)' : 'Female'}</option>
                    <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                  </select>
                </div>

                <div className="sm:col-span-7 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>{isBn ? 'জন্ম তারিখ (Date of Birth) *' : 'Date of Birth *'}</span>
                    </label>
                    {dateOfBirth && (() => {
                      const calculatedAge = calculateAge(dateOfBirth);
                      if (calculatedAge === null) return null;
                      return (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {isBn ? `বয়স: ${calculatedAge} বছর` : `Age: ${calculatedAge} yrs`}
                        </span>
                      );
                    })()}
                  </div>
                  <DateInput
                    value={dateOfBirth}
                    onChange={(val) => setDateOfBirth(val)}
                    isBn={isBn}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    minYear={1940}
                    maxYear={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Phone (11 Digits) *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1839-008339"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="donor@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Photo URL with Device Upload & Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{isBn ? 'প্রোফাইল ছবি (ঐচ্ছিক)' : 'Profile Photo (Optional)'}</span>
                  <span className="text-[10px] text-slate-400">URL, Media Library or Device Upload</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {photoUrl ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#006A4E] shadow-2xs shrink-0 bg-white group">
                      <img src={getAssetUrl(photoUrl)} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-rose-300" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => adminPhotoInputRef.current?.click()}
                      className="w-14 h-14 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-[#006A4E] hover:border-[#006A4E] cursor-pointer shrink-0 bg-slate-50 transition-colors"
                      title="Upload Photo"
                    >
                      <Camera className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      ref={adminPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleAdminPhotoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="url"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or Cloudinary URL"
                        className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => adminPhotoInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-[#FAF7F2] text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Upload from Device"
                      >
                        <Upload className="w-4 h-4 text-[#006A4E]" />
                        <span>{isBn ? 'আপলোড' : 'Upload'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-[#FAF7F2] text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                        <span>{isBn ? 'মিডিয়া লাইব্রেরি' : 'Media Picker'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Location & Address */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? '২. অবস্থান ও ঠিকানা' : '2. Location & Address'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'জেলা *' : 'District *'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      const upazilas = getUpazilasForDistrict(e.target.value);
                      setUpazila(upazilas[0] || 'Sadar');
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

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'উপজেলা / থানা *' : 'Upazila / Thana *'}
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    {availableUpazilas.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'এলাকা / পাড়া *' : 'General Area *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Fatehabad / College Road"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Private Detailed Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{isBn ? 'সম্পূর্ণ আবাসিক ঠিকানা (গোপন / শুধুমাত্র অ্যাডমিন)' : 'Detailed Address (Restricted to Admin)'}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Private
                  </span>
                </label>
                <input
                  type="text"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="House #, Road #, Village details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Organization & Status */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? '৩. সাংগঠনিক ক্যাটাগরি ও স্ট্যাটাস' : '3. Organization & Availability'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'সংগঠনের ক্যাটাগরি' : 'Organization Category'}
                  </label>
                  <select
                    value={orgCategory}
                    onChange={(e) => setOrgCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
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
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'কমিটি পদবি (যদি থাকে)' : 'Committee / Position (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={committeePosition}
                    onChange={(e) => setCommitteePosition(e.target.value)}
                    placeholder="e.g. Field Coordinator"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'প্রাপ্যতা স্ট্যাটাস' : 'Availability Status'}
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value as DonorAvailabilityStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="AVAILABLE_EMERGENCY">🟢 Available for Emergency</option>
                    <option value="AVAILABLE_NOTICE">🟡 Available with Notice</option>
                    <option value="UNAVAILABLE">🔴 Temporarily Unavailable</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'অনুমোদন স্ট্যাটাস' : 'Approval Status'}
                  </label>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as DonorApprovalStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="APPROVED">Approved (পাবলিক সার্চে দৃশ্যমান)</option>
                    <option value="PENDING">Pending (পর্যালোচনাধীন)</option>
                    <option value="REJECTED">Rejected (বাতিল)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {isBn ? 'মোট রক্তদান সংখ্যা' : 'Total Donations'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalDonations}
                    onChange={(e) => setTotalDonations(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs sm:text-sm font-bold text-[#006A4E] focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-[#006A4E] rounded-md focus:ring-[#006A4E]"
                  />
                  <span>{isBn ? 'যাচাইকৃত রক্তদাতা ব্যাজ (Verified Badge)' : 'Verified Donor Badge'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={showPhonePublicly}
                    onChange={(e) => setShowPhonePublicly(e.target.checked)}
                    className="w-4 h-4 text-[#006A4E] rounded-md focus:ring-[#006A4E]"
                  />
                  <span>{isBn ? 'সরাসরি কল বাটন ও ফোন নম্বর দৃশ্যমান রাখুন (পাবলিক প্রাইভেসি অপশন)' : 'Show Direct Phone Number to Public (Privacy Option)'}</span>
                </label>
              </div>
            </div>

            {/* Section 4: Donation Experience & History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#006A4E]" />
                  <span>{isBn ? '৪. রক্তদানের অভিজ্ঞতা ও হিস্টোরি লগ' : '4. Experience & Donation History'}</span>
                </h4>

                <button
                  type="button"
                  onClick={() => setShowAddHistory(prev => !prev)}
                  className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBn ? 'হিস্টোরি এন্ট্রি যোগ করুন' : 'Add History Entry'}</span>
                </button>
              </div>

              {/* Last Donation Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{isBn ? 'সর্বশেষ রক্তদানের তারিখ *' : 'Last Donation Date *'}</span>
                  {lastDonationDate && lastDonationDate > new Date().toISOString().split('T')[0] && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {isBn ? 'ভুল তারিখ' : 'Invalid Date'}
                    </span>
                  )}
                </label>
                <DateInput
                  value={lastDonationDate}
                  onChange={(val) => {
                    setLastDonationDate(val);
                    if (val && val > new Date().toISOString().split('T')[0]) {
                      setModalError(isBn ? 'সর্বশেষ রক্তদানের তারিখ ভবিষ্যতের হতে পারে না।' : 'Last donation date cannot be in the future.');
                    } else {
                      setModalError(null);
                    }
                  }}
                  isBn={isBn}
                  max={new Date().toISOString().split('T')[0]}
                  minYear={2010}
                  maxYear={new Date().getFullYear()}
                  showQuickToday
                />
                {lastDonationDate && lastDonationDate > new Date().toISOString().split('T')[0] ? (
                  <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভবিষ্যতের তারিখ গ্রহণযোগ্য নয়' : 'Future dates not allowed'}</span>
                  </p>
                ) : lastDonationDate ? (() => {
                  const cooldown = getCooldownStatusInfo(lastDonationDate, isBn);
                  return (
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${cooldown.badgeColorClass}`}>
                      <div className="flex items-center gap-1.5 font-extrabold">
                        <Droplet className="w-3.5 h-3.5 fill-current" />
                        <span>{cooldown.badgeText}</span>
                      </div>
                      <span className="text-[10px] font-medium opacity-90">{cooldown.description}</span>
                    </div>
                  );
                })() : (
                  <p className="text-[10px] text-slate-400">
                    {isBn ? 'রক্তদানের তারিখ দিলে ৯০ দিনের (৩ মাস) কুলডাউন স্বয়ংক্রিয়ভাবে হিসাব হবে' : 'Cooldown status is computed based on 90-day interval rule'}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {isBn ? 'রক্তদানের অভিজ্ঞতা নোট' : 'Donation Experience Notes'}
                </label>
                <textarea
                  rows={2}
                  value={experienceNotes}
                  onChange={(e) => setExperienceNotes(e.target.value)}
                  placeholder="e.g. Regular voluntary blood donor since 2021..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] text-xs focus:bg-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                />
              </div>

              {/* Inline Add History Sub-Form */}
              {showAddHistory && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 animate-in fade-in">
                  <h5 className="text-xs font-extrabold text-emerald-950 font-display">
                    {isBn ? 'নতুন রক্তদানের হিস্টোরি রেকর্ড' : 'Log Donation History Record'}
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isBn ? 'রক্তদানের তারিখ' : 'Donation Date'}
                      </label>
                      <DateInput
                        value={newHistDate}
                        onChange={(val) => setNewHistDate(val)}
                        isBn={isBn}
                        max={new Date().toISOString().split('T')[0]}
                        minYear={2010}
                        maxYear={new Date().getFullYear()}
                        compact
                        showQuickToday
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Hospital Name (e.g. CMCH)"
                      value={newHistHospital}
                      onChange={(e) => setNewHistHospital(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                    />
                    <select
                      value={newHistType}
                      onChange={(e) => setNewHistType(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs font-bold"
                    >
                      <option value="VOLUNTARY">Voluntary</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="CAMPAIGN">Campaign</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Recipient Reference (Optional)"
                      value={newHistRef}
                      onChange={(e) => setNewHistRef(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#EAE3D9] bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddHistoryEntry}
                      className="px-4 py-2 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-xs cursor-pointer"
                    >
                      {isBn ? 'যুক্ত করুন' : 'Add Record'}
                    </button>
                  </div>
                </div>
              </div>
            )}

              {/* History List */}
              {donationHistory.length > 0 && (
                <div className="space-y-2">
                  {donationHistory.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-800">
                          {h.hospital} &bull; <span className="text-rose-700">{h.donationType}</span>
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          {h.donationDate} &bull; {h.district} {h.recipientReference && `(Ref: ${h.recipientReference})`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHistoryEntry(h.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prominent Modal Error Banner */}
            {modalError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">{isBn ? 'সংশোধন আবশ্যক:' : 'Correction Required:'}</p>
                  <p className="font-medium text-rose-800 mt-0.5">{modalError}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between gap-3 shrink-0">
              {donorToEdit && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(isBn ? `আপনি কি নিশ্চিত যে রক্তদাতা "${donorToEdit.fullName}" মুছে ফেলতে চান?` : `Are you sure you want to delete donor "${donorToEdit.fullName}"?`)) {
                      onDelete(donorToEdit.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>{isBn ? 'রক্তদাতা মুছুন' : 'Delete Donor'}</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-[#EAE3D9] text-slate-700 font-bold text-xs hover:bg-[#FAF7F2] transition-all cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={Boolean(lastDonationDate && lastDonationDate > new Date().toISOString().split('T')[0])}
                  className={`px-6 py-2.5 rounded-2xl font-extrabold text-xs shadow-warm-sm transition-all flex items-center gap-1.5 ${
                    lastDonationDate && lastDonationDate > new Date().toISOString().split('T')[0]
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#006A4E] hover:bg-[#00523C] text-white cursor-pointer transform hover:-translate-y-0.5'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {lastDonationDate && lastDonationDate > new Date().toISOString().split('T')[0]
                      ? (isBn ? 'তারিখ সংশোধন করুন' : 'Correct Future Date')
                      : donorToEdit
                      ? (isBn ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes')
                      : (isBn ? 'রক্তদাতা তৈরি করুন' : 'Create Donor')}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(url) => {
            setPhotoUrl(url);
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </>
  );
};
