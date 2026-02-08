"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Fake waveform bars for the listening overlay */
function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-imdb-gold"
          animate={{
            height: [8, 20 + Math.random() * 16, 8],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut" as const,
          }}
        />
      ))}
    </div>
  );
}

const FAKE_TRANSCRIPT_LINES = [
  "A short documentary from India...",
  "released in 2023...",
  "screened at international film festivals.",
];

export default function VoicePreviewOverlay({ open, onClose }: Props) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setLineIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setLineIndex((i) => {
        if (i >= FAKE_TRANSCRIPT_LINES.length - 1) {
          clearInterval(timer);
          return i;
        }
        return i + 1;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-imdb-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Gold sweep line */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-[1px] bg-imdb-gradient"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Listening pulse ring */}
          <motion.div
            className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border-2 border-imdb-gold/30"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(245,197,24,0)",
                "0 0 0 24px rgba(245,197,24,0.08)",
                "0 0 0 0 rgba(245,197,24,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Mic icon */}
            <svg
              className="h-10 w-10 text-imdb-gold"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </motion.div>

          {/* Waveform */}
          <WaveformBars />

          {/* Transcript preview */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <AnimatePresence mode="popLayout">
              {FAKE_TRANSCRIPT_LINES.slice(0, lineIndex + 1).map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: i === lineIndex ? 1 : 0.5, y: 0 }}
                  className="text-center font-body text-sm text-white/80"
                >
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>

          {/* "Tap to close" */}
          <motion.p
            className="absolute bottom-10 text-[10px] uppercase tracking-widest text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tap anywhere to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
