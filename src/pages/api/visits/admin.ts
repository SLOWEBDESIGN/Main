import type { NextApiRequest, NextApiResponse } from 'next';
import { timingSafeEqual, createHash } from 'node:crypto';
import { demoAccess, setPrivateHeaders, sameOrigin } from '@/src/lib/server/demoAccess';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setPrivateHeaders(res);
  if (req.method !== 'POST') return res.status(405).end();
  if (!sameOrigin(req)) return res.status(403).end();
  const key = process.env.DEMO_ADMIN_KEY;
  if (!key || key.length < 32) return res.status(503).json({ error: 'Demo administration is not configured.' });
  const actual = String(req.headers.authorization ?? '').replace(/^Bearer /, '');
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(hash(key), hash(actual))) return res.status(401).end();
  try {
    const access = demoAccess();
    if (req.body?.action === 'list') return res.json({ demos: await access.list(), mode: 'Hosted demos' });
    if (req.body?.action === 'reset') return res.json(await access.reset(req.body.code));
    return res.status(400).end();
  } catch { return res.status(503).json({ error: 'Demo administration is temporarily unavailable.' }); }
}
export const config = { api: { bodyParser: { sizeLimit: '2kb' } } };
