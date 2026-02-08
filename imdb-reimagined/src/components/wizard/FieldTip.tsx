"use client";

import { createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFieldGuidance } from "@/hooks/useFieldGuidance";
import type { FieldTipMap, FieldTip } from "@/lib/guidance/fieldRules";

/* =========================================================
   FieldGuidanceProvider — context provider wrapping step
   ========================================================= */

const FieldGuidanceContext = createContext<FieldTipMap>({});

export function FieldGuidanceProvider({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  const { tips } = useFieldGuidance(step);
  return (
    <FieldGuidanceContext.Provider value={tips}>
      {children}
    </FieldGuidanceContext.Provider>
  );
}

/* =========================================================
   useFieldTip — reads a single tip from context
   ========================================================= */

export function useFieldTip(fieldId: string): FieldTip | null {
  const tips = useContext(FieldGuidanceContext);
  return tips[fieldId] ?? null;
}

/* =========================================================
   FieldTipSlot — renders a single tip with animation
   ========================================================= */

export function FieldTipSlot({ fieldId }: { fieldId: string }) {
  const tip = useFieldTip(fieldId);

  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          key={fieldId}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mt-1.5 flex items-start gap-1.5"
        >
          <span
            className={`mt-[5px] flex h-1.5 w-1.5 shrink-0 rounded-full ${
              tip.severity === "warning" ? "bg-amber-500" : "bg-imdb-gold"
            }`}
          />
          <span
            className={`text-xs leading-relaxed ${
              tip.severity === "warning"
                ? "text-amber-600/80"
                : "text-imdb-gold/70"
            }`}
          >
            {tip.primaryTip}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
