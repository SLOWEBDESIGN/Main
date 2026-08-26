import { createHash, createHmac, timingSafeEqual } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireEnv } from './supabaseAdmin';

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

// Hashing both sides equalizes buffer lengths, which timingSafeEqual requires.
function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function checkPassword(input: string): boolean {
  return timingSafeEqual(sha256(input), sha256(requireEnv('ADMIN_PASSWORD')));
}

function sign(payload: string): string {
  return createHmac('sha256', requireEnv('ADMIN_SESSION_SECRET'))
    .update(payload)
    .digest('hex');
}

export function sessionCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return (
    `${ADMIN_COOKIE_NAME}=${exp}.${sign(String(exp))}; ` +
    `HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`
  );
}

export function clearedSessionCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const dot = cookieValue.indexOf('.');
  if (dot <= 0) return false;
  const expStr = cookieValue.slice(0, dot);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const given = Buffer.from(cookieValue.slice(dot + 1), 'utf8');
  const expected = Buffer.from(sign(expStr), 'utf8');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse): boolean {
  if (isValidSession(req.cookies[ADMIN_COOKIE_NAME])) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}
