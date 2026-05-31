'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const ImageComparison: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showHint, setShowHint] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Hide hint after 5 seconds
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const hideHint = () => {
    setShowHint(false);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    setIsAnimating(false);
    hideHint();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setIsAnimating(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    updateSliderPosition(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsAnimating(false);
    hideHint();
    updateSliderPosition(e);
  };

  const handleTouchEnd = () => {
    setIsAnimating(true);
  };

  const updateSliderPosition = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <section id="comparison" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            See the Difference
          </h2>
          <p className="text-xl text-accent-slate">
            Drag to compare outdated websites with modern redesigns
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-col-resize shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Before Image */}
            <div className="absolute inset-0">
              <img
                src="/comparison/before.png"
                alt="Outdated website"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-medium">
                Outdated
              </div>
            </div>

            {/* After Image */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src="/comparison/after.png"
                alt="Modernized website"
                className="w-full h-full object-cover"
                style={{ width: `${(100 / sliderPosition) * 100}%` }}
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-primary-700 bg-opacity-75 text-white px-3 py-1 rounded text-sm font-medium">
                Modernized
              </div>
            </div>

            {/* Slider Handle */}
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-lg"
              style={{ left: `${sliderPosition}%` }}
              animate={isAnimating ? { x: [0, 8, -8, 0] } : { x: 0 }}
              transition={isAnimating ? {
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
              } : { duration: 0.2 }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center gap-2">
                  {/* "Slide me" Hint Label */}
                  {showHint && (
                    <motion.div
                      className="text-xs font-semibold text-primary-700 whitespace-nowrap mb-1"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      Slide me
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-full shadow-lg">
                    <svg
                      className="w-4 h-4 text-primary-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <svg
                      className="w-4 h-4 text-primary-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-sm text-accent-slate mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Desktop-first design • Responsive mobile • Modern animations • Improved UX
        </motion.p>
      </div>
    </section>
  );
};
