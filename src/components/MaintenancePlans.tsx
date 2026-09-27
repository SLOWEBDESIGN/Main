'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface MaintenancePlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  stripeLink: string;
}

const plans: MaintenancePlan[] = [
  {
    id: '1',
    name: 'Essential Care',
    price: '$49',
    description: '/month',
    features: [
      'Hosting oversight',
      'Security monitoring',
      'Minor content edits',
      'Contact form monitoring',
      'Email support',
    ],
    stripeLink: 'https://buy.stripe.com/aFa3cvckDftkbPbeSGfMA00',
  },
  {
    id: '2',
    name: 'Growth Care',
    price: '$99',
    description: '/month',
    features: [
      'Everything in Essential',
      'Monthly content updates',
      'Analytics review',
      'SEO monitoring',
      'Up to 1 hour of edits/month',
    ],
    stripeLink: 'https://buy.stripe.com/bJe00jgAT0yq2eBcKyfMA01',
  },
  {
    id: '3',
    name: 'Priority Care',
    price: '$199',
    description: '/month',
    features: [
      'Everything in Growth',
      'Priority support',
      'Faster turnaround',
      'Up to 3 hours of edits/month',
      'Quarterly website optimization review',
    ],
    stripeLink: 'https://buy.stripe.com/8x26oHbgz1Cu7yVbGufMA02',
  },
];

export const MaintenancePlans: React.FC = () => {
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
    <section id="maintenance" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Monthly Maintenance Plans
          </h2>
          <p className="text-xl text-accent-slate max-w-2xl mx-auto">
            Keep your website secure, updated, and performing at its best.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className="p-8 border border-secondary-200 rounded-lg bg-secondary-100 hover:shadow-lg transition-shadow flex flex-col"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-semibold text-primary-700 mb-2">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-700">
                  {plan.price}
                </span>
                <span className="text-accent-slate ml-2">{plan.description}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="text-accent-slate text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.stripeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full text-center"
              >
                Subscribe Now
              </a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-white border border-secondary-200 rounded-lg p-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-accent-slate max-w-2xl mx-auto">
            Most clients choose ongoing maintenance to keep their websites secure and performing well. It's the best investment to protect your online presence.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
