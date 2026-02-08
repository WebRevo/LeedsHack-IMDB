"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { useShallow } from "zustand/react/shallow";
import {
  evaluateForm,
  selectIntent,
  type AssistantIntent,
} from "@/lib/assistant/intents";
import { pickVariant, fillTemplate } from "@/lib/assistant/variants";
import { selectTone, applyTone, type ToneMode } from "@/lib/assistant/tone";
import { getAutofix, type AutofixAction } from "@/lib/assistant/autofix";
import { useAssistantMemory } from "@/lib/assistant/memory";
import type { WizardFormState } from "@/store/types";

/* =========================================================
   useAssistantGuidance — main hook

   FIX: The original `selectFormState` returned a new object on
   every call. Zustand v5 uses useSyncExternalStore under the hood,
   which calls getSnapshot() during render and compares via Object.is.
   A new object fails that check every time → React retries render →
   gets another new object → infinite loop.

   Solution: useShallow wraps the selector so the returned reference
   is memoized — if shallow-equal to the previous result, the old
   reference is reused. This makes Object.is succeed and stops the loop.
   ========================================================= */

export interface GuidanceMessage {
  text: string;
  intent: AssistantIntent;
  autofix?: AutofixAction;
}

export interface GuidanceResult {
  primary: GuidanceMessage | null;
  secondary: GuidanceMessage[];
  thinking: boolean;
  tone: ToneMode;
}

/**
 * Selects form data from the wizard store.
 * Wrapped with useShallow at the call site so the reference is stable
 * when content hasn't changed (prevents infinite re-render loop).
 */
function selectFormState(s: ReturnType<typeof useWizardStore.getState>): WizardFormState {
  return {
    core: s.core,
    mandatory: s.mandatory,
    identity: s.identity,
    production: s.production,
    credits: s.credits,
    meta: s.meta,
  };
}

export function useAssistantGuidance(): GuidanceResult {
  // useShallow memoizes the selector result via shallow comparison,
  // so formState keeps the same reference when content is unchanged.
  const formState = useWizardStore(useShallow(selectFormState));

  const [primary, setPrimary] = useState<GuidanceMessage | null>(null);
  const [secondary, setSecondary] = useState<GuidanceMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [tone, setTone] = useState<ToneMode>("neutral");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const thinkingRef = useRef<ReturnType<typeof setTimeout>>();

  // Stable callback — reads current state from stores via getState()
  // (not via hook subscriptions) to avoid re-render feedback loops.
  const compute = useCallback(() => {
    const state = selectFormState(useWizardStore.getState());
    const evaluation = evaluateForm(state);

    // Read memory imperatively (no subscription = no re-render trigger).
    // Guard: only call tick() when confidence actually changed.
    const memory = useAssistantMemory.getState();
    if (memory.prevConfidence !== evaluation.confidence) {
      memory.tick(evaluation.confidence);
    }

    const memorySnapshot = {
      recentFixes: memory.recentFixes,
      frustrationScore: memory.frustrationScore,
      idleSince: memory.idleSince,
      isOnCooldown: memory.isOnCooldown,
    };

    const intentResult = selectIntent(evaluation, memorySnapshot);

    const currentTone = selectTone(
      evaluation.confidence,
      memory.prevConfidence,
      memory.frustrationScore,
      evaluation.blockers.length > 0,
      memory.idleSince,
    );
    setTone(currentTone);

    if (!intentResult) {
      setPrimary(null);
      setSecondary([]);
      setThinking(false);
      return;
    }

    setThinking(true);

    const delay = 250 + Math.random() * 150;
    thinkingRef.current = setTimeout(() => {
      const mem = useAssistantMemory.getState();
      const mc = state.credits?.majorCredits;
      const majorCount =
        mc != null && typeof mc === "object"
          ? Object.values(mc).filter((v) => v > 0).length
          : 0;
      const vars: Record<string, string> = {
        confidence: String(evaluation.confidence),
        nextAction: evaluation.nextBestAction,
        fieldName: state.core.title || "untitled",
        missingCount: String(3 - majorCount),
      };

      const primaryVariant = pickVariant(
        intentResult.primary,
        mem.lastMessageId,
      );
      const primaryText = applyTone(
        fillTemplate(primaryVariant.text, vars),
        currentTone,
      );
      const autofix = getAutofix(intentResult.primary) ?? undefined;

      mem.recordIntent(intentResult.primary, primaryVariant.id);
      if (mem.recentFixes.length > 0) {
        mem.clearFixes();
      }

      setPrimary({
        text: primaryText,
        intent: intentResult.primary,
        autofix,
      });

      const secondaryMessages = intentResult.secondary.map((intent) => {
        const variant = pickVariant(intent);
        return {
          text: fillTemplate(variant.text, vars),
          intent,
        };
      });
      setSecondary(secondaryMessages);
      setThinking(false);
    }, delay);
  }, []);

  // Debounced re-evaluation when form data changes.
  // formState is stable via useShallow — same reference when content unchanged.
  // compute is stable via useCallback([]).
  // So this effect only fires on genuine form data changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (thinkingRef.current) clearTimeout(thinkingRef.current);

    debounceRef.current = setTimeout(compute, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (thinkingRef.current) clearTimeout(thinkingRef.current);
    };
  }, [formState, compute]);

  // Idle tracking — reads memory imperatively, no subscription.
  useEffect(() => {
    const interval = setInterval(() => {
      const mem = useAssistantMemory.getState();
      const idleMs = Date.now() - mem.idleSince;
      if (idleMs > 20_000 && !mem.isOnCooldown("IDLE_NUDGE")) {
        compute();
      }
    }, 5_000);

    return () => clearInterval(interval);
  }, [compute]);

  return { primary, secondary, thinking, tone };
}
