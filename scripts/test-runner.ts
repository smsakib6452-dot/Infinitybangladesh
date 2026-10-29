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

