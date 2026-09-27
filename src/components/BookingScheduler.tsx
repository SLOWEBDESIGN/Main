'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { event as gaEvent } from '@/src/lib/analytics';

interface Slot {
  start: string; // UTC ISO
  end: string;
}

type Status = 'idle' | 'submitting' | 'confirmed' | 'slotTaken' | 'error';

// All three format in the browser's local timezone, so the grid always shows
// the booker's own wall-clock times regardless of where the business is.
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA');
const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const inputClass =
  'w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500';

export const BookingScheduler: React.FC = () => {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', notes: '' });
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [zone, setZone] = useState('');

  const loadSlots = useCallback(async () => {
    try {
      setLoadFailed(false);
      const res = await fetch('/api/availability?days=14');
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { slots: Slot[] };
      setSlots(data.slots);
    } catch {
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    void loadSlots();
  }, [loadSlots]);

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots ?? []) {
      const key = dayKey(slot.start);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [slots]);

  const activeDay =
    selectedDay && days.some(([d]) => d === selectedDay)
      ? selectedDay
      : (days[0]?.[0] ?? null);
  const daySlots = days.find(([d]) => d === activeDay)?.[1] ?? [];

  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...details,
          startsAt: selected.start,
          timeZone: zone,
          botField,
        }),
      });
      if (res.status === 201) {
        setStatus('confirmed');
        gaEvent('booking_confirmed', 'booking', selected.start);
      } else if (res.status === 409) {
        // Someone grabbed it between render and submit — refresh and let them repick.
        setStatus('slotTaken');
        setSelected(null);
        void loadSlots();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  let content: React.ReactNode;
  if (status === 'confirmed' && selected) {
    content = (
      <div className="text-center py-8">
        <CalendarCheck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-primary-700 mb-2">You&apos;re booked!</h3>
        <p className="text-lg text-accent-slate mb-1">
          {dayLabel(selected.start)} at {timeLabel(selected.start)}
        </p>
        <p className="text-accent-slate">
          A confirmation email with a calendar invite is on its way to{' '}
          <span className="font-medium">{details.email}</span>.
        </p>
      </div>
    );
  } else if (loadFailed) {
    content = (
      <div className="text-center py-8">
        <p className="text-accent-slate mb-4">
          We couldn&apos;t load available times. Please try again.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => void loadSlots()}>
          Retry
        </button>
      </div>
    );
  } else if (slots === null) {
    content = (
      <p className="text-center text-accent-slate py-8">Loading available times…</p>
    );
  } else if (days.length === 0) {
    content = (
      <p className="text-center text-accent-slate py-8">
        No open times right now — call us at 530-215-5987 or email
        contact@slowebdesign.com and we&apos;ll find a time.
      </p>
    );
  } else {
    content = (
      <div>
        {status === 'slotTaken' && (
          <p className="mb-4 rounded-lg bg-secondary-100 border border-secondary-200 px-4 py-3 text-accent-slate">
            That time was just taken — please pick another.
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {days.map(([day, list]) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                setSelected(null);
              }}
              className={`shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                day === activeDay
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-secondary-200 text-primary-700 hover:border-primary-400'
              }`}
            >
              {dayLabel(list[0].start)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
          {daySlots.map((slot) => (
            <button
              key={slot.start}
              type="button"
              onClick={() => setSelected(slot)}
              className={`px-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selected?.start === slot.start
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-secondary-200 text-primary-700 hover:border-primary-400'
              }`}
            >
              {timeLabel(slot.start)}
            </button>
          ))}
        </div>
        {zone && (
          <p className="text-xs text-accent-slate mb-6">Times shown in {zone}</p>
        )}

        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-secondary-200 pt-6">
            <p className="font-medium text-primary-700">
              {dayLabel(selected.start)} at {timeLabel(selected.start)} — 30 minutes
            </p>
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="botField"
                tabIndex={-1}
                autoComplete="off"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                required
                placeholder="Full name *"
                aria-label="Full name"
                className={inputClass}
                value={details.name}
                onChange={handleDetailsChange}
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email *"
                aria-label="Email"
                className={inputClass}
                value={details.email}
                onChange={handleDetailsChange}
              />
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone (optional)"
              aria-label="Phone"
              className={inputClass}
              value={details.phone}
              onChange={handleDetailsChange}
            />
            <textarea
              name="notes"
              rows={3}
              placeholder="Anything you'd like us to know before the call? (optional)"
              aria-label="Notes"
              className={inputClass}
              value={details.notes}
              onChange={handleDetailsChange}
            />
            {status === 'error' && (
              <p className="text-red-600 text-sm">
                Something went wrong. Please try again or call us at 530-215-5987.
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Booking…' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <section id="booking" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Schedule Your Consultation
          </h2>
          <p className="text-xl text-accent-slate">
            Pick a time that works for you. We&apos;ll discuss your project and answer
            any questions.
          </p>
          <p className="text-accent-slate mt-2 text-sm">
            Video call • 30 minutes • No obligation
          </p>
        </motion.div>

        <motion.div
          className="rounded-lg shadow-xl bg-white border border-secondary-200 p-6 md:p-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {content}
        </motion.div>

        <motion.p
          className="text-center text-sm text-accent-slate mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Have questions? Call us at{' '}
          <a
            href="tel:530-215-5987"
            className="font-medium text-primary-700 hover:text-primary-600"
          >
            530-215-5987
          </a>{' '}
          or email{' '}
          <a
            href="mailto:contact@slowebdesign.com"
            className="font-medium text-primary-700 hover:text-primary-600"
          >
            contact@slowebdesign.com
          </a>
        </motion.p>
      </div>
    </section>
  );
};
