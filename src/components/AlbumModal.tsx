import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Image as ImageIcon, Sparkles, FolderPlus, Calendar, Tag } from 'lucide-react';
import { GalleryAlbum } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { isValidPermanentUrl } from '../lib/utils/mediaSanitizer';

interface AlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: GalleryAlbum | null;
  onSave: (albumData: Omit<GalleryAlbum, 'id'>) => void;
  onOpenMediaLibrary?: (onSelect: (url: string) => void) => void;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  album,
  onSave,
  onOpenMediaLibrary
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descBn, setDescBn] = useState('');
  const [category, setCategory] = useState('Campaigns');
  const [date, setDate] = useState(`${new Date().getFullYear()}`);
  const [coverImageUrl, setCoverImageUrl] = useState('/images/infinity-cover-hero.jpg');
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (album) {
      setTitleEn(album.title?.en || '');
      setTitleBn(album.title?.bn || '');
      setDescEn(album.description?.en || '');
      setDescBn(album.description?.bn || '');
      setCategory(album.category || 'Campaigns');
      setDate(album.date || `${new Date().getFullYear()}`);
      setCoverImageUrl(album.coverImageUrl || '/images/infinity-cover-hero.jpg');
      setIsPublished(album.isPublished ?? true);
      setDisplayOrder(album.displayOrder || 1);
    } else {
      setTitleEn('');
      setTitleBn('');
      setDescEn('');
      setDescBn('');
      setCategory('Campaigns');
      setDate(`${new Date().getFullYear()}`);
      setCoverImageUrl('/images/infinity-cover-hero.jpg');
      setIsPublished(true);
      setDisplayOrder(1);
    }
    setUploadError(null);
  }, [album, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await uploadToCloudinary(file);
      const targetUrl = res?.secure_url || res?.url;
      if (targetUrl && isValidPermanentUrl(targetUrl)) {
        setCoverImageUrl(targetUrl);
      } else {
        setUploadError('Cloud uploads are locked during Phase 1.1 containment. Please enter a verified permanent image URL.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload image. Please try again or use direct URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) {
      alert('Please enter album title');
      return;
    }
    if (!coverImageUrl.trim() || !isValidPermanentUrl(coverImageUrl.trim())) {
      alert('Please provide a valid permanent cover image URL (HTTPS or local asset)');
      return;
    }
    if (false) {
      alert('Please provide cover image URL');
      return;
    }

    const slug = album?.slug || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `album-${Date.now()}`;

    onSave({
      slug,
      title: { en: titleEn.trim(), bn: titleBn.trim() || titleEn.trim() },
      description: { en: descEn.trim(), bn: descBn.trim() || descEn.trim() },
      coverImageUrl: coverImageUrl.trim(),
      category: category.trim() || 'General',
      date: date.trim() || `${new Date().getFullYear()}`,
      photos: album?.photos || [],
      isPublished,
      displayOrder: Number(displayOrder) || 1
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
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {album ? (isBn ? 'অ্যালবাম সম্পাদনা' : 'Edit Gallery Album') : (isBn ? 'নতুন অ্যালবাম তৈরি' : 'Create Gallery Album')}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'ইভেন্টভিত্তিক স্থিরচিত্র সংগ্রহের নাম, বর্ণনা ও কভার ছবি সেট করুন।' : 'Configure collection title, event date, category, and cover image.'}
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
          {/* Cover Image Upload & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {isBn ? 'অ্যালবাম কভার ছবি' : 'Album Cover Image'} *
            </label>

            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 group">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="Album cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/images/infinity-cover-hero.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs font-medium">No Cover Image</span>
                </div>
              )}

              {/* Overlay Upload Controls */}
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                <label className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-warm-md hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
                  <Upload className="w-4 h-4 text-[#006A4E]" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Device Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                {onOpenMediaLibrary && (
                  <button
                    type="button"
                    onClick={() => onOpenMediaLibrary((url) => setCoverImageUrl(url))}
                    className="px-4 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-md hover:bg-[#00523C] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Media Library</span>
                  </button>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Direct Image URL
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
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
                Album Title (English) *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Winter Warmth Drive 2026"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                অ্যালবাম শিরোনাম (বাংলা) *
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: শীতবস্ত্র বিতরণ অভিযান ২০২৬"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
                required
              />
            </div>
          </div>

          {/* Bilingual Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description (English)
              </label>
              <textarea
                rows={2}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Brief summary of event photos..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                বিবরণ (বাংলা)
              </label>
              <textarea
                rows={2}
                value={descBn}
                onChange={(e) => setDescBn(e.target.value)}
                placeholder="ইভেন্টের ছবির সংক্ষিপ্ত বর্ণনা..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              >
                <option value="Campaigns">Campaigns</option>
                <option value="Volunteers">Volunteers</option>
                <option value="Events">Events</option>
                <option value="Emergency Relief">Emergency Relief</option>
                <option value="Children">Children</option>
                <option value="Community">Community</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Event Date / Year
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 2026 or Feb 2026"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Status
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isPublished
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${isPublished ? 'opacity-100' : 'opacity-0'}`} />
                <span>{isPublished ? 'Published' : 'Draft'}</span>
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
              <span>{album ? 'Save Album' : 'Create Album'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
