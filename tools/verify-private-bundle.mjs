import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const build = resolve(process.env.NEXT_DIST_DIR || '.next-verify');
async function traces(directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) result.push(...await traces(path));
    else if (item.name.endsWith('.nft.json')) result.push(path);
  }
  return result;
}
for (const file of await traces(build)) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  assert.ok(!data.files.some(path => /(?:^|\/)\.demo-access(?:\/|$)|(?:^|\/)\.env(?:\.|$)|private-demos\/(?:bundles|artifacts)/.test(path)), 'Build tracing must exclude passwords, local environment files, and private demo copies.');
}
const route = JSON.parse(await readFile(join(build, 'server/pages/api/visit-content/[...path].js.nft.json'), 'utf8'));
const assets = route.files.filter(path => path.includes('private-demos/artifacts/'));
assert.equal(assets.length, 0, 'Production reads private assets from authenticated object storage, not bundled local exports.');
console.log('Private server bundle PASS: zero local demo assets, access-state files, archives, or environment files.');
