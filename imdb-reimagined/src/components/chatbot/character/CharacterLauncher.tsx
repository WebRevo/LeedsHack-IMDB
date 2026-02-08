"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotWindow from "../ChatbotWindow";
import CharacterAvatar from "./CharacterAvatar";
import PointingHand from "./PointingHand";
import { useCharacterAnimation } from "./useCharacterAnimation";
import { WINDOW } from "./characterVariants";

/* =========================================================
   CharacterLauncher — premium cinematic IMDb character

   Orchestrates:
     - Large animated character (80–110px responsive)
     - Always-visible "Need help?" label with float animation
     - External pointing-hand baton
     - Chat window: desktop=floating, mobile=bottom sheet + blur
     - prefers-reduced-motion compliance

   Size:
     - Mobile  (<640px): 80px
     - Tablet  (≥640px): 96px
     - Desktop (≥1024px): 110px
   ========================================================= */

export default function CharacterLauncher() {
  const [open, setOpen] = useState(false);
  const { isAnimating, nudgeActive } = useCharacterAnimation(open);

  return (
    <>
      {/* ---- Backdrop blur (mobile only, when chat is open) ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[54] bg-black/40 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ---- Chat window ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbot-window"
            variants={WINDOW}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed z-[55] max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:mx-2 max-sm:mb-2 max-sm:h-[75dvh] max-sm:max-h-[600px] sm:bottom-[124px] sm:right-5 lg:bottom-[140px]"
          >
            <ChatbotWindow onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Character area (fixed bottom-right) ---- */}
      <div
        className="fixed right-3 z-[56] flex flex-col items-center sm:right-5"
        style={{
          bottom:
            "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            /* ---- Close button (compact) ---- */
            <motion.button
              key="close-btn"
              type="button"
              onClick={() => setOpen(false)}
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#161616] shadow-[0_4px_20px_rgba(0,0,0,0.2),0_0_0_1px_rgba(245,197,24,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]/40 sm:h-14 sm:w-14"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Close IMDb Assistant"
            >
              <div className="absolute inset-[2px] rounded-full border border-[#f5c518]/15" />
              <svg
                className="h-5 w-5 text-[#f5c518] sm:h-6 sm:w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          ) : (
            /* ---- Character wrapper (large, animated) ---- */
            <motion.div
              key="character-wrapper"
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: "easeOut" as const }}
            >
              {/* Always-visible "Need help?" label */}
              <motion.div
                className="mb-1 whitespace-nowrap sm:mb-1.5"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                }}
              >
                <div className="rounded-lg bg-[#161616] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#f5c518] shadow-[0_2px_12px_rgba(245,197,24,0.12),0_0_0_1px_rgba(245,197,24,0.08)] sm:px-3 sm:py-1.5 sm:text-xs">
                  Need help?
                </div>
                {/* Tail */}
                <div className="mx-auto h-1.5 w-1.5 rotate-45 bg-[#161616] shadow-[1px_1px_0_rgba(245,197,24,0.08)] sm:h-2 sm:w-2" />
              </motion.div>

              {/* Pointing hand (to the left of character) */}
              <div className="relative">
                <PointingHand isAnimating={isAnimating} />

                {/* Character button */}
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="relative block h-20 w-20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]/40 sm:h-24 sm:w-24 lg:h-[110px] lg:w-[110px]"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Open IMDb Assistant"
                >
                  <CharacterAvatar
                    isAnimating={isAnimating}
                    nudgeActive={nudgeActive}
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
