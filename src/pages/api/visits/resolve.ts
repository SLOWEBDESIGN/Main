import type { NextApiRequest, NextApiResponse } from 'next';
import { demoAccess, setPrivateHeaders, sameOrigin, AccessError } from '@/src/lib/server/demoAccess';
import { clientIp } from '@/src/lib/server/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setPrivateHeaders(res);
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  if (!sameOrigin(req)) return res.status(403).end();
  try {
    const access = demoAccess();
    await access.rateLimit('resolve', clientIp(req) ?? 'unknown', 20);
    const item = access.find(req.body?.code);
    return item ? res.json({ path: `/visit/${item.code}` }) : res.status(404).json({ error: 'Visit code not found.' });
  } catch (error) { return res.status(error instanceof AccessError ? error.status : 503).json({ error: 'Please try again later.' }); }
}
export const config = { api: { bodyParser: { sizeLimit: '2kb' } } };
