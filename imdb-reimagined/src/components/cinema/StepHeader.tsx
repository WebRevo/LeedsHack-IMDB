"use client";

import { motion, AnimatePresence } from "framer-motion";
import HelpPanel from "@/components/wizard/HelpPanel";

interface StepHeaderProps {
  stepLabel: string;
  stepNumber: number;
  totalSteps: number;
  confidence: number;
  completionPercent?: number;
  currentStep?: number;
}

export default function StepHeader({
  stepLabel,
  stepNumber,
  totalSteps,
  confidence,
  completionPercent,
  currentStep,
}: StepHeaderProps) {
  const confidenceColor =
    confidence >= 70
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : confidence >= 40
        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
        : "text-imdb-gray bg-imdb-black/[0.04] border-imdb-black/[0.06]";

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white px-4 py-4 sm:mb-8 sm:px-8 sm:py-6">
      {/* Gold gradient top line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />

      {/* Blurred gold blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-imdb-gold/[0.07] blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Eyebrow */}
          <motion.span
            className="font-display text-[10px] uppercase tracking-[0.3em] text-imdb-gray/70"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            New Title
          </motion.span>

          {/* Step title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={stepLabel}
              className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-imdb-black sm:text-3xl"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25 }}
            >
              {stepLabel}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Signal chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-imdb-gold/20 bg-imdb-gold/[0.07] px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-imdb-gold sm:px-3">
            <span className="flex h-1.5 w-1.5 rounded-full bg-imdb-gold" />
            Step {stepNumber} / {totalSteps}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[10px] uppercase tracking-widest sm:px-3 ${confidenceColor}`}
          >
            {confidence}%
          </span>
          {completionPercent != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-emerald-500 sm:px-3">
              {completionPercent}% Complete
            </span>
          )}
          <HelpPanel currentStep={currentStep ?? 0} />
        </div>
      </div>
    </div>
  );
}
