import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/server/adminAuth';
import { sendCancellationNotice } from '@/src/lib/server/email';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isUuid } from '@/src/lib/server/validate';

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
  if (!isUuid(id) || body.action !== 'cancel') {
    res.status(400).json({ error: 'invalid_fields' });
    return;
  }

  const db = supabaseAdmin();
  const { data: booking, error: fetchError } = await db
    .from('swd_bookings')
    .select('id,name,email,notes,starts_at,ends_at,booker_timezone,status')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) {
    console.error('booking fetch failed:', fetchError.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }
  if (!booking) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (booking.status === 'cancelled') {
    res.status(200).json({ ok: true, alreadyCancelled: true });
    return;
  }

  const { error: updateError } = await db
    .from('swd_bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id);
  if (updateError) {
    console.error('booking cancel failed:', updateError.message);
    res.status(500).json({ error: 'server_error' });
    return;
  }

  try {
    await sendCancellationNotice({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      notes: booking.notes,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      bookerTimezone: booking.booker_timezone,
    });
  } catch (err) {
    console.error('cancellation email failed:', err);
  }

  res.status(200).json({ ok: true });
}
