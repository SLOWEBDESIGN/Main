"use client";

import Image from "next/image";
import { GripVertical } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { type PointerEvent, useRef, useState } from "react";

export function ComparisonSlider() {
  const [position, setPosition] = useState(50);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 34 };

  function updatePosition(clientX: number) {
    const bounds = containerRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const nextPosition = ((clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, Math.round(nextPosition))));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePosition(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updatePosition(event.clientX);
    }
  }

  return (
    <div>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative aspect-[8/5] touch-none cursor-ew-resize overflow-hidden rounded-[1.2rem] border border-white/15 bg-[#d9ded9] shadow-[0_24px_70px_rgba(15,45,37,0.22)]"
      >
        <Image
          src="/comparison/modernized-site.svg"
          alt="Modernized website placeholder showing a polished local business website"
          fill
          sizes="(max-width: 768px) 100vw, 1100px"
          className="object-cover"
        />
        <motion.div
          className="absolute inset-0 overflow-hidden"
          animate={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          transition={transition}
        >
          <Image
            src="/comparison/outdated-site.svg"
            alt="Outdated website placeholder showing an older local business website"
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover"
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] sm:p-5">
          <span className="rounded-full bg-[#5e5145]/90 px-3 py-2 text-white shadow-sm">
            Outdated
          </span>
          <span className="rounded-full bg-forest/90 px-3 py-2 text-white shadow-sm">
            Modernized
          </span>
        </div>

        <motion.div
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_16px_rgba(0,0,0,0.2)]"
          animate={{ left: `${position}%` }}
          transition={transition}
        >
          <div
            className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-forest text-white shadow-lg ${
              isFocused ? "ring-4 ring-[#b8d2c8]" : ""
            }`}
          >
            <GripVertical aria-hidden="true" className="h-5 w-5" />
          </div>
        </motion.div>

        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          onInput={(event) => setPosition(Number(event.currentTarget.value))}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              setPosition((current) => Math.min(100, current + 1));
            }

            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              setPosition((current) => Math.max(0, current - 1));
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Compare outdated and modernized website examples"
          aria-valuetext={`${position}% outdated website visible`}
          className="absolute left-1/2 top-1/2 z-20 h-px w-px opacity-0"
        />
      </div>
      <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-muted">
        Drag the handle to compare
      </p>
    </div>
  );
}
