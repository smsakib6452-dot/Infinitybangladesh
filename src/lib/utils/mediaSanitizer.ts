/**
 * Media Sanitization and Object URL Lifecycle Manager
 * Ensures only verified permanent URLs reach persistent storage and manages transient object URLs safely.
 */

// Exact whitelist of 66 verified physical image assets in public/
export const VERIFIED_LOCAL_ASSET_PATHS = new Set<string>([
  '/brand/infinity-favicon.png',
  '/brand/Infinitylifeline-logo.svg',
  '/brand/infinity-logo.png',
  '/brand/infi-robot.jpg',
  '/brand/infi-robot.png',
  '/brand/infi-robot-backup.png',
  '/images/events/winter-warmth.jpg',
  '/images/fb-image-1.jpg',
  '/images/infinity-cover-hero.jpg',
  '/images/members/exec-10-kaisar-ahmed-irfan.png',
  '/images/members/exec-10-md-sojib-miah.png',
  '/images/members/exec-11-md-foysal-ahmed.png',
  '/images/members/exec-11-md-ismail-nur-sakib.png',
  '/images/members/exec-12-md-arfat.png',
  '/images/members/exec-12-md-jahidul-islam.png',
  '/images/members/exec-13-kaisar-ahmed-ovi.png',
  '/images/members/exec-13-md-mehedi-hasan.png',
  '/images/members/exec-14-munmun-banik.png',
  '/images/members/exec-14-saiful-islam.png',
  '/images/members/exec-15-md-al-amin.png',
  '/images/members/exec-15-md-shahadad-alam.png',
  '/images/members/exec-16-md-mehedi-hasan.png',
  '/images/members/exec-16-md-shakil-ahmed.png',
  '/images/members/exec-17-sumaiya-akter.png',
  '/images/members/exec-17-sumaya-imroz.png',
  '/images/members/exec-18-fatema-tuz-zohra.png',
  '/images/members/exec-18-shanzida-sharmin.png',
  '/images/members/exec-19-dipa-shil.png',
  '/images/members/exec-19-nusrat-jahan.png',
  '/images/members/exec-1-md-shahidul-alam-sakib.png',
  '/images/members/exec-20-md-nazmul-huq.png',
  '/images/members/exec-20-refat-sharif.png',
  '/images/members/exec-21-md-ramjan.png',
  '/images/members/exec-21-md-rifat-hossain.png',
  '/images/members/exec-22-md-maruf-hossain.png',
  '/images/members/exec-22-susmita-rani-nath.png',
  '/images/members/exec-23-md-rashedul-islam.png',
  '/images/members/exec-23-tanvir-rana-riyad.png',
  '/images/members/exec-24-joy-nath.png',
  '/images/members/exec-25-rakibul-karim.png',
  '/images/members/exec-26-tanjit-hossen.png',
  '/images/members/exec-27-azizur-rahman.png',
  '/images/members/exec-2-mohammad-ismail.png',
  '/images/members/exec-3-joinul-abedin.png',
  '/images/members/exec-4-sohel-akram-sobuj.png',
  '/images/members/exec-5-salimur-rahman-opi.png',
  '/images/members/exec-6-anayet-ullah-farhad.png',
  '/images/members/exec-6-tanveer-islam.png',
  '/images/members/exec-7-md-niaj-udden-sakib.png',
  '/images/members/exec-7-saif-ahmed.png',
  '/images/members/exec-8-md-monzurul-islam.png',
  '/images/members/exec-8-reaz-uddin.png',
  '/images/members/exec-9-shahadat-islam.png',
  '/images/members/exec-9-sharif-uddin.png',
  '/images/members/sc-1-sakib-al-karim.png',
  '/images/members/sc-2-tamimul-hasib-rimad.png',
  '/images/members/sc-3-shifat-sattar.png',
  '/images/members/sc-4-ishtiaqe-ahmed.png',
  '/images/members/sc-5-chaity-debi-piya.png',
  '/images/members/sc-6-rakib-ahmed.png',
  '/images/members/sc-7-md-ashraful-islam.png',
  '/images/members/sc-8-tanveer-haidar-rakib.png',
  '/images/members/sc-9-md-arshad.png',
  '/images/winter-warmth.jpg',
  '/reference/executive-committee-2026.png',
  '/reference/standing-committee-poster.png'
]);

/**
 * Validates whether a candidate IP address is a private, loopback, link-local,
 * multicast, broadcast, or reserved non-public address.
 */
function isPrivateOrReservedIp(hostname: string): boolean {
  // Strip bracket enclosure if IPv6 literal
  const cleanHost = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  // IPv4 exact or range check
  const ipv4Match = cleanHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = [
      parseInt(ipv4Match[1], 10),
      parseInt(ipv4Match[2], 10),
      parseInt(ipv4Match[3], 10),
      parseInt(ipv4Match[4], 10)
    ];

    if (octets.some(o => o > 255)) return true; // Invalid IPv4 -> reject

    // Loopback: 127.0.0.0/8
    if (octets[0] === 127) return true;
    // Private Class A: 10.0.0.0/8
    if (octets[0] === 10) return true;
    // Private Class B: 172.16.0.0/12
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    // Private Class C: 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) return true;
    // Link-local: 169.254.0.0/16
    if (octets[0] === 169 && octets[1] === 254) return true;
    // Unspecified / broadcast / multicast / future: 0.0.0.0/8, 224.0.0.0/4, 240.0.0.0/4, 255.255.255.255
    if (octets[0] === 0 || octets[0] >= 224) return true;

    return false;
  }

  // IPv6 checks
  if (cleanHost.includes(':')) {
    // Loopback / unspecified
    if (cleanHost === '::1' || cleanHost === '::') return true;
    // IPv6 mapped IPv4: ::ffff:127.0.0.1 etc.
    if (cleanHost.startsWith('::ffff:')) {
      const embeddedIpv4 = cleanHost.substring(7);
      return isPrivateOrReservedIp(embeddedIpv4);
    }
    // Link-local: fe80::/10
    if (/^fe[89ab]/i.test(cleanHost)) return true;
    // Unique local (ULA): fc00::/7 (fc00:: to fdff::)
    if (/^f[cd]/i.test(cleanHost)) return true;
    // Multicast: ff00::/8
    if (/^ff/i.test(cleanHost)) return true;

    return true; // Any other IPv6 address literal should not be used as public asset host
  }

  // Decimal/hex/octal integer IPv4 representations (e.g., 2130706433)
  if (/^\d+$/.test(cleanHost)) return true;

  return false;
}

/**
 * Validates that a candidate string is a permanent, persistent media URL.
 * Accepts:
 * - Exact verified physical assets from VERIFIED_LOCAL_ASSET_PATHS.
 * - Public remote HTTPS URLs with valid public hostnames.
 * Rejects:
 * - blob: URLs, data: URLs, javascript:, file:, ftp:, etc.
 * - Leading/trailing whitespace or invisible Unicode/control characters.
 * - Embedded credentials (username:password).
 * - Non-standard ports.
 * - localhost, internal hostnames, and private/loopback/link-local/multicast IP literals.
 */
export function isValidPermanentUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;

  // Strict check: No leading or trailing whitespace allowed (fail-closed, no silent trimming)
  if (url !== url.trim()) return false;
  if (!url) return false;

  // Reject control characters and invisible Unicode characters
  if (/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/.test(url)) return false;

  // Explicitly reject blob: and data: prefixes
  if (/^(blob|data):/i.test(url)) return false;

  // Check verified local repository asset paths
  if (url.startsWith('/')) {
    // Prevent protocol-relative URLs (//example.com)
    if (url.startsWith('//')) return false;
    // Disallow directory traversal
    if (url.includes('..')) return false;
    // Must be in the verified whitelist
    return VERIFIED_LOCAL_ASSET_PATHS.has(url);
  }

  // Remote URL validation
  try {
    const parsed = new URL(url);

    // Protocol must strictly be https:
    if (parsed.protocol !== 'https:') return false;

    // Disallow embedded credentials
    if (parsed.username || parsed.password) return false;

    // Disallow non-standard ports
    if (parsed.port && parsed.port !== '443') return false;

    const host = parsed.hostname.toLowerCase();

    // Reject localhost and local domain patterns
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      !host.includes('.')
    ) {
      return false;
    }

    // Reject private, loopback, or reserved IP literals
    if (isPrivateOrReservedIp(host)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a media field update while protecting existing valid permanent URLs.
 * 
 * Rules:
 * - If candidate is omitted (undefined): preserve existing.
 * - If candidate is explicit null or empty string:
 *     - If required: preserve existing valid permanent URL.
 *     - If optional: accept null/empty to clear the field.
 * - If candidate is invalid (e.g., transient blob:, data:, malformed):
 *     - Preserve existing valid permanent URL (do NOT overwrite with invalid input or synthetic placeholder).
 * - If candidate is valid permanent URL: accept candidate.
 */
export function resolveMediaFieldUpdate<T extends string | null | undefined>(
  existingUrl: T,
  candidateUrl: unknown,
  isRequired = false
): string | (T extends null ? null : undefined) {
  // Property omitted or explicitly undefined -> preserve existing
  if (candidateUrl === undefined) {
    return existingUrl as any;
  }

  // Explicit null or empty string
  if (candidateUrl === null || candidateUrl === '') {
    if (isRequired) {
      // Required field cannot be cleared; preserve existing if valid
      return (isValidPermanentUrl(existingUrl) ? existingUrl : '') as any;
    }
    // Optional field can be explicitly cleared
    return (candidateUrl === null ? null : '') as any;
  }

  // Candidate is a valid permanent URL -> accept
  if (isValidPermanentUrl(candidateUrl)) {
    return candidateUrl as string;
  }

  // Candidate is invalid (blob:, data:, malformed, etc.) -> fail closed, preserve existing valid URL
  if (isValidPermanentUrl(existingUrl)) {
    return existingUrl as any;
  }

  // Both candidate and existing are invalid; return safe empty fallback according to requirement
  return (isRequired ? '' : (candidateUrl === null ? null : '')) as any;
}

/**
 * Sanitizes an array of media URLs (e.g. campaigns.galleryImages),
 * filtering out any transient blob/data or invalid URLs while preserving
 * valid permanent URLs.
 */
export function sanitizeMediaUrlArray(
  existingArray: string[] | undefined,
  candidateArray: unknown
): string[] {
  if (!candidateArray || !Array.isArray(candidateArray)) {
    return Array.isArray(existingArray)
      ? existingArray.filter(isValidPermanentUrl)
      : [];
  }

  const sanitized = candidateArray.filter(isValidPermanentUrl);
  return sanitized;
}

/**
 * Deterministic Object URL Lifecycle Manager.
 * Allocates preview object URLs for interactive UI components (crop/preview modals)
 * and guarantees revocation of prior URLs upon replacement, close, or component unmount.
 */
export class ObjectURLManager {
  private activeUrl: string | null = null;

  private revokeAndClear(): void {
    if (this.activeUrl) {
      const urlToRevoke = this.activeUrl;
      this.activeUrl = null;
      if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try {
          URL.revokeObjectURL(urlToRevoke);
        } catch (err) {
          if (typeof console !== 'undefined') {
            console.warn('[ObjectURLManager] Error revoking object URL:', err);
          }
        }
      }
    }
  }

  /**
   * Allocates a new object URL for the provided File or Blob.
   * Revokes the previously active object URL before allocation.
   */
  allocate(file: File | Blob): string {
    this.revokeAndClear();
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        this.activeUrl = URL.createObjectURL(file);
        return this.activeUrl;
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.error('[ObjectURLManager] Allocation failed:', err);
        }
        return '';
      }
    }
    return '';
  }

  /**
   * Replaces the currently active object URL with a new one.
   * Delegates to allocate() to ensure idempotent revocation.
   */
  replace(file: File | Blob): string {
    return this.allocate(file);
  }

  /**
   * Closes and revokes the active object URL.
   * Idempotent on repeated calls.
   */
  close(): void {
    this.revokeAndClear();
  }

  /**
   * Alias for component unmount hooks.
   */
  unmount(): void {
    this.revokeAndClear();
  }

  /**
   * Returns the currently active object URL, or null if none is allocated.
   */
  getActiveUrl(): string | null {
    return this.activeUrl;
  }
}

