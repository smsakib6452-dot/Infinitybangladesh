import { useState, useCallback, useRef } from 'react';
import {
  BloodDonor,
  BloodDonationHistoryEntry,
  EmergencyBloodRequest,
  EmergencyRequestStatus,
  BloodDonationSettings,
  DonorCategoryOption
} from '../../types';
import {
  INITIAL_BLOOD_DONORS,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_BLOOD_SETTINGS,
  DEFAULT_DONOR_CATEGORIES
} from '../../data/initialData';
import { cleanBloodDonor, cleanEmergencyRequest } from '../../data/bloodDonationData';
import { getFreshImageUrl } from '../../lib/cloudinary';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { STORAGE_PREFIX, getStoredOrDefault } from '../dataStorage';
import { safeDbUpsert, safeDbDelete, createAuditLog } from '../dbAdapter';

export function useBloodDonationSlice(onAuditLog: (action: string, entity: string, entityId: string, details: string) => void) {
  const deletedDonorIdsRef = useRef<Set<string>>(new Set(getStoredOrDefault<string[]>('deleted_donor_ids', [])));
  const deletedRequestIdsRef = useRef<Set<string>>(new Set(getStoredOrDefault<string[]>('deleted_emergency_request_ids', [])));

  // 1. Blood Donors State
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() => {
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_donor_ids', []));
    const stored = getStoredOrDefault<BloodDonor[]>('bloodDonors', INITIAL_BLOOD_DONORS);
    const legacyMockIds = new Set(['donor-1', 'donor-2', 'donor-3', 'donor-4', 'donor-5', 'donor-6', 'donor-7', 'donor-8', 'donor-9', 'donor-10']);
    const donorMap = new Map<string, BloodDonor>();
    INITIAL_BLOOD_DONORS.forEach(d => {
      if (!deletedSet.has(d.id) && !legacyMockIds.has(d.id)) {
        donorMap.set(d.id, cleanBloodDonor(d));
      }
    });
    if (Array.isArray(stored)) {
      stored.forEach(d => {
        if (!deletedSet.has(d.id) && !legacyMockIds.has(d.id)) {
          donorMap.set(d.id, cleanBloodDonor(d));
        }
      });
    }
    return Array.from(donorMap.values());
  });

  // 2. Emergency Blood Requests State
  const [emergencyBloodRequests, setEmergencyBloodRequests] = useState<EmergencyBloodRequest[]>(() => {
    const deletedSet = new Set(getStoredOrDefault<string[]>('deleted_emergency_request_ids', []));
    const stored = getStoredOrDefault<EmergencyBloodRequest[]>('emergencyRequests', INITIAL_EMERGENCY_REQUESTS);
    const legacyMockReqIds = new Set(['req-1', 'req-2', 'req-3']);
    if (Array.isArray(stored)) {
      return stored
        .filter(r => !deletedSet.has(r.id) && !legacyMockReqIds.has(r.id))
        .map(r => cleanEmergencyRequest(r));
    }
    return [];
  });

  // 3. Blood Donation Settings State
  const [bloodDonationSettings, setBloodDonationSettings] = useState<BloodDonationSettings>(() => {
    const stored = getStoredOrDefault<any>('bloodDonationSettings', INITIAL_BLOOD_SETTINGS);
    const resolvedWingLogo = stored?.wingLogoUrl || INITIAL_BLOOD_SETTINGS.wingLogoUrl || '/brand/Infinitylifeline-logo.svg';
    return {
      ...INITIAL_BLOOD_SETTINGS,
      ...(stored || {}),
      wingLogoUrl: resolvedWingLogo,
      wingLogoSize: typeof stored?.wingLogoSize === 'number' ? stored.wingLogoSize : (INITIAL_BLOOD_SETTINGS.wingLogoSize || 480),
      wingLogoZoom: typeof stored?.wingLogoZoom === 'number' ? stored.wingLogoZoom : 1,
      wingLogoCrop: stored?.wingLogoCrop || 'contain',
      heroBadge: { ...INITIAL_BLOOD_SETTINGS.heroBadge, ...(stored?.heroBadge || {}) },
      heroTitle: { ...INITIAL_BLOOD_SETTINGS.heroTitle, ...(stored?.heroTitle || {}) },
      heroSubtitle: { ...INITIAL_BLOOD_SETTINGS.heroSubtitle, ...(stored?.heroSubtitle || {}) },
      heroCtaBadge: { ...INITIAL_BLOOD_SETTINGS.heroCtaBadge, ...(stored?.heroCtaBadge || {}) },
      heroCtaTitle: { ...INITIAL_BLOOD_SETTINGS.heroCtaTitle, ...(stored?.heroCtaTitle || {}) },
      heroCtaDescription: { ...INITIAL_BLOOD_SETTINGS.heroCtaDescription, ...(stored?.heroCtaDescription || {}) },
      heroCtaBtn1Text: { ...INITIAL_BLOOD_SETTINGS.heroCtaBtn1Text, ...(stored?.heroCtaBtn1Text || {}) },
      heroCtaBtn2Text: { ...INITIAL_BLOOD_SETTINGS.heroCtaBtn2Text, ...(stored?.heroCtaBtn2Text || {}) },
      statTotalDonorsLabel: { ...INITIAL_BLOOD_SETTINGS.statTotalDonorsLabel, ...(stored?.statTotalDonorsLabel || {}) },
      statActiveDonorsLabel: { ...INITIAL_BLOOD_SETTINGS.statActiveDonorsLabel, ...(stored?.statActiveDonorsLabel || {}) },
      statGroupsLabel: { ...INITIAL_BLOOD_SETTINGS.statGroupsLabel, ...(stored?.statGroupsLabel || {}) },
      statImpactLabel: { ...INITIAL_BLOOD_SETTINGS.statImpactLabel, ...(stored?.statImpactLabel || {}) },
      helplineLabel: { ...INITIAL_BLOOD_SETTINGS.helplineLabel, ...(stored?.helplineLabel || {}) },
      guidelinesTitle: { ...INITIAL_BLOOD_SETTINGS.guidelinesTitle, ...(stored?.guidelinesTitle || {}) },
      guidelinesText: { ...INITIAL_BLOOD_SETTINGS.guidelinesText, ...(stored?.guidelinesText || {}) },
      consentStatement: { ...INITIAL_BLOOD_SETTINGS.consentStatement, ...(stored?.consentStatement || {}) },
    };
  });

  // 4. Donor Categories State
  const [donorCategories, setDonorCategories] = useState<DonorCategoryOption[]>(() => {
    const stored = getStoredOrDefault<DonorCategoryOption[]>('donorCategories', DEFAULT_DONOR_CATEGORIES);
    if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_DONOR_CATEGORIES;
    return stored;
  });

  const calculateDonorStats = (history: BloodDonationHistoryEntry[] = [], currentFirst?: string, currentLast?: string, currentTotal: number = 0) => {
    if (!history || history.length === 0) {
      return {
        totalDonations: currentTotal,
        firstDonationDate: currentFirst,
        lastDonationDate: currentLast
      };
    }
    const sorted = [...history].sort((a, b) => new Date(a.donationDate).getTime() - new Date(b.donationDate).getTime());
    return {
      totalDonations: history.length,
      firstDonationDate: sorted[0].donationDate,
      lastDonationDate: sorted[sorted.length - 1].donationDate
    };
  };

  const addBloodDonor = useCallback((donor: Omit<BloodDonor, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const id = donor.id?.trim() || `donor-${Date.now()}`;
    if (deletedDonorIdsRef.current.has(id)) {
      deletedDonorIdsRef.current.delete(id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}deleted_donor_ids`, JSON.stringify(Array.from(deletedDonorIdsRef.current)));
      } catch {}
    }
    const stats = calculateDonorStats(donor.donationHistory || [], donor.firstDonationDate, donor.lastDonationDate, donor.totalDonations || 0);
    const newDonor: BloodDonor = cleanBloodDonor({
      ...donor,
      id,
      fullName: donor.fullName.trim(),
      bloodGroup: donor.bloodGroup,
      phone: donor.phone.trim(),
      email: donor.email?.trim() || undefined,
      photoUrl: donor.photoUrl ? getFreshImageUrl(donor.photoUrl) : undefined,
      district: donor.district,
      upazila: donor.upazila,
      area: donor.area.trim(),
      detailedAddress: donor.detailedAddress?.trim() || undefined,
      orgCategory: donor.orgCategory,
      committeePosition: donor.committeePosition?.trim() || undefined,
      availabilityStatus: donor.availabilityStatus || 'AVAILABLE_EMERGENCY',
      totalDonations: stats.totalDonations,
      firstDonationDate: stats.firstDonationDate,
      lastDonationDate: stats.lastDonationDate,
      isVerified: donor.isVerified ?? false,
      approvalStatus: donor.approvalStatus || 'APPROVED',
      privacyConsent: donor.privacyConsent ?? true,
      showPhonePublicly: donor.gender === 'Male' ? true : (donor.showPhonePublicly ?? false),
      donationHistory: (donor.donationHistory || []).map(h => ({ ...h, donorId: id })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setBloodDonors(prev => {
      const updated = [newDonor, ...prev.filter(d => d.id !== id)];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbUpsert('blood_donors', {
      id: newDonor.id,
      full_name: newDonor.fullName,
      blood_group: newDonor.bloodGroup,
      gender: newDonor.gender || null,
      date_of_birth: newDonor.dateOfBirth || newDonor.dob || null,
      phone: newDonor.phone,
      email: newDonor.email || null,
      photo_url: newDonor.photoUrl || null,
      district: newDonor.district,
      upazila: newDonor.upazila,
      area: newDonor.area,
      detailed_address: newDonor.detailedAddress || null,
      org_category: newDonor.orgCategory,
      committee_position: newDonor.committeePosition || null,
      availability_status: newDonor.availabilityStatus,
      first_donation_date: newDonor.firstDonationDate || null,
      last_donation_date: newDonor.lastDonationDate || null,
      total_donations: newDonor.totalDonations,
      experience_notes: newDonor.experienceNotes || null,
      is_verified: newDonor.isVerified,
      approval_status: newDonor.approvalStatus,
      privacy_consent: newDonor.privacyConsent,
      show_phone_publicly: newDonor.showPhonePublicly,
      created_at: newDonor.createdAt,
      updated_at: newDonor.updatedAt
    });

    onAuditLog('CREATE', 'BloodDonor', id, `Registered blood donor: ${donor.fullName} (${donor.bloodGroup})`);
    return newDonor;
  }, [onAuditLog]);

  const updateBloodDonor = useCallback((id: string, updates: Partial<BloodDonor>) => {
    setBloodDonors(prev => {
      const newId = updates.id?.trim() || id;
      const updated = prev.map(d => {
        if (d.id !== id) return d;
        const mergedHistory = updates.donationHistory !== undefined ? updates.donationHistory : (d.donationHistory || []);
        const stats = calculateDonorStats(
          mergedHistory,
          updates.firstDonationDate ?? d.firstDonationDate,
          updates.lastDonationDate ?? d.lastDonationDate,
          updates.totalDonations ?? d.totalDonations
        );

        return cleanBloodDonor({
          ...d,
          ...updates,
          id: newId,
          photoUrl: updates.photoUrl !== undefined ? (updates.photoUrl ? getFreshImageUrl(updates.photoUrl) : undefined) : d.photoUrl,
          totalDonations: stats.totalDonations,
          firstDonationDate: stats.firstDonationDate,
          lastDonationDate: stats.lastDonationDate,
          donationHistory: mergedHistory.map(h => ({ ...h, donorId: newId })),
          updatedAt: new Date().toISOString()
        });
      });

      const match = updated.find(d => d.id === newId);
      if (match) {
        if (newId !== id) {
          safeDbDelete('blood_donors', 'id', id);
        }
        safeDbUpsert('blood_donors', {
          id: match.id,
          full_name: match.fullName,
          blood_group: match.bloodGroup,
          gender: match.gender || null,
          date_of_birth: match.dateOfBirth || match.dob || null,
          phone: match.phone,
          email: match.email || null,
          photo_url: match.photoUrl || null,
          district: match.district,
          upazila: match.upazila,
          area: match.area,
          detailed_address: match.detailedAddress || null,
          org_category: match.orgCategory,
          committee_position: match.committeePosition || null,
          availability_status: match.availabilityStatus,
          first_donation_date: match.firstDonationDate || null,
          last_donation_date: match.lastDonationDate || null,
          total_donations: match.totalDonations,
          experience_notes: match.experienceNotes || null,
          is_verified: match.isVerified,
          approval_status: match.approvalStatus,
          privacy_consent: match.privacyConsent,
          show_phone_publicly: match.showPhonePublicly,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    onAuditLog('UPDATE', 'BloodDonor', id, `Updated blood donor: ${updates.fullName || id}`);
  }, [onAuditLog]);

  const deleteBloodDonor = useCallback((id: string) => {
    const cleanId = id?.trim();
    if (!cleanId) return;
    deletedDonorIdsRef.current.add(cleanId);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_donor_ids`, JSON.stringify(Array.from(deletedDonorIdsRef.current)));
    } catch {}

    setBloodDonors(prev => {
      const filtered = prev.filter(d => d.id !== cleanId && d.id.trim() !== cleanId);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    onAuditLog('DELETE', 'BloodDonor', cleanId, 'Deleted blood donor');
    if (supabase && isSupabaseConfigured) {
      Promise.resolve(supabase.from('blood_donation_history').delete().eq('donor_id', cleanId))
        .then(() => (supabase ? Promise.resolve(supabase.from('blood_donors').delete().eq('id', cleanId)) : undefined))
        .catch(err => console.warn('Supabase donor delete error (handled):', err));
    }
  }, [onAuditLog]);

  const approveBloodDonor = useCallback((id: string) => {
    updateBloodDonor(id, { approvalStatus: 'APPROVED' });
    onAuditLog('APPROVE', 'BloodDonor', id, 'Approved blood donor application');
  }, [updateBloodDonor, onAuditLog]);

  const rejectBloodDonor = useCallback((id: string) => {
    updateBloodDonor(id, { approvalStatus: 'REJECTED' });
    onAuditLog('REJECT', 'BloodDonor', id, 'Rejected blood donor application');
  }, [updateBloodDonor, onAuditLog]);

  const verifyBloodDonor = useCallback((id: string, isVerified: boolean = true) => {
    updateBloodDonor(id, { isVerified });
    onAuditLog('VERIFY', 'BloodDonor', id, `Updated verification status to: ${isVerified}`);
  }, [updateBloodDonor, onAuditLog]);

  const addDonationHistoryEntry = useCallback((donorId: string, entry: Omit<BloodDonationHistoryEntry, 'id' | 'donorId' | 'createdAt'>) => {
    const histId = `hist-${Date.now()}`;
    const newEntry: BloodDonationHistoryEntry = {
      ...entry,
      id: histId,
      donorId,
      createdAt: new Date().toISOString()
    };

    setBloodDonors(prev => {
      const updated = prev.map(d => {
        if (d.id !== donorId) return d;
        const currentHist = d.donationHistory || [];
        const nextHist = [newEntry, ...currentHist];
        const stats = calculateDonorStats(nextHist, d.firstDonationDate, d.lastDonationDate, d.totalDonations);
        return {
          ...d,
          totalDonations: stats.totalDonations,
          firstDonationDate: stats.firstDonationDate,
          lastDonationDate: stats.lastDonationDate,
          donationHistory: nextHist,
          updatedAt: new Date().toISOString()
        };
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbUpsert('blood_donation_history', {
      id: newEntry.id,
      donor_id: donorId,
      donation_date: newEntry.donationDate,
      hospital: newEntry.hospital,
      district: newEntry.district,
      donation_type: newEntry.donationType,
      recipient_reference: newEntry.recipientReference || null,
      notes: newEntry.notes || null,
      is_verified: newEntry.isVerified,
      created_at: newEntry.createdAt || new Date().toISOString()
    });

    onAuditLog('CREATE', 'BloodDonationHistory', histId, `Added donation history for donor ${donorId}`);
    return newEntry;
  }, [onAuditLog]);

  const deleteDonationHistoryEntry = useCallback((donorId: string, entryId: string) => {
    setBloodDonors(prev => {
      const updated = prev.map(d => {
        if (d.id !== donorId) return d;
        const currentHist = d.donationHistory || [];
        const nextHist = currentHist.filter(h => h.id !== entryId);
        const stats = calculateDonorStats(nextHist, d.firstDonationDate, d.lastDonationDate, Math.max(0, d.totalDonations - 1));
        return {
          ...d,
          totalDonations: stats.totalDonations,
          firstDonationDate: stats.firstDonationDate,
          lastDonationDate: stats.lastDonationDate,
          donationHistory: nextHist,
          updatedAt: new Date().toISOString()
        };
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbDelete('blood_donation_history', 'id', entryId);
    onAuditLog('DELETE', 'BloodDonationHistory', entryId, `Deleted donation history record`);
  }, [onAuditLog]);

  const addEmergencyBloodRequest = useCallback((req: Omit<EmergencyBloodRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const id = `req-${Date.now()}`;
    const newReq: EmergencyBloodRequest = cleanEmergencyRequest({
      ...req,
      id,
      requesterName: req.requesterName.trim(),
      contactNumber: req.contactNumber.trim(),
      patientName: req.patientName.trim(),
      hospitalName: req.hospitalName.trim(),
      district: req.district,
      upazila: req.upazila,
      additionalNotes: req.additionalNotes?.trim() || undefined,
      status: 'PENDING',
      matchedDonorIds: req.matchedDonorIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setEmergencyBloodRequests(prev => {
      const updated = [newReq, ...prev];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    safeDbUpsert('emergency_blood_requests', {
      id: newReq.id,
      requester_name: newReq.requesterName,
      contact_number: newReq.contactNumber,
      patient_name: newReq.patientName,
      blood_group: newReq.bloodGroup,
      units_needed: newReq.unitsNeeded,
      hospital_name: newReq.hospitalName,
      district: newReq.district,
      upazila: newReq.upazila,
      emergency_level: newReq.emergencyLevel,
      required_date: newReq.requiredDate,
      additional_notes: newReq.additionalNotes || null,
      status: newReq.status,
      matched_donor_ids: newReq.matchedDonorIds,
      created_at: newReq.createdAt,
      updated_at: newReq.updatedAt
    });

    onAuditLog('CREATE', 'EmergencyBloodRequest', id, `Created emergency request for ${newReq.patientName} (${newReq.bloodGroup})`);
    return newReq;
  }, [onAuditLog]);

  const updateEmergencyBloodRequestStatus = useCallback((id: string, status: EmergencyRequestStatus) => {
    setEmergencyBloodRequests(prev => {
      const updated = prev.map(r => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          updatedAt: new Date().toISOString()
        };
      });

      const match = updated.find(r => r.id === id);
      if (match) {
        safeDbUpsert('emergency_blood_requests', {
          id: match.id,
          requester_name: match.requesterName,
          contact_number: match.contactNumber,
          patient_name: match.patientName,
          blood_group: match.bloodGroup,
          units_needed: match.unitsNeeded,
          hospital_name: match.hospitalName,
          district: match.district,
          upazila: match.upazila,
          emergency_level: match.emergencyLevel,
          required_date: match.requiredDate,
          additional_notes: match.additionalNotes || null,
          status: match.status,
          matched_donor_ids: match.matchedDonorIds,
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    onAuditLog('UPDATE', 'EmergencyBloodRequest', id, `Updated emergency request status to: ${status}`);
  }, [onAuditLog]);

  const deleteEmergencyBloodRequest = useCallback((id: string) => {
    deletedRequestIdsRef.current.add(id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}deleted_emergency_request_ids`, JSON.stringify(Array.from(deletedRequestIdsRef.current)));
    } catch (e) {
      console.warn('Storage error on deleted_emergency_request_ids:', e);
    }

    setEmergencyBloodRequests(prev => {
      const filtered = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}emergencyRequests`, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    safeDbDelete('emergency_blood_requests', 'id', id);
    onAuditLog('DELETE', 'EmergencyBloodRequest', id, 'Deleted emergency blood request');
  }, [onAuditLog]);

  const updateBloodDonationSettings = useCallback((newSettings: Partial<BloodDonationSettings>) => {
    setBloodDonationSettings(prev => {
      const updated = { ...prev, ...newSettings };
      safeDbUpsert('blood_donation_settings', {
        id: 'default_blood_settings',
        wing_logo_url: updated.wingLogoUrl,
        wing_logo_size: updated.wingLogoSize,
        wing_logo_zoom: updated.wingLogoZoom,
        wing_logo_crop: updated.wingLogoCrop,
        hero_badge: updated.heroBadge,
        hero_title: updated.heroTitle,
        hero_subtitle: updated.heroSubtitle,
        hero_cta_badge: updated.heroCtaBadge,
        hero_cta_title: updated.heroCtaTitle,
        hero_cta_description: updated.heroCtaDescription,
        hero_cta_btn1_text: updated.heroCtaBtn1Text,
        hero_cta_btn2_text: updated.heroCtaBtn2Text,
        stat_total_donors_label: updated.statTotalDonorsLabel,
        stat_active_donors_label: updated.statActiveDonorsLabel,
        stat_groups_label: updated.statGroupsLabel,
        stat_groups_value: updated.statGroupsValue,
        stat_impact_label: updated.statImpactLabel,
        stat_total_donors_override: updated.statTotalDonorsOverride,
        stat_active_donors_override: updated.statActiveDonorsOverride,
        stat_impact_override: updated.statImpactOverride,
        emergency_helpline: updated.emergencyHelpline,
        helpline_label: updated.helplineLabel,
        coordination_email: updated.coordinationEmail,
        guidelines_title: updated.guidelinesTitle,
        guidelines_text: updated.guidelinesText,
        consent_statement: updated.consentStatement,
        enable_public_direct_contact: updated.enablePublicDirectContact,
        updated_at: new Date().toISOString()
      });
      try {
        localStorage.setItem(`${STORAGE_PREFIX}bloodDonationSettings`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    onAuditLog('UPDATE', 'BloodDonationSettings', 'default_blood_settings', 'Updated blood donation settings');
  }, [onAuditLog]);

  const addDonorCategory = useCallback((cat: Omit<DonorCategoryOption, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: DonorCategoryOption = { ...cat, id };
    setDonorCategories(prev => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    onAuditLog('CREATE', 'DonorCategory', id, `Added donor category: ${cat.name.en}`);
    return newCat;
  }, [onAuditLog]);

  const updateDonorCategory = useCallback((id: string, updates: Partial<DonorCategoryOption>) => {
    setDonorCategories(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    onAuditLog('UPDATE', 'DonorCategory', id, `Updated donor category`);
  }, [onAuditLog]);

  const deleteDonorCategory = useCallback((id: string) => {
    setDonorCategories(prev => {
      const filtered = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}donorCategories`, JSON.stringify(filtered));
      } catch {}
      return filtered;
    });
    onAuditLog('DELETE', 'DonorCategory', id, `Deleted donor category`);
  }, [onAuditLog]);

  return {
    bloodDonors,
    setBloodDonors,
    emergencyBloodRequests,
    setEmergencyBloodRequests,
    bloodDonationSettings,
    setBloodDonationSettings,
    donorCategories,
    setDonorCategories,
    addBloodDonor,
    updateBloodDonor,
    deleteBloodDonor,
    approveBloodDonor,
    rejectBloodDonor,
    verifyBloodDonor,
    addDonationHistoryEntry,
    deleteDonationHistoryEntry,
    addEmergencyBloodRequest,
    updateEmergencyBloodRequestStatus,
    deleteEmergencyBloodRequest,
    updateBloodDonationSettings,
    addDonorCategory,
    updateDonorCategory,
    deleteDonorCategory
  };
}

