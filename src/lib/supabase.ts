/**
 * Supabase Client & Service Integration for Infinity Bangladesh
 * Organization: Infinity Bangladesh (Team Infinity — United for Humanity)
 * 
 * Supports both Live Supabase Backend (PostgreSQL + Auth + Storage + RLS)
 * and Seamless Local/Offline Fallback mode for local development and instant resilience.
 *
 * NOTE: The supabase-js client is lazily loaded on-demand via `getSupabase()`
 * to keep the initial page bundle lightweight and fast.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { uploadToCloudinary } from './cloudinary';
import { isValidPermanentUrl } from './utils/mediaSanitizer';

// Environment variables — NEVER hardcode credentials in source code.
const supabaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL)) || '';
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.endsWith('.supabase.co') &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey.length > 10
);

export const SUPABASE_STORAGE_UPLOADS_LOCKED = true;

/**
 * Lightweight REST fetcher for homepage and public reads.
 * Executes native fetch() against Supabase PostgREST without loading the 220KB @supabase/supabase-js SDK.
 */
export async function fetchSupabaseRest<T = any>(
  table: string,
  query: string = '',
  options?: RequestInit
): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  const endpoint = `${supabaseUrl}/rest/v1/${table}${query ? `?${query}` : ''}`;
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      if (res.status === 404 || res.status === 406) return null;
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn(`[Supabase REST] Failed fetching ${table}:`, err);
    }
    return null;
  }
}

// Singleton client cache and in-flight promise to prevent race conditions
let _cachedClient: SupabaseClient | null = null;
let _loaderPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Synchronous client reference (populated once getSupabase() resolves)
 */
export let supabase: SupabaseClient | null = null;

/**
 * Returns the singleton SupabaseClient on demand.
 * Consumers await this loader. Concurrent calls share the same in-flight promise.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  if (_cachedClient) {
    supabase = _cachedClient;
    return _cachedClient;
  }

  if (!_loaderPromise) {
    _loaderPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => {
        _cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        supabase = _cachedClient;
        return _cachedClient;
      })
      .catch(err => {
        console.error('Failed to load Supabase client module:', err);
        _loaderPromise = null;
        return null;
      });
  }

  return _loaderPromise;
}

/**
 * Storage Helpers
 */
export async function uploadFileToSupabase(
  bucketName: 'infinity-media' | 'infinity-documents',
  file: File,
  customPath?: string
): Promise<{ success: boolean; url?: string; fileName?: string; error?: string }> {
  if (SUPABASE_STORAGE_UPLOADS_LOCKED) {
    if (typeof console !== 'undefined') {
      console.warn('[SECURITY] Supabase storage upload blocked locally (Phase 1.1 containment). No network request dispatched.');
    }
    return {
      success: false,
      error: 'Supabase storage uploads are locked during Phase 1.1 security baseline. No network request dispatched.'
    };
  }
  try {
    const client = await getSupabase();
    if (!client || !isSupabaseConfigured) {
      // Cloudinary cloud fallback for GitHub Pages and standalone deployment
      try {
        const cloudRes = await uploadToCloudinary(file);
        if (cloudRes && cloudRes.secure_url && !cloudRes.placeholder && isValidPermanentUrl(cloudRes.secure_url)) {
          return {
            success: true,
            url: cloudRes.secure_url,
            fileName: file.name
          };
        }
        return {
          success: false,
          error: 'Cloudinary upload locked or returned non-permanent URL.'
        };
      } catch (cloudErr: any) {
        return {
          success: false,
          error: 'Cloudinary upload fallback failed.'
        };
      }
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = customPath || cleanFileName;

    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name
    };
  } catch (err: any) {
    console.error('File upload exception:', err);
    return { success: false, error: err.message || 'Storage error' };
  }
}

/**
 * Auth Helpers
 */
export async function signInWithEmail(email: string, password: string) {
  const client = await getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured yet. Using local admin fallback.');
  }
  return await client.auth.signInWithPassword({ email, password });
}

export async function signOutAdmin() {
  const client = await getSupabase();
  if (client) {
    await client.auth.signOut();
  }
  sessionStorage.removeItem('infinity_admin_auth');
  sessionStorage.removeItem('infinity_admin_user');
}

export async function resetAdminPassword(email: string) {
  const client = await getSupabase();
  if (!client) {
    throw new Error('Supabase credentials required for automated password reset emails.');
  }
  return await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin`
  });
}
