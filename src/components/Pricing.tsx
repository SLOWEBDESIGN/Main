'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: '1',
    title: 'Website Modernization',
    price: '$1,500',
    description: 'Refresh an existing website',
    features: [
      'Redesign existing website',
      'Modern responsive layout',
      'Responsive improvements',
      'SEO foundations',
      'Performance improvements',
    ],
  },
  {
    id: '2',
    title: 'Custom Growth Website',
    price: '$2,500',
    description: 'Built for business growth',
    features: [
      'Complete custom website',
      'Premium design',
      'Smooth animations',
      'Lead generation focus',
      'Advanced sections',
      'Local SEO setup',
    ],
  },
  {
    id: '3',
    title: 'Secure Platform',
    price: '$4,000+',
    description: 'With authentication & dashboards',
    features: [
      'User authentication',
      'Secure user areas',
      'Custom dashboards',
      'Advanced functionality',
      'Database integration',
      'Custom backend',
    ],
  },
];

export const Pricing: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-secondary-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Website Project Pricing
          </h2>
          <p className="text-xl text-accent-slate max-w-2xl mx-auto">
            Transparent pricing for websites designed to grow your business.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.id}
              className="p-8 border border-secondary-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-semibold text-primary-700 mb-2">
                {plan.title}
              </h3>
              <p className="text-accent-slate mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-primary-700 mb-6">
                {plan.price}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="text-accent-slate">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-white border border-secondary-200 rounded-lg p-8 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-primary-700 mb-4">
            Not Sure Which Plan Is Right?
          </h3>
          <p className="text-accent-slate leading-relaxed mb-4">
            Most small to medium-sized businesses do not require secure login systems and complex functionality. They are far better served by beautiful, simple websites focused on clarity and conversion. If you need user authentication, dashboards, or advanced features, we'll discuss that during your consultation.
          </p>
          <p className="text-accent-slate">
            We recommend starting with Website Modernization or Custom Growth Website, and evolving from there.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
