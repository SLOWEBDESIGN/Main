import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  BUSINESS_TIMEZONE,
  SLOT_MINUTES,
  getOpenSlots,
} from '@/src/lib/server/slots';
import { isYmdDate } from '@/src/lib/server/validate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const fromParam = typeof req.query.from === 'string' ? req.query.from : '';
  const from =
    fromParam && isYmdDate(fromParam) && DateTime.fromISO(fromParam).isValid
      ? fromParam
      : DateTime.now().setZone(BUSINESS_TIMEZONE).toISODate();
  if (!from) {
    res.status(400).json({ error: 'invalid_from' });
    return;
  }

  const daysRaw = Number(typeof req.query.days === 'string' ? req.query.days : '14');
  const days = Number.isFinite(daysRaw)
    ? Math.min(31, Math.max(1, Math.trunc(daysRaw)))
    : 14;

  try {
    const slots = await getOpenSlots(from, days);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ timezone: BUSINESS_TIMEZONE, slotMinutes: SLOT_MINUTES, slots });
  } catch (err) {
    console.error('availability lookup failed:', err);
    res.status(500).json({ error: 'server_error' });
  }
}
