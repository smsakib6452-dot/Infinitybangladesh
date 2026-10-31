import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Image as ImageIcon, Sparkles, Link as LinkIcon, Layers } from 'lucide-react';
import { BannerItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { isValidPermanentUrl } from '../lib/utils/mediaSanitizer';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerItem | null;
  onSave: (bannerData: Omit<BannerItem, 'id'>) => void;
  onOpenMediaLibrary?: (onSelect: (url: string) => void) => void;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSave,
  onOpenMediaLibrary
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [subtitleBn, setSubtitleBn] = useState('');
  const [ctaTextEn, setCtaTextEn] = useState('Support Us');
  const [ctaTextBn, setCtaTextBn] = useState('সহায়তা করুন');
  const [ctaUrl, setCtaUrl] = useState('donate');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [placement, setPlacement] = useState<BannerItem['placement']>('homepage_hero');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [desktopImageUrl, setDesktopImageUrl] = useState('/images/infinity-cover-hero.jpg');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setTitleEn(banner.title?.en || '');
      setTitleBn(banner.title?.bn || '');
      setSubtitleEn(banner.subtitle?.en || '');
      setSubtitleBn(banner.subtitle?.bn || '');
      setCtaTextEn(banner.ctaText?.en || 'Support Us');
      setCtaTextBn(banner.ctaText?.bn || 'সহায়তা করুন');
      setCtaUrl(banner.ctaUrl || 'donate');
      setOpenInNewTab(banner.openInNewTab || false);
      setPlacement(banner.placement || 'homepage_hero');
      setDisplayOrder(banner.displayOrder || 1);
      setActive(banner.active ?? true);
      setDesktopImageUrl(banner.desktopImageUrl || '/images/infinity-cover-hero.jpg');
      setMobileImageUrl(banner.mobileImageUrl || '');
    } else {
      setTitleEn('New Humanitarian Banner');
      setTitleBn('নতুন মানবিক ব্যানার');
      setSubtitleEn('United for Humanity & Youth Empowerment');
      setSubtitleBn('মানবতার সেবায় নিবেদিত ও যুব সমাজের ক্ষমতায়ন');
      setCtaTextEn('Support Us');
      setCtaTextBn('সহায়তা করুন');
      setCtaUrl('donate');
      setOpenInNewTab(false);
      setPlacement('homepage_hero');
      setDisplayOrder(1);
      setActive(true);
      setDesktopImageUrl('/images/infinity-cover-hero.jpg');
      setMobileImageUrl('');
    }
    setUploadError(null);
  }, [banner, isOpen]);

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
        setDesktopImageUrl(targetUrl);
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
      alert('Please enter banner title');
      return;
    }
    if (!desktopImageUrl.trim() || !isValidPermanentUrl(desktopImageUrl.trim())) {
      alert('Please provide a valid permanent desktop image URL (HTTPS or local asset)');
      return;
    }
    if (false) {
      alert('Please provide banner image URL');
      return;
    }

    onSave({
      title: { en: titleEn.trim(), bn: titleBn.trim() || titleEn.trim() },
      subtitle: (subtitleEn.trim() || subtitleBn.trim()) ? { en: subtitleEn.trim(), bn: subtitleBn.trim() || subtitleEn.trim() } : undefined,
      ctaText: (ctaTextEn.trim() || ctaTextBn.trim()) ? { en: ctaTextEn.trim(), bn: ctaTextBn.trim() || ctaTextEn.trim() } : undefined,
      ctaUrl: ctaUrl.trim() || 'donate',
      openInNewTab,
      placement,
      displayOrder: Number(displayOrder) || 1,
      active,
      desktopImageUrl: desktopImageUrl.trim(),
      mobileImageUrl: mobileImageUrl.trim() ? mobileImageUrl.trim() : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EAE3D9] my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#006A4E]/10 via-[#FAF7F2] to-amber-500/10 border-b border-[#EAE3D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center shadow-warm-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {banner ? (isBn ? 'ব্যানার / স্লাইড সম্পাদন' : 'Edit Banner Slide') : (isBn ? 'নতুন ব্যানার তৈরি' : 'Create New Banner')}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'স্লাইডারের ছবি, শিরোনাম, অ্যাকশন বোতাম ও প্রদর্শনের নিয়মাবলী কনফিগার করুন।' : 'Configure hero carousel content, call-to-action button, and placement settings.'}
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Image Upload & Preview Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {isBn ? 'ব্যানার ছবি (ডেস্কটপ ও প্রধান)' : 'Banner Image (Desktop & Primary)'} *
            </label>

            <div className="relative aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 group">
              {desktopImageUrl ? (
                <img
                  src={desktopImageUrl}
                  alt="Banner preview"
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
                  <span className="text-xs font-medium">No Image Selected</span>
                </div>
              )}

              {/* Overlay Upload Controls */}
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                <label className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-warm-md hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
                  <Upload className="w-4 h-4 text-[#006A4E]" />
                  <span>{isUploading ? 'Uploading...' : 'Upload from Device'}</span>
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
                    onClick={() => onOpenMediaLibrary((url) => setDesktopImageUrl(url))}
                    className="px-4 py-2 rounded-xl bg-[#006A4E] text-white font-bold text-xs shadow-warm-md hover:bg-[#00523C] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Choose from Media</span>
                  </button>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Desktop Image URL
                </label>
                <input
                  type="text"
                  value={desktopImageUrl}
                  onChange={(e) => setDesktopImageUrl(e.target.value)}
                  placeholder="https://... or /images/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Mobile Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={mobileImageUrl}
                  onChange={(e) => setMobileImageUrl(e.target.value)}
                  placeholder="Optional portrait optimized URL"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bilingual Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Banner Headline (English) *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. United for Humanity & Youth Empowerment"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                ব্যানার শিরোনাম (বাংলা) *
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: মানবতার সেবায় একতাবদ্ধ"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
                required
              />
            </div>
          </div>

          {/* Bilingual Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Subtitle / Tagline (English)
              </label>
              <input
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder="e.g. Empowering vulnerable communities across Bangladesh"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                সাবটাইটেল / স্লোগান (বাংলা)
              </label>
              <input
                type="text"
                value={subtitleBn}
                onChange={(e) => setSubtitleBn(e.target.value)}
                placeholder="যেমন: প্রান্তিক মানুষের কল্যাণে তরুণদের নিঃস্বার্থ প্রচেষ্টা"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
              />
            </div>
          </div>

          {/* Call to Action Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <LinkIcon className="w-4 h-4 text-[#006A4E]" />
                <span>{isBn ? 'অ্যাকশন বোতাম (CTA) ও লিংক কনফিগারেশন' : 'Action Button (CTA) & Link Configuration'}</span>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="rounded text-[#006A4E] focus:ring-[#006A4E]"
                />
                <span>{isBn ? 'নতুন ট্যাবে খুলুন (External Link)' : 'Open in New Tab'}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Button Text (EN)
                </label>
                <input
                  type="text"
                  value={ctaTextEn}
                  onChange={(e) => setCtaTextEn(e.target.value)}
                  placeholder="Support Us"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#006A4E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  বোতামের লেখা (বাং)
                </label>
                <input
                  type="text"
                  value={ctaTextBn}
                  onChange={(e) => setCtaTextBn(e.target.value)}
                  placeholder="সহায়তা করুন"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#006A4E] outline-none font-bengali"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Target Route / URL
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="e.g. donate, volunteer, campaigns"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#006A4E] outline-none font-mono"
                />
              </div>
            </div>

            {/* Quick Route Selector Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isBn ? 'দ্রুত লিংক সিলেক্ট করুন (Quick Route Selector):' : 'Quick Route Selectors:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { route: 'donate', label: isBn ? '💸 অনুদান' : 'Donate' },
                  { route: 'volunteer', label: isBn ? '🤝 স্বেচ্ছাসেবী' : 'Volunteer' },
                  { route: 'campaigns', label: isBn ? '🚩 ক্যাম্পেইন' : 'Campaigns' },
                  { route: 'programs', label: isBn ? '🤲 কর্মসূচি' : 'Programs' },
                  { route: 'about', label: isBn ? '📖 পরিচিতি' : 'About' },
                  { route: 'about/executive-committee', label: isBn ? '👥 কমিটি' : 'Committee' },
                  { route: 'transparency', label: isBn ? '🛡️ স্বচ্ছতা' : 'Transparency' },
                  { route: 'gallery', label: isBn ? '🖼️ গ্যালারি' : 'Gallery' },
                  { route: 'videos', label: isBn ? '🎬 ভিডিও' : 'Videos' },
                  { route: 'media-coverage', label: isBn ? '📰 প্রেস' : 'Press' },
                  { route: 'contact', label: isBn ? '📞 যোগাযোগ' : 'Contact' }
                ].map((item) => (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => setCtaUrl(item.route)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ctaUrl === item.route
                        ? 'bg-[#006A4E] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-[#006A4E] hover:text-[#006A4E]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Placement, Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Placement Area
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as BannerItem['placement'])}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              >
                <option value="homepage_hero">Homepage Hero Slider</option>
                <option value="campaign_feature">Campaign Featured Banner</option>
                <option value="announcement_top">Top Announcement Bar</option>
                <option value="popup">Special Modal / Popup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Display Order / Priority
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Publish Status
              </label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  active
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${active ? 'opacity-100' : 'opacity-0'}`} />
                <span>{active ? 'Active & Published' : 'Draft / Inactive'}</span>
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
              <span>{banner ? 'Save Changes' : 'Create Banner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
