import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Committee,
  Person,
  Position,
  CommitteeMember,
  AdminProfile
} from '../../types';
import {
  INITIAL_COMMITTEES,
  INITIAL_PERSONS,
  INITIAL_POSITIONS,
  INITIAL_COMMITTEE_MEMBERS,
  INITIAL_ADMIN_PROFILES
} from '../../data/initialData';
import { getFreshImageUrl } from '../../lib/cloudinary';
import { STORAGE_PREFIX, getStoredOrDefault, saveToStorage } from '../dataStorage';
import { resolveMediaFieldUpdate, isValidPermanentUrl } from '../../lib/utils/mediaSanitizer';
import { safeDbUpsert, safeDbDelete } from '../dbAdapter';

export function useGovernanceSlice(logAudit: (action: string, entity: string, entityId: string, details: string) => void) {
  // 1. Committees State
  const [committees, setCommittees] = useState<Committee[]>(() => {
    const stored = getStoredOrDefault<Committee[]>('committees', INITIAL_COMMITTEES);
    return stored.filter(c => {
      if (c.type === 'STANDING' && c.id !== 'comm-stand-central') return false;
      return true;
    });
  });

  // 2. Persons State
  const [persons, setPersons] = useState<Person[]>(() =>
    getStoredOrDefault('persons', INITIAL_PERSONS)
  );

  // 3. Positions State
  const [positions, setPositions] = useState<Position[]>(() =>
    getStoredOrDefault('positions', INITIAL_POSITIONS)
  );

  // 4. Committee Members State
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => {
    const stored = getStoredOrDefault<CommitteeMember[]>('committeeMembers', INITIAL_COMMITTEE_MEMBERS);
    const validCommitteeIds = new Set(['comm-exec-2026', 'comm-stand-central', 'comm-exec-2025', 'comm-exec-2024', 'comm-exec-2023']);
    return stored.filter(cm => validCommitteeIds.has(cm.committeeId));
  });

  // 5. Admin Profiles State
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>(() =>
    getStoredOrDefault('adminProfiles', INITIAL_ADMIN_PROFILES)
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

  useEffect(() => { persistEntity('committees', committees); }, [committees, persistEntity]);
  useEffect(() => { persistEntity('persons', persons); }, [persons, persistEntity]);
  useEffect(() => { persistEntity('positions', positions); }, [positions, persistEntity]);
  useEffect(() => { persistEntity('committeeMembers', committeeMembers); }, [committeeMembers, persistEntity]);
  useEffect(() => { persistEntity('adminProfiles', adminProfiles); }, [adminProfiles, persistEntity]);

  // ----------------------------------------------------
  // COMMITTEES ACTIONS
  // ----------------------------------------------------
  const addCommittee = useCallback((committee: Omit<Committee, 'id'>): Committee => {
    const id = `com-${Date.now()}`;
    const newCom: Committee = {
      ...committee,
      id,
      bannerImageUrl: committee.bannerImageUrl ? getFreshImageUrl(committee.bannerImageUrl) : ''
    };
    setCommittees(prev => [...prev, newCom]);
    logAudit('CREATE', 'Committee', id, `Created committee: ${committee.name.en}`);

    safeDbUpsert('committees', {
      id: newCom.id,
      slug: newCom.slug,
      name: newCom.name,
      type: newCom.type,
      year: newCom.year,
      description: newCom.description,
      status: newCom.status,
      sort_order: newCom.sortOrder,
      is_featured: newCom.isFeatured,
      banner_image_url: newCom.bannerImageUrl || '',
      updated_at: new Date().toISOString()
    });

    return newCom;
  }, [logAudit]);

  const updateCommittee = useCallback((id: string, committee: Partial<Committee>) => {
    setCommittees(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...committee,
          bannerImageUrl: committee.bannerImageUrl ? getFreshImageUrl(committee.bannerImageUrl) : c.bannerImageUrl
        };
      });
      const match = updated.find(c => c.id === id);
      if (match) {
        safeDbUpsert('committees', {
          id: match.id,
          slug: match.slug,
          name: match.name,
          type: match.type,
          year: match.year,
          description: match.description,
          status: match.status,
          sort_order: match.sortOrder,
          is_featured: match.isFeatured,
          banner_image_url: match.bannerImageUrl || '',
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Committee', id, 'Updated committee information');
  }, [logAudit]);

  const deleteCommittee = useCallback((id: string) => {
    setCommittees(prev => prev.filter(c => c.id !== id));
    setCommitteeMembers(prev => prev.filter(m => m.committeeId !== id));
    logAudit('DELETE', 'Committee', id, 'Deleted committee and linked member mappings');
    safeDbDelete('committees', 'id', id);
  }, [logAudit]);

  const archiveCommittee = useCallback((id: string) => {
    setCommittees(prev => prev.map(c => c.id === id ? { ...c, status: 'ARCHIVED' } : c));
    logAudit('UPDATE', 'Committee', id, 'Archived committee');
  }, [logAudit]);

  const setActiveCommittee = useCallback((id: string) => {
    setCommittees(prev => prev.map(c => ({
      ...c,
      status: c.id === id ? 'ACTIVE' : (c.status === 'ACTIVE' ? 'ARCHIVED' : c.status)
    })));
    logAudit('UPDATE', 'Committee', id, 'Set as current active executive committee');
  }, [logAudit]);

  // ----------------------------------------------------
  // PERSONS ACTIONS
  // ----------------------------------------------------
  const addPerson = useCallback((person: Omit<Person, 'id'>): Person => {
    const id = `per-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPerson: Person = {
      ...person,
      id,
      photoUrl: resolveMediaFieldUpdate('', person.photoUrl, false) || ''
    };
    setPersons(prev => [...prev, newPerson]);
    logAudit('CREATE', 'Person', id, `Added person: ${person.englishName}`);

    safeDbUpsert('persons', {
      id: newPerson.id,
      full_name: newPerson.fullName,
      bangla_name: newPerson.banglaName,
      english_name: newPerson.englishName,
      photo_url: newPerson.photoUrl || '',
      photo_position: newPerson.photoPosition || 'center top',
      photo_zoom: newPerson.photoZoom || 1.0,
      short_bio: newPerson.shortBio,
      full_bio: newPerson.fullBio,
      district: newPerson.district || '',
      facebook_url: newPerson.facebookUrl || '',
      linkedin_url: newPerson.linkedinUrl || '',
      email: newPerson.email || '',
      phone: newPerson.phone || '',
      social_links: newPerson.socialLinks,
      joining_year: newPerson.joiningYear || '',
      active: newPerson.active,
      updated_at: new Date().toISOString()
    });

    return newPerson;
  }, [logAudit]);

  const updatePerson = useCallback((id: string, person: Partial<Person>) => {
    setPersons(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...person,
          photoUrl: person.photoUrl !== undefined ? (resolveMediaFieldUpdate(p.photoUrl, person.photoUrl, false) || '') : p.photoUrl
        };
      });
      const match = updated.find(p => p.id === id);
      if (match) {
        safeDbUpsert('persons', {
          id: match.id,
          full_name: match.fullName,
          bangla_name: match.banglaName,
          english_name: match.englishName,
          photo_url: match.photoUrl || '',
          photo_position: match.photoPosition || 'center top',
          photo_zoom: match.photoZoom || 1.0,
          short_bio: match.shortBio,
          full_bio: match.fullBio,
          district: match.district || '',
          facebook_url: match.facebookUrl || '',
          linkedin_url: match.linkedinUrl || '',
          email: match.email || '',
          phone: match.phone || '',
          social_links: match.socialLinks,
          joining_year: match.joiningYear || '',
          active: match.active,
          updated_at: new Date().toISOString()
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'Person', id, 'Updated person profile/photo');
  }, [logAudit]);

  const deletePerson = useCallback((id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    setCommitteeMembers(prev => prev.filter(m => m.personId !== id));
    logAudit('DELETE', 'Person', id, 'Deleted person profile');
    safeDbDelete('persons', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // POSITIONS ACTIONS
  // ----------------------------------------------------
  const addPosition = useCallback((pos: Omit<Position, 'id'>): Position => {
    const id = `pos-${Date.now()}`;
    const newPos: Position = { ...pos, id };
    setPositions(prev => [...prev, newPos]);
    logAudit('CREATE', 'Position', id, `Added position: ${pos.name.en}`);
    safeDbUpsert('positions', newPos);
    return newPos;
  }, [logAudit]);

  const updatePosition = useCallback((id: string, pos: Partial<Position>) => {
    setPositions(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...pos } : p);
      const match = updated.find(p => p.id === id);
      if (match) safeDbUpsert('positions', match);
      return updated;
    });
    logAudit('UPDATE', 'Position', id, 'Updated position');
  }, [logAudit]);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Position', id, 'Deleted position');
    safeDbDelete('positions', 'id', id);
  }, [logAudit]);

  // ----------------------------------------------------
  // COMMITTEE MEMBERS ACTIONS
  // ----------------------------------------------------
  const addCommitteeMember = useCallback((member: Omit<CommitteeMember, 'id'>): CommitteeMember => {
    const id = `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMem: CommitteeMember = { ...member, id };
    setCommitteeMembers(prev => [...prev, newMem]);
    logAudit('CREATE', 'CommitteeMember', id, `Added member to committee ${member.committeeId}`);

    safeDbUpsert('committee_members', {
      id: newMem.id,
      committee_id: newMem.committeeId,
      person_id: newMem.personId,
      position_id: newMem.positionId,
      serial_number: newMem.serialNumber,
      sort_order: newMem.sortOrder,
      is_featured_leader: newMem.isFeaturedLeader,
      start_date: newMem.startDate || '',
      end_date: newMem.endDate || '',
      status: newMem.status
    });

    return newMem;
  }, [logAudit]);

  const updateCommitteeMember = useCallback((id: string, member: Partial<CommitteeMember>) => {
    setCommitteeMembers(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...member } : m);
      const match = updated.find(m => m.id === id);
      if (match) {
        safeDbUpsert('committee_members', {
          id: match.id,
          committee_id: match.committeeId,
          person_id: match.personId,
          position_id: match.positionId,
          serial_number: match.serialNumber,
          sort_order: match.sortOrder,
          is_featured_leader: match.isFeaturedLeader,
          start_date: match.startDate || '',
          end_date: match.endDate || '',
          status: match.status
        });
      }
      return updated;
    });
    logAudit('UPDATE', 'CommitteeMember', id, 'Updated committee member assignment');
  }, [logAudit]);

  const deleteCommitteeMember = useCallback((id: string) => {
    setCommitteeMembers(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', 'CommitteeMember', id, 'Removed member from committee');
    safeDbDelete('committee_members', 'id', id);
  }, [logAudit]);

  const reorderCommitteeMembers = useCallback((committeeId: string, orderedMemberIds: string[]) => {
    setCommitteeMembers(prev => {
      return prev.map(m => {
        if (m.committeeId === committeeId) {
          const index = orderedMemberIds.indexOf(m.id);
          if (index !== -1) {
            const newOrder = index + 1;
            safeDbUpsert('committee_members', {
              id: m.id,
              committee_id: m.committeeId,
              person_id: m.personId,
              position_id: m.positionId,
              serial_number: newOrder,
              sort_order: newOrder,
              is_featured_leader: m.isFeaturedLeader,
              status: m.status
            });
            return {
              ...m,
              serialNumber: newOrder,
              sortOrder: newOrder
            };
          }
        }
        return m;
      });
    });
    logAudit('UPDATE', 'CommitteeMembers', committeeId, 'Reordered committee members lineup');
  }, [logAudit]);

  const getMembersWithDetails = useCallback((committeeId?: string) => {
    const filtered = committeeId
      ? committeeMembers.filter(m => m.committeeId === committeeId)
      : committeeMembers;

    const personsMap = new Map<string, Person>();
    for (let i = 0; i < persons.length; i++) {
      personsMap.set(persons[i].id, persons[i]);
    }
    const positionsMap = new Map<string, Position>();
    for (let i = 0; i < positions.length; i++) {
      positionsMap.set(positions[i].id, positions[i]);
    }
    const committeesMap = new Map<string, Committee>();
    for (let i = 0; i < committees.length; i++) {
      committeesMap.set(committees[i].id, committees[i]);
    }

    const fallbackPerson: Person = {
      id: '',
      fullName: 'Unknown Member',
      banglaName: 'সদস্য',
      englishName: 'Unknown Member',
      active: true
    };
    const fallbackPosition: Position = {
      id: '',
      name: { en: 'Executive Member', bn: 'কার্যনির্বাহী সদস্য' },
      level: 5,
      sortOrder: 20
    };

    return filtered
      .map(m => ({
        ...m,
        person: personsMap.get(m.personId) || { ...fallbackPerson, id: m.personId },
        position: positionsMap.get(m.positionId) || { ...fallbackPosition, id: m.positionId },
        committee: committeesMap.get(m.committeeId)
      }))
      .sort((a, b) => (a.sortOrder || a.serialNumber || 0) - (b.sortOrder || b.serialNumber || 0));
  }, [committeeMembers, persons, positions, committees]);

  // ----------------------------------------------------
  // ADMIN PROFILES ACTIONS
  // ----------------------------------------------------
  const addAdminProfile = useCallback((profile: Omit<AdminProfile, 'id'>): AdminProfile => {
    const id = `adm-${Date.now()}`;
    const newProf: AdminProfile = {
      ...profile,
      id,
      avatarUrl: profile.avatarUrl ? getFreshImageUrl(profile.avatarUrl) : ''
    };
    setAdminProfiles(prev => [...prev, newProf]);
    logAudit('CREATE', 'AdminProfile', id, `Added admin profile: ${profile.fullName}`);
    return newProf;
  }, [logAudit]);

  const updateAdminProfile = useCallback((id: string, profile: Partial<AdminProfile>) => {
    setAdminProfiles(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        ...profile,
        avatarUrl: profile.avatarUrl ? getFreshImageUrl(profile.avatarUrl) : p.avatarUrl
      };
    }));
    logAudit('UPDATE', 'AdminProfile', id, 'Updated admin profile');
  }, [logAudit]);

  const deleteAdminProfile = useCallback((id: string) => {
    setAdminProfiles(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'AdminProfile', id, 'Deleted admin profile');
  }, [logAudit]);

  return {
    committees,
    setCommittees,
    persons,
    setPersons,
    positions,
    setPositions,
    committeeMembers,
    setCommitteeMembers,
    adminProfiles,
    setAdminProfiles,
    addCommittee,
    updateCommittee,
    deleteCommittee,
    archiveCommittee,
    setActiveCommittee,
    addPerson,
    updatePerson,
    deletePerson,
    addPosition,
    updatePosition,
    deletePosition,
    addCommitteeMember,
    updateCommitteeMember,
    deleteCommitteeMember,
    reorderCommitteeMembers,
    getMembersWithDetails,
    addAdminProfile,
    updateAdminProfile,
    deleteAdminProfile
  };
}

