import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
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
  quickPrompts?: string[];
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
      'রক্ত লাগবে', 'জরুরি রক্ত', 'রক্ত প্রয়োজন', 'রক্ত দরকার', 'blood request', 'need blood',
      'rokto lagbe', 'emergency blood', 'রোগীর জন্য রক্ত', 'প্লাটিলেট', 'ব্লাড লাগবে', 'জরুরি ব্লাড'
    ],
    responseBn: 'জরুরি রক্তের জন্য আপনি সরাসরি আমাদের "জরুরি রক্তের আবেদন" ফর্মটি পূরণ করে রিকুয়েস্ট পোস্ট করতে পারেন। আমাদের সমন্বয়ক ও রক্তদাতারা তাৎক্ষণিক যোগাযোগ করবেন। এ ছাড়া আমাদের ২৪/৭ জরুরি ব্লাড হটলাইনে (01839-008339) সরাসরি কল করতে পারেন।',
    responseEn: 'For urgent blood requirements, post an instant request via our Emergency Blood Request form. Our coordinators and nearby donors respond immediately. You can also dial our 24/7 hotline at 01839-008339.',
    actionCard: {
      title: 'জরুরি রক্তের আবেদন ফর্ম',
      subtitle: 'রক্তের গ্রুপ ও জেলা দিয়ে তাৎক্ষণিক রিকুয়েস্ট পোস্ট করুন',
      badge: 'জরুরি সেবা',
      pageRoute: 'blood-donation/emergency-request',
      phoneCall: '01839008339',
      buttonLabel: 'জরুরি রক্তের ফর্ম পূরণ করুন',
      variant: 'crimson'
    }
  },

  // 3. Register as Blood Donor
  {
    id: 'blood-donor-register',
    keywords: [
      'রক্ত দিতে চাই', 'রক্তদাতা হতে চাই', 'ডোনার হতে চাই', 'donor registration', 'become donor',
      'rokto dibo', 'donor form', 'রক্তদান ফর্ম', 'রক্তদাতা নিবন্ধন', 'ডোনার নিবন্ধন'
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
      'blood list', 'a+', 'b+', 'o+', 'ab+', 'a-', 'b-', 'o-', 'ab-', 'রক্তের গ্রুপ', 'ব্লাড ডোনার', 'ব্লাড ডোনেশন'
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
      'helpline', 'email', 'thikana', 'hathazari', 'chattogram', 'হাটহাজারী', 'চট্টগ্রাম', 'কোথায়', 'সরাসরি কথা'
    ],
    responseBn: 'ইনফিনিটি বাংলাদেশের কেন্দ্রীয় সমন্বয় কার্যালয় হাটহাজারী, চট্টগ্রাম, বাংলাদেশে অবস্থিত। যেকোনো প্রশ্ন, সহযোগিতা বা ক্যাম্পেইনের তথ্যের জন্য আমাদের ২৪/৭ হটলাইন 01839-008339 নম্বরে সরাসরি কল করতে পারেন অথবা smsakib6452@gmail.com-এ ইমেইল পাঠাতে পারেন। অনলাইনে ফর্ম পূরণ করেও বার্তা পাঠাতে পারেন।',
    responseEn: 'Infinity Bangladesh is headquartered in Hathazari, Chattogram, Bangladesh. You can contact our 24/7 helpline at 01839-008339, email smsakib6452@gmail.com, or send an inquiry via our Contact page form.',
    actionCard: {
      title: 'যোগাযোগ ও সরাসরি সাপোর্ট কেন্দ্র',
      subtitle: 'কেন্দ্রীয় কার্যালয়: হাটহাজারী, চট্টগ্রাম | হটলাইন: 01839-008339',
      badge: '২৪/৭ সাপোর্ট',
      pageRoute: 'contact',
      phoneCall: '01839008339',
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
        ? 'আসসালামু আলাইকুম! আমি Infi Robot — ইনফিনিটি বাংলাদেশের মানবিক এআই সহকারী। সংগঠনের যেকোনো তথ্য, ক্যাম্পেইন, ১০০% চ্যারিটি মডেল, অডিট রিপোর্ট, স্বেচ্ছাসেবী আবেদন ফর্ম কিংবা জরুরি রক্তের প্রয়োজনে আমি আপনাকে তাৎক্ষণিক সহায়তা করতে পারি।'
        : 'Welcome! I am Infi Robot — Infinity Bangladesh’s official humanitarian AI companion. Ask me anything about our mission, 100% charity model, volunteer application forms, emergency blood, campaigns, or audit reports.',
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

interface CommitteeMemberProfile {
  serial: number;
  nameBn: string;
  nameEn: string;
  positionBn: string;
  positionEn: string;
  category: 'presidential' | 'vicePresidential' | 'secretariat' | 'jointSecretariat' | 'organizing' | 'finance' | 'secretaries' | 'standing';
  aliases: string[];
}

const EXECUTIVE_COMMITTEE_2026: CommitteeMemberProfile[] = [
  { serial: 1, nameBn: 'মোঃ শহিদুল আলম সাকিব', nameEn: 'MD. SHAHIDUL ALAM SAKIB', positionBn: 'সভাপতি', positionEn: 'President', category: 'presidential', aliases: ['সাকিব', 'শহিদুল', 'sakib', 'shakib', 'shahidul', 'shohidul', 'shahidul alam'] },
  { serial: 2, nameBn: 'মোহাম্মদ ইসমাইল', nameEn: 'MOHAMMAD ISMAIL', positionBn: 'সিনিয়র সহ-সভাপতি', positionEn: 'Senior Vice President', category: 'vicePresidential', aliases: ['ইসমাইল', 'ismail', 'mohammad ismail'] },
  { serial: 3, nameBn: 'জয়নুল আবেদীন', nameEn: 'JOINUL ABEDIN', positionBn: 'সহ-সভাপতি', positionEn: 'Vice President', category: 'vicePresidential', aliases: ['জয়নুল', 'joinul', 'zoynul', 'joynul abedin'] },
  { serial: 4, nameBn: 'সোহেল আকরাম সবুজ', nameEn: 'SOHEL AKRAM SOBUJ', positionBn: 'সহ-সভাপতি', positionEn: 'Vice President', category: 'vicePresidential', aliases: ['সবুজ', 'সোহেল', 'sobuj', 'sohel', 'sohel akram'] },
  { serial: 5, nameBn: 'সেলিমুর রহমান অপি', nameEn: 'SALIMUR RAHMAN OPI', positionBn: 'সাধারণ সম্পাদক', positionEn: 'General Secretary', category: 'secretariat', aliases: ['অপি', 'সেলিমুর', 'opi', 'salimur', 'salimur rahman'] },
  { serial: 6, nameBn: 'এনায়েত উল্লাহ ফরহাদ', nameEn: 'ANAYET ULLAH FARHAD', positionBn: 'যুগ্ম সাধারণ সম্পাদক', positionEn: 'Joint General Secretary', category: 'jointSecretariat', aliases: ['ফরহাদ', 'farhad', 'anayet'] },
  { serial: 7, nameBn: 'মোঃ নিয়াজ উদ্দিন সাকিব', nameEn: 'MD. NIAJ UDDIN SAKIB', positionBn: 'যুগ্ম সাধারণ সম্পাদক', positionEn: 'Joint General Secretary', category: 'jointSecretariat', aliases: ['নিয়াজ', 'niaj', 'niaz'] },
  { serial: 8, nameBn: 'রিয়াজ উদ্দিন', nameEn: 'REAZ UDDIN', positionBn: 'যুগ্ম সাধারণ সম্পাদক', positionEn: 'Joint General Secretary', category: 'jointSecretariat', aliases: ['রিয়াজ', 'reaz', 'riaz'] },
  { serial: 9, nameBn: 'শাহাদাত ইসলাম', nameEn: 'SHAHADAT ISLAM', positionBn: 'যুগ্ম সাধারণ সম্পাদক', positionEn: 'Joint General Secretary', category: 'jointSecretariat', aliases: ['শাহাদাত ইসলাম', 'shahadat islam'] },
  { serial: 10, nameBn: 'কায়সার আহমেদ ইরফান', nameEn: 'KAISAR AHMED IRFAN', positionBn: 'যুগ্ম সাধারণ সম্পাদক', positionEn: 'Joint General Secretary', category: 'jointSecretariat', aliases: ['ইরফান', 'irfan'] },
  { serial: 11, nameBn: 'মোঃ আরফাত', nameEn: 'MD ARFAT', positionBn: 'সাংগঠনিক সম্পাদক', positionEn: 'Organizing Secretary', category: 'organizing', aliases: ['আরফাত', 'arfat', 'arafat', 'md arfat'] },
  { serial: 12, nameBn: 'মোঃ ইসমাইল নুর সাকিব', nameEn: 'MD. ISMAIL NUR SAKIB', positionBn: 'যুগ্ম সাংগঠনিক সম্পাদক', positionEn: 'Joint Organizing Secretary', category: 'organizing', aliases: ['ইসমাইল নুর', 'ismail nur'] },
  { serial: 13, nameBn: 'কায়সার আহমেদ অভি', nameEn: 'KAISAR AHMED OVI', positionBn: 'যুগ্ম সাংগঠনিক সম্পাদক', positionEn: 'Joint Organizing Secretary', category: 'organizing', aliases: ['অভি', 'ovi', 'kaisar ovi'] },
  { serial: 14, nameBn: 'মোঃ শাহাদাত আলম', nameEn: 'MD SHAHADAD ALAM', positionBn: 'অর্থ সম্পাদক', positionEn: 'Finance Secretary', category: 'finance', aliases: ['শাহাদাত আলম', 'shahadat alam'] },
  { serial: 15, nameBn: 'মুনমুন বণিক', nameEn: 'MUNMUN BANIK', positionBn: 'যুগ্ম অর্থ সম্পাদক', positionEn: 'Joint Finance Secretary', category: 'finance', aliases: ['মুনমুন', 'munmun'] },
  { serial: 16, nameBn: 'মোঃ মেহেদী হাসান', nameEn: 'MD MEHEDI HASAN', positionBn: 'যুগ্ম অর্থ সম্পাদক', positionEn: 'Joint Finance Secretary', category: 'finance', aliases: ['মেহেদী', 'mehedi'] },
  { serial: 17, nameBn: 'সানজিদা শারমিন', nameEn: 'SHANZIDA SHARMIN', positionBn: 'ছাত্রী বিষয়ক সম্পাদক', positionEn: 'Student Affairs Secretary (Female)', category: 'secretaries', aliases: ['সানজিদা', 'shanzida', 'sanjida'] },
  { serial: 18, nameBn: 'সুমাইয়া ইমরোজ', nameEn: 'SUMAYA IMROZ', positionBn: 'যুগ্ম ছাত্রী বিষয়ক সম্পাদক', positionEn: 'Joint Student Affairs Secretary (Female)', category: 'secretaries', aliases: ['সুমাইয়া', 'sumaya'] },
  { serial: 19, nameBn: 'দীপা শীল', nameEn: 'DIPA SHIL', positionBn: 'যুগ্ম ছাত্রী বিষয়ক সম্পাদক', positionEn: 'Joint Student Affairs Secretary (Female)', category: 'secretaries', aliases: ['দীপা', 'dipa'] },
  { serial: 20, nameBn: 'মোঃ রমজান', nameEn: 'MD RAMJAN', positionBn: 'প্রচার সম্পাদক', positionEn: 'Publicity Secretary', category: 'secretaries', aliases: ['রমজান', 'ramjan', 'romjan'] },
  { serial: 21, nameBn: 'রিফাত শরীফ', nameEn: 'REFAT SHARIF', positionBn: 'যুগ্ম প্রচার সম্পাদক', positionEn: 'Joint Publicity Secretary', category: 'secretaries', aliases: ['রিফাত', 'refat', 'rifat'] },
  { serial: 22, nameBn: 'সুস্মিতা রানী নাথ', nameEn: 'SUSMITA RANI NATH', positionBn: 'যুগ্ম প্রচার সম্পাদক', positionEn: 'Joint Publicity Secretary', category: 'secretaries', aliases: ['সুস্মিতা', 'susmita', 'sushmita'] },
  { serial: 23, nameBn: 'তানভীর রানা রিয়াদ', nameEn: 'TANVIR RANA RIYAD', positionBn: 'দপ্তর সম্পাদক', positionEn: 'Office Secretary', category: 'secretaries', aliases: ['তানভীর', 'রিয়াদ', 'tanvir', 'riyad'] },
  { serial: 24, nameBn: 'জয় নাথ', nameEn: 'JOY NATH', positionBn: 'সাংস্কৃতিক সম্পাদক', positionEn: 'Cultural Secretary', category: 'secretaries', aliases: ['জয়', 'জয় নাথ', 'joy'] },
  { serial: 25, nameBn: 'রকিবুল করিম', nameEn: 'RAKIBUL KARIM', positionBn: 'ত্রাণ ও দুর্যোগ বিষয়ক সম্পাদক', positionEn: 'Relief and Disaster Affairs Secretary', category: 'secretaries', aliases: ['রকিবুল', 'rakibul'] },
  { serial: 26, nameBn: 'তানজিত হোসেন', nameEn: 'TANJIT HOSSEN', positionBn: 'ক্রীড়া সম্পাদক', positionEn: 'Sports Secretary', category: 'secretaries', aliases: ['তানজিত', 'tanjit'] },
  { serial: 27, nameBn: 'আজিজুর রহমান', nameEn: 'AZIZUR RAHMAN', positionBn: 'সমাজকল্যাণ সম্পাদক', positionEn: 'Social Welfare Secretary', category: 'secretaries', aliases: ['আজিজুর', 'azizur'] }
];

const STANDING_COMMITTEE_CENTRAL: CommitteeMemberProfile[] = [
  { serial: 1, nameBn: 'সাকিব আল করিম', nameEn: 'Sakib Al Karim', positionBn: 'চেয়ারম্যান', positionEn: 'Chairman', category: 'standing', aliases: ['সাকিব আল করিম', 'sakib al karim', 'standing chairman'] },
  { serial: 2, nameBn: 'তামিমুল হাসিব রিমাদ', nameEn: 'Tamimul Hasib Rimad', positionBn: 'ভাইস-চেয়ারম্যান', positionEn: 'Vice-Chairman', category: 'standing', aliases: ['রিমাদ', 'তামিমুল', 'rimad', 'tamimul'] },
  { serial: 3, nameBn: 'সিফাত সাত্তার', nameEn: 'Shifat Sattar', positionBn: 'ভাইস-চেয়ারম্যান', positionEn: 'Vice-Chairman', category: 'standing', aliases: ['সিফাত', 'সিফাত সাত্তার', 'shifat', 'sifat'] },
  { serial: 4, nameBn: 'ইশতিয়াক আহমেদ', nameEn: 'Ishtiaqe Ahmed', positionBn: 'সদস্য', positionEn: 'Member', category: 'standing', aliases: ['ইশতিয়াক', 'ishtiaqe', 'ishtiak'] },
  { serial: 5, nameBn: 'চৈতি দেবী পিয়া', nameEn: 'Chaity Debi Piya', positionBn: 'সদস্য', positionEn: 'Member', category: 'standing', aliases: ['চৈতি', 'পিয়া', 'chaity', 'piya'] },
  { serial: 6, nameBn: 'রাকিব আহমেদ', nameEn: 'Rakib Ahmed', positionBn: 'সদস্য', positionEn: 'Member', category: 'standing', aliases: ['রাকিব আহমেদ', 'rakib ahmed'] },
  { serial: 7, nameBn: 'মোঃ আশরাফুল ইসলাম', nameEn: 'Md Ashraful Islam', positionBn: 'সদস্য', positionEn: 'Member', category: 'standing', aliases: ['আশরাফুল', 'ashraful'] },
  { serial: 8, nameBn: 'তানভীর হায়দার রাকিব', nameEn: 'Tanveer Haidar Rakib', positionBn: 'সদস্য', positionEn: 'Member', category: 'standing', aliases: ['তানভীর হায়দার', 'tanveer haidar'] },
  { serial: 9, nameBn: 'মোঃ এরশাদ', nameEn: 'Md Arshad', positionBn: 'সদস্য', positionEn: 'Member', category: 'standing', aliases: ['এরশাদ', 'arshad', 'ershad'] }
];

const resolveLeadershipQuery = (cleanQuery: string): KnowledgeIntent | null => {
  // 1. President Query (handles 'committe er sovapoti ke', 'president ke', 'shovapoti k', 'sobapoti', 'সভাপতি')
  const isPresidentQuery =
    /(\b|^)(sovapoti|shovapoti|sobapoti|shobhapoti|sabapoti|shabapoti|president|presidant|সভাপতি|প্রেসিডেন্ট|প্রেসিডেনট)(\b|$)/.test(cleanQuery) ||
    cleanQuery.includes('sovapoti') ||
    cleanQuery.includes('shovapoti') ||
    cleanQuery.includes('sobapoti') ||
    cleanQuery.includes('সভাপতি') ||
    cleanQuery.includes('president');

  const isViceQuery =
    cleanQuery.includes('soho') ||
    cleanQuery.includes('shoho') ||
    cleanQuery.includes('vice') ||
    cleanQuery.includes('senior') ||
    cleanQuery.includes('সিনিয়র') ||
    cleanQuery.includes('সহ');

  if (isPresidentQuery && !isViceQuery) {
    return {
      id: 'leadership-president',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদ (২০২৬)-এর সভাপতি হলেন **মোঃ শহিদুল আলম সাকিব (MD. SHAHIDUL ALAM SAKIB)**।\n\n' +
        'তিনি ২০১৫ সালে প্রতিষ্ঠিত এই মানবিক সংগঠনের নেতৃত্ব ও সার্বিক কার্যক্রম পরিচালনা করছেন।\n\n' +
        '📌 **সভাপতি পরিষদ:**\n' +
        '• **সভাপতি:** মোঃ শহিদুল আলম সাকিব\n' +
        '• **সিনিয়র সহ-সভাপতি:** মোহাম্মদ ইসমাইল\n' +
        '• **সহ-সভাপতি:** জয়নুল আবেদীন ও সোহেল আকরাম সবুজ',
      responseEn:
        'The President of Infinity Bangladesh Executive Committee (2026) is **MD. SHAHIDUL ALAM SAKIB**.\n\n' +
        '📌 **Presidential Leadership:**\n' +
        '• President: MD. SHAHIDUL ALAM SAKIB\n' +
        '• Senior Vice President: MOHAMMAD ISMAIL\n' +
        '• Vice Presidents: JOINUL ABEDIN & SOHEL AKRAM SOBUJ',
      actionCard: {
        title: 'কার্যনির্বাহী পরিষদ — সভাপতি পরিষদ',
        subtitle: 'সভাপতি: মোঃ শহিদুল আলম সাকিব | পোর্টফোলিও দেখুন',
        badge: 'সভাপতি পরিষদ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি প্রোফাইল দেখুন',
        variant: 'emerald'
      },
      quickPrompts: ['👥 সাধারণ সম্পাদক কে?', '🏛️ কেন্দ্রীয় স্থায়ী কমিটি', '📋 পূর্ণাঙ্গ কমিটি তালিকা']
    };
  }

  // 2. General Secretary Query (handles 'shadharon shompodok ke', 'gs ke', 'general secretary', 'সাধারণ সম্পাদক')
  const isGsQuery =
    /(\b|^)(gs|gen\s*sec|general\s*secretary|shadharon|sadharon|shompodok|sompodok|সাধারণ\s*সম্পাদক|সেক্রেটারি)(\b|$)/.test(cleanQuery) ||
    cleanQuery.includes('shadharon') ||
    cleanQuery.includes('sadharon') ||
    cleanQuery.includes('সাধারণ সম্পাদক') ||
    cleanQuery.includes('general secretary') ||
    cleanQuery.includes('gs ke') ||
    cleanQuery.includes('gs k') ||
    cleanQuery.includes('shompodok ke') ||
    cleanQuery.includes('sompodok ke') ||
    cleanQuery.includes('সম্পাদক কে');

  const isJointGsQuery =
    cleanQuery.includes('jugmo') ||
    cleanQuery.includes('joint') ||
    cleanQuery.includes('যুগ্ম');

  if (isGsQuery && !isJointGsQuery) {
    return {
      id: 'leadership-gs',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদ (২০২৬)-এর সাধারণ সম্পাদক হলেন **সেলিমুর রহমান অপি (SALIMUR RAHMAN OPI)**।\n\n' +
        '📌 **সচিবালয় ও যুগ্ম সাধারণ সম্পাদক পরিষদ:**\n' +
        '• **সাধারণ সম্পাদক:** সেলিমুর রহমান অপি\n' +
        '• **যুগ্ম সাধারণ সম্পাদকবৃন্দ (৫ জন):** এনায়েত উল্লাহ ফরহাদ, মোঃ নিয়াজ উদ্দিন সাকিব, রিয়াজ উদ্দিন, শাহাদাত ইসলাম, কায়সার আহমেদ ইরফান।',
      responseEn:
        'The General Secretary of Infinity Bangladesh Executive Committee (2026) is **SALIMUR RAHMAN OPI**.\n\n' +
        '📌 **Secretariat & Joint General Secretaries:**\n' +
        '• General Secretary: SALIMUR RAHMAN OPI\n' +
        '• Joint General Secretaries (5 members): ANAYET ULLAH FARHAD, MD. NIAJ UDDIN SAKIB, REAZ UDDIN, SHAHADAT ISLAM, KAISAR AHMED IRFAN.',
      actionCard: {
        title: 'কার্যনির্বাহী পরিষদ — সাধারণ সম্পাদক ও সচিবালয়',
        subtitle: 'সাধারণ সম্পাদক: সেলিমুর রহমান অপি ও সচিবালয় পরিষদ',
        badge: 'সচিবালয়',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি প্রোফাইল দেখুন',
        variant: 'emerald'
      },
      quickPrompts: ['👑 সভাপতি কে?', '🏛️ স্থায়ী কমিটির চেয়ারম্যান কে?', '📋 পূর্ণাঙ্গ কমিটি তালিকা']
    };
  }

  // 3. Standing Committee Chairman Query
  if (
    cleanQuery.includes('chairman') ||
    cleanQuery.includes('cheyarman') ||
    cleanQuery.includes('cheyarmen') ||
    cleanQuery.includes('chairmen') ||
    cleanQuery.includes('চেয়ারম্যান') ||
    cleanQuery.includes('স্থায়ী কমিটি প্রধান') ||
    cleanQuery.includes('স্থায়ী কমিটি প্রধান')
  ) {
    return {
      id: 'leadership-chairman',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ কেন্দ্রীয় স্থায়ী কমিটির চেয়ারম্যান হলেন **সাকিব আল করিম (Sakib Al Karim)**।\n\n' +
        '📌 **স্থায়ী কমিটি নেতৃত্ব:**\n' +
        '• **চেয়ারম্যান:** সাকিব আল করিম\n' +
        '• **ভাইস-চেয়ারম্যান:** তামিমুল হাসিব রিমাদ ও সিফাত সাত্তার\n\n' +
        'কেন্দ্রীয় স্থায়ী কমিটি ইনফিনিটি বাংলাদেশের প্রাতিষ্ঠানিক নীতি নির্ধারণ ও দীর্ঘমেয়াদী দিকনির্দেশনা প্রদান করে।',
      responseEn:
        'The Chairman of Infinity Bangladesh Central Standing Committee is **Sakib Al Karim**.\n\n' +
        '📌 **Standing Committee Leadership:**\n' +
        '• Chairman: Sakib Al Karim\n' +
        '• Vice-Chairmen: Tamimul Hasib Rimad & Shifat Sattar',
      actionCard: {
        title: 'কেন্দ্রীয় স্থায়ী কমিটি — চেয়ারম্যান পরিষদ',
        subtitle: 'চেয়ারম্যান: সাকিব আল করিম | স্থায়ী কমিটির নীতি পরিষদ',
        badge: 'স্থায়ী কমিটি',
        pageRoute: 'team/standing-committees',
        buttonLabel: 'স্থায়ী কমিটি দেখুন',
        variant: 'emerald'
      },
      quickPrompts: ['👑 সভাপতি কে?', '👥 সাধারণ সম্পাদক কে?', '📋 পূর্ণাঙ্গ কমিটি তালিকা']
    };
  }

  // 4. Vice President Query
  if (
    cleanQuery.includes('vice president') ||
    cleanQuery.includes('senior vp') ||
    cleanQuery.includes('soho sovapoti') ||
    cleanQuery.includes('shohoshovapoti') ||
    cleanQuery.includes('shoho shovapoti') ||
    cleanQuery.includes('সহ সভাপতি') ||
    cleanQuery.includes('সহ-সভাপতি') ||
    cleanQuery.includes('সিনিয়র সহ-সভাপতি') ||
    cleanQuery.includes('vp ke') ||
    cleanQuery.includes('vp k')
  ) {
    return {
      id: 'leadership-vp',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদ (২০২৬)-এর সহ-সভাপতি পরিষদ:\n\n' +
        '• **সিনিয়র সহ-সভাপতি:** মোহাম্মদ ইসমাইল (MOHAMMAD ISMAIL)\n' +
        '• **সহ-সভাপতি:** জয়নুল আবেদীন (JOINUL ABEDIN)\n' +
        '• **সহ-সভাপতি:** সোহেল আকরাম সবুজ (SOHEL AKRAM SOBUJ)',
      responseEn:
        'Infinity Bangladesh Vice Presidential Leadership (2026):\n\n' +
        '• Senior Vice President: MOHAMMAD ISMAIL\n' +
        '• Vice President: JOINUL ABEDIN\n' +
        '• Vice President: SOHEL AKRAM SOBUJ',
      actionCard: {
        title: 'কার্যনির্বাহী পরিষদ — সহ-সভাপতি পরিষদ',
        subtitle: 'সিনিয়র সহ-সভাপতি ও সহ-সভাপতিদের পরিচিতি',
        badge: 'সহ-সভাপতি পরিষদ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  // 5. Joint General Secretary Query
  if (
    cleanQuery.includes('joint gs') ||
    cleanQuery.includes('jgs') ||
    cleanQuery.includes('joint general') ||
    cleanQuery.includes('jugmo shadharon') ||
    cleanQuery.includes('যুগ্ম সাধারণ সম্পাদক') ||
    cleanQuery.includes('যুগ্ম সম্পাদক')
  ) {
    return {
      id: 'leadership-jgs',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদের নির্বাচিত ৫ জন যুগ্ম সাধারণ সম্পাদক:\n\n' +
        '১. **এনায়েত উল্লাহ ফরহাদ (ANAYET ULLAH FARHAD)**\n' +
        '২. **মোঃ নিয়াজ উদ্দিন সাকিব (MD. NIAJ UDDIN SAKIB)**\n' +
        '৩. **রিয়াজ উদ্দিন (REAZ UDDIN)**\n' +
        '৪. **শাহাদাত ইসলাম (SHAHADAT ISLAM)**\n' +
        '৫. **কায়সার আহমেদ ইরফান (KAISAR AHMED IRFAN)**',
      responseEn:
        'Infinity Bangladesh Joint General Secretaries (5 elected members):\n\n' +
        '1. ANAYET ULLAH FARHAD\n' +
        '2. MD. NIAJ UDDIN SAKIB\n' +
        '3. REAZ UDDIN\n' +
        '4. SHAHADAT ISLAM\n' +
        '5. KAISAR AHMED IRFAN',
      actionCard: {
        title: 'যুগ্ম সাধারণ সম্পাদক পরিষদ (২০২৬)',
        subtitle: '৫ জন নির্বাচিত যুগ্ম সাধারণ সম্পাদকের প্রোফাইল',
        badge: 'সচিবালয়',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  // 6. Organizing Secretary Query
  if (
    cleanQuery.includes('organizing') ||
    cleanQuery.includes('organizational') ||
    cleanQuery.includes('shongothonik') ||
    cleanQuery.includes('songothonik') ||
    cleanQuery.includes('সাংগঠনিক')
  ) {
    return {
      id: 'leadership-org',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ সাংগঠনিক পরিষদ:\n\n' +
        '• **সাংগঠনিক সম্পাদক:** মোঃ আরফাত (MD ARFAT)\n' +
        '• **যুগ্ম সাংগঠনিক সম্পাদক:** মোঃ ইসমাইল নুর সাকিব\n' +
        '• **যুগ্ম সাংগঠনিক সম্পাদক:** কায়সার আহমেদ অভি',
      responseEn:
        'Infinity Bangladesh Organizing Leadership:\n\n' +
        '• Organizing Secretary: MD ARFAT\n' +
        '• Joint Organizing Secretaries: MD. ISMAIL NUR SAKIB & KAISAR AHMED OVI',
      actionCard: {
        title: 'সাংগঠনিক পরিষদ (২০২৬)',
        subtitle: 'সাংগঠনিক সম্পাদক মোঃ আরফাত ও যুগ্ম সাংগঠনিক সম্পাদকবৃন্দ',
        badge: 'সাংগঠনিক বিভাগ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  // 7. Finance Secretary Query
  if (
    cleanQuery.includes('finance') ||
    cleanQuery.includes('ortho shompodok') ||
    cleanQuery.includes('orthe shompodok') ||
    cleanQuery.includes('অর্থ সম্পাদক') ||
    cleanQuery.includes('কোষাধ্যক্ষ')
  ) {
    return {
      id: 'leadership-finance',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ অর্থ ও হিসাব বিভাগ:\n\n' +
        '• **অর্থ সম্পাদক:** মোঃ শাহাদাত আলম (MD SHAHADAD ALAM)\n' +
        '• **যুগ্ম অর্থ সম্পাদক:** মুনমুন বণিক (MUNMUN BANIK)\n' +
        '• **যুগ্ম অর্থ সম্পাদক:** মোঃ মেহেদী হাসান (MD MEHEDI HASAN)',
      responseEn:
        'Infinity Bangladesh Finance & Accounts:\n\n' +
        '• Finance Secretary: MD SHAHADAD ALAM\n' +
        '• Joint Finance Secretaries: MUNMUN BANIK & MD MEHEDI HASAN',
      actionCard: {
        title: 'অর্থ ও হিসাব বিভাগ (২০২৬)',
        subtitle: 'অর্থ সম্পাদক মোঃ শাহাদাত আলম ও যুগ্ম অর্থ সম্পাদকবৃন্দ',
        badge: 'অর্থ বিভাগ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  // 8. Specialized Secretariats
  if (cleanQuery.includes('chatri') || cleanQuery.includes('student affairs') || cleanQuery.includes('ছাত্রী')) {
    return {
      id: 'leadership-student-female',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ ছাত্রী বিষয়ক বিভাগ:\n\n' +
        '• **ছাত্রী বিষয়ক সম্পাদক:** সানজিদা শারমিন (SHANZIDA SHARMIN)\n' +
        '• **যুগ্ম ছাত্রী বিষয়ক সম্পাদক:** সুমাইয়া ইমরোজ ও দীপা শীল',
      responseEn:
        'Student Affairs Secretariats (Female):\n• Secretary: SHANZIDA SHARMIN\n• Joint Secretaries: SUMAYA IMROZ & DIPA SHIL',
      actionCard: {
        title: 'ছাত্রী বিষয়ক বিভাগ (২০২৬)',
        subtitle: 'সানজিদা শারমিন সহ ছাত্রী বিষয়ক সম্পাদক পরিষদ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  if (cleanQuery.includes('prochar') || cleanQuery.includes('publicity') || cleanQuery.includes('প্রচার')) {
    return {
      id: 'leadership-publicity',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ প্রচার ও জনসংযোগ বিভাগ:\n\n' +
        '• **প্রচার সম্পাদক:** মোঃ রমজান (MD RAMJAN)\n' +
        '• **যুগ্ম প্রচার সম্পাদক:** রিফাত শরীফ ও সুস্মিতা রানী নাথ',
      responseEn:
        'Publicity & Media Secretariats:\n• Secretary: MD RAMJAN\n• Joint Secretaries: REFAT SHARIF & SUSMITA RANI NATH',
      actionCard: {
        title: 'প্রচার বিভাগ (২০২৬)',
        subtitle: 'মোঃ রমজান সহ প্রচার সম্পাদক পরিষদ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  if (cleanQuery.includes('doptor') || cleanQuery.includes('office sec') || cleanQuery.includes('দপ্তর')) {
    return {
      id: 'leadership-office',
      keywords: [],
      responseBn: 'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদের **দপ্তর সম্পাদক:** তানভীর রানা রিয়াদ (TANVIR RANA RIYAD)।',
      responseEn: 'Office Secretary: TANVIR RANA RIYAD (Infinity Bangladesh Executive Committee).',
      actionCard: {
        title: 'দপ্তর বিভাগ (২০২৬)',
        subtitle: 'দপ্তর সম্পাদক: তানভীর রানা রিয়াদ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  if (cleanQuery.includes('cultural') || cleanQuery.includes('sangskritik') || cleanQuery.includes('সাংস্কৃতিক')) {
    return {
      id: 'leadership-cultural',
      keywords: [],
      responseBn: 'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদের **সাংস্কৃতিক সম্পাদক:** জয় নাথ (JOY NATH)।',
      responseEn: 'Cultural Secretary: JOY NATH (Infinity Bangladesh Executive Committee).',
      actionCard: {
        title: 'সাংস্কৃতিক বিভাগ (২০২৬)',
        subtitle: 'সাংস্কৃতিক সম্পাদক: জয় নাথ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  if (cleanQuery.includes('relief') || cleanQuery.includes('tran') || cleanQuery.includes('ত্রাণ') || cleanQuery.includes('দুর্যোগ')) {
    return {
      id: 'leadership-relief',
      keywords: [],
      responseBn: 'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদের **ত্রাণ ও দুর্যোগ বিষয়ক সম্পাদক:** রকিবুল করিম (RAKIBUL KARIM)।',
      responseEn: 'Relief and Disaster Affairs Secretary: RAKIBUL KARIM (Infinity Bangladesh Executive Committee).',
      actionCard: {
        title: 'ত্রাণ ও দুর্যোগ বিষয়ক বিভাগ (২০২৬)',
        subtitle: 'ত্রাণ ও দুর্যোগ সম্পাদক: রকিবুল করিম',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি পেজে দেখুন',
        variant: 'emerald'
      }
    };
  }

  // 9. Specific Individual Name Searches
  if (cleanQuery.includes('sakib') || cleanQuery.includes('shakib') || cleanQuery.includes('সাকিব')) {
    return {
      id: 'leadership-sakib',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশে "সাকিব" নামে ৪ জন সম্মানিত দায়িত্বশীল নেতা রয়েছেন:\n\n' +
        '১. **মোঃ শহিদুল আলম সাকিব** — সভাপতি (কার্যনির্বাহী পরিষদ ২০২৬)\n' +
        '২. **সাকিব আল করিম** — চেয়ারম্যান (কেন্দ্রীয় স্থায়ী কমিটি)\n' +
        '৩. **মোঃ নিয়াজ উদ্দিন সাকিব** — যুগ্ম সাধারণ সম্পাদক\n' +
        '৪. **মোঃ ইসমাইল নুর সাকিব** — যুগ্ম সাংগঠনিক সম্পাদক',
      responseEn:
        'Infinity Bangladesh Leaders named "Sakib":\n\n' +
        '1. MD. SHAHIDUL ALAM SAKIB — President (Executive Committee 2026)\n' +
        '2. Sakib Al Karim — Chairman (Central Standing Committee)\n' +
        '3. MD. NIAJ UDDIN SAKIB — Joint General Secretary\n' +
        '4. MD. ISMAIL NUR SAKIB — Joint Organizing Secretary',
      actionCard: {
        title: 'নেতৃত্ব ও কমিটি ডিরেক্টরি',
        subtitle: 'ইনফিনিটি বাংলাদেশের সকল নেতৃবৃন্দের তালিকা',
        badge: 'নেতৃত্ব',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'কমিটি ও নেতৃত্ব দেখুন',
        variant: 'emerald'
      }
    };
  }

  // Check aliases across 2026 executive committee
  for (const member of EXECUTIVE_COMMITTEE_2026) {
    for (const alias of member.aliases) {
      if (cleanQuery.includes(alias)) {
        return {
          id: `leadership-member-${member.serial}`,
          keywords: [],
          responseBn: `**${member.nameBn} (${member.nameEn})** ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদ (২০২৬)-এর **${member.positionBn} (${member.positionEn})** হিসেবে দায়িত্ব পালন করছেন।`,
          responseEn: `**${member.nameEn} (${member.nameBn})** serves as the **${member.positionEn} (${member.positionBn})** of Infinity Bangladesh Executive Committee (2026).`,
          actionCard: {
            title: `${member.nameBn} — ${member.positionBn}`,
            subtitle: `কার্যনির্বাহী পরিষদ ২০২৬ | পোর্টফোলিও দেখুন`,
            badge: member.positionBn,
            pageRoute: 'team/executive-committee',
            buttonLabel: 'কমিটি পেজে দেখুন',
            variant: 'emerald'
          }
        };
      }
    }
  }

  // Check aliases across central standing committee
  for (const member of STANDING_COMMITTEE_CENTRAL) {
    for (const alias of member.aliases) {
      if (cleanQuery.includes(alias)) {
        return {
          id: `leadership-standing-${member.serial}`,
          keywords: [],
          responseBn: `**${member.nameBn} (${member.nameEn})** ইনফিনিটি বাংলাদেশ কেন্দ্রীয় স্থায়ী কমিটির **${member.positionBn} (${member.positionEn})** হিসেবে দায়িত্ব পালন করছেন।`,
          responseEn: `**${member.nameEn} (${member.nameBn})** serves as the **${member.positionEn}** of Infinity Bangladesh Central Standing Committee.`,
          actionCard: {
            title: `${member.nameBn} — ${member.positionBn}`,
            subtitle: `কেন্দ্রীয় স্থায়ী কমিটি | পলিসি ও তত্ত্বাবধান পরিষদ`,
            badge: member.positionBn,
            pageRoute: 'team/standing-committees',
            buttonLabel: 'স্থায়ী কমিটি দেখুন',
            variant: 'emerald'
          }
        };
      }
    }
  }

  // 10. Full Committee List / General Committee Query (handles 'committe te k k ache', 'sobar nam', 'committee list', etc.)
  if (
    cleanQuery.includes('committe') ||
    cleanQuery.includes('committee') ||
    cleanQuery.includes('komiti') ||
    cleanQuery.includes('comite') ||
    cleanQuery.includes('কমিটি') ||
    cleanQuery.includes('নেতৃত্ব') ||
    cleanQuery.includes('leadership') ||
    cleanQuery.includes('sobar nam') ||
    cleanQuery.includes('k k ache') ||
    cleanQuery.includes('ke ke ache') ||
    cleanQuery.includes('কে কে আছে') ||
    cleanQuery.includes('তালিকা') ||
    cleanQuery.includes('সদস্য')
  ) {
    return {
      id: 'leadership-full',
      keywords: [],
      responseBn:
        'ইনফিনিটি বাংলাদেশ কার্যনির্বাহী পরিষদ (২০২৬)-এ মোট **২৭ জন** এবং কেন্দ্রীয় স্থায়ী কমিটিতে **৯ জন** দায়িত্ব পালন করছেন:\n\n' +
        '🏛️ **শীর্ষ নেতৃত্ব কাঠামো:**\n' +
        '• **সভাপতি:** মোঃ শহিদুল আলম সাকিব\n' +
        '• **সিনিয়র সহ-সভাপতি:** মোহাম্মদ ইসমাইল\n' +
        '• **সহ-সভাপতি:** জয়নুল আবেদীন ও সোহেল আকরাম সবুজ\n' +
        '• **সাধারণ সম্পাদক:** সেলিমুর রহমান অপি\n' +
        '• **যুগ্ম সাধারণ সম্পাদক:** এনায়েত উল্লাহ ফরহাদ, মোঃ নিয়াজ উদ্দিন সাকিব সহ ৫ জন\n' +
        '• **সাংগঠনিক সম্পাদক:** মোঃ আরফাত\n' +
        '• **অর্থ সম্পাদক:** মোঃ শাহাদাত আলম\n' +
        '• **কেন্দ্রীয় স্থায়ী কমিটির চেয়ারম্যান:** সাকিব আল করিম\n\n' +
        'সকল ২৭ জন কার্যনির্বাহী সদস্যের ছবি ও পরিচিতি দেখতে নিচের বোতামে ক্লিক করুন।',
      responseEn:
        'Infinity Bangladesh is governed by a 27-member Executive Committee (2026) and a 9-member Central Standing Committee:\n\n' +
        '🏛️ **Top Leadership Roster:**\n' +
        '• President: MD. SHAHIDUL ALAM SAKIB\n' +
        '• Senior Vice President: MOHAMMAD ISMAIL\n' +
        '• Vice Presidents: JOINUL ABEDIN & SOHEL AKRAM SOBUJ\n' +
        '• General Secretary: SALIMUR RAHMAN OPI\n' +
        '• Organizing Secretary: MD ARFAT\n' +
        '• Finance Secretary: MD SHAHADAD ALAM\n' +
        '• Standing Committee Chairman: Sakib Al Karim\n\n' +
        'View complete credentials and biographies on our leadership directory.',
      actionCard: {
        title: 'কার্যনির্বাহী পরিষদ (২০২৬) পূর্ণাঙ্গ তালিকা',
        subtitle: 'সকল ২৭ জন সদস্য ও কেন্দ্রীয় স্থায়ী কমিটির পরিচিতি',
        badge: 'নেতৃত্ব পরিষদ',
        pageRoute: 'team/executive-committee',
        buttonLabel: 'পূর্ণাঙ্গ কমিটি দেখুন',
        variant: 'emerald'
      },
      quickPrompts: ['👑 সভাপতি কে?', '👥 সাধারণ সম্পাদক কে?', '🏛️ স্থায়ী কমিটির চেয়ারম্যান কে?']
    };
  }

  return null;
};

  // Natural Language & Intent Matcher
  const matchIntent = (query: string): KnowledgeIntent | null => {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Leadership & Committee Query Matcher (handles spelling errors like 'committe er sovapoti ke', 'shovapoti', 'gs', names)
    const leadershipMatch = resolveLeadershipQuery(cleanQuery);
    if (leadershipMatch) {
      return leadershipMatch;
    }

    // 2. Specific Blood Intent Disambiguation
    if (
      cleanQuery.includes('রক্ত দিতে') ||
      cleanQuery.includes('রক্তদাতা হতে') ||
      cleanQuery.includes('ডোনার হতে') ||
      cleanQuery.includes('become donor') ||
      cleanQuery.includes('donor reg') ||
      cleanQuery.includes('ডোনার নিবন্ধন')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-donor-register') || null;
    }
    if (
      cleanQuery.includes('রক্তদাতা খুঁজ') ||
      cleanQuery.includes('রক্ত খুঁজ') ||
      cleanQuery.includes('donor search') ||
      cleanQuery.includes('find donor') ||
      cleanQuery.includes('donor list') ||
      cleanQuery.includes('ডিরেক্টরি')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-find') || null;
    }
    if (
      cleanQuery.includes('জরুরি রক্ত') ||
      cleanQuery.includes('রক্ত লাগবে') ||
      cleanQuery.includes('রক্ত প্রয়োজন') ||
      cleanQuery.includes('রক্ত দরকার') ||
      cleanQuery.includes('need blood') ||
      cleanQuery.includes('emergency blood')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-emergency') || null;
    }

    // 3. Check for exact keyword hits
    for (const intent of KNOWLEDGE_BASE) {
      for (const kw of intent.keywords) {
        if (cleanQuery.includes(kw.toLowerCase())) {
          return intent;
        }
      }
    }

    // 4. Secondary heuristic checks
    if (cleanQuery.includes('রক্ত') || cleanQuery.includes('blood') || cleanQuery.includes('rokto')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-find') || null;
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
          quickPrompts: matched.quickPrompts || [
            isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Form',
            isBn ? '🩸 রক্তদাতা ডিরেক্টরি' : '🩸 Donor Directory',
            isBn ? '💳 অনুদান পোর্টাল' : '💳 Donation Portal'
          ]
        };
      } else {
        // Courteous fallback with quick navigations
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: isBn
            ? 'আপনার প্রশ্নের সরাসরি সুনির্দিষ্ট উত্তর দিতে আমি সংশ্লিষ্ট তথ্যগুলো নিচে যুক্ত করেছি। আপনি সরাসরি যেকোনো ফর্ম পূরণ করতে পারেন অথবা জরুরি প্রয়োজনে আমাদের ২৪/৭ হেল্পলাইনে (01839-008339) সরাসরি কল দিতে পারেন।'
            : 'To best assist you, here are the direct access forms and navigators. You can also reach our 24/7 emergency coordinator helpline at 01839-008339 directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'যোগাযোগ ও সহায়তা ডেস্ক',
            subtitle: '২৪/৭ সার্বক্ষণিক হটলাইন: 01839-008339 | কেন্দ্রীয় কার্যালয়: হাটহাজারী, চট্টগ্রাম',
            badge: 'হেল্পডেস্ক',
            pageRoute: 'contact',
            phoneCall: '01839008339',
            buttonLabel: 'যোগাযোগ পেজে যান',
            variant: 'slate'
          },
          quickPrompts: [
            isBn ? '🩸 রক্তদাতা ডিরেক্টরি' : '🩸 Donor Directory',
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
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-12 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isBn ? 'ইনফি রোবট খুলুন' : 'Open Infi Robot'}
          className="relative group flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none"
        >
          {/* Desktop Hover Micro-Tooltip */}
          <div className="hidden lg:flex items-center absolute right-full mr-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-30">
            <span className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-white/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isBn ? 'ইনফি রোবট' : 'Infi Robot'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 rounded-full bg-white text-slate-800 shadow-xl border border-[#EAE3D9] flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot-icon"
                initial={{ scale: 0.7, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center justify-center p-0.5 sm:p-1"
              >
                {/* 1. Ground Drop Shadow under the entire 3D dock */}
                <div className="absolute -bottom-0.5 w-8 sm:w-13 h-1.5 sm:h-2 bg-black/25 blur-[2.5px] rounded-[100%] pointer-events-none" />

                {/* 2. 3D Frosted Glass Pedestal Dock (Compact on mobile, full size on desktop) */}
                <div className="absolute bottom-0 w-[34px] sm:w-[54px] h-[8.5px] sm:h-[15px] rounded-[100%] bg-gradient-to-b from-white/95 via-white/70 to-emerald-50/40 backdrop-blur-xl border border-white/90 shadow-[0_4px_12px_-2px_rgba(0,106,78,0.25),0_1.5px_3px_rgba(0,0,0,0.04),inset_0_1px_1.5px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,106,78,0.1)] flex items-center justify-center pointer-events-none">
                  {/* Holographic Emerald Energy Ring inside glass */}
                  <div className="absolute inset-[1.5px] sm:inset-[2px] rounded-[100%] border border-emerald-400/40 bg-gradient-to-tr from-emerald-500/15 via-teal-400/20 to-emerald-400/5 blur-[0.5px]" />
                  {/* Specular Glass Sheen */}
                  <div className="absolute top-[1px] sm:top-[1.5px] inset-x-2 sm:inset-x-2.5 h-[0.75px] sm:h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
                  {/* Active Status Jewel - Mounted on glass rim */}
                  <span className="absolute -top-0.5 right-0.5 sm:right-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5 z-30">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 border border-white shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                  </span>
                </div>

                {/* 3. Dynamic Contact Shadow on top of Glass Disc (syncs with levitation height) */}
                <motion.div 
                  animate={{ scale: [1, 0.75, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1 sm:bottom-1.5 w-5 sm:w-8 h-1 sm:h-1.5 bg-emerald-950/40 blur-[1.5px] sm:blur-[2px] rounded-[100%] z-10 pointer-events-none" 
                />
                
                {/* 4. Robot Container with floating levitation animation above the glass */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-20 w-10 h-10 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center mb-1 sm:mb-1.5"
                >
                  {/* Gentle Levitation Aura */}
                  <div className="absolute inset-1 sm:inset-2 bg-emerald-400/25 blur-md sm:blur-lg rounded-full animate-pulse pointer-events-none" />

                  {/* Robot Image (Compact on mobile, full-size on desktop) */}
                  <img
                    src="/brand/infi-robot.png?v=4"
                    alt="Infi Robot"
                    className="relative z-10 w-full h-full object-contain scale-100 sm:scale-[1.18] drop-shadow-[0_4px_10px_rgba(0,106,78,0.3)] sm:drop-shadow-[0_8px_16px_rgba(0,106,78,0.35)]"
                  />
                </motion.div>
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
            className="fixed bottom-[76px] left-3 right-3 sm:left-auto sm:right-8 sm:bottom-[92px] lg:right-12 lg:bottom-[104px] z-50 w-auto sm:w-[420px] max-w-[430px] h-[580px] max-h-[calc(100dvh-100px)] bg-white/95 backdrop-blur-xl rounded-3xl border border-[#EAE3D9] shadow-2xl flex flex-col overflow-hidden text-slate-800 touch-manipulation"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#006A4E] to-[#0A4E3B] text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center -ml-1">
                  <div className="absolute inset-2 bg-white/20 blur-md rounded-full animate-pulse" />
                  <img
                    src="/brand/infi-robot.png?v=4"
                    alt="Infi Robot"
                    className="relative z-10 w-full h-full object-contain scale-[1.1] drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight font-display">
                      {isBn ? 'ইনফি রোবট (Infi Robot)' : 'Infi Robot'}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/80 line-clamp-1">
                    {isBn ? 'মানবিক এআই সহকারী • ২৪/৭ পোর্টাল গাইড' : 'Humanitarian AI Assistant • 24/7 Portal Guide'}
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
                  aria-label={isBn ? 'সহকারী বন্ধ করুন' : 'Close Assistant'}
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
                    className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                  >
                    {isBot && (
                      <div className="relative w-9 h-9 sm:w-9 sm:h-9 shrink-0 mt-0.5 flex items-center justify-center">
                        <img
                          src="/brand/infi-robot.png?v=4"
                          alt="Infi Robot"
                          className="relative z-10 w-full h-full object-contain scale-[1.1] drop-shadow-[0_3px_6px_rgba(0,106,78,0.25)]"
                        />
                      </div>
                    )}
                    <div
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1.5 max-w-[85%]`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 leading-relaxed shadow-warm-xs ${
                          isBot
                            ? 'bg-white border border-[#EAE3D9] text-slate-800 rounded-tl-sm'
                            : 'bg-[#006A4E] text-white rounded-tr-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Action Card Attachment */}
                      {msg.actionCard && (
                        <div className="w-full mt-2 p-3.5 rounded-2xl bg-white border border-[#EAE3D9] shadow-warm-sm space-y-2.5">
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
                  </div>
                );
              })}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                    <img
                      src="/brand/infi-robot.png?v=4"
                      alt="Infi Robot"
                      className="relative z-10 w-full h-full object-contain scale-[1.1] drop-shadow-[0_3px_6px_rgba(0,106,78,0.25)]"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 p-3 bg-white border border-[#EAE3D9] rounded-2xl rounded-tl-sm w-18 shadow-warm-xs">
                    <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#006A4E] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
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
                  {isBn ? '২৪/৭ সাপোর্ট: 01839-008339' : 'Helpline: 01839-008339'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
