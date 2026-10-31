import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { CommitteeMember, Person, Position, Committee } from '../types';
import {
  Users,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Crop,
  Sparkles,
  ShieldCheck,
  Award,
  Link,
  Facebook,
  Linkedin,
  FileText,
  Trash2
} from 'lucide-react';
import { getAssetUrl } from '../lib/utils/assetHelper';
import { ImageEditorModal } from './ImageEditorModal';
import { resolveMediaFieldUpdate, isValidPermanentUrl } from '../lib/utils/mediaSanitizer';

export interface CommitteeMemberFormData {
  banglaName: string;
  englishName: string;
  banglaDesignation: string;
  englishDesignation: string;
  committeeId: string;
  serialNumber: number;
  sortOrder: number;
  photoUrl: string;
  photoAlt: string;
  shortBioEn: string;
  shortBioBn: string;
  facebookUrl: string;
  linkedinUrl: string;
  isFeaturedLeader: boolean;
  status: 'ACTIVE' | 'FORMER' | 'INACTIVE' | 'ARCHIVED';
  level: number;
}

export interface CommitteeMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: (CommitteeMember & { person: Person; position: Position; committee?: Committee }) | null;
  defaultCommitteeId?: string;
  onSave: (formData: CommitteeMemberFormData, memberId?: string, personId?: string, positionId?: string) => void;
  onOpenMediaPicker?: (callback: (url: string) => void) => void;
}

export const CommitteeMemberModal: React.FC<CommitteeMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  defaultCommitteeId = 'comm-exec-2026',
  onSave,
  onOpenMediaPicker
}) => {
  const { isBn } = useLanguage();
  const { committees } = useData();

  const [formData, setFormData] = useState<CommitteeMemberFormData>({
    banglaName: '',
    englishName: '',
    banglaDesignation: '',
    englishDesignation: '',
    committeeId: defaultCommitteeId,
    serialNumber: 1,
    sortOrder: 1,
    photoUrl: '',
    photoAlt: '',
    shortBioEn: '',
    shortBioBn: '',
    facebookUrl: '',
    linkedinUrl: '',
    isFeaturedLeader: false,
    status: 'ACTIVE',
    level: 4
  });

  // Image Editor sub-modal state
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        banglaName: member.person?.banglaName || '',
        englishName: member.person?.englishName || member.person?.fullName || '',
        banglaDesignation: member.position?.name?.bn || '',
        englishDesignation: member.position?.name?.en || '',
        committeeId: member.committeeId || defaultCommitteeId,
        serialNumber: member.serialNumber || 1,
        sortOrder: member.sortOrder || member.serialNumber || 1,
        photoUrl: member.person?.photoUrl || '',
        photoAlt: `${member.person?.englishName || member.person?.fullName || 'Committee Member'} - Infinity Bangladesh`,
        shortBioEn: member.person?.shortBio?.en || '',
        shortBioBn: member.person?.shortBio?.bn || '',
        facebookUrl: member.person?.facebookUrl || member.person?.socialLinks?.facebook || '',
        linkedinUrl: member.person?.linkedinUrl || member.person?.socialLinks?.linkedin || '',
        isFeaturedLeader: member.isFeaturedLeader || false,
        status: member.status || 'ACTIVE',
        level: member.position?.level || 4
      });
    } else {
      setFormData({
        banglaName: '',
        englishName: '',
        banglaDesignation: '',
        englishDesignation: '',
        committeeId: defaultCommitteeId,
        serialNumber: 1,
        sortOrder: 1,
        photoUrl: '',
        photoAlt: '',
        shortBioEn: '',
        shortBioBn: '',
        facebookUrl: '',
        linkedinUrl: '',
        isFeaturedLeader: false,
        status: 'ACTIVE',
        level: 4
      });
    }
  }, [member, defaultCommitteeId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.banglaName.trim() && !formData.englishName.trim()) {
      alert(isBn ? 'অনুগ্রহ করে সদস্যের নাম লিখুন' : 'Please enter member name');
      return;
    }
    if (!formData.banglaDesignation.trim() && !formData.englishDesignation.trim()) {
      alert(isBn ? 'অনুগ্রহ করে পদবী লিখুন' : 'Please enter designation');
      return;
    }

    const existingPhoto = member?.person?.photoUrl || '';
    const safePhoto = resolveMediaFieldUpdate(existingPhoto, formData.photoUrl, false);
    onSave({ ...formData, photoUrl: safePhoto || '' }, member?.id, member?.personId, member?.positionId);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-3xl border border-[#EAE3D9] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F2]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display">
                  {member
                    ? (isBn ? 'কমিটি সদস্য তথ্য সম্পাদনা' : 'Edit Committee Member')
                    : (isBn ? 'নতুন কমিটি সদস্য যুক্ত করুন' : 'Add New Committee Member')}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'স্থায়ী বা কার্যনির্বাহী পরিষদের সদস্যের নাম, পদবী, ছবি ও সিরিয়াল নম্বর পরিবর্তন করুন।'
                    : 'Manage member details, designation, committee affiliation, serial ranking, and photo.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Committee Assignment & Serial / Sort */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'কমিটি ও ক্রমিক নম্বর (Committee & Ranking)' : 'Committee & Ranking'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Committee Selector */}
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-bold text-slate-700">{isBn ? 'কমিটি নির্বাচন' : 'Target Committee'}</label>
                  <select
                    value={formData.committeeId}
                    onChange={(e) => setFormData({ ...formData, committeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  >
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>
                        {isBn ? (c.name.bn || c.name.en) : (c.name.en || c.name.bn)} ({isBn ? (c.type === 'EXECUTIVE' ? 'কার্যনির্বাহী' : 'স্থায়ী') : (c.type === 'EXECUTIVE' ? 'Executive' : 'Standing')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Serial Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'ক্রমিক নম্বর (Serial #)' : 'Official Serial #'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      serialNumber: parseInt(e.target.value) || 1,
                      sortOrder: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                {/* Hierarchy Level */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'পদমর্যাদা স্তর (Hierarchy Level)' : 'Hierarchy Level'}
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  >
                    <option value="1">Tier 1: President / Chairman (প্রধান নেতৃত্ব)</option>
                    <option value="2">Tier 2: Senior VP / Vice-Chairman (সহ-সভাপতি/সহ-চেয়ারম্যান)</option>
                    <option value="3">Tier 3: General Secretary (সাধারণ সম্পাদক)</option>
                    <option value="4">Tier 4: Joint / Dept Secretary (যুগ্ম/সম্পাদকবৃন্দ)</option>
                    <option value="5">Tier 5: Executive Member (কার্যনির্বাহী সদস্য)</option>
                  </select>
                </div>
              </div>

              {/* Status & Featured */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                    className="rounded accent-[#006A4E] w-4 h-4"
                  />
                  <span>{isBn ? 'সক্রিয় ও প্রকাশিত (Active Status)' : 'Active / Published Member'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeaturedLeader}
                    onChange={(e) => setFormData({ ...formData, isFeaturedLeader: e.target.checked })}
                    className="rounded accent-[#006A4E] w-4 h-4"
                  />
                  <span>{isBn ? 'প্রধান শীর্ষ নেতৃত্ব হিসেবে হাইলাইট করুন' : 'Highlight as Key Leader'}</span>
                </label>
              </div>
            </div>

            {/* Bilingual Names & Designations */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'নাম ও পদবী (Bilingual Identity)' : 'Bilingual Identity'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bangla Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'সদস্যের পুরো নাম (বাংলা)' : 'Full Name (Bengali)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.banglaName}
                    onChange={(e) => setFormData({ ...formData, banglaName: e.target.value })}
                    placeholder="যেমন: এস এম সাকিব"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                {/* English Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'সদস্যের পুরো নাম (ইংরেজি)' : 'Full Name (English)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.englishName}
                    onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                    placeholder="e.g. S M Sakib"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                {/* Bangla Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'পদবী (বাংলা)' : 'Designation (Bengali)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.banglaDesignation}
                    onChange={(e) => setFormData({ ...formData, banglaDesignation: e.target.value })}
                    placeholder="যেমন: সভাপতি / চেয়ারম্যান / সাধারণ সম্পাদক"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                {/* English Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? 'পদবী (ইংরেজি)' : 'Designation (English)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.englishDesignation}
                    onChange={(e) => setFormData({ ...formData, englishDesignation: e.target.value })}
                    placeholder="e.g. President / Chairman / General Secretary"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>
              </div>
            </div>

            {/* Profile Photo & Integrated Image Editor */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#006A4E]" />
                  <span>{isBn ? 'প্রোফাইল ছবি ও পজিশনিং (Profile Photo & Crop)' : 'Profile Photo & Crop (1:1)'}</span>
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Photo Preview Thumbnail */}
                <div className="relative w-28 h-28 rounded-2xl bg-white border-2 border-[#006A4E]/30 overflow-hidden shadow-warm-xs flex items-center justify-center flex-shrink-0">
                  {formData.photoUrl ? (
                    <img
                      src={getAssetUrl(formData.photoUrl)}
                      alt={formData.banglaName || formData.englishName || 'Member Photo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-slate-300" />
                  )}

                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Photo Action Controls */}
                <div className="space-y-2.5 flex-1 w-full">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEv) => {
                          if (uploadEv.target?.result) {
                            setFormData(prev => ({ ...prev, photoUrl: uploadEv.target!.result as string }));
                            setIsImageEditorOpen(true);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />

                  <div className="flex flex-wrap gap-2">
                    {/* Upload from PC */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D9] hover:border-[#006A4E] text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-warm-xs cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>{isBn ? 'ডিভাইস থেকে আপলোড' : 'Upload from PC'}</span>
                    </button>

                    {/* Open Image Editor (Crop, Zoom, Pan) */}
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setIsImageEditorOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-[#006A4E] text-white text-xs font-bold flex items-center gap-1.5 shadow-warm-xs hover:bg-[#00523C] cursor-pointer transition-all"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ছবি ক্রপ ও জুম করুন' : 'Crop & Zoom Photo'}</span>
                      </button>
                    )}

                    {/* Media Picker */}
                    {onOpenMediaPicker && (
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker((url) => {
                          setFormData({ ...formData, photoUrl: url });
                        })}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D9] hover:border-[#006A4E] text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-warm-xs cursor-pointer transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#006A4E]" />
                        <span>{isBn ? 'মিডিয়া গ্যালারি' : 'Media Library'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      {isBn ? 'অথবা সরাসরি ছবির URL লিখুন' : 'Or enter direct Photo URL:'}
                    </label>
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://... or /images/..."
                      className="w-full px-3 py-1.5 bg-white border border-[#EAE3D9] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Short Biography */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isBn ? 'সংক্ষিপ্ত পরিচিতি ও সামাজিক অবদান (Short Biography)' : 'Short Biography & Background'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">English Bio</label>
                  <textarea
                    rows={3}
                    value={formData.shortBioEn}
                    onChange={(e) => setFormData({ ...formData, shortBioEn: e.target.value })}
                    placeholder="Short summary of background, social contribution, and volunteer work..."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-bengali">বাংলা পরিচিতি</label>
                  <textarea
                    rows={3}
                    value={formData.shortBioBn}
                    onChange={(e) => setFormData({ ...formData, shortBioBn: e.target.value })}
                    placeholder="সংক্ষিপ্ত ভূমিকা, সামাজিক ভূমিকা ও অভিজ্ঞতা..."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Link className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'সামাজিক যোগাযোগ লিংক (Social Profiles)' : 'Social Profiles'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                    <span>Facebook Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#EAE3D9] hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-extrabold shadow-warm-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{isBn ? 'সদস্য সংরক্ষণ করুন' : 'Save Member Roster'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Image Editor Sub-Modal for Profile Photo */}
      {isImageEditorOpen && formData.photoUrl && (
        <ImageEditorModal
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          imageUrl={formData.photoUrl}
          defaultAspectRatio="1:1"
          allowedAspectRatios={['1:1', '4:5', '3:4', '4:3', '16:9', '21:9', 'free']}
          title={isBn ? 'সদস্যের ছবি ক্রপ, জুম ও পজিশনিং' : 'Crop & Position Member Photo (All Aspect Ratios)'}
          onSave={(croppedDataUrl) => {
            setFormData(prev => ({ ...prev, photoUrl: croppedDataUrl }));
            setIsImageEditorOpen(false);
          }}
          onOpenMediaLibrary={() => {
            setIsImageEditorOpen(false);
            if (onOpenMediaPicker) {
              onOpenMediaPicker((url) => {
                setFormData(prev => ({ ...prev, photoUrl: url }));
              });
            }
          }}
        />
      )}
    </>
  );
};
