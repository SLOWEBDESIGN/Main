import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomInt } from 'node:crypto';
import { createDemoAccess } from './demo-access.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.DEMO_TEST_URL || 'http://127.0.0.1:3011';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'This test is local-only.');
const registry = JSON.parse(await readFile(join(root, 'private-demos/registry.json'), 'utf8'));
const access = createDemoAccess({ registry, directory: join(root, '.demo-access') });
// A distinct mocked connection IP isolates each local run without clearing or
// weakening the rate limiter for the real browser visitor.
const testIp = `127.2.${randomInt(1, 255)}.${randomInt(1, 255)}`;
const hash = value => createHash('sha256').update(value).digest('hex');
async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await files(join(directory, entry.name), name + '/'));
    else result.push(name);
  }
  return result;
}
async function post(path, body) {
  return fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, 'x-nf-client-connection-ip': testIp }, body: JSON.stringify(body) });
}
for (const demo of registry) {
  const code = demo.code;
  const fresh = await access.reset(code);
  try {
    const entry = await fetch(`${base}/visit/${code}`);
    assert.equal(entry.status, 200);
    assert.match(entry.headers.get('cache-control'), /no-store/);
    assert.match(entry.headers.get('x-robots-tag'), /noindex/);
    assert.ok(!(await entry.text()).includes(fresh.accessCode), 'Password must not appear in public HTML.');
    assert.equal((await post('/api/visits/resolve', { code })).status, 200);
    const wrong = fresh.accessCode === '0000' ? '1111' : '0000';
    assert.equal((await post('/api/visits/unlock', { code, accessCode: wrong })).status, 401);
    assert.equal((await access.list()).find(item => item.code === code).remaining, 2);
    const first = await post('/api/visits/unlock', { code, accessCode: fresh.accessCode });
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('set-cookie'), null);
    const visit = await first.json();
    assert.equal(visit.remaining, 1);
    assert.ok(visit.expiresAt - Date.now() > 3590000);
    const prefix = `${base}/visit/${code}/content/${visit.token}`;
    const html = await fetch(prefix + '/');
    assert.equal(html.status, 200);
    assert.match(html.headers.get('cache-control'), /no-store/);
    assert.equal(html.headers.get('referrer-policy'), 'no-referrer');
    const text = await html.text();
    assert.ok(!text.includes('/__private_demo__'));
    assert.ok(text.includes('/private-demo-runtime.js'));
    const exported = join(root, 'private-demos/artifacts', demo.slug);
    const paths = await files(exported);
    for (const page of paths.filter(path => !path.includes('/') && path.endsWith('.html') && !['404.html', '_not-found.html'].includes(path))) {
      const route = page === 'index.html' ? '/' : '/' + page.slice(0, -5);
      const rendered = await fetch(prefix + route);
      assert.equal(rendered.status, 200, `${demo.title} ${route} must load.`);
      assert.match(rendered.headers.get('x-robots-tag'), /noindex/);
      assert.match(await rendered.text(), /<title>/);
    }
    const javascript = paths.find(path => path.endsWith('.js') && path.includes('_next/static/'));
    assert.ok(javascript);
    const js = await fetch(prefix + '/' + javascript);
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type'), /javascript/);
    assert.ok(!(await js.text()).includes('/__private_demo__'));
    const model = paths.find(path => path.endsWith('.glb'));
    assert.ok(model, 'Every demo must include its model.');
    const original = await readFile(join(exported, model));
    const head = await fetch(prefix + '/' + model, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(Number(head.headers.get('content-length')), original.length);
    const chunks = [];
    for (let start = 0; start < original.length; start += 2 * 1024 * 1024) {
      const end = Math.min(start + 2 * 1024 * 1024 - 1, original.length - 1);
      const part = await fetch(prefix + '/' + model, { headers: { Range: `bytes=${start}-${end}` } });
      assert.equal(part.status, 206);
      assert.equal(part.headers.get('content-range'), `bytes ${start}-${end}/${original.length}`);
      chunks.push(Buffer.from(await part.arrayBuffer()));
    }
    assert.equal(hash(Buffer.concat(chunks)), hash(original));
    assert.equal((await fetch(`${base}/visit/${code}/content/${'0'.repeat(64)}/${model}`)).status, 401);
    assert.equal((await fetch(`${base}/private-demos/artifacts/${demo.slug}/${model}`)).status, 404);
    const second = await post('/api/visits/unlock', { code, accessCode: fresh.accessCode });
    assert.equal(second.status, 200);
    assert.equal((await second.json()).remaining, 0);
    assert.equal((await post('/api/visits/unlock', { code, accessCode: fresh.accessCode })).status, 403);
    await access.reset(code);
    assert.equal((await fetch(prefix + '/')).status, 401);
    console.log(`${demo.title}: protected HTML, JS, complete model ranges, two visits, and revocation PASS.`);
  } finally {
    await access.reset(code);
  }
}
console.log('All four demos verified locally. Access codes refreshed; two visits available per demo. No secrets printed.');
