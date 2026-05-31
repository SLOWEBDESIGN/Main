'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const WebsiteComparison: React.FC = () => {
  const [showReveal, setShowReveal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section id="comparison" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-primary-700 mb-4"
            variants={itemVariants}
          >
            See How We Transform Websites
          </motion.h2>
          <motion.p
            className="text-xl text-accent-slate max-w-3xl mx-auto"
            variants={itemVariants}
          >
            From outdated and ineffective to modern, high-converting, and professional.
            We increase performance, improve user experience, and drive results.
          </motion.p>
        </motion.div>

        {/* Comparison Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Before (Outdated) */}
          <motion.div
            className="relative group"
            variants={imageVariants}
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl bg-gray-100">
              <Image
                src="/images/old-website-placeholder.svg"
                alt="Outdated website - cluttered, outdated design with slow performance"
                width={1200}
                height={750}
                className="w-full h-auto object-cover aspect-video"
                priority={false}
                loading="lazy"
              />
              {/* Label Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-white">
                  <div className="text-2xl font-bold mb-1">Outdated</div>
                  <ul className="text-sm space-y-1 opacity-90">
                    <li>• Slow loading times</li>
                    <li>• Poor mobile experience</li>
                    <li>• Dated design aesthetic</li>
                    <li>• Low conversion rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* After (Modernized) */}
          <motion.div
            className="relative group"
            variants={imageVariants}
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl bg-gray-100">
              <Image
                src="/images/new-website-placeholder.svg"
                alt="Modern website - clean, professional design with fast performance"
                width={1200}
                height={750}
                className="w-full h-auto object-cover aspect-video"
                priority={false}
                loading="lazy"
              />
              {/* Label Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary-700/80 to-transparent">
                <div className="text-white">
                  <div className="text-2xl font-bold mb-1">Modernized</div>
                  <ul className="text-sm space-y-1 opacity-90">
                    <li>✓ Lightning fast</li>
                    <li>✓ Mobile optimized</li>
                    <li>✓ Professional design</li>
                    <li>✓ Higher conversions</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive Toggle */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={() => setShowReveal(!showReveal)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-300 mb-8"
          >
            <span>{showReveal ? 'Hide Details' : 'See The Transformation'}</span>
            <motion.span
              animate={{ rotate: showReveal ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ↓
            </motion.span>
          </button>
        </motion.div>

        {/* Reveal Content */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: showReveal ? 1 : 0,
            height: showReveal ? 'auto' : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 bg-secondary-100 p-8 rounded-lg">
            {/* Improvement 1 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={showReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-primary-700 mb-2">3x</div>
              <p className="text-accent-slate font-semibold mb-1">Faster Load Times</p>
              <p className="text-sm text-accent-slate">Optimized for speed and SEO performance</p>
            </motion.div>

            {/* Improvement 2 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={showReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-primary-700 mb-2">100%</div>
              <p className="text-accent-slate font-semibold mb-1">Mobile Responsive</p>
              <p className="text-sm text-accent-slate">Perfect experience on all devices</p>
            </motion.div>

            {/* Improvement 3 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={showReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-4xl font-bold text-primary-700 mb-2">+45%</div>
              <p className="text-accent-slate font-semibold mb-1">Conversion Growth</p>
              <p className="text-sm text-accent-slate">On average across our projects</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-accent-slate mb-6">
            Ready to transform your website? Let's discuss your project.
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-300"
          >
            Schedule a Consultation
          </a>
        </motion.div>
      </div>
    </section>
  );
};
