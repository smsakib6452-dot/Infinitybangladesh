/**
 * Local Storage Persistence Layer for Infinity Bangladesh Data Context
 */

export const CURRENT_DATA_VERSION = '2026.08.27.1788020980284';
export const DATA_VERSION_KEY = 'infinity_data_version';
export const STORAGE_PREFIX = 'infinity_bd_v2_';

// Safe version marker without deleting user customized data
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    if (!localStorage.getItem(DATA_VERSION_KEY)) {
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    }
  } catch (e) {
    console.warn('Storage check warning:', e);
  }
}

export function getStoredOrDefault<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

