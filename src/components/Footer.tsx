'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 text-secondary-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-4 gap-12 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand */}
          <div>
            <div className="logo text-2xl mb-4 text-secondary-100">
              SLO Web Design
            </div>
            <p className="text-secondary-200 text-sm leading-relaxed">
              Premium web design agency in San Luis Obispo, California.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-secondary-50 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#services"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#process"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Process
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-secondary-50 mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#services"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Modernization
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Custom Development
                </a>
              </li>
              <li>
                <a
                  href="#maintenance"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  Maintenance
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-secondary-200 hover:text-secondary-100 transition-colors"
                >
                  SEO
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-secondary-50 mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <a
                href="tel:530-215-5987"
                className="flex items-center gap-2 text-secondary-200 hover:text-secondary-100 transition-colors"
              >
                <Phone size={16} />
                530-215-5987
              </a>
              <a
                href="mailto:contact@slowebdesign.com"
                className="flex items-center gap-2 text-secondary-200 hover:text-secondary-100 transition-colors"
              >
                <Mail size={16} />
                contact@slowebdesign.com
              </a>
              <div className="flex items-center gap-2 text-secondary-200">
                <MapPin size={16} />
                San Luis Obispo, CA
              </div>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-primary-600 my-8" />

        {/* Bottom */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center text-sm text-secondary-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p>
            © {currentYear} SLO Web Design. All rights reserved. • Based in San Luis Obispo, California
          </p>
          <a
            href="https://github.com/SLOWEBDESIGN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-secondary-100 transition-colors mt-4 md:mt-0"
          >
            <Github size={18} />
            GitHub
          </a>
        </motion.div>
      </div>
    </footer>
  );
};
