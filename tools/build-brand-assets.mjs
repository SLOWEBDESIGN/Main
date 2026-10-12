import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Generate browser fallbacks and social cards from the same architectural mark.
// Run with BRAND_ASSET_RUNTIME pointing at a runtime that already includes sharp.
const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', {
  paths: process.env.BRAND_ASSET_RUNTIME ? [process.env.BRAND_ASSET_RUNTIME] : undefined,
}));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const brandDir = path.join(publicDir, 'brand');
const mark = await fs.readFile(path.join(brandDir, 'studio-mark-v2.svg'), 'utf8');
const pinned = await fs.readFile(path.join(brandDir, 'studio-pinned-v2.svg'));

for (const size of [16, 32, 48, 180, 192, 512]) {
  const png = await sharp(Buffer.from(mark)).resize(size, size).png().toBuffer();
  await fs.writeFile(path.join(brandDir, `studio-icon-${size}-v2.png`), png);
  await fs.writeFile(path.join(publicDir, size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`), png);
  if (size === 32) {
    // ICO supports a PNG payload; browsers requesting /favicon.ico get the new mark.
    const header = Buffer.alloc(22);
    header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
    header[6] = size; header[7] = size;
    header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
    header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
    await fs.writeFile(path.join(publicDir, 'favicon.ico'), Buffer.concat([header, png]));
  }
}
await fs.writeFile(path.join(publicDir, 'favicon-animated.svg'), mark);
await fs.writeFile(path.join(brandDir, 'favicon-sd.svg'), mark);
await fs.writeFile(path.join(publicDir, 'safari-pinned-tab.svg'), pinned);

const sky = (await fs.readFile(path.join(publicDir, 'media/hero/white-space-v1.png'))).toString('base64');
const geometry = mark.slice(mark.indexOf('<g '), mark.indexOf('</g>') + 4);
for (const [key, name, domain] of [
  ['slo', 'SLO Web Design', 'slowebdesign.com'],
  ['sd', 'San Diego Web Design', 'sdwebdesign.tech'],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="paper"><stop stop-color="#f4f6f8" stop-opacity=".97"/><stop offset=".60" stop-color="#f4f6f8" stop-opacity=".88"/><stop offset="1" stop-color="#f4f6f8" stop-opacity=".25"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#ffc28c" stop-opacity=".8"/><stop offset="1" stop-color="#ffc28c" stop-opacity="0"/></radialGradient>
    </defs>
    <image href="data:image/png;base64,${sky}" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>
    <path fill="url(#paper)" d="M0 0h1200v630H0Z"/>
    <g font-family="Arial, Helvetica, sans-serif" fill="#26323f">
      <text x="64" y="94" font-size="31" font-weight="700" letter-spacing="-1">${name}</text>
      <text x="60" y="272" font-size="66" font-weight="700" letter-spacing="-3">We make the</text>
      <text x="60" y="352" font-size="66" font-weight="700" letter-spacing="-3">impossible possible.</text>
      <text x="64" y="420" font-size="25" fill="#5d7187">Web design / Reels / Digital tools</text>
      <text x="64" y="562" font-size="24" fill="#5d7187">${domain}</text>
    </g>
    <g stroke="#899caf" fill="none" stroke-width="1" opacity=".5">
      <path d="m825 142 194 44 91 126-73 193-212-53-69-155Z"/>
      <path d="m825 142 285 170M756 297l281 208" stroke-dasharray="3 8"/>
    </g>
    <g fill="#879daf"><circle cx="825" cy="142" r="3"/><circle cx="1019" cy="186" r="3"/><circle cx="1110" cy="312" r="3"/><circle cx="1037" cy="505" r="3"/><circle cx="825" cy="452" r="3"/><circle cx="756" cy="297" r="3"/></g>
    <g transform="translate(730 162) scale(5.4)">${geometry}</g>
    <circle cx="962" cy="232" r="40" fill="url(#glow)"/>
    <circle cx="962" cy="232" r="5" fill="#e7a265"/>
    <path d="M952 232h20m-10-10v20" stroke="#fff8ef" stroke-width="2"/>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(path.join(brandDir, `share-${key}-v2.jpg`));
}
console.log('Generated two 1200x630 share cards, six icon sizes, ICO, and Safari/legacy fallbacks.');
