import type { NextApiRequest, NextApiResponse } from 'next';
import { demoAccess, setPrivateHeaders, sameOrigin, AccessError } from '@/src/lib/server/demoAccess';
import { clientIp } from '@/src/lib/server/rateLimit';
import { demoAssets } from '@/src/lib/server/demoAssets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setPrivateHeaders(res);
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  if (!sameOrigin(req)) return res.status(403).end();
  try {
    const access = demoAccess();
    const item = access.find(req.body?.code);
    if (!item) return res.status(404).json({ error: 'Visit code not found.' });
    // A missing build must not consume one of a client's two visits.
    if (!await demoAssets().find(item.slug, ['index.html']))
      return res.status(503).json({ error: 'This preview is being prepared. Please try again shortly.' });
    return res.json(await access.unlock(item.code, req.body?.accessCode, clientIp(req) ?? 'unknown'));
  } catch (error) {
    return res.status(error instanceof AccessError ? error.status : 503).json({ error: error instanceof AccessError ? error.message : 'Your preview is temporarily unavailable. Please try again shortly.' });
  }
}
export const config = { api: { bodyParser: { sizeLimit: '2kb' } } };
