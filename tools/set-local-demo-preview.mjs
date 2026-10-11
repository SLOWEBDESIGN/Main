import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const directory = new URL('../.demo-access/', import.meta.url);
const file = new URL('local-preview.json', directory);
const action = process.argv[2];
if (!['on', 'off', 'status'].includes(action)) {
  console.error('Usage: node tools/set-local-demo-preview.mjs on|off|status');
  process.exit(1);
}
if (action !== 'status') {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(file, JSON.stringify({ bypassAccessCode: action === 'on' }, null, 2) + '\n', { mode: 0o600 });
}
let enabled = false;
try { enabled = JSON.parse(await readFile(file, 'utf8')).bypassAccessCode === true; } catch { /* Disabled by default. */ }
console.log(`Local four-digit bypass: ${enabled ? 'ON' : 'OFF'}. Hosted access unchanged.\nSettings: ${fileURLToPath(file)}`);
