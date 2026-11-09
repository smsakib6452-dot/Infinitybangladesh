const sharp = require('sharp');
const fs = require('fs');

fs.mkdirSync('public/images/gallery', { recursive: true });

const svg = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1914"/>
      <stop offset="50%" stop-color="#004835"/>
      <stop offset="100%" stop-color="#0F221D"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D97706" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#006A4E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="640" cy="360" r="380" fill="url(#glow)"/>
  <text x="640" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#F59E0B" text-anchor="middle" letter-spacing="4">INFINITY BANGLADESH DOCUMENTARY</text>
  <text x="640" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">Moments of Humanity in Action</text>
  <text x="640" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#A7F3D0" text-anchor="middle">Official Archival Footage • Hathazari, Chattogram</text>
</svg>`;

sharp(Buffer.from(svg))
  .webp({ quality: 85 })
  .toFile('public/images/gallery/video-poster-placeholder.webp')
  .then(info => console.log('Successfully generated public/images/gallery/video-poster-placeholder.webp:', info.size, 'bytes'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

