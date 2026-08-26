import { DateTime } from 'luxon';
import { Resend } from 'resend';
import { buildInviteIcs } from './ics';
import { BUSINESS_TIMEZONE } from './slots';
import { requireEnv } from './supabaseAdmin';

const SITE_NAME = 'SLO Web Design';

export function ownerEmail(): string {
  return process.env.OWNER_EMAIL || 'contact@slowebdesign.com';
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtInZone(iso: string, zone: string): string {
  const dt = DateTime.fromISO(iso, { zone });
  if (!dt.isValid) return iso;
  return dt.toFormat("cccc, LLLL d, yyyy 'at' h:mm a (ZZZZ)");
}

function validZone(zone: string | null): string | null {
  if (!zone) return null;
  return DateTime.local().setZone(zone).isValid ? zone : null;
}

async function send(args: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<void> {
  const resend = new Resend(requireEnv('RESEND_API_KEY'));
  const { error } = await resend.emails.send({
    from: requireEnv('BOOKING_FROM_EMAIL'),
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo,
    attachments: args.attachments,
  });
  if (error) {
    throw new Error(`Resend send failed (${args.subject}): ${error.message}`);
  }
}

export interface ContactSubmission {
  name: string;
  business: string;
  email: string;
  phone: string;
  website: string | null;
  businessType: string;
  budget: string;
  services: string;
  description: string;
  contactMethod: string;
}

export async function sendContactNotification(sub: ContactSubmission): Promise<void> {
  const rows: [string, string][] = [
    ['Name', sub.name],
    ['Business', sub.business],
    ['Email', sub.email],
    ['Phone', sub.phone],
    ['Website', sub.website ?? '—'],
    ['Business type', sub.businessType],
    ['Budget', sub.budget],
    ['Services', sub.services],
    ['Preferred contact', sub.contactMethod],
  ];
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap">${label}</td>` +
        `<td style="padding:4px 0">${escapeHtml(value)}</td></tr>`
    )
    .join('');
  await send({
    to: ownerEmail(),
    replyTo: sub.email,
    subject: `New inquiry from ${sub.name} — ${sub.business}`,
    html:
      `<h2 style="margin:0 0 12px">New website inquiry</h2>` +
      `<table style="border-collapse:collapse;font-size:14px">${table}</table>` +
      `<p style="margin:16px 0 4px;color:#555">Project description:</p>` +
      `<p style="white-space:pre-wrap;margin:0">${escapeHtml(sub.description)}</p>`,
  });
}

export interface BookingEmailInput {
  id: string;
  name: string;
  email: string;
  notes: string | null;
  startsAt: string;
  endsAt: string;
  bookerTimezone: string | null;
}

function meetingLine(): string {
  const url = process.env.BOOKING_MEETING_URL;
  if (url) {
    return `<p>Join the video call here: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`;
  }
  return `<p>We'll send you the video call link before the meeting.</p>`;
}

export async function sendBookingConfirmation(booking: BookingEmailInput): Promise<void> {
  const bookerZone = validZone(booking.bookerTimezone) ?? BUSINESS_TIMEZONE;
  const bookerTime = fmtInZone(booking.startsAt, bookerZone);
  const businessTime = fmtInZone(booking.startsAt, BUSINESS_TIMEZONE);
  const meetingUrl = process.env.BOOKING_MEETING_URL;
  const ics = buildInviteIcs({
    uid: booking.id,
    startsAtUtc: booking.startsAt,
    endsAtUtc: booking.endsAt,
    summary: `${SITE_NAME} consultation — ${booking.name}`,
    description:
      `30-minute consultation with ${SITE_NAME}.` +
      (booking.notes ? `\n\nNotes: ${booking.notes}` : ''),
    location: meetingUrl || undefined,
  });
  const attachments = [{ filename: 'invite.ics', content: Buffer.from(ics, 'utf8') }];

  await send({
    to: booking.email,
    replyTo: ownerEmail(),
    subject: `Your ${SITE_NAME} consultation is confirmed`,
    html:
      `<h2 style="margin:0 0 12px">You're booked, ${escapeHtml(booking.name)}!</h2>` +
      `<p><strong>${escapeHtml(bookerTime)}</strong></p>` +
      (bookerZone !== BUSINESS_TIMEZONE
        ? `<p style="color:#555">(${escapeHtml(businessTime)} our time)</p>`
        : '') +
      `<p>30 minutes, no obligation. A calendar invite is attached.</p>` +
      meetingLine() +
      `<p style="color:#555">Need to reschedule? Reply to this email or call 530-215-5987.</p>`,
    attachments,
  });

  await send({
    to: ownerEmail(),
    replyTo: booking.email,
    subject: `New consultation booking: ${booking.name} — ${businessTime}`,
    html:
      `<h2 style="margin:0 0 12px">New consultation booked</h2>` +
      `<p><strong>${escapeHtml(booking.name)}</strong> (${escapeHtml(booking.email)})</p>` +
      `<p>${escapeHtml(businessTime)}</p>` +
      (booking.notes
        ? `<p style="color:#555">Notes:</p><p style="white-space:pre-wrap">${escapeHtml(booking.notes)}</p>`
        : '') +
      `<p>The calendar invite is attached.</p>`,
    attachments,
  });
}

export async function sendCancellationNotice(booking: BookingEmailInput): Promise<void> {
  const bookerZone = validZone(booking.bookerTimezone) ?? BUSINESS_TIMEZONE;
  const bookerTime = fmtInZone(booking.startsAt, bookerZone);
  const ics = buildInviteIcs({
    uid: booking.id,
    startsAtUtc: booking.startsAt,
    endsAtUtc: booking.endsAt,
    summary: `${SITE_NAME} consultation — ${booking.name}`,
    description: `This consultation has been cancelled.`,
    cancelled: true,
  });
  await send({
    to: booking.email,
    replyTo: ownerEmail(),
    subject: `Your ${SITE_NAME} consultation has been cancelled`,
    html:
      `<h2 style="margin:0 0 12px">Consultation cancelled</h2>` +
      `<p>Your consultation on <strong>${escapeHtml(bookerTime)}</strong> has been cancelled.</p>` +
      `<p>Want to pick a new time? Book again at ` +
      `<a href="https://slowebdesign.com/#booking">slowebdesign.com</a> ` +
      `or reply to this email.</p>`,
    attachments: [{ filename: 'cancel.ics', content: Buffer.from(ics, 'utf8') }],
  });
}
