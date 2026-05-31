'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export const Calendly: React.FC = () => {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="calendly" className="py-20 px-6 bg-white">
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
            Pick a time that works for you. We'll discuss your project and answer any questions.
          </p>
          <p className="text-accent-slate mt-2 text-sm">
            Video call via Google Meet • 30 minutes • No obligation
          </p>
        </motion.div>

        <motion.div
          className="rounded-lg overflow-hidden shadow-xl bg-white border border-secondary-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/contact-slowebdesign/30min?hide_event_type_details=1&hide_gdpr_block=1&background_color=fafaf7"
            style={{ minWidth: '320px', height: '700px' }}
          />
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
          </a>
          {' '}or email{' '}
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
