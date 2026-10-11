import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

/** @param {{root?: string, store?: any, version?: string}} options */
export function createDemoAssets({ root, store, version }) {
  if (store && !/^[a-f0-9]{64}$/.test(version ?? '')) throw new Error('Missing private asset release.');
  return {
    async find(slug, candidates) {
      if (!/^[a-z0-9-]+$/.test(slug)) return null;
      for (const name of candidates) {
        if (name.split('/').some(part => !part || part.startsWith('.') || /[\\\x00-\x1f]/.test(part))) continue;
        if (/\.(map|env|stl|blend|3mf|step)$/i.test(name)) continue;
        if (store) {
          const key = `${version}/${slug}/${name}`;
          const info = await store.getMetadata(key);
          if (!info) continue;
          const size = info.metadata.bytes;
          if (!Number.isSafeInteger(size) || size < 0) throw new Error('Invalid private asset metadata.');
          return { name, size, async read() {
            const data = await store.get(key, { type: 'arrayBuffer' });
            if (data === null) throw new Error('Private asset unavailable.');
            return Buffer.from(data);
          } };
        }
        const directory = resolve(root, slug);
        const file = resolve(directory, name);
        if (!file.startsWith(directory + sep)) continue;
        let info;
        try { info = await stat(file); } catch (error) {
          if (['ENOENT', 'ENOTDIR'].includes(error.code)) continue;
          throw error;
        }
        if (info.isFile()) return { name, size: info.size, read: () => readFile(file) };
      }
      return null;
    },
  };
}
