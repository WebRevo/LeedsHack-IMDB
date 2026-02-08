"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NUDGE_TEXTS, NUDGE_INTERVAL_MS, NUDGE_DISPLAY_MS } from "./characterVariants";

/* =========================================================
   useCharacterAnimation — controls animation intensity and
   the periodic nudge tooltip cycle.

   Props:
     isChatOpen — whether the chat window is open

   Returns:
     isAnimating          — true  = full continuous loops
                            false = calm / static pose
     nudgeActive          — true during the emphasis moment
     tooltipText          — current nudge label (null = hidden)
     prefersReducedMotion — respects OS accessibility setting
   ========================================================= */

export function useCharacterAnimation(isChatOpen: boolean) {
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [nudgeActive, setNudgeActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const textIndexRef = useRef(0);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /* ---- Detect prefers-reduced-motion ---- */
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const clearTimers = useCallback(() => {
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  /* ---- Nudge cycle: tooltip every NUDGE_INTERVAL_MS ---- */
  const scheduleNudge = useCallback(() => {
    nudgeTimerRef.current = setTimeout(() => {
      setNudgeActive(true);
      const texts: readonly string[] = NUDGE_TEXTS;
      setTooltipText(texts[textIndexRef.current % texts.length]);
      textIndexRef.current++;

      hideTimerRef.current = setTimeout(() => {
        setTooltipText(null);
        setNudgeActive(false);
        // Queue next nudge
        scheduleNudge();
      }, NUDGE_DISPLAY_MS);
    }, NUDGE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    if (isChatOpen || prefersReducedMotion) {
      clearTimers();
      setTooltipText(null);
      setNudgeActive(false);
      return;
    }

    // Start nudge cycle when chat closes (or on mount)
    scheduleNudge();

    return clearTimers;
  }, [isChatOpen, prefersReducedMotion, scheduleNudge, clearTimers]);

  return {
    isAnimating: !isChatOpen && !prefersReducedMotion,
    nudgeActive,
    tooltipText,
    prefersReducedMotion,
  };
}
