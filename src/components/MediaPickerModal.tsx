import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MediaItem, MediaCategory } from '../types';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  X,
  Folder,
  Sparkles,
  Link2,
  Trash2,
  Eye,
  Info,
  Video,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../lib/storage/storageService';
import { uploadToCloudinary, isCloudinaryConfigured, CLOUDINARY_CLOUD_NAME } from '../lib/cloudinary';
import { isValidPermanentUrl } from '../lib/utils/mediaSanitizer';
import { detectAndNormalizeMedia } from '../lib/utils/mediaHelper';

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (imageUrl: string, mediaItem?: MediaItem) => void;
  onSelectMedia?: (imageUrl: string, mediaItem?: MediaItem) => void;
  currentImageUrl?: string;
  defaultCategory?: MediaCategory;
  title?: string;
  allowVideos?: boolean;
}

const CATEGORIES: MediaCategory[] = [
  'General',
  'Hero',
  'Campaigns',
  'Volunteers',
  'Events',
  'Children & Community',
  'Logos',
  'Banners',
  'Stories',
  'Gallery',
  'Documents'
];

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSelectMedia,
  currentImageUrl = '',
  defaultCategory = 'General',
  title,
  allowVideos = true
}) => {
  const { isBn } = useLanguage();
  const { mediaLibrary, addMediaItem } = useData();

  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory === 'General' ? 'All' : defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [customUrl, setCustomUrl] = useState(currentImageUrl);

  // Upload Tab State
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>(defaultCategory);
  const [uploadAltText, setUploadAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Safe callback dispatcher
  const dispatchSelect = (url: string, mediaItem?: MediaItem) => {
    try {
      if (typeof onSelect === 'function') {
        onSelect(url, mediaItem);
      } else if (typeof onSelectMedia === 'function') {
        onSelectMedia(url, mediaItem);
      }
    } catch (err) {
      console.error('Failed to execute media picker callback:', err);
    }
  };

  const safeClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // URL Auto-detection
  const urlDetection = useMemo(() => {
    if (!customUrl.trim()) return null;
    return detectAndNormalizeMedia(customUrl.trim());
  }, [customUrl]);

  if (!isOpen) return null;

  const filteredMedia = mediaLibrary.filter(item => {
    // Type filter
    if (mediaTypeFilter === 'image' && item.type === 'video') return false;
    if (mediaTypeFilter === 'video' && item.type !== 'video') return false;

    // Category filter
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    // Search query
    const matchesSearch = !searchQuery || 
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleConfirmSelection = () => {
    if (activeTab === 'url') {
      if (customUrl.trim()) {
        const det = detectAndNormalizeMedia(customUrl.trim());
        const selectedUrl = det.isValid ? (det.type === 'image' ? det.originalUrl : det.thumbnailUrl || det.originalUrl) : customUrl.trim();
        dispatchSelect(selectedUrl);
        safeClose();
      }
      return;
    }

    if (selectedItem) {
      dispatchSelect(selectedItem.url, selectedItem);
      safeClose();
    } else if (currentImageUrl) {
      dispatchSelect(currentImageUrl);
      safeClose();
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError('');
    setIsUploading(true);

    try {
      const validation = StorageService.validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file format or size.');
        setIsUploading(false);
        return;
      }

      // Upload directly to Cloudinary
      const uploadRes = await uploadToCloudinary(file);

      if (!uploadRes || !uploadRes.secure_url || !isValidPermanentUrl(uploadRes.secure_url)) {
        setUploadError('Cloud uploads are locked during Phase 1.1 containment.');
        setIsUploading(false);
        return;
      }

      const newMedia: Omit<MediaItem, 'id' | 'uploadedAt'> = {
        fileName: file.name,
        url: uploadRes.secure_url,
        fileSize: uploadRes.bytes
          ? `${(uploadRes.bytes / 1024).toFixed(1)} KB`
          : `${(file.size / 1024).toFixed(1)} KB`,
        mimeType: file.type,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        sourceType: 'upload',
        platform: 'cloudinary',
        category: uploadCategory,
        altText: uploadAltText || file.name.replace(/\.[^/.]+$/, ''),
        caption: '',
        usageTags: ['Cloudinary Upload', 'Direct CMS Selection'],
        status: 'published'
      };

      const created = addMediaItem(newMedia);
      setSelectedItem(created);
      dispatchSelect(created.url, created);
      setIsUploading(false);
      safeClose();
    } catch (err: any) {
      console.error('Upload to Cloudinary failed:', err);
      setUploadError(err.message || 'Error occurred during file upload to Cloudinary.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-left animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center shadow-warm-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
                {title || (isBn ? 'মিডিয়া লাইব্রেরি ও সম্পদ নির্বাচন' : 'Media Library & Asset Picker')}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'সংগঠনের সংরক্ষিত মিডিয়া থেকে নির্বাচন করুন অথবা নতুন ছবি/ভিডিও যুক্ত করুন'
                  : 'Select an official organizational photograph/video or import a new asset'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 flex items-center justify-between bg-white text-xs font-bold">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'border-[#006A4E] text-[#006A4E] font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>{isBn ? 'মিডিয়া লাইব্রেরি' : 'Media Library'}</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">
                {mediaLibrary.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#006A4E] text-[#006A4E] font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isBn ? 'ক্লাউড আপলোড' : 'Cloudinary Upload'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'border-[#006A4E] text-[#006A4E] font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>{isBn ? 'সরাসরি URL / ভিডিও' : 'Direct URL & Video'}</span>
            </button>
          </div>

          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hidden sm:flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloudinary Active</span>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAF7F2]/40">
          
          {/* TAB 1: MEDIA LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
                  {['All', ...CATEGORIES].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#006A4E] text-white shadow-warm-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative shrink-0 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isBn ? 'ছবি বা ভিডিও খুঁজুন...' : 'Search media by name...'}
                    className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                  />
                </div>
              </div>

              {/* Media Grid */}
              {filteredMedia.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">
                    {isBn ? 'কোনো মিডিয়া পাওয়া যায়নি' : 'No media items found'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'ক্যাটাগরি পরিবর্তন করুন অথবা "ক্লাউড আপলোড" ট্যাবে যান।' : 'Try selecting another category or upload a new asset.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredMedia.map(item => {
                    const isSelected = selectedItem?.id === item.id || (!selectedItem && currentImageUrl === item.url);
                    const isVideo = item.type === 'video';
                    const displayThumb = item.thumbnailUrl || item.url;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`group relative rounded-2xl overflow-hidden bg-white border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#006A4E] ring-4 ring-[#006A4E]/20 shadow-warm-md scale-[1.02]'
                            : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-warm-xs'
                        }`}
                      >
                        <div className="aspect-4/3 bg-slate-900 overflow-hidden relative">
                          <img
                            src={displayThumb}
                            alt={item.altText || item.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          {isVideo && (
                            <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-[#006A4E]/90 text-white flex items-center justify-center shadow-md">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#006A4E] text-white flex items-center justify-center shadow-md z-10">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                            {item.category}
                          </div>
                        </div>

                        <div className="p-2.5 space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 truncate" title={item.fileName}>
                            {item.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.altText || item.fileSize || item.platform}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLOUDINARY UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-4 transition-colors ${
                  dragOver
                    ? 'border-[#006A4E] bg-emerald-50/50'
                    : 'border-slate-300 hover:border-[#006A4E] bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E6F3EF] text-[#006A4E] flex items-center justify-center mx-auto shadow-warm-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {isBn ? 'ছবি টেনে এনে এখানে ছাড়ুন অথবা কম্পিউটার থেকে বেছে নিন' : 'Drag & drop image here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WebP, GIF, SVG up to 10 MB &bull; Uploaded directly to Cloudinary CDN
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold shadow-warm-sm transition-colors cursor-pointer">
                  <span>{isBn ? 'ফাইল নির্বাচন করুন' : 'Browse Files'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Upload Meta Options */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'ক্যাটাগরি নির্ধারণ করুন:' : 'Assign Asset Category:'}
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as MediaCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'ছবির বিবরণ / Alt Text:' : 'Image Alt Text / Description:'}
                  </label>
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={e => setUploadAltText(e.target.value)}
                    placeholder={isBn ? 'যেমন: সুবিধা বঞ্চিত শিশুদের মাঝে ঈদ উপহার বিতরণ' : 'e.g. Eid Gift Distribution Drive with Youth Volunteers'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
                  />
                </div>
              </div>

              {isUploading && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-[#00523C] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-ping" />
                  <span>{isBn ? 'ছবি প্রক্রিয়াকরণ ও আপলোড হচ্ছে...' : 'Uploading & processing image...'}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 font-medium">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIRECT URL & VIDEO EMBED */}
          {activeTab === 'url' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-sm">
                    {isBn ? 'সরাসরি লিঙ্ক বা ভিডিও URL:' : 'Direct Media or Video URL:'}
                  </label>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {isBn
                      ? 'YouTube (watch/shorts/youtu.be), Facebook Public Video, বা সরাসরি ছবির লিঙ্ক পেস্ট করুন।'
                      : 'Paste YouTube, Facebook video, or direct image URL. Platform and embed parameters are auto-detected.'}
                  </p>
                </div>

                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://fb.watch/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#006A4E]"
                />

                {/* Auto Detection Result Card */}
                {urlDetection && (
                  <div className="space-y-3 pt-2">
                    {urlDetection.isValid ? (
                      <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#C2E2D7] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#006A4E]" />
                            <span className="font-bold text-[#00523C] capitalize">
                              Detected: {urlDetection.type === 'youtube' ? 'YouTube Video' : urlDetection.type === 'facebook' ? 'Facebook Video' : urlDetection.type === 'image' ? 'Image Asset' : 'Direct Video'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-[#006A4E]">
                            Verified
                          </span>
                        </div>

                        {/* Embed or Thumbnail Preview */}
                        <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-[#C2E2D7] relative">
                          {urlDetection.type === 'youtube' || urlDetection.type === 'facebook' ? (
                            <iframe
                              src={urlDetection.embedUrl}
                              title="Media Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          ) : (
                            <img
                              src={urlDetection.originalUrl}
                              alt="Custom URL Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>{urlDetection.errorMessage || 'Invalid or unrecognized media URL.'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <div className="text-xs text-slate-500 truncate max-w-[50%]">
            {selectedItem ? (
              <span className="font-semibold text-slate-800">
                Selected: <span className="text-[#006A4E]">{selectedItem.fileName}</span>
              </span>
            ) : currentImageUrl ? (
              <span className="truncate block">Current: {currentImageUrl}</span>
            ) : (
              <span>No asset selected</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={activeTab === 'url' ? !customUrl.trim() : (!selectedItem && !currentImageUrl)}
              className="px-6 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-warm-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isBn ? 'মিডিয়া নির্বাচন করুন' : 'Apply Selection'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
