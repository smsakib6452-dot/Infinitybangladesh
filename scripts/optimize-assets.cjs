const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const brandDir = path.join(__dirname, '..', 'public', 'brand');
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  const eventsDir = path.join(__dirname, '..', 'public', 'images', 'events');

  console.log('--- 1. Optimizing infi-robot.png ---');
  const robotSrc = path.join(brandDir, 'infi-robot.png');
  const robotDest = path.join(brandDir, 'infi-robot.webp');
  await sharp(robotSrc)
    .resize(152, 152, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85 })
    .toFile(robotDest);
  const robotStat = fs.statSync(robotDest);
  console.log(`infi-robot.webp created: ${(robotStat.size / 1024).toFixed(1)} KB (down from 109.9 KB)`);

  console.log('--- 2. Optimizing infinity-cover-hero.jpg ---');
  const heroSrc = path.join(imagesDir, 'infinity-cover-hero.jpg');
  const heroDestWebp = path.join(imagesDir, 'infinity-cover-hero.webp');
  const heroDestMobileWebp = path.join(imagesDir, 'infinity-cover-hero-640.webp');
  await sharp(heroSrc)
    .webp({ quality: 82 })
    .toFile(heroDestWebp);
  await sharp(heroSrc)
    .resize(640, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(heroDestMobileWebp);
  console.log(`infinity-cover-hero.webp: ${(fs.statSync(heroDestWebp).size / 1024).toFixed(1)} KB`);
  console.log(`infinity-cover-hero-640.webp: ${(fs.statSync(heroDestMobileWebp).size / 1024).toFixed(1)} KB`);

  console.log('--- 3. Optimizing winter-warmth.jpg ---');
  const winterSrc = path.join(eventsDir, 'winter-warmth.jpg');
  if (fs.existsSync(winterSrc)) {
    const winterDest = path.join(eventsDir, 'winter-warmth.webp');
    await sharp(winterSrc)
      .webp({ quality: 80 })
      .toFile(winterDest);
    console.log(`winter-warmth.webp: ${(fs.statSync(winterDest).size / 1024).toFixed(1)} KB`);
  }
  const rootWinter = path.join(imagesDir, 'winter-warmth.jpg');
  if (fs.existsSync(rootWinter)) {
    const rootWinterDest = path.join(imagesDir, 'winter-warmth.webp');
    await sharp(rootWinter)
      .webp({ quality: 80 })
      .toFile(rootWinterDest);
    console.log(`images/winter-warmth.webp: ${(fs.statSync(rootWinterDest).size / 1024).toFixed(1)} KB`);
  }

  console.log('--- 4. Optimizing Infinitylifeline-logo ---');
  const lifelineSvg = path.join(brandDir, 'Infinitylifeline-logo.svg');
  const lifelineWebp = path.join(brandDir, 'Infinitylifeline-logo.webp');
  await sharp(lifelineSvg, { density: 150 })
    .webp({ quality: 90 })
    .toFile(lifelineWebp);
  console.log(`Infinitylifeline-logo.webp created: ${(fs.statSync(lifelineWebp).size / 1024).toFixed(1)} KB (down from 211.5 KB)`);
}

run().catch(console.error);

