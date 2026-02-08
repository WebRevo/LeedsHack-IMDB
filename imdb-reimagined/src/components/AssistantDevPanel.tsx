"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { useAssistantMemory } from "@/lib/assistant/memory";
import type { GuidanceResult } from "@/hooks/useAssistantGuidance";

/* =========================================================
   AssistantDevPanel — dev-only scenario simulation

   FIX: Replaced useWizardStore() and useAssistantMemory() full
   subscriptions with targeted selectors for display values and
   getState() for click-handler actions. Full subscriptions caused
   this component to re-render on every store change, amplifying
   the cascading update problem.
   ========================================================= */

interface AssistantDevPanelProps {
  guidance: GuidanceResult;
}

export default function AssistantDevPanel({ guidance }: AssistantDevPanelProps) {
  const [open, setOpen] = useState(false);

  // Targeted selectors — only re-render when these specific values change.
  const frustrationScore = useAssistantMemory((s) => s.frustrationScore);
  const recentFixesCount = useAssistantMemory((s) => s.recentFixes.length);

  if (process.env.NODE_ENV !== "development") return null;

  // Actions read store imperatively at call time — no subscription needed.
  const simulateMissingEvidence = () => {
    useWizardStore.getState().updateMandatory({ miscLinks: [] });
  };

  const simulateInvalidYear = () => {
    useWizardStore.getState().updateCore({ year: null });
  };

  const simulateCreditsIncomplete = () => {
    useWizardStore.getState().updateCredits({
      majorCredits: {
        cast: 0,
        self: 0,
        writers: 0,
        producers: 0,
        composers: 0,
        cinematographers: 0,
        editors: 0,
      },
    });
  };

  const simulateHighFrustration = () => {
    const mem = useAssistantMemory.getState();
    mem.bumpFrustration();
    mem.bumpFrustration();
    mem.bumpFrustration();
  };

  const simulateIdle = () => {
    useAssistantMemory.setState({ idleSince: Date.now() - 25_000 });
  };

  const resetMemory = () => {
    useAssistantMemory.getState().reset();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="rounded-lg border border-purple-500/20 bg-purple-500/[0.07] px-2.5 py-1 font-display text-[10px] uppercase tracking-widest text-purple-500 transition-colors hover:bg-purple-500/15"
      >
        {open ? "Hide" : "Asst"} Dev
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-purple-500/15 bg-white p-3 shadow-lg">
          <div className="space-y-3">
            <span className="font-display text-[9px] uppercase tracking-[0.2em] text-purple-500/70">
              Assistant Dev Panel
            </span>

            {/* Current state */}
            <div className="space-y-1 rounded-lg bg-purple-50/50 p-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-purple-400">Intent:</span>
                <span className="font-mono text-purple-700">
                  {guidance.primary?.intent ?? "none"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Tone:</span>
                <span className="font-mono text-purple-700">{guidance.tone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Thinking:</span>
                <span className="font-mono text-purple-700">
                  {guidance.thinking ? "yes" : "no"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Frustration:</span>
                <span className="font-mono text-purple-700">
                  {frustrationScore}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Fixes:</span>
                <span className="font-mono text-purple-700">
                  {recentFixesCount}
                </span>
              </div>
            </div>

            {/* Message preview */}
            {guidance.primary && (
              <div className="rounded-lg bg-imdb-gold/5 p-2">
                <p className="text-[10px] leading-relaxed text-imdb-gray">
                  {guidance.primary.text}
                </p>
              </div>
            )}

            {/* Simulation buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={simulateMissingEvidence}
                className="rounded border border-purple-500/10 px-1.5 py-1 text-[9px] text-purple-600 hover:bg-purple-50"
              >
                No Evidence
              </button>
              <button
                onClick={simulateInvalidYear}
                className="rounded border border-purple-500/10 px-1.5 py-1 text-[9px] text-purple-600 hover:bg-purple-50"
              >
                No Year
              </button>
              <button
                onClick={simulateCreditsIncomplete}
                className="rounded border border-purple-500/10 px-1.5 py-1 text-[9px] text-purple-600 hover:bg-purple-50"
              >
                No Credits
              </button>
              <button
                onClick={simulateHighFrustration}
                className="rounded border border-purple-500/10 px-1.5 py-1 text-[9px] text-purple-600 hover:bg-purple-50"
              >
                Frustration +3
              </button>
              <button
                onClick={simulateIdle}
                className="rounded border border-purple-500/10 px-1.5 py-1 text-[9px] text-purple-600 hover:bg-purple-50"
              >
                Simulate Idle
              </button>
              <button
                onClick={resetMemory}
                className="rounded border border-purple-500/10 px-1.5 py-1 text-[9px] text-purple-600 hover:bg-purple-50"
              >
                Reset Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
