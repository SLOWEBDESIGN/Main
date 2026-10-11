import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(await readFile(join(root, 'private-demos/registry.json'), 'utf8'));
const manifest = [];
async function walk(directory, prefix) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + '/' + entry.name;
    if (entry.isDirectory()) await walk(join(directory, entry.name), relative);
    else {
      if (/\.(map|stl|3mf|step|blend)$/i.test(entry.name) || entry.name.startsWith('.')) throw new Error(`Private bundle contains a forbidden source artifact: ${relative}`);
      const data = await readFile(join(directory, entry.name));
      manifest.push({ path: relative, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
    }
  }
}
for (const demo of registry) {
  await stat(join(root, 'private-demos/artifacts', demo.slug, 'index.html'));
  await walk(join(root, 'private-demos/artifacts', demo.slug), 'artifacts/' + demo.slug);
}
const target = join(root, 'private-demos/bundles');
await mkdir(target, { recursive: true });
await writeFile(join(target, 'manifest.json'), JSON.stringify({ version: 1, files: manifest }, null, 2));
execFileSync('tar', ['-czf', join(target, 'private-preview-assets.tgz'), '-C', join(root, 'private-demos'), 'registry.json', 'artifacts']);
console.log(`Private local bundle prepared: ${manifest.length} files, ${registry.length} demos. No credentials, source CAD, upload, or deployment.`);
