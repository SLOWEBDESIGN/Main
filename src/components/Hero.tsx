'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-32 pb-20 px-6 bg-secondary-100">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-6xl md:text-7xl font-bold text-primary-700 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Modern Websites for<br />San Luis Obispo Businesses
        </motion.h1>

        <motion.p
          className="text-xl text-accent-slate mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          We modernize outdated websites and build beautiful, high-performing websites from scratch. Local service with personalized attention.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <button
            onClick={() => scrollToSection('calendly')}
            className="btn btn-primary px-8 py-3 text-lg flex items-center justify-center gap-2"
          >
            Schedule Consultation
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="btn btn-secondary px-8 py-3 text-lg"
          >
            Request Quote
          </button>
        </motion.div>

        <motion.p
          className="text-sm text-accent-slate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          San Luis Obispo, California • 530-215-5987
        </motion.p>
      </div>
    </section>
  );
};
