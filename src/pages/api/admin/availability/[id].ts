import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isHmTime, isUuid } from '@/src/lib/server/validate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;

  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!isUuid(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }
  const db = supabaseAdmin();

  if (req.method === 'PATCH') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (body.active !== undefined) {
      if (typeof body.active !== 'boolean') {
        res.status(400).json({ error: 'invalid_fields' });
        return;
      }
      update.active = body.active;
    }
    if (body.startTime !== undefined || body.endTime !== undefined) {
      const startTime = typeof body.startTime === 'string' ? body.startTime : '';
      const endTime = typeof body.endTime === 'string' ? body.endTime : '';
      if (!isHmTime(startTime) || !isHmTime(endTime) || startTime >= endTime) {
        res.status(400).json({ error: 'invalid_fields' });
        return;
      }
      update.start_time = startTime;
      update.end_time = endTime;
    }
    if (Object.keys(update).length === 0) {
      res.status(400).json({ error: 'invalid_fields' });
      return;
    }
    const { error } = await db.from('swd_availability_rules').update(update).eq('id', id);
    if (error) {
      console.error('rule update failed:', error.message);
      res.status(500).json({ error: 'server_error' });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    const { error } = await db.from('swd_availability_rules').delete().eq('id', id);
    if (error) {
      console.error('rule delete failed:', error.message);
      res.status(500).json({ error: 'server_error' });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
