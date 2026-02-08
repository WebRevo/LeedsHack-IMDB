"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Warning, Assumption } from "@/store/types";

interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface AssistantNote {
  text: string;
  intent: string;
}

interface ConfidenceSidebarProps {
  score: number;
  checklist: ChecklistItem[];
  warnings: Warning[];
  assumptions: Assumption[];
  currentStep: number;
  totalSteps: number;
  assistantNote?: AssistantNote | null;
}

/* ---------- Gauge ring ---------- */

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Arc covers 270 degrees (3/4 circle)
  const arcLength = (270 / 360) * circumference;
  const filled = (score / 100) * arcLength;

  const color =
    score >= 70 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626";
  const glowColor =
    score >= 70
      ? "rgba(22,163,74,0.15)"
      : score >= 40
        ? "rgba(202,138,4,0.15)"
        : "rgba(220,38,38,0.15)";

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow behind gauge */}
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        animate={{ backgroundColor: glowColor }}
        transition={{ duration: 0.8 }}
        style={{ filter: "blur(16px)" }}
      />
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        className="relative"
        style={{ transform: "rotate(135deg)" }}
      >
        {/* Track */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(22,22,22,0.05)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        {/* Fill */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - filled }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      {/* Score number */}
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="font-display text-3xl font-bold"
          style={{ color }}
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
        >
          {score}
        </motion.span>
        <span className="font-display text-[8px] uppercase tracking-[0.25em] text-imdb-gray/60">
          Score
        </span>
      </div>
    </div>
  );
}

/* ---------- Step progress bar ---------- */

function StepProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <motion.div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            initial={false}
            animate={{
              backgroundColor: done
                ? "#f5c518"
                : active
                  ? "rgba(245,197,24,0.4)"
                  : "rgba(22,22,22,0.05)",
            }}
            transition={{ duration: 0.35 }}
          />
        );
      })}
    </div>
  );
}

/* ---------- Signal chip ---------- */

function SignalChip({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "amber" | "blue" | "gray";
}) {
  const colorMap = {
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/15",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/15",
    gray: "bg-imdb-black/[0.04] text-imdb-gray border-imdb-black/[0.06]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest ${colorMap[color]}`}
    >
      {label}
      <span className="font-bold">{count}</span>
    </span>
  );
}

/* ---------- Sidebar assistant note ---------- */

const INTENT_SHORT_LABELS: Record<string, string> = {
  MISSING_EVIDENCE: "Evidence",
  MISSING_RELEASE_DATE: "Release Date",
  CREDITS_REQUIRED: "Credits",
  YEAR_FORMAT: "Year",
  TYPE_SUBTYPE_MISMATCH: "Conflict",
  TITLE_CAPITALIZATION: "Format",
  NEXT_BEST_ACTION: "Next Step",
  ALMOST_READY: "Status",
  IDLE_NUDGE: "Tip",
  SUCCESS_ACK: "Done",
};

function SidebarAssistantNote({ note }: { note: AssistantNote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" as const }}
      className="relative overflow-hidden rounded-2xl border border-imdb-gold/15 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]"
    >
      {/* Gold left accent */}
      <div className="absolute inset-y-0 left-0 w-[3px] bg-imdb-gold" />
      <div className="space-y-1.5 pl-2">
        <span className="font-display text-[9px] uppercase tracking-[0.2em] text-imdb-gold/70">
          {INTENT_SHORT_LABELS[note.intent] ?? "Assistant"}
        </span>
        <p className="text-xs leading-relaxed text-imdb-gray">
          {note.text}
        </p>
      </div>
    </motion.div>
  );
}

/* ---------- Main sidebar ---------- */

export default function ConfidenceSidebar({
  score,
  checklist,
  warnings,
  assumptions,
  currentStep,
  totalSteps,
  assistantNote,
}: ConfidenceSidebarProps) {
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      {/* Assistant note */}
      <AnimatePresence mode="wait">
        {assistantNote && (
          <SidebarAssistantNote key={assistantNote.text.slice(0, 30)} note={assistantNote} />
        )}
      </AnimatePresence>

      {/* Confidence gauge */}
      <div className="relative overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-[10px] uppercase tracking-[0.25em] text-imdb-gray/60">
            IMDb Confidence
          </span>
          <ScoreGauge score={score} />
        </div>
      </div>

      {/* Progress + signal chips */}
      <div className="relative overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[10px] uppercase tracking-[0.25em] text-imdb-gray/60">
              Progress
            </span>
            <span className="font-display text-[10px] uppercase tracking-widest text-imdb-gray/60">
              Step {currentStep + 1}/{totalSteps}
            </span>
          </div>
          <StepProgress current={currentStep} total={totalSteps} />
          <div className="flex flex-wrap gap-1.5">
            <SignalChip
              label="Warnings"
              count={warnings.length}
              color={warnings.length > 0 ? "amber" : "gray"}
            />
            <SignalChip
              label="Assumptions"
              count={assumptions.length}
              color={assumptions.length > 0 ? "blue" : "gray"}
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="relative overflow-hidden rounded-2xl border border-imdb-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-imdb-gradient" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[10px] uppercase tracking-[0.25em] text-imdb-gray/60">
              Required Fields
            </span>
            <span className="font-display text-[10px] tabular-nums tracking-widest text-imdb-gray/60">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <ul className="space-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                <motion.span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    item.done
                      ? "border-imdb-gold bg-imdb-gold text-white"
                      : "border-imdb-black/[0.08]"
                  }`}
                  animate={{ scale: item.done ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {item.done && (
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </motion.span>
                <span
                  className={`text-xs ${item.done ? "text-imdb-black" : "text-imdb-gray/60"}`}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Warnings detail */}
      {warnings.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-amber-50/30 p-5">
          <div className="space-y-2.5">
            <span className="font-display text-[10px] uppercase tracking-[0.25em] text-amber-600/70">
              Warnings
            </span>
            <ul className="space-y-1.5">
              {warnings.map((w) => (
                <li key={w.id} className="text-xs text-amber-700/70">
                  <span className="text-amber-600">&bull;</span> {w.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Assumptions detail */}
      {assumptions.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/10 bg-blue-50/30 p-5">
          <div className="space-y-2.5">
            <span className="font-display text-[10px] uppercase tracking-[0.25em] text-blue-600/70">
              Assumptions
            </span>
            <ul className="space-y-1.5">
              {assumptions.map((a) => (
                <li key={a.id} className="text-xs text-blue-700/70">
                  <span className="text-blue-600">&bull;</span> {a.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
