/**
 * Supabase Client & Service Integration for Infinity Bangladesh
 * Organization: Infinity Bangladesh (Team Infinity — United for Humanity)
 * 
 * Supports both Live Supabase Backend (PostgreSQL + Auth + Storage + RLS)
 * and Seamless Local/Offline Fallback mode for local development and instant resilience.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { uploadToCloudinary } from './cloudinary';
import { isValidPermanentUrl } from './utils/mediaSanitizer';

// Environment variables — NEVER hardcode credentials in source code.
// Configure via .env file or Vercel environment variables.
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

// Singleton Supabase Client instance (or null if unconfigured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const SUPABASE_STORAGE_UPLOADS_LOCKED = true;

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
    if (!supabase || !isSupabaseConfigured) {
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

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
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
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Using local admin fallback.');
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOutAdmin() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  sessionStorage.removeItem('infinity_admin_auth');
  sessionStorage.removeItem('infinity_admin_user');
}

export async function resetAdminPassword(email: string) {
  if (!supabase) {
    throw new Error('Supabase credentials required for automated password reset emails.');
  }
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin`
  });
}
