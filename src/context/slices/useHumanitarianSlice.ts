import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Campaign,
  Program,
  ProgramEvent,
  EventMedia,
  ImpactMetric,
  ImpactStory,
  NewsArticle,
  EventItem,
  TransparencyReport,
  Partner,
  VolunteerApplication,
  DonationRecord,
  MediaItem
} from '../../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_PROGRAMS,
  INITIAL_PROGRAM_EVENTS,
  INITIAL_EVENT_MEDIA,
  INITIAL_IMPACT_METRICS,
  INITIAL_IMPACT_STORIES,
  INITIAL_NEWS,
  INITIAL_EVENTS,
  INITIAL_REPORTS,
  INITIAL_PARTNERS,
  INITIAL_VOLUNTEER_APPLICATIONS,
  INITIAL_DONATIONS
} from '../../data/initialData';
import { getFreshImageUrl } from '../../lib/cloudinary';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { STORAGE_PREFIX, getStoredOrDefault, saveToStorage } from '../dataStorage';
import { resolveMediaFieldUpdate, sanitizeMediaUrlArray, isValidPermanentUrl } from '../../lib/utils/mediaSanitizer';
import { safeDbUpsert, safeDbInsert, safeDbDelete, generateSecureId } from '../dbAdapter';

export function useHumanitarianSlice(
  logAudit: (action: string, entity: string, entityId: string, details: string) => void,
  mediaLibrary: MediaItem[]
) {
  // 1. Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    getStoredOrDefault('campaigns', INITIAL_CAMPAIGNS)
  );

  // 2. Programs
  const [programs, setPrograms] = useState<Program[]>(() =>
    getStoredOrDefault('programs', INITIAL_PROGRAMS)
  );

  // 3. Program Events
  const [programEvents, setProgramEvents] = useState<ProgramEvent[]>(() =>
    getStoredOrDefault('programEvents', INITIAL_PROGRAM_EVENTS)
  );

  // 4. Event Media List
  const [eventMediaList, setEventMediaList] = useState<EventMedia[]>(() => {
    const stored = getStoredOrDefault<EventMedia[]>('eventMediaList', INITIAL_EVENT_MEDIA);
    const idMap = new Map<string, EventMedia>();
    INITIAL_EVENT_MEDIA.forEach(em => idMap.set(`${em.eventId}_${em.mediaId}`, em));
    if (Array.isArray(stored)) {
      stored.forEach(em => idMap.set(`${em.eventId}_${em.mediaId}`, em));
    }
    return Array.from(idMap.values());
  });

  // 5. Impact Metrics
  const [metrics, setMetrics] = useState<ImpactMetric[]>(() =>
    getStoredOrDefault('metrics', INITIAL_IMPACT_METRICS)
  );

  // 6. Impact Stories
  const [stories, setStories] = useState<ImpactStory[]>(() =>
    getStoredOrDefault('stories', INITIAL_IMPACT_STORIES)
  );

  // 7. News Articles
  const [news, setNews] = useState<NewsArticle[]>(() =>
    getStoredOrDefault('news', INITIAL_NEWS)
  );

  // 8. Event Items
  const [events, setEvents] = useState<EventItem[]>(() =>
    getStoredOrDefault('events', INITIAL_EVENTS)
  );

  // 9. Transparency Reports
  const [reports, setReports] = useState<TransparencyReport[]>(() =>
    getStoredOrDefault('reports', INITIAL_REPORTS)
  );

  // 10. Partners
  const [partners, setPartners] = useState<Partner[]>(() =>
    getStoredOrDefault('partners', INITIAL_PARTNERS)
  );

  // 11. Volunteers
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>(() =>
    getStoredOrDefault('volunteers', INITIAL_VOLUNTEER_APPLICATIONS)
  );

  // 12. Donations
  const [donations, setDonations] = useState<DonationRecord[]>(() =>
    getStoredOrDefault('donations', INITIAL_DONATIONS)
  );

  // Local storage auto-sync helper with debounce
  const persistQueueRef = useRef<Record<string, any>>({});
  const persistEntity = useCallback((key: string, data: any) => {
    if (persistQueueRef.current[key]) {
      clearTimeout(persistQueueRef.current[key]);
    }
    persistQueueRef.current[key] = setTimeout(() => {
      saveToStorage(key, data);
      delete persistQueueRef.current[key];
    }, 400);
  }, []);

  useEffect(() => { persistEntity('campaigns', campaigns); }, [campaigns, persistEntity]);
  useEffect(() => { persistEntity('programs', programs); }, [programs, persistEntity]);
  useEffect(() => { persistEntity('programEvents', programEvents); }, [programEvents, persistEntity]);
  useEffect(() => { persistEntity('eventMediaList', eventMediaList); }, [eventMediaList, persistEntity]);
  useEffect(() => { persistEntity('metrics', metrics); }, [metrics, persistEntity]);
  useEffect(() => { persistEntity('stories', stories); }, [stories, persistEntity]);
  useEffect(() => { persistEntity('news', news); }, [news, persistEntity]);
  useEffect(() => { persistEntity('events', events); }, [events, persistEntity]);
  useEffect(() => { persistEntity('reports', reports); }, [reports, persistEntity]);
  useEffect(() => { persistEntity('partners', partners); }, [partners, persistEntity]);
  useEffect(() => { persistEntity('volunteers', volunteers); }, [volunteers, persistEntity]);
  useEffect(() => { persistEntity('donations', donations); }, [donations, persistEntity]);

  // ----------------------------------------------------
  // CAMPAIGNS ACTIONS
  // ----------------------------------------------------
  const addCampaign = useCallback((campaign: Omit<Campaign, 'id'>) => {
    const id = `camp-${Date.now()}`;
    const newCamp: Campaign = {
      ...campaign,
      id,
      imageUrl: resolveMediaFieldUpdate('', campaign.imageUrl, true) || '',
      galleryImages: sanitizeMediaUrlArray([], campaign.galleryImages)
    };
    setCampaigns(prev => [newCamp, ...prev]);
    logAudit('CREATE', 'Campaign', id, `Created campaign: ${campaign.title.en}`);

    safeDbUpsert('campaigns', {
      id: newCamp.id,
      slug: newCamp.slug,
      title: newCamp.title,
      date: newCamp.date,
      end_date: newCamp.endDate || '',
      location: newCamp.location,
      category: newCamp.category,
      description: newCamp.description,
      details: newCamp.details,
      objectives: newCamp.objectives,
      activities: newCamp.activities,
      beneficiaries: newCamp.beneficiaries,
      beneficiaries_count: newCamp.beneficiariesCount,
      volunteers_count: newCamp.volunteersCount,
      impact: newCamp.impact,
      status: newCamp.status,
      is_featured: newCamp.isFeatured,
      target_amount_bdt: newCamp.targetAmountBDT || '',
      raised_amount_bdt: newCamp.raisedAmountBDT || '',
      image_url: newCamp.imageUrl,
      gallery_images: newCamp.galleryImages,
      video_url: newCamp.videoUrl || '',
      report_url: newCamp.reportUrl || '',
      display_order: newCamp.displayOrder || 0,
      updated_at: new Date().toISOString()
    });

    return newCamp;
  }, [logAudit]);

  const updateCampaign = useCallback((id: string, campaign: Partial<Campaign>) => {
    setCampaigns(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...campaign,
          imageUrl: campaign.imageUrl !== undefined ? (resolveMediaFieldUpdate(c.imageUrl, campaign.imageUrl, true) || c.imageUrl) : c.imageUrl,
          galleryImages: campaign.galleryImages !== undefined ? sanitizeMediaUrlArray(c.galleryImages, campaign.galleryImages) : c.galleryImages
        };
      });
      const match = updated.find(c => c.id === id);
      if (match) {
        safeDbUpsert('campaigns', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          date: match.date,
          end_date: match.endDate || '',
          location: match.location,
          category: match.category,
          description: match.description,
          details: match.details,
          objectives: match.objectives,
          activities: match.activities,
          beneficiaries: match.beneficiaries,
          beneficiaries_count: match.beneficiariesCount,
          volunteers_count: match.volunteersCount,
          impact: match.impact,
          status: match.status,
          is_featured: match.isFeatured,
          target_amount_bdt: match.targetAmountBDT || '',
          raised_amount_bdt: match.raisedAmountBDT || '',
          image_url: match.imageUrl,
          gallery_images: match.galleryImages,
          video_url: match.videoUrl || '',
          report_url: match.reportUrl || '',
          display_order: match.displayOrder || 0,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Campaign', id, 'Updated campaign details or gallery');
  }, [logAudit]);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    logAudit('DELETE', 'Campaign', id, 'Deleted campaign');
    safeDbDelete('campaigns', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // PROGRAMS ACTIONS
  // ----------------------------------------------------
  const addProgram = useCallback((program: Omit<Program, 'id'>) => {
    const id = `prog-${Date.now()}`;
    const newProg: Program = {
      ...program,
      id,
      imageUrl: resolveMediaFieldUpdate('', program.imageUrl, false) || ''
    };
    setPrograms(prev => [...prev, newProg]);
    logAudit('CREATE', 'Program', id, `Created program: ${program.title.en}`);

    safeDbUpsert('programs', {
      id: newProg.id,
      slug: newProg.slug,
      title: newProg.title,
      category: newProg.category,
      short_description: newProg.shortDescription,
      full_details: newProg.fullDetails,
      impact_highlights: newProg.impactHighlights,
      image_url: newProg.imageUrl,
      icon_name: newProg.iconName,
      status: newProg.status,
      display_order: newProg.displayOrder || 0,
      updated_at: new Date().toISOString()
    });

    return newProg;
  }, [logAudit]);

  const updateProgram = useCallback((id: string, program: Partial<Program>) => {
    setPrograms(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...program,
          imageUrl: program.imageUrl ? getFreshImageUrl(program.imageUrl) : p.imageUrl
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('programs', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          category: match.category,
          short_description: match.shortDescription,
          full_details: match.fullDetails,
          impact_highlights: match.impactHighlights,
          image_url: match.imageUrl,
          icon_name: match.iconName,
          status: match.status,
          display_order: match.displayOrder || 0,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Program', id, 'Updated program info');
  }, [logAudit]);

  const deleteProgram = useCallback((id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Program', id, 'Deleted program');
    safeDbDelete('programs', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // PROGRAM EVENTS / EDITIONS ACTIONS
  // ----------------------------------------------------
  const addProgramEvent = useCallback((event: Omit<ProgramEvent, 'id'>) => {
    const id = `pevt-${Date.now()}`;
    const newEvt: ProgramEvent = {
      ...event,
      id,
      coverImageUrl: resolveMediaFieldUpdate('', event.coverImageUrl, false) || ''
    };
    setProgramEvents(prev => [newEvt, ...prev]);
    logAudit('CREATE', 'ProgramEvent', id, `Created event edition: ${event.title.en}`);

    safeDbUpsert('program_events', {
      id: newEvt.id,
      program_id: newEvt.programId,
      slug: newEvt.slug,
      title: newEvt.title,
      year: newEvt.year,
      date_range: newEvt.dateRange,
      start_date: newEvt.startDate || null,
      end_date: newEvt.endDate || null,
      location: newEvt.location,
      cover_image_url: newEvt.coverImageUrl,
      short_description: newEvt.shortDescription,
      full_story: newEvt.fullStory || null,
      objectives: newEvt.objectives || null,
      impact_metrics: newEvt.impactMetrics || [],
      status: newEvt.status,
      display_order: newEvt.displayOrder || 0,
      is_featured: newEvt.isFeatured || false,
      updated_at: new Date().toISOString()
    });

    return newEvt;
  }, [logAudit]);

  const updateProgramEvent = useCallback((id: string, updates: Partial<ProgramEvent>) => {
    setProgramEvents(prev => {
      const updated = prev.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          ...updates,
          coverImageUrl: updates.coverImageUrl ? getFreshImageUrl(updates.coverImageUrl) : e.coverImageUrl
        };
      });
      const match = updated.find(e => e.id === id);
      if (match) {
        safeDbUpsert('program_events', {
          id: match.id,
          program_id: match.programId,
          slug: match.slug,
          title: match.title,
          year: match.year,
          date_range: match.dateRange,
          start_date: match.startDate || null,
          end_date: match.endDate || null,
          location: match.location,
          cover_image_url: match.coverImageUrl,
          short_description: match.shortDescription,
          full_story: match.fullStory || null,
          objectives: match.objectives || null,
          impact_metrics: match.impactMetrics || [],
          status: match.status,
          display_order: match.displayOrder || 0,
          is_featured: match.isFeatured || false,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'ProgramEvent', id, 'Updated program event/edition');
  }, [logAudit]);

  const deleteProgramEvent = useCallback((id: string) => {
    setProgramEvents(prev => prev.filter(e => e.id !== id));
    setEventMediaList(prev => prev.filter(em => em.eventId !== id));
    logAudit('DELETE', 'ProgramEvent', id, 'Deleted program event edition');
    safeDbDelete('program_events', 'id', id);
    safeDbDelete('event_media', 'event_id', id);
  }, [logAudit]);

  const reorderProgramEvents = useCallback((programId: string, orderedIds: string[]) => {
    setProgramEvents(prev => {
      const idOrderMap = new Map(orderedIds.map((id, index) => [id, index + 1]));
      return prev.map(evt => {
        if (evt.programId === programId && idOrderMap.has(evt.id)) {
          return { ...evt, displayOrder: idOrderMap.get(evt.id) };
        }
        return evt;
      });
    });
    logAudit('REORDER', 'ProgramEvent', programId, `Reordered editions for program ${programId}`);
  }, [logAudit]);

  // ----------------------------------------------------
  // EVENT MEDIA & HIGHLIGHTS CURATION ACTIONS
  // ----------------------------------------------------
  const addMediaToEvent = useCallback((eventId: string, mediaId: string, isHighlight: boolean = false, caption?: { en: string; bn: string }) => {
    const id = `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEm: EventMedia = {
      id,
      eventId,
      mediaId,
      isHighlight,
      highlightOrder: isHighlight ? 1 : undefined,
      customCaption: caption
    };
    setEventMediaList(prev => {
      if (prev.some(em => em.eventId === eventId && em.mediaId === mediaId)) {
        return prev;
      }
      return [...prev, newEm];
    });
    logAudit('ATTACH', 'EventMedia', id, `Attached media ${mediaId} to event ${eventId}`);

    safeDbUpsert('event_media', {
      id: newEm.id,
      event_id: newEm.eventId,
      media_id: newEm.mediaId,
      is_highlight: newEm.isHighlight,
      highlight_order: newEm.highlightOrder || null,
      custom_caption: newEm.customCaption || null,
      custom_alt: newEm.customAlt || null,
      updated_at: new Date().toISOString()
    });

    return newEm;
  }, [logAudit]);

  const removeMediaFromEvent = useCallback((eventId: string, mediaId: string) => {
    setEventMediaList(prev => prev.filter(em => !(em.eventId === eventId && em.mediaId === mediaId)));
    logAudit('DETACH', 'EventMedia', `${eventId}_${mediaId}`, `Removed media from event`);
    if (isSupabaseConfigured && supabase) {
      supabase.from('event_media').delete().match({ event_id: eventId, media_id: mediaId }).then();
    }
  }, [logAudit]);

  const toggleEventHighlight = useCallback((eventId: string, mediaId: string, isHighlight?: boolean) => {
    setEventMediaList(prev => {
      const match = prev.find(em => em.eventId === eventId && em.mediaId === mediaId);
      const nextHighlight = isHighlight !== undefined ? isHighlight : !match?.isHighlight;
      const currentHighlights = prev.filter(em => em.eventId === eventId && em.isHighlight);
      const nextOrder = nextHighlight ? (currentHighlights.length + 1) : undefined;

      const updated = prev.map(em => {
        if (em.eventId === eventId && em.mediaId === mediaId) {
          return {
            ...em,
            isHighlight: nextHighlight,
            highlightOrder: nextOrder
          };
        }
        return em;
      });

      const target = updated.find(em => em.eventId === eventId && em.mediaId === mediaId);
      if (target) {
        safeDbUpsert('event_media', {
          id: target.id,
          event_id: target.eventId,
          media_id: target.mediaId,
          is_highlight: target.isHighlight,
          highlight_order: target.highlightOrder || null,
          custom_caption: target.customCaption || null,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'EventMediaHighlight', `${eventId}_${mediaId}`, 'Toggled event media highlight status');
  }, [logAudit]);

  const reorderEventHighlights = useCallback((eventId: string, orderedMediaIds: string[]) => {
    setEventMediaList(prev => {
      const idOrderMap = new Map(orderedMediaIds.map((id, index) => [id, index + 1]));
      return prev.map(em => {
        if (em.eventId === eventId && idOrderMap.has(em.mediaId)) {
          return {
            ...em,
            isHighlight: true,
            highlightOrder: idOrderMap.get(em.mediaId)
          };
        }
        return em;
      });
    });
    logAudit('REORDER', 'EventHighlights', eventId, `Reordered highlights for event ${eventId}`);
  }, [logAudit]);

  const setEventHighlights = useCallback((eventId: string, highlightMediaIds: string[]) => {
    const highlightSet = new Set(highlightMediaIds);
    const idOrderMap = new Map(highlightMediaIds.map((id, index) => [id, index + 1]));

    setEventMediaList(prev => {
      return prev.map(em => {
        if (em.eventId === eventId) {
          const isH = highlightSet.has(em.mediaId);
          return {
            ...em,
            isHighlight: isH,
            highlightOrder: isH ? idOrderMap.get(em.mediaId) : undefined
          };
        }
        return em;
      });
    });
    logAudit('CURATE', 'EventHighlights', eventId, `Updated curated highlights (${highlightMediaIds.length} items) for event ${eventId}`);
  }, [logAudit]);

  // ----------------------------------------------------
  // HELPER SELECTORS FOR PROGRAMS
  // ----------------------------------------------------
  const getEventsByProgramId = useCallback((programId: string): ProgramEvent[] => {
    return programEvents
      .filter(e => e.programId === programId)
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [programEvents]);

  const getProgramEventBySlug = useCallback((programSlug: string, eventSlug: string) => {
    const prog = programs.find(p => p.slug === programSlug || p.id === programSlug);
    if (!prog) return null;
    const evt = programEvents.find(e => (e.programId === prog.id) && (e.slug === eventSlug || e.id === eventSlug));
    return { program: prog, event: evt };
  }, [programs, programEvents]);

  const getEventMedia = useCallback((eventId: string) => {
    const ems = eventMediaList.filter(em => em.eventId === eventId);
    return ems.map(em => {
      const media = mediaLibrary.find(m => m.id === em.mediaId) || {
        id: em.mediaId,
        fileName: 'Media File',
        url: '',
        fileSize: '',
        mimeType: 'image/jpeg',
        category: 'Events',
        altText: '',
        uploadedAt: '',
        usageTags: []
      } as MediaItem;
      return { ...em, media };
    }).filter(em => Boolean(em.media.url));
  }, [eventMediaList, mediaLibrary]);

  const getEventHighlights = useCallback((eventId: string) => {
    const all = getEventMedia(eventId);
    return all
      .filter(item => item.isHighlight)
      .sort((a, b) => (a.highlightOrder || 999) - (b.highlightOrder || 999));
  }, [getEventMedia]);

  // ----------------------------------------------------
  // METRICS, STORIES, NEWS, EVENTS ACTIONS
  // ----------------------------------------------------
  const addMetric = useCallback((metric: Omit<ImpactMetric, 'id'>) => {
    const id = `met-${Date.now()}`;
    const newMet: ImpactMetric = { ...metric, id };
    setMetrics(prev => [...prev, newMet]);
    logAudit('CREATE', 'ImpactMetric', id, `Added metric: ${metric.label.en}`);
    safeDbUpsert('impact_metrics', newMet);
    return newMet;
  }, [logAudit]);

  const updateMetric = useCallback((id: string, metric: Partial<ImpactMetric>) => {
    setMetrics(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...metric } : m);
      const match = updated.find(m => m.id === id);
      if (match) safeDbUpsert('impact_metrics', match);
      return updated;
    });
    logAudit('UPDATE', 'ImpactMetric', id, 'Updated impact metric');
  }, [logAudit]);

  const deleteMetric = useCallback((id: string) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', 'ImpactMetric', id, 'Deleted metric');
    safeDbDelete('impact_metrics', 'id', id);
  }, [logAudit]);

  const addStory = useCallback((story: Omit<ImpactStory, 'id'>) => {
    const id = `story-${Date.now()}`;
    const newStory: ImpactStory = {
      ...story,
      id,
      imageUrl: resolveMediaFieldUpdate('', story.imageUrl, false) || ''
    };
    setStories(prev => [newStory, ...prev]);
    logAudit('CREATE', 'ImpactStory', id, `Published story: ${story.title.en}`);

    safeDbUpsert('stories', {
      id: newStory.id,
      slug: newStory.slug,
      title: newStory.title,
      person_or_community: newStory.personOrCommunity,
      location: newStory.location,
      date: newStory.date,
      story: newStory.story,
      impact: newStory.impact,
      image_url: newStory.imageUrl,
      campaign_slug: newStory.campaignSlug || '',
      consent_confirmed: newStory.consentConfirmed,
      is_featured: newStory.isFeatured,
      status: newStory.status,
      updated_at: new Date().toISOString()
    });

    return newStory;
  }, [logAudit]);

  const updateStory = useCallback((id: string, story: Partial<ImpactStory>) => {
    setStories(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          ...story,
          imageUrl: story.imageUrl ? getFreshImageUrl(story.imageUrl) : s.imageUrl
        };
      });
      const match = updated.find(s => s.id === id);
      if (match) {
        safeDbUpsert('stories', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          person_or_community: match.personOrCommunity,
          location: match.location,
          date: match.date,
          story: match.story,
          impact: match.impact,
          image_url: match.imageUrl,
          campaign_slug: match.campaignSlug || '',
          consent_confirmed: match.consentConfirmed,
          is_featured: match.isFeatured,
          status: match.status,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'ImpactStory', id, 'Updated story content');
  }, [logAudit]);

  const deleteStory = useCallback((id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE', 'ImpactStory', id, 'Deleted story');
    safeDbDelete('stories', 'id', id);
  }, [logAudit]);

  const addNews = useCallback((newsItem: Omit<NewsArticle, 'id'>) => {
    const id = `news-${Date.now()}`;
    const newN: NewsArticle = {
      ...newsItem,
      id,
      imageUrl: resolveMediaFieldUpdate('', newsItem.imageUrl, false) || ''
    };
    setNews(prev => [newN, ...prev]);
    logAudit('CREATE', 'NewsArticle', id, `Added news: ${newsItem.title.en}`);

    safeDbUpsert('news_articles', {
      id: newN.id,
      slug: newN.slug,
      title: newN.title,
      excerpt: newN.excerpt,
      content: newN.content,
      category: newN.category,
      author: newN.author,
      date: newN.date,
      image_url: newN.imageUrl,
      tags: newN.tags,
      status: newN.status,
      updated_at: new Date().toISOString()
    });

    return newN;
  }, [logAudit]);

  const updateNews = useCallback((id: string, newsItem: Partial<NewsArticle>) => {
    setNews(prev => {
      const updated = prev.map(n => {
        if (n.id !== id) return n;
        return {
          ...n,
          ...newsItem,
          imageUrl: newsItem.imageUrl ? getFreshImageUrl(newsItem.imageUrl) : n.imageUrl
        };
      });
      const match = updated.find(n => n.id === id);
      if (match) {
        safeDbUpsert('news_articles', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          excerpt: match.excerpt,
          content: match.content,
          category: match.category,
          author: match.author,
          date: match.date,
          image_url: match.imageUrl,
          tags: match.tags,
          status: match.status,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'NewsArticle', id, 'Updated news article');
  }, [logAudit]);

  const deleteNews = useCallback((id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    logAudit('DELETE', 'NewsArticle', id, 'Deleted news article');
    safeDbDelete('news_articles', 'id', id);
  }, [logAudit]);

  const addEvent = useCallback((eventItem: Omit<EventItem, 'id'>) => {
    const id = `ev-${Date.now()}`;
    const newEv: EventItem = {
      ...eventItem,
      id,
      imageUrl: getFreshImageUrl(eventItem.imageUrl)
    };
    setEvents(prev => [newEv, ...prev]);
    logAudit('CREATE', 'EventItem', id, `Added event: ${eventItem.title.en}`);

    safeDbUpsert('event_items', {
      id: newEv.id,
      slug: newEv.slug,
      title: newEv.title,
      date: newEv.date,
      time: newEv.time,
      location: newEv.location,
      description: newEv.description,
      image_url: newEv.imageUrl,
      status: newEv.status,
      registration_open: newEv.registrationOpen,
      updated_at: new Date().toISOString()
    });

    return newEv;
  }, [logAudit]);

  const updateEvent = useCallback((id: string, eventItem: Partial<EventItem>) => {
    setEvents(prev => {
      const updated = prev.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          ...eventItem,
          imageUrl: eventItem.imageUrl ? getFreshImageUrl(eventItem.imageUrl) : e.imageUrl
        };
      });
      const match = updated.find(e => e.id === id);
      if (match) {
        safeDbUpsert('event_items', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          date: match.date,
          time: match.time,
          location: match.location,
          description: match.description,
          image_url: match.imageUrl,
          status: match.status,
          registration_open: match.registrationOpen,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'EventItem', id, 'Updated event details');
  }, [logAudit]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE', 'EventItem', id, 'Deleted event');
    safeDbDelete('event_items', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // REPORTS & PARTNERS ACTIONS
  // ----------------------------------------------------
  const addReport = useCallback((report: Omit<TransparencyReport, 'id'>) => {
    const id = `rep-${Date.now()}`;
    const newRep: TransparencyReport = { ...report, id };
    setReports(prev => [...prev, newRep]);
    logAudit('CREATE', 'TransparencyReport', id, `Added report: ${report.title.en}`);

    safeDbUpsert('transparency_reports', {
      id: newRep.id,
      title: newRep.title,
      type: newRep.type,
      year: newRep.year,
      description: newRep.description,
      upload_date: newRep.uploadDate,
      file_url: newRep.fileUrl,
      file_size: newRep.fileSize,
      status: newRep.status,
      display_order: newRep.displayOrder || 0,
      updated_at: new Date().toISOString()
    });

    return newRep;
  }, [logAudit]);

  const updateReport = useCallback((id: string, report: Partial<TransparencyReport>) => {
    setReports(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...report } : r);
      const match = updated.find(r => r.id === id);
      if (match) safeDbUpsert('transparency_reports', match);
      return updated;
    });
    logAudit('UPDATE', 'TransparencyReport', id, 'Updated report');
  }, [logAudit]);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    logAudit('DELETE', 'TransparencyReport', id, 'Deleted report');
    safeDbDelete('transparency_reports', 'id', id);
  }, [logAudit]);

  const addPartner = useCallback((partner: Omit<Partner, 'id'>) => {
    const id = `part-${Date.now()}`;
    const newPart: Partner = {
      ...partner,
      id,
      logoUrl: partner.logoUrl ? getFreshImageUrl(partner.logoUrl) : ''
    };
    setPartners(prev => [...prev, newPart]);
    logAudit('CREATE', 'Partner', id, `Added partner: ${partner.name}`);

    safeDbUpsert('partners', {
      id: newPart.id,
      name: newPart.name,
      logo_url: newPart.logoUrl || '',
      website: newPart.website || '',
      type: newPart.type,
      description: newPart.description,
      partnership_year: newPart.partnershipYear,
      updated_at: new Date().toISOString()
    });

    return newPart;
  }, [logAudit]);

  const updatePartner = useCallback((id: string, partner: Partial<Partner>) => {
    setPartners(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...partner,
          logoUrl: partner.logoUrl ? getFreshImageUrl(partner.logoUrl) : p.logoUrl
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('partners', {
          id: match.id,
          name: match.name,
          logo_url: match.logoUrl || '',
          website: match.website || '',
          type: match.type,
          description: match.description,
          partnership_year: match.partnershipYear,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Partner', id, 'Updated partner details');
  }, [logAudit]);

  const deletePartner = useCallback((id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Partner', id, 'Deleted partner');
    safeDbDelete('partners', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // VOLUNTEERS & DONATIONS ACTIONS
  // ----------------------------------------------------
  const submitVolunteerApplication = useCallback((app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>): string => {
    const id = generateSecureId('vol');
    const newApp: VolunteerApplication = {
      ...app,
      id,
      submittedAt: new Date().toISOString(),
      status: 'New'
    };
    setVolunteers(prev => [newApp, ...prev]);
    logAudit('SUBMIT', 'VolunteerApplication', id, `New application from ${app.fullName}`);
    safeDbInsert('volunteer_applications', {
      id,
      full_name: app.fullName,
      email: app.email,
      phone: app.phone,
      district: app.district,
      institution: app.institution || '',
      occupation: app.occupation || '',
      blood_group: app.bloodGroup || '',
      skills: app.skills || [],
      preferred_areas: app.preferredAreas || [],
      availability: app.availability || '',
      message: app.message || '',
      agreed_code_of_conduct: Boolean(app.agreedCodeOfConduct)
    });
    return id;
  }, [logAudit]);

  const addVolunteerApplication = useCallback((app: Partial<VolunteerApplication>): string => {
    const id = app.id || `vol-${Date.now()}`;
    const newApp: VolunteerApplication = {
      id,
      fullName: app.fullName || 'Anonymous Volunteer',
      email: app.email || '',
      phone: app.phone || '',
      district: app.district || 'Chattogram',
      submittedAt: app.submittedAt || new Date().toISOString(),
      status: app.status || 'New',
      ...app
    };
    setVolunteers(prev => [newApp, ...prev]);
    logAudit('CREATE', 'VolunteerApplication', id, `Added manual volunteer record: ${newApp.fullName}`);
    safeDbUpsert('volunteer_applications', newApp);
    return id;
  }, [logAudit]);

  const updateVolunteerStatus = useCallback((id: string, status: VolunteerApplication['status'], adminNotes?: string) => {
    setVolunteers(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, status, adminNotes: adminNotes !== undefined ? adminNotes : v.adminNotes } : v);
      const match = updated.find(v => v.id === id);
      if (match) safeDbUpsert('volunteer_applications', match);
      return updated;
    });
    logAudit('UPDATE', 'VolunteerApplication', id, `Changed status to ${status}`);
  }, [logAudit]);

  const deleteVolunteerApplication = useCallback((id: string) => {
    setVolunteers(prev => prev.filter(v => v.id !== id));
    logAudit('DELETE', 'VolunteerApplication', id, 'Deleted volunteer application');
    safeDbDelete('volunteer_applications', 'id', id);
  }, [logAudit]);

  const submitDonation = useCallback((donation: Omit<DonationRecord, 'id' | 'date' | 'status'>): string => {
    const id = generateSecureId('don');
    const newDon: DonationRecord = {
      ...donation,
      id,
      date: new Date().toISOString(),
      status: 'Pending'
    };
    setDonations(prev => [newDon, ...prev]);
    logAudit('SUBMIT', 'DonationRecord', id, `Donation submitted by ${donation.donorName}: ৳${donation.amountBDT || donation.amount || 0}`);
    safeDbInsert('donation_records', {
      id,
      donor_name: donation.donorName,
      donor_email: donation.donorEmail,
      donor_phone: donation.donorPhone,
      amount_bdt: donation.amountBDT || donation.amount || 0,
      campaign_slug: donation.campaignSlug,
      campaign_title: donation.campaignTitle,
      donation_type: donation.donationType,
      payment_method: donation.paymentMethod,
      transaction_id: donation.transactionId,
      is_anonymous: Boolean(donation.isAnonymous),
      notes: donation.notes
    });
    return id;
  }, [logAudit]);

  const addDonationRecord = useCallback((donation: Partial<DonationRecord>): DonationRecord => {
    const id = donation.id || generateSecureId('don');
    const newDon: DonationRecord = {
      id,
      donorName: donation.donorName || 'Anonymous Supporter',
      paymentMethod: donation.paymentMethod || 'bKash',
      date: donation.date || new Date().toISOString(),
      status: donation.status || 'Pending',
      ...donation
    };
    setDonations(prev => [newDon, ...prev]);
    logAudit('CREATE', 'DonationRecord', id, `Recorded donation: ৳${newDon.amountBDT || newDon.amount || 0}`);
    safeDbUpsert('donation_records', newDon);
    return newDon;
  }, [logAudit]);

  const updateDonationStatus = useCallback((id: string, status: DonationRecord['status']) => {
    setDonations(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, status } : d);
      const match = updated.find(d => d.id === id);
      if (match) safeDbUpsert('donation_records', match);
      return updated;
    });
    logAudit('UPDATE', 'DonationRecord', id, `Changed donation status to ${status}`);
  }, [logAudit]);

  return {
    campaigns,
    setCampaigns,
    programs,
    setPrograms,
    programEvents,
    setProgramEvents,
    eventMediaList,
    setEventMediaList,
    metrics,
    setMetrics,
    stories,
    setStories,
    news,
    setNews,
    events,
    setEvents,
    reports,
    setReports,
    partners,
    setPartners,
    volunteers,
    setVolunteers,
    donations,
    setDonations,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addProgram,
    updateProgram,
    deleteProgram,
    addProgramEvent,
    updateProgramEvent,
    deleteProgramEvent,
    reorderProgramEvents,
    addMediaToEvent,
    removeMediaFromEvent,
    toggleEventHighlight,
    reorderEventHighlights,
    setEventHighlights,
    getEventsByProgramId,
    getProgramEventBySlug,
    getEventMedia,
    getEventHighlights,
    addMetric,
    updateMetric,
    deleteMetric,
    addStory,
    updateStory,
    deleteStory,
    addNews,
    updateNews,
    deleteNews,
    addEvent,
    updateEvent,
    deleteEvent,
    addReport,
    updateReport,
    deleteReport,
    addPartner,
    updatePartner,
    deletePartner,
    submitVolunteerApplication,
    addVolunteerApplication,
    updateVolunteerStatus,
    deleteVolunteerApplication,
    submitDonation,
    addDonationRecord,
    updateDonationStatus
  };
}

