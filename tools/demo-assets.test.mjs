import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoAssets } from './demo-assets.mjs';

const version = 'a'.repeat(64);
test('Hosted assets use a complete version and do not expose dotfiles or source models', async () => {
  const keys = [];
  const store = {
    async getMetadata(key) { keys.push(key); return key.endsWith('/index.html') ? { metadata: { bytes: 5 } } : null; },
    async get() { return Buffer.from('hello'); },
  };
  const assets = createDemoAssets({ store, version });
  const file = await assets.find('outpost', ['missing', 'index.html']);
  assert.equal(file.size, 5);
  assert.equal((await file.read()).toString(), 'hello');
  assert.deepEqual(keys, [`${version}/outpost/missing`, `${version}/outpost/index.html`]);
  keys.length = 0;
  for (const bad of ['../index.html', '.env', 'a/.env', 'model.stl', 'model.blend', 'app.js.map'])
    assert.equal(await assets.find('outpost', [bad]), null);
  assert.deepEqual(keys, []);
  assert.equal(await assets.find('../outpost', ['index.html']), null);
});
test('Missing storage configuration or storage failure never falls back to unprotected files', async () => {
  assert.throws(() => createDemoAssets({ store: {}, version: '' }), /Missing/);
  const assets = createDemoAssets({ store: { async getMetadata() { throw new Error('unavailable'); } }, version });
  await assert.rejects(assets.find('outpost', ['index.html']), /unavailable/);
});
