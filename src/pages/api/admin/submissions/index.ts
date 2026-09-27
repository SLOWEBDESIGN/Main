import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';

const STATUSES = ['new', 'read', 'archived'] as const;

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

  const status = typeof req.query.status === 'string' ? req.query.status : '';
  let query = supabaseAdmin()
    .from('swd_form_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if ((STATUSES as readonly string[]).includes(status)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('submissions list failed:', error.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }
  res.status(200).json({ submissions: data ?? [] });
}
