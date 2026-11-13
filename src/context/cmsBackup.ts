/**
 * Pre-Publish Backup Module for Infinity Bangladesh CMS
 * Fetches current database rows only for affected existing items (UPDATE/DELETE),
 * annotates CREATE items as not yet in the database, and triggers a single JSON download.
 * Hard-blocks publishing if fetching or downloading the backup fails.
 */

import type { CmsAllowedTable } from './dbAdapter';
import type { CmsDraftItem } from './cmsDraftStore';
import { fetchSupabaseRest } from '../lib/supabase';

export interface CmsBackupNewItemRef {
  table: CmsAllowedTable;
  id: string;
  summary: string;
}

export interface CmsBackupDocument {
  _notice: string;
  version: number;
  createdAt: string;
  affectedTables: CmsAllowedTable[];
  newItemsNotYetInDb: CmsBackupNewItemRef[];
  rowsByTable: Partial<Record<CmsAllowedTable, Record<string, unknown>[]>>;
}

export type CmsRestFetcher = <T = Record<string, unknown>[]>(
  table: string,
  query: string
) => Promise<T | null>;

export type CmsBackupDownloadHandler = (
  jsonString: string,
  filename: string
) => void | Promise<void>;

export interface CmsBackupOptions {
  customFetcher?: CmsRestFetcher;
  customDownloadHandler?: CmsBackupDownloadHandler;
  now?: Date;
}

export interface CmsBackupFetchResult {
  success: boolean;
  backupDoc?: CmsBackupDocument;
  error?: string;
}

export interface CmsBackupDownloadResult {
  success: boolean;
  filename?: string;
  backupDoc?: CmsBackupDocument;
  error?: string;
}

const BACKUP_NOTICE =
  'CREATE খসড়ার আইটেম ডাটাবেজে এখনও নেই, তাই ব্যাকআপ সারিতে নেই (newItemsNotYetInDb তালিকায় উল্লেখ করা হয়েছে) / CREATE draft items do not exist in the database yet and are therefore listed under newItemsNotYetInDb rather than backup rows.';

/**
 * Formats backup filename: infinity-cms-backup-YYYY-MM-DD_HH-mm.json
 */
export function formatCmsBackupFilename(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `infinity-cms-backup-${yyyy}-${mm}-${dd}_${hh}-${min}.json`;
}

/**
 * Fetches current database rows ONLY for affected existing items (UPDATE / DELETE).
 * CREATE items are recorded in `newItemsNotYetInDb`.
 * Any network/HTTP failure returns `{ success: false, error }` so publishing is halted.
 */
export async function fetchPrePublishBackupData(
  drafts: CmsDraftItem[],
  options?: Pick<CmsBackupOptions, 'customFetcher' | 'now'>
): Promise<CmsBackupFetchResult> {
  const fetcher: CmsRestFetcher = options?.customFetcher ?? fetchSupabaseRest;
  const now = options?.now ?? new Date();

  const newItemsNotYetInDb: CmsBackupNewItemRef[] = [];
  const existingIdsByTable = new Map<CmsAllowedTable, Set<string>>();
  const affectedTableSet = new Set<CmsAllowedTable>();

  for (const draft of drafts) {
    affectedTableSet.add(draft.table);
    if (draft.action === 'CREATE') {
      newItemsNotYetInDb.push({
        table: draft.table,
        id: draft.id,
        summary: draft.summary
      });
    } else {
      let idSet = existingIdsByTable.get(draft.table);
      if (!idSet) {
        idSet = new Set<string>();
        existingIdsByTable.set(draft.table, idSet);
      }
      idSet.add(draft.id);
    }
  }

  const rowsByTable: Partial<Record<CmsAllowedTable, Record<string, unknown>[]>> = {};

  for (const [table, idSet] of existingIdsByTable.entries()) {
    const ids = Array.from(idSet);
    if (ids.length === 0) continue;

    const query =
      ids.length === 1
        ? `select=*&id=eq.${encodeURIComponent(ids[0])}`
        : `select=*&id=in.${encodeURIComponent(`(${ids.map(id => `"${id.replace(/"/g, '\\"')}"`).join(',')})`)}`;

    try {
      const rows = await fetcher<Record<string, unknown>[]>(table, query);
      if (rows === null || !Array.isArray(rows)) {
        return {
          success: false,
          error:
            'ব্যাকআপ ডেটা ডাটাবেজ থেকে আনা সম্ভব হয়নি। নিরাপত্তার স্বার্থে প্রকাশ স্থগিত করা হয়েছে। / Failed to fetch current database rows for backup. Publishing has been halted for safety.'
        };
      }
      rowsByTable[table] = rows;
    } catch (err: any) {
      return {
        success: false,
        error: `ব্যাকআপ ডেটা আনতে ত্রুটি হয়েছে (${err?.message || 'Unknown error'})। নিরাপত্তার স্বার্থে প্রকাশ স্থগিত করা হয়েছে।`
      };
    }
  }

  const backupDoc: CmsBackupDocument = {
    _notice: BACKUP_NOTICE,
    version: 1,
    createdAt: now.toISOString(),
    affectedTables: Array.from(affectedTableSet),
    newItemsNotYetInDb,
    rowsByTable
  };

  return {
    success: true,
    backupDoc
  };
}

/**
 * Triggers browser download of the backup JSON file (or delegates to customDownloadHandler in tests).
 */
export async function triggerBackupDownload(
  backupDoc: CmsBackupDocument,
  filename: string,
  customDownloadHandler?: CmsBackupDownloadHandler
): Promise<void> {
  const jsonString = JSON.stringify(backupDoc, null, 2);

  if (customDownloadHandler) {
    await customDownloadHandler(jsonString, filename);
    return;
  }

  if (
    typeof document === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    throw new Error('Browser download APIs are unavailable in the current environment.');
  }

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Fetches affected rows and downloads a single JSON backup file before publishing.
 * Hard-fails on either fetch error or download failure; never bypasses backup.
 */
export async function createAndDownloadCmsBackup(
  drafts: CmsDraftItem[],
  options?: CmsBackupOptions
): Promise<CmsBackupDownloadResult> {
  const fetchResult = await fetchPrePublishBackupData(drafts, options);
  if (!fetchResult.success || !fetchResult.backupDoc) {
    return {
      success: false,
      error:
        fetchResult.error ||
        'ব্যাকআপ তৈরি করা যায়নি। প্রকাশ স্থগিত করা হয়েছে। / Unable to create pre-publish backup.'
    };
  }

  const filename = formatCmsBackupFilename(options?.now ?? new Date());
  try {
    await triggerBackupDownload(
      fetchResult.backupDoc,
      filename,
      options?.customDownloadHandler
    );
    return {
      success: true,
      filename,
      backupDoc: fetchResult.backupDoc
    };
  } catch (err: any) {
    return {
      success: false,
      error: `ব্যাকআপ ফাইল ডাউনলোড ব্যর্থ হয়েছে (${err?.message || 'Download failed'})। নিরাপত্তার স্বার্থে প্রকাশ স্থগিত করা হয়েছে। / Backup file download failed. Publishing has been halted for safety.`
    };
  }
}

