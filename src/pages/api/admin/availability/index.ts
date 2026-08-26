import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isHmTime } from '@/src/lib/server/validate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;
  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const [rulesRes, blockedRes] = await Promise.all([
      db
        .from('swd_availability_rules')
        .select('*')
        .order('weekday', { ascending: true })
        .order('start_time', { ascending: true }),
      db.from('swd_blocked_dates').select('*').order('date', { ascending: true }),
    ]);
    if (rulesRes.error || blockedRes.error) {
      console.error(
        'availability admin fetch failed:',
        rulesRes.error?.message ?? blockedRes.error?.message
      );
      res.status(500).json({ error: 'server_error' });
      return;
    }
    res.status(200).json({
      rules: rulesRes.data ?? [],
      blockedDates: blockedRes.data ?? [],
    });
    return;
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const weekday = Number(body.weekday);
    const startTime = typeof body.startTime === 'string' ? body.startTime : '';
    const endTime = typeof body.endTime === 'string' ? body.endTime : '';
    if (
      !Number.isInteger(weekday) || weekday < 1 || weekday > 7 ||
      !isHmTime(startTime) || !isHmTime(endTime) || startTime >= endTime
    ) {
      res.status(400).json({ error: 'invalid_fields' });
      return;
    }
    const { data, error } = await db
      .from('swd_availability_rules')
      .insert({ weekday, start_time: startTime, end_time: endTime })
      .select('*')
      .single();
    if (error) {
      console.error('rule create failed:', error.message);
      res.status(500).json({ error: 'server_error' });
      return;
    }
    res.status(201).json({ rule: data });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
