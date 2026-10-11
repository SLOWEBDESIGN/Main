import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, rmdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const VISIT_MS = 60 * 60 * 1000;
export const digest = value => createHash('sha256').update(value).digest('hex');
export const newAccessCode = () => String(randomInt(1000, 10000));
export class AccessError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

// Shared by local previews and the local Money portal. Hosted access must use
// transactional storage, not ephemeral function disk or object-store counters.
/** @param {{registry: Array<{code: string, slug: string, title: string, project?: string, port?: number}>, directory?: string, storage?: {read: Function, change: Function}, now?: () => number}} options */
export function createDemoAccess({ registry, directory, storage, now = Date.now }) {
  const find = code => registry.find(item => item.code === code);
  const keyFor = code => {
    if (!find(code)) throw new AccessError('That visit code wasn’t found.', 404);
    return `demo-${code}`;
  };
  async function read(key) {
    if (storage) return storage.read(key);
    try { return JSON.parse(await readFile(join(directory, `${key}.json`), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  async function change(key, update) {
    if (storage) return storage.change(key, update);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const lock = join(directory, `${key}.lock`);
    let acquired = false;
    for (let retry = 0; retry < 300; retry++) {
      try { await mkdir(lock, { mode: 0o700 }); acquired = true; break; }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (!acquired) throw new AccessError('Please try again in a moment.', 503);
    try {
      const { state, result } = update(await read(key));
      const temporary = join(directory, `${key}.${randomBytes(8).toString('hex')}.tmp`);
      await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
      await rename(temporary, join(directory, `${key}.json`));
      return result;
    } finally { await rmdir(lock); }
  }
  function fresh(previous) {
    let accessCode = newAccessCode();
    while (accessCode === previous?.accessCode) accessCode = newAccessCode();
    return { accessCode, generation: (previous?.generation ?? 0) + 1, used: 0, sessions: [], updatedAt: now() };
  }
  async function rateLimit(scope, identity, limit = 8) {
    const key = `rate-${digest(`${scope}:${identity}`)}`;
    const accepted = await change(key, old => {
      const state = old && old.until > now() ? old : { count: 0, until: now() + 15 * 60 * 1000 };
      state.count++;
      return { state, result: state.count <= limit };
    });
    if (!accepted) throw new AccessError('Too many attempts. Please wait 15 minutes before trying again.', 429);
  }
  async function list() {
    return Promise.all(registry.map(async item => {
      const state = await read(keyFor(item.code));
      return { ...item, accessCode: state?.accessCode ?? null, remaining: state ? Math.max(0, 2 - state.used) : 0,
        active: (state?.sessions ?? []).filter(session => session.expiresAt > now()).length,
        updatedAt: state?.updatedAt ?? null };
    }));
  }
  async function reset(code) {
    return change(keyFor(code), old => {
      const state = fresh(old);
      return { state, result: { code, accessCode: state.accessCode, remaining: 2 } };
    });
  }
  async function initialize() {
    for (const item of registry) await change(keyFor(item.code), old => ({ state: old ?? fresh(null), result: null }));
    return list();
  }
  async function unlock(code, supplied, identity) {
    keyFor(code);
    if (!/^\d{4}$/.test(supplied ?? '')) throw new AccessError('Enter the four-digit access code from your email.');
    await rateLimit(`unlock-${code}`, identity);
    return change(keyFor(code), old => {
      if (!old) throw new AccessError('Ask Ben for your access code.', 401);
      const correct = timingSafeEqual(Buffer.from(digest(supplied)), Buffer.from(digest(old.accessCode)));
      if (!correct) throw new AccessError('That access code doesn’t match. Check the four digits or email Ben.', 401);
      if (old.used >= 2) throw new AccessError('Both visits have been used. Email Ben for a new access code.', 403);
      const token = randomBytes(32).toString('hex');
      const expiresAt = now() + VISIT_MS;
      const state = { ...old, used: old.used + 1, sessions: [
        ...old.sessions.filter(session => session.expiresAt > now()),
        { hash: digest(token), expiresAt },
      ] };
      return { state, result: { token, expiresAt, remaining: 2 - state.used } };
    });
  }
  async function session(code, token) {
    keyFor(code);
    if (!/^[a-f0-9]{64}$/.test(token ?? '')) return null;
    const state = await read(keyFor(code));
    const match = state?.sessions.find(entry => entry.hash === digest(token) && entry.expiresAt > now());
    return match ? { expiresAt: match.expiresAt } : null;
  }
  return { find, list, reset, initialize, unlock, session, rateLimit };
}
