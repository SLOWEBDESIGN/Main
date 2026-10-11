import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { createDemoAccess } from './demo-access.mjs';
import { createHostedDemoStorage } from './hosted-demo-storage.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const moneyRoot = resolve(root, '../..', '3printdash-app');
export async function localReleaseConfig() {
  const parse = text => Object.fromEntries(text.split(/\r?\n/).flatMap(line => {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    return match ? [[match[1], match[2].trim().replace(/^(["'])(.*)\1$/, '$2')]] : [];
  }));
  return { ...parse(await readFile(join(moneyRoot, '.env.money'), 'utf8')),
    ...parse(await readFile(join(root, '.env.local'), 'utf8')) };
}
const config = await localReleaseConfig();
const siteId = JSON.parse(await readFile(join(root, '.netlify/state.json'), 'utf8')).siteId;
const registry = JSON.parse(await readFile(join(root, 'private-demos/registry.json'), 'utf8'));
const supabase = createClient(config.SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const storage = createHostedDemoStorage(supabase);
const access = createDemoAccess({ registry, storage });
const action = process.argv[2];
async function netlify(path, method = 'GET', body) {
  const response = await fetch(`https://api.netlify.com/api/v1${path}`, {
    method, headers: { Authorization: `Bearer ${config.NETLIFY_AUTH_TOKEN}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    let reason = '';
    try { reason = (await response.json()).message || ''; } catch { /* no safe detail */ }
    throw new Error(`Netlify ${method} ${path.split('?')[0]} failed (${response.status}): ${reason}`);
  }
  return response.status === 204 ? null : response.json();
}
if (action === 'configure') {
  const settingsPath = join(root, '.demo-access/hosted-admin.json');
  let settings;
  try { settings = JSON.parse(await readFile(settingsPath, 'utf8')); } catch { /* first release */ }
  settings ??= { url: 'https://slowebdesign.com/api/visits/admin', key: randomBytes(32).toString('hex') };
  await mkdir(dirname(settingsPath), { recursive: true, mode: 0o700 });
  await writeFile(settingsPath, JSON.stringify(settings), { mode: 0o600 });
  const site = await netlify(`/sites/${siteId}`);
  const path = `/accounts/${site.account_id}/env`;
  const query = `?site_id=${siteId}`;
  const existing = await netlify(path + query);
  const variables = {
    DEMO_SUPABASE_URL: config.SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL,
    DEMO_SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY,
    DEMO_ADMIN_KEY: settings.key,
    DEMO_ACCESS_STORE: 'supabase',
  };
  for (const [key, value] of Object.entries(variables)) {
    if (!value) throw new Error(`Missing local configuration: ${key}`);
    if (existing.some(item => item.key === key))
      await netlify(`${path}/${key}${query}`, 'PATCH', { context: 'production', value });
    else await netlify(path + query, 'POST', [{ key, values: [{ context: 'production', value }] }]);
    console.log(`Configured ${key}; value not printed.`);
  }
} else if (action === 'assets') {
  const entries = [];
  async function walk(directory, prefix) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || /\.(map|env|stl|blend|3mf|step)$/i.test(entry.name)) continue;
      const file = join(directory, entry.name);
      const name = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) await walk(file, name);
      else if (entry.isFile()) {
        const data = await readFile(file);
        entries.push({ file, name, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
      }
    }
  }
  for (const item of registry) await walk(join(root, 'private-demos/artifacts', item.slug), item.slug);
  const version = createHash('sha256').update(JSON.stringify(entries.map(({ file, ...item }) => item))).digest('hex');
  const store = getStore({ name: 'private-website-demos', siteID: siteId, token: config.NETLIFY_AUTH_TOKEN, consistency: 'strong' });
  let cursor = 0; let completed = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < entries.length) {
      const entry = entries[cursor++];
      const key = `${version}/${entry.name}`;
      const meta = await store.getMetadata(key);
      if (meta?.metadata.sha256 !== entry.sha256) {
        const data = await readFile(entry.file);
        await store.set(key, data, { metadata: { bytes: entry.bytes, sha256: entry.sha256 } });
      }
      const uploaded = await store.get(key, { type: 'arrayBuffer' });
      if (uploaded === null || createHash('sha256').update(Buffer.from(uploaded)).digest('hex') !== entry.sha256)
        throw new Error(`Private asset verification failed: ${entry.name}`);
      completed++;
      if (completed % 50 === 0) console.log(`Uploaded and checksum-verified ${completed}/${entries.length} private files.`);
    }
  }));
  await store.setJSON(`${version}/manifest`, entries.map(({ file, ...item }) => item));
  // Activate only a completely uploaded release. Existing releases are retained.
  const site = await netlify(`/sites/${siteId}`);
  const path = `/accounts/${site.account_id}/env`;
  const query = `?site_id=${siteId}`;
  const existing = await netlify(path + query);
  if (existing.some(item => item.key === 'DEMO_ASSETS_VERSION'))
    await netlify(`${path}/DEMO_ASSETS_VERSION${query}`, 'PATCH', { context: 'production', value: version });
  else await netlify(path + query, 'POST', [{ key: 'DEMO_ASSETS_VERSION', values: [{ context: 'production', value: version }] }]);
  await writeFile(join(root, '.demo-access/assets-release.json'), JSON.stringify({ version, count: entries.length }), { mode: 0o600 });
  console.log(`Private asset release ready: ${entries.length} checksum-verified files; ${entries.filter(item => item.name.endsWith('.glb')).length} models.`);
} else if (action === 'status') {
  const site = await netlify(`/sites/${siteId}`);
  console.log(JSON.stringify({ name: site.name, domain: site.custom_domain, aliases: site.domain_aliases,
    branch: site.build_settings?.repo_branch, repo: site.build_settings?.repo_url,
    published: site.published_deploy?.id }, null, 2));
  const deploys = await netlify(`/sites/${siteId}/deploys?per_page=3`);
  console.log(JSON.stringify(deploys.map(({ id, state, error_message, commit_ref, branch, deploy_ssl_url }) =>
    ({ id, state, error_message, commit_ref, branch, deploy_ssl_url })), null, 2));
} else if (action === 'verify') {
  const domains = ['https://slowebdesign.com', 'https://sdwebdesign.tech'];
  const settings = JSON.parse(await readFile(join(root, '.demo-access/hosted-admin.json'), 'utf8'));
  async function post(base, path, body, key) {
    return fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base,
      ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify(body) });
  }
  for (const item of registry) {
    const key = `demo-${item.code}`;
    const original = await storage.read(key);
    const pristine = { ...original, used: 0, sessions: [] };
    await storage.change(key, () => ({ state: pristine, result: null }));
    try {
      for (const domain of domains) {
        const page = await fetch(`${domain}/visit/${item.code}`);
        assert.equal(page.status, 200);
        assert.match(page.headers.get('cache-control'), /no-store/);
        assert.match(page.headers.get('x-robots-tag'), /noindex/);
        assert.ok(!(await page.text()).includes(original.accessCode), 'Access password must not be public.');
        const fake = await fetch(`${domain}/visit/${item.code}/content/${'0'.repeat(64)}/index.html`);
        assert.equal(fake.status, 401);
        assert.equal((await fetch(`${domain}/visit/${item.code}/content/local-design-preview/index.html`)).status, 401);
        assert.equal((await fetch(`${domain}/private-demos/artifacts/${item.slug}/index.html`)).status, 404);
      }
      const wrong = original.accessCode === '0000' ? '1111' : '0000';
      assert.equal((await post(domains[0], '/api/visits/unlock', { code: item.code, accessCode: wrong })).status, 401);
      for (let visitNumber = 0; visitNumber < 2; visitNumber++) {
        const base = domains[visitNumber];
        const unlocked = await post(base, '/api/visits/unlock', { code: item.code, accessCode: original.accessCode });
        assert.equal(unlocked.status, 200, `${item.title} hosted unlock`);
        assert.equal(unlocked.headers.get('set-cookie'), null);
        const visit = await unlocked.json();
        assert.equal(visit.remaining, 1 - visitNumber);
        assert.ok(visit.expiresAt - Date.now() > 3590000 && visit.expiresAt - Date.now() <= 3600000);
        const prefix = `${base}/visit/${item.code}/content/${visit.token}`;
        const html = await fetch(prefix + '/');
        assert.equal(html.status, 200);
        assert.match(html.headers.get('x-robots-tag'), /noindex/);
        const text = await html.text();
        assert.ok(!text.includes('/__private_demo__'));
        assert.ok(text.includes('/private-demo-runtime.js'));
        if (visitNumber === 0) {
          const folder = join(root, 'private-demos/artifacts', item.slug);
          const paths = [];
          async function walk(directory, relative = '') {
            for (const entry of await readdir(directory, { withFileTypes: true })) {
              const name = relative + entry.name;
              if (entry.isDirectory()) await walk(join(directory, entry.name), name + '/');
              else paths.push(name);
            }
          }
          await walk(folder);
          for (const name of paths.filter(name => !name.includes('/') && name.endsWith('.html') && !['404.html', '_not-found.html'].includes(name))) {
            const response = await fetch(prefix + '/' + (name === 'index.html' ? '' : name.slice(0, -5)));
            assert.equal(response.status, 200, `${item.title}: ${name}`);
          }
          const jsPath = paths.find(name => name.endsWith('.js') && name.includes('_next/static/'));
          assert.equal((await fetch(prefix + '/' + jsPath)).status, 200);
          const model = paths.find(name => name.endsWith('.glb'));
          const local = await readFile(join(folder, model));
          const metadata = await fetch(prefix + '/' + model + '?metadata=1');
          assert.equal(metadata.status, 200);
          assert.equal((await metadata.json()).bytes, local.length);
          const chunks = [];
          for (let start = 0; start < local.length; start += 2 * 1024 * 1024) {
            const end = Math.min(start + 2 * 1024 * 1024 - 1, local.length - 1);
            const response = await fetch(prefix + '/' + model, { headers: { Range: `bytes=${start}-${end}` } });
            assert.equal(response.status, 206);
            assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/${local.length}`);
            chunks.push(Buffer.from(await response.arrayBuffer()));
          }
          assert.equal(createHash('sha256').update(Buffer.concat(chunks)).digest('hex'), createHash('sha256').update(local).digest('hex'));
        }
        // Simulate an expired visit in the real backend and confirm the live route rejects it.
        await storage.change(key, state => ({ state: { ...state, sessions: state.sessions.map(session => ({ ...session, expiresAt: Date.now() - 1 })) }, result: null }));
        assert.equal((await fetch(prefix + '/')).status, 401);
      }
      assert.equal((await post(domains[0], '/api/visits/unlock', { code: item.code, accessCode: original.accessCode })).status, 403);
      console.log(`${item.title}: both live domains, password gate, two one-hour visits, expiry, private pages and model ranges PASS.`);
    } finally {
      await storage.change(key, () => ({ state: pristine, result: null }));
      await writeFile(join(root, '.demo-access', key + '.json'), JSON.stringify(pristine), { mode: 0o600 });
    }
  }
  assert.equal((await post(domains[0], '/api/visits/admin', { action: 'list' })).status, 401);
  const admin = await post(domains[0], '/api/visits/admin', { action: 'list' }, settings.key);
  assert.equal(admin.status, 200);
  console.log('Hosted Money administration PASS. All four passwords retain two unused visits.');
} else if (action === 'seed') {
  for (const item of registry) {
    const key = `demo-${item.code}`;
    if (await storage.read(key)) { console.log(`${item.title}: existing hosted code preserved.`); continue; }
    const local = JSON.parse(await readFile(join(root, '.demo-access', key + '.json'), 'utf8'));
    await storage.change(key, old => ({ state: old ?? { ...local, used: 0, sessions: [] }, result: null }));
    console.log(`${item.title}: local access code copied privately to hosted storage.`);
  }
} else if (action === 'codes') {
  console.log(JSON.stringify((await access.list()).map(({ title, code, accessCode, remaining, active }) =>
    ({ title, code, accessCode, remaining, active })), null, 2));
} else if (action === 'cli') {
  const child = spawn('npm', ['exec', '--yes', '--package=netlify-cli@23.11.0', '--', 'netlify', ...process.argv.slice(3)], {
    cwd: root, stdio: 'inherit', env: { ...process.env, NETLIFY_AUTH_TOKEN: config.NETLIFY_AUTH_TOKEN,
      NETLIFY_SITE_ID: siteId, NEXT_TELEMETRY_DISABLED: '1' },
  });
  child.on('exit', code => process.exit(code ?? 1));
} else {
  console.error('Usage: node tools/hosted-demo-release.mjs configure|assets|status|verify|seed|codes|cli [arguments]');
  process.exit(1);
}
