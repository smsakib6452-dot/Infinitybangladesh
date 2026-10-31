/**
 * Automated Verification & Regression Test Suite for Infinity Bangladesh
 * Run with: npm test (via tsx scripts/test-runner.ts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

async function runTestSuite() {
  console.log('\n🧪 ========================================================');
  console.log('   INFINITY BANGLADESH — AUTOMATED REGRESSION SUITE');
  console.log('   ========================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Routing & Canonical URL Generation (Link getHref)
  // --------------------------------------------------------------------------
  console.log('📌 [Suite 1: Routing & Clean Canonical URLs]');
  const { getHref } = await import('../src/components/Link');

  assert(getHref() === '/', 'getHref(undefined) resolves to clean root "/"');
  assert(getHref('home') === '/', 'getHref("home") resolves to clean root "/"');
  assert(getHref('blood-donation') === '/blood-donation', 'getHref("blood-donation") resolves to "/blood-donation"');
  assert(getHref('#/blood-donation') === '/blood-donation', 'getHref("#/blood-donation") strips legacy hash to "/blood-donation"');
  assert(getHref('donate') === '/donate', 'getHref("donate") resolves to "/donate"');
  assert(getHref('volunteer') === '/volunteer', 'getHref("volunteer") resolves to "/volunteer"');
  assert(
    getHref('campaigns/detail', 'winter-aid-2026') === '/campaigns/winter-aid-2026',
    'getHref("campaigns/detail", slug) generates parameterized clean path "/campaigns/winter-aid-2026"'
  );
  assert(
    getHref('programs/detail', 'child-education') === '/programs/child-education',
    'getHref("programs/detail", slug) generates parameterized clean path "/programs/child-education"'
  );
  assert(
    getHref('gallery', 'flood-2024') === '/gallery?event=flood-2024',
    'getHref("gallery", slug) preserves clean query parameters'
  );
  assert(
    getHref('https://facebook.com/infinitybangladesh') === 'https://facebook.com/infinitybangladesh',
    'External URLs are safely preserved without modification'
  );

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Bilingual SEO Metadata & Social Sharing Tags
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 2: Bilingual SEO Metadata Coverage]');
  const { ROUTE_METADATA } = await import('../src/lib/seo');

  const requiredRoutes = [
    'home',
    'blood-donation',
    'blood-donation/emergency-request',
    'blood-donation/become-donor',
    'blood-donation/find-donor',
    'donate',
    'volunteer',
    'transparency',
    'campaigns',
    'programs',
    'about',
    'team',
    'contact',
    'faq',
    'privacy',
    'terms'
  ];

  for (const route of requiredRoutes) {
    const meta = ROUTE_METADATA[route];
    assert(
      Boolean(meta && meta.title?.en && meta.title?.bn),
      `Route "${route}" provides complete English & Bengali titles`
    );
    assert(
      Boolean(meta && meta.description?.en && meta.description?.bn),
      `Route "${route}" provides complete English & Bengali meta descriptions`
    );
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Sitemap Crawlability & Zero-Hash Verification
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 3: Sitemap Compliance & Search Crawler Audit]');
  const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  assert(!sitemapContent.includes('/#/'), 'public/sitemap.xml has ZERO legacy "/#/" hash fragments');
  assert(sitemapContent.includes('<loc>https://infinitybangladesh.vercel.app/blood-donation</loc>'), 'Sitemap indexes clean blood donation hub');
  assert(sitemapContent.includes('<loc>https://infinitybangladesh.vercel.app/donate</loc>'), 'Sitemap indexes clean donate hub');
  assert(sitemapContent.includes('<loc>https://infinitybangladesh.vercel.app/volunteer</loc>'), 'Sitemap indexes clean volunteer portal');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Security Headers in vercel.json
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 4: Security & OWASP Defense Headers]');
  const vercelPath = path.join(rootDir, 'vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const headers = vercelConfig.headers?.[0]?.headers || [];
  const headerKeys = headers.map((h: { key: string }) => h.key);

  assert(headerKeys.includes('Content-Security-Policy'), 'vercel.json enforces Content-Security-Policy (CSP)');
  assert(headerKeys.includes('Strict-Transport-Security'), 'vercel.json enforces Strict-Transport-Security (HSTS)');
  assert(headerKeys.includes('X-Frame-Options'), 'vercel.json enforces X-Frame-Options (Clickjacking defense)');
  assert(headerKeys.includes('X-Content-Type-Options'), 'vercel.json enforces X-Content-Type-Options (MIME-sniffing defense)');
  assert(headerKeys.includes('Cross-Origin-Opener-Policy'), 'vercel.json enforces Cross-Origin-Opener-Policy');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Core Web Vitals & Hero Image Preload
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 5: Core Web Vitals & Preload Integrity]');
  const indexPath = path.join(rootDir, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  assert(
    indexContent.includes('rel="preload" as="image" href="/images/infinity-cover-hero.jpg"'),
    'index.html preloads LCP Hero Cover Image with high priority'
  );
  assert(
    !indexContent.includes('href="#/blood-donation"'),
    'index.html noscript fallback uses clean canonical routes instead of hash links'
  );


  // --------------------------------------------------------------------------
  // TEST SUITE 6: V10.1 Phase 1 Frontend Security Architecture & Regression Tests
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 6: V10.1 Frontend Security Architecture & Regressions]');

  const {
    PUBLIC_SUBMISSION_ALLOWLISTS,
    PUBLIC_SUBMISSION_GATES,
    validatePayloadSchema,
    scanPayloadSecrets,
    generateSecureId,
    safeDbInsert
  } = await import('../src/context/dbAdapter');

  const {
    evaluateDonationCooldown,
    getDonorPhoneVisibility
  } = await import('../src/data/bloodDonationData');

  // Test 6.1: Allowlist Field Counts
  assert(
    PUBLIC_SUBMISSION_ALLOWLISTS.blood_donors.length === 15,
    'Allowlist for "blood_donors" contains exactly 15 columns'
  );
  assert(
    PUBLIC_SUBMISSION_ALLOWLISTS.emergency_blood_requests.length === 12,
    'Allowlist for "emergency_blood_requests" contains exactly 12 columns'
  );
  assert(
    PUBLIC_SUBMISSION_ALLOWLISTS.volunteer_applications.length === 13,
    'Allowlist for "volunteer_applications" contains exactly 13 columns'
  );
  assert(
    PUBLIC_SUBMISSION_ALLOWLISTS.donation_records.length === 12,
    'Allowlist for "donation_records" contains exactly 12 columns'
  );
  assert(
    PUBLIC_SUBMISSION_ALLOWLISTS.contact_messages.length === 6,
    'Allowlist for "contact_messages" contains exactly 6 columns'
  );

  // Test 6.2: Privilege Escalation Rejection (Unsanctioned Field Injection)
  const donorWithAdminFields = {
    full_name: 'Imposter Admin',
    phone: '01812345678',
    privacy_consent: true,
    approval_status: 'APPROVED'
  };
  const valDonor = validatePayloadSchema('blood_donors', donorWithAdminFields);
  assert(
    valDonor.valid === false && Boolean(valDonor.error && valDonor.error.includes('approval_status')),
    'Public blood donor registration rejects unauthorized "approval_status" injection'
  );

  const donorWithVerified = {
    full_name: 'Imposter Verified',
    phone: '01812345678',
    privacy_consent: true,
    is_verified: true
  };
  const valDonor2 = validatePayloadSchema('blood_donors', donorWithVerified);
  assert(
    valDonor2.valid === false && Boolean(valDonor2.error && valDonor2.error.includes('is_verified')),
    'Public blood donor registration rejects unauthorized "is_verified" injection'
  );

  const emgWithStatus = {
    patient_name: 'Patient X',
    contact_number: '01812345678',
    units_needed: 2,
    status: 'APPROVED'
  };
  const valEmg = validatePayloadSchema('emergency_blood_requests', emgWithStatus);
  assert(
    valEmg.valid === false && Boolean(valEmg.error && valEmg.error.includes('status')),
    'Public emergency blood request rejects unauthorized "status" injection'
  );

  // Test 6.3: Public Donation Record Gate is BLOCKED_PENDING_MIGRATION
  assert(
    PUBLIC_SUBMISSION_GATES.donation_records === 'BLOCKED_PENDING_MIGRATION',
    'Public submission gate for "donation_records" is BLOCKED_PENDING_MIGRATION'
  );
  const donationInsertAttempt = await safeDbInsert('donation_records', {
    id: generateSecureId('don'),
    donor_name: 'Test Donor',
    amount_bdt: 500,
    payment_method: 'bKash'
  });
  assert(
    donationInsertAttempt.success === false && donationInsertAttempt.status === 'FEATURE_DISABLED',
    'safeDbInsert("donation_records") fails closed with FEATURE_DISABLED while default status is unsafe'
  );

  // Test 6.4: CSPRNG ID Generator
  const secureId1 = generateSecureId('donor');
  const secureId2 = generateSecureId('donor');
  assert(
    secureId1.startsWith('donor-') && secureId1.length > 20 && secureId1 !== secureId2,
    'generateSecureId produces cryptographically unique prefixed UUIDs'
  );
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert(
    uuidRegex.test(secureId1.replace('donor-', '')),
    'generateSecureId conforms to RFC 4122 v4 UUID specification'
  );

  // Test 6.5: Cooldown and Date Boundary Evaluation (Dhaka Midnight UTC)
  const cdEmpty = evaluateDonationCooldown('');
  assert(
    cdEmpty.isNeverDonated === true && cdEmpty.isEligible === true && cdEmpty.cooldownActive === false,
    'evaluateDonationCooldown on empty date returns isNeverDonated: true and isEligible: true'
  );

  const cdFuture = evaluateDonationCooldown('2099-01-01');
  assert(
    cdFuture.isFutureDate === true && cdFuture.isValidDate === false && cdFuture.isEligible === false,
    'evaluateDonationCooldown on future date fails closed with isFutureDate: true, isEligible: false'
  );

  const cdImpossible = evaluateDonationCooldown('2023-02-29');
  assert(
    cdImpossible.isMalformedOrImpossible === true && cdImpossible.isValidDate === false && cdImpossible.isEligible === false,
    'evaluateDonationCooldown on non-leap Feb 29 fails closed as impossible date'
  );

  // Test 6.6: Phone Visibility Fail-Closed Rules
  const approvedEligibleDonor: any = {
    id: 'donor-test-1',
    fullName: 'Verified Donor',
    bloodGroup: 'A+',
    gender: 'Male',
    phone: '01812345678',
    district: 'Chattogram',
    upazila: 'Hathazari',
    area: 'College Gate',
    orgCategory: 'Open Voluntary Blood Donor',
    availabilityStatus: 'AVAILABLE_EMERGENCY',
    totalDonations: 3,
    approvalStatus: 'APPROVED',
    isVerified: true,
    privacyConsent: true,
    showPhonePublicly: true,
    lastDonationDate: '2020-01-01'
  };

  const vis1 = getDonorPhoneVisibility(approvedEligibleDonor);
  assert(
    vis1.isPublic === true && vis1.displayPhone === approvedEligibleDonor.phone,
    'Eligible approved verified donor with consent displays public phone'
  );

  const unapprovedDonor = { ...approvedEligibleDonor, approvalStatus: 'PENDING' };
  const vis2 = getDonorPhoneVisibility(unapprovedDonor);
  assert(
    vis2.isPublic === false && vis2.displayPhone.includes('•'),
    'Pending donor fails closed and masks phone'
  );

  const unverifiedDonor = { ...approvedEligibleDonor, isVerified: false };
  const vis3 = getDonorPhoneVisibility(unverifiedDonor);
  assert(
    vis3.isPublic === false && vis3.displayPhone.includes('•'),
    'Unverified donor fails closed and masks phone'
  );

  const noConsentDonor = { ...approvedEligibleDonor, privacyConsent: false };
  const vis4 = getDonorPhoneVisibility(noConsentDonor);
  assert(
    vis4.isPublic === false && vis4.displayPhone.includes('•'),
    'Donor without privacy consent fails closed and masks phone'
  );

  const maleOptOutDonor = { ...approvedEligibleDonor, gender: 'Male', showPhonePublicly: false };
  const vis5 = getDonorPhoneVisibility(maleOptOutDonor);
  assert(
    vis5.isPublic === false && vis5.displayPhone.includes('•'),
    'Male donor who opted out of public phone has phone masked (gender-neutral)'
  );

  const malformedDateDonor = { ...approvedEligibleDonor, lastDonationDate: '2023-02-29' };
  const vis6 = getDonorPhoneVisibility(malformedDateDonor);
  assert(
    vis6.isPublic === false && vis6.displayPhone.includes('•'),
    'Donor with malformed or impossible last donation date fails closed and masks phone'
  );

  // Test 6.7: Secrets Scanner & Circular Reference Protection
  const leakedPayload = {
    name: 'Normal User',
    meta: {
      client_pin: '123456',
      sub: {
        password: 'secret_password'
      }
    }
  };
  const scanResult = scanPayloadSecrets(leakedPayload);
  assert(
    scanResult.safe === false && Boolean(scanResult.error),
    'scanPayloadSecrets recursively catches nested pin and password fields'
  );

  const circularObj: any = { name: 'Circular Test' };
  circularObj.self = circularObj;
  const scanCircular = scanPayloadSecrets(circularObj);
  assert(
    scanCircular.safe === true,
    'scanPayloadSecrets handles circular references without call stack exhaustion'
  );

  // --------------------------------------------------------------------------
  // TEST SUITE 7: Phase 1.1 Security Baseline & Lockdown Verification
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 7: Phase 1.1 Frontend Containment & Lockdown]');
  const {
    safeDbUpsert,
    safeDbDelete,
    REMOTE_CMS_MUTATIONS_LOCKED,
    PUBLIC_SUBMISSION_LOCKED_PHASE_1_1
  } = await import('../src/context/dbAdapter');
  const { uploadToCloudinary, CLOUDINARY_UPLOADS_LOCKED } = await import('../src/lib/cloudinary');
  const { uploadFileToSupabase, SUPABASE_STORAGE_UPLOADS_LOCKED } = await import('../src/lib/supabase');
  const { INITIAL_BLOOD_DONORS } = await import('../src/data/bloodDonationData');

  // Test 7.1: Gating Flags
  assert(
    REMOTE_CMS_MUTATIONS_LOCKED === true,
    'REMOTE_CMS_MUTATIONS_LOCKED is active (true) in dbAdapter'
  );
  assert(
    PUBLIC_SUBMISSION_LOCKED_PHASE_1_1 === true,
    'PUBLIC_SUBMISSION_LOCKED_PHASE_1_1 is active (true) in dbAdapter'
  );
  assert(
    CLOUDINARY_UPLOADS_LOCKED === true,
    'CLOUDINARY_UPLOADS_LOCKED is active (true) in cloudinary service'
  );
  assert(
    SUPABASE_STORAGE_UPLOADS_LOCKED === true,
    'SUPABASE_STORAGE_UPLOADS_LOCKED is active (true) in supabase service'
  );

  // Test 7.2: Public Ingestion Fail-Closed (Zero Network Dispatches)
  const publicTables = [
    'blood_donors',
    'emergency_blood_requests',
    'volunteer_applications',
    'donation_records',
    'contact_messages'
  ] as const;

  for (const table of publicTables) {
    const res = await safeDbInsert(table, { id: 'test-id', test: true });
    assert(
      res.success === false && res.code === 'DISABLED_PHASE_2',
      `safeDbInsert('${table}') fails closed with DISABLED_PHASE_2 and zero network dispatch`
    );
  }

  // Test 7.3: Remote CMS Mutations Fail-Closed
  let fetchDispatched = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchDispatched = true;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  try {
    await safeDbUpsert('site_settings', { id: 'test', title: 'Test' });
    assert(
      fetchDispatched === false,
      'safeDbUpsert dispatches ZERO network/fetch requests when REMOTE_CMS_MUTATIONS_LOCKED is active'
    );

    await safeDbDelete('site_settings', 'id', 'test');
    assert(
      fetchDispatched === false,
      'safeDbDelete dispatches ZERO network/fetch requests when REMOTE_CMS_MUTATIONS_LOCKED is active'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  // Test 7.4a: Cloudinary Upload Lockdown & Safe In-Memory Preview
  let cloudinaryFetchCalled = false;
  const origFetch2 = globalThis.fetch;
  globalThis.fetch = async () => {
    cloudinaryFetchCalled = true;
    return new Response(JSON.stringify({}), { status: 200 });
  };

  try {
    const cloudRes = await uploadToCloudinary('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
    assert(
      cloudinaryFetchCalled === false,
      'uploadToCloudinary dispatches ZERO network requests to api.cloudinary.com'
    );
    assert(
      cloudRes.placeholder === true && cloudRes.secure_url === '',
      'uploadToCloudinary returns safe locked placeholder without external upload or blob allocation'
    );
  } finally {
    globalThis.fetch = origFetch2;
  }

  // Test 7.4b: Supabase Storage Lockdown
  const storageRes = await uploadFileToSupabase('infinity-media', new File(['test'], 'test.txt'));
  assert(
    storageRes.success === false && storageRes.error?.includes('locked'),
    'uploadFileToSupabase fails closed locally without dispatching storage requests'
  );

  // Test 7.5: Demo Seed Donors Isolation
  const allSeedHaveDemoFlag = INITIAL_BLOOD_DONORS.every(d => d.isDemo === true);
  assert(
    allSeedHaveDemoFlag === true,
    'All INITIAL_BLOOD_DONORS seed records have isDemo === true for explicit demo isolation'
  );

  // Test 7.6: Public SQL View Source Inspection
  const dataContextContent = fs.readFileSync(path.resolve(rootDir, 'src/context/DataContext.tsx'), 'utf-8');
  assert(
    dataContextContent.includes("supabase.from('public_blood_donors').select('*')"),
    'DataContext queries public_blood_donors view'
  );
  assert(
    dataContextContent.includes("supabase.from('public_emergency_requests').select('*')"),
    'DataContext queries public_emergency_requests view'
  );
  assert(
    !dataContextContent.includes("supabase.from('blood_donors').select('*')"),
    'DataContext eliminates direct base-table reads on blood_donors'
  );
  assert(
    !dataContextContent.includes("supabase.from('emergency_blood_requests').select('*')"),
    'DataContext eliminates direct base-table reads on emergency_blood_requests'
  );

  // Test 7.7: WhatsApp Coordinator Privacy Verification
  const bloodPageContent = fs.readFileSync(path.resolve(rootDir, 'src/pages/BloodDonationPage.tsx'), 'utf-8');
  assert(
    !bloodPageContent.includes('${matchedDonor.id}') && !bloodPageContent.includes('রক্তদাতা আইডি:'),
    'BloodDonationPage coordinator WhatsApp message does NOT leak matchedDonor.id in URL parameters'
  );

  // Test 7.8: Donation Reference Honesty Verification
  const donatePageContent = fs.readFileSync(path.resolve(rootDir, 'src/pages/DonatePage.tsx'), 'utf-8');
  assert(
    donatePageContent.includes('অনলাইন ডাটাবেজ সাবমিশন সাময়িকভাবে স্থগিত রয়েছে') ||
    donatePageContent.includes('খসড়া রেফারেন্স'),
    'DonatePage transparently informs donor that online submission is paused and reference is a draft'
  );

  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // TEST SUITE 8: Phase 1.1 Media Sanitization, Storage Engine & Object URL Resilience
  // --------------------------------------------------------------------------
  console.log('\n📌 [Suite 8: Phase 1.1 Media Sanitization, Storage Engine & Object URL Resilience]');
  
  const {
    isValidPermanentUrl,
    resolveMediaFieldUpdate,
    sanitizeMediaUrlArray,
    ObjectURLManager,
    VERIFIED_LOCAL_ASSET_PATHS
  } = await import('../src/lib/utils/mediaSanitizer');

  const {
    getSafeLocalStorage,
    normalizeStorageKey,
    isMediaKey,
    isKeyPersistenceBlocked,
    saveToStorage,
    getStoredOrDefault,
    initializeStorage,
    getMigrationState,
    getFailedMigrationKeys,
    getMigratedKeys,
    getUnchangedKeys,
    CANONICAL_MEDIA_KEYS,
    STORAGE_PREFIX,
    DATA_VERSION_KEY,
    CURRENT_DATA_VERSION
  } = await import('../src/context/dataStorage');

  // Group 8.1: Permanent URL Validation & Asset Whitelist (24 Assertions)
  assert(!isValidPermanentUrl('blob:https://infinity.org/12345'), '8.1.1: Rejects blob:https URL scheme');
  assert(!isValidPermanentUrl('blob:http://localhost:3000/abc'), '8.1.1: Rejects blob:http URL scheme');
  assert(!isValidPermanentUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='), '8.1.2: Rejects data: image base64 URI');
  assert(!isValidPermanentUrl('data:text/html,<script>alert(1)</script>'), '8.1.2: Rejects data: HTML payload');
  assert(!isValidPermanentUrl('javascript:alert(1)'), '8.1.3: Rejects javascript: pseudo-protocol');
  assert(!isValidPermanentUrl('vbscript:msgbox(1)'), '8.1.3: Rejects vbscript: pseudo-protocol');
  assert(!isValidPermanentUrl('file:///etc/passwd'), '8.1.3: Rejects file: local filesystem protocol');
  assert(!isValidPermanentUrl('https://admin:secret@res.cloudinary.com/demo/image.png'), '8.1.4: Rejects URL with embedded username & password');
  assert(!isValidPermanentUrl('https://user@images.unsplash.com/photo-1'), '8.1.4: Rejects URL with embedded username');
  assert(!isValidPermanentUrl('http://res.cloudinary.com/demo/image.png'), '8.1.5: Rejects insecure HTTP remote asset');
  assert(!isValidPermanentUrl('http://images.unsplash.com/photo-123'), '8.1.5: Rejects insecure HTTP Unsplash image');
  assert(!isValidPermanentUrl('https://localhost/avatar.png'), '8.1.6: Rejects remote URL pointing to localhost');
  assert(!isValidPermanentUrl('https://127.0.0.1/logo.png'), '8.1.6: Rejects remote URL with IPv4 loopback literal');
  assert(!isValidPermanentUrl('https://192.168.1.100/banner.jpg'), '8.1.6: Rejects remote URL with IPv4 private Class C address');
  assert(!isValidPermanentUrl('https://10.0.0.1/test.jpg'), '8.1.6: Rejects remote URL with IPv4 private Class A address');
  assert(!isValidPermanentUrl('https://[::1]/test.jpg'), '8.1.6: Rejects remote URL with IPv6 loopback literal');
  assert(VERIFIED_LOCAL_ASSET_PATHS.size === 66, '8.1.7: Verified local asset whitelist contains exactly 66 physical images');
  assert(isValidPermanentUrl('/brand/infinity-logo.png'), '8.1.7: Accepts verified local asset /brand/infinity-logo.png');
  assert(!isValidPermanentUrl('/images/non-existent-synthetic-file.jpg'), '8.1.7: Rejects unverified local path not in whitelist');
  assert(isValidPermanentUrl('https://res.cloudinary.com/infinity/image/upload/sample.jpg'), '8.1.8: Accepts valid public HTTPS Cloudinary CDN asset');
  assert(isValidPermanentUrl('https://images.unsplash.com/photo-1542838132-92c53300491e'), '8.1.8: Accepts valid public HTTPS Unsplash photo asset');
  assert(!isValidPermanentUrl('   https://res.cloudinary.com/sample.jpg   '), '8.1.9: Rejects URL with leading/trailing whitespace (no silent trimming)');
  assert(!isValidPermanentUrl('https://res.cloudinary.com/sample\u200B.jpg'), '8.1.9: Rejects URL containing invisible zero-width space Unicode character');
  assert(!isValidPermanentUrl('https://res.cloudinary.com:8080/sample.jpg'), '8.1.9: Rejects remote URL with non-standard port 8080');

  // Group 8.2: Media Field Update Semantics & Array Sanitization (14 Assertions)
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', undefined) === 'https://example.com/old.jpg', '8.2.1: Undefined candidate preserves existing valid URL');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', 'blob:http://localhost/123') === 'https://example.com/old.jpg', '8.2.2: Transient blob candidate preserves existing valid URL');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', 'data:image/png;base64,...') === 'https://example.com/old.jpg', '8.2.2: Transient data URL candidate preserves existing valid URL');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', 'https://example.com/new.jpg') === 'https://example.com/new.jpg', '8.2.3: Valid permanent candidate updates existing URL');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', null, false) === null, '8.2.4: Optional field allows explicit null clearing');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', '', false) === '', '8.2.4: Optional field allows explicit empty string clearing');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', null, true) === 'https://example.com/old.jpg', '8.2.5: Required field preserves existing valid URL when candidate is null');
  assert(resolveMediaFieldUpdate('https://example.com/old.jpg', '', true) === 'https://example.com/old.jpg', '8.2.5: Required field preserves existing valid URL when candidate is empty string');
  assert(resolveMediaFieldUpdate('blob:invalid', 'blob:invalid2', false) === '', '8.2.6: Both invalid candidate and existing returns safe empty string');
  
  const testArray = ['https://res.cloudinary.com/1.jpg', 'blob:http://invalid/2', '/brand/infinity-logo.png', 'data:image/jpeg;...'];
  const sanitizedArrayRes = sanitizeMediaUrlArray([], testArray);
  assert(sanitizedArrayRes.length === 2, '8.2.7: sanitizeMediaUrlArray filters out invalid blob and data URLs');
  assert(sanitizedArrayRes.includes('https://res.cloudinary.com/1.jpg'), '8.2.7: Preserves permanent remote URL in array');
  assert(sanitizedArrayRes.includes('/brand/infinity-logo.png'), '8.2.7: Preserves verified local asset in array');
  assert(sanitizeMediaUrlArray(['https://res.cloudinary.com/1.jpg'], undefined).length === 1, '8.2.8: Undefined candidate array preserves existing valid array');
  assert(sanitizeMediaUrlArray([], 'not-an-array' as any).length === 0, '8.2.8: Non-array candidate fails safely to empty array');

  // Group 8.3: ObjectURLManager Lifecycle & Leak Prevention (14 Assertions)
  let allocatedMockUrl = '';
  let revokedMockUrls: string[] = [];
  const originalCreate = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;

  globalThis.URL.createObjectURL = (_blob: any) => {
    allocatedMockUrl = `blob:mock-url-${Math.random().toString(36).substring(2, 8)}`;
    return allocatedMockUrl;
  };
  globalThis.URL.revokeObjectURL = (url: string) => {
    revokedMockUrls.push(url);
  };

  try {
    const manager = new ObjectURLManager();
    assert(manager.getActiveUrl() === null, '8.3.1: Manager initializes with null active URL');

    const dummyBlob = new Blob(['sample'], { type: 'image/png' });
    const url1 = manager.allocate(dummyBlob);
    assert(url1.startsWith('blob:mock-url-'), '8.3.2: allocate returns valid mock blob URL');
    assert(manager.getActiveUrl() === url1, '8.3.2: getActiveUrl tracks the newly allocated URL');

    const url2 = manager.replace(dummyBlob);
    assert(url2.startsWith('blob:mock-url-') && url2 !== url1, '8.3.3: replace allocates a fresh URL');
    assert(revokedMockUrls.includes(url1), '8.3.3: replace revokes the previous active URL before allocation');
    assert(manager.getActiveUrl() === url2, '8.3.3: getActiveUrl updates to the replacement URL');

    manager.close();
    assert(revokedMockUrls.includes(url2), '8.3.4: close revokes the active URL');
    assert(manager.getActiveUrl() === null, '8.3.4: close clears active URL reference to null');

    const revokeCountBefore = revokedMockUrls.length;
    manager.close();
    assert(revokedMockUrls.length === revokeCountBefore, '8.3.5: Repeated close() is completely idempotent without redundant revocation');

    manager.unmount();
    assert(revokedMockUrls.length === revokeCountBefore, '8.3.6: unmount() on closed manager is safe and idempotent');

    // Allocation failure test
    globalThis.URL.createObjectURL = () => { throw new Error('Out of memory'); };
    const failedAlloc = manager.allocate(dummyBlob);
    assert(failedAlloc === '', '8.3.7: allocate returns empty string safely on createObjectURL exception');
    assert(manager.getActiveUrl() === null, '8.3.7: Active URL remains null on allocation failure');
  } finally {
    globalThis.URL.createObjectURL = originalCreate;
    globalThis.URL.revokeObjectURL = originalRevoke;
  }

  // Group 8.4: Storage Normalization & Key Gating (16 Assertions)
  assert(normalizeStorageKey('galleryAlbums') === 'galleryAlbums', '8.4.1: Normalizes bare logical key');
  assert(normalizeStorageKey(`${STORAGE_PREFIX}galleryAlbums`) === 'galleryAlbums', '8.4.1: Strips STORAGE_PREFIX from physical key');
  assert(normalizeStorageKey('pressCoverage') === 'pressCoverages', '8.4.2: Normalizes singular pressCoverage to canonical pressCoverages');
  assert(normalizeStorageKey(`${STORAGE_PREFIX}pressCoverage`) === 'pressCoverages', '8.4.2: Normalizes prefixed pressCoverage to canonical pressCoverages');
  assert(isMediaKey('campaigns') === true, '8.4.3: Identifies campaigns as media-bearing key');
  assert(isMediaKey('bloodDonors') === true, '8.4.3: Identifies bloodDonors as media-bearing key');
  assert(isMediaKey('galleryAlbums') === true, '8.4.3: Identifies galleryAlbums as media-bearing key');
  assert(isMediaKey('auditLogs') === false, '8.4.4: Identifies auditLogs as non-media business key');
  assert(isMediaKey('siteSettings') === false, '8.4.4: Identifies siteSettings as non-media business key');
  assert(CANONICAL_MEDIA_KEYS.length === 24, '8.4.5: Canonical media keys array contains all 24 media-bearing entities');
  assert(isMediaKey('gallery') === true, '8.4.5: gallery is identified as media-bearing key');
  assert(isMediaKey('banners') === true, '8.4.5: banners is identified as media-bearing key');
  assert(isMediaKey('videos') === true, '8.4.5: videos is identified as media-bearing key');
  assert(isMediaKey('journeyVideos') === true, '8.4.5: journeyVideos is identified as media-bearing key');
  assert(isMediaKey('mediaLibrary') === true, '8.4.5: mediaLibrary is identified as media-bearing key');
  assert(isMediaKey('persons') === true, '8.4.5: persons is identified as media-bearing key');
  assert(isMediaKey('committees') === true, '8.4.5: committees is identified as media-bearing key');
  assert(isMediaKey('partners') === true, '8.4.5: partners is identified as media-bearing key');
  assert(isMediaKey('events') === true, '8.4.5: events is identified as media-bearing key');
  assert(isMediaKey('adminProfiles') === true, '8.4.5: adminProfiles is identified as media-bearing key');
  assert(isMediaKey('aboutSettings') === true, '8.4.5: aboutSettings is identified as media-bearing key');
  assert(isMediaKey('headerSettings') === true, '8.4.5: headerSettings is identified as media-bearing key');
  assert(isMediaKey('footerSettings') === true, '8.4.5: footerSettings is identified as media-bearing key');
  assert(isMediaKey('homepageConfig') === true, '8.4.5: homepageConfig is identified as media-bearing key');

  // Gating & SSR behavior
  assert(getSafeLocalStorage() === null, '8.4.6: getSafeLocalStorage safely returns null in Node.js test runtime');
  assert(isKeyPersistenceBlocked('auditLogs') === false, '8.4.7: Non-media key auditLogs is never persistence-blocked');
  assert(isKeyPersistenceBlocked('siteSettings') === false, '8.4.7: Non-media key siteSettings is never persistence-blocked');
  assert(isKeyPersistenceBlocked('campaigns') === true, '8.4.8: Media key campaigns fails closed when uninitialized in non-browser runtime');
  assert(isKeyPersistenceBlocked('bloodDonors') === true, '8.4.8: Media key bloodDonors fails closed when uninitialized in non-browser runtime');
  assert(saveToStorage('campaigns', [{ id: '1' }]) === false, '8.4.9: saveToStorage returns false when persistence is blocked or storage null');

  // Test StorageService locked upload failure
  const { StorageService } = await import('../src/lib/storage/storageService');
  const dummyFile = new File(['test'], 'test.png', { type: 'image/png' });
  const svcRes = await StorageService.uploadFile(dummyFile);
  assert(svcRes.success === false, '8.4.10: StorageService fails closed and returns success: false when uploads locked');
  assert(svcRes.error?.includes('locked'), '8.4.10: StorageService returns truthful lock error message');

  // Group 8.5: Mocked Storage Failure State Machine & Migration Scenarios (24 Assertions)
  const mockStorageMap = new Map<string, string>();
  let mockThrowOnGetItem = false;
  let mockThrowOnSetItem = false;

  const mockStorage: Storage = {
    length: 0,
    clear: () => mockStorageMap.clear(),
    getItem: (key: string) => {
      if (mockThrowOnGetItem) throw new Error('Quota or I/O failure on read');
      return mockStorageMap.get(key) || null;
    },
    setItem: (key: string, value: string) => {
      if (mockThrowOnSetItem) throw new Error('QuotaExceededError: LocalStorage quota exceeded');
      mockStorageMap.set(key, value);
    },
    removeItem: (key: string) => { mockStorageMap.delete(key); },
    key: (_idx: number) => null
  };

  // Mock browser environment for state machine tests
  const origWindow = (globalThis as any).window;
  (globalThis as any).window = { localStorage: mockStorage };

  try {
    // Scenario 1: Clean pass on empty storage -> COMPLETE
    mockStorageMap.clear();
    const state1 = initializeStorage();
    assert(state1 === 'COMPLETE', '8.5.1: Initializing empty storage produces COMPLETE state');
    assert(mockStorageMap.get(DATA_VERSION_KEY) === CURRENT_DATA_VERSION, '8.5.1: Writes version marker upon complete initialization');
    assert(getMigrationState() === 'COMPLETE', '8.5.1: getMigrationState reflects COMPLETE');

    // Scenario 2: Second run with current marker -> UNNECESSARY (idempotent no-op)
    const state2 = initializeStorage();
    assert(state2 === 'UNNECESSARY', '8.5.2: Re-running with current marker produces UNNECESSARY state');

    // Scenario 3: Unknown future version marker -> FATAL_FAILURE (fail closed)
    mockStorageMap.set(DATA_VERSION_KEY, '2099.99.99.9999999999999');
    const state3 = initializeStorage();
    assert(state3 === 'FATAL_FAILURE', '8.5.3: Unknown future marker triggers FATAL_FAILURE');
    assert(isKeyPersistenceBlocked('campaigns') === true, '8.5.3: All media keys blocked under FATAL_FAILURE');
    assert(isKeyPersistenceBlocked('bloodDonors') === true, '8.5.3: All media keys blocked under FATAL_FAILURE');

    // Scenario 4: Migration of stored blob & data URLs across media keys
    mockStorageMap.delete(DATA_VERSION_KEY);
    const contaminatedCampaigns = [
      {
        id: 'camp-1',
        title: { en: 'Flood Relief', bn: 'বন্যা ত্রাণ' },
        imageUrl: 'blob:https://infinity.org/bad-blob-url',
        galleryImages: ['https://res.cloudinary.com/good.jpg', 'data:image/png;base64,bad-data']
      }
    ];
    mockStorageMap.set(`${STORAGE_PREFIX}campaigns`, JSON.stringify(contaminatedCampaigns));

    const contaminatedAlbums = [
      {
        id: 'alb-1',
        title: 'Event Album',
        coverImage: 'blob:https://infinity.org/bad-cover',
        photos: [
          { id: 'p1', url: 'https://res.cloudinary.com/photo.jpg' },
          { id: 'p2', url: 'blob:https://infinity.org/photo-blob' }
        ]
      }
    ];
    mockStorageMap.set(`${STORAGE_PREFIX}galleryAlbums`, JSON.stringify(contaminatedAlbums));

    const state4 = initializeStorage();
    assert(state4 === 'COMPLETE', '8.5.4: Sanitization pass on contaminated records achieves COMPLETE');
    const cleanedCamp = JSON.parse(mockStorageMap.get(`${STORAGE_PREFIX}campaigns`) || '[]');
    assert(cleanedCamp[0].imageUrl === '', '8.5.4: Purges blob: URL from campaign imageUrl');
    assert(cleanedCamp[0].galleryImages.length === 1, '8.5.4: Purges data: URL from galleryImages array');
    assert(cleanedCamp[0].galleryImages[0] === 'https://res.cloudinary.com/good.jpg', '8.5.4: Preserves valid permanent image in galleryImages');

    const cleanedAlbums = JSON.parse(mockStorageMap.get(`${STORAGE_PREFIX}galleryAlbums`) || '[]');
    assert(cleanedAlbums[0].coverImage === '', '8.5.4: Purges blob: URL from album coverImage');
    assert(cleanedAlbums[0].photos[0].url === 'https://res.cloudinary.com/photo.jpg', '8.5.4: Preserves valid photo in album photos[]');
    assert(cleanedAlbums[0].photos[1].url === '', '8.5.4: Purges blob: URL from corrupted photo in album photos[]');

    // Scenario 5: Malformed JSON key -> PARTIAL_FAILURE & raw data untouched
    mockStorageMap.delete(DATA_VERSION_KEY);
    const rawCorruptJson = '{ invalid: json syntax -- corrupted bytes';
    mockStorageMap.set(`${STORAGE_PREFIX}stories`, rawCorruptJson);

    const state5 = initializeStorage();
    assert(state5 === 'PARTIAL_FAILURE', '8.5.5: Malformed JSON in key produces PARTIAL_FAILURE');
    assert(mockStorageMap.get(`${STORAGE_PREFIX}stories`) === rawCorruptJson, '8.5.5: Raw storage of corrupted key remains strictly untouched');
    assert(getFailedMigrationKeys().includes('stories'), '8.5.5: Failed key list accurately records "stories"');
    assert(isKeyPersistenceBlocked('stories') === true, '8.5.5: Persistence is blocked for the failed key');
    assert(isKeyPersistenceBlocked('campaigns') === false, '8.5.5: Persistence is NOT blocked for cleanly migrated keys');

    // Scenario 6: Runtime QuotaExceededError in saveToStorage does NOT corrupt global migration state
    assert(getMigrationState() === 'PARTIAL_FAILURE', '8.5.6: State is PARTIAL_FAILURE before runtime save');
    mockThrowOnSetItem = true;
    const saveRes = saveToStorage('campaigns', [{ id: 'new-c' }]);
    assert(saveRes === false, '8.5.6: saveToStorage returns false when setItem throws quota error');
    assert(getMigrationState() === 'PARTIAL_FAILURE', '8.5.6: Runtime write failure does NOT alter startup migration state machine');
    mockThrowOnSetItem = false;

    // Circular reference handling
    const circularObj: any = { id: 'circ' };
    circularObj.self = circularObj;
    const circRes = saveToStorage('campaigns', circularObj);
    assert(circRes === false, '8.5.7: saveToStorage returns false on JSON circular reference without throwing');
    assert(getMigrationState() === 'PARTIAL_FAILURE', '8.5.7: Circular reference does NOT alter migration state');
  } finally {
    (globalThis as any).window = origWindow;
  }

  // Group 8.6: Static Contract Assertions & Call-Site Audit (16 Assertions)
  const dataStorageSource = fs.readFileSync(path.resolve(rootDir, 'src/context/dataStorage.ts'), 'utf-8');
  assert(dataStorageSource.includes('export function saveToStorage'), '8.6.1: dataStorage exports saveToStorage helper');
  assert(dataStorageSource.includes('export function isKeyPersistenceBlocked'), '8.6.1: dataStorage exports isKeyPersistenceBlocked');
  assert(dataStorageSource.includes('export function getSafeLocalStorage'), '8.6.1: dataStorage exports getSafeLocalStorage');

  const bloodSliceSource = fs.readFileSync(path.resolve(rootDir, 'src/context/slices/useBloodDonationSlice.ts'), 'utf-8');
  assert(bloodSliceSource.includes("saveToStorage('bloodDonors'"), '8.6.2: useBloodDonationSlice uses saveToStorage for donor persistence');
  assert(!bloodSliceSource.includes("localStorage.setItem(`${STORAGE_PREFIX}bloodDonors`"), '8.6.2: ZERO direct localStorage.setItem calls remain for bloodDonors in useBloodDonationSlice');
  assert(bloodSliceSource.includes('resolveMediaFieldUpdate'), '8.6.2: useBloodDonationSlice imports and applies resolveMediaFieldUpdate');

  const mediaSliceSource = fs.readFileSync(path.resolve(rootDir, 'src/context/slices/useMediaSlice.ts'), 'utf-8');
  assert(mediaSliceSource.includes('saveToStorage(key, data)'), '8.6.3: useMediaSlice persistEntity routes through saveToStorage');
  assert(mediaSliceSource.includes('resolveMediaFieldUpdate'), '8.6.3: useMediaSlice applies resolveMediaFieldUpdate');

  const govSliceSource = fs.readFileSync(path.resolve(rootDir, 'src/context/slices/useGovernanceSlice.ts'), 'utf-8');
  assert(govSliceSource.includes('saveToStorage(key, data)'), '8.6.4: useGovernanceSlice persistEntity routes through saveToStorage');
  assert(govSliceSource.includes('resolveMediaFieldUpdate'), '8.6.4: useGovernanceSlice applies resolveMediaFieldUpdate');

  const humSliceSource = fs.readFileSync(path.resolve(rootDir, 'src/context/slices/useHumanitarianSlice.ts'), 'utf-8');
  assert(humSliceSource.includes('saveToStorage(key, data)'), '8.6.5: useHumanitarianSlice persistEntity routes through saveToStorage');
  assert(humSliceSource.includes('resolveMediaFieldUpdate'), '8.6.5: useHumanitarianSlice applies resolveMediaFieldUpdate');

  const adminPageSource = fs.readFileSync(path.resolve(rootDir, 'src/pages/AdminPage.tsx'), 'utf-8');
  assert(adminPageSource.includes('URL.revokeObjectURL(url)'), '8.6.6: AdminPage revokes transient CSV & JSON export URLs');

  const cloudinarySource = fs.readFileSync(path.resolve(rootDir, 'src/lib/cloudinary.ts'), 'utf-8');
  assert(!cloudinarySource.includes('URL.createObjectURL(file)'), '8.6.7: Cloudinary fallback disallows unrevoked URL.createObjectURL allocations');

  const imageEditorSource = fs.readFileSync(path.resolve(rootDir, 'src/components/ImageEditorModal.tsx'), 'utf-8');
  assert(imageEditorSource.includes('ObjectURLManager'), '8.6.8: ImageEditorModal integrates ObjectURLManager');
  assert(imageEditorSource.includes('objectUrlManagerRef.current?.close()'), '8.6.8: ImageEditorModal revokes preview URLs on unmount');

    const settingsSliceSource = fs.readFileSync(path.resolve(rootDir, 'src/context/slices/useSettingsSlice.ts'), 'utf-8');
  assert(settingsSliceSource.includes('saveToStorage(key, data)'), '8.6.9: useSettingsSlice persistEntity routes through saveToStorage');
  assert(settingsSliceSource.includes("saveToStorage('homepageConfig'"), '8.6.9: useSettingsSlice homepageConfig routes through saveToStorage');

  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});

