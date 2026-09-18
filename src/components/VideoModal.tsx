import React, { useState, useEffect } from 'react';
import { X, Play, Video, AlertCircle, Check, Smartphone, Monitor } from 'lucide-react';
import { VideoItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { detectAndNormalizeMedia, DEFAULT_VIDEO_THUMBNAIL, isPortraitVideo } from '../lib/utils/mediaHelper';
import { DateInput } from './DateInput';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoToEdit?: VideoItem | null;
  onSave: (videoData: Omit<VideoItem, 'id'> | VideoItem) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoToEdit,
  onSave
}) => {
  const { isBn } = useLanguage();

  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descBn, setDescBn] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('Relief Campaigns');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '9/16'>('16/9');
  const [isShorts, setIsShorts] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Reset or populate fields when modal opens/changes
  useEffect(() => {
    if (videoToEdit) {
      setTitleEn(typeof videoToEdit.title === 'string' ? videoToEdit.title : (videoToEdit.title?.en || ''));
      setTitleBn(typeof videoToEdit.title === 'string' ? videoToEdit.title : (videoToEdit.title?.bn || ''));
      setDescEn(typeof videoToEdit.description === 'string' ? videoToEdit.description : (videoToEdit.description?.en || ''));
      setDescBn(typeof videoToEdit.description === 'string' ? videoToEdit.description : (videoToEdit.description?.bn || ''));
      setVideoUrl(videoToEdit.videoUrl || '');
      setCategory(videoToEdit.category || 'Relief Campaigns');
      setDuration(videoToEdit.duration || '');
      setDate(videoToEdit.date || new Date().toISOString().split('T')[0]);
      setStatus((videoToEdit.status as 'published' | 'draft') || 'published');
      setIsFeatured(Boolean(videoToEdit.isFeatured));
      setCustomThumbnail(videoToEdit.thumbnailUrl || '');
      const portrait = isPortraitVideo(videoToEdit);
      setAspectRatio(portrait ? '9/16' : '16/9');
      setIsShorts(portrait);
      setDisplayOrder(videoToEdit.displayOrder || 1);
    } else {
      setTitleEn('');
      setTitleBn('');
      setDescEn('');
      setDescBn('');
      setVideoUrl('');
      setCategory('Relief Campaigns');
      setDuration('3:30');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('published');
      setIsFeatured(false);
      setCustomThumbnail('');
      setAspectRatio('16/9');
      setIsShorts(false);
      setDisplayOrder(1);
    }
  }, [videoToEdit, isOpen]);

  // Auto-detect aspect ratio when videoUrl changes
  useEffect(() => {
    if (!videoToEdit && videoUrl.trim()) {
      const det = detectAndNormalizeMedia(videoUrl.trim());
      if (det.isValid) {
        setAspectRatio(det.aspectRatio);
        setIsShorts(det.isShorts);
      }
    }
  }, [videoUrl, videoToEdit]);

  if (!isOpen) return null;

  const detection = detectAndNormalizeMedia(videoUrl.trim());
  const effectiveThumbnail = customThumbnail.trim() || detection.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL;
  const isPortraitMode = aspectRatio === '9/16' || isShorts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    const finalTitle = {
      en: titleEn.trim() || (isBn ? (titleBn.trim() || 'Field Documentation Video') : 'Field Documentation Video'),
      bn: titleBn.trim() || (titleEn.trim() || 'মাঠপর্যায়ের তথ্যচিত্র')
    };

    const finalDesc = {
      en: descEn.trim() || 'Team Infinity official field drive video footage.',
      bn: descBn.trim() || 'টিম ইনফিনিটি অফিশিয়াল মানবিক কার্যক্রমের ভিডিও চিত্র।'
    };

    const payload = {
      title: finalTitle,
      description: finalDesc,
      videoUrl: detection.originalUrl || videoUrl.trim(),
      embedUrl: detection.embedUrl || '',
      thumbnailUrl: effectiveThumbnail,
      platform: detection.platform === 'youtube' ? 'youtube' : detection.platform === 'facebook' ? 'facebook' : 'custom',
      duration: duration.trim() || (isPortraitMode ? 'Shorts' : 'Video'),
      date: date.trim() || new Date().toISOString().split('T')[0],
      category,
      status,
      isFeatured,
      aspectRatio: isPortraitMode ? '9/16' : '16/9',
      isShorts: isPortraitMode,
      displayOrder: Number(displayOrder) || 1,
      sourceType: detection.type === 'youtube' ? 'youtube' : 'url'
    };

    if (videoToEdit && videoToEdit.id) {
      onSave({
        ...videoToEdit,
        ...payload
      });
    } else {
      onSave(payload);
    }

    onClose();
  };

  const CATEGORIES = [
    'Relief Campaigns',
    'Volunteer Drives',
    'Community Impact',
    'Field Drives',
    'Youth Leadership',
    'Ramadan & Eid',
    'Winter Warmth',
    'Emergency Flood Relief'
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 my-8 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#FAF7F2] border-b border-[#EAE3D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#006A4E] text-white flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">
                {videoToEdit
                  ? (isBn ? 'ভিডিও তথ্য সম্পাদনা' : 'Edit Video Details')
                  : (isBn ? 'নতুন ভিডিও / শর্টস প্রকাশ করুন' : 'Publish New Video or Shorts')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isBn
                  ? 'ল্যান্ডস্কেপ (১৬:৯) এবং পোর্ট্রেট (৯:১৬ ইউটিউব শর্টস ও রিলস) উভয়ের জন্য অটো প্লেয়ার সাপোর্ট।'
                  : 'Full dynamic support for Landscape (16:9) and Portrait (9:16 Shorts & Reels).'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Video URL Input */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">
              {isBn ? 'ভিডিও লিংক (YouTube / Shorts / Facebook / Reel / Direct URL) *' : 'Video URL (YouTube / Shorts / Facebook / Reel / Direct URL) *'}
            </label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtube.com/shorts/..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl font-mono text-xs focus:outline-none focus:border-[#006A4E] focus:bg-white transition-colors"
            />
            <p className="text-[10px] text-slate-500">
              Auto-detects <code className="font-mono text-[#006A4E]">youtube.com/shorts/...</code>, <code className="font-mono text-[#006A4E]">/watch?v=...</code>, <code className="font-mono text-[#006A4E]">youtu.be/...</code>, and Facebook Reels.
            </p>
          </div>

          {/* Aspect Ratio & Format Orientation Switcher */}
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-2">
            <label className="block font-bold text-slate-800">
              {isBn ? 'ভিডিও ফরম্যাট ও অ্যাসপেক্ট রেশিও (Aspect Ratio):' : 'Video Format & Aspect Ratio:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAspectRatio('16/9');
                  setIsShorts(false);
                }}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isPortraitMode
                    ? 'bg-[#006A4E] text-white shadow-warm-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Landscape (16:9 Standard)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAspectRatio('9/16');
                  setIsShorts(true);
                }}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPortraitMode
                    ? 'bg-[#006A4E] text-white shadow-warm-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Portrait (9:16 Shorts / Reel)</span>
              </button>
            </div>
          </div>

          {/* Real-time Detection & Preview Box */}
          {videoUrl.trim() && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              {detection.isValid ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Detected: {detection.platform.toUpperCase()} ({isPortraitMode ? 'Portrait 9:16 Shorts/Reel' : 'Landscape 16:9 Video'})
                    </span>
                    {detection.videoId && (
                      <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        ID: {detection.videoId}
                      </span>
                    )}
                  </div>

                  {/* Visual Preview */}
                  <div className={`grid gap-3 pt-1 ${isPortraitMode ? 'grid-cols-1 sm:grid-cols-2 place-items-center' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {/* Thumbnail Preview */}
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-500 self-start">Thumbnail Preview:</span>
                      <div className={`rounded-xl overflow-hidden bg-slate-950 border border-slate-200 relative ${isPortraitMode ? 'aspect-[9/16] w-36 max-h-56' : 'aspect-video w-full'}`}>
                        <img
                          src={effectiveThumbnail}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = DEFAULT_VIDEO_THUMBNAIL;
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                    </div>

                    {/* Embed Player Preview */}
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-500 self-start">Live Embed Player Preview:</span>
                      <div className={`rounded-xl overflow-hidden bg-black border border-slate-200 ${isPortraitMode ? 'aspect-[9/16] w-36 max-h-56' : 'aspect-video w-full'}`}>
                        {detection.embedUrl ? (
                          <iframe
                            src={detection.embedUrl}
                            title="Preview"
                            className="w-full h-full border-0 object-contain"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 text-[11px]">
                            Preview not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{detection.errorMessage || 'Please enter a valid YouTube or Facebook video URL.'}</span>
                </div>
              )}
            </div>
          )}

          {/* Video Title (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Video Title (English) *</label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. Winter Clothes Distribution in Hathazari"
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">ভিডিও শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={titleBn}
                onChange={e => setTitleBn(e.target.value)}
                placeholder="যেমন: হাটহাজারীতে শীতবস্ত্র বিতরণ কার্যক্রম"
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali focus:outline-none focus:border-[#006A4E] focus:bg-white"
              />
            </div>
          </div>

          {/* Category & Duration & Date & Sequence Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Duration (e.g. 0:45 / 3:30)</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder={isPortraitMode ? 'Shorts / 0:59' : '3:45'}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono focus:outline-none focus:border-[#006A4E]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Publication Date</label>
              <DateInput
                value={date}
                onChange={(val) => setDate(val)}
                isBn={isBn}
                minYear={2015}
                maxYear={new Date().getFullYear() + 2}
                showQuickToday
                compact
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">{isBn ? 'প্রদর্শন ক্রম (ক্রমিক #)' : 'Display Order (#)'}</label>
              <input
                type="number"
                min={1}
                value={displayOrder}
                onChange={e => setDisplayOrder(parseInt(e.target.value) || 1)}
                placeholder="1, 2, 3..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono font-bold text-[#006A4E] focus:outline-none focus:border-[#006A4E] focus:bg-white"
              />
            </div>
          </div>

          {/* Description (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Description (English)</label>
              <textarea
                rows={2}
                value={descEn}
                onChange={e => setDescEn(e.target.value)}
                placeholder="Brief summary of the video coverage..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs focus:outline-none focus:border-[#006A4E] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">বিবরণ (বাংলা)</label>
              <textarea
                rows={2}
                value={descBn}
                onChange={e => setDescBn(e.target.value)}
                placeholder="ভিডিওর বিষয়বস্তু সংক্ষেপে লিখুন..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-bengali focus:outline-none focus:border-[#006A4E] focus:bg-white"
              />
            </div>
          </div>

          {/* Status & Featured */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-700">Publication Status:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    status === 'published'
                      ? 'bg-[#006A4E] text-white shadow-warm-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Published (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    status === 'draft'
                      ? 'bg-amber-600 text-white shadow-warm-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Draft (Hidden)
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#006A4E] rounded border-slate-300 focus:ring-[#006A4E]"
              />
              <span className="font-bold text-slate-800">Feature on Homepage / Highlight</span>
            </label>
          </div>

          {/* Custom Thumbnail URL override (Optional) */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Custom Thumbnail Image URL (Optional - Auto-extracted by default):
            </label>
            <input
              type="text"
              value={customThumbnail}
              onChange={e => setCustomThumbnail(e.target.value)}
              placeholder="https://... (Leave blank to use official YouTube HQ thumbnail)"
              className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl text-xs font-mono focus:outline-none focus:border-[#006A4E]"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!videoUrl.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#006A4E] hover:bg-[#00523C] disabled:bg-slate-300 text-white text-xs font-bold shadow-warm-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{videoToEdit ? 'Save Changes' : 'Publish Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

