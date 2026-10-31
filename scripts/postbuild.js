import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('Copied dist/index.html to dist/404.html for GitHub Pages SPA support.');
}

const noJekyllPath = path.join(distPath, '.nojekyll');
fs.writeFileSync(noJekyllPath, '');
console.log('Created dist/.nojekyll to disable Jekyll processing on GitHub Pages.');

// 1. Extend sitemap.xml with dynamic content routes (Campaigns, Programs, Stories, News, Events)
const sitemapPath = path.join(distPath, 'sitemap.xml');
let initDataContent = '';
try {
  initDataContent = fs.readFileSync(path.resolve('src/data/initialData.ts'), 'utf8');
} catch (e) {}

if (fs.existsSync(sitemapPath) && initDataContent) {
  try {
    function extractSlugs(varName) {
      const start = initDataContent.indexOf('export const ' + varName);
      if (start === -1) return [];
      const end = initDataContent.indexOf('export const ', start + 20);
      const block = end !== -1 ? initDataContent.slice(start, end) : initDataContent.slice(start);
      return [...block.matchAll(/"slug":\s*"([^"]+)"/g)].map(m => m[1]);
    }

    const today = new Date().toISOString().split('T')[0];
    const campaigns = extractSlugs('INITIAL_CAMPAIGNS').map(s => `  <url>\n    <loc>https://infinitybangladesh.vercel.app/campaigns/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>`);
    const programs = extractSlugs('INITIAL_PROGRAMS').map(s => `  <url>\n    <loc>https://infinitybangladesh.vercel.app/programs/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.80</priority>\n  </url>`);
    const stories = extractSlugs('INITIAL_IMPACT_STORIES').map(s => `  <url>\n    <loc>https://infinitybangladesh.vercel.app/stories/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.75</priority>\n  </url>`);
    const news = extractSlugs('INITIAL_NEWS').map(s => `  <url>\n    <loc>https://infinitybangladesh.vercel.app/news/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.80</priority>\n  </url>`);
    const events = extractSlugs('INITIAL_EVENTS').map(s => `  <url>\n    <loc>https://infinitybangladesh.vercel.app/events/${s}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.75</priority>\n  </url>`);

    const dynamicEntries = [...campaigns, ...programs, ...stories, ...news, ...events];
    let sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
    if (!sitemapXml.includes('/campaigns/winter-warmth-blanket-relief')) {
      sitemapXml = sitemapXml.replace('</urlset>', `${dynamicEntries.join('\n')}\n</urlset>`);
      fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
      console.log(`Extended dist/sitemap.xml with ${dynamicEntries.length} dynamic content routes.`);
    }
  } catch (err) {
    console.warn('Could not extend sitemap with dynamic routes:', err.message);
  }
}

// 2. Pre-render Social OpenGraph Entrypoints for WhatsApp, Facebook, and Twitter Bots
if (fs.existsSync(indexPath) && initDataContent) {
  try {
    const baseHtml = fs.readFileSync(indexPath, 'utf8');

    function extractItems(startMarker, endMarker, basePath) {
      const start = initDataContent.indexOf(startMarker);
      if (start === -1) return [];
      const end = endMarker ? initDataContent.indexOf(endMarker, start + 20) : initDataContent.length;
      const block = end !== -1 ? initDataContent.slice(start, end) : initDataContent.slice(start);

      const items = [];
      const entries = block.split(/\{\s*"id":/);
      for (const entry of entries.slice(1)) {
        const slugM = entry.match(/"slug":\s*"([^"]+)"/);
        const titleM = entry.match(/"en":\s*"([^"]+)"/);
        const imgM = entry.match(/"imageUrl":\s*"([^"]+)"/);
        const descM = entry.match(/"(?:shortDescription|description)":\s*\{[\s\S]*?"en":\s*"([^"]+)"/);
        if (slugM && titleM) {
          items.push({
            routePath: `${basePath}/${slugM[1]}`,
            title: `${titleM[1]} | Infinity Bangladesh`,
            image: imgM ? imgM[1] : 'https://infinitybangladesh.vercel.app/images/infinity-cover-hero.jpg',
            desc: descM ? descM[1].slice(0, 160) : 'Humanitarian initiative by Infinity Bangladesh (Team Infinity).'
          });
        }
      }
      return items;
    }

    const prerenderRoutes = [
      ...extractItems('export const INITIAL_CAMPAIGNS', 'export const INITIAL_PROGRAMS', 'campaigns'),
      ...extractItems('export const INITIAL_PROGRAMS', 'export const INITIAL_PROGRAM_EVENTS', 'programs')
    ];

    let renderedCount = 0;
    prerenderRoutes.forEach(item => {
      const canonicalUrl = `https://infinitybangladesh.vercel.app/${item.routePath}`;
      let customHtml = baseHtml
        .replace(/<title>.*?<\/title>/, `<title>${item.title}</title>`)
        .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${item.title}" />`)
        .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${item.desc}" />`)
        .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${item.image}" />`)
        .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
        .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${item.title}" />`)
        .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${item.desc}" />`)
        .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${item.image}" />`);

      const targetDir = path.join(distPath, item.routePath);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), customHtml, 'utf8');
      renderedCount++;
    });
    console.log(`Pre-rendered ${renderedCount} social bot entrypoints for campaigns and programs.`);
  } catch (err) {
    console.warn('Could not pre-render social bot entrypoints:', err.message);
  }
}

// 3. Also copy to root docs/ folder so GitHub Pages can serve directly from main branch /docs folder
const docsPath = path.resolve('docs');
if (fs.existsSync(docsPath)) {
  fs.rmSync(docsPath, { recursive: true, force: true });
}
fs.mkdirSync(docsPath, { recursive: true });
for (const file of fs.readdirSync(distPath)) {
  if (file !== 'docs') {
    fs.cpSync(path.join(distPath, file), path.join(docsPath, file), { recursive: true });
  }
}
console.log('Copied dist/ to root docs/ for main + /docs folder support.');
