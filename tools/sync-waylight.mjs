#!/usr/bin/env node
// Copies the real Waylight extension build into public/demos/waylight/ext so the
// homepage can run the actual popup and content script. Files are copied byte for
// byte; the demo host pages around them only provide the browser-extension API.
//
//   node tools/sync-waylight.mjs [path/to/focus-reader]
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2] ?? path.join(root, '..', 'focus-reader'));
const ext = path.join(source, 'extension');
const out = path.join(root, 'public', 'demos', 'waylight', 'ext');

if (!existsSync(path.join(ext, 'manifest.json'))) {
  console.error(`No Waylight extension build found at ${ext}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(path.join(ext, 'manifest.json'), 'utf8'));
mkdirSync(path.join(out, 'icons'), { recursive: true });
mkdirSync(path.join(out, 'fonts'), { recursive: true });

const copy = (from, to) => copyFileSync(path.join(ext, from), path.join(out, to ?? from));
for (const file of ['manifest.json', 'popup.html', 'popup.js', 'content.js']) copy(file);
for (const size of [32, 64, 128]) copy(`icons/icon-${size}.png`);
for (const font of readdirSync(path.join(ext, 'fonts'))) {
  if (font.endsWith('.woff2') && !font.startsWith('._')) copy(`fonts/${font}`);
}
// OpenDyslexic ships under the SIL Open Font License, which travels with the font.
copyFileSync(path.join(source, 'THIRD_PARTY_LICENSES.txt'), path.join(out, 'THIRD_PARTY_LICENSES.txt'));

console.log(`Synced Waylight ${manifest.version} from ${ext}`);
