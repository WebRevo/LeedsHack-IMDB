"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GuidanceMessage } from "@/hooks/useAssistantGuidance";
import { useWizardStore } from "@/store/wizardStore";
import { useAssistantMemory } from "@/lib/assistant/memory";

/* =========================================================
   InlineAssistantHint — renders below the step card

   FIX: Removed useWizardStore() and useAssistantMemory() hook
   subscriptions. These subscribed to the FULL stores, causing
   this component to re-render on every store change (including
   memory.tick() updates from the guidance hook). Since we only
   need store access in the click handler, we read via getState()
   at call time instead — zero subscriptions, zero re-renders
   from store noise.
   ========================================================= */

interface InlineAssistantHintProps {
  primary: GuidanceMessage | null;
  secondary: GuidanceMessage[];
  thinking: boolean;
  onNavigate?: (step: number) => void;
}

/* ---- Shimmer bar for "thinking" state ---- */

function ThinkingShimmer() {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="relative h-3 w-3 shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full bg-imdb-gold/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }}
        />
      </div>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-imdb-black/[0.03]">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,197,24,0.25), transparent)",
          }}
          animate={{ x: ["-100%", "400%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        />
      </div>
    </div>
  );
}

/* ---- Intent label ---- */

const INTENT_LABELS: Record<string, string> = {
  MISSING_EVIDENCE: "Evidence",
  MISSING_RELEASE_DATE: "Release Date",
  CREDITS_REQUIRED: "Credits",
  YEAR_FORMAT: "Year",
  TYPE_SUBTYPE_MISMATCH: "Type Conflict",
  TITLE_CAPITALIZATION: "Formatting",
  NEXT_BEST_ACTION: "Next Step",
  ALMOST_READY: "Status",
  IDLE_NUDGE: "Guidance",
  SUCCESS_ACK: "Updated",
};

function intentColor(intent: string): string {
  switch (intent) {
    case "SUCCESS_ACK":
    case "ALMOST_READY":
      return "text-emerald-600 bg-emerald-500/10 border-emerald-500/15";
    case "IDLE_NUDGE":
    case "NEXT_BEST_ACTION":
      return "text-imdb-gold bg-imdb-gold/10 border-imdb-gold/15";
    case "TITLE_CAPITALIZATION":
      return "text-amber-600 bg-amber-500/10 border-amber-500/15";
    default:
      return "text-red-500 bg-red-500/10 border-red-500/15";
  }
}

export default function InlineAssistantHint({
  primary,
  secondary,
  thinking,
  onNavigate,
}: InlineAssistantHintProps) {
  // Read stores imperatively in click handler — no subscription needed.
  const handleAutofix = useCallback(
    (msg: GuidanceMessage) => {
      if (!msg.autofix) return;
      const store = useWizardStore.getState();
      msg.autofix.action(store);
      useAssistantMemory.getState().recordFix(msg.autofix.fixId);
      if (onNavigate && msg.autofix.targetStep !== undefined) {
        onNavigate(msg.autofix.targetStep);
      }
    },
    [onNavigate],
  );

  if (!primary && !thinking) return null;

  return (
    <div className="mt-3">
      <AnimatePresence mode="wait">
        {thinking ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <ThinkingShimmer />
          </motion.div>
        ) : primary ? (
          <motion.div
            key={`${primary.intent}-${primary.text.slice(0, 20)}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
            className="space-y-1.5"
          >
            {/* Primary message */}
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 font-display text-[9px] uppercase tracking-widest ${intentColor(primary.intent)}`}
              >
                {INTENT_LABELS[primary.intent] ?? primary.intent}
              </span>
              <p className="text-xs leading-relaxed text-imdb-gray">
                {primary.text}
              </p>
            </div>

            {/* Auto-fix CTA */}
            {primary.autofix && (
              <button
                onClick={() => handleAutofix(primary)}
                className="ml-[calc(0.625rem+theme(spacing.2.5))] rounded-lg border border-imdb-gold/25 bg-imdb-gold/[0.06] px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-imdb-gold transition-all hover:bg-imdb-gold/15 hover:border-imdb-gold/40 active:scale-[0.97]"
              >
                {primary.autofix.label}
              </button>
            )}

            {/* Secondary messages (max 2) */}
            {secondary.slice(0, 2).map((msg) => (
              <div
                key={msg.intent}
                className="ml-[calc(0.625rem+theme(spacing.2.5))] flex items-center gap-2"
              >
                <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-imdb-gray/30" />
                <p className="text-[11px] leading-relaxed text-imdb-gray/50">
                  {msg.text}
                </p>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
