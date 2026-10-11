import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const LOCAL_PREVIEW_TOKEN = 'local-design-preview';

export function isLoopbackPreviewRequest({ environment, host, remoteAddress }) {
  if (environment !== 'development') return false;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress)) return false;
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(`http://${host}`).hostname);
  } catch { return false; }
}

export async function localDemoPreviewEnabled(req) {
  if (!isLoopbackPreviewRequest({ environment: process.env.NODE_ENV,
    host: req.headers.host, remoteAddress: req.socket.remoteAddress })) return false;
  try {
    const settings = JSON.parse(await readFile(resolve(process.cwd(), '.demo-access/local-preview.json'), 'utf8'));
    return settings.bypassAccessCode === true;
  } catch { return false; }
}
