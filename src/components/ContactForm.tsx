'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    website: '',
    businessType: '',
    budget: '',
    services: '',
    description: '',
    contactMethod: 'email',
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      // Next.js Runtime v5 (@netlify/plugin-nextjs v5) detects the form from the
      // static public/__forms.html file at build time. Submissions must be POSTed
      // to that file as url-encoded data. See:
      // https://docs.netlify.com/frameworks/next-js/runtime-v5/forms/migration/
      const form = e.currentTarget;
      const body = new URLSearchParams(
        new FormData(form) as unknown as Record<string, string>
      ).toString();

      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          business: '',
          email: '',
          phone: '',
          website: '',
          businessType: '',
          budget: '',
          services: '',
          description: '',
          contactMethod: 'email',
        });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      // Network error or submission failed
      setSubmitStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 px-6 bg-secondary-100">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-accent-slate">
            Tell us about your project and we'll respond within 24 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Honeypot field for spam protection - hidden from users */}
            <input type="hidden" name="bot-field" value="" />

            {/* Form name for Netlify Forms - required for form detection */}
            <input type="hidden" name="form-name" value="contact" />
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Sarah Johnson"
              />
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-primary-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="business"
                name="business"
                value={formData.business}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your Business"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="sarah@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-primary-700 mb-2">
                Existing Website URL (if any)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-primary-700 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a type</option>
                <option value="retail">Retail</option>
                <option value="service">Service</option>
                <option value="professional">Professional Services</option>
                <option value="ecommerce">E-commerce</option>
                <option value="nonprofit">Non-profit</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-primary-700 mb-2">
                Budget Range *
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a range</option>
                <option value="under-1500">Under $1,500</option>
                <option value="1500-2500">$1,500 - $2,500</option>
                <option value="2500-5000">$2,500 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000-plus">$10,000+</option>
              </select>
            </div>

            {/* Services Needed */}
            <div className="md:col-span-2">
              <label htmlFor="services" className="block text-sm font-medium text-primary-700 mb-2">
                Services Needed *
              </label>
              <select
                id="services"
                name="services"
                value={formData.services}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select services</option>
                <option value="modernization">Website Modernization</option>
                <option value="custom">Custom Website Development</option>
                <option value="landing">Landing Page</option>
                <option value="maintenance">Website Maintenance</option>
                <option value="multiple">Multiple Services</option>
                <option value="unsure">Not Sure Yet</option>
              </select>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
              Tell Us About Your Project *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Describe your project, goals, and any specific requirements..."
            />
          </div>

          {/* Contact Method */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-3">
              Preferred Contact Method *
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.contactMethod === 'email'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-accent-slate">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={formData.contactMethod === 'phone'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-accent-slate">Phone</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="both"
                  checked={formData.contactMethod === 'both'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-accent-slate">Both</span>
              </label>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <motion.div
              className="p-4 bg-primary-50 border border-primary-200 rounded-lg text-primary-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ Thank you! We've received your message and will respond within 24 hours.
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Something went wrong. Please try again or call us at 530-215-5987.
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitStatus === 'loading'}
            className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
            {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
          </button>

          <p className="text-center text-sm text-accent-slate">
            We respect your privacy. Your information will never be shared.
          </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
