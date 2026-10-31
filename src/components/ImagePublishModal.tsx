import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Image as ImageIcon, Sparkles, Tag, Calendar, Star, Layers, Folder } from 'lucide-react';
import { MediaItem, MediaCategory, Campaign, EventItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { isValidPermanentUrl } from '../lib/utils/mediaSanitizer';

interface ImagePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  campaigns: Campaign[];
  events: EventItem[];
  onSave: (data: {
    fileName: string;
    url: string;
    category: MediaCategory;
    altText: string;
    caption?: string;
    title?: string;
    description?: string;
    usageTags: string[];
    isFeatured?: boolean;
    type?: 'image';
    fileSize?: string;
    mimeType?: string;
  }) => void;
}

const CATEGORIES: MediaCategory[] = [
  'Hero',
  'Campaigns',
  'Volunteers',
  'Events',
  'Children & Community',
  'Logos',
  'Banners',
  'Stories',
  'Gallery',
  'Documents',
  'General'
];

export const ImagePublishModal: React.FC<ImagePublishModalProps> = ({
  isOpen,
  onClose,
  mediaItem,
  campaigns,
  events,
  onSave
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [captionBn, setCaptionBn] = useState('');
  const [altText, setAltText] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<MediaCategory>('Campaigns');
  const [associatedEntity, setAssociatedEntity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (mediaItem) {
      setTitleEn(mediaItem.title || mediaItem.fileName || '');
      setTitleBn(mediaItem.description || '');
      setCaptionEn(mediaItem.caption || '');
      setCaptionBn('');
      setAltText(mediaItem.altText || '');
      setUrl(mediaItem.url || '');
      setCategory(mediaItem.category || 'Campaigns');
      setTagsInput((mediaItem.usageTags || []).join(', '));
      setIsFeatured(mediaItem.isFeatured || false);
      setDate(mediaItem.uploadedAt || new Date().toISOString().split('T')[0]);
    } else {
      setTitleEn('');
      setTitleBn('');
      setCaptionEn('');
      setCaptionBn('');
      setAltText('');
      setUrl('');
      setCategory('Campaigns');
      setTagsInput('Campaigns, Gallery');
      setIsFeatured(false);
      setDate(new Date().toISOString().split('T')[0]);
    }
    setUploadError(null);
  }, [mediaItem, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await uploadToCloudinary(file);
      const uploadedUrl = res?.secure_url || res?.url;
      if (uploadedUrl && isValidPermanentUrl(uploadedUrl)) {
        setUrl(uploadedUrl);
        if (!titleEn) {
          setTitleEn(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        if (!altText) {
          setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      } else {
        setUploadError('Cloud uploads are locked during Phase 1.1 containment. Please enter a verified permanent image URL.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload image file. You can enter direct URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssociatedEntityChange = (val: string) => {
    setAssociatedEntity(val);
    if (!val) return;

    const [type, id] = val.split(':');
    if (type === 'campaign') {
      const camp = campaigns.find(c => c.id === id);
      if (camp) {
        const existing = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
        if (!existing.includes(camp.title.en)) {
          setTagsInput([...existing, camp.title.en].join(', '));
        }
      }
    } else if (type === 'event') {
      const ev = events.find(e => e.id === id);
      if (ev) {
        const existing = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
        if (!existing.includes(ev.title.en)) {
          setTagsInput([...existing, ev.title.en].join(', '));
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidPermanentUrl(url.trim())) {
      alert('Please upload or provide a valid permanent image URL (HTTPS or local asset)');
      return;
    }
    if (false) {
      alert('Please upload or provide an image URL');
      return;
    }
    const finalFileName = titleEn.trim() || 'Infinity Asset';
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      fileName: finalFileName,
      url: url.trim(),
      category,
      altText: altText.trim() || finalFileName,
      caption: captionEn.trim() || undefined,
      title: titleEn.trim() || finalFileName,
      description: titleBn.trim() || undefined,
      usageTags: parsedTags.length > 0 ? parsedTags : [category],
      isFeatured,
      type: 'image',
      fileSize: 'Optimized',
      mimeType: 'image/jpeg'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAE3D9] my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#006A4E]/10 via-[#FAF7F2] to-amber-500/10 border-b border-[#EAE3D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center shadow-warm-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {mediaItem ? (isBn ? 'ছবি ও মিডিয়া মেটাডাটা সম্পাদন' : 'Edit Image Metadata') : (isBn ? 'নতুন ছবি ও মিডিয়া আপলোড' : 'Publish New Image Asset')}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'ক্লাউডিনারি স্টোরেজে ছবি আপলোড ও বিস্তারিত ট্যাগিং সম্পন্ন করুন।' : 'Upload directly to Cloudinary and specify bilingual metadata, category, and tags.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* File Drag-and-drop & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {isBn ? 'ছবি নির্বাচন বা আপলোড' : 'Image File / Preview'} *
            </label>

            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 group">
              {url ? (
                <img
                  src={url}
                  alt="Asset preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/images/winter-warmth.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                  <Upload className="w-10 h-10 text-slate-400 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700">Click below or upload from computer</span>
                  <span className="text-[11px] text-slate-400">JPG, PNG, WEBP supported (auto optimized via Cloudinary)</span>
                </div>
              )}

              {/* Upload Controls */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                <label className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-warm-md hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
                  <Upload className="w-4 h-4 text-[#006A4E]" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File to Cloudinary'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Direct Image URL (or uploaded link)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or /images/..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                required
              />
            </div>
          </div>

          {/* Bilingual Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Image Title / Name (English) *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Winter Blanket Distribution Drive"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                ছবির শিরোনাম (বাংলা)
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: শীতবস্ত্র বিতরণ কার্যক্রম"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
              />
            </div>
          </div>

          {/* Alt Text (Accessibility & SEO) & Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alt Text (SEO & Accessibility) *
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Infinity Bangladesh volunteers distributing blankets in northern village"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Caption (Optional)
              </label>
              <input
                type="text"
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                placeholder="Short caption text"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>
          </div>

          {/* Category & Associated Campaign / Event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MediaCategory)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Associated Campaign / Event
              </label>
              <select
                value={associatedEntity}
                onChange={(e) => handleAssociatedEntityChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              >
                <option value="">None / General Asset</option>
                <optgroup label="Campaigns">
                  {campaigns.map(c => (
                    <option key={c.id} value={`campaign:${c.id}`}>{c.title.en}</option>
                  ))}
                </optgroup>
                <optgroup label="Events">
                  {events.map(ev => (
                    <option key={ev.id} value={`event:${ev.id}`}>{ev.title.en}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Usage Tags & Feature Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Usage Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Homepage Hero, Winter Warmth, Relief 2026"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Highlight / Feature
              </label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isFeatured
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>{isFeatured ? 'Featured on Home' : 'Standard Asset'}</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{mediaItem ? 'Save Metadata' : 'Publish Image'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
