import type { NextApiRequest, NextApiResponse } from 'next';
import { clearedSessionCookie } from '@/src/lib/server/adminAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  res.setHeader('Set-Cookie', clearedSessionCookie());
  res.status(200).json({ ok: true });
}
