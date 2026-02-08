"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROTATING_LINES } from "./constants";

export default function RotatingMicrocopy() {
  const [index, setIndex] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_LINES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [prefersReduced]);

  if (prefersReduced) {
    return (
      <p className="text-center text-sm text-imdb-gray/60">
        {ROTATING_LINES[0]}
      </p>
    );
  }

  return (
    <div className="flex h-5 items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-center text-[13px] text-imdb-gray/60"
        >
          {ROTATING_LINES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
