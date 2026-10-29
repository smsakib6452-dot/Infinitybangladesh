import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SiteSettings,
  HomepageConfig,
  AboutSettings,
  HeaderSettings,
  FooterSettings,
  SocialLink,
  VolunteerSettings,
  SupportSettings,
  ContactSettings,
  GlobalSEOSettings,
  NavigationItem,
  FAQItem,
  ContactMessage
} from '../../types';
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_ABOUT_SETTINGS,
  INITIAL_HEADER_SETTINGS,
  INITIAL_FOOTER_SETTINGS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_VOLUNTEER_SETTINGS,
  INITIAL_SUPPORT_SETTINGS,
  INITIAL_CONTACT_SETTINGS,
  INITIAL_SEO_SETTINGS,
  INITIAL_NAVIGATION_ITEMS,
  INITIAL_FAQS
} from '../../data/initialData';
import { getFreshImageUrl } from '../../lib/cloudinary';
import { STORAGE_PREFIX, getStoredOrDefault } from '../dataStorage';
import { safeDbUpsert, safeDbDelete } from '../dbAdapter';

export function useSettingsSlice(
  logAudit: (action: string, entity: string, entityId: string, details: string) => void
) {
  // 1. Settings State
  const [settings, setSettings] = useState<SiteSettings>(() =>
    getStoredOrDefault('settings', INITIAL_SITE_SETTINGS)
  );

  // 2. Homepage Config State
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() =>
    getStoredOrDefault('homepageConfig', INITIAL_HOMEPAGE_CONFIG)
  );

  // 3. About Settings State
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(() =>
    getStoredOrDefault('aboutSettings', INITIAL_ABOUT_SETTINGS)
  );

  // 4. Header Settings State
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(() =>
    getStoredOrDefault('headerSettings', INITIAL_HEADER_SETTINGS)
  );

  // 5. Footer Settings State
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(() =>
    getStoredOrDefault('footerSettings', INITIAL_FOOTER_SETTINGS)
  );

  // 6. Social Links State
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() =>
    getStoredOrDefault('socialLinks', INITIAL_SOCIAL_LINKS)
  );

  // 7. Volunteer Settings State
  const [volunteerSettings, setVolunteerSettings] = useState<VolunteerSettings>(() =>
    getStoredOrDefault('volunteerSettings', INITIAL_VOLUNTEER_SETTINGS)
  );

  // 8. Support Settings State
  const [supportSettings, setSupportSettings] = useState<SupportSettings>(() =>
    getStoredOrDefault('supportSettings', INITIAL_SUPPORT_SETTINGS)
  );

  // 9. Contact Settings State
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() =>
    getStoredOrDefault('contactSettings', INITIAL_CONTACT_SETTINGS)
  );

  // 10. SEO Settings State
  const [seoSettings, setSeoSettings] = useState<GlobalSEOSettings>(() =>
    getStoredOrDefault('seoSettings', INITIAL_SEO_SETTINGS)
  );

  // 11. Navigation Items State
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(() =>
    getStoredOrDefault('navigationItems', INITIAL_NAVIGATION_ITEMS)
  );

  // 12. FAQs State
  const [faqs, setFaqs] = useState<FAQItem[]>(() =>
    getStoredOrDefault('faqs', INITIAL_FAQS)
  );

  // 13. Contact Messages State
  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    getStoredOrDefault('messages', [])
  );

  // Local storage auto-sync helper with debounce
  const persistQueueRef = useRef<Record<string, any>>({});
  const persistEntity = useCallback((key: string, data: any) => {
    if (persistQueueRef.current[key]) {
      clearTimeout(persistQueueRef.current[key]);
    }
    persistQueueRef.current[key] = setTimeout(() => {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
      } catch (err) {
        console.warn(`Error persisting ${key} to localStorage:`, err);
      }
      delete persistQueueRef.current[key];
    }, 400);
  }, []);

  useEffect(() => { persistEntity('settings', settings); }, [settings, persistEntity]);
  useEffect(() => { persistEntity('homepageConfig', homepageConfig); }, [homepageConfig, persistEntity]);
  useEffect(() => { persistEntity('aboutSettings', aboutSettings); }, [aboutSettings, persistEntity]);
  useEffect(() => { persistEntity('headerSettings', headerSettings); }, [headerSettings, persistEntity]);
  useEffect(() => { persistEntity('footerSettings', footerSettings); }, [footerSettings, persistEntity]);
  useEffect(() => { persistEntity('socialLinks', socialLinks); }, [socialLinks, persistEntity]);
  useEffect(() => { persistEntity('volunteerSettings', volunteerSettings); }, [volunteerSettings, persistEntity]);
  useEffect(() => { persistEntity('supportSettings', supportSettings); }, [supportSettings, persistEntity]);
  useEffect(() => { persistEntity('contactSettings', contactSettings); }, [contactSettings, persistEntity]);
  useEffect(() => { persistEntity('seoSettings', seoSettings); }, [seoSettings, persistEntity]);
  useEffect(() => { persistEntity('navigationItems', navigationItems); }, [navigationItems, persistEntity]);
  useEffect(() => { persistEntity('faqs', faqs); }, [faqs, persistEntity]);
  useEffect(() => { persistEntity('messages', messages); }, [messages, persistEntity]);

  // ----------------------------------------------------
  // HOMEPAGE & CMS CONFIG ACTIONS
  // ----------------------------------------------------
  const updateHomepageConfig = useCallback((newConfig: Partial<HomepageConfig>) => {
    setHomepageConfig(prev => {
      const updated: HomepageConfig = {
        ...prev,
        ...newConfig,
        hero: newConfig.hero
          ? {
              ...prev.hero,
              ...newConfig.hero,
              heroImageUrl: getFreshImageUrl(newConfig.hero.heroImageUrl || prev.hero.heroImageUrl)
            }
          : prev.hero,
        aboutPreview: newConfig.aboutPreview
          ? {
              ...prev.aboutPreview,
              ...newConfig.aboutPreview,
              imageUrl: getFreshImageUrl(newConfig.aboutPreview.imageUrl || prev.aboutPreview.imageUrl)
            }
          : prev.aboutPreview,
        volunteerBanner: newConfig.volunteerBanner ? { ...prev.volunteerBanner, ...newConfig.volunteerBanner } : prev.volunteerBanner,
        supportBanner: newConfig.supportBanner ? { ...prev.supportBanner, ...newConfig.supportBanner } : prev.supportBanner,
        impactSection: newConfig.impactSection ? { ...prev.impactSection, ...newConfig.impactSection } : prev.impactSection,
        programsSection: newConfig.programsSection ? { ...prev.programsSection, ...newConfig.programsSection } : prev.programsSection,
        campaignsSection: newConfig.campaignsSection ? { ...prev.campaignsSection, ...newConfig.campaignsSection } : prev.campaignsSection,
        storiesSection: newConfig.storiesSection ? { ...prev.storiesSection, ...newConfig.storiesSection } : prev.storiesSection,
        lifelineSection: newConfig.lifelineSection ? { ...prev.lifelineSection, ...newConfig.lifelineSection } : prev.lifelineSection,
        gallerySection: newConfig.gallerySection ? { ...prev.gallerySection, ...newConfig.gallerySection } : prev.gallerySection,
        pressSection: newConfig.pressSection ? { ...prev.pressSection, ...newConfig.pressSection } : prev.pressSection,
        transparencySection: newConfig.transparencySection ? { ...prev.transparencySection, ...newConfig.transparencySection } : prev.transparencySection,
        sectionOrder: newConfig.sectionOrder || prev.sectionOrder,
        sectionVisibility: newConfig.sectionVisibility ? { ...prev.sectionVisibility, ...newConfig.sectionVisibility } : prev.sectionVisibility
      };
      logAudit('UPDATE', 'HomepageConfig', 'homepage', 'Updated homepage hero, sections, or visibility');

      try {
        localStorage.setItem(`${STORAGE_PREFIX}homepageConfig`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('infinity_homepage_config_updated', { detail: updated }));
      } catch (e) {
        console.warn('Failed to save homepageConfig to localStorage:', e);
      }

      const safeVolunteerBanner = {
        ...(updated.volunteerBanner || {}),
        section_headers: {
          impact: updated.impactSection,
          programs: updated.programsSection,
          campaigns: updated.campaignsSection,
          stories: updated.storiesSection,
          lifeline: updated.lifelineSection,
          gallery: updated.gallerySection,
          press: updated.pressSection,
          transparency: updated.transparencySection
        }
      };

      safeDbUpsert('homepage_config', {
        id: 'default',
        hero: updated.hero,
        about_preview: updated.aboutPreview,
        volunteer_banner: safeVolunteerBanner,
        support_banner: updated.supportBanner,
        section_order: updated.sectionOrder,
        section_visibility: updated.sectionVisibility,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateAboutSettings = useCallback((newSettings: Partial<AboutSettings>) => {
    setAboutSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        heroImageUrl: getFreshImageUrl(newSettings.heroImageUrl || prev.heroImageUrl),
        secondaryImageUrl: getFreshImageUrl(newSettings.secondaryImageUrl || prev.secondaryImageUrl)
      };
      logAudit('UPDATE', 'AboutSettings', 'about', 'Updated organization about settings');

      safeDbUpsert('about_settings', {
        id: 'default',
        title: updated.title,
        subtitle: updated.subtitle,
        mission: updated.mission,
        vision: updated.vision,
        history: updated.history,
        established_year: updated.establishedYear,
        location: updated.location,
        hero_image_url: updated.heroImageUrl,
        secondary_image_url: updated.secondaryImageUrl || '',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateHeaderSettings = useCallback((newSettings: Partial<HeaderSettings>) => {
    setHeaderSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        logoUrl: getFreshImageUrl(newSettings.logoUrl || prev.logoUrl)
      };
      logAudit('UPDATE', 'HeaderSettings', 'header', 'Updated header notice bar or navigation settings');

      safeDbUpsert('header_settings', {
        id: 'default',
        logo_url: updated.logoUrl,
        show_notice_bar: updated.showNoticeBar,
        notice_bar_text: updated.noticeBarText,
        notice_bar_link: updated.noticeBarLink || 'transparency',
        notice_bar_button_text: updated.noticeBarButtonText,
        show_notice_bar_button: updated.showNoticeBarButton,
        show_search: updated.showSearch,
        show_language_switcher: updated.showLanguageSwitcher,
        support_button_text: updated.supportButtonText,
        support_button_url: updated.supportButtonUrl || 'donate',
        show_support_button: updated.showSupportButton,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateFooterSettings = useCallback((newSettings: Partial<FooterSettings>) => {
    setFooterSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        footerLogoUrl: getFreshImageUrl(newSettings.footerLogoUrl || prev.footerLogoUrl)
      };
      logAudit('UPDATE', 'FooterSettings', 'footer', 'Updated footer text, address, or copyright');

      safeDbUpsert('footer_settings', {
        id: 'default',
        footer_logo_url: updated.footerLogoUrl,
        description: updated.description,
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        copyright_text: updated.copyrightText,
        callout_eyebrow: updated.calloutEyebrow,
        callout_title: updated.calloutTitle,
        callout_subtitle: updated.calloutSubtitle,
        volunteer_cta_text: updated.volunteerCtaText,
        volunteer_cta_url: updated.volunteerCtaUrl || 'volunteer',
        support_cta_text: updated.supportCtaText,
        support_cta_url: updated.supportCtaUrl || 'donate',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateVolunteerSettings = useCallback((newSettings: Partial<VolunteerSettings>) => {
    setVolunteerSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        coverImageUrl: getFreshImageUrl(newSettings.coverImageUrl || prev.coverImageUrl)
      };
      logAudit('UPDATE', 'VolunteerSettings', 'volunteer', 'Updated volunteer CTA, benefits or form link');

      safeDbUpsert('volunteer_settings', {
        id: 'default',
        cta_text: updated.ctaText,
        google_form_url: updated.googleFormUrl,
        description: updated.description,
        cover_image_url: updated.coverImageUrl,
        benefits: updated.benefits,
        requirements: updated.requirements,
        contact_email: updated.contactEmail,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateSupportSettings = useCallback((newSettings: Partial<SupportSettings>) => {
    setSupportSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        qrCodeImageUrl: getFreshImageUrl(newSettings.qrCodeImageUrl || prev.qrCodeImageUrl)
      };
      logAudit('UPDATE', 'SupportSettings', 'support', 'Updated payment instructions, bKash, Nagad or bank details');

      safeDbUpsert('support_settings', {
        id: 'default',
        cta_text: updated.ctaText,
        description: updated.description,
        bkash_number: updated.bKashNumber || updated.bkashNumber,
        bkash_type: updated.bKashType,
        nagad_number: updated.nagadNumber,
        nagad_type: updated.nagadType,
        bank_details: updated.bankDetails,
        qr_code_image_url: updated.qrCodeImageUrl || '',
        payment_instructions: updated.paymentInstructions,
        support_email: updated.supportEmail,
        support_phone: updated.supportPhone,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateContactSettings = useCallback((newSettings: Partial<ContactSettings>) => {
    setContactSettings(prev => {
      const updated = { ...prev, ...newSettings };
      logAudit('UPDATE', 'ContactSettings', 'contact', 'Updated official contact phone, email or address');

      safeDbUpsert('contact_settings', {
        id: 'default',
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        office_hours: updated.officeHours,
        google_maps_embed_url: updated.googleMapsEmbedUrl,
        emergency_helpline: updated.emergencyHelpline || '',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateSEOSettings = useCallback((newSettings: Partial<GlobalSEOSettings>) => {
    setSeoSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        ogImageUrl: getFreshImageUrl(newSettings.ogImageUrl || prev.ogImageUrl)
      };
      logAudit('UPDATE', 'SEOSettings', 'seo', 'Updated global SEO meta tags');

      safeDbUpsert('seo_settings', {
        id: 'default',
        site_title: updated.siteTitle,
        meta_description: updated.metaDescription,
        keywords: updated.keywords,
        og_image_url: updated.ogImageUrl,
        organization_name: updated.organizationName,
        canonical_url: updated.canonicalUrl,
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        logoUrl: getFreshImageUrl(newSettings.logoUrl || prev.logoUrl),
        faviconUrl: getFreshImageUrl(newSettings.faviconUrl || prev.faviconUrl)
      };
      logAudit('UPDATE', 'SiteSettings', 'site', 'Updated main site settings');

      safeDbUpsert('site_settings', {
        id: 'default',
        organization_name: updated.organizationName,
        team_identity: updated.teamIdentity,
        tagline: updated.tagline,
        country: updated.country,
        official_address: updated.officialAddress,
        official_phone: updated.officialPhone,
        official_email: updated.officialEmail,
        established_year: updated.establishedYear || '2015',
        logo_url: updated.logoUrl || '',
        favicon_url: updated.faviconUrl || '',
        updated_at: new Date().toISOString()
      });

      return updated;
    });
  }, [logAudit]);

  // ----------------------------------------------------
  // FAQS ACTIONS
  // ----------------------------------------------------
  const addFAQ = useCallback((faq: Omit<FAQItem, 'id'>): FAQItem => {
    const id = `faq-${Date.now()}`;
    const newFAQ: FAQItem = { ...faq, id };
    setFaqs(prev => [...prev, newFAQ]);
    logAudit('CREATE', 'FAQ', id, `Added FAQ: ${faq.question.en}`);
    safeDbUpsert('faqs', newFAQ);
    return newFAQ;
  }, [logAudit]);

  const updateFAQ = useCallback((id: string, faq: Partial<FAQItem>) => {
    setFaqs(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...faq } : f);
      const match = updated.find(f => f.id === id);
      if (match) safeDbUpsert('faqs', match);
      return updated;
    });
    logAudit('UPDATE', 'FAQ', id, 'Updated FAQ');
  }, [logAudit]);

  const deleteFAQ = useCallback((id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    logAudit('DELETE', 'FAQ', id, 'Deleted FAQ');
    safeDbDelete('faqs', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // CONTACT MESSAGES ACTIONS
  // ----------------------------------------------------
  const submitContactMessage = useCallback((msg: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>) => {
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };
    setMessages(prev => [newMsg, ...prev]);
    logAudit('SUBMIT', 'ContactMessage', id, `Received message from ${msg.name}`);
    safeDbUpsert('contact_messages', newMsg);
  }, [logAudit]);

  const addContactMessage = useCallback((msg: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>): ContactMessage => {
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };
    setMessages(prev => [newMsg, ...prev]);
    logAudit('SUBMIT', 'ContactMessage', id, `Received message from ${msg.name}`);
    safeDbUpsert('contact_messages', newMsg);
    return newMsg;
  }, [logAudit]);

  const updateMessageStatus = useCallback((id: string, status: ContactMessage['status']) => {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status } : m);
      const match = updated.find(m => m.id === id);
      if (match) safeDbUpsert('contact_messages', match);
      return updated;
    });
    logAudit('UPDATE', 'ContactMessage', id, `Changed status to ${status}`);
  }, [logAudit]);

  const deleteContactMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', 'ContactMessage', id, 'Deleted contact message');
    safeDbDelete('contact_messages', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // SOCIAL LINKS ACTIONS
  // ----------------------------------------------------
  const addSocialLink = useCallback((link: Omit<SocialLink, 'id'>) => {
    const id = `soc-${Date.now()}`;
    const newLink: SocialLink = { ...link, id };
    setSocialLinks(prev => [...prev, newLink]);
    logAudit('CREATE', 'SocialLink', id, `Added ${link.platform} link`);
    safeDbUpsert('social_links', newLink);
  }, [logAudit]);

  const updateSocialLink = useCallback((id: string, link: Partial<SocialLink>) => {
    setSocialLinks(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...link } : s);
      const match = updated.find(s => s.id === id);
      if (match) safeDbUpsert('social_links', match);
      return updated;
    });
    logAudit('UPDATE', 'SocialLink', id, 'Updated social link details');
  }, [logAudit]);

  const deleteSocialLink = useCallback((id: string) => {
    setSocialLinks(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE', 'SocialLink', id, 'Deleted social link');
    safeDbDelete('social_links', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // NAVIGATION ITEMS ACTIONS
  // ----------------------------------------------------
  const addNavigationItem = useCallback((item: Omit<NavigationItem, 'id'>) => {
    const id = `nav-${Date.now()}`;
    const newItem: NavigationItem = { ...item, id };
    setNavigationItems(prev => [...prev, newItem]);
    logAudit('CREATE', 'NavigationItem', id, `Added navigation link: ${item.label.en}`);
    safeDbUpsert('navigation_items', newItem);
  }, [logAudit]);

  const updateNavigationItem = useCallback((id: string, item: Partial<NavigationItem>) => {
    setNavigationItems(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, ...item } : n);
      const match = updated.find(n => n.id === id);
      if (match) safeDbUpsert('navigation_items', match);
      return updated;
    });
    logAudit('UPDATE', 'NavigationItem', id, 'Updated navigation item');
  }, [logAudit]);

  const deleteNavigationItem = useCallback((id: string) => {
    setNavigationItems(prev => prev.filter(n => n.id !== id));
    logAudit('DELETE', 'NavigationItem', id, 'Deleted navigation item');
    safeDbDelete('navigation_items', 'id', id);
  }, [logAudit]);

  const reorderNavigationItems = useCallback((items: NavigationItem[]) => {
    setNavigationItems(items);
    logAudit('UPDATE', 'NavigationItems', 'reorder', 'Reordered navigation menu items');
  }, [logAudit]);

  return {
    settings,
    setSettings,
    homepageConfig,
    setHomepageConfig,
    aboutSettings,
    setAboutSettings,
    headerSettings,
    setHeaderSettings,
    footerSettings,
    setFooterSettings,
    socialLinks,
    setSocialLinks,
    volunteerSettings,
    setVolunteerSettings,
    supportSettings,
    setSupportSettings,
    contactSettings,
    setContactSettings,
    seoSettings,
    setSeoSettings,
    navigationItems,
    setNavigationItems,
    faqs,
    setFaqs,
    messages,
    setMessages,
    updateHomepageConfig,
    updateAboutSettings,
    updateHeaderSettings,
    updateFooterSettings,
    updateVolunteerSettings,
    updateSupportSettings,
    updateContactSettings,
    updateSEOSettings,
    updateSettings,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    addContactMessage,
    submitContactMessage,
    updateMessageStatus,
    deleteContactMessage,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    addNavigationItem,
    updateNavigationItem,
    deleteNavigationItem,
    reorderNavigationItems
  };
}

