import fs from 'fs';
import path from 'path';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  fs.mkdirSync('public/fonts', { recursive: true });

  const url = 'https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
  console.log('Fetching Google Fonts CSS...');
  const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
  const css = await res.text();

  // Parse font-face blocks
  const blocks = css.split('@font-face').slice(1).map(b => '@font-face' + b);

  const localCssBlocks = [];
  const downloadedFiles = new Set();

  for (const block of blocks) {
    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/);
    const styleMatch = block.match(/font-style:\s*([^;]+);/);
    const weightMatch = block.match(/font-weight:\s*([^;]+);/);
    const unicodeMatch = block.match(/unicode-range:\s*([^;]+);/);
    const urlMatch = block.match(/src:\s*url\((https:[^)]+\.woff2)\)/);

    if (!familyMatch || !weightMatch || !urlMatch) continue;

    const family = familyMatch[1].trim();
    const weight = weightMatch[1].trim();
    const style = styleMatch ? styleMatch[1].trim() : 'normal';
    const remoteUrl = urlMatch[1].trim();
    const unicodeRange = unicodeMatch ? unicodeMatch[1].trim() : null;

    // Filter to Latin for Plus Jakarta Sans and Bengali/Latin for Anek Bangla
    const isBengali = block.includes('U+0980') || block.includes('U+0964');
    const isLatin = block.includes('U+0000') || block.includes('latin');

    if (!isBengali && !isLatin) {
      // Skip greek/vietnamese/cyrillic subsets to keep weight lean
      continue;
    }

    const familySlug = family.toLowerCase().replace(/\s+/g, '-');
    const subsetSlug = isBengali ? 'bengali' : 'latin';
    const filename = `${familySlug}-${weight}-${subsetSlug}.woff2`;
    const localFilePath = path.join('public/fonts', filename);

    if (!downloadedFiles.has(filename)) {
      console.log(`Downloading ${filename} from ${remoteUrl}...`);
      const fontRes = await fetch(remoteUrl);
      const buf = Buffer.from(await fontRes.arrayBuffer());
      fs.writeFileSync(localFilePath, buf);
      downloadedFiles.add(filename);
      console.log(`Saved ${filename} (${buf.length} bytes)`);
    }

    let localBlock = `@font-face {\n  font-family: '${family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${filename}') format('woff2');`;
    if (unicodeRange) {
      localBlock += `\n  unicode-range: ${unicodeRange};`;
    }
    localBlock += '\n}';
    localCssBlocks.push(localBlock);
  }

  // Add fallback metric overrides for CLS mitigation
  const fallbackCss = `
/* Fallback Metric Overrides for Zero-CLS Font Swapping */
@font-face {
  font-family: 'Plus Jakarta Sans Fallback';
  src: local('Segoe UI'), local('Arial'), local('sans-serif');
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
  size-adjust: 100%;
}
`;

  const finalCss = `/* Self-Hosted Subsetted Fonts (Zero Render-Blocking External Stylesheets) */\n${localCssBlocks.join('\n\n')}\n${fallbackCss}`;
  fs.writeFileSync('scratch/local-fonts.css', finalCss);
  console.log('Saved scratch/local-fonts.css with', localCssBlocks.length, 'font faces.');
}

main().catch(console.error);

