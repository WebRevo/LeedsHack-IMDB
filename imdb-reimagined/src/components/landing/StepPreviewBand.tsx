"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { STEP_LABELS } from "./constants";

const stepIcons = [
  // Core
  <svg key="core" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>,
  // Mandatory
  <svg key="mandatory" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>,
  // Identity
  <svg key="identity" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  // Production
  <svg key="production" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>,
  // Credits
  <svg key="credits" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
];

export default function StepPreviewBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="mt-20 w-full px-4">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center font-display text-[10px] uppercase tracking-[0.25em] text-imdb-gray/60"
      >
        5 guided steps to a perfect submission
      </motion.p>

      <div className="mx-auto max-w-2xl">
        {/* Steps row */}
        <div className="relative flex items-start justify-between">
          {/* Connector line (behind the circles) */}
          <div className="absolute left-[10%] right-[10%] top-6 flex items-center">
            {STEP_LABELS.slice(0, -1).map((_, i) => (
              <motion.div
                key={i}
                className="h-[1px] flex-1 bg-imdb-black/[0.08]"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                style={{ originX: 0 }}
              />
            ))}
          </div>

          {STEP_LABELS.map((label, i) => (
            <motion.div
              key={label}
              className="relative flex flex-col items-center gap-2.5"
              style={{ flex: "1 1 0%" }}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {/* Step circle */}
              <motion.div
                className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-imdb-black/[0.06] bg-white text-imdb-gray/60 shadow-sm"
                whileHover={{
                  borderColor: "rgba(245,197,24,0.4)",
                  color: "rgba(245,197,24,1)",
                  y: -3,
                  boxShadow: "0 4px 16px rgba(245,197,24,0.12)",
                }}
                transition={{ duration: 0.2 }}
              >
                {stepIcons[i]}
              </motion.div>

              {/* Label */}
              <span className="text-center font-display text-[9px] uppercase tracking-widest text-imdb-gray/70 sm:text-[10px]">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
