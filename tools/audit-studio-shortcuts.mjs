import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const workspace = resolve('..');
const canonical = await readFile('public/studio-shortcuts.js');
const hash = value => createHash('sha256').update(value).digest('hex');
const next = ['van-configurator', 'vansmith-configurator', 'amano-configurator', 'armes-configurator', 'armes-aviation-demo', 's2s-guidance', 'benyamin-portfolio', 'swim-lessons', 'slo-fulfillment'];
for (const site of next) {
  assert.equal(hash(await readFile(join(workspace, site, 'public/studio-shortcuts.js'))), hash(canonical));
  const layout = site === 'slo-fulfillment' ? 'src/pages/_app.tsx' : 'src/app/layout.tsx';
  assert.ok((await readFile(join(workspace, site, layout), 'utf8')).includes('studio-shortcuts.js'));
}
async function html(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', '3dprintdash', 'ext', 'addons'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await html(path));
    else if (entry.name.endsWith('.html')) result.push(path);
  }
  return result;
}
let pages = 0;
for (const [site, sub] of [['slo-web-design', 'public'], ['sensorium-therapy', ''], ['redding-weed-suppression-concepts', ''], ['focus-reader', 'site']]) {
  const root = join(workspace, site, sub);
  assert.equal(hash(await readFile(join(root, 'studio-shortcuts.js'))), hash(canonical));
  for (const file of await html(root)) {
    assert.ok((await readFile(file, 'utf8')).includes('studio-shortcuts.js'), `${file} is missing the website shortcut script.`);
    pages++;
  }
}
console.log(`Shortcut coverage PASS: ${next.length} Next layouts and ${pages} HTML pages across 13 local site projects. SLO and SD share one source. 3DPrintDash, extensions, Office add-ins, and rejected/archive copies excluded.`);
