"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotWindow from "./ChatbotWindow";

/* =========================================================
   ChatbotLauncher — floating icon + window orchestration

   The icon is a custom IMDb-themed design:
   - Dark circle with gold "film reel" motif
   - Idle pulse glow
   - Hover expansion
   - Respects prefers-reduced-motion via Framer defaults
   ========================================================= */

/* ---- Animation variants ---- */

const windowVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.92,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 28,
    },
  },
};

export default function ChatbotLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ---- Chat window ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbot-window"
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed bottom-24 right-5 z-[55] max-sm:bottom-0 max-sm:right-0 max-sm:left-0"
          >
            <ChatbotWindow onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Floating launcher icon ---- */}
      <motion.button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-5 right-5 z-[56] flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15),0_0_0_1px_rgba(245,197,24,0.1)]"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Close IMDb Assistant" : "Open IMDb Assistant"}
      >
        {/* Background circle with gradient */}
        <div className="absolute inset-0 rounded-full bg-[#161616]" />

        {/* Pulsing gold glow ring (idle animation) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "0 0 0 0px rgba(245,197,24,0.3)",
          }}
          animate={
            open
              ? {}
              : {
                  boxShadow: [
                    "0 0 0 0px rgba(245,197,24,0.3)",
                    "0 0 0 6px rgba(245,197,24,0)",
                  ],
                }
          }
          transition={
            open
              ? {}
              : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut" as const,
                }
          }
        />

        {/* Inner gold accent ring */}
        <div className="absolute inset-[2px] rounded-full border border-[#f5c518]/20" />

        {/* Icon: custom film-reel inspired chat icon */}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              className="relative h-6 w-6 text-[#f5c518]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="open"
              className="relative h-6 w-6 text-[#f5c518]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Film frame outline */}
              <rect x="2" y="4" width="20" height="16" rx="3" />
              {/* Sprocket holes (film reel motif) */}
              <circle cx="6" cy="8" r="1" fill="currentColor" stroke="none" />
              <circle cx="6" cy="16" r="1" fill="currentColor" stroke="none" />
              <circle cx="18" cy="8" r="1" fill="currentColor" stroke="none" />
              <circle cx="18" cy="16" r="1" fill="currentColor" stroke="none" />
              {/* Chat lines inside the "screen" */}
              <line x1="9" y1="9.5" x2="15" y2="9.5" />
              <line x1="9" y1="12.5" x2="14" y2="12.5" />
              <line x1="9" y1="15.5" x2="12" y2="15.5" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
