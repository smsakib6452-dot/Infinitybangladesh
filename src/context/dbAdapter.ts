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

export type CmsAllowedTable =
  | 'site_settings'
  | 'homepage_config'
  | 'programs'
  | 'campaigns';

export const ADMIN_CMS_MUTATION_GATES: Record<CmsAllowedTable, 'ACTIVE' | 'BLOCKED'> = Object.freeze({
  site_settings: 'ACTIVE',
  homepage_config: 'ACTIVE',
  programs: 'ACTIVE',
  campaigns: 'ACTIVE'
});

export const CMS_FORBIDDEN_TABLES = Object.freeze(new Set([
  'blood_donors',
  'emergency_blood_requests',
  'volunteer_applications',
  'contact_messages',
  'donation_records',
  'admin_profiles',
  'audit_logs'
]));

/**
 * Live Database information_schema Column Allowlists for Phase 1 CMS tables
 * Strictly matches verified PostgreSQL table columns.
 */
export const CMS_TABLE_ALLOWLISTS: Record<CmsAllowedTable, readonly string[]> = Object.freeze({
  site_settings: Object.freeze([
    'id',
    'organization_name',
    'team_identity',
    'tagline',
    'country',
    'official_address',
    'official_phone',
    'official_email',
    'established_year',
    'logo_url',
    'favicon_url',
    'bkash_number',
    'nagad_number',
    'bank_details',
    'banner_announcement',
    'show_announcement_banner',
    'maintenance_mode',
    'default_language',
    'registration_info',
    'created_at',
    'updated_at'
  ]),
  homepage_config: Object.freeze([
    'id',
    'hero',
    'about_preview',
    'volunteer_banner',
    'support_banner',
    'section_order',
    'section_visibility',
    'updated_at'
  ]),
  programs: Object.freeze([
    'id',
    'slug',
    'title',
    'category',
    'short_description',
    'full_details',
    'impact_highlights',
    'image_url',
    'icon_name',
    'status',
    'display_order',
    'created_at',
    'updated_at'
  ]),
  campaigns: Object.freeze([
    'id',
    'slug',
    'title',
    'date',
    'end_date',
    'location',
    'category',
    'description',
    'details',
    'objectives',
    'activities',
    'beneficiaries',
    'beneficiaries_count',
    'volunteers_count',
    'impact',
    'status',
    'is_featured',
    'target_amount_bdt',
    'raised_amount_bdt',
    'image_url',
    'gallery_images',
    'video_url',
    'report_url',
    'display_order',
    'created_at',
    'updated_at'
  ])
});

/**
 * Sensitive financial & official contact fields requiring explicit admin confirmation
 */
export const CMS_SENSITIVE_FIELDS: Record<string, readonly string[]> = Object.freeze({
  site_settings: Object.freeze([
    'bkash_number',
    'nagad_number',
    'bank_details',
    'official_phone',
    'official_email'
  ])
});

/**
 * Structural deep equality comparison (key-order independent for objects).
 */
export function isCmsDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isCmsDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if (!isCmsDeepEqual(objA[key], objB[key])) return false;
  }
  return true;
}

/**
 * Canonical predicate determining whether a sensitive column actually changed.
 * Returns true iff the field is being written in `payload` AND either:
 * - action is CREATE, or the current DB row / field value is unknown (fail-closed), OR
 * - payload[field] differs from currentDbRow[field] under isCmsDeepEqual.
 * Independent of draft.changedFields so a stale/truncated changedFields array can never bypass confirmation.
 */
export function isSensitiveFieldChanged(
  field: string,
  payload: Record<string, any> | null | undefined,
  currentDbRow?: Record<string, any> | null,
  action: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE'
): boolean {
  if (action === 'DELETE') return false;
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, field) || payload[field] === undefined) {
    return false;
  }
  if (action === 'CREATE' || !currentDbRow || !Object.prototype.hasOwnProperty.call(currentDbRow, field)) {
    return true;
  }
  return !isCmsDeepEqual(currentDbRow[field], payload[field]);
}

export type AdminCmsMutationResult<T = { id: string }> =
  | { success: true; status: 'SUCCESS'; id: string; data?: T; count: number; changedSensitiveFields?: string[] }
  | { success: false; status: 'AUTH_REQUIRED'; error: string; code?: string }
  | { success: false; status: 'FEATURE_DISABLED'; error: string; code?: string }
  | { success: false; status: 'VALIDATION_FAILED'; error: string; code?: string }
  | { success: false; status: 'CONFLICT'; error: string; code: 'CONFLICT'; currentUpdatedAt?: string }
  | { success: false; status: 'PERMISSION_DENIED_OR_NOT_FOUND'; error: string; code: 'PERMISSION_DENIED_OR_NOT_FOUND' }
  | { success: false; status: 'DATABASE_ERROR'; error: string; code?: string }
  | { success: false; status: 'ONLINE_REQUIRED'; error: string; code?: string };

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
  | { success: false; status: 'RATE_LIMITED'; error: string; code?: string }
  | { success: false; status: 'DATABASE_ERROR'; error: string; code?: string }
  | { success: false; status: 'ONLINE_REQUIRED'; error: string; code?: string }
  | { success: false; status: 'FEATURE_DISABLED'; error: string; code?: string }
  | { success: false; status: 'DISABLED_PHASE_2'; error: string; code?: string };

export const VALID_BLOOD_GROUPS = Object.freeze(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const);

export function normalizeBdPhoneNumber(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('008801') && digits.length === 15) {
    return '0' + digits.slice(5);
  }
  if (digits.startsWith('8801') && digits.length === 13) {
    return '0' + digits.slice(3);
  }
  return digits;
}

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getEmergencyRequiredDateBounds(referenceDate: Date = new Date()): { min: string; max: string } {
  const minDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - 2);
  const maxDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 30);
  return {
    min: formatLocalYmd(minDate),
    max: formatLocalYmd(maxDate)
  };
}

export function isValidIsoCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
}

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
  emergency_blood_requests: 'ACTIVE',
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
    'access_token',
    'api_key',
    'apikey',
    'service_role'
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
    if (
      typeof payload.requester_name !== 'string' ||
      payload.requester_name.trim().length < 1 ||
      payload.requester_name.trim().length > 120
    ) {
      return { valid: false, error: 'requester_name must be a non-empty string up to 120 characters' };
    }
    if (
      typeof payload.patient_name !== 'string' ||
      payload.patient_name.trim().length < 1 ||
      payload.patient_name.trim().length > 120
    ) {
      return { valid: false, error: 'patient_name must be a non-empty string up to 120 characters' };
    }
    if (typeof payload.contact_number !== 'string' || !/^01[3-9]\d{8}$/.test(payload.contact_number.replace(/\D/g, ''))) {
      return { valid: false, error: 'contact_number must be a valid 11-digit Bangladeshi number' };
    }
    if (
      typeof payload.blood_group !== 'string' ||
      !(VALID_BLOOD_GROUPS as readonly string[]).includes(payload.blood_group)
    ) {
      return { valid: false, error: 'blood_group must be a valid blood group' };
    }
    if (
      typeof payload.units_needed !== 'number' ||
      !Number.isInteger(payload.units_needed) ||
      payload.units_needed < 1 ||
      payload.units_needed > 10
    ) {
      return { valid: false, error: 'units_needed must be an integer between 1 and 10' };
    }
    if (
      typeof payload.hospital_name !== 'string' ||
      payload.hospital_name.trim().length < 2 ||
      payload.hospital_name.trim().length > 150
    ) {
      return { valid: false, error: 'hospital_name must be between 2 and 150 characters' };
    }
    if (
      typeof payload.emergency_level !== 'string' ||
      payload.emergency_level.trim().length < 1 ||
      payload.emergency_level.trim().length > 20
    ) {
      return { valid: false, error: 'emergency_level must be a non-empty string up to 20 characters' };
    }
    if (typeof payload.required_date !== 'string' || !isValidIsoCalendarDate(payload.required_date.trim())) {
      return { valid: false, error: 'required_date must be a valid YYYY-MM-DD date' };
    }
    const reqDateBounds = getEmergencyRequiredDateBounds();
    const trimmedDate = payload.required_date.trim();
    if (trimmedDate < reqDateBounds.min || trimmedDate > reqDateBounds.max) {
      return { valid: false, error: 'required_date must be within 2 days ago to 30 days ahead' };
    }
    if (
      payload.additional_notes !== undefined &&
      payload.additional_notes !== null &&
      (typeof payload.additional_notes !== 'string' || payload.additional_notes.length > 500)
    ) {
      return { valid: false, error: 'additional_notes must be a string up to 500 characters' };
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
      const pgCode = String((error as any).code || '').trim();
      const pgHint = String((error as any).hint || '').trim();
      const pgDetails = String((error as any).details || '').trim();
      const pgMsg = String((error as any).message || '').trim();
      const marker = `${pgCode} ${pgHint} ${pgDetails} ${pgMsg}`.toUpperCase();

      if (import.meta.env.DEV) {
        console.warn(`Supabase safeDbInsert error on ${tableName}:`, pgCode || 'UNKNOWN');
      }

      if (tableName === 'emergency_blood_requests') {
        if (pgCode === 'P0001' || marker.includes('EMERGENCY_PHONE_RATE_LIMIT')) {
          return {
            success: false,
            status: 'RATE_LIMITED',
            code: 'EMERGENCY_PHONE_RATE_LIMIT',
            error: 'Too many emergency requests were submitted from this number recently. Please wait before trying again or call our helpline directly.'
          };
        }
        if (
          pgCode === '22007' ||
          marker.includes('EMERGENCY_DATE_OUT_OF_RANGE') ||
          marker.includes('EMERGENCY_INVALID_DATE')
        ) {
          return {
            success: false,
            status: 'VALIDATION_FAILED',
            code:
              pgCode === '22007' || marker.includes('EMERGENCY_INVALID_DATE')
                ? 'EMERGENCY_INVALID_DATE'
                : 'EMERGENCY_DATE_OUT_OF_RANGE',
            error: 'Required date is invalid or outside the allowed window (from 2 days ago up to 30 days ahead).'
          };
        }
        if (pgCode === '23514') {
          return {
            success: false,
            status: 'VALIDATION_FAILED',
            code: '23514',
            error: 'Some fields did not satisfy database limits (units 1–10, phone format, or text length). Please review your entries.'
          };
        }
        if (pgCode === '42501') {
          return {
            success: false,
            status: 'DATABASE_ERROR',
            code: '42501',
            error: 'Database permission check blocked the submission. Please retry or call our helpline directly.'
          };
        }
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
 * 8. Guarded Authenticated Admin CMS Primitives (Phase 1)
 * Enforces ADMIN_CMS_MUTATION_GATES, live schema allowlists, session verification,
 * secret scanning, 1-row verification, and atomic conditional concurrency protection.
 */

/**
 * Creates a new CMS record (strictly for programs and campaigns; forbidden on single-row tables)
 */
export async function safeDbAdminCreate<T = { id: string }>(
  tableName: CmsAllowedTable | string,
  payload: Record<string, any>
): Promise<AdminCmsMutationResult<T>> {
  // 1. Forbidden & unwhitelisted table check
  if (CMS_FORBIDDEN_TABLES.has(tableName)) {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Table '${tableName}' is strictly forbidden from CMS mutations.`
    };
  }

  const gateStatus = (ADMIN_CMS_MUTATION_GATES as Record<string, string>)[tableName];
  if (gateStatus !== 'ACTIVE') {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Admin CMS mutation is locked or unwhitelisted for table '${tableName}'.`
    };
  }

  // 2. Single-row table check: site_settings and homepage_config are single-row (id='default')
  if (tableName === 'site_settings' || tableName === 'homepage_config') {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Creating new rows is forbidden on single-row configuration table '${tableName}'.`
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: 'Invalid payload provided for creation.'
    };
  }

  // 3. Connectivity check
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

  // 4. Session check
  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session?.user?.email) {
      return {
        success: false,
        status: 'AUTH_REQUIRED',
        error: 'আপনার সক্রিয় অ্যাডমিন লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
      };
    }
  } catch {
    return {
      success: false,
      status: 'AUTH_REQUIRED',
      error: 'আপনার সক্রিয় অ্যাডমিন লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
    };
  }

  // 5. Secret scan
  const secretScan = scanPayloadSecrets(payload);
  if (!secretScan.safe) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: secretScan.error || 'Unauthorized secrets detected in payload.'
    };
  }

  // 6. Whitelist filtering
  const allowlist = CMS_TABLE_ALLOWLISTS[tableName as CmsAllowedTable];
  const sanitized: Record<string, any> = {};
  for (const col of allowlist) {
    if (col in payload && payload[col] !== undefined) {
      sanitized[col] = payload[col];
    }
  }

  if (!sanitized.id || typeof sanitized.id !== 'string' || !sanitized.id.trim()) {
    sanitized.id = generateSecureId(tableName);
  } else {
    sanitized.id = sanitized.id.trim();
  }

  const now = new Date().toISOString();
  if (allowlist.includes('created_at') && !sanitized.created_at) {
    sanitized.created_at = now;
  }
  if (allowlist.includes('updated_at') && !sanitized.updated_at) {
    sanitized.updated_at = now;
  }

  // 7. Insert with .select('id')
  try {
    const { data, error } = await client
      .from(tableName)
      .insert(sanitized)
      .select('id');

    if (error) {
      if (import.meta.env?.DEV) console.warn(`Admin CMS insert error on ${tableName}:`, error.message);
      return {
        success: false,
        status: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during CMS insert.'
      };
    }

    if (!data || data.length !== 1) {
      return {
        success: false,
        status: 'PERMISSION_DENIED_OR_NOT_FOUND',
        code: 'PERMISSION_DENIED_OR_NOT_FOUND',
        error: 'রেকর্ড সন্নিবেশে কোনো সারি নিশ্চিত করা যায়নি / Failed to confirm inserted row.'
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      id: data[0].id,
      data: data[0] as T,
      count: data.length
    };
  } catch (networkErr: any) {
    if (import.meta.env?.DEV) console.warn(`Network error during admin CMS insert on ${tableName}:`, networkErr.message);
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: networkErr.message || 'Network communication failure occurred while connecting to database.'
    };
  }
}

/**
 * Updates a CMS record (site_settings, homepage_config, programs, campaigns)
 * Enforces single-row constraint for config tables, strips id and created_at,
 * tracks sensitive fields, and performs single-request atomic conditional concurrency check.
 */
export async function safeDbAdminCmsUpdate<T = { id: string }>(
  tableName: CmsAllowedTable | string,
  id: string,
  updates: Record<string, any>,
  expectedUpdatedAt?: string | null,
  currentDbRow?: Record<string, any> | null
): Promise<AdminCmsMutationResult<T>> {
  const cleanId = id?.trim();
  if (!cleanId) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: 'Invalid or missing record identifier.'
    };
  }

  // 1. Forbidden & unwhitelisted table check
  if (CMS_FORBIDDEN_TABLES.has(tableName)) {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Table '${tableName}' is strictly forbidden from CMS mutations.`
    };
  }

  const gateStatus = (ADMIN_CMS_MUTATION_GATES as Record<string, string>)[tableName];
  if (gateStatus !== 'ACTIVE') {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Admin CMS mutation is locked or unwhitelisted for table '${tableName}'.`
    };
  }

  // 2. Single-row table check: site_settings and homepage_config only permit id='default'
  if ((tableName === 'site_settings' || tableName === 'homepage_config') && cleanId !== 'default') {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: `Single-row configuration table '${tableName}' only permits updating id 'default'.`
    };
  }

  if (!updates || typeof updates !== 'object') {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: 'Invalid updates payload provided.'
    };
  }

  // 3. Connectivity check
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

  // 4. Session check
  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session?.user?.email) {
      return {
        success: false,
        status: 'AUTH_REQUIRED',
        error: 'আপনার সক্রিয় অ্যাডমিন লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
      };
    }
  } catch {
    return {
      success: false,
      status: 'AUTH_REQUIRED',
      error: 'আপনার সক্রিয় অ্যাডমিন লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
    };
  }

  // 5. Secret scan
  const secretScan = scanPayloadSecrets(updates);
  if (!secretScan.safe) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: secretScan.error || 'Unauthorized secrets detected in payload.'
    };
  }

  // 6. Whitelist filtering (never allow id or created_at in update payload)
  const allowlist = CMS_TABLE_ALLOWLISTS[tableName as CmsAllowedTable];
  const sanitized: Record<string, any> = {};
  for (const col of allowlist) {
    if (col === 'id' || col === 'created_at') continue; // strictly stripped from update
    if (col in updates && updates[col] !== undefined) {
      sanitized[col] = updates[col];
    }
  }

  if (allowlist.includes('updated_at') && !sanitized.updated_at) {
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

  // 7. Track sensitive fields using canonical DB comparison (same predicate as publish engine & modal)
  const sensitiveList = CMS_SENSITIVE_FIELDS[tableName] || [];
  const changedSensitiveFields: string[] = [];
  for (const field of sensitiveList) {
    if (isSensitiveFieldChanged(field, sanitized, currentDbRow, 'UPDATE')) {
      changedSensitiveFields.push(field);
    }
  }

  // 8. Atomic conditional update
  try {
    let query = client.from(tableName).update(sanitized).eq('id', cleanId);
    if (expectedUpdatedAt) {
      query = query.eq('updated_at', expectedUpdatedAt);
    }
    const { data, error } = await query.select('id');

    if (error) {
      if (import.meta.env?.DEV) console.warn(`Admin CMS update error on ${tableName}:`, error.message);
      return {
        success: false,
        status: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during CMS update.'
      };
    }

    if (!data || data.length === 0) {
      if (expectedUpdatedAt) {
        try {
          const { data: existing, error: checkError } = await client
            .from(tableName)
            .select('id, updated_at')
            .eq('id', cleanId)
            .maybeSingle();

          if (!checkError && existing) {
            return {
              success: false,
              status: 'CONFLICT',
              code: 'CONFLICT',
              currentUpdatedAt: existing.updated_at,
              error: 'ডাটাবেজে তথ্য ইতিমধ্যে অন্য সেশন থেকে পরিবর্তিত হয়েছে (Conflict: row updated_at mismatch).'
            };
          }
        } catch {
          // ignore counter-read failure
        }
      }

      return {
        success: false,
        status: 'PERMISSION_DENIED_OR_NOT_FOUND',
        code: 'PERMISSION_DENIED_OR_NOT_FOUND',
        error: 'কোনো সারি পাওয়া যায়নি বা অনুমতির সীমাবদ্ধতা রয়েছে / Record not found or permission denied.'
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      id: cleanId,
      data: data[0] as T,
      count: data.length,
      changedSensitiveFields: changedSensitiveFields.length > 0 ? changedSensitiveFields : undefined
    };
  } catch (networkErr: any) {
    if (import.meta.env?.DEV) console.warn(`Network error during admin CMS update on ${tableName}:`, networkErr.message);
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: networkErr.message || 'Network communication failure occurred while connecting to database.'
    };
  }
}

/**
 * Deletes a CMS record (strictly for programs and campaigns; forbidden on single-row tables)
 * Supports atomic conditional deletion via expectedUpdatedAt.
 */
export async function safeDbAdminCmsDelete<T = { id: string }>(
  tableName: CmsAllowedTable | string,
  id: string,
  expectedUpdatedAt?: string | null
): Promise<AdminCmsMutationResult<T>> {
  const cleanId = id?.trim();
  if (!cleanId) {
    return {
      success: false,
      status: 'VALIDATION_FAILED',
      error: 'Invalid or missing record identifier.'
    };
  }

  // 1. Forbidden & unwhitelisted table check
  if (CMS_FORBIDDEN_TABLES.has(tableName)) {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Table '${tableName}' is strictly forbidden from CMS mutations.`
    };
  }

  const gateStatus = (ADMIN_CMS_MUTATION_GATES as Record<string, string>)[tableName];
  if (gateStatus !== 'ACTIVE') {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Admin CMS mutation is locked or unwhitelisted for table '${tableName}'.`
    };
  }

  // 2. Single-row table check: site_settings and homepage_config can NEVER be deleted
  if (tableName === 'site_settings' || tableName === 'homepage_config') {
    return {
      success: false,
      status: 'FEATURE_DISABLED',
      error: `Deleting rows is forbidden on single-row configuration table '${tableName}'.`
    };
  }

  // 3. Connectivity check
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

  // 4. Session check
  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session?.user?.email) {
      return {
        success: false,
        status: 'AUTH_REQUIRED',
        error: 'আপনার সক্রিয় অ্যাডমিন লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
      };
    }
  } catch {
    return {
      success: false,
      status: 'AUTH_REQUIRED',
      error: 'আপনার সক্রিয় অ্যাডমিন লগইন সেশন নেই, আবার সাইন ইন করুন / No active admin session. Please sign in again.'
    };
  }

  // 5. Atomic conditional delete
  try {
    let query = client.from(tableName).delete().eq('id', cleanId);
    if (expectedUpdatedAt) {
      query = query.eq('updated_at', expectedUpdatedAt);
    }
    const { data, error } = await query.select('id');

    if (error) {
      if (import.meta.env?.DEV) console.warn(`Admin CMS delete error on ${tableName}:`, error.message);
      return {
        success: false,
        status: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during CMS delete.'
      };
    }

    if (!data || data.length === 0) {
      if (expectedUpdatedAt) {
        try {
          const { data: existing, error: checkError } = await client
            .from(tableName)
            .select('id, updated_at')
            .eq('id', cleanId)
            .maybeSingle();

          if (!checkError && existing) {
            return {
              success: false,
              status: 'CONFLICT',
              code: 'CONFLICT',
              currentUpdatedAt: existing.updated_at,
              error: 'ডাটাবেজে তথ্য ইতিমধ্যে অন্য সেশন থেকে পরিবর্তিত হয়েছে (Conflict: row updated_at mismatch).'
            };
          }
        } catch {
          // ignore counter-read failure
        }
      }

      return {
        success: false,
        status: 'PERMISSION_DENIED_OR_NOT_FOUND',
        code: 'PERMISSION_DENIED_OR_NOT_FOUND',
        error: 'কোনো সারি মুছে ফেলা যায়নি বা অনুমতির সীমাবদ্ধতা রয়েছে / Record not found or permission denied.'
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      id: cleanId,
      data: data[0] as T,
      count: data.length
    };
  } catch (networkErr: any) {
    if (import.meta.env?.DEV) console.warn(`Network error during admin CMS delete on ${tableName}:`, networkErr.message);
    return {
      success: false,
      status: 'DATABASE_ERROR',
      error: networkErr.message || 'Network communication failure occurred while connecting to database.'
    };
  }
}

/**
 * 9. Existing Authenticated Admin Operations (safeDbUpsert & safeDbDelete)
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
