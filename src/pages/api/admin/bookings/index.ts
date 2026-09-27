import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const scope = typeof req.query.scope === 'string' ? req.query.scope : 'upcoming';
  const nowIso = new Date().toISOString();
  const base = supabaseAdmin().from('swd_bookings').select('*').limit(500);

  const query =
    scope === 'past'
      ? base.eq('status', 'confirmed').lt('starts_at', nowIso).order('starts_at', { ascending: false })
      : scope === 'cancelled'
        ? base.eq('status', 'cancelled').order('starts_at', { ascending: false })
        : base.eq('status', 'confirmed').gte('starts_at', nowIso).order('starts_at', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('bookings list failed:', error.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }
  res.status(200).json({ bookings: data ?? [] });
}
