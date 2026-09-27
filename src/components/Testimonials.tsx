'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { testimonials } from '@/src/data/testimonials';

export const Testimonials: React.FC = () => {
  // No verified testimonials on file yet: render nothing rather than
  // presenting unverified quotes as social proof.
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-secondary-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              className="p-6 rounded-xl bg-white border border-secondary-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote size={20} className="text-primary-300" />
              </div>
              <p className="text-accent-slate text-sm leading-relaxed mb-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="font-semibold text-primary-700 text-sm">{testimonial.name}</p>
              <p className="text-xs text-accent-slate">{testimonial.business}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
