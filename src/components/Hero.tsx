'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { BrandVariant } from '@/src/lib/schema';
import { getBrandCopy } from '@/src/lib/schema';

export const Hero: React.FC<{ variant?: BrandVariant }> = ({ variant = 'slowebdesign' }) => {
  const copy = getBrandCopy(variant);
  const [titleLine1, titleLine2] = copy.heroTitle.split('\\n');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-32 pb-20 px-6 bg-secondary-100">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Web design for {copy.city}, California
        </motion.p>

        <motion.h1
          className="text-5xl md:text-6xl font-bold text-primary-700 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {titleLine1}
          <br />
          {titleLine2 ?? ''}
        </motion.h1>

        <motion.p
          className="text-xl text-accent-slate mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {copy.heroText}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => scrollToSection('booking')}
            className="btn btn-primary text-lg px-8 py-4"
          >
            Schedule Consultation
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="btn btn-secondary text-lg px-8 py-4"
          >
            Request Quote
          </button>
        </motion.div>

        <motion.p
          className="mt-8 text-sm text-accent-slate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {copy.locationLine}
        </motion.p>
      </div>
    </section>
  );
};
