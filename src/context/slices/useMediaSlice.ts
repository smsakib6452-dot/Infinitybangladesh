import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GalleryPhoto,
  VideoItem,
  JourneyVideo,
  MediaItem,
  GalleryAlbum,
  BannerItem,
  PressCoverage
} from '../../types';
import {
  INITIAL_GALLERY,
  INITIAL_VIDEOS,
  INITIAL_JOURNEY_VIDEOS,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_GALLERY_ALBUMS,
  INITIAL_BANNERS,
  INITIAL_PRESS_COVERAGE
} from '../../data/initialData';
import { getFreshImageUrl } from '../../lib/cloudinary';
import { detectAndNormalizeMedia, DEFAULT_VIDEO_THUMBNAIL, isBlacklistedMedia } from '../../lib/utils/mediaHelper';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { STORAGE_PREFIX, getStoredOrDefault } from '../dataStorage';
import { safeDbUpsert, safeDbDelete } from '../dbAdapter';

export function useMediaSlice(logAudit: (action: string, entity: string, entityId: string, details: string) => void) {
  const deletedVideoIdsRef = useRef<Set<string>>(new Set(getStoredOrDefault<string[]>('deleted_video_ids', [])));

  // 1. Gallery Photos State
  const [gallery, setGallery] = useState<GalleryPhoto[]>(() =>
    getStoredOrDefault('gallery', INITIAL_GALLERY)
  );

  // 2. Videos State
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const stored = getStoredOrDefault<VideoItem[]>('videos', INITIAL_VIDEOS);
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_video_ids', []));
    return stored.filter(v => !isBlacklistedMedia(v.id, v.videoUrl) && !deletedSet.has(v.id));
  });

  // 3. Journey Videos State
  const [journeyVideos, setJourneyVideos] = useState<JourneyVideo[]>(() => {
    const stored = getStoredOrDefault<JourneyVideo[]>('journeyVideos', INITIAL_JOURNEY_VIDEOS);
    if (Array.isArray(stored) && stored.length > 0) {
      const merged = [...stored];
      INITIAL_JOURNEY_VIDEOS.forEach(initV => {
        const idx = merged.findIndex(m => m.id === initV.id);
        if (idx === -1) {
          merged.push(initV);
        } else if (!merged[idx].videoUrl || merged[idx].videoUrl.includes('dQw4w9WgXcQ')) {
          merged[idx] = { ...merged[idx], ...initV };
        }
      });
      return merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return INITIAL_JOURNEY_VIDEOS;
  });

  // 4. Media Library State
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() =>
    getStoredOrDefault('mediaLibrary', INITIAL_MEDIA_LIBRARY)
  );

  // 5. Gallery Albums State
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(() =>
    getStoredOrDefault('galleryAlbums', INITIAL_GALLERY_ALBUMS)
  );

  // 6. Banners State
  const [banners, setBanners] = useState<BannerItem[]>(() =>
    getStoredOrDefault('banners', INITIAL_BANNERS)
  );

  // 7. Press Coverage State
  const [pressCoverages, setPressCoverages] = useState<PressCoverage[]>(() =>
    getStoredOrDefault('pressCoverages', INITIAL_PRESS_COVERAGE)
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

  useEffect(() => { persistEntity('gallery', gallery); }, [gallery, persistEntity]);
  useEffect(() => { persistEntity('videos', videos); }, [videos, persistEntity]);
  useEffect(() => { persistEntity('journeyVideos', journeyVideos); }, [journeyVideos, persistEntity]);
  useEffect(() => { persistEntity('mediaLibrary', mediaLibrary); }, [mediaLibrary, persistEntity]);
  useEffect(() => { persistEntity('galleryAlbums', galleryAlbums); }, [galleryAlbums, persistEntity]);
  useEffect(() => { persistEntity('banners', banners); }, [banners, persistEntity]);
  useEffect(() => { persistEntity('pressCoverages', pressCoverages); }, [pressCoverages, persistEntity]);

  // ----------------------------------------------------
  // GALLERY PHOTO ACTIONS
  // ----------------------------------------------------
  const addGalleryPhoto = useCallback((photo: Omit<GalleryPhoto, 'id'>) => {
    const id = `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPhoto: GalleryPhoto = {
      ...photo,
      id,
      imageUrl: getFreshImageUrl(photo.imageUrl)
    };
    setGallery(prev => [newPhoto, ...prev]);
    logAudit('CREATE', 'GalleryPhoto', id, `Added gallery photo: ${photo.title.en}`);

    safeDbUpsert('gallery_photos', {
      id: newPhoto.id,
      album_id: newPhoto.albumId || null,
      title: newPhoto.title,
      caption: newPhoto.caption,
      image_url: newPhoto.imageUrl,
      category: newPhoto.category,
      date: newPhoto.date,
      location: newPhoto.location,
      campaign_slug: newPhoto.campaignSlug || '',
      display_order: newPhoto.displayOrder || 0
    });

    return newPhoto;
  }, [logAudit]);

  const updateGalleryPhoto = useCallback((id: string, photo: Partial<GalleryPhoto>) => {
    setGallery(prev => {
      const updated = prev.map(g => {
        if (g.id !== id) return g;
        return {
          ...g,
          ...photo,
          imageUrl: photo.imageUrl ? getFreshImageUrl(photo.imageUrl) : g.imageUrl
        };
      });
      const match = updated.find(g => g.id === id);
      if (match) {
        safeDbUpsert('gallery_photos', {
          id: match.id,
          album_id: match.albumId || null,
          title: match.title,
          caption: match.caption,
          image_url: match.imageUrl,
          category: match.category,
          date: match.date,
          location: match.location,
          campaign_slug: match.campaignSlug || '',
          display_order: match.displayOrder || 0
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'GalleryPhoto', id, 'Updated gallery photo metadata');
  }, [logAudit]);

  const deleteGalleryPhoto = useCallback((id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    logAudit('DELETE', 'GalleryPhoto', id, 'Deleted photo');
    safeDbDelete('gallery_photos', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // VIDEO ACTIONS
  // ----------------------------------------------------
  const addVideo = useCallback((video: Omit<VideoItem, 'id'>) => {
    const id = `vid-${Date.now()}`;
    const det = detectAndNormalizeMedia(video.videoUrl || '');
    const cleanThumbnail = video.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL;
    const cleanEmbed = video.embedUrl || det.embedUrl || '';
    const cleanTitle = typeof video.title === 'string'
      ? { en: video.title, bn: video.title }
      : (video.title || { en: 'Field Video', bn: 'মাঠপর্যায়ের ভিডিও' });
    const cleanDescription = typeof video.description === 'string'
      ? { en: video.description, bn: video.description }
      : (video.description || { en: '', bn: '' });

    const isShorts = video.isShorts ?? det.isShorts;
    const aspectRatio = video.aspectRatio || det.aspectRatio || (isShorts ? '9/16' : '16/9');

    const newVid: VideoItem = {
      ...video,
      id,
      title: cleanTitle,
      description: cleanDescription,
      videoUrl: det.originalUrl || video.videoUrl,
      embedUrl: cleanEmbed,
      thumbnailUrl: getFreshImageUrl(cleanThumbnail),
      platform: video.platform || det.platform || 'youtube',
      category: video.category || 'General',
      status: video.status || 'published',
      isFeatured: video.isFeatured ?? false,
      sourceType: video.sourceType || 'url',
      aspectRatio,
      isShorts,
      displayOrder: video.displayOrder || (videos.length + 1),
      date: video.date || new Date().toISOString().split('T')[0],
      duration: video.duration || (isShorts ? 'Shorts' : 'Video'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVideos(prev => [newVid, ...prev]);
    logAudit('CREATE', 'VideoItem', id, `Added video: ${cleanTitle.en || cleanTitle.bn}`);

    setMediaLibrary(prev => {
      if (prev.some(m => m.id === id || m.url === newVid.videoUrl)) return prev;
      const newMedia: MediaItem = {
        id,
        fileName: cleanTitle.en || cleanTitle.bn || 'Video Asset',
        url: newVid.videoUrl,
        type: 'video',
        thumbnailUrl: newVid.thumbnailUrl,
        fileSize: 'External Stream',
        mimeType: 'video/embed',
        category: (newVid.category as any) || 'General',
        altText: cleanTitle.en || cleanTitle.bn,
        caption: cleanDescription.en || cleanDescription.bn,
        platform: newVid.platform as any,
        duration: newVid.duration,
        aspectRatio: newVid.aspectRatio,
        isShorts: newVid.isShorts,
        usageTags: ['Video Gallery', 'Field Footage'],
        uploadedAt: new Date().toISOString(),
        isFeatured: newVid.isFeatured,
        status: (newVid.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft'
      };
      safeDbUpsert('media_library', {
        id: newMedia.id,
        file_name: newMedia.fileName,
        url: newMedia.url,
        file_size: newMedia.fileSize,
        mime_type: newMedia.mimeType,
        category: newMedia.category,
        alt_text: newMedia.altText,
        caption: newMedia.caption || '',
        usage_tags: newMedia.usageTags,
        uploaded_at: newMedia.uploadedAt
      });
      return [newMedia, ...prev];
    });

    safeDbUpsert('video_items', {
      id: newVid.id,
      title: newVid.title,
      video_url: newVid.videoUrl,
      embed_url: newVid.embedUrl || '',
      thumbnail_url: newVid.thumbnailUrl,
      platform: newVid.platform,
      duration: newVid.duration || '',
      date: newVid.date,
      description: newVid.description,
      category: newVid.category,
      status: newVid.status,
      is_featured: newVid.isFeatured,
      source_type: newVid.sourceType,
      aspect_ratio: newVid.aspectRatio,
      is_shorts: newVid.isShorts,
      display_order: newVid.displayOrder,
      created_at: newVid.createdAt,
      updated_at: newVid.updatedAt
    });

    return newVid;
  }, [logAudit, videos.length]);

  const updateVideo = useCallback((id: string, video: Partial<VideoItem>) => {
    setVideos(prev => {
      const updated = prev.map(v => {
        if (v.id !== id) return v;
        const nextVideoUrl = video.videoUrl !== undefined ? video.videoUrl : v.videoUrl;
        const det = detectAndNormalizeMedia(nextVideoUrl);
        const nextThumbnail = video.thumbnailUrl !== undefined
          ? (video.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL)
          : (v.thumbnailUrl || det.thumbnailUrl || DEFAULT_VIDEO_THUMBNAIL);
        const nextEmbed = video.embedUrl !== undefined
          ? (video.embedUrl || det.embedUrl || '')
          : (v.embedUrl || det.embedUrl || '');
        const isShorts = video.isShorts !== undefined ? video.isShorts : (v.isShorts ?? det.isShorts);
        const aspectRatio = video.aspectRatio !== undefined ? video.aspectRatio : (v.aspectRatio || det.aspectRatio);

        return {
          ...v,
          ...video,
          videoUrl: det.originalUrl || nextVideoUrl,
          embedUrl: nextEmbed,
          thumbnailUrl: nextThumbnail ? getFreshImageUrl(nextThumbnail) : v.thumbnailUrl,
          aspectRatio,
          isShorts,
          displayOrder: video.displayOrder !== undefined ? video.displayOrder : v.displayOrder,
          updatedAt: new Date().toISOString()
        };
      });

      const match = updated.find(v => v.id === id);
      if (match) {
        safeDbUpsert('video_items', {
          id: match.id,
          title: match.title,
          video_url: match.videoUrl,
          embed_url: match.embedUrl || '',
          thumbnail_url: match.thumbnailUrl,
          platform: match.platform,
          duration: match.duration || '',
          date: match.date,
          description: match.description,
          category: match.category || 'General',
          status: match.status || 'published',
          is_featured: match.isFeatured || false,
          source_type: match.sourceType || 'url',
          aspect_ratio: match.aspectRatio || '16/9',
          is_shorts: match.isShorts || false,
          display_order: match.displayOrder,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'VideoItem', id, 'Updated video metadata');
  }, [logAudit]);

  const deleteVideo = useCallback(async (id: string) => {
    deletedVideoIdsRef.current.add(id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_video_ids`, JSON.stringify(Array.from(deletedVideoIdsRef.current)));
    } catch (e) {
      console.warn('Storage error on deleted_video_ids:', e);
    }

    setVideos(prev => {
      const next = prev.filter(v => v.id !== id && v.videoUrl !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setMediaLibrary(prev => {
      const next = prev.filter(m => m.id !== id && m.url !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}mediaLibrary`, JSON.stringify(next));
      } catch {}
      return next;
    });

    logAudit('DELETE', 'VideoItem', id, 'Deleted video permanently');

    if (supabase && isSupabaseConfigured) {
      try {
        const [res1, res2] = await Promise.allSettled([
          supabase.from('video_items').delete().eq('id', id),
          supabase.from('media_library').delete().eq('id', id)
        ]);
        if (res1.status === 'rejected' || (res1.status === 'fulfilled' && res1.value.error)) {
          console.error('Supabase video_items delete failed:', res1);
        }
        if (res2.status === 'rejected' || (res2.status === 'fulfilled' && res2.value.error)) {
          console.error('Supabase media_library delete failed:', res2);
        }
      } catch (err) {
        console.error('Supabase delete exception:', err);
      }
    }
  }, [logAudit]);

  const reorderVideos = useCallback((orderedIds: string[]) => {
    setVideos(prev => {
      const idMap = new Map(prev.map(item => [item.id, item]));
      const reordered: VideoItem[] = [];

      orderedIds.forEach((id, index) => {
        const item = idMap.get(id);
        if (item) {
          const updatedItem: VideoItem = { ...item, displayOrder: index + 1, updatedAt: new Date().toISOString() };
          reordered.push(updatedItem);
          safeDbUpsert('video_items', {
            id: updatedItem.id,
            title: updatedItem.title,
            video_url: updatedItem.videoUrl,
            embed_url: updatedItem.embedUrl || '',
            thumbnail_url: updatedItem.thumbnailUrl,
            platform: updatedItem.platform,
            duration: updatedItem.duration || '',
            date: updatedItem.date,
            description: updatedItem.description,
            category: updatedItem.category,
            status: updatedItem.status,
            is_featured: updatedItem.isFeatured,
            source_type: updatedItem.sourceType,
            aspect_ratio: updatedItem.aspectRatio,
            is_shorts: updatedItem.isShorts,
            display_order: updatedItem.displayOrder,
            created_at: updatedItem.createdAt || new Date().toISOString(),
            updated_at: updatedItem.updatedAt
          });
        }
      });

      prev.forEach(item => {
        if (!orderedIds.includes(item.id)) {
          reordered.push(item);
        }
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(reordered));
        localStorage.setItem(`${STORAGE_PREFIX}video_order`, JSON.stringify(orderedIds));
      } catch (e) {
        console.warn('Storage error on reorderVideos:', e);
      }

      return reordered;
    });
    logAudit('UPDATE', 'VideoItem', 'bulk', 'Reordered video items sequence');
  }, [logAudit]);

  // ----------------------------------------------------
  // JOURNEY VIDEOS ACTIONS
  // ----------------------------------------------------
  const addJourneyVideo = useCallback((video: Omit<JourneyVideo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `jvid-${Date.now()}`;
    const det = detectAndNormalizeMedia(video.videoUrl || '');
    const cleanEmbed = video.embedUrl || det.embedUrl || '';
    const cleanThumbnail = video.thumbnailUrl || det.thumbnailUrl || '';
    const cleanTitle = typeof video.title === 'string'
      ? { en: video.title, bn: video.title }
      : (video.title || { en: 'Infinity Bangladesh Journey', bn: 'ইনফিনিটি বাংলাদেশ পরিক্রমা' });
    const cleanTimeline = typeof video.timelineLabel === 'string'
      ? { en: video.timelineLabel, bn: video.timelineLabel }
      : (video.timelineLabel || { en: 'Journey', bn: 'পরিক্রমা' });
    const cleanDescription = typeof video.description === 'string'
      ? { en: video.description, bn: video.description }
      : (video.description || { en: '', bn: '' });

    const newVid: JourneyVideo = {
      ...video,
      id,
      title: cleanTitle,
      timelineLabel: cleanTimeline,
      description: cleanDescription,
      category: video.category || 'Organizational Journey',
      videoUrl: video.videoUrl || '',
      videoPlatform: video.videoPlatform || det.platform || 'auto',
      embedUrl: cleanEmbed,
      thumbnailUrl: cleanThumbnail ? getFreshImageUrl(cleanThumbnail) : '',
      displayOrder: video.displayOrder ?? (journeyVideos.length + 1),
      isPublished: video.isPublished ?? true,
      isFeatured: video.isFeatured ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setJourneyVideos(prev => {
      let list = prev;
      if (newVid.isFeatured) {
        list = list.map(v => ({ ...v, isFeatured: false }));
      }
      return [...list, newVid].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });

    logAudit('CREATE', 'JourneyVideo', id, `Added journey video: ${cleanTimeline.en || cleanTitle.en}`);

    if (newVid.isFeatured && supabase && isSupabaseConfigured) {
      void supabase.from('journey_videos').update({ is_featured: false }).neq('id', id);
    }

    safeDbUpsert('journey_videos', {
      id: newVid.id,
      title: newVid.title,
      timeline_label: newVid.timelineLabel,
      description: newVid.description,
      category: newVid.category,
      video_url: newVid.videoUrl,
      video_platform: newVid.videoPlatform,
      embed_url: newVid.embedUrl || '',
      thumbnail_url: newVid.thumbnailUrl || '',
      display_order: newVid.displayOrder,
      is_published: newVid.isPublished,
      is_featured: newVid.isFeatured,
      created_at: newVid.createdAt,
      updated_at: newVid.updatedAt
    });

    return newVid;
  }, [journeyVideos.length, logAudit]);

  const updateJourneyVideo = useCallback((id: string, video: Partial<JourneyVideo>) => {
    setJourneyVideos(prev => {
      const willBeFeatured = video.isFeatured === true;
      const updated = prev.map(v => {
        if (v.id !== id) {
          if (willBeFeatured) return { ...v, isFeatured: false };
          return v;
        }
        const nextVideoUrl = video.videoUrl !== undefined ? video.videoUrl : v.videoUrl;
        const det = detectAndNormalizeMedia(nextVideoUrl);
        const nextEmbed = video.embedUrl !== undefined
          ? (video.embedUrl || det.embedUrl || '')
          : (v.embedUrl || det.embedUrl || '');
        const nextThumbnail = video.thumbnailUrl !== undefined
          ? (video.thumbnailUrl || det.thumbnailUrl || '')
          : (v.thumbnailUrl || det.thumbnailUrl || '');

        return {
          ...v,
          ...video,
          embedUrl: nextEmbed,
          thumbnailUrl: nextThumbnail ? getFreshImageUrl(nextThumbnail) : '',
          updatedAt: new Date().toISOString()
        };
      }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      const match = updated.find(v => v.id === id);
      if (match) {
        if (willBeFeatured && supabase && isSupabaseConfigured) {
          void supabase.from('journey_videos').update({ is_featured: false }).neq('id', id);
        }

        safeDbUpsert('journey_videos', {
          id: match.id,
          title: match.title,
          timeline_label: match.timelineLabel,
          description: match.description,
          category: match.category || 'Organizational Journey',
          video_url: match.videoUrl || '',
          video_platform: match.videoPlatform || 'auto',
          embed_url: match.embedUrl || '',
          thumbnail_url: match.thumbnailUrl || '',
          display_order: match.displayOrder ?? 0,
          is_published: match.isPublished ?? true,
          is_featured: match.isFeatured ?? false,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });

    logAudit('UPDATE', 'JourneyVideo', id, 'Updated journey video');
  }, [logAudit]);

  const deleteJourneyVideo = useCallback((id: string) => {
    setJourneyVideos(prev => {
      const next = prev.filter(v => v.id !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}journeyVideos`, JSON.stringify(next));
      } catch {}
      return next;
    });

    logAudit('DELETE', 'JourneyVideo', id, 'Deleted journey video');
    safeDbDelete('journey_videos', 'id', id);
  }, [logAudit]);

  const reorderJourneyVideos = useCallback((orderedIds: string[]) => {
    setJourneyVideos(prev => {
      const idMap = new Map(prev.map(item => [item.id, item]));
      const reordered: JourneyVideo[] = [];

      orderedIds.forEach((id, index) => {
        const item = idMap.get(id);
        if (item) {
          const updatedItem = { ...item, displayOrder: index + 1, updatedAt: new Date().toISOString() };
          reordered.push(updatedItem);
          safeDbUpsert('journey_videos', {
            id: updatedItem.id,
            title: updatedItem.title,
            timeline_label: updatedItem.timelineLabel,
            description: updatedItem.description,
            category: updatedItem.category,
            video_url: updatedItem.videoUrl,
            video_platform: updatedItem.videoPlatform,
            embed_url: updatedItem.embedUrl || '',
            thumbnail_url: updatedItem.thumbnailUrl || '',
            display_order: updatedItem.displayOrder,
            is_published: updatedItem.isPublished,
            is_featured: updatedItem.isFeatured,
            created_at: updatedItem.createdAt || new Date().toISOString(),
            updated_at: updatedItem.updatedAt
          });
        }
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}journeyVideos`, JSON.stringify(reordered));
      } catch {}
      return reordered;
    });

    logAudit('REORDER', 'JourneyVideo', 'bulk', 'Updated journey videos display sequence');
  }, [logAudit]);

  const setFeaturedJourneyVideo = useCallback((id: string) => {
    setJourneyVideos(prev => {
      const updated = prev.map(v => ({
        ...v,
        isFeatured: v.id === id,
        updatedAt: v.id === id ? new Date().toISOString() : v.updatedAt
      }));

      if (supabase && isSupabaseConfigured) {
        void supabase.from('journey_videos').update({ is_featured: false }).neq('id', id).then(() => {
          void supabase?.from('journey_videos').update({ is_featured: true }).eq('id', id);
        });
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}journeyVideos`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAudit('UPDATE', 'JourneyVideo', id, 'Set as primary featured journey video');
  }, [logAudit]);

  // ----------------------------------------------------
  // MEDIA LIBRARY & ALBUMS ACTIONS
  // ----------------------------------------------------
  const addMediaItem = useCallback((media: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const id = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMedia: MediaItem = {
      ...media,
      id,
      url: getFreshImageUrl(media.url),
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMediaLibrary(prev => [newMedia, ...prev]);
    logAudit('CREATE', 'MediaItem', id, `Uploaded media: ${media.fileName}`);

    safeDbUpsert('media_library', {
      id: newMedia.id,
      file_name: newMedia.fileName,
      url: newMedia.url,
      file_size: newMedia.fileSize,
      mime_type: newMedia.mimeType,
      category: newMedia.category,
      alt_text: newMedia.altText,
      caption: newMedia.caption || '',
      usage_tags: newMedia.usageTags,
      uploaded_at: new Date().toISOString()
    });

    return newMedia;
  }, [logAudit]);

  const updateMediaItem = useCallback((id: string, media: Partial<MediaItem>) => {
    setMediaLibrary(prev => {
      const updated = prev.map(m => {
        if (m.id !== id) return m;
        return {
          ...m,
          ...media,
          url: media.url ? getFreshImageUrl(media.url) : m.url
        };
      });
      const match = updated.find(m => m.id === id);
      if (match) {
        safeDbUpsert('media_library', {
          id: match.id,
          file_name: match.fileName,
          url: match.url,
          file_size: match.fileSize,
          mime_type: match.mimeType,
          category: match.category,
          alt_text: match.altText,
          caption: match.caption || '',
          usage_tags: match.usageTags
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'MediaItem', id, 'Updated media metadata/alt-text');
  }, [logAudit]);

  const deleteMediaItem = useCallback(async (id: string) => {
    deletedVideoIdsRef.current.add(id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_video_ids`, JSON.stringify(Array.from(deletedVideoIdsRef.current)));
    } catch (e) {
      console.warn('Storage error on deleted_video_ids:', e);
    }

    setMediaLibrary(prev => {
      const next = prev.filter(m => m.id !== id && m.url !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}mediaLibrary`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setVideos(prev => {
      const next = prev.filter(v => v.id !== id && v.videoUrl !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}videos`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setGallery(prev => {
      const next = prev.filter(g => g.id !== id && g.imageUrl !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}gallery`, JSON.stringify(next));
      } catch {}
      return next;
    });

    logAudit('DELETE', 'MediaItem', id, 'Deleted media asset');

    if (supabase && isSupabaseConfigured) {
      try {
        const [res1, res2, res3] = await Promise.allSettled([
          supabase.from('media_library').delete().eq('id', id),
          supabase.from('video_items').delete().eq('id', id),
          supabase.from('gallery_photos').delete().eq('id', id)
        ]);
        if (res1.status === 'rejected' || (res1.status === 'fulfilled' && res1.value.error)) {
          console.error('Supabase media_library delete warning:', res1);
        }
        if (res2.status === 'rejected' || (res2.status === 'fulfilled' && res2.value.error)) {
          console.error('Supabase video_items delete warning:', res2);
        }
      } catch (err) {
        console.error('Supabase delete exception:', err);
      }
    }
  }, [logAudit]);

  const addGalleryAlbum = useCallback((album: Omit<GalleryAlbum, 'id'>) => {
    const id = `alb-${Date.now()}`;
    const newAlbum: GalleryAlbum = {
      ...album,
      id,
      coverImageUrl: getFreshImageUrl(album.coverImageUrl)
    };
    setGalleryAlbums(prev => [...prev, newAlbum]);
    logAudit('CREATE', 'GalleryAlbum', id, `Created album: ${album.title.en}`);

    safeDbUpsert('gallery_albums', {
      id: newAlbum.id,
      slug: newAlbum.slug,
      title: newAlbum.title,
      description: newAlbum.description,
      cover_image_url: newAlbum.coverImageUrl,
      category: newAlbum.category,
      date: newAlbum.date,
      is_published: newAlbum.isPublished,
      display_order: newAlbum.displayOrder
    });

    return newAlbum;
  }, [logAudit]);

  const updateGalleryAlbum = useCallback((id: string, album: Partial<GalleryAlbum>) => {
    setGalleryAlbums(prev => {
      const updated = prev.map(a => {
        if (a.id !== id) return a;
        return {
          ...a,
          ...album,
          coverImageUrl: album.coverImageUrl ? getFreshImageUrl(album.coverImageUrl) : a.coverImageUrl
        };
      });
      const match = updated.find(a => a.id === id);
      if (match) {
        safeDbUpsert('gallery_albums', {
          id: match.id,
          slug: match.slug,
          title: match.title,
          description: match.description,
          cover_image_url: match.coverImageUrl,
          category: match.category,
          date: match.date,
          is_published: match.isPublished,
          display_order: match.displayOrder
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'GalleryAlbum', id, 'Updated gallery album');
  }, [logAudit]);

  const deleteGalleryAlbum = useCallback((id: string) => {
    setGalleryAlbums(prev => prev.filter(a => a.id !== id));
    logAudit('DELETE', 'GalleryAlbum', id, 'Deleted gallery album');
    safeDbDelete('gallery_albums', 'id', id);
  }, [logAudit]);

  const setAlbumPhotos = useCallback((albumId: string, photoIds: string[]) => {
    setGallery(prev => {
      const updated = prev.map(photo => {
        if (photoIds.includes(photo.id)) {
          const newPhoto = { ...photo, albumId, displayOrder: photoIds.indexOf(photo.id) + 1 };
          safeDbUpsert('gallery_photos', {
            id: newPhoto.id,
            album_id: albumId,
            title: newPhoto.title,
            caption: newPhoto.caption,
            image_url: newPhoto.imageUrl,
            category: newPhoto.category,
            date: newPhoto.date,
            location: newPhoto.location,
            campaign_slug: newPhoto.campaignSlug || '',
            display_order: newPhoto.displayOrder || 0
          });
          return newPhoto;
        } else if (photo.albumId === albumId) {
          const newPhoto = { ...photo, albumId: undefined };
          safeDbUpsert('gallery_photos', {
            id: newPhoto.id,
            album_id: null,
            title: newPhoto.title,
            caption: newPhoto.caption,
            image_url: newPhoto.imageUrl,
            category: newPhoto.category,
            date: newPhoto.date,
            location: newPhoto.location,
            campaign_slug: newPhoto.campaignSlug || '',
            display_order: newPhoto.displayOrder || 0
          });
          return newPhoto;
        }
        return photo;
      });
      return updated;
    });

    setGalleryAlbums(prev => {
      return prev.map(alb => {
        if (alb.id !== albumId) return alb;
        return {
          ...alb,
          photos: gallery.filter(g => photoIds.includes(g.id))
        };
      });
    });

    logAudit('UPDATE', 'GalleryAlbum', albumId, `Updated photos in album (${photoIds.length} photos assigned)`);
  }, [gallery, logAudit]);

  // ----------------------------------------------------
  // BANNERS ACTIONS
  // ----------------------------------------------------
  const addBanner = useCallback((banner: Omit<BannerItem, 'id'>) => {
    const id = `ban-${Date.now()}`;
    const newBanner: BannerItem = {
      ...banner,
      id,
      desktopImageUrl: getFreshImageUrl(banner.desktopImageUrl),
      mobileImageUrl: banner.mobileImageUrl ? getFreshImageUrl(banner.mobileImageUrl) : ''
    };
    setBanners(prev => [...prev, newBanner]);
    logAudit('CREATE', 'BannerItem', id, `Created banner: ${banner.title.en}`);
    safeDbUpsert('banners', newBanner);
  }, [logAudit]);

  const updateBanner = useCallback((id: string, banner: Partial<BannerItem>) => {
    setBanners(prev => {
      const updated = prev.map(b => {
        if (b.id !== id) return b;
        return {
          ...b,
          ...banner,
          desktopImageUrl: banner.desktopImageUrl ? getFreshImageUrl(banner.desktopImageUrl) : b.desktopImageUrl,
          mobileImageUrl: banner.mobileImageUrl ? getFreshImageUrl(banner.mobileImageUrl) : b.mobileImageUrl
        };
      });
      const match = updated.find(b => b.id === id);
      if (match) safeDbUpsert('banners', match);
      return updated;
    });
    logAudit('UPDATE', 'BannerItem', id, 'Updated banner details');
  }, [logAudit]);

  const deleteBanner = useCallback((id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    logAudit('DELETE', 'BannerItem', id, 'Deleted banner');
    safeDbDelete('banners', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // PRESS & MEDIA COVERAGE ACTIONS
  // ----------------------------------------------------
  const addPressCoverage = useCallback((press: Omit<PressCoverage, 'id'>) => {
    const id = `press-${Date.now()}`;
    const newPress: PressCoverage = {
      ...press,
      id,
      imageUrl: press.imageUrl ? getFreshImageUrl(press.imageUrl) : undefined,
      outletLogoUrl: press.outletLogoUrl ? getFreshImageUrl(press.outletLogoUrl) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPressCoverages(prev => [newPress, ...prev]);
    logAudit('CREATE', 'PressCoverage', id, `Added press coverage: ${press.title.en}`);

    safeDbUpsert('press_coverage', {
      id: newPress.id,
      outlet_name: newPress.outletName,
      outlet_logo_url: newPress.outletLogoUrl,
      title: newPress.title,
      article_url: newPress.articleUrl,
      excerpt: newPress.excerpt,
      coverage_type: newPress.coverageType,
      published_date: newPress.publishedDate,
      image_url: newPress.imageUrl,
      is_featured: newPress.isFeatured,
      status: newPress.status,
      created_at: newPress.createdAt,
      updated_at: newPress.updatedAt
    });

    return newPress;
  }, [logAudit]);

  const updatePressCoverage = useCallback((id: string, press: Partial<PressCoverage>) => {
    setPressCoverages(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...press,
          imageUrl: press.imageUrl ? getFreshImageUrl(press.imageUrl) : p.imageUrl,
          outletLogoUrl: press.outletLogoUrl ? getFreshImageUrl(press.outletLogoUrl) : p.outletLogoUrl,
          updatedAt: new Date().toISOString()
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('press_coverage', {
          id: match.id,
          outlet_name: match.outletName,
          outlet_logo_url: match.outletLogoUrl,
          title: match.title,
          article_url: match.articleUrl,
          excerpt: match.excerpt,
          coverage_type: match.coverageType,
          published_date: match.publishedDate,
          image_url: match.imageUrl,
          is_featured: match.isFeatured,
          status: match.status,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'PressCoverage', id, 'Updated press coverage details');
  }, [logAudit]);

  const deletePressCoverage = useCallback((id: string) => {
    setPressCoverages(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'PressCoverage', id, 'Deleted press coverage');
    safeDbDelete('press_coverage', 'id', id);
  }, [logAudit]);

  return {
    gallery,
    setGallery,
    videos,
    setVideos,
    journeyVideos,
    setJourneyVideos,
    mediaLibrary,
    setMediaLibrary,
    galleryAlbums,
    setGalleryAlbums,
    banners,
    setBanners,
    pressCoverages,
    setPressCoverages,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    addVideo,
    updateVideo,
    deleteVideo,
    reorderVideos,
    addJourneyVideo,
    updateJourneyVideo,
    deleteJourneyVideo,
    reorderJourneyVideos,
    setFeaturedJourneyVideo,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    addGalleryAlbum,
    updateGalleryAlbum,
    deleteGalleryAlbum,
    setAlbumPhotos,
    addBanner,
    updateBanner,
    deleteBanner,
    addPressCoverage,
    updatePressCoverage,
    deletePressCoverage
  };
}

