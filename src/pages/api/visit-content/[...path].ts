import type { NextApiRequest, NextApiResponse } from 'next';
import { extname } from 'node:path';
import { demoAccess, setPrivateHeaders } from '@/src/lib/server/demoAccess';
import { demoAssets } from '@/src/lib/server/demoAssets';
import { LOCAL_PREVIEW_TOKEN, localDemoPreviewEnabled } from '../../../../tools/local-demo-preview.mjs';

const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.glb': 'model/gltf-binary',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setPrivateHeaders(res);
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const [code, token, ...pieces] = Array.isArray(req.query.path) ? req.query.path : [];
  if (!code || !token || pieces.some(part => !part || part === '.' || part === '..' || /[\\\x00-\x1f]/.test(part))) return res.status(404).end();
  try {
    const access = demoAccess();
    const item = access.find(code);
    const localPreview = token === LOCAL_PREVIEW_TOKEN && await localDemoPreviewEnabled(req);
    if (!item || (!localPreview && !await access.session(code, token))) return res.status(401).send('Your preview visit has ended. Return to the access page to start another visit.');
    const requested = pieces.join('/') || 'index.html';
    if (requested.endsWith('.map') || requested.startsWith('.')) return res.status(404).end();
    const candidates = req.headers.rsc === '1' ? [`${requested}.txt`, `${requested}/index.txt`, requested] : [requested, `${requested}.html`, `${requested}/index.html`];
    const file = await demoAssets().find(item.slug, candidates);
    if (!file) return res.status(404).end();
    // Netlify's proxy can turn HEAD into GET or enforce the declared full model
    // length. A tiny authenticated metadata response avoids either behavior.
    if (req.query.metadata === '1') return res.json({ bytes: file.size });
    const extension = extname(file.name);
    res.setHeader('Content-Type', types[extension] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.method === 'HEAD') { res.setHeader('Content-Length', file.size); return res.end(); }
    let buffer = await file.read();
    if (['.html', '.js', '.css', '.json', '.txt'].includes(extension)) {
      const base = `/visit/${code}/content/${token}`;
      let text = buffer.toString('utf8').split('/__private_demo__').join(base);
      if (extension === '.html') text = text.replace('</head>', `<script src="/studio-shortcuts.js" data-demo-preview defer></script><script src="/private-demo-runtime.js" data-asset-base="${base}"></script></head>`);
      buffer = Buffer.from(text);
    }
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if (!match) return res.status(416).end();
      const start = Number(match[1]); const end = Math.min(Number(match[2] || start + 2 * 1024 * 1024 - 1), buffer.length - 1);
      if (start > end || end - start + 1 > 2 * 1024 * 1024) { res.setHeader('Content-Range', `bytes */${buffer.length}`); return res.status(416).end(); }
      res.setHeader('Content-Range', `bytes ${start}-${end}/${buffer.length}`);
      res.setHeader('Content-Length', end - start + 1);
      return res.status(206).end(buffer.subarray(start, end + 1));
    }
    if (buffer.length > 4 * 1024 * 1024) return res.status(413).send('Load this asset in byte ranges.');
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  } catch { return res.status(503).send('Preview temporarily unavailable.'); }
}
export const config = { api: { responseLimit: false } };
