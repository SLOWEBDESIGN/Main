'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-secondary-100 backdrop-blur-md border-b border-secondary-200">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          className="logo text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          SLO Web Design
        </motion.div>
        
        <div className="flex gap-8 items-center">
          <button
            onClick={() => scrollToSection('contact')}
            className="text-sm font-medium text-primary-700 hover:text-primary-500 transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => scrollToSection('booking')}
            className="btn btn-primary text-sm"
          >
            Schedule Consultation
          </button>
        </div>
      </nav>
    </header>
  );
};
