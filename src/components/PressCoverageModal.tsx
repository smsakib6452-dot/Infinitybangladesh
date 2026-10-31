import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Newspaper, Sparkles, ExternalLink, Star, Calendar } from 'lucide-react';
import { PressCoverage, PressCoverageType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { isValidPermanentUrl } from '../lib/utils/mediaSanitizer';
import { DateInput } from './DateInput';

interface PressCoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pressItem: PressCoverage | null;
  onSave: (data: Omit<PressCoverage, 'id'>) => void;
  onOpenMediaLibrary?: (onSelect: (url: string) => void) => void;
}

export const PressCoverageModal: React.FC<PressCoverageModalProps> = ({
  isOpen,
  onClose,
  pressItem,
  onSave,
  onOpenMediaLibrary
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [outletName, setOutletName] = useState('');
  const [outletLogoUrl, setOutletLogoUrl] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptBn, setExcerptBn] = useState('');
  const [coverageType, setCoverageType] = useState<PressCoverageType>('newspaper');
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('/images/infinity-cover-hero.jpg');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'hidden'>('published');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (pressItem) {
      setOutletName(pressItem.outletName || '');
      setOutletLogoUrl(pressItem.outletLogoUrl || '');
      setTitleEn(pressItem.title?.en || '');
      setTitleBn(pressItem.title?.bn || '');
      setArticleUrl(pressItem.articleUrl || '');
      setExcerptEn(pressItem.excerpt?.en || '');
      setExcerptBn(pressItem.excerpt?.bn || '');
      setCoverageType(pressItem.coverageType || 'newspaper');
      setPublishedDate(pressItem.publishedDate || new Date().toISOString().split('T')[0]);
      setImageUrl(pressItem.imageUrl || '/images/infinity-cover-hero.jpg');
      setIsFeatured(pressItem.isFeatured || false);
      setStatus(pressItem.status || 'published');
    } else {
      setOutletName('');
      setOutletLogoUrl('');
      setTitleEn('');
      setTitleBn('');
      setArticleUrl('https://');
      setExcerptEn('');
      setExcerptBn('');
      setCoverageType('newspaper');
      setPublishedDate(new Date().toISOString().split('T')[0]);
      setImageUrl('/images/infinity-cover-hero.jpg');
      setIsFeatured(false);
      setStatus('published');
    }
    setUploadError(null);
  }, [pressItem, isOpen]);

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
        setImageUrl(targetUrl);
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
    if (!outletName.trim()) {
      alert('Please enter publisher or news outlet name');
      return;
    }
    if (!titleEn.trim()) {
      alert('Please enter article title');
      return;
    }
    if (!articleUrl.trim() || articleUrl === 'https://') {
      alert('Please provide valid target external article URL');
      return;
    }

    onSave({
      outletName: outletName.trim(),
      outletLogoUrl: outletLogoUrl.trim() || undefined,
      title: { en: titleEn.trim(), bn: titleBn.trim() || titleEn.trim() },
      articleUrl: articleUrl.trim(),
      excerpt: { en: excerptEn.trim(), bn: excerptBn.trim() || excerptEn.trim() },
      coverageType,
      publishedDate: publishedDate.trim() || new Date().toISOString().split('T')[0],
      imageUrl: imageUrl.trim() || undefined,
      isFeatured,
      status
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
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {pressItem ? (isBn ? 'সংবাদ কভারেজ সম্পাদন' : 'Edit Press Coverage Item') : (isBn ? 'নতুন সংবাদ কভারেজ যুক্ত করুন' : 'Add Press & News Coverage')}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'সংবাদপত্র, টিভি ও ব্লগের বাহ্যিক সংবাদের লিঙ্ক এবং বিবরণ যুক্ত করুন।' : 'Link external newspaper articles, TV reports, and media features about Infinity Bangladesh.'}
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
          {/* Outlet Name & Coverage Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Publisher / News Outlet Name *
              </label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder="e.g. Prothom Alo, The Daily Star, Somoy TV"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Coverage Type
              </label>
              <select
                value={coverageType}
                onChange={(e) => setCoverageType(e.target.value as PressCoverageType)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              >
                <option value="newspaper">Newspaper (জাতীয় পত্রিকা)</option>
                <option value="tv">TV & Video News (টিভি প্রতিবেদন)</option>
                <option value="online">Online News Portal (অনলাইন পোর্টাল)</option>
                <option value="blog">Blog & Feature (ব্লগ ও নিবন্ধ)</option>
                <option value="social">Social Media Feature (সোশ্যাল মিডিয়া)</option>
              </select>
            </div>
          </div>

          {/* Target Article URL */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-[#006A4E]" />
              <span>Original Article URL (Target External Link) *</span>
            </label>
            <input
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://www.prothomalo.com/bangladesh/..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#006A4E] outline-none font-mono text-slate-700"
              required
            />
            <p className="text-[11px] text-slate-500">
              When clicked by visitors, this link opens directly in a new tab (<code className="text-[#006A4E]">target="_blank"</code>).
            </p>
          </div>

          {/* Bilingual Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Article Headline (English) *
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Youth Organization Distributes Winter Blankets in North"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                খবরের শিরোনাম (বাংলা) *
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: শীতার্ত মানুষের মাঝে শীতবস্ত্র নিয়ে পাশে দাঁড়াল টিম ইনফিনিটি"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
                required
              />
            </div>
          </div>

          {/* Bilingual Excerpt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Short Excerpt / Summary (English)
              </label>
              <textarea
                rows={3}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                placeholder="Key highlights or brief snippet from the report..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                সংক্ষিপ্ত সারসংক্ষেপ (বাংলা)
              </label>
              <textarea
                rows={3}
                value={excerptBn}
                onChange={(e) => setExcerptBn(e.target.value)}
                placeholder="প্রতিবেদনের গুরুত্বপূর্ণ অংশ বা সারসংক্ষেপ..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none font-bengali"
              />
            </div>
          </div>

          {/* Publication Date, Thumbnail & Publisher Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Publication Date
              </label>
              <DateInput
                value={publishedDate}
                onChange={(val) => setPublishedDate(val)}
                isBn={isBn}
                minYear={2015}
                maxYear={new Date().getFullYear() + 2}
                showQuickToday
                compact
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Thumbnail Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or /images/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Publisher Logo URL (Optional)
              </label>
              <input
                type="text"
                value={outletLogoUrl}
                onChange={(e) => setOutletLogoUrl(e.target.value)}
                placeholder="Logo image link"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] focus:bg-white focus:border-[#006A4E] outline-none"
              />
            </div>
          </div>

          {/* Status & Featured Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Homepage Feature
              </label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isFeatured
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>{isFeatured ? 'Featured on Homepage' : 'Standard Press Item'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Visibility Status
              </label>
              <button
                type="button"
                onClick={() => setStatus(status === 'published' ? 'hidden' : 'published')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${status === 'published' ? 'opacity-100' : 'opacity-0'}`} />
                <span>{status === 'published' ? 'Published & Live' : 'Hidden from Website'}</span>
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
              <span>{pressItem ? 'Save Changes' : 'Publish Press Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
