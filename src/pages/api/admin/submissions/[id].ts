import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isUuid } from '@/src/lib/server/validate';

const STATUSES = ['new', 'read', 'archived'] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const id = typeof req.query.id === 'string' ? req.query.id : '';
  const body = (req.body ?? {}) as Record<string, unknown>;
  const status = typeof body.status === 'string' ? body.status : '';
  if (!isUuid(id) || !(STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ error: 'invalid_fields' });
    return;
  }

  const { error } = await supabaseAdmin()
    .from('swd_form_submissions')
    .update({ status })
    .eq('id', id);
  if (error) {
    console.error('submission update failed:', error.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }
  res.status(200).json({ ok: true });
}
