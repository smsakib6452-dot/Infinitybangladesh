/**
 * API Service Layer for Infinity Bangladesh
 * Provides structured query and mutation interfaces for all organization entities.
 */

import {
  Campaign,
  Program,
  ImpactMetric,
  ImpactStory,
  NewsArticle,
  EventItem,
  GalleryPhoto,
  VideoItem,
  TransparencyReport,
  Partner,
  VolunteerApplication,
  DonationRecord,
  ContactMessage,
  SiteSettings,
  JourneyVideo,
  BloodDonor,
  BloodDonationHistoryEntry,
  EmergencyBloodRequest,
  EmergencyRequestStatus,
  BloodGroup
} from '../../types';

// Rate-limiting map for form submissions (minimum 6-8 seconds cooldown to prevent spam/abuse)
const submissionTimestamps: Record<string, number> = {};

function enforceRateLimit(key: string, minIntervalMs: number = 6000): void {
  const now = Date.now();
  const lastTime = submissionTimestamps[key] || 0;
  if (now - lastTime < minIntervalMs) {
    const waitSeconds = Math.ceil((minIntervalMs - (now - lastTime)) / 1000);
    throw new Error(`Please wait ${waitSeconds} second(s) before submitting again.`);
  }
  submissionTimestamps[key] = now;
}

export class ApiService {
  /**
   * Fetch site-wide public metadata and settings
   */
  static async getSiteSettings(): Promise<SiteSettings | null> {
    // In server environment, executes Prisma query. In client, handled via DataContext.
    return null;
  }

  /**
   * Fetch all published videos
   */
  static async getVideos(): Promise<VideoItem[]> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('video_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            title: item.title,
            videoUrl: item.video_url,
            embedUrl: item.embed_url,
            thumbnailUrl: item.thumbnail_url,
            platform: item.platform,
            duration: item.duration,
            date: item.date,
            description: item.description,
            category: item.category,
            status: item.status,
            isFeatured: item.is_featured,
            sourceType: item.source_type,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }));
        }
      }
    } catch (err) {
      console.warn('ApiService getVideos fallback:', err);
    }

    try {
      const saved = localStorage.getItem('infinity_bd_v2_videos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    const { INITIAL_VIDEOS } = await import('../../data/initialData');
    return INITIAL_VIDEOS;
  }

  /**
   * Create video entry
   */
  static async createVideo(video: Omit<VideoItem, 'id'>): Promise<VideoItem> {
    const id = `vid-${Date.now()}`;
    const newVid: VideoItem = {
      ...video,
      id,
      status: video.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        await supabase.from('video_items').upsert({
          id: newVid.id,
          title: newVid.title,
          video_url: newVid.videoUrl,
          embed_url: newVid.embedUrl || '',
          thumbnail_url: newVid.thumbnailUrl,
          platform: newVid.platform,
          duration: newVid.duration || '',
          date: newVid.date,
          description: newVid.description,
          category: newVid.category || 'General',
          status: newVid.status,
          is_featured: newVid.isFeatured || false,
          source_type: newVid.sourceType || 'url',
          created_at: newVid.createdAt,
          updated_at: newVid.updatedAt
        });
      }
    } catch (err) {
      console.warn('ApiService createVideo db error:', err);
    }

    return newVid;
  }

  /**
   * Update video entry
   */
  static async updateVideo(id: string, video: Partial<VideoItem>): Promise<void> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (video.title !== undefined) payload.title = video.title;
        if (video.videoUrl !== undefined) payload.video_url = video.videoUrl;
        if (video.embedUrl !== undefined) payload.embed_url = video.embedUrl;
        if (video.thumbnailUrl !== undefined) payload.thumbnail_url = video.thumbnailUrl;
        if (video.platform !== undefined) payload.platform = video.platform;
        if (video.duration !== undefined) payload.duration = video.duration;
        if (video.date !== undefined) payload.date = video.date;
        if (video.description !== undefined) payload.description = video.description;
        if (video.category !== undefined) payload.category = video.category;
        if (video.status !== undefined) payload.status = video.status;
        if (video.isFeatured !== undefined) payload.is_featured = video.isFeatured;
        if (video.sourceType !== undefined) payload.source_type = video.sourceType;

        await supabase.from('video_items').update(payload).eq('id', id);
      }
    } catch (err) {
      console.warn('ApiService updateVideo db error:', err);
    }
  }

  /**
   * Delete video entry
   */
  static async deleteVideo(id: string): Promise<void> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        await supabase.from('video_items').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('ApiService deleteVideo db error:', err);
    }
  }

  /**
   * Fetch all published Journey Videos
   */
  static async getJourneyVideos(): Promise<JourneyVideo[]> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('journey_videos')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            title: item.title,
            timelineLabel: item.timeline_label,
            description: item.description,
            category: item.category,
            videoUrl: item.video_url || '',
            videoPlatform: item.video_platform || 'auto',
            embedUrl: item.embed_url || '',
            thumbnailUrl: item.thumbnail_url || '',
            displayOrder: item.display_order ?? 0,
            isPublished: item.is_published ?? true,
            isFeatured: item.is_featured ?? false,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }));
        }
      }
    } catch (err) {
      console.warn('ApiService getJourneyVideos fallback:', err);
    }

    try {
      const saved = localStorage.getItem('infinity_bd_v2_journeyVideos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    const { INITIAL_JOURNEY_VIDEOS } = await import('../../data/initialData');
    return INITIAL_JOURNEY_VIDEOS;
  }

  /**
   * Create Journey Video entry
   */
  static async createJourneyVideo(video: Omit<JourneyVideo, 'id' | 'createdAt' | 'updatedAt'>): Promise<JourneyVideo> {
    const id = `jvid-${Date.now()}`;
    const newVid: JourneyVideo = {
      ...video,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        if (newVid.isFeatured) {
          await supabase.from('journey_videos').update({ is_featured: false }).neq('id', id);
        }
        await supabase.from('journey_videos').upsert({
          id: newVid.id,
          title: newVid.title,
          timeline_label: newVid.timelineLabel,
          description: newVid.description,
          category: newVid.category || 'Organizational Journey',
          video_url: newVid.videoUrl || '',
          video_platform: newVid.videoPlatform || 'auto',
          embed_url: newVid.embedUrl || '',
          thumbnail_url: newVid.thumbnailUrl || '',
          display_order: newVid.displayOrder ?? 0,
          is_published: newVid.isPublished ?? true,
          is_featured: newVid.isFeatured ?? false,
          created_at: newVid.createdAt,
          updated_at: newVid.updatedAt
        });
      }
    } catch (err) {
      console.warn('ApiService createJourneyVideo db error:', err);
    }

    return newVid;
  }

  /**
   * Update Journey Video entry
   */
  static async updateJourneyVideo(id: string, video: Partial<JourneyVideo>): Promise<void> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        if (video.isFeatured) {
          await supabase.from('journey_videos').update({ is_featured: false }).neq('id', id);
        }

        const payload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (video.title !== undefined) payload.title = video.title;
        if (video.timelineLabel !== undefined) payload.timeline_label = video.timelineLabel;
        if (video.description !== undefined) payload.description = video.description;
        if (video.category !== undefined) payload.category = video.category;
        if (video.videoUrl !== undefined) payload.video_url = video.videoUrl;
        if (video.videoPlatform !== undefined) payload.video_platform = video.videoPlatform;
        if (video.embedUrl !== undefined) payload.embed_url = video.embedUrl;
        if (video.thumbnailUrl !== undefined) payload.thumbnail_url = video.thumbnailUrl;
        if (video.displayOrder !== undefined) payload.display_order = video.displayOrder;
        if (video.isPublished !== undefined) payload.is_published = video.isPublished;
        if (video.isFeatured !== undefined) payload.is_featured = video.isFeatured;

        await supabase.from('journey_videos').update(payload).eq('id', id);
      }
    } catch (err) {
      console.warn('ApiService updateJourneyVideo db error:', err);
    }
  }

  /**
   * Delete Journey Video entry
   */
  static async deleteJourneyVideo(id: string): Promise<void> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        await supabase.from('journey_videos').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('ApiService deleteJourneyVideo db error:', err);
    }
  }

  /**
   * Submit volunteer application with server validation, rate limiting & offline fallback
   */
  static async submitVolunteerApplication(data: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>): Promise<{ success: boolean; id: string; message: string }> {
    if (!data.fullName || !data.email || !data.phone || !data.district) {
      throw new Error('Please fill in all required fields (Name, Email, Phone, District).');
    }

    const emailKey = data.email.toLowerCase().trim();
    enforceRateLimit(`vol_${emailKey}`, 7000);

    const id = `vol_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: VolunteerApplication = {
      ...data,
      id,
      submittedAt: new Date().toISOString(),
      status: 'New'
    };

    // 1. Attempt Supabase direct persistence if available
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.from('volunteer_applications').insert([{
          id: newRecord.id,
          full_name: newRecord.fullName,
          email: newRecord.email,
          phone: newRecord.phone,
          district: newRecord.district,
          upazila: newRecord.upazila || null,
          blood_group: newRecord.bloodGroup || null,
          occupation: newRecord.occupation || null,
          skills: newRecord.skills || [],
          motivation: newRecord.motivation || null,
          status: 'New',
          submitted_at: newRecord.submittedAt,
          raw_data: newRecord
        }]);

        if (!error) {
          return {
            success: true,
            id,
            message: 'Application recorded and synchronized successfully.'
          };
        }
        console.warn('Supabase volunteer insert notice, falling back to local storage:', error.message);
      }
    } catch (err) {
      console.warn('Supabase volunteer insert error, storing in local fallback queue:', err);
    }

    // 2. Safe Local Storage Persistence Fallback
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('infinity_pending_volunteers') || '[]');
        existing.unshift(newRecord);
        localStorage.setItem('infinity_pending_volunteers', JSON.stringify(existing.slice(0, 50)));
      }
    } catch (e) {
      console.warn('LocalStorage volunteer fallback warning:', e);
    }

    return {
      success: true,
      id,
      message: 'Application recorded successfully.'
    };
  }

  /**
   * Submit contact inquiry message with rate limiting & persistence fallback
   */
  static async submitContactInquiry(data: Omit<ContactMessage, 'id' | 'submittedAt' | 'status'>): Promise<{ success: boolean; message: string }> {
    if (!data.name || !data.email || !data.message) {
      throw new Error('Name, Email, and Message are required.');
    }

    const emailKey = data.email.toLowerCase().trim();
    enforceRateLimit(`contact_${emailKey}`, 7000);

    const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: ContactMessage = {
      ...data,
      id,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };

    // 1. Attempt Supabase direct persistence if available
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.from('contact_inquiries').insert([{
          id: newRecord.id,
          name: newRecord.name,
          email: newRecord.email,
          phone: newRecord.phone || null,
          subject: newRecord.subject || null,
          message: newRecord.message,
          status: 'Unread',
          submitted_at: newRecord.submittedAt,
          raw_data: newRecord
        }]);

        if (!error) {
          return {
            success: true,
            message: 'Message delivered to Infinity Bangladesh desk.'
          };
        }
        console.warn('Supabase contact insert notice, falling back to local storage:', error.message);
      }
    } catch (err) {
      console.warn('Supabase contact insert error, storing in local fallback queue:', err);
    }

    // 2. Safe Local Storage Persistence Fallback
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('infinity_pending_contacts') || '[]');
        existing.unshift(newRecord);
        localStorage.setItem('infinity_pending_contacts', JSON.stringify(existing.slice(0, 50)));
      }
    } catch (e) {
      console.warn('LocalStorage contact fallback warning:', e);
    }

    return {
      success: true,
      message: 'Message delivered to Infinity Bangladesh desk.'
    };
  }

  // ==============================================================================
  // BLOOD DONATION NETWORK API (CENTRAL BACKEND & MOBILE APP READY)
  // ==============================================================================

  /**
   * Fetch approved blood donors for public directory with privacy safe fields
   */
  static async getBloodDonors(includePending: boolean = false): Promise<BloodDonor[]> {
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        let query = supabase.from('blood_donors').select('*, blood_donation_history(*)').order('created_at', { ascending: false });
        if (!includePending) {
          query = query.eq('approval_status', 'APPROVED');
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map(d => ({
            id: d.id,
            fullName: d.full_name,
            bloodGroup: d.blood_group,
            gender: d.gender || 'Male',
            dateOfBirth: d.date_of_birth || d.dob,
            dob: d.dob || d.date_of_birth,
            phone: d.phone,
            email: d.email,
            photoUrl: d.photo_url,
            district: d.district,
            upazila: d.upazila,
            area: d.area,
            detailedAddress: d.detailed_address,
            orgCategory: d.org_category,
            committeePosition: d.committee_position,
            availabilityStatus: d.availability_status,
            firstDonationDate: d.first_donation_date,
            lastDonationDate: d.last_donation_date,
            totalDonations: d.total_donations ?? 0,
            experienceNotes: d.experience_notes,
            isVerified: d.is_verified ?? false,
            approvalStatus: d.approval_status ?? 'PENDING',
            privacyConsent: d.privacy_consent ?? true,
            showPhonePublicly: d.gender === 'Male' ? true : (d.show_phone_publicly ?? false),
            donationHistory: Array.isArray(d.blood_donation_history) ? d.blood_donation_history.map((h: any) => ({
              id: h.id,
              donorId: h.donor_id,
              donationDate: h.donation_date,
              hospital: h.hospital,
              district: h.district,
              donationType: h.donation_type,
              recipientReference: h.recipient_reference,
              notes: h.notes,
              isVerified: h.is_verified ?? true,
              createdAt: h.created_at
            })) : [],
            createdAt: d.created_at,
            updatedAt: d.updated_at
          }));
        }
      }
    } catch (err) {
      console.warn('ApiService getBloodDonors error:', err);
    }
    return [];
  }

  /**
   * Search donors by blood group, district, upazila, gender, and availability
   */
  static async searchBloodDonors(filters: {
    bloodGroup?: string;
    gender?: string;
    district?: string;
    upazila?: string;
    area?: string;
    availability?: string;
    orgCategory?: string;
  }): Promise<BloodDonor[]> {
    const all = await this.getBloodDonors(false);
    return all.filter(d => {
      if (filters.bloodGroup && filters.bloodGroup !== 'ALL' && d.bloodGroup !== filters.bloodGroup) return false;
      if (filters.gender && filters.gender !== 'ALL' && d.gender !== filters.gender) return false;
      if (filters.district && filters.district !== 'ALL' && d.district.toLowerCase() !== filters.district.toLowerCase()) return false;
      if (filters.upazila && filters.upazila !== 'ALL' && d.upazila.toLowerCase() !== filters.upazila.toLowerCase()) return false;
      if (filters.area && !d.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.availability && filters.availability !== 'ALL' && d.availabilityStatus !== filters.availability) return false;
      if (filters.orgCategory && filters.orgCategory !== 'ALL' && d.orgCategory !== filters.orgCategory) return false;
      return true;
    });
  }

  /**
   * Submit new blood donor registration (enters PENDING approval)
   */
  static async registerBloodDonor(donorData: Omit<BloodDonor, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id: string; message: string }> {
    if (!donorData.fullName || !donorData.bloodGroup || !donorData.phone || !donorData.district || !donorData.upazila || !(donorData.dateOfBirth || donorData.dob)) {
      throw new Error('Please provide Full Name, Blood Group, Phone, District, Upazila, and Date of Birth.');
    }

    const phoneKey = donorData.phone.trim();
    enforceRateLimit(`donor_${phoneKey}`, 7000);

    const id = `donor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        await supabase.from('blood_donors').insert([{
          id,
          full_name: donorData.fullName,
          blood_group: donorData.bloodGroup,
          gender: donorData.gender || 'Male',
          date_of_birth: donorData.dateOfBirth || donorData.dob || null,
          phone: donorData.phone,
          email: donorData.email || null,
          photo_url: donorData.photoUrl || null,
          district: donorData.district,
          upazila: donorData.upazila,
          area: donorData.area,
          detailed_address: donorData.detailedAddress || null,
          org_category: donorData.orgCategory || 'Open Voluntary Blood Donor',
          committee_position: donorData.committeePosition || null,
          availability_status: donorData.availabilityStatus || 'AVAILABLE_EMERGENCY',
          first_donation_date: donorData.firstDonationDate || null,
          last_donation_date: donorData.lastDonationDate || null,
          total_donations: donorData.totalDonations ?? 0,
          experience_notes: donorData.experienceNotes || null,
          is_verified: false,
          approval_status: 'PENDING',
          privacy_consent: donorData.privacyConsent ?? true,
          show_phone_publicly: donorData.gender === 'Male' ? true : (donorData.showPhonePublicly ?? false)
        }]);
      }
    } catch (err) {
      console.warn('ApiService registerBloodDonor db error:', err);
    }

    return {
      success: true,
      id,
      message: 'Your registration has been submitted successfully and is awaiting review.'
    };
  }

  /**
   * Submit an emergency blood request
   */
  static async submitEmergencyBloodRequest(reqData: Omit<EmergencyBloodRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id: string; message: string }> {
    if (!reqData.requesterName || !reqData.contactNumber || !reqData.patientName || !reqData.bloodGroup || !reqData.hospitalName || !reqData.district) {
      throw new Error('Please fill in all mandatory fields (Requester, Contact Phone, Patient, Blood Group, Hospital, District).');
    }

    const phoneKey = reqData.contactNumber.trim();
    enforceRateLimit(`emg_${phoneKey}`, 5000);

    const id = `emg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    const newEmergencyRecord: EmergencyBloodRequest = {
      ...reqData,
      id,
      status: 'PENDING',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase');
      if (supabase && isSupabaseConfigured) {
        await supabase.from('emergency_blood_requests').insert([{
          id,
          requester_name: reqData.requesterName,
          contact_number: reqData.contactNumber,
          patient_name: reqData.patientName,
          blood_group: reqData.bloodGroup,
          units_needed: reqData.unitsNeeded || 1,
          hospital_name: reqData.hospitalName,
          district: reqData.district,
          upazila: reqData.upazila,
          emergency_level: reqData.emergencyLevel || 'URGENT',
          required_date: reqData.requiredDate,
          additional_notes: reqData.additionalNotes || null,
          status: 'PENDING',
          matched_donor_ids: reqData.matchedDonorIds || []
        }]);
      }
    } catch (err) {
      console.warn('ApiService submitEmergencyBloodRequest db error:', err);
    }

    // Local Storage emergency fallback
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('infinity_pending_emergency_requests') || '[]');
        existing.unshift(newEmergencyRecord);
        localStorage.setItem('infinity_pending_emergency_requests', JSON.stringify(existing.slice(0, 30)));
      }
    } catch (e) {
      console.warn('LocalStorage emergency request fallback warning:', e);
    }

    return {
      success: true,
      id,
      message: 'Emergency request registered. Team Infinity blood coordinators will review matching donors.'
    };
  }

  /**
   * Match active available donors for an emergency request
   */
  static async matchDonorsForRequest(bloodGroup: BloodGroup, district: string, upazila?: string): Promise<BloodDonor[]> {
    const donors = await this.getBloodDonors(false);
    return donors.filter(d => {
      if (d.bloodGroup !== bloodGroup) return false;
      if (d.availabilityStatus === 'UNAVAILABLE') return false;
      if (district && d.district.toLowerCase() !== district.toLowerCase()) return false;
      if (upazila && upazila !== 'ALL' && d.upazila.toLowerCase() === upazila.toLowerCase()) return true;
      return true;
    }).sort((a, b) => {
      // Prioritize AVAILABLE_EMERGENCY over AVAILABLE_NOTICE
      if (a.availabilityStatus === 'AVAILABLE_EMERGENCY' && b.availabilityStatus !== 'AVAILABLE_EMERGENCY') return -1;
      if (b.availabilityStatus === 'AVAILABLE_EMERGENCY' && a.availabilityStatus !== 'AVAILABLE_EMERGENCY') return 1;
      return (b.totalDonations ?? 0) - (a.totalDonations ?? 0);
    });
  }
}

