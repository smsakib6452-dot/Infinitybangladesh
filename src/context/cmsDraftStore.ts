/**
 * CMS Draft Store & Remote Version Registry
 * Manages local draft queue (localStorage: infinity_cms_drafts_v1),
 * remote database version registry (localStorage: infinity_cms_remote_versions_v1),
 * and sync overlay mechanics for Phase 1 CMS tables.
 */

import {
  CmsAllowedTable,
  CMS_TABLE_ALLOWLISTS,
  CMS_FORBIDDEN_TABLES,
  ADMIN_CMS_MUTATION_GATES,
  scanPayloadSecrets
} from './dbAdapter';

export type CmsAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface CmsDraftItem<T = Record<string, any>> {
  draftId: string;             // Unique key: `${table}:${id}`
  table: CmsAllowedTable;
  id: string;
  action: CmsAction;
  summary: string;
  originalUpdatedAt: string | null;
  changedFields: string[];
  payload: Partial<T>;
  localTimestamp: string;
}

export const CMS_DRAFTS_STORAGE_KEY = 'infinity_cms_drafts_v1';
export const CMS_REMOTE_VERSIONS_STORAGE_KEY = 'infinity_cms_remote_versions_v1';

/**
 * 1. Remote Database Versions Registry
 * Tracks latest known updated_at for database items.
 * Persisted in localStorage so expectedUpdatedAt is preserved across reloads.
 */
export function getCmsRemoteVersions(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(CMS_REMOTE_VERSIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCmsRemoteVersionsBatch(
  entries: Array<{ table: CmsAllowedTable; id: string; updatedAt?: string | null }>
): void {
  if (typeof window === 'undefined' || !window.localStorage || !entries.length) return;
  try {
    const versions = getCmsRemoteVersions();
    let changed = false;
    for (const entry of entries) {
      if (entry.id && entry.updatedAt) {
        const key = `${entry.table}:${entry.id}`;
        if (versions[key] !== entry.updatedAt) {
          versions[key] = entry.updatedAt;
          changed = true;
        }
      }
    }
    if (changed) {
      localStorage.setItem(CMS_REMOTE_VERSIONS_STORAGE_KEY, JSON.stringify(versions));
    }
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn('[cmsDraftStore] Failed to save remote versions batch:', err);
    }
  }
}

/**
 * 2. Draft Queue Reader
 */
export function getCmsDrafts(): CmsDraftItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(CMS_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Writes drafts array to localStorage with QuotaExceededError protection
 */
function setCmsDraftsStorage(drafts: CmsDraftItem[]): { success: boolean; error?: string } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, error: 'Storage unavailable' };
  }
  try {
    localStorage.setItem(CMS_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('infinity_cms_drafts_changed', { detail: drafts }));
    }
    return { success: true };
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      return {
        success: false,
        error: 'স্থানীয় মেমোরি পূর্ণ হয়ে গেছে (Storage Quota Exceeded)। কিছু খসড়া প্রকাশ করুন বা বাতিল করুন।'
      };
    }
    return {
      success: false,
      error: err?.message || 'Failed to save drafts to local storage.'
    };
  }
}

/**
 * 3. Sanitizes payload against CMS_TABLE_ALLOWLISTS and strips secret keys
 */
export function sanitizeDraftPayload(
  table: CmsAllowedTable,
  action: CmsAction,
  rawPayload: Record<string, any>
): { safe: boolean; sanitized?: Record<string, any>; error?: string } {
  // Secret scan
  const secretScan = scanPayloadSecrets(rawPayload);
  if (!secretScan.safe) {
    return { safe: false, error: secretScan.error || 'Unauthorized secrets detected in payload.' };
  }

  const allowlist = CMS_TABLE_ALLOWLISTS[table];
  if (!allowlist) {
    return { safe: false, error: `Table '${table}' not configured in allowlists.` };
  }

  const sanitized: Record<string, any> = {};
  for (const col of allowlist) {
    // On UPDATE, never include id or created_at in payload
    if (action === 'UPDATE' && (col === 'id' || col === 'created_at')) continue;

    if (col in rawPayload && rawPayload[col] !== undefined) {
      sanitized[col] = rawPayload[col];
    }
  }

  return { safe: true, sanitized };
}

/**
 * 4. Record CMS Draft
 * Idempotently records or updates drafts for P1 tables.
 * Merges subsequent edits into a single draft and maintains originalUpdatedAt.
 */
export function recordCmsDraft(
  table: CmsAllowedTable,
  id: string,
  intendedAction: CmsAction,
  payload: Record<string, any>,
  summary?: string
): { success: boolean; draft?: CmsDraftItem; error?: string } {
  // Gate check
  if (CMS_FORBIDDEN_TABLES.has(table)) {
    return { success: false, error: `Table '${table}' is strictly forbidden from CMS mutations.` };
  }
  if ((ADMIN_CMS_MUTATION_GATES as Record<string, string>)[table] !== 'ACTIVE') {
    return { success: false, error: `CMS mutation gate for table '${table}' is locked.` };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { success: false, error: 'Invalid or missing record identifier.' };
  }

  // Single-row table constraint: site_settings and homepage_config are always UPDATE on 'default'
  const isSingleRow = table === 'site_settings' || table === 'homepage_config';
  const effectiveId = isSingleRow ? 'default' : cleanId;

  const remoteVersions = getCmsRemoteVersions();
  const remoteVersionKey = `${table}:${effectiveId}`;
  const remoteVersionExists = remoteVersionKey in remoteVersions;

  const currentDrafts = getCmsDrafts();
  const draftId = `${table}:${effectiveId}`;
  const existingDraftIndex = currentDrafts.findIndex(d => d.draftId === draftId);
  const existingDraft = existingDraftIndex >= 0 ? currentDrafts[existingDraftIndex] : null;

  // Determine effective action (CREATE vs UPDATE vs DELETE)
  let effectiveAction: CmsAction = intendedAction;
  if (isSingleRow) {
    effectiveAction = 'UPDATE';
  } else if (intendedAction === 'DELETE') {
    // If existing draft was CREATE (never in DB) -> delete cancels creation completely
    if (existingDraft && existingDraft.action === 'CREATE') {
      const updatedDrafts = currentDrafts.filter(d => d.draftId !== draftId);
      setCmsDraftsStorage(updatedDrafts);
      return { success: true };
    }
    // If not in DB and no draft -> local only, nothing to delete in DB
    if (!remoteVersionExists && !existingDraft) {
      return { success: true };
    }
    effectiveAction = 'DELETE';
  } else if (intendedAction === 'CREATE') {
    effectiveAction = 'CREATE';
  } else {
    // UPDATE
    if (existingDraft && existingDraft.action === 'CREATE') {
      effectiveAction = 'CREATE';
    } else if (remoteVersionExists) {
      effectiveAction = 'UPDATE';
    } else {
      // Not in DB and no prior draft -> item was created locally
      effectiveAction = existingDraft ? existingDraft.action : 'CREATE';
    }
  }

  // If action is DELETE
  if (effectiveAction === 'DELETE') {
    const originalUpdatedAt = existingDraft?.originalUpdatedAt ?? remoteVersions[remoteVersionKey] ?? null;
    const deleteDraft: CmsDraftItem = {
      draftId,
      table,
      id: effectiveId,
      action: 'DELETE',
      summary: summary || existingDraft?.summary || `${table} item`,
      originalUpdatedAt,
      changedFields: ['status'],
      payload: { id: effectiveId },
      localTimestamp: new Date().toISOString()
    };

    const nextDrafts = existingDraftIndex >= 0
      ? currentDrafts.map((d, i) => (i === existingDraftIndex ? deleteDraft : d))
      : [...currentDrafts, deleteDraft];

    const storeRes = setCmsDraftsStorage(nextDrafts);
    if (!storeRes.success) return storeRes;
    return { success: true, draft: deleteDraft };
  }

  // For CREATE or UPDATE: sanitize payload
  const sanitizeRes = sanitizeDraftPayload(table, effectiveAction, payload);
  if (!sanitizeRes.safe || !sanitizeRes.sanitized) {
    return { success: false, error: sanitizeRes.error || 'Failed to sanitize payload.' };
  }

  // Merge payload and changedFields with existing draft if present
  let mergedPayload: Record<string, any>;
  let mergedChangedFields: string[];
  let originalUpdatedAt: string | null;

  const newChangedKeys = Object.keys(sanitizeRes.sanitized);

  if (existingDraft) {
    mergedPayload = { ...existingDraft.payload, ...sanitizeRes.sanitized };
    const fieldSet = new Set([...existingDraft.changedFields, ...newChangedKeys]);
    mergedChangedFields = Array.from(fieldSet);
    // Crucial: preserve initial originalUpdatedAt, never overwrite it with newer sync
    originalUpdatedAt = existingDraft.originalUpdatedAt;
  } else {
    mergedPayload = sanitizeRes.sanitized;
    mergedChangedFields = newChangedKeys;
    // For UPDATE: take from remoteVersions map; for CREATE: null
    originalUpdatedAt = effectiveAction === 'UPDATE' ? (remoteVersions[remoteVersionKey] || null) : null;
  }

  const finalDraft: CmsDraftItem = {
    draftId,
    table,
    id: effectiveId,
    action: effectiveAction,
    summary: summary || existingDraft?.summary || `${table} (${effectiveId})`,
    originalUpdatedAt,
    changedFields: mergedChangedFields,
    payload: mergedPayload,
    localTimestamp: new Date().toISOString()
  };

  const nextDrafts = existingDraftIndex >= 0
    ? currentDrafts.map((d, i) => (i === existingDraftIndex ? finalDraft : d))
    : [...currentDrafts, finalDraft];

  const storeRes = setCmsDraftsStorage(nextDrafts);
  if (!storeRes.success) return storeRes;
  return { success: true, draft: finalDraft };
}

/**
 * 5. Remove single draft (called after successful publish or discard)
 */
export function removeCmsDraft(draftId: string): void {
  const current = getCmsDrafts();
  const next = current.filter(d => d.draftId !== draftId);
  if (next.length !== current.length) {
    setCmsDraftsStorage(next);
  }
}

/**
 * 6. Clear all drafts
 */
export function clearAllCmsDrafts(): void {
  setCmsDraftsStorage([]);
}

/**
 * 7. Apply Drafts Overlay for Multi-Row Tables (programs, campaigns)
 * Overlays local drafts on top of database results:
 * - Hides items with DELETE drafts
 * - Merges updates for items with UPDATE drafts
 * - Appends items with CREATE drafts
 */
export function applyCmsDraftsOverlay<T extends { id: string }>(
  table: CmsAllowedTable,
  remoteItems: T[]
): T[] {
  const drafts = getCmsDrafts().filter(d => d.table === table);
  if (drafts.length === 0) return remoteItems;

  const deleteIds = new Set(drafts.filter(d => d.action === 'DELETE').map(d => d.id));
  const updateDraftsMap = new Map(drafts.filter(d => d.action === 'UPDATE').map(d => [d.id, d.payload]));
  const createDrafts = drafts.filter(d => d.action === 'CREATE');

  // Filter deleted & update modified
  const updatedRemotes = remoteItems
    .filter(item => !deleteIds.has(item.id))
    .map(item => {
      const draftPayload = updateDraftsMap.get(item.id);
      if (!draftPayload) return item;
      return {
        ...item,
        ...draftPayload
      };
    });

  // Append new created drafts (if not already in remotes)
  const existingIds = new Set(updatedRemotes.map(r => r.id));
  const createdItems: T[] = [];
  for (const c of createDrafts) {
    if (!existingIds.has(c.id)) {
      createdItems.push({
        id: c.id,
        ...(c.payload as any)
      } as T);
    }
  }

  return [...updatedRemotes, ...createdItems];
}

/**
 * 8. Apply Draft Overlay for Single-Row Config Tables (site_settings, homepage_config)
 */
export function applyCmsSingleRowOverlay<T extends Record<string, any>>(
  table: 'site_settings' | 'homepage_config',
  remoteItem: T
): T {
  const drafts = getCmsDrafts().filter(d => d.table === table && d.id === 'default');
  if (drafts.length === 0) return remoteItem;

  const draft = drafts[0];
  if (draft.action === 'DELETE') return remoteItem; // single-row can never be deleted

  return {
    ...remoteItem,
    ...(draft.payload as any)
  };
}
