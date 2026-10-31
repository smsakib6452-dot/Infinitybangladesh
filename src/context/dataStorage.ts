/**
 * Local Storage Persistence Layer for Infinity Bangladesh Data Context
 * Hardened with migration state machine, fail-closed persistence gates,
 * and safe exception handling.
 */

import { isValidPermanentUrl } from '../lib/utils/mediaSanitizer';

export const CURRENT_DATA_VERSION = '2026.08.27.1788020980284';
export const DATA_VERSION_KEY = 'infinity_data_version';
export const STORAGE_PREFIX = 'infinity_bd_v2_';

export type MigrationState =
  | 'UNINITIALIZED'
  | 'IDLE'
  | 'MIGRATING'
  | 'COMPLETE'
  | 'PARTIAL_FAILURE'
  | 'FATAL_FAILURE'
  | 'UNNECESSARY';

// The canonical 10 media-bearing entities in the application
export const CANONICAL_MEDIA_KEYS = [
  'campaigns',
  'programs',
  'programEvents',
  'eventMediaList',
  'stories',
  'news',
  'events',
  'galleryAlbums',
  'gallery',
  'banners',
  'videos',
  'journeyVideos',
  'mediaLibrary',
  'pressCoverages',
  'committeeMembers',
  'persons',
  'committees',
  'partners',
  'adminProfiles',
  'bloodDonors',
  'aboutSettings',
  'headerSettings',
  'footerSettings',
  'homepageConfig'
] as const;

export type CanonicalMediaKey = typeof CANONICAL_MEDIA_KEYS[number];

const MEDIA_KEYS_SET = new Set<string>([
  ...CANONICAL_MEDIA_KEYS,
  'pressCoverage' // Alias used in some schema declarations
]);

// Module-level state tracking
let migrationState: MigrationState = 'UNINITIALIZED';
const failedMigrationKeys = new Set<string>();
const migratedKeysList = new Set<string>();
const unchangedKeysList = new Set<string>();

/**
 * Normalizes physical prefixed keys or alias names into canonical logical keys.
 */
export function normalizeStorageKey(key: string): string {
  if (!key) return '';
  let clean = key;
  if (clean.startsWith(STORAGE_PREFIX)) {
    clean = clean.slice(STORAGE_PREFIX.length);
  }
  if (clean === 'pressCoverage') {
    return 'pressCoverages';
  }
  return clean;
}

export function isMediaKey(key: string): boolean {
  const norm = normalizeStorageKey(key);
  return MEDIA_KEYS_SET.has(norm);
}

/**
 * Safely accesses window.localStorage without throwing.
 * Handles disabled cookies, private mode, and missing window in SSR/Node.
 */
export function getSafeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

export function getMigrationState(): MigrationState {
  return migrationState;
}

export function getFailedMigrationKeys(): string[] {
  return Array.from(failedMigrationKeys);
}

export function getMigratedKeys(): string[] {
  return Array.from(migratedKeysList);
}

export function getUnchangedKeys(): string[] {
  return Array.from(unchangedKeysList);
}

/**
 * Checks if persistence is blocked for a specific storage key.
 * Media keys fail closed if the migration state is not COMPLETE or UNNECESSARY,
 * or if that specific key failed migration.
 */
export function isKeyPersistenceBlocked(key: string): boolean {
  const norm = normalizeStorageKey(key);
  if (!isMediaKey(norm)) {
    return false; // Non-media keys are never blocked by media migration
  }

  // If in FATAL_FAILURE, UNINITIALIZED, or MIGRATING, all media keys fail closed
  if (
    migrationState === 'FATAL_FAILURE' ||
    migrationState === 'UNINITIALIZED' ||
    migrationState === 'MIGRATING'
  ) {
    return true;
  }

  // In PARTIAL_FAILURE, check if this specific key failed
  if (failedMigrationKeys.has(norm)) {
    return true;
  }

  return false;
}

/**
 * Sanitizes a single record of a media key, removing transient blob/data URLs
 * while preserving all other properties and metadata.
 */
function sanitizeRecord(normKey: string, item: any): { sanitized: any; modified: boolean } {
  if (!item || typeof item !== 'object') {
    return { sanitized: item, modified: false };
  }

  const copy = { ...item };
  let modified = false;

  const sanitizeUrlField = (fieldName: string, isRequired = false) => {
    if (fieldName in copy && typeof copy[fieldName] === 'string') {
      const val = copy[fieldName];
      if (/^(blob|data):/i.test(val) || !isValidPermanentUrl(val)) {
        copy[fieldName] = isRequired ? '' : '';
        modified = true;
      }
    }
  };

  switch (normKey) {
    case 'campaigns':
      sanitizeUrlField('imageUrl', true);
      sanitizeUrlField('image', true);
      if (Array.isArray(copy.galleryImages)) {
        const origLen = copy.galleryImages.length;
        const filtered = copy.galleryImages.filter((u: any) => typeof u === 'string' && isValidPermanentUrl(u));
        if (filtered.length !== origLen) {
          copy.galleryImages = filtered;
          modified = true;
        }
      }
      break;
    case 'programs':
    case 'stories':
    case 'news':
    case 'events':
      sanitizeUrlField('imageUrl', false);
      sanitizeUrlField('image', false);
      break;
    case 'programEvents':
      sanitizeUrlField('coverImageUrl', false);
      sanitizeUrlField('image', false);
      break;
    case 'eventMediaList':
      sanitizeUrlField('url', true);
      sanitizeUrlField('thumbnail', false);
      break;
    case 'pressCoverages':
      sanitizeUrlField('featuredImage', false);
      sanitizeUrlField('image', false);
      sanitizeUrlField('imageUrl', false);
      sanitizeUrlField('outletLogoUrl', false);
      break;
    case 'gallery':
      sanitizeUrlField('imageUrl', true);
      sanitizeUrlField('url', true);
      break;
    case 'banners':
      sanitizeUrlField('desktopImageUrl', true);
      sanitizeUrlField('mobileImageUrl', false);
      break;
    case 'videos':
    case 'journeyVideos':
      sanitizeUrlField('videoUrl', true);
      sanitizeUrlField('thumbnailUrl', false);
      break;
    case 'mediaLibrary':
      sanitizeUrlField('url', true);
      sanitizeUrlField('thumbnailUrl', false);
      break;
    case 'persons':
      sanitizeUrlField('photoUrl', false);
      break;
    case 'committeeMembers':
      sanitizeUrlField('photoUrl', false);
      if (copy.person && typeof copy.person === 'object') {
        const pUrl = copy.person.photoUrl;
        if (typeof pUrl === 'string' && (/^(blob|data):/i.test(pUrl) || !isValidPermanentUrl(pUrl))) {
          copy.person = { ...copy.person, photoUrl: '' };
          modified = true;
        }
      }
      break;
    case 'committees':
      sanitizeUrlField('bannerImageUrl', false);
      break;
    case 'partners':
      sanitizeUrlField('logoUrl', false);
      break;
    case 'adminProfiles':
      sanitizeUrlField('avatarUrl', false);
      break;
    case 'bloodDonors':
      sanitizeUrlField('avatarUrl', false);
      sanitizeUrlField('photoUrl', false);
      break;
    case 'galleryAlbums':
      sanitizeUrlField('coverImage', false);
      sanitizeUrlField('coverImageUrl', false);
      if (Array.isArray(copy.photos)) {
        let photosModified = false;
        const newPhotos = copy.photos.map((photo: any) => {
          if (!photo || typeof photo !== 'object') {
            throw new Error('STRUCTURAL_CORRUPTION');
          }
          const pUrl = photo.url || photo.imageUrl;
          if (typeof pUrl === 'string' && (/^(blob|data):/i.test(pUrl) || !isValidPermanentUrl(pUrl))) {
            photosModified = true;
            return { ...photo, url: '', imageUrl: '' };
          }
          return photo;
        });
        if (photosModified) {
          copy.photos = newPhotos;
          modified = true;
        }
      }
      break;
    case 'aboutSettings':
      sanitizeUrlField('heroImageUrl', false);
      sanitizeUrlField('secondaryImageUrl', false);
      break;
    case 'headerSettings':
      sanitizeUrlField('logoUrl', false);
      break;
    case 'footerSettings':
      sanitizeUrlField('footerLogoUrl', false);
      break;
    case 'homepageConfig':
      if (copy.volunteerBanner && typeof copy.volunteerBanner === 'object') {
        if (typeof copy.volunteerBanner.bannerImageUrl === 'string' && !isValidPermanentUrl(copy.volunteerBanner.bannerImageUrl)) {
          copy.volunteerBanner.bannerImageUrl = '';
          modified = true;
        }
      }
      if (copy.supportBanner && typeof copy.supportBanner === 'object') {
        if (typeof copy.supportBanner.bannerImageUrl === 'string' && !isValidPermanentUrl(copy.supportBanner.bannerImageUrl)) {
          copy.supportBanner.bannerImageUrl = '';
          modified = true;
        }
      }
      break;
    default:
      break;
  }

  return { sanitized: copy, modified };
}

/**
 * Performs idempotent startup migration across all 10 canonical media keys.
 */
export function initializeStorage(): MigrationState {
  const storage = getSafeLocalStorage();
  if (!storage) {
    // Non-browser or storage restricted
    if (typeof window === 'undefined') {
      migrationState = 'UNINITIALIZED';
      return migrationState;
    }
    migrationState = 'FATAL_FAILURE';
    return migrationState;
  }

  failedMigrationKeys.clear();
  migratedKeysList.clear();
  unchangedKeysList.clear();

  // 1. Check existing version marker
  let savedVersion: string | null = null;
  try {
    savedVersion = storage.getItem(DATA_VERSION_KEY);
  } catch (err) {
    console.error('[STORAGE MIGRATION] Failed to read version marker:', err);
    migrationState = 'FATAL_FAILURE';
    return migrationState;
  }

  // Version check
  if (savedVersion === CURRENT_DATA_VERSION) {
    migrationState = 'UNNECESSARY';
    return migrationState;
  }

  // Reject unknown future version markers (fail closed)
  if (savedVersion && savedVersion > CURRENT_DATA_VERSION) {
    console.warn(`[STORAGE MIGRATION] Unknown future data version detected: ${savedVersion}. Failing closed.`);
    migrationState = 'FATAL_FAILURE';
    return migrationState;
  }

  migrationState = 'MIGRATING';

  // 2. Iterate through canonical media keys
  for (const rawKey of CANONICAL_MEDIA_KEYS) {
    const physicalKey = `${STORAGE_PREFIX}${rawKey}`;
    let rawValue: string | null = null;

    try {
      rawValue = storage.getItem(physicalKey);
    } catch (readErr) {
      console.error(`[STORAGE MIGRATION] Read exception on key: ${rawKey}`, readErr);
      failedMigrationKeys.add(rawKey);
      continue;
    }

    // Key doesn't exist yet -> clean no-op
    if (rawValue === null) {
      unchangedKeysList.add(rawKey);
      continue;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawValue);
    } catch (parseErr) {
      console.error(`[STORAGE MIGRATION] Malformed JSON in key: ${rawKey}. Raw storage left untouched.`, parseErr);
      failedMigrationKeys.add(rawKey);
      continue;
    }

    if (Array.isArray(parsed)) {
      let keyModified = false;
      let hasStructuralError = false;
      const sanitizedArray: any[] = [];

      for (const item of parsed) {
        try {
          const { sanitized, modified } = sanitizeRecord(rawKey, item);
          if (modified) keyModified = true;
          sanitizedArray.push(sanitized);
        } catch (structErr) {
          hasStructuralError = true;
          break;
        }
      }

      if (hasStructuralError) {
        console.error(`[STORAGE MIGRATION] Structural corruption in key: ${rawKey}. Raw storage left untouched.`);
        failedMigrationKeys.add(rawKey);
        continue;
      }

      if (keyModified) {
        try {
          storage.setItem(physicalKey, JSON.stringify(sanitizedArray));
          migratedKeysList.add(rawKey);
        } catch (writeErr) {
          console.error(`[STORAGE MIGRATION] Write exception on key: ${rawKey}`, writeErr);
          failedMigrationKeys.add(rawKey);
        }
      } else {
        unchangedKeysList.add(rawKey);
      }
    } else if (parsed && typeof parsed === 'object') {
      try {
        const { sanitized, modified } = sanitizeRecord(rawKey, parsed);
        if (modified) {
          storage.setItem(physicalKey, JSON.stringify(sanitized));
          migratedKeysList.add(rawKey);
        } else {
          unchangedKeysList.add(rawKey);
        }
      } catch (objErr) {
        console.error(`[STORAGE MIGRATION] Object exception in key: ${rawKey}`, objErr);
        failedMigrationKeys.add(rawKey);
      }
    } else {
      unchangedKeysList.add(rawKey);
    }
  }

  // 3. Finalize migration state
  if (failedMigrationKeys.size > 0) {
    migrationState = 'PARTIAL_FAILURE';
    console.warn(`[STORAGE MIGRATION] Migration finished with partial failures: ${Array.from(failedMigrationKeys).join(', ')}`);
    return migrationState;
  }

  // 4. Write completion marker
  try {
    storage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    migrationState = 'COMPLETE';
  } catch (markerErr) {
    console.error('[STORAGE MIGRATION] Failed writing completion marker:', markerErr);
    migrationState = 'PARTIAL_FAILURE';
  }

  return migrationState;
}

// Auto-initialize safely in browser
if (typeof window !== 'undefined') {
  try {
    initializeStorage();
  } catch (initErr) {
    console.error('[STORAGE MIGRATION] Critical initialization exception:', initErr);
    migrationState = 'FATAL_FAILURE';
  }
}

/**
 * Loads a value from storage with safe fallback.
 */
export function getStoredOrDefault<T>(key: string, fallback: T): T {
  const norm = normalizeStorageKey(key);

  // If this media key failed migration, do not hydrate contaminated data
  if (isKeyPersistenceBlocked(norm)) {
    return fallback;
  }

  const storage = getSafeLocalStorage();
  if (!storage) return fallback;

  try {
    const saved = storage.getItem(`${STORAGE_PREFIX}${norm}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

/**
 * Saves a value to storage with fail-closed gate enforcement and quota protection.
 * Returns true if and only if the item was successfully written to persistent storage.
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  const norm = normalizeStorageKey(key);

  // Gating rule: Block writes to failed media keys
  if (isKeyPersistenceBlocked(norm)) {
    console.warn(`[STORAGE GATE] Write blocked for key: ${norm} (State: ${migrationState})`);
    return false;
  }

  const storage = getSafeLocalStorage();
  if (!storage) return false;

  try {
    const serialized = JSON.stringify(value);
    storage.setItem(`${STORAGE_PREFIX}${norm}`, serialized);
    return true;
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
    return false;
  }
}
