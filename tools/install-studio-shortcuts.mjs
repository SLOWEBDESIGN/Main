import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspace = resolve(root, '..');
const source = await readFile(join(root, 'public/studio-shortcuts.js'));
const registry = JSON.parse(await readFile(join(root, 'private-demos/registry.json'), 'utf8'));
const nextSites = ['van-configurator', 'vansmith-configurator', 'amano-configurator', 'armes-configurator', 'armes-aviation-demo', 's2s-guidance', 'benyamin-portfolio', 'swim-lessons', 'slo-fulfillment'];
const changed = [];
function patch(path, before, after) {
  const edit = `*** Begin Patch\n*** Update File: ${path}\n@@\n-${before}\n+${after}\n*** End Patch`;
  // All authored file edits go through apply_patch. Asset copies below are
  // mechanical synchronization of the one canonical script.
  execFileSync('apply_patch', [edit], { stdio: 'pipe' });
  changed.push(relative(workspace, path));
}
for (const name of nextSites) {
  const project = join(workspace, name);
  await mkdir(join(project, 'public'), { recursive: true });
  await writeFile(join(project, 'public/studio-shortcuts.js'), source);
  const preview = registry.some(item => item.project === name);
  const path = join(project, name === 'slo-fulfillment' ? 'src/pages/_app.tsx' : 'src/app/layout.tsx');
  const text = await readFile(path, 'utf8');
  if (!text.includes('studio-shortcuts.js')) {
    const lines = text.split('\n');
    const line = lines.find(value => value.includes('<body>')) || lines.find(value => value.includes('return <Component'));
    if (!line) throw new Error(`No layout insertion point in ${path}.`);
    const script = `<script src={(process.env.NEXT_PUBLIC_DEMO_BASE_PATH || '') + '/studio-shortcuts.js'} defer${preview ? ' data-demo-preview' : ''}></script>`;
    const replacement = name === 'slo-fulfillment' ? line.replace('<Component {...pageProps} />', '<><script src="/studio-shortcuts.js" defer></script><Component {...pageProps} /></>') : line.replace('<body>', `<body>${script}`);
    patch(path, line, replacement);
  }
  if (preview) {
    const boundary = join(project, 'scripts/verify-demo-boundary.mjs');
    const text = await readFile(boundary, 'utf8');
    const line = text.split('\n').find(value => value.includes('const unexpected = publicFiles.filter'));
    if (line && !line.includes('studio-shortcuts.js')) patch(boundary, line, line.replace('path => ', 'path => path !== "public/studio-shortcuts.js" && '));
  }
}
async function htmls(directory, result = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', '3dprintdash', 'ext', 'addons'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await htmls(path, result);
    else if (entry.name.endsWith('.html')) result.push(path);
  }
  return result;
}
for (const [folder, servedRoot] of [['sensorium-therapy', ''], ['redding-weed-suppression-concepts', ''], ['focus-reader', 'site'], ['slo-web-design', 'public']]) {
  const publicRoot = join(workspace, folder, servedRoot);
  await writeFile(join(publicRoot, 'studio-shortcuts.js'), source);
  for (const path of await htmls(publicRoot)) {
    const text = await readFile(path, 'utf8');
    if (text.includes('studio-shortcuts.js')) continue;
    const src = relative(dirname(path), join(publicRoot, 'studio-shortcuts.js')).split('\\').join('/');
    const line = text.split('\n').find(value => value.includes('</head>'));
    if (!line) { console.log(`No head in ${path}`); continue; }
    patch(path, line, line.replace('</head>', `<script src="${src}" defer></script></head>`));
  }
}
console.log(JSON.stringify({ changed, copiedTo: nextSites, excluded: '3DPrintDash, archived projects, source CAD files, and dependency folders' }, null, 2));
