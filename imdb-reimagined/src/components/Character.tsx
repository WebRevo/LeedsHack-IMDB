"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/store/wizardStore";
import { fireEvent, resetEngine } from "@/lib/scriptEngine";

/* ================================================================
   TTS helpers
   ================================================================ */

function speak(text: string) {
  try {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1;
    utt.pitch = 1;
    utt.volume = 0.8;
    synth.speak(utt);
  } catch {
    /* silent fallback */
  }
}

function cancelSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* silent */
  }
}

/* ================================================================
   Animated blob avatar
   ================================================================ */

function Blob() {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      className="drop-shadow-lg"
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 3, -2, 0],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    >
      {/* Body */}
      <path
        d="M39 12C54 9 70 22 69 40C68 58 55 71 40 69C24 67 9 56 11 40C13 24 24 15 39 12Z"
        fill="#f5c518"
      />
      {/* Eyes */}
      <circle cx="30" cy="36" r="3.5" fill="#161616" />
      <circle cx="50" cy="36" r="3.5" fill="#161616" />
      {/* Eye highlights */}
      <circle cx="31.2" cy="35" r="1.2" fill="white" />
      <circle cx="51.2" cy="35" r="1.2" fill="white" />
      {/* Smile */}
      <path
        d="M30 48Q40 56 50 48"
        fill="none"
        stroke="#161616"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/* ================================================================
   Character overlay
   ================================================================ */

interface CharacterProps {
  enabled: boolean;
  currentStep: number;
}

export default function Character({ enabled, currentStep }: CharacterProps) {
  const [message, setMessage] = useState<string | null>(null);
  const prevRef = useRef({ confidence: 0, warningCount: 0, step: 0 });
  const idleRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(false);

  const confidence = useWizardStore((s) => s.meta.confidenceScore);
  const warningCount = useWizardStore((s) => s.meta.warnings.length);

  const show = useCallback((text: string) => {
    setMessage(text);
    speak(text);
  }, []);

  /* ---- React to store / step changes ---- */

  useEffect(() => {
    if (!enabled) return;

    // Skip first render to snapshot current state
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevRef.current = { confidence, warningCount, step: currentStep };
      return;
    }

    const prev = prevRef.current;

    // Step advanced → stepComplete (takes priority over fieldValid)
    if (currentStep > prev.step) {
      const line = fireEvent("stepComplete");
      if (line) show(line);
    } else if (confidence > prev.confidence) {
      const line = fireEvent("fieldValid");
      if (line) show(line);
    }

    // Warning count grew
    if (warningCount > prev.warningCount) {
      const line = fireEvent("warningShown");
      if (line) show(line);
    }

    prevRef.current = { confidence, warningCount, step: currentStep };
  }, [enabled, confidence, warningCount, currentStep, show]);

  /* ---- Idle timer (10 s of no store changes) ---- */

  useEffect(() => {
    if (!enabled) return;

    const resetIdle = () => {
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(() => {
        const line = fireEvent("idle10s");
        if (line) show(line);
      }, 10_000);
    };

    const unsub = useWizardStore.subscribe(resetIdle);
    resetIdle();

    return () => {
      unsub();
      clearTimeout(idleRef.current);
    };
  }, [enabled, show]);

  /* ---- Auto-clear message after 5 s ---- */

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  /* ---- Cleanup on toggle-off ---- */

  useEffect(() => {
    if (!enabled) {
      setMessage(null);
      resetEngine();
      mountedRef.current = false;
      cancelSpeech();
    }
  }, [enabled]);

  /* Cancel TTS on unmount */
  useEffect(() => () => cancelSpeech(), []);

  /* ---- Render ---- */

  return (
    <>
      {/* Floating character — bottom-right */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            key="character"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
            className="fixed bottom-20 right-8 z-50 flex flex-col items-center"
          >
            {/* Speech bubble */}
            <AnimatePresence>
              {message && (
                <motion.div
                  key="bubble"
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="relative mb-3 max-w-[220px] rounded-xl bg-white px-4 py-2.5 text-center text-sm font-medium text-imdb-black shadow-lg"
                >
                  {message}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white" />
                </motion.div>
              )}
            </AnimatePresence>

            <Blob />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitle strip — bottom edge */}
      <AnimatePresence>
        {enabled && message && (
          <motion.div
            key="subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-imdb-black/90 py-2.5 text-center backdrop-blur-sm"
          >
            <span className="text-sm text-imdb-white/80">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
