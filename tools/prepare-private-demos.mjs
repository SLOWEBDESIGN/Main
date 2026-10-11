import { spawnSync } from 'node:child_process';
import { readFile, stat, mkdir, cp } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDemoAccess } from './demo-access.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(await readFile(join(root, 'private-demos/registry.json'), 'utf8'));
const requested = process.argv.slice(2);
if (requested.includes('--help')) { console.log('node tools/prepare-private-demos.mjs [outpost|vansmith|amano|armes]\nBuilds private local exports. Does not upload, push, or deploy.'); process.exit(0); }
for (const item of registry.filter(demo => !requested.length || requested.includes(demo.slug))) {
  const source = resolve(root, '..', item.project);
  const command = spawnSync(process.execPath, [join(source, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], {
    cwd: source, stdio: 'inherit', env: { ...process.env, SITE_DEMO_EXPORT: '1', NEXT_PUBLIC_DEMO_BASE_PATH: '/__private_demo__', NEXT_DIST_DIR: '.next-private-demo', NEXT_TELEMETRY_DISABLED: '1' },
  });
  if (command.status !== 0) throw new Error(`Private export failed for ${item.title}.`);
  // Next's export destination follows a custom distDir. Verify the artifact
  // instead of guessing whether this version exports to out/ or distDir/.
  let output;
  for (const candidate of ['.next-private-demo', 'out']) {
    try { if ((await stat(join(source, candidate, 'index.html'))).isFile()) { output = join(source, candidate); break; } } catch { /* continue */ }
  }
  if (!output) throw new Error(`No exported index.html found for ${item.title}.`);
  const destination = join(root, 'private-demos/artifacts', item.slug);
  await mkdir(destination, { recursive: true });
  await cp(output, destination, { recursive: true, filter: path => !path.endsWith('.map') });
  console.log(`${item.title}: private local export ready.`);
}
await createDemoAccess({ registry, directory: join(root, '.demo-access') }).initialize();
console.log('Demo codes initialized in the private local store. View them in Money > SLO Companies > Private website demos.');
