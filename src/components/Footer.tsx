'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Mail, MapPin, Phone } from 'lucide-react';
import type { BrandVariant } from '@/src/lib/schema';
import { getBrandCopy } from '@/src/lib/schema';

const QUICK_LINKS: [string, string][] = [
  ['Services', '#services'],
  ['Pricing', '#pricing'],
  ['Our Process', '#process'],
  ['Book a Consultation', '#booking'],
  ['Contact', '#contact'],
];

const SERVICE_LINKS: [string, string][] = [
  ['Web Design', '#services'],
  ['Website Modernization', '#services'],
  ['Maintenance Plans', '#pricing'],
  ['SEO Services', '#contact'],
];

export const Footer: React.FC<{ variant?: BrandVariant }> = ({ variant = 'slowebdesign' }) => {
  const copy = getBrandCopy(variant);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 text-secondary-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-4 gap-12 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <div className="logo text-2xl mb-4 text-secondary-100 leading-tight">
              {copy.siteName}
            </div>
            <p className="text-secondary-200 text-sm leading-relaxed">{copy.footerCopy}</p>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-50 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-secondary-200 hover:text-secondary-100 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-50 mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              {SERVICE_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-secondary-200 hover:text-secondary-100 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-secondary-50 mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              {copy.phone && copy.phoneHref && <a
                href={copy.phoneHref}
                className="flex items-center gap-2 text-secondary-200 hover:text-secondary-100 transition-colors"
              >
                <Phone size={16} />
                {copy.phone}
              </a>}
              <a
                href="mailto:contact@slowebdesign.com"
                className="flex items-center gap-2 text-secondary-200 hover:text-secondary-100 transition-colors"
              >
                <Mail size={16} />
                contact@slowebdesign.com
              </a>
              <div className="flex items-center gap-2 text-secondary-200">
                <MapPin size={16} />
                {copy.city}, California
              </div>
              <a
                href="https://github.com/SLOWEBDESIGN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary-200 hover:text-secondary-100 transition-colors"
              >
                <Github size={16} />
                GitHub
              </a>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-primary-600 my-8" />

        <motion.div
          className="text-center text-sm text-secondary-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p>
            &copy; {currentYear} {copy.siteName}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
