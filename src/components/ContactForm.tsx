'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SERVICE_OPTIONS = [
  'Website',
  'App or browser extension',
  'Platform / business system',
  'AI workflow / private tool',
  'Content / reels',
  'SEO / ongoing help',
];

const BUSINESS_TYPES = [
  'New business',
  'Local service business',
  'E-commerce / retail',
  'Restaurant / hospitality',
  'Professional services',
  'Nonprofit / community',
  'Creative / portfolio',
  'Other',
];

const BUDGETS = [
  '$200 - $499',
  '$500 - $999',
  '$1,000 - $2,499',
  '$2,500 - $9,999',
  '$10,000+',
  'Not sure yet',
];

const CONTACT_METHODS = ['Email', 'Phone'];

const EMPTY_FORM = {
  name: '',
  business: '',
  email: '',
  phone: '',
  website: '',
  businessType: '',
  budget: '',
  description: '',
  contactMethod: 'Email',
};

const inputCls =
  'w-full px-4 py-3 border border-secondary-300 rounded-lg bg-white text-primary-700 placeholder:text-accent-slate/50 focus:outline-none focus:ring-2 focus:ring-primary-500';
const labelCls = 'block text-sm font-medium text-primary-700 mb-2';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [services, setServices] = useState<string[]>([]);
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (option: string) => {
    setServices((prev) =>
      prev.includes(option) ? prev.filter((s) => s !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (services.length === 0) {
      setErrorMsg('Please choose at least one thing you need help with.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, services: services.join(', '), botField }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData(EMPTY_FORM);
        setServices([]);
        setBotField('');
        setTimeout(() => setStatus('idle'), 8000);
      } else if (response.status === 429) {
        setStatus('error');
        setErrorMsg('Too many attempts. Please wait a little while and try again.');
      } else {
        setStatus('error');
        setErrorMsg(
          'Something went wrong. Please try again or email contact@slowebdesign.com.'
        );
      }
    } catch {
      setStatus('error');
      setErrorMsg(
        'Something went wrong. Please try again or email contact@slowebdesign.com.'
      );
    }
  };

  return (
    <div id="contact">
      <h2 className="text-4xl font-bold text-primary-700 mb-3">Tell us what you need.</h2>
      <p className="text-accent-slate mb-8 max-w-xl">
        Describe your project in plain language. We read every inquiry and reply
        personally.
      </p>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Honeypot: invisible to people, left for bots */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
        >
          <label htmlFor="botField">Don&rsquo;t fill this out:</label>
          <input
            type="text"
            id="botField"
            name="botField"
            tabIndex={-1}
            autoComplete="off"
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="name" className={labelCls}>Full Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required maxLength={200} className={inputCls} placeholder="Jane Smith" />
        </div>

        <div>
          <label htmlFor="business" className={labelCls}>Business / Organization *</label>
          <input type="text" id="business" name="business" value={formData.business} onChange={handleChange} required maxLength={200} className={inputCls} placeholder="Your business, or &ldquo;Self&rdquo;" />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>Email Address *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required maxLength={320} className={inputCls} placeholder="jane@yourbusiness.com" />
        </div>

        <div>
          <label htmlFor="phone" className={labelCls}>Phone Number *</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required maxLength={50} className={inputCls} placeholder="(555) 000-0000" />
        </div>

        <div>
          <label htmlFor="website" className={labelCls}>Current Website</label>
          <input type="text" inputMode="url" id="website" name="website" value={formData.website} onChange={handleChange} maxLength={500} className={inputCls} placeholder="yourbusiness.com (optional)" />
        </div>

        <div>
          <label htmlFor="businessType" className={labelCls}>Business Type *</label>
          <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange} required className={inputCls}>
            <option value="" disabled>Select a type...</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budget" className={labelCls}>Budget Range *</label>
          <select id="budget" name="budget" value={formData.budget} onChange={handleChange} required className={inputCls}>
            <option value="" disabled>Select a range...</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <span className={labelCls} id="services-label">What do you need? *</span>
          <div className="grid sm:grid-cols-2 gap-3" role="group" aria-labelledby="services-label">
            {SERVICE_OPTIONS.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                  services.includes(option)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-300 bg-white hover:border-primary-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={services.includes(option)}
                  onChange={() => toggleService(option)}
                  className="w-4 h-4 accent-[#3d5e3f]"
                />
                <span className="text-sm text-primary-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className={labelCls}>
            What do you want people, or your team, to be able to do? *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            maxLength={5000}
            className={`${inputCls} resize-none`}
            placeholder="Tell us about the project in your own words: what it is, who it is for, and what a good outcome looks like."
          />
        </div>

        <div className="md:col-span-2">
          <span className={labelCls} id="contact-method-label">Preferred Contact *</span>
          <div className="flex gap-8" role="radiogroup" aria-labelledby="contact-method-label">
            {CONTACT_METHODS.map((method) => (
              <label key={method} className="flex items-center gap-2 cursor-pointer text-primary-700">
                <input
                  type="radio"
                  name="contactMethod"
                  value={method}
                  checked={formData.contactMethod === method}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#3d5e3f]"
                />
                <span className="text-sm">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {status === 'success' && (
          <motion.div
            className="md:col-span-2 p-4 bg-primary-50 border border-primary-500/30 rounded-lg text-primary-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Thank you. We have received your inquiry and will be in touch soon.
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {errorMsg}
          </motion.div>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
          </button>
          <p className="mt-4 text-sm text-accent-slate">
            Your inquiry is for the studio only.
          </p>
        </div>
      </form>
    </div>
  );
};
