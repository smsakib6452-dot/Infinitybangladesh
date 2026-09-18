import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Share2, Copy, Check, X, Facebook, MessageSquare, Twitter, Linkedin } from 'lucide-react';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  path?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url: propsUrl,
  path
}) => {
  const { isBn } = useLanguage();
  const [copied, setCopied] = useState(false);

  const url = propsUrl || (path ? (typeof window !== 'undefined' ? `${window.location.origin}${path}` : `https://infinitybangladesh.vercel.app${path}`) : (typeof window !== 'undefined' ? window.location.href : 'https://infinitybangladesh.vercel.app'));

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-[#25D366] hover:bg-[#20bd5a]',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#095196]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-black hover:bg-neutral-800',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE3D9] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAF7F2]">
          <div className="flex items-center gap-2 text-slate-800 font-display">
            <Share2 className="w-5 h-5 text-[#006A4E]" />
            <h3 className="font-extrabold text-base">
              {isBn ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share on Social Media'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-500 line-clamp-2 italic">
            "{title}"
          </p>

          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-white text-xs sm:text-sm font-bold transition-transform active:scale-95 shadow-sm ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {isBn ? 'ওয়েব লিঙ্ক কপি করুন' : 'Copy Direct Web Link'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl px-3.5 py-2 text-xs text-slate-600 truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-2xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
