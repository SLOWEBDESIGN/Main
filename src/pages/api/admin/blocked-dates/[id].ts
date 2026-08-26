import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isUuid } from '@/src/lib/server/validate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!isUuid(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }

  const { error } = await supabaseAdmin().from('swd_blocked_dates').delete().eq('id', id);
  if (error) {
    console.error('blocked date delete failed:', error.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }
  res.status(200).json({ ok: true });
}
