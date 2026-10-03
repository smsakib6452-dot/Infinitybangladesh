import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  HelpCircle,
  Phone,
  ArrowRight,
  FileText,
  Heart,
  Droplet,
  Users,
  RotateCcw,
  Search,
  Building,
  Receipt,
  ShieldCheck,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from '../context/RouterContext';
import { PageRoute } from '../types';

interface BotActionCard {
  title: string;
  subtitle: string;
  badge?: string;
  pageRoute?: PageRoute;
  slug?: string | null;
  subSlug?: string | null;
  externalUrl?: string;
  phoneCall?: string;
  buttonLabel: string;
  variant?: 'emerald' | 'crimson' | 'amber' | 'slate';
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionCard?: BotActionCard;
  quickPrompts?: string[];
}

interface KnowledgeIntent {
  id: string;
  keywords: string[];
  responseBn: string;
  responseEn: string;
  actionCard?: BotActionCard;
}

const KNOWLEDGE_BASE: KnowledgeIntent[] = [
  // 1. Volunteer Form & Certification
  {
    id: 'volunteer',
    keywords: [
      'volunteer', 'স্বেচ্ছাসেবক', 'ভলান্টিয়ার', 'ভলান্টিয়ার', 'ফর্ম', 'আবেদন', 'join', 'apply', 'form',
      'shocchasebok', 'abedon', 'membership', 'সদস্য', 'সনদ', 'সার্টিফিকেট', 'certificate', 'যুক্ত'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশে স্বেচ্ছাসেবক হিসেবে যুক্ত হতে যেকোনো সহানুভূতিশীল শিক্ষার্থী বা তরুণ আমাদের ৮-ধাপের অনলাইন ফর্ম পূরণ করে আবেদন করতে পারেন। আবেদন সফলভাবে জমা হওয়ার পর ডাটাবেজ ও গুগল ড্রাইভে সংরক্ষিত হয় এবং মাঠপর্যায়ের ক্যাম্পেইনে অংশ নেওয়ার পর প্রাতিষ্ঠানিক অভিজ্ঞতা সনদপত্র (Certificate of Recognition) প্রদান করা হয়।',
    responseEn: 'Any compassionate student or youth can apply to join Infinity Bangladesh via our 8-step online application form. Applications are synchronized with Google Drive and internal records, and volunteers receive an official Certificate of Recognition after campaign participation.',
    actionCard: {
      title: 'স্বেচ্ছাসেবক আবেদন ফর্ম (৮ ধাপ)',
      subtitle: 'অনলাইন ফর্ম পূরণ করুন — সরাসরি ডাটাবেজ ও গুগল ড্রাইভে সংরক্ষিত হবে',
      badge: '৮-ধাপের ফর্ম',
      pageRoute: 'volunteer',
      buttonLabel: 'স্বেচ্ছাসেবক ফর্ম পূরণ করুন',
      variant: 'emerald'
    }
  },

  // 2. Emergency Blood Request
  {
    id: 'blood-emergency',
    keywords: [
      'রক্ত লাগবে', 'জরুরি রক্ত', 'রক্ত প্রয়োজন', 'রক্ত প্রয়োজন', 'ব্লাড', 'blood request', 'need blood',
      'rokto lagbe', 'emergency blood', 'রোগীর জন্য রক্ত', 'প্লাটিলেট', 'ব্লাড লাগবে'
    ],
    responseBn: 'জরুরি রক্তের জন্য আপনি সরাসরি আমাদের "জরুরি রক্তের আবেদন" ফর্মটি পূরণ করে রিকুয়েস্ট পোস্ট করতে পারেন। আমাদের সমন্বয়ক ও রক্তদাতারা তাৎক্ষণিক যোগাযোগ করবেন। এ ছাড়া আমাদের ২৪/৭ জরুরি ব্লাড হটলাইনে (01886-224424) সরাসরি কল করতে পারেন।',
    responseEn: 'For urgent blood requirements, post an instant request via our Emergency Blood Request form. Our coordinators and nearby donors respond immediately. You can also dial our 24/7 hotline at 01886-224424.',
    actionCard: {
      title: 'জরুরি রক্তের আবেদন ফর্ম',
      subtitle: 'রক্তের গ্রুপ ও জেলা দিয়ে তাৎক্ষণিক রিকুয়েস্ট পোস্ট করুন',
      badge: 'জরুরি সেবা',
      pageRoute: 'blood-donation/emergency-request',
      phoneCall: '01886224424',
      buttonLabel: 'জরুরি রক্তের ফর্ম পূরণ করুন',
      variant: 'crimson'
    }
  },

  // 3. Register as Blood Donor
  {
    id: 'blood-donor-register',
    keywords: [
      'রক্ত দিতে চাই', 'রক্তদাতা হতে চাই', 'ডোনার হতে চাই', 'donor registration', 'become donor',
      'rokto dibo', 'donor form', 'রক্তদান ফর্ম', 'রক্তদাতা নিবন্ধন'
    ],
    responseBn: 'রক্তদাতা হিসেবে তালিকাভুক্ত হতে আমাদের রক্তদান পেজের "রক্তদাতা নিবন্ধন" ফর্মটি পূরণ করুন। ১৮ বছর বা তার বেশি বয়সী এবং ন্যূনতম ৪৮ কেজি ওজনের যে কেউ রক্তদাতা হতে পারেন। আপনার তথ্যের সর্বোচ্চ গোপনীয়তা রক্ষা করা হয় এবং চাইলে যেকোনো সময় প্রোফাইল কুলডাউনে রাখা যায়।',
    responseEn: 'To register as a life-saving blood donor, complete our Blood Donor Registration form. Any healthy individual aged 18+ weighing at least 48kg can register. Your privacy is safeguarded with full pause and cooldown controls.',
    actionCard: {
      title: 'রক্তদাতা হিসেবে নিবন্ধন করুন',
      subtitle: 'আপনার রক্তদানে বেঁচে যেতে পারে একটি মূল্যবান জীবন',
      badge: 'ব্লাড ব্যাংক',
      pageRoute: 'blood-donation/become-donor',
      buttonLabel: 'রক্তদাতা ফর্ম পূরণ করুন',
      variant: 'crimson'
    }
  },

  // 4. Blood Donor Search / Directory
  {
    id: 'blood-find',
    keywords: [
      'রক্তদাতা খুঁজছি', 'রক্তদাতা তালিকা', 'রক্তদাতা ডিরেক্টরি', 'ব্লাড গ্রুপ', 'donor search', 'find donor',
      'blood list', 'a+', 'b+', 'o+', 'ab+', 'a-', 'b-', 'o-', 'ab-', 'রক্তের গ্রুপ'
    ],
    responseBn: 'আমাদের ওয়েবসাইটের "ব্লাড ডোনেশন" ডিরেক্টরিতে গিয়ে আপনার কাঙ্ক্ষিত রক্তের গ্রুপ এবং জেলা নির্বাচন করলেই সক্রিয় ও ভেরিফাইড রক্তদাতাদের তালিকা পেয়ে যাবেন। সরাসরি তাদের কল অথবা এসএমএস করা সম্ভব।',
    responseEn: 'Browse our Blood Donation Directory, filter by blood group and district, and contact verified active donors directly via phone or SMS.',
    actionCard: {
      title: 'রক্তদাতা অনুসন্ধান ডিরেক্টরি',
      subtitle: '৬৪ জেলার গ্রুপভিত্তিক সক্রিয় রক্তদাতাদের খুঁজুন',
      badge: 'ডিরেক্টরি',
      pageRoute: 'blood-donation/find-donor',
      buttonLabel: 'রক্তদাতা ডিরেক্টরি দেখুন',
      variant: 'crimson'
    }
  },

  // 5. Donate / bKash / Nagad / Bank
  {
    id: 'donate',
    keywords: [
      'দান', 'টাকা', 'অনুদান', 'বিকাশ', 'নগদ', 'ব্যাংক', 'donate', 'donation', 'money', 'bkash',
      'nagad', 'bank', 'send money', 'taka dibo', 'sahajjo', 'সাহায্য', 'অনুদানের নিয়ম', 'অর্থ'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশ কঠোর "১০০% চ্যারিটি মডেল" (100% Charity Model) অনুসরণ করে। অর্থাৎ সাধারণ মানুষের অনুদানের প্রতিটি টাকা সরাসরি মাঠপর্যায়ের সুবিধাবঞ্চিত মানুষের কল্যাণে ব্যয় হয় (প্রশাসনিক ব্যয় ট্রাস্টি ও পরিচালকদের নিজস্ব তহবিল থেকে দেওয়া হয়)। আপনি বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে আপনার পছন্দসই যেকোনো পরিমাণ অর্থ অনুদান দিতে পারেন।',
    responseEn: 'Infinity Bangladesh operates under a strict 100% Charity Model — every penny donated by the public directly reaches beneficiaries with zero administrative deductions. You can donate any custom amount securely via bKash, Nagad, or direct Bank transfer.',
    actionCard: {
      title: 'অনলাইন অনুদান পোর্টাল (বিকাশ / নগদ / ব্যাংক)',
      subtitle: '১০০% চ্যারিটি নীতিতে আপনার ইচ্ছামতো যেকোনো পরিমাণ অর্থ দান করুন',
      badge: '১০০% চ্যারিটি',
      pageRoute: 'donate',
      buttonLabel: 'অনুদান পেজে যান',
      variant: 'emerald'
    }
  },

  // 6. Audit & Transparency
  {
    id: 'transparency',
    keywords: [
      'অডিট', 'হিসাব', 'খরচ', 'স্বচ্ছতা', 'রিপোর্ট', 'টাকার হিসাব', 'audit', 'transparency', 'expense',
      'financial', 'report', 'voucher', 'hisab', 'ভাউচার', 'আর্থিক বিবরণী'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশের প্রতিটি ক্যাম্পেইনের আয়-ব্যয়ের হিসাব ও বাৎসরিক নিরপেক্ষ চার্টার্ড অ্যাকাউন্ট্যান্ট অডিট রিপোর্ট সবার জন্য উন্মুক্ত। আমাদের "স্বচ্ছতা ও অডিট" পেজে প্রতি বছরের নিরপেক্ষ অডিট প্রতিবেদন এবং খরচের ভাউচার পিডিএফ আকারে ডাউনলোডের জন্য সংরক্ষিত রয়েছে।',
    responseEn: 'Every financial intake and expenditure at Infinity Bangladesh is audited by independent Chartered Accountants. You can download and inspect annual audit reports, balance sheets, and expense vouchers on our Transparency page.',
    actionCard: {
      title: 'বার্ষিক অডিট ও আর্থিক প্রতিবেদন',
      subtitle: 'নিরপেক্ষ অডিট রিপোর্ট ও ভাউচার বিবরণী উন্মুক্তভাবে দেখুন',
      badge: 'স্বচ্ছতা নিশ্চিত',
      pageRoute: 'transparency',
      buttonLabel: 'স্বচ্ছতা ও অডিট পেজ',
      variant: 'amber'
    }
  },

  // 7. Leadership & Committees
  {
    id: 'leadership',
    keywords: [
      'কমিটি', 'সভাপতি', 'সাধারণ সম্পাদক', 'নেতৃত্ব', 'পরিচালক', 'উপদেষ্টা', 'committee', 'president',
      'general secretary', 'leadership', 'board', 'executive', 'কার্যনির্বাহী', 'স্থায়ী কমিটি', 'উপদেষ্টা পরিষদ'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশ একটি গণতান্ত্রিক ও গঠনতান্ত্রিক কাঠামোয় পরিচালিত সংগঠন। সংগঠনের প্রতিষ্ঠাতা সভাপতি, সাধারণ সম্পাদক, কেন্দ্রীয় কার্যনির্বাহী পরিষদ, স্থায়ী সাব-কমিটি এবং উপদেষ্টা পরিষদের পূর্ণাঙ্গ পরিচিতি ও দায়িত্ব আমাদের "কমিটি ও নেতৃত্ব" পেজে সাজানো রয়েছে।',
    responseEn: 'Infinity Bangladesh is democratically governed. Detailed profiles and operational portfolios of our President, General Secretary, Executive Committee, Standing Committees, and Advisory Board are available on our Leadership page.',
    actionCard: {
      title: 'কার্যনির্বাহী পরিষদ ও নেতৃত্ব পরিচিতি',
      subtitle: 'সংগঠনের বর্তমান কার্যনির্বাহী পরিষদ, উপদেষ্টা ও স্থায়ী কমিটি',
      badge: 'নেতৃত্ব কাঠামো',
      pageRoute: 'team/executive-committee',
      buttonLabel: 'কমিটি ও নেতৃত্ব দেখুন',
      variant: 'emerald'
    }
  },

  // 8. Contact & Helpline
  {
    id: 'contact',
    keywords: [
      'যোগাযোগ', 'ফোন', 'ঠিকানা', 'অফিস', 'হটলাইন', 'ইমেইল', 'contact', 'phone', 'address', 'office',
      'helpline', 'email', 'thikana', 'feni', 'ফেনী', 'কোথায়', 'সরাসরি কথা'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশের কেন্দ্রীয় সমন্বয় কার্যালয় ফেনী, বাংলাদেশে অবস্থিত। যেকোনো প্রশ্ন, সহযোগিতা বা ক্যাম্পেইনের তথ্যের জন্য আমাদের ২৪/৭ হটলাইন 01886-224424 ও 01726-224424 নম্বরে সরাসরি কল করতে পারেন অথবা info@infinitybangladesh.org-এ ইমেইল পাঠাতে পারেন। অনলাইনে ফর্ম পূরণ করেও বার্তা পাঠাতে পারেন।',
    responseEn: 'Infinity Bangladesh is headquartered in Feni, Bangladesh. You can contact our 24/7 helplines at 01886-224424 / 01726-224424, email info@infinitybangladesh.org, or send an inquiry via our Contact page form.',
    actionCard: {
      title: 'যোগাযোগ ও সরাসরি সাপোর্ট কেন্দ্র',
      subtitle: 'প্রধান কার্যালয়: ফেনী, বাংলাদেশ | হটলাইন: 01886-224424',
      badge: '২৪/৭ সাপোর্ট',
      pageRoute: 'contact',
      phoneCall: '01886224424',
      buttonLabel: 'যোগাযোগ পেজে যান',
      variant: 'slate'
    }
  },

  // 9. Campaigns & Relief
  {
    id: 'campaigns',
    keywords: [
      'ক্যাম্পেইন', 'ত্রাণ', 'শীতবস্ত্র', 'বন্যা', 'চিকিৎসা', 'সাহায্য', 'campaign', 'relief', 'flood',
      'winter', 'aid', 'জরুরি সেবা', 'চলমান প্রকল্প'
    ],
    responseBn: 'আমাদের চলমান ক্যাম্পেইনগুলোর মধ্যে রয়েছে জরুরি বন্যা ও দুর্যোগকালীন ত্রাণ কার্যক্রম, শীতার্ত পরিবারের জন্য শীতবস্ত্র ও খাদ্য সহায়তা, রক্তের জরুরি জোগান এবং সুবিধাবঞ্চিত শিক্ষার্থীদের জন্য শিক্ষা উপকরণ প্রদান। প্রতিটি ক্যাম্পেইনের ফান্ডিং অগ্রগতি ও বিস্তারিত তথ্য আমাদের ক্যাম্পেইন পেজে পাওয়া যায়।',
    responseEn: 'Our active relief drives encompass flood disaster response, winter relief packages, emergency medical and blood dispatch, and underprivileged student education kits. Detailed funding progress is tracked live on our Campaigns page.',
    actionCard: {
      title: 'চলমান মানবিক ক্যাম্পেইনসমূহ',
      subtitle: 'মাঠপর্যায়ের জরুরি ত্রাণ, খাদ্য ও শীতবস্ত্র বিতরণ কার্যক্রম',
      badge: 'ক্যাম্পেইন ট্র্যাকার',
      pageRoute: 'campaigns',
      buttonLabel: 'সকল ক্যাম্পেইন দেখুন',
      variant: 'emerald'
    }
  },

  // 10. Long-term Programs
  {
    id: 'programs',
    keywords: [
      'প্রোগ্রাম', 'কার্যক্রম', 'শিক্ষা', 'স্বাস্থ্য', 'শিশু', 'বৃক্ষরোপণ', 'পানি', 'program',
      'education', 'health', 'water', 'tree', 'দীর্ঘমেয়াদী'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশের স্থায়ী উন্নয়ন কর্মসূচিগুলোর মধ্যে রয়েছে: সুবিধাবঞ্চিত শিশুদের প্রাতিষ্ঠানিক শিক্ষা নিশ্চিতকরণ, নিরাপদ বিশুদ্ধ পানির নলকূপ স্থাপন, ফ্রি মেডিকেল ক্যাম্প এবং দেশব্যাপী বৃক্ষরোপণ কর্মসূচি।',
    responseEn: 'Infinity Bangladesh runs sustainable development programs including Marginal Child Education, Clean Drinking Water Wells, Free Community Healthcare, and Nationwide Tree Plantation.',
    actionCard: {
      title: 'দীর্ঘমেয়াদী সামাজিক উন্নয়ন প্রোগ্রাম',
      subtitle: 'শিক্ষা, স্বাস্থ্যসেবা ও পরিবেশ সংরক্ষণের টেকসই উদ্যোগ',
      badge: 'স্থায়ী কর্মসূচি',
      pageRoute: 'programs',
      buttonLabel: 'প্রোগ্রামসমূহ দেখুন',
      variant: 'emerald'
    }
  },

  // 11. Media Coverage & News
  {
    id: 'media',
    keywords: [
      'মিডিয়া', 'সংবাদ', 'পত্রিকা', 'টিভি', 'news', 'media', 'press', 'coverage', 'tv', 'খবর', 'জার্নাল'
    ],
    responseBn: 'আমাদের মানবিক কার্যক্রমসমূহ জাতীয় দৈনিক পত্রিকা, অনলাইন নিউজ পোর্টাল এবং স্যাটেলাইট টেলিভিশন চ্যানেলে নিয়মিত কভার করা হয়েছে। প্রেস রিলিজ ও সংবাদ প্রতিবেদনগুলো আমাদের মিডিয়া কভারেজ পেজে দেখতে পারেন।',
    responseEn: 'Our field relief operations have been featured widely across national print, digital, and TV news channels. Explore press releases and news coverage on our Media page.',
    actionCard: {
      title: 'মিডিয়া কভারেজ ও প্রেস রিপোর্ট',
      subtitle: 'জাতীয় গণমাধ্যমে প্রকাশিত ইনফিনিটি বাংলাদেশের সংবাদ',
      badge: 'গণমাধ্যম',
      pageRoute: 'media-coverage',
      buttonLabel: 'মিডিয়া কভারেজ দেখুন',
      variant: 'slate'
    }
  },

  // 12. Photo Gallery & Videos
  {
    id: 'gallery',
    keywords: [
      'ছবি', 'ভিডিও', 'গ্যালারি', 'ইভেন্ট', 'photo', 'video', 'gallery', 'chobi', 'ভিডিও গ্যালারি'
    ],
    responseBn: 'আমাদের মাঠপর্যায়ের ক্যাম্পেইন, বন্যা ত্রাণ বিতরণ, রক্তদান কর্মসূচি ও স্বেচ্ছাসেবী কর্মকাণ্ডের বাস্তব স্থিরচিত্র ও ভিডিও আমাদের ছবি ও ভিডিও গ্যালারিতে সংরক্ষিত রয়েছে।',
    responseEn: 'Browse high-resolution photographs and documentary reels of our field relief, volunteer efforts, and community programs in our visual Gallery and Video archive.',
    actionCard: {
      title: 'মাঠপর্যায়ের স্থিরচিত্র ও ভিডিও গ্যালারি',
      subtitle: 'বাস্তব কার্যক্রমের প্রামাণ্য ছবি ও ডকুমেন্টারি ভিডিও',
      badge: 'গ্যালারি',
      pageRoute: 'gallery',
      buttonLabel: 'গ্যালারি ঘুরে দেখুন',
      variant: 'slate'
    }
  },

  // 13. FAQ / Knowledge Bank
  {
    id: 'faq',
    keywords: [
      'faq', 'প্রশ্ন', 'জিজ্ঞাসা', 'question', 'help', 'জ্ঞানকোষ', 'জিজ্ঞাসাবাদ'
    ],
    responseBn: 'সংগঠনের আদর্শ, ১০০% চ্যারিটি মডেল, স্বেচ্ছাসেবক সনদ, অডিট যাচাই, রক্তদান এবং অনুদান সংক্রান্ত সাধারণ সকল প্রশ্নের উত্তর আমাদের FAQ পেজে বিস্তারিত সাজানো রয়েছে।',
    responseEn: 'Explore our comprehensive organizational FAQ page covering governance, the 100% charity model, volunteer certificates, financial audits, and donation guidelines.',
    actionCard: {
      title: 'সংগঠনের সার্বিক প্রশ্নোত্তর ব্যাংক',
      subtitle: 'সকল সাধারণ জিজ্ঞাসার পূর্ণাঙ্গ বিশ্লেষণ ও উত্তর',
      badge: 'প্রশ্নোত্তর',
      pageRoute: 'faq',
      buttonLabel: 'FAQ পেজে যান',
      variant: 'amber'
    }
  }
];

export const InfinityAgentBot: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { navigate } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  const initialWelcomeMessage = useMemo<ChatMessage>(() => {
    return {
      id: 'welcome',
      sender: 'bot',
      text: isBn
        ? 'আসসালামু আলাইকুম! আমি ইনফিনিটি বাংলাদেশের স্মার্ট সহকারী (AI Agent)। সংগঠনের যেকোনো তথ্য, ক্যাম্পেইন, ১০০% চ্যারিটি মডেল, অডিট রিপোর্ট, স্বেচ্ছাসেবী আবেদন ফর্ম কিংবা জরুরি রক্তের প্রয়োজনে আমি আপনাকে তাৎক্ষণিক সহায়তা করতে পারি।'
        : 'Welcome! I am the Infinity Bangladesh AI Assistant. Ask me anything about our mission, 100% charity model, volunteer application forms, emergency blood, campaigns, or audit reports.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickPrompts: [
        isBn ? '🩸 জরুরি রক্ত প্রয়োজন' : '🩸 Need Emergency Blood',
        isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Application Form',
        isBn ? '💳 অনুদান দেওয়ার নিয়ম' : '💳 How to Donate',
        isBn ? '📑 অডিট রিপোর্ট ও হিসাব' : '📑 Audit & Transparency',
        isBn ? '👥 বর্তমান নেতৃত্ব ও কমিটি' : '👥 Executive Committee',
        isBn ? '📞 হেল্পলাইন ও অফিস' : '📞 Helpline & Office'
      ]
    };
  }, [isBn]);

  // Load initial welcome message once on mount or language switch
  useEffect(() => {
    setMessages([initialWelcomeMessage]);
  }, [initialWelcomeMessage]);

  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, scrollToBottom]);

  // Natural Language & Intent Matcher
  const matchIntent = (query: string): KnowledgeIntent | null => {
    const cleanQuery = query.toLowerCase().trim();

    // Check for exact keyword hits
    for (const intent of KNOWLEDGE_BASE) {
      for (const kw of intent.keywords) {
        if (cleanQuery.includes(kw.toLowerCase())) {
          return intent;
        }
      }
    }

    // Secondary heuristic checks
    if (cleanQuery.includes('রক্ত') || cleanQuery.includes('blood') || cleanQuery.includes('rokto')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-emergency') || null;
    }
    if (cleanQuery.includes('টাকা') || cleanQuery.includes('দান') || cleanQuery.includes('donate')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'donate') || null;
    }
    if (cleanQuery.includes('ফর্ম') || cleanQuery.includes('form') || cleanQuery.includes('যুক্ত')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'volunteer') || null;
    }

    return null;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart thinking delay
    setTimeout(() => {
      const matched = matchIntent(query);

      let botReply: ChatMessage;

      if (matched) {
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: isBn ? matched.responseBn : matched.responseEn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: matched.actionCard,
          quickPrompts: [
            isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Form',
            isBn ? '🩸 জরুরি রক্ত সহায়তা' : '🩸 Blood Assistance',
            isBn ? '💳 অনুদান পোর্টাল' : '💳 Donation Portal'
          ]
        };
      } else {
        // Courteous fallback with quick navigations
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: isBn
            ? 'আপনার প্রশ্নের সরাসরি সুনির্দিষ্ট উত্তর দিতে আমি সংশ্লিষ্ট তথ্যগুলো নিচে যুক্ত করেছি। আপনি সরাসরি যেকোনো ফর্ম পূরণ করতে পারেন অথবা জরুরি প্রয়োজনে আমাদের ২৪/৭ হেল্পলাইনে (01886-224424) সরাসরি কল দিতে পারেন।'
            : 'To best assist you, here are the direct access forms and navigators. You can also reach our 24/7 emergency coordinator helpline at 01886-224424 directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'যোগাযোগ ও সহায়তা ডেস্ক',
            subtitle: '২৪/৭ সার্বক্ষণিক হটলাইন: 01886-224424 | ইমেইল: info@infinitybangladesh.org',
            badge: 'হেল্পডেস্ক',
            pageRoute: 'contact',
            phoneCall: '01886224424',
            buttonLabel: 'যোগাযোগ পেজে যান',
            variant: 'slate'
          },
          quickPrompts: [
            isBn ? '🩸 জরুরি রক্ত প্রয়োজন' : '🩸 Emergency Blood',
            isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Application',
            isBn ? '💳 অনুদান দেওয়ার নিয়ম' : '💳 How to Donate'
          ]
        };
      }

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 400);
  };

  const handleActionClick = (card: BotActionCard) => {
    if (card.phoneCall) {
      window.location.href = `tel:${card.phoneCall}`;
      return;
    }
    if (card.externalUrl) {
      window.open(card.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (card.pageRoute) {
      navigate(card.pageRoute, card.slug, card.subSlug);
      // On mobile, close chat window so user sees the newly opened page immediately
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const resetChat = () => {
    setMessages([initialWelcomeMessage]);
    setInputValue('');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open Infinity AI Assistant"
          className="relative group p-4 rounded-3xl bg-gradient-to-tr from-[#006A4E] to-[#0F4C3A] text-white shadow-warm-xl border border-emerald-400/30 flex items-center justify-center cursor-pointer transition-all hover:shadow-[0_12px_30px_rgba(0,106,78,0.35)]"
        >
          {/* Active Pulse Ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
          </span>

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot-icon"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Bot className="w-6 h-6" />
                <span className="hidden md:inline font-bold text-xs tracking-wide pr-1">
                  {isBn ? 'ইনফিনিটি সহকারী' : 'AI Assistant'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Interactive Modal / Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[430px] h-[580px] max-h-[82vh] bg-white/95 backdrop-blur-xl rounded-3xl border border-[#EAE3D9] shadow-2xl flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#006A4E] to-[#0F4C3A] text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Bot className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight font-display">
                      {isBn ? 'ইনফিনিটি স্মার্ট সহকারী' : 'Infinity AI Navigator'}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/80 line-clamp-1">
                    {isBn ? 'সংগঠনের সকল তথ্য ও সরাসরি ফর্ম সহায়ক' : 'Official Portal Guide & Form Assistant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  title={isBn ? 'চ্যাট নতুন করে শুরু করুন' : 'Reset chat'}
                  className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Assistant"
                  className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FAF7F2] to-white text-xs sm:text-sm">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1.5`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-warm-xs ${
                        isBot
                          ? 'bg-white border border-[#EAE3D9] text-slate-800 rounded-tl-sm'
                          : 'bg-[#006A4E] text-white rounded-tr-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Action Card Attachment */}
                    {msg.actionCard && (
                      <div className="max-w-[92%] w-full mt-2 p-3.5 rounded-2xl bg-white border border-[#EAE3D9] shadow-warm-sm space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {msg.actionCard.badge && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                  msg.actionCard.variant === 'crimson'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : msg.actionCard.variant === 'amber'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-[#006A4E] border border-emerald-200'
                                }`}
                              >
                                {msg.actionCard.badge}
                              </span>
                            )}
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                              {msg.actionCard.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              {msg.actionCard.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleActionClick(msg.actionCard!)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-warm-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                              msg.actionCard.variant === 'crimson'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : msg.actionCard.variant === 'amber'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-[#006A4E] hover:bg-[#00523C] text-white'
                            }`}
                          >
                            <span>{msg.actionCard.buttonLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {msg.actionCard.phoneCall && (
                            <a
                              href={`tel:${msg.actionCard.phoneCall}`}
                              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Phone className="w-3 h-3 text-[#006A4E]" />
                              <span>হটলাইনে সরাসরি কল করুন ({msg.actionCard.phoneCall})</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Suggestions Chips */}
                    {msg.quickPrompts && msg.quickPrompts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-[95%]">
                        {msg.quickPrompts.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(chip)}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#EAE3D9] text-[11px] font-medium text-slate-700 hover:bg-[#FAF7F2] hover:text-[#006A4E] hover:border-[#006A4E]/40 transition-all shadow-warm-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white border border-[#EAE3D9] rounded-2xl rounded-tl-sm w-20 shadow-warm-xs">
                  <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#EAE3D9] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isBn
                        ? 'প্রশ্ন করুন (যেমন: রক্ত চাই, ভলান্টিয়ার ফর্ম, বিকাশ...)'
                        : 'Ask anything (e.g. need blood, volunteer form, donate)...'
                    }
                    className="w-full pl-3.5 pr-9 py-2.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006A4E] transition-all"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  aria-label="Send message"
                  className="p-2.5 rounded-2xl bg-[#006A4E] hover:bg-[#00523C] disabled:opacity-40 disabled:hover:bg-[#006A4E] text-white transition-all shadow-warm-xs cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Quick Bar */}
              <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#006A4E]" />
                  <span>{isBn ? 'ইনফিনিটি ইন্টেলিজেন্ট ইঞ্জিন' : 'Infinity AI Engine'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSendMessage(isBn ? 'হেল্পলাইন' : 'Helpline')}
                  className="hover:text-[#006A4E] cursor-pointer"
                >
                  {isBn ? '২৪/৭ সাপোর্ট: 01886-224424' : 'Helpline: 01886-224424'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
