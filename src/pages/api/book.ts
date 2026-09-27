import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendBookingConfirmation } from '@/src/lib/server/email';
import { tooManyRecent } from '@/src/lib/server/rateLimit';
import { BUSINESS_TIMEZONE, getOpenSlots } from '@/src/lib/server/slots';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import {
  isEmail,
  isIsoInstant,
  optionalString,
  requiredString,
} from '@/src/lib/server/validate';

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

  if (typeof body.botField === 'string' && body.botField.trim()) {
    res.status(201).json({ ok: true });
    return;
  }

  const name = requiredString(body.name, 200);
  const email = requiredString(body.email, 320);
  const phone = optionalString(body.phone, 50);
  const notes = optionalString(body.notes, 2000);
  const startsAtRaw = requiredString(body.startsAt, 40);
  const timeZone = optionalString(body.timeZone, 64);

  if (!name || !email || !startsAtRaw || !isEmail(email) || !isIsoInstant(startsAtRaw)) {
    res.status(400).json({ error: 'invalid_fields' });
    return;
  }
  const startsAt = DateTime.fromISO(startsAtRaw, { zone: 'utc' });
  const businessDate = startsAt.setZone(BUSINESS_TIMEZONE).toISODate();
  if (!businessDate) {
    res.status(400).json({ error: 'invalid_fields' });
    return;
  }

  try {
    if (await tooManyRecent('swd_bookings', 'email', email, 24 * 60, 3)) {
      res.status(429).json({ error: 'rate_limited' });
      return;
    }

    // First gate: the requested time must be an open slot right now. This
    // rejects out-of-hours, blocked, too-soon, and already-taken times.
    const open = await getOpenSlots(businessDate, 1);
    const slot = open.find(
      (s) => DateTime.fromISO(s.start).toMillis() === startsAt.toMillis()
    );
    if (!slot) {
      res.status(409).json({ error: 'slot_taken' });
      return;
    }

    // Second gate: the partial unique index on confirmed starts_at. If two
    // requests pass the first gate together, exactly one insert survives.
    const { data, error } = await supabaseAdmin()
      .from('swd_bookings')
      .insert({
        name,
        email,
        phone,
        notes,
        starts_at: slot.start,
        ends_at: slot.end,
        booker_timezone: timeZone,
      })
      .select('id,starts_at,ends_at')
      .single();
    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'slot_taken' });
        return;
      }
      throw new Error(error.message);
    }

    try {
      await sendBookingConfirmation({
        id: data.id,
        name,
        email,
        notes,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        bookerTimezone: timeZone,
      });
    } catch (err) {
      console.error('booking confirmation emails failed:', err);
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('booking failed:', err);
    res.status(500).json({ error: 'server_error' });
  }
}
