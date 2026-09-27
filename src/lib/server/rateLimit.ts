import type { NextApiRequest } from 'next';
import { supabaseAdmin } from './supabaseAdmin';

export function clientIp(req: NextApiRequest): string | null {
  const netlifyIp = req.headers['x-nf-client-connection-ip'];
  if (typeof netlifyIp === 'string' && netlifyIp) return netlifyIp;
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
    ?.split(',')[0]
    ?.trim();
  return first || req.socket.remoteAddress || null;
}

// Counts recent rows instead of keeping an in-memory map: serverless instances
// are ephemeral, so the tables themselves are the only durable counter. Fails
// open — a broken rate limiter should never cost a lead.
export async function tooManyRecent(
  table: 'swd_form_submissions' | 'swd_bookings',
  field: 'ip' | 'email',
  value: string,
  windowMinutes: number,
  max: number
): Promise<boolean> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count, error } = await supabaseAdmin()
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(field, value)
    .gte('created_at', since);
  if (error) {
    console.error(`rate limit count failed for ${table}.${field}:`, error.message);
    return false;
  }
  return (count ?? 0) >= max;
}
