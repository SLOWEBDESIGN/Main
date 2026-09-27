import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isHmTime, isYmdDate, optionalString } from '@/src/lib/server/validate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const date = typeof body.date === 'string' ? body.date : '';
  const startTime = typeof body.startTime === 'string' && body.startTime ? body.startTime : null;
  const endTime = typeof body.endTime === 'string' && body.endTime ? body.endTime : null;
  const reason = optionalString(body.reason, 300);

  const timesValid =
    (startTime === null && endTime === null) ||
    (startTime !== null && endTime !== null &&
      isHmTime(startTime) && isHmTime(endTime) && startTime < endTime);
  if (!isYmdDate(date) || !timesValid) {
    res.status(400).json({ error: 'invalid_fields' });
    return;
  }

  const { data, error } = await supabaseAdmin()
    .from('swd_blocked_dates')
    .insert({ date, start_time: startTime, end_time: endTime, reason })
    .select('*')
    .single();
  if (error) {
    console.error('blocked date create failed:', error.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }
  res.status(201).json({ blockedDate: data });
}
