import type { NextApiRequest, NextApiResponse } from 'next';
import { sendContactNotification } from '@/src/lib/server/email';
import { clientIp, tooManyRecent } from '@/src/lib/server/rateLimit';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { isEmail, optionalString, requiredString } from '@/src/lib/server/validate';

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

  // Honeypot tripped: report success so bots learn nothing, store nothing.
  if (typeof body.botField === 'string' && body.botField.trim()) {
    res.status(200).json({ ok: true });
    return;
  }

  const name = requiredString(body.name, 200);
  const business = requiredString(body.business, 200);
  const email = requiredString(body.email, 320);
  const phone = requiredString(body.phone, 50);
  const website = optionalString(body.website, 500);
  const businessType = requiredString(body.businessType, 100);
  const budget = requiredString(body.budget, 100);
  const services = requiredString(body.services, 100);
  const description = requiredString(body.description, 5000);
  const contactMethod = requiredString(body.contactMethod, 20);

  if (
    !name || !business || !email || !phone || !businessType ||
    !budget || !services || !description || !contactMethod
  ) {
    res.status(400).json({ error: 'missing_fields' });
    return;
  }
  if (!isEmail(email)) {
    res.status(400).json({ error: 'invalid_email' });
    return;
  }

  const ip = clientIp(req);
  try {
    if (ip && (await tooManyRecent('swd_form_submissions', 'ip', ip, 60, 5))) {
      res.status(429).json({ error: 'rate_limited' });
      return;
    }
    const { error } = await supabaseAdmin().from('swd_form_submissions').insert({
      name,
      business,
      email,
      phone,
      website,
      business_type: businessType,
      budget,
      services,
      description,
      contact_method: contactMethod,
      ip,
      user_agent: optionalString(req.headers['user-agent'], 500),
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('contact submission failed:', err);
    res.status(500).json({ error: 'server_error' });
    return;
  }

  // The lead is stored; a notification hiccup should not turn into a user-facing error.
  try {
    await sendContactNotification({
      name, business, email, phone, website,
      businessType, budget, services, description, contactMethod,
    });
  } catch (err) {
    console.error('contact notification email failed:', err);
  }

  res.status(200).json({ ok: true });
}
