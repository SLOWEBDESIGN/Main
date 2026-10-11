import { resolve } from 'node:path';
import registry from '../../../private-demos/registry.json';
import { createDemoAccess, AccessError } from '../../../tools/demo-access.mjs';
import { createHostedDemoStorage } from '../../../tools/hosted-demo-storage.mjs';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export { registry, AccessError };
export const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};
export function demoAccess() {
  if ((process.env.NODE_ENV === 'production' && !process.env.DEMO_LOCAL_PREVIEW)
      || process.env.DEMO_ACCESS_STORE === 'supabase') {
    const url = process.env.DEMO_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new AccessError('Preview storage is not configured.', 503);
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return createDemoAccess({ registry, storage: createHostedDemoStorage(client) });
  }
  return createDemoAccess({ registry, directory: resolve(process.cwd(), '.demo-access') });
}
export function setPrivateHeaders(res: NextApiResponse) {
  for (const [key, value] of Object.entries(privateHeaders)) res.setHeader(key, value);
}
export function sameOrigin(req: NextApiRequest) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return false;
  const origin = req.headers.origin;
  if (!origin) return true; // Non-browser local tooling still needs its admin key.
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
