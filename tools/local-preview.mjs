import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, symlinkSync, watch } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// Next's generated files stay on APFS. FAT32 AppleDouble files look like pages.
const source = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node tools/local-preview.mjs [--port 3012] [--build]\nRuns a clean local mirror. The source repository is never replaced.');
  process.exit(0);
}
const building = args.includes('--build');
const port = args.includes('--port') ? args[args.indexOf('--port') + 1] : '3012';
if (!/^\d+$/.test(port) || +port < 1024 || +port > 65535) throw new Error('Choose a port between 1024 and 65535.');
const identity = createHash('sha256').update(source).digest('hex').slice(0, 12);
const cache = join(homedir(), 'Library', 'Caches', 'slo-web-design', identity);
const runtime = join(cache, building ? 'build' : 'preview');
mkdirSync(runtime, { recursive: true });
function run(command, argv, cwd = source) {
  const result = spawnSync(command, argv, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}`);
}
const lock = readFileSync(join(source, 'package-lock.json'));
const hash = createHash('sha256').update(lock).digest('hex');
const stamp = join(cache, '.dependencies.sha256');
if (!existsSync(stamp) || readFileSync(stamp, 'utf8') !== hash || !existsSync(join(cache, 'node_modules', 'next'))) {
  run('rsync', ['-a', join(source, 'package.json'), join(source, 'package-lock.json'), cache + '/']);
  run('npm', ['ci', '--no-audit', '--no-fund'], cache);
  writeFileSync(stamp, hash);
}
if (!existsSync(join(runtime, 'node_modules'))) symlinkSync(join(cache, 'node_modules'), join(runtime, 'node_modules'), 'dir');
function sync() {
  for (const directory of ['src', 'public', 'tools', 'private-demos']) {
    mkdirSync(join(runtime, directory), { recursive: true });
    // Only these dedicated cache directories are mirrored or pruned.
    run('rsync', ['-a', '--delete', '--exclude=._*', join(source, directory) + '/', join(runtime, directory) + '/']);
  }
  // All local previews share the same private store as Money. Never copy a
  // stale password/counter snapshot into a second preview.
  if (!existsSync(join(runtime, '.demo-access'))) symlinkSync(join(source, '.demo-access'), join(runtime, '.demo-access'), 'dir');
  for (const file of ['package.json', 'package-lock.json', 'next.config.js', 'next-env.d.ts', 'tsconfig.json', 'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js']) {
    if (existsSync(join(source, file))) run('rsync', ['-a', join(source, file), join(runtime, file)]);
  }
  // Use existing local configuration without printing any values.
  for (const file of ['.env', '.env.local', building ? '.env.production' : '.env.development', building ? '.env.production.local' : '.env.development.local']) {
    if (existsSync(join(source, file))) writeFileSync(join(runtime, file), readFileSync(join(source, file)), { mode: 0o600 });
  }
}
sync();
console.log(`Source: ${source}\nRuntime: ${runtime}\n${building ? 'Building local production output.' : `Preview: http://localhost:${port}`}`);
const next = join(cache, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [next, ...(building ? ['build'] : ['dev', '--hostname', '127.0.0.1', '--port', port])], { cwd: runtime, stdio: 'inherit' });
const watchers = [];
let debounce;
if (!building) {
  const schedule = (_event, file) => {
    if (file && basename(file).startsWith('._')) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => { try { sync(); } catch (error) { console.error(error.message); } }, 350);
  };
  for (const directory of ['src', 'public', 'tools', 'private-demos']) watchers.push(watch(join(source, directory), { recursive: true }, schedule));
}
function shutdown(signal) { clearTimeout(debounce); watchers.forEach(item => item.close()); child.kill(signal); }
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
child.on('exit', code => { clearTimeout(debounce); watchers.forEach(item => item.close()); process.exit(code ?? 1); });
