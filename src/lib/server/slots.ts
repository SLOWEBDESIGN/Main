import { DateTime } from 'luxon';
import { supabaseAdmin } from './supabaseAdmin';

export const SLOT_MINUTES = 30;
export const MIN_NOTICE_HOURS = 12;
export const BOOKING_HORIZON_DAYS = 30;
export const BUSINESS_TIMEZONE = 'America/Los_Angeles';

export interface Slot {
  start: string; // UTC ISO, no milliseconds
  end: string;
}

export interface AvailabilityRule {
  weekday: number; // ISO: 1=Mon .. 7=Sun
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface BlockedDate {
  date: string;
  start_time: string | null;
  end_time: string | null;
}

// Rules store local wall time plus an IANA zone name, so a 9:00 rule converts
// through the tz database on each specific date — DST needs no special casing.
export function computeSlots(input: {
  fromDate: string; // YYYY-MM-DD, a calendar date in the business timezone
  days: number;
  rules: AvailabilityRule[];
  blocked: BlockedDate[];
  bookedStartMillis: Set<number>;
  now: DateTime;
}): Slot[] {
  const { fromDate, days, rules, blocked, bookedStartMillis, now } = input;
  const earliest = now.plus({ hours: MIN_NOTICE_HOURS });
  const horizon = now.plus({ days: BOOKING_HORIZON_DAYS });

  const blockedByDate = new Map<string, BlockedDate[]>();
  for (const block of blocked) {
    const list = blockedByDate.get(block.date) ?? [];
    list.push(block);
    blockedByDate.set(block.date, list);
  }

  const found = new Map<number, Slot>();
  const firstDay = DateTime.fromISO(fromDate, { zone: BUSINESS_TIMEZONE });
  for (let i = 0; i < days; i++) {
    const day = firstDay.plus({ days: i });
    const dayIso = day.toISODate();
    if (!dayIso) continue;

    const dayBlocks = blockedByDate.get(dayIso) ?? [];
    if (dayBlocks.some((b) => b.start_time === null)) continue; // whole day off

    const timedBlocks = dayBlocks
      .filter((b) => b.start_time !== null && b.end_time !== null)
      .map((b) => ({
        start: DateTime.fromISO(`${dayIso}T${b.start_time}`, { zone: BUSINESS_TIMEZONE }),
        end: DateTime.fromISO(`${dayIso}T${b.end_time}`, { zone: BUSINESS_TIMEZONE }),
      }));

    for (const rule of rules) {
      if (rule.weekday !== day.weekday) continue;
      let cursor = DateTime.fromISO(`${dayIso}T${rule.start_time}`, { zone: rule.timezone });
      const windowEnd = DateTime.fromISO(`${dayIso}T${rule.end_time}`, { zone: rule.timezone });
      if (!cursor.isValid || !windowEnd.isValid) continue;

      while (cursor.plus({ minutes: SLOT_MINUTES }) <= windowEnd) {
        const slotEnd = cursor.plus({ minutes: SLOT_MINUTES });
        const startMs = cursor.toMillis();
        const open =
          cursor >= earliest &&
          cursor <= horizon &&
          !bookedStartMillis.has(startMs) &&
          !timedBlocks.some((blk) => cursor < blk.end && slotEnd > blk.start);
        if (open && !found.has(startMs)) {
          const start = cursor.toUTC().toISO({ suppressMilliseconds: true });
          const end = slotEnd.toUTC().toISO({ suppressMilliseconds: true });
          if (start && end) found.set(startMs, { start, end });
        }
        cursor = slotEnd;
      }
    }
  }

  return [...found.entries()].sort((a, b) => a[0] - b[0]).map(([, slot]) => slot);
}

export async function getOpenSlots(fromDate: string, days: number): Promise<Slot[]> {
  const db = supabaseAdmin();
  const rangeStart = DateTime.fromISO(fromDate, { zone: BUSINESS_TIMEZONE }).startOf('day');
  const lastDate = rangeStart.plus({ days: days - 1 }).toISODate() ?? fromDate;

  const [rulesRes, blockedRes, bookedRes] = await Promise.all([
    db
      .from('swd_availability_rules')
      .select('weekday,start_time,end_time,timezone')
      .eq('active', true),
    db
      .from('swd_blocked_dates')
      .select('date,start_time,end_time')
      .gte('date', fromDate)
      .lte('date', lastDate),
    db
      .from('swd_bookings')
      .select('starts_at')
      .eq('status', 'confirmed')
      .gte('starts_at', rangeStart.toUTC().toISO() ?? '')
      .lt('starts_at', rangeStart.plus({ days: days + 1 }).toUTC().toISO() ?? ''),
  ]);
  if (rulesRes.error) throw rulesRes.error;
  if (blockedRes.error) throw blockedRes.error;
  if (bookedRes.error) throw bookedRes.error;

  const bookedStartMillis = new Set(
    (bookedRes.data ?? []).map((row) => DateTime.fromISO(row.starts_at).toMillis())
  );

  return computeSlots({
    fromDate,
    days,
    rules: rulesRes.data ?? [],
    blocked: blockedRes.data ?? [],
    bookedStartMillis,
    now: DateTime.utc(),
  });
}
