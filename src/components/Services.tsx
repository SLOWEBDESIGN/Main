'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Code2,
  MapPin,
  Zap,
  Wrench,
  Search,
} from 'lucide-react';

interface ServiceCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const services: ServiceCard[] = [
  {
    id: '1',
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'Website Modernization',
    description: 'Transform outdated websites into modern, responsive platforms that engage users and convert leads.',
  },
  {
    id: '2',
    icon: <Code2 className="w-8 h-8" />,
    title: 'Custom Website Development',
    description: 'Build beautiful, high-performing websites from scratch tailored to your unique business needs.',
  },
  {
    id: '3',
    icon: <MapPin className="w-8 h-8" />,
    title: 'Local Business Websites',
    description: 'Specialized websites for San Luis Obispo and California businesses focused on local SEO.',
  },
  {
    id: '4',
    icon: <Zap className="w-8 h-8" />,
    title: 'Landing Pages',
    description: 'High-converting landing pages designed to capture leads and drive specific business goals.',
  },
  {
    id: '5',
    icon: <Wrench className="w-8 h-8" />,
    title: 'Website Maintenance',
    description: 'Ongoing support, updates, and optimization to keep your website performing at its best.',
  },
  {
    id: '6',
    icon: <Search className="w-8 h-8" />,
    title: 'SEO Foundations',
    description: 'Build SEO best practices into your website from day one for better search visibility.',
  },
];

export const Services: React.FC = () => {
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
    <section id="services" className="py-20 px-6 bg-secondary-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Services
          </h2>
          <p className="text-xl text-accent-slate max-w-2xl mx-auto">
            Everything your business needs for a stunning, high-performing website.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="p-8 border border-secondary-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <div className="text-primary-500 mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">
                {service.title}
              </h3>
              <p className="text-accent-slate leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
