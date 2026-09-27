import type { NextApiRequest, NextApiResponse } from 'next';
import { checkPassword, sessionCookie } from '@/src/lib/server/adminAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const password = typeof body.password === 'string' ? body.password : '';
  if (password && checkPassword(password)) {
    res.setHeader('Set-Cookie', sessionCookie());
    res.status(200).json({ ok: true });
    return;
  }
  // Flat delay on failure blunts online guessing without a lockout table.
  await new Promise((resolve) => setTimeout(resolve, 500));
  res.status(401).json({ error: 'invalid_password' });
}
