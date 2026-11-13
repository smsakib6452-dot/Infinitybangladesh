/**
 * CMS Publish Engine for Infinity Bangladesh
 * Sequentially publishes local CMS drafts (CREATE -> UPDATE -> DELETE),
 * enforces pre-publish backup, sensitive-field confirmation, image URL validation,
 * immediate halt on AUTH_REQUIRED, conflict resolution, and post-publish GET-only sync.
 */

import {
  CmsAllowedTable,
  AdminCmsMutationResult,
  CMS_SENSITIVE_FIELDS,
  safeDbAdminCreate,
  safeDbAdminCmsUpdate,
  safeDbAdminCmsDelete
} from './dbAdapter';
import {
  CmsDraftItem,
  CmsAction,
  removeCmsDraft,
  saveCmsRemoteVersionsBatch
} from './cmsDraftStore';
import {
  CmsBackupDocument,
  CmsBackupOptions,
  CmsRestFetcher,
  createAndDownloadCmsBackup
} from './cmsBackup';
import { fetchSupabaseRest } from '../lib/supabase';

export type CmsPublishItemStatus =
  | 'SUCCESS'
  | 'CONFLICT'
  | 'PERMISSION_DENIED_OR_NOT_FOUND'
  | 'AUTH_REQUIRED'
  | 'VALIDATION_FAILED'
  | 'DATABASE_ERROR'
  | 'SKIPPED';

export interface CmsSensitiveChange {
  field: string;
  labelBn: string;
  labelEn: string;
  oldValue: string;
  newValue: string;
}

export interface CmsPublishItemResult {
  draftId: string;
  table: CmsAllowedTable;
  id: string;
  action: CmsAction;
  summary: string;
  status: CmsPublishItemStatus;
  success: boolean;
  error?: string;
  currentUpdatedAt?: string;
  publishedUpdatedAt?: string;
}

export interface CmsPostPublishSyncPayload {
  site_settings: Record<string, unknown>[];
  homepage_config: Record<string, unknown>[];
  programs: Record<string, unknown>[];
  campaigns: Record<string, unknown>[];
}

export interface CmsPublishProgress {
  current: number;
  total: number;
  draft: CmsDraftItem;
}

export interface CmsPublishOptions {
  confirmSensitive?: boolean;
  currentSiteSettings?: Record<string, unknown> | null;
  backupOptions?: CmsBackupOptions;
  customRestFetcher?: CmsRestFetcher;
  onProgress?: (progress: CmsPublishProgress) => void;
  onPostPublishSync?: (data: CmsPostPublishSyncPayload) => void | Promise<void>;
}

export interface CmsPublishSummary {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  haltedByAuth: boolean;
  backupFailed: boolean;
  backupError?: string;
  backupFilename?: string;
  backupDoc?: CmsBackupDocument;
  requiresSensitiveConfirmation: boolean;
  sensitiveChanges: CmsSensitiveChange[];
  postPublishSyncOk: boolean;
  results: CmsPublishItemResult[];
}

export type CmsConflictResolution = 'keepRemote' | 'forceOverwrite' | 'skip';

export interface CmsConflictResolveResult {
  success: boolean;
  status: CmsPublishItemStatus;
  draftId: string;
  remoteRow?: Record<string, unknown> | null;
  publishedUpdatedAt?: string;
  currentUpdatedAt?: string;
  error?: string;
}

export const IMAGE_NOT_UPLOADED_ERROR_BN = 'ছবি এখনও ক্লাউডে আপলোড হয়নি, আগে ছবি আপলোড করুন';
export const IMAGE_NOT_UPLOADED_ERROR_EN = 'Image has not been uploaded to cloud yet, please upload the image first.';

const SENSITIVE_FIELD_LABELS: Record<string, { bn: string; en: string }> = {
  bkash_number: { bn: 'বিকাশ নম্বর (bKash)', en: 'bKash Number' },
  nagad_number: { bn: 'নগদ নম্বর (Nagad)', en: 'Nagad Number' },
  bank_details: { bn: 'ব্যাংক অ্যাকাউন্ট তথ্য', en: 'Bank Details' },
  official_phone: { bn: 'অফিসিয়াল ফোন নম্বর', en: 'Official Phone' },
  official_email: { bn: 'অফিসিয়াল ইমেইল', en: 'Official Email' }
};

function formatDisplayValue(val: unknown): string {
  if (val === undefined || val === null || val === '') return '—';
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

function getUtf8ByteLength(str: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return str.length;
}

/**
 * Checks whether a single image string is safe and already hosted (https:// or site-relative /path).
 * Rejects data:, blob:, http://, protocol-relative //, and > 500 bytes.
 */
export function isValidCmsImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // empty / omitted image field is allowed
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('data:') || lower.startsWith('blob:')) {
    return false;
  }
  if (getUtf8ByteLength(trimmed) > 500) {
    return false;
  }
  if (trimmed.startsWith('https://')) {
    return trimmed.length > 'https://'.length;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  return false;
}

/**
 * Validates all image fields inside a CMS draft payload.
 */
export function validateDraftImages(
  payload: Record<string, unknown> | undefined | null
): { valid: boolean; invalidField?: string; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: true };
  }

  const singleImageKeys = ['image_url', 'logo_url', 'favicon_url'];
  for (const key of singleImageKeys) {
    const val = payload[key];
    if (typeof val === 'string' && !isValidCmsImageUrl(val)) {
      return {
        valid: false,
        invalidField: key,
        error: `${IMAGE_NOT_UPLOADED_ERROR_BN} (${key})`
      };
    }
  }

  if (Array.isArray(payload.gallery_images)) {
    for (let i = 0; i < payload.gallery_images.length; i++) {
      const item = payload.gallery_images[i];
      if (typeof item === 'string' && !isValidCmsImageUrl(item)) {
        return {
          valid: false,
          invalidField: `gallery_images[${i}]`,
          error: `${IMAGE_NOT_UPLOADED_ERROR_BN} (gallery_images[${i}])`
        };
      }
    }
  }

  // Nested homepage_config image fields
  const nestedChecks: Array<[string, string]> = [
    ['hero', 'heroImageUrl'],
    ['hero', 'image_url'],
    ['about_preview', 'imageUrl'],
    ['about_preview', 'image_url']
  ];
  for (const [parentKey, childKey] of nestedChecks) {
    const parent = payload[parentKey];
    if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
      const childVal = (parent as Record<string, unknown>)[childKey];
      if (typeof childVal === 'string' && !isValidCmsImageUrl(childVal)) {
        return {
          valid: false,
          invalidField: `${parentKey}.${childKey}`,
          error: `${IMAGE_NOT_UPLOADED_ERROR_BN} (${parentKey}.${childKey})`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Detects modified sensitive fields (`bkash_number`, `nagad_number`, `bank_details`,
 * `official_phone`, `official_email`) across drafts for confirmation UI and engine gate.
 */
export function detectSensitiveChanges(
  drafts: CmsDraftItem[],
  currentDbSiteSettings?: Record<string, unknown> | null
): CmsSensitiveChange[] {
  const changes: CmsSensitiveChange[] = [];

  for (const draft of drafts) {
    const sensitiveList = CMS_SENSITIVE_FIELDS[draft.table];
    if (!sensitiveList || sensitiveList.length === 0) continue;

    for (const field of sensitiveList) {
      const inChangedFields = draft.changedFields.includes(field);
      const inPayload = draft.payload && field in draft.payload;
      if (!inChangedFields && !inPayload) continue;

      const label = SENSITIVE_FIELD_LABELS[field] || { bn: field, en: field };
      const oldValue = formatDisplayValue(currentDbSiteSettings?.[field]);
      const newValue = formatDisplayValue(draft.payload?.[field]);

      changes.push({
        field,
        labelBn: label.bn,
        labelEn: label.en,
        oldValue,
        newValue
      });
    }
  }

  return changes;
}

const ACTION_PRIORITY: Record<CmsAction, number> = {
  CREATE: 0,
  UPDATE: 1,
  DELETE: 2
};

/**
 * Returns drafts ordered strictly: CREATE -> UPDATE -> DELETE.
 */
export function sortDraftsForPublish(drafts: CmsDraftItem[]): CmsDraftItem[] {
  return [...drafts].sort((a, b) => ACTION_PRIORITY[a.action] - ACTION_PRIORITY[b.action]);
}

function getMutationError(res: AdminCmsMutationResult<any>): string | undefined {
  return 'error' in res ? res.error : undefined;
}

function mapMutationStatus(status: AdminCmsMutationResult['status']): CmsPublishItemStatus {
  switch (status) {
    case 'SUCCESS':
      return 'SUCCESS';
    case 'CONFLICT':
      return 'CONFLICT';
    case 'PERMISSION_DENIED_OR_NOT_FOUND':
      return 'PERMISSION_DENIED_OR_NOT_FOUND';
    case 'AUTH_REQUIRED':
      return 'AUTH_REQUIRED';
    case 'VALIDATION_FAILED':
    case 'FEATURE_DISABLED':
      return 'VALIDATION_FAILED';
    case 'DATABASE_ERROR':
    case 'ONLINE_REQUIRED':
    default:
      return 'DATABASE_ERROR';
  }
}

/**
 * Fetches the 4 P1 CMS tables via GET-only REST after successful publish
 * and updates cmsRemoteVersions + notifies caller via onPostPublishSync.
 */
export async function syncP1TablesAfterPublish(
  options?: Pick<CmsPublishOptions, 'customRestFetcher' | 'onPostPublishSync'>
): Promise<boolean> {
  const fetcher: CmsRestFetcher = options?.customRestFetcher ?? fetchSupabaseRest;
  try {
    const [siteSettings, homepageConfig, programs, campaigns] = await Promise.all([
      fetcher<Record<string, unknown>[]>('site_settings', 'select=*'),
      fetcher<Record<string, unknown>[]>('homepage_config', 'select=*'),
      fetcher<Record<string, unknown>[]>('programs', 'select=*&order=display_order.asc'),
      fetcher<Record<string, unknown>[]>('campaigns', 'select=*&order=created_at.desc')
    ]);

    if (!siteSettings || !homepageConfig || !programs || !campaigns) {
      return false;
    }

    const versionEntries: Array<{ table: CmsAllowedTable; id: string; updatedAt?: string | null }> = [];
    const collectVersions = (table: CmsAllowedTable, rows: Record<string, unknown>[]) => {
      for (const row of rows) {
        if (typeof row?.id === 'string' && typeof row?.updated_at === 'string') {
          versionEntries.push({ table, id: row.id, updatedAt: row.updated_at });
        }
      }
    };

    collectVersions('site_settings', siteSettings);
    collectVersions('homepage_config', homepageConfig);
    collectVersions('programs', programs);
    collectVersions('campaigns', campaigns);
    saveCmsRemoteVersionsBatch(versionEntries);

    if (options?.onPostPublishSync) {
      await options.onPostPublishSync({
        site_settings: siteSettings,
        homepage_config: homepageConfig,
        programs,
        campaigns
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Publishes all given CMS drafts sequentially in CREATE -> UPDATE -> DELETE order.
 */
export async function publishCmsDrafts(
  drafts: CmsDraftItem[],
  options: CmsPublishOptions = {}
): Promise<CmsPublishSummary> {
  if (!drafts.length) {
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      haltedByAuth: false,
      backupFailed: false,
      requiresSensitiveConfirmation: false,
      sensitiveChanges: [],
      postPublishSyncOk: false,
      results: []
    };
  }

  const orderedDrafts = sortDraftsForPublish(drafts);

  // 1. Sensitive fields check before executing mutations
  const initialSensitiveChanges = detectSensitiveChanges(orderedDrafts, options.currentSiteSettings);
  if (initialSensitiveChanges.length > 0 && options.confirmSensitive !== true) {
    const blockedResults: CmsPublishItemResult[] = orderedDrafts.map((d) => {
      const hasSensitive = detectSensitiveChanges([d], options.currentSiteSettings).length > 0;
      return {
        draftId: d.draftId,
        table: d.table,
        id: d.id,
        action: d.action,
        summary: d.summary,
        status: hasSensitive ? 'VALIDATION_FAILED' : 'SKIPPED',
        success: false,
        error: hasSensitive
          ? 'সংবেদনশীল তথ্য (বিকাশ/নগদ/ব্যাংক/ফোন/ইমেইল) পরিবর্তনের জন্য আলাদা নিশ্চিতকরণ প্রয়োজন। / Explicit confirmation is required before publishing sensitive contact/payment fields.'
          : 'সংবেদনশীল তথ্যের নিশ্চিতকরণ অপেক্ষমাণ থাকায় প্রকাশ স্থগিত করা হয়েছে। / Halted pending sensitive fields confirmation.'
      };
    });

    return {
      total: orderedDrafts.length,
      succeeded: 0,
      failed: blockedResults.filter((r) => r.status === 'VALIDATION_FAILED').length,
      skipped: blockedResults.filter((r) => r.status === 'SKIPPED').length,
      haltedByAuth: false,
      backupFailed: false,
      requiresSensitiveConfirmation: true,
      sensitiveChanges: initialSensitiveChanges,
      postPublishSyncOk: false,
      results: blockedResults
    };
  }

  // 2. Mandatory Pre-Publish Backup Gate (cannot be bypassed)
  const backupResult = await createAndDownloadCmsBackup(orderedDrafts, options.backupOptions);
  if (!backupResult.success || !backupResult.backupDoc) {
    return {
      total: orderedDrafts.length,
      succeeded: 0,
      failed: orderedDrafts.length,
      skipped: 0,
      haltedByAuth: false,
      backupFailed: true,
      backupError:
        backupResult.error ||
        'ব্যাকআপ সম্পন্ন না হওয়ায় প্রকাশ স্থগিত করা হয়েছে। / Publish halted because backup failed.',
      requiresSensitiveConfirmation: false,
      sensitiveChanges: initialSensitiveChanges,
      postPublishSyncOk: false,
      results: orderedDrafts.map((d) => ({
        draftId: d.draftId,
        table: d.table,
        id: d.id,
        action: d.action,
        summary: d.summary,
        status: 'VALIDATION_FAILED',
        success: false,
        error:
          backupResult.error ||
          'ব্যাকআপ সম্পন্ন না হওয়ায় প্রকাশ স্থগিত করা হয়েছে।'
      }))
    };
  }

  const dbSiteSettings =
    options.currentSiteSettings ??
    backupResult.backupDoc.rowsByTable.site_settings?.[0] ??
    null;
  const resolvedSensitiveChanges = detectSensitiveChanges(orderedDrafts, dbSiteSettings);

  // 3. Sequential Execution: CREATE -> UPDATE -> DELETE
  const results: CmsPublishItemResult[] = [];
  let haltedByAuth = false;

  for (let i = 0; i < orderedDrafts.length; i++) {
    const draft = orderedDrafts[i];
    options.onProgress?.({
      current: i + 1,
      total: orderedDrafts.length,
      draft
    });

    // Image validation for CREATE / UPDATE
    if (draft.action === 'CREATE' || draft.action === 'UPDATE') {
      const imgValidation = validateDraftImages(draft.payload as Record<string, unknown>);
      if (!imgValidation.valid) {
        results.push({
          draftId: draft.draftId,
          table: draft.table,
          id: draft.id,
          action: draft.action,
          summary: draft.summary,
          status: 'VALIDATION_FAILED',
          success: false,
          error: imgValidation.error || IMAGE_NOT_UPLOADED_ERROR_BN
        });
        continue;
      }
    }

    const publishTimestamp = new Date().toISOString();
    let mutationRes: AdminCmsMutationResult<any>;

    if (draft.action === 'CREATE') {
      mutationRes = await safeDbAdminCreate(draft.table, {
        ...draft.payload,
        id: draft.id,
        updated_at: publishTimestamp
      });
    } else if (draft.action === 'UPDATE') {
      mutationRes = await safeDbAdminCmsUpdate(
        draft.table,
        draft.id,
        {
          ...draft.payload,
          updated_at: publishTimestamp
        },
        draft.originalUpdatedAt ?? undefined
      );
    } else {
      mutationRes = await safeDbAdminCmsDelete(
        draft.table,
        draft.id,
        draft.originalUpdatedAt ?? undefined
      );
    }

    if (mutationRes.status === 'AUTH_REQUIRED') {
      haltedByAuth = true;
      results.push({
        draftId: draft.draftId,
        table: draft.table,
        id: draft.id,
        action: draft.action,
        summary: draft.summary,
        status: 'AUTH_REQUIRED',
        success: false,
        error: getMutationError(mutationRes)
      });

      // Halt all remaining items immediately
      for (let j = i + 1; j < orderedDrafts.length; j++) {
        const rem = orderedDrafts[j];
        results.push({
          draftId: rem.draftId,
          table: rem.table,
          id: rem.id,
          action: rem.action,
          summary: rem.summary,
          status: 'AUTH_REQUIRED',
          success: false,
          error:
            'সেশন শেষ বা লগইন প্রয়োজন — আগের ধাপে AUTH_REQUIRED পাওয়ায় বাকি প্রকাশ স্থগিত করা হয়েছে। / Halted due to AUTH_REQUIRED.'
        });
      }
      break;
    }

    if (mutationRes.success) {
      removeCmsDraft(draft.draftId);
      if (draft.action === 'CREATE' || draft.action === 'UPDATE') {
        saveCmsRemoteVersionsBatch([
          { table: draft.table, id: draft.id, updatedAt: publishTimestamp }
        ]);
      }

      results.push({
        draftId: draft.draftId,
        table: draft.table,
        id: draft.id,
        action: draft.action,
        summary: draft.summary,
        status: 'SUCCESS',
        success: true,
        publishedUpdatedAt: publishTimestamp
      });
    } else {
      const mappedStatus = mapMutationStatus(mutationRes.status);
      results.push({
        draftId: draft.draftId,
        table: draft.table,
        id: draft.id,
        action: draft.action,
        summary: draft.summary,
        status: mappedStatus,
        success: false,
        error: getMutationError(mutationRes),
        currentUpdatedAt:
          mutationRes.status === 'CONFLICT' ? mutationRes.currentUpdatedAt : undefined
      });
    }
  }

  const succeeded = results.filter((r) => r.status === 'SUCCESS').length;
  const skipped = results.filter((r) => r.status === 'SKIPPED').length;
  const failed = results.length - succeeded - skipped;

  let postPublishSyncOk = false;
  if (succeeded > 0) {
    postPublishSyncOk = await syncP1TablesAfterPublish({
      customRestFetcher: options.customRestFetcher ?? options.backupOptions?.customFetcher,
      onPostPublishSync: options.onPostPublishSync
    });
  }

  return {
    total: orderedDrafts.length,
    succeeded,
    failed,
    skipped,
    haltedByAuth,
    backupFailed: false,
    backupFilename: backupResult.filename,
    backupDoc: backupResult.backupDoc,
    requiresSensitiveConfirmation: false,
    sensitiveChanges: resolvedSensitiveChanges,
    postPublishSyncOk,
    results
  };
}

/**
 * Resolves a single CONFLICT item after publish:
 * - keepRemote: discards local draft, fetches single item from DB via GET-only REST, updates remote version registry
 * - forceOverwrite: retries UPDATE/DELETE with currentUpdatedAt returned from conflict check
 * - skip: leaves local draft untouched in queue
 */
export async function resolveCmsPublishConflict(
  draft: CmsDraftItem,
  resolution: CmsConflictResolution,
  conflictCurrentUpdatedAt?: string | null,
  options?: {
    customRestFetcher?: CmsRestFetcher;
    onKeepRemoteRow?: (table: CmsAllowedTable, row: Record<string, unknown> | null) => void;
    onPostPublishSync?: (data: CmsPostPublishSyncPayload) => void | Promise<void>;
  }
): Promise<CmsConflictResolveResult> {
  if (resolution === 'skip') {
    return {
      success: false,
      status: 'SKIPPED',
      draftId: draft.draftId
    };
  }

  if (resolution === 'keepRemote') {
    const fetcher: CmsRestFetcher = options?.customRestFetcher ?? fetchSupabaseRest;
    try {
      const rows = await fetcher<Record<string, unknown>[]>(
        draft.table,
        `select=*&id=eq.${encodeURIComponent(draft.id)}`
      );
      if (rows === null || !Array.isArray(rows)) {
        return {
          success: false,
          status: 'DATABASE_ERROR',
          draftId: draft.draftId,
          error:
            'ডাটাবেজ থেকে সর্বশেষ তথ্য আনা যায়নি। খসড়া সংরক্ষিত আছে। / Failed to fetch remote row.'
        };
      }

      const remoteRow = rows[0] ?? null;
      removeCmsDraft(draft.draftId);
      if (remoteRow && typeof remoteRow.updated_at === 'string') {
        saveCmsRemoteVersionsBatch([
          { table: draft.table, id: draft.id, updatedAt: remoteRow.updated_at }
        ]);
      }
      options?.onKeepRemoteRow?.(draft.table, remoteRow);

      return {
        success: true,
        status: 'SUCCESS',
        draftId: draft.draftId,
        remoteRow
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'DATABASE_ERROR',
        draftId: draft.draftId,
        error: err?.message || 'Failed to keep remote data.'
      };
    }
  }

  // forceOverwrite
  if (draft.action === 'CREATE') {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      draftId: draft.draftId,
      error: 'Force overwrite applies only to existing UPDATE or DELETE drafts.'
    };
  }

  if (draft.action === 'UPDATE') {
    const imgValidation = validateDraftImages(draft.payload as Record<string, unknown>);
    if (!imgValidation.valid) {
      return {
        success: false,
        status: 'VALIDATION_FAILED',
        draftId: draft.draftId,
        error: imgValidation.error || IMAGE_NOT_UPLOADED_ERROR_BN
      };
    }
  }

  const publishTimestamp = new Date().toISOString();
  const mutationRes =
    draft.action === 'UPDATE'
      ? await safeDbAdminCmsUpdate(
          draft.table,
          draft.id,
          {
            ...draft.payload,
            updated_at: publishTimestamp
          },
          conflictCurrentUpdatedAt ?? undefined
        )
      : await safeDbAdminCmsDelete(
          draft.table,
          draft.id,
          conflictCurrentUpdatedAt ?? undefined
        );

  if (mutationRes.success) {
    removeCmsDraft(draft.draftId);
    if (draft.action === 'UPDATE') {
      saveCmsRemoteVersionsBatch([
        { table: draft.table, id: draft.id, updatedAt: publishTimestamp }
      ]);
    }
    await syncP1TablesAfterPublish({
      customRestFetcher: options?.customRestFetcher,
      onPostPublishSync: options?.onPostPublishSync
    });
    return {
      success: true,
      status: 'SUCCESS',
      draftId: draft.draftId,
      publishedUpdatedAt: publishTimestamp
    };
  }

  return {
    success: false,
    status: mapMutationStatus(mutationRes.status),
    draftId: draft.draftId,
    currentUpdatedAt:
      mutationRes.status === 'CONFLICT' ? mutationRes.currentUpdatedAt : undefined,
    error: getMutationError(mutationRes)
  };
}
