'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Pencil,
  Palette,
  Code2,
  Rocket,
  Headphones,
} from 'lucide-react';

interface ProcessStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: ProcessStep[] = [
  {
    id: 1,
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Consultation',
    description: 'We meet with you to understand your business, goals, and vision.',
  },
  {
    id: 2,
    icon: <Pencil className="w-8 h-8" />,
    title: 'Planning',
    description: 'We create a strategic plan for your website structure and content.',
  },
  {
    id: 3,
    icon: <Palette className="w-8 h-8" />,
    title: 'Design',
    description: 'We design beautiful, modern interfaces that reflect your brand.',
  },
  {
    id: 4,
    icon: <Code2 className="w-8 h-8" />,
    title: 'Development',
    description: 'We build your website with clean code and modern technologies.',
  },
  {
    id: 5,
    icon: <Rocket className="w-8 h-8" />,
    title: 'Launch',
    description: 'We deploy your website and ensure everything is working perfectly.',
  },
  {
    id: 6,
    icon: <Headphones className="w-8 h-8" />,
    title: 'Ongoing Support',
    description: 'We provide continuous support, updates, and optimization.',
  },
];

export const Process: React.FC = () => {
  return (
    <section id="process" className="py-20 px-6 bg-secondary-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Our Process
          </h2>
          <p className="text-xl text-accent-slate max-w-2xl mx-auto">
            A structured approach to creating your perfect website.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Step number badge */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {step.id}
              </div>

              {/* Card */}
              <div className="p-8 border border-secondary-200 rounded-lg bg-white hover:shadow-lg transition-shadow ml-4">
                <div className="text-primary-500 mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-2">
                  {step.title}
                </h3>
                <p className="text-accent-slate leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline visualization */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-accent-slate mb-4">
            Typical project timeline: 4-8 weeks depending on scope and complexity
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-secondary-200 rounded-full">
            <span className="text-sm font-medium text-primary-700">
              Ready to start? Schedule your consultation
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
