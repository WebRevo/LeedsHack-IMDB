"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEMO_SCENARIOS,
  TYPING_SPEED,
  PAUSE_BETWEEN,
  parseUserInput,
  type DemoChip,
  type DemoScenario,
  type ParsedChip,
} from "./constants";

/* ── Chip badge ─────────────────────────────────────────── */

const kindColors: Record<string, string> = {
  type: "bg-imdb-gold/15 text-imdb-gold border-imdb-gold/25",
  country: "bg-blue-500/10 text-blue-600 border-blue-400/20",
  year: "bg-emerald-500/10 text-emerald-600 border-emerald-400/20",
  note: "bg-orange-500/10 text-orange-500 border-orange-400/20",
  count: "bg-purple-500/10 text-purple-600 border-purple-400/20",
};

function InsightChip({ label, kind }: { label: string; kind: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-wider ${kindColors[kind] ?? kindColors.note}`}
    >
      {kind === "note" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )}
      {label}
    </motion.span>
  );
}

/* ── Easter egg ─────────────────────────────────────────── */

function CasualEasterEgg() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-2 flex items-center gap-2 rounded-lg border border-imdb-gold/20 bg-imdb-gold/[0.06] px-3 py-1.5"
    >
      <span className="text-sm">&#127916;</span>
      <span className="text-[11px] text-imdb-black/70">
        Keeping it casual? The wizard keeps it professional for you.
      </span>
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────── */

interface Props {
  onConfidenceChange: (percent: number, label: string) => void;
  onActivate?: () => void;
}

export default function HeroDemoTyper({ onConfidenceChange, onActivate }: Props) {
  const [mode, setMode] = useState<"demo" | "user">("demo");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [visibleChips, setVisibleChips] = useState<DemoChip[]>([]);
  const [paused, setPaused] = useState(false);
  const [userText, setUserText] = useState("");
  const [userChips, setUserChips] = useState<ParsedChip[]>([]);
  const [isCasual, setIsCasual] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scenario: DemoScenario = DEMO_SCENARIOS[scenarioIdx];

  /* ── Demo auto-typing loop ───── */
  useEffect(() => {
    if (mode !== "demo" || paused) return;

    if (charIdx >= scenario.text.length) {
      const timer = setTimeout(() => {
        setCharIdx(0);
        setVisibleChips([]);
        setScenarioIdx((i) => (i + 1) % DEMO_SCENARIOS.length);
        onConfidenceChange(0, "");
      }, PAUSE_BETWEEN);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCharIdx((c) => c + 1);
    }, TYPING_SPEED);

    return () => clearTimeout(timer);
  }, [mode, charIdx, paused, scenario.text.length, scenarioIdx, onConfidenceChange]);

  /* ── Reveal chips & milestones ───── */
  useEffect(() => {
    if (mode !== "demo") return;

    const newChips = scenario.chips.filter((c) => c.atChar <= charIdx);
    if (newChips.length !== visibleChips.length) {
      setVisibleChips(newChips);
    }

    const active = [...scenario.milestones]
      .reverse()
      .find(([at]) => charIdx >= at);
    if (active) {
      onConfidenceChange(active[1], active[2]);
    }
  }, [charIdx, mode, scenario, visibleChips.length, onConfidenceChange]);

  /* ── User input parsing ───── */
  const handleUserInput = useCallback(
    (text: string) => {
      setUserText(text);
      const { chips, casual } = parseUserInput(text);
      setUserChips(chips);
      setIsCasual(casual);
      const pct = Math.min(chips.length * 25, 78);
      const labels = ["", "Type detected", "Getting there", "Almost ready"];
      onConfidenceChange(pct, labels[Math.min(chips.length, 3)]);
    },
    [onConfidenceChange],
  );

  const switchToUser = useCallback(() => {
    if (onActivate) {
      onActivate();
      return;
    }
    setMode("user");
    setUserText("");
    setUserChips([]);
    setIsCasual(false);
    onConfidenceChange(0, "");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onConfidenceChange, onActivate]);

  const switchToDemo = useCallback(() => {
    setMode("demo");
    setCharIdx(0);
    setVisibleChips([]);
    setScenarioIdx(0);
    onConfidenceChange(0, "");
  }, [onConfidenceChange]);

  return (
    <div className="w-full">
      {/* Input area with gradient focus border */}
      <div className="group relative">
        {/* Gradient border overlay — visible on focus-within */}
        <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-[#f9dc74]/0 via-[#f5c518]/0 to-[#ff6800]/0 opacity-0 transition-opacity duration-300 group-focus-within:from-[#f9dc74]/50 group-focus-within:via-[#f5c518]/40 group-focus-within:to-[#ff6800]/30 group-focus-within:opacity-100" />

        <div className="relative rounded-2xl border border-imdb-black/[0.08] bg-white px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all duration-300 group-focus-within:border-transparent group-focus-within:shadow-[0_4px_20px_rgba(245,197,24,0.08)] sm:px-5 sm:py-4">
          {mode === "demo" ? (
            <div
              className="min-h-[24px] cursor-pointer font-body text-sm leading-relaxed text-imdb-black/80"
              onClick={switchToUser}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <span>{scenario.text.slice(0, charIdx)}</span>
              <motion.span
                className="inline-block h-[16px] w-[1.5px] translate-y-[2px] bg-imdb-gold"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {charIdx === 0 && (
                <span className="ml-1 text-imdb-gray/40">
                  Describe your title idea...
                </span>
              )}
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={userText}
              onChange={(e) => handleUserInput(e.target.value)}
              placeholder="Try: A documentary from India released in 2023"
              className="w-full bg-transparent font-body text-sm text-imdb-black/80 outline-none placeholder:text-imdb-gray/40"
            />
          )}
        </div>
      </div>

      {/* Mode toggle + scenario dots */}
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={mode === "demo" ? switchToUser : switchToDemo}
          className="flex items-center gap-1.5 rounded-full border border-imdb-black/[0.06] bg-white px-3 py-1 font-display text-[9px] uppercase tracking-widest text-imdb-gray/50 transition-colors hover:border-imdb-gold/30 hover:text-imdb-gold"
        >
          {mode === "demo" ? (
            <>
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Try your own
            </>
          ) : (
            <>
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch demo
            </>
          )}
        </button>

        {mode === "demo" && (
          <div className="flex gap-1.5">
            {DEMO_SCENARIOS.map((_, i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                animate={{
                  backgroundColor:
                    i === scenarioIdx
                      ? "rgba(245,197,24,1)"
                      : "rgba(150,150,150,0.2)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chips row — fixed height to prevent layout shift */}
      <div className="mt-2.5 flex min-h-[28px] flex-wrap items-start gap-1.5">
        <AnimatePresence mode="popLayout">
          {mode === "demo"
            ? visibleChips.map((c) => (
                <InsightChip key={c.label} label={c.label} kind={c.kind} />
              ))
            : userChips.map((c) => (
                <InsightChip key={c.label} label={c.label} kind={c.kind} />
              ))}
        </AnimatePresence>
      </div>

      {/* Easter egg */}
      <AnimatePresence>
        {mode === "user" && isCasual && <CasualEasterEgg />}
      </AnimatePresence>
    </div>
  );
}
