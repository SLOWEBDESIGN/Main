import type { NextApiRequest, NextApiResponse } from 'next';
import { demoAccess, registry, setPrivateHeaders } from '@/src/lib/server/demoAccess';
import { LOCAL_PREVIEW_TOKEN, localDemoPreviewEnabled } from '../../../../tools/local-demo-preview.mjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setPrivateHeaders(res);
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const code = String(req.query.code ?? '');
    const token = String(req.headers.authorization ?? '').replace(/^Bearer /, '');
    if (token === LOCAL_PREVIEW_TOKEN && registry.some(item => item.code === code) && await localDemoPreviewEnabled(req))
      return res.json({ expiresAt: Date.now() + 3600000 });
    const result = await demoAccess().session(code, token);
    return result ? res.json(result) : res.status(401).json({ error: 'Your visit has ended.' });
  } catch { return res.status(503).json({ error: 'Preview unavailable.' }); }
}
