import { PageRoute } from '../types';

export interface RouteMeta {
  title: { en: string; bn: string };
  description: { en: string; bn: string };
}

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  home: {
    title: {
      en: 'Infinity Bangladesh | United for Humanity — Official Platform',
      bn: 'ইনফিনিটি বাংলাদেশ | মানবতার জন্য একতাবদ্ধ — অফিসিয়াল প্ল্যাটফর্ম'
    },
    description: {
      en: 'Official website of Infinity Bangladesh (Team Infinity). Delivering emergency voluntary blood donation, child education, flood relief, and youth empowerment since 2015.',
      bn: 'ইনফিনিটি বাংলাদেশ (টিম ইনফিনিটি) এর অফিশিয়াল ওয়েবসাইট। ২০১৫ সাল থেকে স্বেচ্ছায় রক্তদান, সুবিধাবঞ্চিত শিশুদের শিক্ষা ও জরুরি মানবিক সহায়তা প্রদান।'
    }
  },
  'blood-donation': {
    title: {
      en: 'Infinity LifeLine — Voluntary Blood Donation Network | Infinity Bangladesh',
      bn: 'ইনফিনিটি লাইফলাইন — স্বেচ্ছায় রক্তদান নেটওয়ার্ক | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Search verified blood donors, request emergency blood, or register as a voluntary blood donor across Bangladesh with Infinity LifeLine.',
      bn: 'জরুরি রক্তের আবেদন করুন, রক্তদাতা খুঁজুন বা ইনফিনিটি লাইফলাইনের মাধ্যমে স্বেচ্ছাসেবী রক্তদাতা হিসেবে নিবন্ধন করুন।'
    }
  },
  'blood-donation/emergency-request': {
    title: {
      en: 'Emergency Blood Request | Infinity LifeLine',
      bn: 'জরুরি রক্তের আবেদন | ইনফিনিটি লাইফলাইন'
    },
    description: {
      en: 'Submit an emergency blood request immediately. Our volunteer coordination team assists patients across Bangladesh 24/7.',
      bn: 'জরুরি রক্তের জন্য দ্রুত আবেদন ফর্ম পূরণ করুন। আমাদের স্বেচ্ছাসেবক দল সারা বাংলাদেশে রোগীদের তাৎক্ষণিক সহায়তা প্রদানে নিয়োজিত।'
    }
  },
  'blood-donation/become-donor': {
    title: {
      en: 'Register as a Blood Donor | Infinity LifeLine',
      bn: 'রক্তদাতা হিসেবে নিবন্ধন করুন | ইনফিনিটি লাইফলাইন'
    },
    description: {
      en: 'Join the Infinity LifeLine blood donor network. Save precious lives by registering your blood group and location.',
      bn: 'ইনফিনিটি লাইফলাইন রক্তদান নেটওয়ার্কে যোগ দিন। আপনার রক্তের গ্রুপ ও এলাকা নিবন্ধন করে মানুষের জীবন বাঁচাতে অংশ নিন।'
    }
  },
  'blood-donation/find-donor': {
    title: {
      en: 'Find Verified Blood Donors | Infinity LifeLine',
      bn: 'রক্তদাতা খুঁজুন | ইনফিনিটি লাইফলাইন'
    },
    description: {
      en: 'Search available and verified blood donors by group and district across Bangladesh.',
      bn: 'রক্তের গ্রুপ ও জেলা অনুযায়ী ভেরিফাইড রক্তদাতাদের খুঁজুন ও দ্রুত যোগাযোগ করুন।'
    }
  },
  'blood-donation/statistics': {
    title: {
      en: 'Blood Donation Statistics & Impact | Infinity LifeLine',
      bn: 'রক্তদান পরিসংখ্যান ও প্রভাব | ইনফিনিটি লাইফলাইন'
    },
    description: {
      en: 'Live transparent statistics of blood bags coordinated, registered donors, and emergency responses.',
      bn: 'সংগৃহীত রক্তের ব্যাগ, নিবন্ধিত রক্তদাতা এবং জরুরি সেবা সম্পর্কিত লাইভ পরিসংখ্যান।'
    }
  },
  donate: {
    title: {
      en: 'Support Our Humanitarian Mission — Donate | Infinity Bangladesh',
      bn: 'আমাদের মানবিক উদ্যোগে সহায়তা করুন — অনুদান দিন | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Support child education, winter relief, medical aid, and emergency disaster relief. 100% transparent donation channels via bKash, Nagad, and Bank.',
      bn: 'সুবিধাবঞ্চিত শিশুদের শিক্ষা, শীতবস্ত্র ও জরুরি ত্রাণ কার্যক্রমে অনুদান দিন। বিকাশ, নগদ ও ব্যাংকের মাধ্যমে ১০০% স্বচ্ছ অনুদান।'
    }
  },
  volunteer: {
    title: {
      en: 'Join Team Infinity — Become a Volunteer | Infinity Bangladesh',
      bn: 'টিম ইনফিনিটিতে যোগ দিন — স্বেচ্ছাসেবী হন | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Apply to become a verified volunteer at Infinity Bangladesh. Empower communities, lead field drives, and create lasting social impact.',
      bn: 'ইনফিনিটি বাংলাদেশে স্বেচ্ছাসেবক হিসেবে যোগ দিন এবং সুবিধাবঞ্চিত মানুষের পাশে দাঁড়িয়ে সমাজ পরিবর্তনে অংশ নিন।'
    }
  },
  transparency: {
    title: {
      en: 'Financial Transparency & Audit Reports | Infinity Bangladesh',
      bn: 'আর্থিক স্বচ্ছতা ও অডিট রিপোর্ট | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Access certified financial accounts, bank audit statements, expense vouchers, and governance disclosures of Infinity Bangladesh.',
      bn: 'ইনফিনিটি বাংলাদেশের বিস্তারিত আর্থিক হিসাব, বাৎসরিক অডিট রিপোর্ট ও স্বচ্ছ পরিচালনা ব্যবস্থার নথিপত্র দেখুন।'
    }
  },
  campaigns: {
    title: {
      en: 'Active Humanitarian Campaigns & Relief Drives | Infinity Bangladesh',
      bn: 'মানবিক ক্যাম্পেইন ও ত্রাণ কার্যক্রম | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Discover our active and completed humanitarian campaigns including winter warmth, flood response, and education support.',
      bn: 'আমাদের চলমান ও সমাপ্ত মানবিক ক্যাম্পেইনসমূহ, শীতবস্ত্র বিতরণ ও জরুরি ত্রাণ কার্যক্রম দেখুন।'
    }
  },
  'campaigns/detail': {
    title: {
      en: 'Campaign Details & Field Drive | Infinity Bangladesh',
      bn: 'ক্যাম্পেইনের বিস্তারিত ও কার্যক্রম | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Detailed overview, target goals, beneficiary stories, and transparent reports of this humanitarian campaign.',
      bn: 'এই মানবিক ক্যাম্পেইনের মূল লক্ষ্য, সুবিধাভোগীদের তথ্য এবং স্বচ্ছ অগ্রগতি বিবরণী।'
    }
  },
  programs: {
    title: {
      en: 'Sustainable Programs & Child Welfare | Infinity Bangladesh',
      bn: 'স্থায়ী মানবিক কর্মসূচি ও শিশু কল্যাণ | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Explore our long-term sustainable programs focused on child education, youth skill development, and health initiatives.',
      bn: 'শিশু শিক্ষা, যুব উন্নয়ন ও স্বাস্থ্য সচেতনতাবিষয়ক আমাদের দীর্ঘমেয়াদী কর্মসূচিগুলো জানুন।'
    }
  },
  'programs/detail': {
    title: {
      en: 'Program Details | Infinity Bangladesh',
      bn: 'কর্মসূচির বিস্তারিত বিবরণ | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Objectives, implementation methodology, and community impact of this sustainable program.',
      bn: 'এই দীর্ঘমেয়াদী কর্মসূচির রূপরেখা, বাস্তবায়ন কৌশল ও সামাজিক অর্জনের বিবরণ।'
    }
  },
  about: {
    title: {
      en: 'About Us — 11-Year Humanitarian Journey | Infinity Bangladesh',
      bn: 'আমাদের সম্পর্কে — ১১ বছরের মানবিক পথচলা | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Learn about the history, vision, mission, and core values of Infinity Bangladesh (Team Infinity) since its establishment in 2015.',
      bn: '২০১৫ সাল থেকে যাত্রা শুরু করা ইনফিনিটি বাংলাদেশের ইতিহাস, লক্ষ্য, উদ্দেশ্য ও আদর্শ সম্পর্কে জানুন।'
    }
  },
  team: {
    title: {
      en: 'Leadership & Team Directory | Infinity Bangladesh',
      bn: 'নেতৃত্ব ও সাংগঠনিক পরিষদ | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Meet the executive trustees, standing committees, and dedicated coordinators steering Infinity Bangladesh.',
      bn: 'ইনফিনিটি বাংলাদেশের নির্বাহী পরিষদ, স্থায়ী কমিটি ও সমন্বয়কদের পরিচিতি।'
    }
  },
  'about/executive-committee': {
    title: {
      en: 'Executive Committee & Leadership Board | Infinity Bangladesh',
      bn: 'কার্যনির্বাহী পরিষদ ও পরিচালনা পর্ষদ | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Official executive committee members, advisors, and leadership board of Infinity Bangladesh.',
      bn: 'ইনফিনিটি বাংলাদেশের সম্মানিত কার্যনির্বাহী পরিষদ সদস্য ও উপদেষ্টামণ্ডলীর তালিকা।'
    }
  },
  'about/standing-committees': {
    title: {
      en: 'Standing Committees & Departments | Infinity Bangladesh',
      bn: 'স্থায়ী উপ-কমিটিসসমূহ ও বিভাগ | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Discover the specialized standing committees driving blood donation, education, event logistics, and relief.',
      bn: 'রক্তদান, শিক্ষা, লজিস্টিকস ও প্রচার বিভাগ পরিচালনাকারী স্থায়ী উপ-কমিটিসমূহ।'
    }
  },
  'about/past-committees': {
    title: {
      en: 'Past Executive Committees & Organizational Heritage | Infinity Bangladesh',
      bn: 'পূর্ববর্তী পরিষদ ও ইতিহাস | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Archived records and leadership profiles of former executive committees of Infinity Bangladesh since 2015.',
      bn: '২০১৫ সাল থেকে ইনফিনিটি বাংলাদেশের সকল সাবেক কার্যনির্বাহী পরিষদের আর্কাইভ ও ইতিহাস।'
    }
  },
  impact: {
    title: {
      en: 'Our Impact & Groundwork Reach | Infinity Bangladesh',
      bn: 'আমাদের মাঠপর্যায়ের প্রভাব ও অর্জন | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Explore data-driven metrics of lives touched, blood bags coordinated, and community development across Bangladesh.',
      bn: 'সংগঠিত রক্তদানের ব্যাগ, উপকৃত সুবিধাভোগী এবং সামাজিক প্রভাবের তথ্যভিত্তিক পরিসংখ্যান।'
    }
  },
  stories: {
    title: {
      en: 'Real Impact Stories & Humanity in Action | Infinity Bangladesh',
      bn: 'বাস্তব প্রভাব ও মানবিক গল্প | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Inspiring personal stories and testimonials of hope and resilience from the communities we serve.',
      bn: 'মাঠপর্যায়ে মানুষের জীবন পরিবর্তনের অনুপ্রেরণাদায়ী বাস্তব গল্প ও প্রত্যক্ষদর্শীদের অনুভূতি।'
    }
  },
  'stories/detail': {
    title: {
      en: 'Impact Story | Infinity Bangladesh',
      bn: 'মানবিক গল্প | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Read the inspiring story of change, empathy, and resilience supported by Infinity Bangladesh.',
      bn: 'ইনফিনিটি বাংলাদেশের সহায়তায় মানুষের জীবন পরিবর্তনের বাস্তব ও হৃদয়স্পর্শী গল্প।'
    }
  },
  gallery: {
    title: {
      en: 'Photo Gallery & Field Groundwork | Infinity Bangladesh',
      bn: 'ফটো গ্যালারি ও মাঠপর্যায়ের কার্যক্রম | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'High-resolution photo moments from relief distributions, blood donation camps, and youth gatherings.',
      bn: 'ত্রাণ বিতরণ, রক্তদান ক্যাম্পেইন ও বিভিন্ন সামাজিক ইভেন্টের আলোকচিত্র সংগ্রহশালা।'
    }
  },
  videos: {
    title: {
      en: 'Video Documentaries & Ground Stories | Infinity Bangladesh',
      bn: 'ভিডিও গ্যালারি ও ডকুমেন্টারি | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Watch field documentaries, volunteer interviews, and humanitarian project videos from Infinity Bangladesh.',
      bn: 'আমাদের মাঠপর্যায়ের প্রামাণ্যচিত্র, স্বেচ্ছাসেবকদের অভিজ্ঞতা ও ইভেন্ট ভিডিও দেখুন।'
    }
  },
  news: {
    title: {
      en: 'News & Official Announcements | Infinity Bangladesh',
      bn: 'সংবাদ ও অফিসিয়াল বিজ্ঞপ্তি | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Latest press releases, official organizational circulars, and activity updates from Team Infinity.',
      bn: 'টিম ইনফিনিটির সাম্প্রতিক কার্যক্রমের খবর, প্রেস বিজ্ঞপ্তি ও গুরুত্বপূর্ণ ঘোষণা।'
    }
  },
  'news/detail': {
    title: {
      en: 'News Article & Press Release | Infinity Bangladesh',
      bn: 'সংবাদ ও প্রেস বিজ্ঞপ্তি | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Official press coverage and detailed announcement from Infinity Bangladesh.',
      bn: 'ইনফিনিটি বাংলাদেশের অফিসিয়াল প্রেস কাভারেজ ও বিস্তারিত বিজ্ঞপ্তি।'
    }
  },
  events: {
    title: {
      en: 'Humanitarian Events & Field Drives | Infinity Bangladesh',
      bn: 'ইভেন্টসমূহ ও মানবিক কার্যক্রম | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Upcoming and past public events, blood drives, youth conferences, and community gatherings.',
      bn: 'ইনফিনিটি বাংলাদেশের আসন্ন এবং সম্পন্ন হওয়া বিভিন্ন সামাজিক অনুষ্ঠান ও ক্যাম্পেইনের তালিকা।'
    }
  },
  'events/detail': {
    title: {
      en: 'Event Details | Infinity Bangladesh',
      bn: 'ইভেন্টের বিবরণ | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Schedule, location, participation instructions, and details for this humanitarian event.',
      bn: 'এই মানবিক ইভেন্টের সময়সূচি, স্থান এবং অংশগ্রহণের নিয়মাবলী।'
    }
  },
  contact: {
    title: {
      en: 'Contact Us & Coordination Office | Infinity Bangladesh',
      bn: 'যোগাযোগ ও প্রধান কার্যালয় | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Get in touch with Infinity Bangladesh. Official address, hotlines, email, and regional liaison contacts.',
      bn: 'ইনফিনিটি বাংলাদেশের কেন্দ্রীয় কার্যালয়ের ঠিকানা, হটলাইন নম্বর ও সরাসরি যোগাযোগ ফর্ম।'
    }
  },
  faq: {
    title: {
      en: 'Frequently Asked Questions (FAQ) | Infinity Bangladesh',
      bn: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ) | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Answers to common questions about donations, blood requests, volunteer membership, and governance.',
      bn: 'রক্তদান, অনুদান প্রদান, স্বেচ্ছাসেবী হিসেবে কাজ এবং সাংগঠনিক স্বচ্ছতা সংক্রান্ত সাধারণ প্রশ্নের উত্তর।'
    }
  },
  privacy: {
    title: {
      en: 'Privacy Policy | Infinity Bangladesh',
      bn: 'গোপনীয়তা নীতি | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Our commitment to protecting your personal information, blood donor records, and donation data.',
      bn: 'ব্যবহারকারী ও রক্তদাতাদের ব্যক্তিগত তথ্যের সুরক্ষা এবং ডেটা নিরাপত্তা নীতিমালা।'
    }
  },
  terms: {
    title: {
      en: 'Terms of Service | Infinity Bangladesh',
      bn: 'ব্যবহারের শর্তাবলী | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Terms and conditions governing the use of the Infinity Bangladesh digital platform and services.',
      bn: 'ইনফিনিটি বাংলাদেশ ওয়েবসাইট ও ডিজিটাল সেবা ব্যবহারের নিয়ম ও শর্তাবলী।'
    }
  },
  admin: {
    title: {
      en: 'Admin Management Portal | Infinity Bangladesh',
      bn: 'অ্যাডমিন পোর্টাল | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'Secure administration and content management portal for verified Infinity Bangladesh personnel.',
      bn: 'ইনফিনিটি বাংলাদেশের অভ্যন্তরীণ ব্যবস্থাপনা ও কন্টেন্ট ম্যানেজমেন্ট পোর্টাল।'
    }
  },
  '404': {
    title: {
      en: 'Page Not Found (404) | Infinity Bangladesh',
      bn: 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি (৪০৪) | ইনফিনিটি বাংলাদেশ'
    },
    description: {
      en: 'The page you requested could not be found. Return to the Infinity Bangladesh home page.',
      bn: 'অনুরোধকৃত পৃষ্ঠাটি পাওয়া যায়নি। অনুগ্রহ করে হোম পেজে ফিরে যান।'
    }
  }
};

export function updatePageMetadata(page: PageRoute, slug: string | null = null, isBn: boolean = false) {
  if (typeof document === 'undefined') return;

  const meta = ROUTE_METADATA[page] || ROUTE_METADATA.home;
  const pageTitle = isBn ? meta.title.bn : meta.title.en;
  const pageDesc = isBn ? meta.description.bn : meta.description.en;

  // 1. Update Title
  document.title = pageTitle;

  // 2. Update Meta Description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', pageDesc);

  // 3. Update OG Title & Description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', pageTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', pageDesc);

  // 4. Update Twitter Title & Description
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', pageTitle);

  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', pageDesc);

  // 5. Update Canonical URL
  const cleanPath = page === 'home' ? '' : (slug ? `/${page.replace('/detail', '')}/${slug}` : `/${page}`);
  const canonicalUrl = `https://infinitybangladesh.vercel.app${cleanPath}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);
}

