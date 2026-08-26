import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { ADMIN_COOKIE_NAME, isValidSession } from '@/src/lib/server/adminAuth';

interface Props {
  authed: boolean;
}

// Cookie check runs server-side on every request; unauthenticated visitors only
// ever receive the login form markup.
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => ({
  props: { authed: isValidSession(req.cookies[ADMIN_COOKIE_NAME]) },
});

interface Submission {
  id: string;
  created_at: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  website: string | null;
  business_type: string;
  budget: string;
  services: string;
  description: string;
  contact_method: string;
  status: 'new' | 'read' | 'archived';
}

interface Booking {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  booker_timezone: string | null;
  status: 'confirmed' | 'cancelled';
}

interface Rule {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  timezone: string;
  active: boolean;
}

interface Blocked {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fmtPacific = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const hm = (time: string) => time.slice(0, 5);

const inputClass =
  'px-3 py-2 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500';

// Session expiry mid-use surfaces as a 401; reloading lands on the login form.
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (res.status === 401) {
    window.location.reload();
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return (await res.json()) as T;
}

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary-100 px-6">
      <form
        onSubmit={submit}
        className="bg-white rounded-lg shadow-xl border border-secondary-200 p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-primary-700">Admin login</h1>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          aria-label="Password"
          className={`${inputClass} w-full`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {failed && <p className="text-red-600 text-sm">Wrong password.</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </main>
  );
};

const SubmissionsTab: React.FC = () => {
  const [subs, setSubs] = useState<Submission[] | null>(null);

  const load = useCallback(async () => {
    const data = await api<{ submissions: Submission[] }>('/api/admin/submissions');
    setSubs(data.submissions);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: Submission['status']) => {
    await api(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setSubs((prev) => prev?.map((s) => (s.id === id ? { ...s, status } : s)) ?? null);
  };

  if (!subs) return <p className="text-accent-slate">Loading…</p>;
  if (subs.length === 0) return <p className="text-accent-slate">No submissions yet.</p>;

  return (
    <div className="space-y-4">
      {subs.map((s) => (
        <div key={s.id} className="bg-white rounded-lg border border-secondary-200 p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-primary-700">{s.name}</span>
            <span className="text-accent-slate">· {s.business}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                s.status === 'new'
                  ? 'bg-primary-100 text-primary-700'
                  : s.status === 'read'
                    ? 'bg-secondary-100 text-accent-slate'
                    : 'bg-secondary-200 text-accent-slate'
              }`}
            >
              {s.status}
            </span>
            <span className="ml-auto text-sm text-accent-slate">
              {fmtPacific(s.created_at)}
            </span>
          </div>
          <p className="text-sm text-accent-slate mb-1">
            {s.email} · {s.phone} · prefers {s.contact_method}
            {s.website ? ` · ${s.website}` : ''}
          </p>
          <p className="text-sm text-accent-slate mb-2">
            {s.business_type} · budget {s.budget} · {s.services}
          </p>
          <p className="text-sm whitespace-pre-wrap mb-3">{s.description}</p>
          <div className="flex gap-2">
            {s.status === 'new' && (
              <button
                type="button"
                className="text-sm text-primary-700 font-medium hover:underline"
                onClick={() => void setStatus(s.id, 'read')}
              >
                Mark read
              </button>
            )}
            {s.status !== 'archived' && (
              <button
                type="button"
                className="text-sm text-accent-slate hover:underline"
                onClick={() => void setStatus(s.id, 'archived')}
              >
                Archive
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const BookingsTab: React.FC = () => {
  const [scope, setScope] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  const load = useCallback(async () => {
    setBookings(null);
    const data = await api<{ bookings: Booking[] }>(`/api/admin/bookings?scope=${scope}`);
    setBookings(data.bookings);
  }, [scope]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (b: Booking) => {
    if (!window.confirm(`Cancel ${b.name}'s booking on ${fmtPacific(b.starts_at)}? They'll be emailed.`)) {
      return;
    }
    await api(`/api/admin/bookings/${b.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel' }),
    });
    void load();
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['upcoming', 'past', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              s === scope
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-white border-secondary-200 text-primary-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {!bookings ? (
        <p className="text-accent-slate">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-accent-slate">No {scope} bookings.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-lg border border-secondary-200 p-5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-primary-700">{b.name}</span>
                <span className="text-accent-slate">· {b.email}</span>
                {b.phone && <span className="text-accent-slate">· {b.phone}</span>}
              </div>
              <p className="text-sm mb-1">
                <span className="font-medium">{fmtPacific(b.starts_at)}</span>{' '}
                <span className="text-accent-slate">(Pacific)</span>
              </p>
              {b.booker_timezone && (
                <p className="text-xs text-accent-slate mb-1">
                  Booker timezone: {b.booker_timezone}
                </p>
              )}
              {b.notes && (
                <p className="text-sm text-accent-slate whitespace-pre-wrap mb-2">{b.notes}</p>
              )}
              {b.status === 'confirmed' && (
                <button
                  type="button"
                  className="text-sm text-red-600 font-medium hover:underline"
                  onClick={() => void cancel(b)}
                >
                  Cancel booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AvailabilityTab: React.FC = () => {
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [newRule, setNewRule] = useState({ weekday: 1, startTime: '09:00', endTime: '17:00' });
  const [newBlock, setNewBlock] = useState({ date: '', startTime: '', endTime: '', reason: '' });

  const load = useCallback(async () => {
    const data = await api<{ rules: Rule[]; blockedDates: Blocked[] }>(
      '/api/admin/availability'
    );
    setRules(data.rules);
    setBlocked(data.blockedDates);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addRule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api('/api/admin/availability', { method: 'POST', body: JSON.stringify(newRule) });
    void load();
  };

  const toggleRule = async (rule: Rule) => {
    await api(`/api/admin/availability/${rule.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !rule.active }),
    });
    void load();
  };

  const deleteRule = async (rule: Rule) => {
    if (!window.confirm('Delete this weekly rule?')) return;
    await api(`/api/admin/availability/${rule.id}`, { method: 'DELETE' });
    void load();
  };

  const addBlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api('/api/admin/blocked-dates', { method: 'POST', body: JSON.stringify(newBlock) });
    setNewBlock({ date: '', startTime: '', endTime: '', reason: '' });
    void load();
  };

  const deleteBlock = async (block: Blocked) => {
    await api(`/api/admin/blocked-dates/${block.id}`, { method: 'DELETE' });
    void load();
  };

  if (!rules) return <p className="text-accent-slate">Loading…</p>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-primary-700 mb-3">Weekly hours (Pacific)</h2>
        <div className="space-y-2 mb-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 bg-white rounded-lg border border-secondary-200 px-4 py-2"
            >
              <span className="w-10 font-medium">{WEEKDAYS[rule.weekday - 1]}</span>
              <span className={rule.active ? '' : 'line-through text-accent-slate'}>
                {hm(rule.start_time)}–{hm(rule.end_time)}
              </span>
              <button
                type="button"
                className="ml-auto text-sm text-primary-700 hover:underline"
                onClick={() => void toggleRule(rule)}
              >
                {rule.active ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={() => void deleteRule(rule)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={addRule} className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Weekday"
            className={inputClass}
            value={newRule.weekday}
            onChange={(e) => setNewRule((p) => ({ ...p, weekday: Number(e.target.value) }))}
          >
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i + 1}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            aria-label="Start time"
            className={inputClass}
            value={newRule.startTime}
            onChange={(e) => setNewRule((p) => ({ ...p, startTime: e.target.value }))}
          />
          <input
            type="time"
            aria-label="End time"
            className={inputClass}
            value={newRule.endTime}
            onChange={(e) => setNewRule((p) => ({ ...p, endTime: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary py-2">
            Add hours
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold text-primary-700 mb-3">Blocked dates</h2>
        {blocked.length === 0 && (
          <p className="text-sm text-accent-slate mb-3">No blocked dates.</p>
        )}
        <div className="space-y-2 mb-4">
          {blocked.map((block) => (
            <div
              key={block.id}
              className="flex items-center gap-3 bg-white rounded-lg border border-secondary-200 px-4 py-2"
            >
              <span className="font-medium">{block.date}</span>
              <span className="text-accent-slate">
                {block.start_time && block.end_time
                  ? `${hm(block.start_time)}–${hm(block.end_time)}`
                  : 'all day'}
              </span>
              {block.reason && <span className="text-sm text-accent-slate">· {block.reason}</span>}
              <button
                type="button"
                className="ml-auto text-sm text-red-600 hover:underline"
                onClick={() => void deleteBlock(block)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={addBlock} className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            required
            aria-label="Date"
            className={inputClass}
            value={newBlock.date}
            onChange={(e) => setNewBlock((p) => ({ ...p, date: e.target.value }))}
          />
          <input
            type="time"
            aria-label="Start time (optional)"
            className={inputClass}
            value={newBlock.startTime}
            onChange={(e) => setNewBlock((p) => ({ ...p, startTime: e.target.value }))}
          />
          <input
            type="time"
            aria-label="End time (optional)"
            className={inputClass}
            value={newBlock.endTime}
            onChange={(e) => setNewBlock((p) => ({ ...p, endTime: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            aria-label="Reason"
            className={inputClass}
            value={newBlock.reason}
            onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary py-2">
            Block
          </button>
        </form>
        <p className="text-xs text-accent-slate mt-2">
          Leave the times empty to block the whole day.
        </p>
      </section>
    </div>
  );
};

const TABS = ['submissions', 'bookings', 'availability'] as const;
type Tab = (typeof TABS)[number];

const AdminPage: React.FC<Props> = ({ authed }) => {
  const [tab, setTab] = useState<Tab>('submissions');

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Admin — SLO Web Design</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {!authed ? (
        <Login />
      ) : (
        <main className="min-h-screen bg-secondary-100 px-6 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <h1 className="text-3xl font-bold text-primary-700">Admin</h1>
              <button
                type="button"
                onClick={() => void logout()}
                className="ml-auto text-sm text-accent-slate hover:underline"
              >
                Log out
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg font-medium border capitalize ${
                    t === tab
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-secondary-200 text-primary-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === 'submissions' && <SubmissionsTab />}
            {tab === 'bookings' && <BookingsTab />}
            {tab === 'availability' && <AvailabilityTab />}
          </div>
        </main>
      )}
    </>
  );
};

export default AdminPage;
