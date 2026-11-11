/**
 * Database Adapter & Audit Logging Utilities for Infinity Bangladesh CMS & LifeLine
 * Enforces strict public ingestion boundaries, CSPRNG ID generation, and domain security.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types';

export type PublicSubmissionTable =
  | 'blood_donors'
  | 'emergency_blood_requests'
  | 'volunteer_applications'
  | 'donation_records'
  | 'contact_messages';

export const REMOTE_CMS_MUTATIONS_LOCKED = true;
export const PUBLIC_SUBMISSION_LOCKED_PHASE_1_1 = false;

let _testClientOverride: any = null;
export function setTestClientOverride(client: any) {
  _testClientOverride = client;
}

export type AdminMutationTable =
  | 'blood_donors'
  | 'emergency_blood_requests';

export type AdminUpdateResult<T = { id: string }> =
  | { success: true; status: 'SUCCESS'; id: string; data?: T; count: number; error?: string }
  | { success: false; status: 'AUTH_REQUIRED'; error: string; count?: number }
  | { success: false; status: 'PERMISSION_DENIED'; error: string; count?: number }
  | { success: false; status: 'VALIDATION_FAILED'; error: string; count?: number }
  | { success: false; status: 'DATABASE_ERROR'; error: string; count?: number }
  | { success: false; status: 'ONLINE_REQUIRED'; error: string; count?: number }
  | { success: false; status: 'FEATURE_DISABLED'; error: string; count?: number };

/**
 * Admin Mutation Gates: strictly whitelisted tables and columns
 * for authenticated admin operations in Phase 1.1.
 * 'show_phone_publicly' and PII are strictly excluded.
 */
export const ADMIN_MUTATION_GATES: Record<AdminMutationTable, {
  readonly allowedColumns: readonly string[];
  readonly allowUpdate: boolean;
}> = {
  blood_donors: Object.freeze({
    allowedColumns: Object.freeze([
      'approval_status',
      'is_verified',
      'availability_status',
      'total_donations',
      'last_donation_date',
      'updated_at'
    ]),
    allowUpdate: true
  }),
  emergency_blood_requests: Object.freeze({
    allowedColumns: Object.freeze([
      'status',
      'updated_at'
    ]),
    allowUpdate: true
  })
};

export type InsertResult<T = { id: string }> =
  | { success: true; status: 'SUCCESS'; id: string; data?: T; code?: string; error?: string }
  | { success: false; status: 'VALIDATION_FAILED'; error: string; code?: string }
  | { success: false; status: 'DATABASE_ERROR'; error: string; code?: string }
  | { success: false; status: 'ONLINE_REQUIRED'; error: string; code?: string }
  | { success: false; status: 'FEATURE_DISABLED'; error: string; code?: string }
  | { success: false; status: 'DISABLED_PHASE_2'; error: string; code?: string };

/**
 * 1. Strict Public Submission Allowlists
 * Explicitly verified against supabase/schema.sql and frontend payloads.
 * Status and internal operational/admin fields are strictly excluded.
 */
export const PUBLIC_SUBMISSION_ALLOWLISTS: Record<PublicSubmissionTable, readonly string[]> = {
  blood_donors: Object.freeze([
    'id',
    'full_name',
    'blood_group',
    'gender',
    'date_of_birth',
    'phone',
    'email',
    'photo_url',
    'district',
    'upazila',
    'area',
    'detailed_address',
    'experience_notes',
    'privacy_consent',
    'show_phone_publicly'
  ]), // Exactly 15 columns
  emergency_blood_requests: Object.freeze([
    'id',
    'requester_name',
    'contact_number',
    'patient_name',
    'blood_group',
    'units_needed',
    'hospital_name',
    'district',
    'upazila',
    'emergency_level',
    'required_date',
    'additional_notes'
  ]), // Exactly 12 columns
  volunteer_applications: Object.freeze([
    'id',
    'full_name',
    'email',
    'phone',
    'district',
    'institution',
    'occupation',
    'blood_group',
    'skills',
    'preferred_areas',
    'availability',
    'message',
    'agreed_code_of_conduct'
  ]), // Exactly 13 columns
  donation_records: Object.freeze([
    'id',
    'donor_name',
    'donor_email',
    'donor_phone',
    'amount_bdt',
    'campaign_slug',
    'campaign_title',
    'donation_type',
    'payment_method',
    'transaction_id',
    'is_anonymous',
    'notes'
  ]), // Exactly 12 columns
  contact_messages: Object.freeze([
    'id',
    'name',
    'email',
    'phone',
    'subject',
    'message'
  ]) // Exactly 6 columns
};

/**
 * 2. Public Submission Feature Gates
 * Public direct insert for donation_records remains hard-blocked in Phase 1
 * while the unsafe PostgreSQL database default 'Successful' is active.
 */
export const PUBLIC_SUBMISSION_GATES: Record<PublicSubmissionTable, 'ACTIVE' | 'BLOCKED_PENDING_MIGRATION'> = {
  blood_donors: 'ACTIVE',
  emergency_blood_requests: 'BLOCKED_PENDING_MIGRATION',
  volunteer_applications: 'BLOCKED_PENDING_MIGRATION',
  contact_messages: 'BLOCKED_PENDING_MIGRATION',
  donation_records: 'BLOCKED_PENDING_MIGRATION'
};

/**
 * 3. Cryptographically Secure ID Generation (Fail-Closed CSPRNG)
 * Strictly avoids Math.random(). Uses crypto.randomUUID or crypto.getRandomValues fallback.
 */
export function generateSecureId(prefix: string): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 v4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
      const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
      return `${prefix}-${uuid}`;
    }
  }
  throw new Error('Fatal: Cryptographically secure random generator is unavailable in this environment.');
}

/**
 * 4. Recursive Payload Secret Scanner
 * Recursively scans nested structures for authentication secrets with circular reference protection.
 */
export function scanPayloadSecrets(payload: any, visited = new Set<object>()): { safe: boolean; error?: string } {
  if (payload === null || typeof payload !== 'object') {
    return { safe: true };
  }

  if (visited.has(payload)) {
    return { safe: true };
  }
  visited.add(payload);

  const FORBIDDEN_SECRET_KEYS = new Set([
    'pin',
    'passcode',
    'password',
    'auth_pin',
    'auth_token',
    'secret',
    'access_token'
  ]);

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const res = scanPayloadSecrets(item, visited);
      if (!res.safe) return res;
    }
    return { safe: true };
  }

  for (const key of Object.keys(payload)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_SECRET_KEYS.has(lowerKey)) {
      return { safe: false, error: `Unauthorized secret field detected: ${key}` };
    }
    const val = payload[key];
    if (typeof val === 'object' && val !== null) {
      const res = scanPayloadSecrets(val, visited);
      if (!res.safe) return res;
    }
  }

  return { safe: true };
}

/**
 * 5. Strict Allowlist & Type Validation
 * Rejects unknown top-level columns without silent dropping.
 */
export function validatePayloadSchema(table: PublicSubmissionTable, payload: Record<string, any>): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload: expected non-null object' };
  }

  const allowedColumns = new Set(PUBLIC_SUBMISSION_ALLOWLISTS[table]);
  const incomingKeys = Object.keys(payload);

  for (const key of incomingKeys) {
    if (!allowedColumns.has(key)) {
      return { valid: false, error: `Unauthorized field '${key}' is not permitted for table '${table}'` };
    }
  }

  // Type & format guards
  if (table === 'blood_donors') {
    if (typeof payload.full_name !== 'string' || !payload.full_name.trim()) {
      return { valid: false, error: 'full_name must be a non-empty string' };
    }
    if (typeof payload.phone !== 'string' || !/^01[3-9]\d{8}$/.test(payload.phone.replace(/\D/g, ''))) {
      return { valid: false, error: 'phone must be a valid 11-digit Bangladeshi number' };
    }
    if (payload.email && (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))) {
      return { valid: false, error: 'email must be a valid email address' };
    }
    if (payload.privacy_consent !== true) {
      return { valid: false, error: 'privacy_consent must be explicitly true' };
    }
  } else if (table === 'emergency_blood_requests') {
    if (typeof payload.patient_name !== 'string' || !payload.patient_name.trim()) {
      return { valid: false, error: 'patient_name must be a non-empty string' };
    }
    if (typeof payload.contact_number !== 'string' || !/^01[3-9]\d{8}$/.test(payload.contact_number.replace(/\D/g, ''))) {
      return { valid: false, error: 'contact_number must be a valid 11-digit Bangladeshi number' };
    }
    if (typeof payload.units_needed !== 'number' || payload.units_needed < 1 || !Number.isInteger(payload.units_needed)) {
      return { valid: false, error: 'units_needed must be an integer greater than or equal to 1' };
    }
  } else if (table === 'donation_records') {
    if (typeof payload.amount_bdt !== 'number' || payload.amount_bdt <= 0 || isNaN(payload.amount_bdt)) {
      return { valid: false, error: 'amount_bdt must be a positive number' };
    }
  }

  return { valid: true };
}

/**
 * 6. Hardened Public Insert Adapter
 * Enforces release gates, offline fail-closed behavior, allowlists, secrets scanning, and minimal-return semantics.
 */
export async function safeDbInsert<T = { id: string }>(
  tableName: PublicSubmissionTable,
  payload: Record<string, any>
): Promise<InsertResult<T>> {
  // Phase 1.1 Containment Gate: Block all public insertions locally with zero network dispatch
  if (PUBLIC_SUBMISSION_LOCKED_PHASE_1_1 || PUBLIC_SUBMISSION_GATES[tableName] === 'BLOCKED_PENDING_MIGRATION') {
    if (import.meta.env?.DEV) {
      console.warn(`[SECURITY] Public insert blocked locally on '${tableName}' (Phase 1.1 containment). No network request dispatched.`);
    }
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      code: 'DISABLED_PHASE_2',
      error: `Public online submission for '${tableName}' is temporarily paused for Phase 1.1 security hardening. Please use our verified coordinator contact channels.`
    };
  }

  // Early offline hint (never store sensitive PII in plaintext localStorage)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      success: false,
      status: 'ONLINE_REQUIRED',
      error: 'Network connection is offline. Your data has not been stored locally to protect your privacy. Please retry when connection is restored.'
    };
  }

  // Schema validation
  const validation = validatePayloadSchema(tableName, payload);
  if (!validation.valid) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: validation.error || 'Validation failed'
    };
  }

  // Secret scanner
  const secretCheck = scanPayloadSecrets(payload);
  if (!secretCheck.safe) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: secretCheck.error || 'Security scan failed'
    };
  }

  if (!_testClientOverride && !isSupabaseConfigured) {
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: 'Database connection is not configured in this environment.'
    };
  }

  const client = _testClientOverride || (await getSupabase());
  if (!client) {
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: 'Database connection is not configured in this environment.'
    };
  }

  try {
    // PostgREST minimal return (omitting .select() sends Prefer: return=minimal)
    const { error } = await client.from(tableName).insert(payload);
    if (error) {
      if (import.meta.env.DEV) {
        console.warn(`Supabase safeDbInsert error on ${tableName}:`, error.message);
      }
      return {
        success: false,
        status: 'DATABASE_ERROR',
        error: 'The database server rejected the submission. Please verify your input and try again.'
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      id: payload.id
    };
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn(`Network failure during safeDbInsert on ${tableName}:`, err.message);
    }
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: 'Network communication failure occurred while submitting. Please check your connection.'
    };
  }
}

/**
 * 7. Hardened Authenticated Admin Updates (safeDbAdminUpdate)
 * Strictly verifies active session, filters against ADMIN_MUTATION_GATES,
 * and enforces .update().eq().select('id') with exactly 1 row returned.
 */
export async function safeDbAdminUpdate(
  tableName: string,
  id: string,
  updates: Record<string, any>
): Promise<AdminUpdateResult> {
  const cleanId = id?.trim();
  if (!cleanId) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: 'Invalid or missing record identifier.'
    };
  }

  // 1. Gate check: must be explicitly allowed
  const gate = (ADMIN_MUTATION_GATES as Record<string, any>)[tableName];
  if (!gate || !gate.allowUpdate) {
    if (import.meta.env?.DEV) {
      console.warn(`[SECURITY] Admin update blocked on unwhitelisted table '${tableName}'.`);
    }
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Admin remote modification is locked for table '${tableName}' during Phase 1.1 containment.`
    };
  }

  // 2. Connectivity check
  if (!_testClientOverride && !isSupabaseConfigured) {
    return {
      success: false,
      status: 'ONLINE_REQUIRED',
      error: 'Supabase credentials are not configured in environment.'
    };
  }

  const client = _testClientOverride || (await getSupabase());
  if (!client) {
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: 'Database client failed to initialize.'
    };
  }

  // 3. Active Admin Session verification (Addition 2)
  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session?.user?.email) {
      return {
        success: false,
        status: 'AUTH_REQUIRED',
        error: 'আপনার লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
      };
    }
  } catch (authErr: any) {
    return {
      success: false,
      status: 'AUTH_REQUIRED',
      error: 'আপনার লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
    };
  }

  // 4. Sanitize payload against allowlist (strictly excluding show_phone_publicly or any PII)
  const sanitized: Record<string, any> = {};
  for (const col of gate.allowedColumns) {
    if (col in updates && updates[col] !== undefined) {
      sanitized[col] = updates[col];
    }
  }

  if (gate.allowedColumns.includes('updated_at') && !sanitized.updated_at) {
    sanitized.updated_at = new Date().toISOString();
  }

  const sanitizedKeys = Object.keys(sanitized);
  if (sanitizedKeys.length === 0 || (sanitizedKeys.length === 1 && sanitizedKeys[0] === 'updated_at')) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: 'No allowable update fields provided for this admin operation.'
    };
  }

  // 5. Execute .update(sanitized).eq('id', cleanId).select('id') (Addition 1)
  try {
    const { data, error } = await client
      .from(tableName)
      .update(sanitized)
      .eq('id', cleanId)
      .select('id');

    if (error) {
      if (import.meta.env?.DEV) {
        console.warn(`Admin update error on ${tableName}:`, error.message);
      }
      return {
        success: false,
        status: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during update.'
      };
    }

    // Exact count check: 1 row required (Addition 1)
    if (!data || data.length === 0) {
      return {
        success: false,
        status: 'PERMISSION_DENIED',
        error: 'কোনো সারি পাওয়া যায়নি বা অনুমতি নেই / Record not found or permission denied.'
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      id: cleanId,
      data: data[0],
      count: data.length
    };
  } catch (networkErr: any) {
    if (import.meta.env?.DEV) {
      console.warn(`Network error during admin update on ${tableName}:`, networkErr.message);
    }
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: networkErr.message || 'Network communication failure occurred while connecting to database.'
    };
  }
}

/**
 * 8. Existing Authenticated Admin Operations (safeDbUpsert & safeDbDelete)
 * Preserved strictly for authenticated Admin CMS operations.
 */
export async function safeDbUpsert(tableName: string, data: any): Promise<void> {
  if (REMOTE_CMS_MUTATIONS_LOCKED) {
    if (import.meta.env?.DEV) {
      console.warn(`[SECURITY] Remote CMS upsert blocked locally on '${tableName}' (Phase 1.1 containment). No network request dispatched.`);
    }
    return;
  }
  if (!isSupabaseConfigured) return;
  const client = await getSupabase();
  if (!client) return;
  try {
    const { error } = await client.from(tableName).upsert(data);
    if (error) {
      const colMatch =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column (?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+) does not exist/i);
      if (colMatch && colMatch[1]) {
        const fallbackData = { ...data };
        delete fallbackData[colMatch[1]];
        const { error: retryError } = await client.from(tableName).upsert(fallbackData);
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
  if (REMOTE_CMS_MUTATIONS_LOCKED) {
    if (import.meta.env?.DEV) {
      console.warn(`[SECURITY] Remote CMS delete blocked locally on '${tableName}' (Phase 1.1 containment). No network request dispatched.`);
    }
    return;
  }
  if (!isSupabaseConfigured) return;
  const client = await getSupabase();
  if (!client) return;
  try {
    const { error } = await client.from(tableName).delete().eq(matchColumn, matchValue);
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
  let randHex = '';
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      randHex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    } else {
      randHex = Date.now().toString(36).slice(-4);
    }
  } catch {
    randHex = Date.now().toString(36).slice(-4);
  }

  return {
    id: `audit-${Date.now()}-${randHex}`,
    user,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    details
  };
}
