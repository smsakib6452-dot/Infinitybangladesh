/**
 * Database Adapter & Audit Logging Utilities for Infinity Bangladesh CMS
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types';

export async function safeDbUpsert(tableName: string, data: any): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      const colMatch =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column (?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+) does not exist/i);
      if (colMatch && colMatch[1]) {
        const fallbackData = { ...data };
        delete fallbackData[colMatch[1]];
        const { error: retryError } = await supabase.from(tableName).upsert(fallbackData);
        if (retryError && import.meta.env.DEV) {
          console.warn(`Supabase upsert fallback failed on ${tableName}:`, retryError.message);
        }
      } else if (import.meta.env.DEV) {
        console.warn(`Supabase upsert error on ${tableName}:`, error.message);
      }
    }
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn(`Supabase network error on ${tableName}:`, err.message);
    }
  }
}

export async function safeDbDelete(tableName: string, matchColumn: string, matchValue: any): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from(tableName).delete().eq(matchColumn, matchValue);
    if (error && import.meta.env.DEV) {
      console.warn(`Supabase delete error on ${tableName}:`, error.message);
    }
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn(`Supabase network delete error on ${tableName}:`, err.message);
    }
  }
}

export function createAuditLog(action: string, entity: string, entityId: string, details: string): AuditLog {
  const user = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('infinity_admin_user')) || 'Admin';
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    details
  };
}

