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
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  Calendar,
  Info,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from '../context/RouterContext';
import { useData } from '../context/DataContext';
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
  whatsappNumber?: string;
  whatsappMessage?: string;
  buttonLabel: string;
  variant?: 'emerald' | 'crimson' | 'amber' | 'slate' | 'rose';
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
  category?: 'blood' | 'donate' | 'volunteer' | 'transparency' | 'governance' | 'general' | 'wings';
}

interface CommitteeMemberProfile {
  serial: number;
  nameBn: string;
  nameEn: string;
  positionBn: string;
  positionEn: string;
  category: 'presidential' | 'vicePresidential' | 'secretariat' | 'jointSecretariat' | 'organizing' | 'finance' | 'secretaries' | 'standing';
  aliases: string[];
}

// 2026 Executive Committee Roster (27 Members)
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

// Central Standing Committee (9 Members)
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

// Master Knowledge Base (25+ Knowledge-Dense Humanitarian Intents)
const KNOWLEDGE_BASE: KnowledgeIntent[] = [
  // 1. Organization Overview & Genesis
  {
    id: 'org-overview',
    category: 'general',
    keywords: [
      'infinity', 'ইনফিনিটি', 'সংগঠন', 'পরিচিতি', 'about infinity', 'overview', 'team infinity',
      'infinity bangladesh', 'ইনফিনিটি বাংলাদেশ', 'সংগঠন সম্পর্কে', 'somporke', 'shongothon'
    ],
    responseBn:
      '**ইনফিনিটি বাংলাদেশ (Infinity Bangladesh)** ২০১৫ সালে চট্টগ্রামের হাটহাজারীতে প্রতিষ্ঠিত একটি তরুণ নেতৃত্বাধীন অরাজনৈতিক, অলাভজনক ও নিবন্ধিত স্বেচ্ছাসেবী মানবিক কল্যাণ সংস্থা।\n\n' +
      '📌 **মূল পরিচয় ও আদর্শ:**\n' +
      '• **মূলমন্ত্র:** "United for Humanity — Serving Humanity with Dignity, Compassion, and 100% Charity Transparency since 2015."\n' +
      '• **প্রতিষ্ঠাতা:** শেখ মোহাম্মদ সাকিব (Sheikh Mohammad Sakib)\n' +
      '• **কেন্দ্রীয় কার্যালয়:** হাটহাজারী, চট্টগ্রাম - ৪৩৩০, বাংলাদেশ\n' +
      '• **পরিচালন নীতি:** ১০০% চ্যারিটি মডেল (জনগণের অনুদানের ১টি টাকাও প্রশাসনিক খরচে কাটা হয় না)\n' +
      '• **২৪/৭ হেল্পলাইন:** 01839-008339\n' +
      '• **অফিশিয়াল ইমেইল:** smsakib6452@gmail.com',
    responseEn:
      '**Infinity Bangladesh (Team Infinity)** is a youth-driven non-governmental voluntary humanitarian organization founded in 2015 in Hathazari, Chattogram.\n\n' +
      '📌 **Core Identity & Credentials:**\n' +
      '• **Motto:** United for Humanity — Dignity, Compassion & 100% Charity Transparency\n' +
      '• **Founder:** Sheikh Mohammad Sakib\n' +
      '• **Headquarters:** Hathazari, Chattogram - 4330, Bangladesh\n' +
      '• **Operating Principle:** 100% Charity Model (Zero admin cuts from public donations)\n' +
      '• **24/7 Helpline:** +880 1839-008339\n' +
      '• **Official Email:** smsakib6452@gmail.com',
    actionCard: {
      title: 'সংগঠনের পরিচিতি ও মিশন',
      subtitle: '২০১৫ সাল থেকে মানবতার সেবায় অবিচল পথচলা',
      badge: 'পরিচিতি',
      pageRoute: 'about',
      buttonLabel: 'আমাদের সম্পর্কে জানুন',
      variant: 'emerald'
    },
    quickPrompts: ['🏛️ ১০০% চ্যারিটি মডেল কী?', '🩸 লাইফলাইন রক্তদান নেটওয়ার্ক', '👥 কার্যনির্বাহী পরিষদ ২০২৬']
  },

  // 2. 100% Charity Model (Radical Ethics)
  {
    id: 'charity-model-100',
    category: 'transparency',
    keywords: [
      '100%', '100% charity', '১০০%', '১০০% চ্যারিটি', 'প্রশাসনিক খরচ', 'admin cost', 'charity model',
      'টাকা কোথায় যায়', 'খরচের নিয়ম', 'নীতি', 'policy', 'ethics'
    ],
    responseBn:
      '**ইনফিনিটি বাংলাদেশের ১০০% চ্যারিটি মডেল (100% Charity Policy):**\n\n' +
      'আমরা বিশ্বাস করি, একজন দাতার কষ্টে উপার্জিত প্রতিটি পয়সার পূর্ণ হকদার মাঠপর্যায়ের অসহায় মানুষ।\n\n' +
      '✅ **০% প্রশাসনিক কর্তন:** সাধারণ মানুষের অনুদানের ১টি টাকাও অফিস ভাড়া, কর্মকর্তা বেতন, ওয়েবসাইট বা প্রশাসনিক খরচে কাটা হয় না।\n' +
      '✅ **১০০% সরাসরি মাঠে:** অনুদানের শতভাগ সরাসরি খাদ্য সামগ্রী, কম্বল, জরুরি রোগীর রক্ত পরীক্ষা ও সুবিধাবঞ্চিত শিশুদের শিক্ষা উপকরণে ব্যয় হয়।\n' +
      '✅ **বোর্ড সদস্যদের নিজস্ব তহবিল:** সংগঠনের অফিস ও প্রশাসনিক ব্যয় ট্রাস্টি ও পরিচালকদের নিজস্ব তহবিল থেকে আলাদাভাবে নির্বাহ করা হয়।\n' +
      '✅ **উন্মুক্ত ভাউচার:** প্রতিটি খরচের রসিদ ও বাৎসরিক অডিট রিপোর্ট ওয়েবসাইটে সার্বক্ষণিক উন্মুক্ত।',
    responseEn:
      '**Infinity Bangladesh 100% Charity Model:**\n\n' +
      'Every single penny donated by the public reaches vulnerable beneficiaries directly with ZERO administrative deductions.\n\n' +
      '• 0% Administrative Cut from public funds\n' +
      '• 100% Direct Allocation to relief items, patient blood matching, and student kits\n' +
      '• Operational & office overheads are funded 100% privately by trustees and governing board members\n' +
      '• Fully public expense vouchers and audited balance sheets.',
    actionCard: {
      title: '১০০% চ্যারিটি মডেল ও স্বচ্ছতা অডিট',
      subtitle: 'নিরপেক্ষ চার্টার্ড অ্যাকাউন্ট্যান্ট অডিট ও খরচের ভাউচার দেখুন',
      badge: '১০০% স্বচ্ছতা',
      pageRoute: 'transparency',
      buttonLabel: 'অডিট প্রতিবেদন দেখুন',
      variant: 'amber'
    },
    quickPrompts: ['📑 অডিট রিপোর্ট ও হিসাব', '💳 অনুদান দেওয়ার নিয়ম', '🩸 রক্তদান নেটওয়ার্ক']
  },

  // 3. 5 Core Humanitarian Wings
  {
    id: 'humanitarian-wings',
    category: 'wings',
    keywords: [
      'wing', 'wings', 'শাখা', 'উইং', '৫টি শাখা', 'কার্যক্রমের ক্ষেত্র', 'humanitarian wings',
      'প্রকল্পসমূহ', 'মূল কাজ', 'কাজ কি', 'কি কাজ করেন', 'core programs'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশ মূলত **৫টি প্রধান মানবিক উইং (Core Humanitarian Wings)**-এর মাধ্যমে সার্বক্ষণিক সেবা পরিচালনা করে:\n\n' +
      '১. 🩸 **Infinity LifeLine (জরুরি রক্তদান নেটওয়ার্ক):** ৬৪ জেলায় ২৪/৭ স্বেচ্ছায় রক্তদাতা ও রোগীর সরাসরি সংযোগ।\n' +
      '২. 🎒 **Child Education & Empowerment:** সুবিধাবঞ্চিত শিশুদের শিক্ষা উপকরণ, পোশাক, খাতা-কলম ও মেধা বৃত্তি।\n' +
      '৩. 🌊 **Emergency Disaster & Flood Relief:** জাতীয় দুর্যোগ ও বন্যায় তাৎক্ষণিক রান্না করা খাবার, শুকনো খাদ্য ও বিশুদ্ধ পানি বিতরণ।\n' +
      '৪. ❄️ **Winter Aid & Warmth Drives:** উত্তরবঙ্গ ও পাহাড়ী অঞ্চলের শীতার্ত মানুষের মাঝে ভারী কম্বল ও শীতবস্ত্র পৌঁছে দেওয়া।\n' +
      '৫. 📑 **Radical Transparency & Governance:** প্রতিটি ব্যয়ের ভাউচার ও নিরীক্ষিত অডিট উন্মুক্ত রাখা।',
    responseEn:
      'Infinity Bangladesh operates through 5 Core Humanitarian Wings:\n\n' +
      '1. 🩸 **Infinity LifeLine:** 24/7 voluntary emergency blood donor matching across all 64 districts.\n' +
      '2. 🎒 **Child Education & Empowerment:** Educational kits, uniforms, and stipends for underprivileged children.\n' +
      '3. 🌊 **Emergency Disaster Relief:** Rapid grassroots deployment during floods and cyclones.\n' +
      '4. ❄️ **Winter Aid Drives:** Annual distribution of heavy blankets and winter clothes.\n' +
      '5. 📑 **Radical Transparency:** Public audited receipts and financial accountability.',
    actionCard: {
      title: 'আমাদের ৫টি মানবিক উইং ও স্থায়ী কর্মসূচি',
      subtitle: 'টেকসই সামাজিক উন্নয়নে ইনফিনিটি বাংলাদেশের উদ্যোগসমূহ',
      badge: 'উইং ও কর্মসূচি',
      pageRoute: 'programs',
      buttonLabel: 'সকল প্রোগ্রাম দেখুন',
      variant: 'emerald'
    },
    quickPrompts: ['🩸 রক্তদাতা খুঁজুন', '🎒 শিশু শিক্ষা উদ্যোগ', '🌊 জরুরি বন্যা ত্রাণ']
  },

  // 4. Blood Eligibility & Medical Guidelines
  {
    id: 'blood-eligibility',
    category: 'blood',
    keywords: [
      'যোগ্যতা', 'কে রক্ত দিতে পারবে', 'কারা রক্ত দিতে পারবে', 'রক্ত দেওয়ার নিয়ম', 'ওজন কত লাগবে',
      'কত বয়স লাগবে', 'eligibility', 'who can donate', 'blood criteria', 'weight requirement',
      'rokto dite ki lage', 'kara rokto dite parbe', 'koto din por por rokto deya jay', 'রক্তদানের ব্যবধান'
    ],
    responseBn:
      '**কারা রক্ত দিতে পারবেন (রক্তদানের মেডিকেল যোগ্যতা):**\n\n' +
      '• **বয়স:** ১৮ থেকে ৬০ বছরের যেকোনো সুস্থ নারী ও পুরুষ।\n' +
      '• **ওজন:** ন্যূনতম ৪৮ কেজি (পুরুষ ও নারী উভয়ের ক্ষেত্রে)।\n' +
      '• **হিমোগ্লোবিন:** পুরুষদের ন্যূনতম ১২.৫ g/dL এবং নারীদের ১২.০ g/dL।\n' +
      '• **রক্তচাপ ও নাড়ির স্পন্দন:** স্বাভাবিক সীমার মধ্যে (সিস্টোলিক ১০০-১৪০, ডায়াস্টোলিক ৬০-৯০ mmHg; পালস ৬০-১০০ bpm)।\n' +
      '• **রক্তদানের ব্যবধান:** সর্বশেষ রক্তদানের পর অন্তত **৪ মাস (১২০ দিন)** অতিবাহিত হতে হবে।\n\n' +
      'নিয়মিত রক্তদানে হৃদরোগ ও স্ট্রোকের ঝুঁকি কমে এবং শরীরে নতুন রক্তকণিকা তৈরি হয়।',
    responseEn:
      '**Blood Donation Eligibility Criteria:**\n\n' +
      '• **Age:** 18 to 60 years.\n' +
      '• **Weight:** Minimum 48 kg.\n' +
      '• **Hemoglobin:** Minimum 12.5 g/dL for males, 12.0 g/dL for females.\n' +
      '• **Blood Pressure:** Normal range (Systolic 100-140, Diastolic 60-90 mmHg).\n' +
      '• **Interval:** Minimum **4 months (120 days)** since your last donation.',
    actionCard: {
      title: 'রক্তদাতা হিসেবে নিবন্ধন করুন',
      subtitle: 'আপনার রক্তে বেঁচে যাক একটি মুমূর্ষু প্রাণ',
      badge: 'রক্তদাতা নিবন্ধন',
      pageRoute: 'blood-donation/become-donor',
      buttonLabel: 'রক্তদাতা ফর্ম পূরণ করুন',
      variant: 'crimson'
    },
    quickPrompts: ['⚠️ কারা রক্ত দিতে পারবেন না?', '💧 রক্তদানের পূর্বে প্রস্তুতি', '🩸 জরুরি রক্ত চাই']
  },

  // 5. Blood Restrictions / Temporary Deferral
  {
    id: 'blood-restrictions',
    category: 'blood',
    keywords: [
      'কারা রক্ত দিতে পারবে না', 'নিষেধাজ্ঞা', 'কখন রক্ত দেওয়া যায় না', 'অসুস্থ', 'ওষুধ খেলে',
      'who cannot donate', 'restrictions', 'deferral', 'antibiotic', 'jaundice', 'fever',
      'osukh', 'medication', 'operation', 'surgery'
    ],
    responseBn:
      '**কারা বা কখন সাময়িকভাবে রক্ত দিতে পারবেন না:**\n\n' +
      '❌ **জ্বর, সর্দি বা ইনফেকশন:** জ্বর সম্পূর্ণ সেরে যাওয়ার অন্তত ৭ দিন পর।\n' +
      '❌ **অ্যান্টিবায়োটিক:** অ্যান্টিবায়োটিক কোর্স শেষ হওয়ার ন্যূনতম ৭ দিন পর্যন্ত অপেক্ষা করতে হবে।\n' +
      '❌ **দাঁত তোলা বা মাইনর সার্জারি:** ডেন্টাল এক্সট্রাকশনের পর অন্তত ৭২ ঘণ্টা এবং বড় সার্জারির পর ৬–১২ মাস।\n' +
      '❌ **ট্যাটু বা পিয়ার্সিং:** শরীরের কোথাও ট্যাটু বা কান/নাক ফোঁড়ানোর পর অন্তত ৬ মাস রক্তদান বন্ধ রাখতে হয়।\n' +
      '❌ **গর্ভাবস্থা ও স্তন্যদান:** সন্তান প্রসব ও স্তন্যদানকালীন সময়ে রক্তদান নিষেধ।\n' +
      '❌ **হেপাটাইটিস বি/সি বা এইচআইভি:** রক্তবাহিত স্থায়ী সংক্রামক রোগের ইতিহাস থাকলে রক্তদান গ্রহণযোগ্য নয়।',
    responseEn:
      '**Blood Donation Restrictions & Deferrals:**\n\n' +
      '• **Fever/Infection:** Wait at least 7 days after full recovery.\n' +
      '• **Antibiotics:** Wait at least 7 days after completing the course.\n' +
      '• **Tooth Extraction:** Wait 72 hours; major surgery requires 6–12 months.\n' +
      '• **Tattoo / Body Piercing:** Wait 6 months.\n' +
      '• **Pregnancy & Breastfeeding:** Defer until weaning.\n' +
      '• **Hepatitis B/C or HIV history:** Ineligible for blood donation.',
    actionCard: {
      title: 'ইনফিনিটি লাইফলাইন রক্তদান নির্দেশিকা',
      subtitle: 'নিরাপদ রক্তদান ও রোগীদের জীবনরক্ষার সার্বিক নিয়মাবলী',
      badge: 'চিকিৎসা তথ্য',
      pageRoute: 'blood-donation',
      buttonLabel: 'লাইফলাইন পেজে দেখুন',
      variant: 'crimson'
    },
    quickPrompts: ['🩸 রক্তদানের যোগ্যতা কী?', '💧 রক্তদানের পূর্বে প্রস্তুতি', '🩸 রক্তদাতা ডিরেক্টরি']
  },

  // 6. Blood Preparation (Before & After)
  {
    id: 'blood-prep',
    category: 'blood',
    keywords: [
      'প্রস্তুতি', 'রক্ত দেওয়ার আগে', 'রক্ত দেওয়ার পর', 'কি খেতে হবে', 'preparation', 'before donation',
      'after donation', 'khabar', 'pani', 'rest', 'ঘুম'
    ],
    responseBn:
      '**রক্তদানের পূর্ব ও পরবর্তী প্রস্তুতি নির্দেশিকা:**\n\n' +
      '💧 **রক্তদানের আগে:**\n' +
      '• আগের রাতে অন্তত ৭-৮ ঘণ্টা ভালো ঘুম নিশ্চিত করুন।\n' +
      '• রক্তদানের ২-৩ ঘণ্টা আগে স্বাস্থ্যকর হালকা খাবার খান (কখনও খালি পেটে রক্ত দেবেন না)।\n' +
      '• অতিরিক্ত তৈলাক্ত বা ভারী খাবার পরিহার করুন এবং রক্তদানের পূর্বে অন্তত ৫০০ মিলি অতিরিক্ত পানি পান করুন।\n' +
      '• রক্তদানের ১ ঘণ্টা আগে ধূমপান থেকে বিরত থাকুন।\n\n' +
      '🛌 **রক্তদানের পর:**\n' +
      '• বেডে ১০–১৫ মিনিট বিশ্রাম নিন। হঠাৎ উঠে দাঁড়াবেন না।\n' +
      '• প্রচুর পানি, জুস ও পুষ্টিকর তরল পান করুন।\n' +
      '• আগামী ২৪ ঘণ্টা ভারী ব্যায়াম বা ওজন তোলা থেকে বিরত থাকুন।',
    responseEn:
      '**Pre & Post Donation Care:**\n\n' +
      '💧 **Before Donation:**\n' +
      '• Get 7-8 hours of sleep the night before.\n' +
      '• Have a nutritious light meal 2-3 hours prior (never donate on an empty stomach).\n' +
      '• Drink an extra 500ml of water or juice.\n' +
      '• Avoid smoking at least 1 hour before donating.\n\n' +
      '🛌 **After Donation:**\n' +
      '• Rest 10-15 minutes on the bed.\n' +
      '• Drink plenty of hydrating fluids.\n' +
      '• Avoid heavy lifting or intense workouts for 24 hours.',
    actionCard: {
      title: 'রক্তদাতা অনুসন্ধান ও সহায়তা ডিরেক্টরি',
      subtitle: '৬৪ জেলার সক্রিয় ও ভেরিফায়েড রক্তদাতাদের সাথে যুক্ত হোন',
      badge: 'লাইফলাইন',
      pageRoute: 'blood-donation/find-donor',
      buttonLabel: 'রক্তদাতা ডিরেক্টরি দেখুন',
      variant: 'crimson'
    },
    quickPrompts: ['🩸 রক্তদাতা হতে চাই', '⚠️ কারা রক্ত দিতে পারবেন না?', '🚨 জরুরি রক্তের আবেদন']
  },

  // 7. Emergency Blood Request
  {
    id: 'blood-emergency',
    category: 'blood',
    keywords: [
      'রক্ত লাগবে', 'জরুরি রক্ত', 'রক্ত প্রয়োজন', 'রক্ত দরকার', 'blood request', 'need blood',
      'rokto lagbe', 'emergency blood', 'রোগীর জন্য রক্ত', 'প্লাটিলেট', 'ব্লাড লাগবে', 'জরুরি ব্লাড',
      'patient', 'hospital', 'হাসপাতাল', 'emergency'
    ],
    responseBn:
      '**জরুরি রক্তের প্রয়োজনে করণীয়:**\n\n' +
      '১. সরাসরি আমাদের **"জরুরি রক্তের আবেদন"** ফর্মটি পূরণ করুন (রোগীর রক্তের গ্রুপ, প্রয়োজনীয় ইউনিট, হাসপাতালের নাম, জেলা ও জরুরি মোবাইল নম্বর)।\n' +
      '২. ফর্ম সাবমিট হওয়া মাত্রই সংশ্লিষ্ট এলাকার রক্তদাতাদের নেটওয়ার্কে তথ্য পৌঁছে যায় এবং আমাদের স্বেচ্ছাসেবকরা তাৎক্ষণিক সমন্বয় শুরু করেন।\n' +
      '৩. অতি জরুরি অবস্থায় আমাদের ২৪/৭ ব্লাড হটলাইনে সরাসরি কল করতে পারেন: **01839-008339**।',
    responseEn:
      '**In an Emergency Blood Situation:**\n\n' +
      '1. Post an instant request via our Emergency Blood Request Form.\n' +
      '2. Include Blood Group, Units needed, Hospital, District, and contact phone.\n' +
      '3. Nearby voluntary donors and area coordinators are notified instantly.\n' +
      '4. Dial our 24/7 emergency dispatch helpline: +880 1839-008339.',
    actionCard: {
      title: 'জরুরি রক্তের আবেদন ফর্ম (তাৎক্ষণিক পোস্ট)',
      subtitle: 'হাসপাতাল ও রোগীর তথ্য দিয়ে রিকুয়েস্ট পোস্ট করুন — সমন্বয়করা দ্রুত যোগাযোগ করবেন',
      badge: 'জরুরি সেবা',
      pageRoute: 'blood-donation/emergency-request',
      phoneCall: '01839008339',
      whatsappNumber: '8801839008339',
      whatsappMessage: 'জরুরি রক্তের প্রয়োজন: ইনফিনিটি বাংলাদেশ জরুরি হেল্পলাইন',
      buttonLabel: 'জরুরি রক্তের ফর্ম পূরণ করুন',
      variant: 'crimson'
    },
    quickPrompts: ['🩸 রক্তদাতা ডিরেক্টরি খুঁজুন', '📞 ব্লাড হটলাইনে কল করুন', '🩸 রক্তদাতা নিবন্ধন']
  },

  // 8. Blood Donor Registration
  {
    id: 'blood-donor-register',
    category: 'blood',
    keywords: [
      'রক্ত দিতে চাই', 'রক্তদাতা হতে চাই', 'ডোনার হতে চাই', 'donor registration', 'become donor',
      'rokto dibo', 'donor form', 'রক্তদান ফর্ম', 'রক্তদাতা নিবন্ধন', 'ডোনার নিবন্ধন', 'নাম লেখাব'
    ],
    responseBn:
      'রক্তদাতা হিসেবে তালিকাভুক্ত হয়ে মানুষের জীবন বাঁচাতে আপনি আমাদের রক্তদাতা নিবন্ধন ফর্মটি পূরণ করতে পারেন।\n\n' +
      '📌 **সুবিধাসমূহ:**\n' +
      '• আপনার রক্তের গ্রুপ ও জেলা অনুযায়ী যখন কোনো মুমূর্ষু রোগীর রক্তের প্রয়োজন হবে, তখনই কেবল যোগাযোগ করা হবে।\n' +
      '• আপনার মোবাইল নম্বরের সর্বোচ্চ নিরাপত্তা ও প্রাইভেসির পূর্ণ নিয়ন্ত্রণ আপনার হাতে।\n' +
      '• রক্তদানের পর আপনি যেকোনো সময় নিজের প্রোফাইল ১২০ দিনের "কুলডাউন (Cooldown)" মোডে রাখতে পারবেন যাতে কেউ আপনাকে বিব্রত না করে।',
    responseEn:
      'Register as a life-saving blood donor on Infinity LifeLine network.\n\n' +
      '• You will only be alerted when patients in your district need your matching blood group.\n' +
      '• Strict privacy and data protection for your personal phone number.\n' +
      '• 120-day cooldown pause available whenever you complete a donation.',
    actionCard: {
      title: 'রক্তদাতা হিসেবে নিবন্ধন ফর্ম',
      subtitle: 'আপনার গ্রুপের রক্তে বাঁচতে পারে একটি মূল্যবান মানব জীবন',
      badge: 'লাইফলাইন নেটওয়ার্ক',
      pageRoute: 'blood-donation/become-donor',
      buttonLabel: 'রক্তদাতা ফর্ম পূরণ করুন',
      variant: 'crimson'
    },
    quickPrompts: ['🩸 রক্তদানের যোগ্যতা কী?', '🔍 রক্তদাতা ডিরেক্টরি', '🚨 জরুরি রক্ত চাই']
  },

  // 9. Blood Donor Search / Directory
  {
    id: 'blood-find',
    category: 'blood',
    keywords: [
      'রক্তদাতা খুঁজছি', 'রক্তদাতা তালিকা', 'রক্তদাতা ডিরেক্টরি', 'ব্লাড গ্রুপ', 'donor search', 'find donor',
      'blood list', 'a+', 'b+', 'o+', 'ab+', 'a-', 'b-', 'o-', 'ab-', 'রক্তের গ্রুপ', 'ব্লাড ডোনার', 'ব্লাড ডোনেশন',
      'rokto khujchi', 'donor list'
    ],
    responseBn:
      'আমাদের ওয়েবসাইটের **"রক্তদাতা ডিরেক্টরি"**-তে গিয়ে আপনার কাঙ্ক্ষিত রক্তের গ্রুপ (A+, B+, O+, AB+, A-, B-, O-, AB-) এবং জেলা নির্বাচন করলেই সরাসরি ভেরিফাইড রক্তদাতাদের তালিকা পেয়ে যাবেন।\n\n' +
      'তালিকাভুক্ত রক্তদাতাদের সাথে সরাসরি কল অথবা এসএমএস-এর মাধ্যমে যোগাযোগ করে রক্তের ব্যবস্থা নিশ্চিত করতে পারেন।',
    responseEn:
      'Filter verified blood donors by selecting your required blood group and district in our Blood Donor Directory. Direct phone and SMS options are provided.',
    actionCard: {
      title: 'রক্তদাতা অনুসন্ধান ডিরেক্টরি (৬৪ জেলা)',
      subtitle: 'গ্রুপভিত্তিক সক্রিয় রক্তদাতাদের তালিকা থেকে সরাসরি যোগাযোগ করুন',
      badge: 'ডিরেক্টরি',
      pageRoute: 'blood-donation/find-donor',
      buttonLabel: 'রক্তদাতা ডিরেক্টরি দেখুন',
      variant: 'crimson'
    },
    quickPrompts: ['🚨 জরুরি রক্তের আবেদন', '🩸 রক্তদাতা নিবন্ধন', '📞 হেল্পলাইন 01839008339']
  },

  // 10. Donation Methods (bKash / Nagad / Bank)
  {
    id: 'donate',
    category: 'donate',
    keywords: [
      'দান', 'টাকা', 'অনুদান', 'বিকাশ', 'নগদ', 'ব্যাংক', 'donate', 'donation', 'money', 'bkash',
      'nagad', 'bank', 'send money', 'taka dibo', 'sahajjo', 'সাহায্য', 'অনুদানের নিয়ম', 'অর্থ',
      'kivabe taka pathabo', 'kivabe taka dibo', 'bkash number', 'nagad number', 'bikashe taka'
    ],
    responseBn:
      '**ইনফিনিটি বাংলাদেশে অনুদান পাঠানোর নিয়মাবলী (১০০% চ্যারিটি নীতি):**\n\n' +
      'আপনার অনুদানের ১০০% সরাসরি অসহায় মানুষের কল্যাণে ব্যয় হবে।\n\n' +
      '📱 **মোবাইল ব্যাংকিং (বিকাশ ও নগদ):**\n' +
      '• আমাদের অফিশিয়াল বিকাশ ও নগদ একাউন্টে আপনার পছন্দসই যেকোনো পরিমাণ অর্থ Send Money বা মার্চেন্ট পে করতে পারেন।\n' +
      '• রেফারেন্সে আপনার নাম বা ক্যাম্পেইনের নাম লিখতে পারেন।\n\n' +
      '🏦 **সরাসরি ব্যাংক স্থানান্তর:**\n' +
      '• অফিশিয়াল ব্যাংক একাউন্টের তথ্য আমাদের অনুদান পোর্টালে বিস্তারিত দেওয়া আছে।\n\n' +
      '🧾 **তাৎক্ষণিক ডিজিটাল রসিদ:** অনুদান জমা দেওয়ার পর ট্রানজেকশন আইডি প্রদান করে পোর্টাল থেকে তাৎক্ষণিক ডিজিটাল মানি রিসিট ডাউনলোড করা যায়।',
    responseEn:
      '**Donation Guidelines (100% Charity Model):**\n\n' +
      '100% of your generous contributions go straight to relief packages and beneficiaries.\n\n' +
      '• **bKash & Nagad:** Send any custom contribution securely via our verified accounts.\n' +
      '• **Bank Wire:** Direct institutional bank account details on our Donate page.\n' +
      '• **Instant Digital Receipt:** Enter transaction details to instantly download an official signed donation voucher.',
    actionCard: {
      title: 'অনলাইন অনুদান পোর্টাল (বিকাশ / নগদ / ব্যাংক)',
      subtitle: '১০০% চ্যারিটি নীতিতে অনুদান দিন ও ডিজিটাল রসিদ সংগ্রহ করুন',
      badge: '১০০% চ্যারিটি',
      pageRoute: 'donate',
      buttonLabel: 'অনুদান পেজে যান',
      variant: 'emerald'
    },
    quickPrompts: ['📑 অডিট রিপোর্ট ও হিসাব', '🏛️ ১০০% চ্যারিটি মডেল কী?', '🌊 চলমান ক্যাম্পেইনসমূহ']
  },

  // 11. Volunteer 8-Step Process
  {
    id: 'volunteer-process',
    category: 'volunteer',
    keywords: [
      'volunteer process', 'volunteer steps', 'ধাপ', '৮ ধাপ', 'ভলান্টিয়ার কীভাবে হব', 'আবেদনের নিয়ম',
      'form e ki lage', 'volunteer step', '৮টি ধাপ', 'কয়টি ধাপ'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশ-এ স্বেচ্ছাসেবক হওয়ার অনলাইন আবেদন ফর্মটি মোট **৮টি স্বচ্ছ ধাপে** সাজানো:\n\n' +
      '• **ধাপ ১ (ব্যক্তিগত তথ্য):** পুরো নাম, মোবাইল নম্বর, ইমেইল ও রক্তের গ্রুপ।\n' +
      '• **ধাপ ২ (শিক্ষাগত পরিচয়):** অধ্যয়নরত শিক্ষাপ্রতিষ্ঠান, বিভাগ ও শিক্ষাবর্ষ।\n' +
      '• **ধাপ ৩ (আগ্রহ ও দক্ষতা):** ত্রাণ বিতরণ, রক্তদান সমন্বয়, গ্রাফিক্স/মিডিয়া, চিকিৎসা/ফার্স্ট এইড ইত্যাদি।\n' +
      '• **ধাপ ৪ (উপস্থিতি ও অঞ্চল):** কোন জেলা ও উপজেলায় আপনি সক্রিয় থাকতে পারবেন।\n' +
      '• **ধাপ ৫ (জরুরি যোগাযোগ):** অভিভাবক বা পরিবারের বিশ্বস্ত ব্যক্তির যোগাযোগের নম্বর।\n' +
      '• **ধাপ ৬ (মোটিভেশন):** স্বেচ্ছাসেবী কাজের অনুপ্রেরণা ও উদ্দেশ্য।\n' +
      '• **ধাপ ৭ (পরিচয়পত্র যাচাই):** শিক্ষার্থী পরিচয়পত্র বা এনআইডি যাচাইকরণ।\n' +
      '• **ধাপ ৮ (চূড়ান্ত পর্যালোচনা):** তথ্য যাচাই করে ডাটাবেজ ও গুগল ড্রাইভে সফল সংরক্ষণ।',
    responseEn:
      'The 8-step Volunteer Application Process at Infinity Bangladesh:\n\n' +
      '1. Personal profile (Name, phone, blood group)\n' +
      '2. Academic institution and year\n' +
      '3. Humanitarian wings & skills (Field relief, blood, media, medical)\n' +
      '4. District & availability\n' +
      '5. Emergency guardian contact\n' +
      '6. Personal motivation statement\n' +
      '7. Identity verification\n' +
      '8. Review & cloud synchronization.',
    actionCard: {
      title: 'স্বেচ্ছাসেবক আবেদন ফর্ম (৮ ধাপ)',
      subtitle: 'অনলাইনে ফর্ম পূরণ করে যুক্ত হোন দেশের অন্যতম সক্রিয় যুব নেটওয়ার্কে',
      badge: '৮-ধাপের আবেদন',
      pageRoute: 'volunteer',
      buttonLabel: 'আবেদন শুরু করুন',
      variant: 'emerald'
    },
    quickPrompts: ['🎓 স্বেচ্ছাসেবক সনদপত্র কীভাবে পাব?', '🏛️ সংগঠনের ইতিহাস', '🩸 রক্তদান নেটওয়ার্ক']
  },

  // 12. Volunteer Certification & Perks
  {
    id: 'volunteer-perks',
    category: 'volunteer',
    keywords: [
      'certificate', 'সনদ', 'সার্টিফিকেট', 'স্বীকৃতি', 'সনদপত্র', 'অভিজ্ঞতা সনদ', 'recognition',
      'certificate kobe pabo', 'volunteer certificate', 'shonod'
    ],
    responseBn:
      '**স্বেচ্ছাসেবক সনদপত্র ও প্রাতিষ্ঠানিক সুবিধা (Certificate & Recognition):**\n\n' +
      '✅ **অফিশিয়াল অভিজ্ঞতা সনদ (Certificate of Recognition):** সফলভাবে ভলান্টিয়ার হিসেবে নিবন্ধিত হয়ে মাঠপর্যায়ের ক্যাম্পেইন বা মানবিক কর্মসূচিতে সক্রিয় অংশগ্রহণের পর সংগঠনের সভাপতি ও সাধারণ সম্পাদক স্বাক্ষরিত প্রাতিষ্ঠানিক সনদপত্র প্রদান করা হয়।\n' +
      '✅ **উচ্চশিক্ষা ও ক্যারিয়ার ভ্যালু:** এই সনদটি দেশে ও বিদেশে উচ্চশিক্ষার স্কলারশিপ, চাকরির আবেদন এবং সামাজিক নেতৃত্বের ক্ষেত্রে একটি জোরালো সহায়ক হিসেবে কাজ করে।\n' +
      '✅ **নেতৃত্ব ও নেটওয়ার্কিং:** দেশের মেধাবী তরুণ, ডাক্তার, প্রকৌশলী ও সমাজকর্মীদের সাথে জাতীয় পর্যায়ে কাজ করার সুযোগ।',
    responseEn:
      '**Volunteer Certification & Recognition:**\n\n' +
      '• Official Certificate of Recognition signed by President & General Secretary after active participation in campaigns.\n' +
      '• Strong credential boost for national and international scholarship and job applications.\n' +
      '• Leadership exposure and nationwide humanitarian networking.',
    actionCard: {
      title: 'স্বেচ্ছাসেবক প্ল্যাটফর্মে যুক্ত হোন',
      subtitle: 'মানবতার সেবায় কাজ করে অর্জন করুন প্রাতিষ্ঠানিক অভিজ্ঞতা সনদ',
      badge: 'অভিজ্ঞতা সনদ',
      pageRoute: 'volunteer',
      buttonLabel: 'স্বেচ্ছাসেবক ফর্ম পূরণ করুন',
      variant: 'emerald'
    },
    quickPrompts: ['📋 ৮টি ধাপের আবেদন প্রক্রিয়া', '👥 কার্যনির্বাহী পরিষদ ২০২৬', '🌊 চলমান ক্যাম্পেইনসমূহ']
  },

  // 13. Audit & Radical Transparency
  {
    id: 'transparency',
    category: 'transparency',
    keywords: [
      'অডিট', 'হিসাব', 'খরচ', 'স্বচ্ছতা', 'রিপোর্ট', 'টাকার হিসাব', 'audit', 'transparency', 'expense',
      'financial', 'report', 'voucher', 'hisab', 'ভাউচার', 'আর্থিক বিবরণী', 'audit report'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশের প্রতিটি অর্থবৎসরের আয়-ব্যয়ের পুঙ্খানুপুঙ্খ হিসাব এবং নিরপেক্ষ চার্টার্ড অ্যাকাউন্ট্যান্ট (CA) ফার্ম কর্তৃক নিরীক্ষিত বাৎসরিক অডিট রিপোর্ট সবার জন্য উন্মুক্ত।\n\n' +
      '📌 **স্বচ্ছতা পোর্টালে যা যা পাবেন:**\n' +
      '• প্রতিটি ক্যাম্পেইনের সংগৃহীত অর্থ ও ব্যয়ের তালিকা।\n' +
      '• মাঠপর্যায়ের ক্রয় রসিদ ও ভাউচারের স্ক্যান কপি।\n' +
      '• বার্ষিক অডিট সার্টিফিকেট ও ব্যালান্স শিট সরাসরি পিডিএফ আকারে ডাউনলোড করার সুযোগ।',
    responseEn:
      'Every financial intake and disbursement at Infinity Bangladesh is audited by independent Chartered Accountants.\n\n' +
      '• Detailed campaign-by-campaign fund expenditure statements.\n' +
      '• Digital scans of vendor purchase vouchers and receipts.\n' +
      '• Downloadable annual audit reports and certified balance sheets.',
    actionCard: {
      title: 'বার্ষিক অডিট ও আর্থিক প্রতিবেদন',
      subtitle: 'নিরপেক্ষ চার্টার্ড অ্যাকাউন্ট্যান্ট নিরীক্ষিত রিপোর্ট ও ভাউচার ডাউনলোড করুন',
      badge: 'স্বচ্ছতা নিশ্চিত',
      pageRoute: 'transparency',
      buttonLabel: 'স্বচ্ছতা ও অডিট পেজ',
      variant: 'amber'
    },
    quickPrompts: ['🏛️ ১০০% চ্যারিটি মডেল কী?', '💳 অনুদান দেওয়ার নিয়ম', '🌊 চলমান ক্যাম্পেইনসমূহ']
  },

  // 14. Leadership & Governance Roster
  {
    id: 'leadership',
    category: 'governance',
    keywords: [
      'কমিটি', 'সভাপতি', 'সাধারণ সম্পাদক', 'নেতৃত্ব', 'পরিচালক', 'উপদেষ্টা', 'committee', 'president',
      'general secretary', 'leadership', 'board', 'executive', 'কার্যনির্বাহী', 'স্থায়ী কমিটি', 'উপদেষ্টা পরিষদ',
      'komiti', 'shovapoti', 'shompodok'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশ একটি গণতান্ত্রিক ও গঠনতান্ত্রিক কাঠামোয় পরিচালিত সংস্থা।\n\n' +
      '🏛️ **শীর্ষ নেতৃত্ব কাঠামো (২০২৬):**\n' +
      '• **প্রতিষ্ঠাতা:** শেখ মোহাম্মদ সাকিব\n' +
      '• **সভাপতি:** মোঃ শহিদুল আলম সাকিব\n' +
      '• **সিনিয়র সহ-সভাপতি:** মোহাম্মদ ইসমাইল\n' +
      '• **সাধারণ সম্পাদক:** সেলিমুর রহমান অপি\n' +
      '• **সাংগঠনিক সম্পাদক:** মোঃ আরফাত\n' +
      '• **অর্থ সম্পাদক:** মোঃ শাহাদাত আলম\n' +
      '• **কেন্দ্রীয় স্থায়ী কমিটির চেয়ারম্যান:** সাকিব আল করিম\n\n' +
      'কার্যনির্বাহী পরিষদের মোট ২৭ জন সম্মানিত সদস্য এবং ৯ জন স্থায়ী কমিটি সদস্যের বিস্তারিত প্রোফাইল কমিটি পেজে রয়েছে।',
    responseEn:
      'Infinity Bangladesh is democratically governed by a 27-member Executive Committee and a 9-member Central Standing Committee.\n\n' +
      '• Founder: Sheikh Mohammad Sakib\n' +
      '• President: MD. SHAHIDUL ALAM SAKIB\n' +
      '• Senior Vice President: MOHAMMAD ISMAIL\n' +
      '• General Secretary: SALIMUR RAHMAN OPI\n' +
      '• Organizing Secretary: MD ARFAT\n' +
      '• Finance Secretary: MD SHAHADAD ALAM\n' +
      '• Standing Committee Chairman: Sakib Al Karim',
    actionCard: {
      title: 'কার্যনির্বাহী পরিষদ (২০২৬) পূর্ণাঙ্গ তালিকা',
      subtitle: 'সকল ২৭ জন সদস্য ও কেন্দ্রীয় স্থায়ী কমিটির পরিচিতি ও পোর্টফোলিও',
      badge: 'নেতৃত্ব পরিষদ',
      pageRoute: 'team/executive-committee',
      buttonLabel: 'কমিটি ও নেতৃত্ব দেখুন',
      variant: 'emerald'
    },
    quickPrompts: ['👑 সভাপতি কে?', '👥 সাধারণ সম্পাদক কে?', '🏛️ স্থায়ী কমিটির চেয়ারম্যান কে?']
  },

  // 15. Contact & Headquarters Helpline
  {
    id: 'contact',
    category: 'general',
    keywords: [
      'যোগাযোগ', 'ফোন', 'ঠিকানা', 'অফিস', 'হটলাইন', 'ইমেইল', 'contact', 'phone', 'address', 'office',
      'helpline', 'email', 'thikana', 'hathazari', 'chattogram', 'হাটহাজারী', 'চট্টগ্রাম', 'কোথায়', 'সরাসরি কথা',
      'phone number', 'hotline', 'office kothay'
    ],
    responseBn:
      '**ইনফিনিটি বাংলাদেশের যোগাযোগ ও কেন্দ্রীয় কার্যালয়:**\n\n' +
      '📍 **কেন্দ্রীয় সমন্বয় কার্যালয়:** হাটহাজারী, চট্টগ্রাম - ৪৩৩০, বাংলাদেশ।\n' +
      '📞 **২৪/৭ জরুরি হটলাইন:** 01839-008339 (সরাসরি কল ও হোয়াটসঅ্যাপ)\n' +
      '✉️ **অফিশিয়াল ইমেইল:** smsakib6452@gmail.com\n' +
      '🌐 **ওয়েবসাইট:** https://infinitybangladesh.vercel.app/\n\n' +
      'যেকোনো জরুরি রক্তের প্রয়োজন, ক্যাম্পেইন সম্পর্কিত তথ্য বা প্রাতিষ্ঠানিক যোগাযোগের জন্য আমাদের বার্তা পাঠাতে পারেন।',
    responseEn:
      '**Infinity Bangladesh Central Headquarters & Helpline:**\n\n' +
      '📍 **Headquarters:** Hathazari, Chattogram - 4330, Bangladesh.\n' +
      '📞 **24/7 Emergency Hotline:** +880 1839-008339\n' +
      '✉️ **Official Email:** smsakib6452@gmail.com\n' +
      '🌐 **Website:** https://infinitybangladesh.vercel.app/',
    actionCard: {
      title: 'যোগাযোগ ও সরাসরি সাপোর্ট কেন্দ্র',
      subtitle: 'কেন্দ্রীয় কার্যালয়: হাটহাজারী, চট্টগ্রাম | হটলাইন: 01839-008339',
      badge: '২৪/৭ সাপোর্ট',
      pageRoute: 'contact',
      phoneCall: '01839008339',
      whatsappNumber: '8801839008339',
      whatsappMessage: 'আসসালামু আলাইকুম, ইনফিনিটি বাংলাদেশ হেল্পডেস্কে তথ্য প্রয়োজন।',
      buttonLabel: 'যোগাযোগ পেজে যান',
      variant: 'slate'
    },
    quickPrompts: ['📞 হটলাইনে সরাসরি কল করুন', '🩸 জরুরি রক্ত চাই', '📋 স্বেচ্ছাসেবক ফর্ম']
  },

  // 16. Active Campaigns & Relief
  {
    id: 'campaigns',
    category: 'wings',
    keywords: [
      'ক্যাম্পেইন', 'ত্রাণ', 'শীতবস্ত্র', 'বন্যা', 'চিকিৎসা', 'campaign', 'relief', 'flood',
      'winter', 'aid', 'জরুরি সেবা', 'চলমান প্রকল্প', 'campaigns'
    ],
    responseBn:
      'আমাদের চলমান মানবিক ক্যাম্পেইনসমূহের মধ্যে রয়েছে:\n\n' +
      '• **জরুরি বন্যা ও দুর্যোগকালীন ত্রাণ কার্যক্রম:** ক্ষতিগ্রস্ত এলাকায় রান্না করা খাবার, শুকনো খাদ্য ও ওষুধ বিতরণ।\n' +
      '• **শীতবস্ত্র ও কম্বল বিতরণ কর্মসূচি:** উত্তরের জেলাগুলো ও পাহাড়ি জনপদে শীতার্তদের মাঝে নতুন কম্বল বিতরণ।\n' +
      '• **রমজান ইফতার ও খাদ্য সামগ্রী ড্রাইভ:** অসচ্ছল পরিবারের মাঝে পূর্ণাঙ্গ মাসের খাদ্য সরবরাহ।\n' +
      '• **ঈদ আনন্দ বিতরণ:** সুবিধাবঞ্চিত শিশুদের নতুন জামা ও উৎসব উপহার প্রদান।\n\n' +
      'প্রতিটি ক্যাম্পেইনের অনুদান অগ্রগতি ও স্বচ্ছতা বিবরণী আমাদের ক্যাম্পেইন পেজে দেখতে পারেন।',
    responseEn:
      'Our ongoing relief campaigns include Emergency Flood Disaster Aid, Winter Warmth Blankets Drive, Ramadan Grocery Food Baskets, and Eid Gifts for Underprivileged Children. Detailed funding progress is available on our Campaigns page.',
    actionCard: {
      title: 'চলমান মানবিক ক্যাম্পেইনসমূহ',
      subtitle: 'মাঠপর্যায়ের জরুরি খাদ্য, চিকিৎসা ও ত্রাণ কার্যক্রমের সার্বিক অগ্রগতি',
      badge: 'ক্যাম্পেইন ট্র্যাকার',
      pageRoute: 'campaigns',
      buttonLabel: 'সকল ক্যাম্পেইন দেখুন',
      variant: 'emerald'
    },
    quickPrompts: ['💳 অনুদান দেওয়ার নিয়ম', '📑 অডিট রিপোর্ট ও হিসাব', '🩸 রক্তদান নেটওয়ার্ক']
  },

  // 17. Sustainable Long-Term Programs
  {
    id: 'programs',
    category: 'wings',
    keywords: [
      'প্রোগ্রাম', 'কার্যক্রম', 'শিক্ষা', 'স্বাস্থ্য', 'শিশু', 'বৃক্ষরোপণ', 'পানি', 'program',
      'education', 'health', 'water', 'tree', 'দীর্ঘমেয়াদী', 'স্থায়ী'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশের স্থায়ী দীর্ঘমেয়াদী কর্মসূচির মধ্যে রয়েছে:\n\n' +
      '১. **সুবিধাবঞ্চিত শিশুদের টেকসই শিক্ষা (Child Education):** স্কুলব্যাগ, খাতা, বই ও মাসিক শিক্ষা সহায়তা।\n' +
      '২. **নিরাপদ সুপেয় পানির টিউবওয়েল স্থাপন:** আর্সেনিকমুক্ত ও নিরাপদ পানির গভীর নলকূপ স্থাপন।\n' +
      '৩. **ফ্রি মেডিকেল ও হেলথ ক্যাম্প:** প্রত্যন্ত অঞ্চলে বিনামূল্যে বিশেষজ্ঞ চিকিৎসাসেবা ও ওষুধ প্রদান।\n' +
      '৪. **দেশব্যাপী বৃক্ষরোপণ অভিযান:** জলবায়ু পরিবর্তন রোধ ও পরিবেশ সুরক্ষায় ফলদ ও বনজ গাছের চারা বিতরণ।',
    responseEn:
      'Infinity Bangladesh runs sustainable development programs: Marginal Child Education, Clean Drinking Water Wells, Free Community Medical Camps, and Nationwide Tree Plantation Drives.',
    actionCard: {
      title: 'দীর্ঘমেয়াদী সামাজিক উন্নয়ন কর্মসূচি',
      subtitle: 'শিক্ষা, স্বাস্থ্যসেবা ও পরিবেশ সংরক্ষণের টেকসই উদ্যোগ',
      badge: 'স্থায়ী কর্মসূচি',
      pageRoute: 'programs',
      buttonLabel: 'প্রোগ্রামসমূহ দেখুন',
      variant: 'emerald'
    },
    quickPrompts: ['🎒 শিশু শিক্ষা উদ্যোগ', '🌊 চলমান ক্যাম্পেইনসমূহ', '📋 ভলান্টিয়ার আবেদন']
  },

  // 18. Media Coverage & News
  {
    id: 'media',
    category: 'general',
    keywords: [
      'মিডিয়া', 'সংবাদ', 'পত্রিকা', 'টিভি', 'news', 'media', 'press', 'coverage', 'tv', 'খবর', 'জার্নাল'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশের মানবিক ও সামাজিক কার্যক্রমসমূহ জাতীয় শীর্ষ দৈনিক পত্রিকা, স্যাটেলাইট টেলিভিশন চ্যানেল এবং অনলাইন সংবাদমাধ্যমে প্রশংসিত ও নিয়মিত প্রচারিত হয়েছে।\n\n' +
      'গণমাধ্যমে প্রকাশিত সংবাদ প্রতিবেদন, ভিডিও রিপোর্ট ও প্রেস রিলিজ দেখতে আমাদের মিডিয়া পেজ ভিজিট করুন।',
    responseEn:
      'Our humanitarian relief campaigns have been featured across leading national newspapers, satellite TV channels, and digital portals. View press releases on our Media Coverage page.',
    actionCard: {
      title: 'মিডিয়া কভারেজ ও প্রেস রিপোর্ট',
      subtitle: 'জাতীয় গণমাধ্যমে প্রকাশিত ইনফিনিটি বাংলাদেশের সংবাদ',
      badge: 'গণমাধ্যম',
      pageRoute: 'media-coverage',
      buttonLabel: 'মিডিয়া কভারেজ দেখুন',
      variant: 'slate'
    },
    quickPrompts: ['🖼️ স্থিরচিত্র ও ভিডিও গ্যালারি', '🏛️ আমাদের সম্পর্কে', '🌊 ক্যাম্পেইনসমূহ']
  },

  // 19. Photo & Video Gallery
  {
    id: 'gallery',
    category: 'general',
    keywords: [
      'ছবি', 'ভিডিও', 'গ্যালারি', 'ইভেন্ট', 'photo', 'video', 'gallery', 'chobi', 'ভিডিও গ্যালারি', 'photos'
    ],
    responseBn:
      'আমাদের মাঠপর্যায়ের ত্রাণ বিতরণ, রক্তদান ক্যাম্প, শীতার্ত মানুষের মাঝে কম্বল বিতরণ ও সামাজিক কাজের বাস্তব স্থিরচিত্র এবং ভিডিও ডকুমেন্টারি আমাদের ফটো ও ভিডিও গ্যালারিতে সংরক্ষিত রয়েছে।',
    responseEn:
      'Explore high-resolution photographs and documentary reels of our field relief, blood donation drives, and community projects in our visual Gallery.',
    actionCard: {
      title: 'মাঠপর্যায়ের স্থিরচিত্র ও ভিডিও গ্যালারি',
      subtitle: 'বাস্তব কার্যক্রমের প্রামাণ্য ছবি ও ডকুমেন্টারি ভিডিও',
      badge: 'গ্যালারি',
      pageRoute: 'gallery',
      buttonLabel: 'গ্যালারি ঘুরে দেখুন',
      variant: 'slate'
    },
    quickPrompts: ['🌊 চলমান ক্যাম্পেইনসমূহ', '🩸 রক্তদান নেটওয়ার্ক', '📋 ভলান্টিয়ার আবেদন']
  },

  // 20. Institutional Partnerships & Alliances
  {
    id: 'partners',
    category: 'general',
    keywords: [
      'পার্টনার', 'অংশীদার', 'সহযোগী', 'সহযোগিতা', 'partner', 'partners', 'alliances', 'institution',
      'hospital partner', 'school partner', 'যৌথ উদ্যোগ'
    ],
    responseBn:
      'ইনফিনিটি বাংলাদেশ দেশের বিভিন্ন শিক্ষাপ্রতিষ্ঠান, ডায়াগনস্টিক সেন্টার, স্থানীয় হাসপাতাল ও যুব ক্লাবের সাথে যৌথ উদ্যোগে কাজ করে থাকে।\n\n' +
      'আপনি যদি আপনার প্রতিষ্ঠান বা ক্লাবের পক্ষ থেকে কোনো যৌথ সামাজিক উদ্যোগ বা রক্তদান কর্মসূচি পরিচালনা করতে চান, তবে সরাসরি আমাদের সাথে পার্টনারশিপের জন্য আবেদন করতে পারেন।',
    responseEn:
      'Infinity Bangladesh collaborates with educational institutions, community diagnostic centers, hospitals, and youth networks. Contact us to establish institutional partnerships for humanitarian causes.',
    actionCard: {
      title: 'প্রাতিষ্ঠানিক অংশীদারিত্ব ও পার্টনার নেটওয়ার্ক',
      subtitle: 'স্কুল, কলেজ ও হাসপাতালের সাথে যৌথ মানবিক উদ্যোগ',
      badge: 'অংশীদারিত্ব',
      pageRoute: 'partners',
      buttonLabel: 'পার্টনার তালিকা দেখুন',
      variant: 'emerald'
    },
    quickPrompts: ['📞 হেল্পলাইন ও অফিস', '🩸 রক্তদান নেটওয়ার্ক', '📋 ভলান্টিয়ার আবেদন']
  },

  // 21. Social Channels & Community
  {
    id: 'social-channels',
    category: 'general',
    keywords: [
      'facebook', 'ফেসবুক', 'ইউটিউব', 'youtube', 'whatsapp', 'হোয়াটসঅ্যাপ', 'সোশ্যাল মিডিয়া',
      'social', 'group', 'page', 'community', 'চ্যানেল'
    ],
    responseBn:
      '**ইনফিনিটি বাংলাদেশের অফিশিয়াল সোশ্যাল চ্যানেলসমূহ:**\n\n' +
      '• **ফেসবুক পেজ:** [facebook.com/infinitybangladesh](https://facebook.com/infinitybangladesh)\n' +
      '• **হটলাইন ও হোয়াটসঅ্যাপ:** [01839-008339](https://wa.me/8801839008339)\n' +
      '• **অফিশিয়াল ওয়েবসাইট:** [infinitybangladesh.vercel.app](https://infinitybangladesh.vercel.app/)\n\n' +
      'আমাদের ফেসবুক পেজ ও কমিউনিটিতে যুক্ত থেকে সর্বশেষ ক্যাম্পেইন ও ব্লাড রিকুয়েস্টের সার্বক্ষণিক আপডেট পেতে পারেন।',
    responseEn:
      'Connect with Infinity Bangladesh across our official digital communities:\n\n' +
      '• Facebook: facebook.com/infinitybangladesh\n' +
      '• WhatsApp & Hotline: +880 1839-008339\n' +
      '• Official Portal: https://infinitybangladesh.vercel.app/',
    actionCard: {
      title: 'হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠান',
      subtitle: 'আমাদের অফিশিয়াল হেল্পলাইন নম্বরে সরাসরি যুক্ত হোন',
      badge: 'কমিউনিটি',
      externalUrl: 'https://wa.me/8801839008339',
      buttonLabel: 'হোয়াটসঅ্যাপে চ্যাট করুন',
      variant: 'emerald'
    },
    quickPrompts: ['🩸 রক্তদাতা ডিরেক্টরি', '💳 অনুদান দেওয়ার নিয়ম', '📞 হেল্পলাইন 01839008339']
  },

  // 22. General FAQ
  {
    id: 'faq',
    category: 'general',
    keywords: [
      'faq', 'প্রশ্ন', 'জিজ্ঞাসা', 'question', 'help', 'জ্ঞানকোষ', 'জিজ্ঞাসাবাদ', 'common questions'
    ],
    responseBn:
      'সংগঠনের আদর্শ, ১০০% চ্যারিটি মডেলের কার্যপদ্ধতি, স্বেচ্ছাসেবী সনদ অর্জন, নিরপেক্ষ অডিট রিপোর্ট, রক্তদানের নিরাপত্তা এবং অনুদান সংক্রান্ত সার্বিক প্রশ্নোত্তর আমাদের FAQ পেজে সাজানো রয়েছে।',
    responseEn:
      'Browse comprehensive answers covering governance, our 100% charity model, volunteer certificates, financial audits, and blood donation rules on our FAQ page.',
    actionCard: {
      title: 'সংগঠনের সার্বিক প্রশ্নোত্তর ব্যাংক',
      subtitle: 'সকল সাধারণ ও আইনি জিজ্ঞাসার পুঙ্খানুপুঙ্খ ব্যাখ্যা',
      badge: 'প্রশ্নোত্তর',
      pageRoute: 'faq',
      buttonLabel: 'FAQ পেজে যান',
      variant: 'amber'
    },
    quickPrompts: ['🏛️ ১০০% চ্যারিটি মডেল কী?', '🩸 রক্তদানের যোগ্যতা কী?', '📋 ৮টি ধাপের আবেদন']
  }
];

export const InfinityAgentBot: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { navigate } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Connect Live Data Context for real-time statistics
  const { bloodDonors, campaigns, reports, volunteers, faqs } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic Live Counts
  const stats = useMemo(() => {
    return {
      donorsCount: bloodDonors ? bloodDonors.length : 0,
      activeDonorsCount: bloodDonors ? bloodDonors.filter(d => d.availabilityStatus !== 'UNAVAILABLE').length : 0,
      campaignsCount: campaigns ? campaigns.length : 0,
      reportsCount: reports ? reports.length : 0,
      volunteersCount: volunteers ? volunteers.length : 0
    };
  }, [bloodDonors, campaigns, reports, volunteers]);

  // Initial welcome message
  const initialWelcomeMessage = useMemo<ChatMessage>(() => {
    return {
      id: 'welcome',
      sender: 'bot',
      text: isBn
        ? `আসসালামু আলাইকুম! আমি Infi Robot — ইনফিনিটি বাংলাদেশের মানবিক এআই সহকারী।\n\n২০১৫ সাল থেকে চট্টগ্রামের হাটহাজারী থেকে পরিচালিত আমাদের এই মানবিক সংগঠনে ১০০% চ্যারিটি মডেলে সেবা প্রদান করা হয়। জরুরি রক্তের জোগান, অনুদানের নিয়ম, স্বেচ্ছাসেবক আবেদন কিংবা অডিট রিপোর্ট—যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন।`
        : `Welcome! I am Infi Robot — the official humanitarian AI companion of Infinity Bangladesh.\n\nOperating since 2015 under a strict 100% Charity Model, we provide emergency blood matching, child education, and disaster relief. Ask me anything about our mission, blood network, donations, or volunteer application forms.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickPrompts: [
        isBn ? '🩸 জরুরি রক্ত চাই' : '🩸 Need Emergency Blood',
        isBn ? '🩸 রক্তদানের যোগ্যতা কী?' : '🩸 Blood Eligibility Rules',
        isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Application',
        isBn ? '💳 অনুদান দেওয়ার নিয়ম' : '💳 How to Donate',
        isBn ? '🏛️ ১০০% চ্যারিটি মডেল কী?' : '🏛️ 100% Charity Model',
        isBn ? '👥 বর্তমান কমিটি ও নেতৃত্ব' : '👥 Executive Committee'
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

  // Copy message text to clipboard
  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Specialized Leadership Query Resolver
  const resolveLeadershipQuery = (cleanQuery: string): KnowledgeIntent | null => {
    // 0. Founder Query (Sheikh Mohammad Sakib)
    if (
      cleanQuery.includes('founder') ||
      cleanQuery.includes('protisthata') ||
      cleanQuery.includes('প্রতিষ্ঠাতা') ||
      cleanQuery.includes('sheikh mohammad sakib') ||
      cleanQuery.includes('mohammad sakib') ||
      cleanQuery.includes('sakib founder')
    ) {
      return {
        id: 'leadership-founder',
        keywords: [],
        responseBn:
          'ইনফিনিটি বাংলাদেশের প্রতিষ্ঠাতা হলেন **শেখ মোহাম্মদ সাকিব (Sheikh Mohammad Sakib)**।\n\n' +
          '২০১৫ সালে তিনি সহপাঠী ও তরুণ সমাজকর্মীদের সাথে নিয়ে চট্টগ্রামের হাটহাজারীতে এই মানবিক সংগঠন প্রতিষ্ঠা করেন। তাঁর দূরদর্শী নেতৃত্বে সংগঠনটি ১০০% চ্যারিটি মডেল এবং লাইফলাইন রক্তদান নেটওয়ার্ক নিয়ে দেশব্যাপী কাজ করছে।\n\n' +
          '📌 **অন্যান্য শীর্ষ নেতৃত্ব:**\n' +
          '• **সভাপতি (২০২৬):** মোঃ শহিদুল আলম সাকিব\n' +
          '• **সাধারণ সম্পাদক (২০২৬):** সেলিমুর রহমান অপি\n' +
          '• **কেন্দ্রীয় স্থায়ী কমিটির চেয়ারম্যান:** সাকিব আল করিম',
        responseEn:
          'The Founder of Infinity Bangladesh is **Sheikh Mohammad Sakib**.\n\n' +
          'In 2015, he established this humanitarian organization in Hathazari, Chattogram alongside compassionate youth.\n\n' +
          '📌 **Key Leadership Roster:**\n' +
          '• President (2026): MD. SHAHIDUL ALAM SAKIB\n' +
          '• General Secretary (2026): SALIMUR RAHMAN OPI\n' +
          '• Central Standing Committee Chairman: Sakib Al Karim',
        actionCard: {
          title: 'সংগঠনের প্রতিষ্ঠাতা ও নেতৃত্ব ইতিহাস',
          subtitle: '২০১৫ সাল থেকে মানবতার সেবায় অবিচল পথচলা',
          badge: 'প্রতিষ্ঠাতা',
          pageRoute: 'about',
          buttonLabel: 'ইতিহাস ও নেতৃত্ব দেখুন',
          variant: 'emerald'
        },
        quickPrompts: ['👑 সভাপতি কে?', '👥 সাধারণ সম্পাদক কে?', '📋 পূর্ণাঙ্গ কমিটি তালিকা']
      };
    }

    // 1. President Query
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
          'তিনি সংগঠনের মাঠপর্যায়ের কার্যক্রম, ক্যাম্পেইন পরিচালনা ও নীতিনির্ধারণে কেন্দ্রীয় নেতৃত্ব দিচ্ছেন।\n\n' +
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

    // 2. General Secretary Query
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

    // 5. Organizing Secretary Query
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

    // 6. Finance Secretary Query
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

    // 7. Specific "Sakib" disambiguation
    if (cleanQuery.includes('sakib') || cleanQuery.includes('shakib') || cleanQuery.includes('সাকিব')) {
      return {
        id: 'leadership-sakib',
        keywords: [],
        responseBn:
          'ইনফিনিটি বাংলাদেশে "সাকিব" নামে সম্মানিত নেতৃবৃন্দ:\n\n' +
          '১. **শেখ মোহাম্মদ সাকিব** — প্রতিষ্ঠাতা (২০১৫)\n' +
          '২. **মোঃ শহিদুল আলম সাকিব** — সভাপতি (কার্যনির্বাহী পরিষদ ২০২৬)\n' +
          '৩. **সাকিব আল করিম** — চেয়ারম্যান (কেন্দ্রীয় স্থায়ী কমিটি)\n' +
          '৪. **মোঃ নিয়াজ উদ্দিন সাকিব** — যুগ্ম সাধারণ সম্পাদক\n' +
          '৫. **মোঃ ইসমাইল নুর সাকিব** — যুগ্ম সাংগঠনিক সম্পাদক',
        responseEn:
          'Leaders named "Sakib" in Infinity Bangladesh:\n\n' +
          '1. Sheikh Mohammad Sakib — Founder (2015)\n' +
          '2. MD. SHAHIDUL ALAM SAKIB — President (Executive Committee 2026)\n' +
          '3. Sakib Al Karim — Chairman (Central Standing Committee)\n' +
          '4. MD. NIAJ UDDIN SAKIB — Joint General Secretary\n' +
          '5. MD. ISMAIL NUR SAKIB — Joint Organizing Secretary',
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

    // 8. Search members by aliases
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

    // 9. Full Committee Query
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
          '• **প্রতিষ্ঠাতা:** শেখ মোহাম্মদ সাকিব\n' +
          '• **সভাপতি:** মোঃ শহিদুল আলম সাকিব\n' +
          '• **সিনিয়র সহ-সভাপতি:** মোহাম্মদ ইসমাইল\n' +
          '• **সহ-সভাপতি:** জয়নুল আবেদীন ও সোহেল আকরাম সবুজ\n' +
          '• **সাধারণ সম্পাদক:** সেলিমুর রহমান অপি\n' +
          '• **যুগ্ম সাধারণ সম্পাদক:** এনায়েত উল্লাহ ফরহাদ সহ ৫ জন\n' +
          '• **সাংগঠনিক সম্পাদক:** মোঃ আরফাত\n' +
          '• **অর্থ সম্পাদক:** মোঃ শাহাদাত আলম\n' +
          '• **কেন্দ্রীয় স্থায়ী কমিটির চেয়ারম্যান:** সাকিব আল করিম\n\n' +
          'সকল ২৭ জন কার্যনির্বাহী সদস্যের ছবি ও পরিচিতি দেখতে নিচের বোতামে ক্লিক করুন।',
        responseEn:
          'Infinity Bangladesh is governed by a 27-member Executive Committee (2026) and a 9-member Central Standing Committee:\n\n' +
          '• Founder: Sheikh Mohammad Sakib\n' +
          '• President: MD. SHAHIDUL ALAM SAKIB\n' +
          '• Senior Vice President: MOHAMMAD ISMAIL\n' +
          '• General Secretary: SALIMUR RAHMAN OPI\n' +
          '• Standing Committee Chairman: Sakib Al Karim',
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

    // 1. Leadership Query Handler
    const leadershipMatch = resolveLeadershipQuery(cleanQuery);
    if (leadershipMatch) {
      return leadershipMatch;
    }

    // 2. Specific Blood Sub-Intents Disambiguation
    if (
      cleanQuery.includes('যোগ্যতা') ||
      cleanQuery.includes('who can donate') ||
      cleanQuery.includes('kara rokto dite') ||
      cleanQuery.includes('koto din por por') ||
      cleanQuery.includes('ojon koto') ||
      cleanQuery.includes('ওজন কত') ||
      cleanQuery.includes('বয়স কত') ||
      cleanQuery.includes('ব্যবধান')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-eligibility') || null;
    }

    if (
      cleanQuery.includes('নিষেধাজ্ঞা') ||
      cleanQuery.includes('পারবে না') ||
      cleanQuery.includes('parbe na') ||
      cleanQuery.includes('restrictions') ||
      cleanQuery.includes('osukh') ||
      cleanQuery.includes('ওষুধ') ||
      cleanQuery.includes('জ্বর') ||
      cleanQuery.includes('ট্যাটু') ||
      cleanQuery.includes('সার্জারি')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-restrictions') || null;
    }

    if (
      cleanQuery.includes('প্রস্তুতি') ||
      cleanQuery.includes('আগে কি') ||
      cleanQuery.includes('পরে কি') ||
      cleanQuery.includes('preparation') ||
      cleanQuery.includes('ki khete hobe') ||
      cleanQuery.includes('ঘুম')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-prep') || null;
    }

    if (
      cleanQuery.includes('রক্ত দিতে') ||
      cleanQuery.includes('রক্তদাতা হতে') ||
      cleanQuery.includes('ডোনার হতে') ||
      cleanQuery.includes('become donor') ||
      cleanQuery.includes('donor reg') ||
      cleanQuery.includes('ডোনার নিবন্ধন') ||
      cleanQuery.includes('rokto dibo')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-donor-register') || null;
    }

    if (
      cleanQuery.includes('জরুরি রক্ত') ||
      cleanQuery.includes('রক্ত লাগবে') ||
      cleanQuery.includes('রক্ত প্রয়োজন') ||
      cleanQuery.includes('রক্ত দরকার') ||
      cleanQuery.includes('need blood') ||
      cleanQuery.includes('emergency blood') ||
      cleanQuery.includes('rokto lagbe') ||
      cleanQuery.includes('urgent blood')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-emergency') || null;
    }

    if (
      cleanQuery.includes('রক্তদাতা খুঁজ') ||
      cleanQuery.includes('রক্ত খুঁজ') ||
      cleanQuery.includes('donor search') ||
      cleanQuery.includes('find donor') ||
      cleanQuery.includes('donor list') ||
      cleanQuery.includes('ডিরেক্টরি') ||
      cleanQuery.includes('rokto khuj')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-find') || null;
    }

    // 3. Volunteer Sub-Intents
    if (
      cleanQuery.includes('ধাপ') ||
      cleanQuery.includes('৮ ধাপ') ||
      cleanQuery.includes('step') ||
      cleanQuery.includes('process') ||
      cleanQuery.includes('kivabe form')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'volunteer-process') || null;
    }

    if (
      cleanQuery.includes('সনদ') ||
      cleanQuery.includes('সার্টিফিকেট') ||
      cleanQuery.includes('certificate') ||
      cleanQuery.includes('shonod')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'volunteer-perks') || null;
    }

    // 4. 100% Charity Model
    if (
      cleanQuery.includes('100%') ||
      cleanQuery.includes('১০০%') ||
      cleanQuery.includes('প্রশাসনিক') ||
      cleanQuery.includes('admin cost') ||
      cleanQuery.includes('charity model')
    ) {
      return KNOWLEDGE_BASE.find(i => i.id === 'charity-model-100') || null;
    }

    // 5. Check exact keywords across all intents
    for (const intent of KNOWLEDGE_BASE) {
      for (const kw of intent.keywords) {
        if (cleanQuery.includes(kw.toLowerCase())) {
          return intent;
        }
      }
    }

    // 6. Secondary Heuristics
    if (cleanQuery.includes('রক্ত') || cleanQuery.includes('blood') || cleanQuery.includes('rokto')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'blood-find') || null;
    }
    if (cleanQuery.includes('টাকা') || cleanQuery.includes('দান') || cleanQuery.includes('donate') || cleanQuery.includes('bkash')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'donate') || null;
    }
    if (cleanQuery.includes('ভলান্টিয়ার') || cleanQuery.includes('স্বেচ্ছাসেবক') || cleanQuery.includes('volunteer')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'volunteer-process') || null;
    }
    if (cleanQuery.includes('উইং') || cleanQuery.includes('wing') || cleanQuery.includes('শাখা') || cleanQuery.includes('কর্মসূচি')) {
      return KNOWLEDGE_BASE.find(i => i.id === 'humanitarian-wings') || null;
    }

    // 7. Dynamic Fallback to CMS FAQ
    if (faqs && faqs.length > 0) {
      for (const faq of faqs) {
        const qEn = (faq.question?.en || '').toLowerCase();
        const qBn = (faq.question?.bn || '').toLowerCase();
        const words = cleanQuery.split(/\s+/).filter(w => w.length > 3);
        const match = words.some(w => qEn.includes(w) || qBn.includes(w));
        if (match) {
          return {
            id: `faq-${faq.id}`,
            keywords: [],
            responseBn: `📌 **${faq.question?.bn || faq.question?.en}**\n\n${faq.answer?.bn || faq.answer?.en}`,
            responseEn: `📌 **${faq.question?.en || faq.question?.bn}**\n\n${faq.answer?.en || faq.answer?.bn}`,
            actionCard: {
              title: 'সাধারণ প্রশ্নোত্তর ব্যাংক (FAQ)',
              subtitle: 'সংগঠনের পূর্ণাঙ্গ প্রশ্নোত্তর ব্যাংক দেখুন',
              badge: 'FAQ',
              pageRoute: 'faq',
              buttonLabel: 'FAQ পেজ দেখুন',
              variant: 'amber'
            }
          };
        }
      }
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
        let text = isBn ? matched.responseBn : matched.responseEn;

        // Augment with Live Database Context if relevant
        if (matched.category === 'blood' && stats.donorsCount > 0) {
          text += isBn
            ? `\n\n📊 [রিয়েল-টাইম তথ্য: ইনফিনিটি প্ল্যাটফর্মে বর্তমানে ৬৪ জেলার মোট ${stats.donorsCount} জন নিবন্ধিত রক্তদাতা সক্রিয় আছেন]`
            : `\n\n📊 [Live Status: Currently ${stats.donorsCount} verified donors registered across 64 districts]`;
        } else if (matched.id === 'campaigns' && stats.campaignsCount > 0) {
          text += isBn
            ? `\n\n📊 [চলমান মানবিক ক্যাম্পেইন: ${stats.campaignsCount}টি সক্রিয় প্রকল্প পরিচালিত হচ্ছে]`
            : `\n\n📊 [Live Status: ${stats.campaignsCount} active humanitarian campaigns ongoing]`;
        } else if (matched.id === 'transparency' && stats.reportsCount > 0) {
          text += isBn
            ? `\n\n📊 [নিরীক্ষিত প্রতিবেদন: ${stats.reportsCount}টি অডিট রিপোর্ট ও হিসাব বিবরণী উন্মুক্ত রয়েছে]`
            : `\n\n📊 [Transparency: ${stats.reportsCount} audited reports published]`;
        }

        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: matched.actionCard,
          quickPrompts: matched.quickPrompts || [
            isBn ? '🩸 রক্তদাতা ডিরেক্টরি' : '🩸 Donor Directory',
            isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Form',
            isBn ? '💳 অনুদান পোর্টাল' : '💳 Donation Portal'
          ]
        };
      } else {
        // Courteous fallback with quick direct lines
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: isBn
            ? 'আপনার প্রশ্নের সরাসরি সুনির্দিষ্ট তথ্য পেতে আপনি নিচের কুইক অপশনগুলো ব্যবহার করতে পারেন অথবা জরুরি প্রয়োজনে আমাদের ২৪/৭ সমন্বয়ক হেল্পলাইনে (01839-008339) সরাসরি কল বা হোয়াটসঅ্যাপ করতে পারেন।'
            : 'To best assist you, here are our direct access navigators. You can also reach our 24/7 coordinator helpline directly at +880 1839-008339 via phone or WhatsApp.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'যোগাযোগ ও সহায়তা ডেস্ক',
            subtitle: '২৪/৭ সার্বক্ষণিক হটলাইন: 01839-008339 | কেন্দ্রীয় কার্যালয়: হাটহাজারী, চট্টগ্রাম',
            badge: 'হেল্পডেস্ক',
            pageRoute: 'contact',
            phoneCall: '01839008339',
            whatsappNumber: '8801839008339',
            whatsappMessage: 'আসসালামু আলাইকুম, ইনফিনিটি বাংলাদেশ হেল্পডেস্কে তথ্য প্রয়োজন।',
            buttonLabel: 'যোগাযোগ পেজে যান',
            variant: 'slate'
          },
          quickPrompts: [
            isBn ? '🩸 জরুরি রক্ত চাই' : '🩸 Need Blood',
            isBn ? '🩸 রক্তদানের যোগ্যতা কী?' : '🩸 Eligibility',
            isBn ? '📋 স্বেচ্ছাসেবক আবেদন ফর্ম' : '📋 Volunteer Application',
            isBn ? '💳 অনুদান দেওয়ার নিয়ম' : '💳 How to Donate'
          ]
        };
      }

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 380);
  };

  const handleActionClick = (card: BotActionCard) => {
    if (card.phoneCall) {
      window.location.href = `tel:${card.phoneCall}`;
      return;
    }
    if (card.whatsappNumber) {
      const msg = card.whatsappMessage ? encodeURIComponent(card.whatsappMessage) : '';
      window.open(`https://wa.me/${card.whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (card.externalUrl) {
      window.open(card.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (card.pageRoute) {
      navigate(card.pageRoute, card.slug, card.subSlug);
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
      <div className="fixed bottom-[72px] right-3 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-12 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isBn ? 'ইনফি রোবট খুলুন' : 'Open Infi Robot'}
          className="relative group flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none"
        >
          {/* Desktop Hover Tooltip */}
          <div className="hidden lg:flex items-center absolute right-full mr-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-30">
            <span className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-white/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isBn ? 'ইনফি রোবট (সাহায্যকারী)' : 'Infi Robot (AI Assistant)'}
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

                {/* 2. 3D Frosted Glass Pedestal Dock */}
                <div className="absolute bottom-0 w-[34px] sm:w-[54px] h-[8.5px] sm:h-[15px] rounded-[100%] bg-gradient-to-b from-white/95 via-white/70 to-emerald-50/40 backdrop-blur-xl border border-white/90 shadow-[0_4px_12px_-2px_rgba(0,106,78,0.25),0_1.5px_3px_rgba(0,0,0,0.04),inset_0_1px_1.5px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,106,78,0.1)] flex items-center justify-center pointer-events-none">
                  <div className="absolute inset-[1.5px] sm:inset-[2px] rounded-[100%] border border-emerald-400/40 bg-gradient-to-tr from-emerald-500/15 via-teal-400/20 to-emerald-400/5 blur-[0.5px]" />
                  <div className="absolute top-[1px] sm:top-[1.5px] inset-x-2 sm:inset-x-2.5 h-[0.75px] sm:h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
                  <span className="absolute -top-0.5 right-0.5 sm:right-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5 z-30">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 border border-white shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                  </span>
                </div>

                {/* 3. Dynamic Contact Shadow on top of Glass Disc */}
                <motion.div
                  animate={{ scale: [1, 0.75, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1 sm:bottom-1.5 w-5 sm:w-8 h-1 sm:h-1.5 bg-emerald-950/40 blur-[1.5px] sm:blur-[2px] rounded-[100%] z-10 pointer-events-none"
                />

                {/* 4. Robot Container with levitation */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-20 w-10 h-10 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center mb-1 sm:mb-1.5"
                >
                  <div className="absolute inset-1 sm:inset-2 bg-emerald-400/25 blur-md sm:blur-lg rounded-full animate-pulse pointer-events-none" />
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

      {/* Interactive Chat Popover Window */}
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
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/80 line-clamp-1">
                    {isBn ? 'মানবিক এআই সহকারী • ১০০% চ্যারিটি মডেল' : 'Humanitarian AI Assistant • 100% Charity Model'}
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
                        className={`relative group rounded-2xl px-4 py-3 leading-relaxed shadow-warm-xs ${
                          isBot
                            ? 'bg-white border border-[#EAE3D9] text-slate-800 rounded-tl-sm'
                            : 'bg-[#006A4E] text-white rounded-tr-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* Copy button for Bot Messages */}
                        {isBot && (
                          <div className="flex justify-end pt-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              title={isBn ? 'টেক্সট কপি করুন' : 'Copy message'}
                              className="text-[10px] text-slate-400 hover:text-[#006A4E] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{isBn ? 'কপি' : 'Copy'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
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

                          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
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

                            {/* Optional Direct Call Button */}
                            {msg.actionCard.phoneCall && (
                              <a
                                href={`tel:${msg.actionCard.phoneCall}`}
                                className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Phone className="w-3 h-3 text-[#006A4E]" />
                                <span>হটলাইনে কল করুন ({msg.actionCard.phoneCall})</span>
                              </a>
                            )}

                            {/* Optional Direct WhatsApp Button */}
                            {msg.actionCard.whatsappNumber && (
                              <a
                                href={`https://wa.me/${msg.actionCard.whatsappNumber}?text=${encodeURIComponent(msg.actionCard.whatsappMessage || 'Hello Infinity Bangladesh')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
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
                        ? 'প্রশ্ন করুন (যেমন: রক্ত চাই, বিকাশ, যোগ্যতা, ভলান্টিয়ার...)'
                        : 'Ask anything (e.g. need blood, donate, eligibility, volunteer)...'
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
                  onClick={() => handleSendMessage(isBn ? 'হটলাইন' : 'Helpline')}
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
